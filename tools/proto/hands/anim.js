const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); await p.goto('file:///home/claude/stairwell/index.html?proto=1'); await p.waitForTimeout(1500); await p.click('#start'); await p.waitForTimeout(600);
  await p.addStyleTag({ content: '#tl,#br,#xhair,#lockHint,#touch,#err,#msg,#bResetT,#vrBtnT,#bSlowT,#guide{display:none!important}' });
  const src = fs.readFileSync('/home/claude/hands/bench.js', 'utf8'); const m = src.match(/await ev\(`([\s\S]*?)`\);\n  const VIEWS/); await p.evaluate(x => window.__eval(x), m[1]);
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  const TL = t => { const tt = t % 7; let g = 0, tr = 0, th = false, lab = 'Relaxed: nothing pressed';
    if (tt >= 1 && tt < 2.2) { g = lerp(0, 1, (tt - 1) / .5); th = true; lab = 'Grip: three fingers close, the index points'; }
    else if (tt >= 2.2 && tt < 3.4) { g = 1; tr = lerp(0, 1, (tt - 2.2) / .4); th = true; lab = 'Grip + trigger: a fist'; }
    else if (tt >= 3.4 && tt < 4.6) { g = 1; tr = 1; th = false; lab = 'Thumb off the buttons: thumb up'; }
    else if (tt >= 4.6 && tt < 5.8) { g = lerp(1, 0, (tt - 4.6) / .5); tr = lerp(1, .5, (tt - 4.6) / .5); th = false; lab = 'Half a trigger: the index curls on its own'; }
    return { g, tr, th, lab }; };
  for (const [name, o, clip] of [['side', { view: 'palm', d: .36 }, { x: 240, y: 0, width: 800, height: 720 }], ['fp', { view: 'fp', arms: true }, { x: 240, y: 60, width: 800, height: 600 }], ['back', { view: 'back', d: .36 }, { x: 240, y: 0, width: 800, height: 720 }]]) {
    await p.evaluate(x => window.__eval(x), `BENCH(${JSON.stringify(o)})`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-vf', 'scale=800:600:force_original_aspect_ratio=decrease,pad=800:600:(ow-iw)/2:(oh-ih)/2', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', `_${name}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    const labs = [];
    for (let i = 0; i < 210; i++) { const s = TL(i / 30); labs.push(s.lab);
      await p.evaluate(x => window.__eval(x), `for(const h of [HANDS.R,HANDS.L]){ h.trigV=${s.tr}; h.gripV=${s.g}; h.thumbT=${s.th}; } PL.hp=100; window.__stepFrame(1); 1`);
      const jpg = await p.screenshot({ type: 'jpeg', quality: 92, clip }); if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(`_${name}.mp4`, `a-${name}.mp4`); fs.writeFileSync('labs.json', JSON.stringify(labs)); console.log(name, 'done'); }
  await b.close(); })();
