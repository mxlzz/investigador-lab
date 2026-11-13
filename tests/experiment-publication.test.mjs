import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Engine} from '../implementation/engine.mjs';
import {ExperimentPublication} from '../implementation/experiment-publication.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
import {spawnSync} from 'node:child_process';
function fixture(t,visibility='public'){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publication-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});const e=new Engine(root);e.init('demo','Public synthetic experiment',{visibility});
 e.locked('demo',()=>{e.append('demo','hyp','hypothesis',{text:'Conditional hypothesis',support_ids:[]});e.append('demo','nov','phase',{output:{phase:'novelty_review',status:'ok',hypothesis_id:'hyp',recommendation:'replicate_for_validation'}});e.append('demo','design','phase',{output:{phase:'experiment_design',status:'ok',hypothesis_id:'hyp',metrics_and_criteria:[{metric_name:'elapsed_ms',direction:'minimize'}]}});});
 const p={status:'ok',blockers:[],experiment_id:'trial-1',hypothesis_id:'hyp',metric:'elapsed_ms',direction:'minimize',timeout_seconds:30,methodology:'Synthetic controlled protocol; no scientific result is asserted.',files:[{name:'trial.mjs',content:'throw Error("must never run on local PC");'}],trials:[{id:'baseline',script:'trial.mjs',args:['baseline']},{id:'candidate',script:'trial.mjs',args:['candidate']}]};return {e,p};
}
function api({loseRef=false,corrupt=false}={}){
 const sha='b'.repeat(40),calls=[],files=new Map();let branch=null,loss=loseRef;
 return {calls,request:async(route,{method='GET',body,optional=false}={})=>{calls.push({route,method,body});
  if(route==='/repos/alice/lab')return {full_name:'alice/lab',private:false,default_branch:'main'};
  if(route.includes('/git/ref/heads/main'))return {object:{sha:'a'.repeat(40)}};
  if(route.includes('/git/ref/heads/experiment'))return branch;
  if(route.endsWith('/git/commits/'+ 'a'.repeat(40)))return {tree:{sha:'c'.repeat(40)}};
  if(route.endsWith('/git/trees')){body.tree.forEach(f=>files.set(f.path,f.content));return {sha:'d'.repeat(40)};}
  if(route.endsWith('/git/commits'))return {sha};
  if(route.endsWith('/git/refs')){branch={object:{sha}};if(loss){loss=false;throw Error('lost acknowledgment');}return branch;}
  if(route.includes('/contents/')){const name=route.split('/contents/')[1].split('?')[0];return {type:'file',encoding:'base64',content:Buffer.from(corrupt?'tampered':files.get(name)).toString('base64')};}
  throw Error('Unexpected route '+route);
 }};
}
test('publication validates gates before writing and refuses escapes, secrets and wrong metrics',async t=>{
 const {e,p}=fixture(t),remote=api(),pub=new ExperimentPublication(e,{repo:'alice/lab',api:remote});
 for(const bad of [{...p,files:[{name:'../evil.mjs',content:'x'}]},{...p,methodology:'credential github_pat_'+'x'.repeat(30)},{...p,metric:'other_metric'},{...p,hypothesis_id:'invented'}])await assert.rejects(pub.publish('demo','plan',bad));
 assert.equal(remote.calls.length,0);
 const privateFixture=fixture(t,'private');await assert.rejects(new ExperimentPublication(privateFixture.e,{repo:'alice/lab',api:remote}).publish('demo','plan',p),/público/);assert.equal(remote.calls.length,0);
});
test('publication pins readback-verified code and recovers lost ref acknowledgment without local execution',async t=>{
 const {e,p}=fixture(t),remote=api({loseRef:true}),pub=new ExperimentPublication(e,{repo:'alice/lab',api:remote});
 const entry=await pub.publish('demo','plan',p);assert.equal(entry.data.source_commit,'b'.repeat(40));assert.equal(entry.data.design_event_key,'design');
 assert.equal(remote.calls.filter(c=>c.route.endsWith('/git/refs')).length,1);assert.equal(remote.calls.filter(c=>c.method==='PATCH').length,0);
 assert.ok(remote.calls.find(c=>c.route.endsWith('/git/trees')).body.tree.every(f=>f.path.startsWith('experiments/trial-1/')||f.path==='implementation/remote-experiment-runner.mjs'));
 assert.deepEqual(await pub.publish('demo','plan',p),entry);assert.equal(e.events('demo').filter(e=>e.kind==='experiment_plan').length,1);
});
test('tampered remote readback cannot produce an accepted plan; retry reuses durable proposal',async t=>{
 const {e,p}=fixture(t),remote=api({corrupt:true}),pub=new ExperimentPublication(e,{repo:'alice/lab',api:remote});
 await assert.rejects(pub.publish('demo','plan',p),/Lectura independiente/);assert.equal(e.events('demo').filter(e=>e.kind==='experiment_plan').length,0);
 assert.equal(e.events('demo').filter(e=>e.kind==='experiment_publication_intent').length,1);
 await assert.rejects(pub.publish('demo','plan',{...p,files:[]}),/Lectura independiente/);
 assert.equal(remote.calls.filter(c=>c.route.endsWith('/git/refs')).length,1);
});
test('design acceptance rejects a syntactically valid invented hypothesis',t=>{
 const {e}=fixture(t),schema=e.schema.oneOf.find(s=>s.properties.phase.const==='experiment_design'),output={};
 for(const k of schema.required){const p=schema.properties[k];output[k]=p.const??p.enum?.[0]??(p.type==='array'?[]:p.type==='object'?{}:'');}
 Object.assign(output,{status:'ok',hypothesis_id:'invented',baselines:[{}],metrics_and_criteria:[{}]});
 assert.throws(()=>e.accept('demo','bad-design',e.envelope('demo','experiment_design'),output),/hipótesis registrada/);
});
test('a queued evaluation routes through plan, dispatch and result for the current design',t=>{
 const {e,p}=fixture(t),scheduler=new Scheduler(e),config={projects:{demo:{pending:['evaluation']}}};
 const state={...e.state('demo'),completed:['intake','search_plan','extract_evidence','map_knowledge','hypotheses','novelty_review','experiment_design']};
 assert.equal(scheduler.task(config,state),'experiment_plan');
 const plan={key:'plan',kind:'experiment_plan',data:{design_event_key:'design'}};state.events.push(plan);
 assert.equal(scheduler.task(config,state),'experiment_submit');
 state.events.push({kind:'experiment_dispatch',data:{plan_key:'plan'}});assert.equal(scheduler.task(config,state),'experiment_poll');
 state.events.push({kind:'experiment_result',data:{plan_key:'plan'}});assert.equal(scheduler.task(config,state),'evaluation');
 state.events.push({key:'design-2',kind:'phase',data:{output:{phase:'experiment_design',status:'ok'}}});assert.equal(scheduler.task(config,state),'experiment_plan');
});
test('structured experiment preparation records an explicit block and releases the lease',t=>{
 const {e}=fixture(t),s=new Scheduler(e);
 e.locked('demo',()=>{for(const phase of ['intake','search_plan','extract_evidence','map_knowledge','hypotheses'])e.append('demo','fixture-'+phase,'phase',{output:{phase,status:'ok'}});});
 s.control('demo',true,'Test fixture');
 const cli=path.join(e.root,'blocked-model.mjs');fs.writeFileSync(cli,`import fs from 'node:fs';const text=fs.readFileSync(process.argv[process.argv.indexOf('--message-file')+1],'utf8');if(!text.startsWith('PLANIFICACIÓN ESTRUCTURADA'))throw Error('Wrong prompt');console.log(JSON.stringify({status:'ok',result:{payloads:[{text:JSON.stringify({status:'blocked',blockers:['Cannot implement this fixture faithfully']})}]}}));`);
 const r=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../implementation/scheduler-tick.mjs')],{env:{...process.env,INVESTIGADOR_ROOT:e.root,INVESTIGADOR_OPENCLAW_ENTRY:cli,INVESTIGADOR_GITHUB_PROFILE:'',INVESTIGADOR_GITHUB_TOKEN:''},encoding:'utf8',timeout:10000});
 assert.equal(r.status,1,r.stdout+r.stderr);assert.equal(s.load().lease,null);assert.equal(s.load().projects.demo.enabled,false);assert.match(s.load().projects.demo.reason,/Cannot implement/);assert.equal(e.events('demo').filter(e=>e.kind==='experiment_plan').length,0);
});
