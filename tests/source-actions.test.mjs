import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {Engine} from '../implementation/engine.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
import {SourceActions,artifactJson,pendingSourceWorkflow} from '../implementation/source-actions.mjs';
import {GitHubProjects} from '../implementation/github-projects.mjs';
const pin='a'.repeat(40),blob='b'.repeat(40),repo='owner/ACD';
function zip(name,value){
 const bytes=Buffer.from(JSON.stringify(value)),packed=zlib.deflateRawSync(bytes),filename=Buffer.from(name),crc=zlib.crc32(bytes);
 const l=Buffer.alloc(30);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(8,8);l.writeUInt32LE(crc,14);l.writeUInt32LE(packed.length,18);l.writeUInt32LE(bytes.length,22);l.writeUInt16LE(filename.length,26);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(8,10);c.writeUInt32LE(crc,16);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(filename.length,28);
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(c.length+filename.length,12);end.writeUInt32LE(l.length+filename.length+packed.length,16);
 return Buffer.concat([l,filename,packed,c,filename,end]);
}
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-source-actions-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const engine=new Engine(root);engine.init('acd','PRIVATE REQUEST MUST NEVER LEAVE THIS PC');engine.locked('acd',()=>engine.append('acd','registered-source','github_source_repository',{repository:repo,private:false}));
 const config={version:1,projects:{acd:{repository:repo,ref:'dev/current',workflows:[{file:'blender-smoke.yml',blob_sha:blob,purpose:'Existing public comparison'}]}}};
 const data={sha:pin,private:false,workflowBlob:blob,runs:[],artifacts:[],jobs:[],requests:[],writeError:null};
 const readApi={request:async route=>{
  if(route==='/repos/'+repo)return {id:42,full_name:repo,private:data.private};
  if(route.includes('/commits/'))return {sha:data.sha,commit:{tree:{sha:'c'.repeat(40)}}};
  if(route.includes('/git/trees/'))return {truncated:false,tree:[{type:'blob',path:'tests/blender_smoke.py'},{type:'blob',path:'.github/workflows/blender-smoke.yml'}]};
  if(route.includes('/contents/'))return {type:'file',encoding:'base64',sha:data.workflowBlob,content:Buffer.from('on:\n  workflow_dispatch:\npermissions:\n  contents: read\n').toString('base64')};
  if(route.includes('/jobs?'))return {jobs:data.jobs};
  if(route.includes('/artifacts?'))return {artifacts:data.artifacts};
  if(route.includes('/runs?'))return {workflow_runs:data.runs};
  throw Error('Unexpected route '+route);
 }};
 const writeApi={request:async(route,options)=>{data.requests.push({route,...options});if(data.writeError)throw Error(data.writeError);return null;}};
 const client=new SourceActions(engine,{config,readApi,writeApi});
 const complete=()=>{
  data.runs=[{id:501,head_branch:'dev/current',head_sha:pin,created_at:new Date().toISOString(),repository:{id:42,full_name:repo},event:'workflow_dispatch',path:'.github/workflows/blender-smoke.yml',status:'completed',conclusion:'success',run_attempt:1,html_url:'https://github.com/owner/ACD/actions/runs/501'}];
  data.jobs=[{id:601,run_id:501,run_attempt:1,head_sha:pin,name:'blender (5.0.1)',conclusion:'success',steps:[{name:'Render CPU',conclusion:'success'}]}];
 };
 return {root,engine,client,config,data,complete};
}
test('discovery lists real source files at the configured development ref',async t=>{
 const f=fixture(t),d=await f.client.discover('acd');assert.equal(d.ref,'dev/current');assert.deepEqual(d.test_files,['tests/blender_smoke.py']);assert.equal(d.source_commit,pin);assert.equal(f.engine.state('acd').events.at(-1).kind,'source_workflow_discovery');
});
test('github_read defaults to the configured source branch rather than main',async t=>{
 const f=fixture(t);fs.writeFileSync(path.join(f.root,'source-workflows.json'),JSON.stringify(f.config));const routes=[];const original=f.client.readApi.request;const api={request:async route=>{routes.push(route);return original(route);}};
 const result=await new GitHubProjects(f.engine,{owner:'owner',api}).read('acd',{repository:repo});assert.equal(result.commit,pin);assert.ok(routes.includes('/repos/owner/ACD/commits/dev%2Fcurrent'));
});
test('private project plans public replication with no manifest, fabricated hypothesis or privacy change',async t=>{
 const f=fixture(t),p=await f.client.plan('acd','source-plan',{workflow:'blender-smoke.yml',source_commit:pin});assert.equal(p.classification,'public_source_only');assert.equal(f.engine.state('acd').created.visibility,'private');
 assert.equal((await f.client.plan('acd','different-key',{workflow:'blender-smoke.yml',source_commit:pin})).plan_key,'source-plan');
 await f.client.submit('acd','source-plan');assert.deepEqual(f.data.requests[0].body,{ref:'dev/current'});assert.equal(JSON.stringify(f.data.requests).includes('PRIVATE REQUEST'),false);assert.equal(JSON.stringify(f.data.requests).includes('acd"'),false);
 assert.equal(pendingSourceWorkflow(f.engine.state('acd')).phase,'source_workflow_poll');
});
test('public source, reviewed workflow and exact commit are mandatory',async t=>{
 const f=fixture(t);
 await assert.rejects(f.client.plan('acd','p',{workflow:'write-release.yml',source_commit:pin}),/autorizado/);
 await assert.rejects(f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:'main'}),/commit/);
 f.data.workflowBlob='d'.repeat(40);await assert.rejects(f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin}),/requiere revisión/);
 f.data.workflowBlob=blob;f.data.private=true;await assert.rejects(f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin}),/pública/);assert.equal(f.data.requests.length,0);
});
test('branch drift prevents dispatch; uncertain POST is durable and never automatically repeated',async t=>{
 const f=fixture(t);await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});f.data.sha='e'.repeat(40);await assert.rejects(f.client.submit('acd','p'),/rama cambió/);assert.equal(f.data.requests.length,0);
 f.data.sha=pin;f.data.writeError='GitHub HTTP 403';assert.equal((await f.client.submit('acd','p')).status,'dispatch_uncertain');assert.equal((await f.client.submit('acd','p')).status,'already_requested');assert.equal(f.data.requests.length,1);
});
test('credential validation fails before dispatch intent and known 403 is terminal',async t=>{
 const f=fixture(t);await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});f.client.writeApi.credentialProvider=async()=>{throw Error('Identity unavailable')};await assert.rejects(f.client.submit('acd','p'),/Identity/);assert.equal(f.engine.state('acd').events.some(e=>e.kind==='source_workflow_dispatch'),false);
 f.client.writeApi.credentialProvider=async()=>'managed';f.client.writeApi.request=async()=>{const e=Error('Denied');e.status=403;throw e;};assert.equal((await f.client.submit('acd','p')).status,'blocked');assert.equal(pendingSourceWorkflow(f.engine.state('acd')),null);
});
test('poll verifies run/jobs and imports observed workflow evidence without quality claims',async t=>{
 const f=fixture(t);await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});await f.client.submit('acd','p');f.complete();const r=await f.client.poll('acd','p');assert.equal(r.status,'imported');assert.equal(r.quality_improvement_claim,false);assert.equal(r.source_commit,pin);assert.equal(pendingSourceWorkflow(f.engine.state('acd')),null);
 assert.equal((await f.client.poll('acd','p')).result_key,r.result_key);assert.equal(f.engine.state('acd').events.filter(e=>e.kind==='experiment_result').length,0);
});
test('foreign source commit or ambiguous runs cannot be imported',async t=>{
 const f=fixture(t);await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});await f.client.submit('acd','p');f.complete();f.data.runs[0].head_sha='f'.repeat(40);assert.equal((await f.client.poll('acd','p')).status,'blocked');assert.equal(f.engine.state('acd').events.some(e=>e.kind==='source_workflow_result'),false);
 const g=fixture(t);await g.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});await g.client.submit('acd','p');g.complete();g.data.runs.push({...g.data.runs[0],id:502});assert.equal((await g.client.poll('acd','p')).status,'blocked');
});
test('wrong job attempt is rejected and failed workflow is recorded as failed evidence',async t=>{
 const f=fixture(t);await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});await f.client.submit('acd','p');f.complete();f.data.jobs[0].run_attempt=2;await assert.rejects(f.client.poll('acd','p'),/Jobs/);
 f.data.jobs[0].run_attempt=1;f.data.runs[0].conclusion='failure';assert.equal((await f.client.poll('acd','p')).conclusion,'failure');
});
test('metrics ZIP rejects escapes, corrupt CRC and unexpected JSON shapes',()=>{
 assert.equal(artifactJson(zip('dir/metrics.json',{rmse:0.1}))[0].value.rmse,0.1);
 assert.throws(()=>artifactJson(zip('../metrics.json',{rmse:0})),/Ruta/);
 assert.throws(()=>artifactJson(zip('metrics.json',[])),/Reporte/);
 const corrupt=zip('metrics.json',{rmse:1});const center=corrupt.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));corrupt.writeUInt32LE(0,center+16);assert.throws(()=>artifactJson(corrupt),/CRC/);
 assert.deepEqual(artifactJson(zip('unrelated.json',{secret:1})),[]);
});
test('metrics import checks artifact digest and strips credentials on signed redirects',async t=>{
 const f=fixture(t),bytes=zip('metrics.json',{rmse:0.1});await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});await f.client.submit('acd','p');f.complete();f.data.artifacts=[{id:701,name:'comparison',expired:false,size_in_bytes:bytes.length,digest:'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex')}];await f.client.poll('acd','p');
 f.client.credentialProvider=async()=>'sensitive-token';const requests=[];f.client.fetcher=async(url,options)=>{requests.push({url,options});return requests.length===1?{status:302,headers:new Headers({location:'https://sample.blob.core.windows.net/download'})}:{ok:true,body:[bytes]};};
 const r=await f.client.metrics('acd','p',701);assert.equal(r.reports[0].value.rmse,0.1);assert.equal(requests[1].options.headers,undefined);assert.equal(JSON.stringify(r).includes('sensitive-token'),false);
});
test('scheduler polls external runs without model calls or overriding project pause',async t=>{
 const f=fixture(t),s=new Scheduler(f.engine);s.control('acd',false,'Pausa');await f.client.plan('acd','p',{workflow:'blender-smoke.yml',source_commit:pin});assert.equal(s.claim().status,'idle');s.control('acd',true,'Autorizado');const first=s.claim();assert.equal(first.phase,'source_workflow_submit');await f.client.submit('acd','p');assert.equal(s.finish(first.token).outcome,'progress');assert.equal(s.status().attemptsToday,0);
 const next=s.claim();assert.equal(next.phase,'source_workflow_poll');f.complete();await f.client.poll('acd','p');assert.equal(s.finish(next.token).outcome,'progress');assert.equal(s.status().attemptsToday,0);
});
