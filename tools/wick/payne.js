// Last Stand and the last bullet (92b-wick-payne.js), headless, on ?wick=1&play=1. usage: node tools/wick/payne.js [index.html]
const { launch, open } = require('../proto/lib.js');
(async () => { const b = await launch(); const { page, errs } = await open(b, process.argv[2] || 'index.html', 'wick=1&play=1', { wait: 1500 });
  const r = await page.evaluate(() => window.__eval(`(()=>{ window.requestAnimationFrame=()=>0; const dt=1/72,step=n=>{ for(let i=0;i<n;i++){ update(dt,performance.now()); updateWorld(world,null); } };
    const out={}; step(30); const men=enemies.filter(E=>!E.dead&&!E.ally); const A=men[0],B2=men[1];
    /* 1: a lethal hit, then you kill him: you get up */
    PL.hp=20; hurtPlayer(80,{E:A,kind:'gun'}); out.on=WLS.on; out.hp1=PL.hp; out.slow=GAME.slow; hurtPlayer(80,{E:B2,kind:'gun'}); out.immune=PL.hp===1&&!PL.dead;
    step(30); die(A); step(3); out.won=!WLS.on&&!PL.dead; out.hpAfter=PL.hp; out.ready=WLS.ready;
    /* 2: no charge left: the next lethal hit kills */
    PL.hp=10; hurtPlayer(80,{E:B2,kind:'gun'}); out.noCharge=PL.dead; PL.dead=false; PL.hp=100;
    /* 3: charge back on a beat, then time runs out */
    protoEmit('wickBeat',WICK_DIR.beat); out.recharged=WLS.ready; PL.hp=5; hurtPlayer(80,{E:B2,kind:'gun'}); step(Math.round(72*3.4)); out.timedOut=PL.dead&&!WLS.on;
    PL.dead=false; PL.hp=100;
    /* 4: the last bullet */
    WLS.lastShot={o:[PL.x,1.5,PL.z],d:[0,0,1],t:GAME.t,rt:performance.now()}; protoEmit('wickClear',WICK_DIR.beat); out.bullet=!!WLS.bullet; step(10); out.bulletVis=WKC_N&&WKC_N.vis; step(200); out.bulletDone=!WLS.bullet;
    return out; })()`));
  r.errors = errs.slice(0, 4); const pass = r.on && r.hp1 === 1 && r.immune && r.won && r.hpAfter >= 25 && !r.ready && r.noCharge && r.recharged && r.timedOut && r.bullet && r.bulletVis && r.bulletDone && !r.errors.length;
  console.log(JSON.stringify({ pass, ...r })); await b.close(); process.exit(pass ? 0 : 1); })();
