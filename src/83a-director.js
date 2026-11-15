/* =====================================================================
   THE DIRECTOR (floor 01 prototype, ?proto=1): one gauge for the whole floor of how close the threat is to Ray, and a light hand on
   the hunt so the fear comes in waves instead of a flat line. Alien: Isolation's two brains, small: the men only ever act on what
   they know (83-hunt.js); the director only decides where the searching goes next and when it pauses.
   - Menace (DIRECTOR.menace, 0..1): the nearest man who's looking (path distance), anyone who can see him, the meters filling
     (E.pm), and close calls (a man checking a spot right by him, a hiding spot that held). Rises fast, falls slowly.
   - build: the normal hunt. Menace low for a long while during a hunt: the nearest pair's search drifts into the rooms round
     where Ray really is (3-6 m off, never at him, never his own hiding spot).
   - peak: menace high for a few seconds. Nothing is changed: this is the part that should be frightening.
   - relax: after a peak that didn't end in a fight: the pairs that can't see him decide "not here", turn and search elsewhere,
     pause longer, and the hunt's clock runs down faster. Never touches a man who can see him or whose meter is half full.
   Events: director(phase). Telemetry: stat('director',phase). ?huntdbg=1 shows it.
   ===================================================================== */
PROTO.director={ near:9, inner:1.6, rise:1.1, fall:.05, peakAt:.7, peakIn:2.5, peakHold:[7,12], relax:[22,34], lowAt:.2, lowFor:[24,34], drift:[3,6],
  edgeLowFor:[55,75], every:.5 };
const DIRECTOR={menace:0,target:0,phase:'build',phaseT:0,peakT:0,lowT:0,lowNeed:28,edgeLowT:0,close:-99,acc:0,dmin:99,relaxT:0,peakFor:9,n:{peak:0,relax:0,drift:0}};
function dirReset(){ Object.assign(DIRECTOR,{menace:0,target:0,phase:'build',phaseT:0,peakT:0,lowT:0,lowNeed:rnd(...PROTO.director.lowFor),edgeLowT:0,close:-99,acc:0,dmin:99,relaxT:0,n:{peak:0,relax:0,drift:0}}); }
function dirPhase(ph){ const D=DIRECTOR; if(D.phase===ph) return; D.phase=ph; D.phaseT=0; if(D.n[ph]!=null) D.n[ph]++;
  if(typeof huntLog==='function') huntLog('director',{ph,m:+D.menace.toFixed(2)}); protoEmit('director',ph); protoEmit('stat','director',ph); }
const dirMan=E=>!E.dead&&!E.civ&&!E.ally&&upright(E)&&!E.surr&&!E.obey&&!(E.hsStand>0);
/* can this man be steered? Not if he sees Ray or nearly does */
const dirFree=E=>!!E&&!E.dead&&!(E.aware&&E.canSee)&&!(E.pm>.45)&&!E.canSee;

/* the gauge, twice a second */
function dirMeasure(dt){ const D=DIRECTOR,P=PROTO.director,F=fieldTo(PL.x,PL.z),hunting=HUNT.state==='hunting'; let dmin=99,see=0,pm=0;
  for(const E of enemies){ if(!dirMan(E)) continue; if(E.pm>pm) pm=E.pm; if(E.aware&&E.canSee) see=1;
    const looking=E.aware||hunting||E.hj&&E.hj.k==='look'; if(!looking) continue;
    const c=navCell(E.pos[0],E.pos[1]),d=F&&c>=0&&F[c]<1e9?F[c]/20:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)*1.4; if(d<dmin) dmin=d; }
  D.dmin=dmin; const prox=clamp((P.near-dmin)/(P.near-P.inner),0,1),cc=Math.exp(-(GAME.t-D.close)/6);
  D.target=Math.max(see,pm*.9,prox*(PL.hide?.85:1),cc*.85);
  D.menace+=D.target>D.menace?Math.min(D.target-D.menace,P.rise*dt):-Math.min(D.menace-D.target,P.fall*dt); }

function dirTick(dt){ const D=DIRECTOR,P=PROTO.director,H=HUNT,anySees=enemies.some(E=>dirMan(E)&&E.aware&&E.canSee);
  dirMeasure(dt); D.phaseT+=dt;
  if(D.phase==='build'){
    D.peakT=D.menace>=P.peakAt?D.peakT+dt:Math.max(0,D.peakT-dt*.5); if(D.peakT>=P.peakIn){ D.peakT=0; D.peakFor=rnd(...P.peakHold); dirPhase('peak'); return; }
    if(H.state==='hunting'&&D.menace<P.lowAt&&!PL.dead){ D.lowT+=dt; if(D.lowT>=D.lowNeed){ D.lowT=0; D.lowNeed=rnd(...P.lowFor); dirDrift(); } } else D.lowT=Math.max(0,D.lowT-dt);
    if(H.state==='edge'&&D.menace<P.lowAt){ D.edgeLowT+=dt; if(D.edgeLowT>=rnd(...P.edgeLowFor)){ D.edgeLowT=0; dirEdgeDrift(); } } else D.edgeLowT=0; }
  else if(D.phase==='peak'){
    if(anySees){ D.phaseT=Math.min(D.phaseT,2); return; } /* a fight: the director stays out of it */
    if(D.menace<.35&&D.phaseT>4){ dirPhase('build'); return; }
    if(D.phaseT>=D.peakFor){ D.relaxT=rnd(...P.relax); dirPhase('relax'); dirBackOff(); } }
  else if(D.phase==='relax'){
    if(anySees){ dirPhase('peak'); D.peakFor=rnd(...P.peakHold); return; }
    if(D.phaseT>=D.relaxT||H.state!=='hunting'&&D.phaseT>8){ dirPhase('build'); D.lowT=0; } } }

/* relax: the pairs that can't see him decide it isn't here */
const HL_NOT=['Not here.','He\'s not in here. Next.','Nothing. Move.','Forget it— other side.','Come on. He went the other way.'];
function dirBackOff(){ const H=HUNT,now=GAME.t; if(H.state!=='hunting') return;
  for(const p of H.pairs){ const L=p.L; if(!L||!dirFree(L)||p.F&&!dirFree(p.F)) continue;
    const d=Math.hypot(L.pos[0]-PL.x,L.pos[1]-PL.z); if(PL.hide) p.spots=p.spots.filter(s=>s!==PL.hide);
    if(p.ph==='shine'&&p.spot&&p.spot===PL.hide) continue; /* already looking into it: no last-second change of mind */
    if(d<11){ if(L.barkCd<=0) bark(L,huntFresh('not',HL_NOT),2); p.spot=null; p.ph='sweep'; p.sweepT=rnd(1.6,3); p.tgt=null; p.away=true; freshGoal(L); } }
  for(const E of enemies){ const J=E.hj; if(!J||J.k!=='look'||!dirFree(E)) continue; if(Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<8&&!(J.spot&&J.shineT>0&&J.spot===PL.hide)) J.t=Math.min(J.t,2.5); }
  H.t=Math.min(H.t,Math.max(25,H.t*.75)); H.steerT=now; huntLog('backOff',{}); }
/* where a pair goes while the director is easing off: somewhere it hasn't looked, well away from where Ray really is */
function dirPickAway(p){ const G=huntGrid(false),L=p.L,now=GAME.t,P=PROTO.hunt; let best=null,bs=0; const others=HUNT.pairs.filter(q=>q!==p&&q.tgt).map(q=>q.tgt);
  for(const c of G.cells){ const dr=Math.hypot(c.x-PL.x,c.z-PL.z); if(dr<9) continue; if(others.some(t=>Math.hypot(t[0]-c.x,t[1]-c.z)<3.5)) continue;
    const rec=c.clr<0?1:clamp((now-c.clr-P.clrHold)/P.clrRecover,0,1); if(rec<=0) continue; const dl=Math.hypot(c.x-L.pos[0],c.z-L.pos[1]);
    const w=rec*c.bonus/(1+dl/8)*(dl<2?.3:1); if(w>bs){ bs=w; best=c; } }
  return best?[best.x,best.z]:null; }
/* build, quiet for a long time: the nearest pair's search drifts into the rooms round where he is (not at him) */
function dirDrift(){ const H=HUNT,P=PROTO.director,G=huntGrid(false),now=GAME.t; let bp=null,bd=1e9;
  for(const p of H.pairs){ if(!p.L||p.ph==='shine'||!dirFree(p.L)) continue; const d=Math.hypot(p.L.pos[0]-PL.x,p.L.pos[1]-PL.z); if(d<bd){ bd=d; bp=p; } } if(!bp) return;
  const F=fieldTo(PL.x,PL.z); let best=null,bs=-1;
  for(const c of G.cells){ const dl=F&&F[c.nc]<1e9?F[c.nc]/20:1e9; if(dl<P.drift[0]||dl>P.drift[1]) continue; const rec=c.clr<0?1:clamp((now-c.clr)/30,0,1); const s=rec+Math.random()*.4; if(s>bs){ bs=s; best=c; } }
  if(!best) return; bp.tgt=[best.x,best.z]; bp.spot=null; bp.ph='go'; bp.goT=0; bp.away=false; bp.drifted=true; freshGoal(bp.L);
  const hs=huntHides().filter(s=>s!==PL.hide&&Math.hypot(s.x-PL.x,s.z-PL.z)<5&&!bp.spots.includes(s)).sort((a,b)=>Math.hypot(a.x-best.x,a.z-best.z)-Math.hypot(b.x-best.x,b.z-best.z));
  if(hs[0]) bp.spots.unshift(hs[0]);
  DIRECTOR.n.drift++; huntLog('drift',{to:[+best.x.toFixed(1),+best.z.toFixed(1)],d:+bd.toFixed(1)}); }
/* edge, nothing for a long time: one man's loop takes him past the rooms round Ray */
function dirEdgeDrift(){ const F=fieldTo(PL.x,PL.z); let best=null,bd=1e9;
  for(const E of enemies){ if(!huntFree(E)||!E.hj||E.hj.k!=='patrol'||!dirFree(E)) continue; const c=navCell(E.pos[0],E.pos[1]),d=F&&c>=0&&F[c]<1e9?F[c]/20:99; if(d<bd){ bd=d; best=E; } }
  if(!best||bd<4) return; const q=navSpotNear(PL.x,PL.z,6); if(!q||Math.hypot(q[0]-PL.x,q[1]-PL.z)<3) return;
  const J=best.hj; J.pts.splice(J.i,0,q); freshGoal(best); DIRECTOR.n.drift++; huntLog('edgeDrift',{by:best.name}); }

/* close calls: a spot that held while a man was at it, a man passing right by him hidden */
protoOn('hideSave',()=>{ DIRECTOR.close=GAME.t; });
protoOn('tick',gdt=>{ if(!PROTO.on||!GAME.started||!FLOOR.nav||PL.dead) return; const D=DIRECTOR; D.acc+=gdt; if(D.acc>=PROTO.director.every){ const dt=D.acc; D.acc=0; dirTick(dt); } });
protoOn('reset',()=>dirReset()); protoOn('load',()=>dirReset());
