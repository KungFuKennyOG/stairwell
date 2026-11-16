/* =====================================================================
   WICK stage 0: the stress spawn. Needs the game's functions, so it lives inside the engine's scope (06-wick.js can't see them).
   ===================================================================== */
/*
   ?wick=1&stress=N adds N gunmen to the floor, kept awake and drawn the whole time, so the left wrist's FPS shows what N live
   physical bodies cost on the Quest. &salert=1 makes them all aware of you and fighting (the worst case); &sgod=0 lets them kill you.
   They stand within near..far metres of the start, where there's floor. */
const WSTRESS={men:[]};
function wickStress(){ const n=wnum('stress','n',0)|0; WSTRESS.men.length=0; if(!n) return;
  const near=wnum('stress','near',4),far=wnum('stress','far',12);
  for(let i=0;i<n;i++){ const s=freeSpot((x,z)=>{ const d=Math.hypot(x-PL.x,z-PL.z); return d<far; },near)||freeSpot(()=>true,1.5); if(!s) break;
    const E=spawnEnemy({maker:makeGunman,name:'Stress '+(i+1),x:s.x,z:s.z,hd:Math.atan2(PL.x-s.x,PL.z-s.z),extra:''});
    E.stress=true; enemies.push(E); WSTRESS.men.push(E); }
  if(typeof attachLabels==='function') attachLabels(); /* every man needs his name tag node (the frame loop hides them all) */
  if(wnum('stress','alert',0)) for(const E of WSTRESS.men) setAware(E,'stress'); }
protoOn('reset',()=>{ if(WICK.on) wickStress(); }); /* every start and restart (resetGame clears and recasts the floor first) */
protoOn('tick',()=>{ if(!WICK.on||!WSTRESS.men.length) return;
  for(const E of enemies){ if(E.dead) continue; E.liveT=0; E.dormant=false; E.pfSeen=true; } /* nobody sleeps or gets culled: the worst case */
  if(wnum('stress','god',1)&&!PL.dead) PL.hp=Math.max(PL.hp,100); });
