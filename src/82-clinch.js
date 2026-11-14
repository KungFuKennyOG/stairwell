/* =====================================================================
   CLINCH (prototype, ?proto=1): they get their hands on you.
   Being caught is not a death screen. It's a fight at arm's length you can win or lose.
   - Wrist: an armed man who gets inside your gun takes your gun wrist. His hand locks on it and your gun hand (the one you see,
     never the tracked one, capped 25 cm) is pulled toward him and pushed aside. Pull and twist hard to tear loose, hit him with
     the other hand, or shoot him with it. Too slow and he turns your own gun back on you (63-grapple.js, the wrestle in reverse).
   - Collar: a searcher who finds you in a hiding spot (83-hunt.js calls enemyGrab(E,'collar')) reaches in and takes your collar.
     You stay exactly where you are. Struggle, or shoot / stab him point-blank, or he hurts you.
   - Tackle: a blade man (or a man gone mad over a dead friend, E.rage) charging into you pins you. His body in front of your
     face, about 40 cm off, both your hands free. He stabs (or strangles) every few seconds. Hit him, stab him, or shove him off
     with both hands on his chest.
   - Choke from behind: a man who gets behind you unseen puts his forearm across your throat. Your heartbeat, his breathing, the
     world going dull (audio only). About six seconds to grip his arm and pull it down off you, or stab back over your shoulder.
   Comfort (Kenny, fixed): during any grab nothing here moves or turns Ray or the camera. No drag, no knock-back, no shake, no
   screen effect. Walking eases to a stop while held and eases back after. Only his body is placed, and only your virtual
   gun hand in a wrist grab is moved, off the tracked hand.
   Flat screen (testing): mash E or click to struggle; F stabs with the left hand.
   ?grabtest=wrist|collar|tackle|choke: the nearest man does that grab 4 s after the start (and again 10 s after each one ends).
   Contract: enemyGrab(E,kind,opts) -> true if it started; PL.grab {E,kind,t,ph,need,sum,...} while held, else null;
   events grabbed(E,kind), grabEnd(E,kind,result) result 'free'|'killed'|'lost'; listens to enemyHit, fire, handPose (50-game.js).
   ===================================================================== */
PROTO.clinch={
  win:2,                         /* s: the struggle window. You break free when the struggle inside any window reaches need */
  mash:.085,                     /* flat screen: metres of struggle credited per E press or click */
  hitMin:.55,                    /* a blunt hit at least this hard breaks a grab (fists, butt-strokes); blades and bullets always do */
  cd:15, perCd:25, callCd:3,     /* s: no new grab of his own making after one ends / for that man again / for a call from outside */
  /* wrist */
  wristD:.9, wristP:.75, wristNeed:.5, wristHold:2, wristTurnT:2.2, turnStall:.35, turnStallMax:.5, wristPull:.18, wristCap:.25, wristEase:.15, wristDmg:45, wristKnock:.3,
  /* collar */
  collarNeed:.97, collarT:4, collarDmg:24,
  /* tackle */
  tackleD:1.6, tackleP:.55, tackleNeed:.5, tackleAtk:[2.5,4], tackleHits:2, stabDmg:20, whipDmg:12, strangleDmg:12,
  /* choke */
  chokeD:1.6, chokeP:.8, chokeNeed:.29, chokeT:6,
  /* grabtest */
  testDelay:4, testEvery:10,
};
PL.grab=null; PL.moveK=1;
const CLN={eye:[0,0,0],cdUntil:0,callUntil:0,fireT:-9,mashQ:0,bins:new Float32Array(40),bi:0,nb:20,sum:0,
  tgN:0,tgI:new Int16Array(10),tgP:new Float32Array(30),tgK:new Float32Array(10),test:null,sim:false,lp:20000,
  testKind:(()=>{ const k=new URLSearchParams(location.search).get('grabtest'); return ['wrist','collar','tackle','choke'].includes(k)?k:null; })()};
const CLN_KINDS=['wrist','collar','tackle','choke'];
const CLN_STR={corner:.9,cutter:1.05,gunman:1,doorman:1.15,enforcer:1.05,landlord:.95};
const CLN_L={
  wrist:{start:['I got him! I GOT HIM!','Gimme that—','Drop it— DROP IT—'],hold:['Let go of it—','*grunts*','Give it— GIVE IT—','Come here, cop—'],turn:['Look at me— look at me—','That\'s it— that\'s it—','Turn around, cop—','*straining*']},
  collar:{start:['Found you.','He\'s here! HE\'S IN HERE!','Come here— come HERE—','Out. Get out of there.'],hold:['Come out of there—','Quit it— QUIT IT—','*grunts*','I got him! Get over here!']},
  tackle:{start:['I GOT YOU—','Down— get DOWN—','Hold still— HOLD STILL—'],rage:['You killed him— you KILLED him—','Look at me! LOOK AT ME!','He was my brother, cop—'],hold:['Die— just die—','*snarls*','Stop moving—','Hold— still—']},
  choke:{start:['Shhh. Shhh.','Go to sleep, cop.','Don\'t fight it.'],hold:['Shhh...','Almost— almost—','Go on. Go on.','*breathing hard*']},
  free:['Fuck—!','Agh— shit—','*grunts*','No— NO—'],
  lost:{wrist:['Should\'ve let go.','Look what you did.'],collar:['Got you.','Stay down.'],tackle:['Stay down.','*spits*'],choke:['']}};

/* ---------- small helpers ---------- */
const clnFlat=v=>{ const l=Math.hypot(v[0],v[2])||1; return [v[0]/l,0,v[2]/l]; };
const clnRight=f=>[-f[2],0,f[0]]; /* flat right of a flat forward (same as cross(f, up)) */
const clnGun=h=>!!(h&&h.item&&WPN[h.item.key].gun&&h.itemNode&&!h.stuck);
const clnLive=()=>XR.on||CLN.sim; /* tracked hands to read (the harness sets sim and drives HANDS.*.M itself) */
function clnCan(E){ return !!E&&!E.dead&&!E.civ&&!E.ally&&!E.surr&&!E.civFreeze&&!E.outT&&!E.drop&&!(E.fallT>0)&&!E.knocked&&E.cons>.35&&!E.gone&&enemies.includes(E); }
/* how hard he holds on: his kind, his blood, how rocked he is, how angry */
function clnStr(E){ return clamp((CLN_STR[E.kind]||1)*(.7+.3*E.cons)*(1-.55*Math.min(1,E.stun))*(1+.25*Math.min(1,E.rage||0))*rnd(.9,1.1),.4,1.4); }
/* the struggle: a sliding window of 0.1 s bins; returns the struggle inside the window */
function clnMeterReset(){ CLN.nb=clamp(Math.round(pnum('clinch','win',2)*10),5,40); CLN.bins.fill(0); CLN.bi=Math.floor(GAME.t*10); CLN.sum=0; }
function clnMeter(v){ const i=Math.floor(GAME.t*10),nb=CLN.nb; if(i-CLN.bi>=nb){ CLN.bins.fill(0); CLN.bi=i; } while(CLN.bi<i){ CLN.bi++; CLN.bins[CLN.bi%nb]=0; }
  CLN.bins[i%nb]+=v; let s=0; for(let k=0;k<nb;k++) s+=CLN.bins[k]; return CLN.sum=s; }
/* a target for one of his particles this frame (applied every physics step by clinchPhys) */
function clnTg(i,p,k){ const n=CLN.tgN; if(n>=10) return; CLN.tgI[n]=i; CLN.tgP[n*3]=p[0]; CLN.tgP[n*3+1]=p[1]; CLN.tgP[n*3+2]=p[2]; CLN.tgK[n]=k; CLN.tgN=n+1; }
/* his hand particle sits at the wrist: put it a little back toward his shoulder so the fist, not the wrist, is on the point */
function clnReach(E,s,p,back=.06){ const sh=X_(E.B,PI_['sh'+s]),d=v3.sub(sh,p),l=Math.hypot(...d)||1; return v3.add(p,v3.sc(d,back/l)); }
/* move his body somewhere at once (the grab test only; never Ray) */
function clnPlace(E,x,z,hd){ E.pos=[x,z]; E.hd=hd; if(E.st==='idle') E.st='alert'; targetsFor(E,GAME.t); const B=E.B; for(let i=0;i<NP*3;i++) B.x[i]=B.p[i]=E.Wt[i]; E.dormant=false; E.asleep=false; }
function clnBuzz(hands,v,ms){ if(!XR.on) return; for(const h of hands) buzz(h.hand,v,ms); }
function clnSay(E,L,dur=1.6,force){ if(!L||!L.length) return; if(force||E.barkCd<=0){ const t=pick(L); if(t) bark(E,t,dur); } }
/* damage while held goes to Ray's health (80-ray.js owns it) with no screen flash: nothing on the screen while a man has you */
function clnHurt(d,part){ const G=PL.grab,f0=XR.flash; hurtPlayer(d,{E:G&&G.E,kind:'grab',part}); XR.flash=f0; }

/* ---------- sound: your heart, your breath, the world going dull ---------- */
function clnMuffle(f){ const ac=AC; if(!ac||!ac.__bus) return; if(Math.abs(f-CLN.lp)<1&&f!==20000) return; CLN.lp=f; try{ ac.__bus.slowLP.frequency.setTargetAtTime(f,ac.currentTime,.25); }catch(_){} }
function clnUnmuffle(){ const ac=AC; CLN.lp=20000; if(!ac||!ac.__bus) return; try{ ac.__bus.slowLP.frequency.setTargetAtTime(GAME.slow?1600:20000,ac.currentTime,.3); }catch(_){} }
/* a strangled breath through a closing throat, right in your head (past the muffle) */
function clnGasp(vol,pitch=1){ const ac=AC; if(!ac||!NOISE) return; const bus=audioBus(ac),t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=NOISE; f.type='bandpass'; f.Q.value=3; f.frequency.setValueAtTime(700*pitch,t); f.frequency.linearRampToValueAtTime(1300*pitch,t+.22);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.001,vol*.45),t+.05); g.gain.exponentialRampToValueAtTime(.0001,t+.3);
  s.connect(f); f.connect(g); g.connect(bus.lim); s.start(t,Math.random()*.5); s.stop(t+.34); }

/* ---------- starting a grab ---------- */
/* the hand of Ray's holding a gun nearest to him */
function clnGunHand(E){ let best=null,bd=1e9; for(const h of [HANDS.R,HANDS.L]){ if(!clnGun(h)) continue; const p=mulP(h.M,FIST),d=Math.hypot(p[0]-E.pos[0],p[2]-E.pos[1]); if(d<bd){ bd=d; best=h; } } return best; }
const CLN_MASK={}; for(const k of CLN_KINDS){ const m=new Uint8Array(NP); for(const n of ['hdL','hdR','elL','elR']) m[PI_[n]]=1; if(k==='choke') for(const n of ['head','neck','chest','shL','shR']) m[PI_[n]]=1; CLN_MASK[k]=m; } /* choke: his chest against your back, his head at your ear */
function enemyGrab(E,kind,opts={}){
  if(!PROTO.on||PL.grab||PL.dead||!GAME.started||!CLN_KINDS.includes(kind)) return false;
  if(!E||E.dead||E.civ||E.ally||E.surr||E.civFreeze||E.outT||E.drop||E.gone||!enemies.includes(E)) return false;
  if(!opts.force&&GAME.t<CLN.callUntil) return false;
  if(E.st==='idle') setAware(E,'grab'); if(E.st!=='alert') return false;
  const {f,eye}=camBasis(),fF=clnFlat(f),toE=clnFlat([E.pos[0]-PL.x,0,E.pos[1]-PL.z]);
  const G={E,kind,t:0,ph:'hold',str:clnStr(E),need:0,sum:0,mvR:0,jT:0,bT:rnd(1.2,2),sT:0,hitFree:false,hitAdd:0,opts};
  if(kind==='wrist'){ const h=opts.h||clnGunHand(E); if(!clnGun(h)) return false; G.h=h; G.Mt=new Float32Array(16); G.pull=[0,0,0];
    if(h.support) releaseSupport(h.support); /* his hand knocks your other hand off the gun */
    G.two=!E.wpnHeld; G.side=E.wpnHeld?(E.wpnHand==='R'?'L':'R'):'R'; G.need=pnum('clinch','wristNeed',.5)*G.str*(G.two?1.15:1); }
  else if(kind==='collar'){ G.side=E.wpnHeld?(E.wpnHand==='R'?'L':'R'):'R'; G.dir=toE; G.ankle=opts.part==='ankle'; G.need=pnum('clinch','collarNeed',.97)*G.str; }
  else if(kind==='tackle'){ G.dir=clnFlat(v3.add(toE,fF)); if(Math.hypot(G.dir[0],G.dir[2])<.1) G.dir=fF;
    G.style=E.wpnHeld&&!RANGED[E.kind]?'stab':E.wpnHeld?'whip':'strangle'; G.side=E.wpnHeld?E.wpnHand:'R'; G.atk=rnd(...pnum('clinch','tackleAtk',[2.5,4])); G.at=0; G.hits=0;
    G.need=pnum('clinch','tackleNeed',.5)*G.str; }
  else { G.dir=toE; G.side=E.wpnHeld&&E.wpnHand==='R'?'L':'R'; G.need=pnum('clinch','chokeNeed',.29)*G.str; G.hbT=0; G.brT=.6; G.gpT=1.2; }
  PL.grab=G; E.clinch=kind; E.clArm=CLN_MASK[kind]; E.atkT=-1; E.burstN=0; E.atkCd=Math.max(E.atkCd,.8); E.clCd=GAME.t+pnum('clinch','perCd',25);
  if(E.st==='alert'&&!E.aware) setAware(E,'grab');
  clnMeterReset(); CLN.mashQ=0; CLN.tgN=0;
  for(const h of [HANDS.L,HANDS.R]){ h.clPrev=null; h.clPrevY=null; }
  /* his voice: he tells everyone. A choke is silent */
  if(kind==='tackle'&&(E.rage||0)>0) clnSay(E,CLN_L.tackle.rage,1.8,true); else clnSay(E,CLN_L[kind].start,1.8,true);
  if(kind==='choke'){ vox(E,'strain',.7); E.barkCd=Math.max(E.barkCd,2.4); } else { vox(E,kind==='tackle'?'scream':'shout'); noise([E.pos[0],0,E.pos[1]],10,{alarm:true,from:E}); if(typeof huntAlert==='function') huntAlert('seen',[PL.x,PL.z],1); }
  sfx('grab',1,[eye[0],eye[1]-.3,eye[2]]); sfx('wrestle',.9,X_(E.B,PI_.chest));
  clnBuzz([HANDS.L,HANDS.R],1,160); /* a hard buzz: he has you */
  protoEmit('grabbed',E,kind); protoEmit('stat','grab.'+kind+'.start',1);
  return true; }

/* ---------- ending one ---------- */
function clnEnd(res){ const G=PL.grab; if(!G) return; const E=G.E; PL.grab=null; CLN.tgN=0; E.clinch=null; E.clArm=null;
  /* the gun hand you see snaps back onto the tracked one */
  if(G.kind==='wrist'&&G.h&&G.Mt&&G.vOn){ G.h.M.set(G.Mt); setLocal(G.h.node,m4.make(),G.h.M); }
  CLN.cdUntil=GAME.t+pnum('clinch','cd',15); CLN.callUntil=GAME.t+pnum('clinch','callCd',3); E.clCd=GAME.t+pnum('clinch','perCd',25);
  if(G.kind==='choke') clnUnmuffle();
  if(res==='free'&&!E.dead){ /* you tore loose: he's thrown off you (him, never you) and needs a beat */
    const away=clnFlat([E.B.x[PI_.chest*3]-PL.x,0,E.B.x[PI_.chest*3+2]-PL.z]),k=G.kind==='tackle'?2.4:1.5;
    for(const n of ['chest','neck','shL','shR','pelvis']) kickV(E.B,PI_[n],v3.add(v3.sc(away,k),[0,.2,0]),H);
    E.stun=Math.min(1,E.stun+.5); E.atkCd=Math.max(E.atkCd,1.3); E.atkT=-1; E.barkCd=Math.min(E.barkCd,0); clnSay(E,CLN_L.free,1.3,true); vox(E,'grunt');
    clnBuzz([HANDS.L,HANDS.R],1,140); sfx('wrestle',1,X_(E.B,PI_.chest)); }
  else if(res==='lost'&&!E.dead){ clnSay(E,CLN_L.lost[G.kind],1.6,true); E.atkCd=Math.min(E.atkCd,.9); }
  protoEmit('grabEnd',E,G.kind,res); protoEmit('stat','grab.'+G.kind+'.'+res,1); protoEmit('stat','grab.'+G.kind+'.time',G.t); }

/* ---------- every frame ---------- */
/* what your tracked hands did since the last frame: h.clDv (metres, world), h.clTw (radians of turn) */
function clnHands(){ const live=clnLive();
  for(const h of [HANDS.L,HANDS.R]){ h.clDv=h.clDv||[0,0,0]; h.clDv[0]=h.clDv[1]=h.clDv[2]=0; h.clTw=0;
    if(!live||!h.clTrk) continue; const p=h.clTrk,q=h.clPrev,y=h.clTrkY;
    if(q){ let dx=p[0]-q[0],dy=p[1]-q[1],dz=p[2]-q[2]; const l=Math.hypot(dx,dy,dz); if(l>.12){ dx*=.12/l; dy*=.12/l; dz*=.12/l; } h.clDv[0]=dx; h.clDv[1]=dy; h.clDv[2]=dz; } /* a tracking jump isn't a struggle */
    if(h.clPrevY&&y) h.clTw=Math.min(.3,Math.acos(clamp(v3.dot(y,h.clPrevY),-1,1)));
    h.clPrev=p.slice(); h.clPrevY=y?y.slice():null; } }
const clnLen=h=>Math.hypot(...h.clDv)+.1*h.clTw;
function clnTick(gdt){
  if(!PROTO.on) return;
  /* walking eases to a stop when a man takes hold, and back up after (no jolt) */
  PL.moveK=PL.grab?Math.max(0,(PL.moveK??1)-gdt*4):Math.min(1,(PL.moveK??1)+gdt*2);
  clnTestTick();
  if(!PL.grab){ if(GAME.started&&!PL.dead) clnTriggers(); return; }
  if(PL.dead||!GAME.started){ clnEnd('lost'); return; }
  clnHands(); clnHold(gdt); }
protoOn('tick',clnTick);

/* a long gun hangs in his right hand at his side while the left is on you (the carry switches in driveRig, 50-game.js) */
function clnLowGun(E){ if(!E.wpnHeld||!E.C.twoHand||E.oneHand) return; const s=E.wpnHand,sh=X_(E.B,PI_['sh'+s]),f=[Math.sin(E.hd),0,Math.cos(E.hd)]; clnTg(PI_['hd'+s],[sh[0]+f[0]*.12,sh[1]-.55,sh[2]+f[2]*.12],.12); }
function clnHold(dt){ const G=PL.grab,E=G.E; G.t+=dt; CLN.tgN=0;
  if(E.dead||!enemies.includes(E)){ clnEnd(E.dead?'killed':'free'); return; }
  if(G.hitFree){ clnEnd('free'); return; } /* you hit him hard, stabbed him or shot him */
  if(E.st!=='alert'||E.surr||E.outT||E.drop||E.knocked||E.cons<.3){ clnEnd('free'); return; } /* he went down or gave up */
  /* everything he does goes into you: no walking off, no swinging, no shooting */
  E.atkT=-1; E.burstN=0; E.atkCd=Math.max(E.atkCd,.6); E.moveDir=null; E.walkAmt=0; E.runAmt=0; PL.kickCd=Math.max(PL.kickCd,.15);
  const cam=camBasis(),eye=cam.eye,fF=clnFlat(cam.f); CLN.eye=eye;
  let mv=CLN.mashQ; CLN.mashQ=0; /* flat screen: E or click */
  if(G.kind==='wrist') mv+=clnWrist(G,E,dt,eye);
  else if(G.kind==='collar') mv+=clnCollar(G,E,dt,eye);
  else if(G.kind==='tackle') mv+=clnTackle(G,E,dt,eye,fF);
  else mv+=clnChoke(G,E,dt,eye,fF);
  if(!PL.grab) return; /* it ended inside (lost, or a shot) */
  if(G.kind!=='tackle') clnLowGun(E);
  mv+=G.hitAdd; G.hitAdd=0;
  G.mvR=lerp(G.mvR,mv/Math.max(dt,1e-3),Math.min(1,dt*5)); G.sum=clnMeter(mv);
  if(mv>.004&&Math.random()<.35) for(const n of ['hd'+G.side,'el'+G.side]) kickV(E.B,PI_[n],[rnd(-.5,.5),rnd(-.3,.5),rnd(-.5,.5)],H); /* your struggle shows in his arm */
  if(G.sum>=G.need){ clnEnd('free'); return; }
  /* he talks and strains while he holds you */
  G.bT-=dt; if(G.bT<=0){ G.bT=rnd(1.6,2.8); const L=CLN_L[G.kind]; clnSay(E,G.ph==='turn'?L.turn:L.hold,1.4,G.kind==='choke'); if(G.kind!=='choke') vox(E,Math.random()<.5?'strain':'grunt',.8); } }

/* --- wrist: his hand on your gun wrist --- */
function clnWrist(G,E,dt,eye){ const h=G.h;
  if(!clnGun(h)){ clnEnd('free'); return 0; } /* you let go of it: there's nothing to fight for */
  const wr=mulP(h.M,WRIST),s=G.side,B=E.B;
  /* his body: in front of you, close, turned to you (him, not you) */
  const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z),dd=clamp(d,.6,.85),dir=clnFlat([E.pos[0]-PL.x,0,E.pos[1]-PL.z]);
  if(Math.abs(d-dd)>.01){ const k=Math.min(1,dt*6); E.pos[0]=lerp(E.pos[0],PL.x+dir[0]*dd,k); E.pos[1]=lerp(E.pos[1],PL.z+dir[2]*dd,k); pushOutXZ(E.pos,.28,'walker'); }
  E.hd=Math.atan2(PL.x-E.pos[0],PL.z-E.pos[1]);
  /* his hand (both, if he has nothing in the other) locked on your wrist */
  clnTg(PI_['hd'+s],clnReach(E,s,wr),.35);
  if(G.two){ const o=s==='R'?'L':'R'; clnTg(PI_['hd'+o],clnReach(E,o,mulP(h.M,[0,-.04,-.13])),.3); }
  setGrip(E.J,s,true);
  /* the gun hand you see: pulled toward his chest and pushed off him, eased in over 150 ms, capped */
  const ease=clamp(G.t/pnum('clinch','wristEase',.15),0,1),e2=ease*ease*(3-2*ease),ch=X_(B,PI_.chest),fist=h.clTrk||mulP(h.M,FIST);
  const toE=v3.sub(ch,fist),tl=Math.hypot(...toE)||1,resist=clamp(G.mvR/.35,0,1);
  G.jT-=dt; if(G.jT<=0){ G.jT=rnd(.07,.16); G.jit=[rnd(-1,1)*.012,rnd(-1,1)*.012,rnd(-1,1)*.012]; clnBuzz([h],.35+.45*(G.wr?G.wr.turn:0)+.2*e2,45); if(Math.random()<.25) sfx('wrestle',.4,wr); }
  const amt=pnum('clinch','wristPull',.18)*e2*(1-.55*resist),j=G.jit||[0,0,0]; let pv=v3.add(v3.sc(toE,amt/tl),v3.sc(j,e2)); const pl=Math.hypot(...pv),cap=pnum('clinch','wristCap',.25); if(pl>cap) pv=v3.sc(pv,cap/pl);
  G.pull=pv; G.aside=.6*e2; G.eChest=ch;
  /* hold, then he turns it on you */
  if(G.ph==='hold'&&G.t>pnum('clinch','wristHold',2)) wrestleRevStart(G);
  if(G.ph==='turn'&&wrestleRevTick(G,dt,G.mvR)){ clnWristShot(G); return 0; }
  if(G.selfShot){ clnWristShot(G,true); return 0; }
  let mv=clnLen(h); if(h.support) mv+=.5*clnLen(h.support); /* two hands on it fight harder */
  return mv; }
function clnWristShot(G,already){ const h=G.h,it=h.item,w=it&&WPN[it.key];
  const fired=already||wrestleRevShot(G);
  if(fired){ clnHurt(Math.round(pnum('clinch','wristDmg',45)*(w&&w.pellets?1.4:1)),'torso'); }
  /* empty, or after the shot: half the time he tears it out of your hand and it goes on the floor */
  if(PL.grab&&clnGun(h)&&(!fired||Math.random()<.5)){ addPickup(h.item,itemM(h),[rnd(-1,1),.5,rnd(-1,1)]); equip(h,null); sfx('wrestle',1,mulP(h.M,FIST)); }
  clnEnd('lost'); }
/* the hand you see, every frame, before anything uses it (50-game.js emits handPose right after the hand is tracked).
   It stores the tracked pose for the struggle, then (wrist grab only) moves the drawn hand off it. */
function clnHandPose(h){ if(!PROTO.on) return; const M=h.M; h.clTrk=mulP(M,FIST); h.clTrkY=norm3([M[4],M[5],M[6]]);
  const G=PL.grab; if(!G||G.kind!=='wrist'||G.h!==h||!clnGun(h)||!h.itemL) return;
  G.Mt.set(M); G.vOn=true;
  const w=WPN[h.item.key],Mi=m4.make(); m4.mul(Mi,M,h.itemL); const bd=norm3(v3.sub(mulP(Mi,w.muzzle),mulP(Mi,[0,w.axisY,0]))),piv=h.clTrk;
  /* where the barrel should point: off his chest while he holds it, then round onto your belly as he turns it */
  let want=bd; if(G.eChest){ const toE=norm3(v3.sub(G.eChest,piv)),c=v3.dot(bd,toE),a=(G.aside||0)*clamp((c+.2)/1.2,0,1);
    if(a>1e-3){ const ax=v3.cross(toE,bd),al=Math.hypot(...ax); if(al>1e-4) want=rodr(bd,v3.sc(ax,1/al),Math.cos(a),Math.sin(a)); } }
  if(G.wr&&G.wr.turn>0){ const cb=camBasis(),bel=[cb.eye[0]+cb.f[0]*.08,cb.eye[1]-.6,cb.eye[2]+cb.f[2]*.08],toR=norm3(v3.sub(bel,piv)),k=G.wr.turn*G.wr.turn*(3-2*G.wr.turn);
    want=norm3(v3.add(v3.sc(want,1-k),v3.sc(toR,k))); }
  const ax=v3.cross(bd,want),al=Math.hypot(...ax),c=clamp(v3.dot(bd,want),-1,1),off=G.pull||[0,0,0];
  if(al>1e-5){ const k=v3.sc(ax,1/al),ang=Math.atan2(al,c),cs=Math.cos(ang),sn=Math.sin(ang);
    for(let q=0;q<3;q++){ const v=rodr([M[q*4],M[q*4+1],M[q*4+2]],k,cs,sn); M[q*4]=v[0]; M[q*4+1]=v[1]; M[q*4+2]=v[2]; }
    const P=rodr([M[12]-piv[0],M[13]-piv[1],M[14]-piv[2]],k,cs,sn); M[12]=piv[0]+P[0]; M[13]=piv[1]+P[1]; M[14]=piv[2]+P[2]; }
  M[12]+=off[0]; M[13]+=off[1]; M[14]+=off[2];
  setLocal(h.node,m4.make(),M); }
protoOn('handPose',clnHandPose);

/* --- collar: he reaches into where you are and takes hold. You stay where you are --- */
function clnCollar(G,E,dt,eye){ const s=G.side,dir=G.dir,low=eye[1]<1.05;
  /* his body: right at the opening, as close as the furniture lets him (pushOutXZ moves him, never you) */
  const k=Math.min(1,dt*5); E.pos[0]=lerp(E.pos[0],PL.x+dir[0]*.6,k); E.pos[1]=lerp(E.pos[1],PL.z+dir[2]*.6,k); pushOutXZ(E.pos,.28,'walker'); E.hd=Math.atan2(PL.x-E.pos[0],PL.z-E.pos[1]);
  const grip=G.ankle?[PL.x+dir[0]*.25,.1,PL.z+dir[2]*.25]:[eye[0]+dir[0]*.1,eye[1]-.24,eye[2]+dir[2]*.1];
  clnTg(PI_['hd'+s],clnReach(E,s,grip),.33); setGrip(E.J,s,true);
  if(low||G.ankle){ const lean=[grip[0]+dir[0]*.38,grip[1]+.45,grip[2]+dir[2]*.38]; clnTg(PI_.chest,lean,.05); clnTg(PI_.neck,v3.add(lean,[0,.18,0]),.04); } /* bends down to reach you */
  G.jT-=dt; if(G.jT<=0){ G.jT=rnd(.1,.18); clnBuzz([HANDS.L,HANDS.R],.4,40); if(Math.random()<.3) sfx('wrestle',.4,grip); kickV(E.B,PI_['hd'+s],[rnd(-.6,.6),rnd(-.3,.3),rnd(-.6,.6)],H); }
  if(G.t>pnum('clinch','collarT',4)){ clnCollarLost(G,E,grip); return 0; }
  return clnLen(HANDS.L)+clnLen(HANDS.R); }
function clnCollarLost(G,E,at){ const KS=kst(E)||{};
  if(armed(E)){ const g=gunRay(E),W=WPN[KIND_WPN[E.kind]]; muzzle(g.mz,g.d,!!KS.shotgun); muzzleSmoke(g.mz,g.d,!!KS.shotgun,false); sfx(W.snd||'gun',.9,g.mz); noise([E.pos[0],0,E.pos[1]],14,{alarm:true,from:E}); clnHurt(pnum('clinch','collarDmg',24),'torso'); } /* the gun in your ribs */
  else if(E.wpnHeld){ sfx('stab',1,at); clnHurt(pnum('clinch','stabDmg',20),'torso'); }
  else { sfx('punch',1,at); clnHurt(pnum('clinch','whipDmg',12),'head'); }
  clnBuzz([HANDS.L,HANDS.R],1,160); clnEnd('lost'); }

/* --- tackle: he's on you, his face in yours --- */
function clnTackle(G,E,dt,eye,fF){ const dir=G.dir,rt=clnRight(dir),s=G.side,o=s==='R'?'L':'R',B=E.B;
  /* his body in front of your head. Your body (the player cylinder in collideBody) keeps his head ~41 cm off: he moves, you never do */
  const k=Math.min(1,dt*8); E.pos[0]=lerp(E.pos[0],PL.x+dir[0]*.5,k); E.pos[1]=lerp(E.pos[1],PL.z+dir[2]*.5,k); pushOutXZ(E.pos,.28,'walker'); E.hd=Math.atan2(-dir[0],-dir[2]);
  const at=(x,y,z)=>[eye[0]+dir[0]*z+rt[0]*x,eye[1]+y,eye[2]+dir[2]*z+rt[2]*x];
  clnTg(PI_.head,at(0,-.04,.42),.09); clnTg(PI_.neck,at(0,-.17,.44),.06); clnTg(PI_.chest,at(0,-.42,.47),.05);
  const sg=s==='R'?-1:1; /* facing you, his right is your left */
  clnTg(PI_['hd'+o],clnReach(E,o,at(-sg*.13,-.24,.1)),.3); setGrip(E.J,o,true); /* his other hand has your collar */
  /* the attack, every 2.5-4 s: wind up, then in */
  G.at+=dt; const T=G.atk,wind=T-.7,ph=G.at<wind?0:G.at<T-.15?(G.at-wind)/.55:1;
  if(G.style==='strangle'){ const sq=.5+.5*Math.sin(G.at*9); clnTg(PI_['hd'+s],clnReach(E,s,at(sg*.05,-.17,.07)),.32); clnTg(PI_['hd'+o],clnReach(E,o,at(-sg*.05,-.17,.07)),.32); setGrip(E.J,s,true);
    if(ph>0&&Math.random()<.2) vox(E,'strain',.9); clnBuzz([HANDS.L,HANDS.R],.3+.4*sq*ph,30); }
  else { const rest=at(sg*.15,-.55,.16),cock=v3.add(X_(B,PI_['sh'+s]),v3.add([0,.16,0],v3.sc(dir,.16))),hit=G.style==='stab'?at(sg*.04,-.45,.1):at(sg*.13,-.02,.1);
    const p=ph<=0?rest:ph<1?v3.add(rest,v3.sc(v3.sub(cock,rest),Math.min(1,ph*1.4))):hit; clnTg(PI_['hd'+s],p,ph>=1?.4:.22); }
  if(G.at>=T){ G.at=0; G.atk=rnd(...pnum('clinch','tackleAtk',[2.5,4])); G.hits++;
    const pt=G.style==='stab'?at(0,-.45,.1):G.style==='whip'?at(sg*.12,-.02,.08):at(0,-.17,.07);
    if(G.style==='stab'){ sfx('stab',1,pt); sfx('flesh',.7,pt); spray(pt,dir,10,1.2,.6,'bright',.01); clnHurt(pnum('clinch','stabDmg',20),'torso'); vox(E,'strain'); }
    else if(G.style==='whip'){ sfx('bash',1,pt); clnHurt(pnum('clinch','whipDmg',12),'head'); }
    else { sfx('grab',.8,pt); clnGasp(.9,.8); clnHurt(pnum('clinch','strangleDmg',12),'neck'); }
    clnBuzz([HANDS.L,HANDS.R],1,130);
    if(PL.grab&&G.hits>=pnum('clinch','tackleHits',2)){ clnEnd('lost'); return 0; } }
  G.jT-=dt; if(G.jT<=0){ G.jT=rnd(.1,.18); clnBuzz([HANDS.L,HANDS.R],.45,40); if(Math.random()<.3) sfx('wrestle',.45,X_(B,PI_.chest)); }
  /* the shove: both hands on his chest or shoulders, driving him off you */
  if(!clnLive()) return 0; let inL=false,inR=false;
  for(const h of [HANDS.L,HANDS.R]){ const p=h.clTrk; if(!p) continue; let on=false; for(const n of ['chest','neck','shL','shR']){ const q=X_(B,PI_[n]); if(Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])<.3){ on=true; break; } }
    if(h===HANDS.L) inL=on; else inR=on; }
  if(!(inL&&inR)) return 0; let mv=0; for(const h of [HANDS.L,HANDS.R]) mv+=Math.max(0,v3.dot(h.clDv,dir));
  if(mv>.002) for(const n of ['chest','shL','shR']) kickV(B,PI_[n],v3.sc(dir,mv*30),H); /* he gives a little with every push */
  return mv; }

/* --- choke from behind: his forearm across your throat --- */
function clnChoke(G,E,dt,eye,fF){ const dir=G.dir,f=v3.sc(dir,-1),rt=clnRight(f),s=G.side,o=s==='R'?'L':'R',B=E.B,sg=s==='R'?1:-1; /* behind you, facing your way: his right is your right */
  const k=Math.min(1,dt*8); E.pos[0]=lerp(E.pos[0],PL.x+dir[0]*.4,k); E.pos[1]=lerp(E.pos[1],PL.z+dir[2]*.4,k); pushOutXZ(E.pos,.28,'walker'); E.hd=Math.atan2(f[0],f[2]);
  const at=(x,y,z)=>[eye[0]+f[0]*z+rt[0]*x,eye[1]+y,eye[2]+f[2]*z+rt[2]*x];
  clnTg(PI_['el'+s],at(sg*.13,-.21,.05),.25); clnTg(PI_['hd'+s],clnReach(E,s,at(-sg*.12,-.14,.09),.04),.32); setGrip(E.J,s,true); /* the forearm, under your chin */
  if(E.wpnHeld) clnTg(PI_['hd'+o],at(-sg*.17,-.3,-.05),.2); /* the hand with the blade presses on your shoulder */
  else { clnTg(PI_['hd'+o],at(-sg*.08,-.02,-.14),.25); setGrip(E.J,o,true); } /* his other hand behind your head, locking it in */
  clnTg(PI_.head,at(sg*.15,-.05,-.18),.08); clnTg(PI_.neck,at(sg*.1,-.17,-.22),.05); clnTg(PI_.chest,at(sg*.06,-.34,-.27),.06);
  E.barkCd=Math.max(E.barkCd,1.3); /* he only says what the choke gives him (62-grab.js would have him shout "get off me" when you grip his arm) */
  /* sound: your heart racing, his breath in your ear, your breath closing, the room going away */
  const fr=clamp(G.t/pnum('clinch','chokeT',6),0,1);
  G.hbT-=dt; if(G.hbT<=0){ G.hbT=lerp(.95,.42,fr); sfx('heart',.6+.6*fr); }
  G.brT-=dt; if(G.brT<=0){ G.brT=rnd(.8,1.1); vox(E,Math.random()<.7?'breath':'strain',1.2); }
  G.gpT-=dt; if(G.gpT<=0){ G.gpT=lerp(1.1,1.8,fr); clnGasp(.9*(1-fr*.6),1-.25*fr); }
  clnMuffle(20000*Math.pow(330/20000,fr));
  G.jT-=dt; if(G.jT<=0){ G.jT=rnd(.09,.15); clnBuzz([HANDS.L,HANDS.R],.3+.55*fr,40); }
  if(fr>=1){ clnHurt(PL.hp+100,'neck'); clnEnd('lost'); return 0; } /* out, and gone */
  if(!clnLive()) return 0;
  /* your hands on his arm (gripped through 62-grab.js), pulling down and away from your throat */
  const out=norm3(v3.add(v3.sc(f,.45),[0,-.9,0])); let mv=0;
  for(const g of GRABS){ if(g.E!==E) continue; g.fightT=0; /* he's busy choking you: your grip on his arm isn't shaken off by 62-grab.js's fight-it timer */ const dv=g.h.clDv; if(!dv) continue; const a=v3.dot(dv,out); mv+=Math.max(0,a)+.25*Math.hypot(...v3.sub(dv,v3.sc(out,a))); }
  return mv; }

/* ---------- when they decide to grab ---------- */
/* one roll per man per kind every few seconds, so standing near him isn't a dice roll every frame */
function clnRoll(E,kind,p){ if(E.clRk!==kind||GAME.t-(E.clRt||-9)>3){ E.clRk=kind; E.clRt=GAME.t; E.clRv=Math.random()<p; } return E.clRv; }
function clnTriggers(){ if(GAME.t<CLN.cdUntil) return; const cam=camBasis(),fF=clnFlat(cam.f);
  for(const E of enemies){ if(!E.aware||E.st!=='alert'||E.grabbed||GAME.t<(E.clCd||0)||!clnCan(E)) continue;
    const dx=E.pos[0]-PL.x,dz=E.pos[1]-PL.z,d=Math.hypot(dx,dz); if(d>1.6||d<1e-3) continue;
    const to=[dx/d,0,dz/d],view=v3.dot(fF,to),efw=[Math.sin(E.hd),0,Math.cos(E.hd)],faces=-v3.dot(efw,to);
    const gun=armed(E),blade=E.wpnHeld&&!RANGED[E.kind],rage=(E.rage||0)>0,moving=(E.walkAmt||0)>.35||(E.runAmt||0)>.08||E.atkT>=0;
    /* behind you and out of your sight: the forearm */
    if(view<-.25&&d<=pnum('clinch','chokeD',1.3)&&faces>.4&&!gun&&(E.role==='flank'||moving)&&clnRoll(E,'choke',pnum('clinch','chokeP',.8))){ if(enemyGrab(E,'choke',{auto:true})) return; }
    /* coming at you: a blade, or a man out of his mind */
    if(view>=-.25&&d<=pnum('clinch','tackleD',1.5)&&faces>.5&&(blade||rage||!E.wpnHeld&&!RANGED[E.kind])&&moving&&E.canSee&&clnRoll(E,'tackle',pnum('clinch','tackleP',.55))){ if(enemyGrab(E,'tackle',{auto:true})) return; }
    /* inside your gun: he goes for the wrist */
    if(view>.35&&d<=pnum('clinch','wristD',.9)&&faces>.4&&(gun||E.disarmed)&&E.canSee){ const h=clnGunHand(E); if(!h) continue;
      const sh=X_(E.B,PI_[gun&&E.wpnHand==='R'?'shL':'shR']),fp=mulP(h.M,FIST); if(Math.hypot(sh[0]-fp[0],sh[1]-fp[1],sh[2]-fp[2])>.8) continue; /* the gun has to be in his reach */
      if(clnRoll(E,'wrist',pnum('clinch','wristP',.75))&&enemyGrab(E,'wrist',{auto:true,h})) return; } } }

/* ---------- physics: his hands stay on you (called from applyGrabs in 62-grab.js, twice per physics step) ---------- */
function clinchPhys(){ const G=PL.grab; if(!G||!CLN.tgN) return; const E=G.E; if(E.dead) return; const x=E.B.x,p=E.B.p;
  for(let n=0;n<CLN.tgN;n++){ const o=CLN.tgI[n]*3,k=CLN.tgK[n]; for(let c=0;c<3;c++){ const d=(CLN.tgP[n*3+c]-x[o+c])*k; x[o+c]+=d; p[o+c]+=d*.7; } }
  /* his head never goes into yours: if it would, it's moved out (him, never you) */
  const e=CLN.eye,o=PI_.head*3,dx=x[o]-e[0],dy=x[o+1]-e[1],dz=x[o+2]-e[2],d=Math.hypot(dx,dy,dz),m=G.kind==='choke'?.23:.38;
  if(d<m&&d>1e-4){ const k=m/d; x[o]=e[0]+dx*k; x[o+1]=e[1]+dy*k; x[o+2]=e[2]+dz*k; p[o]=x[o]; p[o+1]=x[o+1]; p[o+2]=x[o+2]; } }

/* ---------- hits on him, shots from you ---------- */
protoOn('enemyHit',(E,seg,weapon,o)=>{ const G=PL.grab; if(!G||G.E!==E) return;
  if(weapon==='gun'||weapon==='knife'||(o&&o.power||1)>=pnum('clinch','hitMin',.55)) G.hitFree=true; /* that's it: he lets go */
  else G.hitAdd+=G.need*.45; }); /* a weak one still helps */
protoOn('fire',(h,it,info)=>{ CLN.fireT=GAME.t; const G=PL.grab; if(!G||G.kind!=='wrist'||G.h!==h||G.ph!=='turn'||!info) return;
  /* you pulled the trigger with the muzzle on yourself */
  const cb=camBasis(),bel=[cb.eye[0],cb.eye[1]-.6,cb.eye[2]],toR=norm3(v3.sub(bel,info.muzzle)); if(v3.dot(info.d,toR)>.88) G.selfShot=true; });
protoOn('reset',()=>{ if(PL.grab){ const G=PL.grab; PL.grab=null; if(G.E){ G.E.clinch=null; G.E.clArm=null; } if(G.kind==='choke') clnUnmuffle(); }
  PL.grab=null; PL.moveK=1; CLN.tgN=0; CLN.cdUntil=0; CLN.callUntil=0; CLN.mashQ=0; if(CLN.testKind) CLN.test={kind:CLN.testKind,at:GAME.t+pnum('clinch','testDelay',4)}; });

/* ---------- flat screen: mash E or click to struggle (instead of the kick and the shot) ---------- */
function clnMash(){ const G=PL.grab; if(!G) return; CLN.mashQ+=pnum('clinch','mash',.085); sfx('wrestle',.5,X_(G.E.B,PI_.chest)); }
addEventListener('keydown',e=>{ if(PL.grab&&!XR.on&&e.code==='KeyE'){ e.stopImmediatePropagation(); if(!e.repeat) clnMash(); } },true);
addEventListener('pointerdown',e=>{ if(PL.grab&&!XR.on&&e.target===cv){ e.stopImmediatePropagation(); clnMash(); } },true);
addEventListener('mousedown',e=>{ if(PL.grab&&!XR.on&&e.target===cv) e.stopImmediatePropagation(); },true);

/* ---------- ?grabtest=: the nearest man does it to you ---------- */
function clnTestTick(){ const T=CLN.test; if(!T) return;
  if(!GAME.started||PL.dead||PL.grab){ if(!GAME.started) T.at=GAME.t+pnum('clinch','testDelay',4); else if(PL.grab) T.at=GAME.t+pnum('clinch','testEvery',10); return; }
  if(GAME.t<T.at) return; T.at=GAME.t+3;
  const cam=camBasis(),fF=clnFlat(cam.f);
  const E=enemies.filter(O=>clnCan(O)&&(O.st==='alert'||O.st==='idle')).sort((a,b)=>Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(b.pos[0]-PL.x,b.pos[1]-PL.z))[0]; if(!E) return;
  /* where he comes from: in front of you, or behind you for the choke (the freest direction near that) */
  const back=T.kind==='choke',d=T.kind==='wrist'?.7:T.kind==='tackle'?.6:.7; let spot=null;
  for(const a of back?[Math.PI,2.6,-2.6,2.1,-2.1]:[0,.5,-.5,1,-1]){ const c=Math.cos(a),s=Math.sin(a),v=[fF[0]*c-fF[2]*s,0,fF[0]*s+fF[2]*c],x=PL.x+v[0]*d,z=PL.z+v[2]*d,q=[x,z]; pushOutXZ(q,.28,'walker');
    if(Math.hypot(q[0]-x,q[1]-z)<.05){ spot={x,z,v}; break; } }
  if(!spot) spot={x:PL.x+fF[0]*d*(back?-1:1),z:PL.z+fF[2]*d*(back?-1:1),v:v3.sc(fF,back?-1:1)};
  clnPlace(E,spot.x,spot.z,back?Math.atan2(fF[0],fF[2]):Math.atan2(-spot.v[0],-spot.v[2]));
  if(!E.aware) setAware(E,'see');
  if(T.kind==='wrist'&&!clnGun(HANDS.R)&&!clnGun(HANDS.L)) equip(HANDS.R.item?HANDS.L:HANDS.R,newItem('pistol'));
  if(enemyGrab(E,T.kind,{force:true,test:true})) T.at=GAME.t+pnum('clinch','testEvery',10); }
