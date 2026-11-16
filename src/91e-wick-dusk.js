/* =====================================================================
   WICK: the cast, built the way Dusk builds its people (Kenny's reference, 2026-11-16), as this game's people.
   Not the tower's smooth skin and painted portrait. Each man is a handful of chunky, hard-faceted pieces on the same 16 joints
   (so poses, guns and the body physics still fit): a wedge of a torso with heavy shoulders, thick arms that flare to the cuff, big
   fists, legs that flare to the shoe, a small faceted head. Every piece wears a tiny, noisy, hand-pixelled texture with its
   shading painted in: grain, mottle, a dark hem. Faces are a few hard pixels: eye holes, a brow, a mouth, or shades, or a mask.
   ===================================================================== */
/* hard facets: every triangle its own flat normal */
function wkFacet(g){ const o=new Geo(); for(let i=0;i<g.I.length;i+=3){ const id=[g.I[i],g.I[i+1],g.I[i+2]],p=id.map(k=>[g.P[k*3],g.P[k*3+1],g.P[k*3+2]]),n=norm3(v3.cross(v3.sub(p[1],p[0]),v3.sub(p[2],p[0])));
    id.forEach((k,j)=>{ o.I.push(o.v(p[j],n,[g.T[k*2],g.T[k*2+1]])); }); } o.groups=[{start:0,count:o.I.length,mi:0}]; return o; }
/* a small gritty texture: the base colour in five hard tones, grain and mottle, darker toward the bottom; then crisp pixel details */
function wkGrit(w,h,base,seed,o={},decor){ return tex(w,h,null,g=>{ const r=rng(seed),id=g.createImageData(w,h),c=F3(base),T=[.5,.68,.84,1,1.16];
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ let t=.8+(r()-.5)*(o.grain??.5)+fbm(x*.18,y*.18,seed,3)*(o.mottle??.35)-(o.grad??.28)*Math.pow(y/h,1.5);
      if(o.pin&&x%o.pin===0) t+=.22; if(o.plaid&&((x>>2)+(y>>2))%2) t-=.3;
      const k=T[clamp(Math.round(t*4-.6),0,4)],j=(y*w+x)*4; id.data[j]=clamp(c[0]*k*255,0,255); id.data[j+1]=clamp(c[1]*k*255,0,255); id.data[j+2]=clamp(c[2]*k*255,0,255); id.data[j+3]=255; }
    g.putImageData(id,0,0); if(decor) decor(g,r); }); }
/* the jacket's front, wrapped round the torso: 64 across (the front is the middle), 48 down */
function wkDuskTorso(S,seed){ return wkGrit(64,48,S.j,seed,{pin:S.pin},(g,r)=>{ const V=S.v??15,hw=S.hw??4,y0=5,dk=mix(S.j,'#000000',.45),lt=mix(S.j,'#ffffff',.14);
    for(let y=0;y<V;y++){ const a=Math.round(hw*(1-y/V)); if(a>0){ for(let x=32-a;x<32+a;x++) R(g,r()>.25?S.sh:mix(S.sh,'#000000',.2),x,y0+y,1,1); R(g,lt,32-a-1,y0+y,1,1); R(g,lt,32+a,y0+y,1,1); R(g,dk,32-a-2,y0+y,1,1); R(g,dk,32+a+1,y0+y,1,1); } }
    if(S.tie){ for(let y=1;y<V-1;y++) R(g,r()>.3?S.tie:mix(S.tie,'#000000',.3),31,y0+y,2,1); R(g,S.tie,30,y0,4,2); }
    for(let y=y0+V;y<48;y++) R(g,dk,32,y,1,1); for(const y of [y0+V+3,y0+V+9]) R(g,'#060608',31,y,2,2);
    if(S.sq) R(g,S.sq,41,y0+9,4,2); if(S.db) for(const x of [27,36]) for(const y of [y0+V+2,y0+V+8,y0+V+14]) R(g,S.db,x,y,1,1);
    R(g,'rgba(0,0,0,.35)',0,0,64,3); }); }
/* a head, 32 round by 32 up: the face is the middle. S: skin, hair, bald, beard, shades, mask, scar */
function wkDuskHead(S,seed){ return wkGrit(32,32,S.mask||S.skin,seed,{grain:.3,mottle:.25,grad:.3},(g,r)=>{ const sk=S.skin,dk=mix(sk,'#000000',.45),hair=S.hair||'#12100e',px=(c,x,y,w=1,h=1)=>R(g,c,x,y,w,h);
    if(S.mask){ for(let x=10;x<22;x++) for(let y=12;y<16;y++) px(r()>.3?sk:dk,x,y); px('#050505',12,13,2,2); px('#050505',18,13,2,2); px(mix(S.mask,'#000000',.4),13,22,6,1); return; }
    if(!S.bald){ for(let x=0;x<32;x++){ const side=x<9||x>22,bottom=side?(x<4||x>27?22:16):7+((x*7)%3===0?1:0); for(let y=0;y<bottom;y++) px(r()>.35?hair:mix(hair,'#ffffff',.12),x,y); } }
    else for(let x=0;x<32;x++) for(let y=0;y<4;y++) px(mix(sk,'#ffffff',.1),x,y);
    px(dk,10,11,12,1); px(mix(sk,hair,.7),11,11,4,1); px(mix(sk,hair,.7),17,11,4,1);                    /* brow */
    px('#060606',12,12,2,2); px('#060606',18,12,2,2); px(dk,11,14,4,1); px(dk,17,14,4,1);                /* eye holes, the shadow under them */
    px(mix(sk,'#ffffff',.18),15,12,2,6); px(dk,14,18,4,1);                                             /* the nose, lit, and its shadow */
    px(mix(sk,'#5a1414',.6),13,22,6,1); px(dk,14,23,4,1);                                              /* mouth */
    if(S.beard) for(let x=9;x<23;x++) for(let y=19;y<30;y++) if(r()<S.beard&&!(y===22&&x>12&&x<19)) px(mix(sk,hair,.75),x,y);
    if(S.shades){ px('#040405',9,12,14,3); px('#3a4458',10,12,3,1); px('#3a4458',17,12,3,1); }
    if(S.scar) for(let y=8;y<20;y++) px('#7a2a2a',20,y); for(let x=0;x<32;x++) px('rgba(0,0,0,.4)',x,29,1,3); for(const x of [8,23]) px(mix(sk,'#000000',.25),x,14,1,4); }); }
/* build one. S: {hf, k (bulk), j, sh, tie, p, pin, sq, db, hem, skin, hair, bald, beard, shades, mask, scar, glove, kind, gear} */
function wkDuskMan(S,parent,grp='wick'){ const o=Object.assign(baseMats('gunman'),{hf:S.hf||1,w:S.w||1,torsoM:M(null),armM:M(null),legM:M(null),footM:M(null)});
  const J=rig(o,parent),H=o.hf,K=(S.k||1)*1.16,isJ=new Set(BONES.map(b=>J[b])); J.body.vis=false;
  const strip=n=>{ if(n===J.headMesh){ n.s=[0,0,0]; return; } n.mesh=null; n.kids.forEach(strip); }; /* the head keeps its mesh (the game swaps its face), shrunk to nothing */ for(const b of BONES) for(const k of J[b].kids) if(!isJ.has(k)) strip(k); /* the tower's head, hands and shoes: empty nodes the game can still show and hide */
  const sd=S.seed||7,mJ=M(wkGrit(16,32,S.j,sd+1,{pin:S.pin})),mP=M(wkGrit(16,32,S.p||S.j,sd+2,{grad:.4})),mSk=M(wkGrit(8,8,S.glove||S.skin,sd+3,{grain:.25,grad:.2})),mSh=M(wkGrit(8,8,S.sh,sd+4,{grain:.2})),mShoe=M(wkGrit(8,8,'#0b0b0d',sd+5,{grain:.3})),mNk=M(wkGrit(8,8,S.mask||S.skin,sd+6,{grain:.25}));
  const L=(rings,seg,m,j,x=0,y=0,z=0)=>mk(wkFacet(lathe(rings,seg)),m,J[j],x,y,z),R3=(r)=>r.map(([y,a,b,cz=0])=>[y,a*K,b*K,cz]);
  L(R3([[-.02,.15,.112],[.1*H,.165,.122,.004],[.26*H,.238,.14,.012],[.355*H,.262,.132,.004],[.405*H,.14,.09,-.012]]),8,M(wkDuskTorso(S,sd)),'spine');   /* the wedge: belt to heavy shoulders */
  L(R3([[-(S.hem||.17)*H,.19+(S.hem?.03:0),.135+(S.hem?.02:0)],[-.05*H,.172,.126],[.06*H,.15,.112]]),8,mJ,'hips');                                        /* the jacket's skirt */
  L([[-.012,.07,.062],[.03,.064,.058]],6,mSh,'neck'); L([[.0,.05,.052],[.09,.046,.048]],6,mNk,'neck');
  for(const s of ['L','R']){ const sg=s==='L'?1:-1;
    L(R3([[-.31*H,.052,.058],[-.13*H,.066,.07],[-.01,.078,.084],[.05,.05,.06]]),6,mJ,'arm'+s,sg*.012);
    L(R3([[-.262*H,.06,.064],[-.22*H,.06,.064],[-.09*H,.05,.055],[.0,.05,.055]]),6,mJ,'elbow'+s);                                                        /* the forearm flares to the cuff */
    if(!S.nocuff) L(R3([[-.282*H,.05,.054],[-.26*H,.052,.056]]),6,mSh,'elbow'+s);
    L([[-.14,.036,.054,.014],[-.105,.054,.07,.014],[-.03,.05,.064,.008],[.0,.038,.05]],6,mSk,'hand'+s);                                                /* a fist like a brick */
    L(R3([[-.44*H,.064,.07],[-.2*H,.078,.086],[-.03,.09,.096],[.03,.06,.07]]),6,mP,'thigh'+s);
    L(R3([[-.425*H,.082,.092],[-.37*H,.076,.084],[-.1*H,.064,.07],[.0,.066,.072]]),6,mP,'knee'+s);                                                       /* the trouser breaks wide over the shoe */
    L([[-.088,.064,.155,.07],[-.045,.066,.158,.07],[-.012,.046,.08,.03]],6,mShoe,'ankle'+s); }
  const hs=S.head||1.2; L([[.0,.036,.042,.02],[.04,.06,.072,.012],[.1,.073,.087,.004],[.17,.075,.09,0],[.22,.062,.074,-.004],[.246,.026,.036,-.006]].map(([y,a,b,c])=>[y*hs,a*hs,b*hs,c*hs]),8,M(wkDuskHead(S,sd+9)),'head');
  const s=Object.assign({kind:S.kind||'gunman',faces:FACE.gunman,grp,fight:{},showDrop:false},S.gear||{}); if(s.two) s.fightHipsY=J.hips.p[1]-.055;
  const C=finish(parent,J,o,s); C.dusk=true; if(typeof civPoses==='function') civPoses(C); return C; }
/* the first few, to look at */
function wkDuskCast(){ const CH='#2a2c33',BK='#15161a',WH='#d6d4cc';
  return { suit:{hf:.97,j:CH,sh:WH,p:CH,pin:4,skin:'#c9a184',hair:'#14100e',shades:true,seed:11,gear:PISTOL},
    heavy:{j:BK,sh:'#0c0c0e',p:BK,skin:'#8a5c40',mask:'#0e0e11',k:1.12,hf:1.02,v:8,hw:3,seed:23,kind:'enforcer',gear:TWO(pSMG,'smg')},
    boss:{hf:.95,j:'#3c4654',sh:WH,tie:'#6a1420',p:'#3c4654',sq:'#e2e0d8',skin:'#d6ae94',hair:'#c4c4c8',beard:.5,seed:37,kind:'landlord',gear:REVOLVER},
    door:{j:'#14151b',sh:'#08080a',p:'#14151b',db:'#3a3c44',hem:.36,skin:'#caa080',bald:true,beard:.7,hair:'#2a1e16',k:1.18,hf:1.04,v:7,hw:3,nocuff:true,glove:'#0c0c0e',seed:41,kind:'doorman',gear:TWO(pShotgun,'shotgun')},
    floor:{hf:.96,j:'#1a2030',sh:'#9aa8bc',p:'#1a2030',skin:'#e0bea0',hair:'#6a3a1c',scar:true,seed:53,gear:PISTOL} }; }
