import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {Engine} from '../implementation/engine.mjs';
import {GitHubExperiments} from '../implementation/github-experiments.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'investigador-live-'));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const fixture=path.resolve(import.meta.dirname,'..');
const fail=m=>{throw Error(m)};
try{
 if(process.env.GITHUB_ACTIONS!=='true'||!process.env.GITHUB_SHA||!process.env.INVESTIGADOR_GITHUB_TOKEN)fail('Solo CI autorizado');
 fs.cpSync(path.join(fixture,'spec'),path.join(root,'spec'),{recursive:true});
 const e=new Engine(root),project='infrastructure';
 e.init(project,'Smoke de infraestructura de medición, sin investigación científica',{visibility:'public'});
 e.locked(project,()=>{
  e.append(project,'hyp-smoke','hypothesis',{text:'Una predicción idéntica al conjunto juguete tiene menor error cuadrático',support_ids:[]});
  e.append(project,'nov-smoke','phase',{output:{phase:'novelty_review',status:'ok',hypothesis_id:'hyp-smoke',recommendation:'experiment'}});
  e.append(project,'design-smoke','phase',{output:{phase:'experiment_design',status:'ok',hypothesis_id:'hyp-smoke'}});
 });
 const manifest=JSON.parse(fs.readFileSync(path.join(fixture,'experiments/runner-smoke/manifest.json'),'utf8'));
 const plan={project_id:project,experiment_id:manifest.experiment_id,hypothesis_id:'hyp-smoke',
  manifest_path:'experiments/runner-smoke/manifest.json',manifest_sha256:hash(JSON.stringify(manifest)),
  source_commit:process.env.GITHUB_SHA,metric:'mse',direction:'minimize',
  classification:'public',monetary_budget:0};
 e.planExperiment(project,'smoke-plan',plan);
 const client=new GitHubExperiments(e);
 const submit=await client.submit(project,'smoke-plan');
 if(submit.status!=='requested')fail('Dispatch no confirmado: '+submit.status);
 console.log('Dispatch solicitado con ID '+submit.request_id);
 const until=Date.now()+6*60*1000;let result;
 while(Date.now()<until){
  await new Promise(resolve=>setTimeout(resolve,12000));
  result=await client.poll(project,'smoke-plan');
  console.log('Estado de corrida: '+result.status);
  if(result.status==='imported')break;
  if(result.status==='failed')fail('Workflow remoto falló: '+result.run_id);
 }
 if(result?.status!=='imported')fail('No se importó resultado dentro de la ventana');
 if(result.baseline!==0.25||result.candidate!==0||result.improvement!==0.25)fail('Métricas reales inesperadas');
 const sch=e.schema.oneOf.find(x=>x.properties.phase.const==='evaluation'),output={};
 for(const key of sch.required){const p=sch.properties[key];output[key]=p.const??p.enum?.[0]??(p.type==='array'?[]:p.type==='object'?{}:'');}
 output.status='ok';output.experiment_id=result.result_key;
 e.accept(project,'evaluation-smoke',e.envelope(project,'evaluation'),output);
 if(!e.state(project).completed.includes('evaluation'))fail('Evaluación no persistida');
 console.log(JSON.stringify({ok:true,github_run:result.run_id,experiment_result_key:result.result_key,baseline:result.baseline,candidate:result.candidate,improvement:result.improvement,evaluated:true}));
}finally{
 fs.rmSync(root,{recursive:true,force:true});
}
