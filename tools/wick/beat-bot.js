// The director's beat bot (stage 4). Steps the game's own update() through ?wick=1&play=1 and checks the director:
//   quiet   : suppressed headshots in the kitchen. Pass: the kitchen beat moves on with the beat still quiet.
//   slow    : the quiet run with a 4 s pause after the first kill, looking at the second man. Pass: it goes loud (he heard it,
//             turned, saw you and lived).
//   loud    : one unsuppressed shot in the kitchen. Pass: the beat goes loud ('shot') at once; logs time to the first push (5 m).
//   route   : every beat in order, fighting through (the bot can't die: hp topped up, ammo topped up). Leaves stragglers alive on
//             purpose and walks to the marker. Pass: every beat reached; every move-on is by 'arrive' or 'cleared' within a few
//             seconds of the condition; first push after loud under 12 s.
//   push    : straight into the main room's beat, standing still at its start. Pass: first man within 5 m in under 12 s.
//   hits    : scripted shots: an upper-arm hit turns him, two chest rounds kill inside a second, a close shotgun load throws him,
//             a man down brings his gun up or dies within seconds; no pleading line or voice gets through.
//   death   : the route with damage on. Pass: dying restarts the beat (same beat, men posted again), never the level.
// usage: NODE_PATH=/opt/npm-tools/node_modules node tools/wick/beat-bot.js index.html [quiet,loud,route,death] [runs]
const { launch, open } = require('../proto/lib.js');
const [file, onlyArg, runsArg] = process.argv.slice(2);
const only = (onlyArg || 'quiet,slow,loud,hits,push,route,death').split(',');
const runs = +(runsArg || 1);

const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__WB=(function(){
  const dt=1/30,L={err:null,steps:0};
  function runQ(){ if(!window.__Q.length) return; const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ L.err=String(e).slice(0,160); } } }
  let ms=0,msMax=0;
  function step(){ const t0=performance.now(); update(dt,performance.now()); updateWorld(world,null); runQ(); const c=performance.now()-t0; ms+=c; msMax=Math.max(msMax,c); L.steps++; }
  const eye=()=>[PL.x,1.62,PL.z],gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const S={stuckT:0,lastP:[0,0],jit:0};
  function halt(){ KEYS.KeyW=false; stick.dy=0; }
  function walk(tx,tz){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; stick.dy=0; KEYS.KeyW=true;
    S.stuckT+=dt; if(S.stuckT>2){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3?.5:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
  const D=()=>WICK_DIR, beatName=()=>D().beat?D().beat.name:(D().done?'done':'-');
  const visible=E=>!E.dead&&!E.wkSleep&&sightClear(eye(),X_(E.B,PI_.head));
  let next=0;
  /* one aimed round at his head (or chest), with a little error */
  function shootAt(E,o={}){ const p=o.chest?X_(E.B,PI_.chest):X_(E.B,PI_.head),ey=eye(); window.__game.aimAt(p); const it=HANDS.R.item; if(!it||GAME.t<next) return false;
    if(it.ammo<=0){ if(o.topUp) it.ammo=WPN[it.key].mag; else { if(!(it.reload>0)) reloadHand(HANDS.R); return false; } }
    const d=norm3(v3.sub(p,ey)),e=(o.sigma??.4)*Math.PI/180; if(fireHand(HANDS.R,{o:ey,d:norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e])})){ next=GAME.t+(o.gap??.35); return true; } return false; }
  function settle(n=20){ for(let k=0;k<n;k++) step(); }
  function snap(){ return {beat:beatName(),loud:D().loud,why:D().why,t:+GAME.t.toFixed(1),x:+PL.x.toFixed(1),z:+PL.z.toFixed(1),alive:enemies.filter(E=>!E.dead&&!E.wkSleep).length}; }
  const costs=()=>({stepMs:+(ms/Math.max(1,L.steps)).toFixed(2),stepMaxMs:+msMax.toFixed(1)});

  /* ---- quiet: two suppressed headshots, then walk to the marker ---- */
  function quiet(o={}){ settle(); const t0=GAME.t,out={bot:o.wait?'slow':'quiet',shots:0,kills:[]}; let waited=!o.wait;
    const order=()=>enemies.filter(E=>E.wkBeat===0&&!E.dead).sort((a,b)=>(a.wkId==='wk_floor4'?-1:1)-(b.wkId==='wk_floor4'?-1:1)); /* the walker first: he's the one who'd turn round */
    while(GAME.t-t0<25&&beatName()==='kitchen'){ const T=order()[0];
      if(T&&!waited&&out.shots>=1){ const w0=GAME.t; while(GAME.t-w0<o.wait&&!D().loud){ halt(); window.__game.aimAt(X_(T.B,PI_.head)); step(); } waited=true; out.waitedLoud=D().loud?D().why:null; } /* slow: a pause after the first kill */
      if(T){ halt(); if(visible(T)){ if(shootAt(T,{sigma:.25,gap:.3})) out.shots++; } else walk(T.pos[0],T.pos[1]); }
      else { const m=D().marker; walk(m[0],m[1]); }
      step(); if(D().loud&&!out.loudAt) out.loudAt=snap(); }
    out.kills=enemies.filter(E=>E.wkBeat===0&&E.dead).map(E=>E.name); out.moved=(D().log.find(l=>l.ev==='moveOn'&&l.beat==='kitchen')||{}).by||null;
    out.quietAtMoveOn=!(D().log.find(l=>l.ev==='loud'&&l.beat==='kitchen')); out.end=snap(); out.log=D().log.slice(0,8);
    out.pass=o.wait?!!out.waitedLoud:out.quietAtMoveOn&&!!out.moved&&beatName()==='floor'; return Object.assign(out,costs()); }

  /* ---- loud: one unsuppressed shot at the cook ---- */
  function loud(){ settle(); const out={bot:'loud'}; const it=HANDS.R.item; it.sup=false; /* the suppressor off */
    const T=enemies.find(E=>E.wkId==='wk_cook'); let t0=GAME.t; while(GAME.t-t0<3&&!D().loud){ halt(); shootAt(T,{chest:true,sigma:3}); step(); }
    out.loudWhy=D().why; out.loudAfter=+(GAME.t-t0).toFixed(2); t0=GAME.t; PL.hp=100;
    while(GAME.t-t0<14&&D().firstPushT==null){ halt(); PL.hp=Math.max(PL.hp,60); step(); } /* stand still: how long till one of them is on you */
    out.firstPush=D().firstPushT; out.pass=out.loudWhy==='shot'&&out.loudAfter<.5&&out.firstPush!=null&&out.firstPush<12; out.end=snap(); return Object.assign(out,costs()); }

  /* ---- route: through every beat. o.god: hp and ammo topped up ---- */
  function route(o){ settle(); const t0=GAME.t,out={bot:o.god?'route':'death',beats:[],deaths:0,restarts:[],firstPush:{},moves:[]}; let seenBeat='',lastAliveT=GAME.t,dead0=false,pendingFP=null;
    const left=()=>enemies.filter(E=>E.wkBeat===D().i&&!E.dead).length;
    while(GAME.t-t0<(o.maxT||240)&&!D().done){ const b=D().beat;
      if(beatName()!==seenBeat){ seenBeat=beatName(); out.beats.push({beat:seenBeat,t:+(GAME.t-t0).toFixed(1),loud:D().loud}); }
      if(o.god){ PL.hp=Math.max(PL.hp,80); }
      if(PL.dead){ if(!dead0){ dead0=true; out.deaths++; } halt(); step(); continue; } else if(dead0){ dead0=false; out.restarts.push({beat:beatName(),t:+(GAME.t-t0).toFixed(1),men:enemies.filter(E=>E.wkBeat===D().i&&!E.dead).length}); }
      /* stragglers on purpose: in the main room, once both waves are in, stop shooting and walk past them to the marker */
      const pend=(b.waves||[]).some((w,k)=>!b.waveDone[k]),straggle=o.straggle&&b.name==='floor'&&!pend;
      const vis=enemies.filter(E=>!E.dead&&!E.wkSleep&&(E.st==='alert'||E.st==='idle'||E.gShoot)&&visible(E)).sort((a,c)=>(c.wkTarget?1:0)-(a.wkTarget?1:0)||Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(c.pos[0]-PL.x,c.pos[1]-PL.z));
      const T=straggle?null:vis[0];
      if(T&&Math.hypot(T.pos[0]-PL.x,T.pos[1]-PL.z)<16){ halt(); shootAt(T,{sigma:o.sigma??1.2,gap:.32,topUp:o.god}); }
      else { const m=b.marker||(enemies.find(E=>E.wkTarget&&!E.dead)||{pos:[PL.x,PL.z]}).pos; const hunt=!straggle&&!b.marker||b.quiet&&!D().loud;
        const tgt=!straggle&&enemies.filter(E=>E.wkBeat===D().i&&!E.dead&&!E.wkSleep).sort((a,c)=>Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(c.pos[0]-PL.x,c.pos[1]-PL.z))[0];
        if(tgt&&(hunt||!b.marker)) walk(tgt.pos[0],tgt.pos[1]); else if(b.marker) walk(m[0],m[1]); else halt(); }
      const it=HANDS.R.item; if(it&&WPN[it.key].gun&&it.ammo<=0&&!(it.reload>0)){ if(o.god) it.ammo=WPN[it.key].mag; else reloadHand(HANDS.R); }
      step(); }
    out.done=D().done; out.t=+(GAME.t-t0).toFixed(1); out.log=D().log.filter(l=>/enter|loud|moveOn|firstPush|wave|lastMan|restart|surrender|witness/.test(l.ev));
    for(const l of out.log){ if(l.ev==='firstPush') out.firstPush[l.beat]=l.s; if(l.ev==='moveOn') out.moves.push({beat:l.beat,by:l.by,left:l.left}); }
    out.men=enemies.filter(E=>!E.dead).map(E=>({n:E.name,b:E.wkBeat,st:E.st,aw:E.aware,see:E.canSee,role:E.role,rage:+(E.rage||0).toFixed(1),sleep:!!E.wkSleep,dorm:!!E.dormant,held:!!E.wkHeld,p:E.pos.map(v=>+v.toFixed(1)),job:typeof SQ!=='undefined'&&SQ.jobs.get(E)?SQ.jobs.get(E).k:null,cov:!!(E.fx&&E.fx.cov),surr:!!E.surr,mind:E.mind}));
    out.hurts=HU.length; out.hurtFirst=HU.slice(0,12); out.barkN=BK.length; out.pleadLeft=BK.filter(t=>WK_PLEAD.test(t)); out.end=snap(); return Object.assign(out,costs()); }
  /* ---- hits: the shove, the shoulder turn, the shotgun throw, the second body round, a man down ---- */
  const HL=[]; protoOn('enemyHit',(E,seg,w,o)=>HL.push({E,part:seg[3],w,t:GAME.t}));
  function shotAtPt(p){ const ey=eye(); window.__game.aimAt(p); return fireHand(HANDS.R,{o:ey,d:norm3(v3.sub(p,ey))}); }
  function waitFor(fn,max){ const t0=GAME.t; while(GAME.t-t0<max&&!fn()){ PL.hp=100; halt(); step(); } return +(GAME.t-t0).toFixed(2); }
  function hits(){ settle(); const out={bot:'hits'},god=()=>{ PL.hp=100; };
    const R=enemies.find(E=>E.wkId==='wk_floor4'),C=enemies.find(E=>E.wkId==='wk_cook');
    /* 1. his upper arm: a quarter turn */
    waitFor(()=>visible(R),3); const hd0=R.hd,n0=HL.length; HANDS.R.item.ammo=12; HANDS.R.item.cd=0;
    const sh=X_(R.B,PI_.shR),el=X_(R.B,PI_.elR); shotAtPt([(sh[0]*2+el[0])/3,(sh[1]*2+el[1])/3,(sh[2]*2+el[2])/3]); for(let k=0;k<4;k++){ god(); step(); }
    out.arm={part:(HL[n0]||{}).part,turn:+Math.abs(wrapA(R.hd-hd0)).toFixed(2),spins:R.wkSpin||0};
    /* 2. two rounds in the chest: dead within a second of the second */
    waitFor(()=>false,.4); HANDS.R.item.cd=0; shotAtPt(X_(R.B,PI_.chest)); waitFor(()=>false,.35); HANDS.R.item.cd=0; shotAtPt(X_(R.B,PI_.chest)); const t2=GAME.t;
    out.chest2={body:R.wkBody||0,parts:HL.filter(h=>h.E===R).map(h=>h.part),deadIn:R.dead?0:waitFor(()=>R.dead,6),st:R.st};
    /* 3. the shotgun at three metres: he's thrown back */
    equip(HANDS.R,newItem('shotgun')); const cp=X_(C.B,PI_.pelvis),dx=cp[0]-PL.x,dz=cp[2]-PL.z,dd=Math.hypot(dx,dz); PL.x=cp[0]-dx/dd*3; PL.z=cp[2]-dz/dd*3; settle(2);
    const p0=X_(C.B,PI_.pelvis); HANDS.R.item.cd=0; shotAtPt(X_(C.B,PI_.chest)); waitFor(()=>false,.5); const p1=X_(C.B,PI_.pelvis);
    out.shotgun={thrown:C.wkThrown||0,moved:+Math.hypot(p1[0]-p0[0],p1[2]-p0[2]).toFixed(2),dead:C.dead};
    equip(HANDS.R,newItem('pistol',12,true));
    /* 4. men down: one round low in the body or the leg each; does he bring his gun up, and how long till he's dead */
    waitFor(()=>D().beat&&D().beat.name==='floor',8); out.down=[];
    const men=enemies.filter(E=>E.wkBeat===1&&!E.wkHeld&&!E.dead);
    for(const E of men){ const pp=X_(E.B,PI_.pelvis); for(let a=0;a<16;a++){ const x=pp[0]+Math.cos(a*.393)*3.2,z=pp[2]+Math.sin(a*.393)*3.2,c=navCell(x,z); if(c<0||FLOOR.nav[c]) continue; if(sightClear([x,1.62,z],X_(E.B,PI_.chest))){ PL.x=x; PL.z=z; break; } } for(let k=0;k<3;k++){ god(); step(); }
      const part=out.down.length%2?PI_.knR:PI_.pelvis; let t0=GAME.t,shots=0; HANDS.R.item.ammo=12;
      while(GAME.t-t0<6&&E.st!=='down'&&!E.dead){ HANDS.R.item.cd=0; if(shotAtPt(X_(E.B,part))) shots++; waitFor(()=>E.st==='down'||E.dead,1.6); }
      const tDown=GAME.t; let aimed=null; const tDead=waitFor(()=>{ if(E.gShoot&&aimed==null) aimed=+(GAME.t-tDown).toFixed(2); return E.dead; },12);
      out.down.push({who:E.name,shots,parts:HL.filter(h=>h.E===E).map(h=>h.part),vis:visible(E),wentDown:E.st==='down'||E.dead,aimed,deadAfterDown:tDead,dead:E.dead}); }
    out.barks=BK.slice(-40); out.pleadLeft=BK.filter(t=>WK_PLEAD.test(t)); out.vox=Object.fromEntries(Object.entries(VX)); out.voxBad=Object.keys(VX).filter(k=>k in WK_VOX&&WK_VOX[k]!==k);
    out.pass=out.arm.turn>.6&&(out.chest2.body<2||out.chest2.deadIn<1.2)&&out.shotgun.moved>.3&&out.shotgun.thrown>0&&out.down.every(d=>!d.wentDown||d.dead&&d.deadAfterDown<9)&&out.down.some(d=>d.wentDown)&&!out.pleadLeft.length&&!out.voxBad.length;
    return Object.assign(out,costs()); }
  /* what was said and voiced, after Wick's filters */
  const BK=[],VX={},HU=[]; protoOn('hurt',(d,src)=>HU.push({t:+GAME.t.toFixed(1),d:Math.round(d),w:src&&src.w,who:src&&src.E&&src.E.name,dist:src&&src.dist!=null?+(+src.dist).toFixed(1):null})); { const _b=bark; bark=function(E,t,d){ const c0=E&&E.barkCd; _b(E,t,d); if(E&&E.barkEl&&E.barkCd!==c0) BK.push(E.barkEl.textContent); }; const _v=vox; vox=function(E,ty,v){ const m=typeof wickVox==='function'?wickVox(ty):ty; if(m) VX[m]=(VX[m]||0)+1; return _v(E,ty,v); }; }
  /* ---- push: straight into the main room's beat, stand still where it starts: how long till the first man is within 5 m ---- */
  function push(){ settle(); for(const E of enemies) if(E.wkBeat===0) E.dead=true; const b=D().beats[1]; PL.x=b.start[0]; PL.z=b.start[1]; PL.yaw=b.start[2];
    let t0=GAME.t; while(GAME.t-t0<3&&D().beat.name!=='floor'){ PL.hp=100; halt(); step(); }
    const at=enemies.filter(E=>E.wkBeat===1&&!E.wkHeld).map(E=>+Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z).toFixed(1)); t0=GAME.t;
    while(GAME.t-t0<20&&D().firstPushT==null){ PL.hp=100; PL.x=b.start[0]; PL.z=b.start[1]; halt(); step(); }
    const out={bot:'push',loud:D().loud,why:D().why,distAtLoud:at,firstPush:D().firstPushT,by:(D().log.find(l=>l.ev==='firstPush')||{}).by};
    out.pass=out.loud&&out.firstPush!=null&&out.firstPush<12&&Math.min(...at)>5; return Object.assign(out,costs()); }
  return {quiet,loud,route,hits,push,L,BK,VX};
})();`;

(async () => {
  const browser = await launch(); const res = []; let bad = 0;
  for (let r = 0; r < runs; r++) for (const name of only) { let page = null;
    try { const o = await open(browser, file, 'wick=1&play=1', { wait: 300 }); page = o.page;
      await page.evaluate(c => window.__eval(c), CORE);
      const arg = name === 'route' ? '{god:true,straggle:true}' : name === 'death' ? '{god:false,sigma:2.2,maxT:'+(process.env.WB_T||200)+'}' : name === 'slow' ? '{wait:4}' : '';
      const fn = name === 'death' ? 'route' : name === 'slow' ? 'quiet' : name;
      const out = await page.evaluate(s => window.__eval(s), `window.__WB.${fn}(${arg})`);
      out.errors = o.errs.slice(0, 5); if (out.pass === false || out.errors.length) bad++;
      if (name === 'route') { const want = ['kitchen', 'floor', 'office']; out.reachedAll = want.every(w => out.beats.some(b => b.beat === w)) && out.done;
        out.noStraggler = out.moves.length >= 3 && out.moves.every(m => m.by === 'arrive' || m.by === 'cleared') && out.moves.some(m => m.by === 'arrive' && m.left > 0);
        out.pushOk = Object.values(out.firstPush).every(s => s < 12) && Object.keys(out.firstPush).length > 0;
        out.pass = out.reachedAll && out.noStraggler && out.pushOk && !out.errors.length; if (!out.pass) bad++; }
      if (name === 'death') { out.pass = !out.errors.length && out.restarts.every(x => x.men > 0) && (out.deaths === 0 || out.restarts.length >= 1); if (!out.pass) bad++; }
      res.push(out); console.log(JSON.stringify(out));
    } catch (e) { bad++; console.log(JSON.stringify({ bot: name, error: String(e).slice(0, 300) })); }
    finally { if (page) await page.close().catch(() => {}); } }
  console.log(JSON.stringify({ summary: true, runs: res.length, failed: bad }));
  await browser.close(); process.exit(bad ? 1 : 0);
})();
