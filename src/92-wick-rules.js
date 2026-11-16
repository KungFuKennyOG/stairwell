/* =====================================================================
   WICK stage 2: the rules (plan section 4, the rule parts of 2b and 2c). Agent R. Everything here acts only with WICK.on.
   - Health is 100 in four blocks of 25. Only the block you are in comes back, after 4 s without being hit: mortal, but no medkit hunt.
   - A pistol round costs 25 to 30 wherever it lands (Ray's hit test still decides where). Three or four hits.
   - Wounds are short and clean: a leg hit slows you for 10 s, an arm hit widens that hand's spread for 10 s. No bleeding out, no shakes,
     no heavy breathing, no tearing bandages: the block regen replaces all of it.
   - The kit: a suppressed 9 mm with 12, two spare magazines of 12, a knife on the belt (left hip holster once agent H's are in;
     the left hand on the flat screen).
   - A gun of a type you already carry (other hand or a holster) gives its rounds as a magazine when you grip it; grip the empty gun
     again and it comes into the hand.
   - Bullet time is a meter of 4 s (WICK_BT). Left stick click toggles it, it drains in real time and switches off when empty. Kills
     refill it: 25% a kill, 40% a headshot kill, nothing over time. Kills under 2 s apart (real time) make a chain (WICK_CHAIN), and each
     link adds 10% more, up to 40% more.
   - wickSlowBurst(sec): free slow motion that ignores the meter (the director's last-man moment).
   - The watch on the left wrist: FPS, the meter, the chain, four health pips. The flat screen: the same in the corner.
   Events: protoEmit('wickChain', n) on every kill from the second link on; protoEmit('wickMag', key, rounds) when a gun gives a magazine.
   ===================================================================== */
Object.assign(WICK.rules,{ block:25, regenT:4, regenV:15,            /* hp a block holds; seconds unhit before it refills; hp per second while it does */
  pistol:28, pistolLimb:25, pistolHead:30, dmgK:1,                       /* a 9 mm round on you: torso, arm/leg, head; everything times dmgK */
  woundT:10, legK:.7, armSpread:4,                                       /* wound effects: seconds, walking speed with a leg hit, spread times this with an arm hit */
  gun:12, mags:2, merge:1, dropLo:.5, dropHi:1 },                        /* the kit; a carried type gives a magazine (0 turns it off); a dead man's gun holds mag x 0.5-1 */
  Object.assign({},WICK.rules));                                         /* URL values (06-wick.js) win over these defaults */
Object.assign(WICK.bt,{ kill:.25, head:.4, link:.1, linkMax:.4, chainT:2, ts:.22, burst:1, start:1 },Object.assign({},WICK.bt)); /* refills as a share of max; chain window s; world speed; default burst s; start full */
/* what each weapon does to you, by where it lands. Pistol rows come from the scalars above so the URL can tune them */
WICK.dmg={ revolver:{head:40,torso:35,arm:30,leg:30}, smg:{head:22,torso:18,arm:15,leg:15},
  shotgun:{head:12,torso:8,arm:6,leg:6},                                 /* per pellet, times the range falloff in 80-ray.js: a close blast takes two to three blocks */
  machete:{head:40,torso:35,arm:25,leg:25}, knife:{head:35,torso:30,arm:20,leg:20}, bottle:{head:25,torso:20,arm:15,leg:15}, fist:{head:12,torso:10,arm:6,leg:6} };

var WICK_BT={t:4,max:4}, WICK_CHAIN={n:0,t:-9,rt:-9,best:0}, WICK_KIT={R:null,knife:null,slot:'hipL'};
const WR={want:false,burst:0,unhit:99,legT:0,armT:{L:0,R:0},clk:0,fresh:false,face:null,faceKey:'',hud:null,hudKey:'',flash:0};

/* Ray's tables (80-ray.js) take Wick's numbers: same code, different rules */
function wkRayTables(){ const R=WICK.rules,k=R.dmgK,T={pistol:{head:R.pistolHead,torso:R.pistol,arm:R.pistolLimb,leg:R.pistolLimb}};
  for(const w in WICK.dmg) T[w]=WICK.dmg[w]; const D={}; for(const w in T){ D[w]={}; for(const p in T[w]) D[w][p]=Math.round(T[w][p]*k); }
  Object.assign(PROTO.ray,{ hp:R.hp, gun:R.gun, dmg:D, open:{gun:{torso:0,arm:0,leg:0},blade:{torso:0,arm:0,leg:0}}, bleed:0,
    tremorHp:0, breathHp:0, slowK:1, slowT:0 }); } /* no shakes, no breathing you can be heard by, no bleeding; the hit knock stays */
if(WICK.on) wkRayTables();

/* ---------- the meter and slow motion ---------- */
function wkSlowApply(){ const on=!PL.dead&&(WR.burst>0||WR.want&&WICK_BT.t>0); if(on===GAME.slow) return; GAME.slow=on; sfx(on?'slowin':'slowout');
  for(const id of ['bSlow','bSlowT']){ const b=$(id); if(b) b.setAttribute('aria-pressed',String(on)); } }
/* toggleSlow (50-game.js) comes here with Wick on: the left stick click, T, the slow-mo buttons */
function wickBTToggle(){ if(!GAME.started||PL.dead) return;
  if(!WR.want&&WICK_BT.t<=.05){ sfx('click',.5); if(XR.on) buzz('left',.3,30); return; } /* empty: a dry tick, nothing else */
  WR.want=!WR.want; wkSlowApply(); }
function wickSlowBurst(sec){ if(!WICK.on||PL.dead) return; WR.burst=Math.max(WR.burst,sec??wnum('bt','burst',1)); wkSlowApply(); }
function wickBTAdd(share){ WICK_BT.t=Math.min(WICK_BT.max,WICK_BT.t+share*WICK_BT.max); WR.flash=.35; }

/* a kill: refill, and the chain */
protoOn('death',E=>{ if(!WICK.on||!E||E.ally||E.civ||PL.dead) return; const C=WICK_CHAIN,B=WICK.bt;
  C.n=C.n>0&&WR.clk-C.rt<=B.chainT?C.n+1:1; C.rt=WR.clk; C.t=GAME.t; C.best=Math.max(C.best,C.n);
  const head=!!(E.headshot||E.cut&&E.cut.head); wickBTAdd((head?B.head:B.kill)+Math.min(B.linkMax,B.link*(C.n-1)));
  if(XR.on){ buzz('left',head?.7:.5,head?70:45); if(C.n>=3) buzz('right',1,140); }
  if(C.n>=2) protoEmit('wickChain',C.n); protoEmit('stat','wickKill',head?'head':'body'); });

/* a hit on you: the regen waits, a leg or an arm hit starts its timer */
protoOn('hurt',(d,src)=>{ if(!WICK.on||PL.dead||src.kind==='bleed') return; WR.unhit=0; const T=WICK.rules.woundT;
  for(const h of src.hits||(src.part?[{part:src.part,side:src.side}]:[])){ if(h.part==='leg') WR.legT=T; else if(h.part==='arm') WR.armT[h.side==='L'?'L':'R']=T; } });
/* fireHand (60-weapons.js) multiplies its spread by this */
function wickSpreadK(h){ return WICK.on&&h&&WR.armT[h.side]>0?WICK.rules.armSpread:1; }

/* ---------- ammo ---------- */
function wickDropRounds(key){ const w=WPN[key],R=WICK.rules; return Math.max(1,Math.min(w.mag,Math.round(w.mag*rnd(R.dropLo,R.dropHi)))); }
/* do you already carry a gun of this kind: the other hand, or a holster (agent H's wickHolsters) */
function wkCarries(key,h){ for(const o of [HANDS.L,HANDS.R]) if(o!==h&&o.item&&o.item.key===key) return true;
  if(typeof wickHolsters!=='undefined'&&Array.isArray(wickHolsters)) for(const s of wickHolsters) if(s&&s.item&&s.item.key===key) return true; return false; }
/* grabOrDrop (60-weapons.js) asks first: a gun lying there of a type you carry gives its rounds; the empty gun stays where it was */
function wickTakeMag(h,P){ if(!WICK.on||!WICK.rules.merge) return false; const it=P&&P.item,w=it&&WPN[it.key]; if(!w||!w.gun||it.ammo<=0||!wkCarries(it.key,h)) return false;
  const n=it.ammo; if(w.loadOne) PL.pouch.loose[RAY_CAL[it.key]||'9mm']+=n; else PL.pouch.mags.push({gun:it.key,rounds:n,cap:w.mag}); /* a tube or a cylinder: loose rounds */
  it.ammo=0; if(w.pump) it.chambered=false; raySnd('rattle',.9); sfx('click',.5); if(XR.on) buzz(h.hand,.6,50);
  protoEmit('wickMag',it.key,n); protoEmit('stat','wickMag',n); return true; }

/* ---------- the kit ---------- */
function wkArtView(){ return typeof WKART!=='undefined'&&WKART.on; } /* the approved art shots keep their hands as they were */
function wickKit(){ const R=WICK.rules,g=newItem('pistol',Math.min(WPN.pistol.mag,R.gun),true); g.rayN=true; /* rayN: 80-ray.js leaves its count alone */
  PL.pouch.mags=Array.from({length:R.mags|0},()=>({gun:'pistol',rounds:WPN.pistol.mag,cap:WPN.pistol.mag})); PL.pouch.loose={'9mm':0,'12g':0,'38':0};
  if(wkArtView()) return; const k=newItem('knife'); WICK_KIT.R=g; WICK_KIT.knife=k; equip(HANDS.R,g); equip(HANDS.L,XR.on?null:k); }
/* the knife on the belt, once the holsters exist (agent H): wickHolsterPut(slot, item) if H gives one, else straight into the slot */
function wkBelt(){ const k=WICK_KIT.knife; if(!k||!XR.on||HANDS.L.item===k||HANDS.R.item===k) return;
  if(typeof wickHolsterPut==='function'){ wickHolsterPut(WICK_KIT.slot,k); return; }
  if(typeof wickHolsters!=='undefined'&&Array.isArray(wickHolsters)){ const s=wickHolsters.find(s=>s.slot===WICK_KIT.slot)||wickHolsters.find(s=>!s.item&&s.slot!=='back'); if(s&&!s.item) s.item=k; } }

protoOn('reset',()=>{ if(!WICK.on) return; wkRayTables(); wickKit();
  WICK_BT.max=WICK.bt.max; WICK_BT.t=WICK.bt.max*clamp(WICK.bt.start,0,1); Object.assign(WICK_CHAIN,{n:0,t:-9,rt:-9,best:0});
  Object.assign(WR,{want:false,burst:0,unhit:99,legT:0,flash:0,fresh:true}); WR.armT.L=WR.armT.R=0; GAME.slow=false; });

/* ---------- every frame ---------- */
protoOn('tick',(gdt,dt)=>{ if(!WICK.on) return;
  if(WR.fresh){ WR.fresh=false; wkBelt(); } /* after every other system's reset */
  if(GAME.started){ WR.clk+=dt;
    if(PL.dead){ WR.want=false; WR.burst=0; }
    else { /* the meter: real seconds, and nothing while a free burst runs */
      if(WR.burst>0) WR.burst=Math.max(0,WR.burst-dt); else if(WR.want&&GAME.slow){ WICK_BT.t=Math.max(0,WICK_BT.t-dt); if(WICK_BT.t<=0) WR.want=false; }
      /* the block you're in comes back; game time, so bullet time doesn't heal you faster */
      WR.unhit+=gdt; const B=WICK.rules.block,top=Math.min(WICK.rules.hp,Math.ceil(PL.hp/B-1e-6)*B);
      if(WR.unhit>=WICK.rules.regenT&&PL.hp<top) PL.hp=Math.min(top,PL.hp+WICK.rules.regenV*gdt);
      WR.legT=Math.max(0,WR.legT-gdt); WR.armT.L=Math.max(0,WR.armT.L-gdt); WR.armT.R=Math.max(0,WR.armT.R-gdt); }
    if(WICK_CHAIN.n>0&&WR.clk-WICK_CHAIN.rt>WICK.bt.chainT) WICK_CHAIN.n=0;
    wkSlowApply(); }
  /* Ray's wound effects come from the timers, not wounds (raySpeedK reads RAY.legK; PL.limp feeds the men's callouts) */
  RAY.legK=WR.legT>0?WICK.rules.legK:1; PL.limp=WR.legT>0?1:0; PL.armWeak.L=PL.armWeak.R=0; RAY.sway.L=RAY.sway.R=0;
  WR.flash=Math.max(0,WR.flash-dt); wkFace(); wkHud(); });

/* ---------- the watch face, on the left wrist (VR) ----------
   24 x 24 pixels over 4.2 cm, on the steel case from 91d-wick-art.js: the FPS (green/amber/red as before), the meter (steel blue, white
   when it refills, amber while you're in it), the chain (x2, x3... in gold while it's alive), four pips for the health blocks. */
const WK_FACE={W:24,H:24};
function wkFace(){ if(!WR.face){ const t=tex(WK_FACE.W,WK_FACE.H,'#0a0b0d'),n=mk(plane(.042,.042),M(t,{unlit:true}),HANDS.L.armN,.0445,0,-.07,0,Math.PI/2,0); WR.face={t,n}; }
  const F=WR.face; F.n.vis=XR.on; const fps=XR.fps||0,m=Math.round(WICK_BT.t/WICK_BT.max*20),ch=WICK_CHAIN.n,B=WICK.rules.block,hp=Math.max(0,PL.hp);
  const key=fps+'|'+m+'|'+ch+'|'+GAME.slow+'|'+(WR.flash>0)+'|'+Math.round(hp); if(key===WR.faceKey) return; WR.faceKey=key;
  const g=F.t.c.getContext('2d'); g.fillStyle='#0a0b0d'; g.fillRect(0,0,24,24);
  const s=String(fps); text(g,s,(24-textW(s))>>1,1,fps>=68?'#7ec27a':fps>=55?'#e2a33d':'#ff3b30');
  g.fillStyle='#1c2229'; g.fillRect(2,8,20,4); g.fillStyle=WR.flash>0?'#eef4f8':GAME.slow?'#e2a33d':'#7fa6c4'; g.fillRect(2,8,m,4);
  if(ch>=2){ const c='X'+ch; text(g,c,(24-textW(c))>>1,13,'#e8c25a'); }
  const nb=Math.round(WICK.rules.hp/B); for(let i=0;i<nb&&i<5;i++){ const f=clamp((hp-i*B)/B,0,1),x=2+i*(20/nb|0); g.fillStyle='#2a2522'; g.fillRect(x,20,(20/nb|0)-1,2); if(f>0){ g.fillStyle=f>=1?'#c4bfb3':'#8a5a48'; g.fillRect(x,20,Math.max(1,Math.round(((20/nb|0)-1)*f)),2); } }
  if(F.t.glt){ gl.bindTexture(gl.TEXTURE_2D,F.t.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,F.t.c); } }

/* ---------- the flat screen: blocks, the meter and the chain over the ammo count ---------- */
function wkHud(){ if(XR.on) return; if(!WR.hud){ const br=$('br'); if(!br) return; const d=document.createElement('div'); d.id='wkHud';
    d.style.cssText='display:grid;gap:4px;justify-items:end;font-size:11px;letter-spacing:.14em';
    d.innerHTML='<span id="wkChain" style="color:#e8c25a;min-height:1em"></span><div style="display:flex;gap:6px;align-items:center"><span id="wkBtL">BT</span><div style="width:110px;height:5px;background:rgba(0,0,0,.6);border:1px solid var(--line)"><div id="wkBt" style="height:100%;width:100%;background:#7fa6c4"></div></div></div><div id="wkBlocks" style="display:flex;gap:3px"></div>';
    br.insertBefore(d,br.firstChild); const hb=br.querySelector('.hpbar'); if(hb) hb.style.display='none'; WR.hud={d,chain:$('wkChain'),bt:$('wkBt'),btL:$('wkBtL'),blocks:$('wkBlocks'),n:-1}; }
  const H=WR.hud,B=WICK.rules.block,nb=Math.round(WICK.rules.hp/B),ch=WICK_CHAIN.n,key=Math.round(PL.hp)+'|'+Math.round(WICK_BT.t*20)+'|'+ch+'|'+GAME.slow+'|'+(WR.flash>0);
  if(key===WR.hudKey) return; WR.hudKey=key;
  if(H.n!==nb){ H.n=nb; H.blocks.innerHTML=''; for(let i=0;i<nb;i++){ const c=document.createElement('div'); c.style.cssText='width:34px;height:6px;background:rgba(0,0,0,.6);border:1px solid var(--line)'; c.innerHTML='<div style="height:100%;background:var(--ink)"></div>'; H.blocks.append(c); } }
  [...H.blocks.children].forEach((c,i)=>{ const f=clamp((PL.hp-i*B)/B,0,1); c.firstChild.style.width=(f*100).toFixed(0)+'%'; c.firstChild.style.opacity=f>=1?'1':'.55'; });
  H.bt.style.width=(WICK_BT.t/WICK_BT.max*100).toFixed(1)+'%'; H.bt.style.background=WR.flash>0?'#eef4f8':GAME.slow?'#e2a33d':'#7fa6c4';
  H.btL.style.color=GAME.slow?'#e2a33d':''; H.chain.textContent=ch>=2?'CHAIN X'+ch:''; }

/* a beat restart (94-wick-director.js) isn't a level reset: the meter comes back full and the chain starts again */
protoOn('wickRestart',()=>{ if(!WICK.on) return; WICK_BT.t=WICK_BT.max; Object.assign(WICK_CHAIN,{n:0,t:-9,rt:-9}); if(GAME.slow&&typeof wickBTToggle==='function') GAME.slow=false; });
