import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {runAgent} from '../implementation/scheduler-tick.mjs';

test('automatic steps reuse one chat per project and keep projects separate',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-project-session-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const cli=path.join(root,'cli.mjs');
 fs.writeFileSync(cli,"console.log(JSON.stringify({status:'ok',result:{session:process.argv[process.argv.indexOf('--session-key')+1],prompt:process.argv[process.argv.indexOf('--message-file')+1]}}));");
 const first=await runAgent(cli,'step-one.txt',{project:'alpha',sessionTag:'old-cycle-one'});
 const second=await runAgent(cli,'step-two.txt',{project:'alpha',sessionTag:'old-cycle-two'});
 const other=await runAgent(cli,'step-three.txt',{project:'beta'});
 assert.equal(first.result.session,'agent:investigador:research-alpha');
 assert.equal(first.result.session,second.result.session);
 assert.notEqual(first.result.session,other.result.session);
 assert.equal(second.result.prompt,'step-two.txt');
});
