import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const VERSION='0.2.0';
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
 if(s.oneOf){if(s.oneOf.filter(x=>{try{validate(x,v,p);return true}catch{return false}}).length!==1)fail(p+': oneOf');return;}
 if(s.type){const types=Array.isArray(s.type)?s.type:[s.type];const t=v===null?'null':Array.isArray(v)?'array':typeof v;if(!types.includes(t))fail(p+': type '+types);}
 if('const'in s&&JSON.stringify(v)!==JSON.stringify(s.const))fail(p+': const');
 if(s.enum&&!s.enum.some(x=>JSON.stringify(x)===JSON.stringify(v)))fail(p+': enum');
 if(v&&typeof v==='object'&&!Array.isArray(v)){
  for(const k of s.required||[])if(!(k in v))fail(p+': missing '+k);
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
 locked(project,fn){const d=this.dir(project);fs.mkdirSync(d,{recursive:true});const l=path.join(d,'LOCK');let f;try{f=fs.openSync(l,'wx')}catch{fail('Proyecto ocupado; no romper el bloqueo sin comprobar el proceso')};try{fs.writeFileSync(f,JSON.stringify({pid:process.pid,time:new Date().toISOString()}));return fn();}finally{fs.closeSync(f);fs.unlinkSync(l);}}
 append(project,key,kind,data){id(key);const es=this.events(project);const old=es.find(e=>e.key===key);if(old){if(old.kind!==kind||hash(old.data)!==hash(data))fail('Conflicto de idempotencia');return old;}const body={seq:es.length+1,key,kind,time:new Date().toISOString(),previous:es.at(-1)?.digest||'0',data};const e={...body,digest:hash(body)};const f=fs.openSync(path.join(this.dir(project),'events.jsonl'),'a');try{fs.writeSync(f,JSON.stringify(e)+'\n');fs.fsyncSync(f)}finally{fs.closeSync(f)}return e;}
 init(project,request,{visibility='private',priority=1}={}){if(typeof request!=='string'||!request.trim())fail('Falta pedido literal');if(!['private','public'].includes(visibility))fail('Visibilidad inválida');return this.locked(project,()=>this.append(project,'created','created',{request,visibility,priority,monetaryBudget:0}));}
 state(project){const events=this.events(project);if(!events.length)fail('Proyecto inexistente');return {project,created:events[0].data,events,completed:[...new Set(events.filter(e=>e.kind==='phase'&&e.data.output.status==='ok').map(e=>e.data.output.phase))],lastDigest:events.at(-1).digest};}
 envelope(project,phase){if(!PROMPTS[phase])fail('Fase desconocida');const s=this.state(project);for(const p of PRE[phase]||[])if(!s.completed.includes(p))fail('Falta fase '+p);const load=n=>fs.readFileSync(path.join(this.root,'spec/07-prompts',n),'utf8');const prompts={'00-core.md':load('00-core.md'),[PROMPTS[phase]]:load(PROMPTS[phase])};return {engine:VERSION,project_id:project,task_id:crypto.randomUUID(),phase,approved_scope:s.created.request,user_request:s.created.request,approved_success_criteria:null,approved_permissions:['documentary_research','local_records'],resource_budget:{money:0,experiments:'disabled_without_isolated_runner'},project_state:s,prompts,prompt_hashes:Object.fromEntries(Object.entries(prompts).map(([k,v])=>[k,hash(v)])),output_contract:this.schema.oneOf.find(x=>x.properties.phase.const===phase)};}
 record(project,key,kind,data){if(!['source','search','hypothesis','opportunity','experiment_result','audit'].includes(kind))fail('Tipo desconocido');return this.locked(project,()=>{
  const s=this.state(project);
  if(kind==='source'){if(!['metadata','abstract','full_text','experimentally_verified'].includes(data.access_level))fail('Nivel de lectura obligatorio');const u=new URL(data.url);if(!['http:','https:'].includes(u.protocol))fail('URL inválida');if(!data.content||!data.retrieved_at)fail('Falta contenido accesible o fecha');}
  if(kind==='search'&&(!data.query||!data.executed_at||!Array.isArray(data.source_ids)))fail('Búsqueda incompleta');
  if(kind==='hypothesis'&&(!data.text||!Array.isArray(data.support_ids)))fail('Hipótesis incompleta');
  if(kind==='audit'&&(!['brief','deep'].includes(data.scope)||!Array.isArray(data.findings)||!Array.isArray(data.material_ids)||!data.reviewer||!data.independent))fail('Auditoría requiere revisor independiente, materiales y hallazgos');
  if(kind==='experiment_result')fail('Resultados solo importables por un ejecutor aislado verificado; no instalado');
  const refs=[...(data.support_ids||[]),...(data.source_ids||[]),...(data.material_ids||[])];for(const r of refs)if(!s.events.some(e=>e.key===r))fail('Referencia inexistente '+r);
  return this.append(project,key,kind,data);
 });}
 accept(project,key,envelope,output){return this.locked(project,()=>{
  const s=this.state(project);const old=s.events.find(e=>e.key===key);if(old){if(old.kind!=='phase'||hash(old.data.output)!==hash(output)||hash(old.data.envelope)!==hash(envelope))fail('Conflicto de idempotencia');return old;}
  if(envelope.project_id!==project||envelope.phase!==output.phase||hash(envelope.project_state)!==hash(s))fail('Sobre desactualizado o incompatible');
  const current=this.envelope(project,output.phase);if(hash(envelope.prompts)!==hash(current.prompts)||hash(envelope.prompt_hashes)!==hash(current.prompt_hashes)||hash(envelope.output_contract)!==hash(current.output_contract))fail('Prompt/contrato alterado');
  if(envelope.approved_scope!==s.created.request||hash(envelope.approved_permissions)!==hash(current.approved_permissions)||hash(envelope.resource_budget)!==hash(current.resource_budget))fail('Permisos o alcance alterados');
  validate(this.schema,output);
  const keys=new Set(s.events.map(e=>e.key));for(const c of output.claims){for(const r of c.support_ids)if(!keys.has(r))fail('Evidencia inexistente '+r);if(['observed','source_claim'].includes(c.certainty)&&!c.support_ids.length)fail('Afirmación factual sin evidencia');for(const r of c.support_ids){const e=s.events.find(e=>e.key===r);if(c.certainty==='observed'&&e.kind==='source'&&e.data.access_level!=='experimentally_verified')fail('Una fuente no prueba observación propia');}}
  if(output.phase==='novelty_review'&&output.status==='ok'){if(!s.events.some(e=>e.key===output.hypothesis_id&&e.kind==='hypothesis'))fail('Hipótesis inexistente');if(!output.searches_reviewed.length||output.searches_reviewed.some(k=>!s.events.some(e=>e.key===k&&e.kind==='search')))fail('Revisión requiere búsquedas registradas');}
  if(output.phase==='evaluation'&&output.status==='ok'&&!s.events.some(e=>e.kind==='experiment_result'&&e.key===output.experiment_id))fail('No hay resultados ejecutados verificables');
  return this.append(project,key,'phase',{envelope,output});
 });}
 gate(project,action,data={}){const s=this.state(project);if(action==='experiment'){
  if(!s.completed.includes('novelty_review')||!s.completed.includes('experiment_design'))fail('Falta control de antecedentes/diseño');
  fail('Ejecutor aislado con límites de CPU/RAM e inactividad no disponible; no se ejecuta código externo');
 }if(action==='remote'){if(s.created.visibility!=='public'||data.classification!=='public')fail('Datos privados no admitidos a remoto');fail('Ejecutor remoto y repositorio de proyecto aún no configurados');}
 if(action==='release'){if(s.events.some(e=>e.kind==='audit'&&e.data.findings.some(f=>f.severity==='critical')))fail('Publicación bloqueada por auditoría crítica');fail('Publicación estable requiere autorización humana externa; este motor no publica');}
 fail('Acción desconocida');}
 report(day){if(!/^\d{4}-\d{2}-\d{2}$/.test(day))fail('Fecha inválida');fs.mkdirSync(path.join(this.base,'projects'),{recursive:true});const projects=fs.readdirSync(path.join(this.base,'projects'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>this.state(e.name));const out=path.join(this.base,'reports',day+'.json');if(fs.existsSync(out))return read(out);const report={day,timezone:'America/Argentina/Buenos_Aires',created_at:new Date().toISOString(),projects:projects.map(s=>({project:s.project,visibility:s.created.visibility,request:s.created.request,completed:s.completed,last_digest:s.lastDigest,changes:s.events.filter(e=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(e.time))===day).map(e=>({id:e.key,kind:e.kind})),blockers:['experiments_require_isolated_runner']}))};atomic(out,report);return report;}
 health(){return {version:VERSION,root:this.root,phases:Object.keys(PROMPTS),capabilities:{persistent_journal:true,schema_validation:true,evidence_reference_checks:true,documentary_workflow:true,experiment_runner:false,remote_runner:false,independent_auditor:false,telegram_requires_credentials:true},not_a_security_boundary:true};}
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
