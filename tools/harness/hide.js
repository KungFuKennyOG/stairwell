// Hiding, crouching and hung sheets (src/86-hide.js), headless. Steps the game's own update() with rendering off.
// usage: node tools/harness/hide.js index.html
// Boots the old floor 01 with ?proto=1&pf=0&hidetest=1 (a test bed, a curtained wardrobe, a sheet and plastic in two doorways),
// clears the cast so nothing moves but Ray, then scripts Ray's head and hands (HIDE.fake stands in for the headset) through
// the spots and the sheets and checks what the system says. Last, the old game (no flag) is booted and checked untouched.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'];

const TEST = String.raw`(()=>{
window.__noRaf=true; window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
const R=[]; let fails=0; const ok=(name,cond,info)=>{ R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?'  '+JSON.stringify(info):'')); if(!cond) fails++; };
const step=(dt=1/60)=>{ update(dt,performance.now()); updateWorld(world,null); const due=__Q.filter(q=>q[0]<=GAME.t); __Q=__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } };
const run=(s,dt=1/60)=>{ for(let t=0;t<s;t+=dt) step(dt); };
const r2=v=>Math.round(v*100)/100;
clearEnemies(); for(const k in KEYS) KEYS[k]=false;
const bed=HIDES.find(s=>s.id==='test-bed'), war=HIDES.find(s=>s.id==='test-wardrobe');
ok('hidetest: bed + wardrobe spots, 3 sheets', !!bed&&!!war&&SHEETS.length===3, {spots:HIDES.map(s=>s.id),sheets:SHEETS.map(s=>s.kind)});
const door=SHEETS.find(s=>s.kind==='sheet'), plas=SHEETS.find(s=>s.kind==='plastic');
const place=(x,z,yaw)=>{ PL.x=x; PL.z=z; PL.yaw=yaw; PL.pitch=0; HIDE.lx=null; };
const walkUntil=(yaw,stop,maxT)=>{ PL.yaw=yaw; KEYS.KeyW=true; let t=0; for(;t<maxT;t+=1/60){ step(); if(stop()) break; } KEYS.KeyW=false; return t; };

/* ---- 1. keyboard: a bed is solid standing, open crouched ---- */
place(-8.85,-3.3,Math.PI); walkUntil(Math.PI,()=>false,1.5);
ok('standing: the bed stops him at its edge', PL.z<-2.9, {z:r2(PL.z)});
place(-8.85,-3.3,Math.PI); hideCrouchToggle(); run(.4);
ok('C crouches: eye at ~0.95', PL.crouch&&Math.abs(camBasis().eye[1]-.95)<.03, {eye:r2(camBasis().eye[1])});
const tw=walkUntil(Math.PI,()=>PL.z>-2.2,4); run(.6);
ok('crouched: crawls under the bed', PL.z>-2.25&&PL.crawl, {z:r2(PL.z),t:r2(tw),crawl:PL.crawl});
ok('crawling: view dips under the frame', camBasis().eye[1]<.3, {eye:r2(camBasis().eye[1])});
ok('under the bed: PL.hide = bed, nothing showing', PL.hide===bed&&PL.hideExp<.05, {hide:PL.hide&&PL.hide.id,exp:r2(PL.hideExp)});
hideCrouchToggle(); ok('no standing up under the bed', PL.crouchT===true);
walkUntil(0,()=>PL.z<-3.05,5); run(.5);
ok('crawled out: crouched again, not hidden', !PL.crawl&&PL.hide===null&&Math.abs(camBasis().eye[1]-.95)<.03, {eye:r2(camBasis().eye[1])});
hideCrouchToggle(); run(.5); ok('C again stands him up', !PL.crouch&&Math.abs(camBasis().eye[1]-1.62)<.01);
/* crouched speed is cut on the keyboard */
place(-8.0,-3.6,-Math.PI/2); let x0=PL.x; walkUntil(-Math.PI/2,()=>false,.5); const vStand=(PL.x-x0)/.5;
place(-8.0,-3.6,-Math.PI/2); hideCrouchToggle(); run(.3); x0=PL.x; walkUntil(-Math.PI/2,()=>false,.5); const vCrouch=(PL.x-x0)/.5; hideCrouchToggle(); run(.3);
ok('crouch-walk at half speed', vCrouch<vStand*.6&&vCrouch>vStand*.4, {stand:r2(vStand),crouch:r2(vCrouch)});

/* ---- 2. VR (scripted headset): real crouch, crawl dip, head and hands sticking out ---- */
const fake=(h,hands)=>{ HIDE.fake={head:h,hands:hands||null,vr:true,f:[0,0,1],u:[0,1,0]}; PL.x=h[0]; PL.z=h[2]; };
fake([-8.85,1.65,-3.3]); run(.3); ok('VR standing: not crouched', !PL.crouch);
fake([-8.85,1.0,-3.3]); run(.2); ok('VR real head at 1.0 m: crouched', PL.crouch);
fake([-8.85,1.22,-3.3]); run(.1); ok('VR 1.22 m: still crouched (stands above 1.28)', PL.crouch);
fake([-8.85,1.0,-3.3]); run(.1);
fake([-8.85,1.0,-2.15],[[-9.05,.9,-1.95],[-8.65,.9,-1.95]]); collidePlayer(); HIDE.fake.head[0]=PL.x; HIDE.fake.head[2]=PL.z; run(.6);
ok('VR crouched: the bed lets his head under', Math.abs(PL.z+2.15)<.02, {z:r2(PL.z)});
ok('VR crawl dip held at real-0.78', Math.abs(PL.dropY-.78)<.03&&rayHeadY()<.3, {drop:r2(PL.dropY),head:r2(rayHeadY())});
ok('VR under the bed: hidden, nothing showing', PL.hide===bed&&PL.hideExp<.05, {exp:r2(PL.hideExp)});
HIDE.fake.hands[1]=[-8.65,.9,-2.95]; run(.05); const e1=PL.hideExp;
HIDE.fake.hands[0]=[-9.05,.9,-2.95]; run(.05); const e2=PL.hideExp;
ok('a hand out shows him (~0.55), both more (~0.8)', e1>.45&&e1<.65&&e2>.7&&e2<.9, {one:r2(e1),both:r2(e2)});
HIDE.fake.hands=[[-9.05,.9,-1.95],[-8.65,.9,-1.95]]; HIDE.fake.head[2]=-2.6-.075; run(.05); const e3=PL.hideExp;
HIDE.fake.head[2]=-2.6-.3; run(.05);
ok('head half out: half showing; head out: not hidden', e3>.4&&e3<.6&&PL.hide===null, {half:r2(e3),hide:PL.hide&&PL.hide.id});
HIDE.fake.head=[-8.85,1.0,-2.15]; PL.z=-2.15; run(.1);
HIDE.fake.head[1]=1.65; run(.05); collidePlayer();
ok('VR standing up under the bed: pushed out', PL.z<-2.9||PL.z>-1.4, {z:r2(PL.z)});
HIDE.fake={head:[-8.85,1.65,-3.4],hands:null,vr:true,f:[0,0,1],u:[0,1,0]}; PL.x=-8.85; PL.z=-3.4; hideCrouchToggle(); run(.4);
ok('VR toggle: fixed drop 0.7 for a standing head', PL.crouch&&Math.abs(PL.dropY-.7)<.02, {drop:r2(PL.dropY)});
HIDE.fake.head[1]=1.5; run(.2); ok('VR toggle: real head still moves the view (drop unchanged)', Math.abs(PL.dropY-.7)<.02&&Math.abs(rayHeadY()-.8)<.02, {drop:r2(PL.dropY),head:r2(rayHeadY())});
hideCrouchToggle(); run(.4); HIDE.fake.head[1]=1.2; hideCrouchToggle(); run(.4);
ok('VR toggle seated (1.2 m): smaller drop 0.3', Math.abs(PL.dropY-.3)<.02, {drop:r2(PL.dropY)}); hideCrouchToggle(); run(.4);

/* ---- 3. hand over the mouth ---- */
fake([-8.0,1.6,-3.5],[[-8.0,1.52,-3.42],null]); run(.05);
ok('hand at the mouth: covered, voice x0.5', PL.mouthCovered&&rayVoiceScale()===.5);
HIDE.fake.hands[0]=[-8.0,1.40,-3.3]; run(.05); ok('hand 25 cm off: not covered', !PL.mouthCovered&&rayVoiceScale()===1);

/* ---- 4. concealment and probes, Ray under the bed ---- */
fake([-8.85,1.0,-3.3]); run(.1); fake([-8.85,1.0,-2.15],[[-9.05,.9,-1.95],[-8.65,.9,-1.95]]); run(.6);
const mk_=(o)=>Object.assign({pos:[-8.85,-3.8],hd:0,dead:false,st:'idle'},o);
const head=rayHead();
ok('hidden, a man 1.6 m off in the dark: 0', rayConcealment(mk_({}))===0);
ok('a man standing at the bed edge (head 1.6 m up): 0', rayConcealment(mk_({pos:[-8.85,-2.9]}))===0);
const cr=rayConcealment(mk_({pos:[-8.85,-2.9],headP:[-8.85,.5,-2.9]}));
ok('a man crouched at the edge, head 0.8 m from his: ~0.67', cr>.55&&cr<.8, r2(cr));
const lowT=[-8.85,.35,-4.0],dl=norm3(v3.sub(head,lowT));
ok('a flashlight shone in low, at his face: 1', rayConcealment(mk_({torchOn:true,torchPos:lowT,torchDir:dl}))>.95);
const hiT=[-8.85,1.6,-4.0];
ok('a flashlight from head height: the bed is in the way: 0', rayConcealment(mk_({torchOn:true,torchPos:hiT,torchDir:norm3(v3.sub(head,hiT))}))===0);
ok('a flashlight pointed away: 0', rayConcealment(mk_({torchOn:true,torchPos:lowT,torchDir:[0,0,-1]}))===0);
noise([PL.x,0,PL.z],3); const cs0=rayConcealment(mk_({pos:[-8.85,-4.5]})),csFar=rayConcealment(mk_({pos:[-8.85,-6.5]})); run(2.2);
ok('a sound: spot given away to those in earshot, then not', cs0>.9&&csFar===0&&rayConcealment(mk_({pos:[-8.85,-4.5]}))===0, {now:r2(cs0)});
const Em=mk_({});
ok('probe the bed he is under: caught', hideProbe(Em,bed)===true);
ok('probe the wardrobe instead: not', hideProbe(Em,war)===false);
fake([-8.85,1.65,-3.4]); PL.x=-8.85; PL.z=-3.4; run(.3);
ok('not hidden: concealment 1, probe misses', rayConcealment(Em)===1&&hideProbe(Em,bed)===false);
/* a pass: a man walks up within 2 m and away */
fake([-8.85,1.0,-3.3]); run(.1); fake([-8.85,1.0,-2.15],[[-9.05,.9,-1.95],[-8.65,.9,-1.95]]); run(.6); const sv0=bed.saves;
const passer=mk_({pos:[-8.85,-5.5]}); enemies.push(passer); for(let z=-5.5;z<=-3.6;z+=.2){ passer.pos[1]=z; hideSaveTick(hideBody()); } for(let z=-3.6;z>=-5.5;z-=.2){ passer.pos[1]=z; hideSaveTick(hideBody()); } enemies.splice(enemies.indexOf(passer),1);
ok('a man passing within 2 m: the bed saved him', bed.saves===sv0+1&&HIDE_KIND_SAVES.bed>=1, {saves:bed.saves,kind:HIDE_KIND_SAVES.bed});
/* the loose-spot miss, earned by stillness and quiet */
const lau=addHideSpot({id:'laundry',kind:'sheets',x:-6.2,z:-3.2,w:.9,d:.7,h:1.9});
fake([-6.2,1.6,-3.2],[[-6.3,1.2,-3.1],[-6.1,1.2,-3.1]]); run(2.0); let miss=0; for(let i=0;i<400;i++) if(!hideProbe(Em,lau)) miss++;
ok('laundry, still and quiet: misses ~25% of looks', miss>60&&miss<140&&lau.saves===miss, {miss,of:400,saves:lau.saves});
noise([PL.x,0,PL.z],2); miss=0; for(let i=0;i<200;i++) if(!hideProbe(Em,lau)) miss++;
ok('laundry, just made a sound: never misses', miss===0, miss);
removeHideSpot(lau);
HIDE.fake=null;

/* ---- 5. sheets: eyes, not bodies, bullets or sound ---- */
place(-7.0,.6,Math.PI); run(.2);
ok('sheet blocks sight through the doorway', !sightClear([-7,1.5,0],[-7,1.5,-2.5]));
ok('... but not sound', soundClear([-7,1.5,0],[-7,1.5,-2.5]));
ok('... and not bullets (rayRoom goes through)', rayRoom([-7,1.5,0],[0,0,-1]).t>4, r2(rayRoom([-7,1.5,0],[0,0,-1]).t));
ok('... and isn\'t in the collision grid', !boxesAt(-7,-1).some(b=>b.sightOnly));
ok('... low down, under its hem, you can see feet', sightClear([-7,.05,0],[-7,.05,-2.5]));
{ const sv=SHEETS.splice(0); const c=sightClear([-7,1.5,0],[-7,1.5,-2.5]); SHEETS.push(...sv); ok('without it, the same line is clear', c); }
let maxD=0,open=0,ahead=null,crossT=null; PL.yaw=0; KEYS.KeyW=true; const t0=GAME.t;
for(let i=0;i<150;i++){ step(); let m=0; for(let k=0;k<door.n;k++) m=Math.max(m,Math.abs(door.P[k*3+2]-door.R[k*3+2])); maxD=Math.max(maxD,m);
  if(sightClear([-7,1.3,0],[-7,1.3,-2.5])) open++; if(ahead===null&&PL.z<-1.45) ahead=sightClear([PL.x,1.55,PL.z],[PL.x,1.4,PL.z-2]); if(crossT===null&&PL.z<-1.6) crossT=GAME.t-t0; if(i===60) KEYS.KeyW=false; }
KEYS.KeyW=false;
ok('walks straight through at full speed', crossT!==null&&crossT<.9, {t:crossT&&r2(crossT),z:r2(PL.z)});
ok('the cloth swings aside on him', maxD>.2, r2(maxD));
ok('once he is through, nothing in front of his eyes', ahead===true, ahead);
ok('someone going through opens it for a moment (the line through it clears)', open>3, {framesOpen:open,of:150});
run(5); let rest=0; for(let k=0;k<door.n;k++) rest=Math.max(rest,Math.abs(door.P[k*3+2]-door.R[k*3+2]));
ok('then it settles back and goes to sleep', rest<.05&&door.idle>=1.5, {off:r2(rest),idle:r2(door.idle)});
ok('blocks sight again once settled', !sightClear([-7,1.5,0],[-7,1.5,-2.5]));
/* plastic strips too */
place(-3.0,-.6,Math.PI); walkUntil(Math.PI,()=>PL.z>1.6,3); ok('through the plastic strips', PL.z>1.6, r2(PL.z)); run(5);

/* ---- 6. glow: a flashlight behind the sheet ---- */
const tor={o:[-7,1.4,-2.8],d:[0,0,1],E:{}}; for(let i=0;i<60;i++) sheetGlow(door,1/60,[tor]); const gNear=door.mF.emis[0],gOther=door.mB.emis[0];
ok('a flashlight 1.8 m behind, pointed at it: the corridor side glows', gNear>.3&&gOther<.05, {glow:r2(gNear),other:r2(gOther)});
const tor2={o:[-7,1.4,-2.8],d:[0,0,-1],E:{}}; for(let i=0;i<90;i++) sheetGlow(door,1/60,[tor2]);
ok('pointed away: fades out', door.mF.emis[0]<.03, r2(door.mF.emis[0]));
const tor3={o:[-7,1.4,-3.8],d:[0,0,1],E:{}}; for(let i=0;i<30;i++) sheetGlow(door,1/60,[tor3]); const gMid=door.mF.emis[0]; for(let i=0;i<60;i++) sheetGlow(door,1/60,[]);
ok('2.8 m behind: a fainter glow (the early warning)', gMid>.05&&gMid<gNear, r2(gMid));
const tor4={o:[-7,1.4,-6.5],d:[0,0,1],E:{}}; for(let i=0;i<60;i++) sheetGlow(door,1/60,[tor4]);
ok('past 4.5 m: nothing', door.mF.emis[0]<.01);

/* ---- 7. tearing a strip off (keyboard B; VR: grip and pull down) ---- */
window.__strips=0; window.giveStrip=h=>{ window.__strips++; };
place(-7.0,-.4,Math.PI); const lowBefore=sightClear([-6.8,.17,0],[-6.8,.17,-2.5]);
const torn=hideFlatTear();
ok('B tears a strip: giveStrip got it', torn&&window.__strips===1&&door.panels.some(p=>p.torn===1), {torn,strips:window.__strips});
run(3); const p0=door.panels.findIndex(p=>p.torn===1),uSide=p0===0?-7.2:-6.8;
ok('the hem rose: you can see under that half now', !lowBefore&&sightClear([uSide,.17,0],[uSide,.17,-2.5]));
/* VR: grip a sheet, crouch while holding it aside (no tear), then yank down (tear) */
{ const h=HANDS.L,was=XR.on,pad={buttons:[{pressed:false},{pressed:false}]}; h.src={gamepad:pad}; XR.on=true; window.__strips=0; for(const p of door.panels) p.torn=0;
  const at=(x,y,z)=>{ h.M=m4.make(); h.M[12]=x-FIST[0]; h.M[13]=y-FIST[1]; h.M[14]=z-FIST[2]; h.vel=[0,0,0]; }, Bh=y=>({y});
  const k=door.cols.find(c=>c.u<-.3).j*door.rows+3,P=door.P; at(P[k*3],P[k*3+1],P[k*3+2]); pad.buttons[1].pressed=true; sheetHandsTick(Bh(1.6));
  const held=h._sh===door; at(P[k*3],P[k*3+1]-.2,P[k*3+2]+.15); sheetHandsTick(Bh(1.42)); const afterCrouch=window.__strips;
  at(P[k*3],P[k*3+1]-.45,P[k*3+2]); sheetHandsTick(Bh(1.42));
  ok('VR grip: holds the sheet; crouching while holding it doesn\'t tear it; a yank down does', held&&afterCrouch===0&&window.__strips===1&&!h._sh, {held,afterCrouch,strips:window.__strips});
  pad.buttons[1].pressed=false; sheetHandsTick(Bh(1.42)); XR.on=was; h.src=null; }
delete window.giveStrip;

/* ---- 8. a crouch hole ---- */
const lint=addBox(-6.07,-5.93,-1,1,.95,2.8,'wall'); boxGridDirty=true;
place(-6.7,0,-Math.PI/2); walkUntil(-Math.PI/2,()=>false,1.0); ok('standing: the wall over the hole stops him', PL.x<-6.3, r2(PL.x));
place(-6.7,0,-Math.PI/2); hideCrouchToggle(); run(.3); walkUntil(-Math.PI/2,()=>PL.x>-5.5,4); ok('crouched: through the hole', PL.x>-5.5, r2(PL.x)); hideCrouchToggle(); run(.4);
removeBox(lint);

/* ---- 9. cost: 12 spots, 8 sheets all moving, 6 men (2 with flashlights) near ---- */
for(let i=0;i<10;i++) addHideSpot({id:'perf'+i,kind:'corner',x:-9+i*1.7,z:i%2?3.5:-4,w:.8,d:.8,h:1});
for(let i=0;i<5;i++) addSheet({x:-1+i*2.2,z:0,axis:'z',w:1.8,h:2.2,kind:i%2?'plastic':'sheet'});
const mocks=[]; for(let i=0;i<6;i++){ const E={pos:[-1+i*2.2,.1],hd:0,dead:false,st:'alert',sup:1,torchOn:i<2}; mocks.push(E); enemies.push(E); }
place(-1,0,0); HIDE.fake={head:[-1,1.0,0],hands:[[-1.1,1,.2],[-.9,1,.2]],vr:true};
for(let i=0;i<60;i++){ for(const S of SHEETS) S.idle=0; hideFrame(1/72); }
const best=fn=>{ let m=1e9; for(let b=0;b<5;b++){ const T=performance.now(); for(let i=0;i<200;i++) fn(i); m=Math.min(m,(performance.now()-T)/200); } return m; }; /* the machine is shared: the quietest of five batches */
const msF=best(i=>{ for(const S of SHEETS) S.idle=0; for(const E of mocks) E.pos[1]=.1+.15*Math.sin(i*.1); hideFrame(1/72); });
for(const E of mocks) enemies.splice(enemies.indexOf(E),1); HIDE.fake=null;
const msSight=best(()=>sightClear([-9,1.5,-.5],[9,1.5,.5]));
const sv=SHEETS.splice(0); const msSight0=best(()=>sightClear([-9,1.5,-.5],[9,1.5,.5])); SHEETS.push(...sv);
ok('per-frame cost, all awake (target < 0.5 ms here)', msF<.5, {ms:+msF.toFixed(3),spots:HIDES.length,sheets:SHEETS.length});
R.push('INFO sightClear across the floor: '+(msSight*1000).toFixed(1)+' us with 8 sheets, '+(msSight0*1000).toFixed(1)+' us without');
let msIdle; { for(const S of SHEETS){ S.idle=9; S.mv=0; } place(-12,0,0); hideFrame(1/72); msIdle=best(()=>hideFrame(1/72)); }
R.push('INFO per-frame cost, Ray away from every sheet: '+msIdle.toFixed(3)+' ms');
return {fails,R};
})()`;

const OLD = String.raw`(()=>{ const R=[]; let fails=0; const ok=(n,c,i)=>{ R.push((c?'PASS ':'FAIL ')+n+(i!==undefined?'  '+JSON.stringify(i):'')); if(!c) fails++; };
  ok('old game: PROTO off, no spots, no sheets', !PROTO.on&&HIDES.length===0&&SHEETS.length===0);
  ok('old game: eye at 1.62', Math.abs(camBasis().eye[1]-1.62)<1e-6);
  const b={x0:0,x1:1,z0:0,z1:1,y0:.3,h:.6,kind:'furn'},w={x0:0,x1:1,z0:0,z1:1,y0:.9,h:2,kind:'window'};
  ok('old game: a raised box stays solid for the player and walkers', solidFor(b,'player')&&solidFor(b,'walker')&&solidFor(w,'player'));
  hideCrouchToggle(); ok('old game: crouch toggle does nothing', !PL.crouchT&&!PL.crouch);
  let same=0,n=0; for(let i=0;i<300;i++){ const a=[rnd(-10,10),rnd(.3,1.8),rnd(-5.5,5.5)],c=[rnd(-10,10),rnd(.3,1.8),rnd(-5.5,5.5)]; n++; if(sightClear(a,c)===soundClear(a,c)) same++; }
  ok('old game: sightClear unchanged (= walls-only test) on 300 random lines', same===n, {same,n});
  return {fails,R}; })()`;

/* the real floor with its cast: Ray crawls under the test bed and lies there while Tito walks his beat with the flashlight (it goes
   through the bedroom doorway's sheet), then walks out through both sheets. Nothing may throw; reports what the system saw */
const SOAK = String.raw`(()=>{
window.__noRaf=true; window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
const R=[]; let fails=0; const ok=(n,c,i)=>{ R.push((c?'PASS ':'FAIL ')+n+(i!==undefined?'  '+JSON.stringify(i):'')); if(!c) fails++; };
const step=(dt=1/30)=>{ update(dt,performance.now()); updateWorld(world,null); const due=__Q.filter(q=>q[0]<=GAME.t); __Q=__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } };
const ev={hide:0,unhide:0,save:0,crouch:0}; protoOn('hide',()=>ev.hide++); protoOn('unhide',()=>ev.unhide++); protoOn('hideSave',()=>ev.save++); protoOn('crouch',()=>ev.crouch++);
let hidT=0,glow=0,minC=1,awake=0,torchSeen=0; const walk=(tx,tz,maxT)=>{ for(let t=0;t<maxT;t+=1/30){ const d=navTo(PL.x,PL.z,tx,tz); PL.yaw=Math.atan2(-d[0],-d[2]); KEYS.KeyW=Math.hypot(PL.x-tx,PL.z-tz)>.15; tick(); if(!KEYS.KeyW) break; } KEYS.KeyW=false; };
const tick=()=>{ step(); if(PL.hide) hidT+=1/30; for(const S of SHEETS){ glow=Math.max(glow,S.mF.emis[0],S.mB.emis[0]); if(S.idle<1.5) awake++; } for(const E of enemies) if(E.torchOn){ torchSeen++; minC=Math.min(minC,rayConcealment(E)); } };
walk(-7.0,0,8); walk(-8.85,-3.2,8); PL.yaw=Math.PI; hideCrouchToggle(); KEYS.KeyW=true; for(let t=0;t<4&&PL.z<-2.15;t+=1/30) tick(); KEYS.KeyW=false;
const under=PL.hide&&PL.hide.id; for(let t=0;t<45;t+=1/30) tick();
PL.yaw=0; KEYS.KeyW=true; for(let t=0;t<4&&PL.z>-3.1;t+=1/30) tick(); KEYS.KeyW=false; hideCrouchToggle(); for(let t=0;t<1;t+=1/30) tick();
walk(-7.0,-2.0,6); walk(-7.0,0,6); walk(-3.0,-.4,8); walk(-3.0,2.2,6);
ok('soak: under the bed with the cast running', under==='test-bed', under);
ok('soak: hide/unhide events paired, crouch events', ev.hide>=1&&ev.unhide>=1&&ev.crouch>=2, ev);
R.push('INFO soak: '+JSON.stringify({hiddenSecs:+hidT.toFixed(1),saves:ev.save,kindSaves:HIDE_KIND_SAVES,maxGlow:+glow.toFixed(2),sheetFramesAwake:awake,torchFrames:torchSeen,minConcealmentVsTorch:+minC.toFixed(2),dead:PL.dead,hp:Math.round(PL.hp),end:[+PL.x.toFixed(1),+PL.z.toFixed(1)],hunters:enemies.filter(E=>E.aware).map(E=>E.name)}));
return {fails,R}; })()`;

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ARGS }); let fails = 0;
  for (const [q, code] of [['f=1&proto=1&pf=0&hidetest=1', TEST], ['f=1&proto=1&pf=0&hidetest=1', SOAK], ['f=1', OLD]]) {
    const p = await b.newPage({ viewport: { width: 480, height: 270 } }); const errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
    await p.goto(file + '?' + q, { timeout: 180000 }); await p.waitForTimeout(400); await p.click('#start'); await p.waitForTimeout(600);
    p.setDefaultTimeout(300000); const r = await p.evaluate(s => { try { return window.__eval(s); } catch (e) { return { fails: 1, R: ['ERR ' + e.stack] }; } }, code);
    console.log('== ' + q); for (const l of r.R) console.log('  ' + l); if (errs.length) console.log('  console errors: ' + JSON.stringify(errs.slice(0, 5)));
    fails += r.fails + errs.length; await p.close(); }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0); })();
