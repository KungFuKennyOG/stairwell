// Stand 1.6 m in front of a named man on a floor, look at him, and take a screenshot.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const game = 'file://' + process.argv[2], out = process.argv[3];
const SHOTS = [[1, 'Dani', 1.5], [4, 'Emilio', 1.5], [10, 'Ceci', 2.6], [15, 'Don Aurelio', 1.7], [14, 'Rayo', 5.5], [6, 'Profe', 2.2]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  for (const [f, name, dist] of SHOTS) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    await page.goto(game + '?f=' + f); await page.waitForTimeout(500); await page.click('#start'); await page.waitForTimeout(800);
    const ok = await page.evaluate(([name, dist]) => { const G = window.__game, E = G.enemies().find(e => e.name === name); if (!E) return false;
      const f = [Math.sin(E.hd), Math.cos(E.hd)]; let best = null;
      for (const a of [0, .6, -.6, 1.2, -1.2, 2.2, -2.2, 3.14]) { const c = Math.cos(a), s = Math.sin(a), d = [f[0] * c - f[1] * s, f[0] * s + f[1] * c], p = [E.pos[0] + d[0] * dist, E.pos[1] + d[1] * dist];
        if (window.__eval(`(()=>{ const c=navCell(${p[0]},${p[1]}); return c>=0&&!FLOOR.nav[c]&&sightClear([${p[0]},1.6,${p[1]}],[${E.pos[0]},1.5,${E.pos[1]}]); })()`)) { best = p; break; } }
      if (!best) return false; G.PL.x = best[0]; G.PL.z = best[1]; G.aimAt(G.X_(E.B, G.PI_.chest)); return true; }, [name, dist]);
    await page.waitForTimeout(1500);
    await page.evaluate(name => { const G = window.__game, E = G.enemies().find(e => e.name === name); if (E) G.aimAt(G.X_(E.B, G.PI_.neck)); }, name);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/close-${String(f).padStart(2, '0')}-${name.replace(/\W/g, '')}.png` });
    console.log(f, name, ok); await page.close();
  }
  await browser.close();
})();
