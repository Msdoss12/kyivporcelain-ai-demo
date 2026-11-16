import { systemPrompt, sources } from './knowledge.js';
import {API_ENDPOINT} from './config.js';
const $ = id => document.getElementById(id);
let engine, worker, busy = false, loading = false;
let history = [];
for (const [label, href] of sources) { const a=document.createElement('a'); a.href=href; a.textContent=label+' ↗'; a.target='_blank'; a.rel='noopener noreferrer'; $('sources').append(a); }
function state(text) { $('status').textContent=text; }
function controls() { $('send').disabled=!engine || busy; $('question').disabled=!engine || busy; $('reset').disabled=!engine || busy; $('stop').hidden=!busy || Boolean(API_ENDPOINT); }
function bubble(role,text='') { const div=document.createElement('div'); div.className=`message ${role}`; const label=document.createElement('span');label.className='message-label';label.textContent=role==='user'?'ВИ':'AI · ДЕМОНСТРАЦІЯ';const p=document.createElement('p');p.textContent=text;div.append(label,p);$('messages').append(div);$('messages').scrollTop=$('messages').scrollHeight;return p; }
if(API_ENDPOINT){
 $('startup').querySelector('h3').textContent='Справжній AI-консультант';
 $('startup').querySelectorAll('p')[0].textContent='Відповіді генерує мовна модель на основі відкритих матеріалів бренду. Немає списку фіксованих відповідей.';
 $('startup').querySelectorAll('p')[1].textContent='Ваші повідомлення та контекст діалогу надсилаються до Cloudflare Workers AI для формування відповіді. Не вводьте особисті дані, реквізити чи номери замовлень.';
 $('load').textContent='Почати AI-діалог';$('load-detail').textContent='Без завантаження моделі. Діють обмеження безкоштовного демо.';
 document.querySelector('.chat-note').textContent='AI · Cloudflare Workers AI · Може помилятися';
}
$('load').onclick=async()=>{
 if(loading||engine)return;
 if(API_ENDPOINT){
  engine={resetChat:async()=>{},interruptGenerate:()=>{},chat:{completions:{create:async function*({messages}){
   const response=await fetch(API_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.filter(m=>m.role!=='system')}),signal:AbortSignal.timeout(60000)});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Сервіс недоступний');
   yield {choices:[{delta:{content:data.response}}]};
  }}}};
  $('startup').remove();state('Готовий до розмови · Cloudflare AI');controls();$('question').focus();return;
 }
 loading=true; $('load').disabled=true; $('progress').hidden=false;
 try {
  if(!navigator.gpu)throw new Error('WebGPU недоступний. Відкрийте демо в актуальному Chrome або Edge на комп’ютері з увімкненим графічним прискоренням.');
  const adapter=await navigator.gpu.requestAdapter();if(!adapter)throw new Error('Не знайдено сумісного графічного адаптера. Спробуйте інший комп’ютер.');
  state('Завантажуємо мовну модель…');
  const {CreateWebWorkerMLCEngine}=await import('https://esm.run/@mlc-ai/web-llm@0.2.88');
  worker = new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
  const suffix=adapter.features.has('shader-f16')?'q4f16_1':'q4f32_1';
  engine=await CreateWebWorkerMLCEngine(worker,`Qwen2.5-1.5B-Instruct-${suffix}-MLC`,{initProgressCallback: report=>{ $('progress').value=report.progress;$('load-detail').textContent=report.text; }});
  $('startup').remove();state('Готовий до розмови · AI на вашому пристрої');controls();$('question').focus();
 } catch(error) {worker?.terminate();worker=null;engine=null;state('AI ще не запущено');$('load-detail').textContent=error.message||'Не вдалося завантажити модель. Перевірте мережу та повторіть.';$('load').textContent='Спробувати знову';$('load').disabled=false;$('progress').hidden=true;}
 finally {loading=false;}
};
$('chat-form').onsubmit=async event=>{
 event.preventDefault();const question=$('question').value.trim();if(!engine||busy||!question)return;
 busy=true;controls();$('question').value='';bubble('user',question);const output=bubble('assistant','Обмірковую…');state('AI формує відповідь…');
 const proposed=[...history,{role:'user',content:question}];let answer='';
 try {
  const stream=await engine.chat.completions.create({messages:[{role:'system',content:systemPrompt},...proposed.slice(-5)],stream:true,max_tokens:400,temperature:0.3});
  for await (const chunk of stream) {answer+=chunk.choices[0]?.delta?.content||'';output.textContent=answer||'Обмірковую…';$('messages').scrollTop=$('messages').scrollHeight;}
  if(!answer.trim())throw new Error('Модель не повернула відповіді. Спробуйте коротше запитання.');
  history=[...proposed,{role:'assistant',content:answer}].slice(-4);state('Готовий до розмови · Перевіряйте важливі деталі');
 }catch(error){output.textContent=answer?answer+'\n\n[Відповідь перервана]':'Не вдалося отримати AI-відповідь. '+(error.message||'Спробуйте ще раз.');state('Запит не завершено · Можна повторити');}
 finally {busy=false;controls();$('question').focus();}
};
$('question').onkeydown=event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chat-form').requestSubmit();}};
$('stop').onclick=()=>engine?.interruptGenerate();
$('reset').onclick=async()=>{if(busy||!engine)return;history=[];await engine.resetChat();$('messages').replaceChildren();bubble('assistant','Новий діалог. Про що бажаєте дізнатися?');state('Готовий до розмови');$('question').focus();};
for(const button of document.querySelectorAll('[data-prompt]'))button.onclick=()=>{if(!engine){$('load').focus();$('load-detail').textContent='Спершу запустіть AI. Потім можна обрати приклад або написати власне запитання.';return;}if(busy)return;$('question').value=button.dataset.prompt;$('question').focus();};
