
/* =====================================================================================================
   THE TUNNEL: Puerto Seco proof of concept. One hand-built level: a dug smuggling tunnel under the border.
   Start at the bottom of the shaft (the armoury rack and spawn board are in that first dugout), walk ~30 m of
   timbered tunnel past the pump room, out the ladder at the far end. Five cartel men are down here.
   The generator in the pump room runs every bulb: shoot it and the tunnel goes black. In the dark they only see
   you up close or by your muzzle flash, and they stop hunting and start searching. You have night vision and
   thermal: touch the top of your head with an empty hand and squeeze grip (N on a keyboard) to cycle
   goggles up / night vision / thermal.
   ===================================================================================================== */
const TUN={TH:2.05,D:.6};
/* open space: [x0,z0,x1,z1,space id] (-2 start dugout, -1 tunnel, -3 the old bore, 0 pump room, 1 exit)
   The old bore is the second route: an earlier, half-collapsed dig that leaves the main tunnel just past the pump room and
   comes back in at the far corner, so the middle of the level is a loop. No bulbs in it: pitch black even with the power on. */
const TUN_RECTS=[[-13,-4.6,-10.2,-1.4,-2],[-10.2,-3.65,7.3,-2.35,-1],[-6.4,-2.35,-3.2,.65,0],[5.6,-2.35,7.3,4.65,-1],[7.3,3.35,10.4,4.65,-1],[10.4,2.8,12.6,5.2,1],
  [.6,-2.35,1.8,4.65,-3],[1.8,3.35,5.6,4.65,-3]];
/* dug walls: [axis the wall runs along, its fixed coordinate, from, to, outward side] */
const TUN_WALLS=[['z',-13,-4.6,-1.4,-1],['x',-1.4,-13,-10.2,1],['x',-4.6,-13,-10.2,-1],['z',-10.2,-4.6,-3.65,1],['z',-10.2,-2.35,-1.4,1],
  ['x',-2.35,-10.2,-6.4,1],['x',-2.35,-3.2,.6,1],['x',-2.35,1.8,5.6,1],['x',-3.65,-10.2,7.3,-1],
  ['z',-6.4,-2.35,.65,-1],['z',-3.2,-2.35,.65,1],['x',.65,-6.4,-3.2,1],
  ['z',5.6,-2.35,3.35,-1],['z',7.3,-3.65,3.35,1],['x',3.35,7.3,10.4,-1],['x',4.65,.6,10.4,1],
  ['z',.6,-2.35,4.65,-1],['z',1.8,-2.35,3.35,1],['x',3.35,1.8,5.6,-1],
  ['z',10.4,2.8,3.35,-1],['z',10.4,4.65,5.2,-1],['x',2.8,10.4,12.6,-1],['x',5.2,10.4,12.6,1],['z',12.6,2.8,5.2,1]];
const TUN_CAST=[
  {id:'comando',name:'Chuy',x:-1.2,z:-3.0,hd:-Math.PI/2,extra:'¡No dispares, tengo hijos! (Don\'t shoot, I have kids!)'},
  {id:'pistolero',name:'Lalo',x:-4.4,z:-.9,hd:Math.PI,extra:'Yo nomás cuento el dinero— (I just count the money—)'},
  {id:'halcon',name:'Nico',x:-5.4,z:.15,hd:Math.PI*.8,extra:'Tengo veintidós años, güey— (I\'m twenty-two, man—)'},
  {id:'machetero',name:'Beto',x:6.65,z:.9,hd:Math.PI,extra:'Me obligaron, lo juro— (They made me, I swear—)'},
  {id:'escolta',name:'Toño',x:11.3,z:4.0,hd:-Math.PI/2,extra:'Mi jefa me está esperando— (My mom is waiting for me—)'}];
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
function genTunnel(){
  disposeTree(floorN); floorN.kids.length=0; BOXES.length=0; boxGridDirty=true;
  FLOOR.n=1; FLOOR.test=true; FLOOR.mode='tunnel'; FLOOR.doors=[]; FLOOR.windows=[]; FLOOR.power=true; FLOOR.flick=null; setLang(true);
  const G=floorN, B={g:G}, TH=TUN.TH, D=TUN.D; GEO_TEMP=true;
  const top=M(null,{color:0x1e150e}), earthM=(l)=>MT(tEarth,{repeat:[Math.max(.5,l/1.2),1]});
  /* walls: dug earth in ~1.1 m chunks, a little uneven; each chunk is solid */
  for(const [ax,c,s0,s1,out] of TUN_WALLS){ const len=s1-s0,n=Math.max(1,Math.ceil(len/1.1)),r=rng(Math.round((c+20)*31+s0*7));
    for(let i=0;i<n;i++){ const a=s0+len*i/n,b=s0+len*(i+1)/n,m=(a+b)/2,l=b-a,j=(r()-.5)*.06,th=D+(r()-.5)*.15,cc=c+out*(th/2)+j,h=TH+.3;
      const g=box(l+.02,h,th),mats=F(top,earthM(l),earthM(l),top,top);
      if(ax==='x'){ mk(g,mats,G,m,h/2,cc); addBox(a,b,cc-th/2,cc+th/2,0,h,'wall'); }
      else { mk(g,mats,G,cc,h/2,m,0,Math.PI/2,0); addBox(cc-th/2,cc+th/2,a,b,0,h,'wall'); } } }
  /* floor and ceiling over every open rectangle */
  for(const [x0,z0,x1,z1] of TUN_RECTS){ floor(B,x0,z0,x1,z1,tMud,{tile:1.2}); const w=x1-x0,d=z1-z0;
    mk(box(w,.3,d),F(MT(tEarth,{repeat:[w/1.2,1]}),MT(tEarth,{repeat:[w/1.2,1]}),MT(tEarth,{repeat:[w/1.2,1]}),top,MT(tEarth,{repeat:[w/1.2,d/1.2]})),G,(x0+x1)/2,TH+.15,(z0+z1)/2);
    addBox(x0,x1,z0,z1,TH,TH+.3,'ceil'); }
  /* timber frames: posts at both sides, a header across, every 1.5 m */
  const frame=(x,z,along,w)=>{ for(const s of [-1,1]){ const px=along==='x'?x:x+s*(w/2-.07),pz=along==='x'?z+s*(w/2-.07):z; mk(box(.12,TH-.02,.12,{at:[0,(TH-.02)/2,0]}),MT(tBeam),G,px,0,pz); addBox(px-.06,px+.06,pz-.06,pz+.06,0,TH,'wall'); }
    mk(box(along==='x'?.14:w+.06,.14,along==='x'?w+.06:.14),MT(tBeam),G,x,TH-.08,z); };
  for(let x=-9.4;x<5.8;x+=1.5) if((x<-6.6||x>-3.0)&&!(x>.3&&x<2.1)) frame(x,-3,'x',1.3); /* no frame across the pump room or the old bore's mouth */
  for(let z=-1.4;z<3.2;z+=1.5) frame(6.45,z,'z',1.7);
  for(let x=8.1;x<10.2;x+=1.5) frame(x,4,'x',1.3);
  /* rails, a cart, the vent duct, the bulb cable, puddles */
  place(B,'rails',-1.6,-3,Math.PI/2,16.4); place(B,'rails',6.9,.9,0,6.6); place(B,'rails',8.8,4,Math.PI/2,3.2);
  place(B,'cart',6.9,2.0); addBox(6.53,7.27,1.42,2.58,0,.92,'furn'); /* pushed to the right: room to squeeze past on the left */
  { const d1=N(G,-1.6,1.84,-2.47,0,Math.PI/2,0); d1.s=[.75,.75,1]; FX.duct(d1,16.6); const d2=N(G,5.78,1.84,1.1,0,0,0); d2.s=[.75,.75,1]; FX.duct(d2,6.8); }
  mk(box(17.4,.02,.02),mBlackPipe,G,-1.6,1.93,-3.45); mk(box(.02,.02,6.8),mBlackPipe,G,7.1,1.93,1.1); mk(box(4.4,.02,.02),mBlackPipe,G,9.0,1.93,3.55);
  for(const [x,z,w,d] of [[-8.4,-3.1,1.1,.7],[2.8,-2.9,1.4,.8],[6.6,-.8,.8,1.2]]) mk(plane(w,d),MT(tWater,{color:0x4a5a5a}),G,x,.012,z,-Math.PI/2);
  /* start dugout: the ladder up into the stash house, light falling down the shaft */
  { const l=N(G,-12.7,0,-3,0,-Math.PI/2,0); FX.ladder(l,TH+.3); mk(plane(.9,.9),M(null,{color:0x8a7454,unlit:true,double:true}),G,-12.5,TH-.01,-3,Math.PI/2); }
  place(B,'sandbags',-12.3,-4.2,0,6); place(B,'gascyl',-10.6,-4.25);
  /* the pump room: generator (shoot it: lights out), a table, a mattress, the product */
  const gen=place(B,'generator',-5.95,-1.25,Math.PI/2); heatTag(gen,.75); const gb=addBox(-6.25,-5.65,-1.75,-.75,0,1.0,'generator'); gb.onHit=()=>tunnelPower(false);
  place(B,'table',-4.0,-.15,0,1.0,.6,0xd8d4cc); addBox(-4.5,-3.5,-.45,.15,0,.77,'furn'); mk(box(.3,.2,.2),M(null,{color:0x2a2a2e}),G,-4.1,.88,-.15);
  place(B,'bricksPile',-5.3,.25,0,12,13); addBox(-5.9,-4.7,-.05,.6,0,.4,'furn'); place(B,'gascyl',-3.55,-2.0);
  /* the old bore: no rails, older thinner timbers, a slumped wall, a cooler someone left, one dead bulb */
  for(const z of [-1.1,.7,2.6]) frame(1.2,z,'z',1.2);
  for(const x of [2.9,4.5]) frame(x,4,'x',1.3);
  { const n=N(G,1.58,0,1.75,0,.12,0); mk(box(.5,.5,.95,{at:[0,.25,0]}),MT(tEarth),n,0,0,0,0,0,-.35); addBox(1.36,1.8,1.25,2.25,0,.45,'furn'); } /* the wall slumped in */
  mk(box(.14,.14,1.3),MT(tBeam),G,1.05,.07,2.5,0,.25,0); /* its header, fallen */
  { const n=N(G,.82,0,-.1,0,Math.PI/2,0); mk(box(.55,.36,.36,{at:[0,.18,0]}),M(null,{color:0xe8e4dc}),n); mk(box(.57,.06,.38),M(null,{color:0x2a6ab0}),n,0,.39,0); } addBox(.62,1.0,-.38,.18,0,.4,'furn');
  mk(plane(.9,1.6),MT(tWater,{color:0x3a4848}),G,1.2,.012,-1.5,-Math.PI/2); mk(plane(1.6,.9),MT(tWater,{color:0x3a4848}),G,3.6,.012,4.0,-Math.PI/2);
  { const n=N(G,1.2,1.86,.9); FX.bulb(n,false); } mk(box(.02,.02,4.2),mBlackPipe,G,1.45,1.93,.6);
  /* the exit: sandbags, a ladder up to the other side, the spray paint */
  place(B,'sandbags',11.0,3.15,0,6); addBox(10.4,11.6,2.85,3.45,0,.36,'furn');
  { const l=N(G,12.3,0,4,0,Math.PI/2,0); FX.ladder(l,TH+.3); mk(plane(.8,.8),M(null,{color:0x0a0c10}),G,12.2,TH-.01,4,Math.PI/2); }
  mk(plane(1.6,.4),MT(tSpray,{cut:true,double:true}),G,11.4,1.45,5.19,0,Math.PI,0);
  /* bulbs on the cable: four weak ones lit (each is a light), the rest dead, so long stretches are black */
  const lights=[]; const lit=[[-11.6,-3.0],[-4.8,-.9],[1.4,-3.0],[11.5,4.0]];
  lit.forEach(([x,z],i)=>{ const n=N(G,x,1.86,z); FX.bulb(n,true); if(i===0) FLOOR.flick={mat:n.kids[0].mesh.mats[0],i:0}; lights.push([[x,1.78,z],i===1?[1.0,.72,.4]:[.85,.55,.26],i===1?3.9:3.4]); });
  for(const [x,z] of [[-7.6,-3.0],[-2.6,-3.0],[6.45,.4],[8.9,4.0]]){ const n=N(G,x,1.86,z); FX.bulb(n,false); }
  GEO_TEMP=false;
  /* navigation: walkable cells are inside the open rectangles, away from walls and furniture */
  const nav=new Uint8Array(NX*NZ).fill(1),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i; const R_=TUN_RECTS.find(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]); if(!R_) continue; space[id]=R_[4];
    let bl=false; for(const b of BOXES){ let m;
      if(b.kind==='furn'||b.kind==='generator') m=.22; else if(b.kind==='wall'&&(b.x1-b.x0>.2||b.z1-b.z0>.2)) m=.2; else continue; /* thin timber posts are slid around, not routed around */
      if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m){ bl=true; break; } } nav[id]=bl?1:0; }
  const units=[{id:0,side:1,x0:-6.4,x1:-3.2,z0:-2.35,z1:.65,w:3.2,apt:'PUMP',door:-4.8,room:true,lit:true},{id:1,side:1,x0:10.4,x1:12.6,z0:2.8,z1:5.2,w:2.2,apt:'EXIT',door:10.4,room:true,lit:true}];
  Object.assign(FLOOR,{nav,space,units,party:[],bx:99,seats:[],beds:[],furn:[],stairUp:null,start:{x:-11.4,z:-3.0,yaw:-Math.PI/2},lights});
  tunnelLights(); boxGridDirty=true; navDirty=true; GAME.vision=GAME.vision||'off'; visionApply(); }
const TUN_LIGHT={amb:[.02,.017,.014],dir:[0,1,0],dirCol:[0,0,0],fog:[.003,.0025,.002],fogNear:1.5,fogFar:11};
function tunnelLights(){ setLights(Object.assign({},TUN_LIGHT,FLOOR.power?{pl:FLOOR.lights}:{amb:[.003,.003,.003],pl:[]})); }
function tunnelPower(on){ if(FLOOR.mode!=='tunnel'||FLOOR.power===on) return; FLOOR.power=on;
  if(!on){ FLOOR.flick=null; sfx('bump',1); sfx('slowout',.7); for(const E of enemies) if(!E.dead){ setTimeout(()=>{ if(!E.dead){ E.aware=true; if(E.st==='idle') E.st='alert'; if(E.barkCd<=0) bark(E,pick([es('¡Se fue la luz!','The lights went out!'),es('¿Qué pasó?','What happened?'),es('¡Prendan la planta!','Start the generator!')]),2.4); } },200+Math.random()*700); } }
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
function tagScene(){ for(const k of ['bright','dark','gib']) if(dynN[k]) dynN[k]._heat=.72; if(dynN.pool) dynN.pool._heat=.6; if(dynN.splat) dynN.splat._heat=.62;
  for(const h of Object.values(HANDS)){ (function w(n){ if(n.mesh) n._heat=.86; for(const k of n.kids) w(k); })(h.node); if(h.itemNode) heatTag(h.itemNode,.22); }
  for(const E of enemies) if(E.dead){ const k=1-Math.min(1,E.deadT/60)*.45; (function w(n){ if(n.mesh){ if(n._heatArr0||n._heatArr){ n._heatArr0=n._heatArr0||n._heatArr; n._heatArr=n._heatArr0.map(v=>+(v*k).toFixed(2)); } else if(n._heat!=null&&n._heat>.4){ n._heat0=n._heat0??n._heat; n._heat=+(n._heat0*k).toFixed(2); } } for(const c of n.kids) w(c); })(E.holder); } }
function visionTick(dt){ const m=visionMode();
  if(m!=='lit'){ GAME.visionT=(GAME.visionT||0)-dt; if(GAME.visionT<=0){ GAME.visionT=.5; tagScene(); markKeep(); applyMode(world,m); } }
  if(m==='thermal') for(const E of enemies){ const hm=E.J.headMesh.mesh,cur=hm.mats[0]; if(!cur||cur.unlit!==1){ hm._orig=[cur]; hm.mats[0]=thermalMat(E.J.headMesh,cur,0); hm.runs=null; } }
  /* the goggles' infrared torch: light 6, at your eyes, only while night vision is on */
  if(GAME.vision==='nv'){ const e=camBasis().eye; L.plPos.set(e,18); L.plCol.set([1.6,1.6,1.6],18); L.plDist[6]=15; } else if(FLOOR.mode==='tunnel'&&!(FLOOR.lights[6])){ L.plCol.set([0,0,0],18); } }
function visionProgram(){ return GAME.vision==='nv'?NVP2:GAME.vision==='thermal'?THP2:null; }
function tickTunnel(dt){ visionTick(dt); if(FLOOR.mode!=='tunnel'||!GAME.started||PL.dead||GAME.clear) return;
  if(PL.x>11.0&&Math.abs(PL.z-4)<1.15){ GAME.clear=true; showMsg('EL OTRO LADO','You made it to the other side. Reset to run it again: quiet, loud, or in the dark.'); if(XR.on) XR.clearT=6; } }
