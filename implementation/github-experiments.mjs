import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {managedGitHubToken} from './github-credential.mjs';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const guard=(v,m)=>{if(!v)throw Error(m)};
const W='investigador-experiment.yml';
const validPath=p=>typeof p==='string'&&/^experiments\/[a-zA-Z0-9_-]+\/manifest\.json$/.test(p);
export function unzipReceipt(buf,name){
 guard(Buffer.isBuffer(buf)&&buf.length<3000000,'Archivo ZIP demasiado grande');
 let at=-1;for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--){if(buf.readUInt32LE(i)===0x06054b50){at=i;break}}
 guard(at>=0&&buf.readUInt16LE(at+10)===1,'ZIP debe tener una entrada');
 const start=buf.readUInt32LE(at+16),size=buf.readUInt32LE(at+12);
 guard(start+size<=at&&buf.readUInt32LE(start)===0x02014b50,'Directorio ZIP inválido');
 const len=buf.readUInt16LE(start+28),extra=buf.readUInt16LE(start+30),comment=buf.readUInt16LE(start+32),local=buf.readUInt32LE(start+42);
 const fname=buf.subarray(start+46,start+46+len).toString('utf8'),compressed=buf.readUInt32LE(start+20),uncompressed=buf.readUInt32LE(start+24);
 guard(fname===name&&/^[a-zA-Z0-9_-]+\.json$/.test(name)&&[0,8].includes(buf.readUInt16LE(start+10))&&compressed<=1e6&&uncompressed<=1e6&&start+46+len+extra+comment<=at,'Archivo inesperado');
 guard(local+30<start&&buf.readUInt32LE(local)===0x04034b50,'Encabezado ZIP inválido');
 const data=local+30+buf.readUInt16LE(local+26)+buf.readUInt16LE(local+28);
 guard(data+compressed<=start,'Datos ZIP truncados');
 const raw=buf.readUInt16LE(start+10)===0?buf.subarray(data,data+compressed):zlib.inflateRawSync(buf.subarray(data,data+compressed),{maxOutputLength:1000001});
 guard(raw.length===uncompressed,'Longitud ZIP incorrecta');
 return JSON.parse(raw.toString('utf8'));
}
export class GitHubExperiments{
 constructor(engine,{repo=process.env.INVESTIGADOR_GITHUB_REPO||'mxlzz/investigador-lab',token=process.env.INVESTIGADOR_GITHUB_TOKEN,credentialProvider=managedGitHubToken,fetcher=fetch,api='https://api.github.com'}={}){
  guard(/^[\w.-]+\/[\w.-]+$/.test(repo),'Repositorio inválido');
  Object.assign(this,{engine,repo,token,credentialProvider,fetcher,api});
 }
 async get(route,{method='GET',body,binary=false}={}){
  guard(route==='/repos/'+this.repo||route.startsWith('/repos/'+this.repo+'/'),'Ruta GitHub fuera de repositorio');
  const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const token=this.token||await this.credentialProvider();
  if(token)guard(this.api==='https://api.github.com','La identidad GitHub solo puede enviarse a api.github.com');
  if(token)headers.Authorization='Bearer '+token;
  if(body!==undefined)headers['Content-Type']='application/json';
  const r=await this.fetcher(this.api+route,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(30000)});
  if([301,302,307].includes(r.status)&&binary){
   const url=new URL(r.headers.get('location')||'');
   guard(url.protocol==='https:'&&(url.hostname==='objects.githubusercontent.com'||url.hostname.endsWith('.blob.core.windows.net')||url.hostname.endsWith('.actions.githubusercontent.com')),'Redirección de artefacto no confiable');
   const d=await this.fetcher(url.href,{redirect:'error',signal:AbortSignal.timeout(30000)});
   guard(d.ok,'No se pudo recuperar artefacto');
   const out=Buffer.from(await d.arrayBuffer());guard(out.length<3000000,'Artefacto demasiado grande');return out;
  }
  guard(r.ok,'GitHub HTTP '+r.status+' '+method+' '+route.split('?')[0]);
  if(r.status===204)return null;
  if(binary){const b=Buffer.from(await r.arrayBuffer());guard(b.length<3000000,'Artefacto demasiado grande');return b}
  return r.json();
 }
 async status(){
  const authenticated=Boolean(this.token||await this.credentialProvider());
  const repository=await this.get('/repos/'+this.repo);
  const workflows=await this.get('/repos/'+this.repo+'/actions/workflows');
  const workflow=(workflows.workflows||[]).find(w=>w.path==='.github/workflows/'+W);
  return {repository:repository.full_name,authenticated,workflow:workflow?.state||'missing',dispatch_permission:'not_checked'};
 }
 async manifest(plan){
  guard(validPath(plan.manifest_path)&&/^[0-9a-f]{40}$/.test(plan.source_commit),'Referencia de código inválida');
  const repo=await this.get('/repos/'+this.repo);
  guard(repo.full_name===this.repo&&!repo.private,'Solo repo público permitido');
  const entry=await this.get('/repos/'+this.repo+'/contents/'+plan.manifest_path+'?ref='+plan.source_commit);
  guard(entry.type==='file'&&entry.encoding==='base64','Manifiesto remoto no disponible');
  const bytes=Buffer.from(entry.content.replace(/\s/g,''),'base64');
  guard(bytes.length<50000,'Manifiesto excesivo');
  const value=JSON.parse(bytes.toString('utf8'));
  guard(hash(JSON.stringify(value))===plan.manifest_sha256,'Hash manifiesto remoto incorrecto');
  guard(value.project_id===plan.project_id&&value.experiment_id===plan.experiment_id,'Manifiesto de otro proyecto');
  guard(value.version===1&&value.trials?.length===2,'Manifiesto inválido');
  return {defaultBranch:repo.default_branch,value};
 }
 async submit(project,planKey){
  guard(this.token||await this.credentialProvider(),'Falta autorización GitHub Actions del equipo');
  const state=this.engine.state(project),plan=state.events.find(e=>e.key===planKey&&e.kind==='experiment_plan')?.data;
  guard(plan,'Plan inexistente');
  const existing=state.events.find(e=>e.kind==='experiment_dispatch'&&e.data.plan_key===planKey);
  if(existing)return {status:'already_requested',request_id:existing.data.request_id};
  const {defaultBranch}=await this.manifest(plan);
  const requestId=crypto.randomUUID();
  this.engine.experimentDispatch(project,'dispatch-'+requestId,{plan_key:planKey,request_id:requestId,repository:this.repo,workflow:W});
  try{
   await this.get('/repos/'+this.repo+'/actions/workflows/'+W+'/dispatches',{method:'POST',body:{ref:defaultBranch,inputs:{
    request_id:requestId,source_commit:plan.source_commit,manifest_path:plan.manifest_path,manifest_sha256:plan.manifest_sha256
   }}});
   return {status:'requested',request_id:requestId};
  }catch(e){return {status:'dispatch_uncertain',request_id:requestId,error:e.message}}
 }
 async poll(project,planKey){
  const state=this.engine.state(project),plan=state.events.find(e=>e.key===planKey&&e.kind==='experiment_plan')?.data;
  guard(plan,'Plan inexistente');
  const previous=state.events.find(e=>e.kind==='experiment_result'&&e.data.plan_key===planKey);
  if(previous)return {status:'imported',result_key:previous.key,run_id:previous.data.github.run_id};
  const dispatch=state.events.find(e=>e.kind==='experiment_dispatch'&&e.data.plan_key===planKey);
  if(!dispatch)return {status:'not_dispatched'};
  const rid=dispatch.data.request_id;
  const all=await this.get('/repos/'+this.repo+'/actions/workflows/'+W+'/runs?event=workflow_dispatch&per_page=100');
  const match=(all.workflow_runs||[]).filter(run=>run.display_title==='Investigador experiment '+rid);
  guard(match.length<=1,'Ejecución duplicada para request_id');
  if(!match.length)return {status:'pending_dispatch',request_id:rid};
  const run=match[0];
  guard(run.repository?.full_name===this.repo&&run.event==='workflow_dispatch'&&
   (run.path===W||run.path?.endsWith('/'+W)),'Ejecución GitHub no corresponde al workflow permitido');
  if(run.status!=='completed')return {status:'running',run_id:run.id};
  if(run.conclusion!=='success')return {status:'failed',run_id:run.id,conclusion:run.conclusion};
  const art=await this.get('/repos/'+this.repo+'/actions/runs/'+run.id+'/artifacts?per_page=100');
  const found=(art.artifacts||[]).filter(a=>a.name==='investigador-'+rid&&!a.expired&&a.workflow_run?.id===run.id);
  guard(found.length===1,'Falta artefacto único de ejecución');
  const artifact=found[0];
  const zip=await this.get('/repos/'+this.repo+'/actions/artifacts/'+artifact.id+'/zip',{binary:true});
  if(artifact.digest)guard(artifact.digest==='sha256:'+hash(zip),'Digest ZIP no coincide');
  const receipt=unzipReceipt(zip,plan.experiment_id+'.json');
  guard(receipt.schema_version===1&&receipt.project_id===project&&receipt.experiment_id===plan.experiment_id,'Recibo de otro experimento');
  guard(receipt.source_commit===plan.source_commit&&receipt.manifest_sha256===plan.manifest_sha256,'Recibo con fuente distinta');
  guard(receipt.request_id===rid&&String(receipt.github_run_id)===String(run.id)&&receipt.github_repository===this.repo,'Identidad de ejecución distinta');
  guard(receipt.metric===plan.metric&&receipt.direction===plan.direction,'Métrica distinta de la aprobada');
  guard(receipt.results?.length===2&&receipt.results[0].id==='baseline'&&receipt.results[1].id==='candidate','Resultados incompletos');
  guard([receipt.baseline,receipt.candidate,receipt.improvement].every(Number.isFinite),'Métricas inválidas');
  const delta=receipt.direction==='minimize'?receipt.baseline-receipt.candidate:receipt.candidate-receipt.baseline;
  guard(Math.abs(receipt.improvement-delta)<1e-8*Math.max(1,Math.abs(delta)),'Cálculo de mejora contradictorio');
  const imported=this.engine.importVerifiedExperiment(project,'experiment-result-'+hash(rid).slice(0,24),{
   plan_key:planKey,dispatch_key:dispatch.key,receipt,
   github:{repository:this.repo,workflow:W,run_id:run.id,run_attempt:run.run_attempt||1,conclusion:run.conclusion,artifact_id:artifact.id,artifact_digest:artifact.digest||'sha256:'+hash(zip),html_url:run.html_url},
   verified_at:new Date().toISOString()
  });
  return {status:'imported',result_key:imported.key,run_id:run.id,baseline:receipt.baseline,candidate:receipt.candidate,improvement:receipt.improvement};
 }
}
