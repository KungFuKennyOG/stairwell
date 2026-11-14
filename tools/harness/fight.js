// Enemy-fighting tests for Stairwell (agent E, src/84-fight.js). Same stepping rules as deep.js: rAF off, update() stepped by hand,
// updateWorld after each step (head hits), setTimeout on game time. Every test takes a query string so it can run with ?proto=1.
// usage: node tools/harness/fight.js <index.html> <test> '<json args>'
//   bot      {qs:'f=1&proto=1&pf=0', runs:20, wpn:'pistol', sup:false, maxT:240}   the pistol-fight bot: one line per run, then a summary
//   duel     {qs, kinds:['gunman'], dists:[3,6,10,16,22], lit:[true,false], secs:30}  one man who knows you're there; you stand still
//   flash    {qs, dists:[10,16,24], sup:false}       you, in the dark, fire one shot past a man in the light: does he answer, how fast
//   melee    {qs, kind:'cutter', secs:40}           a blade man and you standing still: wind-ups, feints, hits
//   block    {qs, runs:10}                           your knife held across his swing at the moment it lands
//   wrist    {qs, runs:10}                           your empty hand takes his weapon wrist during the wind-up
//   nerve    {qs}                                    the quitter/fighter/faker split on floors 1, 6 and 12 (2000 rolls each)
//   witness  {qs, runs:3}                            Beto dies: Chuy beside him sees it, Nacho is behind a wall, Lalo 9 m off facing away. Who shouts?
//   rage     {qs}                                    a friend shot dead in front of a quitter and a fighter
//   quitrun  {qs, secs:40}                           a quitter surrenders, you turn away: does he run for his friends
//   faker    {qs, runs:2}                            a faker surrenders, your gun goes away: you watch him / turn your back / his friend is in view
//   retreat  {qs, runs:4}                            a man shot early: does he back into a dark room and wait at the door
//   token    {qs, secs:20}                           three gunmen who can all see you: how many shoot
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const game = 'file://' + path.resolve(process.argv[2]), test = process.argv[3], args = JSON.parse(process.argv[4] || '{}');

const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__F=(function(){
  const L={barks:[],dmg:[],eshots:new Map(),god:false,cur:null,ray:false,lastHit:new Map(),kills:[],swings:new Map(),surr:new Set(),alerts:[]};
  const _bark=bark; bark=function(E,txt,d){ L.barks.push([+GAME.t.toFixed(2),E&&E.name,txt]); return _bark.apply(this,arguments); };
  const _es=enemyShoot; enemyShoot=function(E,b){ L.cur=E; const r=_es.apply(this,arguments); if(r!==false) L.eshots.set(E,(L.eshots.get(E)||0)+1); L.cur=null; return r; };
  /* what it actually cost (agent A's hurtPlayer may change the number, or take it all on cover); bleeding is logged apart */
  const _hurt=hurtPlayer; hurtPlayer=function(d,src){ const hp0=PL.hp,r=_hurt.apply(this,arguments),got=hp0-PL.hp;
    const k=src&&src.kind==='bleed'?'bleed':L.cur||src&&src.kind==='gun'?'gun':'melee'; if(k==='bleed') L.bleed=(L.bleed||0)+got; else if(got>0) L.dmg.push([+GAME.t.toFixed(2),got,L.cur?L.cur.name:(src&&src.E?src.E.name:'melee'),k]); return r; };
  const _fire=fireHand; fireHand=function(){ L.ray=true; try{ return _fire.apply(this,arguments); } finally { L.ray=false; } };
  const _hit=hitEnemy; hitEnemy=function(E){ if(L.ray) L.lastHit.set(E,Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)); return _hit.apply(this,arguments); };
  const _die=die; die=function(E){ if(!E.dead&&!E.civ&&!E.ally) L.kills.push({name:E.name,d:L.lastHit.has(E)?+L.lastHit.get(E).toFixed(1):null,now:+Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z).toFixed(1)}); return _die.apply(this,arguments); };
  if(typeof huntAlert==='function'){ const _ha=huntAlert; huntAlert=function(r,p,s){ L.alerts.push([+GAME.t.toFixed(2),r,p&&p.map(v=>+v.toFixed(1)),s]); return _ha.apply(this,arguments); }; }
  else window.huntAlert=undefined;
  const dt=1/30;
  function step(){ if(L.god){ PL.hp=100; PL.dead=false; } update(dt,performance.now()); updateWorld(world,null);
    if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ L.err=String(e).slice(0,150); } } }
    for(const E of enemies){ if(E.surr) L.surr.add(E); if(E.atkT>=0&&!E._sw){ E._sw=true; L.swings.set(E,(L.swings.get(E)||0)+1); } if(E.atkT<0) E._sw=false; } }
  const reset=()=>{ L.bleed=0; L.barks.length=0; L.dmg.length=0; L.eshots.clear(); L.lastHit.clear(); L.kills.length=0; L.swings.clear(); L.surr.clear(); L.alerts.length=0; window.__Q=[]; };
  const MAKERS={corner:makeCorner,cutter:makeCutter,gunman:makeGunman,doorman:makeDoorman,enforcer:makeEnforcer,landlord:makeLandlord};
  function spawn(kind,name,x,z,hd,psych){ const E=spawnEnemy({maker:MAKERS[kind],name,x,z,hd,extra:'I got a kid—'}); enemies.push(E); if(psych) E.psych=psych; return E; }
  function solo(kind,x,z,hd,psych){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); const E=spawn(kind,'T-'+kind,x,z,hd,psych); attachLabels(); return E; }
  const eye=()=>[PL.x,1.62,PL.z],mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  const gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const lit=(x,z)=>{ for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0]; if(Math.hypot(p[0]-x,p[2]-z)<l[2]*.45&&sightClear([p[0],Math.max(p[1],1.2),p[2]],[x,1.3,z])) return true; } return false; };
  const out=E=>E.dead||E.st==='down'||E.surr||E.st==='kneel';
  const obvious=E=>!E.civ&&!E.ally&&(E.wpnHeld||E.aware||!E.concealed);
  const sumD=()=>L.dmg.reduce((s,d)=>s+d[1],0);

  /* ---- the pistol-fight bot (deep.js fight, plus kill distances, surrender and attack counts) ---- */
  function bot(o){ reset(); L.god=false; const S={seen:new Map(),next:0,stuckT:0,lastP:[PL.x,PL.z],jit:0}; const t0=GAME.t; let exitT=null,shots=0,died=false,diedAt=null;
    const bad=enemies.filter(E=>!E.civ&&!E.ally);
    function walk(tx,tz){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; KEYS.KeyW=true; }
    while(GAME.t-t0<o.maxT){
      if(PL.dead){ died=true; diedAt=+(GAME.t-t0).toFixed(1); break; }
      KEYS.KeyW=false; if(GAME.climbing){ exitT=GAME.t-t0; break; }
      const ey=eye(),T=enemies.filter(E=>obvious(E)&&!out(E)).map(E=>({E,d:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)})).sort((a,b)=>a.d-b.d);
      const vis=T.find(q=>q.d<16&&sightClear(ey,X_(q.E.B,PI_.head)));
      if(vis){ const E=vis.E; if(!S.seen.has(E)) S.seen.set(E,GAME.t); const ch=X_(E.B,PI_.chest),nk=X_(E.B,PI_.neck),p=mid(ch,nk,.6); window.__game.aimAt(p);
        if(GAME.t-S.seen.get(E)>o.react&&GAME.t>=S.next&&HANDS.R.item){ const d=norm3(v3.sub(p,ey)),e=o.sigma*Math.PI/180; if(fireHand(HANDS.R,{o:ey,d:norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e])})){ shots++; S.next=GAME.t+o.gap; } } }
      else if(T.length){ walk(T[0].E.pos[0],T[0].E.pos[1]); }
      else { if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; } else walk(TL+.1,0); }
      step(); S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&KEYS.KeyW?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
    KEYS.KeyW=false;
    const es=[...L.eshots.values()].reduce((a,b)=>a+b,0),gunHits=L.dmg.filter(d=>d[3]==='gun'),mel=L.dmg.filter(d=>d[3]!=='gun');
    return {floor:FLOOR.def.n,time:+(GAME.t-t0).toFixed(1),exit:exitT!=null,died,diedAt,dmg:Math.round(sumD()),bleed:Math.round(L.bleed||0),myShots:shots,enemyShots:es,gunHits:gunHits.length,meleeHits:mel.length,
      hostile:bad.length,attacked:bad.filter(E=>(L.eshots.get(E)||0)+(L.swings.get(E)||0)>0).length,surrendered:bad.filter(E=>L.surr.has(E)).length,dead:bad.filter(E=>E.dead).length,
      kills:L.kills.slice(),psych:bad.map(E=>E.psych||'-').join(''),rage:bad.filter(E=>E.fx&&E.fx.raged).length,retreat:bad.filter(E=>E.fx&&E.fx.retreated).length,ran:bad.filter(E=>E.fx&&E.fx.ran).length,err:L.err}; }

  /* ---- duel: one man who knows you're there, you stand still and never shoot ---- */
  function duel(o){ reset(); L.god=true; const px=o.lit?2:-8; PL.x=px; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; equip(HANDS.R,null); equip(HANDS.L,null);
    const E=solo(o.kind,px+o.dist,0,-Math.PI/2,'fight'); for(let k=0;k<20;k++) step(); setAware(E,'see'); const t0=GAME.t; let seeT=0,first=null,sure=null;
    while(GAME.t-t0<o.secs){ step(); if(E.canSee){ seeT+=dt; if(sure==null) sure=GAME.t-t0; } if(first==null&&L.eshots.get(E)) first=GAME.t-t0; }
    const dm=sumD(),n=L.dmg.length,sh=L.eshots.get(E)||0;
    return {kind:o.kind,dist:o.dist,lit:!!o.lit,playerLit:lit(PL.x,PL.z),sawYou:Math.round(100*seeT/o.secs)+'%',sureAt:sure&&+sure.toFixed(2),firstShot:first&&+first.toFixed(2),shots:sh,hits:n,acc:sh?+(n/sh).toFixed(2):null,dmg:dm,dps:+(dm/o.secs).toFixed(2),
      firstHit:n?+(L.dmg[0][0]-t0).toFixed(1):null,endDist:+Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z).toFixed(1)}; }

  /* ---- accuracy at a fixed distance: he stands and fires, you stand (no walking in) ---- */
  function acc(o){ reset(); L.god=true; PL.x=2; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,null); equip(HANDS.L,null);
    const E=solo(o.kind,2+o.dist,0,-Math.PI/2,'fight'); E.stay=true; for(let k=0;k<20;k++) step(); setAware(E,'see'); const t0=GAME.t;
    while(GAME.t-t0<o.secs){ E.pos[0]=2+o.dist; E.pos[1]=0; step(); }
    const sh=L.eshots.get(E)||0; return {kind:o.kind,dist:o.dist,shots:sh,hits:L.dmg.length,acc:sh?+(L.dmg.length/sh).toFixed(2):null}; }

  /* ---- muzzle flash: you're in the dark, he's lit, you fire once into the wall ---- */
  function flash(o){ reset(); L.god=true; const E=solo('gunman',2,0,Math.PI/2,'fight'); /* faces +x, away from you */ PL.x=2-o.dist; PL.z=0; equip(HANDS.R,newItem('pistol',undefined,!!o.sup)); equip(HANDS.L,null);
    for(let k=0;k<30;k++) step(); const before={aware:E.aware,canSee:E.canSee}; const t0=GAME.t; PL.yaw=-Math.PI/2; PL.pitch=0;
    const b=camBasis(); fireHand(HANDS.R,{o:b.eye,d:norm3([0,-.2,-1])}); /* into the floor at your feet: the flash, no hit */
    let aw=null,first=null,lightOut=null;
    while(GAME.t-t0<o.secs){ step(); if(aw==null&&E.aware) aw=GAME.t-t0; if(first==null&&L.eshots.get(E)) first=GAME.t-t0; if(lightOut==null&&aw!=null&&!lit(E.pos[0],E.pos[1])) lightOut=GAME.t-t0; }
    return {dist:o.dist,sup:!!o.sup,heLit:lit(2,0),youLit:lit(PL.x,PL.z),before,awareAt:aw&&+aw.toFixed(2),firstShot:first&&+first.toFixed(2),shots:L.eshots.get(E)||0,hits:L.dmg.length,outOfLightAt:lightOut&&+lightOut.toFixed(2),end:[+E.pos[0].toFixed(1),+E.pos[1].toFixed(1)]}; }

  /* ---- melee: a blade man who knows you're there, you stand still ---- */
  function melee(o){ reset(); L.god=true; PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,null); equip(HANDS.L,null);
    const E=solo(o.kind||'cutter',-4,0,-Math.PI/2,'fight'); for(let k=0;k<20;k++) step(); setAware(E,'see'); const t0=GAME.t; const sw=[]; let cur=null;
    while(GAME.t-t0<o.secs){ const prev=E.atkT; step();
      if(E.atkT>=0&&prev<0) cur={t:GAME.t-t0,dmg0:L.dmg.length,feint:!!(E.fx&&E.fx.feint),hitAt:null};
      if(cur&&cur.hitAt==null&&L.dmg.length>cur.dmg0) cur.hitAt=+(GAME.t-t0-cur.t).toFixed(2);
      if(cur&&E.atkT<0){ cur.len=+(GAME.t-t0-cur.t).toFixed(2); cur.t=+cur.t.toFixed(2); delete cur.dmg0; sw.push(cur); cur=null; } }
    const real=sw.filter(s=>!s.feint),fe=sw.filter(s=>s.feint);
    return {kind:o.kind||'cutter',swings:sw.length,feints:fe.length,feintHits:fe.filter(s=>s.hitAt!=null).length,realHits:real.filter(s=>s.hitAt!=null).length,hitAt:[...new Set(real.map(s=>s.hitAt))].slice(0,6),dmg:sumD(),list:sw.slice(0,8)}; }

  /* place a hand (flat screen: the harness owns HANDS.*.M; nothing else writes it with rendering off) */
  function handAt(h,p,fwd,up){ const z=norm3(fwd),x=norm3(v3.cross(up||[0,1,0],z)),y=v3.cross(z,x); const M=h.M; M.set([x[0],x[1],x[2],0, y[0],y[1],y[2],0, z[0],z[1],z[2],0, p[0],p[1],p[2],1]); h.itemW=null; }
  /* ---- block: a knife held across the line of his swing at the moment it lands ---- */
  function block(o){ const res=[]; for(let r=0;r<o.runs;r++){ reset(); L.god=true; PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,null); equip(HANDS.L,newItem('knife'));
    if(typeof PROTO!=='undefined'&&PROTO.fight) PROTO.fight.flatBlock=true;
    const E=solo('cutter',-6.6,0,-Math.PI/2,'fight'); E.fx=E.fx||{}; for(let k=0;k<10;k++) step(); setAware(E,'see'); const t0=GAME.t; let swung=0,blocked=0,hits=0,stag=0,feints=0;
    while(GAME.t-t0<o.secs){ /* the knife, flat across in front of your face/chest, between you and him */
      /* held across the line from his weapon hand to your face, 70% of the way to you (where a real block meets it) */
      const ex=X_(E.B,PI_.hdR),tg=v3.add(camBasis().eye,[0,-.1,0]),at=mid(ex,tg,.7),across=norm3(v3.cross(norm3(v3.sub(tg,ex)),[0,1,0]));
      if(o.on!==false) handAt(HANDS.L,v3.sub(v3.add(at,v3.sc(across,-.1)),FIST),across,[0,1,0]); else handAt(HANDS.L,[PL.x+.3,.9,PL.z+.3],[0,0,-1]);
      const prevA=E.atkT,d0=L.dmg.length,b0=(E.fx&&E.fx.blocks)||0; step();
      if(E.atkT>=0&&prevA<0){ swung++; if(E.fx&&E.fx.feint) feints++; }
      if(L.dmg.length>d0) hits++; if(E.fx&&(E.fx.blocks||0)>b0){ blocked++; if(E.stun>.3||E.fx.stagT>0) stag++; } }
    res.push({swung,feints,blocked,staggered:stag,hits,dmg:sumD()}); } return res; }
  /* ---- wrist catch: the left hand takes his weapon wrist during the wind-up ---- */
  function wrist(o){ const res=[]; for(let r=0;r<o.runs;r++){ reset(); L.god=true; PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,null); equip(HANDS.L,null);
    const E=solo('cutter',-6.4,0,-Math.PI/2,'fight'); E.fx=E.fx||{}; for(let k=0;k<10;k++) step(); setAware(E,'see'); const t0=GAME.t; let caught=null,interrupted=false,hit=false,dropped=false;
    while(GAME.t-t0<o.secs){ const d0=L.dmg.length; step(); if(L.dmg.length>d0&&caught) hit=true;
      if(!caught&&E.atkT>=(o.at||.15)){ const hp=X_(E.B,PI_.hdR); handAt(HANDS.L,v3.sub(hp,FIST),[0,0,-1]); const g=grabTarget(mulP(HANDS.L.M,FIST),.16); if(g&&g.E===E&&/^(hd|el)/.test(g.name)){ startGrab(HANDS.L,g); caught={t:GAME.t,at:+E.atkT.toFixed(2),name:g.name}; } }
      if(caught&&!interrupted&&E.atkT<0) interrupted=GAME.t-caught.t<.5;
      if(caught){ const hp=X_(E.B,PI_.hdR); if(o.yank&&GAME.t-caught.t>.2&&GAME.t-caught.t<.35){ handAt(HANDS.L,v3.add(mulP(HANDS.L.M,[0,0,0]),[0,-.12,.12]),[0,0,-1]); } }
      if(caught&&!E.wpnHeld) dropped=true; if(caught&&GAME.t-caught.t>1.2) break; }
    for(const G of GRABS.slice()) endGrab(G);
    res.push({caught:caught&&caught.name,atWind:caught&&caught.at,interrupted,hitWhileHeld:hit,dropped}); } return res; }

  /* ---- nerve: the split by floor ---- */
  function nerve(){ const out_={}; const n0=FLOOR.def&&FLOOR.def.n; for(const n of [1,6,12]){ if(FLOOR.def) FLOOR.def.n=n; const c={quit:0,fight:0,fake:0};
      for(let i=0;i<2000;i++){ const E={}; c[psychOf(E)]++; } out_['floor'+n]=Object.fromEntries(Object.entries(c).map(([k,v])=>[k,Math.round(v/20)])); }
    if(FLOOR.def) FLOOR.def.n=n0; return out_; }

  /* ---- witness: Beto dies. Chuy is beside him, Nacho is behind a wall far off, Lalo is 10 m away facing the other way ---- */
  function witness(o){ reset(); L.god=true; clearEnemies(); PL.x=-15; PL.z=0; equip(HANDS.R,null);
    const C=spawn('gunman','Nacho',-6,3.5,0),D=spawn('gunman','Lalo',-6,0,-Math.PI/2),A=spawn('gunman','Beto',3,0,Math.PI/2),B_=spawn('gunman','Chuy',4.5,0,-Math.PI/2); attachLabels(); /* Nacho first in the list: the old code had the first living man shout, wherever he was */
    for(let k=0;k<20;k++) step(); const t0=GAME.t; A.headshot=true; for(let k=0;k<60;k++) step();
    return {barks:L.barks.filter(b=>b[0]>=t0).map(b=>[+(b[0]-t0).toFixed(1),b[1],b[2]]),chuyAware:B_.aware,nachoAware:C.aware,laloAware:D.aware,rage:{Chuy:B_.rage||0,Nacho:C.rage||0,Lalo:D.rage||0}}; }

  /* ---- rage: Beto is shot dead in front of Chuy (a quitter) ---- */
  function rage(o){ reset(); L.god=true; clearEnemies(); PL.x=-4; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,newItem('pistol'));
    const A=spawn('gunman','Beto',1,0,-Math.PI/2,'fight'),B_=spawn('cutter','Chuy',3,.8,-Math.PI/2,'quit'); attachLabels(); for(let k=0;k<20;k++) step();
    const t0=GAME.t; window.__game.aimAt(X_(A.B,PI_.head)); fireHand(HANDS.R,{o:eye(),d:norm3(v3.sub(X_(A.B,PI_.head),eye()))}); for(let k=0;k<10;k++) step();
    const r0={dead:A.dead,rage:B_.rage||0,psych:B_.psych}; let minD=99; for(let k=0;k<150;k++){ step(); minD=Math.min(minD,Math.hypot(B_.pos[0]-PL.x,B_.pos[1]-PL.z)); }
    return {betoDead:r0.dead,chuyRage:+(r0.rage).toFixed(1),chuyPsych:r0.psych,closest:+minD.toFixed(1),swings:L.swings.get(B_)||0,dmg:sumD(),barks:L.barks.filter(b=>b[0]>=t0).map(b=>[+(b[0]-t0).toFixed(1),b[1],b[2]])}; }

  /* ---- quitter runs: he gives up under your gun, you turn away and stand there ---- */
  function quitrun(o){ reset(); L.god=true; clearEnemies(); PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,newItem('pistol'));
    const E=spawn('gunman','Kiko',-5.5,0,-Math.PI/2,'quit'),F=spawn('gunman','Toño',7,0,-Math.PI/2,'fight'); attachLabels(); for(let k=0;k<20;k++) step(); setAware(E,'see');
    const t0=GAME.t; let sT=null,away=null,ranT=null,alertT=null,toñoAware=null;
    while(GAME.t-t0<o.secs){ const t=GAME.t-t0; if(away==null){ window.__game.aimAt(X_(E.B,PI_.chest)); } else { PL.yaw=Math.PI/2; PL.pitch=-.3; }
      step(); if(E.surr&&sT==null) sT=t; if(sT!=null&&away==null&&E.st==='kneel'){ away=t+.5; }
      if(ranT==null&&E.fx&&E.fx.ran) ranT=t; if(alertT==null&&(L.alerts.length||E.fx&&E.fx.ranAlerted)) alertT=t; if(toñoAware==null&&F.aware) toñoAware=t; }
    return {surrAt:sT&&+sT.toFixed(1),gunOff:away&&+away.toFixed(1),ranAt:ranT&&+ranT.toFixed(1),alertAt:alertT&&+alertT.toFixed(1),alerts:L.alerts,friendAwareAt:toñoAware&&+toñoAware.toFixed(1),end:E.st+(E.surr?'/surr':'')+'@'+E.pos[0].toFixed(1),barks:L.barks.slice(-4)}; }

  /* ---- faker: he gives up under your gun; then your gun goes away and you either keep watching him, turn your back, or a friend of his is in view ---- */
  function faker(o){ reset(); L.god=true; clearEnemies(); PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,newItem('pistol')); equip(HANDS.L,null);
    const E=spawn('gunman','Faro',-5,0,-Math.PI/2,'fake'),M=o.friend?spawn('gunman','Mono',2,1.2,Math.PI/2,'fight'):null; attachLabels(); for(let k=0;k<20;k++) step(); setAware(E,'see'); if(M) M.stay=true;
    const t0=GAME.t; let off=null,spring=null,shot=null;
    while(GAME.t-t0<o.secs){ const t=GAME.t-t0;
      if(off==null){ window.__game.aimAt(X_(E.B,PI_.chest)); if(E.surr&&E.st==='kneel'&&E.surr.t>.6){ off=t; equip(HANDS.R,null); } }
      else if(o.turn){ PL.yaw=Math.PI/2; PL.pitch=0; } else window.__game.aimAt(X_(E.B,PI_.head));
      if(M){ M.pos[0]=2; M.pos[1]=1.2; M.aware=false; M.mind='calm'; M.st='idle'; }
      step(); if(off!=null&&spring==null&&!E.surr&&E.st==='alert') spring=t; if(spring!=null&&shot==null&&L.eshots.get(E)) shot=t; }
    return {turn:!!o.turn,friend:!!o.friend,gunOffAt:off&&+off.toFixed(1),sprangAfter:spring!=null&&off!=null?+(spring-off).toFixed(2):null,firstShotAfterSpring:shot!=null&&spring!=null?+(shot-spring).toFixed(2):null}; }

  /* ---- retreat: a gunman takes a round in the arm early on. Where does he go? ---- */
  function retreat(o){ reset(); L.god=true; clearEnemies(); PL.x=-6; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,newItem('pistol'));
    const E=spawn(o.kind||'gunman','Pepe',o.x??0,0,-Math.PI/2,'fight'); E.fx=E.fx||{}; if(o.force) E.fx.retreatRoll=0; attachLabels(); for(let k=0;k<20;k++) step(); setAware(E,'see'); for(let k=0;k<10;k++) step();
    const t0=GAME.t; const p=X_(E.B,PI_.shL); fireHand(HANDS.R,{o:eye(),d:norm3(v3.sub(p,eye()))});
    const tl=[]; let last='',inRoom=null,atDoor=null; PL.x=-9; /* you back off into the dark of the hall end */
    let waitT=null,door=null,closeT=null,ans=null;
    while(GAME.t-t0<o.secs){ KEYS.KeyW=false; const R_=E.fx&&E.fx.ret; if(R_&&R_.ph==='wait'&&waitT==null){ waitT=GAME.t; door=R_.door; }
      if(o.come&&door&&GAME.t-waitT>4&&Math.hypot(PL.x-door[0],PL.z-door[1])>.3){ const d=navTo(PL.x,PL.z,door[0],door[1]); PL.yaw=Math.atan2(-d[0],-d[2]); KEYS.KeyW=true; }
      if(closeT==null&&door&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<2.7) closeT=GAME.t; const s0=L.eshots.get(E)||0;
      step(); if(closeT!=null&&ans==null&&(L.eshots.get(E)||0)>s0) ans=+(GAME.t-closeT).toFixed(2); const u=typeof twUnitOf==='function'?twUnitOf(E.pos[0],E.pos[1]):null; const s=(E.fx&&E.fx.ret?E.fx.ret.ph:'-')+'/'+(u?'room'+u.id+(lit(E.pos[0],E.pos[1])?'(lit)':''):'hall');
      if(s!==last){ last=s; tl.push([+(GAME.t-t0).toFixed(1),s]); } if(u&&inRoom==null) inRoom=+(GAME.t-t0).toFixed(1); }
    KEYS.KeyW=false; return {retreated:!!(E.fx&&E.fx.retreated),shotsBeforeYouCame:closeT==null?(L.eshots.get(E)||0):null,answeredIn:ans,tl:tl.slice(0,10),end:[+E.pos[0].toFixed(1),+E.pos[1].toFixed(1)],st:E.st,blood:Math.round(E.blood)}; }

  /* ---- one shooter: three gunmen in the hall, all can see you ---- */
  function token(o){ reset(); L.god=true; clearEnemies(); PL.x=2; PL.z=0; PL.yaw=-Math.PI/2; equip(HANDS.R,null); equip(HANDS.L,null);
    const G=[spawn('gunman','Uno',6,0,-Math.PI/2,'fight'),spawn('gunman','Dos',7,.6,-Math.PI/2,'fight'),spawn('gunman','Tres',8,-.6,-Math.PI/2,'fight')]; attachLabels(); for(let k=0;k<20;k++) step(); for(const E of G) setAware(E,'see');
    const t0=GAME.t; let both=0,last=null,gaps=[],shotsT=[]; const _s=new Map();
    while(GAME.t-t0<o.secs){ for(const E of G){ E.pos[0]=Math.max(E.pos[0],4.5); } const n0=G.map(E=>L.eshots.get(E)||0); step(); const n1=G.map(E=>L.eshots.get(E)||0); const who=G.filter((E,i)=>n1[i]>n0[i]);
      for(const E of who){ shotsT.push([+(GAME.t-t0).toFixed(2),E.name]); } }
    const by={}; for(const [,n] of shotsT) by[n]=(by[n]||0)+1; let switches=0; for(let i=1;i<shotsT.length;i++) if(shotsT[i][1]!==shotsT[i-1][1]) switches++;
    let overlap=0; for(let i=1;i<shotsT.length;i++) if(shotsT[i][1]!==shotsT[i-1][1]&&shotsT[i][0]-shotsT[i-1][0]<.5) overlap++;
    return {shots:shotsT.length,by,switches,closeSwitches:overlap,hits:L.dmg.length,dmg:sumD(),first:shotsT.slice(0,8)}; }
  return {bot,duel,acc,flash,melee,block,wrist,nerve,witness,rage,quitrun,faker,retreat,token,step,L,lit};
})();`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  const fresh = async qs => { const page = await browser.newPage({ viewport: { width: 320, height: 180 } }); page.setDefaultTimeout(180000); page.on('pageerror', e => errs.push(qs + ' ' + String(e).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error') errs.push(qs + ' console ' + m.text().slice(0, 200)); });
    await page.goto(game + '?' + qs, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => !!window.__eval, null, { timeout: 60000 }); await page.waitForTimeout(350); await page.click('#start'); await page.waitForTimeout(250); await page.evaluate(s => window.__eval(s), CORE); return page; };
  const run = async (qs, fn, a) => { const p = await fresh(qs); const r = await p.evaluate(([fn, a]) => { try { return window.__F[fn](a); } catch (e) { return { ERR: String(e.stack).slice(0, 400) }; } }, [fn, a]); await p.close(); return r; };
  const qs = args.qs || 'f=1&proto=1&pf=0';
  if (test === 'bot') { const R = [];
    for (let i = 0; i < (args.runs || 20); i++) { const p = await fresh(qs);
      if (args.wpn) await p.evaluate(([k, s]) => window.__eval(`equip(HANDS.R,newItem('${k}',undefined,${s}))`), [args.wpn, !!args.sup]);
      const r = await p.evaluate(a => { try { return window.__F.bot(a); } catch (e) { return { ERR: String(e.stack).slice(0, 400) }; } }, { maxT: args.maxT || 240, sigma: args.sigma ?? 3, react: args.react ?? .6, gap: args.gap ?? .3 }); await p.close();
      if (!args.quiet) console.log(JSON.stringify(r)); R.push(r); }
    const ok = R.filter(r => !r.ERR), K = ok.flatMap(r => r.kills).filter(k => k.d != null), H = ok.reduce((s, r) => s + r.hostile, 0), sum = k => ok.reduce((s, r) => s + (r[k] || 0), 0);
    console.log('SUMMARY ' + JSON.stringify({ qs, runs: ok.length, wpn: args.wpn || 'kit', sup: !!args.sup, deaths: ok.filter(r => r.died).length, deathPct: Math.round(100 * ok.filter(r => r.died).length / ok.length),
      enemyShots: sum('enemyShots'), gunHits: sum('gunHits'), meleeHits: sum('meleeHits'), enemyAcc: sum('enemyShots') ? +(sum('gunHits') / sum('enemyShots')).toFixed(2) : null, dmgPerRun: Math.round(sum('dmg') / ok.length), zeroDmgRuns: ok.filter(r => !r.dmg).length,
      kills: K.length, killsOver8: K.filter(k => k.d > 8).length, killsOver8Pct: K.length ? Math.round(100 * K.filter(k => k.d > 8).length / K.length) : null, killDistMed: K.length ? K.map(k => k.d).sort((a, b) => a - b)[K.length >> 1] : null,
      surrPct: Math.round(100 * sum('surrendered') / H), attackPct: Math.round(100 * sum('attacked') / H), raged: sum('rage'), retreated: sum('retreat'), ran: sum('ran'), errors: ok.filter(r => r.err).length })); }
  else if (test === 'duel') { for (const lit of args.lit || [true, false]) for (const kind of args.kinds || ['gunman']) for (const dist of args.dists || [3, 6, 10, 16, 22]) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'duel', { kind, dist, lit, secs: args.secs || 30 }))); }
  else if (test === 'acc') { for (const kind of args.kinds || ['gunman']) for (const dist of args.dists || [3, 6, 10, 16, 22]) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'acc', { kind, dist, secs: args.secs || 60 }))); }
  else if (test === 'flash') { for (const sup of args.sups || [false, true]) for (const dist of args.dists || [5, 10, 16, 24]) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'flash', { dist, sup, secs: args.secs || 6 }))); }
  else if (test === 'melee') { for (let r = 0; r < (args.runs || 2); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'melee', { kind: args.kind || 'cutter', secs: args.secs || 40 }))); }
  else if (test === 'block') { console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'block', { runs: args.runs || 3, secs: args.secs || 20, on: args.on }))); }
  else if (test === 'wrist') { console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'wrist', { runs: args.runs || 8, secs: args.secs || 15, at: args.at, yank: args.yank }))); }
  else if (test === 'nerve') { console.log(JSON.stringify(await run(qs, 'nerve', {}))); }
  else if (test === 'witness') { for (let r = 0; r < (args.runs || 3); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'witness', {}))); }
  else if (test === 'rage') { for (let r = 0; r < (args.runs || 2); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'rage', {}))); }
  else if (test === 'quitrun') { for (let r = 0; r < (args.runs || 2); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'quitrun', { secs: args.secs || 40 }))); }
  else if (test === 'faker') { for (const c of [{}, { turn: true }, { friend: true }]) for (let r = 0; r < (args.runs || 2); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'faker', Object.assign({ secs: args.secs || 15 }, c)))); }
  else if (test === 'retreat') { for (let r = 0; r < (args.runs || 3); r++) console.log(JSON.stringify(await run(args.qs || 'f=1&proto=1&pf=0', 'retreat', { secs: args.secs || 30, force: args.force, x: args.x, kind: args.kind, come: args.come }))); }
  else if (test === 'token') { for (let r = 0; r < (args.runs || 2); r++) console.log(JSON.stringify(await run(args.qs || 'f=3&proto=1&pf=0', 'token', { secs: args.secs || 20 }))); }
  if (errs.length) console.log('ERRORS', JSON.stringify([...new Set(errs)].slice(0, 8)));
  await browser.close();
})();
