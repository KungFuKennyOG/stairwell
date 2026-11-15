/* =====================================================================
   HOW THEY FIGHT (floor 01 prototype, agent E). Only with PROTO.on; the 15-floor game plays exactly as before.
   From the bot runs: men could not shoot back past 7-11 m and could not see you in the dark, so the safe play was to shoot from
   the dark at men in lit rooms. A lone gunman was slow and inaccurate, half the floor gave up, and "You killed X!" came through walls.
   - Range: every enemy gun reaches 25 m. Accuracy falls off with distance instead of stopping dead.
   - Your muzzle flash gives you away: anyone with a line to it within 40 m (6 m suppressed) knows exactly where you are and the
     shooter answers at once, dark or not. Men in a lit room who know you're near get out of the light.
   - The first shot is the dangerous one: 0.6-1.0 s after he's sure, and 55% inside 4 m for a pistol.
   - One shooter at a time (a floor-level token). The others spread out or hold till it's their turn. Inside 3.5 m nobody waits.
   - Melee you can read: a 0.4 s wind-up with the arm up before every swing, one in five a feint. Catch the wrist in the wind-up
     (your empty hand on his weapon hand or elbow) and the swing dies; hold your weapon across the line of it and it clangs off.
   - Rage: a man who sees a friend die (12 m, line of sight) charges for 20 s, aims worse, never gives up (src.rage on his blows for
     agent A's damage). A quitter who sees it fights.
   - "You killed X!" only from a man who saw it, or was within 4 m.
   - A fighter hurt early backs into the nearest dark room and waits beside its doorway for 15-30 s.
   - Nerve by floor (quit/fight/fake). Fakers come up shooting sooner when you look away or a friend of theirs is in view.
   - A surrendered quitter left alone with your gun off him for 10-20 s gets up and runs for his friends.
   - Close quarters (84b-close.js, asked first in fightMove after rage): doorway lean-outs, 3-6 m spacing and sidesteps, a hurt man
     falling back to a friend and coming back as a pair, blades circling between swings, nobody standing in your face.
   Fields other systems can read: E.rage (s left, agent C's tackles), E.fx.* (this file's per-man state), FGT.token (the man shooting).
   Reads: E.winded (agent B: s; slows his next swing), E.openT (agent B: no swing till then), huntAlert/huntLitAt (agent D), PF.rooms/PF.openings/pfIn (agent F),
   rayHead/rayConcealment (agent G). Damage to Ray is agent A's: blows and rounds pass hurtPlayer(d,{E,kind,w,n,mz,dist,rage}).
   With agent D: D's HUNT.flashT makes Ray 'lit' for 1.4 s within 16 m of a loud shot (the eyes). This file adds who learns where
   he is, out to 40 m, and who answers; a suppressed shot only within 6 m.
   ===================================================================== */
PROTO.fight={
  range:25,                                   /* m, every enemy gun */
  accMul:1.83,                                /* KSTAT acc is mid range; inside 4 m it's this much better (pistol .30 -> .55) */
  accCurve:[[4,1],[8,.68],[14,.42],[25,.18]], /* x the close accuracy, by distance (pistol: 55% at 4 m, 37% at 8, 23% at 14, 10% at 25) */
  firstAcc:1,                                 /* x accuracy of the first round after he's sure (the danger is the timing; raise to make it nastier) */
  first:[.6,1.0],                             /* s from sure to that round */
  freshGap:3,                                 /* s out of sight before a new sighting is fresh again (first-shot timing) */
  cdMul:1,                                    /* the shooter's cadence, x KSTAT cd (agent A's damage already makes each round count) */
  takeGap:[.3,.6],                            /* s a man who just took the token waits before firing */
  closeFree:3.5,                              /* m: this close, nobody waits his turn (the token is for gunfights across a room, not arm's length) */
  flashR:40, flashSupR:6, flashT:2.5,         /* who sees your flash, and how long it shows you to him */
  flashAim:[.15,.3], darkAcc:.8,              /* the answer: time to swing the gun on; aimed at a flash, not a man */
  lightOut:[.2,.7], darkHold:[5,9],           /* s before a lit man moves for the dark, and how long he holds there */
  wind:.4, strike:.18, feint:.2, feintCd:[.35,.6], swingCd:[1.4,2.4], winded:.2,
  blockR:.1, stagger:.5, flatBlock:false,     /* flatBlock: let the desk/harness hands block too (VR only otherwise) */
  rageT:20, rageR:12, rageAcc:.6, rageSp:2.6,   /* (the harder hits are agent A's: hurtPlayer gets src.rage) */
  witnessR:4,
  retreat:.45, retreatBlood:60, retreatWait:[15,30], retreatR:12,
  nerve:[[4,[.4,.5,.1]],[9,[.25,.6,.15]],[99,[.1,.7,.2]]], /* up to floor n: [quit, fight, fake] */
  quitRun:[10,20], quitRunT:6 };
const FGT={token:null,tokenT:0,rooms:null};
const fxOf=E=>E.fx||(E.fx={});
const fxR=k=>{ const r=pnum('fight',k,[0,0]); return rnd(r[0],r[1]); };
const fxFloorN=()=>FLOOR.mode==='proto'?1:(FLOOR.def&&FLOOR.def.n)||FLOOR.n||1;

/* ---------- nerve ---------- */
function fightNerve(r){ const T=pnum('fight','nerve',[]),n=fxFloorN(),row=(T.find(t=>n<=t[0])||T[T.length-1]||[0,[.35,.45,.2]])[1];
  return r<row[0]?'quit':r<row[0]+row[1]?'fight':'fake'; }

/* ---------- light, rooms, open floor ---------- */
/* lit: inside a lamp's pool with a line to the lamp, the same rule agent D uses for Ray (huntLitAt), so "in the dark" means the same for both */
function fxLitAt(x,z){ if(typeof huntLitAt==='function') return huntLitAt(x,z);
  for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0]; if(Math.hypot(p[0]-x,p[2]-z)<l[2]*.45&&sightClear([p[0],Math.max(p[1],1.2),p[2]],[x,1.3,z])) return true; }
  return false; }
function fxFree(x,z){ const c=navCell(x,z); if(c<0||FLOOR.nav[c]) return false; const ci=c%NX;
  for(const q of [c-1,c+1,c-NX,c+NX]){ if(q<0||q>=FLOOR.nav.length||Math.abs((q%NX)-ci)>1||FLOOR.nav[q]) return false; } return true; }
const fxIn=(r,x,z)=>!!r&&(r.src&&typeof pfIn==='function'?pfIn(r.src,x,z):x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1); /* the prototype's rooms can be L-shaped (85-pfloor.js) */
function fxRooms(){ if(FGT.rooms) return FGT.rooms; const out=[];
  if(FLOOR.mode==='proto'&&typeof PF!=='undefined'&&PF&&PF.rooms){ for(const r of PF.rooms){ const R={x0:Math.min(r.x0,r.x1),x1:Math.max(r.x0,r.x1),z0:Math.min(r.z0,r.z1),z1:Math.max(r.z0,r.z1),lit:!!r.lit,doors:[],id:r.id,src:r.rects?r:null};
      for(const o of PF.openings||[]){ if(o.a!==r.id&&o.b!==r.id||o.kind==='chain'||o.kind==='hole') continue; for(const n of [[1,0],[-1,0],[0,1],[0,-1]]) if(fxIn(R,o.x+n[0]*.7,o.z+n[1]*.7)){ R.doors.push({x:o.x,z:o.z,n}); break; } }
      out.push(R); } }
  else if(FLOOR.mode==='camp'&&FLOOR.units){ for(const u of FLOOR.units){ const R={x0:u.x0,x1:u.x1,z0:u.side>0?1:-6,z1:u.side>0?6:-1,doors:[{x:u.door,z:u.side,n:[0,u.side]}],id:u.id};
      let n=0; for(let i=0;i<4;i++) for(let k=0;k<3;k++) if(fxLitAt(R.x0+(i+.5)*(R.x1-R.x0)/4,R.z0+(k+.5)*(R.z1-R.z0)/3)) n++; R.lit=n>=4; out.push(R); } }
  return FGT.rooms=out; }
const fxRoomOf=(x,z)=>fxRooms().find(r=>fxIn(r,x,z))||null;
function fxFriend(E){ let best=null,bd=1e9; for(const O of enemies){ if(O===E||O.dead||O.civ||O.ally||O.surr||!upright(O)||O.fx&&O.fx.run) continue;
    const d=Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])-(armed(O)?2:0); if(d<bd){ bd=d; best=O; } } return best; }

/* ---------- where Ray is (agent G: crouched, under a bed) ---------- */
const fxHead=()=>typeof rayHead==='function'?rayHead():[PL.x,1.62+(PL.y||0),PL.z];
/* what they aim at: just below his eyes (the old fixed 1.45 m when standing), down with him when he crouches or lies under a bed */
function fightAimPt(){ const h=fxHead(); return [h[0],Math.max(.12,h[1]-.17),h[2]]; }
const fxConceal=E=>typeof rayConcealment==='function'?rayConcealment(E):1;
/* ---------- accuracy ---------- */
function fxCurve(d){ const C=pnum('fight','accCurve',[[4,1]]); if(d<=C[0][0]) return C[0][1];
  for(let i=1;i<C.length;i++) if(d<=C[i][0]){ const a=C[i-1],b=C[i]; return lerp(a[1],b[1],(d-a[0])/(b[0]-a[0])); } return C[C.length-1][1]; }
function fxAcc(E,KS,d){ return KS.shotgun?KS.acc*(d<=4?1.6-d/5:Math.max(.05,.8*(1-(d-4)/14))):KS.acc*pnum('fight','accMul',1.83)*fxCurve(d); }
/* the chance one round finds you (called from enemyShoot) */
function fightPHit(E,KS,d,hurtArm){ const F=fxOf(E); let a=fxAcc(E,KS,d)*hurtArm*(E.aimMul??1);
  if(F.firstPend){ F.firstPend=false; a*=pnum('fight','firstAcc',1.15); }
  if(E.rage>0) a*=pnum('fight','rageAcc',.6);
  if(F.byFlash) a*=pnum('fight','darkAcc',.8)*Math.max(.3,F.conc??1); /* he's aiming at where the flash was, at whatever of you shows */
  return clamp(a,0,.92); }

/* ---------- eyes: called from think() right after senses() ---------- */
function fightSense(E,dt,dist){ if(E.civ||E.ally) return; const F=fxOf(E),now=GAME.t;
  if(E.rage>0) E.rage=Math.max(0,E.rage-dt);
  if(F.stagT>0) F.stagT-=dt;
  /* the flash: for a moment after your shot he sees you, dark or not, as long as he still has a line to you */
  F.byFlash=false;
  if(F.revealT>now&&upright(E)&&!E.canSee){ F.rvT=(F.rvT||0)-dt; if(F.rvT<=0){ F.rvT=.2; F.conc=fxConceal(E); F.rvOk=F.conc>.15&&sightClear(X_(E.B,PI_.head),fxHead()); } if(F.rvOk){ E.canSee=true; F.byFlash=true; } }
  /* (fully hidden, under a bed: he knows where the shot came from, E.lkp, but has nothing to aim at; agent D's searchers come and look) */
  if(E.canSee){ const q=F.seenAt||(F.seenAt=[0,0]); q[0]=PL.x; q[1]=PL.z; } /* where he last saw you (a quitter who runs tells them this) */
  const sure=E.aware&&E.canSee&&upright(E);
  if(sure){ F.unseen=0;
    if(!F.sure){ F.sure=true;
      if(now-(F.quickT??-99)<.6){} /* answering your flash: already swinging the gun on */
      else if(now-(F.lostAt??-99)>pnum('fight','freshGap',3)&&armed(E)){ E.atkCd=fxR('first'); F.firstPend=true; } } }
  else { if(F.sure){ F.sure=false; F.lostAt=now; } F.unseen=(F.unseen||0)+dt; }
  /* hit early: some fighters back off into a dark room and wait at its door */
  if(E.hitT<.05){ if(!F.hitSeen){ F.hitSeen=true; fightHurt(E,dist); } } else F.hitSeen=false; }

/* ---------- may he fire? (think(), with his line, cooldown and stun already checked) ---------- */
function fightMayFire(E,dist){ if(dist>pnum('fight','range',25)) return false; const F=E.fx||{};
  if(F.run) return false;
  if(F.ret&&F.ret.ph==='wait'&&dist>3) return false; /* lying in wait: not till you're through the door */
  if(typeof closeHolding==='function'&&closeHolding(E)&&dist>3) return false; /* behind the doorframe: he fires when he leans out (84b-close.js) */
  if(E.rage>0||E.sprung>0||GAME.t-(F.sprangT??-99)<2||dist<pnum('fight','closeFree',3.5)) return true; /* a man in a rage, a faker coming up and a man you're on top of don't wait their turn */
  return FGT.token===E; }
/* the token: one man shoots, whoever has the best line. It moves when he loses you, goes down or runs dry of reasons */
const fxTokOk=E=>E&&!E.dead&&!E.civ&&!E.ally&&E.st==='alert'&&!E.surr&&armed(E)&&E.aware&&!E.grabbed&&!(E.fx&&(E.fx.run||E.fx.ret&&E.fx.ret.ph==='wait'));
function fightToken(){ let T=FGT.token;
  if(T&&(!fxTokOk(T)||(T.fx&&T.fx.unseen>.6)||Math.hypot(T.pos[0]-PL.x,T.pos[1]-PL.z)>pnum('fight','range',25))) FGT.token=T=null;
  if(T||PL.dead) return; const now=GAME.t; let best=null,bs=0;
  for(const E of enemies){ if(!fxTokOk(E)||!E.canSee) continue; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(d>pnum('fight','range',25)) continue;
    let al=.5; if(E.M){ const g=gunRay(E); al=clamp(v3.dot(g.d,norm3(v3.sub(fightAimPt(),g.mz))),0,1); }
    const s=fxAcc(E,kst(E)||{acc:.3},d)*(.5+.5*al)*(E.fx&&E.fx.revealT>now?1.3:1)*(E.stun<.3?1:.5); if(s>bs){ bs=s; best=E; } }
  if(!best) return; FGT.token=best; FGT.tokenT=now; const F=fxOf(best);
  if(now-(F.quickT??-99)>.6) best.atkCd=Math.max(best.atkCd,fxR('takeGap')); } /* a beat to settle on you; answering your flash he doesn't wait */

/* ---------- the flash (the 'fire' event) ---------- */
function fightFlash(info){ const now=GAME.t,sup=!!info.sup,R=sup?pnum('fight','flashSupR',6):pnum('fight','flashR',40),e=fxHead();
  let mz=info.muzzle; if(!mz||Math.hypot(mz[0]-e[0],mz[2]-e[2])>1.5) mz=[e[0],e[1]-.25,e[2]]; /* a hand matrix nobody has posed this frame (rendering off, the desk test bots): the flash is where you are */
  let seen=0; /* (agent D's HUNT.flashT does the short version for the eyes: Ray lit for 1.4 s within 16 m of a loud shot. This is the rest: who knows, how far, who answers) */
  for(const E of enemies){ if(E.dead||E.civ||E.ally||E.surr||!upright(E)) continue; const h=X_(E.B,PI_.head);
    if(Math.hypot(h[0]-mz[0],h[1]-mz[1],h[2]-mz[2])>R||!sightClear(h,mz)) continue;
    const F=fxOf(E); F.revealT=now+pnum('fight','flashT',1.6); F.rvT=0; seen++;
    if(!E.aware) setAware(E,'see'); E.lkp=[PL.x,PL.z]; E.lostT=0; E.mind='hunt';
    if(armed(E)){ F.quickT=now; E.atkCd=Math.min(E.atkCd,fxR('flashAim')); } }
  if(!seen) return;
  if(FGT.token&&!(FGT.token.fx&&FGT.token.fx.revealT>now)) FGT.token=null; /* he can't see where it came from: whoever can, answers */
  if(typeof huntAlert==='function') huntAlert('shot',[PL.x,PL.z],1); }

/* ---------- moving: called from think(); {goal,chase} overrides the role/hunt walk, null leaves it alone ---------- */
function fightMove(E,dt,fighting,dist){ const F=E.fx; if(!F||E.civ||E.ally) return null;
  if(typeof cqGuard==='function') cqGuard(E); /* nobody stands in your head (84b-close.js) */
  if(F.run) return fightRun(E,dt);
  if(F.ret){ fxFree2(E); const r=fightRetreat(E,dt,fighting,dist); if(r) return r; }
  if(E.rage>0&&E.aware){ fxFree2(E); const tgt=E.canSee?[PL.x,PL.z]:E.lkp; if(!tgt) return null;
    if(!armed(E)) return dist<1.3&&E.canSee?{goal:null,chase:false}:{goal:{x:tgt[0],z:tgt[1],sp:(kst(E)||{}).run||3},chase:E.canSee}; /* blades already come flat out; a rage just never stops coming */
    if(Math.hypot(tgt[0]-E.pos[0],tgt[1]-E.pos[1])<2.2) return {goal:null,chase:false};
    return {goal:{x:tgt[0],z:tgt[1],sp:pnum('fight','rageSp',2.6)},chase:false}; } /* walking straight at you, firing */
  if(typeof squadMove==='function'){ const Q=squadSiege(E,dt)||squadMove(E,dt,fighting,dist); if(Q) return Q; } /* a job from the squad: flank, cut, guard, cover, siege (84c-squad.js) */
  if(typeof closeMove==='function'){ const Q=closeMove(E,dt,fighting,dist); if(Q) return Q; } /* doorways, spacing, regroup, blades circling (84b-close.js) */
  const S=fightSpace(E,dt,dist); if(S) return S;
  const L=fightLight(E,dt,fighting,dist); if(L) return L;
  if(fighting&&armed(E)&&FGT.token&&FGT.token!==E&&E.role!=='hold'&&E.role!=='flank') return fightSpread(E,dt,dist);
  return null; }
/* no firing line: two armed men close to Ray who end up shoulder to shoulder on the same bearing step apart round him, each to his own
   angle, at 2-4 m. Each steps away from the other, so they fan out instead of queueing in a doorway */
function fightSpace(E,dt,dist){ const F=E.fx,now=GAME.t;
  if(!armed(E)||!E.aware||dist>6||E.rage>0){ F.spc=null; return null; }
  if(F.spc){ if(now>F.spc.until||Math.hypot(E.pos[0]-F.spc.x,E.pos[1]-F.spc.z)<.3||stuck(E,dt)&&now-F.spc.t0>.8){ F.spc=null; F.spcCd=now+1.5; return null; }
    return {goal:{x:F.spc.x,z:F.spc.z,sp:1.7},chase:false}; }
  if(now<(F.spcCd||0)) return null; F.spcCd=now+.4;
  const T=[PL.x,PL.z],me=Math.atan2(E.pos[0]-T[0],E.pos[1]-T[1]);
  for(const O of enemies){ if(O===E||O.dead||O.st!=='alert'||!armed(O)||O.civ||O.ally) continue;
    if(Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])>1.5) continue;
    const da=wrapA(me-Math.atan2(O.pos[0]-T[0],O.pos[1]-T[1])); if(Math.abs(da)>.6) continue;
    const sg=da>=0?1:-1,r=clamp(dist,2.2,4);
    for(const k of [1,.6,1.5]){ const nb=me+sg*.7*k,x=T[0]+Math.sin(nb)*r,z=T[1]+Math.cos(nb)*r;
      if(fxFree(x,z)&&sightClear([x,1.4,z],[T[0],1.3,T[1]])){ F.spc={x,z,t0:now,until:now+2.4}; freshGoal(E); return {goal:{x,z,sp:1.7},chase:false}; } }
    break; }
  return null; }
/* out of the light: a man standing in a lit room who knows you're near gets into the dark within a second or two, and holds there */
function fightLight(E,dt,fighting,dist){ const F=E.fx,now=GAME.t;
  if(F.dark){ const D=F.dark; if(now>D.until||dist<2.2){ F.dark=null; F.litCd=now+6; return null; }
    if(!D.there){ if(Math.hypot(E.pos[0]-D.x,E.pos[1]-D.z)>.4&&!(stuck(E,dt)&&now-D.t0>1)) return {goal:{x:D.x,z:D.z,sp:2.3},chase:false}; D.there=true; }
    return {goal:null,chase:false}; }
  if(!E.aware||now<(F.litCd||0)) { F.litAt=null; return null; }
  F.litChk=(F.litChk||0)-dt; if(F.litChk>0) return null; F.litChk=.3;
  const near=dist<14||E.lkp&&Math.hypot(E.lkp[0]-E.pos[0],E.lkp[1]-E.pos[1])<14;
  if(!near||!armed(E)&&E.canSee&&dist<6||!fxLitAt(E.pos[0],E.pos[1])){ F.litAt=null; return null; } /* a blade who can see you just comes */
  if(F.litAt==null){ F.litAt=now+fxR('lightOut'); return null; }
  if(now<F.litAt) return null; F.litAt=null;
  const s=fightDarkSpot(E); if(!s){ F.litCd=now+4; return null; }
  F.dark={x:s[0],z:s[1],t0:now,until:now+fxR('darkHold')}; freshGoal(E); return {goal:{x:s[0],z:s[1],sp:2.3},chase:false}; }
function fightDarkSpot(E){ const W=fieldTo(E.pos[0],E.pos[1]); if(!W) return null; const gun=armed(E),me=[PL.x,1.5,PL.z]; let best=null,bs=-1e9;
  for(let n=0;n<28;n++){ const a=Math.random()*6.283,r=rnd(1,4.5),x=E.pos[0]+Math.cos(a)*r,z=E.pos[1]+Math.sin(a)*r,c=navCell(x,z);
    if(c<0||FLOOR.nav[c]||W[c]>=1e9||W[c]>240||!fxFree(x,z)||Math.hypot(x-PL.x,z-PL.z)<1.6||fxLitAt(x,z)) continue;
    const see=sightClear(me,[x,1.4,z]),sc=-W[c]/40+(gun?(see?1.5:0):(see?-1:1))+Math.random()*.4; if(sc>bs){ bs=sc; best=[x,z]; } }
  return best; }
/* not his turn: spread out to the side so he has a line when it comes, or hold where he is */
function fightSpread(E,dt,dist){ const F=E.fx,now=GAME.t;
  if(!(F.spT>now)){ F.spT=now+rnd(1.6,2.6); F.sp=fightFlankPt(E,dist); if(F.sp) freshGoal(E); }
  if(F.sp){ if(Math.hypot(E.pos[0]-F.sp[0],E.pos[1]-F.sp[1])>.5&&!stuck(E,dt)) return {goal:{x:F.sp[0],z:F.sp[1],sp:1.5},chase:false}; F.sp=null; }
  return {goal:null,chase:false}; }
function fightFlankPt(E,dist){ const W=fieldTo(E.pos[0],E.pos[1]); if(!W) return null; const F=E.fx; if(!F.side) F.side=Math.random()<.5?-1:1;
  const tx=E.pos[0]-PL.x,tz=E.pos[1]-PL.z,L=Math.hypot(tx,tz)||1,R=clamp(dist*.85,3,7);
  for(const s of [F.side,-F.side]) for(const a of [1.1,.75,1.45]){ const c_=Math.cos(a*s),s_=Math.sin(a*s),x=PL.x+(tx*c_-tz*s_)/L*R,z=PL.z+(tx*s_+tz*c_)/L*R,c=navCell(x,z);
    if(c<0||FLOOR.nav[c]||W[c]>=1e9||W[c]>320||!fxFree(x,z)) continue;
    if(enemies.some(O=>O!==E&&!O.dead&&Math.hypot(O.pos[0]-x,O.pos[1]-z)<1)) continue;
    if(!sightClear([x,1.5,z],[PL.x,1.5,PL.z])) continue; F.side=s; return [x,z]; }
  return null; }

/* out of the tower's roles (66-tower.js): a flanker holds his swing till his ambush springs, a holder walks back to his post. Rage and retreat are their own plan */
function fxFree2(E){ if(E.role==='flank'||E.role==='hold'){ E.role='hunt'; E.hold=null; E.silent=false; } }
/* ---------- hurt early: back into a dark room and wait by its door ---------- */
function fightHurt(E,dist){ const F=fxOf(E); if(F.retreated||E.rage>0||!E.aware||E.st!=='alert'||E.surr||E.grabbed) return;
  if(psychOf(E)!=='fight'||E.blood<pnum('fight','retreatBlood',60)||E.wounds.length>2||dist<2.4) return;
  if(F.retreatRoll==null) F.retreatRoll=Math.random(); if(F.retreatRoll>=pnum('fight','retreat',.45)){ if(typeof cqRegroupStart==='function') cqRegroupStart(E); return; } /* not the ambush: back to a friend (84b-close.js) */
  const s=fightRetreatSpot(E); if(!s){ if(typeof cqRegroupStart==='function') cqRegroupStart(E); return; }
  fxFree2(E); F.retreated=true; F.ret={ph:'go',x:s.x,z:s.z,door:s.door,room:s.room,t:0,wait:fxR('retreatWait')}; freshGoal(E); if(FGT.token===E) FGT.token=null; }
function fightRetreatSpot(E){ const rooms=fxRooms(); if(!rooms.length) return null; const W=fieldTo(E.pos[0],E.pos[1]); if(!W) return null;
  const mine=fxRoomOf(E.pos[0],E.pos[1]),yours=fxRoomOf(PL.x,PL.z),me=[PL.x,1.5,PL.z]; let best=null,bs=-1e9;
  for(const r of rooms){ if(r===yours) continue;
    for(const d of r.doors) for(const s of [-1,1]) for(const [dp,lat] of [[.95,.85],[.75,.75],[1.2,1.0],[.75,1.1]]){ /* beside the opening, a step inside it */
      const x=d.x+d.n[0]*dp-d.n[1]*s*lat,z=d.z+d.n[1]*dp+d.n[0]*s*lat,c=navCell(x,z);
      if(c<0||FLOOR.nav[c]||W[c]>=1e9||!fxIn(r,x,z)||fxLitAt(x,z)) continue;
      const walk=W[c]/40; if(walk>pnum('fight','retreatR',12)||Math.hypot(x-PL.x,z-PL.z)<3) continue;
      const sc=-walk+(sightClear(me,[x,1.3,z])?-4:0)+(r===mine?1.5:0)+(r.lit?-2:0)+(fxFree(x,z)?.5:0)+Math.random()*.5; if(sc>bs){ bs=sc; best={x,z,door:[d.x,d.z],room:r}; } break; } }
  return best; }
function fightRetreat(E,dt,fighting,dist){ const F=E.fx,R=F.ret; R.t+=dt;
  if(E.surr||E.st!=='alert'||E.rage>0){ F.ret=null; E.silent=false; return null; } /* raging: he comes at you, he doesn't back off */
  if(R.ph==='go'){ if(dist<1.5&&!armed(E)){ F.ret=null; return null; } /* you're on him: no time to back off */
    if(Math.hypot(E.pos[0]-R.x,E.pos[1]-R.z)>.45&&R.t<9&&!(R.t>1.5&&stuck(E,dt))) return {goal:{x:R.x,z:R.z,sp:2.1},chase:false};
    R.ph='wait'; R.t=0; E.silent=true; }
  /* waiting beside the doorway: quiet, weapon up, facing the opening */
  E.lostT=0; E.barkCd=Math.max(E.barkCd,1.5); E.moveDir=null;
  if(fxIn(R.room,PL.x,PL.z)||dist<2.6){ F.ret=null; E.silent=false; /* you came through: now */
    if(armed(E)){ FGT.token=E; E.atkCd=Math.min(E.atkCd,rnd(.1,.25)); } bark(E,pick(['NOW—','Got you—','HERE!']),1.4); vox(E,'shout',.9); return null; }
  if(R.t>R.wait){ F.ret=null; E.silent=false; return null; }
  if(!fighting){ const dh=wrapA(Math.atan2(R.door[0]-E.pos[0],R.door[1]-E.pos[1])-E.hd); E.hd+=clamp(dh,-2*dt,2*dt); }
  return {goal:null,chase:false}; }

/* ---------- melee you can read ---------- */
const fxArmHeld=E=>GRABS.some(G=>G.E===E&&(G.name==='hd'+E.wpnHand||G.name==='el'+E.wpnHand));
function fightSwingOk(E){ const F=E.fx||{}; return !F.run&&!(F.stagT>0)&&!(E.openT>GAME.t)&&!fxArmHeld(E); } /* openT: staggered by your blow (agent B) */
function fightSwingStart(E){ const F=fxOf(E); F.W=pnum('fight','wind',.4)+(E.winded>0?Math.min(.35,E.winded*pnum('fight','winded',.2)):0); /* winded (agent B): slower to come back */
  F.feint=!(E.rage>0)&&Math.random()<pnum('fight','feint',.2); F.hitDone=false; F.pw=F.ps=0; vox(E,'grunt',.5); } /* the breath before it: something to hear as well as see */
/* the swing, frame by frame (replaces the old fixed .44 s hit in think()). F.pw/F.ps drive the arm in targetsFor */
function fightSwing(E,dt,dist,toP){ const F=fxOf(E),W=F.W||.4,S=pnum('fight','strike',.18),before=E.atkT; E.atkT+=dt; const k=E.atkT;
  /* caught: your hand on his weapon wrist or elbow before it lands stops it dead (62-grab.js does the rest: yank and it comes loose) */
  if(!F.hitDone&&fxArmHeld(E)){ E.atkT=-1; E.atkCd=Math.max(E.atkCd,1.2); E.stun=Math.max(E.stun,.45); F.caught=(F.caught||0)+1; F.pw=F.ps=0;
    if(E.barkCd<1.2) bark(E,pick(['—!','Hnn— let—','Get off—']),1.2); vox(E,'strain',.8); return; }
  if(F.feint){ /* all the way up, a start down, then he pulls it */
    const u=clamp((k-W)/.12,0,1),back=clamp((k-W-.12)/.22,0,1); F.pw=back>0?1-back:Math.min(1,k/W); F.ps=.35*u*(1-back);
    if(k>W+.34){ E.atkT=-1; E.atkCd=fxR('feintCd'); F.pw=F.ps=0; } return; }
  F.pw=Math.min(1,k/W); F.ps=clamp((k-W)/S,0,1);
  const at=W+S*.5; if(!F.hitDone&&before<at&&k>=at){ F.hitDone=true; const f=[Math.sin(E.hd),Math.cos(E.hd)];
    if(dist<1.75&&(toP[0]*f[0]+toP[1]*f[1])/(dist||1)>.5&&!fightBlocked(E)) hurtPlayer(E.wpnHeld?((kst(E)||{}).melee||9):7,{E,kind:'melee',w:E.wpnHeld?KIND_WPN[E.kind]:'fist',rage:E.rage>0}); } /* agent A's src shape; A sets the damage (src.rage: he's in a rage) */
  if(k>W+S+.17){ E.atkT=-1; E.atkCd=fxR('swingCd')*(E.rage>0?.7:1); F.pw=F.ps=0; } }
/* the block: your held weapon across the line from his hand to where it's going, at the moment it lands */
function fxItemSeg(h){ const it=h.item; if(!it||!(h.itemNode||h.itemW)) return null; const w=WPN[it.key]; if(!w) return null; let P;
  if(w.strike&&w.strike.length){ P=[]; for(const s of w.strike) P.push(s.a,s.b); }
  else if(w.gun) P=((w.bash&&w.bash.pts)||[]).concat([w.muzzle||[0,0,.15]]);
  else P=(w.pts||[]).concat([[0,0,0]]);
  if(P.length<2) return null; let a=P[0],b=P[1],bd=-1; for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const q=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1],P[i][2]-P[j][2]); if(q>bd){ bd=q; a=P[i]; b=P[j]; } }
  const Mi=itemM(h); return [mulP(Mi,a),mulP(Mi,b)]; }
function fxSegDist(p1,q1,p2,q2){ const d1=v3.sub(q1,p1),d2=v3.sub(q2,p2),r=v3.sub(p1,p2),a=v3.dot(d1,d1),e=v3.dot(d2,d2),f=v3.dot(d2,r); let s,t;
  if(a<1e-9&&e<1e-9) return Math.hypot(...r);
  if(a<1e-9){ s=0; t=clamp(f/e,0,1); } else { const c=v3.dot(d1,r); if(e<1e-9){ t=0; s=clamp(-c/a,0,1); } else { const b=v3.dot(d1,d2),den=a*e-b*b; s=den>1e-9?clamp((b*f-c*e)/den,0,1):0; t=(b*s+f)/e; if(t<0){ t=0; s=clamp(-c/a,0,1); } else if(t>1){ t=1; s=clamp((b-c)/a,0,1); } } }
  return Math.hypot(...v3.sub(v3.add(p1,v3.sc(d1,s)),v3.add(p2,v3.sc(d2,t)))); }
function fightBlocked(E){ if(!(XR.on||pnum('fight','flatBlock',false))) return false;
  const hd=X_(E.B,PI_['hd'+E.wpnHand]),eye=camBasis().eye,tgt=v3.add(eye,[0,E.kind==='cutter'?-.1:-.3,0]),v=v3.sub(tgt,hd),L=Math.hypot(...v); if(L<.1) return false;
  const end=v3.add(hd,v3.sc(v,(L-.12)/L)); /* stop short of your body: a weapon held against your chest still counts, your chest doesn't */
  for(const h of [HANDS.L,HANDS.R]){ const sg=fxItemSeg(h); if(sg&&fxSegDist(sg[0],sg[1],hd,end)<pnum('fight','blockR',.1)){ fightBlock(E,h,sg); return true; } }
  return false; }
function fightBlock(E,h,sg){ const F=fxOf(E),i=PI_['hd'+E.wpnHand],B=E.B; F.blocks=(F.blocks||0)+1; F.stagT=pnum('fight','stagger',.5);
  E.stun=Math.max(E.stun,.75); E.atkCd=Math.max(E.atkCd,1.1); /* .75 stun wears off below the attack line in about half a second */
  const back=norm3([B.x[i*3]-PL.x,0,B.x[i*3+2]-PL.z]); kickV(B,i,v3.add(v3.sc(back,2.6),[0,.8,0]),H); kickV(B,PI_['el'+E.wpnHand],v3.sc(back,1.4),H); for(const j of [PI_.chest,PI_.neck,PI_.head]) kickV(B,j,v3.sc(back,.8),H);
  const p=v3.sc(v3.add(sg[0],sg[1]),.5); fxClang(p,E.wpnHeld&&E.kind!=='corner'); /* a bottle on steel cracks, it doesn't ring */
  if(XR.on){ buzz(h.hand,1,110); if(h.support) buzz(h.support.hand,.7,80); else if(h.supportOf) buzz(h.supportOf.hand,.7,80); }
  vox(E,'grunt',.85); if(E.barkCd<1.2) bark(E,pick(['Hnh—!','*grunts*','Fuck—']),1.2); }
/* steel on steel: a few inharmonic partials and a hard click (no sample in the game for it) */
function fxClang(p,metal){ const ac=audio(); if(!ac) return; const bus=audioBus(ac),t=ac.currentTime,out=ac.createGain(); out.gain.value=.85;
  if(p&&GAME.started&&typeof spatial==='function'){ const S=spatial(ac,p,bus.inp); out.connect(S.input); } else out.connect(bus.inp);
  const sd=ac.createGain(); sd.gain.value=.3; out.connect(sd); sd.connect(bus.revIn);
  const tone=(f,dur,g)=>{ const o=ac.createOscillator(); o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*.985,t+dur); const gg=ac.createGain(); gg.gain.setValueAtTime(g,t); gg.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(gg); gg.connect(out); o.start(t); o.stop(t+dur+.02); };
  const s=ac.createBufferSource(); s.buffer=NOISE; const fl=ac.createBiquadFilter(); fl.type=metal?'highpass':'lowpass'; fl.frequency.value=metal?3800:900; const g=ac.createGain(); g.gain.setValueAtTime(metal?1:1.2,t); g.gain.exponentialRampToValueAtTime(.001,t+(metal?.03:.09)); s.connect(fl); fl.connect(g); g.connect(out); s.start(t,Math.random()*.5); s.stop(t+.1);
  if(metal){ for(const [f,d,gn] of [[1240,.55,.34],[1815,.42,.27],[2690,.3,.2],[3970,.22,.14],[5230,.14,.09]]) tone(f*rnd(.97,1.03),d,gn); }
  else { tone(140,.12,.8); tone(620,.05,.25); } }

/* ---------- a death: who saw it, who shouts, who loses it (the 'death' event, before he's marked dead) ---------- */
function fightDeath(E){ const c=X_(E.B,PI_.chest),rR=pnum('fight','rageR',12),wR=pnum('fight','witnessR',4),W=[];
  for(const O of enemies){ if(O===E||O.dead||O.civ||O.ally||O.st==='down') continue; const h=X_(O.B,PI_.head),d=Math.hypot(h[0]-c[0],h[2]-c[2]); if(d>Math.max(rR,wR)) continue;
    const fw=[Math.sin(O.hd),Math.cos(O.hd)],facing=((c[0]-h[0])*fw[0]+(c[2]-h[2])*fw[1])/(d||1);
    const sees=d<=rR&&(facing>-.15||d<2.5)&&sightClear(h,c),heard=d<=wR&&!E.silent; if(sees||heard) W.push({O,d,sees}); }
  /* the shout first: the nearest man who saw it (or was right there) says his name */
  W.sort((a,b)=>a.d-b.d); const S=W.find(w=>w.O.barkCd<=0&&!(w.O.concealed&&!w.O.wpnHeld));
  if(S&&Math.random()<.9){ const L=LINES.friend(E.name); bark(S.O,S.sees&&S.O.canSee?L[2]:pick(L),2.4); vox(S.O,'shout'); GAME.barkGlobal=1; }
  /* then the rage: anyone who watched it happen */
  for(const {O,sees} of W){ if(!sees) continue;
    if(O.surr&&!O.backup&&psychOf(O)==='quit'){ O.surr=null; O.st='alert'; O.rise=.5; O.aware=true; O.atkCd=.6; } /* he watched you do it, on his knees: he comes up at you */
    if(!upright(O)||O.surr) continue;
    O.rage=pnum('fight','rageT',20); fxOf(O).raged=true; if(psychOf(O)==='quit') O.psych='fight'; O.compT=0; fxFree2(O);
    if(!O.aware) setAware(O,'body',[PL.x,PL.z]); else if(!O.canSee) O.lkp=[PL.x,PL.z]; } }

/* ---------- surrendered men (surrTick, 69-standoff.js) ---------- */
function fightSurr(E,S,dt,dist){ const F=fxOf(E); F.run=null;
  if(E.backup){ /* the faker: your gun off him, and the nerve builds faster with your eyes elsewhere or a friend of his in sight */
    if(!(S.ph==='kneel'||S.ph==='hands')||E.covered||E.cons<=.45||dist>=8){ F.nerveUp=Math.max(0,(F.nerveUp||0)-dt*.5); return; }
    F.chkT=(F.chkT||0)-dt; if(F.chkT<=0){ F.chkT=.25; const h=X_(E.B,PI_.head); F.line=sightClear(h,[PL.x,1.5,PL.z]); F.away=!lookingAt(h,35);
      F.mate=enemies.some(O=>O!==E&&!O.dead&&!O.civ&&!O.ally&&!O.surr&&armed(O)&&upright(O)&&Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])<14&&sightClear(h,X_(O.B,PI_.head))); }
    if(!F.line) return;
    F.nerveUp=(F.nerveUp||0)+dt*(.3+(F.away?.6:0)+(F.mate?.55:0));
    if(F.nerveUp>=1&&E.freeT>.4){ F.sprangT=GAME.t; F.nerveUp=0; springBack(E); } return; }
  if(E.civ||psychOf(E)!=='quit'||S.ph!=='kneel') return;
  /* a quitter left alone: your gun off him long enough and he gets up and runs for his friends */
  if(F.runAt==null) F.runAt=fxR('quitRun');
  if(E.freeT>F.runAt&&dist>1.8&&E.cons>.5&&Math.min(E.hp.legL,E.hp.legR)>.5&&!lookingAt(X_(E.B,PI_.head),30)) fightRunStart(E); }
function fightRunStart(E){ const F=fxOf(E); E.surr=null; E.st='alert'; E.rise=.5; E.aware=true; E.mind='hunt'; E.role=null; E.atkT=-1; E.atkCd=9; E.compT=0; E.coverT=0;
  const to=fxFriend(E); F.run={t:0,to,lkp:(F.seenAt||E.lkp||[PL.x,PL.z]).slice(),flee:to?null:civFleeSpot(E)}; F.ran=true; F.runAt=null; freshGoal(E); vox(E,'strain',.6); }
function fightRun(E,dt){ const R=E.fx.run; R.t+=dt; if(R.done) return {goal:null,chase:false};
  if(!R.to||R.to.dead||!upright(R.to)||R.to.surr) R.to=fxFriend(E);
  const tgt=R.to?R.to.pos:R.flee,there=R.to&&Math.hypot(E.pos[0]-R.to.pos[0],E.pos[1]-R.to.pos[1])<1.6;
  if(there||!tgt||R.t>pnum('fight','quitRunT',6)||R.t>1.5&&stuck(E,dt)){ fightRunAlert(E); return {goal:null,chase:false}; }
  return {goal:{x:tgt[0],z:tgt[1],sp:2.9},chase:false}; }
function fightRunAlert(E){ const F=E.fx,R=F.run; R.done=true; F.ranAlerted=true;
  bark(E,pick(['He\'s here! The cop— he\'s HERE!','It\'s him! He\'s back there!','He let me go— he\'s right back there!']),2.6); GAME.barkGlobal=1; vox(E,'shout');
  if(typeof huntAlert==='function') huntAlert('seen',R.lkp,1);
  for(const O of enemies) if(O!==E&&!O.dead&&!O.civ&&!O.ally&&!O.surr&&upright(O)&&(O===R.to||typeof huntAlert!=='function'&&Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])<12)) setAware(O,'told',R.lkp);
  F.run=null; E.st='kneel'; } /* he's done his part: down on his knees behind them, out of it */

/* ---------- wiring ---------- */
protoOn('fire',(h,it,info)=>{ if(PROTO.on) fightFlash(info); });
protoOn('death',E=>{ if(PROTO.on&&!E.ally&&!E.civ) fightDeath(E); });
protoOn('tick',()=>{ if(PROTO.on) fightToken(); });
protoOn('reset',()=>{ FGT.token=null; FGT.rooms=null; });
protoOn('load',()=>{ FGT.rooms=null; });
