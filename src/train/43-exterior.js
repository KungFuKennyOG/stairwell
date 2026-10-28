
/* =====================================================================================================
   THE TRAIN: Halcyra Railways class H1 "Silver Heron", nine cars. Livery: cream body, lacquer-blue skirt,
   a signal-red pinstripe over a gold one. Bodies are lofted from one cross-section; the nose and the
   observation tail are the same loft, tapered.
   ===================================================================================================== */
const WAGONS=[
  {key:'cab',num:'01',name:'Driving Cab',label:'CAB',wins:[[.64,.74],[.78,.86]],glow:0xfff0d0,color:'#e0473a',
    sub:'Crew only · the front of the train',note:'White consoles, signal-red seats, blue screens, a windscreen full of oncoming track. The last car you reach, and the only one with the brakes.',sw:['#eeeae2','#e0473a','#2a3140','#5ab8e8','#9aa0a6']},
  {key:'salon',num:'02',name:'Salon Imperial',label:'SALON IMPERIAL',wins:[[.14,.26],[.32,.44],[.56,.68],[.74,.86]],glow:0xffd890,color:'#1f6a4e',
    sub:'VIP lounge · the man in the linen suit',note:'Walnut panelling inlaid with brass, emerald damask, a coffered cream ceiling, velvet club chairs and a grand piano. The hijack is run from here.',sw:['#1f5a46','#c9a23a','#5a2e1c','#efe4c8','#8e2430']},
  {key:'sleeper',num:'03',name:'Moonlight Sleeper',label:'SLEEPER',wins:[[.1,.17],[.22,.29],[.34,.41],[.46,.53],[.58,.65],[.7,.77],[.82,.89]],glow:0xc8b0ff,color:'#6a5aa8',
    sub:'Compartments · the twins work the corridor',note:'Indigo and lavender, brass numbers on the doors, warm sconces and a teal runner down a narrow corridor. Every door is a decision.',sw:['#2b2f5a','#9c8cc4','#d6b46a','#2f6a6a','#f0e6d8']},
  {key:'bar',num:'04',name:'Club Hotaru',label:'CLUB HOTARU',wins:[[.12,.2],[.3,.38],[.48,.56],[.66,.74],[.84,.9]],glow:0xff4fae,color:'#ff3fa4',
    sub:'Bar car · the crooner keeps singing',note:'Black lacquer, magenta and cyan neon, red vinyl booths, a back bar of a hundred bottles and a karaoke stage with a mirror ball. Loud is very loud in here.',sw:['#12101a','#ff3fa4','#29e0e6','#b0182e','#f5c542']},
  {key:'dining',num:'05',name:'Restaurant Riviere',label:'RIVIERE',wins:[[.1,.2],[.26,.36],[.42,.52],[.58,.68],[.74,.84]],glow:0xffd8a8,color:'#e2725b',
    sub:'Dining car · the chef and his cleavers',note:'Coral walls, white linen, teal chairs, brass lamps with peach shades and sakura in every vase. The galley at the end is steel, steam and knives.',sw:['#e2725b','#f4efe6','#2a7f7a','#c99a3e','#f2a7b8']},
  {key:'standard',num:'06',name:'Standard Class',label:'STANDARD',wins:[[.08,.15],[.18,.25],[.28,.35],[.38,.45],[.48,.55],[.58,.65],[.68,.75],[.78,.85],[.88,.93]],glow:0xf4f0e0,color:'#e0a526',
    sub:'Seats · where the passengers are held',note:'Mustard and teal moquette, grey panels, luggage racks and a destination board counting down to Neo-Hanamura. Forty frightened people and a few men in fox masks.',sw:['#e0a526','#1f6f78','#dad6cc','#4a4f57','#ff7a3a']},
  {key:'garden',num:'07',name:'Hanami Tea Car',label:'HANAMI',wins:[[.12,.3],[.4,.6],[.7,.88]],glow:0xffc890,color:'#f2a0b8',
    sub:'Tea room · a blossom tree on board',note:'Hinoki wood, tatami, shoji screens half drawn, paper lanterns and a living cherry tree in a stone planter. Petals drift inside the car.',sw:['#d9b98a','#b8b07a','#f3ecdc','#f4a6c0','#2c2a26']},
  {key:'baggage',num:'08',name:'Baggage',label:'BAGGAGE',wins:[[.12,.18],[.82,.88]],glow:0xff9a3a,color:'#e08a1e',
    sub:'Freight · crates, a motorbike, the strongbox',note:'Ribbed steel, stencilled crates, flower boxes for the opening ceremony, chains and one sodium lamp. What the hijackers actually came for is in here.',sw:['#6b6f73','#9c7a4a','#e08a1e','#2a2c2f','#f2a0b8']},
  {key:'observation',num:'09',name:'Skydeck',label:'SKYDECK',wins:[[.06,.94]],glow:0xe8f4ff,color:'#157a8c',
    sub:'Observation car · glass on three sides',note:'A glass roof, cream leather swivel chairs, chrome and teal. The rear window looks back down the line at everything you have done.',sw:['#f0e8d8','#157a8c','#c7ccd1','#e6dccb','#2a3a4a']}
];
const CAR_L=13, CAR_GAP=.62, CAR_PITCH=CAR_L+CAR_GAP;
const PROF=[[0,-.55],[1.3,-.55],[1.46,-.3],[1.5,.3],[1.5,1.95],[1.44,2.45],[1.28,2.72],[.95,2.9],[.5,2.97],[0,2.99]];
const PY0=-.55, PY1=2.99, YC=1.0;
const vOf=y=>Math.min(.995,Math.max(.005,(y-PY0)/(PY1-PY0)));
const vRow=(y,H)=>(1-vOf(y))*H;
function loftHalf(g,secs,side,flipU,mi){ const base=g.P.length/3,start=g.I.length,n=PROF.length;
  for(const sc of secs) for(const [z,y] of PROF){ const Y=YC+(y-YC)*sc.sy+sc.dy; g.v([sc.x,Y,side*z*sc.sz],[0,0,side],[flipU?1-sc.u:sc.u,vOf(y)]); }
  for(let i=0;i<secs.length-1;i++) for(let j=0;j<n-1;j++){ const a=base+i*n+j,b=a+n,c=b+1,d=a+1; if(side>0) g.I.push(a,b,c,a,c,d); else g.I.push(a,c,b,a,d,c); }
  g.groups.push({start,count:g.I.length-start,mi}); }
function loft(secs){ const g=new Geo(); loftHalf(g,secs,1,false,0); loftHalf(g,secs,-1,true,0); smoothNormals(g); return g; }

/* livery: 256 x 64, u along the car, v up the side (bottom row = the underside, top row = the roof) */
function liveryTex(W){ return P2(256,64,(g,w,h)=>{
  const row=y=>vRow(y,h);
  vfill(g,0,0,w,row(2.55),[[0,'#b4b8bc'],[1,'#9aa0a6']]); R(g,'#7e8488',0,row(2.55)|0,w,1);
  vfill(g,0,row(2.55),w,row(.2)-row(2.55),[[0,'#f6efe0'],[.5,'#eee6d4'],[1,'#e2d8c2']]);
  vfill(g,0,row(.2),w,h-row(.2),[[0,'#24345a'],[1,'#141c34']]); R(g,'#c9a23a',0,row(.2)|0,w,1);
  R(g,'#d63a2c',0,row(.86)|0,w,2); R(g,'#c9a23a',0,(row(.86)|0)+3,w,1);
  if(W.key==='observation'){ vfill(g,0,row(2.9),w,row(.95)-row(2.9),[[0,'#5a7a9a'],[.4,'#2a3e5a'],[1,'#1a2a42']]); for(let x=16;x<w;x+=24) R(g,'#c8ccd0',x,row(2.9)|0,2,(row(.95)-row(2.9))|0); }
  for(const [u0,u1] of W.wins){ const x0=u0*w,x1=u1*w,y0=row(1.92),y1=row(.98); vfill(g,x0,y0,x1-x0,y1-y0,[[0,'#6a86a6'],[.35,'#2a3e5a'],[1,'#162236']]); R(g,'#c9ccd0',x0,y0,x1-x0,1); R(g,rgba('#ffffff',.25),x0+2,y0+2,2,(y1-y0)*.5); }
  if(W.key==='baggage'){ const x0=w*.36,x1=w*.64; R(g,'#cfc8b6',x0,row(2.2),x1-x0,row(.25)-row(2.2)); for(let y=row(2.2);y<row(.25);y+=2) R(g,'#b8b09e',x0,y|0,x1-x0,1); }
  for(const u of [.035,.965]){ const x=u*w; R(g,'#bdb4a0',x-5,row(2.2)|0,1,(row(.25)-row(2.2))|0); R(g,'#bdb4a0',x+5,row(2.2)|0,1,(row(.25)-row(2.2))|0); R(g,'#2a3e5a',x-3,row(1.9)|0,6,6); }
  const lab=W.label; if(lab){ text(g,lab,(w-textW(lab))/2|0,(row(.62)|0),'#24345a',1); }
  text(g,W.num,(w*.07|0)+2,row(.62)|0,'#d63a2c',1);
},4,W.num.charCodeAt(1)); }
function noseTex(){ return P2(128,64,(g,w,h)=>{ const row=y=>vRow(y,h);
  vfill(g,0,0,w,h,[[0,'#f6efe0'],[1,'#e2d8c2']]); vfill(g,0,row(.2),w,h-row(.2),[[0,'#24345a'],[1,'#141c34']]);
  poly(g,[[0,row(.86)],[w,row(.55)],[w,row(.35)],[0,row(.8)]],'#d63a2c'); R(g,'#c9a23a',0,row(.2)|0,w,1);
  poly(g,[[w*.18,row(2.3)],[w*.62,row(2.0)],[w*.66,row(1.35)],[w*.2,row(1.6)]],'#1a2a42'); poly(g,[[w*.24,row(2.2)],[w*.4,row(2.05)],[w*.42,row(1.85)],[w*.26,row(2.0)]],rgba('#9ab8d8',.6));
  ell(g,w*.9,row(.62),4,2,'#fff6d8'); },3,17); }
function tailTex(){ return P2(128,64,(g,w,h)=>{ const row=y=>vRow(y,h);
  vfill(g,0,0,w,h,[[0,'#f6efe0'],[1,'#e2d8c2']]); vfill(g,0,row(.2),w,h-row(.2),[[0,'#24345a'],[1,'#141c34']]); R(g,'#d63a2c',0,row(.86)|0,w,2); R(g,'#c9a23a',0,row(.2)|0,w,1);
  vfill(g,0,row(2.95),w*.85,row(.98)-row(2.95),[[0,'#5a7a9a'],[.4,'#2a3e5a'],[1,'#1a2a42']]); for(let x=10;x<w*.85;x+=18) R(g,'#c8ccd0',x,row(2.95)|0,2,(row(.98)-row(2.95))|0);
  ell(g,w*.92,row(.6),3,2,'#ff4a3a'); },3,19); }
function winGlowTex(W){ return P2(256,16,(g,w,h)=>{ for(const [u0,u1] of W.wins){ vfill(g,u0*w,0,(u1-u0)*w,h,[[0,'#fff6e0'],[1,'#d8b888']]); for(let x=u0*w+6;x<u1*w;x+=11) R(g,'#5a4a3a',x|0,h-7,3,7); } }); }
const LIVERY={}, GLOWM={};
const mBogie=M(null,{color:0x2a2c30}), mWheel=M(tSteel,{color:[.55,.55,.58]});
function bogie(parent,x){ const b=N(parent,x,0,0); mk(box(2.8,.42,2.2),mBogie,b,0,-.62,0); for(const dx of [-.95,.95]) for(const z of [-.72,.72]) mk(cyl(.43,.43,.12,10),mWheel,b,dx,-.62,z,Math.PI/2); return b; }
function buildCarExt(parent,W,x,o={}){ const n=N(parent,x,0,0);
  const mat=LIVERY[W.key]||(LIVERY[W.key]=M(liveryTex(W)));
  const secs=[]; for(let i=0;i<=8;i++){ const t=i/8; secs.push({x:-CAR_L/2+t*CAR_L,sz:1,sy:1,dy:0,u:t}); }
  mk(loft(secs),mat,n);
  bogie(n,-CAR_L*.34); bogie(n,CAR_L*.34);
  mk(box(CAR_GAP+.1,2.5,2.3),M(null,{color:0x1a1b1e}),n,CAR_L/2+CAR_GAP/2,1.05,0);
  /* window glow for night and the tunnel */
  const gm=GLOWM[W.key]||(GLOWM[W.key]=M(winGlowTex(W),{cut:true,emissive:W.glow,color:[.1,.1,.1]}));
  const gw=N(n); gw.vis=false; n.glow=gw;
  for(const s of [1,-1]) mk(planeUV(CAR_L,.94,s<0),gm,gw,0,1.45,s*1.512,0,s>0?0:Math.PI,0);
  if(W.key==='cab'){ /* the nose and a pantograph */
    const ns=[]; for(let i=0;i<=9;i++){ const t=i/9; ns.push({x:CAR_L/2+t*7.2,sz:Math.max(.03,1-.86*Math.pow(t,1.6)),sy:Math.max(.05,1-.66*Math.pow(t,1.15)),dy:-.62*Math.pow(t,1.3),u:t}); }
    mk(loft(ns),M(noseTex()),n); const pm=M(null,{color:0x3a3c40});
    mk(box(1.4,.08,.6),pm,n,-3,3.05,0); mk(box(.06,.9,.06),pm,n,-3.2,3.45,0,0,0,.6); mk(box(.06,.9,.06),pm,n,-2.8,3.45,0,0,0,-.6); mk(box(.08,.06,1.6),pm,n,-3,3.85,0); }
  if(W.key==='observation'){ const ns=[]; for(let i=0;i<=6;i++){ const t=i/6; ns.push({x:-CAR_L/2-t*3.4,sz:Math.max(.05,1-.55*Math.pow(t,2)),sy:Math.max(.08,1-.5*Math.pow(t,2.2)),dy:-.3*Math.pow(t,2),u:t}); }
    mk(loft(ns),M(tailTex()),n); }
  return n; }

const TRAIN=N(world); const TRAIN_CARS=[];
WAGONS.forEach((W,i)=>{ const x=(4-i)*CAR_PITCH; const n=buildCarExt(TRAIN,W,x); n.W=W; TRAIN_CARS.push(n); });
function setGlow(on){ for(const c of TRAIN_CARS) c.glow.vis=on; for(const c of STATION_CARS) c.glow.vis=on; }

/* =====================================================================================================
   PORT LUMEN CENTRAL, platform 1: where the cast lines up. Deco ironwork in teal, terracotta and cream tile,
   a departures board, sakura in the planters.
   ===================================================================================================== */
const STATION=N(world), STATION_CARS=[];
(function buildStation(){
  const S=STATION;
  const tile=M(P2(32,32,(g,w,h)=>{ for(let y=0;y<4;y++) for(let x=0;x<4;x++) vfill(g,x*8,y*8,8,8,(x+y)%2?[[0,'#e6d8bc'],[1,'#dccdae']]:[[0,'#c87a5a'],[1,'#b86a4c']]); for(let k=0;k<4;k++){ R(g,'#a08a6c',k*8,0,1,h); R(g,'#a08a6c',0,k*8,w,1); } },6,3),{repeat:[11,4]});
  { const ed=M(null,{color:0x8a7f70}); mk(box(30,.9,7.8,{at:[0,-.45,0]}),F(ed,ed,ed,tile,ed),S,0,0,2.1); }
  mk(plane(30,.5),M(P2(64,8,(g,w,h)=>{ R(g,'#f2c230',0,0,w,h); for(let x=0;x<w;x+=3) for(let y=1;y<h;y+=3) R(g,'#d8a820',x,y,2,2); },0),{repeat:[12,1]}),S,0,.002,-1.4,-Math.PI/2);
  /* the train waiting at the platform */
  [WAGONS[0],WAGONS[1],WAGONS[2]].forEach((W,i)=>{ const c=buildCarExt(S,W,(1-i)*CAR_PITCH-2); c.p[2]=-3.35; STATION_CARS.push(c); });
  for(const z of [-4.07,-2.63]){ mk(box(60,.14,.07),M(null,{color:0x8c9096}),S,0,RAIL_Y-.07,z-3.35+3.35); }
  /* columns and canopy */
  const teal=M(null,{color:0x2f6a6e}), brass=M(null,{color:0xc9a23a}), cream=M(null,{color:0xece2cc});
  for(let x=-12;x<=12;x+=6){ mk(box(.26,5.2,.26),teal,S,x,2.6,-.95); mk(box(.5,.3,.5),brass,S,x,5.1,-.95); mk(box(.5,.2,.5),teal,S,x,.1,-.95);
    for(const s of [-1,1]) mk(box(.08,1.6,.08),teal,S,x+s*.5,4.5,-.95,0,0,s*.6); }
  const roof=M(P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#f0e6d0'],[1,'#e0d4bc']]); R(g,'#2f6a6e',0,0,w,2); R(g,'#2f6a6e',0,0,2,h); },4,5),{repeat:[10,3]});
  mk(plane(30,8.4),roof,S,0,5.5,1.3,Math.PI/2);
  mk(box(30,.5,.12),teal,S,0,5.3,5.5); mk(box(30,.08,.1),brass,S,0,5.06,5.5);
  /* hanging station sign */
  const sign=P2(128,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#24345a'],[1,'#1a2646']]); R(g,'#c9a23a',2,2,w-4,1); R(g,'#c9a23a',2,h-3,w-4,1); text(g,'PORT LUMEN CENTRAL',(w-textW('PORT LUMEN CENTRAL'))/2|0,8,'#f6efe0',1); text(g,'PLATFORM 1  LINE H1',(w-textW('PLATFORM 1  LINE H1'))/2|0,18,'#f2a0b8',1); },0);
  mk(box(3.2,.8,.06),F(M(null,{color:0x24345a}),M(sign),M(sign)),S,-6,3.7,-.8); for(const dx of [-1.3,1.3]) mk(box(.03,1.5,.03),brass,S,-6+dx,4.75,-.8);
  /* departures board */
  const board=P2(128,48,(g,w,h)=>{ R(g,'#0e0d0c',0,0,w,h); const lines=[['07:30','NEO-HANAMURA','1'],['07:30','MAIDEN RUN',''],['08:15','MIRAHAMA','3'],['08:40','LAKE ALDER','2'],['09:05','SAKURA VALLEY','4']];
    lines.forEach(([t,d,p],i)=>{ const c=i<2?'#ffb020':'#c88a20'; text(g,t,3,3+i*9,c,1); text(g,d,26,3+i*9,c,1); if(p) text(g,p,w-8,3+i*9,c,1); }); });
  mk(box(2.6,1.0,.12),F(M(null,{color:0x1a1a1a}),M(board,{unlit:true}),mBlack),S,6,3.5,-.8); mk(box(2.8,.1,.16),brass,S,6,4.05,-.8); for(const dx of [-1.1,1.1]) mk(box(.03,1.4,.03),brass,S,6+dx,4.75,-.8);
  /* clock */
  const clockT=P2(32,32,(g,w,h)=>{ ell(g,16,16,15,15,'#c9a23a'); ell(g,16,16,13,13,'#f6efe0'); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; R(g,'#24345a',16+Math.sin(a)*11|0,16-Math.cos(a)*11|0,1,1); } g.strokeStyle='#24345a'; g.lineWidth=1.5; g.beginPath(); g.moveTo(16,16); g.lineTo(16+Math.sin(-.5)*6,16-Math.cos(-.5)*6); g.moveTo(16,16); g.lineTo(16+Math.sin(Math.PI)*10,16-Math.cos(Math.PI)*10); g.stroke(); });
  mk(cyl(.42,.42,.12,16),[M(null,{color:0xc9a23a}),M(clockT,{unlit:true}),M(clockT,{unlit:true})],S,0,4.25,-.8,Math.PI/2); mk(box(.04,.9,.04),brass,S,0,4.95,-.8);
  /* benches, planters with sakura, lamps */
  const wood=M(P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#a87a4a'],[1,'#8a5e36']]); for(let y=0;y<h;y+=4) R(g,'#6a4428',0,y,w,1); },4,7));
  for(const x of [-9,9]){ const b=N(S,x,0,-.55); mk(box(2,.06,.45),wood,b,0,.46,0); mk(box(2,.4,.06),wood,b,0,.72,-.24,.15); for(const dx of [-.85,.85]) mk(box(.06,.46,.4),teal,b,dx,.23,0); }
  const pot=M(null,{color:0x2f6a6e}),soil=M(null,{color:0x3a2a1e}),bark=M(null,{color:0x4a2e26}),pink=[M(null,{color:0xf2a0b8}),M(null,{color:0xffc8d6}),M(null,{color:0xe48aa8})];
  for(const x of [-12,12]){ const p=N(S,x,0,3.2); mk(box(1.1,.7,1.1),pot,p,0,.35,0); mk(box(1,.04,1),soil,p,0,.7,0); mk(box(.12,1.8,.12),bark,p,0,1.5,0,0,0,.08);
    const r=rng(x+50); for(let k=0;k<9;k++) mk(box(.5+r()*.4,.4+r()*.25,.5+r()*.4),pink[k%3],p,(r()-.5)*1.1,2.3+r()*.7,(r()-.5)*1.1,r(),r(),0); }
  const globe=M(null,{unlit:true,color:0xfff0c8});
  for(let x=-9;x<=9;x+=6) { mk(box(.04,.6,.04),brass,S,x,5.2,1.3); mk(lathe([[0,.02,.02],[.06,.16,.16],[.22,.16,.16],[.3,.03,.03]],8),globe,S,x,4.6,1.3); }
  S.vis=false;
})();
