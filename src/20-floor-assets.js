/* ================= view 3: the floor generator ================= */
const TIER_NAMES=['Corner boys','Cutters','Gunmen','Doormen','Enforcers','The Landlord'];
const TIER_RANGE=['1-5','6-10','11-15','16-20','21-29','30'];
const MAKERS=[makeCorner,makeCutter,makeGunman,makeDoorman,makeEnforcer,makeLandlord];
const UNIT_TYPES=[['squat','squat','kitchen','stash','bedroom'],['squat','kitchen','stash','bedroom','living'],['living','kitchen','bedroom','stash','living'],['living','kitchen','bedroom','stash','office'],['office','living','bedroom','stash','office'],['office','living','bedroom','office']];
const PICKUPS=[['bottle','knife'],['knife','machete'],['machete','revolver','pistol'],['pistol','shotgun','revolver'],['shotgun','smg','pistol'],['smg','shotgun']];
const PICK_NAMES={bottle:'Broken bottle',knife:'Kitchen knife',machete:'Machete',revolver:'.38 revolver',pistol:'9mm pistol',shotgun:'Pump shotgun',smg:'MP5',can:'Suppressor',bigcan:'Shotgun suppressor'};
const NAMES=['Dani','Marco','Teo','Rui','Kev','Jojo','Luis','Sami','Andre','Nico','Big Mike','Petey','Omar','Dre','Felix','Sonny','Tomas','Ivan','Lenny','Chris','Paulie','Benji','Raf','Eddie','Mo','Junior','Vic','Hector','Alex','Tariq','Dom','Stas'];
const DETAILS=['has a photo of his daughter taped to the fridge','owes the Landlord two months','keeps calling his mother on a dead phone','was a boxer once','sleeps with the light off because of the cameras','just moved in last week','is saving for a car','is the one who taped up the windows','plays the same cassette every night','used to fix the elevator','has a dog tied up in the bathroom','is somebody\'s little brother'];
const tLinoStain=cl(32,32,'#6b6656',18,401,g=>{ for(let y=0;y<32;y+=8) for(let x=0;x<32;x+=8) if(((x+y)/8)%2) R(g,'#57534a',x,y,8,8); const r=rng(402); for(let i=0;i<4;i++) R(g,'rgba(40,30,15,.4)',r()*28|0,r()*28|0,6,4); });
const tLinoHall=cl(32,32,'#5f6a5a',16,403,g=>{ R(g,'#4a5446',0,0,32,1); R(g,'#4a5446',0,16,32,1); specks(g,'#353c32',20,404,32,32); });
const tCarpet=cl(32,32,'#4a2e2e',20,405,g=>{ for(let y=2;y<32;y+=8) for(let x=2;x<32;x+=8) R(g,'#5c3a34',x,y,3,3); R(g,'rgba(20,14,10,.5)',6,10,9,6); });
const tParquet=cl(32,32,'#5a3e28',14,406,g=>{ for(let y=0;y<32;y+=4) R(g,'#46301e',0,y,32,1); for(let y=0;y<32;y+=4) R(g,'#46301e',(y*5)%32,y,1,4); });
const tPeel=cl(32,32,'#6f7e68',16,407,g=>{ const r=rng(408); for(let i=0;i<6;i++){ const x=r()*28|0,y=r()*24|0; R(g,'#a99c80',x,y,4+(r()*4|0),2+(r()*4|0)); } R(g,'#4a5444',0,28,32,4); });
const tPaper=cl(32,32,'#8a7a50',14,409,g=>{ for(let x=0;x<32;x+=4) R(g,'#7a6a42',x,0,1,32); R(g,'rgba(60,40,10,.35)',4,0,10,32); R(g,'#3a2e1c',0,29,32,3); });
const tDarkPaint=cl(32,32,'#3c4046',10,410,g=>{ R(g,'#2a2d31',0,29,32,3); R(g,'#4c5056',0,12,32,1); });
const tHallWall=cl(32,32,'#7a7a6c',16,411,g=>{ R(g,'#465046',0,17,32,15); R(g,'#2e362e',0,16,32,1); const r=rng(412); for(let i=0;i<4;i++){ const x=r()*32|0; for(let y=17;y<32;y++) if(r()>.3) R(g,'rgba(30,20,10,.4)',x,y,1,1); } });
const tDoorWood=cl(16,32,'#6a4a30',12,413,g=>{ R(g,'#5a3e28',2,3,12,11); R(g,'#5a3e28',2,17,12,12); R(g,'#c9b07a',12,16,2,1); R(g,'#3a2a1c',0,0,16,1); });
const tMattress=cl(32,16,'#b8ae94',14,414,g=>{ for(let y=0;y<16;y+=3) R(g,'#8f9aa8',0,y,32,1); R(g,'rgba(110,80,30,.45)',8,4,10,7); R(g,'rgba(90,10,10,.5)',22,9,3,2); });
const tBlanket=cl(16,16,'#3a4a3e',14,415,g=>{ for(let y=0;y<16;y+=4) R(g,'#2e3c32',0,y,16,2); });
const tCouch=cl(16,16,'#5a4632',14,416,g=>{ for(let x=0;x<16;x+=2) R(g,'#4a3828',x,0,1,16); R(g,'#3a2a1c',4,6,5,3); });
const tFridge=cl(16,32,'#d0cbbd',12,417,g=>{ R(g,'#a8a294',0,11,16,1); R(g,'#8a8478',13,3,1,6); R(g,'#8a8478',13,14,1,10); R(g,'rgba(80,60,30,.3)',0,26,16,6); R(g,'#e8e2d0',3,15,4,5); R(g,'#2a2a2a',4,16,2,1); });
const tCrate=cl(16,16,'#7a5e3a',14,418,g=>{ for(let y=0;y<16;y+=4) R(g,'#5a4428',0,y,16,1); R(g,'#5a4428',0,0,1,16); R(g,'#5a4428',15,0,1,16); });
const tCounter=cl(32,16,'#8a7a5a',12,419,g=>{ R(g,'#b8b0a0',0,0,32,3); for(let x=0;x<32;x+=8) R(g,'#5a4a32',x,3,1,13); R(g,'#c9b07a',6,8,2,1); R(g,'#c9b07a',14,8,2,1); });
const tTVStatic=tex(16,12,'#1a1e22',g=>{ const r=rng(420); for(let y=1;y<11;y++) for(let x=1;x<15;x++){ const v=60+r()*140|0; R(g,`rgb(${v*.8|0},${v*.9|0},${v})`,x,y,1,1); } });
const tTrash=cl(16,16,'#1e1e20',20,421,g=>{ R(g,'#2a2a2e',3,4,6,5); R(g,'#3a3226',9,9,5,4); R(g,'#c9c2b0',6,11,2,1); });
const tCabinet=cl(16,32,'#5a5e62',10,422,g=>{ for(const y of [2,12,22]){ R(g,'#46494c',1,y,14,8); R(g,'#8a8e92',6,y+3,4,1); } });
const tDesk=cl(16,16,'#4a3424',10,423,g=>R(g,'#5a4230',0,0,16,2));
const tNightWin=tex(16,16,'#0c1018',g=>{ const r=rng(424); for(let y=2;y<16;y+=4) for(let x=1;x<16;x+=3) if(r()>.6) R(g,r()>.6?'#9fb4cc':'#c9944a',x,y,1,2); R(g,'#2a3240',0,0,16,1); R(g,'#2a3240',7,0,1,16); });
const tBulb=tex(4,4,'#ffc477'), tBulbDead=tex(4,4,'#3a3a36'), tTVGlow=tex(4,4,'#a8c4ff');
const TAGS=['GET OUT','RENT DUE','NO WAY UP','KEEP CLIMBING','HE HEARS YOU','30 FLOORS','DONT LOOK UP','PAY UP'].map((s,i)=>tex(64,16,null,g=>{ const col=['#c9473a','#e8e2cf','#5fb3c9','#d9a441'][i%4]; const x=(64-textW(s,1))>>1; text(g,s,x+1,6,'rgba(0,0,0,.6)'); text(g,s,x,5,col); R(g,col,x+2,11,1,3); }));
const floorNumTex={};
function floorNum(n){ if(!floorNumTex[n]) floorNumTex[n]=tex(32,16,null,g=>{ const s=String(n).padStart(2,'0'); text(g,s,(32-textW(s,3))>>1,1,'#d8d4c4',3); }); return floorNumTex[n]; }
const tAxeCase=cl(16,16,'#8a1a14',10,425,g=>{ R(g,'#2a3438',2,2,12,12); R(g,'#5f7a82',3,3,2,1); text(g,'AXE',2,9,'#e8e2cf'); });

let NX=53,NZ=25; /* the nav grid: 0.5 m cells over the whole world, which each level sizes (setWorld in 30-floor.js) */
const cellX=i=>-RX+i*.5, cellZ=k=>-RZ+k*.5;
const FL={seed:0x3f2a,n:1,route:'both',data:null,quietMesh:null,loudMesh:null};
function tierOf(n){ return n>=30?5:n>=21?4:Math.floor((n-1)/5); }

/* furniture, each built facing +z, base on y=0; returns {size:[w,d], top?, seat?, bed?} */
const FURN={
  mattress(g){ mk(box(1.9,.18,.95,{at:[0,.09,0]}),F(M(tMattress),M(tMattress),M(tMattress),M(tMattress,{repeat:[2,2]})),g); mk(box(.4,.08,.6),M(tWhite),g,-.7,.22,0); mk(box(.9,.05,.9),M(tBlanket),g,.3,.2,.02,0,0,.05); return {size:[1.9,.95],bed:{x:.85,y:.18}}; },
  bed(g){ mk(box(2.0,.3,1.0,{at:[0,.15,0]}),mWood,g); const r=FURN.mattress(N(g,0,.3,0)); r.size=[2.0,1.0]; r.bed.y=.48; return r; },
  couch(g){ const m=M(tCouch); mk(box(2.0,.42,.85,{at:[0,.21,0]}),m,g); mk(box(2.0,.48,.22),m,g,0,.62,-.31); for(const s of [1,-1]) mk(box(.22,.6,.85),m,g,s*.9,.3,0); return {size:[2.0,.85],seat:{z:.06}}; },
  tv(g){ mk(box(.6,.5,.45,{at:[0,.25,0]}),M(tCrate),g); mk(box(.55,.42,.42),F(mBlack,M(tTVStatic,{unlit:true}),mBlack),g,0,.71,0); return {size:[.6,.45],tv:true}; },
  table(g){ mk(box(1.0,.05,.7),M(tWoodLight),g,0,.74,0); for(const [x,z] of [[-.44,-.29],[.44,-.29],[-.44,.29],[.44,.29]]) mk(box(.05,.72,.05,{at:[0,.36,0]}),mWood,g,x,0,z);
    for(const s of [1,-1]){ const c=N(g,s*.25,0,s*.6,0,s>0?Math.PI:0,0); mk(box(.42,.04,.42),mWood,c,0,.45,0); mk(box(.42,.5,.04),mWood,c,0,.72,-.19); for(const [x,z] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]]) mk(box(.035,.45,.035,{at:[0,.225,0]}),mWood,c,x,0,z); }
    return {size:[1.0,1.5],top:.77}; },
  counter(g){ mk(box(2.0,.9,.6,{at:[0,.45,0]}),F(M(tCounter),M(tCounter),M(tCounter),M(tSteel)),g); mk(box(.5,.04,.4),M(tSteel),g,.4,.91,0); return {size:[2.0,.6],top:.92}; },
  fridge(g){ mk(box(.7,1.7,.7,{at:[0,.85,0]}),F(M(tFridge),M(tFridge)),g); return {size:[.7,.7]}; },
  crates(g){ const m=M(tCrate); mk(box(.7,.6,.7,{at:[0,.3,0]}),m,g,-.12,0,0,0,.1,0); mk(box(.6,.5,.6,{at:[0,.25,0]}),m,g,.05,.6,.02,0,-.2,0); mk(box(.5,.45,.5,{at:[0,.225,0]}),m,g,.45,0,.15,0,.4,0); return {size:[1.2,.9],top:1.1}; },
  trash(g){ const m=M(tTrash); mk(box(.5,.35,.4,{tw:.7,td:.7,at:[0,.17,0]}),m,g,-.15,0,0); mk(box(.4,.3,.4,{tw:.6,td:.6,at:[0,.15,0]}),m,g,.25,0,.1); mk(box(.3,.12,.2),M(tCrate),g,.0,.05,-.2); return {size:[.9,.7]}; },
  wardrobe(g){ mk(box(1.0,1.9,.55,{at:[0,.95,0]}),F(mWood,M(tDoorWood,{repeat:[2,1]})),g); return {size:[1.0,.55]}; },
  desk(g){ mk(box(1.4,.06,.7),M(tDesk),g,0,.75,0); mk(box(.45,.72,.66,{at:[0,.36,0]}),M(tCabinet),g,-.45,0,0); mk(box(.05,.72,.05,{at:[0,.36,0]}),mBlack,g,.65,0,.3); mk(box(.05,.72,.05,{at:[0,.36,0]}),mBlack,g,.65,0,-.3);
    mk(box(.5,.04,.35),mBlack,g,.1,.8,-.1); const c=N(g,.2,0,.6,0,Math.PI,0); mk(box(.45,.08,.45),mBlack,c,0,.48,0); mk(box(.45,.55,.06),mBlack,c,0,.8,-.2); mk(cyl(.03,.03,.44,5,{at:[0,.22,0]}),mBlack,c); return {size:[1.4,1.2],top:.78}; },
  filing(g){ mk(box(.5,1.3,.6,{at:[0,.65,0]}),F(mSteel,M(tCabinet)),g); return {size:[.5,.6]}; },
  bucket(g){ mk(cyl(.16,.13,.3,8,{at:[0,.15,0]}),[M(tSteel,{double:true}),M(tBlack),mSteel],g); return {size:[.35,.35]}; }
};
const KITS={
  squat:[['mattress','back'],['trash','side'],['bucket','corner'],['crates','corner']],
  bedroom:[['bed','back'],['wardrobe','side'],['trash','corner']],
  kitchen:[['counter','back'],['fridge','corner'],['table','mid']],
  living:[['couch','back'],['tv','front'],['trash','corner']],
  stash:[['crates','back'],['table','mid'],['crates','corner'],['mattress','side']],
  office:[['desk','mid'],['filing','back'],['filing','corner'],['couch','side']]
};

