/* =====================================================================
   WICK: a second way to build a person, so this game's people aren't the tower's.
   The tower: one smooth skinned body, a lathed head, a face painted like a portrait.
   Here: hard-edged parts on the same joints (so the body physics, poses and guns still fit): a wedge of a torso with square
   shoulders, tapered slabs for limbs, a block head with a cut jaw, a brow, a nose, and a face drawn in a handful of pixels.
   Flat colours and small crisp pixel textures instead of painted cloth. Think early PlayStation stealth game, not painted miniature.
   ===================================================================== */
const wkPx=(w,h,base,fn)=>tex(w,h,base,g=>fn(g,w,h));
/* the front of a jacket, 24x32: a V of shirt, a tie or bow, lapel edges, buttons, a pocket square */
function wkFrontTex(o){ return wkPx(24,32,o.j,(g)=>{ const V=o.v||17,hw=o.hw||6;
  for(let y=0;y<V;y++){ const a=Math.round(hw*(1-y/V)); if(a>0){ R(g,o.sh,12-a,y,a*2,1); R(g,o.lap,12-a-1,y,1,1); R(g,o.lap,12+a,y,1,1); } }
  if(o.tie){ R(g,o.tie,11,1,2,V-2); R(g,o.tieHi||o.tie,11,1,1,V-2); R(g,o.tie,10,0,4,2); if(o.bar) R(g,o.bar,10,8,4,1); }
  if(o.bow){ R(g,o.bow,8,0,8,3); R(g,o.sh,11,1,2,1); for(let y=5;y<V-2;y+=4) R(g,o.bow,12,y,1,1); }
  if(o.db){ for(const x of [8,15]) for(const y of [V+2,V+7,V+12]) R(g,o.db,x,y,1,1); } else R(g,o.btn||o.lap,12,V+2,1,1);
  if(o.sq) R(g,o.sq,16,9,3,2); R(g,o.lap,12,V,1,32-V); /* the closing edge */
  R(g,'rgba(0,0,0,.28)',0,29,24,3); R(g,'rgba(255,255,255,.05)',0,0,24,6); }); }
/* a face in 16x16. hair: rows from the top; shades: a black band; beard: 0 none, 1 stubble, 2 full */
function wkFaceTex(o){ const sk=o.skin,dk=mix(sk,'#000000',.3),dd=mix(sk,'#000000',.55),lt=mix(sk,'#ffffff',.14);
  return wkPx(16,16,sk,(g)=>{ R(g,o.hair||dk,0,0,16,o.hairRows??3); if(o.hair&&(o.hairRows??3)>0){ R(g,o.hair,0,0,2,6); R(g,o.hair,14,0,2,6); }
    R(g,dk,2,6,12,1); R(g,dd,3,7,3,1); R(g,dd,10,7,3,1); R(g,'#0a0a0a',4,7,1,1); R(g,'#0a0a0a',11,7,1,1); R(g,dk,3,8,3,1); R(g,dk,10,8,3,1);
    R(g,lt,7,6,2,5); R(g,dk,6,11,4,1); R(g,o.lip||dd,6,13,4,1); R(g,dk,0,14,16,2); R(g,dk,0,6,1,10); R(g,dk,15,6,1,10);
    if(o.beard===2){ R(g,o.hair||dd,2,11,12,5); R(g,o.lip||dd,6,13,4,1); } else if(o.beard===1){ R(g,'rgba(0,0,0,.22)',2,11,12,5); }
    if(o.shades){ R(g,'#060608',1,6,14,3); R(g,'#2a3040',2,6,4,1); R(g,'#2a3040',9,6,4,1); }
    if(o.glasses){ R(g,o.glasses,2,6,5,3); R(g,o.glasses,9,6,5,3); R(g,'#3a2a14',3,7,3,1); R(g,'#3a2a14',10,7,3,1); R(g,o.glasses,7,7,2,1); }
    if(o.scar) R(g,'#7a3030',12,4,1,6); }); }
const wkSideTex=o=>wkPx(8,16,o.skin,(g)=>{ const dk=mix(o.skin,'#000000',.3); R(g,o.hair||dk,0,0,8,(o.hairRows??3)+3); R(g,dk,3,8,2,3); R(g,dk,0,14,8,2); });

/* build one. S: {hf,w, j,sh,lap,tie,bow,sq,db,p, skin,hair,hairRows,do,shades,glasses,beard,scar, glove, kind, gear:{prop...}} */
function wkFig(S,parent,grp='wick'){ const o=Object.assign(baseMats('gunman'),{hf:S.hf||1.06,w:S.w||1,depth:1,lg:1,ag:1,headS:1,torsoM:M(null),armM:M(null),legM:M(null),footM:M(null)});
  const J=rig(o,parent),H=o.hf,W=o.w,isJ=new Set(BONES.map(b=>J[b])); J.body.vis=false;
  for(const b of BONES) for(const k of J[b].kids) if(!isJ.has(k)) k.vis=false; /* the tower's head, hands and shoes: kept for the game's code, not drawn */
  const C_=c=>M(null,{color:hexInt(c)}),mj=C_(S.j),mp=C_(S.p||S.j),msk=C_(S.skin),mgl=C_(S.glove||S.skin),mhair=C_(S.hair||'#111'),msh=C_(S.sh),mcuff=C_(S.cuff||S.sh),mshoe=C_('#08080a'),mjd=C_(mix(S.j,'#000000',.35));
  const P=(geo,mat,j,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>mk(geo,mat,J[j],x,y,z,rx,ry,rz);
  const front=M(wkFrontTex(S));
  /* torso: narrow at the belt, square at the shoulder; the jacket's skirt over the hips */
  P(box(.3*W,.41*H,.19,{tw:1.5,td:1.12,at:[0,.205*H,0]}),F(mj,front,mjd,mj,mj),'spine',0,-.01,0);
  P(box(.33*W,.2*H,.205,{tw:.93,at:[0,0,0]}),F(mj,mj,mjd,mj,mp),'hips',0,-.005,0);
  P(box(.075,.1,.075,{at:[0,.03,0]}),msk,'neck'); P(box(.13,.035,.11,{tw:1.1,at:[0,.0,0]}),msh,'neck',0,-.005,.004);
  for(const s of ['L','R']){ const sg=s==='L'?1:-1;
    P(box(.13,.085,.15,{tw:.8,at:[0,-.015,0]}),mj,'arm'+s,sg*.012,0,0);                                  /* the shoulder: a pad, not a ball */
    P(box(.082,.31*H,.088,{tw:1.2,at:[0,-.155*H,0]}),mj,'arm'+s,sg*.006,0,0);
    P(box(.068,.265*H,.072,{tw:1.22,at:[0,-.132*H,0]}),mj,'elbow'+s);
    P(box(.074,.022,.078,{at:[0,-.262*H,0]}),mcuff,'elbow'+s);
    P(box(.036,.105,.078,{tw:1.25,td:1.0,at:[0,-.05,.012]}),mgl,'hand'+s); P(box(.03,.04,.03,{at:[sg*-.0,-.03,.05]}),mgl,'hand'+s);
    P(box(.118,.44*H,.128,{tw:1.28,at:[0,-.22*H,0]}),mp,'thigh'+s);
    P(box(.084,.43*H,.09,{tw:1.32,at:[0,-.215*H,0]}),mp,'knee'+s);
    P(box(.086,.07,.26,{td:1.0,at:[0,-.045,.065]}),mshoe,'ankle'+s); P(box(.088,.022,.1,{at:[0,-.07,-.02]}),C_('#1a1a1e'),'ankle'+s); }
  /* the head: a block with a cut jaw; brow, nose and chin are geometry, the rest is sixteen pixels across */
  const face=M(wkFaceTex(S)),side=M(wkSideTex(S)),hd=N(J.head,0,0,0);
  mk(box(.112,.215,.148,{tw:1.36,td:1.2,at:[0,.118,0]}),F(side,face,mhair,mhair,msk),hd,0,0,.004);
  mk(box(.128,.016,.03),C_(mix(S.skin,'#000000',.25)),hd,0,.142,.085);            /* brow */
  mk(box(.022,.05,.03,{tw:.55}),C_(mix(S.skin,'#ffffff',.08)),hd,0,.108,.094);  /* nose */
  mk(box(.07,.024,.03),msk,hd,0,.022,.066);                                      /* chin */
  for(const s of [-1,1]) mk(box(.012,.04,.026),C_(mix(S.skin,'#000000',.2)),hd,s*.08,.118,-.004); /* ears */
  const D=S.do;
  if(D==='flat'){ mk(box(.156,.045,.18),mhair,hd,0,.245,.002); }
  else if(D==='pomp'){ mk(box(.15,.05,.17,{td:.8}),mhair,hd,0,.243,-.008); mk(box(.12,.055,.08,{tw:.75}),mhair,hd,0,.262,.06,-.45); }
  else if(D==='slick'){ mk(box(.154,.03,.185,{tw:.92}),mhair,hd,0,.236,-.004,.1); mk(box(.154,.08,.03),mhair,hd,0,.18,-.092); }
  else if(D==='sweep'){ mk(box(.156,.04,.19,{tw:.9}),mhair,hd,0,.24,-.012,.16); mk(box(.156,.11,.035),mhair,hd,0,.17,-.094); }
  else if(D==='band'){ mk(box(.158,.05,.186),C_('#16161a'),hd,0,.228,.0); mk(box(.03,.07,.02),C_('#16161a'),hd,.03,.2,-.1,.3); }
  if(S.shades){ mk(box(.158,.03,.012),M(null,{color:0x050506,emissive:0x0a0e16}),hd,0,.128,.091); for(const s of [-1,1]) mk(box(.008,.012,.1),C_('#050506'),hd,s*.079,.132,.04); }
  if(S.glasses){ const gm=M(null,{color:hexInt(S.glasses),emissive:0x2a1c08}); for(const s of [-1,1]) mk(box(.056,.034,.008),gm,hd,s*.036,.126,.092); }
  const s=Object.assign({kind:S.kind||'gunman',faces:FACE.gunman,grp,fight:{},showDrop:false},S.gear||{}); if(s.two) s.fightHipsY=J.hips.p[1]-.055;
  const C=finish(parent,J,o,s); C.fig=true; civPoses(C); wkRim(parent,1); return C; }

const WKF=(()=>{ const B='#0d0e12',G='#c89a3c',Wh='#ecebe4';
  const floor=(x)=>Object.assign({j:B,sh:'#17181e',lap:'#2e303a',tie:G,tieHi:'#e8c878',bar:'#fff0b8',sq:G,p:B,cuff:Wh,glove:Wh,kind:'gunman',gear:PISTOL},x);
  const guard=(x)=>Object.assign({j:'#e6e2d6',sh:'#f4f2ec',lap:'#101014',bow:'#101014',sq:'#7a1024',btn:'#101014',p:B,cuff:Wh,glove:Wh,v:19,hw:7,kind:'enforcer',gear:TWO(pSMG,'smg')},x);
  const door=(x)=>Object.assign({j:'#11121a',sh:'#060608',lap:'#30323e',db:'#d8b060',p:'#11121a',cuff:'#11121a',glove:'#0a0a0c',v:7,hw:3,kind:'doorman'},x);
  return {
    wk_floor1:floor({skin:'#c9a184',hair:'#0c0a0a',do:'pomp',shades:true,hf:1.06,w:1.0}),
    wk_floor2:floor({skin:'#6a4430',hair:'#120c08',hairRows:0,do:'bald',beard:2,hf:1.09,w:1.06}),
    wk_floor3:floor({skin:'#e4c2a6',hair:'#d8c48a',do:'flat',scar:true,hf:1.04,w:.97}),
    wk_floor4:floor({skin:'#b88662',hair:'#1a120e',do:'slick',beard:1,hf:1.05,w:1.0}),
    wk_guard1:guard({skin:'#d8b494',hair:'#141010',do:'flat',shades:true,beard:1,hf:1.11,w:1.1}),
    wk_guard2:guard({skin:'#caa080',hair:'#2a1e16',hairRows:0,do:'bald',shades:true,scar:true,hf:1.1,w:1.08}),
    wk_door1:door({skin:'#8a5c40',hair:'#0e0a08',do:'pomp',beard:2,hf:1.13,w:1.2,gear:TWO(pShotgun,'shotgun')}),
    wk_door2:door({skin:'#e8c8b0',hair:'#6a2a14',do:'slick',shades:true,hf:1.08,w:1.04,gear:PISTOL}),
    wk_boss:{j:'#5c0f20',sh:G,lap:'#101014',sq:G,btn:'#d8b060',p:B,cuff:Wh,skin:'#d6ae94',hair:'#c8c8cc',do:'sweep',glasses:'#d8b060',beard:1,v:18,hw:7,hf:1.03,w:1.0,kind:'landlord',gear:REVOLVER},
    wk_cook:{j:'#e2e0d8',sh:'#e2e0d8',lap:'#b8b6ae',db:'#b8b6ae',p:'#1a1c22',cuff:'#c49a78',skin:'#c49a78',hair:'#1a1410',do:'band',beard:1,v:5,hw:3,hf:1.05,w:1.04,kind:'cutter',gear:{prop:pKnife,gripHand:true,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND}} }; })();

/* ---------- the same idea, less blocky: rounded low-poly parts (8 to 10 sides, smooth shaded) instead of slabs ----------
   Still separate hard-edged pieces on the joints, still pixel faces and flat cloth; the silhouette is turned, not boxed. */
/* a front texture wrapped round a lathe: the picture sits in the middle (the front), the base colour goes round the back */
function wkWrapTex(src,w,base,back){ return tex(w,src.c.height,base,g=>{ if(back){ g.fillStyle=back; g.fillRect(0,0,w,src.c.height); } g.drawImage(src.c,(w-src.c.width)>>1,0); }); }
function wkFigSoft(S,parent,grp='wick'){ const o=Object.assign(baseMats('gunman'),{hf:S.hf||1.06,w:S.w||1,depth:1,lg:1,ag:1,headS:1,torsoM:M(null),armM:M(null),legM:M(null),footM:M(null)});
  const J=rig(o,parent),H=o.hf,W=o.w,isJ=new Set(BONES.map(b=>J[b])); J.body.vis=false;
  for(const b of BONES) for(const k of J[b].kids) if(!isJ.has(k)) k.vis=false;
  const C_=c=>M(null,{color:hexInt(c)}),mj=C_(S.j),mp=C_(S.p||S.j),msk=C_(S.skin),mgl=C_(S.glove||S.skin),mhair=C_(S.hair||'#111'),msh=C_(S.sh),mcuff=C_(S.cuff||S.sh),mshoe=C_('#08080a');
  const L=(rings,seg,mat,j,x=0,y=0,z=0,rx=0)=>mk(smoothNormals(lathe(rings,seg)),mat,J[j],x,y,z,rx);
  /* torso: a turned shape, waisted, with real shoulders; the jacket front wraps round it */
  const front=M(wkWrapTex(wkFrontTex(S),64,S.j));
  L([[-.01,.128*W,.092],[.1*H,.138*W,.096],[.22*H,.176*W,.108,.006],[.33*H,.214*W,.116,.004],[.385*H,.2*W,.104],[.42*H,.09*W,.07]],10,front,'spine');
  L([[-.12*H,.15*W,.098],[-.03*H,.158*W,.104],[.05*H,.135*W,.094]],10,mj,'hips');
  L([[-.01,.05,.05],[.02,.06,.056],[.045,.058,.054]],8,msh,'neck'); L([[.0,.036,.038],[.1,.034,.036]],8,msk,'neck');
  for(const s of ['L','R']){ const sg=s==='L'?1:-1;
    L([[-.31*H,.036,.038],[-.16*H,.045,.047],[-.03,.052,.056],[.025,.05,.054],[.05,.02,.024]],8,mj,'arm'+s,sg*.004);       /* upper arm with a rounded shoulder cap */
    L([[-.265*H,.03,.032],[-.12*H,.038,.04],[0,.037,.039]],8,mj,'elbow'+s);
    L([[-.275*H,.034,.036],[-.25*H,.034,.036]],8,mcuff,'elbow'+s);
    L([[-.105,.018,.03],[-.06,.022,.04],[-.01,.02,.034],[.005,.016,.028]],8,mgl,'hand'+s,0,0,.008); mk(box(.022,.045,.022),mgl,J['hand'+s],sg*-.018,-.035,.03);
    L([[-.44*H,.045,.048],[-.2*H,.058,.062],[-.02,.066,.07],[.02,.05,.056]],8,mp,'thigh'+s);
    L([[-.43*H,.032,.036],[-.3*H,.046,.05],[-.05,.045,.048],[0,.042,.045]],8,mp,'knee'+s);
    L([[-.085,.044,.125,.06],[-.05,.046,.128,.06],[-.012,.036,.07,.03],[.0,.03,.04,.01]],8,mshoe,'ankle'+s); }
  /* the head: turned too, with a jaw, and the pixel face wrapped round the front; brow and nose stay geometry */
  const hd=N(J.head,0,0,0),face=M(wkWrapTex(wkFaceTex(S),40,S.skin,null)),sideHair=S.hair&&(S.hairRows??3)>0;
  mk(smoothNormals(lathe([[.0,.026,.032,.022],[.028,.05,.062,.014],[.07,.064,.08,.006],[.125,.07,.09,0],[.18,.07,.09,-.004],[.225,.056,.074,-.008],[.248,.02,.03,-.008]],10)),face,hd);
  mk(box(.11,.014,.02,{tw:.9}),C_(mix(S.skin,'#000000',.22)),hd,0,.146,.082,.15);
  mk(box(.02,.05,.028,{tw:.5}),C_(mix(S.skin,'#ffffff',.08)),hd,0,.11,.09,-.12);
  for(const s of [-1,1]) mk(box(.01,.036,.022),C_(mix(S.skin,'#000000',.18)),hd,s*.071,.12,-.006);
  const cap=(rings,m=mhair)=>mk(smoothNormals(lathe(rings,10)),m,hd),D=S.do;
  if(sideHair&&D!=='band') cap([[.15,.073,.094,-.012],[.19,.075,.096,-.01],[.235,.06,.08,-.01],[.256,.02,.03,-.01]]);   /* the hair's base: a cap sitting back from the forehead */
  if(D==='flat'){ cap([[.225,.066,.084,-.006],[.262,.07,.088,-.006],[.27,.066,.084,-.006]]); }
  else if(D==='pomp'){ cap([[.215,.05,.05,.04],[.25,.062,.07,.03],[.285,.05,.062,.012],[.296,.02,.03,0]]); }
  else if(D==='slick'){ cap([[.1,.066,.03,-.07],[.17,.074,.05,-.056],[.23,.06,.07,-.03]]); }
  else if(D==='sweep'){ cap([[.08,.068,.034,-.07],[.17,.076,.054,-.054],[.24,.064,.08,-.02],[.268,.03,.05,.0]]); }
  else if(D==='band'){ cap([[.19,.074,.095,-.004],[.225,.072,.092,-.004],[.25,.05,.07,-.006],[.26,.01,.02,-.006]],C_('#16161a')); mk(box(.026,.06,.016),C_('#16161a'),hd,.03,.2,-.1,.3); }
  if(S.shades){ const gm=M(null,{color:0x050506,emissive:0x0a0e16}); mk(smoothNormals(lathe([[.116,.0725,.093,.001],[.146,.0725,.093,.001]],10,{capB:false,capT:false})),gm,hd); }
  if(S.glasses){ const gm=M(null,{color:hexInt(S.glasses),emissive:0x2a1c08}); for(const s of [-1,1]) mk(box(.05,.03,.008),gm,hd,s*.034,.128,.088); mk(box(.02,.006,.006),gm,hd,0,.134,.09); }
  const s=Object.assign({kind:S.kind||'gunman',faces:FACE.gunman,grp,fight:{},showDrop:false},S.gear||{}); if(s.two) s.fightHipsY=J.hips.p[1]-.055;
  const C=finish(parent,J,o,s); C.fig=true; civPoses(C); wkRim(parent,1); return C; }
