/* ==========================================================================================================
   SKY AND LANDMARKS. The sky is a box and a skyline ring that ride with the eye (they're "at infinity"): the City's
   towers to the west, Canary Wharf to the south-east, cranes, and the endless low roofline of the East End with its
   lit windows. The hand-built blocks (estates, park, school, Tube, church...) are filled in buildLandmarks().
   ========================================================================================================== */
const SKY=N(world); SKY.dyn=true;
const tSkyline=P2(2048,256,(g,w,h)=>{ g.clearRect(0,0,w,h); const r=hr(8801); const dark='#0b0c10';
  const tower=(x,tw,th,lit=.25,top=null)=>{ g.fillStyle=dark; g.fillRect(x,h-th,tw,th);
    if(top==='spire'){ g.beginPath(); g.moveTo(x,h-th); g.lineTo(x+tw/2,h-th-th*.25); g.lineTo(x+tw,h-th); g.fill(); }
    if(top==='pyramid'){ g.beginPath(); g.moveTo(x,h-th); g.lineTo(x+tw/2,h-th-tw*.5); g.lineTo(x+tw,h-th); g.fill(); R(g,'#ff2a1a',x+tw/2-1,h-th-tw*.5-3,3,3); }
    if(top==='curve'){ g.beginPath(); g.ellipse(x+tw/2,h-th,tw/2,tw*.9,0,Math.PI,0); g.fill(); }
    for(let y=h-th+3;y<h-2;y+=4) for(let xx=x+2;xx<x+tw-2;xx+=3) if(r()<lit) R(g,r()<.85?'#ffd9a0':'#bcd4ff',xx,y,2,2); };
  /* the endless low roofline all the way round */
  let x=0; while(x<w){ const bw=10+r()*30, bh=10+r()*18; g.fillStyle=dark; g.fillRect(x,h-bh,bw+1,bh); if(r()<.4) g.fillRect(x+bw*.3,h-bh-4,3,4);
    for(let y=h-bh+3;y<h-2;y+=5) for(let xx=x+2;xx<x+bw-2;xx+=4) if(r()<.12) R(g,'#ffcf8a',xx,y,2,2); x+=bw; }
  /* compass on the ring: u=0 east, .25 south, .5 west, .75 north */
  const U=u=>u*w;
  /* the City, west: a tight cluster of glass towers */
  for(const [u,tw,th,top] of [[.47,22,120,null],[.485,18,150,'curve'],[.5,26,170,null],[.515,14,135,'spire'],[.525,20,110,null],[.54,16,95,null],[.455,12,80,null],[.505,10,185,'spire']]) tower(U(u),tw,th,.3,top);
  /* Canary Wharf, south-east: three tall blocks, one with the pyramid and its light */
  for(const [u,tw,th,top] of [[.115,20,140,null],[.13,22,175,'pyramid'],[.148,18,150,null],[.165,12,95,null]]) tower(U(u),tw,th,.22,top);
  /* council towers dotted about, and cranes */
  for(const u of [.31,.36,.66,.7,.82,.9,.97]) tower(U(u),12,60+r()*30,.3);
  g.strokeStyle='#14161a'; g.lineWidth=2; for(const u of [.2,.44,.6,.78]){ const cx=U(u); g.beginPath(); g.moveTo(cx,h); g.lineTo(cx,h-150); g.moveTo(cx-40,h-145); g.lineTo(cx+70,h-145); g.stroke(); R(g,'#ff2a1a',cx-1,h-153,3,3); }
},0,1);
tSkyline.nomip=false;
{ const R_=86, N_=32, H_=44, gR=new Geo(); for(let i=0;i<=N_;i++){ const a=i/N_*Math.PI*2, x=Math.cos(a)*R_, z=Math.sin(a)*R_; gR.v([x,-2,z],[-Math.cos(a),0,-Math.sin(a)],[i/N_,0]); gR.v([x,H_,z],[-Math.cos(a),0,-Math.sin(a)],[i/N_,1]); }
  for(let i=0;i<N_;i++){ const a=i*2; gR.I.push(a,a+2,a+3,a,a+3,a+1); } gR.noDist=true;
  mk(gR,MM(tSkyline,{unlit:true,cut:true,double:true,nofog:true}),SKY,0,0,0);
  const gS=new Geo(); /* the sky: an open box of gradient, sodium-lit cloud low down */
  for(let i=0;i<=N_;i++){ const a=i/N_*Math.PI*2, x=Math.cos(a)*(R_+8), z=Math.sin(a)*(R_+8); gS.v([x,-4,z],[0,0,1],[0,1]); gS.v([x,90,z],[0,0,1],[0,0]); }
  for(let i=0;i<N_;i++){ const a=i*2; gS.I.push(a,a+2,a+3,a,a+3,a+1); } gS.noDist=true;
  const skyM=MM(tSky,{unlit:true,double:true,nofog:true}); SKY.skyM=skyM; mk(gS,skyM,SKY,0,0,0); }
function skyTick(eye){ SKY.p=[eye[0],0,eye[2]]; }

/* ---------------- the hand-built blocks ---------------- */
function buildLandmarks(){ }
