(()=>{'use strict';
const DATA=window.HUMAN_POTENTIAL_CONTENT,UI=window.HP_JOURNEY,$=s=>document.querySelector(s),KEY='hp.journey.v1';
let state={version:1,language:'en',last:null,explored:[],notes:{},activities:{},step:{goal:'',step:'',when:''}},lang='en',current=0,full=false,noteDirty=false,stepDirty=false,guideLauncher=null;
try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.version===1){if(UI[x.language])state.language=x.language;if(Number.isInteger(x.last)&&x.last>=0&&x.last<8)state.last=x.last;state.explored=Array.isArray(x.explored)?[...new Set(x.explored.filter(n=>Number.isInteger(n)&&n>=0&&n<8))]:[];if(x.notes&&typeof x.notes==='object')for(const [k,v]of Object.entries(x.notes)){if(/^(en|roman|ur)-[0-7]$/.test(k)&&v&&typeof v.text==='string')state.notes[k]={text:v.text.slice(0,3000),at:typeof v.at==='string'?v.at:''};}if(x.step&&typeof x.step==='object')for(const k of ['goal','step','when'])state.step[k]=typeof x.step[k]==='string'?x.step[k].slice(0,k==='step'?800:300):'';}}catch{}
try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw?.activities&&typeof raw.activities==='object')for(let i=0;i<8;i++){const a=raw.activities[i];if(!a||typeof a!=='object')continue;const v={};for(const k of ['priority','response','action','time'])if(Number.isInteger(a[k])&&a[k]>=0&&a[k]<(k==='time'?4:5))v[k]=a[k];if(Object.keys(v).length)state.activities[i]=v;}}catch{}
let activityStage=0;
lang=state.language;
const t=k=>UI[lang][k];
function status(k){$('#status').textContent=t(k);$('#status').classList.add('visible');clearTimeout(status.timer);status.timer=setTimeout(()=>$('#status').classList.remove('visible'),6000);}
function persist(){state.language=lang;try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{status('storageError');return false;}}
function guard(){return !noteDirty&&!stepDirty||confirm(t('unsaved'));}
function button(text,fn,cls=''){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.addEventListener('click',fn);return b;}
function closeMenu(){$('#menu').setAttribute('aria-expanded','false');$('#nav').classList.remove('open');}
function range(i){return DATA[lang].slice(UI[lang].starts[i],UI[lang].starts[i+1]??DATA[lang].length);}
function minutes(i){const count=range(i).reduce((n,b)=>n+b.text.split(/\s+/).length,0);return Math.max(1,Math.ceil(count/(lang==='ur'?150:190)));}
function refreshSummary(){
 renderFindings();
 $('#progress-summary').textContent=state.explored.length+' '+t('exploredCount');$('#progress-bar').style.width=(state.explored.length/8*100)+'%';
 $('#saved-notes').replaceChildren();const entries=Object.entries(state.notes);
 if(!entries.length){const p=document.createElement('p');p.textContent=t('noNotes');$('#saved-notes').append(p);}
 for(const [key,value]of entries){const [l,n]=key.split('-');const item=document.createElement('div');item.className='saved-note';const b=button(UI[l].names[Number(n)],()=>{if(!guard())return;lang=l;localize();openChapter(Number(n),false,true);});b.lang=l==='roman'?'ur-Latn':l;b.dir=l==='ur'?'rtl':'ltr';const text=document.createElement('p');text.textContent=value.text.length>110?value.text.slice(0,110)+'…':value.text;text.lang=b.lang;text.dir=b.dir;item.append(b,text);$('#saved-notes').append(item);}
 $('#resume').hidden=state.last===null;$('#resume-text').textContent=state.last===null?'':t('names')[state.last];
}
function fillStep(){for(const k of ['goal','step','when'])$('#'+k).value=state.step[k];stepDirty=false;}
function localize(){document.documentElement.lang=lang==='roman'?'ur-Latn':lang;document.documentElement.dir=lang==='ur'?'rtl':'ltr';$('#language').value=lang;document.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));$('#nav').setAttribute('aria-label',t('navigation'));$('#language').setAttribute('aria-label',lang==='ur'?'زبان':lang==='roman'?'Zabaan':'Language');
 $('#paths').replaceChildren();[0,1,2,3,5].forEach((chapter,i)=>{const b=button(t('paths')[i]+' ↗',()=>{if(guard())openChapter(chapter);},'path');$('#paths').append(b);});
 $('#chapters').replaceChildren();t('names').forEach((name,i)=>{const b=button('',()=>{if(guard())openChapter(i);},'chapter-card');const n=document.createElement('span');n.className='chapter-number';n.textContent=String(i+1).padStart(2,'0');const h=document.createElement('strong');h.textContent=name;const small=document.createElement('small');small.textContent=minutes(i)+' '+t('minutes')+(state.explored.includes(i)?' · ✓':'');b.append(n,h,small);$('#chapters').append(b);});
 $('#guide-steps').replaceChildren();for(const text of t('guides')){const li=document.createElement('li');li.textContent=text;$('#guide-steps').append(li);}fillStep();refreshSummary();persist();}
function renderReading(){const u=UI[lang],blocks=full?DATA[lang]:range(current),start=full?0:u.starts[current];$('#reading').replaceChildren();$('#chapter-title').textContent=full?t('fullTitle'):u.names[current];$('#chapter-meta').textContent=full?t('fullHint'):t('chapter')+' '+(current+1)+' / 8 · '+minutes(current)+' '+t('minutes');
 blocks.forEach((block,j)=>{const e=document.createElement(full&&u.starts.includes(j)?'h3':'p');e.textContent=block.text;e.dataset.sourceIndex=String(start+j);$('#reading').append(e);});
 if(!full){renderActivity();const note=state.notes[lang+'-'+current];$('#note').value=note?.text||'';$('#prompt').textContent=u.prompts[current];$('#action').textContent=u.actions[current];$('#explored').checked=state.explored.includes(current);$('#delete-note').disabled=!note;}
 $('.reflection').hidden=full;$('#previous').disabled=full||current===0;$('#next').disabled=full||current===7;noteDirty=false;
}
function openChapter(i,all=false,focus=true){current=i;activityStage=0;full=all;$('#reader').hidden=false;if(!all)state.last=i;renderReading();persist();refreshSummary();if(focus){$('#reader').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#chapter-title').focus({preventScroll:true});}}
$('#language').addEventListener('change',e=>{if(!guard()){e.target.value=lang;return;}lang=e.target.value;localize();if(!$('#reader').hidden)renderReading();closeMenu();});
$('#full-open').addEventListener('click',()=>{if(guard())openChapter(current,true);});$('#full-switch').addEventListener('click',()=>{if(guard())openChapter(current,true);});
$('#resume-open').addEventListener('click',()=>{if(guard())openChapter(state.last??0);});
$('#back-chapters').addEventListener('click',()=>{if(!guard())return;noteDirty=false;$('#reader').hidden=true;$('#explore').scrollIntoView();});
$('#previous').addEventListener('click',()=>{if(current>0&&guard())openChapter(current-1);});$('#next').addEventListener('click',()=>{if(current<7&&guard())openChapter(current+1);});
$('#note').addEventListener('input',()=>noteDirty=true);
$('#save-note').addEventListener('click',()=>{const text=$('#note').value.trim();if(!text){status('emptyNote');return;}state.notes[lang+'-'+current]={text,at:new Date().toISOString()};if(persist()){noteDirty=false;status('saved');}$('#delete-note').disabled=false;refreshSummary();});
$('#delete-note').addEventListener('click',()=>{if(confirm(t('confirmDelete'))){delete state.notes[lang+'-'+current];$('#note').value='';noteDirty=false;$('#delete-note').disabled=true;if(persist())status('deleted');refreshSummary();}});
$('#explored').addEventListener('change',e=>{state.explored=state.explored.filter(n=>n!==current);if(e.target.checked)state.explored.push(current);persist();refreshSummary();document.querySelectorAll('.chapter-card small')[current].textContent=minutes(current)+' '+t('minutes')+(e.target.checked?' · ✓':'');});
for(const k of ['goal','step','when'])$('#'+k).addEventListener('input',()=>stepDirty=true);
$('#choose-step').addEventListener('click',()=>{if(stepDirty&&!confirm(t('unsaved')))return;$('#goal').value=t('names')[current];$('#step').value=t('actions')[current];$('#when').value='';stepDirty=true;$('#journey').scrollIntoView();$('#step').focus({preventScroll:true});status('stepChosen');});
function captureStep(){return {goal:$('#goal').value.trim(),step:$('#step').value.trim(),when:$('#when').value.trim()};}
$('#save-step').addEventListener('click',()=>{const x=captureStep();if(!x.goal&&!x.step){status('emptyStep');return;}state.step=x;if(persist()){stepDirty=false;status('saved');}});
function download(text,name){const blob=new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('exported');}
function stepText(x){return [t('stepTitle'),t('goal')+': '+x.goal,t('smallStep')+': '+x.step,t('when')+': '+x.when].join('\n\n');}
$('#download-step').addEventListener('click',()=>{const x=captureStep();if(!x.goal&&!x.step){status('emptyStep');return;}download(stepText(x),'human-potential-next-step.txt');});
$('#export-notes').addEventListener('click',()=>{const lines=['Human Potential — DeTLeng',stepText(captureStep()),state.explored.length+' '+t('exploredCount'),A().all,...Object.keys(state.activities).map(Number).sort((a,b)=>a-b).flatMap(i=>findingLines(i))];for(const [key,value]of Object.entries(state.notes)){const [l,n]=key.split('-');lines.push(UI[l].names[Number(n)]+' ('+l+')',value.text);}if(noteDirty)lines.push(t('noteLabel')+' ('+t('chapter')+' '+(current+1)+')',$('#note').value);download(lines.join('\n\n'),'human-potential-journal.txt');});
$('#clear-data').addEventListener('click',()=>{if(!confirm(t('confirmClear')))return;state={version:1,language:lang,last:null,explored:[],notes:{},activities:{},step:{goal:'',step:'',when:''}};noteDirty=false;stepDirty=false;localize();if(!$('#reader').hidden)renderReading();status('cleared');});
function guide(e){guideLauncher=e.currentTarget;$('#guide-dialog').showModal();$('#guide-close').focus();}
$('#guide-open').addEventListener('click',guide);$('#footer-guide').addEventListener('click',guide);$('#guide-close').addEventListener('click',()=>$('#guide-dialog').close());$('#guide-dialog').addEventListener('close',()=>guideLauncher?.focus());$('#guide-start').addEventListener('click',()=>{$('#guide-dialog').close();$('#begin').scrollIntoView();});
$('#menu').addEventListener('click',()=>{const on=$('#menu').getAttribute('aria-expanded')!=='true';$('#menu').setAttribute('aria-expanded',String(on));$('#nav').classList.toggle('open',on);});$('#nav').addEventListener('click',e=>{if(e.target.closest('a,button'))closeMenu();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#menu').getAttribute('aria-expanded')==='true'){closeMenu();$('#menu').focus();}});
window.addEventListener('beforeunload',e=>{if(noteDirty||stepDirty){e.preventDefault();e.returnValue='';}});

const A=()=>window.HP_ACTIVITIES[lang];
const findings=document.createElement('section');findings.id='findings';findings.className='findings';const manual=document.createElement('details');manual.className='manual-plan';const manualLabel=document.createElement('summary');manual.append(manualLabel);const oldJourney=$('.journey-layout');oldJourney.before(findings,manual);manual.append(oldJourney);
function choiceLabel(i,key,value){const u=A(),c=u.chapters[i];if(value===undefined)return u.partial;if(key==='time')return u.times[value];return value===3?u.unsure:value===4?u.other:c[key==='priority'?1:key==='response'?3:5][value];}
function feedback(i,v){return v===undefined?'':v===3?A().uncertain:v===4?A().own:A().chapters[i][4][v];}
function renderActivity(){
 const u=A(),c=u.chapters[current],a=state.activities[current]||{},root=$('#activity');root.replaceChildren();$('#optional-label').textContent=u.optional;
 const title=document.createElement('h3');title.textContent=u.heading;const intro=document.createElement('p');intro.className='quiet';intro.textContent=u.intro;root.append(title,intro);
 const tabs=document.createElement('div');tabs.className='activity-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label',u.heading);
 [u.choose,u.situation,u.act].forEach((label,n)=>{const b=button(String(n+1)+(a[['priority','response','action'][n]]!==undefined?' ✓':''),()=>{activityStage=n;renderActivity();$('#activity-question').focus();});b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(n===activityStage));tabs.append(b);});root.append(tabs);
 const question=document.createElement('h4');question.id='activity-question';question.tabIndex=-1;question.textContent=[u.choose,u.situation,u.act][activityStage];root.append(question);
 const context=document.createElement('p');context.textContent=activityStage===1?c[2]:c[0];root.append(context);
 const key=['priority','response','action'][activityStage],group=document.createElement('div');group.className='choice-list';group.setAttribute('role','group');group.setAttribute('aria-labelledby','activity-question');
 [...c[activityStage===0?1:activityStage===1?3:5],u.unsure,u.other].forEach((label,n)=>{const b=button(label,()=>{const next={...(state.activities[current]||{}),[key]:n};state.activities[current]=next;persist();renderActivity();renderFindings();$('#activity .choice-list button:nth-child('+(n+1)+')').focus({preventScroll:true});});b.setAttribute('aria-pressed',String(a[key]===n));group.append(b);});root.append(group);
 const info=document.createElement('p');info.className='activity-feedback';info.setAttribute('role','status');info.textContent=activityStage===1?feedback(current,a.response):a[key]===3?u.uncertain:a[key]===4?u.own:'';if(info.textContent)root.append(info);
 if(activityStage===2){const label=document.createElement('label');label.htmlFor='activity-time';label.textContent=u.time;const select=document.createElement('select');select.id='activity-time';const blank=document.createElement('option');blank.value='';blank.textContent=u.partial;select.append(blank);u.times.forEach((v,n)=>{const op=document.createElement('option');op.value=String(n);op.textContent=v;select.append(op);});select.value=a.time===undefined?'':String(a.time);select.addEventListener('change',()=>{const x={...(state.activities[current]||{})};if(select.value==='')delete x.time;else x.time=Number(select.value);state.activities[current]=x;persist();renderFindings();});root.append(label,select);}
 const controls=document.createElement('div');controls.className='actions';if(activityStage>0)controls.append(button('← '+(activityStage)+' / 3',()=>{activityStage--;renderActivity();$('#activity-question').focus();},'text-button'));if(activityStage<2)controls.append(button((activityStage+2)+' / 3 →',()=>{activityStage++;renderActivity();$('#activity-question').focus();},'outline'));else{const b=document.createElement('a');b.href='#findings';b.className='outline';b.textContent=u.all;controls.append(b);}root.append(controls);
}
function findingLines(i){const a=state.activities[i],u=A();return [UI[lang].names[i],u.selected+': '+choiceLabel(i,'priority',a.priority),u.response+': '+choiceLabel(i,'response',a.response),feedback(i,a.response),u.action+': '+choiceLabel(i,'action',a.action),u.when+': '+choiceLabel(i,'time',a.time)].filter(Boolean);}
function renderFindings(){
 const u=A();manualLabel.textContent=u.optional;findings.replaceChildren();const h=document.createElement('h2');h.textContent=u.all;const p=document.createElement('p');p.textContent=u.summary;const priv=document.createElement('p');priv.className='quiet';priv.textContent=u.privacy;findings.append(h,p,priv);
 const ids=Object.keys(state.activities).map(Number).sort((a,b)=>a-b);if(!ids.length){const e=document.createElement('p');e.textContent=u.empty;findings.append(e);return;}
 const count=ids.filter(i=>state.activities[i].action!==undefined&&state.activities[i].time!==undefined).length;const progress=document.createElement('p');progress.textContent=count+' / 8 '+u.complete;findings.append(progress);
 const cards=document.createElement('div');cards.className='finding-grid';for(const i of ids){const card=document.createElement('article');card.className='finding-card';findingLines(i).forEach((line,n)=>{const el=document.createElement(n===0?'h3':'p');el.textContent=line;card.append(el);});card.append(button(u.edit,()=>{if(guard())openChapter(i);},'text-button'));cards.append(card);}findings.append(cards);
 const controls=document.createElement('div');controls.className='actions';controls.append(button(u.download,()=>download([u.report,u.boundary,...ids.flatMap(i=>findingLines(i).concat(''))].join('\n\n'),'human-potential-findings.txt'),'button'),button(u.print,()=>{document.body.classList.add('print-findings');window.print();},'outline'));findings.append(controls);const note=document.createElement('p');note.className='quiet';note.textContent=u.boundary;findings.append(note);
}
window.addEventListener('afterprint',()=>document.body.classList.remove('print-findings'));

$('#year').textContent=new Date().getFullYear();localize();
})();