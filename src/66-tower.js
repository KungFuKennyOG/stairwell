/* =====================================================================
   THE TOWER, the campaign. The prologue in the lobby, then hand-built floors one at a time up the stairs.
   Every floor is small and dark with a few men on it, each caught in the middle of something, and what
   he cares about is in the room with him. You hear them before they know you're there.
   Same skeleton as the generated floors (30-floor.js): 26 x 12 m, a corridor down the middle, apartments
   both sides, in on the west landing, up on the east one. Party walls can have a hole: the quiet way round.
   ===================================================================== */

/* ---------- the details: small painted things, read at arm's length ---------- */
const tTwPhotoKid=tex(12,16,'#ece6d6',g=>{ R(g,'#7d9ab0',1,1,10,10); R(g,'#3a2418',4,2,4,2); R(g,'#c9945a',4,3,4,3); R(g,'#2a1a10',5,4,1,1); R(g,'#2a1a10',7,4,1,1); R(g,'#e05a7a',3,6,6,5); R(g,'#c9945a',2,7,1,2); R(g,'#c9945a',9,7,1,2); R(g,'#4f6e3e',1,10,10,1); });
const tTwDrawing=tex(16,16,'#f4f0e4',g=>{ R(g,'#f2c230',1,1,3,3); R(g,'#d8362e',7,6,6,5); R(g,'#d8362e',6,5,8,1); R(g,'#3a6ad0',9,8,2,3); R(g,'#2a2a2a',3,9,1,4); R(g,'#2a2a2a',2,10,3,1); R(g,'#e05a7a',4,8,1,1); R(g,'#3aa040',0,13,16,1); text(g,'PAPI',1,14,'#3a6ad0'); });
const tTwPhotoMom=tex(12,16,'#5a3a22',g=>{ R(g,'#d8d0bc',1,1,10,14); R(g,'#8a8a86',3,2,6,3); R(g,'#b98a62',3,4,6,5); R(g,'#2a1a10',4,6,1,1); R(g,'#2a1a10',7,6,1,1); R(g,'#3a4a6a',2,9,8,6); R(g,'#e8e2cf',5,10,2,1); });
const tTwPoster=tex(24,36,'#c9a23a',g=>{ R(g,'#1a1a1a',1,1,22,34); R(g,'#a8241c',1,1,22,8); text(g,'FELIX',2,2,'#f2ede2'); R(g,'#7a6a5a',7,11,10,12); R(g,'#c9945a',9,12,6,5); R(g,'#a8241c',7,18,4,4); R(g,'#a8241c',13,18,4,4); text(g,'MANOS',2,25,'#f2c230'); text(g,'11-1',4,31,'#f2ede2'); });
const tTwBoxes=cl(16,16,'#a07a4a',14,881,g=>{ R(g,'#8a6638',0,7,16,2); R(g,'#c9b48a',3,2,10,1); text(g,'SAMI',0,10,'#2a2a2a'); });
const tTwBoxPlain=cl(16,16,'#a07a4a',14,882,g=>{ R(g,'#8a6638',0,7,16,2); text(g,'KIT',2,10,'#2a2a2a'); });
const tTwMoney=tex(8,4,'#5f7a4a',g=>{ R(g,'#7a9a5e',1,1,6,2); R(g,'#e8e2cf',3,1,2,2); });
const tTwLedger=tex(16,12,'#2a2420',g=>{ R(g,'#e8e2cf',1,1,14,10); for(let y=2;y<10;y+=2) R(g,'#7a7468',2,y,12,1); R(g,'#a8241c',8,1,1,10); });
const tTwCards=tex(4,6,'#f2ede2',g=>{ R(g,'#a8241c',1,1,2,2); });
const tTwVirgin=tex(16,24,'#c9a23a',g=>{ R(g,'#1d3a6a',1,1,14,22); R(g,'#e8a24a',4,2,8,8); R(g,'#2a6aa0',5,4,6,16); R(g,'#c9945a',7,5,2,3); R(g,'#e8e2cf',6,9,4,1); R(g,'#d8362e',6,19,4,3); });
const tTwMail=tex(32,16,'#5a5e62',g=>{ for(let y=1;y<16;y+=5) for(let x=1;x<32;x+=4){ R(g,'#7a7e82',x,y,3,4); R(g,'#2a2d30',x+1,y+1,1,1); } });
const tTwLift=tex(32,32,'#6a7076',g=>{ R(g,'#3a3e42',15,0,2,32); R(g,'#4a4e52',0,0,32,2); R(g,'#e8e2cf',2,12,28,7); text(g,'OUT OF',4,13,'#a8241c'); R(g,'#e8e2cf',2,19,28,6); text(g,'ORDER',6,19,'#a8241c'); });
const tTwStreet=tex(32,32,'#0a0c10',g=>{ R(g,'#1a1c20',0,0,32,32); R(g,'#3a3226',1,1,14,30); R(g,'#3a3226',17,1,14,30); R(g,'#c98a3a',4,14,6,3); R(g,'#e8a24a',22,8,3,2); R(g,'#7a5a2a',0,26,32,6); R(g,'#2a2d30',15,0,2,32); R(g,'#8a8478',13,15,1,4); R(g,'#8a8478',18,15,1,4); });
const tTwRice=tex(8,8,'#ece6d6',g=>{ R(g,'#f6f2e8',2,2,4,3); R(g,'#a8241c',5,4,2,2); R(g,'#c9a23a',2,5,2,1); });
const tTwBrick=tex(8,8,'#ece8de',g=>{ R(g,'#c9c2b0',0,3,8,1); R(g,'#c9a23a',3,0,2,8); });
const tTwCandle=tex(4,8,'#d8362e',g=>{ R(g,'#e8a24a',1,1,2,2); R(g,'#f2c230',1,4,2,3); });
const tTwHeavy=cl(16,32,'#6a2a1e',16,883,g=>{ R(g,'#4a1a12',0,0,16,3); R(g,'#4a1a12',0,29,16,3); R(g,'#8a3a2a',6,8,4,14); });
const tTwGlove=tex(4,4,'#b8241c',g=>R(g,'#e8e2cf',0,3,4,1));
const tTwBadge=tex(8,10,'#c9a23a',g=>{ R(g,'#e8c860',2,1,4,3); R(g,'#8a6a1a',3,5,2,3); R(g,'#1d2a4a',2,4,4,1); });
const tTwVest=tex(32,24,'#1e2530',g=>{ for(const x of [3,12,21]) R(g,'#161c26',x,3,7,6); R(g,'#0e1218',0,11,32,1); R(g,'#e8e2cf',4,14,24,7); text(g,'POLICE',4,15,'#1e2530'); });

/* the team's things, where the men who killed them left them */
const mNavy=M(null,{color:0x1e2530});
function twWatch(x,y,z){ mk(box(.026,.008,.17),mBlack,floorN,x,y+.004,z,0,.4,0); mk(cyl(.021,.021,.012,8),[mSteel,M(null,{color:0xd8d4c8}),mSteel],floorN,x,y+.012,z); }
function twVest(x,y,z,ry){ mk(box(.48,.07,.4),F(mNavy,mNavy,mNavy,M(tTwVest)),floorN,x,y,z,0,ry,0); }
function twRadio(x,y,z){ const n=N(floorN,x,y,z,0,.5,0); mk(box(.06,.13,.035,{at:[0,.065,0]}),mBlack,n); mk(cyl(.006,.006,.12,4,{at:[0,.19,0]}),mBlack,n,.018,0,0); mk(box(.03,.02,.005),M(null,{color:0x7ad07a,unlit:true}),n,0,.1,.019); }
function twHelmet(x,z,ry){ const n=N(floorN,x,0,z,0,ry,0); mk(cyl(.105,.15,.12,8,{at:[0,.06,0]}),[mNavy,mNavy,mNavy],n); mk(cyl(.06,.105,.05,8,{at:[0,.145,0]}),[mNavy,mNavy,mNavy],n); mk(box(.2,.025,.012),mBlack,n,0,.07,.15); }

/* ---------- walls, the way the generated floors do them: chunks of ~1.5 m, every chunk a collision box ---------- */
function twWall(list,axis,c,s0,s1,gaps){
  gaps=gaps.slice().sort((a,b)=>a.s-b.s); let s=s0; const H_=RH,T=.14;
  const seg=(a,b,y0,y1)=>{ const len=b-a; if(len<=.01) return; const nC=Math.max(1,Math.ceil(len/1.5)); for(let q=0;q<nC;q++){ const a2=a+len*q/nC,b2=a+len*(q+1)/nC,m=(a2+b2)/2,l=b2-a2;
      if(axis==='x') list.push([m,(y0+y1)/2,c,l,y1-y0,T,l/1.5,(y1-y0)/2.8]); else list.push([c,(y0+y1)/2,m,T,y1-y0,l,l/1.5,(y1-y0)/2.8]); } };
  for(const gp of gaps){ const a=gp.s-gp.w/2,b=gp.s+gp.w/2; seg(s,a,0,H_); if(gp.y0>0) seg(a,b,0,gp.y0); seg(a,b,gp.y1,H_); s=b; }
  seg(s,s1,0,H_); }

/* the building kit a floor's build(A) gets */
function twKit(G,furn,seats,beds,lights,anim){
  const A={
    furn(kind,x,z,ry=0){ const node=N(G,x,0,z,0,ry,0),info=FURN[kind](node); let [w,d]=info.size; if(Math.abs(Math.sin(ry))>.5) [w,d]=[d,w];
      addBox(x-w/2,x+w/2,z-d/2,z+d/2,0,FURN_H[kind]||.8,'furn'); const rec={kind,node,x,z,info}; furn.push(rec); if(info.seat) seats.push(rec); if(info.bed) beds.push(rec); return rec; },
    /* a flat picture: faces +z turned by ry */
    pic(t,x,y,z,ry,w,h,o={}){ return mk(plane(w,h),M(t,Object.assign({double:false},o)),G,x,y,z,o.rx||0,ry,o.rz||0); },
    /* a small solid thing: optional collision when it's big enough to walk into */
    blk(w,h,d,mat,x,y,z,ry=0,solid=false){ const n=mk(box(w,h,d),mat,G,x,y,z,0,ry,0); if(solid){ const s=Math.abs(Math.sin(ry))>.5,ww=s?d:w,dd=s?w:d; addBox(x-ww/2,x+ww/2,z-dd/2,z+dd/2,y-h/2,y+h/2,'furn'); } return n; },
    /* a bare bulb on a wire. lit: it's one of the floor's lights */
    bulb(x,z,lit,warm=true,y=2.32){ mk(cyl(.004,.004,RH-y-.05,3),mBlack,G,x,(RH+y)/2+.02,z); mk(box(.08,.1,.08),lit?M(warm?tBulb:tFluo,{unlit:true}):M(tBulbDead),G,x,y,z); },
    light(p,c,d,kind){ lights.push([p,c,d]); if(kind) anim.push({i:lights.length-1,kind,t0:Math.random()*9}); return lights.length-1; },
    tube(x,state){ const m=state==='dead'?M(tFluoDead):M(tFluo,{unlit:true}); const n=mk(box(1.2,.05,.2),m,G,x,2.75,0); n.live=true; /* flickers or gets shot out: never merged */ return {n,m}; },
    tag(i,x,y,side){ mk(plane(1.6,.4),M(TAGS[i],{cut:true}),G,x,y,side*.925,0,side>0?Math.PI:0,0); },
    /* a framed picture leaning on a sill or a shelf */
    frame(t,x,y,z,ry){ const n=N(G,x,y,z,-.18,ry,0); mk(box(.11,.14,.012),mWood,n,0,.07,0); mk(plane(.085,.11),M(t),n,0,.07,.0065); return n; },
    candle(x,y,z){ mk(cyl(.025,.025,.11,6,{at:[0,.055,0]}),[M(tTwCandle),M(null,{color:0xf2c230,unlit:true}),M(tTwCandle)],G,x,y,z); }
  }; return A; }

/* ---------- the floors ----------
   units: one row each side, west to east, covering x -10..10. side +1 is north (z 1..6), -1 south.
   door: x of the doorway on the corridor wall. win: a window in the outside wall. hole: a hole in the party wall on this
   unit's WEST side, at that depth (m from the corridor centre). cast: who's here; spots are alternatives, picked at random.
   talk: what you overhear, in order, looping, while you're near and they don't know you're there. */
const TW_MAKERS={corner:makeCorner,cutter:makeCutter,gunman:makeGunman,doorman:makeDoorman,enforcer:makeEnforcer,landlord:makeLandlord};
const TOWER=[
  { n:0,name:'Lobby',pro:true,wall:'dark',
    units:[{side:1,x0:-10,x1:-4,door:-5.0},{side:1,x0:-4,x1:3,door:0},{side:1,x0:3,x1:10,door:5},{side:-1,x0:-10,x1:-2,door:-3.5},{side:-1,x0:-2,x1:10,door:2.0}],
    amb:[.13,.125,.15],
    build(A){ const t0=A.tube(-2.5,'on'),t1=A.tube(4,'on'); A.tube(-7,'dead'); A.tube(8,'dead');
      FLOOR.proTubes=[t0,t1];
      A.light([-2.5,2.5,0],[1.1,1.2,1.32],6.5,'flick');
      A.light([-11.8,2.0,0],[1.0,.66,.34],5.5);
      A.light([4,2.5,0],[.92,.98,1.06],6);
      A.light([11.5,2.35,0],[1.2,.9,.55],4.5);
      A.light([-8.2,2.45,.8],[0,0,0],5.5); /* the emergency lamp: off until you wake up */
      mk(box(.3,.12,.08),M(null,{color:0x3a1010}),floorN,-8.2,2.6,.93);
      /* the way in from the street: glass doors, the street glowing orange outside */
      A.pic(tTwStreet,-12.92,1.15,0,Math.PI/2,1.9,2.2,{unlit:true,color:0x9a9a9a});
      A.pic(tTwMail,-8.2,1.35,.925,Math.PI,1.6,.8); A.pic(tTwLift,-6.4,1.1,-.925,0,1.2,2.1);
      A.tag(1,3.5,1.45,1); A.tag(4,6.6,1.5,-1);
      A.furn('desk',-7.2,3.8,Math.PI); A.furn('filing',-9.4,5.5,Math.PI); A.furn('crates',6.5,4.8,Math.PI); A.furn('trash',-5.0,-4.6,0); A.furn('wardrobe',-8.5,-5.6,0); A.furn('crates',6.0,-5.2,0);
      for(const [x,z] of [[-7.2,3.6],[0,3.5],[6.5,3.5],[-6,-3.5],[4,-3.5]]) A.bulb(x,z,false); },
    team:[{id:'dunne',name:'Dunne',x:-3.2,z:.35,hd:Math.PI/2},{id:'harris',name:'Harris',x:-2.4,z:-.45,hd:Math.PI/2},{id:'reyes',name:'Reyes',x:-4.1,z:-.42,hd:Math.PI/2},
      {id:'ibarra',name:'Ibarra',x:-4.9,z:.45,hd:Math.PI/2},{id:'novak',name:'Novak',x:-8.4,z:.5,hd:-Math.PI/2}] },

  { n:1,name:'Floor 01',kit:'pistol',wall:'peel',floor:'lino',
    units:[{side:1,x0:-10,x1:-5.4,door:-6.3,win:true,paper:'tile',fl:'tile'},{side:1,x0:-5.4,x1:-.6,door:-3.0,win:true,paper:'peel',fl:'conc'},{side:1,x0:-.6,x1:4.6,door:.4,win:true,winX:2.0,hole:4.2,paper:'nicotine'},{side:1,x0:4.6,x1:10,door:7.2,win:true,paper:'concrete',fl:'conc'},
      {side:-1,x0:-10,x1:-4.2,door:-7.0,win:true,paper:'pink',fl:'rug'},{side:-1,x0:-4.2,x1:3.4,door:2.4,win:true,winX:-.4,paper:'sage',fl:'check'},{side:-1,x0:3.4,x1:10,door:6.0,win:true,hole:3.2,paper:'tile',fl:'tile'}],
    build(A){ A.tube(-8,'dead'); A.tube(-3.5,'on'); A.tube(1,'dead'); A.tube(5,'dead'); A.tube(8.5,'dead');
      A.light([-3.5,2.5,0],[1.05,1.15,1.28],6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* Dani's kitchen: a bulb over the counter, rice on a plate, a knife beside it. His daughter on the fridge */
      A.furn('counter',-7.9,5.62,Math.PI); A.furn('fridge',-9.5,5.6,Math.PI); A.furn('table',-8.5,2.55,Math.PI/2); A.furn('trash',-5.95,5.5,0);
      A.bulb(-7.7,4.6,true); A.light([-7.7,2.25,4.6],[1.55,.9,.42],5.2);
      A.blk(.26,.02,.26,M(tTwRice),-7.85,.935,5.55); A.blk(.22,.06,.22,M(tWhite),-8.35,.95,5.55);
      A.pic(tTwPhotoKid,-9.62,1.18,5.244,Math.PI,.12,.16); A.pic(tTwDrawing,-9.38,1.42,5.244,Math.PI,.22,.22);
      twWatch(-8.6,.93,5.48); /* Dunne's watch, next to the rice */
      /* the empty squat */
      A.furn('mattress',-3.0,5.4,Math.PI); A.furn('trash',-1.2,5.3,0); A.furn('bucket',-4.9,5.5,0); A.bulb(-3.0,3.5,false);
      /* Kev's room: no bulb, just the street through the window. His mother on the sill */
      A.furn('mattress',3.62,3.0,Math.PI/2); A.furn('trash',-.1,5.4,0);
      A.frame(tTwPhotoMom,1.4,.92,5.86,Math.PI); A.light([2.0,1.7,5.2],[.62,.42,.22],3.6);
      A.bulb(2.0,3.5,false);
      /* storage */
      A.furn('crates',6.5,5.4,Math.PI); A.furn('crates',9.2,5.4,Math.PI); A.bulb(7.2,3.5,false);
      /* south: a dark bedroom */
      A.furn('bed',-8.5,-5.45,0); A.furn('wardrobe',-5.0,-5.65,0); A.bulb(-7,-3.5,false);
      /* Rui and Jojo's living room: the TV against the west wall, them watching it, the door behind them */
      A.furn('couch',-.4,-5.55,0); A.furn('tv',-3.75,-3.4,Math.PI/2); A.furn('trash',3.0,-5.4,0);
      A.light([-3.1,.95,-3.4],[.42,.58,1.15],4.2,'tv');
      twVest(-1.0,.47,-5.45,.35); /* a SWAT vest thrown on the couch: Mario's keeping it */
      for(const [x,z] of [[-3.7,-2.9],[-3.75,-3.95],[1.1,-5.1]]) mk(cyl(.033,.033,.12,6,{at:[0,.06,0]}),[M(null,{color:0xb8b2a0}),M(null,{color:0x8a8478}),M(null,{color:0x8a8478})],floorN,x,x>0?.42:.92,z);
      A.bulb(-.4,-3.5,false);
      /* a dark kitchen */
      A.furn('counter',6.7,-5.62,0); A.furn('fridge',9.5,-5.6,0); A.bulb(6.7,-3.5,false);
      A.tag(0,4.2,1.45,1); A.tag(3,-6.0,1.5,-1); A.tag(6,8.6,1.4,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'corner',name:'Dani',spots:[[-7.9,4.82,0],[-8.5,3.62,Math.PI]],pose:'lean',extra:'I got a daughter— she\'s six—'},
      {kind:'corner',name:'Rui',spots:[[-2.3,-2.95,-Math.PI/2],[-1.9,-3.2,-Math.PI/2-.2]],pose:'watch',extra:'I\'m nineteen, man—'},
      {kind:'corner',name:'Jojo',spots:[[-2.2,-4.15,-Math.PI/2+.25],[-1.6,-4.3,-Math.PI/2+.4]],pose:'idle',extra:'My brother\'s on six— please—'},
      {kind:'corner',name:'Kev',spots:[[2.0,5.22,0],[1.6,5.2,.25]],pose:'phone',extra:'I just held the door— I didn\'t shoot—'},
      {kind:'abuela',civ:true,fem:true,old:true,name:'Doña Chela',spots:[[-8.5,-4.45,Math.PI],[-7.6,-4.5,Math.PI+.3]],pose:'idle',extra:'I\'m seventy-eight, mijo—'},
      {kind:'obrero',civ:true,name:'Toño',spots:[[6.7,-4.82,Math.PI],[7.4,-4.85,Math.PI-.3]],pose:'lean',extra:'I work at the plant— I just work—'},
      {kind:'gunman',name:'Tito',spots:[[16.35,.55,-Math.PI/2]],pose:'idle',extra:'They made me look— they made me—',
        hunt:{pts:[[7.2,0],[7.2,3.4],[7.2,0],[-3.0,0],[-3.0,3.4],[-3.0,0],[-7.0,0],[-7.0,-3.4],[-7.0,0],[-16.35,.5],[-6.0,0],[2.4,0],[6.0,0],[6.0,-3.4],[6.0,0],[16.35,.4]],
          calls:['Cop?','Come out, cop.','Landlord says six.','We only counted five.','I know you\'re hurt.','...cop?','You\'re bleeding, man. I can smell it.']}}],
    talk:[
      {who:['Dani'],r:3.8,lines:[['Dani','...the old one kept talking.'],['Dani','His daughter\'s wedding.'],['Dani','In June, he said.'],['Dani','I took his watch.'],['Dani','Eat your rice, Dani.']]},
      {who:['Rui','Jojo'],r:3.8,lines:[['Rui','You were on the stairs?'],['Jojo','Held the light. That\'s all.'],['Rui','Mario\'s keeping the vest.'],['Jojo','Five helmets. There were six.'],['Rui','So where\'s the sixth?'],['Jojo','Tito\'s looking. Turn it up.'],
        ['Jojo','The girl was still breathing.'],['Rui','Don\'t. Not in here.']]},
      {who:['Doña Chela'],r:3.8,lines:[['Doña Chela','Holy Mary, mother of God...'],['Doña Chela','Five boys. Five.'],['Doña Chela','Dani carried one past my door.'],['Doña Chela','His mother would die.']]},
      {who:['Toño'],r:3.8,lines:[['Toño','Don\'t open the door, Toño.'],['Toño','I heard it all through the floor.'],['Toño','Kev was crying after.'],['Toño','I just make tortillas. I just...']]},
      {who:['Kev'],r:3.8,lines:[['Kev','Ma. Ma, it\'s me.'],['Kev','I did something, Ma.'],['Kev','I just held the door.'],['Kev','I didn\'t shoot. I swear.'],['Kev','Pick up. Please.']]}],
    loot:[['knife',-7.4,.97,5.5,.4]],
    clear:['FLOOR 01','Five men. All of them were on the stairs.'] },

  { n:2,name:'Floor 02',kit:'pistol',wall:'paper',floor:'carpet',
    units:[{side:1,x0:-10,x1:-4.6,door:-5.5,paper:'concrete',fl:'conc'},{side:1,x0:-4.6,x1:1.2,door:-.6,win:true,hole:4.6,paper:'peel',fl:'conc'},{side:1,x0:1.2,x1:10,door:2.2,win:true,winX:5.6,paper:'blue'},
      {side:-1,x0:-10,x1:-3,door:-4.0,win:true,winX:-6.5,paper:'cream',fl:'oak'},{side:-1,x0:-3,x1:4,door:.6,win:true,paper:'tile',fl:'tile'},{side:-1,x0:4,x1:10,door:5.2,win:true,paper:'nicotine'}],
    build(A){ A.tube(-8,'dead'); A.tube(-4,'dead'); A.tube(1,'on'); A.tube(5,'dead'); A.tube(8.5,'dead');
      A.light([1,2.5,0],[1.0,1.08,1.2],5.8,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the cutting room: no window, one hot bulb low over the table */
      A.furn('table',-7.4,3.6,0); A.furn('crates',-9.2,5.45,Math.PI); A.furn('trash',-5.3,2.0,0);
      mk(cyl(.004,.004,.85,3),mBlack,floorN,-7.4,2.38,3.6); mk(box(.09,.11,.09),M(tBulb,{unlit:true}),floorN,-7.4,1.9,3.6);
      A.light([-7.4,1.75,3.6],[1.85,1.2,.6],4.6);
      for(const [x,z] of [[-7.6,3.35],[-7.35,3.42],[-7.15,3.7],[-7.55,3.85]]) A.blk(.16,.08,.11,M(tTwBrick),x,.81,z,.3*x);
      A.blk(.22,.05,.22,mSteel,-7.1,.8,3.3); A.blk(.3,.01,.2,M(null,{color:0xd8d4c8}),-7.65,.775,3.95);
      twRadio(-7.0,.77,3.95); /* one of the team's radios, still on their channel */
      /* the squat with the hole into the cutting room */
      A.furn('mattress',-1.8,5.45,Math.PI); A.furn('bucket',.6,5.5,0); A.bulb(-1.7,3.5,false);
      /* Felix's room: a heavy bag, his fight poster, his gloves on a nail */
      { const bx=6.0,bz=3.85; mk(cyl(.17,.17,1.0,8,{at:[0,0,0]}),[M(tTwHeavy),M(null,{color:0x4a1a12}),M(null,{color:0x4a1a12})],floorN,bx,1.2,bz);
        mk(cyl(.006,.006,.9,3),mSteel,floorN,bx,2.2,bz); addBox(bx-.17,bx+.17,bz-.17,bz+.17,.7,1.7,'post'); }
      A.pic(tTwPoster,7.7,1.5,5.926,Math.PI,.48,.72); A.blk(.09,.12,.07,M(tTwGlove),8.25,1.25,5.88); A.blk(.09,.12,.07,M(tTwGlove),8.38,1.2,5.88);
      A.furn('mattress',9.0,2.8,Math.PI/2); A.bulb(5.6,3.2,true); A.light([5.6,2.2,3.2],[1.4,.9,.5],5);
      /* Sami's room: a week in, still in boxes */
      for(const [x,z,h,t] of [[-8.6,-5.5,.5,tTwBoxes],[-8.6,-5.5,.4,tTwBoxPlain],[-7.7,-5.55,.5,tTwBoxes],[-6.85,-5.5,.45,tTwBoxPlain],[-5.9,-5.55,.5,tTwBoxes],[-9.4,-4.4,.45,tTwBoxes]]){
        const y=z===-5.5&&h===.4&&x===-8.6?.7:h/2; A.blk(.62,h,.5,M(t),x,y,z,0,y<.5); }
      A.furn('mattress',-4.3,-3.2,Math.PI/2);
      A.blk(.08,.25,.08,mBlack,-9.4,.75,-4.4); mk(cyl(.06,.11,.12,6,{at:[0,0,0]}),[M(null,{color:0xe8d8a8,unlit:true})],floorN,-9.4,.93,-4.4);
      A.light([-9.3,1.05,-4.3],[1.1,.8,.45],4.2);
      /* a dark kitchen, a dark room */
      A.furn('counter',0,-5.62,0); A.furn('fridge',-2.3,-5.6,0); A.bulb(.5,-3.5,false);
      A.furn('trash',8.6,-5.3,0); A.furn('wardrobe',5.2,-5.65,0); A.bulb(7,-3.5,false);
      A.tag(7,-2.4,1.4,1); A.tag(5,7.5,1.5,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'cutter',name:'Marco',spots:[[-7.4,2.5,0]],pose:'lean',extra:'I don\'t even know you—'},
      {kind:'cutter',name:'Luis',spots:[[-7.4,4.9,Math.PI]],pose:'lean',extra:'It\'s not mine, it\'s his—'},
      {kind:'corner',name:'Felix',spots:[[6.0,3.05,0],[6.3,3.1,-.3]],pose:'watch',extra:'I was a fighter, man—'},
      {kind:'vecino2',hidden:true,name:'Sami',spots:[[-7.2,-4.05,Math.PI],[-6.6,-4.1,Math.PI+.3]],pose:'lean',extra:'I just moved in, man!'},
      {kind:'doorman',name:'Nico',spots:[[16.35,.55,-Math.PI/2]],pose:'idle',extra:'It was the Landlord\'s order—',
        hunt:{pts:[[5.2,0],[6.5,-3.4],[5.2,0],[.6,0],[.6,-3.4],[.6,0],[-.6,0],[-1.7,3.4],[-3.6,4.4],[-1.7,3.4],[-.6,0],[-16.35,.5],[-4.0,0],[2.2,0],[2.2,2.6],[2.2,0],[16.35,.4]],
          calls:['Hey. Cop.','Tito\'s not answering.','...Tito?','You\'re on two now, huh?','Come out. I\'ll make it quick.','We left you for dead. Should\'ve checked.']}}],
    talk:[
      {who:['Luis','Marco'],r:3.8,lines:[['Luis','Weigh it again.'],['Marco','Their radio\'s still talking.'],['Luis','So turn it off. Weigh it.'],['Marco','...Ibarra\'s guy said Thursday.'],['Luis','Don\'t say that name.'],
        ['Marco','I\'m just saying. It\'s Tuesday.'],['Luis','They\'re dead. Weigh it.']]},
      {who:['Felix'],r:3.8,lines:[['Felix','Jab. Jab.'],['Felix','The rookie didn\'t hit back.'],['Felix','Three, I hit him.'],['Felix','Pops said I had hands.'],['Felix','Had.']]},
      {who:['Yesenia'],r:3.8,lines:[['Yesenia','Mamá, it\'s me.'],['Yesenia','Twelve hours. I\'m fine.'],['Yesenia','No, nothing. Some shooting.'],['Yesenia','Nobody called an ambulance.'],['Yesenia','...Nobody.']]},
      {who:['Don Lalo'],r:3.8,lines:[['Don Lalo','Marisol? Who\'s shooting?'],['Don Lalo','My pills. Where are my pills.'],['Don Lalo','The new boy has a gun now.'],['Don Lalo','Sami. Sweet boy. A gun.']]},
      {who:['Sami'],r:3.8,lines:[['Sami','First week. They give me a door.'],['Sami','Stand here, they said.'],['Sami','Shoot whoever comes up.'],['Sami','Should\'ve stayed at my aunt\'s.']]}],
    loot:[],
    civ:[{kind:'enfermera',civ:true,fem:true,name:'Yesenia',spots:[[.2,-4.85,Math.PI],[-.5,-4.85,Math.PI+.2]],pose:'phone',extra:'I\'m a nurse— I\'m a nurse!'},
      {kind:'enfermo',civ:true,old:true,name:'Don Lalo',spots:[[7.4,-4.3,Math.PI],[8.2,-4.0,Math.PI-.4]],pose:'idle',extra:'I\'m sick— I\'m just sick—'}],
    clear:['FLOOR 02','Five men. One of them beat Novak.'] },

  { n:3,name:'Floor 03',kit:'pistol',wall:'dark',floor:'parquet',
    units:[{side:1,x0:-10,x1:-3.6,door:-4.4,win:true,paper:'panel',fl:'oak'},{side:1,x0:-3.6,x1:2.8,door:-1.0,paper:'nicotine',fl:'rug'},{side:1,x0:2.8,x1:10,door:6.4,win:true,hole:4.4,paper:'peel',fl:'conc'},
      {side:-1,x0:-10,x1:-2,door:-3.2,win:true,paper:'pink'},{side:-1,x0:-2,x1:10,door:3.4,win:true,winX:6.0,paper:'sage'}],
    build(A){ A.tube(-8,'dead'); A.tube(-4,'dead'); A.tube(2,'on'); A.tube(6,'dead');
      A.light([2,2.5,0],[1.0,1.08,1.2],5.8,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the rent office: a desk lamp, the money, the book. The .38 is on the desk */
      A.furn('desk',-7.0,4.4,Math.PI); A.furn('filing',-9.5,5.6,Math.PI); A.furn('filing',-4.3,5.6,Math.PI);
      for(const [x,z] of [[-7.3,4.55],[-7.15,4.6],[-7.35,4.75],[-6.95,4.7]]) A.blk(.1,.03,.05,M(tTwMoney),x,.795,z,.2);
      A.blk(.24,.02,.18,M(tTwLedger),-6.75,.79,4.45,-.15);
      for(let k=0;k<5;k++) twHelmet(-8.95+k*.34,5.55,k*.7); /* the Landlord pays per helmet */
      mk(cyl(.05,.07,.02,6),mBlack,floorN,-7.55,.79,4.85); mk(cyl(.006,.006,.3,3),mBlack,floorN,-7.55,.94,4.85); mk(cyl(.04,.08,.08,6),[M(null,{color:0x2a3a2a}),M(null,{color:0xf2e2a8,unlit:true}),M(null,{color:0xf2e2a8,unlit:true})],floorN,-7.5,1.08,4.78);
      A.light([-7.4,1.1,4.5],[1.3,1.05,.6],4.2);
      /* the card game: a bulb over the table, the pot in the middle */
      A.furn('table',-.4,3.6,Math.PI/2); A.furn('couch',-.4,5.55,Math.PI);
      for(const [x,z,r] of [[-.75,3.4,.2],[-.6,3.85,-.4],[-.1,3.5,.9],[-.2,3.8,.1]]) A.blk(.05,.003,.075,M(tTwCards),x,.775,z,r);
      for(const [x,z] of [[-.45,3.62],[-.38,3.58]]) A.blk(.1,.025,.05,M(tTwMoney),x,.785,z,.5);
      A.blk(.05,.006,.065,M(tTwBadge),-.3,.79,3.68,.4); /* a badge in the pot */
      mk(cyl(.035,.035,.24,6,{at:[0,.12,0]}),[M(null,{color:0x4a3a1a}),M(null,{color:0x2a2a1a}),M(null,{color:0x2a2a1a})],floorN,.15,.77,3.35);
      A.bulb(-.4,3.6,true,true,2.0); A.light([-.4,1.85,3.6],[1.6,1.0,.5],4.6);
      A.furn('mattress',8.8,5.4,Math.PI); A.furn('crates',4.2,5.4,Math.PI); A.bulb(6.4,3.5,false);
      /* south: a dark bedroom, then Mike's room. His candles to the Virgin, and the street flashing red and blue */
      A.furn('bed',-8.5,-5.45,0); A.furn('wardrobe',-4.5,-5.65,0); A.bulb(-6,-3.5,false);
      A.furn('couch',1.6,-5.5,0); A.furn('crates',9.2,-5.45,0);
      A.pic(tTwVirgin,9.2,1.65,-5.926,0,.36,.54); for(const [x,z] of [[8.95,-5.3],[9.15,-5.25],[9.4,-5.32],[9.05,-5.15]]) A.candle(x,1.1,z);
      A.light([9.2,1.3,-5.0],[1.2,.7,.3],3.6,'candle');
      A.light([6.0,1.7,-5.3],[.5,.2,.2],4.2,'police');
      A.bulb(4,-3.5,false);
      A.tag(7,-6.5,1.45,-1); A.tag(2,4.6,1.5,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Paulie',spots:[[-7.0,3.12,0]],pose:'lean',extra:'It\'s just the rent, man—'},
      {kind:'vecino1',hidden:true,name:'Eddie',spots:[[-.4,2.55,0]],pose:'lean',extra:'I got a kid on the way—'},
      {kind:'cutter',name:'Tomas',spots:[[-.4,4.65,Math.PI]],pose:'lean',extra:'Take it, take the money—'},
      {kind:'enforcer',name:'Big Mike',spots:[[6.0,-5.2,Math.PI],[5.6,-5.15,Math.PI-.3]],pose:'watch',extra:'I didn\'t shoot nobody—'}],
    talk:[
      {who:['Paulie'],r:3.8,lines:[['Paulie','Two-oh-one. Short. Again.'],['Paulie','Helmets: five.'],['Paulie','Five hundred a helmet.'],['Paulie','Somebody owes me a sixth.']]},
      {who:['Tomas','Eddie'],r:3.8,lines:[['Tomas','Raise.'],['Eddie','With what, cop money?'],['Tomas','With yours.'],['Eddie','...you think they send more?'],['Tomas','Who?'],['Eddie','Kill five, they send fifty.'],['Tomas','Not here they don\'t. Raise.']]},
      {who:['Marisol'],r:3.8,lines:[['Marisol','Paulie took the rent twice.'],['Marisol','Twice this month.'],['Marisol','And now cops. On our stairs.'],['Marisol','Go to sleep, Marisol.']]},
      {who:['Don Rafa'],r:3.8,lines:[['Don Rafa','Six went in.'],['Don Rafa','I counted from the window.'],['Don Rafa','Five came out. In bags.'],['Don Rafa','Eddie came up laughing.']]},
      {who:['Big Mike'],r:3.8,lines:[['Big Mike','Their trucks are still there.'],['Big Mike','Lights going. Nobody\'s coming.'],['Big Mike','Nobody\'s ever coming.']]}],
    loot:[['revolver',-6.5,.82,4.3,1.2]],
    civ:[{kind:'senora',civ:true,fem:true,name:'Marisol',spots:[[-6.2,-4.5,Math.PI],[-5.4,-4.2,Math.PI-.4]],pose:'idle',extra:'I didn\'t see anything! Nothing!'},
      {kind:'abuelo',civ:true,old:true,name:'Don Rafa',spots:[[6.4,5.1,0],[5.8,5.0,.3]],pose:'watch',extra:'I\'m old, son— I\'m old—'}],
    clear:['FLOOR 03','Twelve floors to go.'] }
];
const TW_WALL={peel:tPeel,paper:tPaper,dark:tDarkPaint}, TW_FLOOR={lino:tLinoStain,carpet:tCarpet,parquet:tParquet};
/* floors can be added by later files (67-*.js push onto TOWER), so the top is read when it's needed */
const twLast=()=>TOWER.length-1;


/* ---------- polish: painted panels, trims, the things people leave about ----------
   Walls are built as their two faces, cut into cells of about 0.6 x 0.7 m: lighting here is per vertex, so a bulb's pool on a wall needs
   vertices to land on, or the light breaks into saw-teeth. Each face takes the paint of the room it faces, mapped in world space
   (one 1.2 m panel across, floor to ceiling down), so a lintel shows the top of the wall and the skirting runs at the bottom. */
/* grime over a painted panel: water run down from the ceiling, scuffs along the skirting, plaster showing where the paint came off */
function twGrime(g,w,h,r,k=1){ for(let i=0;i<3*k;i++){ const x=r()*w|0,len=(.15+r()*.45)*h; vfill(g,x,0,2+(r()*3|0),len,[[0,'rgba(60,44,20,.42)'],[.6,'rgba(60,44,20,.18)'],[1,'rgba(60,44,20,0)']]); }
  for(let i=0;i<6*k;i++) R(g,'rgba(20,16,12,'+(.15+r()*.2)+')',r()*w|0,h-5-(r()*7|0),2+(r()*4|0),1);
  for(let i=0;i<k;i++){ if(r()<.6) continue; const x=r()*(w-6),y=h*.3+r()*h*.4,ww=2+r()*4,hh=2+r()*3; ell(g,x+ww/2,y+hh/2,ww/2,hh/2,'rgba(170,160,140,.28)'); }
  vfill(g,0,0,w,6,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]); }
const twPaint=(base,seed,fn,o={})=>wallTex(base,seed,(g,w,h,r)=>{ if(fn) fn(g,w,h,r); twGrime(g,w,h,r,o.grime??1); },o);
const TW_PAPER={
  peel:twPaint('#6c7c66',1601,(g,w,h,r)=>{ for(let i=0;i<3;i++){ const x=r()*26|0,y=8+r()*40|0,ww=3+(r()*4|0),hh=2+(r()*3|0); R(g,'rgba(150,140,112,.55)',x,y,ww,hh); R(g,'rgba(0,0,0,.22)',x,y+hh,ww,1); } },{skirt:'#3e4a3a',grime:1.6}),
  paper:twPaint('#8a7a50',1602,(g,w,h,r)=>{ for(let x=0;x<w;x+=6){ R(g,'#7a6a42',x,0,1,h); R(g,'rgba(255,240,190,.08)',x+3,0,1,h); } for(let i=0;i<2;i++){ const x=r()*24|0; R(g,'rgba(40,28,10,.35)',x,10,6,1); poly(g,[[x,10],[x+6,10],[x+4,18]],'rgba(200,180,140,.5)'); } },{skirt:'#3a2e1c',grime:1.3}),
  dark:twPaint('#3c4046',1603,(g,w,h)=>{ R(g,'#4c5056',0,h*.42|0,w,1); },{skirt:'#202226',grime:1.2}),
  nicotine:twPaint('#a8935e',1604,(g,w,h)=>{ for(let x=0;x<w;x+=8){ R(g,'rgba(120,96,50,.25)',x,0,3,h); } vfill(g,0,0,w,h*.5,[[0,'rgba(90,64,24,.45)'],[1,'rgba(90,64,24,0)']]); },{skirt:'#5a4626',grime:1.4}),
  tile:twPaint('#b8a870',1605,(g,w,h)=>{ R(g,'#cfd0c4',0,h*.5,w,h*.5-3); for(let y=h*.5;y<h-3;y+=4) R(g,'rgba(0,0,0,.14)',0,y|0,w,1); for(let x=0;x<w;x+=4) R(g,'rgba(0,0,0,.14)',x,h*.5|0,1,h*.5-3); R(g,'#4a7a6a',0,h*.5|0,w,2); },{skirt:'#4a7a6a',grime:1.2}),
  sage:twPaint('#6e7e62',1606,(g,w,h)=>{ R(g,'#5a6850',0,h*.62|0,w,h*.38); R(g,'#8a9a7a',0,h*.62|0,w,1); },{skirt:'#3a4434',crown:'#9aa88a',grime:1.2}),
  cream:twPaint('#c8b894',1607,null,{skirt:'#8a7a5a',crown:'#d8ccb0',grime:1.5}),
  pink:twPaint('#c49ca0',1608,(g,w,h)=>{ for(let y=6;y<h-6;y+=10) for(let x=(y/10|0)%2?6:0;x<w;x+=12) ell(g,x,y,1.4,1.4,'#d8b8ba'); },{skirt:'#e2d8d0',grime:1.4}),
  blue:twPaint('#465a7a',1609,null,{skirt:'#2a3446',grime:1.3}),
  panel:twPaint('#5a4632',1610,(g,w,h,r)=>{ for(let x=0;x<w;x+=8){ R(g,'#46362a',x,0,1,h); R(g,'rgba(255,220,160,.07)',x+1,0,2,h); } R(g,'#3a2c20',0,h*.55|0,w,2); },{skirt:'#2a1e14',grime:.8}),
  concrete:twPaint('#6a6a66',1611,(g,w,h,r)=>{ for(let i=0;i<14;i++) R(g,'rgba(0,0,0,.12)',r()*w|0,r()*h|0,2,1); for(let y=0;y<h;y+=21) R(g,'rgba(0,0,0,.22)',0,y,w,1); },{skirt:false,grime:1.6}) };
/* the corridor: cream over a green dado and a dark rail, kicked and scraped along the bottom */
const tTwHall=twPaint('#a39f86',1620,(g,w,h)=>{ vfill(g,0,h*.56,w,h*.44,[[0,'#3e5244'],[1,'#2c3a30']]); R(g,'#1e2a22',0,h*.56|0,w,2); R(g,'rgba(255,255,255,.08)',0,(h*.56|0)+2,w,1); },{skirt:'#1a1e1a',grime:1.8});
const TW_FLOORS={lino:tLinoStain,check:tFlLino,tile:tFlTile,conc:tFlConc,carpet:tCarpet,rug:tFlCarpet,oak:tFlOak,old:tLinoStain,parquet:tParquet};
const TW_FLTINT={check:0x7a7468,tile:0x8a8a82,conc:0x7a7672,rug:0x8a8278,oak:0x8a7e70};
const tTwStain=P2(32,32,(g,w,h)=>{ const r=rng(1630); for(let k=0;k<3;k++){ const cx=8+r()*16,cy=8+r()*16,rr=5+r()*7; for(let i=0;i<5;i++) ell(g,cx+(r()-.5)*rr,cy+(r()-.5)*rr,rr*(.5+r()*.5),rr*(.4+r()*.5),'rgba(70,52,26,.16)'); ell(g,cx,cy,rr*.9,rr*.75,'rgba(0,0,0,0)'); }
  g.strokeStyle='rgba(60,40,16,.35)'; g.lineWidth=1; g.beginPath(); g.ellipse(16,16,11,9,.3,0,6.28); g.stroke(); });
const tTwPlates=n=>P2(32,8*n,(g,w,h)=>{ R(g,'#2a2620',0,0,w,h); });
/* a merge pot: boxes, cylinders and quads by material, flushed as one mesh per material (one draw call each) */
function twPot(){ const P=new Map();
  const geoOf=m=>{ let e=P.get(m); if(!e){ e=new Geo(); e.groups=[{start:0,count:0,mi:0}]; P.set(m,e); } return e; };
  const put=(m,src,x,y,z,ry=0,rx=0,rz=0)=>{ const g=geoOf(m),b=g.P.length/3,R_=m4.compose(m4.make(),[x,y,z],[rx,ry,rz],[1,1,1]);
    for(let i=0;i<src.P.length;i+=3){ const v=mulP(R_,[src.P[i],src.P[i+1],src.P[i+2]]); g.P.push(v[0],v[1],v[2]); const n=src.Nm, q=[R_[0]*n[i]+R_[4]*n[i+1]+R_[8]*n[i+2],R_[1]*n[i]+R_[5]*n[i+1]+R_[9]*n[i+2],R_[2]*n[i]+R_[6]*n[i+1]+R_[10]*n[i+2]]; g.Nm.push(q[0],q[1],q[2]); }
    for(const t of src.T) g.T.push(t); for(const ix of src.I) g.I.push(ix+b); };
  return { box(m,w,h,d,x,y,z,ry,rx,rz){ put(m,box(w,h,d),x,y,z,ry,rx,rz); }, cyl(m,rt,rb,h,seg,x,y,z,ry,rx,rz){ put(m,cyl(rt,rb,h,seg),x,y,z,ry,rx,rz); },
    quad(m,c,n,u,v,su,sv,uv=[0,0,1,1]){ const g=geoOf(m),b=g.P.length/3; for(const [a,bb,ta,tb] of [[-1,-1,uv[0],uv[1]],[1,-1,uv[2],uv[1]],[1,1,uv[2],uv[3]],[-1,1,uv[0],uv[3]]]){ g.v([c[0]+u[0]*a*su+v[0]*bb*sv,c[1]+u[1]*a*su+v[1]*bb*sv,c[2]+u[2]*a*su+v[2]*bb*sv],n,[ta,tb]); } g.I.push(b,b+1,b+2,b,b+2,b+3); },
    raw:geoOf,
    flush(G){ for(const [m,g] of P){ if(!g.I.length) continue; g.groups=[{start:0,count:g.I.length,mi:0}]; mk(g,m,G); } P.clear(); } }; }
/* the faces of wall slabs [cx,cy,cz,w,h,d,...]: matAt(x,z) says what paint faces into that spot (null: nobody sees it) */
function twFaces(pot,list,matAt,trim){ const CU=.6,CV=.7;
  for(const e of list){ const [cx,cy,cz,w,h,d]=e,alongX=w>=d,L=alongX?w:d,T=alongX?d:w,a0=(alongX?cx:cz)-L/2,y0=cy-h/2,nu=Math.max(1,Math.ceil(L/CU-.01)),nv=Math.max(1,Math.ceil(h/CV-.01));
    for(const sd of [1,-1]){ const nrm=alongX?[0,0,sd]:[sd,0,0],off=(alongX?cz:cx)+sd*T/2;
      for(let i=0;i<nu;i++){ const s0=a0+L*i/nu,s1=a0+L*(i+1)/nu,sm=(s0+s1)/2; const px=alongX?sm:off+sd*.25,pz=alongX?off+sd*.25:sm,m=matAt(px,pz); if(!m) continue;
        const g=pot.raw(m);
        for(let j=0;j<nv;j++){ const yA=y0+h*j/nv,yB=y0+h*(j+1)/nv,b=g.P.length/3;
          const P_=(s,y)=>alongX?[s,y,off]:[off,y,s], U=s=>(alongX?s:-s)*sd/1.2;
          const cs=[[s0,yA],[s1,yA],[s1,yB],[s0,yB]]; if(sd<0) cs.reverse();
          if(!alongX) cs.reverse();
          for(const [s,y] of cs) g.v(P_(s,y),nrm,[U(s),y/RH]);
          g.I.push(b,b+1,b+2,b,b+2,b+3); } } }
    /* the edges: jambs, the underside of a lintel, the tops (under the ceiling, unseen, skipped) */
    const ends=alongX?[[cx-w/2,[-1,0,0]],[cx+w/2,[1,0,0]]]:[[cz-d/2,[0,0,-1]],[cz+d/2,[0,0,1]]];
    for(const [pos,n] of ends){ const c=alongX?[pos,cy,cz]:[cx,cy,pos]; pot.quad(trim,c,n,alongX?[0,0,1]:[1,0,0],[0,1,0],T/2,h/2); }
    if(y0>.05) pot.quad(trim,[cx,y0,cz],[0,-1,0],[1,0,0],[0,0,1],w/2,d/2); } }
/* stuff on the floor along the walls of a room: a few things, out of the way of doors and furniture */
function twClutter(pot,units,rnd2){ const mBag=M(null,{color:0x16181a}),mBottle=M(null,{color:0x2e5a34}),mCan=M(null,{color:0x8a8e90}),mCloth=M(null,{color:0x4a5260}),mPaper=M(null,{color:0xb8b0a0}),mShoe=M(null,{color:0x2a2420});
  for(const u of units){ const n=3+(rnd2()*4|0);
    for(let t=0,k=0;t<40&&k<n;t++){ const along=rnd2(),edge=rnd2()<.5; let x=u.x0+.35+along*(u.w-.7),z=u.side*(edge?5.6:1.4+rnd2()*4.2); if(!edge){ x=rnd2()<.5?u.x0+.3:u.x1-.3; }
      if(Math.abs(x-u.door)<.9&&Math.abs(z)<2.2) continue; if(u.hole!=null&&Math.abs(x-u.x0)<.6&&Math.abs(Math.abs(z)-u.hole)<.8) continue;
      if(BOXES.some(b=>b.kind!=='wall'&&x>b.x0-.25&&x<b.x1+.25&&z>b.z0-.25&&z<b.z1+.25)) continue;
      const ry=rnd2()*6.28,kind=rnd2(); k++;
      if(kind<.22){ pot.box(mBag,.42,.34,.36,x,.17,z,ry); pot.box(mBag,.12,.08,.1,x,.38,z,ry); }
      else if(kind<.42){ for(let q=0;q<1+(rnd2()*3|0);q++){ const lay=rnd2()<.5; pot.cyl(mBottle,.028,.034,.24,6,x+(rnd2()-.5)*.3,lay?.034:.12,z+(rnd2()-.5)*.3,rnd2()*6,lay?Math.PI/2:0,0); } }
      else if(kind<.58){ for(let q=0;q<2+(rnd2()*3|0);q++) pot.cyl(mCan,.033,.033,.12,6,x+(rnd2()-.5)*.35,.033,z+(rnd2()-.5)*.35,rnd2()*6,Math.PI/2,0); }
      else if(kind<.74){ pot.box(mCloth,.5,.08,.38,x,.04,z,ry); pot.box(mCloth,.3,.06,.28,x+.08,.1,z,ry+.6); }
      else if(kind<.88){ for(let q=0;q<3;q++) pot.box(mPaper,.3,.006,.22,x+(rnd2()-.5)*.25,.003+q*.006,z+(rnd2()-.5)*.25,rnd2()*6); }
      else { pot.box(mShoe,.11,.09,.28,x,.045,z,ry); pot.box(mShoe,.11,.09,.28,x+.16,.045,z+.05,ry+.3); } } } }

/* the floor's half-length: apartments run x -TL..TL, the stairwells sit beyond them (TL..TL+4). The lobby is 10, the floors 16 */
let TL=10; const TO=()=>TL-10;
/* ---------- building one ---------- */
function genTower(i){ const D=TOWER[i]; TL=D.len||10; setWorld(TL+4,6);
  disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true; if(typeof FIRES!=='undefined') FIRES.length=0;
  Object.assign(FLOOR,{n:D.n,seed:0,test:false,camp:true,idx:i,def:D,mode:'camp',doors:[],windows:[],power:true,flick:null,dormD:undefined,down:false,goals:{},hot:[],noClear:!!D.pro,
    start:D.pro?{x:-11.3,z:0,yaw:-Math.PI/2}:{x:-(TL+.35),z:-.45,yaw:-Math.PI/2},stairUp:null,clearH:D.clear&&D.clear[0],clearP:D.clear&&D.clear[1]});
  setLang(false); if(GAME.vision&&GAME.vision!=='off'&&typeof cycleVision==='function'){ GAME.vision='off'; if(typeof visionApply==='function') visionApply(); }
  const G=floorN; GEO_TEMP=true;
  const units=D.units.map((u,k)=>Object.assign({},u,{id:k,w:u.x1-u.x0,apt:String(D.n).padStart(2,'0')+String(k+1).padStart(2,'0'),lit:false}));
  /* walls */
  const unitW=[],hallW=[],stairW=[];
  for(const side of [1,-1]){ const row=units.filter(u=>u.side===side).sort((a,b)=>a.x0-b.x0);
    twWall(hallW,'x',side,-TL,TL,row.map(u=>({s:u.door,w:1.0,y0:0,y1:2.1})));
    twWall(unitW,'x',side*6,-TL,TL,row.filter(u=>u.win).map(u=>({s:u.winX??(u.x0+u.x1)/2,w:1.4,y0:.9,y1:2.0})));
    twWall(unitW,'z',-TL,side>0?1:-6,side>0?6:-1,[]); twWall(unitW,'z',TL,side>0?1:-6,side>0?6:-1,[]);
    for(let k=1;k<row.length;k++){ const u=row[k]; twWall(unitW,'z',u.x0,side>0?1:-6,side>0?6:-1,u.hole!=null?[{s:side*u.hole,w:1.0,y0:0,y1:2.0}]:[]); } }
  /* paint: each apartment its own (u.paper), the floor's default otherwise; the corridor; the stairwells */
  const pot=twPot(), mTrim=M(null,{color:0x2a241e,double:true}), mHall=M(tTwHall), mStair=M(tStairWall);
  const paperM={}; const papOf=k=>paperM[k]||(paperM[k]=M(TW_PAPER[k]||TW_PAPER.peel));
  const matAt=(x,z)=>{ const ax=Math.abs(x),az=Math.abs(z); if(az>6||ax>TL+4) return null; if(ax>TL) return az<2.05?mStair:null; if(az<1) return mHall;
    const u=units.find(u=>u.side===Math.sign(z)&&x>=u.x0&&x<u.x1); return u?papOf(u.paper||D.wall):null; };
  twFaces(pot,[...unitW,...hallW],matAt,mTrim);
  for(const e of [...unitW,...hallW,...stairW]) addBox(e[0]-e[3]/2,e[0]+e[3]/2,e[2]-e[5]/2,e[2]+e[5]/2,e[1]-e[4]/2,e[1]+e[4]/2,'wall');
  /* floors: each apartment its own (u.fl), the corridor; finer cells so the light pools are round. The ceiling, stained */
  const flM={}; const flOf=k=>flM[k]||(flM[k]=M(TW_FLOORS[k]||TW_FLOORS.old,{repeat:[1,1]}));
  for(const u of units){ const w=u.x1-u.x0,fk=u.fl||D.floor,big=fk==='check'||fk==='tile'||fk==='rug'||fk==='oak'||fk==='conc',m=M(TW_FLOORS[fk]||TW_FLOORS.old,{repeat:big?[w,5]:[w/1.6,5/1.6],color:TW_FLTINT[fk]??0xffffff}); mk(plane(w,5,Math.ceil(w*2),10),m,G,(u.x0+u.x1)/2,.002,u.side*3.5,-Math.PI/2); }
  mk(plane(2*TL,2,4*TL,4),M(tLinoHall,{repeat:[TL,1]}),G,0,.004,0,-Math.PI/2);
  mk(plane(2*TL,12,4*TL,24),M(tConcrete,{repeat:[TL,6],color:0x6a6866}),G,0,RH,0,Math.PI/2);
  const r2=rng((D.n+1)*7919);
  { const mSt=M(tTwStain,{cut:true}); for(let k=0;k<Math.round(TL*.9);k++){ const x=-(TL-.5)+r2()*(2*TL-1),z=(r2()-.5)*11,sz=.5+r2()*1.1; pot.quad(mSt,[x,RH-.004,z],[0,-1,0],[1,0,0],[0,0,1],sz,sz*.8); }
    for(let k=0;k<Math.round(TL*.7);k++){ const x=-(TL-.5)+r2()*(2*TL-1),z=(r2()-.5)*11,sz=.4+r2()*.7; if(Math.abs(z)<1.1||Math.abs(z)>5.6) continue; pot.quad(mSt,[x,.008,z],[0,1,0],[1,0,0],[0,0,-1],sz,sz*.7); } }
  /* the corridor ceiling: two pipes and a conduit run its length, clamped every couple of metres */
  { const mPipe=M(tSteel,{color:0x6a6862}),mRust=M(null,{color:0x4a3022});
    pot.cyl(mPipe,.045,.045,2*TL,6,0,RH-.12,.72,0,0,Math.PI/2); pot.cyl(mRust,.03,.03,2*TL,5,0,RH-.1,.55,0,0,Math.PI/2); pot.cyl(mPipe,.016,.016,2*TL,4,0,RH-.05,-.7,0,0,Math.PI/2);
    for(let x=-(TL-1);x<=TL-1;x+=2.2){ pot.box(mTrim,.04,.1,.24,x,RH-.07,.64); pot.box(mTrim,.03,.04,.06,x+.4,RH-.03,-.7); } }
  /* door casings both sides, and the number beside each door on the corridor side (one atlas, one draw) */
  { const N_=units.length,plates=tex(32,8*N_,'#2a2620',(g)=>{ units.forEach((u,k)=>{ const t=String(D.n)+String(k+1).padStart(2,'0'); R(g,'#8a7a4a',1,k*8+1,30,6); R(g,'#c8b070',2,k*8+2,28,4); text(g,t,(32-textW(t))>>1,k*8+2,'#2a2014'); }); });
    const mPl=M(plates);
    units.forEach((u,k)=>{ const z=u.side; for(const sx of [-1,1]) pot.box(mTrim,.08,2.18,.24,u.door+sx*.54,1.09,z); pot.box(mTrim,1.16,.09,.24,u.door,2.145,z);
      const px=u.door+(u.door<(u.x0+u.x1)/2?.82:-.82),pz=z-z*.075; pot.quad(mPl,[px,1.55,pz],[0,0,-z],[z>0?-1:1,0,0],[0,1,0],.16,.04,[0,1-(k+1)/N_,1,1-k/N_]); } ); }
  /* windows: frame, sill, glass you can't fall through, and a curtain in some */
  { const mCurt=[M(null,{color:0x6a2a24}),M(null,{color:0x8a7a52}),M(null,{color:0x3a4a5a})]; for(const u of units) if(u.win){ const x=u.winX??(u.x0+u.x1)/2,z=u.side*5.94;
    mk(plane(1.4,1.1),M(tNightWin,{unlit:true,color:0x8a8a8a}),G,x,1.45,z,0,u.side>0?Math.PI:0,0); addBox(x-.7,x+.7,u.side*6-.07,u.side*6+.07,.9,2.0,'window');
    const zi=u.side*(6-.1); pot.box(mTrim,1.56,.05,.22,x,.88,zi); pot.box(mTrim,1.5,.07,.08,x,2.03,u.side*5.95); for(const sx of [-1,1]) pot.box(mTrim,.07,1.15,.08,x+sx*.72,1.45,u.side*5.95); pot.box(mTrim,.04,1.1,.04,x,1.45,u.side*5.93);
    if(r2()<.6){ const c=mCurt[r2()*3|0],sx=r2()<.5?-1:1; pot.box(c,.5,1.35,.04,x+sx*.55,1.35,u.side*5.82,0,0,sx*.03); pot.box(mTrim,1.8,.03,.03,x,2.1,u.side*5.82); } } }
  /* where the party wall was knocked through: plaster and brick on the floor either side */
  { const mDeb=M(null,{color:0x8a8478}),mBrick=M(null,{color:0x7a4a34}); for(const u of units) if(u.hole!=null){ const z=u.side*u.hole; for(let q=0;q<9;q++){ const sx=r2()<.5?-1:1; (q%3?pot.box.bind(null,mDeb):pot.box.bind(null,mBrick))(.08+r2()*.14,.04+r2()*.05,.06+r2()*.12,u.x0+sx*(.15+r2()*.6),.03,z+(r2()-.5)*1.1,r2()*6); } } }
  /* the stairwells: real switchbacks (twShaft). East goes up; west is where you came up, its flight up barricaded. The lobby has the street doors on the west */
  const blocked=[];
  for(const sx of [-1,1]){ if(sx<0&&D.pro) twVestibule(G,blocked); else twShaft(G,sx,sx>0?'up':'in',D.n,blocked); }
  /* what's in it */
  const furn=[],seats=[],beds=[],lights=[],anim=[];
  D.build(twKit(G,furn,seats,beds,lights,anim));
  if(!D.pro&&D.clutter!==false) twClutter(pot,units,r2);
  pot.flush(G);
  for(const l of lights){ const p=l[0]; if(Math.abs(Math.abs(p[0])-11.5)<.01&&Math.abs(p[1]-2.35)<.01&&Math.abs(p[2])<.01){ const sx=Math.sign(p[0]);
      if(sx<0&&D.pro) continue; l[0]=[sx*(13.55+TO()),3.25,.9]; l[2]=Math.max(l[2],6.2); } }
  /* the flickering tube is light 0 (the game flickers FLOOR.lights[0] through FLOOR.flick) */
  const fi=anim.findIndex(a=>a.kind==='flick'); if(fi>=0){ const li=anim[fi].i; if(li!==0){ const t=lights[0]; lights[0]=lights[li]; lights[li]=t; for(const a of anim){ if(a.i===0) a.i=li; else if(a.i===li) a.i=0; } }
    const tubeX=lights[0][0][0]; const tn=floorN.kids.find(k=>k.mesh&&Math.abs(k.p[0]-tubeX)<.01&&Math.abs(k.p[1]-2.75)<.01); FLOOR.flick={mat:tn?tn.mesh.mats[0]:M(tFluo),i:0}; anim.splice(fi,1); }
  GEO_TEMP=false;
  /* everything static on the floor merged by material into 7 m tiles (36-colonia.js): a couple of dozen draws instead of a few hundred */
  meshMerge(floorN,{tile:7});
  /* where people can walk: inside the corridor, the landings and the apartments, clear of anything below 1.5 m */
  const nav=new Uint8Array(NX*NZ),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i;
    let sp=-9; if(Math.abs(x)<TL&&Math.abs(z)<=1) sp=-1; /* <=: the doorway cells sit on the wall line (the wall boxes block the rest of it) */ else if(Math.abs(x)>=TL&&Math.abs(x)<(D.pro&&x<0?TL+4:TL+.75)&&Math.abs(z)<2) sp=-2;
    else if(Math.abs(z)>1&&Math.abs(z)<6){ const u=units.find(u=>u.side===Math.sign(z)&&x>=u.x0&&x<u.x1); if(u) sp=u.id; }
    space[id]=sp; let bl=sp===-9; if(!bl&&blocked.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])) bl=true;
    if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.25) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } }
    nav[id]=bl?1:0; }
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats,beds,furn,lights,anim});
  const amb=D.amb||[.15,.145,.17];
  setLights({amb,dir:[.3,1,.4],dirCol:[.05,.05,.07],fog:[.012,.012,.016],fogNear:6,fogFar:19,pl:[...lights,[[0,-50,0],[0,0,0],1]]});
  boxGridDirty=true; navDirty=true; NAVF.clear(); navGen++;
  const tag=$('floorTag'); if(tag) tag.textContent=D.pro?'The lobby':D.name; }

/* ---------- the people ---------- */
function twMirror(P){ const j={}; for(const k in P.j){ const m=k.endsWith('L')?k.slice(0,-1)+'R':k.endsWith('R')?k.slice(0,-1)+'L':k,r=P.j[k]; j[m]=[r[0],-r[1],-r[2]]; } return {hipsY:P.hipsY,j}; }
function twCast(){ const D=FLOOR.def;
  for(const c of [...(D.cast||[]),...(D.civ||[])]){ const s=pick(c.spots);
    const mk_=TW_MAKERS[c.kind]||(typeof ROSTER!=='undefined'&&ROSTER[c.kind]?(h,g)=>makeChar(c.kind,h,g):c.civ?makeCorner:makeGunman); /* tenants and plain clothes come from the cast kit (45c-tenants.js) */
    const E=spawnEnemy({maker:mk_,name:c.name,x:s[0],z:s[1],hd:s[2],extra:c.extra,pre:E=>{
      if(!c.pose||c.pose==='idle') return; civPoses(E.C); const P=E.C.poses;
      if(c.pose==='phone'){ E.idleP=twMirror(P.phone); mk(box(.016,.12,.062),mBlack,E.J.handL,0,-.075,.0); mk(plane(.05,.1),M(null,{color:0x9ac0e0,unlit:true}),E.J.handL,.0085,-.075,0,0,Math.PI/2,0); }
      else if(P[c.pose]) E.idleP=P[c.pose]; }});
    E.detail=c.extra; enemies.push(E);
    if(c.civ){ E.civ=true; E.atkCd=1e9; E.extra=c.extra; if(c.fem) E.voice={f0:rnd(195,225),rasp:.08,breath:.6}; else if(c.old) E.voice={f0:rnd(88,100),rasp:.5,breath:.55}; }
    if(c.hidden&&E.C.wpn){ E.concealed=true; E.C.wpn.vis=false; E.wpnHeld=false; setGrip(E.J,'R',false); } /* plain clothes: the gun stays in his waistband till he knows you're here */
    if(c.hunt){ /* he's looking for the sixth cop: a flashlight and a walk, room to room, ending at the landing you come up to */
      E.hunter=c.hunt; E.patrol={pts:c.hunt.pts,i:0,wait:rnd(2,5)}; E.callT=rnd(3,6); E.torchOn=true;
      const t=N(E.J.handL,0,-.06,.03,Math.PI/2,0,0); mk(cyl(.02,.017,.15,6),[mBlack,M(null,{color:0xfff2c8,unlit:true}),mBlack],t); } }
  FLOOR.convos=(D.talk||[]).map(t=>Object.assign({},t,{i:0,t:rnd(.6,2.2),dead:false}));
  attachLabels(); }
function twLoot(){ for(const [k,x,y,z,ry] of FLOOR.def.loot||[]){ const Mw=m4.compose(m4.make(),[x,y,z],[k==='knife'||k==='machete'||k==='bottle'?Math.PI/2:0,ry,0],[1,1,1]); addPickup(newItem(k),Mw,[0,0,0],[0,0,0]); } }

/* what you overhear: one line at a time, out loud (a murmur from his own mouth) with the words over his head */
function twTalk(dt){ for(const C of FLOOR.convos||[]){ if(C.dead) continue;
  const who=C.who.map(n=>enemies.find(E=>E.name===n));
  if(who.some(E=>!E||E.dead||E.aware||E.st==='down'||E.st==='kneel')){ C.dead=true; continue; }
  if(who.some(E=>E.st!=='idle'||E.mind&&E.mind!=='calm'||E.grabbed)) continue;
  /* further off you only hear them murmur (no words, no lines used up), so the voices pull you in. The words start when you're
     close and can see one of them: in the doorway, or right behind them */
  const d=Math.min(...who.map(E=>Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z))); if(d>7.5) continue;
  const eye=camBasis().eye,close=d<Math.max(C.r||0,4.6)&&who.some(E=>sightClear(eye,X_(E.B,PI_.head)));
  if(!close){ C.mt=(C.mt??rnd(.5,1.5))-dt; if(C.mt<=0){ C.mt=rnd(1.8,3); vox(pick(who),'mutter',.75); } continue; }
  C.t-=dt; if(C.t>0) continue;
  const [nm,txt]=C.lines[C.i],E=who[C.who.indexOf(nm)],dur=clamp(1.7+txt.length*.07,2.4,4.2);
  bark(E,txt,dur); vox(E,'mutter',.95); C.i++;
  if(C.i>=C.lines.length){ C.i=0; C.t=dur+rnd(14,22); } else C.t=dur+rnd(.5,1.1); } }

/* ---------- the run: loading, resetting, the stairs ---------- */
function towerLoad(i){ PL.y=0; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genTower(i); buildRack(); buildBoard(); resetGame(); if(XR.on) vrRecenter(); }
/* Novak's pistol, on the floor by his right hand, pushed toward you */
function proNovakGun(Nv){ if(FLOOR.pro.gun) return; FLOOR.pro.gun=true; const h=X_(Nv.B,PI_.hdR),d=norm3([PL.x-h[0],0,PL.z-h[2]]),p=[h[0]+d[0]*.25,.06,h[2]+d[2]*.25];
  const Mw=m4.compose(m4.make(),p,[0,Math.atan2(d[0],d[2]),Math.PI/2],[1,1,1]); addPickup(newItem('pistol'),Mw,v3.sc(d,.35),[0,0,0]); sfx('bump',.4,p); }
function towerReset(){ GAME.fade=0;
  if(FLOOR.def.pro){ genTower(FLOOR.idx); proStart(); return; }
  FLOOR.flanked=false; FLOOR.upT=null; twCast(); twLoot(); if(!GAME.kit&&FLOOR.def.kit) equip(HANDS.R,newItem(FLOOR.def.kit)); /* started here from the card: Novak's pistol */ if(XR.on) vrToast(FLOOR.def.name,2.5); }
function towerClimb(){ if(GAME.climbing) return; GAME.climbing=true;
  if(FLOOR.idx>=twLast()){ const nx=String(FLOOR.def.n+1).padStart(2,'0'); GAME.atTop=true; showMsg('THAT\'S AS FAR AS IT GOES',`Floor ${nx} isn\'t built yet.`); if(XR.on){ vrToast(`Floor ${nx} isn\'t built yet`,4); XR.clearT=5; } return; }
  const next=FLOOR.idx+1; FLOOR.next=next; GAME.fadeInT=0; try{ localStorage.setItem('stairwell.camp',String(next)); }catch(_){} }
function towerSaved(){ const q=new URLSearchParams(location.search); if(q.has('f')) return clamp(parseInt(q.get('f'),10)||0,0,twLast());
  try{ return clamp(parseInt(localStorage.getItem('stairwell.camp')||'0',10)||0,0,twLast()); }catch(_){ return 0; } }

/* the men looking for you: back to walking once they've calmed down, calling out into the dark, the flashlight moving ahead of them */
function twHunt(dt){ const slot=FLOOR.lights.length; let lit=false;
  for(const E of enemies){ if(!E.hunter) continue;
    if(E.dead){ E.torchOn=false; continue; }
    if(!E.aware&&E.st==='idle'&&(!E.mind||E.mind==='calm'||E.mind==='nervous')&&!E.goHome) E.st='alert';
    if(E.patrol&&E.patrol.wait>1.8) E.patrol.wait=rnd(.6,1.6); /* a quick look in each room, not a rest */
    if(!E.aware&&(!E.mind||E.mind==='calm')&&E.st==='alert'){ E.callT-=dt; if(E.callT<=0&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<7){ E.callT=rnd(5,8); const L=E.hunter.calls,txt=L[(E.callI=(E.callI??-1)+1)%L.length]; bark(E,txt,2.4); vox(E,'mutter',1.3); } }
    if(E.torchOn&&!lit&&slot<7){ lit=true; const f=[Math.sin(E.hd),Math.cos(E.hd)],p=[E.pos[0]+f[0]*1.9,.9,E.pos[1]+f[1]*1.9]; const q=[p[0],p[2]]; pushOutXZ(q,.1,'body'); L.plPos.set([q[0],1.0,q[1]],slot*3); L.plCol.set([1.25,1.2,1.05],slot*3); L.plDist[slot]=4.2; } }
  if(!lit&&slot<7) L.plCol.set([0,0,0],slot*3); }
/* in the tower they see you if you're in a pool of light, in a flashlight beam, right on top of them, or by your muzzle flash */
function towerSeen(E,dist){ if(dist<2.2||GAME.t-(GAME.shotT??-99)<1.4&&dist<16) return true;
  if(E.torchOn&&dist<8.5){ const f=[Math.sin(E.hd),Math.cos(E.hd)]; if((f[0]*(PL.x-E.pos[0])+f[1]*(PL.z-E.pos[1]))/dist>.85) return true; }
  for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0]; if(Math.hypot(p[0]-PL.x,p[2]-PL.z)<l[2]*.45&&sightClear([p[0],Math.max(p[1],1.2),p[2]],[PL.x,1.3,PL.z])) return true; }
  return false; }

/* lights that breathe: a TV, candles, a police car outside */
function twAnim(){ for(const a of FLOOR.anim||[]){ const c=FLOOR.lights[a.i][1],t=GAME.t+a.t0; let k=1,col=c;
  if(a.kind==='tv'){ k=.55+.3*Math.sin(t*7.1)+.25*Math.sin(t*17.3+1)+(Math.sin(t*1.3)>.85?.4:0); }
  else if(a.kind==='candle'){ k=.82+.1*Math.sin(t*9.7)+.08*Math.sin(t*23.1); }
  else if(a.kind==='police'){ const ph=(t*1.6)%2; col=ph<1?[1.6,.15,.12]:[.15,.3,1.7]; k=.35+.65*Math.max(0,Math.sin((ph%1)*Math.PI)); }
  L.plCol.set([col[0]*k,col[1]*k,col[2]*k],a.i*3); } }

function tickTower(dt){ twStairs(dt); document.body.classList.toggle('camp',FLOOR.mode==='camp'); /* no test panel in the campaign */ if(FLOOR.mode!=='camp') return; twAnim();
  if(!GAME.started) return;
  if(FLOOR.def.pro) proTick(dt); else { twTalk(dt*Math.max(GAME.ts,.3)); twHunt(dt); twRoles(dt*Math.max(GAME.ts,.3)); twCivTick(dt*Math.max(GAME.ts,.3)); }
  /* the street: now and then a dog, far off */
  GAME.dogT=(GAME.dogT??rnd(12,25))-dt; if(GAME.dogT<=0){ GAME.dogT=rnd(25,50); sfx('dog',.18,[rnd(-9,9),1.5,Math.random()<.5?7.5:-7.5]); } }



/* ---------- the tenants: people who live here and had nothing to do with it ----------
   They never fight. When they see you with a gun, hear shooting close by, or get hurt, they panic: close to you they drop to their
   knees and beg; further off they run for the back of their room first. Their scream carries, and the men on the floor hear it.
   Plain-clothes men look like tenants until they know you're here; then they draw. The floor's last line counts who you killed. */
const TW_CIVSCREAM=['No no no no—','Please! Please!','Don\'t shoot!','Oh God— oh God—','I live here! I live here!'];
function twCivPanic(E,why){ if(E.dead||E.panic) return; E.panic=true; E.aware=true; E.mind='civ'; E.lkp=null;
  const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z);
  if(GAME.barkGlobal<=0||why==='see'){ bark(E,pick(TW_CIVSCREAM),2.2); GAME.barkGlobal=.8; } vox(E,d<4?'cry':'scream',1); noise([E.pos[0],0,E.pos[1]],8,{from:E});
  if(d<3.6||E.st!=='idle'&&E.st!=='alert'){ if(E.st==='idle'||E.st==='alert') E.st='kneel'; return; }
  /* run for the far corner of the room, away from you */
  const u=twUnitOf(E.pos[0],E.pos[1]); let best=null,bs=-1;
  for(let k=0;k<30;k++){ const x=u?u.x0+.5+Math.random()*(u.w-1):E.pos[0]+rnd(-3,3),z=u?u.side*(2+Math.random()*3.6):E.pos[1]+rnd(-1,1); if(!twFree(x,z)) continue; const sc=Math.hypot(x-PL.x,z-PL.z)+(sightClear([PL.x,1.5,PL.z],[x,1.2,z])?-3:0); if(sc>bs){ bs=sc; best=[x,z]; } }
  if(!best){ E.st='kneel'; return; } E.flee=best; E.role='civflee'; E.st='alert'; }
function twCivTick(dt){ for(const E of enemies){ if(E.dead){ if(E.concealed&&!E.droppedHidden){ E.droppedHidden=true; E.wpnHeld=true; E.C.wpn.vis=true; dropWeapon(E); } continue; }
    if(E.civ&&E.role==='civflee'&&(E.st!=='alert'||!E.flee)) E.role=null;
    if(E.civ&&E.panic&&E.st==='kneel'&&E.barkCd<=0&&E.near&&GAME.barkGlobal<=0&&Math.random()<.3){ bark(E,E.extra,2.6); GAME.barkGlobal=1; }
    /* he knows: out comes the gun */
    if(E.concealed&&E.aware&&!E.wpnHeld&&(E.st==='alert')){ E.drawT=(E.drawT||0)+dt; if(E.drawT>.6){ E.wpnHeld=true; E.C.wpn.vis=true; setGrip(E.J,'R',true); sfx('click',.9,[E.pos[0],1.1,E.pos[1]]); E.atkCd=Math.max(E.atkCd,.5); } } } }
function twClearLine(){ const D=FLOOR.def,civ=enemies.filter(E=>E.civ),bad=enemies.filter(E=>!E.civ),cd=civ.filter(E=>E.dead).length;
  const W=['none','one','two','three','four','five','six','seven','eight'],w=k=>W[k]||String(k);
  let t=(D.clear&&D.clear[1])||''; if(civ.length) t+=' '+(cd===0?(civ.length===1?'The one who wasn\'t there is still breathing.':`The ${w(civ.length)} who weren't there are still breathing.`):cd===1?'You killed one who wasn\'t.':`You killed ${w(cd)} who weren't.`); return t; }

/* ---------- once they know you're here: hunters, holders, ambushers ----------
   Not everyone comes at once. When the floor goes loud each man gets a role:
   hunt    the nearest one or two come for you the ordinary way (the flashlight men always hunt)
   flank   one man with a blade goes quiet and goes round: through the next room, the knocked-through wall, the far end of the hall.
           He waits out of your sight, behind you or off to the side, and when you turn your back or walk past he comes screaming
   hold    the rest stay in their rooms on their toes: a gun deep in the room covering the doorway, a blade flat against the wall
           beside it. They fight you if you come in, and one of them comes out when a hunter goes down */
const TW_HOLD=['I got the door.','Come on in, cop.','I\'m not coming out there!','He\'s in the hall!','Come get it.','I can hear you breathing.'];
const TW_UP=['Fine— I\'m coming!','Where is he?!','Okay. Okay. I\'m going.','Cover me—'];
const TW_JUMP=['AAAAAH!','DIE, COP!','GOT YOU—','HERE!'];
const twMelee=E=>!RANGED[E.kind]&&!(typeof RANGED[E.kind.replace(/^m/,'')]!=='undefined'&&RANGED[E.kind.replace(/^m/,'')]);
const twUp=E=>!E.dead&&(E.st==='idle'||E.st==='alert');
function twUnitOf(x,z){ const c=navCell(x,z),id=c>=0?FLOOR.space[c]:-9; return FLOOR.units.find(u=>u.id===id)||null; }
function twFree(x,z){ const c=navCell(x,z); if(c<0||FLOOR.nav[c]) return false; const ci=c%NX; for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const q=c+a*NX+b; if(q<0||q>=FLOOR.nav.length||Math.abs((q%NX)-ci)>1||FLOOR.nav[q]) return false; } return true; } /* open all round: not in a doorway, not against a wall */
/* where a holder waits: a blade beside the doorway inside, a gun deep in the room looking at it */
function twHoldSpot(E){ let u=twUnitOf(E.home[0],E.home[1]); if(!u){ let bd=1e9; for(const v of FLOOR.units){ const d=Math.hypot(v.door-E.pos[0],v.side-E.pos[1]); if(d<bd){ bd=d; u=v; } } } if(!u) return null;
  const door=[u.door,u.side],cands=[];
  if(twMelee(E)){ for(const sx of [-1,1]) for(const dz of [.55,.75]){ const x=u.door+sx*.85,z=u.side*(1+dz); if(x>u.x0+.3&&x<u.x1-.3&&twFree(x,z)) cands.push([x,z]); } }
  else { for(let k=0;k<24;k++){ const x=u.x0+.5+Math.random()*(u.w-1),z=u.side*(3.6+Math.random()*1.9); if(twFree(x,z)&&sightClear([x,1.4,z],[door[0],1.3,door[1]])) cands.push([x,z]); } }
  if(!cands.length){ const q=navSpotNear(u.door,u.side*2.5,1.5); if(q) cands.push(q); } if(!cands.length) return null;
  const p=cands[Math.random()*cands.length|0]; return {x:p[0],z:p[1],hd:Math.atan2(door[0]-p[0],door[1]-p[1]),u}; }
/* where an ambusher waits: 3-9 m from you by foot, out of your sight, behind you or to the side, and reachable without passing you */
function twAmbushSpot(E){ const eye=[PL.x,1.6,PL.z],f=camBasis().f,fl=norm3([f[0],0,f[2]]),toF=fieldTo(PL.x,PL.z); if(!toF) return null; let best=null,bs=-1e9;
  for(let k=0;k<160;k++){ const i=Math.random()*NX|0,kk=Math.random()*NZ|0,c=kk*NX+i; if(FLOOR.nav[c]) continue; const x=cellX(i),z=cellZ(kk),d=toF[c];
    if(!(d>=60&&d<=190)||!twFree(x,z)) continue; if(Math.abs(x)>TL+.2) continue; if(sightClear(eye,[x,1.4,z])) continue;
    const v=norm3([x-PL.x,0,z-PL.z]),fw=v3.dot(v,fl); if(fw>.35) continue;
    if(enemies.some(O=>O!==E&&!O.dead&&Math.hypot(O.pos[0]-x,O.pos[1]-z)<1.2)) continue;
    /* his way there mustn't run past you */
    const F=fieldTo(x,z); if(!F) continue; let cc=navCell(E.pos[0],E.pos[1]),ok=F[cc]<1e9;
    for(let s=0;ok&&s<160&&F[cc]>0;s++){ const ci=cc%NX,ck=(cc-ci)/NX; let bq=cc,bd=F[cc]; for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++){ const ni=ci+b,nk=ck+a; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const q=nk*NX+ni; if(F[q]<bd){ bd=F[q]; bq=q; } } if(bq===cc) break; cc=bq;
      if(Math.hypot(cellX(cc%NX)-PL.x,cellZ((cc-cc%NX)/NX)-PL.z)<2.6) ok=false; }
    if(!ok) continue; const sc=-fw*2+Math.random()*.6-Math.abs(d-110)/120; if(sc>bs){ bs=sc; best=[x,z]; } }
  return best; }
function twFlank(E){ E.role='flank'; E.fl={ph:'go',t:0,spot:null}; E.silent=true; }
function twRoles(dt){ if(PL.dead) return;
  const awake=enemies.filter(E=>E.aware&&twUp(E)&&!E.ally&&!E.civ);
  for(const E of enemies) if(E.role&&(!E.aware||!twUp(E))){ if(E.role==='flank'&&!E.dead) E.silent=false; if(!E.aware) E.role=null; }
  const live=r=>awake.filter(E=>E.role===r);
  /* new to it: the flashlight men hunt; one blade flanks; two hunt; the rest hold */
  const fresh=awake.filter(E=>!E.role).sort((a,b)=>Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(b.pos[0]-PL.x,b.pos[1]-PL.z));
  for(const E of fresh){ if(E.hunter){ E.role='hunt'; continue; }
    if(!live('flank').length&&twMelee(E)&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>3.5){ twFlank(E); continue; }
    if(live('hunt').length<2){ E.role='hunt'; continue; }
    E.role='hold'; E.hold=twHoldSpot(E); E.holdT=rnd(4,9); }
  /* a hunter down: a holder comes out after a beat */
  if(live('hunt').length+live('flank').length<2){ FLOOR.upT=(FLOOR.upT??rnd(3,5))-dt; if(FLOOR.upT<=0){ FLOOR.upT=null; const H=live('hold').sort((a,b)=>Math.hypot(a.pos[0]-PL.x,a.pos[1]-PL.z)-Math.hypot(b.pos[0]-PL.x,b.pos[1]-PL.z))[0];
      if(H){ H.hold=null; if(!live('flank').length&&twMelee(H)) twFlank(H); else { H.role='hunt'; if(H.barkCd<=0) bark(H,pick(TW_UP),2.2); } } } } else FLOOR.upT=null;
  for(const E of awake){
    if(E.role==='hold'||E.role==='flank') E.lostT=0; /* on their toes: they don't drift off to search while they wait */
    if(E.role==='hold'){ E.holdT-=dt; if(E.holdT<=0){ E.holdT=rnd(7,13); if(!E.canSee&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<9&&E.barkCd<=0&&GAME.barkGlobal<=0){ bark(E,pick(TW_HOLD),2.2); GAME.barkGlobal=1; } }
      if(E.hold&&!E.canSee&&!E.moveDir){ let dh=E.hold.hd-E.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); E.hd+=clamp(dh,-2*dt,2*dt); } }
    if(E.role==='flank'){ E.barkCd=Math.max(E.barkCd,2); if(E.fl.ph!=='strike') E.atkCd=Math.max(E.atkCd,.5); } } }
/* called from think() for anyone aware with a role: {goal,chase} replaces what he'd do, or null for the ordinary hunt */
function twRoleMove(E,dt,fighting,dist){
  if(E.role==='civflee'){ const q=E.flee; if(!q) return {goal:null,chase:false}; if(Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1])<.5||dist<2.4||stuck(E,dt)){ E.flee=null; E.role=null; E.st='kneel'; return {goal:null,chase:false}; } return {goal:{x:q[0],z:q[1],sp:2.6},chase:false}; }
  if(E.role==='hold'){ const H=E.hold; if(!H) return {goal:null,chase:false};
    const pu=twUnitOf(PL.x,PL.z); if(pu&&pu===H.u&&dist<4.5) return null; /* you're in his room: he fights */
    if(fighting) return {goal:null,chase:twMelee(E)&&dist<2.2};
    const d=Math.hypot(E.pos[0]-H.x,E.pos[1]-H.z); if(d>.45) return {goal:{x:H.x,z:H.z,sp:1.7},chase:false}; E.moveDir=null; return {goal:null,chase:false}; }
  if(E.role==='flank'){ const F_=E.fl; F_.t+=dt;
    if(F_.ph==='strike'){ if(!F_.yelled&&dist<2.4){ F_.yelled=true; E.silent=false; bark(E,pick(TW_JUMP),1.6); vox(E,'scream',1.3); E.barkCd=3; } return {goal:{x:PL.x,z:PL.z,sp:3.4},chase:true}; }
    /* he's seen: you looking at him, close */
    const f=camBasis().f,to=norm3([E.pos[0]-PL.x,0,E.pos[1]-PL.z]),youSee=dist<7&&v3.dot(norm3([f[0],0,f[2]]),to)>.75&&sightClear([PL.x,1.6,PL.z],[E.pos[0],1.4,E.pos[1]]);
    const back=v3.dot(norm3([f[0],0,f[2]]),to)<.1;
    if(F_.ph==='wait'){ F_.wt=(F_.wt||0)+dt; if(back&&F_.wt>(F_.wl||(F_.wl=rnd(4,8)))) F_.go=true; else if(F_.wt>14){ F_.spot=null; F_.wt=0; F_.wl=0; } } /* waited long enough with your back to him */
    if(youSee||fighting&&(back||dist<2.6)||F_.ph==='wait'&&(dist<3.2||F_.go)){ F_.ph='strike'; return {goal:{x:PL.x,z:PL.z,sp:3.4},chase:true}; }
    if(!F_.spot||F_.t>12&&F_.ph==='go'||F_.ph==='wait'&&Math.hypot(F_.spot[0]-PL.x,F_.spot[1]-PL.z)>9.5){ F_.spot=twAmbushSpot(E); F_.t=0; F_.ph='go'; if(!F_.spot){ E.role='hunt'; E.silent=false; return null; } }
    const d=Math.hypot(E.pos[0]-F_.spot[0],E.pos[1]-F_.spot[1]);
    if(F_.ph==='go'&&d>.5){ if(stuck(E,dt)){ F_.spot=null; return {goal:null,chase:false}; } return {goal:{x:F_.spot[0],z:F_.spot[1],sp:2.3},chase:false}; }
    F_.ph='wait'; E.moveDir=null; const want=Math.atan2(PL.x-E.pos[0],PL.z-E.pos[1]); let dh=want-E.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); E.hd+=clamp(dh,-2*dt,2*dt); return {goal:null,chase:false}; }
  return null; }

/* ---------- the prologue: the lobby, the team, the tip that was a setup ---------- */
const PRO_TALK=[[2,'Novak','Ray. They\'re waiting on us.'],[6,'Dunne','Landlord\'s on fifteen. Quiet.'],[9.5,'Harris','Fifteen floors. No elevator.'],[12.5,'Harris','Pool\'s open. Who pukes first?'],
  [15.5,'Reyes','Shut up, Deuce.'],[18.5,'Novak','Is it always this quiet?'],[21.5,'Ibarra','Nobody on the corner tonight.'],[24.5,'Dunne','Stack up. Stairs. Go.']];
const PRO_NOVAK=['Ray... Ray, you there?','They walked right past us.','They think we\'re dead.','I can\'t feel my legs, man.','Don\'t go up there alone.','Here. Take it.','Tell my mom I—']; /* on 'Take it' his pistol is by his hand */
const PRO_SHOT_A=[13.2,2.75,.9],PRO_SHOT_B=[2.0,1.4,-1.5];
function proStart(){ FLOOR.pro={t:0,phase:'talk',said:0,ev:[]};
  for(const m of FLOOR.def.team){ const E=spawnEnemy({maker:(h,g)=>makeChar(m.id,h,g),name:m.name,x:m.x,z:m.z,hd:m.hd,extra:''}); E.ally=true; E.detail='your team'; enemies.push(E); }
  attachLabels(); GAME.fade=0; }
const twTeam=n=>enemies.find(E=>E.name===n);
function twHeartPt(E){ const B=E.B,ch=X_(B,PI_.chest),nk=X_(B,PI_.neck),Rs=frameFrom(X_(B,PI_.shL),X_(B,PI_.shR),ch,nk); return v3.add(v3.add(ch,v3.sc(v3.sub(nk,ch),.3)),v3.add(v3.sc(Rs[0],.035),v3.sc(Rs[2],.02))); }
function proShot(from,name,part){ const E=twTeam(name); if(!E||E.dead) return;
  const si={head:0,neck:1,chest:2,belly:3}[part],seg=SEGS[si],pt=part==='chest'?twHeartPt(E):part==='head'?X_(E.B,PI_.head):part==='neck'?X_(E.B,PI_.neck):v3.sc(v3.add(X_(E.B,PI_.pelvis),X_(E.B,PI_.chest)),.5);
  const d=norm3(v3.sub(pt,from)); muzzle(from,d,false); sfx('smg',1,from); hitEnemy(E,seg,pt,d,'gun'); }
function proSpray(from){ muzzle(from,norm3(v3.sub([PL.x,1.4,PL.z],from)),false); sfx('smg',.9,from); if(Math.random()<.6) sfx(Math.random()<.5?'whiz':'ric',.7,[PL.x+rnd(-1,1),1.5,PL.z+rnd(-1,1)]); }
function proHurt(){ XR.flash=.5; if(XR.on){ buzz('left',1,160); buzz('right',1,160); } const f=$('flash'); if(f){ f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); } screenBlood(3); sfx('hurt'); }
function proTick(dt){ const P=FLOOR.pro; if(!P) return; P.t+=dt;
  if(P.phase==='talk'){
    while(P.said<PRO_TALK.length&&P.t>=PRO_TALK[P.said][0]){ const [,n,txt]=PRO_TALK[P.said],E=twTeam(n); if(E&&!E.dead){ bark(E,txt,2.8); vox(E,'mutter',1); } P.said++; }
    if(P.t>=27||P.t>4&&PL.x>-6.6){ P.phase='ambush'; P.a=0; P.step=0; } return; }
  if(P.phase==='ambush'){ P.a+=dt; const a=P.a;
    const EV=[[0,()=>{ const D=twTeam('Dunne'); if(D) bark(D,'Contact—',1.6); sfx('door',.9,[11.5,1.2,0]); }],
      [.35,()=>{ sfx('glass',1,[-2.5,2.7,0]); FLOOR.flick=null; L.plCol.set([0,0,0],0); for(const t of FLOOR.proTubes) t.m.color=[.25,.26,.28]; FLOOR.proOut=true; }],
      [.5,()=>proShot(PRO_SHOT_A,'Dunne','head')],[.62,()=>proSpray(PRO_SHOT_A)],
      [.9,()=>proShot(PRO_SHOT_A,'Harris','neck')],[1.05,()=>{ sfx('glass',.8,[4,2.7,0]); L.plCol.set([0,0,0],6); }],
      [1.3,()=>proShot(PRO_SHOT_B,'Reyes','chest')],[1.45,()=>proSpray(PRO_SHOT_B)],
      [1.8,()=>proShot(PRO_SHOT_B,'Ibarra','belly')],[2.05,()=>proSpray(PRO_SHOT_A)],[2.3,()=>proShot(PRO_SHOT_A,'Ibarra','head')],
      [2.6,()=>proShot(PRO_SHOT_A,'Harris','head')],[2.75,()=>proSpray(PRO_SHOT_B)],
      [3.0,()=>{ proShot(PRO_SHOT_B,'Novak','belly'); const E=twTeam('Novak'); if(E&&!E.dead){ toDown(E,true); E.knocked=true; E.koT=1e9; for(const w of E.wounds) w.rate=Math.min(w.rate,.35); } }],
      [3.3,()=>{ proSpray(PRO_SHOT_B); proHurt(); }],[3.7,()=>{ proSpray(PRO_SHOT_A); proHurt(); }],[4.0,()=>{ sfx('heart'); }]];
    while(P.step<EV.length&&a>=EV[P.step][0]){ EV[P.step][1](); P.step++; }
    if(a>4.0) GAME.fade=clamp((a-4.0)/1.3,0,1);
    if(a>5.4){ P.phase='black'; P.b=0; P.beat=0;
      /* the men who did it take the guns. Ray goes down beside Novak */
      for(const E of enemies) if(E.ally&&E.C.wpn){ E.C.wpn.vis=false; E.wpnHeld=false; setGrip(E.J,'R',false); setGrip(E.J,'L',false); }
      const Nv=twTeam('Novak'); if(Nv){ const p=X_(Nv.B,PI_.pelvis),q=[p[0]-.85,p[2]-.35]; pushOutXZ(q,.3,'player'); FLOOR.start={x:q[0],z:q[1],yaw:Math.atan2(-(p[0]-q[0]),-(p[2]-q[1]))}; PL.x=q[0]; PL.z=q[1]; PL.yaw=FLOOR.start.yaw; if(XR.on) vrRecenter(); } }
    return; }
  if(P.phase==='black'){ P.b+=dt; P.beat-=dt; if(P.beat<=0){ P.beat=1.15; sfx('heart'); }
    if(P.b>5.5){ P.phase='wake'; P.w=0; P.line=0; P.lt=2.2; L.plCol.set([.9,.24,.12],12); FLOOR.lights[4][1]=[.9,.24,.12]; } return; }
  if(P.phase==='wake'){ P.w+=dt; GAME.fade=clamp(1-P.w/3.2,0,1); const Nv=twTeam('Novak');
    if(Nv&&!Nv.dead){ P.lt-=dt; if(P.lt<=0){ if(P.line<PRO_NOVAK.length){ const txt=PRO_NOVAK[P.line++],dur=clamp(1.4+txt.length*.06,2,3.4); bark(Nv,txt,dur); vox(Nv,P.line>4?'whimper':'plead',.8); P.lt=dur+1.1; if(txt.startsWith('Here.')) proNovakGun(Nv); }
        else { Nv.dieT=.05; P.phase='alone'; } } Nv.barkCd=9; }
    else if(P.w>4) P.phase='alone';
    return; } }

/* ---------- the start card: which floor ---------- */
function towerBoot(){ const i=towerSaved(); genTower(i); buildRack(); buildBoard();
  const row=$('lvlRow'); if(!row) return;
  /* one button per built floor, generated from TOWER, before the motel and test buttons */
  const ref=row.querySelector('[data-lvl="motel"]')||row.querySelector('[data-lvl="test"]');
  for(const b of [...row.querySelectorAll('[data-lvl]')]) if(/^\d+$/.test(b.dataset.lvl)) b.remove();
  TOWER.forEach((D,k)=>{ const b=document.createElement('button'); b.className='btn'; b.type='button'; b.dataset.lvl=String(k); b.setAttribute('aria-pressed','false'); b.textContent=D.pro?'The lobby':D.name; row.insertBefore(b,ref); });
  const btns=[...row.querySelectorAll('[data-lvl]')], mark=k=>btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lvl===String(k))));
  mark(i);
  for(const b of btns) b.addEventListener('click',()=>{ audio(); GAME.kit=null; const v=b.dataset.lvl; mark(v);
    if(v==='test'){ FLOOR.camp=false; GAME.fade=0; goStash(); } else if(v==='motel'){ FLOOR.camp=false; GAME.fade=0; goMotel(); } else { try{ localStorage.setItem('stairwell.camp',v); }catch(_){} towerLoad(+v); } }); }

/* ---------- the stairwells ----------
   Each is a real switchback in a 4 x 4 m shaft (|x| 10..14, |z| < 2): the landing you stand on (|x| 10..10.8), flight A up the
   z > 0 side to a half landing at 1.4 m (|x| 12.96..14), flight B back up the z < 0 side to the next landing at 2.8 m. The same
   repeats a storey below (its B is the flight down, behind a chained gate) and a storey above, under a cap at 5.6 m.
   Eight risers of .175 m, treads of .27 m. You walk up them: your height follows the steps (twStairY). */
const ST_X0=10.8,ST_RUN=2.16,ST_MID=12.96,ST_TOP=14,ST_N=8;
function twBoxes(list,x0,x1,y0,y1,z0,z1){ /* a wall as boxes no bigger than ~1.5 m, so the per-vertex lights have points to land on */
  const nx=Math.max(1,Math.ceil((x1-x0)/1.5)),ny=Math.max(1,Math.ceil((y1-y0)/1.4)),nz=Math.max(1,Math.ceil((z1-z0)/1.5));
  for(let i=0;i<nx;i++) for(let j=0;j<ny;j++) for(let k=0;k<nz;k++){ const a=x0+(x1-x0)*i/nx,b=x0+(x1-x0)*(i+1)/nx,c=y0+(y1-y0)*j/ny,d=y0+(y1-y0)*(j+1)/ny,e=z0+(z1-z0)*k/nz,f=z0+(z1-z0)*(k+1)/nz;
    list.push([(a+b)/2,(c+d)/2,(e+f)/2,b-a,d-c,f-e,Math.max(b-a,f-e)/1.5,(d-c)/2.8]); } }
function twShaft(G,sx,role,n,blocked){
  const X=v=>sx*(v+TO()), wl=[], st=[], cm=M(tConcrete,{repeat:[1,1]});
  /* the shaft's walls, a storey below to a storey above; the header over the corridor opening and the pit wall under the landing */
  twBoxes(wl,Math.min(X(10),X(14)),Math.max(X(10),X(14)),-3,5.6,1.93,2.07); twBoxes(wl,Math.min(X(10),X(14)),Math.max(X(10),X(14)),-3,5.6,-2.07,-1.93);
  twBoxes(wl,Math.min(X(13.93),X(14.07)),Math.max(X(13.93),X(14.07)),-3,5.6,-2,2);
  twBoxes(wl,Math.min(X(9.93),X(10.07)),Math.max(X(9.93),X(10.07)),RH,5.6,-2,2); twBoxes(wl,Math.min(X(9.93),X(10.07)),Math.max(X(9.93),X(10.07)),-3,0,-2,2);
  /* the core wall between the two flights, top to bottom */
  twBoxes(wl,Math.min(X(ST_X0),X(ST_MID)),Math.max(X(ST_X0),X(ST_MID)),-3,5.6,-.07,.07);
  mk(mergeBoxes(wl),M(tStairWall),G);
  for(const e of wl) if(Math.abs(e[1])<3.5) addBox(e[0]-e[3]/2,e[0]+e[3]/2,e[2]-e[5]/2,e[2]+e[5]/2,e[1]-e[4]/2,e[1]+e[4]/2,'wall');
  /* three storeys of stairs: below (only its flight B and half landing show), this one, above */
  for(const L of [-RH,0,RH]){
    if(L!==0) twBoxes(st,Math.min(X(10),X(ST_X0)),Math.max(X(10),X(ST_X0)),L-.2,L,-1.93,1.93); /* the landing (this storey's is the floor) */
    twBoxes(st,Math.min(X(ST_MID),X(13.93)),Math.max(X(ST_MID),X(13.93)),L+1.2,L+1.4,-1.93,1.93); /* the half landing */
    for(let k=0;k<ST_N;k++){ const r=.175,t=ST_RUN/ST_N;
      if(L>-RH){ const xa=ST_X0+k*t,xb=xa+t,top=L+(k+1)*r; st.push([X((xa+xb)/2),top-.17,1.0,t,.34,1.86,1,.3]); } /* flight A, z > 0 */
      { const xb=ST_MID-k*t,xa=xb-t,top=L+1.4+(k+1)*r; st.push([X((xa+xb)/2),top-.17,-1.0,t,.34,1.86,1,.3]); } } } /* flight B, z < 0 */
  mk(mergeBoxes(st),cm,G);
  mk(plane(.8,4,1,4),M(tConcrete,{repeat:[.4,2]}),G,X(10.4),.004,0,-Math.PI/2);
  mk(plane(4,4,4,4),M(null,{color:0x0a0a0c}),G,X(12),-2.95,0,-Math.PI/2); mk(plane(4,4,4,4),M(tConcrete,{color:0x3a3a3a}),G,X(12),5.6,0,Math.PI/2);
  /* handrails along the outer walls, one per flight */
  const ang=Math.atan2(1.4,ST_RUN),len=Math.hypot(1.4,ST_RUN);
  for(const L of [-RH,0,RH]){ mk(box(len,.04,.04),mSteel,G,X(ST_X0+ST_RUN/2),L+.7+.9,1.88,0,0,sx*ang); mk(box(len,.04,.04),mSteel,G,X(ST_X0+ST_RUN/2),L+2.1+.9,-1.88,0,0,-sx*ang); }
  /* the way down: a chained gate across the top of the flight you came up */
  const gx=X(10.85); for(let z=-1.85;z<-.1;z+=.16) mk(box(.025,1.05,.025),mSteel,G,gx,.525,z); mk(box(.05,.05,1.9),mSteel,G,gx,1.05,-1.0); mk(box(.05,.05,1.9),mSteel,G,gx,.12,-1.0);
  mk(torus(.05,.008,4,8),mSteel,G,gx+sx*.03,.6,-.6,0,Math.PI/2,0); mk(torus(.05,.008,4,8),mSteel,G,gx+sx*.03,.55,-.66,Math.PI/2,0,0);
  addBox(Math.min(gx-.06,gx+.06),Math.max(gx-.06,gx+.06),-1.95,-.07,0,1.1,'rail');
  /* the west stairwell's way up is blocked: they piled the furniture on it */
  if(role==='in'){ const b=N(G,X(11.3),0,1.0); mk(box(.95,.18,1.85),M(tMattress),b,0,.95,0,0,0,sx*.55); mk(box(.7,.7,1.7),F(M(tFridge),M(tFridge)),b,sx*.15,.35,.05,0,.2,Math.PI/2);
    for(const [x,z,y] of [[-.35,-.5,.2],[.25,.55,.25]]) mk(box(.5,.45,.5,{at:[0,.225,0]}),M(tCrate),b,sx*x,y,z,0,.5,0); mk(box(.9,.05,.7),M(tWoodLight),b,sx*.1,1.15,.3,.5,.3,.2);
    addBox(Math.min(X(10.8),X(11.9)),Math.max(X(10.8),X(11.9)),.07,1.95,0,1.8,'barricade'); }
  /* a caged lamp on the end wall over the half landing */
  mk(box(.16,.2,.1),M(null,{color:0x1a1a1a}),G,X(13.88),3.25,.9); mk(box(.08,.11,.05),M(tBulb,{unlit:true}),G,X(13.8),3.25,.9);
  /* the floor number on the end of the core wall, facing the corridor */
  mk(plane(.8,.4),M(floorNum(role==='up'?Math.min(15,n+1):n),{cut:true}),G,X(ST_X0-.075),1.75,0,0,sx>0?-Math.PI/2:Math.PI/2,0);
  blocked.push([Math.min(X(ST_X0-.05),X(14.1)),-2.1,Math.max(X(ST_X0-.05),X(14.1)),2.1]); }
/* the lobby's west end: a vestibule and the glass doors to the street */
function twVestibule(G,blocked){ const wl=[]; twBoxes(wl,-14,-10,0,RH,1.93,2.07); twBoxes(wl,-14,-10,0,RH,-2.07,-1.93); twBoxes(wl,-14.07,-13.93,0,RH,-2,2);
  mk(mergeBoxes(wl),M(tStairWall),G); for(const e of wl) addBox(e[0]-e[3]/2,e[0]+e[3]/2,e[2]-e[5]/2,e[2]+e[5]/2,e[1]-e[4]/2,e[1]+e[4]/2,'wall');
  mk(plane(4,4,4,4),M(tLinoHall,{repeat:[2,2]}),G,-12,.004,0,-Math.PI/2); mk(plane(4,4,4,4),M(tConcrete,{color:0x6a6866}),G,-12,RH,0,Math.PI/2);
  mk(cyl(.004,.004,.4,3),mBlack,G,-11.8,2.6,0); mk(box(.08,.1,.08),M(tBulb,{unlit:true}),G,-11.8,2.36,0); }
/* your height on the stairs: whichever surface under you is nearest where you are now (the flights never cross at one height) */
function twStairY(x,z,cy){ const ax=Math.abs(x)-TO(); if(FLOOR.mode!=='camp'||ax<10||Math.abs(z)>2.1||FLOOR.def.pro&&x<0) return 0;
  if(ax<ST_X0) return cy>2.1?RH:0;
  if(ax>=ST_MID) return 1.4;
  const t=clamp((ax-ST_X0)/ST_RUN,0,1); if(z>0) return 1.4*t; return cy<.7?0:1.4+1.4*(1-t); }
function twStairs(dt){ const target=twStairY(PL.x,PL.z,PL.y||0); PL.y=lerp(PL.y||0,target,Math.min(1,dt*14)); if(Math.abs(PL.y-target)<.004) PL.y=target;
  if(XR.on&&XR.baseY!=null) XR.origin[1]=XR.baseY+PL.y;
  /* step onto the east landing: fade to black and you're on the next floor's landing (no walking the flights) */
  if(FLOOR.mode!=='camp'||!GAME.started||PL.dead) return;
  if(!GAME.climbing&&PL.x>TL+.45&&Math.abs(PL.z)<1.9) towerClimb();
  if(GAME.atTop&&PL.x<TL+.15){ GAME.atTop=false; GAME.climbing=false; } /* top floor so far: back out into the corridor re-arms it */
  if(GAME.fadeInT!=null){ GAME.fadeInT+=dt; GAME.fade=clamp(GAME.fadeInT/.4,0,1);
    if(GAME.fadeInT>=.5){ GAME.fadeInT=null; carryInto(()=>towerLoad(FLOOR.next)); GAME.climbing=false; GAME.fade=1; GAME.fadeOut=.6; } }
  if(GAME.fadeOut>0){ GAME.fadeOut-=dt; GAME.fade=clamp(GAME.fadeOut/.6,0,1); } }
