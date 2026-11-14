/* =====================================================================
   THE WOUNDED AND THE TENANTS (prototype, ?proto=1).
   The dying used to happen after the fight was over, with nothing to make you stay. Here it's part of the hunt:
   - a man on the floor begging or calling for his friends is loud (12 m); a scream carries 20 m and brings the floor.
     So the dying scene plays out while you hide nearby, or you finish it
   - wounds that aren't the throat, the thigh artery or the gut clot: full flow for the first quarter, then they slow and stop
     60-120 s in. A man you spared stays down, grey and weak, alive, now and then calling for help
   - a man who drags himself drags himself TO something: his gun (then shoots from the floor, or lies on it and waits), the
     nearest doorway (through it, not into the wall beside it), a friend, a tenant. On his back he first rolls onto his front:
     about two seconds, a heave onto his side then over, never faster than ~140 deg/s, no spin.
     Hand over hand at 0.15-0.3 m/s, slower as he bleeds, stopping when he's too weak. Steered by the nav field
   - tenants who see you: 40% freeze, 25% hide, 20% scream (20 m, the hunt comes to you), 15% point and shout "He's here!"
     after 1-3 s. Your gun on them, or a finger to your lips (a hand at your mouth with the mic quiet), stops the pointing,
     and they stay quiet until the hunt ends. Kill one and the rest scream as soon as they see you
   Hooks into the core, all guarded and all only with PROTO.on:
     downReact (70-wounds.js) asks wdDownMode which way he moves on the floor; crawlGoal (50-game.js) asks wdCrawlGoal;
     setPose draws 'roll' from wdRollPose; flinchPose (70-wounds.js) draws a tenant's pointing arm; civReact (69-standoff.js)
     asks wdCivReact how a tenant takes the sight of you. The roll is turned inside the physics steps, on the core's
     'substep'(h, live) event (emitted from physics() after stepBody, only with PROTO.on).
   Events emitted: wdBeg(E, radius, kind 'beg'|'scream'|'whisper')  wdRoll(E, 'start'|'done'|'fail')  wdPickup(E)
     tenantReact(E, mode)  tenantScream(E)  tenantPoint(E)  tenantCalm(E, 'aim'|'shush')  tenantKilled(E)  shush()
   ===================================================================== */
PROTO.wounded={
  begR:12, screamR:20, whisperR:4, pointR:16,  /* metres a voice carries */
  callCd:[5,9], stableCd:[14,26],              /* alone, he calls out in bouts; once the bleeding stops, now and then */
  clot:[60,120], clotHold:.25,                 /* seconds to stop; share of that at full flow */
  crawlGain:1.9, crawlMinEn:.25,               /* pull strength (tuned so a fresh man drags ~0.25 m/s); too weak below this energy */
  gunR:5, friendR:12, doorR:8, civR:8,         /* how far (walking metres) he'll crawl for each */
  rollTA:[1.5,2.3], rollP:[.5,1.1], rollTB:[1.1,1.7], /* onto his side, a rest, over onto his front */
  civ:{freeze:.40,hide:.25,scream:.20,point:.15}, denyShare:.25, pointAt:[1,3],
  shushR:.12, shushHold:.3, shushSeeR:9 };
const WD={civKilled:false,shushT:0,shush:false};

const WD_SCREAM=['*screaming*','HELP! SOMEBODY HELP!','NO! NO! NO!','HELP ME! HE\'S GOT A GUN!'];
const WD_POINT=['He\'s here!','HE\'S HERE!','Here! He\'s in here!'];
const WD_POINT2=['Over here! HE\'S HERE!','He\'s right there!'];
const WD_CALM=['...okay. Okay.','*nods, shaking*','...'];

/* ---------- 1. the voice of a man on the floor is loud ---------- */
const WD_SCREAM_RE=/\*scream|AA+H|NO! NO|HELP!/;
function wdVoice(E){
  const nb=E.barkT>(E.wdBT??-9)+.01; E.wdBT=E.barkT; if(!nb) return; /* a bark started since last frame */
  if(!E.wounds.length||(E.st!=='down'&&E.st!=='kneel')) return;
  const txt=E.barkEl?E.barkEl.textContent:''; if(/\*chok|\*gurgl|hhk/.test(txt)) return; /* holding his throat shut: no voice to speak of */
  const pel=X_(E.B,PI_.pelvis); let r,kind;
  if(WD_SCREAM_RE.test(txt)){ r=pnum('wounded','screamR',20); kind='scream'; }
  else if(E.cons<.4||txt.startsWith('...')){ r=pnum('wounded','whisperR',4); kind='whisper'; } /* fading: "Mom..." is barely a breath */
  else { r=pnum('wounded','begR',12); kind='beg'; }
  noise([pel[0],0,pel[2]],r,{from:E,alarm:kind==='scream',beg:kind});
  if(kind==='scream'&&typeof huntAlert==='function') huntAlert('scream',[pel[0],pel[2]],.6);
  protoEmit('wdBeg',E,r,kind);
  /* begging at you he doesn't stop; alone he calls in bouts with breaths between, and once he's stopped bleeding only now and then */
  if(!E.near&&!(E.covered&&(E.coverT||0)>.3)){ const cd=E.wdStable?PROTO.wounded.stableCd:PROTO.wounded.callCd; E.barkCd=Math.max(E.barkCd,rnd(cd[0],cd[1])); } }

/* ---------- 2. clotting ---------- */
/* the throat, the thigh artery, the gut, a lost limb and anything fatal keep bleeding; the rest stop */
const wdClots=w=>w.part!=='neck'&&w.part!=='belly'&&w.part!=='stump'&&!(w.part==='thigh'&&w.art)&&w.rate<5;
function wdClotTick(E,dt){ let stable=true; const P=PROTO.wounded;
  for(const w of E.wounds){ if(w.piece) continue;
    const c=w.wd||(w.wd={r0:w.rate,T:rnd(P.clot[0],P.clot[1]),age:0,ok:wdClots(w)});
    if(!c.ok){ stable=false; continue; }
    c.age+=dt; const x=c.age/c.T,h=P.clotHold; if(x>=1){ w.rate=0; continue; } stable=false;
    w.rate=x<h?c.r0:c.r0*Math.pow((1-x)/(1-h),1.3);
    if(w.art&&x>.5) w.art=false; } /* the spurts stop first: the artery clamps down as the pressure falls */
  if(stable&&!E.wdStable){ E.wdStable=true; protoEmit('stat','wdClotted',Math.round(E.blood)); } }

/* ---------- 3. crawling toward something ---------- */
/* doorways as [x, z, nx, nz]: the middle of the opening and the way through it */
function wdDoorways(){ if(typeof PF!=='undefined'&&PF&&PF.openings) return PF.openings.map(o=>o.axis==='z'?[o.x,o.z,1,0]:[o.x,o.z,0,1]); /* the prototype floor (85-pfloor.js): an opening in a wall along x faces z */
  const out=(FLOOR.doors||[]).map(D=>[D.x,D.side,0,1]); if(FLOOR.units) for(const u of FLOOR.units) if(u.door!=null) out.push([u.door,u.side,0,1]); return out; } /* the tower: each flat's doorway onto the hall */
/* walking distance from him (field F built from his cell) to (x,z); a gun against a wall sits in a blocked cell, so the best neighbour counts */
function wdWalk(F,x,z,pel){ const c=navCell(x,z); if(c<0) return 1e9; if(!F) return Math.hypot(x-pel[0],z-pel[2]); let v=F[c];
  if(v>=1e9){ const ci=c%NX,ck=(c-ci)/NX; for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; v=Math.min(v,F[nk*NX+ni]+10); } }
  return v/20; }
function wdShooter(E){ return !E.civ&&RANGED[E.kind]&&!!E.C.wpn&&E.hp.armR>=.45&&!E.cut.armR&&!(E.deadArm&&E.deadArm.R)&&(psychOf(E)==='fight'||psychOf(E)==='fake'); }
function wdPickGoal(E,pel){ const P=PROTO.wounded,F=FLOOR.nav?fieldTo(pel[0],pel[2]):null,ray=(x,z)=>Math.hypot(x-PL.x,z-PL.z),seen=E.wdSeen||(E.wdSeen=[]);
  const visited=(x,z)=>seen.some(s=>Math.hypot(s[0]-x,s[1]-z)<1);
  if(wdShooter(E)){ const key=KIND_WPN[E.kind]; let best=null; /* his own gun, or one like it close by */
    for(const Pk of LOOSE){ if(Pk.item.key!==key) continue; const q=Pk.node.p; if(q[1]>.45) continue; /* up on a table: out of reach from the floor */
      if(Pk!==E.wdGun&&Math.hypot(q[0]-pel[0],q[2]-pel[2])>3) continue; if(ray(q[0],q[2])<1.2||visited(q[0],q[2])) continue; /* you're standing on it, or he couldn't get to it */
      const d=wdWalk(F,q[0],q[2],pel); if(d<=P.gunR&&(!best||d<best.d)) best={kind:'gun',x:q[0],z:q[2],P:Pk,d}; }
    if(best) return best; }
  let best=null; const consider=(kind,x,z,lim,w,O)=>{ if(visited(x,z)||ray(x,z)<2.5) return; const d=wdWalk(F,x,z,pel); if(d>lim||d<.6) return; const s=d*w; if(!best||s<best.s) best={kind,x,z,d,s,E:O}; };
  if(!E.civ) for(const O of enemies) if(O!==E&&!O.civ&&!O.ally&&upright(O)) consider('friend',O.pos[0],O.pos[1],P.friendR,.8,O);
  for(const q of wdDoorways()){ /* aim through the opening, not at the wall it's in: he drags himself over the threshold to the other side */
    const sd=(q[0]-pel[0])*q[2]+(q[1]-pel[2])*q[3]>=0?1:-1; consider('door',q[0]+q[2]*sd*.7,q[1]+q[3]*sd*.7,P.doorR,1); }
  for(const O of enemies) if(O!==E&&O.civ&&!O.dead) consider('tenant',O.pos[0],O.pos[1],P.civR,1.1,O);
  return best; }
function wdGoal(E,pel){ let g=E.wdGoal;
  if(g&&g.kind==='gun'&&!LOOSE.includes(g.P)) g=null; /* you took it */
  if(g&&(g.kind==='friend'&&(g.E.dead||!upright(g.E))||g.kind==='tenant'&&g.E.dead)) g=null;
  if(g&&g.reached&&GAME.t>g.rest) g=null; /* rested: on to the next thing */
  if(g&&!g.reached&&GAME.t>g.re){ g.re=GAME.t+1.5; if(g.kind==='gun'){ g.x=g.P.node.p[0]; g.z=g.P.node.p[2]; } else if(g.E){ g.x=g.E.pos[0]; g.z=g.E.pos[1]; } }
  if(!g&&GAME.t>(E.wdPickT||0)){ E.wdPickT=GAME.t+2.5; g=wdPickGoal(E,pel); if(g){ g.re=GAME.t+1.5; g.t0=GAME.t; } }
  return E.wdGoal=g; }
/* called from downReact with the mode the old rules picked */
function wdDownMode(E,mode,dist,ctx){ if(!PROTO.on||E.ally||E.temper!=='crawl'||E.gShoot||E.fakeDead) return mode;
  if(mode==='writhe'||mode==='still') return mode; /* just landed, out cold, holding his throat, or bled out to the edge */
  if(dist<2.2) return mode; /* you're right over him: what he does then is already decided */
  const pel=X_(E.B,PI_.pelvis),g=wdGoal(E,pel); if(!g||g.reached) return mode;
  if(!ctx.canMove||ctx.en<pnum('wounded','crawlMinEn',.25)) return mode; /* too weak to go anywhere */
  if(E.wounds.some(w=>w.part==='belly'&&!w.piece)&&ctx.en<.6) return mode; /* moving with a gut wound hurts too much */
  if(g.kind==='gun'&&E.covered&&psychOf(E)==='fake') return ctx.up>-.2?'guard':'curl'; /* he waits for your gun to leave him */
  if(E.downMode==='roll'&&E.wdRoll) return 'roll';
  /* low on the floor. Not the core's "lying" test: curled up face down his backside is up off the floor (pelvis ~0.4 m), and
     that kept every man who landed curled from ever crawling. The crawl pose flattens him out */
  const ch=X_(E.B,PI_.chest),low=pel[1]<.55&&ch[1]<.45;
  if(ctx.up<(E.downMode==='crawl'?.2:-.2)) return low||E.downMode==='crawl'?'crawl':mode;
  if(!low||(E.wdNoRoll||0)>GAME.t) return mode;
  return 'roll'; }
function wdCrawlGoal(E){ const g=E.wdGoal; return PROTO.on&&g&&!g.reached?[g.x,g.z]:null; }

/* the roll, back to front. Turned about his own spine by a controller following a slow two-heave curve: onto his side, a breath,
   over. Once he's past the side, gravity can take him the rest of the way faster (heavy, not driven). Rotating positions and
   histories together adds no speed, so nothing about it can fling or spin him */
function wdRollTick(E,dt){ const B=E.B,x=B.x,p=B.p,PN=E.pinM,pe=X_(B,PI_.pelvis),ch=X_(B,PI_.chest);
  const Rh=frameFrom(X_(B,PI_.hipL),X_(B,PI_.hipR),pe,ch),Z=Rh[2],k=Rh[1];
  /* his left, flat on the floor and square to his spine (k x up); kept square as he turns, so a body that has slewed a little
     doesn't make his own legs look like they're out to the side */
  let Sx=k[1]*0-k[2]*1,Sz=k[0]*1-k[1]*0; const sl0=Math.hypot(Sx,Sz)||1; Sx/=sl0; Sz/=sl0;
  let R=E.wdRoll;
  if(!R){ const en=E.energy??1,sl=1/(.6+.4*en),P=PROTO.wounded,g=E.wdGoal; let sd=Math.random()<.5?1:-1;
    if(g){ const s=(g.x-pe[0])*Sx+(g.z-pe[2])*Sz; if(Math.abs(s)>.3) sd=s>0?1:-1; } /* over toward the side he's going */
    let lg=0; for(const n of ['knL','knR','anL','anR']){ const q=X_(B,PI_[n]); lg+=((q[0]-pe[0])*Sx+(q[2]-pe[2])*Sz)/4; }
    if(Math.abs(lg)>.12) sd=lg>0?-1:1; /* legs off to one side: he rolls the other way, not over them */
    R=E.wdRoll={sd,t:0,TA:rnd(P.rollTA[0],P.rollTA[1])*sl,P:rnd(P.rollP[0],P.rollP[1]),TB:rnd(P.rollTB[0],P.rollTB[1])*sl,heave:0}; protoEmit('wdRoll',E,'start'); }
  const S=[Sx*R.sd,0,Sz*R.sd];
  R.t+=dt; let phi=Math.atan2(v3.dot(Z,S),Z[1]); if(phi<-1.2) phi+=Math.PI*2; /* 0 on his back, pi/2 on his side, pi on his front */
  if(phi>2.55||Z[1]<-.6){ E.wdRoll=null; E.wdRollEnd=GAME.t; E.downMode='crawl'; E.modeT=1.6; protoEmit('wdRoll',E,'done'); return; } /* on his front: straight into the crawl */
  const t=R.t,A=Math.PI/2,T2=R.TA+R.P;
  if(t>T2+R.TB+2.5){ E.wdRoll=null; E.wdRollEnd=GAME.t; E.wdNoRoll=GAME.t+12; E.downMode='curl'; E.modeT=1.6; protoEmit('wdRoll',E,'fail'); return; } /* something under him: give it up for a while */
  if(R.heave===0||R.heave===1&&t>=T2){ R.heave++; vox(E,'strain',1); } /* the effort of each heave */
  const tgt=t<R.TA?A*(1-Math.cos(Math.PI*t/R.TA))/2:t<T2?A:t<T2+R.TB?A+A*(1-Math.cos(Math.PI*(t-T2)/R.TB))/2:Math.PI;
  R.push=t<R.TA||t>=T2?1:0; R.phi=phi;
  R.w=clamp(4*(tgt-phi),0,1.8); R.S=S; R.hold=phi<A+.35; } /* the turn itself happens in the physics steps (wdRollStep) */
/* each physics step: turn him a little about the edge he's rolling onto (where that side meets the floor), so his weight comes up
   over it, and hold him there: any turn back the way he came (gravity tipping him onto his back again) is taken out. Done once a
   frame, the floor and gravity undid it inside the frame's own steps; turned about his middle, that side went into the floor and
   was pushed straight back up. Turning on with the roll (falling onto his front once he's past his side) is left alone */
function wdRollStep(h,live){ for(const E of live){ const R=E.wdRoll; if(!R||!R.S||E.dead||E.downMode!=='roll') continue;
  const B=E.B,x=B.x,PN=E.pinM,pe=X_(B,PI_.pelvis),ch=X_(B,PI_.chest),Rh=frameFrom(X_(B,PI_.hipL),X_(B,PI_.hipR),pe,ch),k=Rh[1],S=R.S;
  const cx=(pe[0]+ch[0])/2,cz=(pe[2]+ch[2])/2;
  let ext=-1e9; for(const n of WD_TRUNK){ const i=PI_[n],o=i*3; if(PN&&PN[i]) continue; ext=Math.max(ext,(x[o]-cx)*S[0]+(x[o+2]-cz)*S[2]+B.r[i]); }
  const q=[cx+S[0]*ext,0,cz+S[2]*ext];
  let phi=Math.atan2(v3.dot(Rh[2],S),Rh[2][1]); if(phi<-1.2) phi+=Math.PI*2;
  /* the hold: whatever turned him back since the last step is turned forward again, positions only, which also takes the backward
     speed out of him (a verlet body's speed is where it is minus where it was) */
  if(R.hold&&R.ref!=null&&phi<R.ref){ wdTurn(E,q,k,(R.ref-phi)*R.sd,false); phi=R.ref; }
  else if(R.ref!=null&&phi<2.2&&phi-R.ref>2.4*h){ wdTurn(E,q,k,-(phi-R.ref-2.4*h)*R.sd,false); phi=R.ref+2.4*h; } /* and he never goes over faster than ~140 deg/s: no whip, no spin */
  const a=R.w*h; if(a>1e-6) wdTurn(E,q,k,a*R.sd,true);
  R.ref=phi+a; } }
/* turn the body about the line through q along k by th: positions and histories together adds no speed; positions alone also changes it */
function wdTurn(E,q,k,th,both){ const B=E.B,PN=E.pinM,c=Math.cos(th),s=Math.sin(th);
  for(let i=0;i<NP;i++){ if(PN&&PN[i]) continue; const o=i*3;
    for(const Q of both?[B.x,B.p]:[B.x]){ const rx=Q[o]-q[0],ry=Q[o+1]-q[1],rz=Q[o+2]-q[2],kd=(k[0]*rx+k[1]*ry+k[2]*rz)*(1-c);
      Q[o]=q[0]+rx*c+(k[1]*rz-k[2]*ry)*s+k[0]*kd; Q[o+1]=q[1]+ry*c+(k[2]*rx-k[0]*rz)*s+k[1]*kd; Q[o+2]=q[2]+rz*c+(k[0]*ry-k[1]*rx)*s+k[2]*kd; } } }
const WD_TRUNK=['pelvis','hipL','hipR','chest','shL','shR','neck'];
/* the pose while rolling, relative to his hips: the top arm reaches across his chest, the bottom one goes up past his head so he
   doesn't roll onto it, the top knee comes up and over, the head and shoulders lead */
function wdRollPose(E,ph){ const R=E.wdRoll,sd=R?R.sd:1,far=sd>0?'R':'L',near=sd>0?'L':'R',zs=s=>s==='L'?1:-1,k=R&&R.push?1:.6;
  const j={spine:[.12,.3*sd*k,0],neck:[.1,0,0],head:[.05,.45*sd,0]};
  j['arm'+far]=[-1.25,0,-zs(far)*.45*k]; j['elbow'+far]=[-.55,0,0];
  j['arm'+near]=[-2.1,0,zs(near)*.25]; j['elbow'+near]=[-.35,0,0];
  j['thigh'+far]=[-.85*k,0,-zs(far)*.25]; j['knee'+far]=[1.3*k,0,0];
  j['thigh'+near]=[-.15,0,zs(near)*.05]; j['knee'+near]=[.25,0,0];
  return j; }

/* the crawl itself (the pull and the turn are the core's): steered from the middle of his trunk so his head doesn't nose into the
   furniture, pulled harder than the old drag (which moved him a few cm a minute), easing off at the end */
function wdCrawlTick(E,dt,pel){ const g=E.wdGoal; if(!g||g.reached||!E.crawlF) return;
  const B=E.B,ch=X_(B,PI_.chest),d=navTo((pel[0]+ch[0])/2,(pel[2]+ch[2])/2,g.x,g.z); E.crawlF[0]=d[0]; E.crawlF[1]=d[2];
  const left=Math.hypot(g.x-ch[0],g.z-ch[2]); E.crawlF[2]*=pnum('wounded','crawlGain',1.9)*clamp(left/.8,.35,1);
  /* got there? */
  let hit=false;
  if(g.kind==='gun'){ const q=g.P.node.p; for(const i of [PI_.hdL,PI_.hdR,PI_.head]){ const h=X_(B,i); if(Math.hypot(h[0]-q[0],h[2]-q[2])<.35){ hit=true; break; } } }
  else hit=Math.hypot(g.x-ch[0],g.z-ch[2])<(g.kind==='door'?.8:1.1);
  if(hit) return wdReached(E,g);
  /* going nowhere (a leg caught on something): try something else */
  const pr=E.wdProg; if(!pr||pr.g!==g){ E.wdProg={g,t:GAME.t,d:left,n:0}; return; }
  if(GAME.t-pr.t>4){ const m=pr.d-left; pr.t=GAME.t; pr.d=left; pr.n=m<.1?pr.n+1:0; /* no closer in 4 s (turning round to it is allowed once) */
    if(pr.n>=2){ (E.wdSeen||(E.wdSeen=[])).push([g.x,g.z]); E.wdGoal=null; E.wdPickT=GAME.t+5; protoEmit('stat','wdCrawlStuck',g.kind); } } }
function wdReached(E,g){ g.reached=true; g.rest=GAME.t+rnd(8,14); (E.wdSeen||(E.wdSeen=[])).push([g.x,g.z]); protoEmit('stat','wdCrawlReached',g.kind);
  if(g.kind==='gun') return wdPickup(E,g);
  if(E.barkCd>0) return;
  if(g.kind==='friend') bark(E,pick(LINES.call(g.E.name)),2.4);
  else if(g.kind==='tenant'){ bark(E,pick(['Help me... please... help me—','Get help— call somebody—','Please... I\'m bleeding—']),2.6); if(!g.E.panic&&typeof twCivPanic==='function') twCivPanic(g.E,'body'); } }
/* his gun again: in sight and in range he shoots from the floor; otherwise he lies on it and waits for you (the faker's ambush, 69-standoff.js) */
function wdPickup(E,g){ removePickup(g.P); E.wdGoal=null; E.wdArmed=true; E.temper='still'; E.fakeDead=true; protoEmit('wdPickup',E);
  const h=X_(E.B,PI_.head),d=Math.hypot(h[0]-PL.x,h[2]-PL.z);
  if(d<9&&!E.covered&&wdCanAim(E)&&(E.canSee||d<3)&&sightClear(h,[PL.x,1.5,PL.z])){ /* he can see you (lit, or right there) */ E.gShoot={t:0}; E.wpnHeld=true; E.wpnHand='R'; E.C.wpn.vis=true; setGrip(E.J,'R',true); E.atkCd=rnd(.6,1.1); E.aware=true; sfx('click',.8,h); }
  else { E.wpnHeld=false; E.C.wpn.vis=false; setGrip(E.J,'R',false); setGrip(E.J,'L',false); } }
function wdDownTick(E,dt){
  if(E.downMode==='roll'&&(E.wdRoll||GAME.t>(E.wdRollEnd||-9)+2)){ E.crawlF=[0,0,0]; /* not null: the floor's grip would take the roll back */ wdRollTick(E,dt); } else if(E.wdRoll) E.wdRoll=null;
  const pel=X_(E.B,PI_.pelvis);
  if(E.downMode==='crawl'){ wdCrawlTick(E,dt,pel); const q=E.wdLast; if(q) E.wdCrawled=(E.wdCrawled||0)+Math.hypot(pel[0]-q[0],pel[2]-q[1]); }
  E.wdLast=[pel[0],pel[2]];
  /* shooting from the floor at nothing: you've gone out of his sight, so he gets the gun back under him and waits. Face down he can
     only bring it round at you if you're somewhere in front of his head; behind him, the arm would be forced through the floor */
  if(E.gShoot&&E.wdArmed){ E.wdBlind=E.canSee?0:(E.wdBlind||0)+dt; if(E.wdBlind>2||!wdCanAim(E)){ E.gShoot=null; E.wpnHeld=false; E.C.wpn.vis=false; setGrip(E.J,'R',false); E.wdBlind=0; } } }
function wdCanAim(E){ const B=E.B,pe=X_(B,PI_.pelvis),ch=X_(B,PI_.chest),Rh=frameFrom(X_(B,PI_.hipL),X_(B,PI_.hipR),pe,ch); if(Rh[2][1]>-.3) return true;
  const hx=ch[0]-pe[0],hz=ch[2]-pe[2],rx=PL.x-ch[0],rz=PL.z-ch[2]; return (hx*rx+hz*rz)/((Math.hypot(hx,hz)*Math.hypot(rx,rz))||1)>.45; }

/* ---------- 5. tenants ---------- */
const wdSees=E=>(E.canSee??sightClear(X_(E.B,PI_.head),[PL.x,1.55,PL.z]))&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<12;
/* called from civReact the moment a tenant panics. Returns the mode, or null to let the old reactions decide (they didn't see you:
   gunfire through the wall, a body) */
function wdCivReact(E){ if(!PROTO.on) return null; const sees=wdSees(E); if(!sees&&!WD.civKilled) return null;
  E.wdRolled=true; if(sees) E.wdSeenAt=[PL.x,PL.z];
  if(WD.civKilled) return wdScream(E,true); /* they know what you do to people like them */
  const forced=window.__wdForce; let m;
  const mate=enemies.find(O=>O!==E&&O.civ&&!O.dead&&!O.shielder&&Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])<3.2);
  if(!forced&&mate&&Math.random()<.35) m='shield';
  else { const T=PROTO.wounded.civ,r=Math.random(); m=forced||(r<T.freeze?'freeze':r<T.freeze+T.hide?'hide':r<T.freeze+T.hide+T.scream?'scream':'point'); }
  protoEmit('tenantReact',E,m); protoEmit('stat','tenantReact',m);
  if(m==='shield') return civReact(E,'shield');
  if(m==='freeze') return civReact(E,Math.random()<PROTO.wounded.denyShare?'deny':'freeze'); /* some can't take it in: "Is that a gun?" */
  if(m==='hide') return civReact(E,'hide'); /* twCivPanic sends them to the back of the room */
  if(m==='scream') return wdScream(E,false);
  return wdPointStart(E); }
function wdScream(E,killed){ E.civMode='scream'; E.civT=0; E.civFreeze=false; E.wdScream={n:0,t:0,next:0,killed}; wdScreamNow(E);
  const q=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>3&&typeof civFleeSpot==='function'?civFleeSpot(E):null;
  if(q){ E.flee=q; E.role='civflee'; E.st='alert'; } else if(E.st==='idle'||E.st==='alert'){ E.st='kneel'; E.role=null; } /* screaming on their knees */
  return 'scream'; }
function wdScreamNow(E){ const S=E.wdScream; S.n++; S.t=0; S.next=rnd(2.6,4.2);
  bark(E,pick(WD_SCREAM),2.2); GAME.barkGlobal=.8; vox(E,'scream',1);
  noise([E.pos[0],0,E.pos[1]],pnum('wounded','screamR',20),{alarm:true,from:E,scream:true});
  if(typeof huntAlert==='function') huntAlert('scream',[PL.x,PL.z],1);
  protoEmit('tenantScream',E); protoEmit('stat','tenantScream',1); }
function wdPointStart(E){ const P=PROTO.wounded; E.civMode='point'; E.civT=0; E.st='alert'; E.civFreeze=true; E.compAt=rnd(.3,.6);
  E.wdPoint={t:0,at:rnd(P.pointAt[0],P.pointAt[1]),up:0,n:0}; return 'point'; }
function wdPointShout(E,again){ const P_=E.wdPoint; P_.n++; P_.last=P_.t; const at=E.wdSeenAt||[PL.x,PL.z];
  bark(E,pick(again?WD_POINT2:WD_POINT),2.2); GAME.barkGlobal=.8; vox(E,'shout',1);
  noise([E.pos[0],0,E.pos[1]],pnum('wounded','pointR',16),{alarm:true,from:E});
  if(typeof huntAlert==='function') huntAlert('seen',[at[0],at[1]],1); /* where they saw you, pointing at it */
  protoEmit('tenantPoint',E); protoEmit('stat','tenantPoint',1); }
function wdCalm(E,why){ const was=E.wdPoint||E.wdScream; E.wdPoint=null; E.wdScream=null; E.wdCalm=true;
  if(E.civMode==='point'||E.civMode==='scream') E.civMode='freeze';
  if(was&&why==='shush'&&E.barkCd<=1){ bark(E,pick(WD_CALM),1.6); vox(E,'whimper',.5); } /* a nod, a whisper: nothing that carries */
  protoEmit('tenantCalm',E,why); protoEmit('stat','tenantCalm',why); }
function wdCivTick(E,dt){ if(!E.panic) return;
  const sees=wdSees(E),d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); let fresh=false;
  if(sees){ fresh=!E.wdSeeing&&((E.wdUnseen??9)>=2); E.wdSeeing=true; E.wdUnseen=0; E.wdSeenAt=[PL.x,PL.z]; }
  else { E.wdUnseen=(E.wdUnseen||0)+dt; if(E.wdUnseen>.6) E.wdSeeing=false; }
  const aimed=E.covered&&(E.coverT||0)>.25,shushed=WD.shush&&sees&&d<pnum('wounded','shushSeeR',9);
  /* a fresh look at you */
  if(fresh&&!E.wdPoint&&!E.wdScream){
    if(WD.civKilled) wdScream(E,true);
    else if(!E.wdRolled&&!E.wdCalm&&!E.surr){ E.wdRolled=true; /* they panicked at the noise; now they see who made it */
      const T=PROTO.wounded.civ,r=Math.random(),m=window.__wdForce||(r<T.scream?'scream':r<T.scream+T.point?'point':null);
      if(m) protoEmit('tenantReact',E,m); if(m==='scream') wdScream(E,false); else if(m==='point'&&(E.st==='alert'||E.st==='kneel')) wdPointStart(E); } }
  if((aimed||shushed)&&!E.wdCalm&&!(E.wdScream&&E.wdScream.killed)) wdCalm(E,aimed?'aim':'shush'); /* your gun on them or your finger to your lips: not a word */
  const P_=E.wdPoint;
  if(P_){ P_.t+=dt; if(E.st!=='alert'||E.surr){ E.wdPoint=null; }
    else { if(P_.t>P_.at-.35) P_.up=Math.min(1,P_.up+dt*3.5); /* the arm comes up, then the shout */
      if(P_.n===0&&P_.t>=P_.at) wdPointShout(E,false);
      else if(P_.n===1&&sees&&P_.t>=P_.at+2.6) wdPointShout(E,true);
      if(P_.t>P_.at+(P_.n>1?4.4:3.2)){ E.wdPoint=null; E.civMode='freeze'; } } }
  const S=E.wdScream;
  if(S){ S.t+=dt; if(!sees&&S.t>2) E.wdScream=null; /* out of sight: down to sobbing */
    else if(S.t>S.next&&S.n<(S.killed?4:3)&&sees) wdScreamNow(E); else if(S.n>=(S.killed?4:3)&&S.t>S.next) E.wdScream=null; } }
/* the pointing arm, laid over the frozen pose (called from flinchPose, 70-wounds.js) */
function wdPointPose(E,J){ const P_=E.wdPoint; if(!P_||P_.up<=.01) return;
  const M0=fkMats(J),sh=mulP(M0.armR,[0,0,0]),hd=mulP(M0.handR,[0,0,0]),at=E.wdSeenAt||[PL.x,PL.z];
  const pt=mtv(ryM(E.hd),[at[0]-E.pos[0],1.35,at[1]-E.pos[1]]),tgt=v3.add(sh,v3.sc(norm3(v3.sub(pt,sh)),.52));
  ikArm(J,'R',v3.add(hd,v3.sc(v3.sub(tgt,hd),P_.up))); }

/* ---------- the shush: a hand at your mouth (finger to the lips), and the mic quiet or off ---------- */
function wdShushTick(dt){ let on=false;
  if(typeof PL.mouthCovered==='boolean') on=PL.mouthCovered; /* hiding's hand-over-mouth (86-hide.js), when it's in */
  else { const c=camBasis(),m=[c.eye[0]+c.f[0]*.08-c.u[0]*.08,c.eye[1]+c.f[1]*.08-c.u[1]*.08,c.eye[2]+c.f[2]*.08-c.u[2]*.08],R=pnum('wounded','shushR',.12);
    for(const h of [HANDS.L,HANDS.R]){ if(!h||!h.M) continue; const q=mulP(h.M,FIST); if(Math.hypot(q[0]-m[0],q[1]-m[1],q[2]-m[2])<R){ on=true; break; } }
    if(!XR.on&&KEYS.KeyJ) on=true; } /* flat screen: hold J */
  const quiet=typeof MIC==='undefined'||MIC.state!=='on'||MIC.db<(MIC.talkAt??MIC_CFG.talk); /* a whispered "shh" is under the talk mark */
  const was=WD.shush; WD.shushT=on&&quiet?WD.shushT+dt:0; WD.shush=WD.shushT>=pnum('wounded','shushHold',.3);
  if(WD.shush&&!was) protoEmit('shush'); }

/* ---------- the frame ---------- */
function wdTick(gdt){ if(!GAME.started) return; wdShushTick(gdt);
  for(const E of enemies){ if(E.dead||E.ally) continue;
    wdVoice(E);
    if(E.wounds.length) wdClotTick(E,gdt);
    if(E.st==='down') wdDownTick(E,gdt); else if(E.wdRoll) E.wdRoll=null;
    if(E.civ) wdCivTick(E,gdt);
    /* which gun on the floor is his: the one that just left his hand */
    if(E.wdHeld&&!E.wpnHeld&&!E.fakeDead&&RANGED[E.kind]){ const k=KIND_WPN[E.kind]; for(let i=LOOSE.length-1;i>=0&&i>=LOOSE.length-3;i--){ const P=LOOSE[i]; if(P.item.key===k&&P.age<1){ E.wdGun=P; break; } } }
    E.wdHeld=E.wpnHeld; } }
if(PROTO.on){
  protoOn('tick',wdTick); protoOn('substep',wdRollStep);
  protoOn('death',E=>{ if(E.civ&&!E.ally&&!WD.civKilled){ WD.civKilled=true; for(const O of enemies) if(O.civ) O.wdCalm=false; protoEmit('tenantKilled',E); } });
  protoOn('huntEnd',()=>{ for(const E of enemies) if(E.civ){ E.wdCalm=false; E.wdRolled=false; } }); /* the next hunt, they might talk */
  protoOn('reset',()=>{ WD.civKilled=false; WD.shushT=0; WD.shush=false; });
}
