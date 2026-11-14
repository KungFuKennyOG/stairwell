// Floor 01 prototype screenshots from inside the rooms, plus draw calls and triangles per view.
// usage: node tools/proto/pf-shots.js index.html <outdir> [view names...]   (one headless Chrome; views: see VIEWS)
// also: node tools/proto/pf-shots.js index.html <outdir> --old   (old floor 01 corridor and a flat, for the draw-call comparison)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html'), out = process.argv[3] || '/tmp';
const args = process.argv.slice(4), old = args.includes('--old'), live = args.includes('--live'), only = args.filter(a => !a.startsWith('--'));
// [name, from x,z, look-at x,z, eye pitch]
const VIEWS = [
  ['landing', -12.6, -8.9, -11, -6.4, 0], ['landing-shaft', -11.2, -8.2, -16.5, -8.6, -.05], ['front-room', -6.5, -1.7, -10.8, -4.6, -.05],
  ['hall-west', -7.6, -.2, 0, 0, 0], ['hall-east', 7.6, .3, 0, -.2, 0], ['tv-room', -4.9, -1.9, -2.2, -4.6, -.1], ['chela-kitchen', 3.0, -1.9, .9, -2.6, -.05],
  ['flooded', 8.7, -1.8, 11.6, -4.6, -.08], ['dani-kitchen', -8.9, 1.8, -11.4, 3.8, -.05], ['kev-room', -2.4, 4.6, -3.4, 11.6, 0], ['card-room', -1.0, 8.2, .9, 9.6, -.1],
  ['laundry', 3.6, 7.0, 7.4, 10.4, 0], ['gutted', 8.3, 1.7, 10.4, 4.6, 0], ['stair-door', 10.4, 8.6, 13, 9.9, 0], ['storeroom', 9.2, -7.1, 6.0, -10.6, -.05], ['bedroom', -6.6, -7.0, -8.8, -10.6, -.1],
  ['chela-bedroom', 1.6, -7.0, -2.0, -10.6, -.05], ['mario', -.9, 9.2, .75, 7.95, -.15], ['tenants', 1.0, 2.0, 2.8, 4.8, 0], ['bathroom', -2.1, -6.6, -2.8, -8.8, -.25], ['back-room', -8.6, 6.9, -6.6, 10.6, -.1] ];
const OLD = [['old-hall', -14.6, -.4, 0, 0, 0], ['old-kitchen', -7.3, 1.6, -8.5, 5.0, -.05]];
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(file + (old ? '?f=1' : '?proto=1&pfdev=1'), { timeout: 240000 }); await p.waitForTimeout(1500); await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__eval(`(()=>{ window.__DC={n:0,t:0,f:0}; const d=gl.drawElements.bind(gl); gl.drawElements=(m,c,t,o)=>{ __DC.n++; __DC.t+=c/3; d(m,c,t,o); };
    let tot=0,meshes=0; (function w(n){ if(n.mesh){ meshes++; tot+=n.mesh.geo.I.length/3; } for(const k of n.kids) w(k); })(floorN); window.__STATIC={meshes,tris:Math.round(tot)}; })()`)); if (!live) await p.evaluate(() => window.__eval('GAME.started=false'));
  const st = await p.evaluate(() => window.__STATIC); console.log('static floor geometry', JSON.stringify(st));
  for (const [name, x, z, tx, tz, pitch] of (old ? OLD : VIEWS)) { if (only.length && !only.includes(name)) continue;
    await p.evaluate(([x, z, tx, tz, pitch]) => window.__eval(`PL.x=${x}; PL.z=${z}; PL.yaw=Math.atan2(-((${tx})-(${x})),-((${tz})-(${z}))); PL.pitch=${pitch};`), [x, z, tx, tz, pitch]);
    await p.waitForTimeout(900);
    const dc = await p.evaluate(() => window.__eval(`(()=>{ __DC.n=0; __DC.t=0; return new Promise(r=>requestAnimationFrame(()=>{ __DC.n=0; __DC.t=0; requestAnimationFrame(()=>r({calls:__DC.n,tris:Math.round(__DC.t)})); })); })()`));
    await p.screenshot({ path: `${out}/floor-${name}.png` }); console.log(name, JSON.stringify(dc)); }
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 8)) : 'no errors'); await b.close(); })();
