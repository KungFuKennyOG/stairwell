// Quick boot check: load each URL query given, click start, report console errors and the cast. node tools/harness/boot.js index.html "f=1" "f=1&proto=1"
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2]); const qs = process.argv.slice(3);
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  let bad = 0;
  for (const q of qs) { const p = await b.newPage({ viewport: { width: 640, height: 360 } }); const errs = [];
    p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
    await p.goto(file + '?' + q); await p.waitForTimeout(500); await p.click('#start'); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const G = window.__game; return { mode: G.FLOOR.mode, n: G.enemies().length, proto: window.__eval('PROTO.on') }; });
    console.log(q, JSON.stringify(r), errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 5)) : 'no errors'); bad += errs.length; await p.close(); }
  await b.close(); process.exit(bad ? 1 : 0); })();
