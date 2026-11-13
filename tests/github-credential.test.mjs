import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {managedGitHubToken} from '../implementation/github-credential.mjs';
import {GitHubExperiments} from '../implementation/github-experiments.mjs';

test('managed credential capture validates output and suppresses child error secrets',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'inv-credential-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const launcher=path.join(dir,'launcher.mjs'),profile=path.join(dir,'profile');
 fs.writeFileSync(launcher,"process.stdout.write('dummy-test-credential');");
 assert.equal(await managedGitHubToken({launcher,profile}),'dummy-test-credential');
 fs.writeFileSync(launcher,"console.log('dummy-secret');console.error('dummy-secret');process.exit(1);");
 await assert.rejects(managedGitHubToken({launcher,profile}),e=>!e.message.includes('dummy-secret')&&/validar/.test(e.message));
 fs.writeFileSync(launcher,"process.stdout.write('first\\nsecond');");
 await assert.rejects(managedGitHubToken({launcher,profile}),/inválida/);
 await assert.rejects(managedGitHubToken({launcher:'relative.mjs',profile}),/incompleta/);
});

test('managed identity authorizes requests and is omitted from artifact redirects',async()=>{
 const calls=[];
 const c=new GitHubExperiments(null,{credentialProvider:async()=> 'dummy-private',fetcher:async(url,options)=>{
  calls.push({url,options});
  if(calls.length===1)return {status:302,headers:{get:()=> 'https://objects.githubusercontent.com/test'}};
  return {ok:true,arrayBuffer:async()=>new Uint8Array([1,2]).buffer};
 }});
 assert.deepEqual(await c.get('/repos/mxlzz/investigador-lab/actions/artifacts/1/zip',{binary:true}),Buffer.from([1,2]));
 assert.equal(calls[0].options.headers.Authorization,'Bearer dummy-private');
 assert.equal(calls[1].options.headers,undefined);
});

test('read access does not claim dispatch authorization',async()=>{
 const c=new GitHubExperiments(null,{credentialProvider:async()=> 'dummy-private',fetcher:async url=>({ok:true,status:200,json:async()=>url.endsWith('/actions/workflows')?{workflows:[{path:'.github/workflows/investigador-experiment.yml',state:'active'}]}:{full_name:'mxlzz/investigador-lab',permissions:{admin:true}}})});
 assert.deepEqual(await c.status(),{repository:'mxlzz/investigador-lab',authenticated:true,workflow:'active',dispatch_permission:'not_checked'});
});

test('managed identity cannot be sent to an alternate API host',async()=>{
 const c=new GitHubExperiments(null,{api:'https://example.invalid',credentialProvider:async()=> 'dummy-private',fetcher:()=>{throw Error('must not fetch')}});
 await assert.rejects(c.get('/repos/mxlzz/investigador-lab'),/solo puede enviarse/);
});
