
/* =====================================================================================================
   VIEWS, CAMERA, LIGHT, LOOP. Two views: the houses (one cutaway at a time) and the cast, a line-up per house
   against a height chart so the proportions read: men, women, a 13-year-old, a 6-year-old.
   ===================================================================================================== */
const state={view:'houses',house:'pine',ps1:true,res:480,snap:true,affine:true,dither:true,roof:false,people:true,castHouse:'pine',castPose:'stand',focus:null};
const TIMES={pine:'01:40',maple:'02:10',crest:'23:55',sallis:'03:20',kane:'04:05'};
const SHORT={pine:'Pine Hollow',maple:'Maple Ct',crest:'Crestline',sallis:'Sallis',kane:'Kane'};
const cam={t:[0,1,0],th:.5,ph:.9,r:18},goal={t:[0,1,0],th:.5,ph:.9,r:18};
function setGoal(c,instant){ goal.t=c.t.slice(); goal.ph=c.ph; goal.r=c.r; let th=c.th; while(th-cam.th>Math.PI) th-=Math.PI*2; while(th-cam.th<-Math.PI) th+=Math.PI*2; goal.th=th; if(instant){ cam.t=goal.t.slice(); cam.th=goal.th; cam.ph=goal.ph; cam.r=goal.r; } }
function effR(){ const asp=cv.width/Math.max(1,cv.height); return cam.r*Math.max(1,(asp<.8?.82:1.1)/asp); }
function eyePos(){ const r=effR(); return [cam.t[0]+r*Math.sin(cam.ph)*Math.sin(cam.th),cam.t[1]+r*Math.cos(cam.ph),cam.t[2]+r*Math.sin(cam.ph)*Math.cos(cam.th)]; }
const LIM={houses:[1.6,40],cast:[1.2,16]};
const clampGoal=()=>{ goal.ph=Math.min(1.56,Math.max(.08,goal.ph)); const l=LIM[state.view]; goal.r=Math.min(l[1],Math.max(l[0],goal.r)); };
const ptrs=new Map(); let lastPinch=0,panMode=false;
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); panMode=e.button===2||e.shiftKey; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; lastPinch=Math.hypot(a.x-b.x,a.y-b.y); } });
cv.addEventListener('pointermove',e=>{ const p=ptrs.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(lastPinch) goal.r*=lastPinch/d; lastPinch=d; pan(dx/2,dy/2); }
  else if(panMode) pan(dx,dy); else { goal.th-=dx*.006; goal.ph-=dy*.005; } clampGoal(); });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) lastPinch=0; };
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr); cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{ e.preventDefault(); goal.r*=Math.exp(e.deltaY*.0012); clampGoal(); },{passive:false});
cv.addEventListener('keydown',e=>{ const k={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
  if(k){ e.preventDefault(); goal.th+=k[0]; goal.ph+=k[1]; clampGoal(); } if(e.key==='+'||e.key==='='){ goal.r*=.9; clampGoal(); } if(e.key==='-'){ goal.r*=1.1; clampGoal(); } });
function pan(dx,dy){ const s=goal.r*.0016; const rx=Math.cos(cam.th),rz=-Math.sin(cam.th); goal.t[0]-=rx*dx*s; goal.t[2]-=rz*dx*s; goal.t[1]+=dy*s; goal.t[1]=Math.max(-.5,Math.min(6,goal.t[1])); for(const i of [0,2]) goal.t[i]=Math.max(-25,Math.min(25,goal.t[i])); }

/* ---------- the cast stage: a height chart wall, one line-up per house ---------- */
const STAGE=N(world); STAGE.vis=false;
const tChart=P2(64,128,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a3c40'],[1,'#2a2c30']]); for(let cm=0;cm<=260;cm+=10){ const y=h-(cm/260)*h|0; const big=cm%50===0; R(g,big?'#d8d4c8':'#6a6c70',0,y,big?w:14,1); if(big&&cm>0&&cm<260) text(g,String(cm),18,y-7,'#d8d4c8'); } },3,991);
mk(plane(30,WH,30,2),M(tChart,{repeat:[25,1]}),STAGE,0,WH/2,-.65); floor({g:STAGE},-15,-.65,15,9,tFlConc,{tile:2});
const STAGE_LIGHT={amb:[.42,.4,.42],dir:[-.4,.6,.7],dirCol:[.7,.62,.56],fog:[.04,.042,.05],fogNear:40,fogFar:90,pl:[[[-3,2.4,2],[.8,.7,.6],6],[[3,2.4,2],[.8,.7,.6],6],[[0,1.6,4],[.4,.42,.5],8]]};
const LINEUPS={};
const SIDE_ORDER={target:0,crew:1,civ:2,kid:3};
function lineup(k){ if(LINEUPS[k]) return LINEUPS[k]; const ids=Object.keys(ROSTER).filter(id=>ROSTER[id].house===k).sort((a,b)=>SIDE_ORDER[ROSTER[a].side]-SIDE_ORDER[ROSTER[b].side]);
  const g=N(STAGE), X=ids.map((_,i)=>(i-(ids.length-1)/2)*1.05), chars=[];
  ids.forEach((id,i)=>{ const n=N(g,X[i],0,.35,0,0,0); const C=makeChar(id,n,'cast'); chars.push(C); });
  LINEUPS[k]={g,ids,X,chars}; poseLineup(LINEUPS[k]); return LINEUPS[k]; }
function poseLineup(Lu){ const p=state.castPose; Lu.chars.forEach((C,i)=>{ const R_=ROSTER[Lu.ids[i]], fighter=R_.side==='target'||R_.side==='crew';
  const name=p==='stand'?(fighter?'fight':'idle'):p==='handsup'?'handsup':p==='scared'?'cower':p; applyPose(C,name);
  if(p==='handsup'||p==='scared'){ C.J.headMesh.mesh.mats[0]=C.faceM.shock; C.J.headMesh.mesh.runs=null; } skinUpdate(C); }); }

/* ---------- light ---------- */
let curHouse=null;
function applyLight(){ if(state.view==='cast'){ setLights(STAGE_LIGHT); return; } const H=curHouse; setLights(Object.assign({},MOON,{pl:H.lights})); }
function flickerTick(t){ if(state.view!=='houses'||!curHouse) return; for(const f of curHouse.flick){ const base=curHouse.lights[f.i][1];
  const k=f.f==='tv'?.62+.38*Math.abs(Math.sin(t*7.3+Math.sin(t*2.1)*3))*(Math.sin(t*.9)>.85?.4:1):f.f==='fire'?.82+.12*Math.sin(t*9)+.06*Math.sin(t*23):.85+.15*Math.sin(t*1.6);
  for(let c=0;c<3;c++) L.plCol[f.i*3+c]=base[c]*k; } }

/* ---------- views ---------- */
function showHouse(k,instant){ for(const key in HS) HS[key].g.vis=false; state.house=k; curHouse=getHouse(k); curHouse.g.vis=state.view==='houses'; curHouse.roof.vis=state.roof;
  for(const C of curHouse.chars) C.node.vis=state.people; state.focus=null; if(state.view==='houses'){ setGoal(curHouse.cam,instant); applyLight(); if(card.isConnected){ renderCard(); updateClock(); } } }
function showLineup(k,instant){ state.castHouse=k; const Lu=lineup(k); for(const key in LINEUPS) LINEUPS[key].g.vis=key===k; const w=Lu.X.length*1.05, wide=innerWidth>760; if(state.view==='cast') setGoal({t:[wide?-.35:0,.95,.35],th:0,ph:1.4,r:wide?Math.max(5.2,w*1.3+1.2):w*1.15+1.4},instant); }
function setView(v,instant){ if(v!=='cast') v='houses'; state.view=v; HOUSES.vis=v==='houses'; STAGE.vis=v==='cast';
  if(v==='houses') showHouse(state.house,instant); else showLineup(state.castHouse,instant);
  document.querySelectorAll('.tabs a[data-view]').forEach(a=>{ if(a.dataset.view===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  applyLight(); renderCard(); updateClock(); }

/* ---------- card ---------- */
const card=document.getElementById('card'), clockEl=document.getElementById('clock');
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; };
function segOf(opts,cur,onPick){ const s=el('div','seg'); for(const [v,label] of opts){ const b=el('button',null,label); b.type='button'; b.dataset.v=v; b.setAttribute('aria-pressed',String(v===cur)); b.addEventListener('click',()=>{ s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(v); }); s.append(b); } return s; }
const TAGS_={target:['target','Target'],crew:['crew','Crew'],civ:['civ','Lives here'],kid:['kid','Kid · can\'t be hurt']};
function peopleList(items,onPick){ const ul=el('ul','list'); items.forEach(it=>{ const li=el('li'),b=el('button'); b.type='button'; b.setAttribute('aria-pressed','false');
    const lead=el('span','num'); lead.style.cssText=`width:10px;height:10px;background:${it.color};align-self:center`;
    const txt=el('span'); txt.style.minWidth='0'; const t=el('span','tag '+TAGS_[it.side][0],TAGS_[it.side][1]); txt.append(t,el('b',null,it.name)); txt.append(el('span','who',it.role)); txt.append(el('small',null,it.note));
    b.append(lead,txt,el('span','num',it.right||'')); b.addEventListener('click',()=>{ ul.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(it); }); li.append(b); ul.append(li); }); return ul; }
function renderCard(){ card.innerHTML='';
  if(state.view==='houses'){ const H=curHouse, i=HOUSES_ORDER.indexOf(H.key);
    card.append(el('p','sub',`House ${H.num} of 5 · ${H.kind}`),el('h2',null,H.name),el('p','body',H.note));
    const w=el('p','word'); w.append(el('b',null,'How it plays. '),H.plays); card.append(w);
    const row=el('div','row'); const prev=el('button','btn ghost','‹ '+(i>0?SHORT[HOUSES_ORDER[i-1]]:'')), next=el('button','btn ghost',(i<4?SHORT[HOUSES_ORDER[i+1]]:'')+' ›'), all=el('button','btn','Whole house');
    for(const b of [all,prev,next]) b.type='button'; prev.disabled=i===0; next.disabled=i===4; for(const b of [prev,next]) if(b.disabled) b.style.opacity=.35;
    prev.addEventListener('click',()=>{ if(i>0) showHouse(HOUSES_ORDER[i-1]); }); next.addEventListener('click',()=>{ if(i<4) showHouse(HOUSES_ORDER[i+1]); });
    all.addEventListener('click',()=>{ setGoal(H.cam); renderCard(); }); row.append(all,prev,next); card.append(row);
    card.append(el('p','seg-label','Rooms'),segOf(H.rooms.map((r,k)=>[k,r.name.split(' · ')[0]]),null,k=>setGoal(H.rooms[k].cam)));
    const seen=new Set(), list=[]; for(const p of H.people){ if(seen.has(p.id)) continue; seen.add(p.id); const R_=ROSTER[p.id], n=H.people.filter(q=>q.id===p.id).length; list.push(Object.assign({id:p.id,p,right:n>1?'×'+n:''},R_)); }
    list.sort((a,b)=>SIDE_ORDER[a.side]-SIDE_ORDER[b.side]);
    card.append(el('p','seg-label','Home tonight'),peopleList(list,it=>{ const p=it.p; setGoal({t:[p.x,p.y+.9,p.z],th:cam.th,ph:.62,r:4.2}); }));
  } else {
    card.append(el('p','sub','The cast · on the Stairwell rig'),el('h2',null,'Who\'s home'));
    card.append(el('p','body','Same skinned body, painted faces and gun holds as the tower cast. New here: women\'s and kids\' body shapes, long hair, skirts, and faces that paint only when a pose needs them.'));
    card.append(el('p','seg-label','House'),segOf(HOUSES_ORDER.map(k=>[k,SHORT[k]]),state.castHouse,k=>{ showLineup(k); renderCard(); }));
    card.append(el('p','seg-label','Show them'),segOf([['stand','Standing'],['handsup','Hands up'],['scared','Scared'],['beg','Begging'],['hurt','Hurt']],state.castPose,p=>{ state.castPose=p; for(const k in LINEUPS) poseLineup(LINEUPS[k]); }));
    const Lu=lineup(state.castHouse);
    card.append(peopleList(Lu.ids.map((id,i)=>Object.assign({id,i},ROSTER[id])),it=>setGoal({t:[Lu.X[it.i],1.1,.35],th:0,ph:1.42,r:2.6})));
    const w=el('p','word'); w.append(el('b',null,'Kids. '),'They\'re in the houses and they can\'t be hurt: bullets and blades pass through them, they can\'t be grabbed, they never ragdoll. They hide, run to a parent, and remember what they saw. Hurt and Begging show them scared instead.'); card.append(w);
    const w2=el('p','word'); w2.append(el('b',null,'The word. '),'What you do in a house gets out, and the next house has heard it. Spare people and the next family freezes or hides instead of calling 911, and crew members give up or point you to the target. Kill civilians, or a parent in front of a kid, and the next house calls the police sooner, crews fight to the end, and Ray stops being the cop they set up and becomes the cop killer.'); card.append(w2);
  } }
function updateClock(){ clockEl.innerHTML=''; if(state.view==='cast'){ clockEl.append(el('b',null,'Line-up'),SHORT[state.castHouse]); return; } const H=curHouse; clockEl.append(el('b',null,TIMES[H.key]),`House ${H.num} · ${H.who}`); }

window.addEventListener('hashchange',()=>setView(location.hash.slice(1)));
document.querySelectorAll('.tabs a[data-view]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const v=a.dataset.view; try{ history.replaceState(null,'','#'+v); }catch(_){} setView(v); }));
const $=id=>document.getElementById(id);
function syncLook(){ state.ps1=$('ps1').checked; state.snap=$('snap').checked; state.affine=$('affine').checked; state.dither=$('dither').checked; $('ps1opts').classList.toggle('dim',!state.ps1); texFilter=state.ps1?gl.NEAREST:gl.LINEAR;
  state.roof=$('roof').checked; state.people=$('people').checked; if(curHouse){ curHouse.roof.vis=state.roof; for(const C of curHouse.chars) C.node.vis=state.people; } }
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
  if(state.view==='houses'&&curHouse&&state.people) for(const C of curHouse.chars){ animateChar(C,clock); skinUpdate(C); }
  if(state.view==='cast'){ const Lu=LINEUPS[state.castHouse]; if(Lu) for(const C of Lu.chars){ animateChar(C,clock); skinUpdate(C); } }
  flickerTick(clock);
  resize();
  const eye=eyePos(), tgt=cam.t;
  if(state.ps1){ const h=state.res,w=Math.max(1,Math.round(h*cv.width/cv.height)); ensureFB(w,h); gl.bindTexture(gl.TEXTURE_2D,null); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); renderScene(world,eye,tgt,w,h,[w,h]);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,cv.width,cv.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null;
    gl.useProgram(POST.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
    gl.uniform1i(POST.loc.tScene,0); gl.uniform2f(POST.loc.uRes,w,h); gl.uniform1f(POST.loc.uDither,state.dither?1:0); gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null); }
  else { gl.bindFramebuffer(gl.FRAMEBUFFER,null); renderScene(world,eye,tgt,cv.width,cv.height,[cv.width,cv.height]); }
  requestAnimationFrame(frame); }
const hv=location.hash.slice(1);
setView(hv==='cast'?'cast':'houses',true);
const ld=document.getElementById('loading'); if(ld) ld.hidden=true;
window.__houses={state,setView,showHouse,showLineup,setGoal,cam,goal,HS,LINEUPS,getHouse,ROSTER,renderCard,poseLineup};
requestAnimationFrame(frame);
})();
