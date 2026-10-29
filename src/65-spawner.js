/* =====================================================================
   TEST FLOOR TOOLS: the spawn board on the landing wall (poke a button with either hand in VR) and the
   same controls as a side panel on a flat screen. Spawn any of the six kinds, near you or in the rooms,
   already hunting you or not; clear them, roll a new floor, reset.
   ===================================================================== */
const KINDS=[
  {key:'corner',label:'Corner boy',maker:makeCorner},{key:'cutter',label:'Cutter',maker:makeCutter},{key:'gunman',label:'Gunman',maker:makeGunman},
  {key:'doorman',label:'Doorman',maker:makeDoorman},{key:'enforcer',label:'Enforcer',maker:makeEnforcer},{key:'landlord',label:'Landlord',maker:makeLandlord}];
const SPAWNOPT={where:'near',aware:false}; /* where: 'near', 'corridor', 'any' (a random room) or a unit id picked on the map */
let nameI=0;
const PERSONAL=['I got a daughter—','I owe him money, that\'s all—','I just moved in, man!','My mom lives on six—','I was gonna leave, I swear—','I don\'t even know you—','I got a kid on the way—','I\'m nineteen, man—'];
/* a room's window (or, if it has none, its outside wall): people waiting in a room stand looking out */
function windowHeading(x,z){ const c=navCell(x,z),id=c>=0?FLOOR.space[c]:-1,u=FLOOR.units.find(u=>u.id===id); if(!u) return rnd(0,6.28);
  const w=u.win||[(u.x0+u.x1)/2,u.side*6]; return Math.atan2(w[0]-x,w[1]-z); }
function spawnKind(ki){
  const K=KINDS[ki],W=SPAWNOPT.where,tun=FLOOR.mode==='tunnel'||FLOOR.mode==='stash'; let spot=null,hd=null;
  if(W==='near'){ /* in the corridor a few metres ahead of the landing, or near wherever you are */
    for(let t=0;t<30&&!spot;t++){ const x=clamp(PL.x+rnd(3.5,6.5),-9.5,9.5),z=rnd(-.6,.6),c=navCell(x,z); if(c>=0&&!FLOOR.nav[c]&&!enemies.some(E=>Math.hypot(E.pos[0]-x,E.pos[1]-z)<.9)&&Math.abs(x-FLOOR.bx)>1.2) spot={x,z}; }
    if(!spot) spot=freeSpot((x,z,sp)=>sp===-1,3); if(spot) hd=Math.atan2(PL.x-spot.x,PL.z-spot.z); }
  else if(W==='corridor'){ spot=freeSpot((x,z,sp)=>sp===-1,3)||freeSpot((x,z,sp)=>sp===-1,0); if(spot) hd=rnd(0,6.28); }
  else { const pred=W==='any'?(x,z,sp)=>sp>=0:(x,z,sp)=>sp===W; spot=freeSpot(pred,W==='any'?4:0); if(spot) hd=windowHeading(spot.x,spot.z); }
  if(!spot){ spot=freeSpot((x,z,sp)=>sp>=0,4); if(!spot) return null; hd=windowHeading(spot.x,spot.z); }
  const name=K.key==='landlord'?(tun?'Don Aurelio':'The Landlord'):tun?NAMES_ES[(nameI++)%NAMES_ES.length]:NAMES[(nameI++)%NAMES.length],det=DETAILS[(nameI*7)%DETAILS.length];
  const E=spawnEnemy({maker:tun?(h,g)=>cartelChar(CARTEL_OF[K.key],h,g):K.maker,name,x:spot.x,z:spot.z,hd,extra:K.key==='landlord'?(tun?es('¿Sabes quién soy?','Do you know who I am?'):'You know who owns this building?'):tun?pick(TUN_CAST).extra:pick(PERSONAL)});
  E.detail=det; enemies.push(E); attachLabels();
  if(SPAWNOPT.aware){ E.aware=true; E.tracks=true; E.mind='hunt'; E.lkp=[PL.x,PL.z]; E.st='alert'; } /* test tool: these always know where you are */
  GAME.clear=false; return E; }
function clearEnemies(){ meleeClear(); for(const G of GRABS.slice()) endGrab(G); for(const E of enemies){ disposeTree(E.holder); const i=world.kids.indexOf(E.holder); if(i>=0) world.kids.splice(i,1); E.barkEl.remove(); if(E.label){ const k=world.kids.indexOf(E.label); if(k>=0) world.kids.splice(k,1); } }
  enemies=[]; chars.length=0; GAME.clear=false; }
/* the first room: prototype 01's apartment, with Dani, Marco and Teo where they used to be */
function firstRoom(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genRoom(FLOOR.n); buildRack(); buildBoard(); SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }
function roomCast(){ for(const sp of SPAWNS){ const E=spawnEnemy(Object.assign({},sp,{x:sp.x+ROOM_DX})); E.detail=pick(DETAILS); enemies.push(E); } attachLabels(); }
function goTunnel(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genTunnel(); buildRack(); buildBoard(); SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }
function newFloor(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genFloor(FLOOR.n,(Math.random()*1e9)|0,true); buildRack(); buildBoard(); if(!FLOOR.units.some(u=>u.id===SPAWNOPT.where)&&typeof SPAWNOPT.where==='number') SPAWNOPT.where='any'; resetGame(); if(XR.on) vrRecenter(); }

/* ---------- the board (VR) ---------- */
const BOARD=[]; let boardN=null; const BOARD_H=441; const boardTex={c:(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=BOARD_H; return c; })(),glt:null,f:-1,text:''};
const BTN=[
  ...KINDS.map((K,i)=>({label:K.label.toUpperCase(),col:i%3,row:i<3?0:1,act:()=>spawnKind(i)})),
  {label:()=>'SPAWN: '+whereLabel(),col:0,row:2,act:()=>{ const o=['near','corridor','any']; SPAWNOPT.where=o[(o.indexOf(SPAWNOPT.where)+1)%3]; }},
  {label:()=>'HUNTING: '+(SPAWNOPT.aware?'ON':'OFF'),col:1,row:2,act:()=>{ SPAWNOPT.aware=!SPAWNOPT.aware; }},
  {label:'CLEAR',col:2,row:2,act:clearEnemies},
  {label:'NEW FLOOR',col:0,row:3,act:()=>setTimeout(newFloor,0)},
  {label:'RESET',col:1,row:3,act:()=>{ resetGame(); if(XR.on) vrRecenter(); }},
  {label:'SLOW-MO',col:2,row:3,act:()=>toggleSlow()},
  {label:()=>'LASERS: '+(XR.laser?'ON':'OFF'),col:0,row:4,act:()=>{ XR.laser=!XR.laser; }},
  {label:()=>'FLOOR '+String(FLOOR.n).padStart(2,'0')+' +1',col:2,row:4,act:()=>setTimeout(climb,0)},
  {label:()=>'BLADE TILT: '+MELEE_TILT_LBL[MEL.tilt],col:0,row:5,act:()=>{ MEL.tilt=(MEL.tilt+1)%MELEE_TILT.length; reequipMelee(); }},
  {label:()=>'HANDS: '+HAND_YAW_LBL[MEL.yaw],col:1,row:5,act:()=>{ MEL.yaw=(MEL.yaw+1)%HAND_YAW.length; }},
  {label:()=>FLOOR.mode==='room'?'BACK TO TOWER':'FIRST ROOM',col:2,row:5,act:()=>setTimeout(FLOOR.mode==='room'?newFloor:firstRoom,0)},
  {label:()=>FLOOR.mode==='stash'?'TUNNEL':FLOOR.mode==='tunnel'?'TOWER FLOOR':'STASH HOUSE',col:0,row:6,act:()=>setTimeout(FLOOR.mode==='stash'?goTunnel:FLOOR.mode==='tunnel'?newFloor:goStash,0)},
  {label:()=>'GOGGLES: '+({off:'UP',nv:'NIGHT',thermal:'THERMAL'}[GAME.vision||'off']),col:1,row:6,act:()=>cycleVision()},
  {label:()=>FLOOR.mode!=='tunnel'&&FLOOR.mode!=='stash'?'—':FLOOR.power===false?'POWER: OFF':'POWER: ON',col:2,row:6,act:()=>{ if(FLOOR.mode==='tunnel') tunnelPower(FLOOR.power===false); else if(FLOOR.mode==='stash') stashPower(FLOOR.power===false); }}];
function whereLabel(){ const W=SPAWNOPT.where; if(W==='near') return 'NEAR ME'; if(W==='corridor') return 'HALL'; if(W==='any') return 'ANY ROOM'; const u=FLOOR.units.find(u=>u.id===W); return u?'APT '+u.apt:'ANY ROOM'; }
const BW=.72,BH=.2,BX0=-12.62,BY0=1.62; let BZ=-1.93; /* buttons on the south wall of the landing, facing north */
function drawBoard(){ const g=boardTex.c.getContext('2d'),key=BTN.map(b=>typeof b.label==='function'?b.label():b.label).join('|')+BTN.map(b=>b.lit>0?1:0).join(''); if(boardTex.text===key) return; boardTex.text=key;
  g.fillStyle='#141414'; g.fillRect(0,0,512,BOARD_H); g.fillStyle='#e2a33d'; g.fillRect(0,0,512,3);
  g.textAlign='center'; g.textBaseline='middle';
  for(const b of BTN){ const x=8+b.col*168,y=10+b.row*61; g.fillStyle=b.lit>0?'#e2a33d':b.row<2?'#3a1414':'#23262a'; g.fillRect(x,y,160,53); g.fillStyle=b.lit>0?'#0a0a0a':'#f2ede2'; g.font='800 22px "Big Shoulders Display","Arial Narrow",sans-serif';
    g.fillText(typeof b.label==='function'?b.label():b.label,x+80,y+27,150); }
  if(boardTex.glt){ gl.bindTexture(gl.TEXTURE_2D,boardTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,boardTex.c); } }
function buildBoard(){ if(boardN){ disposeTree(boardN); const i=world.kids.indexOf(boardN); if(i>=0) world.kids.splice(i,1); } boardN=null; if(!FLOOR.test) return;
  BZ=FLOOR.mode==='tunnel'?-4.59:-1.93; boardN=N(world); boardTex.text=''; drawBoard();
  const H5=1.375*BOARD_H/320,cy=BY0-1.5*BH-.04-.1375-(H5-1.375)/2+.05;
  mk(box(2.3,H5+.08,.03),M(null,{color:0x0c0c0c}),boardN,-11.5,cy-.01,BZ-.01);
  mk(plane(2.2,H5),M(boardTex,{unlit:true}),boardN,-11.5,cy,BZ+.012);
  for(const b of BTN){ b.x=-11.5-1.1+(b.col+.5)*(2.2/3); b.y=cy+H5/2-(10+b.row*61+27)/BOARD_H*H5; b.lit=0; }
  /* the floor plan, on the west wall behind where you start: poke a room to spawn people there (not in the tunnel) */
  if(FLOOR.mode==='tunnel') return;
  mk(box(.03,MAP_M[1]+.08,MAP_M[0]+.08),M(null,{color:0x0c0c0c}),boardN,MAP_X-.02,MAP_Y,0);
  mk(plane(MAP_M[0],MAP_M[1]),M(mapTex,{unlit:true}),boardN,MAP_X,MAP_Y,0,0,Math.PI/2,0); mapTex.text=''; drawMap(mapTex.c.getContext('2d')); uploadMap(); }
function pokeBoard(p,h,dt){ if(!boardN) return; if(FLOOR.mode!=='tunnel') pokeMap(p,h);
  for(const b of BTN){ b.lit=Math.max(0,b.lit-dt); const inside=Math.abs(p[0]-b.x)<BW/2-.03&&Math.abs(p[1]-b.y)<BH/2+.02&&p[2]<BZ+.09&&p[2]>BZ-.05;
    const k=h.side+b.label; if(inside&&!pokeBoard.held[k]){ pokeBoard.held[k]=true; b.lit=.3; b.act(); sfx('click',.8); buzz(h.hand,.6,30); } else if(!inside) pokeBoard.held[k]=false; }
  drawBoard(); }
pokeBoard.held={};

/* ---------- the map ---------- */
const MAPW=512,MAPH=272,MAP_HDR=40; let MS=19.2,MX0=(MAPW-26*MS)/2,MY0=MAP_HDR+(MAPH-MAP_HDR-12*MS)/2;
/* the plan view is scaled to fit whatever size the level's world is (the tower and stash house keep their old scale) */
function mapFit(){ MS=RX===13&&RZ===6?19.2:Math.min((MAPW-16)/(2*RX),(MAPH-MAP_HDR-10)/(2*RZ)); MX0=(MAPW-2*RX*MS)/2; MY0=MAP_HDR+(MAPH-MAP_HDR-2*RZ*MS)/2; }
const MAP_M=[2.2,2.2*MAPH/MAPW],MAP_X=-12.915,MAP_Y=1.32;
const mapTex={c:(()=>{ const c=document.createElement('canvas'); c.width=MAPW; c.height=MAPH; return c; })(),glt:null,f:-1,text:''};
const MAP_BTN=[{w:'near',x:8,l:'NEAR ME'},{w:'corridor',x:176,l:'HALLWAY'},{w:'any',x:344,l:'ANY ROOM'}];
/* plan view: west (where you start) on the left, east (the stairs up) on the right, the south row (-z) on top */
const toMap=(x,z)=>[MX0+(x+RX)*MS,MY0+(z+RZ)*MS];
function drawMap(g){ mapFit(); const W=SPAWNOPT.where; g.fillStyle='#0d0d0e'; g.fillRect(0,0,MAPW,MAPH); g.fillStyle='#e2a33d'; g.fillRect(0,0,MAPW,3);
  g.textAlign='center'; g.textBaseline='middle';
  for(const b of MAP_BTN){ const on=W===b.w; g.fillStyle=on?'#e2a33d':'#23262a'; g.fillRect(b.x,7,160,28); g.fillStyle=on?'#0a0a0a':'#f2ede2'; g.font='800 18px "Big Shoulders Display","Arial Narrow",sans-serif'; g.fillText(b.l,b.x+80,22,150); }
  const R=(x0,z0,x1,z1,fill,stroke)=>{ const a=toMap(Math.min(x0,x1),Math.min(z0,z1)),b=toMap(Math.max(x0,x1),Math.max(z0,z1)); g.fillStyle=fill; g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); if(stroke){ g.strokeStyle=stroke; g.lineWidth=2; g.strokeRect(a[0]+1,a[1]+1,b[0]-a[0]-2,b[1]-a[1]-2); } };
  const tun=FLOOR.mode==='tunnel',sth=FLOOR.mode==='stash';
  if(tun){ for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const id=k*NX+i,sp=FLOOR.space[id]; if(sp===-9||sp>=0||FLOOR.nav[id]) continue; const x=cellX(i),z=cellZ(k); R(x-.27,z-.27,x+.27,z+.27,sp===-3||sp===-6||sp===-5?'#141619':W==='corridor'?'#7a5a20':'#1e2124'); } } /* the tunnel as dug, the old bore darker */
  else { R(-13,-2,-10,2,'#1b1a18'); if(!sth) R(10,-2,13,2,'#1b1a18'); }
  if(sth) R(-10.2,-5.6,-6.4,5.6,W==='corridor'?'#7a5a20':'#1e2124','#3a3d40'); /* the street */
  if(FLOOR.mode!=='room'&&!tun&&!sth) R(-10,-1,10,1,W==='corridor'?'#7a5a20':'#1e2124','#3a3d40');
  for(const u of FLOOR.units){ const on=W===u.id||W==='any'; R(u.x0,u.z0??u.side*1,u.x1,u.z1??u.side*6,W===u.id?'#e2a33d':on?'#4a3a1c':'#2a2620','#55504a');
    if(u.win){ const a=toMap(u.win[0],u.win[1]-.7),b=toMap(u.win[0],u.win[1]+.7); g.fillStyle='#6fa8d0'; g.fillRect(a[0]-2,a[1],4,b[1]-a[1]); }
    else if(u.w>=3.6){ const a=toMap((u.x0+u.x1)/2-.7,u.side*6),b=toMap((u.x0+u.x1)/2+.7,u.side*6); g.fillStyle='#6fa8d0'; g.fillRect(a[0],a[1]-2,b[0]-a[0],4); } /* window */
    if(!u.room){ const d=toMap(u.door,u.side); g.fillStyle='#0d0d0e'; g.fillRect(d[0]-9,d[1]-3,18,6); }
    const c=toMap((u.x0+u.x1)/2,tun||sth?(u.z0+u.z1)/2:u.side*3.5); g.fillStyle=W===u.id?'#0a0a0a':'#c4bfb3'; g.font='700 15px "IBM Plex Mono",monospace'; g.fillText(u.apt,c[0],c[1]); }
  if(FLOOR.bx<20){ const a=toMap(FLOOR.bx-.6,-.9),b=toMap(FLOOR.bx+.6,.9); g.fillStyle='#7a1a14'; g.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); }
  g.font='700 13px "IBM Plex Mono",monospace'; g.fillStyle='#8a857a'; if(!tun){ const a=toMap(-11.5,0),b=toMap(11.5,0); g.fillText('IN',a[0],a[1]); if(FLOOR.mode!=='room'&&!sth) g.fillText('UP',b[0],b[1]); }
  else { const a=toMap(-11.6,-3),b=toMap(3.6,4); g.fillText('IN',a[0],a[1]); }
  for(const E of enemies){ const q=toMap(E.B?E.B.x[0]:E.pos[0],E.B?E.B.x[2]:E.pos[1]); g.fillStyle=E.dead?'#5a5650':E.aware?'#ff3b30':E.mind==='search'||E.mind==='investigate'?'#f0a030':E.mind==='nervous'?'#e8d27a':'#e8e2cf'; g.beginPath(); g.arc(q[0],q[1],4,0,6.3); g.fill(); }
  { const q=toMap(PL.x,PL.z),f=camBasis().f,a=Math.atan2(f[2],f[0]); g.fillStyle='#7ec27a'; g.beginPath(); g.moveTo(q[0]+Math.cos(a)*9,q[1]+Math.sin(a)*9); g.lineTo(q[0]+Math.cos(a+2.5)*6,q[1]+Math.sin(a+2.5)*6); g.lineTo(q[0]+Math.cos(a-2.5)*6,q[1]+Math.sin(a-2.5)*6); g.fill(); } }
function uploadMap(){ if(mapTex.glt){ gl.bindTexture(gl.TEXTURE_2D,mapTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mapTex.c); } }
function mapPick(px,py){ if(py<MAP_HDR){ for(const b of MAP_BTN) if(px>=b.x&&px<=b.x+160) return b.w; return null; }
  const x=(px-MX0)/MS-RX,z=(py-MY0)/MS-RZ; if(FLOOR.mode==='stash'&&x>-10.2&&x<-6.4&&Math.abs(z)<5.6) return 'corridor'; if(FLOOR.mode!=='room'&&FLOOR.mode!=='stash'&&Math.abs(x)<10&&Math.abs(z)<1) return 'corridor';
  const u=FLOOR.units.find(u=>x>=u.x0&&x<u.x1&&(u.room?z>u.z0&&z<u.z1:Math.sign(z)===u.side&&Math.abs(z)>1&&Math.abs(z)<6)); return u?u.id:null; }
function pickWhere(w){ if(w==null) return false; SPAWNOPT.where=w; sfx('click',.8); drawMap(mapTex.c.getContext('2d')); uploadMap(); if(window.__mapCv) drawMap(window.__mapCv.getContext('2d')); return true; }
function pokeMap(p,h){ const inside=p[0]<MAP_X+.08&&p[0]>MAP_X-.05&&Math.abs(p[2])<MAP_M[0]/2&&Math.abs(p[1]-MAP_Y)<MAP_M[1]/2,k=h.side+'map';
  if(inside&&!pokeBoard.held[k]){ pokeBoard.held[k]=true; const u=.5-p[2]/MAP_M[0],v=.5-(p[1]-MAP_Y)/MAP_M[1]; if(pickWhere(mapPick(u*MAPW,v*MAPH))) buzz(h.hand,.6,30); }
  else if(!inside) pokeBoard.held[k]=false; }
/* live dots: a few times a second */
let mapT=0; function tickMap(dt){ if(!FLOOR.test) return; mapT-=dt; if(mapT>0) return; mapT=.25; if(boardN){ drawMap(mapTex.c.getContext('2d')); uploadMap(); } if(window.__mapCv&&!document.body.classList.contains('vr')) drawMap(window.__mapCv.getContext('2d')); }

/* ---------- the same controls on a flat screen ---------- */
(function buildPanel(){ const P=document.createElement('section'); P.id='testPanel'; P.setAttribute('aria-label','Test floor');
  P.innerHTML=`<h2>Test floor</h2><div class="tp-grid">${KINDS.map((K,i)=>`<button class="btn" data-spawn="${i}">${K.label}</button>`).join('')}</div>
  <canvas id="tpMap" width="${MAPW}" height="${MAPH}" style="width:100%;display:block;margin:6px 0;cursor:pointer;border:1px solid #333" aria-label="Floor map: click where to spawn"></canvas>
  <div class="tp-row"><label><input type="checkbox" id="tpAware"> Hunting</label></div>
  <div class="tp-grid"><button class="btn" id="tpClear">Clear</button><button class="btn" id="tpFloor">New floor</button><button class="btn" id="tpRoom">First room</button></div>
  <p class="tp-keys">1-9 weapon · click use · F knife · E kick · G grab · Q throw</p>`;
  document.body.append(P);
  P.addEventListener('pointerdown',e=>e.stopPropagation());
  P.querySelectorAll('[data-spawn]').forEach(b=>b.addEventListener('click',()=>{ spawnKind(+b.dataset.spawn); }));
  const cv2=$('tpMap'); window.__mapCv=cv2; cv2.addEventListener('click',e=>{ const r=cv2.getBoundingClientRect(); pickWhere(mapPick((e.clientX-r.left)/r.width*MAPW,(e.clientY-r.top)/r.height*MAPH)); });
  $('tpAware').addEventListener('change',e=>{ SPAWNOPT.aware=e.target.checked; });
  $('tpClear').addEventListener('click',clearEnemies); $('tpRoom').addEventListener('click',firstRoom); $('tpFloor').addEventListener('click',newFloor); })();
