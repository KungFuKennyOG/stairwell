
/* =====================================================================================================
   THE FIVE HOUSES, in the order Ray works down the list. Each one is a roofless cutaway at 2 a.m.,
   furnished, lit (eight lights at most, like the game), with the people who are home tonight.
   ===================================================================================================== */
const S_=(t,color)=>({t,color});
const EX={siding:S_(tExSiding),brick:S_(tExBrick),conc:S_(tExConcrete),stone:S_(tExStone),clap:S_(tExClap),barn:S_(tWPbarn)};
const IN={nic:S_(tWPnicotine),yel:S_(tWPyellow),stars:S_(tWPkidStars),tile:S_(tWPtile),sage:S_(tWPsage),cream:S_(tWPcream),lav:S_(tWPlav),blue:S_(tWPblue),beige:S_(tWPbeige),white:S_(tWPwhite),cedar:S_(tWPcedar),
  damask:S_(tWPdamask),green:S_(tWPgreen),pink:S_(tWPpink),log:S_(tWPlog),kitY:S_(tWPkitchenY),panel:S_(tWPpanel),garage:S_(tWPgarage)};
const win=(at,w=1.4,y0=.9,y1=2.05)=>({at,w,y0,y1,win:true});
const door=(at,w=.9,swing=1.2,o={})=>Object.assign({at,w,y0:0,y1:2.1,door:true,swing},o);
const gap=(at,w,y1=2.2)=>({at,w,y0:0,y1});
const glass=(at,w,y0=.04,y1=WH-.04)=>({at,w,y0,y1,glass:true});
function place(H,fn,x,z,ry=0,...a){ const n=N(H.g,x,0,z,0,ry,0); FX[fn](n,...a); return n; }
const faceTo=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
function who(H,id,x,z,ry,pose,o={}){ const n=N(H.g,x,o.y||0,z,0,ry,0); const C=makeChar(id,n,'h:'+H.key); applyPose(C,pose);
  if(o.face){ C.J.headMesh.mesh.mats[0]=C.faceM[o.face]; C.J.headMesh.mesh.runs=null; } skinUpdate(C); C.node=n; H.chars.push(C); H.people.push({id,C,x,z,y:o.y||0}); return C; }
const MOON={amb:[.11,.12,.17],dir:[-.35,1,.45],dirCol:[.2,.22,.33],fog:[.018,.022,.036],fogNear:45,fogFar:110};

/* ---------------- 1 · 14 PINE HOLLOW ROAD: a rented bungalow at the edge of town ---------------- */
function buildPine(){ const H=House('pine',{name:'14 Pine Hollow Road',who:'Dale Pruitt',num:1,kind:'Rented bungalow · edge of town',
  note:'One storey, thin walls, a dog two houses down. Dale sold the raid for four grand and spent it on the TV he\'s asleep in front of. The quietest house on the list and the most personal: the first kill that\'s yours.',
  plays:'Fists and whatever\'s in the kitchen. The back door is unlocked; the front door is loud. Mason\'s nightlight is on.',
  cam:{t:[0,.6,1.2],th:.55,ph:.9,r:17.5}});
  floor(H,-10,-8,10,9.4,tDirt,{y:-.02,tile:2}); floor(H,-10,9.4,10,13,tAsphalt,{y:-.015,tile:2}); floor(H,5.4,-1,9.4,9.4,tGravel,{y:-.012,tile:1.5});
  floor(H,-5,0,.5,4,tFlCarpet); floor(H,.5,0,5,4,tFlLino,{tile:.8}); floor(H,-5,-4,-1,0,tFlCarpet,{color:0xb8a890}); floor(H,-1,-4,2,0,tFlKid); floor(H,2,-4,5,0,tFlTile,{tile:.6}); floor(H,-5,4,1,5.8,tFlDeck,{y:.02});
  /* exterior */
  wall(H,-5,4,.5,4,EX.siding,IN.nic,[door(-3.6,.95,-1.4),win(-1.5)]); wall(H,.5,4,5,4,EX.siding,IN.yel,[win(2.4,1.2,1.15,2.05)]);
  wall(H,-5,-4,-1,-4,IN.nic,EX.siding,[win(-3)]); wall(H,-1,-4,2,-4,IN.stars,EX.siding,[win(.5,1.0)]); wall(H,2,-4,5,-4,IN.tile,EX.siding,[win(3.5,.6,1.4,2.0)]);
  wall(H,-5,0,-5,4,IN.nic,EX.siding,[win(2)]); wall(H,-5,-4,-5,0,IN.nic,EX.siding,[win(-2)]);
  wall(H,5,0,5,4,EX.siding,IN.yel,[door(2.4,.9,1.3)]); wall(H,5,-4,5,0,EX.siding,IN.tile);
  /* interior */
  wall(H,-5,0,-1,0,IN.nic,IN.nic,[door(-4.3,.85,1.4)]); wall(H,-1,0,.5,0,IN.nic,IN.stars); wall(H,.5,0,2,0,IN.yel,IN.stars,[door(1.2,.8,-1.3)]); wall(H,2,0,5,0,IN.yel,IN.tile,[door(3.1,.75,1.2)]);
  wall(H,.5,0,.5,4,IN.yel,IN.nic,[gap(2.1,1.6)]); wall(H,-1,-4,-1,0,IN.stars,IN.nic); wall(H,2,-4,2,0,IN.tile,IN.stars);
  room(H,'Living room',-5,0,.5,4); room(H,'Kitchen',.5,0,5,4); room(H,'Bedroom',-5,-4,-1,0); room(H,'Mason\'s room',-1,-4,2,0); room(H,'Bathroom',2,-4,5,0); room(H,'Yard and truck',4.5,-2,10,9);
  /* porch */
  for(const x of [-4.9,-2,.9]) mk(box(.12,WH,.12,{at:[0,WH/2,0]}),mWood,H.roof,x,0,5.7); place(H,'sofa',-3.6,4.6,0,0x4a5a6a,1.8); place(H,'bins',5.6,-3.0,0,2);
  /* living */
  place(H,'sofa',-2.4,.55,0,0x6a5440); place(H,'coffee',-2.4,1.75); place(H,'crt',-2.4,3.62,Math.PI); place(H,'armchair',-4.3,2.2,Math.PI/2,0x7a5a3a); place(H,'rug',-2.4,2.1,0,2.6,1.8,tRugGrey);
  /* kitchen */
  place(H,'counter',2.2,3.64,Math.PI,2.4,tCabinetOak,tCounterTop,{sink:.2,stove:-.8,upper:false}); place(H,'fridge',4.55,3.55,-Math.PI/2); place(H,'dining',3.0,1.85,0,1.1,.8,2,0xa8885a); place(H,'bins',1.0,.45,0,1);
  for(const [x,z] of [[2.8,1.8],[3.15,1.95]]) mk(cyl(.03,.035,.24,6,{at:[0,.12,0]}),M(tGlass),H.g,x,.78,z);
  /* bedroom, Mason's room, bath */
  place(H,'bed',-3,-2.95,0,tQuiltMessy,1.5,{messy:true}); place(H,'nightstand',-4.2,-3.7); place(H,'dresser',-4.68,-1.0,Math.PI/2,1.0);
  place(H,'bed',1.45,-3.05,0,tQuiltDino,.95,{len:1.75,head:0x2a6ac8}); place(H,'toys',.1,-1.7,0,3); place(H,'poster',-.95,-2.2,Math.PI/2,tPoster('#1a3a2a','#6aa86a',985)).p[1]=1.5;
  place(H,'tub',3.15,-3.55); place(H,'toilet',4.62,-2.3,-Math.PI/2); place(H,'vanity',2.38,-1.4,Math.PI/2);
  /* yard */
  place(H,'car',7.4,3.2,-.08,0x6a4a34,'pickup'); place(H,'chainlink',-9.6,0,Math.PI/2,16); place(H,'chainlink',0,-7.6,0,19); place(H,'chainlink',9.6,0,Math.PI/2,16);
  place(H,'tree',-7.4,-5.2,0,5.5,2,3); place(H,'tree',7.6,-5.6,0,4.6,1.6,4); place(H,'streetlight',8.6,10.8,Math.PI); place(H,'mailbox',4.8,8.6);
  /* roof */
  gable(H,-5,-4,5,4,1.7,tShingle); flatRoof(H,-5,4,1,5.8,.15,0x2a2624);
  /* lights */
  const tv=light(H,[-2.4,1.0,3.0],[.5,.65,1.3],5.5); flicker(H,tv,'tv');
  light(H,[2.6,2.5,2.0],[1.1,1.1,.95],6,'tube'); light(H,[-.75,.35,-3.6],[1.0,.7,.35],3); light(H,[3.5,2.25,-2.0],[.7,.8,.9],3.5,'bulb'); light(H,[-3.6,2.25,4.9],[1.4,.85,.4],5.5,'bulb'); light(H,[8.6,5.6,9.7],[1.5,.85,.4],12);
  mk(box(.12,.08,.06),M(null,{color:0xffc070,unlit:true}),H.g,-.8,.3,-3.93);
  /* people */
  who(H,'dale',-2.65,.62,0,'sit',{face:'sleep'}); who(H,'corner',-.75,2.35,faceTo(-.75,2.35,-2.4,3.6),'idle'); who(H,'crystal',2.0,3.0,0,'idle');
  who(H,'mason',1.45,-2.9,0,'sleep',{y:.42}); who(H,'cutter',6.1,5.6,faceTo(6.1,5.6,7.4,3.2),'idle');
  return H; }

/* ---------------- 2 · 9 MAPLE COURT: the sergeant's split-level ---------------- */
function buildMaple(){ const H=House('maple',{name:'9 Maple Court',who:'Sgt. Walt Kessler',num:2,kind:'Suburban split-level · cul-de-sac',
  note:'A nice street, a nice lawn, a trampoline, a basketball hoop. Poker night in the kitchen: Kessler and two friends from the job, guns on their belts. His wife is watching TV. Both kids are awake.',
  plays:'Cops who fight like Ray, in a house full of witnesses. Through the garage is quiet; the garage also holds his gun safe.',
  cam:{t:[2.5,.6,.6],th:.5,ph:.9,r:22}});
  floor(H,-12,-12,16,12,tLawn,{y:-.02,tile:2}); floor(H,7.5,5,12,12,tAsphalt,{y:-.015,tile:2}); floor(H,-2.6,5,-1.4,11.6,tPaving,{y:-.012}); floor(H,-12,11.6,16,13,tPaving,{y:-.01,tile:1.2}); floor(H,-12,13,16,17,tAsphalt,{y:-.015,tile:2});
  floor(H,-7,0,-1,5,tFlOak); floor(H,-1,0,7,5,tFlTile,{tile:.5}); floor(H,-7,-5,-2,0,tFlCarpet,{color:0xc8b8a0}); floor(H,-2,-5,1.5,0,tFlCarpet,{color:0xb0a0d0}); floor(H,1.5,-5,4.5,0,tFlKid); floor(H,4.5,-5,7,0,tFlTile,{tile:.5}); floor(H,7,-2,12.5,5,tFlConc,{tile:2});
  /* exterior */
  wall(H,-7,5,-1,5,EX.brick,IN.sage,[win(-4.6,2.0,.7,2.1),door(-2.2,.95,-1.3,{doorT:tFireDoor})]); wall(H,-1,5,7,5,EX.brick,IN.cream,[win(1.5,1.4,1.15,2.05),win(5)]);
  wall(H,-7,-5,-2,-5,IN.beige,EX.brick,[win(-4.5)]); wall(H,-2,-5,1.5,-5,IN.lav,EX.brick,[win(-.3,1.2)]); wall(H,1.5,-5,4.5,-5,IN.blue,EX.brick,[win(3,1.2)]); wall(H,4.5,-5,7,-5,IN.tile,EX.brick,[win(5.8,.6,1.4,2.0)]);
  wall(H,-7,0,-7,5,IN.sage,EX.brick,[win(2.5,1.6)]); wall(H,-7,-5,-7,0,IN.beige,EX.brick,[win(-2.5)]);
  wall(H,7,0,7,5,IN.garage,IN.cream,[door(3,.9,-1.3)]); wall(H,7,-2,7,0,IN.garage,IN.tile); wall(H,7,-5,7,-2,EX.brick,IN.tile);
  wall(H,7,5,12.5,5,EX.brick,IN.garage,[{at:9.75,w:4.6,y0:0,y1:2.25}]); wall(H,7,-2,12.5,-2,IN.garage,EX.brick); wall(H,12.5,-2,12.5,5,EX.brick,IN.garage);
  mk(box(4.6,.4,.12),col(0xe2ddd2),H.g,9.75,2.45,5);
  /* interior */
  wall(H,-7,0,-2,0,IN.sage,IN.beige,[door(-3.1,.85,1.3)]); wall(H,-2,0,-1,0,IN.sage,IN.lav); wall(H,-1,0,1.5,0,IN.cream,IN.lav,[door(.3,.8,1.3)]); wall(H,1.5,0,4.5,0,IN.cream,IN.blue,[door(2.3,.8,1.4)]); wall(H,4.5,0,7,0,IN.cream,IN.tile,[door(5.3,.75,1.2)]);
  wall(H,-1,0,-1,5,IN.cream,IN.sage,[gap(2.6,2.4)]); wall(H,-2,-5,-2,0,IN.lav,IN.beige); wall(H,1.5,-5,1.5,0,IN.blue,IN.lav); wall(H,4.5,-5,4.5,0,IN.tile,IN.blue);
  room(H,'Kitchen · poker night',-1,0,7,5); room(H,'Den',-7,0,-1,5); room(H,'Master bedroom',-7,-5,-2,0); room(H,'Ellie\'s room',-2,-5,1.5,0); room(H,'Ben\'s room',1.5,-5,4.5,0); room(H,'Garage',7,-2,12.5,5);
  /* den */
  place(H,'flatTV',-6.78,2.5,Math.PI/2,1.4,.8,1.35); place(H,'sectional',-3.4,2.0,-Math.PI/2,0x5a5e66); place(H,'coffee',-5.0,2.5,Math.PI/2,false); place(H,'rug',-4.6,2.5,0,3,3.2,tRugGrey); place(H,'lamp',-1.6,4.4); place(H,'photo',-4.6,.08,0,.9,.6).p[1]=1.6;
  /* kitchen */
  place(H,'counter',1.4,4.64,Math.PI,4.0,tCabinetW,tCounterTop,{sink:-.1,stove:-1.4,upper:false}); place(H,'fridge',-.5,4.55,Math.PI,true); place(H,'island',1.4,2.4,0,2.2,.9);
  const pk=place(H,'poker',4.6,3.3); const seats=[[-Math.PI/2],[Math.PI/2],[Math.PI],[0]]; for(const [a] of seats) place(H,'chair',4.6+Math.sin(a)*.92,3.3+Math.cos(a)*.92,a+Math.PI,0x8a6a42);
  /* bedrooms, bath */
  place(H,'bed',-4.5,-3.95,0,tQuiltNavy,1.6); place(H,'nightstand',-5.7,-4.65); place(H,'nightstand',-3.3,-4.65); place(H,'dresser',-6.68,-1.4,Math.PI/2,1.2);
  place(H,'bed',.65,-4.0,0,tQuiltPurple,1.0,{len:1.9,head:0xe8e2d4}); place(H,'desk',-1.55,-1.6,Math.PI/2); place(H,'poster',-1.0,-4.93,0,tPoster('#2a2a3a','#e86aa8',986)).p[1]=1.6;
  place(H,'bed',3.9,-4.05,0,tQuiltRocket,.95,{len:1.8,head:0xc8402e}); place(H,'toys',2.7,-2.2,0,5);
  place(H,'tub',5.75,-4.55); place(H,'toilet',6.62,-2.6,-Math.PI/2); place(H,'vanity',4.85,-2.4,Math.PI/2);
  /* garage */
  place(H,'car',9.6,1.4,Math.PI,0x2a2e34,'suv'); place(H,'workbench',12.1,.8,-Math.PI/2,2.2); place(H,'safe',8.0,-1.55); place(H,'fridge',11.8,-1.55);
  /* yard */
  place(H,'hedge',-5,6.0,0,4,.7); place(H,'tree',-10.2,8.2,0,6,2.2,5); place(H,'tree',13.8,-8.4,0,5.5,2,6); place(H,'tree',-10,-9,0,5,1.8,7); place(H,'trampoline',-2.8,-8.6); place(H,'hoop',12.95,7.6,-Math.PI/2);
  place(H,'mailbox',-.6,11.4); place(H,'streetlight',14.8,13.2,Math.PI); place(H,'picket',-9.5,-11.6,0,5); place(H,'bins',12.9,-1.0,Math.PI/2,2);
  gable(H,-7,-5,7,5,1.9,tShingle,.45,null,tExBrick); gable(H,7,-2,12.5,5,1.2,tShingle,.35,null,tExBrick);
  /* lights */
  light(H,[4.6,1.85,3.3],[1.6,1.15,.6],4.6,'pendant'); light(H,[1.4,2.1,2.4],[1.15,1.0,.78],5.2,'pendant'); const tv=light(H,[-5.8,1.2,2.5],[.5,.65,1.3],5.5); flicker(H,tv,'tv');
  light(H,[-1.2,1.05,-1.6],[.45,.55,1.0],3); light(H,[4.2,.4,-2.0],[1.0,.7,.35],2.6); light(H,[9.8,2.5,1.5],[1.1,1.15,1.2],7,'tube'); light(H,[-2.2,2.3,5.5],[1.4,.9,.45],5,'bulb'); light(H,[14.8,5.6,12.2],[1.5,.85,.4],12);
  /* people */
  who(H,'kessler',4.6-.92,3.3,Math.PI/2,'sit'); who(H,'offduty',4.6+.92,3.3,-Math.PI/2,'sit'); who(H,'offduty',4.6,3.3-.92,0,'sit');
  who(H,'linda',-3.55,1.6,-Math.PI/2,'sit'); who(H,'ellie',.25,-.75,0,'phone'); who(H,'ben',2.35,-.85,0,'idle');
  return H; }

/* ---------------- 3 · 220 CRESTLINE DRIVE: the lawyer's glass house in the hills ---------------- */
function buildCrest(){ const H=House('crest',{name:'220 Crestline Drive',who:'Martin Ashby',num:3,kind:'Glass house · up in the hills',
  note:'Every wall that faces the view is glass, which means everyone at the party can see in every direction. Forty guests, a bartender, four private security. Ashby is in the middle of it, on the phone.',
  plays:'Hard to hide, easy to be seen. Kill the lights and the glass turns into mirrors. Security moves Ashby to the panic room behind the study the moment anything goes wrong.',
  cam:{t:[-2,.6,1.8],th:.4,ph:.92,r:23}});
  floorHole(H,-14,-12,12,12,-6.5,6.4,2.5,9.6,tGrass,{y:-.03,tile:2}); floor(H,5,-4,13,4,tGravel,{y:-.02,tile:1.5}); floorHole(H,-10,5,7,11.2,-6.5,6.4,2.5,9.6,tFlDeck,{y:.02,tile:1.2});
  floor(H,-9,-1,5,5,tFlConc,{tile:2}); floor(H,-9,-7,-4,-1,tFlOak); floor(H,-4,-7,-1,-1,tFlOak,{color:0xa08060}); floor(H,-1,-7,5,-1,tFlOak);
  /* city behind the hill */
  mk(plane(170,80,8,4),M(tCityLights,{unlit:true,repeat:[5,3],color:0x9a9a9a}),H.g,0,-7,-58,-Math.PI/2); mk(plane(36,8),M(null,{color:0x101410}),H.g,0,-3.5,-12.1);
  /* exterior: glass on the view sides */
  wall(H,-9,5,5,5,EX.conc,IN.white,[glass(-6.6,4.4),glass(-2.1,3.8),glass(2.7,3.8)]);
  wall(H,-9,-7,-4,-7,IN.white,EX.conc,[glass(-6.5,3,.9,2.4)]); wall(H,-4,-7,-1,-7,IN.cedar,EX.conc); wall(H,-1,-7,5,-7,IN.cedar,EX.conc,[glass(2,3,.9,2.4)]);
  wall(H,-9,-1,-9,5,IN.white,EX.conc,[glass(2,5)]); wall(H,-9,-7,-9,-1,IN.white,EX.conc,[glass(-4,3)]);
  wall(H,5,-1,5,5,EX.conc,IN.white,[door(1.0,1.1,-1.2,{doorT:tCabinetDark}),glass(3.5,2.4)]); wall(H,5,-7,5,-1,EX.conc,IN.cedar,[glass(-4,2.2,.9,2.4)]);
  /* interior */
  wall(H,-9,-1,-4,-1,IN.white,IN.white,[door(-8.3,.9,1.3)]); wall(H,-4,-1,-1,-1,IN.cedar,IN.cedar,[door(-2.5,.85,-1.3)]); wall(H,-1,-1,5,-1,IN.white,IN.cedar,[door(0,.9,1.3)]);
  wall(H,-4,-7,-4,-1,IN.cedar,IN.white); wall(H,-1,-7,-1,-1,IN.cedar,IN.cedar);
  room(H,'Great room · the party',-9,-1,1,5); room(H,'Kitchen and bar',1,-1,5,5); room(H,'Pool deck',-10,5,7,11.2); room(H,'Master suite',-9,-7,-4,-1); room(H,'Wine room',-4,-7,-1,-1); room(H,'Study · panic room',-1,-7,5,-1);
  /* great room */
  place(H,'lowSofa',-7.9,2.0,Math.PI/2,2.6); place(H,'lowSofa',-4.6,-.42,0,2.6); place(H,'coffee',-5.3,1.9,0,false); place(H,'rug',-5.4,1.8,0,4,3.2,tRugWhite); place(H,'fireplace',-.9,-.75,0,false,1.4);
  place(H,'piano',-1.6,3.4,-.5); place(H,'photo',-6.4,-.93,0,1.4,.9).p[1]=1.6;
  /* kitchen and bar */
  place(H,'counter',2.7,-.64,0,3.0,tCabinetDark,tCounterTop,{sink:.2,stove:-.9}); place(H,'fridge',4.5,-.55,0,true); place(H,'bar',3.0,1.7,0,2.6); place(H,'island',3.0,3.9,0,2.2,.9,tCabinetDark);
  /* bedrooms, wine, study */
  place(H,'bed',-6.5,-5.9,0,tQuiltWhite,1.8,{len:2.1,head:0x2a2420}); place(H,'nightstand',-7.8,-6.65); place(H,'nightstand',-5.2,-6.65); place(H,'armchair',-8.2,-2.0,2.2,0xe2ded4);
  place(H,'bookcase',-2.5,-6.78,0,2.4,2.2); place(H,'bookcase',-3.78,-4,Math.PI/2,2.0,2.2);
  place(H,'desk',2,-5.9,0); place(H,'bookcase',4.78,-4.3,-Math.PI/2,1.6,2.2); place(H,'safe',-.5,-6.4,0);
  /* deck and pool */
  place(H,'pool',-2,8,0,9,3.2); place(H,'lounger',4.2,7.6,0); place(H,'lounger',5.3,7.6,0); place(H,'lounger',-8.2,8.4,.1);
  mk(plane(17,1.1),MT(tGlassCut,{cut:true,double:true,repeat:[20,1]}),H.g,-1.5,.55,11.2); mk(box(17,.05,.06),mFrame,H.g,-1.5,1.1,11.2);
  place(H,'strings',0,0,0,[[-9,5.3],[-2,10.8],[6,5.3]]);
  place(H,'car',8.8,-.4,Math.PI,0xe8e4dc,'sedan'); place(H,'tree',-12,-8,0,6,2.2,8); place(H,'tree',9.5,-9,0,5,1.8,9); place(H,'hedge',8.5,4.6,0,7,.8,1.2);
  flatRoof(H,-9,-7,5,5,.9,0x2a2826);
  /* lights */
  light(H,[-4.5,2.4,2.0],[1.3,1.0,.7],7.5); light(H,[3.0,2.15,3.9],[1.2,1.05,.85],5.2,'pendant'); const pl=light(H,[-2,.1,8],[.3,1.0,1.4],7); flicker(H,pl,'pool');
  light(H,[-1,2.4,8.2],[1.3,.95,.55],8.5); light(H,[2,1.2,-5.1],[1.2,.95,.6],4.2); light(H,[-6.5,1.0,-4.6],[.9,.7,.5],4.2); light(H,[5.7,2.3,1.0],[1.2,1.0,.8],5.5);
  /* people */
  who(H,'ashby',-3.6,2.3,faceTo(-3.6,2.3,-5.6,3.4),'phone'); who(H,'guest',-5.6,3.4,faceTo(-5.6,3.4,-3.6,2.3),'idle'); who(H,'guestm',-4.6,4.1,faceTo(-4.6,4.1,-3.6,2.3),'idle');
  who(H,'barman',3.0,1.02,0,'idle'); who(H,'suit',6.1,1.0,Math.PI/2,'idle'); who(H,'suit',4.6,9.9,-Math.PI/2+.3,'idle');
  return H; }

/* ---------------- 4 · THE SALLIS ESTATE: the developer who owns the tower ---------------- */
function buildSallis(){ const H=House('sallis',{name:'The Sallis estate',who:'Victor Sallis',num:4,kind:'Stone mansion · behind a gate',
  note:'Gatehouse, fountain, portico, a grand stair, a library nobody reads in. Six guards with SMGs and a room full of monitors. Sallis comes down in his robe with a golf club because he cannot believe anyone would dare.',
  plays:'The first house where loud is a bad idea. The monitors in the security room see the whole ground floor: kill the feed or be on it. Sophie is on the stairs.',
  cam:{t:[0,.6,1.6],th:.32,ph:.92,r:29}});
  floorHole(H,-17,-18,17,21,-4,-13,4,-9.8,tLawn,{y:-.03,tile:2}); floor(H,-12,7,12,18,tPaving,{y:-.02,tile:1.5}); floorHole(H,-6,-14,6,-8.4,-4,-13,4,-9.8,tPaving,{y:-.02,tile:1.2});
  floor(H,-11,0,-3,7,tFlOak); floor(H,-3,0,3,7,tFlMarble,{tile:1.2}); floor(H,3,0,11,7,tFlOak); floor(H,-11,-7,-4,0,tFlOak,{color:0x8a6a48}); floor(H,-4,-7,4,0,tFlTile,{tile:.6}); floor(H,4,-7,11,0,tFlConc,{tile:2});
  /* exterior */
  wall(H,-11,7,-3,7,EX.stone,IN.damask,[win(-9,1.4,.5,2.3),win(-5,1.4,.5,2.3)]); wall(H,-3,7,3,7,EX.stone,IN.damask,[door(0,1.8,-1.1,{y1:2.4})]); wall(H,3,7,11,7,EX.stone,IN.damask,[win(5,1.4,.5,2.3),win(9,1.4,.5,2.3)]);
  wall(H,-11,-7,-4,-7,IN.green,EX.stone,[win(-7.5,1.4,.6,2.2)]); wall(H,-4,-7,4,-7,IN.cream,EX.stone,[win(0,2.2,1.15,2.1)]); wall(H,4,-7,11,-7,IN.panel,EX.stone);
  wall(H,-11,0,-11,7,IN.damask,EX.stone,[win(1.4,1.4,.5,2.3),win(5.6,1.4,.5,2.3)]); wall(H,-11,-7,-11,0,IN.green,EX.stone,[win(-3.5,1.4,.6,2.2)]);
  wall(H,11,0,11,7,EX.stone,IN.damask,[win(3.5,1.4,.5,2.3)]); wall(H,11,-7,11,0,EX.stone,IN.panel,[door(-3.5,.95,1.2,{doorT:tFireDoor})]);
  /* interior */
  wall(H,-11,0,-4,0,IN.damask,IN.green,[door(-4.7,.95,1.3)]); wall(H,-4,0,-3,0,IN.damask,IN.cream); wall(H,-3,0,3,0,IN.damask,IN.cream,[door(2.2,.9,-1.2)]); wall(H,3,0,4,0,IN.damask,IN.cream); wall(H,4,0,11,0,IN.damask,IN.panel,[door(6,.9,1.3)]);
  wall(H,-3,0,-3,7,IN.damask,IN.damask,[gap(3.5,2.2,2.4)]); wall(H,3,0,3,7,IN.damask,IN.damask,[gap(3.5,2.2,2.4)]); wall(H,-4,-7,-4,0,IN.cream,IN.green,[door(-2,.9,-1.2)]); wall(H,4,-7,4,0,IN.panel,IN.cream,[door(-2,.9,1.2)]);
  room(H,'Foyer · the stair',-3,0,3,7); room(H,'Salon',-11,0,-3,7); room(H,'Dining room',3,0,11,7); room(H,'Library',-11,-7,-4,0); room(H,'Kitchen',-4,-7,4,0); room(H,'Security room',4,-7,11,0); room(H,'Garden and pool',-7,-15,7,-7.5);
  /* foyer */
  place(H,'stairs',0,4.55,0,1.8,13,.28,.2); place(H,'rug',0,5.8,0,2.2,1.6,tRugRed);
  /* salon */
  place(H,'sofa',-7.2,.56,0,0x8a7a5a,2.2); place(H,'sofa',-7.2,5.7,Math.PI,0x8a7a5a,2.2); place(H,'coffee',-7.2,3.15,0,false); place(H,'rug',-7.2,3.15,0,3.8,2.8,tRugRed); place(H,'fireplace',-10.72,3.15,Math.PI/2,true,1.8);
  place(H,'piano',-4.5,5.3,-.4); place(H,'armchair',-9.4,1.3,.8,0x6a1a2a); place(H,'lamp',-3.5,.5);
  /* dining */
  place(H,'dining',7,3.5,0,4.2,1.1,8,0x3a2414,0x5a1a22);
  /* library */
  place(H,'bookcase',-9.4,-6.8,0,2.6,2.4); place(H,'bookcase',-6.4,-6.8,0,2.6,2.4); place(H,'bookcase',-10.8,-3.2,Math.PI/2,2.2,2.4); place(H,'desk',-7.5,-3.6,0,false,0x3a2414); place(H,'armchair',-5.0,-1.2,-2.4,0x2a4a3a); place(H,'rug',-7.5,-3.2,0,3.4,2.6,tRugRed);
  /* kitchen */
  place(H,'counter',-.6,-6.64,0,5.0,tCabinetW,tCounterTop,{sink:-1,stove:1.3}); place(H,'fridge',3.45,-6.55,0,true); place(H,'island',0,-3.9,0,2.8,1.0);
  /* security */
  place(H,'monitors',7.5,-6.55); place(H,'safe',10.4,-6.45); place(H,'safe',9.5,-6.45);
  /* outside */
  for(const x of [-2.4,-.8,.8,2.4]) place(H,'column',x,8.5); flatRoof(H,-3,7,3,8.9,.2,0xe2ddd2); mk(box(6.4,.24,2.2),col(0xe2ddd2),H.g,0,WH+.12,7.95);
  place(H,'fountain',0,13.4); place(H,'car',6.2,12,-Math.PI/2,0x141418,'sedan'); place(H,'hedge',-12.4,10,Math.PI/2,14,.9,1.4); place(H,'hedge',12.4,10,Math.PI/2,14,.9,1.4);
  place(H,'pool',0,-11.4,0,8,3.2); place(H,'lounger',5.2,-11,0); place(H,'hedge',-8,-11,Math.PI/2,7,.8,1.2); place(H,'hedge',8,-11,Math.PI/2,7,.8,1.2);
  place(H,'tree',-14.5,-14,0,7,2.6,10); place(H,'tree',14.5,-14,0,7,2.6,11); place(H,'pine',-15,16,0,9,12); place(H,'pine',15,16,0,9,13);
  gable(H,-11,-7,11,7,2.6,tShingle,.5,null,tExStone);
  /* lights */
  place(H,'chandelier',0,3.3,0,2.15); place(H,'chandelier',7,3.5,0,2.05);
  light(H,[0,2.1,3.3],[1.5,1.25,.8],7.5); const fp=light(H,[-10.1,.6,3.15],[1.6,.7,.25],6); flicker(H,fp,'fire'); light(H,[7,2.0,3.5],[1.4,1.1,.7],6.5); light(H,[-7.5,1.3,-3.9],[1.1,.95,.55],4.5);
  light(H,[0,2.5,-3.9],[1.0,1.05,1.1],6.5,'tube'); light(H,[7.5,1.3,-5.8],[.4,.8,.55],4.5); light(H,[0,2.5,8.4],[1.4,1.0,.55],7); const pl=light(H,[0,.1,-11.4],[.3,1.0,1.4],7); flicker(H,pl,'pool');
  /* people */
  who(H,'sallis',-1.7,5.7,.3,'fight'); who(H,'grace',1.4,5.3,faceTo(1.4,5.3,.4,2.64),'watch'); who(H,'sophie',.4,2.64,0,'idle',{y:1.6}); who(H,'helena',-5.1,4.4,.6,'phone');
  who(H,'guard',-1.4,9.6,0,'idle'); who(H,'guard',7.5,-5.73,Math.PI,'sit'); who(H,'guard',5.6,-9.8,-1.4,'idle');
  return H; }

/* ---------------- 5 · THE KANE RANCH: past the city limits ---------------- */
function buildKane(){ const H=House('kane',{name:'The Kane ranch',who:'Ozzie Kane',num:5,kind:'Farmhouse and barn · out past the city limits',
  note:'An old farmhouse, a red barn full of what keeps the city running, floodlights on poles, pickups, a fire pit with men around it. His mother is on the porch. His grandson is supposed to be asleep.',
  plays:'Open ground under floodlights, then close quarters in the house. The hands know the land in the dark. Shoot out the floods and it becomes your kind of fight.',
  cam:{t:[0,.6,.4],th:.42,ph:.95,r:31}});
  floor(H,-17,-13,17,14,tYard,{y:-.03,tile:2.4}); floor(H,-12,0,-6,5,tFlPine); floor(H,-6,0,0,5,tFlLino,{tile:.8}); floor(H,-12,-4,-7,0,tFlPine); floor(H,-7,-4,-3.5,0,tFlPine); floor(H,-3.5,-4,0,0,tFlTile,{tile:.6});
  floor(H,-12,5,0,7,tFlDeck,{y:.03}); floor(H,4,-6,12,4,tFlBarn,{tile:1.5});
  /* farmhouse exterior */
  wall(H,-12,5,-6,5,EX.clap,IN.log,[win(-10.2),door(-7.3,.95,-1.3)]); wall(H,-6,5,0,5,EX.clap,IN.kitY,[win(-4.1,1.4,1.15,2.05)]);
  wall(H,-12,-4,-7,-4,IN.log,EX.clap,[win(-9.5)]); wall(H,-7,-4,-3.5,-4,IN.log,EX.clap,[win(-5.3,1.1)]); wall(H,-3.5,-4,0,-4,IN.tile,EX.clap,[win(-1.6,.6,1.4,2.0)]);
  wall(H,-12,0,-12,5,IN.log,EX.clap,[win(4.2)]); wall(H,-12,-4,-12,0,IN.log,EX.clap,[win(-2)]); wall(H,0,0,0,5,EX.clap,IN.kitY,[door(2.6,.9,1.3)]); wall(H,0,-4,0,0,EX.clap,IN.tile);
  /* interior */
  wall(H,-12,0,-7,0,IN.log,IN.log,[door(-11.2,.85,1.3)]); wall(H,-7,0,-6,0,IN.log,IN.log); wall(H,-6,0,-3.5,0,IN.kitY,IN.log,[door(-5.0,.8,-1.3)]); wall(H,-3.5,0,0,0,IN.kitY,IN.tile,[door(-1.8,.75,1.2)]);
  wall(H,-6,0,-6,5,IN.kitY,IN.log,[gap(2.5,1.6)]); wall(H,-7,-4,-7,0,IN.log,IN.log); wall(H,-3.5,-4,-3.5,0,IN.tile,IN.log);
  /* barn */
  wall(H,4,4,12,4,EX.barn,EX.barn,[{at:8.2,w:3.6,y0:0,y1:WH}]); wall(H,4,-6,12,-6,EX.barn,EX.barn); wall(H,4,-6,4,4,EX.barn,EX.barn,[door(-3,.9,1.3,{doorT:tCrate})]); wall(H,12,-6,12,4,EX.barn,EX.barn,[win(-1,1.0,1.2,2.0)]);
  room(H,'Living room',-12,0,-6,5); room(H,'Kitchen',-6,0,0,5); room(H,'Porch',-12,4.5,0,7.5); room(H,'Mae\'s room',-12,-4,-7,0); room(H,'Jesse\'s room',-7,-4,-3.5,0); room(H,'The barn',4,-6,12,4); room(H,'Fire pit and yard',-2,-6,8,12);
  /* living */
  place(H,'fireplace',-11.72,2.5,Math.PI/2,true,1.6); place(H,'antlers',-11.9,2.5,Math.PI/2).p[1]=1.95; place(H,'sofa',-9.3,.55,0,0x5a3a24,2.0); place(H,'armchair',-8.2,3.3,-2.2,0x6a4a2a); place(H,'rug',-9.6,2.4,0,3.2,2.4,tRugRed); place(H,'coffee',-9.3,1.9,0,true);
  /* kitchen */
  place(H,'counter',-4.1,4.64,Math.PI,3.0,tCabinetOak,tCounterTop,{sink:0,upper:false}); place(H,'fridge',-.45,.5,-Math.PI/2); place(H,'woodstove',-.55,4.2,-Math.PI/2); place(H,'dining',-3.2,2.5,0,2.4,.95,6,0x6a4a2a,0x5a3a24);
  /* bedrooms, bath */
  place(H,'bed',-10.2,-2.95,0,tQuiltCrazy,1.4,{len:1.9,head:0x3a2414}); place(H,'dresser',-7.55,-1.2,-Math.PI/2,1.0); place(H,'nightstand',-11.3,-3.65);
  place(H,'bed',-6.3,-2.95,0,tQuiltNavy,.95,{len:1.8,head:0x5a3a24}); place(H,'poster',-3.62,-2.2,-Math.PI/2,tPoster('#3a2a1a','#c8a050',987)).p[1]=1.5; place(H,'lamp',-6.6,-1.0);
  place(H,'tub',-1.75,-3.55); place(H,'toilet',-.4,-1.5,-Math.PI/2);
  /* porch */
  for(const x of [-11.9,-8,-4,-.1]) mk(box(.14,WH,.14,{at:[0,WH/2,0]}),MT(tWoodLight),H.roof,x,0,6.95); place(H,'rocker',-9.4,5.9,0); place(H,'rail',-6,7,0,12);
  /* barn */
  place(H,'bales',5.6,2.6,0,5); place(H,'bales',10.4,-4.8,0,4); place(H,'stash',10.9,-1.2,-Math.PI/2); place(H,'stash',10.9,.4,-Math.PI/2); place(H,'tractor',6.0,-3.4,.1); place(H,'workbench',8.6,-5.6,0,2.4);
  /* yard */
  place(H,'firepit',1.6,-1.2); place(H,'bales',1.6,-2.7,0,1); place(H,'car',2.4,9.2,-.35,0x8a2a22,'pickup'); place(H,'car',13.6,8.2,2.7,0xe2ddd2,'pickup');
  place(H,'floodpole',1.4,7.6,0,2.6); place(H,'floodpole',14.6,-9.4,0,-.8); place(H,'tank',-14.6,-8.4); place(H,'kennel',14.2,4.2,-Math.PI/2); place(H,'trough',-14.4,9.4,Math.PI/2);
  place(H,'rail',0,13.4,0,32); place(H,'rail',-16.4,0,Math.PI/2,26); place(H,'rail',16.4,0,Math.PI/2,26); place(H,'rail',0,-12.6,0,32);
  for(const [x,z,h] of [[-19,-10,9],[19,-11,10],[-20,5,8],[20,6,9],[-6,-15,9],[8,-16,10]]) place(H,'pine',x,z,0,h,x*3+z);
  gable(H,-12,-4,0,5,2.0,tTin,.5); gable(H,4,-6,12,4,2.4,tTin,.4,null,tWPbarn); mk(box(12.2,.1,2.3),MT(tTin),H.roof,-6,WH-.02,6.05,.12,0,0);
  /* lights */
  light(H,[1.4,6.0,6.9],[1.15,1.2,1.3],15); light(H,[14.6,6.0,-8.7],[1.05,1.1,1.2],14); const fp=light(H,[1.6,.7,-1.2],[1.7,.8,.25],6.5); flicker(H,fp,'fire');
  light(H,[-3.0,2.3,2.7],[1.3,1.05,.7],6,'bulb'); const fpl=light(H,[-11.2,.6,2.5],[1.6,.7,.25],5.5); flicker(H,fpl,'fire'); light(H,[-7.3,2.4,5.9],[1.4,.9,.45],5,'bulb'); light(H,[8.2,2.2,-1],[1.4,1.0,.5],7.5,'bulb'); light(H,[-6.6,1.1,-1.3],[1.0,.8,.5],2.8);
  /* people */
  who(H,'kane',-10.2,3.6,1.25,'fight'); who(H,'mae',-9.4,5.9,0,'sit'); who(H,'jesse',-5.2,-3.35,Math.PI,'watch'); who(H,'cook',-4.1,4.0,0,'idle');
  who(H,'hand',8.6,4.9,0,'idle'); who(H,'hand',2.9,-.3,-1.6,'idle'); who(H,'hand',9.6,-1.0,Math.PI/2,'fight');
  return H; }

const HOUSE_BUILDERS={pine:buildPine,maple:buildMaple,crest:buildCrest,sallis:buildSallis,kane:buildKane};
const HS={};
function getHouse(k){ if(!HS[k]){ GEO_TEMP=false; HS[k]=HOUSE_BUILDERS[k](); } return HS[k]; }
