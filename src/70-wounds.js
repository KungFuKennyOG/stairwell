/* ---------- wounds you can read: shock, the arm nerve, flinching from your gun, a man on the floor under fire ----------
   From the research doc "Stairwell: shot placement & suffering research" (2026-10-31):
   - blood loss goes in four stages (ATLS shock classes): anxious; fast breathing, cool and sweaty; confused and pale;
     grey, lethargic. Near the end, agonal gasps: reflex gulps, not breaths
   - a hit high on the arm, by the shoulder and armpit, can take the arm's nerves: it goes dead and the hand opens
   - people flinch and turn a shoulder away from a muzzle, so hits land in arms, sides and backs
   - a man on the floor under fire flinches and curls at each shot, throws his forearms up at the gun, pushes himself
     away on his heels, begs harder */

/* ---- shock stages ---- */
const shockStage=b=>b>85?1:b>70?2:b>60?3:4;
const AIM_BY_STAGE=[1,1,.85,.65,.45];
/* the face goes grey: less red, a little lighter. Applied to whichever face he's wearing right now (they swap with his expression) */
function paleFace(E,k){ const m=E.J.headMesh&&E.J.headMesh.mesh.mats[0]; if(!m) return;
  if(m===E.paleM&&Math.abs((E.paleSet||0)-k)<.01) return; E.paleM=m; E.paleSet=k;
  m.color=[1-.34*k,1-.22*k,1-.12*k]; m.emis=[.05*k,.07*k,.09*k]; }
function shockTick(E,dt){
  E.shock=E.wounds.length?shockStage(E.blood):1;
  E.aimMul=AIM_BY_STAGE[E.shock];
  const k=clamp((86-E.blood)/56,0,1); /* starts showing in stage II, grey by stage IV */
  E.paleK=lerp(E.paleK||0,k,Math.min(1,dt*.7)); paleFace(E,E.paleK);
  E.flinchT=(E.flinchT??-1)-dt; E.dShot=Math.max(0,(E.dShot||0)-dt);
  if(!E.bladeSg) E.bladeSg=Math.random()<.5?1:-1;
  const fighter=E.st==='alert'&&!E.civ&&!E.surr&&!E.civFreeze&&E.aware;
  E.bladeK=lerp(E.bladeK||0,fighter&&E.covered?1:0,Math.min(1,dt*4)); }
/* the dead keep going grey */
function deadPale(E,dt){ if((E.paleK??0)>=1) return; E.paleK=Math.min(1,(E.paleK||0)+dt/25); paleFace(E,E.paleK); }

/* ---- the arm nerve: a gun hit near the top of the upper arm ---- */
function armNerve(E,seg,point,side){ if(E.dead||E.cut['arm'+side]||E.deadArm&&E.deadArm[side]) return false;
  const a=X_(E.B,seg[0]),b=X_(E.B,seg[1]),ab=v3.sub(b,a),t=v3.dot(v3.sub(point,a),ab)/Math.max(1e-6,v3.dot(ab,ab));
  if(t>.4||Math.random()>.65) return false;
  (E.deadArm=E.deadArm||{})[side]=true; E.hp['arm'+side]=0; /* no tone left: it hangs */
  if(E.wpnHeld&&E.wpnHand===side){ dropWeapon(E); E.atkCd=Math.max(E.atkCd,1); } /* the hand just opens; nothing passes to the other one */
  if(E.barkCd<1.6) bark(E,pick(['My arm— I can\'t— I can\'t feel it—','Ahh— my arm— it\'s dead—','What— my hand won\'t—']),2.2);
  if(E.st==='alert'&&!E.civ&&!E.surr&&typeof psychOf==='function'&&psychOf(E)==='fight'&&Math.random()<.35&&typeof surrender==='function') surrender(E,'hit');
  return true; }

/* ---- your shots: who flinches. Called for every bullet and pellet you fire ---- */
const FL_T=.38;
function shotNear(o,d,tEnd,hitE){ if(!GAME.started) return; const end=v3.add(o,v3.sc(d,tEnd));
  for(const E of enemies){ if(E.dead||E.ally) continue;
    const c=X_(E.B,PI_.chest),v=v3.sub(c,o),t=clamp(v3.dot(v,d),0,tEnd),off=Math.hypot(...v3.sub(v,v3.sc(d,t)));
    const near=E===hitE||off<1.1||Math.hypot(...v3.sub(c,end))<1.4,bang=Math.hypot(c[0]-o[0],c[2]-o[2])<5;
    if(E.st==='down'){ if(!(near||bang)||!downCanReact(E)) continue;
      const fresh=(E.dShot||0)<.2; E.dShot=Math.max(E.dShot||0,near?1.6:.9);
      if(fresh){ vox(E,Math.random()<.5?'cry':'whimper',1);
        if(E.barkCd<=.6&&!E.ally) bark(E,pick(['No— no no no—','Stop— STOP—','Please—!','*sobbing*','Don\'t— don\'t—']),1.6); } }
    else if(E.st==='alert'&&near&&!E.surr&&!E.civ&&!E.civFreeze&&E.aware&&E.flinchT<-.35){ E.flinchT=FL_T; E.atkCd=Math.max(E.atkCd,.3); } } }

/* a standing man's flinch and his bladed stance, layered on the pose (called from targetsFor) */
function flinchPose(E,J){ if(E.st!=='alert'||E.dead||E.surr||E.civFreeze) return;
  const f=E.flinchT>0?Math.sin(Math.PI*clamp(1-E.flinchT/FL_T,0,1)):0,b=E.bladeK||0; if(f<=.001&&b<=.001) return;
  const sg=E.bladeSg||1;
  J.spine.r[0]+=.26*f; J.neck.r[0]+=.25*f; J.head.r[0]+=.2*f; /* duck: head down, shoulders up */
  J.spine.r[1]+=sg*(.3*b+.12*f); /* turn a shoulder to the gun; an armed man's aim loop turns his hips back so the gun stays on you */
  if(!E.wpnHeld&&E.atkT<0){ const s=sg>0?'L':'R',u=Math.max(f,b*.55); /* empty hands: the near forearm comes up over the face */
    if(E.hp['arm'+s]>.45){ const A=J['arm'+s].r,El=J['elbow'+s].r; J['arm'+s].r=[lerp(A[0],-1.55,u),A[1],lerp(A[2],s==='L'?.45:-.45,u)]; J['elbow'+s].r=[lerp(El[0],-2.05,u),0,0]; } } }

/* ---- a man on the floor with your gun on him ---- */
function downCanReact(E){ if(E.dead||E.ally||E.fakeDead||E.gShoot||E.cons<=.3) return false;
  if(E.knocked&&E.koT&&E.downT<E.koT) return false; /* out cold */
  if(E.wounds.some(w=>w.part==='neck'&&!w.piece)) return false; /* holding his throat shut */
  if((E.energy??1)<.18) return false; /* too far gone */
  if(E.temper==='still'){ if(E.flinchy==null) E.flinchy=Math.random()<.5; if(!E.flinchy) return false; } /* some of the ones playing dead can't help it */
  return true; }
/* picks his floor mode when your gun or your shots are on him. Called from think() with the mode it was going to use */
function downReact(E,mode,dist,ctx){ if(!downCanReact(E)) return mode;
  if(E.dShot>0) return 'cower'; /* shots: curled tight, arms over his head */
  if(!E.covered||E.coverT<.25||dist>7) return mode;
  if(dist<2.2) return mode; /* right over him: the close-up behaviour already covers it */
  if(mode==='crawl') return mode; /* already dragging himself away */
  if(E.temper==='still') return 'cower';
  if(E.guardPref==null) E.guardPref=Math.random()<.5?'scoot':'guard';
  if(E.guardPref==='scoot'&&ctx.canMove&&ctx.lying&&ctx.up>.2&&ctx.legs>=.5&&(E.energy??1)>.35) return 'scoot'; /* pushes himself away on his heels */
  return ctx.up>-.2?'guard':'cower'; }
