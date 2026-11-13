import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {managedGitHubToken} from './github-credential.mjs';

const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const guard=(v,m)=>{if(!v)throw Error(m)};
const repositoryName=v=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}$/.test(v);
const codePath=v=>typeof v==='string'&&v.length>0&&v.length<500&&!/[\\\0?#]/.test(v)&&v.split('/').every(p=>p&&p!=='.'&&p!=='..');
const encoded=v=>v.split('/').map(encodeURIComponent).join('/');
const binding=s=>s.events.find(e=>e.kind==='github_repository')?.data;
const marker=(project,nonce)=>`OpenClaw investigador; project=${project}; binding=${nonce}`;

export class GitHubAPI{
 constructor({token=process.env.INVESTIGADOR_GITHUB_TOKEN,credentialProvider=managedGitHubToken,fetcher=fetch}={}){Object.assign(this,{token,credentialProvider,fetcher});}
 async request(route,{method='GET',body,optional=false}={}){
  guard(route==='/user'||/^\/user\/repos(?:\?|$)/.test(route)||/^\/repos\/[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}(?:\/|\?|$)/.test(route),'Ruta GitHub inválida');
  const token=this.token||await this.credentialProvider();
  guard(method==='GET'||token,'Falta identidad GitHub para crear repositorios o guardar avances');
  const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  if(token)headers.Authorization='Bearer '+token;
  if(body!==undefined)headers['Content-Type']='application/json';
  const r=await this.fetcher('https://api.github.com'+route,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(30000)});
  if(optional&&r.status===404)return null;
  if(!r.ok){
   const permissions=(r.headers?.get('x-accepted-github-permissions')||'').replace(/[^a-z_=;, -]/gi,'').slice(0,180);
   const e=Error('GitHub HTTP '+r.status+' '+method+' '+route.split('?')[0]+(permissions?'; permisos requeridos: '+permissions:''));e.status=r.status;throw e;
  }
  if(r.status===204)return null;
  return r.json();
 }
}

export class GitHubProjects{
 constructor(engine,{owner=process.env.INVESTIGADOR_GITHUB_OWNER||(process.env.INVESTIGADOR_GITHUB_REPO||'mxlzz/investigador-lab').split('/')[0],api=new GitHubAPI()}={}){
  guard(/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(owner),'Propietario GitHub inválido');Object.assign(this,{engine,owner,api});
 }
 async locked(project,fn){
  const file=path.join(this.engine.dir(project),'github.lock');let fd;
  try{fd=fs.openSync(file,'wx')}catch(e){
   if(e.code!=='EEXIST')throw e;
   let owner;try{owner=JSON.parse(fs.readFileSync(file,'utf8'))}catch{throw Error('Operación GitHub ocupada; revisar bloqueo')}
   try{process.kill(owner.pid,0);throw Error('Operación GitHub ocupada')}catch(x){if(x.code!=='ESRCH')throw x;}
   fs.renameSync(file,file+'.recovered-'+crypto.randomUUID());fd=fs.openSync(file,'wx');
  }
  try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));return await fn()}finally{fs.closeSync(fd);fs.unlinkSync(file)}
 }
 remember(project,key,kind,data){return this.engine.locked(project,()=>this.engine.append(project,key,kind,data));}
 async repositories({page=1,query=''}={}){
  guard(Number.isInteger(page)&&page>=1&&page<=20&&typeof query==='string'&&query.length<=200,'Paginación o consulta inválida');
  const account=await this.api.request('/user');guard(account.login?.toLowerCase()===this.owner.toLowerCase(),'La identidad GitHub no corresponde al propietario configurado');
  const repos=await this.api.request('/user/repos?type=owner&sort=updated&per_page=100&page='+page);
  guard(Array.isArray(repos),'Respuesta de repositorios inválida');
  const results=repos.filter(r=>r.owner?.login?.toLowerCase()===this.owner.toLowerCase()&&r.full_name.toLowerCase().includes(query.toLowerCase())).map(r=>({repository:r.full_name,private:r.private,description:r.description,url:r.html_url}));
  return {owner:this.owner,page,repositories:results,next_page:repos.length===100&&page<20?page+1:null,truncated:repos.length===100&&page===20};
 }
 verifyRepository(repo,expected,visibility){
  guard(repo?.full_name?.toLowerCase()===expected.toLowerCase()&&Number.isSafeInteger(repo.id),'Identidad de repositorio inesperada');
  guard(!repo.archived&&!repo.disabled,'Repositorio archivado o deshabilitado');
  guard(visibility==='public'||repo.private===true,'No se pueden publicar datos de un proyecto privado en un repositorio público');
 }
 async ensure(project,{repository}={}){return this.locked(project,()=>this.ensureUnlocked(project,{repository}));}
 async ensureUnlocked(project,{repository}={}){
  let state=this.engine.state(project),bound=binding(state);
  if(bound){guard(!repository||repository.toLowerCase()===bound.repository.toLowerCase(),'El proyecto ya está vinculado a otro repositorio');return {status:'ready',...bound};}
  let intent=state.events.findLast(e=>e.kind==='github_repository_request')?.data;
  // An explicit existing-repo choice may replace an unbound failed creation.
  if(intent&&repository&&repository.toLowerCase()!==intent.repository.toLowerCase())intent=null;
  if(!intent){
   const auto=!repository;
   const slug=project.toLowerCase().slice(0,52)+'-'+hash(project).slice(0,8);
   repository=repository||this.owner+'/investigacion-'+slug;
   guard(repositoryName(repository)&&repository.split('/')[0].toLowerCase()===this.owner.toLowerCase(),'El repositorio de resultados debe pertenecer al propietario configurado');
   guard(repository.toLowerCase()!==(process.env.INVESTIGADOR_GITHUB_REPO||'mxlzz/investigador-lab').toLowerCase(),'El repositorio del agente no puede usarse como repositorio de resultados');
   intent={repository,auto,private:state.created.visibility!=='public',binding_id:crypto.randomUUID(),branch:'investigador-'+slug};
   this.remember(project,'github-repository-request-'+crypto.randomUUID(),'github_repository_request',intent);
  }
  let remote=await this.api.request('/repos/'+intent.repository,{optional:true});
  if(intent.auto){
   if(remote)guard(remote.description===marker(project,intent.binding_id),'Nombre de repositorio ocupado; no se adoptará un repositorio ajeno');
   else{
    const account=await this.api.request('/user');
    guard(account.login?.toLowerCase()===this.owner.toLowerCase(),'La identidad GitHub no corresponde al propietario configurado');
    // Intent is durable before POST. A lost response is recovered by GET + marker.
    remote=await this.api.request('/user/repos',{method:'POST',body:{name:intent.repository.split('/')[1],description:marker(project,intent.binding_id),private:intent.private,auto_init:true,has_issues:true,has_wiki:false}});
   }
  }else guard(remote,'Repositorio inexistente o sin acceso; no se creará otro con ese nombre');
  this.verifyRepository(remote,intent.repository,state.created.visibility);
  guard(typeof remote.default_branch==='string'&&remote.default_branch.length>0,'Repositorio sin rama inicial; agregá un README antes de vincularlo');
  const data={repository:remote.full_name,repository_id:remote.id,private:remote.private,default_branch:remote.default_branch,branch:intent.branch,managed:intent.auto,binding_id:intent.binding_id,url:remote.html_url};
  this.remember(project,'github-repository','github_repository',data);
  return {status:'ready',...data};
 }
 snapshot(project){
  const s=this.engine.state(project),events=s.events.filter(e=>e.kind!=='github_sync');
  const sources=events.filter(e=>e.kind==='source').map(e=>({id:e.key,url:e.data.url,title:e.data.title||null,access_level:e.data.access_level,retrieved_at:e.data.retrieved_at,github:e.data.github||null}));
  const phases=events.filter(e=>e.kind==='phase').map(e=>({id:e.key,time:e.time,output:e.data.output}));
  const value={schema_version:1,project,request:s.created.request,visibility:s.created.visibility,local_digest:events.at(-1).digest,completed:s.completed,source_repositories:events.filter(e=>e.kind==='github_source_repository').map(e=>e.data),sources,hypotheses:events.filter(e=>e.kind==='hypothesis').map(e=>({id:e.key,...e.data})),phases,experiments:events.filter(e=>e.kind==='experiment_result').map(e=>({id:e.key,...e.data}))};
  const content=JSON.stringify(value,null,2)+'\n';
  guard(Buffer.byteLength(content)<1500000,'El avance supera el límite de sincronización');
  guard(!/(?:github_pat_[A-Za-z0-9_]{15,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{24,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(content),'Sincronización bloqueada: posible secreto en el expediente');
  const summary=phases.findLast(e=>e.output.phase==='report')?.output.summary||'Investigación en curso; no se afirma un resultado todavía.';
  const readme=`# Investigación: ${project}\n\n${s.created.request}\n\n## Avance confirmado\n\n${summary}\n\nFases confirmadas: ${s.completed.join(', ')||'ninguna todavía'}.\n\nEl archivo progress.json contiene resultados y referencias. Los textos completos de las fuentes y las credenciales no se exportan.\n`;
  return {hash:hash(content),files:[{path:`.investigador/projects/${project}/README.md`,content:readme},{path:`.investigador/projects/${project}/progress.json`,content}]};
 }
 async sync(project){return this.locked(project,async()=>{
  const bound=await this.ensureUnlocked(project);
  const current=await this.api.request('/repos/'+bound.repository);
  this.verifyRepository(current,bound.repository,this.engine.state(project).created.visibility);
  guard(current.id===bound.repository_id,'El repositorio vinculado fue reemplazado');
  const snapshot=this.snapshot(project),last=this.engine.state(project).events.findLast(e=>e.kind==='github_sync')?.data;
  const url=`https://github.com/${bound.repository}/tree/${bound.branch}/.investigador/projects/${project}`;
  if(last?.snapshot_hash===snapshot.hash)return {status:'unchanged',repository:bound.repository,commit:last.commit,url};
  const base='/repos/'+bound.repository;
  const branch=await this.api.request(base+'/git/ref/heads/'+encodeURIComponent(bound.branch),{optional:true});
  const parent=branch||await this.api.request(base+'/git/ref/heads/'+encodeURIComponent(bound.default_branch));
  const parentSha=parent.object.sha;
  // Recover an accepted commit/ref update whose HTTP reply was lost.
  if(branch){
   const remote=await this.api.request(base+'/contents/'+snapshot.files[1].path+'?ref='+encodeURIComponent(bound.branch),{optional:true});
   if(remote?.encoding==='base64'&&hash(Buffer.from(remote.content.replace(/\s/g,''),'base64').toString('utf8'))===snapshot.hash){
    this.remember(project,'github-sync-'+crypto.randomUUID(),'github_sync',{snapshot_hash:snapshot.hash,commit:parentSha,repository:bound.repository});
    return {status:'recovered',repository:bound.repository,commit:parentSha,url};
   }
  }
  const parentCommit=await this.api.request(base+'/git/commits/'+parentSha);
  const tree=await this.api.request(base+'/git/trees',{method:'POST',body:{base_tree:parentCommit.tree.sha,tree:snapshot.files.map(f=>({...f,mode:'100644',type:'blob'}))}});
  const commit=await this.api.request(base+'/git/commits',{method:'POST',body:{message:`Investigador: avance confirmado de ${project}`,tree:tree.sha,parents:[parentSha]}});
  if(branch)await this.api.request(base+'/git/refs/heads/'+encodeURIComponent(bound.branch),{method:'PATCH',body:{sha:commit.sha,force:false}});
  else await this.api.request(base+'/git/refs',{method:'POST',body:{ref:'refs/heads/'+bound.branch,sha:commit.sha}});
  this.remember(project,'github-sync-'+crypto.randomUUID(),'github_sync',{snapshot_hash:snapshot.hash,commit:commit.sha,repository:bound.repository});
  return {status:'synced',repository:bound.repository,commit:commit.sha,url};
 });}
 async status(project){
  const state=this.engine.state(project),bound=binding(state),intent=state.events.findLast(e=>e.kind==='github_repository_request')?.data;
  if(!bound)return {status:intent?'pending':'not_configured',repository:intent?.repository||null};
  const remote=await this.api.request('/repos/'+bound.repository);this.verifyRepository(remote,bound.repository,state.created.visibility);guard(remote.id===bound.repository_id,'El repositorio vinculado fue reemplazado');
  return {status:'ready',...bound,last_sync:state.events.findLast(e=>e.kind==='github_sync')?.data||null};
 }
 async addSource(project,repository){
  const state=this.engine.state(project);guard(repositoryName(repository),'Repositorio fuente inválido');
  const remote=await this.api.request('/repos/'+repository);
  guard(remote.full_name?.toLowerCase()===repository.toLowerCase(),'Repositorio fuente distinto');
  guard(state.created.visibility!=='public'||!remote.private,'No incorporar fuentes privadas a una investigación pública');
  const key='github-source-repo-'+hash(repository.toLowerCase()).slice(0,32);
  if(!state.events.some(e=>e.key===key))this.remember(project,key,'github_source_repository',{repository:remote.full_name,private:remote.private});
  return remote;
 }
 async read(project,{repository,file,ref}={}){
  const remote=await this.addSource(project,repository),base='/repos/'+repository;
  const reference=ref||remote.default_branch;guard(typeof reference==='string'&&reference.length>0&&reference.length<=200,'Referencia inválida');
  const commit=await this.api.request(base+'/commits/'+encodeURIComponent(reference));
  guard(/^[0-9a-f]{40}$/.test(commit.sha),'No se pudo fijar el commit fuente');
  if(!file){
   const tree=await this.api.request(base+'/git/trees/'+commit.commit.tree.sha+'?recursive=1');
   const entries=(tree.tree||[]).slice(0,5000).map(e=>({path:e.path,type:e.type,size:e.size}));
   return {repository:remote.full_name,commit:commit.sha,entries,truncated:Boolean(tree.truncated||(tree.tree||[]).length>5000)};
  }
  guard(codePath(file),'Ruta de fuente inválida');
  const entry=await this.api.request(base+'/contents/'+encoded(file)+'?ref='+commit.sha);
  guard(entry.type==='file'&&entry.encoding==='base64'&&entry.size<=300000,'Solo archivos de texto de hasta 300 KB');
  const bytes=Buffer.from(entry.content.replace(/\s/g,''),'base64');guard(bytes.length<=300000,'Fuente demasiado grande');
  const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);guard(!content.includes('\0'),'Fuente binaria');
  const url=`https://github.com/${remote.full_name}/blob/${commit.sha}/${encoded(file)}`;
  const key='github-source-'+hash(repository+'\0'+commit.sha+'\0'+file).slice(0,40);
  const old=this.engine.state(project).events.find(e=>e.key===key);
  if(!old)this.engine.record(project,key,'source',{url,title:remote.full_name+': '+file,access_level:'full_text',content,retrieved_at:new Date().toISOString(),github:{repository:remote.full_name,commit:commit.sha,path:file,private:remote.private}});
  return {repository:remote.full_name,commit:commit.sha,path:file,source_id:key,access_level:'full_text',content,untrusted_source:true};
 }
}

export async function syncIfConfigured(engine,project){
 if(!engine.state(project).events.some(e=>e.kind==='github_repository_request'))return {status:'not_configured'};
 try{return await new GitHubProjects(engine).sync(project)}catch(e){return {status:'blocked',error:e.message}}
}

export async function startResearch(engine,{project,request,repository,sources=[],visibility='private',workflow='research'}={}, {manager=new GitHubProjects(engine)}={}){
 guard(['documentary','research'].includes(workflow),'Flujo inválido');
 guard(Array.isArray(sources)&&sources.length<=20&&sources.every(repositoryName),'Lista de repositorios fuente inválida');
 if(fs.existsSync(path.join(engine.dir(project),'events.jsonl'))){const old=engine.state(project);guard(old.created.request===request&&old.created.visibility===visibility,'Ya existe otro encargo con ese identificador');}
 else engine.init(project,request,{visibility});
 const sourceResults=[];
 for(const source of sources){try{await manager.addSource(project,source);sourceResults.push({repository:source,status:'ready'})}catch(e){sourceResults.push({repository:source,status:'blocked',error:e.message})}}
 let github;try{await manager.ensure(project,{repository});github=await manager.sync(project)}catch(e){github={status:'blocked',error:e.message}}
 const {Scheduler}=await import('./scheduler.mjs');
 const scheduler=new Scheduler(engine).control(project,true,'Encargo de investigación recibido; avances locales persistentes y sincronización GitHub por proyecto',{workflow});
 return {project,local_status:'ready',github,sources:sourceResults,scheduler};
}
