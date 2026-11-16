import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {GitHubAPI} from './github-projects.mjs';

export const AUDIT_MARKER='<!-- investigador-audit:v1 -->';
export const AUDIT_PHASES=['search_plan','extract_evidence','map_knowledge','hypotheses','novelty_review','experiment_design','report'];
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const check=(v,m)=>{if(!v)throw Error(m)};
const ident=v=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(v);
const text=(v,max=4000)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const keys=(v,allowed)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>allowed.includes(k));
function atomic(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value,null,2));fs.renameSync(tmp,file);}

export function parseAudit(body){
 if(typeof body!=='string'||!body.trimStart().startsWith(AUDIT_MARKER))return null;
 check(Buffer.byteLength(body)<=65536,'Comentario de auditoría demasiado grande');
 let raw=body.trim().slice(AUDIT_MARKER.length).trim();
 if(raw.startsWith('```json\n')&&raw.endsWith('```'))raw=raw.slice(8,-3).trim();
 const a=JSON.parse(raw);
 check(keys(a,['project','audit_id','audited_commit','findings'])&&ident(a.project)&&ident(a.audit_id)&&/^[a-f0-9]{40}$/.test(a.audited_commit),'Cabecera de auditoría inválida');
 check(Array.isArray(a.findings)&&a.findings.length>0&&a.findings.length<=30,'Hallazgos de auditoría inválidos');
 const ids=new Set();
 for(const f of a.findings){
  check(keys(f,['id','severity','status','claim','evidence','recommendation'])&&ident(f.id)&&!ids.has(f.id),'ID de hallazgo inválido o duplicado');ids.add(f.id);
  check(['critical','high','medium','low','info'].includes(f.severity)&&['open','resolved'].includes(f.status)&&text(f.claim)&&text(f.recommendation),'Hallazgo incompleto');
  check(Array.isArray(f.evidence)&&f.evidence.length>0&&f.evidence.length<=20&&f.evidence.every(e=>text(e,2000)),'Hallazgo o resolución sin evidencia');
 }
 return a;
}

export function auditSummary(state){
 const revisions=state.events.filter(e=>e.kind==='github_audit_comment').sort((a,b)=>Date.parse(a.data.updated_at)-Date.parse(b.data.updated_at)||a.data.comment_id-b.data.comment_id||a.seq-b.seq);
 const reviewed=new Set(state.events.filter(e=>e.kind==='github_audit_review').map(e=>e.data.feedback_id));
 const findings=new Map();
 for(const e of revisions)for(const finding of e.data.audit.findings){
  const id=`${e.data.repository}#${e.data.issue}:${e.data.audit.audit_id}:${finding.id}`;
  findings.set(id,{...finding,finding_id:id,feedback_id:e.key,audited_commit:e.data.audit.audited_commit,comment_url:e.data.comment_url,reviewer:e.data.reviewer});
 }
 return {independence_verified:false,pending:revisions.filter(e=>!reviewed.has(e.key)),findings:[...findings.values()],critical_open:[...findings.values()].filter(f=>f.status==='open'&&f.severity==='critical')};
}

export class GitHubAudits{
 constructor(engine,{api=new GitHubAPI(),publicApi=new GitHubAPI({token:'',credentialProvider:async()=>undefined}),config}={}){this.engine=engine;this.api=api;this.publicApi=publicApi;this.config=config;}
 settings(){
  const file=path.join(this.engine.root,'audit-inboxes.json');
  const c=this.config??(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null);
  if(!c)return null;
  check(c.schema_version===1&&Array.isArray(c.reviewers)&&c.reviewers.length>0&&Array.isArray(c.inboxes)&&c.inboxes.length>0&&c.inboxes.length<=20,'Configuración de auditoría inválida');
  check(c.reviewers.every(r=>/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(r.login)&&Number.isSafeInteger(r.id)&&r.id>0),'Identidad de auditor inválida');
  check(c.inboxes.every(i=>/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}$/.test(i.repository)&&Number.isSafeInteger(i.issue)&&i.issue>0&&(i.project==='*'||ident(i.project))&&(i.public===undefined||typeof i.public==='boolean')),'Buzón inválido');
  return c;
 }
 status(project){
  const file=path.join(this.engine.base,'audit-poll.json');
  const poll=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{status:'not_checked'};
  return {...auditSummary(this.engine.state(project)),poll};
 }
 async pollAll({project}={}){
  if(project)this.engine.state(project);
  const states=project?[this.engine.state(project)]:(()=>{const d=path.join(this.engine.base,'projects');return fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>this.engine.state(e.name)):[]})();
  let config;
  try{config=this.settings()}catch{const result={status:'blocked',checked_at:new Date().toISOString(),error:'Configuración de auditoría inválida'};atomic(path.join(this.engine.base,'audit-poll.json'),result);return result;}
  if(!config)return {status:'not_configured'};
  const results=[];let imported=0;
  for(const inbox of config.inboxes){
   try{
    const api=inbox.public===true?this.publicApi:this.api;
    if(inbox.public===true){const repo=await api.request('/repos/'+inbox.repository);check(repo.private===false,'El buzón público requiere un repositorio público verificable');}
    const base='/repos/'+inbox.repository+'/issues/'+inbox.issue;
    const issue=await api.request(base);check(issue.number===inbox.issue&&!issue.pull_request,'El buzón no es un issue válido');
    // Fetch the complete list before importing. Never advance past a partial page or failure.
    const comments=[];
    for(let page=1;page<=20;page++){
     const rows=await api.request(base+'/comments?per_page=100&page='+page);check(Array.isArray(rows),'Respuesta de comentarios inválida');comments.push(...rows);
     if(rows.length<100)break;
     check(page<20,'Buzón demasiado grande; lectura incompleta');
    }
    let invalid=0,ignored=0;
    for(const c of comments){
     if(!config.reviewers.some(r=>r.id===c.user?.id&&r.login.toLowerCase()===c.user?.login?.toLowerCase())){ignored++;continue;}
     let audit;try{audit=parseAudit(c.body)}catch{invalid++;continue;}
     if(!audit){ignored++;continue;}
     if(inbox.project!=='*'&&audit.project!==inbox.project){ignored++;continue;}
     const state=states.find(s=>s.project===audit.project);if(!state){ignored++;continue;}
     if(!Number.isSafeInteger(c.id)||c.id<1||!Number.isFinite(Date.parse(c.updated_at))){invalid++;continue;}
     const data={repository:inbox.repository,issue:inbox.issue,comment_id:c.id,comment_url:`https://github.com/${inbox.repository}/issues/${inbox.issue}#issuecomment-${c.id}`,updated_at:c.updated_at,reviewer:{login:c.user.login,id:c.user.id},independence_verified:false,audit};
     const key='github-audit-'+hash(data).slice(0,40);
     const added=this.engine.locked(audit.project,()=>{if(this.engine.events(audit.project).some(e=>e.key===key))return false;this.engine.append(audit.project,key,'github_audit_comment',data);return true;});
     if(added)imported++;
    }
    results.push({repository:inbox.repository,issue:inbox.issue,status:'ok',comments:comments.length,invalid,ignored});
   }catch(e){results.push({repository:inbox.repository,issue:inbox.issue,status:'blocked',error:Number.isInteger(e.status)?'GitHub HTTP '+e.status:'No se pudo completar la lectura del buzón'});}
  }
  const result={status:results.some(r=>r.status==='blocked')?'blocked':results.some(r=>r.invalid>0)?'needs_attention':'ok',checked_at:new Date().toISOString(),imported,inboxes:results};
  atomic(path.join(this.engine.base,'audit-poll.json'),result);return result;
 }
 acceptReview(project,output,pending){
  check(keys(output,['reviews'])&&Array.isArray(output.reviews)&&output.reviews.length===pending.length,'La revisión debe responder a todos los comentarios asignados');
  const ids=new Set();
  for(const r of output.reviews){
   check(keys(r,['feedback_id','decision','rationale','evidence_ids','follow_up_phase'])&&pending.some(e=>e.key===r.feedback_id)&&!ids.has(r.feedback_id),'Comentario de revisión inválido o duplicado');ids.add(r.feedback_id);
   check(['accepted','disputed','needs_clarification'].includes(r.decision)&&text(r.rationale)&&Array.isArray(r.evidence_ids),'Decisión de revisión inválida');
   check(r.follow_up_phase===null||(r.decision==='accepted'&&AUDIT_PHASES.includes(r.follow_up_phase)),'Seguimiento fuera del alcance documental');
  }
  return this.engine.locked(project,()=>{
   const state=this.engine.state(project);
   for(const r of output.reviews)check(r.evidence_ids.every(id=>typeof id==='string'&&state.events.some(e=>e.key===id)),'Referencia de revisión inexistente');
   return output.reviews.map(r=>this.engine.append(project,'audit-review-'+hash(r.feedback_id).slice(0,40),'github_audit_review',r));
  });
 }
}
