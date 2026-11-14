// Stairwell floor 01 prototype: scripted headless film.
// usage: node tools/proto/film/film.js index.html <outdir> <preview|full> [scene names...]   (seeded: each scene plays the same take every time)
//   preview: every 10th frame as JPEG stills in outdir/<scene>/ (to look at before rendering)
//   full:    every frame piped to ffmpeg, one mp4 per scene in outdir/<scene>.mp4
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const file = 'file://' + path.resolve(process.argv[2]), out = process.argv[3], mode = process.argv[4] || 'preview';
const only = process.argv.slice(5);
const W = 1280, H = 720, FPS = 30, EVERY = mode === 'full' ? 1 : 10;
const SCENES = fs.readFileSync(path.join(__dirname, 'scenes.js'), 'utf8');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.addInitScript(() => { let s = 1234567; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  await p.goto(file + '?proto=1', { timeout: 240000 });
  await p.waitForTimeout(1500); await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(600);
  await p.addStyleTag({ content: '#tl,#br,#xhair,#lockHint,#touch,#err,#msg,#bResetT,#vrBtnT,#bSlowT{display:none!important}' });
  await p.evaluate(s => window.__eval(s), SCENES); if (process.env.DBG) await p.evaluate(s => window.__eval(s), fs.readFileSync(process.env.DBG,'utf8'));
  const list = await p.evaluate(() => window.__eval('FILM.list()'));
  for (const name of list) {
    if (only.length && !only.includes(name)) continue;
    const dur = await p.evaluate(n => window.__eval(`FILM.begin(${JSON.stringify(n)})`), name);
    const n = Math.round(dur * FPS); let ff = null, tmp = null;
    if (mode === 'full') { tmp = path.join(out, `_${name}.mp4`);
      const LABELS = { hall: 'Floor 01 prototype  /  the hall', standoff: 'The two hunters: guns up, spreading out', hunt: 'Hiding behind the sofa: the flashlight pair searches', melee: 'A pipe, from behind', gun: "Gunfight in the tenants' flat", exit: 'Bolt cutter on the chained door' };
      const lab = (LABELS[name] || name).replace(/'/g, '\u2019').replace(/:/g, '\\:');
      const vf = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:text='${lab}':fontsize=22:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=8:x=28:y=h-56:alpha='if(lt(t,2.6),1,max(0,1-(t-2.6)/0.4))':enable='lt(t,3)'`;
      ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-vf', vf, '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp], { stdio: ['pipe', 'inherit', 'inherit'] }); }
    else fs.mkdirSync(path.join(out, name), { recursive: true });
    const t0 = Date.now(); let info = null;
    for (let i = 0; i < n; i++) {
      info = await p.evaluate(() => window.__eval('FILM.tick()'));
      if (i % EVERY === 0) { const jpg = await p.screenshot({ type: 'jpeg', quality: 92 });
        if (ff) { if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r)); }
        else fs.writeFileSync(path.join(out, name, String(i).padStart(4, '0') + '.jpg'), jpg); }
    }
    if (ff) { ff.stdin.end(); const code = await new Promise(r => ff.on('close', r)); if (code === 0) fs.renameSync(tmp, path.join(out, `${name}.mp4`)); else console.log(name, 'ffmpeg exit', code); }
    console.log(name, n, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's', JSON.stringify(info));
  }
  if (process.env.DBG) console.log('DBG', JSON.stringify(await p.evaluate(() => window.__eval('window.__ML'))));
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 8)) : 'no errors');
  await b.close();
})();
