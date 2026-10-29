/* =====================================================================
   WEAPONS: what Ray holds.
   VR: each hand holds one thing or makes a fist. Grip grabs (from the rack, the floor, a body) and grip again
   drops or throws. Trigger fires that hand's gun; pointing it at the floor for half a second reloads it (A/X too). Melee is physical: a fist or blade has to
   actually move fast into a body, and harder swings hit harder.
   Flat screen (testing): the right hand holds what you pick with 1-8, click uses it; the left hand keeps a knife (F).
   ===================================================================== */
const FIST=[0,-.035,-.012];
const WPN={
  fists:   {label:'Fists',melee:'blunt',reach:1.05,pts:[[0,0,0]],speed:1.5},
  bottle:  {label:'Broken bottle',build:pBottle,grip:[0,0,0],melee:'knife',bleed:.8,sever:.4,uses:6,reach:1.15,pts:[[0,0,.19],[0,0,.12]],speed:1.4},
  knife:   {label:'Kitchen knife',build:pKnife,grip:[0,0,0],melee:'knife',reach:1.2,pts:[[0,0,.23],[0,0,.15]],speed:1.3},
  machete: {label:'Machete',build:pMachete,grip:[0,0,0],melee:'knife',bleed:1.35,sever:1.7,stun:1.2,push:1.3,chop:true,reach:1.45,pts:[[0,-.012,.42],[0,-.012,.3],[0,-.012,.17]],speed:1.8},
  revolver:{label:'.38 revolver',build:pRevolver,grip:[0,-.035,-.015],gun:true,cup:true,bash:{pts:[[0,.036,.14],[0,-.07,-.03]],power:.8},mag:6,rof:.3,muzzle:[0,.036,.15],axisY:.036,push:1.3,loadOne:true,snd:'revolver'},
  pistol:  {label:'9mm pistol',build:pPistol,grip:[0,-.035,-.005],gun:true,cup:true,bash:{pts:[[0,.045,.15],[0,-.08,-.02]],power:.75},mag:12,rof:.11,muzzle:[0,.045,.17],axisY:.045},
  shotgun: {label:'Pump shotgun',build:pShotgun,grip:[0,-.04,-.08],fore:[0,-.02,.24],gun:true,pump:true,bash:{pts:[[0,.02,.58],[0,-.07,-.31],[0,-.02,-.2]],power:1.35},mag:5,rof:.8,muzzle:[0,.02,.6],axisY:.02,pellets:9,spread:.05,bleed:.5,sever:.7,push:.5,loadOne:true,snd:'shotgun'},
  can:     {label:'Suppressor',build:g=>pCan(g,CAN_SPEC.pistol),grip:[0,0,0],melee:'blunt',fwd:true,reach:1.05,pts:[[0,0,.08],[0,0,-.08]],speed:1.7},
  bigcan:  {label:'Shotgun suppressor',build:g=>pCan(g,CAN_SPEC.shotgun),grip:[0,0,0],melee:'blunt',fwd:true,reach:1.1,pts:[[0,0,.2],[0,0,-.2]],speed:1.9},
  smg:     {label:'MP5',build:pSMG,grip:[0,-.07,-.07],fore:[0,-.03,.12],gun:true,bash:{pts:[[0,.012,.28],[0,-.01,-.32]],power:.95},mag:30,rof:.075,auto:true,muzzle:[0,.012,.29],axisY:.012,spread:.014,snd:'smg'}
};
const WPN_KEYS=['fists','bottle','knife','machete','revolver','pistol','shotgun','smg','can','bigcan'];
const KIND_WPN={corner:'bottle',cutter:'machete',gunman:'pistol',doorman:'shotgun',enforcer:'smg',landlord:'revolver'};
function newItem(key,ammo,sup){ const w=WPN[key],a=w.gun?(ammo??w.mag):0; return {key,ammo:a,reload:0,uses:w.uses||0,cd:0,chambered:!w.pump||a>0,spent:false,pumpSt:'in',rev:false,sup:!!(sup&&CAN_SPEC[key])}; }

/* ---------- suppressors ----------
   One 9mm can fits the pistol and the MP5 (not the revolver: the cylinder gap leaks). The pump takes its own: a fat 12-gauge can
   clamped on with two hose clamps, hung low off the barrel so the bead still shows over it (No Country for Old Men).
   VR: hold the can in one hand and the gun in the other, push the can onto the muzzle and it threads on. Grip the can on the gun
   with your empty hand to unscrew it. Flat screen: V puts one on (or takes it off) the gun in your right hand.
   Suppressed: a cough instead of a bang, no flash, a little less kick. Only someone a few metres away hears it, and only as
   "what was that?", not an alarm. A round that misses still cracks into the wall where it lands, and someone near that wall comes to look. */
/* L long, R radius, cy: how far the can's centre sits below the bore (the shotgun can hangs low so the bead clears it), item: what you hold */
const CAN9={item:'can',L:.16,R:.0175,cy:0},CAN12={item:'bigcan',L:.42,R:.034,cy:-.024,clamps:true};
const CAN_SPEC={pistol:CAN9,smg:CAN9,shotgun:CAN12},GUN_SUP={pistol:3.5,smg:5,shotgun:7};
const tSupCan=tex(16,32,'#1b1c1e',g=>{ R(g,'#2b2d30',0,0,16,32); R(g,'#1b1c1e',3,0,10,32); R(g,'#3c3f43',6,0,2,32); R(g,'#2f3135',8,0,1,32); /* a soft sheen running down the tube */
  for(const y0 of [1,27]) for(let y=y0;y<y0+4;y++) for(let x=0;x<16;x++) if((x+y)&1) R(g,'#121314',x,y,1,1); /* knurled grip bands at both ends */
  R(g,'#0e0f10',0,6,16,1); R(g,'#0e0f10',0,25,16,1); grain(g,7,761); });
const mCan=M(tSupCan);
/* centred on its own middle, running along +z (the front, with the bore, at +z) */
function pCan(g,S){ const L=S.L,Rr=S.R,by=-S.cy; /* by: the bore, above the can's centre on the big one */
  mk(cyl(Rr,Rr,L-.02,S.clamps?12:10),mCan,g,0,0,-.004,Math.PI/2);
  mk(cyl(Rr-.0015,Rr,.014,S.clamps?12:10),mBlack,g,0,0,L/2-.011,Math.PI/2);                       /* front cap, chamfered */
  mk(cyl(S.clamps?.0115:.0055,S.clamps?.0115:.0055,.004,8),M(null,{color:0x060606,double:true}),g,0,by,L/2-.002,Math.PI/2); /* bore */
  if(S.clamps){ mk(cyl(Rr*.9,Rr,.014,12),mBlack,g,0,0,-L/2+.005,Math.PI/2);                       /* rear cap round the barrel */
    mk(cyl(.0135,.0135,.05,8),M(tBlued,{double:true}),g,0,by,-L/2-.012,Math.PI/2);                  /* the barrel sleeve it slides over */
    for(const z of [-L/2+.05,-L/2+.15]){ mk(cyl(Rr+.002,Rr+.002,.012,12,{open:true}),M(tSteel,{double:true}),g,0,0,z,Math.PI/2); mk(box(.012,.01,.016),mSteel,g,Rr*.72,Rr*.72,z,0,0,-.785); } } /* hose clamps with their screw housings */
  else mk(cyl(.0125,.0125,.012,8),mBlack,g,0,0,-L/2+.004,Math.PI/2);                            /* booster where it threads on */
  return g; }
const canMuzzle=(w,it)=>it&&it.sup?[w.muzzle[0],w.muzzle[1],w.muzzle[2]+CAN_SPEC[it.key].L]:w.muzzle;
function addCan(g,key){ const w=WPN[key],S=CAN_SPEC[key]; GEO_TEMP=true; const c=N(g,0,w.axisY+S.cy,w.muzzle[2]+S.L/2); pCan(c,S); GEO_TEMP=false; g.can=c; return c; }
function removeCan(g){ if(!g||!g.can) return; disposeTree(g.can); const i=g.kids.indexOf(g.can); if(i>=0) g.kids.splice(i,1); g.can=null; }
/* builds a gun (or anything) with its sights, and its can if it has one */
function buildItem(g,item){ WPN[item.key].build(g); if(WPN[item.key].gun) addSights(g,item.key); if(item.sup) addCan(g,item.key); }
function screwOn(gh,ch){ const it=gh.item; it.sup=true; if(gh.itemNode) addCan(gh.itemNode,it.key); equip(ch,null); sfx('thread'); buzz(gh.hand,.5,50); buzz(ch.hand,.6,60); }
function unscrew(h,gh){ const it=gh.item; it.sup=false; removeCan(gh.itemNode); equip(h,newItem(CAN_SPEC[it.key].item)); h.canArm=false; sfx('thread',.8); buzz(h.hand,.5,50); buzz(gh.hand,.4,40); }
/* where the can sits once it's on, in the world */
const canSeat=gh=>{ const w=WPN[gh.item.key],S=CAN_SPEC[gh.item.key]; return mulP(itemM(gh),[0,w.axisY+S.cy,w.muzzle[2]+S.L/2]); };
/* how far a point is from the can on a gun (anywhere along it, not just its middle) */
function canDist(gh,p){ const w=WPN[gh.item.key],S=CAN_SPEC[gh.item.key],Mi=itemM(gh),a=mulP(Mi,[0,w.axisY+S.cy,w.muzzle[2]]),b=mulP(Mi,[0,w.axisY+S.cy,w.muzzle[2]+S.L]),ab=v3.sub(b,a),t=clamp(v3.dot(v3.sub(p,a),ab)/v3.dot(ab,ab),0,1);
  return Math.hypot(...v3.sub(p,v3.add(a,v3.sc(ab,t))))-S.R; }
/* VR, every frame: a can held near the muzzle of the gun in your other hand threads on (after you've first moved it away from the gun) */
function tickCan(h){ if(!h.item||!WPN[h.item.key].fwd||!h.itemNode) return; const o=otherHand(h),it=o.item,S=it&&CAN_SPEC[it.key]; if(!S||S.item!==h.item.key||it.sup||!o.itemNode) { h.canArm=true; return; }
  const d=Math.hypot(...v3.sub(mulP(itemM(h),[0,0,0]),canSeat(o))); const big=S.L>.3; if(d>(big?.26:.18)) h.canArm=true; else if(h.canArm!==false&&d<(big?.09:.065)) screwOn(o,h); }
function flatToggleCan(){ const h=HANDS.R,it=h.item; if(!it||!CAN_SPEC[it.key]) return; it.sup=!it.sup; if(it.sup) addCan(h.itemNode,it.key); else removeCan(h.itemNode); sfx('thread'); }

/* ---------- hands ---------- */
function ammoTexNew(){ return tex(16,8,'#0a0b0d'); }
const UPPER_ARM=.3,FOREARM=.27,WRIST=[0,-.04,-.05]; /* metres; the wrist sits just inside the back of the fist */
function makeHand(side){ const n=N(world);
  mk(box(.072,.084,.094),M(side==='R'?tTape:tRayGlove),n,FIST[0],FIST[1],FIST[2]);
  /* the forearm is its own piece (updateArms): it runs from the wrist back to where your elbow is, so turning your wrist only turns the fist */
  const arm=N(world); mk(lathe([[-FOREARM,.05,.05],[0,.044,.044]],6),M(side==='R'?tRayArmR:tRayArmL),arm,0,0,0,Math.PI/2,0,0);
  return {side,armN:arm,hand:side==='R'?'right':'left',node:n,item:null,itemNode:null,M:m4.make(),prevPts:null,cd:0,rec:0,ammoTex:ammoTexNew(),ammoShown:-9,ammoN:null,swingT:-1,swingDone:false,vel:[0,0,0],prevPos:null}; }
const HANDS={L:makeHand('L'),R:makeHand('R')};
/* frame rate on the inside of the left wrist (VR) */
const fpsTex=tex(24,8,'#0a0b0d'); const fpsN=mk(plane(.045,.015),M(fpsTex,{unlit:true}),HANDS.L.armN,.046,0,-.05,0,Math.PI/2,0); fpsN.vis=false;
function drawFps(v){ fpsN.vis=XR.on; const g=fpsTex.c.getContext('2d'); g.fillStyle='#0a0b0d'; g.fillRect(0,0,24,8); const s=String(v); text(g,s,(24-textW(s))>>1,1,v>=68?'#7ec27a':v>=55?'#e2a33d':'#ff3b30');
  if(fpsTex.glt){ gl.bindTexture(gl.TEXTURE_2D,fpsTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,fpsTex.c); } }
function equip(h,item){
  if(h.stuck) unstick(h); if(h.support) releaseSupport(h.support); if(h.supportOf) releaseSupport(h);
  if(h.itemNode){ disposeTree(h.itemNode); const i=h.node.kids.indexOf(h.itemNode); if(i>=0) h.node.kids.splice(i,1); }
  h.item=item; h.itemNode=null; h.ammoN=null; h.prevPts=null; h.ammoShown=-9; h.itemL=null; h.itemPR=null; h.itemW=null; h.melQ=null; h.pumpSlide=0;
  const w=item&&WPN[item.key]; if(!w||!w.build) return;
  /* VR melee: turned so the handle runs through the fist and the blade comes out over the thumb (61-melee.js) */
  const a=XR.on&&w.melee&&!w.fwd?meleeAngle(item):0,c=Math.cos(a),sn=Math.sin(a),gr=w.grip,rg=[gr[0],gr[1]*c-gr[2]*sn,gr[1]*sn+gr[2]*c];
  const g=N(h.node,FIST[0]-rg[0],FIST[1]-rg[1],FIST[2]-rg[2],a,0,0); GEO_TEMP=true; w.build(g); GEO_TEMP=false; h.itemNode=g;
  h.itemPR={p:g.p.slice(),r:g.r.slice()}; h.itemL=m4.make(); m4.compose(h.itemL,g.p,g.r,[1,1,1]);
  if(w.gun){ h.ammoN=mk(plane(.032,.016),M(h.ammoTex,{unlit:true}),g,-.03,w.axisY+.012,.0,0,-Math.PI/2,0); addSights(g,item.key); if(item.sup) addCan(g,item.key); } }
/* iron sights: a rear notch and a front post on the same line as the bore, with glowing dots you can find in a dark corridor */
const mSightDot=M(null,{color:0xe2c25a,unlit:true}),mSightRear=M(null,{color:0xd8d4c4,unlit:true});
const SIGHTS={ pistol:{y:.0625,front:.145,rear:-.026,h:.007}, revolver:{y:.0475,front:.142,rear:.0,h:.008,frontY:.045}, smg:{y:.04,front:.205,rear:-.11,h:.014,hood:true}, shotgun:{y:.035,front:.59,rear:-.06,h:.006,bead:true,frontY:.032} };
function addSights(g,key){ const S=SIGHTS[key]; if(!S) return; const top=S.y+S.h;
  const fy=S.frontY??S.y;
  if(S.bead){ mk(box(.006,.006,.006),mSightDot,g,0,fy+.004,S.front); }
  else { mk(box(.004,top-fy,.006,{at:[0,(top-fy)/2,0]}),mBlack,g,0,fy,S.front); mk(box(.0042,.0028,.002),mSightDot,g,0,top-.002,S.front-.0035); }
  if(S.hood) for(const s of [-1,1]) mk(box(.003,S.h+.003,.01,{at:[0,(S.h+.003)/2,0]}),mBlack,g,s*.007,S.y,S.front);
  for(const s of [-1,1]){ mk(box(.004,S.h,.006,{at:[0,S.h/2,0]}),mBlack,g,s*.0055,S.y,S.rear); if(!S.bead) mk(box(.0018,.0022,.002),mSightRear,g,s*.0055,top-.002,S.rear-.0035); } }
const transl=p=>{ const m=m4.make(); m[12]=p[0]; m[13]=p[1]; m[14]=p[2]; return m; };
function itemM(h){ if(h.itemW) return h.itemW; const o=m4.make(); m4.mul(o,h.M,h.itemL||transl([0,0,0])); return o; }
function handPts(h){ const w=WPN[h.item?h.item.key:'fists']; if(!h.item||!h.itemNode) return [mulP(h.M,FIST)]; const Mi=itemM(h); return w.pts.map(p=>mulP(Mi,p)); }
function updateAmmoLabel(h){ const it=h.item; if(!it||!WPN[it.key].gun) return; const v=it.reload>0?-2:it.ammo,key=v*2+(it.chambered?1:0); if(key===h.ammoShown) return; h.ammoShown=key;
  const t=h.ammoTex,g=t.c.getContext('2d'); g.fillStyle='#0a0b0d'; g.fillRect(0,0,16,8); const s=v<0?'--':String(v).padStart(2,'0'),dry=WPN[it.key].pump&&!it.chambered&&v>0; text(g,s,(16-textW(s))>>1,1,v===0?'#ff3b30':dry?'#5ab0ff':'#e2a33d'); /* blue: rack it */
  if(t.glt){ gl.bindTexture(gl.TEXTURE_2D,t.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.c); } }

/* ---------- two hands on one weapon ----------
   Shotgun, SMG: grip with the free hand near the fore-end and it takes hold; the weapon then points from the back hand to the front hand.
   Pistol, revolver (cup): grip with the free hand next to the gun hand and it wraps around it. The gun still aims where the gun hand
   points; the second hand steadies it (half the recoil). Pull the hands more than ~25 cm apart, or grip again, to let go. */
const otherHand=h=>h===HANDS.R?HANDS.L:HANDS.R;
function forePt(h){ return mulP(itemM(h),WPN[h.item.key].fore); }
function cupPos(o,sg){ const G=mulP(o.M,FIST),X=colOf(o.M,0),Y=colOf(o.M,1),Z=colOf(o.M,2); return v3.add(G,v3.add(v3.sc(X,sg*.052),v3.add(v3.sc(Y,-.018),v3.sc(Z,.008)))); }
function trySupport(h){ const o=otherHand(h); if(h.item||!o.item||!(WPN[o.item.key].fore||WPN[o.item.key].cup)||o.support||!o.itemNode||o.stuck) return false;
  const w=WPN[o.item.key],p=mulP(h.M,FIST); let z=w.fore?w.fore[2]:0;
  if(w.cup){ const sg=Math.sign(v3.dot(v3.sub(p,mulP(o.M,FIST)),colOf(o.M,0)))||1; if(Math.hypot(...v3.sub(p,cupPos(o,sg)))>.16) return false; h.cupSide=sg; } /* wrap whichever side your hand came from */
  else if(w.slideGrip){ const l=mulP(rigidInv(itemM(o)),p); if(Math.hypot(l[0]-w.fore[0],l[1]-w.fore[1])>.1||l[2]<w.grip[2]+.1||l[2]>w.fore[2]+.28) return false; z=clamp(l[2],w.grip[2]+.14,w.fore[2]+.2); } /* a long handle: take it anywhere */
  else if(Math.hypot(...v3.sub(p,forePt(o)))>.2) return false;
  o.support=h; h.supportOf=o; h.supZ=z; o.melQ=null; sfx('click',.5); buzz(h.hand,.4,30); return true; }
function releaseSupport(s){ const o=s.supportOf; if(!o) return; o.support=null; s.supportOf=null; o.itemW=null;
  restoreItemNode(o); if(o.itemNode&&o.itemNode.pump) o.itemNode.pump.p[2]=.21-(o.pumpSlide||0); }
function applySupport(h){ const s=h.support; if(!s||!h.item||!h.itemNode){ h.itemW=null; return; }
  if(WPN[h.item.key].cup){ /* pistol: the support fist sits beside the gun fist, overlapping it, rolled in so it wraps the grip */
    const sg=s.cupSide||1,c=cupPos(h,sg); if(Math.hypot(...v3.sub(mulP(s.M,FIST),c))>.25){ releaseSupport(s); return; }
    const X=colOf(h.M,0),Y=colOf(h.M,1),Zh=colOf(h.M,2),co=Math.cos(.35),sn=Math.sin(.35)*sg,Xh=v3.add(v3.sc(X,co),v3.sc(Y,sn)),Yh=v3.sub(v3.sc(Y,co),v3.sc(X,sn));
    setLocal(s.node,m4.make(),fromCols(Xh,Yh,Zh,v3.sub(c,v3.add(v3.sc(Xh,FIST[0]),v3.add(v3.sc(Yh,FIST[1]),v3.sc(Zh,FIST[2])))))); return; }
  const w=WPN[h.item.key],G=mulP(h.M,FIST),S=mulP(s.M,FIST); if(Math.hypot(...v3.sub(S,G))>.9){ releaseSupport(s); return; } /* hands pulled apart: let go */
  const v=v3.sub(w.fore,w.grip),zm=norm3(v),um=norm3(v3.sub([0,1,0],v3.sc(zm,zm[1]))),xm=v3.cross(um,zm);
  const zw=norm3(v3.sub(S,G)),uh=colOf(h.M,1),uw=norm3(v3.sub(uh,v3.sc(zw,v3.dot(uh,zw)))),xw=v3.cross(uw,zw);
  let R=mm([xw,uw,zw],[[xm[0],um[0],zm[0]],[xm[1],um[1],zm[1]],[xm[2],um[2],zm[2]]]);
  /* recoil: the muzzle climbs and the gun drives back into you, both hands go with it */
  const kick=h.rec*(w.pump?.2:.07); if(kick>1e-3){ const c=Math.cos(-kick),sn=Math.sin(-kick); R=R.map(v=>rodr(v,xw,c,sn)); }
  const O=v3.sub(v3.sub(G,mv(R,w.grip)),v3.sc(zw,h.rec*(w.pump?.045:.015)));
  h.itemW=fromCols(R[0],R[1],R[2],O); setLocal(h.itemNode,h.M,h.itemW);
  /* the pump: pull the fore-end back toward you and push it home */
  let slide=0; if(w.pump){ const L0=Math.hypot(...v3.sub(w.fore,w.grip)); /* the fore-end only moves while the support hand squeezes its trigger; let go and it stays where it is */
    slide=h.pumpSlide=s.trigHeld||!XR.on?clamp(L0-Math.hypot(...v3.sub(S,G)),0,PUMP_STROKE):(h.pumpSlide||0); pumpTick(h,slide); if(h.itemNode.pump) h.itemNode.pump.p[2]=.21-slide; }
  /* the support hand cups the fore-end, angled back and down toward your elbow (its forearm follows in updateArms) */
  const fp=mulP(h.itemW,[w.fore[0],w.fore[1],(s.supZ??w.fore[2])-slide]),side=s.side==='L'?-1:1,arm=norm3(v3.add(v3.add(v3.sc(zw,-.5),[0,-.8,0]),v3.sc(xw,.25*side)));
  const Zh=v3.sc(arm,-1),Yh=norm3(v3.sub(uw,v3.sc(Zh,v3.dot(uw,Zh)))),Xh=v3.cross(Yh,Zh),org=v3.sub(fp,v3.add(v3.sc(Xh,FIST[0]),v3.add(v3.sc(Yh,FIST[1]),v3.sc(Zh,FIST[2]))));
  setLocal(s.node,m4.make(),fromCols(Xh,Yh,Zh,org)); }

/* ---------- forearms: wrist to elbow ----------
   The shoulder is guessed from your head (down 24 cm, out 18 cm, back 5 cm, turned with where you face). The elbow is solved
   from shoulder and wrist with a two-bone arm, bending down and out like a real one. The forearm runs wrist -> elbow and only
   takes the hand's twist, so a bent wrist shows as a bend at the wrist instead of swinging the whole arm. */
function updateArms(f,u,eye){
  let fx=f[0]-u[0]*f[1],fz=f[2]-u[2]*f[1]; const k=Math.hypot(fx,fz)||1; fx/=k; fz/=k; const fl=[fx,0,fz],rl=[-fz,0,fx],T=m4.make(),L=UPPER_ARM+FOREARM;
  for(const h of [HANDS.L,HANDS.R]){ const a=h.armN; a.vis=h.node.vis!==false; if(!a.vis) continue;
    m4.compose(T,h.node.p,h.node.r,[1,1,1]); const W=mulP(T,WRIST),sd=h.side==='R'?1:-1;
    const S=v3.add(eye,v3.add([0,-.24,0],v3.add(v3.sc(rl,sd*.18),v3.sc(fl,-.05))));
    const v=v3.sub(W,S),dl=Math.hypot(...v)||1,dir=v3.sc(v,1/dl),d=clamp(dl,.12,L-.005);
    const al=(UPPER_ARM*UPPER_ARM-FOREARM*FOREARM+d*d)/(2*d),ht=Math.sqrt(Math.max(0,UPPER_ARM*UPPER_ARM-al*al));
    let P=v3.add([0,-1,0],v3.add(v3.sc(rl,sd*.55),v3.sc(fl,-.2))); P=v3.sub(P,v3.sc(dir,v3.dot(P,dir))); const pl=Math.hypot(...P); P=pl>1e-4?v3.sc(P,1/pl):[0,-1,0];
    const E=v3.add(S,v3.add(v3.sc(dir,al),v3.sc(P,ht)));
    let Z=v3.sub(W,E); const zl=Math.hypot(...Z); Z=zl>1e-4?v3.sc(Z,1/zl):norm3(colOf(T,2));
    const hy=colOf(T,1); let Y=v3.sub(hy,v3.sc(Z,v3.dot(hy,Z))); const yl=Math.hypot(...Y); Y=yl>.05?v3.sc(Y,1/yl):norm3(v3.sub([0,1,0],v3.sc(Z,Z[1])));
    a.p=W; a.r=eul([v3.cross(Y,Z),Y,Z]); } }

/* ---------- sights: a dot where the barrel points, and an optional laser ---------- */
const tReticle=tex(16,16,null,g=>{ for(let y=0;y<16;y++) for(let x=0;x<16;x++){ const d=Math.hypot(x-7.5,y-7.5); if(d<3.2) R(g,d<1.8?'#ffd0c8':'#ff3b30',x,y,1,1); } }); /* the laser's spot */
const mLaser=M(null,{color:0xff2a1a,unlit:true});
for(const h of Object.values(HANDS)){ h.retN=mk(plane(.02,.02),M(tReticle,{unlit:true,cut:true,double:true}),world); h.retN.vis=false; h.laserN=mk(box(1,1,1),mLaser,world); h.laserN.vis=false; }
function updateSights(eye){
  for(const h of Object.values(HANDS)){ const on=XR.on&&!PL.dead&&h.item&&WPN[h.item.key].gun&&h.itemNode&&XR.laser; h.retN.vis=!!on; h.laserN.vis=!!on; if(!on) continue;
    const w=WPN[h.item.key],Mi=itemM(h),mz=mulP(Mi,canMuzzle(w,h.item)),d=norm3(v3.sub(mz,mulP(Mi,[0,w.axisY,0]))),wall=rayRoom(mz,d),en=rayEnemies(mz,d,wall.t),t=Math.min(en?en.t:wall.t,40),p=v3.add(mz,v3.sc(d,t));
    const Z=norm3(v3.sub(eye,p)),X=norm3(Math.abs(Z[1])>.95?[1,0,0]:v3.cross([0,1,0],Z)),Y=v3.cross(Z,X),k=clamp(Math.hypot(...v3.sub(eye,p))*.3,.15,4);
    h.retN.p=v3.add(p,v3.sc(Z,.02)); h.retN.r=eul([X,Y,Z]); h.retN.s=[k,k,1];
    if(XR.laser){ const lx=norm3(Math.abs(d[1])>.95?[1,0,0]:v3.cross([0,1,0],d)),ly=v3.cross(d,lx); h.laserN.p=v3.add(mz,v3.sc(d,t/2)); h.laserN.r=eul([lx,ly,d]); h.laserN.s=[.0022,.0022,t]; } } }

/* ---------- guns ---------- */
function fireHand(h,aim){ /* aim: optional {o,d} (flat screen fires from the eye down the crosshair) */
  const it=h.item; if(!it||!GAME.started||PL.dead) return false; const w=WPN[it.key]; if(!w.gun||it.reload>0||it.cd>0) return false;
  if(it.ammo<=0){ sfx('click'); it.cd=.25; if(!XR.on) reloadHand(h); return false; }
  if(w.pump&&!it.chambered){ sfx('click'); it.cd=.2; if(XR.on) buzz(h.hand,.2,15); return false; } /* nothing in the chamber: rack it */
  it.ammo--; it.cd=w.rof; h.rec=(w.pump?1.8:w.cup&&h.support?.5:1)*(it.sup?.8:1); sfx(it.sup?(w.pump?'suppsg':'supp'):w.snd||'gun',it.sup&&w.auto?.8:1); if(XR.on){ buzz(h.hand,1,w.pellets?150:60); if(h.support) buzz(h.support.hand,1,w.pellets?150:40); }
  if(w.pump){ it.chambered=false; it.spent=true; if(!XR.on) setTimeout(()=>{ if(h.item===it&&it.ammo>0&&!it.chambered){ it.chambered=true; it.spent=false; sfx('pump',.7); } },380); }
  const Mi=itemM(h),mz=mulP(Mi,canMuzzle(w,it)),bd=norm3(v3.sub(mz,mulP(Mi,[0,w.axisY,0]))); if(!it.sup) muzzle(mz); GAME.shotT=GAME.t;
  const o=aim?aim.o:mz,d0=aim?aim.d:bd; if(it.sup) noise([PL.x,0,PL.z],GUN_SUP[it.key]||4); else noise([PL.x,0,PL.z],GUN_LOUD[it.key]||17,{alarm:true}); /* loud, but not floor-wide: a wall or a shut door halves it */
  const n=w.pellets||1,sp=w.spread||.006,tally=new Map();
  for(let i=0;i<n;i++){ const r=bullet(o,norm3(v3.add(d0,[rnd(-sp,sp),rnd(-sp,sp),rnd(-sp,sp)])),w,h); if(r) tally.set(r.E,{n:(tally.get(r.E)||{n:0}).n+1,t:r.t}); }
  if(w.pellets){ if(!it.sup){ flash.t=.1; flash.big=true; } for(let i=0;i<(it.sup?5:10);i++) emit(mz,v3.add(v3.sc(bd,rnd(.6,2.2)),[rnd(-.3,.3),rnd(-.1,.4),rnd(-.3,.3)]),rnd(.012,.03),'dust',.9); /* smoke */
    for(const [E,r] of tally) shotgunShove(E,d0,r.n,r.t); }
  if(it.ammo===0&&!XR.on) setTimeout(()=>reloadHand(h),250);
  return true; }
function bullet(o,d,w,h){
  const wall=rayRoom(o,d),hit=rayEnemiesExact(o,d,wall.t);
  if(hit){ const p=hit.p; hitEnemy(hit.E,hit.seg,p,d,'gun',{bleed:w.bleed||1,sever:w.sever||1,push:w.push||1,pellet:!!w.pellets,dist:hit.t});
    const back=rayRoom(v3.add(p,v3.sc(d,.25)),d); if(back.t<2.6){ const wp=v3.add(v3.add(p,v3.sc(d,.25+back.t)),v3.sc(back.n,.004)); addDecal(DEC.splat,wp,back.n,rnd(.16,.3),260,back.n[1]===0?rnd(.25,.45):undefined); }
    if(hit.t<1.3) screenBlood(w.pellets?1:3); hitMarker(); if(XR.on) buzz(h.hand,.4,40); return {E:hit.E,t:hit.t}; }
  else { const p=v3.add(v3.add(o,v3.sc(d,wall.t)),v3.sc(wall.n,.004)); if(wall.b&&wall.b.onHit) wall.b.onHit(p); addDecal(DEC.hole,p,wall.n,.028,140); if(h&&h.item&&h.item.sup) noise(p,3); for(let i=0;i<(w.pellets?2:8);i++) emit(p,v3.add(v3.sc(wall.n,rnd(.6,1.6)),[rnd(-.5,.5),rnd(0,.8),rnd(-.5,.5)]),rnd(.006,.012),'dust',.8); } }
function reloadHand(h){ const it=h.item; if(!it) return; const w=WPN[it.key]; if(!w.gun||it.reload>0||it.ammo>=w.mag) return;
  it.reload=w.loadOne?.42:1.35; sfx(w.loadOne?'shell':'reload'); }
function tickItem(h,dt){ const it=h.item; h.rec=Math.max(0,h.rec-dt*7); h.cd-=dt; if(!it) return; it.cd-=dt;
  if(it.reload>0){ it.reload-=dt; if(it.reload<=0){ const w=WPN[it.key]; it.reload=0; it.ammo=w.loadOne?Math.min(w.mag,it.ammo+1):w.mag; if(w.pump&&!it.chambered&&!XR.on){ it.chambered=true; it.spent=false; sfx('pump',.7); } } } } /* VR: a loaded tube still needs racking */

/* ---------- melee ---------- */
function meleeHit(h,E,seg,p,dir,speed,bone){
  const key=h.item?h.item.key:'fists',w=WPN[key];
  if(w.gun){ const pw=clamp(speed/3.2,.45,1.6)*w.bash.power; hitEnemy(E,seg,p,dir,'blunt',{power:pw}); sfx('bash'); if(XR.on){ buzz(h.hand,1,90); if(h.support) buzz(h.support.hand,.8,70); } h.cd=.35; return; } /* pistol-whip, butt-stroke */
  const oneAxe=w.heavy&&!h.support,pk=oneAxe?.6:1;
  if(w.melee==='blunt'){ hitEnemy(E,seg,p,dir,'blunt',{power:clamp(speed/3.2,.45,1.7)}); sfx('punch'); }
  else { const segI=SEGS.indexOf(seg); hitEnemy(E,seg,p,dir,'knife',{bleed:(w.bleed||1)*pk,sever:(w.sever||1)*pk,stun:w.stun||1,push:(w.push||1)*pk,chop:!!w.chop,heavy:!!w.heavy,power:clamp(speed/3,.6,1.6)*pk}); sfx(w.chop?'chop':'stab');
    /* point-first and hard: it goes in and stays in */
    if(XR.on&&bone&&STICKS[key]&&h.itemNode&&!h.stuck&&!E.segOff.has(segI)&&enemies.includes(E)){ const Zb=norm3(colOf(itemM(h),2)),al=v3.dot(dir,Zb),part=seg[3];
      const stab=al>.45&&speed*al>(key==='knife'?1:1.4); /* any real point-first push sticks, not just a perfect thrust */
      const lodge=key==='machete'&&al<.5&&speed>3&&/chest|belly|head|thigh|neck|uarm/.test(part)&&Math.random()<.45; /* chops bite into bone and stay */
      if(stab||lodge) startStuck(h,E,bone,seg,!stab); }
    if(w.uses){ h.item.uses--; if(h.item.uses<=0){ sfx('glass'); spray(p,v3.sc(dir,-1),10,1.6,.8,'dust',.008); equip(h,null); } } }
  if(XR.on) buzz(h.hand,1,w.heavy?140:90); h.cd=w.heavy?.45:.28; }
/* VR: every frame, each striking point of each hand is swept from where it was to where it is */
function vrMelee(h,dt){
  if(h.stuck){ h.prevPts=null; return; }
  const w=WPN[h.item?h.item.key:'fists'],pts=w.gun?(h.itemNode?w.bash.pts.map(q=>mulP(itemM(h),q)):[]):handPts(h),need=w.gun?2.2:w.speed*(w.heavy&&!h.support?1.35:1);
  if(h.prevPts&&h.prevPts.length===pts.length&&h.cd<=0&&GAME.started&&!PL.dead) for(let i=0;i<pts.length;i++){ const a=h.prevPts[i],b=pts[i],d=v3.sub(b,a),len=Math.hypot(...d),speed=len/Math.max(dt,1e-3);
    if(speed<.5||len<1e-4) continue; const dir=v3.sc(d,1/len),o=v3.sub(a,v3.sc(dir,.04)),hit=rayEnemies(o,dir,len+.08,.03); if(!hit) continue;
    const ex=rayMesh(hit.E,o,dir,0,len+.09); if(!ex) continue; const p=v3.add(o,v3.sc(dir,ex.t)),seg=segFor(hit.E,ex.bone,p);
    if(speed<need){ if((h.bumpCd||0)<=0){ h.bumpCd=.25; for(const k of [seg[0],seg[1]]) kickV(hit.E.B,k,v3.sc(dir,.6),H); buzz(h.hand,.25,18); sfx('bump',.4); } break; } /* too slow: it just bumps off him */
    meleeHit(h,hit.E,seg,p,dir,speed,ex.bone); break; }
  h.prevPts=pts; }
/* flat screen: a swing that lands a moment after you click, down the crosshair */
function flatSwing(h){ if(!GAME.started||PL.dead||h.swingT>=0||h.cd>0) return; h.swingT=0; h.swingDone=false; }
function flatSwingHit(h){ const {f,eye}=camBasis(),w=WPN[h.item?h.item.key:'fists']; const hit=rayEnemies(eye,f,w.reach,.07);
  if(hit){ const c=v3.add(eye,v3.sc(f,hit.t)),ex=rayMesh(hit.E,eye,f,Math.max(0,hit.t-.05),hit.t+.4)||nearestSkin(hit.E,c,.2),p=ex?(ex.p||v3.add(eye,v3.sc(f,ex.t))):c;
    meleeHit(h,hit.E,ex?segFor(hit.E,ex.bone,p):hit.seg,p,f,w.heavy?3.6:3); screenBlood(w.melee==='blunt'?1:3); hitMarker(); }
  else { sfx('swish'); const D=doorNear(eye[0]+f[0]*.8,eye[2]+f[2]*.8,.8); if(D&&D.state==='closed'&&w.heavy) kickDoor(D); } }
function useRight(){ const h=HANDS.R; if(h.item&&WPN[h.item.key].gun) fireHand(h,(()=>{ const {f,eye}=camBasis(); return {o:eye,d:f}; })()); else flatSwing(h); }

/* ---------- things lying around: dropped, thrown, taken off the dead ---------- */
const LOOSE=[];
function addPickup(item,Mw,v,spin){ const n=N(world); GEO_TEMP=true; buildItem(n,item); GEO_TEMP=false; if(typeof mergeTree==='function') mergeTree(n); /* one or two draw calls instead of dozens */ setLocal(n,m4.make(),Mw);
  const P={item,node:n,v:v.slice(),spin:spin||[rnd(-5,5),rnd(-5,5),rnd(-5,5)],rest:false,thrown:Math.hypot(...v)>3,age:0}; LOOSE.push(P); return P; }
function removePickup(P){ const i=LOOSE.indexOf(P); if(i>=0) LOOSE.splice(i,1); disposeTree(P.node); const k=world.kids.indexOf(P.node); if(k>=0) world.kids.splice(k,1); }
function updatePickups(dt){ for(const P of LOOSE){ P.age+=dt; if(P.rest) continue; const n=P.node,old=n.p.slice();
  P.v[1]-=9.8*dt; for(let c=0;c<3;c++){ n.p[c]+=P.v[c]*dt; n.r[c]+=P.spin[c]*dt; }
  /* a thrown blade or bottle that reaches someone hurts him */
  if(P.thrown&&P.age>.05){ const d=v3.sub(n.p,old),len=Math.hypot(...d); if(len>1e-4){ const dir=v3.sc(d,1/len),hit=rayEnemies(old,dir,len+.05,.05);
    if(hit){ const ex=rayMesh(hit.E,old,dir,0,len+.1),p=ex?v3.add(old,v3.sc(dir,ex.t)):v3.add(old,v3.sc(dir,hit.t)),seg=ex?segFor(hit.E,ex.bone,p):hit.seg,w=WPN[P.item.key],sp=Math.hypot(...P.v);
      const pointFirst=w.melee==='knife'&&Math.random()<.65;
      if(pointFirst) hitEnemy(hit.E,seg,p,dir,'knife',{bleed:w.bleed||1,sever:(w.sever||1)*.6,stun:1.2,push:.8,power:clamp(sp/5,.6,1.4)}); else hitEnemy(hit.E,seg,p,dir,'blunt',{power:clamp(sp/5,.5,1.4)});
      if(pointFirst&&STICKS[P.item.key]&&ex&&sp>4&&enemies.includes(hit.E)&&!hit.E.segOff.has(SEGS.indexOf(seg))&&embedThrown(P,hit.E,ex.bone,seg,p,dir)){ sfx('stick'); hitMarker(); return updatePickups(0); } /* it sticks in him */
      if(P.item.key==='bottle'){ sfx('glass'); spray(p,v3.sc(dir,-1),12,1.5,.8,'dust',.008); removePickup(P); return updatePickups(0); }
      sfx(w.melee==='knife'?'stab':'punch'); hitMarker(); P.v=v3.sc(P.v,-.15); P.thrown=false; } } }
  const r=.04,q=[n.p[0],n.p[2]]; let floorY=r;
  for(const b of boxesAt(n.p[0],n.p[2])){ if(n.p[0]>b.x0&&n.p[0]<b.x1&&n.p[2]>b.z0&&n.p[2]<b.z1){ if(old[1]>=b.h-.02&&b.kind!=='wall'&&b.kind!=='door') floorY=Math.max(floorY,b.h+r); else if(n.p[1]<b.h&&n.p[1]>b.y0){ n.p[0]=old[0]; n.p[2]=old[2]; P.v[0]*=-.3; P.v[2]*=-.3; if(P.thrown) clatter(P); P.thrown=false; } } }
  n.p[0]=clamp(n.p[0],-RX+.05,RX-.05); n.p[2]=clamp(n.p[2],-RZ+.05,RZ-.05); n.p[1]=Math.min(n.p[1],RH-.05);
  if(n.p[1]<floorY){ n.p[1]=floorY; if(Math.abs(P.v[1])<1.2){ P.rest=true; P.thrown=false; n.r=[0,n.r[1],Math.PI/2]; } else { P.v[1]*=-.25; P.v[0]*=.5; P.v[2]*=.5; if(P.thrown) clatter(P); P.thrown=false; if(P.item.key==='bottle'&&Math.hypot(...P.v)>2.5){ sfx('glass'); removePickup(P); return updatePickups(0); } } } } }

/* a thrown thing hitting a wall or the floor: someone nearby comes to see what it was (a bottle smashing carries further) */
function clatter(P){ const p=P.node.p; noise([p[0],0,p[2]],P.item.key==='bottle'?8:5.5); sfx('bump',.5); }

/* ---------- the armory rack (test floor): every weapon on a hook, take as many as you like ---------- */
const RACK=[]; let rackN=null;
function buildRack(){ if(rackN){ disposeTree(rackN); const i=world.kids.indexOf(rackN); if(i>=0) world.kids.splice(i,1); } RACK.length=0; if(!FLOOR.test) { rackN=null; return; }
  rackN=N(world); const n=WPN_KEYS.length,z=1.9+(FLOOR.mode==='tunnel'?-3.33:0),y=1.25; GEO_TEMP=true;
  mk(box(n*.28+.2,.9,.04),M(tCrate),rackN,-11.5,y,z+.04); mk(box(n*.28+.2,.05,.06),mSteel,rackN,-11.5,y+.47,z+.02);
  const lab=tex(n*28,16,null,g=>{ WPN_KEYS.forEach((k,i)=>{ const s=['FIST','BOTL','KNIF','MACH','.38','9MM','PUMP','MP5','SUP9','SUP12'][i]; text(g,s,i*28+14-(textW(s)>>1),4,'#e8e2cf'); }); });
  mk(plane(n*.28,.16),M(lab,{unlit:true,cut:true}),rackN,-11.5,y-.36,z+.005,0,Math.PI,0);
  WPN_KEYS.forEach((k,i)=>{ const x=-11.5+(n/2-(i+.5))*.28; const hook=N(rackN,x,y+.05,z-.06,-Math.PI/2,Math.PI,0);
    if(WPN[k].build){ const gn=N(hook,0,0,k==='shotgun'||k==='bigcan'?-.22:-.08); WPN[k].build(gn); addSights(gn,k); } else mk(box(.08,.09,.09),M(tTape),hook);
    RACK.push({key:k,node:hook,x,y:y+.02,z:z-.08,taken:0}); });
  GEO_TEMP=false; }
function nearestGrabbable(p,maxD){ let best=null,bd=maxD;
  for(const e of EMB){ if(!e.handle) continue; const d=Math.hypot(...v3.sub(p,e.handle))*.8; if(d<bd){ bd=d; best={emb:e}; } } /* a blade left in someone */
  for(const R of RACK){ if(R.taken>0) continue; const d=Math.hypot(p[0]-R.x,(p[1]-R.y)*.6,p[2]-R.z); if(d<bd){ bd=d; best={rack:R}; } }
  for(const P of LOOSE){ const q=P.node.p,d=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]); if(d<bd){ bd=d; best={pick:P}; } }
  return best; }
function grabOrDrop(h){
  if(h.stuck){ leaveEmbedded(h); return; } /* let go of a blade that's in him: it stays in him */
  if(h.grab){ endGrab(h.grab,Math.hypot(...h.vel)>1.5?v3.sc(h.vel,1.1):null); return; } /* let go of him, or throw him */
  if(h.supportOf){ releaseSupport(h); sfx('click',.4); return; }
  if(!h.item){ const o=otherHand(h); if(o.item&&o.item.sup&&o.itemNode&&canDist(o,mulP(h.M,FIST))<.05){ unscrew(h,o); return; } } /* take the can off */
  if(!h.item&&trySupport(h)) return;
  if(!h.item&&tryGrabBody(h)) return;
  if(h.item){ /* let go: it falls, or flies if the hand was moving */
    if(h.itemNode){ const Mi=itemM(h); h.canArm=true; addPickup(h.item,Mi,h.vel,Math.hypot(...h.vel)>3?[rnd(-2,2),rnd(-12,12),rnd(-2,2)]:null); }
    equip(h,null); sfx('swish',.4); return; }
  const g=nearestGrabbable(mulP(h.M,FIST),.26); if(!g) return;
  if(g.rack){ if(g.rack.key==='fists') return; equip(h,newItem(g.rack.key)); g.rack.taken=.8; g.rack.node.vis=false; }
  else if(g.emb) takeEmbedded(h,g.emb);
  else { equip(h,g.pick.item); removePickup(g.pick); }
  sfx('click',.6); buzz(h.hand,.5,40); }
function tickRack(dt){ for(const R of RACK) if(R.taken>0){ R.taken-=dt; if(R.taken<=0) R.node.vis=true; } }

/* doors: kick one in (loud), or a heavy weapon breaks through */
function kickDoor(D){ D.loud=true; setDoor(D,'open'); sfx('doorkick'); alertAll([D.x,0,D.side]); }
