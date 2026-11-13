// Read-only acceptance: compare the actual GitHub file/ref with the local journal.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Engine} from '../implementation/engine.mjs';
import {GitHubAPI,GitHubProjects} from '../implementation/github-projects.mjs';
import {setupFiles} from './openclaw-setup-files.mjs';
export async function verifyProjectRepository(engine,project,{api=new GitHubAPI()}={}){
 const state=engine.state(project),bound=state.events.find(e=>e.kind==='github_repository')?.data;
 assert.ok(bound,'Falta vinculación confirmada');
 const checkpoint=state.events.findLast(e=>e.kind==='github_sync')?.data;assert.ok(checkpoint,'Falta sync confirmado');
 const manager=new GitHubProjects(engine,{api}),snapshot=manager.snapshot(project);
 assert.equal(snapshot.hash,checkpoint.snapshot_hash,'Hay cambios locales todavía no sincronizados');
 const base='/repos/'+bound.repository,repo=await api.request(base);
 manager.verifyRepository(repo,bound.repository,state.created.visibility);
 assert.equal(repo.id,bound.repository_id,'Identidad remota distinta');assert.equal(repo.private,bound.private,'Cambió la visibilidad remota');
 const ref=await api.request(base+'/git/ref/heads/'+encodeURIComponent(bound.branch));
 assert.equal(ref.object.sha,checkpoint.commit,'El ref remoto no apunta al commit registrado');
 const entry=await api.request(base+'/contents/'+snapshot.files[1].path+'?ref='+checkpoint.commit);
 assert.equal(entry.encoding,'base64','Codificación remota inesperada');
 const content=Buffer.from(entry.content.replace(/\s/g,''),'base64').toString('utf8');
 assert.ok(content===snapshot.files[1].content,'El avance remoto no coincide con el snapshot local');
 return {ok:true,private:repo.private,remote_branch_matches:true,remote_snapshot_matches:true,repository:bound.repository,commit:checkpoint.commit,url:`https://github.com/${bound.repository}/tree/${bound.branch}/.investigador/projects/${project}`};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [file,project]=process.argv.slice(2);if(!file||!project)throw Error('Uso: node tools/verify-project-repository.mjs setup.local.json PROJECT');
 const input=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
 const {fragment}=setupFiles(input);Object.assign(process.env,fragment.mcp.servers.investigador.env);
 console.log(JSON.stringify(await verifyProjectRepository(new Engine(input.workspace),project),null,2));
}
