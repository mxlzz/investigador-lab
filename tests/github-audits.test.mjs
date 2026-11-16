import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {Engine} from '../implementation/engine.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
import {GitHubAudits,AUDIT_MARKER,auditSummary,parseAudit} from '../implementation/github-audits.mjs';

const config={schema_version:1,reviewers:[{login:'owner',id:123}],inboxes:[{repository:'owner/repo',issue:12,project:'*'}]};
const audit=(overrides={})=>({project:'alpha',audit_id:'AUD-1',audited_commit:'a'.repeat(40),findings:[{id:'F-1',severity:'critical',status:'open',claim:'Una afirmación carece de evidencia',evidence:['commit fijo y resultado de prueba'],recommendation:'Comprobar y corregir'}],...overrides});
const comment=(a=audit(),overrides={})=>({id:101,user:{login:'owner',id:123},updated_at:'2026-11-16T00:00:00Z',body:AUDIT_MARKER+'\n```json\n'+JSON.stringify(a)+'\n```',...overrides});
function fixture(t,pages=[[comment()]]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-audits-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const e=new Engine(root);e.init('alpha','Revisar la evidencia del encargo');e.init('beta','Otro encargo');
 const calls=[];const api={request:async route=>{calls.push(route);if(route.includes('/comments?'))return pages[Number(new URL('https://api.github.com'+route).searchParams.get('page'))-1]||[];return {number:12};}};
 return {root,e,pages,calls,client:new GitHubAudits(e,{api,config})};
}

test('only marked structured comments are accepted; resolutions require evidence',()=>{
 assert.equal(parseAudit('Una conversación común'),null);
 assert.equal(parseAudit(comment().body).audit_id,'AUD-1');
 assert.throws(()=>parseAudit(AUDIT_MARKER+'\n'+JSON.stringify(audit({audited_commit:'main'}))),/Cabecera/);
 const empty=audit();empty.findings[0].evidence=[];empty.findings[0].status='resolved';
 assert.throws(()=>parseAudit(AUDIT_MARKER+'\n'+JSON.stringify(empty)),/evidencia/);
 const injected=audit();injected.findings[0].command='rm -rf /';
 assert.throws(()=>parseAudit(AUDIT_MARKER+'\n'+JSON.stringify(injected)),/ID de hallazgo/);
});

test('authorized ID plus login, exact project routing, pagination and durable deduplication',async t=>{
 const rows=Array.from({length:100},(_,i)=>comment(audit(),{id:i+1,user:{login:'intruder',id:123}}));
 const f=fixture(t,[rows,[comment(),comment(audit({project:'beta'}),{id:102}),comment(audit(),{id:103,user:{login:'owner',id:999}})]]);
 assert.equal((await f.client.pollAll()).imported,2);
 assert.ok(f.calls.some(c=>c.endsWith('page=2')));
 assert.equal(auditSummary(f.e.state('alpha')).pending.length,1);assert.equal(auditSummary(f.e.state('beta')).pending.length,1);
 assert.equal((await new GitHubAudits(f.e,{api:f.client.api,config}).pollAll()).imported,0);
 assert.equal(f.e.envelope('alpha','intake',false).audit_feedback.critical_open.length,1);
 assert.throws(()=>f.e.gate('alpha','release'),/auditoría crítica/);
});

test('edits are new revisions; proposed corrections never close critical findings',async t=>{
 const f=fixture(t);await f.client.pollAll();
 const pending=auditSummary(f.e.state('alpha')).pending;
 f.client.acceptReview('alpha',{reviews:[{feedback_id:pending[0].key,decision:'accepted',rationale:'Se necesita comprobar la evidencia',evidence_ids:[],follow_up_phase:'search_plan'}]},pending);
 assert.equal(auditSummary(f.e.state('alpha')).pending.length,0);
 assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,1);
 f.pages[0][0]=comment(audit(),{updated_at:'2026-11-16T00:01:00Z'});
 assert.equal((await f.client.pollAll()).imported,1);
 assert.equal(auditSummary(f.e.state('alpha')).pending.length,1);
 const resolved=audit();resolved.findings[0].status='resolved';resolved.findings[0].evidence=['Commit de corrección y prueba verificada'];
 f.pages[0].push(comment(resolved,{id:102,updated_at:'2026-11-16T00:02:00Z'}));await f.client.pollAll();
 assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,0);
 assert.throws(()=>f.e.gate('alpha','release'),/autorización humana/);
 // An old edited comment discovered later must not override a newer resolution.
 f.pages[0][0]=comment(audit(),{updated_at:'2026-11-16T00:01:30Z'});await f.client.pollAll();
 assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,0);
});

test('failed and partial reads remain unknown and do not erase known findings',async t=>{
 const f=fixture(t);await f.client.pollAll();
 f.client.api.request=async()=>{const err=Error('private message must not leak');err.status=403;throw err;};
 assert.equal((await f.client.pollAll()).status,'blocked');
 assert.equal(f.client.status('alpha').critical_open.length,1);assert.equal(f.client.status('alpha').poll.inboxes[0].error,'GitHub HTTP 403');
 const g=fixture(t,[Array.from({length:100},()=>comment())]);
 const original=g.client.api.request;g.client.api.request=async route=>{if(route.endsWith('page=2'))throw Error('network failure');return original(route);};
 assert.equal((await g.client.pollAll()).status,'blocked');assert.equal(auditSummary(g.e.state('alpha')).pending.length,0);
});

test('deleted or malformed comments cannot silently clear a critical finding',async t=>{
 const f=fixture(t);await f.client.pollAll();f.pages[0]=[];await f.client.pollAll();assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,1);
 f.pages[0]=[comment(audit(),{body:AUDIT_MARKER+'\nnot-json'})];assert.equal((await f.client.pollAll()).status,'needs_attention');assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,1);
});

test('review validation rejects execution, invented evidence and self-resolution',async t=>{
 const f=fixture(t);await f.client.pollAll();const pending=auditSummary(f.e.state('alpha')).pending;
 const review={feedback_id:pending[0].key,decision:'accepted',rationale:'Comprobar el problema',evidence_ids:[],follow_up_phase:'report'};
 for(const bad of [{...review,follow_up_phase:'shell'},{...review,evidence_ids:['invented']},{...review,decision:'resolved'}])assert.throws(()=>f.client.acceptReview('alpha',{reviews:[bad]},pending));
 assert.equal(auditSummary(f.e.state('alpha')).pending.length,1);
});

test('scheduler prioritizes review, respects pauses and quota, and queues documentary follow-up',async t=>{
 const f=fixture(t);const s=new Scheduler(f.e);s.control('beta',false,'Otro proyecto fuera del test');s.control('alpha',true,'Activo',{workflow:'documentary'});await f.client.pollAll();
 let lease=s.claim();assert.equal(lease.phase,'audit_review');const pending=auditSummary(f.e.state('alpha')).pending;
 f.client.acceptReview('alpha',{reviews:[{feedback_id:pending[0].key,decision:'accepted',rationale:'Corregir el informe conservando limitaciones',evidence_ids:['created'],follow_up_phase:'report'}]},pending);
 assert.equal(s.finish(lease.token).outcome,'progress');assert.deepEqual(s.load().projects.alpha.pending,['report']);
 f.pages[0][0]=comment(audit(),{updated_at:'2026-11-16T01:00:00Z'});await f.client.pollAll();s.control('alpha',false,'Pausa humana');assert.equal(s.claim().status,'idle');
 s.control('alpha',true,'Reanudar');s.transaction(data=>{data.daily[new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date())]=24;});assert.equal(s.claim().status,'idle');
});

test('real worker records structured review and finishes lease without posting replies',async t=>{
 const f=fixture(t);await f.client.pollAll();const s=new Scheduler(f.e);s.control('beta',false,'Fuera del test');s.control('alpha',true,'Activo',{workflow:'documentary'});
 const cli=path.join(f.root,'model.mjs');
 fs.writeFileSync(cli,"import fs from 'node:fs';const prompt=fs.readFileSync(process.argv[process.argv.indexOf('--message-file')+1],'utf8');const c=JSON.parse(prompt.slice(prompt.indexOf('\\n')+1));const reviews=c.assigned_comments.map(e=>({feedback_id:e.key,decision:'accepted',rationale:'Hace falta buscar la evidencia solicitada',evidence_ids:['created'],follow_up_phase:'search_plan'}));console.log(JSON.stringify({status:'ok',result:{payloads:[{text:JSON.stringify({reviews})}]}}));");
 const worker=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../implementation/scheduler-tick.mjs')],{env:{...process.env,INVESTIGADOR_ROOT:f.root,INVESTIGADOR_OPENCLAW_ENTRY:cli},encoding:'utf8',timeout:10000});
 assert.equal(worker.status,0,worker.stderr);assert.equal(s.load().lease,null);assert.equal(s.load().history.at(-1).outcome,'progress');
 assert.equal(auditSummary(f.e.state('alpha')).pending.length,0);assert.equal(auditSummary(f.e.state('alpha')).critical_open.length,1);
 assert.equal(s.load().projects.alpha.pending[0],'search_plan');assert.equal(s.load().projects.alpha.pending[1],'gather_evidence');
 assert.equal(f.calls.every(route=>!route.includes('POST')),true);
});

test('explicit public inbox never touches credentials and fails closed if repository is private',async t=>{
 const f=fixture(t);let isPrivate=false;
 const publicApi={request:async route=>route==='/repos/owner/repo'?{private:isPrivate}:f.client.api.request(route)};
 const client=new GitHubAudits(f.e,{config:{...config,inboxes:[{...config.inboxes[0],public:true}]},publicApi,api:{request:()=>{throw Error('Credential client must not be called')}}});
 assert.equal((await client.pollAll()).imported,1);isPrivate=true;assert.equal((await client.pollAll()).status,'blocked');
});
