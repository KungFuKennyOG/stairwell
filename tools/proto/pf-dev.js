// Floor 01 prototype dev check: boot ?proto=1&pfdev=1 in one headless Chrome, report console errors, the floor's own checks
// (reachability, sightlines, hiding-spot spacing), the map. usage: node tools/proto/pf-dev.js index.html [map] [sight]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html'); const want = new Set(process.argv.slice(3));
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 480, height: 270 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 400))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await p.goto(file + '?proto=1&pfdev=1', { timeout: 240000 }); await p.waitForTimeout(1500); await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(2000);
  const r = await p.evaluate(w => { const E = window.__eval; const o = { mode: E('FLOOR.mode'), cast: E('enemies.map(E=>E.name+"@"+E.pos.map(v=>v.toFixed(1)).join(","))'), check: E('pfCheck()') };
    if (w.includes('sight')) { o.sight = E('pfSightCheck()'); o.sightSheets = E('pfSightCheck({sheets:true})'); }
    if (w.includes('map')) o.map = E('pfMap()'); return o; }, [...want]);
  console.log(JSON.stringify({ mode: r.mode, cast: r.cast, sight: r.sight, sightSheets: r.sightSheets }, null, 0));
  console.log(JSON.stringify(r.check, null, 0)); if (r.map) console.log(r.map);
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 12), null, 1) : 'no errors'); await b.close(); })();
