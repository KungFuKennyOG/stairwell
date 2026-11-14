// Smoke test: boot each floor, count the cast, catch console errors, grab a screenshot.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const game = 'file://' + process.argv[2];
const out = process.argv[3];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 300)));
  const res = [];
  for (let f = 0; f <= 15; f++) {
    errs.length = 0;
    await page.goto(game + '?f=' + f);
    await page.waitForTimeout(600);
    await page.click('#start');
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const G = window.__game, E = G.enemies();
      return {
        idx: G.FLOOR.idx, name: G.FLOOR.def && G.FLOOR.def.name, len: G.FLOOR.def && G.FLOOR.def.len,
        pl: [+G.PL.x.toFixed(1), +G.PL.z.toFixed(1)], hp: G.PL.hp,
        n: E.length, civ: E.filter(e => e.civ).length, hidden: E.filter(e => e.concealed).length,
        kinds: E.map(e => e.name + ':' + e.kind + (e.civ ? '(civ)' : '') + (e.concealed ? '(hid)' : '')).join(', '),
        right: G.HANDS.R.item && G.HANDS.R.item.kind, err: document.getElementById('err').hidden ? null : document.getElementById('err').textContent
      };
    });
    await page.screenshot({ path: path.join(out, 'floor' + String(f).padStart(2, '0') + '.png') });
    res.push({ f, ...info, errs: errs.slice(0, 5) });
  }
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
