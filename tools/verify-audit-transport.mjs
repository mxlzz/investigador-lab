// Real read-only transport check in a disposable local project. Never schedules a model.
import fs from 'node:fs';
import path from 'node:path';
import {Engine} from '../implementation/engine.mjs';
import {GitHubAudits,auditSummary} from '../implementation/github-audits.mjs';

const [configPath,root]=process.argv.slice(2);
if(!configPath||!root)throw Error('Uso: node tools/verify-audit-transport.mjs OPENCLAW_CONFIG CHECK_ROOT');
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const env=config.mcp?.servers?.investigador?.env;
if(!env)throw Error('No existe configuración MCP investigador');
for(const key of ['INVESTIGADOR_GITHUB_PROFILE','INVESTIGADOR_GITHUB_CREDENTIAL_LAUNCHER','INVESTIGADOR_GITHUB_OWNER'])if(env[key])process.env[key]=env[key];
if(fs.existsSync(root))throw Error('El directorio de comprobación ya existe');
fs.mkdirSync(root,{recursive:true});
fs.cpSync(path.resolve(import.meta.dirname,'../spec'),path.join(root,'spec'),{recursive:true});
fs.copyFileSync(path.resolve(import.meta.dirname,'../audit-inboxes.json'),path.join(root,'audit-inboxes.json'));
const engine=new Engine(root);engine.init('audit-transport-check','Prueba técnica del transporte GitHub; no es una investigación científica');
const client=new GitHubAudits(engine),first=await client.pollAll(),second=await client.pollAll();
const summary=auditSummary(engine.state('audit-transport-check'));
if(first.status!=='ok'||first.imported<1||second.status!=='ok'||second.imported!==0||summary.pending.length!==1)throw Error('No se pudo verificar recepción y deduplicación: '+JSON.stringify({first,second,pending:summary.pending.length}));
console.log(JSON.stringify({status:'ok',first,second,received:summary.pending.map(e=>({id:e.key,url:e.data.comment_url,reviewer:e.data.reviewer})),independence_verified:false,no_model_invoked:true},null,2));
