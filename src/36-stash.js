/* =====================================================================================================
   THE STASH HOUSE: Puerto Seco, level 3. Colonia Tierra Blanca, 02:40. Dale gave Ray the address.
   Small and dense, one colonia lot, built in world coordinates for the 26 x 12 m test grid:
     west  (-x)  the alley you start in (armoury rack, spawn board, map), opening onto a dirt street
     street      a parked car, a streetlight, the lookout on his plastic chair by the gate, facing up the street
     yard        behind a 1.9 m cinderblock wall: the gate, a broken gap at the south corner, the generator
     house       the count (front room), kitchen, back room with the shaft, a dark bedroom
     north       a side passage from the yard to the back strip; the kitchen side door opens onto it
     east  (+x)  the back strip behind the house: the back door into the shaft room, the bedroom window
   Five men. The generator runs every bulb in the house and yard: shoot it and the house goes dark (the streetlight
   is city power and stays on). Climb into the shaft in the back room and you're in the tunnel.
   ===================================================================================================== */
const STASH_RECTS=[[-13,-2,-10.2,2,-2],[-10.2,-5.6,-6.4,5.6,-1],[-6.4,-5,-2,5.6,5],[-2,3.9,7,5.6,6],[7,-5,8.6,5.6,7],
  [-2,-5,2.4,.4,0],[-2,.4,2.4,3.9,1],[2.4,-5,7,-.6,2],[2.4,-.6,7,3.9,3]];
const STASH_SHAFT=[5.4,-3.6];
const STASH_CAST=[
  {id:'halcon',name:'Memo',x:-7.25,z:2.4,hd:0,extra:es('Nomás vigilo la calle, güey—','I just watch the street, man—'),detail:'watches the street'},
  {id:'pistolero',name:'Paco',x:-.05,z:-3.0,hd:Math.PI/2,extra:es('Es dinero, llévatelo—','It\'s money, take it—'),detail:'counts the money'},
  {id:'machetero',name:'Chava',x:-1.25,z:-3.9,hd:-Math.PI/2,extra:es('Tengo una niña de tres años—','I have a three-year-old girl—'),detail:'watches the yard'},
  {id:'escolta',name:'Rubén',x:1.3,z:1.4,hd:-Math.PI/2,extra:es('Mi esposa está embarazada—','My wife is pregnant—'),detail:'eats in the kitchen'},
  {id:'comando',name:'Gera',x:4.3,z:-2.4,hd:-Math.PI/2,extra:es('Yo no sé nada del túnel—','I don\'t know anything about the tunnel—'),detail:'guards the shaft'}];
function stashCast(){ for(const sp of STASH_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>cartelChar(sp.id,h,g)})); E.detail=sp.detail; enemies.push(E); } attachLabels(); }

function genStash(){
  disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=3; FLOOR.test=true; FLOOR.mode='stash'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.flick=null; FLOOR.down=false; setLang(true);
  const G=floorN, B={g:G}; GEO_TEMP=true;
  /* a wall as drawn by the house builder, plus its collision: doors and gaps are open, windows are solid to 1.4 m
     (you can't climb through, but people see and shoot over the sill) */
  const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>{ wall(B,x0,z0,x1,z1,a,b,holes,o);
    const ax=Math.abs(x1-x0)>Math.abs(z1-z0),s0=ax?Math.min(x0,x1):Math.min(z0,z1),s1=ax?Math.max(x0,x1):Math.max(z0,z1),c=ax?z0:x0,h=o.h||WH,t=WT/2+.01;
    const solid=(p0,p1,y0,y1,kind)=>{ if(p1-p0<.01) return; if(ax) addBox(p0,p1,c-t,c+t,y0,y1,kind); else addBox(c-t,c+t,p0,p1,y0,y1,kind); };
    let s=s0; for(const q of holes.slice().sort((p,q)=>p.at-q.at)){ const p0=q.at-q.w/2,p1=q.at+q.w/2; solid(s,p0,0,h,'wall');
      if(q.win) solid(p0,p1,0,1.4,'win'); if((q.y1??2.1)<h) solid(p0,p1,q.y1??2.1,h,'wall'); s=p1; }
    solid(s,s1,0,h,'wall'); };
  const P=S_(tPlaster),PY=S_(tPlasterY),PP=S_(tPlasterPink),EX=S_(tCinPink),RAW=S_(tCinRaw),TQ=S_(tCinTurq),OC=S_(tCinOchre),BL=S_(tCinBlue),MU=S_(tMural);
  /* ---------- ground ---------- */
  floor(B,-13,-2,-10.2,2,tDust,{tile:2,color:0x8a8070}); floor(B,-10.2,-5.6,-6.4,5.6,tDust,{tile:2,color:0x9a9080});
  floor(B,-6.4,-5,-2,5.6,tFlConc,{tile:2,color:0xa8a49a}); floor(B,-2,3.9,8.6,5.6,tDust,{tile:2,color:0x8a8070}); floor(B,7,-5,8.6,3.9,tDust,{tile:2,color:0x8a8070});
  floor(B,-2,-5,2.4,.4,tFlTerra,{tile:.8}); floor(B,-2,.4,2.4,3.9,tFlTerra,{tile:.8,color:0xc8a898});
  floorHole(B,2.4,-5,7,-.6,STASH_SHAFT[0]-.55,STASH_SHAFT[1]-.55,STASH_SHAFT[0]+.55,STASH_SHAFT[1]+.55,tFlConc,{tile:2}); floor(B,2.4,-.6,7,3.9,tFlTerra,{tile:.8,color:0xb89888});
  /* ---------- the house: pink cinderblock, plaster inside ---------- */
  W(-2,-5,-2,3.9,P,EX,[win(-4,1.1),door(-2,.95,-1.5,{doorT:tCorrug}),win(2.2,1.0)]);
  W(7,-5,7,3.9,EX,PP,[door(-2,.95,1.2,{doorT:tCorrug}),win(1.5,1.0)]);
  W(-2,-5,7,-5,P,EX); W(-2,3.9,7,3.9,EX,PY,[door(1,.95,1.25)]);
  W(-2,.4,2.4,.4,PY,P,[gap(-.5,1.3)]); W(2.4,-5,2.4,3.9,RAW,P,[door(-1.5,.95,-1.3),gap(2.5,.95)]); W(2.4,-.6,7,-.6,PP,RAW,[door(6,.95,1.3)]);
  for(const [x,z] of [[-2,-4],[-2,2.2]]) place(B,'bars',x-.02,z,-Math.PI/2,1.1); place(B,'bars',7.02,1.5,Math.PI/2,1.0);
  mk(box(9.3,.2,9.2),M(tCinRaw,{color:0x9a948a}),G,2.5,WH+.1,-.55); addBox(-2,7,-5,3.9,WH,WH+.2,'ceil');
  /* ---------- yard wall (gate, broken corner), the neighbours, the street, the alley ---------- */
  W(-6.4,-5.6,-6.4,5.6,RAW,TQ,[gap(-4,1.0),gap(2.2,2.4)],{h:1.9});
  { const gt=N(G,-6.4,0,3.4,0,Math.PI/2+1.1,0); mk(box(2.3,1.8,.05,{at:[1.15,.9,0]}),MT(tCorrug,{repeat:[2,1]}),gt); } /* the gate, swung open into the yard */
  { const r=rng(31); for(let i=0;i<7;i++) mk(box(.3+r()*.2,.12+r()*.1,.2),M(tCinRaw),G,-6.4+(r()-.5)*.9,.06+r()*.05,-4+(r()-.5)*1.2,r()*.3,r()*3,0); } /* rubble in the gap */
  W(-6.4,5.6,8.6,5.6,OC,TQ,[],{h:2.4}); W(8.6,-5,8.6,5.6,OC,OC,[],{h:2.6}); W(-6.4,-5,-2,-5,TQ,OC,[],{h:2.2}); W(7,-5,8.6,-5,TQ,OC,[],{h:2.2});
  W(-10.2,-5.6,-6.4,-5.6,BL,BL,[],{h:2.4}); W(-10.2,5.6,-6.4,5.6,OC,OC,[],{h:2.4});
  W(-10.2,-5.6,-10.2,-2,BL,BL,[door(-4.2,1.0,0,{doorT:tCorrug}),win(-3.0,.9)],{h:2.8}); W(-10.2,2,-10.2,5.6,MU,MU,[win(3.0,.9),door(4.6,1.0,0,{doorT:tCorrug})],{h:2.8});
  W(-13,-2,-10.2,-2,OC,OC,[],{h:2.9}); W(-13,2,-10.2,2,OC,OC,[],{h:2.9}); W(-13,-2,-13,2,OC,OC,[],{h:2.9});
  for(const [x,z] of [[-10.2,-3],[-10.2,3]]) place(B,'bars',x+.02,z,Math.PI/2,.9);
  /* rooftops beyond the walls, so the skyline isn't open */
  const slab=(x0,z0,x1,z1,y)=>mk(box(x1-x0,.2,z1-z0),M(tCinRaw,{color:0x6a665e}),G,(x0+x1)/2,y+.1,(z0+z1)/2);
  slab(-16,-7,-10.1,-1.9,2.8); slab(-16,1.9,-10.1,7,2.8); slab(-16,-1.9,-12.95,1.9,2.9); slab(-6.5,5.5,9,9,2.4); slab(8.5,-6,12,5.7,2.6); slab(-6.5,-8,9,-4.9,2.2); slab(-10.3,-8,-6.3,-5.5,2.4); slab(-10.3,5.5,-6.3,9,2.4);
  for(const [x,z,y] of [[-14,-4,2.9],[-14.2,4.5,2.9],[10.4,-2.5,2.8],[2,7.4,2.6]]) place(B,'tinaco',x,z).p[1]=y;
  for(const [x,z,y] of [[-11,-6.4,2.8],[9,4.8,2.8],[-3,-6.2,2.4],[5,6.8,2.6]]) place(B,'rebar',x,z,0,4,x*7+z).p[1]=y;
  /* ---------- the street ---------- */
  place(B,'car',-9.15,-3.65,0,0xd8d4cc,'sedan'); addBox(-10.08,-8.22,-5.95,-1.35,0,1.25,'furn');
  place(B,'bins',-9.85,3.5,Math.PI/2,2); addBox(-10.2,-9.45,3.15,4.6,0,1.05,'furn');
  place(B,'pole',-6.75,-.4,0,7); place(B,'pole',-9.9,5.2,0,7);
  place(B,'wire',0,0,0,[-6.75,-.4],[-9.9,5.2],6.6); place(B,'wire',0,0,0,[-6.75,-.4],[-2,-3],6.5); place(B,'wire',0,0,0,[-9.9,5.2],[-14,7],6.6); place(B,'wire',0,0,0,[-6.75,-.4],[-14,-5],6.6);
  addBox(-6.88,-6.62,-.53,-.27,0,6,'furn');
  { const arm=N(G,-6.75,0,-.4); mk(box(1.1,.08,.08),mBlackPipe,arm,-.55,5.45,0); const lamp=N(arm,-1.05,5.36,0); mk(box(.5,.1,.36),M(null,{color:0xffa040,unlit:true}),lamp); lamp._keep=true; }
  place(B,'pchair',-7.35,1.7,Math.PI); place(B,'pchair',-8.9,4.6,2.2); /* the lookout's chair, and one across the street */
  /* the alley: where you start. a dumped mattress, trash */
  place(B,'mattress',-12.2,1.45,0); place(B,'bins',-12.6,-1.5,0,1);
  /* ---------- the yard ---------- */
  const gen=place(B,'generator',-3.5,-4.45,0); heatTag(gen,.75); const gb=addBox(-3.95,-3.05,-4.73,-4.17,0,1.0,'generator'); gb.onHit=()=>stashPower(false);
  place(B,'gascyl',-2.35,-4.6); place(B,'laundry',-4.4,1.0,Math.PI/2,4.0); place(B,'pchair',-3.0,4.7,2.6); place(B,'bricksPile',-5.6,4.9,0,10,11);
  /* ---------- the count (front room) ---------- */
  place(B,'counttable',.6,-3.0,Math.PI/2); addBox(.12,1.08,-3.92,-2.08,0,.8,'furn');
  for(const [x,z,ry] of [[-.05,-3.0,Math.PI/2],[1.35,-3.4,-Math.PI/2]]) place(B,'pchair',x,z,ry);
  const crt=place(B,'crt',1.75,.05,Math.PI); heatTag(crt,.5); addBox(1.38,2.12,-.22,.36,0,1.0,'furn');
  place(B,'mattress',-.85,-4.45,0); place(B,'bricksPile',1.75,-4.5,0,16,5); addBox(1.2,2.3,-4.8,-4.15,0,.5,'furn');
  /* kitchen */
  place(B,'counter',-.9,3.56,Math.PI,1.9,tCabinetW,tCounterTop,{sink:.5,stove:-.5,upper:false}); addBox(-1.86,.06,3.24,3.88,0,.92,'furn');
  place(B,'fridge',2.0,3.46,Math.PI); addBox(1.63,2.37,3.1,3.86,0,1.8,'furn'); place(B,'gascyl',-1.75,.85);
  place(B,'table',.4,1.9,0,1.0,.7,0xd8d4cc); addBox(-.12,.92,1.53,2.27,0,.77,'furn'); place(B,'pchair',.4,1.25,0); place(B,'pchair',.4,2.6,Math.PI);
  /* the back room: the shaft, the product */
  place(B,'shaft',STASH_SHAFT[0],STASH_SHAFT[1]); place(B,'sandbags',6.6,-4.3,Math.PI/2,6); place(B,'crates',3.0,-4.5,0); addBox(2.55,3.6,-4.95,-4.05,0,1.1,'furn');
  place(B,'bricksPile',3.3,-1.2,0,12,7); addBox(2.7,4.0,-1.45,-.75,0,.4,'furn');
  /* the bedroom: dark, two mattresses */
  place(B,'mattress',3.7,3.25,0); place(B,'mattress',5.75,3.25,0); place(B,'gascyl',6.6,.2);
  /* the back strip: a water drum, bins */
  place(B,'bins',8.0,-4.2,Math.PI/2,1); addBox(7.6,8.4,-4.6,-3.85,0,1.05,'furn');
  /* ---------- lights: four bulbs and the TV run off the generator, the streetlight is city power ---------- */
  const bulb=(x,y,z)=>{ mk(cyl(.004,.004,WH-y-.06,3,{at:[0,(WH-y)/2,0]}),mBlack,G,x,y,z); mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),G,x,y,z); };
  bulb(.6,2.2,-3.0); bulb(4.7,2.15,-2.6); mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,.4,WH-.04,2.0);
  mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),G,-2.2,2.3,-2.0);
  const lights=[[[.6,2.15,-3.0],[1.45,1.05,.6],5.5],[[1.75,1.0,-.5],[.5,.65,1.3],4.5],[[.4,2.45,2.0],[1.0,1.1,1.05],5],[[4.7,2.1,-2.6],[1.4,1.0,.55],4.5],
    [[-2.3,2.25,-2.0],[1.4,.95,.5],5.2],[[-7.8,5.2,-.4],[1.7,.9,.38],13]];
  GEO_TEMP=false;
  /* ---------- navigation ---------- */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i; const R_=STASH_RECTS.find(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]); if(!R_) continue;
    space[id]=STASH_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])?.[4]??R_[4];
    let bl=Math.hypot(x-STASH_SHAFT[0],z-STASH_SHAFT[1])<.9; if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.4) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const U=(id,apt,x0,z0,x1,z1,win)=>({id,side:z0<0?-1:1,x0,x1,z0,z1,w:x1-x0,apt,door:x0,room:true,lit:true,win});
  const units=[U(0,'COUNT',-2,-5,2.4,.4,[-2,-4]),U(1,'KITCHEN',-2,.4,2.4,3.9,[-2,2.2]),U(2,'SHAFT',2.4,-5,7,-.6,[7,-2]),U(3,'BEDROOM',2.4,-.6,7,3.9,[7,1.5]),U(5,'YARD',-6.4,-5,-2,5.6,[-6.4,2.2])];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.6,z:0,yaw:-Math.PI/2},lights});
  stashLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }

const STASH_LIGHT={amb:[.075,.08,.11],dir:[.35,1,.25],dirCol:[.1,.11,.17],fog:[.012,.014,.024],fogNear:6,fogFar:24};
function stashLights(){ setLights(Object.assign({},STASH_LIGHT,FLOOR.power?{pl:FLOOR.lights}:{amb:[.035,.038,.055],pl:FLOOR.lights.map((l,i)=>i===5?l:[[0,-50,0],[0,0,0],1])})); }
function stashPower(on){ if(FLOOR.mode!=='stash'||FLOOR.power===on) return; FLOOR.power=on;
  if(!on){ sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead){ setTimeout(()=>{ if(!E.dead){ E.aware=true; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick([es('¡Se fue la luz!','The lights went out!'),es('¿Quién apagó la planta?','Who shut off the generator?'),es('¡Memo! ¿Qué ves?','Memo! What do you see?')]),2.4); } },200+Math.random()*900); } }
  stashLights(); visionApply(); }
function stashReset(){ if(FLOOR.power===false){ FLOOR.power=null; stashPower(true); } FLOOR.down=false; stashCast(); visionApply(); }
function goStash(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genStash(); buildRack(); buildBoard(); SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }
/* down the shaft: into the tunnel with whatever is in your hands */
function stashDescend(){ FLOOR.down=true; sfx('door',.5); if(XR.on) vrToast('El pozo · the tunnel',2.5);
  setTimeout(()=>{ const keepR=HANDS.R.item,keepL=HANDS.L.item; goTunnel(); equip(HANDS.R,keepR); equip(HANDS.L,keepL); },700); }
function tickStash(dt){ if(FLOOR.mode!=='stash') return;
  if(GAME.vision!=='nv') L.plCol.set([0,0,0],18); /* the goggles' torch is off when they're up */
  if(FLOOR.power){ const t=GAME.t,f=.55+.25*Math.sin(t*9.1)+.2*Math.sin(t*23.7+1.3)*(Math.sin(t*.7)>.2?1:.3),c=FLOOR.lights[1][1]; L.plCol.set([c[0]*f,c[1]*f,c[2]*f],3); }
  /* a shot into the open sky hits the grid's lid: no bullet holes hanging in the air */
  for(const k of ['hole','splat']){ const D=DEC[k]; if(D.ver!==D._sv){ const n=D.length; for(let i=D.length-1;i>=0;i--){ const d=D[i]; if(d.c[1]>RH-.15&&d.n[1]<-.5) D.splice(i,1); } if(D.length!==n) D.ver++; D._sv=D.ver; } }
  if(!GAME.started||PL.dead||FLOOR.down) return;
  if(Math.hypot(PL.x-STASH_SHAFT[0],PL.z-STASH_SHAFT[1])<.55) stashDescend(); }
