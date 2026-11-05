/* ============================ ícones, "momentos" e modelo de problemas ============================ */
Object.assign(ICONS,{
 dollar:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
 zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
});
const IC=(id,name,icon,x,y,size,o={})=>{
  const L=makeLayer('icon',{id,name,icon,lw:o.lw||2.2,start:o.start||0,end:o.end||project.duration,depth:o.depth??1,tok:{fill:o.fill||'text'},
    props:{x,y,w:size,h:size,opacity:o.opacity??1},fx:{in:o.inn||{},out:o.out||{}}});
  project.layers.push(L);return L;
};
const svgOf=name=>`<svg viewBox="0 0 24 24">${(GLYPHS[name]||GLYPHS.x).paths.map(d=>`<path d="${d}"/>`).join('')}</svg>`;

/* seletor de ícones */
let pickCb=null;
function openIconPicker(cb){
  pickCb=cb;
  $('#iconGrid').innerHTML=Object.entries(GLYPHS).map(([k,g])=>`<button class="icon-cell" data-ic="${k}" title="${g.label}">${svgOf(k)}<span>${g.label}</span></button>`).join('');
  $('#iconModal').hidden=false;
}
$('#iconGrid').addEventListener('click',e=>{const b=e.target.closest('[data-ic]');if(!b)return;$('#iconModal').hidden=true;const f=pickCb;pickCb=null;f&&f(b.dataset.ic);});
$('#iconClose').onclick=()=>{$('#iconModal').hidden=true;pickCb=null;};

function ensureDuration(t){
  if(t<=project.duration)return;
  const old=project.duration,nd=r3(t+.3);
  project.layers.forEach(l=>{if(l.end>=old-1e-6)l.end=nd;});
  if(project.scenes.length)project.scenes[project.scenes.length-1].end=nd;
  project.duration=nd;project.camera.end=nd;
}
/* layout automático por formato: linha (16:9, 1:1) ou coluna (9:16), respeitando as margens seguras */
function momentLayout(n,W,H){
  const S=safeBox(W,H),sw=S.x1-S.x0,sh=S.y1-S.y0,port=H>W*1.3,out=[];
  if(!port){
    const cell=sw/n,size=clamp(Math.min(cell*.5,sh*.4),100,320),tsize=clamp(Math.round(size*.19),30,60),cy=(S.y0+S.y1)/2,cardH=size+tsize*3.4+110,top=cy-cardH/2;
    for(let i=0;i<n;i++){const cx=S.x0+cell*(i+.5);out.push({size,cx,cy,cardW:cell*.9,cardH,ix:cx,iy:top+55+size/2,tx:cx,ty:top+55+size+26,tmaxW:cell*.9-70,talign:'center',tax:'c',tay:'t',tsize});}
  }else{
    const ch=Math.min(sh/n,440),size=clamp(ch*.58,110,240),tsize=clamp(Math.round(size*.27),38,62),y0=S.y0+(sh-ch*n)/2;
    for(let i=0;i<n;i++){const cy=y0+ch*(i+.5),ix=S.x0+36+size/2,tx=ix+size/2+36;out.push({size,cx:S.x0+sw/2,cy,cardW:sw,cardH:ch*.9,ix,iy:cy,tx,ty:cy,tmaxW:S.x1-36-tx,talign:'left',tax:'l',tay:'m',tsize});}
  }
  return out;
}
/* sequência: cada item aparece num instante (ícone se desenha → X/✓ carimba → legenda) */
function insertSeq(o){
  const n=o.items.length,gap=o.gap,t0=o.start,mk=o.mark!=='none',markDelay=(o.effect==='draw'?.95:.6);
  const end=r3(t0+(n-1)*gap+markDelay+(mk?.5:0)+(o.hold??1.8));
  ensureDuration(end);
  const Lay=momentLayout(n,project.w,project.h),pre=o.idp||('m'+uid()),out={type:'fade',dur:.35,ease:'inQuad'};
  o.items.forEach((it,i)=>{
    const g=Lay[i],st=r3(t0+i*gap),nm=`${o.name||'Momento'} ${i+1}`;
    if(o.card)SH(`${pre}_${i}_card`,`${nm} · Cartão`,'rect',g.cx,g.cy,g.cardW,g.cardH,{fill:'secondary',radius:36,opacity:.95,start:st,end,inn:{type:'pop',dur:.45,ease:'outBack'},out});
    const inn=o.effect==='pop'?{type:'pop',dur:.45,ease:'outBack'}:o.effect==='rise'?{type:'rise',dur:.5,ease:'outExpo',dist:g.size*.35}:{type:'fade',dur:.12};
    const ic=IC(`${pre}_${i}_icon`,`${nm} · Ícone`,it.icon,g.ix,g.iy,g.size,{fill:'text',start:st,end,inn,out});
    if(o.effect==='draw')K(ic,'reveal',[[st+.05,0,'inOutCubic'],[st+.9,1]]);
    if(mk){
      const bad=o.mark==='x',d=st+markDelay;
      const m=IC(`${pre}_${i}_mark`,`${nm} · ${bad?'X':'Certo'}`,bad?'x':'check',g.ix,g.iy,g.size*.92,{fill:bad?'danger':'success',lw:3.4,start:st,end,inn:{type:'pop',dur:.36,delay:markDelay,ease:'outBack'},out});
      if(bad)K(m,'rot',[[d,0,'inOutSine'],[d+.1,-7,'inOutSine'],[d+.2,6,'inOutSine'],[d+.3,-3,'inOutSine'],[d+.4,0,'linear']]);
    }
    if(it.text)TX(`${pre}_${i}_txt`,`${nm} · Texto`,it.text,{x:g.tx,y:g.ty,ax:g.tax,ay:g.tay,size:g.tsize,weight:800,align:g.talign,maxW:g.tmaxW,lh:1.1,role:'head',fill:'text',start:st,end,inn:{type:'rise',dur:.5,delay:.25,ease:'outExpo',dist:24},out});
  });
  return end;
}
/* chuva / explosão de ícones (ex.: dinheiro aparecendo) */
function insertRain(o){
  const W=project.w,H=project.h,S=safeBox(W,H),n=o.count,t0=o.start;
  ensureDuration(t0+o.dur+(o.mode==='rain'?2.4:1.2));
  const pre=o.idp||('r'+uid()),R=seeded(Math.floor(t0*100)+n*7+3);
  for(let i=0;i<n;i++){
    const size=Math.round(70+R()*90),st=r3(t0+R()*o.dur*.6),life=o.mode==='rain'?2.2+R()*1.2:1.7+R()*.6,en=r3(st+life),id=`${pre}_${i}`,nm=`${o.name||'Chuva'} ${i+1}`;
    if(o.mode==='rain'){
      const x0=S.x0+R()*(S.x1-S.x0),L=IC(id,nm,o.icon,x0,-size,size,{fill:o.fill,start:st,end:en});
      K(L,'y',[[st,-size,'linear'],[en,H+size,'linear']]);K(L,'x',[[st,x0,'linear'],[en,x0+(R()-.5)*180,'linear']]);K(L,'rot',[[st,(R()-.5)*40,'linear'],[en,(R()-.5)*160,'linear']]);
    }else{
      const a=R()*Math.PI*2,r=Math.min(W,H)*(.16+R()*.26),cx=W/2,cy=H/2,L=IC(id,nm,o.icon,cx,cy,size,{fill:o.fill,start:st,end:en,inn:{type:'pop',dur:.35,ease:'outBack'},out:{type:'fade',dur:.45}});
      K(L,'x',[[st,cx,'outExpo'],[st+.8,cx+Math.cos(a)*r,'linear'],[en,cx+Math.cos(a)*r*1.12,'linear']]);
      K(L,'y',[[st,cy,'outExpo'],[st+.8,cy+Math.sin(a)*r,'linear'],[en,cy+Math.sin(a)*r*1.12-70,'linear']]);
      K(L,'rot',[[st,0,'linear'],[en,(R()-.5)*90,'linear']]);
    }
  }
}

/* formulário "Momentos prontos" */
let mom={kind:'seq',mark:'x',effect:'draw',gap:1.4,card:true,fill:'success',count:10,mode:'rain',icon:'bill',dur:2,start:0,
  items:[{icon:'bill',text:'Sem dinheiro'},{icon:'factory',text:'Sem fábrica'},{icon:'cocktail',text:'Não sei fazer a bebida'}]};
const FILL_OPTS=[['text','Texto'],['accent','Destaque'],['primary','Principal'],['success','Acerto (verde)'],['danger','Erro (vermelho)']];
function openMoment(){mom.start=r2(time);renderMoment();$('#momentModal').hidden=false;}
function renderMoment(){
  const seq=mom.kind==='seq';
  $('#momentBox').innerHTML=`<b>Momentos prontos</b>
  <p class="hint" style="margin:4px 0 10px">Cria camadas separadas e editáveis no ponto onde está o playhead. Depois ajuste o tempo de cada item arrastando na timeline.</p>
  <div class="mrow"><span>Tipo</span><select data-m="kind">${optHTML([['seq','Itens em sequência (ícone + X / ✓ + legenda)'],['rain','Ícone aparecendo (chuva ou explosão)']],mom.kind)}</select></div>
  ${seq?`${mom.items.map((it,i)=>`<div class="mitem"><button class="icon-cell" data-pick="${i}" title="Trocar ícone">${svgOf(it.icon)}</button><input type="text" data-mt="${i}" value="${esc(it.text)}" placeholder="Legenda (opcional)"><button class="kfb" data-mdel="${i}" title="Remover">✕</button></div>`).join('')}
    ${mom.items.length<4?'<button class="btn" data-madd style="margin:4px 0 8px">+ Adicionar item</button>':''}
    <div class="mrow"><span>Marca sobre o ícone</span><select data-m="mark">${optHTML([['x','X vermelho (errado)'],['check','✓ verde (certo)'],['none','Nenhuma']],mom.mark)}</select></div>
    <div class="mrow"><span>Entrada do ícone</span><select data-m="effect">${optHTML([['draw','Desenhar o traço'],['pop','Pop'],['rise','Subir']],mom.effect)}</select></div>
    <div class="mrow"><span>Intervalo entre itens (s)</span><input type="number" data-m="gap" step="0.1" min="0.4" value="${mom.gap}"></div>
    <label class="chk"><input type="checkbox" data-m="card" ${mom.card?'checked':''}> Cartão atrás (melhora a leitura sobre o vídeo)</label>`
  :`<div class="mrow"><span>Ícone</span><button class="icon-cell" data-pick="r" style="flex-direction:row;justify-content:flex-start;gap:8px">${svgOf(mom.icon)}<span>${GLYPHS[mom.icon].label}</span></button></div>
    <div class="mrow"><span>Efeito</span><select data-m="mode">${optHTML([['rain','Chuva (caindo do topo)'],['burst','Explosão (do centro)']],mom.mode)}</select></div>
    <div class="mrow"><span>Quantidade</span><input type="number" data-m="count" min="3" max="30" value="${mom.count}"></div>
    <div class="mrow"><span>Duração (s)</span><input type="number" data-m="dur" step="0.5" min="0.5" value="${mom.dur}"></div>
    <div class="mrow"><span>Cor</span><select data-m="fill">${optHTML(FILL_OPTS,mom.fill)}</select></div>`}
  <div class="mrow"><span>Começa em (s)</span><input type="number" data-m="start" step="0.1" min="0" value="${mom.start}"></div>
  <div class="btnrow" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-mclose>Cancelar</button><button class="btn primary" data-mgo>Inserir no projeto</button></div>`;
}
$('#btnMoment').onclick=openMoment;
const mbox=$('#momentBox');
mbox.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.mt!==undefined){mom.items[+t.dataset.mt].text=t.value;return;}
  const k=t.dataset.m;if(!k)return;
  mom[k]=t.type==='checkbox'?t.checked:t.type==='number'?(parseFloat(t.value)||0):t.value;
  if(k==='kind'||k==='mode')renderMoment();
});
mbox.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.mclose!==undefined){$('#momentModal').hidden=true;return;}
  if(b.dataset.madd!==undefined){mom.items.push({icon:'dollar',text:''});renderMoment();return;}
  if(b.dataset.mdel!==undefined){if(mom.items.length>1){mom.items.splice(+b.dataset.mdel,1);renderMoment();}return;}
  if(b.dataset.pick!==undefined){const p=b.dataset.pick;$('#momentModal').hidden=true;openIconPicker(k=>{if(p==='r')mom.icon=k;else mom.items[+p].icon=k;$('#momentModal').hidden=false;renderMoment();});return;}
  if(b.dataset.mgo!==undefined){
    $('#momentModal').hidden=true;pause();
    const before=project.layers.length,t0=Math.max(0,mom.start);
    if(mom.kind==='seq')insertSeq({items:mom.items.map(i=>({...i})),mark:mom.mark,effect:mom.effect,gap:mom.gap||1.4,card:mom.card,start:t0,name:'Momento'});
    else insertRain({icon:mom.icon,count:clamp(Math.round(mom.count),3,30),mode:mom.mode,dur:mom.dur||2,start:t0,fill:mom.fill,name:GLYPHS[mom.icon].label});
    selId=null;selKF=null;commit();applySize();buildInspector();buildTimeline();fitTimeline();
    setTime(Math.max(0,t0-.2));play();toast(`${project.layers.length-before} camadas criadas — editáveis na timeline.`);
  }
});

/* modelo: o exemplo do usuário (não tenho dinheiro, fábrica nem sei fazer a bebida) */
function buildProblems(W,H,o){
  project.name='Problemas: dinheiro, fábrica, bebida — EXEMPLO';project.duration=7.5;
  setBrand({bg:'#101114',secondary:'#1f232b',primary:'#ffc857',accent:'#ffc857',text:'#f4f1ea',muted:'#a29e93'});
  insertSeq({items:[{icon:'bill',text:'Sem dinheiro'},{icon:'factory',text:'Sem fábrica'},{icon:'cocktail',text:'Não sei fazer a bebida'}],mark:'x',effect:'draw',gap:1.6,card:true,start:.6,idp:'prob',name:'Problema'});
}
COMPOSITIONS.problems=[buildProblems,'1920x1080'];
$('#tplSel').insertAdjacentHTML('afterbegin','');
const _opt=document.createElement('option');_opt.value='problems';_opt.textContent='★ Problemas: dinheiro, fábrica, bebida (exemplo)';
$('#tplSel').insertBefore(_opt,$('#tplSel').querySelector('option[value="cine"]'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#iconModal').hidden=true;$('#momentModal').hidden=true;}});
