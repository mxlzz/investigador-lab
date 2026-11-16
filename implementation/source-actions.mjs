import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {GitHubAPI} from './github-projects.mjs';
import {managedGitHubToken} from './github-credential.mjs';

const hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const check=(v,m)=>{if(!v)throw Error(m)};
const sha=v=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v);
const safeId=v=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
const MAX_ZIP=128*1024*1024;

export function pendingSourceWorkflow(state){
 for(const e of state.events.filter(e=>e.kind==='source_workflow_plan')){
  if(state.events.some(x=>['source_workflow_result','source_workflow_blocked'].includes(x.kind)&&x.data.plan_key===e.key))continue;
  return {key:e.key,phase:state.events.some(x=>x.kind==='source_workflow_dispatch'&&x.data.plan_key===e.key)?'source_workflow_poll':'source_workflow_submit'};
 }
 return null;
}

// Read JSON entries in memory; never extract or execute paths from an artifact.
export function artifactJson(buf){
 check(Buffer.isBuffer(buf)&&buf.length>=22&&buf.length<=MAX_ZIP,'ZIP fuera de límite');
 let end=-1;for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--)if(buf.readUInt32LE(i)===0x06054b50){end=i;break;}
 check(end>=0&&buf.readUInt16LE(end+4)===0&&buf.readUInt16LE(end+6)===0,'ZIP inválido');
 const count=buf.readUInt16LE(end+10),start=buf.readUInt32LE(end+16),size=buf.readUInt32LE(end+12);
 check(count<=2000&&buf.readUInt16LE(end+8)===count&&start+size===end,'Directorio ZIP inválido');
 let at=start,total=0;const out=[],names=new Set();
 for(let n=0;n<count;n++){
  check(at+46<=end&&buf.readUInt32LE(at)===0x02014b50,'Entrada ZIP inválida');
  const flags=buf.readUInt16LE(at+8),method=buf.readUInt16LE(at+10),compressed=buf.readUInt32LE(at+20),length=buf.readUInt32LE(at+24),nameLength=buf.readUInt16LE(at+28),extra=buf.readUInt16LE(at+30),comment=buf.readUInt16LE(at+32),local=buf.readUInt32LE(at+42);
  check(at+46+nameLength+extra+comment<=end,'Entrada ZIP truncada');
  const name=new TextDecoder('utf-8',{fatal:true}).decode(buf.subarray(at+46,at+46+nameLength));
  check(!name.startsWith('/')&&!/[\\\0:]/.test(name)&&name.split('/').every(p=>p!=='.'&&p!=='..')&&!names.has(name),'Ruta ZIP inválida o duplicada');names.add(name);
  if(/(?:^|\/)(?:metrics|seed_aggregate|region_metrics)\.json$/.test(name)){
   check(!(flags&1)&&[0,8].includes(method)&&length<=1000000&&compressed<=2000000,'JSON ZIP fuera de límite');
   check(local+30<=start&&buf.readUInt32LE(local)===0x04034b50,'Cabecera ZIP inválida');
   const localNameLength=buf.readUInt16LE(local+26),offset=local+30+localNameLength+buf.readUInt16LE(local+28);
   check(buf.subarray(local+30,local+30+localNameLength).toString('utf8')===name&&buf.readUInt16LE(local+8)===method&&offset+compressed<=start,'Entrada ZIP inconsistente');
   const bytes=method===0?buf.subarray(offset,offset+compressed):zlib.inflateRawSync(buf.subarray(offset,offset+compressed),{maxOutputLength:1000001});
   total+=bytes.length;check(bytes.length===length&&total<=5000000,'JSON ZIP excesivo');check(zlib.crc32(bytes)===buf.readUInt32LE(at+16),'CRC JSON incorrecto');
   const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
   check(value&&typeof value==='object'&&!Array.isArray(value),'Reporte JSON inválido');
   out.push({path:name,sha256:hash(bytes),value});
  }
  at+=46+nameLength+extra+comment;
 }
 check(at===end,'Directorio ZIP inconsistente');return out;
}

export class SourceActions{
 constructor(engine,{readApi=new GitHubAPI({token:'',credentialProvider:async()=>undefined}),writeApi=new GitHubAPI(),config,fetcher=fetch,credentialProvider=managedGitHubToken}={}){Object.assign(this,{engine,readApi,writeApi,config,fetcher,credentialProvider});}
 settings(project){
  this.engine.state(project);
  const file=path.join(this.engine.root,'source-workflows.json');
  const c=this.config??(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null),p=c?.projects?.[project];
  check(c?.version===1&&p,'No hay workflows fuente autorizados para este proyecto');
  check(/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}$/.test(p.repository)&&typeof p.ref==='string'&&p.ref.length<=200&&Array.isArray(p.workflows),'Configuración de fuente inválida');
  check(this.engine.state(project).events.some(e=>e.kind==='github_source_repository'&&e.data.repository===p.repository&&e.data.private===false),'La fuente pública debe estar registrada en el proyecto');
  return p;
 }
 async publicRepo(p){const r=await this.readApi.request('/repos/'+p.repository);check(r.full_name===p.repository&&r.private===false&&!r.archived&&!r.disabled,'La ejecución solo admite la fuente pública autorizada');return r;}
 async discover(project){
  const p=this.settings(project);await this.publicRepo(p);const base='/repos/'+p.repository;
  const commit=await this.readApi.request(base+'/commits/'+encodeURIComponent(p.ref));check(sha(commit.sha),'Commit fuente inválido');
  const tree=await this.readApi.request(base+'/git/trees/'+commit.commit.tree.sha+'?recursive=1');check(!tree.truncated,'Árbol fuente incompleto');
  const files=(tree.tree||[]).filter(e=>e.type==='blob').map(e=>e.path);
  const result={repository:p.repository,ref:p.ref,source_commit:commit.sha,workflow_files:files.filter(f=>f.startsWith('.github/workflows/')),test_files:files.filter(f=>f.startsWith('tests/')),experiment_documents:files.filter(f=>f.startsWith('docs/experiments/')).slice(-100),approved:p.workflows.map(w=>({workflow:w.file,purpose:w.purpose})),private_project_can_replicate_public_workflow:true,untrusted_source:true};
  const key='source-discovery-'+hash(result).slice(0,40);this.remember(project,key,'source_workflow_discovery',result);return result;
 }
 remember(project,key,kind,data){return this.engine.locked(project,()=>this.engine.append(project,key,kind,data));}
 async locked(project,fn){
  const file=path.join(this.engine.dir(project),'source-actions.lock');let fd;
  try{fd=fs.openSync(file,'wx')}catch(e){if(e.code!=='EEXIST')throw e;const pid=JSON.parse(fs.readFileSync(file,'utf8')).pid;try{process.kill(pid,0);throw Error('Operación Actions ocupada')}catch(x){if(x.code!=='ESRCH')throw x;}fs.renameSync(file,file+'.recovered-'+crypto.randomUUID());fd=fs.openSync(file,'wx');}
  try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));return await fn()}finally{fs.closeSync(fd);fs.unlinkSync(file)}
 }
 async plan(project,key,{workflow,source_commit}={}){
  check(safeId(key),'Clave de plan inválida');const p=this.settings(project),w=p.workflows.find(w=>w.file===workflow);
  check(w&&/^[A-Za-z0-9_-]+\.ya?ml$/.test(w.file)&&sha(w.blob_sha),'Workflow no autorizado');
  check(sha(source_commit),'Primero source_discover: se exige el commit completo observado');
  const base='/repos/'+p.repository;const repo=await this.publicRepo(p);
  const current=await this.readApi.request(base+'/commits/'+encodeURIComponent(p.ref));check(current.sha===source_commit,'La rama cambió: volver a descubrir y revisar el commit');
  const entry=await this.readApi.request(base+'/contents/.github/workflows/'+w.file+'?ref='+source_commit);
  check(entry.sha===w.blob_sha&&entry.type==='file'&&entry.encoding==='base64','El workflow cambió y requiere revisión antes de autorizarlo');
  const body=Buffer.from(entry.content.replace(/\s/g,''),'base64').toString('utf8');
  check(body.includes('workflow_dispatch:')&&!/secrets\.|self-hosted|contents:\s*write/.test(body),'Workflow fuera de la autorización de reproducción pública');
  const data={repository:p.repository,repository_id:repo.id,ref:p.ref,workflow:w.file,workflow_blob_sha:w.blob_sha,source_commit,classification:'public_source_only',inputs:{},purpose:w.purpose,mode:'existing_workflow_replication',private_data_exported:false,monetary_budget:0,quality_improvement_claim:false};
  const prior=this.engine.state(project).events.find(e=>e.kind==='source_workflow_plan'&&e.data.repository===data.repository&&e.data.workflow===workflow&&e.data.source_commit===source_commit);
  if(prior)return {status:'already_planned',plan_key:prior.key,...prior.data};
  this.remember(project,key,'source_workflow_plan',data);return {status:'planned',plan_key:key,...data};
 }
 getPlan(project,key){const p=this.engine.state(project).events.find(e=>e.key===key&&e.kind==='source_workflow_plan');check(p,'Plan fuente inexistente');return p.data;}
 async submit(project,key){return this.locked(project,async()=>{
  const p=this.getPlan(project,key),config=this.settings(project),w=config.workflows.find(w=>w.file===p.workflow);
  check(w?.blob_sha===p.workflow_blob_sha&&config.repository===p.repository&&config.ref===p.ref,'El plan ya no coincide con la autorización local');
  const old=this.engine.state(project).events.find(e=>e.kind==='source_workflow_dispatch'&&e.data.plan_key===key);if(old)return {status:'already_requested',request_id:old.data.request_id};
  const today=new Date().toISOString().slice(0,10);check(this.engine.state(project).events.filter(e=>e.kind==='source_workflow_dispatch'&&e.time.startsWith(today)).length<2,'Límite de dos despachos fuente por día alcanzado');
  const repo=await this.publicRepo(p);check(repo.id===p.repository_id,'El repositorio fuente fue reemplazado');
  const current=await this.readApi.request('/repos/'+p.repository+'/commits/'+encodeURIComponent(p.ref));check(current.sha===p.source_commit,'La rama cambió antes del despacho; no se ejecutó');
  if(this.writeApi.credentialProvider){const token=this.writeApi.token||await this.writeApi.credentialProvider();check(token,'Falta la autorización administrada de GitHub Actions');this.writeApi.token=token;}
  const route='/repos/'+p.repository+'/actions/workflows/'+p.workflow;
  const before=await this.readApi.request(route+'/runs?event=workflow_dispatch&per_page=100&page=1');
  const request_id=crypto.randomUUID(),data={plan_key:key,request_id,requested_at:new Date().toISOString(),previous_run_ids:(before.workflow_runs||[]).map(r=>r.id)};
  // Durable intent before POST: an uncertain response must never trigger a duplicate submission.
  this.remember(project,'source-dispatch-'+request_id,'source_workflow_dispatch',data);
  try{await this.writeApi.request(route+'/dispatches',{method:'POST',body:{ref:p.ref}});return {status:'requested',request_id};}
  catch(e){if([400,401,403,404,422].includes(e.status)){this.remember(project,'source-blocked-'+hash(key).slice(0,40),'source_workflow_blocked',{plan_key:key,reason:'GitHub rechazó el despacho: HTTP '+e.status});return {status:'blocked',request_id,reason:'GitHub rechazó el despacho: HTTP '+e.status};}return {status:'dispatch_uncertain',request_id,error:e.message};}
 });}
 async poll(project,key){return this.locked(project,async()=>{
  const p=this.getPlan(project,key),state=this.engine.state(project),existing=state.events.find(e=>e.kind==='source_workflow_result'&&e.data.plan_key===key);
  if(existing)return {status:'imported',result_key:existing.key,run_id:existing.data.run_id,conclusion:existing.data.conclusion};
  const blocked=state.events.find(e=>e.kind==='source_workflow_blocked'&&e.data.plan_key===key);if(blocked)return {status:'blocked',reason:blocked.data.reason};
  const d=state.events.find(e=>e.kind==='source_workflow_dispatch'&&e.data.plan_key===key);if(!d)return {status:'not_dispatched'};
  const base='/repos/'+p.repository,route=base+'/actions/workflows/'+p.workflow+'/runs';const matches=[];
  const since=Math.floor(Date.parse(d.data.requested_at)/1000)*1000-2000;
  for(let page=1;page<=20;page++){
   const response=await this.readApi.request(route+'?event=workflow_dispatch&per_page=100&page='+page),runs=response.workflow_runs||[];
   matches.push(...runs.filter(r=>!d.data.previous_run_ids.includes(r.id)&&r.head_branch===p.ref&&Date.parse(r.created_at)>=since));
   if(runs.length<100||runs.every(r=>Date.parse(r.created_at)<since))break;
   check(page<20,'Lectura de ejecuciones incompleta: no se importan resultados');
  }
  const fail=reason=>{this.remember(project,'source-blocked-'+hash(key).slice(0,40),'source_workflow_blocked',{plan_key:key,reason});return {status:'blocked',reason};};
  if(matches.length>1)return fail('Más de una ejecución coincide con el despacho; no se atribuye evidencia ambigua');
  if(!matches.length)return Date.now()-Date.parse(d.data.requested_at)>600000?fail('Despacho no confirmado tras diez minutos; no se reenvía automáticamente'):{status:'pending_dispatch'};
  const run=matches[0];
  if(run.head_sha!==p.source_commit||run.repository?.id!==p.repository_id||run.repository?.full_name!==p.repository||run.event!=='workflow_dispatch'||run.path!=='.github/workflows/'+p.workflow)return fail('La ejecución no corresponde al commit/repositorio/workflow fijados');
  if(run.status!=='completed')return {status:'running',run_id:run.id,url:run.html_url};
  const jobs=[];for(let page=1;page<=20;page++){const r=await this.readApi.request(base+'/actions/runs/'+run.id+'/jobs?filter=latest&per_page=100&page='+page);jobs.push(...(r.jobs||[]));if((r.jobs||[]).length<100)break;check(page<20,'Lista de jobs incompleta');}
  check(jobs.length>0&&jobs.every(j=>j.run_id===run.id&&j.head_sha===p.source_commit&&j.run_attempt===(run.run_attempt||1)),'Jobs no corresponden al commit e intento verificados');
  const artifacts=[];for(let page=1;page<=20;page++){const r=await this.readApi.request(base+'/actions/runs/'+run.id+'/artifacts?per_page=100&page='+page);artifacts.push(...(r.artifacts||[]));if((r.artifacts||[]).length<100)break;check(page<20,'Lista de artefactos incompleta');}
  const data={plan_key:key,repository:p.repository,source_commit:p.source_commit,workflow:p.workflow,run_id:run.id,run_attempt:run.run_attempt||1,conclusion:run.conclusion,url:run.html_url,jobs:jobs.map(j=>({id:j.id,name:j.name,conclusion:j.conclusion,steps:(j.steps||[]).map(s=>({name:s.name,conclusion:s.conclusion}))})),artifacts:artifacts.map(a=>({id:a.id,name:a.name,expired:a.expired,size_in_bytes:a.size_in_bytes,digest:a.digest||null})),mode:p.mode,quality_improvement_claim:false,limitations:'Reproducción de un workflow público existente. Success acredita sus comprobaciones, no superioridad del denoiser. Blender 5.3 omite el render; las comparaciones pequeñas no sustituyen validación científica general.',verified_at:new Date().toISOString()};
  const result_key='source-result-'+hash(d.key).slice(0,40);this.remember(project,result_key,'source_workflow_result',data);return {status:'imported',result_key,...data};
 });}
 async metrics(project,key,artifactId){
  const state=this.engine.state(project),result=state.events.find(e=>e.kind==='source_workflow_result'&&e.data.plan_key===key);check(result,'Primero verificar e importar la ejecución con source_workflow_poll');
  const a=result.data.artifacts.find(a=>a.id===artifactId);check(a&&!a.expired&&a.size_in_bytes<=MAX_ZIP,'Artefacto ausente, caducado o demasiado grande');
  const old=state.events.find(e=>e.kind==='source_workflow_metrics'&&e.data.plan_key===key&&e.data.artifact_id===artifactId);if(old)return {status:'imported',...old.data};
  const token=await this.credentialProvider();check(token,'Se requiere Actions Read para descargar el artefacto');
  let response=await this.fetcher(`https://api.github.com/repos/${result.data.repository}/actions/artifacts/${artifactId}/zip`,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},redirect:'manual',signal:AbortSignal.timeout(60000)});
  if([301,302,307].includes(response.status)){const url=new URL(response.headers.get('location'));check(url.protocol==='https:'&&(url.hostname==='objects.githubusercontent.com'||url.hostname.endsWith('.blob.core.windows.net')||url.hostname.endsWith('.actions.githubusercontent.com')),'Destino de artefacto no autorizado');response=await this.fetcher(url.href,{redirect:'error',signal:AbortSignal.timeout(60000)});}
  check(response.ok,'No se pudo descargar el artefacto');const parts=[];let size=0;for await(const chunk of response.body){size+=chunk.length;check(size<=MAX_ZIP,'Artefacto demasiado grande');parts.push(chunk);}
  const zip=Buffer.concat(parts);if(a.digest)check(a.digest==='sha256:'+hash(zip),'Hash del artefacto no coincide');
  const reports=artifactJson(zip);check(reports.length>0,'No hay métricas JSON admitidas en este artefacto');
  const data={plan_key:key,run_id:result.data.run_id,source_commit:result.data.source_commit,artifact_id:artifactId,artifact_sha256:hash(zip),reports,quality_improvement_claim:false};
  this.remember(project,'source-metrics-'+hash(key+':'+artifactId).slice(0,40),'source_workflow_metrics',data);return {status:'imported',...data};
 }
}
