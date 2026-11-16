import { sources } from './knowledge.js?v=online-2';
import { API_ENDPOINT } from './config.js?v=online-2';
const $ = id => document.getElementById(id);
let started = false, busy = false, controller = null;
let history = [];
function endpointIsValid() { try {const url=new URL(API_ENDPOINT);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;} }
for (const [label, href] of sources) { const a=document.createElement('a'); a.href=href; a.textContent=label+' ↗'; a.target='_blank'; a.rel='noopener noreferrer'; $('sources').append(a); }
function state(text) { $('status').textContent=text; }
function controls() { $('send').disabled=!started || busy; $('question').disabled=!started || busy; $('reset').disabled=!started || busy; $('stop').hidden=!busy; }
function bubble(role,text='') { const div=document.createElement('div'); div.className=`message ${role}`; const label=document.createElement('span');label.className='message-label';label.textContent=role==='user'?'ВИ':'AI · ДЕМОНСТРАЦІЯ';const p=document.createElement('p');p.textContent=text;div.append(label,p);$('messages').append(div);$('messages').scrollTop=$('messages').scrollHeight;return p; }
if(!endpointIsValid()){state('Онлайн AI ще не підключено');$('connection-detail').textContent='Онлайн-сервіс ще не підключено. Демонстрація стане доступною після налаштування серверного підключення. Завантажувати чи встановлювати нічого не потрібно.';}
$('start').onclick=()=>{
 if(started)return;
 if(!endpointIsValid()){state('Онлайн AI ще не підключено');$('connection-detail').textContent='Немає підключення до AI-сервісу. Спробуйте пізніше, коли власник демо завершить налаштування.';return;}
 started=true;$('startup').remove();state('Онлайн AI · Напишіть запитання');controls();$('question').focus();
};
$('chat-form').onsubmit=async event=>{
 event.preventDefault();const question=$('question').value.trim();if(!started||busy||!question)return;
 busy=true;controller=new AbortController();controls();$('question').value='';bubble('user',question);const output=bubble('assistant','Обмірковую…');state('AI формує відповідь…');
 const proposed=[...history,{role:'user',content:question}];let timedOut=false;
 const timer=setTimeout(()=>{timedOut=true;controller?.abort();},60000);
 try {
  const response=await fetch(API_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:proposed.slice(-5)}),signal:controller.signal});
  let data;try{data=await response.json();}catch{throw new Error('AI-сервіс повернув некоректну відповідь. Спробуйте пізніше.');}
  if(!response.ok)throw new Error(typeof data.error==='string'?data.error:'AI-сервіс тимчасово недоступний.');
  const answer=data.response;if(typeof answer!=='string'||!answer.trim())throw new Error('Модель не повернула відповіді. Спробуйте ще раз.');
  output.textContent=answer;history=[...proposed,{role:'assistant',content:answer.slice(0,1800)}].slice(-4);state('Онлайн AI · Перевіряйте важливі деталі');
 }catch(error){
  output.textContent=error.name==='AbortError'?(timedOut?'AI-сервіс не відповів вчасно. Спробуйте ще раз.':'Запит зупинено.'):error instanceof TypeError?'Немає з’єднання з AI-сервісом. Перевірте інтернет або спробуйте пізніше.':'Не вдалося отримати AI-відповідь. '+error.message;
  state('Запит не завершено · Можна повторити');$('question').value=question;
 }finally{clearTimeout(timer);controller=null;busy=false;controls();$('messages').scrollTop=$('messages').scrollHeight;$('question').focus();}
};
$('question').onkeydown=event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('chat-form').requestSubmit();}};
$('stop').onclick=()=>controller?.abort();
$('reset').onclick=()=>{if(busy||!started)return;history=[];$('messages').replaceChildren();bubble('assistant','Новий діалог. Про що бажаєте дізнатися?');state('Онлайн AI · Напишіть запитання');$('question').focus();};
for(const button of document.querySelectorAll('[data-prompt]'))button.onclick=()=>{if(!started){$('start').focus();return;}if(busy)return;$('question').value=button.dataset.prompt;$('question').focus();};
