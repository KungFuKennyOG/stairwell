// The floor 01 prototype bots. Each run gets a fresh page; one JSON line per run on stdout (the run's telemetry record in .stats).
// usage: node tools/proto/bots.js <index.html> <walk|fetch|pistol|stand|sneak> [runs=1] [query=proto=1] [json opts]
//   walk    straight to the exit, touching nobody                     (plan 10: can't leave under 90 s)
//   fetch   straight to the cutter/keys if one lies on the floor, then the exit (info: shortest honest run)
//   pistol  0.6 s reaction, 3 degrees of error, a shot per 0.3 s       (plan 10: dies in 25-50% of 20 runs)
//   stand   fires 3 shots, then stands in the nearest dark spot       (plan 5.5: found within 20 s)
//   sneak   moves only when no man within 8 m sees its route, hides when a hunter comes (HIDES if there are any)
// opts: {"maxT":300,"react":.6,"sigma":3,"gap":.3}
const { launch, open, CORE } = require('./lib.js');
const [file, bot = 'walk', runsArg = '1', q = 'proto=1', optsArg = '{}'] = process.argv.slice(2);
const runs = +runsArg, opts = JSON.parse(optsArg);
if (!file) { console.error('usage: node tools/proto/bots.js <index.html> <bot> [runs] [query] [opts]'); process.exit(2); }
(async () => {
  const browser = await launch();
  for (let i = 0; i < runs; i++) {
    const t0 = Date.now(); let res, page = null;
    try { const o = await open(browser, file, q); page = o.page;
      await page.evaluate(s => window.__eval(s), CORE);
      res = await page.evaluate(([b, o]) => { try { return window.__PB.run(b, o); } catch (e) { return { ERR: String(e && e.stack || e).slice(0, 500) }; } }, [bot, opts]);
      if (o.errs.length) res.errors = o.errs.slice(0, 8);
    } catch (e) { res = { ERR: String(e).slice(0, 300), timeout: /TIMEOUT/.test(String(e)) }; }
    finally { if (page) await page.close().catch(() => {}); }
    Object.assign(res, { bot, i: i + 1, q, wall: +((Date.now() - t0) / 1000).toFixed(1) });
    console.log(JSON.stringify(res));
  }
  await browser.close();
})();
