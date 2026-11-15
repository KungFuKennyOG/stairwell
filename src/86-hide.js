/* =====================================================================
   HIDING (floor 01 prototype): the hunted man's verbs. Everything here runs only with PROTO.on.
   - Spots (HIDES, addHideSpot): under a bed, in a wardrobe or closet, behind a tub curtain or hung laundry, behind a sofa,
     in the mattress pile, a dark corner. Ray is in one when his head is in it (VR: the headset; keyboard: inside it crouched,
     or standing in a tall one). A hand or the head sticking out shows: PL.hideExp, 0 tucked in .. 1 in plain view.
     rayConcealment(E) is what the hunters' eyes multiply by (83-hunt.js); hideProbe(E,spot) is a searcher looking into one.
   - Crouch (PL.crouch): the real head below ~1.2 m, or the toggle (left-stick click in VR, C on a keyboard). Crouched, Ray goes
     under anything with an underside (a box with y0>0: a bed frame, the wall over a crouch hole); solidFor asks hideUnder(b).
     Under it his view dips below the underside: PL.dropY, applied in camBasis and to the XR origin in twStairs.
   - Sheets (addSheet): a bedsheet, a blanket or plastic strips hung in an opening. They stop eyes (sightClear), never bodies,
     bullets, swings or sound. They swing aside on whoever walks through (a few verlet points per strip), glow when a
     flashlight is behind them, rustle, and a strip tears off a sheet (grip it, pull down hard) for a bandage (giveStrip, 80-ray.js).
   - PL.mouthCovered / rayVoiceScale(): a hand over the mouth halves Ray's breathing and pain noises.
   ?hidetest=1 on the old floor 01 (index.html?f=1&proto=1&pf=0&hidetest=1): a test bed, a curtained wardrobe and two hung
   doorways by the start, and a readout (top left; a toast in VR) of what the system thinks.
   Events: hide(spot)  unhide(spot,secs)  hideSave(spot,E,'probe'|'pass')  hideCaught(spot,E)  crouch(on)  sheetTear(S,h)
           stat('timeHidden',secs)
   ===================================================================== */
PROTO.hide={
  crouchH:1.42, standH:1.5, crouchK:.8, standK:.86, /* VR: crouched under 80% of your standing head height (cap crouchH), standing again over 86% */
  flatEye:.95,                      /* keyboard: eye height crouched */
  togEye:.95, togMin:.3, togMax:.8, /* VR toggle: a fixed drop, taken at the click, that puts a standing head near togEye (a seated one drops less) */
  crawlMin:.24,                     /* crouched, Ray crawls under anything whose underside is at least this far off the floor */
  crawlPre:.15, crawlGap:.08,       /* once his head is within crawlPre of it, the view dips to crawlGap under the underside */
  crawlVR:true,                     /* false: in VR you have to get your real head under it (lie down) */
  dropRate:3, dropRateFlat:5,       /* m/s the view goes down and back up */
  crouchSpd:.5, crawlSpd:.33,       /* keyboard: speed crouched and crawling, of a walk (VR: rayMoveScale() for the stick) */
  headOut:.15, headLost:.25,        /* the head this far out of a spot shows fully; farther than headLost he isn't in it */
  handOut:.1, handExp:.55,          /* a hand this far out shows; each one out shows this much of him */
  nearR:1, nearFull:.7,             /* hidden, he's seen from within nearR (head to head, so a man standing over a bed doesn't), plainly by nearFull */
  torchCos:.9, torchR:8, torchFull:4.5, /* a flashlight cone that reaches his head: plain within torchFull, fading out by torchR */
  soundT:2,                         /* a sound gives the spot away this long, to anyone close enough to have heard it */
  mouthR:.12,                       /* a hand this close to the mouth covers it */
  saveR:2, saveOut:3,               /* a man coming within saveR and leaving past saveOut without finding him: the spot saved him */
  stillMove:.06, stillT:1.5,        /* keeping still: moved less than this for this long */
  probeMiss:{sheets:.25,mattress:.3,corner:.2,sofa:.15}, /* the one fair miss (see hideProbe) */
  glowR:4.5, glowFull:2, glowCos:.45, /* a flashlight this close behind a sheet and pointed roughly at it lights it up */
  rustleR:1.5,                      /* Ray pushing through a sheet: heard this far */
  tearPull:.25, tearSpd:1.6, tearLen:.12 /* gripped and pulled down this far or this fast: a strip tears off the bottom */
};
const HIDEP=PROTO.hide;
const HIDES=[], HIDE_KIND_SAVES={};
const HIDE={test:new URLSearchParams(location.search).get('hidetest')==='1',fake:null,mark:N(null),realC:false,togOff:0,crawlD:0,low:0,
  inT:0,still:0,sp:null,lx:null,lz:null,passers:new Map(),soundT:-99,soundR:0,cost:0,hud:null,hudKey:'',pool:[],np:0,torch:[]};
HIDE.mark.live=true; /* meshMerge keeps it */
Object.assign(PL,{hide:null,hideExp:1,hideT:0,crouch:false,crouchT:false,crawl:false,dropY:0,mouthCovered:false});

/* every level builder empties floorN: when the marker is gone, the spots and sheets belonged to the last floor */
function hideFresh(){ return !(HIDE.mark.par===floorN&&floorN.kids.includes(HIDE.mark)); }
function hideFloorCheck(){ if(!hideFresh()) return false; HIDES.length=0; SHEETS.length=0; PL.hide=null; HIDE.passers.clear(); floorN.add(HIDE.mark); return true; }

/* ---------- spots ----------
   {id, kind, x, z, yaw, w, d, h, y0}: a box on the floor, w along its local x and d along local z, turned by yaw the way
   N(parent,x,0,z,0,yaw,0) turns things (the same as prop() and the FURN builders), from y0 (0) up to h. Under a bed h is
   the underside. open: '+z'|'-z'|'+x'|'-x', the side a searcher looks in from (optional). */
function addHideSpot(o){ hideFloorCheck(); const yaw=o.yaw||0;
  const S={id:o.id??('hide'+HIDES.length),kind:o.kind||'corner',x:o.x,z:o.z,yaw,w:o.w||1,d:o.d||1,h:o.h??1,y0:o.y0||0,c:Math.cos(yaw),s:Math.sin(yaw),open:o.open||null,
    saves:0,probes:0,caught:0,entered:0,look:null};
  HIDES.push(S); return S; }
function removeHideSpot(S){ const i=HIDES.indexOf(S); if(i>=0) HIDES.splice(i,1); if(PL.hide===S) PL.hide=null; }
/* spots within r metres (straight line) of (x,z), nearest first: for the searchers */
function hideNear(x,z,r){ return HIDES.map(S=>[Math.hypot(S.x-x,S.z-z),S]).filter(a=>a[0]<=r).sort((a,b)=>a[0]-b[0]).map(a=>a[1]); }
/* where a searcher stands to look into a spot: just off its open side, on a walkable cell */
function hideLookPoint(S){ if(S.look) return S.look; const F=[[0,1],[0,-1],[1,0],[-1,0]],first={'+z':0,'-z':1,'+x':2,'-x':3}[S.open];
  for(const k of first!=null?[first,0,1,2,3]:[0,1,2,3]){ const lx=F[k][0]*(S.w/2+.55),lz=F[k][1]*(S.d/2+.55),x=S.x+S.c*lx+S.s*lz,z=S.z-S.s*lx+S.c*lz,c=FLOOR.nav?navCell(x,z):-1;
    if(c>=0&&!FLOOR.nav[c]) return S.look=[x,z]; }
  return S.look=[S.x,S.z]; }
/* how far a point is outside a spot (0: inside). flatC: keyboard and crouched, height doesn't count */
function hideSpotOut(S,x,y,z,flatC){ const dx=x-S.x,dz=z-S.z,lx=S.c*dx-S.s*dz,lz=S.s*dx+S.c*dz;
  const ox=Math.max(0,Math.abs(lx)-S.w/2),oz=Math.max(0,Math.abs(lz)-S.d/2),oy=flatC?0:Math.max(0,y-S.h,S.y0-y); return Math.sqrt(ox*ox+oy*oy+oz*oz); }

/* ---------- Ray's body as the world sees it: head and hands, heights above the floor he stands on ----------
   HIDE.fake {head:[x,y,z], hands:[[x,y,z]|null, ...], f, u, vr}: the headless tests' stand-in for the headset (real heights) */
const HB={x:0,y:0,z:0,real:1.62,vr:false,h:[[0,0,0],[0,0,0]],hOk:[false,false],hGun:[false,false],f:[0,0,-1],u:[0,1,0]};
function hideBody(){ const F=HIDE.fake,d=PL.dropY||0,py=PL.y||0;
  if(F){ HB.vr=F.vr!==false; HB.real=F.head[1]; HB.x=F.head[0]; HB.y=F.head[1]-d; HB.z=F.head[2];
    for(let k=0;k<2;k++){ const p=F.hands&&F.hands[k]; HB.hOk[k]=!!p; HB.hGun[k]=false; if(p){ HB.h[k][0]=p[0]; HB.h[k][1]=p[1]-d; HB.h[k][2]=p[2]; } }
    HB.f=F.f||[-Math.sin(PL.yaw),0,-Math.cos(PL.yaw)]; HB.u=F.u||[0,1,0]; return HB; }
  if(XR.on&&XR.head){ const e=XR.head.eye; HB.vr=true; HB.real=e[1]-XR.origin[1]+(XR.baseY||0); HB.x=e[0]; HB.y=e[1]-py; HB.z=e[2]; HB.f=XR.head.f; HB.u=XR.head.u;
    const L=[HANDS.L,HANDS.R]; for(let k=0;k<2;k++){ const h=L[k]; HB.hOk[k]=!!h.src; HB.hGun[k]=!!(h.item&&WPN[h.item.key]&&WPN[h.item.key].gun);
      if(h.src){ const p=mulP(h.M,FIST); HB.h[k][0]=p[0]; HB.h[k][1]=p[1]-py; HB.h[k][2]=p[2]; } }
    return HB; }
  HB.vr=false; HB.real=1.62; HB.x=PL.x; HB.y=1.62-d; HB.z=PL.z; HB.hOk[0]=HB.hOk[1]=false; HB.f=[-Math.sin(PL.yaw),0,-Math.cos(PL.yaw)]; HB.u=[0,1,0]; return HB; }
/* Ray's head as the world sees it: height above his floor, and the point. The hunters should look at this, not 1.55 m */
function rayHeadY(){ const F=HIDE.fake; if(F) return F.head[1]-(PL.dropY||0); if(XR.on&&XR.head) return XR.head.eye[1]-(PL.y||0); return 1.62-(PL.dropY||0); }
function rayHead(){ const F=HIDE.fake,py=PL.y||0; if(F) return [F.head[0],F.head[1]-(PL.dropY||0)+py,F.head[2]]; if(XR.on&&XR.head) return XR.head.eye.slice(); return [PL.x,1.62+py-(PL.dropY||0),PL.z]; }
const hideIsVR=()=>HIDE.fake?HIDE.fake.vr!==false:!!(XR.on&&XR.head);
/* move speed for the stick or keys: crouched and crawling are slower (keyboard applies it itself; VR stick: multiply by it) */
function rayMoveScale(){ return !PROTO.on?1:PL.crawl?HIDEP.crawlSpd:PL.crouch?HIDEP.crouchSpd:1; }

/* ---------- crouching and crawling ---------- */
/* solidFor's question for a box with an underside: can Ray go under it right now? */
function hideUnder(b){ if(rayHeadY()<b.y0-.02) return true; /* his real head is already under it */
  return !!PL.crouch&&b.y0>=HIDEP.crawlMin&&(HIDEP.crawlVR||!hideIsVR()); }
/* the lowest underside over (x,z) he could crawl under, or 0 */
function hideLowAbove(x,z){ let low=0; const m=HIDEP.crawlPre,mn=HIDEP.crawlMin;
  for(const b of boxesAt(x,z)){ if(b.y0<mn||b.y0>=1.6||b.h<=.4) continue; if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m&&(!low||b.y0<low)) low=b.y0; } return low; }
function hideCrouchToggle(){ if(!PROTO.on) return; if(PL.crouchT&&PL.crawl) return; /* no standing up under a bed */
  PL.crouchT=!PL.crouchT; if(PL.crouchT){ const B=hideBody(); HIDE.togOff=B.vr?clamp(B.real-HIDEP.togEye,HIDEP.togMin,HIDEP.togMax):1.62-HIDEP.flatEye; }
  if(XR.on) buzz('left',.25,30); }
function hideCrouchTick(dt,B){ const P=HIDEP;
  if(B.vr){ /* crouched is relative to how tall you stand: a slow-falling high-water mark of your head (sitting players get the toggle) */
    HIDE.tall=Math.max(B.real,(HIDE.tall||1.6)-dt*.004); const tall=clamp(HIDE.tall,1.3,1.9),cH=Math.min(P.crouchH,tall*P.crouchK),sH=Math.min(P.standH,tall*P.standK);
    if(B.real<cH) HIDE.realC=true; else if(B.real>sH) HIDE.realC=false; } else HIDE.realC=false;
  const was=PL.crouch; PL.crouch=!!(PL.crouchT||HIDE.realC); if(PL.crouch!==was) protoEmit('crouch',PL.crouch);
  const low=PL.crouch?hideLowAbove(B.x,B.z):0,prev=HIDE.low; HIDE.low=low; PL.crawl=low>0;
  const tog=PL.crouchT?(B.vr?HIDE.togOff:1.62-P.flatEye):0,eff=B.real-tog; let crawl=0;
  if(low&&(P.crawlVR||!B.vr)){ const want=Math.max(.1,low-P.crawlGap);
    if(!B.vr) crawl=Math.max(0,eff-want);
    else { /* VR: the dip is taken once on the way in and then held, so moving your real head still moves your view, never the other way round */
      if(!prev||low<prev-.01) HIDE.crawlD=Math.max(HIDE.crawlD,eff-want);
      HIDE.crawlD=Math.min(HIDE.crawlD,Math.max(0,eff-.1)); crawl=Math.max(0,HIDE.crawlD); } }
  else HIDE.crawlD=0;
  const target=tog+crawl,rate=(B.vr?P.dropRate:P.dropRateFlat)*dt,d0=PL.dropY||0; PL.dropY=d0+clamp(target-d0,-rate,rate); }
/* keyboard: crouched and crawling move slower (the frame's step is cut back after the fact; VR's stick isn't touched here) */
function hideFlatSpeed(){ if(XR.on||HIDE.fake||PL.dead||PL.grab){ HIDE.lx=null; return; } const k=rayMoveScale();
  if(HIDE.lx!=null&&k<1){ const dx=PL.x-HIDE.lx,dz=PL.z-HIDE.lz; if(dx*dx+dz*dz<.25){ PL.x=HIDE.lx+dx*k; PL.z=HIDE.lz+dz*k; } }
  HIDE.lx=PL.x; HIDE.lz=PL.z; }

/* ---------- is he in a spot, and how much of him shows ---------- */
function hideSpotTick(dt,B){ const P=HIDEP,flatC=!B.vr&&PL.crouch; let best=null,bo=1e9;
  for(const S of HIDES){ if(S.off) continue; const o=hideSpotOut(S,B.x,B.y,B.z,flatC); if(o<bo){ bo=o; best=S; } }
  if(best&&bo>P.headLost) best=null;
  let exp=1; if(best){ let ins=1-clamp(bo/P.headOut,0,1);
    if(B.vr) for(let k=0;k<2;k++) if(B.hOk[k]){ const ho=hideSpotOut(best,B.h[k][0],B.h[k][1],B.h[k][2],false); ins*=1-P.handExp*clamp(ho/P.handOut,0,1); }
    exp=1-ins; }
  const prev=PL.hide; PL.hide=best; PL.hideExp=best?exp:1;
  if(best!==prev){ if(prev){ const dur=GAME.t-HIDE.inT; protoEmit('unhide',prev,dur); protoEmit('stat','timeHidden',dur); HIDE.passers.clear(); }
    if(best){ HIDE.inT=GAME.t; best.entered++; protoEmit('hide',best); } }
  PL.hideT=best?GAME.t-HIDE.inT:0;
  /* keeping still */
  const sp=HIDE.sp; if(!sp||Math.hypot(B.x-sp[0],B.y-sp[1],B.z-sp[2])>P.stillMove){ HIDE.sp=[B.x,B.y,B.z]; HIDE.still=0; } else HIDE.still+=dt; }
/* a hand over the mouth: within mouthR of a point 8 cm in front of the eyes and 8 cm down. Not the hand holding a gun */
function hideMouthTick(B){ let cov=false;
  if(B.vr){ const r2=HIDEP.mouthR*HIDEP.mouthR,mx=B.x+B.f[0]*.08-B.u[0]*.08,my=B.y+B.f[1]*.08-B.u[1]*.08,mz=B.z+B.f[2]*.08-B.u[2]*.08;
    for(let k=0;k<2;k++){ if(!B.hOk[k]||B.hGun[k]) continue; const dx=B.h[k][0]-mx,dy=B.h[k][1]-my,dz=B.h[k][2]-mz; if(dx*dx+dy*dy+dz*dz<r2) cov=true; } }
  else cov=!!KEYS.KeyX; /* keyboard: hold X */
  PL.mouthCovered=cov; }
/* Ray's breathing and pain noises (80-ray.js): radius and volume times this */
function rayVoiceScale(){ return PROTO.on&&PL.mouthCovered?.5:1; }

/* ---------- what the spot did for him (the searchers learn which kinds work: 83-hunt.js reads HIDE_KIND_SAVES) ---------- */
function hideSaved(S,E,why){ S.saves++; HIDE_KIND_SAVES[S.kind]=(HIDE_KIND_SAVES[S.kind]||0)+1; protoEmit('hideSave',S,E,why); }
function hideSaveTick(B){ const S=PL.hide; if(!S) return; const P=HIDEP;
  for(const E of enemies){ if(E.dead||E.civ||E.ally||(E.st!=='idle'&&E.st!=='alert')) continue; const d=Math.hypot(E.pos[0]-B.x,E.pos[1]-B.z),st=HIDE.passers.get(E);
    if(d<P.saveR){ if(!st) HIDE.passers.set(E,1); }
    else if(st===1&&d>P.saveOut){ HIDE.passers.set(E,2); if(!(E.aware&&E.canSee)) hideSaved(S,E,'pass'); } } }

/* ---------- the hunters' side ---------- */
/* his flashlight, if he has one on: {o, d}. Uses E.torchPos / E.torchDir if the hunt sets them (83-hunt.js), else his head and heading, a little down */
function hideTorch(E){ if(!E||E.dead||!(E.torchOn||E.torch)) return null;
  const o=Array.isArray(E.torchPos)?E.torchPos:null,d=Array.isArray(E.torchDir)?E.torchDir:null; if(o&&d) return {o,d};
  const hp=E.B?X_(E.B,PI_.head):[E.pos[0],1.65,E.pos[1]],fx=Math.sin(E.hd||0),fz=Math.cos(E.hd||0);
  return {o:o||[hp[0]+fx*.15,hp[1]-.3,hp[2]+fz*.15],d:d||norm3([fx,-.22,fz])}; }
/* a short line against the boxes it passes, through the 1 m buckets (rayBoxes tests every box on the floor). walls: only what
   stops sight and sound (walls, doors, anything taller than 1.5 m); otherwise furniture too. Sight-only boxes aren't in the buckets */
let HIDE_STAMP=1;
function hideSegClear(a,b,walls){ if(boxGridDirty) buildBoxGrid(); const st=++HIDE_STAMP,dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.5));
  for(let s=0;s<=n;s++){ const x=a[0]+dx*s/n,z=a[2]+dz*s/n; /* every half metre: the buckets hold each box with 0.3 m to spare, so nothing is skipped */
    for(const B of boxesAt(x,z)){ if(B._hs===st) continue; B._hs=st; if(walls?!(B.kind==='wall'||B.kind==='door'||B.h>1.5):B.kind==='ceil') continue;
      let t0=0,t1=1,ok=true; for(let k=0;k<3&&ok;k++){ const o=a[k],d=k===0?dx:k===1?dy:dz,lo=k===0?B.x0:k===1?B.y0:B.z0,hi=k===0?B.x1:k===1?B.h:B.z1;
        if(d>-1e-9&&d<1e-9){ if(o<lo||o>hi) ok=false; continue; } let ta=(lo-o)/d,tb=(hi-o)/d; if(ta>tb){ const q=ta; ta=tb; tb=q; } if(ta>t0) t0=ta; if(tb<t1) t1=tb; if(t0>t1) ok=false; }
      if(ok) return false; } }
  return true; }
/* light gets from o to p: nothing solid in the way, furniture included (a beam has to come in low to get under a bed), nor a sheet */
function hideLightClear(o,p){ return hideSegClear(o,p,false)&&!sheetsBlock(o,p); }
/* 0: he can't see Ray at all; 1: Ray is as visible as the light and the line of sight make him. Hidden, Ray shows only to a man
   within a metre of his head, to a flashlight cone that actually reaches him, or for a couple of seconds after a sound he made */
function rayConcealment(E){ if(!PROTO.on) return 1; const S=PL.hide; if(!S) return 1; const P=HIDEP; let c=PL.hideExp??0; if(c>=1||!E) return clamp(c,0,1);
  const h=rayHead(),eh=Array.isArray(E.headP)?E.headP:E.B?X_(E.B,PI_.head):E.pos?[E.pos[0],1.6,E.pos[1]]:null; if(!eh) return c; /* headP: where his eyes are, if not his ragdoll's head */
  const dx=h[0]-eh[0],dy=h[1]-eh[1],dz=h[2]-eh[2],d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d<P.nearR) c=Math.max(c,clamp((P.nearR-d)/(P.nearR-P.nearFull),0,1));
  if(c<1){ const T=hideTorch(E); if(T){ const vx=h[0]-T.o[0],vy=h[1]-T.o[1],vz=h[2]-T.o[2],L=Math.sqrt(vx*vx+vy*vy+vz*vz)||1,cs=(vx*T.d[0]+vy*T.d[1]+vz*T.d[2])/L;
    if(cs>P.torchCos&&L<P.torchR&&hideLightClear(T.o,h)) c=Math.max(c,clamp((cs-P.torchCos)/(1-P.torchCos)*2,0,1)*clamp((P.torchR-L)/(P.torchR-P.torchFull),0,1)); } }
  if(c<1&&GAME.t-HIDE.soundT<P.soundT&&E.pos&&Math.hypot(E.pos[0]-h[0],E.pos[1]-h[2])<HIDE.soundR) c=Math.max(c,1-(GAME.t-HIDE.soundT)/P.soundT);
  return clamp(c,0,1); }
/* a searcher has shone his light into the spot and looked (83-hunt.js times it: 2 s a bed, 3 s a wardrobe). true: Ray is caught there.
   Right beside the spot counts as in it: you can't duck out of a bed as he looks under it.
   The one miss, and it's earned: a quick look into a loose spot (hung laundry, the mattress pile, a dark corner, behind a sofa) misses
   a man who is fully tucked in, has kept still for 1.5 s and made no sound for 2 s (HIDEP.probeMiss: 15-30% by kind). Beds,
   wardrobes, closets and the tub never miss: he looks right in. */
function hideProbe(E,spot){ if(!PROTO.on||!spot) return false; spot.probes++; const B=hideBody(),S=PL.hide;
  const there=S===spot||hideSpotOut(spot,B.x,B.y,B.z,!B.vr&&PL.crouch)<HIDEP.headLost+.25; if(!there) return false;
  const miss=(HIDEP.probeMiss&&HIDEP.probeMiss[spot.kind])||0;
  if(miss>0&&S===spot&&PL.hideExp<.1&&HIDE.still>=HIDEP.stillT&&GAME.t-HIDE.soundT>HIDEP.soundT&&Math.random()<miss){ hideSaved(spot,E,'probe'); return false; }
  spot.caught++; protoEmit('hideCaught',spot,E); return true; }

/* ---------- hung sheets, blankets and plastic strips ----------
   addSheet({x, z, axis, w, h, kind, y0}): axis 'x' spans along x (an opening in a wall that runs along x), 'z' along z.
   h: the top of the opening, where it hangs from; y0: its bottom edge (default by kind). The cloth is a grid of points per panel
   (a bedsheet is two halves that part, a blanket one panel), the plastic a row of strips; the top row is nailed up. The game sees
   one sight-only box; sightClear checks the cloth itself where a line crosses it, so a sheet someone is walking through has a gap. */
const SHEET_K={
  sheet:  {panels:2,cols:3,rows:7,bot:.1, damp:.955,glow:.75,tear:true},
  blanket:{panels:1,cols:4,rows:7,bot:.14,damp:.94, glow:.42,tear:true},
  plastic:{strip:.2,rows:7,bot:.02,damp:.97,glow:.9,tear:false}
};
/* painted cloth: a yellowed bedsheet with faded blue flowers and a water line, a cheap fleece blanket with a big flower, milky builders' plastic */
function hidePaint(w,h,seed,base,amt,fn){ const I=Img(w,h),c=F3(base);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const k=1+amt*fbm(x/7,y/7,seed),i=(y*w+x)*3; I.d[i]=c[0]*k; I.d[i+1]=c[1]*k; I.d[i+2]=c[2]*k; }
  fn(I,rng(seed)); return toTex(I); }
const tHideSheet=hidePaint(32,48,861,'#cfc5a4',.1,(I,r)=>{
  for(let y=2,row=0;y<46;y+=7,row++) for(let x=(row%2)*4+2;x<32;x+=8){ softEll(I,x,y,1.7,1.3,'#7f90a8',.42); softEll(I,x+1.6,y+1.4,1.1,.6,'#8c9c78',.35); }
  for(let x=0;x<32;x+=9) softLine(I,x+r()*3,0,x+r()*3,48,'#8a7f62',.12,1.4); /* fold lines */
  blob(I,21,17,4,6,.28,'#b49b5c'); blob(I,8,9,3,3,.2,'#a99358'); /* old stains */
  softRect(I,0,39,32,9,'#8b7a55',.38,3); softLine(I,0,39+r(),32,38+r()*2,'#6e5e3e',.35,1.2); /* the water line at the bottom */
  blob(I,2,26,2.5,9,.3,'#5f533e'); blob(I,30,22,2.5,8,.25,'#5f533e'); /* grey where hands push it aside */
  softEll(I,10,30,1,1,'#2a2018',.9); softEll(I,10,30,1.8,1.8,'#5a4a32',.4); }); /* a cigarette burn */
const tHideBlanket=hidePaint(32,48,862,'#5c201d',.12,(I,r)=>{
  for(const y of [2,45]){ softRect(I,0,y-1,32,2,'#c48a3c',.85,.6); softRect(I,0,y+(y<9?2:-3),32,1,'#2b1d3d',.8,.5); }
  softEll(I,16,24,11,13,'#8a3a22',.7,.5); softEll(I,16,24,7.5,9,'#c27a32',.6,.4); softEll(I,16,24,3.5,4,'#e2b05a',.65,.4);
  for(let k=0;k<8;k++){ const a=k/8*6.283; softEll(I,16+Math.cos(a)*8,24+Math.sin(a)*9.5,2.2,2.6,'#a85428',.55,.5); }
  for(let i=0;i<70;i++) put(I,r()*32,r()*48,F3('#7a3a30'),.5); /* pilling */
  softRect(I,0,40,32,8,'#2a1610',.25,4); });
const tHidePlastic=hidePaint(16,48,863,'#a8b0ad',.07,(I,r)=>{
  for(let x=1;x<16;x+=3) softLine(I,x,0,x+r()-.5,48,'#cfd6d2',.22,.8); /* light catching the creases */
  for(let i=0;i<5;i++) blob(I,r()*16,8+r()*30,1.5,2.5,.25,'#6c716a'); /* dirty fingers */
  softRect(I,0,36,16,12,'#5e5f55',.35,5); softRect(I,0,0,16,2,'#4a4a42',.5,1); }); /* dirt along the bottom, the staple line at the top */
const HIDE_TEX={sheet:tHideSheet,blanket:tHideBlanket,plastic:tHidePlastic};

function addSheet(o){ hideFloorCheck(); const kind=SHEET_K[o.kind]?o.kind:'sheet',K=SHEET_K[kind],ax=o.axis==='z'?'z':'x',il=ax==='x'?0:2,inn=ax==='x'?2:0,ns=ax==='x'?1:-1;
  const w=o.w||1,top=o.h||2.05,hw=w/2+.02,bot=o.y0??K.bot,R=K.rows||7,L0=top-bot;
  const S={kind,K,ax,il,inn,ns,x:o.x,z:o.z,c:ax==='x'?o.z:o.x,l:ax==='x'?o.x:o.z,hw,top,bot,L0,rows:R,seg:L0/(R-1),panels:[],cols:[],
    idle:9,held:null,pushE:0,rayPush:false,rustleT:-9,gF:0,gB:0,baseF:0,baseB:0,baseT:-Math.random()*.5 /* staggered */,mv:0,wc:new Map(),pu:[],npu:0};
  /* which way it faces (L x U): axis x faces +z, axis z faces -x. Rest offsets along it keep overlapping panels and strips apart */
  if(K.strip){ const n=Math.max(3,Math.round(w/K.strip)),sw=2*hw/n;
    for(let j=0;j<n;j++){ S.panels.push({c0:j,nc:1,torn:0,u0:-hw+j*sw,u1:-hw+(j+1)*sw,grid:false}); S.cols.push({j,u:-hw+(j+.5)*sw,rw:sw/2+.012,off:(j%2?1:-1)*.004}); } }
  else { const np=K.panels,pw=2*hw/np,ov=np>1?.03:0;
    for(let p=0;p<np;p++){ const u0=-hw+p*pw-(p?ov:0),u1=-hw+(p+1)*pw+(p<np-1?ov:0); S.panels.push({c0:S.cols.length,nc:K.cols,torn:0,u0,u1,grid:true});
      for(let j=0;j<K.cols;j++) S.cols.push({j:S.cols.length,u:u0+(u1-u0)*j/(K.cols-1),rw:0,off:np>1?(p?1:-1)*.006:0}); } }
  const nc=S.cols.length,n=nc*R; S.n=n; S.P=new Float32Array(n*3); S.Q=new Float32Array(n*3); S.R=new Float32Array(n*3); S.IM=new Float32Array(n); S.pin=new Uint8Array(n);
  for(const c of S.cols) for(let i=0;i<R;i++){ const k=c.j*R+i,q=k*3; S.R[q+il]=S.l+c.u; S.R[q+1]=top-S.seg*i; S.R[q+inn]=S.c+c.off*ns; S.pin[k]=i===0?1:0; S.IM[k]=i===0?0:1; }
  S.P.set(S.R); S.Q.set(S.R);
  /* links: down each column (rigid), across each panel (only resist stretching, so it bunches when pushed aside) */
  const C=[]; for(let j=0;j<nc;j++) for(let i=0;i<R-1;i++) C.push(j*R+i,j*R+i+1,S.seg,0);
  for(const p of S.panels) if(p.grid) for(let j=p.c0;j<p.c0+p.nc-1;j++) for(let i=1;i<R;i++) C.push(j*R+i,(j+1)*R+i,S.cols[j+1].u-S.cols[j].u,1);
  S.C=new Float32Array(C); S.ncs=C.length/4; S.maxTear=Math.max(0,Math.floor((S.seg-.04)/HIDEP.tearLen));
  /* the mesh: both faces (each lit from its own side), positions rewritten while it moves */
  sheetBuildMesh(S); const t=o.tex||HIDE_TEX[kind],mo=o.color?{color:o.color}:{}; S.mF=M(t,mo); S.mB=M(t,mo); /* tex, color: a prop's own cloth */
  S.node=mk(S.g,[S.mF,S.mB],floorN); S.node.live=true;
  const rod=kind==='plastic'?M(tWoodLight,{color:0x8a8070}):M(null,{color:0x2a2622}),ry=ax==='z'?Math.PI/2:0;
  if(o.rod!==false) mk(box(2*hw+.08,.03,.03),rod,floorN,S.x,top+.015,S.z,0,ry,0);
  /* the one box the game sees: eyes only */
  const b=ax==='x'?addBox(S.l-hw,S.l+hw,S.c-.02,S.c+.02,bot,top,'sheet'):addBox(S.c-.02,S.c+.02,S.l-hw,S.l+hw,bot,top,'sheet'); b.sightOnly=true; b.sheet=S; S.box=b; boxGridDirty=true;
  SHEETS.push(S); return S; }
function removeSheet(S){ const i=SHEETS.indexOf(S); if(i>=0) SHEETS.splice(i,1); if(S.box) removeBox(S.box); if(S.node) S.node.vis=false; }
function sheetBuildMesh(S){ const R=S.rows,Nv=S.ax==='x'?[0,0,1]:[-1,0,0]; let V=0; for(const c of S.cols){ c.vb=V; V+=R*(c.rw?2:1); } S.V=V;
  const g=new Geo(); g.temp=true; S.VB=new Float32Array(V*6); sheetFillVB(S); g.P=Array.from(S.VB);
  for(let s=0;s<2;s++) for(let v=0;v<V;v++) g.Nm.push(Nv[0]*(s?-1:1),Nv[1],Nv[2]*(s?-1:1));
  for(let s=0;s<2;s++) for(const c of S.cols) for(let i=0;i<R;i++) for(let e=0;e<(c.rw?2:1);e++){ const u=c.u+(c.rw?(e?c.rw:-c.rw):0); g.T.push((u+S.hw)/(2*S.hw),1-i*S.seg/S.L0); }
  S.TB=new Float32Array(g.T);
  const vi=(j,i,e)=>S.cols[j].vb+i*(S.cols[j].rw?2:1)+e,quad=(bl,br,tr,tl)=>g.I.push(bl,br,tr,bl,tr,tl); /* counter-clockwise seen from the side it faces */
  for(const p of S.panels){ if(p.grid){ for(let j=p.c0;j<p.c0+p.nc-1;j++) for(let i=0;i<R-1;i++) quad(vi(j,i+1,0),vi(j+1,i+1,0),vi(j+1,i,0),vi(j,i,0)); }
    else for(let i=0;i<R-1;i++) quad(vi(p.c0,i+1,0),vi(p.c0,i+1,1),vi(p.c0,i,1),vi(p.c0,i,0)); }
  const nF=g.I.length; S.nF=nF; for(let k=0;k<nF;k+=3) g.I.push(g.I[k]+V,g.I[k+2]+V,g.I[k+1]+V); /* the back face: the same corners the other way round */
  g.groups=[{start:0,count:nF,mi:0},{start:nF,count:nF,mi:1}];
  g.bs={c:[S.x,(S.top+S.bot)/2,S.z],r:Math.max(S.hw,S.L0)+.6}; /* culling: wherever it swings */
  S.g=g; }
function sheetFillVB(S){ const P=S.P,VB=S.VB,R=S.rows,il=S.il;
  for(const c of S.cols) for(let i=0;i<R;i++){ const o=(c.j*R+i)*3;
    if(!c.rw){ const v=(c.vb+i)*3; VB[v]=P[o]; VB[v+1]=P[o+1]; VB[v+2]=P[o+2]; }
    else for(let e=0;e<2;e++){ const v=(c.vb+i*2+e)*3; VB[v]=P[o]; VB[v+1]=P[o+1]; VB[v+2]=P[o+2]; VB[v+il]+=e?c.rw:-c.rw; } }
  VB.copyWithin(S.V*3,0,S.V*3); }
function sheetUpload(S,uv){ const g=S.g; if(!g.vao) return; gl.bindBuffer(gl.ARRAY_BUFFER,g.bufs[uv?2:0]); gl.bufferSubData(gl.ARRAY_BUFFER,0,uv?S.TB:S.VB); }
/* back to hanging straight and whole (a restart) */
function sheetRestore(S){ S.P.set(S.R); S.Q.set(S.R); S.held=null; S.idle=9; S.mv=0; S.gF=S.gB=0; S.wc.clear(); const R=S.rows;
  for(const p of S.panels){ if(!p.torn) continue; p.torn=0; for(let j=p.c0;j<p.c0+p.nc;j++){ S.C[(j*(R-1)+R-2)*4+2]=S.seg; const c=S.cols[j];
    for(let e=0;e<(c.rw?2:1);e++) for(let s=0;s<2;s++) S.TB[(c.vb+(R-1)*(c.rw?2:1)+e+s*S.V)*2+1]=1-(R-1)*S.seg/S.L0; } sheetUpload(S,true); }
  sheetFillVB(S); sheetUpload(S,false); for(const m of [S.mF,S.mB]) m.emis=[0,0,0]; }

/* who's pushing on cloth this frame: Ray's body (a column under his head), his hands in VR, and everyone near */
function hidePushers(B){ const A=HIDE.pool; let n=0; const get=()=>A[n]||(A[n]={cyl:true,x:0,y:0,z:0,r:0,top:0,ray:false});
  let q=get(); q.cyl=true; q.x=B.x; q.z=B.z; q.r=.2; q.top=B.y+.2; q.ray=true; n++; /* to the crown, and a little cloth drapes over it */
  if(B.vr) for(let k=0;k<2;k++) if(B.hOk[k]){ q=get(); q.cyl=false; q.x=B.h[k][0]; q.y=B.h[k][1]; q.z=B.h[k][2]; q.r=.07; q.ray=true; n++; }
  for(const E of enemies){ if(E.dead||n>=30) continue; const up=E.sup===undefined||E.sup>.5; q=get(); q.cyl=true; q.x=E.pos[0]; q.z=E.pos[1]; q.r=up?.22:.3; q.top=up?1.85:.45; q.ray=false; n++; }
  HIDE.np=n; }
function sheetsTick(dt,B){ if(!SHEETS.length) return; hidePushers(B); const A=HIDE.pool,T=HIDE.torch; T.length=0;
  for(const E of enemies){ const t=hideTorch(E); if(t){ t.E=E; T.push(t); } }
  for(const S of SHEETS){ let n=0; S.rayPush=false;
    for(let k=0;k<HIDE.np;k++){ const q=A[k],dn=(S.inn===2?q.z:q.x)-S.c,dl=(S.il===0?q.x:q.z)-S.l;
      if(Math.abs(dn)<q.r+.7&&Math.abs(dl)<S.hw+q.r+.3&&(q.cyl?q.top>S.bot:q.y>S.bot-.1&&q.y<S.top+.1)){ S.pu[n++]=q; if(q.ray&&Math.abs(dn)<q.r+.12) S.rayPush=true; } }
    S.npu=n; if(n||S.held||S.mv>2e-4) S.idle=0; else S.idle+=dt; /* asleep only once nobody touches it and it has stopped swinging */
    if(S.idle<1.5){ sheetStep(S,dt); sheetFillVB(S); sheetUpload(S,false); /* settled: it hangs still and costs nothing */
      if(S.pushE>.015&&GAME.t-S.rustleT>.45){ S.rustleT=GAME.t; hideSnd(S.kind==='plastic'?'crinkle':'rustle',[S.x,1.2,S.z],clamp(S.pushE*6,.12,.7));
        if(S.rayPush&&!PL.dead) noise([PL.x,0,PL.z],HIDEP.rustleR*(PL.crouch?.6:1)); } }
    sheetGlow(S,dt,T); } }
function sheetStep(S,dt){ const P=S.P,Q=S.Q,IM=S.IM,n=S.n,dmp=Math.pow(S.K.damp,dt*60),gy=-9.8*dt*dt,H=S.held;
  let mv=0; for(let i=0;i<n;i++){ if(!IM[i]) continue; const o=i*3; for(let k=0;k<3;k++){ const v=(P[o+k]-Q[o+k])*dmp; Q[o+k]=P[o+k]; P[o+k]+=v; if(v>mv) mv=v; else if(-v>mv) mv=-v; } P[o+1]+=gy; }
  S.mv=mv;
  if(H){ const o=H.i*3; Q[o]=P[o]; Q[o+1]=P[o+1]; Q[o+2]=P[o+2]; P[o]=H.p[0]; P[o+1]=H.p[1]; P[o+2]=H.p[2]; IM[H.i]=0; } /* in his fist */
  let pe=0; const C=S.C,m=S.ncs*4;
  for(let it=0;it<3;it++){
    for(let c=0;c<m;c+=4){ const ia=C[c],ib=C[c+1],a=ia*3,b=ib*3,L=C[c+2],dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2],d=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if(d<1e-6||C[c+3]&&d<=L) continue; const wa=IM[ia],wb=IM[ib],ws=wa+wb; if(!ws) continue; const k=(d-L)/(d*ws);
      P[a]+=dx*k*wa; P[a+1]+=dy*k*wa; P[a+2]+=dz*k*wa; P[b]-=dx*k*wb; P[b+1]-=dy*k*wb; P[b+2]-=dz*k*wb; }
    pe+=sheetCollide(S); }
  if(H) IM[H.i]=S.pin[H.i]?0:1;
  S.pushE=pe; }
function sheetCollide(S){ const P=S.P,IM=S.IM,n=S.n,il=S.il,lo=S.l-S.hw,hi=S.l+S.hw; let pe=0;
  for(let i=0;i<n;i++){ if(!IM[i]) continue; const o=i*3;
    for(let k=0;k<S.npu;k++){ const q=S.pu[k];
      if(q.cyl){ if(P[o+1]>q.top) continue; const dx=P[o]-q.x,dz=P[o+2]-q.z,d2=dx*dx+dz*dz; if(d2>=q.r*q.r) continue; const d=Math.sqrt(d2);
        if(d<1e-4){ const s=(P[o+il]>=(il===0?q.x:q.z))?1:-1; P[o+il]+=s*q.r; pe+=q.r; continue; } /* dead centre: aside, toward the nearer jamb */
        const mv=(q.r-d)/d; P[o]+=dx*mv; P[o+2]+=dz*mv; pe+=q.r-d; }
      else { const dx=P[o]-q.x,dy=P[o+1]-q.y,dz=P[o+2]-q.z,d2=dx*dx+dy*dy+dz*dz; if(d2>=q.r*q.r) continue; const d=Math.sqrt(d2)||1e-4,mv=(q.r-d)/d; P[o]+=dx*mv; P[o+1]+=dy*mv; P[o+2]+=dz*mv; pe+=q.r-d; } }
    if(P[o+il]<lo) P[o+il]=lo; else if(P[o+il]>hi) P[o+il]=hi; /* it bunches against the jambs */
    if(P[o+1]<.01) P[o+1]=.01; }
  return pe; }
/* the glow: a flashlight within glowR behind it and pointed roughly at it lights the cloth from behind, so the side Ray is on glows
   (emissive on that face's material; the lit face gets the beam's own light). A lit room behind it gives a little, steadily */
function sheetGlow(S,dt,T){ let gF=0,gB=0; const cx=S.x,cy=(S.top+S.bot)/2,cz=S.z,P=HIDEP;
  if(Math.abs(cx-PL.x)+Math.abs(cz-PL.z)<18){
    for(const t of T){ const vx=cx-t.o[0],vy=cy-t.o[1],vz=cz-t.o[2],L=Math.sqrt(vx*vx+vy*vy+vz*vz); if(L>P.glowR||L<.05) continue;
      const cs=(vx*t.d[0]+vy*t.d[1]+vz*t.d[2])/L; if(cs<P.glowCos) continue; const side=t.o[S.inn]-S.c; if(Math.abs(side)<.04) continue;
      let e=S.wc.get(t.E); if(!e||GAME.t-e.t>.25){ const p=[cx,cy,cz]; p[S.inn]=S.c+Math.sign(side)*.06; e={t:GAME.t,ok:hideSegClear(t.o,p,true)}; S.wc.set(t.E,e); } if(!e.ok) continue;
      const k=clamp((P.glowR-L)/(P.glowR-P.glowFull),0,1)*clamp((cs-P.glowCos)/(1-P.glowCos)*1.6,0,1);
      if(side*S.ns>0) gB=Math.max(gB,k); else gF=Math.max(gF,k); }
    if(GAME.t-S.baseT>.5){ S.baseT=GAME.t; sheetBaseGlow(S); } gF=Math.max(gF,S.baseF); gB=Math.max(gB,S.baseB); }
  const a=Math.min(1,dt*5); S.gF+=(gF-S.gF)*a; S.gB+=(gB-S.gB)*a; const K=S.K.glow,mF=S.mF.emis,mB=S.mB.emis;
  mF[0]=S.gF*K; mF[1]=S.gF*K*.9; mF[2]=S.gF*K*.72; mB[0]=S.gB*K; mB[1]=S.gB*K*.9; mB[2]=S.gB*K*.72; }
function sheetBaseGlow(S){ S.baseF=S.baseB=0; const cx=S.x,cy=(S.top+S.bot)/2,cz=S.z;
  for(const l of FLOOR.lights||[]){ const c=l[1],p=l[0],s=c[0]+c[1]+c[2]; if(s<.4) continue; const r=Math.min(l[2],4.5),d=Math.hypot(p[0]-cx,p[1]-cy,p[2]-cz); if(d>r) continue;
    const side=p[S.inn]-S.c; if(Math.abs(side)<.05) continue; const q=[cx,cy,cz]; q[S.inn]=S.c+Math.sign(side)*.06; if(!hideSegClear(p,q,true)) continue;
    const k=.35*(1-d/r)*Math.min(1,s/3); if(side*S.ns>0) S.baseB=Math.max(S.baseB,k); else S.baseF=Math.max(S.baseF,k); } }
/* does the line a-b go through cloth? (sightClear) Hanging still: its rectangle, less any torn hem. Moving: the cloth's own
   triangles, so where someone is walking through it there's a gap round him (he can see out, and be seen) */
function sheetsBlock(a,b){ for(let s=0;s<SHEETS.length;s++){ const S=SHEETS[s],inn=S.inn,il=S.il,da=a[inn]-S.c,db=b[inn]-S.c;
    if(S.idle>=1.5){ if(da*db>0||da===db) continue;
      const t=da/(da-db),u=a[il]+(b[il]-a[il])*t-S.l,y=a[1]+(b[1]-a[1])*t; if(u<-S.hw||u>S.hw||y>S.top) continue;
      for(const p of S.panels) if(u>=p.u0&&u<=p.u1&&y>=S.bot+p.torn*HIDEP.tearLen) return true; continue; }
    const r=S.L0+.3; if(Math.min(da,db)>r||Math.max(da,db)<-r) continue; /* the line never comes near where it can swing */
    const la=a[il]-S.l,lb=b[il]-S.l; if(Math.min(la,lb)>S.hw+.1||Math.max(la,lb)<-S.hw-.1||Math.min(a[1],b[1])>S.top+.05) continue;
    if(sheetHitTris(S,a,b)) return true; } return false; }
function sheetHitTris(S,a,b){ const V=S.VB,I=S.g.I,dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
  for(let k=0;k<S.nF;k+=3){ const i0=I[k]*3,i1=I[k+1]*3,i2=I[k+2]*3; /* segment against a triangle (Moller-Trumbore) */
    const e1x=V[i1]-V[i0],e1y=V[i1+1]-V[i0+1],e1z=V[i1+2]-V[i0+2],e2x=V[i2]-V[i0],e2y=V[i2+1]-V[i0+1],e2z=V[i2+2]-V[i0+2];
    const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x,det=e1x*px+e1y*py+e1z*pz; if(det>-1e-9&&det<1e-9) continue; const inv=1/det;
    const tx=a[0]-V[i0],ty=a[1]-V[i0+1],tz=a[2]-V[i0+2],u=(tx*px+ty*py+tz*pz)*inv; if(u<0||u>1) continue;
    const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(dx*qx+dy*qy+dz*qz)*inv; if(v<0||u+v>1) continue;
    const t=(e2x*qx+e2y*qy+e2z*qz)*inv; if(t>=0&&t<=1) return true; }
  return false; }

/* ---------- hands on the cloth (VR): grip to hold it aside, pull down hard to tear a strip off ---------- */
function sheetNearest(p,r){ let best=null,bd=r*r;
  for(const S of SHEETS){ if(Math.abs(p[0]-S.x)>S.hw+1.5||Math.abs(p[2]-S.z)>S.hw+1.5) continue; const P=S.P;
    for(let i=0;i<S.n;i++){ const o=i*3,dx=P[o]-p[0],dy=P[o+1]-p[1],dz=P[o+2]-p[2],d=dx*dx+dy*dy+dz*dz; if(d<bd){ bd=d; best={S,i}; } } } return best; }
function sheetPanelOf(S,i){ const j=Math.floor(i/S.rows); return S.panels.findIndex(p=>j>=p.c0&&j<p.c0+p.nc); }
function sheetGrab(h,S,i,p,B){ S.held={i,h,p:p.slice(),rel0:p[1]-B.y}; h._sh=S; S.idle=0; if(XR.on) buzz(h.hand,.2,25); hideSnd(S.kind==='plastic'?'crinkle':'rustle',p,.3); }
function sheetRelease(h){ const S=h._sh; if(S&&S.held&&S.held.h===h) S.held=null; h._sh=null; }
/* the pull is measured against his head, so holding a sheet aside and then crouching to hide doesn't tear it: a yank down
   (tearPull below where the hand was, relative to the head; or half that, fast) does */
function sheetHandsTick(B){ if(!XR.on||!SHEETS.length) return;
  for(const h of [HANDS.L,HANDS.R]){ const gp=h.src&&h.src.gamepad,pr=!!(gp&&gp.buttons[1]&&gp.buttons[1].pressed),edge=pr&&!h._hgp; h._hgp=pr;
    const busy=!!(h.item||h.grab||h.stuck||h.supportOf||h._op); /* h._op: a drawer or door handle in it (87b-openables.js) */
    if(h._sh){ const S=h._sh; if(!pr||busy||!S.held) sheetRelease(h); else { const p=mulP(h.M,FIST),o=S.held.i*3; S.held.p=p; S.idle=0;
        const pull=S.held.rel0-(p[1]-B.y); /* metres the hand has come down, head-relative */
        if(Math.hypot(p[0]-S.R[o],p[1]-S.R[o+1],p[2]-S.R[o+2])>S.L0+.5) sheetRelease(h); /* walked off still holding it: it slips out of the hand */
        else if(S.K.tear&&(pull>HIDEP.tearPull||pull>HIDEP.tearPull/2&&h.vel&&h.vel[1]<-HIDEP.tearSpd)) sheetTear(S,sheetPanelOf(S,S.held.i),h); } }
    else if(edge&&!busy&&!h._hbusy){ const p=mulP(h.M,FIST),hit=sheetNearest(p,.2); if(hit) sheetGrab(h,hit.S,hit.i,p,B); } /* the same press that dropped a gun doesn't grab */
    h._hbusy=busy; } }
/* a strip off the bottom of a panel: the hem rises, the strip goes to the hand (80-ray.js giveStrip, for a bandage) */
function sheetTear(S,pi,h){ const p=S.panels[pi]; if(!p||!S.K.tear||p.torn>=S.maxTear){ if(h) sheetRelease(h); return false; }
  /* the strip goes to a hand first (80-ray.js giveStrip: that hand or the free one; false if both are full, and then nothing tears).
     It makes the rip and the noise; without it, this does */
  if(typeof giveStrip==='function'){ let got=false; try{ got=giveStrip(h||HANDS.L)!==false; }catch(e){ console.error(e); } if(!got){ if(h) sheetRelease(h); return false; } }
  else { hideSnd('rip',h&&h.M?mulP(h.M,FIST):[S.x,1.1,S.z],.7); noise([PL.x,0,PL.z],2.5); }
  p.torn++; const R=S.rows,last=Math.max(.04,S.seg-p.torn*HIDEP.tearLen),v=1-(S.seg*(R-2)+last)/S.L0;
  for(let j=p.c0;j<p.c0+p.nc;j++){ S.C[(j*(R-1)+R-2)*4+2]=last; const c=S.cols[j];
    for(let e=0;e<(c.rw?2:1);e++) for(let s=0;s<2;s++) S.TB[(c.vb+(R-1)*(c.rw?2:1)+e+s*S.V)*2+1]=v; }
  sheetUpload(S,true); S.idle=0; if(h&&XR.on) buzz(h.hand,.8,70);
  protoEmit('sheetTear',S,h); if(h) sheetRelease(h); return true; }
/* keyboard: B tears a strip off the nearest sheet within reach (the strip goes to the left hand) */
function hideFlatTear(){ let best=null,bd=1.4; for(const S of SHEETS){ if(!S.K.tear) continue; const d=Math.hypot(S.x-PL.x,S.z-PL.z); if(d<bd){ bd=d; best=S; } } if(!best) return false;
  let pi=-1,pd=1e9; best.panels.forEach((p,k)=>{ const d=Math.abs((best.il===0?PL.x:PL.z)-(best.l+(p.u0+p.u1)/2)); if(p.torn<best.maxTear&&d<pd){ pd=d; pi=k; } });
  return pi>=0&&sheetTear(best,pi,null); }

/* cloth sounds, through the same room and walls as everything else (57-acoustics.js) */
function hideSnd(kind,pos,vol=1){ const ac=GAME.started&&typeof audio==='function'?audio():null; if(!ac||!NOISE) return; const t=ac.currentTime,out=ac.createGain(),bus=audioBus(ac); out.gain.value=vol;
  if(pos){ const S=spatial(ac,pos,bus.inp); out.connect(S.input); } else out.connect(bus.inp);
  const nz=(f0,f1,dur,g,q,type,d)=>{ const t0=t+d,s=ac.createBufferSource(); s.buffer=NOISE; const fl=ac.createBiquadFilter(); fl.type=type; fl.Q.value=q; fl.frequency.setValueAtTime(f0,t0); fl.frequency.exponentialRampToValueAtTime(f1,t0+dur);
    const gg=ac.createGain(); gg.gain.setValueAtTime(.0001,t0); gg.gain.linearRampToValueAtTime(g,t0+dur*.25); gg.gain.exponentialRampToValueAtTime(.001,t0+dur); s.connect(fl); fl.connect(gg); gg.connect(out); s.start(t0,Math.random()*.6); s.stop(t0+dur+.02); };
  if(kind==='rustle'){ nz(2200,900,.34,.35,.8,'bandpass',0); nz(5200,3000,.22,.1,1.2,'bandpass',.05); }
  else if(kind==='crinkle'){ for(let i=0;i<5;i++) nz(rnd(3500,7000),rnd(2500,4000),rnd(.03,.07),.22,3,'bandpass',i*rnd(.03,.07)); nz(1500,800,.25,.1,.7,'bandpass',0); }
  else if(kind==='rip'){ nz(3000,1400,.3,.9,1.4,'bandpass',0); nz(6500,4000,.22,.4,2,'bandpass',.02); nz(900,500,.32,.3,.7,'lowpass',0); }
  setTimeout(()=>{ try{ out.disconnect(); }catch(_){} },1500); }

/* ---------- ?hidetest=1: on the old floor 01, in the dark bedroom off the corridor by the start ---------- */
/* an axis-aligned collision box from a box in an object's own frame (yaw in quarter turns) */
function hideLocalBox(x,z,yaw,lx0,lx1,lz0,lz1,y0,h,kind){ const c=Math.cos(yaw),s=Math.sin(yaw); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const [lx,lz] of [[lx0,lz0],[lx1,lz0],[lx0,lz1],[lx1,lz1]]){ const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz; x0=Math.min(x0,wx); x1=Math.max(x1,wx); z0=Math.min(z0,wz); z1=Math.max(z1,wz); }
  return kind?addBox(x0,x1,z0,z1,y0,h,kind):{x0,x1,z0,z1,y0,h}; }
/* new furniture on a built floor: the walkers' grid has to know (the same margin the builders use) */
function hideNavBlock(list){ const nav=FLOOR.nav; if(!nav) return;
  for(const b of list){ if(b.y0>1.5||b.h<.25) continue; for(let k=0;k<NZ;k++){ const z=cellZ(k); if(z<=b.z0-.22||z>=b.z1+.22) continue; for(let i=0;i<NX;i++){ const x=cellX(i); if(x>b.x0-.22&&x<b.x1+.22) nav[k*NX+i]=1; } } }
  navDirty=true; }
/* a prop's curtain (87-props.js: wardrobe, closet, tub) as a live sheet: its baked pleats are hidden and a sheet in the same cloth
   hangs where they were, so it swings, parts, glows and tears like the doorways. S: what prop() or propPlace() returned (propPlace's
   sight-only box for the curtain is taken out: the sheet is its own). x, z, yaw: where the prop went. o.kind: the cloth's physics */
function hideLiveCurtain(S,x,z,yaw,o={}){ const cn=S&&S.curtain; if(!cn||!cn.mesh) return null; const P=cn.mesh.geo.P; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(let i=0;i<P.length;i+=3){ x0=Math.min(x0,P[i]); x1=Math.max(x1,P[i]); y0=Math.min(y0,P[i+1]); y1=Math.max(y1,P[i+1]); }
  const lx=cn.p[0]+(x0+x1)/2,lz=cn.p[2],c=Math.cos(yaw),sn=Math.sin(yaw),m=cn.mesh.mats[0]||{};
  cn.vis=false; if(S.boxes) for(const b of S.boxes.slice()) if(b.sightOnly){ removeBox(b); S.boxes.splice(S.boxes.indexOf(b),1); } S.sight=[];
  return addSheet({x:x+lx*c+lz*sn,z:z-lx*sn+lz*c,axis:Math.abs(c)>.5?'x':'z',w:x1-x0,h:cn.p[1]+y1,y0:Math.max(.02,cn.p[1]+y0),kind:o.kind||'blanket',tex:m.tex,color:m.color,rod:false}); }
/* the props agent's furniture, when it's there (87-props.js): its solids, sight boxes, hiding spots, and its curtain made live */
function hideTryProp(kind,x,z,yaw){ if(typeof prop!=='function') return false; try{ const r=prop(kind,floorN,x,z,yaw,{liveCurtain:true}); if(!r||!r.node) return false;
    if(r.curtain) hideLiveCurtain(r,x,z,yaw);
    const s=(r.solids||[]).map(b=>addBox(b.x0,b.x1,b.z0,b.z1,b.y0||0,b.h,b.kind||'furn')); hideNavBlock(s);
    for(const b of r.sight||[]){ const bb=addBox(b.x0,b.x1,b.z0,b.z1,b.y0,b.h,'sheet'); bb.sightOnly=true; } boxGridDirty=true;
    for(const h of r.hides||[]) addHideSpot(Object.assign({id:'test-'+kind},h)); return true; }
  catch(e){ console.error('[hide] prop',kind,e); return false; } }
function hideTestBed(x,z,yaw){ if(hideTryProp('bed',x,z,yaw+Math.PI/2)) return; /* the props agent's beds run along their own z; this one along its x */
  const W=2.0,D=1.0,UY=.3,g=N(floorN,x,0,z,0,yaw,0),wd=M(tWood),bl=M(tHideBlanket),mt=M(tMattress);
  for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.06,UY,.06,{at:[0,UY/2,0]}),wd,g,sx*(W/2-.04),0,sz*(D/2-.04));
  for(const sz of [-1,1]) mk(box(W,.12,.04),wd,g,0,UY+.06,sz*(D/2-.02)); mk(box(.04,.12,D),wd,g,W/2-.02,UY+.06,0);
  mk(box(W-.06,.02,D-.06),M(null,{color:0x1e1712}),g,0,UY+.01,0); /* the slats: what you look at from under it */
  mk(box(W-.06,.18,D-.06,{at:[0,.09,0]}),F(mt,mt,mt,M(tMattress,{repeat:[2,2]})),g,0,UY+.02,0); mk(box(.5,.09,.38),M(tWhite),g,-W/2+.35,UY+.25,0);
  mk(box(1.25,.03,D+.04),bl,g,.3,UY+.215,0); mk(box(1.25,UY+.08,.02,{at:[0,-(UY+.08)/2,0]}),bl,g,.3,UY+.215,D/2+.02); /* the blanket, slid off the wall side nearly to the floor */
  mk(box(.06,.85,D+.04,{at:[0,.425,0]}),wd,g,-W/2-.03,0,0); /* headboard */
  hideNavBlock([hideLocalBox(x,z,yaw,-W/2,W/2,-D/2,D/2,UY,UY+.22,'furn'),hideLocalBox(x,z,yaw,-W/2-.06,-W/2,-D/2-.02,D/2+.02,0,.85,'furn')]);
  addHideSpot({id:'test-bed',kind:'bed',x,z,yaw,w:W-.1,d:D-.1,h:UY}); }
function hideTestWardrobe(x,z,yaw){ if(hideTryProp('wardrobe',x,z,yaw)) return;
  const W=1.1,D=.8,H=1.95,T=.04,g=N(floorN,x,0,z,0,yaw,0),wd=M(tWood),dw=M(tDoorWood),sn=Math.sin(yaw),cs=Math.cos(yaw);
  mk(box(W,H,T,{at:[0,H/2,0]}),wd,g,0,0,-D/2+T/2); for(const s of [-1,1]) mk(box(T,H,D,{at:[0,H/2,0]}),F(dw,wd),g,s*(W/2-T/2),0,0);
  mk(box(W,T,D),wd,g,0,H-T/2,0); mk(box(W,.08,D,{at:[0,.04,0]}),wd,g,0,0,0); mk(box(W-.1,.012,.012),mSteel,g,0,1.72,-.08); /* the rail */
  for(const [u,c] of [[-.38,0x3a3f4a],[.4,0x5a4a3a]]) mk(box(.3,.8,.05,{at:[0,-.4,0]}),M(null,{color:c}),g,u,1.7,-.12); /* two old coats pushed to the ends */
  for(const y of [.4,1.5]) mk(box(.03,.12,.03),mSteel,g,-W/2+.02,y,D/2-.02); /* where the door hung: the hinges are still on */
  const s=[hideLocalBox(x,z,yaw,-W/2,W/2,-D/2,-D/2+T,0,H,'furn'),hideLocalBox(x,z,yaw,-W/2,-W/2+T,-D/2,D/2,0,H,'furn'),hideLocalBox(x,z,yaw,W/2-T,W/2,-D/2,D/2,0,H,'furn')];
  hideNavBlock(s.concat([hideLocalBox(x,z,yaw,-W/2,W/2,-D/2,D/2,0,H)])); /* nobody walks in by accident: a searcher looks in on purpose */
  addHideSpot({id:'test-wardrobe',kind:'wardrobe',x:x+sn*T/2,z:z+cs*T/2,yaw,w:W-2*T,d:D-T,h:H-T-.02,open:'+z'});
  addSheet({x:x+sn*(D/2+.01),z:z+cs*(D/2+.01),axis:Math.abs(sn)>.5?'z':'x',w:W-2*T,h:H-.08,kind:'blanket'}); /* a blanket on a cord over the front */ }
function hideTestBuild(){ const prev=GEO_TEMP; GEO_TEMP=true;
  try{ hideFloorCheck();
    hideTestBed(-8.85,-2.15,0);                     /* along the corridor wall, headboard to the west: crawl in from the room side */
    hideTestWardrobe(-4.67,-2.3,-Math.PI/2);        /* against the east wall, open to the west */
    addSheet({x:-7.0,z:-1,axis:'x',w:1.0,h:2.1,kind:'sheet'});   /* the bedroom doorway: Tito walks through it */
    addSheet({x:-3.0,z:1,axis:'x',w:1.0,h:2.1,kind:'plastic'});  /* the squat across the corridor: so does he */
  } finally { GEO_TEMP=prev; } }
/* the readout: what the system thinks, top left (and a toast in VR when it changes) */
function hideHud(){ if(!HIDE.test||!GAME.started) return; const S=PL.hide,e=PL.hideExp,lvl=!S?'':e<.1?'hidden':e<.9?'partly showing':'showing';
  const key=(S?S.kind+': '+lvl:'not hidden')+(PL.crawl?' · crawling':PL.crouch?' · crouched':'')+(PL.mouthCovered?' · hand over mouth':'');
  if(!HIDE.hud){ HIDE.hud=document.createElement('div'); HIDE.hud.style.cssText='position:fixed;left:8px;top:8px;z-index:60;font:600 13px "IBM Plex Mono",monospace;color:#e2a33d;background:rgba(0,0,0,.62);padding:4px 8px;pointer-events:none;white-space:pre'; document.body.appendChild(HIDE.hud); }
  const txt=key+(S?' ('+Math.round(e*100)+'% showing)':''); if(HIDE.hud._t!==txt){ HIDE.hud._t=txt; HIDE.hud.textContent=txt; }
  if(key!==HIDE.hudKey){ HIDE.hudKey=key; if(XR.on) vrToast(key,1.6); } }

/* ---------- wiring ---------- */
function hideFrame(dt){ dt=Math.min(dt,.05); let B=hideBody(); hideCrouchTick(dt,B); hideFlatSpeed(); B=hideBody();
  hideSpotTick(dt,B); hideMouthTick(B); hideSaveTick(B); sheetsTick(dt,B); sheetHandsTick(B); hideHud(); }
function hideReset(){ if(!PROTO.on) return; const fresh=hideFresh(); if(fresh){ HIDES.length=0; SHEETS.length=0; }
  PL.hide=null; PL.hideExp=1; PL.crawl=false; HIDE.crawlD=0; HIDE.low=0; HIDE.passers.clear(); HIDE.soundT=-99; HIDE.sp=null; HIDE.lx=null;
  PL.dropY=PL.crouchT?(hideIsVR()?HIDE.togOff:1.62-HIDEP.flatEye):0; for(const k in HIDE_KIND_SAVES) delete HIDE_KIND_SAVES[k];
  for(const S of HIDES){ S.saves=0; S.probes=0; S.caught=0; S.entered=0; } for(const S of SHEETS) sheetRestore(S);
  for(const h of [HANDS.L,HANDS.R]){ h._sh=null; }
  if(fresh&&HIDE.test&&FLOOR.mode==='camp'&&FLOOR.idx===1) hideTestBuild(); }
protoOn('tick',(gdt,dt)=>{ if(!PROTO.on) return; const t0=performance.now(); hideFrame(dt); const c=performance.now()-t0; HIDE.cost=HIDE.cost?HIDE.cost*.97+c*.03:c; });
protoOn('reset',hideReset);
/* a sound Ray made (anything at his feet that isn't someone else's): it gives his spot away for a moment */
protoOn('noise',(src,rad,o)=>{ if(!PROTO.on||o&&o.from) return; if(Math.hypot(src[0]-PL.x,src[2]-PL.z)>.8) return; HIDE.soundT=GAME.t; HIDE.soundR=rad; });
addEventListener('keydown',e=>{ if(!PROTO.on||!GAME.started||e.repeat||PL.dead) return; if(e.code==='KeyC') hideCrouchToggle(); else if(e.code==='KeyB') hideFlatTear(); });
