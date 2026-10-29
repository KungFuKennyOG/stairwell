
/* =====================================================================================================
   THE TUNNEL: Puerto Seco proof of concept. One hand-built level: a dug smuggling tunnel under the border.
   Start at the bottom of the shaft (the armoury rack and spawn board are in that first dugout), walk ~30 m of
   timbered tunnel past the pump room, out the ladder at the far end. Five cartel men are down here.
   The generator in the pump room runs every bulb: shoot it and the tunnel goes black. In the dark they only see
   you up close or by your muzzle flash, and they stop hunting and start searching. You have night vision and
   thermal: touch the top of your head with an empty hand and squeeze grip (N on a keyboard) to cycle
   goggles up / night vision / thermal.
   ===================================================================================================== */
const TUN={TH:2.05};
/* The tunnel winds. It's laid out as dug paths (centre line [x,z,half-width], smoothed) plus a few chambers; the walls are traced
   as one continuous dug surface around whatever is open, so junctions and bends need no special cases.
   Space ids: -2 start dugout, -1 main tunnel, -3 the old bore (the dark second route), 0 pump room, 1 exit. */
const TUN_PATHS=[
  {id:-1,pts:[[-10.6,-3.0,.8],[-9.0,-3.5,.75],[-7.4,-3.1,.8],[-6.2,-2.5,.85],[-4.8,-3.0,.75],[-3.2,-3.9,.75],[-1.4,-4.0,.8],[.4,-3.4,.8],[2.0,-2.3,.75],[3.6,-2.6,.8],[5.2,-2.0,.9],[6.4,-.6,1.2],[6.8,1.2,1.15],[6.3,2.8,.8],[7.0,4.1,.8],[8.6,4.6,.75],[10.0,4.0,.8],[10.8,3.9,.8]]},
  {id:0,pts:[[-6.2,-2.6,.7],[-5.9,-1.7,.68],[-5.3,-.7,.7]]},
  {id:-3,pts:[[.4,-3.2,.7],[.9,-2.0,.68],[.3,-.6,.88],[1.0,.8,.9],[.5,2.3,.68],[1.3,3.8,.68],[2.8,4.6,.68],[4.3,4.2,.7],[5.6,4.8,.68],[7.0,4.1,.75]]}];
/* chambers: centre, half size, corner radius, how ragged the walls are. The dugout keeps flat walls: the rack and board hang on them. */
const TUN_ROOMS=[{id:-2,c:[-11.575,-3.0],h:[1.375,1.6],r:.12,n:0},{id:0,c:[-4.6,0],h:[1.6,1.1],r:.6,n:.1},{id:1,c:[11.3,3.9],h:[1.0,1.15],r:.45,n:.04}];
const TUN_CAST=[
  {id:'comando',name:'Chuy',x:-1.6,z:-3.95,hd:-Math.PI/2,extra:'¡No dispares, tengo hijos! (Don\'t shoot, I have kids!)'},
  {id:'pistolero',name:'Lalo',x:-4.3,z:-.45,hd:Math.PI,extra:'Yo nomás cuento el dinero— (I just count the money—)'},
  {id:'halcon',name:'Nico',x:-5.5,z:-.35,hd:Math.PI*.8,extra:'Tengo veintidós años, güey— (I\'m twenty-two, man—)'},
  {id:'machetero',name:'Beto',x:6.55,z:2.05,hd:Math.PI,extra:'Me obligaron, lo juro— (They made me, I swear—)'},
  {id:'escolta',name:'Toño',x:11.0,z:3.9,hd:-Math.PI/2,extra:'Mi jefa me está esperando— (My mom is waiting for me—)'}];
const CARTEL_OF={corner:'halcon',cutter:'machetero',gunman:'pistolero',doorman:'escolta',enforcer:'comando',landlord:'patron'};
const NAMES_ES=['Chuy','Lalo','Nico','Beto','Toño','Memo','Paco','Chava','Rubén','Gera','Poncho','Kike','Rafa','Tavo','Lupe','Neto'];
/* a cartel man, playing as one of the tower kinds; the lookout fights with a bottle in the game */
function cartelChar(id,parent,grp){ const C=makeChar(id,parent,grp,id==='halcon'?{prop:pBottle,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND}:null); tagHeat(C); return C; }
function tunnelCast(){ for(const sp of TUN_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>cartelChar(sp.id,h,g)})); E.detail='works the tunnel'; enemies.push(E); } attachLabels(); }

/* ---------- Spanish lines, with the English in brackets ---------- */
let LINES_EN=null;
const es=(a,b)=>`${a} (${b})`;
const LINES_ES={
  alert:[es('¡Ahí está!','There he is!'),es('¿Quién anda ahí?','Who\'s there?'),es('¡Es el policía!','It\'s the cop!'),es('¡Sigue vivo!','He\'s still alive!'),es('¡Agárrenlo!','Get him!')],
  leg:[es('¡Mi pierna!','My leg!'),es('No me puedo parar—','I can\'t stand—'),es('¡Mi rodilla, cabrón!','My knee!')],
  torso:[es('¡Me dieron!','I\'m hit!'),es('¡Espérate, espérate!','Wait, wait!'),es('Ay, no—','Oh no—')],
  arm:[es('¡Mi brazo!','My arm!'),es('No siento la mano—','I can\'t feel my hand—')],
  neck:['*ahogándose* (choking)','*gorgoteo* (gurgling)','—hhk—'],
  stab:['¡Hnn—!',es('No, no—','No, no—'),es('Sácalo, sácalo—','Get it out—')],
  beg:[es('Por favor. Por favor.','Please. Please.'),es('Ya, ya, me rindo.','Okay, I give up.'),es('No lo hagas.','Don\'t do it.'),es('Yo no te hice nada—','I didn\'t do anything to you—'),es('Por mi madre, no—','On my mother, no—')],
  crawl:[es('Ayúdenme...','Help me...'),es('No te acerques—','Stay back—'),es('No siento las piernas—','I can\'t feel my legs—')],
  dying:[es('...tengo frío...','...I\'m cold...'),es('Mamá...','Mom...'),es('No me quiero morir...','I don\'t want to die...'),es('...está oscuro...','...it\'s dark...')],
  friend:n=>[`¡${n}!`,es(`¡${n}! ¡Levántate!`,`${n}! Get up!`),es(`¡Mataron a ${n}!`,`They killed ${n}!`)],
  call:n=>[es(`¡${n}! ¡Ayúdame!`,`${n}! Help me!`),`${n}... por favor...`] };
function setLang(spanish){ if(!LINES_EN){ LINES_EN={}; for(const k in LINES) LINES_EN[k]=LINES[k]; } const src=spanish?LINES_ES:LINES_EN; for(const k in src) LINES[k]=src[k]; }

/* ---------- the level ---------- */
/* ---------- the tunnel's shape ---------- */
/* each path smoothed (Catmull-Rom) into ~0.2 m samples: position, half-width, arc length, unit tangent */
function tunSample(P){ const out=[]; const at=i=>P[Math.max(0,Math.min(P.length-1,i))];
  for(let i=0;i<P.length-1;i++){ const a=at(i-1),b=at(i),c=at(i+1),d=at(i+2),n=Math.max(2,Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/.2));
    for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t,cr=j=>.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3);
      out.push({x:cr(0),z:cr(1),hw:b[2]+(c[2]-b[2])*t}); } }
  const L=P[P.length-1]; out.push({x:L[0],z:L[1],hw:L[2]});
  let s=0; out.forEach((p,i)=>{ if(i) s+=Math.hypot(p.x-out[i-1].x,p.z-out[i-1].z); p.s=s; const q=out[Math.min(out.length-1,i+1)],r=out[Math.max(0,i-1)],l=Math.hypot(q.x-r.x,q.z-r.z)||1; p.tx=(q.x-r.x)/l; p.tz=(q.z-r.z)/l; });
  return out; }
let TUN_S=null; function tunPaths(){ if(!TUN_S) TUN_S=TUN_PATHS.map((P,pi)=>({id:P.id,pi,S:tunSample(P.pts)})); return TUN_S; }
/* how far inside open space (x,z) is, in metres (negative: in the earth), and which space it belongs to */
function tunField(x,z){ let best=-1e9,id=-9;
  for(const P of tunPaths()){ const S=P.S; for(let i=0;i<S.length-1;i++){ const a=S[i],b=S[i+1],dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1e-9;
      const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2)),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);
      if(d>2) continue; const sp=a.s+(b.s-a.s)*t,hw=a.hw+(b.hw-a.hw)*t+.1*fbm(sp*.6,P.pi*7.3,4401,3),f=hw-d; if(f>best){ best=f; id=P.id; } } }
  for(const R_ of TUN_ROOMS){ const qx=Math.abs(x-R_.c[0])-R_.h[0]+R_.r,qz=Math.abs(z-R_.c[1])-R_.h[1]+R_.r;
    const sd=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-R_.r,f=-sd+(R_.n?R_.n*fbm(x*.8,z*.8,4402,3):0); if(f>best){ best=f; id=R_.id; } }
  return {f:best,id}; }
/* the point along a path nearest (x,z): its sample */
function tunNear(id,x,z){ const P=tunPaths().find(p=>p.id===id); let bi=0,bd=1e9; P.S.forEach((p,i)=>{ const d=Math.hypot(p.x-x,p.z-z); if(d<bd){ bd=d; bi=i; } }); return P.S[bi]; }

/* ---------- the level ---------- */
function genTunnel(){
  disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=1; FLOOR.test=true; FLOOR.mode='tunnel'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; setLang(true);
  const G=floorN, B={g:G}, TH=TUN.TH; GEO_TEMP=true;
  /* sample the open field on a 0.25 m grid that runs a little past the play area */
  const GS=.25,X0=-13.5,Z0=-6.5,GW=Math.round(27/GS)+1,GH=Math.round(13/GS)+1,FF=new Float32Array(GW*GH),FI=new Int16Array(GW*GH);
  for(let k=0;k<GH;k++) for(let i=0;i<GW;i++){ const r=tunField(X0+i*GS,Z0+k*GS); FF[k*GW+i]=r.f; FI[k*GW+i]=r.id; }
  const fAt=(x,z)=>tunField(x,z).f;
  /* walls: trace the zero line of the field (marching squares), then raise each piece into a ragged earth face */
  const segs=[]; const E_=(i0,k0,i1,k1)=>{ const fa=FF[k0*GW+i0],fb=FF[k1*GW+i1],t=fa/(fa-fb); return [X0+(i0+(i1-i0)*t)*GS,Z0+(k0+(k1-k0)*t)*GS]; };
  for(let k=0;k<GH-1;k++) for(let i=0;i<GW-1;i++){ const v0=FF[k*GW+i]>0,v1=FF[k*GW+i+1]>0,v2=FF[(k+1)*GW+i+1]>0,v3=FF[(k+1)*GW+i]>0,c=v0|v1<<1|v2<<2|v3<<3; if(!c||c===15) continue;
    const e=[()=>E_(i,k,i+1,k),()=>E_(i+1,k,i+1,k+1),()=>E_(i+1,k+1,i,k+1),()=>E_(i,k+1,i,k)],mid=(FF[k*GW+i]+FF[k*GW+i+1]+FF[(k+1)*GW+i+1]+FF[(k+1)*GW+i])/4>0;
    const L={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:mid?[[0,1],[2,3]]:[[3,0],[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],10:mid?[[3,0],[1,2]]:[[0,1],[2,3]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]]}[c];
    for(const [a,b] of L) segs.push([e[a](),e[b]()]); }
  { const g=new Geo(),ys=[0,.5,1.05,1.6,TH+.06];
    const jit=(x,z,y)=>{ const a=x<-10.1?0:.07; return [x+a*fbm(x*2.1+y*1.3,z*2.1,4410,2),z+a*fbm(x*2.1,z*2.1+y*1.3,4411,2)]; };
    for(const [p,q] of segs){ let dx=q[0]-p[0],dz=q[1]-p[1]; const l=Math.hypot(dx,dz); if(l<1e-4) continue; dx/=l; dz/=l; let nx=-dz,nz=dx; const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2;
      if(fAt(mx+nx*.08,mz+nz*.08)<fAt(mx-nx*.08,mz-nz*.08)){ nx=-nx; nz=-nz; } /* face into the open */
      const ax=Math.abs(dx)>Math.abs(dz),u=pt=>(ax?pt[0]:pt[1])/1.2,base=g.P.length/3;
      for(const y of ys) for(const pt of [p,q]){ const j=jit(pt[0],pt[1],y); g.v([j[0],y,j[1]],[nx,0,nz],[u(pt),y/(TH+.3)]); }
      for(let r=0;r<ys.length-1;r++){ const a=base+r*2,b=a+1,c=a+2,d=a+3; g.I.push(a,b,d,a,d,c); } }
    g.groups.push({start:0,count:g.I.length,mi:0}); mk(g,MT(tEarth,{double:true}),G); }
  /* their collision: the ring of earth cells next to open space, merged greedily into as few boxes as possible */
  { const shell=new Uint8Array(GW*GH),used=new Uint8Array(GW*GH);
    for(let k=0;k<GH;k++) for(let i=0;i<GW;i++){ if(FF[k*GW+i]>0) continue; let near=false; for(let b=-2;b<=2&&!near;b++) for(let a=-2;a<=2;a++){ const ii=i+a,kk=k+b; if(ii>=0&&kk>=0&&ii<GW&&kk<GH&&FF[kk*GW+ii]>0){ near=true; break; } } if(near) shell[k*GW+i]=1; }
    for(let k=0;k<GH;k++) for(let i=0;i<GW;i++){ if(!shell[k*GW+i]||used[k*GW+i]) continue; let w=1; while(i+w<GW&&shell[k*GW+i+w]&&!used[k*GW+i+w]) w++;
      let h=1; grow: while(k+h<GH){ for(let a=0;a<w;a++) if(!shell[(k+h)*GW+i+a]||used[(k+h)*GW+i+a]) break grow; h++; }
      for(let b=0;b<h;b++) for(let a=0;a<w;a++) used[(k+b)*GW+i+a]=1;
      addBox(X0+(i-.5)*GS,X0+(i+w-.5)*GS,Z0+(k-.5)*GS,Z0+(k+h-.5)*GS,0,TH+.3,'wall'); } }
  /* floor and ceiling: one sheet each, finely divided so the bulbs light them properly */
  mk(plane(26,12,52,24),MT(tMud,{repeat:[26/1.2,12/1.2]}),G,0,0,0,-Math.PI/2);
  mk(plane(26,12,52,24),MT(tEarth,{repeat:[26/1.2,12/1.2]}),G,0,TH,0,Math.PI/2); addBox(-13,13,-6,6,TH,TH+.3,'ceil');
  const [MAIN,,BORE]=tunPaths();
  /* a strip along a path: the rails (painted, so they follow the bends) and the bulb cable */
  const strip=(S,s0,s1,off,w,y,mat,vs,down)=>{ const g=new Geo(); let n=0;
    for(const p of S){ if(p.s<s0||p.s>s1) continue; const nx=-p.tz,nz=p.tx,cx=p.x+nx*off,cz=p.z+nz*off; g.v([cx+nx*w/2,y,cz+nz*w/2],[0,down?-1:1,0],[0,p.s/vs]); g.v([cx-nx*w/2,y,cz-nz*w/2],[0,down?-1:1,0],[1,p.s/vs]);
      if(n){ const a=(n-1)*2; if(down) g.I.push(a,a+2,a+1,a+1,a+2,a+3); else g.I.push(a,a+1,a+2,a+1,a+3,a+2); } n++; }
    g.groups.push({start:0,count:g.I.length,mi:0}); mk(g,mat,G); };
  const mainEnd=MAIN.S[MAIN.S.length-1].s;
  strip(MAIN.S,.6,mainEnd-.6,0,.9,.015,M(tRailsPaint,{cut:true,double:true}),.6,false);
  strip(MAIN.S,0,mainEnd,.3,.025,1.93,M(null,{color:0x111214,double:true}),1,true);
  /* timber frames across the paths, square to the tunnel: posts each side and a header */
  const frame=(p,thin)=>{ const nx=-p.tz,nz=p.tx,ry=Math.atan2(nx,nz),half=p.hw-.14,t=thin?.1:.12;
    for(const sd of [-1,1]){ const px=p.x+nx*half*sd,pz=p.z+nz*half*sd; mk(box(t,TH-.02,t,{at:[0,(TH-.02)/2,0]}),MT(tBeam),G,px,0,pz,0,ry,0); addBox(px-t/2,px+t/2,pz-t/2,pz+t/2,0,TH,'wall'); }
    mk(box(.14,thin?.11:.14,half*2+.1),MT(tBeam),G,p.x,TH-.08,p.z,0,ry,0); };
  const nearAny=(p,pts,r)=>pts.some(q=>Math.hypot(p.x-q[0],p.z-q[1])<r);
  const junctions=[[-6.2,-2.5],[.4,-3.3],[7.0,4.1],[6.6,.5],[-10.4,-3.0],[10.6,3.9]];
  { let next=1.0; for(const p of MAIN.S){ if(p.s<next) continue; if(!nearAny(p,junctions,1.15)){ frame(p,false); next=p.s+1.7; } } }
  { let next=1.6; for(const p of BORE.S){ if(p.s<next||p.s>BORE.S[BORE.S.length-1].s-1.2) continue; if(!nearAny(p,[[.3,-.6],[1.0,.8]],.9)){ frame(p,true); next=p.s+2.0; } } }
  /* the cart, on the wide bend, pushed to one side so you can squeeze past */
  { const p=tunNear(-1,6.6,.3),ry=Math.atan2(p.tx,p.tz),nx=-p.tz,nz=p.tx,cx=p.x+nx*.5,cz=p.z+nz*.5; place(B,'cart',cx,cz,ry);
    const ex=.37*Math.abs(Math.cos(ry))+.57*Math.abs(Math.sin(ry)),ez=.37*Math.abs(Math.sin(ry))+.57*Math.abs(Math.cos(ry)); addBox(cx-ex,cx+ex,cz-ez,cz+ez,0,.92,'furn'); }
  /* puddles: ragged dithered shapes of murky water, a few to a sheet so the bulbs can pick out their ripples */
  [[-8.6,-3.4,1.4,1.0,0],[3.0,-2.4,1.6,1.1,1],[.6,-1.4,1.0,1.6,2],[3.6,4.4,1.7,1.0,1],[8.0,4.5,1.2,.9,0],[-3.9,-3.8,.9,.7,2]].forEach(([x,z,w,d,v],i)=>
    mk(plane(w,d,3,3),M(tPuddle[v],{cut:true}),G,x,.012,z,-Math.PI/2,0,i*1.3));
  /* start dugout: the ladder up into the stash house, light falling down the shaft */
  { const l=N(G,-12.65,0,-3,0,-Math.PI/2,0); FX.ladder(l,TH+.3); mk(plane(.9,.9),M(null,{color:0x8a7454,unlit:true,double:true}),G,-12.45,TH-.01,-3,Math.PI/2); }
  place(B,'sandbags',-11.9,-4.3,0,6); place(B,'gascyl',-10.75,-4.25);
  /* the pump room: generator (shoot it: lights out), a table, the product */
  const gen=powered(place(B,'generator',-5.35,.62),.75,25); const gb=addBox(-5.8,-4.9,.34,.9,0,1.0,'generator'); gb.onHit=()=>tunnelPower(false);
  place(B,'table',-3.65,-.25,Math.PI/2,1.0,.6,0xd8d4cc); addBox(-3.95,-3.35,-.75,.25,0,.77,'furn'); mk(box(.3,.2,.2),M(null,{color:0x2a2a2e}),G,-3.6,.88,-.3);
  place(B,'bricksPile',-4.35,.75,0,12,13); addBox(-4.95,-3.75,.45,1.05,0,.4,'furn'); place(B,'gascyl',-3.4,.75);
  /* the old bore: no rails, thinner older timbers, a wall slumped into a bulge, a cooler someone left in a hollow, one dead bulb */
  /* the slump: a lumpy heap of fallen earth bulging out of the wall, stones in it, the frame's header fallen across it */
  { const p=tunNear(-3,1.0,.8),nx=-p.tz,nz=p.tx,cx=p.x+nx*.62,cz=p.z+nz*.62,ry=Math.atan2(nx,nz),n=N(G,cx,0,cz,0,ry,0);
    const g=new Geo(),R0=6,SG=14,rx=.62,rz=.85,H=.62,ht=(u,a)=>{ const k=Math.max(0,1-u*u); return H*Math.pow(k,.75)*(1+.22*fbm(Math.cos(a)*u*3+9,Math.sin(a)*u*3,4620,2))+(u<.98?.03*fbm(u*9,a*3,4621,2):0); };
    for(let r=0;r<=R0;r++) for(let j=0;j<=SG;j++){ const u=r/R0,a=j/SG*Math.PI*2,x=Math.sin(a)*u*rx,z=Math.cos(a)*u*rz; g.v([x,r===R0?0:ht(u,a),z],[0,1,0],[x/.6+.5,z/.6+.5]); }
    for(let r=0;r<R0;r++) for(let j=0;j<SG;j++){ const a=r*(SG+1)+j,b=a+1,c=a+SG+1,d=c+1; g.I.push(a,c,b,b,c,d); }
    g.groups.push({start:0,count:g.I.length,mi:0}); flatNormals(g); mk(g,MT(tMud,{double:true,color:0xc8b8a8}),n);
    const rs=rng(4622); for(let i=0;i<6;i++){ const a=rs()*6.28,u=.35+rs()*.55,sz=.07+rs()*.09; mk(box(sz,sz*.7,sz*1.2),M(null,{color:[0x6a6258,0x5a5248,0x7a7064][i%3]}),n,Math.sin(a)*u*rx,ht(u,a)*.85,Math.cos(a)*u*rz,rs(),rs()*3,rs()); }
    addBox(cx-.3,cx+.3,cz-.3,cz+.3,0,.45,'prop'); /* solid, but routed past rather than around: the bore is too tight for the nav grid otherwise */
    mk(box(.14,.14,1.35),MT(tBeam),n,-.32,.27,-.05,.36,-.35,.05); } /* one end up on the heap, the other in the mud */
  /* the cooler: scuffed, lid cracked open, empties and butts round it. Someone sits out his shift down here. */
  { const p=tunNear(-3,.3,-.6),nx=-p.tz,nz=p.tx,cx=p.x-nx*.48,cz=p.z-nz*.48,n=N(G,cx,0,cz,0,Math.atan2(p.tx,p.tz),0); /* local +x is the wall, -x the tunnel */
    mk(box(.36,.34,.56,{at:[0,.17,0]}),M(tCoolerBody),n); mk(box(.3,.02,.5),M(null,{color:0x0e1012}),n,0,.341,0); /* body, the dark inside */
    const lid=N(n,.18,.345,0,0,0,-.42); mk(box(.38,.05,.58),M(tCoolerLid),lid,-.18,.025,0); /* hinged at the wall side, propped open */
    for(const s of [-1,1]) mk(box(.12,.03,.03),M(null,{color:0x2a4f86}),n,0,.27,s*.29); /* end handles */
    mk(box(.012,.05,.06),M(null,{color:0x1a1c1e}),n,-.186,.31,0); /* latch */
    mk(box(.1,.1,.03),M(tCoolerTag),n,-.182,.16,.12,0,-Math.PI/2,0); /* the label, peeling */
    const can=M(tCan,{double:true});
    mk(cyl(.033,.033,.12,8),can,n,-.3,.06,.36); mk(cyl(.033,.033,.12,8),can,n,-.42,.034,-.38,Math.PI/2,0,.4); /* one standing, one rolled */
    const cr=mk(cyl(.036,.03,.12,7),can,n,-.18,.02,-.5,Math.PI/2,0,1.1); cr.s=[1,1,.34]; /* stamped flat */
    const bt=[],rb=rng(4630); for(let i=0;i<9;i++) bt.push([-.15-rb()*.45,.006,(rb()-.5)*1.1,.028,.01,.01]); mk(mergeBoxes(bt),M(null,{color:0xd8cfbc}),n);
    addBox(cx-.22,cx+.22,cz-.22,cz+.22,0,.42,'prop'); }
  { const p=tunNear(-3,.6,2.0); FX.bulb(N(G,p.x,1.86,p.z),false); }
  /* the exit: sandbags, a ladder up to the other side, the spray paint */
  place(B,'sandbags',10.9,2.95,0,6); addBox(10.3,11.5,2.65,3.25,0,.36,'furn');
  { const l=N(G,12.15,0,3.9,0,Math.PI/2,0); FX.ladder(l,TH+.3); mk(plane(.8,.8),M(null,{color:0x0a0c10}),G,12.0,TH-.01,3.9,Math.PI/2); }
  mk(plane(1.6,.4),MT(tSpray,{cut:true,double:true}),G,11.3,1.45,4.98,0,Math.PI,0);
  /* bulbs on the cable: four weak ones lit (each is a light), the rest dead, so long stretches and every bend are black */
  const lights=[]; const lit=[[-11.6,-3.0],[-4.6,-.25],[-.2,-3.75],[11.2,3.9]];
  lit.forEach(([x,z],i)=>{ const p=i===0||i===1||i===3?{x,z}:tunNear(-1,x,z); const n=N(G,p.x,1.86,p.z); FX.bulb(n,true); powered(n,.9,4); if(i===0) FLOOR.flick={mat:n.kids[0].mesh.mats[0],i:0}; lights.push([[p.x,1.78,p.z],i===1?[1.0,.72,.4]:[.85,.55,.26],i===1?3.9:3.4]); });
  for(const [x,z] of [[-7.6,-3.2],[-3.0,-3.9],[3.4,-2.5],[6.7,.9],[8.9,4.5]]){ const p=tunNear(-1,x,z); FX.bulb(N(G,p.x,1.86,p.z),false); }
  GEO_TEMP=false;
  /* navigation: walkable cells are well inside open space and clear of furniture */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i,r=tunField(x,z); if(r.f<-.3) continue; space[id]=r.id; if(r.f<.12) continue; /* the walls' boxes sit within 0.13 m of the dug face */
    let bl=false; for(const b of BOXES){ if(b.kind!=='furn'&&b.kind!=='generator') continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const units=[{id:0,side:1,x0:-6.2,x1:-3.0,z0:-1.1,z1:1.1,w:3.2,apt:'PUMP',door:-5.4,room:true,lit:true},{id:1,side:1,x0:10.3,x1:12.3,z0:2.75,z1:5.05,w:2.0,apt:'EXIT',door:10.3,room:true,lit:true}];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.4,z:-3.0,yaw:-Math.PI/2},lights});
  tunnelLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }
/* the cooler and its empties: dirty white body, grime pooled at the bottom, scuffs; blue lid; a cheap peeling label; red-and-gold cans */
const tCoolerBody=tex(32,32,'#cdc8ba',g=>{ R(g,'#dcd8cc',0,0,32,6); R(g,'#b8b2a2',0,6,32,1); const r=rng(4631);
  for(let y=18;y<32;y++) for(let x=0;x<32;x++) if(r()<(y-18)/16) R(g,'rgba(70,52,30,.28)',x,y,1,1);
  for(let i=0;i<14;i++){ const x=r()*30|0,y=8+r()*20|0; R(g,'rgba(40,34,26,.5)',x,y,1+(r()*3|0),1); }
  for(let i=0;i<5;i++) R(g,'rgba(120,80,40,.35)',r()*28|0,r()*28|0,3,2); grain(g,10,4632); });
const tCoolerLid=tex(32,32,'#2c5a96',g=>{ R(g,'#3a6cac',2,2,28,4); R(g,'#22487a',0,28,32,4); const r=rng(4633); for(let i=0;i<16;i++) R(g,'rgba(200,210,220,.35)',r()*30|0,r()*30|0,1+(r()*3|0),1);
  for(let i=0;i<4;i++) R(g,'rgba(60,44,26,.4)',r()*26|0,r()*26|0,4,3); grain(g,10,4634); });
const tCoolerTag=tex(16,16,null,g=>{ R(g,'#b8261c',0,0,16,11); R(g,'#e8e2d0',1,1,14,2); text(g,'FRIO',1,5,'#f2ece0'); R(g,'#9a8a70',10,9,6,7); });
const tCan=tex(16,16,'#a8201a',g=>{ R(g,'#c8c8cc',0,0,16,2); R(g,'#8a8a90',0,14,16,2); R(g,'#d8a838',0,6,16,3); R(g,'#f0e0a0',3,7,5,1); grain(g,12,4635); });
/* puddles: a noisy blob with an ordered-dither edge (soft, but still a hard alpha cut), brown at the rim, dark green-grey water,
   and pale ripple streaks that stay dull in the dark and only catch the eye under a bulb. Three variants. */
const tPuddle=[0,1,2].map(v=>tex(64,64,null,g=>{ const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],id=g.createImageData(64,64),sd=4600+v*37;
  for(let y=0;y<64;y++) for(let x=0;x<64;x++){ const nx=(x-31.5)/30,ny=(y-31.5)/30,d=Math.hypot(nx,ny)+.32*fbm(x*.07,y*.07,sd,3),edge=.78;
    const a=(edge-d)/.12+.5; if(a<=B4[(y&3)*4+(x&3)]/16) continue; /* dithered rim */
    const rim=Math.max(0,Math.min(1,(d-(edge-.2))/.2)),rip=Math.max(0,Math.sin((x*.35+y*.12)+fbm(x*.05,y*.05,sd+1,2)*6)-.82)*4.5,mott=.08*fbm(x*.15,y*.15,sd+2,2);
    let c=[.11,.14,.13].map(k=>k*(1+mott)); c=c.map((k,j)=>k+([.3,.34,.33][j]-k)*Math.min(.6,rip*.6)); c=c.map((k,j)=>k+([.23,.17,.11][j]-k)*rim*.85);
    const i=(y*64+x)*4; id.data[i]=c[0]*255; id.data[i+1]=c[1]*255; id.data[i+2]=c[2]*255; id.data[i+3]=255; }
  g.putImageData(id,0,0); }));
/* the rails, painted: two steel lines and sleepers on a transparent strip laid along the main tunnel */
const tRailsPaint=tex(32,32,null,g=>{ for(let y=0;y<32;y+=32) { R(g,'#4a3420',2,y+3,28,6); R(g,'#5e4428',2,y+3,28,1); R(g,'#2e2014',2,y+8,28,1); }
  for(const x of [4,27]){ R(g,'#6a6e72',x,0,2,32); R(g,'#a8acb0',x,0,1,32); R(g,'#2a2c2e',x+2,0,1,32); } });
const TUN_LIGHT={amb:[.02,.017,.014],dir:[0,1,0],dirCol:[0,0,0],fog:[.003,.0025,.002],fogNear:1.5,fogFar:11};
function tunnelLights(){ setLights(Object.assign({},TUN_LIGHT,FLOOR.power?{pl:FLOOR.lights}:{amb:[.003,.003,.003],pl:[]})); }
function tunnelPower(on){ if(FLOOR.mode!=='tunnel'||FLOOR.power===on) return; FLOOR.power=on;
  if(!on){ FLOOR.offT=GAME.t; FLOOR.flick=null; sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead){ setTimeout(()=>{ if(!E.dead){ E.aware=true; E.mind='hunt'; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick([es('¡Se fue la luz!','The lights went out!'),es('¿Qué pasó?','What happened?'),es('¡Prendan la planta!','Start the generator!')]),2.4); } },200+Math.random()*700); } }
  tunnelLights(); visionApply(); }

/* ---------- seeing in the dark ---------- */
/* in a dark tunnel they see you up close, or by your muzzle flash for a moment after you fire */
function inBore(x,z){ if(FLOOR.mode!=='tunnel'||!FLOOR.space) return false; const c=navCell(x,z); return c>=0&&FLOOR.space[c]===-3; }
function seenInDark(E,dist){ const flash=GAME.t-(GAME.shotT??-99)<1.4&&dist<16;
  if(FLOOR.power!==false&&!inBore(PL.x,PL.z)) return true; return dist<(FLOOR.power!==false?2.6:1.8)||flash; }
function huntsInDark(E){ return FLOOR.power!==false||E.canSee; }
const NVP2=program(PVS,NVFS), THP2=program(PVS,THFS);
function cycleVision(){ const o=['off','nv','thermal']; GAME.vision=o[(o.indexOf(GAME.vision||'off')+1)%3]; sfx('click',.9); sfx(GAME.vision==='off'?'slowout':'slowin',.35); visionApply(); }
/* the goggles gesture: an empty hand at the top-front of your head */
function nearGoggles(p,eye,f,u){ const v=v3.sub(p,eye); return Math.hypot(...v)<.3&&v3.dot(v,u)>-.02&&v3.dot(v,f)>-.08; }
function visionMode(){ return GAME.vision==='thermal'?'thermal':FLOOR.power===false?'cut':'lit'; }
function visionApply(){ const m=visionMode(); markKeep(); applyMode(world,m); GAME.visionT=.5; }
function markKeep(){ if(typeof boardN!=='undefined'&&boardN) boardN._keep=true; for(const h of Object.values(HANDS)){ if(h.ammoN) h.ammoN._keep=true; if(h.retN) h.retN._keep=true; } for(const E of enemies) if(E.label) E.label._keep=true; }
/* things the generator runs: hot in thermal while it runs, cooling to room temperature once it's cut
   (fast at first, then slower: bulbs in a few seconds, the engine block over ~25 s) */
function powered(n,h,cool){ heatTag(n,h); FLOOR.hot.push({n,h,cool}); return n; }
function coolPowered(){ if(!FLOOR.hot) return; const off=FLOOR.power===false&&FLOOR.offT!=null;
  for(const o of FLOOR.hot){ let h=o.h; if(off){ const k=Math.min(1,(GAME.t-FLOOR.offT)/o.cool); h=o.h+(.22-o.h)*(1-(1-k)*(1-k)); } heatTag(o.n,+h.toFixed(2)); } }
function tagScene(){ coolPowered(); for(const k of ['bright','dark','gib']) if(dynN[k]) dynN[k]._heat=.72; if(dynN.pool) dynN.pool._heat=.6; if(dynN.splat) dynN.splat._heat=.62;
  for(const h of Object.values(HANDS)){ (function w(n){ if(n.mesh) n._heat=.86; for(const k of n.kids) w(k); })(h.node); if(h.itemNode) heatTag(h.itemNode,.22); }
  for(const E of enemies) if(E.dead){ const k=1-Math.min(1,E.deadT/60)*.45; (function w(n){ if(n.mesh){ if(n._heatArr0||n._heatArr){ n._heatArr0=n._heatArr0||n._heatArr; n._heatArr=n._heatArr0.map(v=>+(v*k).toFixed(2)); } else if(n._heat!=null&&n._heat>.4){ n._heat0=n._heat0??n._heat; n._heat=+(n._heat0*k).toFixed(2); } } for(const c of n.kids) w(c); })(E.holder); } }
function visionTick(dt){ const m=visionMode();
  if(m!=='lit'){ GAME.visionT=(GAME.visionT||0)-dt; if(GAME.visionT<=0){ GAME.visionT=.5; tagScene(); markKeep(); applyMode(world,m); } }
  if(m==='thermal') for(const E of enemies){ const hm=E.J.headMesh.mesh,cur=hm.mats[0]; if(!cur||cur.unlit!==1){ hm._orig=[cur]; hm.mats[0]=thermalMat(E.J.headMesh,cur,0); hm.runs=null; } }
  /* the goggles' infrared torch: light 6, at your eyes, only while night vision is on */
  if(GAME.vision==='nv'){ const e=camBasis().eye; L.plPos.set(e,18); L.plCol.set([1.6,1.6,1.6],18); L.plDist[6]=15; } else if(FLOOR.mode==='tunnel'&&!(FLOOR.lights[6])){ L.plCol.set([0,0,0],18); } }
function visionProgram(){ return GAME.vision==='nv'?NVP2:GAME.vision==='thermal'?THP2:null; }
function tickTunnel(dt){ visionTick(dt); if(FLOOR.mode!=='tunnel'||!GAME.started||PL.dead||GAME.clear) return;
  if(Math.hypot(PL.x-11.9,PL.z-3.9)<.9){ GAME.clear=true; showMsg('EL OTRO LADO','You made it to the other side. Reset to run it again: quiet, loud, or in the dark.'); if(XR.on) XR.clearT=6; } }
