/* ============================ utilidades ============================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const ICONS={
 play:'<polygon points="5 3 19 12 5 21 5 3"/>',pause:'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
 skipback:'<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>',
 repeat:'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
 undo:'<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
 redo:'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
 square:'<rect x="3" y="3" width="18" height="18" rx="2"/>',circle:'<circle cx="12" cy="12" r="9"/>',
 triangle:'<path d="M12 3 22 20H2z"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
 type:'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
 upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
 film:'<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>',
 shuffle:'<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
 trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
 copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
 up:'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
 down:'<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
 eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
 lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 unlock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'
};
const icon=(n,s=16)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;
function injectIcons(root=document){ $$('[data-icon]',root).forEach(el=>{ el.insertAdjacentHTML('afterbegin',icon(el.dataset.icon)); el.removeAttribute('data-icon'); }); }


Object.assign(ICONS,{
 camera:'<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
 folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
 safe:'<rect x="2" y="3" width="20" height="18" rx="2"/><rect x="6" y="7" width="12" height="10" stroke-dasharray="2 2"/>'
});

/* ============================ easing & cores ============================ */
const EASE={
 linear:t=>t,
 inQuad:t=>t*t, outQuad:t=>t*(2-t), inOutQuad:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,
 inCubic:t=>t*t*t, outCubic:t=>1-Math.pow(1-t,3), inOutCubic:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
 outQuart:t=>1-Math.pow(1-t,4), inOutQuart:t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2,
 outExpo:t=>t>=1?1:1-Math.pow(2,-10*t), inOutExpo:t=>t<=0?0:t>=1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2,
 outSine:t=>Math.sin(t*Math.PI/2), inOutSine:t=>-(Math.cos(Math.PI*t)-1)/2,
 inBack:t=>{const c=1.70158;return (c+1)*t*t*t-c*t*t},
 outBack:t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)},
 inOutBack:t=>{const c=1.70158*1.525;return t<.5?(Math.pow(2*t,2)*((c+1)*2*t-c))/2:(Math.pow(2*t-2,2)*((c+1)*(t*2-2)+c)+2)/2},
 outBounce:t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375},
 outElastic:t=>t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI/3))+1,
 hold:t=>t<1?0:1
};
const EASE_LABEL={linear:'Linear',inQuad:'Ease In',outQuad:'Ease Out',inOutQuad:'Ease In-Out',inCubic:'Cubic In',outCubic:'Cubic Out',inOutCubic:'Cubic In-Out',
 outQuart:'Quart Out',inOutQuart:'Quart In-Out (cinema)',outExpo:'Expo Out (suave e rápida)',inOutExpo:'Expo In-Out',outSine:'Sine Out',inOutSine:'Sine In-Out (lenta)',
 inBack:'Back In',outBack:'Back Out (overshoot)',inOutBack:'Back In-Out',outBounce:'Bounce',outElastic:'Elastic',hold:'Degrau (hold)'};
function bezier(x1,y1,x2,y2){
  const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
  const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t,dX=t=>(3*ax*t+2*bx)*t+cx;
  return x=>{
    if(x<=0)return 0;if(x>=1)return 1;let t=x;
    for(let i=0;i<8;i++){const e=X(t)-x;if(Math.abs(e)<1e-5)break;const d=dX(t);if(Math.abs(d)<1e-6)break;t-=e/d;}
    if(Math.abs(X(t)-x)>1e-4){let lo=0,hi=1;t=x;for(let i=0;i<30;i++){if(X(t)<x)lo=t;else hi=t;t=(lo+hi)/2;}}
    return Y(t);
  };
}
const bezCache={};
function easeFn(name){
  if(EASE[name])return EASE[name];
  if(typeof name==='string'&&name.startsWith('cb:')){
    if(!bezCache[name]){const n=name.slice(3).split(',').map(Number);bezCache[name]=n.length===4&&n.every(Number.isFinite)?bezier(...n):EASE.linear;}
    return bezCache[name];
  }
  return EASE.linear;
}
function hex2rgb(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16)||0;return[n>>16&255,n>>8&255,n&255]}
const rgb2hex=a=>'#'+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function mixColor(a,b,p){p=clamp(p,0,1);const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A.map((v,i)=>v+(B[i]-v)*p))}
const luma=h=>{const[r,g,b]=hex2rgb(h);return(.299*r+.587*g+.114*b)/255};
const rgba=(h,a)=>{const[r,g,b]=hex2rgb(h);return`rgba(${r},${g},${b},${a})`};

/* ============================ modelo de dados ============================ */
const PROPS=[ // propriedades animáveis
 {k:'x',label:'X',step:1},{k:'y',label:'Y',step:1},{k:'w',label:'Largura',step:1,min:0},{k:'h',label:'Altura',step:1,min:0},
 {k:'rot',label:'Rotação °',step:1},{k:'scale',label:'Escala',step:.01,min:0},{k:'opacity',label:'Opacidade',step:.01,min:0,max:1},
 {k:'radius',label:'Raio',step:1,min:0},{k:'fill',label:'Cor',type:'color'},{k:'strokeW',label:'Contorno',step:1,min:0},{k:'reveal',label:'Digitar',step:.01,min:0,max:1},
 {k:'mask',label:'Máscara',step:.01,min:0,max:1},{k:'zoom',label:'Zoom mídia',step:.01,min:1},{k:'panX',label:'Pan X',step:.01,min:-1,max:1},{k:'panY',label:'Pan Y',step:.01,min:-1,max:1}
];
const PMAP=Object.fromEntries(PROPS.map(p=>[p.k,p]));
const ANIM_ORDER=PROPS.map(p=>p.k);
const CAM_LABEL={x:'Centro X',y:'Centro Y',scale:'Zoom',rot:'Rotação'};
const GEO=['x','y','w','h','scale','radius','strokeW'];
const NAMES={icon:'Ícone',rect:'Retângulo',ellipse:'Elipse',triangle:'Triângulo',star:'Estrela',text:'Texto',image:'Imagem'};
const FONTS=[['system-ui, "Segoe UI", Roboto, sans-serif','Sans (sistema)'],['Georgia, "Times New Roman", serif','Georgia (serifa)'],['Impact, "Arial Black", sans-serif','Impact'],['"Arial Black", Arial, sans-serif','Arial Black'],['"Trebuchet MS", sans-serif','Trebuchet'],['"Courier New", monospace','Courier (mono)'],['Verdana, sans-serif','Verdana']];
const SIZES=[[1280,720,'16:9 HD (1280×720)'],[1920,1080,'16:9 Full HD (1920×1080)'],[1080,1920,'9:16 Stories/Reels (1080×1920)'],[1080,1080,'1:1 Quadrado (1080×1080)'],[1080,1350,'4:5 Feed (1080×1350)']];
const BRAND_TOKENS=[['','Cor própria'],['bg','Fundo'],['primary','Principal'],['secondary','Secundária'],['accent','Destaque'],['text','Texto'],['muted','Apagado'],['danger','Erro (vermelho)'],['success','Acerto (verde)']];
const BLENDS=[['source-over','Normal'],['multiply','Multiplicar'],['screen','Tela'],['overlay','Sobrepor'],['soft-light','Luz suave'],['lighten','Clarear']];
const FX_TYPES=[['none','Nenhuma'],['fade','Fade'],['rise','Subir + fade'],['slideL','Vir da esquerda'],['slideR','Vir da direita'],['slideU','Vir de cima'],['slideD','Vir de baixo'],['pop','Pop (escala)'],['zoom','Zoom suave'],['focus','Foco (blur → nítido)'],['wipeL','Revelar da esquerda'],['wipeR','Revelar da direita'],['wipeU','Revelar de cima'],['wipeD','Revelar de baixo']];
const SPLITS=[['none','Texto inteiro'],['line','Por linha'],['word','Por palavra'],['char','Por caractere']];

let project, assets={}, time=0, playing=false, loopOn=true, selId=null, selKF=null, exporting=false, cancelExport=false, showSafe=false;
let pxPerSec=120, viewScale=1, rafId=0, lastTs=0;
const LABELW=190;

const defBrand=()=>({bg:'#0e1015',primary:'#7c5cff',secondary:'#22d3ee',accent:'#ffc857',text:'#ffffff',muted:'#8d96a9',danger:'#ff4d4f',success:'#2ecc71',fontHead:FONTS[0][0],fontBody:FONTS[0][0]});
const makeCamera=(w,h,d)=>({id:'camera',name:'Câmera',type:'camera',start:0,end:d,visible:true,locked:false,props:{x:w/2,y:h/2,scale:1,rot:0},tracks:{}});
const newProject=(w=1280,h=720)=>({name:'Projeto sem nome',bgMode:'color',w,h,duration:5,fps:30,bg:'#0e1015',brand:defBrand(),scenes:[],variants:{},fonts:[],camera:makeCamera(w,h,5),layers:[]});
const getLayer=id=>id==='camera'?project.camera:project.layers.find(l=>l.id===id)||null;
const sel=()=>getLayer(selId);
const eps=()=>.5/project.fps;
const visibleAt=(L,t)=>L.visible&&t>=L.start-1e-6&&t<=L.end+1e-6;

function layerDefaults(type){
  const L={id:'',name:'',type,start:0,end:5,visible:true,locked:false,noFill:false,depth:1,blend:'source-over',maskDir:'none',
    props:{x:0,y:0,w:300,h:300,rot:0,scale:1,opacity:1,radius:0,fill:'#7c5cff',stroke:'#ffffff',strokeW:0,reveal:1,mask:1,zoom:1,panX:0,panY:0},
    tracks:{},tok:{fill:'',stroke:'',grad:''},grad:{mode:'none',color:'#000000',angle:90},
    fx:{in:{type:'none',dur:.7,delay:0,ease:'outExpo',dist:60},out:{type:'none',dur:.5,ease:'inCubic',dist:60}}};
  if(type==='text')Object.assign(L,{text:'Seu texto',font:FONTS[0][0],fontRole:'',size:96,weight:800,align:'center',ls:0,lh:1.18,maxW:0,split:'none',stagger:.06});
  if(type==='image')Object.assign(L,{asset:null,fit:'cover',jitter:0});
  if(type==='icon')Object.assign(L,{icon:'dollar',lw:2.2});
  return L;
}
function deepFill(t,d){
  for(const k in d){
    if(t[k]===undefined)t[k]=JSON.parse(JSON.stringify(d[k]));
    else if(d[k]&&typeof d[k]==='object'&&!Array.isArray(d[k])&&t[k]&&typeof t[k]==='object')deepFill(t[k],d[k]);
  }
  return t;
}
function migrate(p){
  const hadBrand=!!p.brand;
  p.name=p.name||'Projeto';p.brand=deepFill(p.brand||{},defBrand());
  if(!hadBrand&&p.bg)p.brand.bg=p.bg; p.bg=p.brand.bg;
  p.bgMode=p.bgMode||'color';p.scenes=p.scenes||[];p.variants=p.variants||{};p.fonts=p.fonts||[];p.fps=p.fps||30;
  p.camera=deepFill(p.camera||{},makeCamera(p.w,p.h,p.duration));
  p.layers.forEach(L=>deepFill(L,layerDefaults(L.type)));
  return p;
}
function makeLayer(type,over={}){
  const L=layerDefaults(type);
  L.id=uid();L.end=project.duration;L.props.x=project.w/2;L.props.y=project.h/2;
  if(type==='text'||type==='icon')L.props.fill='#ffffff';
  if(type==='icon'){L.props.w=L.props.h=220;}
  const {props,fx,tok,grad,...rest}=over;
  Object.assign(L,rest);
  if(props)Object.assign(L.props,props);
  if(fx){if(fx.in)Object.assign(L.fx.in,fx.in);if(fx.out)Object.assign(L.fx.out,fx.out);}
  if(tok)Object.assign(L.tok,tok);if(grad)Object.assign(L.grad,grad);
  if(!L.name){const n=project.layers.filter(l=>l.type===type).length+1;L.name=`${NAMES[type]} ${n}`;}
  return L;
}

function evalProp(L,k,t){
  const tr=L.tracks[k];
  if(!tr||!tr.length)return L.props[k];
  if(t<=tr[0].t)return tr[0].v;
  const last=tr[tr.length-1]; if(t>=last.t)return last.v;
  let i=0; while(i<tr.length-2&&tr[i+1].t<=t)i++;
  const a=tr[i],b=tr[i+1]; const p=easeFn(a.ease)((t-a.t)/(b.t-a.t));
  return k==='fill'?mixColor(a.v,b.v,p):a.v+(b.v-a.v)*p;
}
function upsertKF(L,k,t,v){
  const tr=L.tracks[k]; let f=tr.find(f=>Math.abs(f.t-t)<eps());
  if(f){f.v=v;}else{const prev=[...tr].reverse().find(f=>f.t<t);f={t:r3(t),v,ease:prev?prev.ease:'outCubic'};tr.push(f);tr.sort((a,b)=>a.t-b.t);}
  return f;
}
function setProp(L,k,v){ if(L.tracks[k])upsertKF(L,k,time,v); else L.props[k]=v; }
function toggleKF(L,k){
  const tr=L.tracks[k];
  if(!tr){L.tracks[k]=[{t:r3(time),v:evalProp(L,k,time),ease:'outCubic'}];selKF={lid:L.id,k,kf:L.tracks[k][0]};return;}
  const i=tr.findIndex(f=>Math.abs(f.t-time)<eps());
  if(i>=0){const [r]=tr.splice(i,1); if(selKF&&selKF.kf===r)selKF=null; if(!tr.length){L.props[k]=r.v;delete L.tracks[k];}}
  else{const f=upsertKF(L,k,time,evalProp(L,k,time));selKF={lid:L.id,k,kf:f};}
}

/* cores vinculadas à identidade visual */
const tokColor=(L,slot,fb)=>{const tk=L.tok&&L.tok[slot];return tk&&project.brand[tk]?project.brand[tk]:fb;};
const fillOf=(L,t)=>L.tracks.fill&&L.tracks.fill.length?evalProp(L,'fill',t):tokColor(L,'fill',L.props.fill);
const strokeOf=L=>tokColor(L,'stroke',L.props.stroke);
const gradOf=L=>tokColor(L,'grad',L.grad.color);
const fontOf=L=>L.fontRole==='head'?project.brand.fontHead:L.fontRole==='body'?project.brand.fontBody:L.font;

/* margens seguras (insets em px) por formato */
function safeInsets(w=project.w,h=project.h){
  if(h>w*1.3)return{l:w*.067,r:w*.067,t:h*.13,b:h*.2};      // 9:16: evita a interface de Reels/Stories
  if(Math.abs(w-h)<w*.1)return{l:w*.075,r:w*.075,t:h*.075,b:h*.075};
  return{l:w*.0625,r:w*.0625,t:h*.075,b:h*.075};
}
const safeBox=(w=project.w,h=project.h)=>{const s=safeInsets(w,h);return{x0:s.l,y0:s.t,x1:w-s.r,y1:h-s.b};};


/* ============================ biblioteca de ícones (traço vetorial, 24×24) ============================ */
const CIRC='M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z';
const GLYPHS={
 bill:{label:'Dinheiro (nota)',paths:['M2 6h20v12H2z','M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z','M5.5 9.5h.01','M18.5 14.5h.01']},
 coins:{label:'Moedas',paths:['M4 6.5C4 5.1 7.6 4 12 4s8 1.1 8 2.5S16.4 9 12 9 4 7.9 4 6.5z','M4 6.5v5C4 12.9 7.6 14 12 14s8-1.1 8-2.5v-5','M4 11.5v5C4 17.9 7.6 19 12 19s8-1.1 8-2.5v-5']},
 dollar:{label:'Cifrão',paths:['M12 2v20','M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6']},
 moneybag:{label:'Saco de dinheiro',paths:['M9 2.5h6l-1.6 3.5h-2.8z','M10.6 6C6 8 4 11.5 4 15.5 4 19 6.5 21.5 12 21.5s8-2.5 8-6c0-4-2-7.5-6.6-9.5','M12 10.5v8','M14.3 12h-2.3a1.6 1.6 0 0 0 0 3.2h.2a1.6 1.6 0 0 1 0 3.3H9.7']},
 wallet:{label:'Carteira',paths:['M3 6a2 2 0 0 1 2-2h13v4','M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3','M21 9h-4a3 3 0 0 0 0 6h4z','M17 12h.01']},
 card:{label:'Cartão',paths:['M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z','M2 10h20','M6 15h4']},
 factory:{label:'Fábrica',paths:['M3 21V11l6 4v-4l6 4V6h6v15z','M17 10h2','M17 14h2','M6 18h2','M11 18h2','M18 2.5c0 1.2 1.5 1.2 1.5 2.5']},
 bottle:{label:'Garrafa',paths:['M10 2h4','M10.5 2v4.5c0 1-2 2-2 4V20a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V10.5c0-2-2-3-2-4V2','M8.5 14h7']},
 cup:{label:'Copo',paths:['M6 3h12l-1.4 17.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8z','M6.5 9h11']},
 cocktail:{label:'Drinque',paths:['M3 4h18l-9 10z','M12 14v7','M8 21h8','M16 4l2.5-2.5']},
 cart:{label:'Carrinho',paths:['M9 21a1 1 0 1 0 0 .01','M20 21a1 1 0 1 0 0 .01','M1 2h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 7H6']},
 gift:{label:'Presente',paths:['M20 12v10H4V12','M2 7h20v5H2z','M12 22V7','M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z','M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z']},
 clock:{label:'Relógio',paths:[CIRC,'M12 7v5l3.5 2']},
 lightbulb:{label:'Ideia',paths:['M9 18h6','M10 21.5h4','M12 2.5a6.5 6.5 0 0 0-3.6 11.9c.7.5 1.1 1.3 1.1 2.1v1.5h5v-1.5c0-.8.4-1.6 1.1-2.1A6.5 6.5 0 0 0 12 2.5z']},
 trendup:{label:'Gráfico subindo',paths:['M23 6l-9.5 9.5-5-5L1 18','M17 6h6v6']},
 trenddown:{label:'Gráfico caindo',paths:['M23 18l-9.5-9.5-5 5L1 6','M17 18h6v-6']},
 target:{label:'Alvo',paths:[CIRC,'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z','M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z']},
 alert:{label:'Alerta',paths:['M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z','M12 9v4','M12 17h.01']},
 question:{label:'Dúvida',paths:[CIRC,'M9.1 9.2a3 3 0 0 1 5.8 1c0 2-3 2.6-3 4.3','M12 17.5h.01']},
 x:{label:'X (errado)',paths:['M18 6L6 18','M6 6l12 12']},
 xcircle:{label:'X em círculo',paths:[CIRC,'M15 9l-6 6','M9 9l6 6']},
 check:{label:'Certo',paths:['M20 6L9 17l-5-5']},
 checkcircle:{label:'Certo em círculo',paths:[CIRC,'M8 12.5l3 3 5-6']},
 lock:{label:'Cadeado',paths:['M5 11h14v10H5z','M8 11V7a4 4 0 0 1 8 0v4','M12 15v2']},
 user:{label:'Pessoa',paths:['M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2']},
 heart:{label:'Coração',paths:['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z']},
 star:{label:'Estrela',paths:['M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z']},
 zap:{label:'Raio',paths:['M13 2L3 14h9l-1 8 10-12h-9z']},
 mail:{label:'E-mail',paths:['M3 5h18v14H3z','M21 6l-9 7-9-7']},
 file:{label:'Documento',paths:['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M8 13h8','M8 17h8']},
 sad:{label:'Triste',paths:[CIRC,'M16 16s-1.5-2-4-2-4 2-4 2','M9 9.5h.01','M15 9.5h.01']},
 smile:{label:'Feliz',paths:[CIRC,'M8 14s1.5 2 4 2 4-2 4-2','M9 9.5h.01','M15 9.5h.01']},
 arrowr:{label:'Seta',paths:['M4 12h16','M13 5l7 7-7 7']}
};
const glyphCache={};
function glyphLen(d){try{const s=document.createElementNS('http://www.w3.org/2000/svg','path');s.setAttribute('d',d);return Math.max(.05,s.getTotalLength());}catch(e){return 60;}}
function glyphPaths(name){
  if(!glyphCache[name]){const g=GLYPHS[name]||GLYPHS.x;glyphCache[name]=g.paths.map(d=>({p:new Path2D(d),len:glyphLen(d)}));}
  return glyphCache[name];
}
/* ícone: traço vetorial na cor da camada; "reveal" (0→1) desenha o traço */
function drawIcon(c,L,t,w,h){
  const p=clamp(evalProp(L,'reveal',t),0,1);
  c.save();c.scale(w/24,h/24);c.translate(-12,-12);
  c.strokeStyle=fillOf(L,t);c.lineWidth=L.lw||2.2;c.lineCap='round';c.lineJoin='round';
  for(const sp of glyphPaths(L.icon)){
    if(p>=.999)c.setLineDash([]);else{const d=sp.len+1;c.setLineDash([d,d]);c.lineDashOffset=d*(1-p);}
    c.stroke(sp.p);
  }
  c.restore();
}

/* ============================ renderização ============================ */
const cv=$('#cv'), ov=$('#ov'), ctx=cv.getContext('2d'), octx=ov.getContext('2d');
const imgCache={};
function getImage(id){
  if(!id||!assets[id])return null;
  if(!imgCache[id]){const im=new Image();im.onload=()=>draw();im.src=assets[id];imgCache[id]=im;}
  return imgCache[id];
}
function rrect(c,x,y,w,h,r){r=Math.max(0,Math.min(r,Math.abs(w)/2,Math.abs(h)/2));c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function shapePath(c,type,w,h,r){
  w=Math.max(0,w);h=Math.max(0,h);c.beginPath();
  if(type==='rect')rrect(c,-w/2,-h/2,w,h,r);
  else if(type==='ellipse')c.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);
  else if(type==='triangle'){c.moveTo(0,-h/2);c.lineTo(w/2,h/2);c.lineTo(-w/2,h/2);c.closePath();}
  else if(type==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?.42:1,px=Math.cos(a)*rr*w/2,py=Math.sin(a)*rr*h/2;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();}
}

/* animações de entrada/saída parametrizadas (editáveis pelo inspetor, sem keyframes) */
function fxApply(S,type,p,d,out){
  const k=1-p,fa=m=>clamp(p*m,0,1);
  switch(type){
    case'fade':S.a*=fa(1);break;
    case'rise':S.a*=fa(1.4);S.dy+=(out?-1:1)*d*k;break;
    case'slideL':S.a*=fa(1.6);S.dx-=d*k;break;
    case'slideR':S.a*=fa(1.6);S.dx+=d*k;break;
    case'slideU':S.a*=fa(1.6);S.dy-=d*k;break;
    case'slideD':S.a*=fa(1.6);S.dy+=d*k;break;
    case'pop':S.a*=fa(3);S.s*=Math.max(0,p);break;
    case'zoom':S.a*=fa(1);S.s*=1+.25*k;break;
    case'focus':S.a*=fa(1.5);S.blur=Math.max(0,k)*18;break;
    case'wipeL':case'wipeR':case'wipeU':case'wipeD':S.wipe={dir:type.slice(4).toLowerCase(),p:clamp(p,0,1)};break;
  }
}
const newFX=()=>({a:1,dx:0,dy:0,s:1,blur:0,wipe:null});
function fxState(L,t,skipIn){
  const S=newFX(),f=L.fx;
  if(!skipIn&&f.in.type!=='none'){const p=easeFn(f.in.ease)(clamp((t-L.start-f.in.delay)/Math.max(.01,f.in.dur),0,1));fxApply(S,f.in.type,p,f.in.dist,false);}
  if(f.out.type!=='none'){const q=clamp((t-(L.end-f.out.dur))/Math.max(.01,f.out.dur),0,1);if(q>0)fxApply(S,f.out.type,1-easeFn(f.out.ease)(q),f.out.dist,true);}
  return S;
}
function maskState(L,t,FX){
  let dir=L.maskDir&&L.maskDir!=='none'?L.maskDir:null,p=dir?clamp(evalProp(L,'mask',t),0,1):1;
  if(FX.wipe){if(!dir){dir=FX.wipe.dir;p=FX.wipe.p;}else p=Math.min(p,FX.wipe.p);}
  return{dir,p};
}
function clipMask(c,dir,p,bw,bh){
  if(!dir||p>=.999)return true;if(p<=.001)return false;
  const m=80;let x=-bw/2-m,y=-bh/2-m,w=bw+2*m,h=bh+2*m;
  if(dir==='l')w=m+bw*p;else if(dir==='r'){x=bw/2-bw*p;w=m+bw*p;}else if(dir==='u')h=m+bh*p;else{y=bh/2-bh*p;h=m+bh*p;}
  c.beginPath();c.rect(x,y,w,h);c.clip();return true;
}

/* texto: quebra automática, alinhamento, espaçamento e unidades (linha/palavra/caractere) */
function layoutText(c,L){
  c.font=`${L.weight} ${L.size}px ${fontOf(L)}`;
  const hasLS='letterSpacing' in c; if(hasLS)c.letterSpacing=(L.ls||0)+'px';
  const maxW=L.maxW>0?L.maxW:Infinity,lines=[];
  String(L.text).split('\n').forEach(para=>{
    if(maxW===Infinity){lines.push(para);return;}
    let cur='';
    para.split(' ').forEach(w=>{const test=cur?cur+' '+w:w;if(cur&&c.measureText(test).width>maxW){lines.push(cur);cur=w;}else cur=test;});
    lines.push(cur);
  });
  const trail=hasLS?(L.ls||0):0,widths=lines.map(l=>Math.max(0,c.measureText(l).width-trail)),lh=L.size*L.lh;
  return{lines,widths,lh,boxW:maxW<Infinity?maxW:Math.max(20,...widths),boxH:Math.max(lh,lines.length*lh)};
}
function textUnits(c,L,lay){
  const u=[],n=lay.lines.length;let idx=0;
  lay.lines.forEach((ln,i)=>{
    const y=(i-(n-1)/2)*lay.lh,x0=L.align==='left'?-lay.boxW/2:L.align==='right'?lay.boxW/2-lay.widths[i]:-lay.widths[i]/2;
    if(L.split==='line'){u.push({t:ln,x:x0,y,w:lay.widths[i],i:idx++});return;}
    if(L.split==='word'){let pos=0;ln.split(' ').forEach(w=>{if(w)u.push({t:w,x:x0+c.measureText(ln.slice(0,pos)).width,y,w:c.measureText(w).width,i:idx++});pos+=w.length+1;});return;}
    [...ln].forEach((ch,ci)=>{if(ch!==' ')u.push({t:ch,x:x0+c.measureText(ln.slice(0,ci)).width,y,w:c.measureText(ch).width,i:idx++});});
  });
  return u;
}
function drawText(c,L,t,lay,op,sw){
  c.textBaseline='middle';c.textAlign='left';c.lineJoin='round';
  c.fillStyle=fillOf(L,t);c.strokeStyle=strokeOf(L);if(sw>0)c.lineWidth=sw;
  const n=lay.lines.length;
  if(L.split==='none'){
    let left=Math.round(lay.lines.reduce((a,l)=>a+l.length,0)*clamp(evalProp(L,'reveal',t),0,1));
    lay.lines.forEach((ln,i)=>{
      const take=Math.min(ln.length,left);left-=take;const txt=ln.slice(0,take);if(!txt)return;
      const y=(i-(n-1)/2)*lay.lh,x=L.align==='left'?-lay.boxW/2:L.align==='right'?lay.boxW/2-lay.widths[i]:-lay.widths[i]/2;
      if(sw>0)c.strokeText(txt,x,y);c.fillText(txt,x,y);
    });
    return;
  }
  const f=L.fx.in,E=easeFn(f.ease);
  textUnits(c,L,lay).forEach(u=>{
    const S=newFX();
    if(f.type!=='none')fxApply(S,f.type.startsWith('wipe')?'fade':f.type,E(clamp((t-L.start-f.delay-u.i*L.stagger)/Math.max(.01,f.dur),0,1)),f.dist,false);
    if(S.a<=.002)return;
    c.save();c.globalAlpha=op*S.a;
    if(S.blur>.1&&'filter' in c)c.filter=`blur(${S.blur.toFixed(1)}px)`;
    c.translate(u.x+u.w/2+S.dx,u.y+S.dy);c.scale(S.s,S.s);
    if(sw>0)c.strokeText(u.t,-u.w/2,0);c.fillText(u.t,-u.w/2,0);c.restore();
  });
}
function gradFill(c,L,t,w,h){
  const base=fillOf(L,t),g=L.grad;
  if(g.mode==='none')return base;
  if(g.mode==='vignette'){const r=c.createRadialGradient(0,0,Math.min(w,h)*.22,0,0,Math.hypot(w,h)/2);r.addColorStop(0,rgba(base,0));r.addColorStop(1,rgba(base,1));return r;}
  const a=g.angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),h2=(Math.abs(ca)*w+Math.abs(sa)*h)/2||1;
  const r=c.createLinearGradient(-ca*h2,-sa*h2,ca*h2,sa*h2);
  r.addColorStop(0,base);r.addColorStop(1,g.mode==='fade'?rgba(base,0):gradOf(L));return r;
}
function drawImageBox(c,L,t,w,h){
  const img=getImage(L.asset);
  c.beginPath();rrect(c,-w/2,-h/2,w,h,evalProp(L,'radius',t));
  if(img&&img.complete&&img.naturalWidth){
    c.save();c.clip();
    const iw=img.naturalWidth,ih=img.naturalHeight,z=Math.max(1,evalProp(L,'zoom',t));
    const base=L.fit==='contain'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih),dw=iw*base*z,dh=ih*base*z;
    const px=clamp(evalProp(L,'panX',t),-1,1),py=clamp(evalProp(L,'panY',t),-1,1);
    c.drawImage(img,-dw/2+px*Math.max(0,dw-w)/2,-dh/2+py*Math.max(0,dh-h)/2,dw,dh);
    c.restore();
  }else{c.fillStyle='#2a2f3c';c.fill();}
}
const hash=(n,s)=>{const x=Math.sin(n*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
function drawLayer(c,L,t){
  const v=k=>evalProp(L,k,t),isText=L.type==='text';
  const FX=fxState(L,t,isText&&L.split!=='none');
  const op=clamp(v('opacity'),0,1)*FX.a; if(op<=.002)return;
  let lay=null;if(isText){lay=layoutText(c,L);L.props.w=lay.boxW;L.props.h=lay.boxH;}
  const bw=Math.max(0,v('w')),bh=Math.max(0,v('h')),mk=maskState(L,t,FX),sw=Math.max(0,v('strokeW'));
  let jx=0,jy=0;if(L.jitter>0){const fr=Math.floor(t*12);jx=(hash(fr,1)-.5)*L.jitter;jy=(hash(fr,2)-.5)*L.jitter;}
  c.save();
  c.translate(v('x')+FX.dx+jx,v('y')+FX.dy+jy);c.rotate(v('rot')*Math.PI/180);
  const s=Math.max(0,v('scale'))*FX.s;c.scale(s,s);
  c.globalAlpha=op;c.globalCompositeOperation=L.blend||'source-over';
  if(FX.blur>.1&&'filter' in c)c.filter=`blur(${FX.blur.toFixed(1)}px)`;
  if(!clipMask(c,mk.dir,mk.p,bw,bh)){c.restore();return;}
  if(isText)drawText(c,L,t,lay,op,sw);
  else if(L.type==='icon')drawIcon(c,L,t,bw,bh);
  else if(L.type==='image')drawImageBox(c,L,t,bw,bh);
  else{
    shapePath(c,L.type,bw,bh,v('radius'));
    if(!L.noFill){c.fillStyle=gradFill(c,L,t,bw,bh);c.fill();}
    if(sw>0){c.lineWidth=sw;c.strokeStyle=strokeOf(L);c.lineJoin='round';c.stroke();}
  }
  c.restore();
}
/* câmera: depth 0 = fixo na tela, 1 = acompanha a câmera, >1 = parallax de primeiro plano */
function camMatrix(t,depth=1){
  const C=project.camera,W=project.w,H=project.h;
  const cx=evalProp(C,'x',t),cy=evalProp(C,'y',t),z=evalProp(C,'scale',t),r=evalProp(C,'rot',t);
  const ez=Math.max(.05,1+(z-1)*depth),px=(cx-W/2)*depth,py=(cy-H/2)*depth;
  return new DOMMatrix().translate(W/2,H/2).scale(ez).rotate(r*depth).translate(-(W/2+px),-(H/2+py));
}
function renderScene(c,t){
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';
  if(project.bgMode==='transparent')c.clearRect(0,0,project.w,project.h);
  else{c.fillStyle=project.bgMode==='chroma'?'#00ff00':project.bg;c.fillRect(0,0,project.w,project.h);}
  for(const L of project.layers){
    if(!visibleAt(L,t))continue;
    c.save();c.setTransform(camMatrix(t,L.depth));drawLayer(c,L,t);c.restore();
  }
}
