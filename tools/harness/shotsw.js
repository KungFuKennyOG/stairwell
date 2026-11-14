// Rendered look at wounded men: shoot one gunman, wait, look at him from close, screenshot.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const game = 'file://' + process.argv[2], out = process.argv[3];
const CASES = [['thigh-8s', 'pistol', 'thigh', 3, 8000], ['thigh-35s', 'pistol', 'thigh', 3, 35000], ['neck-3s', 'pistol', 'neck', 3, 3000], ['belly-30s', 'pistol', 'belly', 3, 30000], ['shotgun-arm-4s', 'shotgun', 'uarm', 1.6, 4000], ['shotgun-leg-6s', 'shotgun', 'thigh', 1.6, 6000], ['surrender', 'pistol', null, 3, 3500]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  for (const [name, wpn, part, dist, wait] of CASES) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    await page.goto(game + '?f=3'); await page.waitForTimeout(400); await page.click('#start'); await page.waitForTimeout(500);
    await page.evaluate(([wpn, part, dist]) => window.__eval(`(()=>{ window.__fixedDt=1/30; clearEnemies(); PL.x=${2 - dist}; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; setInterval(()=>{ PL.hp=100; PL.dead=false; },50);
      const E=spawnEnemy({maker:makeGunman,name:'Test',x:2,z:0,hd:-Math.PI/2,extra:'I got a kid—'}); enemies.push(E); attachLabels(); E.psych='${part ? 'fight' : 'quit'}'; window.__E=E; equip(HANDS.R,newItem('${wpn}'));
      setTimeout(()=>{ const B=E.B,P=n=>X_(B,PI_[n]),mid=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
        const p=${JSON.stringify(part)}==='thigh'?mid(P('hipR'),P('knR'),.5):${JSON.stringify(part)}==='neck'?mid(P('neck'),P('head'),.35):${JSON.stringify(part)}==='belly'?mid(P('pelvis'),P('chest'),.45):${JSON.stringify(part)}==='uarm'?mid(P('shR'),P('elR'),.25):null;
        if(p){ window.__game.aimAt(p); const eye=[PL.x,1.62,PL.z]; fireHand(HANDS.R,{o:eye,d:norm3(v3.sub(p,eye))}); } else { setAware(E,'see'); window.__game.aimAt(P('chest')); }
        E.atkCd=1e9; },900); })()`), [wpn, part, dist]);
    await page.waitForTimeout(900 + wait);
    await page.evaluate(() => window.__eval(`(()=>{ const E=window.__E,p=X_(E.B,PI_.pelvis),h=X_(E.B,PI_.chest); let best=null; for(const a of [3.14,2.4,3.9,1.6,4.7,.8,5.5,0]){ const q=[p[0]+Math.sin(a)*1.9,p[2]+Math.cos(a)*1.9],c=navCell(q[0],q[1]); if(c>=0&&!FLOOR.nav[c]&&sightClear([q[0],1.6,q[1]],[h[0],Math.max(h[1],.3),h[2]])){ best=q; break; } }
      if(best){ PL.x=best[0]; PL.z=best[1]; } window.__game.aimAt([ (p[0]+h[0])/2, (p[1]+h[1])/2, (p[2]+h[2])/2 ]); return E.st+' '+E.downMode+' blood '+Math.round(E.blood); })()`)).then(s => console.log(name, s));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/wound-${name}.png` }); await page.close();
  }
  await browser.close();
})();
