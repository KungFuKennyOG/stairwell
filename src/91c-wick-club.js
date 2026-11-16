/* =====================================================================
   WICK stage 1: the club, Velour. Stage 1 builds three of its nine spaces for the art gate (plan 3.5): the kitchen, the main room
   and the VIP lounge. Stage 5 adds the rest round them and the gameplay (nav, cast, items).
   Layout, x east, z north, metres:
     kitchen  x -13..-7, z -6..0   (2.9 m)   opens into the main room's west wall
     main     x  -7..7,  z -6..6   (4.2 m)   bar on the north wall, fish tank on the west, booths on the south, chandelier over the floor
     VIP      x   7..13, z -1..6   (3.1 m)   through a curtained arch in the main room's east wall
   Lighting is per vertex, so every big surface is cut into ~0.5 m cells (round pools of light). Eight point lights at a time: the
   nearest to you are picked every frame (wkLightsTick).
   ===================================================================== */
const WK_T=.2; /* wall thickness */
const WK_ROOMS=[
  {id:'K',name:'the kitchen',x0:-13,z0:-6,x1:-7,z1:0,h:2.9,kind:'kitchen'},
  {id:'M',name:'the main room',x0:-7,z0:-6,x1:7,z1:6,h:4.2,kind:'main'},
  {id:'V',name:'the office',x0:7,z0:-1,x1:13,z1:6,h:3.1,kind:'vip'}];
/* openings: the two rooms, the wall line, where along it, width, height */
const WK_OPEN=[ {a:'K',b:'M',axis:'z',c:-7,at:-3.6,w:1.3,h:2.3,kind:'pass'}, {a:'M',b:'V',axis:'z',c:7,at:2.3,w:1.9,h:2.6,kind:'arch'} ];
const WK={rich:new URLSearchParams(location.search).get('rich')==='1' /* the richer build: a test until Kenny says yes */,ink:false,lk:3.0,rooms:[],byId:{},lights:[],built:false,matC:new Map(),ticks:[]};

function wkRoomAt(x,z){ for(const r of WK.rooms) if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1) return r; return null; }
/* a material per colour for glows and streaks, made once */
function wkMC(kind,c){ const k=kind+c.join(); let m=WK.matC.get(k); if(!m){ m=wkM()[kind](c); WK.matC.set(k,m); } return m; }

/* a flat face cut into cells: c centre, n normal, v the face's up, su/sv half sizes, tile = metres per texture repeat [u,v] */
function wkGrid(pot,m,c,n,v,su,sv,tile=[1,1],cell=.55){ const u=v3.cross(v,n),nu=Math.max(1,Math.ceil(su*2/cell)),nv=Math.max(1,Math.ceil(sv*2/cell));
  for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a0=-su+su*2*i/nu,a1=-su+su*2*(i+1)/nu,b0=-sv+sv*2*j/nv,b1=-sv+sv*2*(j+1)/nv,ac=(a0+a1)/2,bc=(b0+b1)/2;
    const p=[c[0]+u[0]*ac+v[0]*bc,c[1]+u[1]*ac+v[1]*bc,c[2]+u[2]*ac+v[2]*bc];
    pot.quad(m,p,n,u,v,(a1-a0)/2,(b1-b0)/2,[(a0+su)/tile[0],(b0+sv)/tile[1],(a1+su)/tile[0],(b1+sv)/tile[1]]); } }
const wkQuad=(pot,m,c,n,v,su,sv,uv)=>pot.quad(m,c,n,v3.cross(v,n),v,su,sv,uv);

/* ---------- the shell: floor, ceiling, walls in bands, openings ---------- */
function wkShell(pot,r){ const W=wkM(),T=WK_T/2,h=r.h,cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,w=r.x1-r.x0-WK_T,d=r.z1-r.z0-WK_T;
  const kit=r.kind==='kitchen',fl=kit?W.tileK:W.marble,flT=kit?[.6,.6]:[1.2,1.2];
  wkGrid(pot,fl,[cx,0,cz],[0,1,0],[0,0,-1],w/2,d/2,flT,.5);
  wkGrid(pot,W.ceil,[cx,h,cz],[0,-1,0],[0,0,1],w/2,d/2,[2,2],.7);
  /* each side: inward normal, the line, the span */
  const sides=[{axis:'x',c:r.z0+T,n:[0,0,1],a:r.x0+T,b:r.x1-T},{axis:'x',c:r.z1-T,n:[0,0,-1],a:r.x0+T,b:r.x1-T},{axis:'z',c:r.x0+T,n:[1,0,0],a:r.z0+T,b:r.z1-T},{axis:'z',c:r.x1-T,n:[-1,0,0],a:r.z0+T,b:r.z1-T}];
  for(const S of sides){ const line=S.axis==='x'?(S.n[2]>0?r.z0:r.z1):(S.n[0]>0?r.x0:r.x1);
    const gaps=WK_OPEN.filter(o=>o.axis===S.axis&&Math.abs(o.c-line)<.01&&(o.a===r.id||o.b===r.id)).map(o=>({s0:o.at-o.w/2,s1:o.at+o.w/2,h:o.h,o})).sort((p,q)=>p.s0-q.s0);
    let s=S.a; const spans=[]; for(const g of gaps){ spans.push([s,g.s0,0,h]); spans.push([g.s0,g.s1,g.h,h]); s=g.s1; } spans.push([s,S.b,0,h]);
    for(const [s0,s1,y0,y1] of spans){ if(s1-s0<.01) continue; wkBands(pot,r,S,s0,s1,y0,y1); }
    /* collision: the solid spans, and over the openings */
    for(const [s0,s1,y0,y1] of spans){ if(s1-s0<.01) continue; const lo=line-T,hi=line+T; if(S.axis==='x') addBox(s0,s1,lo,hi,y0,y1,'wall'); else addBox(lo,hi,s0,s1,y0,y1,'wall'); /* addBox takes the top, not the height: the wall over an opening was blocking sight and bullets at head height */ }
    for(const g of gaps) wkOpening(pot,r,S,g); } }
/* one wall span in bands: skirting, wainscot, a brass rail, silk above (the kitchen: white tile, then painted block) */
function wkBands(pot,r,S,s0,s1,y0,y1){ const W=wkM(),n=S.n,len=s1-s0,mid=(s0+s1)/2,P=(s,y,off=0)=>S.axis==='x'?[s,y,S.c+n[2]*off]:[S.c+n[0]*off,y,s];
  const band=(m,ya,yb,tile)=>{ const a=Math.max(ya,y0),b=Math.min(yb,y1); if(b-a<.005) return; wkGrid(pot,m,P(mid,(a+b)/2),n,[0,1,0],len/2,(b-a)/2,tile,.5); };
  if(r.kind==='kitchen'){ band(W.tileD,0,2.0,[.6,.6]); band(W.block,2.0,r.h,[1.2,1.2]); if(y0<2.0&&y1>2.0) pot.box(W.steel,...(S.axis==='x'?[len,.04,.03]:[.03,.04,len]),...P(mid,2.0,.015)); return; }
  band(W.walnut,0,1.05,[.9,1.05]); band(W.silk,1.11,r.h,[2.4,2.4]);
  const bx=(h,d,y,m)=>{ if(y<y0||y>y1) return; S.axis==='x'?pot.box(m,len,h,d,...P(mid,y,d/2)):pot.box(m,d,h,len,...P(mid,y,d/2)); };
  bx(.06,.04,1.08,W.brass); bx(.12,.025,.06,W.lacquer);
 }
/* an opening: jambs and lintel in black lacquer with a brass edge; the arch into VIP gets velvet curtains tied back */
function wkOpening(pot,r,S,g){ const W=wkM(),o=g.o,n=S.n,T=WK_T,line=o.c,P=(s,y,off=0)=>S.axis==='x'?[s,y,line+n[2]*off]:[line+n[0]*off,y,s];
  if(r.id!==o.a) return; /* the first room draws it, both sides */
  const ax=S.axis==='x';
  for(const s of [g.s0,g.s1]){ const p=P(s,g.h/2); ax?pot.box(W.lacquer,.06,g.h,T+.04,p[0],p[1],p[2]):pot.box(W.lacquer,T+.04,g.h,.06,p[0],p[1],p[2]);
    for(const sd of [-1,1]){ const q=P(s,g.h/2,sd*(T/2+.02)); ax?pot.box(W.brass,.08,g.h+.04,.02,q[0],q[1],q[2]):pot.box(W.brass,.02,g.h+.04,.08,q[0],q[1],q[2]); } }
  const p=P((g.s0+g.s1)/2,g.h); ax?pot.box(W.lacquer,g.s1-g.s0+.06,.06,T+.04,p[0],p[1],p[2]):pot.box(W.lacquer,T+.04,.06,g.s1-g.s0+.06,p[0],p[1],p[2]);
  for(const sd of [-1,1]){ const q=P((g.s0+g.s1)/2,g.h+.02,sd*(T/2+.02)); ax?pot.box(W.brass,g.s1-g.s0+.16,.08,.02,q[0],q[1],q[2]):pot.box(W.brass,.02,.08,g.s1-g.s0+.16,q[0],q[1],q[2]); }
}

/* ---------- light ---------- */
function wkLight(p,c,k,d,room){ k*=WK.lk*(WICK.look==='hitman'?1.25:1); d*=1.3; const l={p,c:[c[0]*k,c[1]*k,c[2]*k],d,room:room&&WK.byId[room],w:1}; WK.lights.push(l); return l; }
/* a neon tube: the tube itself (unlit), a dithered halo on the wall behind, a reflection on the floor below */
function wkNeon(pot,G,a,b,c,o={}){ const W=wkM(),m=c===WKC.magenta?W.neonM:c===WKC.cyan?W.neonC:c===WKC.red?W.neonR:W.neonG,d=v3.sub(b,a),L=Math.hypot(...d),mid=v3.sc(v3.add(a,b),.5);
  const along=Math.abs(d[1])>Math.max(Math.abs(d[0]),Math.abs(d[2]))?'y':Math.abs(d[0])>Math.abs(d[2])?'x':'z',r=o.r||.018;
  if(along==='x') pot.box(m,L,r*2,r*2,mid[0],mid[1],mid[2]); else if(along==='z') pot.box(m,r*2,r*2,L,mid[0],mid[1],mid[2]); else pot.box(m,r*2,L,r*2,mid[0],mid[1],mid[2]);
  const n=o.wall; if(n){ const hw=o.halo||.22,c0=v3.add(mid,v3.sc(n,-.012)); /* the halo: a dithered bar, its long side along the tube */
    if(along==='y') wkQuad(pot,wkMC('glowBar',c),c0,n,v3.cross([0,1,0],n),L/2,hw,[0,0,L/hw,1]); else wkQuad(pot,wkMC('glowBar',c),c0,n,[0,1,0],L/2,hw,[0,0,L/hw,1]); }
  if(o.floor!=null&&n){ const out=[n[0],0,n[2]],len=o.floor,c0=[mid[0]+out[0]*len/2,.004,mid[2]+out[2]*len/2]; /* its reflection, from the foot of the wall out across the floor */
    { const hw=along==='y'?.14:L/2; wkQuad(pot,wkMC('streak',c),c0,[0,1,0],out,hw,len/2,[0,0,hw*2/(len/4),1]); } } }
/* a soft pool of colour on the floor under a light (a dithered disc) */
function wkPool(){ /* the real lights do this now */ }

/* ---------- the rooms ---------- */
function wkMain(pot,G,r){ const W=wkM(),h=r.h,N_=r.z1-WK_T/2,S_=r.z0+WK_T/2,W_=r.x0+WK_T/2,E_=r.x1-WK_T/2;
  /* the bar: a back wall of bottles lit warm from behind, a small red sign, a concrete-topped counter with a dark timber front */
  const bx0=-5,bx1=3,bmid=(bx0+bx1)/2,bz=4.55;
  for(let x=bx0;x<bx1-.01;x+=2){ mk(plane(2,1.5),W.bottles,G,x+1,1.75,N_-.06,0,Math.PI,0); }
  pot.box(W.lacquer,bx1-bx0+.3,.08,.35,bmid,.97,N_-.18); pot.box(W.lacquer,bx1-bx0+.3,.08,.3,bmid,2.53,N_-.16);
  for(let x=bx0;x<=bx1+.01;x+=2) pot.box(W.brass,.05,1.6,.06,x,1.75,N_-.08);
  mk(plane(2.6,.65),W.sign,G,bmid,3.15,N_-.03,0,Math.PI,0); wkLight([bmid,3.1,N_-.8],[1,.3,.2],.35,4,'M');
  wkLight([bmid,2.1,N_-1.0],WKC.amber,1.15,7.5,'M');
  const cl=bx1-bx0+.4; pot.box(W.wood,cl,1.0,.55,bmid,.5,bz); pot.box(W.marble,cl+.12,.06,.75,bmid,1.03,bz+.04);
  for(let x=bx0-.15;x<=bx1+.15;x+=.12) pot.box(W.lacquer,.03,.88,.02,x,.5,bz-.285);
  pot.box(W.chrome,cl,.03,.03,bmid,.18,bz-.42); for(let x=bx0;x<=bx1+.01;x+=1.6) pot.box(W.chrome,.025,.16,.12,x,.12,bz-.36);
  for(let x=bx0;x<bx1-.01;x+=2) wkQuad(pot,W.bottlesR,[x+1,1.062,bz+.06],[0,1,0],[0,0,-1],1,.34,[1,0,0,1]);
  const r2=rng(4411); for(let i=0;i<9;i++){ const x=bx0+.3+r2()*(cl-.8),z=bz+(r2()-.5)*.3; pot.cyl(W.glass,.035,.03,.09,8,x,1.105,z); }
  pot.cyl(W.chrome,.11,.09,.22,10,bx1-.6,1.17,bz+.05);
  for(let x=bx0+.4;x<bx1;x+=1.0){ pot.cyl(W.brass,.025,.025,.72,6,x,.38,bz-.75); pot.cyl(W.brass,.2,.2,.02,10,x,.01,bz-.75); pot.cyl(W.leatherBk,.2,.18,.09,10,x,.78,bz-.75); }
  /* three black pendants over the bar, warm bulbs */
  for(const x of [bx0+1,bmid,bx1-1]){ pot.cyl(W.black,.006,.006,h-2.25,4,x,(h+2.25)/2,bz-.1); pot.cyl(W.black,.16,.05,.16,10,x,2.17,bz-.1); pot.cyl(W.bulb,.11,.11,.01,10,x,2.085,bz-.1); }
  /* the west wall: tall windows onto the city at night, black steel mullions; the cold light they let in */
  for(const z of [-.4,1.6,3.6]){ mk(plane(1.7,2.6),M(tNightWin,{unlit:true,color:0x9aa6c0,repeat:[1.2,2]}),G,W_+.03,1.75,z,0,Math.PI/2,0);
    for(const dz of [-.87,.87]) pot.box(W.brass,.08,2.7,.06,W_+.05,1.75,z+dz); for(const y of [.42,3.08,1.75]) pot.box(W.brass,.08,.05,1.8,W_+.05,y,z); pot.box(W.brass,.08,2.6,.03,W_+.05,1.75,z); }
  wkLight([W_+1.3,2.0,1.6],[.45,.6,1],.8,6.5,'M');
  /* over the floor: three industrial pendants, and a warm pool under them */
  for(const [x,z] of [[-2.2,-.6],[.2,-.6],[2.6,-.6]]){ pot.cyl(W.black,.006,.006,h-2.75,4,x,(h+2.75)/2,z); pot.cyl(W.black,.24,.07,.2,12,x,2.65,z); pot.cyl(W.bulb,.17,.17,.01,12,x,2.545,z); }
  wkLight([.2,2.5,-.6],WKC.gold,.75,7.5,'M');
  /* two concrete columns */
  for(const px of [-4.2,3.4]){ const pz=-2.4; pot.box(W.conc,.5,h,.5,px,h/2,pz); addBox(px-.25,px+.25,pz-.25,pz+.25,0,h,'wall'); pot.box(W.brass,.54,.1,.54,px,.05,pz); }
  /* booths along the south wall */
  for(const bxc of [-4.2,-.6,3.0]) wkBooth(pot,G,bxc,S_,W.leatherBk);
  wkLight([-.6,1.0,S_+1.0],WKC.amber,.6,3.8,'M');
  wkCocktail(pot,-4.6,2.4); wkCocktail(pot,-3.4,3.1); }

function wkChandelier(pot,G,x,h,z){ const W=wkM(),r=rng(5101),top=h-.05,bot=h-1.25;
  pot.cyl(W.brass,.01,.01,top-bot-.75,6,x,(top+bot+.75)/2,z); pot.cyl(W.brass,.1,.05,.06,10,x,bot+.75,z); pot.cyl(W.brass,.09,.09,.02,10,x,top-.01,z);
  for(const [rad,y,n,L0] of [[.7,bot+.62,26,.16],[.52,bot+.42,20,.2],[.34,bot+.22,14,.24],[.16,bot+.05,8,.28]]){
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2,px=x+Math.cos(a)*rad,pz=z+Math.sin(a)*rad,L=L0*(.75+r()*.5); pot.box(W.crystal,.011,L,.011,px,y-L/2-.008,pz,a); pot.box(W.bulb,.014,.02,.014,px,y+.012,pz); } }
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+.4; pot.box(W.brass,.006,.62,.006,x+Math.cos(a)*.35,bot+.68,z+Math.sin(a)*.35,0,Math.sin(a)*.9,-Math.cos(a)*.9); }
  return bot+.3; }
function wkBooth(pot,G,x,wallZ,mat){ const W=wkM(),d=1.6,w=2.0,z=wallZ+d/2+.05;
  pot.box(mat,w,.42,.55,x,.21,wallZ+.33); pot.box(mat,w,.7,.18,x,.78,wallZ+.12); /* seat and back against the wall */
  for(const s of [-1,1]){ pot.box(mat,.55,.42,d-.6,x+s*(w/2-.27),.21,z+.25); pot.box(mat,.16,.7,d-.6,x+s*(w/2-.08),.78,z+.25); }
  pot.box(W.brass,w+.04,.03,.04,x,1.14,wallZ+.2);
  pot.cyl(W.marble,.42,.42,.04,14,x,.74,z+.15); pot.cyl(W.chrome,.035,.035,.7,6,x,.37,z+.15); pot.cyl(W.chrome,.24,.24,.02,10,x,.01,z+.15);
  pot.cyl(W.brass,.05,.07,.03,8,x+.2,.775,z+.05); pot.cyl(W.brass,.008,.008,.2,4,x+.2,.88,z+.05); pot.cyl(W.bulb,.06,.09,.1,8,x+.2,1.0,z+.05);
  addBox(x-w/2,x+w/2,wallZ,wallZ+.62,0,.9,'furn'); for(const s of [-1,1]) addBox(x+s*(w/2-.55)-.0,x+s*w/2,z-.5,z+.9,0,.9,'furn'); addBox(x-.42,x+.42,z-.27,z+.57,0,.76,'furn'); }
function wkCocktail(pot,x,z){ const W=wkM(); pot.cyl(W.marble,.3,.3,.04,12,x,1.08,z); pot.cyl(W.chrome,.03,.03,1.06,6,x,.53,z); pot.cyl(W.chrome,.22,.22,.02,10,x,.01,z); pot.cyl(W.glass,.035,.03,.1,8,x+.08,1.15,z); addBox(x-.3,x+.3,z-.3,z+.3,0,1.1,'furn'); }

function wkKitchen(pot,G,r){ const W=wkM(),h=r.h,N_=r.z1-WK_T/2,S_=r.z0+WK_T/2,W_=r.x0+WK_T/2,E_=r.x1-WK_T/2;
  /* steel run along the north wall, a range and hood on the west, an island, shelves of pans and plates */
  pot.box(W.steel,5.0,.9,.7,(W_+E_)/2-.3,.45,N_-.35); pot.box(W.steel,5.04,.04,.74,(W_+E_)/2-.3,.92,N_-.35); pot.box(W.black,5.0,.1,.66,(W_+E_)/2-.3,.05,N_-.33);
  addBox(W_,E_-.6,N_-.7,N_,0,.94,'furn');
  for(let x=W_+.6;x<E_-1;x+=.9){ pot.box(W.black,.02,.6,.66,x,.45,N_-.33); }
  /* the range */
  const rz=-3.2; pot.box(W.black,.9,.9,1.6,W_+.45,.45,rz); pot.box(W.steel,.94,.04,1.64,W_+.45,.92,rz); for(const dz of [-.4,.4]) for(const dx of [-.2,.2]) pot.cyl(W.black,.12,.12,.03,10,W_+.45+dx,.96,rz+dz);
  pot.box(W.steel,1.0,.5,1.8,W_+.5,2.25,rz); pot.box(W.steel,.6,.6,.6,W_+.35,2.7,rz); addBox(W_,W_+.9,rz-.8,rz+.8,0,.94,'furn');
  /* two stock pots and a pan on the range */
  pot.cyl(W.steel,.16,.16,.3,10,W_+.35,1.11,rz-.4); pot.cyl(W.steel,.13,.13,.22,10,W_+.55,1.07,rz+.4); pot.cyl(W.black,.14,.14,.04,10,W_+.25,.98,rz+.4); pot.box(W.black,.03,.02,.25,W_+.25,.99,rz+.6);
  /* the island */
  const ix=-10.1,iz=-3.4; pot.box(W.steel,2.4,.9,1.0,ix,.45,iz); pot.box(W.steel,2.44,.04,1.04,ix,.92,iz); pot.box(W.black,2.3,.06,.9,ix,.3,iz); addBox(ix-1.2,ix+1.2,iz-.5,iz+.5,0,.94,'furn');
  const r2=rng(6201); for(let i=0;i<6;i++){ const x=ix-1+r2()*2,z=iz+(r2()-.5)*.6; if(r2()<.5) pot.cyl(W.white,.12,.1,.025,10,x,.95,z); else pot.box(W.wood,.4,.03,.25,x,.95,z,r2()*3); }
  pot.box(W.steel,.03,.02,.28,ix+.4,.95,iz-.1,.5); /* a knife on the board */
  /* shelves over the counter */
  for(const y of [1.55,2.0]){ pot.box(W.steel,4.6,.03,.32,(W_+E_)/2-.4,y,N_-.17); for(let x=W_+.3;x<E_-1;x+=.32){ if(r2()<.35) continue; if(y<1.9) pot.cyl(W.white,.12,.12,.02,10,x,y+.12,N_-.17,0,Math.PI/2,0); else pot.cyl(W.steel,.1,.1,.16,8,x,y+.1,N_-.17); } }
  /* pans hanging on a rail by the pass */
  pot.box(W.steel,.03,.03,1.6,E_-.25,2.1,-1.4); for(let i=0;i<4;i++){ const z=-2.0+i*.4; pot.cyl(W.steel,.11-i*.01,.11-i*.01,.04,10,E_-.25,1.85,z,0,0,Math.PI/2); pot.box(W.steel,.02,.25,.02,E_-.25,1.98,z); }
  /* cold white tubes on the ceiling */
  for(const x of [-11.6,-8.6]){ pot.box(W.steel,.16,.05,1.4,x,h-.03,-3); pot.box(W.tube,.08,.03,1.3,x,h-.065,-3); wkLight([x,h-.4,-3],WKC.white,.9,5.6,'K'); }
  /* heat lamps over the pass to the main room: the kitchen's one warm thing */
  for(const z of [-3.95,-3.25]){ pot.cyl(W.steel,.012,.012,.5,4,E_-.35,h-.25,z); pot.cyl(W.brass,.11,.04,.12,10,E_-.35,h-.56,z); pot.cyl(M(null,{color:0xffa040,unlit:true}),.07,.07,.01,10,E_-.35,h-.625,z); }
  wkLight([E_-.5,1.9,-3.6],WKC.amber,.7,3.2,'K'); pot.box(W.steel,.5,.04,1.5,E_-.35,.96,-3.6); pot.box(W.steel,.46,.9,1.46,E_-.35,.46,-3.6); addBox(E_-.6,E_-.1,-4.35,-2.85,0,.98,'furn');
  for(const z of [-3.95,-3.25]) pot.cyl(W.white,.13,.11,.025,10,E_-.35,.995,z);
  /* a green exit sign over the alley door (stage 5's door), its glow on the tile */
  pot.box(W.black,.06,.18,.4,W_+.04,2.35,-1.2); mk(plane(.34,.12),M(tex(16,6,'#1a8a3a',g=>{ R(g,'#c8ffd8',2,1,12,4); }),{unlit:true}),G,W_+.075,2.35,-1.2,0,Math.PI/2,0);
  wkQuad(pot,wkMC('glow',WKC.green),[W_+.02,2.35,-1.2],[1,0,0],[0,1,0],.5,.4,[0,0,1,1]); }

function wkVip(pot,G,r){ const W=wkM(),h=r.h,N_=r.z1-WK_T/2,S_=r.z0+WK_T/2,W_=r.x0+WK_T/2,E_=r.x1-WK_T/2,cx=(W_+E_)/2,cz=(S_+N_)/2;
  /* the owner's office: the city in the east windows, a desk under one lamp, a leather sofa, shelves. Nothing in it is loud */
  for(const z of [.6,2.5,4.4]){ mk(plane(1.6,2.2),M(tNightWin,{unlit:true,color:0xa6b0c8,repeat:[1.1,1.7]}),G,E_-.03,1.55,z,0,-Math.PI/2,0);
    for(const dz of [-.82,.82]) pot.box(W.brass,.08,2.3,.06,E_-.05,1.55,z+dz); for(const y of [.42,2.68]) pot.box(W.brass,.08,.05,1.7,E_-.05,y,z); }
  wkLight([E_-1.2,1.9,2.5],[.45,.6,1],.75,5.5,'V');
  const dx=cx+.9,dz=cz-.2; /* the desk, side on to the windows */
  pot.box(W.wood,.85,.05,1.9,dx,.76,dz); for(const z of [-.85,.85]) pot.box(W.brass,.7,.74,.04,dx,.37,dz+z); pot.box(W.wood,.04,.5,1.7,dx+.38,.48,dz); addBox(dx-.43,dx+.43,dz-.95,dz+.95,0,.8,'furn');
  pot.box(W.black,.03,.3,.5,dx+.05,.96,dz-.15,0,0,.12); pot.box(M(null,{color:0x8aa0c8,unlit:true}),.005,.26,.46,dx+.03,.96,dz-.15,0,0,.12); pot.box(W.black,.2,.02,.2,dx+.1,.795,dz-.15); /* a monitor, lit */
  pot.cyl(W.black,.07,.09,.02,8,dx-.1,.795,dz+.6); pot.cyl(W.black,.008,.008,.34,4,dx-.1,.97,dz+.6); pot.cyl(W.black,.13,.07,.1,10,dx-.1,1.18,dz+.6); pot.cyl(W.bulb,.08,.08,.01,10,dx-.1,1.128,dz+.6);
  wkLight([dx-.15,1.2,dz+.55],WKC.gold,.95,3.6,'V');
  for(let i=0;i<4;i++) pot.box(W.white,.21,.004,.3,dx-.12+i*.02,.79+i*.004,dz+.1+i*.03,.1*i); pot.cyl(W.glass,.04,.035,.08,8,dx-.2,.83,dz-.6); pot.box(M(null,{color:0x5a3010}),.07,.16,.07,dx-.05,.87,dz-.72);
  pot.box(W.leatherBk,.55,.1,.55,dx+.95,.46,dz); pot.box(W.leatherBk,.1,.6,.55,dx+1.2,.78,dz); pot.cyl(W.brass,.03,.03,.42,6,dx+.95,.21,dz); pot.cyl(W.brass,.26,.26,.02,10,dx+.95,.01,dz);
  /* the sofa along the north wall, a low table */
  pot.box(W.leatherBk,2.4,.42,.8,cx-.6,.21,N_-.42); pot.box(W.leatherBk,2.4,.5,.2,cx-.6,.66,N_-.12); for(const sx of [-1,1]) pot.box(W.leatherBk,.2,.6,.8,cx-.6+sx*1.3,.3,N_-.42); addBox(cx-2,cx+.8,N_-.85,N_,0,.9,'furn');
  pot.box(W.wood,1.1,.04,.55,cx-.6,.38,N_-1.5); pot.box(W.brass,1.0,.34,.45,cx-.6,.19,N_-1.5); addBox(cx-1.15,cx-.05,N_-1.8,N_-1.2,0,.4,'furn');
  /* shelves on the south wall: files, books, a few bottles */
  const r2=rng(7301),BK=[0x2a3440,0x40302a,0x1e2a24,0x4a4640,0x30283a,0x5a5248];
  for(let k=0;k<4;k++){ const y=.35+k*.5; pot.box(W.wood,2.6,.035,.3,cx+.6,y,S_+.17); let x=cx-.6; while(x<cx+1.8){ const bw=.03+r2()*.05,bh=.2+r2()*.2; if(r2()<.8) pot.box(M(null,{color:BK[r2()*BK.length|0]}),bw,bh,.2,x,y+.02+bh/2,S_+.15); x+=bw+.006; } }
  for(const x of [cx-.7,cx+1.9]) pot.box(W.wood,.04,2.1,.3,x,1.05,S_+.17); addBox(cx-.75,cx+1.95,S_,S_+.34,0,2.1,'furn'); }

/* ---------- the build ---------- */
function wkBuild(){ setWorld(14,9,4.2);
  disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true; if(typeof FIRES!=='undefined') FIRES.length=0;
  Object.assign(FLOOR,{n:1,seed:0,test:false,camp:false,idx:1,def:{n:1,name:'Velour',clear:[0,0],cast:[],civ:[]},mode:'wick',doors:[],windows:[],power:true,flick:null,dormD:8,down:false,goals:{},hot:[],noClear:true,
    stairUp:null,clearH:0,clearP:0,units:[],party:[],bx:99});
  FLOOR.start={x:-10.6,z:-1.2,yaw:Math.atan2(-(-8-(-10.6)),-(-4-(-1.2)))};
  if(GAME.vision&&GAME.vision!=='off'&&typeof visionApply==='function'){ GAME.vision='off'; visionApply(); }
  WK.rooms=WK_ROOMS.map((r,i)=>Object.assign({},r,{i})); WK.byId={}; for(const r of WK.rooms) WK.byId[r.id]=r; WK.lights.length=0; WK.ticks.length=0;
  const G=floorN; GEO_TEMP=true; const pot=twPot();
  for(const r of WK.rooms) wkShell(pot,r);
  wkKitchen(pot,G,WK.byId.K); wkMain(pot,G,WK.byId.M); wkVip(pot,G,WK.byId.V);
  pot.flush(G); GEO_TEMP=false;
  meshMerge(floorN,{tile:7});
  /* walking: every cell inside a room and clear of furniture */
  const nav=new Uint8Array(NX*NZ),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i,r=wkRoomAt(x,z); let bl=!r; if(r) space[id]=r.i;
    if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.25) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; break; } } nav[id]=bl?1:0; }
  for(const o of WK_OPEN){ for(let s=o.at-o.w/2+.25;s<=o.at+o.w/2-.25;s+=.25) for(const dc of [-.25,0,.25]){ const c=o.axis==='z'?navCell(o.c+dc,s):navCell(s,o.c+dc); if(c>=0) nav[c]=0; } }
  Object.assign(FLOOR,{nav,navHole:nav,space,seats:[],beds:[],furn:[],lights:WK.lights.map(l=>[l.p,l.c,l.d]),anim:[]});
  const HL=WICK.look==='hitman'; if(HL){ texFilter=gl.LINEAR; state.res=Math.max(state.res,720); } /* the early-2000s look: smooth textures, a sharper frame, flatter brighter light (below) */
  setLights({amb:HL?[.46,.45,.43]:[.2,.205,.225],dir:[.3,1,.4],dirCol:[.03,.03,.035],fog:HL?[.2,.21,.23]:[.014,.015,.018],fogNear:HL?4:9,fogFar:HL?24:28,pl:[[[0,-50,0],[0,0,0],1]]});
  boxGridDirty=true; navDirty=true; NAVF.clear(); navGen++;
  const tag=$('floorTag'); if(tag) tag.textContent='Velour · prototype';
  WK.built=true; }

/* the eight lights nearest you (your room's first), every frame */
function wkLightsTick(){ if(FLOOR.mode!=='wick') return; const e=camBasis().eye,pr=wkRoomAt(e[0],e[2]);
  const C=WK.lights.map(l=>({l,s:Math.hypot(l.p[0]-e[0],l.p[2]-e[2])-l.d*.6-(pr&&l.room===pr?6:0)})).sort((a,b)=>a.s-b.s).slice(0,8);
  L.plPos.fill(0); L.plCol.fill(0); L.plDist.fill(1); C.forEach(({l},i)=>{ L.plPos.set(l.p,i*3); L.plCol.set(l.c,i*3); L.plDist[i]=l.d; });
  L.rim=[0,0,0]; /* no edge light: this game is drawn like the tower */
  for(const t of WK.ticks) t(GAME.t); }
protoOn('tick',()=>{ if(WICK.on) wkLightsTick(); });
