// JSON-file transport avoids PowerShell/cmd quoting of --params. No shell.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const [file,method,paramsFile]=process.argv.slice(2);
if(!file||!paramsFile||!['cron.list','cron.add','cron.update','cron.run','cron.runs'].includes(method))throw Error('Uso: node tools/openclaw-rpc.mjs setup.local.json cron.list|add|update|run|runs parametros.json');
const setup=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
for(const k of ['node','openclawRoot','configPath','stateRoot'])if(typeof setup[k]!=='string'||!path.isAbsolute(setup[k]))throw Error('Ruta absoluta requerida: '+k);
const params=JSON.stringify(JSON.parse(fs.readFileSync(paramsFile,'utf8').replace(/^\uFEFF/,'')));
const result=spawnSync(setup.node,[path.join(setup.openclawRoot,'openclaw.mjs'),'gateway','call',method,'--params',params,'--json'],{encoding:'utf8',windowsHide:true,shell:false,timeout:60000,maxBuffer:2000000,env:{...process.env,OPENCLAW_CONFIG_PATH:setup.configPath,OPENCLAW_STATE_DIR:setup.stateRoot,OPENCLAW_NO_RESPAWN:'1'}});
if(result.stdout)process.stdout.write(result.stdout);
if(result.stderr)process.stderr.write(result.stderr);
if(result.error)throw Error('No se pudo iniciar el CLI local: '+result.error.code);
process.exitCode=result.status??1;
