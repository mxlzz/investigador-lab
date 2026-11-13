import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Engine} from '../implementation/engine.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
import {GitHubAPI,GitHubProjects,startResearch} from '../implementation/github-projects.mjs';
const sha='a'.repeat(40);
function setup(t,{visibility='private'}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-project-github-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const engine=new Engine(root);engine.init('topic','Investigar el tema solicitado',{visibility});
 const calls=[],repos=new Map(),refs=new Map(),commits=new Map([[sha,{tree:{sha:'base-tree'}}]]),trees=new Map();let seq=0;
 const api={calls,repos,refs,failCreate:false,lostCreate:false,lostRef:false,async request(route,options={}){
  calls.push({route,...options});const {method='GET',body,optional=false}=options;
  if(route==='/user')return {login:'alice'};
  if(route==='/user/repos'){
   if(this.failCreate)throw Error('GitHub HTTP 403; permisos requeridos: repository_creation=write');
   const r={id:++seq,full_name:'alice/'+body.name,description:body.description,private:body.private,default_branch:'main',html_url:'https://github.com/alice/'+body.name};repos.set(r.full_name,r);
   if(this.lostCreate){this.lostCreate=false;throw Error('Respuesta perdida después de crear')};return r;
  }
  const match=route.match(/^\/repos\/([^/]+\/[^/]+)(.*)$/);if(!match)throw Error('Ruta inesperada '+route);
  const [,repo,tail]=match;
  if(!tail)return repos.get(repo)||null;
  if(tail.startsWith('/git/ref/heads/')){const name=decodeURIComponent(tail.slice('/git/ref/heads/'.length));return name==='main'?{object:{sha}}:refs.has(repo+'/'+name)?{object:{sha:refs.get(repo+'/'+name)}}:null;}
  if(tail.startsWith('/git/commits/')&&method==='GET')return commits.get(tail.slice('/git/commits/'.length));
  if(tail==='/git/trees'&&method==='POST'){const id='tree-'+(++seq);trees.set(id,body);return {sha:id};}
  if(tail==='/git/commits'&&method==='POST'){const id=(++seq).toString(16).padStart(40,'0');commits.set(id,{tree:{sha:body.tree},body});return {sha:id};}
  if(tail==='/git/refs'||tail.startsWith('/git/refs/heads/')){const name=body.ref?body.ref.slice('refs/heads/'.length):decodeURIComponent(tail.slice('/git/refs/heads/'.length));refs.set(repo+'/'+name,body.sha);if(this.lostRef){this.lostRef=false;throw Error('Respuesta perdida después de guardar ref')};return {};}
  if(tail.startsWith('/contents/')){const branch=new URLSearchParams(tail.split('?')[1]).get('ref'),commit=commits.get(refs.get(repo+'/'+branch)),tree=trees.get(commit?.tree.sha);const item=tree?.tree.find(e=>'/contents/'+e.path===tail.split('?')[0]);return item?{encoding:'base64',content:Buffer.from(item.content).toString('base64')}:null;}
  if(optional)return null;throw Error('Ruta inesperada '+tail);
 }};
 const manager=new GitHubProjects(engine,{owner:'alice',api});return {root,engine,api,manager};
}

test('automatic repositories are private, durable, isolated by project and not duplicated',async t=>{
 const {engine,manager,api}=setup(t);const a=await manager.ensure('topic'),b=await manager.ensure('topic');
 assert.equal(a.repository,b.repository);assert.equal(a.private,true);assert.equal(api.calls.filter(x=>x.route==='/user/repos').length,1);
 engine.init('other','Otro encargo');assert.notEqual((await manager.ensure('other')).repository,a.repository);
 assert.equal(engine.state('topic').events.filter(e=>e.kind==='github_repository').length,1);
});

test('lost creation response is recovered with marker and without another POST',async t=>{
 const {manager,api}=setup(t);api.lostCreate=true;await assert.rejects(manager.ensure('topic'),/perdida/);
 const r=await manager.ensure('topic');assert.equal(r.status,'ready');assert.equal(api.calls.filter(x=>x.route==='/user/repos').length,1);
});

test('an unrelated name collision is never adopted or overwritten',async t=>{
 const {engine,manager,api}=setup(t);api.failCreate=true;await assert.rejects(manager.ensure('topic'),/403/);
 const intent=engine.state('topic').events.find(e=>e.kind==='github_repository_request').data;
 api.repos.set(intent.repository,{full_name:intent.repository,description:'unrelated',id:4,private:true,default_branch:'main'});
 await assert.rejects(manager.ensure('topic'),/ocupado/);assert.equal(engine.state('topic').events.some(e=>e.kind==='github_repository'),false);
});

test('manual existing repo can replace a blocked auto request; no creation or visibility change',async t=>{
 const {manager,api}=setup(t);api.failCreate=true;await assert.rejects(manager.ensure('topic'),/403/);
 api.repos.set('alice/existing',{full_name:'alice/existing',id:77,private:true,default_branch:'main'});
 const r=await manager.ensure('topic',{repository:'alice/existing'});assert.equal(r.managed,false);assert.equal(r.repository,'alice/existing');
 await assert.rejects(manager.ensure('topic',{repository:'alice/another'}),/otro repositorio/);
 assert.equal(api.calls.filter(x=>x.method==='PATCH').length,0);
});

test('private research cannot bind a public destination',async t=>{
 const {manager,api}=setup(t);api.repos.set('alice/public',{full_name:'alice/public',id:7,private:false,default_branch:'main'});
 await assert.rejects(manager.ensure('topic',{repository:'alice/public'}),/privado/);
});

test('sync preserves base tree and default branch, strips source texts and avoids duplicate commits',async t=>{
 const {engine,manager,api}=setup(t);await manager.ensure('topic');
 engine.record('topic','paper','source',{url:'https://example.org/paper',access_level:'full_text',content:'FULL TEXT MUST REMAIN LOCAL',retrieved_at:'2026-11-13'});
 const r=await manager.sync('topic');assert.equal(r.status,'synced');
 const tree=api.calls.find(c=>c.route.endsWith('/git/trees')&&c.method==='POST').body;
 assert.equal(tree.base_tree,'base-tree');assert.ok(tree.tree.every(e=>e.path.startsWith('.investigador/projects/topic/')));
 assert.ok(!JSON.stringify(tree).includes('FULL TEXT MUST REMAIN LOCAL'));assert.ok(!api.calls.some(c=>c.method==='PATCH'&&c.route.endsWith('/main')));
 assert.equal((await manager.sync('topic')).status,'unchanged');assert.equal(api.calls.filter(c=>c.method==='POST'&&c.route.endsWith('/git/commits')).length,1);
});

test('lost ref update is recovered without republishing or duplicating the commit',async t=>{
 const {manager,api}=setup(t);api.lostRef=true;await assert.rejects(manager.sync('topic'),/perdida/);
 assert.equal((await manager.sync('topic')).status,'recovered');assert.equal(api.calls.filter(c=>c.method==='POST'&&c.route.endsWith('/git/commits')).length,1);
});

test('sync rechecks repository identity and privacy before writing',async t=>{
 const {manager,api}=setup(t);const r=await manager.ensure('topic');api.repos.get(r.repository).private=false;
 await assert.rejects(manager.sync('topic'),/privado/);assert.equal(api.calls.filter(c=>c.method==='POST'&&c.route.endsWith('/git/trees')).length,0);
});

test('snapshot refuses likely credentials before any Git tree is written',async t=>{
 const {engine,manager,api}=setup(t);await manager.ensure('topic');
 engine.record('topic','hyp-with-secret','hypothesis',{text:'Accidental github_pat_'+ 'x'.repeat(30),support_ids:[]});
 await assert.rejects(manager.sync('topic'),/posible secreto/);
 assert.equal(api.calls.filter(c=>c.method==='POST'&&c.route.endsWith('/git/trees')).length,0);
});

test('subsequent sync is fast-forward only and never forces an update',async t=>{
 const {engine,manager,api}=setup(t);await manager.sync('topic');
 engine.record('topic','hyp-new','hypothesis',{text:'Nueva hipótesis todavía no comprobada',support_ids:[]});
 await manager.sync('topic');
 const update=api.calls.find(c=>c.method==='PATCH');assert.equal(update.body.force,false);assert.match(update.route,/\/git\/refs\/heads\/investigador-/);
});

test('source reading pins a commit, persists actual content and never writes to the source repo',async t=>{
 const {engine}=setup(t);const calls=[];
 const api={async request(route,opt={}){calls.push({route,...opt});if(route==='/repos/alice/acd')return {full_name:'alice/acd',private:true,default_branch:'main'};if(route.includes('/commits/'))return {sha,commit:{tree:{sha:'source-tree'}}};if(route.includes('/contents/'))return {type:'file',encoding:'base64',size:12,content:Buffer.from('actual code').toString('base64')};return {tree:[{path:'README.md',type:'blob',size:12}]};}};
 const manager=new GitHubProjects(engine,{owner:'alice',api});
 const listing=await manager.read('topic',{repository:'alice/acd'});assert.equal(listing.commit,sha);
 const source=await manager.read('topic',{repository:'alice/acd',file:'README.md'});assert.equal(source.content,'actual code');
 assert.equal(engine.state('topic').events.find(e=>e.key===source.source_id).data.github.commit,sha);
 assert.ok(calls.every(x=>!x.method||x.method==='GET'));assert.ok(calls.some(x=>x.route.endsWith('?ref='+sha)));
 await assert.rejects(manager.read('topic',{repository:'alice/acd',file:'../.env'}),/Ruta/);
});

test('repository discovery filters the configured owner and reports pagination',async t=>{
 const {engine}=setup(t);const calls=[];
 const repos=Array.from({length:100},(_,i)=>({full_name:i===0?'alice/ACD':'bob/other-'+i,owner:{login:i===0?'alice':'bob'},private:true}));
 const manager=new GitHubProjects(engine,{owner:'alice',api:{request:async route=>{calls.push(route);return route==='/user'?{login:'alice'}:repos}}});
 const r=await manager.repositories({query:'acd'});assert.equal(r.repositories.length,1);assert.equal(r.repositories[0].repository,'alice/ACD');assert.equal(r.next_page,2);assert.ok(calls.every(r=>!r.includes('/git/')));
 await assert.rejects(manager.repositories({page:0}),/Paginación/);
});

test('public research refuses private source ingestion',async t=>{
 const {engine}=setup(t,{visibility:'public'});const manager=new GitHubProjects(engine,{owner:'alice',api:{request:async()=>({full_name:'alice/private',private:true})}});
 await assert.rejects(manager.read('topic',{repository:'alice/private',file:'README.md'}),/fuentes privadas/);
 assert.equal(engine.state('topic').events.filter(e=>e.kind==='source').length,0);
});

test('start keeps local research active with an actionable GitHub permission block',async t=>{
 const {engine}=setup(t);const result=await startResearch(engine,{project:'new-topic',request:'Nuevo tema'},{manager:{ensure:async()=>{throw Error('GitHub HTTP 403; permisos requeridos: repository_creation=write')}}});
 assert.equal(result.local_status,'ready');assert.equal(result.github.status,'blocked');assert.match(result.github.error,/repository_creation/);
 assert.equal(new Scheduler(engine).status().projects['new-topic'].enabled,true);
 await assert.rejects(startResearch(engine,{project:'new-topic',request:'Encargo distinto'}),/otro encargo/);
});

test('per-project lock prevents concurrent duplicate creation',async t=>{
 const {manager,api}=setup(t);let release;const wait=new Promise(r=>release=r),old=api.request.bind(api);
 api.request=async(route,opt)=>{if(route==='/user/repos')await wait;return old(route,opt)};
 const first=manager.ensure('topic');await assert.rejects(manager.ensure('topic'),/ocupada/);release();await first;
 assert.equal(api.calls.filter(x=>x.route==='/user/repos').length,1);
});

test('API uses the protected identity only for GitHub and exposes required permissions without response bodies',async()=>{
 let called;const api=new GitHubAPI({credentialProvider:async()=> 'dummy-private',fetcher:async(url,opt)=>{called={url,opt};return {ok:false,status:403,headers:{get:()=> 'repository_creation=write'},json:async()=>({message:'secret response'})}}});
 await assert.rejects(api.request('/user/repos',{method:'POST',body:{name:'test',private:true}}),e=>e.status===403&&e.message.includes('repository_creation=write')&&!e.message.includes('secret response'));
 assert.equal(called.url,'https://api.github.com/user/repos');assert.equal(called.opt.redirect,'error');assert.equal(called.opt.headers.Authorization,'Bearer dummy-private');
 await assert.rejects(api.request('https://example.invalid'),/Ruta/);
});
