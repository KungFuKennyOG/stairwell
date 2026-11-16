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
function wkInk(t,levels=6,gain=1.1){ const w=t.c.width,h=t.c.height,c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.drawImage(t.c,0,0);
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
  if(H.do==='pomp'){ cr([[.168,.083,.103],[.205,.09,.11],[.245,.086,.108],[.278,.062,.086],[.292,0,0]]); mk(box(.11*hs,.05*hs,.07*hs,{tw:.8}),m,J.head,0,.262*hs,.07*hs,-.35); mk(box(.06*hs,.012*hs,.1*hs),hi,J.head,.02*hs,.288*hs,.03*hs,-.2); }
  else if(H.do==='flat'){ cr([[.175,.08,.1],[.215,.084,.104],[.25,.08,.1],[.258,0,0]]); mk(box(.15*hs,.035*hs,.17*hs),m,J.head,0,.262*hs,-.004*hs); }
  else if(H.do==='part'){ cr([[.17,.082,.102],[.21,.088,.108],[.248,.076,.098],[.268,0,0]]); mk(box(.1*hs,.04*hs,.15*hs,{tw:.9}),m,J.head,-.03*hs,.262*hs,.0,0,0,.25); mk(box(.004*hs,.03*hs,.12*hs),hi,J.head,.022*hs,.27*hs,.01*hs); }
  else if(H.do==='sweep'){ cr([[.168,.083,.103],[.21,.09,.11],[.25,.082,.106],[.275,.05,.08],[.284,0,0]]); mk(box(.13*hs,.04*hs,.12*hs,{td:.7}),m,J.head,0,.262*hs,-.03*hs,.3); for(const s of [-1,1]) mk(box(.012*hs,.06*hs,.09*hs),hi,J.head,s*.082*hs,.17*hs,-.02*hs); }
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
  SHAPES.tailor={rx:{0.86:.94,0.93:.93,1:.9,1.08:.9,1.18:.97,1.28:1.04,1.38:1.09,1.45:1.07},rz:{0.93:.95,1:.92,1.08:.92,1.18:.96,1.38:1.02},cz:{1.38:.004}};
  Object.assign(HEADS,WKH); for(const k in WKH) FACE[k]={fight:wkInk(paintHead(WKH[k],'fight'),9,1.0)};
  const shoe=wkInk(tShoeBlack,4),glove=flat(16,16,9201,WKS.white,'cotton',{grime:0}),gloveBk=flat(16,16,9202,'#0c0c0e','leather',{grime:0});
  const body=(hf,w,x={})=>Object.assign({hf,w,depth:.98,lg:.9*w,ag:.86*w,headS:.93,jacket:.012,pants:.006,shoeW:.092,shape:'tailor'},x);
  const head=k=>(J,o)=>wkHead(J,o,WKH[k]);
  /* floor men: black on black, a gold tie and bar, white gloves */
  const fT=(k,s,sq)=>wkTorso(k,s,{j:WKS.black,sh:WKS.black2,tie:WKS.gold,lap:'#30323c',p:WKS.black,sq,pin:'#e8c878'}),fA=wkArm(9211,WKS.black,WKS.white),fL=wkLeg(9212,WKS.black);
  /* bodyguards: white dinner jacket, black satin lapels, black bow tie, black trousers */
  const gT=(k,sd)=>wkTorso(k,sd,{j:WKS.cream,sh:WKS.white,bow:WKS.satin,lap:WKS.satin,p:WKS.black,sq:WKS.wine,btn:'#101014',drop:64,w0:17}),gA=wkArm(9221,WKS.cream,WKS.white),gL=wkLeg(9222,WKS.black);
  /* door men: a long double-breasted black overcoat with gold buttons over a roll neck */
  const dT=(k,sd)=>wkTorso(k,sd,{j:'#12131a',sh:'#08080a',lap:'#343642',p:'#12131a',db:'#d8b060',drop:26,w0:10}),dA=wkArm(9231,'#12131a','#08080a'),dL=wkLeg(9232,'#12131a');
  /* the man you came for: wine velvet smoking jacket, black satin shawl lapels, a gold cravat */
  const bT=wkTorso('wk_boss',9240,{j:WKS.wine,fab:'knit',sh:WKS.gold,lap:WKS.satin,p:WKS.black,sq:WKS.gold,btn:'#d8b060',drop:60,w0:18}),bA=wkArm(9241,WKS.wine,WKS.white,'knit'),bL=wkLeg(9242,WKS.black);
  /* the kitchen hand: whites, a black apron, sleeves rolled over tattoos */
  const cT=wkInk(torsoP('wk_cook',9250,(x,y)=>{ const dx=Math.abs(x-64); if(y>T3.chest-8&&dx<30) return ['#111216','twill',.5]; if(y>T3.belt+2) return ['#1a1c22','twill',.6]; return ['#e2e0d8','cotton']; },{decor:I=>{ neckShadow(I); for(const s of [-1,1]) softLine(I,64+s*14,T3.neck+2,64+s*26,T3.chest-8,'#111216',1,2); for(const bx of [56,72]) for(let y=T3.neck+14;y<T3.chest-12;y+=14) softEll(I,bx,y,1.6,1.6,'#b8b6ae',1,.4); blob(I,70,T3.chest+30,6,9,.5,'#5a0a0a'); }}),5);
  const cA=wkInk(armP(9251,(x,y)=>y<52?['#e2e0d8','cotton']:[WKH.wk_cook.skin,'skin',0],{decor:I=>{ softRect(I,0,48,64,5,'#c8c6be',.95,1); const r=rng(9252); for(let i=0;i<26;i++){ const x=6+r()*52,y=60+r()*56; softLine(I,x,y,x+(r()-.5)*12,y+(r()-.5)*12,'#1c2a3a',.7,1.3); } }}),5),cL=wkLeg(9253,'#1a1c22');
  const KNIFE={prop:pKnife,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND};
  const R=(as,name,role,k,o,tx,x={})=>Object.assign({as,side:'crew',name,role,color:'#c89a3c',o,torso:tx[0],arm:tx[1],leg:tx[2],foot:shoe,hand:tx[3]||glove,extra:head(k),wkHead:k},x);
  Object.assign(ROSTER,{
    wk_floor1:R('gunman','Anton','Floor · Velour','wk_a',body(1.05,1.0),[fT('wk_a',9261,WKS.gold),fA,fL],PISTOL),
    wk_floor2:R('gunman','Marcus','Floor · Velour','wk_b',body(1.08,1.06),[fT('wk_b',9262,WKS.gold),fA,fL],PISTOL),
    wk_floor3:R('gunman','Lev','Floor · Velour','wk_c',body(1.03,.97),[fT('wk_c',9263,WKS.gold),fA,fL],PISTOL),
    wk_floor4:R('gunman','Rafael','Floor · Velour','wk_d',body(1.04,1.0),[fT('wk_d',9264,WKS.gold),fA,fL],PISTOL),
    wk_guard1:R('enforcer','Oskar','Bodyguard','wk_e',body(1.1,1.1),[gT('wk_e',9223),gA,gL],TWO(pSMG,'smg')),
    wk_guard2:R('enforcer','Dmitri','Bodyguard','wk_h',body(1.09,1.08),[gT('wk_h',9224),gA,gL],TWO(pSMG,'smg')),
    wk_door1:R('doorman','Bishop','Door · Velour','wk_f',body(1.12,1.2,{jacket:.03,belly:1.04,headS:.97,shoeW:.105}),[dT('wk_f',9233),dA,dL,gloveBk],TWO(pShotgun,'shotgun')),
    wk_door2:R('gunman','Cole','Door · Velour','wk_g',body(1.07,1.04,{jacket:.024}),[dT('wk_g',9234),dA,dL,gloveBk],PISTOL),
    wk_boss:R('landlord','Valentin Sorel','The contract','wk_boss',body(1.02,1.0,{belly:1.06,jacket:.016}),[bT,bA,bL,null],REVOLVER),
    wk_cook:R('cutter','Tomas','Kitchen','wk_cook',body(1.04,1.04,{jacket:.006,shape:null}),[cT,cA,cL,null],KNIFE) });
  for(const id of ['wk_boss','wk_cook']) delete ROSTER[id].hand; /* bare hands */
  return WKCAST=Object.keys(ROSTER).filter(k=>k.startsWith('wk_')); }

/* one of them, standing in the world: returns the character (C) */
function wkMakeChar(id,parent,grp='wick'){ wkCastInit(); const R_=ROSTER[id]; FACE[R_.wkHead]=FACE[R_.wkHead]||{fight:wkInk(paintHead(WKH[R_.wkHead],'fight'),9,1.0)};
  HEADS[id]=WKH[R_.wkHead]; FACE[id]=FACE[R_.wkHead]; /* the kit looks heads up by roster id */
  const C=makeChar(id,parent,grp); wkRim(parent,1); return C; }
