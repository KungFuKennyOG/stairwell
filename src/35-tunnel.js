/* =====================================================================================================
   THE TUNNEL: Puerto Seco, level 4. A dug smuggling tunnel under the border, about 175 m of it.
   Start at the bottom of the shaft (the armoury rack and spawn board are in that first dugout). South half: the main line runs east
   past the pump room, round the cart bend, through a flooded stretch into the staging chamber. Off it: the crew's dormitory and the
   cave-in beyond (a shotgun left at the end), and from the pump room a passage to the vent shaft (daylight through a grate) and a
   flooded sump (an MP5 on the crates). North half: from the main line a passage climbs to the packing lab, and the rail line runs
   20 m dead straight from the lab to the dig face, where they're still digging. The exit ladder is off the far end of the rail line;
   the old shaft at the end of the main line has caved in. Two ways there: north through the lab, or south through the staging
   chamber and up the connector from the drift. The old bore and the drift are dark loops. Twenty-one cartel men.
   The generator in the pump room runs every bulb (not the daylight in the vent shaft): shoot it and the tunnel goes black. With the
   power on they see you near a light; in the black stretches between, only up close or by your muzzle flash.
   Wading is loud. Night vision and thermal: touch the top of your head with an empty hand and squeeze grip
   (N on a keyboard) to cycle goggles up / night vision / thermal.
   ===================================================================================================== */
const TUN={TH:2.4,RX:44,RZ:26,WIDEN:.15,WIDEN_NARROW:.2}; /* ceiling height; extra half-width on the main line and on the narrow digs (room to swing a machete) */
/* The tunnel winds. It's laid out as dug paths (centre line [x,z,half-width], smoothed) plus chambers; the walls are traced as one
   continuous dug surface around whatever is open, so junctions and bends need no special cases.
   Space ids: paths -1 main line, -3 the old bore, -4 dormitory branch, -5 the cave-in, -6 the drift, -7 the rail line, -8 the
   connector, -13 vent passage (not -9: that means no space), -10 sump passage, -11 lab passage, -12 exit branch; rooms -2 start dugout, 0 pump room, 1 old shaft,
   2 staging, 3 dormitory, 4 vent shaft, 5 sump, 6 packing lab, 7 dig face, 8 exit. */
const TUN_PATHS=[
  /* the main line, west half: dugout, pump room, cart bend, the flooded stretch, into the staging chamber */
  {id:-1,rails:1,pts:[[-10.6,-3.0,.8],[-9.0,-3.5,.75],[-7.4,-3.1,.8],[-6.2,-2.5,.85],[-4.8,-3.0,.75],[-3.2,-3.9,.75],[-1.4,-4.0,.8],[.4,-3.4,.8],[2.0,-2.3,.75],[3.6,-2.6,.8],[5.2,-2.0,.9],[6.4,-.6,1.2],[6.8,1.2,1.15],[6.3,2.8,.8],[7.0,4.1,.8],[8.6,4.6,.75],[10.2,4.0,.8],[11.8,3.0,.85],[13.4,2.2,.95],[15.2,2.6,1.0],[17.0,1.8,.95],[18.9,.2,.85]]},
  /* the main line, east half: out of the staging chamber, winding up to the exit shaft */
  {id:-1,rails:1,pts:[[23.2,-1.6,.8],[24.8,-3.0,.75],[25.4,-5.2,.8],[24.6,-7.4,.8],[25.4,-9.6,.75],[26.8,-11.2,.8]]},
  {id:0,pts:[[-6.2,-2.6,.7],[-5.9,-1.7,.68],[-5.3,-.7,.7]]},
  /* the old bore: leaves the main line past the pump room, rejoins it after the cart bend. No bulbs */
  {id:-3,pts:[[.4,-3.2,.7],[.9,-2.0,.68],[.3,-.6,.88],[1.0,.8,.9],[.5,2.3,.68],[1.3,3.8,.68],[2.8,4.6,.68],[4.3,4.2,.7],[5.6,4.8,.68],[7.0,4.1,.75]]},
  /* to the dormitory: a dead end where the crew sleeps */
  {id:-4,pts:[[-1.6,-4.3,.72],[-2.3,-5.9,.7],[-1.5,-7.5,.72],[-2.4,-9.0,.75]]},
  /* the cave-in: an older dig west from the dormitory that fell in. Something was left at the end of it */
  {id:-5,pts:[[-5.2,-11.4,.66],[-6.9,-12.6,.64],[-8.8,-12.2,.62],[-10.5,-13.2,.62],[-11.6,-13.4,.6]]},
  /* the drift: a narrow second way from the staging chamber round to the exit line. No bulbs */
  {id:-6,pts:[[21.6,1.2,.62],[22.8,3.2,.6],[24.8,3.6,.6],[26.8,2.2,.62],[27.8,-.2,.6],[28.2,-2.8,.62],[27.8,-5.4,.6],[26.6,-7.0,.62],[25.2,-7.6,.7]]},
  /* from the pump room south to the vent shaft, and on west to the sump */
  {id:-13,pts:[[-3.1,1.0,.7],[-3.5,2.6,.7],[-5.2,4.0,.72],[-7.0,5.0,.7],[-8.8,5.6,.7],[-10.2,6.8,.72],[-10.9,7.5,.72]]},
  {id:-10,pts:[[-13.2,8.8,.66],[-15.2,7.8,.64],[-17.2,8.6,.66],[-19.4,7.4,.7],[-20.2,7.3,.7]]},
  /* off the main line before the flooded stretch, climbing north to the packing lab */
  {id:-11,pts:[[10.3,4.6,.72],[10.9,6.8,.7],[10.1,8.8,.72],[11.0,10.8,.7],[11.8,12.6,.72],[12.0,13.3,.72]]},
  /* the rail line: 20 m near dead straight, lab to dig face. The one long sightline down here */
  {id:-7,rails:1,pts:[[14.6,14.6,1.0],[18,14.9,1.0],[21,14.4,1.0],[24,14.8,1.0],[27,14.3,1.0],[30,14.7,1.0],[33,14.2,1.0],[35.4,13.9,1.0],[36.1,13.9,1.0]]},
  /* the connector: from the drift up to the rail line, closing the big loop */
  {id:-8,pts:[[26.2,14.2,.66],[26.8,12.0,.64],[25.8,9.6,.64],[26.4,7.2,.64],[25.2,5.0,.66],[24.8,3.9,.7]]},
  /* off the far end of the rail line, up to the exit shaft */
  {id:-12,pts:[[32.6,14.6,.7],[33.4,16.4,.7],[32.6,18.2,.72],[32.6,19.5,.72]]}];
/* chambers: centre, half size, corner radius, how ragged the walls are. The dugout keeps flat walls: the rack and board hang on them. */
const TUN_ROOMS=[{id:-2,c:[-11.575,-3.0],h:[1.375,1.6],r:.12,n:0},{id:0,c:[-4.6,0],h:[1.6,1.1],r:.6,n:.1},{id:1,c:[27.4,-12.6],h:[1.1,1.2],r:.45,n:.04},
  {id:2,c:[21,-1],h:[2.4,1.8],r:.5,n:.08},{id:3,c:[-3.2,-11.0],h:[2.2,1.6],r:.6,n:.1},
  {id:4,c:[-11.8,8.4],h:[1.8,1.6],r:.5,n:.08},{id:5,c:[-21.8,7.2],h:[2.4,1.9],r:.7,n:.1},{id:6,c:[12.4,14.4],h:[2.8,1.9],r:.5,n:.08},
  {id:7,c:[37.8,13.6],h:[2.4,2.0],r:.8,n:.14},{id:8,c:[32.6,20.2],h:[1.1,1.2],r:.45,n:.04}];
const TUN_EXIT=[32.6,21.0]; /* the ladder up the far side */
/* standing water: the flooded stretch of the main line, and the sump */
const TUN_WATER=[{x0:12.2,x1:18.6,z0:-1,z1:4.6,id:-1},{x0:-24.4,x1:-19.0,z0:5.0,z1:9.4,id:5}];
const TUN_CAST=[
  {id:'comando',name:'Chuy',x:-1.6,z:-3.95,hd:-Math.PI/2,extra:'Don\'t shoot, I have kids!'},
  {id:'pistolero',name:'Lalo',x:-4.1,z:-.05,hd:Math.PI,extra:'I just count the money—'},
  {id:'halcon',name:'Nico',x:-5.5,z:-.35,hd:Math.PI*.8,extra:'I\'m twenty-two, man—'},
  {id:'halcon',name:'Memo',x:-2.4,z:-10.9,hd:Math.PI/2,extra:'I was asleep, I swear!'},
  {id:'machetero',name:'Paco',x:-4.4,z:-11.7,hd:Math.PI*.35,extra:'I just carry boxes—'},
  {id:'machetero',name:'Beto',x:6.55,z:2.05,hd:Math.PI,extra:'They made me, I swear—'},
  {id:'pistolero',name:'Rubén',x:16.6,z:2.0,hd:-Math.PI/2,extra:'My daughter turns six tomorrow—'},
  {id:'escolta',name:'Toño',x:19.4,z:-.3,hd:-Math.PI/2,extra:'My mom is waiting for me—'},
  {id:'patron',name:'Gera',x:21.0,z:-.55,hd:Math.PI,extra:'I\'ll pay you. Whatever you want.'},
  {id:'comando',name:'Chava',x:22.6,z:-1.5,hd:Math.PI/2,extra:'I didn\'t know it was you—'},
  {id:'escolta',name:'Kike',x:32.8,z:19.6,hd:Math.PI,extra:'I just watch the ladder—'},
  {id:'halcon',name:'Poncho',x:-11.2,z:8.2,hd:2.36,extra:'I just watch the fan, man—'},
  {id:'machetero',name:'Rafa',x:-21.0,z:6.6,hd:Math.PI/2,extra:'I got a wife, man. I got a wife—'},
  {id:'pistolero',name:'Tavo',x:12.4,z:13.5,hd:Math.PI,extra:'I\'m just the driver—'},
  {id:'halcon',name:'Lupe',x:13.3,z:14.2,hd:Math.PI*.7,extra:'I just weigh it, I just weigh it—'},
  {id:'comando',name:'Neto',x:14.5,z:13.4,hd:Math.PI/2,extra:'You don\'t know who you\'re messing with—'},
  {id:'machetero',name:'Flaco',x:23.4,z:14.9,hd:-Math.PI/2,extra:'I was gonna quit, I swear—'},
  {id:'pistolero',name:'Güero',x:29.6,z:14.6,hd:-Math.PI/2,extra:'Wait— wait, we can talk—'},
  {id:'escolta',name:'Toro',x:36.9,z:13.6,hd:-Math.PI/2,extra:'We just dig. We just dig—'},
  {id:'halcon',name:'Pepe',x:38.7,z:12.7,hd:Math.PI,extra:'My back\'s broken from this hole—'},
  {id:'machetero',name:'Chucho',x:38.6,z:14.6,hd:-Math.PI*.6,extra:'Take the money. Take it—'}];
const CARTEL_OF={corner:'halcon',cutter:'machetero',gunman:'pistolero',doorman:'escolta',enforcer:'comando',landlord:'patron'};
const NAMES_ES=['Chuy','Lalo','Nico','Beto','Toño','Memo','Paco','Chava','Rubén','Gera','Poncho','Kike','Rafa','Tavo','Lupe','Neto'];
/* a cartel man, playing as one of the tower kinds; the lookout fights with a bottle in the game */
function cartelChar(id,parent,grp){ const C=makeChar(id,parent,grp,id==='halcon'?{prop:pBottle,wFight:{p:[0,-.075,0],r:[1.57,0,0]},fight:ONE_HAND}:null); tagHeat(C); return C; }
function tunnelCast(){ for(const sp of TUN_CAST){ const E=spawnEnemy(Object.assign({},sp,{maker:(h,g)=>cartelChar(sp.id,h,g)})); E.detail='works the tunnel'; enemies.push(E); } attachLabels();
  /* whoever dug the cave-in left his shotgun on a crate at the end of it */
  for(const r of FLOOR.rewards||[]){ const Mw=m4.compose(m4.make(),[r.p[0],r.p[1],r.p[2]],[0,r.ry,Math.PI/2],[1,1,1]); const P=addPickup(newItem(r.key),Mw,[0,0,0],[0,0,0]); P.rest=true; } }

/* ---------- the cartel men's lines. Ray speaks Spanish, so they're shown as he hears them: in English. es(spanish,english) keeps the Spanish in the source for reference only ---------- */
let LINES_EN=null;
const es=(a,b)=>b;
const LINES_ES={
  alert:[es('¡Ahí está!','There he is!'),es('¿Quién anda ahí?','Who\'s there?'),es('¡Es el policía!','It\'s the cop!'),es('¡Sigue vivo!','He\'s still alive!'),es('¡Agárrenlo!','Get him!')],
  leg:[es('¡Mi pierna!','My leg!'),es('No me puedo parar—','I can\'t stand—'),es('¡Mi rodilla, cabrón!','My knee!')],
  torso:[es('¡Me dieron!','I\'m hit!'),es('¡Espérate, espérate!','Wait, wait!'),es('Ay, no—','Oh no—')],
  arm:[es('¡Mi brazo!','My arm!'),es('No siento la mano—','I can\'t feel my hand—')],
  neck:['*choking*','*gurgling*','—hhk—'],
  stab:['Hnn—!',es('No, no—','No, no—'),es('Sácalo, sácalo—','Get it out—')],
  beg:[es('Por favor. Por favor.','Please. Please.'),es('Ya, ya, me rindo.','Okay, I give up.'),es('No lo hagas.','Don\'t do it.'),es('Yo no te hice nada—','I didn\'t do anything to you—'),es('Por mi madre, no—','On my mother, no—')],
  crawl:[es('Ayúdenme...','Help me...'),es('No te acerques—','Stay back—'),es('No siento las piernas—','I can\'t feel my legs—')],
  dying:[es('...tengo frío...','...I\'m cold...'),es('Mamá...','Mom...'),es('No me quiero morir...','I don\'t want to die...'),es('...está oscuro...','...it\'s dark...')],
  friend:n=>[`${n}!`,es(`¡${n}! ¡Levántate!`,`${n}! Get up!`),es(`¡Mataron a ${n}!`,`They killed ${n}!`)],
  call:n=>[es(`¡${n}! ¡Ayúdame!`,`${n}! Help me!`),`${n}... please...`] };
function setLang(spanish){ if(!LINES_EN){ LINES_EN={}; for(const k in LINES) LINES_EN[k]=LINES[k]; } const src=spanish?LINES_ES:LINES_EN; for(const k in src) LINES[k]=src[k]; }

/* ---------- the level ---------- */
/* ---------- the tunnel's shape ---------- */
/* each path smoothed (Catmull-Rom) into ~0.2 m samples: position, half-width (with a little wander), arc length, unit tangent */
function tunSample(P,pi){ const out=[]; const at=i=>P[Math.max(0,Math.min(P.length-1,i))];
  for(let i=0;i<P.length-1;i++){ const a=at(i-1),b=at(i),c=at(i+1),d=at(i+2),n=Math.max(2,Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/.2));
    for(let k=0;k<n;k++){ const t=k/n,t2=t*t,t3=t2*t,cr=j=>.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3);
      out.push({x:cr(0),z:cr(1),hw:b[2]+(c[2]-b[2])*t}); } }
  const L=P[P.length-1]; out.push({x:L[0],z:L[1],hw:L[2]});
  let s=0; out.forEach((p,i)=>{ if(i) s+=Math.hypot(p.x-out[i-1].x,p.z-out[i-1].z); p.s=s; p.hwn=p.hw+.1*fbm(s*.6,pi*7.3,4401,3);
    const q=out[Math.min(out.length-1,i+1)],r=out[Math.max(0,i-1)],l=Math.hypot(q.x-r.x,q.z-r.z)||1; p.tx=(q.x-r.x)/l; p.tz=(q.z-r.z)/l; });
  return out; }
/* segments bucketed on a 2 m grid, so a point only measures itself against the few pieces of tunnel near it */
let TUN_S=null,TUN_BK=null;
function tunPaths(){ if(TUN_S) return TUN_S; TUN_S=TUN_PATHS.map((P,pi)=>({id:P.id,pi,rails:!!P.rails,S:tunSample(P.pts.map(q=>[q[0],q[1],q[2]+(P.id===-1?TUN.WIDEN:TUN.WIDEN_NARROW)]),pi)}));
  const bw=Math.ceil(TUN.RX),bh=Math.ceil(TUN.RZ); TUN_BK={w:bw,h:bh,c:Array.from({length:bw*bh},()=>[])};
  for(const P of TUN_S) for(let i=0;i<P.S.length-1;i++){ const a=P.S[i],b=P.S[i+1],m=2.4;
    const i0=Math.max(0,Math.floor((Math.min(a.x,b.x)-m+TUN.RX)/2)),i1=Math.min(bw-1,Math.floor((Math.max(a.x,b.x)+m+TUN.RX)/2)),k0=Math.max(0,Math.floor((Math.min(a.z,b.z)-m+TUN.RZ)/2)),k1=Math.min(bh-1,Math.floor((Math.max(a.z,b.z)+m+TUN.RZ)/2));
    for(let k=k0;k<=k1;k++) for(let j=i0;j<=i1;j++) TUN_BK.c[k*bw+j].push([P,i]); }
  return TUN_S; }
/* how far inside open space (x,z) is, in metres (negative: in the earth), and which space it belongs to */
function tunField(x,z){ tunPaths(); let best=-9,id=-9; const j=Math.floor((x+TUN.RX)/2),k=Math.floor((z+TUN.RZ)/2);
  if(j>=0&&k>=0&&j<TUN_BK.w&&k<TUN_BK.h) for(const [P,i] of TUN_BK.c[k*TUN_BK.w+j]){ const a=P.S[i],b=P.S[i+1],dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1e-9;
    const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2)),d=Math.hypot(x-a.x-dx*t,z-a.z-dz*t),f=a.hwn+(b.hwn-a.hwn)*t-d; if(f>best){ best=f; id=P.id; } }
  for(const R_ of TUN_ROOMS){ const qx=Math.abs(x-R_.c[0])-R_.h[0]+R_.r,qz=Math.abs(z-R_.c[1])-R_.h[1]+R_.r; if(qx>2.5||qz>2.5) continue;
    const sd=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-R_.r,f=-sd+(R_.n?R_.n*fbm(x*.8,z*.8,4402,3):0); if(f>best){ best=f; id=R_.id; } }
  return {f:best,id}; }
/* the sample nearest (x,z) on any path with this id */
function tunNear(id,x,z){ let bp=null,bd=1e9; for(const P of tunPaths()) if(P.id===id) for(const p of P.S){ const d=Math.hypot(p.x-x,p.z-z); if(d<bd){ bd=d; bp=p; } } return bp; }
function inRoom(x,z,m=0){ return TUN_ROOMS.some(R_=>Math.abs(x-R_.c[0])<R_.h[0]+m&&Math.abs(z-R_.c[1])<R_.h[1]+m); }
/* the flooded stretch: walkable cells of the main line between TUN_WET's two x */
function tunWet(x,z){ if(FLOOR.mode!=='tunnel'||!FLOOR.wet) return false; const c=navCell(x,z); return c>=0&&FLOOR.wet[c]===1; }

/* a lumpy heap of loose earth, stones in it (the slump in the old bore, the cave-in) */
function dirtHeap(n,rx,rz,H,seed){ const g=new Geo(),R0=6,SG=14,ht=(u,a)=>{ const k=Math.max(0,1-u*u); return H*Math.pow(k,.75)*(1+.22*fbm(Math.cos(a)*u*3+9,Math.sin(a)*u*3,seed,2))+(u<.98?.03*fbm(u*9,a*3,seed+1,2):0); };
  for(let r=0;r<=R0;r++) for(let j=0;j<=SG;j++){ const u=r/R0,a=j/SG*Math.PI*2,x=Math.sin(a)*u*rx,z=Math.cos(a)*u*rz; g.v([x,r===R0?0:ht(u,a),z],[0,1,0],[x/.6+.5,z/.6+.5]); }
  for(let r=0;r<R0;r++) for(let j=0;j<SG;j++){ const a=r*(SG+1)+j,b=a+1,c=a+SG+1,d=c+1; g.I.push(a,c,b,b,c,d); }
  g.groups.push({start:0,count:g.I.length,mi:0}); flatNormals(g); mk(g,MT(tMud,{double:true,color:0xc8b8a8}),n);
  const rs=rng(seed+2); for(let i=0;i<Math.round(6*rx*rz/.5);i++){ const a=rs()*6.28,u=.35+rs()*.55,sz=.07+rs()*.09; mk(box(sz,sz*.7,sz*1.2),M(null,{color:[0x6a6258,0x5a5248,0x7a7064][i%3]}),n,Math.sin(a)*u*rx,ht(u,a)*.85,Math.cos(a)*u*rz,rs(),rs()*3,rs()); } }

/* ---------- the level ---------- */
function genTunnel(){
  setWorld(TUN.RX,TUN.RZ);
  disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=1; FLOOR.test=true; FLOOR.mode='tunnel'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.offT=null; FLOOR.hot=[]; FLOOR.flick=null; FLOOR.rewards=[]; setLang(true);
  const G=floorN, B={g:G}, TH=TUN.TH; GEO_TEMP=true;
  /* sample the open field on a 0.25 m grid over the world */
  const GS=.25,X0=-TUN.RX,Z0=-TUN.RZ,GW=Math.round(TUN.RX*2/GS)+1,GH=Math.round(TUN.RZ*2/GS)+1,FF=new Float32Array(GW*GH);
  for(let k=0;k<GH;k++) for(let i=0;i<GW;i++) FF[k*GW+i]=tunField(X0+i*GS,Z0+k*GS).f;
  const fAt=(x,z)=>tunField(x,z).f;
  /* things are built in 6 m tiles, so the renderer can drop whole stretches the fog has swallowed */
  const TILE=6,tiles=new Map(),tileOf=(x,z)=>{ const key=Math.floor((x+TUN.RX)/TILE)+','+Math.floor((z+TUN.RZ)/TILE); let t=tiles.get(key); if(!t){ t=new Geo(); tiles.set(key,t); } return t; };
  /* walls: trace the zero line of the field (marching squares), then raise each piece into a ragged earth face */
  const segs=[]; const E_=(i0,k0,i1,k1)=>{ const fa=FF[k0*GW+i0],fb=FF[k1*GW+i1],t=fa/(fa-fb); return [X0+(i0+(i1-i0)*t)*GS,Z0+(k0+(k1-k0)*t)*GS]; };
  for(let k=0;k<GH-1;k++) for(let i=0;i<GW-1;i++){ const v0=FF[k*GW+i]>0,v1=FF[k*GW+i+1]>0,v2=FF[(k+1)*GW+i+1]>0,v3=FF[(k+1)*GW+i]>0,c=v0|v1<<1|v2<<2|v3<<3; if(!c||c===15) continue;
    const e=[()=>E_(i,k,i+1,k),()=>E_(i+1,k,i+1,k+1),()=>E_(i+1,k+1,i,k+1),()=>E_(i,k+1,i,k)],mid=(FF[k*GW+i]+FF[k*GW+i+1]+FF[(k+1)*GW+i+1]+FF[(k+1)*GW+i])/4>0;
    const L={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:mid?[[0,1],[2,3]]:[[3,0],[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],10:mid?[[3,0],[1,2]]:[[0,1],[2,3]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]]}[c];
    for(const [a,b] of L) segs.push([e[a](),e[b]()]); }
  { const ys=[0,.5,1.05,1.6,TH+.06];
    const jit=(x,z,y)=>{ const a=x<-10.1&&x>-13&&z>-4.7&&z<-1.3?0:.07; return [x+a*fbm(x*2.1+y*1.3,z*2.1,4410,2),z+a*fbm(x*2.1,z*2.1+y*1.3,4411,2)]; };
    for(const [p,q] of segs){ let dx=q[0]-p[0],dz=q[1]-p[1]; const l=Math.hypot(dx,dz); if(l<1e-4) continue; dx/=l; dz/=l; let nx=-dz,nz=dx; const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2;
      if(fAt(mx+nx*.08,mz+nz*.08)<fAt(mx-nx*.08,mz-nz*.08)){ nx=-nx; nz=-nz; } /* face into the open */
      const g=tileOf(mx,mz),ax=Math.abs(dx)>Math.abs(dz),u=pt=>(ax?pt[0]:pt[1])/1.2,base=g.P.length/3;
      for(const y of ys) for(const pt of [p,q]){ const j=jit(pt[0],pt[1],y); g.v([j[0],y,j[1]],[nx,0,nz],[u(pt),y/(TH+.3)]); }
      for(let r=0;r<ys.length-1;r++){ const a=base+r*2,b=a+1,c=a+2,d=a+3; g.I.push(a,b,d,a,d,c); } }
    const wallM=MT(tEarth,{double:true}); for(const g of tiles.values()){ g.groups.push({start:0,count:g.I.length,mi:0}); mk(g,wallM,G); } }
  /* their collision: the ring of earth cells next to open space, merged greedily into as few boxes as possible */
  { const shell=new Uint8Array(GW*GH),used=new Uint8Array(GW*GH);
    for(let k=0;k<GH;k++) for(let i=0;i<GW;i++){ if(FF[k*GW+i]>0) continue; let near=false; for(let b=-2;b<=2&&!near;b++) for(let a=-2;a<=2;a++){ const ii=i+a,kk=k+b; if(ii>=0&&kk>=0&&ii<GW&&kk<GH&&FF[kk*GW+ii]>0){ near=true; break; } } if(near) shell[k*GW+i]=1; }
    for(let k=0;k<GH;k++) for(let i=0;i<GW;i++){ if(!shell[k*GW+i]||used[k*GW+i]) continue; let w=1; while(i+w<GW&&shell[k*GW+i+w]&&!used[k*GW+i+w]) w++;
      let h=1; grow: while(k+h<GH){ for(let a=0;a<w;a++) if(!shell[(k+h)*GW+i+a]||used[(k+h)*GW+i+a]) break grow; h++; }
      for(let b=0;b<h;b++) for(let a=0;a<w;a++) used[(k+b)*GW+i+a]=1;
      addBox(X0+(i-.5)*GS,X0+(i+w-.5)*GS,Z0+(k-.5)*GS,Z0+(k+h-.5)*GS,0,TH+.3,'wall'); } }
  /* floor and ceiling: a finely divided sheet per tile that has any tunnel in it, so the bulbs light them and the far ones cull */
  { const mud=MT(tMud,{repeat:[TILE/1.2,TILE/1.2]}),roof=MT(tEarth,{repeat:[TILE/1.2,TILE/1.2]});
    for(let tz=0;tz<Math.ceil(TUN.RZ*2/TILE);tz++) for(let tx=0;tx<Math.ceil(TUN.RX*2/TILE);tx++){ let any=false;
      for(let k=Math.round(tz*TILE/GS);k<=Math.min(GH-1,Math.round((tz+1)*TILE/GS))&&!any;k++) for(let i=Math.round(tx*TILE/GS);i<=Math.min(GW-1,Math.round((tx+1)*TILE/GS));i++) if(FF[k*GW+i]>-.3){ any=true; break; }
      if(!any) continue; const cx=X0+(tx+.5)*TILE,cz=Z0+(tz+.5)*TILE;
      mk(plane(TILE,TILE,6,6),mud,G,cx,0,cz,-Math.PI/2); mk(plane(TILE,TILE,6,6),roof,G,cx,TH,cz,Math.PI/2); } }
  addBox(-TUN.RX,TUN.RX,-TUN.RZ,TUN.RZ,TH,TH+.3,'ceil');
  const paths=tunPaths();
  /* a strip along a path: the rails (painted, so they follow the bends), the bulb cable, the pump hose */
  const strip=(S,s0,s1,off,w,y,mat,vs,down)=>{ let g=null,n=0,key='';
    const flush=()=>{ if(g&&g.I.length){ g.groups.push({start:0,count:g.I.length,mi:0}); mk(g,mat,G); } g=new Geo(); n=0; };
    flush(); for(const p of S){ if(p.s<s0||p.s>s1) continue; const k2=Math.floor((p.x+TUN.RX)/TILE)+','+Math.floor((p.z+TUN.RZ)/TILE); if(k2!==key&&n>1){ flush(); } key=k2; /* a new mesh per tile; the first pair of the next one repeats the last */
      const nx=-p.tz,nz=p.tx,cx=p.x+nx*off,cz=p.z+nz*off; g.v([cx+nx*w/2,y,cz+nz*w/2],[0,down?-1:1,0],[0,p.s/vs]); g.v([cx-nx*w/2,y,cz-nz*w/2],[0,down?-1:1,0],[1,p.s/vs]);
      if(n){ const a=(n-1)*2; if(down) g.I.push(a,a+2,a+1,a+1,a+2,a+3); else g.I.push(a,a+1,a+2,a+1,a+3,a+2); } n++;
      if(n===1&&g.P.length>6){} }
    flush(); };
  const railM=M(tRailsPaint,{cut:true,double:true}),cableM=M(null,{color:0x111214,double:true});
  for(const P of paths) if(P.rails){ const end=P.S[P.S.length-1].s; strip(P.S,.6,end-.6,0,.9,.015,railM,.6,false); strip(P.S,0,end,.3,.025,TH-.12,cableM,1,true); }
  /* timber frames across the paths, square to the tunnel: posts each side and a header. Only where both posts stand against
     earth (so never out in a junction or another tunnel's mouth), and never inside a chamber */
  const frame=(p,thin)=>{ const nx=-p.tz,nz=p.tx,ry=Math.atan2(nx,nz),half=p.hwn-.11,t=thin?.1:.12; /* posts tight to the dug face */
    for(const sd of [-1,1]){ const px=p.x+nx*half*sd,pz=p.z+nz*half*sd; if(fAt(px+nx*sd*.34,pz+nz*sd*.34)>-.02||fAt(px,pz)>.4) return false; }
    for(const sd of [-1,1]){ const px=p.x+nx*half*sd,pz=p.z+nz*half*sd; mk(box(t,TH-.02,t,{at:[0,(TH-.02)/2,0]}),MT(tBeam),G,px,0,pz,0,ry,0); addBox(px-t/2,px+t/2,pz-t/2,pz+t/2,0,TH,'post'); }
    mk(box(.14,thin?.11:.14,half*2+.1),MT(tBeam),G,p.x,TH-.08,p.z,0,ry,0); return true; };
  for(const P of paths){ if(P.id===0) continue; const thin=P.id!==-1,gap=thin?2.0:1.7,end=P.S[P.S.length-1].s; let next=1.0;
    for(const p of P.S){ if(p.s<next||p.s>end-.8) continue; if(inRoom(p.x,p.z,.6)) continue; if(frame(p,thin)) next=p.s+gap; } }
  /* the cart, on the wide bend, pushed to one side so you can squeeze past */
  { const p=tunNear(-1,6.6,.3),ry=Math.atan2(p.tx,p.tz),nx=-p.tz,nz=p.tx,cx=p.x+nx*.5,cz=p.z+nz*.5; place(B,'cart',cx,cz,ry);
    const ex=.37*Math.abs(Math.cos(ry))+.57*Math.abs(Math.sin(ry)),ez=.37*Math.abs(Math.sin(ry))+.57*Math.abs(Math.cos(ry)); addBox(cx-ex,cx+ex,cz-ez,cz+ez,0,.92,'furn'); }
  /* puddles */
  [[-8.6,-3.4,1.4,1.0,0],[3.0,-2.4,1.6,1.1,1],[.6,-1.4,1.0,1.6,2],[3.6,4.4,1.7,1.0,1],[8.0,4.5,1.2,.9,0],[-3.9,-3.8,.9,.7,2],[-2.0,-6.6,1.1,.8,1],[24.9,-4.2,1.3,.9,2],[25.9,2.9,1.2,.8,0],[-8.0,-12.4,1.0,.8,1]].forEach(([x,z,w,d,v],i)=>
    mk(plane(w,d,3,3),M(tPuddle[v],{cut:true}),G,x,.012,z,-Math.PI/2,0,i*1.3));
  /* the flooded stretch: shin-deep standing water over the main line, a submersible pump losing the fight, its hose up the wall */
  { const g=new Geo(); FLOOR.wetGrid=null;
    for(let k=0;k<GH-1;k++) for(let i=0;i<GW-1;i++){ const x=X0+i*GS,z=Z0+k*GS; if(FF[k*GW+i]<-.12||!TUN_WATER.some(w=>x+GS/2>w.x0&&x+GS/2<w.x1&&z+GS/2>w.z0&&z+GS/2<w.z1)) continue;
      const b=g.P.length/3; for(const [a,c] of [[0,0],[GS,0],[GS,GS],[0,GS]]) g.v([x+a,.17,z+c],[0,1,0],[(x+a)/1.4,(z+c)/1.4]); g.I.push(b,b+2,b+1,b,b+3,b+2); }
    g.groups.push({start:0,count:g.I.length,mi:0}); mk(g,M(tFlood),G);
    const pp=tunNear(-1,13.2,2.4),nx=-pp.tz,nz=pp.tx,px=pp.x+nx*.55,pz=pp.z+nz*.55; mk(box(.3,.4,.3,{at:[0,.2,0]}),M(null,{color:0x3a5a3a}),G,px,0,pz); addBox(px-.15,px+.15,pz-.15,pz+.15,0,.4,'prop');
    const S=paths[0].S,s0=tunNear(-1,13.2,2.4).s; strip(S,s0,s0+5.5,.6,.07,.175,M(null,{color:0x14161a,double:true}),1,false); }
  /* start dugout: the ladder up into the stash house, light falling down the shaft */
  { const l=N(G,-12.65,0,-3,0,-Math.PI/2,0); FX.ladder(l,TH+.3); mk(plane(.9,.9),M(null,{color:0x8a7454,unlit:true,double:true}),G,-12.45,TH-.01,-3,Math.PI/2); }
  place(B,'sandbags',-11.9,-4.3,0,6); place(B,'gascyl',-10.75,-4.25);
  /* the pump room: generator (shoot it: lights out), a table, the product */
  const gen=powered(place(B,'generator',-5.35,.62),.75,25); const gb=addBox(-5.8,-4.9,.34,.9,0,1.0,'generator'); gb.onHit=()=>tunnelPower(false);
  place(B,'table',-3.75,-.68,0,1.0,.6,0xd8d4cc); addBox(-4.25,-3.25,-.98,-.38,0,.77,'furn'); mk(box(.3,.2,.2),M(null,{color:0x2a2a2e}),G,-3.55,.88,-.7); /* in the corner: the doorway south to the vent stays clear */
  place(B,'bricksPile',-4.35,.75,0,12,13); addBox(-4.95,-3.75,.45,1.05,0,.4,'furn'); place(B,'gascyl',-3.4,.75);
  /* the dormitory: mattresses on the floor, a TV on a crate, washing on a line, plastic chairs */
  place(B,'mattress',-4.4,-12.05,0); addBox(-5.35,-3.45,-12.55,-11.55,0,.27,'step');
  place(B,'mattress',-1.9,-12.05,0); addBox(-2.85,-.95,-12.55,-11.55,0,.27,'step');
  place(B,'mattress',-4.9,-10.0,Math.PI/2); addBox(-5.4,-4.4,-10.95,-9.05,0,.27,'step');
  powered(place(B,'crt',-1.35,-11.1,-Math.PI/2,true),.7,10); addBox(-1.6,-1.1,-11.45,-10.75,0,1.0,'furn');
  place(B,'pchair',-2.6,-11.6,Math.PI/2); place(B,'pchair',-3.5,-10.3,Math.PI*.8);
  { const l=N(G,-3.2,0,-11.0,0,0,0); FX.laundry(l,3.2); }
  /* the cave-in: the old dig ends in a fallen heap; a crate before it, his shotgun on top */
  { const p=tunNear(-5,-11.4,-13.35),n=N(G,p.x,0,p.z,0,Math.atan2(p.tx,p.tz),0); dirtHeap(n,.85,1.1,1.25,4640); addBox(p.x-.7,p.x+.7,p.z-.7,p.z+.7,0,1.2,'furn');
    for(const [o,a] of [[.3,.5],[-.25,-.4]]){ mk(box(.14,.14,1.5),MT(tBeam),n,o,.5,-.3,.6,a,0); } }
  { const p=tunNear(-5,-9.9,-12.9); place(B,'crates',p.x,p.z,Math.atan2(p.tx,p.tz)); addBox(p.x-.4,p.x+.4,p.z-.4,p.z+.4,0,1.1,'furn'); FLOOR.rewards.push({key:'shotgun',p:[p.x,1.16,p.z],ry:Math.atan2(p.tx,p.tz)}); }
  /* the old bore: no rails, thinner older timbers, a wall slumped into a heap, a cooler someone left in a hollow, one dead bulb */
  { const p=tunNear(-3,1.0,.8),nx=-p.tz,nz=p.tx,cx=p.x+nx*.62,cz=p.z+nz*.62,n=N(G,cx,0,cz,0,Math.atan2(nx,nz),0); dirtHeap(n,.62,.85,.62,4620);
    addBox(cx-.3,cx+.3,cz-.3,cz+.3,0,.45,'prop'); /* solid, but routed past rather than around: the bore is too tight for the nav grid otherwise */
    mk(box(.14,.14,1.35),MT(tBeam),n,-.32,.27,-.05,.36,-.35,.05); } /* the fallen header: one end up on the heap, the other in the mud */
  { const p=tunNear(-3,.3,-.6),nx=-p.tz,nz=p.tx,cx=p.x-nx*.48,cz=p.z-nz*.48,n=N(G,cx,0,cz,0,Math.atan2(p.tx,p.tz),0); /* local +x is the wall, -x the tunnel */
    mk(box(.36,.34,.56,{at:[0,.17,0]}),M(tCoolerBody),n); mk(box(.3,.02,.5),M(null,{color:0x0e1012}),n,0,.341,0);
    const lid=N(n,.18,.345,0,0,0,-.42); mk(box(.38,.05,.58),M(tCoolerLid),lid,-.18,.025,0);
    for(const s of [-1,1]) mk(box(.12,.03,.03),M(null,{color:0x2a4f86}),n,0,.27,s*.29);
    mk(box(.012,.05,.06),M(null,{color:0x1a1c1e}),n,-.186,.31,0); mk(box(.1,.1,.03),M(tCoolerTag),n,-.182,.16,.12,0,-Math.PI/2,0);
    const can=M(tCan,{double:true}); mk(cyl(.033,.033,.12,8),can,n,-.3,.06,.36); mk(cyl(.033,.033,.12,8),can,n,-.42,.034,-.38,Math.PI/2,0,.4);
    const cr=mk(cyl(.036,.03,.12,7),can,n,-.18,.02,-.5,Math.PI/2,0,1.1); cr.s=[1,1,.34];
    const bt=[],rb=rng(4630); for(let i=0;i<9;i++) bt.push([-.15-rb()*.45,.006,(rb()-.5)*1.1,.028,.01,.01]); mk(mergeBoxes(bt),M(null,{color:0xd8cfbc}),n);
    addBox(cx-.22,cx+.22,cz-.22,cz+.22,0,.42,'prop'); }
  /* the staging chamber: the counting table in the middle, product and bricks along the north wall, its three doorways clear
     (west from the flooded stretch, east to the exit line, south into the drift) */
  place(B,'counttable',20.9,-1.5,0); addBox(20.0,21.8,-1.95,-1.05,0,.8,'furn');
  place(B,'pchair',20.5,-.75,Math.PI); place(B,'pchair',21.4,-.7,Math.PI*.9);
  place(B,'stash',19.3,-2.35,0); addBox(18.85,19.75,-2.65,-2.05,0,1.3,'furn'); place(B,'stash',22.95,.3,Math.PI/2); addBox(22.65,23.25,-.15,.75,0,1.3,'furn');
  place(B,'bricksPile',21.0,-2.45,0,16,21); addBox(20.35,21.65,-2.75,-2.15,0,.5,'furn'); place(B,'gascyl',18.95,-1.7);
  /* the old shaft at the end of the main line: its ladder still there, buried to the waist where the shaft came down */
  place(B,'sandbags',27.0,-13.5,0,6); addBox(26.25,27.75,-13.8,-13.3,0,.36,'prop');
  { const l=N(G,28.15,0,-12.6,0,Math.PI/2,0); FX.ladder(l,TH+.3); const n=N(G,27.7,0,-12.6,0,.4,0); dirtHeap(n,.85,1.0,1.1,4660); addBox(26.9,28.5,-13.5,-11.7,0,1.0,'furn');
    for(const [o,a] of [[.2,.7],[-.3,-.5]]) mk(box(.14,.14,1.6),MT(tBeam),n,o,.7,.1,.7,a,.2); }
  /* the exit: the ladder up to the other side, sandbags along the wall, the spray paint */
  place(B,'sandbags',33.5,20.3,Math.PI/2,6); addBox(33.35,33.65,19.55,21.05,0,.36,'prop');
  { const l=N(G,TUN_EXIT[0],0,TUN_EXIT[1]+.05,0,0,0); FX.ladder(l,TH+.3); mk(plane(.8,.8),M(null,{color:0x0a0c10}),G,TUN_EXIT[0],TH-.01,TUN_EXIT[1]+.05,Math.PI/2); }
  mk(plane(1.6,.4),MT(tSpray,{cut:true,double:true}),G,31.52,1.45,20.2,0,Math.PI/2,0);
  /* the vent shaft: a big intake fan on its stand, a ladder up to the grate and the daylight coming down it, a chair and a radio */
  { const n=N(G,-13.15,0,7.4,0,Math.PI/2,0); mk(box(.5,.9,.3,{at:[0,.45,0]}),mBlackPipe,n,0,0,0); mk(cyl(.62,.62,.42,12),M(null,{color:0x4a5048}),n,0,1.25,0,Math.PI/2,0,0);
    const bl=N(n,0,1.25,.22); for(let i=0;i<4;i++) mk(box(.12,.52,.02),M(null,{color:0x2a2c2a}),bl,0,0,0,0,0,i*Math.PI/2+.3); FLOOR.fan=bl; addBox(-13.6,-12.7,6.95,7.85,0,1.9,'furn'); }
  { const l=N(G,-11.8,0,9.85,0,0,0); FX.ladder(l,TH+.3); mk(plane(1.0,1.0),M(null,{color:0x9ab0c8,unlit:true,double:true}),G,-11.8,TH-.01,9.55,Math.PI/2);
    const g=N(G,-11.8,TH-.02,9.55); for(let i=-2;i<=2;i++) mk(box(.02,.02,1.0),mBlackPipe,g,i*.2,0,0); }
  place(B,'pchair',-10.6,9.3,-Math.PI*.7); mk(box(.28,.16,.1),M(null,{color:0x2a2a2c}),G,-10.3,.08,9.6);
  /* the sump: standing water wall to wall, a pump losing the fight, hoses up the wall; an MP5 left up on the dry crates */
  { mk(box(.4,.5,.4,{at:[0,.25,0]}),M(null,{color:0x3a5a3a}),G,-20.0,0,8.6); addBox(-20.2,-19.8,8.4,8.8,0,.5,'prop');
    mk(box(.06,TH,.06,{at:[0,TH/2,0]}),M(null,{color:0x14161a}),G,-19.9,0,8.95); mk(box(.06,.06,1.8),M(null,{color:0x14161a}),G,-20.6,.2,8.6,0,.6,0);
    place(B,'crates',-23.4,8.3,.3); addBox(-23.85,-22.9,7.85,8.75,0,1.1,'furn'); FLOOR.rewards.push({key:'smg',p:[-23.4,1.16,8.3],ry:.3}); }
  /* the packing lab: two tables of product being weighed and wrapped, crates of it stacked by the doors */
  place(B,'counttable',11.2,15.2,0); addBox(10.3,12.1,14.75,15.65,0,.8,'furn');
  place(B,'table',13.6,15.4,0,1.6,.9,0xd8d4cc); addBox(12.8,14.4,14.95,15.85,0,.78,'furn'); { const n=N(G,13.4,.78,15.35); FX.bricksPile(n,12,31); mk(box(.3,.08,.25),M(null,{color:0xd8d8dc}),G,14.1,.82,15.2); }
  place(B,'pchair',11.0,14.4,Math.PI); place(B,'pchair',13.9,14.6,Math.PI*1.1);
  place(B,'stash',10.1,13.1,Math.PI/2); addBox(9.8,10.4,12.65,13.55,0,1.3,'furn'); place(B,'stash',14.7,16.0,0); addBox(14.25,15.15,15.7,16.3,0,1.3,'furn'); place(B,'gascyl',9.9,16.0);
  /* the rail line: a cart left halfway, a stack of crates */
  { const p=tunNear(-7,22.4,14.6),ry=Math.atan2(p.tx,p.tz),nx=-p.tz,nz=p.tx,cx=p.x+nx*.72,cz=p.z+nz*.72; place(B,'cart',cx,cz,ry);
    const ex=.37*Math.abs(Math.cos(ry))+.57*Math.abs(Math.sin(ry)),ez=.37*Math.abs(Math.sin(ry))+.57*Math.abs(Math.cos(ry)); addBox(cx-ex,cx+ex,cz-ez,cz+ez,0,.92,'furn'); }
  { const p=tunNear(-7,31.2,14.5),nx=-p.tz,nz=p.tx,cx=p.x-nx*.55,cz=p.z-nz*.55; place(B,'crates',cx,cz,.4); addBox(cx-.4,cx+.4,cz-.4,cz+.4,0,1.1,'furn'); }
  /* the dig face: the compressor thumping, the spoil heap, work lights on tripods, wheelbarrow and shovels. Still being dug */
  { const c=powered(place(B,'generator',39.5,12.3,0),.7,25); addBox(39.0,40.0,12.0,12.6,0,1.0,'furn');
    const h=N(G,39.4,0,14.9,0,.3,0); dirtHeap(h,.75,.95,.95,4670); addBox(38.8,40.0,14.1,15.6,0,.9,'furn');
    for(const [x,z,ry] of [[36.3,12.0,.8],[38.3,15.5,-2.4]]){ const n=N(G,x,0,z,0,ry,0); for(let i=0;i<3;i++) mk(box(.03,1.75,.03,{at:[0,.86,0]}),mBlackPipe,n,Math.sin(i*2.1)*.25,0,Math.cos(i*2.1)*.25,Math.cos(i*2.1)*.13,0,-Math.sin(i*2.1)*.13);
      mk(box(.36,.28,.22),M(null,{color:0x2a2a2c}),n,0,1.78,0,-.3,0,0); mk(plane(.3,.22),M(null,{color:0xfff4d8,unlit:true}),n,0,1.78,.112,-.3,0,0); }
    const wb=N(G,36.6,0,15.1,0,.5,0); mk(box(.6,.25,.85,{tw:.8,td:.8,at:[0,.42,0]}),M(null,{color:0x5a6a58}),wb); mk(cyl(.15,.15,.06,8),mBlackPipe,wb,0,.15,.45,0,0,Math.PI/2); for(const s of [-1,1]) mk(box(.03,.03,.9),mWood,wb,s*.22,.45,-.35,.3,0,0);
    for(const [x,z,a] of [[40.0,13.4,.25],[40.0,13.8,.15]]) { mk(box(.03,1.25,.03,{at:[0,.62,0]}),mWood,G,x,0,z,0,0,a); mk(box(.2,.25,.02),mBlackPipe,G,x+.02,.12,z,0,0,a); }
    place(B,'sandbags',36.2,15.4,0,6); }
  /* bulbs on the cable. The lit ones are lights (the nearest six are switched on each frame); the dead ones leave long black stretches.
     The old bore, the drift and the cave-in have none at all */
  FLOOR.bulbs=[]; FLOOR.lights=[];
  const LIT=[[-11.6,-3.0,'room',.85,.55,.26,3.4,1],[-4.6,-.25,'room',1.0,.72,.4,3.9],[-.2,-3.75,-1,.85,.55,.26,3.4],[-3.2,-10.7,'room',.85,.6,.32,3.6],[9.4,4.4,-1,.85,.55,.26,3.4],
    [15.2,2.6,-1,.62,.62,.38,3.6],[20.0,-1.1,'room',.95,.7,.4,4.0],[22.4,-1.4,'room',.95,.7,.4,4.0],[25.2,-5.2,-1,.85,.55,.26,3.4],[27.4,-12.5,'room',.85,.55,.26,3.4],
    [-11.8,9.4,'day',.32,.4,.52,4.4],[-21.2,6.8,'room',.55,.6,.36,3.2],[11.6,14.0,'room',.95,.72,.42,3.8],[13.8,14.8,'room',.95,.72,.42,3.8],[19.8,14.8,-7,.85,.55,.26,3.4],[28.6,14.5,-7,.85,.55,.26,3.4],
    [36.3,12.0,'work',1.0,.95,.82,4.6],[38.3,15.5,'work',1.0,.95,.82,4.6],[32.6,20.0,'room',.85,.55,.26,3.4]];
  for(const [x,z,on,r,g_,b_,rad,fl] of LIT){ if(on==='day'||on==='work'){ FLOOR.bulbs.push({p:[x,on==='day'?TH-.3:1.6,z],c:[r,g_,b_],r:rad,always:on==='day'}); continue; }
    const p=on==='room'?{x,z}:tunNear(on,x,z),n=N(G,p.x,TH-.19,p.z); FX.bulb(n,true); powered(n,.9,4);
    FLOOR.bulbs.push({p:[p.x,TH-.27,p.z],c:[r,g_,b_],r:rad,flick:fl?n.kids[0].mesh.mats[0]:null}); }
  for(const [id,x,z] of [[-1,-7.6,-3.2],[-1,-3.0,-3.9],[-1,3.4,-2.5],[-1,6.7,.9],[-1,12.6,2.6],[-1,17.8,1.2],[-1,24.7,-8.4],[-4,-1.9,-6.8],[-3,.6,2.0],[-13,-6.6,4.8],[-10,-16.2,8.1],[-11,10.6,8.4],[-7,24.6,14.7],[-7,33.8,14.1],[-8,26.2,10.4],[-12,33.3,16.6]]){ const p=tunNear(id,x,z); FX.bulb(N(G,p.x,TH-.19,p.z),false); }
  GEO_TEMP=false;
  /* navigation: walkable cells are well inside open space and clear of furniture */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9),wet=new Uint8Array(NX*NZ),furn=BOXES.filter(b=>b.kind==='furn'||b.kind==='generator');
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i,r=tunField(x,z); if(r.f<-.3) continue; space[id]=r.id; if(TUN_WATER.some(w=>r.id===w.id&&x>w.x0&&x<w.x1&&z>w.z0&&z<w.z1)) wet[id]=1; if(r.f<.4) continue; /* a walker is 0.28 m round and the walls' boxes stick 0.13 m out of the dug face: routes stay clear of both */
    let bl=false; for(const b of furn){ if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const U=(id,apt,R_)=>({id,side:1,x0:R_.c[0]-R_.h[0],x1:R_.c[0]+R_.h[0],z0:R_.c[1]-R_.h[1],z1:R_.c[1]+R_.h[1],w:R_.h[0]*2,apt,door:R_.c[0]-R_.h[0],room:true,lit:true});
  const units=[U(0,'PUMP',TUN_ROOMS[1]),U(1,'OLD SHAFT',TUN_ROOMS[2]),U(2,'STAGING',TUN_ROOMS[3]),U(3,'DORM',TUN_ROOMS[4]),U(4,'VENT',TUN_ROOMS[5]),U(5,'SUMP',TUN_ROOMS[6]),U(6,'LAB',TUN_ROOMS[7]),U(7,'DIG',TUN_ROOMS[8]),U(8,'EXIT',TUN_ROOMS[9])];
  Object.assign(FLOOR,{nav,space,wet,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.4,z:-3.0,yaw:-Math.PI/2}});
  tunnelLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }
/* the flooded stretch's water: dark brown-green, faint ripple bands that only show under a bulb */
const tFlood=tex(32,32,'#1e2420',g=>{ const r=rng(4650); for(let y=0;y<32;y++){ const k=Math.sin(y*.55+Math.sin(y*.21)*2); if(k>.75) R(g,'rgba(120,130,110,.35)',0,y,32,1); }
  for(let i=0;i<40;i++) R(g,'rgba(70,58,36,.35)',r()*32|0,r()*32|0,2,1); grain(g,8,4651); });
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
function tunnelLights(){ setLights(Object.assign({},TUN_LIGHT,FLOOR.power?{pl:[]}:{amb:[.003,.003,.003],pl:[]})); tunnelPickLights(); }
/* light slots 0-5 go to the six lit bulbs nearest your eyes (6 is the goggles' torch, 7 the muzzle flash). Bulbs are 5+ m apart
   and the fog closes at 11 m, so a bulb only drops out of the six once it's lost in the fog anyway */
function tunnelPickLights(){ if(FLOOR.mode!=='tunnel'||!FLOOR.bulbs) return;
  for(let i=0;i<6;i++){ L.plPos.set([0,-50,0],i*3); L.plCol.set([0,0,0],i*3); L.plDist[i]=1; }
  const e=camBasis().eye;
  const near=FLOOR.bulbs.filter(b=>FLOOR.power!==false||b.always).map(b=>[b,Math.hypot(b.p[0]-e[0],b.p[2]-e[2])]).filter(o=>o[1]<18).sort((a,b)=>a[1]-b[1]).slice(0,6);
  near.forEach(([b],i)=>{ let c=b.c; if(b.flick){ const on=(Math.sin(GAME.t*23)+Math.sin(GAME.t*7.3)>-.7)||Math.sin(GAME.t*1.3)>.1,fk=on?1:.15; c=[c[0]*fk,c[1]*fk,c[2]*fk]; b.flick.color=on?[1,1,1]:[.3,.3,.32]; }
    L.plPos.set(b.p,i*3); L.plCol.set(c,i*3); L.plDist[i]=b.r; }); }
/* you're lit if you're within a bulb's reach with the power on */
function litAt(x,z){ if(!FLOOR.bulbs) return false; for(const b of FLOOR.bulbs) if((FLOOR.power!==false||b.always)&&Math.hypot(b.p[0]-x,b.p[2]-z)<b.r*1.1) return true; return false; }
function tunnelPower(on){ if(FLOOR.mode!=='tunnel'||FLOOR.power===on) return; FLOOR.power=on;
  if(!on){ FLOOR.offT=GAME.t; FLOOR.flick=null; sfx('bump',1); sfx('slowout',.7); const F=fieldTo(PL.x,PL.z); for(const E of enemies) if(!E.dead){ const c=navCell(E.pos[0],E.pos[1]),near=F&&c>=0&&F[c]<1e9?F[c]<=500:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<25; /* within 25 m of walking */ setTimeout(()=>{ if(E.dead) return; /* the men near you come for you; the rest of the tunnel goes jumpy (sharper eyes) and holds where it is */
    if(near||E.aware){ E.aware=true; E.mind='hunt'; if(E.st==='idle') E.st='alert'; } else if(!E.mind||E.mind==='calm') E.mind='nervous'; if(!E.dead&&E.barkCd<=0&&(near||Math.random()<.4)) bark(E,pick([es('¡Se fue la luz!','The lights went out!'),es('¿Qué pasó?','What happened?'),es('¡Prendan la planta!','Start the generator!')]),2.4); },200+Math.random()*700); } }
  tunnelLights(); visionApply(); }

/* ---------- seeing in the dark ---------- */
/* in a dark tunnel they see you up close, or by your muzzle flash for a moment after you fire */
function inBore(x,z){ if(FLOOR.mode!=='tunnel'||!FLOOR.space) return false; const c=navCell(x,z); return c>=0&&FLOOR.space[c]===-3; }
function seenInDark(E,dist){ if(FLOOR.mode==='ware') return wareSeen(E,dist); if(FLOOR.mode==='motel') return motelSeen(E,dist); const flash=GAME.t-(GAME.shotT??-99)<1.4&&dist<16;
  if(FLOOR.mode!=='tunnel') return FLOOR.power!==false||dist<1.8||flash;
  /* in the tunnel: lit by a bulb, they see you; in the black between bulbs (or with the power cut), only up close or by your muzzle flash */
  if(litAt(PL.x,PL.z)) return true; return dist<(FLOOR.power!==false?2.6:1.8)||flash; }
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
  if(GAME.vision==='nv'){ const e=camBasis().eye; L.plPos.set(e,18); L.plCol.set([1.6,1.6,1.6],18); L.plDist[6]=15; } else if(FLOOR.mode==='tunnel'){ L.plCol.set([0,0,0],18); } }
function visionProgram(){ return GAME.vision==='nv'?NVP2:GAME.vision==='thermal'?THP2:null; }
function tunnelTag(){ if(FLOOR.mode!=='tunnel') return; const dead=enemies.filter(E=>E.dead).length; $('floorTag').textContent=`Tunnel · ${dead}/${enemies.length} down${FLOOR.power===false?' · lights off':''}`; }
function tickTunnel(dt){ visionTick(dt); tunnelPickLights(); if(FLOOR.mode==='tunnel'&&FLOOR.fan){ FLOOR.fan.spin=lerp(FLOOR.fan.spin||0,FLOOR.power===false?0:14,Math.min(1,dt*(FLOOR.power===false?.4:2))); FLOOR.fan.r[2]+=FLOOR.fan.spin*dt; }
  if(FLOOR.mode==='tunnel'){ tunnelTag.t=(tunnelTag.t||0)-dt; if(tunnelTag.t<=0){ tunnelTag.t=.5; tunnelTag(); } }
  if(FLOOR.mode!=='tunnel'||!GAME.started||PL.dead||GAME.clear) return;
  if(Math.hypot(PL.x-TUN_EXIT[0],PL.z-TUN_EXIT[1])<.9){ GAME.clear=true; tunnelAscend(); } } /* up the ladder: the warehouse on the other side (37-warehouse.js) */
