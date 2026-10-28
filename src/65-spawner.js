/* =====================================================================
   TEST FLOOR TOOLS: the spawn board on the landing wall (poke a button with either hand in VR) and the
   same controls as a side panel on a flat screen. Spawn any of the six kinds, near you or in the rooms,
   already hunting you or not; clear them, roll a new floor, reset.
   ===================================================================== */
const KINDS=[
  {key:'corner',label:'Corner boy',maker:makeCorner},{key:'cutter',label:'Cutter',maker:makeCutter},{key:'gunman',label:'Gunman',maker:makeGunman},
  {key:'doorman',label:'Doorman',maker:makeDoorman},{key:'enforcer',label:'Enforcer',maker:makeEnforcer},{key:'landlord',label:'Landlord',maker:makeLandlord}];
const SPAWNOPT={near:true,aware:false};
let nameI=0;
const PERSONAL=['I got a daughter—','I owe him money, that\'s all—','I just moved in, man!','My mom lives on six—','I was gonna leave, I swear—','I don\'t even know you—','I got a kid on the way—','I\'m nineteen, man—'];
function spawnKind(ki){
  const K=KINDS[ki]; let spot=null;
  if(SPAWNOPT.near){ /* in the corridor a few metres ahead of the landing, or near wherever you are */
    for(let t=0;t<30&&!spot;t++){ const x=clamp(PL.x+rnd(3.5,6.5),-9.5,9.5),z=rnd(-.6,.6),c=navCell(x,z); if(c>=0&&!FLOOR.nav[c]&&!enemies.some(E=>Math.hypot(E.pos[0]-x,E.pos[1]-z)<.9)&&Math.abs(x-FLOOR.bx)>1.2) spot={x,z}; }
    if(!spot) spot=freeSpot((x,z,sp)=>sp===-1,3); }
  if(!spot) spot=freeSpot((x,z,sp)=>sp>=0,4); if(!spot) return null;
  const name=K.key==='landlord'?'The Landlord':NAMES[(nameI++)%NAMES.length],det=DETAILS[(nameI*7)%DETAILS.length];
  const E=spawnEnemy({maker:K.maker,name,x:spot.x,z:spot.z,hd:SPAWNOPT.near?Math.atan2(PL.x-spot.x,PL.z-spot.z):rnd(0,6.28),extra:K.key==='landlord'?'You know who owns this building?':pick(PERSONAL)});
  E.detail=det; enemies.push(E); attachLabels();
  if(SPAWNOPT.aware){ E.aware=true; E.st='alert'; }
  GAME.clear=false; return E; }
function clearEnemies(){ for(const E of enemies){ disposeTree(E.holder); const i=world.kids.indexOf(E.holder); if(i>=0) world.kids.splice(i,1); E.barkEl.remove(); if(E.label){ const k=world.kids.indexOf(E.label); if(k>=0) world.kids.splice(k,1); } }
  enemies=[]; chars.length=0; GAME.clear=false; }
function newFloor(){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); genFloor(FLOOR.n,(Math.random()*1e9)|0,true); buildRack(); buildBoard(); resetGame(); if(XR.on) vrRecenter(); }

/* ---------- the board (VR) ---------- */
const BOARD=[]; let boardN=null; const boardTex={c:(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=256; return c; })(),glt:null,f:-1,text:''};
const BTN=[
  ...KINDS.map((K,i)=>({label:K.label.toUpperCase(),col:i%3,row:i<3?0:1,act:()=>spawnKind(i)})),
  {label:()=>'NEAR ME: '+(SPAWNOPT.near?'ON':'OFF'),col:0,row:2,act:()=>{ SPAWNOPT.near=!SPAWNOPT.near; }},
  {label:()=>'HUNTING: '+(SPAWNOPT.aware?'ON':'OFF'),col:1,row:2,act:()=>{ SPAWNOPT.aware=!SPAWNOPT.aware; }},
  {label:'CLEAR',col:2,row:2,act:clearEnemies},
  {label:'NEW FLOOR',col:0,row:3,act:()=>setTimeout(newFloor,0)},
  {label:'RESET',col:1,row:3,act:()=>{ resetGame(); if(XR.on) vrRecenter(); }},
  {label:'SLOW-MO',col:2,row:3,act:()=>toggleSlow()}];
const BW=.72,BH=.2,BX0=-12.62,BY0=1.62,BZ=-1.93; /* buttons on the south wall of the landing, facing north */
function drawBoard(){ const g=boardTex.c.getContext('2d'),key=BTN.map(b=>typeof b.label==='function'?b.label():b.label).join('|')+BTN.map(b=>b.lit>0?1:0).join(''); if(boardTex.text===key) return; boardTex.text=key;
  g.fillStyle='#141414'; g.fillRect(0,0,512,256); g.fillStyle='#e2a33d'; g.fillRect(0,0,512,3);
  g.textAlign='center'; g.textBaseline='middle';
  for(const b of BTN){ const x=8+b.col*168,y=10+b.row*61; g.fillStyle=b.lit>0?'#e2a33d':b.row<2?'#3a1414':'#23262a'; g.fillRect(x,y,160,53); g.fillStyle=b.lit>0?'#0a0a0a':'#f2ede2'; g.font='800 22px "Big Shoulders Display","Arial Narrow",sans-serif';
    g.fillText(typeof b.label==='function'?b.label():b.label,x+80,y+27,150); }
  if(boardTex.glt){ gl.bindTexture(gl.TEXTURE_2D,boardTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,boardTex.c); } }
function buildBoard(){ if(boardN){ disposeTree(boardN); const i=world.kids.indexOf(boardN); if(i>=0) world.kids.splice(i,1); } boardN=null; if(!FLOOR.test) return;
  boardN=N(world); boardTex.text=''; drawBoard();
  mk(box(2.3,1.02,.03),M(null,{color:0x0c0c0c}),boardN,-11.5,BY0-1.5*BH-.05,BZ-.01);
  mk(plane(2.2,1.1),M(boardTex,{unlit:true}),boardN,-11.5,BY0-1.5*BH-.04,BZ+.012);
  for(const b of BTN){ b.x=-11.5-1.1+(b.col+.5)*(2.2/3); b.y=BY0+.24-(b.row+.5)*(1.1/4)-.03; b.lit=0; } }
function pokeBoard(p,h,dt){ if(!boardN) return;
  for(const b of BTN){ b.lit=Math.max(0,b.lit-dt); const inside=Math.abs(p[0]-b.x)<BW/2-.03&&Math.abs(p[1]-b.y)<BH/2+.02&&p[2]<BZ+.09&&p[2]>BZ-.05;
    const k=h.side+b.label; if(inside&&!pokeBoard.held[k]){ pokeBoard.held[k]=true; b.lit=.3; b.act(); sfx('click',.8); buzz(h.hand,.6,30); } else if(!inside) pokeBoard.held[k]=false; }
  drawBoard(); }
pokeBoard.held={};

/* ---------- the same controls on a flat screen ---------- */
(function buildPanel(){ const P=document.createElement('section'); P.id='testPanel'; P.setAttribute('aria-label','Test floor');
  P.innerHTML=`<h2>Test floor</h2><div class="tp-grid">${KINDS.map((K,i)=>`<button class="btn" data-spawn="${i}">${K.label}</button>`).join('')}</div>
  <div class="tp-row"><label><input type="checkbox" id="tpNear" checked> Near me</label><label><input type="checkbox" id="tpAware"> Hunting</label></div>
  <div class="tp-grid"><button class="btn" id="tpClear">Clear</button><button class="btn" id="tpFloor">New floor</button></div>
  <p class="tp-keys">1-9 weapon · click use · F knife · E kick · Q throw</p>`;
  document.body.append(P);
  P.addEventListener('pointerdown',e=>e.stopPropagation());
  P.querySelectorAll('[data-spawn]').forEach(b=>b.addEventListener('click',()=>{ spawnKind(+b.dataset.spawn); }));
  $('tpNear').addEventListener('change',e=>{ SPAWNOPT.near=e.target.checked; }); $('tpAware').addEventListener('change',e=>{ SPAWNOPT.aware=e.target.checked; });
  $('tpClear').addEventListener('click',clearEnemies); $('tpFloor').addEventListener('click',newFloor); })();
