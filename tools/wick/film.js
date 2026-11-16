// A playthrough film of ?wick=1&play=1: a simple bot plays the beats (kitchen quiet with the suppressor, the main room loud, the
// office), rendered through the game's own flat-screen frame, one JPEG per frame into ffmpeg.
// usage: node tools/wick/film.js [index.html] [out.mp4]   env: SEC=50 FPS=24 RES=540 W=960 H=540
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process'); const path = require('path');
const file = 'file://' + path.resolve(process.argv[2] || 'index.html'), out = process.argv[3] || '/tmp/wick-play.mp4';
const SEC = +(process.env.SEC || 50), FPS = +(process.env.FPS || 24), RES = +(process.env.RES || 540), W = +(process.env.W || 960), H = +(process.env.H || 540);
const BOT = `(()=>{ window.__fixedDt=1/${FPS}; window.__noRaf=true; const B={t:0,cd:0,slowT:-1,aimP:null,stuck:0,last:[0,0],log:[]};
  const eye=()=>camBasis().eye,alive=()=>enemies.filter(E=>!E.dead&&!E.ally&&!E.civ&&!E.wkSleep&&!E.surr);
  const turnTo=(p,k)=>{ const e=eye(),d=v3.sub(p,e),yaw=Math.atan2(-d[0],-d[2]),pit=Math.atan2(d[1],Math.hypot(d[0],d[2])); let dy=Math.atan2(Math.sin(yaw-PL.yaw),Math.cos(yaw-PL.yaw)); PL.yaw+=dy*k; PL.pitch+=(pit-PL.pitch)*k; return Math.abs(dy)+Math.abs(pit-PL.pitch); };
  window.__wkFilmTick=()=>{ const dt=1/${FPS}; B.t+=dt; B.cd-=dt; PL.hp=Math.max(PL.hp,60); if(PL.dead){ PL.dead=false; PL.hp=100; }
    const it=HANDS.R.item; if(it&&it.ammo<3&&it.reload<=0){ it.ammo=WPN[it.key].mag; }
    const e=eye(); let tgt=null,bd=1e9; for(const E of alive()){ const h=X_(E.B,PI_.head),d=Math.hypot(h[0]-e[0],h[2]-e[2]); if(d<16&&d<bd&&sightClear(e,h)){ bd=d; tgt=E; } }
    KEYS.KeyW=false; stick.dy=0;
    if(tgt){ const body=B.body??(B.body=Math.random()<.35),p=body?X_(tgt.B,PI_.chest):X_(tgt.B,PI_.head),err=turnTo(p,.16);
      if(WICK_DIR.loud&&B.slowT<0&&bd<9&&WICK_BT.t>2){ toggleSlow(); B.slowT=1.6; } /* bullet time once a fight is on */
      if(err<.06&&B.cd<=0&&it){ const q=v3.add(p,[(Math.random()-.5)*.05,(Math.random()-.5)*.05,(Math.random()-.5)*.05]); fireHand(HANDS.R,{o:e,d:norm3(v3.sub(q,e))}); B.cd=.3+Math.random()*.25; B.body=null; } }
    else { const near=alive().sort((a,b)=>Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(b.pos[0]-PL.x,b.pos[1]-PL.z))[0]; const mk=typeof wickMarker==='function'?wickMarker():null,m=near?{x:near.pos[0],z:near.pos[1]}:mk; /* go to the nearest man you can't see yet, else the beat's marker */ if(m){ const d=navTo(PL.x,PL.z,m.x,m.z),yaw=Math.atan2(-d[0],-d[2]); let dy=Math.atan2(Math.sin(yaw-PL.yaw),Math.cos(yaw-PL.yaw)); PL.yaw+=dy*.2; PL.pitch*=.85; KEYS.KeyW=Math.abs(dy)<.9; } }
    if(B.slowT>=0){ B.slowT-=dt; if(B.slowT<0&&GAME.slow) toggleSlow(); }
    window.__stepFrame(1); return {t:+B.t.toFixed(1),beat:WICK_DIR.beat&&WICK_DIR.beat.name,loud:WICK_DIR.loud,alive:alive().length,done:!!WICK_DIR.done}; }; })()`;
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: W, height: H } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  await p.addInitScript(() => { let s = 4242; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  await p.goto(file + '?wick=1&play=1', { timeout: 240000 }); await p.waitForFunction(() => window.__eval && window.__game, null, { timeout: 240000 });
  await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(500);
  await p.addStyleTag({ content: '#tl,#xhair,#lockHint,#touch,#err,#msg,#bResetT,#vrBtnT,#bSlowT,.topbtns,#floorTag,#labels{display:none!important}' });
  await p.evaluate(r => window.__eval(`state.res=${r}; window.requestAnimationFrame=()=>0;`), RES); await p.evaluate(s => window.__eval(s), BOT);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out]);
  const n = SEC * FPS, t0 = Date.now(); let info, doneAt = -1;
  for (let i = 0; i < n; i++) { info = await p.evaluate(() => window.__eval('__wkFilmTick()'));
    const jpg = await p.screenshot({ type: 'jpeg', quality: 88 }); if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (FPS * 5) === 0) console.log(i, JSON.stringify(info), ((Date.now() - t0) / 1000).toFixed(0) + 's');
    if (info.done && doneAt < 0) doneAt = i; if (doneAt >= 0 && i - doneAt > FPS * 3) break; }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('wrote', out, JSON.stringify(info), errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 4)) : 'no errors'); await b.close(); })();
