/* =====================================================================
   RAY'S HANDS. Real hands instead of the fist block: a palm, four fingers of three bones, a thumb, a wrist.
   - The model frame (MF): +z from the wrist to the knuckles, +y toward the thumb side, the palm faces +x on the right hand
     (-x on the left; everything in x is mirrored by ps).
   - Empty hand (VR): the fingers follow the controller. Index = trigger, the other three = grip, the thumb comes down when it
     rests on a button or the stick. So you can point, make a fist, give a thumbs up.
   - The empty hand lies along the controller's pointing ray, not square to its handle. The handle of a Touch controller is raked
     well forward of square, so a fist drawn square to it pointed at the floor while your forearm pointed ahead: the "broken wrist".
     The angle is measured live from the two poses the headset gives (grip and ray), so it's right on any controller.
   - Holding something: the hand is posed on the ITEM (its grip point and axes), so it stays on the grip when a second hand turns
     a long gun, and the same hold works in VR and on the flat screen. A handle crosses the palm at the natural 20 degrees.
   - The support hand takes the fore-end from underneath, or wraps the shooting hand on a pistol.
   - The wrist bends only as far as a wrist does (updateArms, 60-weapons.js): past that the forearm comes round with the hand.
   ===================================================================== */
/* things built lying on their side: stood up in the fist, so the fingers go round them (a can, a mug), [rx,ry,rz] */
const HAND_TURN={mug:[0,0,Math.PI/2],mugTin:[0,0,Math.PI/2],tumbler:[0,0,Math.PI/2],beercan:[0,0,Math.PI/2],beercanC:[0,0,Math.PI/2]};
const HANDP={ vr:false, noArm:false, pitch:.6,           /* empty hand: how far the pointing ray sits above square-to-the-handle, when it can't be measured (flat screen never needs it) */
  pitchMin:0, pitchMax:1.0, cross:.35,   /* a handle crosses the palm 20 degrees off square (the hammer grip) */
  flex:1.0, ext:.95, radial:.38, ulnar:.62,   /* the wrist's range, radians: palm-ward, back-ward, toward the thumb, toward the little finger */
  k:16, swap:.14 };                /* fingers ease at this rate; a change of hold blends over this long */
const tRayHandSkin=flat(16,16,321,HEADS.ray.skin,'skin',{decor:I=>{ for(const y of [5,10]) softLine(I,0,y,16,y,HEADS.ray.skinD,.35,1); blob(I,11,3,3,2,.5,'#5c0a0a'); }});
const tRayHandTape=flat(16,16,322,'#aaa392','twill',{decor:I=>{ for(const y of [3,7,11]) softLine(I,0,y,16,y+1,'#7d776a',.5,1); blob(I,5,5,3,3,.75,'#5c0a0a'); blob(I,11,10,3,2,.6,'#3e0606'); }});
const tRayGloveKn=flat(16,16,323,'#101114','leather',{decor:I=>{ for(const x of [2,6,10,14]) softEll(I,x,8,1.6,3,'#2a2c31',.7,.6); }});
const HAND_FY=[.0335,.0112,-.0112,-.0335],HAND_FZ=[.03,.032,.03,.025],HAND_FL=[[.04,.025,.022],[.044,.028,.023],[.041,.026,.022],[.033,.02,.019]],HAND_SP=[-.13,-.03,.07,.17];
const HAND_TL=[.042,.031,.027],HAND_WRIST=[-.031,0,-.084];
function rayHandBuild(side,par){ const ps=side==='R'?1:-1,R=side==='R',mF=M(R?tRayHandSkin:tRayGlove),mP=M(R?tRayHandTape:tRayGloveKn),root=N(par,FIST[0],FIST[1],FIST[2]);
  mk(box(.028,.098,.088,{tw:.88,td:.72}),mP,root,-ps*.032,0,-.019,-Math.PI/2,0,0);                 /* the palm, narrower at the wrist */
  mk(box(.03,.056,.034),mP,root,-ps*.031,0,-.078);                                                  /* the wrist */
  const f=[]; for(let i=0;i<4;i++){ const L=HAND_FL[i],j1=N(root,-ps*.033,HAND_FY[i],HAND_FZ[i]),j2=N(j1,0,0,L[0]),j3=N(j2,0,0,L[1]);
    mk(box(.021,.0208,L[0]+.006,{at:[ps*.003,0,L[0]/2-.003]}),R&&i<4?mF:mP,j1); mk(box(.019,.0196,L[1]+.004,{at:[ps*.003,0,L[1]/2-.002]}),mF,j2); mk(box(.017,.0184,L[2],{at:[ps*.003,0,L[2]/2]}),mF,j3); f.push([j1,j2,j3]); }
  const t1=N(root,-ps*.024,.036,-.05),t2=N(t1,0,0,HAND_TL[0]),t3=N(t2,0,0,HAND_TL[1]);
  mk(box(.026,.026,HAND_TL[0]+.008,{at:[0,0,HAND_TL[0]/2-.004]}),mP,t1); mk(box(.021,.021,HAND_TL[1]+.004,{at:[0,0,HAND_TL[1]/2-.002]}),mF,t2); mk(box(.019,.019,HAND_TL[2],{at:[0,0,HAND_TL[2]/2]}),mF,t3);
  return {ps,root,f,t:[t1,t2,t3],mats:[mF,mP],cur:null,hold:null,swapT:1,from:null,pitch:HANDP.pitch}; }

/* ---------- poses: 12 finger angles (index..little, knuckle to tip), spread, thumb bone dir, thumb curl dir, two thumb curls ---------- */
const handVR=()=>XR.on||HANDP.vr;
const handGripFrame=h=>XR.on?!!h.hm.grip:HANDP.vr; /* is this hand's frame square to the controller handle (empty hands, blades) or along the ray (guns, no grip pose) */ /* HANDP.vr: the bench poses hands the VR way on a flat screen */
const hCurl=(c,k=[1.4,1.66,1.05])=>[c*k[0],c*k[1],c*k[2]];
const hPose=(a,sp,td,tf,tb)=>[...a[0],...a[1],...a[2],...a[3],sp,...td,...tf,...tb];
const HT={ out:[[.3,.62,.72],[.6,-.55,.3],[.15,.2]], wrap:[[.8,.22,.56],[0,-1,.22],[.9,.7]], up:[[.12,.9,.42],[.6,-.3,.6],[.05,.1]], along:[[.62,.42,.66],[.25,-.5,.83],[.5,.25]] };
const HPOSE={
  open: hPose([hCurl(.18),hCurl(.22),hCurl(.27),hCurl(.32)],1,...HT.out),
  fist: hPose([hCurl(1),hCurl(1),hCurl(1),hCurl(1)],0,...HT.wrap),
  flat: hPose([hCurl(.12),hCurl(.14),hCurl(.16),hCurl(.2)],.2,[.7,.3,.65],[.3,-.9,.3],[.35,.3]) };
const hWrap=(c,th)=>hPose([hCurl(c),hCurl(c),hCurl(c),hCurl(c)],0,...(th||HT.wrap));
function hMix(a,b,k){ const o=new Array(a.length); for(let i=0;i<a.length;i++) o[i]=a[i]+(b[i]-a[i])*k; return o; }
function hRot(th,psi,rho){ const cz=Math.cos(rho),sz=Math.sin(rho),cy=Math.cos(psi),sy=Math.sin(psi),cx=Math.cos(-th),sx=Math.sin(-th);
  return hMul([[1,0,0],[0,cx,sx],[0,-sx,cx]],hMul([[cy,0,-sy],[0,1,0],[sy,0,cy]],[[cz,sz,0],[-sz,cz,0],[0,0,1]])); }   /* columns of Rx(-th) Ry(psi) Rz(rho) */
function hMul(A,B){ return B.map(b=>[0,1,2].map(i=>A[0][i]*b[0]+A[1][i]*b[1]+A[2][i]*b[2])); }

/* ---------- holds: where the hand sits on an item, in the item's own coordinates (right hand; x mirrors for the left) ----------
   at: the point in the grip (default the item's grip point); y: toward the thumb side; pn: where the palm faces;
   th/yaw/roll: the hand turned from square, o: the point of the hand model that sits on `at`, c: how far the fingers close */
const HOLD_O=[-.006,0,.014];
const HOLDS={
  handle:{y:[0,0,1],pn:[1,0,0],th:HANDP.cross,c:1},
  palm:{y:[0,1,0],pn:[1,0,0],live:true,c:.62,o:[.004,0,.012],thumb:'along'},
  flatHold:{y:[0,1,0],pn:[1,0,0],live:true,pose:'flat',o:[-.004,0,.02]},
  pistol:{y:[0,1,0],pn:[1,0,0],th:.05,c:.96,o:[-.004,-.012,.012],thumb:'along',trigger:true},
  long:{y:[0,1,0],pn:[1,0,0],th:.12,c:.96,o:[-.004,-.012,.012],thumb:'wrap',trigger:true},
  cup:{y:[0,1,0],pn:[1,0,0],th:.1,c:.82,o:[-.012,0,.02],thumb:'along',support:true},
  fore:{y:[0,0,1],pn:[0,1,0],th:.25,c:.78,o:[-.004,0,.012],thumb:'along',support:true} };
const HOLD_ITEM={ bottle:{c:.95}, knife:{c:1}, machete:{c:1}, pan:{c:1}, hammer:{c:1}, pipe:{c:.9}, cutter:{c:.95},
  plate:{cls:'flatHold'}, ashtray:{cls:'flatHold'}, medkit:{cls:'flatHold'}, keys:{c:.9}, strip:{c:.95}, shoe:{c:.5}, mug:{c:.6}, mugTin:{c:.6}, tumbler:{c:.62}, beercan:{c:.64}, beercanC:{c:.68}, can:{c:.85}, bigcan:{c:.66} };
function handHold(h){ const o=h.supportOf;
  if(o&&o.item&&o.itemNode){ const w=WPN[o.item.key]; return {key:'s:'+o.item.key+(h.cupSide||''),own:o,w,H:HOLDS[w.cup?'cup':'fore'],cup:!!w.cup}; }
  if(h.item&&h.itemNode){ const w=WPN[h.item.key],I=HOLD_ITEM[h.item.key]||{},cls=I.cls||(w.gun?(w.fore?'long':'pistol'):w.melee&&!w.fwd?'handle':'palm');
    return {key:h.item.key+(h.item.rev?'r':''),own:h,w,H:Object.assign({},HOLDS[cls],I),rev:!!h.item.rev}; }
  return null; }

/* the root's matrix in the hand node's frame, and the finger pose, for what this hand is doing now */
function handTarget(h,Tn){ const H=h.hm,ps=H.ps,hd=handHold(h); let F,at,S,pose;
  if(hd&&hd.H.live){ S=hd.H; const th=handGripFrame(h)?H.pitch:0,R=hRot(th,0,0),o=[(S.o||HOLD_O)[0]*ps,(S.o||HOLD_O)[1],(S.o||HOLD_O)[2]];   /* something small in the palm: the hand stays where your hand is, the thing sits in it */
    F=fromCols(R[0],R[1],R[2],v3.sub(FIST,v3.add(v3.sc(R[0],o[0]),v3.add(v3.sc(R[1],o[1]),v3.sc(R[2],o[2]))))); pose=S.pose?HPOSE[S.pose]:hWrap(S.c??1,HT[S.thumb||'wrap']); }
  else if(hd){ S=hd.H; const w=hd.w,Mi=itemM(hd.own),mir=v=>[v[0]*ps,v[1],v[2]];
    let Y=S.y.slice(),Pn=mir(S.pn); if(hd.rev) Y=v3.sc(Y,-1);
    if(hd.cup){ const sg=h.cupSide||1; at=v3.add(w.grip,[sg*.03,-.012,.012]); Pn=[-sg,0,0]; }   /* beside the gun hand, palm toward it */
    else if(S.support) at=[w.fore[0],w.fore[1],(h.supZ??w.fore[2])-(hd.own.pumpSlide||0)];
    else at=S.at||w.grip;
    const X0=v3.sc(norm3(Pn),ps),Y0=norm3(v3.sub(Y,v3.sc(X0,v3.dot(Y,X0)))),Z0=v3.cross(X0,Y0);
    const th=S.live?(handGripFrame(h)?H.pitch:0):S.th||0,Rl=hRot(th,(S.yaw||0)*ps,(S.roll||0)*ps),R=hMul([X0,Y0,Z0],Rl),o=mir(S.o||HOLD_O);
    const P=v3.sub(at,v3.add(v3.sc(R[0],o[0]),v3.add(v3.sc(R[1],o[1]),v3.sc(R[2],o[2]))));
    const W=m4.make(); m4.mul(W,Mi,fromCols(R[0],R[1],R[2],P)); F=m4.make(); m4.mul(F,rigidInv(Tn),W);
    pose=S.pose?HPOSE[S.pose]:hWrap(S.c??1,HT[S.thumb||'wrap']);
    if(S.trigger){ const t=h.trigV??(h.item&&h.item.cd>0?1:0); pose=pose.slice(); const a=hMix([.25,.75,.35],[.38,1.25,.5],t); pose[0]=a[0]; pose[1]=a[1]; pose[2]=a[2]; } }   /* the index lies on the trigger and pulls it */
  else { const th=handGripFrame(h)?H.pitch:0,R=hRot(th,0,0),o=[HOLD_O[0]*ps,HOLD_O[1],HOLD_O[2]];
    F=fromCols(R[0],R[1],R[2],v3.sub(FIST,v3.add(v3.sc(R[0],o[0]),v3.add(v3.sc(R[1],o[1]),v3.sc(R[2],o[2])))));
    const busy=h.grab||h.stuck||h.swingT>=0,g=busy?1:handVR()?clamp(h.gripV??0,0,1):.45,t=busy?1:handVR()?clamp(h.trigV??0,0,1):.45;
    pose=hMix(HPOSE.open,HPOSE.fist,g); const idx=hMix(HPOSE.open,HPOSE.fist,t); for(let i=0;i<3;i++) pose[i]=idx[i];
    if(handVR()&&!busy){ const up=!h.thumbT,T_=up?(g>.5?HT.up:HT.out):HT.wrap; for(let i=0;i<3;i++){ pose[13+i]=T_[0][i]; pose[16+i]=T_[1][i]; } pose[19]=T_[2][0]; pose[20]=T_[2][1]; } }
  return {F,pose,key:hd?hd.key:'-'}; }

function handApply(H,pose,F){ const ps=H.ps,r=H.root; r.p=[F[12],F[13],F[14]]; r.r=eul([colOf(F,0),colOf(F,1),colOf(F,2)]);
  for(let i=0;i<4;i++){ const j=H.f[i]; j[0].r=[HAND_SP[i]*pose[12],ps*pose[i*3],0]; j[1].r=[0,ps*pose[i*3+1],0]; j[2].r=[0,ps*pose[i*3+2],0]; }
  const Z=norm3([pose[13]*ps,pose[14],pose[15]]); let Fd=[pose[16]*ps,pose[17],pose[18]]; Fd=v3.sub(Fd,v3.sc(Z,v3.dot(Fd,Z))); const fl=Math.hypot(...Fd); Fd=fl>1e-4?v3.sc(Fd,1/fl):[0,-1,0];
  const Y=v3.sc(Fd,-1),X=v3.cross(Y,Z); H.t[0].r=eul([X,Y,Z]); H.t[1].r=[pose[19],0,0]; H.t[2].r=[pose[20],0,0]; }

/* every frame, after the hands and any support hand are placed, before the forearms */
function handsTick(dt){ for(const h of [HANDS.L,HANDS.R]){ const H=h.hm; if(!H||h.node.vis===false) continue;
    const Tn=m4.make(); m4.compose(Tn,h.node.p,h.node.r,[1,1,1]); const T=handTarget(h,Tn),k=1-Math.exp(-dt*HANDP.k);
    if(!H.cur){ H.cur=T.pose.slice(); H.hold=T.key; H.F=T.F; }
    if(T.key!==H.hold){ H.hold=T.key; H.from=H.F; H.swapT=0; }
    H.cur=hMix(H.cur,T.pose,k); let F=T.F;
    if(H.swapT<1&&H.from){ H.swapT=Math.min(1,H.swapT+dt/HANDP.swap); const s=H.swapT*H.swapT*(3-2*H.swapT),A=H.from,B=T.F,mix=c=>norm3([0,1,2].map(i=>A[c*4+i]+(B[c*4+i]-A[c*4+i])*s));
      const Z=mix(2); let Y=mix(1); Y=norm3(v3.sub(Y,v3.sc(Z,v3.dot(Y,Z)))); F=fromCols(v3.cross(Y,Z),Y,Z,[0,1,2].map(i=>A[12+i]+(B[12+i]-A[12+i])*s)); }
    H.F=F; handApply(H,H.cur,F); H.Tn=Tn; } }
/* the wrist and the hand's axes in the world (for the forearm) */
function handWrist(h){ const H=h.hm; if(!H||!H.F||!H.Tn) return null; const W=m4.make(); m4.mul(W,H.Tn,H.F);
  return {W:mulP(W,[HAND_WRIST[0]*H.ps,HAND_WRIST[1],HAND_WRIST[2]]),Pn:v3.sc(colOf(W,0),H.ps),Y:colOf(W,1),L:colOf(W,2)}; }
/* where a poke lands: the tip of the index finger when it's out, else the fist */
function handTip(h){ const H=h.hm; if(!H||!H.cur||h.item||h.supportOf||H.cur[0]+H.cur[1]>1.4) return mulP(h.M,FIST); return mulP(H.f[0][2].world,[0,0,HAND_FL[0][2]]); }
/* VR: how far the pointing ray sits above square-to-the-handle, from the two poses (the hand frame comes from the grip pose) */
function handMeasure(h,gripHandM,rayM){ const H=h.hm; if(!H) return; const d=[-rayM[8],-rayM[9],-rayM[10]],Y=colOf(gripHandM,1),Z=colOf(gripHandM,2),a=Math.atan2(v3.dot(d,Y),v3.dot(d,Z));
  if(isFinite(a)) H.pitch=clamp(H.pitch+(clamp(a,HANDP.pitchMin,HANDP.pitchMax)-H.pitch)*.1,HANDP.pitchMin,HANDP.pitchMax); }
