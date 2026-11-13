import {test} from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {runRemoteExperiment} from '../implementation/remote-experiment-runner.mjs';
import fs from 'node:fs';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'experiments/runner-smoke/manifest.json'),'utf8'));
test('remote runner completes bounded baseline/candidate comparison',async()=>{
 const result=await runRemoteExperiment(root,manifest,{allowLocalForTest:true});
 assert.equal(result.baseline,0.25);assert.equal(result.candidate,0);
 assert.equal(result.provisional,true);assert.equal(result.results.length,2);
 assert.equal(result.results[0].source_sha256.length,64);
});
test('remote runner blocks script path escape and fake experimental metrics',async()=>{
 await assert.rejects(()=>runRemoteExperiment(root,{...manifest,trials:[{id:'baseline',script:'../implementation/engine.mjs',args:[]},manifest.trials[1]]},{allowLocalForTest:true}),/Script fuera/);
 await assert.rejects(()=>runRemoteExperiment(root,{...manifest,timeout_seconds:500},{allowLocalForTest:true}),/Tiempo excede/);
});
