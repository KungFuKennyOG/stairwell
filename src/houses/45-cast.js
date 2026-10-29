
/* =====================================================================================================
   THE CAST on the Stairwell rig. Five targets (the people who set Ray's team up), the crews in their houses,
   and the people who just live there. Kids are in the houses but can never be hurt: in the game, shots and
   blades pass through them, they can't be grabbed and they never ragdoll. They hide, they run to a parent,
   and they remember what they saw.
   ===================================================================================================== */

/* ---------- heads (no balding heads: everyone keeps a full head of hair) ---------- */
Object.assign(HEADS,{
  dale:{seed:801,skin:'#d8a888',skinD:'#a87a5e',hair:'long',hairC:'#5a4632',hairFront:13,sideburn:40,behind:50,nape:54,brow:'#4a3a28',iris:'#5a6a5a',lip:'#a86a5c',beard:'stubble',beardC:'#5a4632',acne:true},
  crystal:{seed:802,skin:'#e4b898',skinD:'#b48a6e',hair:'bleach',hairC:'#d8c08a',hairFront:13,sideburn:44,behind:54,nape:58,brow:'#6a5034',iris:'#4a6a7a',lip:'#b4706a'},
  mason:{seed:803,skin:'#e8bc9c',skinD:'#bc9072',hair:'buzz',hairC:'#a8804a',hairFront:14,brow:'#9a7a4a',iris:'#4a6a8a',lip:'#c07a6a',white:'#e6e0d4'},
  kessler:{seed:811,skin:'#d4a07e',skinD:'#a4745a',hair:'buzz',hairC:'#8a8682',hairFront:15,shadow:true,brow:'#6a6662',browT:2,iris:'#4a5a6a',lip:'#a0645a',beard:'mustache',beardC:'#7a7672',age:true},
  linda:{seed:812,skin:'#e0b090',skinD:'#b08466',hair:'long',hairC:'#6a4428',hairFront:13,sideburn:44,behind:52,nape:56,brow:'#5a3a22',iris:'#4a3a2a',lip:'#b06a62'},
  ellie:{seed:813,skin:'#e6b896',skinD:'#b88c6c',hair:'long',hairC:'#3a2416',hairFront:13,sideburn:44,behind:54,nape:58,brow:'#3a2416',iris:'#4a3a2a',lip:'#c07a70',acne:true},
  ben:{seed:814,skin:'#e4b694',skinD:'#b88a6c',hair:'long',hairC:'#6a4428',hairFront:12,sideburn:38,behind:46,nape:50,brow:'#5a3a22',iris:'#4a3a2a',lip:'#c4806e',white:'#e6e0d4'},
  offduty:{seed:815,skin:'#c49070',skinD:'#946446',hair:'buzz',hairC:'#2a1e16',hairFront:15,shadow:true,brow:'#2a1e16',browT:2,iris:'#3a2a1a',lip:'#94564a',beard:'stubble',beardC:'#2a1e16'},
  ashby:{seed:821,skin:'#e2b49a',skinD:'#b4866e',hair:'slick',hairC:'#9a9690',hairFront:12,sideburn:38,brow:'#7a7672',iris:'#5a7a8a',lip:'#a8685e',age:true,glasses:'#2a2a2c'},
  guest:{seed:822,skin:'#8a5a3c',skinD:'#5e3a26',hair:'long',hairC:'#140e0a',hairFront:13,sideburn:46,behind:56,nape:60,brow:'#140e0a',iris:'#2a1a10',lip:'#7a3a38'},
  guestm:{seed:823,skin:'#d8b08e',skinD:'#a8846a',hair:'slick',hairC:'#2a1a10',hairFront:12,sideburn:40,brow:'#2a1a10',iris:'#3a2a1a',lip:'#a0645a',beard:'stubble',beardC:'#3a2414'},
  barman:{seed:824,skin:'#b88462',skinD:'#8a5a40',hair:'slick',hairC:'#141010',hairFront:13,sideburn:36,brow:'#141010',iris:'#2a1a10',lip:'#8a4a3a',beard:'goatee',beardC:'#141010'},
  suit:{seed:825,skin:'#6a4430',skinD:'#44281a',hair:'shaved',hairFront:14,shadow:true,brow:'#120c08',browT:2,iris:'#1a0e08',lip:'#4e2c1e',white:'#d8cfc0'},
  sallis:{seed:831,skin:'#e8c0a4',skinD:'#bc947a',hair:'slick',hairC:'#c8c4bc',hairFront:12,sideburn:40,brow:'#a8a49c',browT:2,iris:'#6a8aa0',lip:'#b07a6e',age:true},
  helena:{seed:832,skin:'#ecc8ae',skinD:'#c09c84',hair:'bleach',hairC:'#e6d2a2',hairFront:13,sideburn:44,behind:52,nape:56,brow:'#a88a5a',iris:'#5a7a6a',lip:'#c06a6a'},
  grace:{seed:833,skin:'#a46e4c',skinD:'#744a32',hair:'long',hairC:'#140e0a',hairFront:13,sideburn:42,behind:50,nape:54,brow:'#140e0a',iris:'#2a1a10',lip:'#7a4232',age:true},
  sophie:{seed:834,skin:'#eac6aa',skinD:'#be9a80',hair:'long',hairC:'#c8a060',hairFront:12,sideburn:44,behind:54,nape:58,brow:'#9a7a4a',iris:'#5a7a9a',lip:'#c8827a',white:'#e8e2d6'},
  guard:{seed:835,skin:'#d0a080',skinD:'#a07458',hair:'buzz',hairC:'#3a2a1c',hairFront:15,brow:'#3a2a1c',browT:2,iris:'#4a5a3a',lip:'#9a5a4a',beard:'full',beardC:'#3a2a1c'},
  kane:{seed:841,skin:'#d8a486',skinD:'#a8765c',hair:'slick',hairC:'#e8e4dc',hairFront:12,sideburn:42,behind:50,brow:'#e0dcd4',browT:2,iris:'#6a8aa0',lip:'#a86a5e',beard:'full',beardC:'#e8e4dc',age:true,scar:true},
  mae:{seed:842,skin:'#e0b8a0',skinD:'#b08c76',hair:'long',hairC:'#e8e4de',hairFront:13,sideburn:42,behind:50,nape:52,brow:'#d8d4cc',iris:'#5a6a7a',lip:'#a87068',age:true,spots:true,glasses:'#6a5a3a'},
  jesse:{seed:843,skin:'#d8a882',skinD:'#a87a5a',hair:'slick',hairC:'#4a3020',hairFront:13,sideburn:38,brow:'#4a3020',iris:'#3a2a1a',lip:'#b8786a',white:'#e6e0d4'},
  cook:{seed:844,skin:'#7a4e34',skinD:'#4e301e',hair:'buzz',hairC:'#c8c4bc',hairFront:15,brow:'#a8a49c',iris:'#1a0e08',lip:'#5e3424',beard:'full',beardC:'#c8c4bc',age:true},
  hand:{seed:845,skin:'#c89272',skinD:'#986448',hair:'long',hairC:'#2a1c12',hairFront:13,sideburn:42,behind:48,nape:52,shadow:true,brow:'#2a1c12',iris:'#3a2a1a',lip:'#94564a',beard:'goatee',beardC:'#2a1c12'}
});
/* faces paint on demand: the neutral face up front, the rest the first time something needs them */
/* Dale "the Tipster": grey hoodie open over a stained white tee, grey sweats, slides with socks */
const tDaleTorso=torsoP('dale',901,(x,y)=>{ const open=Math.abs(x-64)<16; if(y>T3.belt+2) return ['#6a6a6c','knit',.7]; if(open&&y>T3.neck+10) return crewNeck(x,y,12,12)?sk('dale'):['#e2ddd0','cotton',.8]; return ['#7a7c80','knit',.8]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ softLine(I,64+s*16,T3.neck+10,64+s*16,T3.belt,'#5a5c60',.9,2); softLine(I,64+s*17,T3.neck+10,64+s*17,T3.belt,'#a8a8a4',.6,1); softLine(I,64+s*10,T3.neck+12,64+s*20,T3.neck+70,'#e8e4dc',.8,1); }
  softRect(I,0,T3.neck,128,12,'#6a6c70',.9,2); stain(I,60,T3.chest+30,6,'#a88a4a',902); stain(I,70,T3.nav-10,5,'#8a6a3a',903); softRect(I,0,T3.belt-10,128,10,'#5a5c60',.6,2); softRect(I,34,T3.nav-30,60,26,'#000000',.08,3); }});
const tDaleArm=armP(905,()=>['#7a7c80','knit',.8],{decor:I=>softRect(I,0,112,64,16,'#5a5c60',.8,2)});
const tDaleLeg=legP(907,(x,y)=>['#6a6a6c','knit',.7],{decor:I=>{ softRect(I,0,110,64,18,'#5a5a5c',.8,2); blob(I,32,60,10,6,.12); stain(I,20,40,4,'#4a3a2a',908); }});
const tSlide=garment(64,32,909,(x,y)=>[y<12?'#e8e4dc':'#1a1a1c',y<12?'knit':'poly',.2],{folds:2,grime:.1,decor:I=>{ softRect(I,8,14,48,8,'#2a4a8a',.95,.6); }});
/* Crystal: oversized faded band-less tee, black leggings, ankle socks */
const tCrysTorso=torsoP('crystal',911,(x,y)=>{ if(crewNeck(x,y,14,10)) return sk('crystal'); if(y>T3.belt+8) return ['#1c1c20','poly',.4]; return ['#a8b8c0','cotton',.8]; },{decor:I=>{ neckShadow(I); softRect(I,40,T3.chest-10,48,30,'#7a8a96',.6,3); softEll(I,64,T3.chest+4,12,12,'#e8e4dc',.35,.6); softRect(I,0,T3.belt-4,128,12,'#98a8b0',.9,2); }});
const tCrysArm=armP(913,(x,y)=>y<36?['#a8b8c0','cotton',.8]:sk('crystal'),{decor:I=>{ blob(I,32,40,30,3,-.18); softRect(I,22,106,18,5,'#e8c8d8',.8,.5); }});
const tCrysLeg=legP(915,()=>['#1c1c20','poly',.4],{decor:I=>{ softLine(I,32,0,32,128,'#2e2e34',.5,1.5); blob(I,32,66,8,5,.12); }});
const tSockW=garment(64,32,917,(x,y)=>[y<16?'#ece8e0':'#d0ccc4','knit',.2],{folds:2,grime:.06});
/* Mason (6): dinosaur pyjamas */
const tMasonTorso=torsoP('mason',921,(x,y)=>{ if(crewNeck(x,y,12,8)) return sk('mason'); return ['#6aa86a','cotton',.6]; },{decor:I=>{ neckShadow(I); const r=rng(922); for(let i=0;i<14;i++){ const x=r()*128,y=T3.neck+16+r()*(250-T3.neck-16); softEll(I,x,y,5,3,'#e8d27a',.9,.5); softEll(I,x+4,y-3,2,2,'#e8d27a',.9,.5); softLine(I,x-5,y,x-9,y-2,'#e8d27a',.9,1.4); } softRect(I,0,T3.belt-3,128,6,'#4a884a',.6,2); }});
const tMasonArm=armP(923,()=>['#6aa86a','cotton',.6],{decor:I=>softRect(I,0,112,64,16,'#4a884a',.9,1)});
const tMasonLeg=legP(925,()=>['#6aa86a','cotton',.6],{decor:I=>{ const r=rng(926); for(let i=0;i<5;i++) softEll(I,r()*64,r()*110,5,3,'#e8d27a',.9,.5); softRect(I,0,114,64,14,'#4a884a',.9,1); }});
const tKidSock=garment(64,32,927,(x,y)=>[y<18?'#ece6d6':'#c8c0b0','knit',.2],{folds:2,grime:.04,decor:I=>softRect(I,0,6,64,3,'#c84a3a',.9,.6)});

/* Sgt. Walt Kessler: navy department polo, khakis, holster on the belt */
const tKessTorso=torsoP('kessler',931,(x,y)=>{ if(vNeck(x,y,8,22)) return sk('kessler'); return y>T3.belt+2?['#b8a47a','twill',.6]:['#22304a','cotton']; },{decor:I=>{ neckShadow(I); softRect(I,50,T3.neck,28,6,'#1a2638',.9,1); buttons(I,[64],T3.neck+24,T3.neck+50,12,'#e8e4dc');
  softEll(I,86,T3.chest-8,7,8,'#c9b07a',.85,.5); softEll(I,86,T3.chest-8,4,5,'#22304a',.8,.5); beltI(I,'#1a1410','#a8a49c'); softRect(I,98,T3.belt-6,14,24,'#141416',.95,1); seam(I,64,T3.belt+5,64,T3.belt+40); }});
const tKessArm=armP(933,(x,y)=>y<46?['#22304a','cotton']:sk('kessler'),{decor:I=>{ blob(I,32,50,30,3,-.18); softRect(I,0,42,64,4,'#1a2638',.9,1); softRect(I,22,108,16,6,'#a8a49c',.9,.5); }});
const tKessLeg=legP(935,()=>['#b8a47a','twill'],{decor:I=>{ seam(I,48,0,48,128); seam(I,16,0,16,128); softLine(I,32,0,32,128,'#a8946a',.5,1); }});
const tBrownShoe=garment(64,32,937,()=>['#4a3020','leather',.2],{folds:2,grime:.05,decor:I=>{ softRect(I,0,24,64,8,'#1a120c',1,1); blob(I,32,10,12,4,.25); }});
/* Linda: oatmeal cardigan over a striped top, dark jeans */
const tLindaTorso=torsoP('linda',941,(x,y)=>{ const open=Math.abs(x-64)<14; if(y>T3.belt+2) return ['#2a3448','denim',.6]; if(crewNeck(x,y,13,10)) return sk('linda'); if(open) return [stripes('#1e2a44','#ece6da',8)(y),'cotton',.5]; return ['#c8b89a','knit',.8]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]) softLine(I,64+s*14,T3.neck+8,64+s*14,T3.belt,'#a8987a',.9,1.6); buttons(I,[50],T3.neck+40,T3.belt-6,22,'#8a7a5a'); for(let y=T3.belt-12;y<T3.belt;y+=3) softLine(I,0,y,128,y,'#b8a88a',.4,1); }});
const tLindaArm=armP(943,()=>['#c8b89a','knit',.8],{decor:I=>{ for(let y=110;y<128;y+=3) softLine(I,0,y,64,y,'#b8a88a',.5,1); }});
const tLindaLeg=legP(945,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); seam(I,16,0,16,128,'#a8834a'); blob(I,32,40,9,20,.12,'#6a7a9a'); }});
const tFlat=garment(64,32,947,(x,y)=>[y<10?HEADS.linda.skin:'#5a2e2a',y<10?'skin':'leather',.2],{folds:2,grime:0,decor:I=>softRect(I,0,26,64,6,'#2a1410',1,1)});
/* Ellie (13): purple school hoodie, grey joggers */
const tEllieTorso=torsoP('ellie',951,(x,y)=>{ if(crewNeck(x,y,12,9)) return sk('ellie'); return y>T3.belt+2?['#8a8c90','knit',.6]:['#5a3a7a','knit',.8]; },{decor:I=>{ neckShadow(I); softRect(I,40,T3.nav-28,48,28,'#4a2e68',.9,1.2); softLine(I,40,T3.nav-28,88,T3.nav-28,'#6a4a8a',.6,1); textI(I,'MAPLE',45,T3.chest-14,'#e8e2d4',2,.9); for(const s of [-1,1]) softLine(I,64+s*5,T3.neck+8,64+s*6,T3.neck+40,'#e8e2d4',.9,1); softRect(I,0,T3.belt-8,128,10,'#4a2e68',.9,2); }});
const tEllieArm=armP(953,()=>['#5a3a7a','knit',.8],{decor:I=>softRect(I,0,112,64,16,'#4a2e68',.9,2)});
const tEllieLeg=legP(955,()=>['#8a8c90','knit',.6],{decor:I=>{ softRect(I,0,114,64,14,'#6a6c70',.9,2); softLine(I,0,0,0,128,'#e8e2d4',.7,1.5); }});
const tSneakPink=garment(64,32,957,()=>['#ece8e2','leather',.2],{folds:2,grime:.06,decor:I=>{ softRect(I,0,24,64,8,'#d8d4cc',1,1); softRect(I,12,10,40,5,'#e88aa8',.9,.6); }});
/* Ben (8): red-and-blue striped tee, denim shorts */
const tBenTorso=torsoP('ben',961,(x,y)=>{ if(crewNeck(x,y,11,8)) return sk('ben'); if(y>T3.belt+2) return ['#4a6a9a','denim',.6]; return [stripes('#c8402e','#2a4a8a',14)(y-T3.neck),'cotton',.6]; },{decor:I=>{ neckShadow(I); beltI(I,'#3a2a1a','#a8a49c'); }});
const tBenArm=armP(963,(x,y)=>y<40?[stripes('#c8402e','#2a4a8a',14)(y),'cotton',.6]:sk('ben'),{decor:I=>{ blob(I,32,44,30,3,-.18); softEll(I,30,90,4,3,'#c89070',.4,.4); }});
const tBenLeg=legP(965,(x,y)=>y<56?['#4a6a9a','denim',.6]:sk('ben'),{decor:I=>{ softLine(I,0,56,64,56,'#8aa0c0',.9,1.6); blob(I,32,72,8,5,.14,'#c87a6a'); }});
const tKidSneak=garment(64,32,967,()=>['#2a4a8a','poly',.2],{folds:2,grime:.08,decor:I=>{ softRect(I,0,24,64,8,'#ece8e2',1,1); softLine(I,20,8,44,14,'#ece8e2',.9,1.4); }});
/* off-duty cops: plain polos, jeans, the badge clipped by the holster */
const tOffTorso=torsoP('offduty',971,(x,y)=>{ if(vNeck(x,y,8,22)) return sk('offduty'); return y>T3.belt+2?['#2e3a54','denim',.6]:['#6a7a5a','cotton']; },{decor:I=>{ neckShadow(I); softRect(I,50,T3.neck,28,6,'#5a6a4a',.9,1); buttons(I,[64],T3.neck+24,T3.neck+46,11,'#3a4a2a');
  beltI(I,'#2a1a10','#a8a49c'); softRect(I,96,T3.belt-6,14,24,'#141416',.95,1); softRect(I,84,T3.belt-4,9,10,'#c9b07a',.95,.5); seam(I,64,T3.belt+5,64,T3.belt+40,'#a8834a'); }});
const tOffArm=armP(973,(x,y)=>y<44?['#6a7a5a','cotton']:sk('offduty'),{decor:I=>{ blob(I,32,48,30,3,-.18); softRect(I,0,40,64,4,'#5a6a4a',.9,1); const r=rng(974); for(let i=0;i<60;i++){ const x=r()*64,y=50+r()*70; softLine(I,x,y,x+.6,y+1.4,'#5a3a28',.3,.7); } }});
const tOffLeg=legP(975,()=>['#2e3a54','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); seam(I,16,0,16,128,'#a8834a'); blob(I,32,40,9,20,.1,'#6a7a9a'); }});

/* Martin Ashby, the lawyer: charcoal suit, open collar for the party, pocket square */
const tAshTorso=torsoP('ashby',981,(x,y)=>{ if(vNeck(x,y,13,40)) return Math.abs(x-64)<6&&y<T3.neck+16?sk('ashby'):['#e8e6e0','cotton',.4]; return ['#3a3c42','wool']; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]){ softLine(I,64+s*13,T3.neck,64+s*4,T3.neck+56,'#2a2c30',.9,2.4); softLine(I,64+s*13,T3.neck,64+s*24,T3.neck+20,'#2a2c30',.8,1.6); }
  buttons(I,[66],T3.neck+60,T3.belt-6,26,'#1a1a1e'); softRect(I,84,T3.chest-12,10,5,'#b8302a',.95,.5); sideSeams(I,T3.neck,256); seam(I,64,T3.belt+5,64,T3.belt+40); softLine(I,64,T3.neck+40,64,T3.belt,'#2a2c30',.5,1); }});
const tAshArm=armP(983,(x,y)=>y>121?['#e8e6e0','cotton',.2]:['#3a3c42','wool'],{decor:I=>{ softRect(I,22,123,14,4,mix('#d4ad5a','#000000',0),.9,.5); }});
const tAshLeg=legP(985,()=>['#3a3c42','wool'],{decor:I=>{ softLine(I,32,0,32,128,'#4a4c52',.6,1); seam(I,48,0,48,128); seam(I,16,0,16,128); }});
/* party guest: emerald slip dress (the skirt is a separate cone), bare arms */
const tGuestTorso=torsoP('guest',991,(x,y)=>{ if(y<T3.neck+18||(y<T3.chest-14&&Math.abs(x-64)>30&&Math.abs(x-64)<62)) return sk('guest'); return ['#1f6a4e','poly',.5,1.05]; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*20,T3.neck+18,64+s*20,T3.chest-14,'#1f6a4e',.95,1.2); softLine(I,30,T3.neck+18,98,T3.neck+18,'#16503a',.9,1.4); chainI(I,'#d4ad5a'); }});
const tGuestArm=armP(993,()=>sk('guest'),{decor:I=>{ blob(I,32,8,30,6,.08); softRect(I,22,114,18,4,'#d4ad5a',.95,.5); }});
const tGuestLeg=legP(995,()=>sk('guest'),{decor:I=>{ blob(I,32,66,8,5,.1); }});
const tHeel=garment(64,32,997,(x,y)=>[y<14?HEADS.guest.skin:'#1a1a1c',y<14?'skin':'leather',.2],{folds:2,grime:0,decor:I=>{ softRect(I,0,26,64,6,'#0a0a0c',1,1); softLine(I,12,14,52,14,'#d4ad5a',.9,1); }});
const tDressSkirt=garment(64,32,998,()=>['#1f6a4e','poly',.5,1.05],{folds:5,dir:'v',grime:0});
/* party guest (man): camel blazer over a black tee */
const tGuestmTorso=torsoP('guestm',1001,(x,y)=>{ const open=Math.abs(x-64)<16; if(y>T3.belt+2) return ['#1a1a1e','denim',.5]; if(open) return crewNeck(x,y,11,8)?sk('guestm'):['#18181a','cotton',.5]; return ['#a8865a','wool']; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*16,T3.neck+4,64+s*16,T3.belt,'#8a6a42',.9,2); buttons(I,[46],T3.chest+20,T3.belt-10,30,'#3a2a1a'); beltI(I,'#0a0a0c','#a8a49c'); }});
const tGuestmArm=armP(1003,()=>['#a8865a','wool'],{decor:I=>softRect(I,0,118,64,10,'#8a6a42',.6,1)});
const tGuestmLeg=legP(1005,()=>['#1a1a1e','denim']);
/* bartender: white shirt, black waistcoat, black tie */
const tBarTorso=torsoP('barman',1011,(x,y)=>{ if(y>T3.belt+2) return ['#141416','wool',.6]; if(crewNeck(x,y,8,6)) return sk('barman'); const vest=y>T3.neck+30&&Math.abs(x-64)<44&&!(vNeck(x,y,14,70)); return vest?['#18181c','wool',.6]:['#ece8e2','cotton',.5]; },{decor:I=>{ neckShadow(I); softLine(I,64,T3.neck+6,64,T3.neck+70,'#0a0a0c',.95,3); buttons(I,[66],T3.neck+76,T3.belt-6,14,'#3a3a3e'); beltI(I,'#0a0a0c','#3a3a3e'); }});
const tBarArm=armP(1013,()=>['#ece8e2','cotton',.5],{decor:I=>{ softRect(I,0,60,64,10,'#d8d4cc',.8,2); }});
const tBarLeg=legP(1015,()=>['#141416','wool']);
/* private security: black suit, white shirt, black tie, earpiece */
const tSuitTorso=torsoP('suit',1021,(x,y)=>{ if(vNeck(x,y,12,44)) return crewNeck(x,y,7,6)?sk('suit'):Math.abs(x-64)<3?['#0e0e10','cotton',.4]:['#ece8e2','cotton',.4]; return ['#18181c','wool']; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*12,T3.neck,64+s*3,T3.neck+48,'#0e0e12',.9,2.2); buttons(I,[66],T3.neck+52,T3.belt-6,26,'#0a0a0c'); sideSeams(I,T3.neck,256); }});
const tSuitArm=armP(1023,(x,y)=>y>121?['#ece8e2','cotton',.2]:['#18181c','wool']);
const tSuitLeg=legP(1025,()=>['#18181c','wool'],{decor:I=>{ seam(I,48,0,48,128); seam(I,16,0,16,128); }});

/* Victor Sallis, the developer: burgundy silk robe over pyjamas, velvet slippers */
const tSalTorso=torsoP('sallis',1031,(x,y)=>{ const open=x>52&&x<70-Math.max(0,(y-T3.neck-40)*.1); if(y>T3.belt+2) return ['#6a1a2a','poly',.5,1.05]; if(open) return crewNeck(x,y,10,8)?sk('sallis'):['#e8e2d4','cotton',.4]; return ['#6a1a2a','poly',.5,1.05]; },{decor:I=>{ neckShadow(I);
  softLine(I,52,T3.neck,70,T3.belt-30,'#4a0e1a',.9,3); softLine(I,52,T3.neck,40,T3.chest,'#c9a24a',.85,1.4); softRect(I,0,T3.nav-4,128,8,'#4a0e1a',.95,1.2); softRect(I,60,T3.nav-6,10,24,'#4a0e1a',.95,1); for(const s of [-1,1]) softEll(I,64+s*28,T3.chest-10,6,5,'#c9a24a',.4,.5); }});
const tSalArm=armP(1033,(x,y)=>y>110?sk('sallis'):['#6a1a2a','poly',.5,1.05],{decor:I=>softRect(I,0,96,64,14,'#4a0e1a',.9,1.4)});
const tSalLeg=legP(1035,(x,y)=>y<72?['#6a1a2a','poly',.5,1.05]:['#2a2e4a','cotton',.5],{decor:I=>{ softLine(I,0,72,64,72,'#4a0e1a',.9,2); for(let y=78;y<128;y+=8) softLine(I,0,y,64,y,'#3a3e5a',.6,1); }});
const tVelvet=garment(64,32,1037,()=>['#1a1a3a','wool',.2],{folds:2,grime:0,decor:I=>{ softRect(I,0,26,64,6,'#0a0a1a',1,1); softEll(I,32,12,5,4,'#c9a24a',.9,.5); }});
/* Helena: cream silk blouse, tailored grey trousers */
const tHelTorso=torsoP('helena',1041,(x,y)=>{ if(vNeck(x,y,10,26)) return sk('helena'); return y>T3.belt+2?['#8a8a8e','wool',.6]:['#ece2d0','poly',.4,1.04]; },{decor:I=>{ neckShadow(I); buttons(I,[64],T3.neck+30,T3.belt-6,18,'#d8ccb8'); chainI(I,'#e8e4dc'); beltI(I,'#2a2420','#d4ad5a'); }});
const tHelArm=armP(1043,()=>['#ece2d0','poly',.4,1.04],{decor:I=>softRect(I,0,116,64,12,'#d8ccb8',.7,1)});
const tHelLeg=legP(1045,()=>['#8a8a8e','wool'],{decor:I=>softLine(I,32,0,32,128,'#9a9a9e',.7,1)});
/* Grace, the nanny: lavender scrub-style tunic over black trousers, cardigan tied round */
const tGraceTorso=torsoP('grace',1051,(x,y)=>{ if(vNeck(x,y,10,22)) return sk('grace'); return y>T3.belt+8?['#1e1e22','cotton',.5]:['#9a8ac0','cotton',.6]; },{decor:I=>{ neckShadow(I); for(const x of [40,88]) softRect(I,x-8,T3.nav-20,16,16,'#8a7ab0',.9,1); softRect(I,0,T3.belt-2,128,10,'#5a4a3a',.9,2); }});
const tGraceArm=armP(1053,(x,y)=>y<46?['#9a8ac0','cotton',.6]:sk('grace'),{decor:I=>{ blob(I,32,50,30,3,-.18); softRect(I,22,110,16,6,'#e8e4dc',.9,.5); }});
const tGraceLeg=legP(1055,()=>['#1e1e22','cotton']);
/* Sophie (9): pale yellow nightgown with stars, bare feet in socks */
const tSophTorso=torsoP('sophie',1061,(x,y)=>{ if(crewNeck(x,y,12,8)) return sk('sophie'); return ['#efe2a8','cotton',.5]; },{decor:I=>{ neckShadow(I); const r=rng(1062); for(let i=0;i<40;i++) softEll(I,r()*128,T3.neck+12+r()*(250-T3.neck),1.6,1.6,'#a8b8e8',.9,.4); softRect(I,0,T3.neck+8,128,3,'#e8c870',.8,1); }});
const tSophArm=armP(1063,(x,y)=>y<70?['#efe2a8','cotton',.5]:sk('sophie'),{decor:I=>{ softRect(I,0,66,64,4,'#e8c870',.8,1); }});
const tSophLeg=legP(1065,(x,y)=>y<64?['#efe2a8','cotton',.5]:sk('sophie'),{decor:I=>softLine(I,0,64,64,64,'#e8c870',.9,1.4)});
const tGownSkirt=garment(64,32,1066,()=>['#efe2a8','cotton',.5],{folds:5,dir:'v',grime:0,decor:I=>{ const r=rng(1067); for(let i=0;i<14;i++) softEll(I,r()*64,r()*28,1.4,1.4,'#a8b8e8',.9,.4); softRect(I,0,29,64,3,'#e8c870',.9,1); }});
/* estate guards: tan polo, black plate carrier (separate mesh), tactical trousers, cap */
const tGuardTorso=torsoP('guard',1071,(x,y)=>{ if(vNeck(x,y,8,18)) return sk('guard'); return y>T3.belt+2?['#3a3a36','twill',.6]:['#a89874','cotton']; },{decor:I=>{ neckShadow(I); beltI(I,'#141416','#3a3a3e'); seam(I,64,T3.belt+5,64,T3.belt+40); }});
const tGuardArm=armP(1073,(x,y)=>y<44?['#a89874','cotton']:sk('guard'),{decor:I=>{ blob(I,32,48,30,3,-.18); softRect(I,40,14,12,12,'#8a7a5a',.9,1); }});
const tGuardLeg=legP(1075,()=>['#3a3a36','twill'],{decor:I=>{ for(const x of [4,42]){ softRect(I,x,30,17,24,'#2e2e2a',.7,1); softRect(I,x,30,17,5,'#4a4a44',.9,.6); } seam(I,48,0,48,128); seam(I,16,0,16,128); }});
const tCarrier=garment(128,64,1077,()=>['#1a1b1d','cordura',.5],{folds:6,decor:I=>{ for(let y=34;y<58;y+=8) for(let x=2;x<128;x+=8) if((x>>3)%4!==3) softRect(I,x,y,6,4,'#101112',.9,.4); softRect(I,40,6,48,16,'#242528',.9,1); textI(I,'SECURITY',42,10,'#c8c4b8',1.5); }});

/* Ozzie Kane, the boss: sheepskin-collared ranch jacket, plaid shirt, jeans, boots, white hair and beard */
const tKaneTorso=torsoP('kane',1081,(x,y)=>{ const open=Math.abs(x-64)<15; if(y>T3.belt+2) return ['#2a3448','denim',.6]; if(open) return crewNeck(x,y,10,10)?sk('kane'):[plaid(x,y,'#8a2a22','#5a1a16','#2a1a14'),'cotton',.6]; return ['#7a5432','leather',.7]; },{decor:I=>{ neckShadow(I);
  softRect(I,0,T3.neck,128,14,'#e8dcc4',.95,2); for(const s of [-1,1]){ softLine(I,64+s*15,T3.neck+14,64+s*15,T3.belt,'#5a3a20',.9,2.2); softRect(I,64+s*30-8,T3.chest-6,16,14,'#5a3a20',.85,1); } beltI(I,'#3a2414','#c8c4b8'); softRect(I,58,T3.belt-5,12,10,'#c8c4b8',.95,.6); }});
const tKaneArm=armP(1083,(x,y)=>y>118?['#e8dcc4','wool',.3]:['#7a5432','leather',.7],{decor:I=>softLine(I,40,10,42,110,'#5a3a20',.4,2)});
const tKaneLeg=legP(1085,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); seam(I,16,0,16,128,'#a8834a'); blob(I,32,44,9,20,.12,'#6a7a9a'); softRect(I,0,96,64,32,'#000000',.08,4); }});
const tCowboyBoot=garment(64,32,1087,()=>['#5a3a22','leather',.2],{folds:3,grime:.15,decor:I=>{ softRect(I,0,24,64,8,'#2a1a10',1,1); for(const y of [4,10]) softLine(I,22,y,42,y+4,'#8a6a42',.7,1); }});
/* Mae, Kane's mother: floral house dress, knitted shawl */
const tMaeTorso=torsoP('mae',1091,(x,y)=>{ if(crewNeck(x,y,13,10)) return sk('mae'); return ['#4a6a8a','cotton',.6]; },{decor:I=>{ neckShadow(I); const r=rng(1092); for(let i=0;i<70;i++){ const x=r()*128,y=T3.neck+8+r()*(250-T3.neck); softEll(I,x,y,2.6,2.2,r()>.5?'#e8c8b8':'#f0e8d0',.85,.4); softEll(I,x,y,1,1,'#c8a03a',.9,.3); }
  for(let y=T3.neck;y<T3.chest+10;y+=3) for(let x=(y%2)*3;x<128;x+=6) softEll(I,x,y,1.4,1.2,'#d8ccb4',.8,.3); }});
const tMaeArm=armP(1093,(x,y)=>y<60?['#d8ccb4','knit',.7]:['#4a6a8a','cotton',.6]);
const tMaeLeg=legP(1095,(x,y)=>y<70?['#4a6a8a','cotton',.6]:['#c8a890','knit',.2],{decor:I=>softLine(I,0,70,64,70,'#2a4a6a',.9,1.4)});
const tHouseSkirt=garment(64,32,1096,()=>['#4a6a8a','cotton',.6],{folds:5,dir:'v',grime:0,decor:I=>{ const r=rng(1097); for(let i=0;i<30;i++){ softEll(I,r()*64,r()*30,2.2,1.8,r()>.5?'#e8c8b8':'#f0e8d0',.85,.4); } }});
const tSlipperW=garment(64,32,1098,()=>['#8a6a7a','wool',.2],{folds:2,grime:.05,decor:I=>softRect(I,0,26,64,6,'#3a2a2a',1,1)});
/* Jesse (10): a hand-me-down denim jacket over a white tee, jeans, boots */
const tJesTorso=torsoP('jesse',1101,(x,y)=>{ const open=Math.abs(x-64)<14; if(y>T3.belt+2) return ['#3a4a6a','denim',.6]; if(open) return crewNeck(x,y,11,8)?sk('jesse'):['#ece8e0','cotton',.5]; return ['#5a7aa8','denim',.7]; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]){ softLine(I,64+s*14,T3.neck+6,64+s*14,T3.belt,'#4a6a98',.9,2); softRect(I,64+s*30-8,T3.chest-10,16,12,'#4a6a98',.9,1); } softRect(I,0,T3.belt-10,128,10,'#4a6a98',.9,1.4); }});
const tJesArm=armP(1103,()=>['#5a7aa8','denim',.7],{decor:I=>{ softRect(I,0,108,64,20,'#4a6a98',.6,1); seam(I,32,0,32,108,'#d8b06a'); }});
const tJesLeg=legP(1105,()=>['#3a4a6a','denim'],{decor:I=>{ blob(I,32,66,10,8,.14,'#7a8aaa'); softRect(I,0,112,64,16,'#2a3a5a',.8,1); }});
/* the cook: white apron over a black tee, check trousers */
const tCookTorso=torsoP('cook',1111,(x,y)=>{ if(crewNeck(x,y,11,8)) return sk('cook'); const apron=Math.abs(x-64)<32&&y>T3.chest-24; if(apron) return ['#e8e4dc','cotton',.6]; if(y>T3.belt+2) return [((x>>2)+(y>>2))%2?'#2a2a2e':'#e8e4dc','cotton',.4]; return ['#18181a','cotton',.5]; },{decor:I=>{ neckShadow(I); stain(I,56,T3.nav,6,'#8a5a3a',1112); stain(I,74,T3.chest+20,4,'#a83a2a',1113); softLine(I,0,T3.nav-6,128,T3.nav-6,'#d8d4cc',.9,2); }});
const tCookArm=armP(1113,(x,y)=>y<40?['#18181a','cotton',.5]:sk('cook'),{decor:I=>{ blob(I,32,44,30,3,-.18); }});
const tCookLeg=legP(1115,(x,y)=>[((x>>2)+(y>>2))%2?'#2a2a2e':'#e8e4dc','cotton',.4],{decor:I=>{ softRect(I,24,0,40,40,'#e8e4dc',.9,2); }});
/* ranch hands: waxed canvas jacket, flannel, jeans, caps */
const tHandTorso=torsoP('hand',1121,(x,y)=>{ const open=Math.abs(x-64)<14; if(y>T3.belt+2) return ['#2e3a54','denim',.6]; if(open) return crewNeck(x,y,10,8)?sk('hand'):[plaid(x+3,y,'#2a4a3a','#1a2e24','#8a8a6a'),'cotton',.6]; return ['#4a4a32','twill',.7]; },{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,10,'#3a2a1a',.9,2); for(const s of [-1,1]) softLine(I,64+s*14,T3.neck+10,64+s*14,T3.belt,'#3a3a24',.9,2); beltI(I,'#2a1a10','#a8a49c'); }});
const tHandArm=armP(1123,()=>['#4a4a32','twill',.7],{decor:I=>{ softRect(I,0,116,64,12,'#3a3a24',.8,1); blob(I,32,64,14,8,.12); }});
const tHandLeg=legP(1125,()=>['#2e3a54','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,62,10,8,.14,'#6a7a9a'); softRect(I,0,100,64,28,'#3a2a1a',.2,4); }});

function carrier(J,o){ vest(J,o,M(tCarrier,{double:true}),.026); }

/* ---------- the roster ---------- */
const HOUSES_ORDER=['pine','maple','crest','sallis','kane'];
const ROSTER={
  /* 1 · Pine Hollow */
  dale:Object.assign({house:'pine',side:'target',name:'Dale Pruitt',role:'Target 1 · "the Tipster"',color:'#d0453a',note:'Sold the raid\'s time and the stairwell door code to the crew for four thousand dollars. Sleeps on the couch with the TV on and a .38 under the cushion.',
    o:{hf:.98,w:.94,depth:.98,belly:1.12,lg:.92,ag:.9,jacket:.014,pants:.014},torso:tDaleTorso,arm:tDaleArm,leg:tDaleLeg,foot:tSlide,extra:(J,o)=>{ hairBack(J,'#5a4632',.08); collar(J,o,M(flat(64,16,906,'#6a6c70','knit'),{double:true}),.06,.016); }},REVOLVER),
  crystal:{house:'pine',side:'civ',name:'Crystal',role:'Lives here · Dale\'s girlfriend',color:'#a8b8c0',note:'Works nights at the gas station. Doesn\'t know what Dale did, and will tell you so.',
    o:Object.assign({jacket:.016,pants:.006},FEM,{hf:.94}),torso:tCrysTorso,arm:tCrysArm,leg:tCrysLeg,foot:tSockW,extra:J=>{ ponytail(J,'#d8c08a'); }},
  mason:{house:'pine',side:'kid',name:'Mason',role:'Kid · Crystal\'s son, 6',color:'#6aa86a',note:'Asleep in dinosaur pyjamas with the light on. If he wakes up he goes under the bed.',
    o:KID(.66,.9),torso:tMasonTorso,arm:tMasonArm,leg:tMasonLeg,foot:tKidSock,prop:pTeddy},
  corner:{house:'pine',side:'crew',name:'Corner boys',role:'Crew · partying in the living room',color:'#8e2a25',note:'The same Corner boys from the tower, on Dale\'s couch with his beer. Bottles and a bad attitude.',maker:makeCorner},
  cutter:{house:'pine',side:'crew',name:'Cutter',role:'Crew · out back',color:'#3f2b1f',note:'Smoking by the truck. Machete in the cab.',maker:makeCutter},
  /* 2 · Maple Court */
  kessler:Object.assign({house:'maple',side:'target',name:'Sgt. Walt Kessler',role:'Target 2 · Ray\'s sergeant',color:'#22304a',note:'Pulled the team\'s backup off the tower and logged it as a radio fault. Poker night in the kitchen with two friends from the job. He knows Ray\'s face better than anyone in this game.',
    o:{hf:1.0,w:1.06,depth:1.06,belly:1.12,lg:1.04,ag:1.06,jacket:.004,pants:.01},torso:tKessTorso,arm:tKessArm,leg:tKessLeg,foot:tBrownShoe},PISTOL,{fight:AIM_ONE}),
  linda:{house:'maple',side:'civ',name:'Linda Kessler',role:'Lives here · his wife',color:'#c8b89a',note:'Watching TV in the den. Calls 911 the second she hears glass, and keeps the kids behind her.',
    o:Object.assign({jacket:.016,pants:.01},FEM),torso:tLindaTorso,arm:tLindaArm,leg:tLindaLeg,foot:tFlat,extra:J=>hairBack(J,'#6a4428',.16)},
  ellie:{house:'maple',side:'kid',name:'Ellie Kessler',role:'Kid · 13',color:'#5a3a7a',note:'Up late on her phone. She\'s the one most likely to see something, and the one who\'d recognise Ray from the photos at the station.',
    o:Object.assign(KID(.86,.97),{shape:'teen',w:.9,jacket:.014}),torso:tEllieTorso,arm:tEllieArm,leg:tEllieLeg,foot:tSneakPink,prop:pPhone,extra:J=>{ hairBack(J,'#3a2416',.2,.97); }},
  ben:{house:'maple',side:'kid',name:'Ben Kessler',role:'Kid · 8',color:'#c8402e',note:'Should be asleep. Is not. Runs straight to his mom.',
    o:KID(.72,.91),torso:tBenTorso,arm:tBenArm,leg:tBenLeg,foot:tKidSneak},
  offduty:Object.assign({house:'maple',side:'crew',name:'Off-duty cops',role:'Crew · Kessler\'s friends from the job',color:'#6a7a5a',note:'Two of them, at the poker table, guns on their belts. They were in on it. They\'re the first people in the game who fight like Ray does.',
    o:{hf:1.0,w:1.02,depth:1.02,belly:1.06,lg:1.0,ag:1.02,jacket:.004,pants:.01},torso:tOffTorso,arm:tOffArm,leg:tOffLeg,foot:tBrownShoe},PISTOL),
  /* 3 · Crestline */
  ashby:{house:'crest',side:'target',name:'Martin Ashby',role:'Target 3 · the crew\'s lawyer',color:'#3a3c42',note:'Set up the meet that put the team in the stairwell, then got everyone off. Throwing a party in the glass house the night you come. Unarmed: he negotiates, then he begs.',
    o:{hf:.98,w:.94,depth:.94,lg:.94,ag:.94,jacket:.012,pants:.008},torso:tAshTorso,arm:tAshArm,leg:tAshLeg,foot:tShoeBlack,prop:pPhone,extra:(J,o)=>collar(J,o,M(flat(64,16,986,'#e8e6e0','cotton'),{double:true}),.04,.008)},
  guest:{house:'crest',side:'civ',name:'Party guest',role:'Guest · one of forty',color:'#1f6a4e',note:'Came for the view. Screams, runs for the pool deck, and posts what she saw.',
    o:Object.assign({jacket:.004,pants:.004},FEM,{hf:.96}),torso:tGuestTorso,arm:tGuestArm,leg:tGuestLeg,foot:tHeel,extra:(J,o)=>{ hairBack(J,'#140e0a',.24); skirt(J,o,tDressSkirt,.55,1.18); }},
  guestm:{house:'crest',side:'civ',name:'Party guest',role:'Guest · Ashby\'s client',color:'#a8865a',note:'Knows exactly whose party this is. Hides in the wine room.',
    o:{hf:.99,w:.98,depth:.96,lg:.98,ag:.98,jacket:.012,pants:.008},torso:tGuestmTorso,arm:tGuestmArm,leg:tGuestmLeg,foot:tShoeBlack},
  barman:{house:'crest',side:'civ',name:'Bartender',role:'Working the party',color:'#ece8e2',note:'Hired for the night. Gets down behind the bar and stays there.',
    o:{hf:.99,w:.98,depth:.98,lg:.98,ag:.98,jacket:.006,pants:.008},torso:tBarTorso,arm:tBarArm,leg:tBarLeg,foot:tShoeBlack},
  suit:Object.assign({house:'crest',side:'crew',name:'Private security',role:'Crew · four on the property',color:'#18181c',note:'Black suits, earpieces, pistols. Professionals: they move Ashby to the panic room first and come for you second.',
    o:{hf:1.03,w:1.1,depth:1.08,lg:1.08,ag:1.1,jacket:.012,pants:.008},torso:tSuitTorso,arm:tSuitArm,leg:tSuitLeg,foot:tShoeBlack,extra:J=>earpiece(J)},PISTOL),
  /* 4 · the Sallis estate */
  sallis:Object.assign({house:'sallis',side:'target',name:'Victor Sallis',role:'Target 4 · owns the tower',color:'#6a1a2a',note:'Needed the tower empty and the team gone so the sale would close. Comes downstairs in his robe with a golf club, sure nobody would dare.',
    o:{hf:.97,w:.98,depth:1.02,belly:1.14,lg:.94,ag:.94,jacket:.016,pants:.012},torso:tSalTorso,arm:tSalArm,leg:tSalLeg,foot:tVelvet},{prop:pClub,gripHand:true,support:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:CLUB}),
  helena:{house:'sallis',side:'civ',name:'Helena Sallis',role:'Lives here · his wife',color:'#ece2d0',note:'Hits the silent alarm, then goes to her daughter\'s room and locks the door.',
    o:Object.assign({jacket:.008,pants:.01},FEM,{hf:.97}),torso:tHelTorso,arm:tHelArm,leg:tHelLeg,foot:tFlat,extra:J=>bun(J,'#e6d2a2')},
  grace:{house:'sallis',side:'civ',name:'Grace',role:'Works here · the nanny',color:'#9a8ac0',note:'Has been with the family eleven years. Will put herself between you and Sophie without thinking about it.',
    o:Object.assign({jacket:.01,pants:.012,belly:1.06},FEM,{hf:.93}),torso:tGraceTorso,arm:tGraceArm,leg:tGraceLeg,foot:tSlipperW,extra:J=>bun(J,'#140e0a')},
  sophie:{house:'sallis',side:'kid',name:'Sophie Sallis',role:'Kid · 9',color:'#efe2a8',note:'In her nightgown on the landing, holding the banister. Grace is never far.',
    o:Object.assign(KID(.76,.92),{shape:'kid'}),torso:tSophTorso,arm:tSophArm,leg:tSophLeg,foot:tKidSock,extra:(J,o)=>{ hairBack(J,'#c8a060',.18,.92); skirt(J,o,tGownSkirt,.62,1.2); }},
  guard:Object.assign({house:'sallis',side:'crew',name:'Estate guards',role:'Crew · six on the grounds',color:'#a89874',note:'Ex-military, plate carriers, SMGs, a gatehouse full of monitors. The first house where loud is a bad idea.',
    o:{hf:1.02,w:1.06,depth:1.04,lg:1.06,ag:1.06,jacket:.004,pants:.012},torso:tGuardTorso,arm:tGuardArm,leg:tGuardLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ carrier(J,o); cap(J,'#2a2a28','#1a1a18'); earpiece(J); }},TWO(pSMG,'smg')),
  /* 5 · the Kane ranch */
  kane:Object.assign({house:'kane',side:'target',name:'Ozzie Kane',role:'Target 5 · runs every crew in the city',color:'#7a5432',note:'The Landlord answered to him. Lives out past the city limits on a ranch full of armed men, with his mother and his grandson. Doesn\'t beg. Doesn\'t run.',
    o:{hf:1.06,w:1.2,depth:1.16,belly:1.16,lg:1.18,ag:1.22,jacket:.024,pants:.014,headS:1.04,shoeW:.11},torso:tKaneTorso,arm:tKaneArm,leg:tKaneLeg,foot:tCowboyBoot,extra:J=>hairBack(J,'#e8e4dc',.06,1.04)},TWO(pShotgun,'shotgun')),
  mae:{house:'kane',side:'civ',name:'Mae Kane',role:'Lives here · his mother',color:'#4a6a8a',note:'Eighty-four, on the porch in her rocker at two in the morning. She knows what her son is. She\'ll talk to you.',
    o:Object.assign({jacket:.014,pants:.014,belly:1.1},FEM,{hf:.88}),torso:tMaeTorso,arm:tMaeArm,leg:tMaeLeg,foot:tSlipperW,extra:(J,o)=>{ bun(J,'#e8e4de'); skirt(J,o,tHouseSkirt,.62,1.16); }},
  jesse:{house:'kane',side:'kid',name:'Jesse',role:'Kid · Kane\'s grandson, 10',color:'#5a7aa8',note:'Thinks his grandpa is a rancher. Sneaks out to the barn when he hears shooting, which is the worst place he could be.',
    o:KID(.78,.93),torso:tJesTorso,arm:tJesArm,leg:tJesLeg,foot:tCowboyBoot},
  cook:{house:'kane',side:'civ',name:'Abe',role:'Works here · the cook',color:'#e8e4dc',note:'Cooks for the hands. Keeps a radio on in the kitchen and his head down.',
    o:{hf:.97,w:1.0,depth:1.04,belly:1.18,lg:.96,ag:.98,jacket:.006,pants:.01},torso:tCookTorso,arm:tCookArm,leg:tCookLeg,foot:tShoeBlack},
  hand:Object.assign({house:'kane',side:'crew',name:'Ranch hands',role:'Crew · eight, with dogs in the kennel',color:'#4a4a32',note:'Floodlights, pickups and pump shotguns. They know the land in the dark and you don\'t.',
    o:{hf:1.0,w:1.02,depth:1.02,lg:1.02,ag:1.04,jacket:.012,pants:.012},torso:tHandTorso,arm:tHandArm,leg:tHandLeg,foot:tCowboyBoot,extra:J=>cap(J,'#6a5a3a','#4a3a24')},TWO(pShotgun,'shotgun'))
};
