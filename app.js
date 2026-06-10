const DATA = window.ICEPI_DATA;
const app = document.getElementById('app');
let state = { screen:'home', chapter:null, paragraph:null, search:'', openCreed:null, histories:{}, openChurch:null, openImp:null, activeRef:null, refsOpen:false };

const icons = { book:'☰', creed:'▤', column:'▥', family:'⌂' };
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function snippet(t,n=145){let s=t.replace(/^\d+\.\d+\s*/,'').replace(/\s+/g,' ').trim(); return s.length>n?s.slice(0,n).trim()+'...':s;}
function goto(screen, extra={}){ state={...state, screen, activeRef:null, refsOpen:false, ...extra}; render(); setTimeout(()=>window.scrollTo({top:0,behavior:'instant'}),0); }
function topbar(title){return `<header class="topbar"><button class="btn-outline btn-small left" onclick="goto('home')">⌂ Home</button><h1>${esc(title)}</h1><button class="btn-outline btn-small right" onclick="goto('dashboard')">▦ Dashboard</button></header>`}
function footer(){return `<footer class="footer">I C E P I</footer>`}

function render(){
  if(state.screen==='home') return renderHome();
  if(state.screen==='dashboard') return renderDashboard();
  if(state.screen==='confession') return renderConfession();
  if(state.screen==='paragraph') return renderParagraph();
  if(state.screen==='confessionHistory') return renderConfessionHistory();
  if(state.screen==='creeds') return renderCreeds();
  if(state.screen==='importance') return renderImportance();
  if(state.screen==='family') return renderFamily();
  if(state.screen==='icepiHistory') return renderIcepiHistory();
}
function renderHome(){
  app.innerHTML=`<main class="screen hero">
    <img src="assets/logo-icepi-white.png" class="hero-logo" alt="ICEPI" />
    <p class="hero-text">La asociación ICEPI se adhiere a la Segunda Confesión Bautista de 1689 y reconocemos que los Credos Históricos: Credo de los Apóstoles, Credo Niceno y el Credo de Atanasio, manifiestan fielmente la esencia de nuestra fe.</p>
    <button class="btn-primary" onclick="goto('dashboard')">Conocer más</button>
  </main>`;
}
function renderDashboard(){
 const tiles=[
  ['📖','Confesión de Londres de 1689','confession'],['📜','Credos','creeds'],['🏛','Importancia de los Credos y Confesiones','importance'],['⛪','Familia ICEPI','family']
 ];
 app.innerHTML=`<main class="screen"><header class="topbar"><span></span><h1>Dashboard</h1><button class="btn-outline btn-small right" onclick="goto('home')">⌂ Home</button></header>
 <section class="dashboard-grid">${tiles.map(t=>`<button class="tile card" onclick="goto('${t[2]}')"><div class="tile-icon">${t[0]}</div><div class="tile-title">${esc(t[1])}</div><div class="tile-arrow">›</div></button>`).join('')}</section>${footer()}</main>`
}
function renderConfession(){
 const selected = DATA.chapters.find(c=>c.number==state.chapter);
 const paras = state.chapter ? DATA.paragraphs.filter(p=>p.chapter==state.chapter) : [];
 const results = state.search ? searchParagraphs(state.search) : [];
 app.innerHTML=`<main class="screen">${topbar('C. de Londres de 1689')}
 <button class="btn-wide" onclick="goto('confessionHistory')">📖 Conoce la historia de la Confesión</button>
 <section class="search-panel card">
  <div class="search-row"><input id="searchInput" class="input" placeholder="Buscar por palabra clave..." value="${esc(state.search)}" onkeydown="if(event.key==='Enter') doSearch()"><button class="btn-search" onclick="doSearch()">🔍 Buscar</button><p class="search-help">Usa el buscador o elige un capítulo para ver sus párrafos.</p></div>
 </section>
 <section class="confession-grid card">
  <div class="chapter-pane"><label class="label">Capítulo</label><select onchange="selectChapter(this.value)"><option value="">Selecciona un capítulo</option>${DATA.chapters.map(c=>`<option value="${c.number}" ${state.chapter==c.number?'selected':''}>Capítulo ${c.number}: ${esc(c.title)}</option>`).join('')}</select></div>
  <div class="paragraph-pane">${state.search?renderSearchResults(results):renderChapterParagraphs(selected,paras)}</div>
 </section>${footer()}</main>`;
}
function doSearch(){ state.search=document.getElementById('searchInput').value.trim(); state.chapter=null; render(); }
function selectChapter(v){ state.chapter=v?Number(v):null; state.search=''; render(); }
function searchParagraphs(q){ const terms=q.toLowerCase().split(/\s+/).filter(Boolean); return DATA.paragraphs.filter(p=>terms.every(t=>(p.text+' '+p.title+' '+p.category+' '+p.weight+' '+(p.tags||[]).join(' ')).toLowerCase().includes(t))); }
function renderSearchResults(results){
 return `<h2 class="section-title">Resultados de búsqueda</h2>${results.length?`<div class="results">${results.map(p=>{let ch=DATA.chapters.find(c=>c.number===p.chapter);return `<article class="result card"><h3>Capítulo ${p.chapter}: ${esc(ch.title)} · Párrafo ${p.paragraph}</h3><p>${esc(snippet(p.text,220))}</p><div class="pills"><span class="pill">${esc(p.weight)}</span><span class="pill">${esc(p.category)}</span></div><button class="btn-inline" onclick="goto('paragraph',{paragraph:'${p.id}',chapter:${p.chapter}})">Ver</button></article>`}).join('')}</div>`:`<div class="empty card">No se encontraron párrafos relacionados.</div>`}`;
}
function renderChapterParagraphs(ch,paras){
 if(!ch) return `<div class="empty card">Selecciona un capítulo para ver sus párrafos.</div>`;
 return `<h2 class="section-title">Capítulo ${ch.number}: ${esc(ch.title)}</h2><div class="para-list card">${paras.map(p=>`<div class="para-item"><span class="num">${p.paragraph}</span><div><div class="snippet">${esc(snippet(p.text))}</div><div class="pills"><span class="pill">${esc(p.weight)}</span><span class="pill">${esc(p.category)}</span></div></div><button class="btn-inline" onclick="goto('paragraph',{paragraph:'${p.id}',chapter:${p.chapter}})">Ver</button></div>`).join('')}</div>`;
}
const MANUAL_ENHANCED_PARAGRAPHS = {
  'c12-p1': {
    body: '12.1 A todos aquellos que son justificados, Dios se dignó conceder de buena gana, en Su único Hijo Jesucristo y por causa de Él, el enorme privilegio de hacerlos partícipes de la gracia ,[[1]] por la cual son incluidos en el número de los hijos de Dios, y gozan de sus libertades y privilegios,[[2]] tienen Su nombre escrito sobre ellos,[[3]] reciben el espíritu de adopción,[[4]] tienen acceso al trono de la gracia con con-fianza, son capacitados para clamar: —¡Abba! ¡Padre!—,[[5]] son objetos de compasión,[[6]] son protegidos,[[7]] provistos[[8]] y disciplinados por Él como por un Padre,[[9]] pero nunca son desechados,[[10]] sino que son sellados para el día de la redención;[[11]] y heredan las promesas como herederos de la salvación eterna.[[12]]',
    references: {
      '1':'Efe. 1:5. Gál. 4:4, 5.',
      '2':'Jua. 1:12. Rom. 8:17.',
      '3':'2 Cor. 6:18. Apo. 3:12.',
      '4':'Rom. 8:15.',
      '5':'Gál. 4:6. Efe. 2:18.',
      '6':'Sal. 103:13.',
      '7':'Pro. 14:26.',
      '8':'1 Ped. 5:7.',
      '9':'Heb. 12:6.',
      '10':'Isa. 54:8, 9. Lam. 3:31.',
      '11':'Efe. 4:30.',
      '12':'Heb. 1:14; 6:12.'
    }
  }
};
const ENHANCED_CACHE = {};
function cleanReferenceText(txt){
  return String(txt||'').trim()
    .replace(/\s+T$/,'')
    .replace(/\s+/g,' ')
    .trim();
}
function parseReferenceBlock(text){
  const bookStart = '(?:[1-3]\\s*)?[A-ZÁÉÍÓÚ][A-Za-zÁÉÍÓÚáéíóúñÑ]+\\.?\\s+\\d';
  const candidateRe = new RegExp('\\s(\\d{1,2})\\s+(?=' + bookStart + ')','g');
  let m;
  const candidates=[];
  while((m=candidateRe.exec(text))){ candidates.push(m.index); }
  for(const idx of candidates){
    if(idx < text.length * 0.35) continue;
    const block = text.slice(idx).trim();
    const parts = block.split(/\s*\|\s*/).map(x=>x.trim()).filter(Boolean);
    if(!parts.length) continue;
    const refs = {};
    let valid = true;
    for(const part of parts){
      const pm = part.match(/^(\d{1,2})\s+(.+)$/);
      if(!pm){ valid=false; break; }
      refs[pm[1]] = cleanReferenceText(pm[2]);
    }
    if(valid){
      return { body: text.slice(0, idx).trim(), references: refs };
    }
  }
  return null;
}
function markInlineNotes(body, refs){
  const prefixMatch = body.match(/^(\d+\.\d+\s+)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  let rest = prefixMatch ? body.slice(prefix.length) : body;
  const numbers = Object.keys(refs).sort((a,b)=>b.length-a.length || Number(b)-Number(a));
  for(const n of numbers){
    const safeN = n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const tightRe = new RegExp('(^|[^\\d\\s])(' + safeN + ')(?!\\d)(?=[\\s,.;:)\\-—]|$)','g');
    rest = rest.replace(tightRe, (match, before)=> before + '[[' + n + ']]');
    const spacedRe = new RegExp('(\\s)(' + safeN + ')(?=\\s)','g');
    rest = rest.replace(spacedRe, (match, before)=> before + '[[' + n + ']]');
  }
  const unmarked = numbers.filter(n => !(prefix + rest).includes('[[' + n + ']]'));
  if(unmarked.length){
    rest = rest.trimEnd() + unmarked.sort((a,b)=>Number(a)-Number(b)).map(n=>'[[' + n + ']]').join('');
  }
  return prefix + rest;
}
function getEnhancedParagraph(p){
  if(!p) return null;
  if(MANUAL_ENHANCED_PARAGRAPHS[p.id]) return MANUAL_ENHANCED_PARAGRAPHS[p.id];
  if(ENHANCED_CACHE[p.id]) return ENHANCED_CACHE[p.id];
  const parsed = parseReferenceBlock(p.text || '');
  if(!parsed) return null;
  const marked = markInlineNotes(parsed.body, parsed.references);
  const enhanced = { body: marked, references: parsed.references };
  ENHANCED_CACHE[p.id] = enhanced;
  return enhanced;
}
function renderEnhancedText(raw, refs){
  return esc(raw).replace(/\[\[(\d+)\]\]/g,(m,n)=>`<sup class="ref-sup" tabindex="0" onclick="toggleRef('${n}')" onmouseenter="showRef('${n}')" onmouseleave="hideRef()">${n}</sup>`);
}
function toggleRef(n){ state.activeRef = state.activeRef===n ? null : n; render(); }
function showRef(n){ if(window.matchMedia('(hover:hover)').matches){ state.activeRef=n; render(); } }
function hideRef(){ if(window.matchMedia('(hover:hover)').matches){ state.activeRef=null; render(); } }
function toggleRefsPanel(){ state.refsOpen=!state.refsOpen; render(); }
function renderReferencesPanel(refs){
 const list=Object.keys(refs).sort((a,b)=>Number(a)-Number(b)).map(n=>`<li><span class="ref-num">${esc(n)}</span><span>${esc(refs[n])}</span></li>`).join('');
 return `<section class="refs-panel ${state.refsOpen?'open':''}"><button class="refs-toggle" onclick="toggleRefsPanel()">${state.refsOpen?'▲ Ocultar referencias bíblicas':'▼ Ver referencias bíblicas'}</button>${state.refsOpen?`<div class="refs-box"><h3>Referencias bíblicas</h3><ol>${list}</ol></div>`:''}</section>`;
}
function renderParagraph(){
 const p=DATA.paragraphs.find(x=>x.id===state.paragraph); const ch=DATA.chapters.find(c=>c.number===p.chapter);
 const enhanced=getEnhancedParagraph(p);
 if(enhanced){
   const active = state.activeRef ? enhanced.references[state.activeRef] : null;
   app.innerHTML=`<main class="screen">${topbar('C. de Londres de 1689')}<article class="reader card enhanced-reader"><button class="btn-ghost backlink" onclick="goto('confession',{chapter:${p.chapter},paragraph:null})">← Volver a los párrafos</button><h2>Capítulo ${p.chapter}: ${esc(ch.title)}</h2><p class="gold">Párrafo ${p.paragraph}</p><div class="pills"><span class="pill">${esc(p.weight)}</span><span class="pill">${esc(p.category)}</span>${(p.tags||[]).slice(0,5).map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div><div class="confession-text">${renderEnhancedText(enhanced.body, enhanced.references)}</div>${active?`<aside class="ref-popover"><button class="popover-close" onclick="toggleRef('${state.activeRef}')">×</button><strong>${esc(state.activeRef)}</strong><span>${esc(active)}</span></aside>`:''}${renderReferencesPanel(enhanced.references)}</article>${footer()}</main>`;
   return;
 }
 app.innerHTML=`<main class="screen">${topbar('C. de Londres de 1689')}<article class="reader card"><button class="btn-ghost backlink" onclick="goto('confession',{chapter:${p.chapter},paragraph:null})">← Volver a los párrafos</button><h2>Capítulo ${p.chapter}: ${esc(ch.title)}</h2><p class="gold">Párrafo ${p.paragraph}</p><div class="pills"><span class="pill">${esc(p.weight)}</span><span class="pill">${esc(p.category)}</span>${(p.tags||[]).slice(0,5).map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div><div class="text">${esc(p.text)}</div></article>${footer()}</main>`;
}
function renderConfessionHistory(){app.innerHTML=`<main class="screen">${topbar('Historia de la Confesión')}<article class="reader card"><button class="btn-ghost backlink" onclick="goto('confession')">← Volver a la Confesión</button><h2>Breve historia de la Segunda Confesión Bautista de Londres</h2><div class="text">${esc(DATA.confessionHistory)}</div></article>${footer()}</main>`}
function renderCreeds(){
 app.innerHTML=`<main class="screen">${topbar('Credos')}<section class="info card">Los credos históricos resumen las doctrinas fundamentales de la fe cristiana y han servido durante siglos como expresión pública de la ortodoxia.</section><section class="accordion">${DATA.creeds.map(c=>renderCreed(c)).join('')}</section>${footer()}</main>`;
}
function renderCreed(c){ const open=state.openCreed===c.id; const hist=state.histories[c.id]; return `<article class="acc card"><button class="acc-head" onclick="toggleCreed('${c.id}')"><span>${esc(c.name)}</span><span class="chev">${open?'⌃':'⌄'}</span></button>${open?`<div class="acc-body"><div class="creed-text">${esc(c.text)}</div><div class="acc-actions"><button class="btn-inline" onclick="event.stopPropagation();toggleHistory('${c.id}')">${hist?'Ocultar historia':'Conocer historia'}</button><button class="btn-inline" onclick="event.stopPropagation();toggleCreed('${c.id}')">Contraer</button></div>${hist?renderCreedHistory(c):''}</div>`:''}</article>`; }
function renderCreedHistory(c){
 return `<div class="history"><h3 class="gold">Historia del Credo</h3><div class="history-text">${esc(c.history)}</div></div>`;
}
function toggleCreed(id){ state.openCreed=state.openCreed===id?null:id; render(); }
function toggleHistory(id){ state.histories[id]=!state.histories[id]; render(); }
function renderImportance(){ app.innerHTML=`<main class="screen">${topbar('Importancia')}<section class="info card"><strong>Los credos y confesiones no reemplazan a la Biblia;</strong> la sirven como resúmenes públicos, históricos y verificables de lo que la iglesia cree que la Escritura enseña.</section><section class="importance-grid">${DATA.importanceSections.map((s,i)=>`<article class="importance-card card"><h2>${i+1}. ${esc(s.title)}</h2><p>${esc(s.body)}</p></article>`).join('')}</section>${footer()}</main>`; }
function renderFamily(){ app.innerHTML=`<main class="screen">${topbar('Familia ICEPI')}<button class="btn-wide" onclick="goto('icepiHistory')">Conoce la historia de ICEPI</button><section class="info card">Las iglesias que conforman ICEPI comparten un legado histórico, una identidad común y el compromiso de caminar juntas en fidelidad a Cristo y a Su Palabra.</section><section class="accordion familia-list">${DATA.churches.map((c,i)=>renderChurch(c,i)).join('')}</section>${footer()}</main>`; }
function renderChurch(c,i){ const open=state.openChurch===i; return `<article class="acc card"><button class="acc-head" onclick="state.openChurch=${open?null:i};render()"><span>${esc(c.name)}</span><span class="chev">${open?'⌃':'⌄'}</span></button>${open?`<div class="church-details"><div class="detail-row"><b>Dirección:</b><span>${esc(c.address)}</span></div><div class="detail-row"><b>Correo electrónico:</b><span>${esc(c.email)}</span></div><div class="detail-row"><b>Página web:</b><span>${esc(c.url)}</span></div></div>`:''}</article>`; }
function renderIcepiHistory(){app.innerHTML=`<main class="screen">${topbar('Historia de ICEPI')}<article class="reader card"><button class="btn-ghost backlink" onclick="goto('family')">← Volver a Familia ICEPI</button><h2>Historia de ICEPI</h2><div class="text">${esc(DATA.icepiHistory)}</div></article>${footer()}</main>`}
render();
