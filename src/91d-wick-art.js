/* =====================================================================
   WICK stage 1: the art view. ?wick=1&art=1 loads the club (91c) with the cast standing in it, so the screenshots for the art gate
   (plan 3.5) show exactly what the game draws. ?wick=1 without art=1 still loads floor 01 (the stress test).
   ===================================================================== */
const WKART={on:WICK.on&&new URLSearchParams(location.search).get('art')==='1',cast:[]};
function wkBoot(){ if(!WKART.on) return false; wkLoad(); return true; }
function wkLoad(){ PL.y=0; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); wkBuild(); resetGame(); protoEmit('load'); if(XR.on) vrRecenter(); }
function wkReset(){ if(typeof wkCastPlace==='function') wkCastPlace(); if(typeof wkKit==='function') wkKit(); }
/* the shot tool: {hands:false} takes your hands out of the picture */
function wkShotSet(o){ o=o||{}; const {f,r,u,eye}=camBasis(),at=(a,b,c)=>v3.add(eye,v3.add(v3.sc(r,a),v3.add(v3.sc(u,b),v3.sc(f,c))));
  window.__hand=!o.hands?{R:{p:[0,-60,0]},L:{p:[0,-60,0]}}:o.hands==='gun'?{R:{p:at(.05,-.085,.3),pitch:.04},L:{p:[0,-60,0]}}:{R:{p:at(.13,-.12,.4),pitch:.05},L:{p:at(-.12,-.1,.3),pitch:.85}}; }

/* ---------- who stands where (stage 1: posed, not alive; stage 4 makes them enemies) ---------- */
const WK_PLACE=[ /* id, x, z, facing (0 = +z, north), pose */
  ['wk_floor1',-2.9,-.9,Math.PI,'fight'],['wk_guard1',-1.75,-.7,Math.PI,'fight'],['wk_boss',-.6,-1.1,Math.PI,'fight'],['wk_guard2',.55,-.7,Math.PI,'fight'],['wk_door1',1.75,-.9,Math.PI,'fight'],
  ['wk_floor2',-4.1,3.55,-.5,'lean'],['wk_floor3',2.2,3.5,2.6,'watch'],['wk_door2',5.6,1.0,-1.9,'watch'],
  ['wk_floor4',11.7,.9,-.7,'watch'],['wk_cook',-9.3,-2.2,-2.55,'watch'] ];
function wkCastPlace(){ if(WKART.root){ disposeTree(WKART.root); const i=world.kids.indexOf(WKART.root); if(i>=0) world.kids.splice(i,1); } WKART.root=N(world); WKART.cast.length=0;
  GEO_TEMP=true; for(const [id,x,z,ry,pose] of WK_PLACE){ const slot=N(WKART.root,x,0,z,0,ry,0),C=wkMakeChar(id,slot); applyPose(C,C.poses[pose]?pose:'fight'); WKART.cast.push(C); } GEO_TEMP=false; }
protoOn('tick',()=>{ if(FLOOR.mode!=='wick') return; for(const C of WKART.cast) skinUpdate(C); });

/* ---------- your hands, sleeve, watch and gun ---------- */
let WKKIT=false;
function wkKitOnce(){ if(WKKIT) return; WKKIT=true; const T=wkT(),SK='#b98a6a';
  const hF=flat(16,16,9301,SK,'skin',{grime:0}),hP=flat(16,16,9302,SK,'skin',{grime:0});
  /* the sleeve: charcoal wool, a strip of white cuff at the wrist end */
  const sl=garment(32,64,9311,(x,y)=>y<5||y>58?['#dcdad4','cotton',.2]:['#25272d','wool'],{folds:5,grime:0});
  for(const h of [HANDS.R,HANDS.L]){ h.hm.mats[0].tex=hF; h.hm.mats[1].tex=hP; (function w(n){ if(n.mesh) for(const m of n.mesh.mats) m.tex=sl; n.kids.forEach(w); })(h.armN); }
  /* a steel watch on the left wrist; the frame rate (and the bullet time meter, stage 2) sits on its face */
  const a=HANDS.L.armN,st=M(T.steel,{color:0xd0d6da}),bk=M(null,{color:0x08080a});
  mk(box(.086,.078,.02),bk,a,0,0,-.07); mk(box(.012,.05,.05),st,a,.034,0,-.07); mk(box(.006,.012,.012),st,a,.036,.03,-.07); }
function wkKit(){ wkKitOnce(); equip(HANDS.R,newItem('pistol',undefined,true)); equip(HANDS.L,null); }
if(WICK.on) protoOn('reset',()=>{ if(FLOOR.mode!=='wick') wkKitOnce(); });
