/* =====================================================================================================
   BETHNAL GREEN ROAD, 02:14. One corner of the street: the deck block's shops (the Golden Rooster, Bethnal
   Wines, a shuttered unit, the Hollis House door), a sodium lamp, the kerb and double yellows, terraces over
   the road and the railway arch at the end. Rain falls in sheets. Lighting is per vertex, so every surface a
   light lands on is cut into ~1 m cells.
   ===================================================================================================== */
const STREET=N(world);
const MC=new Map(); function MM(t,o={}){ const k=(t?(t.mmid||(t.mmid=MC.size+1)):0)+'|'+JSON.stringify(o); if(!MC.has(k)) MC.set(k,M(t,o)); return MC.get(k); }
function slab(w,d,t,x,y,z,o={}){ return mk(plane(w,d,Math.max(1,Math.ceil(w/(o.cell||1))),Math.max(1,Math.ceil(d/(o.cell||1)))),MM(t,{repeat:[w/(o.tile||1),d/(o.tileD||o.tile||1)],color:o.color??0xffffff,unlit:!!o.unlit}),o.parent||STREET,x,y,z,-Math.PI/2); }
function wallP(w,h,t,x,y,z,ry=0,o={}){ return mk(plane(w,h,Math.max(1,Math.ceil(w/(o.cell||1.2))),Math.max(1,Math.ceil(h/(o.cell||1.2)))),MM(t,{repeat:[w/(o.tile||1),h/(o.tileH||o.tile||1)],color:o.color??0xffffff,unlit:!!o.unlit,cut:!!o.cut,double:!!o.double,nofog:!!o.nofog}),o.parent||STREET,x,y,z,0,ry,0); }
function blk(w,h,d,m,x,y,z,parent=STREET){ return mk(box(w,h,d),m,parent,x,y,z); }

/* ---------- painted surfaces ---------- */
const tStock=P2(64,64,(g,w,h)=>{ R(g,'#3a342c',0,0,w,h); const r=rng(1401); for(let row=0;row<16;row++){ const off=(row%2)*8; for(let x=-16;x<w;x+=16){ const red=r()<.16; R(g,red?mix('#7a3a2a','#5a2a20',r()):mix('#8a7650','#6a5a3c',r()),x+off+1,row*4+1,14,3); } } for(let i=0;i<8;i++){ const x=r()*w|0; vfill(g,x,0,2+(r()*3|0),h*(.3+r()*.6),[[0,'rgba(10,8,6,.45)'],[1,'rgba(10,8,6,0)']]); } },9,1402);
const tSoot=P2(64,64,(g,w,h)=>{ R(g,'#2a2622',0,0,w,h); const r=rng(1403); for(let row=0;row<16;row++){ const off=(row%2)*8; for(let x=-16;x<w;x+=16) R(g,mix('#4a3a30','#362c24',r()),x+off+1,row*4+1,14,3); } },8,1404);
const tConc=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#6a665e'],[1,'#56524a']]); const r=rng(1405); for(let i=0;i<6;i++){ const x=r()*w|0; vfill(g,x,0,2,h*r(),[[0,'rgba(20,18,14,.5)'],[1,'rgba(20,18,14,0)']]); } R(g,'rgba(0,0,0,.35)',0,0,w,1); },10,1406);
const tPaveW=P2(32,32,(g,w,h)=>{ R(g,'#1a1916',0,0,w,h); const r=rng(1407); for(let y=0;y<2;y++) for(let x=0;x<2;x++) R(g,mix('#4c4a44','#3a3934',r()),x*16+1,y*16+1,14,14);
  for(let i=0;i<3;i++){ const cx=r()*w,cy=r()*h; g.fillStyle='rgba(10,12,16,.55)'; g.beginPath(); g.ellipse(cx,cy,3+r()*5,1.5+r()*2.5,0,0,Math.PI*2); g.fill(); g.fillStyle='rgba(150,150,160,.18)'; g.fillRect(cx-2,cy-1,3,1); } },10,1408);
const tTarmac=P2(32,32,(g,w,h)=>{ R(g,'#1e1e20',0,0,w,h); specks(g,'#2c2c30',90,1409,w,h); specks(g,'#121214',70,1410,w,h); const r=rng(1411); for(let i=0;i<2;i++){ g.fillStyle='rgba(8,10,14,.6)'; g.beginPath(); g.ellipse(r()*w,r()*h,6+r()*6,2+r()*2,0,0,Math.PI*2); g.fill(); } },8,1412);
const tKerb=P2(16,8,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#8a867c'],[1,'#5a5750']]); R(g,'#3a3832',w-1,0,1,h); },8,1413);
const tYellow=P2(4,4,g=>R(g,'#d4a820',0,0,4,4),0,1);
const tWhiteLine=P2(4,4,g=>R(g,'#d8d4cc',0,0,4,4),0,1);
const tShutterL=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#6a6c6e'],[1,'#4a4c4e']]); for(let y=0;y<h;y+=2) R(g,'rgba(0,0,0,.3)',0,y,w,1); const r=rng(1414); for(let k=0;k<3;k++){ g.strokeStyle=['#c83a7a','#e8c840','#3aa8e8'][k]; g.lineWidth=1.5; g.beginPath(); let x=4+r()*14,y=10+r()*14; g.moveTo(x,y); for(let s=0;s<3;s++) g.quadraticCurveTo(x+r()*6,y-6+r()*12,x+=4+r()*4,y+=r()*6-3); g.stroke(); } },10,1415);
/* the Golden Rooster: lit from inside, menu boards over the counter, the fryer's glow */
const tRoosterIn=P2(64,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#fff4e2'],[1,'#ffd2a2']]); for(let k=0;k<4;k++){ R(g,'#c21b1b',3+k*15,2,13,8); ell(g,7+k*15,6,3,2,'#ffa02a'); R(g,'#ffd23a',11+k*15,4,5,1); R(g,'#ffd23a',11+k*15,7,5,1); }
  R(g,'#8a8e94',0,20,w,4); R(g,'#b81419',0,24,w,8); R(g,'rgba(255,150,40,.6)',36,13,14,7); ell(g,44,16,2,3,'#2a1a14'); },0,1416);
const tRoosterSign=P2(64,12,(g,w,h)=>{ R(g,'#c21b1b',0,0,w,h); R(g,'#8a1010',0,h-1,w,1); text(g,'GOLDEN ROOSTER',(w-textW('GOLDEN ROOSTER'))>>1,2,'#ffd23a'); R(g,'#ffd23a',4,9,w-8,1); },0,1417);
const tOffyIn=P2(64,32,(g,w,h)=>{ R(g,'#efeadc',0,0,w,h); const r=rng(1418); for(let s=0;s<4;s++){ R(g,'#8a8378',18,7+s*6,46,1); for(let x=19;x<63;x+=3) R(g,mix(['#c83a2a','#2a7a3a','#e8c040','#3a5ab8','#7a2a5a'][r()*5|0],'#000000',r()*.3),x,7+s*6-3-(r()*2|0),2,3+(r()*2|0)); } R(g,'#3a2f28',0,20,16,12); R(g,'#d8d0c0',2,12,12,7); },0,1419);
const tOffySign=P2(64,12,(g,w,h)=>{ R(g,'#0f3d2c',0,0,w,h); text(g,'BETHNAL WINES',(w-textW('BETHNAL WINES'))>>1,1,'#eaf5ee'); text(g,'OFF LICENCE',(w-textW('OFF LICENCE'))>>1,7,'#9ad8b4'); },0,1420);
const tBookieSign=P2(64,12,(g,w,h)=>{ R(g,'#1d3b6e',0,0,w,h); text(g,'LUCKY STARS',(w-textW('LUCKY STARS'))>>1,2,'#f2d43a'); R(g,'#f2d43a',6,9,w-12,1); },3,1421);
const tLobby=P2(16,32,(g,w,h)=>{ R(g,'#1d2124',0,0,w,h); vfill(g,3,3,10,29,[[0,'#d8ecf2'],[1,'#8aa8b4']]); R(g,'#2a3238',7,3,2,29); R(g,'#e9f4f8',2,1,12,1); },0,1422);
const tHollis=P2(48,8,(g,w,h)=>{ R(g,'#e8e4da',0,0,w,h); text(g,'HOLLIS HOUSE',(w-textW('HOLLIS HOUSE'))>>1,2,'#1b1b1b'); },2,1423);
const tStreetSign=P2(64,16,(g,w,h)=>{ R(g,'#f2efe6',0,0,w,h); R(g,'#111',1,1,w-2,1); R(g,'#111',1,h-2,w-2,1); R(g,'#111',1,1,1,h-2); R(g,'#111',w-2,1,1,h-2); text(g,'BETHNAL GREEN RD',4,4,'#111'); text(g,'E2',w-12,4,'#c41a1a'); R(g,'#c41a1a',4,11,w-8,1); },0,1424);
const tWinLit=P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#ffd9a0'],[1,'#ffb866']]); R(g,'rgba(90,30,20,.5)',0,0,3,h); R(g,'rgba(90,30,20,.5)',w-3,0,3,h); R(g,'#4a4038',0,7,w,2); R(g,'#4a4038',7,0,2,h); },0,1425);
const tWinDark=P2(16,16,(g,w,h)=>{ R(g,'#0d1014',0,0,w,h); R(g,'rgba(120,130,150,.18)',2,2,5,4); R(g,'#b9b2a5',0,7,w,2); R(g,'#b9b2a5',7,0,2,h); R(g,'#b9b2a5',0,0,w,1); R(g,'#b9b2a5',0,h-1,w,1); },0,1426);
const tRain=P2(64,128,(g,w,h)=>{ g.clearRect(0,0,w,h); const r=rng(1427); for(let i=0;i<14;i++){ const x=r()*w|0,y=r()*h|0,l=5+(r()*7|0); for(let k=0;k<l;k++) R(g,k<2?'#9aa4b4':'#6c7684',x,(y+k)%h,1,1); } },0,1428);
const tGlowSodium=P2(16,16,(g,w,h)=>{ g.clearRect(0,0,w,h); radial(g,8,8,8,[[0,'rgba(255,214,150,1)'],[.5,'rgba(255,160,60,.9)'],[1,'rgba(255,140,40,0)']]); },0,1429);
const tSky=P2(4,32,(g,w,h)=>vfill(g,0,0,w,h,[[0,'#06070c'],[.7,'#1e1820'],[1,'#3a2a28']]),0,1);

/* ---------- ground: pavement, kerb, road, far pavement ---------- */
const PAVE_Y=.12, KERB_Z=2.6, ROAD_Z1=10.4;
slab(30,5.6,tPaveW,0,PAVE_Y,-.2,{tile:1.2});
mk(box(30,PAVE_Y,.22),MM(tKerb,{repeat:[30,1]}),STREET,0,PAVE_Y/2,KERB_Z-.11);
slab(30,ROAD_Z1-KERB_Z,tTarmac,0,0,(KERB_Z+ROAD_Z1)/2,{tile:2});
for(const z of [KERB_Z+.18,KERB_Z+.36]) slab(30,.08,tYellow,0,.004,z,{cell:30});
for(let x=-14;x<15;x+=4.5) slab(2.4,.1,tWhiteLine,x,.004,(KERB_Z+ROAD_Z1)/2,{cell:3});
slab(30,4,tPaveW,0,PAVE_Y,ROAD_Z1+2,{tile:1.2});
mk(box(30,PAVE_Y,.22),MM(tKerb,{repeat:[30,1]}),STREET,0,PAVE_Y/2,ROAD_Z1+.11);

/* ---------- the deck block: shops on the ground floor, walkways above ---------- */
const FZ=-3;
const mConc=MM(tConc,{repeat:[1,1]}), mDark=M(null,{color:0x101113});
wallP(30,4.2,tConc,0,2.1,FZ-.02,0,{tile:3,tileH:4.2});
for(let f=0;f<4;f++){ const b=4.2+f*3;
  blk(30,.3,2.1,MM(tConc,{repeat:[10,1]}),0,b+.15,FZ+.75);
  mk(plane(30,1.1,25,1),MM(tConc,{repeat:[10,1]}),STREET,0,b+.85,FZ+1.8);
  mk(plane(30,1.1,25,1),MM(tConc,{repeat:[10,1]}),STREET,0,b+.85,FZ+1.78,0,Math.PI,0);
  wallP(30,2.7,tConc,0,b+1.65,FZ-.3,0,{tile:3,tileH:2.7,color:0x8a8680});
  for(let x=-13;x<14;x+=4){ const lit=((x*7+f*13)%5)===0; wallP(1.2,1,lit?tWinLit:tWinDark,x+1.4,b+1.9,FZ-.28,0,{unlit:lit,cell:2,tile:1.2}); mk(box(.9,2,.06),M(null,{color:[0x24364f,0x4b1a1a,0x1d3a2c,0x2a2a2a][(x+20+f)%4]}),STREET,x,b+1.3,FZ-.27); }
  for(let x=-12;x<14;x+=4) mk(box(.3,.06,.4),M(null,{color:0xfff0cf,unlit:true}),STREET,x,b+2.97,FZ+.6); }
/* shop units: [x, width, kind] */
const UNITS=[[-7.5,4.8,'rooster'],[-2.4,4.8,'offy'],[2.6,4.8,'shut'],[7.6,4.8,'bookie'],[11.6,2.6,'lobby'],[-11.6,2.6,'shut']];
for(const [x,w,k] of UNITS){
  for(const s of [-1,1]) blk(.4,4.2,.5,mConc,x+s*(w/2+.2),2.1,FZ+.25);
  if(k==='rooster'||k==='offy'){ wallP(w,2.6,k==='rooster'?tRoosterIn:tOffyIn,x,1.75,FZ+.04,0,{unlit:true,cell:5,tile:w,tileH:2.6}); blk(w,.45,.12,mDark,x,.34,FZ+.06);
    wallP(w,.8,k==='rooster'?tRoosterSign:tOffySign,x,3.7,FZ+.12,0,{unlit:true,cell:5,tile:w,tileH:.8}); }
  else if(k==='lobby'){ wallP(w-.4,3,tLobby,x,1.62,FZ+.04,0,{unlit:true,cell:3,tile:w-.4,tileH:3}); wallP(w,.5,tHollis,x,3.62,FZ+.1,0,{cell:3,tile:w,tileH:.5}); }
  else { wallP(w,3.2,tShutterL,x,1.72,FZ+.04,0,{tile:1.6}); if(k==='bookie') wallP(w,.8,tBookieSign,x,3.7,FZ+.12,0,{cell:5,tile:w,tileH:.8}); } }
wallP(2.2,.55,tStreetSign,-10,2.6,FZ+.53,0,{cell:3,tile:2.2,tileH:.55});
/* bollards and a bin */
for(const x of [-9.6,-5,0,5,9.8]) mk(cyl(.07,.09,.9,8),M(null,{color:0x1a1b1e}),STREET,x,PAVE_Y+.45,KERB_Z-.35);
blk(.55,.95,.45,M(null,{color:0x1a2a1c}),-4.6,PAVE_Y+.47,-2.4);

/* ---------- the lamp ---------- */
const LAMP=[3.6,6.6,KERB_Z-.3];
blk(.14,6.9,.14,M(null,{color:0x2a2d33}),LAMP[0],PAVE_Y+3.45,LAMP[2]);
blk(.1,.1,1.3,M(null,{color:0x2a2d33}),LAMP[0],6.95,LAMP[2]+.6);
blk(.5,.16,.32,M(null,{color:0x2a2d33}),LAMP[0],6.95,LAMP[2]+1.2);
blk(.42,.05,.24,M(null,{color:0xffd090,unlit:true}),LAMP[0],6.86,LAMP[2]+1.2);
const lampGlow=wallP(1.6,1.6,tGlowSodium,LAMP[0],6.75,LAMP[2]+1.3,0,{unlit:true,cut:true,cell:3,double:true,tile:1.6});

/* ---------- across the road: terraces ---------- */
const TZ=ROAD_Z1+4;
wallP(34,8.6,tStock,0,4.3,TZ,Math.PI,{tile:1.6,cell:2});
mk(box(34,.3,.3),M(null,{color:0xc8c0b0}),STREET,0,8.3,TZ-.12);
mk(box(34,.2,.2),M(null,{color:0xc8c0b0}),STREET,0,3.4,TZ-.1);
for(let i=0;i<7;i++){ const zc=-15+i*5+2.5; const lit=[1,0,0,1,0,1,0];
  wallP(1.5,1.7,lit[i]?tWinLit:tWinDark,zc+.8,1.9,TZ-.03,Math.PI,{unlit:!!lit[i],cell:2,tile:1.5,tileH:1.7});
  wallP(1,1.6,(i%3)?tWinDark:tWinLit,zc-1.1,5.3,TZ-.03,Math.PI,{unlit:!(i%3),cell:2,tile:1,tileH:1.6}); wallP(1,1.6,tWinDark,zc+1.2,5.3,TZ-.03,Math.PI,{cell:2,tile:1,tileH:1.6});
  mk(box(1,2.2,.08),M(null,{color:[0x14213d,0x1d3b2a,0x6e1414,0x111111,0x0e3b3b][i%5]}),STREET,zc-1.4,1.1,TZ-.04); }
blk(34,.8,.25,MM(tStock,{repeat:[20,1]}),0,PAVE_Y+.4,ROAD_Z1+3.1);

/* ---------- the railway arch at the end of the street, and the sky ---------- */
const ARCH=N(STREET,-17,0,4,0,Math.PI/2,0);
wallP(14,12,tSoot,0,6,0,0,{parent:ARCH,tile:1.6,cell:2});
mk(box(8.4,4.6,.3),M(null,{color:0x050506}),ARCH,0,2.3,.2); mk(cyl(4.2,4.2,.3,14),M(null,{color:0x050506}),ARCH,0,4.6,.2,Math.PI/2);
const sky=N(STREET); wallP(120,40,tSky,0,18,-40,0,{parent:sky,unlit:true,nofog:true,cell:120}); wallP(120,40,tSky,0,18,60,Math.PI,{parent:sky,unlit:true,nofog:true,cell:120});
for(const [x,h] of [[-18,46],[-8,30],[22,38],[30,26]]) mk(box(9,h,9),M(null,{color:0x0b0c11,nofog:true}),sky,x,h/2,-34);

/* ---------- rain: textured sheets that fall and wrap ---------- */
const RAIN=N(STREET), rainSheets=[];
/* six sheets, always square to the camera, spread through the depth between the camera and the far pavement */
const RAIN_D=[-5,-2.5,0,2.5,5,7.5];
for(let i=0;i<RAIN_D.length;i++){ const n=N(RAIN); const inner=N(n); wallP(24,16,tRain,(i%2)*1.3,8,0,0,{parent:inner,unlit:true,cut:true,double:true,tile:3.4+(i%3)*.5,tileH:6,cell:2}); rainSheets.push({n,inner,d:RAIN_D[i],sp:9+i%3*1.6}); }
function rainTick(t,c){ const fx=-Math.sin(c.th),fz=-Math.cos(c.th); for(const s of rainSheets){ s.n.p=[c.t[0]+fx*s.d,0,c.t[2]+fz*s.d]; s.n.r=[0,c.th,0]; s.inner.p[1]=-((t*s.sp)%6); } }

/* ---------- light ---------- */
const STREET_LIGHT={amb:[.2,.19,.25],dir:[-.3,1,.4],dirCol:[.12,.13,.2],fog:[.05,.042,.048],fogNear:12,fogFar:38,
  pl:[[[LAMP[0],6.6,LAMP[2]+1.2],[1.5,.92,.42],11],[[-7.5,2.4,-1.6],[1.35,.62,.42],6.5],[[-2.4,2.4,-1.6],[.8,.95,.85],5.5],[[11.6,2.2,-2],[.5,.62,.7],4],
      [[0,5.8,-1.8],[.55,.48,.36],7],[[2,2,6],[.12,.13,.2],14],[[-1,2.6,4.4],[.55,.5,.5],8]]};
