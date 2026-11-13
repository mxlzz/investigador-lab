// Usage: node tools/prepare-openclaw-github-runtime.mjs <installed-openclaw-root> <portable-destination>
// Copies trusted installed code only. Never reads or copies credential profiles.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const [source,destination]=process.argv.slice(2);
if(process.platform!=='win32'||!source||!destination||!path.isAbsolute(source)||!path.isAbsolute(destination))throw Error('Indicar rutas absolutas de instalación y destino en Windows');
const src=fs.realpathSync(source),dst=path.resolve(destination);
if(dst===src||dst.startsWith(src+path.sep)||src.startsWith(dst+path.sep))throw Error('El destino debe estar separado de la instalación');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const records=[];
function copyFile(from,to){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);const digest=hash(from);if(hash(to)!==digest)throw Error('Hash de copia incorrecto');records.push({path:path.relative(dst,to).replaceAll('\\','/'),sha256:digest});}
function copyTree(from,to){for(const entry of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,entry.name),b=path.join(to,entry.name);if(entry.isDirectory())copyTree(a,b);else if(entry.isFile())copyFile(a,b);else throw Error('Dependencia instalada con enlace inesperado');}}
for(const name of ['@openclaw/fs-safe','@openclaw/fs-safe-win32-x64-msvc','yaml'])copyTree(path.join(src,'node_modules',name),path.join(dst,'node_modules',name));
copyFile(path.join(src,'node_modules/@esbuild/win32-x64/esbuild.exe'),path.join(dst,'esbuild.exe'));
for(const name of ['agents/github-exec-launcher.js','record-coerce-TIsquoVR.mjs','fs-safe-6Z4UiMS4.mjs'])copyFile(path.join(src,'dist',name),path.join(dst,'build-source',name));
const output=path.join(dst,'github-exec-launcher.mjs');
const r=spawnSync(path.join(dst,'esbuild.exe'),[path.join(dst,'build-source/agents/github-exec-launcher.js'),'--bundle','--platform=node','--format=esm','--external:@openclaw/*','--external:yaml','--outfile='+output],{encoding:'utf8',windowsHide:true});
if(r.status!==0)throw Error('No se pudo compilar el launcher portable');
records.push({path:'github-exec-launcher.mjs',sha256:hash(output)});
fs.writeFileSync(path.join(dst,'runtime-manifest.json'),JSON.stringify({source_version:JSON.parse(fs.readFileSync(path.join(src,'package.json'),'utf8')).version,files:records},null,2));
console.log('Runtime preparado y verificado; no se accedió a credenciales.');
