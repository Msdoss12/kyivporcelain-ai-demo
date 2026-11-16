import {systemPrompt} from '../knowledge.js';
export default {
 async fetch(request, env) {
  const origin=request.headers.get('Origin');
  if(!env.ALLOWED_ORIGIN || origin!==env.ALLOWED_ORIGIN)return new Response('Origin not allowed',{status:403});
  const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':env.ALLOWED_ORIGIN,'Vary':'Origin','Cache-Control':'no-store'};
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'}});
  if(request.method!=='POST'||new URL(request.url).pathname!=='/chat')return reply({error:'Not found'},404);
  if(!env.CHAT_LIMITER||!env.AI)return reply({error:'AI service not configured'},503);
  if(!(await env.CHAT_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return reply({error:'Забагато запитів. Спробуйте за хвилину.'},429);
  if(Number(request.headers.get('Content-Length')||0)>12000)return reply({error:'Request too large'},413);
  const reader=request.body?.getReader();if(!reader)return reply({error:'Missing body'},400);
  let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>12000){await reader.cancel();return reply({error:'Request too large'},413);}chunks.push(value);}
  let data;try{const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}data=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply({error:'Invalid JSON'},400);}
  if(!Array.isArray(data.messages)||data.messages.length<1||data.messages.length>5||data.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>1800)||data.messages.at(-1).role!=='user')return reply({error:'Invalid messages'},400);
  try{
   const result=await env.AI.run('@cf/meta/llama-3.1-8b-instruct',{messages:[{role:'system',content:systemPrompt},...data.messages],max_tokens:400,temperature:0.3});
   if(!result.response)return reply({error:'Модель не повернула відповіді.'},502);
   return reply({response:result.response});
  }catch{return reply({error:'AI тимчасово недоступний або вичерпано безкоштовний ліміт. Спробуйте пізніше.'},503);}
 }
};
