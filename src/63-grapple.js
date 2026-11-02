/* =====================================================================
   GRAPPLING, past the basic grab (62-grab.js): fighting a man for his gun, pinning him to a wall, and a hostage.
   - His gun: grip it (barrel, slide, fore-end) and it's a fight for it. Yank and twist to tear it out of his hand;
     both your hands on it wins faster, a hurt or dazed man lets go sooner. While you fight he keeps pulling the trigger:
     the shot goes wherever the barrel points, so keep it off yourself and onto the wall, his friend, or him.
   - Pin: hold him by the throat, chest or a shoulder and push him into a wall, a counter, the floor. Pinned, he can't
     fight his way free; pinned by the throat he slowly goes out. Your other hand is free for the knife.
   - Hostage: take his neck from behind with one hand and put your other hand's gun to his head. No choke: he begs, and
     his friends stop. They hold fire, stand where they are and shout at you; the ones who were never in it for this
     give up. Take the gun off his head and they open up again.
   Flat screen (testing): G on his gun grabs it with the left hand, Q yanks.
   ===================================================================== */
const segDist=(p,a,b)=>{ const ab=v3.sub(b,a),t=clamp(v3.dot(v3.sub(p,a),ab)/Math.max(1e-6,v3.dot(ab,ab)),0,1); return Math.hypot(...v3.sub(p,v3.add(a,v3.sc(ab,t)))); };
/* his gun, from the grip to the muzzle, in the world */
function gunPts(E){ if(E.dead||!E.wpnHeld||!RANGED[E.kind]||!E.C.wpn||!E.M) return null; const W=WPN[KIND_WPN[E.kind]]; if(!W||!W.muzzle) return null;
  const Wm=wpnMat(E); return [mulP(Wm,[0,W.axisY||0,-.02]),mulP(Wm,W.muzzle)]; }
function gunGrabTarget(p,maxD){ let best=null,bd=maxD;
  for(const E of enemies){ if(E.ally||E.civ) continue; const g=gunPts(E); if(!g) continue; const d=segDist(p,g[0],g[1])*.7; if(d<bd){ bd=d; best={E,i:PI_['hd'+E.wpnHand],name:'gun',d}; } }
  return best; }

/* ---------- the fight for the gun ---------- */
function wrestleStart(G){ const E=G.E; G.wr={tug:0,fireCd:rnd(.35,.8),jT:0,fightT:0};
  if(!E.dead){ setAware(E,'grab'); E.atkT=-1; E.burstN=0; if(E.barkCd<1.4) bark(E,pick(['Let go— LET GO—','Get off it!','Hey— HEY—']),1.4); vox(E,'strain'); } sfx('wrestle',1,X_(E.B,G.i)); }
function wrestleTick(G,dt,hv){ const E=G.E,W=G.wr; if(!W) return;
  const arm=E.hp['arm'+E.wpnHand]??1,str=clamp(E.cons*(1-E.stun*.8)*Math.min(1,arm+.25),.08,1);
  const two=GRABS.some(O=>O!==G&&O.E===E&&(O.name==='gun'||O.name==='hd'+E.wpnHand));
  const sp=Math.hypot(...hv);
  W.tug=Math.max(0,W.tug+Math.max(0,sp-1.0)*dt*(two?1.5:.9)/(.35+str)-dt*.12*str);
  if(sp>3.2&&E.stun>.45) W.tug=1; /* a dazed man loses it to one hard yank */
  E.atkT=-1; E.burstN=0; E.atkCd=Math.max(E.atkCd,.6); /* he isn't aiming: everything he does goes into the gun */
  /* he pulls back: the gun shakes between you */
  W.jT-=dt; if(W.jT<=0){ W.jT=rnd(.08,.2); const ch=X_(E.B,PI_.chest),hd=X_(E.B,G.i),back=norm3(v3.sub(ch,hd)); kickV(E.B,G.i,v3.add(v3.sc(back,str*1.4),[rnd(-.6,.6),rnd(-.4,.6),rnd(-.6,.6)].map(v=>v*str)),H);
    if(XR.on){ buzz(G.h.hand,.25+str*.4,40); } if(Math.random()<.3) sfx('wrestle',.45,hd); }
  W.fireCd-=dt; if(W.fireCd<=0){ W.fireCd=rnd(.55,1.25)*(two?1.35:1); if(E.cons>.35&&E.stun<.8&&!E.surr) wrestleShot(E,G); }
  if(E.barkCd<=0&&Math.random()<.6) bark(E,pick(['Let go! LET GO—','Motherfucker—','*grunts*','Get off— get OFF—','Give it—']),1.3);
  /* he's strong and you're not winning: he rips it back and shoves you off */
  if(str>.6&&W.tug<.35) W.fightT+=dt; else W.fightT=Math.max(0,W.fightT-dt);
  if(W.fightT>4.2){ for(const O of GRABS.slice()) if(O.E===E&&O.name==='gun') endGrab(O); kickV(E.B,G.i,v3.sc(norm3([E.B.x[G.i*3]-PL.x,0,E.B.x[G.i*3+2]-PL.z]),2.4),H); bark(E,'Fuck off—',1.2); if(XR.on) buzz(G.h.hand,1,90); return; }
  if(W.tug>=1) takeGun(G); }
/* a flat-screen yank (Q) */
function flatYank(G){ if(!G.wr) return; G.wr.tug+=.55*(1.2-clamp(G.E.cons*(1-G.E.stun),0,1)); sfx('wrestle',.8,X_(G.E.B,G.i)); kickV(G.E.B,G.i,v3.sc(camBasis().f,-1.8),H); if(G.wr.tug>=1) takeGun(G); }
/* the gun goes off in the struggle, wherever it points */
function wrestleShot(E,G){ const g=gunRay(E),KS=kst(E),W=WPN[KIND_WPN[E.kind]],sg=!!KS.shotgun;
  muzzle(g.mz,g.d,sg); muzzleSmoke(g.mz,g.d,sg,false); sfx(W.snd||'gun',.9,g.mz); noise([E.pos[0],0,E.pos[1]],14,{alarm:true,from:E}); GAME.eShots=(GAME.eShots||0)+1;
  if(XR.on){ buzz('left',1,70); buzz('right',1,70); }
  const n=sg?6:1; let dmg=0;
  for(let k=0;k<n;k++){ const d=sg?norm3(v3.add(g.d,[rnd(-.05,.05),rnd(-.04,.04),rnd(-.05,.05)])):g.d;
    const room=rayRoom(g.mz,d),bx=rayBoxes(g.mz,d,room.t),L=bx?bx.t:room.t;
    /* first thing along the barrel: you, him, a friend of his, or the wall */
    let first={t:L,what:'wall'};
    { const eye=camBasis().eye; for(const [p,r] of [[eye,.13],[[PL.x,1.25,PL.z],.21]]){ const t=v3.dot(v3.sub(p,g.mz),d); if(t>.02&&t<first.t){ const off=Math.hypot(...v3.sub(p,v3.add(g.mz,v3.sc(d,t)))); if(off<r){ first={t,what:'you'}; } else if(off<.6&&k===0&&t<6) sfx('whiz',.9,v3.add(g.mz,v3.sc(d,t))); } } }
    for(const S of SEGS){ if(E.segOff.has(SEGS.indexOf(S))) continue; const h=raySeg(g.mz,d,X_(E.B,S[0]),X_(E.B,S[1]),S[2]); if(h&&h.t>.03&&h.t<first.t) first={t:h.t,what:'self',seg:S}; } /* turned on himself */
    const bb=bodyInLine(g.mz,v3.add(g.mz,v3.sc(d,first.t)),E); if(bb&&bb.t<first.t) first={t:bb.t,what:'body',bb};
    const p=v3.add(g.mz,v3.sc(d,first.t));
    if(first.what==='you') dmg+=sg?KS.dmg/n*1.4:(KS.dmg||10)*1.3;
    else if(first.what==='self') hitEnemy(E,first.seg,p,d,'gun',{bleed:sg?.5:1,sever:sg?.7:1,pellet:sg});
    else if(first.what==='body') hitEnemy(first.bb.E,first.bb.seg,first.bb.p,first.bb.dir,'gun',{bleed:sg?.5:1,sever:sg?.7:1,pellet:sg});
    else { const nrm=bx?bx.n:room.n,hp=v3.add(p,v3.sc(nrm,.004)); addDecal(DEC.hole,hp,nrm,.025,140); impactFx(hp,nrm,sg); if(k<2) sfx('ric',.6,hp); } }
  if(dmg>0) hurtPlayer(Math.round(dmg)); }
/* it's yours */
function takeGun(G){ const E=G.E,h=G.h,key=KIND_WPN[E.kind],W=WPN[key];
  for(const O of GRABS.slice()) if(O.E===E&&O.name==='gun') endGrab(O);
  E.wpnHeld=false; if(E.C.wpn) E.C.wpn.vis=false; setGrip(E.J,'R',false); setGrip(E.J,'L',false); E.disarmed=true;
  if(!h.item) equip(h,newItem(key,W.gun?Math.max(2,Math.round(W.mag*rnd(.4,.9))):undefined));
  sfx('wrestle',1,mulP(h.M,FIST)); sfx('click',.9); if(XR.on) buzz(h.hand,1,110);
  E.stun=Math.min(1,E.stun+.4); const back=norm3([E.B.x[0]-PL.x,0,E.B.x[2]-PL.z]); for(const i of [PI_.chest,PI_.shL,PI_.shR,PI_['hd'+E.wpnHand]]) kickV(E.B,i,v3.sc(back,1.3),H);
  bark(E,pick(['No— no no no—','Wait— WAIT—','Okay— okay— okay—','Shit— shit—']),1.8); vox(E,'gasp');
  if(psychOf(E)!=='fight'||E.blood<70||Math.random()<.35) surrender(E,'disarmed'); }

/* ---------- pinned to a wall ---------- */
/* is the hand pushing this body into something solid? (gap: from the held point to where the hand wants it) */
function pinCheck(E,G,gap,gl){ if(gl<.05||E.dead) return false; const d=v3.sc(gap,1/gl);
  for(const n of [G.i,PI_.chest,PI_.head]){ const p=X_(E.B,n),r=E.B.r[n]+.1;
    if(rayBoxes(p,d,r,b=>b.kind!=='ceil'&&b.y0<p[1]+.15&&b.h>p[1]-.15)) return true;
    if(Math.abs(p[2])>RZ-r&&d[2]*Math.sign(p[2])>.4&&!winOpen(p[0],p[1],p[2])) return true;
    if(Math.abs(p[0])>RX-r&&d[0]*Math.sign(p[0])>.4) return true;
    if(p[1]<r+.02&&d[1]<-.5) return true; } /* the floor */
  return false; }
const PIN_LINES=['Okay— okay—','Get off— get off me—','I can\'t— I can\'t—','Please— please, man—'],PIN_THROAT=['—hhk— can\'t— breathe—','*choking*','—gk— please—'];
function pinTick(G,dt,pinned){ const E=G.E; G.pinT=pinned?(G.pinT||0)+dt:Math.max(0,(G.pinT||0)-dt*3);
  if(G.pinT<.18) return false;
  E.stun=Math.max(E.stun,.6); E.atkT=-1; G.fightT=Math.max(0,(G.fightT||0)-dt*2); E.pinT=(E.pinT||0)+dt;
  const throat=G.name==='neck'; if(throat){ E.chokeT=(E.chokeT||0)+dt*.45; if(E.chokeT>4&&E.st!=='down'){ toDown(E,true); E.knocked=true; E.koT=40; } }
  if(!G.pinSaid&&E.barkCd<=.6){ G.pinSaid=true; bark(E,pick(throat?PIN_THROAT:PIN_LINES),1.6); vox(E,throat?'choke':'strain'); if(XR.on) buzz(G.h.hand,.6,50); }
  else if(E.barkCd<=0&&Math.random()<.4) bark(E,pick(throat?PIN_THROAT:PIN_LINES),1.4);
  return true; }

/* ---------- hostage ---------- */
/* your other hand's gun is on his head (flat screen: the right hand holding any gun counts) */
function gunToHead(G){ const o=otherHand(G.h),it=o.item,w=it&&WPN[it.key]; if(!w||!w.gun||!o.itemNode) return false; if(!XR.on&&o===HANDS.R&&!(window.__hand&&window.__hand.R)) return true; /* flat screen: no hand to place, so holding a gun counts (unless a test placed the hand) */
  const Mi=itemM(o),mz=mulP(Mi,canMuzzle(w,it)); return Math.hypot(...v3.sub(mz,X_(G.E.B,PI_.head)))<.34; }
const HOSTAGE_LINES=['Don\'t shoot! DON\'T SHOOT!','Do what he says!','Please— please—','He\'ll do it, man! He\'ll do it!','I got kids, man— I got kids—','Put them down! PUT THEM DOWN!'];
const STANDOFF_LINES=n=>[`Let ${n} go!`,'Put it down! PUT IT DOWN!','Easy— easy, man—','Don\'t do it!',`${n}, don't move—`,'Nobody shoot! Nobody shoot!','You\'re not getting out of here—'];
function hostageTick(G,dt){ const E=G.E; if(!gunToHead(G)){ if(G.hostage){ G.hostage=false; } return false; }
  if(!G.hostage){ G.hostage=true; bark(E,pick(HOSTAGE_LINES),1.8); vox(E,'plead'); if(XR.on) buzz(G.h.hand,.5,40); }
  E.stun=1; E.silent=false; E.atkT=-1; E.chokeT=Math.max(0,(E.chokeT||0)-dt); GAME.hostageNow=G;
  E.hgT=(E.hgT||0)-dt; if(E.hgT<=0&&E.barkCd<=0){ E.hgT=rnd(1.6,2.8); bark(E,pick(HOSTAGE_LINES),1.8); vox(E,Math.random()<.5?'plead':'whimper',.8); }
  return true; }
/* everyone who can see it happening */
function hostageWorld(dt){ const G=GAME.hostageNow; GAME.hostage=G?G.E:null;
  if(!G){ for(const O of enemies) O.hsT=0; return; }
  for(const O of enemies){ if(O===G.E||O.dead||O.civ||O.ally||O.surr||O.st!=='alert'||!O.aware) continue;
    const oh=X_(O.B,PI_.head); if(Math.hypot(oh[0]-PL.x,oh[2]-PL.z)>14||!sightClear(oh,X_(G.E.B,PI_.head))) continue;
    O.hsStand=.5; O.hsT=(O.hsT||0)+dt; O.atkCd=Math.max(O.atkCd,.6);
    if(O.barkCd<=0&&GAME.barkGlobal<=0){ bark(O,pick(STANDOFF_LINES(G.E.name)),1.8); GAME.barkGlobal=1; vox(O,'shout',.8); }
    if(O.hsGive==null) O.hsGive=rnd(2.5,6); if(psychOf(O)==='quit'&&O.hsT>O.hsGive) surrender(O,'hostage'); } }

/* ---------- the sink ---------- */
/* every counter has a sink with water standing in it (20-floor-assets.js registers them); pushing a man's head under it drowns him */
function sinkAt(p){ for(let k=SINKS.length-1;k>=0;k--){ const s=SINKS[k]; if(Math.hypot(p[0]-s.x,p[2]-s.z)>.3) continue;
    const b=boxesAt(s.x,s.z).find(b=>b.kind==='furn'&&Math.abs(b.h-.92)<.02&&s.x>b.x0-.05&&s.x<b.x1+.05&&s.z>b.z0-.05&&s.z<b.z1+.05); if(b){ s.b=b; return s; } } /* still a counter here: the list outlives levels */
  return null; }
function drownTick(G,dt){ const E=G.E; if(G.name!=='head'&&G.name!=='neck') return false; const hp=X_(E.B,PI_.head),s=hp[1]<1.13?sinkAt(hp):null;
  if(!s){ if(E.under){ E.under=false; vox(E,'gasp'); bark(E,pick(['*coughing* —please—','—hhah— *gasps*','Okay— OKAY— *coughs*']),1.8); spray(hp,[0,1,0],10,1.4,.6,'water',.01); sfx('splash',.6,hp); }
    if(E.drownT>0) E.drownT=Math.max(0,E.drownT-dt*.35); return false; }
  if(!E.under){ E.under=true; sfx('splash',1,hp); spray(hp,[0,1,0],16,1.8,.7,'water',.012); if(XR.on) buzz(G.h.hand,.7,60); }
  E.drownT=(E.drownT||0)+dt; E.stun=Math.max(E.stun,clamp(.5+E.drownT*.15,0,1)); E.silent=true; E.atkT=-1; E.barkT=0; /* his legs hold him at first, then less */
  /* bent over the counter, not hauled up onto it: his hips stay at its edge, his feet on the floor */
  if(s.b){ const b=s.b,m=.13; for(const n of ['pelvis','hipL','hipR','knL','knR','anL','anR']){ const o=PI_[n]*3,x=E.B.x; if(x[o]<b.x0-m||x[o]>b.x1+m||x[o+2]<b.z0-m||x[o+2]>b.z1+m) continue;
      const d=[x[o]-(b.x0-m),(b.x1+m)-x[o],x[o+2]-(b.z0-m),(b.z1+m)-x[o+2]],k=d.indexOf(Math.min(...d)),e=Math.min(d[k],.02);
      if(k===0) x[o]-=e; else if(k===1) x[o]+=e; else if(k===2) x[o+2]-=e; else x[o+2]+=e; if(x[o+1]>b.h-.05) x[o+1]-=.01; } }
  const amp=clamp(1-E.drownT/5.5,.06,1); /* the arms fight hard at first, then less */
  for(const n of ['hdL','hdR','elL','elR']) kickV(E.B,PI_[n],[rnd(-1.4,1.4)*amp,rnd(-.2,1.8)*amp,rnd(-1.4,1.4)*amp],H);
  for(const n of ['knL','knR']) if(Math.random()<.3) kickV(E.B,PI_[n],[rnd(-.8,.8)*amp,0,rnd(-.8,.8)*amp],H);
  if(XR.on&&Math.random()<.25*amp) buzz(G.h.hand,.3+.5*amp,30);
  E.bubT=(E.bubT||0)-dt; if(E.bubT<=0){ E.bubT=rnd(.25,.6)*(1+E.drownT*.25); sfx('bubbles',.4+.5*amp,hp); spray(hp,[0,1,0],3+(amp*5|0),.9,.5,'water',.008); }
  if(E.drownT>3.4&&E.st!=='down'){ toDown(E,true); E.knocked=true; E.koT=60; }
  if(E.drownT>7.5){ E.drowned=true; die(E); }
  return true; }

/* ---------- skulls ---------- */
/* a head slammed into something hard, again and again: the third or fourth good one caves it in */
function crushSkull(E,q,dir){ const n=norm3(v3.sc(dir,-1)); sfx('crunch',1.1,q); sfx('gore',.6,q);
  spray(q,n,34,2.2,.8,'bright',.013); spray(q,v3.add(n,[0,.4,0]),10,1.6,.9,'gib',.02); addDecal(DEC.splat,v3.add(q,v3.sc(dir,.1)),n,.24,260);
  addWound(E,SEGS[0],q,dir,{rate:4,art:true,part:'head'}); E.headshot=true; E.skullCrushed=true; die(E); }
