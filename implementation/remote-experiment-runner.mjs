import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';

const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const validId=s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(s);
const ensure=(condition,message)=>{if(!condition)throw new Error(message)};
function publicScript(root,script){
 ensure(typeof script==='string'&&/^experiments\/[A-Za-z0-9_./-]+\.mjs$/.test(script),'Script fuera de experiments/');
 const absolute=path.resolve(root,script),real=fs.realpathSync(absolute),base=fs.realpathSync(path.resolve(root,'experiments'));
 ensure(real.startsWith(base+path.sep),'Script fuera del directorio público de experimentos');
 ensure(fs.statSync(real).isFile(),'Script no es archivo');
 return real;
}
function runProcess(script,args,cwd,timeoutMs){
 return new Promise((resolve,reject)=>{
  let settled=false,out='',err='';
  const child=spawn(process.execPath,[script,...args],{cwd,env:{
   PATH:process.env.PATH||'',TZ:'UTC',LANG:'C.UTF-8',NODE_ENV:'production',
   INVESTIGADOR_EXPERIMENT:'1',HOME:process.env.RUNNER_TEMP||'/tmp'
  },shell:false,stdio:['ignore','pipe','pipe']});
  const timer=setTimeout(()=>{child.kill('SIGKILL')},timeoutMs);
  child.stdout.on('data',buf=>{out+=buf;if(out.length>100000)child.kill('SIGKILL')});
  child.stderr.on('data',buf=>{err+=buf;if(err.length>100000)child.kill('SIGKILL')});
  child.once('error',e=>{if(settled)return;settled=true;clearTimeout(timer);reject(e)});
  child.once('close',(code,signal)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(code!==0) return reject(new Error('Trial falló: '+(signal||code)+'; '+err.slice(0,700)));
   try {resolve(JSON.parse(out.trim()))} catch{reject(new Error('Trial no devolvió JSON válido'))}
  });
 });
}
export async function runRemoteExperiment(root,manifest,{allowLocalForTest=false}={}){
 if(!allowLocalForTest)ensure(process.env.GITHUB_ACTIONS==='true','Experimentación solo habilitada en runner GitHub Actions, no en la PC local');
 ensure(manifest&&manifest.version===1&&validId(manifest.experiment_id)&&validId(manifest.project_id),'Manifiesto de experimento inválido');
 ensure(Array.isArray(manifest.trials)&&manifest.trials.length===2,'Se requieren baseline y candidato');
 ensure(typeof manifest.metric==='string'&&/^[a-z][a-z0-9_]{0,79}$/.test(manifest.metric),'Métrica inválida');
 ensure(['maximize','minimize'].includes(manifest.direction),'Dirección de métrica inválida');
 const requestedHash=process.env.INVESTIGADOR_MANIFEST_SHA256;
 if(requestedHash)ensure(digest(JSON.stringify(manifest))===requestedHash,'El manifiesto difiere de la solicitud autorizada');
 const requestedId=process.env.INVESTIGADOR_REQUEST_ID;
 if(requestedId)ensure(/^[0-9a-f-]{36}$/.test(requestedId),'ID de solicitud inválido');
 const timeoutMs=Number(manifest.timeout_seconds||30)*1000;
 ensure(timeoutMs>=1000&&timeoutMs<=180000,'Tiempo excede máximo del runner gratuito');
 const results=[];
 for(let i=0;i<2;i++){
  const trial=manifest.trials[i];
  ensure(trial.id===(i===0?'baseline':'candidate'),'Orden baseline/candidate inválido');
  ensure(Array.isArray(trial.args)&&trial.args.every(s=>typeof s==='string'&&s.length<=200),'Argumentos inválidos');
  const script=publicScript(root,trial.script),content=fs.readFileSync(script),sourceHash=digest(content);
  const started=Date.now(); const response=await runProcess(script,trial.args,root,timeoutMs);
  ensure(response&&response.metrics&&typeof response.metrics==='object','Trial no devolvió métricas');
  const value=response.metrics[manifest.metric];
  ensure(typeof value==='number'&&Number.isFinite(value),'Métrica ausente o no finita');
  results.push({id:trial.id,script:trial.script,source_sha256:sourceHash,duration_ms:Date.now()-started,metric_value:value,reported_metrics:response.metrics});
 }
 const baseline=results[0].metric_value,candidate=results[1].metric_value;
 const improvement=manifest.direction==='minimize'?baseline-candidate:candidate-baseline;
 return {schema_version:1,experiment_id:manifest.experiment_id,project_id:manifest.project_id,source_commit:process.env.INVESTIGADOR_EXPERIMENT_COMMIT||process.env.GITHUB_SHA||null,github_run_id:process.env.GITHUB_RUN_ID||null,github_repository:process.env.GITHUB_REPOSITORY||null,request_id:process.env.INVESTIGADOR_REQUEST_ID||null,metric:manifest.metric,direction:manifest.direction,baseline,candidate,improvement,provisional:improvement>0,results,manifest_sha256:digest(JSON.stringify(manifest)),executed_at:new Date().toISOString(),limitations:'Infraestructura y evaluación numérica básica; no verifica equivalencia estadística, validez científica ni condiciones generales de superioridad.'};
}
async function cli(){
 const root=path.resolve(import.meta.dirname,'..');
 const file=process.argv[2];
 ensure(file&&/^experiments\/[A-Za-z0-9_./-]+\.json$/.test(file),'Se requiere un manifiesto público experiments/**.json');
 const f=path.resolve(root,file);
 ensure(fs.realpathSync(f).startsWith(fs.realpathSync(path.resolve(root,'experiments'))+path.sep),'Manifiesto fuera de experiments/');
 const result=await runRemoteExperiment(root,JSON.parse(fs.readFileSync(f,'utf8')));
 const output=path.resolve(root,'artifacts',result.experiment_id+'.json');
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2));
 process.stdout.write(JSON.stringify({ok:true,output,summary:{metric:result.metric,baseline:result.baseline,candidate:result.candidate,improvement:result.improvement}})+'\n');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))cli().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1});
