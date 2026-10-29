/* =====================================================================================================
   COLONIA KIT: what a block of Colonia Tierra Blanca is made of, for the stash house level (36-stash.js).
   Painted cinderblock with the mortar showing through, half-painted walls, chipped bottoms and rain streaks; hand-painted
   signs and tags; lit and dark windows, steel doors, roof parapets with rebar, water tanks; a taco cart, an oil-drum fire,
   a roadside shrine, an altar; a painted skyline backdrop.
   Also the plumbing a bigger level needs on the Quest:
     batchStatic  merges every static mesh into one mesh per material per 12 m tile (hundreds of draw calls become dozens)
     lights       a level can have any number of lights; each frame the six that matter most to you are the ones lit
   ===================================================================================================== */

/* ---------- painted cinderblock: 32 x 64 = one 1.2 x 2.6 m wall panel, blocks 40 x 20 cm ---------- */
const CB_RAW='#8c8880';
function cinderPaint(paint,seed,o={}){ return P2(32,64,(g,w,h)=>{ const r=rng(seed);
  /* the bare block: grey, each block a little different, mortar lines */
  R(g,CB_RAW,0,0,w,h);
  for(let y=0;y<h;y+=5){ const off=((y/5)|0)%2?5:0; for(let x=-off;x<w;x+=11){ const v=(r()-.5)*.14; R(g,mix(CB_RAW,v>0?'#ffffff':'#000000',Math.abs(v)),x+1,y+1,10,4); } }
  for(let y=0;y<h;y+=5){ R(g,'#64605a',0,y,w,1); const off=((y/5)|0)%2?5:0; for(let x=-off;x<w;x+=11) R(g,'#64605a',x,y,1,5); }
  if(!paint) { vfill(g,0,h*.78,w,h*.22,[[0,'rgba(70,52,34,0)'],[1,'rgba(70,52,34,.55)']]); return; }
  /* the paint: from the top down to where it stops (half-painted houses stop at 1.6 m), faded, the grid showing through */
  const y0=o.from!=null?Math.round(h*o.from):0, y1=o.to!=null?Math.round(h*o.to):h;
  vfill(g,0,y0,w,y1-y0,[[0,mix(paint,'#ffffff',.06)],[.6,paint],[1,mix(paint,'#000000',.1)]]);
  for(let y=y0-(y0%5);y<y1;y+=5){ if(y>=y0) R(g,'rgba(0,0,0,.16)',0,y,w,1); const off=((y/5)|0)%2?5:0; for(let x=-off;x<w;x+=11) R(g,'rgba(0,0,0,.12)',x,Math.max(y,y0),1,5); }
  for(let i=0;i<70;i++) R(g,`rgba(255,255,255,${(r()*.08).toFixed(3)})`,r()*w|0,y0+r()*(y1-y0)|0,2,1);
  /* chipped: the bottom edge of the paint eaten away, a few bare patches */
  for(let x=0;x<w;x++){ const d=(o.chip??4)*(.4+r()*.9); if(y1>=h-1) R(g,CB_RAW,x,Math.round(h-3-d),1,Math.round(d)); else R(g,mix(paint,'#000000',.25),x,y1-1,1,1); }
  for(let i=0;i<(o.patches??3);i++){ const x=r()*w,y=y0+r()*(y1-y0)*.9; ell(g,x,y,1.5+r()*2.5,1+r()*1.6,mix(CB_RAW,'#000000',.05)); }
  /* rain streaks down from the top, a dirt band where the street splashes */
  for(let i=0;i<5;i++){ const x=r()*w|0; vfill(g,x,0,1+(r()*2|0),12+r()*30,[[0,'rgba(40,30,20,.35)'],[1,'rgba(40,30,20,0)']]); }
  vfill(g,0,h*.8,w,h*.2,[[0,'rgba(70,52,34,0)'],[1,'rgba(70,52,34,.6)']]);
  if(o.fn) o.fn(g,w,h,r); },5,seed); }
const tCbPink=cinderPaint('#c98680',1601), tCbTurq=cinderPaint('#3e968e',1602), tCbOchre=cinderPaint('#c99a46',1603), tCbBlue=cinderPaint('#4e70a8',1604),
  tCbLime=cinderPaint('#8aa64a',1605), tCbWhite=cinderPaint('#d6d0c2',1606,{patches:5}), tCbViolet=cinderPaint('#8a6898',1607), tCbOrange=cinderPaint('#cc7438',1608),
  tCbRaw=cinderPaint(null,1609), tCbPinkHalf=cinderPaint('#d08a8a',1610,{from:.38}), tCbTurqHalf=cinderPaint('#3e968e',1611,{from:.38}), tCbCream=cinderPaint('#e0d2a8',1612,{patches:4});
/* plaster inside: smooth paint, a darker wainscot band, grime around the bottom */
const plasterIn=(top,band,seed)=>wallTex(top,seed,(g,w,h,r)=>{ vfill(g,0,h*.58,w,h*.42,[[0,band],[1,mix(band,'#000000',.2)]]); R(g,mix(band,'#000000',.35),0,h*.58|0,w,1);
  for(let i=0;i<4;i++){ const x=r()*w|0; vfill(g,x,0,2,20+r()*30,[[0,'rgba(60,50,30,.25)'],[1,'rgba(60,50,30,0)']]); } for(let i=0;i<3;i++) ell(g,r()*w,h*.2+r()*h*.3,2,1.4,'rgba(0,0,0,.08)'); },{skirt:mix(band,'#000000',.3)});
const tInMint=plasterIn('#b8c8a8','#6a8a6e',1621), tInPeach=plasterIn('#e0bc98','#a86a4a',1622), tInBlue=plasterIn('#a8bcd0','#4a6a8a',1623), tInYellow=plasterIn('#dccb8a','#8a7a3a',1624), tInWhite=plasterIn('#d8d4cc','#9a948a',1625);

/* ---------- ground ---------- */
const tRoad=flTex('#6e5e4a',1631,(g,w,h,r)=>{ for(let i=0;i<260;i++) R(g,['#7a6a54','#5e5040','#847460','#544838'][r()*4|0],r()*w|0,r()*h|0,1+(r()*2|0),1);
  for(const x of [7,24]) for(let y=0;y<h;y++) R(g,'rgba(40,32,24,.28)',x+((y>>3)&1),y,3,1); for(let i=0;i<5;i++) ell(g,r()*w,r()*h,1.2,1,'#a89a84'); },7);
const tWalkCo=flTex('#8e8a82',1632,(g,w,h,r)=>{ vfill(g,0,0,w,h,[[0,'#96928a'],[1,'#86827a']]); R(g,'#6e6a62',0,0,w,1); R(g,'#6e6a62',0,16,w,1); R(g,'#6e6a62',0,0,1,h);
  let x=r()*w,y=0; for(let i=0;i<14;i++){ R(g,'#5e5a52',x|0,y|0,1,1); x+=(r()-.5)*3; y+=1.6; } for(let i=0;i<5;i++) ell(g,r()*w,r()*h,2,1.2,'rgba(40,30,20,.2)'); },6);
const tTileFloor=flTex('#b8ae9a',1633,(g,w,h,r)=>{ for(let k=0;k<w;k+=8){ R(g,'#8a8270',k,0,1,h); R(g,'#8a8270',0,k,w,1); } for(let i=0;i<6;i++){ const x=(r()*4|0)*8,y=(r()*4|0)*8; R(g,'#a89e88',x+1,y+1,7,7); } for(let i=0;i<4;i++) ell(g,r()*w,r()*h,3,2,'rgba(40,30,20,.18)'); });
const tPuddleCo=cutTex(32,32,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const d=Math.hypot((x-16)/14,(y-16)/10)+(r()-.5)*.25; if(d<1) R(g,d<.8?'#141c22':'#1c2228',x,y,1,1); } R(g,'rgba(160,140,100,.35)',8,12,10,1); R(g,'rgba(160,140,100,.2)',12,18,8,1); },1641);

/* ---------- signs, tags, posters, windows, doors ---------- */
const signCo=(w,h,bg,fg,lines,seed,o={})=>P2(w,h,(g)=>{ R(g,bg,0,0,w,h); if(o.band) R(g,o.band,0,h-3,w,2); lines.forEach(([t,y,s=1])=>text(g,t,Math.max(1,(w-textW(t,s))>>1),y,fg,s)); if(o.fn) o.fn(g,w,h); },6,seed);
const tSignShop=signCo(64,16,'#e6dcc0','#b02a22',[['ABARROTES',2],['LUPITA',9]],1651,{band:'#1e6a3a'});
const tSignTacos=signCo(32,12,'#c8302a','#f2e6c8',[['TACOS',4]],1652);
const tSignRent=signCo(32,16,'#f2ece0','#1e1e22',[['SE RENTA',2],['656-21-30',9]],1653);
const tSignTort=signCo(64,12,'#2a5a9a','#f2e6c8',[['TORTILLERIA',4]],1654);
const tSignNoTrash=signCo(48,12,'#d8d2c4','#8a1a14',[['NO TIRAR',1],['BASURA',7]],1655);
const tagTex=(seed,col,txt)=>cutTex(48,16,(g,w,h,r)=>{ g.strokeStyle=col; g.lineWidth=1.6; g.lineCap='round'; g.beginPath(); let x=3,y=9; g.moveTo(x,y);
  for(let i=0;i<14;i++){ x+=2+r()*2.6; y=5+r()*8; g.lineTo(x,y); } g.stroke(); if(txt) text(g,txt,4+(r()*6|0),3,col,2); g.fillStyle=col; for(let i=0;i<6;i++) g.fillRect(3+r()*40|0,12+r()*3|0,1,2+(r()*2|0)); },seed);
const TAGS_CO=[tagTex(1661,'#e8e2d4','CTB'),tagTex(1662,'#1a1a1e','TB'),tagTex(1663,'#c8302a',null),tagTex(1664,'#3a7ac8','ZN'),tagTex(1665,'#e8c83a',null)];
const tPosterVote=P2(16,24,(g,w,h)=>{ R(g,'#f2ece0',0,0,w,h); R(g,'#2a7a3a',0,0,w,5); ell(g,8,11,4,4.5,'#c89a78'); R(g,'#2a2a2e',4,15,8,3); text(g,'VOTA',1,19,'#c8302a'); },5,1671);
const tPosterLucha=P2(16,24,(g,w,h)=>{ R(g,'#e8c83a',0,0,w,h); ell(g,8,9,5,6,'#c8302a'); R(g,'#f2ece0',5,7,2,2); R(g,'#f2ece0',9,7,2,2); text(g,'LUCHA',0,18,'#1a1a1e'); },5,1672);
const tPosterMissing=P2(16,24,(g,w,h)=>{ R(g,'#f2ece0',0,0,w,h); text(g,'SE',1,1,'#1a1a1e'); R(g,'#9a9a92',3,7,10,9); ell(g,8,10,3,3.5,'#5a5a56'); for(let y=18;y<23;y+=2) R(g,'#5a5a56',2,y,12,1); },5,1673);
const tVirgen=P2(16,24,(g,w,h)=>{ R(g,'#1a1410',0,0,w,h); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; g.strokeStyle='#e8b84a'; g.beginPath(); g.moveTo(8,12); g.lineTo(8+Math.cos(a)*8,12+Math.sin(a)*11); g.stroke(); }
  poly(g,[[8,3],[13,21],[3,21]],'#2a6a5a'); for(let i=0;i<6;i++) R(g,'#f2e08a',5+i%3*2,9+(i/3|0)*5,1,1); ell(g,8,6,1.6,2,'#c89a78'); poly(g,[[6,21],[10,21],[8,23]],'#c8302a'); },4,1674);
const winTex=(kind,seed)=>P2(16,16,(g,w,h,r=rng(seed))=>{ if(kind==='lit'){ vfill(g,0,0,w,h,[[0,'#f2b866'],[1,'#c8783a']]); for(let x=0;x<w;x+=3) R(g,'rgba(120,50,20,.35)',x,0,1,h); R(g,'rgba(80,30,10,.4)',0,0,w,2); }
  else if(kind==='tv'){ vfill(g,0,0,w,h,[[0,'#5a7ab8'],[1,'#2a3a6a']]); R(g,'rgba(255,255,255,.12)',3,6,9,5); }
  else { vfill(g,0,0,w,h,[[0,'#2a3440'],[1,'#10141a']]); R(g,'rgba(160,170,190,.18)',2,2,5,1); R(g,'rgba(160,170,190,.1)',2,4,3,1); }
  R(g,'#1a1612',7,0,2,h); R(g,'#1a1612',0,7,w,2); },3,seed);
const tWinLit=winTex('lit',1681), tWinTV=winTex('tv',1682), tWinDark=winTex('dark',1683), tWinLit2=P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#f2d890'],[1,'#d8a85a']]); R(g,'#c84a3a',0,0,5,h); R(g,'#c84a3a',11,0,5,h); R(g,'#1a1612',0,7,w,2); },3,1684);
const tSteelDoor=P2(16,32,(g,w,h)=>{ R(g,'#3a5a6a',0,0,w,h); for(const [y,hh] of [[2,12],[17,13]]){ R(g,'#2e4a58',2,y,12,hh); R(g,'#4a6e7e',2,y,12,1); R(g,'#4a6e7e',2,y,1,hh); }
  R(g,'#c8c4bc',12,16,2,2); vfill(g,0,h*.75,w,h*.25,[[0,'rgba(120,60,20,0)'],[1,'rgba(120,60,20,.55)']]); for(let i=0;i<8;i++) R(g,'rgba(140,70,30,.5)',(i*5)%w,(i*11)%h,1,2); },8,1691);
const tSteelDoorR=P2(16,32,(g,w,h)=>{ R(g,'#7a2a22',0,0,w,h); for(let y=2;y<h-2;y+=3) R(g,'#5e1e18',1,y,14,1); R(g,'#c8c4bc',12,16,2,2); vfill(g,0,h*.7,w,h*.3,[[0,'rgba(60,40,20,0)'],[1,'rgba(60,40,20,.6)']]); },8,1692);
const tShutter=P2(32,32,(g,w,h)=>{ R(g,'#9a9a92',0,0,w,h); for(let y=0;y<h;y+=3){ R(g,'#b8b8b0',0,y,w,1); R(g,'#6a6a62',0,y+2,w,1); } vfill(g,0,h*.7,w,h*.3,[[0,'rgba(120,60,20,0)'],[1,'rgba(120,60,20,.5)']]); },6,1693);
const tCorrBlue=P2(32,32,(g,w,h)=>{ R(g,'#3a5a8a',0,0,w,h); for(let x=0;x<w;x+=4){ R(g,'#5a7aaa',x,0,1,h); R(g,'#2a4068',x+2,0,1,h); } vfill(g,0,h*.6,w,h*.4,[[0,'rgba(140,70,30,0)'],[1,'rgba(140,70,30,.55)']]); },6,1694);
const tTarp=P2(16,16,(g,w,h)=>{ R(g,'#2a5aa8',0,0,w,h); for(let i=0;i<4;i++) R(g,'#244e94',0,i*4+1,w,1); },6,1695);
const tCloth=P2(16,16,(g,w,h)=>{ R(g,'#8a1a1a',0,0,w,h); R(g,'#c8a040',0,12,w,2); },5,1696);
const tUmbrella=P2(32,8,(g,w,h)=>{ for(let x=0;x<w;x+=8){ R(g,'#c8302a',x,0,4,h); R(g,'#f2ece0',x+4,0,4,h); } },3,1697);
/* the backdrop: night over the rest of the city. Hills with lights, the haze of sodium, the border's floodlights far off */
const tBackdrop=P2(256,96,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#04060c'],[.5,'#0a0e18'],[.8,'#1c1a22'],[1,'#2a221e']]);
  const hill=(base,amp,col,seed)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=4) g.lineTo(x,base-Math.sin(x*.035+seed)*amp-Math.sin(x*.11+seed*2)*amp*.3); g.lineTo(w,h); g.fill(); };
  hill(h*.76,5,'#0c0b10',3); hill(h*.88,2,'#08080a',7);
  vfill(g,0,h*.7,w,h*.3,[[0,'rgba(60,40,30,0)'],[1,'rgba(60,40,30,.35)']]); },2,1701); /* hills and the sodium haze of the city behind them: no lights drawn, they read as blocks at this size */

const tFlame=cutTex(16,32,(g,w,h,r)=>{ for(let y=0;y<h;y++){ const t=y/h,hw=(Math.sin(t*Math.PI*.9+.2))*7*(t>.3?1:.6+t)*(1-t*.15); for(let x=0;x<w;x++){ const d=Math.abs(x-7.5+Math.sin(y*.5)*1.2)/Math.max(.5,hw); if(d>1||r()>1.15-t*.3) continue;
  const k=1-d*.7; R(g,t<.35?'#ffe8a0':t<.65?(k>.6?'#ffd060':'#ff9030'):(k>.5?'#ff8020':'#c83a10'),x,h-1-y,1,1); } } },1702);
/* ---------- props ---------- */
const mIron=col(0x1c1c1e), mRust=col(0x6a3a22), mConc=MT(tCbRaw), mWoodOld=MT(tBeam);
const FIRES=[]; /* flames that move: a list of nodes, animated in tickStash */
Object.assign(FX,{
  /* a window as seen from the street: frame, sill, glass (lit, tv or dark), and bars */
  swin(g,kind='dark',w=1.0,h=1.0){ const t={lit:tWinLit,lit2:tWinLit2,tv:tWinTV,dark:tWinDark}[kind]; const m=MT(t,{unlit:kind!=='dark'});
    mk(plane(w,h),m,g,0,h/2,.005); mk(box(w+.12,.05,.1),mConc,g,0,-.02,.04); mk(box(w+.06,.04,.04),col(0x2a2622),g,0,h+.02,.01);
    for(const s of [-1,1]) mk(box(.04,h,.04),col(0x2a2622),g,s*(w/2+.01),h/2,.01);
    for(let x=-w/2+.1;x<w/2;x+=.14) mk(box(.014,h,.014),mIron,g,x,h/2,.06); for(const y of [.1,h/2,h-.1]) mk(box(w,.025,.014),mIron,g,0,y,.06); },
  /* a steel door in a concrete frame, closed */
  sdoor(g,red=false,w=.95){ mk(plane(w,2.05),MT(red?tSteelDoorR:tSteelDoor),g,0,1.025,.006); mk(box(w+.14,.1,.12),mConc,g,0,2.1,.03); for(const s of [-1,1]) mk(box(.07,2.1,.12),mConc,g,s*(w/2+.035),1.05,.03);
    mk(box(w+.3,.05,.3),mConc,g,0,.025,.15); },
  /* a rolled-down shop shutter */
  shutter(g,w=2.4){ mk(plane(w,2.3),MT(tShutter,{repeat:[w/1.2,1]}),g,0,1.15,.008); mk(box(w+.1,.3,.2),col(0x5a5a56),g,0,2.45,.1); },
  /* a low roof wall with rebar sticking out at the corners */
  parapet(g,len,h=.4){ mk(box(len,h,.14),MT(tCbRaw,{repeat:[len/1.2,.16]}),g,0,h/2,0); mk(box(len+.02,.04,.18),mConc,g,0,h+.02,0); },
  rebarTuft(g,seed=1){ FX.rebar(g,4,seed); },
  acunit(g){ mk(box(.7,.45,.25),col(0xc8c4b8),g,0,.225,0); for(let x=-.28;x<.3;x+=.06) mk(box(.02,.36,.01),col(0x6a6a62),g,x,.23,.126); mk(box(.1,.1,.4),mIron,g,.3,.3,-.25); },
  satdish(g){ mk(cyl(.32,.06,.12,10),col(0xd8d4cc),g,0,.3,0,1.2,0,0); mk(box(.03,.4,.03),mIron,g,0,.2,-.06); mk(box(.02,.02,.32),mIron,g,0,.36,.14,-.4,0,0); },
  meter(g){ mk(box(.3,.4,.12),col(0x9a9a92),g,0,1.6,.06); mk(plane(.12,.12),col(0xd8d4cc),g,0,1.65,.121); for(let i=0;i<3;i++) mk(box(.02,1.0,.02),mIron,g,-.08+i*.08,2.3,.03); },
  tires(g,n=3,seed=1){ const r=rng(seed); for(let i=0;i<n;i++) mk(cyl(.32,.32,.2,10,{open:false}),col(0x141416),g,(r()-.5)*.08,.1+i*.2,(r()-.5)*.08); },
  sandpile(g,r=.9){ mk(lathe([[0,r,r*.9],[.25,r*.7,r*.62],[.45,r*.3,r*.26],[.52,.05,.05]],10),col(0xa89070),g); },
  wheelbarrow(g){ mk(box(.6,.25,.85,{tw:1.25,td:1.15}),col(0x3a6a3a),g,0,.45,0); mk(cyl(.16,.16,.08,8),col(0x141416),g,0,.16,.55,0,0,Math.PI/2); for(const s of [-1,1]) mk(box(.04,.04,1.2),mIron,g,s*.22,.35,-.2,-.12,0,0); },
  cinders(g,n=8,seed=2){ const r=rng(seed); for(let i=0;i<n;i++) mk(box(.4,.2,.2),mConc,g,(i%2)*.42-.21,.1+Math.floor(i/4)*.2,((i/2|0)%2)*.22-.11+(r()-.5)*.03,0,(r()-.5)*.1,0); },
  pallet(g){ for(let x=-.5;x<.6;x+=.25) mk(box(.1,.02,1.2),mWoodOld,g,x,.12,0); for(const z of [-.5,0,.5]) mk(box(1.2,.1,.1),mWoodOld,g,0,.05,z); },
  trashbags(g,n=3,seed=3){ const r=rng(seed); for(let i=0;i<n;i++) mk(box(.42,.38,.38,{tw:.7,td:.7}),col(i%2?0x141416:0x1e2a1e),g,(r()-.5)*.8,.19,(r()-.5)*.6,0,r()*3,0); },
  bottles(g,n=5,seed=4){ const r=rng(seed); for(let i=0;i<n;i++){ const up=r()>.4; mk(cyl(.03,.035,.24,6),col(r()>.5?0x2a5a2a:0x6a4a1a),g,(r()-.5)*.6,up?.12:.035,(r()-.5)*.6,up?0:Math.PI/2,r()*3,0); } },
  bucketplant(g,c=0x2e6a2e,seed=5){ const r=rng(seed); mk(cyl(.15,.12,.3,8),col([0xc8402e,0x2a6ac8,0xd8d4cc][seed%3]),g,0,.15,0); for(let i=0;i<5;i++) mk(box(.12,.3+r()*.25,.04),col(c),g,(r()-.5)*.14,.42,(r()-.5)*.14,(r()-.5)*.6,r()*3,(r()-.5)*.6); },
  corrfence(g,len,h=1.9,t=tCorrBlue){ mk(box(len,h,.03),MT(t,{repeat:[len/1.2,1]}),g,0,h/2,0); for(let x=-len/2;x<=len/2+.01;x+=1.8) mk(box(.06,h+.1,.06),mWoodOld,g,x,(h+.1)/2,-.04); },
  scaffold(g,len=3,h=2.4){ for(let x=-len/2;x<=len/2+.01;x+=len/2) for(const z of [0,.8]) mk(box(.04,h,.04),mRust,g,x,h/2,z); for(const y of [.9,1.8]) for(const z of [0,.8]) mk(box(len,.04,.04),mRust,g,0,y,z); mk(box(len,.05,.8),mWoodOld,g,0,1.82,.4); },
  sodium(g,arm=1.3){ mk(cyl(.08,.11,6.4,6,{at:[0,3.2,0]}),mConc,g); mk(box(arm,.07,.07),mIron,g,arm/2,6.15,0); const h=N(g,arm,6.06,0); h._keep=true; mk(box(.45,.12,.26),mIron,h,0,.02,0); mk(box(.36,.03,.2),M(null,{color:0xffb050,unlit:true}),h,0,-.05,0); },
  /* a cart under a striped umbrella, a comal on top, a bare bulb on a cord */
  tacocart(g){ mk(box(1.5,.85,.75,{at:[0,.55,0]}),MT(tSteel),g); mk(box(1.55,.05,.8),col(0x9aa0a4),g,0,.98,0); mk(cyl(.32,.32,.04,12),col(0x1a1a1c),g,-.3,1.02,0);
    for(const s of [-1,1]) mk(cyl(.16,.16,.06,8),col(0x141416),g,s*.55,.16,.38,0,0,Math.PI/2); mk(plane(.8,.3),MT(tSignTacos),g,0,.6,.381);
    mk(box(.03,2.3,.03),mIron,g,.55,1.1,0); mk(lathe([[0,1.0,1.0],[.35,.05,.05]],8,{capB:false}),MT(tUmbrella,{double:true,repeat:[4,1]}),g,.55,2.1,0);
    mk(box(.005,.4,.005),mIron,g,.3,1.9,0); const b=N(g,.3,1.68,0); b._keep=true; mk(box(.07,.09,.07),M(null,{color:0xffe0a0,unlit:true}),b);
    for(let i=0;i<4;i++) mk(cyl(.035,.035,.18,6),col([0xc8302a,0x2a8a3a,0xe8c83a,0xd8d4cc][i]),g,.15+i*.1,1.09,.2); },
  /* an oil drum with a fire in it */
  barrelfire(g){ mk(cyl(.29,.29,.88,10,{at:[0,.44,0]}),mRust,g); for(const y of [.25,.62]) mk(cyl(.3,.3,.03,10),col(0x4a2a1a),g,0,y,0); mk(cyl(.27,.27,.02,10),col(0x2a1206),g,0,.86,0);
    const f=N(g,0,.88,0); f._keep=true; f.fire=true; FIRES.push(f); for(let i=0;i<4;i++){ const a=i/4*Math.PI*2; mk(plane(.34,.6),MT(tFlame,{unlit:true,double:true,cut:true,color:i%2?0xffffff:0xffc8a0}),f,Math.sin(a)*.06,.26,Math.cos(a)*.06,0,a,0); } },
  /* a niche in a wall with the Virgin, candles in glass, plastic flowers */
  shrine(g){ mk(box(.9,1.3,.4,{at:[0,.65,0]}),MT(tCbWhite),g,0,.5,0); mk(box(.6,.8,.05),col(0x2a3a8a),g,0,1.25,.18); mk(plane(.4,.6),MT(tVirgen),g,0,1.25,.206);
    mk(box(1.0,.08,.5),mConc,g,0,1.82,0); mk(box(.9,.06,.5),mConc,g,0,.5,.05);
    const c=N(g,0,.53,.15); c._keep=true; for(let i=0;i<5;i++){ const x=-.3+i*.15; mk(cyl(.035,.035,.14,6),col([0xc8302a,0xe8e2d4,0xc8302a,0xe8c83a,0xe8e2d4][i]),c,x,.07,0); mk(box(.02,.04,.02),M(null,{color:0xffd070,unlit:true}),c,x,.16,0); }
    for(const s of [-1,1]) for(let i=0;i<3;i++) mk(box(.06,.06,.06),col([0xe84a6a,0xf2c84a,0xe8e2d4][i]),g,s*.36,.6+i*.07,.12); },
  /* an altar: cloth, a robed figure with a skull face, candles, offerings, money */
  altar(g){ mk(box(1.1,.75,.5,{at:[0,.375,0]}),MT(tCloth),g); mk(box(.22,.55,.18,{tw:.6,td:.6}),col(0x1a1a1e),g,0,1.02,-.1); mk(box(.1,.11,.1),col(0xe8e2d4),g,0,1.35,-.08); mk(box(.025,.03,.01),col(0x101010),g,-.02,1.36,-.025); mk(box(.025,.03,.01),col(0x101010),g,.025,1.36,-.025);
    mk(box(.02,.55,.02),col(0xb8b4a8),g,.16,1.05,-.1); mk(box(.14,.04,.02),col(0xb8b4a8),g,.12,1.3,-.1,0,0,.6);
    const c=N(g,0,.75,0); c._keep=true; for(let i=0;i<6;i++){ const x=-.42+i*.17; mk(cyl(.03,.03,.18,6),col([0x1a1a1e,0xe8e2d4,0xc8302a][i%3]),c,x,.09,.14); mk(box(.02,.04,.02),M(null,{color:0xffd070,unlit:true}),c,x,.2,.14); }
    mk(cyl(.035,.04,.28,6),col(0x6a4a1a),g,.35,.89,-.05); mk(box(.16,.03,.07),MT(tCash),g,-.3,.77,-.05); mk(box(.08,.04,.06),col(0xc8a040),g,-.12,.77,.05); },
  /* a ledger on the count table: the crew's book (you can take it) */
  ledger(g){ mk(box(.22,.035,.3),col(0x2a1a12),g,0,.017,0); mk(box(.2,.025,.28),col(0xe8e2d4),g,.004,.02,0); }
});

/* ---------- a solid building you see from the street: four painted walls, a flat roof with a parapet and its clutter ---------- */
/* faces: {n,s,e,w} each a list of [kind, at(world coordinate along the face), extra]; kind: 'door','rdoor','win','lit','lit2','tv','shutter','sign','poster','tag','meter' */
function solidBlock(B,x0,z0,x1,z1,o={}){ const G=B.g,h=o.h||2.9,t=S_(o.paint||tCbPink),w=x1-x0,d=z1-z0;
  for(const [a0,b0,a1,b1] of [[x0,z0,x1,z0],[x0,z1,x1,z1],[x0,z0,x0,z1],[x1,z0,x1,z1]]) wall(B,a0,b0,a1,b1,t,t,[],{h});
  addBox(x0,x1,z0,z1,0,h,'wall');
  mk(box(w+.08,.16,d+.08),mConc,G,(x0+x1)/2,h+.08,(z0+z1)/2);
  if(o.parapet!==false){ for(const [cx,cz,len,ry] of [[(x0+x1)/2,z0,w,0],[(x0+x1)/2,z1,w,0],[x0,(z0+z1)/2,d,Math.PI/2],[x1,(z0+z1)/2,d,Math.PI/2]]) place(B,'parapet',cx,cz,ry,len,o.ph||.4);
    for(const [cx,cz] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]]) if(rng(cx*7+cz)()>.4) place(B,'rebarTuft',cx,cz,0,cx*3+cz).p[1]=h+.16; }
  const r=rng(Math.round(x0*31+z0*17));
  if(o.tinaco!==false&&w*d>12){ place(B,'tinaco',x0+w*(.2+r()*.6),z0+d*(.2+r()*.6)).p[1]=h+.16; }
  if(o.dish) place(B,'satdish',x0+.6,z1-.6,r()*6).p[1]=h+.16;
  const face={n:[z0,Math.PI,'x'],s:[z1,0,'x'],w:[x0,-Math.PI/2,'z'],e:[x1,Math.PI/2,'z']};
  for(const k in (o.faces||{})){ const [c,ry,along]=face[k],out=k==='n'||k==='w'?-1:1;
    for(const [kind,at,ex] of o.faces[k]){ const x=along==='x'?at:c+out*.065,z=along==='x'?c+out*.065:at,n=N(G,x,0,z,0,ry,0);
      if(kind==='door'||kind==='rdoor') FX.sdoor(n,kind==='rdoor');
      else if(kind==='shutter') FX.shutter(n,ex||2.4);
      else if(kind==='sign'){ n.p[1]=2.3; mk(plane(ex.w||2.4,ex.h||.6),MT(ex.t),n,0,0,.01); }
      else if(kind==='poster'){ n.p[1]=1.3+r()*.3; mk(plane(.4,.6),MT(ex),n,0,0,.008); }
      else if(kind==='tag'){ n.p[1]=.9+r()*.8; mk(plane(1.5,.5),MT(TAGS_CO[ex%TAGS_CO.length],{cut:true}),n,0,0,.008); }
      else if(kind==='meter') FX.meter(n);
      else if(kind==='ac'){ n.p[1]=2.1; FX.acunit(n); }
      else { n.p[1]=1.0; FX.swin(n,kind==='win'?'dark':kind,ex||1.0,1.05); if(kind!=='win'&&kind!=='dark') n.kids.forEach(q=>{ if(q.mesh&&q.mesh.mats[0].unlit) q._keep=true; }); } } } }

/* ---------- static batching: one mesh per material per 12 m tile ----------
   Nodes marked _keep (lit by city power, the sky), live (animated, flipped, taken) or powered (they cool down in thermal) stay as they are. */
function batchStatic(root){ updateWorld(root,null); const hot=new Set((FLOOR.hot||[]).map(o=>o.n)); const bins=new Map(),outs=[]; let merged=0;
  const keep=n=>n._keep||n.live||n.fire||hot.has(n);
  const add=(n,run,g)=>{ const w=n.world,cx=w[12],cz=w[14],tile=Math.floor(cx/12)+','+Math.floor(cz/12),m=run.m,mk_=(m.tex?tid(m.tex):0)+'|'+m.color.map(v=>v.toFixed(3))+'|'+m.emis.join()+'|'+m.unlit+m.cut+(m.dbl?1:0),key=mk_+'|'+(n._heat??'-')+'|'+tile;
    let b=bins.get(key); if(!b||b.g.P.length/3>60000){ b={g:new Geo(),m:batchMat(mk_,m),heat:n._heat}; outs.push(b); bins.set(key,b); }
    const G2=b.g,base=G2.P.length/3,P=g.P,Nm=g.Nm,T=g.T,map=new Map();
    for(let i=run.start;i<run.start+run.count;i++){ const v=g.I[i]; let j=map.get(v); if(j===undefined){ const x=P[v*3],y=P[v*3+1],z=P[v*3+2],nx=Nm[v*3],ny=Nm[v*3+1],nz=Nm[v*3+2];
        const X=w[0]*x+w[4]*y+w[8]*z+w[12],Y=w[1]*x+w[5]*y+w[9]*z+w[13],Z=w[2]*x+w[6]*y+w[10]*z+w[14]; const n3=norm3([w[0]*nx+w[4]*ny+w[8]*nz,w[1]*nx+w[5]*ny+w[9]*nz,w[2]*nx+w[6]*ny+w[10]*nz]);
        j=G2.P.length/3; G2.P.push(X,Y,Z); G2.Nm.push(n3[0],n3[1],n3[2]); G2.T.push(T[v*2]*m.rep[0],T[v*2+1]*m.rep[1]); map.set(v,j); } G2.I.push(j); } };
  (function walk(n,skip){ if(!n.vis) return; skip=skip||keep(n); if(n.mesh&&!skip){ const g=n.mesh.geo; for(const run of runsOf(n.mesh)) add(n,run,g); n.mesh=null; merged++; } for(const k of n.kids) walk(k,skip); })(root,false);
  const prev=GEO_TEMP; GEO_TEMP=true; const out=N(root);
  for(const b of outs){ const g=new Geo(); g.P=b.g.P; g.Nm=b.g.Nm; g.T=b.g.T; g.I=b.g.I; g.groups=[{start:0,count:g.I.length,mi:0}]; const n=mk(g,b.m,out); if(b.heat!=null) n._heat=b.heat; }
  GEO_TEMP=prev; return {merged,meshes:outs.length}; }
/* one shared material per look, with its tiling baked into the UVs */
const BMATS=new Map(); function batchMat(k,m){ if(!BMATS.has(k)) BMATS.set(k,Object.assign({},m,{rep:[1,1]})); return BMATS.get(k); }

/* ---------- lights: any number per level, the six nearest you are the ones lit ----------
   each: {p,c,d, pow:'gen' (off when the generator is) | 'city', fl: null|'tv'|'fire'|'candle'|'buzz'} */
const LM={list:[]};
function lmTick(){ const t=GAME.t,on=FLOOR.power!==false,ex=PL.x,ez=PL.z;
  const c=[]; for(const l of LM.list){ if(l.pow==='gen'&&!on) continue; const d=Math.hypot(l.p[0]-ex,l.p[2]-ez); if(d-l.d>14) continue; c.push([d-l.d*.7,l]); }
  c.sort((a,b)=>a[0]-b[0]);
  for(let i=0;i<6;i++){ const l=c[i]&&c[i][1]; if(!l){ L.plCol.set([0,0,0],i*3); L.plDist[i]=1; continue; }
    let f=1; if(l.fl==='tv') f=.55+.25*Math.sin(t*9.1+l.p[0])+.2*Math.sin(t*23.7+1.3)*(Math.sin(t*.7)>.2?1:.3);
    else if(l.fl==='fire') f=.72+.18*Math.sin(t*11+l.p[2])+.1*Math.sin(t*27.3)+.06*Math.sin(t*3.1);
    else if(l.fl==='candle') f=.86+.08*Math.sin(t*13+l.p[0])+.06*Math.sin(t*31);
    else if(l.fl==='buzz') f=(Math.sin(t*1.7+l.p[0])>.985&&Math.sin(t*40)>0)?.25:1;
    L.plPos.set(l.p,i*3); L.plCol.set([l.c[0]*f,l.c[1]*f,l.c[2]*f],i*3); L.plDist[i]=l.d; } }
function fireTick(t){ for(const f of FIRES){ if(!f.par) continue; const k=1+.18*Math.sin(t*14+f.p[0])+.1*Math.sin(t*31); f.s=[1,k,1]; f.r[1]+=.02; } }
