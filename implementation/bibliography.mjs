import crypto from 'node:crypto';
const digest=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
async function request(url,fetcher){
 const r=await fetcher(url,{headers:{'User-Agent':'InvestigadorLab/0.3 (+https://github.com/mxlzz/investigador-lab)'},signal:AbortSignal.timeout(20000),redirect:'error'});
 if(!r.ok)throw new Error('Fuente HTTP '+r.status+(r.status===429?'; respetar Retry-After y reintentar en otro ciclo':''));
 if(Number(r.headers.get('content-length')||0)>1000000)throw new Error('Fuente excede 1 MB');
 const chunks=[];let bytes=0;for await(const chunk of r.body){const buffer=Buffer.from(chunk);bytes+=buffer.length;if(bytes>1000000)throw new Error('Fuente excede 1 MB');chunks.push(buffer);}return Buffer.concat(chunks).toString('utf8');
}
export async function searchBibliography(engine,project,query,{fetcher=fetch,now=Date.now()}={}){
 if(typeof query!=='string'||!query.trim()||query.length>400)throw new Error('Consulta bibliográfica inválida');
 const state=engine.state(project);if(!state.completed.includes('search_plan'))throw new Error('Aceptar search_plan antes de buscar');
 const existing=state.events.findLast(e=>e.kind==='search'&&e.data.provider==='crossref'&&e.data.query===query&&now-Date.parse(e.data.executed_at)<86400000);
 if(existing)return {cached:true,search_id:existing.key,sources:state.events.filter(e=>existing.data.source_ids.includes(e.key))};
 const url='https://api.crossref.org/works?query.bibliographic='+encodeURIComponent(query)+'&rows=5';
 const raw=JSON.parse(await request(url,fetcher));if(!Array.isArray(raw.message?.items))throw new Error('Respuesta Crossref inválida');
 const timestamp=new Date(now).toISOString();const sources=[];
 for(const item of raw.message.items){if(typeof item.DOI!=='string'||!item.title?.[0])continue;const key='src-'+digest(item.DOI.toLowerCase());let event=engine.state(project).events.find(e=>e.key===key);
  if(!event){const abstract=clean(item.abstract);event=engine.record(project,key,'source',{url:'https://doi.org/'+item.DOI,title:clean(item.title[0]),doi:item.DOI,access_level:abstract?'abstract':'metadata',retrieved_at:timestamp,content:abstract||clean(item.title[0]),retrieval:{provider:'crossref',url,http_status:200,sha256:crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex')},limitations:'Metadatos depositados por editor; no se descargó ni leyó el artículo completo.'});}sources.push(event);
 }
 const key='search-'+digest(query+'|'+timestamp);const event=engine.record(project,key,'search',{query,provider:'crossref',executed_at:timestamp,source_ids:sources.map(s=>s.key),request_url:url,coverage:'Hasta cinco resultados Crossref; no exhaustivo, no búsqueda web general.'});return {cached:false,search_id:event.key,sources};
}
export async function retrieveArxivAbstract(engine,project,url,{fetcher=fetch,now=Date.now()}={}){
 const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='arxiv.org'||!/^\/abs\/(?:\d{4}\.\d{4,5}|[a-z-]+\/\d{7})(?:v\d+)?$/.test(u.pathname)||u.search||u.hash)throw new Error('Solo se admite URL pública canónica arxiv.org/abs/ID');
 engine.state(project);const html=await request(u.href,fetcher);
 const block=html.match(/<blockquote[^>]*class=["'][^"']*abstract[^"']*["'][^>]*>([\s\S]*?)<\/blockquote>/i)?.[1];
 const abstract=clean(block).replace(/^Abstract:\s*/i,'');if(!abstract)throw new Error('No se encontró resumen verificable en la respuesta');
 const key='src-'+digest(u.href);const old=engine.state(project).events.find(e=>e.key===key);if(old)return old;
 return engine.record(project,key,'source',{url:u.href,access_level:'abstract',retrieved_at:new Date(now).toISOString(),content:abstract,retrieval:{provider:'arxiv',http_status:200,sha256:crypto.createHash('sha256').update(html).digest('hex')},limitations:'Solo resumen y página de metadatos. No acredita lectura del paper completo.'});
}
