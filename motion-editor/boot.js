
/* ============================ inicialização ============================ */
injectIcons();buildPresets();
(function init(){
  const fmts=supportedMimes();
  $('#expFmt').innerHTML=fmts.length?fmts.map(m=>`<option value="${m[0]}">${m[1]}</option>`).join(''):'<option value="">Sem suporte</option>';
  let loaded=false;
  try{
    const d=JSON.parse(localStorage.getItem(LS_KEY)||'null');
    if(d&&d.project&&Array.isArray(d.project.layers)){assets=d.assets||{};project=migrate(d.project);loaded=true;}
  }catch(e){}
  if(loaded){loadProjectFonts();applySize();fitTimeline();buildInspector();syncName();setTime(0);resetHistory();}
  else loadTemplate('cine');
  $('#btnPlay').innerHTML=icon('play');updateUndo();
  requestAnimationFrame(()=>{fitStage();fitTimeline();draw();});
})();
window.__motionlab={get project(){return project;},get time(){return time;},get playing(){return playing;},setTime,play,pause,addLayer,loadTemplate,generate,renderScene,setFormat,select,retimeScene,migrate,libSave,libOpen,libGet,safeBox,layoutText,fontOf,camMatrix,get ctx(){return ctx;},get cv(){return cv;}};
