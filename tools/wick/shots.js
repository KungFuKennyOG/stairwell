// Art gate shots for the hitman prototype: ?wick=1&art=1, fixed cameras, one PNG each.
// usage: node tools/wick/shots.js [index.html] [outdir] [view names...]     env RES=720 (render height)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html'), out = process.argv[3] || '/tmp/wick-shots';
const only = process.argv.slice(4), RES = +(process.env.RES || 720);
// [name, eye x,y,z, look-at x,y,z, opts]
const VIEWS = require('./views.js');
(async () => {
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 400))); p.on('console', m => { if (m.type() === 'error' && !/fonts\./.test((m.location() || {}).url || '')) errs.push(m.text().slice(0, 300)); });
  await p.goto(file + '?wick=1&art=1' + (process.env.Q ? '&' + process.env.Q : ''), { timeout: 240000 }); await p.waitForFunction(() => window.__eval && window.__game, null, { timeout: 240000 });
  await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(800);
  await p.evaluate(r => window.__eval(`state.res=Math.max(state.res,${r}); document.body.classList.add('shot'); GAME.started=false; window.__DC={n:0}; (()=>{ const d=gl.drawElements.bind(gl); gl.drawElements=(m,c,t,o)=>{ __DC.n++; d(m,c,t,o); }; })()`), RES);
  await p.addStyleTag({ content: '#hud,.hud,#labels,#intro,.topbtns,#floorTag,#touch,header,.bark,#ammo,#hpbar,.card{display:none!important} body>*:not(canvas){visibility:hidden!important} canvas{visibility:visible!important}' });
  for (const [name, e, t, o] of VIEWS) { if (only.length && !only.includes(name)) continue;
    await p.evaluate(([e, t, o]) => window.__eval(`(()=>{ const d=[${t[0]}-(${e[0]}),${t[1]}-(${e[1]}),${t[2]}-(${e[2]})],l=Math.hypot(d[0],d[1],d[2]); PL.x=${e[0]}; PL.z=${e[2]}; PL.y=${e[1]}-1.62; PL.yaw=Math.atan2(-d[0],-d[2]); PL.pitch=Math.asin(d[1]/l); window.__wkShot=${JSON.stringify(o || {})}; if(typeof wkShotSet==='function') wkShotSet(window.__wkShot); })()`), [e, t, o || {}]);
    await p.waitForTimeout(700);
    const dc = await p.evaluate(() => window.__eval(`new Promise(r=>requestAnimationFrame(()=>{ __DC.n=0; requestAnimationFrame(()=>r(__DC.n)); }))`));
    await p.screenshot({ path: `${out}/${name}.png` }); console.log(name, 'draws', dc); }
  console.log(errs.length ? 'ERRORS ' + JSON.stringify([...new Set(errs)].slice(0, 6)) : 'no errors'); await b.close(); })();
