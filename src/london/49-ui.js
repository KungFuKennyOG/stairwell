/* =====================================================================================================
   VIEW, CAST, FREEZE-FRAMES, LOOP. One view of the street. The cast stands where they'd be at 02:14, or in a
   line-up along the kerb. Pick someone and the frame freezes on them with their name card, Ritchie style.
   ===================================================================================================== */
const state={ps1:true,res:480,snap:true,affine:true,dither:true,rain:true,layout:'street',pose:'stand',pick:null,eye:false};
const cam={t:[0,1.4,0],th:.32,ph:1.32,r:11},goal={t:[0,1.4,0],th:.32,ph:1.32,r:11};
const HOME={t:[-1.2,1.6,0],th:.28,ph:1.36,r:11.5};
function setGoal(c,instant){ goal.t=c.t.slice(); goal.ph=c.ph; goal.r=c.r; let th=c.th; while(th-cam.th>Math.PI) th-=Math.PI*2; while(th-cam.th<-Math.PI) th+=Math.PI*2; goal.th=th; if(instant){ cam.t=goal.t.slice(); cam.th=goal.th; cam.ph=goal.ph; cam.r=goal.r; } }
function effR(){ const asp=cv.width/Math.max(1,cv.height); return cam.r*Math.max(1,(asp<.8?.82:1.1)/asp); }
function eyePos(){ const r=effR(); return [cam.t[0]+r*Math.sin(cam.ph)*Math.sin(cam.th),cam.t[1]+r*Math.cos(cam.ph),cam.t[2]+r*Math.sin(cam.ph)*Math.cos(cam.th)]; }
const clampGoal=()=>{ if(state.eye){ goal.ph=Math.min(2.7,Math.max(.45,goal.ph)); goal.r=.04; return; } goal.ph=Math.min(1.62,Math.max(.25,goal.ph)); goal.r=Math.min(22,Math.max(1.4,goal.r)); };
const ptrs=new Map(); let lastPinch=0,panMode=false;
cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); panMode=e.button===2||e.shiftKey; if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; lastPinch=Math.hypot(a.x-b.x,a.y-b.y); } unfreeze(); });
cv.addEventListener('pointermove',e=>{ const p=ptrs.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); if(lastPinch) goal.r*=lastPinch/d; lastPinch=d; pan(dx/2,dy/2); }
  else if(panMode&&!state.eye) pan(dx,dy); else { goal.th+=(state.eye?1:-1)*dx*.006; goal.ph+=(state.eye?1:-1)*dy*.005; } clampGoal(); });
const endPtr=e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2) lastPinch=0; };
cv.addEventListener('pointerup',endPtr); cv.addEventListener('pointercancel',endPtr); cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{ e.preventDefault(); if(state.eye){ walk(-e.deltaY*.004,0); return; } goal.r*=Math.exp(e.deltaY*.0012); clampGoal(); },{passive:false});
const keys={}; addEventListener('keydown',e=>{ keys[e.code]=true; }); addEventListener('keyup',e=>{ keys[e.code]=false; });
/* eye level: you stand on the pavement at 1.65 m, as in the headset. Drag to look, WASD or the wheel to walk. */
function walk(f,s){ const fx=-Math.sin(goal.th),fz=-Math.cos(goal.th); goal.t[0]+=fx*f+fz*s*-1; goal.t[2]+=fz*f+fx*s; goal.t[0]=Math.max(-15,Math.min(15,goal.t[0])); goal.t[2]=Math.max(FZ-2.3,Math.min(ROAD_Z1+3,goal.t[2])); goal.t[1]=(goal.t[2]>KERB_Z&&goal.t[2]<ROAD_Z1?0:PAVE_Y)+1.65; }
function setEye(on){ state.eye=on; unfreeze(); if(on){ const e=eyePos(); setGoal({t:[Math.max(-14,Math.min(14,e[0])),PAVE_Y+1.65,Math.min(KERB_Z-.4,Math.max(FZ+.6,1.8))],th:cam.th+Math.PI,ph:Math.PI/2,r:.04}); if(state.layout==='street') setGoal({t:[1.2,PAVE_Y+1.65,2],th:-1.15+Math.PI*0+1.15+.9,ph:1.6,r:.04}); } else setGoal(state.layout==='lineup'?{t:[0,1.05,1.4],th:0,ph:1.42,r:innerWidth>760?7.4:9.6}:HOME); renderCard(); }
cv.addEventListener('keydown',e=>{ const k={ArrowLeft:[.12,0],ArrowRight:[-.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[e.key];
  if(k){ e.preventDefault(); goal.th+=k[0]; goal.ph+=k[1]; clampGoal(); } if(e.key==='+'||e.key==='='){ goal.r*=.9; clampGoal(); } if(e.key==='-'){ goal.r*=1.1; clampGoal(); } if(e.key==='Escape') unfreeze(); });
function pan(dx,dy){ const s=goal.r*.0016; const rx=Math.cos(cam.th),rz=-Math.sin(cam.th); goal.t[0]-=rx*dx*s; goal.t[2]-=rz*dx*s; goal.t[1]+=dy*s; goal.t[1]=Math.max(.3,Math.min(8,goal.t[1])); goal.t[0]=Math.max(-14,Math.min(14,goal.t[0])); goal.t[2]=Math.max(-2.5,Math.min(12,goal.t[2])); }

/* ---------- the cast on the street ---------- */
/* where each of them is at 02:14: [x, z, heading, pose] */
const SPOTS={danny:[-.6,1.1,.15,'stand'],degsy:[-5.6,-.9,.55,'smoke'],kwame:[-4.4,-1.5,-.25,'stand'],ali:[-7.8,-2.2,.1,'lean'],
  maureen:[1.8,.5,-.9,'stand'],piotr:[4.6,1.4,-.5,'phone'],pcmale:[7.4,3.6,-1.1,'stand'],pcfem:[9,4.4,-1.3,'stand']};
const CAST={};
for(const id of ORDER){ const n=N(STREET,0,PAVE_Y,0); const C=makeChar(id,n,'cast'); C.node=n; CAST[id]=C;
  const P=C.poses, hy=C.o.thigh+C.o.shin+C.o.foot+.05;
  P.smoke={hipsY:hy,wpn:'fight',j:{armR:[-1.05,.15,.42],elbowR:[-2.25,0,0],armL:[.08,0,.14],elbowL:[-.25,0,0],spine:[.03,0,0],head:[-.05,.25,0],thighL:[-.06,0,.06],thighR:[.05,0,-.04],kneeL:[.08,0,0]}};
  if(id==='maureen') P.fight={hipsY:hy,wpn:'fight',j:{armR:[-.95,0,.12],elbowR:[-1.15,0,0],armL:[.05,0,.12],elbowL:[-.5,0,0],spine:[.08,0,0],head:[.1,0,0]}};
  if(id==='kwame') P.fight={hipsY:hy,wpn:'fight',j:{armR:[.08,0,-.1],elbowR:[-.35,0,0],armL:[.1,0,.1],elbowL:[-.3,0,0],head:[.06,-.3,0],thighL:[-.04,0,.04]}};
  if(id==='danny'||id==='degsy'||id==='piotr'||id==='ali') P.fight=Object.assign({},P.idle,{wpn:'fight'}); }
function place(){ const n=ORDER.length; ORDER.forEach((id,i)=>{ const C=CAST[id];
    if(state.layout==='lineup'){ C.node.p=[(i-(n-1)/2)*1.05,PAVE_Y,1.4]; C.node.r=[0,0,0]; }
    else { const s=SPOTS[id]; const onRoad=s[1]>KERB_Z; C.node.p=[s[0],onRoad?0:PAVE_Y,s[1]]; C.node.r=[0,s[2],0]; } });
  poseAll(); }
function poseOf(id){ const p=state.pose; if(p==='stand') return state.layout==='lineup'?'fight':SPOTS[id][3]==='stand'?'fight':SPOTS[id][3]; return p==='scared'?'cower':p; }
function poseAll(){ for(const id of ORDER){ const C=CAST[id]; const name=poseOf(id); applyPose(C,name);
  if(state.pose==='handsup'||state.pose==='scared'){ C.J.headMesh.mesh.mats[0]=C.faceM.shock; C.J.headMesh.mesh.runs=null; } skinUpdate(C); } }

/* ---------- freeze-frame ---------- */
const freezeEl=document.getElementById('freeze'), fName=document.getElementById('fName'), fTag=document.getElementById('fTag'), fRole=document.getElementById('fRole');
let frozen=false;
function freezeOn(id){ const C=CAST[id],R_=ROSTER[id]; const p=C.node.p, h=C.node.r[1];
  if(state.eye) state.eye=false; setGoal({t:[p[0],p[1]+1.5,p[2]],th:h+.28,ph:1.55,r:1.6});
  state.pick=id; fName.textContent=R_.name.replace(/ ".*" /,' ').toUpperCase(); fRole.textContent=R_.role; fTag.textContent=R_.card;
  freezeEl.hidden=false; freezeEl.classList.remove('slam'); void freezeEl.offsetWidth; freezeEl.classList.add('slam'); frozen=true; cv.classList.add('frozen'); document.body.classList.add('frozen'); renderCard(); }
function unfreeze(){ if(!frozen) return; frozen=false; freezeEl.hidden=true; cv.classList.remove('frozen'); document.body.classList.remove('frozen'); }

/* ---------- card ---------- */
const card=document.getElementById('card'), clockEl=document.getElementById('clock');
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; };
function segOf(opts,cur,onPick){ const s=el('div','seg'); for(const [v,label] of opts){ const b=el('button',null,label); b.type='button'; b.dataset.v=v; b.setAttribute('aria-pressed',String(v===cur)); b.addEventListener('click',()=>{ s.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); onPick(v); }); s.append(b); } return s; }
function renderCard(){ card.innerHTML='';
  card.append(el('p','sub','The cast · on the Stairwell rig'),el('h2',null,'Who\'s out at 2 a.m.'));
  card.append(el('p','body','Pick someone for their freeze-frame. Same skinned body, painted faces and gun holds as the tower cast, dressed for East London.'));
  const row=el('div','row'); card.append(row);
  const eb=el('button','btn'+(state.eye?'':' ghost'),state.eye?'Back to orbit':'Eye level (VR height)'); eb.type='button'; eb.setAttribute('aria-pressed',String(state.eye)); eb.addEventListener('click',()=>setEye(!state.eye)); row.append(eb);
  row.append(segOf([['street','On the street'],['lineup','Line-up']],state.layout,v=>{ state.layout=v; unfreeze(); place(); setGoal(v==='lineup'?{t:[0,1.05,1.4],th:0,ph:1.42,r:innerWidth>760?7.4:9.6}:HOME); }));
  card.append(el('p','seg-label','Show them'),segOf([['stand','As they are'],['handsup','Hands up'],['scared','Scared'],['hurt','Hurt']],state.pose,p=>{ state.pose=p; poseAll(); }));
  const ul=el('ul','list');
  for(const id of ORDER){ const R_=ROSTER[id],li=el('li'),b=el('button'); b.type='button'; b.setAttribute('aria-pressed',String(state.pick===id&&frozen));
    const lead=el('span','num'); lead.style.cssText=`width:10px;height:10px;background:${R_.color};align-self:center`;
    const txt=el('span'); txt.style.minWidth='0'; const sd=SIDES[R_.side]; txt.append(el('span','tag '+sd[0],sd[1]),el('b',null,R_.name),el('span','who',R_.role.split(' · ')[1]||''),el('small',null,R_.note));
    b.append(lead,txt,el('span','num','')); b.addEventListener('click',()=>{ freezeOn(id); }); li.append(b); ul.append(li); }
  card.append(ul);
  const w=el('p','word'); w.append(el('b',null,'The Old Bill. '),'One star brings PC Hughes on foot. Two brings PC Okafor in the car, and she runs. Lose them both and the street goes back to normal, but Ali\'s camera saw everything.'); card.append(w); }
function updateClock(){ clockEl.innerHTML=''; clockEl.append(el('b',null,'02:14'),'Bethnal Green Rd · E2'); }

const $=id=>document.getElementById(id);
function syncLook(){ state.ps1=$('ps1').checked; state.snap=$('snap').checked; state.affine=$('affine').checked; state.dither=$('dither').checked; state.rain=$('rain').checked; RAIN.vis=state.rain; $('ps1opts').classList.toggle('dim',!state.ps1); texFilter=state.ps1?gl.NEAREST:gl.LINEAR; }
document.querySelectorAll('.look input').forEach(i=>i.addEventListener('change',syncLook));
document.querySelectorAll('#resSeg button').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('#resSeg button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); state.res=+b.dataset.v; }));
document.getElementById('fClose').addEventListener('click',unfreeze);
syncLook();

/* ---------- loop ---------- */
function resize(){ const wide=innerWidth>760; viewShift[0]=wide?Math.min(.3,260/innerWidth*1.1):0; viewShift[1]=wide?.04:-.3;
  const dpr=Math.min(devicePixelRatio||1,2); const w=Math.max(1,Math.round(innerWidth*dpr)),h=Math.max(1,Math.round(innerHeight*dpr)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; } }
let lastT=performance.now(),clock=0,wclock=0;
function draw(){ const eye=eyePos(), tgt=cam.t;
  if(state.ps1){ const h=state.res,w=Math.max(1,Math.round(h*cv.width/cv.height)); ensureFB(w,h); gl.bindTexture(gl.TEXTURE_2D,null); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); renderScene(world,eye,tgt,w,h,[w,h]);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,cv.width,cv.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null;
    gl.useProgram(POST.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
    gl.uniform1i(POST.loc.tScene,0); gl.uniform2f(POST.loc.uRes,w,h); gl.uniform1f(POST.loc.uDither,state.dither?1:0); gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null); }
  else { gl.bindFramebuffer(gl.FRAMEBUFFER,null); renderScene(world,eye,tgt,cv.width,cv.height,[cv.width,cv.height]); } }
function step(dt){ clock+=dt; if(!frozen) wclock+=dt;
  const k=1-Math.exp(-dt*(frozen?9:6)); for(let i=0;i<3;i++) cam.t[i]+=(goal.t[i]-cam.t[i])*k; cam.th+=(goal.th-cam.th)*k; cam.ph+=(goal.ph-cam.ph)*k; cam.r+=(goal.r-cam.r)*k;
  if(!frozen) for(const id of ORDER){ const C=CAST[id]; animateChar(C,wclock); skinUpdate(C); }
  if(state.eye){ const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s_=(keys.KeyD?1:0)-(keys.KeyA?1:0); if(f||s_) walk(f*1.6*dt,s_*1.6*dt); }
  rainTick(wclock,eyePos()); const fl=Math.sin(wclock*31)>.97&&Math.sin(wclock*3.1)>.6; STREET_LIGHT.pl[1][1]=fl?[.5,.22,.15]:[1.35,.62,.42]; setLights(STREET_LIGHT);
  resize(); draw(); }
function frame(now){ const dt=Math.min(.05,(now-lastT)/1000); lastT=now; step(dt); requestAnimationFrame(frame); }
place(); renderCard(); updateClock(); setGoal(HOME,true); setLights(STREET_LIGHT);
const ld=document.getElementById('loading'); if(ld) ld.hidden=true;
window.__london={state,CAST,setGoal,freezeOn,unfreeze,place,poseAll,step,cam,goal};
if(!window.__CAPTURE) requestAnimationFrame(frame);
})();
