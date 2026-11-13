import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {Engine} from './engine.mjs';
import {Scheduler} from './scheduler.mjs';
import {GitHubExperiments} from './github-experiments.mjs';
export function cycleMessage(task){return `Continuación documental autorizada. Proyecto: ${task.project}. Paso asignado: ${task.phase}. ID: ${task.token}.
En TODAS las llamadas de este proyecto incluí project="${task.project}", también en accept. Para accept usá key="${task.phase}-${task.token}" y copiá todos los campos required del output_contract; no omitas los arrays vacíos ni budget_check. state_snapshot_id de next_cycle debe ser el project_state.lastDigest del sobre recién preparado, no un hash antiguo dentro del historial.
La salida narrativa no confirma el paso: debés llamar prepare y accept con todos los campos obligatorios del contrato. En next_cycle, si no hay trabajo útil, igual registrá una decisión estructurada con selected_action=null y el state_snapshot_id exacto. No sustituyas esa confirmación por control/pausa. Si accept rechaza un campo, corregí ese campo siguiendo el mensaje y reintentá hasta dos veces; no anuncies éxito sin evento aceptado.
Usá la herramienta MCP investigador research con el nombre y esquema disponibles. Invocala directamente si está expuesta; usá catalog.search y el handle correcto solamente si la sesión está en Code Mode. Primero state. Para fases normales usá prepare; NO uses prepare si el paso es experiment_plan: esa tarea registra un plan con operation=experiment_plan. Si el paso es gather_evidence, leé el search_plan persistido, buscá antecedentes con operation=bibliography (Crossref) y, cuando aporte cobertura adicional, operation=openalex_bibliography (OpenAlex); operation=arxiv_abstract recupera resúmenes de artículos arXiv pertinentes. Cada fuente es solo metadato/resumen hasta comprobar lectura completa. No hace falta una web_search general para usar bibliography. Esas operaciones guardan fuentes y búsquedas reales automáticamente. No registres fuentes Crossref ni arxiv/abs como full_text.
Si el paso asignado es experiment_plan, comprobá hipótesis + control de novedad + diseño registrado; prepará scripts y manifiesto públicos en GitHub dentro del alcance aprobado y un commit inmutable. Después, usá operation=experiment_plan para registrar IDs, SHA256, commit, métrica y clasificación pública; sin código publicado o permiso real, registrá el bloqueo, no inventes plan. No envíes ni ejecutes scripts desde tu PC: experiment_submit y experiment_poll son operaciones automáticas del planificador. Para las otras fases, prepare devuelve el prompt, estado y contrato: respetalos y guardá la salida con accept. Podés pasar envelope={task_id:el_id_devuelto_por_prepare}; el motor recupera el sobre exacto y no tenés que volver a copiar todo el expediente. Usá como key un ID nuevo derivado de la fase y el ID de esta ejecución. No fabriques datos ni uses contenido vacío para pasar validación. Si necesitas registrar una hipótesis o evidencia antes de accept, hacelo y pedí un sobre nuevo después para que el estado no quede desactualizado.
Completá solamente este paso acotado; guardá el progreso. Si no hay evidencia suficiente, registrá needs_evidence o blocked según el contrato. No declares que ejecutaste una acción propuesta. No crees nuevas metas. No ejecutes shell, experimentos, auditoría, cambios de configuración, Telegram ni publicación. Para pausar el proyecto por una dependencia humana real, operation=control, enabled=false y reason concreto. Respondé brevemente qué quedó confirmado y qué falta.`;}
export function runAgent(entry,prompt,{node=process.execPath,project,sessionTag,timeoutMs=210000}={}){return new Promise((resolve,reject)=>{
 const child=spawn(node,[entry,'agent','--agent','investigador','--session-key','agent:investigador:research-'+project+(sessionTag?'-'+sessionTag:''),'--message-file',prompt,'--timeout','180','--json'],{stdio:['ignore','pipe','pipe'],windowsHide:true});let out='',err='';let expired=false;
 const timer=setTimeout(()=>{expired=true;child.kill('SIGTERM');},timeoutMs);const hard=setTimeout(()=>child.kill('SIGKILL'),timeoutMs+10000);
 child.stdout.on('data',b=>{out+=b;if(out.length>2000000)child.kill('SIGTERM')});child.stderr.on('data',b=>{if(err.length<16000)err+=b});
 child.on('error',e=>{clearTimeout(timer);clearTimeout(hard);reject(e)});child.on('close',code=>{clearTimeout(timer);clearTimeout(hard);if(expired||code!==0)reject(new Error(expired?'Timeout del ciclo':'CLI falló; consultar log privado de ciclo'));else{try{const result=JSON.parse(out);if(result.status!=='ok'||result.result?.meta?.aborted)throw Error('Turno no completado');resolve(result);}catch(e){reject(e)}}});
 });}
async function main(){const root=process.env.INVESTIGADOR_ROOT||path.resolve(import.meta.dirname,'..');const engine=new Engine(root);const scheduler=new Scheduler(engine);const task=scheduler.claim();if(task.status!=='claimed'){console.log('NO_REPLY');return;}
 if(['experiment_submit','experiment_poll'].includes(task.phase)){
  let error=null,pending=false;
  try{
   const plans=engine.state(task.project).events.filter(e=>e.kind==='experiment_plan');
   const plan=plans.at(-1);
   if(!plan)throw Error('No se encontró plan experimental vigente');
   const client=new GitHubExperiments(engine);
   const result=task.phase==='experiment_submit'
    ?await client.submit(task.project,plan.key)
    :await client.poll(task.project,plan.key);
   if(['pending_dispatch','running','dispatch_uncertain'].includes(result.status))pending=true;
   if(result.status==='failed')error='Experimento remoto finalizó sin éxito: '+result.conclusion;
   if(!error&&!pending&&!['requested','already_requested','imported'].includes(result.status))error='Estado remoto inesperado: '+result.status;
  }catch(e){error=e.message}
  const finished=scheduler.finish(task.token,{error,pending});
  console.log(JSON.stringify({project:task.project,phase:task.phase,outcome:finished.outcome,error}));
  if(error||finished.outcome==='failed')process.exitCode=1;
  return;
 }
 const entry=process.env.INVESTIGADOR_OPENCLAW_ENTRY;const dir=path.join(engine.base,'runs');fs.mkdirSync(dir,{recursive:true});const prompt=path.join(dir,task.token+'.txt');let error=null;
 // Planning is a pure structured decision: the host owns prepare/accept.
 // This avoids making a model reconstruct tool arguments or replay history.
 const envelope=task.phase==='next_cycle'?engine.envelope(task.project,task.phase):null;
 const message=envelope?'PLANIFICACIÓN ESTRUCTURADA POR EL ORQUESTADOR. El motor ya recuperó y preparó este sobre. Respondé únicamente con el objeto JSON exigido por output_contract, sin markdown ni llamadas a herramientas. El motor validará y persistirá tu decisión; no llames prepare, accept ni control. Incluí todos los campos required. Usá state_snapshot_id='+envelope.project_state.lastDigest+'. Si no hay trabajo útil autorizado, selected_action=null. No inventes metas, evidencia ni ejecución.\n'+JSON.stringify(envelope):cycleMessage(task);
 fs.writeFileSync(prompt,message);
 try{if(!entry||!fs.existsSync(entry))throw Error('Falta ruta del CLI OpenClaw en INVESTIGADOR_OPENCLAW_ENTRY');const result=await runAgent(entry,prompt,{project:task.project,sessionTag:task.token});fs.writeFileSync(path.join(dir,task.token+'.json'),JSON.stringify(result,null,2));if(envelope){let text=(result.result?.payloads||[]).map(p=>p.text||'').join('\n').trim();text=text.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');engine.accept(task.project,task.phase+'-'+task.token,{task_id:envelope.task_id},JSON.parse(text));}}catch(e){error=e.message;}
 const finished=scheduler.finish(task.token,{error});console.log(JSON.stringify({project:task.project,phase:task.phase,outcome:finished.outcome,error}));if(error||finished.outcome==='failed')process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))main().catch(e=>{console.error(e.message);process.exitCode=1;});
