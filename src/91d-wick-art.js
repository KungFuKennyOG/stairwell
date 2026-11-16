/* =====================================================================
   WICK stage 1: the art view. ?wick=1&art=1 loads the club (91c) with the cast standing in it, so the screenshots for the art gate
   (plan 3.5) show exactly what the game draws. ?wick=1 without art=1 still loads floor 01 (the stress test).
   ===================================================================== */
const WKART={on:WICK.on&&new URLSearchParams(location.search).get('art')==='1',old:new URLSearchParams(location.search).get('oldcast')==='1',cast:[]};
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
  GEO_TEMP=true; for(const [id,x,z,ry,pose] of WK_PLACE){ const slot=N(WKART.root,x,0,z,0,ry,0),C=WKART.old?wkMakeChar(id,slot):wkFig(WKF[id],slot); /* &oldcast=1: the first pass, on the tower's body, to compare */ applyPose(C,C.poses[pose]?pose:'fight'); WKART.cast.push(C); } GEO_TEMP=false; }
protoOn('tick',()=>{ if(FLOOR.mode!=='wick') return; for(const C of WKART.cast) skinUpdate(C); });

/* ---------- your hands, sleeves, watch and gun ---------- */
/* the hitman's pistol: the 9 mm's shape (so sights, suppressor and holds line up), dressed in black with brass and a walnut grip */
function pWkPistol(g){ pPistol(g); const br=M(null,{color:0xd0a850,emissive:0x2c1e08}),wal=M(wkT().walnut,{color:0xb89878});
  mk(box(.0045,.0015,.15),br,g,0,.0632,.06);                                   /* a brass rib down the slide */
  mk(box(.004,.011,.034),br,g,.0138,.057,.06);                                  /* the barrel hood in the ejection port */
  mk(box(.0062,.021,.007),br,g,0,.004,.044,-.2);                                /* trigger */
  mk(box(.0305,.004,.012),br,g,0,.0635,-.034);                                  /* rear sight base */
  const gp=N(g,0,-.032,-.006,.28,0,0); mk(box(.0335,.072,.038),wal,gp,0,.004,0); mk(box(.0345,.011,.011),br,gp,0,.012,0); mk(box(.034,.006,.056),br,gp,0,-.057,0); /* grip panels, a medallion, the magazine's floor plate */
  return g; }
let WKKIT=false;
function wkKitOnce(){ if(WKKIT) return; WKKIT=true; const T=wkT();
  WPN.pistol.build=pWkPistol;
  const gF=wkInk(flat(16,16,9301,'#1b1b20','leather',{grime:0,decor:I=>{ for(const x of [3,7,11]) softLine(I,x,3,x,13,'#2c2e36',.7,1); }}),4),gK=wkInk(flat(16,16,9302,'#17171b','leather',{grime:0,decor:I=>{ for(const x of [2,6,10,14]) softEll(I,x,8,1.5,2.6,'#30323a',.8,.5); }}),4);
  /* the sleeve: black wool, a white cuff and a gold link at the wrist end */
  const sl=wkInk(wkImg(32,64,(I)=>{ wkFill(I,'#0f1014'); for(let y=0;y<64;y++) for(let x=0;x<32;x++) mul(I,x,y,.9+.2*fbm(x*.3,y*.08,9311,2)); softRect(I,0,0,32,7,'#ecebe6',1,.5); softLine(I,0,7.5,32,7.5,'#000000',.6,1); softRect(I,0,57,32,7,'#ecebe6',1,.5); softLine(I,0,56.5,32,56.5,'#000000',.6,1); for(const y of [3.5,60.5]) softEll(I,8,y,1.6,1.6,'#d8b060',1,.4); }),5);
  for(const h of [HANDS.R,HANDS.L]){ h.hm.mats[0].tex=gF; h.hm.mats[1].tex=gK; (function w(n){ if(n.mesh) for(const m of n.mesh.mats){ m.tex=sl; m.rim=1; } n.kids.forEach(w); })(h.armN); wkRim(h.node,1); }
  /* a white shirt cuff and a gold link at each wrist, so your hands read against a dark room */
  { const wh=M(null,{color:0xf0eee8,emissive:0x202020}),gd=M(null,{color:0xd8b060,emissive:0x2c1e08}); for(const h of [HANDS.R,HANDS.L]){ const ps=h.hm.ps,rt=h.hm.root; mk(box(.041,.067,.024),wh,rt,-ps*.031,0,-.099); mk(box(.006,.013,.013),gd,rt,-ps*.031-ps*.0215,-.012,-.099); mk(box(.047,.073,.03),M(null,{color:0x0d0e12}),rt,-ps*.031,0,-.127); wkRim(rt,1); } }
  /* a steel dress watch on the left wrist; the frame rate (and the bullet time meter, stage 2) sits on its face */
  const a=HANDS.L.armN,st=M(T.steel,{color:0xe0e6ea,emissive:0x14181c}),bk=M(null,{color:0x08080a});
  mk(box(.086,.078,.02),bk,a,0,0,-.07); mk(box(.012,.05,.05),st,a,.034,0,-.07); mk(box(.006,.012,.012),st,a,.036,.03,-.07); for(const k of a.kids) wkRim(k,1); }
function wkKit(){ wkKitOnce(); equip(HANDS.R,newItem('pistol',undefined,true)); equip(HANDS.L,null);
  const n=HANDS.R.itemNode; if(n){ if(n.can){ const S=CAN_SPEC.pistol,br=M(null,{color:0xd0a850,emissive:0x2c1e08}); for(const e of [-1,1]) mk(cyl(S.R+.0012,S.R+.0012,.005,10),br,n.can,0,0,e*(S.L/2-.022),Math.PI/2); } wkRim(n,1); } }
if(WICK.on) protoOn('reset',()=>{ if(FLOOR.mode!=='wick') wkKitOnce(); });
