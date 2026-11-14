// Floor 01 prototype bots. Steps the game's own update() with rendering off (the tools/harness/bot.js pattern).
// usage: node tools/proto/pf-bot.js index.html <mode> [arg]
//   sprint          walk straight for the stairs out and try to leave, touching nobody (120 s)
//   cutter <0|1|2>  the bolt cutter is in spot 0 (Dani's table), 1 (storeroom shelf) or 2 (gutted flat); walk to it, take it, cut the chain, leave
//   patrol          stand on the landing for 240 s and watch the flashlight pair walk (where they get to, whether they stick)
//   ghost           as cutter, but nobody sees or hears Ray (pure route timing)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2] || 'index.html'), mode = process.argv[3] || 'sprint', arg = process.argv[4];
const IN_PAGE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__P=(function(){
  const LOG={barks:[],dmg:0,hits:0,events:[]};
  const _bark=bark; bark=function(E,txt,d){ LOG.barks.push([+GAME.t.toFixed(1),E&&E.name,txt]); return _bark.apply(this,arguments); };
  const _hurt=hurtPlayer; hurtPlayer=function(d){ LOG.dmg+=d; LOG.hits++; return _hurt.apply(this,arguments); };
  for(const ev of ['exit','chain','room','huntStart','huntEnd']) protoOn(ev,(a)=>LOG.events.push([+GAME.t.toFixed(1),ev,a&&a.id||a||'']));
  const S={stuckT:0,lastP:[0,0],jit:0};
  function step(dt){ update(dt,performance.now()); updateWorld(world,null); if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ LOG.err=(LOG.err||'')+String(e).slice(0,120); } } }
    S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&KEYS.KeyW?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
  function walk(tx,tz){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; KEYS.KeyW=true; }
  function face(tx,ty,tz){ const e=camBasis().eye; const d=[tx-e[0],ty-e[1],tz-e[2]],l=Math.hypot(...d); PL.yaw=Math.atan2(-d[0],-d[2]); PL.pitch=Math.asin(d[1]/l); }
  const dt=1/30;
  function sprint(maxT){ const t0=GAME.t; let atDoor=null,minHp=100;
    while(GAME.t-t0<maxT){ if(PL.dead) break; minHp=Math.min(minHp,PL.hp); KEYS.KeyW=false; if(PF.exited) break;
      const d=Math.hypot(PL.x-12.45,PL.z-9.9); if(d<.6){ if(atDoor==null) atDoor=GAME.t-t0; PL.yaw=Math.atan2(-(14.2-PL.x),-(9.9-PL.z)); KEYS.KeyW=true; } else walk(12.45,9.9); step(dt); }
    KEYS.KeyW=false; return {time:+(GAME.t-t0).toFixed(1),exit:!!PF.exited,atDoorAfter:atDoor&&+atDoor.toFixed(1),x:+PL.x.toFixed(2),z:+PL.z.toFixed(2),died:PL.dead,minHp:Math.round(minHp),hits:LOG.hits,aware:enemies.filter(E=>E.aware).map(E=>E.name)}; }
  function cutter(maxT,ghost){ const t0=GAME.t,C=PF.cutterAt,P=PF.items.find(i=>i.key==='cutter'); let got=null,cut=null,minHp=100; const tgt=C.p;
    if(ghost){ for(const E of enemies){ E.civ=true; E.atkCd=1e9; } }
    while(GAME.t-t0<maxT){ if(PL.dead) break; minHp=Math.min(minHp,PL.hp); KEYS.KeyW=false; if(PF.exited) break;
      if(got==null){ const d=Math.hypot(PL.x-tgt[0],PL.z-tgt[2]); if(d<1.3){ face(tgt[0],tgt[1],tgt[2]); pfUseQ=true; step(dt); if(HANDS.R.item&&HANDS.R.item.key==='cutter') got=GAME.t-t0; continue; } walk(tgt[0],tgt[2]); }
      else if(!PF.exit.open){ const d=Math.hypot(PL.x-12.2,PL.z-9.7); if(d<.5){ face(...PF.exit.at); pfUseQ=true; step(dt); if(PF.exit.open) cut=GAME.t-t0; continue; } walk(12.2,9.7); }
      else { if(PL.x>12.3){ PL.yaw=Math.atan2(-(14.2-PL.x),-(9.9-PL.z)); PL.pitch=0; KEYS.KeyW=true; } else walk(12.6,9.9); }
      step(dt); }
    KEYS.KeyW=false; const tE=PF.exited?GAME.t-t0:null; if(!tE) LOG.at=[+PL.x.toFixed(2),+PL.z.toFixed(2)];
    return {at:LOG.at,spot:C.room,toCutter:got&&+got.toFixed(1),cutAt:cut&&+cut.toFixed(1),exitAt:tE&&+tE.toFixed(1),cutterToExit:got&&tE&&+(tE-got).toFixed(1),died:PL.dead,minHp:Math.round(minHp),hits:LOG.hits,events:LOG.events.filter(e=>e[1]!=='room')}; }
  function patrol(maxT){ const t0=GAME.t,T=PF.lead,J=PF.follow,seen={T:new Set(),J:new Set()},track=[]; let maxGap=0,stuckT={T:0,J:0},stuckMax={T:0,J:0},last={T:null,J:null};
    for(const E of enemies) if(!E.hunter){ E.civ=true; } /* nobody else reacts; the pair walk */
    PL.x=-12.6; PL.z=-9.6;
    while(GAME.t-t0<maxT){ KEYS.KeyW=false; PL.x=-12.6; PL.z=-9.6; step(dt);
      for(const [k,E] of [['T',T],['J',J]]){ if(!E||E.dead) continue; const r=pfRoomAt(E.pos[0],E.pos[1]); if(r) seen[k].add(r.id); const l=last[k]; if(l){ const m=Math.hypot(E.pos[0]-l[0],E.pos[1]-l[1]); if(m<.004){ stuckT[k]+=dt; stuckMax[k]=Math.max(stuckMax[k],stuckT[k]); } else stuckT[k]=0; } last[k]=E.pos.slice(); }
      if(T&&J) maxGap=Math.max(maxGap,Math.hypot(T.pos[0]-J.pos[0],T.pos[1]-J.pos[1]));
      if(Math.round((GAME.t-t0)*30)%300===0) track.push([+(GAME.t-t0).toFixed(0),T&&T.pos.map(v=>+v.toFixed(1)),T&&T.patrol&&T.patrol.i,J&&J.pos.map(v=>+v.toFixed(1)),T&&T.st,T&&T.mind]); }
    return {titoRooms:[...seen.T],jojoRooms:[...seen.J],maxGap:+maxGap.toFixed(1),stuckMax:{T:+stuckMax.T.toFixed(1),J:+stuckMax.J.toFixed(1)},track,barks:LOG.barks.slice(0,12)}; }
  return {sprint,cutter,patrol,LOG};
})();`;
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 320, height: 180 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(file + '?proto=1&pfdev=1', { timeout: 240000 }); await p.waitForTimeout(1500); await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(500);
  if (mode === 'cutter' || mode === 'ghost') await p.evaluate(i => window.__eval(`PF.cutterI=${i}; resetGame();`), +(arg || 0));
  await p.evaluate(s => window.__eval(s), IN_PAGE);
  const res = await p.evaluate(([m]) => window.__eval(m === 'sprint' ? '__P.sprint(120)' : m === 'patrol' ? '__P.patrol(240)' : `__P.cutter(150,${m === 'ghost'})`), [mode]);
  console.log(JSON.stringify(res)); console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 8)) : 'no errors'); await b.close(); })();
