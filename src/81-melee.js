/* =====================================================================
   MELEE THAT LANDS (VR). Kenny on the Quest: "hits don't register", "no weight or impact", "feels very weak";
   the bar is The Walking Dead: Saints & Sinners. This file is the player's side of every melee hit:
   - weight: the hand you see follows your real hand on a spring             (meleeTick -> melHand)
   - the swept hit test, contact speed, edge alignment, stabs                 (vrMelee   -> melSweep)
   - the four tiers and what each one does to him                             (meleeHit  -> melHit, hitBlunt -> melBlunt)
   - the weapon stopping on him, haptics per tier, stamina (prototype only)
   These fix bugs Kenny reported, so they apply everywhere; only stamina waits for PROTO.on.

   Item fields, read for ANY WPN entry (the props agent's pan, hammer, pipe work by carrying them):
     mass   kg; drives the lag. Guns carry a low "club" mass (feel over realism, as Saints & Sinners does).
     strike [{a,b,r,kind,n}] capsules in item space (+z out of the grip, -y the striking side). kind 'edge' cuts when it
            lands edge-first (n = the way the edge faces; no n = sharp all round, like broken glass), 'point' stabs when it
            goes in point-first (n = the thrust direction, default +z; r is the enlarged tip zone, sideways), 'blunt' hits
            (n = the striking face's normal; a wide one, r 6 cm or more, is treated as a flat disc across n, like a pan's
            face). No strike: a blunt capsule along pts.
     tool   items that aren't weapons (keys, first-aid tin, rounds, cloth) hit like a fist and weigh nothing in the hand;
            the bolt cutter is the exception: a heavy club.
   Events: protoEmit('melee', h, E, {tier, speed, part, kind:'blunt'|'cut'|'stab'|'slice'|'push', weapon, grabbed, p})
           for every contact, applied or not; protoEmit('meleeWall', h, {speed, p, box}) when a swing hits a wall.
   Walls (boxes of kind 'wall'): a swing that hits one stops on it, and stays on it while your real hand is through the wall.
   For the enemy-fight agent: E.winded = seconds his next attack is slowed by body blows (decays 1/s), E.openT = GAME.t
   until which a staggered man is open (can't start an attack). Both also push E.atkCd so they work on their own.
   ===================================================================== */
PROTO.melee={
  tier:[1.25,3.5,6],         /* contact speed m/s: under [0] a push, then hit, stagger, and over [2] knockdown (head) or chop.
                                The plan says 1.5; the cut-off sits a little under so a 1.5 m/s swing that lands slightly glancing still counts
                                (the rig: 1 m/s swings still come out as pushes) */
  headKO:4, koWin:4,         /* two head hits at or over headKO within koWin s put him down */
  stagWin:3,                 /* two staggers within this many seconds put him down */
  stop:[.06,.09],            /* the weapon holds on him this long: light item .. heavy item (s) */
  tau0:.003, tauK:.016,      /* positional lag (s of lag at a steady speed) = tau0 + tauK*mass^1.5: at 4 m/s a knife trails ~1.5 cm,
                                a machete ~4, the pan ~9, the pipe ~13 */
  rot0:.005, rotK:1.3,       /* rotation lag time = rot0 + rotK*mass*(half length)^2 */
  tauMax:.035, rotMax:.08,
  twoHand:.5,                /* both hands on it: lag x this */
  clubV:3,                   /* a one-handed gun swung faster than this (m/s) turns into a club with weight; slower, it aims 1:1 */
  edgeCos:.82, flatCos:.57,  /* edge within ~35 deg of the motion cuts, past ~55 deg it's the flat (blunt) */
  stabCos:.6, stabV:1.3, knifeStabV:1, grabStab:.5, /* point-first within ~53 deg and this fast along the blade */
  winded:.9,                 /* s his next attack is slowed per body blow, x tier */
  stam:{cost:.12,hard:3.5,rest:1,rec:.2,weak:.5}, /* PROTO.on only. weak: spring strength when empty */
  wallHold:1.5,              /* s at most a weapon stays on a wall your hand has gone through (then it lets go, e.g. you walked into it) */
  dry:false                  /* the test rig: record contacts and stop the weapon, leave him untouched */
};
/* default strike volumes and masses for the items that exist today (an item's own fields win) */
const MEL_ITEMS={
  fists:   {mass:0,  strike:[{a:[0,-.035,-.008],b:[0,-.035,-.008],r:.05,kind:'blunt'}]},              /* a 5 cm ball round the knuckles */
  knife:   {mass:.2, strike:[{a:[0,-.004,.07],b:[0,-.004,.218],r:.018,kind:'edge',n:[0,-1,0]},{a:[0,-.004,.232],b:[0,-.004,.232],r:.04,kind:'point'}]},
  bottle:  {mass:.35,strike:[{a:[0,0,.105],b:[0,0,.19],r:.042,kind:'edge'},{a:[0,0,.2],b:[0,0,.2],r:.045,kind:'point'}]}, /* jagged all round */
  machete: {mass:.7, strike:[{a:[0,-.03,.09],b:[0,-.03,.415],r:.018,kind:'edge',n:[0,-1,0]},{a:[0,.005,.09],b:[0,.005,.415],r:.018,kind:'edge',n:[0,-1,0]},{a:[0,-.012,.43],b:[0,-.012,.43],r:.04,kind:'point'}]},
  revolver:{mass:.5, strike:[{a:[0,.03,0],b:[0,.036,.145],r:.02,kind:'blunt'},{a:[0,-.012,-.01],b:[0,-.055,-.025],r:.02,kind:'blunt'}]},
  pistol:  {mass:.45,strike:[{a:[0,.045,-.035],b:[0,.045,.145],r:.02,kind:'blunt'},{a:[0,-.01,-.012],b:[0,-.068,-.017],r:.022,kind:'blunt'}]}, /* slide, butt */
  shotgun: {mass:1.1,strike:[{a:[0,.005,.1],b:[0,.005,.6],r:.03,kind:'blunt'},{a:[0,0,-.08],b:[0,0,.08],r:.035,kind:'blunt'},{a:[0,-.03,-.16],b:[0,-.045,-.33],r:.05,kind:'blunt'}]},
  smg:     {mass:.9, strike:[{a:[0,.01,-.14],b:[0,.012,.29],r:.028,kind:'blunt'},{a:[0,0,-.15],b:[0,-.01,-.33],r:.025,kind:'blunt'}]},
  can:     {mass:.2, strike:[{a:[0,0,-.075],b:[0,0,.075],r:.018,kind:'blunt'}]},
  bigcan:  {mass:.5, strike:[{a:[0,0,-.17],b:[0,0,.17],r:.028,kind:'blunt'}]} };
for(const k in MEL_ITEMS){ const w=WPN[k]; if(!w) continue; if(w.mass===undefined) w.mass=MEL_ITEMS[k].mass; if(!w.strike) w.strike=MEL_ITEMS[k].strike; }
/* an item with no strike of its own (a new one): one blunt capsule through its points */
function melStrikes(w){ if(w._caps&&w._capsOf===w.strike) return w._caps; let L=w.strike;
  if(!L){ const P=w.gun?(w.bash&&w.bash.pts)||[[0,0,0]]:w.pts||[[0,0,0]]; L=[{a:P[0],b:P[P.length-1],r:w.melee==='knife'?.02:.03,kind:w.melee==='knife'?'edge':'blunt'}]; }
  w._capsOf=w.strike; return w._caps=L.filter(c=>c.kind==='point').concat(L.filter(c=>c.kind!=='point')); } /* points first: a thrust is judged by its tip */
const melMass=w=>w.tool&&w.tool!=='cutter'?0:w.mass!==undefined?w.mass:w.gun?.5:w.melee?.4:0; /* tools hit like a fist */
function melLen(w){ if(w._len!==undefined) return w._len; let L=.05; for(const c of melStrikes(w)) for(const p of [c.a,c.b]) L=Math.max(L,Math.hypot(p[0],p[1],p[2])); return w._len=L; }

/* ---------- per-hand state ---------- */
function melState(h){ return h.mv||(h.mv={node:null,p:null,v:[0,0,0],q:null,lp:null,V:m4.make(),IW:m4.make(),RW:m4.make(),prevIW:null,hist:[],key:null,stopT:0,catchT:0,lock:new Map(),stam:1,restT:9,swing:false,clubK:0}); }
/* put the hand you see back on your real hand at once (equip, teleports, the rig between swings) */
function melSnap(h){ const S=melState(h); S.p=null; S.tp=null; S.wall=null; S.q=null; S.v=[0,0,0]; S.prevIW=null; S.hist.length=0; S.stopT=0; S.catchT=0; S.clubK=0; S.lock.clear(); }
const melCols=M=>[colOf(M,0),colOf(M,1),colOf(M,2)];
function melCompose(q,p){ /* a hand matrix from its rotation and where its fist centre is */ const [X,Y,Z]=qCols(q); return fromCols(X,Y,Z,v3.sub(p,v3.add(v3.sc(X,FIST[0]),v3.add(v3.sc(Y,FIST[1]),v3.sc(Z,FIST[2]))))); }
function melTaus(h,w,S){ const m=melMass(w),P=PROTO.melee,two=!!(h.support||h.supportOf);
  let tau=Math.min(P.tauMax,P.tau0+P.tauK*Math.pow(m,1.5)),tr=Math.min(P.rotMax,P.rot0+P.rotK*m*Math.pow(melLen(w)/2,2));
  if(two){ tau*=P.twoHand; tr*=P.twoHand; }
  let s=1; if(PROTO.on) s=P.stam.weak+(1-P.stam.weak)*clamp(S.stam/.3,0,1); /* tired: half the spring strength at empty */
  if(PL.armWeak) s*=1-clamp(PL.armWeak[h.side]||0,0,.8); /* a wounded arm (80-ray.js): that hand's spring is weaker */
  if(s<1){ const k=1/Math.sqrt(s); tau*=k; tr*=k; }
  return [tau,tr]; }
/* a hand's world matrix -> the play space's local frame (so walking and snap turns don't drag the weapon behind you) */
function melLocal(M){ const W=worldFromLocal(),o=m4.make(); m4.mul(o,rigidInv(W),M); return o; }
function melWorld(L){ const o=m4.make(); m4.mul(o,worldFromLocal(),L); return o; }

/* ---------- weight: every frame, per hand, after the real hand is known (VR) ---------- */
function melHand(h,dt){ const S=melState(h),it=h.item,key=it?it.key:'fists',w=WPN[key];
  if(S.key!==key){ melSnap(h); S.key=key; }
  const T=h.M,L=melLocal(T),tp=mulP(L,FIST),tq=qFromCols(...melCols(L));
  /* stamina (prototype): each hard swing costs, rest brings it back */
  if(PROTO.on){ const st=PROTO.melee.stam,sp=Math.hypot(...(h.vel||[0,0,0]));
    if(sp>st.hard&&!S.swing){ S.swing=true; S.stam=Math.max(0,S.stam-st.cost); } else if(sp<1.5) S.swing=false;
    S.restT=S.swing||sp>st.hard?0:S.restT+dt; if(S.restT>st.rest) S.stam=Math.min(1,S.stam+st.rec*dt); }
  /* held hands, a gun with two hands on it, a hand on someone: no lag, they're tied to something */
  const tied=h.grab||h.support||h.supportOf||h.stuck;
  let [tau,tr]=melTaus(h,w,S);
  if(w.gun){ const sp=Math.hypot(...(h.vel||[0,0,0])); S.clubK=sp>PROTO.melee.clubV?1:Math.max(0,S.clubK-dt/.3); tau*=S.clubK; tr*=S.clubK; } /* aiming stays 1:1 */
  let tpW=tp; if(S.wall){ const dep=melWallDepth(h,S); /* on a wall: aim for your real hand pushed back out of it, so the weapon rests and slides on the wall */
    if(dep<-.004){ S.wall=null; } /* your hand came back out: it follows again */
    else if((S.wall.t-=dt)<=0){ S.wall=null; S.wallCd=GAME.t+1; } /* held long enough (you walked into it): it lets go, and won't catch on it again at once */
    else { const Tm=m4.make(); Tm.set(T); for(let c=0;c<3;c++) Tm[12+c]-=S.wall.n[c]*(dep+.003); tpW=mulP(melLocal(Tm),FIST); } }
  if(tied||!S.p||Math.hypot(...v3.sub(S.p,tpW))>(S.wall?.8:.35)){ S.p=tpW; S.q=tq; S.v=[0,0,0]; S.stopT=0; if(tied) S.wall=null; } /* tied, fresh, or torn away (it never trails by more than this) */
  else if(S.stopT>0){ S.stopT-=dt; S.v=[0,0,0]; if(S.stopT<=0) S.catchT=.1; } /* stopped on him: it holds while your hand goes on */
  else { if(S.catchT>0){ S.catchT-=dt; tau=Math.max(tau,.022); tr=Math.max(tr,.03); } /* then it catches up, quickly but not in one frame */
    if(tau<8e-4){ S.p=tpW; S.v=[0,0,0]; }
    else { const om=2/tau,e=Math.exp(-om*dt),tq0=S.tp||tpW; /* critically damped, solved exactly for a real hand moving steadily through the frame, */
      for(let c=0;c<3;c++){ const vr=(tpW[c]-tq0[c])/dt,ep=-2*vr/om,e0=S.p[c]-tq0[c],c1=e0-ep,c2=(S.v[c]-vr)+om*c1; /* so the lag is speed x tau at any frame rate */
        S.p[c]=tpW[c]+ep+(c1+c2*dt)*e; S.v[c]=vr+(c2-om*(c1+c2*dt))*e; } }
    S.q=tr<1e-3?tq:qNlerp(S.q,tq,1-Math.exp(-dt/tr)); }
  S.tp=tpW; melApply(h,S); }
/* the hand you see, and what it holds, from the spring state */
function melApply(h,S){ const it=h.item,w=WPN[it?it.key:'fists'];
  const V=h.stuck?h.M:melWorld(melCompose(S.q,S.p)); S.V.set(V);
  if(!h.stuck) setLocal(h.node,m4.make(),V);
  if(h.itemNode&&h.itemL&&!h.stuck){ const T=m4.make(); m4.mul(T,V,h.itemL);
    if(w.melee&&!h.support){ let [X,Y,Z]=melCols(T); const sag=SAG[it.key]||0,ax=v3.cross(Z,[0,-1,0]),al=Math.hypot(...ax); /* a heavy head droops toward the floor */
      if(sag&&al>1e-3){ const k=v3.sc(ax,1/al),a=sag*al,c=Math.cos(a),s=Math.sin(a); X=rodr(X,k,c,s); Y=rodr(Y,k,c,s); Z=rodr(Z,k,c,s); }
      const g=w.grip,G=mulP(T,g),O=v3.sub(G,v3.add(v3.sc(X,g[0]),v3.add(v3.sc(Y,g[1]),v3.sc(Z,g[2])))); h.itemW=fromCols(X,Y,Z,O); setLocal(h.itemNode,V,h.itemW); S.IW.set(h.itemW); }
    else { if(!h.support) restoreItemNode(h); S.IW.set(h.support&&h.itemW?h.itemW:T); } }
  else if(h.stuck&&h.itemW) S.IW.set(h.itemW);
  else S.IW.set(V);
  /* where it would be with no lag at all: contact speed takes the faster of the two, so weight never costs you a tier */
  if(h.itemNode&&h.itemL&&!h.support){ const R=m4.make(); m4.mul(R,h.M,h.itemL); S.RW.set(R); } else S.RW.set(h.support&&h.itemW?h.itemW:h.itemNode?S.IW:h.M); }

/* ---------- walls ---------- */
/* the points of a strike volume that would hit a wall first: both ends and the middle, pushed out to its surface along the motion */
function melWallPts(c,M0,M1){ const out=[]; for(const u of c.a===c.b||c.kind==='point'?[0]:[0,.5,1]){ const q=[0,1,2].map(k=>c.a[k]+(c.b[k]-c.a[k])*u),p0=mulP(M0,q),p1=mulP(M1,q),d=v3.sub(p1,p0),L=Math.hypot(...d);
  const lead=c.kind==='point'?.005:c.kind==='blunt'&&c.n&&c.r>=.06?.02:Math.min(c.r,.05); /* the real surface: not a point's wide stab zone, not round a pan's face */
  const o=L>1e-5?v3.sc(d,lead/L):[0,0,0]; out.push({q,o,p0:v3.add(p0,o),p1:v3.add(p1,o),L}); } return out; }
const melInBox=(b,p)=>p[0]>b.x0&&p[0]<b.x1&&p[2]>b.z0&&p[2]<b.z1&&p[1]>(b.y0||0)&&p[1]<b.h;
function melWallAt(p){ for(const b of boxesAt(p[0],p[2])) if(b.kind==='wall'&&!b.sightOnly&&melInBox(b,p)) return b; return null; }
/* a swing into a wall: it stops there, held while your real hand is through it */
function melWallHit(h,S,w,key,caps,prev,cur){ if(typeof boxesAt!=='function') return null; const P=PROTO.melee;
  let best=null; for(const c of caps) for(const pt of melWallPts(c,prev,cur)){ if(pt.L<1e-4) continue; const b=melWallAt(pt.p1); if(!b||melWallAt(pt.p0)) continue;
    let lo=0,hi=1; for(let i=0;i<7;i++){ const m=(lo+hi)/2; if(melInBox(b,v3.add(pt.p0,v3.sc(v3.sub(pt.p1,pt.p0),m)))) hi=m; else lo=m; } /* where it went in */
    if(!best||lo<best.f) best={f:lo,b,pt,c}; }
  if(!best) return null;
  const real=S.hist[1]?Math.hypot(...v3.sub(mulP(S.hist[0].R,best.pt.q),mulP(S.hist[1].R,best.pt.q)))/S.hist[0].dt:0,speed=Math.max(best.pt.L/S.hist[0].dt,real);
  if(GAME.t<(S.wallCd||0)) return null;
  const soft=speed<P.tier[0]; /* a slow touch just rests on it: no stop, no sound */
  return {f:best.f,soft,apply:()=>{ if(S.stopT>0||h.stuck) return;
  const Mu=melLerpM(prev,cur,best.f),back=m4.make(); m4.mul(back,Mu,rigidInv(cur)); const Vt=m4.make(); m4.mul(Vt,back,S.V); const L=melLocal(Vt);
  const p=v3.add(best.pt.p0,v3.sc(v3.sub(best.pt.p1,best.pt.p0),best.f)),b=best.b,fd=[p[0]-b.x0,b.x1-p[0],p[2]-b.z0,b.z1-p[2],p[1]-(b.y0||0),b.h-p[1]],fi=fd.indexOf(Math.min(...fd));
  const n=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]][fi]; /* into the wall through the face it came in by */
  S.p=mulP(L,FIST); S.q=qFromCols(...melCols(L)); S.v=[0,0,0]; if(!soft) S.stopT=lerp(P.stop[0],P.stop[1],clamp(melMass(w)/.8,0,1));
  const inv=rigidInv(cur); S.wall={b,t:P.wallHold,n,cp:p,pts:melWallPts(best.c,prev,cur).map(x=>mulP(inv,x.p1))}; /* its leading surface, in item space */
  melApply(h,S); S.prevIW=new Float32Array(S.IW); S.hist[0].M=S.prevIW;
  if(soft) return; const m=melMass(w),hard=speed>=P.tier[1];
  sfx(m>.3||w.gun?'bash':'bump',clamp(speed/5,.3,1),p); if(hard&&m>.3) sfx('kick',.4,p);
  if(XR.on) buzz(h.hand,hard?1:.5,hard?40:20);
  noise([p[0],0,p[2]],clamp(2+speed*Math.sqrt(1+m),3,10)); /* a blow on a wall carries: someone near it comes to look */
  protoEmit('meleeWall',h,{speed,p,box:best.b}); }}; }
/* how far the real weapon's leading surface is through the wall it met (past the face it went in by); negative = back out */
function melWallDepth(h,S){ const R=m4.make(); if(h.itemNode&&h.itemL) m4.mul(R,h.M,h.itemL); else R.set(h.M); let d=-9;
  for(const q of S.wall.pts) d=Math.max(d,v3.dot(v3.sub(mulP(R,q),S.wall.cp),S.wall.n)); return d; }

/* ---------- geometry ---------- */
/* closest distance between segments p1-q1 and p2-q2 (Ericson 5.1.9), no allocations */
function melSegD(p1x,p1y,p1z,q1x,q1y,q1z,p2x,p2y,p2z,q2x,q2y,q2z){
  const d1x=q1x-p1x,d1y=q1y-p1y,d1z=q1z-p1z,d2x=q2x-p2x,d2y=q2y-p2y,d2z=q2z-p2z,rx=p1x-p2x,ry=p1y-p2y,rz=p1z-p2z;
  const a=d1x*d1x+d1y*d1y+d1z*d1z,e=d2x*d2x+d2y*d2y+d2z*d2z,f=d2x*rx+d2y*ry+d2z*rz; let s=0,t=0;
  if(a>1e-9||e>1e-9){ if(a<=1e-9) t=clamp(f/e,0,1); else { const c=d1x*rx+d1y*ry+d1z*rz; if(e<=1e-9) s=clamp(-c/a,0,1); else { const b=d1x*d2x+d1y*d2y+d1z*d2z,den=a*e-b*b;
    s=den>1e-12?clamp((b*f-c*e)/den,0,1):0; t=(b*s+f)/e; if(t<0){ t=0; s=clamp(-c/a,0,1); } else if(t>1){ t=1; s=clamp((b-c)/a,0,1); } } } }
  const x=p1x+d1x*s-p2x-d2x*t,y=p1y+d1y*s-p2y-d2y*t,z=p1z+d1z*s-p2z-d2z*t; return Math.sqrt(x*x+y*y+z*z); }
function melLerpM(A,B,u){ const qa=qFromCols(...melCols(A)),qb=qFromCols(...melCols(B)),[X,Y,Z]=qCols(qNlerp(qa,qb,u)); return fromCols(X,Y,Z,[lerp(A[12],B[12],u),lerp(A[13],B[13],u),lerp(A[14],B[14],u)]); }
const melRot=(M,v)=>[M[0]*v[0]+M[4]*v[1]+M[8]*v[2],M[1]*v[0]+M[5]*v[1]+M[9]*v[2],M[2]*v[0]+M[6]*v[1]+M[10]*v[2]];

/* his drawn skin, in the world, once a frame, with its triangles sorted by body capsule so a blade near his arm only
   tests the arm. Rebuilt if a limb comes off (the skin's weights change) */
let MEL_F=0; protoOn('tick',gdt=>{ MEL_F++; for(const E of enemies) if(E.winded>0) E.winded=Math.max(0,E.winded-gdt); });
const MEL_BSEG={}; function melBoneSegs(b){ return MEL_BSEG[b]||(MEL_BSEG[b]=(()=>{ const names=b>=0&&BONE_SEG[BONES[b]]||[]; return SEGS.map((sg,si)=>names.includes(sg[3])?si:-1).filter(x=>x>=0); })()); }
function melSkin(E){ const C=E.melC||(E.melC={f:-1,cutN:-1,V:null,meshes:null});
  const cutN=Object.keys(E.cut||{}).filter(k=>E.cut[k]).length;
  if(!C.meshes||C.cutN!==cutN){ C.cutN=cutN; C.meshes=bodyMeshes(E).map(([n,P,Sk])=>{ const I=n.mesh.geo.I,buck=SEGS.map(()=>[]),W=new Float32Array(BONES.length),tb=new Int16Array(I.length/3);
      for(let k=0,t=0;k<I.length;k+=3,t++){ let bb=-1; if(Sk){ W.fill(0); let bw=-1; for(let q=0;q<3;q++){ const v=I[k+q]; for(let z=0;z<2;z++){ const x=Sk.bw[v*2+z]; if(x>0){ const b=Sk.bi[v*2+z]; W[b]+=x; if(W[b]>bw){ bw=W[b]; bb=b; } } } } } /* the bone that drives most of this triangle */
        tb[t]=bb; for(const si of Sk?melBoneSegs(bb):[0,1]) buck[si].push(k); }
      return {n,P,Sk,I,tb,buck:buck.map(b=>Int32Array.from(b)),V:new Float32Array(P.length)}; }); C.f=-1; }
  if(C.f!==MEL_F){ C.f=MEL_F; for(const m of C.meshes){ const W=m.n.world,P=m.P,V=m.V; for(let i=0;i<P.length;i+=3){ const x=P[i],y=P[i+1],z=P[i+2]; V[i]=W[0]*x+W[4]*y+W[8]*z+W[12]; V[i+1]=W[1]*x+W[5]*y+W[9]*z+W[13]; V[i+2]=W[2]*x+W[6]*y+W[10]*z+W[14]; } } }
  return C; }
/* where his body was last frame, so his speed at the contact is a frame's average, not one jittery physics step */
function melTrack(E,dt){ const B=E.B; if(!E.melX1){ E.melX0=new Float32Array(B.x.length); E.melX1=new Float32Array(B.x.length); E.melTf=-9; }
  if(E.melTf===MEL_F) return; if(E.melTf===MEL_F-1) E.melX0.set(E.melX1); else E.melX0.set(B.x); E.melX1.set(B.x); E.melTf=MEL_F; E.melDt=Math.max(dt,1e-3); }
/* first skin triangle along a ray, among the triangles of the given capsules: {t, mesh, k} */
function melRay(C,segs,o,d,maxT,best){
  for(const m of C.meshes){ const V=m.V,I=m.I; for(const si of segs){ const L=m.buck[si]; for(let j=0;j<L.length;j++){ const k=L[j],a=I[k]*3,b=I[k+1]*3,c=I[k+2]*3;
    const e1x=V[b]-V[a],e1y=V[b+1]-V[a+1],e1z=V[b+2]-V[a+2],e2x=V[c]-V[a],e2y=V[c+1]-V[a+1],e2z=V[c+2]-V[a+2];
    const px=d[1]*e2z-d[2]*e2y,py=d[2]*e2x-d[0]*e2z,pz=d[0]*e2y-d[1]*e2x,det=e1x*px+e1y*py+e1z*pz; if(det>-1e-9&&det<1e-9) continue; const id=1/det;
    const tx=o[0]-V[a],ty=o[1]-V[a+1],tz=o[2]-V[a+2],u=(tx*px+ty*py+tz*pz)*id; if(u<0||u>1) continue;
    const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(d[0]*qx+d[1]*qy+d[2]*qz)*id; if(v<0||u+v>1) continue;
    const t=(e2x*qx+e2y*qy+e2z*qz)*id; if(t>=0&&t<=maxT&&(!best.m||t<best.t)){ best.t=t; best.m=m; best.k=k; best.si=si; } } } }
  return best; }
function melTriInfo(C,b,d){ const m=b.m,V=m.V,I=m.I,k=b.k,a=I[k]*3,bb=I[k+1]*3,c=I[k+2]*3;
  let n=norm3(v3.cross([V[bb]-V[a],V[bb+1]-V[a+1],V[bb+2]-V[a+2]],[V[c]-V[a],V[c+1]-V[a+1],V[c+2]-V[a+2]])); if(v3.dot(n,d)>0) n=v3.sc(n,-1); /* facing the weapon */
  return {n,bone:m.Sk?(m.tb[k/3]>=0?BONES[m.tb[k/3]]:'spine'):'head'}; }

/* ---------- the swept hit test: every frame, per hand, after melHand (VR) ---------- */
const MEL_SPOTS=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
function melSweep(h,dt){ const S=melState(h);
  if(!GAME.started||PL.dead||h.stuck||h.supportOf||h.grab||!S.p){ S.prevIW=null; S.hist.length=0; return; }
  if(S.node!==h.itemNode){ S.node=h.itemNode; S.prevIW=null; S.hist.length=0; } /* a new item, or a knife flipped in the hand: start the sweep fresh */
  const key=h.item?h.item.key:'fists',w=WPN[key],caps=melStrikes(w),cur=new Float32Array(S.IW);
  S.hist.unshift({M:cur,R:new Float32Array(S.RW),dt:Math.max(dt,1e-3)}); if(S.hist.length>12) S.hist.length=12;
  const prev=S.prevIW; S.prevIW=cur;
  /* contacts held: let a man go once the weapon is well clear of him */
  for(const [E,t] of S.lock){ if(!enemies.includes(E)||GAME.t-t>1.2||GAME.t-t>.12&&melClear(E,caps,cur,.04)) S.lock.delete(E); }
  if(!prev||S.stopT>0||h.cd>0) return; /* h.cd: a hit knocked your hands (80-ray.js); that jolt is not a swing */
  const wall=!S.wall&&(w.melee||!h.item||w.gun&&S.clubK>.5&&!WICK.on)&&!h.support?melWallHit(h,S,w,key,caps,prev,cur):null,wallU=wall?wall.f:2; /* a wall in the way this frame: only what comes before it counts */
  const hp=colOf(cur,3),cand=[];
  for(const E of enemies){ if(S.lock.has(E)) continue; const x=E.B.x; if(Math.hypot(x[0]-hp[0],x[2]-hp[2])<1.9){ cand.push(E); melTrack(E,dt); if(!E.melC) melSkin(E); } } /* x[0..2]: his pelvis. His skin index is built as he comes in reach, not on the frame you hit him */
  if(!cand.length){ if(wall) wall.apply(); return; }
  const mid=melLerpM(prev,cur,.5),steps=[[prev,mid,0],[mid,cur,.5]];
  for(const [M0,M1,u0] of steps) for(const c of caps){ const A0=mulP(M0,c.a),B0=mulP(M0,c.b),A1=mulP(M1,c.a),B1=mulP(M1,c.b);
    const disp=Math.max(Math.hypot(...v3.sub(A1,A0)),Math.hypot(...v3.sub(B1,B0))); if(disp<2e-4) continue;
    const ns=clamp(Math.ceil(disp/Math.max(c.r*.6,.015)),1,6);
    for(const E of cand){ if(S.lock.has(E)) continue; const X=E.B.x,segs=[];
      /* broad phase: the moving capsule against his fat body capsules, sampled finer than its own radius */
      for(let si=0;si<SEGS.length;si++){ if(E.segOff.has(si)) continue; const sg=SEGS[si],i=sg[0]*3,j=sg[1]*3,lim=c.r+sg[2]+.04; /* generous: the skin decides */
        for(let s=1;s<=ns;s++){ const t=s/ns,ax=A0[0]+(A1[0]-A0[0])*t,ay=A0[1]+(A1[1]-A0[1])*t,az=A0[2]+(A1[2]-A0[2])*t,bx=B0[0]+(B1[0]-B0[0])*t,by=B0[1]+(B1[1]-B0[1])*t,bz=B0[2]+(B1[2]-B0[2])*t;
          if(melSegD(ax,ay,az,bx,by,bz,X[i],X[i+1],X[i+2],X[j],X[j+1],X[j+2])<lim){ segs.push(si); break; } } }
      if(!segs.length) continue;
      /* narrow phase: rays from the capsule's leading surface along its motion, onto his drawn skin */
      const hit=melNarrow(E,c,A0,B0,A1,B1,segs,M0,M1); if(!hit) continue;
      const u=u0+.5*hit.f; if(u>wallU) continue; /* he's behind the wall it hit */
      if(melContact(h,S,E,c,hit,u,w,key)){ S.lock.set(E,GAME.t); if(S.stopT>0||h.stuck) return; } } }
  if(wall) wall.apply(); }
/* is every strike volume at least m clear of his body capsules? */
function melClear(E,caps,M,m){ const X=E.B.x; for(const c of caps){ const a=mulP(M,c.a),b=mulP(M,c.b);
  for(let si=0;si<SEGS.length;si++){ if(E.segOff.has(si)) continue; const sg=SEGS[si],i=sg[0]*3,j=sg[1]*3; if(melSegD(a[0],a[1],a[2],b[0],b[1],b[2],X[i],X[i+1],X[i+2],X[j],X[j+1],X[j+2])<c.r+sg[2]+m) return false; } } return true; }
const MEL_RIM=[0,1,2,3,4,5,6,7].map(i=>[Math.cos(i*Math.PI/4),Math.sin(i*Math.PI/4)]);
function melNarrow(E,c,A0,B0,A1,B1,segs,M0,M1){ const C=melSkin(E),len=Math.hypot(...v3.sub(B0,A0)),disc=c.kind==='blunt'&&c.n&&c.r>=.06,np=c.kind==='point'?1:disc?3:Math.max(2,Math.ceil(len/.03)+1);
  const lead=c.kind==='point'||disc?.01:c.r,wide=c.r>=.03,best={t:9,m:null,k:-1,si:-1};
  let out=null,n0=null,n1=null;
  if(disc){ n0=norm3(melRot(M0,c.n)); n1=norm3(melRot(M1,c.n)); } /* a flat face: rays from across the disc, not from a ball round it */
  for(let i=0;i<np;i++){ const u=np===1?0:i/(np-1),p0=v3.add(A0,v3.sc(v3.sub(B0,A0),u)),p1=v3.add(A1,v3.sc(v3.sub(B1,A1),u)),dv=v3.sub(p1,p0),L=Math.hypot(...dv); if(L<1e-4) continue;
    const d=v3.sc(dv,1/L),e1=norm3(Math.abs(d[1])<.9?v3.cross(d,[0,1,0]):v3.cross(d,[1,0,0])),e2=v3.cross(d,e1);
    const pts=disc?[[0,0,0]].concat(MEL_RIM.map(q=>[q[0],q[1],1])):wide?MEL_SPOTS.map(q=>[q[0],q[1],0]):[[0,0,0]];
    for(const [sx,sy,rim] of pts){ let o;
      if(disc){ const f0=norm3(Math.abs(n0[1])<.9?v3.cross(n0,[0,1,0]):v3.cross(n0,[1,0,0])),f1=v3.cross(n0,f0),g0=norm3(Math.abs(n1[1])<.9?v3.cross(n1,[0,1,0]):v3.cross(n1,[1,0,0])),g1=v3.cross(n1,g0),R=c.r*.92;
        const q0=v3.add(p0,v3.add(v3.sc(f0,sx*R*rim),v3.sc(f1,sy*R*rim))),q1=v3.add(p1,v3.add(v3.sc(g0,sx*R*rim),v3.sc(g1,sy*R*rim))),qd=v3.sub(q1,q0),qL=Math.hypot(...qd); if(qL<1e-4) continue;
        const dq=v3.sc(qd,1/qL); o=v3.add(q0,v3.sc(dq,lead-.015)); best.m=null; melRay(C,segs,o,dq,qL+.015,best);
        if(best.m) out=melNarrowHit(E,C,best,o,dq,qL,out); continue; }
      const rho=c.kind==='point'?c.r*.8:c.r*.7,fw=sx||sy?(c.kind==='point'?.01:Math.sqrt(Math.max(0,c.r*c.r-rho*rho))):lead;
      o=v3.add(p0,v3.add(v3.sc(d,fw-.015),v3.add(v3.sc(e1,sx*rho),v3.sc(e2,sy*rho)))); best.m=null;
      melRay(C,segs,o,d,L+.015,best);
      if(best.m) out=melNarrowHit(E,C,best,o,d,L,out); } }
  return out; }
function melNarrowHit(E,C,best,o,d,L,out){ const p=v3.add(o,v3.sc(d,best.t)),f=clamp((best.t-.015)/L,0,1);
  /* only going into him counts: coming out of him (a hand that started inside) is not a hit */
  const sg=SEGS[best.si],a=X_(E.B,sg[0]),b=X_(E.B,sg[1]),ab=v3.sub(b,a),s=clamp(v3.dot(v3.sub(p,a),ab)/Math.max(1e-6,v3.dot(ab,ab)),0,1),q=v3.add(a,v3.sc(ab,s));
  if(v3.dot(d,v3.sub(q,p))<=0) return out;
  if(!out||f<out.f){ const ti=melTriInfo(C,best,d); return {p,n:ti.n,bone:ti.bone,f,si:best.si,s,d}; } return out; }

/* ---------- a contact: how fast, which way, what kind; then the tier ---------- */
function melContact(h,S,E,c,hit,u,w,key){ const P=PROTO.melee;
  /* the weapon's pose at the moment it touched, the contact point on it (item space), and how fast that point moved over the last
     three frames relative to his body there */
  const Mu=melLerpM(S.hist[1].M,S.hist[0].M,u),ci=mulP(rigidInv(Mu),hit.p),sg=SEGS[hit.si],B=E.B,i=sg[0]*3,j=sg[1]*3,s=hit.s;
  const X0=E.melX0||B.x,X1=E.melX1||B.x,vb=[0,1,2].map(k=>((X1[i+k]-X0[i+k])*(1-s)+(X1[j+k]-X0[j+k])*s)/(E.melDt||1));
  const Zw=norm3(melRot(Mu,c.kind==='point'&&c.n?c.n:[0,0,1])); /* which way a point goes in */
  /* each of the last three frames, for the weapon you see and the one in your real hand: the contact point's velocity relative to him */
  const lagF=Math.min(11,3+Math.ceil(melTaus(h,w,S)[0]*3/Math.max(S.hist[0].dt,1e-3))); /* a heavy weapon arrives carrying the swing your hand made while it was catching up (about 3 lag times) */
  const V=[]; for(let f=0;f+1<S.hist.length&&f<11;f++) for(const k of ['M','R']){ if(f>=(k==='M'?3:lagF)) continue; const vr=v3.sub(v3.sc(v3.sub(mulP(S.hist[f][k],ci),mulP(S.hist[f+1][k],ci)),1/S.hist[f].dt),vb),m=Math.hypot(...vr); if(m>1e-4) V.push({vr,m,cs:clamp(-v3.dot(vr,hit.n)/m,0,1),vis:k==='M'}); }
  let dir=hit.d,raw=0,tang=0; for(const x of V) if(x.vis&&x.m>raw){ raw=x.m; dir=v3.sc(x.vr,1/x.m); tang=x.m*Math.sqrt(Math.max(0,1-x.cs*x.cs)); } /* the way the weapon you see was going */
  const ax=V.reduce((a,x)=>Math.max(a,v3.dot(x.vr,Zw)),0);
  const o=otherHand(h),grabbed=!!(o.grab&&o.grab.E===E&&!E.dead); /* the other hand holds him: he's steady, everything lands, a tier harder */
  /* what kind of contact */
  let kind=c.kind==='blunt'||w.gun?'blunt':'cut',cutK=1;
  if(c.kind==='point'){ const al=v3.dot(dir,Zw); if(al<(grabbed?.45:P.stabCos)) return false; /* not point-first: the edge or the flat takes it */
    kind=ax>=(key==='knife'?P.knifeStabV:P.stabV)*(grabbed?P.grabStab:1)?'stab':'push'; }
  else if(c.kind==='edge'){ const bax=norm3(v3.sub(mulP(Mu,c.b),mulP(Mu,c.a))),along=v3.dot(dir,bax),dp=v3.sub(dir,v3.sc(bax,along)),dl=Math.hypot(...dp);
    if(dl<.45&&along>0&&melStrikes(w).some(q=>q.kind==='point')) return false; /* point-first: the tip decides */
    if(c.n&&dl>=.3){ const al=v3.dot(norm3(melRot(Mu,c.n)),v3.sc(dp,1/dl)); if(al<P.flatCos) kind='blunt'; else if(al<P.edgeCos) cutK=.5+.5*(al-P.flatCos)/(P.edgeCos-P.flatCos); } } /* drawn along the blade: it cuts */
  /* how hard: a blunt blow by how square it lands (a glancing one less), a cut by how fast the edge goes through, a stab along the blade */
  const bax=norm3(v3.sub(mulP(Mu,c.b),mulP(Mu,c.a))),edgeV=x=>Math.hypot(...v3.sub(x.vr,v3.sc(bax,v3.dot(x.vr,bax))));
  let speed=0; for(const x of V) speed=Math.max(speed,kind==='stab'||c.kind==='point'?v3.dot(x.vr,Zw):kind==='cut'&&c.b!==c.a?Math.max(edgeV(x),x.m*(.7+.3*x.cs)):x.m*(.7+.3*x.cs));
  const T0=P.tier,ts=kind==='blunt'?speed*Math.min(1.4,Math.sqrt(1+.6*melMass(w))):speed; /* a heavier club lands a little harder than its speed */
  const touch=c.kind==='point'?speed:V.reduce((a,x)=>Math.max(a,x.m),0); /* push or hit: how fast it met him at all. How square it landed and how heavy it is only shape the harder tiers */
  let tier=kind==='push'?0:touch<T0[0]?0:ts<T0[1]?1:ts<T0[2]?2:3;
  if(grabbed) tier=Math.min(3,tier+1);
  if(kind==='cut'&&tier===0) kind=tang>.6?'slice':'push'; /* under push speed a blade only opens him if drawn along him */
  if(kind==='blunt'&&tier===0) kind='push';
  if(kind==='push'&&tier>0) kind=c.kind==='point'?'blunt':kind; /* held: even a slow poke lands */
  if(kind==='stab') tier=Math.max(1,tier); /* in is in */
  protoEmit('melee',h,E,{tier,speed:ts,raw,part:sg[3],kind,weapon:key,grabbed,p:hit.p,dbg:P.debug?{V:V.map(x=>[+x.m.toFixed(2),+x.cs.toFixed(2),x.vis?'v':'r',+v3.dot(x.vr,Zw).toFixed(2)]),cap:melStrikes(w).indexOf(c),u:+u.toFixed(2),n:hit.n.map(x=>+x.toFixed(2)),dir:dir.map(x=>+x.toFixed(2))}:null});
  if(!P.dry) meleeHit(h,E,sg,hit.p,dir,ts,hit.bone,{tier,kind,cutK,grabbed,n:hit.n});
  /* the weapon stops on him: back to where it touched, held there while your hand goes on (not for a push, not when it sank in) */
  if(tier>=1&&!h.stuck&&!(P.dry&&kind==='stab'&&STICKS[key])&&(h.item?h.item.key:'fists')===S.key){ const back=m4.make(); m4.mul(back,Mu,rigidInv(S.hist[0].M)); /* this frame's correction, applied to the hand */
    const Vt=m4.make(); m4.mul(Vt,back,S.V); const L=melLocal(Vt); S.p=mulP(L,FIST); S.q=qFromCols(...melCols(L)); S.v=[0,0,0];
    S.stopT=lerp(P.stop[0],P.stop[1],clamp(melMass(w)/.8,0,1)); melApply(h,S); S.prevIW=new Float32Array(S.IW); S.hist[0].M=S.prevIW; }
  return true; }
/* ---------- what a hit does ---------- */
/* flat screen and old callers pass only a speed: the tier comes from that, blades cut, guns and fists are blunt */
function melTier(speed){ const T=PROTO.melee.tier; return speed<T[0]?0:speed<T[1]?1:speed<T[2]?2:3; }
function melHit(h,E,seg,p,dir,speed,bone,o){ const key=h.item?h.item.key:'fists',w=WPN[key],P=PROTO.melee;
  if(!o) o={tier:melTier(speed),kind:w.gun||w.melee!=='knife'?(speed<P.tier[0]?'push':'blunt'):(speed<P.tier[0]?'push':'cut'),cutK:1};
  const T=o.tier,part=seg[3],k=part.replace(/[LR]$/,''),m=melMass(w);
  const dp=norm3([dir[0],clamp(dir[1],-.35,.03),dir[2]]); /* he's driven along the blow, never lifted (an uppercut snaps the head, it doesn't hop him) */
  if(o.kind==='push'||o.kind==='blunt'){ hitEnemy(E,seg,p,dp,'blunt',{tier:T,speed,mk:Math.min(1.8,1+m*.6),push:o.kind==='push'}); /* -> hitBlunt -> melBlunt (a cut-off piece just gets knocked about) */
    if(o.kind==='push') sfx('bump',.5,p); else if(w.gun) sfx('bash',T>=2?1:.75,p); else { sfx('punch',T>=2?1:.7,p); if(T>=2) sfx(T>=3&&(k==='head'||k==='neck')?'crunch':'kick',T>=3?.6:.4,p); }
    if(T>=1&&w.uses&&w.melee==='knife'){ h.item.uses--; if(h.item.uses<=0){ sfx('glass'); spray(p,v3.sc(dir,-1),10,1.6,.8,'dust',.008); equip(h,null); } } }
  else { const segI=SEGS.indexOf(seg),stab=o.kind==='stab',slice=o.kind==='slice',ck=o.cutK||1,wb=w.bleed||1;
    const op=slice?{bleed:.3*wb,sever:.001,stun:.3,push:.15,shallow:true,power:.5}
      :stab?{bleed:wb*.8,sever:.001,stun:1.2,push:.4,reach:(BURY[key]||.05)+.03,noBrain:T<2,power:clamp(speed/3,.6,1.6)}
      :T<=1?{bleed:wb*.7*ck,sever:.001,stun:.7,push:.7,noBrain:true,power:clamp(speed/3,.6,1.2)}
      :T===2?{bleed:wb*1.15*ck,sever:.001,stun:1.1,push:1.1,noBrain:!w.chop,power:clamp(speed/3,.8,1.6)}
      :{bleed:wb*1.3*ck,sever:w.sever||1,stun:w.stun||1.2,push:(w.push||1)*1.1,chop:!!w.chop,noBrain:!w.chop,power:clamp(speed/3,1,1.8)};
    if(o.grabbed&&!slice) op.bleed*=1.25;
    if(w.heavy&&!h.support){ op.bleed*=.6; op.push*=.6; if(op.sever>.01) op.sever*=.6; } /* an axe in one hand */
    hitEnemy(E,seg,p,dir,'knife',op); sfx(slice?'stab':w.chop&&T>=3?'chop':'stab',slice?.4:T>=2?1:.75,p);
    if(!E.dead&&T>=2&&!stab) melStagger(E,dp,speed,.6); else if(!E.dead&&!slice) E.flinchT=FL_T;
    /* point-first and hard: it goes in and stays in. A chop bites into bone and stays sometimes */
    if(XR.on&&bone&&STICKS[key]&&h.itemNode&&!h.stuck&&!E.segOff.has(segI)&&enemies.includes(E)){
      const lodge=key==='machete'&&!stab&&T>=2&&/chest|belly|head|thigh|neck|uarm/.test(part)&&Math.random()<.45;
      if(stab||lodge) startStuck(h,E,bone,seg,!stab); }
    if(w.uses){ h.item.uses--; if(h.item.uses<=0){ sfx('glass'); spray(p,v3.sc(dir,-1),10,1.6,.8,'dust',.008); equip(h,null); } } }
  if(XR.on){ const full=T>=2||o.kind==='stab',v=o.kind==='push'||o.kind==='slice'?.25:full?1:.5,ms=o.kind==='push'||o.kind==='slice'?15:full?40:20; buzz(h.hand,v,ms); if(h.support) buzz(h.support.hand,v*.8,ms); }
  if(!XR.on) h.cd=T>=2?.4:.28; } /* flat screen: one click, one blow. VR: each man is held off until the weapon leaves him (melSweep) */
/* staggered: driven back a step, the guard drops for about a second */
function melStagger(E,dp,speed,k=1){ const B=E.B,fl=norm3([dp[0],0,dp[2]]),f=k*(1.1+.22*clamp(speed-3.5,0,4));
  for(const i of [PI_.pelvis,PI_.hipL,PI_.hipR,PI_.chest,PI_.neck,PI_.shL,PI_.shR,PI_.head]) kickV(B,i,v3.sc(fl,f),H); /* the whole trunk, evenly: he goes back, he doesn't spin */
  if(E.st==='alert'||E.st==='idle'){ const st=k*(.16+.03*clamp(speed-3.5,0,3)); E.pos[0]+=fl[0]*st; E.pos[1]+=fl[2]*st; } /* his feet have to step to catch him */
  E.stun=Math.max(E.stun,.55+.15*k); E.openT=GAME.t+1; E.atkCd=Math.max(E.atkCd||0,1); E.atkT=-1; E.flinchT=FL_T; E.settle=Math.max(E.settle||0,.6); }
function melDown(E,dp,ko){ const fl=norm3([dp[0],0,dp[2]]); for(const i of [PI_.chest,PI_.neck,PI_.head,PI_.shL,PI_.shR]) kickV(E.B,i,v3.sc(fl,1.4),H);
  E.hitDir=fl; toDown(E,true); startDrop(E,rnd(.75,.95)); E.knocked=true; /* out cold: he folds and drops like a sack (startDrop), no pose held on the way down */ E.koT=ko; E.melHead=[]; E.melStag=[]; faceHold(E,'shock',1.2); if(E.barkCd<1.6) bark(E,'',0); }
/* fists, gun butts, the flat of a blade: by tier */
function melBlunt(E,seg,point,dir,key,o){ const T=o.tier,sp=o.speed||0,mk=o.mk||1,BL=BLUNT[key]||{stun:.2},head=key==='head'||key==='neck',body=key==='chest'||key==='belly',P=PROTO.melee,B=E.B,t=GAME.t;
  const segP=seg[0]===seg[1]?[seg[0]]:[seg[0],seg[1]],trunk=[PI_.pelvis,PI_.hipL,PI_.hipR,PI_.chest,PI_.neck,PI_.shL,PI_.shR];
  if(o.push||T===0){ for(const i of segP) kickV(B,i,v3.sc(dir,(.35+.3*sp)*mk),H); for(const i of trunk) kickV(B,i,v3.sc(dir,.12*sp*mk),H); /* a shove: no harm done, but he knows */
    if(!E.dead){ E.stun=Math.min(1,E.stun+.08); setAware(E,'hit'); } return; }
  for(const i of segP) kickV(B,i,v3.sc(dir,(.9+.3*sp)*mk*(T>=2?.8:1)),H); for(const i of trunk) kickV(B,i,v3.sc(dir,(T>=2?.12:.22)*sp*mk),H);
  if(E.dead){ spray(point,v3.sc(dir,-1),3,1,.6,'dark',.008); return; }
  E.hitT=0; spray(point,v3.sc(dir,-1),2+2*T,1,.6,'dark',.008);
  if(key==='head'&&T>=2&&!E.nose){ E.nose=true; addWound(E,seg,point,dir,{rate:.35,art:false,part:'face',noDecal:true}); }
  if(body){ E.winded=Math.max(E.winded||0,P.winded*T); E.atkCd=Math.max(E.atkCd||0,E.winded); } /* winded: his next swing or shot comes later */
  E.melHead=(E.melHead||[]).filter(x=>t-x<P.koWin); E.melStag=(E.melStag||[]).filter(x=>t-x<P.stagWin);
  if(head&&sp>=P.headKO) E.melHead.push(t); /* sp already counts the club's weight */
  let down=false;
  if(head&&T>=3) down=true; /* a hard one to the head or jaw */
  else if(head&&E.melHead.length>=2) down=true; /* two good ones */
  else if(T>=2){ E.melStag.push(t); if(E.melStag.length>=2) down=true; else melStagger(E,dir,sp,head?.8:1); } /* a second stagger before he's found his feet */
  else { E.stun=Math.min(1,E.stun+BL.stun*.6); E.flinchT=FL_T; if(head) E.daze=Math.min(1.5,(E.daze||0)+.2); } /* a hit: he flinches, the guard comes up */
  if(!down&&E.daze>=1){ E.daze=0; down=true; }
  if(down&&E.st!=='down'){ melDown(E,dir,head?rnd(3.5,6):rnd(2,3.5)); vox(E,head?'grunt':'oof'); }
  else { vox(E,body?'oof':'grunt'); faceHold(E,'agony',.45+.25*T); if(E.barkCd<1.2) bark(E,pick(T>=2?['Agh— fuck—','Ow— OW—','Hnf—']:['Hnf—','*grunts*','Ugh—']),1.6); }
  setAware(E,'hit'); noise([E.pos[0],0,E.pos[1]],6,{alarm:true,from:E}); }
