
/* =====================================================================================================
   WAGON INTERIORS. Every car is 12 m long, 2.9 m wide, 2.45 m high, floor at y=0, front of the train at +x.
   Walls, floors and ceilings face inward and are one-sided, so the orbit camera sees in through the near
   wall and the roof; sitting inside, they are all there. Each car owns up to eight lamps.
   ===================================================================================================== */
const WL=12, WZ=1.45, WH=2.45;
const WG={};
function wplane(w,h,tu=1,tv=1){ const g=plane(w,h,Math.max(1,Math.round(w/1.5)),Math.max(1,Math.round(h/1.2))); for(let i=0;i<g.T.length;i+=2){ g.T[i]*=w/tu; g.T[i+1]*=h/tv; } return g; }
function B(g,m,x,y,z,w,h,d,ry=0,rx=0,rz=0){ return mk(box(w,h,d,{at:[0,h/2,0]}),m,g,x,y,z,rx,ry,rz); }
const C=(hex,o={})=>M(null,Object.assign({color:typeof hex==='string'?hexInt(hex):hex},o));
const U=(hex)=>M(null,{color:typeof hex==='string'?hexInt(hex):hex,unlit:true});
/* small painted materials */
function woodT(a,b,seed,vert=false){ return P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,a],[1,b]]); const r=rng(seed); for(let i=0;i<14;i++){ const p=r()*32|0; g.fillStyle=rgba('#000000',.12+r()*.1); if(vert) g.fillRect(p,0,1,h); else g.fillRect(0,p,w,1); } for(let i=0;i<5;i++){ const x=r()*w,y=r()*h; ell(g,x,y,vert?1:3,vert?3:1,rgba('#000000',.12)); } },8,seed); }
function fabT(a,b,seed,motif){ return P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,a],[1,mix(a,'#000000',.12)]]); if(motif) motif(g,w,h,b); },10,seed); }
const dots=(g,w,h,c)=>{ for(let y=2;y<h;y+=4) for(let x=(y>>2)%2?0:2;x<w;x+=4) R(g,c,x,y,1,1); };
const diamond=(g,w,h,c)=>{ poly(g,[[8,2],[13,8],[8,14],[3,8]],c); poly(g,[[8,5],[10,8],[8,11],[6,8]],mix(c,'#000000',.3)); };
const lineT=(base,line,seed)=>P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,mix(base,'#ffffff',.06)],[1,base]]); R(g,line,0,0,w,1); R(g,line,0,0,1,h); },6,seed);
function textTex(w,h,bg,lines){ return P2(w,h,(g,W_,H_)=>{ R(g,bg,0,0,W_,H_); for(const [s,x,y,c,sc] of lines) text(g,s,x==='c'?((W_-textW(s,sc||1))/2|0):x,y,c,sc||1); }); }

/* the shell: floor, ceiling, two window walls, two end walls with doors, underframe and bogies */
function shell(key,d){
  const g=N(world); g.vis=false; const lo=d.lo??.86, hi=d.hi??1.86; const side={'-1':N(g),'1':N(g)};
  mk(wplane(WL,WZ*2,d.floorTile||1,d.floorTile||1),d.floor,g,0,0,0,-Math.PI/2);
  if(d.ceil) mk(wplane(WL,WZ*2,d.ceilTile||1,d.ceilTile||1),d.ceil,g,0,WH,0,Math.PI/2);
  for(const s of [-1,1]){ const z=s*WZ, ry=s<0?0:Math.PI, wins=(d.winsBySide&&d.winsBySide[s>0?'pos':'neg'])||d.wins;
    const piece=(x0,x1,y0,y1,m)=>{ if(x1-x0<.01||y1-y0<.01) return; mk(wplane(x1-x0,y1-y0,d.wallTile||1,d.wallTile||1),m,g,(x0+x1)/2,(y0+y1)/2,z,0,ry,0); };
    piece(-WL/2,WL/2,0,lo,d.dado); piece(-WL/2,WL/2,hi,WH,d.upper);
    let x=-WL/2; for(const [a,b] of wins){ piece(x,a,lo,hi,d.pier||d.upper); x=b; } piece(x,WL/2,lo,hi,d.pier||d.upper);
    const sg=side[s]; if(d.trim) for(const [a,b] of wins){ const zt=z-s*.03; B(sg,d.trim,(a+b)/2,lo-.05,zt,b-a+.08,.07,.1); B(sg,d.trim,(a+b)/2,hi-.01,zt,b-a+.08,.05,.06); B(sg,d.trim,a,lo,zt,.05,hi-lo,.06); B(sg,d.trim,b,lo,zt,.05,hi-lo,.06); }
    if(d.rail) B(sg,d.rail,0,lo,z-s*.04,WL,.05,.07); }
  for(const e of [-1,1]){ const x=e*WL/2, ry=e<0?Math.PI/2:-Math.PI/2, m=d.end||d.upper;
    const end=e>0?d.front:d.rear;
    if(end==='windscreen'||end==='glass'){ const y0=end==='glass'?.7:1.0,y1=end==='glass'?2.3:2.05;
      mk(wplane(WZ*2,y0),d.dado,g,x,y0/2,0,0,ry,0); mk(wplane(WZ*2,WH-y1),m,g,x,(y1+WH)/2,0,0,ry,0);
      mk(wplane(.12,y1-y0),m,g,x,(y0+y1)/2,WZ-.06,0,ry,0); mk(wplane(.12,y1-y0),m,g,x,(y0+y1)/2,-WZ+.06,0,ry,0);
      B(g,d.trim||mBlack,x-e*.03,y0-.04,0,.08,.06,WZ*2); continue; }
    const pz=(z0,z1,y0,y1,mm)=>mk(wplane(z1-z0,y1-y0,d.wallTile||1,d.wallTile||1),mm,g,x,(y0+y1)/2,(z0+z1)/2,0,ry,0);
    pz(-WZ,-.48,0,WH,m); pz(.48,WZ,0,WH,m); pz(-.48,.48,2.08,WH,m);
    B(g,d.door||C('#3a3c40'),x-e*.04,0,0,.06,2.08,.96); if(d.trim) B(g,d.trim,x-e*.04,2.06,0,.08,.06,1.06); }
  B(g,C('#1c1d20'),0,-.55,0,WL,.5,WZ*2); bogie(g,-CAR_L*.34); bogie(g,CAR_L*.34);
  const W=WAGONS.find(w=>w.key===key);
  WG[key]={g,side,W,lamps:d.lamps||[],ambK:d.ambK??1,sunK:d.sunK??1,glow:d.glow||[],seat:d.seat,cam:d.cam,minLamp:d.minLamp??0,spots:{},anim:[]};
  return g; }
const lamp=(x,y,z,col,dist)=>[[x,y,z],col,dist];

/* ---------- 01 · driving cab ---------- */
(function cab(){
  const white=C('#eeeae2'), panel=M(lineT('#e6e2da','#c8c4bc',3)), dark=C('#2a3140'), red=C('#d63a2c');
  const rubber=M(P2(16,16,(g,w,h)=>{ R(g,'#3a3d42',0,0,w,h); dots(g,w,h,'#4a4e54'); },6,4),{repeat:[1,1]});
  const g=shell('cab',{floor:M(rubber.tex),floorTile:.5,ceil:white,dado:M(lineT('#c8c4bc','#a8a49c',5)),upper:panel,pier:panel,trim:C('#9aa0a6'),end:panel,door:C('#b8bcc0'),
    wins:[[1.6,2.8],[3.2,4.6]],front:'windscreen',lamps:[lamp(-3,2.2,0,[.9,.95,1.05],5),lamp(1,2.2,0,[.9,.95,1.05],5),lamp(5,1.3,0,[.25,.55,.9],2.6),lamp(-5.5,2.2,0,[.8,.85,.95],4)],
    seat:[5.2,1.2,0,-Math.PI/2],cam:{t:[2,1,0],th:.55,ph:1.0,r:8.5}});
  /* driver's desk */
  B(g,dark,5.45,0,0,1.0,.95,2.6); mk(box(.9,.08,2.5),dark,g,5.2,1.0,0,0,0,.35);
  const scr=(lines,bg)=>M(textTex(32,24,bg,lines),{unlit:true});
  const screens=[scr([['320','c',4,'#5ab8e8',2],['KM/H','c',16,'#3a7ab0']],'#0a1a2a'),scr([['H1','c',3,'#7cf06a'],['--+--','c',10,'#7cf06a'],['OK','c',17,'#7cf06a']],'#0a1a12'),scr([['ATC','c',3,'#f5c542'],['400','c',10,'#f5c542'],['KM','c',17,'#f5c542']],'#1a140a')];
  [-.75,0,.75].forEach((z,i)=>{ mk(wplane(.5,.34),screens[i],g,5.02,1.24,z,0,-Math.PI/2,0); B(g,dark,5.05,1.05,z,.05,.38,.56); });
  for(let i=0;i<6;i++) B(g,i%3?C('#f5c542'):red,5.0+(i%2)*.1,1.03,-.3+i*.12,.05,.03,.05);
  B(g,C('#1a1a1a'),4.95,1.0,.55,.06,.14,.06); B(g,red,4.95,1.14,.55,.08,.05,.08);
  /* driver's seat */
  const seat=C('#c0302a'); B(g,C('#2a2c30'),4.3,0,0,.1,.42,.1); B(g,seat,4.3,.42,0,.5,.1,.5); B(g,seat,4.05,.5,0,.1,.75,.5,0,0,-.15); B(g,seat,4.0,1.25,0,.1,.18,.32,0,0,-.15);
  /* crew area: lockers, fold seats, coffee, first aid */
  const locker=M(P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#b4bac0'],[1,'#9aa0a6']]); R(g,'#7e8488',0,0,1,h); for(let y=4;y<10;y+=2) R(g,'#7e8488',4,y,8,1); R(g,'#3a3c40',12,16,2,4); },4,6));
  for(let x=-5.4;x<1.2;x+=.62) B(g,F(C('#9aa0a6'),locker),x,0,-1.18,.6,1.9,.5);
  for(const x of [-4.5,-3.7,-2.9]){ B(g,seat,x,.45,1.2,.5,.08,.42); B(g,seat,x,.55,1.38,.5,.6,.08); }
  B(g,C('#2a2c30'),-1.6,.9,1.2,.5,.6,.42); B(g,red,-1.6,1.5,1.2,.5,.06,.42); B(g,C('#5ab8e8',{unlit:true}),-1.6,1.25,1.0,.2,.08,.02);
  const aid=M(P2(16,16,(g,w,h)=>{ R(g,'#f4f0e8',0,0,w,h); R(g,'#d63a2c',6,3,4,10); R(g,'#d63a2c',3,6,10,4); },0));
  mk(box(.4,.4,.12),F(white,aid),g,-.4,1.6,1.38,0,Math.PI,0); mk(cyl(.07,.07,.45,8),red,g,.4,.3,1.32);
  for(const x of [-4,0,3]) B(g,U('#f4f8ff'),x,WH-.04,0,1.6,.03,.18);
})();

/* ---------- 02 · Salon Imperial ---------- */
(function salon(){
  const walnut=M(woodT('#6a3a22','#4a2614',11,true)), gold=C('#c9a23a'), velvet=M(fabT('#1f6a4e','',12)), cream=C('#efe4c8');
  const damask=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#1f5a46'],[1,'#184a3a']]); for(const [x,y] of [[8,8],[24,24]]){ poly(g,[[x,y-6],[x+4,y],[x,y+6],[x-4,y]],'#2f7a5e'); ell(g,x,y,1.5,1.5,'#c9a23a'); } },6,13));
  const carpet=M(P2(32,32,(g,w,h)=>{ R(g,'#8e2430',0,0,w,h); diamond(g,16,16,'#b8862a'); poly(g,[[24,18],[30,24],[24,30],[18,24]],'#6e1a24'); poly(g,[[8,18],[14,24],[8,30],[2,24]],'#6e1a24'); },8,14));
  const coffer=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#f2e8d0'],[1,'#e2d6b8']]); R(g,'#c9a23a',0,0,w,2); R(g,'#c9a23a',0,0,2,h); R(g,'#d8ccb0',4,4,24,1); },4,15));
  const dado=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#6a3a22'],[1,'#4a2614']]); R(g,'#c9a23a',0,4,w,1); R(g,'#c9a23a',0,h-6,w,1); for(let x=4;x<w;x+=16) R(g,'#5a2e1a',x,8,8,16); },6,16));
  const g=shell('salon',{floor:carpet,floorTile:1,ceil:coffer,ceilTile:1,dado,upper:damask,pier:damask,trim:gold,end:walnut,door:walnut,rail:gold,
    wins:[[-4.6,-3.2],[-1.6,-.2],[1.2,2.6],[3.8,5.2]],lamps:[lamp(-2.5,2.0,0,[1.2,.9,.55],5.5),lamp(2.5,2.0,0,[1.2,.9,.55],5.5),lamp(-5.4,1.8,-1.2,[.9,.6,.35],3),lamp(5.4,1.8,1.2,[.9,.6,.35],3),lamp(0,1.6,1.3,[.8,.55,.32],3),lamp(0,1.6,-1.3,[.8,.55,.32],3)],
    seat:[-3.3,1.15,.75,Math.PI],cam:{t:[0,1,0],th:.5,ph:.98,r:9},ambK:.9});
  /* curtains */
  const drape=M(fabT('#8e2430','',17),{double:true});
  for(const s of [-1,1]) for(const [a,b] of [[-4.6,-3.2],[-1.6,-.2],[1.2,2.6],[3.8,5.2]]){ const sg=WG.salon.side[s]; for(const x of [a-.08,b+.08]) B(sg,drape,x,.3,s*(WZ-.1),.22,1.75,.06); B(sg,drape,(a+b)/2,1.78,s*(WZ-.1),b-a+.5,.24,.08); B(sg,gold,(a+b)/2,1.76,s*(WZ-.14),b-a+.5,.03,.03); }
  /* club chairs round low tables */
  const chair=(x,z,ry)=>{ const n=N(g,x,0,z,0,ry,0); B(n,walnut,0,0,0,.66,.12,.66); B(n,velvet,0,.12,0,.62,.3,.6); B(n,velvet,-.28,.3,0,.14,.62,.66); for(const s of [-1,1]) B(n,velvet,0,.3,s*.28,.6,.28,.12); B(n,gold,0,.42,0,.62,.02,.62); return n; };
  const table=(x,z)=>{ mk(cyl(.32,.32,.04,12),walnut,g,x,.52,z); mk(cyl(.04,.06,.5,6),gold,g,x,.26,z); mk(cyl(.05,.04,.2,8),C('#d8c8a0',{emissive:0x3a2a10}),g,x+.1,.64,z); };
  for(const [tx,tz] of [[-3.3,-.8],[-3.3,.6],[.9,-.7]]){ table(tx,tz); chair(tx-.85,tz,0); chair(tx+.85,tz,Math.PI); }
  /* grand piano */
  const lac=C('#121214'), ivory=C('#f4efe2');
  B(g,lac,3.5,.62,-.45,1.5,.3,1.1); for(const [dx,dz] of [[-.6,-.4],[.6,-.4],[0,.4]]) B(g,lac,3.5+dx,0,-.45+dz,.08,.62,.08);
  mk(box(1.4,.02,1.0),lac,g,3.55,1.15,-.6,-.6,0,0); B(g,ivory,3.5,.86,.12,1.2,.04,.18); for(let k=0;k<12;k++) B(g,lac,2.98+k*.095,.9,.06,.03,.02,.08); B(g,lac,3.5,.4,.42,.7,.08,.3);
  /* bar cabinet with decanters, at the rear */
  B(g,walnut,-5.75,0,-.6,.4,1.0,1.1); B(g,gold,-5.75,1.0,-.6,.42,.03,1.12);
  for(let k=0;k<4;k++) mk(cyl(.05,.07,.22,6),C('#b8742a',{emissive:0x2a1406}),g,-5.75,1.13,-.95+k*.22);
  /* chandeliers */
  const crystal=U('#fff4d8');
  for(const x of [-2.5,2.5]){ mk(torus(.32,.025,4,14),gold,g,x,2.05,0,Math.PI/2); B(g,gold,x,2.05,0,.03,.4,.03); for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; B(g,crystal,x+Math.cos(a)*.32,1.98,Math.sin(a)*.32,.04,.1,.04); } B(g,crystal,x,1.85,0,.08,.18,.08); }
  /* sconces */
  for(const [x,s] of [[-5.4,-1],[5.4,1],[0,1],[0,-1]]){ const sg=WG.salon.side[s]; B(sg,gold,x,1.6,s*(WZ-.05),.08,.2,.05); B(sg,crystal,x,1.7,s*(WZ-.1),.12,.12,.08); }
  WG.salon.spots={boss:{x:-2.45,z:-.8,ry:-Math.PI/2,pose:'sit'}};
})();

/* ---------- 03 · Moonlight Sleeper ---------- */
(function sleeper(){
  const indigo=M(lineT('#2b2f5a','#22264a',21)), lav=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#a898cc'],[1,'#8c7cb8']]); for(let y=4;y<h;y+=8) for(let x=(y>>3)%2?0:8;x<w;x+=16){ ell(g,x+4,y,1.5,1.5,'#c8b8e4'); ell(g,x+4.6,y-.4,1.2,1.2,'#a898cc'); } },6,22));
  const sky=M(P2(32,32,(g,w,h)=>{ R(g,'#1a1c3c',0,0,w,h); const r=rng(23); for(let i=0;i<10;i++) R(g,'#e8d890',r()*w|0,r()*h|0,1,1); },4,23)), brass=C('#d6b46a');
  const floor=M(woodT('#4a3226','#3a261c',24));
  const g=shell('sleeper',{floor,floorTile:.8,ceil:sky,dado:indigo,upper:lav,pier:lav,trim:brass,end:indigo,door:C('#2b2f5a'),
    winsBySide:{pos:[[-5.4,-4.6],[-4.0,-3.2],[-2.6,-1.8],[-1.2,-.4],[.2,1.0],[1.6,2.4],[3.0,3.8],[4.4,5.2]],neg:[[-5.2,-4.2],[-2.8,-1.8],[-.4,.6],[2.0,3.0],[4.4,5.4]]},
    lamps:[lamp(-4,1.9,.8,[1.0,.75,.5],3.2),lamp(0,1.9,.8,[1.0,.75,.5],3.2),lamp(4,1.9,.8,[1.0,.75,.5],3.2),lamp(-4.8,1.4,-.8,[.8,.6,.45],2.4),lamp(-.0,1.4,-.8,[.8,.6,.45],2.4),lamp(4.8,1.4,-.8,[.8,.6,.45],2.4)],
    seat:[-5.2,1.6,.75,0],cam:{t:[0,1,0],th:.45,ph:.92,r:9},ambK:.8,minLamp:.55});
  /* corridor runner and handrail */
  mk(wplane(WL,.8,1,1),M(P2(16,16,(g,w,h)=>{ R(g,'#2f6a6a',0,0,w,h); R(g,'#d6b46a',0,1,w,1); R(g,'#d6b46a',0,h-2,w,1); },6,25)),g,0,.005,.75,-Math.PI/2);
  B(WG.sleeper.side[1],brass,0,1.0,WZ-.06,WL,.04,.04);
  /* partition with compartment doors */
  const zP=-.15, dw=.72, comps=[-4.8,-2.4,0,2.4,4.8];
  const wallM=M(lineT('#3a3e6a','#2b2f5a',26),{double:true});
  let x=-WL/2; comps.forEach((cx,i)=>{ const a=cx-dw/2,b=cx+dw/2; mk(wplane(a-x,WH),wallM,g,(x+a)/2,WH/2,zP); mk(wplane(dw,WH-2.0),wallM,g,cx,2.0+(WH-2.0)/2,zP); x=b;
    const open=i===1||i===3; B(g,C('#33386a'),open?cx+dw*.8:cx,0,zP+.04,dw,2.0,.04);
    const plate=M(textTex(16,8,'#d6b46a',[[String(11+i),'c',2,'#2b2f5a']]),{unlit:false}); mk(box(.2,.1,.02),F(brass,plate),g,cx,2.1,zP+.05);
    if(i<4) mk(wplane(1.3,WH),wallM,g,cx+1.2,WH/2,-.8,0,Math.PI/2,0); });
  mk(wplane(WL/2-x,WH),wallM,g,(x+WL/2)/2,WH/2,zP);
  /* bunks, quilts, lamps */
  const quilt=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#9c8cc4'],[1,'#7c6ca8']]); for(let k=0;k<w;k+=4) R(g,'#b8a8dc',k,0,1,h); },8,27)), linen=C('#f0e6d8'), wood=M(woodT('#5a3a28','#3a2418',28));
  comps.forEach(cx=>{ for(const [y,lift] of [[.38,0],[1.38,1]]){ B(g,wood,cx,y,-1.08,1.95,.1,.72); B(g,quilt,cx-.1,y+.1,-1.08,1.7,.14,.68); B(g,linen,cx+.82,y+.1,-1.08,.3,.12,.5); }
    B(g,wood,cx+.97,0,-1.08,.05,1.7,.72); B(g,wood,cx,1.95,-1.08,1.95,.06,.72); B(g,C('#d6b46a',{emissive:0x5a3a10}),cx+.3,1.0,-1.38,.1,.14,.06); });
  for(const xx of [-4.6,-1.8,1.0,3.6]) { B(WG.sleeper.side[1],brass,xx+.3,1.5,WZ-.05,.06,.18,.04); B(WG.sleeper.side[1],U('#ffe0a8'),xx+.3,1.62,WZ-.08,.12,.1,.06); }
  WG.sleeper.spots={sisterA:{x:-1.2,z:.75,ry:Math.PI/2,pose:'fight'},sisterB:{x:2.0,z:.75,ry:-Math.PI/2,pose:'fight'}};
})();

/* ---------- 04 · Club Hotaru ---------- */
(function bar(){
  const lac=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#1c1824'],[1,'#100e16']]); R(g,'#2a2436',0,0,w,1); },4,31)), plum=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a1a3e'],[1,'#26102a']]); for(let y=0;y<h;y+=8) for(let x=(y>>3)%2?0:8;x<w;x+=16) poly(g,[[x+4,y],[x+8,y+4],[x+4,y+8],[x,y+4]],'#46204a'); },6,32));
  const check=M(P2(16,16,(g,w,h)=>{ for(let y=0;y<2;y++) for(let x=0;x<2;x++) vfill(g,x*8,y*8,8,8,(x+y)%2?[[0,'#2a1a3a'],[1,'#20142e']]:[[0,'#0e0c12'],[1,'#08070a']]); },4,33));
  const stars=M(P2(32,32,(g,w,h)=>{ R(g,'#0a0810',0,0,w,h); const r=rng(34); for(let i=0;i<14;i++) R(g,['#ff3fa4','#29e0e6','#fff0c0'][i%3],r()*w|0,r()*h|0,1,1); },0));
  const pink=U('#ff3fa4'), cyan=U('#29e0e6'), vinyl=M(fabT('#b0182e','',35,(g,w,h)=>{ for(let x=0;x<w;x+=4) R(g,'#8a1024',x,0,1,h); })), chrome=C('#c8ccd2'), gold=C('#f5c542');
  const g=shell('bar',{floor:check,floorTile:.8,ceil:stars,dado:lac,upper:plum,pier:plum,trim:C('#2a2436'),end:lac,door:C('#1c1824'),
    wins:[[-3.6,-2.6],[-1.4,-.4],[.8,1.8],[3.0,4.0]],lamps:[lamp(-5,1.8,0,[1.6,.4,.95],5),lamp(-1.5,2.0,0,[.45,1.2,1.3],5),lamp(1.8,2.0,.8,[1.3,.35,.85],4.5),lamp(5,2.1,0,[1.5,1.0,1.3],4.5),lamp(-3.5,1.4,-.6,[1.3,.85,.45],3),lamp(.5,1.2,-.9,[.6,.4,.7],3)],
    seat:[-.2,1.1,1.0,Math.PI*.15],cam:{t:[0,1,0],th:.5,ph:.98,r:9},ambK:.45,sunK:.5,minLamp:.75});
  for(const s of [-1,1]){ B(WG.bar.side[s],pink,0,.86,s*(WZ-.02),WL,.025,.02); B(WG.bar.side[s],cyan,0,WH-.06,s*(WZ-.02),WL,.025,.02); }
  /* back bar on the rear wall: mirror, shelves, a hundred bottles, the sign */
  const mirror=C('#5a6070',{emissive:0x10121a}); mk(wplane(2.6,1.0),mirror,g,-WL/2+.02,1.45,-.25,0,Math.PI/2,0);
  const bottleCols=['#2a8a3a','#b8742a','#c83a2a','#e8e0c8','#3a6ab0','#8a3a8a','#d8b040'];
  for(const y of [1.0,1.38,1.76]){ B(g,C('#2a2436'),-5.86,y,-.25,.22,.03,2.6); const r=rng(y*100); for(let k=0;k<13;k++){ const c=bottleCols[r()*bottleCols.length|0]; mk(cyl(.035,.04,.2+r()*.1,6),C(c,{emissive:hexInt(mix(c,'#000000',.6))}),g,-5.86,y+.13,-1.4+k*.19); } }
  const sign=M(textTex(64,16,'#0a0810',[['HOTARU','c',3,'#ff3fa4',2]]),{unlit:true}); mk(box(.04,.4,1.6),F(lac,lac,lac,lac,lac),g,-5.95,2.12,-.25).mesh.mats=[sign,sign,lac,lac,lac,lac];
  mk(wplane(1.6,.4),sign,g,-WL/2+.03,2.12,-.25,0,Math.PI/2,0);
  /* the counter and stools */
  B(g,vinyl,-4.3,0,-.45,.5,1.0,2.0); B(g,C('#0e0c12'),-4.3,1.0,-.45,.62,.05,2.1); B(g,gold,-4.0,.25,-.45,.03,.03,2.0); B(g,pink,-4.03,.95,-.45,.02,.02,2.0);
  for(const z of [-1.1,-.55,0,.5]){ mk(cyl(.03,.03,.7,6),chrome,g,-3.6,.35,z); mk(cyl(.18,.18,.08,10),vinyl,g,-3.6,.74,z); mk(cyl(.16,.16,.02,10),chrome,g,-3.6,.02,z); }
  /* booths on the +z side */
  for(const bx of [-1.0,1.4]){ for(const s of [-1,1]){ B(g,vinyl,bx+s*.75,0,.95,.5,.45,1.0); B(g,vinyl,bx+s*.98,.45,.95,.12,.75,1.0); } B(g,C('#0e0c12'),bx,.72,.95,.8,.05,.9); mk(cyl(.05,.05,.7,6),chrome,g,bx,.36,.95); mk(cyl(.04,.05,.1,6),C('#f5c542',{emissive:0x5a3a10}),g,bx,.8,.95); }
  /* small round tables on the -z side */
  for(const tx of [-1.5,1.2]){ mk(cyl(.3,.3,.04,12),C('#0e0c12'),g,tx,1.05,-1.0); mk(cyl(.03,.03,1.05,6),chrome,g,tx,.52,-1.0); for(const dz of [-.1]){ mk(cyl(.16,.16,.06,10),vinyl,g,tx-.5,.72,-1.0+dz); mk(cyl(.03,.03,.72,6),chrome,g,tx-.5,.36,-1.0+dz); } }
  /* the karaoke stage at the front */
  B(g,C('#1c1824'),4.9,0,0,2.2,.26,WZ*2); B(g,pink,3.8,.24,0,.03,.03,WZ*2); B(g,cyan,3.8,.02,0,.03,.03,WZ*2);
  const tv=M(P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a1a6a'],[1,'#ff3fa4']]); for(let k=0;k<3;k++){ R(g,'#0a0810',6,8+k*8,52,5); glyphs(g,8,9+k*8,9,5,k===1?'#29e0e6':'#fff0f8',k+3,false); R(g,'#29e0e6',6,13+k*8,(k===1?30:52),1); } }),{unlit:true});
  mk(wplane(1.6,.9),tv,g,WL/2-.03,1.55,0,0,-Math.PI/2,0); B(g,C('#0a0810'),WL/2-.05,1.05,0,.06,1.0,1.75);
  mk(cyl(.012,.012,1.3,6),chrome,g,4.6,.9,0); mk(cyl(.02,.03,.12,6),C('#2a2a2e'),g,4.6,1.6,0,0,0,.4);
  for(const z of [-1.1,1.1]) B(g,C('#121014'),5.6,.26,z,.5,.8,.45);
  const ball=M(P2(16,16,(g,w,h)=>{ for(let y=0;y<h;y+=2) for(let x=0;x<w;x+=2) R(g,(x+y)%4?'#d8dce4':'#8a90a0',x,y,2,2); }),{unlit:true});
  const mb=mk(lathe([[0,.02,.02],[.06,.13,.13],[.15,.18,.18],[.24,.13,.13],[.3,.02,.02]],10),ball,g,4.4,1.95,0); B(g,chrome,4.4,2.25,0,.01,.2,.01); WG.bar.anim.push(t=>{ mb.r[1]=t*.6; });
  WG.bar.spots={velvet:{x:4.95,z:-.2,ry:-Math.PI/2,pose:'fight',y:.26}};
})();

/* ---------- 05 · Restaurant Riviere ---------- */
(function dining(){
  const coral=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#ea8670'],[1,'#d8664e']]); for(let x=0;x<w;x+=8) R(g,'#e27a62',x,0,1,h); },5,41)), cream=M(lineT('#f4efe6','#e0d8c8',42));
  const parquet=M(P2(32,32,(g,w,h)=>{ for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8){ const a=((x+y)>>3)%2; vfill(g,x,y,8,8,a?[[0,'#a87a4a'],[1,'#946836']]:[[0,'#8a5e36'],[1,'#7a5230']]); g.fillStyle='#5a3a22'; if(a) R(g,'#5a3a22',x,y,8,1); else R(g,'#5a3a22',x,y,1,8); } },6,43));
  const linen=C('#f4efe6'), teal=M(fabT('#2a7f7a','',44)), brass=C('#c99a3e'), shade=C('#f6c8a0',{emissive:0x8a5030}), steel=M(tSteel);
  const g=shell('dining',{floor:parquet,floorTile:.9,ceil:cream,dado:cream,upper:coral,pier:coral,trim:brass,end:cream,door:C('#c9a080'),rail:M(woodT('#8a5e36','#6a4428',45)),
    wins:[[-5.0,-3.8],[-3.0,-1.8],[-1.0,.2],[1.0,2.2]],
    lamps:[lamp(-4.4,1.2,-.9,[1.2,.8,.5],2.6),lamp(-2.4,1.2,-.9,[1.2,.8,.5],2.6),lamp(-.4,1.2,-.9,[1.2,.8,.5],2.6),lamp(-3.4,1.2,.95,[1.2,.8,.5],2.6),lamp(-.9,1.2,.95,[1.2,.8,.5],2.6),lamp(4.6,2.1,0,[.85,.95,1.05],4),lamp(-1.5,2.1,0,[.7,.6,.5],5)],
    seat:[-2.4,1.15,-.2,Math.PI*.5],cam:{t:[0,1,0],th:.5,ph:.98,r:9},ambK:.95});
  const chair=(x,z,ry)=>{ const n=N(g,x,0,z,0,ry,0); B(n,teal,0,.42,0,.42,.08,.42); B(n,teal,-.19,.5,0,.06,.5,.4); for(const [dx,dz] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) B(n,brass,dx,0,dz,.03,.42,.03); };
  const sprig=[C('#f2a7b8',{emissive:0x301018}),C('#ffd0dc',{emissive:0x301018})];
  const table=(x,z,w,d,seats)=>{ B(g,linen,x,.5,z,w+.1,.26,d+.1); B(g,linen,x,.76,z,w+.12,.02,d+.12); B(g,brass,x,0,z,.06,.5,.06);
    mk(cyl(.025,.03,.3,6),brass,g,x,.92,z); mk(lathe([[0,.1,.1],[.12,.05,.05]],8),shade,g,x,1.05,z);
    mk(cyl(.025,.035,.14,6),C('#e8f0f0'),g,x+.15,.84,z+.1); for(let k=0;k<4;k++) B(g,sprig[k%2],x+.13+(k%2)*.04,.95+k*.03,z+.08+(k>1?.04:0),.05,.04,.05);
    for(const [dx,dz] of seats) mk(cyl(.11,.11,.01,10),C('#ffffff'),g,x+dx*.6,.78,z+dz*.6);
    seats.forEach(([dx,dz])=>chair(x+dx,z+dz,Math.atan2(dz,-dx))); };
  for(const tx of [-4.4,-2.4,-.4]) table(tx,-.9,.8,.9,[[-.62,0],[.62,0]]);
  for(const tx of [-3.4,-.9]) table(tx,.95,.9,.7,[[-.65,0],[.65,0]]);
  /* the galley behind a pass window */
  const pw=M(lineT('#d8d4cc','#b8b4ac',46),{double:true});
  mk(wplane(WZ*2,.95),pw,g,3.3,.475,0,0,Math.PI/2,0); mk(wplane(WZ*2,.55),pw,g,3.3,2.17,0,0,Math.PI/2,0); mk(wplane(.6,.95),pw,g,3.3,1.42,-1.15,0,Math.PI/2,0); mk(wplane(.6,.95),pw,g,3.3,1.42,1.15,0,Math.PI/2,0);
  B(g,steel,3.3,.92,0,.3,.04,1.7);
  for(const s of [-1,1]){ B(g,steel,4.7,0,s*1.1,2.6,.92,.6); B(g,C('#d8dcde'),4.7,.92,s*1.1,2.62,.03,.62); }
  for(let k=0;k<3;k++){ mk(cyl(.16,.18,.22,10),steel,g,4.0+k*.6,1.06,-1.1); mk(cyl(.17,.17,.02,10),C('#2a2c2e'),g,4.0+k*.6,1.18,-1.1); }
  const blade=M(tBlade,{double:true}); for(let k=0;k<5;k++){ B(WG.dining.side[1],blade,4.0+k*.32,1.45,WZ-.05,.18,.26,.01); B(WG.dining.side[1],C('#2a1a12'),4.0+k*.32,1.71,WZ-.05,.04,.12,.03); }
  B(g,M(woodT('#c8a070','#a88050',47)),4.6,.95,1.1,.6,.05,.4); for(const x of [3.8,5.6]) B(g,U('#f4f8ff'),x,WH-.04,0,1.2,.03,.16);
  WG.dining.spots={chef:{x:4.5,z:.05,ry:-Math.PI/2,pose:'fight'}};
})();

/* ---------- 06 · Standard Class ---------- */
(function standard(){
  const panel=M(lineT('#dad6cc','#c4c0b6',51)), grey=M(lineT('#8a8e94','#7a7e84',52)), floor=M(P2(16,16,(g,w,h)=>{ R(g,'#4a4f57',0,0,w,h); const r=rng(53); for(let i=0;i<30;i++) R(g,['#5a6068','#3a3f46','#6a7078'][i%3],r()*w|0,r()*h|0,1,1); },4,53));
  const moq=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#1f6f78'],[1,'#185a62']]); for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8){ R(g,'#e0a526',x+1,y+1,3,3); R(g,'#e86a3a',x+5,y+5,2,2); } },10,54));
  const mus=M(fabT('#e0a526','',55,(g,w,h)=>{ for(let x=0;x<w;x+=4) R(g,'#c88a1a',x,0,1,h); })), white=C('#f4f2ec'), frame=C('#5a5e64'), chrome=C('#c8ccd2');
  const g=shell('standard',{floor,floorTile:.6,ceil:C('#ece8e0'),dado:grey,upper:panel,pier:panel,trim:C('#a8acb0'),end:panel,door:C('#8a8e94'),
    wins:[[-5.4,-4.5],[-4.1,-3.2],[-2.8,-1.9],[-1.5,-.6],[-.2,.7],[1.1,2.0],[2.4,3.3],[3.7,4.6]],
    lamps:[lamp(-4,2.2,0,[.9,.95,1.0],4.5),lamp(0,2.2,0,[.9,.95,1.0],4.5),lamp(4,2.2,0,[.9,.95,1.0],4.5),lamp(5.6,1.9,0,[1.0,.6,.2],2.2)],
    seat:[-.8,1.15,-.95,Math.PI/2],cam:{t:[0,1,0],th:.5,ph:.98,r:9}});
  B(g,M(P2(16,8,(g,w,h)=>{ R(g,'#3a3f46',0,0,w,h); R(g,'#e0a526',0,0,w,1); R(g,'#e0a526',0,h-1,w,1); })),0,.004,0,WL,.002,.62);
  const seatPair=(x,zc)=>{ for(const dz of [-.26,.26]){ const z=zc+dz, n=N(g,x,0,z); const fab=(Math.round(x*2)+(zc>0?1:0))%3===0?mus:moq;
      B(n,frame,0,0,0,.42,.38,.48); B(n,fab,0,.38,0,.48,.12,.48); B(n,fab,-.24,.42,0,.12,.64,.48,0,0,.08); B(n,white,-.26,.96,0,.06,.14,.34,0,0,.08); }
    for(const dz of [-.52,0,.52]) B(g,frame,x,.5,zc+dz,.44,.04,.05); };
  for(let x=-4.9;x<=4.0;x+=.9){ seatPair(x,-.86); seatPair(x,.86); }
  /* luggage racks with cases */
  const caseCols=['#d63a2c','#2a7f7a','#e0a526','#3a5aa0','#f2a0b8','#2a2c30'];
  for(const s of [-1,1]){ const sg=WG.standard.side[s]; B(sg,C('#b8c8cc',{emissive:0x101414}),0,1.98,s*1.12,WL-.4,.03,.5); B(sg,chrome,0,1.98,s*.86,WL-.4,.04,.04); const r=rng(s+60);
    for(let x=-5.4;x<5.2;){ const w=.35+r()*.4; if(r()<.7) B(sg,C(caseCols[r()*caseCols.length|0]),x+w/2,2.01,s*1.12,w,.22+r()*.12,.38); x+=w+.1+r()*.3; } }
  /* destination board over the front door */
  const dest=M(P2(96,16,(g,w,h)=>{ R(g,'#0a0806',0,0,w,h); text(g,'NEO-HANAMURA 19:45',3,2,'#ffb020',1); text(g,'NEXT LAKE ALDER',3,9,'#ff7a3a',1); }),{unlit:true});
  mk(box(.06,.26,1.5),[mBlack,dest,mBlack,mBlack,mBlack,mBlack],g,WL/2-.06,2.2,0);
  for(const x of [-4.5,-1.5,1.5,4.5]) B(g,U('#f8fbff'),x,WH-.04,0,2.2,.03,.14);
  WG.standard.spots={porter:{x:.25,z:0,ry:-Math.PI/2,pose:'fight'},salary:{x:-2.15,z:-1.12,ry:Math.PI/2,pose:'sit'},tourist:{x:-.35,z:1.12,ry:Math.PI/2,pose:'sit'},grandma:{x:1.45,z:-.6,ry:Math.PI/2,pose:'sit'}};
})();

/* ---------- 07 · Hanami tea car ---------- */
(function garden(){
  const hinoki=M(woodT('#e2c494','#cfae7a',61,true)), slat=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#d9b98a'],[1,'#c4a272']]); for(let x=0;x<w;x+=4) R(g,'#a8865a',x,0,1,h); },5,62));
  const tatami=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#c4bc84'],[1,'#b0a870']]); for(let y=0;y<h;y+=2) R(g,'#a89e66',0,y,w,1); R(g,'#2c2a26',0,0,w,2); R(g,'#2c2a26',0,0,2,h); },6,63));
  const shoji=M(P2(32,32,(g,w,h)=>{ R(g,'#f3ecdc',0,0,w,h); for(let x=0;x<w;x+=8) R(g,'#8a6a46',x,0,1,h); for(let y=0;y<h;y+=10) R(g,'#8a6a46',0,y,w,1); },3,64),{double:true});
  const lattice=M(P2(16,16,(g,w,h)=>{ R(g,'#c4a272',0,0,w,h); R(g,'#8a6a46',0,0,w,2); R(g,'#8a6a46',0,0,2,h); },4,65));
  const lac=C('#2c2a26'), red=M(fabT('#b8342a','',66)), ind=M(fabT('#2a3a6a','',67)), paper=C('#fff4dc',{unlit:true});
  const g=shell('garden',{floor:tatami,floorTile:1.8,ceil:lattice,ceilTile:.6,dado:slat,upper:hinoki,pier:hinoki,trim:C('#8a6a46'),end:hinoki,door:M(shoji.tex),
    wins:[[-4.6,-2.8],[-.9,.9],[2.8,4.6]],lamps:[lamp(-3.6,1.9,0,[1.15,.85,.55],3.8),lamp(3.6,1.9,0,[1.15,.85,.55],3.8),lamp(0,1.8,0,[1.0,.7,.7],3.2),lamp(-5.5,1.8,0,[.9,.7,.5],2.5),lamp(5.5,1.8,0,[.9,.7,.5],2.5)],
    seat:[-3.7,.8,-.9,0],cam:{t:[0,1,0],th:.5,ph:.98,r:9}});
  /* shoji panels, half drawn */
  for(const s of [-1,1]) for(const [a,b] of [[-4.6,-2.8],[2.8,4.6]]) B(WG.garden.side[s],shoji,s>0?a+.45:b-.45,.86,s*(WZ-.08),.9,1.0,.03);
  /* the cherry tree in its planter */
  const stone=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#9a948a'],[1,'#7a746a']]); const r=rng(68); for(let i=0;i<20;i++) R(g,'#6a645a',r()*w|0,r()*h|0,2,1); },8,68));
  B(g,stone,0,0,0,1.6,.42,1.3); B(g,C('#4a6a3a'),0,.42,0,1.5,.02,1.2); for(let k=0;k<5;k++) B(g,C('#8a8478'),-.55+k*.27,.44,(k%2?.35:-.4),.18,.06,.14);
  const bark=C('#4a2e26'); B(g,bark,0,.44,0,.14,1.1,.14,0,0,.06); B(g,bark,.1,1.3,0,.08,.6,.08,0,0,-.7); B(g,bark,-.1,1.35,.05,.08,.55,.08,0,0,.8);
  const pinks=['#f2a0b8','#ffc8d6','#e888a6','#fff0f4'].map(c=>C(c,{emissive:hexInt(mix(c,'#000000',.75))})); const r=rng(69);
  for(let k=0;k<26;k++){ const a=r()*Math.PI*2,d=r()*.9; B(g,pinks[k%4],Math.cos(a)*d,1.55+r()*.65,Math.sin(a)*d*.75,.32+r()*.25,.22+r()*.16,.3+r()*.22,r(),0,0); }
  /* low tables and cushions */
  for(const tx of [-3.7,3.7]) for(const tz of [-.75,.75]){ B(g,lac,tx,.28,tz,.9,.05,.55); for(const [dx,dz] of [[-.4,-.22],[.4,-.22],[-.4,.22],[.4,.22]]) B(g,lac,tx+dx,0,tz+dz,.05,.28,.05);
    for(const s of [-1,1]) B(g,(tx>0)===(s>0)?red:ind,tx+s*.65,.01,tz,.45,.08,.45); mk(cyl(.05,.06,.1,8),C('#5a7a4a'),g,tx,.38,tz); mk(cyl(.035,.03,.05,8),C('#e8e0d0'),g,tx+.18,.36,tz+.1); }
  /* paper lanterns */
  for(const x of [-3.6,-1.4,1.4,3.6]){ B(g,lac,x,2.25,0,.02,.2,.02); mk(lathe([[0,.1,.1],[.06,.17,.17],[.24,.17,.17],[.3,.1,.1]],10),paper,g,x,1.95,0); B(g,C('#b8342a',{unlit:true}),x,2.07,0,.36,.04,.36); }
  /* petals drifting inside the car */
  const pm=M(null,{unlit:true,double:true,color:0xffc8d8}), pg=plane(.05,.035);
  for(let k=0;k<26;k++){ const n=mk(pg,pm,g,0,0,0), ph=k*.77, x0=(rng(k+90)()-.5)*5, z0=(rng(k+91)()-.5)*2;
    WG.garden.anim.push(t=>{ const f=(t*.05+k/26)%1; n.p=[x0+Math.sin(t*.4+ph)*.5-f*1.2,2.2-f*2.1,z0+Math.cos(t*.3+ph)*.3]; n.r=[t+ph,t*.7,ph]; }); }
  WG.garden.spots={conductor:{x:-2.2,z:.1,ry:Math.PI/2,pose:'beg'}};
})();

/* ---------- 08 · Baggage ---------- */
(function baggage(){
  const rib=M(P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#7a7f86'],[1,'#5f646a']]); R(g,'#4a4e54',0,0,2,h); R(g,'#9aa0a6',2,0,1,h); for(let y=4;y<h;y+=8) R(g,'#3a3e44',8,y,1,1); },6,71));
  const plate=M(P2(16,16,(g,w,h)=>{ R(g,'#6b6f73',0,0,w,h); for(let y=0;y<h;y+=4) for(let x=(y>>2)%2?0:2;x<w;x+=4) R(g,'#8a8e94',x,y,2,1); },6,72));
  const crate=(lab)=>M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#ae8a56'],[1,'#94703e']]); for(let y=0;y<h;y+=8) R(g,'#6a4e2a',0,y,w,1); R(g,'#6a4e2a',0,0,2,h); R(g,'#6a4e2a',w-2,0,2,h); poly(g,[[2,2],[5,2],[w-2,h-5],[w-2,h-2],[w-5,h-2],[2,5]],'#7a5a34'); text(g,lab,(w-textW(lab))/2|0,13,'#2a1a10',1); },8,lab.length));
  const crates=[crate('H1'),crate('HR'),crate('FRAGILE'.slice(0,6)),crate('NEO')], sod=U('#ffb050'), steel=M(tSteel), dark=C('#2a2c2f'), pink=C('#f2a0b8',{emissive:0x2a0a12});
  const g=shell('baggage',{floor:plate,floorTile:.6,ceil:C('#3a3e44'),dado:rib,upper:rib,pier:rib,trim:dark,end:rib,door:C('#4a4e54'),
    wins:[[-5.2,-4.6],[4.6,5.2]],lamps:[lamp(0,2.1,0,[1.6,.8,.25],5.5),lamp(-4.5,2.0,0,[.35,.4,.5],4),lamp(4.5,2.0,0,[.35,.4,.5],4)],
    seat:[-4.6,1.4,.6,0],cam:{t:[0,1,0],th:.5,ph:.95,r:9},ambK:.55,sunK:.35,minLamp:.85});
  /* roll-up door on the +z wall */
  B(WG.baggage.side[1],M(P2(16,16,(g,w,h)=>{ for(let y=0;y<h;y+=2) vfill(g,0,y,w,2,[[0,'#a8a294'],[1,'#8a8476']]); },4,73)),0,.05,WZ-.03,3.2,2.1,.04);
  /* crates, stacked */
  const r=rng(74); for(const [x,z] of [[-4.6,-.9],[-3.7,-.95],[-4.2,.95],[3.6,-.9],[4.5,-.95],[4.4,.9]]){ let y=0; const n=1+(r()*3|0); for(let k=0;k<n;k++){ const s=.55+r()*.25; B(g,crates[(r()*4)|0],x,y,z,s,s,s,r()*.3); y+=s; } }
  /* flower boxes for the opening ceremony */
  for(let k=0;k<4;k++){ const x=-2.6+k*.62; B(g,crates[1],x,0,-1.05,.55,.35,.55); for(let j=0;j<5;j++) B(g,pink,x-.18+j*.09,.35,-1.05+(j%2?.1:-.1),.12,.14,.12,j); }
  /* motorbike strapped down */
  const bike=N(g,1.6,0,-.7,0,.1,0), tyre=C('#141416'), red=C('#c8302a');
  for(const dx of [-.6,.6]) mk(cyl(.3,.3,.1,12),tyre,bike,dx,.3,0,Math.PI/2);
  B(bike,red,0,.48,0,.7,.26,.22); B(bike,C('#121214'),-.2,.74,0,.5,.08,.24); B(bike,steel,.45,.5,0,.4,.06,.06,0,0,.9); B(bike,steel,.62,.95,0,.06,.06,.6); B(bike,C('#fff6d8',{unlit:true}),.72,.82,0,.06,.1,.1);
  /* cage */
  const mesh=M(P2(16,16,(g,w,h)=>{ for(let k=0;k<w;k+=4){ R(g,'#9aa0a6',k,0,1,h); R(g,'#9aa0a6',0,k,w,1); } }),{cut:true,double:true});
  for(const [x,z,ry] of [[3.0,1.15,0],[3.0,.25,0]]) mk(wplane(1.4,1.8),mesh,g,x,.9,z,0,ry,0); mk(wplane(.9,1.8),mesh,g,2.3,.9,.7,0,Math.PI/2,0); mk(wplane(.9,1.8),mesh,g,3.7,.9,.7,0,Math.PI/2,0);
  /* the strongbox under the lamp */
  const safe=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#2f4a3a'],[1,'#1f3428']]); R(g,'#c9a23a',1,1,w-2,1); R(g,'#c9a23a',1,h-2,w-2,1); ell(g,8,8,3,3,'#c9a23a'); ell(g,8,8,1.5,1.5,'#1f3428'); },4,75));
  B(g,F(C('#1f3428'),safe),0,0,.15,.8,.9,.7); B(g,C('#c9a23a'),.42,.45,.15,.04,.12,.04);
  B(g,dark,0,2.2,0,.04,.22,.04); mk(lathe([[0,.22,.22],[.14,.06,.06]],10),C('#2a2c2f',{double:true}),g,0,1.98,0); B(g,sod,0,1.97,0,.16,.04,.16);
  for(const [x,z] of [[-1,.9],[1,.95],[-2,.3]]) for(let k=0;k<6;k++) B(g,C('#5a5e64'),x,WH-.12-k*.1,z,.03,.08,.06,0,k%2*.5);
})();

/* ---------- 09 · Skydeck ---------- */
(function observation(){
  const carpet=M(P2(32,32,(g,w,h)=>{ R(g,'#157a8c',0,0,w,h); for(let y=0;y<h;y+=8){ g.strokeStyle='#1e8ea2'; g.lineWidth=1; g.beginPath(); for(let x=0;x<=w;x++) g.lineTo(x,y+2+Math.sin(x/w*Math.PI*4)*2); g.stroke(); } },6,81));
  const cream=M(lineT('#f0e8d8','#ddd4c2',82)), chrome=C('#c7ccd1'), leather=M(fabT('#e6dccb','',83,(g,w,h)=>{ for(let y=0;y<h;y+=5) R(g,'#cfc4b0',0,y,w,1); }));
  const g=shell('observation',{floor:carpet,floorTile:1,dado:cream,upper:cream,pier:cream,trim:chrome,end:cream,door:C('#c7ccd1'),lo:.6,hi:2.35,
    wins:[[-5.9,-4.05],[-3.95,-2.05],[-1.95,-.05],[.05,1.95],[2.05,3.95],[4.05,5.6]],rear:'glass',
    lamps:[lamp(-3,2.3,0,[1.0,.85,.65],4),lamp(2,2.3,0,[1.0,.85,.65],4)],seat:[-4.4,1.15,0,Math.PI],cam:{t:[0,1,0],th:.5,ph:.95,r:9},sunK:1.15,ambK:1.1});
  /* glass roof: chrome ribs only */
  for(let x=-5.8;x<=5.8;x+=1.0){ const n=N(g,x,0,0); for(let k=0;k<7;k++){ const a=-Math.PI/2+k/6*Math.PI, a2=-Math.PI/2+(k+1)/6*Math.PI, p=[Math.sin(a)*WZ,2.35+Math.cos(a)*.55], q=[Math.sin(a2)*WZ,2.35+Math.cos(a2)*.55];
      const len=Math.hypot(q[0]-p[0],q[1]-p[1]); mk(box(.05,len,.05),chrome,n,0,(p[1]+q[1])/2,(p[0]+q[0])/2,Math.atan2(q[0]-p[0],q[1]-p[1]),0,0); } }
  B(g,chrome,0,2.88,0,WL,.04,.06); for(const s of [-1,1]) B(WG.observation.side[s],chrome,0,2.33,s*WZ,WL,.05,.05);
  /* swivel chairs facing out */
  const chair=(x,z,ry)=>{ const n=N(g,x,0,z,0,ry,0); mk(cyl(.2,.24,.04,10),chrome,n,0,.02,0); mk(cyl(.04,.04,.36,6),chrome,n,0,.2,0); B(n,leather,0,.38,0,.56,.14,.56); B(n,leather,-.27,.5,0,.12,.55,.56,0,0,.12); for(const s of [-1,1]) B(n,leather,0,.5,s*.25,.5,.16,.08); };
  for(let x=-4.6;x<=3.6;x+=1.4){ chair(x,-.75,Math.PI/2); chair(x+.7,.75,-Math.PI/2); }
  for(let x=-3.9;x<=3.6;x+=2.8){ mk(cyl(.26,.26,.03,12),C('#f4f2ec'),g,x,.6,0); mk(cyl(.03,.03,.6,6),chrome,g,x,.3,0); }
  /* palms in chrome planters, a small coffee bar at the front */
  for(const x of [-5.4,4.9]) for(const s of [-1,1]){ mk(cyl(.22,.18,.5,10),chrome,g,x,.25,s*1.05); B(g,C('#7a5a3e'),x,.5,s*1.05,.06,.7,.06); for(let k=0;k<6;k++) mk(box(.08,.04,.6),C('#3f7a36'),g,x,1.2,s*1.05,0,k/6*Math.PI*2,.5); }
  B(g,C('#2a3a4a'),5.6,0,0,.6,1.0,1.6); B(g,chrome,5.6,1.0,0,.64,.04,1.64); mk(cyl(.08,.08,.3,8),C('#2a2c30'),g,5.6,1.19,-.4); mk(cyl(.05,.04,.08,8),C('#f4f2ec'),g,5.6,1.08,.2);
})();
