
/* =====================================================================================================
   VIEWS, CAMERA, MODES, LOOP. Four views (the team, the cartel, the stash house, the tunnel), each seen four ways
   (lights on, lights cut, night vision, thermal).
   ===================================================================================================== */
const state={view:'team',ps1:true,res:480,snap:true,affine:true,dither:true,roof:false,people:true,pose:'stand',mode:'lit'};
const MODES=[['lit','Lights on'],['cut','Lights cut'],['nv','Night vision'],['thermal','Thermal']];
const isDay=()=>!isCast()&&curPlace&&curPlace.day;
const modesNow=()=>isDay()?[['lit','Daylight'],['thermal','Thermal']]:MODES;
const cam={t:[0,1,0],th:.5,ph:.9,r:18},goal={t:[0,1,0],th:.5,ph:.9,r:18};
function setGoal(c,instant){ goal.t=c.t.slice(); goal.ph=c.ph; goal.r=c.r; let th=c.th; while(th-cam.th>Math.PI) th-=Math.PI*2; while(th-cam.th<-Math.PI) th+=Math.PI*2; goal.th=th; if(instant){ cam.t=goal.t.slice(); cam.th=goal.th; cam.ph=goal.ph; cam.r=goal.r; } }
function effR(){ const asp=cv.width/Math.max(1,cv.height); return cam.r*Math.max(1,(asp<.8?.82:1.1)/asp); }
function eyePos(){ const r=effR(); return [cam.t[0]+r*Math.sin(cam.ph)*Math.sin(cam.th),cam.t[1]+r*Math.cos(cam.ph),cam.t[2]+r*Math.sin(cam.ph)*Math.cos(cam.th)]; }
const isCast=()=>state.view==='team'||state.view==='cartel';
const clampGoal=()=>{ goal.ph=Math.min(1.56,Math.max(.08,goal.ph)); const l=isCast()?[1.2,16]:[1.6,40]; goal.r=Math.min(l[1],Math.max(l[0],goal.r)); };
const ptrs=new Map(); let lastPinch=0,panMode=false;
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); panMode=e.button===2||e.shiftKey; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; lastPinch=Math.hypot(a.x-b.x,a.y-b.y); } });
cv.addEventListener('pointermove',e=>{ const p=ptrs.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(lastPinch) goal.r*=lastPinch/d; lastPinch=d; pan(dx/2,dy/2); }
  else if(panMode) pan(dx,dy); else { goal.th-=dx*.006; goal.ph-=dy*.005; } clampGoal(); });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) lastPinch=0; };
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr); cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{ e.preventDefault(); goal.r*=Math.exp(e.deltaY*.0012); clampGoal(); },{passive:false});
cv.addEventListener('keydown',e=>{ const k={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
  if(k){ e.preventDefault(); goal.th+=k[0]; goal.ph+=k[1]; clampGoal(); } if(e.key==='+'||e.key==='='){ goal.r*=.9; clampGoal(); } if(e.key==='-'){ goal.r*=1.1; clampGoal(); }
  const mk_={'1':'lit','2':'cut','3':'nv','4':'thermal'}[e.key]; if(mk_) setMode(mk_); });
function pan(dx,dy){ const s=goal.r*.0016; const rx=Math.cos(cam.th),rz=-Math.sin(cam.th); goal.t[0]-=rx*dx*s; goal.t[2]-=rz*dx*s; goal.t[1]+=dy*s; goal.t[1]=Math.max(-.5,Math.min(6,goal.t[1])); for(const i of [0,2]) goal.t[i]=Math.max(-25,Math.min(30,goal.t[i])); }

/* ---------- the line-up stage ---------- */
const STAGE=N(world); STAGE.vis=false;
const tChart=P2(64,128,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a3836'],[1,'#2a2826']]); for(let cm=0;cm<=260;cm+=10){ const y=h-(cm/260)*h|0; const big=cm%50===0; R(g,big?'#d8d0c0':'#6a6662',0,y,big?w:14,1); if(big&&cm>0&&cm<260) text(g,String(cm),18,y-7,'#d8d0c0'); } },3,1601);
mk(plane(30,WH,30,2),M(tChart,{repeat:[25,1]}),STAGE,0,WH/2,-.65); floor({g:STAGE},-15,-.65,15,9,tFlConc,{tile:2});
const LINEUPS={};
function lineup(k){ if(LINEUPS[k]) return LINEUPS[k]; const ids=k==='team'?SQUAD:CARTEL; const g=N(STAGE), X=ids.map((_,i)=>(i-(ids.length-1)/2)*1.05), chars=[];
  ids.forEach((id,i)=>{ const n=N(g,X[i],0,.35,0,0,0); const C=makeChar(id,n,'cast'); tagHeat(C); chars.push(C); }); LINEUPS[k]={g,ids,X,chars}; poseLineup(LINEUPS[k]); return LINEUPS[k]; }
function poseLineup(Lu){ const p=state.pose; Lu.chars.forEach((C,i)=>{ const name=p==='stand'?'fight':p==='handsup'?'handsup':p; applyPose(C,name);
  if(p==='handsup'){ C.J.headMesh.mesh.mats[0]=C.faceM.shock; C.J.headMesh.mesh.runs=null; } remode(C,state.mode); skinUpdate(C); }); }

/* ---------- light ---------- */
const NIGHT={amb:[.11,.11,.14],dir:[-.35,1,.45],dirCol:[.2,.2,.28],fog:[.02,.018,.016],fogNear:40,fogFar:100};
const UNDER={amb:[.07,.06,.05],dir:[0,1,0],dirCol:[0,0,0],fog:[.012,.009,.006],fogNear:14,fogFar:60};
const DAY={amb:[.46,.42,.38],dir:[-.3,.42,-.85],dirCol:[1.2,.95,.68],fog:[.8,.66,.5],fogNear:50,fogFar:190};
const STAGE_LIGHT={amb:[.42,.4,.4],dir:[-.4,.6,.7],dirCol:[.7,.62,.56],fog:[.04,.04,.04],fogNear:40,fogFar:90,pl:[[[-3,2.4,2],[.8,.7,.6],6],[[3,2.4,2],[.8,.7,.6],6],[[0,1.6,4],[.4,.42,.5],8]]};
let curPlace=null;
function root(){ return isCast()?LINEUPS[state.view].g:curPlace.g; }
function applyLight(){ const m=state.mode;
  if(isCast()){ if(m==='lit') setLights(STAGE_LIGHT); else setLights({amb:[.025,.025,.03],dir:[0,1,0],dirCol:[0,0,0],fog:[.004,.004,.005],fogNear:40,fogFar:90,pl:[]}); }
  else if(curPlace.day) setLights(Object.assign({},DAY,{pl:[]}));
  else { const base=curPlace.under?UNDER:NIGHT; if(m==='lit') setLights(Object.assign({},base,{pl:curPlace.lights}));
    else setLights(Object.assign({},base,{amb:base.amb.map(v=>v*(m==='nv'?.6:.3)),dirCol:base.dirCol.map(v=>v*.5),fog:[.003,.003,.003],pl:[]})); }
  if(m==='thermal') L.fog=[.0,.0,.02]; }
function flickerTick(t){ if(isCast()||!curPlace||state.mode!=='lit') return; for(const f of curPlace.flick){ const base=curPlace.lights[f.i][1];
  const k=f.f==='tv'?.62+.38*Math.abs(Math.sin(t*7.3+Math.sin(t*2.1)*3))*(Math.sin(t*.9)>.85?.4:1):.85+.15*Math.sin(t*1.6); for(let c=0;c<3;c++) L.plCol[f.i*3+c]=base[c]*k; } }
/* the goggles carry an IR torch: a light at your eye that only the night vision sees */
function irTick(eye){ if(state.mode!=='nv') return; L.plPos.set(eye,7*3); const c=isCast()?.9:1.6; L.plCol.set([c,c,c],7*3); L.plDist[7]=isCast()?13:38; }

/* ---------- views and modes ---------- */
function setMode(m){ if(isDay()&&(m==='cut'||m==='nv')) m='lit'; state.mode=m; for(const k in LINEUPS) applyMode(LINEUPS[k].g,m); for(const k in PS) applyMode(PS[k].g,m); applyLight(); renderCard(); updateClock(); }
function showPlace(k,instant){ for(const key in PS) PS[key].g.vis=false; curPlace=getPlace(k); applyMode(curPlace.g,state.mode); curPlace.g.vis=true; curPlace.roof.vis=state.roof; for(const C of curPlace.chars) C.node.vis=state.people; setGoal(curPlace.cam,instant); }
function showLineup(k,instant){ const Lu=lineup(k); applyMode(Lu.g,state.mode); for(const key in LINEUPS) LINEUPS[key].g.vis=key===k; const w=Lu.X.length*1.05, wide=innerWidth>760; setGoal({t:[wide?-.35:0,.95,.35],th:0,ph:1.4,r:wide?Math.max(5.2,w*1.3+1.2):w*1.15+1.4},instant); }
function setView(v,instant){ if(!['team','cartel','stash','tunnel','bridge'].includes(v)) v='team'; state.view=v; STAGE.vis=isCast(); HOUSES.vis=!isCast();
  if(isCast()) showLineup(v,instant); else showPlace(v,instant);
  if(isDay()&&(state.mode==='cut'||state.mode==='nv')){ state.mode='lit'; applyMode(curPlace.g,'lit'); }
  document.querySelectorAll('.tabs a[data-view]').forEach(a=>{ if(a.dataset.view===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  applyLight(); renderCard(); updateClock(); }

/* ---------- card ---------- */
const card=document.getElementById('card'), clockEl=document.getElementById('clock');
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; };
function segOf(opts,cur,onPick){ const s=el('div','seg'); for(const [v,label] of opts){ const b=el('button',null,label); b.type='button'; b.dataset.v=v; b.setAttribute('aria-pressed',String(v===cur)); b.addEventListener('click',()=>{ s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(v); }); s.append(b); } return s; }
function peopleList(items,onPick){ const ul=el('ul','list'); items.forEach(it=>{ const li=el('li'),b=el('button'); b.type='button'; b.setAttribute('aria-pressed','false');
    const lead=el('span','num'); lead.style.cssText=`width:10px;height:10px;background:${it.color};align-self:center`;
    const txt=el('span'); txt.style.minWidth='0'; const tg=it.side==='team'?['team','Team']:it.side==='cop'?['cop','Convoy']:it.side==='hit'?['hit','Hit team']:it.side==='civ'?['civ','Civilian']:it.side==='kid'?['kid','Kid']:['cartel',it.was?'Was: '+it.was:'Cartel']; txt.append(el('span','tag '+tg[0],tg[1]),el('b',null,it.name),el('span','who',it.role));
    const sm=el('small',null,it.note); if(it.fate){ const f=el('span','fate'); f.style.display='block'; f.textContent=it.fate; sm.append(f); } txt.append(sm);
    b.append(lead,txt,el('span','num',it.right||'')); b.addEventListener('click',()=>{ ul.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(it); }); li.append(b); ul.append(li); }); return ul; }
const MODE_NOTE={lit:'As lit. This is what the crew sees.',cut:'Every lamp, bulb and screen off. Your own eyes after you kill the power.',nv:'Night vision: the dark amplified, green grain, an infrared torch only you can see. Muzzle flashes and lights flare it.',thermal:'Thermal: people glow, faces hottest, guns and walls cold. Works in pitch black and through smoke; can\'t read a face.',day:'Five in the afternoon, sun low in the west, dust in the air. The one daylight level: no goggles needed, but thermal still picks out who is sitting in which car.',dayTh:'Thermal in daylight: idling engines and exhausts glow, so does everyone in the cars. Two cars in the jam have cold engines: nobody waiting in traffic switches theirs off, unless they don\'t plan to drive.'};
function modeBlock(){ const w=el('div'); const note=isDay()?(state.mode==='thermal'?MODE_NOTE.dayTh:MODE_NOTE.day):MODE_NOTE[state.mode]; w.append(el('p','seg-label','See it with'),segOf(modesNow(),state.mode,setMode),el('p','word',note)); return w; }
function renderCard(){ card.innerHTML='';
  if(state.view==='team'){ card.append(el('p','sub','Prologue · the tower raid'),el('h2',null,'The team'));
    card.append(el('p','body','A joint task force goes into a cartel tower on a tip. You meet them in the truck on the way in. The tip was a setup: the team dies floor by floor, Ray goes down on the stairs, and the screen drains to black. Then he wakes up among them, left for dead.'));
    card.append(modeBlock(),el('p','seg-label','Show them'),segOf([['stand','Ready'],['handsup','Hands up'],['hurt','Hit'],['beg','Down']],state.pose,p=>{ state.pose=p; for(const k in LINEUPS) poseLineup(LINEUPS[k]); }));
    const Lu=lineup('team'); card.append(peopleList(Lu.ids.map((id,i)=>Object.assign({id,i},ROSTER[id])),it=>setGoal({t:[Lu.X[it.i],1.1,.35],th:0,ph:1.42,r:2.6}))); }
  else if(state.view==='cartel'){ card.append(el('p','sub','The cartel · the tower types, restyled'),el('h2',null,'The cartel'));
    card.append(el('p','body','Same six enemy types as the tower prototype, same bodies and fighting, new clothes for Puerto Seco. They talk, beg and call each other\'s names in Spanish, with subtitles.'));
    card.append(modeBlock(),el('p','seg-label','Show them'),segOf([['stand','Ready'],['handsup','Hands up'],['hurt','Hit'],['beg','Begging']],state.pose,p=>{ state.pose=p; for(const k in LINEUPS) poseLineup(LINEUPS[k]); }));
    const Lu=lineup('cartel'); card.append(peopleList(Lu.ids.map((id,i)=>Object.assign({id,i},ROSTER[id])),it=>setGoal({t:[Lu.X[it.i],1.1,.35],th:0,ph:1.42,r:2.6}))); }
  else { const H=curPlace; card.append(el('p','sub',H.where),el('h2',null,H.name),el('p','body',H.note)); const w=el('p','word'); w.append(el('b',null,'How it plays. '),H.plays); card.append(w,modeBlock());
    const all=el('button','btn','Whole view'); all.type='button'; all.addEventListener('click',()=>setGoal(H.cam)); const row=el('div','row'); row.append(all); card.append(row);
    if(H.rooms.length) card.append(el('p','seg-label','Rooms'),segOf(H.rooms.map((r,k)=>[k,r.name.split(' · ')[0]]),null,k=>setGoal(H.rooms[k].cam)));
    const seen=new Set(), list=[]; for(const p of H.people){ if(seen.has(p.id)) continue; seen.add(p.id); list.push(Object.assign({id:p.id,p},ROSTER[p.id])); }
    card.append(el('p','seg-label',H.peopleLabel||'Here tonight'),peopleList(list,it=>{ const p=it.p; setGoal({t:[p.x,p.y+.9,p.z],th:cam.th,ph:.62,r:4.2}); })); } }
function updateClock(){ clockEl.innerHTML=''; const m=modesNow().find(x=>x[0]===state.mode)[1]; const where={team:'The truck, 21:40',cartel:'Line-up',stash:'Tierra Blanca, 02:40',tunnel:'Under the line, 02:55',bridge:'Puente Seco, 16:55'}[state.view]; clockEl.append(el('b',null,m),where); }

window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
document.querySelectorAll('.tabs a[data-view]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const v=a.dataset.view; try{ history.replaceState(null,'','#'+v); }catch(_){} setView(v); }));
const $=id=>document.getElementById(id);
function syncLook(){ state.ps1=$('ps1').checked; state.snap=$('snap').checked; state.affine=$('affine').checked; state.dither=$('dither').checked; $('ps1opts').classList.toggle('dim',!state.ps1); texFilter=state.ps1?gl.NEAREST:gl.LINEAR;
  state.roof=$('roof').checked; state.people=$('people').checked; if(curPlace){ curPlace.roof.vis=state.roof; for(const C of curPlace.chars) C.node.vis=state.people; } }
document.querySelectorAll('.look input').forEach(i=>i.addEventListener('change',syncLook));
document.querySelectorAll('#resSeg button').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('#resSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); state.res=+b.dataset.v; }));
syncLook();

/* ---------- loop ---------- */
function resize(){ const wide=innerWidth>760; viewShift[0]=wide?Math.min(.3,260/innerWidth*1.1):0; viewShift[1]=wide?.04:-.36;
  const dpr=Math.min(devicePixelRatio||1,2); const w=Math.max(1,Math.round(innerWidth*dpr)),h=Math.max(1,Math.round(innerHeight*dpr)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; } }
let last=performance.now(),clock=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now; clock+=dt;
  const k=1-Math.exp(-dt*6); for(let i=0;i<3;i++) cam.t[i]+=(goal.t[i]-cam.t[i])*k; cam.th+=(goal.th-cam.th)*k; cam.ph+=(goal.ph-cam.ph)*k; cam.r+=(goal.r-cam.r)*k;
  const live=isCast()?(LINEUPS[state.view]||{chars:[]}).chars:(curPlace&&state.people?curPlace.chars:[]); for(const C of live){ animateChar(C,clock); skinUpdate(C); }
  flickerTick(clock); resize();
  const eye=eyePos(), tgt=cam.t; irTick(eye);
  const h=state.ps1?state.res:Math.min(720,cv.height), w=Math.max(1,Math.round(h*cv.width/cv.height));
  ensureFB(w,h); gl.bindTexture(gl.TEXTURE_2D,null); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); renderScene(world,eye,tgt,w,h,[w,h]);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,cv.width,cv.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null;
  const P=state.mode==='nv'?NVP:state.mode==='thermal'?THP:POST;
  gl.useProgram(P.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
  gl.uniform1i(P.loc.tScene,0); gl.uniform2f(P.loc.uRes,w,h); gl.uniform1f(P.loc.uDither,state.ps1&&state.dither?1:0);
  if(P.loc.uTime) gl.uniform1f(P.loc.uTime,clock); if(P.loc.uGain) gl.uniform1f(P.loc.uGain,isCast()?9:11);
  gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null);
  requestAnimationFrame(frame); }
const hv=location.hash.slice(1);
setView(['team','cartel','stash','tunnel','bridge'].includes(hv)?hv:'team',true);
const ld=document.getElementById('loading'); if(ld) ld.hidden=true;
window.__ps={state,setView,setMode,showPlace,setGoal,cam,goal,PS,LINEUPS,getPlace,ROSTER,renderCard,poseLineup};
requestAnimationFrame(frame);
})();
