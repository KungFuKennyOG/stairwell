/* =====================================================================================================
   COLONIA KIT: what a block of Colonia Tierra Blanca is made of, for the stash house level (36-stash.js).
   Painted cinderblock with the mortar showing through, half-painted walls, chipped bottoms and rain streaks; hand-painted
   signs and tags; lit and dark windows, steel doors, roof parapets with rebar, water tanks; a taco cart, an oil-drum fire,
   a roadside shrine, an altar; a painted skyline backdrop.
   Also the plumbing a bigger level needs on the Quest:
     meshMerge    folds static meshes together: one per look per 16 m tile, plain colours sharing a palette texture
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
  if(o.frame!==false){ const ex=[]; if(w>6) for(let x=x0+3.2;x<x1-1.5;x+=3.2){ ex.push([x,z0],[x,z1]); } if(d>6) for(let z=z0+3.2;z<z1-1.5;z+=3.2){ ex.push([x0,z],[x1,z]); } frameBox(B,x0,z0,x1,z1,h,{extra:ex}); }
  if(o.parapet!==false){ for(const [cx,cz,len,ry] of [[(x0+x1)/2,z0,w,0],[(x0+x1)/2,z1,w,0],[x0,(z0+z1)/2,d,Math.PI/2],[x1,(z0+z1)/2,d,Math.PI/2]]) place(B,'parapet',cx,cz,ry,len,o.ph||.4);
    for(const [cx,cz] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]]) if(rng(cx*7+cz)()>.4) place(B,'rebarTuft',cx,cz,0,cx*3+cz).p[1]=h+.16; }
  const r=rng(Math.round(x0*31+z0*17));
  if(o.tinaco!==false&&w*d>12){ place(B,'tinaco',x0+w*(.2+r()*.6),z0+d*(.2+r()*.6)).p[1]=h+.16; }
  if(o.dish) place(B,'satdish',x0+.6,z1-.6,r()*6).p[1]=h+.16;
  if(w*d>10) for(let i=0;i<Math.min(3,w*d/12|0);i++) place(B,'roofstuff',x0+.6+r()*(w-1.2),z0+.6+r()*(d-1.2),0,Math.round(x0*13+z0*7+i)).p[1]=h+.16;
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
      else if(kind==='awning') FX.awning(n,ex.w||2.4,ex.t||tAwnRed);
      else if(kind==='neon'){ n.p[1]=ex.y||2.45; n._keep=true; mk(plane(ex.w||2.4,ex.h||.6),MT(ex.t,{unlit:true,cut:true}),n,0,0,.03); }
      else if(kind==='wsign'){ n.p[1]=ex.y||2.2; mk(plane(ex.w||2.2,ex.h||.55),MT(ex.t),n,0,0,.008); }
      else if(kind==='mural'){ n.p[1]=(ex.h||1.8)/2+.4; mk(plane(ex.w||4,ex.h||1.8),MT(ex.t),n,0,0,.008); }
      else if(kind==='weeds') FX.weeds(n,ex||4,Math.round(at*7),1.6);
      else { n.p[1]=1.0; FX.swin(n,kind==='win'?'dark':kind,ex||1.0,1.05); if(kind!=='win'&&kind!=='dark') n.kids.forEach(q=>{ if(q.mesh&&q.mesh.mats[0].unlit) q._keep=true; }); } }
    /* a tiled skirt along the front, broken at the doors and shutters */
    if(o.skirt){ const st=o.skirt===true?SKIRTS[(r()*SKIRTS.length)|0]:o.skirt,lo=along==='x'?x0:z0,hi=along==='x'?x1:z1,cut=o.faces[k].filter(f=>f[0]==='door'||f[0]==='rdoor'||f[0]==='shutter').map(f=>[f[1]-(f[0]==='shutter'?(f[2]||2.4)/2+.1:.6),f[1]+(f[0]==='shutter'?(f[2]||2.4)/2+.1:.6)]).sort((a,b)=>a[0]-b[0]);
      let s=lo; for(const [a,b] of [...cut,[hi,hi]]){ if(a-s>.3){ const m=(s+a)/2,n=N(G,along==='x'?m:c+out*.065,0,along==='x'?c+out*.065:m,0,ry,0); FX.skirt(n,a-s,st); } s=Math.max(s,b); } } } }

/* ---------- merging meshes: fewer draw calls for the Quest ----------
   meshMerge(root, o) folds every mesh under root into as few meshes as it can: one per look (texture, colour, lit or unlit,
   one- or two-sided, heat in thermal) per tile. Plain-coloured materials all share one palette texture, so a tile's hundred
   little coloured props become one mesh. Tiling is baked into the UVs. Untouched: nodes that are live (animated, flipped,
   taken), fire, powered (they cool down in thermal), and anything o.keep says. _keep nodes (they ignore the lights-out swap)
   merge among themselves. Emptied nodes are pruned so the scene graph walk each frame stays short.
   o.tile: metres per tile (0: one tile, for things that move as a whole like a gun lying on the floor) */
function makePalette(){ const c=document.createElement('canvas'); c.width=c.height=64; const P={t:{c,glt:null,f:-1},g:c.getContext('2d'),map:new Map(),n:0};
  P.uv=col=>{ const k=col.map(v=>Math.round(v*255)).join(','); let i=P.map.get(k); if(i===undefined){ i=P.n++; if(i>=4096) i=4095; P.map.set(k,i); const [r,g,b]=col.map(v=>Math.round(Math.min(1,v)*255)); P.g.fillStyle=`rgb(${r},${g},${b})`; P.g.fillRect(i%64,(i/64|0),1,1); if(P.t.glt){ gl.deleteTexture(P.t.glt); P.t.glt=null; } }
    return [((i%64)+.5)/64,1-((i/64|0)+.5)/64]; }; return P; }
/* one big atlas for every texture that isn't tiled (signs, windows, doors, posters, car panels, gun parts...): all of them can
   then share a draw call. Shelf-packed as they turn up; re-uploaded when something new is added */
const ATLAS={W:2048,H:2048,c:null,g:null,t:null,map:new Map(),x:0,y:0,row:0,full:false};
function atlasRect(t){ let r=ATLAS.map.get(t); if(r) return r; if(ATLAS.full) return null; const w=t.c.width,h=t.c.height; if(w>256||h>256) return null;
  if(!ATLAS.c){ ATLAS.c=document.createElement('canvas'); ATLAS.c.width=ATLAS.W; ATLAS.c.height=ATLAS.H; ATLAS.g=ATLAS.c.getContext('2d'); ATLAS.t={c:ATLAS.c,glt:null,f:-1}; }
  if(ATLAS.x+w>ATLAS.W){ ATLAS.x=0; ATLAS.y+=ATLAS.row; ATLAS.row=0; } if(ATLAS.y+h>ATLAS.H){ ATLAS.full=true; return null; }
  r={x:ATLAS.x,y:ATLAS.y,w,h}; ATLAS.g.drawImage(t.c,r.x,r.y); ATLAS.x+=w; ATLAS.row=Math.max(ATLAS.row,h); ATLAS.map.set(t,r);
  if(ATLAS.t.glt){ gl.deleteTexture(ATLAS.t.glt); ATLAS.t.glt=null; } return r; }
const MERGE_MATS=new Map(); function mergeMat(k,m,o){ if(!MERGE_MATS.has(k)) MERGE_MATS.set(k,Object.assign({},m,o)); return MERGE_MATS.get(k); }
let PAL=null;
function meshMerge(root,o={}){ const tile=o.tile??12,hot=new Set((FLOOR.hot||[]).map(q=>q.n)),pal=o.pal||PAL||(PAL=makePalette()),bins=new Map(),outs=[]; let merged=0;
  const skip=n=>n.live||n.fire||hot.has(n)||(o.keep&&o.keep(n));
  const add=(n,M,run,g,keepF)=>{ const m=run.m,plain=!m.tex&&!m.cut,cx=M[12],cz=M[14],tk=tile?Math.floor(cx/tile)+','+Math.floor(cz/tile):'0';
    /* a texture used once over (no tiling) can go in the atlas */
    let ar=null; if(!plain&&m.tex&&m.tex.c&&!m.tex.dyn){ let lo=1e9,hi=-1e9; for(let i=run.start;i<run.start+run.count;i++){ const v=g.I[i],u=g.T[v*2]*m.rep[0],w=g.T[v*2+1]*m.rep[1]; lo=Math.min(lo,u,w); hi=Math.max(hi,u,w); } if(lo>=-.002&&hi<=1.002) ar=atlasRect(m.tex); }
    const look=plain?'pal|'+m.unlit+(m.dbl?1:0)+'|'+m.emis.join():ar?('atlas|'+m.color.map(v=>v.toFixed(3))+'|'+m.emis.join()+'|'+m.unlit+m.cut+(m.dbl?1:0)):(tid(m.tex)+'|'+m.color.map(v=>v.toFixed(3))+'|'+m.emis.join()+'|'+m.unlit+m.cut+(m.dbl?1:0));
    const key=look+'|'+(n._heat??'-')+'|'+(keepF?'K':'')+'|'+tk;
    let b=bins.get(key); if(!b||b.g.P.length/3>60000){ b={g:new Geo(),m:plain?mergeMat('pal'+tid(pal.t)+look,m,{tex:pal.t,color:[1,1,1],rep:[1,1]}):ar?mergeMat(look,m,{tex:ATLAS.t,rep:[1,1]}):mergeMat(look,m,{rep:[1,1]}),heat:n._heat,keep:keepF}; outs.push(b); bins.set(key,b); }
    const G2=b.g,P=g.P,Nm=g.Nm,T=g.T,map=new Map(),puv=plain?pal.uv(m.color):null;
    for(let i=run.start;i<run.start+run.count;i++){ const v=g.I[i]; let j=map.get(v); if(j===undefined){ const x=P[v*3],y=P[v*3+1],z=P[v*3+2],nx=Nm[v*3],ny=Nm[v*3+1],nz=Nm[v*3+2];
        const n3=norm3([M[0]*nx+M[4]*ny+M[8]*nz,M[1]*nx+M[5]*ny+M[9]*nz,M[2]*nx+M[6]*ny+M[10]*nz]);
        j=G2.P.length/3; G2.P.push(M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]); G2.Nm.push(n3[0],n3[1],n3[2]);
        if(puv) G2.T.push(puv[0],puv[1]);
        else if(ar){ const u=Math.min(1,Math.max(0,T[v*2]*m.rep[0])),w=Math.min(1,Math.max(0,T[v*2+1]*m.rep[1])); G2.T.push((ar.x+.5+u*(ar.w-1))/ATLAS.W,1-(ar.y+.5+(1-w)*(ar.h-1))/ATLAS.H); }
        else G2.T.push(T[v*2]*m.rep[0],T[v*2+1]*m.rep[1]); map.set(v,j); } G2.I.push(j); } };
  (function walk(n,M,keepF){ if(!n.vis||skip(n)) return; keepF=keepF||!!n._keep;
    if(n.mesh){ const g=n.mesh.geo; for(const run of runsOf(n.mesh)) if(run.m) add(n,M,run,g,keepF); n.mesh=null; merged++; }
    for(const k of n.kids){ const L=m4.compose(m4.make(),k.p,k.r,k.s),C=m4.make(); m4.mul(C,M,L); walk(k,C,keepF); } })(root,m4.make(),false);
  (function prune(n){ for(let i=n.kids.length-1;i>=0;i--){ const k=n.kids[i]; prune(k); if(!k.mesh&&!k.kids.length&&!skip(k)&&!k._ref) n.kids.splice(i,1); } })(root);
  const prev=GEO_TEMP; GEO_TEMP=true;
  for(const b of outs){ const g=new Geo(); g.P=b.g.P; g.Nm=b.g.Nm; g.T=b.g.T; g.I=b.g.I; g.groups=[{start:0,count:g.I.length,mi:0}]; const n=mk(g,b.m,root); if(b.heat!=null) n._heat=b.heat; if(b.keep) n._keep=true; }
  GEO_TEMP=prev; return {merged,meshes:outs.length}; }
/* the level: everything static, in 12 m tiles (each tile is culled on its own) */
function batchStatic(root){ PAL=makePalette(); return meshMerge(root,{tile:16}); }
/* a man's skinned body: torso, arms and legs are three textures (three draw calls); in the atlas they're one */
function atlasBody(C){ const b=C.J&&C.J.body; if(!b||!b.mesh||b.mesh.geo.vao) return; const g=b.mesh.geo,mats=b.mesh.mats;
  if(mats.some(m=>!m||!m.tex||m.cut||m.unlit||m.rep[0]!==1||m.rep[1]!==1)) return; const rects=mats.map(m=>atlasRect(m.tex)); if(rects.some(r=>!r)) return;
  const done=new Set(); for(const gr of g.groups){ const r=rects[gr.mi]; for(let i=gr.start;i<gr.start+gr.count;i++){ const v=g.I[i]; if(done.has(v)) continue; done.add(v);
      const u=Math.min(1,Math.max(0,g.T[v*2])),w=Math.min(1,Math.max(0,g.T[v*2+1])); g.T[v*2]=(r.x+.5+u*(r.w-1))/ATLAS.W; g.T[v*2+1]=1-(r.y+.5+(1-w)*(r.h-1))/ATLAS.H; } }
  const am=mergeMat('atlasBody|'+mats[0].color.join()+'|'+mats[0].emis.join(),mats[0],{tex:ATLAS.t,rep:[1,1]}); b.mesh.mats=mats.map(()=>am); b.mesh.runs=null; }
/* a man's rigid parts: the bits of each hand and each shoe, the head's extras (not the face, which changes with his expression) */
function mergeChar(C){ const J=C.J; for(const k of ['openL','openR','wrapL','wrapR','ankleL','ankleR']) if(J[k]) meshMerge(J[k],{tile:0,keep:n=>n!==J[k]&&!!Object.values(J).includes(n)});
  if(J.head) meshMerge(J.head,{tile:0,keep:n=>n===J.headMesh||(n!==J.head&&Object.values(J).includes(n))}); }
/* one thing that moves as a whole (a gun on a rack, on the floor, in a man's hand): all its parts become a mesh or two */
function mergeTree(n){ if(!n) return; return meshMerge(n,{tile:0,pal:PAL||(PAL=makePalette())}); }

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

/* =====================================================================================================
   CARS. A body lofted through cross-sections from the nose to the tail (bumper, hood rising to the cowl, doors, the deck),
   a cabin lofted the same way (windshield, roof, back glass), and painted textures doing the rest: door seams and handles,
   the rubber trim, dark wheel arches, the grille and lights, rust, a primer door, dust. Separate bumpers, mirrors, plates,
   tires with hubcaps or bare steel rims. Kinds: an old 4-door compact (sedan), a pickup with its bed, an SUV.
   Burnt: no glass, no tires, sitting on its rims, charred and rusted.
   ===================================================================================================== */
const CARS={
  sedan:{L:4.2,W:1.66,ys:.24,nose:.7,belt:.88,deck:.86,tail:.7,wz:[1.3,-1.3],wr:.29,rw:.64,cab:[[.66,.88],[-.02,1.36],[-.98,1.36],[-1.38,.88]],posts:[[.47,.52],[.86,1]],doors:[.33,.55,.75]},
  pickup:{L:4.9,W:1.76,ys:.34,nose:.86,belt:1.0,deck:1.0,tail:.98,wz:[1.6,-1.55],wr:.36,rw:.7,cab:[[1.22,1.0],[.72,1.7],[-.22,1.7],[-.3,1.0]],posts:[[.86,1]],doors:[.31,.53],bed:[-.4,-2.4]},
  suv:{L:4.6,W:1.8,ys:.36,nose:.9,belt:1.02,deck:1.02,tail:1.0,wz:[1.45,-1.42],wr:.36,rw:.74,cab:[[1.02,1.02],[.46,1.78],[-2.02,1.78],[-2.2,1.02]],posts:[[.36,.4],[.68,.72],[.92,1]],doors:[.3,.5,.69],rack:true}};
/* a loft through closed cross-sections (each a list of [x,y], counter-clockwise seen from the front) at zs[i], front to back.
   mat(i,e) gives the material index of the face between section i and i+1 along edge e (-1: no face); uv(mi,[x,y,z]) its texture coordinates */
function loftGeo(secs,zs,mat,uv,caps){ const g=new Geo(),G={},n=secs[0].length;
  const quad=(mi,P)=>{ const [A,B,C,D]=P,n3=norm3(v3.cross(v3.sub(D,A),v3.sub(B,A))); const base=g.P.length/3; for(const p of P) g.v(p,n3,uv(mi,p)); (G[mi]||(G[mi]=[])).push(base,base+3,base+2,base,base+2,base+1); };
  for(let i=0;i<secs.length-1;i++) for(let e=0;e<n;e++){ const mi=mat(i,e); if(mi<0) continue; const a=secs[i][e],b=secs[i][(e+1)%n],c=secs[i+1][(e+1)%n],d=secs[i+1][e];
    const P=[[a[0],a[1],zs[i]],[b[0],b[1],zs[i]],[c[0],c[1],zs[i+1]],[d[0],d[1],zs[i+1]]]; if(Math.hypot(...v3.sub(P[0],P[1]))<1e-4&&Math.hypot(...v3.sub(P[2],P[3]))<1e-4) continue; quad(mi,P); }
  for(const [si,mi,dir] of caps||[]){ const s=secs[si],z=zs[si],base=g.P.length/3,nz=[0,0,dir]; for(const p of s) g.v([p[0],p[1],z],nz,uv(mi,[p[0],p[1],z])); const L=G[mi]||(G[mi]=[]);
    for(let k=1;k<n-1;k++) dir>0?L.push(base,base+k,base+k+1):L.push(base,base+k+1,base+k); }
  for(const mi of Object.keys(G).map(Number).sort((a,b)=>a-b)){ const start=g.I.length; for(const i of G[mi]) g.I.push(i); g.groups.push({start,count:G[mi].length,mi}); }
  return g; }
const CARTEX=new Map();
function carTex(kind,paint,o){ const key=kind+paint+(o.burnt?'b':'')+(o.door||'')+(o.plate||''); if(CARTEX.has(key)) return CARTEX.get(key); const S=CARS[kind],hp='#'+paint.toString(16).padStart(6,'0'),r=rng(paint%9973+kind.length);
  const burnt=o.burnt,base=burnt?'#2a2420':hp,lite=burnt?'#3a2e26':mix(hp,'#ffffff',.22),dark=burnt?'#140f0c':mix(hp,'#000000',.35);
  const rust=(g,n,y0,y1,w)=>{ for(let i=0;i<n;i++) ell(g,r()*w,y0+r()*(y1-y0),1+r()*2.5,1+r()*1.5,r()>.5?'#7a3a18':'#5a2a14'); };
  const char=(g,w,h)=>{ if(!burnt) return; for(let i=0;i<40;i++) ell(g,r()*w,r()*h,2+r()*4,1+r()*3,['#4a2a18','#6a3a1a','#1a1410','#3a3a36'][r()*4|0]); };
  const SW=128,SH=32,ys=S.ys,yt=S.belt+.04;
  const side=P2(SW,SH,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,lite],[.25,base],[.75,base],[1,dark]]);
    const px=z=>(S.L/2-z)/S.L*w, py=y=>(1-(y-ys)/(yt-ys))*h;
    if(o.door&&!burnt){ R(g,'#'+o.door.toString(16).padStart(6,'0'),S.doors[0]*w|0,0,(S.doors[1]-S.doors[0])*w|0,h); } /* a door from another car */
    R(g,'rgba(255,255,255,.18)',0,h*.32|0,w,1); R(g,'rgba(0,0,0,.25)',0,h*.32+1|0,w,1); /* the crease */
    R(g,burnt?'#0e0c0a':'#141416',0,h*.55|0,w,2); /* rubber trim */
    for(const u of S.doors) R(g,'rgba(0,0,0,.55)',u*w|0,2,1,h-6); R(g,'rgba(0,0,0,.45)',S.doors[0]*w|0,h-5,(S.doors[S.doors.length-1]-S.doors[0])*w|0,1);
    for(let i=0;i<S.doors.length-1;i++) R(g,burnt?'#2a2622':'#1a1a1c',(S.doors[i+1]*w-6)|0,h*.42|0,4,1);
    for(const wz of S.wz){ const cx=px(wz),cy=py(S.wr),rx=S.wr*1.22/S.L*w,ry=S.wr*1.22/(yt-ys)*h; ell(g,cx,cy,rx+1.5,ry+1.5,dark); ell(g,cx,cy,rx,ry,'#050506'); R(g,'#050506',cx-rx|0,cy|0,rx*2|0,h); }
    vfill(g,0,h*.7,w,h*.3,[[0,'rgba(80,60,40,0)'],[1,'rgba(80,60,40,.6)']]); rust(g,burnt?30:5,h*.65,h,w); char(g,w,h); },3,paint%997+1);
  const top=P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,base],[.5,lite],[1,base]]); const pz=z=>(S.L/2-z)/S.L*w;
    R(g,'rgba(0,0,0,.4)',pz(S.cab[0][0]+.04)|0,0,1,h); if(!S.bed) R(g,'rgba(0,0,0,.4)',pz(S.cab[3][0]-.05)|0,0,1,h); for(const y of [3,h-4]) R(g,'rgba(0,0,0,.2)',0,y,pz(S.cab[0][0])|0,1);
    for(let i=0;i<10;i++) ell(g,r()*w,r()*h,1+r()*2,1,'rgba(90,80,60,.35)'); rust(g,burnt?20:2,0,h,w); char(g,w,h); },3,paint%991+2);
  const front=P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,lite],[1,base]]); const yN=S.nose;
    R(g,burnt?'#1a1612':'#101012',w*.28|0,h*.28|0,w*.44|0,h*.3|0); for(let y=h*.32|0;y<h*.56;y+=3) R(g,burnt?'#2a2420':'#3a3a3e',w*.29|0,y,w*.42|0,1);
    for(const x of [w*.05,w*.73]){ R(g,'#2a2a2e',x|0,h*.26|0,w*.22|0,h*.24|0); R(g,burnt?'#3a3530':'#c8ccc0',x+1|0,h*.28|0,w*.2|0,h*.2|0); R(g,'rgba(255,255,255,.5)',x+2|0,h*.3|0,3,2); R(g,burnt?'#3a2a1a':'#d8902a',x+1|0,h*.5|0,w*.07|0,2); }
    R(g,burnt?'#1a1612':'#8a8a86',0,h*.7|0,w,h*.18|0); R(g,'#e8e2c8',w*.4|0,h*.74|0,w*.2|0,h*.12|0); char(g,w,h); },3,paint%983+3);
  const rear=P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,lite],[1,base]]);
    for(const x of [w*.04,w*.76]){ R(g,'#1a0a0a',x|0,h*.22|0,w*.2|0,h*.26|0); R(g,burnt?'#3a1a14':'#a8201a',x+1|0,h*.24|0,w*.18|0,h*.14|0); R(g,burnt?'#3a2a1a':'#d8902a',x+1|0,h*.38|0,w*.18|0,h*.06|0); }
    if(S.bed) R(g,'rgba(0,0,0,.45)',0,3,w,1);
    R(g,burnt?'#1a1612':'#8a8a86',0,h*.72|0,w,h*.16|0); R(g,'#e8e2c8',w*.36|0,h*.48|0,w*.28|0,h*.18|0); if(!burnt) text(g,o.plate||'CHH',w*.38|0,h*.5|0,'#1a3a6a'); R(g,'#2a2a2e',w*.47|0,h*.36|0,3,2); char(g,w,h); },3,paint%977+4);
  const gside=P2(64,16,(g,w,h)=>{ vfill(g,0,0,w,h,burnt?[[0,'#0a0806'],[1,'#141008']]:[[0,'#3a4656'],[.5,'#1a2230'],[1,'#0e121a']]);
    if(!burnt){ R(g,'rgba(200,210,230,.2)',w*.1|0,3,w*.3|0,1); R(g,'rgba(200,210,230,.12)',w*.55|0,5,w*.25|0,1); ell(g,w*.3,h*.7,3,3,'rgba(0,0,0,.4)'); ell(g,w*.62,h*.7,3,3,'rgba(0,0,0,.4)'); }
    R(g,burnt?'#1a1410':dark,0,0,w,2); R(g,burnt?'#1a1410':'#121214',0,h-2,w,2); for(const [a,b] of S.posts) R(g,burnt?'#2a2420':base,a*w|0,0,Math.max(2,(b-a)*w|0),h); R(g,burnt?'#2a2420':base,0,0,3,h); },3,paint%971+5);
  const roof=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,base],[.5,lite],[1,base]]); for(const y of [1,h-2]) R(g,'rgba(0,0,0,.35)',0,y,w,1); for(let i=0;i<6;i++) ell(g,r()*w,r()*h,1+r()*2,1,'rgba(90,80,60,.3)'); char(g,w,h); },3,paint%967+6);
  const bed=P2(32,32,(g,w,h)=>{ R(g,'#1c1c1e',0,0,w,h); for(let y=2;y<h;y+=4) R(g,'#2a2a2e',0,y,w,1); R(g,dark,0,0,w,3); R(g,dark,0,h-3,w,3); R(g,'rgba(0,0,0,.6)',0,3,w,2); R(g,'rgba(0,0,0,.6)',0,h-5,w,2); rust(g,6,0,h,w); },3,paint%961+7);
  const T={side,top,front,rear,gside,roof,bed}; CARTEX.set(key,T); return T; }
const tCarShadow=cutTex(16,32,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const d=Math.max(Math.abs(x-7.5)/8,Math.abs(y-15.5)/16); if(d<.8||(d<.93&&((x+y)&1))) R(g,'rgba(0,0,0,.85)',x,y,1,1); } },1710);
const tWindGlass=P2(32,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#4a5868'],[.4,'#1e2836'],[1,'#0c1018']]); R(g,'rgba(220,230,240,.25)',4,4,10,1); R(g,'rgba(220,230,240,.15)',18,7,8,1); R(g,'#0a0a0c',4,h-2,10,1); R(g,'#0a0a0c',18,h-2,10,1); R(g,'#141416',0,0,w,1); },3,1711);
const tGlassGone=P2(16,16,(g,w,h)=>{ R(g,'#0a0806',0,0,w,h); for(let i=0;i<10;i++) R(g,'#1a120c',i*3%w,i*7%h,2,1); },2,1712);
const tTireSide=P2(16,16,(g,w,h)=>{ R(g,'#141416',0,0,w,h); ell(g,8,8,7,7,'#1c1c1e'); ell(g,8,8,4.6,4.6,'#101012'); },2,1713);
const tHubcap=P2(16,16,(g,w,h)=>{ R(g,'#141416',0,0,w,h); ell(g,8,8,6,6,'#a8acb0'); ell(g,8,8,4,4,'#8a8e92'); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; ell(g,8+Math.cos(a)*3.6,8+Math.sin(a)*3.6,1,1,'#2a2a2e'); } ell(g,8,8,1.4,1.4,'#c8ccd0'); },2,1714);
const tSteelRim=P2(16,16,(g,w,h)=>{ R(g,'#141416',0,0,w,h); ell(g,8,8,5.4,5.4,'#2a2a2c'); ell(g,8,8,3,3,'#3a3a3c'); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; ell(g,8+Math.cos(a)*2.2,8+Math.sin(a)*2.2,.8,.8,'#101012'); } },2,1715);
const tRimRust=P2(16,16,(g,w,h)=>{ R(g,'#2a1a10',0,0,w,h); ell(g,8,8,6,6,'#5a3018'); ell(g,8,8,3.4,3.4,'#3a2010'); for(let i=0;i<5;i++) ell(g,3+i*2.4,5+(i%3)*3,1,1,'#7a4020'); },2,1716);
Object.assign(FX,{
  /* paint: hex colour. o: {burnt, door (another colour for the front door), hub (true: hubcaps, false: bare rims), plate} */
  auto(g,paint=0xd8d4cc,kind='sedan',o={}){ const S=CARS[kind],T=carTex(kind,paint,o),burnt=!!o.burnt,W=S.W,L=S.L,ys=S.ys,drop=burnt?.12:0;
    const body=N(g,0,-drop,0,burnt?.02:0,0,burnt?-.025:0);
    /* the body: nose, hood to the cowl, doors, the deck or the bed, the tail */
    const A=S.cab[0][0],D=S.cab[S.cab.length-1][0];
    const zs=[L/2,L/2-.1,A+.4,A,(D+A)/2,D,-L/2+.14,-L/2], tops=[S.nose-.05,S.nose,(S.nose+S.belt)/2+.02,S.belt,S.belt,S.deck,S.tail,S.tail-.05];
    const sec=(i)=>{ const hb=W/2-(i===0||i===7?.06:.03),ht=W/2-(i===0||i===7?.07:.05),yb=ys+(i===0||i===7?.04:0),yt=tops[i]; return [[-hb,yb],[hb,yb],[ht,yt-.07],[ht-.05,yt],[-ht+.05,yt],[-ht,yt-.07]]; };
    const SEC=zs.map((_,i)=>sec(i)),bedR=S.bed;
    const uvB=(mi,p)=>{ const [x,y,z]=p,u=(L/2-z)/L;
      if(mi===1) return [u,(y-ys)/(S.belt+.04-ys)]; if(mi===2||mi===9) return [mi===9?(bedR[0]-z)/(bedR[0]-bedR[1]):u,(x+W/2)/W];
      if(mi===3) return [(x+W/2)/W,(y-ys)/(S.nose-ys)]; if(mi===4) return [(W/2-x)/W,(y-ys)/(S.tail-ys)]; return [u,0]; };
    const matB=(i,e)=>e===0?0:(e===3?(bedR&&zs[i]<=bedR[0]+.01&&zs[i+1]>=bedR[1]-.2?9:2):1);
    const gb=loftGeo(SEC,zs,matB,uvB,[[0,3,1],[7,4,-1]]);
    mk(gb,[col(0x0a0a0c),MT(T.side),MT(T.top),MT(T.front),MT(T.rear),MT(T.side),MT(T.side),MT(T.side),MT(T.side),MT(T.bed)],body);
    /* the cabin: windshield, roof, back glass, side glass with the pillars painted in */
    const C=S.cab,hb=W/2-.07,hr=S.rw,belt=S.belt,top=C[1][1];
    const csec=C.map(([z,y])=>[[-hb,belt],[hb,belt],[y>belt+.01?hr:hb,y],[y>belt+.01?-hr:-hb,y]]),czs=C.map(c=>c[0]);
    const uvC=(mi,p)=>{ const [x,y,z]=p,v=(y-belt)/(top-belt); if(mi===5) return [(A-z)/(A-D),v]; if(mi===6) return [(x+W/2)/W,v]; if(mi===8) return [(W/2-x)/W,v]; return [(A-z)/(A-D),(x+W/2)/W]; };
    const matC=(i,e)=>e===0?-1:e===2?[6,7,8][i]:5;
    const gl_=burnt?MT(tGlassGone):MT(tWindGlass);
    mk(loftGeo(csec,czs,matC,uvC,[]),[null,null,null,null,null,burnt?MT(tGlassGone):MT(T.gside),gl_,MT(T.roof),gl_],body);
    /* bumpers, mirrors, plates */
    const bm=burnt?col(0x2a2018):col(kind==='sedan'?0x8a8a86:0x2a2a2c);
    mk(box(W+.04,.16,.14),bm,body,0,ys+.12,L/2-.02); mk(box(W+.04,.16,.14),bm,body,0,ys+.12,-L/2+.02);
    for(const s of [-1,1]){ mk(box(.05,.1,.16),burnt?col(0x2a2018):col(paint),body,s*(W/2+.04),belt+.08,A-.12); mk(box(.06,.04,.04),col(0x141416),body,s*(W/2-.01),belt+.06,A-.06); }
    if(S.rack&&!burnt) for(const s of [-1,1]) mk(box(.04,.05,2.0),col(0x2a2a2c),body,s*(hr-.06),top+.04,(C[1][0]+C[2][0])/2);
    if(S.bed){ mk(box(W-.1,.04,bedR[0]-bedR[1]),col(0x141416),body,0,ys+.3,(bedR[0]+bedR[1])/2); for(const s of [-1,1]) mk(box(.06,.04,bedR[0]-bedR[1]),burnt?col(0x2a2018):col(paint),body,s*(W/2-.04),S.deck+.01,(bedR[0]+bedR[1])/2); }
    if(kind!=='sedan'&&!burnt) for(const s of [-1,1]) mk(box(.3,.32,.02),col(0x101012),body,s*(W/2-.2),ys+.1,S.wz[1]-S.wr-.12); /* mud flaps */
    /* wheels: tires with hubcaps or bare rims; burnt cars sit on rusted rims */
    for(const wz of S.wz) for(const s of [-1,1]){ const w=N(g,s*(W/2-.13),S.wr-drop*1.2,wz,0,0,Math.PI/2);
      if(burnt){ mk(cyl(S.wr*.68,S.wr*.68,.16,10),[MT(tRimRust),MT(tRimRust),MT(tRimRust)],w); continue; }
      mk(cyl(S.wr,S.wr,.2,12),[col(0x111113),MT(tTireSide),MT(tTireSide)],w); mk(cyl(S.wr*.62,S.wr*.62,.03,10),[col(0x2a2a2c),MT(o.hub===false?tSteelRim:tHubcap),MT(o.hub===false?tSteelRim:tHubcap)],w,0,s*.1,0); }
    /* a shadow under it */
    mk(plane(W+.12,L+.12),MT(tCarShadow,{cut:true}),g,0,.008,0,-Math.PI/2); }
});

/* ---------- a notch more: castillos and dalas (the concrete frame of every block house), drums, litter, stains, trees, curtains ---------- */
const tConcBandCo=P2(32,16,(g,w,h,r=rng(1721))=>{ vfill(g,0,0,w,h,[[0,'#9a968c'],[1,'#86827a']]); for(let x=0;x<w;x+=8) R(g,'rgba(0,0,0,.12)',x,0,1,h); for(let i=0;i<6;i++){ const x=r()*w|0; vfill(g,x,0,2,h,[[0,'rgba(50,40,30,.3)'],[1,'rgba(50,40,30,0)']]); } for(let i=0;i<20;i++) R(g,'rgba(255,255,255,.08)',r()*w|0,r()*h|0,1,1); },6,1721);
const mBand=MT(tConcBandCo);
/* corner columns and the band along the top, a little proud of the block wall */
function frameBox(B,x0,z0,x1,z1,h,o={}){ const G=B.g,t=.07+WT/2,m=o.mat||mBand;
  for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],...(o.extra||[])]) mk(box(.22,h,.22),m,G,x,h/2,z);
  if(o.band!==false){ const bh=.2; mk(box(x1-x0+.24,bh,WT+.1),m,G,(x0+x1)/2,h-bh/2,z0); mk(box(x1-x0+.24,bh,WT+.1),m,G,(x0+x1)/2,h-bh/2,z1);
    mk(box(WT+.1,bh,z1-z0),m,G,x0,h-bh/2,(z0+z1)/2); mk(box(WT+.1,bh,z1-z0),m,G,x1,h-bh/2,(z0+z1)/2); }
  if(o.rebar) for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1],...(o.extra||[])]) { const n=N(G,x,h,z); FX.rebar(n,4,Math.round(x*7+z)); } }
const tTamboCo=P2(16,16,(g,w,h)=>{ R(g,'#2a5aa8',0,0,w,h); for(const y of [3,8,13]) { R(g,'#3a6ac0',0,y,w,1); R(g,'#1e4a8a',0,y+1,w,1); } vfill(g,0,h*.7,w,h*.3,[[0,'rgba(60,40,20,0)'],[1,'rgba(60,40,20,.4)']]); },3,1722);
const tOilCo=cutTex(16,16,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const d=Math.hypot(x-7.5,(y-7.5)*1.3)/7+(r()-.5)*.3; if(d<1) R(g,d<.5?'rgba(10,10,12,.8)':'rgba(20,18,16,.55)',x,y,1,1); } },1723);
const tCrackCo=cutTex(32,32,(g,w,h,r)=>{ g.strokeStyle='rgba(20,16,12,.85)'; g.lineWidth=1; for(let k=0;k<3;k++){ let x=16,y=16; g.beginPath(); g.moveTo(x,y); for(let i=0;i<10;i++){ x+=(r()-.5)*7; y+=(r()-.5)*7; g.lineTo(x,y); } g.stroke(); } },1724);
const tTrackCo=cutTex(16,64,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(const x0 of [2,10]) for(let x=x0;x<x0+4;x++) if(((y>>1)+x)%3&&r()<.75) R(g,'rgba(30,22,16,.45)',x,y,1,1); },1725);
const tCurtain=(c1,c2,seed)=>cutTex(16,32,(g,w,h,r)=>{ for(let x=0;x<w;x++){ const k=.75+.25*Math.sin(x*1.3); const col=mix((x>>2)%2?c1:c2,'#000000',1-k); const bot=h-1-(r()*3|0); R(g,col,x,0,1,bot); } R(g,'rgba(0,0,0,.4)',0,0,w,2); },seed);
const tCurtACo=tCurtain('#8a2a4a','#a8486a',1726), tCurtBCo=tCurtain('#2a6a8a','#3a8aa8',1727), tCurtCCo=tCurtain('#c8a040','#a88030',1728);
const tLeavesCo=cutTex(16,16,(g,w,h,r)=>{ for(let i=0;i<60;i++){ const x=r()*w,y=r()*h; if(Math.hypot(x-8,y-8)<7.5) R(g,['#2a3a1a','#3a4a22','#1e2a14','#4a5a2a'][r()*4|0],x|0,y|0,2,1); } },1729);
const tFrondCo=cutTex(32,8,(g,w,h,r)=>{ R(g,'#3a4a1e',0,3,w,2); for(let x=1;x<w-1;x+=2){ const l=3*(1-Math.abs(x-w*.45)/(w*.55)); R(g,r()>.5?'#4a5a24':'#2e3c18',x,4-l|0,1,l*2|0+1); } },1730);
const tCalendarCo=P2(16,24,(g,w,h)=>{ R(g,'#f2ece0',0,0,w,h); vfill(g,1,1,w-2,10,[[0,'#e86a3a'],[1,'#3a8a9a']]); ell(g,8,6,3,3,'#f2c84a'); for(let y=13;y<23;y+=2) for(let x=1;x<w-1;x+=2) R(g,'#5a5a56',x,y,1,1); },4,1731);
Object.assign(FX,{
  tambo(g,c){ mk(lathe([[0,.27,.27],[.04,.29,.29],[.3,.28,.28],[.32,.3,.3],[.58,.28,.28],[.6,.3,.3],[.86,.28,.28],[.9,.25,.25]],10),MT(tTamboCo,{color:c||0xffffff}),g); mk(cyl(.2,.2,.02,10),col(0x1a3a6a),g,0,.91,0); },
  litter(g,n=8,seed=1,sp=1.5){ const r=rng(seed); for(let i=0;i<n;i++){ const x=(r()-.5)*sp*2,z=(r()-.5)*sp*2,k=r();
      if(k<.3) mk(cyl(.035,.03,.1,6),col([0xe8e2d4,0xc8302a,0x2a6ac8][i%3]),g,x,.035,z,Math.PI/2,r()*3,0);
      else if(k<.55) mk(box(.18,.006,.12),col([0xe8e2d4,0xd8c890,0x9a9a92][i%3]),g,x,.006,z,0,r()*3,0);
      else if(k<.75) mk(box(.22,.12,.18,{tw:.6,td:.6}),col([0x141416,0xe8e2d4,0x2a5a2a][i%3]),g,x,.06,z,0,r()*3,0);
      else mk(cyl(.03,.03,.12,6),col(0x9aa0a4),g,x,.03,z,Math.PI/2,r()*3,0); } },
  decal(g,t,w,d,ry=0){ mk(plane(w,d),MT(t,{cut:true}),g,0,.011+ry*.0001,0,-Math.PI/2,0,ry); },
  mesquite(g,seed=1){ const r=rng(seed),bark=MT(tBark); let x=0,z=0,y=0; for(let i=0;i<3;i++){ const len=.7+r()*.4,a=(r()-.5)*.6,b=(r()-.5)*.6; mk(box(.16-i*.03,len,.16-i*.03,{at:[0,len/2,0]}),bark,g,x,y,z,a,0,b); x+=Math.sin(b)*-len*.5; z+=Math.sin(a)*len*.5; y+=len*.9; }
    for(let i=0;i<9;i++){ const a=r()*6.28,d=.4+r()*1.4,h=y+(r()-.3)*.8; mk(plane(1.4+r(),1.0+r()*.6),MT(tLeavesCo,{cut:true,double:true}),g,x+Math.cos(a)*d,h,z+Math.sin(a)*d,(r()-.5)*.6,a,(r()-.5)*.3); } },
  palm(g,h=6,seed=2){ const r=rng(seed),bark=MT(tBark); for(let i=0;i<6;i++){ const y=i*h/6; mk(cyl(.15-i*.01,.17-i*.01,h/6+.02,6),bark,g,Math.sin(i*.4)*.08*i,y+h/12,0); }
    const top=N(g,Math.sin(2.4)*.4,h,0); for(let i=0;i<9;i++){ const a=i/9*6.28,f=N(top,0,0,0,0,a,0); mk(plane(2.2,.55),MT(tFrondCo,{cut:true,double:true}),f,1.05,-.25,0,0,0,-.35-r()*.3); } },
  curtain(g,w=.95,h=1.9,t=tCurtACo){ mk(plane(w,h),MT(t,{cut:true,double:true}),g,0,2.05-h/2,0); mk(box(w+.1,.02,.02),mIron,g,0,2.06,0); },
  roofstuff(g,seed=1){ const r=rng(seed),k=r(); if(k<.3) FX.gascyl(g); else if(k<.55) FX.pchair(N(g,0,0,0,0,r()*6,0)); else if(k<.8) FX.tambo(g); else { mk(box(.03,2.2,.03,{at:[0,1.1,0]}),mIron,g); for(let i=0;i<4;i++) mk(box(.6-i*.1,.02,.02),mIron,g,0,1.4+i*.22,0); } }
});

/* =====================================================================================================
   THE WIDER COLONIA: the night sky over the roofs, better streets, tiled house fronts, awnings, painted business signs, weeds,
   and the pieces of the side areas (junkyard, cantina, plaza, church, soccer court, mechanic's yard, the arroyo).
   ===================================================================================================== */
/* the sky: drawn past the fog (nofog), on big planes at the world's edge. Navy overhead, the city's sodium haze at the horizon,
   hills with the lights of the rest of Puerto Seco, the moon behind thin cloud */
const tSkyCo=P2(512,160,(g,w,h)=>{ const r=rng(1741); vfill(g,0,0,w,h,[[0,'#03040a'],[.45,'#090c18'],[.72,'#1a1824'],[.86,'#33281f'],[1,'#3a2c22']]);
  for(let i=0;i<70;i++){ const y=r()*h*.5; R(g,`rgba(220,224,240,${(.25+r()*.5).toFixed(2)})`,r()*w|0,y|0,1,1); }
  for(let i=0;i<5;i++){ const cx=r()*w,cy=h*(.15+r()*.3); for(let k=0;k<14;k++) ell(g,cx+(r()-.5)*90,cy+(r()-.5)*8,20+r()*30,2+r()*3,'rgba(40,40,56,.18)'); }
  const hill=(base,amp,col,seed)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x+=3) g.lineTo(x,base-Math.sin(x*.018+seed)*amp-Math.sin(x*.07+seed*2)*amp*.35); g.lineTo(w,h); g.fill(); };
  hill(h*.8,9,'#0d0b10',3); for(let i=0;i<260;i++){ const x=r()*w,y=h*.8+r()*h*.14+Math.sin(x*.018+3)*-6; R(g,r()>.3?'rgba(236,168,84,.8)':'rgba(242,234,206,.65)',x|0,y|0,1,1); }
  hill(h*.9,3,'#070708',7); for(let i=0;i<60;i++) R(g,'rgba(242,190,110,.85)',r()*w|0,h*.91+r()*h*.07|0,1,1); },0,1741);
/* a church doorway at night: the nave seen from the street, pews in silhouette, the altar candles far back */
const tChurchIn=P2(32,48,(g,w,h)=>{ const r=rng(1749); vfill(g,0,0,w,h,[[0,'#120c0a'],[.35,'#2a1a12'],[.62,'#4a2c18'],[1,'#1c120c']]);
  ell(g,16,20,9,7,'rgba(255,190,110,.35)'); ell(g,16,21,5,4,'rgba(255,214,150,.4)'); R(g,'#5a3a22',11,24,10,3); R(g,'#e8d0a0',15,13,2,6); R(g,'#c8a878',13,15,6,1);
  for(let i=0;i<9;i++){ const x=10+r()*12|0; R(g,'#ffe6a8',x,22,1,1); R(g,'rgba(255,200,120,.5)',x,21,1,1); }
  for(let k=0;k<5;k++){ const y=29+k*3.6|0,inset=Math.max(0,5-k*1.2)|0; R(g,'#0e0806',1+inset,y,13-inset,2); R(g,'#0e0806',18,y,13-inset,2); R(g,'rgba(120,70,36,.5)',1+inset,y,13-inset,1); R(g,'rgba(120,70,36,.5)',18,y,13-inset,1); }
  R(g,'#2a1a10',15,26,2,h-26); },0,1749);
const tMoonCo=cutTex(32,32,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const d=Math.hypot(x-15.5,y-15.5); if(d<10) R(g,d<9?(r()<.12?'#b8b4a4':'#e8e2cc'):'#c8c2ac',x,y,1,1); else if(d<15&&r()<(15-d)/12*.5) R(g,'rgba(120,120,130,.35)',x,y,1,1); } },1742);
/* packed dirt street: ruts down the middle, gravel, the odd stone, less noise than the first pass */
const tRoad2Co=P2(64,64,(g,w,h)=>{ const r=rng(1743); vfill(g,0,0,w,h,[[0,'#6c5c48'],[1,'#665644']]);
  for(let i=0;i<500;i++) R(g,['#7a6a54','#5e5040','#847460','#544838','#6e604e'][r()*5|0],r()*w|0,r()*h|0,1,1);
  for(const x0 of [14,44]) for(let y=0;y<h;y++){ const x=x0+Math.sin(y*.15)*1.2; R(g,'rgba(44,34,26,.3)',x|0,y,5,1); R(g,'rgba(140,124,100,.15)',x+5|0,y,1,1); }
  for(let i=0;i<12;i++) { const x=r()*w,y=r()*h; ell(g,x,y,1.4,1,'#9a8a72'); R(g,'rgba(0,0,0,.3)',x|0,y+1|0,2,1); } },6,1743);
const tCourtCo=P2(64,32,(g,w,h)=>{ R(g,'#5a6a6e',0,0,w,h); for(let i=0;i<200;i++) R(g,'rgba(0,0,0,.08)',Math.random()*w|0,Math.random()*h|0,2,1);
  R(g,'#d8d4c8',1,1,w-2,1); R(g,'#d8d4c8',1,h-2,w-2,1); R(g,'#d8d4c8',1,1,1,h-2); R(g,'#d8d4c8',w-2,1,1,h-2); R(g,'#d8d4c8',w>>1,1,1,h-2); g.strokeStyle='#d8d4c8'; g.beginPath(); g.arc(w/2,h/2,5,0,6.3); g.stroke();
  g.strokeRect(1.5,h/2-7,8,14); g.strokeRect(w-9.5,h/2-7,8,14); },3,1744);
const tSkirtCo=(c1,c2,seed)=>P2(32,16,(g,w,h)=>{ for(let y=0;y<h;y+=4) for(let x=0;x<w;x+=4){ R(g,((x+y)>>2)%2?c1:c2,x,y,4,4); R(g,'rgba(255,255,255,.18)',x,y,4,1); R(g,'rgba(0,0,0,.25)',x,y+3,4,1); } R(g,'rgba(60,40,20,.3)',0,h-3,w,3); },3,seed);
const SKIRTS=[tSkirtCo('#8a3a2a','#a84a34',1745),tSkirtCo('#2a5a7a','#3a6e90',1746),tSkirtCo('#d8d2c0','#b8b2a0',1747),tSkirtCo('#3a6a3a','#4a7e4a',1748)];
const tWeedsCo=cutTex(16,16,(g,w,h,r)=>{ for(let i=0;i<14;i++){ let x=1+r()*14,y=h-1; const c=['#3a4a22','#4a5a2a','#5a5a2e','#2e3a1a'][r()*4|0]; for(let k=0;k<5+r()*9;k++){ R(g,c,x|0,y|0,1,1); x+=(r()-.5)*1.2; y-=1; } } },1749);
const tAwningCo=(a,b,seed)=>P2(32,8,(g,w,h)=>{ for(let x=0;x<w;x+=6){ R(g,a,x,0,3,h); R(g,b,x+3,0,3,h); } R(g,'rgba(0,0,0,.3)',0,h-1,w,1); },3,seed);
const tAwnRed=tAwningCo('#a82a22','#e8e2d0',1750), tAwnGreen=tAwningCo('#2a6a3a','#e8e2d0',1751), tAwnBlue=tAwningCo('#2a4a8a','#d8d2c0',1752);
/* hand-painted signs on walls (lettered straight onto the paint) */
const wallSign=(txt,bg,fg,w=64,h=16,s=1,seed=1)=>P2(w,h,(g)=>{ if(bg) R(g,bg,0,0,w,h); const lines=txt.split('|'); lines.forEach((t,i)=>text(g,t,Math.max(1,(w-textW(t,s))>>1),2+i*(6*s+1),fg,s)); },5,seed);
const tSgTaller=wallSign('TALLER|EL GUERO','#e8d8a0','#2a2a6a',64,16,1,1753), tSgVulca=wallSign('VULCANIZADORA','#1a1a1e','#e8c83a',64,10,1,1754), tSgAgua=wallSign('AGUA|PURIFICADA','#2a6ac8','#f2f0e8',48,16,1,1755);
const tSgYonke=wallSign('YONKE|LOS PRIMOS','#c8a030','#1a1a1e',64,16,1,1756), tSgNo=wallSign('NO ESTACIONARSE','#d8d2c4','#a82a22',64,10,1,1757);
const tNeonCant=cutTex(64,16,(g,w,h)=>{ const t='LA FRONTERA'; text(g,t,(w-textW(t))>>1,2,'#ff4fb0'); text(g,'CANTINA',(w-textW('CANTINA'))>>1,9,'#4fe8ff'); },1758);
const tMuralCo=P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#1a2a4a'],[1,'#3a1a3a']]); for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; g.strokeStyle='rgba(232,184,74,.6)'; g.beginPath(); g.moveTo(32,15); g.lineTo(32+Math.cos(a)*30,15+Math.sin(a)*20); g.stroke(); }
  ell(g,32,14,7,8,'#e8e2d4'); ell(g,29,13,1.6,2,'#1a1a1e'); ell(g,35,13,1.6,2,'#1a1a1e'); R(g,'#1a1a1e',30,18,4,1); poly(g,[[24,32],[32,20],[40,32]],'#2a6a5a'); for(let i=0;i<8;i++) ell(g,6+i*7,28,2.4,2,['#e84a6a','#f2c84a','#e8e2d4'][i%3]); },4,1759);
Object.assign(FX,{
  /* a tiled skirt along the bottom of a house front */
  skirt(g,len,t,h=.6){ mk(box(len,h,.03),MT(t,{repeat:[len/.6,1]}),g,0,h/2,.015); mk(box(len,.03,.06),col(0x8a8680),g,0,h+.015,.02); },
  awning(g,w,t,d=.9){ const n=N(g,0,2.35,0,-.35,0,0); mk(box(w,.03,d,{at:[0,0,d/2]}),MT(t,{double:true,repeat:[w/1.4,1]}),n); mk(plane(w,.18),MT(t,{double:true,repeat:[w/1.4,1]}),n,0,-.09,d,0,0,0); for(const s of [-1,1]) mk(box(.02,.02,d),mIron,n,s*w/2,0,d/2); },
  weeds(g,n=4,seed=1,sp=1){ const r=rng(seed); for(let i=0;i<n;i++){ const x=(r()-.5)*sp,z=(r()-.5)*sp*.3,s=.35+r()*.4; for(let k=0;k<2;k++) mk(plane(s,s),MT(tWeedsCo,{cut:true,double:true}),g,x,s/2,z,0,k*Math.PI/2+r(),0); } },
  kiosk(g){ const m=col(0xd8d2c0),r=col(0x8a2a22); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; mk(box(.1,2.6,.1,{at:[0,1.3,0]}),m,g,Math.sin(a)*2.1,0,Math.cos(a)*2.1); }
    mk(cyl(2.3,2.3,.35,8),MT(tCbWhite),g,0,.175,0); mk(lathe([[0,2.5,2.5],[.15,2.45,2.45],[1.1,.15,.15],[1.25,0,0]],8,{capB:true}),r,g,0,2.6,0); mk(box(.06,.4,.06),m,g,0,3.9,0); },
  bench(g,len=1.8){ mk(box(len,.06,.42),MT(tWoodLight),g,0,.45,0); mk(box(len,.36,.05),MT(tWoodLight),g,0,.72,-.2); for(const s of [-1,1]) mk(box(.06,.45,.4,{at:[0,.225,0]}),mIron,g,s*(len/2-.12),0,0); },
  lamppost(g){ mk(cyl(.06,.09,3.6,6,{at:[0,1.8,0]}),mIron,g); const h=N(g,0,3.6,0); h._keep=true; mk(cyl(.16,.08,.3,6),M(null,{color:0xffd890,unlit:true}),h,0,.05,0); mk(cyl(.2,.2,.04,6),mIron,h,0,.22,0); },
  goal(g){ const m=col(0xd8d8d0); for(const s of [-1,1]) mk(cyl(.04,.04,2.0,6,{at:[0,1,0]}),m,g,0,0,s*1.5); mk(cyl(.04,.04,3,6),m,g,0,2,0,Math.PI/2,0,0); mk(plane(3,2),MT(tChain,{cut:true,double:true,repeat:[6,4]}),g,-.6,1,0,0,Math.PI/2,0); },
  floodtower(g){ mk(box(.25,9,.25,{at:[0,4.5,0]}),mIron,g); for(let y=1;y<9;y+=1.5) mk(box(.4,.04,.04),mIron,g,0,y,.15); const h=N(g,0,9,0,.5,0,0); h._keep=true; for(const s of [-1,0,1]) { mk(box(.45,.35,.2),col(0x2a2a2c),h,s*.5,0,0); mk(plane(.4,.3),M(null,{color:0xf2f4ff,unlit:true}),h,s*.5,0,.102); } },
  pila(g){ mk(box(1.4,.9,.8,{at:[0,.45,0]}),MT(tCbRaw),g); mk(box(1.2,.05,.6),col(0x3a5a6a),g,0,.88,0); mk(box(.5,.08,.6),MT(tConcBandCo),g,.4,.95,0); for(let i=0;i<3;i++) mk(box(.12,.04,.08),col([0xe84a6a,0x2a6ac8,0xf2c84a][i]),g,-.4+i*.2,.98,.1); },
  hoist(g){ const m=col(0xc8a020); for(const s of [-1,1]){ mk(box(.12,3.6,.12,{at:[0,1.8,0]}),m,g,s*1.4,0,.6,-.18*s,0,.18); mk(box(.12,3.6,.12,{at:[0,1.8,0]}),m,g,s*1.4,0,-.6,-.18*s,0,-.18); } mk(box(2.4,.14,.14),m,g,0,3.5,0); mk(box(.01,1.6,.01,{at:[0,-.8,0]}),mIron,g,0,3.4,0); mk(box(.5,.5,.6),col(0x3a3a3c),g,0,1.6,0); },
  engine(g,seed=1){ const r=rng(seed); mk(box(.6,.5,.7,{at:[0,.25,0]}),mRust,g,0,0,0,0,r()*3,0); mk(box(.5,.15,.5),col(0x2a2a2c),g,0,.55,0); },
  junkstack(g,seed=1){ const r=rng(seed),n=1+(r()*2|0); const c=[0x6a4a3a,0x3a4a5a,0x5a5a4a,0x7a2a22,0x8a8a80,0x2a3a2a];
    for(let i=0;i<n;i++){ const s=N(g,(r()-.5)*.2,i*1.25,(r()-.5)*.3,0,(r()-.5)*.25,0); FX.auto(s,c[(r()*6)|0],r()>.6?'pickup':'sedan',{burnt:true}); } },
  container(g,c=0x2a5aa8){ mk(box(2.44,2.6,6.0,{at:[0,1.3,0]}),[MT(tCorrBlue,{color:c,repeat:[4,1]}),MT(tCorrBlue,{color:c,repeat:[4,1]}),col(c),col(0x2a2a2c),MT(tCorrBlue,{color:c,repeat:[2,1]}),MT(tCorrBlue,{color:c,repeat:[2,1]})],g); },
  pooltable(g){ mk(box(2.0,.12,1.1),col(0x1e5a2e),g,0,.8,0); mk(box(2.1,.1,1.2),col(0x4a2a1a),g,0,.75,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.1,.72,.1,{at:[0,.36,0]}),col(0x3a2014),g,sx*.9,0,sz*.45); mk(cyl(.03,.03,.02,6),col(0xe8e2d4),g,.4,.87,0); mk(cyl(.03,.03,.02,6),col(0xc8302a),g,-.2,.87,.2); },
  jukebox(g){ mk(box(.7,1.4,.5,{at:[0,.7,0]}),col(0x5a2a1a),g); const f=N(g,0,0,0); f._keep=true; mk(plane(.55,.5),M(null,{color:0xff8ad0,unlit:true}),f,0,1.05,.255); mk(plane(.5,.25),M(null,{color:0x8ae8ff,unlit:true}),f,0,.6,.255); },
  stool(g){ mk(cyl(.17,.17,.05,8),col(0xa82a22),g,0,.72,0); mk(cyl(.03,.03,.7,6,{at:[0,.35,0]}),mIron,g); mk(cyl(.18,.18,.03,8),mIron,g,0,.02,0); },
  shelfstock(g,len=1.6){ FX.bookcase(g,len,1.8); }
});
