import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
test('MCP initialize, discovery and real phase transaction over stdio',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'inv-mcp-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
 const proc=spawn(process.execPath,[path.resolve(import.meta.dirname,'../implementation/mcp-server.mjs')],{env:{...process.env,INVESTIGADOR_ROOT:root},stdio:['pipe','pipe','pipe']});t.after(()=>proc.kill());let buf='';const pending=new Map();proc.stdout.on('data',d=>{buf+=d;while(buf.includes('\n')){const i=buf.indexOf('\n');const m=JSON.parse(buf.slice(0,i));buf=buf.slice(i+1);pending.get(m.id)?.(m);pending.delete(m.id)}});let n=0;const req=(method,params)=>new Promise((resolve,reject)=>{const id=++n;const timer=setTimeout(()=>reject(new Error('MCP timeout')),5000);pending.set(id,m=>{clearTimeout(timer);resolve(m)});proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n')});
 assert.equal((await req('initialize',{protocolVersion:'2025-03-26'})).result.serverInfo.name,'investigador-engine');assert.equal((await req('tools/list',{})).result.tools[0].name,'research');
 const call=async a=>(await req('tools/call',{name:'research',arguments:a})).result;
 const missing=await call({operation:'accept',key:'x',envelope:{task_id:'x'},output:{}});assert.equal(missing.isError,true);assert.match(missing.content[0].text,/faltan argumentos project/);
 assert.ok(!(await call({operation:'init',project:'mcp-test',request:'Explorar evidencia'})).isError);
 const env=JSON.parse((await call({operation:'prepare',project:'mcp-test',phase:'intake'})).content[0].text);
 const valid=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../spec/schemas/examples/intake.valid.json')));
 assert.ok(!(await call({operation:'accept',project:'mcp-test',key:'phase1',envelope:env,output:valid})).isError);
 const state=JSON.parse((await call({operation:'state',project:'mcp-test'})).content[0].text);assert.deepEqual(state.completed,['intake']);
 assert.ok((await call({operation:'gate',project:'mcp-test',action:'experiment'})).isError);
 proc.stdin.end();
});
