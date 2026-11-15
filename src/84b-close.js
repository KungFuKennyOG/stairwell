/* =====================================================================
   CLOSE QUARTERS (floor 01 prototype, ?proto=1): how they use the rooms once it's a fight. Called from fightMove (84-fight.js).
   From the bot runs: kills happened at a median of about a metre. Gunmen walked straight at you, blades walked into your face.
   - Doorways: a gunman who knows you're in another room doesn't walk out into the open. He takes the wall beside a doorway of
     his room (out of the light, out of your line), leans out, fires, leans back. You walking into his room, or getting within
     2.6 m, ends it; so does 18 s of it, or 10 s of leaning out to nothing. A rage or a push still comes straight on.
   - Spacing: a gunman who can see you wants 3 to 6 m. Inside about 2.8 m with a blade or your bare hands coming, he backs off a
     step or two (never into a wall); with your gun on him he only backs off inside 1.6 m. Between shots he sidesteps a little
     instead of standing like a post.
   - Falling back: hurt and not chosen for the ambush (fightHurt), he breaks your line and goes to the nearest friend. Together
     they come back as a pair: whoever's ahead waits for the other.
   - Blades: inside 2.6 m and between swings a blade man circles you at about 1.75 m, changing sides, and steps in when his swing
     is ready (the wind-up you can read is 84-fight.js's). Nobody, blade or gun, stands closer than .62 m to your head unless he
     has hold of you (82-clinch.js places those).
   The grabs themselves are 82-clinch.js's; this file only keeps men out of your face until one starts. Throttled: spot searches
   at most every 1.5 s per man, a few sight tests each.
   Fields: E.fx.cov {ph:'go'|'hold'|'peek'}, E.fx.bk (backing off), E.fx.sf (sidestep), E.fx.reg / E.fx.push (regroup), E.fx.cir.
   ===================================================================== */
PROTO.close={
  coverD:[2.6,16], coverWalk:9, coverMax:18, coverDry:10, coverCd:6,  /* m from Ray / m of walking to the door / s in all / s leaning out to nothing / s before another */
  peek:[1.1,1.9], hide:[1.3,2.6],                                      /* s out, s back */
  keepMin:3, knifeR:2.8, gunR:1.6, backStep:1.3, strafeEvery:[2.4,4], strafe:[.7,1.2],
  regroupBlood:75, regroupT:8, pushT:14, buddyGap:2.4,
  circleR:1.75, circleIn:2.6, headMin:.7, headMinH:.58 }; /* m: his feet / his head from your eyes, unless he has hold of you */
const CQ=k=>pnum('close',k,PROTO.close[k]);
const cqR=k=>{ const r=CQ(k); return rnd(r[0],r[1]); };
const cqGun=E=>armed(E)&&!!E.M; /* a man with a gun in his hands (blades and fists are !armed) */
function cqRayKind(){ let gun=false,blade=false; for(const h of [HANDS.L,HANDS.R]){ const w=h.item&&WPN[h.item.key]; if(!w) continue; if(w.gun) gun=true; else if(w.melee) blade=true; } return gun?'gun':blade?'melee':'hands'; }
function cqOk(x,z,W,roomy){ const c=navCell(x,z); return c>=0&&!FLOOR.nav[c]&&(!W||W[c]<1e9)&&(!roomy||fxFree(x,z)); } /* roomy: all four neighbours free too (open floor); a spot against a doorframe isn't */
const cqHead=(x,z)=>[x,1.45,z];

/* ---------- the guard: never inside your head ---------- */
function cqGuard(E){ if(E.clinch||E.grabbed||E.st!=='alert') return; const m=CQ('headMin'),hm=CQ('headMinH');
  let dx=E.pos[0]-PL.x,dz=E.pos[1]-PL.z,d=Math.hypot(dx,dz);
  if(d<m){ const k=d>1e-3?m/d:0; if(k){ E.pos[0]=PL.x+dx*k; E.pos[1]=PL.z+dz*k; } else { E.pos[0]=PL.x+Math.sin(E.hd)*m; E.pos[1]=PL.z+Math.cos(E.hd)*m; } }
  /* his head leans into a swing: keep that out of your face too (feet and head both) */
  const h=X_(E.B,PI_.head),hx=h[0]-PL.x,hz=h[2]-PL.z,hd=Math.hypot(hx,hz); if(hd<hm&&hd>1e-3){ const push=hm-hd; E.pos[0]+=hx/hd*push; E.pos[1]+=hz/hd*push; } }
/* ---------- doorways ---------- */
function cqCoverSpot(E,ray){ const mine=fxRoomOf(E.pos[0],E.pos[1]),yours=fxRoomOf(ray[0],ray[1]); if(!mine||!yours||mine===yours) return null;
  const W=fieldTo(E.pos[0],E.pos[1]); if(!W) return null; const tgt=[ray[0],1.4,ray[1]]; let best=null,bs=-1e9,tests=0;
  for(const d of mine.doors){ const toR=norm3([ray[0]-d.x,0,ray[1]-d.z]),facing=-(d.n[0]*toR[0]+d.n[1]*toR[2]); if(facing<.1) continue; /* a door that opens toward you */
    for(const s of [-1,1]) for(const [dp,lat] of [[.5,.8],[.4,.95],[.7,.75]]){ const lx=-d.n[1]*s,lz=d.n[0]*s;
      const H=[d.x+d.n[0]*dp+lx*lat,d.z+d.n[1]*dp+lz*lat];
      if(!cqOk(H[0],H[1],W)||!fxIn(mine,H[0],H[1])) continue;
      /* where he leans out to: just inside the frame, in it, or a half-step through (down a hall you have to be in the opening to see) */
      let P=null; for(const [pd,pl] of [[.4,.3],[.12,.2],[-.2,.15]]){ const q=[d.x+d.n[0]*pd+lx*pl,d.z+d.n[1]*pd+lz*pl]; if(cqOk(q[0],q[1])&&sightClear(cqHead(q[0],q[1]),tgt)){ P=q; break; } }
      const walk=W[navCell(H[0],H[1])]/40; if(walk>CQ('coverWalk')) continue;
      const dr=Math.hypot(H[0]-ray[0],H[1]-ray[1]); if(dr<CQ('coverD')[0]) continue;
      if(++tests>8) break;
      if(!P) continue; /* leaning out has to show him you, or it's not cover, it's hiding */
      const hid=!sightClear(cqHead(H[0],H[1]),tgt);
      const sc=(hid?4:-2)+3+facing*2-walk/3+(fxLitAt(H[0],H[1])?-2.5:0)+(dr>3&&dr<10?1:0)+Math.random()*.3;
      if(sc>bs){ bs=sc; best={H,P,door:[d.x,d.z]}; } break; } }
  return bs>1?best:null; }
function cqCover(E,dt,fighting,dist){ const F=E.fx,now=GAME.t,C=F.cov;
  const ray=E.canSee?[PL.x,PL.z]:E.lkp; if(!ray){ F.cov=null; return null; }
  if(C){ C.t+=dt; const yours=fxRoomOf(PL.x,PL.z),mine=fxRoomOf(E.pos[0],E.pos[1]);
    if(dist<CQ('coverD')[0]||yours&&yours===mine&&C.ph!=='go'||C.t>CQ('coverMax')||C.dry>CQ('coverDry')||E.rage>0){ F.cov=null; F.covCd=now+CQ('coverCd'); return null; }
    if(C.ph==='go'){ if(Math.hypot(E.pos[0]-C.H[0],E.pos[1]-C.H[1])>.18&&!(C.t>1.2&&stuck(E,dt))&&C.t<7) return {goal:{x:C.H[0],z:C.H[1],sp:2.1},chase:false};
      C.ph='hold'; C.pt=0; C.hideT=cqR('hide')*.6; }
    if(C.ph==='hold'&&E.canSee&&C.pt>1.4&&!C.moved){ C.moved=true; const s=cqCoverSpot(E,[PL.x,PL.z]); if(s&&Math.hypot(s.H[0]-C.H[0],s.H[1]-C.H[1])>.3){ C.H=s.H; C.P=s.P; C.door=s.door; } } /* you can still see him there: one better spot */
    if(C.ph==='hold'){ C.pt+=dt; if(Math.hypot(E.pos[0]-C.H[0],E.pos[1]-C.H[1])>.25&&C.pt<1.5) return {goal:{x:C.H[0],z:C.H[1],sp:1.6},chase:false}; /* back to his mark after leaning out */ const dh=wrapA(Math.atan2(C.door[0]-E.pos[0],C.door[1]-E.pos[1])-E.hd); E.hd+=clamp(dh,-2.5*dt,2.5*dt);
      if(C.pt>C.hideT&&(!FGT.token||FGT.token===E||!(FGT.token.canSee))){ C.ph='peek'; C.pt=0; C.peekT=cqR('peek'); C.cd0=E.atkCd; }
      return {goal:null,chase:false}; }
    /* leaning out */
    C.pt+=dt; if(!E.canSee) C.dry+=dt; else C.dry=0;
    const shot=E.atkCd>C.cd0+.2; C.cd0=Math.min(C.cd0,E.atkCd);
    if(C.pt>C.peekT||shot&&C.pt>.5||E.hitT<.05){ C.ph='hold'; C.pt=0; C.hideT=cqR('hide'); return {goal:{x:C.H[0],z:C.H[1],sp:1.8},chase:false}; }
    if(Math.hypot(E.pos[0]-C.P[0],E.pos[1]-C.P[1])>.15) return {goal:{x:C.P[0],z:C.P[1],sp:1.4},chase:false};
    return {goal:null,chase:false}; }
  if(!cqGun(E)||E.rage>0||F.push||now<(F.covCd||0)||dist<CQ('coverD')[0]||dist>CQ('coverD')[1]) return null;
  F.covChk=(F.covChk||0)-dt; if(F.covChk>0) return null; F.covChk=1.5;
  const s=cqCoverSpot(E,ray); if(!s){ return null; }
  F.cov={ph:'go',H:s.H,P:s.P,door:s.door,t:0,dry:0}; freshGoal(E); if(FGT.token===E) FGT.token=null;
  if(E.barkCd<=0&&Math.random()<.5) bark(E,pick(['Stay in there!','I got the door—','He\'s in the '+((fxRoomOf(ray[0],ray[1])||{}).id==='H'?'hall':'next room')+'—']),1.6);
  return {goal:{x:s.H[0],z:s.H[1],sp:2.1},chase:false}; }

/* ---------- spacing and sidesteps for a gunman who can see you ---------- */
function cqKeep(E,dt,fighting,dist){ const F=E.fx,now=GAME.t; if(!cqGun(E)||!fighting||E.rage>0) { F.bk=null; F.sf=null; return null; }
  if(F.bk){ if(now>F.bk.until||Math.hypot(E.pos[0]-F.bk.x,E.pos[1]-F.bk.z)<.25||stuck(E,dt)&&now-F.bk.t0>.5){ F.bk=null; F.bkCd=now+.6; } else return {goal:{x:F.bk.x,z:F.bk.z,sp:1.7},chase:false}; }
  const rk=cqRayKind(),close=rk==='gun'?CQ('gunR'):CQ('knifeR');
  if(dist<close&&now>(F.bkCd||0)&&!(E.atkT>=0)){ const ax=E.pos[0]-PL.x,az=E.pos[1]-PL.z,L=Math.hypot(ax,az)||1,W=fieldTo(E.pos[0],E.pos[1]);
    for(const st of [CQ('backStep'),.8]) for(const a of [0,.6,-.6,1.1,-1.1,1.6,-1.6]){ const c=Math.cos(a),s=Math.sin(a),x=E.pos[0]+(ax*c-az*s)/L*st,z=E.pos[1]+(ax*s+az*c)/L*st;
      if(!cqOk(x,z,W)||Math.hypot(x-PL.x,z-PL.z)<dist+.2) continue; F.bk={x,z,t0:now,until:now+1.1}; freshGoal(E); return {goal:{x,z,sp:1.7},chase:false}; } /* back, or along the wall */
    F.bkCd=now+1;
    /* cornered with you on top of him and his gun no use this close: he grabs you (82-clinch.js, with its warning beat) */
    if(dist<1.2&&!PL.grab&&now>(E.clCd||0)&&typeof clnTell==='function'&&typeof clnCan==='function'&&clnCan(E)) clnTell(E,'collar',{});
    return null; }
  /* sidesteps: only the man shooting (or anyone close), every few seconds, along the line across you, keeping his line */
  if(F.sf){ if(now>F.sf.until||Math.hypot(E.pos[0]-F.sf.x,E.pos[1]-F.sf.z)<.2||stuck(E,dt)){ F.sf=null; F.sfAt=now+cqR('strafeEvery'); } else return {goal:{x:F.sf.x,z:F.sf.z,sp:1.25},chase:false}; }
  if(F.sfAt==null) F.sfAt=now+cqR('strafeEvery');
  if(now>F.sfAt&&dist>=CQ('keepMin')*.8&&dist<10&&(FGT.token===E||dist<4)&&!(E.atkT>=0)&&E.burstN<=0){ F.sfAt=now+cqR('strafeEvery');
    const ax=E.pos[0]-PL.x,az=E.pos[1]-PL.z,L=Math.hypot(ax,az)||1,sd=Math.random()<.5?-1:1,k=cqR('strafe');
    for(const g of [sd,-sd]){ const x=E.pos[0]+(-az/L)*g*k,z=E.pos[1]+(ax/L)*g*k; if(!cqOk(x,z)||!sightClear(cqHead(x,z),[PL.x,1.4,PL.z])) continue;
      F.sf={x,z,until:now+1.1}; freshGoal(E); return {goal:{x,z,sp:1.25},chase:false}; } }
  return null; }

/* ---------- falling back to a friend, and coming back as two ---------- */
function cqRegroupStart(E){ const F=fxOf(E); if(F.reg||F.push||F.ret||E.rage>0||!cqGun(E)&&!E.wpnHeld||E.blood>CQ('regroupBlood')&&(E.wounds||[]).length<1) return false;
  const to=fxFriend(E); if(!to||to.hj||to.fx&&(to.fx.ret||to.fx.run||to.fx.reg)||Math.hypot(to.pos[0]-E.pos[0],to.pos[1]-E.pos[1])>14) return false;
  F.reg={ph:'go',to,t:0}; if(F.cov) F.cov=null; if(FGT.token===E) FGT.token=null; freshGoal(E);
  if(E.barkCd<=0) bark(E,pick(['I\'m hit— '+to.name+'!',to.name+'! Over here—','Fuck— I\'m hit—']),1.8); vox(E,'shout',.8); return true; }
function cqRegroup(E,dt,fighting,dist){ const F=E.fx,R=F.reg,now=GAME.t; if(!R) return null; R.t+=dt; const to=R.to;
  if(!to||to.dead||!upright(to)||to.surr||E.rage>0||R.t>CQ('regroupT')+3){ F.reg=null; return null; }
  if(R.ph==='go'){ const d=Math.hypot(to.pos[0]-E.pos[0],to.pos[1]-E.pos[1]);
    if((d>1.9||E.canSee)&&R.t<CQ('regroupT')&&!(R.t>1.5&&stuck(E,dt))) return {goal:{x:to.pos[0],z:to.pos[1],sp:2.3},chase:false};
    R.ph='set'; R.t=0; if(to.barkCd<=0) bark(to,pick(['Where?','Together— with me.','OK. Go, go.']),1.4); }
  if(R.t<1.2) return {goal:null,chase:false};
  const lkp=(E.lkp||to.lkp||[PL.x,PL.z]).slice(); F.reg=null;
  for(const [A,B] of [[E,to],[to,E]]){ const G=fxOf(A); if(A!==E&&(A.hj||G.ret||G.run)) continue; G.push={buddy:B,lkp,until:now+CQ('pushT')}; G.cov=null; freshGoal(A); }
  return null; }
function cqPush(E,dt,fighting,dist){ const F=E.fx,P=F.push,now=GAME.t; if(!P) return null;
  if(now>P.until||fighting||E.rage>0){ F.push=null; return null; } /* he sees you: the fight takes it from here, side by side */
  const B=P.buddy; if(B&&!B.dead&&upright(B)){ const me=Math.hypot(E.pos[0]-P.lkp[0],E.pos[1]-P.lkp[1]),him=Math.hypot(B.pos[0]-P.lkp[0],B.pos[1]-P.lkp[1]);
    if(me+CQ('buddyGap')<him) return {goal:null,chase:false}; } /* ahead of him: wait */
  if(Math.hypot(E.pos[0]-P.lkp[0],E.pos[1]-P.lkp[1])<.8){ F.push=null; return null; }
  return {goal:{x:P.lkp[0],z:P.lkp[1],sp:1.6},chase:false}; }

/* ---------- blades: circle between swings ---------- */
function cqCircle(E,dt,fighting,dist){ const F=E.fx,now=GAME.t;
  if(armed(E)||!fighting||E.grabbed||E.atkT>=0||dist>CQ('circleIn')||E.rage>0&&E.atkCd<=.4){ F.cir=null; return null; }
  if(E.atkCd<=.12) { F.cir=null; return null; } /* ready: he steps in (think()'s chase) and swings */
  if(!F.cir||now>F.cir.until||stuck(E,dt)&&now-F.cir.t0>.4){ const s0=F.cir?-F.cir.s*(Math.random()<.6?1:-1):(Math.random()<.5?-1:1),a0=Math.atan2(E.pos[0]-PL.x,E.pos[1]-PL.z),W=fieldTo(E.pos[0],E.pos[1]);
    let got=null; for(const s of [s0,-s0]){ for(const da of [.55,.85,.35,1.15]) for(const r of [CQ('circleR'),1.5,2.0]){ const x=PL.x+Math.sin(a0+s*da)*r,z=PL.z+Math.cos(a0+s*da)*r,c=navCell(x,z);
        if(c<0||FLOOR.nav[c]||!W||W[c]>=1e9) continue; const straight=Math.hypot(x-E.pos[0],z-E.pos[1]); if(W[c]/40>straight*1.35+.4) continue; /* round the far side of a wall is not circling */
        got={s,x,z}; break; } if(got) break; }
    if(!got){ F.cir={s:-s0,t0:now,until:now+.5,x:E.pos[0],z:E.pos[1]}; return null; } /* no room to circle: he just fights (think()'s chase and swing) */
    F.cir={s:got.s,x:got.x,z:got.z,t0:now,until:now+rnd(.6,1.2)}; freshGoal(E); }
  return {goal:{x:F.cir.x,z:F.cir.z,sp:1.35},chase:false}; }

/* ---------- the order (fightMove asks this after run/retreat/rage) ---------- */
function closeMove(E,dt,fighting,dist){ if(!PROTO.on||E.civ||E.ally) return null; cqGuard(E);
  return cqRegroup(E,dt,fighting,dist)||cqPush(E,dt,fighting,dist)||cqCircle(E,dt,fighting,dist)||cqKeep(E,dt,fighting,dist)||cqCover(E,dt,fighting,dist); }
/* fightMayFire: behind the doorframe he doesn't fire (leaning out he does) */
const closeHolding=E=>!!(E.fx&&E.fx.cov&&E.fx.cov.ph!=='peek');
protoOn('reset',()=>{ for(const E of enemies) if(E.fx){ E.fx.cov=E.fx.bk=E.fx.sf=E.fx.reg=E.fx.push=E.fx.cir=null; } });
