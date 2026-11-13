import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs';
import {Engine,VERSION} from './engine.mjs';
import {Scheduler} from './scheduler.mjs';
import {searchBibliography,searchOpenAlex,retrieveArxivAbstract} from './bibliography.mjs';
const engine=new Engine(process.env.INVESTIGADOR_ROOT||path.resolve(import.meta.dirname,'..'));
const definition={name:'research',description:'Motor documental Investigador: proyectos, fases, evidencia, informes y planificación. bibliography busca Crossref sin API key y persiste resultados reales; arxiv_abstract recupera resúmenes. No ejecuta experimentos ni publica.',inputSchema:{type:'object',additionalProperties:false,required:['operation'],properties:{operation:{type:'string',enum:['health','projects','init','state','prepare','record','accept','gate','report','bibliography','openalex_bibliography','arxiv_abstract','scheduler','control']},project:{type:'string'},key:{type:'string'},phase:{type:'string'},kind:{type:'string'},request:{type:'string'},visibility:{type:'string',enum:['private','public']},data:{type:'object'},envelope:{type:'object'},output:{type:'object'},day:{type:'string'},action:{type:'string'},query:{type:'string'},url:{type:'string'},enabled:{type:'boolean'},reason:{type:'string'}}}};
async function call(a){if(!a||typeof a!=='object')throw new Error('Argumentos inválidos');for(const k of Object.keys(a))if(!(k in definition.inputSchema.properties))throw new Error('Campo desconocido '+k);switch(a.operation){
 case 'health':return engine.health();
 case 'projects':{const dir=path.join(engine.base,'projects');return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>engine.state(d.name)):[];}
 case 'init':return engine.init(a.project,a.request,{visibility:a.visibility||'private'});
 case 'state':return engine.state(a.project);
 case 'prepare':return engine.envelope(a.project,a.phase);
 case 'record':return engine.record(a.project,a.key,a.kind,a.data||{});
 case 'accept':return engine.accept(a.project,a.key,a.envelope,a.output);
 case 'gate':return engine.gate(a.project,a.action,a.data);
 case 'report':return engine.report(a.day||new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Argentina/Buenos_Aires'}).format(new Date()));
 case 'bibliography':return searchBibliography(engine,a.project,a.query);
 case 'openalex_bibliography':return searchOpenAlex(engine,a.project,a.query);
 case 'arxiv_abstract':return retrieveArxivAbstract(engine,a.project,a.url);
 case 'scheduler':return new Scheduler(engine).status();
 case 'control':return new Scheduler(engine).control(a.project,a.enabled,a.reason,a.data);
 default:throw new Error('Operación desconocida');}}
const send=v=>process.stdout.write(JSON.stringify(v)+'\n');
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of rl){let m;try{if(Buffer.byteLength(line)>2*1024*1024)throw new Error('Mensaje demasiado grande');m=JSON.parse(line);if(!('id'in m))continue;let result;
 switch(m.method){
 case 'initialize':result={protocolVersion:['2024-11-05','2025-03-26','2025-06-18'].includes(m.params?.protocolVersion)?m.params.protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'investigador-engine',version:VERSION}};break;
 case 'ping':result={};break;
 case 'tools/list':result={tools:[definition]};break;
 case 'tools/call':if(m.params?.name!=='research')throw new Error('Herramienta desconocida');try{result={content:[{type:'text',text:JSON.stringify(await call(m.params.arguments))}]};}catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}break;
 default:send({jsonrpc:'2.0',id:m.id,error:{code:-32601,message:'Method not found'}});continue;
 }send({jsonrpc:'2.0',id:m.id,result});
 }catch{send({jsonrpc:'2.0',id:m?.id??null,error:{code:-32600,message:'Invalid request'}});}}
