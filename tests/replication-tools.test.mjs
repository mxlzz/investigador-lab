import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {setupFiles} from '../tools/openclaw-setup-files.mjs';
import {verifyProjectRepository} from '../tools/verify-project-repository.mjs';
import {Engine} from '../implementation/engine.mjs';
import {GitHubProjects} from '../implementation/github-projects.mjs';

test('portable setup keeps MCP and worker identity consistent and creates a paused job',()=>{
 const setup={node:'C:\\Runtime\\node.exe',openclawRoot:'C:\\Apps\\OpenClaw',configPath:'C:\\Agent State\\openclaw.json',stateRoot:'C:\\Agent State',workspace:'D:\\Investigación\\workspace',githubProfile:'C:\\Agent State\\credentials\\github\\system\\ghp_'+'a'.repeat(32),githubRuntime:'D:\\Runtime\\github',githubOwner:'another-owner',model:'provider/model'};
 const {fragment,job}=setupFiles(setup),mcp=fragment.mcp.servers.investigador;
 assert.equal(mcp.command,setup.node);assert.equal(job.enabled,false);assert.equal(job.schedule.everyMs,900000);
 for(const [k,v]of Object.entries(mcp.env))assert.equal(job.payload.env[k],v);
 assert.equal(job.payload.env.INVESTIGADOR_OPENCLAW_ENTRY,'C:\\Apps\\OpenClaw\\openclaw.mjs');
 assert.equal(mcp.env.INVESTIGADOR_GITHUB_REPO,'another-owner/investigador-lab');
 assert.equal(fragment.agents.entries.investigador.model,'provider/model');
 assert.equal(fragment.tools,undefined);assert.ok(!JSON.stringify(fragment).includes('mxlzz'));
 assert.throws(()=>setupFiles({...setup,token:'never-accepted'}),/nunca pasar tokens/);
 assert.throws(()=>setupFiles({...setup,workspace:'relative'}),/absoluta/);
 assert.throws(()=>setupFiles({...setup,model:'ghp_'+'x'.repeat(40)}),/Posible credencial/);
});

test('RPC transport preserves JSON and local paths without shell interpolation',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-replication-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const app=path.join(root,'App With Spaces');fs.mkdirSync(app);
 fs.writeFileSync(path.join(app,'openclaw.mjs'),"console.log(JSON.stringify({args:process.argv.slice(2),state:process.env.OPENCLAW_STATE_DIR,config:process.env.OPENCLAW_CONFIG_PATH}));");
 const setup={node:process.execPath,openclawRoot:app,stateRoot:root,configPath:path.join(root,'config.json')};
 const config=path.join(root,'setup.json'),params=path.join(root,'params.json');fs.writeFileSync(config,JSON.stringify(setup));
 const data={name:'Literal $() `quotes`',nested:{value:'line1\nline2'}};fs.writeFileSync(params,JSON.stringify(data));
 const r=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../tools/openclaw-rpc.mjs'),config,'cron.add',params],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const out=JSON.parse(r.stdout);assert.deepEqual(JSON.parse(out.args[out.args.indexOf('--params')+1]),data);assert.equal(out.state,root);assert.equal(out.config,setup.configPath);
});

test('independent readback rejects a changed GitHub file without remote writes',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-readback-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const engine=new Engine(root);engine.init('fixture','Prueba técnica de lectura remota');
 engine.locked('fixture',()=>engine.append('fixture','github-repository','github_repository',{repository:'alice/test',repository_id:1,private:true,branch:'investigador-fixture'}));
 const snapshot=new GitHubProjects(engine).snapshot('fixture'),commit='a'.repeat(40);let tampered=false;
 engine.locked('fixture',()=>engine.append('fixture','github-sync-test','github_sync',{snapshot_hash:snapshot.hash,commit}));
 const api={request:async(route,options)=>{assert.equal(options,undefined);if(route.endsWith('/alice/test'))return {full_name:'alice/test',id:1,private:true};if(route.includes('/git/ref/'))return {object:{sha:commit}};return {encoding:'base64',content:Buffer.from(tampered?'changed':snapshot.files[1].content).toString('base64')};}};
 assert.equal((await verifyProjectRepository(engine,'fixture',{api})).ok,true);
 tampered=true;await assert.rejects(verifyProjectRepository(engine,'fixture',{api}),e=>/no coincide/.test(e.message)&&!e.message.includes('changed'));
});
