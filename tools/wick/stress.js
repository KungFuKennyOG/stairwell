// Stage 0 stress test: what N live gunmen cost. For each N it loads ?wick=1&stress=N&salert=1 (all of them awake, aware and
// fighting, you can't die), steps the game's own update() at 72 Hz with rendering off, and reports milliseconds per frame (all of
// update, and physics alone), then renders one real frame and counts draw calls.
// This sandbox's CPU is not a Quest 3: read the numbers as cost per man and how it grows. The real limit is the wrist FPS on the
// headset with the same URL.
// usage: node tools/wick/stress.js [index.html] [N list, default 0,4,8,12,16,20] [steps, default 360]
const { launch, open } = require('../proto/lib.js');
const [file = 'index.html', list = '0,4,8,12,16,20', steps = '360'] = process.argv.slice(2);
(async () => {
  const browser = await launch(); const rows = [];
  for (const n of list.split(',').map(Number)) {
    const { page, errs } = await open(browser, file, `wick=1&stress=${n}&salert=1`, { wait: 1500 });
    const r = await page.evaluate(([steps]) => window.__eval(`(()=>{
      window.requestAnimationFrame=()=>0; const Q=[]; window.setTimeout=(fn,ms)=>{ Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
      const P0=physics; let pt=0; physics=function(h){ const t=performance.now(); P0(h); pt+=performance.now()-t; };
      const dt=1/72; for(let i=0;i<60;i++){ update(dt,performance.now()); updateWorld(world,null); } pt=0; /* settle */
      const T=[]; for(let i=0;i<${steps};i++){ const t=performance.now(); update(dt,performance.now()); updateWorld(world,null); T.push(performance.now()-t);
        for(let k=Q.length-1;k>=0;k--) if(Q[k][0]<=GAME.t){ const f=Q[k][1]; Q.splice(k,1); try{ f(); }catch(_){} } }
      physics=P0; T.sort((a,b)=>a-b); const mean=T.reduce((a,b)=>a+b,0)/T.length;
      let draws=0; const g=gl,d1=g.drawElements.bind(g),d2=g.drawArrays.bind(g); g.drawElements=(...a)=>{ draws++; return d1(...a); }; g.drawArrays=(...a)=>{ draws++; return d2(...a); };
      let drawn=true; try{ frame(performance.now()); }catch(e){ drawn=String(e).slice(0,80); } g.drawElements=d1; g.drawArrays=d2;
      const live=enemies.filter(E=>!E.dead&&!E.asleep&&!E.dormant).length;
      return { people:enemies.length, live, dead:enemies.filter(E=>E.dead).length, msMean:+mean.toFixed(2), msP95:+T[Math.floor(T.length*.95)].toFixed(2), physMs:+(pt/${steps}).toFixed(2), draws, drawn, hp:PL.hp, playerDead:PL.dead };
    })()`), [steps]);
    r.n = n; r.errors = errs.slice(0, 3); rows.push(r); console.log(JSON.stringify(r)); await page.close();
  }
  const base = rows.find(r => r.n === 0), top = rows[rows.length - 1];
  if (base && top && top.n > 0) console.log(JSON.stringify({ perMan: { ms: +((top.msMean - base.msMean) / top.n).toFixed(3), physMs: +((top.physMs - base.physMs) / top.n).toFixed(3), draws: +((top.draws - base.draws) / top.n).toFixed(1) } }));
  await browser.close();
})();
