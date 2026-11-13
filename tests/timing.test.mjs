import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {researchTiming} from '../implementation/timing.mjs';
import {runAgent} from '../implementation/scheduler-tick.mjs';
import {Engine} from '../implementation/engine.mjs';
import {Scheduler} from '../implementation/scheduler.mjs';
import {MAX_TRIAL_TIMEOUT_SECONDS,runRemoteExperiment} from '../implementation/remote-experiment-runner.mjs';
import {setupFiles} from '../tools/openclaw-setup-files.mjs';

test('agent, worker, native job and lease budgets cannot cut each other short',()=>{
 const t=researchTiming({});assert.deepEqual(t,{agentSeconds:1800,modelAttempts:1,workerSeconds:1860,jobSeconds:2400,noOutputSeconds:2370,leaseSeconds:2700});
 assert.ok(t.agentSeconds<t.workerSeconds&&t.workerSeconds<t.noOutputSeconds&&t.noOutputSeconds<t.jobSeconds&&t.jobSeconds<t.leaseSeconds);
 assert.equal(researchTiming({INVESTIGADOR_AGENT_TIMEOUT_SECONDS:'3600'}).leaseSeconds,4500);
 assert.deepEqual(researchTiming({INVESTIGADOR_MODEL_ATTEMPTS:'3'}),{agentSeconds:1800,modelAttempts:3,workerSeconds:5460,jobSeconds:6000,noOutputSeconds:5970,leaseSeconds:6300});
 for(const v of ['0','4','bad','1.5'])assert.throws(()=>researchTiming({INVESTIGADOR_MODEL_ATTEMPTS:v}),/entre 1 y 3/);
 for(const v of ['0','bad','7201','1.5'])assert.throws(()=>researchTiming({INVESTIGADOR_AGENT_TIMEOUT_SECONDS:v}),/entre 60 y 7200/);
 const {job,fragment}=setupFiles({node:'C:\\Node\\node.exe',openclawRoot:'C:\\App',configPath:'C:\\State\\openclaw.json',stateRoot:'C:\\State',workspace:'C:\\Workspace',githubProfile:'C:\\Profile',githubRuntime:'C:\\Runtime',githubOwner:'alice',agentTimeoutSeconds:3600});
 assert.equal(job.payload.timeoutSeconds,4200);assert.equal(job.payload.env.INVESTIGADOR_AGENT_TIMEOUT_SECONDS,'3600');assert.equal(fragment.mcp.servers.investigador.env.INVESTIGADOR_AGENT_TIMEOUT_SECONDS,'3600');
});

test('a long claimed turn is not reclaimed by the next 15-minute tick',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-lease-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const e=new Engine(root);e.init('long-turn','Encargo largo');const s=new Scheduler(e),first=s.claim(1000);
 assert.equal(s.claim(1000+15*60000).status,'busy');assert.equal(s.status().policy.leaseMinutes,45);
 const recovered=s.claim(first.expiresAt+1);assert.equal(recovered.status,'claimed');assert.notEqual(recovered.token,first.token);
});

test('worker passes its actual deadline to the CLI and still terminates a hung child',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-worker-time-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const cli=path.join(root,'cli.mjs');fs.writeFileSync(cli,"console.log(JSON.stringify({status:'ok',result:{deadline:process.argv[process.argv.indexOf('--timeout')+1]}}));");
 const result=await runAgent(cli,'unused.txt',{project:'test',agentTimeoutSeconds:1800});assert.equal(result.result.deadline,'1800');
 fs.writeFileSync(cli,'setInterval(()=>{},1000);');
 await assert.rejects(runAgent(cli,'unused.txt',{project:'hung',agentTimeoutSeconds:1,timeoutMs:1100}),/Timeout del ciclo/);
 await assert.rejects(runAgent(cli,'unused.txt',{project:'invalid',agentTimeoutSeconds:2,timeoutMs:1000}),/superar/);
 await assert.rejects(runAgent(cli,'unused.txt',{project:'invalid-chain',agentTimeoutSeconds:1,modelAttempts:3,timeoutMs:2500}),/todos los modelos/);
});

test('public experiment manifest can allow one hour per trial within the workflow budget',async()=>{
 const root=path.resolve(import.meta.dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'experiments/runner-smoke/manifest.json'),'utf8'));
 const result=await runRemoteExperiment(root,{...manifest,timeout_seconds:MAX_TRIAL_TIMEOUT_SECONDS},{allowLocalForTest:true});assert.equal(result.candidate,0);
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/investigador-experiment.yml'),'utf8');
 const minutes=Number(workflow.match(/timeout-minutes:\s*(\d+)/)[1]);assert.ok(minutes*60>=2*MAX_TRIAL_TIMEOUT_SECONDS+600);
 await assert.rejects(runRemoteExperiment(root,{...manifest,timeout_seconds:MAX_TRIAL_TIMEOUT_SECONDS+1},{allowLocalForTest:true}),/Tiempo excede/);
});
