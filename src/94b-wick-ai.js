/* =====================================================================
   WICK stage 4: the enemies. Plan sections 2b, 2c and 6.2-6.3. Everything here only runs with WICK.on.
   Quiet beat: men stand posts and walk short loops; the notice meter (83-hunt.js huntPerceive) fills with sight. A noise turns a
   man toward it; nobody goes searching. It goes loud on a body found, an unsuppressed shot (yours or theirs), or a man who knows
   you're there and is still on his feet (or has his gun up from the floor) WICK.ai.grace seconds later. Kill him first and you're
   still quiet (Gunman Contracts does the same).
   Loud beat: every man knows where you are the whole time (E.tracks: no searching, no hiding). Two push straight at you (the
   tower's 'hunt' role, a short rage to get them moving), the rest hold; every WICK.ai.pushEvery s, if fewer than two are on you,
   the nearest holder comes. Two shooters at a time beyond 3.5 m (84-fight.js FGT.token2), everyone inside it.
   Violence is fun (plan 2c): no begging, pleading, sobbing or long screams (lines and voices are swapped for grunts and swearing
   at bark() and vox()); a man down either brings his gun up from the floor within a second or so, or dies within seconds; wounds
   bleed WICK.ai.bleedK times faster and a second body round finishes him; every hit shoves harder, a shoulder hit turns him, a
   close shotgun load throws him back a step; surrender is rare (the last man of a beat, sometimes), short, and he goes for his
   gun; as their numbers drop the lines go from orders to "who IS this guy" to fear, and the target bargains.
   The horror prototype's hunt (83-hunt.js huntAlert/huntThink), its searching (52-senses.js startSearch), its director
   (83a-director.js) and hiding (86-hide.js spots) are switched off with WICK.on; the hooks in those files call in here.
   ?w.ai.<key>=n sets any number below.
   ===================================================================== */
WICK.ai={ grace:1.3, supHear:4, push:1.1, spin:1.15, throwN:3, throwV:3.2, throwStep:.7, bleedK:2.5,
  down:[1.6,2.8], downFight:.55, downFightLife:[5,8], downAim:[.5,1.0], second:[.3,.7],
  surrP:.4, surrT:[1.5,2.4], pushEvery:6, pushers:2, pushRage:5, nearR:5, shooters:2, fearGap:[3.5,6], bargainGap:[4.5,7] };
wickUrlSet('ai');
const WK_AI={pushT:0,fearT:3,bargT:2,lastFire:{t:-99,sup:true}};
if(WICK.on) PROTO.hunt.hear.sup=wnum('ai','supHear',4); /* the plan's suppressor: heard a few metres off (the prototype's was 10) */
if(WICK.on) PROTO.fight.retreat=0; /* hurt men don't back off into a dark room to wait: they come at you or go down */

/* ---------- what they say: grunts, swearing, orders. Never begging ---------- */
const WK_GRUNT=['*grunts*','Hnn—','Agh—','...fuck.','Hhh—'];
const WK_SWEAR=['Fuck!','Son of a bitch—','You motherfucker—','Shit!','Fuck you!'];
const WK_DOWNGUN=['Fuck you—','Come here—','Hnn— got you—'];
const WK_FEAR=[ ['Push him!','Go, go, go!','Move up!','Cut him off!','Get on him!','Box him in!'],
  ['It\'s him— it\'s HIM!','Who the hell is this guy?!','He\'s killing everybody!','How is he still standing?!','Where\'s everybody else?!'],
  ['Stay back! STAY BACK!','This isn\'t worth it—','Jesus Christ—','Somebody shoot him!','I\'m not dying for Sorel!'] ];
const WK_BARGAIN=['Whatever they\'re paying you, I\'ll double it!','Name a number. Any number.','We can talk about this.','You know what I can give you?','Walk away and you\'re a rich man.'];
const WK_SURR=['Alright. Alright.','Easy. Easy, man.','You win. You win.'],WK_SPRING=['...the hell I am.','Fuck it—','Like hell.'];
if(WICK.on){ Object.assign(LINES,{ alert:['Hey! HEY!','Who the hell—','Gun! GUN!','Contact!','He\'s here!'],
    leg:['Agh— my leg—','Fuck!','Hnn— son of a—'], torso:['Fuck— I\'m hit!','Agh!','Son of a bitch—'], arm:['Agh! My arm!','Fuck— my hand—'],
    stab:['Hnn—!','Agh—','You fuck—'], beg:['Fuck you.','...hnn.','*grunts*','Come on then.'], crawl:['*grunts*','Hnn...','...fuck.'], dying:['...','Hhh...'],
    call:n=>[`${n}! He's here!`,`${n}! Get him!`] });
  HOSTAGE_LINES.splice(0,HOSTAGE_LINES.length,'Shoot him! SHOOT HIM!','Take the shot!','Don\'t mind me— shoot!','Do it! DO IT!','Get him off me!');
  SURR_LINES.splice(0,SURR_LINES.length,...WK_SURR); }
/* every line passes here (50-game.js bark()). Anything pleading or pitiful becomes a grunt or a curse */
const WK_PLEAD=/\bplease\b|don'?t shoot|don'?t do (it|this)|don'?t[—.]|kids|daughter|\bmom\b|oh god|\bhelp\b|no no|\*sob|\*whimper|\*crying|\*screaming|i'?m done|water|so cold|wanna die|\bstop\b|okay! okay|okay— okay|i just live|i owe|no more|not him|get up, man|i can'?t (feel|stand|breathe)|where'?s my|my (leg|arm|hand)— (it|where)/i;
function wickBark(E,text){ if(!WICK.on||typeof text!=='string'||!WK_PLEAD.test(text)) return text; return pick(E&&(E.st==='down'||E.st==='kneel')?WK_GRUNT:WK_SWEAR); }
/* and every voice (55-voice.js vox()): no sobbing, no pleading, no long screams */
const WK_VOX={agony:'grunt',cry:'shout',plead:'grunt',whimper:null,sob:null,scream:'shout',groan:'grunt',stabbed:'grunt'};
function wickVox(type){ return WICK.on&&type in WK_VOX?WK_VOX[type]:type; }

/* ---------- the hunt's alerts, Wick's way (83-hunt.js huntAlert calls this instead of running a hunt) ---------- */
function wickHuntAlert(reason,pos,strength,E){ const D=WICK_DIR; pos=pos||[PL.x,PL.z];
  if(!D.on){ /* ?wick=1 on floor 01: no director, so anything real brings the men near it */
    if(reason==='seen'||reason==='body'||reason==='shot'||reason==='scream'||reason==='radio'){ const R=reason==='shot'?40:15; for(const O of enemies) if(!O.dead&&!O.civ&&!O.ally&&Math.hypot(O.pos[0]-pos[0],O.pos[1]-pos[1])<R) wickPush(O); } /* a gunshot carries the floor */
    else if(E&&!E.aware&&typeof huntTurn==='function') huntTurn(E,pos); return; }
  if(D.loud){ if(E&&!E.dead&&!E.wkSleep) wickPush(E); return; }
  if(reason==='body'){ wickLoud('body'); return; }
  if(reason==='shot'&&GAME.t-WK_AI.lastFire.t<.5&&!WK_AI.lastFire.sup){ wickLoud('shot'); return; }
  /* a noise, a glimpse, a scream: he turns to it (and so does anyone free right by him). No looking around the room for you */
  if(reason==='seen') return; /* the witness rule below decides */
  if(E&&!E.aware&&!E.dead&&typeof huntTurn==='function') huntTurn(E,pos);
  for(const O of enemies) if(O!==E&&!O.dead&&!O.wkSleep&&!O.aware&&upright(O)&&Math.hypot(O.pos[0]-pos[0],O.pos[1]-pos[1])<4&&typeof huntTurn==='function') huntTurn(O,pos); }
/* 52-senses.js startSearch: in this game nobody searches. A man who lost you comes for you */
function wickNoSearch(E,c,why){ if(!WICK.on||E.civ||E.ally) return false; if(E.aware||WICK_DIR.loud||!WICK_DIR.on) wickPush(E); return true; }
/* he knows where you are and comes (loud) */
function wickPush(E,wave){ if(!E||E.dead||E.civ||E.ally||E.wkSleep) return; setAware(E,wave?'told':'told',[PL.x,PL.z]);
  E.tracks=true; E.wkLoud=true; E.lkp=[PL.x,PL.z]; E.lostT=0; E.mind='hunt'; E.goHome=false; E.patrol=null; E.hTurn=null; E.hReact=0;
  if(E.hj&&typeof huntUnjob==='function') huntUnjob(E); if(E.st==='idle') E.st='alert'; }

protoOn('fire',(h,it,info)=>{ if(!WICK.on) return; WK_AI.lastFire={t:GAME.t,sup:!!(info&&info.sup)}; if(!(info&&info.sup)&&WICK_DIR.on) wickLoud('shot'); });
protoOn('noise',(src,rad,o)=>{ if(WICK.on&&WICK_DIR.on&&o&&o.kind==='eshot') wickLoud('theirShot'); }); /* one of theirs fired */

/* ---------- a man down ---------- */
/* 50-game.js toDown: does he keep his gun under him? (then 69-standoff.js keeps it hidden till he brings it up) */
function wickDownKeep(E){ return !E.wkDownDone&&!!E.C.wpn&&!!RANGED[E.kind]&&E.wpnHeld&&Math.random()<wnum('ai','downFight',.55); }
function wkDownTick(E,dt,dist){ const A=WICK.ai;
  if(E.st==='kneel'&&!E.surr){ toDown(E); return; } /* no kneeling: that's the begging posture */
  if(E.st!=='down'||E.knocked) return; /* knocked flat by a kick or out cold: he gets up as before */
  if(!E.wkDown){ if(!E.fakeDead&&E.C.wpn&&RANGED[E.kind]&&!E.wpnHeld&&Math.random()<A.downFight){ /* he went down through his knees and let go of it: it's by his hand, he takes it back */
      const hp=X_(E.B,PI_['hd'+(E.wpnHand||'R')]),key=KIND_WPN[E.kind],P=LOOSE.find(P=>P.item&&P.item.key===key&&Math.hypot(P.node.p[0]-hp[0],P.node.p[2]-hp[2])<1.6);
      if(P){ removePickup(P); fakeDeadStart(E); } }
    const fight=!!E.fakeDead; E.wkDownDone=true; E.wkDown={t:0,fight,aimAt:rnd(A.downAim[0],A.downAim[1])};
    E.dieT=Math.min(E.dieT??99,fight?rnd(A.downFightLife[0],A.downFightLife[1]):rnd(A.down[0],A.down[1])); }
  const W=E.wkDown; W.t+=dt;
  if(W.fight&&E.fakeDead&&!E.gShoot&&W.t>=W.aimAt&&E.cons>.3&&E.C.wpn&&dist<14){ const h=X_(E.B,PI_.head);
    if(sightClear(h,[PL.x,1.5,PL.z])){ E.gShoot={t:0}; E.wpnHeld=true; E.wpnHand='R'; E.C.wpn.vis=true; setGrip(E.J,'R',true); E.atkCd=rnd(.25,.45); E.aware=true; sfx('click',.8,h); bark(E,pick(WK_DOWNGUN),1.4); } }
  if(!E.gShoot&&E.downMode!=='writhe'){ E.downMode='still'; E.crawlF=null; } /* no crawling away, no cowering */
  if(E.face==='beg'){ E.face='hurt'; E.J.headMesh.mesh.mats[0]=E.C.faceM.hurt; E.J.headMesh.mesh.runs=null; } }

/* ---------- hits: faster bleeding, the second body round, a harder shove ---------- */
protoOn('enemyHit',(E,seg,weapon,o)=>{ if(!WICK.on||!E||E.dead) return; (E.wkHq||(E.wkHq=[])).push({part:seg[3],weapon,pellet:!!(o&&o.pellet)});
  if(weapon==='gun'&&/^(chest|belly)/.test(seg[3])) E.wkBody=(E.wkBody||0)+1; });
function wkHitTick(E,dist){ const A=WICK.ai;
  for(const w of E.wounds) if(!w.wkB){ w.wkB=1; w.rate*=A.bleedK; }
  if(E.wkBody>=2&&!E.wkFin){ E.wkFin=true; E.dieT=Math.min(E.dieT??99,rnd(A.second[0],A.second[1])); }
  const q=E.wkHq; if(!q||!q.length) return; const d=E.hitDir||[0,0,0],l=Math.hypot(d[0],d[2]); let pel=0,sh=null;
  for(const h of q){ if(h.pellet) pel++; if(/^uarm[LR]$/.test(h.part)) sh=h; } q.length=0; if(l<1e-6||!E.B) return;
  const f=[d[0]/l,0,d[2]/l],up=E.st==='alert'||E.st==='idle',B=E.B;
  for(const i of [PI_.chest,PI_.neck,PI_.shL,PI_.shR,PI_.pelvis]) kickV(B,i,v3.sc(f,A.push),H);
  if(sh&&up&&!E.dead){ const s=sh.part.slice(-1),sp=X_(B,PI_['sh'+s]),pc=X_(B,PI_.pelvis),ty=(sp[2]-pc[2])*f[0]-(sp[0]-pc[0])*f[2]; /* the push on that shoulder, about his spine */
    E.hd+=Math.sign(ty||1)*A.spin*rnd(.8,1.1); kickV(B,PI_['sh'+s],v3.sc(f,A.push*1.6),H); E.stun=Math.max(E.stun,.35); E.wkSpin=(E.wkSpin||0)+1; }
  if(pel>=A.throwN){ const k=A.throwV*clamp((7-dist)/4,.3,1.2); for(let i=0;i<NP;i++) kickV(B,i,v3.add(v3.sc(f,k),[0,.5,0]),H); if(!E.dead&&up){ E.pos[0]+=f[0]*A.throwStep; E.pos[1]+=f[2]*A.throwStep; pushOutXZ(E.pos,.3,'walker'); } E.stun=Math.max(E.stun,.9); E.settle=Math.max(E.settle||0,1); E.wkThrown=(E.wkThrown||0)+1; } }

/* ---------- surrender: rare, short, and he goes for his gun ---------- */
function wickSurrOk(E,why){ return !WICK.on||!!E.wkSurr||!!E.civ; }
function wkSurrTick(dt){ const D=WICK_DIR,b=D.beat;
  for(const E of enemies){ if(!E.wkSurr||E.dead) continue; if(!E.surr){ E.wkSurr=false; continue; } E.surr.hold=99; E.wkSurrT-=dt;
    if(E.wkSurrT<=0){ E.wkSurr=false; springBack(E); E.surr=null; bark(E,pick(WK_SPRING),1.4); GAME.barkGlobal=.8; wickPush(E); } }
  if(!D.on||!b||!D.loud||b.surrDone||(b.n0||0)<3) return;
  const left=wkMenOf(D.i).filter(O=>!O.dead&&!O.wkHeld); if(left.length!==1||(b.waves||[]).some((w,k)=>!b.waveDone[k])) return;
  const E=left[0]; if(E.wkTarget||!upright(E)||!armed(E)||!E.canSee||E.surr||Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>7) return;
  b.surrDone=true; if(Math.random()>=wnum('ai','surrP',.4)) return;
  E.wkSurr=true; E.wkSurrT=rnd(WICK.ai.surrT[0],WICK.ai.surrT[1]); E.wpnHeld=false; if(E.C.wpn) E.C.wpn.vis=false; setGrip(E.J,'R',false); setGrip(E.J,'L',false); /* the gun goes behind his back, not on the floor */
  surrender(E,'alone'); if(E.surr) E.surr.hold=99; wkDirLog('surrender',{who:E.name}); }

/* ---------- loud: who pushes, two shooters, the first push ---------- */
function wkToken2(){ if(typeof FGT==='undefined'||typeof fxTokOk!=='function') return; let T=FGT.token2; const ok=E=>fxTokOk(E)&&E.canSee&&E!==FGT.token;
  if(T&&(!ok(T)||(T.fx&&T.fx.unseen>.6))) FGT.token2=T=null; if(T||PL.dead||!FGT.token||wnum('ai','shooters',2)<2) return;
  let best=null,bd=1e9; for(const E of enemies){ if(!ok(E)) continue; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(d<bd&&d<=pnum('fight','range',25)){ bd=d; best=E; } }
  if(best){ FGT.token2=best; best.atkCd=Math.max(best.atkCd,rnd(.3,.6)); } }
function wkPushTick(dt){ const D=WICK_DIR,A=WICK.ai; if(!D.loud||PL.dead) return;
  const men=enemies.filter(E=>!E.dead&&!E.wkSleep&&E.aware&&upright(E)&&!E.surr&&!E.civ&&!E.ally),dP=E=>Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z);
  if(D.firstPushT==null&&D.loudT!=null){ const E=men.find(E=>dP(E)<A.nearR); if(E){ D.firstPushT=+(GAME.t-D.loudT).toFixed(2); wkDirLog('firstPush',{s:D.firstPushT,by:E.name}); protoEmit('stat','wickPush',D.firstPushT); } }
  WK_AI.pushT-=dt; if(WK_AI.pushT>0) return; WK_AI.pushT=A.pushEvery;
  let pushing=men.filter(E=>E.role==='hunt'&&E.rage>0||dP(E)<A.nearR).length;
  for(const E of men.slice().sort((a,b)=>dP(a)-dP(b))){ if(pushing>=A.pushers) break; if(E.rage>0||dP(E)<A.nearR) continue;
    E.role='hunt'; E.hold=null; E.rage=Math.max(E.rage||0,A.pushRage); if(E.fx){ E.fx.cov=null; E.fx.ret=null; } pushing++; }
  if(typeof SQ!=='undefined'&&SQ.jobs) for(const E of men) if(E.rage>0) SQ.jobs.delete(E); } /* a man told to push isn't also told to hang back */

/* ---------- fear: the lines change as their numbers drop; the target bargains ---------- */
function wkFearTick(dt){ const D=WICK_DIR,b=D.beat; if(!D.on||!b||!D.loud) return; WK_AI.fearT-=dt; WK_AI.bargT-=dt;
  const men=wkMenOf(D.i),n0=Math.max(1,b.n0||men.length),alive=men.filter(E=>!E.dead&&!E.wkHeld&&upright(E)),frac=alive.length/n0;
  const T=men.find(E=>E.wkTarget&&!E.dead);
  if(T&&WK_AI.bargT<=0&&T.canSee&&T.barkCd<=0&&Math.hypot(T.pos[0]-PL.x,T.pos[1]-PL.z)<11&&(alive.length<=2||T.wounds.length)){ WK_AI.bargT=rnd(WICK.ai.bargainGap[0],WICK.ai.bargainGap[1]); bark(T,pick(WK_BARGAIN),2.6); GAME.barkGlobal=1; if(typeof vox==='function') vox(T,'shout',.7); }
  if(WK_AI.fearT>0||GAME.barkGlobal>0) return; WK_AI.fearT=rnd(WICK.ai.fearGap[0],WICK.ai.fearGap[1]);
  const tier=frac>.66?0:frac>.34?1:2,S=alive.filter(E=>!E.wkTarget&&E.barkCd<=0&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<15);
  if(!S.length) return; const E=pick(S); bark(E,pick(WK_FEAR[tier]),2.2); GAME.barkGlobal=1; if(typeof vox==='function') vox(E,'shout',.8); E.wkFear=tier; }

/* ---------- quiet: the witness rule ---------- */
function wkQuietTick(){ const D=WICK_DIR; if(!D.on||!D.beat||D.loud) return; const g=wnum('ai','grace',1.3);
  for(const E of enemies){ if(E.dead||E.wkSleep||E.wkBeat==null||E.civ||E.ally) continue;
    if(!E.aware){ E.wkSawT=null; continue; } if(E.wkSawT==null) E.wkSawT=GAME.t;
    if(GAME.t-E.wkSawT>=g&&(upright(E)||E.gShoot)){ wkDirLog('witness',{who:E.name}); wickLoud('seen'); return; } } }

/* ---------- 84-fight.js fxRooms on the club: its rooms and doorways (rooms are all lit) ---------- */
function wickFightRooms(){ const out=[]; for(const r of WK.rooms){ const R={x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,lit:true,doors:[],id:r.id,src:null};
    for(const o of WK_OPEN){ if(o.a!==r.id&&o.b!==r.id) continue; const x=o.axis==='z'?o.c:o.at,z=o.axis==='z'?o.at:o.c;
      for(const n of [[1,0],[-1,0],[0,1],[0,-1]]) if(x+n[0]*.7>R.x0&&x+n[0]*.7<R.x1&&z+n[1]*.7>R.z0&&z+n[1]*.7<R.z1){ R.doors.push({x,z,n}); break; } }
    out.push(R); } return out; }

protoOn('tick',(gdt,dt)=>{ if(!WICK.on||!GAME.started) return;
  for(const E of enemies){ if(E.civ||E.ally||E.wkSleep||E.dead&&!(E.wkHq&&E.wkHq.length)) continue; const dist=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); wkHitTick(E,dist); if(!E.dead) wkDownTick(E,gdt,dist); } /* the shot that killed him still throws him */
  wkQuietTick(); wkSurrTick(gdt); wkToken2(); wkPushTick(gdt); wkFearTick(gdt); });
protoOn('reset',()=>{ if(typeof FGT!=='undefined') FGT.token2=null; WK_AI.pushT=0; WK_AI.fearT=3; });
protoOn('wickRestart',()=>{ if(typeof FGT!=='undefined'){ FGT.token=null; FGT.token2=null; } WK_AI.pushT=0; WK_AI.fearT=3; });
protoOn('wickLoud',()=>{ WK_AI.pushT=0; WK_AI.fearT=rnd(2,3.5); });
