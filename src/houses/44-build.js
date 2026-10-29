
/* =====================================================================================================
   HOUSE BUILDER: floors, walls with door and window openings (cut walls get dark tops, the classic cutaway),
   roofs you can put back on, lights, and a domestic furniture kit. Everything is built facing +z.
   ===================================================================================================== */
const WH=2.6, WT=.12, HOUSES=N(world);
const mCap=M(null,{color:0x1a1716}), mFrame=M(null,{color:0x2a2420}), mWhiteTrim=M(null,{color:0xe2ddd2});
let TEXID=0; const tid=t=>t.id||(t.id=++TEXID);
const MATS=new Map(); function MT(t,o={}){ const k=tid(t)+'|'+JSON.stringify(o); if(!MATS.has(k)) MATS.set(k,M(t,o)); return MATS.get(k); }
/* one wall piece: a box whose big faces carry world-continuous UVs (u along the wall, v up the full wall height) */
function wallPiece(len,y0,y1,u0,tileW){ const g=box(len,y1-y0,WT);
  for(const fi of [4,5]) for(let k=0;k<4;k++){ const vi=fi*4+k,x=g.P[vi*3],y=g.P[vi*3+1]+(y0+y1)/2; g.T[vi*2]=(u0+x+len/2)/tileW*(fi===4?1:-1); g.T[vi*2+1]=1-y/WH; }
  return g; }
function House(key,o){ const g=N(HOUSES); g.vis=false; const roof=N(g); roof.vis=false;
  return Object.assign({key,g,roof,lights:[],chars:[],anim:[],flick:[],rooms:[],people:[]},o); }
/* a straight wall from (x0,z0) to (x1,z1), axis-aligned. a = the +z side (x walls) or +x side (z walls); b = the other side.
   holes: [{at, w, y0, y1, win, door, glass}] with `at` the world coordinate of the opening's centre along the wall */
function wall(H,x0,z0,x1,z1,a,b,holes=[],o={}){
  const alongX=Math.abs(x1-x0)>Math.abs(z1-z0), s0=alongX?Math.min(x0,x1):Math.min(z0,z1), s1=alongX?Math.max(x0,x1):Math.max(z0,z1), c=alongX?z0:x0, h=o.h||WH;
  const ma=MT(a.t,{color:a.color??0xffffff}), mb=MT(b.t,{color:b.color??0xffffff}), mats=F(mCap,ma,mb,mCap,mCap);
  const tw=1.2;
  const piece=(p0,p1,y0,y1)=>{ const len=p1-p0; if(len<.02||y1-y0<.02) return; const n=Math.max(1,Math.ceil(len/1.25));
    const rows=Math.max(1,Math.min(2,Math.round((y1-y0)/1.2))); /* rows too: lighting is per vertex, so a bulb's pool on a wall needs vertices to land on */
    for(let i=0;i<n;i++) for(let j=0;j<rows;j++){ const q0=p0+len*i/n,q1=p0+len*(i+1)/n,m=(q0+q1)/2,r0=y0+(y1-y0)*j/rows,r1=y0+(y1-y0)*(j+1)/rows; const geo=wallPiece(q1-q0,r0,r1,alongX?q0:-q1,tw);
      if(alongX) mk(geo,mats,H.g,m,(r0+r1)/2,c); else mk(geo,mats,H.g,c,(r0+r1)/2,m,0,Math.PI/2,0); } };
  const hs=holes.map(q=>Object.assign({y0:0,y1:2.1},q)).sort((p,q)=>p.at-q.at); let s=s0;
  for(const q of hs){ const p0=q.at-q.w/2,p1=q.at+q.w/2; piece(s,p0,0,h); if(q.y0>0) piece(p0,p1,0,q.y0); if(q.y1<h) piece(p0,p1,q.y1,h); s=p1;
    const cx=alongX?q.at:c, cz=alongX?c:q.at, ry=alongX?0:Math.PI/2;
    const n=N(H.g,cx,0,cz,0,ry,0);
    if(q.win||q.glass){ const gh=q.y1-q.y0; mk(plane(q.w,gh),MT(tGlassCut,{cut:true,double:true,repeat:[Math.max(1,Math.round(q.w/.8)),1]}),n,0,q.y0+gh/2,0);
      mk(box(q.w+.06,.04,WT+.08),q.glass?mFrame:mWhiteTrim,n,0,q.y0-.02,0); if(q.y1<h-.01) mk(box(q.w+.06,.04,WT+.04),q.glass?mFrame:mWhiteTrim,n,0,q.y1+.02,0);
      for(const sx of [-1,1]) mk(box(.04,gh,WT+.04),q.glass?mFrame:mWhiteTrim,n,sx*(q.w/2+.01),q.y0+gh/2,0); }
    if(q.door){ const leaf=N(n,-q.w/2+.02,0,0,0,(q.swing??1.2)*(q.flip?-1:1),0); mk(box(q.w-.04,q.y1-.02,.045,{at:[(q.w-.04)/2,(q.y1-.02)/2,0]}),F(mFrame,MT(q.doorT||tDoorWood),MT(q.doorT||tDoorWood)),leaf); }
  }
  piece(s,s1,0,h); }
/* rectangular room shell helper: floor plus the four walls, each wall given as {a,b,holes} or null to skip (shared walls are built once) */
function floor(H,x0,z0,x1,z1,t,o={}){ const w=x1-x0,d=z1-z0,tile=o.tile||1; mk(plane(w,d,Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(d))),MT(t,{repeat:[w/tile,d/tile],color:o.color??0xffffff,double:!!o.double}),H.g,(x0+x1)/2,o.y||0,(z0+z1)/2,-Math.PI/2); }
/* a floor with a rectangular hole in it (for pools): four strips around the hole */
function floorHole(H,x0,z0,x1,z1,hx0,hz0,hx1,hz1,t,o={}){ floor(H,x0,z0,x1,hz0,t,o); floor(H,x0,hz1,x1,z1,t,o); floor(H,x0,hz0,hx0,hz1,t,o); floor(H,hx1,hz0,x1,hz1,t,o); }
function room(H,name,x0,z0,x1,z1,cam){ H.rooms.push({name,c:[(x0+x1)/2,(z0+z1)/2],cam:cam||{t:[(x0+x1)/2,.6,(z0+z1)/2],th:.5,ph:.55,r:Math.max(5.5,Math.max(x1-x0,z1-z0)*1.25)}}); }
/* roofs: gable along x (ridge parallel to x), or flat slab */
function quadGeo(pts,uvs,n){ const g=new Geo(); pts.forEach((p,i)=>g.v(p,n,uvs[i])); g.I.push(0,1,2,0,2,3); g.groups.push({start:0,count:6,mi:0}); return g; }
function triGeo(pts,n){ const g=new Geo(); pts.forEach((p,i)=>g.v(p,n,[[0,0],[1,0],[.5,1]][i])); g.I.push(0,1,2); g.groups.push({start:0,count:3,mi:0}); return g; }
const tShingle=P2(32,32,(g,w,h)=>{ R(g,'#3a3634',0,0,w,h); for(let y=0;y<h;y+=4){ R(g,'#2a2624',0,y+3,w,1); for(let x=(y/4%2)*4;x<w;x+=8) R(g,'#2a2624',x,y,1,4); } },8,990);
const tTin=P2(32,32,(g,w,h)=>{ R(g,'#8a8a86',0,0,w,h); for(let x=0;x<w;x+=4){ R(g,'#a8a8a4',x,0,1,h); R(g,'#6a6a66',x+3,0,1,h); } vfill(g,0,0,w,h,[[0,'rgba(120,60,30,0)'],[1,'rgba(120,60,30,.3)']]); },6,991);
function gable(H,x0,z0,x1,z1,rise,t,oh=.45,parent,gableT=tExSiding){ const p=parent||H.roof, y=WH, xa=x0-oh, xb=x1+oh, za=z0-oh, zb=z1+oh, zm=(z0+z1)/2, yr=y+rise, m=MT(t,{double:true,repeat:[(xb-xa)/1.5,1.6]});
  const slope=Math.atan2(rise,zm-za);
  mk(quadGeo([[xa,y-.12,zb],[xb,y-.12,zb],[xb,yr,zm],[xa,yr,zm]],[[0,0],[1,0],[1,1],[0,1]],[0,Math.cos(slope),Math.sin(slope)]),m,p);
  mk(quadGeo([[xb,y-.12,za],[xa,y-.12,za],[xa,yr,zm],[xb,yr,zm]],[[0,0],[1,0],[1,1],[0,1]],[0,Math.cos(slope),-Math.sin(slope)]),m,p);
  const gm=MT(gableT,{double:true}); for(const x of [x0,x1]) mk(triGeo([[x,y,z1],[x,y,z0],[x,yr,zm]],[x<0?-1:1,0,0]),gm,p); }
function flatRoof(H,x0,z0,x1,z1,oh=.6,col=0x2a2826,parent){ mk(box(x1-x0+oh*2,.22,z1-z0+oh*2),M(null,{color:col}),parent||H.roof,(x0+x1)/2,WH+.11,(z0+z1)/2); }
/* lights: up to eight per house, each with a visible fixture */
function light(H,p,c,d,fix){ H.lights.push([p,c,d]); const i=H.lights.length-1;
  if(fix==='bulb'){ mk(cyl(.004,.004,WH-p[1]-.06,3,{at:[0,(WH-p[1])/2,0]}),mBlack,H.g,p[0],p[1],p[2]); mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),H.g,p[0],p[1],p[2]); }
  else if(fix==='pendant'){ mk(cyl(.004,.004,WH-p[1],3,{at:[0,(WH-p[1])/2,0]}),mBlack,H.g,p[0],p[1],p[2]); mk(cyl(.06,.22,.2,8,{open:true}),M(null,{color:0x2a2a2c,double:true}),H.g,p[0],p[1]+.05,p[2]); mk(box(.08,.04,.08),M(null,{color:0xfff0c8,unlit:true}),H.g,p[0],p[1]-.02,p[2]); }
  else if(fix==='tube'){ mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),H.g,p[0],WH-.04,p[2]); }
  return i; }
function flicker(H,i,f){ H.flick.push({i,f}); }

/* ---------- furniture kit ---------- */
const col=c=>M(null,{color:c});
const FX={
  sofa(g,c=0x6a5a48,w=2.1){ const m=col(c); mk(box(w,.42,.9,{at:[0,.21,0]}),m,g); mk(box(w,.5,.22),m,g,0,.64,-.34,-.12,0,0); for(const s of [-1,1]) mk(box(.2,.62,.9),m,g,s*(w/2-.1),.31,0);
    for(let i=0;i<Math.round(w/.7);i++) mk(box(w/Math.round(w/.7)-.04,.1,.62),col(c+0x060606),g,-w/2+(i+.5)*w/Math.round(w/.7),.47,.08); return {seat:.45}; },
  sectional(g,c=0x5a5e66){ FX.sofa(N(g,0,0,0),c,2.6); const n=N(g,1.6,0,.9,0,-Math.PI/2,0); FX.sofa(n,c,1.6); },
  armchair(g,c=0x6a4a3a){ const m=col(c); mk(box(.9,.42,.86,{at:[0,.21,0]}),m,g); mk(box(.9,.6,.2),m,g,0,.7,-.33,-.15,0,0); for(const s of [-1,1]) mk(box(.16,.62,.86),m,g,s*.37,.31,0); },
  coffee(g,clutter=true){ mk(box(1.1,.05,.6),mWood,g,0,.4,0); for(const [x,z] of [[-.5,-.25],[.5,-.25],[-.5,.25],[.5,.25]]) mk(box(.05,.38,.05,{at:[0,.19,0]}),mWood,g,x,0,z);
    if(clutter){ for(const [x,z] of [[-.3,.1],[-.2,-.12],[.32,.05]]) mk(cyl(.03,.035,.24,6,{at:[0,.12,0]}),M(tGlass),g,x,.42,z); mk(box(.16,.03,.12),col(0x8a8a86),g,.1,.44,.15); mk(box(.3,.02,.22),col(0x2a3a6a),g,-.05,.43,-.15,0,.4,0); } },
  crt(g,on=true){ mk(box(.7,.5,.5,{at:[0,.25,0]}),MT(tCrate),g); mk(box(.62,.48,.5),col(0x1a1a1c),g,0,.75,-.02); mk(plane(.5,.38),MT(tScreenTV,{unlit:on}),g,0,.75,.232); },
  flatTV(g,w=1.3,h=.75,y=1.3){ mk(box(w,h,.05),col(0x0e0e10),g,0,y,0); mk(plane(w-.06,h-.06),MT(tScreenTV,{unlit:true}),g,0,y,.026); mk(box(w*.9,.4,.4,{at:[0,.2,0]}),MT(tCabinetDark),g,0,0,.1); },
  table(g,w=1.6,d=.9,c){ const m=c?col(c):M(tWoodLight); mk(box(w,.05,d),m,g,0,.75,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.06,.73,.06,{at:[0,.365,0]}),mWood,g,sx*(w/2-.08),0,sz*(d/2-.08)); },
  chair(g,c=0x5a3a24){ const m=col(c); mk(box(.44,.05,.44),m,g,0,.46,0); mk(box(.44,.5,.05),m,g,0,.72,-.2); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.04,.45,.04,{at:[0,.225,0]}),m,g,sx*.19,0,sz*.19); },
  dining(g,w,d,n,tc,cc){ FX.table(g,w,d,tc); const per=Math.max(1,Math.floor(n/2)); for(let i=0;i<per;i++){ const x=-w/2+(i+.5)*w/per; FX.chair(N(g,x,0,-d/2-.32,0,0,0),cc); FX.chair(N(g,x,0,d/2+.32,0,Math.PI,0),cc); } },
  counter(g,len,ct=tCabinetW,top=tCounterTop,o={}){ mk(box(len,.88,.62,{at:[0,.44,0]}),F(MT(ct),MT(ct,{repeat:[len/.6,1]})),g); mk(box(len+.02,.05,.66),MT(top),g,0,.905,.0);
    if(o.upper!==false) mk(box(len,.7,.36,{at:[0,1.85,0]}),F(MT(ct),MT(ct,{repeat:[len/.6,1]})),g,0,0,-.13);
    if(o.sink!=null){ mk(box(.55,.04,.42),M(tSteel),g,o.sink,.93,0); mk(box(.03,.3,.03),M(tSteel),g,o.sink,1.05,-.22); }
    if(o.stove!=null) mk(box(.6,.02,.55),MT(tStove),g,o.stove,.935,.0); },
  island(g,w=2.2,d=.95,ct=tCabinetW,top=tCounterTop){ mk(box(w,.9,d,{at:[0,.45,0]}),MT(ct,{repeat:[w/.6,1]}),g); mk(box(w+.12,.05,d+.12),MT(top),g,0,.92,0); },
  fridge(g,big=false){ const w=big?.9:.72; mk(box(w,1.8,.72,{at:[0,.9,0]}),F(MT(tFridge),MT(tFridge)),g); if(big) mk(box(.01,1.6,.02),col(0x8a8478),g,0,.95,.37); },
  bed(g,quilt,w=1.5,o={}){ const L=o.len||2.0, hb=o.head??0x5a3a24; mk(box(w,.32,L,{at:[0,.16,0]}),col(0x3a2a1c),g); mk(box(w-.04,.18,L-.06,{at:[0,.41,0]}),MT(tQuiltWhite),g);
    mk(box(w,.06,L*.68),MT(quilt,{repeat:[w/1.2,L/1.4]}),g,0,.52,L*.14,o.messy?.05:0,0,o.messy?.04:0); for(const s of (w>1.1?[-1,1]:[0])) mk(box(w>1.1?w*.38:w*.7,.12,.34),MT(tQuiltWhite),g,s*w*.22,.55,-L/2+.3);
    if(hb!==null) mk(box(w+.06,1.0,.08,{at:[0,.5,0]}),col(hb),g,0,0,-L/2-.02); return {top:.5,len:L}; },
  nightstand(g,lamp=true){ mk(box(.45,.5,.4,{at:[0,.25,0]}),MT(tCabinetOak),g); if(lamp){ mk(cyl(.03,.06,.3,6,{at:[0,.15,0]}),col(0xc8b89a),g,0,.5,0); mk(cyl(.1,.14,.18,8,{open:true}),M(null,{color:0xf2e2b8,emissive:0x3a2a10,double:true}),g,0,.88,0); } },
  dresser(g,w=1.1){ mk(box(w,.85,.48,{at:[0,.425,0]}),MT(tCabinetOak,{repeat:[w/.5,1.4]}),g); },
  wardrobe(g){ FURN.wardrobe(g); },
  desk(g,glow=true,c=0x6a4a30){ mk(box(1.2,.04,.6),col(c),g,0,.74,0); for(const sx of [-1,1]) mk(box(.04,.72,.56,{at:[0,.36,0]}),col(c),g,sx*.58,0,0);
    if(glow){ mk(box(.52,.32,.03),col(0x111114),g,0,1.0,-.18); mk(plane(.48,.28),MT(tScreenTV,{unlit:true}),g,0,1.0,-.164); } FX.chair(N(g,0,0,.55,0,Math.PI,0),0x2a2a2e); },
  bookcase(g,w=1.0,h=2.0){ mk(box(w,h,.34,{at:[0,h/2,0]}),F(mWood,MT(tBooks,{repeat:[w/1,h/1]}),mWood),g); },
  lamp(g,c=0xf2e2b8){ mk(cyl(.12,.14,.03,8),mBlack,g,0,.015,0); mk(cyl(.012,.012,1.5,4,{at:[0,.75,0]}),mBlack,g); mk(cyl(.14,.22,.26,8,{open:true}),M(null,{color:c,emissive:0x4a3010,double:true}),g,0,1.58,0); },
  rug(g,w,d,t,y=.006){ mk(plane(w,d),MT(t,{repeat:[1,1]}),g,0,y,0,-Math.PI/2); },
  tub(g){ mk(box(1.6,.55,.75,{at:[0,.275,0]}),col(0xe8e6e0),g); mk(box(1.44,.02,.58),col(0x9ab0b8),g,0,.5,0); },
  toilet(g){ mk(box(.4,.42,.55,{tw:.85,td:.9,at:[0,.21,0]}),col(0xe8e6e0),g); mk(box(.4,.38,.18,{at:[0,.19,0]}),col(0xe8e6e0),g,0,.42,-.22); },
  vanity(g){ mk(box(.8,.85,.5,{at:[0,.425,0]}),MT(tCabinetW),g); mk(box(.5,.02,.36),col(0xf2f0ea),g,0,.86,0); mk(plane(.6,.7),col(0x8aa0b0),g,0,1.5,-.24); },
  washer(g){ mk(box(.6,.85,.6,{at:[0,.425,0]}),col(0xe8e6e0),g); mk(cyl(.17,.17,.02,10),col(0x3a4a5a),g,0,.5,.3,Math.PI/2,0,0); },
  poker(g){ mk(cyl(.62,.62,.06,12),MT(tFelt),g,0,.76,0); mk(cyl(.12,.25,.73,8,{at:[0,.365,0]}),mWood,g);
    const r=rng(981); for(let i=0;i<14;i++) mk(cyl(.022,.022,.012+(r()*.03),8),col([0xc8402e,0x2a4a8a,0xe8e2d4,0x1a1a1c][i%4]),g,(r()-.5)*.7,.8,(r()-.5)*.7);
    for(let i=0;i<4;i++){ const a=i*Math.PI/2+.4; mk(cyl(.032,.034,.22,6,{at:[0,.11,0]}),col(0x5a3a14),g,Math.sin(a)*.42,.79,Math.cos(a)*.42); mk(box(.12,.004,.16),col(0xece6da),g,Math.sin(a)*.3,.795,Math.cos(a)*.3,0,a,0); } },
  bar(g,len=2.6){ mk(box(len,1.05,.6,{at:[0,.525,0]}),col(0x1e1e22),g); mk(box(len+.1,.05,.7),col(0xe2ddd2),g,0,1.07,0);
    const r=rng(982); for(let i=0;i<9;i++) mk(cyl(.035,.04,.28+r()*.1,6,{at:[0,.14,0]}),col([0x3a6a3a,0x7a3a1a,0xd8d0b8,0x2a2a4a][i%4]),g,-len/2+.2+i*(len-.4)/8,1.1,-.1); },
  lowSofa(g,w=2.4,c=0xe2ded4){ const m=col(c); mk(box(w,.32,.95,{at:[0,.16,0]}),m,g); mk(box(w,.32,.2),m,g,0,.48,-.38); for(let i=0;i<3;i++) mk(box(.4,.4,.12),col([0xc8a050,0x2a4a5a,0xe8e2d4][i]),g,-w/2+.5+i*.7,.5,-.24,-.2,0,0); },
  lounger(g){ mk(box(.65,.1,1.8),col(0xe8e4dc),g,0,.3,0); mk(box(.65,.08,.7),col(0xe8e4dc),g,0,.52,-.62,-.6,0,0); for(const s of [-1,1]) for(const z of [-.7,.7]) mk(box(.04,.28,.04,{at:[0,.14,0]}),col(0xc8c4bc),g,s*.28,0,z); },
  piano(g){ mk(box(1.5,.35,1.9,{tw:1,td:1,at:[0,.85,0]}),col(0x0c0c0e),g); mk(box(1.4,.04,.15),col(0xe8e4dc),g,0,.78,.92); for(const [x,z] of [[-.6,.8],[.6,.8],[0,-.8]]) mk(box(.08,.68,.08,{at:[0,.34,0]}),col(0x0c0c0e),g,x,0,z); mk(box(1.45,.03,1.2),col(0x141416),g,0,1.25,-.1,-.5,0,0); },
  fireplace(g,stone=true,w=1.6){ const m=stone?MT(tExStone):col(0xe2ddd2); mk(box(w,1.2,.5,{at:[0,.6,0]}),m,g); mk(box(w+.2,.08,.6),mWood,g,0,1.2,0); mk(plane(w*.55,.6),MT(tFire,{unlit:true}),g,0,.4,.252); mk(box(w*.65,.06,.3),col(0x1a1a1c),g,0,.08,.3); },
  car(g,c=0x2a3a5a,kind='sedan'){ const body=col(c), win=MT(tCarWin), tire=col(0x141416); const L=kind==='pickup'?5.0:kind==='suv'?4.7:4.6, W=1.85, h=kind==='sedan'?.65:.85;
    mk(box(W,h,L,{at:[0,.35+h/2,0]}),body,g); const cabL=kind==='pickup'?1.6:kind==='suv'?3.0:2.2, cz=kind==='pickup'?.6:kind==='suv'?-.2:-.1;
    mk(box(W-.12,.55,cabL,{tw:.92,td:.82,at:[0,.35+h+.275,0]}),F(win,win,win,body,body),g,0,0,cz); if(kind==='pickup'){ mk(box(W-.1,.3,1.9),col(c-0x0a0a0a),g,0,.35+h+.12,-1.4); mk(box(W-.3,.02,1.8),col(0x1a1a1a),g,0,.35+h-.08,-1.4); }
    for(const sx of [-1,1]) for(const sz of [-1,1]) mk(cyl(.34,.34,.24,10),tire,g,sx*(W/2-.08),.34,sz*(L/2-.85),0,0,Math.PI/2);
    for(const sx of [-1,1]){ mk(box(.28,.12,.04),M(null,{color:0xfff2c8,unlit:true}),g,sx*.65,.35+h*.6,L/2+.01); mk(box(.28,.1,.04),M(null,{color:0xc81a1a,unlit:true}),g,sx*.68,.35+h*.6,-L/2-.01); }
    mk(plane(.32,.16),MT(tPlate),g,0,.5,-L/2-.03,0,Math.PI,0); },
  trampoline(g){ mk(cyl(1.7,1.7,.04,16),col(0x141418),g,0,.8,0); mk(torus(1.75,.05,4,16),col(0x2a5a8a),g,0,.82,0,Math.PI/2,0,0); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; mk(box(.04,.8,.04,{at:[0,.4,0]}),col(0x8a8a8e),g,Math.sin(a)*1.7,0,Math.cos(a)*1.7); } },
  hoop(g){ mk(cyl(.05,.06,3,6,{at:[0,1.5,0]}),col(0x2a2a2e),g); mk(box(1.1,.75,.04),col(0xe8e4dc),g,0,3.1,.25); mk(torus(.23,.015,4,12),col(0xe8601a),g,0,2.95,.5,Math.PI/2,0,0); },
  bins(g,n=2){ for(let i=0;i<n;i++) mk(box(.6,1.05,.7,{tw:1.05,at:[0,.525,0]}),col([0x2a3a2a,0x2a3a6a,0x3a3a3c][i%3]),g,i*.7,0,0,0,(i%2)*.15,0); },
  mailbox(g){ mk(box(.06,1.1,.06,{at:[0,.55,0]}),mWood,g); mk(box(.22,.24,.46),col(0x2a2a2e),g,0,1.2,0); },
  streetlight(g){ mk(cyl(.07,.09,6,6,{at:[0,3,0]}),col(0x3a3a3c),g); mk(box(.1,.1,1.2),col(0x3a3a3c),g,0,6,.55); mk(box(.36,.1,.5),M(null,{color:0xffc070,unlit:true}),g,0,5.93,1.05); },
  tree(g,h=5,r=1.8,seed=1){ mk(cyl(.12,.18,h*.55,6,{at:[0,h*.275,0]}),MT(tBark),g); const q=rng(seed);
    for(let i=0;i<3;i++){ const y=h*.55+i*r*.5, rr=r*(1-i*.25); mk(lathe([[-rr*.5,rr*.3,rr*.3],[-rr*.15,rr,rr*.95],[rr*.35,rr*.85,rr*.8],[rr*.65,rr*.3,rr*.3]],7),MT(tLeaves,{repeat:[2,1]}),g,(q()-.5)*.4,y,(q()-.5)*.4,0,q()*3,0); } },
  pine(g,h=7,seed=1){ mk(cyl(.1,.16,h*.3,5,{at:[0,h*.15,0]}),MT(tBark),g); for(let i=0;i<3;i++){ const y=h*.2+i*h*.24, r=1.6-i*.42; mk(cyl(.05,r,h*.36,7,{at:[0,h*.18,0]}),MT(tLeaves),g,0,y,0,0,i,0); } },
  hedge(g,w,d=.7,h=1.1){ mk(box(w,h,d,{tw:.94,td:.9,at:[0,h/2,0]}),MT(tLeaves,{repeat:[w/1.2,1]}),g); },
  picket(g,len){ const m=mWhiteTrim; for(let x=-len/2;x<=len/2;x+=.16) mk(box(.08,.9,.03,{at:[0,.45,0]}),m,g,x,0,0); for(const y of [.25,.7]) mk(box(len,.06,.04),m,g,0,y,-.03); },
  chainlink(g,len){ mk(plane(len,1.4),MT(tChain,{cut:true,double:true,repeat:[len/.4,3.5]}),g,0,.7,0); for(let x=-len/2;x<=len/2+.01;x+=2.4) mk(cyl(.03,.03,1.5,5,{at:[0,.75,0]}),col(0x9aa0a0),g,x,0,0); mk(cyl(.02,.02,len,4),col(0x9aa0a0),g,0,1.42,0,0,0,Math.PI/2); },
  rail(g,len){ const m=MT(tWoodLight); for(let x=-len/2;x<=len/2+.01;x+=2.5) mk(box(.14,1.2,.14,{at:[0,.6,0]}),m,g,x,0,0); for(const y of [.45,.95]) mk(box(len,.1,.06),m,g,0,y,0); },
  pool(g,w,d){ mk(plane(w,d),MT(tWater,{unlit:true,repeat:[w/2,d/2]}),g,0,-.25,0,-Math.PI/2); mk(plane(w,d),col(0x2a8ab0),g,0,-1.2,0,-Math.PI/2);
    for(const [x,z,ww,dd] of [[0,-d/2-.2,w+.8,.4],[0,d/2+.2,w+.8,.4],[-w/2-.2,0,.4,d],[w/2+.2,0,.4,d]]) mk(box(ww,.06,dd),col(0xe2ddd2),g,x,.03,z);
    for(const [x,z,ww,dd] of [[0,-d/2,w,.04],[0,d/2,w,.04],[-w/2,0,.04,d],[w/2,0,.04,d]]) mk(box(ww,1.2,dd),col(0x3aa8c8),g,x,-.6,z); },
  bbq(g){ mk(box(.7,.5,.5),col(0x1a1a1c),g,0,.9,0); for(const sx of [-1,1]) mk(box(.04,.7,.4,{at:[0,.35,0]}),col(0x2a2a2c),g,sx*.3,0,0); mk(box(.7,.04,.5),col(0x8a3a1a,),g,0,1.16,0); },
  rocker(g){ const m=MT(tWoodLight); mk(box(.5,.05,.5),m,g,0,.45,0); mk(box(.5,.7,.05),m,g,0,.82,-.24,-.12,0,0); for(const sx of [-1,1]){ mk(box(.04,.06,.9),m,g,sx*.22,.06,0); mk(box(.04,.4,.04,{at:[0,.2,0]}),m,g,sx*.22,.05,.18); mk(box(.04,.4,.04,{at:[0,.2,0]}),m,g,sx*.22,.05,-.18); } },
  bales(g,n=4){ const r=rng(n*13); for(let i=0;i<n;i++) mk(box(1.0,.5,.55,{at:[0,.25,0]}),MT(tHay),g,(i%3)*1.05-1,Math.floor(i/3)*.5,(r()-.5)*.3,0,(r()-.5)*.2,0); },
  crates(g){ FURN.crates(g); },
  stash(g){ const m=MT(tCrate); for(let i=0;i<3;i++) mk(box(.9,.4,.55,{at:[0,.2,0]}),m,g,0,i*.42,0,0,(i%2)*.1,0); mk(box(.6,.12,.3),col(0x2a3a2a),g,.1,1.3,0); for(let i=0;i<4;i++) mk(box(.18,.1,.12),col(0xe8e4dc),g,-.25+i*.16,1.32,.2); },
  tractor(g){ mk(box(1.2,.9,2.2,{at:[0,.9,0]}),col(0x2a6a2a),g); mk(box(1.0,1.0,1.0,{at:[0,.5,0]}),col(0x1a1a1a),g,0,1.35,-.5); for(const sx of [-1,1]){ mk(cyl(.7,.7,.4,12),col(0x141416),g,sx*.8,.7,-.6,0,0,Math.PI/2); mk(cyl(.4,.4,.3,10),col(0x141416),g,sx*.7,.4,.9,0,0,Math.PI/2); } },
  bench(g,len=2){ mk(box(len,.06,.6),MT(tWoodLight),g,0,.9,0); for(const sx of [-1,1]) mk(box(.06,.9,.5,{at:[0,.45,0]}),MT(tWoodLight),g,sx*(len/2-.1),0,0); mk(box(len,1.0,.04),col(0x5a5a52),g,0,1.6,-.28); },
  safe(g){ mk(box(.8,1.6,.6,{at:[0,.8,0]}),col(0x1a1a1c),g); mk(cyl(.07,.07,.03,8),col(0xc8c4bc),g,.2,1.0,.31,Math.PI/2,0,0); },
  monitors(g){ for(let i=0;i<3;i++) for(let j=0;j<2;j++){ mk(box(.62,.38,.06),col(0x111114),g,(i-1)*.66,1.05+j*.42,-.1); mk(plane(.58,.34),MT(tScreenSec,{unlit:true}),g,(i-1)*.66,1.05+j*.42,-.068); } FX.desk(N(g,0,0,.3),false,0x2a2a2e); },
  fountain(g){ mk(cyl(1.8,1.9,.5,16,{at:[0,.25,0]}),MT(tExStone),g); mk(cyl(1.6,1.6,.02,16),MT(tWater,{unlit:true}),g,0,.42,0); mk(cyl(.2,.3,1.3,8,{at:[0,.65,0]}),MT(tExStone),g); mk(cyl(.7,.4,.15,10),MT(tExStone),g,0,1.35,0); },
  column(g,h=WH+.2){ mk(cyl(.22,.25,h,10,{at:[0,h/2,0]}),col(0xe8e2d4),g); mk(box(.6,.12,.6),col(0xe8e2d4),g,0,h,0); mk(box(.6,.12,.6),col(0xe8e2d4),g,0,.06,0); },
  stairs(g,w=1.6,steps=13,run=.28,rise=.2){ const m=MT(tFlOak); for(let i=0;i<steps;i++){ const h=(i+1)*rise; mk(box(w,h,run,{at:[0,h/2,0]}),F(MT(tWPcream),m,m,MT(tRugRed),m),g,0,0,-i*run); }
    for(const sx of [-1,1]) for(let i=0;i<steps;i+=2) mk(box(.04,.9,.04,{at:[0,.45,0]}),mWhiteTrim,g,sx*(w/2-.03),(i+1)*rise,-i*run);
    for(const sx of [-1,1]) mk(box(.06,.06,steps*run+.1),mWood,g,sx*(w/2-.03),steps*rise*.5+.9,-(steps-1)*run/2,Math.atan2(rise,run),0,0); },
  chandelier(g,y=2.2){ mk(cyl(.006,.006,WH-y,3,{at:[0,(WH-y)/2,0]}),mBlack,g,0,y,0); mk(torus(.35,.03,4,12),mGold,g,0,y,0,Math.PI/2,0,0); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; mk(box(.04,.08,.04),M(null,{color:0xfff0c8,unlit:true}),g,Math.sin(a)*.35,y+.06,Math.cos(a)*.35); } },
  strings(g,pts){ for(let k=0;k<pts.length-1;k++){ const a=pts[k],b=pts[k+1]; for(let i=0;i<=8;i++){ const t=i/8, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, y=2.6-Math.sin(t*Math.PI)*.35; mk(box(.05,.07,.05),M(null,{color:0xffd890,unlit:true}),g,x,y,z); } } },
  toys(g,seed=1){ const r=rng(seed); for(let i=0;i<7;i++) mk(box(.1+r()*.08,.08+r()*.06,.1),col([0xc8402e,0xe8c03a,0x2a6ac8,0x3aa84a][i%4]),g,(r()-.5)*1.2,.04,(r()-.5)*1.0,0,r()*3,0); },
  photo(g,w=.5,h=.4){ mk(box(w,h,.03),MT(tPhoto),g,0,0,0); },
  poster(g,t){ mk(plane(.55,.8),MT(t),g,0,0,.01); },
  antlers(g){ mk(box(.3,.4,.05),mWood,g); for(const s of [-1,1]){ mk(cyl(.015,.02,.5,4),col(0xd8ccb0),g,s*.2,.3,.1,0,0,s*.6); mk(cyl(.012,.015,.25,4),col(0xd8ccb0),g,s*.32,.45,.1,0,0,-s*.2); } },
  woodstove(g){ mk(box(.7,.7,.6,{at:[0,.35,0]}),col(0x1a1a1c),g); mk(plane(.3,.22),MT(tFire,{unlit:true}),g,0,.38,.302); mk(cyl(.08,.08,1.9,6,{at:[0,.95,0]}),col(0x1a1a1c),g,0,.7,-.15); },
  firepit(g){ for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; mk(box(.3,.25,.25),MT(tExStone),g,Math.sin(a)*.75,.12,Math.cos(a)*.75,0,a,0); } for(let i=0;i<4;i++) mk(cyl(.06,.06,.8,5),MT(tBark),g,0,.15,0,Math.PI/2,i*.8,.2); mk(lathe([[0,.35,.35],[.35,.18,.18],[.7,0,0]],6),M(null,{color:0xf2a030,unlit:true,double:true}),g); },
  floodpole(g,ry=0){ mk(cyl(.08,.1,6.2,6,{at:[0,3.1,0]}),mWood,g); const h=N(g,0,6.1,0,.5,ry,0); for(const s of [-1,1]) mk(box(.45,.35,.2),col(0x2a2a2c),h,s*.3,0,0); for(const s of [-1,1]) mk(plane(.4,.3),M(null,{color:0xf2f4ff,unlit:true}),h,s*.3,0,.102); },
  tank(g){ for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.12,3.6,.12,{at:[0,1.8,0]}),mWood,g,sx*.8,0,sz*.8); mk(cyl(1.2,1.2,1.6,12,{at:[0,.8,0]}),MT(tTin),g,0,3.6,0); mk(lathe([[0,1.25,1.25],[.5,0,0]],12),col(0x5a5a56),g,0,5.2,0); },
  kennel(g){ mk(box(1.4,1.0,1.0,{at:[0,.5,0]}),MT(tWoodLight),g); mk(box(1.5,.08,1.15),col(0x5a2a1a),g,0,1.05,0,0,0,.15); mk(plane(.5,.6),col(0x0a0a0a),g,0,.32,.505); },
  trough(g){ mk(box(2,.6,.7,{at:[0,.3,0]}),MT(tTin),g); mk(plane(1.9,.6),MT(tWater,{color:0x7a8a8a}),g,0,.52,0,-Math.PI/2); },
  workbench(g,len=2){ FX.bench(g,len); const r=rng(len*9); for(let i=0;i<6;i++) mk(box(.08+r()*.1,.04,.3),col([0xc8402e,0x2a2a2e,0xe8c03a][i%3]),g,-len/2+.3+i*.3,1.4+(i%2)*.15,-.24); }
};
