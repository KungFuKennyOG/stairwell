/* =====================================================================
   CLUTTER (floor 01 prototype): household junk you pick up and throw to pull a man away from where you are.
   Mugs, plates, a glass, beer cans, a tin ashtray, a shoe, on the tables and the floors (pfThrowables, called from pfItems).
   They are ordinary pickups (LOOSE, grabOrDrop, updatePickups): grip to take one, let go with the hand moving to throw it; Q on a
   keyboard throws what the right hand holds, U picks one up.
   Where it lands is what the men hear (noise() at the impact point, never at you): a mug or a plate smashing carries, a can
   clatters, a shoe thuds. 83-hunt.js sends one man to look there (or moves the search there, during a hunt).
   Thrown hard, the ceramic and the glass break: a few shards stay on the floor. A mug in the face makes a man flinch and look
   back the way it came; it does him no harm.
   WPN[k].clutter: {brk, snd, hit, kind, rad}. Event: clutterLand(item, point, {broke, man}) on the first real impact of a throw.
   ===================================================================== */

/* ---------- paint ---------- */
const clChips=(n,hex,s=1)=>(I,r,w,h)=>{ for(let i=0;i<n;i++) blob(I,r()*w,r()*h,1.1*s,.8*s,.65,hex); };
Object.assign(PR_TX,{
  clMugOut:()=>prSurf(16,16,2201,(x,y)=>y===6||y===9?['#6e4426','enamel']:y===7||y===8?['#a4683c','enamel']:['#e2d8bc','enamel'],'enamel',{rim:0,grime:.28,fn:clChips(4,'#8c7c62')}),
  clMugIn:()=>prSurf(8,8,2202,'#4e3220','enamel',{rim:0,grime:.3,low:0}),
  clMugRed:()=>prSurf(16,16,2203,'#962a1e','enamel',{rim:0,grime:.3,fn:clChips(6,'#221c18',1.3)}),
  clMugRedIn:()=>prSurf(8,8,2204,'#d4cdbd','enamel',{rim:0,grime:.4,low:0,fn:clChips(2,'#6a5a44')}),
  clPlate:()=>prSurf(16,16,2205,(x,y)=>y===6||y===9?['#284682','enamel']:y===4||y===11?['#5a72a6','enamel']:['#e6e0d0','enamel'],'enamel',{rim:0,grime:.22,fn:clChips(2,'#a89c84')}),
  clGlass:()=>prSurf(16,8,2206,(x,y)=>['#9db0ac','enamel',x%4===0?1.28:1],'enamel',{rim:0,grime:.12,low:.05}),
  clCan:()=>prSurf(16,16,2207,(x,y)=>y<2||y>13?['#b6b2a6','steel']:y>=6&&y<=9?['#a2231a','paint']:['#c4962e','paint'],'paint',{rim:0,grime:.18,
    fn:(I,r)=>{ blob(I,8,7.5,2.6,1.3,.9,'#e6dabd'); blob(I,8,7.5,1.2,.6,.9,'#a2231a'); for(let i=0;i<3;i++) blob(I,r()*16,2+r()*12,.9,.6,.5,'#6a5a3a'); }}),
  clCanEnd:()=>prSurf(8,8,2208,'#a8a59a','steel',{rim:.3,grime:.25}),
  clTin:()=>prSurf(16,8,2209,'#857550','steel',{rim:0,grime:.4,fn:clChips(3,'#3a3226')}),
  clAsh:()=>prSurf(8,8,2210,'#57534c','conc',{rim:0,grime:.2,low:0,fn:clChips(4,'#1c1a18',1.2)}),
  clShoe:()=>prSurf(16,16,2211,'#4a3424','paint',{grime:.32,fn:(I,r)=>{ for(let i=0;i<5;i++) blob(I,r()*16,r()*16,1.6,1,.45,'#7a5a40');
    for(let y=3;y<10;y+=2) softLine(I,6,y,10,y,'#1c1612',.8,.6); }}),
  clSole:()=>prSurf(16,8,2212,'#7e705a','conc',{rim:.2,grime:.3})
});

/* ---------- the things (item space as in 87-props.js: lying at rest +x is up, the lowest point 4 cm below the origin) ---------- */
const clUp=(g,x=-.04,z=0)=>N(g,x,0,z,0,0,-Math.PI/2); /* a lathe or cylinder's +y turned to item +x, its base at x */
function pclMug(g,red){ const n=clUp(g),mO=prM(red?'clMugRed':'clMugOut'),mI=prM(red?'clMugRedIn':'clMugIn');
  mk(prLathe(red?[[0,0,.5],[0,.039,.5],[.004,.041,.5],[.09,.041,.5],[.092,.0425,.5],[.092,.038,.5]]:[[0,0,.5],[0,.034,.5],[.004,.039,.5],[.088,.042,.5],[.095,.041,.5],[.095,.0365,.5]],8),mO,n);
  mk(prLathe([[red?.092:.095,red?.038:.0365,.5],[.012,.034,.5],[.012,0,.5]],8),mI,n);
  mk(torus(.024,.0062,4,8),mO,n,0,.05,-.047,0,Math.PI/2,0); return g; }
function pclPlate(g){ const n=clUp(g,-.04,.1); /* the plate's middle 10 cm in front of the hand, held by the rim */
  mk(prLathe([[.016,0,0],[.016,.065,.29],[.023,.1,.45],[.025,.112,.5],[.018,.113,.5],[.004,.08,.64],[0,.07,.69],[0,0,1]],10),prM('clPlate'),n); return g; }
function pclTumbler(g){ const n=clUp(g);
  mk(prLathe([[0,0,.5],[0,.03,.5],[.1,.036,.5],[.1,.033,.5],[.01,.027,.5],[.01,0,.5]],8),prM('clGlass'),n); return g; }
function pclCan(g,crushed){ const k=crushed?.55:1,n=clUp(g,-.04+.061*k); if(crushed){ n.s=[1.08,k,.9]; n.r[0]=.25; }
  prCyl(n,[prM('clCan'),prM('clCanEnd'),prM('clCanEnd')],.033,.033,.122,8); return g; }
function pclAshtray(g){ const n=clUp(g);
  mk(prLathe([[0,0,.5],[0,.052,.5],[.008,.06,.5],[.022,.064,.5],[.022,.056,.5]],10),prM('clTin'),n);
  mk(prLathe([[.022,.056,.5],[.009,.046,.5],[.009,0,.5]],10),prM('clAsh'),n);
  for(const [a,l] of [[.3,.03],[2.4,.022],[4.2,.026]]){ const b=N(n,Math.sin(a)*.045,.024,Math.cos(a)*.045,0,a,Math.PI/2-.15); prCyl(b,prC(0xd6ccb4),.0042,.0042,l,5); prCyl(b,prC(0xb4783a),.0044,.0044,.009,5,0,l/2+.004,0); }
  return g; }
function pclShoe(g){ const s=prM('clSole'),u=prM('clShoe'); /* a man's worn work shoe, the toe forward of the hand that holds it by the heel */
  prBox(g,s,.026,.1,.29,-.027,0,.1,0,0,0,{tw:1,td:1});
  prCB(g,u,.07,.092,.19,.02,0,.06,0,0,0,{cell:.1,puff:[.008,.008,.01,0,.004,.006]});
  prCB(g,u,.045,.088,.1,.008,0,.19,0,0,0,{cell:.1,puff:[.01,.01,.008,0,.012,0]}); return g; }

const PR_FIST_C=p=>[{a:p.slice(),b:p.slice(),r:.05,kind:'blunt'}];
const clDef=(label,build,grip,mass,c)=>({label,build,grip,fwd:true,melee:'blunt',reach:1.05,pts:[grip.slice()],speed:1.5,mass,tool:'clutter',clutter:c,strike:PR_FIST_C(grip)});
Object.assign(WPN,{
  mug:     clDef('Mug',g=>pclMug(g,false),[.01,0,-.06],.32,{brk:true,snd:'smash',hit:'clink',kind:'smash',shards:12}),
  mugTin:  clDef('Enamel mug',g=>pclMug(g,true),[.01,0,-.058],.2,{brk:false,snd:'clink',kind:'clatter'}),
  plate:   clDef('Plate',pclPlate,[-.02,0,0],.4,{brk:true,snd:'smash',hit:'clink',kind:'smash',shards:16}),
  tumbler: clDef('Glass',pclTumbler,[.01,0,0],.22,{brk:true,snd:'glass',hit:'clink',kind:'smash',shards:10}),
  beercan: clDef('Beer can',g=>pclCan(g,false),[.02,0,0],.03,{brk:false,snd:'tin',kind:'clatter'}),
  beercanC:clDef('Crushed can',g=>pclCan(g,true),[0,0,0],.03,{brk:false,snd:'tin',kind:'clatter'}),
  ashtray: clDef('Tin ashtray',pclAshtray,[-.03,0,-.055],.15,{brk:false,snd:'tin',kind:'clatter'}),
  shoe:    clDef('Shoe',pclShoe,[0,0,-.02],.55,{brk:false,snd:'thud',kind:'thud'})
});
if(typeof PICK_NAMES!=='undefined') Object.assign(PICK_NAMES,{mug:'Mug',mugTin:'Enamel mug',plate:'Plate',tumbler:'Glass',beercan:'Beer can',beercanC:'Crushed can',ashtray:'Tin ashtray',shoe:'Shoe'});
/* what the men hear, by kind (83-hunt.js reads PROTO.hunt.hear; each wall in between halves it) */
if(PROTO.hunt&&PROTO.hunt.hear) Object.assign(PROTO.hunt.hear,{smash:12,clatter:7,thud:3.5});
if(typeof HUNT_K!=='undefined') Object.assign(HUNT_K,{smash:['noise',1],clatter:['noise',.6],thud:['noise',.5]});
const CL_RAD={smash:12,clatter:7,thud:3.5}; /* the same, for the old noise() off the prototype */

/* ---------- landing (updatePickups calls these for clutter) ---------- */
/* a wall or the floor at speed sp, at point at. True if it broke (it's gone from LOOSE) */
function clutterHit(P,sp,at){ const w=WPN[P.item.key],c=w&&w.clutter; if(!c) return false;
  const flung=P.thrown,first=!P.clN; P.thrown=false; if(sp<1.4) return false; P.clN=(P.clN||0)+1;
  const p=[at[0],Math.max(at[1],.03),at[2]];
  if(c.brk&&flung&&sp>3.2){ sfx(c.snd,1,p); spray(p,[0,1,0],c.shards||10,1.3,.9,'glass',.022); noise(p,CL_RAD.smash,{kind:'smash'});
    protoEmit('clutterLand',P.item,p,{broke:true}); removePickup(P); return true; }
  const loud=flung||sp>3.5,kind=c.kind==='smash'?'clatter':c.kind;
  sfx(c.hit||c.snd,clamp(sp/6,.25,1)*(first?1:.55),p);
  if(loud&&(first||sp>3)) noise(p,CL_RAD[kind],{kind});
  if(first&&flung) protoEmit('clutterLand',P.item,p,{broke:false});
  return false; }
/* it reached a man: a flinch and a look back the way it came, no harm. True if it broke on him */
function clutterHitMan(P,E,p,dir,sp){ const c=WPN[P.item.key].clutter; P.thrown=false; P.clN=(P.clN||0)+1;
  if(!E.dead&&E.B){ kickV(E.B,PI_.head,v3.sc(dir,.35*clamp(sp/6,.3,1)),H); faceHold(E,'hurt',.6); E.stun=Math.max(E.stun||0,.25);
    if(!E.aware&&!E.civ&&typeof investigate==='function'){ const back=v3.sub(p,v3.sc(dir,3)); investigate(E,navSnap(back[0],back[2])); } }
  noise(p,CL_RAD.thud,{kind:'thud'});
  const broke=c.brk&&sp>5; sfx(broke?c.snd:'thud',.8,p); protoEmit('clutterLand',P.item,p.slice(),{broke,man:E});
  if(broke){ spray(p,v3.sc(dir,-1),c.shards||10,1.4,.9,'glass',.022); removePickup(P); return true; }
  P.v=v3.sc(P.v,-.2); return false; }

/* ---------- where it lies on floor 01: [key, x, surface y, z, yaw]. Floor spots are skipped if furniture is there ---------- */
const PF_CLUTTER=[
  ['mug',-9.85,.76,3.5,.4],['plate',-9.05,.76,4.05,0],                 /* Dani's kitchen table, by his rice */
  ['plate',3.18,.76,3.38,0],['mugTin',3.62,.76,2.65,2.1],               /* the tenants' table */
  ['ashtray',.42,.72,9.55,0],['beercan',.68,.72,9.7,0],                  /* the card table */
  ['tumbler',3.15,.92,-6.0,0],['mug',2.45,.76,-4.15,1.2],               /* Doña Chela's counter and table */
  ['beercanC',-8.8,0,-3.0,.7],['beercan',-3.0,0,7.6,2.2],              /* the front room floor, Kev's floor */
  ['shoe',-6.2,0,-8.0,1.9],['shoe',-7.6,0,9.0,-.6]                      /* by the bedroom door, Dani's back room */
];
function pfThrowables(put){ if(!PROTO.on) return;
  const free=(x,z)=>!boxesAt(x,z).some(b=>!b.sightOnly&&b.h>.05&&x>b.x0-.06&&x<b.x1+.06&&z>b.z0-.06&&z<b.z1+.06);
  for(const [k,x,y,z,yaw] of PF_CLUTTER){ if(!WPN[k]) continue; if(y<.01&&!free(x,z)) continue; put(newItem(k),[x,y,z,yaw]); } }
