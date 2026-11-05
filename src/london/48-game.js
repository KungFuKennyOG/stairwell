/* =====================================================================================================
   THE MVP: "THE BAG". One job on Bethnal Green Road, on desktop or in the headset.
   You come out of Hollis House. Degsy, outside the Golden Rooster, has a bag on the boot of his motor that needs
   to get to Arch 9 under the railway bridge at the east end, and two coppers are between you and it.
   - Carry the bag where PC Hughes or PC Okafor can see it and their "?" fills: run, or stay in view close up, and
     it fills faster. Full: one star, and that copper comes for you at a walk.
   - Run while they can see you, or keep them chasing, and it goes to two stars: both of them, running.
   - Break line of sight (cars, the phone box, the bus shelter, a shop doorway, the Hollis House lobby) long enough
     and they lose you: they check where they last saw you, then go back to their posts.
   - A copper within arm's reach while you have stars: nicked. Get the bag to Arch 9 with no stars: job done.
   Everything else on the street is the art set (46, 47); this file adds the rules, the player, the coppers'
   eyes and legs (Stairwell's gait module), the barks, the HUD, and the WebXR loop.
   ===================================================================================================== */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const mv=(R,v)=>[R[0][0]*v[0]+R[1][0]*v[1]+R[2][0]*v[2],R[0][1]*v[0]+R[1][1]*v[1]+R[2][1]*v[2],R[0][2]*v[0]+R[1][2]*v[1]+R[2][2]*v[2]];
const mtv=(R,v)=>[v3.dot(R[0],v),v3.dot(R[1],v),v3.dot(R[2],v)];
const ryM=a=>[[Math.cos(a),0,-Math.sin(a)],[0,1,0],[Math.sin(a),0,Math.cos(a)]];
const RANGED={}; function sfx(){}
const PL={x:0,z:0};

const GAME=(()=>{
const G={on:false,xr:false,phase:'meet',stars:0,lostT:0,hasBag:false,t:0,line:null,lineT:0,queue:[],said:new Set(),maxStars:0,endT:0,result:null,heatT:0,obj:''};
const P={x:11.6,z:FZ-1.7,yaw:0,pitch:-.05,run:false,r:.24};
const START={x:11.6,z:FZ-1.7,yaw:0};
const LOCKUP={x:31,z:FZ+.6};
const BAG_HOME=[-8.4,1.06,KERB_Z+1.05];

/* ---------- where you can stand (point-in-rects, shrunk by your radius) and what blocks sight ---------- */
const WALK=[[-16.3,FZ+.22,36.4,ROAD_Z1+2.75],
  [-9.65,FZ-1.2,-4.95,FZ-.12],[-5.95,FZ-.4,-4.9,FZ+.8],           /* the Golden Rooster and its door */
  [-4.25,FZ-1.0,.05,FZ-.12],[-.95,FZ-.4,.15,FZ+.8],               /* Bethnal Wines */
  [10.45,FZ-2.75,12.75,FZ+.8],                                     /* Hollis House lobby */
  [11.0,FZ-6.0,12.2,FZ-2.3],                                       /* the passage through */
  [10.5,FZ-8.35,29.0,FZ-5.45],                                     /* the back alley, east to the bridge */
  [30.0,FZ-1.6,32.0,FZ+.8]];                                       /* Arch 9 */
const BACKDOOR={x:28.7,z:FZ-6.9};
const BLOCK=[[-12.55,KERB_Z+.12,-7.85,KERB_Z+1.98],[-.75,ROAD_Z1-1.98,3.95,ROAD_Z1-.12],[-3.72,ROAD_Z1+.73,-2.68,ROAD_Z1+1.77],
  [4.85,ROAD_Z1+2.7,8.35,ROAD_Z1+2.95],[4.8,ROAD_Z1+1.6,4.98,ROAD_Z1+2.85],[-4.86,KERB_Z-.86,-4.34,KERB_Z-.34]];
for(const x of [-9.6,-5,0,5,9.8]) BLOCK.push([x-.12,KERB_Z-.52,x+.12,KERB_Z-.28]);
for(const [x,z] of [[3.6,KERB_Z-.35],[-8.6,KERB_Z-.35],[11.9,KERB_Z-.3],[14.9,ROAD_Z1+.3]]) BLOCK.push([x-.15,z-.15,x+.15,z+.15]); /* lamp columns, Belisha beacons */
/* sight: the cars, the phone box, the shelter's advert, every pier and shop wall along the frontage, the lobby's walls */
const SIGHT=BLOCK.slice(0,5);
for(const [x,w] of UNITS.map(u=>[u[0],u[1]])) for(const s of [-1,1]) SIGHT.push([x+s*(w/2+.21)-.21,FZ-2.6,x+s*(w/2+.21)+.21,FZ+.2]);
for(const x of [10.2,13.0]) SIGHT.push([x-.06,FZ-2.6,x+.06,FZ]);                   /* the lobby's side walls */
SIGHT.push([-30,FZ-30,40,FZ-8.45],[-30,FZ-5.55,10.95,FZ-2.62],[12.25,FZ-5.55,40,FZ-2.62],[-30,FZ-8.45,10.45,FZ-5.55],[29.05,FZ-8.45,40,FZ-5.55]); /* the buildings, with the passage and the alley carved out */
SIGHT.push([10.2,FZ-2.68,11.0,FZ-2.55],[12.2,FZ-2.68,13.0,FZ-2.55]);                  /* the lobby's back wall either side of the doorway */
const inR=(r,x,z,m)=>x>r[0]+m&&x<r[2]-m&&z>r[1]+m&&z<r[3]-m;
function standable(x,z,rad){ if(!WALK.some(r=>inR(r,x,z,rad))) return false; for(const b of BLOCK) if(inR([b[0]-rad,b[1]-rad,b[2]+rad,b[3]+rad],x,z,0)) return false; return true; }
function segHits(ax,az,bx,bz,r){ /* slab test, 2D */ let t0=0,t1=1; const dx=bx-ax,dz=bz-az;
  for(const [p,d,lo,hi] of [[ax,dx,r[0],r[2]],[az,dz,r[1],r[3]]]){ if(Math.abs(d)<1e-9){ if(p<lo||p>hi) return false; continue; } let a=(lo-p)/d,b=(hi-p)/d; if(a>b){ const t=a; a=b; b=t; } t0=Math.max(t0,a); t1=Math.min(t1,b); if(t0>t1) return false; } return true; }
function clearLine(ax,az,bx,bz){ for(const r of SIGHT) if(segHits(ax,az,bx,bz,r)) return false; return true; }
function moveBody(o,dx,dz,rad){ if(standable(o.x+dx,o.z,rad)) o.x+=dx; if(standable(o.x,o.z+dz,rad)) o.z+=dz; }
const floorY=(x,z)=>z>KERB_Z&&z<ROAD_Z1?0:PAVE_Y;

/* ---------- Arch 9: the lock-up in the bridge's near abutment, shutter half up, light spilling out ---------- */
{ const A=N(STREET,LOCKUP.x,0,FZ+.02);
  const tIn=P2(128,64,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a2412'],[1,'#ffb050']]); R(g,'#1a120c',0,0,w,18); for(let i=0;i<4;i++) R(g,'#2a2018',8+i*30,30,20,34); ell(g,64,58,22,6,'rgba(30,20,10,.8)'); R(g,'#c8c0b0',44,22,40,6); },0,1);
  wallP(2.0,2.4,tIn,0,PAVE_Y+1.2,-1.4,0,{parent:A,whole:true,unlit:true,cell:2});
  for(const s of [-1,1]) wallP(1.4,2.4,tConc,s*1.0,PAVE_Y+1.2,-.7,-s*Math.PI/2,{parent:A,tile:2,color:0x8a6a48});
  slab(2.0,1.4,tConc,0,PAVE_Y+.01,-.7,{parent:A,tile:.8,color:0xa08060});
  wallP(2.1,1.2,tShutterL,0,PAVE_Y+2.4,.0,0,{parent:A,whole:true});                     /* the shutter, half up */
  blk(2.3,.4,.4,col(0x2a2c2e),0,PAVE_Y+3.15,.1,A);
  mk(boxW(2.4,.5,.1),MM(signTex(256,48,'#141414','#f0a23e','ARCH 9','T. MOTORS · CASH ONLY',{seed:1661}),{unlit:true}),A,0,PAVE_Y+3.7,.2);
  blk(.3,.12,.18,glowC(0xffe0a0),0,PAVE_Y+2.95,-.4,A); }

/* ---------- through Hollis House: a passage and the back alley behind the shops, to Arch 9's back door ---------- */
{ const B_=N(STREET), floorM=MM(tPaveW,{repeat:[1,1]}), z0=FZ-8.4,z1=FZ-5.6;
  slab(1.2,3.0,tConc,11.6,PAVE_Y,FZ-4.1,{parent:B_,tile:1,cell:1,color:0x8a8a84});
  for(const x of [11.0,12.2]) wallP(3.0,3.0,tConc,x,PAVE_Y+1.5,FZ-4.1,x<11.6?Math.PI/2:-Math.PI/2,{parent:B_,tile:2,color:0xd8dcd6});
  for(const z of [FZ-3.2,FZ-5.0]) blk(.12,.05,.9,glowC(0xeef6ff),11.6,PAVE_Y+2.94,z,B_);   /* strip lights */
  mk(boxW(1.0,.22,.03),MM(signTex(160,36,'#e8e4da','#1b1b1b','TO REAR → BINS',null,{seed:1663}),{unlit:true}),B_,11.6,PAVE_Y+2.45,FZ-2.66,0,Math.PI,0);
  blk(1.3,.1,3.0,col(0x6a6a66),11.6,PAVE_Y+3.0,FZ-4.1,B_); blk(.4,.06,.2,glowC(0xe8f0f4),11.6,PAVE_Y+2.95,FZ-4.0,B_);
  slab(18.6,2.8,tPaveW,(10.4+29)/2,PAVE_Y,(z0+z1)/2,{parent:B_,tile:1.2,cell:1.2});
  wallP(18.6,4.2,tSoot,(10.4+29)/2,PAVE_Y+2.1,z0,0,{parent:B_,tile:1.6,tileH:1.5,cell:1.2});                 /* the far wall of the alley */
  wallP(11.0-10.4,4.2,tConc,10.7,PAVE_Y+2.1,z1,Math.PI,{parent:B_,tile:2}); wallP(29-12.2,4.2,tConc,(12.2+29)/2,PAVE_Y+2.1,z1,Math.PI,{parent:B_,tile:2,color:0x9a968e}); /* the backs of the shops */
  wallP(2.8,4.2,tSoot,10.4,PAVE_Y+2.1,(z0+z1)/2,Math.PI/2,{parent:B_,tile:1.6,tileH:1.5});
  wallP(2.8,6.2,tSoot,29.05,PAVE_Y+3.1,(z0+z1)/2,-Math.PI/2,{parent:B_,tile:1.6,tileH:1.5});                /* the bridge abutment */
  /* back windows, bins, pipes, a security light, Arch 9's back door */
  for(const x of [14,17.5,21,24.5]){ wallP(.8,.9,(x|0)%2?tWinLit:tWinDark,x,PAVE_Y+2.6,z1-.03,Math.PI,{parent:B_,whole:true,unlit:(x|0)%2===1}); blk(.06,4.2,.06,col(0x2a2a2a),x+1.2,PAVE_Y+2.1,z1-.06,B_); }
  for(const [x,c] of [[15.6,0x1a3a2a],[16.4,0x2a2a2a],[22.8,0x1a3a2a]]){ blk(.62,1.1,.7,col(c),x,PAVE_Y+.55,z0+.42,B_); blk(.66,.06,.74,col(0x111111),x,PAVE_Y+1.12,z0+.42,B_); }
  for(let i=0;i<4;i++) mk(cyl(.2,.24,.4,7),col(0x0d0e10),B_,19.5+i*.4,PAVE_Y+.2,z0+.3+(i%2)*.3,0,i,0);
  blk(.3,.15,.15,glowC(0xfff0d0),20,PAVE_Y+3.3,z1-.1,B_); { const gm=MM(tGlowSodium,{unlit:true,double:true}); gm.cut=2; mk(plane(1.4,1.4),gm,B_,20,PAVE_Y+3.2,z1-.2,0,Math.PI,0); }
  wallP(1.1,2.2,tShutterL,29.0,PAVE_Y+1.1,BACKDOOR_Z(),-Math.PI/2,{parent:B_,whole:true}); mk(boxW(1.2,.3,.06),MM(signTex(128,32,'#141414','#f0a23e','ARCH 9',null,{seed:1662}),{unlit:true}),B_,28.98,PAVE_Y+2.45,BACKDOOR_Z(),0,-Math.PI/2,0);
  blk(.2,.1,.1,glowC(0xffd090),28.9,PAVE_Y+2.75,BACKDOOR_Z(),B_); }
function BACKDOOR_Z(){ return FZ-6.9; }

/* ---------- the bag ---------- */
const tBag=P2(64,32,(g,w,h)=>{ R(g,'#1a2236',0,0,w,h); R(g,'#e8e6e0',0,13,w,4); specks(g,'#0e1220',90,1671,w,h); R(g,'#0a0c14',30,0,4,h); },0,1);
const BAG=N(STREET,...BAG_HOME);
mk(box(.56,.3,.3),MM(tBag),BAG,0,0,0); for(const s of [-1,1]) mk(box(.04,.14,.03),col(0x0a0c14),BAG,s*.1,.21,0); mk(box(.24,.03,.03),col(0x0a0c14),BAG,0,.28,0);
BAG.r=[0,.1,0];

/* ---------- the coppers: eyes, a "?" over the head, legs from the gait module ---------- */
const tMark=k=>P2(64,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.font=`bold 56px ${SANS}`; g.textAlign='center'; g.textBaseline='middle';
  g.fillStyle='#000'; g.fillText(k===3?'!':'?',w/2+3,h/2+5); g.fillStyle=k===3?'#ff3a28':k===2?'#ffd040':'#e8e2d4'; g.fillText(k===3?'!':'?',w/2,h/2+2); },0,1);
const markM=[1,2,3].map(k=>M(tMark(k),{unlit:true,cut:true,double:true}));
const COPS=[];
function makeCop(id,post,patrol){ const C=CAST[id],m=mk(plane(.3,.3),markM[0],STREET); m.vis=false;
  const c={id,C,post,patrol,pi:0,wait:0,state:'post',sus:0,mark:m,hd:post[2],pos:[post[0],post[1]],E:null,seeT:0,target:null,searchT:0,speed:0,look:0};
  c.E={J:C.J,o:C.o,hd:c.hd,pos:c.pos,walkAmt:0,runAmt:0,hp:{legL:1,legR:1,armL:1,armR:1},wpnHeld:false,kind:'pc',aware:false};
  COPS.push(c); return c; }

/* ---------- lines: subtitles over heads (world labels) and on screen ---------- */
const LINES={
  degsyWave:['degsy','Two Sugars! Over here, son.'],
  d1:['degsy','Just the man. Got a little job for you.'],
  d2:['degsy','Bag\'s on the boot of my motor. Take it to Arch 9, under the bridge. Terry\'s expecting it.'],
  d3:['degsy','Don\'t open it. Don\'t run. And don\'t let the Old Bill see it.'],
  dGo:['degsy','Bridge is east. Old Bill about? Cut through Hollis House. The back alley comes out at the arch.'],
  oi:['pcmale','Oi! You! What\'s in the bag?'],
  oiO:['pcfem','Stop right there!'],
  run2:['pcfem','Control, I\'m in foot pursuit, Bethnal Green Road!'],
  lost:['pcmale','...Lost him.'],
  search:['pcmale','Where\'d he go?'],
  terryNo:['terry','Not with the Old Bill on you. Lose \'em first.'],
  terryYes:['terry','Bag. Ta. Tell Degsy he\'s short. Again.'],
  nicked:['pcmale','You\'re nicked, son.'],
  nickedO:['pcfem','Hands where I can see them. You\'re nicked.'],
  maureen:['maureen','Bit late for you, isn\'t it, Danny?'],
  ali:['ali','Wings are fresh, Danny. Two for three quid.'],
  piotr:['piotr','Night, mate.'],
  kwame:['kwame','...'],
};
const tLab=()=>tex(512,96,null,null);
const labels={};
function retex(t){ if(t.glt){ gl.bindTexture(gl.TEXTURE_2D,t.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.c); curTex=null; } }
function drawLabel(t,text){ const g=t.c.getContext('2d'),w=512,h=96; g.clearRect(0,0,w,h); g.font=`bold 30px ${TYPEF}`; const words=text.split(' '); const lines=[]; let ln='';
  for(const wd of words){ const tr=ln?ln+' '+wd:wd; if(g.measureText(tr).width>w-40&&ln){ lines.push(ln); ln=wd; } else ln=tr; } lines.push(ln);
  const lh=36,bh=lines.length*lh+16,y0=h-bh; let mw=0; for(const l of lines) mw=Math.max(mw,g.measureText(l).width);
  g.fillStyle='rgba(6,6,6,1)'; g.fillRect((w-mw)/2-14,y0,mw+28,bh); g.fillStyle='#f4efe4'; g.textAlign='center'; g.textBaseline='middle';
  lines.forEach((l,i)=>g.fillText(l,w/2,y0+8+lh*(i+.5))); retex(t); }
function labelFor(who){ if(!labels[who]){ const t=tLab(); const n=mk(plane(1.3,.244),M(t,{unlit:true,cut:true,double:true}),STREET); n.vis=false; labels[who]={t,n}; } return labels[who]; }
function say(key,dur=3.2){ const [who,text]=LINES[key]; G.queue.push({who,text,dur}); }
function sayNow(key,dur=3){ G.queue.length=0; G.line=null; say(key,dur); }
function speakerHead(who){ if(who==='terry') return [LOCKUP.x,PAVE_Y+2.2,FZ-.2]; const C=CAST[who]; if(!C) return null; return v3.add(mulP(C.J.head.world,[0,0,0]),[0,.42,0]); }

/* ---------- HUD (desktop HTML; in the headset, Danny's phone in the left hand) ---------- */
const $g=id=>document.getElementById(id);
function setObj(s){ if(G.obj===s) return; G.obj=s; const e=$g('gObj'); if(e) e.textContent=s; phoneDirty=true; }
function setStars(n){ n=clamp(n,0,2); if(G.stars!==n){ G.stars=n; G.maxStars=Math.max(G.maxStars,n); phoneDirty=true; } const e=$g('gStars'); if(e){ e.dataset.n=n; e.textContent=n?'★'.repeat(n)+'☆'.repeat(2-n):''; } }
let phoneDirty=true;

/* ---------- the player in the world: a held bag on desktop, hands and a phone in the headset ---------- */
const HANDS={};
const tPhone=tex(256,448,'#0a0a0c',null);
function drawPhone(){ const g=tPhone.c.getContext('2d'),w=256,h=448; R(g,'#0b0c10',0,0,w,h); R(g,'#c8231c',0,0,w,46); g.fillStyle='#fff'; g.font=`bold 24px ${TYPEF}`; g.textAlign='left'; g.fillText('DEGSY',14,32);
  g.fillStyle='#f0ece2'; g.font=`bold 22px ${TYPEF}`; const words=G.obj.split(' '); let ln='',y=90; for(const wd of words){ const tr=ln?ln+' '+wd:wd; if(g.measureText(tr).width>w-28&&ln){ g.fillText(ln,14,y); ln=wd; y+=30; } else ln=tr; } g.fillText(ln,14,y);
  g.font=`64px ${SANS}`; g.fillStyle=G.stars?'#ffd040':'#3a3a3a'; g.fillText('★',20,h-40); g.fillStyle=G.stars>1?'#ffd040':'#3a3a3a'; g.fillText('★',110,h-40);
  g.font=`bold 18px ${TYPEF}`; g.fillStyle='#8a857a'; g.fillText('02:14  E2',14,h-110); retex(tPhone); phoneDirty=false; }
function buildHands(){ const skin=M(null,{color:0xc8906c}),sleeve=M(null,{color:0x111214});
  for(const s of ['left','right']){ const n=N(STREET); mk(box(.085,.1,.11),skin,n,0,0,.02); mk(box(.03,.05,.06),skin,n,(s==='left'?1:-1)*.05,.02,-.01); mk(cyl(.045,.05,.2,8),sleeve,n,0,-.01,.15,Math.PI/2); n.vis=false; HANDS[s]={n,M:m4.make(),pos:[0,0,0],grip:false,gripEdge:false}; }
  const ph=N(HANDS.left.n); mk(box(.075,.14,.01),col(0x111111),ph,0,0,0); mk(plane(.066,.116),M(tPhone,{unlit:true}),ph,0,0,.006); ph.p=[0,.07,-.02]; ph.r=[-.9,0,0]; }

/* ---------- start / reset ---------- */
function reset(){
  G.phase='meet'; G.hasBag=false; G.lostT=0; G.queue=[]; G.line=null; G.said.clear(); G.maxStars=0; G.t=0; G.result=null; G.endT=0; setStars(0);
  P.x=START.x; P.z=START.z; P.yaw=START.yaw; P.pitch=-.05; P.run=false;
  BAG.p=BAG_HOME.slice(); BAG.r=[0,.1,0]; setParent(BAG,STREET);
  for(const c of COPS){ c.pos[0]=c.post[0]; c.pos[1]=c.post[1]; c.hd=c.post[2]; c.state='post'; c.sus=0; c.pi=0; c.wait=0; c.E.G=null; c.mark.vis=false; }
  for(const k in labels) labels[k].n.vis=false;
  if(typeof SEEN!=='undefined') SEEN.clear(); if(frozen) unfreeze();
  setObj('Degsy wants a word. He\'s outside the Golden Rooster, up the road to the west.');
  const end=$g('gEnd'); if(end) end.hidden=true; }
function start(vr){ G.on=true; G.xr=!!vr; document.body.classList.add('playing'); state.eye=true; state.layout='street'; place();
  if(!COPS.length){ makeCop('pcmale',[5.0,.55,-Math.PI/2],[[1.5,.55],[9.4,.55]]); makeCop('pcfem',[26.0,.7,-Math.PI/2],null); /* Hughes walks the near pavement; Okafor minds the front of the arches */ buildHands(); }
  CAST.danny.node.vis=false; /* you are Danny */
  reset(); }

/* ---------- copper brain ---------- */
function canSee(c){ const dx=P.x-c.pos[0],dz=P.z-c.pos[1],d=Math.hypot(dx,dz); if(d>14) return false;
  const fx=Math.sin(c.hd+c.look),fz=Math.cos(c.hd+c.look),cos=(dx*fx+dz*fz)/(d||1);
  if(d>2.2&&cos<Math.cos(1.05)) return false; return clearLine(c.pos[0],c.pos[1],P.x,P.z); }
function copTick(c,dt){ if(frozen&&state.pick===c.id) return;
  const sees=canSee(c), d=Math.hypot(P.x-c.pos[0],P.z-c.pos[1]); c.seeing=sees;
  let goal=null,speed=0,run=0;
  if(G.stars===0){
    if(sees&&G.hasBag){ c.sus+=dt*(P.running?2.6:.55)*(d<6?1.7:d>10?.45:1)*(c.state==='search'?1.5:1); } else c.sus=Math.max(0,c.sus-dt*.25);
    if(c.sus>=1){ setStars(1); c.state='chase'; c.target=[P.x,P.z]; sayNow(c.id==='pcmale'?'oi':'oiO',2.6); G.lostT=0; G.chaseT=0; for(const o of COPS) if(o!==c&&o.state!=='chase'){ o.state='alert'; } }
    if(c.state==='search'){ c.searchT-=dt; c.look=Math.sin(G.t*2.2)*.9; if(c.searchT<=0) c.state='return'; }
    if(c.state==='return'){ goal=[c.post[0],c.post[1]]; speed=1.2; if(Math.hypot(goal[0]-c.pos[0],goal[1]-c.pos[1])<.3){ c.state='post'; c.hd=c.post[2]; } }
    if(c.state==='post'||c.state==='alert'){ c.state='post';
      if(c.patrol){ if(c.wait>0){ c.wait-=dt; c.look=Math.sin(G.t*.9)*.6; } else { const t=c.patrol[c.pi]; goal=t; speed=1.0; if(Math.hypot(t[0]-c.pos[0],t[1]-c.pos[1])<.25){ c.pi=(c.pi+1)%c.patrol.length; c.wait=2.5; } } }
      else { c.look=Math.sin(G.t*.35+1)*.7; } }
  } else {
    if(c.state!=='chase'&&(G.stars===2||sees)) c.state='chase';
    if(c.state==='chase'){
      if(sees){ c.target=[P.x,P.z]; }
      goal=c.target; run=G.stars===2?1:0; speed=G.stars===2?3.25:1.95; c.look=0;
      if(goal&&Math.hypot(goal[0]-c.pos[0],goal[1]-c.pos[1])<.4&&!sees){ c.state='search'; c.searchT=3.5; if(!G.said.has('search')){ G.said.add('search'); say('search',2); } }
      if(d<1.0&&!frozen) busted(c); }
    else if(c.state==='search'){ c.searchT-=dt; c.look=Math.sin(G.t*2.2)*1.1; if(sees) c.state='chase'; if(c.searchT<=0){ c.state='search'; c.searchT=2; } }
    else { goal=[c.post[0],c.post[1]]; speed=1.2; }
  }
  /* move: straight at the goal, sliding along whatever is in the way */
  c.E.walkAmt=0; c.E.runAmt=lerp(c.E.runAmt,run,Math.min(1,dt*4));
  if(goal&&speed>0){ const gx=goal[0]-c.pos[0],gz=goal[1]-c.pos[1],gd=Math.hypot(gx,gz);
    if(gd>.05){ const st=Math.min(gd,speed*dt),o={x:c.pos[0],z:c.pos[1]}; moveBody(o,gx/gd*st,gz/gd*st,.22);
      if(Math.hypot(o.x-c.pos[0],o.z-c.pos[1])<st*.3){ moveBody(o,gz/gd*st*(c.id==='pcmale'?1:-1),-gx/gd*st*(c.id==='pcmale'?1:-1),.22); } /* stuck: step round it */
      c.pos[0]=o.x; c.pos[1]=o.z; const want=Math.atan2(gx,gz); c.hd+=Math.atan2(Math.sin(want-c.hd),Math.cos(want-c.hd))*Math.min(1,dt*8); c.E.walkAmt=1; } }
  /* pose + legs */
  const C=c.C; C.node.p=[c.pos[0],floorY(c.pos[0],c.pos[1]),c.pos[1]]; C.node.r=[0,c.hd,0]; c.E.hd=c.hd; c.E.pos=c.pos;
  const J=C.J; for(const k of JOINTS) if(J[k]&&C.base[k]) J[k].r=C.base[k].slice(); J.hips.p=[0,C.hy0,0];
  J.head.r=[J.head.r[0],J.head.r[1]+c.look,J.head.r[2]];
  if(c.sus>.2||c.state==='chase'){ const dx=P.x-c.pos[0],dz=P.z-c.pos[1],a=Math.atan2(dx,dz)-c.hd,w=Math.atan2(Math.sin(a),Math.cos(a)); J.head.r[1]=clamp(w,-1.1,1.1); }
  gait(c.E,G.t,dt); skinUpdate(C);
  /* the mark over the head */
  const k=G.stars>0&&c.state==='chase'?3:c.sus>.55?2:c.sus>.08?1:0; c.mark.vis=k>0&&!G.result; if(k) { c.mark.mesh.mats[0]=markM[k-1]; c.mark.mesh.runs=null; const hp=mulP(J.head.world,[0,0,0]); c.mark.p=[hp[0],hp[1]+.55+.04*Math.sin(G.t*6),hp[2]]; c.mark.r=[0,Math.atan2(P.x-hp[0],P.z-hp[2]),0]; const s=k===1?.6+.4*Math.min(1,c.sus*2):1; c.mark.s=[s,s,1]; }
}

/* ---------- the job ---------- */
function bark(id,key,r){ if(G.said.has(key)) return; const C=CAST[id]; if(!C) return; const p=C.node.p; if(Math.hypot(P.x-p[0],P.z-p[2])<r){ G.said.add(key); say(key,2.6); } }
function busted(c){ if(G.result) return; G.result='nicked'; G.endT=0; sayNow(c.id==='pcmale'?'nicked':'nickedO',3); setObj('Nicked.'); if(KEY_CAST.includes(c.id)) freezeOn(c.id,false); showEnd('NICKED','PC '+(c.id==='pcmale'?'Hughes':'Okafor')+' had you bang to rights. The bag goes in an evidence locker; Degsy goes very quiet.'); }
function done(){ if(G.result) return; G.result='done'; G.endT=0; sayNow('terryYes',3.4); setObj('Job done.'); setParent(BAG,STREET); BAG.p=[LOCKUP.x-.4,PAVE_Y+.15,FZ-.9]; BAG.r=[0,.6,0]; G.hasBag=false;
  showEnd('JOB DONE','£200 in your pocket. Degsy owes you £150 of it. '+(G.maxStars?'The Old Bill clocked you, and Ali\'s camera saw everything.':'Clean. Not even Ali\'s camera saw you.')); }
function showEnd(h,p){ const e=$g('gEnd'); if(!e) return; if(document.pointerLockElement) document.exitPointerLock?.(); $g('gEndH').textContent=h; $g('gEndP').textContent=p; e.hidden=false; e.dataset.kind=G.result; }
function jobTick(dt){
  const deg=CAST.degsy.node.p, dDeg=Math.hypot(P.x-deg[0],P.z-deg[2]);
  if(G.phase==='meet'){ if(dDeg<9) bark('degsy','degsyWave',9); if(dDeg<2.6){ G.phase='brief'; G.queue=[]; G.line=null; say('d1',2.6); say('d2',4.4); say('d3',3.6); G.briefT=10.6; } }
  else if(G.phase==='brief'){ G.briefT-=dt; if(G.briefT<=0){ G.phase='getbag'; setObj('Grab the bag off the boot of Degsy\'s silver motor.'); } }
  if(G.phase==='getbag'&&G.hasBag){ G.phase='deliver'; say('dGo',2.6); setObj('Get the bag to Arch 9, under the railway bridge at the east end. Keep it away from the coppers. Hollis House runs through to a back alley.'); }
  if(G.phase==='deliver'&&!G.result){
    const dL=Math.min(Math.hypot(P.x-LOCKUP.x,P.z-(FZ-.4)),Math.hypot(P.x-BACKDOOR.x,P.z-BACKDOOR.z)+.4);
    if(dL<2.0){ if(G.stars===0) done(); else if(!G.said.has('terryNo')){ G.said.add('terryNo'); say('terryNo',3); } } else if(dL>4) G.said.delete('terryNo');
    if(G.stars>0){ const seen=COPS.some(c=>c.seeing); G.chaseT=(G.chaseT||0)+dt;
      if(seen){ G.lostT=0; if(G.stars===1&&(P.running||G.chaseT>14)){ setStars(2); sayNow('run2',3); } }
      else { G.lostT+=dt; if(G.lostT>(G.stars===1?5:8)){ setStars(0); for(const c of COPS){ c.sus=0; if(c.state==='chase'||c.state==='search'){ c.state='search'; c.searchT=3; } } say('lost',2.4); G.said.delete('search'); setObj('Lost \'em. Get the bag to Arch 9, under the railway bridge at the east end.'); } } }
    setObj(G.stars?(G.stars===1?'The Old Bill\'s onto you. Break their line of sight and lose them.':'Two coppers on your tail. Get out of sight and stay there.'):G.obj); }
  bark('maureen','maureen',2.8); bark('ali','ali',3.2); bark('piotr','piotr',2.6); bark('kwame','kwame',2.4);
}
function linesTick(dt){
  if(!G.line&&G.queue.length){ G.line=G.queue.shift(); G.lineT=G.line.dur; const L=labelFor(G.line.who); drawLabel(L.t,G.line.text); const s=$g('gSub'); if(s){ const nm={degsy:'DEGSY',pcmale:'PC HUGHES',pcfem:'PC OKAFOR',terry:'TERRY (inside)',maureen:'MAUREEN',ali:'ALI',piotr:'PIOTR',kwame:'KWAME'}[G.line.who]||''; s.innerHTML=''; const b=document.createElement('b'); b.textContent=nm; s.append(b,document.createTextNode(' '+G.line.text)); s.hidden=false; } }
  for(const k in labels) labels[k].n.vis=false;
  if(G.line){ G.lineT-=dt; const L=labelFor(G.line.who),h=speakerHead(G.line.who); if(h){ L.n.vis=true; L.n.p=h; L.n.r=[0,Math.atan2(P.x-h[0],P.z-h[2]),0]; const k=clamp(Math.hypot(P.x-h[0],P.z-h[2])/2.6,1,2.4); L.n.s=[k,k,1]; }
    if(G.lineT<=0){ G.line=null; const s=$g('gSub'); if(s&&!G.queue.length) s.hidden=true; } }
}
/* pick up: desktop E near the bag and looking roughly at it; VR: a squeezed hand on it */
function tryGrab(handPos){ if(G.hasBag||G.result||G.phase==='meet'||G.phase==='brief') return false; const b=BAG.p; /* on the boot: STREET sits at the origin */
  if(handPos){ if(v3.len(v3.sub(handPos,b))>.38) return false; } else if(Math.hypot(P.x-b[0],P.z-b[2])>2.0) return false;
  G.hasBag=true; return true; }

/* ---------- desktop input and camera ---------- */
const keysG={}; addEventListener('keydown',e=>{ if(!G.on) return; keysG[e.code]=true; if(e.code==='KeyE') tryGrab(null); if(e.code==='KeyR'&&G.result) reset(); if(e.code==='Escape'&&G.result) reset(); });
addEventListener('keyup',e=>{ keysG[e.code]=false; });
addEventListener('mousemove',e=>{ if(!G.on||G.xr||document.pointerLockElement!==cv) return; P.yaw-=e.movementX*.0024; P.pitch=clamp(P.pitch-e.movementY*.0024,-1.3,1.25); });
cv.addEventListener('click',()=>{ if(G.on&&!G.xr&&document.pointerLockElement!==cv) cv.requestPointerLock?.(); if(G.on&&!G.xr) tryGrab(null); });
function deskTick(dt){
  let f=(keysG.KeyW||keysG.ArrowUp?1:0)-(keysG.KeyS||keysG.ArrowDown?1:0), s=(keysG.KeyD||keysG.ArrowRight?1:0)-(keysG.KeyA||keysG.ArrowLeft?1:0);
  P.run=!!(keysG.ShiftLeft||keysG.ShiftRight); moveP(f,s,P.yaw,dt);
  const ey=floorY(P.x,P.z)+1.65, cp=Math.cos(P.pitch);
  cam.t=[P.x,ey,P.z]; cam.r=.04; cam.th=P.yaw+Math.PI; cam.ph=Math.PI/2+P.pitch; goal.t=cam.t.slice(); goal.th=cam.th; goal.ph=cam.ph; goal.r=cam.r;
  /* the bag in your right hand, low at your side */
  if(G.hasBag){ setParent(BAG,STREET); const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),rx=-fz,rz=fx; BAG.p=[P.x+fx*.45+rx*-.32,ey-.72,P.z+fz*.45+rz*-.32]; BAG.r=[0,P.yaw+Math.PI/2,0]; } }
function moveP(f,s,yaw,dt){ const L=Math.hypot(f,s); P.running=false; if(L<.12) return; const sp=(P.run?3.5:1.6)*Math.min(1,L)/L; P.running=P.run;
  const fx=Math.sin(yaw),fz=Math.cos(yaw); moveBody(P,(fx*f-fz*s)*sp*dt,(fz*f+fx*s)*sp*dt,P.r); PL.x=P.x; PL.z=P.z; }

/* ---------- WebXR ---------- */
const XR={session:null,space:null,origin:[0,0,0],yaw:0,res:720,btn:{},runToggle:false,snap:false,last:0};
function worldFromLocal(){ const m=m4.make(); m4.compose(m,XR.origin,[0,XR.yaw,0],[1,1,1]); return m; }
function poseMat(pose){ const m=new Float32Array(16); m.set(pose.transform.matrix); const o=m4.make(); m4.mul(o,worldFromLocal(),m); return o; }
async function enterVR(){
  try{ const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']}); await gl.makeXRCompatible();
    session.updateRenderState({baseLayer:new XRWebGLLayer(session,gl,{antialias:false,depth:false}),depthNear:.04,depthFar:120});
    let space; try{ space=await session.requestReferenceSpace('local-floor'); XR.floorY=0; }catch(_){ space=await session.requestReferenceSpace('local'); XR.floorY=1.62; }
    XR.session=session; XR.space=space; start(true); XR.yaw=START.yaw+Math.PI; XR.origin=[P.x,floorY(P.x,P.z)+XR.floorY,P.z]; XR.last=0;
    $g('gStart').hidden=true;
    session.addEventListener('end',()=>{ XR.session=null; G.xr=false; G.on=false; document.body.classList.remove('playing'); $g('gStart').hidden=false; resumeDesk(); });
    session.requestAnimationFrame(xrFrame); }
  catch(err){ fail('Could not start VR: '+(err&&err.message||err)+'. Open this page in the Quest browser and try again.'); } }
let resumeDesk=()=>{};
function xrFrame(t,xf){ const session=xf.session; session.requestAnimationFrame(xrFrame);
  const dt=Math.min(.05,XR.last?(t-XR.last)/1000:1/72); XR.last=t;
  const vp=xf.getViewerPose(XR.space); if(!vp) return;
  const Hm=poseMat(vp),eye=colOf(Hm,3),f=norm3(v3.sc(colOf(Hm,2),-1));
  const hy=Math.atan2(f[0],f[2]);
  /* the head can walk into walls physically: slide the play space back */
  { const bx=P.x,bz=P.z; const o={x:P.x,z:P.z}; moveBody(o,eye[0]-P.x,eye[2]-P.z,P.r); XR.origin[0]+=o.x-eye[0]; XR.origin[2]+=o.z-eye[2]; P.x=o.x; P.z=o.z; }
  P.yaw=hy; P.pitch=Math.asin(clamp(f[1],-1,1));
  for(const src of session.inputSources){ const hand=src.handedness; if(hand!=='left'&&hand!=='right') continue; const H_=HANDS[hand]; if(!H_) continue;
    const gp_=src.gripSpace&&xf.getPose(src.gripSpace,XR.space); if(gp_){ const Mh=poseMat(gp_); setLocal(H_.n,m4.make(),Mh); H_.n.vis=true; H_.pos=colOf(Mh,3); H_.M=Mh; }
    const gp=src.gamepad; if(!gp) continue; const b=gp.buttons,ax=gp.axes,pr=i=>!!(b[i]&&b[i].pressed),edge=i=>{ const k=hand+i,p=pr(i),w=XR.btn[k]; XR.btn[k]=p; return p&&!w; };
    const grip=edge(1),trig=edge(0),stickC=edge(3);
    if((grip||trig)&&!G.hasBag&&tryGrab(H_.pos)) G.bagHand=hand;
    if((trig||edge(4))&&G.result) reset();
    if(hand==='left'){ const sx=ax[2]||0,sz=ax[3]||0; if(stickC){ XR.runToggle=!XR.runToggle; } P.run=XR.runToggle; const bx=P.x,bz=P.z; moveP(-sz,sx,hy,dt); if(Math.hypot(sx,sz)<.12) XR.runToggle=false; XR.origin[0]+=P.x-bx; XR.origin[2]+=P.z-bz; }
    else { const sx=ax[2]||0; if(Math.abs(sx)>.7&&!XR.snap){ XR.snap=true; const a=-Math.sign(sx)*Math.PI/4,c=Math.cos(a),s=Math.sin(a),dx=XR.origin[0]-eye[0],dz=XR.origin[2]-eye[2];
        XR.origin[0]=eye[0]+dx*c+dz*s; XR.origin[2]=eye[2]-dx*s+dz*c; XR.yaw+=a; } else if(Math.abs(sx)<.3) XR.snap=false; } }
  XR.origin[1]=floorY(P.x,P.z)+XR.floorY;
  if(G.hasBag&&G.bagHand&&HANDS[G.bagHand]){ setParent(BAG,HANDS[G.bagHand].n); BAG.p=[0,-.22,.02]; BAG.r=[0,Math.PI/2,0]; }
  if(phoneDirty) drawPhone();
  /* the cam fields drive the freeze-frame gaze test */
  cam.t=eye.slice(); cam.r=.04; cam.th=hy+Math.PI; cam.ph=Math.PI/2+P.pitch;
  stepWorld(dt);
  const layer=session.renderState.baseLayer; updateWorld(world,null);
  for(const v of vp.views){ const vpt=layer.getViewport(v); proj.set(v.projectionMatrix); const em=new Float32Array(16); em.set(v.transform.matrix); const wm=m4.make(); m4.mul(wm,worldFromLocal(),em); view.set(rigidInv(wm));
    const w=Math.max(1,Math.round(XR.res*vpt.width/vpt.height)); ensureFB(w,XR.res); renderMats(w,XR.res); postTo(layer.framebuffer,vpt.x,vpt.y,vpt.width,vpt.height,w,XR.res); } }
/* renderScene, but with proj and view already set (the headset's own per-eye matrices) */
function renderMats(w,h){ gl.bindFramebuffer(gl.FRAMEBUFFER,fb); gl.viewport(0,0,w,h); gl.clearColor(L.fog[0],L.fog[1],L.fog[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST); gl.useProgram(MAIN.p); curCull=null; curMat=null; curTex=null; gl.activeTexture(gl.TEXTURE0); cullOn=false; const u=MAIN.loc;
  gl.uniformMatrix4fv(u.viewMatrix,false,view); gl.uniformMatrix4fv(u.projectionMatrix,false,proj);
  gl.uniform1f(u.uSnap,state.ps1&&state.snap?1:0); gl.uniform1f(u.uAffine,state.ps1&&state.affine?1:0); gl.uniform2f(u.uRes,w,h);
  gl.uniform3fv(u.uAmb,L.amb); gl.uniform3fv(u.uDirDir,L.dirDir); gl.uniform3fv(u.uDirCol,L.dirCol);
  gl.uniform3fv(u.uPLPos,L.plPos); gl.uniform3fv(u.uPLCol,L.plCol); gl.uniform1fv(u.uPLDist,L.plDist);
  gl.uniform3fv(u.uFogCol,L.fog); gl.uniform1f(u.uFogNear,L.fogNear); gl.uniform1f(u.uFogFar,L.fogFar); gl.uniform1i(u.map,0); if(u.uSkyFade) gl.uniform1f(u.uSkyFade,0);
  drawTree(world); gl.bindVertexArray(null); }
function postTo(target,x,y,w,h,sw,sh){ gl.bindFramebuffer(gl.FRAMEBUFFER,target); gl.viewport(x,y,w,h); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null; curTex=null;
  gl.useProgram(POST_LDN.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
  gl.uniform1i(POST_LDN.loc.tScene,0); gl.uniform2f(POST_LDN.loc.uRes,sw,sh); gl.uniform1f(POST_LDN.loc.uDither,state.dither?1:0); gl.uniform1f(POST_LDN.loc.uGrade,LOOK.grade?1:0); gl.uniform1f(POST_LDN.loc.uFreeze,LOOK.freeze);
  gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null); }

/* ---------- one step of the game (the art-set loop calls this; the headset loop too) ---------- */
let stepWorld=()=>{};
function tick(dt){ if(!G.on) return; if(!G.xr) deskTick(dt);
  G.t+=dt; if(G.result){ G.endT+=dt; linesTick(dt); return; }
  for(const c of COPS) copTick(c,dt); jobTick(dt); linesTick(dt); }
return {G,P,COPS,start,reset,tick,enterVR,tryGrab,canSee,clearLine,setStepWorld:f=>{ stepWorld=f; },setResume:f=>{ resumeDesk=f; },labels,done,busted,standable};
})();
