/* =====================================================================
   WICK: two things from Max Payne 3 (Kenny's gameplay reference, 2026-11-16), made safe for VR.
   - LAST STAND. A hit that would kill you instead drops you to 1 hp and the world into deep slow motion for a few seconds. Kill the
     man who shot you in that time and you get up with a block of health. Run out of time and you die. One charge, which comes back
     each beat (and on a beat restart). While it runs nothing else can hurt you. No painkillers (Kenny): the charge is the price.
   - THE LAST BULLET. When the last man of a space dies (the director's 'wickClear'), the round that killed him is replayed in the air,
     slowly, from your muzzle to where it hit, with a bigger burst at the end. Your view never moves: it's the bullet that's shown.
   Numbers: WICK.ls, WICK.kc (?w.ls.<key>=n, ?w.kc.<key>=n).
   ===================================================================== */
WICK.ls=Object.assign({ on:1, time:3, hp:25, ts:.12 },WICK.ls||{});      /* seconds of real time to take him; health you get up with; world speed */
WICK.kc=Object.assign({ on:1, speed:6, size:.012 },WICK.kc||{});          /* the replayed bullet: metres per real second, its size */
(()=>{ const q=new URLSearchParams(location.search),SH={lstime:['ls','time'],ls:['ls','on'],kc:['kc','on']}; for(const [k,v] of q){ const m=/^w\.(ls|kc)\.(\w+)$/.exec(k),t=m?[m[1],m[2]]:SH[k]; if(t&&isFinite(+v)) WICK[t[0]][t[1]]=+v; } })(); /* 06-wick.js runs before these tables exist */
const WLS={ready:true,on:false,E:null,t:0,lastShot:null,bullet:null};

/* hurtPlayer asks this before a hit lands: true means the hit is taken care of */
function wickLastStand(d,src){ if(!WICK.on||!wnum('ls','on',1)) return false;
  if(WLS.on) return true; /* nothing lands while it runs */
  if(PL.hp-d>0||!WLS.ready) return false; const E=src&&src.E; if(!E||E.dead||E.ally||E.civ) return false;
  WLS.ready=false; WLS.on=true; WLS.E=E; WLS.t=wnum('ls','time',3); PL.hp=1; PL.hurtT=0;
  if(typeof wickSlowBurst==='function') wickSlowBurst(WLS.t+.3); sfx('slowin'); if(XR.on){ buzz('left',1,300); buzz('right',1,300); }
  if(typeof bark==='function') bark(E,pick(['He\'s down!','Finish him!','Got him!']),1.6);
  protoEmit('wickLastStand','start',E); return true; }
function wickLSEnd(won){ const E=WLS.E; WLS.on=false; WLS.E=null;
  if(won){ PL.hp=Math.max(PL.hp,wnum('ls','hp',25)); PL.hurtT=9; sfx('slowout'); if(XR.on){ buzz('left',.6,120); buzz('right',.6,120); } protoEmit('wickLastStand','won',E); }
  else { protoEmit('wickLastStand','lost',E); PL.hp=1; hurtPlayer(999,{kind:'laststand'}); } }

/* the last bullet: remember each shot; when a space is cleared, replay the one that did it */
protoOn('fire',(h,it,info)=>{ if(!WICK.on||!info) return; WLS.lastShot={o:(info.muzzle||info.o).slice(),d:info.d.slice(),t:GAME.t,rt:performance.now()}; });
let WKC_N=null;
function wkKcNode(){ if(WKC_N) return WKC_N; WKC_N=N(world); mk(box(1,1,4),M(null,{color:0xffe6a0,unlit:true}),WKC_N); const tr=N(WKC_N); mk(box(.35,.35,14,{at:[0,0,-7]}),M(null,{color:0xb8a070,unlit:true}),tr); WKC_N.vis=false; return WKC_N; }
protoOn('wickClear',()=>{ if(!WICK.on||!wnum('kc','on',1)) return; const S=WLS.lastShot; if(!S||performance.now()-S.rt>400) return; /* only if a shot of yours did it */
  const dead=enemies.filter(E=>E.dead&&E.deadT<.5); let tgt=null,bd=9; for(const E of dead){ const hp=X_(E.B,PI_.head),c=X_(E.B,PI_.chest);
    for(const p of [hp,c]){ const v=v3.sub(p,S.o),along=v3.dot(v,S.d),off=Math.hypot(...v3.sub(v,v3.sc(S.d,along))); if(along>0&&off<bd){ bd=off; tgt=p; } } }
  const end=tgt||v3.add(S.o,v3.sc(S.d,6)); WLS.bullet={a:S.o,b:end,u:0,L:Math.hypot(...v3.sub(end,S.o))}; });

protoOn('tick',(gdt,dt)=>{ if(!WICK.on) return;
  if(WLS.on){ WLS.t-=dt; if(WLS.E&&WLS.E.dead) wickLSEnd(true); else if(WLS.t<=0||PL.dead) wickLSEnd(false); }
  const B=WLS.bullet,n=WKC_N||(B?wkKcNode():null); if(!n) return;
  if(!B){ n.vis=false; return; }
  B.u+=dt*wnum('kc','speed',6)/Math.max(.3,B.L); const u=Math.min(1,B.u),p=v3.add(B.a,v3.sc(v3.sub(B.b,B.a),u)),d=norm3(v3.sub(B.b,B.a)),s=wnum('kc','size',.012);
  n.vis=true; n.p=p; n.s=[s,s,s]; n.r=[-Math.asin(clamp(d[1],-1,1)),Math.atan2(d[0],d[2]),0];
  if(u>=1){ WLS.bullet=null; n.vis=false; if(typeof spray==='function') spray(B.b,d,26,2.4,.6,'bright',.02); if(XR.on){ buzz('right',1,90); } } });
/* the charge comes back each beat, and with every restart */
for(const ev of ['wickBeat','wickRestart','reset']) protoOn(ev,()=>{ if(!WICK.on) return; WLS.ready=true; if(WLS.on){ WLS.on=false; WLS.E=null; } WLS.bullet=null; });
