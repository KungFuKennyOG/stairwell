
/* =====================================================================================================
   MAIDEN RUN · art direction set. Runs on the Stairwell engine (src/10-engine.js): same renderer, same PS1
   pass, same painted-garment and head painters, same skinned character rig. Everything below is new content.
   ===================================================================================================== */
for(const k in groups) groups[k].vis=false;

/* ---------- canvas painting helpers: smooth gradients first, the PS1 pass quantises them ---------- */
function P2(w,h,fn,gr=0,seed=1){ return tex(w,h,null,g=>{ fn(g,w,h); if(gr) grain(g,gr,seed); }); }
function grad(g,x0,y0,x1,y1,stops){ const q=g.createLinearGradient(x0,y0,x1,y1); for(const [t,c] of stops) q.addColorStop(t,c); return q; }
function vfill(g,x,y,w,h,stops){ g.fillStyle=grad(g,0,y,0,y+h,stops); g.fillRect(x,y,w,h); }
function hfill(g,x,y,w,h,stops){ g.fillStyle=grad(g,x,0,x+w,0,stops); g.fillRect(x,y,w,h); }
function radial(g,cx,cy,r,stops){ const q=g.createRadialGradient(cx,cy,0,cx,cy,r); for(const [t,c] of stops) q.addColorStop(t,c); g.fillStyle=q; g.fillRect(cx-r,cy-r,r*2,r*2); }
function ell(g,cx,cy,rx,ry,col){ g.fillStyle=col; g.beginPath(); g.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); g.fill(); }
function poly(g,pts,col){ g.fillStyle=col; g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath(); g.fill(); }
function rgba(hex,a){ const [r,g_,b]=hexRGB(hex); return `rgba(${r},${g_},${b},${a})`; }
/* periodic noise: the same at x=0 and x=w, so every scenery tile wraps without a seam */
const pn=(x,w,s,f=3,oct=4)=>{ const a=x/w*Math.PI*2; return fbm(Math.cos(a)*f+20,Math.sin(a)*f+20,s,oct); };
function ridgeP(g,w,h,base,amp,f,seed,fill,oct=4){ g.fillStyle=fill; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x++) g.lineTo(x,base-pn(x,w,seed,f,oct)*amp); g.lineTo(w,h); g.closePath(); g.fill(); }
/* pseudo-glyph signage: blocky strokes that read as lettering at PS1 resolution without pretending to be any real script */
function glyphs(g,x,y,n,cell,col,seed,vertical=true){ const r=rng(seed); g.fillStyle=col;
  for(let i=0;i<n;i++){ const cx=vertical?x:x+i*cell, cy=vertical?y+i*cell:y, s=cell-1;
    const k=r()*4|0; if(k===0){ g.fillRect(cx,cy+1,s,1); g.fillRect(cx+(s>>1),cy,1,s); }
    else if(k===1){ g.fillRect(cx,cy,s,1); g.fillRect(cx,cy+s-1,s,1); g.fillRect(cx,cy,1,s); }
    else if(k===2){ g.fillRect(cx+1,cy,1,s); g.fillRect(cx+s-2,cy,1,s); g.fillRect(cx,cy+(s>>1),s,1); }
    else { g.fillRect(cx,cy,s,1); g.fillRect(cx+(s>>1),cy,1,s); g.fillRect(cx,cy+s-1,s,1); } } }
/* soft painted tree canopies */
function canopy(g,x,y,r,cols,seed){ const q=rng(seed); for(let i=0;i<7;i++){ const a=q()*Math.PI*2,d=q()*r*.55; ell(g,x+Math.cos(a)*d,y+Math.sin(a)*d*.7,r*(.45+q()*.25),r*(.38+q()*.2),cols[0]); }
  for(let i=0;i<5;i++){ const a=-Math.PI*.5+(q()-.5)*2,d=q()*r*.45; ell(g,x+Math.cos(a)*d-r*.15,y+Math.sin(a)*d*.6-r*.12,r*(.25+q()*.15),r*(.2+q()*.1),cols[1]); }
  if(cols[2]) for(let i=0;i<4;i++) ell(g,x-r*.3+q()*r*.4,y-r*.35+q()*r*.3,r*.12,r*.09,cols[2]); }
function trunk(g,x,y0,y1,wd,col){ g.fillStyle=col; g.fillRect(Math.round(x-wd/2),y1,Math.max(1,Math.round(wd)),y0-y1); }
function pine(g,x,base,ht,wd,cols){ for(let i=0;i<4;i++){ const t=i/4, y=base-ht*t*.85, ww=wd*(1-t*.75); poly(g,[[x-ww/2,y],[x+ww/2,y],[x,y-ht*.42]],i%2?cols[0]:cols[1]); } g.fillStyle=cols[2]; g.fillRect(x-.5,base-2,1,3); }
function sakuraTree(g,x,base,ht,seed,full=true){ trunk(g,x,base,base-ht*.55,Math.max(1.5,ht*.07),'#4a2e26');
  g.strokeStyle='#4a2e26'; g.lineWidth=1; g.beginPath(); g.moveTo(x,base-ht*.45); g.lineTo(x-ht*.22,base-ht*.75); g.moveTo(x,base-ht*.5); g.lineTo(x+ht*.25,base-ht*.78); g.stroke();
  canopy(g,x,base-ht*.72,ht*.42,['#e98aa6','#ffc4d4','#fff0f4'],seed); if(full) canopy(g,x+ht*.18,base-ht*.62,ht*.26,['#d97896','#f7b0c4'],seed+3); }

/* ---------- sky: a gradient band with soft painted clouds or stars, wrapped round a cylinder ---------- */
function skyTex(stops,o={}){ return P2(128,128,(g,w,h)=>{ vfill(g,0,0,w,h,stops);
  if(o.stars){ const r=rng(77); for(let i=0;i<120;i++){ const y=r()*h*.6; g.fillStyle=`rgba(255,248,230,${.35+r()*.6*(1-y/(h*.6))})`; g.fillRect(r()*w|0,y|0,1,1); } }
  if(o.clouds){ const r=rng(o.seed||5); for(let i=0;i<o.clouds;i++){ const x=r()*w,y=h*(.25+r()*.45),rx=8+r()*16,ry=2+r()*3.5;
      for(const dx of [-w,0,w]){ ell(g,x+dx,y+1.5,rx,ry,rgba(o.cloudShade||'#c8cfe0',.55)); ell(g,x+dx,y,rx*.9,ry*.85,rgba(o.cloudCol||'#ffffff',.85)); ell(g,x+dx-rx*.3,y-ry*.6,rx*.45,ry*.8,rgba(o.cloudCol||'#ffffff',.9)); } } }
  if(o.glow) radial(g,o.glow[0]*w,o.glow[1]*h,o.glow[2]*w,[[0,o.glow[3]],[1,'rgba(0,0,0,0)']]);
},o.night?3:2,9); }

/* ---------- ground and verge (the strip either side of the track that scrolls past) ---------- */
const flatTex=(base,seed,fn)=>P2(64,64,(g,w,h)=>{ R(g,base,0,0,w,h); const r=rng(seed); for(let i=0;i<90;i++) R(g,rgba(r()>.5?'#ffffff':'#000000',.05),r()*w|0,r()*h|0,2+(r()*4|0),1); if(fn) fn(g,w,h,r); },10,seed);
function vergeTex(kind){ return P2(128,64,(g,w,h)=>{ const r=rng(kind.length*7);
  if(kind==='grass'||kind==='meadow'||kind==='rape'){ vfill(g,0,0,w,h,[[0,'#7aa34e'],[1,'#5e8a3c']]); for(let i=0;i<500;i++){ const x=r()*w|0,y=r()*h|0; R(g,r()>.5?'#8cb85a':'#4f7a34',x,y,1,2); }
    if(kind==='rape') for(let y=4;y<h;y+=9) for(let x=0;x<w;x++) if(pn(x,w,y,6)>-.1) R(g,r()>.3?'#f2d23a':'#e2b02a',x,y+(r()*3|0),1,2);
    if(kind==='meadow') for(let i=0;i<120;i++) R(g,['#f0f0f0','#e8c84a','#c87ad0','#e86a5a'][r()*4|0],r()*w|0,r()*h|0,1,1); }
  else if(kind==='city'){ R(g,'#7d7a78',0,0,w,h); for(let x=0;x<w;x+=32){ R(g,'#6c6a69',x,0,1,h); } R(g,'#a4a09a',0,h-6,w,3); for(let x=0;x<w;x+=16) R(g,'#e8e2d2',x,30,8,2); }
  else if(kind==='night'){ R(g,'#1a1822',0,0,w,h); for(let i=0;i<40;i++){ const x=r()*w|0; R(g,['#ff3fa4','#29e0e6','#f5c542'][r()*3|0],x,r()*h|0,1,4+(r()*8|0)); } for(let x=0;x<w;x+=16) R(g,'#3a3644',x,30,8,2); }
  else if(kind==='sand'){ vfill(g,0,0,w,h,[[0,'#e6d2a0'],[1,'#d8be86']]); for(let i=0;i<300;i++) R(g,r()>.5?'#f0e0b8':'#c8aa70',r()*w|0,r()*h|0,1,1); for(let x=0;x<w;x++) if(pn(x,w,3,4)>.2) R(g,'#8aa85a',x,0,1,4+(pn(x,w,4,8)*6|0)); }
  else if(kind==='tunnel'){ R(g,'#232120',0,0,w,h); for(let i=0;i<200;i++) R(g,r()>.5?'#2e2b29':'#1a1817',r()*w|0,r()*h|0,2,1); R(g,'#3a3634',0,h-8,w,2); }
},8,kind.length); }
function sleeperTex(){ return P2(64,32,(g,w,h)=>{ R(g,'#6e6862',0,0,w,h); const r=rng(31); for(let i=0;i<400;i++) R(g,['#7e7870','#5e5852','#8a847a'][r()*3|0],r()*w|0,r()*h|0,1,1);
  for(let x=2;x<w;x+=10){ vfill(g,x,3,6,h-6,[[0,'#8a8680'],[1,'#6a6660']]); R(g,'#4a4642',x,3,6,1); } },6,31); }

/* =====================================================================================================
   THE SIX STRETCHES OF THE LINE. Each side of the track can have its own far, mid and near layer
   (pos = the +z side, neg = the -z side). Layers are 256x96 tiles; far ones are painted with the
   horizon low in the tile, mid and near ones stand on the ground at the tile's bottom edge.
   ===================================================================================================== */
const LW=256, LH=96;
/* --- Port Lumen: the capital at dawn. One skyline borrowed from everywhere --- */
function lumenFar(g,w,h,r,v){ const haze='#f2b49c',base='#6e5f92',hz=h*.86;
  let x=2,i=0; while(x<w-8){ let tw=5+(r()*14|0); if(x+tw>w-2) break; const th=18+(r()*52|0)+(i%5===2?14:0); const c=mix(base,haze,.18+r()*.38),top=hz-th;
    const kind=(i+v*3)%7;
    if(kind===1){ /* needle tower with two spheres */ const cx=x+tw/2; R(g,c,cx-1,top-18,2,th+18); ell(g,cx,top+th*.35,4,4,mix(c,'#ffffff',.12)); ell(g,cx,top+4,3,3,mix(c,'#ffffff',.18)); tw=Math.max(tw,9); }
    else if(kind===3){ /* tiered tower */ for(let k=0;k<6;k++){ const y=top+k*th/6,ww=tw*(.55+k*.08); poly(g,[[x+tw/2-ww/2,y+th/6],[x+tw/2+ww/2,y+th/6],[x+tw/2+ww*.42,y],[x+tw/2-ww*.42,y]],mix(c,'#ffffff',k%2?.02:.1)); } R(g,c,x+tw/2-.5,top-8,1,8); }
    else if(kind===5){ /* apartment slab with its block number */ vfill(g,x,top,tw+4,th,[[0,mix(c,'#ffffff',.12)],[1,c]]); text(g,String(101+((i+v*7)%9)),x+1,top+3,mix(c,'#000000',.3),1); tw+=4; }
    else { vfill(g,x,top,tw,th,[[0,mix(c,'#ffffff',.14)],[1,c]]); if(kind===0){ poly(g,[[x,top],[x+tw,top],[x+tw/2,top-tw*.9]],mix(c,'#ffffff',.1)); } }
    for(let y=top+3;y<hz;y+=3) R(g,rgba('#ffffff',.08),x,y|0,tw,1);
    x+=tw+(r()*3|0); i++; }
  vfill(g,0,h*.55,w,h*.45,[[0,rgba(haze,0)],[.6,rgba(haze,.6)],[1,'#e8a888']]); }
function lumenMid(g,w,h,r,v){ const pal=['#c8786a','#e2cfa6','#6a8aa0','#a8b4b8','#d89a60','#8a6a7a','#efe2cc','#5f7f7a','#b85a4a'];
  let x=1,i=0; const signs=['HOTEL','RAMEN','CAFE','LUMEN','BANK','KARAOKE','SUSHI','PHOTO','24H'];
  while(x<w-10){ let bw=18+(r()*24|0); if(x+bw>w-1) break; const bh=26+(r()*56|0),top=h-bh,c=pal[(r()*pal.length)|0];
    vfill(g,x,top,bw,bh,[[0,mix(c,'#fff4e0',.18)],[1,mix(c,'#000000',.18)]]); hfill(g,x+bw*.7,top,bw*.3,bh,[[0,rgba('#000000',0)],[1,rgba('#000000',.22)]]);
    R(g,mix(c,'#000000',.35),x,top,bw,1);
    for(let y=top+4;y<h-8;y+=5) for(let xx=x+2;xx<x+bw-3;xx+=4){ const lit=r()<.12; R(g,lit?'#ffd890':mix(c,'#1a2030',.55),xx,y,2,3); }
    if(r()<.5){ /* rooftop water tank */ const tx=x+3+(r()*(bw-10)|0); R(g,'#6a4a36',tx,top-7,6,6); poly(g,[[tx-1,top-7],[tx+7,top-7],[tx+3,top-11]],'#5a3c2a'); R(g,'#3a2a1e',tx,top-1,1,1); R(g,'#3a2a1e',tx+5,top-1,1,1); }
    if(r()<.55){ const sx=x+bw-7,sc=['#d8342e','#f2c230','#2ab0b8','#e85aa0'][r()*4|0]; R(g,sc,sx,top+6,6,Math.min(30,bh-14)); glyphs(g,sx+1,top+8,Math.min(6,(bh-18)/5|0),5,'#fff8e8',i*13+v); }
    else if(bw>26){ const s=signs[(i+v*4)%signs.length],tw=textW(s); if(tw<bw-4){ R(g,'#1d2a4a',x+2,top+5,tw+4,9); text(g,s,x+4,top+7,'#ffe6a8',1); } }
    R(g,mix(c,'#2a2a30',.5),x,h-8,bw,8); R(g,'#e8d2a0',x+2,h-7,bw-4,2);
    x+=bw+(r()*3|0); i++; } }
function lumenNear(g,w,h,r,v){ const bt=h-26; for(let x=0;x<w;x+=1) vfill(g,x,bt,1,26,[[0,'#7fa4a8'],[1,'#5a7c80']]);
  R(g,'#c8ccc8',0,bt-2,w,2); for(let x=0;x<w;x+=16) R(g,'#3e5a5e',x,bt,1,26);
  for(const lx of [40,168]){ R(g,'#2a2c33',lx,bt-58,2,58); R(g,'#2a2c33',lx,bt-58,10,2); R(g,'#fff2c8',lx+8,bt-57,4,2); }
  if(v===0){ trunk(g,100,bt,bt-30,3,'#4a3a2a'); canopy(g,100,bt-40,18,['#4f8a3e','#78b05a','#a8d07a'],r()*99|0); }
  else { trunk(g,220,bt,bt-26,3,'#4a3a2a'); canopy(g,220,bt-36,15,['#4f8a3e','#78b05a','#a8d07a'],r()*99|0); } }

/* --- Mirahama coast: summer sea, a gate standing in the water, a whitewashed town on the cliffs --- */
function coastSeaFar(g,w,h,r,v){ const hz=h*.84; vfill(g,0,hz,w,h-hz,[[0,'#8fd0e0'],[.25,'#3a9cc0'],[1,'#1d6a96']]);
  for(let i=0;i<60;i++) R(g,rgba('#ffffff',.5),r()*w|0,(hz+2+r()*(h-hz-2))|0,2+(r()*3|0),1);
  ridgeP(g,w,hz,hz+1,0,1,1,'rgba(0,0,0,0)');
  const isl=(cx,iw,ih,c)=>{ g.fillStyle=c; g.beginPath(); g.moveTo(cx-iw/2,hz+.5); for(let k=0;k<=20;k++){ const t=k/20; g.lineTo(cx-iw/2+iw*t,hz-Math.sin(t*Math.PI)**.7*ih*(1+.15*Math.sin(t*19+cx))); } g.lineTo(cx+iw/2,hz+.5); g.fill(); };
  isl(60+v*30,70,14,'#6f9a9a'); isl(190-v*20,44,9,'#88aeb0');
  if(v===0){ /* the great gate in the water */ const gx=150,gy=hz+6; const red='#d63a2c';
    R(g,red,gx-14,gy-26,3,26); R(g,red,gx+11,gy-26,3,26); R(g,red,gx-16,gy-20,32,2); poly(g,[[gx-21,gy-27],[gx+21,gy-27],[gx+18,gy-24],[gx-18,gy-24]],'#2a2220'); R(g,red,gx-18,gy-24,36,2);
    for(let k=0;k<6;k++) R(g,rgba(red,.5),gx-14+((k*5)%28),gy+1+k,3,1); }
  else { /* lighthouse on the island */ const lx=60+v*30,ly=hz-12; for(let k=0;k<5;k++) R(g,k%2?'#d63a2c':'#f4f0e6',lx-2,ly-14+k*3,4,3); R(g,'#2a2a2a',lx-2,ly-17,4,3); R(g,'#fff2a8',lx-1,ly-16,2,1); }
  for(let i=0;i<3;i++){ const sx=20+r()*(w-40),sy=hz+3+r()*4; poly(g,[[sx,sy],[sx+3,sy],[sx+1.5,sy-5]],'#ffffff'); } }
function coastLandFar(g,w,h,r,v){ const hz=h*.86; ridgeP(g,w,h,hz-14,10,2,61+v,'#7ea6a4'); ridgeP(g,w,h,hz-4,6,4,62+v,'#6e9a70'); R(g,'#6e9a70',0,hz,w,h-hz); vfill(g,0,h*.5,w,h*.5,[[0,rgba('#e8f4f0',0)],[1,rgba('#e8f4f0',.5)]]); }
function coastBeachMid(g,w,h,r,v){ /* low rocks and beach umbrellas: the sea stays visible behind */ vfill(g,0,h-10,w,10,[[0,'#ecd8a8'],[1,'#d8c08a']]);
  for(let i=0;i<5;i++){ const x=20+i*48+(r()*20|0),c=['#e0473a','#f2c230','#2ab0b8','#f2a0b8'][i%4]; R(g,'#5a4a3a',x,h-22,1,13); poly(g,[[x-9,h-20],[x+10,h-20],[x,h-27]],c); R(g,'#ffffff',x-3,h-20,2,1); }
  for(let i=0;i<4;i++){ const x=r()*w,rw=10+r()*16; ell(g,x,h-8,rw,6,'#7a6a5e'); ell(g,x-2,h-10,rw*.6,4,'#9a8a7a'); } }
function coastTownMid(g,w,h,r,v){ /* cliff with a whitewashed, orange-roofed town stacked up it */
  g.fillStyle='#b89a72'; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x++) g.lineTo(x,h-30-pn(x,w,71+v,2)*18-Math.sin(x/w*Math.PI)*22); g.lineTo(w,h); g.fill();
  for(let x=0;x<w;x+=1){ const y=h-30-pn(x,w,71+v,2)*18-Math.sin(x/w*Math.PI)*22; R(g,'#7a9a4e',x,y,1,3); }
  for(let i=0;i<34;i++){ const x=8+r()*(w-24)|0,top=h-30-pn(x,w,71+v,2)*18-Math.sin(x/w*Math.PI)*22,y=top+4+r()*(h-top-14),bw=7+(r()*6|0),bh=5+(r()*4|0);
    R(g,r()>.15?'#f4efe4':'#f0c8b0',x,y,bw,bh); poly(g,[[x-1,y],[x+bw+1,y],[x+bw/2,y-3]],r()>.2?'#d2683a':'#3a7ab0'); R(g,'#2a4a6a',x+2,y+2,1,2); if(bw>9) R(g,'#2a4a6a',x+bw-3,y+2,1,2); }
  if(v===1){ const hx=180,hy=h-58; vfill(g,hx,hy,26,44,[[0,'#f6c4c8'],[1,'#e2a0a8']]); for(let y=hy+4;y<hy+40;y+=5) for(let x=hx+2;x<hx+24;x+=4) R(g,'#5a7aa0',x,y,2,3); text(g,'HOTEL',hx+3,hy-6,'#d63a2c',1); }
  for(let i=0;i<5;i++){ const px=r()*w|0,py=h-6; R(g,'#7a5a3e',px,py-20,2,20); for(const a of [-1,-.4,.4,1]){ g.strokeStyle='#4f8a3e'; g.lineWidth=2; g.beginPath(); g.moveTo(px+1,py-20); g.quadraticCurveTo(px+1+a*8,py-26,px+1+a*12,py-18); g.stroke(); } } }
function palm(g,x,base,ht,seed){ const r=rng(seed); g.strokeStyle='#7a5a3e'; g.lineWidth=3; g.beginPath(); g.moveTo(x,base); g.quadraticCurveTo(x+ht*.15,base-ht*.5,x+ht*.05,base-ht); g.stroke();
  const tx=x+ht*.05,ty=base-ht; for(let k=0;k<7;k++){ const a=-Math.PI+k*Math.PI/6+(r()-.5)*.3,len=ht*.35; g.strokeStyle=k%2?'#3f7a36':'#5a9a44'; g.lineWidth=3; g.beginPath(); g.moveTo(tx,ty); g.quadraticCurveTo(tx+Math.cos(a)*len*.6,ty+Math.sin(a)*len*.5-6,tx+Math.cos(a)*len,ty+Math.sin(a)*len*.3+8); g.stroke(); }
  ell(g,tx,ty+2,3,2,'#6a4a2e'); }
function coastNear(g,w,h,r,v){ const gb=h-3; R(g,'#e8e6e0',0,gb-14,w,2); R(g,'#e8e6e0',0,gb-8,w,2); for(let x=4;x<w;x+=20) R(g,'#c8c6c0',x,gb-15,2,15);
  if(v===0){ palm(g,70,gb,60,4); palm(g,200,gb,48,5); } else { palm(g,140,gb,56,6); }
  for(let i=0;i<4;i++){ const x=20+r()*(w-40); canopy(g,x,gb-8,10,['#3f7a36','#d6408a','#f27ab0'],i*9+v); } }

/* --- Sakura Valley: spring; a white castle on one side, a stone chapel on the other --- */
function valleyFar(g,w,h,r,v){ const hz=h*.86;
  ridgeP(g,w,h,hz-24,14,2,81+v,'#8fa6c8',5);
  if(v===0){ /* the snow-capped volcano */ const cx=150,top=hz-62; poly(g,[[cx-80,hz],[cx-9,top],[cx+9,top],[cx+80,hz]],'#7d93ba'); poly(g,[[cx-26,top+22],[cx-9,top],[cx+9,top],[cx+26,top+22],[cx+16,top+19],[cx+8,top+25],[cx,top+18],[cx-8,top+25],[cx-17,top+19]],'#f4f6fa'); }
  ridgeP(g,w,h,hz-8,8,3,83+v,'#7e9ab0',4); R(g,'#7e9ab0',0,hz,w,h-hz);
  vfill(g,0,h*.45,w,h*.55,[[0,rgba('#f4f0e8',0)],[1,rgba('#f4f0e8',.55)]]); }
function valleyMid(g,w,h,r,v){ const hill=x=>h-24-pn(x,w,91+v,2)*16-Math.sin(x/w*Math.PI*2+v)*6;
  g.fillStyle='#86b05a'; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x++) g.lineTo(x,hill(x)); g.lineTo(w,h); g.fill();
  for(let x=0;x<w;x++){ const y=hill(x); for(let yy=y|0;yy<h;yy++){ const band=Math.floor((yy-y)/6+pn(x,w,7,3)*2); if(band%3===1) R(g,'#9ac066',x,yy,1,1); else if(band%5===3) R(g,'#c8b860',x,yy,1,1); } }
  for(let i=0;i<9;i++){ const x=r()*w|0; canopy(g,x,hill(x)+6,7+r()*5,['#e98aa6','#ffc4d4'],i+v*11); }
  if(v===0){ /* white castle keep */ const cx=96,b=hill(96)+2; R(g,'#8a8478',cx-22,b-8,44,8); for(let k=0;k<4;k++){ const yy=b-8-k*9,ww=34-k*7; R(g,'#f4f0e6',cx-ww/2,yy-7,ww,7); poly(g,[[cx-ww/2-5,yy-7],[cx+ww/2+5,yy-7],[cx+ww/2-2,yy-11],[cx-ww/2+2,yy-11]],'#3f5a5a'); R(g,'#2a2420',cx-ww/2+3,yy-5,2,2); R(g,'#2a2420',cx+ww/2-5,yy-5,2,2); } R(g,'#c9a23a',cx-1,b-49,2,3); }
  else { /* stone chapel and its village */ const cx=150,b=hill(150)+2; R(g,'#d8ccb4',cx-10,b-22,20,22); poly(g,[[cx-12,b-22],[cx+12,b-22],[cx,b-32]],'#a84a36'); R(g,'#d8ccb4',cx+8,b-40,8,40); poly(g,[[cx+7,b-40],[cx+17,b-40],[cx+12,b-56]],'#3a4a5a'); R(g,'#5a6a8a',cx-3,b-14,6,8);
    for(let k=0;k<5;k++){ const hx=30+k*22+(r()*6|0),hb=hill(hx)+3; R(g,'#efe6d2',hx,hb-9,12,9); poly(g,[[hx-2,hb-9],[hx+14,hb-9],[hx+6,hb-15]],k%2?'#a84a36':'#3a4a5a'); R(g,'#5a4a3a',hx+4,hb-6,3,6); } }
  if(r()<.7){ /* little red arched bridge */ const bx=210,by=hill(210)+10; g.strokeStyle='#d63a2c'; g.lineWidth=2; g.beginPath(); g.moveTo(bx-14,by); g.quadraticCurveTo(bx,by-12,bx+14,by); g.stroke(); for(const dx of [-8,0,8]) R(g,'#d63a2c',bx+dx,by-6+Math.abs(dx)*.4,1,5); } }
function valleyNear(g,w,h,r,v){ const gb=h-2; for(let x=0;x<w;x++) R(g,'#8a6a4a',x,gb-9+(x%24===0?-3:0),1,1); for(let x=0;x<w;x+=24){ R(g,'#7a5a3a',x,gb-13,2,13); } R(g,'#7a5a3a',0,gb-10,w,1);
  sakuraTree(g,60+v*40,gb,74,v*5+1); if(v===0) sakuraTree(g,190,gb,58,9,false);
  if(v===1){ /* stone lantern */ const lx=200; R(g,'#9a948a',lx-2,gb-14,4,14); R(g,'#a8a296',lx-6,gb-18,12,4); R(g,'#fff0c0',lx-2,gb-17,4,2); poly(g,[[lx-8,gb-18],[lx+8,gb-18],[lx,gb-24]],'#8a847a'); } }

/* --- Lake Alder: alpine lake, chalets, a white castle with blue spires --- */
function alpsFar(g,w,h,r,v){ const hz=h*.86; const peak=x=>hz-30-pn(x,w,101+v,3,5)*26-Math.abs(Math.sin(x/w*Math.PI*3+v))*16;
  g.fillStyle='#6f7f9a'; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x++) g.lineTo(x,peak(x)); g.lineTo(w,h); g.fill();
  for(let x=0;x<w;x++){ const y=peak(x),sn=hz-28+pn(x,w,103,6)*8; for(let yy=y|0;yy<Math.min(sn,hz);yy++) R(g,yy<y+2?'#ffffff':(x+yy)%3?'#eef2f8':'#d0d8e6',x,yy,1,1); if(pn(x,w,104,8)>.25) R(g,'#5d6c86',x,y+3,1,(hz-y)*.5); }
  ridgeP(g,w,h,hz-6,6,4,105+v,'#3f6a5a'); R(g,'#3f6a5a',0,hz,w,h-hz); vfill(g,0,h*.4,w,h*.6,[[0,rgba('#eef4f4',0)],[1,rgba('#eef4f4',.4)]]); }
function lakeShoreMid(g,w,h,r,v){ /* far shore across the lake: low, so the water shows */ const sh=h-6;
  for(let i=0;i<70;i++){ const x=r()*w; pine(g,x,sh-2+r()*3,10+r()*8,6+r()*3,['#2f5a44','#3d6e52','#3a2a1e']); }
  if(v===0){ const cx=110,b=sh-6; R(g,'#8a8478',cx-30,b-6,60,8); R(g,'#f4f0ea',cx-18,b-26,36,22); for(const [tx,tt] of [[-20,40],[16,48],[-2,58]]){ R(g,'#f4f0ea',cx+tx,b-tt,6,tt-4); poly(g,[[cx+tx-1,b-tt],[cx+tx+7,b-tt],[cx+tx+3,b-tt-10]],'#3a6ab0'); } for(let k=0;k<4;k++) R(g,'#3a4a6a',cx-14+k*8,b-18,2,3); }
  else for(let k=0;k<7;k++){ const hx=20+k*32+(r()*8|0),b=sh-2; R(g,'#f2ece0',hx,b-10,14,10); R(g,'#6a4428',hx,b-16,14,6); poly(g,[[hx-3,b-16],[hx+17,b-16],[hx+7,b-23]],'#3a3a40'); R(g,'#e04a3a',hx+2,b-8,2,2); R(g,'#e04a3a',hx+9,b-8,2,2); }
  vfill(g,0,sh,w,6,[[0,'#5a8aa8'],[1,'#3f7a9a']]); }
function meadowMid(g,w,h,r,v){ const hill=x=>h-20-pn(x,w,111+v,2)*14;
  g.fillStyle='#6a9a4a'; g.beginPath(); g.moveTo(0,h); for(let x=0;x<=w;x++) g.lineTo(x,hill(x)); g.lineTo(w,h); g.fill();
  for(let i=0;i<90;i++){ const x=r()*w; pine(g,x,hill(x)+3+r()*3,14+r()*10,8+r()*4,['#2f5a44','#3d6e52','#3a2a1e']); }
  for(let k=0;k<3;k++){ const hx=40+k*80+(r()*20|0),b=hill(hx)+10; R(g,'#f2ece0',hx,b-12,18,12); R(g,'#6a4428',hx,b-20,18,8); poly(g,[[hx-4,b-20],[hx+22,b-20],[hx+9,b-29]],'#3a3a40'); for(const dx of [3,12]) R(g,'#e04a3a',hx+dx,b-9,3,3); R(g,'#4a3020',hx+7,b-6,4,6); } }
function pineNear(g,w,h,r,v){ const gb=h-2; for(let x=0;x<w;x+=18){ R(g,'#7a5a3a',x,gb-12,2,12); } R(g,'#8a6a46',0,gb-10,w,2); R(g,'#8a6a46',0,gb-5,w,2);
  const n=v===0?3:1; for(let i=0;i<n;i++) pine(g,30+i*90+(r()*30|0),gb,80+r()*10,30,['#24503c','#346a4e','#3a2a1e']);
  for(let i=0;i<30;i++) R(g,['#f0f0f0','#e8c84a','#c87ad0'][r()*3|0],r()*w|0,gb-1-(r()*3|0),1,1); }

/* --- Neo-Hanamura by night: neon, wet streets, lit windows --- */
function nightFar(g,w,h,r,v){ const hz=h*.86; let x=1,i=0;
  while(x<w-6){ const tw=5+(r()*12|0); if(x+tw>w-1) break; const th=16+(r()*58|0),top=hz-th; R(g,'#151628',x,top,tw,hz-top);
    for(let y=top+2;y<hz;y+=3) for(let xx=x+1;xx<x+tw-1;xx+=2) if(r()<.32) R(g,r()<.8?'#ffd890':'#9ae8f0',xx,y,1,1);
    if(r()<.3) R(g,'#ff3a3a',x+tw/2|0,top-1,1,1);
    if(i%9===4+v){ R(g,'#1a1a30',x+tw/2-1,top-26,2,26); R(g,'#ff4fae',x+tw/2-4,top-18,8,2); R(g,'#29e0e6',x+tw/2-3,top-12,6,1); }
    x+=tw+(r()*2|0); i++; }
  R(g,'#100f1e',0,hz,w,h-hz); vfill(g,0,h*.5,w,h*.4,[[0,rgba('#6a2a5e',0)],[1,rgba('#8a3a6e',.5)]]); }
function nightMid(g,w,h,r,v){ const cols=['#ff3fa4','#29e0e6','#f5c542','#7cf06a','#ff7a3a','#b07aff']; const words=['HOTARU','RAMEN','KARAOKE','HOTEL','BAR','24H','GAMES','NOODLE'];
  let x=0,i=0; while(x<w-10){ let bw=18+(r()*26|0); if(x+bw>w) break; const bh=30+(r()*58|0),top=h-bh;
    vfill(g,x,top,bw,bh,[[0,'#1c1a2e'],[1,'#121020']]);
    for(let y=top+4;y<h-10;y+=5) for(let xx=x+2;xx<x+bw-3;xx+=4) R(g,r()<.25?'#ffcf80':r()<.1?'#7ae8f0':'#22203a',xx,y,2,3);
    const c=cols[(i+v)%cols.length];
    if(i%2===0){ const sx=x+bw-8,sh=Math.min(36,bh-12); radial(g,sx+3,top+6+sh/2,sh*.7,[[0,rgba(c,.35)],[1,rgba(c,0)]]); R(g,c,sx,top+6,7,sh); R(g,mix(c,'#ffffff',.6),sx+1,top+7,5,sh-2); glyphs(g,sx+1,top+8,Math.max(2,(sh-4)/5|0),5,mix(c,'#000000',.55),i*7+v); }
    else { const s=words[(i+v*3)%words.length],tw=textW(s,1); if(tw<bw-3){ radial(g,x+bw/2,top+9,tw,[[0,rgba(c,.35)],[1,rgba(c,0)]]); R(g,'#0e0c18',x+1,top+4,tw+4,10); text(g,s,x+3,top+6,c,1); } }
    R(g,'#0a0912',x,h-10,bw,10); R(g,cols[(i+2)%cols.length],x+1,h-9,bw-2,1);
    x+=bw+(r()*2|0); i++; } }
function nightNear(g,w,h,r,v){ const gb=h-2; R(g,'#2a2836',0,gb-12,w,2); R(g,'#ff3fa4',0,gb-10,w,1); for(let x=6;x<w;x+=24) R(g,'#2a2836',x,gb-12,2,12);
  for(const lx of v?[60,190]:[120]){ R(g,'#1e1c28',lx,gb-62,2,62); R(g,'#1e1c28',lx,gb-62,9,2); radial(g,lx+8,gb-58,9,[[0,rgba('#fff0c0',.9)],[.4,rgba('#ffd890',.6)],[1,rgba('#ffd890',0)]]); } }

/* scene definitions: sky, light for interiors and the train, ground per side, the three layers per side */
const SCENES={
  lumen:{name:'Port Lumen',time:'07:30',km:0,sub:'Departure · the capital at dawn',note:'Every skyline Halcyra ever admired, built at once: needle towers, tiered towers, slab blocks with their numbers painted on, water tanks on old brick. The run leaves from Port Lumen Central at dawn.',
    sky:skyArgs=>[[[0,'#2a3468'],[.45,'#8a6a9e'],[.78,'#f09a80'],[1,'#ffd6a0']],{clouds:7,cloudCol:'#ffd2b8',cloudShade:'#b878a0',seed:3,glow:[.5,1,.6,'rgba(255,214,160,.7)']}],
    light:{amb:[.46,.38,.44],dir:[-.6,.45,.5],dirCol:[1.0,.66,.48]},lamp:.55,horizon:'#ffd6a0',top:'#2a3468',
    ground:{pos:'#7a7680',neg:'#7a7680'},verge:{pos:'city',neg:'city'},
    layers:{pos:[lumenFar,lumenMid,lumenNear],neg:[lumenFar,lumenMid,lumenNear]},swatch:['#2a3468','#8a6a9e','#f09a80','#ffd6a0','#5f7f7a']},
  coast:{name:'Mirahama Coast',time:'09:10',km:64,sub:'Summer sea · a gate in the water',note:'The line runs along the sea wall. On the water side a great red gate stands in the shallows and a lighthouse marks the islands. On the land side, a whitewashed town with orange roofs climbs the cliff.',
    sky:()=>[[[0,'#2378c0'],[.55,'#7cc2ea'],[1,'#e6f6f4']],{clouds:9,seed:7}],
    light:{amb:[.56,.58,.6],dir:[.3,.8,.5],dirCol:[1.05,1.0,.9]},lamp:.3,horizon:'#e6f6f4',top:'#2378c0',
    ground:{pos:'#2f88b0',neg:'#7aa35a'},groundY:{pos:-1.5},verge:{pos:'sand',neg:'grass'},
    layers:{pos:[coastSeaFar,coastBeachMid,coastNear],neg:[coastLandFar,coastTownMid,coastNear]},swatch:['#2378c0','#7cc2ea','#f4efe4','#d2683a','#d63a2c']},
  valley:{name:'Sakura Valley',time:'11:45',km:151,sub:'Spring · castle and chapel',note:'Cherry blossom along every field edge, petals blowing past the windows. A white castle keep on the hill to one side, a stone chapel and its village on the other. Rapeseed in flower beside the track.',
    sky:()=>[[[0,'#4f92d6'],[.6,'#b8dcf2'],[1,'#f6f2ea']],{clouds:8,seed:11}],
    light:{amb:[.54,.54,.56],dir:[-.2,.8,.6],dirCol:[1.0,.96,.9]},lamp:.3,horizon:'#f6f2ea',top:'#4f92d6',petals:true,
    ground:{pos:'#8ab05e',neg:'#8ab05e'},verge:{pos:'rape',neg:'grass'},
    layers:{pos:[valleyFar,valleyMid,valleyNear],neg:[valleyFar,valleyMid,valleyNear]},swatch:['#4f92d6','#f6f2ea','#e98aa6','#86b05a','#f2d23a']},
  alder:{name:'Lake Alder',time:'14:20',km:238,sub:'Alpine lake · chalets, spires',note:'The line climbs into the mountains. A long glacier lake on one side with a white castle on the far shore; meadows, pines and chalets with red shutters on the other.',
    sky:()=>[[[0,'#3a76c2'],[.6,'#a2ccec'],[1,'#eef4f4']],{clouds:6,seed:13}],
    light:{amb:[.5,.53,.6],dir:[.5,.7,-.3],dirCol:[.95,.96,1.0]},lamp:.3,horizon:'#eef4f4',top:'#3a76c2',
    ground:{pos:'#4a86a6',neg:'#6a9a4a'},groundY:{pos:-1.5},verge:{pos:'meadow',neg:'meadow'},
    layers:{pos:[alpsFar,lakeShoreMid,pineNear],neg:[alpsFar,meadowMid,pineNear]},swatch:['#3a76c2','#eef4f4','#3a6ab0','#2f5a44','#e04a3a']},
  tunnel:{name:'Kurogane Tunnel',time:'16:05',km:301,sub:'Under the mountain · 11 minutes of dark',note:'Eleven kilometres under the range. Sodium lamps strobe past every few metres and the cars run on their own lighting. The best place on the line to go quiet.',
    tunnel:true,light:{amb:[.07,.065,.06],dir:[0,1,0],dirCol:[0,0,0]},lamp:1.1,horizon:'#0b0a09',top:'#0b0a09',
    ground:{pos:'#1a1817',neg:'#1a1817'},verge:{pos:'tunnel',neg:'tunnel'},swatch:['#0b0a09','#232120','#e8962a','#3a3634','#fff0c0']},
  night:{name:'Neo-Hanamura',time:'19:45',km:362,sub:'Arrival · the end of the line by night',note:'The terminus city is unfinished but already lit up: neon on every block, wet streets, lit windows to the horizon. The track runs out a little further on.',
    sky:()=>[[[0,'#07081a'],[.55,'#221a44'],[.85,'#5a2a5e'],[1,'#8a3a6e']],{stars:true,night:true}],
    light:{amb:[.12,.1,.18],dir:[0,.6,1],dirCol:[.3,.16,.36]},lamp:1.0,horizon:'#8a3a6e',top:'#07081a',night:true,
    ground:{pos:'#16141e',neg:'#16141e'},verge:{pos:'night',neg:'night'},
    layers:{pos:[nightFar,nightMid,nightNear],neg:[nightFar,nightMid,nightNear]},swatch:['#07081a','#221a44','#ff3fa4','#29e0e6','#f5c542']}
};
const SCENE_ORDER=['lumen','coast','valley','alder','tunnel','night'];
