// Rendered look at a wounded man rolling over and crawling (prototype). Floor 03's hall, everyone else cleared, one gunman shot in
// the thigh and put on his back; you stand to one side with nothing in your hands (a gun on him would make him stop and guard).
// The game is stepped headless (update + updateWorld) and only rendered for the shots, through its own frame().
// usage: node wounded-shots.js <index.html> <out dir> [psych quit|fight]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
const game = 'file://' + path.resolve(process.argv[2]), out = process.argv[3], psych = process.argv[4] || 'quit';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await page.goto(game + '?f=3&proto=1', { timeout: 120000 }); await page.waitForTimeout(400); await page.click('#start'); await page.waitForTimeout(300);
  const ev = s => page.evaluate(c => window.__eval(c), s);
  await ev(`(()=>{ window.requestAnimationFrame=()=>0; window.__fixedDt=1/30; window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
    window.__st=n=>{ for(let i=0;i<n;i++){ PL.hp=100; PL.dead=false; update(1/30,performance.now()); updateWorld(world,null); const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } } };
    clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); PL.x=-1; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0;
    const E=spawnEnemy({maker:makeGunman,name:'Test',x:2,z:0,hd:-Math.PI/2,extra:'I got a kid—'}); enemies.push(E); attachLabels(); E.psych='${psych}'; E.temper='crawl'; window.__E=E;
    equip(HANDS.R,newItem('pistol')); __st(30); const B=E.B,P=n=>X_(B,PI_[n]),p=[(P('hipR')[0]+P('knR')[0])/2,(P('hipR')[1]+P('knR')[1])/2,(P('hipR')[2]+P('knR')[2])/2];
    window.__game.aimAt(p); const it=HANDS.R.item; it.cd=0; it.chambered=true; fireHand(HANDS.R,{o:[PL.x,1.62,PL.z],d:norm3(v3.sub(p,[PL.x,1.62,PL.z]))}); equip(HANDS.R,null);
    let k=0; while((E.st!=='down'||E.downT<2.5)&&k++<200) __st(1);
    /* on his back */ const x=B.x,pp=B.p,pe=P('pelvis'),ch=P('chest'),Rh=frameFrom(P('hipL'),P('hipR'),pe,ch); if(Rh[2][1]<.3){ const kk=Rh[1],c=v3.sc(v3.add(pe,ch),.5);
      for(let i=0;i<NP;i++){ const o=i*3; for(const Q of [x,pp]){ const r=[Q[o]-c[0],Q[o+1]-c[1],Q[o+2]-c[2]],kd=v3.dot(kk,r)*2; Q[o]=c[0]-r[0]+kk[0]*kd; Q[o+1]=c[1]-r[1]+kk[1]*kd; Q[o+2]=c[2]-r[2]+kk[2]*kd; } }
      let lo=1e9; for(let i=0;i<NP;i++) lo=Math.min(lo,x[i*3+1]-B.r[i]); for(let i=0;i<NP;i++){ x[i*3+1]+=.01-lo; pp[i*3+1]=x[i*3+1]; } }
    const q=X_(B,PI_.pelvis); PL.x=q[0]-1.2; PL.z=q[2]+2.4; return 1; })()`);
  const look = () => ev(`(()=>{ const E=window.__E,q=X_(E.B,PI_.pelvis),c=X_(E.B,PI_.chest); PL.x=q[0]-2.1; PL.z=clamp(q[2]+.55,-.7,.7); window.__game.aimAt([(q[0]+c[0])/2,.15,(q[2]+c[2])/2]); })()`);
  const shot = async name => { await look(); await ev(`frame(performance.now())`); await page.waitForTimeout(50); await page.screenshot({ path: `${out}/${name}.png` });
    console.log(name, await ev(`(()=>{ const E=window.__E,R=E.wdRoll; return JSON.stringify({t:+GAME.t.toFixed(1),mode:E.downMode,phi:R&&R.phi!=null?+R.phi.toFixed(2):null,crawled:+(E.wdCrawled||0).toFixed(2),goal:E.wdGoal&&E.wdGoal.kind,blood:Math.round(E.blood)}); })()`)); };
  /* the roll starts within a few frames of him lying on his back */
  for (let i = 0; i < 90; i++) { await ev(`__st(1)`); const m = await ev(`(()=>{ const R=window.__E.wdRoll; return R&&R.phi!=null?R.phi:-1; })()`); if (m > .6) break; }
  await shot('1-rolling-onto-side');
  for (let i = 0; i < 60; i++) { await ev(`__st(1)`); const m = await ev(`window.__E.downMode`); if (m === 'crawl') break; }
  await ev(`__st(45)`); await shot('2-crawling');
  await ev(`__st(75)`); await shot('3-crawling-later');
  await ev(`__st(120)`); await shot('4-crawling-trail');
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 5)));
  await browser.close();
})();
