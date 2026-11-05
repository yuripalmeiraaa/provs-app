
/* ============================ mídias de exemplo (geradas, substituíveis) ============================ */
const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const seeded=s=>()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};
function noise(x,w,h,amt){const d=x.getImageData(0,0,w,h),R=seeded(11);for(let i=0;i<d.data.length;i+=4){const n=(R()-.5)*255*amt;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n;}x.putImageData(d,0,0);}
function pill(x,cx,cy,text){
  x.font='600 26px "Courier New", monospace';const w=x.measureText(text).width+44;
  x.fillStyle='rgba(0,0,0,.55)';x.beginPath();rrect(x,cx-w/2,cy-26,w,52,26);x.fill();
  x.fillStyle='#f4f1ea';x.textAlign='center';x.textBaseline='middle';x.fillText(text,cx,cy+1);
}
function phCinema(){
  const c=mkCanvas(1600,1600),x=c.getContext('2d'),R=seeded(7);
  let g=x.createLinearGradient(0,0,0,1600);
  [[0,'#0c1626'],[.45,'#27415a'],[.62,'#c98a52'],[.68,'#e8b074'],[.7,'#1a1e26'],[1,'#0a0b0e']].forEach(([o,col])=>g.addColorStop(o,col));
  x.fillStyle=g;x.fillRect(0,0,1600,1600);
  const rg=x.createRadialGradient(800,1020,10,800,1020,560);rg.addColorStop(0,'rgba(255,214,150,.95)');rg.addColorStop(.25,'rgba(240,160,90,.5)');rg.addColorStop(1,'rgba(240,160,90,0)');
  x.fillStyle=rg;x.fillRect(0,400,1600,1200);
  [[1070,'#2a3340',90],[1130,'#1a212b',70],[1200,'#10151c',55],[1290,'#0a0d12',40]].forEach(([base,col,amp],li)=>{
    x.fillStyle=col;x.beginPath();x.moveTo(0,1600);
    for(let px=0;px<=1600;px+=16)x.lineTo(px,base+Math.sin(px*.004+li*2)*amp*.6+(R()-.5)*amp*.5);
    x.lineTo(1600,1600);x.closePath();x.fill();
  });
  noise(x,1600,1600,.03);pill(x,800,760,'IMAGEM DE EXEMPLO');
  return c.toDataURL('image/jpeg',.82);
}
function phGrain(){
  const c=mkCanvas(420,420),x=c.getContext('2d'),R=seeded(3);x.fillStyle='#808080';x.fillRect(0,0,420,420);
  const d=x.getImageData(0,0,420,420);for(let i=0;i<d.data.length;i+=4){const n=128+(R()-.5)*150;d.data[i]=d.data[i+1]=d.data[i+2]=n;}x.putImageData(d,0,0);
  return c.toDataURL('image/jpeg',.7);
}
function phProduct(){
  const c=mkCanvas(1200,1200),x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,1200);g.addColorStop(0,'#e7e2d6');g.addColorStop(1,'#c9c2b2');x.fillStyle=g;x.fillRect(0,0,1200,1200);
  x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(600,980,300,40,0,0,7);x.fill();
  const bg=x.createLinearGradient(330,0,870,0);bg.addColorStop(0,'#f8f6f0');bg.addColorStop(.5,'#ffffff');bg.addColorStop(1,'#cfc9ba');
  x.fillStyle=bg;x.beginPath();rrect(x,330,260,540,720,60);x.fill();
  x.fillStyle='#ff5a36';x.fillRect(330,520,540,150);
  x.fillStyle='#fff';x.font='800 64px system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('PRODUTO',600,596);
  pill(x,600,205,'EXEMPLO · troque a foto');
  noise(x,1200,1200,.025);
  return c.toDataURL('image/jpeg',.85);
}
function ensureAsset(id,fn){if(!assets[id])assets[id]=fn();return id;}

/* ============================ construtores de composição ============================ */
const _mctx=document.createElement('canvas').getContext('2d');
function TX(id,name,text,o={}){
  const L=makeLayer('text',{id,name,text,size:o.size||64,weight:o.weight||700,align:o.align||'left',ls:o.ls||0,lh:o.lh||1.18,maxW:o.maxW||0,fontRole:o.font?'':o.role||'body',
    split:o.split||'none',stagger:o.stagger||.06,start:o.start||0,font:o.font||FONTS[0][0],end:o.end||project.duration,depth:o.depth??1,tok:{fill:o.fill||'text'},props:{opacity:o.opacity??1},fx:{in:o.inn||{},out:o.out||{}}});
  const lay=layoutText(_mctx,L);L.props.w=lay.boxW;L.props.h=lay.boxH;
  const ax=o.ax||'l',ay=o.ay||'m';
  L.props.x=ax==='l'?o.x+lay.boxW/2:ax==='r'?o.x-lay.boxW/2:o.x;
  L.props.y=ay==='t'?o.y+lay.boxH/2:ay==='b'?o.y-lay.boxH/2:o.y;
  project.layers.push(L);return L;
}
function SH(id,name,type,x,y,w,h,o={}){
  const L=makeLayer(type,{id,name,start:o.start||0,end:o.end||project.duration,depth:o.depth??1,locked:!!o.locked,noFill:!!o.noFill,blend:o.blend||'source-over',
    tok:{fill:o.fill||'accent',stroke:o.stroke||'',grad:o.gradTok||''},grad:o.grad||{},props:{x,y,w,h,radius:o.radius||0,opacity:o.opacity??1,strokeW:o.strokeW||0},fx:{in:o.inn||{},out:o.out||{}}});
  project.layers.push(L);return L;
}
function IM(id,name,asset,x,y,w,h,o={}){
  const L=makeLayer('image',{id,name,asset,start:o.start||0,end:o.end||project.duration,depth:o.depth??1,locked:!!o.locked,blend:o.blend||'source-over',jitter:o.jitter||0,
    props:{x,y,w,h,radius:o.radius||0,opacity:o.opacity??1},fx:{in:o.inn||{},out:o.out||{}}});
  project.layers.push(L);return L;
}
const SC=(name,start,end,color)=>project.scenes.push({id:uid(),name,start,end,color});
const topOf=L=>L.props.y-L.props.h/2,botOf=L=>L.props.y+L.props.h/2;
function vstack(list,gap,cy){
  const gaps=list.slice(1).map((_,i)=>Array.isArray(gap)?gap[i]:gap),total=list.reduce((a,l)=>a+l.props.h,0)+gaps.reduce((a,g)=>a+g,0);
  let y=cy-total/2;list.forEach((l,i)=>{l.props.y=y+l.props.h/2;y+=l.props.h+(gaps[i]||0);});
}
function setBrand(b){Object.assign(project.brand,b);project.bg=project.brand.bg;}
const orientOf=(w,h)=>h>w*1.3?'port':Math.abs(w-h)<w*.1?'sq':'land';
function buildComposition(builder,primary){
  const sizes=[[1920,1080],[1080,1920],[1080,1080]].sort((a,b)=>(`${a[0]}x${a[1]}`===primary)-(`${b[0]}x${b[1]}`===primary));
  const variants={};
  for(const[w,h]of sizes){project=newProject(w,h);builder(w,h,orientOf(w,h));project.camera.end=project.duration;variants[`${w}x${h}`]=snapGeo();}
  project.variants=variants;
}
const K=(L,k,arr)=>{L.tracks[k]=arr.map(([t,v,e])=>({t,v,ease:e||'outCubic'}));};
const addL=(type,name,props,extra={})=>{const L=makeLayer(type,{name,props,...extra});project.layers.push(L);return L;};
const TEMPLATES={
  blank(){},
  title(){
    project.bg='#0b0d14';const W=project.w,H=project.h;
    let a=addL('ellipse','Círculo roxo',{x:W*.82,y:H*.2,w:640,h:640,fill:'#7c5cff',opacity:.9});
    K(a,'scale',[[0,0],[1,1,'outBack']]);PRESETS[2].items[1][1](a,{t0:1.2,t1:5,d:.8});
    a=addL('ellipse','Círculo ciano',{x:W*.12,y:H*.88,w:420,h:420,fill:'#22d3ee',opacity:.85});
    K(a,'scale',[[.2,0],[1.1,1,'outBack']]);PRESETS[2].items[0][1](a,{t0:1.5,t1:5,d:.9});
    a=addL('star','Estrela',{x:W*.2,y:H*.2,w:120,h:120,fill:'#ffc857'});
    K(a,'scale',[[.9,0],[1.5,1,'outBack']]);K(a,'rot',[[.9,-180],[1.5,0],[5,360,'linear']]);
    a=addL('rect','Barra',{x:W/2,y:H*.66,w:520,h:8,fill:'#ffffff',radius:4});
    K(a,'w',[[.9,0],[1.5,520]]);
    a=addL('text','Título',{x:W/2,y:H*.46,fill:'#ffffff'},{text:'MOTION DESIGN',size:120,weight:900});
    K(a,'scale',[[.4,0],[1.1,1,'outBack']]);K(a,'opacity',[[.4,0],[.7,1]]);
    a=addL('text','Subtítulo',{x:W/2,y:H*.78,fill:'#b8c0d4'},{text:'Crie animações incríveis em minutos',size:40,weight:500});
    K(a,'y',[[1.3,H*.78+40],[1.9,H*.78]]);K(a,'opacity',[[1.3,0],[1.9,1]]);
  },
  lower(){
    project.bg='#222a3a';const H=project.h;
    let a=addL('rect','Barra',{x:380,y:H*.78,w:620,h:104,fill:'#7c5cff',radius:14});
    K(a,'x',[[.2,-340],[.8,380],[4.2,380,'inCubic'],[4.8,-340]]);
    a=addL('rect','Acento',{x:60,y:H*.78,w:14,h:104,fill:'#22d3ee',radius:4});
    K(a,'x',[[.1,-340],[.7,60],[4.3,60,'inCubic'],[4.9,-340]]);
    a=addL('text','Nome',{x:380,y:H*.78-17,fill:'#ffffff'},{text:'NOME SOBRENOME',size:46,weight:800});
    K(a,'reveal',[[.9,0,'linear'],[1.8,1]]);K(a,'opacity',[[.85,0],[.9,1],[4.2,1],[4.6,0]]);
    a=addL('text','Cargo',{x:380,y:H*.78+25,fill:'#e4e8f5'},{text:'Diretor de Arte',size:28,weight:500});
    K(a,'opacity',[[1.5,0],[2,1],[4.2,1],[4.6,0]]);K(a,'y',[[1.5,H*.78+45],[2,H*.78+25]]);
  },
  logo(){
    project.bg='#0a0a12';const W=project.w,H=project.h;
    [0.3,0.7].forEach((t,i)=>{const r=addL('ellipse','Onda '+(i+1),{x:W/2,y:H*.42,w:300,h:300,fill:'#22d3ee',stroke:'#22d3ee',strokeW:8},{noFill:true});
      K(r,'scale',[[t,.2,'outCubic'],[t+1.4,2.4]]);K(r,'opacity',[[t,1,'linear'],[t+1.4,0]]);});
    let a=addL('star','Estrela',{x:W/2,y:H*.42,w:260,h:260,fill:'#ffc857'});
    K(a,'scale',[[.2,0],[1,1,'outBack']]);K(a,'rot',[[.2,-200],[1,0]]);PRESETS[2].items[0][1](a,{t0:1.2,t1:5,d:.7});
    a=addL('text','Marca',{x:W/2,y:H*.72,fill:'#ffffff'},{text:'ESTRELA',size:110,weight:900});
    K(a,'reveal',[[1,0,'linear'],[1.7,1]]);
    a=addL('text','Slogan',{x:W/2,y:H*.84,fill:'#8d96a9'},{text:'brilhe mais forte',size:36,weight:500});
    K(a,'opacity',[[1.8,0],[2.4,1]]);
  },
  count(){
    project.bg='#12121a';const W=project.w,H=project.h;
    let a=addL('ellipse','Disco',{x:W/2,y:H/2,w:420,h:420,fill:'#7c5cff'});
    cycle(a,'scale',0,5,.5,[1,1.08],'inOutQuad');
    ['3','2','1','GO!'].forEach((txt,i)=>{
      const ring=addL('ellipse','Anel '+txt,{x:W/2,y:H/2,w:420,h:420,stroke:'#22d3ee',strokeW:10},{noFill:true,start:i,end:i+1});
      K(ring,'scale',[[i,1,'outCubic'],[i+1,1.7]]);K(ring,'opacity',[[i,1,'linear'],[i+1,0]]);
      const t=addL('text','Número '+txt,{x:W/2,y:H/2,fill:'#ffffff'},{text:txt,size:txt==='GO!'?190:260,weight:900,start:i,end:i===3?5:i+1});
      K(t,'scale',[[i,1.5],[i+.35,1,'outBack']]);K(t,'opacity',[[i,0],[i+.12,1]]);
    });
  }
};
/* ============================ gerador aleatório ============================ */
const PALETTES=[
 ['#0f172a','#7c5cff','#22d3ee','#ffc857','#ff5d73'],['#fff7ed','#ff6b35','#004e89','#1a659e','#f7c59f'],
 ['#111111','#f72585','#7209b7','#3a0ca3','#4cc9f0'],['#0b132b','#1c2541','#3a506b','#5bc0be','#f4f4f9'],
 ['#fefae0','#606c38','#283618','#dda15e','#bc6c25'],['#1a1423','#ff9f1c','#2ec4b6','#e71d36','#fdfffc']
];
const WORDS=['MOTION','FLOW','BOOM','VIBE','CRIA','ENERGIA','DROP','NOVO','BRILHE','PLAY'];
function generate(){
  pause();const pal=pick(PALETTES);
  const keep={w:project.w,h:project.h};
  project=newProject(keep.w,keep.h);project.bg=project.brand.bg=pal[0];project.duration=6;
  const cols=pal.slice(1),W=project.w,H=project.h,ins=[0,1,2,3,5,6,7,8];
  for(let i=0;i<12;i++){
    const type=pick(['rect','ellipse','triangle','star','ellipse']),sz=rnd(.08,.3)*Math.min(W,H);
    const L=addL(type,`${NAMES[type]} ${i+1}`,{x:rnd(.05,.95)*W,y:rnd(.05,.95)*H,w:sz*(type==='rect'?rnd(.8,1.8):1),h:sz,fill:pick(cols),opacity:+rnd(.6,1).toFixed(2),rot:type==='rect'||type==='triangle'?rnd(-25,25):0,radius:type==='rect'?rnd(0,sz*.3):0});
    const o={d:rnd(.5,.9),t0:i*.1,t1:project.duration};
    PRESETS[0].items[pick(ins)][1](L,o);
    const r=Math.random(); const lo={d:rnd(.6,1.1),t0:o.t0+o.d+.2,t1:project.duration};
    if(r<.3)PRESETS[2].items[0][1](L,lo);else if(r<.55)PRESETS[2].items[1][1](L,lo);else if(r<.7)PRESETS[2].items[3][1](L,lo);else if(r<.85)PRESETS[2].items[2][1](L,lo);
  }
  const tc=luma(pal[0])>.5?'#111111':'#ffffff';
  const bar=addL('rect','Faixa',{x:W/2,y:H/2,w:W*.62,h:H*.26,fill:pal[0],radius:18,opacity:.92});
  K(bar,'scale',[[.9,0],[1.5,1,'outBack']]);
  const t=addL('text','Título',{x:W/2,y:H/2,fill:tc},{text:pick(WORDS),size:Math.round(Math.min(W,H)*.15),weight:900});
  K(t,'reveal',[[1.5,0,'linear'],[2.3,1]]);
  selId=null;selKF=null;time=0;applySize();fitTimeline();buildInspector();setTime(0);resetHistory();play();
}
$('#btnGen').onclick=generate;

/* ============================ composição 1: teaser cinematográfico ============================ */
function buildCine(W,H,o){
  const land=o==='land',port=o==='port',cx=W/2,cy=H/2;
  project.name='Teaser cinematográfico — EXEMPLO';project.duration=16;
  setBrand({bg:'#0a0b0e',primary:'#ece6da',secondary:'#171a21',accent:'#d9a441',text:'#ece6da',muted:'#8f897c',fontHead:FONTS[1][0],fontBody:FONTS[0][0]});
  const bar=land?Math.round((H-W/2.39)/2):0,S=safeBox(W,H);if(land){S.y0=bar+40;S.y1=H-bar-40;}
  const cw=S.x1-S.x0;
  SC('Abertura',0,3.6,'#5b6b8a');SC('Imagem e frase',3.6,9.4,'#d9a441');SC('Título',9.4,13.4,'#a86b3c');SC('Encerramento',13.4,16,'#5bc0be');
  const img=IM('img_main','Imagem principal (exemplo)',ensureAsset('ph_cine',phCinema),cx,cy,W,H,{start:3.2,end:9.8,inn:{type:'fade',dur:1.4,ease:'inOutSine'},out:{type:'fade',dur:1}});
  K(img,'zoom',[[3.2,1,'inOutSine'],[9.8,1.22,'linear']]);K(img,'panX',[[3.2,.5,'inOutSine'],[9.8,-.4,'linear']]);K(img,'panY',[[3.2,-.5,'inOutSine'],[9.8,-.38,'linear']]);
  SH('scrim','Escurecimento p/ leitura','rect',cx,H-H*.36,W,H*.72,{locked:true,start:3.2,end:9.8,fill:'bg',opacity:.92,grad:{mode:'fade',angle:270},inn:{type:'fade',dur:1.2,ease:'inOutSine'},out:{type:'fade',dur:1}});
  SH('vignette','Vinheta','rect',cx,cy,W,H,{locked:true,fill:'bg',opacity:.65,depth:0,grad:{mode:'vignette'}});
  // cena 1
  SH('s1_line','Abertura · linha','rect',cx,cy-30,Math.min(W*.16,280),2,{start:.3,end:3.8,fill:'accent',inn:{type:'wipeL',dur:1.4,delay:.2,ease:'inOutQuart'},out:{type:'fade',dur:.6}});
  TX('s1_kicker','Abertura · assinatura (exemplo)','UMA PRODUÇÃO EXEMPLO',{x:cx,y:cy+4,ax:'c',ay:'t',size:24,weight:500,ls:9,align:'center',fill:'muted',start:.3,end:3.8,inn:{type:'fade',dur:1.4,delay:1,ease:'inOutSine'},out:{type:'fade',dur:.6}});
  // cena 2
  const ph=TX('s2_phrase','Frase de impacto (exemplo)','Toda grande história começa em silêncio.',{x:S.x0,y:S.y1-(land?10:0),ax:'l',ay:'b',size:land?78:port?84:70,weight:400,role:'head',maxW:land?1000:cw,lh:1.16,
    start:4.4,end:9.4,split:'word',stagger:.14,inn:{type:'rise',dur:1.1,delay:.2,ease:'outExpo',dist:26},out:{type:'fade',dur:.8,ease:'inOutSine'}});
  TX('s2_tag','Capítulo (exemplo)','CAPÍTULO I',{x:S.x0,y:topOf(ph)-30,ax:'l',ay:'b',size:22,weight:600,ls:10,fill:'accent',start:4.4,end:9.4,inn:{type:'fade',dur:1,delay:1,ease:'inOutSine'},out:{type:'fade',dur:.6}});
  // cena 3
  const ts=land?168:port?112:104,tt=TX('s3_title','Título (exemplo)','HORIZONTE',{x:cx,y:cy-(land?10:20),ax:'c',ay:'m',size:ts,weight:400,ls:Math.round(ts*.14),align:'center',role:'head',
    start:9.6,end:13.4,split:'char',stagger:.09,inn:{type:'focus',dur:1.5,delay:0,ease:'outExpo'},out:{type:'fade',dur:.7}});
  SH('s3_rule','Título · filete','rect',cx,botOf(tt)+(land?40:34),land?360:300,2,{start:9.6,end:13.4,fill:'accent',inn:{type:'wipeL',dur:1.2,delay:1.2,ease:'inOutQuart'},out:{type:'fade',dur:.6}});
  TX('s3_sub','Crédito (campo)','UM FILME DE [NOME DO DIRETOR]',{x:cx,y:botOf(tt)+(land?70:64),ax:'c',ay:'t',size:24,weight:500,ls:10,align:'center',fill:'muted',maxW:cw,start:9.6,end:13.4,inn:{type:'fade',dur:1.2,delay:2,ease:'inOutSine'},out:{type:'fade',dur:.6}});
  // cena 4
  const so=TX('s4_soon','Encerramento · EM BREVE','EM BREVE',{x:cx,y:cy-28,ax:'c',ay:'m',size:land?64:60,weight:400,ls:18,align:'center',role:'head',start:13.6,end:16,inn:{type:'rise',dur:1.3,ease:'outExpo',dist:20},out:{type:'fade',dur:.8}});
  TX('s4_field','Encerramento · data/onde assistir (campo)','[DATA DE ESTREIA · ONDE ASSISTIR]',{x:cx,y:botOf(so)+24,ax:'c',ay:'t',size:26,weight:500,ls:6,align:'center',fill:'accent',maxW:cw,start:13.6,end:16,inn:{type:'fade',dur:1,delay:.8},out:{type:'fade',dur:.6}});
  // acabamento: letterbox e grão (fixos na tela)
  SH('bar_top','Letterbox · topo','rect',cx,bar/2,W+4,bar,{locked:true,fill:'bg',depth:0,inn:{type:'slideU',dur:1.4,ease:'inOutQuart',dist:bar}});
  SH('bar_bot','Letterbox · base','rect',cx,H-bar/2,W+4,bar,{locked:true,fill:'bg',depth:0,inn:{type:'slideD',dur:1.4,ease:'inOutQuart',dist:bar}});
  IM('grain','Grão de filme','ph_grain'&&ensureAsset('ph_grain',phGrain),cx,cy,W+160,H+160,{locked:true,blend:'overlay',opacity:.14,depth:0,jitter:40});
  K(project.camera,'scale',[[0,1,'inOutSine'],[3.6,1.025,'inOutSine'],[9.4,1.07,'inOutSine'],[13.4,1.12,'inOutSine'],[16,1.14,'linear']]);
}

/* ============================ composição 2: vídeo de vendas ============================ */
function buildSales(W,H,o){
  const land=o==='land',port=o==='port',cx=W/2,S=safeBox(W,H),cw=S.x1-S.x0,cy=(S.y0+S.y1)/2;
  project.name='Vídeo de vendas — EXEMPLO (preencha os campos)';project.duration=21.5;
  setBrand({bg:'#0f1012',primary:'#f4f1ea',secondary:'#1c1e23',accent:'#ff5a36',text:'#f4f1ea',muted:'#a29e93',fontHead:FONTS[0][0],fontBody:FONTS[0][0]});
  SC('Gancho',0,3.2,'#ff5a36');SC('Problema',3.2,6.8,'#a29e93');SC('Solução',6.8,10.8,'#22d3ee');SC('Benefícios',10.8,15.8,'#ffc857');SC('Prova',15.8,18.6,'#7c5cff');SC('Chamada',18.6,21.5,'#ff5a36');
  const out=(e,end)=>({type:'fade',dur:.3,ease:'inQuad'});
  const rise={type:'rise',dur:.7,ease:'outExpo',dist:46};
  // cena 1 · gancho
  const hk=TX('s1_hook','Gancho (campo)','[SEU GANCHO AQUI]',{x:S.x0,y:cy-(port?150:70),size:port?150:land?170:130,weight:900,ls:-3,lh:1.0,role:'head',maxW:land?1400:cw,start:0,end:3.2,split:'word',stagger:.12,inn:{...rise,delay:.1,dist:60},out:out()});
  SH('s1_bar','Gancho · barra','rect',S.x0+110,botOf(hk)+46,220,16,{start:0,end:3.2,fill:'accent',radius:8,inn:{type:'wipeL',dur:.6,delay:.7,ease:'outExpo'},out:out()});
  TX('s1_hint','Gancho · apoio (campo)','Pergunta, dor ou desejo do cliente — em uma frase',{x:S.x0,y:botOf(hk)+86,ay:'t',size:36,weight:500,fill:'muted',maxW:cw*.75,start:0,end:3.2,inn:{type:'fade',dur:.5,delay:1},out:out()});
  // cena 2 · problema
  const p2=TX('s2_text','Problema (campo)','[Descreva o problema ou o desejo do cliente em uma frase curta]',{x:S.x0+52,y:cy+20,size:land?86:port?88:76,weight:800,ls:-1,lh:1.08,maxW:cw-52,start:3.2,end:6.8,split:'word',stagger:.07,inn:{...rise,delay:.15,dur:.6,dist:40},out:out()});
  TX('s2_label','Problema · rótulo','O PROBLEMA',{x:S.x0+52,y:topOf(p2)-34,ay:'b',size:30,weight:800,ls:8,fill:'accent',start:3.2,end:6.8,inn:{type:'fade',dur:.4},out:out()});
  SH('s2_rule','Problema · filete','rect',S.x0+5,p2.props.y,10,p2.props.h,{start:3.2,end:6.8,fill:'accent',inn:{type:'wipeU',dur:.6,ease:'outExpo'},out:out()});
  // cena 3 · solução
  const iw=land?720:port?cw:380,ih=land?800:port?700:460,ix=land?S.x1-iw/2:port?cx:S.x1-iw/2,iy=port?S.y0+ih/2:cy;
  const im=IM('s3_img','Foto do produto (exemplo)',ensureAsset('ph_prod',phProduct),ix,iy,iw,ih,{start:6.8,end:10.8,radius:28,inn:{type:'wipeU',dur:.8,ease:'outExpo'},out:out()});
  K(im,'zoom',[[6.8,1,'outQuad'],[10.8,1.1,'linear']]);
  const tw=land?S.x1-iw-80-S.x0:port?cw:cw-iw-40,tl=TX('s3_label','Solução · rótulo','A SOLUÇÃO',{x:S.x0,y:0,ay:'t',size:28,weight:800,ls:8,fill:'accent',start:6.8,end:10.8,inn:{type:'fade',dur:.4,delay:.2},out:out()});
  const tn=TX('s3_name','Nome do produto (campo)','[NOME DO PRODUTO]',{x:S.x0,y:0,ay:'t',size:land?104:port?108:64,weight:900,ls:-2,lh:1.02,maxW:tw,start:6.8,end:10.8,split:'word',stagger:.1,inn:{...rise,delay:.35,dist:50},out:out()});
  const tv=TX('s3_value','Proposta de valor (campo)','[Proposta de valor em uma frase]',{x:S.x0,y:0,ay:'t',size:land?42:40,weight:500,fill:'muted',maxW:tw,lh:1.25,start:6.8,end:10.8,inn:{type:'fade',dur:.5,delay:.9},out:out()});
  vstack([tl,tn,tv],[24,28],port?(iy+ih/2+S.y1)/2:cy);
  // cena 4 · benefícios (um destaque por vez)
  const gap=port?250:190,row=i=>cy+(i-1)*gap+(port?0:20),bs=[11.2,12.5,13.8];
  TX('s4_label','Benefícios · rótulo','POR QUE ESCOLHER',{x:S.x0,y:row(0)-gap*.82,ay:'b',size:30,weight:800,ls:8,fill:'accent',start:10.8,end:15.8,inn:{type:'fade',dur:.4},out:out()});
  bs.forEach((st,i)=>{
    const y=row(i),nx=bs[i+1],dim=l=>{if(nx)K(l,'opacity',[[nx,1,'inOutSine'],[nx+.5,.32,'linear']]);};
    const n=TX(`b${i+1}_num`,`Benefício ${i+1} · número`,'0'+(i+1),{x:S.x0,y,ay:'m',size:64,weight:900,fill:'accent',start:st,end:15.8,inn:{type:'fade',dur:.3},out:out()});
    const t=TX(`b${i+1}_txt`,`Benefício ${i+1} (campo)`,`[Benefício ${i+1} — uma frase curta]`,{x:S.x0+135,y,ay:'m',size:land?64:58,weight:700,maxW:cw-135,lh:1.1,start:st,end:15.8,inn:{...rise,dur:.6,dist:34},out:out()});
    SH(`b${i+1}_line`,`Benefício ${i+1} · divisor`,'rect',cx,y+gap/2,cw,2,{start:st,end:15.8,fill:'muted',opacity:.35,inn:{type:'wipeL',dur:.7,ease:'outExpo'},out:out()});
    dim(n);dim(t);
  });
  // cena 5 · prova
  const q=TX('s5_quote','Depoimento (campo)','Depoimento real de um cliente — insira apenas conteúdo autorizado.',{x:S.x0,y:cy+60,ay:'m',size:land?70:port?72:62,weight:700,lh:1.16,maxW:cw,start:15.8,end:18.6,split:'word',stagger:.05,inn:{...rise,dur:.5,delay:.3,dist:32},out:out()});
  TX('s5_mark','Aspas','“',{x:S.x0,y:topOf(q)-8,ay:'b',size:220,weight:900,font:FONTS[1][0],fill:'accent',lh:.5,start:15.8,end:18.6,inn:{type:'pop',dur:.6,ease:'outBack'},out:out()});
  const who=TX('s5_who','Autor do depoimento (campo)','[Nome do cliente · cidade]',{x:S.x0,y:botOf(q)+36,ay:'t',size:34,weight:600,fill:'muted',start:15.8,end:18.6,inn:{type:'fade',dur:.5,delay:.9},out:out()});
  TX('s5_note','Aviso','Use apenas depoimentos reais e autorizados.',{x:S.x0,y:botOf(who)+14,ay:'t',size:26,weight:500,fill:'muted',opacity:.7,start:15.8,end:18.6,inn:{type:'fade',dur:.5,delay:1.1},out:out()});
  // cena 6 · chamada para ação
  SH('s6_bg','Chamada · fundo','rect',cx,H/2,W,H,{start:18.6,end:21.5,fill:'accent',depth:0,inn:{type:'wipeD',dur:.7,ease:'inOutQuart'}});
  const hd=TX('s6_head','Chamada para ação (campo)','[CHAMADA PARA AÇÃO]',{x:cx,y:0,ax:'c',ay:'t',size:land?118:port?120:96,weight:900,ls:-2,lh:1.02,align:'center',fill:'bg',maxW:cw,start:18.6,end:21.5,split:'word',stagger:.09,inn:{...rise,delay:.55,dist:50},out:{type:'none'}});
  const bt=SH('s6_btn','Botão','rect',cx,0,land?640:600,land?130:120,{start:18.6,end:21.5,fill:'bg',radius:70,inn:{type:'pop',dur:.6,delay:1.0,ease:'outBack'}});
  K(bt,'scale',[[20,1,'inOutSine'],[20.5,1.05,'inOutSine'],[21,1,'inOutSine']]);
  const lk=TX('s6_link','Link / perfil (campo)','[link, @perfil ou telefone]',{x:cx,y:0,ax:'c',ay:'t',size:40,weight:700,align:'center',fill:'bg',maxW:cw,start:18.6,end:21.5,inn:{type:'fade',dur:.5,delay:1.5}});
  const fn=TX('s6_fine','Condição comercial (campo)','[Condição comercial real, se houver]',{x:cx,y:0,ax:'c',ay:'t',size:28,weight:500,align:'center',fill:'bg',opacity:.78,maxW:cw,start:18.6,end:21.5,inn:{type:'fade',dur:.5,delay:1.7}});
  vstack([hd,bt,lk,fn],[70,56,22],cy);
  const bl=TX('s6_btn_txt','Botão · texto (campo)','[AÇÃO]',{x:cx,y:bt.props.y,ax:'c',ay:'m',size:46,weight:800,align:'center',fill:'accent',start:18.6,end:21.5,inn:{type:'fade',dur:.4,delay:1.3}});
  K(bl,'scale',[[20,1,'inOutSine'],[20.5,1.05,'inOutSine'],[21,1,'inOutSine']]);
  const pg=SH('progress','Barra de progresso','rect',0,4,0,8,{fill:'accent',depth:0});
  K(pg,'x',[[0,0,'linear'],[21.5,W/2,'linear']]);K(pg,'w',[[0,0,'linear'],[21.5,W,'linear']]);
  pg.tok.fill='accent';
}

/* ============================ carregar modelos / composições ============================ */
const COMPOSITIONS={cine:[buildCine,'1920x1080'],sales:[buildSales,'1080x1920']};
function loadTemplate(n){
  pause();
  if(COMPOSITIONS[n])buildComposition(...COMPOSITIONS[n]);
  else{project=newProject();TEMPLATES[n]();project.brand.bg=project.bg;project.name={blank:'Projeto em branco',title:'Título animado',lower:'Lower third',logo:'Logo reveal',count:'Contagem 3-2-1'}[n]||'Modelo';}
  selId=null;selKF=null;time=0;loadProjectFonts();
  applySize();fitTimeline();buildInspector();syncName();setTime(0);resetHistory();
}
$('#tplSel').addEventListener('change',e=>{const v=e.target.value;e.target.value='';if(v){loadTemplate(v);toast('Modelo carregado — Ctrl+Z desfaz.');}});
