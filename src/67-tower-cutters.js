/* =====================================================================
   THE TOWER, floors 04-06: the cutters. The drug floors. Machetes, more men, and the lab on 06.
   Same 26 x 12 m storey as 01-03 (66-tower.js): small dark rooms, a few warm pools, men close enough to see.
   Pushed onto TOWER, so the start card and the climb pick them up on their own.
   ===================================================================== */

/* ---------- the details ---------- */
/* the team's ballistic shield, laid across two crates for a cutting table: no lettering, two rounds in it */
const tTw4Shield=cl(16,24,'#34363b',8,4401,g=>{ R(g,'#141517',0,0,16,1); R(g,'#141517',0,23,16,1); R(g,'#141517',0,0,1,24); R(g,'#141517',15,0,1,24);
  R(g,'#0e1218',3,2,10,5); R(g,'#4a6a88',4,3,8,3); R(g,'#9ab4cc',4,3,4,1); R(g,'#2a3a4c',8,5,4,1);
  for(const [x,y] of [[5,13],[10,17]]){ R(g,'#8a8c90',x-1,y-1,3,3); R(g,'#d8dade',x,y,1,1); R(g,'#1a1a1c',x-2,y,1,1); }
  R(g,'#24262a',2,20,12,2); R(g,'#4a4c52',2,9,12,1); });
/* his father in the cane, with the same machete */
const tTw4Father=tex(12,16,'#d8ccb0',g=>{ R(g,'#c9b88a',1,1,10,6); R(g,'#6a6a3a',1,7,10,8); for(let x=1;x<11;x+=2) R(g,'#8a8a4a',x,6,1,9); R(g,'#3a2a1a',4,2,4,1); R(g,'#3a2a1a',5,1,2,1); R(g,'#8a6a4a',5,3,2,2); R(g,'#e8e2cf',4,5,4,5); R(g,'#5a4a3a',8,6,1,5); R(g,'#a8a8a0',9,4,1,3); });
/* Ibarra's wallet, open: his federal ID one side, his wife and kids the other */
const tTw4Ident=tex(12,8,'#e8e4d8',g=>{ R(g,'#2a6a4a',0,0,12,2); R(g,'#b98a62',1,3,3,4); R(g,'#2a1a10',1,3,3,1); R(g,'#7a7468',5,3,6,1); R(g,'#7a7468',5,5,5,1); R(g,'#c9a23a',9,6,2,2); });
const tTw4Family=tex(12,8,'#7d9ab0',g=>{ R(g,'#4f6e3e',0,6,12,2); R(g,'#c9945a',2,2,2,2); R(g,'#3a2418',2,1,2,1); R(g,'#e05a7a',2,4,2,3); R(g,'#c9945a',6,3,2,2); R(g,'#3a6ad0',6,5,2,2); R(g,'#c9945a',9,4,1,1); R(g,'#f2c230',9,5,1,2); });
const tTw4Scale=tex(16,8,'#3a3c40',g=>{ R(g,'#0e1a10',2,2,12,4); text(g,'1000',3,2,'#7ad07a'); });
const tTw4Boxes=cl(16,16,'#9a8a6a',12,4404,g=>{ R(g,'#7a6a4a',0,7,16,2); text(g,'FRIJOL',0,10,'#5a2a1a'); });
/* the count floor */
const tTw5Counter=tex(16,8,'#5a5c60',g=>{ R(g,'#2a2b2e',1,1,14,2); R(g,'#0e1a10',9,4,6,3); text(g,'58',10,4,'#e8a24a'); });
const tTw5Invite=tex(10,14,'#f2ecdc',g=>{ R(g,'#c9a23a',0,0,10,1); R(g,'#c9a23a',0,13,10,1); R(g,'#c9a23a',0,0,1,14); R(g,'#c9a23a',9,0,1,14); R(g,'#8a7a5a',2,3,6,1); R(g,'#c9a23a',4,5,2,2); for(const y of [9,11]) R(g,'#8a7a5a',2,y,6,1); });
const tTw5Sono=tex(12,10,'#0a0a0c',g=>{ for(let y=1;y<9;y++){ const w=y; R(g,'#3a3a3e',6-w/2|0,y,w,1); } R(g,'#9a9a9e',5,4,3,2); R(g,'#7a7a7e',4,5,1,1); R(g,'#e8e2cf',0,0,12,1); });
const tTw5Duffel=cl(16,8,'#1e2530',10,4504,g=>{ R(g,'#0e1218',0,3,16,1); R(g,'#8a8e92',2,3,1,1); R(g,'#2e3646',0,0,16,1); });
const tTw5Foam=cl(16,16,'#55575c',10,4505,g=>{ for(let y=0;y<16;y+=3) for(let x=(y%2)*2;x<16;x+=4) R(g,'#6a6c72',x,y,2,2); R(g,'#2a2b2e',1,1,14,2); });
const tTw5Bricks=cl(16,16,'#b89a62',12,4506,g=>{ for(let y=0;y<16;y+=4) R(g,'#6a5432',0,y+3,16,1); for(let y=0;y<16;y+=4) R(g,'#6a5432',((y>>2)&1)*4+3,y,1,4); R(g,'#d8c8a0',1,1,5,1); R(g,'#d8c8a0',9,5,4,1); R(g,'#e8e2cf',5,9,3,2); });
/* the lab */
const tTw6Plastic=cl(16,32,'#aab4a8',8,4601,g=>{ for(const x of [2,7,12]) R(g,'#c4ccbe',x,0,2,32); for(const x of [5,10,15]) R(g,'#8e988c',x,0,1,32); R(g,'#c9b07a',0,0,16,2); R(g,'rgba(120,130,40,.25)',3,22,9,8); });
const tTw6Conc=cl(32,32,'#4e4e4a',14,4603,g=>{ const r=rng(4604); for(let i=0;i<5;i++){ const x=r()*26|0,y=r()*26|0; R(g,r()>.5?'rgba(150,160,40,.35)':'rgba(20,20,18,.45)',x,y,5+(r()*5|0),3+(r()*5|0)); } R(g,'#3a3a36',0,15,32,1); R(g,'#3a3a36',15,0,1,32); });
/* drums with a stencilled label, twice round: where they came from */
const tTw6Drum=cl(40,16,'#3a4a5a',10,4605,g=>{ R(g,'#2a3644',0,1,40,1); R(g,'#2a3644',0,15,40,1); R(g,'#e8e2cf',4,3,32,12); text(g,'EL PASO',6,4,'#a8241c'); text(g,'TX',16,9,'#1e2530'); });
const tTw6Blue=cl(40,16,'#2a5aa0',8,4606,g=>{ R(g,'#1e4a88',0,1,40,1); R(g,'#1e4a88',0,15,40,1); R(g,'#e8e2cf',4,3,32,12); text(g,'EL PASO',6,4,'#1e2530'); text(g,'TX',16,9,'#a8241c'); });
const tTw6Gen=cl(16,16,'#b8902a',10,4607,g=>{ R(g,'#1a1b1d',2,2,12,7); R(g,'#3a3c40',3,3,4,2); R(g,'#a8241c',10,3,2,2); for(let x=2;x<14;x+=2) R(g,'#2a2b2d',x,11,1,4); });
const tTw6Suit=cl(8,16,'#dcdcd4',8,4608,g=>{ R(g,'#b8b8b0',3,0,1,16); R(g,'#a8a8a0',0,7,8,1); R(g,'rgba(120,130,40,.3)',1,11,6,5); });
const tTw6Crystal=cl(16,8,'#c8d4dc',20,4609,g=>{ specks(g,'#f2f6f8',30,4610,16,8); specks(g,'#8aa0b0',12,4611,16,8); });
const tTw6Can=cl(8,8,'#a8241c',8,4612,g=>{ R(g,'#7a1a14',0,2,8,1); R(g,'#7a1a14',0,6,8,1); });
const tTwFilter=tex(8,4,'#8a6a2a',g=>R(g,'#c9a23a',0,1,8,1));
const tTwRadio=tex(8,6,'#4a3a2a',g=>{ R(g,'#2a2018',1,1,4,4); R(g,'#e8c860',5,1,2,2); });
/* the lab's walls: bare block, painted in the floor's panels (66-tower.js: 1.2 m across, floor to ceiling down); its floor: concrete with chemical stains */
TW_PAPER.cinder=twPaint('#6e6c66',4602,(g,w,h)=>{ for(let y=0,c=0;y<h;y+=4,c++){ R(g,'rgba(30,30,28,.45)',0,y,w,1); for(let x=(c&1)*5;x<w;x+=10) R(g,'rgba(30,30,28,.45)',x,y,1,4); }
  vfill(g,0,h*.75,w,h*.25,[[0,'rgba(60,80,20,0)'],[1,'rgba(60,80,20,.35)']]); },{skirt:false,grime:1.4});
TW_FLOORS.lab=tTw6Conc;

const mTwRubber=M(null,{color:0x1c1d1f}), mTwPowder=M(null,{color:0xe8e6e0}), mTwBag=M(null,{color:0xd0d4d0}), mTwGlass=M(null,{color:0xa8c0b8,double:true}),
  mTwSick=M(null,{color:0xc8d05a,unlit:true}), mTwGreenL=M(null,{color:0x7ad06a,unlit:true}), mTwMilk=M(null,{color:0xd8dcd0,unlit:true}), mTwPlastic=M(tTw6Plastic,{double:true}), mTwDrum=M(tTw6Drum,{repeat:[2,1]}), mTwBlueDrum=M(tTw6Blue,{repeat:[2,1]});

/* a respirator on a man's face (where:'neck' = hanging off his neck, pulled down) */
const mTwFilter=[M(tTwFilter),M(null,{color:0x6a5a2a}),mTwRubber];
function twMaskOn(J,o,where){ const hs=o.headS||1;
  if(where==='neck'){ const n=N(J.neck,0,.0,.075,.5,0,0); mk(box(.09,.06,.05),mTwRubber,n); for(const s of [1,-1]) mk(cyl(.022,.022,.03,6),mTwFilter,n,s*.045,-.01,.012,Math.PI/2,0,0); return; }
  const n=N(J.head,0,.062*hs,.098*hs,-.1,0,0); mk(box(.085,.065,.05,{tw:.8,td:.8}),mTwRubber,n);
  for(const s of [1,-1]) mk(cyl(.024,.024,.032,8),mTwFilter,n,s*.05,-.012,.012,Math.PI/2,s*.55,0);
  mk(box(.15*hs,.014,.15*hs),mTwRubber,J.head,0,.07*hs,-.005); /* the strap round the back */
  /* goggles */
  mk(box(.13*hs,.034,.03),mTwRubber,J.head,0,.128*hs,.082*hs); for(const s of [1,-1]) mk(plane(.042,.022),M(null,{color:0x5a6a5a,unlit:true}),J.head,s*.032*hs,.128*hs,.098*hs);
  mk(box(.16*hs,.012,.15*hs),mTwRubber,J.head,0,.128*hs,-.005); }
const twMasked=(make,where)=>(p,g)=>{ const C=make(p,g); twMaskOn(C.J,C.o,where); return C; };
Object.assign(TW_MAKERS,{mcutter:twMasked(makeCutter),mgunman:twMasked(makeGunman),menforcer:twMasked(makeEnforcer),ngunman:twMasked(makeGunman,'neck')});

/* a bulb hanging low on a long wire (over a table), y = the bulb */
function twLowBulb(x,y,z){ mk(cyl(.004,.004,RH-y-.05,3),mBlack,floorN,x,(RH+y)/2,z); mk(box(.09,.11,.09),M(tBulb,{unlit:true}),floorN,x,y,z); }
/* a solid crate-ish thing that blocks walking: visual box + collision to its top */
function twSolid(w,h,d,mat,x,z,ry=0,y0=0){ const n=mk(box(w,h,d),mat,floorN,x,y0+h/2,z,0,ry,0); const s=Math.abs(Math.sin(ry))>.5,ww=s?d:w,dd=s?w:d; addBox(x-ww/2,x+ww/2,z-dd/2,z+dd/2,y0,y0+h,'furn'); return n; }
/* a drum: one mesh (the rolling rings are painted on, it keeps the draw count down) */
function twDrum(x,z,mat,ry=0){ const n=N(floorN,x,0,z,0,ry,0); mk(cyl(.29,.29,.88,10,{at:[0,.44,0]}),[mat,M(null,{color:0x2a2c2e}),mat],n);
  addBox(x-.29,x+.29,z-.29,z+.29,0,.88,'furn'); return n; }
/* a steel lab table: frame, a top, a shelf underneath; solid to its top */
function twLabTable(x,z,len=1.8,dep=.8){ const t=M(tSteel); mk(box(len,.04,dep),t,floorN,x,.9,z); mk(box(len-.1,.02,dep-.1),t,floorN,x,.25,z);
  for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) mk(box(.04,.9,.04,{at:[0,.45,0]}),mSteel,floorN,x+a*(len/2-.04),0,z+b*(dep/2-.04));
  addBox(x-len/2,x+len/2,z-dep/2,z+dep/2,0,.92,'furn'); }
/* a strip curtain: hanging plastic strips across x (axis 'x') or z, from a to b at c */
function twStrips(axis,c,a,b,y0=.05){ const r=rng(Math.round(c*100+a*7)&0xffff); for(let s=a+.15;s<b-.08;s+=.34){ if(r()<.28) continue; /* a few torn down */
    const y=y0+(r()<.25?r()*.6:0),h=RH-y-.02,ry=(axis==='x'?0:Math.PI/2)+(r()-.5)*.3,j=(r()-.5)*.05;
    if(axis==='x') mk(plane(.25,h,1,3),mTwPlastic,floorN,s,y+h/2,c+j,0,ry,0); else mk(plane(.25,h,1,3),mTwPlastic,floorN,c+j,y+h/2,s,0,ry,0); }
  if(axis==='x') mk(box(b-a,.04,.04),mSteel,floorN,(a+b)/2,RH-.03,c); else mk(box(.04,.04,b-a),mSteel,floorN,c,RH-.03,(a+b)/2); }
/* plastic sheeting taped flat over a wall: faces the room (ry), w wide */
function twSheet(x,z,ry,w){ mk(plane(w,RH-.1,Math.ceil(w/1.2),3),mTwPlastic,floorN,x,(RH-.1)/2+.05,z,0,ry,0); }
/* glassware */
/* the liquid is the outside of the bottom half (the glass can't be see-through here), glass above the fill line */
function twFlask(x,y,z,s=1,liq=mTwSick){ mk(lathe([[0,.02*s,.02*s],[.03*s,.07*s,.07*s],[.085*s,.075*s,.075*s]],8),liq,floorN,x,y,z);
  mk(lathe([[.085*s,.075*s,.075*s],[.15*s,.04*s,.04*s],[.19*s,.018*s,.018*s],[.28*s,.016*s,.016*s]],8,{capB:false}),mTwGlass,floorN,x,y,z); }
function twBeaker(x,y,z,s=1,liq=mTwMilk){ mk(cyl(.04*s,.04*s,.07*s,8,{at:[0,.035*s,0]}),liq,floorN,x,y,z); mk(cyl(.04*s,.04*s,.05*s,8,{at:[0,.095*s,0],open:true}),mTwGlass,floorN,x,y,z); }
/* product: a pile of powder, a few bags */
function twPowder(x,y,z,s=1){ mk(cyl(.025*s,.09*s,.03*s,7,{at:[0,.015*s,0]}),mTwPowder,floorN,x,y,z); }
function twBags(x,y,z,n,seed){ const r=rng(seed); for(let i=0;i<n;i++) mk(box(.055,.012,.075),mTwBag,floorN,x+(r()-.5)*.25,y+.006+(i%3)*.012,z+(r()-.5)*.18,0,r()*3,0); }

/* ---------- the floors ---------- */
TOWER.push(
  /* 04: the packing floor. They cut it on the team's shield, under the girl's rosary. Emilio washes his father's machete.
     Beto has Ibarra's phone, and somebody in El Paso keeps calling it. Lalo walks the floor with a flashlight. */
  { n:4,name:'Floor 04',kit:'pistol',wall:'nicotine',floor:'lino',
    units:[{side:1,x0:-10,x1:-4.4,door:-5.4,paper:'concrete',fl:'conc'},{side:1,x0:-4.4,x1:2.6,door:-1.2,win:true,winX:-.9,hole:4.6,paper:'tile',fl:'tile'},{side:1,x0:2.6,x1:10,door:7.0,win:true,winX:5.0,paper:'peel',fl:'conc'},
      {side:-1,x0:-10,x1:-3.4,door:-4.4,win:true,winX:-7.0,paper:'pink',fl:'rug'},{side:-1,x0:-3.4,x1:3.8,door:2.8,win:true,winX:0,paper:'cream',fl:'oak'},{side:-1,x0:3.8,x1:10,door:6.2,win:true,hole:3.4}],
    build(A){ A.tube(-8,'dead'); A.tube(-4,'dead'); A.tube(1,'on'); A.tube(5,'dead'); A.tube(8.5,'dead');
      A.light([1,2.5,0],[1.0,1.08,1.2],5.8,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the packing room: no window. The shield across two crates, a hot bulb low over it, Reyes's rosary hung on the wire */
      { const x=-7.4,z=3.7; for(const s of [-1,1]){ mk(box(.5,.38,.36,{at:[0,.19,0]}),M(tCrate),floorN,x,0,z+s*.34,0,s*.06,0); mk(box(.48,.38,.34,{at:[0,.19,0]}),M(tCrate),floorN,x,.38,z+s*.34,0,-s*.05,0); }
        mk(box(.62,.035,1.05),F(mBlack,mBlack,mBlack,M(tTw4Shield)),floorN,x,.78,z,0,.04,0);
        addBox(x-.32,x+.32,z-.54,z+.54,0,.82,'furn');
        twPowder(x-.1,.8,z+.12,1.2); twPowder(x+.12,.8,z-.22,.7); twBags(x+.14,.8,z+.3,9,4410); twBags(x-.12,.8,z-.36,5,4411);
        for(const [bx,bz] of [[x-.16,z+.4],[x-.02,z+.43]]) A.blk(.16,.08,.11,M(tTwBrick),bx,.84,bz,.4);
        A.blk(.18,.05,.12,M(tTw4Scale),x+.15,.825,z-.02,Math.PI/2); A.blk(.008,.002,.11,mSteel,x-.04,.8,z+.02,.7); /* a razor */
        twLowBulb(x,1.92,z); A.light([x,1.78,z],[1.85,1.2,.6],4.6);
        /* the rosary: wooden beads in a loop off the wire, a small cross */
        for(let k=0;k<14;k++){ const a=k/14*Math.PI*2; mk(box(.012,.012,.012),mWood,floorN,x+Math.sin(a)*.045,2.08-(1-Math.cos(a))*.06,z+.005); }
        mk(box(.008,.04,.006),mWood,floorN,x,1.94,z+.005); mk(box(.026,.008,.006),mWood,floorN,x,1.95,z+.005); }
      A.furn('crates',-9.2,5.45,Math.PI); A.furn('trash',-9.4,1.75,0);
      for(const [bx,bz,by] of [[-6.6,5.6,.25],[-6.0,5.6,.25],[-6.3,5.6,.75]]) A.blk(.55,.5,.5,M(tTw4Boxes),bx,by,bz,0,by<.5);
      /* Emilio's kitchen: the sink under the window, the water pink. His father on the wall, in the cane, with the same machete */
      A.furn('counter',-1.0,5.62,Math.PI); A.furn('fridge',1.95,5.6,Math.PI); A.furn('trash',1.9,1.7,0);
      A.blk(.5,.02,.38,M(null,{color:0x8a3a36}),-1.3,.93,5.6); /* the water in the sink */
      A.blk(.12,.18,.12,M(null,{color:0xd8d4c8}),-.55,1.01,5.75); /* a bottle of bleach */
      A.pic(tTw4Father,.35,1.5,5.926,Math.PI,.15,.2);
      A.bulb(-1.0,4.4,true); A.light([-1.0,2.2,4.4],[1.5,.95,.5],5);
      A.furn('table',-2.8,2.6,Math.PI/2);
      /* the storeroom: dark. Bean boxes with the product under the beans */
      A.furn('crates',4.0,5.4,Math.PI); A.furn('mattress',8.7,5.3,Math.PI);
      for(const [bx,bz,by] of [[5.6,5.6,.25],[6.2,5.6,.25],[5.9,5.6,.75],[9.4,2.0,.25],[9.4,2.6,.25]]) A.blk(.55,.5,.5,M(tTw4Boxes),bx,by,bz,0,by<.5);
      A.bulb(6.3,3.5,false);
      /* south: a dark bedroom */
      A.furn('bed',-8.5,-5.45,0); A.furn('wardrobe',-5.6,-5.65,0); A.furn('trash',-9.4,-1.75,0); A.bulb(-7,-3.5,false);
      /* Beto's room: a lamp, the couch, a white shirt pressed on the board for Sunday. Ibarra's wallet open next to it */
      A.furn('couch',-1.9,-5.5,0); A.furn('tv',-1.9,-1.75,Math.PI);
      { mk(box(1.2,.03,.36),M(tWoodLight),floorN,1.9,.86,-4.2); for(const s of [-1,1]) mk(box(.03,.86,.03,{at:[0,.43,0]}),mSteel,floorN,1.9+s*.3,0,-4.2,0,0,s*.35);
        addBox(1.3,2.5,-4.38,-4.02,0,.88,'furn');
        mk(box(.42,.025,.3),M(tWhite),floorN,1.75,.885,-4.2,0,.1,0); mk(box(.14,.03,.06),M(tWhite),floorN,1.75,.9,-4.32,0,.1,0);
        A.blk(.17,.01,.11,M(null,{color:0x4a2e1c}),2.25,.88,-4.2,.2); A.pic(tTw4Ident,2.21,.887,-4.21,.2,.075,.05,{rx:-Math.PI/2}); A.pic(tTw4Family,2.29,.887,-4.19,.2,.07,.047,{rx:-Math.PI/2}); }
      { const lx=-3.0,lz=-5.45; mk(cyl(.01,.01,1.3,4,{at:[0,.65,0]}),mBlack,floorN,lx,0,lz); mk(cyl(.12,.07,.16,6,{at:[0,0,0]}),[M(null,{color:0xe8d8a8,unlit:true})],floorN,lx,1.35,lz); A.light([lx+.15,1.3,lz+.3],[1.25,.85,.45],4.4); }
      A.bulb(.2,-3.5,false);
      /* the drying room: bricks on newspaper on the floor, dark */
      for(let k=0;k<6;k++){ const bx=5.0+(k%3)*1.0,bz=-4.6-Math.floor(k/3)*.8; mk(plane(.8,.6),M(null,{color:0xb8b2a0}),floorN,bx,.004,bz,-Math.PI/2,0,0); for(let q=0;q<3;q++) A.blk(.16,.08,.11,M(tTwBrick),bx-.2+q*.2,.04,bz,.1*q); }
      A.bulb(7,-3.5,false);
      A.tag(3,-2.6,1.45,1); A.tag(6,5.2,1.5,-1); A.tag(0,-7.8,1.4,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'cutter',name:'Chuy',spots:[[-7.4,2.72,0],[-7.2,2.7,-.2]],pose:'lean',extra:'I just cut it, man— I just cut it—'},
      {kind:'cutter',name:'Gordo',spots:[[-8.15,3.75,Math.PI/2]],pose:'lean',extra:'I didn\'t take nothing off them—'},
      {kind:'cutter',name:'Emilio',spots:[[-1.0,4.82,0],[-1.3,4.85,.15]],pose:'lean',extra:'It was my father\'s— please—'},
      {kind:'vecino4',hidden:true,name:'Beto',spots:[[.3,-4.1,Math.PI],[-.3,-4.2,Math.PI+.2]],pose:'phone',extra:'I\'m a godfather Sunday— please—'},
      {kind:'doorman',name:'Lalo',spots:[[10.35,.55,-Math.PI/2]],pose:'idle',extra:'They pay by the helmet, man—',
        hunt:{pts:[[7.0,0],[7.0,3.4],[7.0,0],[6.2,0],[6.2,-3.4],[6.2,0],[2.8,0],[2.8,-2.6],[2.8,0],[-1.2,0],[-1.2,2.6],[-1.2,0],[-4.4,0],[-4.4,-3.2],[-4.4,0],[-10.35,.5],[-5.4,0],[0,0],[10.35,.4]],
          calls:['Cop?','Nico said you\'d come up.','...Nico?','Five hundred a helmet.','Yours is worth more.','You\'re the last one, cop.']}}],
    talk:[
      {who:['Gordo','Chuy'],r:3.8,lines:[['Gordo','Who brought the shield up?'],['Chuy','Paulie. Fifty bucks.'],['Gordo','It\'s a good table.'],['Chuy','Didn\'t help the guy holding it.'],
        ['Gordo','And the rosary?'],['Chuy','The girl\'s. For luck.'],['Gordo','Hers ran out.'],['Chuy','Bag it. Don\'t talk.']]},
      {who:['Emilio'],r:3.8,lines:[['Emilio','It won\'t come out of the wood.'],['Emilio','Pa cut cane with this.'],['Emilio','Forty years. Never a man.'],['Emilio','I did the one crawling.'],['Emilio','He said a name.'],['Emilio','...I didn\'t catch it.']]},
      {who:['Junior'],r:3.8,lines:[['Junior','Ma says stay in the room.'],['Junior','There\'s blood on the stairs.'],['Junior','Beto\'s got a cop\'s phone.'],['Junior','He keeps showing people.']]},
      {who:['Beto'],r:3.8,lines:[['Beto','Ringing again.'],['Beto','The fed\'s phone. Ibarra\'s.'],['Beto','Nine-one-five. El Paso.'],['Beto','Nine calls.'],['Beto','Who calls a dead man nine times?'],['Beto','Somebody who paid him.'],['Beto','...or his wife.']]}],
    civ:[{kind:'estudiante',civ:true,name:'Junior',spots:[[6.2,4.5,0],[7.4,4.4,-.3]],pose:'phone',extra:'I\'m in school! I\'m in school—'}],
    loot:[['knife',-7.25,.86,3.42,.6]],
    clear:['FLOOR 04','Ibarra\'s phone is still ringing.'] },

  /* 05: the count floor. Paco counts it (dollars, new ones) with Grande at the door. Chato kept Dunne's daughter's wedding
     invitation for the paper. Rafa tells his girl nothing happened. The team's kit bags are in the dark room, the can still in the rifle case */
  { n:5,name:'Floor 05',kit:'pistol',wall:'sage',floor:'check',
    units:[{side:1,x0:-10,x1:-3.8,door:-4.8,win:true,winX:-7.6,paper:'panel',fl:'oak'},{side:1,x0:-3.8,x1:3.2,door:-1.6,hole:4.8,paper:'concrete',fl:'conc'},{side:1,x0:3.2,x1:10,door:4.2,win:true,winX:7.4,paper:'tile'},
      {side:-1,x0:-10,x1:-4.2,door:-5.2,win:true,winX:-8.0,paper:'blue',fl:'rug'},{side:-1,x0:-4.2,x1:2.4,door:1.4,paper:'dark',fl:'conc'},{side:-1,x0:2.4,x1:10,door:6.4,win:true,hole:4.6,paper:'tile',fl:'tile'}],
    build(A){ A.tube(-8,'dead'); A.tube(-1,'on'); A.tube(3,'dead'); A.tube(7,'dead');
      A.light([-1,2.5,0],[1.0,1.08,1.2],5.6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the count room: a folding table, the money in bricks, the machine, a green lamp. A duffel of it open on the floor */
      { const x=-7.4,z=4.65; mk(box(1.7,.04,.72),M(tWoodLight),floorN,x,.76,z); for(const s of [-1,1]) mk(box(.04,.74,.6,{at:[0,.37,0]}),mSteel,floorN,x+s*.75,0,z);
        addBox(x-.85,x+.85,z-.36,z+.36,0,.78,'furn');
        for(let k=0;k<14;k++) A.blk(.1,.025+(k%4)*.012,.05,M(tTwMoney),x-.6+(k%7)*.12,.79+(k%4)*.006,z+.1+Math.floor(k/7)*.07,(k*.37)%.3);
        A.blk(.26,.14,.22,M(tTw5Counter),x+.3,.85,z-.1,-.1); A.blk(.24,.02,.18,M(tTwLedger),x-.3,.79,z-.18,.15);
        mk(cyl(.07,.08,.02,6),mBlack,floorN,x+.65,.79,z+.15); mk(cyl(.006,.006,.28,3),mBlack,floorN,x+.65,.92,z+.15); mk(box(.2,.06,.08),[M(null,{color:0x1e4a2a}),M(null,{color:0x1e4a2a}),M(null,{color:0x2a5a3a}),M(null,{color:0xf2e2a8,unlit:true})],floorN,x+.6,1.07,z+.1);
        A.light([x+.5,1.1,z],[1.15,1.15,.6],4.3); }
      { const dx=-5.2,dz=5.4; A.blk(.75,.3,.36,M(tTw5Duffel),dx,.15,dz,.2,true); for(let k=0;k<5;k++) A.blk(.1,.02,.05,M(tTwMoney),dx-.18+k*.09,.31,dz,.2+k*.3); }
      A.furn('filing',-9.6,5.6,Math.PI);
      /* the stash: bricks on pallets, nobody's light. An empty rack where long guns stood */
      for(const [px,pz] of [[-.4,5.3],[1.8,5.3],[2.2,2.4]]){ mk(box(1.1,.12,.9,{at:[0,.06,0]}),M(tCrate),floorN,px,0,pz); twSolid(1.0,.72,.8,M(tTw5Bricks,{repeat:[2,1.4]}),px,pz,0,.12); }
      { const rx=-2.6,rz=5.88; mk(box(1.1,.06,.12),mWood,floorN,rx,.25,rz); mk(box(1.1,.06,.12),mWood,floorN,rx,1.25,rz); for(let k=0;k<5;k++) mk(box(.03,.12,.08),mWood,floorN,rx-.44+k*.22,1.2,rz-.02); }
      A.bulb(-.4,3.5,false);
      /* the kitchen: a bulb over the table, plates. Dunne's daughter's wedding invitation on the fridge */
      A.furn('table',6.4,3.6,Math.PI/2); A.furn('fridge',5.0,5.6,Math.PI); A.furn('counter',8.4,5.62,Math.PI); A.furn('trash',9.4,1.7,0);
      for(const [px,pz] of [[6.1,3.45],[6.75,3.7]]){ mk(cyl(.1,.09,.015,8),M(tWhite),floorN,px,.78,pz); mk(cyl(.06,.05,.012,6),M(null,{color:0x8a3a1a}),floorN,px,.79,pz); }
      A.pic(tTw5Invite,5.05,1.32,5.244,Math.PI,.1,.14);
      A.bulb(6.4,3.6,true,true,2.0); A.light([6.4,1.85,3.6],[1.6,1.0,.5],4.6);
      /* Rafa's room: the street through the window, the scan of the baby taped by it, a bear still in its bag */
      A.furn('mattress',-9.2,-3.4,Math.PI/2); A.furn('trash',-4.9,-5.4,0);
      A.pic(tTw5Sono,-6.85,1.5,-5.926,0,.18,.15);
      mk(box(.16,.2,.12),M(null,{color:0x8a5a3a}),floorN,-9.1,.37,-4.1,0,.4,0); mk(box(.2,.26,.16),M(null,{color:0xd8dcd4}),floorN,-9.1,.4,-4.1,0,.4,0);
      A.light([-8.0,1.6,-5.2],[.45,.55,.8],3.8);
      A.bulb(-7,-3.5,false);
      /* the dark room: two of the team's kit bags and an open rifle case. The rifle's gone; the can's still in the foam */
      { A.blk(.8,.28,.38,M(tTw5Duffel),-3.4,.14,-5.45,.15,true); A.blk(.7,.26,.36,M(tTw5Duffel),-3.55,.13,-4.85,-.3,true);
        twSolid(1.1,.1,.36,M(tTw5Foam),-1.4,-5.5,.05); mk(box(1.1,.36,.03),mBlack,floorN,-1.4,.2,-5.7,0,.05,0);
        A.furn('wardrobe',.8,-5.65,0); A.furn('crates',-3.3,-1.85,0);
        /* one of the team's weapon lights, still on, rolled against the wall behind the case */
        mk(cyl(.017,.017,.11,6),[mBlack,M(null,{color:0xf4f6ff,unlit:true}),mBlack],floorN,-2.3,.02,-5.82,Math.PI/2,0,1.2); A.light([-2.0,.45,-5.3],[.75,.8,.92],3.2); }
      A.bulb(-1,-3.5,false);
      /* a dark bathroom */
      { twSolid(1.6,.55,.72,M(null,{color:0xc8c4b8}),8.6,-5.55); mk(box(1.45,.02,.6),M(null,{color:0x2a2a1e}),floorN,8.6,.5,-5.55);
        twSolid(.4,.42,.55,M(null,{color:0xc8c4b8}),5.0,-5.6); twSolid(.5,.2,.4,M(null,{color:0xc8c4b8}),6.2,-5.7,0,.7); }
      A.bulb(7,-3.5,false);
      A.tag(7,-8.0,1.45,1); A.tag(4,3.6,1.5,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Paco',spots:[[-7.4,3.82,0],[-7.0,3.84,-.15]],pose:'lean',extra:'It\'s not my money— it\'s not even mine—'},
      {kind:'enforcer',name:'Grande',spots:[[-8.7,2.0,1.83]],pose:'watch',extra:'I just stood at the door—'},
      {kind:'cutter',name:'Chato',spots:[[6.4,2.62,0]],pose:'lean',extra:'Take the money— take all of it—'},
      {kind:'doorman',name:'Memo',spots:[[8.6,4.5,-2.0]],pose:'idle',extra:'I never even went down—'},
      {kind:'vecino3',hidden:true,name:'Rafa',spots:[[-8.0,-5.15,Math.PI],[-7.7,-5.1,Math.PI+.25]],pose:'phone',extra:'She\'s pregnant, man— please—'}],
    talk:[
      {who:['Paco','Grande'],r:3.8,lines:[['Paco','Twenty-five. Twenty-six.'],['Grande','All dollars?'],['Paco','All dollars. New ones.'],['Grande','Aurelio pays in pesos.'],['Paco','This isn\'t Aurelio\'s.'],['Grande','Whose, then?'],['Paco','...twenty-seven. Twenty-eight.']]},
      {who:['Memo','Chato'],r:3.8,lines:[['Memo','Three\'s not answering.'],['Chato','Paulie never answers.'],['Memo','Two\'s not answering.'],['Chato','...one?'],['Memo','Nobody.'],
        ['Chato','Old guy had sixty bucks.'],['Chato','And a wedding thing. June.'],['Memo','You kept that?'],['Chato','Nice paper.']]},
      {who:['Doña Rosa'],r:3.8,lines:[['Doña Rosa','Rafa\'s girl calls me.'],['Doña Rosa','She thinks he drives a truck.'],['Doña Rosa','Poor girl.'],['Doña Rosa','Eat, eat. Then go.']]},
      {who:['Rafa'],r:3.8,lines:[['Rafa','Baby. Baby, listen.'],['Rafa','Friday. I\'ll be there Friday.'],['Rafa','With money. Real money.'],['Rafa','What? No. Nothing happened.'],['Rafa','I just watched the door.'],['Rafa','...is it kicking?']]}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Doña Rosa',spots:[[6.2,-4.7,Math.PI],[5.6,-4.6,Math.PI+.3]],pose:'lean',extra:'I just cook for them! I just cook—'}],
    loot:[['can',-1.55,.15,-5.48,1.62]],
    clear:['FLOOR 05','All of it in dollars.'] },

  /* 06: the lab. They gutted the north side for it: plastic on the walls, strip curtains between the bays, steel tables of glass
     under sick green and yellow light, drums stencilled EP TX. A generator next door feeds it through a hole in the wall.
     Four men in masks at the tables, Gil on the generator, Nacho on his break listening to the radio say six went in */
  { n:6,name:'Floor 06',kit:'pistol',wall:'cinder',floor:'lab',amb:[.12,.145,.12],
    units:[{side:1,x0:-10,x1:4.2,door:-6.0},{side:1,x0:4.2,x1:10,door:7.6,win:true,winX:8.6,hole:3.0,paper:'concrete',fl:'conc'},
      {side:-1,x0:-10,x1:-3.6,door:-4.6,win:true,winX:-7.4,paper:'tile',fl:'tile'},{side:-1,x0:-3.6,x1:3.4,door:-.4},{side:-1,x0:3.4,x1:10,door:4.6,win:true,winX:7.4,hole:4.4,paper:'peel',fl:'conc'}],
    build(A){ A.tube(-8,'dead'); A.tube(-3,'on'); A.tube(2,'dead'); A.tube(7,'dead');
      A.light([-3,2.5,0],[.95,1.05,1.0],5.2,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the lab: plastic over the walls, strips across the bay lines and in the doorway */
      twSheet(-2.9,5.9,Math.PI,14.1); twSheet(-9.9,3.5,Math.PI/2,4.8); twSheet(4.1,4.75,-Math.PI/2,2.3);
      twStrips('z',-5.2,1.1,5.9); twStrips('z',-.4,1.1,5.9); twStrips('x',1.18,-6.5,-5.5);
      /* bay A: Nando's table, a green tube hanging on chains */
      twLabTable(-8.0,3.9);
      for(const [bx,bz,s] of [[-8.6,3.75,1],[-8.35,4.05,.8],[-7.5,3.8,1.2]]) twBeaker(bx,.92,bz,s,mTwMilk);
      twFlask(-7.9,.92,4.1,1,mTwGreenL); mk(box(.5,.03,.32),mSteel,floorN,-8.1,.93,3.75); mk(plane(.44,.26),M(tTw6Crystal),floorN,-8.1,.947,3.75,-Math.PI/2,0,0);
      { const tx=-8.0,tz=3.9; mk(box(1.2,.06,.18),mBlack,floorN,tx,2.2,tz); mk(box(1.1,.03,.12),M(null,{color:0x9aff8a,unlit:true}),floorN,tx,2.16,tz);
        for(const s of [-1,1]) mk(cyl(.004,.004,.55,3),mSteel,floorN,tx+s*.5,2.5,tz); A.light([tx,2.0,tz],[.55,1.3,.5],5.0); }
      twDrum(-9.45,5.4,mTwBlueDrum); twDrum(-8.8,5.5,mTwDrum,.6); twDrum(-9.45,4.75,mTwBlueDrum,1.1);
      /* bay B: the reactor. A big flask in a mantle glowing orange, a column up to a hood, a duct into the ceiling */
      twLabTable(-2.8,3.9);
      { const x=-2.8,z=4.0; mk(cyl(.16,.13,.14,10,{at:[0,.07,0]}),[mBlack,M(null,{color:0xe86a1a,unlit:true}),mBlack],floorN,x,.92,z);
        twFlask(x,1.0,z,2.1,mTwSick); mk(cyl(.02,.02,.7,6,{at:[0,.35,0]}),mTwGlass,floorN,x,1.58,z);
        mk(cyl(.012,.012,1.3,4,{at:[0,.65,0]}),mSteel,floorN,x+.35,.92,z+.25); mk(box(.36,.02,.02),mSteel,floorN,x+.17,1.7,z+.12,0,.6,0);
        mk(box(.9,.3,.6),M(tSteel),floorN,x,2.45,z); mk(cyl(.15,.15,.25,8),mBlack,floorN,x,2.68,z); mk(plane(.32,.32),M(null,{color:0x050505}),floorN,x,RH-.004,z,Math.PI/2,0,0);
        A.light([x,1.25,z-.1],[1.5,1.0,.32],4.3,'candle'); }
      twBeaker(-3.5,.92,3.7,1.4,mTwSick); twBeaker(-2.2,.92,3.65,1,mTwGreenL); twFlask(-2.05,.92,4.15,.9,mTwMilk);
      for(const s of [-1,1]) A.blk(.09,.07,.11,mTwRubber,-3.45+s*.05,.955,4.2,.3); /* a spare mask */
      twDrum(-4.6,5.45,mTwDrum); twDrum(-1.0,5.5,mTwDrum,.4);
      /* bay C: the drying trays under a yellow lamp, a box fan on them */
      twLabTable(1.8,3.9);
      for(let k=0;k<3;k++){ mk(box(.5,.03,.36),mSteel,floorN,1.25+k*.55,.93,3.9); mk(plane(.46,.32),M(tTw6Crystal),floorN,1.25+k*.55,.947,3.9,-Math.PI/2,0,0); }
      mk(box(.4,.4,.12),mBlack,floorN,2.3,1.25,4.2,0,-.3,0); mk(plane(.34,.34),M(null,{color:0x3a3c40}),floorN,2.28,1.25,4.14,0,-.3+Math.PI,0);
      twLowBulb(1.8,2.05,3.9); A.light([1.8,1.9,3.9],[1.5,1.15,.32],4.6);
      twDrum(3.6,5.45,mTwBlueDrum); twDrum(2.95,5.5,mTwBlueDrum,.7);
      /* the cable: generator, through the hole, across the floor to the tables */
      for(const [a,b,c,d] of [[6.0,4.75,4.6,3.0],[4.6,3.0,3.0,3.0],[3.0,3.0,-2.8,3.2],[-2.8,3.2,-8.0,3.2]]){ const l=Math.hypot(c-a,d-b); mk(box(l,.025,.035),mBlack,floorN,(a+c)/2,.013,(b+d)/2,0,-Math.atan2(d-b,c-a),0); }
      /* the generator room: the generator, its pipe out the window, jerrycans, a work lamp on a stand */
      { const gx=6.6,gz=5.0; twSolid(1.2,.75,.7,M(tTw6Gen),gx,gz); mk(cyl(.05,.05,1.0,6,{at:[0,.5,0]}),mBlack,floorN,gx+.45,.75,gz+.1); mk(box(1.6,.1,.1),mBlack,floorN,gx+1.25,1.75,gz+.1,0,0,.25);
        for(const [cx,cz,r] of [[5.2,5.55,.2],[5.6,5.62,-.1],[8.2,5.5,.5]]) twSolid(.36,.45,.18,M(tTw6Can),cx,cz,r); }
      { const lx=5.1,lz=4.4; for(const s of [0,2.1,4.2]) mk(cyl(.008,.008,1.6,3,{at:[0,.8,0]}),mBlack,floorN,lx,0,lz,Math.sin(s)*.25,0,Math.cos(s)*.25);
        mk(box(.24,.18,.12),mBlack,floorN,lx,1.62,lz,0,.6,0); mk(plane(.2,.14),M(null,{color:0xfff2c8,unlit:true}),floorN,lx+.04,1.62,lz+.07,0,.6,0); A.light([lx+.4,1.6,lz-.1],[1.45,1.3,1.0],4.6); }
      /* the changing room: suits and masks on hooks, boots, a bench, the radio */
      { mk(box(2.0,.05,.4),mWood,floorN,-6.6,.42,-5.62); for(const s of [-1,1]) mk(box(.05,.4,.36,{at:[0,.2,0]}),mWood,floorN,-6.6+s*.9,0,-5.62); addBox(-7.6,-5.6,-5.82,-5.42,0,.45,'furn');
        for(let k=0;k<4;k++){ const sz=-2.0-k*.95; mk(box(.06,1.1,.42),M(tTw6Suit),floorN,-9.88,1.3,sz); mk(box(.03,.03,.06),mSteel,floorN,-9.9,1.88,sz); mk(box(.06,.06,.09),mTwRubber,floorN,-9.86,1.75,sz+.15); }
        for(const [bx,bz] of [[-9.55,-2.0],[-9.55,-2.95]]) for(const s of [-1,1]) mk(box(.11,.24,.26,{at:[0,.12,0]}),mBlack,floorN,bx,0,bz+s*.08);
        A.blk(.2,.12,.08,M(tTwRadio),-6.3,.505,-5.62,.1);
        A.bulb(-6.6,-4.0,false); mk(plane(.05,.03),M(null,{color:0xf2c870,unlit:true}),floorN,-6.27,.52,-5.579); }
      /* the drum store: dark. Rows of drums, EP TX */
      for(let k=0;k<8;k++) twDrum(-3.0+k*.66,-5.45,k%3?mTwDrum:mTwBlueDrum,k*.7);
      for(let k=0;k<3;k++) twDrum(-3.0+k*.66,-4.8,mTwDrum,k);
      for(const [sx,sz,sy] of [[1.6,-2.1,.18],[2.3,-2.1,.18],[1.95,-2.1,.5]]) A.blk(.62,.3,.42,M(null,{color:0xc9c2a8}),sx,sy,sz,.1,sy<.3);
      A.bulb(0,-3.5,false);
      /* where the cooks sleep: mattresses, dark */
      A.furn('mattress',6.2,-5.4,0); A.furn('mattress',8.9,-3.6,Math.PI/2); A.furn('trash',9.4,-1.8,0); A.bulb(7,-3.5,false);
      A.tag(5,-2.0,1.45,-1); A.tag(2,9.0,1.5,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'mcutter',name:'Nando',spots:[[-8.0,3.03,0],[-7.7,3.05,-.15]],pose:'lean',extra:'I just pour, I just pour—'},
      {kind:'menforcer',name:'Kiko',spots:[[-9.3,1.95,1.2]],pose:'watch',extra:'I just watch the cooks—'},
      {kind:'mgunman',name:'Profe',spots:[[-2.8,3.03,0]],pose:'lean',extra:'I\'m a chemist— I\'m worth more alive—'},
      {kind:'mcutter',name:'Pepe',spots:[[-1.38,3.9,-Math.PI/2]],pose:'lean',extra:'My eyes— I can\'t see—'},
      {kind:'doorman',name:'Gil',spots:[[6.6,4.15,0]],pose:'lean',extra:'I just fill the generator—'},
      {kind:'ngunman',name:'Nacho',spots:[[-6.6,-4.75,Math.PI]],pose:'watch',extra:'I was up here the whole time—'}],
    talk:[
      {who:['Profe','Pepe'],r:3.8,lines:[['Profe','Slower. Slower.'],['Pepe','My eyes are burning.'],['Profe','Then close them and pour.'],['Pepe','You hear shooting down there?'],['Profe','I hear a batch going cold.'],
        ['Pepe','Five cops, Profe.'],['Profe','Five cops is Aurelio\'s problem.'],['Profe','This is mine. Pour.']]},
      {who:['Nando','Kiko'],r:3.8,lines:[['Nando','Who signs for the drums?'],['Kiko','Don\'t ask about the drums.'],['Nando','Says El Paso on them.'],['Kiko','Says what it says.'],['Nando','Same people as the tip?'],['Kiko','Mask on, Nando.']]},
      {who:['Gil'],r:3.8,lines:[['Gil','Come on, old girl.'],['Gil','Lights go, the batch goes.'],['Gil','Batch goes, Profe loses it.'],['Gil','Who cut the stair lights?'],['Gil','Nobody tells me nothing.']]},
      {who:['Don Beni'],r:3.8,lines:[['Don Beni','Mop the stairs, they said.'],['Don Beni','Five boys. I mopped five boys.'],['Don Beni','God forgive me.']]},
      {who:['Nacho'],r:3.8,lines:[['Nacho','Radio says six went in.'],['Nacho','Five came out in bags.'],['Nacho','Sixth is missing, it says.'],['Nacho','...missing where?']]}],
    civ:[{kind:'abuelo',civ:true,old:true,name:'Don Beni',spots:[[6.6,-3.6,Math.PI/2],[7.6,-3.8,-Math.PI/2]],pose:'idle',extra:'I just clean! I just clean!'}],
    loot:[],
    clear:['FLOOR 06','Six men in masks. Nine floors to go.'] }
);
