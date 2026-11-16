/* =====================================================================
   WICK stage 1: the cast. Velour's staff and the man you came for. Their own look, not the tower's:
   - a tailored build: taller, wide in the shoulder, narrow in the waist, a slightly smaller head (the 'tailor' shape)
   - an ink pass on every painted texture: tone cut into a few hard bands, so cloth and faces read as graphic shapes
   - sculpted hair and eyewear on top of the painted head, so no two silhouettes match
   - an edge light in the room's colour (m.rim, the renderer's uRim), which is what draws a black suit against a dark room
   - house colours: black suits, black shirts, gold ties, white gloves. The bodyguards wear white dinner jackets.
   Painted on first use (wkCastInit), so nothing here costs the other games anything.
   ===================================================================== */
/* cut a painted texture's tone into bands (hue kept), with a little more contrast */
function wkInk(t,levels=6,gain=1.1){ if(!WK.ink) return t; /* off: the cast is painted like the tower's (Kenny, 2026-11-16) */ const w=t.c.width,h=t.c.height,c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.drawImage(t.c,0,0);
  /* bands are even in sqrt(tone), so the darks keep their steps (a black suit stays black, with a fold or two) */
  const d=g.getImageData(0,0,w,h),p=d.data; for(let i=0;i<p.length;i+=4){ const v=Math.max(p[i],p[i+1],p[i+2])/255; if(v<.004) continue; const r=Math.round(Math.sqrt(Math.min(1,v*gain))*levels)/levels,q=Math.max(.012,r*r),k=q/v; p[i]=Math.min(255,p[i]*k); p[i+1]=Math.min(255,p[i+1]*k); p[i+2]=Math.min(255,p[i+2]*k); }
  g.putImageData(d,0,0); return {c,glt:null,f:-1}; }
function wkRim(n,k=1){ if(n.mesh) for(const m of n.mesh.mats) if(m&&!m.unlit) m.rim=k; for(const q of n.kids) wkRim(q,k); }

const WKH={ /* heads: painted base (10-engine.js paintHead) + a 3D hairstyle and eyewear (wkHead) */
  wk_a:{seed:9101,skin:'#c9a184',skinD:'#96705a',hair:'slick',hairC:'#0c0a0a',hairFront:13,sideburn:40,brow:'#0c0a0a',browT:2,iris:'#2a1a12',lip:'#94564a',do:'pomp',eyes:'shades'},
  wk_b:{seed:9102,skin:'#6a4430',skinD:'#44291c',hair:'shaved',hairFront:14,shadow:true,brow:'#120c08',browT:2,iris:'#1a0e08',lip:'#52301f',beard:'goatee',beardC:'#120c08',do:'bald',eyes:'none',ring:true},
  wk_c:{seed:9103,skin:'#e4c2a6',skinD:'#b6927a',hair:'bleach',hairC:'#d8c48a',hairFront:15,brow:'#a08456',iris:'#5a7a8a',lip:'#a8685a',scar:true,do:'flat',eyes:'none'},
  wk_d:{seed:9104,skin:'#b88662',skinD:'#885c42',hair:'slick',hairC:'#1a120e',hairFront:12,sideburn:44,shadow:true,brow:'#1a120e',browT:2,iris:'#2a1a10',lip:'#864838',beard:'mustache',beardC:'#1a120e',do:'part',eyes:'none'},
  wk_e:{seed:9105,skin:'#d8b494',skinD:'#a8846a',hair:'buzz',hairC:'#141010',hairFront:15,brow:'#141010',browT:2,iris:'#2a1a12',lip:'#94564a',beard:'stubble',beardC:'#1c1410',do:'flat',eyes:'shades'},
  wk_f:{seed:9106,skin:'#8a5c40',skinD:'#5c3826',hair:'buzz',hairC:'#0e0a08',hairFront:15,shadow:true,brow:'#0e0a08',browT:2,iris:'#1a0e08',lip:'#643826',beard:'full',beardC:'#0e0a08',do:'pomp',eyes:'none'},
  wk_g:{seed:9107,skin:'#e8c8b0',skinD:'#ba9a84',hair:'slick',hairC:'#6a2a14',hairFront:13,sideburn:38,brow:'#5a2410',iris:'#4a6a4a',lip:'#a86a5a',do:'part',eyes:'shades',ring:true},
  wk_h:{seed:9108,skin:'#caa080',skinD:'#987258',hair:'shaved',hairFront:14,shadow:true,brow:'#2a1e16',browT:2,iris:'#3a2a1a',lip:'#8a4c3c',scar:true,do:'bald',eyes:'shades'},
  wk_boss:{seed:9120,skin:'#d6ae94',skinD:'#a67e68',hair:'slick',hairC:'#c8c8cc',hairFront:12,sideburn:42,brow:'#b8b8bc',browT:2,iris:'#5a6a7a',lip:'#94605a',age:true,beard:'goatee',beardC:'#c8c8cc',do:'sweep',eyes:'gold'},
  wk_cook:{seed:9130,skin:'#c49a78',skinD:'#946c50',hair:'buzz',hairC:'#1a1410',hairFront:15,brow:'#1a1410',iris:'#3a2a1a',lip:'#8a4c3c',beard:'stubble',beardC:'#241a14',tattoo:true,do:'band',eyes:'none'} };

/* hair and eyewear on the head joint. hs: the head's scale */
function wkHead(J,o,H){ const hs=o.headS||1,col=H.hairC?hexInt(H.hairC):0x0c0a0a,m=M(null,{color:col}),hi=M(null,{color:hexInt(mix(H.hairC||'#0c0a0a','#ffffff',.22))});
  const cr=(rings,mm=m,cz=-.01)=>crown(J,rings.map(([y,a,b])=>[y*hs,a*hs,b*hs]),mm,cz*hs);
  if(H.do==='pomp'){ cr([[.168,.082,.102],[.205,.087,.107],[.238,.08,.1],[.258,.05,.07],[.266,0,0]]); }
  else if(H.do==='flat'){ cr([[.175,.08,.1],[.215,.084,.104],[.246,.078,.098],[.256,0,0]]); }
  else if(H.do==='part'){ cr([[.17,.082,.102],[.21,.087,.107],[.244,.076,.098],[.26,.03,.05],[.264,0,0]]); mk(box(.004*hs,.012*hs,.1*hs),hi,J.head,.024*hs,.258*hs,.01*hs); }
  else if(H.do==='sweep'){ cr([[.168,.082,.102],[.21,.088,.108],[.244,.078,.1],[.26,.045,.07],[.266,0,0]]); }
  else if(H.do==='band'){ cr([[.178,.083,.103],[.22,.087,.107],[.246,.07,.09],[.254,0,0]],M(null,{color:0x16161a})); mk(box(.02*hs,.05*hs,.05*hs),M(null,{color:0x16161a}),J.head,.03*hs,.19*hs,-.11*hs,.4); }
  const y=.124*hs,z=.098*hs;
  if(H.eyes==='shades'){ const g=M(null,{color:0x050506,emissive:0x0a0c12}); mk(box(.136*hs,.03*hs,.012*hs),g,J.head,0,y,z); for(const s of [-1,1]) mk(box(.008*hs,.012*hs,.09*hs),g,J.head,s*.07*hs,y+.004*hs,z-.045*hs); }
  else if(H.eyes==='gold'){ const g=M(null,{color:0xd8b060,emissive:0x2a1c08}),l=M(null,{color:0x2a1e12,emissive:0x1a1006}); for(const s of [-1,1]){ mk(box(.052*hs,.034*hs,.008*hs),g,J.head,s*.034*hs,y,z); mk(box(.044*hs,.026*hs,.01*hs),l,J.head,s*.034*hs,y,z+.001); mk(box(.006*hs,.008*hs,.09*hs),g,J.head,s*.064*hs,y+.006*hs,z-.045*hs); } }
  if(H.ring) mk(box(.012*hs,.018*hs,.012*hs),M(null,{color:0xd8b060,emissive:0x2a1c08}),J.head,.082*hs,.085*hs,.0); /* an earring */ }

/* ---------- the tailoring ---------- */
const WKS={black:'#0e0f13',black2:'#15171d',gold:'#c89a3c',white:'#e9e6de',cream:'#efeadc',wine:'#5a0f1e',satin:'#101014',navy:'#141a2e'};
/* a jacket: o.j jacket, o.sh shirt, o.tie (null: open collar), o.bow, o.lap lapel edge, o.sq pocket square, o.db double-breasted, o.p trousers, o.drop how deep the V is */
function wkTorso(k,seed,o){ const dr=o.drop||58,w0=o.w0||15;
  return wkInk(torsoP(k,seed,(x,y)=>{ const dx=Math.abs(x-64); if(y>T3.belt+2) return [o.p||o.j,'wool',.6];
      if(y<T3.neck+dr&&dx<w0*(1-(y-T3.neck)/dr)){ if(o.tie&&dx<2.6&&y>T3.neck+4) return [o.tie,'poly',.3]; return [o.sh,'cotton',.4]; }
      return [o.j,o.fab||'wool']; },
    {decor:I=>{ neckShadow(I); sideSeams(I,T3.neck,T3.belt);
      for(const s of [-1,1]){ softLine(I,64+s*w0,T3.neck,64+s*1.5,T3.neck+dr,o.lap||'#2a2c34',.95,2.2); softLine(I,64+s*(w0+5),T3.neck+2,64+s*7,T3.neck+dr-6,o.lap||'#2a2c34',.5,1.2); }
      if(o.tie){ softEll(I,64,T3.neck+5,3.4,2.6,o.tie,1,.4); softLine(I,64,T3.neck+9,64,T3.neck+dr-2,mix(o.tie,'#ffffff',.3),.5,.8); softRect(I,60.5,T3.neck+24,7,1.6,'#f4e2a8',.95,.4); }
      if(o.bow){ for(const s of [-1,1]){ softEll(I,64+s*4.2,T3.neck+4.5,3.6,2.6,o.bow,1,.35); } softEll(I,64,T3.neck+4.5,1.5,1.9,mix(o.bow,'#ffffff',.2),1,.4); for(let y=T3.neck+12;y<T3.neck+dr-4;y+=9) softEll(I,64,y,1,1,'#101014',.9,.4); }
      if(o.sq) softRect(I,80,T3.chest-34,9,4,o.sq,1,.5);
      if(o.pin) softEll(I,49,T3.chest-40,1.6,1.6,o.pin,1,.4);
      const by=T3.neck+dr+4; if(o.db){ for(const bx of [56,72]) for(const yy of [by,by+18,by+36]) softEll(I,bx,yy,2,2,o.db,1,.4); } else softEll(I,64,by,1.8,1.8,o.btn||'#2a2c34',1,.4);
      softLine(I,64,T3.neck+dr,64,T3.belt,'#000000',.5,1); }}),o.ink||7); }
const wkArm=(seed,j,cuff,fab)=>wkInk(armP(seed,(x,y)=>y>121?[cuff,'cotton',.2]:[j,fab||'wool'],{decor:I=>{ softLine(I,0,120.5,64,120.5,'#000000',.5,1); for(const x of [50,53,56]) softEll(I,x,114,1,1,'#2a2c34',.9,.4); }}),5);
const wkLeg=(seed,p)=>wkInk(legP(seed,()=>[p,'wool'],{decor:I=>{ softLine(I,32,0,32,128,mix(p,'#ffffff',.16),.7,1); softLine(I,0,0,0,128,'#000000',.3,1); }}),5);

let WKCAST=null;
function wkCastInit(){ if(WKCAST) return WKCAST;
  /* (unused now) */ SHAPES.tailor={rx:{0.86:.94,0.93:.93,1:.9,1.08:.9,1.18:.97,1.28:1.04,1.38:1.09,1.45:1.07},rz:{0.93:.95,1:.92,1.08:.92,1.18:.96,1.38:1.02},cz:{1.38:.004}};
  Object.assign(HEADS,WKH); for(const k in WKH) FACE[k]={fight:paintHead(WKH[k],'fight')};
  const shoe=tShoeBlack,gloveBk=flat(16,16,9202,'#0c0c0e','leather',{grime:0});
  const body=(hf,w,x={})=>Object.assign({hf,w,depth:1,lg:w,ag:w,jacket:.008,pants:.008,shoeW:.095},x);
  const head=k=>(J,o)=>{ if(WKH[k].ear) earpiece(J); if(WK_RICHNOW){ wkFace(J,o,WKH[k]); wkHead(J,o,Object.assign({},WKH[k],{eyes:'none',ring:false})); } };
  for(const k of ['wk_a','wk_b','wk_e','wk_h','wk_f']) WKH[k].ear=true; WKH.wk_boss.glasses='#2a2a2e';
  const suit=(k,sd,j,sh,x={})=>[wkTorso(k,sd,Object.assign({j,sh,lap:mix(j,'#ffffff',.1),p:j,btn:'#101014',drop:50,w0:13},x)),wkArm(sd+1,j,x.cuff||sh),wkLeg(sd+2,j)];
  const CH='#25272d',NV='#1a2030',BKS='#131418',GR='#3b3d43',WHT='#d9d8d2',BLU='#aab8cc';
  /* the kitchen hand: whites, a black apron, sleeves rolled over tattoos */
  const cT=torsoP('wk_cook',9250,(x,y)=>{ const dx=Math.abs(x-64); if(y>T3.chest-8&&dx<30) return ['#111216','twill',.5]; if(y>T3.belt+2) return ['#1a1c22','twill',.6]; return ['#e2e0d8','cotton']; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*14,T3.neck+2,64+s*26,T3.chest-8,'#111216',1,2); for(const bx of [56,72]) for(let y=T3.neck+14;y<T3.chest-12;y+=14) softEll(I,bx,y,1.6,1.6,'#b8b6ae',1,.4); blob(I,70,T3.chest+30,6,9,.5,'#5a0a0a'); }});
  const cA=armP(9251,(x,y)=>y<52?['#e2e0d8','cotton']:[WKH.wk_cook.skin,'skin',0],{decor:I=>{ softRect(I,0,48,64,5,'#c8c6be',.95,1); const r=rng(9252); for(let i=0;i<26;i++){ const x=6+r()*52,y=60+r()*56; softLine(I,x,y,x+(r()-.5)*12,y+(r()-.5)*12,'#1c2a3a',.7,1.3); } }}),cL=wkLeg(9253,'#1a1c22');
  const KNIFE={prop:pKnife,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND};
  const R=(as,name,role,k,o,tx,x={})=>Object.assign({as,side:'crew',name,role,color:'#8a8c90',o,torso:tx[0],arm:tx[1],leg:tx[2],foot:shoe,hand:tx[3],extra:head(k),wkHead:k},x);
  /* grounded: hired security and the men who run the place. Dark suits with open collars, an overcoat, a leather jacket, roll-necks, earpieces */
  const leather=[wkTorso('wk_g',9234,{j:'#2a1d15',fab:'leather',sh:'#15161a',lap:'#3a2a20',p:'#1c222c',btn:'#15161a',drop:34,w0:11}),wkArm(9235,'#2a1d15','#2a1d15','leather'),wkLeg(9236,'#1c222c')];
  const coat=[wkTorso('wk_f',9233,{j:'#14151b',sh:'#0a0a0c',lap:'#2a2c36',p:'#14151b',db:'#2a2c32',drop:26,w0:10}),wkArm(9231,'#14151b','#0a0a0c'),wkLeg(9232,'#14151b'),gloveBk];
  Object.assign(ROSTER,{
    wk_floor1:R('gunman','Anton','Floor security','wk_a',body(1.02,1.0),suit('wk_a',9261,CH,WHT),PISTOL),
    wk_floor2:R('gunman','Marcus','Floor security','wk_b',body(1.05,1.08),suit('wk_b',9264,BKS,'#1b1c21'),PISTOL),
    wk_floor3:R('gunman','Lev','Floor security','wk_c',body(1.0,.97),suit('wk_c',9267,NV,BLU),PISTOL),
    wk_floor4:R('gunman','Rafael','Floor security','wk_d',body(1.01,1.0),suit('wk_d',9270,GR,WHT),PISTOL),
    wk_guard1:R('enforcer','Oskar','Close protection','wk_e',body(1.06,1.1),suit('wk_e',9273,BKS,'#0c0c0e',{drop:16,w0:9}),TWO(pSMG,'smg')),
    wk_guard2:R('enforcer','Dmitri','Close protection','wk_h',body(1.05,1.08),suit('wk_h',9276,CH,'#0c0c0e',{drop:16,w0:9}),TWO(pSMG,'smg')),
    wk_door1:R('doorman','Bishop','Door','wk_f',body(1.08,1.2,{jacket:.024,belly:1.06,headS:1.03,shoeW:.105}),coat,TWO(pShotgun,'shotgun')),
    wk_door2:R('gunman','Cole','Door','wk_g',body(1.03,1.04,{jacket:.014}),leather,PISTOL),
    wk_boss:R('landlord','Valentin Sorel','The contract','wk_boss',body(1.0,1.02,{belly:1.08,jacket:.012}),suit('wk_boss',9240,'#3a4452',WHT,{sq:'#e8e6e0',drop:54}),REVOLVER),
    wk_cook:R('cutter','Tomas','Kitchen','wk_cook',body(1.02,1.04,{jacket:.006}),[cT,cA,cL],KNIFE) });
  for(const id in ROSTER) if(id.startsWith('wk_')&&!ROSTER[id].hand) delete ROSTER[id].hand; /* bare hands unless he wears gloves */
  return WKCAST=Object.keys(ROSTER).filter(k=>k.startsWith('wk_')); }

/* ---------- a richer build (WK.rich; &rich=0 for the plain one) ----------
   The tower's men are one skin over a few rings, with everything else painted on. These keep that skeleton and skin (so the body
   physics, wounds and poses are untouched) and add what paint can't do:
   - twice the rings and a third more sides, with the shapes a body has: chest, waist, seat, calf, forearm, shoulder
   - clothes with edges: lapels that stand off the chest, a shirt collar, the jacket's skirt over the hips, cuffs, buttons
   - a face with relief: brow, the bridge and wings of the nose, cheekbones, a chin; and hair with volume */
let WKR=null,WK_RICHNOW=false;
function wkDense(T){ const out=[]; for(let i=0;i<T.length;i++){ out.push(T[i].slice()); if(i<T.length-1){ const p0=T[Math.max(0,i-1)],p1=T[i],p2=T[i+1],p3=T[Math.min(T.length-1,i+2)];
      out.push(p1.map((v,k)=>k===0?(p1[0]+p2[0])/2:(-p0[k]+9*p1[k]+9*p2[k]-p3[k])/16)); } } return out; }
function wkRichTables(){ if(WKR) return WKR; const B=(y,a,b)=>Math.max(0,1-Math.abs((y-(a+b)/2)/((b-a)/2))); /* a bump between a and b */
  const torso=wkDense(TORSO).map(([y,rx,rz,cz])=>{ const ch=B(y,1.22,1.44),wa=B(y,.97,1.14),se=B(y,.86,.98),sh=B(y,1.36,1.48); return [y,rx*(1-.07*wa+.035*sh),rz*(1-.06*wa+.05*se+.04*ch),cz+.009*ch-.007*se]; });
  const leg=wkDense(LEG).map(([y,rx,rz,cz])=>{ const ca=B(y,.26,.44),an=B(y,.06,.2),th=B(y,.58,.84),kn=B(y,.45,.55); return [y,rx*(1+.05*ca-.1*an-.05*kn+.03*th),rz*(1+.12*ca-.1*an+.05*th),cz-.009*ca+.005*th]; });
  const arm=wkDense(ARM).map(([y,rx,rz])=>{ const fo=B(y,.98,1.12),wr=B(y,.88,.97),bi=B(y,1.22,1.4),de=B(y,1.4,1.52); return [y,rx*(1+.07*fo-.1*wr+.05*bi),rz*(1+.07*fo-.1*wr+.05*bi+.03*de)]; });
  return WKR={torso,leg,arm}; }
function wkRichRig(fn){ const R=wkRichTables(),set=(t,n)=>{ t.length=0; for(const r of n) t.push(r.slice()); },keep=[TORSO,LEG,ARM].map(t=>t.map(r=>r.slice()));
  set(TORSO,R.torso); set(LEG,R.leg); set(ARM,R.arm); try{ return fn(); } finally { [TORSO,LEG,ARM].forEach((t,i)=>set(t,keep[i])); } }
/* relief on the painted face. Rows of the head painting: brow .14, eye .124, nose tip .09, mouth .064, chin .037 (metres up the head) */
function wkFace(J,o,H){ const hs=o.headS||1,C=(t)=>M(null,{color:hexInt(mix(H.skin,H.skinD,t))}),P=(g,m,x,y,z,rx=0,ry=0,rz=0)=>mk(g,m,J.head,x*hs,y*hs,z*hs,rx,ry,rz),S=v=>v*hs;
  for(const s of [-1,1]) P(box(S(.046),S(.011),S(.02),{tw:.85}),C(.42),s*.029,.1425,.083,.22,0,s*-.1);                        /* the brow, a ridge over each eye */
  P(box(S(.013),S(.046),S(.016),{tw:.65}),C(.06),0,.117,.094,-.2); P(box(S(.02),S(.014),S(.017),{tw:.8}),C(.1),0,.094,.099);   /* the bridge, the tip */
  for(const s of [-1,1]) P(box(S(.01),S(.011),S(.013)),C(.26),s*.0125,.092,.092);                                              /* the wings */
  const blob=(rx,ry,rz)=>smoothNormals(lathe([[-ry,rx*.25,rz*.25],[-ry*.4,rx,rz],[ry*.45,rx*.9,rz*.9],[ry,rx*.2,rz*.2]],6));
  for(const s of [-1,1]) P(blob(S(.017),S(.012),S(.012)),C(.1),s*.047,.102,.064);                                              /* cheekbones */
  P(blob(S(.024),S(.014),S(.014)),C(.14),0,.036,.068);                                                                         /* the chin */
  for(const s of [-1,1]) P(box(S(.008),S(.03),S(.02),{tw:.8}),C(.3),s*.062,.062,.03,0,0,s*.2); }                               /* the corner of the jaw */
/* clothes with edges, on the joints. S: {j jacket colour, collar shirt colour or null, roll: roll-neck colour, lapel, cuff colour, hem (how far down the skirt comes, in body heights), sq} */
function wkDress(C,S){ const J=C.J,o=C.o,H=o.hf,col=(c,t=0)=>M(null,{color:hexInt(t?mix(c,'#ffffff',t):c),double:true}),mj=col(S.j,.05),mjl=col(S.j,.13),sy=1.09*H,hy=.99*H;
  const fz=(y,m=0)=>frontAt(o,y,m);
  if(S.lapel) for(const s of [-1,1]){ mk(box(.032,.23*H,.011,{tw:1.35}),col(S.j,.09),J.spine,s*.04,1.33*H-sy,fz(1.33,.005),-.1,0,s*-.19); } /* a lapel, and the shadow it throws */
  if(S.collar){ for(const s of [-1,1]) mk(box(.05,.03,.012,{tw:.6}),col(S.collar),J.neck,s*.034,.012,.052,.5,s*.5,s*.5); collar(J,o,col(S.collar),.04,.006); } /* shirt collar: a band and two points */
  if(S.roll) collar(J,o,col(S.roll),.07,.012);
  const t0=torsoAt(o,.86*H),hem=(S.hem||.83)*H,fl=S.hem&&S.hem<.8?1.1:1.03; /* the jacket's skirt: a ring over the hips, flared a little, open at the bottom */
  mk(smoothNormals(lathe([[hem-hy,t0[1]*fl+.016,t0[2]*fl+.018,t0[3]],[.9*H-hy,torsoAt(o,.9*H)[1]+.014,torsoAt(o,.9*H)[2]+.015,torsoAt(o,.9*H)[3]],[1.0*H-hy,torsoAt(o,H)[1]+.01,torsoAt(o,H)[2]+.011,torsoAt(o,H)[3]]],14,{capB:false,capT:false})),mj,J.hips);
  if(S.cuff) for(const s of ['L','R']) mk(smoothNormals(lathe([[-.266*H,.027,.033],[-.24*H,.029,.035]],10,{capB:false,capT:false})),col(S.cuff),J['elbow'+s]);
  if(S.lapel) for(const y of [1.2,1.13]) mk(box(.014,.014,.006),col('#0c0c0e'),J.spine,.004,y*H-sy,fz(y,.004));
  if(S.sq) mk(box(.034,.012,.008),col(S.sq),J.spine,.088,1.365*H-sy,fz(1.365,.004)-.01,0,.25,0); }

/* one of them, standing in the world: returns the character (C) */
function wkMakeChar(id,parent,grp='wick',rich=WK.rich){ wkCastInit(); const R_=ROSTER[id]; FACE[R_.wkHead]=FACE[R_.wkHead]||{fight:paintHead(WKH[R_.wkHead],'fight')};
  HEADS[id]=WKH[R_.wkHead]; FACE[id]=FACE[R_.wkHead]; /* the kit looks heads up by roster id */
  if(!rich) return makeChar(id,parent,grp);
  WK_RICHNOW=true; let C; try{ C=wkRichRig(()=>makeChar(id,parent,grp,{o:Object.assign({},R_.o,{seg:1})})); } finally { WK_RICHNOW=false; }
  if(WK_SUIT[id]) wkDress(C,WK_SUIT[id]); return C; }
const WK_SUIT={ wk_floor1:{j:'#25272d',collar:'#d9d8d2',lapel:1,cuff:'#d9d8d2'}, wk_floor2:{j:'#131418',collar:'#1b1c21',lapel:1,cuff:'#1b1c21'}, wk_floor3:{j:'#1a2030',collar:'#aab8cc',lapel:1,cuff:'#aab8cc'}, wk_floor4:{j:'#3b3d43',collar:'#d9d8d2',lapel:1,cuff:'#d9d8d2'},
  wk_guard1:{j:'#131418',roll:'#0c0c0e',lapel:1}, wk_guard2:{j:'#25272d',roll:'#0c0c0e',lapel:1}, wk_door1:{j:'#14151b',roll:'#0a0a0c',lapel:1,hem:.66}, wk_door2:{j:'#2a1d15',roll:'#15161a',hem:.86},
  wk_boss:{j:'#3a4452',collar:'#d9d8d2',lapel:1,cuff:'#d9d8d2',sq:'#e8e6e0'} };
