/* =====================================================================================================
   THE STASH HOUSE: Puerto Seco, level 3. Colonia Tierra Blanca, 02:40. Dale gave Ray the address.
   A whole block of the colonia, 48 x 32 m (setWorld 24,16). Ground level everywhere; the rooftops are scenery.
     the alley        you start here (armoury rack, spawn board, map), it opens onto the main street
     main street      dirt, sodium lights, a taco cart at the north end. Two halcones (lookouts) with radios: one by the
                      stash house gate, one at the cart. A third sits on a pickup at the corner of the south street.
     crew house       north of the stash house, behind a courtyard with a car and string lights: three men, the crew's guns
     stash house      the yard and its generator (shoot it or flip the kill switch), the count, kitchen, shaft room, bedroom
     side passage     from the yard past the kitchen door to the back alley
     back alley       behind both houses, one man walking it. The stash house back door opens onto it
     obra negra       a half-built house across the alley: a lookout at its window, a machete on the sand
     the lot          an empty lot with junk cars and a fire in a drum: one man warming his hands
     the corner store at the corner of the two streets: a knife on the counter
   If a halcón sees you and stays alive for two seconds, he gets on the radio and the whole block comes for you.
   Fourteen men. Climb into the shaft in the back room of the stash house and you're in the tunnel.
   ===================================================================================================== */
const STASH_RECTS=[[-13,-2,-10.2,2,-2],[-10.2,-15,-5.2,14,-1],[-23,9.5,23,14,-1],[-5.2,-14,-1,-5.5,8],[-1,-14,4,-8.5,9],[4,-14,8,-8.5,10],[-1,-8.5,8,-5.5,11],
  [-5.2,-5.5,-1,5.6,5],[-1,-5.5,3.4,.2,0],[-1,.2,3.4,4,1],[3.4,-5.5,8,-.8,2],[3.4,-.8,8,4,3],[-1,4,8,5.6,6],[-5.2,5.6,2.5,9.5,12],[8,-14,10,9.5,7],
  [10,-4.5,13.5,4,13],[13.5,-4.5,17,4,14],[10,-15,23,-4.5,15],[17,-4.5,23,9.5,15]];
const STASH_SHAFT=[6.2,-3.6];
const STASH_GEN=[-3.2,-4.95];
const STASH_SW=[-3.5,.76,-4.66]; /* the generator's kill switch, on the front of its engine housing */
const STASH_LEDGER=[.95,.81,-2.75];
const ES=es;
const STASH_CAST=[
  {id:'halcon',name:'Memo',x:-5.9,z:4.7,hd:0,radio:true,extra:ES('Nomás vigilo la calle, güey—','I just watch the street, man—'),detail:'watches the corner'},
  {id:'halcon',name:'Kike',x:-7.3,z:-10.1,hd:.15,radio:true,extra:ES('Tengo quince años—','I\'m fifteen—'),detail:'watches the street'},
  {id:'halcon',name:'Tavo',x:1.4,z:11.7,hd:-Math.PI/2,radio:true,extra:ES('Nomás me pagan por mirar—','They just pay me to look—'),detail:'watches the south street'},
  {id:'escolta',name:'Neto',x:-3.4,z:-7.6,hd:-Math.PI/2,extra:ES('Yo nomás manejo—','I just drive—'),detail:'minds the car'},
  {id:'pistolero',name:'Lalo',x:2.9,z:-10.6,hd:-Math.PI/2,extra:ES('Estaba viendo el fútbol, güey—','I was watching the game, man—'),detail:'watches TV'},
  {id:'comando',name:'Poncho',x:6.0,z:-12.4,hd:0,extra:ES('Las armas no son mías—','The guns aren\'t mine—'),detail:'keeps the guns'},
  {id:'machetero',name:'Chava',x:-2.6,z:-2.6,hd:-2.4,extra:ES('Tengo una niña de tres años—','I have a three-year-old girl—'),detail:'watches the yard'},
  {id:'pistolero',name:'Paco',x:.2,z:-2.7,hd:Math.PI/2,extra:ES('Es dinero, llévatelo—','It\'s money, take it—'),detail:'counts the money'},
  {id:'escolta',name:'Rafa',x:2.2,z:-4.0,hd:-.6,extra:ES('Yo apenas empecé—','I only just started—'),detail:'counts the money'},
  {id:'machetero',name:'Rubén',x:2.4,z:1.2,hd:0,extra:ES('Mi esposa está embarazada—','My wife is pregnant—'),detail:'eats in the kitchen'},
  {id:'comando',name:'Gera',x:4.9,z:-2.5,hd:-Math.PI/2,extra:ES('Yo no sé nada del túnel—','I don\'t know anything about the tunnel—'),detail:'guards the shaft'},
  {id:'machetero',name:'Beto',x:9,z:-12,hd:0,patrol:[[9,-12.6],[9,8.2]],extra:ES('Me obligaron, lo juro—','They made me, I swear—'),detail:'walks the back alley'},
  {id:'pistolero',name:'Memo Chico',x:12.2,z:1.2,hd:-Math.PI/2,extra:ES('Mi jefa me está esperando—','My mom is waiting for me—'),detail:'watches the alley'},
  {id:'escolta',name:'Chuy',x:16.9,z:-8.3,hd:-2.2,extra:ES('¡No dispares, tengo hijos!','Don\'t shoot, I have kids!'),detail:'warms up at the fire'}];
/* weapons lying around the block: [key, x, y, z, yaw] */
const STASH_LOOT=[['bottle',-6.25,1.15,-10.8,.4],['knife',-3.4,1.0,8.9,1.2],['revolver',1.2,.6,-11.3,.3],['shotgun',6.3,.86,-13.25,0],['machete',15.4,.6,2.7,2.2],['pistol',19.4,1.35,-11.2,1.0],['bottle',12.5,.1,-10.6,0]];

function stashCast(){ for(const sp of STASH_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>cartelChar(sp.id,h,g)})); E.detail=sp.detail; E.radio=!!sp.radio;
    if(sp.patrol){ E.patrol={pts:sp.patrol,i:1,wait:0}; E.st='alert'; } enemies.push(E); } attachLabels(); }
function stashLoot(){ for(const [k,x,y,z,ry] of STASH_LOOT){ const Mw=m4.compose(m4.make(),[x,y,z],[k==='knife'||k==='machete'||k==='bottle'?Math.PI/2:0,ry,0],[1,1,1]); addPickup(newItem(k),Mw,[0,0,0],[0,0,0]); } }

function genStash(){
  setWorld(24,16); disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true; FIRES.length=0;
  FLOOR.n=3; FLOOR.test=true; FLOOR.mode='stash'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; FLOOR.down=false; setLang(true);
  const G=floorN, B={g:G}; GEO_TEMP=true;
  /* a wall from the house builder plus its collision: doors and gaps are open; window and hole sills block to 1.4 m (you can't climb through,
     but people see and shoot over them) */
  const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>{ wall(B,x0,z0,x1,z1,a,b,holes,o);
    const ax=Math.abs(x1-x0)>Math.abs(z1-z0),s0=ax?Math.min(x0,x1):Math.min(z0,z1),s1=ax?Math.max(x0,x1):Math.max(z0,z1),c=ax?z0:x0,h=o.h||WH,t=WT/2+.01;
    const solid=(p0,p1,y0,y1,kind)=>{ if(p1-p0<.01) return; if(ax) addBox(p0,p1,c-t,c+t,y0,y1,kind); else addBox(c-t,c+t,p0,p1,y0,y1,kind); };
    let s=s0; for(const q of holes.slice().sort((p,q)=>p.at-q.at)){ const p0=q.at-q.w/2,p1=q.at+q.w/2; solid(s,p0,0,h,'wall');
      if(q.win||(q.y0||0)>0) solid(p0,p1,0,1.4,'win'); if((q.y1??2.1)<h) solid(p0,p1,q.y1??2.1,h,'wall'); s=p1; }
    solid(s,s1,0,h,'wall'); };
  const hole=(at,w,y0=.95,y1=1.95)=>({at,w,y0,y1}); /* an empty window opening: no glass, no frame (the half-built house) */
  const S=t=>S_(t), PK=S(tCbPink),TQ=S(tCbTurq),OC=S(tCbOchre),BL=S(tCbBlue),LI=S(tCbLime),WT_=S(tCbWhite),VI=S(tCbViolet),OR=S(tCbOrange),RAW=S(tCbRaw),PKH=S(tCbPinkHalf),TQH=S(tCbTurqHalf),CR=S(tCbCream);
  const MINT=S(tInMint),PEACH=S(tInPeach),IBLUE=S(tInBlue),IYEL=S(tInYellow),IWHT=S(tInWhite);
  const lights=[]; const Lt=(p,c,d,pow='gen',fl=null)=>lights.push({p,c,d,pow,fl});
  const bulbAt=(x,y,z,warm=true,pw=true)=>{ mk(cyl(.004,.004,WH-y-.06,3,{at:[0,(WH-y)/2,0]}),mBlack,G,x,y,z); const n=mk(box(.08,.1,.08),M(null,{color:warm?0xffd8a0:0xe8f0ff,unlit:true}),G,x,y,z); if(pw) powered(n,.9,4); else n._keep=true; return n; };

  /* ================= ground: streets, sidewalks, yards, floors ================= */
  floor(B,-13,-2,-10.2,2,tDust,{tile:2,color:0x8a8070});
  floor(B,-10.2,-15,-5.2,9.5,tRoad,{tile:2.4}); floor(B,-23,9.5,23,14,tRoad,{tile:2.4});
  const walk=(x0,z0,x1,z1)=>{ const w=x1-x0,d=z1-z0; mk(box(w,.07,d),F(MT(tWalkCo,{repeat:[w/1.2,.1]}),MT(tWalkCo,{repeat:[w,d]}),MT(tWalkCo,{repeat:[w/1.2,.1]}),MT(tWalkCo,{repeat:[w,d]}),MT(tWalkCo,{repeat:[w/1.2,.1]})),G,(x0+x1)/2,.035,(z0+z1)/2); };
  walk(-10.2,-15,-9.4,-2); walk(-10.2,2,-9.4,9.5); walk(-6.0,-14,-5.2,9.5); walk(-23,9.5,-10.2,10.2); walk(-5.2,9.5,8,10.2); walk(10,9.5,17,10.2); walk(-23,13.3,23,14);
  for(const [x,z,s,ry] of [[-7.4,-6.5,1.4,.3],[-8.2,3.8,1.1,1.2],[-3,12.2,1.6,.2],[12.5,11.4,1.2,2],[-17,11.8,1.3,.8],[9,-3,.9,0],[15,-11,1.5,.5]]) mk(plane(s*1.6,s),MT(tPuddleCo,{cut:true}),G,x,.012,z,-Math.PI/2,0,ry);
  floor(B,-5.2,-14,-1,-5.5,tFlConc,{tile:2,color:0x9a9488}); floor(B,-5.2,-5.5,-1,5.6,tFlConc,{tile:2}); floor(B,-1,4,8,5.6,tDust,{tile:2,color:0x8a8070});
  floor(B,-1,-14,4,-8.5,tTileFloor,{tile:.9,color:0xc8b8a0}); floor(B,4,-14,8,-8.5,tFlConc,{tile:2,color:0x8a8a84}); floor(B,-1,-8.5,8,-5.5,tFlTerra,{tile:.8,color:0xb8a090});
  floor(B,-1,-5.5,3.4,.2,tTileFloor,{tile:.9}); floor(B,-1,.2,3.4,4,tFlTerra,{tile:.8,color:0xc8a898});
  floorHole(B,3.4,-5.5,8,-.8,STASH_SHAFT[0]-.55,STASH_SHAFT[1]-.55,STASH_SHAFT[0]+.55,STASH_SHAFT[1]+.55,tFlConc,{tile:2}); floor(B,3.4,-.8,8,4,tFlTerra,{tile:.8,color:0xa88878});
  floor(B,-5.2,5.6,2.5,9.5,tTileFloor,{tile:.9,color:0xd8d0c0}); floor(B,8,-14,10,9.5,tRoad,{tile:2.4,color:0xb8a898});
  floor(B,10,-4.5,17,4,tDust,{tile:2,color:0xa09888}); floor(B,10,-15,23,-4.5,tDust,{tile:2,color:0x8a7c68}); floor(B,17,-4.5,23,9.5,tDust,{tile:2,color:0x8a7c68});

  /* ================= the solid blocks around it all ================= */
  solidBlock(B,-23,-15,-10.2,-2,{paint:tCbOchre,h:2.9,dish:true,faces:{e:[['door',-13],['lit',-11.4],['shutter',-7.2,2.6],['sign',-7.2,{t:tSignTort,w:2.6,h:.5}],['win',-4.6],['tag',-9.4,1],['meter',-12.2],['poster',-5.6,tPosterVote]]}});
  solidBlock(B,-23,-2,-13,2,{paint:tCbBlue,h:2.9,parapet:false,tinaco:false});
  solidBlock(B,-23,2,-10.2,9.5,{paint:tCbViolet,h:2.8,faces:{e:[['tv',3.9],['rdoor',5.8],['poster',7.2,tPosterLucha],['lit2',8.4]],s:[['win',-21],['door',-18.4],['lit',-16.4],['tag',-13.8,0],['ac',-12]]}});
  solidBlock(B,-24,9.5,-23,14,{paint:tCbWhite,h:3.1,parapet:false,tinaco:false});
  solidBlock(B,-10.2,-16,-5.2,-15,{paint:tCbRaw,h:2.6,parapet:false,tinaco:false,faces:{s:[['shutter',-7.7,3.6],['tag',-9.5,4]]}});
  solidBlock(B,-5.2,-16,10,-14,{paint:tCbLime,h:2.8,tinaco:false});
  solidBlock(B,2.5,5.6,8,9.5,{paint:tCbTurq,h:2.8,faces:{s:[['lit',3.8],['door',5.4],['win',6.9]],e:[['tag',7.6,2],['meter',6.4]]}});
  solidBlock(B,10,4,17,9.5,{paint:tCbBlue,h:2.7,dish:true,faces:{s:[['door',11.6],['lit2',13.4],['win',15.4],['poster',12.6,tPosterMissing]],w:[['tag',6.5,3]]}});
  const south=[[-23,-15,tCbBlue,[['win',-21],['rdoor',-19],['lit',-17]]],[-15,-8,tCbOchre,[['shutter',-11.5,3],['sign',-11.5,{t:tSignRent,w:1,h:.5}]]],[-8,0,tCbWhite,[['lit2',-6.6],['door',-4.6],['tv',-2.4],['poster',-1.4,tPosterVote]]],
    [0,7,tCbLime,[['win',1.5],['door',3.3],['lit',5.4],['tag',6.2,4]]],[7,15,tCbPinkHalf,[['lit',8.8],['rdoor',10.6],['win',12.8],['meter',14]]],[15,23,tCbTurq,[['win',16.8],['door',18.6],['lit2',20.8]]]];
  for(const [x0,x1,t,fc] of south) solidBlock(B,x0,14,x1,15.8,{paint:t,h:2.7+((x0+30)%3)*.1,faces:{n:fc}});
  /* the painted night beyond the roofs */
  for(const [x,z,len,ry] of [[0,-19.5,60,0],[0,19.5,60,Math.PI],[-27.5,0,40,Math.PI/2],[27.5,0,40,-Math.PI/2]]){ const n=mk(plane(len,18),MT(tBackdrop,{unlit:true,double:true,repeat:[len/22,1]}),G,x,7.6,z,0,ry,0); n._keep=true; }

  /* ================= the crew house and its courtyard ================= */
  W(-5.2,-14,-5.2,-5.5,TQ,TQ,[gap(-10.6,2.8)],{h:2.2}); W(-5.2,-14,-1,-14,TQ,TQ,[],{h:2.4}); W(-5.2,-5.5,-1,-5.5,PK,TQ,[gap(-3.9,.9)],{h:2.0});
  { const gt=N(G,-5.2,0,-12.0,0,-1.3,0); mk(box(1.4,1.9,.04,{at:[.7,.95,0]}),MT(tCorrBlue,{repeat:[1.2,1]}),gt); const g2=N(G,-5.2,0,-9.2,0,1.25,0); mk(box(1.4,1.9,.04,{at:[-.7,.95,0]}),MT(tCorrBlue,{repeat:[1.2,1]}),g2); }
  place(B,'auto',-3.1,-11.4,0,0x26282e,'suv'); addBox(-4.0,-2.2,-13.7,-9.1,0,1.4,'furn');
  place(B,'strings',0,0,0,[[-5.1,-7],[-2.6,-8.6],[-1.1,-6.4],[-3.8,-12.8]]); place(B,'pchair',-4.4,-6.4,2.4); place(B,'pchair',-3.6,-6.1,3.4); place(B,'bucketplant',-1.4,-13.6,0,0x2e6a2e,1); place(B,'bucketplant',-1.8,-13.6,0,0x4a8a3a,2);
  place(B,'tires',-4.8,-13.6,0,3,4); addBox(-5.15,-4.45,-13.95,-13.25,0,.6,'furn');
  W(-1,-14,-1,-5.5,PEACH,VI,[win(-12.0,1.1),door(-7.0,.95,-1.3,{doorT:tSteelDoor})]); W(8,-14,8,-5.5,VI,IWHT,[win(-11.2,.9),door(-7.0,.95,1.3,{doorT:tSteelDoorR})]);
  W(-1,-14,8,-14,PEACH,VI); W(-1,-8.5,8,-8.5,IWHT,PEACH,[gap(1.2,1.2),door(6.0,.9,1.3)]); W(4,-14,4,-8.5,IWHT,PEACH,[]);
  W(-1,-5.5,8,-5.5,MINT,PEACH); /* shared with the stash house */
  mk(box(9.3,.2,8.8),MT(tCbRaw),G,3.5,WH+.1,-9.75); addBox(-1,8,-14,-5.5,WH,WH+.2,'ceil');
  for(const [cx,cz,len,ry] of [[3.5,-14,9,0],[3.5,-5.5,9,0],[-1,-9.75,8.5,Math.PI/2],[8,-9.75,8.5,Math.PI/2]]) place(B,'parapet',cx,cz,ry,len).p[1]=WH+.2;
  place(B,'tinaco',6.4,-12.4).p[1]=WH+.2; place(B,'satdish',.2,-13.3,2.2).p[1]=WH+.2; place(B,'laundry',3,-10,0,5).p[1]=WH+.2;
  /* the sala: a sofa, the TV, beer cans */
  { const tv=powered(place(B,'crt',-.55,-11.5,Math.PI/2),.5,10); addBox(-.95,-.45,-11.9,-11.1,0,1.0,'furn'); }
  place(B,'sofa',2.3,-11.5,-Math.PI/2,0x5a3a2a,2.0); addBox(1.85,2.75,-12.55,-10.45,0,.9,'furn'); place(B,'coffee',1.2,-11.5,Math.PI/2); addBox(.9,1.5,-12.05,-10.95,0,.45,'furn');
  place(B,'bottles',1.2,-11.5,0,4,9).p[1]=.43; place(B,'mattress',2.4,-13.4,0); place(B,'poster',-.93,-9.5,Math.PI/2,tPosterLucha).p[1]=1.5;
  /* the guns room: a table with the shotgun, bunks on the floor, ammo crates */
  place(B,'table',6.3,-13.25,0,1.4,.6,0x5a4a3a); addBox(5.6,7.0,-13.55,-12.95,0,.8,'furn'); place(B,'crates',7.4,-9.3,0); addBox(6.9,7.95,-9.8,-8.75,0,1.1,'furn');
  place(B,'mattress',5.0,-10.6,Math.PI/2); place(B,'stash',4.6,-13.5,0); addBox(4.15,5.05,-13.8,-13.2,0,1.3,'furn');
  /* the hall */
  place(B,'fridge',7.55,-6.0); addBox(7.2,7.95,-6.4,-5.6,0,1.8,'furn'); place(B,'counter',3.3,-5.85,Math.PI,1.6,tCabinetW,tCounterTop,{sink:.4,stove:-.4,upper:false}); addBox(2.45,4.15,-6.2,-5.5,0,.92,'furn');
  bulbAt(3.4,2.3,-7.0); Lt([3.4,2.25,-7.0],[1.4,1.0,.55],5); bulbAt(6,2.3,-11.4); Lt([6,2.25,-11.4],[1.3,.95,.55],4.5); Lt([-.4,1.0,-11.5],[.5,.65,1.3],4.5,'gen','tv');
  Lt([-3,2.4,-9.6],[1.3,.9,.5],5.5);

  /* ================= the stash house and its yard ================= */
  W(-5.2,-5.5,-5.2,5.6,RAW,PKH,[gap(-3.8,1.0),gap(3.0,2.4)],{h:1.9});
  { const gt=N(G,-5.2,0,1.8,0,Math.PI/2+1.1,0); mk(box(2.3,1.8,.05,{at:[1.15,.9,0]}),MT(tCorrug,{repeat:[2,1]}),gt); }
  { const r=rng(31); for(let i=0;i<7;i++) mk(box(.3+r()*.2,.12+r()*.1,.2),MT(tCbRaw),G,-5.2+(r()-.5)*.9,.06+r()*.05,-3.8+(r()-.5)*1.2,r()*.3,r()*3,0); } /* rubble in the gap */
  W(-5.2,5.6,2.5,5.6,IYEL,PKH); /* the yard's south wall, the store's north wall */
  W(-1,-5.5,-1,4,PEACH,PK,[win(-4.3,1.1),door(-2.0,.95,-1.5,{doorT:tSteelDoor}),win(2.4,1.0)]);
  W(8,-5.5,8,4,PK,IBLUE,[door(-2.5,.95,1.2,{doorT:tSteelDoorR}),win(1.6,1.0)]);
  W(-1,4,8,4,PK,IYEL,[door(1.2,.95,1.25)]);
  W(-1,.2,3.4,.2,IYEL,PEACH,[gap(.3,1.3)]); W(3.4,-5.5,3.4,4,MINT,PEACH,[door(-2.3,.95,-1.3),gap(2.4,.95)]); W(3.4,-.8,8,-.8,IBLUE,MINT,[door(6.6,.95,1.3)]);
  for(const [x,z,ry] of [[-1.02,-4.3,-Math.PI/2],[-1.02,2.4,-Math.PI/2],[8.02,1.6,Math.PI/2]]) place(B,'bars',x,z,ry,1.05);
  mk(box(9.3,.2,9.8),MT(tCbRaw),G,3.5,WH+.1,-.75); addBox(-1,8,-5.5,4,WH,WH+.2,'ceil');
  for(const [cx,cz,len,ry] of [[3.5,4,9,0],[-1,-.75,9.5,Math.PI/2],[8,-.75,9.5,Math.PI/2]]) place(B,'parapet',cx,cz,ry,len).p[1]=WH+.2;
  place(B,'tinaco',1.0,-3.6).p[1]=WH+.2; place(B,'gascyl',5,2.8).p[1]=WH+.2; place(B,'rebarTuft',-1,4,0,7).p[1]=WH+.2; place(B,'rebarTuft',8,4,0,8).p[1]=WH+.2;
  place(B,'wire',0,0,0,[-8.6,6.5],[-1,3.9],5.6); place(B,'wire',0,0,0,[-8.6,-8],[-1,-6],5.6);
  /* the yard: generator and its kill switch, laundry, a chair, gas */
  const gen=powered(place(B,'generator',STASH_GEN[0],STASH_GEN[1],0),.75,25); const gb=addBox(STASH_GEN[0]-.47,STASH_GEN[0]+.47,STASH_GEN[1]-.3,STASH_GEN[1]+.3,0,1.0,'generator'); gb.onHit=()=>stashPower(false);
  { const x=STASH_SW[0],y=STASH_SW[1],z=STASH_SW[2]; mk(box(.13,.15,.025),M(null,{color:0x161618}),G,x,y,z-.012); mk(box(.08,.02,.01),M(null,{color:0xd8d4cc}),G,x,y+.095,z-.002);
    const lv=N(G,x,y-.02,z+.012); lv.live=true; mk(box(.022,.085,.022,{at:[0,.042,0]}),M(null,{color:0xb81a14}),lv); mk(box(.03,.03,.03),M(null,{color:0xb81a14}),lv,0,.085,0); FLOOR.lever=lv; stashLever(); }
  place(B,'gascyl',-1.5,-5.15); place(B,'gascyl',-1.9,-5.2); place(B,'laundry',-3.4,2.2,Math.PI/2,3.4); place(B,'pchair',-1.6,4.9,2.6); place(B,'bricksPile',-4.6,4.9,0,10,11); addBox(-5.15,-3.95,4.55,5.5,0,.4,'furn');
  place(B,'bucketplant',-4.9,-1.0,0,0x3a7a3a,3); place(B,'tires',-4.8,-5.0,0,2,9);
  bulbAt(-1.3,2.3,-1.0); Lt([-1.5,2.25,-1.0],[1.4,.95,.5],5.2);
  /* the count */
  place(B,'counttable',.9,-3.0,Math.PI/2); addBox(.42,1.38,-3.92,-2.08,0,.8,'furn');
  for(const [x,z,ry] of [[.2,-3.0,Math.PI/2],[1.6,-3.6,-Math.PI/2]]) place(B,'pchair',x,z,ry);
  { const l=N(G,STASH_LEDGER[0],STASH_LEDGER[1]-.035,STASH_LEDGER[2],0,.3,0); l.live=true; FX.ledger(l); FLOOR.ledgerN=l; }
  powered(place(B,'crt',2.95,-.15,Math.PI),.5,10); addBox(2.58,3.32,-.42,.16,0,1.0,'furn');
  place(B,'mattress',-.1,-4.95,0); place(B,'bricksPile',2.7,-5.0,0,16,5); addBox(2.1,3.3,-5.45,-4.6,0,.5,'furn'); place(B,'safe',-.6,-.4,Math.PI/2); addBox(-.95,-.35,-.8,0,0,1.6,'furn');
  place(B,'poster',-.93,-1.0,Math.PI/2,tPosterLucha).p[1]=1.5;
  bulbAt(1.0,2.2,-3.0); Lt([1.0,2.15,-3.0],[1.45,1.05,.6],5.5);
  /* kitchen */
  place(B,'counter',.6,3.62,Math.PI,2.2,tCabinetW,tCounterTop,{sink:.5,stove:-.5,upper:false}); addBox(-.5,1.7,3.3,3.95,0,.92,'furn');
  place(B,'fridge',2.9,3.55,Math.PI); addBox(2.5,3.3,3.15,3.95,0,1.8,'furn'); place(B,'gascyl',-.7,3.6);
  place(B,'table',1.4,2.0,0,1.0,.7,0xd8d4cc); addBox(.88,1.92,1.63,2.37,0,.77,'furn'); place(B,'pchair',1.4,1.35,0); place(B,'pchair',1.4,2.7,Math.PI); place(B,'bottles',1.4,2.0,0,3,12).p[1]=.78;
  { const t=mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,1.2,WH-.04,2.0); powered(t,.6,4); } Lt([1.2,2.45,2.0],[1.0,1.1,1.05],5);
  /* the shaft room */
  place(B,'shaft',STASH_SHAFT[0],STASH_SHAFT[1]); place(B,'sandbags',7.6,-5.0,Math.PI/2,6); place(B,'crates',4.0,-5.0,0); addBox(3.55,4.6,-5.45,-4.55,0,1.1,'furn');
  place(B,'bricksPile',4.3,-1.3,0,12,7); addBox(3.7,5.0,-1.55,-.85,0,.4,'furn');
  bulbAt(5.2,2.15,-2.6); Lt([5.2,2.1,-2.6],[1.4,1.0,.55],4.5);
  /* the bedroom: two mattresses, the altar and its candles */
  place(B,'mattress',4.6,3.2,0); place(B,'mattress',6.7,3.2,0); place(B,'altar',7.6,1.6,-Math.PI/2); addBox(7.3,7.95,1.0,2.2,0,.8,'furn');
  Lt([7.3,1.1,1.6],[1.1,.55,.22],3.2,'city','candle');
  /* the back door bulb */
  bulbAt(8.25,2.35,-2.5); Lt([8.4,2.3,-2.5],[1.4,.95,.5],4.5);

  /* ================= the corner store ================= */
  W(-5.2,5.6,-5.2,9.5,IYEL,CR,[door(7.5,1.1,-1.3,{doorT:tSteelDoor})]); W(-5.2,9.5,2.5,9.5,CR,IYEL,[win(-3.6,1.6)]); W(2.5,5.6,2.5,9.5,TQ,IYEL);
  mk(box(7.9,.2,4.1),MT(tCbRaw),G,-1.35,WH+.1,7.55); addBox(-5.2,2.5,5.6,9.5,WH,WH+.2,'ceil');
  { const n=N(G,-5.27,2.3,7.55,0,-Math.PI/2,0); n._keep=true; mk(plane(3.2,.8),MT(tSignShop,{unlit:true}),n,0,0,.01); }
  { const n=N(G,.2,0,9.565,0,0,0); FX.shutter(n,3.4); }
  place(B,'counter',-3.4,8.9,0,2.6,tCabinetW,tCounterTop,{upper:false}); addBox(-4.7,-2.1,8.55,9.3,0,.92,'furn');
  for(const z of [6.2,7.4]) { place(B,'bookcase',1.9,z,-Math.PI/2,1.0,1.8); addBox(1.65,2.5,z-.5,z+.5,0,1.8,'furn'); }
  place(B,'fridge',-.4,5.95,0,true); addBox(-.85,.05,5.6,6.35,0,1.8,'furn'); { const g=mk(plane(.8,1.5),M(null,{color:0x8ab0c0,unlit:true}),G,-.4,.95,6.33); g._keep=true; } Lt([-.4,1.0,6.7],[.35,.5,.6],2.6,'city');
  place(B,'crates',-4.6,6.2,0); addBox(-5.15,-4.05,5.65,6.75,0,1.1,'furn'); place(B,'bottles',-3,8.9,0,5,21).p[1]=.93;
  { const t=mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,-1.5,WH-.04,7.5); t._keep=true; } Lt([-1.5,2.45,7.5],[.95,1.05,1.05],5,'city');

  /* ================= the back alley ================= */
  W(8,-14,10,-14,RAW,RAW,[],{h:2.4});
  place(B,'corrfence',10,-11.75,Math.PI/2,4.5,1.9,tCorrug); place(B,'corrfence',10,-6.5,Math.PI/2,3.9,1.9,tCorrBlue);
  { const s=N(G,10.1,0,-9.0,0,Math.PI/2+.6,0); mk(box(1.0,1.8,.03,{at:[.5,.9,0]}),MT(tCorrug,{repeat:[1,1]}),s); } /* a sheet bent back: the way into the lot */
  for(const [z0,z1] of [[-14,-9.55],[-8.45,-4.5]]) addBox(9.95,10.05,z0,z1,0,1.9,'wall');
  place(B,'bins',8.4,-13.4,0,2); addBox(8.05,9.5,-13.75,-13.05,0,1.05,'furn'); place(B,'trashbags',9.4,-7.8,0,3,5); place(B,'pallet',9.5,6.8,Math.PI/2); place(B,'trashbags',8.5,8.8,0,2,8);
  place(B,'wire',0,0,0,[8,-10],[10,-2],5.8); place(B,'wire',0,0,0,[8,2],[10,6],5.6);

  /* ================= the obra negra: a house nobody finished ================= */
  W(10,-4.5,10,4,RAW,RAW,[gap(-2.6,1.2),hole(1.6,1.4)],{h:2.6}); W(10,-4.5,17,-4.5,RAW,RAW,[gap(15.2,1.4),hole(12,1.2)],{h:2.6});
  W(17,-4.5,17,4,RAW,RAW,[gap(.4,1.3),hole(2.6,1.0)],{h:1.9}); W(10,4,17,4,RAW,RAW,[],{h:2.6}); W(13.5,-4.5,13.5,4,RAW,RAW,[gap(-.4,1.6)],{h:1.8});
  mk(box(3.7,.18,8.7),MT(tCbRaw),G,11.75,2.69,-.25); addBox(10,13.5,-4.5,4,2.6,2.8,'ceil');
  for(let z=-4.2;z<4;z+=1.2) place(B,'rebarTuft',13.6,z,0,z*11|0).p[1]=2.7; for(const [x,z] of [[17,-4.5],[17,4],[13.5,4]]) place(B,'rebarTuft',x,z,0,x+z|0).p[1]=1.9;
  place(B,'sandpile',15.4,2.4); addBox(14.6,16.2,1.7,3.1,0,.35,'furn'); place(B,'cinders',11.3,3.3,0,8,7); addBox(10.8,11.8,3.0,3.6,0,.4,'furn');
  place(B,'wheelbarrow',15.2,-2.6,.6); addBox(14.8,15.7,-3.2,-2.0,0,.7,'furn'); place(B,'scaffold',15.3,-4.05,0,2.8,2.2); addBox(13.9,16.7,-4.4,-3.2,0,2.2,'furn');
  place(B,'mattress',11.8,-3.6,0); place(B,'bottles',12.4,-3.0,0,6,15); place(B,'pallet',16.2,.8,.2); place(B,'rebar',14.2,2.2,0,6,3);
  { const tp=mk(box(3.6,.02,3.8),MT(tTarp,{double:true}),G,15.3,2.1,1.6,.08,0,0); }
  /* someone sleeps here: a camping lantern on a crate, low on batteries */
  place(B,'crates',11.0,-4.0,0); addBox(10.5,11.55,-4.45,-3.5,0,1.1,'furn'); { const n=N(G,11.0,1.12,-4.0); n._keep=true; mk(box(.1,.16,.1),M(null,{color:0xffe0a0,unlit:true}),n,0,.08,0); mk(box(.12,.03,.12),mIron,n,0,.17,0); } Lt([11.0,1.4,-3.8],[.9,.65,.3],3.6,'city','candle');

  /* ================= the lot ================= */
  place(B,'chainlink',16.5,-15,0,13); addBox(10,23,-15.05,-14.95,0,1.5,'wall'); place(B,'chainlink',23,-2.75,Math.PI/2,23.5); place(B,'chainlink',23,11.75,Math.PI/2,4.5); addBox(22.95,23.05,-15,14,0,1.5,'wall');
  place(B,'auto',19.4,-11.2,.25,0x6a4a3a,'sedan',{burnt:true}); addBox(18.3,20.5,-13.4,-9.0,0,1.15,'furn'); place(B,'auto',13.0,-12.3,1.9,0x4a6a5a,'pickup',{hub:false,plate:'CHI'}); addBox(10.6,15.4,-13.4,-11.2,0,1.3,'furn');
  place(B,'barrelfire',16,-9); addBox(15.7,16.3,-9.3,-8.7,0,.9,'furn'); Lt([16,1.3,-9],[1.9,.85,.32],6.5,'city','fire');
  place(B,'tires',20.8,-6.0,0,4,3); addBox(20.45,21.15,-6.35,-5.65,0,.8,'furn'); place(B,'tires',12.3,-6.4,0,2,6); place(B,'kennel',21.6,-13.6,.3); addBox(20.8,22.4,-14.2,-13.0,0,1.05,'furn');
  place(B,'mattress',18.6,-6.2,.4); place(B,'trashbags',21.6,2.0,0,4,11); place(B,'trashbags',12,-14,0,3,12); place(B,'pallet',20.6,6.8,.4); place(B,'bottles',16.9,-7.9,0,6,17);
  for(const [x,z] of [[15.2,-9.6],[16.8,-9.5]]) place(B,'cinders',x,z,0,2,x|0);
  place(B,'pchair',15.1,-8.3,2.2);

  /* ================= the street: cars, the taco cart, the poles and lights, the shrine ================= */
  place(B,'auto',-9.0,-6.5,0,0xd8d4cc,'sedan',{door:0x9a2a24,plate:'EKT'}); addBox(-9.85,-8.15,-8.6,-4.4,0,1.3,'furn');
  place(B,'auto',4.6,11.6,Math.PI/2,0x8a3a2a,'pickup',{hub:false}); addBox(2.15,7.05,10.7,12.5,0,1.4,'furn');
  place(B,'auto',-15.5,12.6,-Math.PI/2,0x3a5a8a,'sedan',{plate:'DWR'}); addBox(-17.6,-13.4,11.75,13.45,0,1.3,'furn');
  place(B,'tacocart',-6.1,-11.0,Math.PI/2); addBox(-6.5,-5.7,-11.8,-10.2,0,1.0,'furn'); place(B,'pchair',-7.0,-11.6,.4); place(B,'pchair',-7.6,-12.4,1.4); Lt([-5.9,1.65,-11.3],[1.4,1.05,.55],4.5,'city');
  place(B,'pchair',-5.7,5.2,Math.PI*.9); place(B,'bins',-9.85,6.5,Math.PI/2,2); addBox(-10.2,-9.45,6.15,7.6,0,1.05,'furn'); place(B,'trashbags',-9.8,-13.6,0,4,2);
  for(const [x,z,ry] of [[-9.9,-8,0],[-9.9,6.5,0]]){ place(B,'sodium',x,z,ry,1.4); addBox(x-.12,x+.12,z-.12,z+.12,0,6,'furn'); Lt([x+1.4,5.85,z],[2.0,1.05,.38],12,'city','buzz'); }
  for(const [x,z,ry] of [[6,13.85,Math.PI/2],[-17,13.85,Math.PI/2]]){ place(B,'sodium',x,z,ry,1.4); addBox(x-.12,x+.12,z-.12,z+.12,0,6,'furn'); Lt([x,5.85,z-1.4],[2.0,1.05,.38],12,'city','buzz'); }
  for(const [x,z] of [[-5.5,-13.6],[9.7,9.9],[-12,9.9]]) { place(B,'pole',x,z,0,7); addBox(x-.13,x+.13,z-.13,z+.13,0,6,'furn'); }
  place(B,'wire',0,0,0,[-9.9,-8],[-9.9,6.5],6.6); place(B,'wire',0,0,0,[-9.9,6.5],[-17,13.85],6.6); place(B,'wire',0,0,0,[-9.9,6.5],[6,13.85],6.5); place(B,'wire',0,0,0,[6,13.85],[9.7,9.9],6.4);
  place(B,'wire',0,0,0,[-9.9,-8],[-5.5,-13.6],6.5); place(B,'wire',0,0,0,[-5.5,-13.6],[3,-14],6.2); place(B,'wire',0,0,0,[9.7,9.9],[20,9.5],6.4);
  place(B,'shrine',-22.55,11.8,Math.PI/2); addBox(-23,-22.3,11.3,12.3,0,1.85,'furn'); Lt([-22.2,1.0,11.8],[1.2,.7,.3],3.4,'city','candle');
  { const n=N(G,-6.4,0,-14.93,0,0,0); mk(plane(1.4,.36),MT(tSignNoTrash),n,0,1.6,.01); }

  /* ================= dressing: the concrete frames, drums, trees, curtains, what's on the ground ================= */
  frameBox(B,-1,-14,8,-5.5,WH+.2,{extra:[[3.5,-14],[3.5,-5.5],[-1,-9.75],[8,-9.75]]}); frameBox(B,-1,-5.5,8,4,WH+.2,{extra:[[3.5,4],[-1,-.75],[8,-.75]]});
  frameBox(B,-5.2,5.6,2.5,9.5,WH+.2,{extra:[[-1.4,9.5]]}); frameBox(B,10,-4.5,17,4,2.6,{band:false,rebar:true,extra:[[13.5,-4.5],[13.5,4],[10,0],[17,0]]});
  for(const [x,z] of [[-5.2,-14],[-5.2,-10.6+1.4],[-5.2,-10.6-1.4],[-5.2,1.8],[-5.2,4.2],[-5.2,-5.5],[-5.2,5.6]]) mk(box(.22,2.1,.22),mBand,G,x,1.05,z); /* gate posts and wall ends */
  for(const [x,z,c] of [[-4.75,-2.0,0xffffff],[-4.75,-1.35,0xc8d8ff],[-1.6,-13.55,0xffffff],[9.55,3.2,0xffffff],[9.55,2.6,0xb8c8e8],[20.5,7.6,0xffffff],[-9.75,-12.3,0xffffff]]){ place(B,'tambo',x,z,0,c); addBox(x-.3,x+.3,z-.3,z+.3,0,.9,'furn'); }
  place(B,'mesquite',20.6,-2.4,0,3); addBox(20.4,20.8,-2.6,-2.2,0,2,'furn'); place(B,'mesquite',12.4,8.0,0,5); place(B,'mesquite',-20.6,10.4,0,8); addBox(-20.8,-20.4,10.2,10.6,0,2,'furn');
  place(B,'palm',-12.0,13.2,0,6.5,4); addBox(-12.2,-11.8,13.0,13.4,0,3,'furn'); place(B,'palm',16.6,13.3,0,5.5,6); addBox(16.4,16.8,13.1,13.5,0,3,'furn');
  /* cloth curtains in the inside doorways */
  for(const [x,z,ry,w,t] of [[1.2,-8.5,0,1.2,tCurtACo],[.3,.2,0,1.3,tCurtBCo],[3.4,2.4,Math.PI/2,.95,tCurtCCo],[6.0,-8.5,0,.9,tCurtBCo]]){ const n=N(G,x,0,z,0,ry,0); n.live=true; FX.curtain(n,w,1.75,t); }
  for(const [x,z,ry,t] of [[-.93,-10.0,Math.PI/2,tCalendarCo],[3.32,-4.2,-Math.PI/2,tCalendarCo],[-4.0,9.43,Math.PI,tPosterVote]]) place(B,'poster',x,z,ry,t).p[1]=1.45;
  /* on the ground */
  for(const [x,z,s_,ry,t] of [[-7.8,-3.5,1.2,.4,tOilCo],[-8.8,4.6,1.0,1.4,tOilCo],[2.0,12.1,1.4,0,tOilCo],[-3.1,-11.4,1.3,.2,tOilCo],[13.4,-12.0,1.6,1.0,tOilCo],
    [-7.2,-9,2.2,.3,tCrackCo],[-8.6,8,1.8,1.1,tCrackCo],[-14,11.2,2.4,.6,tCrackCo],[6,11,2,2.1,tCrackCo],[12,-1,1.6,.5,tCrackCo],[-3,1.2,1.4,1.3,tCrackCo]]) place(B,'decal',x,z,0,t,s_,s_,ry);
  for(const [x,z,len,ry] of [[-7.7,-5,9,0],[-8.4,3,8,0],[-2,11.8,16,Math.PI/2],[14,11.6,10,Math.PI/2]]) place(B,'decal',x,z,0,tTrackCo,1.6,len,ry);
  for(const [x,z,n,sd,sp] of [[-8,-12,10,1,1.6],[-7.8,6,8,2,1.4],[-17,11.8,10,3,2],[0,12.4,9,4,2],[9,-6,10,5,.8],[9,4,8,6,.8],[18,-8,14,7,3],[14,-12.5,10,8,2.5],[12,0,8,9,1.5],[20,4,10,10,2.5],[-12,-1,5,11,.9]])
    place(B,'litter',x,z,0,n,sd,sp);
  for(const [x0,x1,z] of [[-23,-13,10.2],[-4,2,10.2],[10,13,10.2]]){ const w=x1-x0; mk(box(w,.072,.05),col(0xc8a830),G,(x0+x1)/2,.036,z+.02); } /* painted curb */
  place(B,'wire',0,0,0,[-9.9,6.5],[-10.2,4.0],5.4); place(B,'wire',0,0,0,[-9.9,-8],[-10.2,-11.4],5.4); place(B,'wire',0,0,0,[-9.9,-8],[-5.2,-10],5.2); place(B,'wire',0,0,0,[6,13.85],[3.8,9.5],5.0); place(B,'wire',0,0,0,[9.7,9.9],[11.6,9.5],4.8);
  place(B,'wire',0,0,0,[-5.5,-13.6],[-1,-12],5.0); place(B,'wire',0,0,0,[-17,13.85],[-18.4,9.5],5.2); place(B,'wire',0,0,0,[-17,13.85],[-21,14],5.6);
  GEO_TEMP=false;
  /* ================= navigation ================= */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i; const R_=STASH_RECTS.find(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]); if(!R_) continue;
    space[id]=STASH_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])?.[4]??R_[4];
    let bl=Math.hypot(x-STASH_SHAFT[0],z-STASH_SHAFT[1])<.9; if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.4) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const U=(id,apt,x0,z0,x1,z1,win)=>({id,side:z0<0?-1:1,x0,x1,z0,z1,w:x1-x0,apt,door:x0,room:true,lit:true,win});
  const units=[U(0,'COUNT',-1,-5.5,3.4,.2,[-1,-4.3]),U(1,'KITCHEN',-1,.2,3.4,4,[-1,2.4]),U(2,'SHAFT',3.4,-5.5,8,-.8,[8,-2.5]),U(3,'BED',3.4,-.8,8,4,[8,1.6]),U(5,'YARD',-5.2,-5.5,-1,5.6,[-5.2,3]),
    U(8,'COURT',-5.2,-14,-1,-5.5,[-5.2,-10.6]),U(9,'SALA',-1,-14,4,-8.5,[-1,-12]),U(10,'GUNS',4,-14,8,-8.5,[8,-11.2]),U(12,'STORE',-5.2,5.6,2.5,9.5,[-5.2,7.5]),U(7,'ALLEY',8,-14,10,9.5,null),
    U(13,'OBRA',10,-4.5,17,4,[10,1.6]),U(15,'LOT',10,-15,23,-4.5,null)];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.6,z:0,yaw:-Math.PI/2},lights:[]});
  LM.list=lights;
  const st=batchStatic(G); FLOOR.batch=st;
  stashLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }

/* dark: no moon to speak of. Everything you see is lit by something: sodium lamps, bulbs, the TV, the fire, candles */
const STASH_LIGHT={amb:[.017,.017,.024],dir:[.3,1,.2],dirCol:[.022,.024,.04],fog:[.016,.012,.013],fogNear:7,fogFar:40}; /* fog with a little sodium in it: the city's glow */
function stashLights(){ setLights(Object.assign({},STASH_LIGHT,{pl:[]})); if(FLOOR.power===false) L.amb=[.01,.011,.018]; lmTick(); }
function stashPower(on,quiet){ if(FLOOR.mode!=='stash'||FLOOR.power===on) return; FLOOR.power=on; stashLever();
  if(!on){ FLOOR.offT=GAME.t;
    if(quiet){ /* the engine coughs and dies: they know the power's gone, not that you're here. The nearest two go and look */
      sfx('click',.9); sfx('slowout',.45); const g=navSnap(STASH_SW[0],STASH_SW[2]+.9),gd=E=>Math.hypot(E.pos[0]-g[0],E.pos[1]-g[1]);
      const up=enemies.filter(E=>upright(E)&&!E.aware&&gd(E)<14).sort((a,b)=>gd(a)-gd(b));
      up.forEach((E,i)=>setTimeout(()=>{ if(!upright(E)||E.aware) return; if(i<2){ investigate(E,g); if(i===0) say(E,[ES('¿Quién apagó la planta?','Who shut off the generator?'),ES('Ahorita la prendo.','I\'ll get it going.')],2.4); }
        else { if(E.st==='idle') E.st='alert'; startSearch(E,E.pos.slice(),'inv'); if(i===2) say(E,[ES('¡Se fue la luz!','The lights went out!'),ES('¡Memo! ¿Qué ves?','Memo! What do you see?')],2.4); } },300+i*350+Math.random()*400)); }
    else { sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead&&Math.hypot(E.pos[0]-STASH_GEN[0],E.pos[1]-STASH_GEN[1])<20){ setTimeout(()=>{ if(!E.dead){ E.aware=true; E.mind='hunt'; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick([ES('¡Se fue la luz!','The lights went out!'),ES('¿Quién apagó la planta?','Who shut off the generator?'),ES('¡Memo! ¿Qué ves?','Memo! What do you see?')]),2.4); } },200+Math.random()*900); } }
    stashGoal('power'); }
  else { sfx('click',.9); sfx('slowin',.35); }
  stashLights(); visionApply(); }
function stashLever(){ if(FLOOR.lever) FLOOR.lever.r=[FLOOR.power===false?2.2:-.3,0,0]; }
/* things you touch: the kill switch (fingertip in VR, G at a desk; flips back on too) and the ledger */
function stashPoke(p,h){ if(FLOOR.mode!=='stash'||PL.dead) return;
  if(FLOOR.lever){ const k=h.side+'sw',near=Math.hypot(p[0]-STASH_SW[0],p[1]-STASH_SW[1],p[2]-STASH_SW[2]-.03)<.09;
    if(near&&!stashPoke.held[k]){ stashPoke.held[k]=true; stashPower(FLOOR.power===false,true); buzz(h.hand,.7,40); } else if(!near) stashPoke.held[k]=false; }
  if(FLOOR.ledgerN&&FLOOR.ledgerN.vis&&Math.hypot(p[0]-STASH_LEDGER[0],p[1]-STASH_LEDGER[1],p[2]-STASH_LEDGER[2])<.16){ takeLedger(); buzz(h.hand,.6,60); } }
stashPoke.held={};
function takeLedger(){ if(!FLOOR.ledgerN||!FLOOR.ledgerN.vis) return; FLOOR.ledgerN.vis=false; sfx('grab',.8); stashGoal('ledger'); }
addEventListener('keydown',e=>{ if(e.code!=='KeyG'||!GAME.started||FLOOR.mode!=='stash'||PL.dead) return;
  if(Math.hypot(PL.x-STASH_SW[0],PL.z-STASH_SW[2])<1.3) stashPower(FLOOR.power===false,true);
  else if(Math.hypot(PL.x-STASH_LEDGER[0],PL.z-STASH_LEDGER[2])<1.4) takeLedger(); });
/* what you've done here: shown on the HUD tag, and as a line in the headset */
const STASH_GOALS={ledger:'Took the ledger: Dale\'s name in it, and a warehouse address on the other side',power:'The generator is off',radio:'A halcón got on the radio: the block knows you\'re here'};
function stashGoal(k){ if(!FLOOR.goals) FLOOR.goals={}; if(FLOOR.goals[k]) return; FLOOR.goals[k]=true; if(XR.on) vrToast(STASH_GOALS[k],3.2); stashTag(); }
function stashTag(){ const g=FLOOR.goals||{},dead=enemies.filter(E=>E.dead).length; $('floorTag').textContent=`Stash house · ${dead}/${enemies.length} down${g.ledger?' · ledger':''}${g.power?' · lights off':''}${g.radio?' · RADIOED':''}`; }
function stashReset(){ if(FLOOR.power===false){ FLOOR.power=true; FLOOR.offT=null; stashLever(); stashLights(); } FLOOR.down=false; FLOOR.goals={}; if(FLOOR.ledgerN) FLOOR.ledgerN.vis=true;
  stashCast(); stashLoot(); visionApply(); stashTag(); if(XR.on) vrToast('Find the shaft in the stash house. The halcones have radios.',4); }
function goStash(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genStash(); buildRack(); buildBoard(); SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }
/* down the shaft: into the tunnel with whatever is in your hands */
function stashDescend(){ FLOOR.down=true; sfx('door',.5); const dead=enemies.filter(E=>E.dead).length,n=enemies.length,g=FLOOR.goals||{};
  const line=`El pozo · ${dead} of ${n} dead${g.ledger?' · ledger taken':''}${g.radio?' · they radioed it in':' · nobody radioed'}`; if(XR.on) vrToast(line,4.5);
  setTimeout(()=>{ const keepR=HANDS.R.item,keepL=HANDS.L.item; goTunnel(); equip(HANDS.R,keepR); equip(HANDS.L,keepL); $('floorTag').textContent=line; },700); }
/* a beat to walk: there and back, a few seconds' look at each end */
function patrolGoal(E,dt){ const P=E.patrol; if(P.wait>0){ P.wait-=dt; return null; } const q=P.pts[P.i];
  if(Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1])<.7||stuck(E,dt)){ P.i=(P.i+1)%P.pts.length; P.wait=rnd(2.5,5); freshGoal(E); return null; } return {x:q[0],z:q[1],sp:.85}; }
function tickStash(dt){ if(FLOOR.mode!=='stash') return;
  if(GAME.vision!=='nv') L.plCol.set([0,0,0],18); /* the goggles' torch is off when they're up */
  lmTick(); fireTick(GAME.t);
  /* a shot into the open sky hits the grid's lid: no bullet holes hanging in the air */
  for(const k of ['hole','splat']){ const D=DEC[k]; if(D.ver!==D._sv){ const n=D.length; for(let i=D.length-1;i>=0;i--){ const d=D[i]; if(d.c[1]>RH-.15&&d.n[1]<-.5) D.splice(i,1); } if(D.length!==n) D.ver++; D._sv=D.ver; } }
  /* far, calm people go dormant in 50-game.js. The man walking a beat goes back to walking it once he's calmed down */
  for(const E of enemies){ if(E.patrol&&!E.dead&&!E.aware&&E.st==='idle'&&(!E.mind||E.mind==='calm'||E.mind==='nervous')) E.st='alert'; }
  if(!GAME.started||PL.dead||FLOOR.down) return;
  /* halcones: two seconds after one sees you, he's on the radio, unless he's down first */
  for(const E of enemies){ if(!E.radio||(FLOOR.goals&&FLOOR.goals.radio)) continue; if(E.aware&&upright(E)){ E.radioT=(E.radioT||0)+dt;
      if(E.radioT>2.0){ FLOOR.radioed=true; bark(E,pick([ES('¡Ya llegaron! ¡Ya llegaron!','They\'re here! They\'re here!'),ES('¡Aquí está el policía!','The cop is here!')]),3); sfx('click',1); sfx('slowout',.4);
        for(const O of enemies) if(O!==E&&upright(O)&&!O.aware) setTimeout(()=>{ if(upright(O)&&!O.aware) setAware(O,'noise',[PL.x,PL.z]); },500+Math.random()*1500);
        stashGoal('radio'); for(const H of enemies) if(H.radio) H.radioT=-1e9; } } else if(!E.aware) E.radioT=0; }
  stashTag.t=(stashTag.t||0)-dt; if(stashTag.t<=0){ stashTag.t=.5; stashTag(); }
  if(Math.hypot(PL.x-STASH_SHAFT[0],PL.z-STASH_SHAFT[1])<.55) stashDescend(); }
