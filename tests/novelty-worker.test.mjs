import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {Engine} from '../implementation/engine.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
function fixture(t,candidates=[{id:'proposal-1',statement:'A conditional benchmark hypothesis'}]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-novelty-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const e=new Engine(root);e.init('demo','Review a benchmark, without claiming scientific novelty');
 e.record('demo','source-1','source',{url:'https://example.org/paper',access_level:'abstract',content:'Unit-test source',retrieved_at:'2026-11-13'});
 e.record('demo','search-1','search',{query:'benchmark antecedents',executed_at:'2026-11-13',source_ids:['source-1']});
 // Explicit confirmed phase fixture, not a live scientific record.
 e.locked('demo',()=>e.append('demo','proposals','phase',{output:{phase:'hypotheses',status:'ok',candidates}}));
 return {e,s:new Scheduler(e)};
}
function review(e,hypothesis){const out={};for(const k of e.schema.oneOf.find(s=>s.properties.phase.const==='novelty_review').required){const p=e.schema.oneOf.find(s=>s.properties.phase.const==='novelty_review').properties[k];out[k]=p.const??p.enum?.[0]??(p.type==='array'?[]:'');}return {...out,status:'ok',hypothesis_id:hypothesis,searches_reviewed:[{search_id:'search-1'}],expected_new_information:'Validation of a concrete case, not discovery',recommendation:'replicate_for_validation'};}

test('confirmed candidates become idempotent hypothesis records without invented support',t=>{
 const {e}=fixture(t);const [h]=e.materializeHypotheses('demo');
 assert.equal(h.data.text,'A conditional benchmark hypothesis');assert.deepEqual(h.data.support_ids,[]);assert.equal(h.data.origin.phase_event,'proposals');
 assert.equal(e.materializeHypotheses('demo')[0].key,h.key);assert.equal(e.state('demo').events.filter(e=>e.kind==='hypothesis').length,1);
});

test('novelty accepts the object-shaped search contract and rejects missing or imaginary references',t=>{
 const {e}=fixture(t),[h]=e.materializeHypotheses('demo');
 assert.throws(()=>e.accept('demo','bad-search',e.envelope('demo','novelty_review'),{...review(e,h.key),searches_reviewed:[{}]}),/search_id/);
 assert.throws(()=>e.accept('demo','bad-id',e.envelope('demo','novelty_review'),{...review(e,h.key),searches_reviewed:[{search_id:'imaginary'}]}),/registradas/);
 assert.throws(()=>e.accept('demo','bad-phase',e.envelope('demo','novelty_review'),{status:'ok'}),/Falta output.phase/);
 e.accept('demo','good',e.envelope('demo','novelty_review'),review(e,h.key));assert.ok(e.state('demo').completed.includes('novelty_review'));
});

test('scheduled novelty is one structured model turn confirmed by the host',t=>{
 const {e,s}=fixture(t);s.control('demo',true,'Unit fixture',{restart_from:'novelty_review'});
 const cli=path.join(e.root,'structured-cli.mjs');fs.writeFileSync(cli,`import fs from 'node:fs';const message=fs.readFileSync(process.argv[process.argv.indexOf('--message-file')+1],'utf8');if(!message.startsWith('PLANIFICACIÓN ESTRUCTURADA'))throw Error('Expected structured mode');const env=JSON.parse(message.slice(message.indexOf('{'))),h=env.project_state.events.find(e=>e.kind==='hypothesis');const out={};for(const k of env.output_contract.required){const p=env.output_contract.properties[k];out[k]=p.const??p.enum?.[0]??(p.type==='array'?[]:'');}Object.assign(out,{status:'ok',hypothesis_id:h.key,searches_reviewed:[{search_id:'search-1'}],expected_new_information:'Concrete replication only',recommendation:'replicate_for_validation'});console.log(JSON.stringify({status:'ok',result:{payloads:[{text:JSON.stringify(out)}]}}));`);
 const r=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../implementation/scheduler-tick.mjs')],{env:{...process.env,INVESTIGADOR_ROOT:e.root,INVESTIGADOR_OPENCLAW_ENTRY:cli},encoding:'utf8',timeout:10000});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.equal(JSON.parse(r.stdout).outcome,'progress');assert.equal(s.status().lease,null);assert.ok(e.state('demo').completed.includes('novelty_review'));
});

test('a preparation failure releases its lease instead of leaving a stuck cycle',t=>{
 const {e,s}=fixture(t,[{id:'invalid',support_ids:[]}]);s.control('demo',true,'Invalid fixture',{restart_from:'novelty_review'});
 const cli=path.join(e.root,'unused-cli.mjs');fs.writeFileSync(cli,"throw Error('must not call model');");
 const r=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../implementation/scheduler-tick.mjs')],{env:{...process.env,INVESTIGADOR_ROOT:e.root,INVESTIGADOR_OPENCLAW_ENTRY:cli},encoding:'utf8',timeout:10000});
 assert.equal(r.status,1);assert.equal(s.status().lease,null);assert.match(JSON.parse(r.stdout).error,/statement\/text/);
});
