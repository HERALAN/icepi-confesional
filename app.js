const DATA = window.ICEPI_DATA;
const app = document.getElementById('app');
let state = { screen:'home', chapter:null, paragraph:null, search:'', openCreed:null, histories:{}, openChurch:null, openImp:null, activeRef:null, refsOpen:false, epiStarted:false, epiStep:0 };

const icons = { book:'☰', creed:'▤', column:'▥', family:'⌂' };
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function snippet(t,n=145){let s=t.replace(/^\d+\.\d+\s*/,'').replace(/\s+/g,' ').trim(); return s.length>n?s.slice(0,n).trim()+'...':s;}
function goto(screen, extra={}){ state={...state, screen, activeRef:null, refsOpen:false, ...extra}; render(); setTimeout(()=>window.scrollTo({top:0,behavior:'instant'}),0); }
function topbar(title){const isDash=title==='Dashboard'; const isMarco=title==='Marco Epistemológico'; const cls=isDash?' class="dashboard-heading"':(isMarco?' class="marco-heading"':''); const label=isMarco?'Marco<br>Epistemológico':esc(title); return `<header class="topbar"><button class="btn-outline btn-small left" onclick="goto('home')">⌂ Home</button><h1${cls}>${label}</h1><button class="btn-outline btn-small right" onclick="goto('dashboard')">▦ Dashboard</button></header>`}
function footer(){return `<footer class="footer">I C E P I</footer>`}

function render(){
  if(state.screen==='home') return renderHome();
  if(state.screen==='dashboard') return renderDashboard();
  if(state.screen==='epistemology') return renderEpistemology();
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
  ['⚖️','¿Cómo sabemos que lo que creemos es verdad?','epistemology'],
  ['📖','Confesión de Londres de 1689','confession'],['📜','Credos','creeds'],['🏛','Importancia de los Credos y Confesiones','importance'],['⛪','Familia ICEPI','family']
 ];
 app.innerHTML=`<main class="screen"><header class="topbar"><span></span><h1 class="dashboard-heading">Dashboard</h1><button class="btn-outline btn-small right" onclick="goto('home')">⌂ Home</button></header>
 <section class="dashboard-grid">${tiles.map(t=>`<button class="tile card ${t[2]==='epistemology'?'tile-epistemology':''}" onclick="goto('${t[2]}', ${t[2]==='epistemology' ? '{epiStarted:false,epiStep:0}' : '{}'} )"><div class="tile-icon">${t[0]}</div><div class="tile-title">${esc(t[1])}</div><div class="tile-arrow">›</div></button>`).join('')}</section>${footer()}</main>`
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

const EPI_STEPS = [
  {
    name:'Escritura', desc:'Fundamento supremo', icon:'📖', subtitle:'Fundamento epistemológico supremo',
    principle:'El descubrimiento de cualquier doctrina legítima encuentra su base absoluta en la revelación escrita de Dios. La Escritura gobierna nuestra razón en lugar de ser subordinada a opiniones, costumbres o preferencias humanas.',
    apply:'Toda afirmación doctrinal debe comenzar preguntando qué dice el texto sagrado. La autoridad final no descansa en la intuición, la tradición local o la popularidad de una práctica, sino en la Palabra de Dios como norma suficiente e infalible.',
    verse:'“Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.”', ref:'2 Timoteo 3:16',
    bullets:['Autoridad final e infalible.','Norma de fe y práctica.','Toda doctrina debe derivarse de ella.'],
    risk:'Si este paso se omite, la doctrina puede terminar descansando en costumbre, emoción o herencia religiosa, no en revelación divina.',
    example:'Para abordar la pregunta sobre quién debe ser bautizado, el análisis parte del mandato de Cristo en Mateo 28:19 y Marcos 16:15–16, y del patrón apostólico narrado en Hechos. La pregunta inicial no es qué hemos acostumbrado hacer, sino qué revela el Nuevo Testamento sobre el sujeto del bautismo.',
    criterion:'Antes de aceptar o enseñar una doctrina, preguntamos: ¿qué dice la Escritura?, ¿es clara?, ¿es suficiente?, ¿tiene autoridad final sobre nuestra conclusión?'
  },
  {
    name:'Exégesis', desc:'Método de extracción', icon:'🔍', subtitle:'Método de extracción doctrinal',
    principle:'La doctrina no se impone al texto; se extrae mediante una lectura responsable que atiende palabras, gramática, sintaxis, contexto histórico y propósito del autor inspirado.',
    apply:'El paso exegético analiza términos clave, sujetos, verbos, conectores, contexto inmediato, trasfondo cultural e intención del autor. Después formula una conclusión proporcional a la evidencia, no una conclusión inflada por preferencias previas.',
    verse:'“Procura con diligencia presentarte a Dios aprobado... que usa bien la palabra de verdad.”', ref:'2 Timoteo 2:15',
    bullets:['Analizar términos y gramática.','Revisar contexto inmediato e histórico.','Formular conclusiones doctrinales.'],
    risk:'Usar textos como pretextos, leyendo en ellos algo que el autor bíblico no comunicó.',
    example:'En el análisis del bautismo se examina el verbo βαπτίζω, su sentido de inmersión, y textos como Hechos 2:38. Allí el arrepentimiento precede al bautismo y el patrón narrativo muestra proclamación, respuesta consciente y acto público de identificación con Cristo.',
    criterion:'Criterio del paso: la doctrina debe salir del sentido del texto, no de una tradición proyectada sobre el texto.'
  },
  {
    name:'Analogía de la fe', desc:'Validación bíblica', icon:'🧩', subtitle:'Mecanismo de validación',
    principle:'La Escritura interpreta la Escritura. Los textos claros iluminan los difíciles y ninguna doctrina debe construirse desde un pasaje aislado contra el conjunto del consejo de Dios.',
    apply:'Comparamos pasajes breves con pasajes explícitos, narraciones con doctrina apostólica, y verificamos si la conclusión armoniza con toda la revelación. Mayor evidencia bíblica produce mayor certeza doctrinal.',
    verse:'“La suma de tu palabra es verdad.”', ref:'Salmo 119:160',
    bullets:['Los pasajes claros iluminan los difíciles.','Ninguna doctrina se construye sobre un texto aislado.','Mayor evidencia bíblica produce mayor certeza doctrinal.'],
    risk:'Absolutizar una narración ambigua y usarla para contradecir patrones claros del Nuevo Testamento.',
    example:'Las menciones de “casas enteras” se interpretan a la luz de textos más explícitos. En Hechos 16, la casa del carcelero oye la Palabra y se regocija por haber creído; en 1 Corintios 16:15 la familia de Estéfanas se dedica al servicio de los santos. La analogía de la fe aclara el sujeto real del bautismo.',
    criterion:'Criterio del paso: una doctrina confiable debe armonizar con el conjunto de la Escritura.'
  },
  {
    name:'Lógica', desc:'Guardián de la verdad', icon:'🛡️', subtitle:'Guardián de la verdad',
    principle:'La verdad revelada por Dios no puede contradecirse. La lógica protege la coherencia interna de nuestras conclusiones doctrinales y evita inferencias inválidas.',
    apply:'Revisamos si las <strong>premisas</strong> son bíblicas y si la <strong>conclusión</strong> se sigue correctamente de ellas. La lógica no gobierna sobre la Escritura; ayuda a no razonar contra ella.',
    verse:'“Dios no es Dios de confusión, sino de paz.”', ref:'1 Corintios 14:33',
    bullets:['Principio de no contradicción.','Coherencia doctrinal.','Armonización de conclusiones exegéticas.'],
    risk:'Sostener afirmaciones que se niegan entre sí, confundiendo misterio bíblico con contradicción humana.',
    example:'<strong>Premisa Mayor:</strong> el bautismo instituido en el Nuevo Testamento exige arrepentimiento moral y fe salvífica personal previa en el sujeto. <strong>Premisa Menor:</strong> los bebés e infantes carecen de la capacidad cognitiva para ejercer arrepentimiento y fe personal consciente. <strong>Conclusión:</strong> los bebés e infantes no corresponden al sujeto del bautismo bíblico neotestamentario; el credobautismo preserva la coherencia de la ordenanza.',
    criterion:'Criterio del paso: una conclusión doctrinal debe ser bíblica y coherente, no solo emocionalmente aceptable.'
  },
  {
    name:'Iglesia histórica', desc:'Testigo subordinado', icon:'⛪', subtitle:'Columna y baluarte de la verdad',
    principle:'La iglesia es columna y baluarte de la verdad, no porque invente la verdad, sino porque la confiesa, preserva y transmite bajo la autoridad de la Escritura.',
    apply:'Consultamos credos, confesiones, testimonio patrístico y teología histórica como testigos subordinados. La historia no decide por encima de la Biblia, pero sí nos ayuda a verificar continuidad, detectar novedades sospechosas y reconocer cómo la iglesia ha defendido la ortodoxia.',
    verse:'“La iglesia del Dios viviente, columna y baluarte de la verdad.”', ref:'1 Timoteo 3:15',
    bullets:['Credos históricos.','Confesiones de fe.','Verificación de ortodoxia.'],
    risk:'Convertir una interpretación privada en autoridad absoluta, como si nadie hubiera leído la Biblia antes que nosotros.',
    example:'Aunque el paidobautismo fue defendido por tradiciones como la presbiteriana y también por la tradición romana, el testimonio histórico conserva una línea persistente de bautismo de conversos: catecúmenos en la iglesia primitiva, voces como Tertuliano desaconsejando el bautismo apresurado de niños, la Reforma Radical y la tradición confesional bautista de 1644 y 1689.',
    criterion:'Criterio del paso: la historia no crea la doctrina; funciona como testigo subordinado que pregunta si nuestra conclusión camina en continuidad responsable con la fe bíblica confesada.'
  },
  {
    name:'Clasificación doctrinal', desc:'Jerarquización', icon:'⚖️', subtitle:'Jerarquización de la verdad',
    principle:'No todas las doctrinas tienen el mismo peso. Clasificar evita tratar lo secundario como si fuera evangelio y evita rebajar lo esencial como si fuera una preferencia local.',
    apply:'Evaluamos tres criterios: si la negación destruye la fe cristiana histórica, si la doctrina moldea profundamente la identidad y práctica de la iglesia, o si pertenece a asuntos periféricos, prudenciales o culturales.',
    verse:'“Retén la forma de las sanas palabras que de mí oíste.”', ref:'2 Timoteo 1:13',
    bullets:['Fundamentales: su negación destruye la fe cristiana histórica.','Esenciales: no determinan salvación, pero moldean identidad, orden y práctica eclesial.','Secundarias: asuntos periféricos o culturales que no alteran la columna vertebral doctrinal.'],
    risk:'Confundir peso doctrinal: declarar no cristiano a quien difiere en un asunto esencial, o tratar una doctrina estructural como si fuera un simple gusto congregacional.',
    example:'El credobautismo no es fundamental: diferir en el sujeto del bautismo no convierte a un creyente fiel en no cristiano. Tampoco es secundario: define membresía visible, eclesiología, administración de ordenanzas y práctica congregacional. Por ello se clasifica como doctrina esencial.',
    criterion:'Criterio del paso: fundamental no significa “lo que más me importa”; esencial no significa “salvación”; secundario no significa “sin valor”. Significa peso doctrinal proporcional.'
  }
];
function startEpistemology(){ state.epiStarted=true; state.epiStep=0; render(); setTimeout(()=>document.querySelector('.epi-process-title')?.scrollIntoView({block:'start',behavior:'smooth'}),0); }
function setEpiStep(i){ state.epiStep=Math.max(0,Math.min(EPI_STEPS.length-1,i)); render(); setTimeout(()=>{document.querySelector('.epi-train-item.active')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});document.querySelector('.epi-process-title')?.scrollIntoView({block:'start',behavior:'smooth'});},0); }
function renderEpistemology(){
  const started=!!state.epiStarted;
  app.innerHTML=`<main class="screen epi-screen">${topbar('Marco Epistemológico')}${!started?renderEpiIntro():renderEpiProcess()}${footer()}</main>`;
  if(started){ setTimeout(()=>document.querySelector('.epi-train-item.active')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}),0); }
}
function renderEpiIntro(){
  return `<section class="epi-intro card">
    <h1>¿Cómo sabemos que lo que creemos es verdad?</h1>
    <p>Toda doctrina cristiana presupone una pregunta previa: ¿cómo distinguimos entre una opinión humana y una enseñanza bíblica? Este módulo presenta el proceso que permite extraer, validar y clasificar doctrinas con fidelidad a la Escritura.</p>
    <p class="epi-note">La verdad bíblica no se improvisa. Se reconoce mediante un método responsable que somete nuestras conclusiones a la Palabra de Dios, a la coherencia doctrinal y al testimonio histórico de la iglesia.</p>
    <button class="btn-primary epi-start" onclick="startEpistemology()">Explora el marco epistemológico</button>
  </section>`;
}
function renderEpiTrain(){return `<section class="epi-train card"><div class="epi-train-track">${EPI_STEPS.map((s,i)=>`<button class="epi-train-item ${i===state.epiStep?'active':''}" onclick="setEpiStep(${i})"><span class="epi-train-num">${i+1}</span><span class="epi-train-icon">${s.icon}</span><span class="epi-train-title">${esc(s.name)}</span><span class="epi-train-desc">${esc(s.desc)}</span></button>`).join('')}</div></section>`;}
function renderEpiProcess(){
 const s=EPI_STEPS[state.epiStep], last=state.epiStep===EPI_STEPS.length-1;
 return `<section class="epi-process"><section class="epi-process-title card"><h1>El proceso completo</h1><p>Recorre los seis pasos que guían la validación doctrinal: desde la Escritura hasta la clasificación responsable de las doctrinas.</p></section>${renderEpiTrain()}<section class="epi-step-card card"><div class="epi-step-head"><div class="epi-step-number">${state.epiStep+1}</div><div><h2>${state.epiStep+1}. ${esc(s.name)}</h2><p>${esc(s.subtitle)}</p></div></div><div class="epi-step-layout"><article class="epi-main-panel"><div class="epi-big-icon">${s.icon}</div><div><h3>Principio</h3><p>${esc(s.principle)}</p><div class="epi-mini-list">${s.bullets.map(b=>`<div>${esc(b)}</div>`).join('')}</div></div></article><aside class="epi-meaning-panel"><h3>¿Cómo se aplica?</h3><p>${s.apply}</p><blockquote>${esc(s.verse)}<span>${esc(s.ref)}</span></blockquote></aside></div><article class="epi-example-card"><div class="epi-example-kicker">Ejemplo práctico persistente</div><h3>Bautismo de creyentes por profesión de fe consciente</h3><p class="question"><strong>Pregunta doctrinal:</strong> ¿quién debe ser bautizado según el patrón del Nuevo Testamento?</p><div class="epi-example-flow"><div class="epi-example-box bad"><h4>✕ Riesgo si se omite este paso</h4><p>${esc(s.risk)}</p></div><div class="epi-flow-arrow">→</div><div class="epi-example-box good"><h4>✓ Aplicación del paso</h4><p>${s.example}</p></div></div><div class="epi-criterion-box">${esc(s.criterion)}</div></article>${last?renderEpiResult():''}<div class="epi-controls"><button class="btn-outline" ${state.epiStep===0?'disabled':''} onclick="setEpiStep(${state.epiStep-1})">← Anterior</button><div class="epi-dots">${EPI_STEPS.map((_,i)=>`<span class="epi-dot ${i===state.epiStep?'active':''}"></span>`).join('')}</div><button class="btn-primary epi-small" onclick="${last?"goto('dashboard')":"setEpiStep("+(state.epiStep+1)+")"}">${last?'Finalizar recorrido':'Siguiente →'}</button></div></section></section>`;
}
function renderEpiResult(){return `<section class="epi-result-card card"><h2>Resultado final: doctrina bíblica confiable</h2><p>Habiendo completado el análisis sistemático a través del marco epistemológico, el bautismo de creyentes por profesión de fe consciente queda presentado como una doctrina bíblica confiable, madura y de profunda relevancia estructural para el orden de la iglesia.</p><div class="epi-download-panel"><div><h3>Tratado completo del ejemplo</h3><p>Descarga el estudio validado con mayor detalle sobre el sujeto del bautismo bajo este marco epistemológico.</p></div><a class="btn-primary epi-download-link" href="recursos/tratado_epistemologico_bautismo.pdf" download>📄 Descargar tratado</a></div></section>`;}

render();
