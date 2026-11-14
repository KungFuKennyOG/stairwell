// Wounded men and tenants (prototype, agent I). Steps the game's own update() with rendering off, updateWorld after each step,
// timers on game time (same pattern as wounds2.js / deep.js). Floor 03's hall; everyone else is cleared out.
// usage: node wounded.js <index.html> <test> [n] [extra query, e.g. "proto=0"]
//   clot   shot once in a limb or the chest, gun off him, watched 3 min: alive? (non-arterial vs arterial)
//   crawl  crawl-temperament men shot in the leg, you stand back: do they roll, crawl, how far, toward what
//   beg    a downed man for 60 s with you near / at 8 m / far: noise events per minute from his voice
//   tenant a lone tenant sees you, 100 trials: what they do (and whether the pointing ones shout)
//   shush  a tenant set to point; your hand at different distances from your mouth, mic off / whisper / talking; and your gun on them
//   kill   kill one tenant, then let another see you (with and without the shush)
//   still  a downed man not crawling; you walk right over him: how far his body moves
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const game = 'file://' + path.resolve(process.argv[2]), test = process.argv[3], N = +(process.argv[4] || 0), extra = process.argv[5] || 'proto=1&pf=0'; /* the scenes are placed for the old floor layout */
const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__T=(function(){
  const EV={}; const on=(ev)=>protoOn(ev,(...a)=>{ (EV[ev]||(EV[ev]=[])).push([+GAME.t.toFixed(2),...a.map(x=>x&&x.name?x.name:x)]); });
  for(const ev of ['wdBeg','wdRoll','wdPickup','tenantReact','tenantScream','tenantPoint','tenantCalm','tenantKilled','shush','stat']) on(ev);
  const BARKS=[]; const _bark=bark; bark=function(E,txt,d){ BARKS.push([+GAME.t.toFixed(1),E.name,txt]); return _bark.apply(this,arguments); };
  const dt=1/30;
  function step(n=1){ for(let i=0;i<n;i++){ PL.hp=100; PL.dead=false; update(dt,performance.now()); updateWorld(world,null);
    if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } } } }
  const reset=()=>{ for(const k in EV) EV[k].length=0; BARKS.length=0; window.__Q=[]; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); WD.civKilled=false; WD.shush=false; WD.shushT=0; window.__wdForce=null; for(const h of [HANDS.L,HANDS.R]){ h.M[12]=PL.x+3; h.M[13]=0; h.M[14]=PL.z+3; } };
  const mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  function pt(E,part){ const B=E.B,P=n=>X_(B,PI_[n]);
    switch(part){ case 'neck': return mid(P('neck'),P('head'),.35); case 'head': return P('head');
      case 'chest': { const c=mid(P('chest'),P('neck'),.45),r=norm3(v3.sub(P('shR'),P('shL'))); return v3.add(c,v3.sc(r,.09)); }
      case 'belly': return mid(P('pelvis'),P('chest'),.45);
      case 'uarmR': return mid(P('shR'),P('elR'),.55); case 'farmR': return mid(P('elR'),P('hdR'),.5);
      case 'thighR': return mid(P('hipR'),P('knR'),.5); case 'thighL': return mid(P('hipL'),P('knL'),.5); case 'shinR': return mid(P('knR'),P('anR'),.5); case 'footR': return mid(P('anR'),P('toeR'),.5); } }
  const eye=()=>[PL.x,1.62,PL.z];
  function shoot(E,part){ const p=pt(E,part); window.__game.aimAt(p); if(!HANDS.R.item||HANDS.R.item.key!=='pistol') equip(HANDS.R,newItem('pistol')); const it=HANDS.R.item; it.cd=0; it.chambered=true; if(it.ammo<1) it.ammo=5; fireHand(HANDS.R,{o:eye(),d:norm3(v3.sub(p,eye()))}); }
  function gunman(x,z,hd,o={}){ const E=spawnEnemy({maker:makeGunman,name:o.name||'Test',x,z,hd,extra:'I got a kid—'}); enemies.push(E); attachLabels(); E.psych=o.psych||'fight'; if(o.temper) E.temper=o.temper; return E; }
  function tenant(x,z,hd,name){ const E=spawnEnemy({maker:makeLandlord,name:name||'Ten',x,z,hd,extra:'I just live here—'}); enemies.push(E); attachLabels(); E.civ=true; E.atkCd=1e9; if(E.C.wpn){ E.C.wpn.vis=false; E.wpnHeld=false; setGrip(E.J,'R',false); } return E; }
  const gunOff=()=>{ PL.pitch=1.3; };
  const ray=(x,z,yaw)=>{ PL.x=x; PL.z=z; PL.yaw=yaw??-Math.PI/2; PL.pitch=0; };
  /* put a downed man on his back: turn the whole body half a turn about his spine, then sit it on the floor */
  function flip(E){ const B=E.B,x=B.x,p=B.p,pe=X_(B,PI_.pelvis),ch=X_(B,PI_.chest),Rh=frameFrom(X_(B,PI_.hipL),X_(B,PI_.hipR),pe,ch); if(Rh[2][1]>.3) return; const k=Rh[1],c=v3.sc(v3.add(pe,ch),.5);
    for(let i=0;i<NP;i++){ const o=i*3; for(const Q of [x,p]){ const r=[Q[o]-c[0],Q[o+1]-c[1],Q[o+2]-c[2]],kd=v3.dot(k,r)*2; Q[o]=c[0]-r[0]+k[0]*kd; Q[o+1]=c[1]-r[1]+k[1]*kd; Q[o+2]=c[2]-r[2]+k[2]*kd; } }
    let lo=1e9; for(let i=0;i<NP;i++) lo=Math.min(lo,x[i*3+1]-B.r[i]); for(let i=0;i<NP;i++){ x[i*3+1]+=.01-lo; p[i*3+1]=x[i*3+1]; } }
  function hipYaw(E){ const l=X_(E.B,PI_.pelvis),r=X_(E.B,PI_.chest); return Math.hypot(l[2]-r[2],l[0]-r[0])>.25?Math.atan2(r[2]-l[2],r[0]-l[0]):null; } /* his heading: the way his spine points along the floor */

  /* ---- clotting: one shot, watched for 3 minutes ---- */
  function clot(o){ reset(); ray(-1,0); const E=gunman(2,0,-Math.PI/2,{psych:'fight'}); equip(HANDS.R,newItem('pistol')); step(30);
    shoot(E,o.part); gunOff(); const t0=GAME.t; let downT=null,deathT=null; const marks=[30,60,90,120,180],tl=[];
    while(GAME.t-t0<180){ step(); if(downT==null&&(E.st==='down'||E.st==='kneel')) downT=+(GAME.t-t0).toFixed(0); if(E.dead&&deathT==null){ deathT=+(GAME.t-t0).toFixed(0); break; }
      if(tl.length<marks.length&&GAME.t-t0>=marks[tl.length]) tl.push([marks[tl.length],Math.round(E.blood),E.st]); }
    const art=E.wounds.some(w=>w.wd?!w.wd.ok||w.wd.r0>0&&w.part==='thigh'&&w.art:w.art)||E.wounds.some(w=>w.wd&&!w.wd.ok);
    return {part:o.part,alive:!E.dead,deathT,art:E.wounds.map(w=>w.part+(w.wd&&!w.wd.ok?'(no clot)':'')+':'+(w.wd?w.wd.r0.toFixed(1):w.rate.toFixed(1))).join(' '),noClot:E.wounds.some(w=>w.wd&&!w.wd.ok),
      blood:Math.round(E.blood),st:E.dead?'dead':E.st,stable:!!E.wdStable,cons:+E.cons.toFixed(2),pale:+(E.paleK||0).toFixed(2),tl}; }

  /* ---- crawling ---- */
  function crawl(o){ reset(); ray(-1,0); const E=gunman(o.x??2,o.z??0,o.hd??-Math.PI/2,{psych:o.psych,temper:'crawl'}); let F=null; if(o.friend) F=gunman(o.friend[0],o.friend[1],0,{name:'Friend',psych:'fight'});
    if(o.tenant) tenant(o.tenant[0],o.tenant[1],0,'Ten');
    equip(HANDS.R,newItem('pistol')); step(30); shoot(E,o.part||'thighR'); gunOff(); if(F){ F.st='idle'; }
    step(15); ray(o.rx??-6,o.rz??0); gunOff(); if(o.hideRay) { PL.x=-15; PL.z=0; }
    if(o.back){ let k=0; while((E.st!=='down'||E.downT<2.5)&&k++<200) step(); flip(E); step(2); }
    const t0=GAME.t,p0=X_(E.B,PI_.pelvis),modes={},trk=[]; let maxD=0,yawMax=0,yPrev=null,firstMove=null,rollMax=0,pPhi=null; const win=[],spd=[];
    while(GAME.t-t0<(o.secs||75)){ step(); if(E.dead) break; if(F&&F.st==='alert'&&!F.wdHeldStill){ F.st='idle'; F.aware=false; F.mind='calm'; } /* the friend stays put, so we see the crawler go to him */
      if(E.wdRoll&&E.wdRoll.phi!=null){ if(pPhi!=null) rollMax=Math.max(rollMax,Math.abs(E.wdRoll.phi-pPhi)*30); pPhi=E.wdRoll.phi; } else pPhi=null;
      const pel=X_(E.B,PI_.pelvis),d=Math.hypot(pel[0]-p0[0],pel[2]-p0[2]); maxD=Math.max(maxD,d); if(firstMove==null&&d>.5) firstMove=+(GAME.t-t0).toFixed(1);
      if(E.st==='down'){ modes[E.downMode]=(modes[E.downMode]||0)+1/30; const y=E.downMode==='roll'||E.downMode==='crawl'?hipYaw(E):null; if(y!=null&&yPrev!=null&&E.downT>2){ let dy=y-yPrev; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); yawMax=Math.max(yawMax,Math.abs(dy)*30); } yPrev=y; }
      if(E.downMode==='crawl'){ win.push([pel[0],pel[2]]); if(win.length>30){ const q=win.shift(); spd.push(Math.hypot(pel[0]-q[0],pel[2]-q[1])); } } else win.length=0;
      if(Math.round((GAME.t-t0)*30)%150===0) trk.push([+(GAME.t-t0).toFixed(0),+pel[0].toFixed(2),+pel[2].toFixed(2),E.downMode,Math.round(E.blood)]); }
    const pel=X_(E.B,PI_.pelvis),g=E.wdGoal;
    const crawlT=modes.crawl||0;
    return {psych:E.psych,part:o.part||'thighR',alive:!E.dead,blood:Math.round(E.blood),rolled:(EV.wdRoll||[]).map(r=>r[2]).join(','),rollSecs:(()=>{ const R=EV.wdRoll||[],a=R.find(r=>r[2]==='start'),b=R.find(r=>r[2]!=='start'); return a&&b?+(b[0]-a[0]).toFixed(1):null; })(),rollMaxDegS:Math.round(rollMax*57.3),crawled:+(E.wdCrawled||0).toFixed(2),net:+Math.hypot(pel[0]-p0[0],pel[2]-p0[2]).toFixed(2),maxD:+maxD.toFixed(2),
      crawlT:+crawlT.toFixed(0),speed:spd.length?+(spd.reduce((a,b)=>a+b,0)/spd.length).toFixed(2):0,speedMax:spd.length?+Math.max(...spd).toFixed(2):0,firstMove,goals:(EV.stat||[]).filter(s=>/wdCrawl/.test(s[1])).map(s=>s[1].replace('wdCrawl','')+':'+s[2]).join(','),
      goalNow:g?g.kind+(g.reached?'(reached)':''):null,pickup:!!(EV.wdPickup||[]).length,shotFromFloor:!!E.gShoot,armed:!!E.wdArmed,yawMaxDegS:Math.round(yawMax*57.3),modes:Object.fromEntries(Object.entries(modes).map(([k,v])=>[k,+v.toFixed(0)])),trk}; }

  /* ---- begging noise ---- */
  function beg(o){ reset(); ray(-1,0); const E=gunman(2,0,-Math.PI/2,{psych:'fight',temper:o.temper||'curl'}); equip(HANDS.R,newItem('pistol')); step(30); shoot(E,'thighR'); gunOff();
    step(60); ray(o.rx,0); gunOff(); if(o.cover){ window.__game.aimAt(X_(E.B,PI_.chest)); } const t0=GAME.t; (EV.wdBeg||[]).length=0;
    while(GAME.t-t0<60){ step(); if(o.cover) window.__game.aimAt(X_(E.B,PI_.chest)); if(E.dead) break; }
    const B=(EV.wdBeg||[]),k={}; for(const b of B) k[b[3]]=(k[b[3]]||0)+1; const mins=(GAME.t-t0)/60;
    return {rayAt:o.rx,cover:!!o.cover,alive:!E.dead,perMin:+(B.length/mins).toFixed(1),kinds:k,samples:BARKS.filter(b=>b[0]>=t0).slice(0,5).map(b=>b[2])}; }

  /* ---- tenants: what they do when they see you ---- */
  function tenantOnce(o){ reset(); ray(0,0); equip(HANDS.R,newItem('pistol')); gunOff(); const E=tenant(4,0,-Math.PI/2); if(o.mate) tenant(4.2,-.9,-Math.PI/2,'Mate');
    let t=0; while(!E.panic&&t<4){ step(); gunOff(); t+=1/30; } const react=E.civMode||(E.panic?'?':'none'); const t1=GAME.t;
    while(GAME.t-t1<4.2){ step(); gunOff(); }
    const pts=(EV.tenantPoint||[]).filter(p=>p[1]===E.name),sc=(EV.tenantScream||[]).filter(p=>p[1]===E.name);
    return {react,pointShoutAt:pts.length?+(pts[0][0]-t1).toFixed(1):null,screams:sc.length}; }
  function tenant100(o){ const R={},shout=[],n=o.n||100; let sc=0; for(let i=0;i<n;i++){ const r=tenantOnce(o); R[r.react]=(R[r.react]||0)+1; if(r.pointShoutAt!=null) shout.push(r.pointShoutAt); sc+=r.screams; }
    shout.sort((a,b)=>a-b); return {n,react:R,pointShouts:shout.length,shoutDelay:shout.length?[shout[0],shout[shout.length>>1],shout[shout.length-1]]:null,screamEvents:sc}; }

  /* ---- the shush ---- */
  function placeHand(h,p){ const M=m4.make(); M[12]=p[0]-FIST[0]; M[13]=p[1]-FIST[1]; M[14]=p[2]-FIST[2]; h.M.set?h.M.set(M):Object.assign(h.M,M); }
  function shush(o){ reset(); ray(0,0); equip(HANDS.R,newItem('pistol')); gunOff(); placeHand(HANDS.R,[PL.x+2,0,PL.z+2]);
    if(o.mic==='off'){ MIC.state='off'; } else { MIC.state='on'; MIC.an=null; MIC.talkAt=-42; MIC.db=o.mic==='whisper'?-55:-30; }
    window.__wdForce='point'; const E=tenant(4,0,-Math.PI/2); let t=0; while(!E.panic&&t<4){ step(); gunOff(); t+=1/30; }
    const c=camBasis(),m=[c.eye[0]+c.f[0]*.08-c.u[0]*.08,c.eye[1]+c.f[1]*.08-c.u[1]*.08,c.eye[2]+c.f[2]*.08-c.u[2]*.08],dir=norm3([.3,-.6,.5]);
    const t1=GAME.t; while(GAME.t-t1<4.2){ if(o.aim) window.__game.aimAt(X_(E.B,PI_.chest)); else gunOff();
      if(o.off!=null&&GAME.t-t1>(o.at||.3)){ const cb=camBasis(),mm=[cb.eye[0]+cb.f[0]*.08-cb.u[0]*.08,cb.eye[1]+cb.f[1]*.08-cb.u[1]*.08,cb.eye[2]+cb.f[2]*.08-cb.u[2]*.08]; placeHand(HANDS.L,v3.add(mm,v3.sc(dir,o.off))); }
      else placeHand(HANDS.L,[PL.x-2,0,PL.z-2]); step(); }
    MIC.state='off'; window.__wdForce=null;
    const pts=(EV.tenantPoint||[]),calm=(EV.tenantCalm||[]);
    return {hand:o.off==null?'none':o.off+' m',mic:o.mic,aim:!!o.aim,react:E.civMode,shouted:pts.length>0,calmed:calm.length?calm[0][2]:null,calmAt:calm.length?+(calm[0][0]-t1).toFixed(2):null,shushEv:(EV.shush||[]).length}; }

  /* ---- kill one tenant, the next screams ---- */
  function kill(o){ reset(); ray(0,0); equip(HANDS.R,newItem('pistol')); gunOff(); const A=tenant(4,0,-Math.PI/2,'A'),B=tenant(-12,0,Math.PI/2,'B'); /* B is down the hall behind you */
    let t=0; while(!A.panic&&t<4){ step(); gunOff(); t+=1/30; } step(10); for(let k=0;k<6&&!A.dead;k++){ shoot(A,'head'); step(8); } step(20);
    const killed=WD.civKilled; ray(-8,0,Math.PI/2); /* turn round: B sees you */
    if(o.shush) placeHand(HANDS.L,(()=>{ const c=camBasis(); return [c.eye[0]+c.f[0]*.08-c.u[0]*.08,c.eye[1]+c.f[1]*.08-c.u[1]*.08,c.eye[2]+c.f[2]*.08-c.u[2]*.08]; })());
    const t1=GAME.t; while(GAME.t-t1<6){ step(); gunOff(); }
    placeHand(HANDS.L,[PL.x-2,0,PL.z-2]);
    const sc=(EV.tenantScream||[]).filter(p=>p[1]==='B');
    return {aDead:A.dead,killedFlag:killed,shush:!!o.shush,bPanic:!!B.panic,bMode:B.civMode,bScreams:sc.length,firstScream:sc.length?+(sc[0][0]-t1).toFixed(1):null,bCalm:!!B.wdCalm}; }

  /* ---- you walk over a man on the floor ---- */
  function still(o){ reset(); ray(-1,0); const E=gunman(2,0,-Math.PI/2,{psych:'quit',temper:o.temper||'curl'}); equip(HANDS.R,newItem('pistol')); step(30); shoot(E,'thighR'); gunOff();
    step(240); const pel0=X_(E.B,PI_.pelvis),snap=[]; for(let i=0;i<NP;i++) snap.push(X_(E.B,i)); const y0=hipYaw(E); let maxP=0,maxAny=0;
    PL.x=pel0[0]-2; PL.z=pel0[2]; for(let k=0;k<120;k++){ PL.x+=4/120; step(); gunOff(); const p=X_(E.B,PI_.pelvis); maxP=Math.max(maxP,Math.hypot(p[0]-pel0[0],p[2]-pel0[2])); for(let i=0;i<NP;i++){ const q=X_(E.B,i); maxAny=Math.max(maxAny,Math.hypot(q[0]-snap[i][0],q[1]-snap[i][1],q[2]-snap[i][2])); } }
    let dy=(hipYaw(E)??y0)-(y0??0); dy=Math.atan2(Math.sin(dy),Math.cos(dy));
    return {mode:E.downMode,pelvisMoved:+maxP.toFixed(3),anyPartMoved:+maxAny.toFixed(3),hipTurnDeg:+(dy*57.3).toFixed(1)}; }
  return {flip,clot,crawl,beg,tenant100,tenantOnce,shush,kill,still,EV};
})();`;
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = []; let page = null;
  const fresh = async () => { if (page) await page.close(); page = await browser.newPage({ viewport: { width: 480, height: 270 } }); page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
    await page.goto(game + '?f=3&' + extra, { timeout: 120000 }); await page.waitForTimeout(350); await page.click('#start'); await page.waitForTimeout(200); await page.evaluate(s => window.__eval(s), CORE); };
  const run = async (fn, o) => { const r = await page.evaluate(([fn, o]) => window.__T[fn](o), [fn, o]); console.log(JSON.stringify(r)); return r; };
  await fresh();
  if (test === 'clot') { const parts = ['thighR', 'shinR', 'uarmR', 'farmR', 'chest', 'belly']; let n = 0;
    for (const part of parts) for (let i = 0; i < (N || 4); i++) { if (++n % 6 === 0) await fresh(); await run('clot', { part }); } }
  else if (test === 'crawl') { const C = [{ psych: 'fight' }, { psych: 'quit' }, { psych: 'quit', friend: [9, 0] }, { psych: 'fight', part: 'shinR' }, { psych: 'quit', tenant: [7, -3.5] }, { psych: 'fight', hideRay: true }, { psych: 'quit', back: true }, { psych: 'fight', back: true }];
    let n = 0; for (const c of C) for (let i = 0; i < (N || 3); i++) { if (++n % 5 === 0) await fresh(); await run('crawl', c); } }
  else if (test === 'beg') { for (const rx of [-.2, -6, -15]) await run('beg', { rx }); await run('beg', { rx: -3, cover: true }); await run('beg', { rx: -15, temper: 'crawl' }); }
  else if (test === 'tenant') { await run('tenant100', { n: N || 100 }); }
  else if (test === 'shush') { for (const mic of ['off', 'whisper', 'talk']) for (const off of [null, 0, .06, .1, .14, .25]) { if (mic !== 'off' && off !== null && off !== 0 && off !== .1) continue; await run('shush', { mic, off }); }
    await run('shush', { mic: 'off', aim: true }); }
  else if (test === 'kill') { for (let i = 0; i < (N || 5); i++) { await run('kill', {}); await run('kill', { shush: true }); } }
  else if (test === 'still') { for (const temper of ['curl', 'still', 'crawl']) await run('still', { temper }); }
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 8)));
  await page.close(); await browser.close();
})();
