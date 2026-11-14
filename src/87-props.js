/* =====================================================================
   PROPS (floor 01 prototype, agent H): furniture with hiding anatomy, landmarks, and the things Ray picks up.
   The look: PS1 but good. Chunky boxes, but every face carries a painted texture with its light baked in from above, grime pooled
   low, and a dark crease plus a lit lip round its border: box() maps the whole texture onto every face, so that border is every
   box edge, and the edges read as worn bevels instead of cardboard. Textures are painted the first time a prop needs one (the old
   game never pays for them), small (8 to 64 px) and shared, so the floor's merge (meshMerge) packs them into its atlas and
   batches everything by material. Big faces are cut into cells (prCbox): the lighting is per vertex, and a flashlight needs
   vertices to land on.
   Contract (PROTO_BRIEF.md 6):
     prop(kind, parent, x, z, yaw, opts) -> {solids, hides, sight, node, kind, tris, ...extras}
       Draws the prop into parent at (x, 0, z) turned by yaw (a node's ry: local +x goes to world (cos yaw, -sin yaw)).
       Built facing local +z, its back on local -z (against a wall), base on y = 0, centred on (x, z).
       solids: [{x0,z0,x1,z1,y0,h,kind}] world boxes; h is the TOP height, y0 the bottom (the same as addBox)
       hides:  [{kind,x,z,yaw,w,d,h}] world centre, the prop's yaw, the spot's own size (w along local x, d along local z)
       sight:  boxes that block sight only (hung cloth, plastic): addBox them with b.sightOnly once G's flag exists
     PROP_DIMS[kind] = {w,d,h}: footprint along local x and z, and height, so F can lay out before the models exist
     propPlace(...) = prop() plus addBox for the solids and addHideSpot for the hides (when G's system is loaded)
   Handhelds: new WPN entries (pan, hammer, pipe, cutter, keys, medkit, rounds, roundbox, strip) at the bottom of this file.
   ?propsdev=1 lays every prop and item out in a dark room with one bare bulb, for review.
   ===================================================================== */
const PROP_DIMS={
  bed:{w:1.0,d:2.0,h:.98,under:.42},        /* opts.wide: 1.4 wide. Clear underneath up to `under` (the frame's underside) */
  wardrobe:{w:1.08,d:.7,h:2.12},             /* open front, no door leaves: interior 1.0 x .65 x 2.0 */
  closet:{w:1.16,d:.73,h:2.8},               /* built floor to ceiling, interior 1.0 x .65 x 2.0. opts.niche: F's walls are the box */
  tub:{w:1.6,d:.74,h:2.05},
  sofa:{w:2.0,d:.88,h:.88,gap:.6},           /* opts.hideBehind: keep `gap` clear between its back and the wall */
  mattresses:{w:1.9,d:1.05,h:1.7},
  laundry:{w:3.0,d:.12,h:1.95},              /* w = opts.len (hooks at both ends: wall to wall) */
  cardtable:{w:.86,d:.86,h:.74},
  table:{w:1.22,d:.82,h:.76},
  chair:{w:.44,d:.46,h:.92},
  kitchen:{w:2.0,d:.62,h:1.7},               /* w = opts.len */
  fridge:{w:.7,d:.68,h:1.62},
  tv:{w:.64,d:.56,h:1.25},
  shelf:{w:1.0,d:.4,h:1.8},
  pipeburst:{w:2.4,d:.4,h:2.45,wet:1.3},     /* w = opts.len; the puddle spreads `wet` m out from the wall (floor decal, walkable) */
  rebar:{w:1.9,d:1.1,h:1.4},
  sheeting:{w:2.4,d:.12,h:2.8},              /* w = opts.len, h = opts.h (default: the room's height) */
  exitchain:{w:1.4,d:.2,h:2.42,open:[.92,2.04]} /* local z = 0 is the wall line: cut an opening open[0] x open[1] centred on local x = 0 */
};

const PROPS_DEV=/[?&]propsdev=1\b/.test(location.search);
/* ---------- painting ---------- */
/* surface tone by material: a multiplier round 1 */
function prTone(k,x,y,s){ switch(k){
  case 'paint': return 1+.05*fbm(x*.2,y*.2,s);
  case 'wood': { const v=fbm(x*.55,y*.035,s); return 1+.15*v+.05*Math.sin((x+v*8)*1.3); }      /* grain running down the texture */
  case 'woodx': { const v=fbm(x*.035,y*.55,s); return 1+.15*v+.05*Math.sin((y+v*8)*1.3); }     /* grain running across */
  case 'steel': return 1+.06*fbm(x*.03,y*.9,s)+.03*fbm(x*.5,y*.5,s+2);
  case 'enamel': return 1+.03*fbm(x*.1,y*.1,s);
  case 'rust': return 1+.22*fbm(x*.25,y*.25,s);
  case 'plaster': return 1+.07*fbm(x*.18,y*.18,s);
  case 'conc': return 1+.1*fbm(x*.25,y*.25,s)+(hash2(x,y,s)-.5)*.14;
  case 'chip': return 1+(hash2(x,y,s)-.5)*.3+.06*fbm(x*.3,y*.3,s);
  case 'card': return 1+.05*fbm(x*.15,y*.3,s)+(((x>>1)&1)?.015:-.015);
  case 'foam': return 1+.12*fbm(x*.35,y*.35,s);
  case 'plastic': return 1+.04*fbm(x*.1,y*.1,s);
  default: return weave(k,x,y,s); } }
/* a hard surface: zone(x,y) -> [hex, material, mult] or one hex for all; light from above, dirt in soft patches and pooled low,
   and the border bevelled (o.rim 0 for textures that tile) */
function prSurf(w,h,seed,zone,k,o={}){ const I=Img(w,h),zf=typeof zone==='function'?zone:()=>[zone,k];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const z=zf(x,y),c=F3(z[0]),ty=(y+.5)/h; let m=prTone(z[1]||k,x,y,seed)*(z[2]??1);
    m*=1+(o.vl??.1)*(.5-ty); m*=1-(o.grime??.16)*sst(.3,.8,fbm(x*.06+7,y*.05,seed+5)); m*=1-(o.low??.15)*sst(.6,1,ty);
    if(o.rim!==0){ const e=Math.min(x+.5,w-x-.5,y+.5,h-y-.5); m*=e<1?1-(o.rim??.25):e<2?1+(o.lip??.1):1; }
    const i=(y*w+x)*3; I.d[i]=c[0]*m; I.d[i+1]=c[1]*m; I.d[i+2]=c[2]*m; }
  if(o.fn) o.fn(I,rng(seed+11),w,h);
  return toTex(I); }
/* cut-out alpha: fn(x,y,w,h) -> 0..1 coverage, dithered (the renderer only has alpha test; at PS1 resolution a 4x4 screen door reads as sheer) */
const PR_BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function prCut(t,fn){ const g=t.c.getContext('2d'),w=t.c.width,h=t.c.height,d=g.getImageData(0,0,w,h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) d.data[(y*w+x)*4+3]=fn(x,y,w,h)*16>PR_BAY[(y&3)*4+(x&3)]+.5?255:0; g.putImageData(d,0,0); return t; }
/* details */
function prChips(I,r,n,col,w,h,o={}){ for(let i=0;i<n;i++){ let x=r()*w,y=r()*h; if(o.edge!==false&&r()<.7){ if(r()<.5) x=r()<.5?r()*2.5:w-r()*2.5; else y=r()<.5?r()*2.5:h-r()*2.5; }
  const rx=.6+r()*(o.s||1.6),ry=.5+r()*(o.s||1.2)*.8; softEll(I,x+.4,y+.5,rx,ry,'#000000',.22,.5); softEll(I,x,y,rx,ry,col,.9,.45); } }
function prRust(I,r,x,y,len,a=.6,wd=1.2){ let px=x; for(let k=0;k<3;k++){ const nx=px+(r()-.5)*1.2; softLine(I,px,y+len*k/3,nx,y+len*(k+1)/3,'#5a2c12',a*(1-k*.25),wd); px=nx; } blob(I,x,y,wd*1.4,wd*1.4,a*.7,'#6a3416'); }
/* a dried stain: a soft wash inside a wobbling edge, the edge a shade darker (the prTide line) */
function prTide(I,cx,cy0,rx,ry,col,a){ const c=F3(col),sd=(cx*7+cy0*13)|0;
  for(let y=Math.floor(cy0-ry*1.6);y<=cy0+ry*1.6;y++) for(let x=Math.floor(cx-rx*1.6);x<=cx+rx*1.6;x++){ const d=Math.hypot((x+.5-cx)/rx,(y+.5-cy0)/ry)+fbm(x*.22,y*.22,sd)*.5,e=Math.abs(d-1);
    let al=d<1?a*(.3+.3*(1-d)):0; if(e<.14) al=Math.max(al,a*.7*(1-e/.14)); if(al>0) put(I,x,y,c,al); } }
/* a dirty hand pressed flat: palm, four fingers, a thumb */
function prHandprint(I,x,y,col,a,s=1){ softEll(I,x,y,2.2*s,2.6*s,col,a,.6); for(let k=0;k<4;k++) softLine(I,x+(-1.8+k*1.2)*s,y-2*s,x+(-2.4+k*1.5)*s,y+(-6.2+Math.abs(k-1.5)*.8)*s,col,a,.9*s); softLine(I,x+2*s,y,x+4.2*s,y-2*s,col,a,.9*s); }
function prScuff(I,r,n,w,h,y0,y1,col='#1e1a16',a=.35){ for(let i=0;i<n;i++){ const x=r()*w,y=y0+r()*(y1-y0),l=2+r()*6; softLine(I,x,y,x+l,y+(r()-.5),col,a,.8); } }
function prDots(I,r,n,col,x0,y0,w,h,a=.8){ for(let i=0;i<n;i++) put(I,x0+r()*w,y0+r()*h,F3(col),a*(.6+r()*.4)); }
const prFab=(w,h,seed,zone,o)=>garment(w,h,seed,typeof zone==='function'?zone:()=>[zone,o.k||'cotton',o.fk??1],Object.assign({wrap:false},o));

/* every texture, painted on first use */
const PR_TX={
  /* bed */
  bedMetal:()=>prSurf(16,32,1801,'#5e6a5a','paint',{grime:.2,fn:(I,r,w,h)=>{ prChips(I,r,10,'#3e2a1c',w,h,{s:1.2}); for(let i=0;i<3;i++) prRust(I,r,r()*w,r()*h*.6,6+r()*8,.35,.8); }}),
  matTop:()=>prFab(64,64,1802,(x,y)=>{ const s=x%9; return [s<2?'#5f6c7a':s===4?'#8a92a0':'#c4bca6','cotton',.3]; },{folds:3,foldAmp:.08,grime:.22,decor:I=>{
    for(let ty=6;ty<64;ty+=12) for(let tx=6;tx<64;tx+=13){ blob(I,tx,ty,2.2,2.2,-.24); put(I,tx-1,ty-1,[1,1,1],.12); } /* quilting tufts */
    prTide(I,30,38,13,9,'#7a6232',.55); prTide(I,36,42,7,5,'#6a5226',.4); prTide(I,22,10,9,5,'#8a8060',.3);                 /* the old stains, sweat where the head goes */
    prTide(I,51,26,3.5,2.6,'#4a1e10',.7); blob(I,51,26,2.2,1.6,.6,'#3a140a');                                          /* blood, gone brown */
    softEll(I,14,52,1.6,1.4,'#140c08',.95,.4); blob(I,14,52,3,3,.35,'#5a3a1a'); for(const e of [2.5,61.5]){ seam(I,e,0,e,64,'#8a8270'); seam(I,0,e,64,e,'#8a8270'); } }}), /* a cigarette burn; the piping round the edge */
  matTop2:()=>prFab(64,64,1803,'#b4ac9c',{fk:.3,folds:3,foldAmp:.08,grime:.26,decor:I=>{ const r=rng(1804);
    for(let i=0;i<22;i++){ const x=r()*64,y=r()*64; softEll(I,x,y,3.4,2.4,'#4a5a7a',.7,.5); softEll(I,x+.4,y,1.6,1.2,'#b4ac9c',.7,.5); softEll(I,x+3,y+2.4,1.6,.8,'#4a5a7a',.6,.5); } /* faded blue damask */
    for(let ty=5;ty<64;ty+=10) for(let tx=5;tx<64;tx+=11){ blob(I,tx,ty,2,2,-.25); put(I,tx-1,ty-1,[1,1,1],.1); }
    for(const e of [2.5,61.5]){ seam(I,e,0,e,64,'#6a6a70'); seam(I,0,e,64,e,'#6a6a70'); }
    prTide(I,40,30,14,11,'#6a5226',.5); prTide(I,18,50,8,6,'#5a4420',.45); for(let i=0;i<5;i++) softEll(I,8+r()*48,8+r()*48,1.3,1.1,'#1a0e08',.8,.4); }}),
  matSide:()=>prFab(64,16,1805,(x,y)=>[(y+1)%6<1?'#5f6c7a':'#c0b8a2','cotton',.3],{folds:2,foldAmp:.06,grime:.26,decor:I=>{ seam(I,0,1.5,64,1.5,'#8a8270'); seam(I,0,14,64,14,'#8a8270');
    for(const x of [20,44]){ softEll(I,x,8,1.6,1.6,'#3a3a36',.8,.4); put(I,x,8,[.1,.1,.1],.9); } prTide(I,38,9,8,4,'#7a6232',.4); }}),
  matSideV:()=>prFab(16,64,1806,(x,y)=>[(x+1)%6<1?'#5f6c7a':'#c0b8a2','cotton',.3],{folds:2,foldAmp:.06,grime:.3,decor:I=>{ seam(I,1.5,0,1.5,64); seam(I,14,0,14,64); prTide(I,8,40,4,9,'#7a6232',.4); }}),
  matUnder:()=>prSurf(32,32,1807,'#2e2a26','foam',{rim:.2,grime:.1,fn:I=>{ for(let y=4;y<32;y+=8) for(let x=4;x<32;x+=8){ for(let k=0;k<12;k++){ const a=k/12*6.283; put(I,x+Math.cos(a)*2.7,y+Math.sin(a)*2.7,F3('#8a8880'),.55); } put(I,x,y,F3('#6a6862'),.6); }
    for(let y=0;y<32;y+=8) softLine(I,0,y,32,y,'#5a5852',.5,.6); prTide(I,16,18,8,6,'#4a3a22',.3); }}),
  pillow:()=>prFab(32,16,1808,'#c4bba4',{folds:4,grime:.25,decor:I=>{ prTide(I,16,8,8,4,'#8a7440',.4); seam(I,0,1,32,1); seam(I,0,15,32,15); }}),
  blanket:()=>prFab(64,32,1809,(x,y)=>Math.min(x,63-x,y,31-y)<2?['#8a3a3a','poly',.4]:['#5c2224','wool',1],{folds:9,foldAmp:.28,grime:.18,decor:I=>{ const r=rng(1810); /* a plush San Marcos blanket, its roses long faded */
    for(let i=0;i<5;i++){ const x=8+r()*48,y=6+r()*20,s=4+r()*3; softEll(I,x,y,s,s*.85,'#8a4a2a',.55,.5); softEll(I,x,y,s*.6,s*.5,'#b0703a',.45,.5); softEll(I,x+.5,y,s*.25,s*.25,'#c89a5a',.4,.5); softEll(I,x+s*.9,y+s*.6,s*.5,s*.25,'#2e3a22',.5,.6); } }}),
  cardTop:()=>prSurf(32,32,1810,'#8a6a40','card',{fn:(I,r)=>{ softRect(I,13,0,6,32,'#b0946a',.6,.6); softLine(I,0,r()*32,32,r()*32,'#5a4024',.2,.8); }}),
  card:()=>prSurf(32,32,1811,'#8e6e44','card',{fn:(I,r)=>{ softRect(I,0,13,32,6,'#b0946a',.6,.6); softLine(I,0,13,32,13,'#ffffff',.12,.8); textI(I,'ROPA',8,23,'#1e1a16',1,.75); for(let i=0;i<2;i++) softLine(I,r()*32,r()*32,r()*32,r()*32,'#5a4024',.25,.8); }}),
  /* wardrobe, closet, clothes */
  wardWood:()=>prSurf(32,64,1812,'#5e4029','wood',{low:.25,fn:(I,r,w,h)=>{ for(let i=0;i<5;i++){ const x=r()*w; softLine(I,x,0,x+(r()-.5)*2,h*.8,'#3a2616',.25,.7); }
    for(let x=0;x<w;x++){ const top=h-7-Math.abs(fbm(x*.3,1,1813))*7; for(let y=Math.ceil(top);y<h;y++) put(I,x,y,F3(hash2(x,y,9)>.5?'#a08a62':'#8a7450'),.85); put(I,x,top,F3('#2a1a0e'),.7); } /* water got in at the bottom: the veneer came off */
    prScuff(I,r,6,w,h,h*.5,h*.9,'#d8c8a8',.25); }}),
  chip:()=>prSurf(32,32,1814,'#6a5a40','chip',{grime:.25}),
  wardBack:()=>prSurf(32,64,1815,'#4e3c2a','chip',{low:.3,fn:I=>prTide(I,20,40,9,14,'#2a1c10',.4)}),
  cPlaid:()=>prFab(32,64,1816,(x,y)=>{ const a=((x>>2)&1)^((y>>2)&1),l=(x%8===3)||(y%8===3); return [l?'#c8b088':a?'#7a2a22':'#22201e','wool',1]; },{folds:8,dir:'v',grime:.15}),
  cDenim:()=>prFab(32,64,1817,'#3a4c66',{k:'denim',folds:8,dir:'v',grime:.2,decor:I=>{ seam(I,16,0,16,64,'#a8834a'); for(const y of [20,40]) softRect(I,4,y,8,6,'#2c3a50',.6,1); }}),
  cFloral:()=>prFab(32,64,1818,'#2e4a50',{k:'poly',folds:8,dir:'v',grime:.12,decor:I=>{ const r=rng(1819); for(let i=0;i<26;i++){ const x=r()*32,y=r()*64; softEll(I,x,y,1.6,1.3,['#c88a6a','#d8c08a','#a85a5a'][i%3],.8,.5); softEll(I,x+1.6,y+1,1,.6,'#3a5a3a',.7,.5); } }}),
  cCoat:()=>prFab(32,64,1820,'#4a3a2c',{k:'wool',folds:7,dir:'v',grime:.2,decor:I=>{ seam(I,16,0,16,64); for(const y of [14,26,38]) softEll(I,14,y,1,1,'#1e1610',.9,.4); }}),
  curtA:()=>prFab(32,64,1821,'#7a6a34',{fk:.4,folds:3,grime:.25,decor:I=>{ const r=rng(1822); for(let i=0;i<12;i++){ const x=r()*32,y=r()*56; softEll(I,x,y,3,2.4,'#5a2a1e',.75,.5); softEll(I,x,y,1.3,1.1,'#b8865a',.7,.5); softEll(I,x-2.6,y+2.4,1.6,.8,'#3a4a2a',.7,.5); }
    for(let y=50;y<64;y++) for(let x=0;x<32;x++) mul(I,x,y,.94-(y-50)*.016); seam(I,0,2,32,2); }}),
  curtB:()=>prFab(32,64,1823,(x,y)=>[(x>>2)&1?'#6a7a8a':'#8a96a0','cotton',.5],{folds:3,grime:.3,decor:I=>{ for(let y=48;y<64;y++) for(let x=0;x<32;x++) mul(I,x,y,.92-(y-48)*.016); seam(I,0,2,32,2); }}),
  plaster:()=>prSurf(32,64,1824,'#a8a290','plaster',{rim:0,low:.25,fn:(I,r,w,h)=>{ for(let i=0;i<3;i++){ const x=4+r()*24,y=20+r()*30; for(let k=0;k<4;k++) softEll(I,x+k*1.6-2.4,y-2+(k===0?2:0),.8,1.6,'#5a5040',.18,.6); softEll(I,x,y+2,2,1.6,'#5a5040',.15,.6); } prScuff(I,r,8,w,h,h*.75,h*.95); }}),
  trim:()=>prSurf(16,32,1825,'#3a2c20','wood',{fn:(I,r,w,h)=>prChips(I,r,6,'#8a7a5a',w,h,{s:1})}),
  plank:()=>prSurf(32,8,1826,'#6a5032','woodx',{rim:.3}),
  shoe:()=>prSurf(16,16,1827,'#2a221c','leather',{fn:I=>softRect(I,0,12,16,4,'#121010',.9,.5)}),
  /* tub */
  enamel:()=>prSurf(32,32,1828,'#cfcab8','enamel',{rim:.12,lip:.12,grime:.2,fn:(I,r,w,h)=>{ prRust(I,r,6,2,22,.5,1.4); softLine(I,0,12,32,12,'#8a8468',.35,1.2); prDots(I,r,10,'#6a6650',0,0,w,h,.5); }}),
  tubTile:()=>prSurf(64,32,1829,'#5a8a82','enamel',{rim:.15,low:.3,fn:(I,r,w,h)=>{ for(let x=0;x<w;x+=8) for(let y=0;y<h;y+=8){ const k=.9+r()*.2; for(let yy=1;yy<7;yy++) for(let xx=1;xx<7;xx++) mul(I,x+xx,y+yy,k); put(I,x+2,y+2,[1,1,1],.15); }
    for(let x=0;x<w;x+=8) softLine(I,x,0,x,h,'#8a8a78',.75,.7); for(let y=0;y<h;y+=8) softLine(I,0,y,w,y,'#8a8a78',.75,.7);
    softLine(I,41,8,46,16,'#2a3a36',.7,.6); softRect(I,17,25,6,6,'#6a6a62',.95,.4); prScuff(I,r,6,w,h,h*.7,h); }}),
  tubFloor:()=>prSurf(32,16,1830,'#bdb8a6','enamel',{rim:.1,fn:(I,r)=>{ softEll(I,4,8,2.2,2.2,'#1a1a18',.95,.3); blob(I,4,8,5,4,.5,'#6a3a18'); for(let i=0;i<6;i++){ const x=6+r()*24,y=r()*16; softLine(I,x,y,x+3+r()*4,y+(r()-.5)*3,'#2a2420',.6,.5); } prTide(I,18,8,10,5,'#8a7a5a',.35); }}),
  showerC:()=>prFab(64,128,1831,(x,y)=>['#8eaeac','glass',.4,1+.06*Math.sin(x*.7)],{folds:3,grime:.16,decor:I=>{ const r=rng(1832);
    for(let i=0;i<10;i++){ const x=r()*64,y=12+r()*90,s=2+r()*3; for(let k=0;k<16;k++){ const a=k/16*6.283; put(I,x+Math.cos(a)*s,y+Math.sin(a)*s,F3('#c8d8d4'),.45); } }   /* faded printed bubbles */
    for(let y=100;y<128;y++) for(let x=0;x<64;x++){ mul(I,x,y,.96-(y-100)*.008); if(hash2(x,y,1834)<.03+(y-100)*.008) put(I,x,y,F3('#1a2018'),.7); } /* mildew creeping up from the hem */
    for(let x=3;x<64;x+=8) softEll(I,x,4,1.3,1.3,'#3a4442',.9,.4); seam(I,0,8,64,8); prTide(I,44,76,7,12,'#8a6a3a',.3); }}),
  chrome:()=>prSurf(16,16,1833,'#8e9294','steel',{lip:.25,fn:(I,r)=>{ softLine(I,0,5,16,5,'#d8dcdc',.45,1.2); prDots(I,r,6,'#5a4a3a',0,0,16,16,.6); }}),
  /* sofa */
  sofa:()=>prFab(64,64,1834,'#6a4e2c',{k:'wool',folds:10,foldAmp:.2,grime:.22,decor:I=>{ const r=rng(1835); for(let i=0;i<3;i++) blob(I,10+r()*44,10+r()*44,8,6,.18); prTide(I,40,44,8,5,'#2e2010',.45); seam(I,0,2,64,2); seam(I,0,62,64,62); }}),
  cushA:()=>prFab(32,32,1836,'#6e5230',{k:'wool',folds:5,foldAmp:.18,grime:.2,decor:I=>{ blob(I,16,16,9,8,.14); seam(I,0,1,32,1); seam(I,0,31,32,31); prTide(I,10,20,5,4,'#3a2a14',.35); }}),
  cushB:()=>prFab(32,32,1837,'#6a4e2c',{k:'wool',folds:5,foldAmp:.18,grime:.24,decor:I=>{ const r=rng(1838); seam(I,0,1,32,1); seam(I,0,31,32,31); softEll(I,19,14,7,3.2,'#2a1a0c',.9,.35); softEll(I,19,14,6,2.4,'#b8964e',.95,.4); prDots(I,r,10,'#8a6a30',13,13,12,3,.7); }}),
  throw:()=>prFab(32,32,1839,(x,y)=>{ const a=x%8,b=y%8,e=Math.min(a,7-a,b,7-b),k=((x>>3)*3+(y>>3)*5)%4; return [e<1?'#1a1816':e<2?['#8a3a2e','#c8a040','#3a6a5a','#8a7aa0'][k]:e<3?'#d0c4a0':['#c8a040','#8a3a2e','#8a7aa0','#3a6a5a'][k],'knit',.6]; },{folds:4,grime:.25}),
  darkWood:()=>prSurf(8,8,1840,'#2a1a10','wood'),
  /* tables, chairs */
  felt:()=>prSurf(64,64,1841,'#2c4a36','foam',{rim:.35,lip:.05,grime:.25,fn:(I,r)=>{ blob(I,32,32,18,18,.14);
    for(let i=0;i<6;i++){ const x=10+r()*44,y=10+r()*44; softRect(I,x-2.5,y-3.5,5,7,'#ddd6c4',.95,.35); softEll(I,x,y,.9,1.2,i%2?'#a8241c':'#141414',.9,.4); put(I,x-1.5,y-2.5,F3(i%2?'#a8241c':'#141414'),.8); }
    for(let i=0;i<3;i++){ const x=r()*56,y=r()*58; softRect(I,x,y,7,3.5,'#6a8a5e',.9,.4); }
    prTide(I,48,14,4,4,'#1a2a1c',.6); for(let i=0;i<4;i++){ const x=r()*64,y=r()*64; softEll(I,x,y,1.2,1.2,'#0a0806',.9,.4); blob(I,x,y,2.4,2.4,.3,'#4a3218'); } }}),
  vinyl:()=>prSurf(16,16,1842,'#1e1e1e','leather'),
  cardFace:()=>prSurf(8,12,1843,'#e2dccb','card',{rim:.15,fn:I=>{ softEll(I,4,6,1.6,2.2,'#a8241c',.95,.3); textI(I,'7',0,0,'#a8241c',1,.9); }}),
  cardBack:()=>prSurf(8,12,1844,'#8a2a2a','card',{rim:.3,lip:.4,fn:I=>{ for(let y=2;y<10;y+=2) for(let x=2;x<6;x+=2) put(I,x,y,F3('#d8c8b0'),.5); }}),
  can:()=>prSurf(16,16,1845,'#a8261e','steel',{rim:0,fn:I=>{ softRect(I,0,5,16,4,'#c8c8c0',.9,.4); softRect(I,0,0,16,2,'#9a9a96',.9,.4); }}),
  oilcloth:()=>prSurf(64,64,1846,'#d4ccb6','plastic',{rim:.2,grime:.2,fn:(I,r)=>{ for(let y=0;y<64;y++) for(let x=0;x<64;x++){ const a=(x>>3)&1,b=(y>>3)&1; if(a||b) put(I,x,y,F3(a&&b?'#8a2a26':'#b05a50'),a&&b?.85:.55); } /* red gingham hule */
    for(let i=0;i<5;i++){ const x=r()*64,y=r()*64; softEll(I,x,y,2.6,1.8,'#c8a830',.9,.4); softEll(I,x+2,y-1.2,1,.6,'#3a6a2a',.8,.4); }
    for(let i=0;i<6;i++){ const x=r()*64,y=r()*64,l=4+r()*8,a=r()*3; softLine(I,x,y,x+Math.cos(a)*l,y+Math.sin(a)*l,'#7a7468',.6,.6); } /* knife cuts through to the backing */
    prTide(I,40,22,5,5,'#7a5a3a',.5); softEll(I,18,44,2,1.6,'#2a1a0e',.9,.4); blob(I,32,32,30,30,-.08); }}),
  oilEdge:()=>prSurf(32,8,1847,'#d4ccb6','plastic',{rim:0,fn:I=>{ for(let x=0;x<32;x++) for(let y=0;y<8;y++) if((x>>2)&1) put(I,x,y,F3('#b05a50'),.6); softLine(I,0,7,32,7,'#5a4a3a',.4,1); }}),
  woodUnder:()=>prSurf(16,16,1848,'#3a2a1c','wood'),
  legPaint:()=>prSurf(16,32,1849,'#6c8a7c','paint',{fn:(I,r,w,h)=>{ prChips(I,r,10,'#3a2616',w,h,{s:1}); prScuff(I,r,4,w,h,h*.7,h); }}),
  reed:()=>prSurf(32,32,1850,'#9a7c44','foam',{rim:.3,fn:I=>{ for(let y=0;y<32;y++) for(let x=0;x<32;x++){ const a=((x>>2)+(y>>2))&1,u=a?x%4:y%4; mul(I,x,y,u===0?.55:u===3?.8:1.08); } }}),
  /* kitchen */
  kitBase:()=>prSurf(64,32,1851,'#7e9a90','plaster',{low:.35,fn:(I,r,w,h)=>{ softLine(I,0,4,64,4,'#5a6e66',.4,1); prChips(I,r,14,'#6a6a64',w,h,{s:2}); prScuff(I,r,14,w,h,h*.6,h,'#2a2420',.4); prTide(I,22,22,8,7,'#5a5038',.3); }}),
  ctrTile:()=>prSurf(32,32,1852,'#d2ccb8','enamel',{rim:0,grime:.3,fn:(I,r)=>{ for(let k=0;k<32;k+=8){ softLine(I,k,0,k,32,'#6a6450',.85,.7); softLine(I,0,k,32,k,'#6a6450',.85,.7); } for(let i=0;i<3;i++) prTide(I,r()*32,r()*32,3,2.4,'#8a6a3a',.35); softLine(I,9,3,14,6,'#5a5a50',.6,.5); }}),
  ctrEdge:()=>prSurf(32,8,1853,'#3e6a8a','enamel',{rim:.2,fn:(I,r)=>{ for(let k=0;k<32;k+=8) softLine(I,k,0,k,8,'#5a5a50',.8,.7); prChips(I,r,4,'#8a8270',32,8,{s:1}); }}),
  splash:()=>prSurf(32,32,1854,'#cfd0c4','enamel',{rim:0,grime:.3,fn:(I,r)=>{ for(let k=0;k<32;k+=8){ softLine(I,k,0,k,32,'#7a7a6c',.8,.6); softLine(I,0,k,32,k,'#7a7a6c',.8,.6); } prDots(I,r,30,'#6a5a30',0,0,32,32,.6); softLine(I,20,8,26,20,'#4a4a42',.5,.5); }}),
  gingham:()=>prFab(32,32,1855,(x,y)=>{ const a=(x>>2)&1,b=(y>>2)&1; return [a&&b?'#8a2a24':a||b?'#b8726a':'#d8cfc0','cotton',1]; },{folds:5,dir:'v',grime:.3}),
  stoveTop:()=>prSurf(32,16,1856,'#d0ccc0','enamel',{rim:.25,fn:(I,r)=>{ for(const x of [8,24]){ softEll(I,x,8,6,6,'#1a1a1a',.95,.2); softEll(I,x,8,4,4,'#3a3a38',.9,.2); softEll(I,x,8,1.6,1.6,'#121212',.95,.3); } prChips(I,r,8,'#2a2622',32,16,{s:1}); prTide(I,16,9,5,4,'#6a4a1a',.4); }}),
  stoveSide:()=>prSurf(16,8,1857,'#c8c4b6','enamel',{fn:I=>{ for(const x of [4,12]) softEll(I,x,4,1.6,1.6,'#1e1e1e',.95,.4); }}),
  gasCyl:()=>prSurf(32,32,1858,'#b8b4a6','paint',{rim:0,fn:(I,r,w,h)=>{ softRect(I,0,4,32,3,'#8a2a22',.9,.5); textI(I,'GAS',10,12,'#2a2a2a',1,.8); textI(I,'20KG',8,19,'#2a2a2a',1,.7); for(let i=0;i<4;i++) prRust(I,r,r()*w,r()*h*.3,10,.4,1); prChips(I,r,10,'#5a3a22',w,h); }}),
  gasTop:()=>prSurf(16,16,1859,'#a8a498','paint',{fn:(I,r)=>prChips(I,r,4,'#5a3a22',16,16)}),
  alu:()=>prSurf(16,16,1860,'#8e8c86','steel',{low:.5,fn:I=>{ softRect(I,0,12,16,4,'#2a2622',.7,1); blob(I,6,6,3,2,.15); }}),
  steel:()=>prSurf(16,16,1861,'#8a8e90','steel',{lip:.2}),
  steelDark:()=>prSurf(16,16,1862,'#2e3032','steel',{fn:(I,r)=>prDots(I,r,5,'#5a3418',0,0,16,16,.5)}),
  jar:()=>prSurf(8,16,1863,'#7a4a24','plastic',{rim:0,fn:I=>softRect(I,0,4,8,6,'#d8c8a0',.85,.4)}),
  /* fridge */
  fridge:()=>prSurf(32,64,1864,'#cfc6a8','enamel',{low:.3,grime:.2,fn:(I,r,w,h)=>{ blob(I,16,4,20,6,.12); softLine(I,0,20,32,20,'#5a5444',.6,.8); softLine(I,0,21,32,21,'#ffffff',.15,.8);
    for(const [x,y,c] of [[6,26,'#c83a2a'],[10,30,'#2a6ab0'],[22,24,'#e8c03a'],[8,34,'#3aa04a']]) softEll(I,x,y,1.4,1.4,c,.95,.3);   /* magnets */
    softRect(I,14,28,7,9,'#e8e2d0',.9,.3); for(let y=30;y<36;y+=2) softLine(I,15,y,20,y,'#5a5a5a',.5,.4);                    /* a note */
    blob(I,27,34,3,7,.4,'#6a5a3a'); for(let i=0;i<4;i++) prRust(I,r,2+r()*28,h-10,8,.5,1.2); prChips(I,r,8,'#4a3a2a',w,h,{s:1.2}); }}),
  fridgeSide:()=>prSurf(32,64,1865,'#c8bfa2','enamel',{low:.3,fn:(I,r,w,h)=>{ for(let i=0;i<3;i++) prRust(I,r,r()*w,h-12,10,.45,1.2); prTide(I,10,30,6,10,'#7a6a4a',.2); }}),
  enamelPlain:()=>prSurf(16,16,1866,'#cbc2a4','enamel'),
  grille:()=>prSurf(16,8,1867,'#1c1c1c','steel',{rim:.2,fn:I=>{ for(let x=1;x<16;x+=2) softLine(I,x,1,x,7,'#000000',.7,.5); }}),
  /* tv */
  tvWood:()=>prSurf(32,32,1868,'#4a3020','woodx',{fn:(I,r,w,h)=>{ prScuff(I,r,8,w,h,0,h,'#8a6a4a',.3); prChips(I,r,4,'#2a1a0e',w,h); }}),
  tvFront:()=>prSurf(32,32,1869,'#2c2a28','plastic',{fn:I=>{ softRect(I,2,3,21,22,'#0e0e0e',.95,.5); for(let y=5;y<24;y+=2) softLine(I,25,y,30,y,'#121212',.8,.5); textI(I,'ZENIT',5,27,'#8a8476',1,.6); }}),
  tvOn:()=>prSurf(32,24,1870,'#56708a','enamel',{rim:.4,lip:0,grime:0,low:0,fn:I=>{ for(let y=0;y<24;y++) for(let x=0;x<32;x++) mul(I,x,y,(.75+hash2(x,y,1871)*.5)*(y%2?.86:1.05)); blob(I,10,6,8,4,.35); blob(I,16,12,16,12,.15); }}),
  tvOff:()=>prSurf(32,24,1872,'#1c2220','enamel',{rim:.4,lip:0,grime:0,low:0,fn:I=>blob(I,10,6,8,4,.5,'#5a6a68')}),
  plasticDark:()=>prSurf(16,16,1873,'#262422','plastic'),
  vcr:()=>prSurf(24,8,1874,'#1a1a1a','plastic',{fn:I=>{ softRect(I,1,2,21,4,'#060606',.9,.3); textI(I,'12:00',2,2,'#4ae06a',1,.9); }}),
  /* shelf */
  shelfSteel:()=>prSurf(32,32,1875,'#666a64','steel',{fn:(I,r,w,h)=>{ prChips(I,r,8,'#5a3a20',w,h,{s:1.4}); for(let i=0;i<3;i++) prTide(I,r()*w,r()*h,4,3,'#4a3a26',.3); }}),
  slotted:()=>prSurf(8,32,1876,'#6e726a','steel',{fn:(I,r,w,h)=>{ for(let y=2;y<h;y+=4) softEll(I,4,y,1.2,.8,'#0e0e0e',.95,.4); prRust(I,r,2,h*.6,10,.4,.8); }}),
  paintCan:()=>prSurf(32,16,1877,'#8a8a82','steel',{rim:0,fn:(I,r,w)=>{ softRect(I,0,4,32,8,'#c8b890',.9,.4); textI(I,'PINTURA',3,6,'#a8241c',1,.8); softLine(I,9,0,9.5,9,'#e8e0c8',.8,1.2); for(let i=0;i<3;i++) prRust(I,r,r()*w,1,8,.4,.8); }}),
  rope:()=>prSurf(16,8,1878,'#8a7a5a','foam',{rim:0,fn:I=>{ for(let x=0;x<16;x+=3) softLine(I,x,0,x+3,8,'#5a4a32',.5,.7); }}),
  bucket:()=>prSurf(32,16,1879,'#2a5a8a','plastic',{rim:0,fn:(I,r)=>{ softRect(I,0,0,32,2,'#3a6a9a',.8,.4); prDots(I,r,10,'#1a2a3a',0,0,32,16,.4); }}),
  /* burst pipe */
  pipe:()=>prSurf(32,16,1880,'#74766e','steel',{rim:0,fn:(I,r,w,h)=>{ for(let i=0;i<10;i++) softEll(I,r()*w,r()*h,1+r()*2,1+r(),r()<.5?'#c8c4b0':'#7a3a16',.5,.5); }}),
  wetWall:()=>{ const sh=(x,y,w,h)=>{ const t=y/h,cx=w/2+fbm(t*3,0,1882)*3; return 2.5+t*11+fbm(x*.12,y*.06,1883)*3.5-Math.abs(x+.5-cx); }; /* > 0 inside: px to the edge */
    return prCut(prSurf(32,128,1881,'#2a2822','plaster',{rim:0,low:0,vl:0,grime:.2,fn:(I,r,w,h)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const e=sh(x,y,w,h); mul(I,x,y,.72+.3*(y/h)); if(e>0&&e<1.6) put(I,x,y,F3('#7a7464'),.3); }
      for(let i=0;i<7;i++){ const x=6+r()*20; softLine(I,x,0,x+(r()-.5)*3,h*(.5+r()*.5),'#4c463a',.4,.9); } for(let i=0;i<3;i++) prRust(I,r,8+r()*16,2,40,.45,1.2); }}),(x,y,w,h)=>sh(x,y,w,h)>0?1:0); },
  puddle:()=>{ const sh=(x,y)=>.9-Math.hypot((x-48)/44,(y-44)/38)-fbm(x*.05,y*.05,1885)*.3;
    return prCut(prSurf(96,96,1884,'#191b1b','enamel',{rim:0,low:0,grime:.15,vl:0,fn:(I,r)=>{ prDots(I,r,80,'#7a8a90',0,0,96,96,.7); for(const rr of [6,11,17]) for(let k=0;k<44;k++){ const a=k/44*6.283; put(I,48+Math.cos(a)*rr,44+Math.sin(a)*rr*.8,F3('#4e5c62'),.5); }
      blob(I,48,44,12,10,.3); for(let y=0;y<96;y++) for(let x=0;x<96;x++){ const e=sh(x,y); if(e>0&&e<.05) mul(I,x,y,.7); } }}),(x,y)=>sh(x,y)>0?1:0); },
  /* rebar, the unfinished room */
  conc:()=>prSurf(32,32,1886,'#77746c','conc',{fn:(I,r,w,h)=>prDots(I,r,50,'#5a5852',0,0,w,h,.7)}),
  concTop:()=>prSurf(32,32,1887,'#5e5c56','conc',{rim:.3,fn:(I,r,w,h)=>{ prDots(I,r,80,'#8e8a80',0,0,w,h,.8); prDots(I,r,40,'#3a3834',0,0,w,h,.8); }}),
  rebar:()=>prSurf(8,16,1888,'#5a3218','rust',{rim:0,fn:I=>{ for(let y=0;y<16;y+=3) softLine(I,0,y,8,y+1,'#2e1a0c',.6,.6); }}),
  cement:()=>prSurf(32,32,1889,'#b4ac9a','card',{fn:(I,r)=>{ softRect(I,0,6,32,6,'#8a2a22',.85,.5); textI(I,'CEMENTO',3,14,'#3a3a3a',1,.8); textI(I,'50 KG',7,21,'#3a3a3a',1,.7); prDots(I,r,20,'#d8d4c8',0,0,32,32,.5); }}),
  /* plastic sheeting */
  plastic:()=>prCut(prSurf(64,128,1890,'#9ca6a8','plastic',{rim:0,low:.15,grime:.25,fn:(I,r,w,h)=>{ for(let i=0;i<18;i++){ const x=r()*w,y=r()*h,l=16+r()*30,a=1.25+r()*.6; softLine(I,x,y,x+Math.cos(a)*l*.3,y+Math.sin(a)*l,'#d4dcde',.5,.9); softLine(I,x+1.5,y,x+1.5+Math.cos(a)*l*.3,y+Math.sin(a)*l,'#5e6668',.3,.9); }
    prHandprint(I,22,72,'#3e3426',.55,2); prHandprint(I,36,82,'#3e3426',.3,2); for(let k=0;k<5;k++) softLine(I,20+k*2,76,19+k*2.4,92+k*3,'#3e3426',.2,1);   /* a hand pressed on it and dragged down */
    softRect(I,0,0,64,3,'#c8b890',.85,.5); for(const x of [6,30,54]) softRect(I,x,0,6,7,'#c8b890',.8,.4); prDots(I,r,80,'#6a6458',0,0,w,h,.4); }}),
    (x,y,w,h)=>(y>h-5-Math.abs(fbm(x*.08,0,1891))*20||Math.hypot((x-47)/4,(y-56)/11)<1)?0:1),
  batten:()=>prSurf(16,8,1892,'#7a5a3a','woodx'),
  /* the chained exit */
  exitDoor:()=>prSurf(32,64,1893,'#4c5852','paint',{low:.2,grime:.22,fn:(I,r,w,h)=>{ softRect(I,0,h-9,w,9,'#7a7c76',.9,.5); for(let x=0;x<w;x+=2) softLine(I,x,h-9,x,h,'#9a9c96',.2,.5);  /* kick plate */
    prScuff(I,r,16,w,h,h*.62,h-9,'#1a1c1a',.45); softEll(I,13,h-5,3,1.6,'#141614',.5,.5); softEll(I,13,h-3,2.2,1,'#141614',.5,.5); /* a boot print where someone kicked it */
    textI(I,'ESCALERA',0,2,'#d8d2c0',1,.55); textI(I,'01',9,20,'#d8d2c0',2,.8); for(let i=0;i<3;i++) prRust(I,r,r()*w,h-9,7,.5,1); prChips(I,r,12,'#8a8a80',w,h,{s:1.2}); }}),
  exitFrame:()=>prSurf(16,32,1894,'#3e4642','paint',{fn:(I,r,w,h)=>prChips(I,r,8,'#7a7468',w,h,{s:1})}),
  wireGlass:()=>prSurf(16,16,1895,'#1a2428','enamel',{rim:.3,grime:0,fn:I=>{ for(let k=0;k<16;k+=3){ softLine(I,k,0,k,16,'#5a6a6a',.6,.4); softLine(I,0,k,16,k,'#5a6a6a',.6,.4); } blob(I,10,11,4,3,.6,'#5a1a14'); softLine(I,3,2,9,9,'#8a9a9a',.6,.5); }}),
  redPipe:()=>prSurf(16,16,1896,'#8a2620','paint',{rim:0,fn:(I,r)=>prChips(I,r,6,'#3a2a22',16,16,{edge:false,s:1})}),
  brass:()=>prSurf(16,16,1897,'#9a7a3a','steel',{fn:I=>{ blob(I,8,8,5,5,.25); softRect(I,7,9,2,4,'#1a1408',.9,.3); softEll(I,8,8,1.4,1.4,'#1a1408',.9,.3); }}),
  chainSteel:()=>prSurf(8,8,1898,'#5c5e5a','steel',{rim:0,grime:.3,fn:(I,r)=>prDots(I,r,6,'#6a3a1a',0,0,8,8,.6)}),
  exitSign:()=>prSurf(32,12,1899,'#1a0c0a','plastic',{rim:.3,grime:0,fn:I=>textI(I,'SALIDA',5,3,'#ff3a2a',1,1)}),
  /* laundry */
  sheetA:()=>prFab(32,64,1900,'#cfc8b4',{folds:4,dir:'v',grime:.22,decor:I=>{ softRect(I,0,58,32,3,'#5a7a9a',.7,.5); prTide(I,20,30,6,8,'#9a8a5a',.3); }}),
  sheetB:()=>prFab(32,64,1901,'#c8aaa8',{folds:4,dir:'v',grime:.2,decor:I=>{ const r=rng(1902); for(let i=0;i<20;i++){ const x=r()*32,y=r()*64; softEll(I,x,y,1.6,1.2,'#e0c8c4',.6,.5); } prTide(I,12,44,5,6,'#7a5a3a',.3); }}),
  towel:()=>prFab(16,32,1903,(x,y)=>[(y>>2)%3===0?'#3a5a8a':'#c8b890','knit',.8],{folds:3,dir:'v',grime:.25}),
  shirt:()=>prCut(prFab(32,32,1904,'#d8d0bc',{folds:4,dir:'v',grime:.25,decor:I=>{ seam(I,16,6,16,32); for(const y of [10,16,22]) softEll(I,17.5,y,.8,.8,'#8a8478',.9,.4); prTide(I,10,14,4,3,'#9a8a5a',.3); }}),
    (x,y)=>y<2?(Math.abs(x-16)<5?0:1):y<12?1:Math.abs(x-16)<10?1:0),
  /* handhelds */
  iron:()=>prSurf(16,32,1905,'#2c2a28','rust',{rim:0,vl:0,low:0,grime:.1,fn:(I,r)=>{ softRect(I,0,14,16,3,'#6a6662',.9,.4); for(let y=0;y<10;y++) for(let x=0;x<16;x++) mul(I,x,y,.75); prDots(I,r,6,'#6a5a3a',0,0,16,9,.5); prDots(I,r,12,'#5a3418',0,22,16,10,.7); }}),
  ironHandle:()=>prSurf(8,32,1906,'#2c2a28','rust',{fn:I=>{ softEll(I,4,4.5,1.7,2.6,'#050505',.95,.3); }}),
  hamHead:()=>prSurf(16,16,1907,'#34363a','steel',{fn:(I,r)=>{ for(let i=0;i<6;i++) softEll(I,r()*16,r()*16,1.4,1,'#5a3418',.6,.5); }}),
  hamFace:()=>prSurf(8,8,1908,'#9a9c98','steel',{rim:.4}),
  hickory:()=>prSurf(8,32,1909,'#8a6c44','wood',{low:0,fn:I=>{ for(let y=16;y<32;y++) for(let x=0;x<8;x++) mul(I,x,y,.74-((y-16)/16)*.12); softEll(I,4,8,2,3,'#d8c8a0',.3,.6); }}),
  pipeSteel:()=>prSurf(32,32,1910,'#7c7e78','steel',{rim:0,fn:(I,r,w,h)=>{ for(let i=0;i<12;i++) softEll(I,r()*w,r()*h,1+r()*2.4,1+r()*1.4,r()<.4?'#c8c6b8':'#6e3416',.45,.5);
    softRect(I,0,h-10,w,8,'#141414',.95,.4); for(let y=h-10;y<h-2;y+=2) softLine(I,0,y,w,y+1,'#2a2a2a',.6,.6); for(const y of [1,3]) softLine(I,0,y,w,y,'#3a3a36',.6,.6); softLine(I,0,12,w,15,'#a8241c',.3,1.4); }}),
  pipeCoup:()=>prSurf(16,8,1911,'#5e605a','steel',{rim:.3,fn:I=>{ for(let y=1;y<8;y+=2) softLine(I,0,y,16,y,'#3a3a36',.5,.5); }}),
  pipeEnd:()=>prSurf(8,8,1912,'#6a6c66','steel',{rim:0,fn:I=>softEll(I,4,4,2.7,2.7,'#0c0c0c',.95,.3)}),
  cutRed:()=>prSurf(8,32,1913,'#9a2c1e','paint',{fn:(I,r,w,h)=>prChips(I,r,6,'#3a3a38',w,h,{s:1})}),
  rubber:()=>prSurf(16,16,1914,'#1e1a18','foam',{fn:I=>{ for(let y=1;y<16;y+=3) softLine(I,0,y,16,y,'#0a0a0a',.6,.6); }}),
  tool:()=>prSurf(16,16,1915,'#3a3c3e','steel',{lip:.3,fn:(I,r)=>{ for(let i=0;i<4;i++) softEll(I,r()*16,r()*16,1.2,1,'#5a3418',.5,.5); }}),
  jaw:()=>prSurf(8,8,1916,'#5a5c5e','steel',{lip:.5}),
  keyB:()=>prSurf(16,8,1917,'#a8843c','steel',{rim:.2,fn:I=>{ for(let x=6;x<16;x+=3) softEll(I,x,0,1,1.4,'#1a1408',.9,.3); }}),
  keyS:()=>prSurf(16,8,1918,'#9a9ea0','steel',{rim:.2,fn:I=>{ for(let x=5;x<16;x+=2) softEll(I,x,0,.7,1.6,'#1a1a1a',.9,.3); }}),
  leather:()=>prSurf(8,16,1919,'#3a2416','leather',{fn:I=>{ seam(I,1,0,1,16); seam(I,6,0,6,16); }}),
  tinLid:()=>prSurf(32,32,1920,'#d2ccb8','enamel',{fn:(I,r,w,h)=>{ softRect(I,13,6,6,16,'#b42a22',.95,.4); softRect(I,8,11,16,6,'#b42a22',.95,.4); textI(I,'BOTIQUIN',1,26,'#3a3a36',1,.7); prChips(I,r,10,'#5a3a22',w,h,{s:1.4}); blob(I,22,20,4,3,-.15); }}),
  tinSide:()=>prSurf(16,16,1921,'#cac4b0','enamel',{fn:(I,r,w,h)=>prChips(I,r,6,'#5a3a22',w,h,{s:1})}),
  bag:()=>prCut(prSurf(16,16,1922,'#c8ccc8','plastic',{rim:0,grime:.1}),(x,y)=>.42+.3*hash2(x>>1,y>>1,1923)),
  brassCase:()=>prSurf(8,8,1924,'#b08a40','steel',{rim:0}),
  copper:()=>prSurf(8,8,1925,'#9a5a30','steel',{rim:0}),
  ammoBox:()=>prSurf(32,32,1926,'#d8d2c2','card',{fn:(I,r,w,h)=>{ softRect(I,0,0,32,9,'#a8241c',.95,.4); textI(I,'9MM',10,2,'#f2ece0',1,1); textI(I,'50 CART',3,14,'#2a2a2a',1,.85); softLine(I,2,22,30,22,'#a8241c',.7,1); prChips(I,r,6,'#8a8070',w,h,{s:1}); }}),
  ammoSide:()=>prSurf(16,16,1927,'#cfc8b6','card',{fn:I=>softRect(I,0,0,16,4,'#a8241c',.9,.4)}),
  strip:()=>prCut(prFab(16,32,1928,(x,y)=>[x===7?'#8a9ab0':'#cfc8b6','cotton',.6],{folds:3,grime:.3,decor:I=>blob(I,8,20,4,5,.3,'#8a7a5a')}),(x,y,w)=>{ const e=Math.min(x,w-1-x); return e>0?1:hash2(x,y,1929)>.5?1:0; })
};
const PR_T={}; function prTex(k){ return PR_T[k]||(PR_T[k]=PR_TX[k]()); }
/* materials are shared too: the same texture with the same options is one material everywhere */
const PR_MAT=new Map();
function prM(k,o){ const key=(typeof k==='string'?k:'#'+(k.id||(k.id='p'+PR_MAT.size)))+(o?JSON.stringify(o):''); let m=PR_MAT.get(key); if(!m){ m=M(typeof k==='string'?prTex(k):k,o||{}); PR_MAT.set(key,m); } return m; }
const PR_COL=new Map(); /* plain colours (they merge into the palette) */ function prC(hex){ let m=PR_COL.get(hex); if(!m){ m=M(null,{color:hex}); PR_COL.set(hex,m); } return m; }

/* ---------- geometry ---------- */
/* a box cut into cells of at most `cell` m. Same face order and UVs as box() (the whole texture on each face, materials as F()) */
function prCbox(w,h,d,cell=.5,o={}){ const g=new Geo(),S={w,h,d};
  FACES.forEach(([n,U,V,ku,kv,ko],fi)=>{ const start=g.I.length,base=g.P.length/3,du=S[ku]/2,dv=S[kv]/2,off=S[ko]/2,nu=Math.max(1,Math.ceil(S[ku]/cell-.01)),nv=Math.max(1,Math.ceil(S[kv]/cell-.01));
    const pf=o.puff&&o.puff[fi]||0;
    for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){ const a=i/nu*2-1,b=j/nv*2-1,bul=pf*(1-a*a)*(1-b*b); g.v([0,1,2].map(k=>n[k]*(off+bul)+U[k]*a*du+V[k]*b*dv),n,[(a+1)/2,(b+1)/2]); }
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const q=base+j*(nu+1)+i; g.I.push(q,q+1,q+nu+2,q,q+nu+2,q+nu+1); }
    g.groups.push({start,count:g.I.length-start,mi:fi}); });
  if(o.tw!==undefined||o.td!==undefined){ const tw=o.tw??1,td=o.td??1; for(let i=0;i<g.P.length;i+=3){ const k=(g.P[i+1]+h/2)/h; g.P[i]*=1+(tw-1)*k; g.P[i+2]*=1+(td-1)*k; } flatNormals(g); }
  if(o.puff) prSmoothFace(g);
  if(o.at) shift(g,o.at[0],o.at[1],o.at[2]); return g; }
/* smooth normals within each face group (a puffed face shades round, its edges stay sharp) */
function prSmoothFace(g){ for(const gr of g.groups){ const acc=new Map(); for(let t=gr.start;t<gr.start+gr.count;t+=3){ const a=g.I[t],b=g.I[t+1],c=g.I[t+2],P=g.P;
    const n=v3.cross([P[b*3]-P[a*3],P[b*3+1]-P[a*3+1],P[b*3+2]-P[a*3+2]],[P[c*3]-P[a*3],P[c*3+1]-P[a*3+1],P[c*3+2]-P[a*3+2]]); for(const v of [a,b,c]){ const s=acc.get(v)||[0,0,0]; acc.set(v,v3.add(s,n)); } }
  for(const [v,s] of acc){ const q=norm3(s); g.Nm[v*3]=q[0]; g.Nm[v*3+1]=q[1]; g.Nm[v*3+2]=q[2]; } } }
/* cloth thrown over a top w x d: soft lumps on top, hanging drop=[-x,+x,-z,+z] m down each side, its whole texture spread over it
   (the texture's border is the hem) */
function prDrape(w,d,drop,nx,nz,amp,seed){ const g=new Geo(),[dl,dr,db,df]=drop,W=w+dl+dr,D=d+db+df;
  for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++){ const u=-w/2-dl+W*i/nx,v=-d/2-db+D*j/nz,cu=clamp(u,-w/2,w/2),cv=clamp(v,-d/2,d/2),e=Math.max(Math.abs(u-cu),Math.abs(v-cv)),top=e<1e-4;
    const lump=amp*(.9+.6*fbm(u*2.2,v*2.2,seed)+.35*Math.sin(u*9+v*3)),sx=Math.sign(u-cu)*e*.18,sz=Math.sign(v-cv)*e*.18;
    g.v([cu+sx+(top?0:fbm(v*4,e*3,seed+1)*.02),top?lump:-e+lump*.3*(1-e*3),cv+sz+(top?0:fbm(u*4,e*3,seed+2)*.02)],[0,1,0],[i/nx,1-j/nz]); }
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const a=j*(nx+1)+i; g.I.push(a,a+nx+1,a+nx+2,a,a+nx+2,a+1); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
/* hung cloth: n folds zig-zagging +-amp in z across w, hanging h down from y = 0; the hem ragged by `rag`. One mesh, both sides */
function prPleat(w,h,n,amp,o={}){ const g=new Geo(),rows=o.rows||Math.max(1,Math.ceil(h/.55)),r=rng(o.seed||7),bot=[];
  for(let i=0;i<=n;i++) bot.push((r()-.5)*(o.rag||0));
  for(let j=0;j<=rows;j++){ const t=j/rows,tw=1-(o.taper||0)*(1-Math.min(1,t*3)); for(let i=0;i<=n;i++){ const u=i/n,z=(i%2?amp:-amp)*(1+t*(o.flare??.4))+(o.sway||0)*t*t*Math.sin(u*3+1),y=-h*t+(j===rows?bot[i]:0); g.v([(u-.5)*w*tw,y,z],[0,0,1],[u,1-t]); } }
  for(let j=0;j<rows;j++) for(let i=0;i<n;i++){ const a=j*(n+1)+i; g.I.push(a+n+1,a+n+2,a+1,a+n+1,a+1,a); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
/* a profile spun round y: [[y, r, v]], v the texture row (so a pan's inside and outside can be painted apart) */
function prLathe(prof,seg){ const g=new Geo(),rs=seg+1;
  for(const [y,r,v] of prof) for(let i=0;i<=seg;i++){ const a=i/seg*Math.PI*2; g.v([r*Math.sin(a),y,r*Math.cos(a)],[0,1,0],[i/seg,v]); }
  for(let j=0;j<prof.length-1;j++) for(let i=0;i<seg;i++){ const a=j*rs+i,b=a+1,c=a+rs+1,d=a+rs; g.I.push(a,b,c,a,c,d); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
/* a CRT's face: a plane bowed out in the middle */
function prBulge(w,h,b){ const g=plane(w,h,2,2); g.P[4*3+2]+=b; for(const i of [1,3,5,7]) g.P[i*3+2]+=b*.6; smoothNormals(g); return g; }
/* append src transformed by matrix M into dst (one mesh, one draw) */
function prAppend(dst,src,Mx){ const b=dst.P.length/3,P=src.P,Nn=src.Nm;
  for(let i=0;i<P.length;i+=3){ const p=mulP(Mx,[P[i],P[i+1],P[i+2]]); dst.P.push(p[0],p[1],p[2]); const q=norm3([Mx[0]*Nn[i]+Mx[4]*Nn[i+1]+Mx[8]*Nn[i+2],Mx[1]*Nn[i]+Mx[5]*Nn[i+1]+Mx[9]*Nn[i+2],Mx[2]*Nn[i]+Mx[6]*Nn[i+1]+Mx[10]*Nn[i+2]]); dst.Nm.push(q[0],q[1],q[2]); }
  for(const t of src.T) dst.T.push(t); for(const ix of src.I) dst.I.push(ix+b); }
/* chain: links spaced along a polyline, each a squashed ring turned a quarter from the last */
function prChainGeo(pts,pitch,R,r){ const g=new Geo(),ring=torus(R,r,3,6),seg=[]; let tot=0;
  for(let i=1;i<pts.length;i++){ const l=Math.hypot(...v3.sub(pts[i],pts[i-1])); seg.push(l); tot+=l; }
  const at=s=>{ for(let i=0;i<seg.length;i++){ if(s<=seg[i]||i===seg.length-1){ const t=seg[i]?Math.min(1,s/seg[i]):0; return v3.add(pts[i],v3.sc(v3.sub(pts[i+1],pts[i]),t)); } s-=seg[i]; } return pts[pts.length-1]; };
  const n=Math.max(1,Math.round(tot/pitch));
  for(let k=0;k<n;k++){ const a=at(k*tot/n),b=at((k+1)*tot/n),c=v3.sc(v3.add(a,b),.5),d=norm3(v3.sub(b,a)),u=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
    let p1=norm3(v3.cross(d,u)),p2=v3.cross(p1,d); if(k%2){ const t=p1; p1=p2; p2=v3.sc(t,-1); }
    prAppend(g,ring,fromCols(v3.sc(d,1.45),p1,p2,c)); }
  g.groups=[{start:0,count:g.I.length,mi:0}]; return g; }
/* a cloth strip hanging down from the fist: width along z, flat in x, wavering */
function prStripGeo(len,wd,n,seed){ const g=new Geo();
  for(let i=0;i<=n;i++){ const t=i/n,y=-len*t,x=Math.sin(t*5+seed)*.012*t,z=.012*Math.sin(t*3.1+seed)+.02*t; for(const s of [-1,1]) g.v([x,y,z+s*wd/2*(1-.2*t)],[1,0,0],[(s+1)/2,1-t]); }
  for(let i=0;i<n;i++){ const a=i*2; g.I.push(a,a+1,a+3,a,a+3,a+2); } g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
/* a garment on a hanger, hung across the rail (shoulders front to back, the way they hang), shoved a little askew */
function prGarm(g,k,x,y,z,len,ry,seed){ const n=N(g,x,y,z,0,Math.PI/2+ry,0); mk(prPleat(.44,len,4,.045,{seed,rag:.03,taper:.3,flare:.6,rows:2}),prM(k,{double:true}),n,0,-.03,0);
  prBox(n,prC(0x5a4a36),.4,.02,.012,0,-.02,0); }
/* shorthands: a box, a cut box, a cylinder, into g */
const prBox=(g,m,w,h,d,x=0,y=0,z=0,rx=0,ry=0,rz=0,o)=>mk(box(w,h,d,o),m,g,x,y,z,rx,ry,rz);
const prCB=(g,m,w,h,d,x=0,y=0,z=0,rx=0,ry=0,rz=0,o={})=>mk(prCbox(w,h,d,o.cell||.5,o),m,g,x,y,z,rx,ry,rz);
const prCyl=(g,m,rt,rb,h,seg,x=0,y=0,z=0,rx=0,ry=0,rz=0,o)=>mk(cyl(rt,rb,h,seg,o),m,g,x,y,z,rx,ry,rz);
/* six materials for a box: +x, -x, top, bottom, front (+z), back (-z) */
const prF6=(px,nx,py,ny,pz,nz)=>[px,nx,py,ny,pz,nz];
/* a dark, dithered contact prShadow on the floor under a thing, so nothing floats */
function prShadow(g,w,d,x=0,z=0){ for(const [k,c,y] of [[1,0x2c2822,.005],[.86,0x1c1915,.006],[.66,0x110f0d,.007]]) mk(plane(w-(1-k)*Math.min(w,d)*.9,d-(1-k)*Math.min(w,d)*.9),prC(c),g,x,y,z,-Math.PI/2,0,0); }
function propTris(n){ let t=0; if(n.mesh) t+=n.mesh.geo.I.length/3; for(const k of n.kids) if(k.vis!==false) t+=propTris(k); return t; }

/* ---------- the furniture ---------- */
const PROP_B={};
/* single bed: an old metal-tube frame, its underside 42 cm off the floor so Ray can get under, a stained ticking mattress
   (springs and dust seen from below), a pillow, a San Marcos blanket rucked down one side */
PROP_B.bed=(g,o,S)=>{ const W=o.wide?1.4:1.0,L=2.0,u=.42,mF=prM('bedMetal'),mT=prM('matTop'),mS=prM('matSide'),hz=-L/2+.02,fz=L/2-.02;
  prShadow(g,W+.12,L+.12);
  for(const sx of [-1,1]){ const x=sx*(W/2-.02); prBox(g,mF,.045,.98,.045,x,.49,hz); prBox(g,mF,.045,.72,.045,x,.36,fz); prBox(g,mF,.035,.1,L-.06,x,.47,0); }
  prBox(g,mF,W-.04,.06,.035,0,.49,fz); prBox(g,mF,W-.04,.05,.045,0,.955,hz); prBox(g,mF,W-.04,.04,.035,0,.6,hz); prBox(g,mF,W-.04,.045,.04,0,.7,fz);
  for(const x of [-W*.22,0,W*.22]) prBox(g,mF,.024,.32,.024,x,.78,hz);   /* headboard bars */
  for(const x of [-W*.2,W*.2]) prBox(g,mF,.022,.16,.022,x,.6,fz);        /* footboard bars */
  mk(prCbox(W-.06,.18,L-.08,.55,{puff:{2:.025}}),prF6(mS,mS,mT,prM('matUnder'),mS,mS),g,0,.61,0);
  prBox(g,prM('pillow'),W*.62,.1,.38,o.seed&1?.05:-.04,.745,hz+.3,.04,.07,.03,{tw:.86,td:.8});
  mk(prDrape(W-.06,1.18,[.08,.3,0,.2],6,8,.022,o.seed||5),prM('blanket',{double:true}),g,0,.702,.37);
  prBox(g,prM('card'),.3,.11,.18,-W/2+.26,.055,hz+.34,0,.3,0); prCyl(g,M(tGlass),.032,.032,.24,6,W/2-.22,.032,.55,0,1.2,Math.PI/2); /* shoved under it: a shoebox, a bottle */
  S.solids.push([-W/2,-L/2,W/2,L/2,u,.71],[-W/2,-L/2,W/2,-L/2+.05,u,.98]);
  for(const sx of [-1,1]) for(const z of [hz,fz]) S.solids.push([sx*(W/2-.02)-.025,z-.025,sx*(W/2-.02)+.025,z+.025,0,u]);
  S.hides.push({kind:'bed',x:0,z:0,w:W-.08,d:L-.08,h:u}); S.top=.7; };
/* tall cheap wardrobe, NO door leaves: the open front has a curtain over most of it and clothes hung across, shoulders front to
   back, so you push in between them. Veneer gone at the bottom where water got in */
PROP_B.wardrobe=(g,o,S)=>{ const W=1.08,D=.7,H=2.12,t=.035,mO=prM('wardWood'),mI=prM('chip'),mBk=prM('wardBack'),mR=prM('steelDark');
  prShadow(g,W+.12,D+.1);
  for(const sx of [-1,1]) prCB(g,sx>0?prF6(mO,mI,mO,mO,mO,mO):prF6(mI,mO,mO,mO,mO,mO),t,H,D,sx*(W/2-t/2),H/2,0,0,0,0,{cell:.75});
  prCB(g,prF6(mO,mO,mO,mI,mO,mO),W,.06,D+.02,0,H-.03,.01,0,0,0,{cell:.6}); prBox(g,mO,W+.04,.04,.04,0,H+.01,D/2+.01);
  prBox(g,prF6(mO,mO,mBk,mO,mO,mO),W-2*t,.07,D-.03,0,.035,0);
  prBox(g,mBk,W-2*t,H-.13,.018,0,(H-.13)/2+.07,-D/2+.012);
  for(const sx of [-1,1]) prBox(g,mO,.055,H-.06,.03,sx*(W/2-t-.025),(H-.06)/2,D/2-.015);
  prCyl(g,mR,.011,.011,W-2*t,6,0,1.86,-.02,0,0,Math.PI/2);
  const r=rng(o.seed||17); let x=-.36;
  for(const [k,len,ry] of [['cPlaid',.86,.5],['cCoat',1.08,-.3],['cFloral',1.22,.4],['cDenim',.9,-.45],['cCoat',.8,.25]]){ prGarm(g,k,x,1.86,-.02,len,ry+(r()-.5)*.2,(o.seed||3)+x*50|0); x+=.17; }
  for(const [sx,sz,ry] of [[-.32,-.16,.2],[-.2,-.19,-.1]]) prBox(g,prM('shoe'),.1,.08,.26,sx,.11,sz,0,ry,0,{tw:.8,td:.7});
  prBox(g,prM('card'),.5,.32,.42,.1,H+.19,-.04,0,.12,0);
  S.curtain=mk(prPleat(.44,1.92,8,.04,{seed:(o.seed||3)+1,rag:.04,rows:3}),prM('curtA',{double:true}),g,.27,2.0,D/2-.016);
  prCyl(g,mR,.004,.004,W-.1,4,0,2.0,D/2-.012,0,0,Math.PI/2);
  S.solids.push([-W/2,-D/2,-W/2+t,D/2,0,H],[W/2-t,-D/2,W/2,D/2,0,H],[-W/2,-D/2,W/2,-D/2+.025,0,H],[-W/2,-D/2,W/2,D/2,H-.06,H]);
  S.hides.push({kind:'wardrobe',x:0,z:.01,w:W-2*t,d:D-.04,h:H-.13}); S.sight.push([.05,D/2-.06,.49,D/2+.03,.08,2.0]); };
/* built-in closet: plastered to the ceiling, a timber casing round the opening, a shelf, a rail, a curtain on a tension rod.
   opts.niche: F's walls already form the box (an alcove), so only the inside and the casing are drawn and no solids returned.
   opts.wallTex: the room's wall texture for the outside faces */
PROP_B.closet=(g,o,S)=>{ const W=1.0,D=.65,H=2.0,T=.08,RHh=o.h||RH,wall=o.wallTex?prM(o.wallTex,{repeat:[1,1]}):prM('plaster'),inner=prM('plaster'),mT=prM('trim'),z1=D/2;
  if(!o.niche){ prShadow(g,W+.3,D+.3,0,0);
    for(const sx of [-1,1]) prCB(g,sx>0?prF6(wall,inner,wall,wall,wall,wall):prF6(inner,wall,wall,wall,wall,wall),T,RHh,D+T,sx*(W/2+T/2),RHh/2,-T/2,0,0,0,{cell:.95});
    prCB(g,prF6(wall,wall,wall,inner,wall,inner),W,RHh-H,T,0,H+(RHh-H)/2,z1-T/2,0,0,0,{cell:.7});
    prCB(g,prF6(wall,wall,wall,wall,inner,wall),W+2*T,RHh,T,0,RHh/2,-D/2-T/2,0,0,0,{cell:.95});
    S.solids.push([-W/2-T,-D/2-T,-W/2,z1,0,RHh],[W/2,-D/2-T,W/2+T,z1,0,RHh],[-W/2-T,-D/2-T,W/2+T,-D/2,0,RHh]); }
  else { mk(plane(W,RHh,2,4),inner,g,0,RHh/2,-D/2+.004); for(const sx of [-1,1]) mk(plane(D,RHh,1,4),inner,g,sx*(W/2-.004),RHh/2,0,0,-sx*Math.PI/2,0); }
  for(const sx of [-1,1]) prBox(g,mT,.07,H+.07,.025,sx*(W/2+.025),(H+.07)/2,z1+.0125);
  prBox(g,mT,W+.12,.07,.025,0,H+.035,z1+.0125);
  prBox(g,prM('plank'),W,.025,.36,0,1.76,-D/2+.18); prCyl(g,prM('steelDark'),.01,.01,W,6,0,1.68,-.03,0,0,Math.PI/2);
  const r=rng(o.seed||23); let x=-.3;
  for(const [k,len,ry] of [['cCoat',1.1,.4],['cPlaid',.84,-.45],['cDenim',.92,.35],['cFloral',1.15,-.3]]){ prGarm(g,k,x,1.68,-.03,len,ry+(r()-.5)*.2,(o.seed||7)+x*40|0); x+=.19; }
  prBox(g,prM('card'),.42,.26,.32,-.2,1.9,-D/2+.18,0,.15,0); prBox(g,prM('shoe'),.1,.08,.26,.3,.04,-.15,0,.3,0,{tw:.8,td:.7});
  S.curtain=mk(prPleat(.46,1.9,8,.035,{seed:(o.seed||5)+2,rag:.04,rows:3}),prM('curtB',{double:true}),g,-.26,H-.03,z1-.04);
  prCyl(g,prM('steelDark'),.008,.008,W,4,0,H-.03,z1-.035,0,0,Math.PI/2);
  S.hides.push({kind:'closet',x:0,z:0,w:W,d:D,h:H}); S.sight.push([-.5,z1-.08,-.02,z1,.1,H]); };
/* enamel tub, a tiled apron, taps and a riser to the shower head, a moulding plastic curtain hung inside the rim. Hollow: the
   basin floor is 11 cm up, so Ray can lie in it behind the curtain */
PROP_B.tub=(g,o,S)=>{ const L=1.6,D=.74,H=.56,tw=.065,mE=prM('enamel'),mA=prM('tubTile'),mC=prM('chrome'),bz=-D/2;
  prShadow(g,L+.08,D+.08);
  prCB(g,prF6(mA,mA,mE,mA,mA,mE),L,H-.04,tw,0,(H-.04)/2,D/2-tw/2);
  prBox(g,mE,L,H-.04,tw,0,(H-.04)/2,-D/2+tw/2);
  for(const sx of [-1,1]) prBox(g,mE,tw+.02,H-.04,D-2*tw,sx*(L/2-tw/2-.01),(H-.04)/2,0);
  prBox(g,mE,L+.02,.045,.09,0,H-.022,D/2-.04); prBox(g,mE,L+.02,.045,.09,0,H-.022,-D/2+.04); for(const sx of [-1,1]) prBox(g,mE,.1,.045,D-.16,sx*(L/2-.04),H-.022,0);
  prBox(g,prF6(mE,mE,prM('tubFloor'),mE,mE,mE),L-2*tw-.02,.1,D-2*tw,0,.05,0);
  const tx=-L/2+.25;
  prBox(g,mC,.03,.03,.14,tx,H+.12,bz+.07); for(const s of [-1,1]) prBox(g,mC,.06,.03,.014,tx+s*.12,H+.16,bz+.035);
  prCyl(g,mC,.012,.012,1.2,6,tx,H+.12+.6,bz+.02); prBox(g,mC,.024,.024,.22,tx,1.9,bz+.11,-.25,0,0); prCyl(g,mC,.045,.02,.05,6,tx,1.86,bz+.22,.6,0,0);
  prCyl(g,mC,.01,.01,L,5,0,2.0,D/2-.08,0,0,Math.PI/2);
  const cw=L*.7; S.curtain=mk(prPleat(cw,1.56,10,.032,{seed:5,rag:.03,rows:2}),prM('showerC',{double:true}),g,L/2-cw/2-.04,1.99,D/2-.08);
  prBox(g,prC(0xd8c890),.08,.025,.05,L/2-.12,H+.012,-D/2+.05,0,.3,0); prBox(g,prC(0x2a6a8a),.06,.2,.04,L/2-.07,H+.1,-D/2+.055,0,.4,0,{tw:.8,td:.8});
  S.solids.push([-L/2,D/2-tw,L/2,D/2,0,H],[-L/2,-D/2,L/2,-D/2+tw,0,H],[-L/2,-D/2,-L/2+tw+.02,D/2,0,H],[L/2-tw-.02,-D/2,L/2,D/2,0,H],[-L/2,-D/2,L/2,D/2,0,.1]);
  S.hides.push({kind:'tub',x:0,z:0,w:L-2*tw,d:D-2*tw,h:2.0}); S.sight.push([L/2-cw-.04,D/2-.12,L/2-.04,D/2-.05,.42,1.99]); };
/* worn sofa: sagging seat cushions (one split, the foam showing), raked back, square arms, an afghan thrown over the back.
   opts.hideBehind: a hiding spot in the gap behind it (keep PROP_DIMS.sofa.gap clear to the wall) */
PROP_B.sofa=(g,o,S)=>{ const W=2.0,D=.88,mS=prM('sofa'),mA=prM('cushA'),mB=prM('cushB'),mW=prM('darkWood');
  prShadow(g,W+.12,D+.1);
  for(const sx of [-1,1]) for(const sz of [-1,1]) prBox(g,mW,.05,.07,.05,sx*(W/2-.08),.035,sz*(D/2-.08),0,0,0,{tw:1.2,td:1.2});
  prCB(g,mS,W,.3,D-.06,0,.22,0,0,0,0,{cell:.6});
  prCB(g,mS,W,.52,.22,0,.62,-D/2+.11,-.1,0,0,{cell:.6});
  for(const sx of [-1,1]) prBox(g,mS,.2,.62,D,sx*(W/2-.1),.38,0,0,0,0,{tw:.85});
  for(let i=0;i<3;i++){ const x=-.6+i*.6,sag=i===1?-.03:0; prBox(g,i===2?mB:mA,.6,.14,.6,x,.43+sag,.08,(i-1)*.015,0,(i-1)*.02,{tw:.94,td:.92}); prBox(g,mA,.6,.38,.15,x,.68+sag*.5,-.25,-.22+(i===0?.06:0),0,(i-1)*-.02,{tw:.9,td:.85}); }
  const mT=prM('throw'); prBox(g,mT,.62,.03,.36,.55,.9,-.36,-.4,.1,0); prBox(g,mT,.6,.42,.03,.56,.66,-D/2-.01,.04,.1,0);
  S.solids.push([-W/2,-D/2,W/2,D/2,0,.86]);
  if(o.hideBehind){ const gp=o.gap||PROP_DIMS.sofa.gap; S.hides.push({kind:'sofa',x:0,z:-D/2-gp/2,w:W-.2,d:gp,h:.86}); } };
/* a pile of old mattresses leaned against the wall, their bottoms ~0.9 m out: a gap behind to crouch in */
PROP_B.mattresses=(g,o,S)=>{ const D=1.05,wz=-D/2,L=1.9,T=.19,mS=prM('matSideV'),mE=prM('matSide'),mU=prM('matUnder');
  prShadow(g,1.95,1.1);
  const lean=(x,bz,ry,top)=>{ let a=.3; for(let k=0;k<30;k++){ const f=L*Math.sin(a)+T*Math.cos(a)-(bz-.01); a-=f/(L*Math.cos(a)-T*Math.sin(a)); } /* solve the lean so the top just rests on the wall */
    const n=N(g,x,0,wz+bz,-a,ry,0); prCB(n,prF6(mS,mS,mE,mE,top,mU),.9,L,T,0,L/2,-T/2,0,0,0,{cell:.4,puff:{4:.06,5:.03,0:.02,1:.02}}); return a; };
  lean(-.47,.86,.04,prM('matTop')); lean(.48,.98,-.06,prM('matTop2'));
  prBox(g,prM('blanket'),.4,.12,.3,.82,.06,wz+.18,0,.4,0,{tw:.8,td:.8});
  for(const [x0,x1,bz] of [[-.93,-.02,.86],[.02,.93,.98]]) S.solids.push([x0,wz+bz-.32,x1,wz+bz+.03,0,.85]);
  S.solids.push([-.93,wz,.93,wz+.32,1.2,1.7]);
  S.hides.push({kind:'mattress',x:0,z:wz+.3,w:1.8,d:.5,h:1.0}); };
/* a washing line wall to wall, sheets hung to a hand's width off the floor (feet show under them) */
PROP_B.laundry=(g,o,S)=>{ const len=o.len||PROP_DIMS.laundry.w,y=1.92,sag=.07,mR=prM('rope'),a=Math.atan2(sag,len/2);
  prCyl(g,mR,.004,.004,Math.hypot(len/2,sag),4,-len/4,y-sag/2,0,0,0,-Math.PI/2-a); prCyl(g,mR,.004,.004,Math.hypot(len/2,sag),4,len/4,y-sag/2,0,0,0,-Math.PI/2+a);
  for(const s of [-1,1]) prBox(g,prM('steelDark'),.03,.03,.05,s*(len/2-.015),y,-.0);
  const yAt=x=>y-sag*(1-Math.abs(x)/(len/2)),slope=x=>(x<0?-1:1)*sag/(len/2);
  const items=[['sheetA',.95,1.62,7],['towel',.5,.8,3],['sheetB',1.0,1.55,7],['shirt',.55,.72,3]],tot=items.reduce((s,i)=>s+i[1],0),kw=Math.min(1,(len-.2-.06*items.length)/tot),gap=(len-.2-tot*kw)/items.length;
  let x=-len/2+.1+gap/2;
  for(const [k,w0,h,n] of items){ const w=w0*kw,cx=x+w/2,mt=prM(k,{double:true,cut:k==='shirt'}),rz=Math.atan(slope(cx));
    mk(prPleat(w,h,n,.03,{seed:n*7+3,rag:.05}),mt,g,cx,yAt(cx)+.004,.012,0,0,rz);
    if(h>1.2) mk(prPleat(w,.24,n,.02,{seed:n*5,rag:.03}),mt,g,cx,yAt(cx)+.004,-.016,0,0,rz);   /* the fold thrown over the line */
    for(const s of [-.35,.35]) prBox(g,prC(0xb89a6a),.012,.05,.014,cx+s*w,yAt(cx+s*w)-.012,.02);
    x+=w+gap; }
  S.hides.push({kind:'sheets',x:0,z:-.35,w:len-.3,d:.6,h:1.9}); S.sight.push([-len/2,-.05,len/2,.05,.3,y]); };
/* folding card table: worn green felt with cigarette burns and the game still on it */
PROP_B.cardtable=(g,o,S)=>{ const W=.86,T=.72,mV=prM('vinyl');
  prShadow(g,W+.1,W+.1);
  prBox(g,prF6(mV,mV,prM('felt'),mV,mV,mV),W,.035,W,0,T-.0175,0); prBox(g,mV,W-.04,.05,W-.04,0,T-.06,0);
  for(const sx of [-1,1]) for(const sz of [-1,1]) prBox(g,prM('steelDark'),.022,T-.04,.022,sx*(W/2-.06),(T-.04)/2,sz*(W/2-.06),sz*.06,0,-sx*.06);
  if(o.items!==false){ const y=T+.001,mF=prM('cardFace'),mK=prM('cardBack'),cards=prF6(mK,mK,mF,mK,mK,mK);
    for(let i=0;i<3;i++) prBox(g,cards,.063,.002,.088,-.18+i*.022,y+.001+i*.001,.16,0,-.5+i*.3,0);
    prBox(g,prF6(mK,mK,mK,mK,mK,mK),.065,.022,.09,.2,y+.011,-.2,0,.4,0);
    prCyl(g,prC(0x5a4030),.06,.05,.025,8,-.25,y+.0125,-.22); for(let i=0;i<3;i++) prBox(g,prC(i?0xd8d0c0:0xc8843a),.008,.008,.035,-.25+(i-1)*.02,y+.026,-.22+(i%2)*.015,0,i*1.3,0);
    prCyl(g,prM('can'),.033,.033,.12,6,.27,y+.06,.2); prCyl(g,prM('can'),.033,.033,.12,6,.1,y+.033,.3,0,.6,Math.PI/2);
    prCyl(g,M(tGlass),.03,.034,.18,6,-.3,y+.09,.25); prCyl(g,M(tGlass),.012,.014,.07,6,-.3,y+.215,.25);
    prBox(g,prC(0x6a7a5a),.07,.012,.15,.05,y+.006,-.05,0,.2,0); prBox(g,prC(0xa82a1e),.02,.012,.045,.22,y+.006,.0,0,1,0); }
  S.solids.push([-W/2,-W/2,W/2,W/2,0,T]); S.top=T; };
/* kitchen table: painted legs, a red gingham hule hanging over the edge, a bottle of hot sauce and a glass at one end
   (the middle stays clear: the bolt cutter may be left on it) */
PROP_B.table=(g,o,S)=>{ const W=1.1,D=.7,T=.755,mL=prM('legPaint'),mO=prM('oilcloth'),mE=prM('oilEdge');
  prShadow(g,W+.16,D+.16);
  for(const sx of [-1,1]) for(const sz of [-1,1]) prBox(g,mL,.05,T-.06,.05,sx*(W/2-.07),(T-.06)/2,sz*(D/2-.07),0,0,0,{tw:1.25,td:1.25});
  prBox(g,mL,W-.1,.08,D-.1,0,T-.1,0);
  prBox(g,prF6(mE,mE,mO,prM('woodUnder'),mE,mE),W+.12,.1,D+.12,0,T-.05,0,0,0,0,{tw:(W+.005)/(W+.12),td:(D+.005)/(D+.12)});
  if(o.items!==false){ prCyl(g,prC(0x6a1a10),.025,.03,.16,6,-W/2+.14,T+.08,-.16); prCyl(g,prC(0xe8e0c8),.012,.016,.03,6,-W/2+.14,T+.175,-.16); prCyl(g,M(tGlass),.035,.03,.1,6,-W/2+.26,T+.05,-.2); }
  S.solids.push([-W/2-.06,-D/2-.06,W/2+.06,D/2+.06,0,T]); S.top=T+.002; };
/* kitchen chair: painted, chipped, a woven reed seat */
PROP_B.chair=(g,o,S)=>{ const mW=prM('legPaint'),sh=.45,w=.42,e=w/2-.03;
  prShadow(g,.52,.52);
  for(const sx of [-1,1]){ prBox(g,mW,.035,sh,.035,sx*e,sh/2,e,0,0,0,{tw:1.15,td:1.15}); prBox(g,mW,.035,.92,.035,sx*e,.46,-e,-.06,0,0); }
  prBox(g,prF6(mW,mW,prM('reed'),mW,mW,mW),w,.035,w,0,sh,0);
  for(const y of [.68,.82]) prBox(g,mW,w-.04,.06,.022,0,y,-e-(y-.46)*.06,-.06,0,0);
  for(const sz of [-1,1]) prBox(g,mW,w-.06,.025,.025,0,.16,sz*e);
  S.solids.push([-w/2,-w/2,w/2,w/2,0,sh+.04]); S.top=sh+.02; };
/* kitchen: a plastered block counter, tiled top with a blue edge, a steel sink with grey water and a pot soaking (it joins the
   drowning sinks), a gingham curtain under it, a two-burner hotplate on the counter fed by a hose from the gas bottle in the bay
   at the end, tiles behind, a plank shelf of pots. opts.len */
PROP_B.kitchen=(g,o,S)=>{ const L=o.len||2.0,D=.62,T=.92,bay=.44,bL=L-bay,sx=-L/2+.5,stx=L/2-.32,wz=-D/2,mK=prM('kitBase'),mC=prM('chrome'),mA=prM('alu'),mD=prM('steelDark');
  prShadow(g,L+.08,D+.08);
  prCB(g,mK,bL,T-.05,D-.02,-L/2+bL/2,(T-.05)/2,-.01,0,0,0,{cell:.6}); prBox(g,mK,.04,T-.05,D-.02,L/2-.02,(T-.05)/2,-.01);
  prCyl(g,[prM('gasCyl'),prM('gasTop'),prM('gasTop')],.15,.15,.55,8,L/2-.23,.28,-.04); prCyl(g,mD,.03,.05,.07,6,L/2-.23,.59,-.04); prCyl(g,prC(0x1e1e1e),.007,.007,.36,4,L/2-.23,.76,wz+.06,.5,0,0);
  const mE=prM('ctrEdge',{repeat:[L/.64,1]}); prBox(g,prF6(prM('ctrEdge'),prM('ctrEdge'),prM('ctrTile',{repeat:[L/.64,1]}),mK,mE,mE),L+.02,.05,D+.03,0,T-.025,.005);
  mk(plane(L,.5,Math.ceil(L/.6),1),prM('splash',{repeat:[L/.64,.5/.64]}),g,0,T+.25,wz+.004);
  prBox(g,prM('steel'),.5,.025,.42,sx,T+.008,0); prBox(g,prC(0x2c3438),.42,.006,.34,sx,T+.022,0); prCyl(g,mA,.1,.09,.1,6,sx+.08,T+.01,.02,.25,0,.1);
  prCyl(g,mC,.012,.012,.2,6,sx,T+.1,wz+.05); prBox(g,mC,.025,.025,.16,sx,T+.19,wz+.12,.15,0,0);
  S.curtain=mk(prPleat(.72,.82,6,.016,{seed:9,rag:.02,rows:1}),prM('gingham',{double:true}),g,sx,.86,D/2+.012);
  prBox(g,prF6(prM('stoveSide'),prM('stoveSide'),prM('stoveTop'),mD,prM('stoveSide'),prM('stoveSide')),.56,.09,.34,stx,T+.045,.02);
  for(const s of [-1,1]) prBox(g,mD,.16,.012,.16,stx+s*.14,T+.096,.02,0,.785,0,{tw:.6,td:.6});
  prCyl(g,mA,.11,.1,.13,7,stx-.14,T+.165,.02); prBox(g,mD,.14,.02,.025,stx-.14,T+.2,.16,0,.4,0);
  const shx=-L/2+.62; prBox(g,prM('plank'),.9,.03,.22,shx,1.55,wz+.11); for(const s of [-1,1]) prBox(g,mD,.02,.12,.18,shx+s*.38,1.48,wz+.09);
  prCyl(g,mA,.1,.1,.11,7,shx-.25,1.62,wz+.11); prCyl(g,mA,.08,.07,.09,6,shx-.02,1.61,wz+.11); prBox(g,prM('jar'),.075,.12,.075,shx+.22,1.625,wz+.1,0,.4,0);
  S.solids.push([-L/2,-D/2,L/2,D/2,0,T],[shx-.45,wz,shx+.45,wz+.22,1.42,1.68]); S.sink=[sx,0]; S.top=T; };
/* old round-shouldered fridge, yellowed, magnets and a note on the door, rust coming through at the bottom, a radio on top */
PROP_B.fridge=(g,o,S)=>{ const W=.7,D=.68,H=1.62,mD=prM('fridge'),mS=prM('fridgeSide'),mT=prM('enamelPlain'),mC=prM('chrome');
  prShadow(g,W+.08,D+.08);
  prCB(g,prF6(mS,mS,mT,mT,prC(0x1a1814),mS),W,H-.16,D-.035,0,.06+(H-.16)/2,-.0175,0,0,0,{cell:.6});
  prCB(g,prF6(mT,mT,mT,mT,mD,mT),W-.012,H-.2,.03,0,.08+(H-.2)/2,D/2-.016,0,0,0,{cell:.6});
  prBox(g,mT,W,.1,D,0,H-.05,0,0,0,0,{tw:.93,td:.9}); prBox(g,prM('grille'),W-.04,.06,.02,0,.03,D/2-.02);
  prBox(g,mC,.025,.32,.03,W/2-.07,1.1,D/2+.035); for(const y of [.96,1.24]) prBox(g,mC,.02,.02,.04,W/2-.07,y,D/2+.015);
  for(const y of [.25,1.35]) prBox(g,mC,.03,.06,.02,-W/2+.03,y,D/2+.008);
  mk(plane(.06,.09),prM(tTwVirgin),g,-.13,1.27,D/2+.003);
  prBox(g,prC(0x2a2826),.26,.14,.1,-.1,H+.07,-.1,0,.2,0); prCyl(g,mC,.003,.003,.3,4,-.2,H+.27,-.12,.3,0,.25);
  S.solids.push([-W/2,-D/2,W/2,D/2,0,H]); };
/* old wood-cased CRT on a black metal cart, rabbit ears, a VCR blinking 12:00 underneath. S.screen is its own node with its own
   material (never merged): S.setTV(on, brightness) switches it and makes it flicker */
PROP_B.tv=(g,o,S)=>{ const sH=.5,ty=sH+.23,mD=prM('steelDark'),mW=prM('tvWood'),mP=prM('plasticDark');
  prShadow(g,.68,.58);
  for(const sx of [-1,1]) for(const sz of [-1,1]) prBox(g,mD,.025,sH,.025,sx*.29,sH/2,sz*.22);
  prBox(g,mD,.62,.02,.48,0,sH-.01,0); prBox(g,mD,.6,.015,.46,0,.12,0);
  prBox(g,prF6(mP,mP,mP,mP,prM('vcr'),mP),.42,.08,.3,0,.17,.03);
  prBox(g,prF6(mW,mW,mW,mW,prM('tvFront'),mW),.58,.46,.22,0,ty,.1);
  prBox(g,mP,.44,.24,.34,0,ty,-.12,-Math.PI/2,0,0,{tw:.78,td:.72});
  for(const y of [.06,-.03]) prCyl(g,prC(0x3a3632),.018,.018,.02,6,.235,ty+y,.215,Math.PI/2,0,0);
  prBox(g,prC(0x1e1e1e),.1,.025,.06,0,ty+.24,-.05); for(const s of [-1,1]) prCyl(g,prM('chrome'),.003,.003,.42,4,s*.1,ty+.44,-.05,0,0,-s*.5);
  const sm=M(prTex(o.off?'tvOff':'tvOn'),{unlit:!o.off}),scr=mk(prBulge(.4,.31,.012),sm,g,-.035,ty+.02,.212); scr.live=true; S.screen=scr; S.screenMat=sm;
  S.setTV=(on,k=1)=>{ sm.tex=prTex(on?'tvOn':'tvOff'); sm.unlit=on?1:0; sm.color=[k,k,k]; };
  S.solids.push([-.31,-.26,.31,.26,0,sH+.46]); S.pts={glow:[0,ty,.5]}; };
/* slotted-angle steel shelving with an X brace at the back: paint cans, boxes, rope, cleaning bottles. Level 2 is kept clear in
   the middle (S.free) so the bolt cutter can be left there */
PROP_B.shelf=(g,o,S)=>{ const W=1.0,D=.4,H=1.8,lv=[.1,.52,.94,1.36,1.78],mP=prM('slotted'),mS=prM('shelfSteel'),mD=prM('steelDark');
  prShadow(g,W+.08,D+.08);
  for(const sx of [-1,1]) for(const sz of [-1,1]) prBox(g,mP,.035,H,.035,sx*(W/2-.0175),H/2,sz*(D/2-.0175));
  for(const y of lv) prBox(g,mS,W-.01,.022,D-.01,0,y-.011,0);
  for(const s of [-1,1]) prBox(g,mD,.012,2.02,.012,0,.9,-D/2+.01,0,0,s*.507);
  const can=prM('paintCan'),lid=prM('steel'); prCyl(g,[can,lid,lid],.085,.085,.19,8,-.3,lv[0]+.095,0); prCyl(g,[can,lid,lid],.085,.085,.19,8,-.1,lv[0]+.095,.05,0,.8,0);
  prCyl(g,[prM('bucket'),prC(0x1a2a3a),prM('bucket')],.13,.11,.24,8,.3,lv[0]+.12,0);
  const cbx=prF6(prM('card'),prM('card'),prM('cardTop'),prM('card'),prM('card'),prM('card')); prBox(g,cbx,.36,.3,.32,-.25,lv[1]+.15,0,0,.06,0); prBox(g,cbx,.3,.24,.3,.2,lv[1]+.12,.02,0,-.1,0);
  mk(torus(.09,.022,3,8),prM('rope'),g,-.36,lv[2]+.022,.0,Math.PI/2,0,0); prBox(g,prC(0x5a5248),.2,.05,.16,.4,lv[2]+.025,.05,0,.3,0);
  prCyl(g,prC(0x2a6aa0),.035,.04,.22,6,-.3,lv[3]+.11,.04); prCyl(g,prC(0xd8d0b8),.04,.04,.25,6,-.18,lv[3]+.125,0); prBox(g,cbx,.32,.2,.3,.25,lv[3]+.1,0,0,.2,0);
  prBox(g,cbx,.4,.22,.34,-.1,lv[4]+.11,0,0,-.08,0);
  S.solids.push([-W/2,-D/2,W/2,D/2,0,H]); S.levels=lv.slice(); S.free={level:2,y:lv[2],x0:-.22,x1:.26}; };
/* a galvanised pipe along the wall at 2.35 m, split and sagging at a coupling; the water streams into a bucket someone put
   under it, the bucket's overflowing, the wall below is black with wet, the floor's a puddle. S.stream animates (S.tick(t)) */
PROP_B.pipeburst=(g,o,S)=>{ const len=o.len||PROP_DIMS.pipeburst.w,py=2.35,wz=-.2,pz=wz+.08,mP=prM('pipe'),mD=prM('steelDark');
  prCyl(g,mP,.03,.03,len/2-.05,8,-len/4-.02,py,pz,0,0,Math.PI/2); prCyl(g,mP,.038,.038,.07,8,-.035,py,pz,0,0,Math.PI/2);
  const brk=N(g,.03,py,pz,0,0,-.07); prCyl(brk,mP,.03,.03,len/2-.05,8,(len/2-.05)/2+.01,0,0,0,0,Math.PI/2);
  for(const x of [-len/2+.3,len/2-.35]) prBox(g,mD,.04,.12,.11,x,py+.02,wz+.05);
  mk(plane(.75,py+.05,2,3),prM('wetWall',{cut:true}),g,.05,(py+.05)/2,wz+.004);
  const bz=pz+.07; prCyl(g,[prM('bucket'),prC(0x343e42),prM('bucket')],.15,.12,.3,8,.07,.15,bz);
  prBox(g,mP,.05,.004,.045,.035,py-.035,pz+.03,.5,.3,.4); prBox(g,mP,.03,.004,.03,.0,py+.03,pz+.025,-.6,0,-.3);   /* the split: two torn lips */
  const st=N(g,0,0,0),sm=M(prTex('stream0'),{double:true,emissive:0x1a2224}); st.live=true; S.stream=st;
  for(const a of [0,Math.PI/2]) mk(plane(.022,py-.3,1,3),sm,st,.07,(py+.3)/2-.02,pz+.035,0,a,0);
  for(const [a,l] of [[.5,.22],[-.4,.16],[.15,.28]]) mk(plane(.016,l,1,1),sm,st,.04+Math.sin(a)*l/2,py-.02-Math.cos(a)*l/2,pz+.06,.25,0,a);   /* spray fanning out of the split */
  mk(plane(1.7,1.4,2,2),prM('puddle',{cut:true}),g,.05,.007,bz+.38,-Math.PI/2,0,0);
  S.tick=t=>{ sm.tex=prTex('stream'+((t*14|0)%3)); st.s=[1+.05*Math.sin(t*31),1,1]; };
  S.solids.push([-.08,bz-.15,.22,bz+.15,0,.3]); S.pts={src:[.07,1.2,pz]}; };
for(let k=0;k<3;k++) PR_TX['stream'+k]=()=>prSurf(4,32,1930+k,'#b4c8cc','enamel',{rim:0,low:0,grime:0,vl:0,fn:I=>{ for(let y=0;y<32;y++) for(let x=0;x<4;x++) mul(I,x,y,(.62+.62*hash2(x>>1,(y+k*3)>>2,1933))*(x===0||x===3?.78:1.08)); }});
/* the unfinished room: a column stub snapped at a metre, its bars bent over, loose rebar and a cement sack on the floor */
PROP_B.rebar=(g,o,S)=>{ const mC=prM('conc'),mR=prM('rebar'),cx=-.55,cz=-.22;
  prShadow(g,.56,.56,cx,cz); prShadow(g,.46,.62,.6,-.22);
  prCB(g,prF6(mC,mC,prM('concTop'),mC,mC,mC),.42,1.0,.42,cx,.5,cz);
  prBox(g,prM('concTop'),.3,.12,.26,cx+.05,1.04,cz-.03,.2,.3,.15); prBox(g,prM('concTop'),.2,.1,.18,cx-.08,1.03,cz+.08,-.3,.1,-.2);
  for(const [dx,dz,a,b] of [[-.15,-.15,.5,.9],[.15,-.15,-.3,.6],[.15,.15,.7,-.4],[-.15,.15,-.6,1.2]]){ const n=N(g,cx+dx,1.0,cz+dz,0,b,0); prCyl(n,mR,.007,.007,.36,4,0,.18,0); const t=N(n,0,.36,0,a+(a>0?.6:-.6),0,0); prCyl(t,mR,.007,.007,.3,4,0,.15,0); }
  for(let i=0;i<4;i++) prCyl(g,mR,.007,.007,1.7,4,.1+i*.05,.008,.12+i*.07,0,.15-i*.08,Math.PI/2);
  prBox(g,prM('cement'),.4,.14,.6,.6,.07,-.22,0,.25,0,{tw:.9,td:.9});
  for(const [x,z,s] of [[-.1,.25,1],[.3,.4,.7],[-.25,.05,.8]]) prBox(g,mC,.14*s,.08*s,.1*s,x,.04*s,z,.2,x*3,.1);
  S.solids.push([cx-.21,cz-.21,cx+.21,cz+.21,0,1.05],[.4,-.52,.8,.08,0,.14]); };
/* plastic sheeting stapled to a batten at the ceiling, creased, dusty, a prHandprint, torn ragged at the bottom */
PROP_B.sheeting=(g,o,S)=>{ const W=o.len||PROP_DIMS.sheeting.w,H=(o.h||RH)-.02;
  prBox(g,prM('batten'),W,.04,.025,0,H-.02,0);
  mk(prPleat(W,H-.15,Math.max(4,Math.round(W/.4)),.05,{seed:o.seed||11,rag:.18,sway:.05}),prM('plastic',{cut:true,double:true}),g,0,H-.04,.02);
  S.sight.push([-W/2,-.06,W/2,.08,.15,H]); };
/* the chained exit: a steel stairwell door in its frame, wired-glass panel, push bar, a red standpipe beside it, and a heavy chain
   wrapped round the bar and the pipe, padlocked. Local z = 0 is the wall line (Ray's side is +z, the door swings away into the
   stairwell). S.door: the leaf's hinge node. S.open(a): swing it (radians). S.cut(): the chain drops (cut ends hanging, the rest
   in a heap with the padlock). S.pts.cutAt: where a bolt cutter has to close on the chain; S.pts.lock: the padlock (keys) */
PROP_B.exitchain=(g,o,S)=>{ const RHh=o.h||RH,mF=prM('exitFrame'),mD=prM('exitDoor'),mS=prM('steelDark'),mL=prM('chainSteel');
  for(const sx of [-1,1]) prBox(g,mF,.07,2.1,.16,sx*.495,1.05,0); prBox(g,mF,1.06,.07,.16,0,2.065,0);
  for(const sx of [-1,1]) prBox(g,mF,.05,2.12,.015,sx*.52,1.06,.087); prBox(g,mF,1.09,.05,.015,0,2.11,.087);
  const door=N(g,-.46,0,0); door.live=true; S.door=door;
  prCB(door,prF6(mF,mF,mF,mF,mD,mF),.92,2.03,.045,.46,1.015,-.0225,0,0,0,{cell:.7});
  prBox(door,mF,.27,.36,.008,.46,1.6,.004); mk(plane(.22,.3),prM('wireGlass'),door,.46,1.6,.0085);
  for(const x of [.16,.76]) prBox(door,mS,.06,.08,.06,x,1.0,.03); prCyl(door,prM('steel'),.016,.016,.58,6,.46,1.0,.052,0,0,Math.PI/2);
  const px=.63,pz=.13; prCyl(g,prM('redPipe'),.045,.045,RHh,8,px,RHh/2,pz); for(const y of [.35,2.2]) prBox(g,mS,.05,.03,.07,px,y,pz-.05);
  prCyl(g,prM('redPipe'),.035,.035,.07,6,px,1.35,pz+.06,Math.PI/2,0,0); mk(torus(.05,.007,3,8),mS,g,px,1.35,pz+.1);
  prBox(g,prF6(mS,mS,mS,mS,prM('exitSign',{unlit:true}),mS),.36,.13,.06,0,2.32,.11);
  /* the chain: over the bar near its latch end, across to the pipe and round it, back down to the lock */
  const bx0=.2,by=1.0,bzz=.052,lk=[.42,.84,.16];
  const on=N(g,0,0,0); on.live=true; S.chain=on;
  const path=[lk,[bx0+.02,.95,bzz+.05],[bx0,by+.035,bzz+.02],[bx0-.01,by,bzz-.035],[bx0+.02,by-.04,bzz+.01],[bx0+.1,by-.035,.1],[.46,by-.045,.15],[px-.07,by-.03,pz+.04],[px-.02,by-.02,pz-.065],[px+.06,by-.03,pz-.02],[px+.04,by-.05,pz+.07],[px-.04,by-.09,pz+.08],[.55,.9,.17],lk];
  mk(prChainGeo(path,.05,.02,.0048),mL,on);
  const lock=N(on,lk[0],lk[1]-.045,lk[2]); prBox(lock,prF6(prM('brass'),prM('brass'),prM('brass'),prM('brass'),prM('brass'),prM('brass')),.05,.055,.024,0,0,0); mk(torus(.016,.0045,3,6),prM('steel'),lock,0,.03,0);
  const off=N(g,0,0,0); off.vis=false; off.live=true; S.chainCut=off;
  mk(prChainGeo([[bx0,by-.03,bzz+.02],[bx0+.005,by-.2,bzz+.04]],.05,.02,.0048),mL,off); mk(prChainGeo([[px-.03,by-.04,pz+.07],[px-.02,by-.26,pz+.08]],.05,.02,.0048),mL,off);
  const r=rng(41); for(let i=0;i<9;i++){ const a=r()*6.28,rr=.04+r()*.08,c=[.42+Math.cos(a)*rr,.012+r()*.02,.32+Math.sin(a)*rr*.7]; mk(prChainGeo([c,v3.add(c,[Math.cos(a*3)*.05,.004,Math.sin(a*3)*.05])],.05,.02,.0048),mL,off); }
  const lk2=N(off,.36,.028,.4,Math.PI/2,.4,0); prBox(lk2,prM('brass'),.05,.055,.024); mk(torus(.016,.0045,3,6),prM('steel'),lk2,0,.03,0);
  S.open=a=>{ door.r[1]=a; };
  S.cut=()=>{ on.vis=false; off.vis=true; };
  S.solids.push([-.46,-.05,.46,.01,0,2.04,'door'],[-.53,-.08,-.46,.08,0,2.1,'wall'],[.46,-.08,.53,.08,0,2.1,'wall'],[px-.045,pz-.045,px+.045,pz+.045,0,RHh,'post']);
  S.pts={cutAt:[.46,by-.045,.15],lock:lk,bar:[.46,by,bzz]}; };

/* ---------- placing ---------- */
/* draw a prop and hand back what it needs from the floor, in world space */
function prop(kind,parent,x,z,yaw=0,opts={}){
  const B=PROP_B[kind]; if(!B){ console.warn('prop: no kind',kind); return {solids:[],hides:[],sight:[],kind,node:null,tris:0}; }
  const g=N(parent,x,0,z,0,yaw,0),S={solids:[],hides:[],sight:[],kind,node:g};
  B(g,opts||{},S); if(S.curtain&&opts&&opts.liveCurtain) S.curtain.live=true; /* G can sway it; otherwise the floor's merge bakes it in */
  const c=Math.cos(yaw),s=Math.sin(yaw),W=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
  const wb=b=>{ const P=[W(b[0],b[1]),W(b[2],b[1]),W(b[0],b[3]),W(b[2],b[3])]; return {x0:Math.min(...P.map(p=>p[0])),z0:Math.min(...P.map(p=>p[1])),x1:Math.max(...P.map(p=>p[0])),z1:Math.max(...P.map(p=>p[1])),y0:b[4],h:b[5],kind:b[6]||'furn'}; };
  S.solids=S.solids.map(wb); S.sight=S.sight.map(wb);
  S.hides=S.hides.map(hd=>{ const p=W(hd.x,hd.z); return Object.assign({},hd,{x:p[0],z:p[1],yaw:yaw+(hd.yaw||0)}); });
  if(S.pts) for(const k in S.pts){ const q=S.pts[k],p=W(q[0],q[2]); S.pts[k]=[p[0],q[1],p[1]]; }
  if(S.sink){ const p=W(S.sink[0],S.sink[1]); S.sink=p; if(typeof SINKS!=='undefined'){ SINKS.push({x:p[0],z:p[1]}); if(SINKS.length>80) SINKS.shift(); } } /* a head can go under in it (63-grapple.js) */
  S.tris=propTris(g); return S; }
/* prop() and register it: collision boxes, sight-only boxes (only once G's flag exists, or they'd stop bodies), hiding spots */
let PROP_N=0;
function propPlace(kind,parent,x,z,yaw=0,opts={}){ const S=prop(kind,parent,x,z,yaw,opts); S.boxes=[];
  for(const b of S.solids){ const k=b.kind==='door'?'furn':b.kind; const bb=addBox(b.x0,b.x1,b.z0,b.z1,b.y0,b.h,k); if(b.kind==='door') bb.door=true; S.boxes.push(bb); }
  if(typeof addSheet==='function') for(const b of S.sight){ const bb=addBox(b.x0,b.x1,b.z0,b.z1,b.y0,b.h,'sheet'); bb.sightOnly=true; S.boxes.push(bb); }
  if(typeof addHideSpot==='function') for(const hd of S.hides) addHideSpot(Object.assign({id:kind+'-'+(++PROP_N)},hd));
  if(typeof boxGridDirty!=='undefined') boxGridDirty=true; return S; }

/* ---------- things to pick up ----------
   Item space (the space each build function draws in, before the hand turns it):
     +z runs from the grip along the handle to the head or tip; the grip (WPN[k].grip) is the point that sits in the fist's centre.
     -y is the striking side: a blade's edge, a hammer's face, the side that faces your knuckles in a normal grip (VR melee turns
        the item so +z comes out over your thumb and -y points where your knuckles point).
     +-x are the flats. A pan's cooking face is +x, so a dropped pan lies face up.
     Every item is built so that lying on its side (+x up, which is how updatePickups rests anything) its lowest point is 4 cm
     below its origin: updatePickups rests the origin 4 cm above the surface, so it then sits on it instead of floating.
   strike: [{a, b, r, kind, n}] capsules in item space, metres. a, b the ends, r the radius. kind 'edge' | 'point' | 'blunt'.
     n: for 'edge' the direction the edge faces; for 'blunt' the striking face's normal; for 'point' the thrust direction.
   mass: kg. Tools (tool:) are held in the fist as it is (fwd), and hit like a fist (a ball at the grip). */
function pPan(g){ const b=-.04;   /* a cast-iron skillet, 25 cm, its handle angled up a touch */
  const n=N(g,b,0,.217,0,0,-Math.PI/2);
  mk(prLathe([[0,0,0],[0,.1,.14],[.006,.108,.22],[.04,.122,.4],[.046,.12,.47],[.043,.113,.53],[.011,.1,.7],[.009,.04,.88],[.009,0,1]],10),prM('iron'),n);
  const hn=N(g,-.003,0,.095,0,-.12,0); mk(box(.016,.17,.026,{tw:.75,td:.8}),prM('ironHandle'),hn,0,0,-.085,-Math.PI/2,0,0);
  prBox(g,prM('iron'),.012,.034,.03,b+.04,0,.217+.13); return g; }
function pHammer(g){ const o=-.024,hz=.215,mH=prM('hamHead');   /* claw hammer, 33 cm: hickory handle, forged head, the face toward -y */
  mk(box(.022,.34,.032,{tw:.82,td:.72}),prM('hickory'),g,o,0,.035,Math.PI/2,0,0); prBox(g,prM('hickory'),.025,.03,.028,o,0,-.13);
  prBox(g,mH,.026,.036,.034,o,0,hz);
  prCyl(g,[mH,mH,prM('hamFace')],.0135,.016,.026,8,o,-.031,hz); prCyl(g,[mH,mH,prM('hamFace')],.0165,.0165,.012,8,o,-.05,hz);
  prBox(g,mH,.02,.032,.026,o,.031,hz-.004,-.3,0,0,{tw:.8,td:.8});
  for(const s of [-1,1]) prBox(g,mH,.008,.042,.014,o+s*.0055,.058,hz-.018,-.75,0,0,{tw:.5,td:.5}); return g; }
function pPipe(g){ const o=-.019,L=.6,z0=-.07;   /* 60 cm of 1-inch galvanised pipe, tape round the grip end, a coupling still on the far end */
  prCyl(g,[prM('pipeSteel'),prM('pipeEnd'),prM('pipeEnd')],.0167,.0167,L,8,o,0,z0+L/2,Math.PI/2,0,0);
  prCyl(g,[prM('pipeCoup'),prM('pipeEnd'),prM('pipeEnd')],.021,.021,.05,8,o,0,z0+L-.02,Math.PI/2,0,0); return g; }
function pCutter(g){ const o=-.024,mT=prM('tool');   /* 24-inch bolt cutter: red handles with rubber grips, compound head, short jaws */
  for(const s of [-1,1]){ const n=N(g,o,s*.03,-.04,s*.05,0,0); prBox(n,prM('cutRed'),.016,.016,.44,0,0,.22); prBox(n,prM('rubber'),.026,.028,.15,0,0,.075,0,0,0); }
  for(const s of [-1,1]) prBox(g,mT,.007,.075,.15,o+s*.014,0,.47);
  prBox(g,mT,.02,.05,.1,o,0,.46); for(const z of [.42,.5]) prCyl(g,prM('steel'),.009,.009,.036,6,o,0,z,0,0,Math.PI/2);
  for(const s of [-1,1]) mk(box(.022,.08,.022,{tw:.85,td:.6}),prM('jaw'),g,o,s*.011,.575,Math.PI/2,0,0); return g; }
function pKeys(g){ const o=-.037,mC=prM('chrome');   /* Mario's keyring: a leather fob in the fist, a short chain, a split ring, four keys */
  prBox(g,prM('leather'),.006,.055,.016,o,-.005,0);
  for(let i=0;i<2;i++) mk(torus(.0045,.0013,3,5),mC,g,o,.03+i*.0085,.002,0,i?Math.PI/2:0,0);
  mk(torus(.014,.0022,3,8),mC,g,o,.056,.004,0,Math.PI/2,0);
  [[-1.75,'keyB',.045],[-1.4,'keyS',.05],[-1.05,'keyS',.042],[-.75,'keyB',.036]].forEach(([a,k,l],i)=>{ const n=N(g,o+(i-1.5)*.0006,.044,.012,a,0,0);
    prBox(n,prM(k),.0026,.022,.02,0,-.011,0); prBox(n,prM(k),.0022,l-.018,.008,0,-.022-(l-.018)/2,-.004); });
  return g; }
function pMedkit(g){ const s=prM('tinSide');   /* a battered first-aid tin: white enamel, red cross on the lid */
  prBox(g,s,.04,.13,.19,-.02,0,.07); prBox(g,prF6(prM('tinLid'),s,s,s,s,s),.018,.134,.194,.009,0,.07);
  prCyl(g,prM('steel'),.004,.004,.18,6,.0,-.067,.07,Math.PI/2,0,0); prBox(g,prM('steel'),.01,.012,.02,.006,.068,.07); return g; }
function pRounds(g){ const x=-.022;   /* a few loose 9 mm rounds in a knotted sandwich bag */
  const n=N(g,x,0,0); n.s=[.55,1,1]; mk(prLathe([[-.04,0,0],[-.036,.02,.15],[-.015,.032,.4],[.012,.03,.62],[.03,.015,.8],[.038,.006,.88],[.05,.007,.95],[.056,0,1]],6),prM('bag',{cut:true,double:true}),n);
  for(const [px,py,pz,rx,rz] of [[x-.002,-.022,-.008,.3,1.4],[x+.002,-.01,.012,-.2,.2],[x-.003,.002,-.004,1.3,-.5],[x+.002,-.03,.012,0,-1.1]]){ const r=N(g,px,py,pz,rx,0,rz); prCyl(r,prM('brassCase'),.0049,.0049,.019,5); prCyl(r,prM('copper'),.0018,.0046,.011,5,0,.015,0); }
  return g; }
function pRoundBox(g){ const x=-.021,s=prM('ammoSide');   /* a box of 9 mm, end flap torn open, noses showing */
  prBox(g,prF6(prM('ammoBox'),s,s,s,prC(0x1a1814),s),.038,.065,.11,x,0,0); prBox(g,s,.036,.002,.03,x,.04,.068,-1.1,0,0);
  for(let i=0;i<3;i++) prCyl(g,prM('copper'),.0018,.0046,.011,5,x,(i-1)*.016,.058,Math.PI/2,0,0); return g; }
function pStrip(g){   /* a strip torn off a sheet: bunched in the fist, the rest hanging */
  prBox(g,prM('strip'),.03,.035,.04,-.02,0,0,.3,.2,0,{tw:.8,td:.85}); mk(prStripGeo(.42,.065,7,3),prM('strip',{double:true,cut:true}),g,-.02,-.015,0); return g; }
/* kitchen knife, 29 cm: riveted dark handle, steel bolster, the blade a wedge (thick spine, thin edge) whose edge sweeps up to the
   tip, a bright bevel along the edge. Same anchors as pKnife (grip at the origin, tip at z .23, edge toward -y) */
function pKitchenKnife(g){ prBox(g,prF6(prM('kHandle'),prM('kHandle'),prM('darkWood'),prM('darkWood'),prM('darkWood'),prM('darkWood')),.021,.026,.112,0,-.002,-.002); prBox(g,prM('steel'),.023,.03,.009,0,-.002,.058);
  const k=new Geo(),St=[[.062,.012,-.022],[.1,.0115,-.022],[.15,.0105,-.0205],[.19,.0085,-.016],[.215,.005,-.009],[.232,.0005,-.0012]];
  St.forEach(([z,ys,ye],i)=>{ const u=i/(St.length-1),ts=.0016*(1-u*.7); for(const [x,y,v] of [[ts,ys,1],[ts*.25,ye+.004,.18],[0,ye,0],[-ts*.25,ye+.004,.18],[-ts,ys,1]]) k.v([x,y,z],[0,0,0],[u,v]); });
  for(let i=0;i<St.length-1;i++){ const a=i*5,b=a+5; for(const [p,q] of [[0,1],[1,2],[2,3],[3,4],[4,0]]) k.I.push(a+p,b+p,b+q,a+p,b+q,a+q); }
  k.I.push(0,1,2,0,2,3,0,3,4); flatNormals(k); k.groups.push({start:0,count:k.I.length,mi:0}); mk(k,prM('kBlade'),g,0,0,0); return g; }
PR_TX.kHandle=()=>prSurf(32,8,1940,'#2e1e14','woodx',{fn:I=>{ for(const x of [6,16,26]){ softEll(I,x,4,1.3,1.3,'#b89a5a',.95,.3); put(I,x-.5,3.5,[1,1,1],.3); } }});
PR_TX.kBlade=()=>prSurf(32,16,1941,'#9ca2a6','steel',{rim:0,low:0,vl:0,fn:(I,r)=>{ for(let x=0;x<32;x++){ for(let y=0;y<4;y++) mul(I,x,y,.72); for(let y=12;y<16;y++) put(I,x,y,F3('#e2e6e8'),.7); }
  for(let i=0;i<6;i++) softEll(I,r()*30,4+r()*8,1.2,.8,'#5a3a22',.5,.5); blob(I,24,10,3,2,.5,'#4a0808'); }});
if(PROTO.on||PROPS_DEV) WPN.knife.build=pKitchenKnife;
const PR_FIST=(p,r=.05)=>[{a:p.slice(),b:p.slice(),r,kind:'blunt'}];
Object.assign(WPN,{
  pan:    {label:'Frying pan',build:pPan,grip:[0,0,-.02],melee:'blunt',reach:1.3,pts:[[-.02,0,.3],[-.02,0,.18]],speed:1.6,mass:1.2,
           strike:[{a:[-.02,0,.16],b:[-.02,0,.28],r:.11,kind:'blunt',n:[1,0,0]}]},
  hammer: {label:'Claw hammer',build:pHammer,grip:[-.024,0,-.07],melee:'blunt',reach:1.2,pts:[[-.024,-.055,.215],[-.024,0,.16]],speed:1.5,mass:.6,
           strike:[{a:[-.024,-.04,.215],b:[-.024,-.058,.215],r:.018,kind:'blunt',n:[0,-1,0]},{a:[-.024,.035,.205],b:[-.024,.075,.185],r:.01,kind:'point',n:[0,.9,-.44]}]},
  pipe:   {label:'Steel pipe',build:pPipe,grip:[-.019,0,0],fore:[-.019,0,.22],slideGrip:true,heavy:true,melee:'blunt',reach:1.5,pts:[[-.019,0,.53],[-.019,0,.38],[-.019,0,.24]],speed:1.7,mass:1.5,
           strike:[{a:[-.019,0,.12],b:[-.019,0,.55],r:.022,kind:'blunt'}]},
  cutter: {label:'Bolt cutter',build:pCutter,grip:[-.024,0,.05],fore:[-.024,0,.26],slideGrip:true,heavy:true,melee:'blunt',reach:1.5,pts:[[-.024,0,.58],[-.024,0,.45]],speed:1.8,mass:2.6,tool:'cutter',jaw:[-.024,0,.615],
           strike:[{a:[-.024,0,.4],b:[-.024,0,.6],r:.04,kind:'blunt'}]},
  keys:   {label:'Keyring',build:pKeys,grip:[-.037,0,0],fwd:true,melee:'blunt',reach:1.05,pts:[[-.037,0,0]],speed:1.5,mass:.12,tool:'keys',strike:PR_FIST([-.037,0,0])},
  medkit: {label:'First-aid tin',build:pMedkit,grip:[-.011,0,.005],fwd:true,melee:'blunt',reach:1.1,pts:[[-.011,0,.15]],speed:1.5,mass:.5,tool:'medkit',heal:25,
           strike:[{a:[-.011,-.06,.155],b:[-.011,.06,.155],r:.03,kind:'blunt'}]},
  rounds: {label:'9mm rounds',build:pRounds,grip:[-.022,0,0],fwd:true,melee:'blunt',reach:1.05,pts:[[-.022,0,0]],speed:1.5,mass:.08,tool:'rounds',count:5,strike:PR_FIST([-.022,0,0])},
  roundbox:{label:'Box of 9mm',build:pRoundBox,grip:[-.021,0,-.01],fwd:true,melee:'blunt',reach:1.05,pts:[[-.021,0,0]],speed:1.5,mass:.3,tool:'rounds',count:20,strike:PR_FIST([-.021,0,-.01])},
  strip:  {label:'Cloth strip',build:pStrip,grip:[-.02,0,0],fwd:true,melee:'blunt',reach:1.05,pts:[[-.02,0,0]],speed:1.5,mass:.03,tool:'strip',strike:PR_FIST([-.02,0,0])}
});
if(typeof PICK_NAMES!=='undefined') Object.assign(PICK_NAMES,{pan:'Frying pan',hammer:'Claw hammer',pipe:'Steel pipe',cutter:'Bolt cutter',keys:'Keyring',medkit:'First-aid tin',rounds:'9mm rounds',roundbox:'Box of 9mm',strip:'Cloth strip'});
/* a new rounds item carrying `count` (A reads item.count); a bag for a handful, a box for more */
function newRounds(count){ const it=newItem(count>8?'roundbox':'rounds'); it.count=count; return it; }
/* the matrix for an item lying at rest on a surface at height y (what updatePickups would settle it to) */
function propItemM(x,y,z,yaw=0){ return m4.compose(m4.make(),[x,y+.04,z],[0,yaw,Math.PI/2],[1,1,1]); }

/* ---------- ?propsdev=1: every prop and item in one dark room, one bare bulb, for review ---------- */
const PDEV={root:null,list:[],items:[],bulb:null,live:[]};
function propsDevLight(x,z,y=2.3,k=1){ if(PDEV.bulb) PDEV.bulb.p=[x,y,z];
  const pl=[[[x,y-.06,z],[1.5*k,1.06*k,.64*k],6.5],[[x,1.7,z+4],[.12,.12,.14],10]];
  FLOOR.lights=pl; setLights({amb:[.05,.049,.055],dir:[.3,1,.4],dirCol:[.02,.02,.024],fog:[.012,.012,.016],fogNear:7,fogFar:22,pl:[...pl,[[0,-50,0],[0,0,0],1]]}); }
function propsDevBuild(){
  if(!PDEV.root||!inWorld(PDEV.root)){
    floorN.vis=false; BOXES.length=0; boxGridDirty=true; PDEV.list=[]; PDEV.live=[];
    const G=PDEV.root=N(world); GEO_TEMP=false;
    const zA=-5.6,zB=-.9,x0=-12.4,x1=9.6;
    mk(plane(x1-x0,11.4,22,12),M(tLinoStain,{repeat:[(x1-x0)/1.6,11.4/1.6]}),G,(x0+x1)/2,.002,0,-Math.PI/2);
    mk(plane(x1-x0,11.4,11,6),M(tConcrete,{repeat:[(x1-x0)/2,5.7],color:0x6a6866}),G,(x0+x1)/2,RH,0,Math.PI/2);
    const wall=(z,face)=>{ mk(plane(x1-x0,RH,Math.ceil((x1-x0)/.6),4),M(TW_PAPER.peel,{repeat:[(x1-x0)/1.2,1]}),G,(x0+x1)/2,RH/2,z,0,face>0?0:Math.PI,0); };
    wall(zA,1); wall(zB,1); wall(zB-.12,-1);
    const add=(kind,x,z,yaw=0,o={})=>{ const S=propPlace(kind,G,x,z,yaw,o); PDEV.list.push({kind,x,z,yaw,h:PROP_DIMS[kind].h,d:PROP_DIMS[kind].d,tris:S.tris,S}); if(S.tick) PDEV.live.push(S); return S; };
    let x=x0+.4;
    for(const [k,o,back] of [['exitchain',{},.07],['wardrobe',{}],['closet',{},.405],['kitchen',{len:2.2}],['fridge',{}],['shelf',{}],['mattresses',{}],['tub',{}],['pipeburst',{}]]){ const D=PROP_DIMS[k],w=o.len||D.w; x+=w/2; add(k,x,zA+(back??D.d/2),0,o); x+=w/2+.75; }
    x=x0+.4;
    for(const [k,o,dz] of [['bed',{},0],['sofa',{hideBehind:true},.6],['tv',{},.05],['table',{},.9],['cardtable',{},.9],['laundry',{len:2.6},1.3],['sheeting',{len:2.0},.9],['rebar',{},0]]){ const D=PROP_DIMS[k],w=o.len||D.w; x+=w/2+(k==='table'||k==='cardtable'?.35:0);
      const S=add(k,x,zB+D.d/2+dz,0,o);
      if(k==='table'){ add('chair',x-.75,zB+D.d/2+dz,Math.PI/2); add('chair',x+.1,zB+D.d/2+dz+.62,Math.PI); }
      if(k==='cardtable') add('chair',x+.72,zB+D.d/2+dz,-Math.PI/2);
      x+=w/2+.8+(k==='table'||k==='cardtable'?.35:0); }
    const bn=PDEV.bulb=N(G,0,2.3,0); mk(cyl(.004,.004,RH-2.35,3,{at:[0,(RH-2.35)/2+.05,0]}),mBlack,bn); mk(box(.06,.09,.06),M(tBulb,{unlit:true}),bn); bn.live=true;
    meshMerge(G,{tile:7}); }
  /* the items, on the floor in a row (they go every reset) */
  PDEV.items=[]; let ix=-3.3;
  for(const [k,len] of [['pan',.42],['hammer',.36],['pipe',.62],['cutter',.66],['knife',.3],['machete',.5]]){ ix+=len/2; addPickup(newItem(k),propItemM(ix,0,2.0,Math.PI/2),[0,0,0],[0,0,0]); PDEV.items.push({key:k,x:ix,z:2.0}); ix+=len/2+.14; }
  ['keys','medkit','rounds','roundbox','strip','bottle'].forEach((k,i)=>{ const x=-2.6+i*.32; addPickup(newItem(k),propItemM(x,0,2.6,0),[0,0,0],[0,0,0]); PDEV.items.push({key:k,x,z:2.6}); });
  const tb=PDEV.list.find(p=>p.kind==='table'); if(tb) addPickup(newItem('cutter'),propItemM(tb.x+.05,tb.S.top,tb.z,.4),[0,0,0],[0,0,0]);
  const sh=PDEV.list.find(p=>p.kind==='shelf'); if(sh) addPickup(newItem('pipe'),propItemM(sh.x+.02,sh.S.free.y,sh.z,Math.PI/2+.1),[0,0,0],[0,0,0]);
  clearEnemies(); Object.assign(FLOOR,{mode:'propsdev',flick:null,anim:[],stairUp:null,convos:[],start:{x:-3.0,z:3.6,yaw:0}});
  PL.x=0; PL.z=3.4; PL.yaw=0; PL.pitch=-.35; propsDevLight(0,2.6); }
/* look at prop i (or an item, or a point) from `dist` m in front of it, the bulb hung over it */
function propsDevView(i,dist=1.8,o={}){ const p=typeof i==='number'?PDEV.list[i]:i,c=Math.cos(p.yaw||0),s=Math.sin(p.yaw||0),fz=o.fz??(p.d||0)/2,ex=p.x+s*(fz+dist)+(o.dx||0),ez=p.z+c*(fz+dist)+(o.dz||0),ty=o.ty??Math.min(1.1,(p.h||1)*.5);
  PL.x=ex; PL.z=ez; const e=[ex,1.62+(PL.y||0),ez],d=v3.sub([p.x+(o.tx||0),ty,p.z+(o.tz||0)],e),l=Math.hypot(...d); PL.yaw=Math.atan2(-d[0],-d[2]); PL.pitch=Math.asin(d[1]/l);
  propsDevLight(p.x+s*(fz+.45)+(o.lx||0),p.z+c*(fz+.45)+(o.lz||0),o.ly??2.3,o.lk??1); }
if(PROPS_DEV){ protoOn('reset',propsDevBuild); protoOn('tick',()=>{ for(const S of PDEV.live) S.tick(GAME.t); });
  window.__props={PDEV,view:propsDevView,light:propsDevLight,prop,PROP_DIMS,itemTris:()=>{ const o={}; for(const k of ['pan','hammer','pipe','cutter','keys','medkit','rounds','roundbox','strip','knife','bottle','machete']){ const n=N(null); WPN[k].build(n); o[k]=propTris(n); } return o; }}; }
