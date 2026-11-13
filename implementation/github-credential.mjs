import {execFile} from 'node:child_process';
import path from 'node:path';

// Reuse OpenClaw's validated managed identity. Capture the launcher's output
// privately; never forward child stdout/stderr or put the token in task state.
export function managedGitHubToken({launcher=process.env.INVESTIGADOR_GITHUB_CREDENTIAL_LAUNCHER,profile=process.env.INVESTIGADOR_GITHUB_PROFILE}={}){
 if(!launcher&&!profile)return Promise.resolve(undefined);
 if(!launcher||!profile||!path.isAbsolute(launcher)||!path.isAbsolute(profile))return Promise.reject(Error('Configuración incompleta de identidad GitHub administrada'));
 return new Promise((resolve,reject)=>{
  execFile(process.execPath,[launcher,profile],{encoding:'buffer',timeout:10000,maxBuffer:65536,windowsHide:true},(error,stdout,stderr)=>{
   try{
    if(error)throw Error('No se pudo validar la identidad GitHub administrada; revisar conexión y permisos locales');
    const token=stdout.toString('utf8').trim();
    if(!token||/[\r\n\0]/u.test(token))throw Error('Respuesta inválida de identidad GitHub administrada');
    resolve(token);
   }catch(e){reject(e)}finally{stdout?.fill(0);stderr?.fill(0)}
  });
 });
}
