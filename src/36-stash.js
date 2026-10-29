/* =====================================================================================================
   THE STASH HOUSE: Puerto Seco, level 3. Colonia Tierra Blanca, 02:40. Dale gave Ray the address.
   The colonia, 86 x 50 m (setWorld 43,25). Ground level everywhere; the rooftops are scenery. You start in an alley on the west
   side; the stash house is at the far east end, so you cross the colonia to get there.
     main street        outside the alley. Across it, the vecindad (a tenement round a patio): a way through the middle
     the lane / arroyo  along the north edge: a dirt lane, and beside it the concrete storm canal behind a wall you can't be seen
                        over. A halcón (lookout) watches the lane. The quiet way east, to the back alley and the back door
     south street       along the south edge: the mechanic's yard, the plaza and its church, the soccer court under its floodlight
     west               the junkyard (office trailer, a man stripping a car) and the cantina (neon, a pool table, the barman)
     stash street       in front of the compound: the taco cart, a halcón at the gate
     the compound       the crew house and courtyard, the stash house and yard (generator and kill switch), the corner store,
                        the back alley (one man walking it), the half-built house, the lot with the drum fire
   Four halcones with radios: if one sees you and is still up two seconds later, the whole colonia comes for you.
   Twenty men. Weapons lying around in every side area. Climb into the shaft in the back room of the stash house.
   ===================================================================================================== */
const SDX=22; /* the compound is built in its own frame and moved east by this much */
const SL={shaft:[6.2,-3.6],gen:[-3.2,-4.95],sw:[-3.5,.76,-4.66],ledger:[.95,.81,-2.75]};
const STASH_SHAFT=[SL.shaft[0]+SDX,SL.shaft[1]], STASH_GEN=[SL.gen[0]+SDX,SL.gen[1]], STASH_SW=[SL.sw[0]+SDX,SL.sw[1],SL.sw[2]], STASH_LEDGER=[SL.ledger[0]+SDX,SL.ledger[1],SL.ledger[2]];
const ES=es;
/* walkable space: [x0,z0,x1,z1,id]. Streets, the lane and the canal are -1 (HALLWAY spawns), rooms and yards their own ids */
const STASH_RECTS=[[-13,-2,-10.2,2,-2],[-10.2,-18.5,-5.2,14,-1],[11.8,-18.5,16.8,14,-1],[-27,9.5,42.5,14,-1],[-27,-18.5,-23,14,-1],[-41,-18.5,42.5,-16,-1],[-41,-23,41,-18.5,-1],
  /* the compound (moved east by SDX) */
  ...[[-5.2,-14,-1,-5.5,8],[-1,-14,4,-8.5,9],[4,-14,8,-8.5,10],[-1,-8.5,8,-5.5,11],[-5.2,-5.5,-1,5.6,5],[-1,-5.5,3.4,.2,0],[-1,.2,3.4,4,1],[3.4,-5.5,8,-.8,2],[3.4,-.8,8,4,3],[-1,4,8,5.6,6],
    [-5.2,5.6,2.5,9.5,12],[8,-16,10,9.5,7],[10,-4.5,13.5,4,13],[13.5,-4.5,17,4,14],[10,-16,20.5,-4.5,15],[17,-4.5,20.5,9.5,15]].map(r=>[r[0]+SDX,r[1],r[2]+SDX,r[3],r[4]]),
  /* the vecindad: zaguán, patio, eight rooms, the back passage */
  [-5.2,-8.2,-3,-6.6,29],[-3,-11,10,-4,20],[10,-8.2,11.8,-6.6,29],
  [-3,-14,.25,-11,21],[.25,-14,3.5,-11,22],[3.5,-14,6.75,-11,23],[6.75,-14,10,-11,24],[-3,-4,.25,-1,25],[.25,-4,3.5,-1,26],[3.5,-4,6.75,-1,27],[6.75,-4,10,-1,28],
  /* the mechanic's yard */ [3,-1,11.8,9.5,30],
  /* the junkyard and its trailer, the cantina, its back room and parking */ [-41,-16,-27,-1,31],[-33,-6.2,-29,-3.4,32],[-37,5.5,-27,9.5,33],[-33,2,-27,5.5,33],[-37,2,-33,5.5,34],[-37,9.5,-27,14,35],
  /* the plaza, the soccer court */ [-22,15.6,-2,23.5,36],[1,16,21,24,37],[-12.5,14,-9,15.6,36],[1,14,4,16,37]];
const STASH_CAST=[
  {id:'halcon',name:'Memo',x:-5.9+SDX,z:4.7,hd:0,radio:true,extra:ES('Nomás vigilo la calle, güey—','I just watch the street, man—'),detail:'watches the corner'},
  {id:'halcon',name:'Kike',x:-7.3+SDX,z:-10.1,hd:.15,radio:true,extra:ES('Tengo quince años—','I\'m fifteen—'),detail:'watches the street'},
  {id:'halcon',name:'Tavo',x:4,z:11.7,hd:-Math.PI/2,radio:true,extra:ES('Nomás me pagan por mirar—','They just pay me to look—'),detail:'watches the south street'},
  {id:'halcon',name:'Lupe',x:2,z:-17.2,hd:-Math.PI/2,radio:true,extra:ES('Mi abuela vive aquí—','My grandmother lives here—'),detail:'watches the lane'},
  {id:'escolta',name:'Neto',x:-3.4+SDX,z:-7.6,hd:-Math.PI/2,extra:ES('Yo nomás manejo—','I just drive—'),detail:'minds the car'},
  {id:'pistolero',name:'Lalo',x:2.9+SDX,z:-10.6,hd:-Math.PI/2,extra:ES('Estaba viendo el fútbol, güey—','I was watching the game, man—'),detail:'watches TV'},
  {id:'comando',name:'Poncho',x:6.0+SDX,z:-12.4,hd:0,extra:ES('Las armas no son mías—','The guns aren\'t mine—'),detail:'keeps the guns'},
  {id:'machetero',name:'Chava',x:-2.6+SDX,z:-2.6,hd:-2.4,extra:ES('Tengo una niña de tres años—','I have a three-year-old girl—'),detail:'watches the yard'},
  {id:'pistolero',name:'Paco',x:.2+SDX,z:-2.7,hd:Math.PI/2,extra:ES('Es dinero, llévatelo—','It\'s money, take it—'),detail:'counts the money'},
  {id:'escolta',name:'Rafa',x:2.2+SDX,z:-4.0,hd:-.6,extra:ES('Yo apenas empecé—','I only just started—'),detail:'counts the money'},
  {id:'machetero',name:'Rubén',x:2.4+SDX,z:1.2,hd:0,extra:ES('Mi esposa está embarazada—','My wife is pregnant—'),detail:'eats in the kitchen'},
  {id:'comando',name:'Gera',x:4.9+SDX,z:-2.5,hd:-Math.PI/2,extra:ES('Yo no sé nada del túnel—','I don\'t know anything about the tunnel—'),detail:'guards the shaft'},
  {id:'machetero',name:'Beto',x:9+SDX,z:-12,hd:0,patrol:[[9+SDX,-15.4],[9+SDX,8.2]],extra:ES('Me obligaron, lo juro—','They made me, I swear—'),detail:'walks the back alley'},
  {id:'pistolero',name:'Memo Chico',x:12.2+SDX,z:1.2,hd:-Math.PI/2,extra:ES('Mi jefa me está esperando—','My mom is waiting for me—'),detail:'watches the alley'},
  {id:'escolta',name:'Chuy',x:16.9+SDX,z:-8.3,hd:-2.2,extra:ES('¡No dispares, tengo hijos!','Don\'t shoot, I have kids!'),detail:'warms up at the fire'},
  {id:'pistolero',name:'Nico',x:3,z:-7.5,hd:-Math.PI/2,extra:ES('Yo nomás vivo aquí—','I just live here—'),detail:'sits in the patio'},
  {id:'comando',name:'Güero',x:5.2,z:3.8,hd:Math.PI/2,extra:ES('Nomás arreglo carros—','I just fix cars—'),detail:'works on a car'},
  {id:'machetero',name:'Toño',x:-35,z:-13.0,hd:0,extra:ES('Nomás vendo partes—','I just sell parts—'),detail:'strips a car'},
  {id:'escolta',name:'Chato',x:-31,z:-7.3,hd:Math.PI/2,extra:ES('El patrón ni me paga—','The boss doesn\'t even pay me—'),detail:'minds the yard'},
  {id:'pistolero',name:'Don Lencho',x:-30.5,z:3.0,hd:0,extra:ES('Aquí nomás sirvo tragos—','I just pour drinks here—'),detail:'tends bar'}];
/* weapons lying around: [key, x, y, z, yaw] */
const STASH_LOOT=[['bottle',-6.25+SDX,1.03,-10.8,.4],['knife',-3.4+SDX,1.0,8.9,1.2],['revolver',1.2+SDX,.6,-11.3,.3],['shotgun',6.3+SDX,.86,-13.25,0],['machete',15.4+SDX,.6,2.7,2.2],
  ['pistol',18.4+SDX,1.35,-11.2,1.0],['bottle',12.5+SDX,.1,-10.6,0],['can',5.7+SDX,.95,-13.3,.4],['bigcan',6.9+SDX,.95,-13.3,-.2],
  ['revolver',-29.8,.86,-4.4,.6],['pistol',-35.4,.86,3.6,1.2],['bottle',-29.6,1.05,3.6,0],['knife',1.9,.32,-12.9,.4],['smg',9.6,.98,-.45,0],['bottle',-19.4,.52,17.2,0]];

function stashCast(){ for(const sp of STASH_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>cartelChar(sp.id,h,g)})); E.detail=sp.detail; E.radio=!!sp.radio; mergeTree(E.C.wpn); mergeTree(E.C.dropped); mergeChar(E.C); atlasBody(E.C);
    if(sp.patrol){ E.patrol={pts:sp.patrol,i:1,wait:0}; E.st='alert'; } enemies.push(E); } attachLabels(); }
function stashLoot(){ for(const [k,x,y,z,ry] of STASH_LOOT){ const Mw=m4.compose(m4.make(),[x,y,z],[k==='knife'||k==='machete'||k==='bottle'?Math.PI/2:0,ry,0],[1,1,1]); addPickup(newItem(k),Mw,[0,0,0],[0,0,0]); } }

function genStash(){
  setWorld(43,25); disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true; FIRES.length=0;
  FLOOR.n=3; FLOOR.test=true; FLOOR.mode='stash'; FLOOR.dormD=10; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; FLOOR.down=false; setLang(true);
  const lights=[], addBoxW=addBox;
  const walkB=(B,x0,z0,x1,z1)=>{ const w=x1-x0,d=z1-z0; mk(box(w,.07,d),F(MT(tWalkCo,{repeat:[w/1.2,.1]}),MT(tWalkCo,{repeat:[w,d]}),MT(tWalkCo,{repeat:[w/1.2,.1]}),MT(tWalkCo,{repeat:[w,d]}),MT(tWalkCo,{repeat:[w/1.2,.1]})),B.g,(x0+x1)/2,.035,(z0+z1)/2); };
  const S=t=>S_(t), PK=S(tCbPink),TQ=S(tCbTurq),OC=S(tCbOchre),BL=S(tCbBlue),LI=S(tCbLime),WT_=S(tCbWhite),VI=S(tCbViolet),OR=S(tCbOrange),RAW=S(tCbRaw),PKH=S(tCbPinkHalf),TQH=S(tCbTurqHalf),CR=S(tCbCream);
  const MINT=S(tInMint),PEACH=S(tInPeach),IBLUE=S(tInBlue),IYEL=S(tInYellow),IWHT=S(tInWhite);
  GEO_TEMP=true;
  /* ================= the colonia, in world coordinates ================= */
  { const G=floorN, B={g:G}; const Lt=(p,c,d,pow='gen',fl=null)=>lights.push({p,c,d,pow,fl});
    const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>stashWall(B,addBox,x0,z0,x1,z1,a,b,holes,o);
    const hole=(at,w,y0=.95,y1=1.95)=>({at,w,y0,y1});
    const bulb=(x,y,z)=>{ mk(cyl(.004,.004,WH-y-.06,3,{at:[0,(WH-y)/2,0]}),mBlack,G,x,y,z); const n=mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),G,x,y,z); n._keep=true; };
    const roofSlab=(x0,z0,x1,z1,h=WH)=>{ mk(box(x1-x0+.2,.2,z1-z0+.2),MT(tCbRaw),G,(x0+x1)/2,h+.1,(z0+z1)/2); addBox(x0,x1,z0,z1,h,h+.2,'ceil'); };
    /* --- the sky past the fog, and the moon --- */
    /* the sky is a box that rides with the player, 40 m out (inside the headset's 60 m depth range), with a starry lid, so the hills
       and the city lights never come close and there is no black hole overhead */
    { const sky=N(G,0,0,0); sky.live=true; sky._keep=true; FLOOR.sky=sky; const R_=40;
      for(const [x,z,ry] of [[0,-R_,0],[0,R_,Math.PI],[-R_,0,Math.PI/2],[R_,0,-Math.PI/2]]){ const n=mk(plane(R_*2+.4,46),MT(tSkyCo,{unlit:true,double:true,nofog:true,repeat:[2,1]}),sky,x,16,z,0,ry,0); n.mesh.geo.noCull=true; n._keep=true; }
      { const n=mk(plane(R_*2+.4,R_*2+.4),MT(tStarsCo,{unlit:true,double:true,nofog:true,repeat:[3,3]}),sky,0,38.9,0,Math.PI/2,0,0); n.mesh.geo.noCull=true; n._keep=true; }
      const n=mk(plane(6.3,6.3),MT(tMoonCo,{unlit:true,cut:true,double:true,nofog:true,color:0xf0ecd8}),sky,12.6,19.4,-38.6,0,0,0); n.mesh.geo.noCull=true; n._keep=true; }

    /* --- ground --- */
    floor(B,-13,-2,-10.2,2,tDust,{tile:2,color:0x8a8070});
    for(const [x0,z0,x1,z1] of [[-10.2,-18.5,-5.2,9.5],[11.8,-18.5,16.8,9.5],[-27,-18.5,-23,9.5],[-41,-18.5,42.5,-16],[-27,9.5,42.5,14]]) for(let x=x0;x<x1-.01;x+=12) for(let z=z0;z<z1-.01;z+=12) floor(B,x,z,Math.min(x1,x+12),Math.min(z1,z+12),tRoad2Co,{tile:3.2});
    const walk=(...a)=>walkB(B,...a);
    walk(-10.2,-15,-9.4,-2); walk(-10.2,2,-9.4,9.5); walk(-6.0,-14,-5.2,9.5); walk(-23,9.5,-10.2,10.2); walk(-5.2,9.5,3,10.2); walk(-23.8,-16,-23,9.5); walk(-27,13.3,-12.5,14); walk(-9,13.3,1,14); walk(4,13.3,42.5,14);
    floor(B,-41,-23,41,-18.5,tFlConc,{tile:2.4,color:0x6a6862}); mk(plane(82,1.2,40,1),M(null,{color:0x141c20}),G,0,.015,-20.8,-Math.PI/2); /* the canal floor and the trickle down its middle */
    floor(B,-41,-16,-27,-1,tDust,{tile:2.2,color:0x7a6c58}); floor(B,-33,-6.2,-29,-3.4,tFlConc,{tile:1.5,color:0x9a948a});
    floor(B,-37,2,-27,9.5,tTileFloor,{tile:.9,color:0x9a7a6a}); floor(B,-37,9.5,-27,14,tFlConc,{tile:2.4,color:0x8a8478});
    floor(B,-3,-11,10,-4,tFlConc,{tile:1.4,color:0xa8a090}); floor(B,-5.2,-8.2,-3,-6.6,tTileFloor,{tile:.6}); floor(B,10,-8.2,11.8,-6.6,tTileFloor,{tile:.6});
    for(const [x0,x1] of [[-3,.25],[.25,3.5],[3.5,6.75],[6.75,10]]) for(const [z0,z1] of [[-14,-11],[-4,-1]]) floor(B,x0,z0,x1,z1,tTileFloor,{tile:.8,color:[0xc8b8a0,0xb8c8b8,0xd8c0a8,0xa8b8c8][(x0+5|0)%4]});
    floor(B,3,-1,11.8,9.5,tFlConc,{tile:2,color:0x7a7670});
    floor(B,-22,15.6,-2,23.5,tWalkCo,{tile:1.2,color:0xb8b0a0}); floor(B,-12.5,14,-9,15.6,tWalkCo,{tile:1.2}); floor(B,1,14,4,16,tWalkCo,{tile:1.2});
    mk(plane(20,8,20,8),MT(tCourtCo),G,11,.01,20,-Math.PI/2);
    for(const [x,z,s,ry] of [[-7.4,-6.5,1.4,.3],[-8.2,3.8,1.1,1.2],[-3,12.2,1.6,.2],[12.5,11.4,1.2,2],[-17,11.8,1.3,.8],[-25,-6,1.4,.5],[-25.5,4,1.1,2],[-30,12,1.5,1],[14,-12,1.2,.4],[20,-17.2,1.6,.3],[-15,-17,1.3,1.1],[-20,-20.8,2.4,0],[8,-20.8,2,0],[30,-20.8,2.2,0]]) mk(plane(s*1.6,s),MT(tPuddleCo,{cut:true}),G,x,.013,z,-Math.PI/2,0,ry);

    /* --- the blocks: around the start, the west street, the south row, the north edge --- */
    solidBlock(B,-23,-16,-10.2,-2,{paint:tCbOchre,h:2.9,dish:true,skirt:true,faces:{e:[['door',-13],['lit',-11.4],['shutter',-7.2,2.6],['sign',-7.2,{t:tSignTort,w:2.6,h:.5}],['awning',-7.2,{w:3,t:tAwnBlue}],['win',-4.6],['tag',-9.4,1],['meter',-12.2],['poster',-5.6,tPosterVote]],
      w:[['win',-14],['rdoor',-11.6],['lit2',-9.4],['tag',-7.2,2],['wsign',-4.6,{t:tSgNo,w:2,h:.32,y:1.8}],['weeds',-3.4,3]],n:[['tag',-16,0],['win',-19],['weeds',-13,5]]}});
    solidBlock(B,-23,-2,-13,2,{paint:tCbBlue,h:2.9,parapet:false,tinaco:false,faces:{w:[['tv',0],['meter',-1.2]]}});
    solidBlock(B,-23,2,-10.2,9.5,{paint:tCbViolet,h:2.8,skirt:true,faces:{e:[['tv',3.9],['rdoor',5.8],['poster',7.2,tPosterLucha],['lit2',8.4]],s:[['win',-21],['door',-18.4],['lit',-16.4],['tag',-13.8,0],['ac',-12]],w:[['lit',4],['door',6.2],['win',8.2]]}});
    const south=[[-27,-23,tCbWhite,[['win',-25]]],[-23,-12.5,tCbBlue,[['win',-21],['rdoor',-19],['lit',-17],['wsign',-14.6,{t:tSgAgua,w:1.4,h:.5}]]],[-9,1,tCbOchre,[['lit2',-7.6],['door',-5.6],['tv',-3.4],['poster',-2.2,tPosterVote],['win',-.4]]],
      [4,13,tCbLime,[['win',5.5],['door',7.3],['lit',9.4],['tag',11.2,4]]],[13,21,tCbPinkHalf,[['lit',14.8],['rdoor',16.6],['win',18.8],['meter',20]]],[21,30,tCbTurq,[['win',22.8],['door',24.6],['lit2',26.8],['awning',28.6,{w:1.6,t:tAwnGreen}],['door',28.6]]],[30,42.5,tCbOrange,[['lit',32],['rdoor',34],['win',36.5],['tag',39,1],['lit2',41]]]];
    for(const [x0,x1,t,fc] of south) solidBlock(B,x0,14,x1,15.6,{paint:t,h:2.7+((x0+30)%3)*.1,skirt:true,faces:{n:fc,s:[['win',(x0+x1)/2-1.2],['tag',(x0+x1)/2+1,(x0|0)&3]]}});
    solidBlock(B,-27,15.6,-22,25,{paint:tCbCream,h:3,faces:{e:[['lit',18],['door',20.4],['mural',22.6,{t:tMuralCo,w:1.6,h:1.2}]]}}); solidBlock(B,-2,15.6,1,25,{paint:tCbPink,h:2.8,faces:{w:[['win',18],['tag',21,3]],e:[['tag',20,2]]}});
    solidBlock(B,21,15.6,42.5,25,{paint:tCbBlue,h:2.8,faces:{w:[['win',18],['lit',22]]}}); solidBlock(B,1,24,21,25,{paint:tCbRaw,h:2.4,parapet:false,tinaco:false,faces:{n:[['mural',8,{t:tMuralCo,w:5,h:2.2}],['tag',15,0],['tag',3,4]]}});
    /* the church */
    solidBlock(B,-22,23.5,-17,25,{paint:tCbCream,h:3,faces:{n:[['win',-19.5]]}}); solidBlock(B,-7,23.5,-2,25,{paint:tCbCream,h:3,faces:{n:[['win',-4.5]]}});
    solidBlock(B,-17,23.5,-7,25,{paint:tCbWhite,h:5.2,parapet:false,tinaco:false,faces:{n:[['lit2',-14.6],['lit2',-9.4]]}});
    { const n=N(G,-12,0,23.38,0,Math.PI,0); mk(box(2.4,3.2,.1,{at:[0,1.6,0]}),MT(tCbRaw),n,0,0,-.03); const dl=mk(plane(1.8,2.6),MT(tChurchIn,{unlit:true,color:0xd8c0a0}),n,0,1.3,.03); dl._keep=true;
      mk(box(3.2,1.6,.4),MT(tCbWhite),G,-12,5.9,24.2); mk(box(1,1,.42),M(null,{color:0x101014}),G,-12,5.95,24.2); mk(box(.12,.9,.12),mIron,G,-12,7.1,24.2); mk(box(.5,.12,.12),mIron,G,-12,7.3,24.2); }
    Lt([-12,1.3,22.6],[1.4,.9,.45],5.5,'city','candle');
    /* along the north edge of town: the backs of houses facing the lane */
    solidBlock(B,-5.2,-16,11.8,-14,{paint:tCbLime,h:2.8,tinaco:false,faces:{n:[['win',-2],['door',1.4],['tag',4,1],['win',7],['weeds',9.5,4]]}}); solidBlock(B,16.8,-16,30,-14,{paint:tCbTurqHalf,h:2.8,faces:{n:[['win',19],['tag',23,2],['rdoor',26],['weeds',28,3]]}});

    /* --- the arroyo: a concrete storm canal behind a wall you can't be seen over, the lane beside it --- */
    { const gaps=[[-34,1.6],[-25,2.2],[-7.7,2.4],[14.3,2.4],[31,2],[37.2,1.6]]; let s=-41; for(const [at,w] of [...gaps,[41+.8,0]]){ const e=at-w/2; if(e-s>.05){ W(s,-18.5,e,-18.5,RAW,RAW,[],{h:1.6}); } s=at+w/2; } }
    W(-41,-23,41,-23,RAW,RAW,[],{h:2.8}); W(-41,-23,-41,-18.5,RAW,RAW,[],{h:2.8}); W(41,-23,41,-18.5,RAW,RAW,[],{h:2.8});
    for(const x of [-30,-14,2,18,34]){ mk(cyl(.32,.32,.6,10),M(null,{color:0x1a1a1c}),G,x,.9,-22.8,Math.PI/2,0,0); mk(cyl(.36,.36,.08,10),MT(tCbRaw),G,x,.9,-22.55,Math.PI/2,0,0); }
    for(const [x,i] of [[-36,0],[-22,1],[-9,3],[6,2],[22,4],[28,0]]){ const n=N(G,x,1.0+(i%2)*.3,-22.93); mk(plane(2.2,.7),MT(TAGS_CO[i],{cut:true}),n,0,0,.01); }
    { const n=N(G,-1,1.2,-22.92); mk(plane(5,1.6),MT(tMuralCo),n,0,0,.01); }
    for(const [x,z,s] of [[-38,-22.4,3],[-27,-22.5,5],[-12,-18.9,4],[-3,-22.5,6],[10,-18.9,3],[24,-22.5,5],[38,-18.9,4],[17,-22.5,4]]) place(B,'weeds',x,z,0,s,(x|0)+50,2);
    place(B,'tires',-19,-21.8,0,2,5); place(B,'trashbags',-6,-19.3,0,3,6); place(B,'mattress',12,-22,.3); place(B,'tires',26,-19.4,0,3,7); place(B,'trashbags',33,-22,0,3,8); place(B,'litter',-28,-20.5,0,12,21,3); place(B,'litter',4,-20.5,0,12,22,3); place(B,'litter',24,-20.5,0,10,23,3);
    { const c=N(G,-15.8,0,-21.6,0,.4,0); for(const [x,z,w,d] of [[0,-.3,.9,.03],[0,.3,.9,.03],[-.45,0,.03,.6],[.45,0,.03,.6]]) mk(box(w,.5,d),mIron,c,x,.55,z); mk(box(.9,.02,.6),mIron,c,0,.35,0); for(const [x,z] of [[-.4,-.25],[.4,-.25],[-.4,.25],[.4,.25]]) mk(cyl(.05,.05,.03,6),M(null,{color:0x141416}),c,x,.06,z,0,0,Math.PI/2); }
    place(B,'bins',-9.85,-17.4,Math.PI/2,2); addBox(-10.2,-9.45,-17.75,-16.3,0,1.05,'furn'); place(B,'trashbags',13,-17,0,4,9);
    for(const x of [-16,4,24]){ place(B,'sodium',x,-16.1,Math.PI/2,1.4); addBox(x-.12,x+.12,-16.22,-15.98,0,6,'furn'); Lt([x,5.85,-17.5],[1.9,1.0,.36],11,'city','buzz'); }

    /* --- the start street: the vecindad across it --- */
    place(B,'auto',-9.0,-9.5,0,0x9a9a92,'pickup',{hub:false,plate:'BCN'}); addBox(-9.88,-8.12,-11.95,-7.05,0,1.4,'furn');
    place(B,'auto',-6.2,5.4,Math.PI,0x2a4a3a,'sedan',{plate:'TJA'}); addBox(-7.05,-5.35,3.3,7.5,0,1.3,'furn');
    for(const [x,z] of [[-9.9,-6],[-9.9,7]]){ place(B,'sodium',x,z,0,1.4); addBox(x-.12,x+.12,z-.12,z+.12,0,6,'furn'); Lt([x+1.4,5.85,z],[2.0,1.05,.38],12,'city','buzz'); }
    for(const [x,z] of [[-5.5,-13.6],[-12,9.9],[-24,-10],[-24,6]]) { place(B,'pole',x,z,0,7); addBox(x-.13,x+.13,z-.13,z+.13,0,6,'furn'); }
    place(B,'wire',0,0,0,[-9.9,-6],[-9.9,7],6.6); place(B,'wire',0,0,0,[-9.9,-6],[-5.5,-13.6],6.5); place(B,'wire',0,0,0,[-9.9,7],[-12,9.9],6.5); place(B,'wire',0,0,0,[-12,9.9],[-24,6],6.6); place(B,'wire',0,0,0,[-24,6],[-24,-10],6.6);
    place(B,'wire',0,0,0,[-9.9,-6],[-5.2,-8],5.2); place(B,'wire',0,0,0,[-9.9,7],[-5.2,4],5.2); place(B,'wire',0,0,0,[-24,-10],[-23,-12],5.0); place(B,'wire',0,0,0,[-5.5,-13.6],[-16,-16.1],6.4);
    for(const [x,z,c] of [[-9.75,-14.4,0xffffff],[-5.6,-13.1,0xc8d8ff],[-23.4,8.8,0xffffff]]){ place(B,'tambo',x,z,0,c); addBox(x-.3,x+.3,z-.3,z+.3,0,.9,'furn'); }
    place(B,'litter',-8,-12,0,10,1,1.6); place(B,'litter',-7.8,6,0,8,2,1.4); place(B,'litter',-25,-3,0,10,3,1.5); place(B,'litter',-12,-1,0,5,11,.9); place(B,'litter',-16,11.8,0,10,12,2.5);
    for(const [x,z,s_,ry,t] of [[-7.8,-3.5,1.2,.4,tOilCo],[-7.2,-9,2.2,.3,tCrackCo],[-8.6,8,1.8,1.1,tCrackCo],[-25,-12,2,.5,tCrackCo],[-14,11.6,2.4,.6,tCrackCo],[-25,2,1.3,.2,tOilCo]]) place(B,'decal',x,z,0,t,s_,s_,ry);
    for(const [x,z,len,ry] of [[-7.7,-5,14,0],[-25,-4,16,0],[-14,11.8,18,Math.PI/2],[24,11.6,18,Math.PI/2]]) place(B,'decal',x,z,0,tTrackCo,1.6,len,ry);

    /* --- the vecindad: a tenement round a patio, eight rooms, a way through to the stash street --- */
    solidBlock(B,-5.2,-14,-3,-8.2,{paint:tCbPink,h:2.8,parapet:false,tinaco:false,skirt:SKIRTS[0],faces:{w:[['lit',-12.6],['win',-10]]}}); solidBlock(B,-5.2,-6.6,-3,-1,{paint:tCbPink,h:2.8,parapet:false,tinaco:false,skirt:SKIRTS[0],faces:{w:[['tv',-5],['win',-2.6],['wsign',-3.8,{t:wallSign('VECINDAD|LA ESPERANZA',null,'#2a2a2a',64,16,1,1761),w:2.2,h:.55,y:2.3}]]}});
    solidBlock(B,10,-14,11.8,-8.2,{paint:tCbTurq,h:2.8,parapet:false,tinaco:false,faces:{e:[['win',-12],['tag',-9.6,3]]}}); solidBlock(B,10,-6.6,11.8,-1,{paint:tCbTurq,h:2.8,parapet:false,tinaco:false,faces:{e:[['lit',-4.6],['meter',-2.4]]}});
    roofSlab(-5.2,-8.2,-3,-6.6,2.8); roofSlab(10,-8.2,11.8,-6.6,2.8);
    bulb(-4.1,2.3,-7.4); Lt([-4.1,2.25,-7.4],[1.3,.9,.5],4.2,'city');
    W(-3,-14,10,-14,IWHT,IWHT); W(-3,-1,10,-1,PK,IWHT);
    const roomDoors=[-1.375,1.875,5.125,8.375];
    W(-3,-11,10,-11,PK,IWHT,roomDoors.map((x,i)=>door(x,.85,i%2?1.3:-1.3,{doorT:i%2?tSteelDoor:tSteelDoorR})).concat([win(-.3,.7),win(6.2,.7)]));
    W(-3,-4,10,-4,IWHT,PK,roomDoors.map((x,i)=>door(x,.85,i%2?-1.3:1.3,{doorT:i%2?tSteelDoorR:tSteelDoor})).concat([win(.3,.7),win(3.0,.7)]));
    W(-3,-11,-3,-8.2,PK,PK); W(-3,-6.6,-3,-4,PK,PK); W(10,-11,10,-8.2,TQ,TQ); W(10,-6.6,10,-4,TQ,TQ);
    for(const x of [.25,3.5,6.75]){ W(x,-14,x,-11,IWHT,IWHT); W(x,-4,x,-1,IWHT,IWHT); }
    W(-3,-14,-3,-11,IWHT,PK); W(10,-14,10,-11,IWHT,TQ); W(-3,-4,-3,-1,IWHT,PK); W(10,-4,10,-1,IWHT,TQ);
    roofSlab(-3,-14,10,-11); roofSlab(-3,-4,10,-1); frameBox(B,-3,-14,10,-11,WH+.2,{extra:[[.25,-11],[3.5,-11],[6.75,-11]]}); frameBox(B,-3,-4,10,-1,WH+.2,{extra:[[.25,-4],[3.5,-4],[6.75,-4]]});
    for(const [cx,cz] of [[3.5,-11],[3.5,-4]]) place(B,'parapet',cx,cz,0,13).p[1]=WH+.2;
    /* the patio: the wash basin, lines of washing, plants, chairs, a shrine with a candle */
    place(B,'pila',3.5,-10.3,0); addBox(2.8,4.2,-10.7,-9.9,0,.9,'furn'); place(B,'laundry',3.5,-7.4,0,12); place(B,'laundry',3.5,-9.2,0,12);
    for(const [x,z,s] of [[-2.6,-4.6,1],[9.4,-10.5,2],[9.5,-4.5,3],[5,-10.6,4]]) place(B,'bucketplant',x,z,0,0x3a7a3a,s);
    place(B,'pchair',2.2,-7.2,1.8); place(B,'pchair',3.8,-6.6,3.6); place(B,'tambo',8.9,-9.8,0,0xffffff); addBox(8.6,9.2,-10.1,-9.5,0,.9,'furn');
    { const n=N(G,9.9,0,-5.6,0,-Math.PI/2,0); FX.shrine(n); addBox(9.5,10,-6.1,-5.1,0,1.85,'furn'); } Lt([9.4,1.1,-5.6],[1.1,.65,.28],3.2,'city','candle');
    bulb(3.5,2.4,-7.5); Lt([3.5,2.35,-7.5],[1.25,.9,.5],6,'city');
    /* the rooms: a mattress each, a TV in one, a table, posters */
    for(const [i,x] of roomDoors.entries()){ place(B,'mattress',x,-13.4,0); place(B,'mattress',x,-1.6,0); }
    { const tv=place(B,'crt',7.6,-11.6,0); heatTag(tv,.5); addBox(7.23,7.97,-11.9,-11.3,0,1.0,'furn'); } Lt([7.6,1.0,-12.1],[.45,.6,1.2],3.5,'city','tv');
    place(B,'table',1.9,-2.6,0,.9,.6,0xd8d4cc); addBox(1.45,2.35,-2.9,-2.3,0,.77,'furn'); place(B,'wardrobe',-2.4,-12.2,Math.PI/2); addBox(-2.95,-2.35,-12.8,-11.6,0,1.9,'furn');
    for(const [x,z,ry,t] of [[4.2,-13.93,0,tPosterLucha],[-1,-1.07,Math.PI,tCalendarCo],[8.2,-1.07,Math.PI,tPosterVote]]) place(B,'poster',x,z,ry,t).p[1]=1.45;
    for(const [x,z,ry,w,t] of [[-1.375,-11,0,.85,tCurtACo],[8.375,-4,0,.85,tCurtCCo]]){ const n=N(G,x,0,z,0,ry,0); n.live=true; FX.curtain(n,w,1.75,t); }

    /* --- the tortillería on the corner, the mechanic's yard behind it --- */
    solidBlock(B,-5.2,-1,3,9.5,{paint:tCbCream,h:2.8,skirt:SKIRTS[1],faces:{w:[['shutter',1.6,2.6],['awning',1.6,{w:3,t:tAwnRed}],['sign',1.6,{t:tSignTort,w:2.6,h:.5}],['lit',5.2],['door',7.4]],s:[['win',-3.4],['tag',-.8,0],['meter',1.6]]}});
    place(B,'corrfence',9.9,9.5,0,3.8,2.0,tCorrug); place(B,'corrfence',3.9,9.5,0,1.8,2.0,tCorrug); addBox(8,11.8,9.45,9.55,0,2,'wall'); addBox(3,4.8,9.45,9.55,0,2,'wall');
    { const s=N(G,8,0,9.5,0,-.9,0); mk(box(1.6,2.0,.03,{at:[-.8,1,0]}),MT(tCorrug,{repeat:[1.3,1]}),s); }
    place(B,'corrfence',11.8,.5,Math.PI/2,3,2.0,tCorrBlue); place(B,'corrfence',11.8,6.6,Math.PI/2,5.8,2.0,tCorrBlue); addBox(11.75,11.85,-1,2,0,2,'wall'); addBox(11.75,11.85,3.7,9.5,0,2,'wall');
    { const n=N(G,11.9,1.25,6.6,0,Math.PI/2,0); mk(plane(2.4,.4),MT(tSgVulca),n,0,.5,.03); mk(plane(2.2,.55),MT(tSgTaller),n,0,0,.03); }
    place(B,'auto',6.4,6.8,Math.PI/2+.1,0xa8a49a,'sedan',{hub:false,plate:'SON'}); addBox(4.2,8.6,5.9,7.7,0,1.3,'furn');
    { const c=N(G,7.6,0,2.0,0,.2,0); FX.auto(c,0x5a2a24,'pickup',{hub:false}); c.p[1]=.25; for(const [x,z] of [[-.7,1.6],[.7,1.6],[-.7,-1.55],[.7,-1.55]]) mk(box(.3,.45,.3,{at:[0,.22,0]}),MT(tCbRaw),c,x,-.25,z); } addBox(6.6,8.6,-.6,4.6,0,1.6,'furn');
    place(B,'workbench',9.6,-.55,0,2.2); addBox(8.5,10.7,-.85,-.25,0,.95,'furn'); place(B,'tires',4,8.6,0,4,13); place(B,'tires',4.7,8.6,0,3,14); addBox(3.6,5.1,8.2,9.0,0,.9,'furn');
    place(B,'engine',3.8,1.2,0,3); addBox(3.4,4.2,.8,1.6,0,.8,'furn'); place(B,'gascyl',11.3,-.5); place(B,'tambo',3.5,4.3,0,0xffffff); addBox(3.2,3.8,4.0,4.6,0,.9,'furn'); place(B,'decal',5.8,3.5,0,tOilCo,2.2,2.2,0.4);
    place(B,'pole',4,-.4,0,5); { const h=N(G,4,4.6,-.4,.6,.6,0); h._keep=true; mk(box(.35,.25,.2),col(0x2a2a2c),h); mk(plane(.3,.2),M(null,{color:0xf2f4ff,unlit:true}),h,0,0,.102); } Lt([4.8,4.2,.6],[1.6,1.7,1.8],8,'city');

    /* --- the junkyard: Yonke Los Primos --- */
    for(const [x0,x1,z,gap] of [[-41,-27,-16,[-34.5,-33]],[-41,-27,-1,null]]){ const segs=gap?[[x0,gap[0]],[gap[1],x1]]:[[x0,x1]]; for(const [a,b] of segs){ place(B,'corrfence',(a+b)/2,z,0,b-a,2.2,tCorrug); addBox(a,b,z-.05,z+.05,0,2.2,'wall'); } }
    for(const [z0,z1] of [[-16,-9.5],[-6.5,-1]]){ place(B,'corrfence',-27,(z0+z1)/2,Math.PI/2,z1-z0,2.2,tCorrBlue); addBox(-27.05,-26.95,z0,z1,0,2.2,'wall'); }
    place(B,'corrfence',-41,-8.5,Math.PI/2,15,2.2,tCorrug); addBox(-41.05,-40.95,-16,-1,0,2.2,'wall');
    { const n=N(G,-26.9,1.9,-11.4,0,Math.PI/2,0); mk(plane(2.6,.65),MT(tSgYonke),n,0,0,.03); }
    { const g1=N(G,-27,0,-9.5,0,Math.PI/2+1.2,0); mk(box(1.5,2.0,.04,{at:[.75,1,0]}),MT(tCorrug,{repeat:[1.2,1]}),g1); }
    for(const [x,z,ry,sd] of [[-38.4,-14.6,Math.PI/2+.05,1],[-30,-14.6,Math.PI/2-.06,3],[-38.4,-2.6,Math.PI/2+.04,4]]){ place(B,'junkstack',x,z,ry,sd); addBox(x-2.5,x+2.5,z-1.0,z+1.0,0,2.6,'wall'); }
    place(B,'hoist',-35,-11.6,0); addBox(-36.6,-36.2,-12.4,-10.8,0,3,'furn'); addBox(-33.8,-33.4,-12.4,-10.8,0,3,'furn');
    { const c=N(G,-35,0,-11.4,0,Math.PI/2,0); FX.auto(c,0x3a4a6a,'sedan',{hub:false}); c.p[1]=.05; } addBox(-37.1,-32.9,-12.3,-10.5,0,1.3,'furn');
    for(const [x,z,n,sd] of [[-38.6,-8.4,5,1],[-38,-6.6,4,2],[-31,-12,3,3],[-28.4,-11.6,4,4]]){ place(B,'tires',x,z,0,n,sd); addBox(x-.35,x+.35,z-.35,z+.35,0,.2*n,'furn'); }
    for(const [x,z,s] of [[-38.8,-10.8,1],[-32.6,-9.4,2],[-31.6,-8.6,3]]){ place(B,'engine',x,z,0,s); addBox(x-.4,x+.4,z-.4,z+.4,0,.8,'furn'); }
    place(B,'kennel',-40,-11.4,Math.PI/2); addBox(-40.6,-39.4,-12.2,-10.6,0,1.05,'furn'); place(B,'litter',-34,-8,0,14,31,4); place(B,'decal',-34,-9,0,tOilCo,3,3,0); place(B,'decal',-30.5,-11,0,tOilCo,2,2,1);
    place(B,'floodpole',-37.4,-8.8,0,.9); addBox(-37.55,-37.25,-8.95,-8.65,0,6,'furn'); Lt([-36.4,5.2,-8.6],[1.5,1.6,1.75],12,'city','buzz');
    /* the office trailer */
    W(-33,-6.2,-29,-6.2,S(tCorrBlue),IWHT,[door(-31,.85,1.3,{doorT:tSteelDoor}),win(-32.2,.8)],{h:2.4}); W(-33,-3.4,-29,-3.4,S(tCorrBlue),IWHT,[win(-31,1.0)],{h:2.4});
    W(-33,-6.2,-33,-3.4,S(tCorrBlue),IWHT,[],{h:2.4}); W(-29,-6.2,-29,-3.4,S(tCorrBlue),IWHT,[win(-4.8,.9)],{h:2.4}); roofSlab(-33,-6.2,-29,-3.4,2.4);
    place(B,'desk',-29.8,-4.4,-Math.PI/2); addBox(-30.2,-29.4,-5.1,-3.7,0,.78,'furn'); { const tv=place(B,'crt',-32.4,-3.85,Math.PI); heatTag(tv,.5); addBox(-32.8,-32.0,-4.15,-3.55,0,1.0,'furn'); }
    place(B,'poster',-29.07,-4.4,-Math.PI/2,tCalendarCo).p[1]=1.45; place(B,'pchair',-31.6,-4.6,2.6); bulb(-31,2.15,-4.8); Lt([-31,2.1,-4.8],[1.3,1.0,.6],4.5,'city'); Lt([-32.4,1.0,-4.3],[.45,.6,1.2],3,'city','tv');

    /* --- the cantina: La Frontera --- */
    W(-27,2,-27,9.5,IYEL,S(tCbPink),[win(3.4,1.2),door(6.0,1.1,-1.3,{doorT:tSteelDoorR}),win(8.4,1.2)],{h:2.8}); W(-37,2,-27,2,IYEL,S(tCbPink),[],{h:2.8}); W(-37,9.5,-27,9.5,S(tCbPink),IYEL,[door(-33,.9,1.3,{doorT:tSteelDoor}),win(-30,1.0)],{h:2.8});
    W(-37,2,-37,9.5,IYEL,S(tCbPink),[],{h:2.8}); W(-37,5.5,-33,5.5,IYEL,IWHT,[door(-34.2,.85,1.3)],{h:2.8}); W(-33,2,-33,5.5,IWHT,IYEL,[],{h:2.8});
    roofSlab(-37,2,-27,9.5,2.8); frameBox(B,-37,2,-27,9.5,3.0,{extra:[[-32,2],[-32,9.5]]});
    { const n=N(G,-26.9,2.55,6,0,Math.PI/2,0); n._keep=true; mk(plane(3,.75),MT(tNeonCant,{unlit:true,cut:true}),n,0,0,.04); mk(box(3.1,.82,.04),col(0x0c0c10),n,0,0,0); } Lt([-26.2,2.4,6],[1.5,.5,1.1],4,'city','buzz');
    { const n=N(G,-26.94,0,6,0,Math.PI/2,0); FX.awning(n,2.2,tAwnRed,.7); }
    solidBlock(B,-41,2,-37,14,{paint:tCbOchre,h:2.9,faces:{s:[['win',-39]]}});
    place(B,'counter',-30.7,3.6,0,4.4,tCabinetW,tCounterTop,{upper:false}); addBox(-32.95,-28.45,3.29,3.91,0,1.0,'furn');
    for(const x of [-32.4,-31,-29.6]) { place(B,'bookcase',x,2.15,0,1.2,1.6); }
    for(const x of [-32.6,-31.6,-30.6,-29.6,-28.6]) place(B,'stool',x,4.4,0);
    place(B,'pooltable',-31.5,7.2,0); addBox(-32.55,-30.45,6.6,7.8,0,.85,'furn'); place(B,'jukebox',-36.5,8.8,Math.PI/2); addBox(-36.95,-36.45,8.4,9.2,0,1.4,'furn'); Lt([-36.0,1.0,8.8],[1.2,.5,1.0],3.4,'city','tv');
    for(const [x,z] of [[-35.4,7],[-28.6,8.4]]){ place(B,'table',x,z,0,.9,.9,0x5a3a2a); addBox(x-.45,x+.45,z-.45,z+.45,0,.77,'furn'); place(B,'chair',x,z-.7,0); place(B,'chair',x,z+.7,Math.PI); place(B,'bottles',x,z,0,3,(x*3|0)&7).p[1]=.78; }
    place(B,'poster',-36.93,4.4,Math.PI/2,tPosterLucha).p[1]=1.5; place(B,'poster',-27.07,7.2,-Math.PI/2,tPosterVote).p[1]=1.5;
    bulb(-31,2.4,6.8); Lt([-31,2.35,6.6],[1.5,.9,.45],6,'city'); bulb(-31,2.4,3.4); Lt([-30.6,2.2,3.2],[1.2,.8,.4],4,'city');
    place(B,'crates',-36.2,2.8,0); place(B,'crates',-35.0,4.8,.4); place(B,'table',-35.4,3.6,0,.9,.6,0x4a3a2a); addBox(-36.85,-35.65,2.25,3.35,0,1.1,'furn'); addBox(-35.85,-34.95,3.3,3.9,0,.77,'furn'); bulb(-35,2.3,3.8); Lt([-35,2.25,3.8],[1.1,.85,.5],3.5,'city');
    place(B,'auto',-34.4,12,Math.PI/2+.05,0x8a6a2a,'sedan',{plate:'NOG'}); addBox(-36.6,-32.2,11.1,12.9,0,1.3,'furn'); place(B,'auto',-29.6,11.8,-Math.PI/2,0x1a1a1e,'suv'); addBox(-31.9,-27.3,10.9,12.7,0,1.4,'furn');

    /* --- the plaza and the soccer court --- */
    place(B,'kiosk',-12,19.6); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2,x=-12+Math.sin(a)*2.1,z=19.6+Math.cos(a)*2.1; addBox(x-.07,x+.07,z-.07,z+.07,0,2.6,'furn'); }
    for(const [x,z,ry] of [[-19.4,17.2,0],[-19.4,22.2,Math.PI],[-4.6,17.2,0],[-4.6,22.2,Math.PI],[-16,23,Math.PI],[-8,23,Math.PI]]){ place(B,'bench',x,z,ry,1.8); addBox(x-.9,x+.9,z-.25,z+.25,0,.5,'furn'); }
    for(const [x,z] of [[-17,17.6],[-7,17.6]]){ place(B,'lamppost',x,z); addBox(x-.1,x+.1,z-.1,z+.1,0,3,'furn'); Lt([x,3.5,z],[1.6,1.2,.6],8,'city'); }
    place(B,'mesquite',-20.6,20,0,11); addBox(-20.8,-20.4,19.8,20.2,0,2,'furn'); place(B,'mesquite',-3.6,20.2,0,12); addBox(-3.8,-3.4,20,20.4,0,2,'furn'); place(B,'palm',-15.4,16.4,0,6,7); addBox(-15.6,-15.2,16.2,16.6,0,3,'furn'); place(B,'palm',-8.6,16.4,0,6.4,8); addBox(-8.8,-8.4,16.2,16.6,0,3,'furn');
    place(B,'shrine',-21.55,17.8,Math.PI/2); addBox(-22,-21.3,17.3,18.3,0,1.85,'furn'); Lt([-21.2,1.0,17.8],[1.2,.7,.3],3.4,'city','candle');
    place(B,'litter',-12,19,0,10,41,6); place(B,'tambo',-2.6,16.2,0,0xffffff); addBox(-2.9,-2.3,15.9,16.5,0,.9,'furn');
    { const ch=[[1,16,21,16,[1.5,3.5]],[1,24,21,24,null],[1,16,1,24,null],[21,16,21,24,null]]; for(const [x0,z0,x1,z1,g] of ch){ const along=z0===z1,segs=g?[[x0,g[0]],[g[1],x1]]:[[along?x0:z0,along?x1:z1]];
      for(const [a,b] of segs){ if(along){ place(B,'chainlink',(a+b)/2,z0,0,b-a); addBox(a,b,z0-.05,z0+.05,0,1.5,'fence'); } else { place(B,'chainlink',x0,(a+b)/2,Math.PI/2,b-a); addBox(x0-.05,x0+.05,a,b,0,1.5,'fence'); } } } }
    place(B,'goal',1.9,20,0); place(B,'goal',20.1,20,Math.PI); place(B,'bench',11,23.4,Math.PI,4); addBox(9,13,23.15,23.65,0,.5,'furn');
    place(B,'floodtower',20.6,16.6,Math.PI*1.25); addBox(20.45,20.75,16.45,16.75,0,9,'furn'); Lt([19.6,8.6,17.6],[1.7,1.8,1.9],16,'city');
    place(B,'litter',11,20,0,8,42,8);
    /* beside the compound: the turquoise house next to the store, the blue house by the lot */
    solidBlock(B,2.5+SDX,5.6,8+SDX,9.5,{paint:tCbTurq,h:2.8,skirt:true,faces:{s:[['lit',3.8+SDX],['door',5.4+SDX],['win',6.9+SDX]],e:[['tag',7.6,2],['meter',6.4]]}});
    solidBlock(B,10+SDX,4,17+SDX,9.5,{paint:tCbBlue,h:2.7,dish:true,skirt:true,faces:{s:[['door',11.6+SDX],['lit2',13.4+SDX],['win',15.4+SDX],['poster',12.6+SDX,tPosterMissing],['wsign',14.4+SDX,{t:tSgAgua,w:1.2,h:.42,y:2.1}]],w:[['tag',6.5,3]]}});
  }

  /* ================= the compound, built in its own frame (moved east by SDX) ================= */
  { const G=N(floorN,SDX,0,0), B={g:G}; const addBox=(x0,x1,z0,z1,y0,h,k)=>addBoxW(x0+SDX,x1+SDX,z0,z1,y0,h,k);
    const Lt=(p,c,d,pow='gen',fl=null)=>lights.push({p:[p[0]+SDX,p[1],p[2]],c,d,pow,fl});
    const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>stashWall(B,addBox,x0,z0,x1,z1,a,b,holes,o);
    const hole=(at,w,y0=.95,y1=1.95)=>({at,w,y0,y1});
    const bulbAt=(x,y,z,warm=true,pw=true)=>{ mk(cyl(.004,.004,WH-y-.06,3,{at:[0,(WH-y)/2,0]}),mBlack,G,x,y,z); const n=mk(box(.08,.1,.08),M(null,{color:warm?0xffd8a0:0xe8f0ff,unlit:true}),G,x,y,z); if(pw) powered(n,.9,4); else n._keep=true; return n; };
    /* the compound's ground (the stash street and south street are laid with the rest of the colonia) */
    floor(B,-5.2,-14,-1,-5.5,tFlConc,{tile:2,color:0x9a9488}); floor(B,-5.2,-5.5,-1,5.6,tFlConc,{tile:2}); floor(B,-1,4,8,5.6,tDust,{tile:2,color:0x8a8070});
    floor(B,-1,-14,4,-8.5,tTileFloor,{tile:.9,color:0xc8b8a0}); floor(B,4,-14,8,-8.5,tFlConc,{tile:2,color:0x8a8a84}); floor(B,-1,-8.5,8,-5.5,tFlTerra,{tile:.8,color:0xb8a090});
    floor(B,-1,-5.5,3.4,.2,tTileFloor,{tile:.9}); floor(B,-1,.2,3.4,4,tFlTerra,{tile:.8,color:0xc8a898});
    floorHole(B,3.4,-5.5,8,-.8,SL.shaft[0]-.55,SL.shaft[1]-.55,SL.shaft[0]+.55,SL.shaft[1]+.55,tFlConc,{tile:2}); floor(B,3.4,-.8,8,4,tFlTerra,{tile:.8,color:0xa88878});
    floor(B,-5.2,5.6,2.5,9.5,tTileFloor,{tile:.9,color:0xd8d0c0}); floor(B,8,-16,10,9.5,tRoad2Co,{tile:3.2,color:0xb8a898});
    floor(B,10,-4.5,17,4,tDust,{tile:2,color:0xa09888}); floor(B,10,-15,20.5,-4.5,tDust,{tile:2,color:0x8a7c68}); floor(B,17,-4.5,20.5,9.5,tDust,{tile:2,color:0x8a7c68});
    walkB(B,-6.0,-14,-5.2,9.5);
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
  const gen=powered(place(B,'generator',SL.gen[0],SL.gen[1],0),.75,25); const gb=addBox(SL.gen[0]-.47,SL.gen[0]+.47,SL.gen[1]-.3,SL.gen[1]+.3,0,1.0,'generator'); gb.onHit=()=>stashPower(false);
  { const x=SL.sw[0],y=SL.sw[1],z=SL.sw[2]; mk(box(.13,.15,.025),M(null,{color:0x161618}),G,x,y,z-.012); mk(box(.08,.02,.01),M(null,{color:0xd8d4cc}),G,x,y+.095,z-.002);
    const lv=N(G,x,y-.02,z+.012); lv.live=true; mk(box(.022,.085,.022,{at:[0,.042,0]}),M(null,{color:0xb81a14}),lv); mk(box(.03,.03,.03),M(null,{color:0xb81a14}),lv,0,.085,0); FLOOR.lever=lv; stashLever(); }
  place(B,'gascyl',-1.5,-5.15); place(B,'gascyl',-1.9,-5.2); place(B,'laundry',-3.4,2.2,Math.PI/2,3.4); place(B,'pchair',-1.6,4.9,2.6); place(B,'bricksPile',-4.6,4.9,0,10,11); addBox(-5.15,-3.95,4.55,5.5,0,.4,'furn');
  place(B,'bucketplant',-4.9,-1.0,0,0x3a7a3a,3); place(B,'tires',-4.8,-5.0,0,2,9);
  bulbAt(-1.3,2.3,-1.0); Lt([-1.5,2.25,-1.0],[1.4,.95,.5],5.2);
  /* the count */
  place(B,'counttable',.9,-3.0,Math.PI/2); addBox(.42,1.38,-3.92,-2.08,0,.8,'furn');
  for(const [x,z,ry] of [[.2,-3.0,Math.PI/2],[1.6,-3.6,-Math.PI/2]]) place(B,'pchair',x,z,ry);
  { const l=N(G,SL.ledger[0],SL.ledger[1]-.035,SL.ledger[2],0,.3,0); l.live=true; FX.ledger(l); FLOOR.ledgerN=l; }
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
  place(B,'shaft',SL.shaft[0],SL.shaft[1]); place(B,'sandbags',7.6,-5.0,Math.PI/2,6); place(B,'crates',4.0,-5.0,0); addBox(3.55,4.6,-5.45,-4.55,0,1.1,'furn');
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
  place(B,'corrfence',10,-12.25,Math.PI/2,5.5,1.9,tCorrug); place(B,'corrfence',10,-6.5,Math.PI/2,3.9,1.9,tCorrBlue);
  { const s=N(G,10.1,0,-9.0,0,Math.PI/2+.6,0); mk(box(1.0,1.8,.03,{at:[.5,.9,0]}),MT(tCorrug,{repeat:[1,1]}),s); } /* a sheet bent back: the way into the lot */
  for(const [z0,z1] of [[-15,-9.55],[-8.45,-4.5]]) addBox(9.95,10.05,z0,z1,0,1.9,'wall');
  place(B,'bins',8.4,-13.0,0,2); addBox(8.05,9.5,-13.35,-12.65,0,1.05,'furn'); place(B,'trashbags',9.4,-7.8,0,3,5); place(B,'pallet',9.5,6.8,Math.PI/2); place(B,'trashbags',8.5,8.8,0,2,8);
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
  /* the lot's fences: a hole in the north one onto the lane, the east one at the edge of town */
  place(B,'chainlink',12.2,-15,0,4.4); place(B,'chainlink',17.9,-15,0,5.2); addBox(10,14.4,-15.05,-14.95,0,1.5,'fence'); addBox(15.3,20.5,-15.05,-14.95,0,1.5,'fence');
  place(B,'chainlink',20.5,-2.5,Math.PI/2,25); addBox(20.45,20.55,-15,9.5,0,1.5,'fence');
  place(B,'auto',18.4,-11.2,.25,0x6a4a3a,'sedan',{burnt:true}); addBox(17.3,19.5,-13.4,-9.0,0,1.15,'furn'); place(B,'auto',13.0,-12.3,1.9,0x4a6a5a,'pickup',{hub:false,plate:'CHI'}); addBox(10.6,15.4,-13.4,-11.2,0,1.3,'furn');
  place(B,'barrelfire',16,-9); addBox(15.7,16.3,-9.3,-8.7,0,.9,'furn'); Lt([16,1.3,-9],[1.9,.85,.32],6.5,'city','fire');
  place(B,'tires',19.4,-6.0,0,4,3); addBox(19.05,19.75,-6.35,-5.65,0,.8,'furn'); place(B,'tires',12.3,-6.4,0,2,6); place(B,'kennel',19.4,-13.6,.3); addBox(18.6,20.2,-14.2,-13.0,0,1.05,'furn');
  place(B,'mattress',18.6,-6.2,.4); place(B,'trashbags',19.6,2.0,0,4,11); place(B,'trashbags',12,-14,0,3,12); place(B,'pallet',19.4,6.8,.4); place(B,'bottles',16.9,-7.9,0,6,17);
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

  /* ================= dressing: the concrete frames, drums, trees, curtains, what's on the ground ================= */
  frameBox(B,-1,-14,8,-5.5,WH+.2,{extra:[[3.5,-14],[3.5,-5.5],[-1,-9.75],[8,-9.75]]}); frameBox(B,-1,-5.5,8,4,WH+.2,{extra:[[3.5,4],[-1,-.75],[8,-.75]]});
  frameBox(B,-5.2,5.6,2.5,9.5,WH+.2,{extra:[[-1.4,9.5]]}); frameBox(B,10,-4.5,17,4,2.6,{band:false,rebar:true,extra:[[13.5,-4.5],[13.5,4],[10,0],[17,0]]});
  for(const [x,z] of [[-5.2,-14],[-5.2,-10.6+1.4],[-5.2,-10.6-1.4],[-5.2,1.8],[-5.2,4.2],[-5.2,-5.5],[-5.2,5.6]]) mk(box(.22,2.1,.22),mBand,G,x,1.05,z); /* gate posts and wall ends */
  for(const [x,z,c] of [[-4.75,-2.0,0xffffff],[-4.75,-1.35,0xc8d8ff],[-1.6,-13.55,0xffffff],[9.55,3.2,0xffffff],[9.55,2.6,0xb8c8e8],[19.6,7.6,0xffffff],[-9.75,-12.3,0xffffff]]){ place(B,'tambo',x,z,0,c); addBox(x-.3,x+.3,z-.3,z+.3,0,.9,'furn'); }
  place(B,'mesquite',19.2,-2.4,0,3); addBox(19.0,19.4,-2.6,-2.2,0,2,'furn'); place(B,'mesquite',12.4,8.0,0,5); place(B,'mesquite',-20.6,10.4,0,8); addBox(-20.8,-20.4,10.2,10.6,0,2,'furn');
  place(B,'palm',-12.0,13.2,0,6.5,4); addBox(-12.2,-11.8,13.0,13.4,0,3,'furn'); place(B,'palm',16.6,13.3,0,5.5,6); addBox(16.4,16.8,13.1,13.5,0,3,'furn');
  /* cloth curtains in the inside doorways */
  for(const [x,z,ry,w,t] of [[1.2,-8.5,0,1.2,tCurtACo],[.3,.2,0,1.3,tCurtBCo],[3.4,2.4,Math.PI/2,.95,tCurtCCo],[6.0,-8.5,0,.9,tCurtBCo]]){ const n=N(G,x,0,z,0,ry,0); n.live=true; FX.curtain(n,w,1.75,t); }
  for(const [x,z,ry,t] of [[-.93,-10.0,Math.PI/2,tCalendarCo],[3.32,-4.2,-Math.PI/2,tCalendarCo],[-4.0,9.43,Math.PI,tPosterVote]]) place(B,'poster',x,z,ry,t).p[1]=1.45;
  /* on the ground */
  for(const [x,z,s_,ry,t] of [[-7.8,-3.5,1.2,.4,tOilCo],[-8.8,4.6,1.0,1.4,tOilCo],[2.0,12.1,1.4,0,tOilCo],[-3.1,-11.4,1.3,.2,tOilCo],[13.4,-12.0,1.6,1.0,tOilCo],
    [-7.2,-9,2.2,.3,tCrackCo],[-8.6,8,1.8,1.1,tCrackCo],[-14,11.2,2.4,.6,tCrackCo],[6,11,2,2.1,tCrackCo],[12,-1,1.6,.5,tCrackCo],[-3,1.2,1.4,1.3,tCrackCo]]) place(B,'decal',x,z,0,t,s_,s_,ry);
  for(const [x,z,len,ry] of [[-7.7,-5,9,0],[-8.4,3,8,0],[-2,11.8,16,Math.PI/2],[14,11.6,10,Math.PI/2]]) place(B,'decal',x,z,0,tTrackCo,1.6,len,ry);
  for(const [x,z,n,sd,sp] of [[-8,-12,10,1,1.6],[-7.8,6,8,2,1.4],[-17,11.8,10,3,2],[0,12.4,9,4,2],[9,-6,10,5,.8],[9,4,8,6,.8],[18,-8,14,7,3],[14,-12.5,10,8,2.5],[12,0,8,9,1.5],[18.6,4,10,10,1.8],[-12,-1,5,11,.9]])
    place(B,'litter',x,z,0,n,sd,sp);
  for(const [x0,x1,z] of [[-23,-13,10.2],[-4,2,10.2],[10,13,10.2]]){ const w=x1-x0; mk(box(w,.072,.05),col(0xc8a830),G,(x0+x1)/2,.036,z+.02); } /* painted curb */
  place(B,'wire',0,0,0,[-9.9,6.5],[-10.2,4.0],5.4); place(B,'wire',0,0,0,[-9.9,-8],[-10.2,-11.4],5.4); place(B,'wire',0,0,0,[-9.9,-8],[-5.2,-10],5.2); place(B,'wire',0,0,0,[6,13.85],[3.8,9.5],5.0); place(B,'wire',0,0,0,[9.7,9.9],[11.6,9.5],4.8);
  place(B,'wire',0,0,0,[-5.5,-13.6],[-1,-12],5.0); place(B,'wire',0,0,0,[-17,13.85],[-18.4,9.5],5.2); place(B,'wire',0,0,0,[-17,13.85],[-21,14],5.6);
  }
  GEO_TEMP=false;
  /* ================= navigation ================= */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i; const R_=STASH_RECTS.find(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]); if(!R_) continue;
    space[id]=STASH_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])?.[4]??R_[4];
    let bl=Math.hypot(x-STASH_SHAFT[0],z-STASH_SHAFT[1])<.9; if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.4) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const NAMES={0:'COUNT',1:'KITCHEN',2:'SHAFT',3:'BED',5:'YARD',6:'PASSAGE',7:'ALLEY',8:'COURT',9:'SALA',10:'GUNS',11:'HALL',12:'STORE',13:'OBRA',14:'OBRA',15:'LOT',20:'PATIO',29:'ZAGUAN',30:'TALLER',31:'YONKE',32:'TRAILER',33:'CANTINA',34:'BACK',35:'PARKING',36:'PLAZA',37:'CANCHA'};
  const seen=new Set(),units=[]; for(const r of STASH_RECTS){ const id=r[4]; if(id<0||seen.has(id)) continue; seen.add(id); units.push({id,side:r[1]<0?-1:1,x0:r[0],x1:r[2],z0:r[1],z1:r[3],w:r[2]-r[0],apt:NAMES[id]||('ROOM '+(id-20)),door:r[0],room:true,lit:true,win:null}); }
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.6,z:0,yaw:-Math.PI/2},lights:[]});
  LM.list=lights;
  const st=batchStatic(floorN); FLOOR.batch=st;
  FLOOR.batch.far=buildFarField(floorN,{swapD:22,drawD:34}); /* stand-ins for everything past ~22 m: the whole colonia shows */
  stashLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }
/* a wall from the house builder plus its collision (through the given addBox, so a moved frame can offset it): doors and gaps are open;
   window and hole sills block to 1.4 m (you can't climb through, but people see and shoot over them) */
function stashWall(B,addB,x0,z0,x1,z1,a,b,holes=[],o={}){ wall(B,x0,z0,x1,z1,a,b,holes,o);
  const ax=Math.abs(x1-x0)>Math.abs(z1-z0),s0=ax?Math.min(x0,x1):Math.min(z0,z1),s1=ax?Math.max(x0,x1):Math.max(z0,z1),c=ax?z0:x0,h=o.h||WH,t=WT/2+.01;
  const solid=(p0,p1,y0,y1,kind)=>{ if(p1-p0<.01) return; if(ax) addB(p0,p1,c-t,c+t,y0,y1,kind); else addB(c-t,c+t,p0,p1,y0,y1,kind); };
  let s=s0; for(const q of holes.slice().sort((p,q)=>p.at-q.at)){ const p0=q.at-q.w/2,p1=q.at+q.w/2; solid(s,p0,0,h,'wall');
    if(q.win||(q.y0||0)>0) solid(p0,p1,0,1.4,'win'); if((q.y1??2.1)<h) solid(p0,p1,q.y1??2.1,h,'wall'); s=p1; }
  solid(s,s1,0,h,'wall'); }

/* dark: no moon to speak of. Everything you see is lit by something: sodium lamps, bulbs, the TV, the fire, candles */
const STASH_LIGHT={amb:[.018,.018,.026],dir:[.3,1,.2],dirCol:[.03,.032,.05],fog:[.018,.014,.016],fogNear:10,fogFar:95}; /* a light haze with a little sodium in it, no wall: past ~22 m the far field (38-farfield.js) stands in, out to the edge of the colonia; the last of the haze dissolves into the sky */
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
  stashCast(); stashLoot(); for(const R of RACK) if(!R.merged){ mergeTree(R.node); R.merged=true; } visionApply(); stashTag(); if(XR.on) vrToast('Find the shaft in the stash house. The halcones have radios.',4); }
function goStash(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genStash(); buildRack(); buildBoard(); SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }
/* down the shaft: into the tunnel with whatever is in your hands */
function stashDescend(){ FLOOR.down=true; sfx('door',.5); const dead=enemies.filter(E=>E.dead).length,n=enemies.length,g=FLOOR.goals||{};
  const line=`El pozo · ${dead} of ${n} dead${g.ledger?' · ledger taken':''}${g.radio?' · they radioed it in':' · nobody radioed'}`; if(XR.on) vrToast(line,4.5);
  setTimeout(()=>{ carryInto(goTunnel); $('floorTag').textContent=line; },700); }
/* a beat to walk: there and back, a few seconds' look at each end */
function patrolGoal(E,dt){ const P=E.patrol; if(P.wait>0){ P.wait-=dt; return null; } const q=P.pts[P.i];
  if(Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1])<.7||stuck(E,dt)){ P.i=(P.i+1)%P.pts.length; P.wait=rnd(2.5,5); freshGoal(E); return null; } return {x:q[0],z:q[1],sp:.85}; }
function tickStash(dt){ if(FLOOR.mode!=='stash') return; farTick();
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
  if(FLOOR.sky){ FLOOR.sky.p[0]=PL.x; FLOOR.sky.p[2]=PL.z; }
  if(Math.hypot(PL.x-STASH_SHAFT[0],PL.z-STASH_SHAFT[1])<.55) stashDescend(); }
