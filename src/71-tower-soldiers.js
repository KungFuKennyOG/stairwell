/* =====================================================================
   THE TOWER, floors 07-09: the soldiers. The men who did the stairs, where they sleep, practise and watch.
   Long floors from the start (32 m, x -16..16, like 01-06 after 68-tower-long.js): five or four units a side, small and dark,
   a few warm pools. Gunmen now, shotguns, an SMG; fewer machetes. The team's things are in their hands.
   Light budget: 7 a floor at most (the engine has 8; a hunter's flashlight takes the 7th slot, so 07 keeps to 6).
   Pushed onto TOWER, so the start card and the climb pick them up on their own.
   ===================================================================== */

/* ---------- the details ---------- */
/* Chucho's plan of the stairs, in pencil on a paper bag: the flights zigzag up, six x's on them, five struck through in red */
const tTw7Plan=tex(24,32,'#cdb98e',g=>{ R(g,'#b8a272',0,0,24,1); R(g,'#b8a272',0,31,24,1);
  for(let f=0;f<4;f++){ const y0=27-f*7,l=f%2?20:3,r=f%2?3:20; for(let s=0;s<17;s++){ const x=Math.round(l+(r-l)*s/16); R(g,'#4a4438',x,y0-Math.round(s*6/16),1,1); } R(g,'#4a4438',Math.min(l,r),y0-6,18,1); }
  const xs=[[5,25],[11,22],[17,19],[16,12],[9,9],[18,4]]; xs.forEach(([x,y],k)=>{ R(g,'#1e1c18',x-1,y-1,1,1); R(g,'#1e1c18',x+1,y-1,1,1); R(g,'#1e1c18',x,y,1,1); R(g,'#1e1c18',x-1,y+1,1,1); R(g,'#1e1c18',x+1,y+1,1,1);
    if(k<5){ R(g,'#a8241c',x-2,y,5,1); } });
  R(g,'#3a6ad0',20,2,3,3); R(g,'#cdb98e',21,3,1,1); /* the sixth, ringed in biro */ });
/* channel nine: the tower at night, police lights, the banner */
const tTw7News=tex(40,24,'#14203a',g=>{ R(g,'#1e2c48',0,0,40,16); R(g,'#2e2820',14,2,12,14); for(let y=4;y<15;y+=3) for(let x=16;x<25;x+=3) R(g,y%2?'#c98a3a':'#16120c',x,y,1,1);
  R(g,'#d8362e',8,13,3,2); R(g,'#3a6ad0',29,13,3,2); R(g,'#a8241c',0,16,40,8); text(g,'5 POLICIAS',1,17,'#f2ede2'); R(g,'#f2c230',35,1,4,3); });
/* the bunk room's blankets, and the boot-room's */
const tTw7Blanket=cl(16,16,'#4a5a3a',12,4701,g=>{ for(let y=2;y<16;y+=5) R(g,'#3a4a2e',0,y,16,1); R(g,'#8a3a2a',0,0,16,1); });
const tTw7Patch=tex(8,6,'#1e2530',g=>{ R(g,'#c9a23a',1,1,6,4); R(g,'#1e2530',2,2,4,2); });
/* the range: a plywood man with rings on him, shot to bits round the head; the armory's pegboard */
const tTw8Target=cl(16,32,'#b8925a',10,4801,g=>{ R(g,'#16140f',5,2,6,6); R(g,'#16140f',2,9,12,21); R(g,'#16140f',4,8,8,2);
  for(const [x,y] of [[7,4],[9,5],[6,6],[8,3],[7,14],[9,16],[5,20],[10,22],[8,18]]) R(g,'#e8dcc0',x,y,1,1);
  R(g,'#6a6a62',4,13,8,1); R(g,'#6a6a62',4,13,1,8); R(g,'#6a6a62',11,13,1,8); R(g,'#6a6a62',4,20,8,1); });
const tTw8Peg=cl(32,16,'#8a6a42',6,4802,g=>{ for(let y=1;y<16;y+=2) for(let x=1;x<32;x+=2) R(g,'#5a4426',x,y,1,1);
  for(const [x,y,full] of [[2,3,1],[9,3,0],[16,3,1],[23,3,1],[3,10,0],[10,10,1],[18,10,0],[25,10,1]]){ const c=full?'#1a1b1d':'#e8dcc0'; R(g,c,x,y,5,1); R(g,c,x,y,1,3); R(g,c,x+4,y,1,2); R(g,c,x+1,y+2,2,1); } });
/* Novak's card, the photo shot through */
const tTw8ID=tex(12,8,'#e8e4d8',g=>{ R(g,'#1d3a6a',0,0,12,2); R(g,'#b98a62',1,3,3,4); R(g,'#2a1a10',1,3,3,1); R(g,'#7a7468',5,3,6,1); R(g,'#7a7468',5,5,5,1); R(g,'#1a1612',2,4,1,1); R(g,'#1a1612',9,3,1,1); });
const tTw8Mag=tex(4,8,'#1a1b1d',g=>{ R(g,'#c9a23a',1,0,2,1); });
/* the watch floor: the names on the board, the landings on the monitors, the log */
const tTw9Board=tex(40,40,'#e4e6e2',g=>{ R(g,'#8a8e92',0,0,40,1); R(g,'#8a8e92',0,39,40,1); R(g,'#8a8e92',0,0,1,40); R(g,'#8a8e92',39,0,1,40);
  const N_=['DUNNE','REYES','IBARRA','HARRIS','NOVAK','RAY']; N_.forEach((n,k)=>{ const y=3+k*6; text(g,n,3,y,'#1e1c22'); if(k<5) R(g,'#c8302a',2,y+2,textW(n)+2,1); });
  text(g,'915',27,15,'#2a5ac8'); for(const [x,y,w,h] of [[25,13,15,1],[25,21,15,1],[25,13,1,9]]) R(g,'#2a5ac8',x,y,w,h); R(g,'#2a5ac8',24,16,1,1); R(g,'#2a5ac8',23,17,1,1); });
const tTw9CamA=cl(16,12,'#2e322e',18,4901,g=>{ R(g,'#1e221e',0,0,16,2); for(let s=0;s<6;s++) R(g,'#4a4e48',2+s*2,10-s,3,1); R(g,'#5a5e58',12,2,3,8); R(g,'#e8ece8',1,0,4,1); R(g,'#8a8e88',4,7,2,3); });
const tTw9CamB=cl(16,12,'#2a2e2a',18,4902,g=>{ R(g,'#1e221e',0,0,16,2); R(g,'#4a4e48',1,8,14,4); R(g,'#3a3e38',5,3,6,5); R(g,'#e8ece8',1,0,4,1); R(g,'#6a2a24',3,9,5,1); R(g,'#6a2a24',9,10,4,1); });
const tTw9Log=tex(16,16,'#ece6d6',g=>{ for(let y=7;y<16;y+=2) R(g,'#b8c4d0',0,y,16,1); text(g,'2140',0,1,'#1e2a4a'); text(g,'VAN',0,8,'#1e2a4a'); R(g,'#1e2a4a',13,8,1,5); R(g,'#1e2a4a',12,12,3,1); });
const tTw9Map=cl(24,16,'#d8d0b8',8,4903,g=>{ R(g,'#b8ae94',0,7,24,2); R(g,'#b8ae94',11,0,2,16); R(g,'#a8241c',14,3,3,3); R(g,'#1e2a4a',3,10,4,2); });

const mTwBrass=M(null,{color:0xc9a23a}), mTwOlive=M(null,{color:0x4a5236}), mTwRag=M(null,{color:0xa89a82}), mTwBoot=M(null,{color:0x1e1a16}), mTwBlanket=M(tTw7Blanket), mTwNavy=M(null,{color:0x1e2530});

/* a TV on a crate, its own screen (the picture faces the room: ry turns it) */
function twTV(A,x,z,ry,t){ const n=N(floorN,x,0,z,0,ry,0); mk(box(.6,.5,.45,{at:[0,.25,0]}),M(tCrate),n); mk(box(.55,.42,.42),mBlack,n,0,.71,0); mk(plane(.48,.32),M(t,{unlit:true}),n,0,.71,.212);
  const s=Math.abs(Math.sin(ry))>.5; addBox(x-(s?.23:.3),x+(s?.23:.3),z-(s?.3:.23),z+(s?.3:.23),0,.92,'furn'); return n; }
/* a floor lamp with a paper shade; returns its light */
function twLamp(A,x,z,dx=.15,dz=.3){ mk(cyl(.01,.01,1.3,4,{at:[0,.65,0]}),mBlack,floorN,x,0,z); mk(cyl(.12,.07,.16,6),[M(null,{color:0xe8d8a8,unlit:true})],floorN,x,1.35,z); return A.light([x+dx,1.3,z+dz],[1.25,.85,.45],4.4); }
/* a long gun standing in a rack, leaning back into the wall (tilt toward +z by lean), its side to the room */
function twStandGun(build,x,y,z,lean){ const a=N(floorN,x,0,z,lean,0,0),b=N(a,0,0,0,0,Math.PI/2,0),c=N(b,0,y,0,-Math.PI/2,0,0); build(c); return c; }
/* a gun lying on something: flat, along ry */
function twLayGun(build,x,y,z,ry){ const a=N(floorN,x,y,z,0,ry,0),b=N(a,0,0,0,0,0,Math.PI/2); build(b); return b; }
/* a stock room from 68-tower-long.js, centred at cx, its furniture kept off the doorway side */
function twRK(A,kind,cx,side,door){ TW_ROOMKIT[kind](A,cx,side,door>=cx?-1:1); }
/* a pair of boots */
function twBoots(x,z,ry,s=1){ const n=N(floorN,x,0,z,0,ry,0); for(const q of [-1,1]){ mk(box(.11*s,.09,.29*s,{at:[0,.045,0]}),mTwBoot,n,q*.08,0,0); mk(box(.1*s,.16,.12*s,{at:[0,.17,0]}),mTwBoot,n,q*.08,0,-.08*s); } }
/* spent cases round a firing point */
function twBrass(x,z,n,seed,r=.7){ const q=rng(seed); for(let i=0;i<n;i++) mk(cyl(.006,.006,.022,4),mTwBrass,floorN,x+(q()-.5)*r*2,.006,z+(q()-.5)*r*2,Math.PI/2,q()*6,0); }
/* a work lamp on a tripod, head turned toward (tx,tz) */
function twWorkLamp(A,x,z,tx,tz,col=[1.45,1.3,1.0],d=5.5){ for(const s of [0,2.1,4.2]) mk(cyl(.008,.008,1.6,3,{at:[0,.8,0]}),mBlack,floorN,x,0,z,Math.sin(s)*.25,0,Math.cos(s)*.25);
  const ry=Math.atan2(tx-x,tz-z); mk(box(.24,.18,.12),mBlack,floorN,x,1.62,z,0,ry,0); mk(plane(.2,.14),M(null,{color:0xfff2c8,unlit:true}),floorN,x+Math.sin(ry)*.065,1.62,z+Math.cos(ry)*.065,0,ry,0);
  return A.light([x+Math.sin(ry)*1.0,1.5,z+Math.cos(ry)*1.0],col,d); }

/* ---------- the floors ---------- */
TOWER.push(
  /* 07: the crew. The men from the stairs sleep here, where they can hear the flights. Kiki and Wilo watch it on the news.
     Pájaro sorts what came off the team in the dark next to the rifles. Cuervo cleans Reyes's MP5 in the kitchen while
     Doña Lupe makes them pozole. Chucho drew the stairs on a paper bag and crossed out five. Neto walks the floor with a light */
  { n:7,name:'Floor 07',kit:'pistol',wall:'nicotine',floor:'lino',len:16,
    units:[{side:1,x0:-16,x1:-10,door:-12.0,win:true,paper:'peel',fl:'conc'},{side:1,x0:-10,x1:-3.6,door:-4.6,paper:'nicotine',fl:'conc'},{side:1,x0:-3.6,x1:3.0,door:1.8,hole:3.8,paper:'dark',fl:'conc'},
      {side:1,x0:3.0,x1:9.6,door:4.2,win:true,winX:7.6,paper:'tile',fl:'tile'},{side:1,x0:9.6,x1:16,door:12.4,win:true,hole:3.4,paper:'concrete',fl:'conc'},
      {side:-1,x0:-16,x1:-9.4,door:-12.6,win:true,paper:'blue',fl:'oak'},{side:-1,x0:-9.4,x1:-2.8,door:-3.8,win:true,winX:-6.2,paper:'panel',fl:'oak'},{side:-1,x0:-2.8,x1:3.6,door:2.4,win:true,winX:.2,paper:'pink',fl:'rug'},
      {side:-1,x0:3.6,x1:10,door:7.4,hole:3.6,paper:'tile',fl:'tile'},{side:-1,x0:10,x1:16,door:12.8,win:true,hole:3.0,paper:'sage',fl:'check'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-2,'on'); A.tube(4,'dead'); A.tube(10,'dead'); A.tube(14,'dead');
      A.light([-2,2.5,0],[1.0,1.08,1.2],5.8,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* west end: a squat, nobody */
      twRK(A,'squat',-13,1,-12.0);
      /* the bunk room: three mattresses, blankets kicked off, boots by each, the TV on a crate showing the tower */
      for(const [mx,mz,ry] of [[-9.45,2.2,Math.PI/2],[-9.45,4.3,Math.PI/2],[-5.6,5.45,0]]){ A.furn('mattress',mx,mz,ry); }
      A.blk(.8,.04,.6,mTwBlanket,-9.4,.3,2.6,.3); A.blk(.7,.04,.5,mTwBlanket,-5.2,.3,5.4,-.2);
      twBoots(-8.7,1.6,1.4); twBoots(-8.75,3.7,1.7); twBoots(-6.6,4.8,0);
      twTV(A,-7.6,5.5,Math.PI,tTw7News); A.light([-7.6,1.1,4.7],[.5,.62,1.15],4.6,'tv');
      A.blk(.32,.02,.22,M(null,{color:0x8a2a1c}),-6.9,.005,3.4,.4); /* a pizza box */
      /* the gear room, dark: the rack with the team's other two MP5s, the empty slots; a blanket on the floor with the rest laid out */
      { const rx=-1.0,rz=5.82; mk(box(1.6,.06,.12),mWood,floorN,rx,.22,rz); mk(box(1.6,.06,.12),mWood,floorN,rx,.72,rz); for(let k=0;k<5;k++) mk(box(.03,.12,.08),mWood,floorN,rx-.64+k*.32,.67,rz-.02);
        twStandGun(pSMG,rx-.64,.34,5.66,.14); twStandGun(pSMG,rx-.32,.34,5.66,.12); addBox(rx-.8,rx+.8,5.6,5.93,0,.78,'furn'); }
      { const bx=-1.2,bz=3.4; A.blk(1.5,.01,1.0,mTwOlive,bx,.005,bz,.08);
        twBoots(bx-.5,bz-.25,.3,1.2); twBoots(bx-.15,bz-.3,.2,1.0);
        for(const [ox,oz] of [[.2,.2],[.4,-.1],[.55,.25]]) A.blk(.17,.03,.11,M(null,{color:0x4a2e1c}),bx+ox,.025,bz+oz,ox*3); /* wallets, emptied */
        twRadio(bx+.1,.01,bz+.35); for(const [ox,oz] of [[-.4,.3],[-.2,.35]]) A.blk(.16,.08,.12,mTwNavy,bx+ox,.05,bz+oz,.3); /* mag pouches */
        A.pic(tTw7Patch,bx+.62,.012,bz-.3,0,.08,.06,{rx:-Math.PI/2}); A.blk(.24,.05,.1,mBlack,bx+.25,.03,bz-.3,.6); /* a holster */ }
      A.furn('crates',-3.0,2.0,Math.PI/2);
      A.bulb(-.3,3.5,false);
      /* the kitchen: pozole on the stove, Reyes's MP5 in pieces on the table, a rag, the oil */
      A.furn('counter',7.4,5.62,Math.PI); A.furn('fridge',9.0,5.6,Math.PI);
      { const sx=5.6,sz=5.6; twSolid(.6,.88,.6,M(null,{color:0xd8d4c8}),sx,sz); A.blk(.5,.02,.5,mBlack,sx,.89,sz); mk(cyl(.16,.15,.24,8,{at:[0,.12,0]}),M(tSteel),floorN,sx-.08,.9,sz-.05);
        mk(cyl(.06,.06,.01,8),M(null,{color:0x3a6ad0,unlit:true}),floorN,sx+.15,.905,sz+.12); }
      A.furn('table',6.0,3.4,Math.PI/2);
      A.blk(.3,.01,.2,mTwRag,6.1,.775,3.75,.3); A.blk(.04,.12,.04,M(null,{color:0xc9a23a}),5.85,.83,3.9); twLayGun(pPistol,6.2,.79,3.0,1.2);
      for(const [px,pz] of [[5.75,3.0],[6.25,3.85]]){ mk(cyl(.08,.07,.05,8),M(tWhite),floorN,px,.79,pz); mk(cyl(.07,.06,.01,6),M(null,{color:0x8a2a1a}),floorN,px,.81,pz); }
      A.bulb(6.0,3.4,true,true,2.05); A.light([6.0,1.9,3.4],[1.6,1.02,.52],4.8);
      /* east: storage, dark */
      twRK(A,'store',12.8,1,12.4);
      /* south: a dark bedroom */
      twRK(A,'bed',-12.7,-1,-12.6);
      /* Chucho's room: the plan on the wall over the desk, the lamp, an envelope of money, his bed made like a soldier's */
      A.pic(tTw7Plan,-9.4+.08,1.5,-3.7,Math.PI/2,.5,.66);
      A.furn('desk',-8.95,-3.7,Math.PI/2);
      for(let k=0;k<4;k++) A.blk(.16,.03,.08,M(tTwMoney),-8.9,.79+k*.006,-3.4+k*.03,k*.2); A.blk(.22,.02,.12,M(null,{color:0xd8ccb0}),-8.85,.79,-4.05,.3);
      A.furn('bed',-4.6,-5.45,0);
      twLamp(A,-8.8,-5.3,.4,.6);
      /* Quique's room: a bed, a speaker, his school bag; nobody's light */
      twRK(A,'bed',.4,-1,2.4);
      A.blk(.24,.38,.22,mBlack,-2.2,.19,-5.6,0,true); A.blk(.36,.28,.14,M(null,{color:0x3a6a8a}),2.6,.14,-4.2,.4);
      /* the bathroom: the tub with the towels in it, pink; a toilet, a sink */
      { twSolid(1.6,.55,.72,M(null,{color:0xc8c4b8}),8.6,-5.55); mk(box(1.45,.02,.6),M(null,{color:0x6a3a36}),floorN,8.6,.5,-5.55);
        for(const [tx,tz,r] of [[8.2,-5.5,.3],[8.9,-5.6,-.4]]) A.blk(.4,.06,.3,M(null,{color:0xc89a98}),tx,.53,tz,r);
        twSolid(.4,.42,.55,M(null,{color:0xc8c4b8}),4.3,-5.6); twSolid(.5,.2,.4,M(null,{color:0xc8c4b8}),5.6,-5.7,0,.7); }
      /* east: a dark kitchen */
      twRK(A,'kitchen',13,-1,12.8);
      A.tag(4,-6.8,1.45,1); A.tag(6,9.4,1.5,-1); A.tag(1,-13.4,1.4,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Kiki',spots:[[-7.6,3.1,0],[-8.0,2.9,.2]],pose:'watch',extra:'I was told to— I was told—'},
      {kind:'vecino1',hidden:true,look:'any',name:'Wilo',spots:[[-6.5,3.0,-.25],[-6.9,4.0,-.1]],pose:'lean',extra:'I live here! I live here, man—'},
      {kind:'gunman',name:'Pájaro',spots:[[-1.3,2.4,0],[-.3,2.6,-.4]],pose:'lean',extra:'Take it back— take all of it back—'},
      {kind:'gunman',name:'Cuervo',spots:[[5.0,3.5,Math.PI/2]],pose:'lean',extra:'She shot first! She shot first—'},
      {kind:'vecino2',hidden:true,look:'any',name:'Gallo',spots:[[7.0,3.5,-Math.PI/2]],pose:'lean',extra:'I came for the soup— just the soup—'},
      {kind:'gunman',name:'Chucho',spots:[[-8.0,-3.7,-Math.PI/2],[-7.6,-4.4,-Math.PI/2-.3]],pose:'phone',extra:'It was a job— just a job—'},
      {kind:'doorman',name:'Neto',spots:[[16.35,.55,-Math.PI/2]],pose:'idle',extra:'Chucho sent me— Chucho—',
        hunt:{pts:[[12.4,0],[12.4,3.0],[12.4,0],[12.8,0],[12.2,-2.6],[12.8,0],[7.4,0],[7.4,-2.6],[7.4,0],[4.2,0],[4.2,2.4],[4.2,0],[2.4,0],[2.4,-2.6],[2.4,0],[1.8,0],[1.8,2.4],[1.8,0],
          [-3.8,0],[-3.8,-2.6],[-3.8,0],[-4.6,0],[-4.6,2.4],[-4.6,0],[-12.0,0],[-12.0,3.0],[-12.0,0],[-12.6,0],[-12.6,-3.0],[-12.6,0],[-16.35,.5],[0,0],[16.35,.4]],
          calls:['Cop?','Chucho says you\'re dead.','Dead men don\'t walk, cop.','I saw you go down.','Lie back down, cop.','...I can hear you.']}}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Doña Lupe',spots:[[5.6,4.85,0],[7.2,4.9,0]],pose:'idle',extra:'I don\'t know them! I don\'t know their names—'},
      {kind:'estudiante',civ:true,look:'any',name:'Quique',spots:[[-.4,-4.1,Math.PI+.2],[.9,-2.6,Math.PI]],pose:'phone',extra:'I rent here! I just rent here—'}],
    talk:[
      {who:['Kiki','Wilo'],r:3.8,lines:[['Kiki','Channel nine.'],['Wilo','Turn it up.'],['Kiki','"Five officers."'],['Wilo','Five.'],['Kiki','"A sixth unaccounted for."'],['Wilo','Unaccounted.'],
        ['Kiki','Means they can\'t find the body.'],['Wilo','...means they can\'t find him.']]},
      {who:['Pájaro'],r:3.8,lines:[['Pájaro','Boots. Nobody\'s size.'],['Pájaro','The big one had feet like boats.'],['Pájaro','Wallets, empty.'],['Pájaro','Somebody took the ring.'],['Pájaro','...who takes a ring?']]},
      {who:['Gallo','Cuervo','Doña Lupe'],r:3.8,lines:[['Gallo','That the woman\'s?'],['Cuervo','Was.'],['Gallo','She shot at you?'],['Cuervo','Twice. Missed.'],['Gallo','You didn\'t.'],['Cuervo','I didn\'t.'],
        ['Doña Lupe','Eat, boys. It\'s getting cold.'],['Gallo','Pozole on a Tuesday, señora?'],['Doña Lupe','Chucho\'s paying.'],['Gallo','Chucho\'s rich now.']]},
      {who:['Chucho'],r:3.8,lines:[['Chucho','Five. Yes. Five.'],['Chucho','Like I drew it. One flight at a time.'],['Chucho','The last one up went down with the rest.'],['Chucho','Nobody checked him.'],['Chucho','...nobody checked him.'],['Chucho','I\'ll check him.']]},
      {who:['Quique'],r:3.8,lines:[['Quique','Ma, I\'m fine.'],['Quique','I\'m in my room. Door shut.'],['Quique','They\'re loud tonight.'],['Quique','Celebrating something.'],['Quique','...I\'ll come home Sunday.']]}],
    loot:[['smg',5.95,.8,3.35,1.4]],
    clear:['FLOOR 07','The men from the stairs. Eight floors to go.'] },

  /* 08: the range. They knocked three flats into one long room and shoot at plywood men with Novak's card pinned to one.
     Don Saúl fixes the team's shotgun and is making it quiet. Bola and Chepe play cards next to the showers. Tacho loads
     magazines in the dark. Doña Inés won't leave the flat her husband built; her son Rigo won't leave her */
  { n:8,name:'Floor 08',kit:'pistol',wall:'concrete',floor:'lino',len:16,
    units:[{side:1,x0:-16,x1:-1,door:-2.0,paper:'concrete',fl:'conc'},{side:1,x0:-1,x1:6,door:4.8,paper:'panel',fl:'conc'},{side:1,x0:6,x1:11,door:8.0,hole:3.6,paper:'dark',fl:'conc'},
      {side:1,x0:11,x1:16,door:13.4,win:true,hole:3.4,paper:'peel',fl:'conc'},
      {side:-1,x0:-16,x1:-10,door:-12.4,win:true,paper:'cream',fl:'oak'},{side:-1,x0:-10,x1:-4,door:-5.0,win:true,winX:-7.6,paper:'pink',fl:'rug'},{side:-1,x0:-4,x1:2.6,door:1.4,win:true,winX:-1.4,paper:'nicotine',fl:'conc'},
      {side:-1,x0:2.6,x1:9.4,door:6.2,hole:3.6,paper:'tile',fl:'tile'},{side:-1,x0:9.4,x1:16,door:12.0,win:true,hole:3.0,paper:'sage',fl:'check'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-2,'dead'); A.tube(4,'dead'); A.tube(9,'on'); A.tube(14,'dead');
      A.light([9,2.5,0],[1.0,1.08,1.2],5.8,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the range: three plywood men at the west end in front of mattresses stood on end, a plank bench at the east end, tape on the floor, brass */
      for(const [tz,k] of [[2.4,0],[3.6,1],[4.8,2]]){ const tx=-14.6; mk(box(.04,1.0,.04,{at:[0,.5,0]}),mWood,floorN,tx-.05,0,tz-.25); mk(box(.04,1.0,.04,{at:[0,.5,0]}),mWood,floorN,tx-.05,0,tz+.25);
        A.pic(tTw8Target,tx,1.25,tz,Math.PI/2,.55,1.1); if(k===1) A.pic(tTw8ID,tx+.012,1.62,tz,Math.PI/2,.09,.06); }
      for(const [mz,ry] of [[1.9,.05],[3.4,-.04],[4.9,.06]]) A.blk(.22,1.9,1.4,M(tMattress),-15.8,.95,mz,ry,true);
      { const bx=-4.6,bz=3.5; mk(box(.5,.05,1.9),M(tWoodLight),floorN,bx,.9,bz); for(const s of [-1,1]){ mk(box(.4,.88,.05,{at:[0,.44,0]}),mWood,floorN,bx,0,bz+s*.8); } addBox(bx-.25,bx+.25,bz-.95,bz+.95,0,.92,'furn');
        for(let k=0;k<6;k++) A.blk(.03,.12,.05,M(tTw8Mag),bx-.05,.98,bz-.6+k*.12,.1); for(const s of [-1,1]) A.blk(.12,.06,.08,M(null,{color:0xd8c030}),bx+.1,.95,bz+s*.5); /* ear defenders */
        mk(box(.03,.002,3.6),M(null,{color:0xc9a23a}),floorN,-4.2,.003,3.5); twBrass(-3.7,3.0,22,4810,.8); twBrass(-3.6,4.2,16,4811,.6); }
      twWorkLamp(A,-9.2,5.5,-14.6,3.6,[1.5,1.35,1.05],7.0);
      /* the armory: a bench along the back wall under a pegboard, the vice, ammo cans; the shotgun on the bench with the tube for it */
      { const bx=2.4,bz=5.5; twSolid(2.4,.9,.7,M(tWoodLight),bx,bz); A.pic(tTw8Peg,bx,1.6,5.93,Math.PI,2.2,1.05);
        A.blk(.16,.14,.12,M(tSteel),bx-.9,.97,bz,.1); /* the vice */
        for(const [cx,cz,cy] of [[-.55,5.6,.15],[-.55,5.2,.15],[-.55,5.4,.45]]) A.blk(.3,.3,.18,mTwOlive,cx,cy,cz,0,cy<.3);
        for(let k=0;k<5;k++) A.blk(.03,.12,.05,M(tTw8Mag),bx+.65+k*.07,.96,bz-.15,.1);
        twLowBulb(bx,1.95,5.1); A.light([bx,1.8,4.8],[1.6,1.3,.82],4.4); }
      A.furn('filing',5.4,5.6,Math.PI); A.furn('crates',-.3,2.2,Math.PI/2);
      /* the magazine room, dark: a table of them, open ammo cans */
      A.furn('table',8.4,3.7,0); for(let k=0;k<10;k++) A.blk(.03,.12,.05,M(tTw8Mag),8.0+(k%5)*.18,.83,3.55+Math.floor(k/5)*.25,k*.3);
      for(const [cx,cz] of [[7.0,5.5],[7.4,5.55]]) A.blk(.3,.3,.18,mTwOlive,cx,.15,cz,.1,true); A.bulb(8.4,3.7,false);
      /* east: storage, dark */
      twRK(A,'store',13.0,1,13.4);
      /* south: a dark bedroom */
      twRK(A,'bed',-13,-1,-12.4);
      /* Doña Inés: her husband's flat, the couch, the altar on its table with the candles going, the Virgin over it */
      A.furn('couch',-6.2,-5.5,0); A.furn('table',-9.2,-4.4,Math.PI/2);
      A.pic(tTwVirgin,-10+.08,1.45,-4.4,Math.PI/2,.32,.48);
      for(const [cx,cz] of [[-9.25,-4.15],[-9.1,-4.6],[-9.3,-4.75]]) A.blk(.05,.11,.05,M(tTwCandle),cx,.83,cz);
      A.light([-8.9,1.1,-4.4],[1.45,.82,.36],4.2,'candle');
      A.pic(tTwPhotoMom,-5.4,1.5,-5.926,0,.15,.2);
      /* the dorm: mattresses round a card table under one bulb, two shotguns against the wall */
      A.furn('mattress',-3.0,-5.45,0); A.furn('mattress',1.6,-5.45,0);
      A.furn('table',-1.4,-3.6,0); for(let k=0;k<5;k++) A.blk(.04,.002,.06,M(tTwCards),-1.6+k*.09,.775,-3.55+(k%2)*.1,k*.4); A.blk(.1,.025,.05,M(tTwMoney),-1.2,.78,-3.6,.3);
      twStandGun(pShotgun,-.8,.33,-5.78,-.1); twStandGun(pShotgun,-.55,.33,-5.78,-.12);
      A.bulb(-1.4,-3.6,true,true,2.0); A.light([-1.4,1.85,-3.6],[1.55,1.0,.5],4.6);
      /* the showers, dark: three stalls, the drain */
      for(let k=0;k<3;k++){ const sx=4.0+k*1.3; mk(box(.06,1.9,1.0,{at:[0,.95,0]}),M(null,{color:0xb8b8ae}),floorN,sx+.6,0,-5.45); addBox(sx+.57,sx+.63,-5.95,-4.95,0,1.9,'furn'); mk(cyl(.04,.04,.04,6),M(tSteel),floorN,sx,2.0,-5.8,Math.PI/2,0,0); }
      mk(cyl(.06,.06,.005,8),mBlack,floorN,5.3,.004,-4.2);
      /* east: a dark living room */
      twRK(A,'living',12.7,-1,12.0);
      A.tag(3,-8.0,1.45,1); A.tag(7,6.0,1.5,-1); A.tag(2,13.0,1.4,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Lucho',spots:[[-3.75,2.8,-Math.PI/2],[-3.5,2.5,-Math.PI/2+.2]],pose:'watch',extra:'I teach them, that\'s all— I teach—'},
      {kind:'gunman',name:'Chamaco',spots:[[-3.75,4.1,-Math.PI/2],[-3.5,4.4,-Math.PI/2-.2]],pose:'lean',extra:'I\'m new— I\'m new, please—'},
      {kind:'enforcer',name:'Don Saúl',spots:[[2.4,4.65,0],[1.8,4.7,.2]],pose:'lean',extra:'I fix guns. I only fix them—'},
      {kind:'vecino3',hidden:true,look:'any',name:'Tacho',spots:[[8.5,2.5,0],[8.0,2.5,.3]],pose:'lean',extra:'I fix phones! I just fix phones—'},
      {kind:'doorman',name:'Bola',spots:[[-1.5,-2.5,Math.PI]],pose:'watch',extra:'Cards, man, we were playing cards—'},
      {kind:'doorman',name:'Chepe',spots:[[-1.5,-5.0,0]],pose:'watch',extra:'Wasn\'t me on the stairs— wasn\'t me—'}],
    civ:[{kind:'abuela',civ:true,fem:true,old:true,name:'Doña Inés',spots:[[-8.0,-4.5,-Math.PI/2],[-8.0,-4.0,-Math.PI/2-.3]],pose:'idle',extra:'This is my home! Forty years—'},
      {kind:'obrero',civ:true,look:'any',name:'Rigo',spots:[[-6.2,-3.0,Math.PI],[-5.0,-4.2,Math.PI-.4]],pose:'lean',extra:'I\'m her son! I\'m just her son—'}],
    talk:[
      {who:['Lucho','Chamaco'],r:3.8,lines:[['Lucho','Breathe out. Squeeze.'],['Chamaco','Like the stairs?'],['Lucho','The stairs was easy.'],['Lucho','They came up in a line.'],
        ['Chamaco','Who pinned the card on?'],['Lucho','Chucho. For practice.'],['Chamaco','He looks young.'],['Lucho','He was. Squeeze.']]},
      {who:['Don Saúl'],r:3.8,lines:[['Don Saúl','The big one carried this.'],['Don Saúl','Never cleaned it once.'],['Don Saúl','Cops.'],['Don Saúl','Chucho wants it quiet.'],['Don Saúl','So I make it quiet.'],['Don Saúl','Guns don\'t care who.']]},
      {who:['Bola','Chepe'],r:3.8,lines:[['Bola','Your deal.'],['Chepe','The kid\'s on the range again.'],['Bola','Kid can\'t hit a wall.'],['Chepe','He hit one on the stairs.'],['Bola','Lying down. Doesn\'t count.'],['Chepe','...counted to the cop.']]},
      {who:['Tacho'],r:3.8,lines:[['Tacho','Twenty-nine. Thirty.'],['Tacho','Every mag full, Chucho says.'],['Tacho','For one cop?'],['Tacho','One cop. Every mag.'],['Tacho','...he\'s scared.']]},
      {who:['Doña Inés','Rigo'],r:3.8,lines:[['Doña Inés','Bang, bang, bang. All night.'],['Rigo','Don\'t open the door, Ma.'],['Doña Inés','Forty years in this flat.'],['Rigo','I know, Ma.'],['Doña Inés','Your father built that wall.'],['Rigo','...they\'ll knock that one down too.']]}],
    loot:[['shotgun',1.9,.95,5.4,Math.PI/2],['bigcan',3.0,.95,5.35,Math.PI/2]],
    clear:['FLOOR 08','Seven floors to go.'] },

  /* 09: the watch floor. They watch the street from Doña Mercedes's bedroom window and the back alley from the next one.
     The radio room listens to the police and shows the landings; the team's names are on the board, written before they came.
     El Tuerto takes a call in English he answers in Spanish. Lagarto keeps the stairs up */
  { n:9,name:'Floor 09',kit:'pistol',wall:'cream',floor:'lino',len:16,
    units:[{side:1,x0:-16,x1:-9.6,door:-12.0,win:true,paper:'blue',fl:'oak'},{side:1,x0:-9.6,x1:-2.4,door:-3.4,win:true,winX:-6.0,paper:'cream',fl:'oak'},{side:1,x0:-2.4,x1:4.4,door:3.4,hole:3.6,paper:'dark',fl:'conc'},
      {side:1,x0:4.4,x1:10.6,door:8.4,win:true,winX:7.4,paper:'tile',fl:'tile'},{side:1,x0:10.6,x1:16,door:13.0,win:true,hole:3.4,paper:'concrete',fl:'conc'},
      {side:-1,x0:-16,x1:-10,door:-12.6,win:true,paper:'peel',fl:'conc'},{side:-1,x0:-10,x1:-3.2,door:-4.4,win:true,winX:-6.6,paper:'nicotine',fl:'conc'},{side:-1,x0:-3.2,x1:3.4,door:-1.8,win:true,winX:1.2,paper:'pink',fl:'rug'},
      {side:-1,x0:3.4,x1:10,door:5.0,win:true,winX:8.0,paper:'panel',fl:'oak'},{side:-1,x0:10,x1:16,door:12.6,hole:3.0,paper:'sage',fl:'check'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'on'); A.tube(-2,'dead'); A.tube(4,'dead'); A.tube(10,'dead'); A.tube(14,'dead');
      A.light([-8,2.5,0],[1.0,1.08,1.2],5.6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      twRK(A,'bed',-12.8,1,-12.0);
      /* the street watch: a chair at the window, binoculars on the sill, a thermos, the log. The team's trucks still flashing below */
      { A.blk(.42,.45,.42,M(tWood),-5.3,.225,4.4,.3,true); A.blk(.4,.5,.06,M(tWood),-5.36,.7,4.2,.3);
        A.blk(.16,.06,.1,mBlack,-6.3,.94,5.86,.3); for(const s of [-1,1]) mk(cyl(.025,.025,.08,6),mBlack,floorN,-6.3+s*.03,.97,5.82,Math.PI/2,0,0);
        A.furn('table',-8.4,4.6,Math.PI/2); mk(cyl(.045,.045,.26,8,{at:[0,.13,0]}),M(null,{color:0x3a5a8a}),floorN,-8.5,.77,4.3);
        A.pic(tTw9Log,-8.35,.776,4.8,.3,.16,.16,{rx:-Math.PI/2}); A.blk(.12,.01,.008,M(null,{color:0x1e2a4a}),-8.2,.78,4.95,.6);
        A.furn('bed',-4.0,4.45,Math.PI); /* Mercedes and Fermín's bed: they watch from it */
        A.light([-6.0,1.5,5.4],[1,1,1],5.0,'police'); }
      /* the radio room: scanners, a stack of monitors showing the landings, the board with the names */
      { const tx=.6,tz=5.5; twSolid(2.4,.78,.7,M(tWoodLight),tx,tz);
        twRadio(tx-.9,.78,tz); twRadio(tx-.75,.78,tz+.1); for(const [sx,c] of [[tx-.3,0x7ad07a],[tx+.15,0xe8a24a]]){ A.blk(.3,.1,.22,mBlack,sx,.83,tz); A.blk(.1,.03,.004,M(null,{color:c,unlit:true}),sx,.85,tz-.112); }
        A.blk(1.0,.6,.36,mBlack,tx+.7,1.08,tz+.05); for(const [mx,my,t] of [[tx+.46,1.22,tTw9CamA],[tx+.94,1.22,tTw9CamB],[tx+.46,.93,tTw9CamB],[tx+.94,.93,tTw9CamA]]) A.pic(t,mx,my,tz-.135,Math.PI,.42,.27,{unlit:true,color:0xb8c8b8});
        A.light([tx+.7,1.3,tz-.8],[.5,.66,.88],4.4,'tv');
        A.pic(tTw9Board,4.4-.08,1.5,3.2,-Math.PI/2,1.1,1.1); A.pic(tTw9Map,4.4-.08,1.55,4.8,-Math.PI/2,.7,.46); }
      A.furn('crates',-1.6,2.0,0);
      /* Doña Mercedes's kitchen: coffee on, cups everywhere */
      A.furn('counter',6.2,5.62,Math.PI); A.furn('fridge',4.85,5.6,Math.PI); A.furn('table',8.6,3.6,0);
      for(const [cx,cz] of [[8.3,3.45],[8.75,3.7],[8.95,3.4],[8.5,3.85]]) mk(cyl(.035,.03,.08,6,{at:[0,.04,0]}),M(tWhite),floorN,cx,.77,cz);
      mk(cyl(.07,.08,.18,8,{at:[0,.09,0]}),M(tSteel),floorN,6.6,.92,5.55);
      A.bulb(7.4,4.0,true,true,2.1); A.light([7.4,1.95,4.0],[1.55,1.02,.52],4.7);
      twRK(A,'store',13.0,1,13.0);
      /* south: a squat, dark */
      twRK(A,'squat',-13,-1,-12.6);
      /* the back watch, dark: a stool at the window over the alley, cigarette butts on the sill */
      { A.blk(.34,.6,.34,M(tWood),-7.4,.3,-5.3,.2,true); for(let k=0;k<6;k++) A.blk(.03,.01,.01,M(null,{color:0xd8d4c8}),-6.8+k*.07,.89,-5.88,k);
        A.furn('mattress',-9.0,-3.0,Math.PI/2); A.furn('trash',-3.9,-5.45,0); }
      /* the back bedroom they put the old couple in: a bed, the curtain drawn, a grandchild on the wall */
      twRK(A,'bed',0,-1,-1.8);
      A.pic(tTwPhotoKid,-2.9,1.45,-5.926,0,.15,.2);
      /* El Tuerto's room: the lamp, the desk, a second phone, a bag of money he hasn't counted */
      A.furn('desk',7.6,-5.4,0); A.furn('wardrobe',4.4,-5.65,0);
      A.blk(.6,.3,.34,M(tTw5Duffel),9.3,.15,-3.2,.3,true); A.blk(.05,.01,.1,mBlack,7.3,.785,-5.3,.4);
      twLamp(A,9.2,-5.4,-.4,.6);
      twRK(A,'living',13.3,-1,12.6);
      A.tag(5,-5.0,1.45,-1); A.tag(0,10.4,1.5,1); A.tag(4,-14.0,1.4,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Ojitos',spots:[[-6.0,5.0,0],[-6.5,5.0,.25]],pose:'watch',extra:'I just look out the window— I just look—'},
      {kind:'gunman',name:'Pato',spots:[[1.5,4.5,0],[.5,4.5,.15]],pose:'watch',extra:'I listen to the radio, that\'s all—'},
      {kind:'vecino4',hidden:true,look:'any',name:'Güicho',spots:[[3.5,2.9,Math.PI/2],[3.4,4.2,Math.PI/2+.3]],pose:'lean',extra:'I sweep the halls, man— I sweep—'},
      {kind:'gunman',name:'Chivo',spots:[[-6.6,-5.2,Math.PI],[-6.2,-5.15,Math.PI-.25]],pose:'watch',extra:'I watch the back— nobody comes—'},
      {kind:'enforcer',name:'El Tuerto',spots:[[7.6,-4.6,Math.PI],[8.3,-4.3,Math.PI+.4]],pose:'phone',extra:'The gringo— ask the gringo—'},
      {kind:'doorman',name:'Lagarto',spots:[[14.6,-.35,-Math.PI/2],[13.2,.4,-Math.PI/2]],pose:'watch',extra:'I keep the stairs— that\'s all I do—'}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Doña Mercedes',spots:[[6.6,4.9,0],[5.6,4.95,0]],pose:'idle',extra:'It\'s my kitchen! They use my kitchen—'},
      {kind:'abuelo',civ:true,old:true,name:'Don Fermín',spots:[[1.4,-3.2,Math.PI],[-1.3,-2.6,Math.PI+.3]],pose:'idle',extra:'I\'m old— I\'m old, son—'}],
    talk:[
      {who:['Ojitos'],r:3.8,lines:[['Ojitos','Nine-forty. The van.'],['Ojitos','Six got out. I counted.'],['Ojitos','Called it up, like he said.'],['Ojitos','Their trucks are still flashing.'],['Ojitos','Four hours.'],['Ojitos','Nobody\'s come for them.']]},
      {who:['Pato','Güicho'],r:3.8,lines:[['Pato','Scanner\'s quiet.'],['Güicho','Five dead cops and it\'s quiet?'],['Pato','Somebody told them stand down.'],['Güicho','Who tells cops that?'],['Pato','Same one who sent the names.'],['Güicho','...the gringo.'],['Pato','Don\'t write that up there.']]},
      {who:['Chivo'],r:3.8,lines:[['Chivo','Back\'s clear.'],['Chivo','Back\'s always clear.'],['Chivo','Who comes in the back?'],['Chivo','...the sixth would.']]},
      {who:['El Tuerto'],r:3.8,lines:[['El Tuerto','Yes, sir.'],['El Tuerto','Five. The names matched.'],['El Tuerto','The sixth is on the stairs, sir.'],['El Tuerto','Dead on the stairs. Yes.'],['El Tuerto','Your Spanish is very good, sir.'],['El Tuerto','...he hung up.']]},
      {who:['Doña Mercedes'],r:3.8,lines:[['Doña Mercedes','More coffee. Always more coffee.'],['Doña Mercedes','In my own kitchen.'],['Doña Mercedes','They watch the street from my bed.'],['Doña Mercedes','Fermín says don\'t look.'],['Doña Mercedes','I looked.']]},
      {who:['Don Fermín'],r:3.8,lines:[['Don Fermín','Mercedes? Mercedes.'],['Don Fermín','Leave the curtain.'],['Don Fermín','Don\'t look at the trucks.'],['Don Fermín','They see you looking.']]},
      {who:['Lagarto'],r:3.8,lines:[['Lagarto','Nobody up. Nobody down.'],['Lagarto','Tuerto\'s orders.'],['Lagarto','Chucho\'s not answering.'],['Lagarto','...Chucho always answers.']]}],
    loot:[],
    clear:['FLOOR 09','They had your names before you came in. Six floors to go.'] }
);
