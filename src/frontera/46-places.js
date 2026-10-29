
/* =====================================================================================================
   PLACES: a stash house in a colonia on the edge of Puerto Seco, and the tunnel under it that runs to the other
   side. Same builder as the House Calls set. Each has its lights on, cut, seen through night vision, and in thermal.
   ===================================================================================================== */
const S_=(t,color)=>({t,color});
const win=(at,w=1.2,y0=1.0,y1=2.0)=>({at,w,y0,y1,win:true});
const door=(at,w=.9,swing=1.2,o={})=>Object.assign({at,w,y0:0,y1:2.05,door:true,swing},o);
const gap=(at,w,y1=2.1)=>({at,w,y0:0,y1});
function place(H,fn,x,z,ry=0,...a){ const n=N(H.g,x,0,z,0,ry,0); FX[fn](n,...a); return n; }
const faceTo=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
function who(H,id,x,z,ry,pose,o={}){ const n=N(H.g,x,o.y||0,z,0,ry,0); const C=makeChar(id,n,'p:'+H.key); applyPose(C,pose);
  if(o.face){ C.J.headMesh.mesh.mats[0]=C.faceM[o.face]; C.J.headMesh.mesh.runs=null; } skinUpdate(C); C.node=n; tagHeat(C); H.chars.push(C); H.people.push({id,C,x,z,y:o.y||0}); return C; }

/* ---------- painted surfaces ---------- */
const cinder=(paint,seed,o={})=>wallTex(paint,seed,(g,w,h,r)=>{ for(let y=0;y<h;y+=6){ R(g,'rgba(0,0,0,.14)',0,y,w,1); for(let x=(y/6|0)%2?0:8;x<w;x+=16) R(g,'rgba(0,0,0,.12)',x,y,1,6); }
  for(let i=0;i<(o.peel??5);i++){ const x=r()*w,y=r()*h*.85; ell(g,x,y,2+r()*4,2+r()*3,'#9a968c'); ell(g,x+.5,y+.5,1+r()*2,1+r()*2,'#8a867c'); }
  vfill(g,0,h*.7,w,h*.3,[[0,'rgba(90,70,40,0)'],[1,'rgba(90,70,40,.5)']]); stainV(g,r,'rgba(60,40,20,.3)',2,h); if(o.fn) o.fn(g,w,h,r); },{skirt:false,grain:9});
const tCinPink=cinder('#c88a84',1501), tCinTurq=cinder('#4a9a94',1502), tCinOchre=cinder('#c89a48',1503), tCinRaw=cinder('#8a867e',1504,{peel:0}), tCinBlue=cinder('#5a7ab0',1505);
const tCinShop=cinder('#e2d8b8',1506,{peel:2,fn:(g,w,h)=>{ R(g,'#b8302a',0,6,w,12); text(g,'ABARRO',1,9,'#f2ece0'); }});
const tCinShop2=cinder('#e2d8b8',1507,{peel:2,fn:(g,w,h)=>{ R(g,'#b8302a',0,6,w,12); text(g,'TES',8,9,'#f2ece0'); }});
const tMural=wallTex('#3a6a8a',1508,(g,w,h,r)=>{ vfill(g,0,0,w,h*.6,[[0,'#e86a3a'],[.6,'#f2b84a'],[1,'#3a8a9a']]); ell(g,16,h*.42,7,7,'#fff0b0'); poly(g,[[0,h*.6],[10,h*.45],[18,h*.55],[26,h*.4],[32,h*.6]],'#2a4a5a');
  for(let i=0;i<8;i++){ const x=r()*w,y=h*.62+r()*h*.3; ell(g,x,y,3,2.4,['#e84a6a','#f2c84a','#e8e2d4'][i%3]); ell(g,x,y,1,1,'#2a1a10'); } },{skirt:false,grain:6});
const tPlaster=wallTex('#a8b89a',1511,(g,w,h,r)=>{ vfill(g,0,h*.55,w,h*.45,[[0,'#7a8a6e'],[1,'#5a6a52']]); R(g,'#4a5a44',0,h*.55|0,w,1); stainV(g,r,'rgba(60,50,30,.35)',3,h); for(let i=0;i<3;i++) ell(g,r()*w,r()*h*.5,2,1.4,'#8a8a7a'); });
const tPlasterY=wallTex('#d8c890',1512,(g,w,h,r)=>{ R(g,'#e8e2d0',0,h*.5,w,h*.5-3); for(let x=0;x<w;x+=5) R(g,'rgba(40,90,120,.25)',x,h*.5|0,2,h*.5-3); stainV(g,r,'rgba(80,60,30,.3)',2,h); },{skirt:'#3a5a7a'});
const tPlasterPink=wallTex('#d8a8a8',1513,(g,w,h,r)=>{ stainV(g,r,'rgba(80,50,40,.3)',3,h); });
const tFlTerra=flTex('#a8583a',1521,(g,w,h,r)=>{ for(let k=0;k<w;k+=10){ R(g,'#7a3a24',k,0,1,h); R(g,'#7a3a24',0,k,w,1); } for(let i=0;i<5;i++) ell(g,r()*w,r()*h,3,2,'rgba(60,30,20,.3)'); });
const tDust=flTex('#8a7458',1522,(g,w,h,r)=>{ for(let i=0;i<220;i++) R(g,['#9a8466','#7a6448','#a8946e'][r()*3|0],r()*w|0,r()*h|0,2,1); for(let y=4;y<h;y+=9) R(g,'rgba(60,50,40,.2)',0,y,w,1); },8);
const tEarth=wallTex('#6a4e34',1531,(g,w,h,r)=>{ vfill(g,0,0,w,h,[[0,'#5a422c'],[.5,'#7a5a3c'],[1,'#4a3424']]); for(let i=0;i<70;i++) ell(g,r()*w,r()*h,.6+r()*1.4,.5+r(),['#8a6a4a','#3a2818','#9a8a7a','#5a4a3a'][r()*4|0]); for(let i=0;i<6;i++) R(g,'rgba(30,20,10,.3)',r()*w|0,0,1,h); },{skirt:false,grain:12});
const tMud=flTex('#4a3624',1532,(g,w,h,r)=>{ for(let i=0;i<160;i++) R(g,['#5a4430','#3a2a1a','#6a5440'][r()*3|0],r()*w|0,r()*h|0,2,1); ell(g,18,14,8,4,'rgba(30,40,40,.45)'); },10);
const tBeam=P2(16,32,(g,w,h)=>{ R(g,'#8a6a42',0,0,w,h); for(let x=0;x<w;x+=3) R(g,'#6a4a2a',x,0,1,h); R(g,'#5a3a1a',0,10,w,1); },10,1533);
const tBricks=P2(16,16,(g,w,h)=>{ R(g,'#c8b07a',0,0,w,h); R(g,'#8a6a3a',0,4,w,2); R(g,'#8a6a3a',0,11,w,2); R(g,'#e8e2d0',5,0,2,h); },6,1534);
const tCash=P2(8,8,(g,w,h)=>{ R(g,'#7a9a7a',0,0,w,h); R(g,'#e8e2d4',0,3,w,2); },4,1535);
const tCorrug=P2(32,32,(g,w,h)=>{ R(g,'#8a8a82',0,0,w,h); for(let x=0;x<w;x+=4){ R(g,'#a8a8a0',x,0,1,h); R(g,'#6a6a62',x+2,0,1,h); } vfill(g,0,h*.6,w,h*.4,[[0,'rgba(140,70,30,0)'],[1,'rgba(140,70,30,.5)']]); },6,1536);
const tSpray=cutTex(64,16,(g,w,h)=>{ text(g,'EL OTRO LADO',3,4,'#e8e2d4'); for(let x=3;x<50;x+=3) R(g,'rgba(232,226,212,.9)',x,11,2,1); R(g,'#e8e2d4',50,10,6,3); R(g,'#e8e2d4',54,9,2,5); });
const tLaundry=P2(16,16,(g,w,h)=>{ R(g,'#e8e2d4',0,0,8,h); R(g,'#3a6aa8',8,0,8,10); },3,1537);
const mPlastic=M(null,{color:0xe8e4dc}), mBlackPipe=M(null,{color:0x161618});
/* bits of colonia: bars, a water tank, rebar, power lines, gas cylinder, plastic chairs, a money counter */
Object.assign(FX,{
  bars(g,w,y0=1.0,y1=2.0){ for(let x=-w/2+.08;x<w/2;x+=.12) mk(box(.016,y1-y0,.016,{at:[0,(y1-y0)/2,0]}),mBlackPipe,g,x,y0,.09); mk(box(w,.03,.03),mBlackPipe,g,0,(y0+y1)/2,.09); },
  tinaco(g){ mk(cyl(.55,.55,1.1,12,{at:[0,.55,0]}),M(null,{color:0x1a1a1c}),g); mk(cyl(.2,.2,.08,10),M(null,{color:0x1a1a1c}),g,0,1.14,0); },
  rebar(g,n=4,seed=1){ const r=rng(seed); for(let i=0;i<n;i++) mk(box(.016,.6+r()*.7,.016,{at:[0,.35,0]}),M(null,{color:0x6a3a24}),g,(r()-.5)*.2,0,(r()-.5)*.2,(r()-.5)*.3,0,(r()-.5)*.3); },
  pole(g,h=7){ mk(cyl(.1,.13,h,6,{at:[0,h/2,0]}),M(tCinRaw),g); mk(box(1.2,.08,.08),mBlackPipe,g,0,h-.3,0); },
  wire(g,a,b,h=6.6){ const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=8; for(let i=0;i<n;i++){ const t0=i/n,t1=(i+1)/n,sag=t=>-Math.sin(t*Math.PI)*.5,x=a[0]+dx*(t0+t1)/2,z=a[1]+dz*(t0+t1)/2,y=h+sag((t0+t1)/2);
    mk(box(.02,.02,L/n+.02),mBlackPipe,g,x,y,z,Math.atan2(sag(t1)-sag(t0),L/n),Math.atan2(dx,dz),0); } },
  gascyl(g){ mk(cyl(.17,.17,1.0,10,{at:[0,.5,0]}),M(null,{color:0xd8701a}),g); mk(cyl(.06,.06,.12,6),M(null,{color:0xa8a8a0}),g,0,1.05,0); },
  pchair(g){ mk(box(.46,.04,.44),mPlastic,g,0,.44,0); mk(box(.46,.46,.04),mPlastic,g,0,.7,-.21,-.12,0,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.035,.44,.035,{at:[0,.22,0]}),mPlastic,g,sx*.2,0,sz*.19,sz*.08,0,sx*.08); },
  counttable(g){ FX.table(g,1.8,.9,0xd8d4cc); const r=rng(77); for(let i=0;i<14;i++) mk(box(.16,.04+r()*.06,.07),MT(tCash),g,-.7+(i%7)*.2,.79,-.25+(i/7|0)*.3,0,(r()-.5)*.2,0);
    mk(box(.3,.18,.25),M(null,{color:0x2a2a2e}),g,.55,.86,.15); mk(box(.2,.02,.1),M(null,{color:0x7cf06a,unlit:true}),g,.55,.96,.25); for(let i=0;i<5;i++) mk(box(.3,.12,.2),MT(tBricks),g,.6-(i%3)*.32,.83+(i/3|0)*.12,-.2+(i%2)*.04,0,i*.2,0); },
  bricksPile(g,n=12,seed=3){ const r=rng(seed); for(let i=0;i<n;i++) mk(box(.32,.12,.22),MT(tBricks),g,(i%4)*.34-.5,.06+Math.floor(i/8)*.12+((i/4|0)%2)*.12,((i/4|0)%2)*.24-.12+(r()-.5)*.04,0,(r()-.5)*.2,0); },
  sandbags(g,n=6){ for(let i=0;i<n;i++) mk(box(.5,.18,.3,{tw:.9,td:.9}),M(null,{color:0xb8a880}),g,(i%3)*.52-.52,.09+Math.floor(i/3)*.18,0,0,(i%2)*.1,0); },
  ladder(g,h,w=.45){ for(const s of [-1,1]) mk(box(.05,h,.05,{at:[0,h/2,0]}),M(tBeam),g,s*w/2,0,0); for(let y=.25;y<h;y+=.3) mk(box(w,.03,.04),M(tBeam),g,0,y,0); },
  shaft(g){ /* the hole in the back room floor: a frame, a winch tripod, a ladder down into the dark */
    mk(plane(1.1,1.1),M(null,{color:0x050403}),g,0,-.01,0,-Math.PI/2); for(const [x,z,w,d] of [[0,-.6,1.3,.1],[0,.6,1.3,.1],[-.6,0,.1,1.1],[.6,0,.1,1.1]]) mk(box(w,.08,d),M(tBeam),g,x,.04,z);
    const l=N(g,0,-2.6,-.48,-.08,0,0); FX.ladder(l,4.0); for(let i=0;i<3;i++){ const a=i/3*Math.PI*2; mk(box(.06,2.3,.06,{at:[0,1.15,0]}),M(tBeam),g,Math.sin(a)*.8,0,Math.cos(a)*.8,Math.cos(a)*.36,0,-Math.sin(a)*.36); }
    mk(cyl(.08,.08,.3,8),M(tSteel),g,0,2.12,0,0,0,Math.PI/2); mk(box(.01,1.9,.01,{at:[0,-.95,0]}),M(null,{color:0xc8b880}),g,0,2.1,0); mk(box(.4,.3,.4),M(null,{color:0x5a4a32}),g,0,.3,0); },
  generator(g){ mk(box(.9,.6,.55,{at:[0,.3,0]}),M(null,{color:0xc8a020}),g); mk(box(.7,.35,.4),M(null,{color:0x2a2a2c}),g,0,.75,0); mk(box(.2,.12,.02),M(null,{color:0x7cf06a,unlit:true}),g,.25,.7,.21); for(const sx of [-1,1]) mk(box(.04,.7,.04),mBlackPipe,g,sx*.47,.35,0); },
  laundry(g,len){ mk(box(len,.01,.01),mBlackPipe,g,0,1.9,0); const r=rng(len*7); for(let x=-len/2+.3;x<len/2-.2;x+=.5) mk(plane(.35,.45+r()*.2),MT(tLaundry,{double:true,color:[0xffffff,0xd8a8a8,0xa8c8e8][(x*10|0)%3]}),g,x,1.62,0); },
  cart(g){ mk(box(.7,.35,1.1,{at:[0,.5,0]}),M(tSteel),g); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(cyl(.1,.1,.06,8),mBlackPipe,g,sx*.32,.12,sz*.4,0,0,Math.PI/2); FX.bricksPile(N(g,0,.68,0),8,9); },
  rails(g,len){ for(const sx of [-1,1]) mk(box(.04,.05,len),M(tSteel),g,sx*.32,.025,0); for(let z=-len/2;z<len/2;z+=.6) mk(box(.8,.04,.12),M(tBeam),g,0,.02,z); },
  duct(g,len){ for(let z=-len/2;z<len/2;z+=.5) mk(cyl(.11,.11,.46,8),M(null,{color:0xb8b8b0}),g,0,0,z+.25,Math.PI/2,0,0); },
  mattress(g){ return FURN.mattress(g); },
  bulb(g,on=true){ mk(box(.07,.09,.07),M(null,{color:on?0xffd8a0:0x3a3a36,unlit:on}),g,0,0,0); }
});

/* ================= the stash house: Colonia Tierra Blanca ================= */
function buildStash(){ const H=House('stash',{name:'The stash house',where:'Colonia Tierra Blanca, east Puerto Seco',
  note:'A pink cinderblock house on a dirt street, like every other one. A plastic chair at the gate for the lookout, money counted at the front table, and a hole in the back-room floor that goes down eleven metres and under the border.',
  plays:'The lookout calls in every car. Cut the generator in the yard and the whole house goes dark, then it\'s your night vision against their flashlights.',
  cam:{t:[0,.6,1.8],th:.55,ph:.92,r:20}});
  floorHole(H,-15,-9,15,16,-4.5,-4.6,-3.4,-3.5,tDust,{y:-.03,tile:2}); floor(H,-5,4,5,8,tFlConc,{y:-.015,tile:2});
  floorHole(H,-5,-5,0,-1,-4.5,-4.6,-3.4,-3.5,tFlConc,{tile:2}); floor(H,-5,-1,1,4,tFlTerra,{tile:.8}); floor(H,1,-1,5,4,tFlTerra,{tile:.8,color:0xc8a898}); floor(H,0,-5,2,-1,tFlTerra,{tile:.6,color:0x9a9a9a}); floor(H,2,-5,5,-1,tFlConc,{tile:2});
  const P=S_(tPlaster),PY=S_(tPlasterY),PP=S_(tPlasterPink),EX=S_(tCinPink),RAW=S_(tCinRaw),TQ=S_(tCinTurq);
  /* house shell */
  wall(H,-5,4,1,4,EX,P,[door(-1.1,.9,-1.2,{doorT:tCorrug}),win(-3.5,1.1)]); wall(H,1,4,5,4,EX,PY,[win(3,1.0)]);
  wall(H,-5,-5,0,-5,P,EX,[win(-2,.6,1.6,2.1)]); wall(H,0,-5,2,-5,RAW,EX,[win(1,.5,1.6,2.0)]); wall(H,2,-5,5,-5,PP,EX,[win(3.5,.8,1.4,2.1)]);
  wall(H,-5,-1,-5,4,P,EX); wall(H,-5,-5,-5,-1,P,EX); wall(H,5,-1,5,4,EX,PY,[door(1.4,.85,1.2,{doorT:tCorrug})]); wall(H,5,-5,5,-1,EX,PP);
  wall(H,-5,-1,0,-1,P,P,[door(-.8,.85,1.3)]); wall(H,0,-1,1,-1,P,RAW); wall(H,1,-1,2,-1,PY,RAW,[gap(1.5,.7)]); wall(H,2,-1,5,-1,PY,PP,[gap(3.0,.85)]);
  wall(H,1,-1,1,4,PY,P,[gap(1.6,1.2)]); wall(H,0,-5,0,-1,RAW,P); wall(H,2,-5,2,-1,PP,RAW);
  place(H,'bars',-3.5,4,0,1.1); place(H,'bars',3,4,0,1.0);
  /* yard wall and gate */
  wall(H,-5,8,1.6,8,TQ,RAW,[],{h:1.9}); wall(H,4.6,8,5,8,TQ,RAW,[],{h:1.9}); wall(H,-5,4,-5,8,TQ,RAW,[],{h:1.9}); wall(H,5,4,5,8,RAW,TQ,[],{h:1.9});
  { const gate=N(H.g,1.6,0,8,0,-1.15,0); mk(box(3,1.8,.05,{at:[1.5,.9,0]}),MT(tCorrug,{repeat:[2,1]}),gate); }
  room(H,'Front room · the count',-5,-1,1,4); room(H,'Kitchen',1,-1,5,4); room(H,'Back room · the shaft',-5,-5,0,-1); room(H,'Bedroom',2,-5,5,-1); room(H,'Yard and street',-5,4,6,13);
  /* street */
  floor(H,-15,8.4,15,9.2,tFlConc,{y:-.02,tile:1.2,color:0xb8b0a0});
  for(const [x0,x1,t] of [[-15,-12,tCinBlue],[-12,-8,tMural],[-8,-5.3,tCinOchre]]) wall(H,x0,-6,x1,-6,S_(t),S_(t),[],{h:2.9});
  wall(H,-5.3,-6,-5.3,8,S_(tCinOchre),S_(tCinOchre),[],{h:3.0}); wall(H,5.3,-6,5.3,8,S_(tCinShop),S_(tCinShop),[],{h:2.8});
  wall(H,5.3,8,10,8,S_(tCinShop),S_(tCinShop),[door(7.5,1.4,0,{doorT:tCorrug})],{h:2.8}); wall(H,10,8,15,8,S_(tCinShop2),S_(tCinShop2),[],{h:2.8});
  wall(H,-15,8,-5.3,8,S_(tMural),S_(tMural),[],{h:2.6});
  for(const [x0,x1,t] of [[-15,-9,tCinTurq],[-9,-3,tCinOchre],[-3,4,tCinBlue],[4,15,tCinPink]]) wall(H,x0,13.5,x1,13.5,S_(t),S_(t),[door((x0+x1)/2,1,0,{doorT:tCorrug})],{h:2.7});
  place(H,'car',-1.6,11.2,Math.PI/2,0x8a3a2a,'pickup'); place(H,'car',8.4,11,-Math.PI/2,0xd8d4cc,'sedan'); place(H,'pole',-5.6,9.0); place(H,'pole',9.5,9.0);
  place(H,'wire',0,0,0,[-5.6,9],[9.5,9],6.6); place(H,'wire',0,0,0,[-5.6,9],[-15,9.2],6.6); place(H,'wire',0,0,0,[9.5,9],[15,9.2],6.6); place(H,'wire',0,0,0,[-5.6,9],[-2.5,4],6.5);
  place(H,'pchair',2.9,8.7,.3); place(H,'bins',-4.6,9.6,0,2);
  /* yard */
  heatTag(place(H,'generator',-3.8,6.6,.4),.75); place(H,'gascyl',4.6,4.4); place(H,'laundry',-1.5,6.4,0,4.2); place(H,'pchair',-.2,5.0,2.6);
  /* front room: the count */
  place(H,'counttable',-2.3,1.4); for(const [x,z,ry] of [[-2.3,.65,0],[-3.4,1.4,Math.PI/2],[-1.2,2.2,Math.PI]]) place(H,'pchair',x,z,ry);
  heatTag(place(H,'crt',.35,3.55,Math.PI),.5); place(H,'mattress',-4.0,3.2,Math.PI/2); place(H,'bricksPile',-4.2,-.4,0,16,5);
  /* kitchen */
  place(H,'counter',2.9,3.62,Math.PI,2.2,tCabinetW,tCounterTop,{sink:.5,stove:-.5,upper:false}); place(H,'fridge',4.55,.45); place(H,'gascyl',1.4,3.6); place(H,'table',3.0,1.6,0,1.0,.7,0xd8d4cc);
  for(const [x,z,ry] of [[3.0,.95,0],[3.0,2.25,Math.PI]]) place(H,'pchair',x,z,ry);
  /* back room: the shaft */
  place(H,'shaft',-3.95,-4.05); place(H,'sandbags',-1.2,-4.6,0,6); place(H,'bricksPile',-1.5,-2.0,0,10,7); place(H,'crates',-4.3,-1.7,Math.PI/2);
  /* bath, bedroom */
  place(H,'toilet',1.0,-4.6); place(H,'mattress',3.5,-4.3,0); place(H,'mattress',3.5,-2.6,0); place(H,'gascyl',4.6,-1.5);
  /* roof */
  mk(box(10.3,.18,9.3),M(tCinRaw),H.roof,0,WH+.09,-.5); for(const [x,z] of [[-5,-5],[-5,4],[5,-5],[5,4],[0,-5],[0,4]]) place({g:H.roof},'rebar',x,z,0,4,x*7+z); place({g:H.roof},'tinaco',3.6,-3.6).p[1]=WH+.18;
  /* lights */
  light(H,[-2.3,2.25,1.4],[1.45,1.05,.6],5.5,'bulb'); const tv=light(H,[.35,1.0,3.0],[.5,.65,1.3],4.5); flicker(H,tv,'tv'); light(H,[3,2.5,1.6],[1.0,1.1,1.05],5,'tube');
  light(H,[-3.95,2.2,-3.2],[1.4,1.0,.55],4.5,'bulb'); light(H,[-1.1,2.3,4.5],[1.4,.95,.5],5,'bulb'); light(H,[9.5,5.6,9.6],[1.6,.85,.35],13); light(H,[7.5,2.4,8.5],[.9,1.0,1.05],5);
  mk(box(.1,.1,1.2),mBlackPipe,H.g,9.5,6.1,9.6); mk(box(.36,.1,.5),M(null,{color:0xffa040,unlit:true}),H.g,9.5,6.0,10.1);
  /* people */
  who(H,'pistolero',-2.3,.6,0,'sit'); who(H,'machetero',-1.0,2.4,faceTo(-1,2.4,-2.3,1.4),'idle'); who(H,'escolta',3.9,2.6,-2.4,'idle'); who(H,'comando',-2.4,-2.6,-2.2,'idle'); who(H,'halcon',2.9,9.0,.3,'fight');
  return H; }

/* ================= the tunnel ================= */
function buildTunnel(){ const H=House('tunnel',{name:'The tunnel',where:'Eleven metres under the stash house, heading north',
  note:'Dug by hand over two years: timber frames every metre and a half, a rail line for the carts, one string of bulbs on a generator, a vent duct that never keeps up. Thirty metres of it, then a ladder up into a warehouse on the other side.',
  plays:'No light but theirs. Kill the generator and it\'s night vision and thermal only: you see them through the dust, they see nothing until your muzzle flash.',
  cam:{t:[11,.2,-4.6],th:.45,ph:.62,r:17},under:true});
  const TH=1.95, WD=1.3, E=S_(tEarth), D=.7;
  const mEarthTop=M(null,{color:0x2a1e14});
  /* a dug run: rough walls (jittered chunks), floor, timber frames, beams; ax 'x' or 'z' */
  function run(ax,c,s0,s1,o={}){ const r=rng(Math.round(s0*13+c*7)); const w=o.w||WD, len=s1-s0;
    if(ax==='x') floor(H,s0,c-w/2,s1,c+w/2,tMud,{tile:1.2}); else floor(H,c-w/2,s0,c+w/2,s1,tMud,{tile:1.2});
    for(const side of [-1,1]){ if((o.skip||[]).includes(side)) continue; const n=Math.ceil(len/1.1); for(let i=0;i<n;i++){ const a=s0+len*i/n,b=s0+len*(i+1)/n,m=(a+b)/2,j=(r()-.5)*.12,th=D+(r()-.5)*.2;
      const holes=(o.holes||[]).filter(hh=>hh.side===side&&m>hh.a&&m<hh.b); if(holes.length) continue;
      const g=box(b-a+.02,TH+.05,th); const mats=F(mEarthTop,MT(tEarth,{repeat:[(b-a)/1.2,1]}),MT(tEarth,{repeat:[(b-a)/1.2,1]}),mEarthTop,mEarthTop);
      if(ax==='x') mk(g,mats,H.g,m,TH/2,c+side*(w/2+th/2)+j); else mk(g,mats,H.g,c+side*(w/2+th/2)+j,TH/2,m,0,Math.PI/2,0); } }
    for(let s=s0+.5;s<s1-.2;s+=1.5){ const p=(x,z)=>ax==='x'?[s,c+z]:[c+z,s]; for(const side of [-1,1]){ const [x,z]=p(0,side*(w/2-.07)); mk(box(.12,TH-.05,.12,{at:[0,(TH-.05)/2,0]}),MT(tBeam),H.g,x,0,z); }
      const [x,z]=p(0,0); mk(box(ax==='x'?.14:w+.1,.14,ax==='x'?w+.1:.14),MT(tBeam),H.g,x,TH-.07,z); }
    /* ceiling (shown with the roof on) */
    if(ax==='x') mk(box(len,.4,w+D*2),MT(tEarth,{repeat:[len/1.2,1]}),H.roof,(s0+s1)/2,TH+.2,c); else mk(box(w+D*2,.4,len),MT(tEarth,{repeat:[1,len/1.2]}),H.roof,c,TH+.2,(s0+s1)/2); }
  /* shaft at the start (x 0, z 0), run A east, run B south, run C east to the exit */
  run('x',0,-.7,12.6,{holes:[{side:1,a:5,b:8.2},{side:-1,a:11.3,b:12.75}]}); run('z',12,-10.6,-.65,{w:1.3}); run('x',-10,11.3,23,{holes:[{side:1,a:11.3,b:12.75}]});
  for(const [x,z,w,d] of [[13.0,0,.7,1.4],[10.95,-10,.7,1.4],[23.35,-10,.7,1.4]]) mk(box(w,TH+.05,d),F(mEarthTop,MT(tEarth),MT(tEarth),mEarthTop,mEarthTop),H.g,x,TH/2,z);
  /* the side chamber off run A: generator, bunk, stash */
  floor(H,5,.65,8.2,3.6,tMud,{tile:1.2}); for(const [x0,z0,x1,z1] of [[4.6,.65,5,3.6],[8.2,.65,8.6,3.6]]) mk(box(x1-x0,TH+.05,z1-z0),F(mEarthTop,MT(tEarth),MT(tEarth),mEarthTop,mEarthTop),H.g,(x0+x1)/2,TH/2,(z0+z1)/2);
  mk(box(4,TH+.05,.6),F(mEarthTop,MT(tEarth,{repeat:[3,1]}),MT(tEarth,{repeat:[3,1]}),mEarthTop,mEarthTop),H.g,6.6,TH/2,3.9); mk(box(3.6,.4,3.6),MT(tEarth),H.roof,6.6,TH+.2,2.2);
  /* the shafts: the way up into the house, and the exit */
  for(const [x,z] of [[-.25,0],[22.6,-10]]){ mk(box(1.6,.6,1.6),MT(tEarth),H.roof,x,TH+.3,z); const l=N(H.g,x-.4,0,z,0,Math.PI/2,0); FX.ladder(l,4.6); mk(box(1.3,4.6,.5,{at:[0,2.3,0]}),F(mEarthTop,MT(tEarth),MT(tEarth),mEarthTop,mEarthTop),H.g,x-.75,0,z); }
  mk(plane(.95,.3),MT(tSpray,{cut:true,double:true}),H.g,21.6,1.45,-10.6+.002);
  /* rails, carts, duct, cable, puddles */
  place(H,'rails',6,0,Math.PI/2,12); place(H,'rails',12,-5.2,0,10); place(H,'rails',17.2,-10,Math.PI/2,11);
  place(H,'cart',12,-3.8); place(H,'cart',18.5,-10,Math.PI/2);
  const dA=N(H.g,6,1.68,-.5,0,Math.PI/2,0); FX.duct(dA,12.4); const dB=N(H.g,11.5,1.68,-5.5,0,0,0); FX.duct(dB,10); const dC=N(H.g,17.2,1.68,-10.5,0,Math.PI/2,0); FX.duct(dC,11);
  mk(box(12,.02,.02),mBlackPipe,H.g,6,1.86,.35); mk(box(.02,.02,10),mBlackPipe,H.g,12.4,1.86,-5.2); mk(box(11,.02,.02),mBlackPipe,H.g,17.2,1.86,-9.65);
  for(const [x,z,w,d] of [[3.2,.1,1.0,.6],[12.1,-6.4,.7,1.1],[15.2,-9.9,1.2,.7]]) mk(plane(w,d),MT(tWater,{color:0x4a5a5a}),H.g,x,.012,z,-Math.PI/2);
  /* chamber */
  heatTag(place(H,'generator',7.6,3.2,Math.PI),.75); place(H,'mattress',5.6,2.6,Math.PI/2); place(H,'bricksPile',7.2,1.3,0,14,11); place(H,'gascyl',5.2,1.0); place(H,'table',6.4,1.1,0,.9,.6,0xd8d4cc);
  mk(box(.3,.2,.2),M(null,{color:0x2a2a2e}),H.g,6.3,.88,1.1); place(H,'sandbags',22.0,-9.4,0,6);
  /* bulbs along the cable: six lit, a couple dead */
  const bl=[[2.2,0],[9.6,.35],[12.4,-2.8],[12.4,-7.4],[15.6,-9.65],[20.2,-9.65]];
  for(const [x,z] of bl){ const n=N(H.g,x,1.78,z); FX.bulb(n,true); light(H,[x,1.72,z],[1.6,1.12,.6],5.8); }
  for(const [x,z] of [[5.2,.35],[17.8,-9.65]]){ const n=N(H.g,x,1.78,z); FX.bulb(n,false); }
  light(H,[6.6,1.6,2.4],[1.25,1.05,.7],4.2,'bulb'); light(H,[-.25,4.2,0],[1.2,1.0,.75],5);
  /* people */
  who(H,'machetero',12.1,-2.5,Math.PI,'lean'); place(H,'pchair',6.9,2.6,-2.3); who(H,'pistolero',6.9,2.6,-2.3,'sit'); who(H,'halcon',5.6,2.6,0,'sleep',{y:.2}); who(H,'comando',9.9,-.05,-Math.PI/2,'fight'); who(H,'escolta',21.6,-10,Math.PI/2,'idle');
  return H; }

const PLACE_BUILDERS={stash:buildStash,tunnel:buildTunnel};
const PS={};
function getPlace(k){ if(!PS[k]){ PS[k]=PLACE_BUILDERS[k](); } return PS[k]; }
