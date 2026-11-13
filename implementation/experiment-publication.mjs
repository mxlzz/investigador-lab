import fs from 'node:fs';
import crypto from 'node:crypto';
import {GitHubAPI,GitHubProjects} from './github-projects.mjs';
const sum=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const check=(v,m)=>{if(!v)throw Error(m)};
const secret=s=>/(?:github_pat_[\w]{15,}|gh[pousr]_[\w]{20,}|AIza[\w-]{30,}|-----BEGIN .*PRIVATE KEY-----)/.test(s);
export const publicationContract={status:'ok or blocked',blockers:['concrete reasons if blocked'],hypothesis_id:'existing hypothesis event key',experiment_id:'new alphanumeric-hyphen ID, max 80',metric:'snake_case metric from design',direction:'minimize or maximize',timeout_seconds:'integer 1..3600',methodology:'public protocol and limits',files:[{name:'benchmark.mjs',content:'self-contained Node 24 code; no dependencies, network, secrets or private data'}],trials:[{id:'baseline',script:'benchmark.mjs',args:['baseline']},{id:'candidate',script:'benchmark.mjs',args:['candidate']}]};

export class ExperimentPublication{
 constructor(engine,{repo=process.env.INVESTIGADOR_GITHUB_REPO||'mxlzz/investigador-lab',api=new GitHubAPI(),runner=fs.readFileSync(new URL('./remote-experiment-runner.mjs',import.meta.url),'utf8')}={}){
  check(/^[\w.-]+\/[\w.-]+$/.test(repo),'Repositorio experimental inválido');Object.assign(this,{engine,repo,api,runner});
 }
 prepare(project,key,p){
  check(p&&p.status==='ok'&&Array.isArray(p.blockers)&&!p.blockers.length,'Propuesta experimental bloqueada o incompleta');
  check(typeof p.methodology==='string'&&p.methodology.trim().length>=20&&p.methodology.length<=12000,'Falta metodología pública');
  check(Array.isArray(p.files)&&p.files.length>=1&&p.files.length<=6,'Se requieren 1 a 6 scripts públicos');
  check(Number.isInteger(p.timeout_seconds)&&p.timeout_seconds>=1&&p.timeout_seconds<=3600,'Timeout experimental inválido');
  const directory='experiments/'+p.experiment_id;
  const files=p.files.map(f=>{check(/^[A-Za-z0-9_-]+\.mjs$/.test(f.name)&&typeof f.content==='string'&&f.content.trim()&&f.content.length<=40000,'Script público inválido');return {path:directory+'/'+f.name,content:f.content};});
  check(new Set(files.map(f=>f.path)).size===files.length,'Scripts duplicados');
  check(Array.isArray(p.trials)&&p.trials.length===2,'Faltan baseline y candidato');
  const trials=p.trials.map((t,i)=>{check(t.id===(i?'candidate':'baseline')&&files.some(f=>f.path===directory+'/'+t.script),'Trial o script inválido');check(Array.isArray(t.args)&&t.args.length<=20&&t.args.every(a=>typeof a==='string'&&a.length<=200),'Argumentos inválidos');return {id:t.id,script:directory+'/'+t.script,args:t.args};});
  const manifest={version:1,project_id:project,experiment_id:p.experiment_id,metric:p.metric,direction:p.direction,timeout_seconds:p.timeout_seconds,trials};
  const plan={project_id:project,experiment_id:p.experiment_id,hypothesis_id:p.hypothesis_id,manifest_path:directory+'/manifest.json',manifest_sha256:sum(manifest),source_commit:'0'.repeat(40),metric:p.metric,direction:p.direction,classification:'public',monetary_budget:0};
  // All scientific/visibility gates run BEFORE any remote write.
  const validated=this.engine.experimentPlanData(project,key,plan);
  const design=this.engine.state(project).events.find(e=>e.key===validated.design_event_key)?.data.output;
  check(design.metrics_and_criteria.some(m=>m.metric_name===p.metric&&m.direction===p.direction),'Métrica diferente del diseño autorizado');
  files.push({path:plan.manifest_path,content:JSON.stringify(manifest,null,2)+'\n'}, {path:directory+'/README.md',content:p.methodology+'\n'}, {path:'implementation/remote-experiment-runner.mjs',content:this.runner});
  check(JSON.stringify(files).length<=150000&&!secret(JSON.stringify(p)),'Contenido excesivo o posible secreto');
  const digest=sum(files);
  return {plan,files,digest,branch:'experiment/'+project+'-'+digest.slice(0,16)};
 }
 async publish(project,key,proposal){return new GitHubProjects(this.engine,{api:this.api}).locked(project,async()=>{
  const old=this.engine.state(project).events.find(e=>e.key===key&&e.kind==='experiment_plan');if(old)return old;
  const intentKey='publication-'+sum(key).slice(0,32);
  const existing=this.engine.state(project).events.find(e=>e.key===intentKey);
  if(existing){check(existing.data.repository===this.repo,'Repositorio de recuperación distinto');proposal=existing.data.proposal;}
  const {plan,files,digest,branch}=this.prepare(project,key,proposal),base='/repos/'+this.repo;
  if(existing)check(existing.data.digest===digest&&existing.data.branch===branch,'La implementación cambió durante una publicación pendiente; requiere revisión antes de crear otra rama');
  const repository=await this.api.request(base);check(repository.full_name===this.repo&&!repository.private&&!repository.archived,'Publicación requiere repositorio público activo');
  if(!existing)this.engine.locked(project,()=>this.engine.append(project,intentKey,'experiment_publication_intent',{repository:this.repo,proposal,digest,branch}));
  let ref=await this.api.request(base+'/git/ref/heads/'+encodeURIComponent(branch),{optional:true});
  if(!ref){
   const parent=await this.api.request(base+'/git/ref/heads/'+encodeURIComponent(repository.default_branch));
   const commit=await this.api.request(base+'/git/commits/'+parent.object.sha);
   const tree=await this.api.request(base+'/git/trees',{method:'POST',body:{base_tree:commit.tree.sha,tree:files.map(f=>({...f,mode:'100644',type:'blob'}))}});
   const created=await this.api.request(base+'/git/commits',{method:'POST',body:{message:'Investigador: public experiment '+project+' '+digest.slice(0,16),tree:tree.sha,parents:[parent.object.sha]}});
   // Never rewrite an existing ref. A lost create acknowledgment is recovered by readback.
   try{ref=await this.api.request(base+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+branch,sha:created.sha}});}catch(error){ref=await this.api.request(base+'/git/ref/heads/'+encodeURIComponent(branch),{optional:true});if(!ref)throw error;}
  }
  const sha=ref.object?.sha;check(/^[0-9a-f]{40}$/.test(sha),'Commit publicado inválido');
  for(const f of files){const remote=await this.api.request(base+'/contents/'+f.path+'?ref='+sha);check(remote.type==='file'&&remote.encoding==='base64'&&Buffer.from(remote.content.replace(/\s/g,''),'base64').toString('utf8')===f.content,'Lectura independiente difiere del código publicado');}
  return this.engine.planExperiment(project,key,{...plan,source_commit:sha});
 });}
}
