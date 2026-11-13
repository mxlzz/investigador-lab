// Explicit synthetic infrastructure fixture, isolated from real research state.
// No experiment script runs here: all measurements run on GitHub's runner.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {Engine} from '../implementation/engine.mjs';
import {GitHubExperiments} from '../implementation/github-experiments.mjs';
const fixture=path.resolve(import.meta.dirname,'..');
if(process.platform!=='win32'||process.env.INVESTIGADOR_INFRASTRUCTURE_ACCEPTANCE!=='1')throw Error('Requiere aceptación Windows de infraestructura habilitada explícitamente');
const root=path.join(fixture,'.acceptance','github-windows');
fs.mkdirSync(root,{recursive:true});
fs.cpSync(path.join(fixture,'spec'),path.join(root,'spec'),{recursive:true});
const e=new Engine(root),project='infrastructure',key='windows-smoke-plan';
const manifest=JSON.parse(fs.readFileSync(path.join(fixture,'experiments/runner-smoke/manifest.json'),'utf8'));
const c=new GitHubExperiments(e);
if(process.argv[2]==='submit'){
 if(!fs.existsSync(e.dir(project)))e.init(project,'Fixture sintética de infraestructura Windows, sin investigación científica',{visibility:'public'});
 if(!e.state(project).events.some(x=>x.key===key)){
  e.locked(project,()=>{
   e.append(project,'hyp-smoke','hypothesis',{text:'Fixture sintética: una predicción idéntica al conjunto juguete reduce MSE frente al baseline conocido',support_ids:[]});
   e.append(project,'nov-smoke','phase',{output:{phase:'novelty_review',status:'ok',hypothesis_id:'hyp-smoke',recommendation:'experiment'},fixture:true});
   e.append(project,'design-smoke','phase',{output:{phase:'experiment_design',status:'ok',hypothesis_id:'hyp-smoke'},fixture:true});
  });
  e.planExperiment(project,key,{project_id:project,experiment_id:manifest.experiment_id,hypothesis_id:'hyp-smoke',manifest_path:'experiments/runner-smoke/manifest.json',manifest_sha256:crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),source_commit:process.env.INVESTIGADOR_ACCEPTANCE_SOURCE_COMMIT,metric:'mse',direction:'minimize',classification:'public',monetary_budget:0});
 }
 console.log(JSON.stringify(await c.submit(project,key)));
}else if(process.argv[2]==='poll'){
 const result=await c.poll(project,key);
 if(result.status==='imported'&&!e.state(project).completed.includes('evaluation')){
  if(result.baseline!==0.25||result.candidate!==0||result.improvement!==0.25)throw Error('Métricas de infraestructura inesperadas');
  const common={status:'ok',claims:[],artifacts_to_record:[],proposed_next_actions:[],blockers:[]};
  e.accept(project,'windows-evaluation',e.envelope(project,'evaluation'),{...common,phase:'evaluation',experiment_id:result.result_key,interpretability_checks:[{check:'receipt provenance, immutable commit and artifact verified by importer'}],baseline_comparisons:[{metric:'mse',baseline:result.baseline,candidate:result.candidate,improvement:result.improvement}],primary_findings:[{finding:'Circuito Windows → GitHub runner → importación verificado con datos sintéticos'}],limitations:['Prueba de infraestructura; no establece novedad ni validez científica.'],verdict:'supported',recommendation:'Cerrar esta prueba sintética; mantener el motor disponible para un encargo real.'});
  const envelope=e.envelope(project,'next_cycle');
  e.accept(project,'windows-next-cycle',envelope,{...common,phase:'next_cycle',state_snapshot_id:envelope.project_state.lastDigest,candidate_actions:[],selected_action:null,selection_rationale:'La prueba de infraestructura terminó; no hay un nuevo objetivo científico autorizado.',preconditions:[],expected_artifacts:[],budget_check:{monetary_budget:0}});
 }
 console.log(JSON.stringify({...result,evaluated:e.state(project).completed.includes('evaluation'),next_cycle:e.state(project).completed.includes('next_cycle'),fixture:true}));
}else throw Error('Usar submit o poll');
