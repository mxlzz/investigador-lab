import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';
import {Engine} from './engine.mjs';
const save=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});const t=p+'.tmp';fs.writeFileSync(t,JSON.stringify(v,null,2));fs.renameSync(t,p);};
export function textReport(r){return ['Investigador — '+r.day,...r.projects.map(p=>`${p.project}: ${p.completed.length} fases completadas; ${p.changes.length} registros del día. Bloqueos: ${p.blockers.join(', ')}.`)].join('\n').slice(0,3900);}
export function postTelegram(token,chat,text){return new Promise((resolve,reject)=>{
 const body=JSON.stringify({chat_id:chat,text});
 const req=https.request({hostname:'api.telegram.org',path:'/bot'+token+'/sendMessage',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},timeout:20000},res=>{let body='';res.on('data',b=>{body+=b;if(body.length>100000)req.destroy()});res.on('end',()=>{try{const data=JSON.parse(body);if(data.ok&&data.result?.message_id)resolve({message_id:data.result.message_id});else reject(Object.assign(new Error('Telegram rechazó el envío'),{certain:true,retry_after:data.parameters?.retry_after}));}catch{reject(new Error('Acuse no interpretable'))}});});req.on('timeout',()=>req.destroy(new Error('Timeout')));req.on('error',()=>reject(new Error('Resultado de envío incierto')));req.end(body);
 });}
export async function deliver(root,report,send,now=Date.now()){
 const dir=path.join(root,'research-state','outbox');fs.mkdirSync(dir,{recursive:true});const p=path.join(dir,report.day+'.json');const lock=p+'.lock';let fd;try{fd=fs.openSync(lock,'wx')}catch{return {status:'busy'}};
 try{
 let s=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{status:'pending',attempts:0,report_hash:crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex')};
 if(s.status==='sent')return s;
 // A prior send may have reached Telegram even if its acknowledgement was lost.
 // Respect a retry window and reuse the persisted report; never strand it permanently.
 if(s.status==='sending'){s.status='uncertain';s.next_attempt=now+60000;save(p,s);return s;}
 if((s.next_attempt||0)>now)return s;
 // Private content never leaves the workspace through this reporter.
 const publicReport={...report,projects:report.projects.filter(p=>p.visibility==='public')};
 const text=textReport(publicReport)+(report.projects.some(p=>p.visibility!=='public')?'\nHay proyectos privados; sus detalles permanecen en OpenClaw.':'');
 s={...s,status:'sending',attempts:s.attempts+1};save(p,s);
 try{const receipt=await send(text);s={...s,status:'sent',receipt,sent_at:new Date(now).toISOString()};}catch(e){s={...s,status:e.certain?'pending':'uncertain',error:e.message,next_attempt:now+Math.max(60,e.retry_after||Math.min(3600,60*2**Math.min(s.attempts,6)))*1000};}
 save(p,s);return s;
 }finally{fs.closeSync(fd);fs.unlinkSync(lock)}
}
async function main(){const root=process.env.INVESTIGADOR_ROOT||path.resolve(import.meta.dirname,'..');const engine=new Engine(root);const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date());const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Argentina/Buenos_Aires',hour:'2-digit',hourCycle:'h23'}).format(new Date()));if(hour>=20)engine.report(day);
 const reports=path.join(root,'research-state/reports');if(!fs.existsSync(reports))return;
 if(!process.env.INVESTIGADOR_TELEGRAM_TOKEN||!process.env.INVESTIGADOR_TELEGRAM_CHAT_ID){console.log(JSON.stringify({status:'blocked',reason:'telegram_credentials_missing',reports_persisted:true}));return;}
 for(const f of fs.readdirSync(reports).filter(n=>/^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort())console.log(JSON.stringify(await deliver(root,JSON.parse(fs.readFileSync(path.join(reports,f),'utf8')),text=>postTelegram(process.env.INVESTIGADOR_TELEGRAM_TOKEN,process.env.INVESTIGADOR_TELEGRAM_CHAT_ID,text))));
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))main().catch(e=>{console.error(e.message);process.exitCode=1;});
