// sightline report for the prototype floor: node tools/proto/_sight.js index.html [sheets]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html'); const sheets = process.argv[3] === 'sheets';
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 320, height: 180 } }); const errs=[]; p.on('pageerror', e => errs.push(String(e).slice(0, 400)));
  await p.goto(file + '?proto=1&pfdev=1', { timeout: 240000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(sh => window.__eval('(()=>{ const o={pairs:{},over:11.5,sheets:'+sh+'}; const s=pfSightCheck(o); const P=Object.entries(o.pairs).sort((a,b)=>b[1].d-a[1].d); return {max:s.max.d,hall:s.hallOnly.d,hist:s.hist,pairs:P.slice(0,40)}; })()'), sheets);
  console.log('sheets', sheets, 'max', r.max, 'hall', r.hall, r.hist); for (const [k,v] of r.pairs) console.log(k.padEnd(8), v.d, JSON.stringify(v.from), JSON.stringify(v.to), v.deg); console.log(errs); await b.close(); })();
