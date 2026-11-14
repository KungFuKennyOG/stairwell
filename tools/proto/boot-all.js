// Boots every level of the old game and the prototype, lets each run a few seconds with rendering on, and reports console errors.
// One JSON line per level, then a summary line; exit code 1 if any level errored or didn't load.
// usage: node tools/proto/boot-all.js <index.html> [only: comma-separated names, e.g. "f=1,proto"]
const { launch, open } = require('./lib.js');
const [file, only] = process.argv.slice(2);
const T = [
  ...Array.from({ length: 16 }, (_, f) => ({ name: 'f=' + f, q: 'f=' + f, want: 'camp' })), // the lobby and floors 01-15
  { name: 'motel', q: '', click: '[data-lvl="motel"]', want: 'motel' },
  { name: 'stash', q: '', click: '[data-lvl="test"]', want: 'stash' }, // the test levels start here
  { name: 'tunnel', q: '', click: '[data-lvl="test"]', ev: 'goTunnel()', want: 'tunnel' },
  { name: 'warehouse', q: '', click: '[data-lvl="test"]', ev: 'goWare()', want: 'ware' },
  { name: 'proto', q: 'proto=1', proto: true }, // agent F's floor once merged, the old floor 01 before
  { name: 'proto-old', q: 'proto=1&pf=0', want: 'camp', proto: true },
].filter(t => !only || only.split(',').includes(t.name));
(async () => {
  const browser = await launch(); let bad = 0; const rows = [];
  for (const t of T) { let r, page = null;
    try { const o = await open(browser, file, t.q, { click: t.click, wait: 2500 }); page = o.page;
      if (t.ev) { await page.evaluate(s => window.__eval(s), t.ev); await page.waitForTimeout(2500); }
      r = await page.evaluate(() => window.__eval(`({mode:FLOOR.mode,floor:FLOOR.def&&FLOOR.def.n,people:enemies.length,proto:PROTO.on,where:SHELL.where,t:+GAME.t.toFixed(1)})`));
      r.errors = o.errs.slice(0, 6);
    } catch (e) { r = { errors: [String(e).slice(0, 240)], timeout: /TIMEOUT/.test(String(e)) }; }
    finally { if (page) await page.close().catch(() => {}); }
    const ok = !r.errors.length && (!t.want || r.mode === t.want) && (!t.proto || r.proto) && r.t > 0;
    if (!ok) bad++; rows.push({ name: t.name, ok, ...r }); console.log(JSON.stringify({ boot: t.name, ok, ...r }));
  }
  console.log(JSON.stringify({ bootSummary: true, levels: rows.length, failed: rows.filter(r => !r.ok).map(r => r.name) }));
  await browser.close(); process.exit(bad ? 1 : 0);
})();
