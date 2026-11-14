// Grab tests for 82-clinch.js (enemies grabbing Ray). Steps the game's own update() with timers on game time and world matrices refreshed.
// Ray's tracked hands are scripted: each step sets HANDS.*.M and emits handPose exactly like xrFrame does, then runs update().
// usage: node tools/harness/clinch.js index.html [trials per kind for the average-struggle rate, default 30]
// Checks: forced grabs of each kind with scripted success (hard struggle / a stab / a shot) and failure (no struggle); break-free
// rates for an "average" struggle (random 0.25-0.6 m of hand movement per 2 s, stratified so N trials cover the range evenly); the wrist grab's virtual-hand offset cap and ease-in;
// a few natural triggers; flat-screen mashing; and that no code in 82-clinch.js or the reverse wrestle ever writes Ray's position,
// height, yaw, pitch or the XR origin/yaw/head (every write is caught by a setter and its stack checked against those line ranges).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const file = path.resolve(process.argv[2] || 'index.html'), N = +(process.argv[3] || 30);
const html = fs.readFileSync(file, 'utf8').split('\n');
const lineOf = (s, from = 0) => { for (let i = from; i < html.length; i++) if (html[i].includes(s)) return i + 1; return -1; };
const c0 = lineOf('CLINCH (prototype, ?proto=1)'), c1 = lineOf('---------- boot ----------', c0), w0 = lineOf('the other way round: he has YOUR gun hand'), w1 = lineOf('---------- pinned to a wall', w0);
const p0_ = lineOf('PL.x+=(fx*mz+rx*mx)*sp'), CTRL = [p0_, p0_ + 1], RANGES = [[c0, c1], [w0, w1]]; /* CTRL: flat walking in update() writes PL.x every frame (a positive control for the detector) */
if (RANGES.some(r => r[0] < 0 || r[1] < 0)) { console.log('could not find 82-clinch.js in', file); process.exit(1); }

const IN_PAGE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__C=(function(){
  Error.stackTraceLimit=60; const RANGES=${JSON.stringify(RANGES)},CTRL=${JSON.stringify(CTRL)};
  /* ---- every write to Ray's view: PL.x/z/y/yaw/pitch, XR.origin (elements), XR.yaw, XR.head ---- */
  const W={mine:[],all:0,ctrl:0,on:false};
  const mineStack=()=>{ const st=new Error().stack.split('\\n').slice(2); for(const fr of st){ if(fr.includes('eval at')) continue; const m=/index\\.html[^:]*:(\\d+):\\d+/.exec(fr); if(m){ const ln=+m[1]; if(ln>=CTRL[0]&&ln<CTRL[1]) W.ctrl++; if(RANGES.some(r=>ln>=r[0]&&ln<r[1])) return fr.trim(); } } return null; };
  const note=k=>{ if(!W.on) return; W.all++; const m=mineStack(); if(m) W.mine.push(k+' <- '+m); };
  for(const k of ['x','z','y','yaw','pitch']){ let v=PL[k]; Object.defineProperty(PL,k,{get:()=>v,set:n=>{ note('PL.'+k); v=n; },configurable:true}); }
  const wrapO=a=>new Proxy(a,{set(t,k,v){ note('XR.origin['+String(k)+']'); t[k]=v; return true; }});
  { let o=wrapO(XR.origin),y=XR.yaw,hd=XR.head;
    Object.defineProperty(XR,'origin',{get:()=>o,set:n=>{ note('XR.origin'); o=wrapO(n); },configurable:true});
    Object.defineProperty(XR,'yaw',{get:()=>y,set:n=>{ note('XR.yaw'); y=n; },configurable:true});
    Object.defineProperty(XR,'head',{get:()=>hd,set:n=>{ note('XR.head'); hd=n; },configurable:true}); }

  CLN.sim=true; const dt=1/30;
  const MAK={corner:makeCorner,cutter:makeCutter,gunman:makeGunman,doorman:makeDoorman,enforcer:makeEnforcer,landlord:makeLandlord};
  /* ---- scripted tracked hands ---- */
  const HP={L:{p:null,f:null,u:null,tw:0},R:{p:null,f:null,u:null,tw:0}};
  function setHand(h,p,f,u,tw){ const F=norm3(f),U0=norm3(v3.sub(u,v3.sc(F,v3.dot(u,F)))),c=Math.cos(tw),s=Math.sin(tw),X0=v3.cross(U0,F);
    const U=v3.add(v3.sc(U0,c),v3.sc(X0,s)),X=v3.cross(U,F); const M=fromCols(X,U,F,v3.sub(p,v3.add(v3.sc(X,FIST[0]),v3.add(v3.sc(U,FIST[1]),v3.sc(F,FIST[2]))))); h.M.set(M); }
  let maxOff=0,offAt05=0,offs=[];
  function step(){ const G=PL.grab;
    for(const h of [HANDS.L,HANDS.R]){ const q=HP[h.side]; if(!q.p) continue; setHand(h,q.p,q.f,q.u,q.tw); const trk=mulP(h.M,FIST); protoEmit('handPose',h); setLocal(h.node,m4.make(),h.M);
      if(G&&G.kind==='wrist'&&G.h===h){ const v=mulP(h.M,FIST),o=Math.hypot(...v3.sub(v,trk)); maxOff=Math.max(maxOff,o); if(G.t<=.06) offAt05=Math.max(offAt05,o); } }
    update(dt,performance.now()); updateWorld(world,null);
    if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } } }
  /* ---- a fresh scene: Ray at the floor's start, one man ---- */
  function scene(kind,man,o={}){ window.__Q=[]; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P);
    PL.dead=false; PL.hp=100; PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; PL.moveK=1; CLN.cdUntil=o.natural?0:GAME.t+999; CLN.callUntil=0; CLN.test=null; /* the hall on floor 01, open both ways */
    equip(HANDS.R,o.R===undefined?(kind==='wrist'?newItem('pistol'):null):o.R?newItem(o.R):null); equip(HANDS.L,o.L?newItem(o.L):null);
    const {f,r,u,eye}=camBasis(),fF=[f[0],0,f[2]]; HP.R={p:v3.add(eye,v3.add(v3.sc(f,.42),v3.add(v3.sc(r,.16),[0,-.2,0]))),f:fF,u:[0,1,0],tw:0}; HP.L={p:v3.add(eye,v3.add(v3.sc(f,.35),v3.add(v3.sc(r,-.18),[0,-.3,0]))),f:fF,u:[0,1,0],tw:0};
    const back=kind==='choke',d=o.d||(kind==='tackle'?.6:.7),x=PL.x+fF[0]*d*(back?-1:1),z=PL.z+fF[2]*d*(back?-1:1);
    const E=spawnEnemy({maker:MAK[man],name:'T-'+man,x,z,hd:back?Math.atan2(fF[0],fF[2]):Math.atan2(-fF[0],-fF[2]),extra:'I got a kid—'}); enemies.push(E); attachLabels(); E.psych='fight';
    if(o.rage) E.rage=1; setAware(E,'see'); if(o.flank&&typeof twFlank==='function') twFlank(E); for(let k=0;k<12;k++) step(); return E; }
  /* ---- struggle scripts: A = metres of hand path per 2 s; strokes alternate toward/away along the useful direction ---- */
  function mover(A,useful,bias,stroke){ let segT=0,dir=[0,0,0],sgn=1,off=[0,0,0]; const sp=A/2;
    return (q,base)=>{ if(A<=0){ q.p=base.slice(); return; }
      segT-=dt; if(segT<=0){ segT=rnd(.12,.3); sgn=stroke?-sgn:1; const rv=norm3([rnd(-1,1),rnd(-1,1),rnd(-1,1)]); dir=norm3(useful?v3.add(v3.sc(useful,bias*(stroke?sgn:1)),v3.sc(rv,1-bias)):rv);
        if(!stroke&&Math.hypot(...off)>.14) dir=norm3(v3.sub(v3.sc(dir,.3),norm3(off))); } /* keep the hand within reach of where it started */
      const s=sp*rnd(.6,1.4)*dt; off=v3.add(off,v3.sc(dir,s)); if(stroke){ const a=v3.dot(off,useful); if(Math.abs(a)>.12) off=v3.sub(off,v3.sc(useful,a-Math.sign(a)*.12)); }
      q.p=v3.add(base,off); q.tw+=(Math.random()<.5?-1:1)*A*.8*dt; } }
  /* ---- one trial: force a grab of this kind, struggle with this script, report how it ended ---- */
  function trial(kind,man,how,o={}){ const E=scene(kind,man,o); W.mine.length=0; W.on=true; maxOff=0; offAt05=0;
    const p0=[PL.x,PL.z,PL.y||0,PL.yaw,PL.pitch],hp0=PL.hp; let res=null;
    const ok=enemyGrab(E,kind,{force:true}); if(!ok){ W.on=false; return {kind,how,err:'did not start'}; }
    const G=PL.grab,A=how==='avg'||how==='calib'?(o.A??rnd(.25,.6)):how==='hard'?2.4:0; let peak=0; if(how==='calib') G.need=1e9; let gripped=false,endT=null,snapErr=null;
    const mvR=mover(A,null,0,false),mvL=mover(A,null,0,false),cam=camBasis();
    const dirT=G.dir,out=G.kind==='choke'?norm3(v3.add(v3.sc(G.dir,-.45),[0,-.9,0])):null;
    const sL=kind==='tackle'?mover(A,dirT,.85,true):null,sR=kind==='tackle'?mover(A,dirT,.85,true):null,cR=kind==='choke'?mover(A,out,.85,true):null; let gripBase=null;
    let T=0; const maxT=12;
    let pSnap=null; /* Ray's place the moment the grab ends or he dies: after that the death card and restart move him, which is not the grab */
    while(T<maxT){ const g=PL.grab; if(pSnap===null&&(!g||PL.dead)) pSnap=[PL.x,PL.z,PL.y||0,PL.yaw,PL.pitch];
      if(!g){ if(endT===null){ endT=T; res=res||'?'; } if(T-endT>.1) break; }
      else if(how==='stab'&&g.t>.6&&!g.stabbed){ g.stabbed=true; const ch=X_(E.B,PI_.chest),d=norm3(v3.sub(ch,camBasis().eye)); hitEnemy(E,SEGS[2],ch,d,'knife',{power:1.2}); }
      else if(how==='shoot'&&g.t>.6&&!g.shot){ g.shot=true; equip(HANDS.L,newItem('pistol')); const it=HANDS.L.item; it.cd=0; const ey=camBasis().eye,ch=X_(E.B,PI_.chest); fireHand(HANDS.L,{o:ey,d:norm3(v3.sub(ch,ey))}); }
      else if(how==='mash'&&g.t>.2){ CLN.sim=false; if(Math.random()<.4) window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE'})); }
      else if(g&&(how==='avg'||how==='hard'||how==='calib')){ peak=Math.max(peak,g.sum/g.str);
        if(kind==='wrist'){ mvR(HP.R,HP.R.base||(HP.R.base=HP.R.p.slice())); }
        else if(kind==='collar'){ mvR(HP.R,HP.R.base||(HP.R.base=HP.R.p.slice())); mvL(HP.L,HP.L.base||(HP.L.base=HP.L.p.slice())); }
        else if(kind==='tackle'){ for(const [s,q,mv] of [['L',HP.L,sL],['R',HP.R,sR]]){ const rt=[-dirT[2],0,dirT[0]],side=s==='L'?-1:1,ns=v3.dot(v3.sub(X_(E.B,PI_.shL),camBasis().eye),rt)*side>0?'shL':'shR';
            const base=v3.sub(X_(E.B,PI_[ns]),v3.sc(dirT,.06)); q.f=dirT; mv(q,base); } }
        else if(kind==='choke'){ if(!GRABS.some(x=>x.E===E)){ const hp=X_(E.B,PI_['hd'+G.side]); HP.R.p=hp.slice(); HP.R.f=[0,-1,0]; HP.R.u=G.dir; for(let k=0;k<2;k++) step(); gripped=tryGrabBody(HANDS.R)||gripped; gripBase=HP.R.p.slice(); T+=2*dt; continue; }
          cR(HP.R,gripBase); } }
      step(); T+=dt; }
    if(how==='mash') CLN.sim=true;
    /* after the grab: the hand you see is the tracked one again */
    if(kind==='wrist'){ const h=G.h; setHand(h,HP.R.p,HP.R.f,HP.R.u,HP.R.tw); const trk=mulP(h.M,FIST); protoEmit('handPose',h); const v=mulP(h.M,FIST); snapErr=+Math.hypot(...v3.sub(v,trk)).toFixed(4); }
    W.on=false; const p1=pSnap||[PL.x,PL.z,PL.y||0,PL.yaw,PL.pitch],drift=Math.max(...p0.map((v,i)=>Math.abs(v-p1[i])));
    const out_={kind,man,how,res:res||(PL.grab?'running':'none'),t:+(G.t).toFixed(2),need:+G.need.toFixed(2),A:+A.toFixed(2),hpLost:hp0-PL.hp,dead:PL.dead,viewWritesMine:W.mine.slice(0,3),viewDrift:+drift.toFixed(5),
      maxOff:+maxOff.toFixed(3),peak:+peak.toFixed(3),offAt50ms:+offAt05.toFixed(3),snapErr,gripped:kind==='choke'?gripped:undefined};
    if(PL.grab) clnEnd('free'); PL.dead=false; PL.hp=100; return out_; }
  let RES=null; protoOn('grabEnd',(E,k,r)=>{ RES=r; });
  function trial2(kind,man,how,o){ RES=null; const r=trial(kind,man,how,o); if(RES) r.res=RES; return r; }
  /* ---- natural triggers: a man doing his own thing near you ---- */
  function natural(kind,secs=8){ const man=kind==='wrist'?'gunman':kind==='tackle'?'cutter':'corner'; let got=null; const L=(e,k)=>{ if(!got) got=k; }; protoOn('grabbed',L);
    const E=scene(kind,man,{d:kind==='wrist'?.8:kind==='choke'?2.6:3.2,R:kind==='wrist'?'pistol':null,natural:true,flank:kind==='choke'}); const t0=GAME.t; RES=null; void E;
    while(GAME.t-t0<secs&&!got){ PL.hp=100; step(); }
    if(PL.grab) clnEnd('free'); PL.dead=false; PL.hp=100; const L2=PROTO_EV.grabbed; L2.splice(L2.indexOf(L),1); return {kind,got,after:got?+(GAME.t-t0).toFixed(1):null}; }
  /* walking eases to a stop when he takes hold and eases back after: per-step distance walked, before, during, after */
  function lockTest(){ const E=scene('choke','corner',{}); KEYS.KeyW=true; const sp=[]; let last=[PL.x,PL.z];
    const rec=()=>{ sp.push(+Math.hypot(PL.x-last[0],PL.z-last[1]).toFixed(4)); last=[PL.x,PL.z]; };
    for(let k=0;k<6;k++){ step(); rec(); } const walk=sp[sp.length-1]; enemyGrab(E,'choke',{force:true}); const i0=sp.length;
    for(let k=0;k<30;k++){ PL.hp=100; step(); rec(); } clnEnd('free'); const i1=sp.length; for(let k=0;k<30;k++){ step(); rec(); } KEYS.KeyW=false;
    const during=sp.slice(i0,i1),after=sp.slice(i1),maxJump=Math.max(...sp.slice(1).map((v,i)=>Math.abs(v-sp[i])));
    return {walk,firstHeld:during[0],held300ms:Math.max(...during.slice(9)),firstAfter:after[0],after500ms:after[15],maxJump:+maxJump.toFixed(4)}; }
  /* pictures (SHOTS=1): hold a grab a second, then draw it from Ray's eye and from the side */
  function pose(kind,man,n){ const E=scene(kind,man,{}); enemyGrab(E,kind,{force:true}); const G=PL.grab; G.need=1e9; for(let k=0;k<(n||24);k++){ PL.hp=100; step(); } return !!PL.grab; }
  function shot(which){ resize(); const c=camBasis(); let eye=c.eye,f=c.f;
    if(which==='side'){ const r=c.r,ch=PL.grab&&PL.grab.kind==='choke'; const mid=v3.add(c.eye,v3.add(v3.sc(c.f,ch?-.15:.35),[0,-.35,0])); eye=v3.add(mid,v3.add(v3.sc(r,.85),[0,.15,0])); f=norm3(v3.sub(mid,eye)); }
    if(which==='down'){ f=norm3(v3.add(c.f,[0,-.9,0])); }
    for(const E of enemies) E.label.vis=false; panelN.vis=false; updateArms(c.f,c.u,c.eye);
    m4.persp(proj,(which==='side'?95:90)*Math.PI/180,cv.width/cv.height,0.03,120); m4.lookAt(view,eye,v3.add(eye,f),[0,1,0]);
    const h=360,w=Math.max(1,Math.round(h*cv.width/cv.height)); ensureFB(w,h); gl.bindFramebuffer(gl.FRAMEBUFFER,fb); renderWith(w,h); post(null,0,0,cv.width,cv.height,w,h); return 1; }
  return {trial:trial2,natural,lockTest,pose,shot,W,ctrl:()=>W.ctrl};
})();`;

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 480, height: 270 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto('file://' + file + '?f=1&proto=1&pf=0', { timeout: 180000 }); p.setDefaultTimeout(0); await p.waitForTimeout(400); await p.click('#start'); await p.waitForTimeout(300);
  await p.evaluate(s => window.__eval(s), IN_PAGE);
  if (process.env.SHOTS) { await p.setViewportSize({ width: 640, height: 360 });
    for (const [k, m, n] of [['wrist', 'gunman'], ['wrist', 'gunman', 115], ['wrist', 'doorman'], ['collar', 'gunman'], ['tackle', 'cutter'], ['choke', 'corner']]) { const ok = await p.evaluate(a => window.__C.pose(...a), [k, m, n]);
      for (const v of ['eye', 'side'].concat(k === 'choke' ? ['down'] : [])) { await p.evaluate(v => window.__C.shot(v), v); await p.screenshot({ path: `/tmp/clp/shot-${k}-${m}${n ? '-' + n : ''}-${v}.png` }); } console.log('shot', k, m, ok ? 'held' : 'ENDED'); }
    await b.close(); process.exit(0); }
  const run = (k, m, h, o) => p.evaluate(a => window.__C.trial(...a), [k, m, h, o || {}]);
  const MAN = { wrist: 'gunman', collar: 'gunman', tackle: 'cutter', choke: 'corner' };
  let fail = 0, mine = 0, drift = 0; const say = (ok, msg) => { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + msg); };
  const chk = r => { if (r.err) { console.log('  ERR', JSON.stringify(r)); fail++; return; } mine += r.viewWritesMine.length; drift = Math.max(drift, r.viewDrift); if (r.viewWritesMine.length) console.log('  view write from clinch code:', r.viewWritesMine.join(' | ')); };
  /* scripted outcomes */
  for (const k of ['wrist', 'collar', 'tackle', 'choke']) {
    const still = await run(k, MAN[k], 'still'); chk(still); say(still.res === 'lost', `${k}: no struggle -> ${still.res} after ${still.t}s (hp -${still.hpLost}${still.dead ? ', dead' : ''})`);
    const hard = await run(k, MAN[k], 'hard'); chk(hard); say(hard.res === 'free', `${k}: hard struggle -> ${hard.res} after ${hard.t}s${k === 'choke' ? ' (gripped ' + hard.gripped + ')' : ''}`);
    const stab = await run(k, MAN[k], 'stab'); chk(stab); say(stab.res === 'free' || stab.res === 'killed', `${k}: stabbed him -> ${stab.res} after ${stab.t}s`);
    const shot = await run(k, MAN[k], 'shoot'); chk(shot); say(shot.res === 'free' || shot.res === 'killed', `${k}: shot him with the other hand -> ${shot.res} after ${shot.t}s`);
    const mash = await run(k, MAN[k], 'mash'); chk(mash); say(mash.res === 'free', `${k}: flat screen, mashing E -> ${mash.res} after ${mash.t}s`);
    if (k === 'wrist') { say(still.maxOff <= .2501 && hard.maxOff <= .2501, `wrist: virtual hand offset capped (max ${Math.max(still.maxOff, hard.maxOff)} m)`); say(still.offAt50ms < .1, `wrist: offset eases in (${still.offAt50ms} m at 50 ms)`); say(still.snapErr === 0 && hard.snapErr === 0, `wrist: virtual hand snaps back to tracked after the grab (err ${still.snapErr}, ${hard.snapErr})`); }
  }
  for (const [k, m] of [['wrist', 'doorman'], ['tackle', 'gunman'], ['tackle', 'corner']]) { const r = await run(k, m, 'still', k === 'tackle' && m === 'gunman' ? { rage: 1 } : {}); chk(r); say(r.res === 'lost', `${k} by ${m}${m === 'gunman' ? ' (enraged)' : ''}: no struggle -> ${r.res} (hp -${r.hpLost})`); }
  if (process.env.CALIB) { for (const k of ['wrist', 'collar', 'tackle', 'choke']) { const pk = []; for (let i = 0; i < N; i++) { const r = await run(k, MAN[k], 'calib'); pk.push(r.peak); } pk.sort((a, b) => a - b);
      console.log(`CALIB ${k}: peak struggle / strength  q25 ${pk[Math.floor(N * .25)]}  median ${pk[Math.floor(N / 2)]}  q75 ${pk[Math.floor(N * .75)]}`); } await b.close(); process.exit(0); }
  /* average struggle */
  for (const k of ['wrist', 'collar', 'tackle', 'choke']) { const R = { free: 0, killed: 0, lost: 0 }; let ts = 0;
    const AR = [], order = [...Array(N).keys()].sort(() => Math.random() - .5); for (let i = 0; i < N; i++) { const r = await run(k, MAN[k], 'avg', { A: .25 + .35 * (order[i] + Math.random()) / N }); chk(r); R[r.res] = (R[r.res] || 0) + 1; ts += r.t; AR.push([r.A, r.res === 'lost' ? 0 : 1]); }
    if (process.env.DEBUG) { AR.sort((a, b) => a[0] - b[0]); console.log('  A->free', AR.map(a => a[0].toFixed(2) + ':' + a[1]).join(' ')); }
    const pct = Math.round(100 * (R.free + R.killed) / N); say(pct >= 40 && pct <= 60, `${k}: average struggle (0.25-0.6 m / 2 s) breaks free ${pct}% of ${N} (${JSON.stringify(R)}, mean ${(ts / N).toFixed(1)} s)`); }
  { const L = await p.evaluate(() => window.__C.lockTest()); say(L.held300ms === 0 && L.after500ms > 0 && L.maxJump <= L.walk * .2,
      `walking eases to a stop when grabbed and back after (walk ${L.walk} m/step, first held step ${L.firstHeld}, after 300 ms ${L.held300ms}, first free step ${L.firstAfter}, at 500 ms ${L.after500ms}, biggest step change ${L.maxJump})`); }
  /* natural triggers */
  for (const k of ['wrist', 'tackle', 'choke']) { let got = 0, n = 6, kinds = {}; for (let i = 0; i < n; i++) { const r = await p.evaluate(k => window.__C.natural(k, k === 'choke' ? 20 : 8), k); if (r.got) { got++; kinds[r.got] = (kinds[r.got] || 0) + 1; } }
    console.log(`INFO natural ${k}: ${got}/${n} started a grab ${JSON.stringify(kinds)}`); }
  say((await p.evaluate(() => window.__C.ctrl())) > 0, 'the write detector sees writes from other code (positive control: walking in update())');
  say(mine === 0, `no write to Ray's position/height/yaw/pitch or the XR origin/yaw/head from 82-clinch.js or the reverse wrestle (${mine} found)`);
  say(drift < 1e-6, `Ray's view never moved during any grab (max drift ${drift})`);
  say(!errs.length, 'no page errors' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 5)) : ''));
  /* ?grabtest=: the real page loop (no stepping by hand): the nearest man does the grab a few seconds after the start */
  for (const k of ['wrist', 'collar', 'tackle', 'choke']) { const q = await b.newPage({ viewport: { width: 320, height: 180 } }); const e2 = []; q.on('pageerror', e => e2.push(String(e).slice(0, 200)));
    await q.goto('file://' + file + '?f=1&proto=1&pf=0&grabtest=' + k, { timeout: 180000 }); q.setDefaultTimeout(0); await q.waitForTimeout(300); await q.click('#start');
    await q.evaluate(() => window.__eval("window.__gt=null; protoOn('grabbed',(E,k)=>{ if(!window.__gt) window.__gt={k,t:+GAME.t.toFixed(1)}; }); window.__t0=GAME.t; 0"));
    let r = null; for (let i = 0; i < 60 && !r; i++) { await q.waitForTimeout(1000); r = await q.evaluate(() => window.__eval('window.__gt&&{k:window.__gt.k,after:+(window.__gt.t-window.__t0).toFixed(1)}')); }
    say(r && r.k === k && !e2.length, `?grabtest=${k}: ${r ? r.k + ' started ' + r.after + ' s after the start' : 'nothing happened'}${e2.length ? ' ERR ' + e2[0] : ''}`); await q.close(); }
  await b.close(); process.exit(fail ? 1 : 0);
})();
