/* =====================================================================
   WICK HANDS (stage 3, plan sections 5 and the hand parts of 2b/2c). Everything here runs only with WICK.on.
   The point is that the player never fumbles and the close work is quick and good to watch:
   - Holsters: right hip, left hip, and the back (a long gun). They follow the BODY, not the head: the body turns with the head's
     yaw smoothed over half a second, so looking around doesn't move them. Let go of a gun in a slot and it stows (a tick in the
     hand); grip near a full slot with an empty hand and it's drawn. Letting go anywhere else drops it, as before.
   - The reload guard: a gun at a holster (and for a moment after it leaves one) never starts a reload, so lowering it to the hip
     isn't "pointing at the floor". Reload itself is untouched.
   - Magnetic hands: a gun, a man, a blade in him or a holster comes to your hand from a generous distance (a fast hand is a punch,
     not a grab, so men only snap to a slow one).
   - Held guns don't catch on walls (81-melee.js: the club-on-a-wall stop is off for guns under Wick).
   - Throw a gun: let go with the hand moving and it flies, a little helped toward the nearest head on its line. A head hit
     staggers him for about a second.
   - Strip: the gun wrestle (63-grapple.js) is won in under a second when he's hurt or stunned; the gun arrives in your hand ready.
   - Shield: a man you're holding takes his friends' fire for them: they hold fire for 1.5 s, then shoot through him.
   - Pistol whip: a gun blow stuns him long enough for the follow-up shot. Throw a man you're holding with your hand's speed; he
     and the man the kick sends flying knock down whoever they hit. The knife kills in one or two stabs and comes out clean.
   - Melee stamina: a professional tires slower. Close headshots: inside 6 m the head is a little bigger than it looks.
   Contracts (docs/wick/BRIEF.md section 4): wickHolsters, wickInHolsterZone(h); events wickThrow(item,E|null), wickStrip(E),
   wickShield(E,on). Also wickHolsterPut(slot,item) for the start kit, wickStun(E,sec).
   ===================================================================== */
WICK.hands={
  yawT:.5,                       /* s: the body's yaw follows the head's over this long */
  hipY:.6, hipX:.2, hipZ:-.02,   /* hips: this fraction of eye height, out to the side, forward of the head */
  backY:-.26, backX:.16, backZ:-.16, /* back: below the eyes, out to the right, behind */
  stowR:.2, drawR:.22, guardR:.26, guardT:.4, /* m: let go inside stowR stows; grip inside drawR draws; no reload inside guardR or guardT s after */
  looseR:.4, manR:.27, gunR:.34, manV:2,      /* magnetic radii (m) for things lying around, a man, his gun; a hand faster than manV m/s is punching */
  throwV:2.2, throwK:1.45, aimCone:.22, aimD:9, /* a gun let go faster than throwV flies at hand speed x throwK; bent up to aimCone rad toward a head within aimD */
  throwStun:1.1,                 /* s: a gun to the head */
  stripHurt:.65, stripCalm:2.4,  /* s for the wrestle to be won by itself: hurt or stunned / not */
  shieldHold:1.5, shieldPass:.45, shieldGrip:.55, /* s his friends hold fire; then the chance a round goes through him to you; how much slower he breaks free */
  whipHead:1.7, whipBody:1.1,    /* s stunned by a pistol whip */
  manThrowV:1.2, manThrowK:1.6, flyT:.9, knockV:1.8, knockR:.75, knockStun:1, /* throwing a man: hand speed, x; he knocks men over for flyT s while faster than knockV */
  kickStun:1.2, kickK:1.35, kickSlide:3.2, /* the kick: stun, extra push, how fast his feet are driven back (m/s) */
  slideK:.8, slideDrag:3.5,      /* a thrown man's feet go at this x his throw, slowing at this rate: a 4 m/s throw carries him about a metre */
  stabKill:.3, knifeOut:.09,     /* s after the killing stab; m of pull back that brings the knife out clean */
  stamCost:.06, stamRec:.45, stamRest:.6, /* melee stamina (PROTO.melee.stam: .12, .2, 1) */
  headD:6, headK:.35             /* m: inside this the head's hit sphere is this much bigger */
};
/* ?w.hands.<key>=n: 06-wick.js only overrides tables that exist when it runs, and this one is defined here */
if(WICK.on) for(const [k,v] of new URLSearchParams(location.search)) if(k.startsWith('w.hands.')){ const n=Number(v),key=k.slice(8); if(isFinite(n)&&key in WICK.hands) WICK.hands[key]=n; }
const whn=(k,d)=>wnum('hands',k,d);
if(WICK.on) Object.assign(PROTO.melee.stam,{cost:whn('stamCost',.06),rec:whn('stamRec',.45),rest:whn('stamRest',.6)});

/* ---------- holsters ---------- */
const WK_BODY={yaw:null,x:0,y:1.6,z:0,xy:null};
const wkSlotOk={ hipR:w=>w&&(w.gun&&!w.fore||w.melee==='knife'&&!w.chop), hipL:w=>w&&(w.gun&&!w.fore||w.melee==='knife'&&!w.chop), back:w=>w&&(w.gun&&!!w.fore||!!w.chop) };
function wkSlotPos(slot){ const B=WK_BODY,a=B.yaw??PL.yaw,fx=-Math.sin(a),fz=-Math.cos(a),rx=Math.cos(a),rz=-Math.sin(a),H=WICK.hands;
  let s,y,f; if(slot==='back'){ s=H.backX; y=B.y+H.backY; f=H.backZ; } else { s=(slot==='hipR'?1:-1)*H.hipX; y=Math.max(.45,B.y*H.hipY); f=H.hipZ; }
  return [B.x+rx*s+fx*f,y,B.z+rz*s+fz*f]; }
const wickHolsters=['hipR','hipL','back'].map(slot=>({slot,item:null,node:null,pos:()=>wkSlotPos(slot)}));
/* put something in a slot (the start kit, 92-wick-rules.js): true if it went in */
function wickHolsterPut(slot,item){ const S=wickHolsters.find(s=>s.slot===slot); if(!S||S.item||!item||!wkSlotOk[slot](WPN[item.key])) return false; S.item=item; wkSlotBuild(S); return true; }
function wkSlotBuild(S){ wkSlotDrop(S); if(!S.item) return; const n=N(world); GEO_TEMP=true; buildItem(n,S.item); GEO_TEMP=false; if(typeof mergeTree==='function') mergeTree(n); S.node=n; wkSlotPlace(S); }
function wkSlotDrop(S){ if(!S.node) return; disposeTree(S.node); const k=world.kids.indexOf(S.node); if(k>=0) world.kids.splice(k,1); S.node=null; }
/* how it hangs: a pistol muzzle-down at the hip, grip back; a long gun across the back, stock up behind the right shoulder */
function wkSlotPlace(S){ if(!S.node) return; const a=WK_BODY.yaw??PL.yaw,fw=[-Math.sin(a),0,-Math.cos(a)],rt=[Math.cos(a),0,-Math.sin(a)],w=WPN[S.item.key],p=S.pos();
  let Z,Y; if(S.slot==='back'){ Z=norm3(v3.add([0,-.85,0],v3.sc(rt,-.55))); Y=v3.sc(fw,-1); } else { Z=norm3(v3.add([0,-1,0],v3.sc(fw,.22))); Y=norm3(v3.sub(fw,v3.sc(Z,v3.dot(fw,Z)))); }
  const X=v3.cross(Y,Z),g=w.grip||[0,0,0]; setLocal(S.node,m4.make(),fromCols(X,Y,Z,v3.sub(p,v3.add(v3.sc(X,g[0]),v3.add(v3.sc(Y,g[1]),v3.sc(Z,g[2])))))); S.node.vis=!PL.dead; }
function wkBodyTick(dt){ const b=camBasis(),e=b.eye,B=WK_BODY,yaw=PL.yaw;
  if(B.yaw==null) B.yaw=yaw;
  if(XR.on){ if(B.xy!=null&&XR.yaw!==B.xy) B.yaw+=XR.yaw-B.xy; B.xy=XR.yaw; } /* a snap turn turns the body with it at once */
  let d=yaw-B.yaw; d=Math.atan2(Math.sin(d),Math.cos(d)); B.yaw+=d*(1-Math.exp(-dt/whn('yawT',.5)));
  B.x=e[0]; B.y=e[1]; B.z=e[2]; for(const S of wickHolsters) wkSlotPlace(S); }
const wkFist=h=>mulP(h.M,FIST);
/* the slot this hand's item would go in (inside r, accepts it, and empty unless any) */
function wkSlotNear(h,r,any){ const it=h.item,w=it&&WPN[it.key],p=wkFist(h); let best=null,bd=r;
  for(const S of wickHolsters){ if(it&&!wkSlotOk[S.slot](w)) continue; if(!it&&!S.item) continue; if(it&&S.item&&!any) continue; const d=Math.hypot(...v3.sub(p,S.pos())); if(d<bd){ bd=d; best=S; } }
  return best; }
/* contract: true while a hand's gun is in a holster zone */
function wickInHolsterZone(h){ if(!WICK.on||!h||!h.item||!WPN[h.item.key].gun) return false; return !!wkSlotNear(h,whn('guardR',.26),true); }
/* the reload guard (60-weapons.js reloadHand, 50-game.js point-down): in a zone, or just out of one */
function wickReloadBlocked(h){ if(!WICK.on) return false; if(wickInHolsterZone(h)){ h.wkZoneT=GAME.t; return true; } return GAME.t-(h.wkZoneT??-9)<whn('guardT',.4); }
function wkStow(h,S){ const it=h.item; equip(h,null); S.item=it; wkSlotBuild(S); sfx('click',.5); sfx('swish',.25); if(XR.on) buzz(h.hand,.55,22); h.wkZoneT=GAME.t; }
function wkDraw(h,S){ const it=S.item; S.item=null; wkSlotDrop(S); equip(h,it); h.wkZoneT=GAME.t; sfx('click',.6); if(XR.on) buzz(h.hand,.7,30); }
/* the first reset listener, whoever registered first: the slots empty before anyone (the start kit) fills them */
(PROTO_EV.reset||(PROTO_EV.reset=[])).unshift(()=>{ if(!WICK.on) return; for(const S of wickHolsters){ S.item=null; wkSlotDrop(S); } WK_THROWN.length=0; WK_STRIP.length=0; WK_BODY.yaw=null; });

/* ---------- grip and let go (60-weapons.js grabOrDrop asks this first; true = handled) ---------- */
function wickGrabOrDrop(h){ if(!WICK.on||h.stuck) return false;
  if(h.grab){ const G=h.grab,E=G.E,sp=Math.hypot(...h.vel); /* throw him with your hand */
    if(sp>whn('manThrowV',1.2)&&!E.dead){ const v=v3.sc(h.vel,whn('manThrowK',1.6)); endGrab(G,v); E.wkFlyT=GAME.t+whn('flyT',.9); wickStun(E,.8); wkSlide(E,v3.sc(v,whn('slideK',.8))); } else endGrab(G,null);
    return true; }
  if(h.supportOf) return false;
  if(h.item){ const S=wkSlotNear(h,whn('stowR',.2)); if(S){ wkStow(h,S); return true; }
    if(WPN[h.item.key].gun&&h.itemNode&&Math.hypot(...h.vel)>whn('throwV',2.2)){ wkThrowGun(h); return true; }
    return false; }
  /* empty hand: a holster first, then what the old code does at its own reach (the other hand's gun, a can), then the magnet */
  const S=wkSlotNear(h,whn('drawR',.22)); if(S){ wkDraw(h,S); return true; }
  const p=wkFist(h),o=otherHand(h);
  if(o.item&&o.item.sup&&o.itemNode&&canDist(o,p)<.05) return false;
  if(trySupport(h)) return true;
  let best=null,bd=9;
  for(const P of LOOSE){ const r=Math.hypot(...v3.sub(p,P.node.p)),d=r*(WPN[P.item.key].gun?.7:.85); if(r<whn('looseR',.4)&&d<bd){ bd=d; best={pick:P}; } } /* a gun wins a near tie: it's what you reached for */
  for(const e of EMB){ if(!e.handle) continue; const d=Math.hypot(...v3.sub(p,e.handle))*.8; if(d<.3&&d<bd){ bd=d; best={emb:e}; } }
  const slow=Math.hypot(...h.vel)<whn('manV',2),g=grabTarget(p,slow?whn('manR',.27):.16),gg=gunGrabTarget(p,whn('gunR',.34));
  if(gg&&gg.d<bd){ bd=gg.d; best={man:gg}; }
  if(g&&g.name!=='gun'){ const d=Math.hypot(...v3.sub(p,X_(g.E.B,g.i)))*(g.E.dead?1.3:1); if(d<bd){ bd=d; best={man:g}; } }
  if(!best) return false;
  if(best.man) startGrab(h,best.man);
  else if(best.emb) takeEmbedded(h,best.emb);
  else if(PROTO.on&&rayTakeLoose(h,best.pick)) return true;
  else { equip(h,best.pick.item); removePickup(best.pick); }
  if(!best.man){ sfx('click',.6); buzz(h.hand,.5,40); }
  return true; }

/* ---------- a thrown gun ---------- */
const WK_THROWN=[];
function wkThrowGun(h){ const it=h.item,Mi=itemM(h),p0=colOf(Mi,3),k=whn('throwK',1.45); let v=v3.sc(h.vel,k);
  /* a little help: the nearest head close to its line gets it (the drop under gravity allowed for) */
  const sp=Math.hypot(...v),dir=v3.sc(v,1/sp); let best=null,ba=whn('aimCone',.22);
  for(const E of enemies){ if(E.dead||E.ally||E.civ||E.cut.head) continue; const hp=X_(E.B,PI_.head),to=v3.sub(hp,p0),dl=Math.hypot(...to); if(dl>whn('aimD',9)||dl<.3) continue;
    const t=dl/sp,aim=norm3(v3.add(to,[0,4.9*t*t,0])),a=Math.acos(clamp(v3.dot(aim,dir),-1,1)); if(a<ba&&sightClear(p0,hp)){ ba=a; best=aim; } }
  if(best) v=v3.sc(best,sp);
  equip(h,null); const P=addPickup(it,Mi,v,[rnd(-3,3),rnd(-14,-8),rnd(-3,3)]); P.thrown=false; /* its flight and its hit are ours (the old thrown-item hit is for blades and bottles) */
  WK_THROWN.push({P,prev:P.node.p.slice(),v0:Math.hypot(...v),t:0}); sfx('swish',.7); if(XR.on) buzz(h.hand,.3,20); }
function wkThrownTick(dt){ for(let i=WK_THROWN.length-1;i>=0;i--){ const T=WK_THROWN[i],P=T.P,p=P.node.p; T.t+=dt;
  const done=hit=>{ WK_THROWN.splice(i,1); protoEmit('wickThrow',P.item,hit||null); if(!hit&&LOOSE.includes(P)) clatter(P); };
  if(!LOOSE.includes(P)){ WK_THROWN.splice(i,1); continue; }
  const d=v3.sub(p,T.prev),len=Math.hypot(...d),spd=Math.hypot(...P.v);
  if(len>1e-4){ const dir=v3.sc(d,1/len),hit=rayEnemies(T.prev,dir,len+.06,.05);
    if(hit&&!hit.E.dead&&!hit.E.ally&&!hit.E.civ){ const E=hit.E,hp=X_(E.B,PI_.head),q=v3.add(T.prev,v3.sc(dir,hit.t)),head=hit.seg[3]==='head'||hit.seg[3]==='neck'||Math.hypot(...v3.sub(q,hp))<.17;
      const seg=head?SEGS[0]:hit.seg; hitEnemy(E,seg,head?hp:q,dir,'blunt',{power:clamp(spd/5,.6,1.4)}); sfx('bash',1,q); hitMarker();
      if(head){ wickStun(E,whn('throwStun',1.1)); kickV(E.B,PI_.head,v3.sc(dir,2.2),H); for(const n of [PI_.neck,PI_.chest]) kickV(E.B,n,v3.sc(dir,.9),H); vox(E,'grunt'); }
      P.v=v3.add(v3.sc(P.v,-.15),[0,.8,0]); T.prev=p.slice(); done(E); continue; } }
  T.prev=p.slice();
  if(P.rest||T.t>3||spd<T.v0*.45) done(null); } } /* landed, or bounced off something */

/* ---------- stuns: long enough for the follow-up ---------- */
function wickStun(E,sec){ if(!E||E.dead) return; E.wkStunT=Math.max(E.wkStunT||0,GAME.t+sec); E.stun=Math.max(E.stun,.85); E.atkT=-1; E.burstN=0; }
function wkStunTick(E){ if(E.dead||!(E.wkStunT>GAME.t)) return; const left=E.wkStunT-GAME.t; E.stun=Math.max(E.stun,.8); E.atkT=-1; E.burstN=0; E.atkCd=Math.max(E.atkCd||0,left); E.openT=Math.max(E.openT||0,E.wkStunT); }

/* ---------- the strip ---------- */
const WK_STRIP=[];
const wkHurt=E=>E.blood<85||E.wounds.length>0||Math.min(E.hp.armL,E.hp.armR,E.hp.legL,E.hp.legR)<1||E.cons<.9;
const wkStunned=E=>E.stun>.35||E.wkStunT>GAME.t||E.st!=='alert'&&E.st!=='idle';
function wkStripTick(dt){
  for(const G of GRABS){ if(!G.wr||G.E.dead) continue; const E=G.E;
    if(!G.wkS){ G.wkS={G,E,h:G.h,t:0}; WK_STRIP.push(G.wkS); }
    G.wkS.t+=dt; G.wr.tug+=dt/(wkHurt(E)||wkStunned(E)?whn('stripHurt',.65):whn('stripCalm',2.4)); G.wr.fightT=0; } /* past 1 on purpose: his own slip (63-grapple.js) comes off it before the check */ /* he never rips it back from a professional */
  for(let i=WK_STRIP.length-1;i>=0;i--){ const R=WK_STRIP[i]; if(GRABS.includes(R.G)) continue; WK_STRIP.splice(i,1);
    const it=R.h.item; if(R.E.disarmed&&it&&WPN[it.key].gun){ /* it's yours, and it's ready */
      it.chambered=true; it.spent=false; it.reload=0; it.cd=0; R.h.wkZoneT=GAME.t; R.stripT=R.t; protoEmit('wickStrip',R.E); } } }

/* ---------- the shield ---------- */
const wkShieldOf=E=>!E.dead&&E.st!=='down'&&GRABS.some(G=>G.E===E&&G.name!=='gun'&&G.name!=='anL'&&G.name!=='anR');
function wkShieldTick(dt){ for(const E of enemies){ const on=wkShieldOf(E);
    if(on){ if(!E.wkShield){ E.wkShield=true; E.wkShieldT=0; protoEmit('wickShield',E,true); } E.wkShieldT+=dt;
      for(const G of GRABS) if(G.E===E&&G.fightT) G.fightT=Math.max(0,G.fightT-dt*whn('shieldGrip',.55)); } /* a professional's hold: he takes longer to fight out of it */
    else if(E.wkShield){ E.wkShield=false; protoEmit('wickShield',E,false); } } }
/* 50-game.js enemyShoot: does E hold fire because S is in his line? (a man you hold: yes, for 1.5 s; anyone else: as before) */
function wickShieldHold(E,S){ if(S.wkShield) return (S.wkShieldT||0)<whn('shieldHold',1.5); return Math.random()<.75; }
/* the shield took the round: does it go through him to you? */
function wickShieldPass(S){ return !!S.wkShield&&!S.dead&&Math.random()<whn('shieldPass',.45); }
/* 63-grapple.js hostageWorld: past the hold, his friends stop standing off */
function wickShieldOver(E){ return !!E.wkShield&&(E.wkShieldT||0)>=whn('shieldHold',1.5); }

/* ---------- pistol whip and the knife (the melee event fires just before the hit is applied) ---------- */
protoOn('melee',(h,E,o)=>{ if(!WICK.on||E.dead||PROTO.melee.dry) return; const w=WPN[o.weapon];
  if(w&&w.gun&&o.kind==='blunt'&&o.tier>=1){ wickStun(E,/head|neck/.test(o.part)?whn('whipHead',1.7):whn('whipBody',1.1)); E.wkWhipT=GAME.t; }
  if(o.weapon==='knife'&&o.kind==='stab'){ E.wkStabs=(E.wkStabs||0)+1; const one=/head|neck/.test(o.part)||!E.aware||wkStunned(E)||E.blood<70||o.grabbed;
    if((one||E.wkStabs>=2)&&!E.wkKillAt) E.wkKillAt=GAME.t+whn('stabKill',.3); } });
/* the knife comes out clean: pull back along the blade a few cm and it's out, in your hand */
function wkKnifeTick(h){ const S=h.stuck; if(!S||!h.item||h.item.key!=='knife'||!h.itemW) return; const Mi=h.itemW,handle=colOf(Mi,3),d=v3.sub(wkFist(h),handle),dl=Math.hypot(...d),Zb=norm3(colOf(Mi,2));
  if(dl>whn('knifeOut',.09)&&v3.dot(d,Zb)<-dl*.3){ spray(handle,v3.sc(Zb,-1),12,1.6,.6,'bright',.011); sfx('rip',.5); if(XR.on) buzz(h.hand,.6,40); unstick(h); h.cd=.2; } }

/* ---------- the kick (50-game.js kick calls this), and bodies knocking men over ---------- */
function wickKicked(E,fl){ if(!WICK.on||E.dead) return; const k=whn('kickK',1.35)-1; for(const i of [PI_.pelvis,PI_.chest,PI_.hipL,PI_.hipR,PI_.neck]) kickV(E.B,i,v3.sc(fl,5.5*k),H);
  E.slamT=Math.max(E.slamT||0,1.2); E.wkFlyT=GAME.t+whn('flyT',.9); wickStun(E,whn('kickStun',1.2)); wkSlide(E,v3.sc(fl,whn('kickSlide',3.2))); }
/* his feet are driven along: a man on his feet is held up by his stance (E.pos), so a shove that only moved his body would spring back */
function wkSlide(E,v){ if(E.dead||E.st==='down') return; E.wkSlide=[v[0],v[2]]; }
function wkSlideTick(E,dt){ const v=E.wkSlide; if(!v) return; if(E.dead||E.st==='down'||Math.hypot(v[0],v[1])<.25){ E.wkSlide=null; return; }
  const p0=E.pos.slice(); E.pos[0]+=v[0]*dt; E.pos[1]+=v[1]*dt; pushOutXZ(E.pos,PROTO.on?PF_WALK_R:.28,'walker'); const k=Math.exp(-dt*whn('slideDrag',3.5));
  if(Math.hypot(E.pos[0]-p0[0]-v[0]*dt,E.pos[1]-p0[1]-v[1]*dt)>.5*Math.hypot(v[0],v[1])*dt){ E.wkSlide=null; E.slamT=Math.max(E.slamT||0,.5); return; } /* into a wall: he stops there (the slam is the body's, 62-grab.js) */
  v[0]*=k; v[1]*=k; for(const n of [PI_.pelvis,PI_.chest]) kickV(E.B,n,[v[0]*.08,0,v[1]*.08],H); }
function wkKnockTick(){ for(const E of enemies){ if(!(E.wkFlyT>GAME.t)) continue; const i=PI_.pelvis*3,B=E.B,S=E.wkSlide; let v=[(B.x[i]-B.p[i])/H,0,(B.x[i+2]-B.p[i+2])/H]; if(S&&Math.hypot(S[0],S[1])>Math.hypot(v[0],v[2])) v=[S[0],0,S[1]]; const sp=Math.hypot(v[0],v[2]); /* his body or his feet, whichever is going faster */ if(sp<whn('knockV',1.8)) continue;
  for(const O of enemies){ if(O===E||O.dead||O.civ||O.ally||O.wkKnockedBy===E) continue; const q=X_(O.B,PI_.pelvis),to=[q[0]-B.x[i],0,q[2]-B.x[i+2]],dl=Math.hypot(to[0],to[2]);
    if(dl>whn('knockR',.75)||v3.dot(to,v)<=0) continue; const dir=norm3([v[0],0,v[2]]); O.wkKnockedBy=E; sfx('kick',.8,q);
    for(const n of [PI_.pelvis,PI_.chest,PI_.neck,PI_.shL,PI_.shR]) kickV(O.B,n,v3.sc(dir,sp*.55),H); melStagger(O,dir,sp+2,1); wickStun(O,whn('knockStun',1)); O.slamT=Math.max(O.slamT||0,.8); setAware(O,'hit');
    E.wkFlyT=0; break; } } }

/* ---------- close headshots (60-weapons.js bullet): inside 6 m the head is a little bigger than it looks ---------- */
function wickHeadAssist(o,d,maxT,hit){ if(!WICK.on) return hit; if(hit&&hit.seg&&hit.seg[3]==='head') return hit; const R0=SEGS[0][2],R=R0*(1+whn('headK',.35)); let best=null;
  for(const E of enemies){ if(E.dead||E.ally||E.cut.head||E.segOff.has(0)) continue; const hp=X_(E.B,PI_.head),t=v3.dot(v3.sub(hp,o),d); if(t<=.05||t>whn('headD',6)||t>maxT) continue;
    const off=Math.hypot(...v3.sub(hp,v3.add(o,v3.sc(d,t)))); if(off>R) continue; const tin=t-Math.sqrt(Math.max(0,R*R-off*off));
    if(hit&&hit.E!==E&&hit.t<tin) continue; /* something (someone) else is in front of it */
    if(hit&&hit.E===E&&hit.t<tin-.3) continue; /* his own arm well in front: that's what you hit */
    if(!best||tin<best.t) best={t:Math.max(0,tin),E,bone:'head',seg:SEGS[0],assist:true}; }
  if(!best) return hit; const hp=X_(best.E.B,PI_.head),c=v3.add(o,v3.sc(d,best.t)); best.p=v3.add(hp,v3.sc(norm3(v3.sub(c,hp)),Math.min(R0*.9,Math.hypot(...v3.sub(c,hp))))); return best; }

/* ---------- every frame ---------- */
protoOn('tick',(gdt,dt)=>{ if(!WICK.on) return; wkBodyTick(dt);
  for(const E of enemies){ wkStunTick(E); wkSlideTick(E,gdt); if(E.wkKillAt&&GAME.t>=E.wkKillAt){ E.wkKillAt=0; if(!E.dead) die(E); } }
  for(const h of [HANDS.L,HANDS.R]){ wkKnifeTick(h); if(h.item&&WPN[h.item.key].gun) wickReloadBlocked(h); }
  wkThrownTick(gdt); wkStripTick(gdt); wkShieldTick(gdt); wkKnockTick(); });
