// Generates local configuration fragments. Does not install an agent, change the
// Gateway, touch credentials, register jobs, or copy a personal configuration.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const required=['node','openclawRoot','configPath','stateRoot','workspace','githubProfile','githubRuntime','githubOwner'];
export function setupFiles(input){
 const allowed=[...required,'githubRepo','model','codeModeEnabled'];
 if(!input||typeof input!=='object'||Object.keys(input).some(k=>!allowed.includes(k)))throw Error('Campos desconocidos; nunca pasar tokens, claves ni configuraciones privadas completas');
 for(const k of required)if(typeof input[k]!=='string'||!input[k])throw Error('Falta '+k);
 const windows=path.win32.isAbsolute(input.node),p=windows?path.win32:path;
 for(const k of required.filter(k=>k!=='githubOwner'))if(!p.isAbsolute(input[k]))throw Error('Ruta absoluta requerida: '+k);
 if(!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(input.githubOwner))throw Error('Propietario GitHub inválido');
 const repo=input.githubRepo||input.githubOwner+'/investigador-lab';
 if(!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_][A-Za-z0-9_.-]{0,99}$/.test(repo))throw Error('Repositorio de infraestructura inválido');
 if(input.codeModeEnabled!==undefined&&typeof input.codeModeEnabled!=='boolean')throw Error('codeModeEnabled debe ser boolean');
 if(input.model!==undefined&&(typeof input.model!=='string'||!input.model.trim()))throw Error('Modelo inválido');
 for(const [key,value]of Object.entries(input))if(typeof value==='string'){
  // OpenClaw names managed profile directories ghp_<32 hex>. That basename is
  // a non-secret profile ID, not the actual GitHub token stored inside it.
  const checked=key==='githubProfile'&&/^ghp_[0-9a-f]{32}$/.test(p.basename(value))?p.dirname(value):value;
  if(/(?:github_pat_[A-Za-z0-9_]{15,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY-----)/.test(checked))throw Error('Posible credencial en la entrada; usar solo rutas y nombres');
 }
 const entry=p.join(input.openclawRoot,'openclaw.mjs');
 const env={INVESTIGADOR_ROOT:input.workspace,INVESTIGADOR_GITHUB_OWNER:input.githubOwner,INVESTIGADOR_GITHUB_REPO:repo,INVESTIGADOR_GITHUB_PROFILE:input.githubProfile,INVESTIGADOR_GITHUB_CREDENTIAL_LAUNCHER:p.join(input.githubRuntime,'github-exec-launcher.mjs')};
 const agent={workspace:input.workspace,...input.model?{model:input.model}:{}};
 const fragment={agents:{entries:{investigador:agent}},mcp:{servers:{investigador:{transport:'stdio',command:input.node,cwd:input.workspace,args:[p.join(input.workspace,'implementation','mcp-server.mjs')],env}}},...(input.codeModeEnabled!==undefined?{tools:{codeMode:{enabled:input.codeModeEnabled}}}:{})};
 const job={name:'investigador-documental-local',agentId:'investigador',enabled:false,schedule:{kind:'every',everyMs:900000},sessionTarget:'isolated',wakeMode:'now',payload:{kind:'command',argv:[input.node,p.join(input.workspace,'implementation','scheduler-tick.mjs')],cwd:input.workspace,env:{...env,INVESTIGADOR_OPENCLAW_ENTRY:entry},timeoutSeconds:240,noOutputTimeoutSeconds:230,outputMaxBytes:65536},delivery:{mode:'none'}};
 return {fragment,job};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [file,destination]=process.argv.slice(2);
 if(!file||!destination)throw Error('Uso: node tools/openclaw-setup-files.mjs setup.local.json directorio-local');
 const input=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')),result=setupFiles(input);
 fs.mkdirSync(destination,{recursive:true});
 fs.writeFileSync(path.join(destination,'openclaw-fragment.json'),JSON.stringify(result.fragment,null,2));
 fs.writeFileSync(path.join(destination,'job-create.json'),JSON.stringify(result.job,null,2));
 console.log('Fragmentos locales generados. Revisar y aplicar según docs/REPLICAR_EN_WINDOWS.md; el Gateway no fue modificado.');
}
