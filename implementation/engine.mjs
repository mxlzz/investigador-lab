import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const VERSION='0.4.0-dev';
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const fail=m=>{throw new Error(m)};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(s)?s:fail('Identificador inválido');
function atomic(p,v){fs.mkdirSync(path.dirname(p),{recursive:true}); const t=p+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(t,JSON.stringify(v,null,2),{flag:'wx'});fs.renameSync(t,p);}

// Validator for every assertion keyword used by the frozen source schema.
// Unknown assertion keywords fail closed rather than silently passing.
export function validate(s,v,p='$'){
 const known=['$schema','$id','title','description','oneOf','type','const','enum','required','properties','additionalProperties','items','uniqueItems'];
 for(const k of Object.keys(s))if(!known.includes(k))fail('Unsupported schema keyword: '+k);
 if(s.oneOf){const selected=s.oneOf.filter(x=>x.properties?.phase?.const===v?.phase&&v?.phase!==undefined);if(selected.length===1){validate(selected[0],v,p);return;}if(s.oneOf.filter(x=>{try{validate(x,v,p);return true}catch{return false}}).length!==1)fail(p+': oneOf');return;}
 if(s.type){const types=Array.isArray(s.type)?s.type:[s.type];const t=v===null?'null':Array.isArray(v)?'array':typeof v;if(!types.includes(t))fail(p+': type '+types);}
 if('const'in s&&JSON.stringify(v)!==JSON.stringify(s.const))fail(p+': const');
 if(s.enum&&!s.enum.some(x=>JSON.stringify(x)===JSON.stringify(v)))fail(p+': enum');
 if(v&&typeof v==='object'&&!Array.isArray(v)){
  const missing=(s.required||[]).filter(k=>!(k in v));if(missing.length)fail(p+': missing '+missing.join(', '));
  for(const [k,x]of Object.entries(v)){if(s.properties?.[k])validate(s.properties[k],x,p+'.'+k);else if(s.additionalProperties===false)fail(p+': unknown '+k);}
 }
 if(Array.isArray(v)){if(s.uniqueItems&&new Set(v.map(x=>JSON.stringify(x))).size!==v.length)fail(p+': duplicates');if(s.items)v.forEach((x,i)=>validate(s.items,x,p+'['+i+']'));}
}

const PROMPTS={intake:'01-intake.md',search_plan:'02-search-plan.md',extract_evidence:'03-extract-evidence.md',map_knowledge:'04-map-knowledge.md',hypotheses:'05-hypotheses.md',novelty_review:'06-novelty-gate.md',experiment_design:'07-experiment-design.md',evaluation:'08-evaluate.md',next_cycle:'09-next-cycle.md',report:'10-report.md',audit:'11-audit.md'};
const PRE={search_plan:['intake'],extract_evidence:['search_plan'],map_knowledge:['extract_evidence'],hypotheses:['map_knowledge'],novelty_review:['hypotheses'],experiment_design:['novelty_review'],evaluation:['experiment_design'],next_cycle:['intake'],report:['intake'],audit:['intake']};

export class Engine{
 constructor(root){this.root=path.resolve(root);this.base=path.join(this.root,'research-state');fs.mkdirSync(this.base,{recursive:true});this.schema=read(path.join(this.root,'spec/schemas/phase-result.schema.json'));}
 dir(project){return path.join(this.base,'projects',id(project));}
 events(project){const p=path.join(this.dir(project),'events.jsonl');if(!fs.existsSync(p))return [];let prev='0';return fs.readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(line=>{const e=JSON.parse(line);const {digest,...body}=e;if(body.previous!==prev||hash(body)!==digest)fail('Journal corrupto');prev=digest;return e;});}
 locked(project,fn,create=false){const d=this.dir(project);if(create)fs.mkdirSync(d,{recursive:true});else if(!fs.existsSync(d))fail('Proyecto inexistente');const l=path.join(d,'LOCK');let f;try{f=fs.openSync(l,'wx')}catch{const owner=JSON.parse(fs.readFileSync(l,'utf8'));let alive=true;try{process.kill(owner.pid,0)}catch(e){if(e.code==='ESRCH')alive=false;}if(alive)fail('Proyecto ocupado; no romper el bloqueo sin comprobar el proceso');fs.renameSync(l,l+'.recovered-'+crypto.randomUUID());f=fs.openSync(l,'wx');}try{fs.writeFileSync(f,JSON.stringify({pid:process.pid,time:new Date().toISOString()}));return fn();}finally{fs.closeSync(f);fs.unlinkSync(l);}}
 append(project,key,kind,data){id(key);const es=this.events(project);const old=es.find(e=>e.key===key);if(old){if(old.kind!==kind||hash(old.data)!==hash(data))fail('Conflicto de idempotencia');return old;}const body={seq:es.length+1,key,kind,time:new Date().toISOString(),previous:es.at(-1)?.digest||'0',data};const e={...body,digest:hash(body)};const f=fs.openSync(path.join(this.dir(project),'events.jsonl'),'a');try{fs.writeSync(f,JSON.stringify(e)+'\n');fs.fsyncSync(f)}finally{fs.closeSync(f)}return e;}
 init(project,request,{visibility='private',priority=1}={}){if(typeof request!=='string'||!request.trim())fail('Falta pedido literal');if(!['private','public'].includes(visibility))fail('Visibilidad inválida');return this.locked(project,()=>this.append(project,'created','created',{request,visibility,priority,monetaryBudget:0}),true);}
 state(project){const events=this.events(project);if(!events.length)fail('Proyecto inexistente');return {project,created:events[0].data,events,completed:[...new Set(events.filter(e=>e.kind==='phase'&&e.data.output.status==='ok').map(e=>e.data.output.phase))],lastDigest:events.at(-1).digest};}
 envelope(project,phase,persist=true){if(!PROMPTS[phase])fail('Fase desconocida');const s=this.state(project);for(const p of PRE[phase]||[])if(!s.completed.includes(p))fail('Falta fase '+p);const load=n=>fs.readFileSync(path.join(this.root,'spec/07-prompts',n),'utf8');const prompts={'00-core.md':load('00-core.md'),[PROMPTS[phase]]:load(PROMPTS[phase])};const result={engine:VERSION,project_id:project,task_id:crypto.randomUUID(),phase,approved_scope:s.created.request,user_request:s.created.request,approved_success_criteria:null,approved_permissions:['documentary_research','local_records'],resource_budget:{money:0,experiments:'disabled_without_isolated_runner'},project_state:s,prompts,prompt_hashes:Object.fromEntries(Object.entries(prompts).map(([k,v])=>[k,hash(v)])),output_contract:this.schema.oneOf.find(x=>x.properties.phase.const===phase)};if(persist)atomic(path.join(this.dir(project),'envelopes',result.task_id+'.json'),result);return result;}
 record(project,key,kind,data){if(!['source','search','hypothesis','opportunity','experiment_result','audit'].includes(kind))fail('Tipo desconocido');return this.locked(project,()=>{
  const s=this.state(project);
  if(kind==='source'){if(!['metadata','abstract','full_text'].includes(data.access_level))fail('Nivel de lectura documental obligatorio; verificación experimental no disponible');const u=new URL(data.url);if(!['http:','https:'].includes(u.protocol))fail('URL inválida');if(data.access_level==='full_text'&&((u.hostname==='arxiv.org'&&u.pathname.startsWith('/abs/'))||data.retrieval?.provider==='crossref'))fail('Un resumen o metadatos no son texto completo');if(!data.content||!data.retrieved_at)fail('Falta contenido accesible o fecha');}
  if(kind==='search'&&(!data.query||!data.executed_at||!Array.isArray(data.source_ids)))fail('Búsqueda incompleta');
  if(kind==='hypothesis'&&(!data.text||!Array.isArray(data.support_ids)))fail('Hipótesis incompleta');
  if(kind==='audit'&&(!['brief','deep'].includes(data.scope)||!Array.isArray(data.findings)||!Array.isArray(data.material_ids)||!data.reviewer||!data.independent))fail('Auditoría requiere revisor independiente, materiales y hallazgos');
  if(kind==='experiment_result')fail('Resultados solo importables por un ejecutor aislado verificado; no instalado');
  const refs=[...(data.support_ids||[]),...(data.source_ids||[]),...(data.material_ids||[])];for(const r of refs)if(!s.events.some(e=>e.key===r))fail('Referencia inexistente '+r);
  return this.append(project,key,kind,data);
 });}

 // Materialize literal proposals from a confirmed phase, not new scientific
 // claims. Keep empty support empty and preserve the proposal's provenance.
 materializeHypotheses(project){return this.locked(project,()=>{
  const events=this.state(project).events;
  const phase=events.findLast(e=>e.kind==='phase'&&e.data.output.phase==='hypotheses'&&e.data.output.status==='ok');
  if(!phase)fail('Falta una fase de hipótesis confirmada');
  const candidates=phase.data.output.candidates||[];
  const proposals=candidates.map((candidate,index)=>{
   const text=candidate.statement??candidate.text;
   if(typeof text!=='string'||!text.trim())fail('La propuesta de hipótesis no contiene statement/text');
   const support=candidate.support_ids??[];
   if(!Array.isArray(support)||support.some(k=>!events.some(e=>e.key===k)))fail('La propuesta referencia evidencia inexistente');
   return {key:'hypothesis-'+hash(phase.key+':'+index+':'+(candidate.id??'')).slice(0,32),data:{text,support_ids:support,origin:{phase_event:phase.key,candidate_id:candidate.id??null}}};
  });
  return proposals.map(p=>this.append(project,p.key,'hypothesis',p.data));
 });}

 // The model may submit a public experiment plan but cannot invent execution.
 planExperiment(project,key,data){return this.locked(project,()=>{
  const s=this.state(project);
  if(s.created.visibility!=='public')fail('Experimento remoto requiere proyecto expresamente público');
  if(!s.completed.includes('novelty_review')||!s.completed.includes('experiment_design'))fail('Faltan novedad comprobada o diseño experimental');
  if(!data||data.project_id!==project||typeof data.experiment_id!=='string'||!/^[-_A-Za-z0-9]{1,80}$/.test(data.experiment_id))fail('Identidad de experimento inválida');
  if(typeof data.manifest_path!=='string'||!/^experiments\/[A-Za-z0-9_-]+\/manifest\.json$/.test(data.manifest_path))fail('Manifiesto fuera de directorio público');
  if(!/^[0-9a-f]{40}$/.test(data.source_commit||'')||!/^[0-9a-f]{64}$/.test(data.manifest_sha256||''))fail('Se exige commit y SHA256 exactos');
  if(!/^[a-z][a-z0-9_]{0,79}$/.test(data.metric||'')||!['minimize','maximize'].includes(data.direction))fail('Métrica y criterio de comparación inválidos');
  if(data.classification!=='public'||data.monetary_budget!==0)fail('Solo código/datos públicos, gasto cero');
  const h=s.events.find(e=>e.key===data.hypothesis_id&&e.kind==='hypothesis');
  if(!h)fail('Hipótesis registrada inexistente');
  const novelty=s.events.findLast(e=>e.kind==='phase'&&e.data.output.phase==='novelty_review'&&e.data.output.status==='ok'&&e.data.output.hypothesis_id===data.hypothesis_id)?.data.output;
  const design=s.events.findLast(e=>e.kind==='phase'&&e.data.output.phase==='experiment_design'&&e.data.output.status==='ok'&&e.data.output.hypothesis_id===data.hypothesis_id)?.data.output;
  if(!novelty||!design||!['experiment','replicate_for_validation','differentiate'].includes(novelty.recommendation))fail('Antecedentes y diseño no autorizan prueba');
  if(s.events.some(e=>e.kind==='experiment_plan'&&e.data.experiment_id===data.experiment_id&&e.key!==key))fail('ID experimental ya usado');
  return this.append(project,key,'experiment_plan',{
   project_id:project,experiment_id:data.experiment_id,hypothesis_id:data.hypothesis_id,
   manifest_path:data.manifest_path,manifest_sha256:data.manifest_sha256,
   source_commit:data.source_commit,metric:data.metric,direction:data.direction,
   classification:'public',monetary_budget:0,design_event_key:s.events.findLast(e=>e.kind==='phase'&&e.data.output===design)?.key||null
  });
 });}
 experimentDispatch(project,key,data){return this.locked(project,()=>{
  const s=this.state(project),plan=s.events.find(e=>e.key===data?.plan_key&&e.kind==='experiment_plan');
  if(!plan)fail('Plan experimental inexistente');
  if(s.events.some(e=>e.kind==='experiment_dispatch'&&e.data.plan_key===data.plan_key&&e.key!==key))fail('El experimento ya tiene solicitud de ejecución');
  if(typeof data.request_id!=='string'||!/^[0-9a-f-]{36}$/.test(data.request_id)||data.workflow!=='investigador-experiment.yml')fail('Solicitud remota inválida');
  if(typeof data.repository!=='string'||!/^[-.\w]+\/[-.\w]+$/.test(data.repository))fail('Repo inválido');
  return this.append(project,key,'experiment_dispatch',data);
 });}
 // Restricted internal API: MCP exposes only experiment_poll, never direct import.
 importVerifiedExperiment(project,key,data){return this.locked(project,()=>{
  const s=this.state(project),plan=s.events.find(e=>e.key===data?.plan_key&&e.kind==='experiment_plan');
  const dispatch=s.events.find(e=>e.key===data?.dispatch_key&&e.kind==='experiment_dispatch'&&e.data.plan_key===data.plan_key);
  if(!plan||!dispatch)fail('No hay plan y solicitud vinculados');
  const r=data.receipt,g=data.github;
  if(!r||!g||r.project_id!==project||r.experiment_id!==plan.data.experiment_id||
    r.manifest_sha256!==plan.data.manifest_sha256||r.source_commit!==plan.data.source_commit||
    r.request_id!==dispatch.data.request_id||r.github_repository!==dispatch.data.repository||
    String(r.github_run_id)!==String(g.run_id)||g.repository!==dispatch.data.repository||
    g.workflow!==dispatch.data.workflow||g.conclusion!=='success')fail('Evidencia experimental incompatible con solicitud');
  if(r.metric!==plan.data.metric||r.direction!==plan.data.direction||!Array.isArray(r.results)||
    r.results.length!==2||r.results[0]?.id!=='baseline'||r.results[1]?.id!=='candidate')fail('Resultados no reproducen el contrato');
  if(![r.baseline,r.candidate,r.improvement].every(Number.isFinite)||!Number.isSafeInteger(g.run_id))fail('Métricas o identificador de ejecución inválido');
  if(s.events.some(e=>e.kind==='experiment_result'&&e.data.plan_key===data.plan_key&&e.key!==key))fail('El plan ya tiene resultado importado');
  return this.append(project,key,'experiment_result',{
   plan_key:data.plan_key,dispatch_key:data.dispatch_key,hypothesis_id:plan.data.hypothesis_id,
   experiment_id:plan.data.experiment_id,metric:r.metric,direction:r.direction,
   baseline:r.baseline,candidate:r.candidate,improvement:r.improvement,provisional:r.provisional,
   source_commit:r.source_commit,manifest_sha256:r.manifest_sha256,
   raw_receipt:r,github:g,verified_at:data.verified_at,
   limitations:'Resultado observado en GitHub Actions para esta ejecución; superioridad general o causalidad todavía requieren evaluación.'
  });
 });}
 accept(project,key,envelope,output){return this.locked(project,()=>{
  if(envelope&&Object.keys(envelope).length===1&&envelope.task_id)envelope=read(path.join(this.dir(project),'envelopes',id(envelope.task_id)+'.json'));
  const s=this.state(project);const old=s.events.find(e=>e.key===key);if(old){if(old.kind!=='phase'||hash(old.data.output)!==hash(output)||(old.data.envelope_digest||hash(old.data.envelope))!==hash(envelope))fail('Conflicto de idempotencia');return old;}
  if(!output||typeof output.phase!=='string')fail('Falta output.phase; fase esperada: '+envelope.phase);
  const scheduleFile=path.join(this.base,'scheduler.json');const lease=fs.existsSync(scheduleFile)?read(scheduleFile).lease:null;if(lease?.project===project&&lease.expiresAt>Date.now()&&lease.phase!==output.phase)fail('El ciclo solo autoriza la fase asignada: '+lease.phase);
  if(envelope.project_id!==project||envelope.phase!==output.phase||hash(envelope.project_state)!==hash(s))fail('Sobre desactualizado o incompatible');
  const current=this.envelope(project,output.phase,false);if(hash(envelope.prompts)!==hash(current.prompts)||hash(envelope.prompt_hashes)!==hash(current.prompt_hashes)||hash(envelope.output_contract)!==hash(current.output_contract))fail('Prompt/contrato alterado');
  if(envelope.approved_scope!==s.created.request||hash(envelope.approved_permissions)!==hash(current.approved_permissions)||hash(envelope.resource_budget)!==hash(current.resource_budget))fail('Permisos o alcance alterados');
  validate(this.schema,output);
  // A syntactically valid empty JSON must not advance a real investigation.
  if(output.status==='ok'){
   const nonempty=v=>typeof v==='string'&&v.trim().length>0;
   if(output.phase==='intake'&&!nonempty(output.request_summary))fail('Interpretación del encargo vacía');
   if(output.phase==='search_plan'&&(!output.planned_queries.some(q=>q&&nonempty(q.query))))fail('Plan sin ninguna consulta concreta');
   if(output.phase==='map_knowledge'){
    if(!s.events.some(e=>e.kind==='source'))fail('Mapa sin evidencia documental recuperada');
    if(!output.supported_findings.length&&!output.open_questions.length&&!output.coverage_gaps.length)fail('Mapa sin hallazgos, preguntas ni brechas');
   }
   if(output.phase==='hypotheses'&&!output.candidates.length&&!output.reasons_not_to_test_yet.length)fail('No hay hipótesis ni razón para aplazarlas');
   if(output.phase==='experiment_design'&&(!output.baselines.length||!output.metrics_and_criteria.length))fail('Experimento sin baseline ni métricas');
   if(output.phase==='report'&&!nonempty(output.summary))fail('Informe sin contenido');
  }
  const keys=new Set(s.events.map(e=>e.key));for(const c of output.claims){for(const r of c.support_ids)if(!keys.has(r))fail('Evidencia inexistente '+r);if(['observed','source_claim'].includes(c.certainty)&&!c.support_ids.length)fail('Afirmación factual sin evidencia');for(const r of c.support_ids){const e=s.events.find(e=>e.key===r);if(c.certainty==='observed'&&e.kind==='source'&&e.data.access_level!=='experimentally_verified')fail('Una fuente no prueba observación propia');}}
  if(output.phase==='extract_evidence'&&output.status==='ok'){const source=s.events.find(e=>e.kind==='source'&&(e.key===output.source_identifier||e.data.url===output.source_identifier));if(!source||source.data.access_level!==output.access_level)fail('Nivel de lectura o fuente incompatible con el registro recuperado');}
  if(output.phase==='novelty_review'&&output.status==='ok'){if(!s.events.some(e=>e.key===output.hypothesis_id&&e.kind==='hypothesis'))fail('Hipótesis inexistente');if(output.searches_reviewed.some(r=>typeof r.search_id!=='string'))fail('Cada búsqueda revisada requiere search_id del expediente');if(!output.searches_reviewed.length||output.searches_reviewed.some(r=>!s.events.some(e=>e.key===r.search_id&&e.kind==='search')))fail('Revisión requiere búsquedas registradas');}
  if(output.phase==='evaluation'&&output.status==='ok'&&!s.events.some(e=>e.kind==='experiment_result'&&e.key===output.experiment_id))fail('No hay resultados ejecutados verificables');
  if(output.phase==='next_cycle'&&output.status==='ok'){
   if(output.state_snapshot_id!==s.lastDigest)fail('Estado de siguiente ciclo no coincide con expediente confirmado');
   if(output.selected_action!==null){
    const allowed=['search_plan','extract_evidence','map_knowledge','hypotheses','novelty_review','experiment_design','report'];
    if(!output.selected_action||!allowed.includes(output.selected_action.phase))fail('Acción de siguiente ciclo no autorizada');
    if(!output.selection_rationale?.trim()||!output.expected_artifacts?.length)fail('El nuevo ciclo requiere justificación y resultado esperado');
   }
  }
  return this.append(project,key,'phase',{envelope:{engine:envelope.engine,task_id:envelope.task_id,phase:envelope.phase,state_digest:s.lastDigest,approved_scope:envelope.approved_scope,prompt_hashes:envelope.prompt_hashes},envelope_digest:hash(envelope),output});
 });}
 gate(project,action,data={}){const s=this.state(project);if(action==='experiment'){
  const plan=s.events.find(e=>e.key===data.plan_key&&e.kind==='experiment_plan');
  if(!plan||s.created.visibility!=='public')fail('Solo plan público de GitHub Actions registrado');
  return {allowed:true,mode:'github_actions_public',plan_key:plan.key,monetary_budget:0};
 }if(action==='remote'){if(s.created.visibility!=='public'||data.classification!=='public')fail('Datos privados no admitidos a remoto');fail('Ejecutor remoto y repositorio de proyecto aún no configurados');}
 if(action==='release'){if(s.events.some(e=>e.kind==='audit'&&e.data.findings.some(f=>f.severity==='critical')))fail('Publicación bloqueada por auditoría crítica');fail('Publicación estable requiere autorización humana externa; este motor no publica');}
 fail('Acción desconocida');}
 report(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))fail('Fecha inválida');fs.mkdirSync(path.join(this.base,'projects'),{recursive:true});const projects=fs.readdirSync(path.join(this.base,'projects'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>this.state(e.name));const out=path.join(this.base,'reports',day+'.json');if(fs.existsSync(out))return read(out);const report={day,timezone:'America/Argentina/Buenos_Aires',created_at:new Date().toISOString(),projects:projects.map(s=>({project:s.project,visibility:s.created.visibility,request:s.created.request,completed:s.completed,last_digest:s.lastDigest,changes:s.events.filter(e=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(e.time))===day).map(e=>({id:e.key,kind:e.kind})),blockers:['experiments_require_isolated_runner']}))};atomic(out,report);return report;}
 health(){return {version:VERSION,root:this.root,phases:Object.keys(PROMPTS),capabilities:{project_repositories:'private_auto_or_existing',github_sources:'pinned_read_only',github_sync:'project_branch',persistent_journal:true,schema_validation:true,evidence_reference_checks:true,documentary_workflow:true,bibliographic_search:'crossref',scheduler_queue:true,experiment_runner:'github_actions_public_with_authorization',remote_runner:'github_actions_public_only',independent_auditor:false,telegram_requires_credentials:true},not_a_security_boundary:true};}
}

async function main(){const [cmd,...args]=process.argv.slice(2);const root=process.env.INVESTIGADOR_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const e=new Engine(root);let out;
 switch(cmd){
 case 'health':out=e.health();break;
 case 'init':out=e.init(args[0],fs.readFileSync(args[1],'utf8'),args[2]?read(args[2]):{});break;
 case 'state':out=e.state(args[0]);break;
 case 'prepare':out=e.envelope(args[0],args[1]);if(args[2])atomic(path.resolve(args[2]),out);break;
 case 'record':out=e.record(args[0],args[1],args[2],read(args[3]));break;
 case 'accept':out=e.accept(args[0],args[1],read(args[2]),read(args[3]));break;
 case 'gate':out=e.gate(args[0],args[1],args[2]?read(args[2]):{});break;
 case 'report':out=e.report(args[0]||new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date()));break;
 default:fail('Comandos: health | init ID pedido.txt [opciones.json] | state ID | prepare ID fase [sobre.json] | record ID KEY tipo datos.json | accept ID KEY sobre.json salida.json | gate ID acción | report [YYYY-MM-DD]');
 }console.log(JSON.stringify({ok:true,result:out},null,2));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(err=>{console.error(JSON.stringify({ok:false,error:err.message}));process.exitCode=1;});
