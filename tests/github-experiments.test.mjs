import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {Engine} from '../implementation/engine.mjs';
import {GitHubExperiments,unzipReceipt} from '../implementation/github-experiments.mjs';
import {documentaryTask} from '../implementation/scheduler.mjs';
const sum=x=>crypto.createHash('sha256').update(x).digest('hex');
const source=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'experiments/runner-smoke/manifest.json'),'utf8'));
const pin='a'.repeat(40),repo='mxlzz/investigador-lab';
function setup(t,visibility='public'){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-experiments-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.join(source,'spec'),path.join(root,'spec'),{recursive:true});
 const e=new Engine(root);e.init(manifest.project_id,'Experimentación pública',{visibility});
 // Synthetic phase fixture: separate tests verify acceptance contracts.
 e.locked(manifest.project_id,()=>{
  e.append(manifest.project_id,'hyp-1','hypothesis',{text:'Improvement hypothesis',support_ids:[]});
  e.append(manifest.project_id,'nov-1','phase',{output:{phase:'novelty_review',status:'ok',hypothesis_id:'hyp-1',recommendation:'experiment'}});
  e.append(manifest.project_id,'design-1','phase',{output:{phase:'experiment_design',status:'ok',hypothesis_id:'hyp-1'}});
 });
 const plan={project_id:manifest.project_id,experiment_id:manifest.experiment_id,hypothesis_id:'hyp-1',
  manifest_path:'experiments/runner-smoke/manifest.json',manifest_sha256:sum(JSON.stringify(manifest)),
  source_commit:pin,metric:'mse',direction:'minimize',classification:'public',monetary_budget:0};
 return {e,plan,project:manifest.project_id};
}
function zip(name,body){
 const file=Buffer.from(name),raw=Buffer.from(JSON.stringify(body)),packed=zlib.deflateRawSync(raw);
 const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(8,8);
 local.writeUInt32LE(packed.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(file.length,26);
 const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
 central.writeUInt16LE(8,10);central.writeUInt32LE(packed.length,20);central.writeUInt32LE(raw.length,24);
 central.writeUInt16LE(file.length,28);const off=local.length+file.length+packed.length;
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);
 end.writeUInt32LE(central.length+file.length,12);end.writeUInt32LE(off,16);
 return Buffer.concat([local,file,packed,central,file,end]);
}
test('public plan enforces a confirmed hypothesis, immutable source and zero expense',t=>{
 const {e,plan,project}=setup(t);
 assert.throws(()=>e.planExperiment(project,'bad',{...plan,source_commit:'main'}),/commit/);
 assert.throws(()=>e.planExperiment(project,'bad',{...plan,monetary_budget:1}),/gasto cero/);
 const entry=e.planExperiment(project,'plan-1',plan);
 assert.equal(entry.kind,'experiment_plan');assert.equal(e.gate(project,'experiment',{plan_key:'plan-1'}).allowed,true);
 assert.throws(()=>e.record(project,'fake','experiment_result',{}),/aislado/);
});
test('private project cannot dispatch experiment to public infrastructure',t=>{
 const {e,plan,project}=setup(t,'private');
 assert.throws(()=>e.planExperiment(project,'plan-private',plan),/público/);
});
test('dispatch -> GitHub verification -> ZIP -> journal import is idempotent',async t=>{
 const {e,plan,project}=setup(t);e.planExperiment(project,'plan-1',plan);
 let requestId,called=0;
 const fake=async(url,opt={})=>{
  called++;
  if(url==='https://api.github.com/repos/'+repo)return Response.json({full_name:repo,private:false,default_branch:'main'});
  if(url.includes('/contents/'))return Response.json({type:'file',encoding:'base64',content:Buffer.from(JSON.stringify(manifest)).toString('base64')});
  if(url.endsWith('/dispatches')){assert.equal(opt.method,'POST');requestId=JSON.parse(opt.body).inputs.request_id;return new Response(null,{status:204});}
  if(url.includes('/runs?event='))return Response.json({workflow_runs:[{id:90001,run_attempt:1,display_title:'Investigador experiment '+requestId,
   repository:{full_name:repo},event:'workflow_dispatch',path:'.github/workflows/investigador-experiment.yml',
   status:'completed',conclusion:'success',html_url:'https://github.com/mxlzz/investigador-lab/actions/runs/90001'}]});
  if(url.includes('/runs/90001/artifacts?'))return Response.json({artifacts:[{id:8001,name:'investigador-'+requestId,workflow_run:{id:90001},expired:false}]});
  if(url.endsWith('/artifacts/8001/zip')){
   const receipt={schema_version:1,project_id:project,experiment_id:plan.experiment_id,
    source_commit:pin,manifest_sha256:plan.manifest_sha256,request_id:requestId,
    github_repository:repo,github_run_id:'90001',metric:'mse',direction:'minimize',baseline:0.25,candidate:0,
    improvement:0.25,results:[{id:'baseline'},{id:'candidate'}],provisional:true};
   return new Response(zip(plan.experiment_id+'.json',receipt),{status:200});
  }
  throw Error('Unexpected API '+url);
 };
 const service=new GitHubExperiments(e,{repo,token:'fake-local-test-token',fetcher:fake});
 const sent=await service.submit(project,'plan-1');assert.equal(sent.status,'requested');
 const repeated=await service.submit(project,'plan-1');assert.equal(repeated.status,'already_requested');
 const got=await service.poll(project,'plan-1');assert.equal(got.status,'imported');assert.equal(got.improvement,0.25);
 const again=await service.poll(project,'plan-1');assert.equal(again.result_key,got.result_key);
 const schema=e.schema.oneOf.find(s=>s.properties.phase.const==='evaluation'),out={};
 for(const field of schema.required){const rule=schema.properties[field];out[field]=rule.const??rule.enum?.[0]??(rule.type==='array'?[]:rule.type==='object'?{}:'');}
 out.status='ok';out.experiment_id='non-existent-experiment';
 assert.throws(()=>e.accept(project,'fake-evaluation',e.envelope(project,'evaluation'),out),/resultados ejecutados/);
 out.experiment_id=got.result_key;
 e.accept(project,'validated-evaluation',e.envelope(project,'evaluation'),out);
 assert.ok(e.state(project).completed.includes('evaluation'));
 assert.equal(e.state(project).events.filter(e=>e.kind==='experiment_result').length,1);
 assert.ok(called>=5);
});
test('wrong ZIP filename is rejected',()=>{
 assert.throws(()=>unzipReceipt(zip('evil.json',{ok:true}),'expected.json'),/Archivo inesperado/);
});
test('research plans and waits for a verified result before interpretation',()=>{
 const base=['intake','search_plan','extract_evidence','map_knowledge','hypotheses','novelty_review','experiment_design'];
 const events=[{kind:'phase',data:{output:{phase:'novelty_review',status:'ok',recommendation:'experiment'}}}];
 assert.equal(documentaryTask({completed:base,events},'research'),'experiment_plan');
 events.push({kind:'experiment_plan',key:'plan-1'});
 assert.equal(documentaryTask({completed:base,events},'research'),'experiment_submit');
 events.push({kind:'experiment_dispatch',data:{plan_key:'plan-1'}});
 assert.equal(documentaryTask({completed:base,events},'research'),'experiment_poll');
 events.push({kind:'experiment_result',data:{plan_key:'plan-1'}});
 assert.equal(documentaryTask({completed:base,events},'research'),'evaluation');
});
