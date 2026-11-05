/* ============================ desenho & palco ============================ */
function handlesOf(L,t,k){
  const ev=q=>evalProp(L,q,t),x=ev('x'),y=ev('y'),r=ev('rot')*Math.PI/180,s=ev('scale');
  const hw=ev('w')*s/2,hh=ev('h')*s/2,co=Math.cos(r),si=Math.sin(r);
  const P=(lx,ly)=>({x:x+lx*co-ly*si,y:y+lx*si+ly*co});
  return{c:[P(-hw,-hh),P(hw,-hh),P(hw,hh),P(-hw,hh)],rot:P(0,-hh-32*k),top:P(0,-hh),center:{x,y},r,s};
}
function drawSafe(){
  const s=safeInsets(),W=project.w,H=project.h,k=1/viewScale;
  octx.save();octx.setTransform(1,0,0,1,0,0);
  octx.fillStyle='rgba(255,80,80,.10)';
  octx.fillRect(0,0,W,s.t);octx.fillRect(0,H-s.b,W,s.b);octx.fillRect(0,s.t,s.l,H-s.t-s.b);octx.fillRect(W-s.r,s.t,s.r,H-s.t-s.b);
  octx.strokeStyle='rgba(255,120,120,.9)';octx.lineWidth=1.5*k;octx.setLineDash([8*k,6*k]);octx.strokeRect(s.l,s.t,W-s.l-s.r,H-s.t-s.b);
  octx.setLineDash([]);octx.beginPath();octx.moveTo(W/2,0);octx.lineTo(W/2,H);octx.moveTo(0,H/2);octx.lineTo(W,H/2);
  octx.strokeStyle='rgba(255,255,255,.18)';octx.stroke();octx.restore();
}
function drawOverlay(){
  octx.setTransform(1,0,0,1,0,0);octx.clearRect(0,0,ov.width,ov.height);
  if(exporting)return;
  const L=sel();
  if(L&&L.type!=='camera'&&visibleAt(L,time)){
    const m=camMatrix(time,L.depth),k=1/(viewScale*Math.hypot(m.a,m.b)),H=handlesOf(L,time,k);
    octx.save();octx.setTransform(m);octx.lineWidth=1.5*k;octx.strokeStyle='#7c5cff';
    octx.beginPath();H.c.forEach((p,i)=>i?octx.lineTo(p.x,p.y):octx.moveTo(p.x,p.y));octx.closePath();octx.stroke();
    if(!L.locked){
      octx.beginPath();octx.moveTo(H.top.x,H.top.y);octx.lineTo(H.rot.x,H.rot.y);octx.stroke();
      octx.fillStyle='#fff';octx.beginPath();octx.arc(H.rot.x,H.rot.y,6*k,0,7);octx.fill();octx.stroke();
      H.c.forEach(p=>{octx.beginPath();octx.rect(p.x-5*k,p.y-5*k,10*k,10*k);octx.fill();octx.stroke();});
    }
    octx.restore();
  }
  if(showSafe)drawSafe();
}
function draw(){ renderScene(ctx,time); drawOverlay(); }
function fitStage(){
  const vp=$('#viewport'),aw=vp.clientWidth-32,ah=vp.clientHeight-32;
  viewScale=Math.max(.05,Math.min(aw/project.w,ah/project.h));
  const f=$('#frame');f.style.width=Math.round(project.w*viewScale)+'px';f.style.height=Math.round(project.h*viewScale)+'px';
}
function applySize(){cv.width=ov.width=project.w;cv.height=ov.height=project.h;$('#frame').classList.toggle('transp',project.bgMode==='transparent');fitStage();}
new ResizeObserver(()=>{if(project){fitStage();draw();}}).observe($('#viewport'));

/* ============================ histórico & persistência ============================ */
let hist=[],hi=-1; const LS_KEY='motionlab.project.v1';
function usedAssets(){const o={};project.layers.forEach(l=>{if(l.asset&&assets[l.asset])o[l.asset]=assets[l.asset];});(project.fonts||[]).forEach(f=>{if(assets[f.asset])o[f.asset]=assets[f.asset];});return o;}
function save(){try{localStorage.setItem(LS_KEY,JSON.stringify({project,assets:usedAssets()}));}catch(e){}}
function commit(){
  const s=JSON.stringify(project); if(hist[hi]===s)return;
  hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>120)hist.shift();hi=hist.length-1;
  save();updateUndo();
}
function restore(s){
  project=migrate(JSON.parse(s)); if(!getLayer(selId))selId=null; selKF=null;
  time=clamp(time,0,project.duration); loadProjectFonts(); refreshAll();
}
function undo(){if(hi>0){hi--;restore(hist[hi]);save();updateUndo();}}
function redo(){if(hi<hist.length-1){hi++;restore(hist[hi]);save();updateUndo();}}
function updateUndo(){$('#btnUndo').disabled=hi<=0;$('#btnRedo').disabled=hi>=hist.length-1;}
function resetHistory(){hist=[];hi=-1;commit();}
const loadedFonts=new Set();
/* decodifica todas as imagens antes de exibir/exportar, para não haver frames sem mídia */
function preloadAll(){
  return Promise.all(project.layers.filter(l=>l.type==='image'&&l.asset).map(l=>{const im=getImage(l.asset);return im&&im.decode?im.decode().catch(()=>{}):null;}));
}
function loadProjectFonts(){
  preloadAll().then(()=>draw());
  (project.fonts||[]).forEach(f=>{
    const key=f.name+f.asset; if(loadedFonts.has(key)||!assets[f.asset])return; loadedFonts.add(key);
    try{new FontFace(f.name,`url(${assets[f.asset]})`).load().then(ff=>{document.fonts.add(ff);draw();}).catch(()=>loadedFonts.delete(key));}catch(e){}
  });
}

/* ============================ seleção e atualização ============================ */
function select(id){ if(selId===id)return; selId=id;selKF=null;buildInspector();buildTimeline();draw(); }
function refreshAll(){applySize();syncName();buildInspector();buildTimeline();setTime(time);}
function syncName(){const n=$('#projName');if(n&&document.activeElement!==n)n.value=project.name||'';}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2400);}

/* ============================ inspetor ============================ */
const openSecs=new Set(['Transformação','Aparência','Texto','Entrada','Saída','Tempo']);
const optHTML=(arr,val)=>arr.map(([v,l])=>`<option value="${esc(v)}" ${String(v)===String(val)?'selected':''}>${esc(l)}</option>`).join('');
const LBL='class="plabel" style="cursor:default"';
const selRow=(label,path,arr,val)=>`<div class="prow nokf"><span ${LBL}>${label}</span><select data-f="${path}">${optHTML(arr,val)}</select></div>`;
const numRow=(label,path,val,o={})=>`<div class="prow nokf"><span ${LBL}>${label}</span><input type="number" data-f="${path}" value="${r2(val)}" step="${o.step||1}" ${o.min!=null?`min="${o.min}"`:''} ${o.max!=null?`max="${o.max}"`:''}></div>`;
const colRow=(label,path,val)=>`<div class="prow nokf"><span ${LBL}>${label}</span><input type="color" data-f="${path}" value="${val}"></div>`;
const sec=(title,body)=>`<details data-sec="${title}" ${openSecs.has(title)?'open':''}><summary>${title}</summary>${body}</details>`;
const fontOptions=()=>[...FONTS,...(project.fonts||[]).map(f=>[`"${f.name}"`,f.name+' (carregada)'])];
const getPath=(o,p)=>p.split('.').reduce((a,k)=>a&&a[k],o);
function setPath(o,p,v){const ks=p.split('.'),last=ks.pop();let t=o;for(const k of ks)t=t[k];t[last]=v;}

function propRow(k,L,label){
  const p=PMAP[k],val=evalProp(L,k,time),isC=p.type==='color';
  return `<div class="prow"><span class="plabel" data-scrub="${k}" title="Arraste para ajustar (Shift = rápido)">${label||p.label}</span>
    <input data-k="${k}" type="${isC?'color':'number'}" ${isC?'':`step="${p.step}"`} ${p.min!=null?`min="${p.min}"`:''} ${p.max!=null?`max="${p.max}"`:''} value="${isC?fillOf(L,time):r2(val)}">
    <button class="kfb" data-kf="${k}" title="Adicionar/remover keyframe no playhead (K)">◆</button></div>`;
}
function fxBlock(L,which){
  const f=L.fx[which],isIn=which==='in',isText=L.type==='text';
  let h=selRow('Efeito',`fx.${which}.type`,FX_TYPES,f.type)+numRow('Duração (s)',`fx.${which}.dur`,f.dur,{step:.05,min:.05})
    +(isIn?numRow('Atraso (s)',`fx.in.delay`,f.delay,{step:.05,min:0}):'')
    +selRow('Curva',`fx.${which}.ease`,Object.keys(EASE).map(e=>[e,EASE_LABEL[e]]),f.ease)+numRow('Distância (px)',`fx.${which}.dist`,f.dist,{step:5,min:0});
  if(isIn&&isText)h+=selRow('Dividir por','split',SPLITS,L.split)+numRow('Intervalo (s)','stagger',L.stagger,{step:.01,min:0});
  return h;
}
function buildInspector(){
  const el=$('#inspector'),L=sel(),st=el.scrollTop;
  if(!L){
    const cur=`${project.w}x${project.h}`,known=SIZES.some(s=>`${s[0]}x${s[1]}`===cur),B=project.brand;
    const bc=(k,l)=>`<div class="prow nokf"><span ${LBL}>${l}</span><input type="color" data-b="${k}" value="${B[k]}"></div>`;
    const fo=fontOptions();
    el.innerHTML=`<h3>Projeto</h3>
    <div class="prow nokf"><span ${LBL}>Formato</span><select data-p="size">${SIZES.map(s=>`<option value="${s[0]}x${s[1]}" ${`${s[0]}x${s[1]}`===cur?'selected':''}>${s[2]}</option>`).join('')}${known?'':`<option selected>${cur}</option>`}</select></div>
    <div class="prow nokf"><span ${LBL}>Duração (s)</span><input type="number" data-p="duration" min="1" max="180" step="0.5" value="${project.duration}"></div>
    <div class="prow nokf"><span ${LBL}>Fundo do vídeo</span><select data-p="bgMode">${optHTML([['color','Cor da marca'],['chroma','Verde (chroma key)'],['transparent','Transparente (PNG e WebM)']],project.bgMode)}</select></div>
    <div class="prow nokf"><span ${LBL}>FPS</span><select data-p="fps">${[24,30,60].map(f=>`<option ${f===project.fps?'selected':''}>${f}</option>`).join('')}</select></div>
    <p class="hint">Ao trocar o formato, o layout de cada camada é guardado por formato (9:16, 16:9, 1:1) — não é apenas esticado. Ative <b>Margens</b> no player para ver a área segura.</p>
    ${sec('Identidade visual',`<p class="hint" style="margin:0 0 8px">Camadas vinculadas a uma cor ou fonte da marca mudam junto.</p>
      ${bc('bg','Fundo')}${bc('primary','Principal')}${bc('secondary','Secundária')}${bc('accent','Destaque')}${bc('text','Texto')}${bc('muted','Apagado')}
      <div class="prow nokf"><span ${LBL}>Fonte título</span><select data-b="fontHead">${optHTML(fo,B.fontHead)}</select></div>
      <div class="prow nokf"><span ${LBL}>Fonte corpo</span><select data-b="fontBody">${optHTML(fo,B.fontBody)}</select></div>
      <button class="btn" data-act="loadfont" style="width:100%;justify-content:center">Carregar fonte (.ttf .otf .woff)</button>`)}
    ${sec('Cenas',`${project.scenes.length?project.scenes.map(s=>`<div class="prow nokf" style="grid-template-columns:1fr 70px 24px"><input type="text" data-scn-name="${s.id}" value="${esc(s.name)}"><input type="number" data-scn-len="${s.id}" step="0.1" min="0.5" title="Duração da cena (s)" value="${r2(s.end-s.start)}"><button class="kfb" data-scn-go="${s.id}" title="Ir para a cena">▶</button></div>`).join(''):'<p class="hint" style="margin:0">Sem cenas.</p>'}
      <p class="hint">Mudar a duração de uma cena reorganiza todas as camadas e keyframes (as cenas seguintes deslocam).</p>
      <button class="btn" data-act="splitscene" style="width:100%;justify-content:center">Dividir cena no playhead</button>`)}
    <p class="hint"><b>Como animar:</b> escolha uma camada e use <b>Entrada/Saída</b> no inspetor (sem keyframes) ou crie keyframes com o <b style="color:var(--key)">◆</b>.</p>`;
    el.scrollTop=st;return;
  }
  if(L.type==='camera'){
    el.innerHTML=`<h3>Câmera</h3><p class="hint" style="margin-top:0">Move o enquadramento da cena inteira. Camadas com <b>profundidade 0</b> ficam fixas (letterbox, logo); valores acima de 1 criam parallax.</p>
    ${['x','y','scale','rot'].map(k=>propRow(k,L,CAM_LABEL[k])).join('')}
    <h4>Movimentos prontos</h4>
    <div class="chips"><button class="chip loop" data-cam="push">Push-in lento</button><button class="chip loop" data-cam="pull">Pull-out</button><button class="chip loop" data-cam="drift">Deriva lateral</button><button class="chip out" data-cam="reset">Limpar</button></div>
    ${selKF&&selKF.lid==='camera'&&(L.tracks[selKF.k]||[]).includes(selKF.kf)?kfSection(L):''}`;
    refreshInspector();el.scrollTop=st;return;
  }
  const isText=L.type==='text',isImg=L.type==='image',isIcon=L.type==='icon',isShape=!isText&&!isImg&&!isIcon;
  let T=['x','y',...(isText?[]:['w','h']),'rot','scale','opacity'].map(k=>propRow(k,L)).join('')
    +numRow('Profundidade (câmera)','depth',L.depth,{step:.1,min:0})+selRow('Mistura','blend',BLENDS,L.blend);
  let A='';
  if(!isImg)A+=propRow('fill',L)+selRow('Vincular à marca','tok.fill',BRAND_TOKENS,L.tok.fill);
  if(isShape){
    A+=selRow('Gradiente','grad.mode',[['none','Nenhum'],['linear','Linear → cor'],['fade','Linear → transparente'],['vignette','Vinheta (radial)']],L.grad.mode)
      +numRow('Ângulo °','grad.angle',L.grad.angle,{step:5})+colRow('2ª cor','grad.color',L.grad.color)+selRow('2ª cor da marca','tok.grad',BRAND_TOKENS,L.tok.grad);
  }
  if(L.type==='rect'||isImg)A+=propRow('radius',L);
  if(isIcon)A+=selRow('Estilo','istyle',[['duotone','Bicolor'],['solid','Sólido'],['line','Linha grossa']],L.istyle)
    +(L.istyle==='duotone'?selRow('Cor 2 (tom)','tok.tone',[['','Automática (mais clara)'],['custom','Cor própria'],...BRAND_TOKENS.slice(1)],L.tok.tone)+(L.tok.tone==='custom'?colRow('Cor 2 própria','toneColor',L.toneColor):''):'')
    +propRow('reveal',L,'Revelar (varredura)')+`<button class="btn" data-act="pickicon" style="width:100%;justify-content:center;margin-top:6px">Trocar ícone…</button>`;
  if(!isImg&&!isIcon)A+=propRow('strokeW',L)+colRow('Cor contorno','props.stroke',L.props.stroke)+selRow('Contorno da marca','tok.stroke',BRAND_TOKENS,L.tok.stroke);
  if(isShape)A+=`<label class="chk"><input type="checkbox" data-f="noFill" ${L.noFill?'checked':''}> Sem preenchimento (só contorno)</label>`;
  if(isImg)A+=selRow('Enquadramento','fit',[['cover','Preencher (recortar)'],['contain','Conter (sem corte)']],L.fit)+propRow('zoom',L)+propRow('panX',L)+propRow('panY',L)+numRow('Tremor de grão (px)','jitter',L.jitter,{step:1,min:0})
    +`<button class="btn" data-act="replace" style="width:100%;justify-content:center;margin-top:6px">Substituir mídia…</button>`;
  let X='';
  if(isText)X=sec('Texto',`<textarea data-f="text">${esc(L.text)}</textarea>
    ${selRow('Fonte da marca','fontRole',[['','Livre (escolher abaixo)'],['head','Título da marca'],['body','Corpo da marca']],L.fontRole)}
    ${selRow('Fonte','font',fontOptions(),L.font)}${numRow('Tamanho','size',L.size,{min:8,max:800})}
    ${selRow('Peso','weight',[400,500,600,700,800,900].map(w=>[w,w]),L.weight)}
    ${selRow('Alinhamento','align',[['left','Esquerda'],['center','Centro'],['right','Direita']],L.align)}
    ${numRow('Espaçam. letras','ls',L.ls,{step:1})}${numRow('Altura da linha','lh',L.lh,{step:.05,min:.7,max:3})}
    ${numRow('Largura da caixa','maxW',L.maxW,{step:10,min:0})}<p class="hint" style="margin:0 0 6px">Largura 0 = automática. Com valor, o texto quebra em linhas.</p>${propRow('reveal',L)}`);
  const K=selKF&&selKF.lid===L.id&&(L.tracks[selKF.k]||[]).includes(selKF.kf)?kfSection(L):'';
  const M=selRow('Direção','maskDir',[['none','Sem máscara'],['l','Da esquerda'],['r','Da direita'],['u','De cima'],['d','De baixo']],L.maskDir)+propRow('mask',L);
  el.innerHTML=`<h3>Camada</h3>
    <input type="text" data-f="name" value="${esc(L.name)}">
    <div class="btnrow">
      <button class="ib" data-act="up" title="Trazer para frente">${icon('up')}</button>
      <button class="ib" data-act="down" title="Enviar para trás">${icon('down')}</button>
      <button class="ib" data-act="dup" title="Duplicar (Ctrl+D)">${icon('copy')}</button>
      <button class="ib danger" data-act="del" title="Excluir (Del)">${icon('trash')}</button>
    </div>${K}
    ${sec('Transformação',T)}${sec('Aparência',A)}${X}
    ${sec('Entrada',fxBlock(L,'in'))}${sec('Saída',fxBlock(L,'out'))}${sec('Máscara',M)}
    ${sec('Tempo',numRow('Entra em (s)','start',L.start,{step:.05,min:0})+numRow('Sai em (s)','end',L.end,{step:.05,min:0}))}`;
  refreshInspector();el.scrollTop=st;
}
function kfSection(L){
  const f=selKF.kf,custom=String(f.ease).startsWith('cb:'),lab=L.type==='camera'?CAM_LABEL[selKF.k]:PMAP[selKF.k].label;
  const opts=Object.keys(EASE).map(e=>[e,EASE_LABEL[e]]).concat([['cb','Personalizada (cubic-bezier)']]);
  return `<div class="kfsec"><h4>Keyframe · ${lab}</h4>
    <div class="prow nokf"><span ${LBL}>Tempo (s)</span><input type="number" step="0.01" min="0" data-kt value="${r2(f.t)}"></div>
    <div class="prow nokf"><span ${LBL}>Curva</span><select data-ke>${optHTML(opts,custom?'cb':f.ease)}</select></div>
    ${custom?`<div class="prow nokf"><span ${LBL}>Bézier</span><input type="text" data-kcb value="${esc(f.ease.slice(3))}" title="x1,y1,x2,y2"></div>`:''}
    <p class="hint" style="margin:0 0 6px">A curva controla a velocidade até o próximo keyframe.</p>
    <button class="btn" data-act="delkf" style="width:100%;justify-content:center">Excluir keyframe</button></div>`;
}
function refreshInspector(){
  const L=sel(); if(!L)return;
  $$('#inspector [data-k]').forEach(inp=>{
    if(inp===document.activeElement)return;
    const k=inp.dataset.k;inp.value=k==='fill'?fillOf(L,time):r2(evalProp(L,k,time));
  });
  $$('#inspector [data-kf]').forEach(b=>{
    const tr=L.tracks[b.dataset.kf];
    b.classList.toggle('has',!!(tr&&tr.length));
    b.classList.toggle('on',!!(tr&&tr.some(f=>Math.abs(f.t-time)<eps())));
  });
}
function afterEdit(rebuildTl=true){ draw(); refreshInspector(); if(rebuildTl)buildTimeline(); }

const ins=$('#inspector');
ins.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.sec){d.open?openSecs.add(d.dataset.sec):openSecs.delete(d.dataset.sec);}},true);
ins.addEventListener('input',e=>{
  const t=e.target,L=sel();
  if(t.dataset.b){project.brand[t.dataset.b]=t.value;if(t.dataset.b==='bg')project.bg=t.value;draw();return;}
  if(t.dataset.scnName){const s=project.scenes.find(x=>x.id===t.dataset.scnName);if(s){s.name=t.value;buildTimeline();}return;}
  if(!L)return;
  if(t.dataset.k){
    const v=t.type==='color'?t.value:parseFloat(t.value);if(Number.isNaN(v))return;
    if(t.dataset.k==='fill'&&L.tok&&L.tok.fill){L.tok.fill='';const s=$('[data-f="tok.fill"]');if(s)s.value='';}
    setProp(L,t.dataset.k,v);afterEdit();
  }else if(t.dataset.f){
    const f=t.dataset.f;let v=t.type==='checkbox'?t.checked:t.type==='number'?parseFloat(t.value):t.value;
    if(t.type==='number'&&Number.isNaN(v))return;
    setPath(L,f,v);
    if(f==='start'||f==='end'){L.start=clamp(L.start,0,project.duration);L.end=clamp(L.end,L.start+.05,project.duration);}
    draw(); if(f==='name'||f==='start'||f==='end')buildTimeline();
  }else if(t.dataset.kt!==undefined&&selKF){
    const v=parseFloat(t.value);if(!Number.isNaN(v)){selKF.kf.t=r3(clamp(v,0,project.duration));L.tracks[selKF.k].sort((a,b)=>a.t-b.t);draw();buildTimeline();}
  }else if(t.dataset.ke!==undefined&&selKF){
    selKF.kf.ease=t.value==='cb'?'cb:0.4,0,0.2,1':t.value;draw();if(t.value==='cb')buildInspector();
  }else if(t.dataset.kcb!==undefined&&selKF){
    if(t.value.split(',').length===4)selKF.kf.ease='cb:'+t.value.replace(/\s/g,'');draw();
  }
});
ins.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.p){
    const p=t.dataset.p;
    if(p==='fps')project.fps=parseInt(t.value);
    else if(p==='bgMode')project.bgMode=t.value;
    else if(p==='duration'){const nd=clamp(parseFloat(t.value)||5,1,180),od=project.duration;
      project.layers.forEach(l=>{l.end=l.end>=od-1e-6?nd:Math.min(l.end,nd);l.start=Math.min(l.start,nd-.1);});
      project.duration=nd;project.camera.end=nd;if(project.scenes.length){const last=project.scenes[project.scenes.length-1];last.end=Math.max(last.start+.5,nd);}time=Math.min(time,nd);}
    else if(p==='size'){const[w,h]=t.value.split('x').map(Number);setFormat(w,h);}
    commit();refreshAll();return;
  }
  if(t.dataset.scnLen){retimeScene(t.dataset.scnLen,parseFloat(t.value)||1);commit();refreshAll();return;}
  commit();
  if(t.dataset.f==='istyle'||t.dataset.f==='tok.tone')buildInspector();
  else if(t.dataset.f==='split'||t.dataset.f==='maskDir'||t.dataset.f==='grad.mode')refreshInspector();
});
ins.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return; const L=sel();
  if(b.dataset.scnGo){const s=project.scenes.find(x=>x.id===b.dataset.scnGo);if(s)setTime(s.start,true);return;}
  if(b.dataset.act==='loadfont'){$('#fileFont').click();return;}
  if(b.dataset.act==='splitscene'){splitScene();return;}
  if(!L)return;
  if(b.dataset.cam){camPreset(b.dataset.cam);return;}
  if(b.dataset.kf){toggleKF(L,b.dataset.kf);commit();buildInspector();buildTimeline();draw();}
  else if(b.dataset.act)doAct(b.dataset.act);
});
ins.addEventListener('pointerdown',e=>{
  const lab=e.target.closest('[data-scrub]'); const L=sel(); if(!lab||!L)return;
  const k=lab.dataset.scrub,p=PMAP[k],x0=e.clientX,v0=evalProp(L,k,time); let moved=false;
  dragWin(e,ev=>{
    moved=true; let v=v0+(ev.clientX-x0)*p.step*(ev.shiftKey?10:1);
    if(p.min!=null)v=Math.max(p.min,v); if(p.max!=null)v=Math.min(p.max,v);
    setProp(L,k,r3(v));afterEdit(false);
  },()=>{if(moved){buildTimeline();commit();}});
});
function doAct(a){
  const L=sel(); if(!L||(L.type==='camera'&&a!=='delkf'))return;
  if(a==='replace'){replaceTarget=L.id;$('#fileImg').click();return;}
  if(a==='pickicon'){openIconPicker(k=>{L.icon=k;commit();buildInspector();draw();});return;}
  const arr=project.layers,i=arr.indexOf(L);
  if(a==='up'&&i<arr.length-1){[arr[i],arr[i+1]]=[arr[i+1],arr[i]];}
  else if(a==='down'&&i>0){[arr[i],arr[i-1]]=[arr[i-1],arr[i]];}
  else if(a==='dup'){
    const C=JSON.parse(JSON.stringify(L));C.id=uid();C.name=L.name+' cópia';
    C.props.x+=30;C.props.y+=30;(C.tracks.x||[]).forEach(f=>f.v+=30);(C.tracks.y||[]).forEach(f=>f.v+=30);
    arr.splice(i+1,0,C);selId=C.id;selKF=null;
  }
  else if(a==='del'){arr.splice(i,1);selId=null;selKF=null;}
  else if(a==='delkf'&&selKF){const tr=L.tracks[selKF.k],j=tr.indexOf(selKF.kf);if(j>=0)tr.splice(j,1);if(!tr.length){L.props[selKF.k]=selKF.kf.v;delete L.tracks[selKF.k];}selKF=null;}
  commit();buildInspector();buildTimeline();draw();
}

/* ============================ interação no palco ============================ */
function toProject(e){const r=ov.getBoundingClientRect();return{x:(e.clientX-r.left)*project.w/r.width,y:(e.clientY-r.top)*project.h/r.height};}
function toWorld(e,L){const p=toProject(e),q=camMatrix(time,L?L.depth:1).inverse().transformPoint(new DOMPoint(p.x,p.y));return{x:q.x,y:q.y};}
function dragWin(e,move,up){
  const m=ev=>move(ev);
  const u=ev=>{window.removeEventListener('pointermove',m);window.removeEventListener('pointerup',u);window.removeEventListener('pointercancel',u);up&&up(ev);};
  window.addEventListener('pointermove',m);window.addEventListener('pointerup',u);window.addEventListener('pointercancel',u);
  e.preventDefault();
}
function hitTest(e){
  for(let i=project.layers.length-1;i>=0;i--){
    const L=project.layers[i]; if(L.locked||!visibleAt(L,time))continue;
    const p=toWorld(e,L),ev=k=>evalProp(L,k,time),s=Math.max(ev('scale'),1e-4),a=-ev('rot')*Math.PI/180;
    const dx=p.x-ev('x'),dy=p.y-ev('y');
    const lx=(dx*Math.cos(a)-dy*Math.sin(a))/s,ly=(dx*Math.sin(a)+dy*Math.cos(a))/s;
    const hw=Math.max(ev('w')/2,6/viewScale),hh=Math.max(ev('h')/2,6/viewScale);
    if(L.type==='ellipse'){if(lx*lx/(hw*hw)+ly*ly/(hh*hh)<=1)return L;}
    else if(Math.abs(lx)<=hw&&Math.abs(ly)<=hh)return L;
  }
  return null;
}
ov.addEventListener('pointerdown',e=>{
  if(exporting)return;
  const L=sel();
  if(L&&L.type!=='camera'&&!L.locked&&visibleAt(L,time)){
    const m=camMatrix(time,L.depth),k=1/(viewScale*Math.hypot(m.a,m.b)),p=toWorld(e,L),H=handlesOf(L,time,k),r=12*k;
    if(Math.hypot(p.x-H.rot.x,p.y-H.rot.y)<r)return startRotate(e,L);
    const ci=H.c.findIndex(q=>Math.hypot(p.x-q.x,p.y-q.y)<r);
    if(ci>=0)return startResize(e,L,ci,H);
  }
  const hit=hitTest(e);
  if(hit){select(hit.id);startMove(e,hit);} else select(null);
});
function startMove(e,L){
  const p0=toWorld(e,L),x0=evalProp(L,'x',time),y0=evalProp(L,'y',time);let moved=false;
  dragWin(e,ev=>{
    const p=toWorld(ev,L),dx=p.x-p0.x,dy=p.y-p0.y;
    if(!moved&&Math.hypot(dx,dy)*viewScale<3)return; moved=true;
    let nx=x0+dx,ny=y0+dy; if(ev.shiftKey){if(Math.abs(dx)>Math.abs(dy))ny=y0;else nx=x0;}
    setProp(L,'x',r2(nx));setProp(L,'y',r2(ny));afterEdit(false);
  },()=>{if(moved){buildTimeline();commit();}});
}
function startRotate(e,L){
  const cx=evalProp(L,'x',time),cy=evalProp(L,'y',time);let cur=evalProp(L,'rot',time);
  dragWin(e,ev=>{
    const p=toWorld(ev,L);let raw=Math.atan2(p.y-cy,p.x-cx)*180/Math.PI+90;
    if(ev.shiftKey)raw=Math.round(raw/15)*15;
    cur+=(((raw-cur)%360)+540)%360-180; setProp(L,'rot',r2(cur));afterEdit(false);
  },()=>{buildTimeline();commit();});
}
function startResize(e,L,ci,H){
  const isText=L.type==='text',fixed=H.c[(ci+2)%4],co=Math.cos(H.r),si=Math.sin(H.r),s0=H.s;
  const w0=evalProp(L,'w',time),h0=evalProp(L,'h',time),ratio=w0/Math.max(h0,1e-3);
  const d0=Math.hypot(H.c[ci].x-H.center.x,H.c[ci].y-H.center.y);
  dragWin(e,ev=>{
    const p=toWorld(ev,L);
    if(isText){setProp(L,'scale',r3(Math.max(.02,s0*Math.hypot(p.x-H.center.x,p.y-H.center.y)/d0)));afterEdit(false);return;}
    const dx=p.x-fixed.x,dy=p.y-fixed.y;let du=dx*co+dy*si,dv=-dx*si+dy*co;
    let w=Math.max(4,Math.abs(du)/s0),h=Math.max(4,Math.abs(dv)/s0);
    if(ev.shiftKey){if(w/h>ratio)h=w/ratio;else w=h*ratio;}
    du=Math.sign(du||1)*w*s0;dv=Math.sign(dv||1)*h*s0;
    setProp(L,'w',r2(w));setProp(L,'h',r2(h));
    setProp(L,'x',r2(fixed.x+(du*co-dv*si)/2));setProp(L,'y',r2(fixed.y+(du*si+dv*co)/2));
    afterEdit(false);
  },()=>{buildTimeline();commit();});
}

/* ============================ linha do tempo ============================ */
const propLabel=(L,k)=>L.type==='camera'?CAM_LABEL[k]:PMAP[k].label;
function buildTimeline(){
  const sc=$('#tlScroll'),sl=sc.scrollLeft,st=sc.scrollTop,pps=pxPerSec,W=Math.ceil(project.duration*pps);
  const steps=[.1,.25,.5,1,2,5,10,30],major=steps.find(s=>s*pps>=70)||60;
  sc.style.setProperty('--grid',(major*pps/5)+'px');
  let h=`<div class="tl-inner" id="tlInner" style="width:${LABELW+W+60}px">`;
  h+=`<div class="tl-row tl-ruler"><div class="tl-label">Camadas</div><div class="tl-track" id="ruler" style="width:${W}px">`;
  for(let t=0;t<=project.duration+1e-6;t+=major)h+=`<span class="tick" style="left:${t*pps}px">${+t.toFixed(2)}s</span>`;
  h+=`</div></div>`;
  if(project.scenes.length)h+=`<div class="tl-row scn"><div class="tl-label" style="cursor:default">Cenas</div><div class="tl-track" style="width:${W}px">${project.scenes.map((s,i)=>`<div class="scn-b" data-scn="${s.id}" style="left:${s.start*pps}px;width:${(s.end-s.start)*pps-2}px;--c:${s.color||['#7c5cff','#22d3ee','#ffc857','#ff5d73','#5bc0be'][i%5]}" title="${esc(s.name)} · ${r2(s.end-s.start)}s">${esc(s.name)}</div>`).join('')}</div></div>`;
  const rowFor=(L,isCam)=>{
    const on=L.id===selId,times=new Set();Object.values(L.tracks).forEach(tr=>tr.forEach(f=>times.add(f.t)));
    let r=`<div class="tl-row ${on?'sel':''} ${isCam?'cam':''}" data-lid="${L.id}"><div class="tl-label" data-lid="${L.id}">`;
    r+=isCam?`<span class="mini" style="color:var(--accent2)">${icon('camera',14)}</span><span class="nm">Câmera</span>`:
      `<button class="mini ${L.visible?'':'off'}" data-tog="visible" title="Mostrar/ocultar">${icon(L.visible?'eye':'eyeoff',14)}</button>
       <button class="mini ${L.locked?'':'off'}" data-tog="locked" title="Bloquear">${icon(L.locked?'lock':'unlock',14)}</button><span class="nm">${esc(L.name)}</span>`;
    r+=`</div><div class="tl-track" style="width:${W}px" data-scrubtrack>`;
    if(!isCam){
      const fill=tokColor(L,'fill',L.props.fill);
      r+=`<div class="tl-bar ${L.locked?'locked':''} ${L.visible?'':'hidden'}" data-bar="${L.id}" style="left:${L.start*pps}px;width:${Math.max(6,(L.end-L.start)*pps)}px;background:${L.type==='image'||L.type==='text'?'#4b5675':fill+'b8'}"><i class="bh l" data-trim="l"></i><i class="bh r" data-trim="r"></i></div>`;
    }
    r+=[...times].map(t=>`<b class="mk" style="left:${t*pps}px"></b>`).join('')+`</div></div>`;
    if(on)ANIM_ORDER.filter(k=>L.tracks[k]).forEach(k=>{
      r+=`<div class="tl-row sub"><div class="tl-label" data-lid="${L.id}"><span class="nm">↳ ${propLabel(L,k)}</span></div>
        <div class="tl-track" style="width:${W}px" data-scrubtrack>${L.tracks[k].map((f,j)=>`<i class="kfd ${selKF&&selKF.kf===f?'sel':''}" data-lid="${L.id}" data-k="${k}" data-i="${j}" style="left:${f.t*pps}px" title="${propLabel(L,k)}: ${r2(typeof f.v==='number'?f.v:0)} · ${EASE_LABEL[f.ease]||'Personalizada'}"></i>`).join('')}</div></div>`;
    });
    return r;
  };
  h+=rowFor(project.camera,true);
  for(let i=project.layers.length-1;i>=0;i--)h+=rowFor(project.layers[i],false);
  h+=`<div id="playhead" style="left:${LABELW+time*pps}px"></div></div>`;
  sc.innerHTML=h; sc.scrollLeft=sl; sc.scrollTop=st;
}
function timeFromX(clientX){const r=$('#tlInner').getBoundingClientRect();return(clientX-r.left-LABELW)/pxPerSec;}
$('#tlScroll').addEventListener('pointerdown',e=>{
  const T=e.target;
  const tog=T.closest('[data-tog]');
  if(tog){const L=getLayer(tog.closest('[data-lid]').dataset.lid);L[tog.dataset.tog]=!L[tog.dataset.tog];commit();buildTimeline();draw();e.stopPropagation();return;}
  const sb=T.closest('[data-scn]');
  if(sb){const s=project.scenes.find(x=>x.id===sb.dataset.scn);select(null);if(s)setTime(s.start,true);return;}
  const kfd=T.closest('.kfd');
  if(kfd){
    const L=getLayer(kfd.dataset.lid),k=kfd.dataset.k,f=L.tracks[k][+kfd.dataset.i];
    selId=L.id;selKF={lid:L.id,k,kf:f};
    $$('.kfd.sel').forEach(x=>x.classList.remove('sel'));kfd.classList.add('sel');
    const x0=e.clientX,t0=f.t;let moved=false;
    buildInspector();
    dragWin(e,ev=>{
      moved=true;const nt=clamp(t0+(ev.clientX-x0)/pxPerSec,0,project.duration);
      f.t=r3(ev.shiftKey?nt:Math.round(nt*project.fps)/project.fps);kfd.style.left=f.t*pxPerSec+'px';
      L.tracks[k].sort((a,b)=>a.t-b.t);draw();
    },()=>{if(moved)commit();buildTimeline();buildInspector();});
    return;
  }
  const bar=T.closest('.tl-bar');
  if(bar){
    const L=getLayer(bar.dataset.bar);
    if(selId!==L.id){selId=L.id;selKF=null;buildInspector();buildTimeline();}
    if(L.locked)return;
    const mode=T.dataset.trim||'move',x0=e.clientX,s0=L.start,e0=L.end;
    const orig=mode==='move'?JSON.parse(JSON.stringify(L.tracks)):null;let moved=false;
    dragWin(e,ev=>{
      moved=true;let d=(ev.clientX-x0)/pxPerSec; d=Math.round(d*project.fps)/project.fps;
      if(mode==='move'){d=clamp(d,-s0,project.duration-e0);L.start=r3(s0+d);L.end=r3(e0+d);
        for(const k in orig)L.tracks[k].forEach((f,i)=>f.t=r3(orig[k][i].t+d));}
      else if(mode==='l')L.start=r3(clamp(s0+d,0,L.end-.05));
      else L.end=r3(clamp(e0+d,L.start+.05,project.duration));
      draw();
      const b=$(`[data-bar="${L.id}"]`);if(b){b.style.left=L.start*pxPerSec+'px';b.style.width=Math.max(6,(L.end-L.start)*pxPerSec)+'px';}
    },()=>{if(moved){commit();buildTimeline();buildInspector();}});
    return;
  }
  const lab=T.closest('.tl-label[data-lid]');
  if(lab){select(lab.dataset.lid);return;}
  if(T.closest('[data-scrubtrack]')||T.closest('#ruler')){
    if(!T.closest('#ruler'))select(T.closest('[data-lid]')?.dataset.lid||null);
    setTime(timeFromX(e.clientX),true);
    dragWin(e,ev=>setTime(timeFromX(ev.clientX),true));
  }
});
$('#tlZoom').addEventListener('input',e=>{pxPerSec=+e.target.value;buildTimeline();});
function fitTimeline(){
  const w=$('#tlScroll').clientWidth-LABELW-40;
  pxPerSec=clamp(w/project.duration,30,500);$('#tlZoom').value=pxPerSec;buildTimeline();
}
$('#btnFit').onclick=fitTimeline;

/* ============================ cenas, formatos e câmera ============================ */
function retimeScene(id,newLen){
  const s=project.scenes.find(x=>x.id===id); if(!s)return;
  newLen=Math.max(.5,newLen);const len=s.end-s.start,ratio=newLen/len,delta=newLen-len;
  const f=t=>t<=s.start?t:t>=s.end?t+delta:s.start+(t-s.start)*ratio;
  const holders=[...project.layers,project.camera,...Object.values(project.variants).flatMap(v=>Object.values(v))];
  holders.forEach(h=>{for(const k in(h.tracks||{}))h.tracks[k].forEach(kf=>kf.t=r3(f(kf.t)));if('start'in h&&'end'in h){h.start=r3(f(h.start));h.end=r3(f(h.end));}});
  project.scenes.forEach(x=>{x.start=r3(f(x.start));x.end=r3(f(x.end));});
  project.duration=r3(project.duration+delta);project.camera.end=project.duration;time=Math.min(time,project.duration);
}
function splitScene(){
  const s=project.scenes.find(x=>time>x.start+.2&&time<x.end-.2);
  if(!s){toast('Posicione o playhead dentro de uma cena.');return;}
  const n={id:uid(),name:s.name+' (2)',start:r3(time),end:s.end,color:s.color};s.end=r3(time);
  project.scenes.splice(project.scenes.indexOf(s)+1,0,n);commit();buildInspector();buildTimeline();
}
function rescaleLayer(L,sx,sy,m){
  const o=L.props;o.x*=sx;o.y*=sy;o.w*=m;o.h*=m;o.radius*=m;o.strokeW*=m;
  for(const k of['x','y','w','h','radius','strokeW'])(L.tracks[k]||[]).forEach(f=>{f.v*=(k==='x'?sx:k==='y'?sy:m);});
  if(L.size){L.size=Math.round(L.size*m);L.maxW*=m;L.ls*=m;}
  if(L.fx){L.fx.in.dist*=m;L.fx.out.dist*=m;}
}
function snapGeo(){
  const o={};
  [...project.layers,project.camera].forEach(L=>{
    const g={props:{},tracks:{}};
    GEO.forEach(k=>{if(k in L.props)g.props[k]=L.props[k];if(L.tracks[k])g.tracks[k]=JSON.parse(JSON.stringify(L.tracks[k]));});
    if(L.type==='text'){g.size=L.size;g.maxW=L.maxW;g.ls=L.ls;}
    o[L.id]=g;
  });
  return o;
}
function applyGeo(o){
  [...project.layers,project.camera].forEach(L=>{
    const g=o[L.id];if(!g)return;
    Object.assign(L.props,g.props);
    GEO.forEach(k=>{if(g.tracks[k])L.tracks[k]=JSON.parse(JSON.stringify(g.tracks[k]));else delete L.tracks[k];});
    if(L.type==='text'){L.size=g.size;L.maxW=g.maxW;L.ls=g.ls;}
  });
}
/* cada formato guarda seu próprio layout; formatos novos recebem um reescalonamento proporcional */
function setFormat(w,h){
  if(w===project.w&&h===project.h)return;
  const ow=project.w,oh=project.h;
  project.variants[`${ow}x${oh}`]=snapGeo();
  const v=project.variants[`${w}x${h}`],sx=w/ow,sy=h/oh,m=Math.min(sx,sy);
  if(v){
    project.layers.filter(L=>!v[L.id]).forEach(L=>rescaleLayer(L,sx,sy,m));
    project.w=w;project.h=h;applyGeo(v);
  }else{
    project.layers.forEach(L=>rescaleLayer(L,sx,sy,m));
    const c=project.camera.props;c.x*=sx;c.y*=sy;(project.camera.tracks.x||[]).forEach(f=>f.v*=sx);(project.camera.tracks.y||[]).forEach(f=>f.v*=sy);
    project.w=w;project.h=h;
  }
}
function camPreset(n){
  const C=project.camera,d=project.duration,W=project.w,H=project.h;
  if(n==='reset'){C.tracks={};C.props={x:W/2,y:H/2,scale:1,rot:0};}
  if(n==='push'){C.tracks.scale=[{t:0,v:1,ease:'inOutSine'},{t:d,v:1.12,ease:'linear'}];}
  if(n==='pull'){C.tracks.scale=[{t:0,v:1.12,ease:'inOutSine'},{t:d,v:1,ease:'linear'}];}
  if(n==='drift'){C.tracks.x=[{t:0,v:W/2-W*.015,ease:'inOutSine'},{t:d,v:W/2+W*.015,ease:'linear'}];C.tracks.scale=[{t:0,v:1.05,ease:'linear'},{t:d,v:1.05,ease:'linear'}];}
  selKF=null;commit();buildInspector();buildTimeline();draw();
}
/* ============================ tempo / playback ============================ */
const fmt=t=>t.toFixed(2)+'s';
function setTime(t,snap=false){
  t=clamp(t,0,project.duration); if(snap)t=Math.round(t*project.fps)/project.fps;
  time=t;
  $('#scrub').value=t/project.duration;
  $('#timeLbl').innerHTML=`<b>${fmt(t)}</b> / ${fmt(project.duration)}`;
  const ph=$('#playhead'); if(ph)ph.style.left=(LABELW+t*pxPerSec)+'px';
  refreshInspector(); draw();
}
function play(){ if(playing)return; if(time>=project.duration-1e-6)time=0; playing=true;lastTs=performance.now();$('#btnPlay').innerHTML=icon('pause');rafId=requestAnimationFrame(tick);}
function pause(){playing=false;cancelAnimationFrame(rafId);$('#btnPlay').innerHTML=icon('play');}
function tick(ts){
  if(!playing)return;
  let t=time+(ts-lastTs)/1000;lastTs=ts;
  if(t>=project.duration){ if(loopOn)t=t%project.duration; else{setTime(project.duration);pause();return;} }
  setTime(t); rafId=requestAnimationFrame(tick);
}

/* ============================ presets de animação ============================ */
const B=(L,k)=>L.props[k];
function setRange(L,k,list){
  const ts=list.map(a=>a[0]),t0=Math.min(...ts),t1=Math.max(...ts);
  const kept=(L.tracks[k]||[]).filter(f=>f.t<t0-1e-6||f.t>t1+1e-6);
  list.forEach(([t,v,e])=>kept.push({t:r3(t),v,ease:e||'outCubic'}));
  kept.sort((a,b)=>a.t-b.t);L.tracks[k]=kept;
}
function cycle(L,k,t0,t1,step,vals,ease){
  const list=[];let t=t0,i=0;
  while(t<t1-1e-6){list.push([t,vals[i%vals.length],ease]);t+=step;i++;}
  list.push([t1,vals[i%vals.length],'linear']);setRange(L,k,list);
}
const fadeIn=(L,o,d)=>setRange(L,'opacity',[[o.t0,0,'outQuad'],[o.t0+(d||o.d),B(L,'opacity')||1]]);
const fadeOut=(L,o)=>setRange(L,'opacity',[[o.t1-o.d,B(L,'opacity')||1,'inQuad'],[o.t1,0]]);
const dist=()=>project.w*.3, distY=()=>project.h*.3;
const PRESETS=[
 {g:'Entrada',kind:'in',items:[
  ['Aparecer',(L,o)=>fadeIn(L,o)],
  ['Deslizar ←',(L,o)=>{setRange(L,'x',[[o.t0,B(L,'x')-dist(),'outCubic'],[o.t0+o.d,B(L,'x')]]);fadeIn(L,o,o.d*.6);}],
  ['Deslizar →',(L,o)=>{setRange(L,'x',[[o.t0,B(L,'x')+dist(),'outCubic'],[o.t0+o.d,B(L,'x')]]);fadeIn(L,o,o.d*.6);}],
  ['Subir',(L,o)=>{setRange(L,'y',[[o.t0,B(L,'y')+distY()*.5,'outCubic'],[o.t0+o.d,B(L,'y')]]);fadeIn(L,o,o.d*.6);}],
  ['Descer',(L,o)=>{setRange(L,'y',[[o.t0,B(L,'y')-distY()*.5,'outCubic'],[o.t0+o.d,B(L,'y')]]);fadeIn(L,o,o.d*.6);}],
  ['Pop',(L,o)=>{setRange(L,'scale',[[o.t0,0,'outBack'],[o.t0+o.d,B(L,'scale')]]);fadeIn(L,o,o.d*.3);}],
  ['Girar e surgir',(L,o)=>{setRange(L,'rot',[[o.t0,B(L,'rot')-180,'outCubic'],[o.t0+o.d,B(L,'rot')]]);setRange(L,'scale',[[o.t0,0,'outBack'],[o.t0+o.d,B(L,'scale')]]);fadeIn(L,o,o.d*.4);}],
  ['Zoom suave',(L,o)=>{setRange(L,'scale',[[o.t0,B(L,'scale')*1.4,'outCubic'],[o.t0+o.d,B(L,'scale')]]);fadeIn(L,o);}],
  ['Quicar',(L,o)=>{setRange(L,'y',[[o.t0,B(L,'y')-distY(),'outBounce'],[o.t0+o.d*1.6,B(L,'y')]]);fadeIn(L,o,o.d*.3);}],
  ['Crescer largura',(L,o)=>{if(L.type==='text')throw'Não disponível para texto.';setRange(L,'w',[[o.t0,0,'outCubic'],[o.t0+o.d,B(L,'w')]]);}]
 ]},
 {g:'Saída',kind:'out',items:[
  ['Desaparecer',(L,o)=>fadeOut(L,o)],
  ['Sair →',(L,o)=>{setRange(L,'x',[[o.t1-o.d,B(L,'x'),'inCubic'],[o.t1,B(L,'x')+dist()]]);fadeOut(L,o);}],
  ['Sair ←',(L,o)=>{setRange(L,'x',[[o.t1-o.d,B(L,'x'),'inCubic'],[o.t1,B(L,'x')-dist()]]);fadeOut(L,o);}],
  ['Encolher',(L,o)=>{setRange(L,'scale',[[o.t1-o.d,B(L,'scale'),'inBack'],[o.t1,0]]);}],
  ['Cair',(L,o)=>{setRange(L,'y',[[o.t1-o.d,B(L,'y'),'inCubic'],[o.t1,B(L,'y')+distY()]]);fadeOut(L,o);}]
 ]},
 {g:'Loop / ênfase',kind:'loop',items:[
  ['Pulsar',(L,o)=>cycle(L,'scale',o.t0,o.t1,o.d,[B(L,'scale'),B(L,'scale')*1.12],'inOutQuad')],
  ['Flutuar',(L,o)=>cycle(L,'y',o.t0,o.t1,o.d*1.5,[B(L,'y'),B(L,'y')-18],'inOutQuad')],
  ['Balançar',(L,o)=>cycle(L,'rot',o.t0,o.t1,o.d/2,[B(L,'rot'),B(L,'rot')+8,B(L,'rot'),B(L,'rot')-8],'inOutQuad')],
  ['Girar sem parar',(L,o)=>{const n=Math.max(1,Math.round((o.t1-o.t0)/(o.d*4)));setRange(L,'rot',[[o.t0,B(L,'rot'),'linear'],[o.t1,B(L,'rot')+360*n,'linear']]);}],
  ['Piscar',(L,o)=>cycle(L,'opacity',o.t0,o.t1,o.d/2,[B(L,'opacity')||1,.15],'inOutQuad')]
 ]},
 {g:'Texto',kind:'in',items:[
  ['Digitar',(L,o)=>{if(L.type!=='text')throw'Só para camadas de texto.';setRange(L,'reveal',[[o.t0,0,'linear'],[o.t0+Math.max(o.d,String(L.text).length*.06),1]]);}]
 ]}
];
function buildPresets(){
  $('#presets').innerHTML=PRESETS.map((g,gi)=>`<h4 style="margin-top:${gi?12:0}px">${g.g}</h4><div class="chips">${g.items.map((it,ii)=>`<button class="chip ${g.g==='Texto'?'text':g.kind}" data-ps="${gi}.${ii}">${it[0]}</button>`).join('')}</div>`).join('');
}
$('#presets').addEventListener('click',e=>{
  const b=e.target.closest('[data-ps]'); if(!b)return;
  const L=sel(); if(!L||L.type==='camera'){toast(L?'Use os movimentos de câmera no inspetor.':'Selecione uma camada primeiro.');return;}
  const[gi,ii]=b.dataset.ps.split('.').map(Number),g=PRESETS[gi];
  const d=Math.max(.1,parseFloat($('#psDur').value)||.6),head=$('#psAnchor').value==='head';
  const o={d,t0:head?time:L.start,t1:head?time:L.end};
  try{g.items[ii][1](L,o);}catch(err){toast(typeof err==='string'?err:'Não foi possível aplicar.');return;}
  commit();buildInspector();buildTimeline();
  const seek=g.kind==='out'?o.t1-d-.25:g.kind==='loop'?o.t0:o.t0-.15;
  setTime(Math.max(0,seek));pause();play();
});


/* ============================ adicionar camadas / mídia / fontes ============================ */
let replaceTarget=null;
function addLayer(type){
  if(type==='image'){replaceTarget=null;$('#fileImg').click();return;}
  if(type==='icon'){openIconPicker(k=>{const L=makeLayer('icon',{icon:k,name:GLYPHS[k].label});project.layers.push(L);selId=L.id;selKF=null;commit();buildInspector();buildTimeline();draw();});return;}
  const defs={rect:{props:{w:360,h:220,radius:16}},ellipse:{props:{w:260,h:260,fill:'#22d3ee'}},triangle:{props:{w:260,h:240,fill:'#ffc857'}},star:{props:{w:260,h:260,fill:'#ff5d73'}},text:{}};
  const L=makeLayer(type,JSON.parse(JSON.stringify(defs[type])));
  project.layers.push(L);selId=L.id;selKF=null;commit();buildInspector();buildTimeline();draw();
}
$('#left').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addLayer(b.dataset.add);});
function readFile(f,cb){const rd=new FileReader();rd.onload=()=>cb(rd.result);rd.readAsDataURL(f);}
$('#fileImg').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  readFile(f,url=>{
    const id=uid();assets[id]=url;const im=new Image();
    im.onload=()=>{
      imgCache[id]=im;
      const tgt=replaceTarget&&getLayer(replaceTarget);replaceTarget=null;
      if(tgt){tgt.asset=id;commit();buildInspector();draw();toast('Mídia substituída — enquadramento e animações mantidos.');return;}
      const m=Math.min(1,520/Math.max(im.naturalWidth,im.naturalHeight));
      const L=makeLayer('image',{asset:id,name:f.name.replace(/\.[^.]+$/,'').slice(0,24)||'Imagem',props:{w:Math.round(im.naturalWidth*m),h:Math.round(im.naturalHeight*m)}});
      project.layers.push(L);selId=L.id;commit();buildInspector();buildTimeline();draw();
    };
    im.onerror=()=>toast('Não foi possível ler a imagem.');im.src=url;
  });
});
$('#fileFont').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  readFile(f,url=>{
    const name=f.name.replace(/\.[^.]+$/,'').replace(/[^\w \-]/g,'').slice(0,32)||'Fonte';
    const id=uid();assets[id]=url;project.fonts.push({name,asset:id});loadProjectFonts();
    setTimeout(()=>{project.brand.fontHead=`"${name}"`;commit();buildInspector();draw();toast(`Fonte "${name}" carregada e aplicada ao título.`);},250);
  });
});

/* ============================ biblioteca de projetos ============================ */
const LIB_KEY='motionlab.library.v1';
const libGet=()=>{try{return JSON.parse(localStorage.getItem(LIB_KEY)||'[]');}catch(e){return[];}};
const libSet=a=>{try{localStorage.setItem(LIB_KEY,JSON.stringify(a));return true;}catch(e){toast('Sem espaço no navegador — use "Salvar" (.json).');return false;}};
function libSave(asCopy){
  const lib=libGet();let id=project.libId;
  if(asCopy||!id||!lib.some(x=>x.id===id)){id=uid();if(asCopy&&project.libId)project.name=project.name.replace(/( \(cópia\))*$/,'')+' (cópia)';project.libId=id;}
  const data=JSON.stringify({project,assets:usedAssets()}),i=lib.findIndex(x=>x.id===id),e={id,name:project.name,updated:Date.now(),data};
  if(i>=0)lib[i]=e;else lib.unshift(e);
  if(libSet(lib)){syncName();renderLib();toast(asCopy?'Cópia salva na biblioteca.':'Projeto salvo na biblioteca.');}
}
function libOpen(id){
  const e=libGet().find(x=>x.id===id);if(!e)return;
  const d=JSON.parse(e.data);pause();project=migrate(d.project);project.libId=id;assets=Object.assign(assets,d.assets||{});
  selId=null;selKF=null;time=0;loadProjectFonts();applySize();fitTimeline();buildInspector();syncName();setTime(0);resetHistory();$('#libModal').hidden=true;toast('Projeto aberto.');
}
function renderLib(){
  const lib=libGet();
  $('#libList').innerHTML=lib.length?lib.map(x=>`<div class="lib-row"><div><b>${esc(x.name)}</b><br><small>${new Date(x.updated).toLocaleString('pt-BR')}</small></div>
    <button class="btn" data-lib="open" data-id="${x.id}">Abrir</button><button class="btn" data-lib="dup" data-id="${x.id}">Duplicar</button><button class="btn" data-lib="del" data-id="${x.id}">Excluir</button></div>`).join(''):'<p class="hint">Nenhum projeto salvo ainda.</p>';
}
$('#libList').addEventListener('click',e=>{
  const b=e.target.closest('[data-lib]');if(!b)return;const id=b.dataset.id,lib=libGet();
  if(b.dataset.lib==='open')libOpen(id);
  else if(b.dataset.lib==='del'){libSet(lib.filter(x=>x.id!==id));renderLib();}
  else if(b.dataset.lib==='dup'){
    const x=lib.find(y=>y.id===id),d=JSON.parse(x.data),nid=uid();d.project.name=x.name+' (cópia)';d.project.libId=nid;
    lib.unshift({id:nid,name:d.project.name,updated:Date.now(),data:JSON.stringify(d)});if(libSet(lib))renderLib();
  }
});
$('#btnLib').onclick=()=>{renderLib();$('#libModal').hidden=false;};
$('#libClose').onclick=()=>{$('#libModal').hidden=true;};
$('#libSave').onclick=()=>libSave(false);
$('#libSaveAs').onclick=()=>libSave(true);
$('#projName').addEventListener('input',e=>{project.name=e.target.value;});
$('#projName').addEventListener('change',()=>commit());

/* ============================ arquivos & exportação ============================ */
/* salvar arquivo: na página publicada do Claude usa o recurso "downloads" (o visitante confirma); fora dela, download normal */
async function download(blob,name){
  try{
    const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;
    if(dl){try{await dl.save({filename:name,data:blob});}catch(e){if(!e||e.code!=='declined')toast('Não foi possível salvar: '+((e&&e.message)||'erro'));}return;}
  }catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
const slug=s=>String(s||'motion').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'motion';
$('#btnSave').onclick=()=>{download(new Blob([JSON.stringify({app:'motionlab',version:2,project,assets:usedAssets()})],{type:'application/json'}),slug(project.name)+'.json');};
$('#btnOpen').onclick=()=>$('#fileJson').click();
$('#fileJson').addEventListener('change',e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  f.text().then(txt=>{
    try{
      const d=JSON.parse(txt),p=d.project||d;
      if(!p||!Array.isArray(p.layers)||!p.w||!p.h)throw 0;
      pause();project=migrate(p);assets=Object.assign(assets,d.assets||{});selId=null;selKF=null;time=0;loadProjectFonts();
      applySize();fitTimeline();buildInspector();syncName();setTime(0);resetHistory();toast('Projeto aberto.');
    }catch(err){toast('Arquivo de projeto inválido.');}
  });
});
$('#btnPng').onclick=()=>{renderScene(ctx,time);cv.toBlob(b=>download(b,`${slug(project.name)}-${time.toFixed(2)}s.png`));};
const MIMES=[['video/webm;codecs=vp9','WebM (VP9)'],['video/webm;codecs=vp8','WebM (VP8)'],['video/mp4;codecs=avc1','MP4 (H.264)'],['video/mp4','MP4']];
function supportedMimes(){return window.MediaRecorder?MIMES.filter(m=>MediaRecorder.isTypeSupported(m[0])):[];}
async function exportVideo(){
  if(!window.MediaRecorder||!cv.captureStream){toast('Seu navegador não suporta exportação de vídeo.');return;}
  const mime=$('#expFmt').value;if(!mime){toast('Nenhum codec de vídeo disponível.');return;}
  pause();exporting=true;cancelExport=false;$('#modal').hidden=false;drawOverlay();await preloadAll();
  const stream=cv.captureStream(project.fps);
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.min(25e6,Math.round(project.w*project.h*project.fps*.15))});
  const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const done=new Promise(r=>rec.onstop=r);
  setTime(0);await sleep(80);rec.start();const t0=performance.now();
  await new Promise(res=>{(function step(){
    const t=(performance.now()-t0)/1000;
    if(cancelExport||t>=project.duration){res();return;}
    setTime(t);$('#pbarI').style.width=(t/project.duration*100)+'%';requestAnimationFrame(step);
  })();});
  setTime(project.duration);await sleep(250);rec.stop();await done;
  stream.getTracks().forEach(t=>t.stop());
  exporting=false;$('#modal').hidden=true;$('#pbarI').style.width='0';draw();
  if(!cancelExport){download(new Blob(chunks,{type:mime.split(';')[0]}),`${slug(project.name)}-${project.w}x${project.h}.${mime.includes('mp4')?'mp4':'webm'}`);toast('Vídeo exportado!');}
}
$('#btnExport').onclick=exportVideo;
$('#btnCancelExp').onclick=()=>{cancelExport=true;};

/* ============================ controles & atalhos ============================ */
$('#btnPlay').onclick=()=>playing?pause():play();
$('#btnStart').onclick=()=>setTime(0);
$('#btnLoop').onclick=e=>{loopOn=!loopOn;e.currentTarget.classList.toggle('active',loopOn);};
$('#btnSafe').onclick=e=>{showSafe=!showSafe;e.currentTarget.classList.toggle('active',showSafe);drawOverlay();};
$('#scrub').addEventListener('input',e=>setTime(parseFloat(e.target.value)*project.duration,true));
$('#btnUndo').onclick=undo;$('#btnRedo').onclick=redo;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b)b.blur();});
document.addEventListener('keydown',e=>{
  const tg=e.target,tag=tg.tagName,typing=tag==='TEXTAREA'||tag==='SELECT'||(tag==='INPUT'&&!['range','checkbox','color'].includes(tg.type));
  const mod=e.ctrlKey||e.metaKey,L=sel();
  if(mod&&e.key.toLowerCase()==='z'&&!typing){e.preventDefault();e.shiftKey?redo():undo();return;}
  if(mod&&e.key.toLowerCase()==='y'&&!typing){e.preventDefault();redo();return;}
  if(typing||!$('#libModal').hidden)return;
  if(e.code==='Space'){e.preventDefault();playing?pause():play();}
  else if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();doAct('dup');}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();if(selKF)doAct('delkf');else doAct('del');}
  else if(e.key==='Escape'){select(null);}
  else if(e.key==='Home'){setTime(0);}
  else if(e.key==='End'){setTime(project.duration);}
  else if(e.key===','){pause();setTime(time-1/project.fps,true);}
  else if(e.key==='.'){pause();setTime(time+1/project.fps,true);}
  else if(e.key.toLowerCase()==='k'&&selKF&&L){toggleKF(L,selKF.k);commit();buildInspector();buildTimeline();draw();}
  else if(e.key.startsWith('Arrow')&&L&&L.type!=='camera'&&!L.locked){
    e.preventDefault();const st=e.shiftKey?10:1,dx=e.key==='ArrowLeft'?-st:e.key==='ArrowRight'?st:0,dy=e.key==='ArrowUp'?-st:e.key==='ArrowDown'?st:0;
    if(dx)setProp(L,'x',r2(evalProp(L,'x',time)+dx));if(dy)setProp(L,'y',r2(evalProp(L,'y',time)+dy));
    afterEdit();clearTimeout(document._nt);document._nt=setTimeout(commit,300);
  }
});
