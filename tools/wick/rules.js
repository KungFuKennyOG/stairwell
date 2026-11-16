// Stage 2 rule check (src/92-wick-rules.js). Loads ?wick=1&stress=4 (floor 01 with four extra live gunmen, not god mode), freezes the
// men's brains so only the test hurts you, then steps the game's own update() and calls hurtPlayer / die on live men to prove:
// the kit, damage per pistol hit, four hits to die, block regen, leg/arm timers, no bandages, the meter (drain, empty, refill per kill
// and headshot), kill chains, wickSlowBurst, magazines from a carried type of gun, the watch face and the HUD.
// Then ?proto=1 and f=1 to show the horror prototype and the old game kept their rules.
// usage: node tools/wick/rules.js [index.html]
const { launch, open } = require('../proto/lib.js');
const [file = 'index.html'] = process.argv.slice(2);
const PRE = `window.requestAnimationFrame=()=>0; window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
  window.__st=s=>{ const n=Math.round(s*30); for(let i=0;i<n;i++){ update(1/30,performance.now()); updateWorld(world,null);
    const due=__Q.filter(q=>q[0]<=GAME.t); __Q=__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(_){} } } };`;
const WICK_TEST = `(()=>{ ${PRE}
  think=function(){}; enemyShoot=function(){ return false; }; /* the men stand still: only the test hurts you */
  const out={},ok={},ev=[]; protoOn('wickChain',n=>ev.push(n)); const r1=v=>Math.round(v*100)/100;
  const live=()=>enemies.filter(E=>!E.dead&&!E.civ&&!E.ally); const E0=live()[0];
  const shot=(part,side,fresh)=>{ if(fresh) PL.hp=100; const h0=PL.hp; hurtPlayer(30,{E:E0,kind:'gun',w:'pistol',n:1,parts:[part],side:side||'R',mz:[E0.pos[0],1.4,E0.pos[1]],dist:5}); return r1(h0-PL.hp); };
  __st(.2);
  /* the kit */
  const R=HANDS.R.item; out.kit={R:R&&R.key,sup:R&&R.sup,ammo:R&&R.ammo,mags:PL.pouch.mags.map(m=>m.rounds),L:HANDS.L.item&&HANDS.L.item.key,hp:PL.hp,men:live().length};
  ok.kit=out.kit.R==='pistol'&&out.kit.sup&&out.kit.ammo===12&&out.kit.mags.join()==='12,12'&&out.kit.L==='knife'&&out.kit.hp===100;
  /* damage per pistol hit */
  out.dmg={torso:shot('torso',0,1),arm:shot('arm','L',1),leg:shot('leg',0,1),head:shot('head',0,1)}; PL.hp=100;
  /* a real shot, aimed by Ray's hit test, from 2.5 m away down the most open direction */
  const eye=[PL.x,1.5,PL.z]; let dir=null,bt=0; for(let i=0;i<16;i++){ const a=i/16*6.283,d=[Math.sin(a),0,Math.cos(a)],t=rayRoom(eye,d).t; if(t>bt){ bt=t; dir=d; } } const mz=[PL.x+dir[0]*Math.min(2.5,bt-.3),1.4,PL.z+dir[2]*Math.min(2.5,bt-.3)];
  const real=[]; for(let i=0;i<20;i++){ const h0=PL.hp; hurtPlayer(30,{E:E0,kind:'gun',w:'pistol',n:1,mz,dist:2.5}); real.push(r1(h0-PL.hp)); PL.hp=100; }
  out.dmg.raycast=[...new Set(real)].sort((a,b)=>a-b); /* where his real shot landed; 0 is cover taking it */
  ok.dmg=Object.values(out.dmg).filter(v=>typeof v==='number').every(v=>v>=25&&v<=30)&&out.dmg.raycast.some(v=>v>0)&&out.dmg.raycast.every(v=>v===0||v>=25&&v<=30); PL.hp=100; __st(5);
  /* block regen: hit, nothing for 4 s, then only the block you're in */
  PL.hp=100; __st(5); shot('torso'); const a=r1(PL.hp); __st(3.5); const b=r1(PL.hp); __st(2.5); const c=r1(PL.hp);
  shot('torso'); shot('torso'); const d=r1(PL.hp); __st(7); const e=r1(PL.hp); __st(5); const f=r1(PL.hp);
  out.regen={afterHit:a,at3_5s:b,at6s:c,twoMore:d,after7s:e,after12s:f}; ok.regen=a===72&&b===72&&c===75&&d===19&&e===25&&f===25;
  /* wounds: leg slows for 10 s, arm widens that hand's spread for 10 s */
  PL.hp=100; shot('leg'); shot('arm','R'); __st(.1); const w0={speed:r1(raySpeedK()),spreadR:wickSpreadK(HANDS.R),spreadL:wickSpreadK(HANDS.L),limp:PL.limp,bleeding:PL.wounds.length};
  __st(9.5); const w1={speed:r1(raySpeedK()),spreadR:wickSpreadK(HANDS.R)}; __st(.7); const w2={speed:r1(raySpeedK()),spreadR:wickSpreadK(HANDS.R)};
  out.wounds={at0:w0,at9_6:w1,at10_3:w2,strip:giveStrip(HANDS.L),shakes:PROTO.ray.tremorHp,bleed:PROTO.ray.bleed};
  ok.wounds=w0.speed===.7&&w0.spreadR===4&&w0.spreadL===1&&w0.bleeding===0&&w1.speed===.7&&w2.speed===1&&w2.spreadR===1&&out.wounds.strip===false&&!out.wounds.shakes;
  /* the meter: 4 s, drains in real time, off when empty, empty won't start */
  PL.hp=100; WICK_BT.t=4; toggleSlow(); const m0=GAME.slow; __st(1); const m1=r1(WICK_BT.t),ts1=r1(GAME.ts); __st(3.2); const m2=r1(WICK_BT.t),s2=GAME.slow; toggleSlow(); const s3=GAME.slow;
  WICK_BT.t=4; __st(2); const mI=r1(WICK_BT.t); /* off: no drain */
  out.meter={on:m0,after1s:m1,worldSpeed:ts1,after4_2s:m2,slowAfterEmpty:s2,toggleWhenEmpty:s3,idle2s:mI}; ok.meter=m0&&Math.abs(m1-3)<.05&&ts1<.3&&m2===0&&!s2&&!s3&&mI===4;
  /* kills refill it, and chains */
  const [A,B,C]=live(); WICK_BT.t=0; __st(3); A.headshot=false; die(A); const k1=r1(WICK_BT.t),n1=WICK_CHAIN.n; __st(.5); B.headshot=true; die(B); const k2=r1(WICK_BT.t),n2=WICK_CHAIN.n;
  __st(.5); WICK_BT.t=0; C.headshot=false; die(C); const k3=r1(WICK_BT.t),n3=WICK_CHAIN.n; __st(1.9); const n4=WICK_CHAIN.n; __st(.3); const n5=WICK_CHAIN.n;
  out.kills={bodyKill:k1,chain1:n1,headKillLink2:k2,chain2:n2,bodyKillLink3_from0:k3,chain3:n3,after1_9s:n4,after2_2s:n5,events:ev.slice(),best:WICK_CHAIN.best};
  ok.kills=k1===1&&n1===1&&k2===3&&n2===2&&k3===1.8&&n3===3&&n4===3&&n5===0&&ev.join()==='2,3';
  /* the free burst */
  WICK_BT.t=0; wickSlowBurst(1.2); const b0=GAME.slow; __st(1); const b1=GAME.slow,bt1=WICK_BT.t; __st(.3); const b2=GAME.slow;
  WICK_BT.t=4; toggleSlow(); wickSlowBurst(1); __st(1); const b3=r1(WICK_BT.t); __st(.5); const b4=r1(WICK_BT.t); toggleSlow(); const b5=GAME.slow;
  out.burst={on:b0,at1s:b1,meterUsed:bt1,at1_3s:b2,meterDuringBurst:b3,meterAfter:b4,offAfterToggle:b5}; ok.burst=b0&&b1&&bt1===0&&!b2&&b3===4&&Math.abs(b4-3.5)<.05&&!b5;
  /* ammo: a pistol on the floor while you hold one gives a magazine; an MP5 you don't carry doesn't */
  const nm=PL.pouch.mags.length,P=addPickup(newItem('pistol',7),m4.make(),[0,0,0]),t1=wickTakeMag(HANDS.L,P),t2=wickTakeMag(HANDS.L,P),S=addPickup(newItem('smg',20),m4.make(),[0,0,0]),t3=wickTakeMag(HANDS.L,S);
  const drops=[]; for(let i=0;i<60;i++) drops.push(wickDropRounds('pistol'));
  out.ammo={took:t1,mags:PL.pouch.mags.map(m=>m.rounds),gunLeft:P.item.ammo,again:t2,smg:t3,drop:[Math.min(...drops),Math.max(...drops)]};
  ok.ammo=t1&&!t2&&!t3&&PL.pouch.mags.length===nm+1&&PL.pouch.mags[nm].rounds===7&&P.item.ammo===0&&out.ammo.drop[0]>=6&&out.ammo.drop[1]<=12;
  /* four hits from full: dead on the fourth, three blocks gone at three; then the restart puts it all back */
  PL.hp=100; __st(5); const hp4=[]; for(let i=0;i<4;i++){ shot('torso'); hp4.push(r1(PL.hp)); } const dead=PL.dead; __st(4.2);
  out.death={hp:hp4,dead,afterRestart:{dead:PL.dead,hp:PL.hp,meter:WICK_BT.t,ammo:HANDS.R.item&&HANDS.R.item.ammo,mags:PL.pouch.mags.length,chain:WICK_CHAIN.n}};
  ok.death=dead&&hp4[2]>0&&!PL.dead&&PL.hp===100&&WICK_BT.t===4&&out.death.afterRestart.ammo===12&&out.death.afterRestart.mags===2;
  /* the watch face and the HUD */
  __st(.2); out.face={built:!!WR.face,key:WR.faceKey,fpsLabelHidden:!fpsN.vis}; out.hud={on:!!$('wkHud'),blocks:$('wkBlocks')&&$('wkBlocks').children.length,hpbar:getComputedStyle(document.querySelector('#br .hpbar')).display};
  ok.face=out.face.built&&out.hud.on&&out.hud.blocks===4&&out.hud.hpbar==='none';
  return {ok,out}; })()`;
const PROTO_TEST = `(()=>{ ${PRE} __st(.2); const r={};
  toggleSlow(); r.slow=GAME.slow; r.dmg=PROTO.ray.dmg.pistol.torso; r.hud=!!document.getElementById('wkHud'); r.gun=HANDS.R.item&&HANDS.R.item.ammo; r.mags=PL.pouch.mags.map(m=>m.rounds);
  PL.hp=100; hurtPlayer(30,{kind:'gun',w:'pistol',n:1,parts:['torso'],dist:5}); r.hit=100-PL.hp; const h=PL.hp; __st(6); r.regen=Math.round((PL.hp-h)*10)/10;
  r.ok=!r.slow&&r.dmg===70&&!r.hud&&r.hit===70&&r.regen===0; return r; })()`;
const OLD_TEST = `(()=>{ ${PRE} __st(.2); const r={}; toggleSlow(); r.slow=GAME.slow; __st(1); r.ts=Math.round(GAME.ts*100)/100; toggleSlow(); r.hud=!!document.getElementById('wkHud');
  PL.hp=50; PL.hurtT=9; __st(1); r.regen=Math.round(PL.hp-50); r.ok=r.slow&&r.ts===.22&&!r.hud&&r.regen>0; return r; })()`;
(async () => {
  const browser = await launch(); let bad = 0;
  for (const [name, q, code] of [['wick', 'wick=1&stress=4&sgod=0', WICK_TEST], ['proto', 'proto=1', PROTO_TEST], ['old', 'f=1', OLD_TEST]]) {
    const { page, errs } = await open(browser, file, q, { wait: 800 });
    let r; try { r = await page.evaluate(s => window.__eval(s), code); } catch (e) { r = { err: String(e).slice(0, 300) }; }
    const pass = !errs.length && !r.err && (r.ok === true || (r.ok && Object.values(r.ok).every(Boolean)));
    if (!pass) bad++; console.log(JSON.stringify({ check: name, pass, ...r, errors: errs.slice(0, 4) }));
    await page.close();
  }
  await browser.close(); process.exit(bad ? 1 : 0);
})();
