
/* =====================================================================================================
   THE CAST, built on the Stairwell rig: rig() for the skinned body, paintHead() for faces and expressions,
   garment()/torsoP()/armP()/legP() for painted clothes, finish()/applyPose() for poses and props.
   Only the data is new: heads, outfits, hats, three props and one two-handed gun entry.
   ===================================================================================================== */
Object.assign(HEADS,{
  teo:{seed:201,skin:'#b88462',skinD:'#8a5a40',hair:'slick',hairC:'#15110e',hairFront:14,sideburn:38,shadow:true,brow:'#15110e',browT:2,iris:'#3a2a1c',lip:'#8a4c3c',beard:'stubble',beardC:'#2a1c14',cut:true},
  velvet:{seed:211,skin:'#a87050',skinD:'#784a34',hair:'slick',hairC:'#a8a49c',hairFront:13,sideburn:40,brow:'#5a5650',iris:'#2a1a10',lip:'#7a3e30',beard:'mustache',beardC:'#9a968e',gold:true},
  chef:{seed:221,skin:'#e2b292',skinD:'#b07a5a',hair:'buzz',hairC:'#8a3418',hairFront:15,brow:'#8a3418',browT:2,iris:'#3a5a7a',lip:'#b06050',beard:'full',beardC:'#8a3418',scar:true},
  sister:{seed:231,skin:'#ecc8aa',skinD:'#bc9274',hair:'long',hairC:'#0e0c10',hairFront:12,sideburn:44,behind:56,nape:60,brow:'#0e0c10',iris:'#2a1a14',lip:'#a8283a'},
  porter:{seed:241,skin:'#a87850',skinD:'#7a5034',bal:'#141416',brow:'#1a120e',iris:'#2a1a10',lip:'#7a4232'},
  boss:{seed:251,skin:'#dcb89c',skinD:'#a8846a',hair:'slick',hairC:'#ece8e0',hairFront:12,sideburn:36,brow:'#ece8e0',browT:2,iris:'#5a6a7a',lip:'#9a5a4e',age:true,spots:true,glasses:'#c9a23a',beard:'goatee',beardC:'#e4e0d8'},
  salary:{seed:261,skin:'#dab290',skinD:'#a8805e',hair:'slick',hairC:'#1a1614',hairFront:13,brow:'#1a1614',iris:'#2a1a10',lip:'#a06050',glasses:'#2a2a2e'},
  tourist:{seed:271,skin:'#eeb49a',skinD:'#c4826a',hair:'buzz',hairC:'#c8a060',hairFront:15,brow:'#a8803e',iris:'#4a6a8a',lip:'#b0624e',beard:'full',beardC:'#b88a50'},
  conductor:{seed:281,skin:'#8a5a3c',skinD:'#5a3622',hair:'long',hairC:'#1a120e',hairFront:13,sideburn:42,behind:54,nape:56,brow:'#1a120e',iris:'#2a1a10',lip:'#7a3a30'},
  grandma:{seed:291,skin:'#e4c0a6',skinD:'#b8927a',hair:'long',hairC:'#e8e4de',hairFront:14,sideburn:42,behind:52,nape:54,brow:'#d8d4cc',iris:'#4a5a6a',lip:'#b07a72',age:true,glasses:'#8a7a6a'}
});
for(const k of ['teo','velvet','chef','sister','porter','boss','salary','tourist','conductor','grandma']) FACE[k]={fight:paintHead(HEADS[k],'fight'),hurt:paintHead(HEADS[k],'hurt'),beg:paintHead(HEADS[k],'beg'),sleep:paintHead(HEADS[k],'sleep')};

/* ---------- props ---------- */
const mGold=M(null,{color:0xd4ad5a}), mPearl=M(null,{color:0xf0ece0});
function pBaton(g){ mk(box(.03,.03,.14),mBlack,g,0,0,0); mk(cyl(.014,.014,.42,6),M(tBlued,{double:true}),g,0,0,.28,Math.PI/2); mk(cyl(.018,.018,.03,6),mSteel,g,0,0,.08,Math.PI/2); return g; }
function pCleaver(g){ mk(box(.026,.03,.13),M(woodT('#5a3a24','#3a2416',301)),g,0,0,0); mk(box(.006,.12,.22,{td:.9}),M(tBladeBlood,{double:true}),g,0,-.05,.17); return g; }
function pRevGold(g){ mk(box(.026,.085,.035),mPearl,g,0,-.035,-.015,.3); mk(box(.028,.045,.085),mGold,g,0,.025,.03); mk(cyl(.021,.021,.042,6),M(null,{color:0xd4ad5a,double:true}),g,0,.028,.045,Math.PI/2); mk(cyl(.009,.009,.09,6),M(null,{color:0xd4ad5a,double:true}),g,0,.036,.12,Math.PI/2); return g; }
function pRevPearl(g){ mk(box(.026,.085,.035),mPearl,g,0,-.035,-.015,.3); mk(box(.028,.045,.085),mSteel,g,0,.025,.03); mk(cyl(.021,.021,.042,6),M(tSteel,{double:true}),g,0,.028,.045,Math.PI/2); mk(cyl(.009,.009,.07,6),M(tSteel,{double:true}),g,0,.036,.11,Math.PI/2); return g; }
function pRifle(g){ const wood=M(woodT('#7a4a2a','#5a3418',302)); mk(box(.045,.07,.22),mBlack,g,0,0,.02); mk(cyl(.011,.011,.62,6),M(tBlued,{double:true}),g,0,.02,.42,Math.PI/2);
  mk(box(.042,.05,.24),wood,g,0,-.02,.24); mk(box(.045,.11,.26,{td:.7}),wood,g,0,-.04,-.21,.12); mk(cyl(.02,.02,.2,8),M(tBlued,{double:true}),g,0,.075,.04,Math.PI/2); mk(box(.012,.03,.012),mBlack,g,0,.05,.0); return g; }
GUNS.rifle={butt:.33,grip:[0,-.04,-.08],fore:[0,-.02,.24],dir:[.33,-.52,.79]};

/* ---------- painted outfits ---------- */
const vNeck=(x,y,w0,drop)=>y<T3.neck+drop&&Math.abs(x-64)<w0*(1-(y-T3.neck)/drop);
const buttons=(I,xs,y0,y1,step,col)=>{ for(const x of xs) for(let y=y0;y<y1;y+=step){ softEll(I,x,y,1.8,1.8,col,1,.4); softEll(I,x-.5,y-.5,.7,.7,'#ffffff',.4,.4); } };
/* Teo: rail security, teal tunic with gold piping */
const TEAL='#1f4f5c';
const tTeoTorso=torsoP('teo',401,(x,y)=>{ if(vNeck(x,y,12,26)) return Math.abs(x-64)<2.5?['#a8202a','cotton',.3]:['#ece8e0','cotton',.4]; return y>T3.belt+3?['#2a2c34','twill',.7]:[TEAL,'twill']; },{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,T3.belt);
  softLine(I,64,T3.neck+26,64,T3.belt-3,'#d4ad5a',.95,1.2); softLine(I,52,T3.neck,64,T3.neck+26,'#d4ad5a',.9,1); softLine(I,76,T3.neck,64,T3.neck+26,'#d4ad5a',.9,1);
  buttons(I,[68],T3.neck+34,T3.belt-6,16,'#d4ad5a'); softEll(I,86,T3.sh+28,6,4,'#d4ad5a',.95,.4); softEll(I,86,T3.sh+28,3.5,2.5,'#a8202a',.9,.4); beltI(I,'#141416','#d4ad5a'); }});
const tTeoArm=armP(403,()=>[TEAL,'twill'],{decor:I=>{ softRect(I,0,108,64,3,'#d4ad5a',.95,.6); softRect(I,0,114,64,1.5,'#d4ad5a',.8,.6); softRect(I,40,14,12,14,'#a8202a',.95,1); softRect(I,42,16,8,10,'#d4ad5a',.6,1); }});
const tTeoLeg=legP(405,()=>['#2a2c34','twill'],{decor:I=>{ for(const x of [15,49]) softLine(I,x,0,x,128,'#d4ad5a',.85,1.2); seam(I,32,0,32,128); }});
/* Velvet: ivory dinner jacket, magenta shirt, satin-striped trousers */
const tVelTorso=torsoP('velvet',411,(x,y)=>{ const open=Math.abs(x-64)<(y<T3.belt-30?18-(y-T3.neck)*.04:6); if(y>T3.belt+2) return ['#151517','wool',.6]; return open?['#c8246e','cotton',.5]:['#ece4d2','wool']; },{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,T3.belt);
  for(const s of [-1,1]){ softLine(I,64+s*18,T3.neck,64+s*7,T3.belt-30,'#d6ccb6',.9,1.6); } buttons(I,[64],T3.belt-26,T3.belt-6,10,'#151517'); softRect(I,82,T3.sh+20,7,3,'#c8246e',.95,.5); beltI(I,'#151517','#d4ad5a'); }});
const tVelArm=armP(413,(x,y)=>y>114?['#c8246e','cotton',.2]:['#ece4d2','wool'],{decor:I=>{ softLine(I,0,113,64,113,'#d6ccb6',.8,1); }});
const tVelLeg=legP(415,()=>['#151517','wool'],{decor:I=>{ for(const x of [15,49]) softLine(I,x,0,x,128,'#34343c',.9,2); }});
const tPatent=garment(64,32,417,()=>['#101012','leather',.2],{folds:2,grime:0,decor:I=>{ softRect(I,0,24,64,8,'#050506',1,1); blob(I,32,10,16,5,.4); }});
/* Chef: double-breasted whites, a bloodied apron, check trousers, tattooed forearms */
const tChefTorso=torsoP('chef',421,(x,y)=>{ if(y>T3.belt+2) return [((x>>2)+(y>>2))&1?'#a8a4a0':'#4a4a50','cotton',.5]; return ['#f2efe8','cotton']; },{decor:I=>{ neckShadow(I); softRect(I,0,T3.neck,128,7,'#b8342a',.95,1); sideSeams(I,T3.neck,T3.belt);
  buttons(I,[54,74],T3.neck+20,T3.chest+40,14,'#1a1a1c'); softRect(I,34,T3.chest+20,60,256-T3.chest-20,'#f6f4ee',.96,1.2); softLine(I,34,T3.chest+20,94,T3.chest+20,'#d8d4cc',.7,1.2);
  bloodSoak(I,58,T3.belt-10,9,6,423); bloodSoak(I,74,T3.belt+20,6,8,424); bloodSoak(I,50,T3.belt+44,4,5,425); }});
const tChefArm=armP(426,(x,y)=>y<62?['#f2efe8','cotton']:[HEADS.chef.skin,'skin',0],{decor:I=>{ softRect(I,0,56,64,7,'#e2ded6',.95,1); blob(I,32,66,30,3,-.2); softEll(I,32,92,5,7,'#2a4a6a',.6,.3); softLine(I,32,86,32,100,'#2a4a6a',.6,1); softLine(I,27,96,37,96,'#2a4a6a',.6,1); for(let k=0;k<30;k++) softLine(I,(k*13)%64,70+(k*7)%50,(k*13)%64+1,72+(k*7)%50,'#8a3418',.25,.8); }});
const tChefLeg=legP(427,(x,y)=>[((x>>2)+(y>>2))&1?'#a8a4a0':'#4a4a50','cotton',.5],{decor:I=>{ softRect(I,8,0,48,40,'#f6f4ee',.95,1.4); bloodSoak(I,30,20,5,7,428); }});
const tClog=garment(64,32,429,()=>['#1a1a1c','leather',.3],{folds:2,decor:I=>softRect(I,0,22,64,10,'#0a0a0b',1,1)});
/* the twins: belted cream trench coats, red scarves, black tights */
const TR='#d8c8a8';
const tSisTorso=torsoP('sister',431,(x,y)=>{ return ['#d8c8a8','twill']; },{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,256);
  for(const s of [-1,1]) softLine(I,64+s*16,T3.neck,64+s*4,T3.chest+10,'#b8a888',.95,1.6); softLine(I,66,T3.chest+10,66,256,'#b8a888',.9,1.2); buttons(I,[56,76],T3.chest+14,T3.belt-10,16,'#5a4a36');
  softRect(I,0,T3.nav-4,128,8,'#c8b898',1,.6); softRect(I,58,T3.nav-5,10,10,'#8a7a5a',.95,.5); softRect(I,60,T3.nav-3,6,6,'#c8b898',.8,.5); }});
const tSisArm=armP(433,()=>[TR,'twill'],{decor:I=>{ softRect(I,0,104,64,5,'#c8b898',1,.6); softRect(I,28,104,8,5,'#8a7a5a',.9,.5); softRect(I,0,0,64,6,'#c8b898',.6,1); }});
const tSisLeg=legP(435,(x,y)=>y<58?[TR,'twill']:y<92?['#1a1a1e','knit',.2]:['#141416','leather',.3],{decor:I=>{ softLine(I,0,58,64,58,'#a89878',.9,1.4); softLine(I,0,92,64,92,'#2a2a2e',.8,1); }});
const tScarf=flat(64,16,437,'#b8202e','knit');
/* porters: maroon jackets, gold braid, fox masks */
const MR='#6e1f2a';
const tPortTorso=torsoP('porter',441,(x,y)=>y>T3.belt+2?['#18181a','wool',.6]:[MR,'wool'],{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,T3.belt); softRect(I,0,T3.neck,128,6,'#d4ad5a',.9,.6); softLine(I,64,T3.neck+6,64,T3.belt-3,'#4a1018',.8,1.2); buttons(I,[68],T3.neck+16,T3.belt-6,14,'#d4ad5a'); beltI(I,'#141416','#d4ad5a'); }});
const tPortArm=armP(443,()=>[MR,'wool'],{decor:I=>{ for(const y of [104,109,114]) softRect(I,0,y,64,2,'#d4ad5a',.95,.5); }});
const tPortLeg=legP(445,()=>['#18181a','wool'],{decor:I=>{ for(const x of [15,49]) softLine(I,x,0,x,128,MR,.9,1.6); }});
const tFox=P2(32,40,(g,w,h)=>{ poly(g,[[3,2],[29,2],[30,18],[23,34],[16,39],[9,34],[2,18]],'#f4f0e6'); vfill(g,3,2,26,6,[[0,'#e8e2d4'],[1,'#f4f0e6']]);
  for(const s of [-1,1]){ poly(g,[[16+s*4,13],[16+s*12,9],[16+s*13,13],[16+s*5,16]],'#c8202a'); poly(g,[[16+s*5,14],[16+s*10,12],[16+s*10,14],[16+s*6,15]],'#141416'); poly(g,[[16+s*6,4],[16+s*10,2],[16+s*9,8]],'#c8202a'); }
  ell(g,16,30,3,2,'#141416'); R(g,'#c8202a',15,33,2,4); R(g,'#c9a23a',15,6,2,5); },2,7);
/* the man in the linen suit */
const LN='#e6dcc4';
const tBossTorso=torsoP('boss',451,(x,y)=>{ if(vNeck(x,y,13,40)) return Math.abs(x-64)<3?['#6a1a2a','cotton',.3]:['#b8d0e4','cotton',.4]; return [LN,'cotton']; },{folds:26,decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,256); for(const s of [-1,1]) softLine(I,64+s*13,T3.neck,64+s*3,T3.neck+40,'#cfc4aa',.95,1.8); buttons(I,[66],T3.neck+48,T3.belt-4,18,'#8a7a5a'); softRect(I,82,T3.sh+22,8,3,'#6a1a2a',.9,.5); }});
const tBossArm=armP(453,()=>[LN,'cotton'],{folds:14,decor:I=>{ softRect(I,0,120,64,8,'#b8d0e4',.95,.6); }});
const tBossLeg=legP(455,()=>[LN,'cotton'],{folds:14,decor:I=>{ softLine(I,32,0,32,128,'#cfc4aa',.7,1); }});
const tSpect=garment(64,32,457,(x,y)=>[y<16&&x>20&&x<44?'#f2ece0':'#6a3a22','leather',.2],{folds:2,grime:0,decor:I=>softRect(I,0,24,64,8,'#2a1a10',1,1)});
const tStraw=P2(16,16,(g,w,h)=>{ R(g,'#e6d4a0',0,0,w,h); for(let y=0;y<h;y+=2) for(let x=(y>>1)%2;x<w;x+=2) R(g,'#cbb680',x,y,1,1); },6,9);
/* passengers */
const tSalTorso=torsoP('salary',461,(x,y)=>{ if(vNeck(x,y,12,36)) return Math.abs(x-60)<2.5&&y>T3.neck+6?['#b02a2a','cotton',.3]:['#f2f0ea','cotton',.4]; return ['#3a3c42','wool']; },{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,256); for(const s of [-1,1]) softLine(I,64+s*12,T3.neck,64+s*3,T3.neck+36,'#2a2c32',.9,1.6); buttons(I,[66],T3.neck+44,T3.belt-4,18,'#18181a'); }});
const tSalArm=armP(463,(x,y)=>y>118?['#f2f0ea','cotton',.2]:['#3a3c42','wool']);
const tSalLeg=legP(465,()=>['#3a3c42','wool'],{decor:I=>softLine(I,32,0,32,128,'#4a4c52',.7,1)});
const tTourTorso=torsoP('tourist',471,(x,y)=>{ if(vNeck(x,y,10,22)) return [HEADS.tourist.skin,'skin',0]; return y>T3.belt+2?['#c8b07a','twill',.6]:['#e86a5a','cotton']; },{decor:I=>{ neckShadow(I); const r=rng(472);
  for(let i=0;i<46;i++){ const x=r()*128,y=T3.neck+6+r()*(T3.belt-T3.neck-10); for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; softEll(I,x+Math.cos(a)*2.6,y+Math.sin(a)*2.6,1.6,1.6,i%3?'#fff0f4':'#f2a0b8',.95,.4); } softEll(I,x,y,1,1,'#e0a526',.95,.4); }
  for(let y=T3.neck+22;y<T3.belt;y+=1) put(I,64,y,[.6,.25,.2],.5); softRect(I,54,T3.chest-4,20,14,'#18181a',.95,.6); softEll(I,64,T3.chest+3,4,4,'#3a4a5a',.95,.4); softLine(I,46,T3.neck,56,T3.chest-4,'#3a2a1a',.8,1.2); softLine(I,82,T3.neck,72,T3.chest-4,'#3a2a1a',.8,1.2); beltI(I,'#5a3a22','#c9a23a'); }});
const tTourArm=armP(473,(x,y)=>y<40?['#e86a5a','cotton']:[HEADS.tourist.skin,'skin',0],{decor:I=>{ const r=rng(474); for(let i=0;i<10;i++){ const x=r()*64,y=4+r()*30; softEll(I,x,y,2.4,2.4,'#fff0f4',.9,.4); } blob(I,32,44,30,3,-.18); }});
const tTourLeg=legP(475,(x,y)=>y<58?['#c8b07a','twill']:[HEADS.tourist.skin,'skin',0],{decor:I=>{ softLine(I,0,58,64,58,'#a8905a',.9,1.4); blob(I,32,62,30,3,-.15); }});
const tSandal=garment(64,32,477,()=>[HEADS.tourist.skin,'skin',.1],{folds:1,grime:0,decor:I=>{ softRect(I,0,26,64,6,'#5a3a22',1,1); for(const y of [8,16]) softRect(I,0,y,64,3,'#6a4428',.95,.6); }});
const CR='#a8202a';
const tCondTorso=torsoP('conductor',481,(x,y)=>[CR,'wool'],{decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,256); softRect(I,0,T3.neck,128,5,'#d4ad5a',.9,.6); buttons(I,[56,72],T3.neck+16,T3.belt-6,14,'#d4ad5a'); softRect(I,0,T3.belt-3,128,5,'#5a0e14',1,.6); }});
const tCondArm=armP(483,()=>[CR,'wool'],{decor:I=>{ softRect(I,0,106,64,3,'#d4ad5a',.95,.5); }});
const tCondLeg=legP(485,(x,y)=>y<56?['#1d2a4a','wool']:['#2a2430','knit',.2],{decor:I=>softLine(I,0,56,64,56,'#141c34',.9,1.4)});
const tGranTorso=torsoP('grandma',491,(x,y)=>{ if(vNeck(x,y,14,30)) return ['#f2ead8','cotton',.4]; return y>T3.belt+2?['#6a6870','wool',.6]:['#9c8cc4','knit',.8]; },{decor:I=>{ neckShadow(I); buttons(I,[64],T3.neck+34,T3.belt-4,16,'#f2ead8'); softRect(I,0,T3.belt-10,128,10,'#8c7cb4',1,.6); }});
const tGranArm=armP(493,(x,y)=>y>116?['#8c7cb4','knit',.2,.85]:['#9c8cc4','knit',.8]);
const tGranLeg=legP(495,(x,y)=>y<84?['#6a6870','wool']:['#d8b8a0','skin',.1],{decor:I=>softLine(I,0,84,64,84,'#4a4850',.9,1.4)});
const tBrownShoe=garment(64,32,497,()=>['#5a3a22','leather',.2],{folds:2,decor:I=>softRect(I,0,24,64,8,'#2a1a10',1,1)});

/* ---------- hats, buns, masks ---------- */
function crown(J,rings,m,cz=-.008){ return mk(lathe(rings.map(([y,rx,rz])=>[y,rx,rz,cz]),10),m,J.head); }
function peakedCap(J,body,band){ crown(J,[[.17,.083,.103],[.21,.088,.108],[.265,.092,.11],[.28,0,0]],body); crown(J,[[.168,.086,.106],[.19,.086,.106]],band); mk(box(.15,.012,.07),M(null,{color:0x101012}),J.head,0,.17,.095,.3); }
function bun(J,col){ mk(lathe([[0,.012,.012],[.03,.048,.048],[.07,.05,.05],[.1,.012,.012]],8),M(null,{color:hexInt(col)}),J.head,0,.15,-.085,-1.2); }
function pillbox(J,body,band){ const n=N(J.head,0,.235,.01,-.15,0,.12); mk(cyl(.07,.07,.06,10),body,n,0,0,0); mk(cyl(.072,.072,.015,10),band,n,0,-.02,0); }

/* ---------- the roster ---------- */
const FEM={hf:.95,w:.88,depth:.92,lg:.86,ag:.84,belly:.95,shoeW:.085};
const ONE_HAND={armR:[-2.0,0,.25],elbowR:[-1.1,0,0],armL:[-.7,0,-.35],elbowL:[-.9,0,0],spine:[.15,-.25,0],head:[0,.25,0],thighL:[-.25,0,.06],kneeL:[.3,0,0],thighR:[.15,0,-.05],kneeR:[.1,0,0]};
const AIM_ONE={spine:[.1,0,0],neck:[-.06,0,0],armR:[-1.42,0,.05],elbowR:[-.05,0,0],armL:[.05,0,.12],elbowL:[-.25,0,0],head:[-.02,0,0],thighL:[-.12,0,.05],thighR:[.06,0,-.04]};
const HANDS_UP={armL:[-2.75,0,-.32],elbowL:[-.85,0,0],armR:[-2.75,0,.32],elbowR:[-.85,0,0],spine:[-.06,0,0],head:[.14,0,0],thighL:[-.05,0,.04],kneeL:[.12,0,0]};
const ROSTER={
  teo:{name:'Teo Arakawa-Bell',role:'You · train security',where:'Starts in the baggage car',color:'#3fae9a',note:'On-board security for the maiden run: a radio, a baton and a ticket-checking job. Nobody counted on him. You fight your way from the back of the train to the cab.',
    o:{hf:1.0,w:1.02,depth:1.0,lg:1.02,ag:1.04,jacket:.008,pants:.008},torso:tTeoTorso,arm:tTeoArm,leg:tTeoLeg,foot:tShoeBlack,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,406,TEAL,'twill'),{double:true}),.04,.008); peakedCap(J,M(flat(32,16,407,TEAL,'twill')),M(null,{color:0xd4ad5a})); },prop:pBaton,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND},
  porter:{name:'The Porters',role:'Hijackers · six of them',where:'Standard Class and everywhere else',color:'#c8202a',note:'Dressed as train porters, faces hidden behind fox masks. Compact SMGs under the jackets. They hold the passengers and patrol between the cars.',
    o:{hf:1.0,w:1.02,depth:1.0,lg:1.0,ag:1.02,jacket:.008,pants:.01},torso:tPortTorso,arm:tPortArm,leg:tPortLeg,foot:tBlackBoot,hand:tGlove,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,446,'#d4ad5a','twill'),{double:true}),.03,.006); const fox=M(tFox); mk(box(.13,.16,.03),F(M(null,{color:0xf4f0e6}),fox),J.head,0,.105,.09,-.08); for(const s of [-1,1]) mk(box(.035,.075,.02,{tw:.2}),M(null,{color:0xf4f0e6}),J.head,s*.05,.25,.04,0,0,-s*.2); pillbox(J,M(null,{color:hexInt(MR)}),M(null,{color:0xd4ad5a})); },
    prop:pSMG,twoHand:true,gripHand:true,gun:'smg',wFight:{p:[0,0,0],r:[0,0,0]},fight:TWO_HAND_ARMS,two:true},
  velvet:{name:'Rocco "Velvet" Amaral',role:'Hijacker · the crooner',where:'Club Hotaru, on stage',color:'#ff3fa4',note:'A lounge singer who never got his break and took a gold revolver instead. He keeps singing while his men search the bar car, and he wants an audience.',
    o:{hf:1.0,w:1.0,depth:1.0,belly:1.05,lg:.98,ag:1.0,jacket:.012,pants:.008},torso:tVelTorso,arm:tVelArm,leg:tVelLeg,foot:tPatent,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,418,'#ece4d2','wool'),{double:true}),.05,.012); const bt=M(null,{color:0x101012}); mk(box(.09,.035,.02,{tw:.4}),bt,J.neck,0,.02,frontAt(o,1.53)+.012); mk(box(.06,.022,.03),mGold,J.handL,0,-.06,0); },
    prop:pRevGold,gripHand:true,wFight:{p:[.036,-.089,.035],r:[Math.PI/2,0,0]},fight:AIM_ONE},
  chef:{name:'Chef Augustin Mori',role:'Hijacker · the galley',where:'Restaurant Riviere',color:'#e2725b',note:'Three Michelin stars, then a scandal, then nothing. He took the galley because he likes the knives, and he will not leave his kitchen.',
    o:{hf:1.04,w:1.16,depth:1.12,belly:1.18,lg:1.12,ag:1.16,jacket:.014,pants:.012,headS:1.02},torso:tChefTorso,arm:tChefArm,leg:tChefLeg,foot:tClog,
    extra:(J,o)=>{ crown(J,[[.15,.082,.102],[.2,.092,.112],[.33,.1,.12],[.42,.11,.13],[.46,.09,.11],[.47,0,0]],M(flat(16,16,428,'#f6f4ee','cotton'))); },prop:pCleaver,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND},
  sisterA:{key:'sister',name:'Mika Brandt-Ishida',role:'Hijacker · twin',where:'Moonlight Sleeper',color:'#9c8cc4',note:'Twins, marksmen, matching coats. Mika covers one end of the sleeper corridor and her sister covers the other. Take one and the other knows.',
    o:Object.assign({jacket:.016,pants:.014},FEM),torso:tSisTorso,arm:tSisArm,leg:tSisLeg,foot:tBlackBoot,
    extra:(J,o)=>{ collar(J,o,M(tScarf,{double:true}),.07,.02); bun(J,'#0e0c10'); },prop:pRifle,twoHand:true,gripHand:true,gun:'rifle',wFight:{p:[0,0,0],r:[0,0,0]},fight:TWO_HAND_ARMS,two:true},
  sisterB:{key:'sister',name:'Mila Brandt-Ishida',role:'Hijacker · twin',where:'Moonlight Sleeper',color:'#9c8cc4',note:'The other twin. The same face, the same rifle, the other end of the corridor.',
    o:Object.assign({jacket:.016,pants:.014},FEM),torso:tSisTorso,arm:tSisArm,leg:tSisLeg,foot:tBlackBoot,
    extra:(J,o)=>{ collar(J,o,M(tScarf,{double:true}),.07,.02); bun(J,'#0e0c10'); },prop:pRifle,twoHand:true,gripHand:true,gun:'rifle',wFight:{p:[0,0,0],r:[0,0,0]},fight:TWO_HAND_ARMS,two:true},
  boss:{name:'Mr. Hollis Kuroda',role:'The man in charge',where:'Salon Imperial',color:'#d4ad5a',note:'Old money in a linen suit and a panama hat. He sits in the VIP lounge with a pearl-handled revolver on the table and the cab radio in his lap.',
    o:{hf:.97,w:.97,depth:1.0,belly:1.12,lg:.92,ag:.9,jacket:.012,pants:.012},torso:tBossTorso,arm:tBossArm,leg:tBossLeg,foot:tSpect,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,458,'#b8d0e4','cotton'),{double:true}),.04,.006); mk(cyl(.155,.155,.008,14),M(tStraw),J.head,0,.18,0); crown(J,[[.18,.083,.1],[.25,.08,.096],[.28,.06,.075],[.29,0,0]],M(tStraw)); crown(J,[[.18,.086,.103],[.2,.086,.103]],M(null,{color:0x1a1a1c})); },
    prop:pRevPearl,gripHand:true,wFight:{p:[.036,-.089,.035],r:[Math.PI/2,0,0]},fight:AIM_ONE},
  conductor:{name:'Nadia Okoro',role:'Passenger · the conductor',where:'Hanami Tea Car',color:'#a8202a',note:'Twenty years on the old line and chosen to conduct the maiden run. She knows every service door and every shortcut between the cars.',
    o:Object.assign({jacket:.012,pants:.012},FEM),torso:tCondTorso,arm:tCondArm,leg:tCondLeg,foot:tShoeBlack,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,486,'#d4ad5a','twill'),{double:true}),.03,.006); bun(J,'#1a120e'); pillbox(J,M(null,{color:hexInt(CR)}),M(null,{color:0xd4ad5a})); for(const s of [1,-1]) mk(box(.1,.02,.06),mGold,J.spine,s*.17,.39,0); },fight:HANDS_UP,passenger:true},
  salary:{name:'Kenji Volkov',role:'Passenger · sales manager',where:'Standard Class, seat 14A',color:'#8a8e94',note:'On the train for a conference in Neo-Hanamura. He keeps asking the porters whether the train will still be on time.',
    o:{hf:.99,w:.96,depth:.98,belly:1.04,lg:.95,ag:.95,jacket:.01,pants:.01},torso:tSalTorso,arm:tSalArm,leg:tSalLeg,foot:tShoeBlack,
    extra:(J,o)=>collar(J,o,M(flat(64,16,466,'#f2f0ea','cotton'),{double:true}),.04,.006),fight:HANDS_UP,passenger:true},
  tourist:{name:'Dale Fontaine',role:'Passenger · first trip abroad',where:'Standard Class, seat 9D',color:'#e86a5a',note:'Bought the shirt at the station. Filmed the whole hijack on his camera, which several people now want very badly.',
    o:{hf:1.0,w:1.06,depth:1.08,belly:1.2,lg:1.04,ag:1.02,jacket:.006,pants:.012},torso:tTourTorso,arm:tTourArm,leg:tTourLeg,foot:tSandal,
    extra:(J,o)=>{ crown(J,[[.14,.13,.15],[.17,.09,.11],[.25,.085,.105],[.27,0,0]],M(flat(16,16,476,'#d8c8a0','cotton'))); },fight:HANDS_UP,passenger:true},
  grandma:{name:'Ines Haverkamp',role:'Passenger · retired',where:'Standard Class, seat 3A',color:'#9c8cc4',note:'Eighty-one, unimpressed, knitting. She rode the first steam train on this route as a girl and she is not getting off early.',
    o:Object.assign({jacket:.012,pants:.014,belly:1.05},FEM,{hf:.9}),torso:tGranTorso,arm:tGranArm,leg:tGranLeg,foot:tBrownShoe,
    extra:(J,o)=>{ collar(J,o,M(flat(64,16,496,'#f2ead8','cotton'),{double:true}),.03,.006); bun(J,'#e8e4de'); },fight:HANDS_UP,passenger:true}
};
const CAST_ORDER=['teo','porter','velvet','chef','sisterA','sisterB','boss','conductor','salary','tourist','grandma'];
function makeTrainChar(id,parent,grp){
  const R_=ROSTER[id], k=R_.key||id;
  const o=Object.assign(baseMats(k),R_.o,{torsoM:M(R_.torso),armM:M(R_.arm),legM:M(R_.leg),footM:M(R_.foot)});
  if(R_.hand) o.handM=M(R_.hand);
  const J=rig(o,parent); if(R_.extra) R_.extra(J,o);
  const s={kind:k,faces:FACE[k],grp,fight:R_.fight,showDrop:false};
  if(R_.prop){ Object.assign(s,{prop:R_.prop,gripHand:R_.gripHand,wFight:R_.wFight,twoHand:R_.twoHand,gun:R_.gun}); if(R_.two) s.fightHipsY=J.hips.p[1]-.055; }
  const Cc=finish(parent,J,o,s); Cc.id=id; return Cc; }

/* the line-up on the platform */
const CAST_X=CAST_ORDER.map((_,i)=>(i-(CAST_ORDER.length-1)/2)*1.32);
const castChars=CAST_ORDER.map((id,i)=>{ const slot=N(STATION,CAST_X[i],0,.55,0,0,0); return makeTrainChar(id,slot,'cast'); });
/* and in the wagons */
const wagonChars=[];
for(const key in WG){ const sp=WG[key].spots; for(const name in sp){ const s=sp[name], id=name==='salary'?'salary':name;
  if(!ROSTER[id]) continue; const slot=N(WG[key].g,s.x,s.y||0,s.z,0,s.ry,0); const Cc=makeTrainChar(id,slot,'w:'+key); applyPose(Cc,s.pose); Cc.basePose=s.pose; wagonChars.push(Cc); } }
