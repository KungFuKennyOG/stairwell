// Headless play bot for Stairwell. Steps the game's own update() (no rendering) and plays each floor in a given style.
// usage: node bot.js <index.html> <mode: loud|sprint|pro|talk> [floors e.g. 1-15] [weapon key] [runs]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const game = 'file://' + process.argv[2], mode = process.argv[3] || 'loud';
const [f0, f1] = (process.argv[4] || '1-15').split('-').map(Number);
const weapon = process.argv[5] && process.argv[5] !== '-' ? process.argv[5] : null, runs = +(process.argv[6] || 1);

const IN_PAGE = `
window.requestAnimationFrame=()=>0; /* stop the render loop: the bot steps update() itself */
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; }; /* the game's timers (hearing delays, pump, reload) run on game time, since the bot steps faster than the clock */
window.__B=(function(){
  const LOG={barks:[],dmg:0,hits:0,shots:0};
  const _bark=bark; bark=function(E,txt,d){ LOG.barks.push([+GAME.t.toFixed(1),E&&E.name,txt]); return _bark.apply(this,arguments); };
  const _hurt=hurtPlayer; hurtPlayer=function(d){ LOG.dmg+=d; LOG.hits++; return _hurt.apply(this,arguments); };
  const gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const out=E=>E.dead||E.st==='down'||E.surr||E.st==='kneel';
  const obvious=E=>!E.civ&&!E.ally&&(E.wpnHeld||E.aware||!E.concealed);
  const S={seen:new Map(),nextShot:0,stuckT:0,lastP:[0,0],jit:0};
  function walk(tx,tz){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; KEYS.KeyW=true; }
  function step(dt){ update(dt,performance.now()); if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ LOG.err=(LOG.err||'')+String(e).slice(0,120); } } }
    S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&KEYS.KeyW?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
  /* loud: go to the nearest man who is plainly one of them, shoot him when you can see him, leave when nobody's left standing */
  function loud(maxT,sigma,react,gap){ react=react??.4; gap=gap??.22; const dt=1/30,t0=GAME.t; let deaths=0,minHp=100,exitT=null,aliveT=0; const R={};
    while(GAME.t-t0<maxT){
      if(PL.dead){ deaths++; R.diedAt=R.diedAt||+(GAME.t-t0).toFixed(1); if(deaths>=3) break; for(let k=0;k<130;k++) step(dt); S.seen.clear(); continue; }
      minHp=Math.min(minHp,PL.hp); KEYS.KeyW=false;
      if(GAME.climbing){ exitT=GAME.t-t0; break; }
      const eye=[PL.x,1.62,PL.z];
      const T=enemies.filter(E=>obvious(E)&&!out(E)).map(E=>({E,d:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)})).sort((a,b)=>a.d-b.d);
      const vis=T.find(o=>o.d<16&&sightClear(eye,X_(o.E.B,PI_.head)));
      if(vis){ const E=vis.E; if(!S.seen.has(E)) S.seen.set(E,GAME.t);
        const ch=X_(E.B,PI_.chest),nk=X_(E.B,PI_.neck),p=[(ch[0]+nk[0])/2,(ch[1]+nk[1])/2,(ch[2]+nk[2])/2]; window.__game.aimAt(p);
        if(GAME.t-S.seen.get(E)>react&&GAME.t>=S.nextShot&&HANDS.R.item){ const d=norm3(v3.sub(p,eye)),e=sigma*Math.PI/180,dd=norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e]);
          if(fireHand(HANDS.R,{o:eye,d:dd})){ LOG.shots++; S.nextShot=GAME.t+gap; } } }
      else if(T.length){ walk(T[0].E.pos[0],T[0].E.pos[1]); }
      else { if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; } else walk(TL+.1,0); }
      step(dt); }
    KEYS.KeyW=false;
    const bad=enemies.filter(E=>!E.civ&&!E.ally),civ=enemies.filter(E=>E.civ);
    return Object.assign(R,{floor:FLOOR.def.n,time:+(GAME.t-t0).toFixed(1),exit:exitT!=null,deaths,minHp:Math.round(minHp),dmg:Math.round(LOG.dmg),hitsTaken:LOG.hits,shots:LOG.shots,
      hostile:bad.length,dead:bad.filter(E=>E.dead).length,downAlive:bad.filter(E=>!E.dead&&out(E)).length,untouched:bad.filter(E=>!E.dead&&!out(E)).map(E=>E.name+(E.concealed&&!E.wpnHeld?'(never drew)':'')),
      states:bad.filter(E=>!E.dead).map(E=>E.name+':'+E.st+(E.surr?'/surr':'')+(E.aware?'/aware':'')).join(' '),civ:civ.length,civDead:civ.filter(E=>E.dead).length,barks:LOG.barks.length}); }
  /* sprint: walk straight for the stairs up and touch nobody */
  function sprint(maxT){ const dt=1/30,t0=GAME.t; let minHp=100,died=false,exitT=null;
    while(GAME.t-t0<maxT){ if(PL.dead){ died=true; break; } minHp=Math.min(minHp,PL.hp); if(GAME.climbing){ exitT=GAME.t-t0; break; }
      if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; } else walk(TL+.1,0); step(dt); }
    KEYS.KeyW=false; const bad=enemies.filter(E=>!E.civ&&!E.ally);
    return {floor:FLOOR.def.n,time:+(GAME.t-t0).toFixed(1),exit:exitT!=null,died,minHp:Math.round(minHp),dmg:Math.round(LOG.dmg),hitsTaken:LOG.hits,aware:bad.filter(E=>E.aware).length,hostile:bad.length,atX:+PL.x.toFixed(1)}; }
  /* stand: walk to the middle of the hall, fire into the floor every two seconds and just stand there */
  function stand(maxT){ const dt=1/30,t0=GAME.t; let first=null,nextShot=0,arr=null;
    while(GAME.t-t0<maxT){ if(PL.dead) break; KEYS.KeyW=false;
      if(arr==null){ if(Math.abs(PL.x)<.5) arr=GAME.t-t0; else walk(0,0); }
      else { PL.yaw=-Math.PI/2; PL.pitch=-1.2; if(GAME.t>=nextShot&&HANDS.R.item){ const b=camBasis(); fireHand(HANDS.R,{o:b.eye,d:b.f}); nextShot=GAME.t+2; } }
      if(first==null&&LOG.hits) first=GAME.t-t0; step(dt); }
    const bad=enemies.filter(E=>!E.civ&&!E.ally);
    return {floor:FLOOR.def.n,arrived:arr&&+arr.toFixed(1),firstHit:first&&+first.toFixed(1),died:PL.dead,diedAt:PL.dead?+(GAME.t-t0).toFixed(1):null,dmg:Math.round(LOG.dmg),hits:LOG.hits,aware:bad.filter(E=>E.aware).length,hostile:bad.length,
      where:bad.map(E=>E.name+':'+E.st+':'+(E.role||'-')+'@'+E.pos[0].toFixed(0)+','+E.pos[1].toFixed(0)).join(' ')}; }
  /* the prologue, watched from where you start */
  function pro(maxT,walkIn){ const dt=1/30,t0=GAME.t,ph=[]; let last='';
    while(GAME.t-t0<maxT){ const P=FLOOR.pro; if(P&&P.phase!==last){ last=P.phase; ph.push([last,+(GAME.t-t0).toFixed(1)]); }
      KEYS.KeyW=false; if(walkIn&&P&&P.phase==='talk'){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; }
      step(dt); if(P&&P.phase==='alone'&&GAME.t-t0>ph[ph.length-1][1]+3) break; }
    KEYS.KeyW=false; return {phases:ph,barks:LOG.barks,pickups:LOOSE.map(P=>P.item&&P.item.key),right:HANDS.R.item&&HANDS.R.item.key,pl:[+PL.x.toFixed(1),+PL.z.toFixed(1)],hp:PL.hp}; }
  /* how long the overheard talk on each floor runs if you stand and listen to all of it once */
  function talk(){ return TOWER.map(D=>{ const T=D.talk||[]; let lines=0,secs=0; for(const C of T) for(const [,txt] of C.lines){ lines++; secs+=clamp(1.7+txt.length*.07,2.4,4.2)+.8; }
    return {n:D.n,len:D.len||10,convos:T.length,lines,secs:Math.round(secs),cast:(D.cast||[]).length,civ:(D.civ||[]).length,loot:(D.loot||[]).map(l=>l[0]),clear:D.clear}; }); }
  return {loud,sprint,stand,pro,talk,LOG,give:(k,sup)=>equip(HANDS.R,newItem(k,undefined,sup))};
})();`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  const fresh = async f => { const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
    page.on('pageerror', e => errs.push('f' + f + ' ' + String(e).slice(0, 200)));
    await page.goto(game + '?f=' + f); await page.waitForTimeout(400); await page.click('#start'); await page.waitForTimeout(300);
    await page.evaluate(s => window.__eval(s), IN_PAGE); return page; };
  if (mode === 'talk') { const p = await fresh(1); console.log(JSON.stringify(await p.evaluate(() => window.__B.talk()))); await browser.close(); return; }
  if (mode === 'pro') { for (const w of [false, true]) { const p = await fresh(0); console.log(JSON.stringify(await p.evaluate(w => window.__B.pro(120, w), w))); await p.close(); } await browser.close(); return; }
  for (let f = f0; f <= f1; f++) for (let r = 0; r < runs; r++) {
    const p = await fresh(f);
    if (weapon) await p.evaluate(([k,sup]) => window.__B.give(k,sup), [weapon, process.env.SUP==='1']);
    const A=[+(process.env.SIGMA||1.6), +(process.env.REACT||.4), +(process.env.GAP||.22)]; const res = await p.evaluate(([m,A]) => m === 'sprint' ? window.__B.sprint(120) : m === 'stand' ? window.__B.stand(90) : window.__B.loud(300, A[0],A[1],A[2]), [mode,A]);
    console.log(JSON.stringify(res)); await p.close();
  }
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 10)));
  await browser.close();
})();
