// Boots the Wick pages with rendering on for a few seconds each and reports errors (one JSON line each; exit 1 on any error).
// usage: NODE_PATH=/opt/npm-tools/node_modules node tools/wick/boot.js index.html
const { launch, open } = require('../proto/lib.js');
const file = process.argv[2] || 'index.html';
const Q = ['wick=1', 'wick=1&art=1', 'wick=1&play=1', 'wick=1&stress=6&salert=1', 'proto=1'];
(async () => { const b = await launch(); let bad = 0;
  for (const q of Q) { let page = null, r;
    try { const o = await open(b, file, q, { wait: 4000 }); page = o.page;
      r = await page.evaluate(() => window.__eval(`({mode:FLOOR.mode,men:enemies.length,awake:enemies.filter(E=>!E.wkSleep&&!E.dead).length,beat:typeof WICK_DIR!=='undefined'&&WICK_DIR.beat?WICK_DIR.beat.name:null,t:+GAME.t.toFixed(1),wick:WICK.on})`));
      r.errors = o.errs.slice(0, 5); } catch (e) { r = { errors: [String(e).slice(0, 240)] }; }
    finally { if (page) await page.close().catch(() => {}); }
    if (r.errors.length || !(r.t > 0)) bad++; console.log(JSON.stringify({ boot: q, ...r })); }
  await b.close(); process.exit(bad ? 1 : 0); })();
