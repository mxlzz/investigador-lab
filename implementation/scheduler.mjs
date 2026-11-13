import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const stages=['intake','search_plan','extract_evidence','map_knowledge','hypotheses','novelty_review','experiment_design','report'];
const day=ms=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(ms));
export function documentaryTask(state,workflow='research'){
 const chosen=workflow==='documentary'?stages.filter(s=>!['hypotheses','novelty_review','experiment_design'].includes(s)):stages;
 for(const phase of chosen){if(state.completed.includes(phase))continue;
  if(phase==='extract_evidence'&&!state.events.some(e=>e.kind==='search'))return 'gather_evidence';
  if(phase==='experiment_design'){
   const review=state.events.findLast(e=>e.kind==='phase'&&e.data.output.phase==='novelty_review'&&e.data.output.status==='ok')?.data.output;
   if(review&&!['experiment','replicate_for_validation','differentiate'].includes(review.recommendation))continue;
  }return phase;
 }return null;
}
export class Scheduler{
 constructor(engine){this.engine=engine;this.file=path.join(engine.base,'scheduler.json');this.lock=path.join(engine.base,'scheduler.lock');}
 load(){return fs.existsSync(this.file)?JSON.parse(fs.readFileSync(this.file,'utf8')):{version:1,projects:{},daily:{},lease:null,history:[]};}
 save(s){const p=this.file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(p,JSON.stringify(s,null,2));fs.renameSync(p,this.file);}
 transaction(fn){let fd;try{fd=fs.openSync(this.lock,'wx')}catch{
  const owner=JSON.parse(fs.readFileSync(this.lock,'utf8'));let alive=true;try{process.kill(owner.pid,0)}catch(e){if(e.code==='ESRCH')alive=false;}
  if(alive)throw new Error('Planificador ocupado');fs.renameSync(this.lock,this.lock+'.recovered-'+crypto.randomUUID());fd=fs.openSync(this.lock,'wx');
 }try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));const s=this.load();const result=fn(s);this.save(s);return result;}finally{fs.closeSync(fd);fs.unlinkSync(this.lock);}}
 states(){const dir=path.join(this.engine.base,'projects');return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>this.engine.state(e.name)):[];}
 task(s,p){const config=s.projects[p.project]||{};return config.pending?.length?config.pending[0]:documentaryTask(p,config.workflow);}
 select(s,now){if((s.daily[day(now)]||0)>=24)return null;
  return this.states().filter(p=>s.projects[p.project]?.enabled!==false&&(s.projects[p.project]?.nextAt||0)<=now&&this.task(s,p)).sort((a,b)=>(Number(a.created.priority??1)-Number(b.created.priority??1))||((s.projects[a.project]?.lastAt||0)-(s.projects[b.project]?.lastAt||0))).map(p=>({project:p.project,phase:this.task(s,p),beforeDigest:p.lastDigest,beforeSeq:p.events.length}))[0]||null;
 }
 status(now=Date.now()){const s=this.load();return {policy:{oneProjectPerTick:true,maxAttemptsPerDay:24,leaseMinutes:8,failuresBeforePause:3},lease:s.lease,projects:s.projects,attemptsToday:s.daily[day(now)]||0,next:s.lease&&s.lease.expiresAt>now?null:this.select(s,now),recent:s.history.slice(-10)};}
 control(project,enabled,reason,{workflow,restart_from}={}){this.engine.state(project);if(typeof enabled!=='boolean'||typeof reason!=='string'||!reason.trim())throw new Error('Control requiere enabled boolean y motivo');if(workflow&&!['documentary','research'].includes(workflow))throw new Error('Flujo inválido');return this.transaction(s=>{const mode=workflow||s.projects[project]?.workflow||'research';const sequence=['intake','search_plan','gather_evidence',...stages.slice(2)].filter(p=>mode!=='documentary'||!['hypotheses','novelty_review','experiment_design'].includes(p));if(restart_from&&!sequence.includes(restart_from))throw new Error('Reanudación inválida');s.projects[project]={...s.projects[project],...(workflow?{workflow}:{}),...(restart_from?{pending:sequence.slice(sequence.indexOf(restart_from))}:{}),enabled,reason,failures:0,nextAt:0};return s.projects[project];});}
 claim(now=Date.now()){return this.transaction(s=>{
  if(s.lease&&s.lease.expiresAt>now)return {status:'busy'};
  if(s.lease){s.history.push({...s.lease,outcome:'interrupted',finishedAt:now});s.lease=null;}
  const next=this.select(s,now);if(!next)return {status:'idle'};
  const lease={...next,token:crypto.randomUUID(),startedAt:now,expiresAt:now+8*60000};s.lease=lease;s.daily[day(now)]=(s.daily[day(now)]||0)+1;s.projects[next.project]={...s.projects[next.project],lastAt:now};return {status:'claimed',...lease};
 });}
 finish(token,{error=null}={},now=Date.now()){return this.transaction(s=>{
  if(s.lease?.token!==token)throw new Error('Lease no vigente');const lease=s.lease;const state=this.engine.state(lease.project);const fresh=state.events.filter(e=>e.seq>(lease.beforeSeq??state.events.findIndex(e=>e.digest===lease.beforeDigest)+1));const progressed=lease.phase==='gather_evidence'?fresh.some(e=>e.kind==='search'):fresh.some(e=>e.kind==='phase'&&e.data.output.phase===lease.phase&&e.data.output.status==='ok');const ok=!error&&progressed;
  const last=state.events.findLast(e=>e.kind==='phase')?.data.output;
  const blocked=last?.phase===lease.phase&&last.status==='blocked';const p=s.projects[lease.project]||{};const failures=ok?0:(p.failures||0)+1;
  s.projects[lease.project]={...p,failures,nextAt:ok?now:now+Math.min(3600000,900000*2**(failures-1)),enabled:blocked||failures>=3?false:p.enabled!==false,reason:blocked?last.blockers.join('; '):error||(!progressed?'Sin fase confirmada':p.reason||'Trabajo documental activo')};
  if(ok&&p.pending?.[0]===lease.phase)s.projects[lease.project].pending=p.pending.slice(1);
  const result={...lease,outcome:ok?'progress':blocked?'blocked':'failed',error:error||null,afterDigest:state.lastDigest,finishedAt:now};s.history.push(result);s.history=s.history.slice(-200);s.lease=null;return result;
 });}
}
