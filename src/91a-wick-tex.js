/* =====================================================================
   WICK stage 1: the look. Textures and materials for the club ("cold, clean, expensive, dark"; neon on Bond luxury).
   Plan: project doc claude/prototype-plan.md, section 3. Everything is painted lazily on first use (wkT()), so the 15-floor
   game and the horror prototype never pay for it.
   Conventions:
   - Canvas row 0 is the TOP of the texture (glTex flips Y), so paint things the way they're seen.
   - Neon, backlit glass and the fish tank are unlit: their colour is their brightness.
   - Glows, floor reflections and anything soft-edged are cut-out textures with a 4x4 Bayer dither instead of alpha blending
     (the renderer has none), which suits the PS1 pass anyway.
   ===================================================================== */
const WK_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const wkDith=(x,y,a)=>a>(WK_BAYER[(y&3)*4+(x&3)]+.5)/16;
function wkImg(w,h,fn){ const I=Img(w,h); fn(I,w,h); return toTex(I); }
/* fn(x,y) -> [r,g,b,a] in 0..1; a is dithered to on/off */
function wkCut(w,h,fn){ return tex(w,h,null,g=>{ const id=g.createImageData(w,h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const c=fn(x,y),j=(y*w+x)*4; id.data[j]=c[0]*255; id.data[j+1]=c[1]*255; id.data[j+2]=c[2]*255; id.data[j+3]=wkDith(x,y,c[3])?255:0; }
  g.putImageData(id,0,0); }); }
const wkFill=(I,col)=>{ const c=F3(col); for(let i=0;i<I.d.length;i+=3){ I.d[i]=c[0]; I.d[i+1]=c[1]; I.d[i+2]=c[2]; } };
const wkNoise=(I,amt,seed,sc=.25)=>{ for(let y=0;y<I.h;y++) for(let x=0;x<I.w;x++) mul(I,x,y,1+amt*fbm(x*sc,y*sc,seed,3)); };
const wkGrain=(I,amt,seed)=>{ const r=rng(seed); for(let i=0;i<I.d.length;i+=3){ const n=(r()-.5)*amt; I.d[i]+=n; I.d[i+1]+=n; I.d[i+2]+=n; } };

/* the palette: one hot accent per room on a blue-black base (plan 3.3) */
const WKC={ magenta:[1,.18,.62], cyan:[.15,.85,1], red:[1,.1,.12], gold:[1,.72,.36], white:[.82,.9,1], amber:[1,.62,.22], blue:[.25,.45,1], green:[.3,1,.45],
  base:'#0c0e14', ink:'#07080c', walnut:'#6e4628', brass:0xc8a050 };

let WKT=null;
function wkT(){ if(WKT) return WKT; const T={};

  /* black marble: one 1.2 m slab per tile, cloudy, with pale veins and a hair of gold, a thin dark joint on two edges */
  /* the floor: polished concrete in 1.2 m bays, a soft mottle, a thin saw-cut joint */
  T.marble=wkImg(64,64,(I,w,h)=>{ wkFill(I,'#2c2e32'); for(let y=0;y<h;y++) for(let x=0;x<w;x++) mul(I,x,y,1+.16*fbm(x*.06,y*.06,71,4)+.05*fbm(x*.4,y*.4,72,2));
    softLine(I,0,0,64,0,'#0c0d0f',.8,1); softLine(I,0,0,0,64,'#0c0d0f',.8,1); wkGrain(I,.03,75); });
  /* board-formed concrete for the walls: the grain of the shuttering boards, tie holes */
  T.conc=wkImg(64,64,(I,w,h)=>{ wkFill(I,'#4a4c50'); const r=rng(77); for(let b=0;b<8;b++){ const k=.9+r()*.2; for(let y=b*8;y<b*8+8;y++) for(let x=0;x<w;x++) mul(I,x,y,k*(1+.07*fbm(x*.05,y*.9+b*7,78,2))); softLine(I,0,b*8,64,b*8,'#2c2e30',.5,.8); }
    for(const x of [16,48]) for(const y of [12,44]) softEll(I,x,y,1.3,1.3,'#26282a',.9,.5); wkNoise(I,.08,79,.08); wkGrain(I,.03,80); });

  /* walnut wainscot panel, 0.9 m wide x 1.05 m tall: a raised field in a frame, the grain running up */
  T.walnut=wkImg(48,56,(I,w,h)=>{ wkFill(I,WKC.walnut);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const g=Math.sin(x*.9+fbm(x*.08,y*.04,81,3)*5)*.5+.5; mul(I,x,y,.78+.32*g+.08*fbm(x*.3,y*.3,82,2)); }
    const fr=(x0,y0,ww,hh,lit,dark)=>{ softLine(I,x0,y0,x0+ww,y0,lit,.5,1); softLine(I,x0,y0,x0,y0+hh,lit,.4,1); softLine(I,x0,y0+hh,x0+ww,y0+hh,dark,.6,1); softLine(I,x0+ww,y0,x0+ww,y0+hh,dark,.55,1); };
    fr(1,1,w-2,h-2,'#7a5638','#120a05'); fr(6,7,w-12,h-14,'#120a05','#8a6444'); fr(8,9,w-16,h-18,'#6a4a30','#160c06');
    wkGrain(I,.03,83); });
  /* the wall above: deep navy silk with a faint gold damask, so the dark walls still read as expensive in the light */
  T.silk=wkImg(32,64,(I,w,h)=>{ wkFill(I,'#343e5e');
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ mul(I,x,y,.92+.1*Math.sin(x*1.9)); const u=(x/w)*2*Math.PI,v=(y/h)*2*Math.PI;
      const d=Math.sin(u)*Math.sin(v*2)+.6*Math.cos(u*2+v)*Math.sin(v); if(Math.abs(d-.55)<.09) put(I,x,y,[.5,.4,.22],.16); }
    wkGrain(I,.02,91); });
  T.ceil=wkImg(32,32,(I)=>{ wkFill(I,'#14161e'); wkNoise(I,.15,95,.15); wkGrain(I,.02,96); });

  /* back of house */
  T.tileW=wkImg(32,32,(I)=>{ wkFill(I,'#aeb4b6'); const r=rng(101);
    for(let ty=0;ty<4;ty++) for(let tx=0;tx<4;tx++){ const v=.94+r()*.08; softRect(I,tx*8+.6,ty*8+.6,6.8,6.8,v>1?'#dfe4e4':'#d6dcdc',1,.5); softLine(I,tx*8+1.5,ty*8+1.2,tx*8+6.5,ty*8+1.2,'#f4f8f8',.3,.8); }
    wkGrain(I,.02,102); });
  /* the kitchen's walls: dark glazed tile, a hard highlight along each top edge (cold tubes overhead) */
  T.tileD=wkImg(32,32,(I)=>{ wkFill(I,'#56605e'); const r=rng(105);
    for(let ty=0;ty<4;ty++) for(let tx=0;tx<4;tx++){ softRect(I,tx*8+.6,ty*8+.6,6.8,6.8,r()>.5?'#1c2c2a':'#182624',1,.5); softLine(I,tx*8+1.4,ty*8+1.3,tx*8+6.6,ty*8+1.3,'#9ab8b4',.55,.7); }
    wkGrain(I,.02,106); });
  T.tileK=wkImg(32,32,(I)=>{ wkFill(I,'#0a0a0c'); const r=rng(111);
    for(let ty=0;ty<2;ty++) for(let tx=0;tx<2;tx++){ softRect(I,tx*16+1,ty*16+1,14,14,r()>.5?'#1d1f24':'#191b20',1,.5); softLine(I,tx*16+2,ty*16+2,tx*16+14,ty*16+2,'#30333a',.4,.8); }
    for(let i=0;i<4;i++) blob(I,r()*32,r()*32,3,2,-.12); wkGrain(I,.03,112); });
  T.steel=wkImg(32,16,(I,w,h)=>{ wkFill(I,'#9aa1a6'); const r=rng(121); for(let y=0;y<h;y++){ const v=.92+r()*.14; for(let x=0;x<w;x++) mul(I,x,y,v); } wkGrain(I,.04,122); });
  T.paintBlock=wkImg(32,32,(I)=>{ wkFill(I,'#2a2f38'); for(let y=0;y<32;y+=8) softLine(I,0,y,32,y,'#14171c',.6,1); for(let y=0;y<32;y+=8) for(let x=(y/8)%2?0:8;x<32;x+=16) softLine(I,x,y,x,y+8,'#14171c',.5,1); wkNoise(I,.1,131,.2); wkGrain(I,.03,132); });

  /* upholstery */
  const tuft=(base,hi,seed)=>wkImg(32,32,(I)=>{ wkFill(I,base);
    for(let y=0;y<32;y++) for(let x=0;x<32;x++){ const a=(x+y)%16,b=(x-y+32)%16; const d=Math.min(Math.abs(a-8),Math.abs(b-8)); mul(I,x,y,.7+.045*d); }
    for(const [x,y] of [[0,0],[16,0],[8,8],[24,8],[0,16],[16,16],[8,24],[24,24],[32,0],[32,16],[0,32],[16,32],[32,32]]){ softEll(I,x,y,1.4,1.4,'#000000',.8,.5); softEll(I,x-.6,y-.6,.6,.6,hi,.5,.5); }
    wkGrain(I,.03,seed); });
  T.leatherBk=tuft('#1a1719','#6a6266',141); T.leatherRd=tuft('#4a0d14','#c0606a',142);
  T.velvet=wkImg(32,64,(I,w,h)=>{ wkFill(I,'#5e0a18'); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const s=Math.sin(x/w*Math.PI*6+fbm(x*.05,y*.03,151)*1.5); mul(I,x,y,.55+.45*(s*.5+.5)); } wkGrain(I,.02,152); });
  T.felt=wkImg(16,16,(I)=>{ wkFill(I,'#164a2c'); wkNoise(I,.12,161,.4); wkGrain(I,.04,162); });
  T.smoked=wkImg(16,16,(I)=>{ wkFill(I,'#151820'); for(let i=0;i<16;i++) softLine(I,i-4,0,i+4,16,'#3a4458',.08,1); });

  /* backlit bottle wall, one 2 m bay, three shelves: unlit, so this IS its brightness */
  T.bottles=wkImg(128,96,(I,w,h)=>{ for(let y=0;y<h;y++){ const t=y/h; const c=lerp3([.42,.2,.07],[.26,.12,.05],t); for(let x=0;x<w;x++){ const e=1-Math.abs(x/w-.5)*.6; put(I,x,y,[c[0]*e,c[1]*e,c[2]*e],1); } }
    const r=rng(171),GL=[['#c8761c','#ffd28a'],['#2a8a3c','#9af0a0'],['#d8eef4','#ffffff'],['#2850c0','#9ab8ff'],['#8a1c2c','#ff8a9a'],['#c8a050','#fff0b0']];
    for(const sy of [30,62,94]){ /* shelf top edge y; bottles stand on it */
      let x=2; while(x<w-4){ const bw=4+(r()*4|0),bh=14+(r()*12|0),gl=GL[r()*GL.length|0],nx=x+bw/2;
        softRect(I,x,sy-bh,bw,bh-5,gl[0],.92,.4); softRect(I,nx-1,sy-bh-6,2,7,gl[0],.9,.3); softRect(I,nx-1,sy-bh-8,2,2,'#1a1a1a',.9,.3);
        softLine(I,x+1,sy-bh+1,x+1,sy-6,gl[1],.6,.8); if(r()<.6) softRect(I,x+.5,sy-bh*.62,bw-1,bh*.25,r()<.5?'#f2ead6':'#1a1410',.75,.3);
        x+=bw+1+(r()*2|0); }
      softRect(I,0,sy-1,w,3,'#c8a050',1,.4); softLine(I,0,sy-1,w,sy-1,'#fff2c0',.7,.8); }
    wkGrain(I,.02,172); });
  /* the fish tank: deep water lit from above, caustics, a few slow fish, weed and sand */
  T.fish=wkImg(128,64,(I,w,h)=>{ for(let y=0;y<h;y++){ const t=y/h,c=lerp3([.2,.75,.86],[.02,.14,.26],Math.pow(t,.8)); for(let x=0;x<w;x++) put(I,x,y,c,1); }
    for(let y=0;y<20;y++) for(let x=0;x<w;x++){ const k=Math.abs(Math.sin(x*.21+Math.sin(y*.4+x*.05)*2)*Math.sin(y*.33+x*.07)); if(k>.9) put(I,x,y,[.7,.95,1],(k-.9)*4*(1-y/20)); }
    const r=rng(181); for(let x=0;x<w;x+=1){ const sh=4+fbm(x*.1,0,182,2)*2; softRect(I,x,h-sh,1,sh,'#b89a6a',.85,.3); }
    for(let i=0;i<9;i++){ const x=r()*w,hh=12+r()*22; for(let k=0;k<hh;k++) put(I,x+Math.sin(k*.35+i)*2,h-5-k,[.05,.32+r()*.1,.16],.85); }
    const FC=[['#ff7a1c','#ffd08a'],['#ffd21c','#fff4a0'],['#2a6aff','#9ac0ff'],['#e8e8e8','#ffffff'],['#ff3a5a','#ffb0c0']];
    for(let i=0;i<11;i++){ const x=4+r()*(w-12),y=12+r()*(h-28),c=FC[r()*FC.length|0],s=r()<.5?1:-1,L=3+r()*3;
      softEll(I,x,y,L,L*.42,c[0],1,.4); softEll(I,x-s*.6,y-.4,L*.4,L*.18,c[1],.6,.4); softLine(I,x-s*L,y,x-s*(L+2.2),y-1.4,c[0],.9,.8); softLine(I,x-s*L,y,x-s*(L+2.2),y+1.4,c[0],.9,.8); put(I,x+s*(L-1),y-.5,[0,0,0],1); }
    for(let i=0;i<14;i++){ const x=r()*w,y=r()*h*.8; softEll(I,x,y,.8,.8,'#d8f8ff',.6,.4); }
    wkGrain(I,.015,183); });

  /* the tank's reflection on the marble: the same picture, stippled, fading away from the wall (its bottom edge) */
  T.fishR=tex(128,64,null,g=>{ g.drawImage(T.fish.c,0,0); const d=g.getImageData(0,0,128,64); for(let y=0;y<64;y++) for(let x=0;x<128;x++){ const j=(y*128+x)*4,a=Math.pow((y+.5)/64,1.4)*.62; d.data[j]*=.8; d.data[j+1]*=.8; d.data[j+2]*=.8; d.data[j+3]=wkDith(x,y,a)?255:0; } g.putImageData(d,0,0); });
  T.bottlesR=tex(128,96,null,g=>{ g.drawImage(T.bottles.c,0,0); const d=g.getImageData(0,0,128,96); for(let y=0;y<96;y++) for(let x=0;x<128;x++){ const j=(y*128+x)*4,a=Math.pow((y+.5)/96,1.6)*.5; d.data[j+3]=wkDith(x,y,a)?255:0; } g.putImageData(d,0,0); });
  /* cut-outs */
  T.glow=wkCut(128,128,(x,y)=>{ const d=Math.hypot(x+.5-64,y+.5-64)/64; const a=Math.max(0,1-d); return [1,1,1,Math.pow(a,1.7)*.8]; });
  /* a halo along a tube: falls off across (v), tiles along (u) */
  T.glowLine=wkCut(16,32,(x,y)=>{ const d=Math.abs(y+.5-16)/16; return [1,1,1,Math.pow(Math.max(0,1-d),1.6)*.85]; });
  /* a light's reflection running across a glossy floor: bright at the near end (the bottom of the texture), fading away; tiles along u */
  T.streak=wkCut(16,64,(x,y)=>{ const v=1-(y+.5)/64; return [1,1,1,Math.pow(1-v,1.6)*.7]; });
  T.blood=wkCut(32,32,(x,y)=>{ const r=fbm(x*.25,y*.25,191,3); const d=Math.hypot((x-16)/13,(y-15)/11)+r*.45; const drip=Math.abs(x-11-(fbm(0,x,192)*3))<1.2&&y>20&&y<31?1:0;
    const a=d<1?1:drip; const c=d<.55?[.55,.02,.04]:[.4,.01,.03]; return [c[0],c[1],c[2],a]; });
  T.glass=wkCut(16,16,(x,y)=>{ const r=fbm(x*.6,y*.6,193,2); return [.85,.92,.95,r>.15?1:0]; });

  /* the club's sign over the bar: a neon script, its own dithered halo */
  T.sign=tex(256,64,null,g=>{ g.textAlign='center'; g.textBaseline='middle';
    g.font='italic 700 44px Georgia,"Times New Roman",serif'; g.shadowColor='#ff5a30'; g.shadowBlur=10; g.fillStyle='#ff6a48'; g.fillText('Velour',128,32); g.shadowBlur=0; g.fillStyle='#ffe0d0'; g.fillText('Velour',128,32);
    const d=g.getImageData(0,0,256,64); for(let y=0;y<64;y++) for(let x=0;x<256;x++){ const j=(y*256+x)*4,a=d.data[j+3]/255; d.data[j+3]=wkDith(x,y,a*1.25)?255:0; if(a>.01){ d.data[j]=Math.min(255,d.data[j]/a); d.data[j+1]=Math.min(255,d.data[j+1]/a); d.data[j+2]=Math.min(255,d.data[j+2]/a); } }
    g.putImageData(d,0,0); });
  return WKT=T; }

/* materials: one table, made once (shared materials merge into fewer draws) */
let WKM=null;
function wkM(){ if(WKM) return WKM; const T=wkT(),U=(c)=>M(null,{color:c,unlit:true});
  const rgb=a=>((Math.round(a[0]*255)<<16)|(Math.round(a[1]*255)<<8)|Math.round(a[2]*255));
  WKM={ marble:M(T.marble), walnut:M(T.walnut,{color:0x9a8a80}), silk:M(T.conc), conc:M(T.conc), ceil:M(T.ceil),
    tileW:M(T.tileW), tileD:M(T.tileD), tileK:M(T.tileK), steel:M(T.steel,{color:0xd8dee2}), block:M(T.paintBlock),
    leatherBk:M(T.leatherBk), leatherRd:M(T.leatherRd), velvet:M(T.velvet,{double:true}), felt:M(T.felt), smoked:M(T.smoked,{color:0x9aa4b8}),
    brass:M(null,{color:0x2c2e33}), brassDk:M(null,{color:0x1c1d21}), /* the trim is black steel now (the names stay) */ chrome:M(null,{color:0xd0d8e0,emissive:0x101418}),
    black:M(null,{color:0x0c0d10}), lacquer:M(null,{color:0x111216}), wood:M(T.walnut,{color:0xd8c8b8}), white:M(null,{color:0xe8eaec}),
    bottles:M(T.bottles,{unlit:true}), fish:M(T.fish,{unlit:true}), fishR:M(T.fishR,{unlit:true,cut:true}), bottlesR:M(T.bottlesR,{unlit:true,cut:true}), sign:M(T.sign,{unlit:true,cut:true,double:true}),
    neonM:U(rgb(WKC.magenta)), neonC:U(rgb(WKC.cyan)), neonR:U(rgb(WKC.red)), neonG:U(rgb(WKC.gold)), tube:U(0xe8f2ff), bulb:U(0xfff0d0), crystal:M(null,{color:0xf4f8ff,emissive:0x8a9098}),
    glow:c=>M(T.glow,{unlit:true,cut:true,double:true,color:rgb(c)}), glowBar:c=>M(T.glowLine,{unlit:true,cut:true,double:true,color:rgb(c)}),
    streak:c=>M(T.streak,{unlit:true,cut:true,color:rgb(c)}), blood:M(T.blood,{cut:true}), glass:M(T.glass,{cut:true,double:true,color:0xb8c8d0}), rgb };
  return WKM; }
