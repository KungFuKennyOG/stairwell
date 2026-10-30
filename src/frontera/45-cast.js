
/* =====================================================================================================
   PUERTO SECO · art direction set 04. A fictional border city. Ray's joint task-force team for the prologue raid
   (they all die; he's left for dead), and the cartel: the six tower types restyled, same rig, new clothes.
   ===================================================================================================== */
Object.assign(HEADS,{
  dunne:{seed:1201,skin:'#d8a88a',skinD:'#a87a60',hair:'buzz',hairC:'#8a8682',hairFront:15,shadow:true,brow:'#6a6662',browT:2,iris:'#4a6a8a',lip:'#a8685c',beard:'stubble',beardC:'#8a8682',age:true},
  reyes:{seed:1202,skin:'#c8946e',skinD:'#966a4c',hair:'long',hairC:'#140e0a',hairFront:13,sideburn:44,behind:52,nape:54,brow:'#140e0a',browT:2,iris:'#2a1a10',lip:'#9a5a4c'},
  ibarra:{seed:1203,skin:'#b07a56',skinD:'#80523a',hair:'slick',hairC:'#120e0c',hairFront:13,sideburn:40,shadow:true,brow:'#120e0c',browT:2,iris:'#2a1a10',lip:'#84483a',beard:'mustache',beardC:'#120e0c'},
  harris:{seed:1204,skin:'#5e3a26',skinD:'#3c2214',hair:'buzz',hairC:'#0e0a08',hairFront:15,brow:'#0e0a08',browT:2,iris:'#1a0e08',lip:'#4e2c1e',beard:'goatee',beardC:'#0e0a08',white:'#d8cfc0'},
  novak:{seed:1205,skin:'#e8c0a0',skinD:'#bc9478',hair:'buzz',hairC:'#c8a868',hairFront:15,brow:'#a8885a',iris:'#5a7a9a',lip:'#c07a6a'},
  halcon:{seed:1211,skin:'#c08a64',skinD:'#905e44',hair:'buzz',hairC:'#141010',hairFront:15,brow:'#141010',iris:'#2a1a10',lip:'#8a4a3a',beard:'stubble',beardC:'#1a1210',acne:true},
  machetero:{seed:1212,skin:'#9a6644',skinD:'#6a422a',hair:'buzz',hairC:'#100c0a',hairFront:15,shadow:true,brow:'#100c0a',browT:2,iris:'#1a0e08',lip:'#6a3a2a',beard:'goatee',beardC:'#100c0a',scar:true},
  pistolero:{seed:1213,skin:'#d4a07c',skinD:'#a47456',hair:'slick',hairC:'#0e0a08',hairFront:12,sideburn:34,brow:'#0e0a08',iris:'#2a1a10',lip:'#94564a',beard:'goatee',beardC:'#0e0a08',gold:true},
  escolta:{seed:1214,skin:'#8a5a3c',skinD:'#5e3a26',hair:'shaved',hairFront:14,shadow:true,brow:'#120c08',browT:2,iris:'#1a0e08',lip:'#5e3424',beard:'full',beardC:'#120c08'},
  comando:{seed:1215,skin:'#b88a68',skinD:'#8a5e44',bal:'#1e2018',brow:'#1a1210',iris:'#2a2a1a',lip:'#8a4a3a'},
  patron:{seed:1216,skin:'#c89474',skinD:'#986a50',hair:'slick',hairC:'#d8d4cc',hairFront:12,sideburn:40,brow:'#c8c4bc',browT:2,iris:'#3a2a1a',lip:'#9a5a4e',beard:'mustache',beardC:'#e8e4dc',age:true}
});

/* ---------- props ---------- */
function pRadio(g){ mk(box(.05,.11,.03),M(null,{color:0x1a1a1c}),g,0,-.05,.02); mk(box(.008,.08,.008),mBlack,g,.015,.04,.02); mk(box(.03,.02,.005),M(null,{color:0x7cf06a,unlit:true}),g,0,-.03,.037); return g; }
function pPistolGold(g){ mk(box(.03,.035,.19),mGold,g,0,.045,.06); mk(box(.028,.02,.16),mGold,g,0,.02,.05); mk(box(.028,.11,.045),M(null,{color:0xf0ece0}),g,0,-.035,-.005,.28); return g; }

/* ---------- the team: navy BDUs, plate carriers, helmets, NVGs flipped up ---------- */
const NAVY='#252e3f', NAVY_D='#181e29';
function teamTorso(k,seed,col,colD){ return torsoP(k,seed,(x,y)=>y<T3.belt-3?[col,'twill']:[col,'twill',.6,.92],{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,6,colD,.8,1); seam(I,64,T3.neck+14,64,T3.belt-4); sideSeams(I,T3.neck,T3.belt); beltI(I,'#141416','#5a5a5e'); seam(I,64,T3.belt+5,64,T3.belt+40); }}); }
function teamArm(seed,col,colD,flag){ return armP(seed,()=>[col,'twill'],{decor:I=>{ softRect(I,40,18,12,14,colD,.95,1); if(flag){ softRect(I,42,21,8,2,flag[0],.9,.5); softRect(I,42,24,8,2,flag[1],.9,.5); softRect(I,42,27,8,2,flag[2],.9,.5); } softRect(I,0,116,64,12,colD,.55,2); seam(I,16,0,16,128); }}); }
function teamLeg(seed,col,colD){ return legP(seed,()=>[col,'twill'],{decor:I=>{ for(const x of [4,42]){ softRect(I,x,30,17,24,colD,.6,1); softRect(I,x,30,17,5,mix(col,'#ffffff',.08),.9,.6); seam(I,x,35,x+17,35); } seam(I,48,0,48,128); seam(I,16,0,16,128); softRect(I,0,112,64,16,colD,.5,3); }}); }
function teamVest(seed,base,word,name,textCol='#dedcd2'){ return garment(128,64,seed,()=>[base,'cordura',.5],{folds:6,decor:I=>{
  for(let y=34;y<58;y+=8) for(let x=2;x<128;x+=8) if((x>>3)%4!==3){ softRect(I,x,y,6,4,mix(base,'#000000',.3),.9,.4); softLine(I,x,y,x+6,y,mix(base,'#ffffff',.15),.4,.8); }
  /* no lettering (the pixel font read as garbage on a vest): a plain velcro ID panel front and back, stitched round, and a blank name tape */
  for(const cx of [64,0,128]){ softRect(I,cx-24,7,48,15,mix(base,'#000000',.22),.95,.8); for(const [x0,y0,x1,y1] of [[cx-24,7,cx+24,7],[cx-24,22,cx+24,22],[cx-24,7,cx-24,22],[cx+24,7,cx+24,22]]) softLine(I,x0,y0,x1,y1,mix(base,'#ffffff',.18),.35,.8); }
  if(name){ softRect(I,48,26,32,5,mix(base,'#000000',.35),.9,.6); } softRect(I,0,0,128,3,mix(base,'#000000',.4),1,1); softRect(I,0,61,128,3,mix(base,'#000000',.4),1,1); }}); }
const tTeamTorso=teamTorso('dunne',1301,NAVY,NAVY_D), tTeamLeg=teamLeg(1303,NAVY,NAVY_D);
const tTeamArmUS=teamArm(1302,NAVY,NAVY_D,['#b8302a','#e8e4dc','#2a3a6a']);
const FED='#2a2c2e', FED_D='#1a1b1c';
const tFedTorso=teamTorso('ibarra',1311,FED,FED_D), tFedArm=teamArm(1312,FED,FED_D,['#2a6a3a','#e8e4dc','#b8302a']), tFedLeg=teamLeg(1313,FED,FED_D);
const TVEST={dunne:teamVest(1321,'#1d2331','POLICE','DUNNE'),reyes:teamVest(1322,'#1d2331','POLICE','REYES'),harris:teamVest(1323,'#1d2331','POLICE','HARRIS'),novak:teamVest(1324,'#1d2331','POLICE','NOVAK'),ibarra:teamVest(1325,'#3a3c3e','FEDERAL','IBARRA','#e8e2d0')};
function helmet(J,col,nods=true,hs=1){ const m=M(null,{color:hexInt(col)}); crown(J,[[.105*hs,.094*hs,.112*hs],[.16*hs,.101*hs,.12*hs],[.215*hs,.092*hs,.11*hs],[.255*hs,.06*hs,.078*hs],[.272*hs,0,0]],m,-.012);
  for(const s of [-1,1]) mk(box(.03,.07,.08),M(null,{color:0x1a1a1c}),J.head,s*.088,.1,-.005);
  mk(box(.05,.03,.03),M(null,{color:0x1a1a1c}),J.head,0,.22,.108); if(nods){ const n=N(J.head,0,.255,.1,-1.25,0,0); for(const s of [-1,1]) mk(cyl(.017,.017,.075,8),M(null,{color:0x141416}),n,s*.022,.0,.02); } }
function plateCarrier(J,o,t){ vest(J,o,M(t,{double:true}),.024); const sy=1.09*o.hf,fz=frontAt(o,1.18,.024),pm=M(tPad); for(const x of [-.09,0,.09]) mk(box(.075,.085,.04),pm,J.spine,x,1.18*o.hf-sy,fz+.016); }

/* ---------- the cartel ---------- */
/* el halcón (lookout): black hoodie, cap, jeans, white sneakers, radio */
const tHalTorso=torsoP('halcon',1401,(x,y)=>{ if(crewNeck(x,y,12,9)) return sk('halcon'); return y>T3.belt+2?['#3a4a6a','denim',.6]:['#1c1c20','knit',.8]; },{decor:I=>{ neckShadow(I); softRect(I,40,T3.nav-28,48,28,'#141418',.9,1.2); for(const s of [-1,1]) softLine(I,64+s*5,T3.neck+8,64+s*6,T3.neck+40,'#c8c4b8',.9,1); softEll(I,64,T3.chest-6,10,8,'#c89a3a',.6,.6); softRect(I,0,T3.belt-8,128,10,'#141418',.9,2); }});
const tHalArm=armP(1403,()=>['#1c1c20','knit',.8],{decor:I=>softRect(I,0,112,64,16,'#141418',.9,2)});
const tHalLeg=legP(1405,()=>['#3a4a6a','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,62,10,8,.14,'#7a8aaa'); softRect(I,0,110,64,18,'#2a3a5a',.7,2); }});
const tSneakW=garment(64,32,1407,()=>['#ece8e2','leather',.2],{folds:2,grime:.06,decor:I=>{ softRect(I,0,24,64,8,'#d8d4cc',1,1); softLine(I,18,8,46,14,'#c8c4bc',.9,1.4); }});
/* el machetero: red-and-black flannel open over a white tank, jeans, work boots */
const tMachTorso=torsoP('machetero',1411,(x,y)=>{ const open=Math.abs(x-64)<16; if(y>T3.belt+2) return ['#2a3448','denim',.6]; if(open) return crewNeck(x,y,14,14)?sk('machetero'):['#e8e4dc','cotton',.6]; return [plaid(x,y,'#8a1a16','#4a0e0c','#141010'),'cotton',.7]; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*16,T3.neck+6,64+s*16,T3.belt,'#2a0806',.9,2); stain(I,60,T3.nav-12,5,'#8a7a5a',1412); beltI(I,'#3a2414','#a8a49c'); }});
const tMachArm=armP(1413,(x,y)=>y>100?sk('machetero'):[plaid(x,y,'#8a1a16','#4a0e0c','#141010'),'cotton',.7],{decor:I=>{ softRect(I,0,96,64,6,'#4a0e0c',.9,1); softLine(I,20,108,40,118,'#2a3a4a',.6,1.6); }});
const tMachLeg=legP(1415,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,44,9,20,.12,'#6a7a9a'); softRect(I,0,100,64,28,'#3a2a1a',.25,4); }});
const tWorkBoot=garment(64,32,1417,()=>['#6a4a2a','leather',.3],{folds:3,grime:.2,decor:I=>{ softRect(I,0,22,64,10,'#2a1a10',1,1); for(const y of [4,9,14]) softLine(I,26,y,38,y,'#c8a870',.8,1); }});
/* el pistolero: black silk shirt with a gold baroque print, black jeans, gold chain */
function baroque(I,x0,y0,w,h,seed){ const r=rng(seed); for(let i=0;i<w*h/140;i++){ const x=x0+r()*w,y=y0+r()*h; for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; softLine(I,x,y,x+Math.cos(a)*6,y+Math.sin(a)*6,'#c8a040',.8,1.1); } softEll(I,x,y,2,2,'#e8c860',.9,.4); } }
const tPistTorso=torsoP('pistolero',1421,(x,y)=>{ if(vNeck(x,y,12,30)) return sk('pistolero'); return y>T3.belt+2?['#141416','denim',.5]:['#121214','poly',.5,1.06]; },{decor:I=>{ neckShadow(I); baroque(I,0,T3.neck+4,128,T3.belt-T3.neck-8,1422); chainI(I,'#e8c860'); chainI(I,'#d4ad5a'); buttons(I,[64],T3.neck+34,T3.belt-4,18,'#d4ad5a'); beltI(I,'#0a0a0c','#e8c860'); }});
const tPistArm=armP(1423,(x,y)=>y<46?['#121214','poly',.5,1.06]:sk('pistolero'),{decor:I=>{ baroque(I,0,0,64,42,1424); blob(I,32,50,30,3,-.18); softRect(I,22,108,18,6,'#e8c860',.95,.5); softLine(I,10,60,50,90,'#2a2a3a',.5,2.4); }});
const tPistLeg=legP(1425,()=>['#141416','denim'],{decor:I=>{ seam(I,48,0,48,128,'#3a3a3e'); blob(I,32,62,8,6,.1); }});
const tLoaferB=garment(64,32,1427,()=>['#141416','leather',.2],{folds:2,grime:0,decor:I=>{ softRect(I,0,26,64,6,'#0a0a0b',1,1); softRect(I,24,10,16,3,'#d4ad5a',.95,.5); }});
/* el escolta (bodyguard): black polo stretched tight, tan cargo trousers */
const tEscTorso=torsoP('escolta',1431,(x,y)=>{ if(vNeck(x,y,8,18)) return sk('escolta'); return y>T3.belt+2?['#8a7a5a','twill',.6]:['#18181a','cotton',.7]; },{decor:I=>{ neckShadow(I); softRect(I,50,T3.neck,28,6,'#101012',.9,1); buttons(I,[64],T3.neck+20,T3.neck+40,10,'#2a2a2e'); beltI(I,'#2a1a10','#a8a49c'); softRect(I,96,T3.belt-6,14,24,'#141416',.95,1); }});
const tEscArm=armP(1433,(x,y)=>y<40?['#18181a','cotton',.7]:sk('escolta'),{decor:I=>{ blob(I,32,44,30,3,-.18); }});
const tEscLeg=legP(1435,()=>['#8a7a5a','twill'],{decor:I=>{ for(const x of [4,42]){ softRect(I,x,32,17,24,'#7a6a4a',.7,1); softRect(I,x,32,17,5,'#9a8a6a',.9,.6); } seam(I,48,0,48,128); seam(I,16,0,16,128); }});
/* el comando: woodland camo, olive plate carrier with a unit patch, balaclava */
const camo=(x,y,s)=>{ const v=fbm(x*.06,y*.06,s); return v>.25?'#2a2a1e':v>0?'#4a5a32':v>-.25?'#6a6a48':'#5a4a32'; };
const tComTorso=torsoP('comando',1441,(x,y)=>[camo(x,y,1442),'twill',.6],{decor:I=>{ neckShadow(I); beltI(I,'#2a2a1e','#5a5a4a'); }});
const tComArm=armP(1443,(x,y)=>[camo(x,y,1444),'twill',.6],{decor:I=>{ softRect(I,38,14,16,16,'#2a2a1e',.95,1); textI(I,'G7',41,18,'#c8b880',2); softRect(I,0,116,64,12,'#2a2a1e',.6,2); }});
const tComLeg=legP(1445,(x,y)=>[camo(x,y,1446),'twill',.6],{decor:I=>{ for(const x of [4,42]){ softRect(I,x,28,17,24,'#3a3a2a',.6,1); } seam(I,48,0,48,128); seam(I,16,0,16,128); }});
const tComVest=garment(128,64,1447,()=>['#4a4a34','cordura',.5],{folds:6,decor:I=>{ for(let y=34;y<58;y+=8) for(let x=2;x<128;x+=8) if((x>>3)%4!==3) softRect(I,x,y,6,4,'#34341e',.9,.4); softRect(I,52,6,24,18,'#1a1a12',.95,1); textI(I,'G7',57,10,'#c8b880',2); }});
/* el patrón de la plaza: white western shirt with embroidered yokes, jeans, big buckle, straw hat */
const tPatTorso=torsoP('patron',1451,(x,y)=>{ if(vNeck(x,y,9,20)) return sk('patron'); return y>T3.belt+2?['#2a3448','denim',.6]:['#ece8de','cotton',.5]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ for(let k=0;k<5;k++) softLine(I,64+s*(14+k*5),T3.neck+6+k*6,64+s*(34+k*4),T3.neck+2+k*7,'#8a2a22',.7,1.2); softEll(I,64+s*26,T3.neck+24,4,3,'#2a5a3a',.8,.4); }
  buttons(I,[64],T3.neck+26,T3.belt-4,16,'#c8c0b0'); for(const x of [38,90]){ softRect(I,x-8,T3.chest-16,16,3,'#b8b0a0',.8,.5); } beltI(I,'#3a2414','#c8c4b8'); softRect(I,54,T3.belt-7,20,14,'#d4ad5a',1,.8); softEll(I,64,T3.belt,5,4,'#8a6a2a',.9,.4); }});
const tPatArm=armP(1453,()=>['#ece8de','cotton',.5],{decor:I=>{ softRect(I,0,112,64,16,'#e0dccf',.8,1); softRect(I,24,120,16,4,'#d4ad5a',.9,.5); }});
const tPatLeg=legP(1455,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,44,9,20,.12,'#6a7a9a'); }});
const tExotic=garment(64,32,1457,(x,y)=>[((x>>2)+(y>>2))%2?'#8a6a4a':'#7a5a3a','leather',.3],{folds:2,grime:.04,decor:I=>{ softRect(I,0,24,64,8,'#2a1a10',1,1); softLine(I,30,0,34,12,'#c8a870',.8,1); }});
function strawHat(J,hs=1){ const m=M(null,{color:0xd8c8a0}),band=M(null,{color:0x3a2414}); const n=N(J.head,0,.2*hs,-.004,-.06,0,0);
  mk(cyl(.2*hs,.2*hs,.01,14),M(null,{color:0xd8c8a0,double:true}),n,0,0,0); mk(lathe([[0,.1*hs,.12*hs],[.07*hs,.095*hs,.112*hs],[.12*hs,.07*hs,.08*hs],[.13*hs,0,0]],10),m,n); mk(cyl(.104*hs,.104*hs,.025,10,{open:true}),M(null,{color:0x3a2414,double:true}),n,0,.015,0); }

const SQUAD=['ray','dunne','reyes','ibarra','harris','novak'];
const CARTEL=['halcon','machetero','pistolero','escolta','comando','patron'];
const ROSTER={
  ray:{side:'team',maker:makeRay,name:'Ray',role:'You · breacher, second through the door',color:'#e8a33d',fate:'Survives. Shot through the side, left on the stairs with his team around him.',note:'Never says a word in the whole game. The team does the talking on the drive in; after the raid, nobody talks to him except the voice on the burner phone.'},
  dunne:Object.assign({side:'team',name:'Lt. Frank Dunne',role:'Team lead · 26 years on the job',color:'#252e3f',fate:'Dies on floor 4. Walks into the ambush the tip set up.',note:'Talks the whole drive: his daughter\'s wedding, his knees, his last raid before a desk job. Calls Ray "kid" even though Ray is forty.',
    o:{hf:1.0,w:1.06,depth:1.06,belly:1.12,lg:1.04,ag:1.06,jacket:.006,pants:.008},torso:tTeamTorso,arm:tTeamArmUS,leg:tTeamLeg,foot:tRayBoot,hand:tRayGlove,extra:(J,o)=>{ plateCarrier(J,o,TVEST.dunne); helmet(J,'#1e2530',true); kneePads(J,o); }},TWO(pSMG,'smg')),
  reyes:Object.assign({side:'team',name:'Ana Reyes',role:'Breacher · shotgun',color:'#c8946e',fate:'Dies on floor 2, at the door she was breaching. The door was wired.',note:'Grew up four streets from the tower. Translates for the team, argues with Ibarra in Spanish, and is the best shot in the truck.',
    o:Object.assign({jacket:.008,pants:.01},FEM,{hf:.96,w:.96}),torso:tTeamTorso,arm:tTeamArmUS,leg:tTeamLeg,foot:tRayBoot,hand:tRayGlove,extra:(J,o)=>{ plateCarrier(J,o,TVEST.reyes); helmet(J,'#1e2530',false); bun(J,'#140e0a'); kneePads(J,o); }},TWO(pShotgun,'shotgun')),
  ibarra:Object.assign({side:'team',name:'Tomás Ibarra',role:'Federal liaison · knows the city',color:'#3a3c3e',fate:'Dies on floor 6, covering Ray on the stairs. Or sold them out. The game never quite tells you.',note:'Local federal officer attached to the task force. Quiet, careful, makes a phone call in the truck that nobody else hears.',
    o:{hf:.99,w:1.0,depth:1.0,lg:.98,ag:1.0,jacket:.006,pants:.008},torso:tFedTorso,arm:tFedArm,leg:tFedLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ plateCarrier(J,o,TVEST.ibarra); helmet(J,'#2a2c2e',true); kneePads(J,o); }},TWO(pSMG,'smg')),
  harris:Object.assign({side:'team',name:'DeShawn "Deuce" Harris',role:'Point man · SMG',color:'#5e3a26',fate:'Dies on floor 5, in a hallway with no cover, still joking on the radio.',note:'The loud one. Runs the music in the truck and a betting pool on everything. Ray\'s closest friend on the team, which the player finds out from a photo later.',
    o:{hf:1.02,w:1.04,depth:1.02,lg:1.04,ag:1.06,jacket:.006,pants:.008},torso:tTeamTorso,arm:tTeamArmUS,leg:tTeamLeg,foot:tRayBoot,hand:tRayGlove,extra:(J,o)=>{ plateCarrier(J,o,TVEST.harris); helmet(J,'#1e2530',true); kneePads(J,o); }},TWO(pSMG,'smg')),
  novak:Object.assign({side:'team',name:'Kyle Novak',role:'Rookie · first live raid',color:'#e8c0a0',fate:'Dies last, next to Ray, talking until he can\'t. Ray never answers him.',note:'Twenty-four, nervous, checks his gear three times on the drive. Asks Ray what it\'s like the first time. Ray doesn\'t answer that either.',
    o:{hf:.98,w:.94,depth:.94,lg:.96,ag:.94,jacket:.006,pants:.008},torso:tTeamTorso,arm:tTeamArmUS,leg:tTeamLeg,foot:tRayBoot,hand:tRayGlove,extra:(J,o)=>{ plateCarrier(J,o,TVEST.novak); helmet(J,'#1e2530',false); kneePads(J,o); }},PISTOL,{fight:AIM_ONE}),
  halcon:{as:'corner',side:'cartel',was:'Corner boy',name:'El halcón',role:'Lookout · radio on the corner',color:'#1c1c20',note:'Watches the street from a plastic chair and calls in every car. Half of them are barely adults; this one is twenty-two and already scared of his boss.',
    o:{hf:.97,w:.92,depth:.94,lg:.92,ag:.9,jacket:.014,pants:.01,shoeW:.095},torso:tHalTorso,arm:tHalArm,leg:tHalLeg,foot:tSneakW,extra:J=>cap(J,'#141414','#141414'),prop:pRadio,gripHand:true,fight:{armR:[-.6,0,.3],elbowR:[-2.3,0,0],armL:[-.3,0,.3],elbowL:[-1.4,0,0],head:[.06,-.15,.12],thighL:[-.04,0,.04]},wFight:{p:[0,-.07,.03],r:[.3,0,0]}},
  machetero:Object.assign({as:'cutter',side:'cartel',was:'Cutter',name:'El machetero',role:'Enforcer · close work',color:'#8a1a16',note:'Does the jobs nobody wants to film. Comes at you the second he knows where you are.',
    o:{hf:1.0,w:.98,depth:1.0,lg:.98,ag:1.02,jacket:.012,pants:.008},torso:tMachTorso,arm:tMachArm,leg:tMachLeg,foot:tWorkBoot},{prop:pMachete,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND}),
  pistolero:Object.assign({as:'gunman',side:'cartel',was:'Gunman',name:'El pistolero',role:'Gunman · gold on everything',color:'#c8a040',note:'Silk shirt, gold chain, gold pistol, phone full of videos of himself. Keeps his distance and shoots from cover.',
    o:{hf:.99,w:.97,depth:.98,lg:.96,ag:.96,jacket:.004,pants:.008,shoeW:.095},torso:tPistTorso,arm:tPistArm,leg:tPistLeg,foot:tLoaferB},{prop:pPistolGold,support:true,gripHand:true,wFight:{p:[.036,-.139,.035],r:[Math.PI/2,0,0]},fight:AIM_ONE}),
  escolta:Object.assign({as:'doorman',side:'cartel',was:'Doorman',name:'El escolta',role:'Bodyguard · shotgun',color:'#18181a',note:'Huge, quiet, never more than three steps from the man he guards. Holds a door like a wall.',
    o:{hf:1.06,w:1.18,depth:1.15,belly:1.1,lg:1.18,ag:1.22,jacket:.016,pants:.012,headS:1.04,shoeW:.11},torso:tEscTorso,arm:tEscArm,leg:tEscLeg,foot:tBlackBoot},TWO(pShotgun,'shotgun')),
  comando:Object.assign({as:'enforcer',side:'cartel',was:'Enforcer',name:'El comando',role:'Cartel paramilitary · unit G7',color:'#4a5a32',note:'Ex-army, now the cartel\'s own. Camo, plate carrier, balaclava, moves in pairs. He has night vision too, later in the game.',
    o:{hf:1.01,w:1.04,depth:1.02,lg:1.04,ag:1.04,jacket:.006,pants:.01},torso:tComTorso,arm:tComArm,leg:tComLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ vest(J,o,M(tComVest,{double:true}),.026); const sy=1.09*o.hf,fz=frontAt(o,1.18,.026); for(const x of [-.09,0,.09]) mk(box(.08,.1,.045),M(tPouch),J.spine,x,1.18*o.hf-sy,fz+.02); kneePads(J,o); }},TWO(pSMG,'smg')),
  patron:Object.assign({as:'landlord',side:'cartel',was:'The Landlord',name:'Don Aurelio',role:'El patrón de la plaza · owns the tower',color:'#ece8de',note:'Runs this plaza from the top floor of the tower he built. Polite, old, never raises his voice, and gave the order. White shirt, straw hat, a revolver he hasn\'t fired in years.',
    o:{hf:.96,w:.98,depth:1.02,belly:1.16,lg:.92,ag:.9,jacket:.008,pants:.012,shoeW:.1},torso:tPatTorso,arm:tPatArm,leg:tPatLeg,foot:tExotic,extra:J=>strawHat(J)},REVOLVER)
};
