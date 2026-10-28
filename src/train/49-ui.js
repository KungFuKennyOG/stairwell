
/* =====================================================================================================
   VIEWS, CAMERA, LIGHT, LOOP
   ===================================================================================================== */
const FP={cab:[4.2,1.6,0,0],salon:[-4.1,1.15,-.8,.25],sleeper:[-5.3,1.6,.75,0],bar:[-1.75,1.1,.95,0],dining:[-3.0,1.15,-.9,.15],standard:[-3.0,1.26,.6,.06],garden:[-4.35,.85,-.75,0],baggage:[-4.6,1.5,.4,-.1],observation:[-2.6,1.2,0,Math.PI]};
const state={view:'route',ps1:true,res:480,snap:true,affine:true,dither:true,scene:'valley',wagon:'bar',fp:false,speed:24,castPose:'fight',focusCar:-1};
try{ if(matchMedia('(prefers-reduced-motion: reduce)').matches) state.speed=0; }catch(e){}
const cam={t:[0,1,0],th:.7,ph:1.2,r:16},goal={t:[0,1,0],th:.7,ph:1.2,r:16},fpv={yaw:0,pitch:-.04,gy:0,gp:-.04};
function setGoal(c,instant){ goal.t=c.t.slice(); goal.ph=c.ph; goal.r=c.r; let th=c.th; while(th-cam.th>Math.PI) th-=Math.PI*2; while(th-cam.th<-Math.PI) th+=Math.PI*2; goal.th=th; if(instant){ cam.t=goal.t.slice(); cam.th=goal.th; cam.ph=goal.ph; cam.r=goal.r; } }
function effR(){ const asp=cv.width/Math.max(1,cv.height); return cam.r*Math.max(1,.95/asp); }
function eyePos(){ const r=effR(); return [cam.t[0]+r*Math.sin(cam.ph)*Math.sin(cam.th),cam.t[1]+r*Math.cos(cam.ph),cam.t[2]+r*Math.sin(cam.ph)*Math.cos(cam.th)]; }
const LIM={route:[2.5,24],wagons:[1.2,13],cast:[1.2,14]};
const clampGoal=()=>{ goal.ph=Math.min(1.62,Math.max(.12,goal.ph)); const l=LIM[state.view]; goal.r=Math.min(l[1],Math.max(l[0],goal.r)); fpv.gp=Math.max(-1.2,Math.min(1.1,fpv.gp)); };
const ptrs=new Map(); let lastPinch=0,panMode=false;
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); panMode=e.button===2||e.shiftKey; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; lastPinch=Math.hypot(a.x-b.x,a.y-b.y); } });
cv.addEventListener('pointermove',e=>{ const p=ptrs.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(inFP()){ fpv.gy+=dx*.005; fpv.gp-=dy*.004; clampGoal(); return; }
  if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(lastPinch) goal.r*=lastPinch/d; lastPinch=d; pan(dx/2,dy/2); }
  else if(panMode) pan(dx,dy); else { goal.th-=dx*.006; goal.ph-=dy*.005; } clampGoal(); });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) lastPinch=0; };
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr); cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{ e.preventDefault(); if(inFP()) return; goal.r*=Math.exp(e.deltaY*.0012); clampGoal(); },{passive:false});
cv.addEventListener('keydown',e=>{ const k={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
  if(k){ e.preventDefault(); if(inFP()){ fpv.gy-=k[0]; fpv.gp-=k[1]; } else { goal.th+=k[0]; goal.ph+=k[1]; } clampGoal(); }
  if(!inFP()){ if(e.key==='+'||e.key==='='){ goal.r*=.9; clampGoal(); } if(e.key==='-'){ goal.r*=1.1; clampGoal(); } } });
function pan(dx,dy){ const s=goal.r*.0016; const rx=Math.cos(cam.th),rz=-Math.sin(cam.th); goal.t[0]-=rx*dx*s; goal.t[2]-=rz*dx*s; goal.t[1]+=dy*s; goal.t[1]=Math.max(-.5,Math.min(5,goal.t[1])); const lim=state.view==='route'?70:7; goal.t[0]=Math.max(-lim,Math.min(lim,goal.t[0])); goal.t[2]=Math.max(-6,Math.min(6,goal.t[2])); }
const inFP=()=>state.view==='wagons'&&state.fp;

/* ---------- light ---------- */
const STATION_LIGHT={amb:[.5,.44,.46],dir:[-.6,.45,.5],dirCol:[.95,.66,.5],pl:[[[-9,4.4,1.3],[1.1,.85,.55],5],[[-3,4.4,1.3],[1.1,.85,.55],5],[[3,4.4,1.3],[1.1,.85,.55],5],[[9,4.4,1.3],[1.1,.85,.55],5],[[0,2.5,7],[.4,.36,.34],9]]};
function applyLight(){ const S=curScene.S, L0=S.light, fog=F3(S.horizon);
  if(state.view==='cast'){ setLights(Object.assign({fog,fogNear:110,fogFar:220},STATION_LIGHT)); return; }
  if(state.view==='wagons'){ const w=WG[state.wagon], k=Math.max(S.lamp,w.minLamp);
    setLights({amb:L0.amb.map(v=>v*w.ambK),dir:L0.dir,dirCol:L0.dirCol.map(v=>v*w.sunK),fog,fogNear:110,fogFar:220,pl:w.lamps.map(([p,c,d])=>[p,c.map(v=>v*k),d])}); return; }
  setLights({amb:L0.amb,dir:L0.dir,dirCol:L0.dirCol,fog,fogNear:110,fogFar:220,pl:[]}); }

/* ---------- views ---------- */
const VIEWS={
  route:{cam:{t:[0,1.2,0],th:.72,ph:1.22,r:17}},
  wagons:{},
  cast:{cam:{t:[-2.4,1.4,.55],th:0,ph:1.43,r:13}}
};
function wagonCam(){ const w=WG[state.wagon]; return Object.assign({},w.cam,{t:w.cam.t.slice()}); }
function setWagon(key,instant){ for(const k in WG) WG[k].g.vis=false; state.wagon=key; WG[key].g.vis=state.view==='wagons'; if(state.view==='wagons'){ setGoal(wagonCam(),instant); const s=FP[key]; fpv.gy=fpv.yaw=s[3]; fpv.gp=fpv.pitch=-.04; applyLight(); } }
function setSceneUI(key){ state.scene=key; setScene(state.view==='cast'?'lumen':key); setGlow(!!(curScene.S.night||curScene.S.tunnel)&&state.view!=='cast'); applyLight(); updateClock(); }
function setView(v,instant){
  if(!VIEWS[v]) v='route'; state.view=v;
  TRAIN.vis=v==='route'; STATION.vis=v==='cast'; for(const k in WG) WG[k].g.vis=(v==='wagons'&&k===state.wagon);
  POLES.vis=v!=='cast'; for(const a of POLE_ARMS) a.vis=v==='route';
  setScene(v==='cast'?'lumen':state.scene); POLES.vis=v!=='cast'&&!curScene.S.tunnel;
  setGlow(!!(curScene.S.night||curScene.S.tunnel)&&v!=='cast');
  if(v==='wagons') setGoal(wagonCam(),instant); else setGoal(VIEWS[v].cam,instant);
  if(v==='wagons'){ const s=FP[state.wagon]; fpv.gy=fpv.yaw=s[3]; fpv.gp=fpv.pitch=-.04; }
  document.querySelectorAll('.tabs a').forEach(a=>{ if(a.dataset.view===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  applyLight(); renderCard(); updateClock(); }

/* ---------- card ---------- */
const card=document.getElementById('card'), clockEl=document.getElementById('clock');
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; };
function chips(list,names){ const ul=el('ul','chips'); list.forEach((c,i)=>{ const li=el('li'); const i_=el('i'); i_.style.background=c; li.append(i_,names?names[i]:c.toUpperCase()); ul.append(li); }); return ul; }
function segOf(opts,cur,onPick){ const s=el('div','seg'); for(const [v,label] of opts){ const b=el('button',null,label); b.type='button'; b.dataset.v=v; b.setAttribute('aria-pressed',String(v===cur)); b.addEventListener('click',()=>{ s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(v); }); s.append(b); } return s; }
function listOf(items,cur,onPick){ const ul=el('ul','list');
  items.forEach(it=>{ const li=el('li'),b=el('button'); b.type='button'; b.setAttribute('aria-pressed',String(it.id===cur));
    let lead; if(it.sw){ lead=el('span','sw'); it.sw.slice(0,3).forEach(c=>{ const i=el('i'); i.style.background=c; lead.append(i); }); } else { lead=el('span','num',it.num||''); if(it.color){ lead.textContent=''; lead.style.cssText=`width:10px;height:10px;background:${it.color};align-self:center`; } }
    const txt=el('span'); txt.style.minWidth='0'; txt.append(el('b',null,it.name)); if(it.sub) txt.append(el('span','who',it.sub)); if(it.note) txt.append(el('small',null,it.note));
    b.append(lead,txt,el('span','num',it.right||'')); b.addEventListener('click',()=>{ ul.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true'); onPick(it); });
    li.append(b); ul.append(li); }); return ul; }
const sceneItems=()=>SCENE_ORDER.map(k=>{ const S=SCENES[k]; return {id:k,name:S.name,sub:S.time,note:S.note,sw:S.swatch,right:'KM '+String(S.km).padStart(3,'0')}; });
function renderCard(){ card.innerHTML='';
  if(state.view==='route'){
    card.append(el('p','sub','Line H1 · Port Lumen to Neo-Hanamura · 362 km'),el('h2',null,'The Silver Heron'));
    const b=el('p','body'); b.append('A nine-car bullet train on its first ever run across the Republic of Halcyra. One day, dawn to night, six very different stretches of line. ',el('b',null,'You start at the back and fight forward to the cab'),', one car at a time.'); card.append(b);
    const sc=SCENES[state.scene]; card.append(el('p','seg-label','Stretch of the line'),listOf(sceneItems(),state.scene,it=>{ setSceneUI(it.id); renderCard(); }));
    const cars=WAGONS.map((W,i)=>({id:W.key,num:W.num,name:W.name,sub:W.sub.split(' · ')[0],color:W.color,right:'View'}));
    card.append(el('p','seg-label','The consist, front to back'),listOf(cars,null,it=>{ const i=WAGONS.findIndex(w=>w.key===it.id); setGoal({t:[(4-i)*CAR_PITCH,1.2,0],th:.62,ph:1.25,r:12}); }));
  } else if(state.view==='wagons'){
    const W=WAGONS.find(w=>w.key===state.wagon), idx=WAGONS.indexOf(W);
    card.append(el('p','sub',`Car ${W.num} of 09 · ${W.sub}`),el('h2',null,W.name),el('p','body',W.note),chips(W.sw));
    const row=el('div','row'); const prev=el('button','btn ghost','‹ Car '+(idx>0?WAGONS[idx-1].num:'')), next=el('button','btn ghost','Car '+(idx<8?WAGONS[idx+1].num:'')+' ›'), sit=el('button','btn',state.fp?'Stand up':'Sit inside');
    for(const b of [prev,next,sit]) b.type='button'; sit.setAttribute('aria-pressed',String(state.fp)); prev.disabled=idx===0; next.disabled=idx===8; if(prev.disabled) prev.style.opacity=.35; if(next.disabled) next.style.opacity=.35;
    prev.addEventListener('click',()=>{ if(idx>0){ setWagon(WAGONS[idx-1].key); renderCard(); } }); next.addEventListener('click',()=>{ if(idx<8){ setWagon(WAGONS[idx+1].key); renderCard(); } });
    sit.addEventListener('click',()=>{ state.fp=!state.fp; const s=FP[state.wagon]; fpv.gy=fpv.yaw=s[3]; fpv.gp=fpv.pitch=-.04; renderCard(); });
    row.append(sit,prev,next); card.append(row);
    card.append(el('p','seg-label','Outside the windows'),segOf(SCENE_ORDER.map(k=>[k,SCENES[k].name.split(' ').slice(-1)[0]]),state.scene,v=>setSceneUI(v)));
    card.append(listOf(WAGONS.map(w=>({id:w.key,num:w.num,name:w.name,sub:w.sub.split(' · ')[0],sw:w.sw})),state.wagon,it=>{ setWagon(it.id); renderCard(); }));
  } else {
    card.append(el('p','sub','Platform 1 · Port Lumen Central · 07:22'),el('h2',null,'Who is on board'));
    card.append(el('p','body','Everyone on the line-up runs on the Stairwell rig: the same skinned body, painted faces and expressions, the same two-handed gun holds. Only the clothes, the faces and the hats are new.'));
    const w=el('div'); w.append(el('p','seg-label','Show them'),segOf([['fight','Fighting'],['hurt','Hurt'],['beg','Begging']],state.castPose,p=>{ state.castPose=p; for(const c of castChars) applyPose(c,p); })); card.append(w);
    card.append(listOf(CAST_ORDER.map((id,i)=>({id,name:ROSTER[id].name,sub:ROSTER[id].role,note:ROSTER[id].note+' '+ROSTER[id].where+'.',color:ROSTER[id].color,i})),null,it=>setGoal({t:[CAST_X[it.i],1.15,.55],th:0,ph:1.42,r:2.8})));
  } }
function updateClock(){ const S=SCENES[state.view==='cast'?'lumen':state.scene]; clockEl.innerHTML=''; const b=el('b',null,state.view==='cast'?'07:22':S.time); clockEl.append(b,state.view==='cast'?'Port Lumen Central':`${S.name} · km ${S.km}`); }

window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
document.querySelectorAll('.tabs a').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const v=a.dataset.view; try{ history.replaceState(null,'','#'+v); }catch(_){} setView(v); }));
const $=id=>document.getElementById(id);
function syncLook(){ state.ps1=$('ps1').checked; state.snap=$('snap').checked; state.affine=$('affine').checked; state.dither=$('dither').checked; $('ps1opts').classList.toggle('dim',!state.ps1); texFilter=state.ps1?gl.NEAREST:gl.LINEAR; }
document.querySelectorAll('.look input').forEach(i=>i.addEventListener('change',syncLook));
document.querySelectorAll('#resSeg button').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('#resSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); state.res=+b.dataset.v; }));
document.querySelectorAll('#speedSeg button').forEach(b=>{ b.setAttribute('aria-pressed',String(+b.dataset.v===state.speed)); b.addEventListener('click',()=>{ document.querySelectorAll('#speedSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); state.speed=+b.dataset.v; }); });
syncLook();

/* ---------- loop ---------- */
function resize(){ const wide=innerWidth>760; viewShift[0]=wide?Math.min(.3,260/innerWidth*1.1):0; viewShift[1]=wide?.04:.34; if(inFP()){ viewShift[0]=wide?Math.min(.22,200/innerWidth):0; viewShift[1]=wide?0:.2; }
  const dpr=Math.min(devicePixelRatio||1,2); const w=Math.max(1,Math.round(innerWidth*dpr)),h=Math.max(1,Math.round(innerHeight*dpr)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; } }
let last=performance.now(),clock=0,curSpeed=state.speed;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now; clock+=dt;
  const k=1-Math.exp(-dt*6); for(let i=0;i<3;i++) cam.t[i]+=(goal.t[i]-cam.t[i])*k; cam.th+=(goal.th-cam.th)*k; cam.ph+=(goal.ph-cam.ph)*k; cam.r+=(goal.r-cam.r)*k;
  fpv.yaw+=(fpv.gy-fpv.yaw)*k; fpv.pitch+=(fpv.gp-fpv.pitch)*k;
  const target=state.view==='cast'?0:state.speed; curSpeed+=(target-curSpeed)*(1-Math.exp(-dt*1.5));
  updateOut(dt,curSpeed,state.view==='route'?cam.t[0]:0);
  for(const C of castChars) if(state.view==='cast'){ animateChar(C,clock); skinUpdate(C); }
  if(state.view==='wagons'){ for(const C of wagonChars) if(C.grp==='w:'+state.wagon){ animateChar(C,clock); skinUpdate(C); } for(const f of WG[state.wagon].anim) f(clock); }
  if(curScene.S.tunnel&&state.view!=='cast'){ const ph=(travel%15)/15, f=Math.pow(Math.max(0,Math.cos(ph*Math.PI*2)),6)*.55; const a=curScene.S.light.amb; const w=state.view==='wagons'?WG[state.wagon].ambK:1; L.amb=[(a[0]+f*1.0)*w,(a[1]+f*.6)*w,(a[2]+f*.22)*w]; }
  resize();
  let eye,tgt;
  if(inFP()){ const s=FP[state.wagon]; eye=[s[0],s[1],s[2]]; const cp=Math.cos(fpv.pitch); tgt=[eye[0]+Math.cos(fpv.yaw)*cp,eye[1]+Math.sin(fpv.pitch),eye[2]-Math.sin(fpv.yaw)*cp]; }
  else { eye=eyePos(); tgt=cam.t; }
  if(state.view==='wagons'){ const sd=WG[state.wagon].side, near=eye[2]>0?'1':'-1', far=near==='1'?'-1':'1'; sd[far].vis=true; sd[near].vis=inFP()||Math.abs(eye[2])<WZ; }
  if(state.ps1){ const h=state.res,w=Math.max(1,Math.round(h*cv.width/cv.height)); ensureFB(w,h); gl.bindTexture(gl.TEXTURE_2D,null); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); renderScene(world,eye,tgt,w,h,[w,h]);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,cv.width,cv.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null;
    gl.useProgram(POST.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
    gl.uniform1i(POST.loc.tScene,0); gl.uniform2f(POST.loc.uRes,w,h); gl.uniform1f(POST.loc.uDither,state.dither?1:0); gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null); }
  else { gl.bindFramebuffer(gl.FRAMEBUFFER,null); renderScene(world,eye,tgt,cv.width,cv.height,[cv.width,cv.height]); }
  requestAnimationFrame(frame); }
setScene(state.scene);
setView(location.hash.slice(1)||'route',true);
const ld=document.getElementById('loading'); if(ld) ld.hidden=true;
window.__train={state,setView,setSceneUI,setWagon,cam,goal,setGoal,fpv,SCENES,WG,castChars,wagonChars,renderCard};
requestAnimationFrame(frame);
})();
