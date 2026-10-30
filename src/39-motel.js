/* =====================================================================================================
   THE MOTEL: Puerto Seco, level 2. Motel Puente Viejo, a block from the international bridge, a little before two.
   Dale Pruitt sold the task force's raid for four thousand dollars. The plaza keeps him here on ice, in the suite at the
   back with the TV on and a .38 within reach. Ray comes with nothing. 86 x 50 m (setWorld 43,25), ground level, 6 m tiles.
     the alcove      you start here (rack, board), in the ice-machine alcove in the west wing, open on the courtyard
     the courtyard   parking in front of the rooms, a drained pool behind a fence with two of them drinking by it, a lookout
                     on the walkway, Dale's pickup outside his door
     the north wing  rooms 5 to 12. The crew rents the row by the week and knocked holes through the walls: a way room to room,
                     inside, from 5 to the connecting door into Dale's suite. They're watching the game in 9
     Dale's suite    14 (there is no 13): living room, bedroom, bath, and a back door onto the truck yard
     east and south wings, the office (the night clerk; the motel's breaker on its back wall), the driveway and the sign
     the back lot    the laundry, the manager's house (the knife is in his kitchen), a fire in a drum, the side lot gate
     the back lane   under the north wall, the border's floodlights over it; one of them walks it end to end
     the truck yard  trailers waiting to cross, a gate shack, the gate onto the street
     the street      Avenida Internacional. East is the bridge: walk out that way and you're done
   Three ways to Dale: across the courtyard and through the man at his door; through the knocked-out rooms; round the back
   lane and in by his back door. Fifteen of them. Three lookouts carry radios. Bottles lying about, a knife in the manager's
   kitchen, Dale's revolver on Dale. Pull the breaker and the motel goes dark; the street and the truck yard stay lit.
   ===================================================================================================== */
const MO={RX:43,RZ:25};
/* walkable space: [x0,z0,x1,z1,id]. Inner rooms first. -2 the start, -1 the street, the lane and the passages, >=0 the spawn map */
const MOTEL_RECTS=[[-13,-2,-10.2,2,-2],[-17,-2,-13,2,26],
  [-17,-6.75,-10.2,-2,0],[-17,2,-10.2,7,1],
  [-10.2,-20.5,-6.675,-13,2],[-6.675,-20.5,-3.15,-13,3],[-3.15,-20.5,.375,-13,4],[.375,-20.5,3.9,-13,5],[3.9,-20.5,7.425,-13,6],[7.425,-20.5,10.95,-13,7],[10.95,-20.5,14.475,-13,8],[14.475,-20.5,18,-13,9],
  [18,-15,25,-9,10],[18,-20.5,25,-15,11],[18,-9,25,-4.5,12],[18,0,25,4.5,13],[5.5,12,9,18,14],[9,12,12.5,18,15],
  [-10.2,12,-4,18,16],[-17,12,-10.2,18,17],[-29,-17,-22,-11,18],[-40,-4,-32,1,19],[-40,-9,-32,-4,20],[33,14.8,35.2,17.4,25],
  [-2.5,-5,9.5,5,22],[-10.2,-13,18,12,21],[16,12,18,18,-1],[-4,12,2,18,-1],
  [-43,18,43,25,-1],[-41,-24.6,41,-20.5,-1],[-41,-20.5,-17,18,23],[-17,-20.5,-10.2,-11.5,23],[25,-20.5,41,18,24]];
const MO_NAMES={0:'ROOM 2',1:'ROOM 3',2:'ROOM 5',3:'ROOM 6',4:'ROOM 7',5:'ROOM 8',6:'ROOM 9',7:'ROOM 10',8:'ROOM 11',9:'ROOM 12',10:'SUITE 14',11:'BED 14',12:'ROOM 15',13:'ROOM 17',14:'ROOM 23',15:'ROOM 22',
  16:'OFFICE',17:'BACK OFFICE',18:'LAUNDRY',19:'KITCHEN',20:'BEDROOM',21:'COURT',22:'POOL PATIO',23:'LOT',24:'TRUCK YARD',25:'SHACK',26:'LINEN'};
const MO_SW=[-17.26,1.3,14.4]; /* the breaker's handle, on the office's back wall, facing the lot */
const MO_PHONE=[21.5,.47,-13.4]; /* Dale's phone, on the coffee table */
const MOTEL_CAST=[
  {id:'halcon',name:'Brayan',x:-1.8,z:18.9,hd:0,radio:true,extra:ES('Nomás cuido los carros—','I just watch the cars—'),detail:'watches the street'},
  {id:'halcon',name:'Kevin',x:7.6,z:-12.1,hd:0,radio:true,extra:ES('Me dijeron que nomás mirara—','They told me to just watch—'),detail:'watches the rooms'},
  {id:'halcon',name:'Moy',x:37.4,z:16.3,hd:0,radio:true,extra:ES('Yo nomás abro el portón—','I just open the gate—'),detail:'minds the gate'},
  {id:'halcon',name:'Wicho',x:-6.0,z:-22.4,hd:-Math.PI/2,extra:ES('Nomás salí a fumar—','I only came out to smoke—'),detail:'smokes in the lane'},
  {id:'halcon',name:'Fito',x:1.0,z:4.0,hd:Math.PI/2,extra:ES('Tengo diecisiete, güey—','I\'m seventeen, man—'),detail:'drinks by the pool'},
  {id:'machetero',name:'Chema',x:3.1,z:4.2,hd:-Math.PI/2,extra:ES('Tengo una niña en la casa—','I\'ve got a little girl at home—'),detail:'drinks by the pool'},
  {id:'machetero',name:'Saúl',x:-30,z:-22.6,hd:Math.PI/2,patrol:[[-36,-22.6],[36,-22.6]],extra:ES('Nomás camino el callejón—','I just walk the lane, I swear—'),detail:'walks the back lane'},
  {id:'machetero',name:'Rigo',x:6.6,z:-15.2,hd:-2.6,extra:ES('Era una fiesta nomás—','It was just a party, man—'),detail:'watches the game'},
  {id:'pistolero',name:'Pepe',x:5.2,z:-16.2,hd:Math.PI,extra:ES('Estaba el partido, nada más—','The game was on, that\'s all—'),detail:'watches the game'},
  {id:'halcon',name:'Jonás',x:1.4,z:-16.8,hd:Math.PI/2,extra:ES('Ni lo conozco a ese güey—','I don\'t even know the guy—'),detail:'drinks in 8'},
  {id:'pistolero',name:'Chucho',x:-8.4,z:13.3,hd:0,extra:ES('Yo nomás doy las llaves—','I just hand out the keys—'),detail:'works the desk'},
  {id:'machetero',name:'Gordo',x:-23.0,z:-2.6,hd:-2.2,extra:ES('Nomás cuido la lumbre—','I just keep the fire going—'),detail:'warms up at the fire'},
  {id:'escolta',name:'Cheto',x:16.9,z:-11.5,hd:-Math.PI/2,extra:ES('Me paga por estar aquí parado—','He pays me to stand here—'),detail:'minds Dale\'s door'},
  {id:'pistolero',name:'Ramiro',x:35.4,z:-4,hd:0,patrol:[[35.4,-18.6],[35.4,12.6]],extra:ES('Yo nomás cuido las cajas—','I just guard the trailers—'),detail:'walks the truck yard'},
  {id:'dale',name:'Dale',x:19.4,z:-13.4,hd:2.05,dale:true,extra:'You\'re dead— they said you were dead—',detail:'watches TV'}];
/* Dale is soft: a worse shot than the men minding him, and he bleeds like it */
const DALE_KS={keep:4.5,cd:[1.7,2.5],dmg:14,acc:.24,range:9,tough:1.3};

/* ---------- Dale Pruitt: grey hoodie open over a stained white tee, grey sweats, slides with socks (from the House Calls set) ---------- */
HEADS.dale={seed:801,skin:'#d8a888',skinD:'#a87a5e',hair:'long',hairC:'#5a4632',hairFront:13,sideburn:40,behind:50,nape:54,brow:'#4a3a28',iris:'#5a6a5a',lip:'#a86a5c',beard:'stubble',beardC:'#5a4632',acne:true};
const tMoDaleTorso=torsoP('dale',901,(x,y)=>{ const open=Math.abs(x-64)<16; if(y>T3.belt+2) return ['#6a6a6c','knit',.7]; if(open&&y>T3.neck+10) return crewNeck(x,y,12,12)?sk('dale'):['#e2ddd0','cotton',.8]; return ['#7a7c80','knit',.8]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ softLine(I,64+s*16,T3.neck+10,64+s*16,T3.belt,'#5a5c60',.9,2); softLine(I,64+s*17,T3.neck+10,64+s*17,T3.belt,'#a8a8a4',.6,1); softLine(I,64+s*10,T3.neck+12,64+s*20,T3.neck+70,'#e8e4dc',.8,1); }
  softRect(I,0,T3.neck,128,12,'#6a6c70',.9,2); stain(I,60,T3.chest+30,6,'#a88a4a',902); stain(I,70,T3.nav-10,5,'#8a6a3a',903); softRect(I,0,T3.belt-10,128,10,'#5a5c60',.6,2); softRect(I,34,T3.nav-30,60,26,'#000000',.08,3); }});
const tMoDaleArm=armP(905,()=>['#7a7c80','knit',.8],{decor:I=>softRect(I,0,112,64,16,'#5a5c60',.8,2)});
const tMoDaleLeg=legP(907,(x,y)=>['#6a6a6c','knit',.7],{decor:I=>{ softRect(I,0,110,64,18,'#5a5a5c',.8,2); blob(I,32,60,10,6,.12); stain(I,20,40,4,'#4a3a2a',908); }});
const tMoSlide=garment(64,32,909,(x,y)=>[y<12?'#e8e4dc':'#1a1a1c',y<12?'knit':'poly',.2],{folds:2,grime:.1,decor:I=>{ softRect(I,8,14,48,8,'#2a4a8a',.95,.6); }});
ROSTER.dale=Object.assign({as:'landlord',side:'cartel',name:'Dale Pruitt',role:'The informant · sold the raid',color:'#d0453a',note:'Sold the raid\'s time and the stairwell door code for four thousand dollars. The plaza keeps him here till it blows over.',
  o:{hf:.98,w:.94,depth:.98,belly:1.12,lg:.92,ag:.9,jacket:.014,pants:.014},torso:tMoDaleTorso,arm:tMoDaleArm,leg:tMoDaleLeg,foot:tMoSlide,
  extra:(J,o)=>{ hairBack(J,'#5a4632',.08); collar(J,o,M(flat(64,16,906,'#6a6c70','knit'),{double:true}),.06,.016); }},REVOLVER);

/* ---------- textures ---------- */
/* the motel's stucco: faded salmon over a teal band, a white stripe between, rain streaks, the dirt the parking lot splashes */
const moStucco=(top,band,seed,grime=0)=>P2(32,64,(g,w,h)=>{ const r=rng(seed),b=Math.round(h*.6);
  vfill(g,0,0,w,b,[[0,mix(top,'#ffffff',.05)],[1,mix(top,'#000000',.06)]]); for(let i=0;i<90;i++) R(g,`rgba(${r()>.5?255:40},${r()>.5?240:30},${r()>.5?220:20},.05)`,r()*w|0,r()*b|0,2,1);
  R(g,'#ece2cc',0,b,w,2); R(g,'#a89c88',0,b+2,w,1);
  vfill(g,0,b+3,w,h-b-3,[[0,band],[1,mix(band,'#000000',.22)]]); for(let i=0;i<40;i++) R(g,'rgba(0,0,0,.08)',r()*w|0,b+3+r()*(h-b-3)|0,2,1);
  for(let i=0;i<4+grime*4;i++){ const x=r()*w|0; vfill(g,x,0,1+(r()*2|0),10+r()*(24+grime*20),[[0,'rgba(90,60,40,.32)'],[1,'rgba(90,60,40,0)']]); }
  for(let i=0;i<grime*3;i++) ell(g,r()*w,b*.3+r()*b*.6,2+r()*3,1.5+r()*2,'rgba(60,40,30,.12)');
  vfill(g,0,h-10,w,10,[[0,'rgba(40,30,20,0)'],[1,`rgba(40,30,20,${.45+grime*.2})`]]); },5,seed);
const tMoStucco=moStucco('#d69a80','#3a8a84',2501), tMoStuccoB=moStucco('#c48e78','#3a7470',2502,1), tMoStuccoO=moStucco('#e0c8a0','#8a3a2a',2503);
const tMoCarpet=P2(32,32,(g,w,h)=>{ const r=rng(2511); R(g,'#5a3e26',0,0,w,h); for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8){ const o=(y/8)%2?4:0; ell(g,x+o+4,y+4,3,2.4,'#7a5430'); ell(g,x+o+4,y+4,1.6,1.2,'#9a6a34'); }
  for(let i=0;i<160;i++) R(g,r()>.5?'rgba(0,0,0,.12)':'rgba(255,220,160,.06)',r()*w|0,r()*h|0,1,1); for(let i=0;i<3;i++) ell(g,r()*w,r()*h,3+r()*3,2+r()*2,'rgba(30,20,10,.25)'); },5,2512);
const tMoCurtLit=P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#f0b060'],[1,'#c06a2a']]); for(let x=0;x<w;x+=3){ R(g,'rgba(120,50,10,.4)',x,0,1,h); R(g,'rgba(255,230,170,.25)',x+1,0,1,h); } R(g,'rgba(60,20,0,.5)',0,0,w,2); },3,2513);
const tMoCurtTV=P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#4a6a9a'],[1,'#2a3a5a']]); for(let x=0;x<w;x+=3){ R(g,'rgba(10,20,40,.4)',x,0,1,h); R(g,'rgba(160,190,240,.25)',x+1,0,1,h); } },3,2514);
const tMoCurtDark=P2(16,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a2a1e'],[1,'#22180f']]); for(let x=0;x<w;x+=3) R(g,'rgba(0,0,0,.35)',x,0,1,h); R(g,'rgba(160,140,120,.15)',0,0,w,1); },3,2515);
const MO_DOORTEX=new Map(), MO_NUMTEX=new Map();
function moNumTex(n){ if(MO_NUMTEX.has(n)) return MO_NUMTEX.get(n); const t=P2(16,8,(g,w,h)=>{ R(g,'#2a2418',0,0,w,h); text(g,String(n),Math.max(1,(w-textW(String(n)))>>1),1,'#e8d090'); },0,2600+n); MO_NUMTEX.set(n,t); return t; }
function moDoorTex(n){ if(MO_DOORTEX.has(n)) return MO_DOORTEX.get(n); const t=P2(16,32,(g,w,h)=>{ const r=rng(2520+n); vfill(g,0,0,w,h,[[0,'#2f7478'],[1,'#25585c']]);
    for(const [y,hh] of [[3,11],[17,12]]){ R(g,'#22585a',2,y,12,hh); R(g,'#3e8c90',2,y,12,1); R(g,'#3e8c90',2,y,1,hh); }
    R(g,'#c8a040',5,1,6,1); text(g,String(n),Math.max(1,(w-textW(String(n)))>>1),4,'#e8d090'); R(g,'#c8c4bc',12,16,2,2); ell(g,8,9.5,.8,.8,'#141414');
    vfill(g,0,h-6,w,6,[[0,'rgba(40,30,20,0)'],[1,'rgba(40,30,20,.45)']]); for(let i=0;i<6;i++) R(g,'rgba(255,255,255,.08)',r()*w|0,r()*h|0,2,1); },3,2530+n); MO_DOORTEX.set(n,t); return t; }
const tMoNeon=cutTex(64,24,(g,w,h)=>{ text(g,'MOTEL',(w-textW('MOTEL',2))>>1,1,'#ff4a3a',2); text(g,'PUENTE VIEJO',(w-textW('PUENTE VIEJO'))>>1,13,'#5ae8e0'); text(g,'TV  AIRE',(w-textW('TV  AIRE'))>>1,19,'#f2c84a'); },2541);
const tMoVacante=cutTex(32,8,(g,w,h)=>{ text(g,'VACANTE',(w-textW('VACANTE'))>>1,1,'#6aff5a'); },2542);
const tMoSignBox=P2(64,24,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#1a2a2e'],[1,'#0e1618']]); R(g,'#c8a040',0,0,w,1); R(g,'#c8a040',0,h-1,w,1); },3,2543);
const tMoRecep=cutTex(48,8,(g,w,h)=>{ text(g,'RECEPCION',(w-textW('RECEPCION'))>>1,1,'#ff5a4a'); },2544);
const tMoIce=P2(16,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#e8eef2'],[1,'#c8d4dc']]); R(g,'#2a6ac8',1,2,14,7); text(g,'HIELO',1,3,'#f2f6ff'); for(const [x,y] of [[4,14],[11,17],[6,22]]){ R(g,'#7aa8d8',x-2,y,5,1); R(g,'#7aa8d8',x,y-2,1,5); }
  R(g,'#8a9aa8',2,26,12,4); R(g,'#3a4a58',3,27,10,2); },3,2545);
const tMoBook=P2(32,16,(g,w,h)=>{ R(g,'#efe8d6',0,0,w,h); R(g,'#8a6a4a',15,0,2,h); for(let y=2;y<h;y+=2){ R(g,'#9ab0c8',1,y,13,1); R(g,'#9ab0c8',18,y,13,1); } text(g,'D.P',19,9,'#2a3a8a'); text(g,'14',27,9,'#2a3a8a'); },0,2546);
const tMoPool=P2(16,16,(g,w,h)=>{ R(g,'#5a9aa0',0,0,w,h); for(let k=0;k<w;k+=4){ R(g,'#3e7a80',k,0,1,h); R(g,'#3e7a80',0,k,w,1); } for(let i=0;i<10;i++) R(g,'rgba(40,50,30,.3)',(i*5)%w,(i*7)%h,3,2); vfill(g,0,h*.6,w,h*.4,[[0,'rgba(50,60,30,0)'],[1,'rgba(50,60,30,.5)']]); },4,2547);
const tMoPoolFloor=P2(32,32,(g,w,h)=>{ const r=rng(2548); R(g,'#3e6a62',0,0,w,h); for(let i=0;i<40;i++) ell(g,r()*w,r()*h,1+r()*3,1+r()*2,['#2a3a24','#4a4a2a','#5a3a1e'][r()*3|0]); for(let i=0;i<60;i++) R(g,'rgba(0,0,0,.15)',r()*w|0,r()*h|0,2,1); },4,2549);
const tMoMurk=cutTex(32,32,(g,w,h,r)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const d=Math.hypot((x-15.5)/15,(y-15.5)/12)+(r()-.5)*.2; if(d<1) R(g,d<.75?'#1a2a1c':'#24301e',x,y,1,1); } for(let i=0;i<14;i++) R(g,'#5a4a22',r()*w|0,r()*h|0,2,1); },2550);
const tMoNoSwim=signCo(32,16,'#e8e2d4','#a82a22',[['PROHIBIDO',2],['NADAR',9]],2551);
const tMoFarm=signCo(64,12,'#f2f2ec','#1a8a3a',[['FARMACIA',4]],2552,{band:'#1a8a3a'});
const tMoCross=cutTex(16,16,(g,w,h)=>{ R(g,'#3aff6a',6,2,4,12); R(g,'#3aff6a',2,6,12,4); },2553);
const tMoCambio=cutTex(48,12,(g,w,h)=>{ text(g,'$ CAMBIO $',(w-textW('$ CAMBIO $'))>>1,4,'#ffd84a'); },2554);
const tMoAduana=signCo(64,16,'#e8e2d4','#2a3a6a',[['AGENCIA ADUANAL',2],['HNOS. GARZA',9]],2555);
const tMoLlantera=signCo(64,12,'#e8c83a','#1a1a1e',[['LLANTERA 24 HRS',4]],2556);
const tMoArtes=signCo(64,12,'#a82a22','#f2e6c8',[['ARTESANIAS',4]],2557);
const tMoBridgeSign=signCo(64,16,'#1e6a3a','#f2f2ec',[['PUENTE',2],['INTERNACIONAL',9]],2558);
const tMoUSA=signCo(48,12,'#1e6a3a','#f2f2ec',[['EE.UU.  >',4]],2559);
const tMoYard=signCo(64,16,'#e8e2d4','#1a2a4a',[['TRANSPORTES',2],['DEL NORTE',9]],2560,{band:'#a82a22'});
const tMoClosed=signCo(48,12,'#e8e2d4','#a82a22',[['CALLE CERRADA',4]],2561);
const tMoWelcome=wallSign('BIENVENIDOS A|PUERTO SECO','#2a4a8a','#f2e6c8',64,16,1,2562);
const tMoBollard=cutTex(16,32,(g,w,h)=>{ for(let x=1;x<w;x+=4){ R(g,'#16181c',x,0,2,h); R(g,'#2a2e34',x,0,1,h); } },2563);
const tMoTrailerStripe=P2(64,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#ecebe4'],[1,'#c8c6be']]); R(g,'#2a6aa8',0,h*.55|0,w,2); R(g,'#a82a22',0,(h*.55|0)+3,w,1); for(let x=0;x<w;x+=8) R(g,'rgba(0,0,0,.06)',x,0,1,h); },4,2564);
/* the courtyard's asphalt: old, sun-bleached, patched */
const tMoAsph=P2(32,32,(g,w,h)=>{ const r=rng(2566); R(g,'#5a5852',0,0,w,h); for(let i=0;i<240;i++) R(g,['#66645e','#4c4a46','#6e6c66','#52504a'][r()*4|0],r()*w|0,r()*h|0,1,1);
  for(let i=0;i<2;i++){ const x=r()*w,y=r()*h; R(g,'rgba(30,30,30,.25)',x|0,y|0,6+r()*8|0,4+r()*6|0); } g.strokeStyle='rgba(20,20,20,.5)'; g.lineWidth=1; g.beginPath(); let x=r()*w,y=0; g.moveTo(x,y); for(let i=0;i<8;i++){ x+=(r()-.5)*8; y+=4; g.lineTo(x,y); } g.stroke(); },6,2567);
const tMoWinCamper=P2(16,8,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#f2c870'],[1,'#c8883a']]); R(g,'rgba(80,40,10,.4)',0,0,w,1); for(let x=0;x<w;x+=4) R(g,'rgba(120,60,20,.3)',x,0,1,h); },0,2565);

/* ---------- the kit ---------- */
const mMoTrim=col(0xe8e2d4), mMoAl=col(0xb8bcc0);
Object.assign(FX,{
  /* a closed motel room door: the number on it, a white frame */
  moDoor(g,n){ mk(plane(.92,2.06),MT(moDoorTex(n)),g,0,1.03,.008); mk(box(1.06,.08,.1),mMoTrim,g,0,2.1,.03); for(const s of [-1,1]) mk(box(.07,2.1,.1),mMoTrim,g,s*.5,1.05,.03); },
  /* the frame round an open doorway, and the number beside it */
  moFrame(g,n,w=1.0){ mk(box(w+.14,.08,.16),mMoTrim,g,0,2.14,0); for(const s of [-1,1]) mk(box(.07,2.14,.16),mMoTrim,g,s*(w/2+.035),1.07,0);
    if(n!=null){ mk(box(.18,.14,.02),col(0xc8a040),g,w/2+.22,1.6,.07); mk(plane(.14,.07),MT(moNumTex(n)),g,w/2+.22,1.6,.081); } },
  /* a window from outside with the curtain drawn: lit, the TV through it, or dark */
  moWin(g,kind='dark',w=1.2,h=1.05,ac=true){ const t={lit:tMoCurtLit,tv:tMoCurtTV,dark:tMoCurtDark}[kind]; mk(plane(w,h),MT(t,{unlit:kind!=='dark'}),g,0,1.0+h/2,.006);
    mk(box(w+.08,.05,.12),mMoAl,g,0,.98,.05); mk(box(w+.06,.04,.05),mMoAl,g,0,1.02+h,.02); for(const s of [-1,1]) mk(box(.04,h,.05),mMoAl,g,s*(w/2+.01),1.0+h/2,.02); mk(box(.02,h,.03),mMoAl,g,0,1.0+h/2,.02);
    if(ac) FX.moAC(N(g,w/2-.38,.42,0)); },
  moAC(g){ mk(box(.62,.4,.46),col(0xd8d4c8),g,0,.2,.2); for(let x=-.26;x<.27;x+=.05) mk(box(.02,.3,.01),col(0x6a6a62),g,x,.2,.435); mk(box(.5,.04,.04),col(0x8a8a80),g,0,.42,.2); },
  /* the ice machine */
  moIce(g){ mk(box(.8,1.75,.7,{at:[0,.875,0]}),[col(0xd8dee2),col(0xd8dee2),col(0xd8dee2),col(0xd8dee2),MT(tMoIce),col(0xd8dee2)],g); mk(box(.84,.06,.74),col(0x9aa4ac),g,0,1.78,0); },
  /* the sign on its pole at the driveway: MOTEL, PUENTE VIEJO, TV AIRE, and VACANTE under it */
  moSign(g){ mk(cyl(.14,.17,6.4,8,{at:[0,3.2,0]}),col(0x2a3a3e),g); mk(box(.7,.5,.7),MT(tCbRaw),g,0,.25,0);
    const s=N(g,0,5.0,0); mk(box(.24,1.7,3.4),[MT(tMoSignBox),MT(tMoSignBox),col(0x1a2a2e),col(0x1a2a2e),col(0x1a2a2e),col(0x1a2a2e)],s);
    const lit=N(s,0,0,0); for(const sx of [-1,1]) mk(plane(3.2,1.2),MT(tMoNeon,{unlit:true,cut:true,double:true}),lit,sx*.125,.1,0,0,sx*Math.PI/2,0);
    const v=N(g,0,3.7,0); mk(box(.16,.4,1.6),col(0x1a2a2e),v); const vl=N(v,0,0,0); for(const sx of [-1,1]) mk(plane(1.5,.36),MT(tMoVacante,{unlit:true,cut:true,double:true}),vl,sx*.085,0,0,0,sx*Math.PI/2,0);
    return [lit,vl]; },
  /* a bare-bones camper on blocks, someone living in it */
  moCamper(g){ mk(box(5.6,2.2,2.3,{at:[0,1.1,0]}),[MT(tMoTrailerStripe),MT(tMoTrailerStripe),col(0xd8d6cc),col(0x2a2a2c),MT(tMoTrailerStripe),MT(tMoTrailerStripe)],g,0,.4,0);
    mk(box(5.5,.08,2.2),col(0xb8b6ae),g,0,2.64,0); mk(box(.5,1.3,2.2,{tw:1,td:1}),col(0xd8d6cc),g,-2.95,1.45,0,0,0,-.35);
    for(const sx of [-1,1]) mk(cyl(.32,.32,.2,10),col(0x141416),g,.4,.32,sx*1.16,Math.PI/2); for(const x of [-2.4,2.4]) mk(box(.3,.4,.3,{at:[0,.2,0]}),MT(tCbRaw),g,x,0,0);
    mk(box(.8,.08,.08),col(0x3a3a3c),g,3.2,.5,0);
    const w=mk(plane(1.0,.5),MT(tMoWinCamper,{unlit:true}),g,-1.4,1.9,-1.156,0,Math.PI,0); w._keep=true; mk(box(1.08,.58,.03),mMoAl,g,-1.4,1.9,-1.15);
    mk(plane(.8,.4),MT(tMoCurtDark),g,2.3,1.95,-1.156,0,Math.PI,0); mk(box(.88,.48,.03),mMoAl,g,2.3,1.95,-1.15);
    mk(plane(.7,1.8),col(0xc8c4b8),g,.9,1.32,-1.157,0,Math.PI,0); mk(plane(.4,.3),MT(tMoCurtLit,{unlit:true}),g,.9,1.85,-1.16,0,Math.PI,0); mk(box(.06,.06,.04),mMoAl,g,1.15,1.25,-1.18);
    const a=N(g,-.2,2.45,-1.15,-.25,0,0); mk(box(3.4,.03,1.3,{at:[0,0,-.65]}),MT(tAwnGreen,{double:true,repeat:[2,1]}),a); for(const x of [-1.85,1.45]) mk(box(.03,2.2,.03,{at:[0,-1.1,0]}),mMoAl,g,x-.2,2.42,-2.4);
    FX.cinders(N(g,.9,0,-1.5,0,0,0),2,7); FX.gascyl(N(g,3.1,0,-1.45)); FX.pchair(N(g,-1.2,0,-2.0,0,2.6,0)); },
  /* Dale's phone on the table, face up and lit */
  moPhone(g){ mk(box(.075,.012,.15),col(0x141416),g); mk(plane(.064,.13),M(null,{color:0x4a7ac8,unlit:true}),g,0,.0065,0,-Math.PI/2,0,0); },
  /* a cooler on the ground, lid up */
  moCooler(g){ mk(box(.6,.38,.38,{at:[0,.19,0]}),col(0xc8302a),g); mk(box(.62,.05,.4),col(0xe8e4dc),g,0,.42,-.18,-1.2,0,0); for(let i=0;i<4;i++) mk(cyl(.03,.03,.12,6),col(0xc8a040),g,-.2+i*.13,.3,0); },
  /* the international bridge, beyond the east end: deck on piers, lamps, the trucks queued to cross */
  moBridge(g,len=80){ const dk=col(0x5a5852),m=MT(tCbRaw); mk(box(9,.7,len),dk,g,0,7,0); for(const s of [-1,1]) mk(box(.4,1.0,len),m,g,s*4.3,7.8,0);
    for(let z=-len/2+6;z<len/2;z+=14){ mk(box(1.4,7,2),m,g,0,3.5,z); }
    for(let z=-len/2+3;z<len/2;z+=12) for(const s of [-1,1]){ mk(box(.12,5,.12),col(0x3a3a3c),g,s*4.2,10,z); const h=N(g,s*3.6,12.4,z); h._keep=true; mk(box(.9,.12,.32),M(null,{color:0xffc070,unlit:true}),h); }
    for(let i=0;i<5;i++){ const z=-len/2+10+i*15,t=N(g,-2.0,7.35,z); mk(box(2.5,3.2,11,{at:[0,1.6,0]}),col([0xd8d6ce,0x8a2a22,0x2a4a8a,0xd8d6ce,0x5a6a5a][i]),t); mk(box(2.5,2.6,2.2,{at:[0,1.3,0]}),col(0x1a1a1c),t,0,0,6.6);
      const tl=N(t,0,.8,-5.52); tl._keep=true; for(const s of [-1,1]) mk(box(.3,.18,.04),M(null,{color:0xff2a1a,unlit:true}),tl,s*1.0,0,0); } },
  /* the border north of the wall: steel bollards and the floodlights over them */
  moBorder(g,len=120){ mk(plane(len,5.5),MT(tMoBollard,{cut:true,double:true,repeat:[len/.6,1]}),g,0,2.75,0);
    for(let x=-len/2;x<len/2;x+=14){ mk(cyl(.12,.14,9,6,{at:[0,4.5,0]}),col(0x2a2a2c),g,x,0,4); const h=N(g,x,9,3.6); h._keep=true; for(const s of [-1,1]) mk(plane(.5,.32),M(null,{color:0xf2f4ff,unlit:true,double:true}),h,s*.32,0,0); } }
});

/* ---------- the level ---------- */
function genMotel(){
  setWorld(MO.RX,MO.RZ); disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true; FIRES.length=0;
  FLOOR.n=2; FLOOR.test=true; FLOOR.camp=false; FLOOR.mode='motel'; FLOOR.dormD=12; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; FLOOR.out=false; FLOOR.goals={}; FLOOR.rewards=[]; setLang(true);
  const G=floorN,B={g:G},lights=[],TILE=6; GEO_TEMP=true;
  const Lt=(p,c,d,pow='gen',fl=null)=>lights.push({p,c,d,pow,fl});
  const W=(x0,z0,x1,z1,a,b,holes=[],o={})=>stashWall(B,addBox,x0,z0,x1,z1,a,b,holes,o);
  const S=t=>S_(t);
  const EX=S(tMoStucco),BK=S(tMoStuccoB),OFX=S(tMoStuccoO),RAW=S(tCbRaw),I1=S(tInPeach),I2=S(tInMint),I3=S(tInBlue),I4=S(tInYellow),IW=S(tInWhite),TL=S(tWPtile),PAN=S(tWPpanel),LAU=S(tCmuWhite),LAX=S(tCbWhite),HX=S(tCbOchre),SHK=S(tCbTurq),CRG=S(tCorrug);
  /* ground in 6 m pieces so the far ones cull */
  const ground=(x0,z0,x1,z1,t,o={})=>{ for(let x=x0;x<x1-.01;x+=TILE) for(let z=z0;z<z1-.01;z+=TILE) floor(B,x,z,Math.min(x1,x+TILE),Math.min(z1,z+TILE),t,o); };
  /* a solid footprint for something standing: w along its own x, d along its own z, turned by ry (quarter turns) */
  const fb=(x,z,w,d,h,ry=0,kind='furn')=>{ const s=Math.abs(Math.sin(ry))>.5,hx=(s?d:w)/2,hz=(s?w:d)/2; addBox(x-hx,x+hx,z-hz,z+hz,0,h,kind); };
  const P=(fn,x,z,ry,...a)=>place(B,fn,x,z,ry,...a);
  const ceil=(x0,z0,x1,z1)=>mk(plane(x1-x0,z1-z0,Math.max(1,Math.ceil((x1-x0)/1.5)),Math.max(1,Math.ceil((z1-z0)/1.5))),col(0xd6d0c2),G,(x0+x1)/2,WH-.012,(z0+z1)/2,Math.PI/2);
  /* a flat roof: the slab, its lip, the clutter on top */
  const roof=(x0,z0,x1,z1,seed=1)=>{ mk(box(x1-x0+.2,.26,z1-z0+.2),col(0x8a8478),G,(x0+x1)/2,WH+.13,(z0+z1)/2); addBox(x0,x1,z0,z1,WH,WH+.26,'ceil');
    for(const [cx,cz,len,ry] of [[(x0+x1)/2,z0,x1-x0,0],[(x0+x1)/2,z1,x1-x0,0],[x0,(z0+z1)/2,z1-z0,Math.PI/2],[x1,(z0+z1)/2,z1-z0,Math.PI/2]]) P('parapet',cx,cz,ry,len+.2,.3).p[1]=WH+.26;
    const r=rng(seed); for(let i=0;i<Math.min(4,(x1-x0)*(z1-z0)/20|0);i++) P('roofstuff',x0+.8+r()*(x1-x0-1.6),z0+.8+r()*(z1-z0-1.6),0,seed*7+i).p[1]=WH+.26; };
  /* the covered walkway in front of a wing: the overhang and the posts holding it up */
  const porch=(x0,z0,x1,z1,posts)=>{ mk(box(x1-x0,.12,z1-z0),col(0xe2dccc),G,(x0+x1)/2,WH+.06,(z0+z1)/2);
    for(const [x,z] of posts){ mk(box(.1,WH,.1,{at:[0,WH/2,0]}),col(0xe8e2d4),G,x,0,z); addBox(x-.07,x+.07,z-.07,z+.07,0,WH,'furn'); } };
  const walk=(x0,z0,x1,z1)=>{ const w=x1-x0,d=z1-z0; for(let x=x0;x<x1-.01;x+=TILE){ const xb=Math.min(x1,x+TILE); for(let z=z0;z<z1-.01;z+=TILE){ const zb=Math.min(z1,z+TILE); mk(box(xb-x,.07,zb-z),MT(tWalkCo,{repeat:[(xb-x)/1.2,(zb-z)/1.2]}),G,(x+xb)/2,.035,(z+zb)/2); } } };
  const bulb=(x,y,z,pw=true)=>{ mk(cyl(.004,.004,WH-y-.06,3,{at:[0,(WH-y)/2,0]}),mBlack,G,x,y,z); const n=mk(box(.08,.1,.08),M(null,{color:0xffd8a0,unlit:true}),G,x,y,z); if(pw) powered(n,.9,4); else n._keep=true; return n; };
  const porchLight=(x,z,ry)=>{ const n=N(G,x,2.25,z,0,ry,0); mk(box(.14,.2,.1),col(0x2a2a2c),n,0,0,.05); const l=mk(box(.1,.14,.04),M(null,{color:0xffe0a8,unlit:true}),n,0,0,.11); powered(l,.8,4); };
  const tube=(x,z,y=WH-.04,rot=0)=>{ const n=mk(box(1.2,.05,.16),M(null,{color:0xe8f0ff,unlit:true}),G,x,y,z,0,rot,0); powered(n,.6,4); return n; };
  /* a face of a wall: a node on the given side of it (out=+1 the + side), facing out */
  const face=(x,z,alongX,out)=>N(G,alongX?x:x+out*.065,0,alongX?z+out*.065:z,0,alongX?(out>0?0:Math.PI):(out>0?Math.PI/2:-Math.PI/2),0);
  const loot=(k,x,y,z,ry)=>FLOOR.rewards.push({key:k,p:[x,y,z],ry});
  /* only the glowing part of a thing goes dark (and cools) with the power: the rest of it merges with the room */
  const glow=(n,h=.5,cool=10)=>{ for(const k of n.kids) if(k.mesh&&k.mesh.mats.some(m=>m.unlit)) powered(k,h,cool); return n; };

  /* ================= the sky, the border and the bridge ================= */
  { const sky=N(G,0,0,0); sky.live=true; sky._keep=true; FLOOR.sky=sky; const R_=40;
    for(const [x,z,ry] of [[0,-R_,0],[0,R_,Math.PI],[-R_,0,Math.PI/2],[R_,0,-Math.PI/2]]){ const n=mk(plane(R_*2+.4,46),MT(tSkyCo,{unlit:true,double:true,nofog:true,repeat:[2,1]}),sky,x,16,z,0,ry,0); n.mesh.geo.noCull=true; n._keep=true; }
    { const n=mk(plane(R_*2+.4,R_*2+.4),MT(tStarsCo,{unlit:true,double:true,nofog:true,repeat:[3,3]}),sky,0,38.9,0,Math.PI/2,0,0); n.mesh.geo.noCull=true; n._keep=true; } }
  { const n=N(G,0,0,-31); FX.moBorder(n); } { const n=N(G,49,0,-14); FX.moBridge(n); }
  { const n=N(G,42.2,2.6,23.6,0,-Math.PI/2,0); mk(plane(3.2,.8),MT(tMoBridgeSign),n,0,0,0); mk(plane(2.4,.6),MT(tMoUSA),n,0,-.75,0); for(const s of [-1,1]) mk(box(.08,2.8,.08,{at:[0,-1.4,0]}),col(0x5a5c60),n,0,0,s*1.4); }

  /* ================= ground ================= */
  ground(-41,-24.6,-17,18,tDust,{tile:2.2,color:0x8a7a64}); ground(-17,-24.6,-10.2,-11.5,tDust,{tile:2.2,color:0x8a7a64}); ground(-10.2,-24.6,41,-20.5,tDust,{tile:2.2,color:0x7a6c58});
  ground(25,-20.5,41,18,tMoAsph,{tile:2.4}); ground(-4,12,2,18,tMoAsph,{tile:2.4}); ground(16,12,18,18,tFlConc,{tile:2,color:0x8a8a84});
  /* the courtyard round the pool fence; the deck inside it with the basin cut out */
  ground(-10.2,-13,18,-5,tMoAsph,{tile:2.4}); ground(-10.2,5,18,12,tMoAsph,{tile:2.4}); ground(-10.2,-5,-2.5,5,tMoAsph,{tile:2.4}); ground(9.5,-5,18,5,tMoAsph,{tile:2.4});
  floorHole(B,-2.5,-5,9.5,5,-.6,-3,7.6,3,tFlConc,{tile:1.6,color:0xb8b4a8});
  /* the street: sidewalks, the road, the far side */
  ground(-43,18,43,19.6,tWalkCo,{tile:1.2}); ground(-43,19.6,43,22.8,tMoAsph,{tile:2.4}); ground(-43,22.8,43,25,tWalkCo,{tile:1.2});
  for(let x=-41;x<42;x+=4) mk(box(2,.004,.12),col(0xd8d0b0),G,x,.006,21.2); for(const z of [19.6,22.8]) mk(box(86,.07,.06),col(0x9a968c),G,0,.035,z);
  for(const [x,z,s,ry,t] of [[-20,21,2.4,.3,tCrackCo],[6,20.4,1.8,1.2,tOilCo],[24,21.8,2.6,.4,tCrackCo],[-36,20.6,2,1,tCrackCo],[36,20.5,1.6,.2,tOilCo],[-6,-7,1.6,.6,tOilCo],[12,-9,1.4,.2,tOilCo],[14,7.6,1.8,1.1,tOilCo],[-6,6,2.2,.3,tCrackCo],
    [30,-10,2.4,.6,tCrackCo],[34,8,2.2,.2,tOilCo],[28,12,1.8,1.4,tCrackCo],[-30,-18,2.2,.4,tCrackCo],[-22,6,1.8,.7,tPuddleCo],[0,-22.6,1.8,0,tPuddleCo],[-9,20.8,1.6,0,tPuddleCo]]) P('decal',x,z,0,t,s,s,ry);
  /* parking stalls in front of the rooms */
  for(let i=0;i<=8;i++) mk(box(.08,.004,4.0),col(0xd8d0b0),G,-10.2+i*3.525,.006,-9.0);
  for(const z of [-9,-4.5,0,4.5,9]) mk(box(4.0,.004,.08),col(0xd8d0b0),G,14.0,.006,z);
  for(const x of [2,5.5,9,12.5,16]) mk(box(.08,.004,3.8),col(0xd8d0b0),G,x,.006,8.1);
  walk(-10.2,-13,18,-11.2); walk(16.2,-11.2,18,12); walk(-10.2,-11.2,-8.4,12); walk(2,10.2,16,12); walk(-10.2,10.2,-4,12);
  walk(-43,18,-33.2,19.6); walk(-29.6,18,-4,19.6); walk(2,18,35.4,19.6); walk(40.6,18,43,19.6);

  /* ================= the west wing: rooms 1 to 4, the alcove you start in, the linen room behind it ================= */
  W(-17,-11.5,-17,12,I1,BK,[win(-5.2,.55,1.55,2.05),gap(.4,1.0),win(4.5,.55,1.55,2.05)]); W(-13,-2,-13,2,IW,IW);
  for(const z of [-9.6,9.8]){ const n=face(-17,z,false,-1); n.p[1]=1.5; mk(plane(.55,.5),MT(tMoCurtDark),n,0,.25,.004); }
  W(-10.2,-11.5,-10.2,12,EX,I1,[gap(-2.9,1.0),win(-5.2,1.3,.95,2.0),gap(0,4,WH),gap(2.9,1.0),win(4.9,1.3,.95,2.0)]);
  for(const [z,n,wz,k] of [[-7.6,1,-9.7,'dark'],[7.9,4,10.0,'lit']]){ FX.moDoor(face(-10.2,z,false,1),n); FX.moWin(face(-10.2,wz,false,1),k); }
  for(const [z,n] of [[-2.9,2],[2.9,3]]) FX.moFrame(face(-10.2,z,false,1),n);
  W(-17,-11.5,-10.2,-11.5,I1,BK); W(-17,12,-10.2,12,PAN,I1); W(-17,-6.75,-10.2,-6.75,I1,I1);
  W(-17,-2,-10.2,-2,IW,I1); W(-17,2,-10.2,2,I1,IW); W(-17,7,-10.2,7,I1,I1);
  W(-15.2,-6.75,-15.2,-2,I1,TL,[gap(-6.1,.85)]); W(-15.2,2,-15.2,7,I1,TL,[gap(6.1,.85)]);
  roof(-17,-11.5,-10.2,12,3); porch(-10.2,-11.5,-8.4,12,[[-8.5,-9.6],[-8.5,-5.3],[-8.5,-.9],[-8.5,3.6],[-8.5,7.9],[-8.5,11.9]]);
  for(const [x0,z0,x1,z1] of [[-17,-6.75,-10.2,-2],[-17,2,-10.2,7]]) ceil(x0,z0,x1,z1); ceil(-17,-2,-10.2,2);
  floor(B,-17,-2,-10.2,2,tFlConc,{tile:1.6,y:.004,color:0x9a968c}); FX.moFrame(face(-17,.4,false,-1),null); floor(B,-15.2,-6.75,-10.2,-2,tMoCarpet,{tile:1.2,y:.004}); floor(B,-15.2,2,-10.2,7,tMoCarpet,{tile:1.2,y:.004});
  floor(B,-17,-6.75,-15.2,-2,tFlTile,{tile:.6,y:.004}); floor(B,-17,2,-15.2,7,tFlTile,{tile:.6,y:.004});
  /* the alcove: a bare bulb. Behind it the linen room, onto the lot: shelves of towels, the maid's cart */
  bulb(-11.9,2.35,0); Lt([-11.9,2.3,0],[1.1,.85,.5],3.2);
  P('wShelf',-15.0,-1.62,0,2.6,4); fb(-15.0,-1.62,2.6,.6,2.1); P('wShelf',-15.4,1.62,0,2.0,4); fb(-15.4,1.62,2.0,.6,2.1);
  { const n=N(G,-14.0,0,.2,0,.3,0); mk(box(.5,.8,1.0,{at:[0,.5,0]}),col(0x5a6a7a),n); mk(box(.46,.3,.9),col(0xe8e4dc),n,0,1.0,0); fb(-14.0,.2,.7,1.1,1.1); } P('litter',-15,0,0,4,2501,.8);
  /* by the corner onto the lot: the ice machine and the soda machine under a light */
  { const n=P('moIce',-12.3,-11.95,Math.PI); fb(-12.3,-11.95,.8,.7,1.8); }
  { const n=P('wVend',-13.5,-11.95,Math.PI); glow(n,.55,15); fb(-13.5,-11.95,.9,.8,1.85); } Lt([-13.2,1.2,-12.6],[.9,.35,.3],2.6);
  porchLight(-12.9,-11.56,Math.PI); Lt([-12.9,2.1,-12.0],[1.3,1.0,.6],4.6); P('poster',-16.9,-12.5,-Math.PI/2,tPosterMissing).p[1]=1.5;
  /* room 2: unmade, a TV on the dresser, nobody home */
  P('bed',-13.0,-5.6,Math.PI/2,tQuiltMessy,1.4,{messy:true}); fb(-13.0,-5.6,1.4,2.0,.6,Math.PI/2); P('nightstand',-14.7,-6.35,0,false); fb(-14.7,-6.35,.45,.4,.55);
  P('dresser',-12.6,-2.3,Math.PI,1.1); fb(-12.6,-2.3,1.1,.48,.9); P('crt',-12.6,-2.35,Math.PI,false).p[1]=.85;
  P('bottles',-11.4,-3.4,0,3,2502); P('poster',-16.94+1.8,-4.3,Math.PI/2,tCalendarCo).p[1]=1.5;
  P('toilet',-16.6,-3.0,Math.PI/2); P('tub',-16.3,-5.8,Math.PI/2); fb(-16.3,-5.8,1.6,.75,.6,Math.PI/2);
  /* room 3: the TV on, somebody's sleeping bag, a bottle on the nightstand */
  P('bed',-13.0,5.7,Math.PI/2,tQuiltNavy,1.4); fb(-13.0,5.7,1.4,2.0,.6,Math.PI/2); P('nightstand',-14.7,6.55,0,true); fb(-14.7,6.55,.45,.4,.55);
  P('dresser',-12.6,2.3,0,1.1); fb(-12.6,2.3,1.1,.48,.9); { const tv=P('crt',-12.6,2.35,0,true); tv.p[1]=.85; glow(tv); } Lt([-12.6,1.1,2.9],[.45,.6,1.2],3.2,'gen','tv');
  P('toilet',-16.6,3.0,Math.PI/2); P('tub',-16.3,5.8,Math.PI/2); fb(-16.3,5.8,1.6,.75,.6,Math.PI/2);
  loot('bottle',-14.7,.55,6.55,.4);

  /* ================= the office: the lobby on the courtyard, the back office, the breaker outside ================= */
  W(-10.2,12,-4,12,PAN,EX,[gap(-5.0,1.1),win(-8.2,1.6,.95,2.1)]);
  W(-17,12,-17,18,PAN,BK,[gap(16.6,1.0)]); W(-17,18,-4,18,OFX,PAN,[win(-14.0,1.3,1.0,2.0),gap(-7.2,1.2),win(-5.3,1.2,.9,2.1)]); W(-4,12,-4,18,OFX,PAN,[win(15.0,1.0,.95,2.0)]);
  W(-10.2,12,-10.2,18,PAN,PAN,[gap(13.2,1.0)]);
  roof(-17,12,-4,18,5); ceil(-17,12,-4,18); floor(B,-10.2,12,-4,18,tVct,{tile:1.2,y:.004}); floor(B,-17,12,-10.2,18,tFlLino,{tile:1.2,y:.004});
  { const n=face(-7.2,18,true,1); n.p[1]=2.35; n._keep=false; const l=mk(plane(1.8,.32),MT(tMoRecep,{unlit:true,cut:true}),n,0,0,.03); powered(l,.7,5); mk(box(1.9,.36,.04),col(0x0c0c10),n,0,0,0); }
  /* the counter with the register and the bell, the clerk's chair behind it, the TV up in the corner */
  P('counter',-8.1,14.5,0,4.2,tCabinetDark,tCounterTop,{upper:false}); fb(-8.1,14.5,4.2,.62,1.0);
  { const n=N(G,-7.4,.93,14.45,0,.2,0); mk(box(.36,.02,.26),col(0x2a1a12),n); mk(plane(.34,.24),MT(tMoBook),n,0,.012,0,-Math.PI/2,0,0); mk(cyl(.04,.05,.04,8),col(0xc8a040),G,-6.6,.95,14.4); }
  P('chair',-8.4,13.0,0,0x2a2a2e); { const tv=P('crt',-9.7,12.5,Math.PI*.8,true); tv.p[1]=1.6; glow(tv); } Lt([-9.4,1.9,12.9],[.45,.6,1.2],3.0,'gen','tv');
  for(let i=0;i<3;i++) P('pchair',-4.5,15.8+i*.6,-Math.PI/2); fb(-4.5,16.4,.5,1.8,.8); P('bucketplant',-9.8,17.5,0,0x2e6a2e,7); P('poster',-4.07,13.4,-Math.PI/2,tPosterLucha).p[1]=1.5;
  tube(-7,15); Lt([-7,2.45,15],[1.5,1.55,1.5],6.5);
  /* the back office: the desk with the cash box, the safe, the cot, the cameras */
  P('desk',-15.8,13.0,0,true,0x4a3424); fb(-15.8,13.0,1.2,.6,.8); P('chair',-15.8,13.7,Math.PI,0x1a1a1c); P('safe',-16.5,17.4,Math.PI); fb(-16.5,17.4,.8,.6,1.6);
  P('monitors',-12.4,12.4,0); fb(-12.4,12.6,2.0,.8,1.0); FURN.mattress(N(G,-13.2,0,16.8,0,Math.PI/2,0)); fb(-13.2,16.8,.9,1.9,.3,Math.PI/2);
  { const n=N(G,-15.6,.78,13.0,0,.4,0); mk(box(.3,.12,.2),col(0x6a6a5a),n,0,.06,0); }
  bulb(-13.8,2.35,15.2); Lt([-13.8,2.3,15.2],[1.25,.95,.6],4.6); Lt([-12.4,1.3,13.2],[.4,.7,.55],3.0,'gen','tv');
  /* outside on the back wall: the meter, the breaker box and its handle (pull it, or shoot the box) */
  { const n=face(-17,15.4,false,-1); FX.meter(n); }
  { mk(box(.16,.7,.5),col(0x7a7e80),G,-17.14,1.2,14.4); mk(plane(.4,.6),MT(tPanelW),G,-17.225,1.2,14.4,0,-Math.PI/2,0); const pb=addBox(-17.3,-17.06,14.1,14.7,.85,1.55,'generator'); pb.onHit=()=>motelPower(false);
    const lv=N(G,MO_SW[0]+.04,MO_SW[1],MO_SW[2]); lv.live=true; mk(box(.04,.16,.04,{at:[0,.08,0]}),col(0xb81a14),lv); mk(box(.1,.04,.04),col(0xb81a14),lv,-.03,.16,0); FLOOR.lever=lv; motelLever(); }
  bulb(-17.4,2.3,16.6); Lt([-17.6,2.2,16.6],[1.2,.9,.55],4.0);

  /* ================= the north wing: rooms 5 to 12, knocked through ================= */
  const NX0=-10.2,NW_=3.525,inN=[I1,I2,I3,I1,I2,I3,I1,I2];
  const nwFront=[ /* door: 'open' a doorway, 'shut' a closed door; window kind */
    ['open','dark'],['shut','dark'],['shut','dark'],['open','lit'],['open','tv'],['shut','dark'],['shut','dark'],['shut','dark']];
  for(let i=0;i<8;i++){ const x0=NX0+i*NW_,x1=x0+NW_,dx=x0+.9,wx=x0+2.55,num=5+i,[dk,wk]=nwFront[i];
    W(x0,-13,x1,-13,EX,inN[i],dk==='open'?[gap(dx,1.0),win(wx,1.1,.95,2.0)]:[win(wx,1.1,.95,2.0)]);
    if(dk==='open') FX.moFrame(face(dx,-13,true,1),num); else FX.moDoor(face(dx,-13,true,1),num);
    { const n=face(x0+.75,-20.5,true,-1); n.p[1]=1.6; mk(plane(.5,.45),MT(tMoCurtDark),n,0,.22,.004); }
    W(x0,-20.5,x1,-20.5,inN[i],BK,[]);
    ceil(x0,-20.5,x1,-13); floor(B,x0,-20.5,x1,-13,i===4||i===5?tFlLino:tMoCarpet,{tile:1.2,y:.004});
    /* curtains half across the windows, from inside */
    { const n=N(G,wx+.25,0,-13.08,0,Math.PI,0); FX.curtain(n,.6,1.1,[tCurtACo,tCurtBCo,tCurtCCo][i%3]); } }
  /* the walls between: each knocked through, rubble at the foot of the hole */
  const holes=[-16.0,-17.6,-15.6,-17.2,-15.8,-17.6,-15.8];
  for(let i=1;i<8;i++){ const x=NX0+i*NW_,z=holes[i-1]; W(x,-20.5,x,-13,inN[i],inN[i-1],[gap(z,1.0,2.0)]);
    if(i!==4){ const r=rng(2700+i); for(const s of [-1,1]){ P('cinders',x+s*.45,z+.75,r()*3,4,i*3+s); }
      for(let k=0;k<9;k++){ const side=k%3,t=r(),zz=side===0?z-.5+t*.06:side===1?z+.5-t*.06:z-.5+t,yy=side===2?2.0-.05+r()*.1:.3+r()*1.6,w=.06+r()*.1;
        mk(box(.16,side===2?.08+r()*.1:.14+r()*.3,side===2?.12+r()*.2:w),col([0xd8c8b0,0xc8b8a0,0x8a8478][k%3]),G,x+(r()-.5)*.04,yy,zz,0,0,(r()-.5)*.5); }
      P('decal',x,z,0,tCrackCo,1.2,1.4,i); } }
  roof(-10.2,-20.5,18,-13,7);
  porch(-10.2,-13,18,-11.2,[[-10.1,-11.3],[-6.675,-11.3],[-3.15,-11.3],[.375,-11.3],[3.9,-11.3],[7.425,-11.3],[10.95,-11.3],[14.475,-11.3],[17.9,-11.3]]);
  for(const x of [-5.0,4.8,16.2]) porchLight(x,-12.94,0); for(const x of [-5.0,4.8,16.2]) Lt([x,2.1,-12.6],[1.3,1.0,.6],4.0);
  W(-10.2,-20.5,-10.2,-13,I1,BK);
  /* 5: kicked in, stripped; 6: the junk room; 7: the product; 8 and 9: the party; 10: where they sleep; 11: nothing; 12: the beer */
  FURN.mattress(N(G,-8.4,0,-19.4,0,0,0)); P('trashbags',-7.3,-14.2,0,3,2601); P('litter',-8.4,-16.5,0,10,2602,1.2); fb(-7.3,-14.2,.9,.7,.4);
  for(const [x,z,ry] of [[-5.9,-19.8,0],[-4.6,-19.6,.2]]){ const n=N(G,x,0,z,0,ry,0); mk(box(1.4,1.9,.3,{at:[0,.95,0]}),col(0x5a3a24),n); } fb(-5.2,-19.7,2.6,.5,1.9); P('chair',-3.9,-14.1,2.3); P('tires',-6.0,-14.0,0,3,4);
  P('table',-1.4,-17.4,0,1.4,.8,0x7a7c80); fb(-1.4,-17.4,1.4,.8,.8); P('bricksPile',-1.4,-17.4,0,10,2603).p[1]=.8; P('stash',-2.5,-19.8,0); fb(-2.5,-19.8,.9,.6,1.3);
  P('sofa',2.2,-19.6,0,0x6a3a2a,2.0); fb(2.2,-19.6,2.0,.9,.9); P('moCooler',.9,-14.2,.3); P('bottles',2.6,-16.4,0,6,2604); P('table',2.6,-15.0,0,.9,.6,0xd8d4cc); fb(2.6,-15.0,.9,.6,.8);
  { const n=N(G,1.4,0,-19.95); FX.nightstand(n,true); } Lt([1.4,1.2,-19.6],[1.4,1.0,.55],4.5);
  P('sofa',5.6,-19.3,0,0x3a4a5a,2.1); fb(5.6,-19.3,2.1,.9,.9); P('coffee',5.6,-18.0,0,true); fb(5.6,-18.0,1.1,.6,.45);
  { const tv=P('crt',5.6,-13.5,Math.PI,true); glow(tv); fb(5.6,-13.5,.7,.5,1.0); } Lt([5.6,1.0,-14.2],[.5,.65,1.3],4.0,'gen','tv');
  P('bottles',5.4,-18.0,0,5,2605).p[1]=.45; P('moCooler',7.0,-17.6,-.4);
  for(const z of [-19.6,-17.4]) FURN.mattress(N(G,8.9,0,z,0,Math.PI/2,0)); fb(8.9,-18.5,1.9,2.6,.3); P('laundry',9.2,-15.0,0,2.6); P('trashbags',10.2,-14.0,0,2,2606);
  P('litter',12.6,-16.4,0,8,2607,1.3);
  for(let i=0;i<6;i++) mk(box(.4,.3,.3,{at:[0,.15,0]}),col(0xc8a040),G,15.2+(i%3)*.42,(i/3|0)*.3,-19.9); fb(15.6,-19.9,1.3,.4,.6); P('chair',16.6,-14.4,-.4);
  loot('bottle',2.4,.06,-18.0,.4);
  /* the bathrooms in the rooms that still have them */
  for(const i of [0,2,4,6]){ const x0=NX0+i*NW_,x1=x0+NW_; W(x0,-18.7,x1,-18.7,inN[i],TL,[gap(x1-.6,.8)]); P('toilet',x0+.5,-20.1,0); P('vanity',x0+1.7,-20.1,0); fb(x0+1.7,-20.1,.8,.5,.9); }

  /* ================= the east wing: Dale's suite (14), then 15 to 20 ================= */
  W(18,-20.5,18,-13,I4,I2,[gap(-17.5,1.0)]);
  W(18,-13,18,18,I2,EX,[gap(-12.0,1.1),win(-10.1,1.2,.95,2.0),gap(-8.1,1.0),win(-6.2,1.2,.95,2.0),gap(.9,1.0),win(2.8,1.2,.95,2.0)]);
  for(const [z,n] of [[-12.0,14],[-8.1,15],[.9,17]]) FX.moFrame(face(18,z,false,-1),n);
  for(const [z,n,wz,k] of [[-3.6,16,-1.7,'dark'],[5.4,18,7.3,'lit'],[9.9,19,11.8,'tv'],[14.4,20,16.3,'dark']]){ FX.moDoor(face(18,z,false,-1),n); FX.moWin(face(18,wz,false,-1),k); }
  W(25,-20.5,25,-15,BK,IW,[gap(-16.2,1.0)]); W(25,-15,25,-9,BK,I4,[win(-11.2,1.1,1.0,2.0)]); W(25,-9,25,18,BK,I2,[win(-5.6,.55,1.55,2.05),win(3.4,.55,1.55,2.05)]);
  W(18,-20.5,25,-20.5,IW,BK,[win(20.4,1.2,1.0,2.0)]); W(18,18,25,18,EX,I2);
  W(18,-15,25,-15,I4,IW,[gap(19.6,1.0)]); W(18,-9,25,-9,I2,I4); for(const z of [-4.5,0,4.5,9,13.5]) W(18,z,25,z,I2,I2);
  W(22.6,-20.5,22.6,-17.6,TL,IW); W(22.6,-17.6,25,-17.6,IW,TL,[gap(23.4,.85)]);
  W(23.2,-9,23.2,-4.5,TL,I2,[gap(-8.2,.85)]); W(23.2,0,23.2,4.5,TL,I2,[gap(.8,.85)]);
  roof(18,-20.5,25,18,11); porch(16.2,-11.2,18,12,[[16.3,-8.2],[16.3,-4.5],[16.3,0],[16.3,4.5],[16.3,9],[16.3,11.9]]);
  for(const [x0,z0,x1,z1] of [[18,-20.5,25,-15],[18,-15,25,-9],[18,-9,25,-4.5],[18,0,25,4.5]]) ceil(x0,z0,x1,z1);
  floor(B,18,-15,25,-9,tMoCarpet,{tile:1.2,y:.004}); floor(B,18,-20.5,22.6,-15,tMoCarpet,{tile:1.2,y:.004,color:0xb8a0a0}); floor(B,22.6,-20.5,25,-17.6,tFlTile,{tile:.6,y:.004}); floor(B,22.6,-17.6,25,-15,tMoCarpet,{tile:1.2,y:.004,color:0xb8a0a0});
  floor(B,18,-9,23.2,-4.5,tMoCarpet,{tile:1.2,y:.004}); floor(B,23.2,-9,25,-4.5,tFlTile,{tile:.6,y:.004}); floor(B,18,0,23.2,4.5,tMoCarpet,{tile:1.2,y:.004}); floor(B,23.2,0,25,4.5,tFlTile,{tile:.6,y:.004});
  porchLight(17.94,-13.0,-Math.PI/2); porchLight(17.94,-6.0,-Math.PI/2); porchLight(17.94,5.4,-Math.PI/2); for(const z of [-6.0,5.4]) Lt([17.5,2.1,z],[1.3,1.0,.6],4.0);
  /* the suite: the couch and the TV, the coffee table with his phone on it, the kitchenette, the bag of money */
  P('sofa',21.5,-12.4,Math.PI,0x7a6a52,2.2); fb(21.5,-12.4,2.2,.9,.9); P('coffee',21.5,-13.4,0,true); fb(21.5,-13.4,1.1,.6,.45);
  P('dresser',21.5,-14.7,0,1.2); fb(21.5,-14.7,1.2,.48,.9); { const tv=P('crt',21.5,-14.68,0,true); tv.p[1]=.85; glow(tv); } Lt([21.5,1.15,-14.0],[.5,.65,1.35],4.2,'gen','tv');
  { const ph=N(G,MO_PHONE[0],MO_PHONE[1],MO_PHONE[2],0,.4,0); ph.live=true; FX.moPhone(ph); FLOOR.phoneN=ph; }
  P('counter',23.0,-9.33,Math.PI,2.8,tCabinetOak,tCounterTop,{upper:false}); fb(23.0,-9.33,2.8,.62,1.0); P('fridge',24.6,-10.0,-Math.PI/2); fb(24.6,-10.0,.72,.72,1.8,-Math.PI/2);
  P('table',23.4,-11.8,0,.9,.9,0x6a4a30); fb(23.4,-11.8,.9,.9,.8); P('chair',23.4,-12.6,0); P('bottles',23.4,-11.8,0,5,2611).p[1]=.8;
  { const n=N(G,19.0,0,-10.0,0,.5,0); mk(box(.7,.32,.32,{at:[0,.16,0]}),col(0x2a2e26),n); mk(box(.2,.06,.12),MT(tCash),n,.1,.34,0); }
  P('rug',21.5,-13.2,0,2.4,1.8,tRugRed); P('poster',24.93,-13.0,-Math.PI/2,tPosterVote).p[1]=1.5;
  P('bed',20.6,-18.6,Math.PI/2,tQuiltMessy,1.5,{messy:true}); fb(20.6,-18.6,1.5,2.0,.6,Math.PI/2); P('nightstand',18.5,-19.9,0,true); fb(18.5,-19.9,.45,.4,.55); Lt([18.6,1.1,-19.6],[1.3,.95,.55],4.0);
  P('wardrobe',21.8,-15.3,Math.PI); fb(21.8,-15.3,1.0,.6,1.9); P('trashbags',19.0,-15.6,0,2,2612);
  P('tub',24.2,-19.0,Math.PI/2); fb(24.2,-19.0,1.6,.75,.6,Math.PI/2); P('toilet',23.1,-20.1,0); bulb(23.8,2.35,-18.0); Lt([23.8,2.3,-18.0],[1.1,1.0,.8],3.0);
  /* 15: dark, a mattress and bags; 17: the lookout's room, a game on the TV */
  FURN.mattress(N(G,20.2,0,-6.6,0,Math.PI/2,0)); P('trashbags',22.4,-8.4,0,3,2613); fb(20.2,-6.6,.9,1.9,.3,Math.PI/2);
  P('bed',20.4,2.5,Math.PI/2,tQuiltCrazy,1.4); fb(20.4,2.5,1.4,2.0,.6,Math.PI/2); { const tv=P('crt',21.0,.35,0,true); glow(tv); fb(21.0,.35,.7,.5,1.0); } Lt([21.0,1.0,.9],[.5,.65,1.3],3.4,'gen','tv'); P('pchair',21.4,1.4,Math.PI);
  P('toilet',24.6,-6.0,-Math.PI/2); P('toilet',24.6,2.0,-Math.PI/2);

  /* ================= the south wing: 21 to 24, on the street ================= */
  W(2,12,16,12,I3,EX,[gap(6.4,1.0),win(8.0,1.1,.95,2.0),gap(9.9,1.0),win(11.5,1.1,.95,2.0)]);
  FX.moFrame(face(6.4,12,true,-1),23); FX.moFrame(face(9.9,12,true,-1),22);
  for(const [x,n,wx,k] of [[2.9,24,4.5,'dark'],[13.4,21,15.0,'lit']]){ FX.moDoor(face(x,12,true,-1),n); FX.moWin(face(wx,12,true,-1),k); }
  W(2,18,16,18,OFX,I3,[win(7.2,.55,1.55,2.05),win(10.8,.55,1.55,2.05)]); for(const x of [3.6,14.4]){ const n=face(x,18,true,1); n.p[1]=1.6; mk(plane(.5,.45),MT(tMoCurtDark),n,0,.22,.004); }
  W(2,12,2,18,I3,EX); W(16,12,16,18,EX,I3); for(const x of [5.5,9,12.5]) W(x,12,x,18,I3,I3);
  W(5.5,16.2,9,16.2,TL,I3,[gap(6.2,.8)]); W(9,16.2,12.5,16.2,TL,I3,[gap(11.8,.8)]);
  roof(2,12,16,18,13); porch(2,10.2,16,12,[[2.1,10.3],[5.5,10.3],[9,10.3],[12.5,10.3],[15.9,10.3]]); porchLight(9,12.06,Math.PI); Lt([9,2.1,11.6],[1.3,1.0,.6],4.0);
  for(const [x0,x1] of [[5.5,9],[9,12.5]]){ ceil(x0,12,x1,18); floor(B,x0,12,x1,16.2,tMoCarpet,{tile:1.2,y:.004}); floor(B,x0,16.2,x1,18,tFlTile,{tile:.6,y:.004}); }
  P('bed',7.3,14.6,0,tQuiltWhite,1.4,{messy:true}); fb(7.3,14.6,1.4,2.0,.6); P('toilet',6.0,17.5,Math.PI);
  P('bed',10.8,14.5,0,tQuiltPurple,1.4); fb(10.8,14.5,1.4,2.0,.6); P('nightstand',12.1,13.0,0,false); P('toilet',12.0,17.5,Math.PI); P('litter',10.2,13.4,0,5,2621,.6);
  /* the passage between the wings onto the street: bins, the payphone */
  P('bins',16.4,16.6,Math.PI/2,2); fb(16.75,16.95,.7,1.4,1.05); bulb(17,2.35,14.5); Lt([17,2.3,14.5],[1.25,.95,.6],4.0);
  { const n=face(16,13.6,false,1); n.p[1]=1.0; mk(box(.32,.5,.18),col(0x2a3a6a),n,0,.4,.09); mk(box(.06,.18,.06),col(0x141416),n,.08,.45,.2); }
  roof(16,12,18,18,15);

  /* ================= the courtyard: the pool, the cars, the lamps ================= */
  { const x0=-.6,x1=7.6,z0=-3,z1=3,dp=1.4,PT=MT(tMoPool,{repeat:[4,1]}),PF=MT(tMoPoolFloor,{repeat:[3,2]});
    mk(plane(x1-x0,z1-z0),PF,G,(x0+x1)/2,-dp,(z0+z1)/2,-Math.PI/2);
    mk(plane(x1-x0,dp),PT,G,(x0+x1)/2,-dp/2,z0,0,0,0); mk(plane(x1-x0,dp),PT,G,(x0+x1)/2,-dp/2,z1,0,Math.PI,0); mk(plane(z1-z0,dp),PT,G,x0,-dp/2,(z0+z1)/2,0,Math.PI/2,0); mk(plane(z1-z0,dp),PT,G,x1,-dp/2,(z0+z1)/2,0,-Math.PI/2,0);
    mk(plane(5.2,3.4),MT(tMoMurk,{cut:true}),G,4.6,-dp+.12,.6,-Math.PI/2);
    for(const [cx,cz,w,d] of [[(x0+x1)/2,z0-.15,x1-x0+.6,.3],[(x0+x1)/2,z1+.15,x1-x0+.6,.3],[x0-.15,(z0+z1)/2,.3,z1-z0],[x1+.15,(z0+z1)/2,.3,z1-z0]]) mk(box(w,.06,d),col(0xd8d4c8),G,cx,.03,cz);
    addBox(x0-.05,x1+.05,z0-.05,z1+.05,0,.5,'furn');
    { const n=N(G,6.6,0,z0+.02); for(const s of [-1,1]) mk(box(.04,1.0,.04),mMoAl,n,s*.25,.1,.1); for(let y=-1.2;y<0;y+=.3) mk(box(.5,.03,.03),mMoAl,n,0,y,.06); }
    { const n=N(G,1.6,-dp+.02,-1.0,0,.8,0); n.p[1]=-dp+.02; mk(box(.65,.1,1.8),col(0xe8e4dc),n,0,.25,0,0,0,.4); }
    { const n=N(G,3.0,-dp,1.6,0,.6,.0); mk(box(.5,.5,.8,{at:[0,.25,0]}),MT(tChain,{cut:true,double:true}),n,0,0,0,0,0,1.2); } }
  /* the fence round it: two gaps, the sign */
  { const F=(x0,z0,x1,z1)=>{ const ax=Math.abs(x1-x0)>.01,len=ax?x1-x0:z1-z0,n=N(G,(x0+x1)/2,0,(z0+z1)/2,0,ax?0:Math.PI/2,0); FX.chainlink(n,len); if(ax) addBox(x0,x1,z0-.03,z0+.03,0,1.45,'win'); else addBox(x0-.03,x0+.03,z0,z1,0,1.45,'win'); };
    F(-2.5,-5,9.5,-5); F(-2.5,5,2.6,5); F(3.8,5,9.5,5); F(-2.5,-5,-2.5,-.2); F(-2.5,1.0,-2.5,5); F(9.5,-5,9.5,5);
    { const n=N(G,6,0,5.03); n.p[1]=1.1; mk(plane(.5,.25),MT(tMoNoSwim),n); } }
  for(const [x,z,ry] of [[8.6,-2.6,0],[8.6,.3,0]]){ P('lounger',x,z,ry); fb(x,z,.65,1.8,.6); }
  P('table',2.1,4.0,0,.8,.8,0xe8e4dc); fb(2.1,4.0,.8,.8,.8); P('bottles',2.1,4.0,0,4,2631).p[1]=.8; P('pchair',.6,3.4,1.2); P('pchair',3.6,4.4,-1.6); P('moCooler',2.6,3.3,.2); loot('bottle',1.9,.8,4.2,.2);
  P('palm',8.7,-4.3,0,6.5,3); fb(8.7,-4.3,.4,.4,6); P('palm',-1.8,4.2,0,5.8,5); fb(-1.8,4.2,.4,.4,6);
  /* the cars: Dale's pickup at his door, the crew's SUV, a dead sedan, a green one */
  P('auto',13.8,-8.2,Math.PI/2,0xe8e6de,'pickup',{plate:'TX'}); fb(13.8,-8.2,1.76,4.9,1.6,Math.PI/2);
  P('auto',2.0,-8.7,Math.PI/2,0x141416,'suv',{plate:'CHH'}); fb(2.0,-8.7,1.8,4.6,1.7,Math.PI/2);
  { const n=P('auto',-6.6,5.5,0,0x7a5a3a,'sedan',{hub:false,plate:'SIN'}); n.p[1]=-.04; } fb(-6.6,5.5,1.66,4.2,1.3);
  P('auto',11.5,7.6,Math.PI,0x2a5a3a,'sedan',{plate:'COA'}); fb(11.5,7.6,1.66,4.2,1.3);
  for(const [x,z] of [[-5.2,-7.4],[12.6,3.6]]){ P('sodium',x,z,x<0?0:Math.PI,1.4); fb(x,z,.24,.24,6); Lt([x+(x<0?1.4:-1.4),5.85,z],[2.3,1.3,.5],14,'gen','buzz'); }
  P('litter',4,8,0,8,2632,2.5); P('litter',-4,-10,0,6,2633,2.0); P('bucketplant',-9.0,-12.2,0,0x3a7a3a,2); P('bucketplant',17.4,-12.4,0,0x3a7a3a,3);
  /* the sign at the driveway */
  { const n=N(G,2.9,0,19.0,0,0,0); const [a,b]=FX.moSign(n); powered(a,.7,5); powered(b,.7,5); fb(2.9,19.0,.7,.7,6.4); } Lt([2.9,5.0,19.3],[1.7,.45,.5],7.5,'gen','buzz'); Lt([2.9,3.7,19.3],[.5,1.4,.5],3.5,'gen','buzz');

  /* ================= the back lot: the laundry, the manager's house, the fire, the side lot ================= */
  W(-29,-17,-22,-17,LAU,LAX,[gap(-26.5,1.0)]); W(-29,-11,-22,-11,LAX,LAU,[win(-25.4,1.4,1.0,2.0)]); W(-29,-17,-29,-11,LAU,LAX); W(-22,-17,-22,-11,LAX,LAU,[gap(-12.4,1.0)]);
  roof(-29,-17,-22,-11,17); ceil(-29,-17,-22,-11); floor(B,-29,-17,-22,-11,tFlConc,{tile:1.6,y:.004,color:0xb8b4ac});
  for(let i=0;i<4;i++){ P('washer',-28.55,-16.3+i*.68,Math.PI/2); } fb(-28.55,-15.3,.6,2.8,.9,0);
  for(let i=0;i<3;i++){ const n=N(G,-25.4+i*.66,0,-16.55,0,0,0); FX.washer(n); const t=N(n,0,.86,0); FX.washer(t); } fb(-24.74,-16.55,2.0,.6,1.7);
  P('table',-25.2,-13.6,0,1.8,.8,0xd8d4cc); fb(-25.2,-13.6,1.8,.8,.8);
  { const n=N(G,-23.0,0,-15.4); mk(box(.6,.7,.9,{at:[0,.45,0]}),MT(tChain,{cut:true,double:true}),n); mk(box(.58,.3,.86),col(0xe8e4dc),n,0,.6,0); fb(-23,-15.4,.6,.9,.8); }
  tube(-25.6,-14); Lt([-25.6,2.45,-14],[1.5,1.6,1.6],6.4); loot('bottle',-25.0,.82,-13.7,.5);
  { const n=N(G,-21.94,2.4,-12.4,0,Math.PI/2,0); mk(box(.4,.3,.2),col(0x2a2a2c),n,0,0,.1); const l=mk(plane(.34,.22),M(null,{color:0xf2f4ff,unlit:true}),n,0,-.04,.205,-.4,0,0); powered(l,.7,4); } Lt([-20.6,2.0,-12.4],[1.6,1.65,1.7],8);
  /* the manager's house: kitchen and front room south, bedroom north; the knife's on the counter; candles at the altar */
  W(-40,-9,-32,-9,I3,HX,[win(-37,1.2,1.0,2.0)]); W(-40,1,-32,1,HX,I4,[gap(-35.2,1.0),win(-38.4,1.2,1.0,2.0)]); W(-40,-9,-40,1,I4,HX); W(-32,-9,-32,1,HX,I4,[gap(-1.6,1.0),win(-6.8,1.2,1.0,2.0)]);
  W(-40,-4,-32,-4,I4,I3,[gap(-38.6,1.0)]);
  roof(-40,-9,-32,1,19); ceil(-40,-9,-32,1); floor(B,-40,-4,-32,1,tTileFloor,{tile:.9,y:.004,color:0xb89a7a}); floor(B,-40,-9,-32,-4,tFlLino,{tile:1.2,y:.004});
  P('counter',-39.66,-2.1,Math.PI/2,3.0,tCabinetW,tCounterTop,{sink:.5,stove:-.8}); fb(-39.66,-2.1,3.0,.62,1.0,Math.PI/2); P('fridge',-39.6,.4,Math.PI/2); fb(-39.6,.4,.72,.72,1.8);
  P('table',-36.0,-1.6,0,1.2,.8,0x8a6a42); fb(-36.0,-1.6,1.2,.8,.8); P('chair',-36.0,-2.4,0); P('chair',-36.0,-.8,Math.PI); P('armchair',-33.0,-3.2,-2.6); fb(-33,-3.2,.9,.9,.9);
  { const tv=P('crt',-33.0,.5,Math.PI,false); fb(-33,.5,.7,.5,1.0); }
  P('bed',-37.6,-6.6,Math.PI/2,tQuiltPink,1.5); fb(-37.6,-6.6,1.5,2.0,.6,Math.PI/2); P('wardrobe',-33.0,-8.6,0); fb(-33,-8.6,1.0,.6,1.9);
  { const n=N(G,-39.55,0,-5.0,0,Math.PI/2,0); FX.altar(n); fb(-39.55,-5.0,1.1,.5,.75,Math.PI/2); } Lt([-39.2,1.1,-5.0],[1.1,.6,.25],3.4,'city','candle');
  bulb(-36.4,2.35,-1.6); Lt([-36.4,2.3,-1.6],[1.25,.95,.6],5.0); loot('knife',-39.62,.95,-2.6,1.4);
  /* the fire in the drum, chairs round it, the dumpsters on the wing's back wall, a burnt car, the water tank, washing lines */
  { const n=P('barrelfire',-24.0,-3.4,0); fb(-24.0,-3.4,.6,.6,.9); } Lt([-24.0,1.3,-3.4],[1.9,.9,.35],6.5,'city','fire');
  P('pchair',-25.0,-2.4,2.2); P('pchair',-24.8,-4.6,.8); P('moCooler',-25.4,-3.7,1.2); P('bottles',-24.6,-2.6,0,4,2641);
  for(const z of [-15.0,-8.6]){ P('wDumpster',-19.25,z,Math.PI/2); fb(-19.25,z,1.9,1.1,1.3,Math.PI/2); } P('trashbags',-19.4,-6.9,0,4,2642); loot('bottle',-19.0,.06,-12.4,.3);
  { const n=P('auto',-35.5,-17.4,Math.PI/2,0x4a3a2a,'sedan',{burnt:true}); } fb(-35.5,-17.4,1.66,4.2,1.2,Math.PI/2);
  { const n=N(G,-26.5,0,6.5); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.12,2.4,.12,{at:[0,1.2,0]}),mRust,n,sx*.6,0,sz*.6); mk(box(1.5,.1,1.5),mRust,n,0,2.4,0); FX.tinaco(N(n,0,2.45,0)); fb(-26.5,6.5,1.4,1.4,3.6); }
  P('laundry',-35.8,-12.0,0,5.0); for(const x of [-38.3,-33.3]){ mk(box(.06,2.0,.06,{at:[0,1.0,0]}),mBlackPipe,G,x,0,-12.0); fb(x,-12,.1,.1,2); }
  P('mesquite',-36.5,-14.2,0,3); fb(-36.5,-14.2,.4,.4,3); P('mesquite',-21.2,7.4,0,4); fb(-21.2,7.4,.4,.4,3); P('weeds',-40.4,-6,Math.PI/2,6,2643,8); P('weeds',-30,-20.3,0,6,2644,6);
  P('litter',-30,-5,0,12,2645,4); P('litter',-22,10,0,10,2646,3);
  /* the side lot: a car, the camper someone lives in, a pole light, the gate onto the street */
  P('auto',-36.2,13.6,0,0x9a9a92,'sedan',{hub:false,plate:'SON'}); fb(-36.2,13.6,1.66,4.2,1.3);
  { const n=P('moCamper',-24.0,14.6,0); fb(-24.0,14.6,6.2,2.3,2.7); } Lt([-25.4,1.8,13.0],[1.2,.8,.4],3.0,'city');
  P('floodpole',-29.0,8.0,Math.PI*.8); fb(-29,8,.2,.2,6); Lt([-28.6,5.4,8.6],[1.5,1.55,1.65],10,'gen','buzz');
  for(const [a,b] of [[-41,-33.2],[-29.6,-17]]){ const n=N(G,(a+b)/2,0,18,0,0,0); FX.corrfence(n,b-a,2.0,tCorrBlue); addBox(a,b,17.95,18.05,0,2.0,'wall'); }
  { const n=N(G,-33.2,0,18,0,-1.9,0); mk(box(1.8,2.0,.03,{at:[.9,1,0]}),MT(tCorrBlue,{repeat:[1.4,1]}),n); }
  { const n=N(G,-41,0,-3.3,0,Math.PI/2,0); FX.corrfence(n,42.6,2.4,tCorrug); addBox(-41.05,-40.95,-24.6,18,0,2.4,'wall'); }

  /* ================= the back lane and the north wall ================= */
  W(-43,-24.6,43,-24.6,RAW,RAW,[],{h:3.2});
  { const n=N(G,0,3.2,-24.6); mk(cyl(.22,.22,86,6,{open:true}),MT(tRazor,{cut:true,double:true,repeat:[86/.5,2]}),n,0,.25,0,0,0,Math.PI/2); }
  for(const [x,t] of [[-30,0],[-12,1],[6,2],[22,3],[34,4]]){ const n=face(x,-24.6,true,1); n.p[1]=1.1; mk(plane(2.2,.7),MT(TAGS_CO[t],{cut:true}),n,0,0,.004); }
  P('wDumpster',-8.0,-23.4,0); fb(-8.0,-23.4,1.9,1.1,1.3); P('trashbags',-9.6,-23.6,0,3,2651); P('litter',-4,-22.6,0,8,2652,1.6);
  { const n=N(G,8.0,0,-23.9,0,0,0); FURN.mattress(n); n.r[0]=-1.2; n.p[1]=.95; } fb(8,-23.9,1.9,.5,1.2);
  { const n=N(G,-20,0,-23.8); FX.fridge(n); n.r=[0,.3,0]; } fb(-20,-23.8,.8,.8,1.8);
  P('sodium',5.0,-24.3,-Math.PI/2,1.3); fb(5,-24.3,.24,.24,6); Lt([5.0,5.85,-23.0],[1.9,1.05,.4],12,'city','buzz');
  P('sodium',-28.0,-24.3,-Math.PI/2,1.3); fb(-28,-24.3,.24,.24,6); Lt([-28.0,5.85,-23.0],[1.9,1.05,.4],12,'city');
  P('wire',0,0,0,[5,-24.3],[-28,-24.3],6.4); P('wire',0,0,0,[5,-24.3],[30,-24.3],6.4);
  for(const [x,z] of [[-12.4,-21.0],[25.6,-21.2]]) P('weeds',x,z,0,5,x|0,3);

  /* ================= the truck yard ================= */
  for(const [a,b] of [[25,35.4],[40.6,41]]){ const n=N(G,(a+b)/2,0,18,0,0,0); FX.wFence(n,b-a,2.4); addBox(a,b,17.97,18.03,0,1.4,'win'); }
  W(41,-24.6,41,18,RAW,RAW,[],{h:3.0});
  { const n=N(G,25.06,1.6,10,0,Math.PI/2,0); mk(plane(2.6,.65),MT(tMoYard),n); }
  W(33,14.8,35.2,14.8,SHK,SHK,[gap(34.1,.9)],{h:2.4}); W(33,17.4,35.2,17.4,SHK,SHK,[win(34.1,1.2,1.0,1.9)],{h:2.4}); W(33,14.8,33,17.4,SHK,SHK,[],{h:2.4}); W(35.2,14.8,35.2,17.4,SHK,SHK,[win(16.1,1.0,1.0,1.9)],{h:2.4});
  mk(box(2.6,.2,3.0),col(0x8a8478),G,34.1,2.5,16.1); addBox(33,35.2,14.8,17.4,2.4,2.6,'ceil'); floor(B,33,14.8,35.2,17.4,tFlConc,{tile:1,y:.004});
  P('pchair',34.6,16.6,-2.6); { const tv=P('crt',33.5,17.0,.6,true); glow(tv); fb(33.5,17.0,.7,.5,1.0); } bulb(34.1,2.2,16.1,false); Lt([34.1,2.1,16.1],[1.2,.95,.6],4.0,'city'); Lt([33.6,1.0,16.6],[.45,.6,1.2],2.6,'city','tv');
  { const t=N(G,28.9,0,-4.5,0,Math.PI/2,0); FX.wTrailer(t,13,false); } addBox(27.6,30.2,-17.5,-4.5,0,4,'furn');
  { const t=N(G,33.2,0,-1.0,0,Math.PI/2,0); FX.wTrailer(t,13,false); } addBox(31.9,34.5,-14,-1.0,0,4,'furn');
  { const t=N(G,37.6,0,-6.0,0,Math.PI/2,0); FX.wTrailer(t,13,false); } addBox(36.3,38.9,-19,-6.0,0,4,'furn');
  { const t=N(G,30.8,0,3.0,0,-Math.PI/2,0); FX.wContainer(t,12.2,false,tContB); } addBox(29.58,32.02,3.0,15.2,0,2.6,'furn');
  { const t=N(G,38.4,0,8.0,0,-Math.PI/2,0); FX.wTractor(t,0x8a2a22); } addBox(37.2,39.6,8.0,14.4,0,3.6,'furn');
  for(const [x,z,ry] of [[27.4,8.6,Math.PI/2],[34.6,3.0,0]]){ P('wJersey',x,z,ry,3); fb(x,z,3,.6,.8,ry); }
  for(const [x,z] of [[26.2,12.4],[26.9,13.8]]){ P('pallet',x,z,.3); } P('litter',36,0,0,10,2661,3);
  for(const [x,z,ry] of [[27.2,-19.6,Math.PI/4],[40.2,2.0,-Math.PI/2]]){ P('wPole',x,z,ry); fb(x,z,.3,.3,7); Lt([x+(x<30?1.0:-1.0),6.4,z+(x<30?1.0:0)],[1.6,1.5,1.25],13,'city'); }
  P('wire',0,0,0,[30,-24.3],[40.6,-24.3],6.2);

  /* ================= the street ================= */
  /* the far side: shops shut for the night, a pharmacy and the money changer lit, the taco cart, the mural */
  const far=[[-43,-30,tCbOrange,[['shutter',-38,3],['sign',-38,{t:tMoLlantera,w:3.2,h:.6}],['win',-33]]],[-30,-19,tCbWhite,[['shutter',-26.5,2.6],['sign',-26.5,{t:tMoFarm,w:3,h:.55}],['lit',-22],['door',-20.4]]],
    [-19,-7,tCbBlue,[['shutter',-15,2.4],['door',-11.8],['lit2',-9.6]]],[-7,6,tCbCream,[['shutter',-3,2.8],['awning',-3,{w:3,t:tAwnRed}],['win',1.4],['door',3.6]]],
    [6,20,tCbTurq,[['door',8.6],['win',11],['sign',13.6,{t:tMoAduana,w:3.2,h:.8}],['win',16.4],['meter',18.6]]],[20,32,tCbRaw,[['mural',26,{t:tMoWelcome,w:8,h:2}]]],[32,43,tCbPink,[['shutter',36,3],['sign',36,{t:tMoArtes,w:3.2,h:.6}],['win',40.6]]]];
  for(const [x0,x1,t,fc] of far) solidBlock(B,x0,23.9,x1,25,{paint:t,h:2.8+((x0+50)%3)*.15,skirt:true,parapet:true,tinaco:false,faces:{n:fc}});
  { const n=face(-22.6,23.9,true,-1); n.p[1]=2.2; n._keep=true; mk(plane(.55,.55),MT(tMoCross,{unlit:true,cut:true}),n,0,0,.04); } Lt([-22.6,2.2,23.0],[.4,1.4,.5],3.2,'city','buzz');
  { const n=face(-13,23.9,true,-1); n.p[1]=2.35; n._keep=true; mk(plane(2.6,.65),MT(tMoCambio,{unlit:true,cut:true}),n,0,0,.04); mk(box(2.7,.72,.04),col(0x0c0c10),n,0,0,0); } Lt([-13,2.3,23.0],[1.4,1.2,.35],3.6,'city','buzz');
  P('tacocart',.6,23.3,Math.PI); fb(.6,23.3,1.55,.8,1.0); Lt([.3,1.7,23.3],[1.4,1.0,.55],4.4,'city'); P('pchair',-1.0,23.0,2.8); P('pchair',2.0,22.95,-2.6);
  P('auto',-21.0,20.6,Math.PI/2,0xe8e2d4,'sedan',{plate:'TAX'}); fb(-21.0,20.6,1.66,4.2,1.3,Math.PI/2);
  P('auto',9.2,20.6,-Math.PI/2,0x1a1a1e,'suv',{plate:'CHH'}); fb(9.2,20.6,1.8,4.6,1.7,Math.PI/2);
  P('auto',29.5,22.0,Math.PI/2,0x6a7a8a,'pickup',{hub:false,plate:'SON'}); fb(29.5,22.0,1.76,4.9,1.6,Math.PI/2);
  for(const x of [-32,-12,14,32]){ P('sodium',x,19.1,-Math.PI/2,1.4); fb(x,19.1,.24,.24,6); Lt([x,5.85,20.5],[2.2,1.2,.45],13,'city'); }
  P('wire',0,0,0,[-32,19.1],[-12,19.1],6.5); P('wire',0,0,0,[-12,19.1],[14,19.1],6.5); P('wire',0,0,0,[14,19.1],[32,19.1],6.5);
  { P('wJersey',-42.2,21.2,Math.PI/2,4); addBox(-42.5,-41.9,19.2,23.2,0,.8,'furn'); const n=N(G,-41.8,1.2,21.2,0,Math.PI/2,0); mk(plane(1.6,.4),MT(tMoClosed),n); }
  P('litter',-8,19,0,6,2671,2); P('litter',20,19.2,0,6,2672,2); P('weeds',24,23.7,0,5,2673,4);
  P('bench',-13,23.4,Math.PI,1.6); fb(-13,23.4,1.6,.45,.9);

  GEO_TEMP=false;
  /* ================= navigation: everywhere inside a space, routes kept clear of walls and anything standing ================= */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),R_=MOTEL_RECTS.find(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]); if(!R_) continue;
    const id=k*NX+i; space[id]=(MOTEL_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])||R_)[4]; nav[id]=0; }
  const CLR=.3; for(const b of BOXES){ if(b.y0>1.5||b.h<.3||b.kind==='ceil') continue;
    const i0=Math.max(0,Math.ceil((b.x0-CLR+MO.RX)*2)),i1=Math.min(NX-1,Math.floor((b.x1+CLR+MO.RX)*2)),k0=Math.max(0,Math.ceil((b.z0-CLR+MO.RZ)*2)),k1=Math.min(NZ-1,Math.floor((b.z1+CLR+MO.RZ)*2));
    for(let k=k0;k<=k1;k++) for(let i=i0;i<=i1;i++){ const x=cellX(i),z=cellZ(k),dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1); if(dx*dx+dz*dz<CLR*CLR) nav[k*NX+i]=1; } }
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k); if(Math.abs(x)>MO.RX-.4||Math.abs(z)>MO.RZ-.4) nav[k*NX+i]=1; }
  const seen=new Set(),units=[]; for(const r of MOTEL_RECTS){ const id=r[4]; if(id<0||seen.has(id)) continue; seen.add(id); units.push({id,side:r[1]<0?-1:1,x0:r[0],x1:r[2],z0:r[1],z1:r[3],w:r[2]-r[0],apt:MO_NAMES[id]||'ROOM',door:r[0],room:true,lit:true,win:null}); }
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.6,z:0,yaw:-Math.PI/2},lights:[]});
  MO.lights=lights; LM.list=lights;
  const st=meshMerge(G,{tile:9,pal:PAL=makePalette()}); /* 9 m merge tiles: fewer draws, and past 22 m the far field takes over anyway */ FLOOR.batch=st;
  FLOOR.batch.far=buildFarField(G,{swapD:22,drawD:34});
  motelLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }

/* night, no moon to speak of: what you see is lit by something. The street's sodium haze in the air */
const MOTEL_LIGHT={amb:[.024,.023,.03],dir:[.3,1,.2],dirCol:[.03,.032,.05],fog:[.022,.017,.016],fogNear:14,fogFar:90};
function motelLights(){ setLights(Object.assign({},MOTEL_LIGHT,{pl:[]})); if(FLOOR.power===false) L.amb=[.012,.012,.019]; lmTick(); }
function motelPower(on,quiet){ if(FLOOR.mode!=='motel'||FLOOR.power===on) return; FLOOR.power=on; motelLever();
  if(!on){ FLOOR.offT=GAME.t; motelGoal('power');
    if(quiet){ /* the breaker clunks and the motel goes dark: the clerk and whoever's nearest come round the back to look */
      sfx('click',.9); sfx('slowout',.45); const g=navSnap(-18.2,14.4),gd=E=>Math.hypot(E.pos[0]-g[0],E.pos[1]-g[1]);
      const up=enemies.filter(E=>upright(E)&&!E.aware&&!E.dale).sort((a,b)=>gd(a)-gd(b));
      up.forEach((E,i)=>setTimeout(()=>{ if(!upright(E)||E.aware) return; if(i<2){ investigate(E,g); if(i===0) say(E,[ES('¿Quién bajó el switch?','Who hit the breaker?'),ES('Ahorita lo subo.','I\'ll flip it back.')],2.4); }
        else if(gd(E)<30){ if(E.st==='idle') E.st='alert'; if(!E.mind||E.mind==='calm') E.mind='nervous'; if(i===2) say(E,[ES('¡Se fue la luz!','The lights went out!'),ES('¿Qué pasó con la luz?','What happened to the lights?')],2.4); } },300+i*300+Math.random()*400));
      const D=enemies.find(E=>E.dale&&upright(E)); if(D) setTimeout(()=>{ if(upright(D)&&!D.aware) say(D,['Hey! The power\'s out!','Somebody get the lights!'],2.4); },1400); }
    else { sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead&&Math.hypot(E.pos[0]-MO_SW[0],E.pos[1]-MO_SW[2])<20){ setTimeout(()=>{ if(!E.dead){ E.aware=true; E.mind='hunt'; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick([ES('¡Le dieron a la caja!','They shot the box!'),ES('¡Está atrás de la oficina!','He\'s behind the office!'),ES('¡Se fue la luz!','The lights went out!')]),2.4); } },200+Math.random()*900); } } }
  else { sfx('click',.9); sfx('slowin',.35); }
  motelLights(); visionApply(); }
function motelLever(){ if(FLOOR.lever) FLOOR.lever.r=[0,0,FLOOR.power===false?2.2:-.35]; }
/* things you touch: the breaker (fingertip in VR, G at a desk; it pushes back on too) and Dale's phone */
function motelPoke(p,h){ if(FLOOR.mode!=='motel'||PL.dead) return;
  if(FLOOR.lever){ const k=h.side+'brk',near=Math.hypot(p[0]-MO_SW[0],p[1]-MO_SW[1]-.08,p[2]-MO_SW[2])<.13;
    if(near&&!motelPoke.held[k]){ motelPoke.held[k]=true; motelPower(FLOOR.power===false,true); buzz(h.hand,.7,40); } else if(!near) motelPoke.held[k]=false; }
  if(FLOOR.phoneN&&FLOOR.phoneN.vis&&Math.hypot(p[0]-MO_PHONE[0],p[1]-MO_PHONE[1],p[2]-MO_PHONE[2])<.16){ takeDalePhone(); buzz(h.hand,.6,60); } }
motelPoke.held={};
function takeDalePhone(){ if(!FLOOR.phoneN||!FLOOR.phoneN.vis) return; FLOOR.phoneN.vis=false; sfx('grab',.8); motelGoal('phone'); }
addEventListener('keydown',e=>{ if(e.code!=='KeyG'||!GAME.started||FLOOR.mode!=='motel'||PL.dead) return;
  if(Math.hypot(PL.x-MO_SW[0],PL.z-MO_SW[2])<1.4) motelPower(FLOOR.power===false,true);
  else if(Math.hypot(PL.x-MO_PHONE[0],PL.z-MO_PHONE[2])<1.4) takeDalePhone(); });
const MOTEL_GOALS={phone:'Dale\'s phone: one number in it, and an address in Colonia Tierra Blanca',power:'The motel is dark',radio:'A lookout got on the radio: the whole motel knows',dale:'Dale Pruitt. Four thousand dollars'};
function motelGoal(k){ if(!FLOOR.goals) FLOOR.goals={}; if(FLOOR.goals[k]) return; FLOOR.goals[k]=true; if(XR.on) vrToast(MOTEL_GOALS[k],3.4); motelTag(); }
function motelTag(){ const g=FLOOR.goals||{},dead=enemies.filter(E=>E.dead).length; $('floorTag').textContent=`Motel · ${dead}/${enemies.length} down${g.dale?' · Dale':''}${g.phone?' · phone':''}${g.power?' · lights off':''}${g.radio?' · RADIOED':''}`; }

/* ---------- the cast ---------- */
function motelCast(){ for(const sp of MOTEL_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>sp.dale?(()=>{ const C=makeChar('dale',h,g); tagHeat(C); return C; })():cartelChar(sp.id,h,g)}));
    E.detail=sp.detail; E.radio=!!sp.radio; if(sp.dale){ E.dale=true; E.ks=DALE_KS; }
    mergeTree(E.C.wpn); mergeTree(E.C.dropped); mergeChar(E.C); atlasBody(E.C);
    if(sp.patrol){ E.patrol={pts:sp.patrol,i:1,wait:0}; E.st='alert'; } enemies.push(E); } attachLabels();
  for(const r of FLOOR.rewards){ const flat=r.key==='knife'||r.key==='machete'||r.key==='bottle'; const Mw=m4.compose(m4.make(),r.p,[flat?Math.PI/2:0,r.ry,0],[1,1,1]); const Pk=addPickup(newItem(r.key),Mw,[0,0,0],[0,0,0]); Pk.rest=true; } }

/* ---------- seeing: under a light, up close, or by your muzzle flash ---------- */
function motelLitAt(x,z){ const on=FLOOR.power!==false; for(const l of MO.lights||[]){ if(l.pow==='gen'&&!on) continue; if(l.d<3) continue; if(Math.hypot(l.p[0]-x,l.p[2]-z)<l.d*.4) return true; } return false; }
function motelSeen(E,dist){ if(GAME.t-(GAME.shotT??-99)<1.4&&dist<18) return true; if(MO.lit) return true; return dist<(FLOOR.power!==false?2.6:1.8); }

/* ---------- the level's frame ---------- */
function tickMotel(dt){ if(FLOOR.mode!=='motel') return; farTick();
  if(GAME.vision!=='nv') L.plCol.set([0,0,0],18);
  lmTick(); fireTick(GAME.t); MO.lit=motelLitAt(PL.x,PL.z); if(FLOOR.sky){ FLOOR.sky.p[0]=PL.x; FLOOR.sky.p[2]=PL.z; }
  for(const k of ['hole','splat']){ const D=DEC[k]; if(D.ver!==D._sv){ const n=D.length; for(let i=D.length-1;i>=0;i--){ const d=D[i]; if(d.c[1]>RH-.15&&d.n[1]<-.5) D.splice(i,1); } if(D.length!==n) D.ver++; D._sv=D.ver; } }
  for(const E of enemies){ if(E.patrol&&!E.dead&&!E.aware&&E.st==='idle'&&(!E.mind||E.mind==='calm'||E.mind==='nervous')) E.st='alert'; }
  if(!GAME.started||PL.dead||FLOOR.out) return;
  /* lookouts: two seconds after one sees you, he's on the radio, unless he's down first */
  for(const E of enemies){ if(!E.radio||(FLOOR.goals&&FLOOR.goals.radio)) continue; if(E.aware&&upright(E)){ E.radioT=(E.radioT||0)+dt;
      if(E.radioT>2.0){ bark(E,pick([ES('¡Ya llegó! ¡Ya llegó!','He\'s here! He\'s here!'),ES('¡El policía, en el motel!','The cop, at the motel!'),ES('¡Cuiden al gringo!','Protect the gringo!')]),3); sfx('click',1); sfx('slowout',.4);
        for(const O of enemies) if(O!==E&&upright(O)&&!O.aware) setTimeout(()=>{ if(upright(O)&&!O.aware) setAware(O,'noise',[PL.x,PL.z]); },500+Math.random()*1500);
        motelGoal('radio'); for(const H of enemies) if(H.radio) H.radioT=-1e9; } } else if(!E.aware) E.radioT=0; }
  for(const E of enemies) if(E.dale&&E.dead) motelGoal('dale');
  motelTag.t=(motelTag.t||0)-dt; if(motelTag.t<=0){ motelTag.t=.5; motelTag(); }
  if(PL.x>41.4&&PL.z>19.4&&PL.z<23.2) motelLeave(); }
function motelReset(){ if(FLOOR.power===false){ FLOOR.power=true; FLOOR.offT=null; motelLever(); motelLights(); } FLOOR.out=false; FLOOR.goals={}; if(FLOOR.phoneN) FLOOR.phoneN.vis=true;
  motelCast(); for(const R of RACK) if(!R.merged){ mergeTree(R.node); R.merged=true; } visionApply(); motelTag(); if(XR.on) vrToast('Dale is in the suite at the back. Three lookouts have radios.',4); }
function goMotel(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genMotel(); buildRack(); buildBoard(); SPAWNOPT.where='any'; GAME.kit=null; resetGame(); if(XR.on) vrRecenter(); }
/* out to the street's east end, toward the bridge: into the stash house with whatever is in your hands */
function motelLeave(){ FLOOR.out=true; GAME.clear=true; const dead=enemies.filter(E=>E.dead).length,n=enemies.length,g=FLOOR.goals||{};
  const line=`Puente Viejo · ${dead} of ${n} dead${g.dale?' · Dale is dead':' · Dale is alive'}${g.phone?' · his phone in your pocket':''}`; if(XR.on) vrToast(line,4.5);
  setTimeout(()=>{ carryInto(goStash); $('floorTag').textContent=line; },700); }
