// Wound test: one gunman in the hall on floor 03, shot in a chosen body part, then watched for 75 s of game time.
// usage: node wounds.js <index.html> [trials per case]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const game = 'file://' + process.argv[2], N = +(process.argv[3] || 3);
const IN_PAGE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__W=(function(){
  let HITS=[],BARKS=[],TB=[];
  const _hit=hitEnemy; hitEnemy=function(E,seg,point,dir,weapon,o){ HITS.push(seg[3]); return _hit.apply(this,arguments); };
  const _bark=bark; bark=function(E,txt,d){ BARKS.push(txt); TB.push([+GAME.t.toFixed(1),txt]); return _bark.apply(this,arguments); };
  const step=dt=>{ PL.hp=100; PL.dead=false; update(dt,performance.now()); updateWorld(world,null); if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } } };
  const mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  function pt(E,part){ const B=E.B,P=n=>X_(B,PI_[n]);
    switch(part){ case 'head': return P('head'); case 'neck': return mid(P('neck'),P('head'),.35); case 'heart': return window.__game.heartPt(E);
      case 'chest': { const c=mid(P('chest'),P('neck'),.45),r=norm3(v3.sub(P('shR'),P('shL'))); return v3.add(c,v3.sc(r,.09)); } /* his right lung, away from the heart */
      case 'belly': return mid(P('pelvis'),P('chest'),.45);
      case 'uarmR': return mid(P('shR'),P('elR'),.2); case 'farmR': return mid(P('elR'),P('hdR'),.5); case 'uarmL': return mid(P('shL'),P('elL'),.2);
      case 'thighR': return mid(P('hipR'),P('knR'),.5); case 'thighL': return mid(P('hipL'),P('knL'),.5); case 'shinR': return mid(P('knR'),P('anR'),.5); case 'footR': return mid(P('anR'),P('toeR'),.5); } }
  function snap(E,t,p0){ const pel=X_(E.B,PI_.pelvis); return {t,st:E.dead?'DEAD':E.st,mode:E.st==='down'&&!E.dead?E.downMode:undefined,blood:Math.round(E.blood),shock:E.shock,pelY:+pel[1].toFixed(2),moved:+Math.hypot(pel[0]-p0[0],pel[2]-p0[2]).toFixed(1),
      gun:E.wpnHeld?(E.oneHand?'1hand-'+E.wpnHand:'held'):'dropped',surr:!!E.surr,pale:+(E.paleK||0).toFixed(2)}; }
  function trial(o){ HITS=[]; BARKS=[]; TB=[]; const MODES={}; window.__Q=[]; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P);
    const dist=o.dist||3; PL.x=-dist+2; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0;
    const E=spawnEnemy({maker:makeGunman,name:'Test',x:2,z:0,hd:-Math.PI/2,extra:'I got a kid—'}); enemies.push(E); attachLabels(); E.psych=o.psych||'fight';
    equip(HANDS.R,newItem(o.wpn||'pistol')); const dt=1/30; for(let k=0;k<30;k++) step(dt);
    const eye=()=>[PL.x,1.62,PL.z],p0=X_(E.B,PI_.pelvis).slice(),t0=GAME.t,TL_=[],marks=[.5,1,2,3,5,8,12,20,30,45,60,75]; let mi=0,si=0,deathT=null,dropT=null,sev=null;
    const shots=o.shots.slice(); /* [part, at seconds] */
    while(GAME.t-t0<76){ const t=GAME.t-t0;
      while(si<shots.length&&t>=shots[si][1]){ const part=shots[si][0];
        if(part==='near'){ const pel=X_(E.B,PI_.pelvis),p=[pel[0],.02,pel[2]+.6]; window.__game.aimAt(p); fireHand(HANDS.R,{o:eye(),d:norm3(v3.sub(p,eye()))}); }
        else { const p=pt(E,part); window.__game.aimAt(p); const it=HANDS.R.item; it.cd=0; it.chambered=true; if(it.ammo<1) it.ammo=3; fireHand(HANDS.R,{o:eye(),d:norm3(v3.sub(p,eye()))}); }
        si++; if(si>=shots.length&&!o.keepAim) PL.pitch=1.3; /* then the gun comes off him */ }
      step(dt); if(E.st==='down'&&!E.dead){ MODES[E.downMode]=(MODES[E.downMode]||0)+dt; } else if(!E.dead){ MODES[E.st]=(MODES[E.st]||0)+dt; }
      if(E.dead&&deathT==null) deathT=+(GAME.t-t0).toFixed(1);
      if(!E.wpnHeld&&dropT==null) dropT=+(GAME.t-t0).toFixed(1);
      if(mi<marks.length&&GAME.t-t0>=marks[mi]){ TL_.push(snap(E,marks[mi],p0)); mi++; } }
    return {case:o.name,hits:HITS.join(','),psych:E.psych,temper:E.temper,deathT,dropT,cut:Object.keys(E.cut||{}).filter(k=>E.cut[k]).join(',')||undefined,deadArm:E.deadArm?Object.keys(E.deadArm).join(','):undefined,
      wounds:E.wounds.map(w=>w.part+(w.art?'*':'')+':'+w.rate.toFixed(1)).join(' '),legs:[+E.hp.legL.toFixed(1),+E.hp.legR.toFixed(1)],arms:[+E.hp.armL.toFixed(1),+E.hp.armR.toFixed(1)],
      barks:[...new Set(BARKS)].slice(0,9),tl:TL_,modes:Object.fromEntries(Object.entries(MODES).map(([k,v])=>[k,+v.toFixed(0)])),tb:TB.map(b=>[+(b[0]-t0).toFixed(0),b[1]])}; }
  return {trial};
})();`;
const CASES = [
  { name: 'head', shots: [['head', 0]] }, { name: 'shotgun 1.5 m, head', wpn: 'shotgun', dist: 1.5, shots: [['head', 0]] }, { name: 'foot', shots: [['footR', 0]] },
  { name: 'thigh, gun off him, 3 m', shots: [['thighR', 0]], rep: 8 }, { name: 'thigh, gun kept on him, 3 m', shots: [['thighR', 0]], keepAim: true, rep: 8 }, { name: 'thigh, gun off, 6 m', dist: 6, shots: [['thighR', 0]], rep: 6 },
  { name: 'belly then thigh', shots: [['belly', 0], ['thighR', .6]], rep: 4 },
];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  for (const c of CASES) for (let r = 0; r < (c.rep || N); r++) {
    const page = await browser.newPage({ viewport: { width: 640, height: 360 } }); page.on('pageerror', e => errs.push(c.name + ' ' + String(e).slice(0, 200)));
    await page.goto(game + '?f=3'); await page.waitForTimeout(350); await page.click('#start'); await page.waitForTimeout(250);
    await page.evaluate(s => window.__eval(s), IN_PAGE);
    console.log(JSON.stringify(await page.evaluate(c => window.__W.trial(c), c))); await page.close();
  }
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 8)));
  await browser.close();
})();
