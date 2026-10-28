
/* =====================================================================================================
   WHAT THE WIDTH IS FOR. At 8.8 m inside, every car gets a set piece down the middle that turns it into
   a room you fight in: lanes to flank down, cover at waist height, a chokepoint, a perch, places to hide.
   Built in final (widened) coordinates, so nothing here moves.
   ===================================================================================================== */
const PLAY={
  cab:'The last room. The flight deck is a horseshoe you fight round; behind the bulkhead a waist-high spine of traction cabinets splits the crew mess into two lanes, with lockers and bunks to hide in.',
  casino:'A maze of machines. Slots line both walls and a back-to-back island splits the floor, so there is always a lane to flank down; the craps and roulette tables are waist-high cover and the King\'s stage looks down the whole car.',
  pool:'Open ground. The pool is a 14 m moat down the middle: wade it slowly or go round. The lifeguard chair is a perch, the hot tub and the bar are the only hard cover.',
  pub:'A brawler\'s room. A long bar to vault and fight behind, booths to pin people in, high tables and stools to throw, and an etched-glass snug screen at the front to break line of sight.',
  trattoria:'Lunch service. Nonna\'s long Sunday table runs down the middle as cover, family tables line both walls, and the kitchen end is a dead end with an oven in it.',
  banya:'Two climates. The sauna end is close quarters round tiered benches and a cold plunge tub, half hidden in steam; through the one door, the ice bar end is bright and open.',
  dimsum:'One way through. Tables fill both sides, the trolleys run the middle lane, and a lacquered moon gate is the only doorway into the half of the car where Lau waits.',
  capsule:'The stealth car. Two storeys of pods line both walls and a pod island runs down the middle, leaving two dim corridors: every pod is a place to hide, or a place for someone to be waiting.',
  aquarium:'Glass everywhere. Column tanks and a long reef tank break the room up; velvet booths along both walls face the middle.',
  baggage:'Where you wake up, and the tutorial. Crates, a luggage cage and a pile of mail sacks make a small maze to learn sneaking and grabbing in before the first fight.'};
for(const W of WAGONS) W.play=PLAY[W.key];

/* 01 · cab: a spine of traction cabinets down the crew mess, cable trays overhead */
(function(){ const g=WG.cab.g, cab=C('#c8ccd2'), dark=C('#2a2e36');
  const rack=M(P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#d8dcde'],[1,'#b8bcc0']]); R(g,'#8a8e94',0,0,1,h); for(let y=4;y<h-4;y+=4){ R(g,'#2a2e36',3,y,10,2); R(g,(y/4)%3?'#7cf06a':'#f5c542',4,y,1,1); } },4,301));
  for(const [x0,x1] of [[-12.6,-9.4],[-7.6,-4.6]]){ B(g,F(cab,rack,rack),(x0+x1)/2,0,0,x1-x0,1.25,1.0); B(g,dark,(x0+x1)/2,1.25,0,x1-x0+.06,.05,1.06); }
  for(const s of [-1,1]) B(g,dark,-5,WH-.25,s*1.4,18,.08,.4);
})();

/* 02 · casino: a craps table and a back-to-back island of slots */
(function(){ const g=WG.casino.g, wood=M(woodT('#3a1e14','#24120c',314,true)), felt=M(fabT('#1f6a3a',315)), gold=C('#d4ad5a');
  B(g,wood,-8.5,0,1.7,3.0,.9,1.5); B(g,felt,-8.5,.9,1.7,2.7,.03,1.2); for(const s of [-1,1]) B(g,gold,-8.5,.93,1.7+s*.64,3,.05,.06);
  for(const [dx,dz] of [[-.4,.1],[-.25,-.05]]) B(g,C('#f2ece0'),-8.5+dx,.93,1.7+dz,.08,.08,.08,.4);
  const scr=(seed)=>M(P2(16,24,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#2a1a4a'],[1,'#120a22']]); const r=rng(seed); for(let k=0;k<3;k++){ R(g,'#f2ece0',1+k*5,6,4,8); text(g,r()<.5?'7':'0',2+k*5,7,['#f5c542','#d63a2c','#29e0e6'][k],1); } R(g,'#ff3fa4',0,0,w,3); R(g,'#f5c542',2,18,12,2); }),{unlit:true});
  for(let i=0;i<4;i++) for(const s of [-1,1]){ const n=N(g,.6+i*1.9,0,1.9+s*.32,0,s>0?0:Math.PI,0);
    B(n,C(['#2a2a5a','#5a1a3a','#1a4a5a'][(i+s+2)%3]),0,0,0,.8,1.2,.62); mk(wplane(.6,.7),scr(400+i*3+s),n,0,1.55,.32); B(n,C('#2a2a30'),0,1.2,0,.8,.72,.58); B(n,G('#f5c542'),0,1.92,.05,.82,.12,.66); }
  B(g,gold,3.45,1.95,1.9,7.7,.06,.06);
  WG.casino.spots.king_c={x:-1.2,z:1.9,ry:-Math.PI/2};
})();

/* 03 · pool: a hot tub, a lifeguard chair to perch on, a flamingo in the pool */
(function(){ const g=WG.pool.g, white=C('#f4f2ec'), wood=M(woodT('#c8a070','#a88050',321));
  mk(cyl(1.3,1.3,.75,16),wood,g,-9.5,.375,0); mk(cyl(1.15,1.15,.02,16),U('#5ae0f0'),g,-9.5,.66,0);
  for(let k=0;k<8;k++){ const b=mk(cyl(.05,.05,.02,6),U('#e8ffff'),g,-9.5,.68,0), a=k*.8, r0=.2+(k%4)*.22; WG.pool.anim.push(t=>{ b.p=[-9.5+Math.cos(a+t*.6)*r0,.68,Math.sin(a+t*.6)*r0]; }); }
  const lc=N(g,1.5,0,2.7,0,Math.PI,0); for(const [dx,dz] of [[-.4,-.35],[.4,-.35],[-.4,.35],[.4,.35]]) B(lc,white,dx,0,dz,.08,1.8,.08,0,dz*.25,-dx*.15);
  B(lc,C('#e0473a'),0,1.8,0,.9,.1,.7); B(lc,C('#e0473a'),0,1.9,-.33,.9,.7,.08); for(let k=0;k<4;k++) B(lc,white,0,.3+k*.4,.38,.8,.05,.06);
  mk(cyl(.025,.025,1.4,6),white,lc,.35,2.6,-.3); mk(lathe([[0,.9,.9],[.35,.05,.05]],10,{capB:false}),M(stripes('#e0473a','#f2ece0',2),{double:true}),lc,.35,3.25,-.3);
  const fl=N(g,3,.47,.4), pink=C('#ff7ab0'); mk(torus(.42,.16,8,14),pink,fl,0,0,0,Math.PI/2); mk(cyl(.07,.07,.7,8),pink,fl,.4,.35,0,0,0,-.2); B(fl,pink,.48,.66,0,.24,.14,.14); B(fl,C('#2a2a2e'),.62,.66,0,.08,.06,.06);
  WG.pool.anim.push(t=>{ fl.p[1]=.47+Math.sin(t*1.3)*.03; fl.r[1]=Math.sin(t*.2)*.6; });
})();

/* 04 · pub: high tables down the middle and an etched-glass snug screen at the front */
(function(){ const g=WG.pub.g, oak=M(woodT('#5a3420','#3a2014',341,true)), brass=C('#d4ad5a');
  for(const x of [-9,-5.5,-2]){ mk(cyl(.06,.06,1.0,6),brass,g,x,.5,.2); mk(cyl(.3,.3,.04,10),C('#2a1408'),g,x,.02,.2); mk(cyl(.45,.45,.05,12),oak,g,x,1.03,.2);
    for(const dz of [-.15,.18]) mk(cyl(.05,.045,.16,8),G('#d8a040'),g,x+dz,1.14,.2+dz*.6); }
  const glass=M(P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#e8d8a8'],[1,'#c8b078']]); g.strokeStyle='#f8f0d8'; for(let y=4;y<h;y+=8){ g.beginPath(); g.arc(8,y,4,0,Math.PI*2); g.stroke(); } R(g,'#5a3420',0,0,w,1); }),{emissive:0x2a2010});
  for(const [z0,z1] of [[-3.6,-.9],[.9,3.6]]){ const zc=(z0+z1)/2, wd=z1-z0; B(g,oak,8.6,0,zc,.12,1.0,wd); B(g,glass,8.6,1.0,zc,.05,.9,wd-.1); B(g,oak,8.6,1.9,zc,.14,.08,wd+.04); for(const z of [z0,z1]) B(g,oak,8.6,0,z,.14,1.98,.14); }
})();

/* 05 · trattoria: Nonna's long Sunday table down the middle */
(function(){ const g=WG.trattoria.g, check=M(P2(16,16,(g,w,h)=>{ for(let y=0;y<h;y+=4) for(let x=0;x<w;x+=4) R(g,((x+y)>>2)%2?'#f4efe6':'#c8302a',x,y,4,4); },4,351)), wood=M(woodT('#8a5a34','#6a4426',352));
  B(g,wood,-7,0,0,9,.72,1.1); B(g,check,-7,.72,0,9.2,.04,1.25); for(const s of [-1,1]) B(g,check,-7,.42,s*.63,9.2,.32,.02);
  for(const s of [-1,1]){ B(g,wood,-7,0,s*.98,8.6,.45,.38); }
  for(let k=0;k<8;k++) for(const s of [-1,1]){ const x=-10.6+k*1.05; mk(cyl(.17,.17,.02,12),C('#f8f6f0'),g,x,.765,s*.36); mk(cyl(.1,.1,.03,10),C(['#c8502a','#e8c460','#6a8a3a'][(k+s+2)%3]),g,x,.78,s*.36); }
  for(let k=0;k<4;k++){ const x=-10+k*2.1; mk(cyl(.05,.06,.3,8),C('#2a5a2a'),g,x,.9,0); B(g,C('#d8a868'),x+.9,.76,0,.5,.12,.2,.3); }
  for(let k=0;k<3;k++){ const x=-9+k*2.6; mk(cyl(.04,.04,.25,6),C('#f2ece0'),g,x,.88,0); B(g,U('#ffd890'),x,1.0,0,.025,.05,.025); }
})();

/* 06 · banya: a cold plunge tub in the sauna, an ice bear on the ice side */
(function(){ const g=WG.banya.g, wood=M(woodT('#a87a46','#8a5a30',361)), ice=U('#bfefff'), hoop=C('#3a2a1a');
  B(g,wood,-7.5,0,0,3.2,.95,1.8); mk(wplane(3.0,1.6),U('#7ad0f0'),g,-7.5,.88,0,-Math.PI/2); for(const dx of [-1.2,0,1.2]) B(g,hoop,-7.5+dx,.2,0,.06,.06,1.84); B(g,hoop,-7.5,.7,0,3.24,.06,1.84);
  for(let k=0;k<3;k++) B(g,wood,-5.75,.0+k*.3,0,.3,.06,.6);
  const bear=N(g,12.2,0,2.8,0,-.6,0); B(bear,ice,0,0,0,1.4,.5,1.0); B(bear,ice,0,.5,0,1.0,.8,.8); B(bear,ice,.55,.6,0,.5,.45,.6); B(bear,ice,.85,.75,0,.3,.22,.32); for(const s of [-1,1]) B(bear,ice,.5,1.0,s*.2,.1,.12,.1);
  for(const [dx,dz] of [[-.3,-.25],[-.3,.25],[.3,-.25],[.3,.25]]) B(bear,ice,dx,.5,dz,.22,.0001+.01,.22);
})();

/* 07 · dim sum: the moon gate, the only way through to the kitchen half */
(function(){ const g=WG.dimsum.g, lac=C('#a81c1c'), gold=C('#d4ad5a'), r=1.45, cy=1.45, X=-5;
  for(let y=0;y<WH-.001;y+=.1){ const dy=y+.05-cy, hw=Math.abs(dy)<r?Math.sqrt(r*r-dy*dy):0; for(const s of [-1,1]) if(WZ-hw>.01) B(g,lac,X,y,s*(hw+WZ)/2,.3,.1,WZ-hw); }
  for(let k=0;k<32;k++){ const a=k/32*Math.PI*2, y=cy+Math.sin(a)*r; if(y<.05) continue; B(g,gold,X,y-.05,Math.cos(a)*r,.34,.1,.3,0,-a); }
  for(const y of [.1,WH-.3]) B(g,gold,X,y,0,.34,.06,WZ*2);
  const plaque=M(textTex(32,12,'#121014',[['GOLDEN CRANE','c',3,'#d4ad5a']]),{unlit:true}); for(const s of [-1,1]) mk(wplane(1.6,.5),plaque,g,X+s*.16,cy+r+.4,0,0,s*Math.PI/2,0);
})();

/* 08 · capsule: a two-storey island of pods down the middle, two dim corridors either side */
(function(){ const g=WG.capsule.g, pod=C('#f4f4ee'), podIn=[U('#ffe8c0'),U('#c8e8ff'),U('#1a1a22')];
  for(const x0 of [-12.2,5.3]) for(let i=0;i<7;i++) for(let lv=0;lv<2;lv++) for(const s of [-1,1]){ const n=N(g,x0+i*1.15,lv*1.25,s*.64);
    B(n,pod,0,0,0,1.1,1.2,1.25); mk(wplane(.9,.85),podIn[(i+lv+(s>0?0:1))%3],n,0,.6,s*.63,0,s>0?0:Math.PI,0); B(n,C('#2a2a34'),0,.05,s*.63,.95,.06,.02); }
  for(const x0 of [-12.2,5.3]){ B(g,C('#c8ccd2'),x0+3.45,2.5,0,8.1,.06,1.3); for(const s of [-1,1]) for(let x=x0;x<x0+8;x+=2) B(g,U('#29e0e6'),x+.5,.005,s*2.2,1.2,.01,.04); }
  WG.capsule.spots.ren_c={x:-6,z:2.2,ry:-Math.PI/2}; WG.capsule.spots.ren_c2={x:7,z:-2.2,ry:Math.PI/2};
})();

/* 09 · aquarium: a long reef tank down the middle between the column tanks */
(function(){ const g=WG.aquarium.g, gold=C('#d4ad5a');
  const reef=M(P2(64,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3ad0e8'],[1,'#1a6a9a']]); const r=rng(391); for(let i=0;i<14;i++){ const x=r()*w|0, hh=3+(r()*7|0); R(g,['#ff6a8a','#ffb040','#c86aff','#5af0a0'][i%4],x,h-hh,2+(r()*3|0),hh); } for(let i=0;i<12;i++) R(g,rgba('#e8ffff',.6),r()*w|0,r()*h*.6|0,1,1); }),{unlit:true});
  B(g,C('#14203a'),0,0,0,6.8,.5,1.1); B(g,F(M(reef.tex,{unlit:true}),reef,reef),0,.5,0,6.6,.9,.95); B(g,gold,0,1.4,0,6.8,.05,1.1); B(g,gold,0,.48,0,6.86,.04,1.14);
  const fish=M(fishTex('gold'),{unlit:true,cut:true,double:true});
  for(let k=0;k<6;k++){ const s=k%2?1:-1, n=mk(plane(.5,.25),fish,g,0,0,0), ph=k*1.3; WG.aquarium.anim.push(t=>{ const u=((t*.15+k/6)%1)*2-1; n.p=[u*3.0*s,.75+(k%3)*.2+Math.sin(t+ph)*.04,s*.5]; n.r=[0,s>0?0:Math.PI,0]; }); }
})();

/* 10 · baggage: a luggage cage and a pile of mail sacks */
(function(){ const g=WG.baggage.g, steel=C('#8a8e94');
  const mesh=M(P2(16,16,(g,w,h)=>{ for(let k=0;k<w;k+=4){ R(g,'#9aa0a6',k,0,1,h); R(g,'#9aa0a6',0,k,w,1); } }),{cut:true,double:true});
  const cx=-9.5, cw=3, cd=2, ch=2.4;
  for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(g,steel,cx+dx*cw/2,0,dz*cd/2,.06,ch,.06);
  for(const s of [-1,1]){ mk(wplane(cw,ch,.5,.5),mesh,g,cx,ch/2,s*cd/2); mk(wplane(cd,ch,.5,.5),mesh,g,cx+s*cw/2,ch/2,0,0,Math.PI/2,0); }
  mk(wplane(cw,cd,.5,.5),mesh,g,cx,ch,0,-Math.PI/2);
  const r=rng(401); for(let k=0;k<7;k++){ const w=.5+r()*.4; B(g,C(['#2a4a8a','#8a2a1a','#c8a060','#3a3a3e','#6a3a8a'][k%5]),cx-1+(k%3)*.9,Math.floor(k/3)*.5,-.3+(k%2)*.6,w,.45,.6,r()*.4); }
  const sack=C('#c8b890'); for(let k=0;k<9;k++){ const x=8+(k%3)*.55-(k>5?-.2:0), z=-.4+((k*7)%3-1)*.5; mk(lathe([[0,.05,.05],[.12,.32,.26],[.45,.3,.24],[.6,.1,.08]],8),sack,g,x,(k>5?.45:0),z,0,k,Math.PI/2*((k%2)*.9)); }
})();
