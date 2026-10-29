/* =====================================================================
   THE FLOOR: one generated storey of the tower, as a playable level.
   The layout comes from the art-test generator (corridor, apartments both sides, party walls with holes,
   a barricade, stairwells at both ends). Here it also becomes collision boxes, a nav grid for the
   people who live there, doors that open, and lights.
   West stairwell (-x) is where you come in; on the test floor it is the armory landing. East (+x) goes up.
   ===================================================================== */
const RX=13,RZ=6,RH=2.8;
const BOXES=[];                       /* {x0,x1,z0,z1,y0,h,kind} axis-aligned, y from y0 to h */
const floorN=N(world);
const FLOOR={n:1,seed:1,test:true,nav:null,space:null,units:[],doors:[],lights:[],start:{x:-11.3,z:0,yaw:-Math.PI/2},flick:null,bx:0,party:[]};

function addBox(x0,x1,z0,z1,y0,h,kind){ const b={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y0,h,kind}; BOXES.push(b); return b; }
function removeBox(b){ const i=BOXES.indexOf(b); if(i>=0) BOXES.splice(i,1); boxGridDirty=true; }

/* boxes bucketed on a 1 m grid so a body, a blood drop or the player only tests the few boxes around it */
const BG_W=RX*2,BG_H=RZ*2; let boxGrid=null,boxGridDirty=true;
function buildBoxGrid(){ boxGrid=Array.from({length:BG_W*BG_H},()=>[]);
  for(const b of BOXES){ const i0=Math.max(0,Math.floor(b.x0-.3+RX)),i1=Math.min(BG_W-1,Math.floor(b.x1+.3+RX)),k0=Math.max(0,Math.floor(b.z0-.3+RZ)),k1=Math.min(BG_H-1,Math.floor(b.z1+.3+RZ));
    for(let k=k0;k<=k1;k++) for(let i=i0;i<=i1;i++) boxGrid[k*BG_W+i].push(b); }
  boxGridDirty=false; }
const NO_BOXES=[];
function boxesAt(x,z){ if(boxGridDirty) buildBoxGrid(); const i=Math.floor(x+RX),k=Math.floor(z+RZ); return i<0||k<0||i>=BG_W||k>=BG_H?NO_BOXES:boxGrid[k*BG_W+i]; }

/* ---------- generation ---------- */
const FURN_H={mattress:.27,bed:.5,couch:.9,tv:.92,table:.77,counter:.92,fridge:1.7,crates:1.1,trash:.35,wardrobe:1.9,desk:.78,filing:1.3,bucket:.3};
function genFloor(n,seed,test=true){
  disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=n; FLOOR.seed=seed; FLOOR.test=test; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.mode='tower'; FLOOR.power=true; setLang(false); FLOOR.start={x:-11.3,z:0,yaw:-Math.PI/2};
  const G=floorN; GEO_TEMP=true;
  const tier=tierOf(n), deco=tier<2?0:tier<4?1:2;
  const r=rng((seed*2654435761 ^ n*40503)>>>0);
  const pick=a=>a[r()*a.length|0];
  const blocked=new Uint8Array(NX*NZ), space=new Int16Array(NX*NZ).fill(-9), barr=new Uint8Array(NX*NZ);
  function blockRect(x0,z0,x1,z1,arr=blocked){ for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k); if(x>x0&&x<x1&&z>z0&&z<z1) arr[k*NX+i]=1; } }

  /* units */
  const units=[];
  for(const side of [1,-1]){ let x=-10;
    while(x<9.99){ let w=3.4+r()*2.4; if(10-x-w<3.2) w=10-x; units.push({side,x0:x,x1:x+w,w}); x+=w; } }
  units.sort((a,b)=>b.side-a.side||a.x0-b.x0);
  units.forEach((u,i)=>{ u.id=i; u.apt=String(n).padStart(2,'0')+String(i+1).padStart(2,'0');
    u.door=u.x0+.9+r()*(u.w-1.8); const d=r(); u.doorState=d<.45?'open':d<.82?'closed':'kicked';
    u.type=pick(UNIT_TYPES[tier]); u.lit=false; });
  /* party walls, holes, barricade */
  const party=[];
  for(const side of [1,-1]){ const row=units.filter(u=>u.side===side); for(let i=1;i<row.length;i++) party.push({side,x:row[i].x0,hole:r()<.28?{zc:1.8+r()*3.2}:null,a:row[i-1],b:row[i]}); }
  const cand=party.filter(p=>p.x>-6&&p.x<6); const bp=pick(cand.length?cand:party);
  if(!bp.hole) bp.hole={zc:1.8+r()*3.2}; const bx=bp.x;
  /* space ids: -1 corridor, -2 stairwells, >=0 the unit */
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i;
    if(Math.abs(x)>10){ if(Math.abs(x)<=13&&Math.abs(z)<=2) space[id]=-2; else blocked[id]=1; }
    else if(Math.abs(z)<1) space[id]=-1;
    else { const u=units.find(u=>u.side===Math.sign(z)&&x>=u.x0&&x<u.x1); if(u) space[id]=u.id; }
    if(Math.abs(z)>=6||Math.abs(x)>=13) blocked[id]=1; }

  /* walls, split into ~1.5 m chunks so the affine warp stays subtle; every chunk is also a collision box */
  const H_=RH,T=.14, unitWall=[], hallWall=[], stairWall=[];
  function wallRun(list,axis,c,s0,s1,gaps){
    gaps=gaps.slice().sort((a,b)=>a.s-b.s); let s=s0;
    const seg=(a,b,y0,y1)=>{ const len=b-a; if(len<=.01) return; const nC=Math.max(1,Math.ceil(len/1.5)); for(let q=0;q<nC;q++){ const a2=a+len*q/nC,b2=a+len*(q+1)/nC,m=(a2+b2)/2,l=b2-a2;
        if(axis==='x') list.push([m,(y0+y1)/2,c,l,y1-y0,T,l/1.5,(y1-y0)/2.8]); else list.push([c,(y0+y1)/2,m,T,y1-y0,l,l/1.5,(y1-y0)/2.8]); } };
    for(const gp of gaps){ const a=gp.s-gp.w/2,b=gp.s+gp.w/2; seg(s,a,0,H_); if(gp.y0>0) seg(a,b,0,gp.y0); seg(a,b,gp.y1,H_); s=b; }
    seg(s,s1,0,H_);
    for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k); const along=axis==='x'?x:z, across=axis==='x'?z:x;
      if(Math.abs(across-c)>.2||along<s0-.2||along>s1+.2) continue;
      if(gaps.some(gp=>gp.y0===0&&Math.abs(along-gp.s)<gp.w/2-.2)) continue; blocked[k*NX+i]=1; } }
  for(const side of [1,-1]){
    const row=units.filter(u=>u.side===side);
    wallRun(hallWall,'x',side*1,-10,10,row.map(u=>({s:u.door,w:1.0,y0:0,y1:2.1})));
    wallRun(unitWall,'x',side*6,-10,10,row.filter(u=>u.w>=3.6).map(u=>({s:(u.x0+u.x1)/2,w:1.4,y0:.9,y1:2.0})));
    wallRun(unitWall,'z',-10,side>0?1:-6,side>0?6:-1,[]); wallRun(unitWall,'z',10,side>0?1:-6,side>0?6:-1,[]);
  }
  for(const p of party){ const z0=p.side>0?1:-6,z1=p.side>0?6:-1; wallRun(unitWall,'z',p.x,z0,z1,p.hole?[{s:p.side*p.hole.zc,w:1.0,y0:0,y1:2.0}]:[]); }
  for(const sx of [-1,1]){ wallRun(stairWall,'z',sx*13,-2,2,[]); wallRun(stairWall,'x',2,sx>0?10:-13,sx>0?13:-10,[]); wallRun(stairWall,'x',-2,sx>0?10:-13,sx>0?13:-10,[]); }
  const wallTex=[tPeel,tPaper,tDarkPaint][deco];
  mk(mergeBoxes(unitWall),M(wallTex),G); mk(mergeBoxes(hallWall),M(tHallWall),G); mk(mergeBoxes(stairWall),M(tStairWall),G);
  for(const e of [...unitWall,...hallWall,...stairWall]) addBox(e[0]-e[3]/2,e[0]+e[3]/2,e[2]-e[5]/2,e[2]+e[5]/2,e[1]-e[4]/2,e[1]+e[4]/2,'wall');

  /* floors and ceiling */
  mk(plane(20,12,20,12),M([tLinoStain,tCarpet,tParquet][deco],{repeat:[10,6]}),G,0,0,0,-Math.PI/2);
  mk(plane(20,2,20,2),M(deco===2?tCarpet:tLinoHall,{repeat:[10,1],color:deco===2?0x8a6060:0xffffff}),G,0,.004,0,-Math.PI/2);
  for(const sx of [-1,1]) mk(plane(3,4,3,4),M(tConcrete,{repeat:[1.5,2]}),G,sx*11.5,.004,0,-Math.PI/2);
  mk(plane(26,12,26,12),M(tConcrete,{repeat:[13,6],color:0x6a6866}),G,0,RH,0,Math.PI/2);

  /* stairwells. East: the flight up (walk onto it to climb) and the dark way down, fenced off.
     West: where you came in. On the test floor it is the armory landing (no stairs, the rack and the spawn board go here). */
  for(const sx of [-1,1]){ const cm=M(tConcrete);
    const westTest=sx<0&&test;
    if(!westTest){
      for(let s=0;s<7;s++){ const h=(s+1)*.17; mk(box(.34,h,1.7,{at:[0,h/2,0]}),cm,G,sx*(10.45+s*.34),0,1.05); addBox(sx*(10.28+s*.34),sx*(10.62+s*.34),.2,1.9,0,h,'step'); }
      mk(box(3,.04,1.8),M(null,{color:0x050506,unlit:true}),G,sx*11.5,.006,-1.05);
      mk(box(2.6,.04,.04),mSteel,G,sx*11.6,.95,-.12); addBox(sx*10.3,sx*12.9,-1.95,-.2,0,1.0,'rail');
      blockRect(sx>0?10.2:-13.1,.15,sx>0?13.1:-10.2,1.95); blockRect(sx>0?10.3:-13.1,-1.95,sx>0?13.1:-10.3,-.2); }
    const nm=N(G,sx*12.92,westTest?2.38:1.7,-1.0,0,sx>0?-Math.PI/2:Math.PI/2,0); mk(plane(1.0,.5),M(floorNum(sx<0?n:Math.min(30,n+1)),{cut:true}),nm);
    if(sx>0&&n>=8){ const c=N(G,11.2,1.15,-1.92); mk(box(.9,.5,.12),F(M(tAxeRed),M(tAxeCase)),c); }
  }
  FLOOR.stairUp={x0:10.35,x1:12.9,z0:.2,z1:1.9};

  /* doors: every door hangs on a hinge so it can be opened later (kicked in loud, or eased open) */
  for(const u of units){ const z=u.side*1, dm=F(M(tDoorWood),M(tDoorWood));
    if(u.doorState==='kicked'){ mk(box(1.0,.05,2.05),F(M(tDoorWood),M(tDoorWood),M(tDoorWood),M(tDoorWood)),G,u.door+.1,.03,u.side*2.1,0,.25,0); continue; }
    const hinge=N(G,u.door-.5,0,z,0,0,0); mk(box(1.0,2.05,.05,{at:[.5,1.025,0]}),dm,hinge);
    const D={u,x:u.door,side:u.side,hinge,ang:0,target:0,box:null,state:'closed',swingT:0};
    setDoor(D,u.doorState==='open'?'open':'closed',true); FLOOR.doors.push(D); }
  /* windows: glass you can't fall through (yet) */
  for(const u of units) if(u.w>=3.6){ mk(plane(1.4,1.1),M(tNightWin,{unlit:true,color:0x9a9a9a}),G,(u.x0+u.x1)/2,1.45,u.side*5.94,0,u.side>0?Math.PI:0,0);
    addBox((u.x0+u.x1)/2-.7,(u.x0+u.x1)/2+.7,u.side*6-.07,u.side*6+.07,.9,2.0,'window'); }

  /* furniture */
  const furn=[]; const seats=[], beds=[];
  function place(u,kind,where){
    const w0=u.w; let lu,lv,rot=0; const holeL=party.find(p=>p.side===u.side&&Math.abs(p.x-u.x0)<.01&&p.hole);
    const doorU=u.door-u.x0;
    if(where==='back'){ lu=w0*(.3+r()*.4); lv=4.45; rot=0; }
    else if(where==='front'){ lu=doorU<w0/2?w0*.72:w0*.28; lv=1.0; rot=Math.PI; }
    else if(where==='mid'){ lu=w0/2+(r()-.5)*.6; lv=2.7; rot=r()<.5?0:Math.PI/2; }
    else if(where==='side'){ const leftOK=!holeL||Math.abs(holeL.hole.zc-1-2.8)>1.6; lu=leftOK?.45:w0-.45; lv=2.8; rot=leftOK?-Math.PI/2:Math.PI/2; }
    else { const right=r()<.5; lu=right?w0-.5:.5; lv=4.4; rot=0; }
    if(where!=='back'&&where!=='corner'&&lv<1.6&&Math.abs(lu-doorU)<1.0) lu=doorU<w0/2?w0-.5:.5;
    const x=u.x0+lu, z=u.side*(1+lv), ry=(u.side>0?Math.PI:0)+rot;
    const node=N(G,x,0,z,0,ry,0); const info=FURN[kind](node);
    let [w,d]=info.size; if(Math.abs(Math.sin(rot))>.5) [w,d]=[d,w];
    blockRect(x-w/2+.05,z-d/2+.05,x+w/2-.05,z+d/2-.05);
    addBox(x-w/2,x+w/2,z-d/2,z+d/2,0,FURN_H[kind]||.8,'furn');
    const rec={kind,node,x,z,u,info}; furn.push(rec);
    if(info.seat) seats.push(rec); if(info.bed) beds.push(rec);
    return rec; }
  for(const u of units){ const kit=KITS[u.type]; for(const [kind,where] of kit) if(r()<.85) place(u,kind,where); }

  /* barricade across the corridor: the loud way is blocked, the quiet way goes through the hole next to it */
  { const b=N(G,bx,0,0), mm=M(tMattress), fm=F(M(tFridge),M(tFridge));
    mk(box(.7,.7,1.7),fm,b,-.15,.35,-.1,0,.15,0); mk(box(.2,.95,1.9),mm,b,.3,.47,.05,0,0,.2);
    mk(box(.9,.05,.7),M(tWoodLight),b,-.1,.9,.3,.4,.3,.1); for(const z of [-.7,.6]) mk(box(.5,.45,.5,{at:[0,.225,0]}),M(tCrate),b,.45,0,z,0,r(),0);
    mk(box(.4,.3,.4,{at:[0,.15,0]}),M(tTrash),b,-.55,0,.6); }
  blockRect(bx-.75,-1.05,bx+.75,1.05,barr); addBox(bx-.6,bx+.6,-.93,.93,0,1.0,'barricade');

  /* graffiti */
  for(let t=0;t<3;t++){ const side=r()<.5?1:-1, x=-8.5+r()*17; if(units.some(u=>u.side===side&&Math.abs(u.door-x)<1.3)||Math.abs(x-bx)<1) continue;
    mk(plane(1.6,.4),M(TAGS[r()*TAGS.length|0],{cut:true}),G,x,1.35+r()*.4,side*.925,0,side>0?Math.PI:0,0); }

  /* corridor tubes and the lights: one flickering tube, one steady, some lived-in units, a bare bulb on the landing */
  const flick=-7+r()*14, steady=flick>0?-5:5; const lights=[];
  for(let x=-8;x<=8;x+=4){ const live=Math.abs(x-flick)<2, st=!live&&Math.abs(x-steady)<2; const m=live||st?M(tFluo,{unlit:true}):M(tFluoDead);
    mk(box(1.2,.05,.2),m,G,live?flick:st?steady:x,2.75,0); if(live) FLOOR.flick={mat:m,i:0}; }
  lights.push([[flick,2.5,0],[1.15,1.25,1.35],6.5]); lights.push([[steady,2.5,0],[.95,1.0,1.08],6]);
  const litPool=units.slice().sort(()=>r()-.5);
  for(const u of litPool){ if(lights.length>=6) break; const tv=furn.find(f=>f.u===u&&f.info.tv);
    const cx=(u.x0+u.x1)/2, cz=u.side*3.5; u.lit=true;
    if(tv) lights.push([[tv.x,.9,tv.z-u.side*.9],[.45,.6,1.15],4]);
    else { const warm=r()<.7; lights.push([[cx,2.3,cz],warm?[1.5,.85,.38]:[1.1,1.2,1.3],5.2]); mk(cyl(.004,.004,.45,3),mBlack,G,cx,2.58,cz); mk(box(.08,.1,.08),M(warm?tBulb:tFluo,{unlit:true}),G,cx,2.32,cz); } }
  for(const u of units) if(!u.lit){ const cx=(u.x0+u.x1)/2,cz=u.side*3.5; mk(cyl(.004,.004,.45,3),mBlack,G,cx,2.58,cz); mk(box(.08,.1,.08),M(tBulbDead),G,cx,2.32,cz); }
  lights.push([[-11.5,2.35,0],[1.35,1.0,.62],5.5]); mk(cyl(.004,.004,.4,3),mBlack,G,-11.5,2.6,0); mk(box(.08,.1,.08),M(tBulb,{unlit:true}),G,-11.5,2.36,0);
  FLOOR.lights=lights;

  GEO_TEMP=false;
  /* navigation grid for the people: walls, furniture, the barricade and the fenced stair holes are blocked */
  const nav=new Uint8Array(NX*NZ); for(let i=0;i<nav.length;i++) nav[i]=blocked[i]|barr[i];
  Object.assign(FLOOR,{nav,space,units,party,bx,seats,beds,furn});
  setLights({amb:[.16,.155,.18],dir:[.3,1,.4],dirCol:[.06,.06,.08],fog:[.014,.014,.018],fogNear:6,fogFar:19,pl:[...lights,[[0,-50,0],[0,0,0],1]]});
  boxGridDirty=true; navDirty=true;
}

/* ---------- doors ---------- */
function doorBox(D){ if(D.box){ removeBox(D.box); D.box=null; }
  const x=D.x,z=D.side*1;
  if(D.state==='closed') D.box=addBox(x-.5,x+.5,z-.035,z+.035,0,2.05,'door');
  else if(D.state==='open') D.box=addBox(x-.53,x-.47,z,D.side*2,0,2.05,'door');
  boxGridDirty=true; }
function setDoor(D,state,instant){ D.state=state; D.target=state==='open'?-D.side*1.55:0; if(instant){ D.ang=D.target; D.hinge.r=[0,D.ang,0]; doorBox(D); } else { D.swingT=1; if(D.box){ removeBox(D.box); D.box=null; } } }
function updateDoors(dt){ for(const D of FLOOR.doors){ if(D.swingT<=0) continue; const sp=D.loud?9:2.6; D.ang+=clamp(D.target-D.ang,-sp*dt,sp*dt); D.hinge.r=[0,D.ang,0];
  if(Math.abs(D.target-D.ang)<1e-3){ D.swingT=0; D.loud=false; doorBox(D); } } }
function doorNear(x,z,maxD){ let best=null,bd=maxD; for(const D of FLOOR.doors){ const d=Math.hypot(x-D.x,z-D.side); if(d<bd){ bd=d; best=D; } } return best; }

/* ---------- collision queries ---------- */
function solidFor(b,who){ /* what blocks whom: the player and walking people step over mattresses and ignore lintels above their heads */
  if(who==='body') return true;
  if(b.kind==='step') return false;
  return b.y0<1.6&&b.h>.4; }
function pushOutXZ(p,r,who){ /* push a circle (x,z) out of the boxes around it */
  for(let pass=0;pass<2;pass++) for(const b of boxesAt(p[0],p[1])){ if(!solidFor(b,who)) continue;
    if(p[0]>b.x0-r&&p[0]<b.x1+r&&p[1]>b.z0-r&&p[1]<b.z1+r){ const pens=[p[0]-(b.x0-r),(b.x1+r)-p[0],p[1]-(b.z0-r),(b.z1+r)-p[1]],m=pens.indexOf(Math.min(...pens));
      if(m===0) p[0]=b.x0-r; else if(m===1) p[0]=b.x1+r; else if(m===2) p[1]=b.z0-r; else p[1]=b.z1+r; } }
  p[0]=clamp(p[0],-RX+r,RX-r); p[1]=clamp(p[1],-RZ+r,RZ-r); }
function rayBoxes(o,d,maxT,filter){ let best=null; if(boxGridDirty) buildBoxGrid();
  for(const b of BOXES){ if(filter&&!filter(b)) continue; let t0=0,t1=best?best.t:maxT; const lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.h,b.z1]; let nrm=null,ok=true;
    for(let k=0;k<3;k++){ if(Math.abs(d[k])<1e-9){ if(o[k]<lo[k]||o[k]>hi[k]){ ok=false; break; } continue; }
      let ta=(lo[k]-o[k])/d[k],tb=(hi[k]-o[k])/d[k],sg=-1; if(ta>tb){ [ta,tb]=[tb,ta]; sg=1; }
      if(ta>t0){ t0=ta; nrm=[0,0,0]; nrm[k]=sg; } if(tb<t1) t1=tb; if(t0>t1){ ok=false; break; } }
    if(ok&&nrm&&(!best||t0<best.t)) best={t:t0,n:nrm,b}; }
  return best; }
function rayRoom(o,d){ let best={t:1e9,n:[0,1,0]};
  const tryP=(k,v,n)=>{ if(Math.abs(d[k])<1e-9) return; const t=(v-o[k])/d[k]; if(t>0&&t<best.t) best={t,n}; };
  tryP(0,-RX,[1,0,0]); tryP(0,RX,[-1,0,0]); tryP(2,-RZ,[0,0,1]); tryP(2,RZ,[0,0,-1]); tryP(1,0,[0,1,0]); tryP(1,RH,[0,-1,0]);
  const bx=rayBoxes(o,d,best.t); return bx&&bx.t<best.t?bx:best; }
/* can a sees b? walls and doors block sight, furniture below chest height doesn't */
function sightClear(a,b){ const d=v3.sub(b,a),L=Math.hypot(...d); if(L<1e-3) return true; const h=rayBoxes(a,v3.sc(d,1/L),L,x=>x.kind==='wall'||x.kind==='door'||x.h>1.5); return !h; }

/* ---------- navigation: one distance field from the player, shared by everyone hunting him ---------- */
let navDirty=true,navT=0; const NAVD=new Int32Array(NX*NZ);
const navCell=(x,z)=>{ const i=Math.round((x+13)*2),k=Math.round((z+6)*2); return (i<0||k<0||i>=NX||k>=NZ)?-1:k*NX+i; };
const NAVPEN=new Uint8Array(NX*NZ);
/* Dijkstra on 8 neighbours (10 straight, 14 diagonal, no corner cutting) with a bucket queue; pen marks cells that cost extra */
function navField(F,src,pen){ const nav=FLOOR.nav; F.fill(1e9); const buckets=[[src]]; F[src]=0;
  for(let dd=0;dd<buckets.length;dd++){ const q=buckets[dd]; if(!q) continue;
    for(const c of q){ if(F[c]!==dd) continue; const ci=c%NX,ck=(c-ci)/NX;
      for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ if(!i&&!k) continue; const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const nc=nk*NX+ni; if(nav[nc]) continue;
        if(i&&k&&(nav[ck*NX+ni]||nav[nk*NX+ci])) continue; const nd=dd+(i&&k?14:10)+(pen&&pen[nc]?30:0); if(nd<F[nc]){ F[nc]=nd; (buckets[nd]||(buckets[nd]=[])).push(nc); } } } } }
function navUpdate(dt,tx,tz){ navT-=dt; if(navT>0&&!navDirty) return; navT=.25; navDirty=false;
  const nav=FLOOR.nav; NAVD.fill(1e9); let src=navCell(tx,tz); if(src<0) return;
  if(nav[src]){ /* standing against a wall: start from the nearest open cell */ let bd=1e9,bs=-1; for(let k=-2;k<=2;k++) for(let i=-2;i<=2;i++){ const c=src+k*NX+i; if(c>=0&&c<nav.length&&!nav[c]&&i*i+k*k<bd){ bd=i*i+k*k; bs=c; } } if(bs<0) return; src=bs; }
  navField(NAVD,src,null);
  /* spreading out: the hunter nearest you takes the shortest way; each one behind him treats the routes the men ahead are
     taking as in the way (+3 m per cell along them). When that sends a man a different way round, he commits to it: he picks a
     point on his new route (E.via) and walks there first, then hunts you from that side. One flank each, given up once he sees you. */
  const H=enemies.filter(E=>!E.dead&&E.st==='alert'&&!E.grabbed).map(E=>{ const c=navCell(E.pos[0],E.pos[1]); return {E,c,d:c>=0?NAVD[c]:1e9}; }).filter(h=>h.c>=0&&h.d<1e9).sort((a,b)=>a.d-b.d);
  for(const E of enemies) E.navF=null;
  NAVPEN.fill(0);
  const trace=(F,c,fn)=>{ for(let step=0;step<240&&F[c]>0;step++){ const ci=c%NX,ck=(c-ci)/NX; let best=c,bd=F[c];
      for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const q=nk*NX+ni; if(F[q]<bd){ bd=F[q]; best=q; } }
      if(best===c) break; c=best; fn(c); } };
  const mark=c=>{ const ci=c%NX,ck=(c-ci)/NX; for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const ni=ci+i,nk=ck+k; if(ni>=0&&nk>=0&&ni<NX&&nk<NZ) NAVPEN[nk*NX+ni]=1; } };
  for(let n=0;n<H.length&&n<6;n++){ const E=H[n].E,c0=H[n].c; let F=NAVD;
    if(E.via&&(E.canSee||Math.hypot(E.pos[0]-E.via[0],E.pos[1]-E.via[1])<1.0||GAME.t-E.viaT>20)){ E.via=null; E.viaDone=true; }
    if(n>0&&!E.via&&!E.viaDone){ E.navFB=E.navFB||new Int32Array(NX*NZ); navField(E.navFB,src,NAVPEN);
      /* how far does his new route stray from the plain shortest one? if it goes a genuinely different way, commit to its far point */
      const plain=[]; trace(NAVD,c0,c=>plain.push(c)); let far=-1,fd=0;
      trace(E.navFB,c0,c=>{ const x=cellX(c%NX),z=cellZ((c-c%NX)/NX); let m=1e9; for(const q of plain){ const d=Math.hypot(x-cellX(q%NX),z-cellZ((q-q%NX)/NX)); if(d<m) m=d; } if(m>fd){ fd=m; far=c; } });
      if(far>=0&&fd>2.5){ E.via=[cellX(far%NX),cellZ((far-far%NX)/NX)]; E.viaT=GAME.t; } }
    if(E.via){ E.navFB=E.navFB||new Int32Array(NX*NZ); navField(E.navFB,navCell(E.via[0],E.via[1]),null); E.navF=E.navFB; trace(E.navF,c0,mark); continue; }
    if(n>0){ E.navFB=E.navFB||new Int32Array(NX*NZ); navField(E.navFB,src,NAVPEN); E.navF=F=E.navFB; }
    trace(F,c0,mark); } }
function lineClearNav(x0,z0,x1,z1){ const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/.2); for(let s=1;s<n;s++){ const c=navCell(x0+(x1-x0)*s/n,z0+(z1-z0)*s/n); if(c<0||FLOOR.nav[c]) return false; } return true; }
/* which way to walk from (x,z) to reach the player: straight if nothing is in the way, otherwise down the distance field */
function navDir(x,z,tx,tz,F=NAVD){
  if(lineClearNav(x,z,tx,tz)) return norm3([tx-x,0,tz-z]);
  let c=navCell(x,z); if(c<0) return norm3([tx-x,0,tz-z]);
  if(F[c]>=1e9){ let bd=1e9; for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const q=c+k*NX+i; if(q>=0&&q<F.length&&F[q]<bd){ bd=F[q]; c=q; } } if(bd>=1e9) return norm3([tx-x,0,tz-z]); }
  /* follow the field a few cells ahead and aim at the furthest one we can walk to in a straight line */
  let cur=c,aim=null; for(let step=0;step<6;step++){ const ci=cur%NX,ck=(cur-ci)/NX; let best=cur,bd=F[cur];
    for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const q=nk*NX+ni; if(F[q]<bd){ bd=F[q]; best=q; } }
    if(best===cur) break; cur=best; const bxp=cellX(cur%NX),bzp=cellZ((cur-cur%NX)/NX); if(lineClearNav(x,z,bxp,bzp)) aim=[bxp,bzp]; else if(aim) break; else { aim=[bxp,bzp]; break; } }
  if(!aim) return norm3([tx-x,0,tz-z]); const d=norm3([aim[0]-x,0,aim[1]-z]); return Math.hypot(d[0],d[2])>1e-4?d:norm3([tx-x,0,tz-z]); }
/* a free spot in a unit (or the corridor), away from the player */
function freeSpot(pred,minD=4){ for(let tries=0;tries<400;tries++){ const i=Math.random()*NX|0,k=Math.random()*NZ|0,id=k*NX+i; if(FLOOR.nav[id]) continue;
    const x=cellX(i),z=cellZ(k); let ok=true; for(let a=-1;a<=1&&ok;a++) for(let b=-1;b<=1;b++){ const q=id+a*NX+b; if(q<0||q>=FLOOR.nav.length||FLOOR.nav[q]){ ok=false; break; } }
    if(!ok||Math.hypot(x-PL.x,z-PL.z)<minD||!pred(x,z,FLOOR.space[id])) continue; if(enemies.some(E=>Math.hypot(E.pos[0]-x,E.pos[1]-z)<.9)) continue; return {x,z}; } return null; }

/* ---------- the first room (test): the one-apartment level from prototype 01, rebuilt next to the armory landing ----------
   The landing (rack, spawn board, map) is the same; walk east through the doorway into the apartment. Dani, Marco and Teo live here. */
const ROOM_DX=-6; /* the old room was centred on 0; here it sits between x -10 and -2 */
function genRoom(n){
  disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=n; FLOOR.test=true; FLOOR.mode='room'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; setLang(false); FLOOR.start={x:-11.3,z:0,yaw:-Math.PI/2};
  const G=floorN,T=.14,H_=RH; GEO_TEMP=true;
  const wall=(x0,z0,x1,z1,mat,gaps=[])=>{ const alongX=Math.abs(x1-x0)>Math.abs(z1-z0),a0=alongX?Math.min(x0,x1):Math.min(z0,z1),a1=alongX?Math.max(x0,x1):Math.max(z0,z1),c=alongX?z0:x0;
    const seg=(a,b,y0,y1)=>{ if(b-a<.01) return; const m=(a+b)/2,l=b-a; if(alongX){ mk(box(l,y1-y0,T),mat,G,m,(y0+y1)/2,c); addBox(a,b,c-T/2,c+T/2,y0,y1,'wall'); } else { mk(box(T,y1-y0,l),mat,G,c,(y0+y1)/2,m); addBox(c-T/2,c+T/2,a,b,y0,y1,'wall'); } };
    let s=a0; for(const g of gaps){ seg(s,g[0],0,H_); seg(g[0],g[1],g[2],H_); s=g[1]; } seg(s,a1,0,H_); };
  const peel=M(tPeel,{repeat:[2,1.4]}),stw=M(tStairWall,{repeat:[1,1]});
  /* the landing */
  wall(-13,-2,-13,2,stw); wall(-13,-2,-10,-2,stw); wall(-13,2,-10,2,stw);
  mk(plane(3,4,3,4),M(tConcrete,{repeat:[1.5,2]}),G,-11.5,.004,0,-Math.PI/2);
  const nm=N(G,-12.92,2.38,-1.0,0,Math.PI/2,0); mk(plane(1.0,.5),M(floorNum(n),{cut:true}),nm);
  /* the apartment: west wall has the doorway from the landing */
  wall(-10,-4,-10,4,peel,[[-.6,.6,2.1]]); wall(-2,-4,-2,4,peel); wall(-10,-4,-2,-4,peel); wall(-10,4,-2,4,peel);
  mk(plane(8,8,8,8),M(tLinoStain,{repeat:[4,4]}),G,-6,0,0,-Math.PI/2);
  mk(plane(14,10,14,10),M(tConcrete,{repeat:[7,5],color:0x8a8a8a}),G,-7,RH,0,Math.PI/2);
  mk(box(1.0,2.1,.06,{at:[0,1.05,0]}),F(mBlack,M(tFireDoor)),G,-3.5,0,-4+.1);
  mk(box(1.0,2.1,.06,{at:[0,1.05,0]}),F(mBlack,M(tDoorWood)),G,-7.2,0,4-.1,0,Math.PI,0);
  mk(plane(1.4,1.1),M(tNightWin,{unlit:true,color:0x9a9a9a}),G,-2-.08,1.5,-1.4,0,-Math.PI/2,0); addBox(-2.08,-1.92,-2.1,-.7,.9,2.0,'window');
  mk(plane(1.6,.4),M(TAGS[2],{cut:true}),G,-10+.08,1.55,-2.4,0,Math.PI/2,0); mk(plane(1.6,.4),M(TAGS[7],{cut:true}),G,-5.6,1.7,-4+.08);
  const tube=M(tFluo,{unlit:true}); mk(box(1.2,.05,.2),tube,G,-4.2,RH-.03,1.3); FLOOR.flick={mat:tube,i:0};
  mk(cyl(.004,.004,.5,3),mBlack,G,-6.5,RH-.25,-1.2); mk(box(.08,.1,.08),M(tBulb,{unlit:true}),G,-6.5,RH-.53,-1.2);
  mk(cyl(.004,.004,.4,3),mBlack,G,-11.5,2.6,0); mk(box(.08,.1,.08),M(tBulb,{unlit:true}),G,-11.5,2.36,0);
  const furn=[],seats=[],beds=[];
  const place=(kind,x,z,ry)=>{ const node=N(G,x+ROOM_DX,0,z,0,ry,0),info=FURN[kind](node); let [w,d]=info.size; if(Math.abs(Math.sin(ry))>.5) [w,d]=[d,w];
    addBox(x+ROOM_DX-w/2,x+ROOM_DX+w/2,z-d/2,z+d/2,0,FURN_H[kind]||.8,'furn'); const rec={kind,node,x:x+ROOM_DX,z,info}; furn.push(rec); if(info.seat) seats.push(rec); if(info.bed) beds.push(rec); };
  place('couch',-2.2,-3.45,0); place('tv',-2.2,-1.6,Math.PI); place('table',1.3,-.9,0); place('mattress',2.95,2.55,Math.PI/2); place('fridge',-3.55,1.3,Math.PI/2); place('crates',3.2,-3.35,0); place('trash',.3,-3.6,0);
  GEO_TEMP=false;
  /* where people can walk, and which "space" each cell is (0 = the apartment, -2 = the landing) */
  const nav=new Uint8Array(NX*NZ),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i,inRoom=x>-10&&x<-2&&Math.abs(z)<4,inLand=x>-13&&x<=-10&&Math.abs(z)<2;
    space[id]=inRoom?0:inLand?-2:-9; let bl=!(inRoom||inLand);
    if(!bl) for(const b of BOXES){ if(b.y0>1.5) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  const units=[{id:0,side:1,x0:-10,x1:-2,z0:-4,z1:4,w:8,apt:'APT',door:-10,win:[-2,-1.4],room:true,lit:true}];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats,beds,furn,stairUp:null});
  const lights=[[[-4.2,2.6,1.3],[1.15,1.25,1.4],6.5],[[-6.5,2.2,-1.2],[1.7,1.0,.5],7.5],[[-8.2,1.0,-1.95],[.35,.5,1.0],3.2],[[-2.5,1.6,-1.4],[.3,.4,.65],4.5],[[-11.5,2.35,0],[1.35,1.0,.62],5.5]];
  FLOOR.lights=lights;
  setLights({amb:[.19,.18,.21],dir:[.3,1,.4],dirCol:[.08,.08,.1],fog:[.016,.016,.02],fogNear:7,fogFar:20,pl:[...lights,[[0,-50,0],[0,0,0],1]]});
  boxGridDirty=true; navDirty=true; }
