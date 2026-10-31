
/* =====================================================================================================
   THE TENANTS: the people who live in the tower and had nothing to do with it, and the men upstairs who dress
   exactly like them. Civilians play as corner boys internally and never fight; the plainclothes cartel men keep
   the pistol (or machete) out of sight until they draw it. Same rig and cast kit as the rest of Puerto Seco.
   Every name here is prefixed tn so nothing collides with the other casts in the same script.
   ===================================================================================================== */

/* ---------- body shapes: an old back rounds over (the shoulders sink, a hump behind) ---------- */
SHAPES.stoop={rx:{1.38:1.02},rz:{1.28:.97,1.38:1.12,1.45:1.16},cz:{1.28:-.01,1.38:-.024,1.45:-.03,1.5:-.016}};
SHAPES.oldf={rx:Object.assign({},SHAPES.fem.rx,{1.45:.86}),rz:Object.assign({},SHAPES.fem.rz,{1.38:1.12,1.45:1.14}),cz:Object.assign({},SHAPES.fem.cz,{1.38:-.016,1.45:-.026,1.5:-.014})};
/* a character who stands in his own idle (the old ones lean, the sick one holds his stomach): built normally, then the idle pose is changed */
function tnPosed(id,j){ return (parent,grp)=>{ const C=makeChar(id,parent,grp,{maker:null}); C.poses.idle={hipsY:C.poses.idle.hipsY,wpn:'hang',j:Object.assign({},C.poses.idle.j,j)}; applyPose(C,'idle'); return C; }; }

/* ---------- faces ---------- */
/* lines that come with age: bags, the fold from nose to mouth, crow's feet, a lined forehead. k scales it. */
function tnAgeI(I,k,o={}){ const {cx,E,BR,NO,MO,CH}=FP;
  for(const sx of [-1,1]){ const e=cx+sx*18;
    blob(I,e,E+8,8,2.6,-.16*k); softLine(I,e-6,E+6,e+6,E+7,'#000000',.15*k,1.2); softLine(I,e-4,E+10,e+5,E+11,'#000000',.08*k,1.1);
    softLine(I,cx+sx*10,NO-3,cx+sx*18,MO+7,'#000000',.24*k,1.7); softLine(I,cx+sx*18,MO+5,cx+sx*21,CH,'#000000',.16*k,1.8);
    for(const dy of [-3,1,5]) softLine(I,cx+sx*28,E+dy,cx+sx*36,E+dy*1.7,'#000000',.13*k,1);
    blob(I,cx+sx*26,E+24,9,8,-.1*k); if(o.jowl) blob(I,cx+sx*24,CH+2,9,5,-.14*k); }
  for(const yy of [BR-13,BR-19,BR-25]) softLine(I,cx-22,yy,cx+22,yy+1,'#000000',.11*k,1.1); }
/* thin white hair on top: the scalp shows through, streaky, never bald */
function tnThinTop(I,s,T){ const SK=F3(s.skin),HL=(s.hairFront??15)*2;
  for(let y=0;y<HL+3;y++) for(let x=0;x<256;x++){ const t=T(x); if(t>.36) continue; const n=.5+.5*fbm(x*.55,y*.16,s.seed+77); const a=.5*n*sst(.36,.12,t)*Math.min(1,(HL+3-y)/5)*sst(0,6,y); if(a>.02) put(I,x,y,SK,a); } }
/* tired eyes: a grey-violet shadow under each */
function tnTired(I,a,col='#4a3a48'){ const {cx,E}=FP; for(const sx of [-1,1]) blob(I,cx+sx*18,E+7,9,3,a,col); }
/* a woman's face over the shared head: lined lids and lashes, colour in the cheeks and lips, and a parting in the hair */
function tnFem(I,ex,s,o={}){ const {cx,E,MO}=FP; lidLine(I,ex,'#120806',o.lid??.85);
  if(ex!=='agony'&&ex!=='hurt'&&ex!=='sleep') for(const sx of [-1,1]) for(const i of [3,5,7]) softLine(I,cx+sx*(18+i),E-2.4+i*.12,cx+sx*(19+i*1.1),E-4.6,'#120806',.5,.8);
  for(const sx of [-1,1]){ blob(I,cx+sx*25,E+16,9,6,o.blush??.1,'#b8504a'); blob(I,cx+sx*24,E+10,8,3,.08); }
  blob(I,cx,MO+2.5,9,2.4,.2,mix(s.lip,'#000000',.15)); blob(I,cx,MO-1.5,8,1.6,.12,mix(s.lip,'#000000',.2));
  const HL=(s.hairFront??15)*2,px=cx+(o.part??12); for(let y=0;y<HL+1;y++) softEll(I,px+y*.08,y,1.1,.9,s.skin,.55*sst(0,4,y),.4); }
const TN_POST={
  abuelo:(I,ex,T)=>{ tnThinTop(I,HEADS.abuelo,T); tnAgeI(I,1.25,{jowl:true}); mustacheI(I,'#dedad2',3011,15,3); const {cx,E}=FP; blob(I,cx+30,E-14,3,2.4,.3,'#7a4a30'); blob(I,cx-36,E+20,2.4,2,.25,'#7a4a30'); },
  abuela:(I,ex,T)=>{ tnAgeI(I,1.2,{jowl:true}); tnFem(I,ex,HEADS.abuela,{lid:.4,blush:.06,part:0}); const {cx,E,MO}=FP; for(const sx of [-1,1]) for(const dx of [-6,-2,2,6]) softLine(I,cx+dx,MO-5,cx+dx*1.15,MO-9,'#000000',.08,1); blob(I,cx-26,E+18,2.4,2,.22,'#6a3e28'); for(const sx of [-1,1]) blob(I,cx+sx*26,E+17,9,6,.08,'#c05a4a'); },
  senora:(I,ex,T)=>{ tnAgeI(I,.4); tnTired(I,.1); tnFem(I,ex,HEADS.senora,{part:-14}); },
  enfermera:(I,ex,T)=>{ tnTired(I,.16); tnFem(I,ex,HEADS.enfermera,{part:10,blush:.08}); const {cx,E}=FP; softEll(I,cx-12,E+22,1,1,'#4a2a1a',.7,.5); },
  obrero:(I,ex,T)=>{ tnAgeI(I,.7); tnTired(I,.18); stubbleI(I,T,'#1a1210',.32,3051); mustacheI(I,'#120c0a',3052,16,5); const {cx,E}=FP; for(const sx of [-1,1]) blob(I,cx+sx*43,62,4,8,.38,'#7a7672'); },
  estudiante:(I,ex,T)=>{ stubbleI(I,T,'#2a1c14',.1,3061); const {cx,MO}=FP; for(let x=-10;x<=10;x++) softEll(I,cx+x,MO-6,.8,.8,'#3a2a20',.18,.5); },
  enfermo:(I,ex,T)=>{ tnAgeI(I,.75); tnTired(I,.34,'#3e3440'); stubbleI(I,T,'#5a5652',.62,3071); const {cx,E,MO}=FP; for(const sx of [-1,1]) blob(I,cx+sx*26,E+22,10,9,-.12); blob(I,cx,MO+1,10,3,.25,'#b8a8a0'); blob(I,cx,40,30,10,.08,'#e8e4c8'); },
  vecino1:(I,ex,T)=>{ const {cx,E,BR}=FP; softLine(I,cx+16,BR-2,cx+20,E+16,'#d8a080',.35,1.1); },
  vecino2:(I,ex,T)=>{ tnAgeI(I,.4); mustacheI(I,'#2a1e16',3091,17,6); },
  vecino3:(I,ex,T)=>{ tnAgeI(I,.35); },
  vecino4:(I,ex,T)=>{ lidLine(I,ex,'#0a0606',.4); }
};
Object.assign(HEADS,{
  abuelo:{seed:3001,skin:'#b88a6a',skinD:'#8a6048',hair:'slick',hairC:'#dcd8d0',hairFront:14,sideburn:36,behind:46,nape:50,brow:'#cfcac2',browT:2,iris:'#3a2a1a',lip:'#94605a',age:true,glasses:'#5a4a3a',white:'#d8d0c0',post:TN_POST.abuelo},
  abuela:{seed:3002,skin:'#a87454',skinD:'#7a4e36',hair:'slick',hairC:'#a8a49e',hairFront:13,sideburn:40,behind:50,nape:54,brow:'#7a7670',iris:'#2a1a10',lip:'#8a5248',age:true,white:'#d8d0c0',post:TN_POST.abuela},
  senora:{seed:3003,skin:'#c48e6a',skinD:'#94644a',hair:'slick',hairC:'#22160f',hairFront:13,sideburn:33,behind:50,nape:54,brow:'#22160f',iris:'#2a1a10',lip:'#a0605a',post:TN_POST.senora},
  enfermera:{seed:3004,skin:'#b07a58',skinD:'#7e5238',hair:'slick',hairC:'#2a1a12',hairFront:13,sideburn:34,behind:50,nape:54,brow:'#1e120c',iris:'#2a1a10',lip:'#9a5a52',post:TN_POST.enfermera},
  obrero:{seed:3005,skin:'#9e6a48',skinD:'#704630',hair:'slick',hairC:'#16100c',hairFront:13,sideburn:38,shadow:true,brow:'#16100c',browT:2,iris:'#2a1a10',lip:'#7a4232',post:TN_POST.obrero},
  estudiante:{seed:3006,skin:'#d2a07a',skinD:'#a2725a',hair:'slick',hairC:'#1a120c',hairFront:12,sideburn:32,brow:'#1a120c',iris:'#3a2414',lip:'#b0705e',acne:true,glasses:'#141416',white:'#e6e0d4',post:TN_POST.estudiante},
  enfermo:{seed:3007,skin:'#c4a28a',skinD:'#94786a',hair:'slick',hairC:'#4a4440',hairFront:13,sideburn:38,brow:'#3e3834',iris:'#3a2e24',lip:'#9a7a72',white:'#d8d2c0',post:TN_POST.enfermo},
  vecino1:{seed:3008,skin:'#8e5c3e',skinD:'#603a26',hair:'buzz',hairC:'#100c0a',hairFront:15,brow:'#100c0a',browT:2,iris:'#1a0e08',lip:'#6a3a2a',beard:'goatee',beardC:'#100c0a',post:TN_POST.vecino1},
  vecino2:{seed:3009,skin:'#d4a684',skinD:'#a47a5e',hair:'slick',hairC:'#2a1e16',hairFront:13,sideburn:36,shadow:true,brow:'#2a1e16',browT:2,iris:'#3a2a1a',lip:'#a0645a',post:TN_POST.vecino2},
  vecino3:{seed:3010,skin:'#7a4a30',skinD:'#522e1c',hair:'slick',hairC:'#0e0a08',hairFront:13,sideburn:40,brow:'#0e0a08',browT:2,iris:'#1a0e08',lip:'#5a2e22',beard:'full',beardC:'#0e0a08',post:TN_POST.vecino3},
  vecino4:{seed:3012,skin:'#bc8460',skinD:'#8c5a40',hair:'buzz',hairC:'#1a120c',hairFront:14,brow:'#1a120c',iris:'#2a1a10',lip:'#94564a',beard:'goatee',beardC:'#1a120c',post:TN_POST.vecino4}
});

/* ---------- painted helpers ---------- */
/* a small all-over floral: five dots round a centre, staggered rows */
function tnFloral(I,x0,y0,w,h,seed,petal,mid,step=9){ const r=rng(seed); for(let y=y0;y<y0+h;y+=step) for(let x=x0+((y/step|0)%2)*step/2;x<x0+w;x+=step){ const cx=x+(r()-.5)*3,cy=y+(r()-.5)*3,c=petal[(r()*petal.length)|0];
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+r(); softEll(I,cx+Math.cos(a)*1.7,cy+Math.sin(a)*1.7,1.25,1.25,c,.9,.4); } softEll(I,cx,cy,.9,.9,mid,.95,.4); softLine(I,cx+2,cy+2,cx+4,cy+3.5,'#3a6a3a',.55,.7); } }
const tnGing=(x,y,a,b,c,p=4)=>{ const u=(x/p|0)%2,v=(y/p|0)%2; return u&&v?c:u||v?b:a; };
/* knit rib band (cuffs, hems, a cardigan's front edge) */
function tnRibH(I,x0,y0,w,h,col){ softRect(I,x0,y0,w,h,col,.95,.6); for(let x=x0;x<x0+w;x+=2) softLine(I,x,y0,x,y0+h,'#000000',.12,.6); }
function tnRibV(I,x0,y0,y1,w,col){ softRect(I,x0-w/2,y0,w,y1-y0,col,.95,.6); for(let y=y0;y<y1;y+=2) softLine(I,x0-w/2,y,x0+w/2,y,'#000000',.1,.6); }
/* a lanyard and a blank hospital ID (photo square, colour bar, no text) */
function tnBadge(I,x,y){ for(const s of [-1,1]) softLine(I,64+s*13,T3.neck+3,x+s*2,y,'#1e3a6a',.95,1.3); softRect(I,x-5,y,10,13,'#ece8e0',1,.5); softRect(I,x-5,y,10,3,'#2a5a9a',1,.4); softRect(I,x-3,y+5,4,5,'#8a7a6a',.9,.4); softLine(I,x+2,y+6,x+4,y+6,'#6a6a6a',.6,.6); softLine(I,x+2,y+8.5,x+4,y+8.5,'#6a6a6a',.6,.6); }
/* gold cross on a fine chain, lying on the chest */
function tnCross(I,col,cy){ const C=col; for(const s of [-1,1]) for(let t=0;t<=1;t+=.04){ const x=64+s*(15-15*t*t*.95),y=T3.neck+2+(cy-T3.neck-4)*Math.sin(t*Math.PI/2); softEll(I,x,y,.75,.75,C,.95,.4); }
  softRect(I,62.2,cy-1,3.6,15,C,1,.5); softRect(I,58.5,cy+2.6,11,3.4,C,1,.5); softLine(I,63.2,cy,63.2,cy+13,'#fff4c8',.7,.7); softLine(I,59.5,cy+3.4,68,cy+3.4,'#fff4c8',.6,.7); softLine(I,66.4,cy,66.4,cy+14,'#5a3a10',.45,.7); softEll(I,64,cy-2,1.4,1.4,C,1,.4); }
/* a short-sleeve hem on an arm: the sleeve's edge, then skin with the sleeve's shadow on it */
const tnHem=(I,y,col)=>{ softRect(I,0,y-5,64,5,col,.9,1); softLine(I,0,y,64,y,'#000000',.2,1); blob(I,32,y+4,30,3,-.18); };

/* ---------- civilians ---------- */
/* Don Rafa: olive-brown cardigan buttoned low over a ribbed white undershirt, grey-brown slacks, corduroy slippers */
const TN_CARD='#7a6644', TN_CARD_D='#5e4c30', TN_SLACK='#5a544c';
const tnAbueloTorso=torsoP('abuelo',3101,(x,y)=>{ const dx=Math.abs(x-64),vw=y<T3.chest+16?17*(1-(y-T3.neck)/(T3.chest+16-T3.neck)):0;
  if(y>224) return [TN_SLACK,'wool',.6]; if(dx<vw) return crewNeck(x,y,11,9)?sk('abuelo'):['#d2ccbe','knit',.5]; return [TN_CARD,'knit',.8]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ const pts=[]; for(let y=T3.neck;y<=T3.chest+16;y+=2){ const vw=17*(1-(y-T3.neck)/(T3.chest+16-T3.neck)); softRect(I,64+s*(vw+1.5)-2,y,4,2.4,TN_CARD_D,.9,.4); } }
  tnRibV(I,64,T3.chest+16,224,5,TN_CARD_D); buttons(I,[64],T3.chest+24,218,17,'#d8c8a0'); tnRibH(I,0,215,128,9,TN_CARD_D);
  for(const s of [-1,1]){ softRect(I,64+s*26-10,T3.nav-12,20,22,TN_CARD_D,.55,1); softLine(I,64+s*26-10,T3.nav-12,64+s*26+10,T3.nav-12,'#000000',.25,1); blob(I,64+s*26,T3.nav+4,8,6,-.12); }
  blob(I,64,T3.belt-4,40,10,.08,'#a89670'); softRect(I,0,224,128,3,'#000000',.2,1); blob(I,40,T3.chest-6,6,5,.08,'#000000'); }});
const tnAbueloArm=armP(3103,()=>[TN_CARD,'knit',.8],{decor:I=>{ blob(I,32,76,14,8,.14,'#a08e66'); blob(I,0,76,10,8,.1,'#a08e66'); tnRibH(I,0,113,64,15,TN_CARD_D); softRect(I,0,111,64,2,'#000000',.15,1); }});
const tnAbueloLeg=legP(3105,()=>[TN_SLACK,'wool'],{decor:I=>{ softLine(I,32,0,32,128,'#7a746a',.45,1.2); seam(I,48,0,48,128); seam(I,16,0,16,128); blob(I,32,70,10,6,.1); softRect(I,0,120,64,8,'#4a453e',.5,2); }});
const tnSlipBrown=garment(64,32,3107,(x,y)=>[y<24?'#6a4a30':'#2a1e16','wool',.3],{folds:2,grime:.08,decor:I=>{ for(let x=2;x<64;x+=3) softLine(I,x,2,x,22,'#000000',.12,.7); softRect(I,0,22,64,3,'#c8b89a',.7,.6); }});

/* Doña Chela: cornflower housedress with little flowers, a red gingham apron, a maroon cardigan, beige stockings, slippers */
const TN_DRESS='#6a80aa', TN_CHELA='#5e2a32';
const tnDressZ=(x,y)=>[TN_DRESS,'cotton',.5];
const tnAbuelaTorso=torsoP('abuela',3111,(x,y)=>{ const dx=Math.abs(x-64); if(dx<19){ if(crewNeck(x,y,13,10)) return sk('abuela'); if(y>T3.nav+8&&dx<30) return [tnGing(x,y,'#ece4d8','#d88a7e','#b8483e',3),'cotton',.4]; return tnDressZ(x,y); }
  if(y>226) return tnDressZ(x,y); return [TN_CHELA,'knit',.8]; },{decor:I=>{ neckShadow(I);
  tnFloral(I,45,T3.neck+8,38,T3.nav-T3.neck,3112,['#f2ece0','#e8a8b8','#f0d878'],'#d89a3a',10);
  softRect(I,46,T3.neck+1,36,4,mix(TN_DRESS,'#000000',.25),.6,1); for(const s of [-1,1]) tnRibV(I,64+s*20,T3.neck+2,226,4,mix(TN_CHELA,'#000000',.2)); tnRibH(I,0,220,128,6,mix(TN_CHELA,'#000000',.2));
  softRect(I,45,T3.nav+7,38,3,'#b8483e',.9,.5); for(const s of [-1,1]) softLine(I,64+s*19,T3.nav+8,64+s*36,T3.nav+8,'#d8d0c4',.95,1.6);
  for(const s of [-1,1]) blob(I,64+s*30,T3.chest+8,8,10,.1,'#000000'); blob(I,64,T3.chest-8,22,12,.1); }});
const tnAbuelaArm=armP(3113,()=>[TN_CHELA,'knit',.8],{decor:I=>{ tnRibH(I,0,106,64,10,mix(TN_CHELA,'#000000',.2)); softRect(I,0,116,64,12,HEADS.abuela.skin,1,.6); blob(I,32,118,30,3,-.2); blob(I,32,76,14,8,.1,'#8a4a54'); }});
const tnStockLeg=legP(3115,()=>['#b48a6a','skin',.2],{decor:I=>{ blob(I,32,70,8,5,.12); softLine(I,32,0,32,128,'#000000',.05,4); blob(I,32,100,10,14,.06,'#ffffff'); }});
const tnAbuelaSkirt=garment(128,64,3116,(x,y)=>Math.abs(x-64)<17?[tnGing(x,y,'#ece4d8','#d88a7e','#b8483e',3),'cotton',.4]:[TN_DRESS,'cotton',.6],{folds:8,dir:'v',grime:.05,decor:I=>{
  tnFloral(I,0,3,46,60,3117,['#f2ece0','#e8a8b8','#f0d878'],'#d89a3a',10); tnFloral(I,82,3,46,60,3118,['#f2ece0','#e8a8b8','#f0d878'],'#d89a3a',10);
  for(const s of [-1,1]) softLine(I,64+s*17,0,64+s*17,54,'#ece4d8',.9,1.4); softRect(I,47,51,34,6,'#ece4d8',.9,.8); for(let x=48;x<81;x+=3) softLine(I,x,51,x+1,57,'#c8bcb0',.6,.6);
  softRect(I,50,18,14,12,'#b8483e',.3,.8); softLine(I,50,18,64,18,'#ece4d8',.8,1); softRect(I,0,60,128,4,mix(TN_DRESS,'#000000',.3),.8,.8); }});
const tnSlipMaroon=garment(64,32,3119,(x,y)=>[y<24?'#4a2a3a':'#1e1416','wool',.3],{folds:2,grime:.06,decor:I=>{ softRect(I,0,0,64,6,'#6a3a4e',.8,1); softEll(I,32,12,5,4,'#c8a8b0',.5,.6); }});

/* Marisol: a dusty-rose housecoat with a wide collar, tied at the waist, over a pale nightgown; bare shins, grey slippers */
const TN_ROBE='#a87882', TN_ROBE_L='#c8a0a6', TN_GOWN='#c4b2cc';
const tnSenoraTorso=torsoP('senora',3121,(x,y)=>{ const dx=Math.abs(x-64),vw=y<T3.belt?19*(1-(y-T3.neck)/(T3.belt-T3.neck))+1:0;
  if(dx<vw){ if(vNeck(x,y,12,22)) return sk('senora'); return [TN_GOWN,'cotton',.4]; } return [TN_ROBE,'wool',.9]; },{decor:I=>{ neckShadow(I);
  for(let x=52;x<=76;x+=3){ const y=T3.neck+22+Math.abs(x-64)*-.7+6; softEll(I,x,y,1.4,1.2,'#f6f2f8',.85,.4); }
  for(const s of [-1,1]) for(let y=T3.neck;y<T3.belt+6;y+=1.5){ const vw=19*(1-(y-T3.neck)/(T3.belt-T3.neck))+1; softRect(I,64+s*(vw+4)-4,y,8,2,TN_ROBE_L,.9,.5); softEll(I,64+s*(vw+.5),y,.8,1,'#000000',.2,.4); }
  softRect(I,0,T3.belt-5,128,8,mix(TN_ROBE,'#000000',.18),.95,.8); softLine(I,0,T3.belt-5,128,T3.belt-5,TN_ROBE_L,.4,1);
  softEll(I,84,T3.belt-1,6,5,mix(TN_ROBE,'#000000',.22),.95,.5); for(const d of [-3,3]) softLine(I,84+d,T3.belt+2,86+d*2.2,T3.belt+36,mix(TN_ROBE,'#000000',.2),.95,2.6);
  for(const s of [-1,1]) softRect(I,64+s*34-9,T3.belt+14,18,18,mix(TN_ROBE,'#000000',.1),.6,1); }});
const tnSenoraArm=armP(3123,(x,y)=>y>118?sk('senora'):[TN_ROBE,'wool',.9],{decor:I=>{ softRect(I,0,104,64,12,TN_ROBE_L,.9,.8); softLine(I,0,104,64,104,'#000000',.15,1); blob(I,32,120,30,2,-.22); }});
const tnSenoraLeg=legP(3125,(x,y)=>y<84?[TN_GOWN,'cotton',.4]:sk('senora'),{decor:I=>{ softRect(I,0,82,64,3,'#f2eef4',.85,.6); blob(I,32,88,30,3,-.15); blob(I,32,110,8,10,.06,'#ffffff'); }});
const tnRobeSkirt=garment(64,32,3126,(x,y)=>[TN_ROBE,'wool',.9],{folds:6,dir:'v',grime:.04,decor:I=>{ softRect(I,27,0,8,32,TN_ROBE_L,.9,.6); softLine(I,27,0,27,32,'#000000',.3,1); softRect(I,0,28,64,4,TN_ROBE_L,.8,.8);
  softLine(I,40,0,42,24,mix(TN_ROBE,'#000000',.2),.95,2.4); }});
const tnSlipGrey=garment(64,32,3127,(x,y)=>[y<24?'#8a8a94':'#2a2a2e','wool',.3],{folds:2,grime:.05,decor:I=>{ softRect(I,0,0,64,7,'#aaaab4',.8,1.4); }});

/* Yesenia: teal scrubs (V-neck, a pen in the chest pocket, ID on a lanyard), a charcoal cardigan, grey sneakers */
const TN_SCRUB='#2f8a88', TN_SCRUB_D='#226a68', TN_YCARD='#3a3e4a';
const tnEnfTorso=torsoP('enfermera',3131,(x,y)=>{ const dx=Math.abs(x-64); if(y>T3.belt+2&&(dx<22||y>226)) return [TN_SCRUB,'cotton',.6]; if(dx<22){ if(vNeck(x,y,11,26)) return sk('enfermera'); return [TN_SCRUB,'cotton',.6]; }
  return [TN_YCARD,'knit',.8]; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64-s*11,T3.neck,64,T3.neck+26,TN_SCRUB_D,.9,1.6);
  softRect(I,70,T3.chest-6,12,13,TN_SCRUB_D,.6,.8); softLine(I,70,T3.chest-6,82,T3.chest-6,'#000000',.25,1); softRect(I,73,T3.chest-11,1.6,9,'#1a1a2a',1,.4); softRect(I,77,T3.chest-10,1.6,8,'#d8d4cc',1,.4);
  tnBadge(I,54,T3.chest+2); softRect(I,44,T3.belt-2,40,4,TN_SCRUB_D,.8,.8); softLine(I,64,T3.belt+1,61,T3.belt+18,'#e8e4dc',.8,1); softLine(I,64,T3.belt+1,67,T3.belt+16,'#e8e4dc',.8,1);
  for(const s of [-1,1]) tnRibV(I,64+s*23,T3.neck+4,226,4,mix(TN_YCARD,'#000000',.25)); tnRibH(I,0,220,128,6,mix(TN_YCARD,'#000000',.25)); for(const s of [-1,1]) blob(I,64+s*36,T3.nav,10,14,.08,'#000000'); }});
const tnEnfArm=armP(3133,(x,y)=>y>98?sk('enfermera'):[TN_YCARD,'knit',.8],{decor:I=>{ tnRibH(I,0,88,64,10,mix(TN_YCARD,'#000000',.25)); blob(I,32,100,30,3,-.2); blob(I,32,64,14,10,.1,'#5a5e6a'); softRect(I,18,118,12,4,'#2a2a2e',.9,.5); }});
const tnEnfLeg=legP(3135,()=>[TN_SCRUB,'cotton',.7],{decor:I=>{ seam(I,48,0,48,128); seam(I,16,0,16,128); blob(I,32,70,10,6,.1); softRect(I,0,118,64,10,TN_SCRUB_D,.6,1.4); }});
const tnSneakGrey=garment(64,32,3137,(x,y)=>[y<22?'#c8c8c4':'#e8e6e0','leather',.2],{folds:2,grime:.1,decor:I=>{ softRect(I,0,23,64,9,'#e8e6e0',1,1); softLine(I,16,9,48,15,'#5a8a8a',.8,1.6); for(const y of [5,8,11]) softLine(I,27,y,37,y,'#f4f4f0',.8,.8); }});

/* Toño: a grey-blue maquila work shirt with a small oval patch, jeans, work boots */
const TN_WORK='#7c90a6';
const tnObreroTorso=torsoP('obrero',3141,(x,y)=>{ if(vNeck(x,y,8,16)) return sk('obrero'); return y>T3.belt+2?['#2e3a52','denim',.6]:[TN_WORK,'cotton',.7]; },{decor:I=>{ neckShadow(I);
  softRect(I,46,T3.neck,36,6,mix(TN_WORK,'#000000',.18),.9,1); for(const s of [-1,1]) softLine(I,64+s*8,T3.neck+2,64+s*14,T3.neck+12,mix(TN_WORK,'#000000',.3),.9,1.4);
  softRect(I,61,T3.neck+16,6,T3.belt-T3.neck-18,mix(TN_WORK,'#000000',.08),.8,.6); buttons(I,[64],T3.neck+22,T3.belt-4,16,'#e0e4e8');
  for(const x of [42,86]){ softRect(I,x-9,T3.chest-14,18,16,mix(TN_WORK,'#000000',.06),.8,.8); softRect(I,x-9,T3.chest-14,18,4,mix(TN_WORK,'#000000',.15),.9,.6); }
  softEll(I,86,T3.chest-24,8,5,'#e8e4dc',1,.4); softEll(I,86,T3.chest-24,6.4,3.6,'#2a4a8a',1,.4); softRect(I,82,T3.chest-25.5,8,2.4,'#c8302a',.95,.4);
  blob(I,64,T3.chest+28,24,14,-.1); blob(I,30,T3.sh+36,6,10,.12,'#4a5a6a'); beltI(I,'#2a1a10','#a8a49c'); seam(I,64,T3.belt+5,64,T3.belt+40,'#a8834a'); }});
const tnObreroArm=armP(3143,(x,y)=>y<46?[TN_WORK,'cotton',.7]:sk('obrero'),{decor:I=>{ tnHem(I,46,mix(TN_WORK,'#000000',.12)); const r=rng(3144); for(let i=0;i<70;i++){ const x=r()*64,y=56+r()*64; softLine(I,x,y,x+.6,y+1.4,'#2a1a10',.25,.7); } }});
const tnJeansWorn=legP(3145,()=>['#2e3a52','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,70,10,8,.16,'#7a8aaa'); blob(I,32,40,9,18,.1,'#6a7a9a'); softRect(I,0,118,64,10,'#4a3a2a',.25,3); }});

/* Junior: a green-and-white football shirt (no club, no badge, no number), light jeans, black-and-white sneakers */
const TN_GRN='#1e7a42', TN_GRN_D='#145a30';
const tnEstTorso=torsoP('estudiante',3151,(x,y)=>{ if(crewNeck(x,y,11,9)) return sk('estudiante'); if(y>226) return ['#4a5e80','denim',.6];
  const side=Math.abs(Math.abs(x-64)-32)<6; return side?['#ecebe6','poly',.5,1.04]:[TN_GRN,'poly',.5,1.06]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]) softLine(I,64+s*12,T3.neck+1,64,T3.neck+18,'#ecebe6',.95,2.2); softRect(I,0,T3.neck,128,3,'#ecebe6',.9,.8);
  for(let x=0;x<128;x+=8) softLine(I,x,T3.neck+20,x,224,mix(TN_GRN,'#ffffff',.12),.35,.8);
  softRect(I,78,T3.chest-20,10,12,TN_GRN_D,.9,.4); softRect(I,79,T3.chest-19,8,4,'#ecebe6',.85,.4); softEll(I,83,T3.chest-9,5,3,TN_GRN_D,.9,.4);
  softRect(I,0,220,128,6,'#ecebe6',.9,.8); blob(I,64,T3.nav,30,24,.08,'#ffffff'); softRect(I,0,226,128,3,'#000000',.25,1); }});
const tnEstArm=armP(3153,(x,y)=>y<42?['#ecebe6','poly',.5,1.04]:sk('estudiante'),{decor:I=>{ softRect(I,0,36,64,6,TN_GRN,.95,.6); blob(I,32,46,30,3,-.18); softRect(I,0,0,64,6,TN_GRN,.5,2); }});
const tnEstLeg=legP(3155,()=>['#4a5e80','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,40,9,18,.14,'#8a9ab8'); blob(I,32,72,9,6,.12,'#8a9ab8'); softRect(I,0,120,64,8,'#3a4a6a',.6,1); }});
const tnSneakBW=garment(64,32,3157,(x,y)=>[y<22?'#1c1c20':'#ecebe6','leather',.2],{folds:2,grime:.08,decor:I=>{ softRect(I,0,23,64,9,'#ecebe6',1,1); softLine(I,18,8,46,15,'#ecebe6',.9,1.4); }});

/* Don Lalo: striped pale-blue pyjamas, a brown plaid robe hanging open with the belt loose, felt slippers */
const tnPJ=(x,y)=>[(x%7<2)?'#4e5e7e':'#aab6c6','cotton',.5];
const tnPlaidF=(x,y)=>{ const u=(x+2)%10,v=y%10; return (u<2&&v<2)?'#8a6a3a':(u<2||v<2)?'#4a281a':(u===5||v===5)?'#7a5030':'#64382a'; };
const tnRobeP=(x,y)=>[tnPlaidF(x,y),'wool',.8];
const tnEnfermoTorso=torsoP('enfermo',3171,(x,y)=>{ const dx=Math.abs(x-64); if(dx<22){ if(vNeck(x,y,10,22)) return sk('enfermo'); return tnPJ(x,y); } return tnRobeP(x,y); },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ softLine(I,64+s*10,T3.neck,64+s*3,T3.neck+24,'#3e4e6e',.7,1.2); softLine(I,64+s*22,T3.neck+2,64+s*22,256,'#2e1a10',.7,2); softRect(I,64+s*25-3,T3.neck,6,256-T3.neck,'#5a3020',.55,.8); }
  softRect(I,61,T3.neck+22,5,T3.belt-T3.neck-20,'#aab6c6',.7,.5); buttons(I,[63],T3.neck+28,T3.belt,16,'#e8e4dc');
  for(const s of [-1,1]){ softRect(I,64+s*44-3,T3.belt-6,6,8,'#4e2a1c',.9,.6); softLine(I,64+s*44,T3.belt-2,64+s*46,T3.belt+44,'#5e3a26',.95,2.4); }
  stain(I,58,T3.nav-20,4,'#8a8a6a',3172); }});
const tnEnfermoArm=armP(3173,(x,y)=>y>118?sk('enfermo'):tnRobeP(x,y),{decor:I=>{ softRect(I,0,108,64,7,'#4e2a1c',.85,.8); softRect(I,0,115,64,4,'#aab6c6',.9,.5); blob(I,32,121,30,2,-.2); }});
const tnEnfermoLeg=legP(3175,(x,y)=>[(x%7<2)?'#4e5e7e':'#aab6c6','cotton',.5],{decor:I=>{ blob(I,32,70,10,6,.12); softRect(I,0,122,64,6,'#000000',.12,2); }});
const tnRobeOpen=garment(64,32,3176,(x,y)=>Math.abs(x-32)<6?[(x%4<1)?'#4e5e7e':'#aab6c6','cotton',.4,.7]:[tnPlaidF(x*2,y*3),'wool',.8],{folds:5,dir:'v',grime:.06,decor:I=>{
  for(const s of [-1,1]){ softLine(I,32+s*6,0,32+s*6,32,'#2e1a10',.7,1.6); softRect(I,32+s*8-2,0,4,32,'#5a3020',.5,.6); } softRect(I,0,30,64,2,'#3e2214',.7,.6); blob(I,32,16,4,20,-.3); }});
const tnSlipFelt=garment(64,32,3177,(x,y)=>[y<24?'#4a3a30':'#1e1814','wool',.3],{folds:2,grime:.12,decor:I=>{ blob(I,32,8,14,5,-.1); }});

/* ---------- the men who look like tenants ---------- */
/* vecino 1: white ribbed undershirt, gold cross, dark slacks, black shoes */
const tnTankZ=(x,y)=>{ const dx=Math.abs(x-64),bx=Math.min(x,128-x),sd=Math.min(Math.abs(x-32),Math.abs(x-96));
  if(y<T3.neck+30&&dx<13*Math.sqrt(Math.max(0,1-((y-T3.neck)/30)**2))) return true;
  if(y<T3.neck+14&&bx<12*Math.sqrt(Math.max(0,1-((y-T3.neck)/14)**2))) return true;
  if(y<T3.sh+36&&sd<15*Math.sqrt(Math.max(0,1-((y-T3.neck)/(T3.sh+36-T3.neck))**2))+(y<T3.sh?6:0)) return true; return false; };
const tnV1Neck=(x,y)=>{ const dx=Math.abs(x-64); return y<T3.neck+9&&dx<11*Math.sqrt(Math.max(0,1-((y-T3.neck)/9)**2)); };
const tnV1Torso=torsoP('vecino1',3181,(x,y)=>{ if(y>T3.belt+2) return ['#26262a','wool',.6]; if(tnV1Neck(x,y)) return sk('vecino1'); return ['#e8e4da','cotton',.7]; },{decor:I=>{ neckShadow(I);
  for(let x=40;x<88;x++){ const dx=Math.abs(x+.5-64); if(dx<12){ const y=T3.neck+9*Math.sqrt(Math.max(0,1-(dx/11)**2)); softEll(I,x+.5,y+.5,1,1.2,'#cfc9bc',.8,.4); } }
  tnCross(I,'#e0b84a',T3.neck+31); stain(I,60,T3.nav-4,4,'#c8b890',3182); beltI(I,'#141416','#a8a8ac'); seam(I,64,T3.belt+5,64,T3.belt+40); blob(I,64,T3.chest+10,30,20,.06,'#ffffff'); }});
const tnV1Arm=armP(3183,(x,y)=>y<38?['#e8e4da','cotton',.7]:sk('vecino1'),{decor:I=>{ softRect(I,0,35,64,3,'#cfc9bc',.9,.6); blob(I,32,40,30,3,-.12); const r=rng(3184); for(let i=0;i<9;i++) softEll(I,22+i*2.4,92+Math.sin(i*.8)*2,1,1,'#3a4a5a',.55,.5); softRect(I,41.3,89,1.6,9,'#3a4a5a',.6,.4); softRect(I,39,91.5,6,1.6,'#3a4a5a',.6,.4); }});
const tnV1Leg=legP(3185,()=>['#26262a','wool'],{decor:I=>{ softLine(I,32,0,32,128,'#3a3a40',.6,1); seam(I,48,0,48,128); }});

/* vecino 2: a faded red polo, jeans, a navy cap, worn sneakers */
const TN_POLO='#a86a62';
const tnV2Torso=torsoP('vecino2',3191,(x,y)=>{ if(vNeck(x,y,7,18)) return sk('vecino2'); return y>T3.belt+2?['#3a4a68','denim',.6]:[TN_POLO,'knit',.6]; },{decor:I=>{ neckShadow(I);
  softRect(I,44,T3.neck,40,7,mix(TN_POLO,'#000000',.12),.95,1); for(const s of [-1,1]) softLine(I,64+s*7,T3.neck+6,64+s*16,T3.neck+12,mix(TN_POLO,'#000000',.3),.9,1.6);
  softRect(I,60,T3.neck+8,8,24,mix(TN_POLO,'#000000',.08),.8,.6); buttons(I,[64],T3.neck+14,T3.neck+32,9,'#e8dcd4');
  blob(I,64,T3.chest-10,30,20,.14,'#d8b0a8'); blob(I,40,T3.chest+20,20,30,.1,'#d8b0a8'); stain(I,76,T3.nav-8,4,'#7a5a4a',3192); beltI(I,'#2a1a10','#a8a49c'); seam(I,64,T3.belt+5,64,T3.belt+40,'#a8834a'); }});
const tnV2Arm=armP(3193,(x,y)=>y<42?[TN_POLO,'knit',.6]:sk('vecino2'),{decor:I=>{ tnHem(I,42,mix(TN_POLO,'#000000',.14)); blob(I,32,20,24,12,.1,'#d8b0a8'); }});
const tnV2Leg=legP(3195,()=>['#3a4a68','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,66,10,8,.14,'#7a8aaa'); softRect(I,0,116,64,12,'#2a3448',.6,2); }});
const tnSneakDirty=garment(64,32,3197,(x,y)=>[y<22?'#8a8478':'#c8c0b0','canvas',.2],{folds:2,grime:.25,decor:I=>{ softRect(I,0,23,64,9,'#c8c0b0',1,1); softLine(I,20,9,44,14,'#5a564e',.8,1.4); }});

/* vecino 3: an olive work shirt open at the neck with the sleeves rolled, navy work trousers, boots */
const TN_OLV='#6e6a4a';
const tnV3Torso=torsoP('vecino3',3201,(x,y)=>{ if(vNeck(x,y,12,24)) return crewNeck(x,y,10,8)?sk('vecino3'):['#d8d2c4','cotton',.5]; return y>T3.belt+2?['#2a3040','twill',.6]:[TN_OLV,'twill',.8]; },{decor:I=>{ neckShadow(I);
  for(const s of [-1,1]){ softLine(I,64+s*12,T3.neck,64+s*3,T3.neck+26,mix(TN_OLV,'#000000',.35),.9,1.6); softLine(I,64+s*12,T3.neck,64+s*22,T3.neck+12,mix(TN_OLV,'#000000',.25),.8,1.4); }
  buttons(I,[64],T3.neck+34,T3.belt-4,17,'#3a3624'); softLine(I,64,T3.neck+26,64,T3.belt,mix(TN_OLV,'#000000',.2),.6,1);
  for(const x of [42,86]){ softRect(I,x-9,T3.chest-12,18,15,mix(TN_OLV,'#000000',.06),.8,.8); softRect(I,x-9,T3.chest-12,18,5,mix(TN_OLV,'#000000',.18),.9,.6); }
  for(const x of [32,96]) blob(I,x,T3.sh+40,8,12,.14,'#3a3826'); blob(I,64,T3.chest+30,22,18,-.1); beltI(I,'#1a120c','#6a6a6a'); stain(I,70,T3.nav+4,5,'#4a3a2a',3202); }});
const tnV3Arm=armP(3203,(x,y)=>y<50?[TN_OLV,'twill',.8]:y<62?[mix(TN_OLV,'#ffffff',.08),'twill',.4]:sk('vecino3'),{decor:I=>{ softLine(I,0,50,64,50,'#000000',.25,1.2); softLine(I,0,56,64,57,'#000000',.15,1); softLine(I,0,62,64,62,'#000000',.25,1.2); blob(I,32,66,30,3,-.2);
  const r=rng(3204); for(let i=0;i<80;i++){ const x=r()*64,y=66+r()*56; softLine(I,x,y,x+.6,y+1.4,'#1a0e08',.28,.7); } softLine(I,8,96,22,104,'#c8a080',.3,1); }});
const tnV3Leg=legP(3205,()=>['#2a3040','twill'],{decor:I=>{ for(const x of [4,42]){ softRect(I,x,30,17,22,'#232838',.7,1); softRect(I,x,30,17,5,'#343a4c',.9,.6); } seam(I,48,0,48,128); seam(I,16,0,16,128); blob(I,32,70,10,6,.1); softRect(I,0,108,64,20,'#4a3a2a',.2,4); }});

/* vecino 4: a cheap burgundy tracksuit top half unzipped over a grey T-shirt, dark jeans, white sneakers */
const TN_TRK='#6a1e2a';
const tnV4Torso=torsoP('vecino4',3211,(x,y)=>{ const dx=Math.abs(x-64),zw=y<T3.chest+20?12*(1-(y-T3.neck)/(T3.chest+20-T3.neck))+1:0; if(y>T3.belt+2&&y>214) return ['#1e2230','denim',.6];
  if(dx<zw) return crewNeck(x,y,10,8)?sk('vecino4'):['#8a8a88','cotton',.6]; return [TN_TRK,'poly',.6,1.04]; },{decor:I=>{ neckShadow(I);
  softRect(I,0,T3.neck,128,8,mix(TN_TRK,'#000000',.2),.95,1); for(let y=T3.neck+8;y<214;y+=1.5){ const zw=y<T3.chest+20?12*(1-(y-T3.neck)/(T3.chest+20-T3.neck))+1:0; for(const s of [-1,1]) softEll(I,64+s*(zw+.5),y,.7,.9,'#c8c4b8',.7,.4); }
  softRect(I,62,T3.chest+18,4,6,'#d8d4cc',.95,.4); for(const x of [28,33,95,100]) softLine(I,x,T3.neck+8,x,212,'#e8e4dc',.9,1.2);
  tnRibH(I,0,206,128,8,mix(TN_TRK,'#000000',.25)); for(const s of [-1,1]) softLine(I,64+s*24,T3.nav-4,64+s*34,T3.nav+18,'#000000',.3,1.2); blob(I,64,T3.chest-6,26,14,.12,'#a8505a'); }});
const tnV4Arm=armP(3213,()=>[TN_TRK,'poly',.6,1.04],{decor:I=>{ for(const x of [13,18,45,50]) softLine(I,x,0,x,114,'#e8e4dc',.9,1.2); tnRibH(I,0,114,64,14,mix(TN_TRK,'#000000',.25)); blob(I,32,76,14,8,.1,'#a8505a'); }});
const tnV4Leg=legP(3215,()=>['#1e2230','denim'],{decor:I=>{ seam(I,48,0,48,128,'#8a6a3a'); blob(I,32,66,9,6,.12,'#4a5068'); softRect(I,0,118,64,10,'#14161e',.5,2); }});

/* ---------- the roster ---------- */
const TN_PISTOL=Object.assign({},PISTOL,{fight:AIM_ONE});
const TN_MACHETE={prop:pMachete,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND};
const TENANTS=['abuelo','abuela','senora','enfermera','obrero','estudiante','enfermo'], VECINOS=['vecino1','vecino2','vecino3','vecino4'];
Object.assign(ROSTER,{
  abuelo:{as:'corner',side:'civ',name:'Don Rafa',role:'Tenant · lived here forty years',color:TN_CARD,maker:tnPosed('abuelo',{spine:[.2,0,0],neck:[.1,0,0],head:[-.2,.25,0],armL:[.14,0,.08],elbowL:[-.3,0,0],armR:[.1,0,-.06],elbowR:[-.4,0,0]}),
    note:'In his seventies, in his cardigan and slippers at three in the morning because he heard the shooting downstairs and came to his door to look. Can\'t run. Knows everyone in the building by name, including the ones you\'re here for.',
    o:{hf:.94,w:.94,depth:.98,belly:1.08,lg:.9,ag:.88,jacket:.018,pants:.014,headS:.99,shoeW:.095,shape:'stoop'},torso:tnAbueloTorso,arm:tnAbueloArm,leg:tnAbueloLeg,foot:tnSlipBrown,extra:(J,o)=>teamJaw(J,.97,o.headS)},
  abuela:{as:'corner',side:'civ',name:'Doña Chela',role:'Tenant · his neighbour across the hall',color:TN_DRESS,maker:tnPosed('abuela',{spine:[.12,0,0],head:[-.1,.2,0],armL:[.05,-.9,.12],elbowL:[-1.35,0,0],armR:[.05,.9,-.12],elbowR:[-1.35,0,0]}),
    note:'Housedress, apron, cardigan, her hair up in a bun. Hands clasped in front of her and a rosary somewhere in the apron pocket. Prays out loud when it gets close.',
    o:Object.assign({jacket:.016,pants:.012,belly:1.16},FEM,{hf:.87,w:.98,depth:1.0,headS:.98,shape:'oldf'}),torso:tnAbuelaTorso,arm:tnAbuelaArm,leg:tnStockLeg,foot:tnSlipMaroon,extra:(J,o)=>{ bun(J,'#a8a49e',o.headS); skirt(J,o,tnAbuelaSkirt,.62,1.16); teamJaw(J,1.04,o.headS); }},
  senora:{as:'corner',side:'civ',name:'Marisol',role:'Tenant · two kids asleep behind her',color:TN_ROBE,
    note:'Forty-four, in her housecoat with her hair tied back, standing in her doorway between you and the children\'s room. Begs in a whisper so they won\'t wake.',
    o:Object.assign({jacket:.018,pants:.008},FEM,{hf:.94,belly:1.04,headS:.96}),torso:tnSenoraTorso,arm:tnSenoraArm,leg:tnSenoraLeg,foot:tnSlipGrey,extra:(J,o)=>{ bun(J,'#22160f',o.headS); skirt(J,o,tnRobeSkirt,.66,1.14); teamJaw(J,.91,o.headS); }},
  enfermera:{as:'corner',side:'civ',name:'Yesenia',role:'Tenant · night-shift nurse, just got home',color:TN_SCRUB,
    note:'Late twenties, still in her scrubs with her ID round her neck, cardigan on for the bus. Walked in on the middle of it with her keys in her hand. She\'ll try to help anyone who\'s bleeding, including the men you shot.',
    o:Object.assign({jacket:.014,pants:.014},FEM,{hf:.95,headS:.96}),torso:tnEnfTorso,arm:tnEnfArm,leg:tnEnfLeg,foot:tnSneakGrey,extra:(J,o)=>{ ponytail(J,'#2a1a12',o.headS); teamJaw(J,.9,o.headS); }},
  obrero:{as:'corner',side:'civ',name:'Toño',role:'Tenant · maquila worker, first shift at six',color:TN_WORK,
    note:'Forties, moustache, the plant\'s shirt already on because he leaves in an hour. Tired in a way that doesn\'t go away on weekends. Puts his hands up and keeps saying he didn\'t see anything.',
    o:{hf:.98,w:1.02,depth:1.02,belly:1.1,lg:.98,ag:1.02,jacket:.006,pants:.012},torso:tnObreroTorso,arm:tnObreroArm,leg:tnJeansWorn,foot:tWorkBoot,extra:(J,o)=>teamJaw(J,1.06,1)},
  estudiante:{as:'corner',side:'civ',name:'Junior',role:'Tenant · Beto\'s boy, 19',color:TN_GRN,
    note:'Beto Jr., first in the family at the university. Glasses, his football shirt, headphones round his neck an hour ago. Looks like exactly the kind of kid the men upstairs recruit, which is the problem.',
    o:{hf:.98,w:.9,depth:.92,lg:.92,ag:.88,jacket:.012,pants:.01,headS:1.0,shoeW:.095},torso:tnEstTorso,arm:tnEstArm,leg:tnEstLeg,foot:tnSneakBW,extra:(J,o)=>teamJaw(J,.92,1)},
  enfermo:{as:'corner',side:'civ',name:'Don Lalo',role:'Tenant · sick, hasn\'t left the floor in months',color:'#6a3a28',maker:tnPosed('enfermo',{spine:[.14,0,.03],neck:[.06,0,0],head:[.1,.15,0],armL:[.08,-1.0,.2],elbowL:[-1.55,0,0],armR:[.06,0,-.05],elbowR:[-.3,0,0]}),
    note:'Fifties, grey and unshaven, pyjamas under an open robe. Shuffles to the door holding his stomach. Doesn\'t beg much. Mostly asks you to close the door on your way out.',
    o:{hf:.97,w:.94,depth:.98,belly:1.06,lg:.92,ag:.9,jacket:.016,pants:.014,shoeW:.095},torso:tnEnfermoTorso,arm:tnEnfermoArm,leg:tnEnfermoLeg,foot:tnSlipFelt,extra:(J,o)=>{ skirt(J,o,tnRobeOpen,.5,1.12); teamJaw(J,.96,1); }},
  vecino1:Object.assign({as:'gunman',side:'cartel',was:'Gunman',name:'Undershirt',role:'Cartel · lives on the floor, looks like it',color:'#e8e4da',
    note:'White undershirt, slacks, gold cross. He could be anyone\'s cousin, and that\'s the point: the pistol is in his waistband until you\'re close.',
    o:{hf:.99,w:1.0,depth:1.0,belly:1.04,lg:.98,ag:1.0,jacket:.004,pants:.01},torso:tnV1Torso,arm:tnV1Arm,leg:tnV1Leg,foot:tShoeBlack,extra:(J,o)=>teamJaw(J,1.06,1)},TN_PISTOL),
  vecino2:Object.assign({as:'gunman',side:'cartel',was:'Gunman',name:'The cap',role:'Cartel · plainclothes, faded polo',color:TN_POLO,
    note:'Faded polo, jeans, a cap. Stands in a doorway like he lives there. Maybe he does.',
    o:{hf:.98,w:1.02,depth:1.04,belly:1.14,lg:.98,ag:1.0,jacket:.006,pants:.01},torso:tnV2Torso,arm:tnV2Arm,leg:tnV2Leg,foot:tnSneakDirty,extra:(J,o)=>{ cap(J,'#26324a','#1e2840'); teamJaw(J,1.02,1); }},TN_PISTOL),
  vecino3:Object.assign({as:'cutter',side:'cartel',was:'Cutter',name:'Work shirt',role:'Cartel · plainclothes, machete under the shirt',color:TN_OLV,
    note:'Rolled sleeves and work boots, like he\'s on his way to a shift. The machete hangs down his back under the shirt.',
    o:{hf:1.0,w:1.02,depth:1.02,lg:1.0,ag:1.06,jacket:.01,pants:.01},torso:tnV3Torso,arm:tnV3Arm,leg:tnV3Leg,foot:tWorkBoot,extra:(J,o)=>teamJaw(J,1.04,1)},TN_MACHETE),
  vecino4:Object.assign({as:'gunman',side:'cartel',was:'Gunman',name:'Tracksuit',role:'Cartel · plainclothes, young',color:TN_TRK,
    note:'Twenty-four, cheap tracksuit top over a T-shirt, white sneakers. Smiles at you in the hallway.',
    o:{hf:.98,w:.94,depth:.96,lg:.95,ag:.94,jacket:.012,pants:.01,shoeW:.095},torso:tnV4Torso,arm:tnV4Arm,leg:tnV4Leg,foot:tSneakW,extra:(J,o)=>teamJaw(J,.97,1)},TN_PISTOL)
});
