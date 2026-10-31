/* ---------- the standoff: your gun on someone, surrender, and men who only pretend ----------
   Built from how people really behave (Force Science studies, the FBI's wounding-factors report, Ripley on disaster behaviour):
   - one hit stops some men cold in the head; others never quit (E.psych: quit / fight / fake)
   - under a gun most people comply, some only after a beat; a few never do
   - hands coming up start at the waist: for a split second a surrender looks exactly like a draw
   - a man who gave up, or lies there "dead", can still be a threat: a faker waits for your gun to leave him
   - tenants mostly freeze, silent; some hide, some can't believe it, some run if the way out doesn't pass you,
     some put themselves between you and the person next to them
   E.covered: your gun is on him right now (VR: the muzzle line; flat screen: the crosshair) */
const SURR_LINES=['Okay! Okay!','Don\'t shoot!','I\'m done— I\'m done!','Alright, alright—','No more, man—'];
const SURR_PLAIN=['Don\'t shoot!','Okay! Okay!','Please—','Don\'t— don\'t—'];
const FREEZE_LINES=['Please...','I— I—','Oh God...','Please, I—'];
const DENY_LINES=['What— what is that?','Is that a gun?','What\'s happening?','Who are you?','This isn\'t— this isn\'t real—'];
const SHIELD_LINES=['Don\'t look, don\'t look—','Stay down— stay down—','I got you, I got you—','Not her— please—'];
const FLEE_LINES=['Help! Somebody help!','He\'s got a gun!','Run! RUN!'];

function psychOf(E){ if(!E.psych){ const r=Math.random(); E.psych=E.civ?'civ':r<.35?'quit':r<.8?'fight':'fake'; } return E.psych; }

/* where your guns point */
function playerAims(){ const out=[]; for(const h of [HANDS.R,HANDS.L]){ const it=h.item,w=it&&WPN[it.key]; if(!w||!w.gun) continue;
    if(XR.on){ const Mi=itemM(h),mz=mulP(Mi,canMuzzle(w,it)),bd=norm3(v3.sub(mz,mulP(Mi,[0,w.axisY,0]))); out.push({o:mz,d:bd}); }
    else if(h===HANDS.R){ const c=camBasis(); out.push({o:c.eye,d:c.f}); } }
  return out; }
/* the line passes within a body's width of his head, chest or hips, in front of you, with nothing in between */
function coveredBy(E,aims){ const B=E.B;
  for(const a of aims) for(const i of [PI_.chest,PI_.head,PI_.pelvis]){ const p=X_(B,i),v=v3.sub(p,a.o),t=v3.dot(v,a.d); if(t<.25||t>11) continue;
    const off=v3.sub(v,v3.sc(a.d,t)); if(Math.hypot(off[0],off[1],off[2])>.28+t*.025) continue; if(sightClear(a.o,p)) return true; }
  return false; }
const lookingAt=(p,deg)=>{ const c=camBasis(),v=norm3(v3.sub(p,c.eye)); return v3.dot(v,c.f)>Math.cos(deg*Math.PI/180); };

function surrender(E,why){ if(E.dead||E.surr||E.ally) return;
  E.surr={ph:'reach',t:0,why,hold:rnd(.9,1.6)}; E.role=null; E.atkCd=1e9; E.burstN=0; E.atkT=-1; E.fakeWait=rnd(1.2,2.6);
  E.backup=!E.civ&&psychOf(E)==='fake'&&!!E.C.wpn&&!!RANGED[E.kind];
  if(E.barkCd<=0||why!=='civ'){ bark(E,pick(E.civ?FREEZE_LINES:E.concealed?SURR_PLAIN:SURR_LINES),2.2); GAME.barkGlobal=.8; } /* plain clothes: only what a tenant would say too */
  vox(E,E.civ?'cry':'plead',.9); }
/* a faker comes back up with the gun he kept */
function springBack(E){ E.surr=null; E.st='alert'; E.rise=.55; E.aware=true; E.role='hunt'; E.concealed=false;
  E.wpnHeld=true; E.wpnHand='R'; E.C.wpn.vis=true; setGrip(E.J,'R',true); E.sprung=.35; E.backup=false; if(E.concealed!==undefined){ bark(E,pick(LINES.alert),1.6); GAME.barkGlobal=1; vox(E,'shout'); } /* he's been waiting for this: the first shot comes in about a third of a second */ sfx('click',.9,[E.pos[0],1.1,E.pos[1]]); }

function surrDecide(E,dt,dist){
  if(E.civ||E.surr||E.dead||E.st!=='alert'||!E.aware||E.grabbed) return; const P=psychOf(E);
  const quitter=P==='quit'||P==='fake';
  /* one hit and he's done (a psychological stop) */
  if(E.hitT<.05&&!E.hitSeen){ E.hitSeen=true; if(quitter&&Math.random()<.75) return surrender(E,'hit'); if(P==='fight'&&E.blood<70&&Math.random()<.15) return surrender(E,'hit'); }
  if(E.hitT>.05) E.hitSeen=false;
  /* your gun on him from close: comply, unless he's the kind who never does */
  if(E.covered&&dist<4.5&&E.coverT>.35){ E.compT=(E.compT||0)+dt; if(quitter&&E.compT>rnd(.3,1.2)) return surrender(E,'covered');
    /* last man standing, hurt, gun on him */
    if(P==='fight'&&E.wounds.length&&!enemies.some(O=>O!==E&&!O.civ&&!O.dead&&!O.surr&&O.aware&&(O.st==='alert'||O.st==='idle'))&&E.compT>2.5) return surrender(E,'alone'); }
  else E.compT=0; }

function surrTick(E,dt,dist){ const S=E.surr; if(!S||E.dead) return; S.t+=dt;
  if(S.ph==='reach'&&S.t>.22){ S.ph='hands'; S.t=0; if(E.wpnHeld) dropWeapon(E); } /* the hands come up from the belt; the gun falls */
  else if(S.ph==='hands'&&S.t>S.hold&&E.st==='alert'){ S.ph='kneel'; S.t=0; E.st='kneel'; }
  if(E.st==='down'){ E.surr=null; return; }
  /* the faker: your gun leaves him and he's close enough to make it count */
  if(E.backup&&(S.ph==='kneel'||S.ph==='hands')&&!E.covered&&E.freeT>E.fakeWait&&dist<8&&E.cons>.45&&sightClear(X_(E.B,PI_.head),[PL.x,1.5,PL.z])) springBack(E); }

/* ---- playing dead with a gun under him ---- */
function fakeDeadStart(E){ E.fakeDead=true; E.temper='still'; E.wpnHeld=false; if(E.C.wpn) E.C.wpn.vis=false; setGrip(E.J,'R',false); setGrip(E.J,'L',false); }
function fakeDeadTick(E,dt,dist){ if(!E.fakeDead||E.dead) return;
  if(E.st!=='down'){ E.fakeDead=false; return; }
  if(!E.gShoot){ const h=X_(E.B,PI_.head);
    /* you walked up and your gun and your eyes are somewhere else */
    if(dist<4.2&&!E.covered&&E.freeT>.8&&(E.energy??1)>.25&&(!lookingAt(h,40)||E.freeT>2.6)&&sightClear(h,[PL.x,1.5,PL.z])){
      E.gShoot={t:0}; E.wpnHeld=true; E.wpnHand='R'; E.C.wpn.vis=true; setGrip(E.J,'R',true); E.atkCd=rnd(.3,.45); E.aware=true; sfx('click',.8,h); }
    return; }
  E.gShoot.t+=dt; E.atkCd-=dt;
  if(E.cons<.3||!E.wpnHeld){ E.gShoot=null; E.fakeDead=false; if(E.wpnHeld) dropWeapon(E); return; }
  /* firing from his back is awkward: he lets go once the gun is roughly on you (about 50 degrees), not lined up like a man standing */
  if(E.atkCd<=0){ const g=gunRay(E); E.atkCd=v3.dot(g.d,norm3(v3.sub([PL.x,1.45,PL.z],g.mz)))>Math.cos(.9)?(enemyShoot(E,true),rnd(.45,.85)):.1; } }
/* a kick knocks the gun out from under him */
function kickedDown(E,fl){ if(!(E.fakeDead||E.gShoot)||E.dead) return;
  E.fakeDead=false; E.gShoot=null; E.wpnHeld=true; if(E.C.wpn) E.C.wpn.vis=true; dropWeapon(E);
  const P=LOOSE[LOOSE.length-1]; if(P) P.v=v3.add(v3.sc(fl,3.2),[0,.4,0]); /* it skids away across the floor */
  E.temper='curl'; E.backup=false; bark(E,'Okay— okay— okay—',2); }

/* ---- tenants ---- */
function civReact(E,force){ /* called once when a tenant realises what's happening */
  const mate=enemies.find(O=>O!==E&&O.civ&&!O.dead&&!O.shielder&&Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])<3.2),r=Math.random();
  const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z);
  let m=mate&&r<.35?'shield':r<.5?'freeze':r<.62?'deny':r<.84?'hide':'flee';
  if(force) m=force;
  if(m==='flee'&&!civFleeSpot(E)) m='hide';
  if(d<2.2&&m!=='shield'&&!force) m='freeze'; /* right on top of you: nobody runs */
  E.civMode=m; E.civT=0;
  if(m==='freeze'){ E.st='alert'; E.civFreeze=true; E.compAt=rnd(1,2.2); if(Math.random()<.3){ bark(E,pick(FREEZE_LINES),2); GAME.barkGlobal=.8; } }
  else if(m==='deny'){ E.st='alert'; E.civFreeze=true; E.compAt=rnd(1.4,2.6); bark(E,pick(DENY_LINES),2.4); GAME.barkGlobal=.8; }
  else if(m==='shield'){ E.shielder=true; E.shieldOf=mate; E.st='alert'; E.role='civflee'; E.flee=[mate.pos[0]+(mate.pos[0]-PL.x)*.15,mate.pos[1]+(mate.pos[1]-PL.z)*.15]; bark(E,pick(SHIELD_LINES),2.4); GAME.barkGlobal=.8;
    if(!mate.panic){ mate.panic=true; mate.aware=true; mate.mind='civ'; mate.civMode='shielded'; mate.st='kneel'; } }
  else if(m==='flee'){ const q=civFleeSpot(E); E.flee=q; E.role='civflee'; E.st='alert'; bark(E,pick(FLEE_LINES),2.2); GAME.barkGlobal=.8; vox(E,'scream',1); noise([E.pos[0],0,E.pos[1]],8,{from:E}); }
  return m; }
/* a way out: somewhere 7-16 m off whose route never passes within 2.5 m of you */
function civFleeSpot(E){ const toF=fieldTo(E.pos[0],E.pos[1]); if(!toF) return null; let best=null,bs=-1e9;
  for(let k=0;k<80;k++){ const i=Math.random()*NX|0,kk=Math.random()*NZ|0,c=kk*NX+i; if(FLOOR.nav[c]||toF[c]>=1e9) continue; const x=cellX(i),z=cellZ(kk),dp=Math.hypot(x-PL.x,z-PL.z);
    if(dp<7||dp>16||toF[c]>400) continue;
    let cc=c,ok=true; for(let s=0;ok&&s<200&&toF[cc]>0;s++){ const ci=cc%NX,ck=(cc-ci)/NX; let bq=cc,bd=toF[cc]; for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const ni=ci+b,nk=ck+a; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const q=nk*NX+ni; if(toF[q]<bd){ bd=toF[q]; bq=q; } } if(bq===cc) break; cc=bq;
      if(Math.hypot(cellX(cc%NX)-PL.x,cellZ((cc-cc%NX)/NX)-PL.z)<2.5) ok=false; }
    if(!ok) continue; const sc=dp-toF[c]/40+Math.random(); if(sc>bs){ bs=sc; best=[x,z]; } }
  return best; }
function civTick2(E,dt,dist){ if(!E.civ||E.dead||!E.panic) return; E.civT=(E.civT||0)+dt;
  if(E.civMode==='deny'&&E.civT>2.6){ E.civMode='freeze'; }
  /* frozen: the gun on them (or you right there) gets through after a beat; then hands up and down on their knees */
  if(E.civFreeze&&E.st==='alert'){ if(E.covered&&E.coverT>E.compAt||dist<1.4||E.civT>8){ E.civFreeze=false; surrender(E,'civ'); } return; }
  if(E.shielder&&E.st==='alert'&&E.role!=='civflee'){ E.st='kneel'; }
  /* hiding or kneeling: a gun on them gets hands up */
  if(E.st==='kneel'&&!E.surr&&E.covered&&E.coverT>.6&&!E.shielder) E.surr={ph:'kneel',t:0,why:'civ',hold:0}; }

function standoffTick(dt){ if(!GAME.started) return; const aims=PL.dead?[]:playerAims();
  for(const E of enemies){ if(E.dead||E.ally) continue;
    if(E.sprung>0){ E.sprung-=dt; E.atkCd=Math.min(E.atkCd,Math.max(0,E.sprung)); }
    E.covered=aims.length>0&&coveredBy(E,aims); E.coverT=E.covered?(E.coverT||0)+dt:0; E.freeT=E.covered?0:(E.freeT||0)+dt;
    const pel=X_(E.B,PI_.pelvis),dist=Math.hypot(pel[0]-PL.x,pel[2]-PL.z);
    surrDecide(E,dt,dist); surrTick(E,dt,dist); fakeDeadTick(E,dt,dist); civTick2(E,dt,dist); } }
