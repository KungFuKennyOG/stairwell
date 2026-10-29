/* =====================================================================================================
   THE WAREHOUSE: level 5. The tunnel's exit ladder comes up through a drain hatch inside the Arroyo County
   Sheriff's property and evidence warehouse, on the US side, at night. The men with badges who run it sell the
   seizures back out of the docks. Same scale as the tunnel: the world is 88 x 52 m (setWorld 44,26), built in 6 m tiles.
     the drain room   you start here (armoury rack, spawn board, map). One door, east, onto the warehouse floor
     back of house    a 2.6 m block along the west wall: front offices (the sergeant, dispatch, the lobby), the
                      corridor, the break room, lockers, the electrical room (main breaker: lights out), the
                      evidence cage, the cold room with the count, the impound bay
     the floor        five runs of pallet racking 5 m tall, broken at different places so the aisles are a maze,
                      two of them blocked; high-bay lights over some aisles, the rest dark
     the docks        staging lanes, a forklift, a docked trailer, one dock door open to the yard, the dock office
     outside          the staff lot north, the truck lane south, a dark passage west, and the yard east: trailers,
                      a dropped container (a side area), the tractor, the guard shack and the gate out
   Three ways out to the gate: through the racks and the open dock door; north through the offices and the lot;
   south through the impound bay and the truck lane. Nineteen men. Workers, the dispatcher and the gate guard
   carry radios: two seconds after one sees you, the whole place knows. Cops in vests carry flashlights; outside
   and once the power is cut they turn them on, and a beam on you is the same as standing under a light.
   ===================================================================================================== */
const WARE={RX:44,RZ:26,RH:7,BH:7,SH:2.6};
/* spaces: [x0,z0,x1,z1,id]. Inner rooms first. -2 the drain room, -1 corridors and outside, >=0 rooms (the spawn map) */
const WARE_RECTS=[[-13,-2,-10.2,2,-2],
  [-26,-17,-20.5,-11.6,0],[-20.5,-17,-15.5,-11.6,1],[-15.5,-17,-10.2,-11.6,2],[-26,-11.6,-10.2,-9.8,-1],
  [-26,-9.8,-19,2,3],[-19,-9.8,-13,-5.2,4],[-19,-5.2,-13,2,5],[-13,-9.8,-10.2,-2,-1],
  [-26,2,-17,8.5,6],[-17,2,-10.2,8.5,7],[-26,8.5,-10.2,15,8],
  [14.6,11.6,17.9,14.9,11],[-10.2,-17,9,15,9],[9,-17,18,15,10],
  [22,3,34.2,5.44,12],[38.5,12.5,41.5,15.5,13],
  [-29.5,-25.8,18,-17,-1],[-29.5,15,18,25.8,-1],[-29.5,-17,-26,15,-1],[18,-25.8,43.8,25.8,14]];
const WARE_EXIT=[43.2,20];
const WARE_SW=[-18.86,1.32,-1.0]; /* the main breaker's handle, on the electrical room's west wall */
const WARE_LOG=[-22.95,.8,-15.55]; /* the manifest, on the sergeant's desk */
/* racking: x0,x1 and the runs along z (gaps between them are the ways through) */
const WARE_RACKS=[[-7.4,-6.2,[[-14.2,-6.2],[-4.2,4.6],[6.6,12.4]]],[-3.6,-2.4,[[-14.2,-9.4],[-7.4,1.8],[3.8,12.4]]],[.2,1.4,[[-14.2,-3.0],[-1.0,7.8],[9.8,12.4]]],
  [4.0,5.2,[[-14.2,-10.2],[-8.2,0],[2.0,12.4]]],[7.8,9.0,[[-14.2,-5.0],[-3.0,5.8],[7.8,12.4]]]];
/* weapons lying around: [key, x, y, z, yaw] */
const WARE_LOOT=[['can',-23.3,.84,4.5,.4],['machete',-22.6,.82,4.75,1.2],['shotgun',-15.6,.95,-7.2,.1],['smg',33.0,1.16,4.2,.3],['bigcan',-22.2,.84,-15.4,-.3],['pistol',40.9,.84,13.15,1.4],['bottle',-24.2,.95,-6.9,0]];
const WARE_CAST=[
  {id:'worker',name:'Dwayne',x:-8.8,z:-12.4,hd:0,radio:true,extra:'I just drive the forklift, man—',detail:'drives the forklift'},
  {id:'deputy',name:'Haynes',x:-1.1,z:-6,hd:0,torch:2,patrol:[[-1.1,-13.4],[-1.1,11.6]],extra:'Kessler said nobody\'d come—',detail:'walks the racks'},
  {id:'deputy3',name:'Pruitt',x:6.5,z:8,hd:Math.PI,torch:2,patrol:[[6.5,11.6],[6.5,-13.4]],extra:'I got two years to my pension—',detail:'walks the racks'},
  {id:'narco',name:'Voss',x:12.6,z:10.3,hd:0,torch:1,extra:'It\'s not my call, it\'s Kessler\'s—',detail:'checks the manifests'},
  {id:'worker',name:'Lonnie',x:16.2,z:-3.5,hd:Math.PI/2,radio:true,extra:'I just load the trucks—',detail:'loads the trucks'},
  {id:'jailer',name:'Briggs',x:11.4,z:-9.2,hd:0,torch:1,extra:'Come on, man. Come on—',detail:'works the docks'},
  {id:'narco2',name:'Ochoa',x:30.2,z:3.6,hd:-Math.PI/2,torch:1,extra:'Take it. Take all of it—',detail:'counts the container'},
  {id:'sarge',name:'Sgt. Doyle',x:-22.2,z:-14.0,hd:Math.PI/2,extra:'You know who I work for?',detail:'runs the warehouse'},
  {id:'dispatch',name:'Kimball',x:-18,z:-15.3,hd:Math.PI,radio:true,extra:'I just answer the phone—',detail:'works the radio'},
  {id:'deputy2',name:'Garza',x:-23,z:-4.9,hd:Math.PI,torch:1,extra:'I got three kids, man—',detail:'on his break'},
  {id:'deputyS',name:'McCall',x:-24.4,z:-7.6,hd:-Math.PI/2,torch:1,extra:'We just move the boxes—',detail:'on his break'},
  {id:'deputy',name:'Tate',x:-17.4,z:-6.3,hd:0,torch:1,extra:'I wasn\'t even on that night—',detail:'changing shift'},
  {id:'narco',name:'Lund',x:-24.2,z:5.4,hd:Math.PI/2,torch:1,extra:'I just log it. I just log it—',detail:'works the evidence cage'},
  {id:'jailer',name:'Raines',x:-16.2,z:10.4,hd:-Math.PI/2,torch:1,extra:'I didn\'t know they were cops—',detail:'strips the impounds'},
  {id:'deputy2',name:'Dwyer',x:-14.6,z:-18.4,hd:Math.PI,torch:2,extra:'I just smoke out here, man—',detail:'smokes by the door'},
  {id:'deputyS',name:'Hale',x:-4,z:17.6,hd:-Math.PI/2,torch:2,patrol:[[-24,17.6],[9,17.6]],extra:'Don\'t— I got a daughter—',detail:'walks the truck lane'},
  {id:'deputy3',name:'Mendez',x:39.4,z:14.2,hd:Math.PI/2,radio:true,extra:'I just open the gate—',detail:'minds the gate'},
  {id:'narco2',name:'Kowalski',x:37.5,z:-6,hd:0,torch:2,patrol:[[37.5,-14],[37.5,22]],extra:'Wait— we can work this out—',detail:'walks the yard'},
  {id:'worker',name:'Ruiz',x:29.4,z:15.0,hd:Math.PI,radio:true,extra:'I just wash the trucks—',detail:'hoses down a truck'}];
const COP_OF={corner:'worker',cutter:'jailer',gunman:'deputy',doorman:'deputyS',enforcer:'narco',landlord:'sarge'};
const COP_NAMES=['Haynes','Pruitt','Voss','Briggs','Ochoa','Garza','McCall','Tate','Lund','Raines','Dwyer','Hale','Mendez','Kowalski','Ruiz','Kimball'];

/* ---------- the cops: Arroyo County deputies, the narcotics unit, detention officers, the warehouse crew ---------- */
Object.assign(HEADS,{
  deputy:{seed:1901,skin:'#d8a888',skinD:'#a87a5e',hair:'buzz',hairC:'#6a5a48',hairFront:15,shadow:true,brow:'#5a4a3a',browT:2,iris:'#5a6a7a',lip:'#a8685c',beard:'mustache',beardC:'#6a5a48'},
  deputy2:{seed:1902,skin:'#c49070',skinD:'#946446',hair:'slick',hairC:'#1a1410',hairFront:12,sideburn:36,brow:'#1a1410',browT:2,iris:'#3a2a1a',lip:'#94564a'},
  deputy3:{seed:1908,skin:'#6e4630',skinD:'#4a2c1c',hair:'buzz',hairC:'#0e0a08',hairFront:15,brow:'#0e0a08',browT:2,iris:'#1a0e08',lip:'#5e3424',beard:'goatee',beardC:'#0e0a08',white:'#d8cfc0'},
  narco:{seed:1903,skin:'#e0b494',skinD:'#b08a6c',hair:'buzz',hairC:'#8a6a4a',hairFront:15,brow:'#7a5a3a',iris:'#4a6a8a',lip:'#b07060',beard:'stubble',beardC:'#8a6a4a'},
  narco2:{seed:1904,skin:'#b07a56',skinD:'#80523a',hair:'slick',hairC:'#141010',hairFront:13,sideburn:40,shadow:true,brow:'#141010',browT:2,iris:'#2a1a10',lip:'#84483a',beard:'full',beardC:'#141010'},
  jailer:{seed:1905,skin:'#e8c0a0',skinD:'#bc9478',hair:'buzz',hairC:'#c8a868',hairFront:15,brow:'#a8885a',iris:'#5a7a9a',lip:'#c07a6a',beard:'stubble',beardC:'#b89858'},
  worker:{seed:1906,skin:'#9a6644',skinD:'#6a422a',hair:'buzz',hairC:'#100c0a',hairFront:15,brow:'#100c0a',iris:'#1a0e08',lip:'#6a3a2a',beard:'goatee',beardC:'#100c0a'},
  sarge:{seed:1907,skin:'#d4a07c',skinD:'#a47456',hair:'slick',hairC:'#a8a49c',hairFront:12,sideburn:40,brow:'#9a968e',browT:2,iris:'#4a5a6a',lip:'#9a5a4e',beard:'mustache',beardC:'#b8b4ac',age:true}
});
HEADS.deputyS=HEADS.deputy3; HEADS.dispatch=HEADS.deputy2;
const TAN='#b49e70',TAN_D='#8e7a52',OLV='#3c4432';
const tDepTorso=torsoP('deputy',1911,(x,y)=>y>T3.belt+2?[OLV,'twill',.6]:[TAN,'twill',.7],{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,7,TAN_D,.8,1); seam(I,64,T3.neck+12,64,T3.belt-4);
  buttons(I,[66],T3.neck+22,T3.belt-6,18,'#6a5a3a'); for(const x of [42,86]){ softRect(I,x-10,T3.chest-14,20,16,TAN_D,.55,1); softRect(I,x-10,T3.chest-14,20,4,mix(TAN,'#ffffff',.12),.8,.5); }
  softEll(I,42,T3.chest-24,4.5,5,'#d4ad5a',.95,.4); softRect(I,80,T3.chest-24,14,4,'#1a1a1c',.95,.4); softRect(I,81,T3.chest-23,12,2,'#c8c4b8',.8,.3);
  beltI(I,'#141416','#8a8a8e'); for(const x of [22,40,92,104]) softRect(I,x,T3.belt-5,9,11,'#18181a',.95,.6); sideSeams(I,T3.neck,T3.belt); }});
const tDepArm=armP(1912,(x,y)=>y<112?[TAN,'twill',.7]:sk('deputy'),{decor:I=>{ softEll(I,46,24,7,9,'#2e3a26',.95,.5); softEll(I,46,24,5,7,'#c8a848',.9,.4); softEll(I,46,24,3,4,'#2e3a26',.9,.3); softRect(I,0,104,64,8,TAN_D,.7,1); seam(I,16,0,16,110); }});
const tDepLeg=legP(1913,()=>[OLV,'twill'],{decor:I=>{ softLine(I,48,0,48,128,'#1a1c16',.9,2.2); seam(I,16,0,16,128); softRect(I,0,112,64,16,'#2a3022',.5,3); }});
const TV_SH=teamVest(1914,'#2a2e24','SHERIFF',null,'#d8d2b8'), TV_PO=teamVest(1915,'#141518','POLICE',null,'#e8e2d0'), TV_DT=teamVest(1916,'#1c2230','SHERIFF',null,'#c8ccd8');
const tNarTorso=torsoP('narco',1921,(x,y)=>{ if(crewNeck(x,y,13,9)) return sk('narco'); return y>T3.belt+2?['#2a3448','denim',.6]:['#3a3c40','knit',.7]; },{decor:I=>{ neckShadow(I); beltI(I,'#1a1a1c','#8a8a8e'); softRect(I,84,T3.belt-2,10,12,'#c8a040',.9,.6); }});
const tNarArm=armP(1922,()=>['#3a3c40','knit',.7],{decor:I=>softRect(I,0,110,64,18,'#2e3034',.9,2)});
const tNar2Torso=torsoP('narco2',1923,(x,y)=>{ if(vNeck(x,y,8,14)) return sk('narco2'); return y>T3.belt+2?['#3a3428','twill',.6]:[plaid(x,y,'#4a4a3a','#2e2e24','#6a6a58'),'cotton',.7]; },{decor:I=>{ neckShadow(I); beltI(I,'#2a1a10','#a8a8ac'); softRect(I,84,T3.belt-2,10,12,'#c8a040',.9,.6); }});
const tNar2Arm=armP(1924,(x,y)=>[plaid(x,y,'#4a4a3a','#2e2e24','#6a6a58'),'cotton',.7],{decor:I=>softRect(I,0,112,64,16,'#2e2e24',.6,2)});
const tNarLeg=legP(1925,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,60,8,10,.1,'#6a7a9a'); }});
const tNar2Leg=legP(1926,()=>['#3a3428','twill'],{decor:I=>{ seam(I,48,0,48,128); for(const x of [6,40]) softRect(I,x,40,16,18,'#2e2a20',.6,1); }});
const NAVYU='#232a3a',NAVYU_D='#181d29';
const tJailTorso=torsoP('jailer',1931,(x,y)=>[NAVYU,'twill',.7],{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,7,NAVYU_D,.8,1); seam(I,64,T3.neck+12,64,T3.belt-4); buttons(I,[66],T3.neck+22,T3.belt-6,18,'#0e1018');
  softEll(I,42,T3.chest-24,4.5,5,'#c8c4bc',.95,.4); beltI(I,'#0e0e10','#8a8a8e'); sideSeams(I,T3.neck,T3.belt); }});
const tJailArm=armP(1932,(x,y)=>y<112?[NAVYU,'twill',.7]:sk('jailer'),{decor:I=>{ softEll(I,46,24,6,8,'#c8a848',.9,.4); softEll(I,46,24,4,6,NAVYU_D,.9,.3); seam(I,16,0,16,110); }});
const tJailLeg=legP(1933,()=>[NAVYU,'twill'],{decor:I=>{ softLine(I,48,0,48,128,'#c8a848',.5,1.2); seam(I,16,0,16,128); }});
const HIVIS='#c8dc2a';
const tWorkTorso=torsoP('worker',1941,(x,y)=>{ if(crewNeck(x,y,14,10)) return sk('worker'); if(y>T3.belt+2) return ['#2a3448','denim',.6];
  const vest=y>T3.neck+12&&!(Math.abs(x-64)<10&&y<T3.chest)&&(x<54||x>74||y>T3.chest); return vest?[HIVIS,'poly',.5]:['#5e6064','knit',.8]; },{decor:I=>{ neckShadow(I);
  for(const y of [T3.chest+30,T3.chest+56]) { softRect(I,0,y,128,6,'#c8ccd0',.95,.6); softRect(I,0,y+1,128,1,'#ffffff',.5,.3); } for(const x of [44,84]) softRect(I,x-3,T3.neck+12,6,T3.chest-T3.neck,'#c8ccd0',.9,.5);
  softRect(I,30,T3.chest+2,10,16,'#1a1a1c',.95,.6); softRect(I,32,T3.chest-6,2,8,'#1a1a1c',.95,.3); beltI(I,'#2a1a10','#8a8a8e'); }});
const tWorkArm=armP(1942,(x,y)=>y<108?['#5e6064','knit',.8]:sk('worker'),{decor:I=>{ softRect(I,0,96,64,12,'#4e5054',.9,2); }});
const tWorkLeg=legP(1943,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,62,8,8,.1,'#6a7a9a'); softRect(I,0,100,64,28,'#5a4a34',.2,4); }});
const tSargeTorso=torsoP('sarge',1951,(x,y)=>{ if(vNeck(x,y,7,12)) return sk('sarge'); return y>T3.belt+2?['#2a2c30','wool',.6]:['#e4e2da','cotton',.6]; },{decor:I=>{ neckShadow(I);
  softRect(I,61,T3.neck+8,6,T3.belt-T3.neck-26,'#1a2236',.95,.8); softRect(I,60,T3.neck+8,8,6,'#1a2236',.95,.5); buttons(I,[70],T3.neck+20,T3.belt-6,18,'#d0ccc4');
  for(const x of [42,86]) softRect(I,x-9,T3.chest-12,18,14,'#d8d6ce',.7,1); blob(I,64,T3.nav,40,24,.08,'#d8d4c8'); stain(I,80,T3.chest+40,4,'#b8a888',1952);
  beltI(I,'#141416','#c8a040'); softEll(I,82,T3.belt+1,4.5,5,'#d4ad5a',.95,.4); softRect(I,98,T3.belt-4,12,18,'#141416',.95,1); }});
const tSargeArm=armP(1953,(x,y)=>y<44?['#e4e2da','cotton',.6]:sk('sarge'),{decor:I=>{ softRect(I,0,38,64,7,'#d4d2ca',.9,1); blob(I,32,48,30,3,-.18); }});
const tSargeLeg=legP(1954,()=>['#2a2c30','wool'],{decor:I=>seam(I,32,0,32,128)});
const tDispTorso=torsoP('dispatch',1961,(x,y)=>y>T3.belt+2?[OLV,'twill',.6]:[TAN,'twill',.7],{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,7,TAN_D,.8,1); seam(I,64,T3.neck+12,64,T3.belt-4);
  buttons(I,[66],T3.neck+22,T3.belt-6,18,'#6a5a3a'); softEll(I,42,T3.chest-24,4.5,5,'#d4ad5a',.95,.4); blob(I,64,T3.nav,40,26,.1,'#c8b488'); stain(I,70,T3.chest+30,4,'#7a5a3a',1962); beltI(I,'#141416','#8a8a8e'); }});
/* a flashlight on the left shoulder strap of the carrier: E.lens is the lamp, lit when he has it on */
const mLensOn=M(null,{color:0xf4f6ff,unlit:true}), mLensOff=M(null,{color:0x3a3c40});
function shoulderLight(J,o){ const sy=1.09*o.hf,y=1.3*o.hf-sy,z=frontAt(o,1.3,.03)+.035,n=N(J.spine,.105,y,z); n.torch=true;
  mk(cyl(.021,.021,.1,8),M(null,{color:0x161618}),n,0,0,0,Math.PI/2); mk(box(.03,.05,.02),M(null,{color:0x161618}),n,0,-.03,-.04); const l=mk(cyl(.019,.019,.004,8),mLensOff,n,0,0,.052,Math.PI/2); l._keep=true; n.lens=l; return n; }
function pBaton(g){ mk(cyl(.017,.017,.17,6),M(null,{color:0x101012}),g,0,0,.02,Math.PI/2); mk(cyl(.013,.011,.5,6),M(null,{color:0x1a1a1c}),g,0,0,.35,Math.PI/2); mk(box(.06,.02,.02),M(null,{color:0x101012}),g,.03,0,.06); return g; }
function pBar(g){ mk(box(.024,.024,.62),M(null,{color:0x3a3c40}),g,0,0,.26); mk(box(.024,.06,.03),M(null,{color:0x3a3c40}),g,0,.025,.58,-.5); mk(box(.03,.03,.14),M(null,{color:0x8a1a14}),g,0,0,0); return g; }
const BATON={prop:pBaton,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND};
Object.assign(ROSTER,{
  deputy:Object.assign({as:'gunman',side:'cop',name:'The deputies',role:'Arroyo County Sheriff · night shift at the warehouse',color:TAN,note:'Tan shirt, olive pants, a carrier that says SHERIFF and a light on the strap. Paid by the county and by Kane.',
    o:{hf:1.0,w:1.04,depth:1.04,belly:1.08,lg:1.02,ag:1.04,jacket:.006,pants:.01},torso:tDepTorso,arm:tDepArm,leg:tDepLeg,foot:tBlackBoot,extra:(J,o)=>{ plateCarrier(J,o,TV_SH); shoulderLight(J,o); }},PISTOL,{fight:AIM_ONE}),
  deputy2:Object.assign({as:'gunman',side:'cop',name:'The deputies',role:'Arroyo County Sheriff · night shift',color:TAN,o:{hf:.99,w:1.0,depth:1.02,belly:1.12,lg:.98,ag:1.0,jacket:.006,pants:.01},torso:tDepTorso,arm:tDepArm,leg:tDepLeg,foot:tBlackBoot,
    extra:(J,o)=>{ plateCarrier(J,o,TV_SH); shoulderLight(J,o); }},PISTOL,{fight:AIM_ONE}),
  deputy3:Object.assign({as:'gunman',side:'cop',name:'The deputies',role:'Arroyo County Sheriff · night shift',color:TAN,o:{hf:1.02,w:1.06,depth:1.04,lg:1.04,ag:1.06,jacket:.006,pants:.01},torso:tDepTorso,arm:tDepArm,leg:tDepLeg,foot:tBlackBoot,
    extra:(J,o)=>{ plateCarrier(J,o,TV_SH); shoulderLight(J,o); }},PISTOL,{fight:AIM_ONE}),
  deputyS:Object.assign({as:'doorman',side:'cop',name:'The deputies · shotgun',role:'Arroyo County Sheriff · carries the 870',color:TAN,o:{hf:1.02,w:1.08,depth:1.06,belly:1.06,lg:1.06,ag:1.08,jacket:.006,pants:.01},torso:tDepTorso,arm:tDepArm,leg:tDepLeg,foot:tBlackBoot,hand:tGlove,
    extra:(J,o)=>{ plateCarrier(J,o,TV_SH); shoulderLight(J,o); }},TWO(pShotgun,'shotgun')),
  narco:Object.assign({as:'enforcer',side:'cop',name:'Narcotics',role:'Kessler\'s unit · plainclothes',color:'#3a3c40',note:'Hoodie, jeans, a POLICE carrier and an MP5. The ones who bring the product in and send it back out.',
    o:{hf:1.0,w:1.04,depth:1.02,lg:1.02,ag:1.04,jacket:.008,pants:.01},torso:tNarTorso,arm:tNarArm,leg:tNarLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ plateCarrier(J,o,TV_PO); cap(J,'#141416','#141416'); shoulderLight(J,o); }},TWO(pSMG,'smg')),
  narco2:Object.assign({as:'enforcer',side:'cop',name:'Narcotics',role:'Kessler\'s unit · plainclothes',color:'#4a4a3a',o:{hf:1.01,w:1.08,depth:1.08,belly:1.1,lg:1.04,ag:1.08,jacket:.008,pants:.012},torso:tNar2Torso,arm:tNar2Arm,leg:tNar2Leg,foot:tWorkBoot,hand:tGlove,
    extra:(J,o)=>{ plateCarrier(J,o,TV_PO); shoulderLight(J,o); }},TWO(pSMG,'smg')),
  jailer:Object.assign({as:'cutter',side:'cop',name:'Detention',role:'Sheriff\'s detention officer · baton',color:NAVYU,note:'Navy uniform, a carrier, a baton. Pulled off the jail to do the heavy lifting here at night.',
    o:{hf:1.02,w:1.1,depth:1.08,belly:1.1,lg:1.08,ag:1.12,jacket:.006,pants:.01},torso:tJailTorso,arm:tJailArm,leg:tJailLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ plateCarrier(J,o,TV_DT); shoulderLight(J,o); }},BATON),
  worker:{as:'corner',side:'cop',name:'The warehouse crew',role:'Civilian crew · paid in cash',color:HIVIS,note:'Hi-vis vest, a radio on the chest, a pry bar for the crates. Not cops, but they call it in.',
    o:{hf:.99,w:1.0,depth:1.0,belly:1.06,lg:.98,ag:1.0,jacket:.012,pants:.01},torso:tWorkTorso,arm:tWorkArm,leg:tWorkLeg,foot:tWorkBoot,extra:J=>cap(J,'#8a2a1c','#8a2a1c'),prop:pBar,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND},
  sarge:Object.assign({as:'landlord',side:'cop',name:'Sgt. Doyle',role:'Runs the property room · Kessler\'s man',color:'#e4e2da',note:'Thirty years in, a badge on his belt and a revolver he likes to show people. Signs for every pallet that leaves.',
    o:{hf:.98,w:1.02,depth:1.06,belly:1.22,lg:.96,ag:.98,jacket:.006,pants:.012},torso:tSargeTorso,arm:tSargeArm,leg:tSargeLeg,foot:tLoaferB},REVOLVER),
  dispatch:Object.assign({as:'gunman',side:'cop',name:'Dispatch',role:'The night radio',color:TAN,o:{hf:.98,w:1.04,depth:1.08,belly:1.24,lg:.96,ag:1.0,jacket:.006,pants:.012},torso:tDispTorso,arm:tDepArm,leg:tDepLeg,foot:tBlackBoot,extra:J=>earpiece(J)},PISTOL,{fight:AIM_ONE})
});
function copChar(id,parent,grp){ const C=makeChar(id,parent,grp); tagHeat(C); return C; }

/* ---------- textures ---------- */
const tTiltOut=P2(32,64,(g,w,h)=>{ const r=rng(2001); vfill(g,0,0,w,h,[[0,'#a8a092'],[1,'#9c9486']]); for(let i=0;i<90;i++) R(g,`rgba(${r()>.5?255:0},${r()>.5?255:0},${r()>.5?255:0},.05)`,r()*w|0,r()*h|0,2,1);
  for(let i=0;i<5;i++){ const x=r()*w|0; vfill(g,x,0,1+(r()*2|0),20+r()*40,[[0,'rgba(60,50,40,.35)'],[1,'rgba(60,50,40,0)']]); } for(const [x,y] of [[6,14],[26,14],[6,46],[26,46]]) ell(g,x,y,1,1,'rgba(40,36,30,.5)'); },6,2002);
const tWhIn=P2(32,64,(g,w,h)=>{ const r=rng(2003); R(g,'#b2b0a8',0,0,w,h); for(let i=0;i<70;i++) R(g,'rgba(0,0,0,.05)',r()*w|0,r()*h|0,3,2); for(let i=0;i<4;i++){ const x=r()*w|0; vfill(g,x,0,1,30+r()*30,[[0,'rgba(80,70,50,.18)'],[1,'rgba(80,70,50,0)']]); } },5,2004);
const tWhConc=P2(32,32,(g,w,h)=>{ const r=rng(2005); vfill(g,0,0,w,h,[[0,'#8e8c86'],[1,'#86847e']]); R(g,'#6a6862',0,0,w,1); R(g,'#6a6862',0,0,1,h);
  for(let i=0;i<8;i++) ell(g,r()*w,r()*h,2+r()*3,1+r()*2,'rgba(40,38,34,.12)'); for(let i=0;i<3;i++){ const y=r()*h; R(g,'rgba(20,20,20,.18)',0,y|0,w,2); } },5,2006);
const tAsph=P2(32,32,(g,w,h)=>{ const r=rng(2007); R(g,'#2e2e30',0,0,w,h); for(let i=0;i<200;i++) R(g,['#3a3a3c','#262628','#444446'][r()*3|0],r()*w|0,r()*h|0,1,1);
  g.strokeStyle='rgba(10,10,10,.6)'; g.lineWidth=1; g.beginPath(); let x=r()*w,y=0; g.moveTo(x,y); for(let i=0;i<8;i++){ x+=(r()-.5)*8; y+=4; g.lineTo(x,y); } g.stroke(); },6,2008);
const tVct=P2(32,32,(g,w,h)=>{ for(let j=0;j<4;j++) for(let i=0;i<4;i++) R(g,(i+j)%2?'#b8b2a2':'#aca694',i*8,j*8,8,8); for(let k=0;k<=w;k+=8){ R(g,'rgba(0,0,0,.12)',k,0,1,h); R(g,'rgba(0,0,0,.12)',0,k,w,1); } },6,2009);
const tCarpetW=P2(32,32,(g,w,h)=>{ const r=rng(2010); R(g,'#4a5260',0,0,w,h); for(let i=0;i<180;i++) R(g,r()>.5?'#525a6a':'#424a58',r()*w|0,r()*h|0,1,1); },4,2011);
const tOffWall=wallTex('#c2c0b6',2013,(g,w,h,r)=>{ for(let i=0;i<4;i++) R(g,'rgba(0,0,0,.08)',r()*w|0,h*.7+r()*h*.2|0,4,1); },{skirt:'#3a3a38'});
const tBreakWall=wallTex('#c8bc98',2014,(g,w,h,r)=>{ stainV(g,r,'rgba(120,100,60,.25)',2,h); },{skirt:'#4a3a2a'});
const tCmuGrey=cinderPaint('#8e98a2',2015,{from:.0,chip:2,patches:2}), tCmuWhite=cinderPaint('#c8c6be',2016,{chip:2,patches:3}), tCmuSlate=cinderPaint('#56626e',2017,{from:.55,chip:3,patches:2}), tCmuBeige=cinderPaint('#b4aa94',2018,{chip:2,patches:4});
const tCmuDamp=cinderPaint('#7e8a86',2019,{from:.0,chip:5,patches:5,fn:(g,w,h,r)=>{ for(let i=0;i<6;i++){ const x=r()*w|0; vfill(g,x,h*.5,3,h*.5,[[0,'rgba(30,40,30,0)'],[1,'rgba(30,40,30,.5)']]); } }});
const tCard=P2(32,32,(g,w,h)=>{ const r=rng(2020); for(let j=0;j<3;j++) for(let i=0;i<2;i++){ const x=i*16,y=j*11; vfill(g,x,y,16,11,[[0,'#bc9462'],[1,'#a47e50']]); R(g,'#8a6a40',x,y,16,1); R(g,'#8a6a40',x,y,1,11); R(g,'#c8a878',x+6,y,4,11); if(r()>.4) R(g,'#e8e2d4',x+1,y+3,5,4); if(r()>.6) R(g,'#2a2a2a',x+11,y+6,3,2); } },6,2021);
const tWrapL=P2(16,32,(g,w,h)=>{ R(g,'#b8bcc0',0,0,w,h); for(let j=0;j<4;j++) R(g,'rgba(120,96,60,.35)',1,j*8+1,w-2,6); for(let x=2;x<w;x+=5) R(g,'rgba(255,255,255,.35)',x,0,1,h); R(g,'rgba(255,255,255,.2)',0,0,w,2); },5,2022);
const tTrailerS=P2(128,32,(g,w,h)=>{ const r=rng(2023); vfill(g,0,0,w,h,[[0,'#e2e0da'],[1,'#c8c6be']]); for(let x=0;x<w;x+=8) { R(g,'#b8b6ae',x,0,1,h); R(g,'#f2f0ea',x+1,0,1,h); }
  R(g,'#9a3a2a',0,h-6,w,2); R(g,'#2a3a6a',0,h-4,w,2); for(let i=0;i<8;i++){ const x=r()*w|0; vfill(g,x,2,2,h-6,[[0,'rgba(120,80,40,.35)'],[1,'rgba(120,80,40,0)']]); } R(g,'#a8a69e',0,0,w,1); },6,2024);
const tTrailerR=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#d8d6ce'],[1,'#bcbab2']]); R(g,'#6a6a64',15,0,2,h); for(const x of [6,11,21,26]) R(g,'#8a8a86',x,0,1,h); for(const y of [8,22]) R(g,'#5a5a56',2,y,28,1); R(g,'#a8201a',1,h-4,4,2); R(g,'#a8201a',27,h-4,4,2); },5,2025);
const tCont=P2(32,32,(g,w,h)=>{ R(g,'#7a2e1e',0,0,w,h); for(let x=0;x<w;x+=4){ R(g,'#8e3a26',x,0,2,h); R(g,'#5e2216',x+3,0,1,h); } vfill(g,0,h*.6,w,h*.4,[[0,'rgba(60,30,10,0)'],[1,'rgba(60,30,10,.5)']]); },6,2026);
const tContB=P2(32,32,(g,w,h)=>{ R(g,'#2a4a6a',0,0,w,h); for(let x=0;x<w;x+=4){ R(g,'#345a7e',x,0,2,h); R(g,'#1e3650',x+3,0,1,h); } vfill(g,0,h*.6,w,h*.4,[[0,'rgba(60,30,10,0)'],[1,'rgba(60,30,10,.4)']]); },6,2027);
const tLocker=P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#6a7a72'],[1,'#56645e']]); R(g,'#3a4440',0,0,1,h); for(const y of [3,26]) for(let i=0;i<4;i++) R(g,'#2a322e',4,y+i,8,1); R(g,'#c8ccd0',12,14,2,4); },4,2028);
const tPanelW=P2(16,32,(g,w,h)=>{ R(g,'#8a8e90',0,0,w,h); R(g,'#2a2c2e',3,4,10,22); for(let y=6;y<25;y+=2){ R(g,'#c8ccd0',4,y,3,1); R(g,'#c8ccd0',9,y,3,1); } R(g,'#d8b83a',2,28,12,3); text(g,'480V',2,28,'#1a1a1a'); },4,2029);
const tVend=P2(16,32,(g,w,h)=>{ R(g,'#a81e1a',0,0,w,h); R(g,'#1a1a1c',2,3,9,22); for(let y=5;y<24;y+=4) for(let x=3;x<10;x+=2) R(g,['#e8c83a','#2a6ac8','#e8e2d4','#3aa84a'][(x+y)%4],x,y,1,2); R(g,'#2a2a2e',12,6,3,8); R(g,'#0a0a0a',3,27,8,3); },0,2030);
const tExitS=P2(16,8,(g,w,h)=>{ R(g,'#1a0606',0,0,w,h); text(g,'EXIT',0,1,'#ff3a2a'); },0,2031);
const tMemorial=P2(32,48,(g,w,h)=>{ R(g,'#141416',0,0,w,h); R(g,'#c8a848',1,1,w-2,1); text(g,'END OF',4,3,'#e8e2d4'); text(g,'WATCH',6,9,'#e8e2d4');
  for(let j=0;j<2;j++) for(let i=0;i<3;i++){ const x=2+i*10,y=17+j*14; R(g,'#5a5a5c',x,y,8,10); ell(g,x+4,y+4,2.2,2.6,'#8a8a8c'); R(g,'#7a7a7c',x+1,y+7,6,3); } R(g,'#c8a848',1,h-2,w-2,1); },0,2032);
const tSheriffSign=P2(128,24,(g,w,h)=>{ R(g,'#1c2a1e',0,0,w,h); R(g,'#c8a848',0,0,w,2); R(g,'#c8a848',0,h-2,w,2); text(g,'ARROYO COUNTY SHERIFF',(w-textW('ARROYO COUNTY SHERIFF'))>>1,4,'#e8e2d0'); text(g,'PROPERTY & EVIDENCE',(w-textW('PROPERTY & EVIDENCE'))>>1,13,'#c8c4b0'); },0,2033);
const tWhiteB=P2(32,16,(g,w,h)=>{ R(g,'#ecebe6',0,0,w,h); R(g,'#8a8a86',0,0,w,1); R(g,'#8a8a86',0,h-1,w,1); text(g,'TUE 0300',1,2,'#2a4aa8'); text(g,'K. OK',1,9,'#a82a2a'); R(g,'#2a4aa8',20,3,9,1); R(g,'#2a4aa8',20,6,7,1); },0,2034);
const tStripes=P2(16,16,(g,w,h)=>{ for(let i=-16;i<32;i+=8){ g.fillStyle='#d8b42a'; g.beginPath(); g.moveTo(i,0); g.lineTo(i+4,0); g.lineTo(i+4+16,h); g.lineTo(i+16,h); g.fill(); } g.globalCompositeOperation='destination-over'; R(g,'#1a1a1a',0,0,w,h); },3,2035);
const tRazor=cutTex(16,8,(g,w,h,r)=>{ g.strokeStyle='#9aa0a4'; g.lineWidth=1; for(let i=0;i<3;i++){ g.beginPath(); for(let x=0;x<=w;x++){ const y=4+Math.sin(x*.8+i*2)*3; x?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); } },2036);
const tStrip=cutTex(8,32,(g,w,h)=>{ for(let x=0;x<w;x+=2) R(g,'rgba(200,220,230,.55)',x,0,1,h); },2037);
const tNoEntry=P2(32,16,(g,w,h)=>{ R(g,'#e8e2d4',0,0,w,h); R(g,'#a81e1a',0,0,w,4); text(g,'AUTHORIZED',1,5,'#1a1a1a'); text(g,'ONLY',9,11,'#1a1a1a'); },0,2038);
const tAisleN=['A','B','C','D','E'].map((c,i)=>P2(16,16,(g,w,h)=>{ R(g,'#d8b42a',0,0,w,h); R(g,'#1a1a1a',1,1,w-2,1); text(g,c,6,5,'#1a1a1a'); },0,2040+i));

/* ---------- the kit: racking, trucks, the yard ---------- */
const mUp=col(0x23468a), mBeamO=col(0xd4661c), mDeck=col(0x5a5c60), mPal=col(0x8a6a42), mYel=col(0xd8b42a), mDkG=col(0x2a2c2e), mChromeW=col(0xb8bcc0);
Object.assign(FX,{
  /* a load on a pallet: cardboard, wrapped, drums, or bricks of product */
  wLoad(g,kind,seed){ const r=rng(seed); mk(box(1.1,.14,1.0,{at:[0,.07,0]}),mPal,g);
    if(kind===0){ const hh=.5+r()*.8; mk(box(1.02,hh,.94,{at:[0,hh/2,0]}),MT(tCard),g,0,.14,0); return .14+hh; }
    if(kind===1){ const hh=.7+r()*.7; mk(box(1.04,hh,.96,{at:[0,hh/2,0]}),MT(tWrapL),g,0,.14,0); return .14+hh; }
    if(kind===2){ for(let i=0;i<4;i++) mk(cyl(.27,.27,.86,8,{at:[0,.43,0]}),col([0x2a4a8a,0x2a4a8a,0x3a3a3c][i%3]),g,(i%2-.5)*.56,.14,((i>>1)-.5)*.5); return 1.0; }
    mk(box(1.0,.55,.9,{at:[0,.275,0]}),MT(tCard),g,0,.14,0); for(let i=0;i<6;i++) mk(box(.3,.12,.22),col(0xe8e4dc),g,-.32+(i%3)*.32,.76,-.15+(i/3|0)*.3); return .82; },
  /* a run of pallet racking along local x: blue uprights, orange beams, wire decks, three loaded levels */
  wRack(g,len,seed,hit){ const r=rng(seed),H=5.0,D=1.1,bays=Math.max(1,Math.round(len/2.7)),bw=len/bays;
    for(let i=0;i<=bays;i++){ const x=-len/2+i*bw; for(const s of [-1,1]){ mk(box(.08,H,.08,{at:[0,H/2,0]}),mUp,g,x,0,s*D/2); mk(box(.16,.02,.16),mUp,g,x,.01,s*D/2); }
      for(let y=.5;y<H-.3;y+=1.1) mk(box(.03,.03,D),mUp,g,x,y,0); }
    for(let i=0;i<bays;i++){ const cx=-len/2+(i+.5)*bw;
      for(const y of [1.7,3.4,4.92]) { for(const s of [-1,1]) mk(box(bw-.08,.12,.05),mBeamO,g,cx,y,s*(D/2-.02)); if(y<4.9) mk(box(bw-.1,.02,D-.06),mDeck,g,cx,y+.07,0); }
      for(const y of [0,1.78,3.48]) for(const k of (bw>2.2?[-1,1]:[0])){ if(r()<.24) continue; const n=N(g,cx+k*bw/4,y,0,0,(r()-.5)*.06,0),h=FX.wLoad(n,r()<.45?0:r()<.7?1:r()<.85?2:3,seed*31+i*7+y*3+k); if(hit) hit(cx+k*bw/4,y,h); } } }, /* about a quarter of the slots empty: you can see and shoot through them */
  /* a forklift, forks toward local +z */
  wForklift(g){ const y=col(0xd8a820),dk=col(0x1c1c1e); mk(box(1.0,.7,1.5,{at:[0,.35,0]}),y,g,0,.22,-.1); mk(box(1.0,.5,.45,{at:[0,.25,0]}),dk,g,0,.4,-.82); mk(box(.5,.12,.45),dk,g,0,1.0,-.25);
    mk(box(.45,.5,.08),dk,g,0,1.3,-.48); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.05,1.25,.05,{at:[0,.62,0]}),dk,g,sx*.45,.92,sz>0?.45:-.6); mk(box(.95,.05,1.1),dk,g,0,2.17,-.08);
    for(const sx of [-1,1]){ mk(box(.08,2.3,.1,{at:[0,1.15,0]}),dk,g,sx*.3,.05,.72); mk(box(.1,.04,1.1),mChromeW,g,sx*.25,.08,1.3); mk(box(.1,.6,.04,{at:[0,.3,0]}),mChromeW,g,sx*.25,.06,.78); }
    mk(box(.7,.08,.06),dk,g,0,.66,.76); for(const sx of [-1,1]) for(const z of [.45,-.7]) mk(cyl(.24,.24,.18,10),col(0x111113),g,sx*.48,.24,z,0,0,Math.PI/2); },
  /* a semi trailer along local +x: the rear (doors) at x=0, the nose at x=len. Floor at 1.25 m */
  wTrailer(g,len=13,open=false){ const W=2.6,y0=1.25,H=2.7,s=MT(tTrailerS),wh=col(0xdcdad2),dk=col(0x1a1a1c);
    for(const sz of [-1,1]) mk(box(len,H,.05),[wh,wh,wh,wh,s,s],g,len/2,y0+H/2,sz*(W/2)); mk(box(len,.05,W),wh,g,len/2,y0+H,0); mk(box(len,.08,W),open?col(0x4a3a2a):dk,g,len/2,y0+.04,0); mk(box(.05,H,W),wh,g,len-.02,y0+H/2,0);
    if(open){ for(const sz of [-1,1]){ const d=N(g,0,y0,sz*W/2,0,sz>0?-Math.PI/2+.05:Math.PI/2-.05,0); mk(box(W/2,H,.04,{at:[-W/4,H/2,0]}),MT(tTrailerR),d); }
      for(let i=0;i<3;i++){ const n=N(g,1.6+i*1.3,y0+.08,(i%2-.5)*1.1); FX.wLoad(n,i%2,2100+i); } }
    else mk(box(.04,H,W),[MT(tTrailerR),wh,wh,wh,wh,wh],g,.02,y0+H/2,0);
    mk(box(len-.4,.3,.9),dk,g,len/2,y0-.18,0); mk(box(.1,.12,W-.2),dk,g,.08,.55,0); for(const sz of [-1,1]) mk(box(.06,.62,.06),dk,g,.08,.84,sz*.9);
    for(const sz of [-1,1]){ mk(box(.08,1.05,.08,{at:[0,.52,0]}),dk,g,len-3.2,0,sz*.85); mk(box(.3,.04,.3),dk,g,len-3.2,.02,sz*.85); }
    for(const ax of [1.4,2.6]) for(const sz of [-1,1]){ mk(cyl(.5,.5,.5,12),[col(0x111113),MT(tTireSide),MT(tTireSide)],g,ax,.5,sz*.95,Math.PI/2); }
    for(const sz of [-1,1]) mk(box(.02,.5,.55),dk,g,3.25,.45,sz*.95);
    for(const sz of [-1,1]) mk(box(.02,.08,.18),col(0x6a1410),g,-.01,y0-.1,sz*1.0); },
  /* a tractor unit along local +x, nose at +x */
  wTractor(g,paint=0x2a3a5a){ const p=col(paint),dk=col(0x1a1a1c),gl_=MT(tWindGlass);
    mk(box(6.0,.3,1.0),dk,g,3.0,.95,0); mk(box(1.4,.08,1.4),col(0x2a2a2c),g,.9,1.15,0);
    mk(box(2.0,2.4,2.44,{at:[0,1.2,0]}),p,g,3.0,1.2,0); mk(box(.04,.8,2.2),gl_,g,4.02,2.95,0,0,0,.08); for(const sz of [-1,1]) mk(box(1.2,.65,.02),gl_,g,3.4,2.95,sz*1.23);
    mk(box(1.9,1.1,2.1,{tw:.85,at:[0,.55,0]}),p,g,4.95,1.15,0); mk(box(.06,.9,1.2),col(0x8a8c90),g,5.92,1.65,0); for(let y=1.25;y<2.1;y+=.12) mk(box(.07,.03,1.18),dk,g,5.93,y,0);
    mk(box(.25,.35,2.5),mChromeW,g,6.0,.9,0); for(const sz of [-1,1]){ mk(box(.12,.12,.08),M(null,{color:0xe8e2c8}),g,5.95,1.45,sz*.9); mk(cyl(.07,.07,1.8,8,{at:[0,.9,0]}),mChromeW,g,2.0,2.3,sz*1.05); mk(cyl(.3,.3,1.1,10),mChromeW,g,2.4,.75,sz*1.0,0,0,Math.PI/2); }
    for(const ax of [5.0,.6,1.75]) for(const sz of [-1,1]) mk(cyl(.52,.52,.36,12),[col(0x111113),MT(tTireSide),MT(tTireSide)],g,ax,.52,sz*1.0,Math.PI/2); },
  /* a shipping container along local +x from 0 to len. Open: hollow, doors swung back flat against the sides */
  wContainer(g,len=12.2,open=false,t=tCont){ const W=2.44,H=2.6,c=MT(t,{repeat:[len/1.2,1]}),c2=MT(t),dk=col(0x1a1a1c),fl=col(0x5a4630);
    for(const sz of [-1,1]) mk(box(len,H,.06),c,g,len/2,H/2,sz*(W/2-.03)); mk(box(len,.06,W),c,g,len/2,H-.03,0); mk(box(len,.05,W-.1),fl,g,len/2,.12,0); mk(box(.06,H,W),c2,g,len-.03,H/2,0);
    if(open){ for(const sz of [-1,1]){ const d=N(g,0,0,sz*W/2,0,sz>0?-Math.PI+.02:Math.PI-.02,0); mk(box(W/2,H-.1,.05,{at:[-W/4,H/2,0]}),c2,d); for(const x of [-.3,-.9]) mk(box(.04,H-.2,.04),dk,d,x,H/2,.05); } }
    else { mk(box(.06,H,W),c2,g,.03,H/2,0); for(const z of [-.9,-.3,.3,.9]) mk(box(.04,H-.2,.04),dk,g,-.01,H/2,z); }
    for(const x of [0,len]) for(const sz of [-1,1]) for(const y of [.08,H-.08]) mk(box(.18,.16,.18),dk,g,x,y,sz*(W/2-.05)); },
  /* a sheriff's cruiser: the sedan in black and white, light bar, push bar, spotlight */
  wCruiser(g,plate='AZ1'){ FX.auto(g,0x141416,'sedan',{bw:true,plate}); const S=CARS.sedan,y=S.cab[1][1]+.05;
    mk(box(1.25,.1,.26),col(0x1a1a1c),g,0,y,(S.cab[1][0]+S.cab[2][0])/2+.1); for(const s of [-1,1]) mk(box(.56,.07,.2),col(s<0?0x8a1a14:0x1a2a8a),g,s*.31,y+.07,(S.cab[1][0]+S.cab[2][0])/2+.1);
    mk(box(1.0,.36,.08),col(0x141416),g,0,.62,S.L/2+.12); mk(cyl(.06,.06,.12,8),mChromeW,g,-.82,S.belt+.2,S.cab[0][0]-.1,Math.PI/2); mk(box(.012,.7,.012),col(0x141416),g,.5,y+.3,-1.2); },
  wDumpster(g){ const m=col(0x1e3a2a); mk(box(1.9,1.15,1.1,{tw:1,td:.9,at:[0,.58,0]}),m,g,0,.12,0); mk(box(1.95,.05,1.12),col(0x141416),g,0,1.32,.02,-.12,0,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(cyl(.07,.07,.06,6),col(0x111113),g,sx*.8,.07,sz*.4,0,0,Math.PI/2); },
  wLockers(g,n){ for(let i=0;i<n;i++) mk(box(.4,1.9,.45,{at:[0,.95,0]}),[col(0x56645e),col(0x56645e),col(0x5e6c66),col(0x56645e),MT(tLocker),col(0x56645e)],g,(i-(n-1)/2)*.41,0,0); mk(box(n*.41,.08,.5),col(0x46524c),g,0,1.94,0); },
  wHighbay(g){ mk(box(.015,.7,.015,{at:[0,.35,0]}),col(0x2a2a2c),g,0,.25,0); mk(cyl(.12,.36,.34,10,{open:true}),M(null,{color:0x3a3c40,double:true}),g,0,.08,0); const l=mk(cyl(.33,.33,.01,10),M(null,{color:0xfff0d0,unlit:true}),g,0,-.09,0); return l; }, /* returns the lamp: only it is powered, the housing merges */
  wExit(g){ mk(box(.34,.17,.06),col(0x1a1a1c),g,0,0,0); const p=mk(plane(.3,.13),M(tExitS,{unlit:true}),g,0,0,.031); p._keep=true; },
  wBollard(g){ mk(cyl(.1,.1,1.1,8,{at:[0,.55,0]}),mYel,g); mk(cyl(.105,.105,.08,8),col(0x1a1a1a),g,0,.85,0); },
  wPack(g){ mk(box(.32,.26,.2),col(0x2a2a2c),g,0,0,.1); const l=mk(plane(.26,.16),M(null,{color:0xffe8b8,unlit:true}),g,0,-.05,.205,-.4,0,0); l._keep=true; },
  wPole(g,h=7.5){ mk(cyl(.09,.13,h,8,{at:[0,h/2,0]}),col(0x5a5c60),g); mk(box(1.4,.08,.08),col(0x5a5c60),g,0,h-.2,0); const hd=N(g,0,h-.35,0); hd._keep=true;
    for(const s of [-1,1]){ mk(box(.5,.34,.18),col(0x2a2a2c),hd,s*.5,0,.06,.55,0,0); mk(plane(.42,.26),M(null,{color:0xf8f4e8,unlit:true}),hd,s*.5,-.06,.16,-1.0,0,0); } },
  wJersey(g,len=3){ mk(box(len,.8,.6,{td:.4,at:[0,.4,0]}),col(0x9a968c),g); mk(box(len,.1,.6),col(0x8a867c),g,0,.05,0); },
  wWrapper(g){ mk(cyl(1.0,1.0,.1,16),col(0x3a3c40),g,0,.05,0); mk(box(.28,2.3,.28,{at:[0,1.15,0]}),col(0x2a5a9a),g,-1.25,0,0); mk(cyl(.07,.07,.5,8),col(0xd8dcdc),g,-1.05,1.0,0); mk(box(.5,1.0,.5,{at:[0,.5,0]}),col(0x2a5a9a),g,-1.3,0,.5); },
  wVend(g){ mk(box(.9,1.85,.8,{at:[0,.925,0]}),[col(0x8a1612),col(0x8a1612),col(0x8a1612),col(0x8a1612),M(tVend,{unlit:true}),col(0x8a1612)],g); },
  wBaler(g){ mk(box(1.8,2.4,1.4,{at:[0,1.2,0]}),col(0x3a5a7a),g); mk(box(1.4,1.0,.04),col(0x2a2a2c),g,0,.9,.72); mk(box(.3,.5,.3),col(0x1a1a1c),g,.6,2.6,0); mk(plane(.6,.3),MT(tStripes),g,0,1.9,.71); },
  wShelf(g,len=2,n=4){ const m=col(0x5a5e62); for(const x of [-len/2,len/2]) for(const z of [-.28,.28]) mk(box(.04,2.1,.04,{at:[0,1.05,0]}),m,g,x,0,z); const r=rng(len*17+n);
    for(let i=0;i<n;i++){ const y=.15+i*.62; mk(box(len,.03,.6),m,g,0,y,0); for(let k=0;k<len/.32-1;k++){ if(r()<.25) continue; const w=.18+r()*.14,h=.12+r()*.3; mk(box(w,h,.3+r()*.15,{at:[0,h/2,0]}),col([0xe8e4dc,0xb48a5a,0xd8d4c8,0x8a6a42,0x2a2a2e][r()*5|0]),g,-len/2+.2+k*.32,y+.02,(r()-.5)*.1,0,(r()-.5)*.3,0); } } },
  wChest(g){ mk(box(.7,1.0,.46,{at:[0,.5,0]}),col(0xa81e1a),g); for(let y=.2;y<1;y+=.16) mk(box(.66,.01,.01),col(0x2a0a08),g,0,y,.235); mk(box(.72,.04,.48),col(0x1a1a1c),g,0,1.02,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(cyl(.04,.04,.04,6),col(0x111113),g,sx*.3,.04,sz*.18,0,0,Math.PI/2); },
  wSwitchgear(g,n=3){ for(let i=0;i<n;i++){ mk(box(.9,2.1,.6,{at:[0,1.05,0]}),col(0x8a8e90),g,(i-(n-1)/2)*.92,0,0); mk(plane(.7,.5),MT(tPanelW),g,(i-(n-1)/2)*.92,1.5,.301); } },
  wCage(g,len,h=2.6){ mk(plane(len,h),MT(tChain,{cut:true,double:true,repeat:[len/.4,h/.4]}),g,0,h/2,0); for(let x=-len/2;x<=len/2+.01;x+=len/Math.max(1,Math.round(len/1.6))) mk(box(.04,h,.04,{at:[0,h/2,0]}),col(0x8a9090),g,x,0,0); mk(box(len,.04,.04),col(0x8a9090),g,0,h,0); },
  wFence(g,len,h=2.4){ mk(plane(len,h),MT(tChain,{cut:true,double:true,repeat:[len/.4,h/.4]}),g,0,h/2,0); for(let x=-len/2;x<=len/2+.01;x+=len/Math.max(1,Math.round(len/3))) mk(cyl(.035,.035,h+.1,5,{at:[0,(h+.1)/2,0]}),col(0x9aa0a0),g,x,0,0);
    mk(cyl(.025,.025,len,4),col(0x9aa0a0),g,0,h,0,0,0,Math.PI/2); mk(cyl(.22,.22,len,6,{open:true}),MT(tRazor,{cut:true,double:true,repeat:[len/.5,2]}),g,0,h+.25,0,0,0,Math.PI/2); },
  wCurtain(g,w=1.3,h=2.1){ for(let x=-w/2+.08;x<w/2;x+=.16) mk(plane(.15,h),MT(tStrip,{cut:true,double:true}),g,x,h/2,0); mk(box(w,.06,.08),col(0x6a6a6a),g,0,h,0); }
});

/* ---------- the level ---------- */
function genWare(){
  setWorld(WARE.RX,WARE.RZ,WARE.RH); disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true; FIRES.length=0;
  FLOOR.n=5; FLOOR.test=true; FLOOR.mode='ware'; FLOOR.dormD=12; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; FLOOR.up=false; FLOOR.goals={}; FLOOR.rewards=[]; setLang(false);
  const G=floorN, B={g:G}, BH=WARE.BH, SH=WARE.SH; GEO_TEMP=true;
  /* a wall from the house builder plus its collision (as in the stash house): open doors and gaps; window sills block to 1.4 m */
  const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>{ wall(B,x0,z0,x1,z1,a,b,holes,o);
    const ax=Math.abs(x1-x0)>Math.abs(z1-z0),s0=ax?Math.min(x0,x1):Math.min(z0,z1),s1=ax?Math.max(x0,x1):Math.max(z0,z1),c=ax?z0:x0,h=o.h||WH,t=WT/2+.01;
    const solid=(p0,p1,y0,y1,kind)=>{ if(p1-p0<.01) return; if(ax) addBox(p0,p1,c-t,c+t,y0,y1,kind); else addBox(c-t,c+t,p0,p1,y0,y1,kind); };
    let s=s0; for(const q of holes.slice().sort((p,q)=>p.at-q.at)){ const p0=q.at-q.w/2,p1=q.at+q.w/2; solid(s,p0,0,h,'wall');
      if(q.win||(q.y0||0)>0) solid(p0,p1,0,1.4,'win'); if((q.y1??2.1)<h) solid(p0,p1,q.y1??2.1,h,'wall'); s=p1; }
    solid(s,s1,0,h,'wall'); };
  const S=t=>S_(t), OUT=S(tTiltOut), WIN=S(tWhIn), OFF=S(tOffWall), BRK=S(tBreakWall), GRY=S(tCmuGrey), WHT=S(tCmuWhite), SLT=S(tCmuSlate), BEI=S(tCmuBeige), DMP=S(tCmuDamp);
  const lights=[]; const Lt=(p,c,d,pow='gen',fl=null)=>lights.push({p,c,d,pow,fl});
  const TILE=6;
  /* floors and ceilings in 6 m tiles, so the far ones cull in the fog */
  const sheet=(x0,z0,x1,z1,mat,y,down)=>{ for(let x=x0;x<x1-.01;x+=TILE) for(let z=z0;z<z1-.01;z+=TILE){ const xa=x,xb=Math.min(x1,x+TILE),za=z,zb=Math.min(z1,z+TILE),w=xb-xa,d=zb-za;
    const m=Object.assign({},mat,{rep:[mat.rep[0]*w,mat.rep[1]*d]}); mk(plane(w,d,Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(d))),m,G,(xa+xb)/2,y,(za+zb)/2,down?Math.PI/2:-Math.PI/2); } };
  const tm=(t,k,o={})=>MT(t,Object.assign({repeat:[1/k,1/k]},o));
  const tube=(x,z,y=SH-.04,rot=0,pw=true)=>{ const n=mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,x,y,z,0,rot,0); if(pw) powered(n,.6,4); else n._keep=true; return n; };
  const exitAt=(x,y,z,ry)=>{ place(B,'wExit',x,z,ry).p[1]=y; Lt([x,y-.3,z],[.9,.12,.08],2.4,'city'); };
  const loot=(k,x,y,z,ry)=>FLOOR.rewards.push({key:k,p:[x,y,z],ry});

  /* ================= ground ================= */
  sheet(-26,-17,18,15,tm(tWhConc,2.4),0,false);
  sheet(-29.5,-26,-26,26,tm(tAsph,2.0),0,false); sheet(-26,-26,18,-17,tm(tAsph,2.0),0,false); sheet(-26,15,18,26,tm(tAsph,2.0),0,false); sheet(18,-26,44,26,tm(tAsph,2.0),0,false);
  /* office floors over the concrete (vinyl tile, carpet in the sergeant's office) */
  for(const [x0,z0,x1,z1,t,k] of [[-26,-17,-20.5,-11.6,tCarpetW,1],[-20.5,-17,-10.2,-11.6,tVct,1.2],[-26,-11.6,-10.2,-9.8,tVct,1.2],[-26,-9.8,-19,2,tVct,1.2]])
    sheet(x0,z0,x1,z1,tm(t,k),.004,false);
  /* the main floor's painted lines: yellow along every rack face, and the walkway along the west aisle */
  for(const [x0,x1,runs] of WARE_RACKS) for(const [z0,z1] of runs) for(const x of [x0-.3,x1+.3]) mk(box(.08,.004,z1-z0),mYel,G,x,.006,(z0+z1)/2);
  for(const x of [-9.9,-7.7]) mk(box(.1,.004,31.6),mYel,G,x,.006,-1);
  for(const z of [-11.5,-3.5,4]) mk(plane(3.0,1.2),MT(tStripes,{repeat:[3,1]}),G,17.3,.007,z,-Math.PI/2,0,Math.PI/2);
  /* the yard and lot: parking stripes, stains */
  for(const x of [-25.5,-22.5,-19.5,-8.5,-5.5,-2.5,7.5,10.5,13.5]) mk(box(.1,.004,4.6),col(0xc8c4b8),G,x,.006,-20.3);
  for(const [x,z,s,ry] of [[-4,-21,1.6,.3],[-22,-20,1.2,1],[28,-2,2,.4],[33,14,1.4,1.2],[12,18,1.6,.2],[-8,19,1.8,2],[25,-18,1.5,0]]) place(B,'decal',x,z,0,tOilCo,s,s,ry);
  for(const [x,z,s,ry] of [[24,0,3,.4],[36,8,2.6,1.2],[-12,-22,2.4,.3],[0,20,2.8,2],[30,22,2.2,.8],[40,-4,2.6,.1]]) place(B,'decal',x,z,0,tCrackCo,s,s,ry);

  /* ================= the building shell ================= */
  W(-26,-17,18,-17,WIN,OUT,[{at:-13,w:1.6,y0:0,y1:2.2},{at:4,w:1.3,y0:0,y1:2.1}],{h:BH});
  W(-26,15,18,15,OUT,WIN,[{at:-20,w:3.6,y0:0,y1:2.4},{at:6,w:1.3,y0:0,y1:2.1}],{h:BH});
  W(-26,-17,-26,15,WIN,OUT,[{at:-10.5,w:1.3,y0:0,y1:2.1}],{h:BH});
  W(18,-17,18,15,OUT,WIN,[{at:-11.5,w:3.0,y0:0,y1:3.4},{at:-3.5,w:3.0,y0:0,y1:3.4},{at:4,w:3.0,y0:0,y1:3.4},{at:10,w:1.3,y0:0,y1:2.1}],{h:BH});
  for(const [x0,z0,x1,z1] of [[-26.1,-17.1,18.1,-16.9],[-26.1,14.9,18.1,15.1]]) mk(box(x1-x0,.3,z1-z0+.24),col(0x8a8478),G,(x0+x1)/2,BH+.15,(z0+z1)/2);
  for(const x of [-26,18]) mk(box(.36,.3,32.2),col(0x8a8478),G,x,BH+.15,-1);
  /* the roof deck, joists every 6 m, three skylights with the night in them */
  sheet(-26,-17,18,15,col(0x26282c),BH,true); /* plain: it's 7 m up in the dark, and plain colours share one draw per tile */
  for(let x=-24;x<18;x+=6) mk(box(.12,.55,32),col(0x34363a),G,x,BH-.28,-1);
  for(const [x,z] of [[-3,-8],[3,5],[12,-6]]){ const s=mk(plane(2.4,1.2),M(null,{color:0x18223a,unlit:true}),G,x,BH-.01,z,Math.PI/2); s._keep=true; }
  /* the facade: the county sign over the lobby door, wall packs, floods on the dock side */
  { const n=N(G,-13,3.4,-17.08,0,Math.PI,0); n._keep=true; mk(plane(5.2,1.0),MT(tSheriffSign,{unlit:true}),n); mk(box(5.4,1.2,.06),col(0x1a1a1c),n,0,0,.04); }
  /* the dock doors: A has a trailer backed against it, B is open to the yard, C is shut. Dock bumpers outside, the levelers' stripes inside */
  for(const [z,st] of [[-11.5,'trailer'],[-3.5,'open'],[4,'shut']]){
    if(st==='shut'){ mk(plane(3.0,3.4),MT(tShutter,{repeat:[2.5,1.6],double:true}),G,18-.02,1.7,z,0,-Math.PI/2,0); addBox(17.9,18.1,z-1.5,z+1.5,0,3.4,'door'); }
    else { mk(box(.5,.5,3.2),col(0x6a6a66),G,17.8,3.65,z); }
    for(const s of [-1,1]){ mk(box(.12,.5,.25),col(0x141416),G,18.15,1.0,z+s*1.25); mk(box(.12,3.4,.25),col(0x141416),G,18.15,1.7,z+s*1.62); place(B,'wBollard',17.4,z+s*1.85); addBox(17.25,17.55,z+s*1.85-.15,z+s*1.85+.15,0,1.1,'furn'); } }
  addBox(17.9,18.15,-13,-10,0,3.4,'furn'); /* the trailer's tail in the door */
  /* the west-strip block: 2.6 m rooms under a flat roof */
  sheet(-26,-17,-10.2,15,MT(tFlConc,{repeat:[1/2,1/2],color:0x8a8a8a}),SH,true);
  for(let x=-26;x<-10.2;x+=TILE) for(let z=-17;z<15;z+=TILE){ const xb=Math.min(-10.2,x+TILE),zb=Math.min(15,z+TILE); mk(box(xb-x,.15,zb-z),col(0x6a6a66),G,(x+xb)/2,SH+.075,(z+zb)/2); }
  addBox(-26,-10.2,-17,15,SH,SH+.15,'ceil');
  { const r=rng(2201); for(let i=0;i<10;i++){ const z=-15+i*3.1+r(),n=N(G,-11.2-r()*.6,SH+.15,z,0,r()*.5,0); if(i%3===2) FX.wLoad(n,1,2200+i); else mk(box(.6,.4+r()*.4,.5,{at:[0,.25,0]}),MT(tCard),n); } } /* junk stored up on the block's roof */

  /* ================= back of house ================= */
  /* the strip's east wall, onto the warehouse floor: painted slate below, bare block above */
  W(-10.2,-17,-10.2,15,SLT,BEI,[{at:-10.5,w:1.3,y0:0,y1:2.1},{at:-6,w:1.3,y0:0,y1:2.1},{at:0,w:1.3,y0:0,y1:2.1},{at:6,w:1.3,y0:0,y1:2.1},{at:12,w:3.0,y0:0,y1:2.4}],{h:SH});
  W(-26,-11.6,-10.2,-11.6,OFF,OFF,[door(-23,1.0,-1.2),door(-18,1.0,-1.2),win(-16.6,1.2,1.0,1.9),gap(-13,1.6,2.2)]);
  W(-20.5,-17,-20.5,-11.6,OFF,OFF); W(-15.5,-17,-15.5,-11.6,OFF,OFF,[win(-14.3,1.2,1.0,1.9)]);
  W(-26,-9.8,-13,-9.8,BRK,OFF,[door(-22.5,1.0,1.2),door(-16,1.0,1.2)]);
  W(-19,-9.8,-19,2,GRY,BRK); W(-19,-5.2,-13,-5.2,GRY,GRY); W(-13,-9.8,-13,-2,BEI,GRY,[door(-3.5,1.0,1.2)]); W(-13,-2,-13,2,DMP,GRY);
  W(-13,-2,-10.2,-2,DMP,BEI); W(-26,2,-19,2,WHT,BRK); W(-19,2,-13,2,WHT,GRY); W(-13,2,-10.2,2,WHT,DMP);
  W(-17,2,-17,8.5,WHT,WHT); W(-26,8.5,-10.2,8.5,WHT,WHT,[door(-21.5,1.0,-1.2),gap(-14,1.3,2.2)]);
  /* office doors in their frames */
  for(const [x,z,ry] of [[-23,-11.6,0],[-18,-11.6,0],[-22.5,-9.8,0],[-16,-9.8,0],[-21.5,8.5,0]]) mk(box(1.1,.08,.16),col(0x3a3a3c),G,x,2.12,z,0,ry,0);
  /* the sergeant's office: desk, the manifest on it, his trophy on it too; filing, a safe, the whiteboard with the next pickup */
  place(B,'desk',-22.8,-15.6,Math.PI,true,0x4a3424); addBox(-23.45,-22.15,-15.95,-15.25,0,.78,'furn'); place(B,'chair',-22.8,-16.3,0,0x1a1a1c);
  for(const z of [-16.4,-15.75]){ const n=N(G,-25.6,0,z,0,Math.PI/2,0); FURN.filing(n); } addBox(-25.9,-25.3,-16.7,-15.45,0,1.3,'furn');
  place(B,'safe',-21.1,-16.45,0); addBox(-21.5,-20.7,-16.8,-16.15,0,1.6,'furn');
  { const n=N(G,-20.56,1.45,-14.3,0,-Math.PI/2,0); mk(plane(1.6,.85),MT(tWhiteB),n); }
  { const l=N(G,WARE_LOG[0],WARE_LOG[1]-.035,WARE_LOG[2],0,.25,0); l.live=true; FX.ledger(l); FLOOR.ledgerN=l; }
  { const n=N(G,-23.5,.78,-15.5); powered(n,.6,6); mk(cyl(.02,.06,.04,6),col(0x1a1a1c),n); mk(box(.012,.3,.012,{at:[0,.15,0]}),col(0x1a1a1c),n,0,0,0,0,0,-.3); mk(cyl(.05,.08,.1,8,{open:true}),M(null,{color:0x2a5a3a,double:true}),n,.09,.3,0); }
  Lt([-23.4,1.0,-15.5],[1.3,1.0,.55],3.2); tube(-23.2,-14.2); Lt([-23.2,2.45,-14.2],[1.6,1.68,1.64],7.1);
  loot('bigcan',-22.2,.84,-15.4,-.3);
  /* dispatch: the console and its screens, the radio rack, a coffee */
  place(B,'monitors',-18,-16.5,0); addBox(-19.0,-17.0,-16.9,-15.9,0,1.0,'furn'); place(B,'chair',-18,-15.5,Math.PI,0x1a1a1c);
  { const n=N(G,-20.0,0,-16.5); mk(box(.6,1.8,.5,{at:[0,.9,0]}),col(0x2a2c2e),n); for(let y=.4;y<1.7;y+=.22) mk(box(.5,.12,.02),col(0x111113),n,0,y,.26); for(let i=0;i<5;i++) mk(box(.02,.02,.01),M(null,{color:i%2?0x7cf06a:0xe8a82a,unlit:true}),n,-.15+i*.07,1.6,.27); addBox(-20.35,-19.65,-16.8,-16.2,0,1.8,'furn'); }
  tube(-18,-14.2); Lt([-18,2.45,-14.2],[1.6,1.68,1.64],6.9); Lt([-18,1.3,-15.9],[.4,.7,.55],3.2,'gen','tv');
  /* the lobby: the counter behind the pass window, chairs along the wall, the memorial on the board, the front doors */
  place(B,'counter',-15.1,-14.3,Math.PI/2,2.4,tCabinetW,tCounterTop,{upper:false}); addBox(-15.45,-14.8,-15.5,-13.1,0,.92,'furn');
  for(let i=0;i<4;i++){ place(B,'pchair',-10.75,-16.2+i*.62,-Math.PI/2); } addBox(-11.1,-10.27,-16.5,-13.6,0,.8,'furn');
  { const n=N(G,-10.27,1.5,-12.6,0,-Math.PI/2,0); mk(box(1.4,.9,.03),col(0x8a6a42),n); mk(plane(.4,.6),MT(tMemorial),n,-.3,0,.02); mk(plane(.35,.5),MT(tPosterMissing),n,.32,.08,.02); }
  { const n=N(G,-13,0,-17,0,0,0); for(const s of [-1,1]){ const d=N(n,s*.8,0,0,0,s*1.3,0); mk(box(.78,2.15,.04,{at:[-s*.39,1.075,0]}),F(col(0x2a2a2c),MT(tGlassCut,{cut:true,double:true})),d); } }
  { const n=N(G,-13,2.35,-11.6,0,0,0); mk(plane(1.0,.3),MT(tNoEntry),n,0,0,.07); }
  tube(-13,-14.3); Lt([-13,2.45,-14.3],[1.6,1.68,1.64],7.1); exitAt(-13,2.45,-16.9,0);
  /* the corridor: two tubes, an extinguisher, a drinking fountain; the back door west */
  tube(-22,-10.7); tube(-15,-10.7); Lt([-22,2.45,-10.7],[1.6,1.68,1.64],6.7); Lt([-15,2.45,-10.7],[1.6,1.68,1.64],6.7);
  mk(cyl(.08,.08,.5,8),col(0xa81e1a),G,-20.9,.95,-11.48); mk(box(.4,.35,.3),col(0xc8ccd0),G,-24.6,.85,-9.95); exitAt(-25.9,2.35,-10.5,Math.PI/2);
  /* the break room: kitchenette, fridge, vending machine, two tables, a couch and the TV, the memorial again on the fridge door */
  place(B,'counter',-25.6,-7.4,Math.PI/2,3.0,tCabinetW,tCounterTop,{sink:.6}); addBox(-25.93,-25.28,-8.9,-5.9,0,.92,'furn');
  place(B,'fridge',-25.5,-5.3,Math.PI/2); addBox(-25.9,-25.1,-5.7,-4.9,0,1.8,'furn');
  { const n=place(B,'wVend',-19.5,-8.9,-Math.PI/2); powered(n,.55,15); addBox(-19.93,-19.07,-9.35,-8.45,0,1.85,'furn'); } Lt([-19.9,1.2,-8.9],[.9,.35,.3],2.6);
  for(const [x,z] of [[-23,-6.0],[-23,-1.4]]){ place(B,'table',x,z,0,1.4,.8,0xd8d4cc); addBox(x-.75,x+.75,z-.45,z+.45,0,.78,'furn'); for(const [dx,dz,ry] of [[-.4,-.7,0],[.4,-.7,0],[-.4,.7,Math.PI],[.4,.7,Math.PI]]) place(B,'chair',x+dx,z+dz,ry,0x2a3a5a); }
  place(B,'bottles',-23,-6.0,0,3,31).p[1]=.78; mk(box(.3,.2,.25),col(0x2a2a2e),G,-25.6,1.03,-8.5);
  place(B,'sofa',-20.0,.9,Math.PI,0x4a4038,2.0); addBox(-21.05,-18.95,.45,1.4,0,.9,'furn');
  { const tv=place(B,'flatTV',-20.0,-.2,Math.PI*0,1.1,.65,1.25); powered(tv,.5,10); addBox(-20.5,-19.5,-.45,0,0,.4,'furn'); } Lt([-20.0,1.2,.2],[.45,.6,1.2],3.6,'gen','tv');
  { const n=N(G,-24.0,1.45,-9.73,0,0,0); mk(box(1.2,.8,.03),col(0x8a6a42),n); mk(plane(.4,.6),MT(tMemorial),n,-.3,0,.02); mk(plane(.4,.55),MT(tCalendarCo),n,.25,0,.02); }
  tube(-22.5,-6); tube(-22.5,-1.0); Lt([-22.5,2.45,-6],[1.6,1.68,1.64],7.1); Lt([-22.5,2.45,-1],[1.6,1.68,1.64],7.1);
  loot('bottle',-24.2,.95,-6.9,0);
  /* lockers: two banks, a bench, a gun bag left open on it */
  { const n=place(B,'wLockers',-16,-5.48,Math.PI,12); addBox(-18.5,-13.5,-5.75,-5.2,0,1.95,'furn'); }
  { const n=place(B,'wLockers',-18.7,-7.6,Math.PI/2,5); addBox(-19,-18.45,-8.65,-6.55,0,1.95,'furn'); }
  place(B,'bench',-15.6,-7.4,0,2.6); addBox(-16.9,-14.3,-7.7,-7.1,0,.92,'furn'); mk(box(.9,.25,.3),col(0x1a1a1c),G,-16.3,1.05,-7.4);
  tube(-16,-7.5); Lt([-16,2.45,-7.5],[1.6,1.68,1.64],6.9); loot('shotgun',-15.6,.95,-7.2,.1);
  /* the electrical room: switchgear along the north wall, the main breaker on the west wall (pull it or shoot the panel), a bare bulb */
  place(B,'wSwitchgear',-16.6,-4.9,0,3); addBox(-18.0,-15.2,-5.2,-4.5,0,2.1,'furn');
  { mk(box(.2,1.3,.8),col(0x7a7e80),G,-18.9,1.25,-1.0); mk(plane(.7,1.1),MT(tPanelW),G,-18.79,1.25,-1.0,0,Math.PI/2,0); const pb=addBox(-19,-18.7,-1.45,-.55,.5,2.0,'generator'); pb.onHit=()=>warePower(false);
    const x=WARE_SW[0],y=WARE_SW[1],z=WARE_SW[2]; mk(box(.06,.1,.1),col(0x2a2a2c),G,x-.03,y-.04,z); const lv=N(G,x,y-.06,z); lv.live=true; mk(box(.04,.14,.04,{at:[0,.07,0]}),col(0xb81a14),lv); mk(box(.1,.04,.04),col(0xb81a14),lv,.03,.14,0); FLOOR.lever=lv; wareLever();
    for(const z2 of [-1.2,-.8]) mk(box(.05,1.0,.05,{at:[0,.5,0]}),col(0x6a6c70),G,-18.92,1.9,z2); }
  mk(box(1.2,1.4,.9,{at:[0,.7,0]}),col(0x5a6a5a),G,-14.0,0,1.3); addBox(-14.6,-13.4,.85,1.75,0,1.4,'furn');
  { const n=mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),G,-16,2.3,-1.6); powered(n,.9,4); } Lt([-16,2.25,-1.6],[1.3,.95,.55],4.4);
  /* the back hall: a janitor's sink and cart, stacked chairs */
  mk(box(.6,.8,.5,{at:[0,.4,0]}),col(0xd8d4cc),G,-12.6,0,-9.2); addBox(-12.93,-12.3,-9.5,-8.9,0,.8,'furn');
  { const n=N(G,-12.5,0,-7.6); mk(box(.5,.7,.9,{at:[0,.35,0]}),col(0xe8c83a),n); mk(cyl(.15,.15,.3,8),col(0x2a5aa8),n,0,.85,.2); addBox(-12.8,-12.2,-8.1,-7.1,0,.9,'furn'); }
  tube(-11.6,-6,SH-.04,Math.PI/2); Lt([-11.6,2.45,-6],[1.6,1.68,1.64],6.5); exitAt(-10.35,2.35,-6,-Math.PI/2);
  /* the drain room: where the tunnel comes up. The hatch, pipes, a sump, a caged bulb */
  { const h=N(G,-12.3,0,-.4); mk(box(.84,.02,.84),col(0x0a0a0a),h,0,.006,0); for(const s of [-1,1]){ mk(box(.06,.05,.9),col(0x2a2a2c),h,s*.45,.025,0); mk(box(.9,.05,.06),col(0x2a2a2c),h,0,.025,s*.45); }
    for(const s of [-1,1]) mk(box(.05,.5,.05,{at:[0,.25,0]}),M(tBeam),h,s*.22,0,.42); mk(box(.5,.03,.04),M(tBeam),h,0,.4,.42);
    mk(box(.86,.04,.86),M(tSteel,{color:0x8a8a8a}),G,-12.3,.02,.58); }
  for(const y of [2.3,2.45]) mk(cyl(.05,.05,3.9,6),col(0x4a4c50),G,-10.35,y,0,Math.PI/2); mk(cyl(.07,.07,2.6,6),col(0x2a4a8a),G,-10.45,1.3,1.6);
  { const c=mk(box(.1,.12,.1),M(null,{color:0xffd8a0,unlit:true}),G,-11.4,2.35,0); powered(c,.9,4); for(let i=0;i<4;i++) mk(box(.012,.14,.012),col(0x2a2a2c),G,-11.4+(i%2-.5)*.12,2.35,(i>>1)-.5>0?.06:-.06); } Lt([-11.4,2.3,0],[1.1,.9,.6],4.0);
  exitAt(-10.35,2.35,0,-Math.PI/2);
  /* the evidence cage: chain-link round the shelves, the table where they sort it (and what they skim), the log desk outside */
  { const C=(x0,z0,x1,z1,gate)=>{ const ax=Math.abs(x1-x0)>.01,len=ax?x1-x0:z1-z0; const segs=gate?[[ax?x0:z0,gate-.65],[gate+.65,ax?x1:z1]]:[[ax?x0:z0,ax?x1:z1]];
      for(const [a,b] of segs){ if(b-a<.05) continue; const m=(a+b)/2,n=N(G,ax?m:x0,0,ax?z0:m,0,ax?0:Math.PI/2,0); FX.wCage(n,b-a); if(ax) addBox(a,b,z0-.03,z0+.03,0,1.4,'win'); else addBox(x0-.03,x0+.03,a,b,0,1.4,'win'); } };
    C(-25.9,2.4,-19.4,2.4); C(-19.4,2.4,-19.4,6.6); C(-25.9,6.6,-19.4,6.6,-22.5); }
  place(B,'wShelf',-24.6,2.75,0,2.4); addBox(-25.85,-23.35,2.45,3.1,0,2.1,'furn'); place(B,'wShelf',-21.2,2.75,0,2.4); addBox(-22.45,-19.95,2.45,3.1,0,2.1,'furn');
  place(B,'wShelf',-25.6,5.2,Math.PI/2,1.8); addBox(-25.93,-25.25,4.25,6.15,0,2.1,'furn');
  place(B,'table',-22.8,4.6,0,1.6,.8,0x7a7c80); addBox(-23.65,-21.95,4.15,5.05,0,.78,'furn'); place(B,'stash',-21.0,5.9,0); addBox(-21.5,-20.5,5.6,6.2,0,1.3,'furn');
  place(B,'bricksPile',-22.4,4.4,0,8,41).p[1]=.78;
  place(B,'desk',-18.2,7.6,0,true,0x5a5e62); addBox(-18.9,-17.4,7.25,7.95,0,.78,'furn');
  tube(-22.5,4.6); tube(-18.5,5.5,SH-.04,Math.PI/2); Lt([-22.5,2.45,4.6],[1.6,1.68,1.64],7.1); Lt([-18.5,2.45,5.5],[1.6,1.68,1.64],6.1);
  loot('can',-23.3,.84,4.5,.4); loot('machete',-22.6,.82,4.75,1.2);
  /* the cold room: the count. Product on pallets, the money table, cash bags, plastic strips in the doors */
  for(const [x,z,k] of [[-16.2,3.0,3],[-16.2,4.4,3],[-12.6,3.0,0],[-11.2,3.0,3]]){ const n=N(G,x,0,z); FX.wLoad(n,k,2300+x*7|0); addBox(x-.6,x+.6,z-.55,z+.55,0,1.4,'furn'); }
  place(B,'counttable',-13.8,5.8,Math.PI/2); addBox(-14.3,-13.3,4.85,6.75,0,.8,'furn'); for(const [x,z,ry] of [[-14.6,5.3,Math.PI/2],[-13.0,6.3,-Math.PI/2]]) place(B,'pchair',x,z,ry);
  for(const [x,z] of [[-16.3,7.6],[-15.7,7.8]]) mk(box(.4,.35,.3,{tw:.8,at:[0,.17,0]}),col(0x3a4a2a),G,x,0,z,0,x,0);
  place(B,'wCurtain',-14,8.5,0,1.3); place(B,'wCurtain',-10.2,6,Math.PI/2,1.3);
  tube(-13.6,3.6,SH-.04,Math.PI/2); tube(-13.6,7.0,SH-.04,Math.PI/2); Lt([-13.6,2.45,3.6],[.75,.95,1.25],4.4); Lt([-13.6,2.45,7.0],[.75,.95,1.25],4.0);
  /* the impound bay: a seized sedan up on stands with its seats out, a pickup, tool chests, the roll-up door open on the lane */
  { const n=N(G,-21.4,.32,11.4,0,Math.PI/2,0); FX.auto(n,0x6a2a2a,'sedan',{plate:'BCN',hub:false}); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.12,.34,.12,{at:[0,-.17,0]}),col(0xa82a1a),n,sx*.6,.0,sz*1.3);
    addBox(-23.6,-19.2,10.55,12.25,0,1.6,'furn'); for(const [x,z,ry] of [[-19.0,9.5,.4],[-18.3,10.0,1.4]]) { const s=N(G,x,0,z,0,ry,0); mk(box(.5,.45,.5,{at:[0,.22,0]}),col(0x3a3230),s); mk(box(.5,.6,.12),col(0x3a3230),s,0,.6,-.22,-.2,0,0); } }
  { const n=N(G,-14.0,0,12.6,0,-Math.PI/2,0); FX.auto(n,0x8a8a86,'pickup',{hub:false,plate:'TX4'}); addBox(-16.5,-11.5,11.7,13.5,0,1.5,'furn'); }
  for(const [x,z] of [[-25.3,9.2],[-24.5,9.2]]){ place(B,'wChest',x,z,0); addBox(x-.36,x+.36,z-.24,z+.24,0,1.05,'furn'); }
  place(B,'workbench',-25.4,12.6,Math.PI/2,2.4); addBox(-25.9,-25.1,11.4,13.8,0,1.0,'furn'); place(B,'tires',-11.0,9.2,0,4,7); addBox(-11.35,-10.6,8.85,9.55,0,.8,'furn');
  tube(-21,11.5,SH-.04,Math.PI/2); tube(-14,11.5,SH-.04,Math.PI/2); Lt([-21,2.45,11.5],[1.6,1.68,1.64],7.7); Lt([-14,2.45,11.5],[1.6,1.68,1.64],7.7);
  { mk(box(3.8,.5,.4),col(0x5a5c60),G,-20,2.65,15.15); } exitAt(-20,2.5,14.9,Math.PI);

  /* ================= the warehouse floor ================= */
  WARE_RACKS.forEach(([x0,x1,runs],ri)=>{ for(const [z0,z1] of runs){ const mx=(x0+x1)/2,mz=(z0+z1)/2,n=N(G,mx,0,mz,0,Math.PI/2,0);
      /* the rack is open: a low footprint keeps people out of it, and each load is its own box, so you see and shoot through the empty slots and over the beams */
      FX.wRack(n,z1-z0,2400+ri*13+(z0*7|0),(lx,y,h)=>addBox(mx-.52,mx+.52,mz-lx-.5,mz-lx+.5,y,y+h,'load')); addBox(x0,x1,z0,z1,0,.5,'rack'); for(const [a,b] of [[1.5,1.82],[3.2,3.52],[4.85,5.0]]) addBox(x0,x1,z0,z1,a,b,'load'); /* the beams and decks: a band you can't see or shoot through */
      for(const z of [z0,z1]){ mk(box(1.25,.45,.12),mYel,G,(x0+x1)/2,.22,z+(z===z0?-.08:.08)); const sg=N(G,(x0+x1)/2,4.4,z+(z===z0?-.07:.07),0,z===z0?Math.PI:0,0); mk(plane(.4,.4),MT(tAisleN[ri]),sg); } } });
  /* two aisles blocked: a load that came down in B, empty pallets stacked across D */
  { const n=N(G,-4.9,0,9.9); const r=rng(2501); for(let i=0;i<11;i++) mk(box(.5+r()*.3,.35+r()*.2,.4+r()*.3),MT(tCard),n,(r()-.5)*2.2,.15+(i>7?.4:0),(r()-.5)*1.0,r()*.4,r()*3,r()*.4); mk(box(1.1,.14,1.0),mPal,n,.3,.4,.2,.0,.5,.35); addBox(-6.1,-3.7,9.2,10.6,0,1.35,'furn'); }
  { for(let i=0;i<14;i++) mk(box(1.1,.14,1.0,{at:[0,.07,0]}),mPal,G,2.7+(i%2-.5)*1.15,(i>>1)*.15,-11.8,0,(i%3-1)*.04,0); addBox(1.6,3.8,-12.4,-11.2,0,1.6,'furn'); }
  /* the west aisle: a pallet truck on charge, a ladder, an extinguisher */
  { const n=N(G,-9.6,0,-15.6,0,Math.PI/2,0); mk(box(.8,1.2,.5,{at:[0,.6,0]}),col(0xd8a820),n); for(const s of [-1,1]) mk(box(.16,.08,1.2),mChromeW,n,s*.22,.06,.8); addBox(-10.1,-9.1,-16.5,-14.7,0,1.2,'furn'); }
  mk(cyl(.08,.08,.5,8),col(0xa81e1a),G,-10.05,.95,-3.3);
  /* the docks: staging lanes, the stretch wrapper, a forklift, the baler, a pallet jack, the shipping desk and the dock office */
  for(const [x,z,k] of [[11.6,-15.4,0],[13.0,-15.4,1],[14.4,-15.4,0],[11.6,-7.6,1],[13.0,-7.6,3],[11.6,.8,0],[13.0,.8,1],[14.4,.8,2],[11.8,7.0,1],[13.2,7.0,0]]){ const n=N(G,x,0,z,0,(x*z%1)*.08,0); FX.wLoad(n,k,2600+x*10+z|0); addBox(x-.6,x+.6,z-.55,z+.55,0,1.4,'furn'); }
  place(B,'wWrapper',16.6,-8.0,0); addBox(14.8,17.6,-9.0,-7.0,0,1.1,'furn');
  place(B,'wForklift',15.6,-.4,-Math.PI/2); addBox(14.0,16.6,-.95,.15,0,2.2,'furn');
  place(B,'wBaler',16.8,7.6,-Math.PI/2); addBox(16.1,17.5,6.7,8.5,0,2.4,'furn');
  { const n=N(G,11.2,0,-4.4,0,.4,0); for(const s of [-1,1]) mk(box(.16,.07,1.2),col(0x1a1a1c),n,s*.27,.05,0); mk(box(.6,.2,.3),col(0xa81e1a),n,0,.12,-.6); mk(box(.04,1.1,.04,{at:[0,.55,0]}),col(0x1a1a1c),n,0,.1,-.7,-.3,0,0); }
  { const n=N(G,12.6,0,11.6,0,0,0); mk(box(1.2,1.05,.6,{at:[0,.52,0]}),col(0x5a5e62),n); mk(box(.4,.3,.35),col(0xd8d4cc),n,-.3,1.2,0); mk(plane(.4,.3),MT(tScreenTV,{unlit:true}),n,.3,1.25,-.25,0,Math.PI,0); addBox(11.95,13.25,11.25,11.95,0,1.05,'furn'); powered(n,.5,8); }
  { const x0=14.6,z0=11.6,x1=17.9,z1=14.9; W(x0,z0,x1,z0,OFF,OFF,[win(16.2,1.8,1.0,2.1)],{h:2.5}); W(x0,z0,x0,z1,OFF,OFF,[gap(13,1.3,2.1),win(14.2,.9,1.0,2.1)],{h:2.5});
    mk(box(x1-x0+.1,.1,z1-z0+.1),col(0x5a5c60),G,(x0+x1)/2,2.55,(z0+z1)/2); addBox(x0,x1,z0,z1,2.5,2.6,'ceil');
    place(B,'desk',16.8,14.3,Math.PI,true,0x5a5e62); addBox(16.1,17.5,13.95,14.65,0,.78,'furn'); place(B,'chair',16.8,13.6,0,0x1a1a1c); for(const z of [12.2,12.8]){ const n=N(G,17.55,0,z,0,-Math.PI/2,0); FURN.filing(n); } addBox(17.3,17.85,11.9,13.1,0,1.3,'furn');
    tube(16.2,13.2,2.48); Lt([16.2,2.4,13.2],[1.6,1.68,1.64],6.5); }
  exitAt(17.9,2.4,10,-Math.PI/2); exitAt(4,2.4,-16.9,0); exitAt(6,2.4,14.9,Math.PI);
  /* the high bays: some aisles lit, long dark stretches between them */
  /* high bays over every aisle, about every 7 m: the six nearest you are lit. The lamps aren't 'powered' (that would keep each one out of the merge);
     the lights-out swap still darkens them */
  for(const x of [-8.8,-4.9,-1.1,2.7,6.5,11.8,15.4]) for(const z of [-13.6,-6.6,.4,7.4,13.6]){ if(x>14&&z>11) continue;
    const n=N(G,x,BH-1.0,z); FX.wHighbay(n); Lt([x,BH-2.2,z],[1.5,1.36,1.1],12); }

  /* ================= outside: the lot, the lane, the passage, the yard ================= */
  /* perimeter: block wall and wire round three sides, chain-link and the gate on the east */
  const perim=(x0,z0,x1,z1)=>{ const ax=Math.abs(x1-x0)>Math.abs(z1-z0),len=ax?x1-x0:z1-z0; W(x0,z0,x1,z1,S(tCbRaw),S(tCbRaw),[],{h:2.6});
    const n=N(G,(x0+x1)/2,2.85,(z0+z1)/2,0,ax?0:Math.PI/2,0); mk(cyl(.22,.22,len,6,{open:true}),MT(tRazor,{cut:true,double:true,repeat:[len/.5,2]}),n,0,0,0,0,0,Math.PI/2); };
  perim(-29.5,-25.8,43.8,-25.8); perim(-29.5,25.8,43.8,25.8); perim(-29.5,-25.8,-29.5,25.8);
  for(const [z0,z1] of [[-25.8,17],[23,25.8]]){ const n=N(G,43.8,0,(z0+z1)/2,0,Math.PI/2,0); FX.wFence(n,z1-z0); addBox(43.75,43.85,z0,z1,0,2.4,'win'); }
  { const n=N(G,43.95,0,26.2,0,Math.PI/2,0); FX.wFence(n,6); mk(box(.12,.12,6),col(0x9aa0a0),G,43.95,.2,26.2); }
  for(const [z0,z1,g0,g1] of [[-25.8,-17,-22.5,-20.5],[15,25.8,22.5,24.5]]) for(const [a,b] of [[z0,g0],[g1,z1]]){ const n=N(G,18,0,(a+b)/2,0,Math.PI/2,0); FX.wFence(n,b-a,2.0); addBox(17.95,18.05,a,b,0,2.0,'win'); }
  /* the sky: the same box as the stash house's (36-stash.js), riding with you 40 m out; Puerto Seco's lights low on the horizon to the south */
  { const sky=N(G,0,0,0); sky.live=true; sky._keep=true; FLOOR.sky=sky; const R_=40;
    for(const [x,z,ry] of [[0,-R_,0],[0,R_,Math.PI],[-R_,0,Math.PI/2],[R_,0,-Math.PI/2]]){ const n=mk(plane(R_*2+.4,46),MT(tSkyCo,{unlit:true,double:true,nofog:true,repeat:[2,1]}),sky,x,16,z,0,ry,0); n.mesh.geo.noCull=true; n._keep=true; }
    { const n=mk(plane(R_*2+.4,R_*2+.4),MT(tStarsCo,{unlit:true,double:true,nofog:true,repeat:[3,3]}),sky,0,38.9,0,Math.PI/2,0,0); n.mesh.geo.noCull=true; n._keep=true; }
    const n=mk(plane(6.3,6.3),MT(tMoonCo,{unlit:true,cut:true,double:true,nofog:true,color:0xf0ecd8}),sky,-14,21,38.6,0,Math.PI,0); n.mesh.geo.noCull=true; n._keep=true; }
  /* the staff lot: the sergeant's and the deputies' cruisers nose-in, staff cars, dumpsters, sodium poles */
  for(const [x,kind,paint] of [[-24,'cr'],[-21,'cr'],[-7,'sedan',0x6a6a72],[-4,'suv',0x2a2a2e],[9,'pickup',0x8a8a86],[12,'sedan',0x3a4a5a]]){ const n=N(G,x,0,-20.3,0,0,0); if(kind==='cr') FX.wCruiser(n,'ACS'+(x&7)); else FX.auto(n,paint,kind,{plate:'TX'+(x&9)}); addBox(x-.95,x+.95,-22.6,-18.0,0,1.4,'furn'); }
  for(const x of [-1.2,1.0]){ place(B,'wDumpster',x,-17.8,0); addBox(x-.98,x+.98,-18.4,-17.2,0,1.35,'furn'); } place(B,'trashbags',2.6,-17.6,0,3,61);
  for(const x of [-17,3]){ place(B,'sodium',x,-25.4,-Math.PI/2,1.4); addBox(x-.12,x+.12,-25.52,-25.28,0,6,'furn'); Lt([x,5.85,-24.0],[2.0,1.05,.38],12,'city','buzz'); }
  place(B,'wPack',-13,-17.06,Math.PI).p[1]=3.0; Lt([-13,2.7,-17.6],[1.5,1.3,.9],6.5,'city');
  /* the west passage: AC units, a gas meter, a ladder up the wall, the wall pack by the back door */
  for(const z of [-4,-1.2]){ mk(box(1.0,.9,1.0,{at:[0,.45,0]}),col(0xa8aca8),G,-27.2,0,z); for(let i=0;i<5;i++) mk(box(.9,.02,.02),col(0x5a5c5a),G,-27.2,.2+i*.14,z-.51); addBox(-27.7,-26.7,z-.5,z+.5,0,.9,'furn'); }
  { const n=N(G,-26.1,0,6,0,-Math.PI/2,0); FX.ladder(n,6.9); } place(B,'trashbags',-27.6,10,0,4,62); place(B,'wPack',-26.06,-10.5,-Math.PI/2).p[1]=2.6; Lt([-26.6,2.3,-10.5],[1.4,1.2,.85],5.5,'city');
  /* the truck lane: two parked trailers, a cruiser, wall packs */
  for(const x of [-23,-5]){ const n=N(G,x,0,21.7,0,0,0); FX.wTrailer(n,13,false); addBox(x,x+13,20.4,23.0,0,4.0,'wall'); }
  { const n=N(G,12.5,0,18.2,0,Math.PI/2,0); FX.wCruiser(n,'ACS9'); addBox(10.4,14.6,17.3,19.1,0,1.4,'furn'); }
  for(const x of [-20,-8,6]){ place(B,'wPack',x,15.06,0).p[1]=x===-20?3.2:2.6; Lt([x,2.4,15.6],[1.5,1.3,.9],7,'city'); }
  /* the yard: the docked trailer, the dropped container (doors open: someone's counting in it), a parked trailer, the tractor, the container stack, the shack, the gate */
  { const n=N(G,18.1,0,-11.5); FX.wTrailer(n,13,true); addBox(18.15,31.1,-12.8,-10.2,0,3.95,'wall'); }
  { const n=N(G,22,0,4.22); FX.wContainer(n,12.2,true); addBox(22,34.2,3.0,3.08,0,2.6,'wall'); addBox(22,34.2,5.36,5.44,0,2.6,'wall'); addBox(34.14,34.2,3.0,5.44,0,2.6,'wall'); addBox(22,34.2,3.0,5.44,2.55,2.6,'ceil');
    for(const z of [2.92,5.52]) addBox(22,23.25,z-.05,z+.05,0,2.5,'furn');
    for(const [x,k] of [[32.6,3],[31.2,1]]){ const p=N(G,x+.3,.15,4.75,0,Math.PI/2,0); FX.wLoad(p,k,2700+x|0); addBox(x-.25,x+.85,4.2,5.3,0,1.4,'furn'); }
    place(B,'crates',33.0,3.62,0); addBox(32.55,33.55,3.1,4.1,0,1.1,'furn'); place(B,'counttable',28.6,4.85,0); addBox(27.7,29.5,4.4,5.3,0,.8,'furn');
    { const l=N(G,30.6,2.3,4.22); l._keep=true; mk(box(.3,.1,.12),col(0x2a2a2c),l); mk(plane(.26,.08),M(null,{color:0xfff4d8,unlit:true}),l,0,-.051,0,Math.PI/2); } Lt([30.6,2.2,4.22],[1.3,1.2,1.0],5,'city');
    loot('smg',33.0,1.16,3.65,.3); }
  { const n=N(G,23,0,12.3); FX.wTrailer(n,13,false); addBox(23,36,11.0,13.6,0,4.0,'wall'); }
  { const n=N(G,26,0,-22.3); FX.wTractor(n,0x6a1a16); addBox(26,32.1,-23.55,-21.05,0,3.7,'wall'); }
  for(const [z,y,t] of [[-22.78,0,tCont],[-20.2,0,tContB],[-21.5,2.6,tCont]]){ const n=N(G,36.5,y,z); FX.wContainer(n,6.1,false,t); } addBox(36.5,42.6,-24.0,-18.98,0,5.2,'wall');
  /* the guard shack by the gate: windows all round, a desk, a monitor, the gate's button */
  { const x0=38.5,z0=12.5,x1=41.5,z1=15.5; W(x0,z0,x1,z0,OFF,WHT,[win(40,1.6,1.0,2.0)]); W(x0,z1,x1,z1,WHT,OFF,[gap(39.5,1.3,2.1),win(40.9,.8,1.0,2.0)]); W(x0,z0,x0,z1,OFF,WHT,[win(14,1.6,1.0,2.0)]); W(x1,z0,x1,z1,WHT,OFF,[win(14,1.8,1.0,2.0)]);
    mk(box(3.4,.2,3.4),col(0x3a3c40),G,40,2.7,14); addBox(x0,x1,z0,z1,2.6,2.8,'ceil');
    place(B,'desk',40.9,13.1,Math.PI,true,0x5a5e62); addBox(40.2,41.47,12.75,13.45,0,.78,'furn'); { const m=N(G,41.2,.78,13.3,0,-Math.PI/2,0); m._keep=true; mk(box(.4,.3,.3,{at:[0,.15,0]}),col(0x1a1a1c),m); mk(plane(.34,.24),MT(tScreenSec,{unlit:true}),m,0,.16,.152); }
    place(B,'chair',40.6,13.8,Math.PI,0x1a1a1c); { const t=mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,40,2.56,14); t._keep=true; } Lt([40,2.45,14],[1.0,1.08,1.05],4.2,'city');
    loot('pistol',40.9,.84,13.15,1.4); }
  for(const [x,z,ry] of [[29,20.5,Math.PI/2],[33.2,20.5,Math.PI/2]]){ const n=N(G,x,0,z,0,ry,0); FX.wCruiser(n,'ACS'+(x|0)); addBox(x-2.15,x+2.15,z-.9,z+.9,0,1.4,'furn'); }
  for(const [x,z,ry] of [[41.2,24.4,0],[33.6,-15.6,0]]){ place(B,'wJersey',x,z,ry,3); addBox(x-1.5,x+1.5,z-.3,z+.3,0,.8,'furn'); }
  { const n=N(G,31.2,0,14.5,0,.3,0); mk(box(.6,.7,.5,{at:[0,.35,0]}),col(0xd8a820),n); mk(cyl(.2,.2,.1,10),col(0x111113),n,0,.12,.3,0,0,Math.PI/2); mk(cyl(.015,.015,2.0,4),col(0x1a1a1c),n,.2,.05,.6,Math.PI/2,0,.6); addBox(30.85,31.55,14.2,14.8,0,.7,'furn'); }
  /* floods: on the dock wall, on poles round the yard */
  for(const z of [-7.5,0,7.2]){ const n=N(G,18.25,6.0,z,0,Math.PI/2,0); n._keep=true; mk(box(.5,.34,.24),col(0x2a2a2c),n,0,0,.08,.55,0,0); mk(plane(.42,.26),M(null,{color:0xf8f4e8,unlit:true}),n,0,-.06,.2,-1.0,0,0); Lt([20.5,4.2,z],[1.7,1.55,1.3],12,'city'); }
  for(const [x,z,ry] of [[30,-16.2,0],[28,8.4,0],[40.6,1.5,-Math.PI/2],[24,23.6,Math.PI],[38.6,23.8,Math.PI]]){ place(B,'wPole',x,z,ry); addBox(x-.15,x+.15,z-.15,z+.15,0,7,'furn'); Lt([x,6.4,z],[1.6,1.5,1.25],13,'city'); }

  GEO_TEMP=false;
  /* ================= navigation: everywhere inside a space, routes kept 0.4 m off walls and anything else in the way ================= */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),R_=WARE_RECTS.find(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]); if(!R_) continue;
    const id=k*NX+i; space[id]=(WARE_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])||R_)[4]; nav[id]=0; }
  const CLR=.4; for(const b of BOXES){ if(b.y0>1.5||b.h<.3||b.kind==='ceil') continue;
    const i0=Math.max(0,Math.ceil((b.x0-CLR+WARE.RX)*2)),i1=Math.min(NX-1,Math.floor((b.x1+CLR+WARE.RX)*2)),k0=Math.max(0,Math.ceil((b.z0-CLR+WARE.RZ)*2)),k1=Math.min(NZ-1,Math.floor((b.z1+CLR+WARE.RZ)*2));
    for(let k=k0;k<=k1;k++) for(let i=i0;i<=i1;i++){ const x=cellX(i),z=cellZ(k),dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1); if(dx*dx+dz*dz<CLR*CLR) nav[k*NX+i]=1; } }
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k); if(Math.abs(x)>WARE.RX-.4||Math.abs(z)>WARE.RZ-.4) nav[k*NX+i]=1; }
  const U=(id,apt,x0,z0,x1,z1,win)=>({id,side:z0<0?-1:1,x0,x1,z0,z1,w:x1-x0,apt,door:x0,room:true,lit:true,win});
  const units=[U(0,'SGT',-26,-17,-20.5,-11.6,[-23,-11.6]),U(1,'RADIO',-20.5,-17,-15.5,-11.6,[-18,-17]),U(2,'LOBBY',-15.5,-17,-10.2,-11.6,[-13,-17]),U(3,'BREAK',-26,-9.8,-19,2,[-20,0]),
    U(4,'LOCKERS',-19,-9.8,-13,-5.2,[-16,-5.2]),U(5,'POWER',-19,-5.2,-13,2,[-19,-1]),U(6,'CAGE',-26,2,-17,8.5,[-22.8,4.6]),U(7,'COLD',-17,2,-10.2,8.5,[-13.8,5.8]),U(8,'IMPOUND',-26,8.5,-10.2,15,[-20,15]),
    U(9,'RACKS',-10.2,-17,9,15,null),U(10,'DOCKS',9,-17,18,15,[18,-3.5]),U(11,'OFFICE',14.6,11.6,17.9,14.9,[16.2,11.6]),U(12,'BOX',22,3,34.2,5.44,[22,4.2]),U(13,'SHACK',38.5,12.5,41.5,15.5,[43.8,20]),U(14,'YARD',18,-25.8,43.8,25.8,null)];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.5,z:0,yaw:-Math.PI/2},lights:[]});
  WARE.lights=lights; LM.list=lights;
  const st=meshMerge(G,{tile:TILE,pal:PAL=makePalette()}); FLOOR.batch=st;
  wareLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }

/* night: a little moon, the city's glow in the fog. Inside, what's lit is lit by something */
const WARE_LIGHT={amb:[.05,.051,.06],dir:[.25,1,-.3],dirCol:[.03,.035,.06],fog:[.026,.027,.034],fogNear:12,fogFar:26};
function wareLights(){ setLights(Object.assign({},WARE_LIGHT,{pl:[]})); if(FLOOR.power===false) L.amb=[.014,.015,.022]; wareLM(); }
/* the six lights nearest you: the fixed ones plus any flashlight that's on */
function wareLM(){ const tl=[]; for(const E of enemies) if(E.tl&&E.torchOn) tl.push(E.tl); LM.list=tl.length?WARE.lights.concat(tl):WARE.lights; lmTick(); }
function warePower(on,quiet){ if(FLOOR.mode!=='ware'||FLOOR.power===on) return; FLOOR.power=on; wareLever();
  if(!on){ FLOOR.offT=GAME.t; wareGoal('power');
    if(quiet){ /* the breaker clunks: the floor goes dark, they get their lights out and two go to look at the panel */
      sfx('click',.9); sfx('slowout',.5); const g=navSnap(-17.2,-1.0),gd=E=>Math.hypot(E.pos[0]-g[0],E.pos[1]-g[1]);
      const up=enemies.filter(E=>upright(E)&&!E.aware).sort((a,b)=>gd(a)-gd(b));
      up.forEach((E,i)=>setTimeout(()=>{ if(!upright(E)||E.aware) return; if(i<2){ investigate(E,g); if(i===0) say(E,['Who killed the power?','Breaker\'s tripped. I got it.','Kimball, the lights!'],2.4); }
        else if(gd(E)<26){ if(E.st==='idle') E.st='alert'; if(!E.mind||E.mind==='calm') E.mind='nervous'; if(i===2) say(E,['Lights are out!','The hell happened to the lights?','Get your light on.'],2.4); } },300+i*300+Math.random()*400)); }
    else { sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead&&Math.hypot(E.pos[0]-WARE_SW[0],E.pos[1]-WARE_SW[2])<22){ setTimeout(()=>{ if(!E.dead){ E.aware=true; E.mind='hunt'; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick(['Shots! The electrical room!','He\'s in the building!','Lights! Get your lights on!']),2.4); } },200+Math.random()*900); } } }
  else { sfx('click',.9); sfx('slowin',.35); }
  wareLights(); visionApply(); }
function wareLever(){ if(FLOOR.lever) FLOOR.lever.r=[0,0,FLOOR.power===false?-2.2:.35]; }
/* things you touch: the breaker (fingertip in VR, G at a desk; it pushes back on too) and the manifest */
function warePoke(p,h){ if(FLOOR.mode!=='ware'||PL.dead) return;
  if(FLOOR.lever){ const k=h.side+'brk',near=Math.hypot(p[0]-WARE_SW[0],p[1]-WARE_SW[1],p[2]-WARE_SW[2])<.12;
    if(near&&!warePoke.held[k]){ warePoke.held[k]=true; warePower(FLOOR.power===false,true); buzz(h.hand,.7,40); } else if(!near) warePoke.held[k]=false; }
  if(FLOOR.ledgerN&&FLOOR.ledgerN.vis&&Math.hypot(p[0]-WARE_LOG[0],p[1]-WARE_LOG[1],p[2]-WARE_LOG[2])<.16){ takeManifest(); buzz(h.hand,.6,60); } }
warePoke.held={};
function takeManifest(){ if(!FLOOR.ledgerN||!FLOOR.ledgerN.vis) return; FLOOR.ledgerN.vis=false; sfx('grab',.8); wareGoal('manifest'); }
addEventListener('keydown',e=>{ if(e.code!=='KeyG'||!GAME.started||FLOOR.mode!=='ware'||PL.dead) return;
  if(Math.hypot(PL.x-WARE_SW[0],PL.z-WARE_SW[2])<1.4) warePower(FLOOR.power===false,true);
  else if(Math.hypot(PL.x-WARE_LOG[0],PL.z-WARE_LOG[2])<1.4) takeManifest(); });
const WARE_GOALS={manifest:'Took the manifest: Kessler signs for every pallet that leaves',power:'The building is dark',radio:'Someone got on the radio: the whole warehouse knows'};
function wareGoal(k){ if(!FLOOR.goals) FLOOR.goals={}; if(FLOOR.goals[k]) return; FLOOR.goals[k]=true; if(XR.on) vrToast(WARE_GOALS[k],3.2); wareTag(); }
function wareTag(){ const g=FLOOR.goals||{},dead=enemies.filter(E=>E.dead).length; $('floorTag').textContent=`Warehouse · ${dead}/${enemies.length} down${g.manifest?' · manifest':''}${g.power?' · lights off':''}${g.radio?' · RADIOED':''}`; }

/* ---------- the cast ---------- */
function wareCast(){ for(const sp of WARE_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>copChar(sp.id,h,g)})); copSetup(E,sp); enemies.push(E); } attachLabels();
  for(const r of FLOOR.rewards){ const flat=r.key==='knife'||r.key==='machete'||r.key==='bottle'; const Mw=m4.compose(m4.make(),r.p,[flat?Math.PI/2:0,r.ry,flat?0:0],[1,1,1]); const P=addPickup(newItem(r.key),Mw,[0,0,0],[0,0,0]); P.rest=true; } }
function copSetup(E,sp){ E.detail=sp.detail||'works the warehouse'; E.radio=!!sp.radio; E.torch=sp.torch||0; E.torchOn=false;
  if(sp.patrol){ E.patrol={pts:sp.patrol,i:1,wait:0}; E.st='alert'; }
  (function find(n){ if(n.torch) E.lensN=n; for(const k of n.kids) find(k); })(E.holder);
  if(E.lensN) E.tl={p:[E.pos[0],1.3,E.pos[1]],c:[1.25,1.3,1.4],d:6.5,pow:'city'};
  mergeTree(E.C.wpn); mergeTree(E.C.dropped); mergeChar(E.C); atlasBody(E.C); }

/* ---------- seeing: under a light, in a flashlight's beam, up close, or by your muzzle flash ---------- */
function wareLitAt(x,z){ const on=FLOOR.power!==false; for(const l of WARE.lights){ if(l.pow==='gen'&&!on) continue; if(l.d<3) continue; if(Math.hypot(l.p[0]-x,l.p[2]-z)<l.d*.4) return true; } return false; }
function wareSeen(E,dist){ if(GAME.t-(GAME.shotT??-99)<1.4&&dist<18) return true; if(WARE.lit) return true; return dist<(FLOOR.power!==false?2.6:1.8); }
function wareTorches(){ const eye=[PL.x,1.4,PL.z]; let lit=false;
  for(const E of enemies){ if(!E.tl) continue;
    const want=!E.dead&&(E.torch>=2||FLOOR.power===false||(E.mind&&E.mind!=='calm'&&E.mind!=='nervous')||E.aware); if(!E.dead) E.torchOn=want; /* a dead man's light stays the way he left it */
    if(E.lensN.lens&&E.lensOn!==E.torchOn&&GAME.vision!=='thermal'){ const m=E.lensN.lens.mesh; m.mats[0]=E.torchOn?mLensOn:mLensOff; m.runs=null; E.lensOn=E.torchOn; }
    if(!E.torchOn) continue; const w=E.lensN.world; if(!w) continue; const p=[w[12],w[13],w[14]],f=norm3([w[8],w[9],w[10]]);
    E.tl.p[0]=p[0]+f[0]*1.4; E.tl.p[1]=Math.max(.3,p[1]+f[1]*1.4); E.tl.p[2]=p[2]+f[2]*1.4;
    if(!lit&&!E.dead){ const v=v3.sub(eye,p),d=Math.hypot(...v); if(d<11&&d>.3&&v3.dot(v,f)/d>.86&&sightClear(p,eye)) lit=true; } }
  return lit; }

/* ---------- the level's frame ---------- */
function tickWare(dt){ if(FLOOR.mode!=='ware') return;
  if(GAME.vision!=='nv') L.plCol.set([0,0,0],18);
  const beam=wareTorches(); WARE.lit=beam||wareLitAt(PL.x,PL.z); wareLM(); if(FLOOR.sky){ FLOOR.sky.p[0]=PL.x; FLOOR.sky.p[2]=PL.z; }
  for(const k of ['hole','splat']){ const D=DEC[k]; if(D.ver!==D._sv){ const n=D.length; for(let i=D.length-1;i>=0;i--){ const d=D[i]; if(d.c[1]>RH-.15&&d.n[1]<-.5) D.splice(i,1); } if(D.length!==n) D.ver++; D._sv=D.ver; } }
  for(const E of enemies){ if(E.patrol&&!E.dead&&!E.aware&&E.st==='idle'&&(!E.mind||E.mind==='calm'||E.mind==='nervous')) E.st='alert'; }
  if(!GAME.started||PL.dead||FLOOR.up) return;
  for(const E of enemies){ if(!E.radio||(FLOOR.goals&&FLOOR.goals.radio)) continue; if(E.aware&&upright(E)){ E.radioT=(E.radioT||0)+dt;
      if(E.radioT>2.0){ bark(E,pick(['Ten-thirty-three! He\'s in the building!','All units, he\'s here! The cop from the tower!','Somebody get over here! NOW!']),3); sfx('click',1); sfx('slowout',.4);
        for(const O of enemies) if(O!==E&&upright(O)&&!O.aware) setTimeout(()=>{ if(upright(O)&&!O.aware) setAware(O,'noise',[PL.x,PL.z]); },500+Math.random()*1500);
        wareGoal('radio'); for(const H of enemies) if(H.radio) H.radioT=-1e9; } } else if(!E.aware) E.radioT=0; }
  wareTag.t=(wareTag.t||0)-dt; if(wareTag.t<=0){ wareTag.t=.5; wareTag(); }
  if(PL.x>42.4&&Math.abs(PL.z-WARE_EXIT[1])<2.6){ GAME.clear=true; const dead=enemies.filter(E=>E.dead).length,g=FLOOR.goals||{};
    showMsg('ARROYO COUNTY',`Out the gate. ${dead} of ${enemies.length} dead${g.manifest?', the manifest in your pocket: Kessler\'s name on every page.':'.'} Reset to run it again.`); if(XR.on) XR.clearT=6; } }
function wareReset(){ if(FLOOR.power===false){ FLOOR.power=true; FLOOR.offT=null; wareLever(); wareLights(); } FLOOR.up=false; FLOOR.goals={}; if(FLOOR.ledgerN) FLOOR.ledgerN.vis=true;
  wareCast(); for(const R of RACK) if(!R.merged){ mergeTree(R.node); R.merged=true; } visionApply(); wareTag(); if(XR.on) vrToast('The warehouse. Get out the gate on the far side of the yard.',4); }
function goWare(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genWare(); buildRack(); buildBoard(); SPAWNOPT.where='any'; GAME.kit=null; resetGame(); if(XR.on) vrRecenter(); }
/* up the tunnel's exit ladder: into the warehouse with whatever is in your hands */
function tunnelAscend(){ FLOOR.up=true; sfx('door',.5); const dead=enemies.filter(E=>E.dead).length,n=enemies.length;
  const line=`El túnel · ${dead} of ${n} dead${FLOOR.power===false?' · lights cut':''}`; if(XR.on) vrToast(line,4.5);
  setTimeout(()=>{ carryInto(goWare); $('floorTag').textContent=line; },700); }
