// Props review (agent H): boots ?propsdev=1 (every prop and item in a dark room, one bare bulb) and photographs each from 1-2 m.
//   node tools/harness/propshots.js index.html <outdir> [vr] [only=bed,tub] [hand]
//   vr: no vertex wobble or texture warp (what the headset shows). hand: also shots of items held the VR way.
// Steps the game by hand (__noRaf + __stepFrame) so every shot is the same. One Chrome; closes it when done.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2]), out = process.argv[3] || '/tmp/propshots', vr = process.argv.includes('vr'), hand = process.argv.includes('hand');
const only = ((process.argv.find(a => a.startsWith('only=')) || '').slice(5)).split(',').filter(Boolean);
/* per prop: [name, view options] (dist from its front, ty look-at height, tx/tz look-at offset, dx/dz camera offset, ly bulb height, low: eye height) */
const VIEWS = {
  bed: [['bed', { dist: 1.9, ty: .45, dx: 1.0 }], ['bed-under', { dist: .2, fz: 0, dx: 1.15, dz: -.2, ty: .22, tx: -.3, tz: 0, low: .3, lx: .9, ly: .7 }]],
  wardrobe: [['wardrobe', { dist: 2.4, ty: 1.0, dx: .5 }], ['wardrobe-in', { dist: .9, ty: 1.2, dx: -.25 }]], closet: [['closet', { dist: 2.4, ty: 1.1, dx: -.4 }]],
  kitchen: [['kitchen', { dist: 2.0, ty: .9 }]], fridge: [['fridge', { dist: 2.0, ty: .85, dx: .5 }]], shelf: [['shelf', { dist: 2.0, ty: .9, dx: .3 }]],
  mattresses: [['mattresses', { dist: 2.2, ty: .8, dx: 1.0 }]], tub: [['tub', { dist: 1.7, ty: .5, dx: .6 }], ['tub-in', { dist: .5, ty: .2, dx: -.5, tx: -.3 }]],
  pipeburst: [['pipeburst', { dist: 2.6, ty: 1.3, dx: .5 }]],
  exitchain: [['exitchain', { dist: 2.5, ty: 1.15, tx: .1 }], ['exitchain-chain', { dist: .55, ty: .95, tx: .38, dx: .4, ly: 1.9 }]],
  sofa: [['sofa', { dist: 2.2, ty: .45, dx: .8 }]], tv: [['tv', { dist: 1.5, ty: .7, dx: .4 }]], table: [['table', { dist: 1.9, ty: .5, dx: .4 }]],
  cardtable: [['cardtable', { dist: 1.2, ty: .55, dx: .3 }]], laundry: [['laundry', { dist: 2.6, ty: 1.0, dx: .3 }]], sheeting: [['sheeting', { dist: 2.4, ty: 1.3, dx: .6 }]],
  rebar: [['rebar', { dist: 2.0, ty: .6, dx: .3 }]]
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(file + '?propsdev=1', { timeout: 120000 }); await p.waitForTimeout(600); await p.click('#start'); await p.waitForTimeout(400);
  await p.addStyleTag({ content: '.hud,#intro,#msg,#lockHint,#sblood,#flash,#testPanel{display:none!important}' });
  await p.evaluate(vr => { window.__noRaf = true; window.__fixedDt = 1 / 60; window.__hand = { R: { p: [0, -40, 0] }, L: { p: [0, -40, 0] } }; window.__eval('twStairs=function(){}');
    if (vr) { const g = __eval('gl'), L = __eval('MAIN.loc'), o = g.uniform1f.bind(g); g.uniform1f = (l, v) => o(l, (l === L.uSnap || l === L.uAffine) ? 0 : v); } }, vr);
  await p.waitForTimeout(200); await p.evaluate(() => window.__stepFrame(90)); /* let the items settle */
  const list = await p.evaluate(() => window.__props.PDEV.list.map(q => ({ kind: q.kind, tris: q.tris })));
  const shot = async name => { await p.evaluate(() => window.__stepFrame(2)); await p.screenshot({ path: `${out}/props-${name}.png` }); console.log('shot', name); };
  for (let i = 0; i < list.length; i++) { const k = list[i].kind; if (!VIEWS[k] || (only.length && !only.includes(k))) continue;
    for (const [name, o] of VIEWS[k]) { await p.evaluate(([i, o]) => { const G = window.__game; G.PL.y = o.low ? o.low - 1.62 : 0; window.__props.view(i, o.dist, o); }, [i, o]); await shot(name); } }
  if (!only.length || only.includes('items')) {
    for (const [name, x0, x1, z] of [['items-a', -3.3, -1.6, 2.0], ['items-b', -1.5, .4, 2.0], ['items-c', -2.7, -.9, 2.6]]) {
      await p.evaluate(([x0, x1, z]) => { window.__game.PL.y = 0; window.__props.view({ x: (x0 + x1) / 2, z, yaw: 0, h: .1, d: 0 }, .7, { ty: 0, ly: 1.5, lz: -.25 }); }, [x0, x1, z]); await shot(name); }
    if (hand) for (const k of ['pan', 'hammer', 'pipe', 'cutter', 'knife', 'keys', 'medkit', 'rounds', 'strip']) {
      await p.evaluate(k => { const G = window.__game; G.PL.y = 0; window.__props.view({ x: -6, z: 2.6, yaw: 0, h: 1.2, d: 0 }, 1.2, { ty: 1.3, ly: 2.0 });
        window.__eval(`XR.on=true; equip(HANDS.R,newItem('${k}')); XR.on=false;`); const c = G.camBasis(), e = c.eye, f = c.f, r = c.r, u = c.u;
        /* held out to the side: the item's axis (hand +y) up and to the right, its flats (hand x) facing the camera */
        const nrm = v => { const l = Math.hypot(...v); return v.map(q => q / l); }, cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const Y = nrm([r[0] * .75 + u[0] * .66, r[1] * .75 + u[1] * .66, r[2] * .75 + u[2] * .66]), X = [-f[0], -f[1], -f[2]], Z = cr(X, Y);
        window.__hand = { R: { p: [e[0] + f[0] * .5 - r[0] * .12, e[1] - .14, e[2] + f[2] * .5 - r[2] * .12], f: Z, u: Y }, L: { p: [0, -40, 0] } };
        window.__props.light(e[0] + f[0] * .25 + r[0] * .35, e[2] + f[2] * .25 + r[2] * .35, 1.95, .8); }, k);
      await shot('hand-' + k); }
    await p.evaluate(() => { window.__hand = { R: { p: [0, -40, 0] }, L: { p: [0, -40, 0] } }; });
  }
  const tris = await p.evaluate(() => window.__props.itemTris());
  console.log('TRIS', JSON.stringify(Object.fromEntries(list.map(q => [q.kind, q.tris]))), JSON.stringify(tris));
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 8)) : 'no errors');
  await b.close();
})();
