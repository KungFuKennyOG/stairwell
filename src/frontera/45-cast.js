
/* =====================================================================================================
   PUERTO SECO · art direction set 04. A fictional border city. Ray's joint task-force team for the prologue raid
   (they all die; he's left for dead), and the cartel: the six tower types restyled, same rig, new clothes.
   ===================================================================================================== */
Object.assign(HEADS,{
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

/* ---------- plate carriers for the other casts (deputies, agents): a painted wrap and three pouches ---------- */
function teamVest(seed,base,word,name,textCol='#dedcd2'){ return garment(128,64,seed,()=>[base,'cordura',.5],{folds:6,decor:I=>{
  for(let y=34;y<58;y+=8) for(let x=2;x<128;x+=8) if((x>>3)%4!==3){ softRect(I,x,y,6,4,mix(base,'#000000',.3),.9,.4); softLine(I,x,y,x+6,y,mix(base,'#ffffff',.15),.4,.8); }
  /* no lettering (the pixel font read as garbage on a vest): a plain velcro ID panel front and back, stitched round, and a blank name tape */
  for(const cx of [64,0,128]){ softRect(I,cx-24,7,48,15,mix(base,'#000000',.22),.95,.8); for(const [x0,y0,x1,y1] of [[cx-24,7,cx+24,7],[cx-24,22,cx+24,22],[cx-24,7,cx-24,22],[cx+24,7,cx+24,22]]) softLine(I,x0,y0,x1,y1,mix(base,'#ffffff',.18),.35,.8); }
  if(name){ softRect(I,48,26,32,5,mix(base,'#000000',.35),.9,.6); } softRect(I,0,0,128,3,mix(base,'#000000',.4),1,1); softRect(I,0,61,128,3,mix(base,'#000000',.4),1,1); }}); }
function plateCarrier(J,o,t){ vest(J,o,M(t,{double:true}),.024); const sy=1.09*o.hf,fz=frontAt(o,1.18,.024),pm=M(tPad); for(const x of [-.09,0,.09]) mk(box(.075,.085,.04),pm,J.spine,x,1.18*o.hf-sy,fz+.016); }

/* =====================================================================================================
   THE TEAM: Ray's five. Navy BDUs worn pale at the elbows and knees (Ibarra in federal charcoal), a real plate carrier
   (plate bags, mag pouches, admin pouch, radio with its antenna on the shoulder, flashbangs, battle belt, drop-leg holster),
   high-cut helmets with ear cut-outs, an NVG mount and headsets, and faces that sit under the brim where you can see them.
   Gear is merged per joint and material (one draw call each), so a teammate costs about what the old ones did.
   ===================================================================================================== */
/* ---------- faces: each teammate paints a little extra over the shared head (paintHead's s.post) ---------- */
const FP={cx:128,E:FL3.eye,BR:FL3.brow,NO:FL3.nose,MO:FL3.mouth,CH:FL3.chin};
function stubbleI(I,T,col,a,seed){ const r=rng(seed),C=F3(col),{cx,MO}=FP;
  for(let y=70;y<124;y++) for(let x=0;x<256;x++){ const t=T(x); if(t>.44) continue; const dx=Math.abs(x+.5-cx);
    if(y>=MO-3&&y<=MO+5&&dx<14) continue; if(y<(t>.3?72:MO-9)) continue; if(r()<a*sst(.44,.28,t)) put(I,x,y,C,.42); } }
function mustacheI(I,col,seed,w=16,droop=4){ const C=F3(col),{cx,MO}=FP;
  for(let y=MO-10;y<=MO-1;y++) for(let x=cx-w-2;x<=cx+w+2;x++){ const dx=Math.abs(x+.5-cx),top=MO-9+dx*.12,bot=MO-2+(dx>w-5?droop*(dx-w+5)/5:0);
    if(dx>w||y<top||y>bot) continue; const v=.8+.35*fbm(x*.9,y*.35,seed); put(I,x,y,[C[0]*v,C[1]*v,C[2]*v],.92*Math.min(1,(w-dx+.5)/2)); } }
const lidLine=(I,ex,col,a=.75)=>{ if(ex!=='fight') return; const {cx,E}=FP; for(const sx of [-1,1]){ const e=cx+sx*18;
  for(let i=-8;i<8;i++){ const y0=E-2.6*(1-(i/7.5)**2)-1,y1=E-2.6*(1-((i+1)/7.5)**2)-1; softLine(I,e+i,y0,e+i+1,y1,col,a,1.2); } softLine(I,e+sx*7.5,E-1.5,e+sx*11,E-3.5,col,a*.8,1); } };
const TEAM_POST={
  /* Dunne: fifties, heavy, ruddy, bags under his eyes, deep lines, grey stubble and a thick grey moustache */
  dunne:(I,ex,T)=>{ const {cx,E,NO,MO,CH}=FP;
    for(const sx of [-1,1]){ const e=cx+sx*18; blob(I,e,E+8,8,2.4,-.16); softLine(I,e-7,E+6+sx*0,e+7,E+7,'#000000',.16,1.3); softLine(I,e-5,E+10,e+6,E+11,'#000000',.08,1.2);
      softLine(I,cx+sx*10,NO-3,cx+sx*18,MO+7,'#000000',.24,1.7); softLine(I,cx+sx*19,MO+5,cx+sx*22,CH-1,'#000000',.14,2.2);
      blob(I,cx+sx*26,E+18,10,7,.16,'#c04a3a'); blob(I,cx+sx*36,E+30,8,10,-.1); }
    blob(I,cx,NO-3,6,6,.2,'#c04a3a'); for(const yy of [26,31,36]) softLine(I,cx-24,yy+8,cx+24,yy+8,'#000000',.1,1.2);
    stubbleI(I,T,'#a8a49c',.6,1291); mustacheI(I,'#b4b0a8',1292,17,5); },
  /* Reyes: thirties, sharp, lined eyes, cheekbones, a mole above her lip */
  reyes:(I,ex,T)=>{ const {cx,E,MO}=FP; lidLine(I,ex,'#0a0606',.8);
    for(const sx of [-1,1]){ blob(I,cx+sx*24,E+11,8,3.5,.1); blob(I,cx+sx*27,E+25,8,4,-.1); blob(I,cx+sx*24,E+16,9,6,.08,'#b05048'); }
    blob(I,cx,MO+3,9,2.6,.18,'#6a2a26'); softEll(I,cx+11,MO-8,1.1,1.1,'#3a1e12',.85,.5); },
  /* Ibarra: forties, a heavy black moustache, five o'clock shadow, grey coming in at the temples */
  ibarra:(I,ex,T)=>{ const {cx,E}=FP; stubbleI(I,T,'#141010',.28,1293); mustacheI(I,'#120e0c',1294,15,3);
    for(const sx of [-1,1]){ blob(I,cx+sx*43,64,4,9,.4,'#8a8680'); blob(I,cx+sx*40,52,4,6,.3,'#7a7670'); for(const dy of [-2,1,4]) softLine(I,cx+sx*27,E+dy,cx+sx*32,E+dy*1.5,'#000000',.1,1); } },
  /* Harris: thirties, a trimmed full beard, a nick through his left eyebrow; warm light on his cheekbones so he reads in the dark */
  harris:(I,ex,T)=>{ const {cx,E,BR}=FP; blob(I,cx,40,20,8,.14); for(const sx of [-1,1]){ blob(I,cx+sx*22,E+12,8,4,.16); } softLine(I,cx,E-4,cx,FP.NO-8,'#ffffff',.08,2);
    softLine(I,cx+21,BR-4,cx+22,BR+3,HEADS.harris.skin,.95,1.3); },
  /* Novak: twenty-four, fair, freckled, pink in the cheeks, nothing on his face yet */
  novak:(I,ex,T)=>{ const {cx,E,NO}=FP,r=rng(1295); for(const sx of [-1,1]) blob(I,cx+sx*25,E+16,10,7,.16,'#d06a5a'); blob(I,cx,NO-3,5,4,.12,'#d06a5a');
    for(let i=0;i<46;i++){ const x=cx+(r()-.5)*72,y=E+5+r()*(NO-E+4); if(Math.abs(x-cx)<5&&y<NO-6) continue; softEll(I,x,y,1,1,'#a0603e',.4+r()*.25,.5); } }
};
Object.assign(HEADS,{
  dunne:{seed:1201,skin:'#d4a088',skinD:'#a07058',hair:'buzz',hairC:'#9a9690',hairFront:15,sideburn:33,brow:'#8a867e',browT:2,iris:'#4a6a8a',lip:'#a0625a',age:true,post:TEAM_POST.dunne},
  reyes:{seed:1202,skin:'#c48e68',skinD:'#946446',hair:'slick',hairC:'#120c0a',hairFront:13,sideburn:38,behind:50,nape:54,brow:'#120c0a',browT:2,iris:'#2a1a10',lip:'#94524a',post:TEAM_POST.reyes},
  ibarra:{seed:1203,skin:'#ae7854',skinD:'#7c4e36',hair:'slick',hairC:'#120e0c',hairFront:13,sideburn:40,shadow:true,brow:'#120e0c',browT:2,iris:'#2a1a10',lip:'#84483a',post:TEAM_POST.ibarra},
  harris:{seed:1204,skin:'#6a412a',skinD:'#422618',hair:'buzz',hairC:'#0e0a08',hairFront:15,brow:'#0e0a08',browT:2,iris:'#1a0e08',lip:'#54301f',beard:'full',beardC:'#0e0a08',white:'#d8cfc0',post:TEAM_POST.harris},
  novak:{seed:1205,skin:'#e6ba98',skinD:'#b88c6e',hair:'buzz',hairC:'#c8a868',hairFront:15,brow:'#b08e5c',iris:'#5a7a9a',lip:'#c27c6c',post:TEAM_POST.novak}
});
/* head shape: the jaw widened or narrowed (Dunne's jowls, Novak's thin young face). The hit mesh is this same geometry. */
function teamJaw(J,k,hs){ const P=J.headMesh.mesh.geo.P; for(let i=0;i<P.length;i+=3){ const f=sst(.13*hs,.03*hs,P[i+1]); P[i]*=1+(k-1)*f; P[i+2]*=1+(k-1)*f*.4; } J.headMesh.mesh.geo.bs=null; }

/* ---------- cloth ---------- */
const NAVY='#2d374c', NAVY_D='#1c2333', FED='#44474c', FED_D='#2e3034';
const pale=c=>mix(c,'#a8b0bc',.42);
function teamTorso(k,seed,col,colD){ const lt=pale(col); return torsoP(k,seed,(x,y)=>y<T3.belt-3?[col,'twill']:[col,'twill',.6,.92],{folds:22,decor:I=>{ neckShadow(I);
  softRect(I,0,T3.neck,128,7,colD,.85,1); softLine(I,0,T3.neck+7.5,128,T3.neck+7.5,lt,.22,1); seam(I,64,T3.neck+14,64,T3.belt-4); sideSeams(I,T3.neck,T3.belt);
  blob(I,64,T3.belt-22,26,5,.16,lt); blob(I,30,T3.belt-30,8,10,.1,lt); blob(I,98,T3.belt-30,8,10,.1,lt);
  beltI(I,'#121315','#4a4a4e'); seam(I,64,T3.belt+5,64,T3.belt+40); blob(I,64,T3.belt+34,14,8,.12,lt); }}); }
/* arms: L carries the flag patch on its outer side; R a blank patch. Worn pale at the elbow, glove cuffs at the wrist. */
function teamArm(seed,col,colD,flag,side){ const lt=pale(col),px=side==='L'?40:12; return armP(seed,()=>[col,'twill'],{decor:I=>{
  softRect(I,px,16,13,16,colD,.95,1); softLine(I,px,16,px+13,16,lt,.3,.8);
  if(flag==='us'){ for(let i=0;i<7;i++) softRect(I,px+1.5,19+i*1.35,10,1.1,i%2?'#e8e4dc':'#a82a24',.95,.3); softRect(I,px+1.5,19,4.5,4.6,'#26346a',.95,.3); } else if(flag==='mx'){ ['#22663a','#e8e4dc','#b8302a'].forEach((c,i)=>softRect(I,px+1.5+i*3.4,19,3.2,9,c,.95,.3)); softEll(I,px+6.6,23.5,.9,.9,'#8a6a3a',.9,.4); } else softRect(I,px+2,20,9,7,mix(colD,'#000000',.2),.9,.6);
  for(const x of [0,64]) blob(I,x,77,8,8,.26,lt); blob(I,32,70,10,4,.08,lt); seam(I,side==='L'?16:48,0,side==='L'?16:48,108);
  for(let x=0;x<64;x+=9) softLine(I,x,98,x+5,104,mix(col,'#000000',.4),.35,1.4); softRect(I,0,106,64,6,colD,.7,1.5);
  softRect(I,0,113,64,15,'#121316',1,1); softLine(I,0,113,64,113,'#3e4044',.55,1); }}); }
/* legs: cargo pocket on the outer thigh, knees worn pale, trousers bloused into the boots */
function teamLeg(seed,col,colD,side){ const lt=pale(col),px=side==='L'?40:8; return legP(seed,()=>[col,'twill'],{decor:I=>{
  softRect(I,px,28,17,26,mix(col,'#000000',.12),.7,1); softRect(I,px-1,27,19,6,mix(col,'#ffffff',.06),.9,.6); seam(I,px-1,33,px+18,33); seam(I,px+8.5,33,px+8.5,54);
  blob(I,32,71,11,9,.22,lt); blob(I,32,40,9,14,.08,lt); seam(I,side==='L'?16:48,0,side==='L'?16:48,128);
  for(let x=0;x<64;x+=7) softLine(I,x,114,x+3,120,mix(col,'#000000',.45),.45,1.4); softRect(I,0,118,64,10,colD,.6,2); }}); }
/* the carrier's wrap (cummerbund): webbing rows round the sides; the front and back are under the plate bags */
function carrierWrap(seed,base){ const dk=mix(base,'#000000',.45),lt=mix(base,'#ffffff',.14); return garment(128,64,seed,()=>[base,'cordura',.5],{folds:6,decor:I=>{
  for(const [x0,x1] of [[14,46],[82,114]]) for(let y=12;y<56;y+=9){ softRect(I,x0,y,x1-x0,4,dk,.7,.5); softLine(I,x0,y,x1,y,lt,.45,.8); for(let x=x0+7;x<x1;x+=8) softLine(I,x,y,x,y+4,dk,.8,.8); }
  softRect(I,0,0,128,3,dk,1,1); softRect(I,0,61,128,3,dk,1,1); for(const x of [40,88]) seam(I,x,3,x,61); }}); }
/* a plate bag: binding round the edge, three rows of webbing low down */
function plateTex(seed,base){ const dk=mix(base,'#000000',.5),lt=mix(base,'#ffffff',.16); return flat(32,32,seed,base,'cordura',{fk:.3,decor:I=>{
  for(let y=14;y<30;y+=5){ softRect(I,2,y,28,2.5,dk,.6,.4); softLine(I,2,y,30,y,lt,.5,.6); for(let x=5;x<30;x+=6) softLine(I,x,y,x,y+2.5,dk,.9,.6); }
  softRect(I,0,0,32,1.5,dk,1,.6); softRect(I,0,30.5,32,1.5,dk,1,.6); softRect(I,0,0,1.5,32,dk,1,.6); softRect(I,30.5,0,1.5,32,dk,1,.6); blob(I,16,5,10,3,.12); }}); }
/* a pouch: darker than the carrier, its flap lit along the top edge, a pull tab */
function pouchTex(seed,base){ const lt=mix(base,'#ffffff',.32); return flat(16,16,seed,base,'cordura',{fk:.2,decor:I=>{
  softRect(I,0,0,16,6,mix(base,'#ffffff',.06),.9,.4); softLine(I,0,.5,16,.5,lt,.8,.8); softLine(I,0,6.5,16,6.5,'#000000',.55,1); softRect(I,6,5,4,3,mix(base,'#000000',.4),.9,.4);
  softRect(I,0,15,16,1,'#000000',.4,.5); blob(I,8,11,6,3,-.08); }}); }
const tTeamGlove=flat(16,16,1340,'#1a1b1e','leather',{decor:I=>{ softRect(I,1,2,14,4,'#34363b',.85,.6); for(const x of [4,8,12]) softLine(I,x,7,x,14,'#2a2c30',.6,1); }});
const tCoyGlove=flat(16,16,1341,'#6a5a44','leather',{decor:I=>{ softRect(I,1,2,14,4,'#2a2622',.85,.6); for(const x of [4,8,12]) softLine(I,x,7,x,14,'#4a3e30',.6,1); }});
function helmTex(seed,base){ const dk=mix(base,'#000000',.4); return garment(64,32,seed,()=>[base,'nylon',.4],{folds:5,wrap:false,grime:.18,decor:I=>{
  softRect(I,0,29,64,3,dk,1,.6); softRect(I,26,3,12,7,dk,.8,.6); softRect(I,0,0,64,3,mix(base,'#000000',.2),.8,1); softRect(I,6,10,8,5,dk,.6,.6); softRect(I,50,10,8,5,dk,.6,.6); }}); }
/* palettes: navy for the US four, charcoal for Ibarra */
function teamPal(seed,uni,uniD,carrier,pouch,helm,flag){ return {
  armL:teamArm(seed+2,uni,uniD,flag,'L'),armR:teamArm(seed+3,uni,uniD,null,'R'),legL:teamLeg(seed+4,uni,uniD,'L'),legR:teamLeg(seed+5,uni,uniD,'R'),
  wrap:M(carrierWrap(seed+6,carrier),{double:true}),plate:M(plateTex(seed+7,carrier)),pouch:M(pouchTex(seed+8,pouch)),helm:M(helmTex(seed+9,helm)),
  hard:mHardKit,black:mHardKit,uni,uniD }; }
const mHardKit=M(null,{color:0x141517}), mLens=M(null,{color:0x2a3a30,emissive:0x050805});
const mBun=M(garment(32,16,1342,()=>['#2e2018','cotton',.3],{folds:3,dir:'v',decor:I=>{ for(let x=1;x<32;x+=3) softLine(I,x,0,x+2,16,'#4e3a2a',.5,.8); for(let x=2;x<32;x+=5) softLine(I,x,0,x+1,16,'#120c08',.5,.8); }}));
const TPAL={us:teamPal(1330,NAVY,NAVY_D,'#334058','#11151e','#222a38','us'),
  fed:teamPal(1350,FED,FED_D,'#46494e','#1c1e21','#3a3c40','mx')};
const TTORSO={dunne:teamTorso('dunne',1301,NAVY,NAVY_D),reyes:teamTorso('reyes',1302,NAVY,NAVY_D),ibarra:teamTorso('ibarra',1311,FED,FED_D),harris:teamTorso('harris',1304,NAVY,NAVY_D),novak:teamTorso('novak',1305,NAVY,NAVY_D)};

/* ---------- geometry ---------- */
/* Kit: gear pieces for one joint, merged into one mesh per material */
function Kit(){ const bins=new Map();
  const add=(m,g,X)=>{ let b=bins.get(m); if(!b){ b=new Geo(); bins.set(m,b); } const base=b.P.length/3;
    for(let i=0;i<g.P.length;i+=3){ const x=g.P[i],y=g.P[i+1],z=g.P[i+2],a=g.Nm[i],c=g.Nm[i+1],d=g.Nm[i+2];
      b.P.push(X[0]*x+X[4]*y+X[8]*z+X[12],X[1]*x+X[5]*y+X[9]*z+X[13],X[2]*x+X[6]*y+X[10]*z+X[14]); b.Nm.push(X[0]*a+X[4]*c+X[8]*d,X[1]*a+X[5]*c+X[9]*d,X[2]*a+X[6]*c+X[10]*d); }
    for(const t of g.T) b.T.push(t); for(const ix of g.I) b.I.push(ix+base); };
  const K={ at(m,g,x=0,y=0,z=0,rx=0,ry=0,rz=0){ add(m,g,m4.compose(m4.make(),[x,y,z],[rx,ry,rz],[1,1,1])); return K; },
    /* a strap or rod from a to b */
    rod(m,a,b,w,t){ const d=v3.sub(b,a),len=Math.hypot(...d),Y=v3.sc(d,1/len),Z0=Math.abs(Y[2])<.9?[0,0,1]:[1,0,0],X=norm3(v3.cross(Y,Z0)),Z=v3.cross(X,Y);
      add(m,box(w,len,t),fromCols(X,Y,Z,v3.sc(v3.add(a,b),.5))); return K; },
    put(parent){ for(const [m,g] of bins){ g.groups=[{start:0,count:g.I.length,mi:0}]; mk(g,m,parent); } bins.clear(); } };
  return K; }
/* high-cut helmet: an ellipsoid shell whose rim sits at the brow in front, rises over the ears and drops at the back; an inward lip under the rim */
const HELM_RIM=[[0,.156],[.5,.154],[.9,.13],[1.15,.134],[1.38,.158],[1.8,.156],[2.05,.116],[2.5,.1],[Math.PI,.098]];
const helmRim=a=>{ a=Math.abs(a); for(let i=1;i<HELM_RIM.length;i++) if(a<=HELM_RIM[i][0]){ const p=HELM_RIM[i-1],q=HELM_RIM[i],t=(a-p[0])/(q[0]-p[0]); return p[1]+(q[1]-p[1])*sst(0,1,t); } return HELM_RIM[HELM_RIM.length-1][1]; };
function helmGeo(hs){ const g=new Geo(),S=18,K=7,yc=.13,ry=.142,Rx=.099,Rz=.119,cz=-.008,rs=S+1;
  for(let k=-1;k<=K;k++) for(let i=0;i<=S;i++){ const a=i/S*Math.PI*2-Math.PI,rim=helmRim(a),t0=Math.asin(Math.max(-1,Math.min(1,(rim-yc)/ry)));
    const th=k<0?t0:t0+(Math.PI/2-t0)*k/K,r=Math.cos(th)*(k<0?.84:1),y=k<0?rim+.004:yc+ry*Math.sin(th);
    g.v([Rx*r*Math.sin(a)*hs,y*hs,(cz+Rz*r*Math.cos(a))*hs],[0,1,0],[i/S,(k+1)/(K+1)]); }
  for(let j=0;j<K+1;j++) for(let i=0;i<S;i++){ const a=j*rs+i,b=a+1,c=a+rs+1,d=a+rs; g.I.push(a,b,c,a,c,d); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
const legAt=(o,y)=>{ const L=LEG; let a=L[0],b=L[0]; for(let i=1;i<L.length;i++){ b=L[i]; if(y<=b[0]) break; a=b; } const f=b[0]===a[0]?0:Math.min(1,Math.max(0,(y-a[0])/(b[0]-a[0]))); const lg=o.lg||1,pl=o.pants||.006;
  return [(a[1]+(b[1]-a[1])*f)*lg+pl,(a[2]+(b[2]-a[2])*f)*lg+pl,a[3]+(b[3]-a[3])*f]; };
/* the whole kit. opt: {pal, nvg (flipped up), boom (headset mic), shells (shotgun shell card), holster ('full'|'empty'), bun (colour), glove} */
function teamKit(J,o,opt){ const P=opt.pal,hf=o.hf,w=o.w||1,hs=o.headS||1,sy=1.09*hf,Y=y=>y*hf-sy,fr=(y,m=.022)=>frontAt(o,y,m),bk=(y,m=.022)=>{ const t=torsoAt(o,y*hf); return t[3]-t[2]-m; };
  /* the arms and legs on the right get their own (mirrored) cloth so pockets and patches sit on the outside */
  const ms=J.body.mesh.mats; ms[1]=M(P.armL); ms[2]=M(P.armR); ms[3]=M(P.legL); ms[4]=M(P.legR); J.body.mesh.runs=null;
  /* --- plate carrier (spine) --- */
  vest(J,o,P.wrap,.022);
  const S=Kit(),zf=fr(1.3)-.004,zb=bk(1.3)+.004,pf=zf+.02,tw=torsoAt(o,1.16*hf)[1];
  S.at(P.plate,box(.27*w,.31*hf,.04,{tw:.9}),0,Y(1.28),zf).at(P.plate,box(.28*w,.32*hf,.035,{tw:.92}),0,Y(1.28),zb);
  const mags=opt.shells?[-.088,.088]:[-.088,0,.088]; for(const x of mags) S.at(P.pouch,box(.072,.1,.042),x*w,Y(1.165),pf+.016);
  if(opt.shells){ S.at(P.pouch,box(.085,.06,.014),0,Y(1.17),pf+.006); const red=M(null,{color:0x8a1c16}),brass=M(null,{color:0xb08a3a});
    for(let i=0;i<5;i++){ const x=(i-2)*.016; S.at(red,cyl(.0075,.0075,.045,6),x,Y(1.17)+.008,pf+.017).at(brass,cyl(.008,.008,.012,6),x,Y(1.17)-.02,pf+.017); } }
  S.at(P.pouch,box(.13,.07,.026),0,Y(1.365),pf+.006);
  /* radio on the left shoulder, short antenna; the push-to-talk on the right */
  const rx=.1*w,ry=Y(1.415),rz=fr(1.42)+.03; S.at(P.black,box(.044,.088,.03),rx,ry,rz,-.15).at(P.black,cyl(.004,.006,.08,5),rx+.012,ry+.08,rz-.008,-.15).at(P.hard,box(.03,.022,.034),rx,ry-.05,rz,-.15);
  S.at(P.hard,box(.032,.042,.02),-rx,Y(1.42),fr(1.42)+.02,-.15);
  /* shoulder straps over the traps */
  for(const s of [1,-1]) S.at(P.plate,box(.066,.018,.2),s*.088*w,Y(1.505),0,0,0,-s*.42);
  /* flashbangs on the cummerbund, a pouch on the back */
  for(const s of [1,-1]) S.at(P.black,cyl(.021,.021,.1,8),s*(tw+.035),Y(1.16),.03).at(P.hard,box(.03,.012,.03),s*(tw+.035),Y(1.16)+.055,.03);
  S.at(P.pouch,box(.17,.16,.05),0,Y(1.25),zb-.04);
  S.put(J.spine);
  /* --- battle belt (hips) --- */
  const B=Kit(),hy=.99*hf,bt=torsoAt(o,1.0*hf),by=1.0*hf-hy,bf=bt[2]+bt[3]+.012;
  B.at(P.plate,lathe([[by-.025,bt[1]+.014,bt[2]+.014,bt[3]],[by+.025,bt[1]+.014,bt[2]+.014,bt[3]]],12,{capB:false,capT:false}),0,0,0);
  for(const x of [.06,.1]) B.at(P.pouch,box(.032,.07,.026),x*w,by-.01,bf+.01);
  B.at(P.pouch,box(.1,.09,.06),-.12*w,by-.03,-(bt[2]-bt[3])-.02,0,.5,0);
  B.at(P.black,box(.05,.025,.02),0,by,bf+.006);
  B.put(J.hips);
  /* --- drop-leg holster (right thigh, outside) and leg straps --- */
  const H=Kit(),lr=legAt(o,.76),hx=-(lr[0]+.03);
  for(const yy of [.8,.68]){ const q=legAt(o,yy); H.at(P.plate,lathe([[-.012,q[0]+.008,q[1]+.008,q[2]],[.012,q[0]+.008,q[1]+.008,q[2]]],10,{capB:false,capT:false}),0,(yy-.93)*hf,0); }
  H.at(P.plate,box(.014,.2,.09),hx+.006,-.18*hf,0).at(P.hard,box(.042,.17,.06,{tw:1.15,td:1.1}),hx-.018,-.17*hf,.006).at(P.plate,box(.03,.12,.03),hx+.004,-.03*hf,0);
  if(opt.holster!=='empty') H.at(P.black,box(.028,.06,.034),hx-.018,-.065*hf,-.004,.25);
  H.put(J.thighR);
  /* --- knee pads --- */
  for(const k of ['kneeL','kneeR']){ const K=Kit(),q=legAt(o,.5); K.at(P.hard,box(.1,.12,.035,{tw:.82,td:.7}),0,.005,q[1]+q[2]+.014,-.06).at(P.hard,lathe([[-.05,q[0]+.006,q[1]+.006,q[2]],[-.03,q[0]+.006,q[1]+.006,q[2]]],10,{capB:false,capT:false}),0,0,0); K.put(J[k]); }
  /* --- head: helmet, NVG mount (and NVGs flipped up), rails, battery pack, headset, chin strap --- */
  const Hd=Kit(),hd=v=>v*hs;
  Hd.at(P.helm,helmGeo(hs));
  Hd.at(P.hard,box(.048,.034,.016),0,hd(.205),hd(.1),-.5);
  for(const s of [1,-1]) Hd.at(P.hard,box(.01,.014,.1),s*hd(.1),hd(.172),hd(-.012));
  Hd.at(P.hard,box(.064,.046,.026),0,hd(.178),hd(-.13),.55).at(P.hard,box(.016,.01,.016),0,hd(.272),hd(-.02));
  if(opt.nvg){ const nz=hd(.118),ny=hd(.245); Hd.at(P.black,box(.07,.024,.03),0,hd(.228),hd(.112),-.55);
    for(const s of [1,-1]) Hd.at(P.black,cyl(.016,.017,.072,8),s*.023,ny,nz,-.55).at(mLens,cyl(.0125,.0125,.004,8),s*.023,ny+.037*Math.cos(.55),nz-.037*Math.sin(.55),-.55); }
  for(const s of [1,-1]) Hd.at(P.black,cyl(.034,.034,.026,10),s*hd(.092),hd(.104),hd(-.006),0,0,Math.PI/2);
  if(opt.boom) Hd.rod(P.black,[hd(.1),hd(.09),hd(.02)],[hd(.038),hd(.058),hd(.098)],.006,.006).at(P.black,box(.014,.012,.014),hd(.034),hd(.058),hd(.1));
  for(const s of [1,-1]) Hd.rod(P.black,[s*hd(.08),hd(.13),hd(.0)],[s*hd(.074),hd(.06),hd(-.004)],.012,.004).rod(P.black,[s*hd(.074),hd(.062),hd(-.004)],[s*hd(.048),hd(.004),hd(.03)],.012,.004).rod(P.black,[s*hd(.05),hd(.006),hd(.028)],[0,hd(-.004),hd(.064)],.012,.004);
  if(opt.bun) Hd.at(mBun,lathe([[0,.02,.02],[.022,.046,.044],[.05,.05,.048],[.074,.04,.038],[.088,.012,.012]],10),0,hd(.072),hd(-.082),-1.25).at(mHardKit,cyl(.024,.024,.012,8),0,hd(.072)+.006*Math.cos(1.25),hd(-.082)-.006*Math.sin(1.25),-1.25);
  Hd.put(J.head);
  if(opt.jaw) teamJaw(J,opt.jaw,hs);
}

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
    o:{hf:1.0,w:1.1,depth:1.12,belly:1.22,lg:1.06,ag:1.1,headS:1.08,jacket:.006,pants:.01},torso:TTORSO.dunne,arm:TPAL.us.armL,leg:TPAL.us.legL,foot:tRayBoot,hand:tTeamGlove,extra:(J,o)=>teamKit(J,o,{pal:TPAL.us,nvg:true,boom:true,jaw:1.1})},TWO(pSMG,'smg')),
  reyes:Object.assign({side:'team',name:'Ana Reyes',role:'Breacher · shotgun',color:'#c8946e',fate:'Dies on floor 2, at the door she was breaching. The door was wired.',note:'Grew up four streets from the tower. Translates for the team, argues with Ibarra in Spanish, and is the best shot in the truck.',
    o:Object.assign({jacket:.008,pants:.01},FEM,{hf:.96,w:.98,depth:.96,ag:.9,lg:.94,headS:1.0}),torso:TTORSO.reyes,arm:TPAL.us.armL,leg:TPAL.us.legL,foot:tRayBoot,hand:tTeamGlove,extra:(J,o)=>teamKit(J,o,{pal:TPAL.us,shells:true,bun:'#140e0a',jaw:.92})},TWO(pShotgun,'shotgun')),
  ibarra:Object.assign({side:'team',name:'Tomás Ibarra',role:'Federal liaison · knows the city',color:'#3a3c3e',fate:'Dies on floor 6, covering Ray on the stairs. Or sold them out. The game never quite tells you.',note:'Local federal officer attached to the task force. Quiet, careful, makes a phone call in the truck that nobody else hears.',
    o:{hf:.99,w:1.03,depth:1.03,belly:1.06,lg:1.0,ag:1.03,headS:1.05,jacket:.006,pants:.01},torso:TTORSO.ibarra,arm:TPAL.fed.armL,leg:TPAL.fed.legL,foot:tBlackBoot,hand:tTeamGlove,extra:(J,o)=>teamKit(J,o,{pal:TPAL.fed,nvg:true,jaw:1.02})},TWO(pSMG,'smg')),
  harris:Object.assign({side:'team',name:'DeShawn "Deuce" Harris',role:'Point man · SMG',color:'#5e3a26',fate:'Dies on floor 5, in a hallway with no cover, still joking on the radio.',note:'The loud one. Runs the music in the truck and a betting pool on everything. Ray\'s closest friend on the team, which the player finds out from a photo later.',
    o:{hf:1.02,w:1.08,depth:1.05,lg:1.07,ag:1.12,headS:1.06,jacket:.006,pants:.01},torso:TTORSO.harris,arm:TPAL.us.armL,leg:TPAL.us.legL,foot:tRayBoot,hand:tCoyGlove,extra:(J,o)=>teamKit(J,o,{pal:TPAL.us,nvg:true,jaw:1.05})},TWO(pSMG,'smg')),
  novak:Object.assign({side:'team',name:'Kyle Novak',role:'Rookie · first live raid',color:'#e8c0a0',fate:'Dies last, next to Ray, talking until he can\'t. Ray never answers him.',note:'Twenty-four, nervous, checks his gear three times on the drive. Asks Ray what it\'s like the first time. Ray doesn\'t answer that either.',
    o:{hf:.98,w:.95,depth:.95,lg:.97,ag:.95,headS:1.03,jacket:.006,pants:.01},torso:TTORSO.novak,arm:TPAL.us.armL,leg:TPAL.us.legL,foot:tRayBoot,hand:tTeamGlove,extra:(J,o)=>teamKit(J,o,{pal:TPAL.us,holster:'empty',jaw:.93})},PISTOL,{fight:AIM_ONE}),
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
