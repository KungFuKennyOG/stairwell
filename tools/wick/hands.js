// Wick hand rig (stage 3): proves each hand move headlessly with scripted VR hand poses against live men on ?wick=1.
// It drives HANDS.*.M like tools/melee-rig.js does (the same per-hand calls as xrFrame: melee, the point-down reload, grip and let go),
// then update() and updateWorld(), with requestAnimationFrame off and setTimeout on game time. Ray can't be hurt.
// usage: NODE_PATH=/opt/npm-tools/node_modules node tools/wick/hands.js index.html [test,test,...]
//   tests: holster throw strip shield whip knife kick manthrow magnet head stam wall   (env WQ: page query, default wick=1)
const { launch, open } = require('../proto/lib.js');
const [file, only] = process.argv.slice(2);
const IN_PAGE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__WH=(function(){
  const DT=1/72; XR.on=true; GAME.started=true; hurtPlayer=function(){};
  const EV=[]; for(const k of ['wickThrow','wickStrip','wickShield','melee','death']) protoOn(k,(...a)=>EV.push({k,t:GAME.t,E:a[0]&&a[0].name||a[1]&&a[1].name,a1:a[1]&&a[1].name?a[1].name:a[1]===null?null:typeof a[1]==='boolean'?a[1]:undefined,o:k==='melee'?{tier:a[2].tier,kind:a[2].kind,part:a[2].part,weapon:a[2].weapon}:undefined}));
  function runQ(){ if(!window.__Q.length) return; const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } }
  const hands=[HANDS.R,HANDS.L],G={R:false,L:false};
  const head=()=>{ const e=[PL.x,1.62,PL.z],f=[-Math.sin(PL.yaw),0,-Math.cos(PL.yaw)],r=[Math.cos(PL.yaw),0,-Math.sin(PL.yaw)]; XR.head={eye:e,f,r,u:[0,1,0]}; };
  /* one VR frame in xrFrame's order: hand velocity, grip edges, the point-down reload, melee; then the world */
  function frame(){ PL.hp=100; PL.dead=false; head();
    for(const h of hands){ setLocal(h.node,m4.make(),h.M); h.node.vis=true; const fp=mulP(h.M,FIST); if(h.prevPos) h.vel=v3.add(v3.sc(h.vel,.5),v3.sc(v3.sub(fp,h.prevPos),.5/DT)); h.prevPos=fp;
      const on=G[h.side],was=!!h.gripOn; h.gripOn=on; const full=!!(h.item||h.grab||h.supportOf||h.stuck); if(on&&!was) grabOrDrop(h); else if(!on&&was&&full) grabOrDrop(h);
      if(h.item&&WPN[h.item.key].gun){ const it=h.item,w=WPN[it.key],Mi=itemM(h),bd=norm3(v3.sub(mulP(Mi,w.muzzle),mulP(Mi,[0,w.axisY,0])));
        h.downT=bd[1]<-.87&&!(WICK.on&&typeof wickReloadBlocked==='function'&&wickReloadBlocked(h))?(h.downT||0)+DT:0; if(h.downT>.5&&!(it.reload>0)) reloadHand(h); } else h.downT=0;
      meleeTick(h,DT); if(!h.supportOf) vrMelee(h,DT); }
    applySupport(HANDS.R); applySupport(HANDS.L);
    update(DT,performance.now()); updateWorld(world,null); runQ(); }
  const run=(s,fn)=>{ const n=Math.round(s/DT); for(let i=0;i<n;i++){ if(fn&&fn(i*DT)===false) break; frame(); } };
  const tele=h=>{ if(typeof melSnap==='function') melSnap(h); h.prevPos=null; h.vel=[0,0,0]; };
  /* put the hand so its item (or fist) has axes X,Y,Z and its local point spot sits at P */
  function place(h,X,Y,Z,spot,P){ const O=v3.sub(P,v3.add(v3.sc(X,spot[0]),v3.add(v3.sc(Y,spot[1]),v3.sc(Z,spot[2])))),IW=fromCols(X,Y,Z,O);
    if(h.item&&h.itemL){ const o=m4.make(); m4.mul(o,IW,rigidInv(h.itemL)); h.M.set(o); } else h.M.set(IW); }
  /* the fist at P with the hand's own axes: Z its forward, Y up */
  function fistAt(h,P,Z){ Z=norm3(Z||[-Math.sin(PL.yaw),0,-Math.cos(PL.yaw)]); const Y=norm3(v3.sub([0,1,0],v3.sc(Z,Z[1]))),X=v3.cross(Y,Z); h.M.set(fromCols(X,Y,Z,v3.sub(P,v3.add(v3.sc(X,FIST[0]),v3.add(v3.sc(Y,FIST[1]),v3.sc(Z,FIST[2])))))); }
  const park=h=>{ fistAt(h,[PL.x+(h===HANDS.R?.35:-.35),.95,PL.z+.3]); tele(h); };
  let base=null;
  /* somewhere with 6.5 m of open floor ahead (+x) and a metre either side (the prototype floor is small rooms) */
  function openBase(){ const S=FLOOR.start,ok=(x,z,L,w)=>!BOXES.some(b=>!b.sightOnly&&b.h>.25&&b.x1>x-1.2&&b.x0<x+L&&b.z1>z-w&&b.z0<z+w)&&x-1.2>-RX&&x+L<RX&&Math.abs(z)+w<RZ;
    for(const L of [6.5,5.5,4.5]){ let best=null,bd=1e9; for(let x=-RX;x<RX;x+=.25) for(let z=-RZ;z<RZ;z+=.25){ if(!ok(x,z,L,1.1)) continue; const d=Math.hypot(x-S.x,z-S.z); if(d<bd){ bd=d; best={x,z}; } } if(best) return best; }
    return {x:S.x,z:S.z}; }
  /* Ray at the base looking along +x; men placed d metres ahead (+x), s to the side */
  function fresh(men){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); for(const S of wickHolsters){ S.item=null; wkSlotDrop(S); } window.__Q=[]; EV.length=0;
    if(!base) base=openBase(); PL.x=base.x; PL.z=base.z; PL.yaw=-Math.PI/2; PL.pitch=0; WK_BODY.yaw=null; G.R=G.L=false;
    const out=(men||[]).map((m,i)=>{ const E=spawnEnemy({maker:makeGunman,name:m.name||('M'+i),x:base.x+m.d,z:base.z+(m.s||0),hd:m.hd??-Math.PI/2,extra:''}); enemies.push(E); E.psych='fight'; return E; });
    attachLabels(); for(const h of hands){ equip(h,null); park(h); h.gripOn=false; h.wkZoneT=-9; }
    PL.pouch.mags=[{gun:'pistol',rounds:12,cap:12},{gun:'pistol',rounds:12,cap:12}];
    for(let i=0;i<30;i++) frame(); return out; }
  const r2=v=>Math.round(v*100)/100, P_=(E,n)=>X_(E.B,PI_[n]);
  const fw=()=>[-Math.sin(PL.yaw),0,-Math.cos(PL.yaw)];
  /* in the hand and held (grip down), as if you'd picked it up: letting go is G[side]=false */
  const hold=(h,it)=>{ equip(h,it); h.gripOn=true; G[h.side]=true; };
  const T={};

  /* holsters: they follow the body (smoothed yaw), stow, draw, and the reload guard */
  T.holster=()=>{ fresh([]); const h=HANDS.R; hold(h,newItem('pistol',5)); const S=wickHolsters[0],o={};
    /* the gun hangs muzzle-down at the right hip: pointing at the floor there for 1.2 s must not reload */
    const down=[0,-1,0],X=[0,0,1],Y=v3.cross(down,X); /* item axes: muzzle down */
    const atHip=()=>place(h,v3.cross(fw(),down),fw(),down,WPN.pistol.grip,S.pos()); atHip(); tele(h); run(1.2,()=>{ atHip(); });
    o.inZone=wickInHolsterZone(h); o.hipReload=h.item.reload>0; reloadHand(h); o.hipTap=h.item.reload>0; /* A/X there too */
    /* the same, held out in front: it reloads */
    const front=v3.add([PL.x,1.1,PL.z],v3.sc(fw(),.45)),atF=()=>place(h,v3.cross(fw(),down),fw(),down,WPN.pistol.grip,front);
    atF(); tele(h); let tR=null; run(1.2,t=>{ atF(); if(tR==null&&h.item.reload>0) tR=t; }); o.frontReloadAt=tR==null?null:r2(tR);
    run(1.6,()=>atF()); o.ammoAfter=h.item.ammo;
    /* stow: let go at the hip */
    atHip(); tele(h); run(.3,()=>atHip()); o.stillHeldAtHip=h.item&&h.item.key; G.R=false; run(.1,()=>atHip()); o.stowed=!!(S.item&&S.item.key==='pistol'&&!h.item); o.slotNode=!!S.node;
    /* body yaw: turn the head 90 degrees; the slot follows over about half a second */
    const p0=S.pos(); PL.yaw+=Math.PI/2; run(.1); const p1=S.pos(); run(1.4); const p2=S.pos(),ang=(a,b,c)=>Math.atan2(b[2]-c[2],b[0]-c[0])-Math.atan2(a[2]-c[2],a[0]-c[0]),c=[PL.x,0,PL.z],deg=x=>Math.round(Math.abs(Math.atan2(Math.sin(x),Math.cos(x)))*180/Math.PI);
    o.slotTurned_0_1s=deg(ang(p0,p1,c)); o.slotTurned_1_5s=deg(ang(p0,p2,c));
    /* draw: an empty hand gripping 15 cm from the slot */
    fistAt(h,v3.add(S.pos(),[0,.15,0])); tele(h); run(.1,()=>fistAt(h,v3.add(S.pos(),[0,.15,0]))); G.R=true; run(.2,()=>fistAt(h,v3.add(S.pos(),[0,.15,0]))); o.drawn=!!(h.item&&h.item.key==='pistol'&&!S.item);
    /* let go somewhere else: it drops, as before */
    fistAt(h,front); tele(h); run(.2,()=>fistAt(h,front)); G.R=false; run(.1,()=>fistAt(h,front)); o.droppedAway=!h.item&&!S.item&&LOOSE.some(P=>P.item.key==='pistol');
    o.pass=o.stillHeldAtHip==='pistol'&&!o.hipReload&&!o.hipTap&&o.inZone&&o.frontReloadAt!=null&&o.frontReloadAt<1&&o.stowed&&o.drawn&&o.droppedAway&&o.slotTurned_0_1s<45&&o.slotTurned_1_5s>80; return o; };

  /* an empty gun thrown at a man's head 3 m away: it hits, and he's staggered about a second */
  T.throw=()=>{ const [E]=fresh([{d:3}]); setAware(E,'seen'); run(.5); const h=HANDS.R; hold(h,newItem('pistol',0)); const o={};
    const hp=P_(E,'head'),start=[PL.x+.1,1.5,PL.z+.35],dir=norm3(v3.sub(hp,start)); let p=start.slice(); fistAt(h,p,dir); tele(h); run(.1,()=>fistAt(h,p,dir));
    run(.12,()=>{ p=v3.add(p,v3.sc(dir,6*DT)); fistAt(h,p,dir); }); G.R=false; const t0=GAME.t; p=v3.add(p,v3.sc(dir,6*DT)); fistAt(h,p,dir); frame(); /* let go mid-swing */ o.handV=r2(Math.hypot(...h.vel)); o.thrown=!h.item;
    let hitT=null,stunUntil=0; run(1.5,()=>{ const ev=EV.find(e=>e.k==='wickThrow'); if(ev&&hitT==null){ hitT=ev.t-t0; o.hit=ev.a1; stunUntil=E.wkStunT-GAME.t; } });
    o.hitAfter=hitT==null?null:r2(hitT); o.stunFor=r2(stunUntil); o.part=EV.filter(e=>e.k==='wickThrow').length; o.dead=E.dead; o.pass=o.hit===E.name&&stunUntil>.8&&stunUntil<1.5; return o; };

  /* strip: a hurt man's gun, gripped and held (no yanking): yours in under a second, chambered and pointing where your hand does */
  T.strip=()=>{ const [E]=fresh([{d:.85}]); setAware(E,'seen'); const off=E.wpnHand==='R'?'L':'R'; hitEnemy(E,SEGS.find(s=>s[3]==='farm'+off),v3.sc(v3.add(P_(E,'el'+off),P_(E,'hd'+off)),.5),[1,0,0],'gun',{}); /* a round through his other forearm */ run(.4); const h=HANDS.L,o={hurt:wkHurt(E),wpn:E.wpnHeld};
    const g=gunPts(E); if(!g) return {err:'no gun pts',st:E.st,wpn:E.wpnHeld}; const at=()=>{ const g=gunPts(E); return g?v3.sc(v3.add(g[0],g[1]),.5):null; };
    let q=at(); fistAt(h,v3.add(q,[0,0,-.12])); tele(h); run(.05); G.L=true; const t0=GAME.t; let tS=null;
    run(2,()=>{ const s=EV.find(e=>e.k==='wickStrip'); if(s){ tS=s.t-t0; return false; } fistAt(h,v3.add(q,[0,0,-.03])); /* the hand holds still on it */ });
    o.stripIn=tS==null?null:r2(tS); o.item=h.item&&h.item.key; o.ready=!!(h.item&&h.item.chambered&&!(h.item.reload>0)); o.ammo=h.item&&h.item.ammo;
    /* and fresh: an unhurt man takes longer */
    const [F]=fresh([{d:.85}]); setAware(F,'seen'); run(.4); const h2=HANDS.L; let q2=v3.sc(v3.add(...gunPts(F)),.5); fistAt(h2,v3.add(q2,[0,0,-.12])); tele(h2); run(.05); G.L=true; const t1=GAME.t; let tC=null;
    run(4,()=>{ const s=EV.find(e=>e.k==='wickStrip'); if(s){ tC=s.t-t1; return false; } fistAt(h2,v3.add(q2,[0,0,-.03])); });
    o.calmStripIn=tC==null?null:r2(tC); o.pass=o.stripIn!=null&&o.stripIn<1&&o.ready&&o.item==='pistol'&&(o.calmStripIn==null||o.calmStripIn>o.stripIn); return o; };

  /* shield: hold the near man; his friend behind him holds fire 1.5 s, then shoots through him */
  T.shield=()=>{ const [A,B]=fresh([{d:.8,name:'Front'},{d:5,name:'Back',hd:Math.PI/2}]); setAware(B,'seen'); setAware(A,'seen'); run(1.5); const h=HANDS.L,o={};
    const log=[]; const _h=wickShieldHold; wickShieldHold=function(E,S){ const r=_h(E,S); log.push({t:GAME.t,S:S.name,hold:r}); return r; };
    const ch=()=>v3.add(P_(A,'chest'),[0,0,0]); fistAt(h,ch()); tele(h); G.L=true; run(.05,()=>fistAt(h,ch())); o.grab=h.grab&&h.grab.name; const t0=GAME.t;
    let hitsA=0; const hk=(E)=>{ if(E===A) hitsA++; }; protoOn('enemyHit',hk);
    const anchor=ch(); let shots=0; run(3,t=>{ fistAt(h,anchor); if(Math.round(t/DT)%9===0){ B.atkCd=0; if(enemyShoot(B,false)) shots++; } });
    wickShieldHold=_h; const sh=log.filter(x=>x.S==='Front'); o.calls=sh.length; o.heldBefore=sh.filter(x=>x.t-t0<1.45).every(x=>x.hold); o.firstOpen=r2((sh.find(x=>!x.hold)||{t:NaN}).t-t0);
    o.shots=shots; o.hitsOnShield=hitsA; o.shieldEv=EV.filter(e=>e.k==='wickShield').map(e=>e.a1); o.Adead=A.dead;
    o.pass=o.calls>3&&o.heldBefore&&o.firstOpen>=1.45&&o.firstOpen<1.7&&o.hitsOnShield>0&&o.shieldEv[0]===true; return o; };

  /* pistol whip: the slide across his head, then a shot while he's still out of it */
  T.whip=()=>{ const [E]=fresh([{d:.8}]); setAware(E,'seen'); run(.6); const h=HANDS.R; hold(h,newItem('pistol',12)); const o={};
    const hp=P_(E,'head'),Z=fw(),Y=[0,1,0],X=v3.cross(Y,Z),spot=[0,.045,.06]; let P=v3.add(hp,v3.sc(X,.35)); place(h,X,Y,Z,spot,P); tele(h); run(.06,()=>place(h,X,Y,Z,spot,P));
    run(.2,()=>{ P=v3.add(P,v3.sc(X,-4.5*DT)); place(h,X,Y,Z,spot,P); }); const m=EV.find(e=>e.k==='melee'); o.melee=m&&m.o; o.stunLeft=r2((E.wkStunT||0)-GAME.t);
    const fired=[]; const tW=GAME.t; run(1.2,()=>{ park(h); if(E.atkT>=0||E.burstN>0) fired.push(r2(GAME.t-tW)); }); o.attackedDuring=fired.length; o.stunAt12=r2(E.stun);
    /* the follow-up */
    const eye=[PL.x,1.62,PL.z],hd=P_(E,'head'); fireHand(h,{o:eye,d:norm3(v3.sub(hd,eye))}); run(.4); o.deadAfterShot=E.dead;
    o.pass=!!m&&m.o.weapon==='pistol'&&m.o.tier>=1&&o.stunLeft>=1.2&&!o.attackedDuring&&E.dead; return o; };

  /* knife: two stabs to the belly of a man who's ready for you; the knife comes out clean between them */
  T.knife=()=>{ const [E]=fresh([{d:.75}]); setAware(E,'seen'); run(.6); const h=HANDS.R; hold(h,newItem('knife')); const o={stabs:[]};
    const stab=()=>{ const tgt=v3.add(P_(E,'pelvis'),v3.sc(v3.sub(P_(E,'chest'),P_(E,'pelvis')),.4)),Z=norm3(v3.sub(tgt,[PL.x,tgt[1],PL.z])),Y=[0,1,0],X=v3.cross(Y,Z),tip=[0,-.004,.232];
      let P=v3.add(tgt,v3.sc(Z,-.3)); place(h,X,Y,Z,tip,P); tele(h); run(.06,()=>place(h,X,Y,Z,tip,P)); const n0=EV.length;
      run(.16,()=>{ P=v3.add(P,v3.sc(Z,2.2*DT)); place(h,X,Y,Z,tip,P); }); const m=EV.slice(n0).find(e=>e.k==='melee'); o.stabs.push(m?m.o.kind+'/'+m.o.part:'none'); o.stuck=!!h.stuck;
      /* pull straight back */
      let outAt=null; const back0=P.slice(); run(.3,()=>{ P=v3.add(P,v3.sc(Z,-2*DT)); place(h,X,Y,Z,tip,P); if(outAt==null&&!h.stuck) outAt=r2(Math.hypot(...v3.sub(P,back0))); }); o.outAfterPull=outAt; o.out=!h.stuck&&h.item&&h.item.key; };
    stab(); o.deadAfter1=E.dead; run(.35); o.deadAfter1b=E.dead; stab(); const t0=GAME.t; run(1,()=>{ if(E.dead&&o.killIn==null) o.killIn=r2(GAME.t-t0); }); o.dead=E.dead; o.wkStabs=E.wkStabs;
    o.pass=o.stabs.every(s=>s.startsWith('stab'))&&!o.deadAfter1b&&o.dead&&o.killIn!=null&&o.killIn<.6&&o.out==='knife'; return o; };

  /* the kick: into the man behind him */
  T.kick=()=>{ const [A,B]=fresh([{d:.9,name:'Kicked'},{d:1.75,name:'Behind'}]); setAware(A,'seen'); run(.4); const o={},a0=P_(A,'pelvis');
    PL.kickCd=0; kick(); let mx=0; run(1.2,()=>{ mx=Math.max(mx,Math.hypot(P_(A,'pelvis')[0]-a0[0],P_(A,'pelvis')[2]-a0[2])); }); o.Amoved=r2(mx); o.Bknocked=B.wkKnockedBy===A; o.Bstun=r2(B.stun); o.Astun=r2((A.wkStunT||0)-GAME.t+1.2);
    o.pass=o.Bknocked&&o.Amoved>.3; return o; };

  /* throw a man you're holding */
  T.manthrow=()=>{ const [A]=fresh([{d:.7}]); setAware(A,'seen'); run(.3); const h=HANDS.L,o={},a0=P_(A,'pelvis'); let p=P_(A,'chest'); fistAt(h,p); tele(h); G.L=true; run(.05,()=>fistAt(h,p)); o.grab=h.grab&&h.grab.name;
    const d=[0,0,1]; run(.15,()=>{ p=v3.add(p,v3.sc(d,3.5*DT)); fistAt(h,p); }); G.L=false; frame(); o.flyT=r2((A.wkFlyT||0)-GAME.t); let mx=0; run(1,()=>{ mx=Math.max(mx,Math.hypot(P_(A,'pelvis')[0]-a0[0],P_(A,'pelvis')[2]-a0[2])); }); o.moved=r2(mx); o.pass=o.grab&&o.flyT>0&&o.moved>.5; return o; };

  /* magnets: a gun on the floor 35 cm from the fist; a man's chest 25 cm away */
  T.magnet=()=>{ fresh([]); const h=HANDS.R,o={}; const at=v3.add([PL.x,.9,PL.z],v3.sc(fw(),.6)); addPickup(newItem('pistol',4),fromCols([1,0,0],[0,1,0],[0,0,1],v3.add(at,[0,0,.3])),[0,0,0]); run(.5);
    const gp=LOOSE[0].node.p.slice(); fistAt(h,v3.add(gp,[0,.33,0])); tele(h); run(.05,()=>fistAt(h,v3.add(gp,[0,.33,0]))); G.R=true; run(.1,()=>fistAt(h,v3.add(gp,[0,.33,0]))); o.gun=h.item&&h.item.key;
    const [E]=fresh([{d:.9}]); const L=HANDS.L,c=P_(E,'chest'),q=v3.add(c,[-.25,0,0]); fistAt(L,q); tele(L); run(.05,()=>fistAt(L,q)); G.L=true; run(.1,()=>fistAt(L,q)); o.man=L.grab&&L.grab.name;
    o.pass=o.gun==='pistol'&&!!o.man; return o; };

  /* close headshots: a round 13 cm beside the head's centre at 4 m is a headshot; at 8 m it isn't */
  T.head=()=>{ const o={},D0=WICK.hands.headD; for(const d of [4,4.01]){ WICK.hands.headD=d>4?3:D0; /* the second: the same shot with the generous range cut to 3 m, so true size */ const [E]=fresh([{d}]); run(.3); const hp=P_(E,'head'),eye=[PL.x,hp[1],PL.z],side=[0,0,1],aim=v3.add(hp,v3.sc(side,.13)),dir=norm3(v3.sub(aim,eye));
      const exact=rayEnemiesExact(eye,dir,40); bullet(eye,dir,WPN.pistol,HANDS.R); run(.3); o['d'+d]={exact:exact?exact.seg[3]:null,headshot:!!E.headshot,dead:E.dead}; }
    WICK.hands.headD=D0; o.pass=o.d4.headshot&&!o['d4.01'].headshot; return o; };

  /* stamina: ten hard swings; how much is left (Wick against the prototype's numbers) */
  T.stam=()=>{ fresh([]); const h=HANDS.R,o={}; const S=melState(h); S.stam=1; let p=[PL.x+.3,1.2,PL.z+.4];
    for(let i=0;i<10;i++){ const d=i%2?[0,0,1]:[0,0,-1]; run(.12,()=>{ p=v3.add(p,v3.sc(d,5*DT)); fistAt(h,p); }); run(.1,()=>fistAt(h,p)); }
    o.left=r2(S.stam); o.table=PROTO.melee.stam; o.pass=o.left>.3; return o; };
  /* walls: a gun swung hard into a wall goes through it (no stop, no catch); a knife still stops on it, as before */
  T.wall=()=>{ fresh([]); const o={}; let n=0; protoOn('meleeWall',()=>{ n++; }); let D=null; /* stand 1.2 m off the face of a real wall (the floor's outer edge is not a box, so nothing stops there anyway) */
    for(const w of BOXES){ if(D) break; if(w.kind!=='wall'||w.sightOnly||(w.y0||0)>.5||w.h<2||w.x1-w.x0>.3||w.z1-w.z0<2) continue; const z=(w.z0+w.z1)/2,x=w.x0-1.2; if(Math.abs(x)>RX-.5) continue;
      const e=[x,1.2,z],r=rayRoom(e,[1,0,0]); if(Math.abs(r.t-1.2)<.05&&melWallAt([w.x0+.03,1.2,z])){ PL.x=x; PL.z=z; PL.yaw=-Math.PI/2; D={d:[1,0,0],t:r.t,e}; } }
    const e=D&&D.e; for(let i=0;i<10;i++) frame();
    if(!D) return {err:'no wall near'}; const h=HANDS.R;
    for(const key of ['pistol','knife']){ hold(h,newItem(key,12)); n=0; const Z=D.d,Y=[0,1,0],X=v3.cross(Y,Z); let P=v3.add(e,v3.sc(Z,D.t-.45)); const spot=[0,0,.1];
      place(h,X,Y,Z,spot,P); tele(h); run(.1,()=>place(h,X,Y,Z,spot,P)); run(.14,()=>{ P=v3.add(P,v3.sc(Z,5.5*DT)); place(h,X,Y,Z,spot,P); }); o[key]=n; }
    o.pass=o.pistol===0&&o.knife>0; return o; };
  return {T,frame};
})();`;
(async () => {
  const browser = await launch(); let bad = 0;
  try {
    const { page, errs } = await open(browser, file || 'index.html', (process.env.WQ||'wick=1'), { wait: 1500 });
    await page.evaluate(s => window.__eval(s), IN_PAGE);
    const tests = (only || 'holster,throw,strip,shield,whip,knife,kick,manthrow,magnet,head,stam,wall').split(',');
    for (const t of tests) { let r; const t0 = Date.now();
      try { r = await page.evaluate(t => window.__eval(`JSON.stringify(__WH.T.${t}())`), t); r = JSON.parse(r); } catch (e) { r = { err: String(e).slice(0, 300) }; }
      if (!r.pass) bad++; console.log(JSON.stringify({ test: t, ms: Date.now() - t0, ...r }));
    }
    console.log(JSON.stringify({ pageErrors: errs.slice(0, 8) })); if (errs.length) bad++;
  } finally { await browser.close(); }
  process.exit(bad ? 1 : 0);
})();
