// One continuous run: lobby prologue, then walk to the stairs on every floor until the roof. Checks the game chains end to end.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs');
const game = 'file://' + process.argv[2];
const IN_PAGE = fs.readFileSync(__dirname + '/bot.js', 'utf8').split('const IN_PAGE = `')[1].split('`;')[0];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } }); const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  await page.goto(game + '?f=0'); await page.waitForTimeout(400); await page.click('#start'); await page.waitForTimeout(300);
  await page.evaluate(s => window.__eval(s), IN_PAGE);
  const res = await page.evaluate(() => window.__eval(`(()=>{ const dt=1/30,t0=GAME.t,trace=[]; let last=-1,guard=0;
    const step=()=>{ update(dt,performance.now()); if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due) q[1](); } };
    while(GAME.t-t0<900&&guard++<40000){ KEYS.KeyW=false;
      if(FLOOR.idx!==last){ last=FLOOR.idx; trace.push([FLOOR.def.name,+(GAME.t-t0).toFixed(0),HANDS.R.item&&HANDS.R.item.key,Math.round(PL.hp)]); }
      if(PL.dead){ trace.push(['DIED on '+FLOOR.def.name,+(GAME.t-t0).toFixed(0)]); for(let k=0;k<130;k++) step(); continue; }
      if(GAME.atTop) break;
      const pro=FLOOR.def.pro&&FLOOR.pro&&FLOOR.pro.phase!=='alone';
      if(!pro&&!GAME.climbing){ if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; PL.pitch=0; KEYS.KeyW=true; } else { const d=navTo(PL.x,PL.z,TL+.1,0); PL.yaw=Math.atan2(-d[0],-d[2]); KEYS.KeyW=true; } }
      step(); }
    KEYS.KeyW=false; return {total:+(GAME.t-t0).toFixed(0),trace,atTop:!!GAME.atTop,msgH:$('msgH').textContent,msgP:$('msgP').textContent,saved:localStorage.getItem('stairwell.camp')}; })()`));
  console.log(JSON.stringify(res)); if (errs.length) console.log('ERRORS', errs);
  await browser.close();
})();
