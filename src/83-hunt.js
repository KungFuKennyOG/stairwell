/* =====================================================================
   THE HUNT (prototype, ?proto=1): how the men notice Ray, look for him, and remember.
   One controller for the floor, three states:
     calm     routines. A noise, or a man half-sure he saw something, sends ONE man to look (8-12 s), then he goes back.
              Two of those inside a minute and they start hunting.
     hunting  a sighting, a body, a gunshot, a scream. Pairs with a flashlight work out from where he was last known (HUNT.lkp):
              a coarse grid over the floor, filling outward from that point at walking speed, emptied wherever a light has been.
              Each pair checks two or three hiding spots near it. 75 s the first time, 30 s longer each time after (150 s at most).
     edge     the rest of the floor once a hunt has ended: everyone armed, short loops through the rooms, quicker eyes.
              For 30-45 s after a hunt nothing starts another one unless he's actually seen (a breather).
   Eyes: a meter per man (E.pm) that fills while he can see Ray and drains at half speed when he can't. While it fills he stops,
   turns his head and says something. Ears: radii halved per wall, a gunshot carries the whole floor.
   Contract (PROTO_BRIEF.md 6): HUNT {state,lkp,lkpT,n,breatherT}, huntAlert(reason,pos,strength), events huntStart(reason)/huntEnd().
   More events: huntState(state), hideFound(E,spot). Hooks for others: huntBeamOn(E), huntBeamDir(E) (where a man's flashlight points),
   huntLitAt(x,z) (Ray's pool-of-light rule). ?huntdbg=1 logs the states and shows them on the flat screen (never in VR).
   ===================================================================== */
PROTO.hunt={
  tCalm:1.5,tEdge:1.0,tHunt:.6,tClose:.4,closeD:2,peekK:3,litRange:24,darkD:2,darkEdgeD:3, /* the meter: seconds to full */
  hear:{crouch:1,walk:3,run:8,sup:10,shot:40,eshot:40,fall:8,glass:15,beg:12,scream:20,talk:4,shout:15},runV:1.9,
  len0:75,lenAdd:30,lenMax:150,breath:[30,45],refresh:30, /* a hunt's length; a sighting late in a hunt keeps it going at least this long */
  look:[8,12],evWin:60,evGap:8,sameR:6,                   /* calm: how long a look lasts; two incidents inside evWin s start a hunt */
  pairs:2,cell:2,r0:2.5,spread:1,clrHold:6,clrRecover:25,  /* the search grid */
  spotR:8,spotsPer:[2,3],steerD:6,steerEvery:10,steerProbe:.35,
  torchR:8.5,torchCos:.85,hunters:2,push:[20,30] };
const HUNT={state:'calm',lkp:null,lkpT:0,n:0,breatherT:0,t:0,len:0,t0:0,reason:'',ev:[],lastEvT:-99,body:false,pairs:[],grid:null,
  saves:{},seenIn:null,lastSeen:null,lastSight:-99,pending:null,checked:new Map(),nid:0,log:[],steerT:-99,flashT:-99,fireK:null,
  eShotT:-99,fightT:0,pushAt:25,bloodT:-99,bloodSaid:new Set(),limpSaid:false,acc:0,dbg:new URLSearchParams(location.search).get('huntdbg')==='1'};
if(PROTO.on){ for(const k in GUN_LOUD) GUN_LOUD[k]=PROTO.hunt.hear.shot; for(const k in GUN_SUP) GUN_SUP[k]=PROTO.hunt.hear.sup; } /* the tables other code reads */

const HL_={
  who:['Who\'s there?','...hello?','Hey—','Somebody there?'],
  start:['Find him!','Spread out. Lights on.','He\'s here somewhere.','Two and two. Go.'],
  gone:['He\'s gone... stay sharp.'],
  hall:'He\'s in the hall!',room:n=>`He's in the ${n}!`,
  blood:'There\'s blood here.',limp:'He\'s limping.',
  spot:{bed:'Check under the bed.',tub:'Check the bathroom.',wardrobe:'Check the wardrobe.',closet:'Check the closet.',sheets:'Behind the sheet—',
    sofa:'Behind the couch.',mattress:'Check the mattresses.',corner:'Check that corner.'},
  nothing:['Nothing.','Clear.','Not here.'],caught:['There you are.','Got you—','Out. OUT!'],
  push:['Go! All of us— GO!','Together— now!','Push him!'],
  patrol:['Stay sharp.','...cop?','I know you\'re here.','Keep your eyes open.'] };

function huntLog(ev,o){ const r=Object.assign({t:+GAME.t.toFixed(1),ev},o||{}); HUNT.log.push(r); if(HUNT.log.length>300) HUNT.log.shift(); if(HUNT.dbg) console.log('[hunt]',JSON.stringify(r)); }
function huntSetState(s){ if(HUNT.state===s) return; HUNT.state=s; huntLog('state',{s}); protoEmit('huntState',s); for(const E of enemies) if(!E.dead&&!E.civ&&E.st==='idle') E.st='alert'; } /* every change wakes the floor (no one stays dormant through it) */

/* ---------- lines through the level, walking the 1 m box buckets instead of every box on the floor ----------
   sight: the same boxes sightClear() stops at (walls, doors, anything over 1.5 m, and hung sheets). count: how many walls a sound
   passes through at 1.2 m (sheets and plastic don't stop sound; chunks of one wall touching each other count once) */
let HUNT_STAMP=0;
function huntLine(a,b,count){ if(boxGridDirty) buildBoxGrid(); const st=++HUNT_STAMP,ox=a[0],oy=a[1],oz=a[2],dx=b[0]-ox,dy=b[1]-oy,dz=b[2]-oz,L=Math.hypot(dx,dy,dz);
  if(L<1e-3) return count?0:true; const u=[dx/L,dy/L,dz/L],o=[ox,oy,oz];
  let i=Math.floor(ox+RX),k=Math.floor(oz+RZ); const ie=Math.floor(b[0]+RX),ke=Math.floor(b[2]+RZ),si=dx>0?1:dx<0?-1:0,sk=dz>0?1:dz<0?-1:0;
  let tMx=si?((si>0?i+1:i)-(ox+RX))/u[0]:1e9,tMz=sk?((sk>0?k+1:k)-(oz+RZ))/u[2]:1e9; const tDx=si?Math.abs(1/u[0]):1e9,tDz=sk?Math.abs(1/u[2]):1e9;
  let T=null;
  for(let g=0;g<400;g++){
    if(i>=0&&k>=0&&i<BG_W&&k<BG_H) for(const bx of boxGrid[k*BG_W+i]){ if(bx._hs===st) continue; bx._hs=st;
      if(count?!((bx.kind==='wall'||bx.kind==='door')&&!bx.sightOnly&&bx.y0<=1.2&&bx.h>=1.2):!(bx.kind==='wall'||bx.kind==='door'||bx.h>1.5||bx.sightOnly)) continue;
      let t0=0,t1=L,ok=true,ent=false; const lo=[bx.x0,bx.y0,bx.z0],hi=[bx.x1,bx.h,bx.z1];
      for(let q=0;q<3;q++){ if(Math.abs(u[q])<1e-9){ if(o[q]<lo[q]||o[q]>hi[q]){ ok=false; break; } continue; }
        let ta=(lo[q]-o[q])/u[q],tb=(hi[q]-o[q])/u[q]; if(ta>tb){ const s_=ta; ta=tb; tb=s_; } if(ta>t0){ t0=ta; ent=true; } if(tb<t1) t1=tb; if(t0>t1){ ok=false; break; } }
      if(!ok||!ent) continue; /* starting inside a box doesn't count (as in rayBoxes) */
      if(!count) return false; if(t0>.05&&t0<L-.05) (T||(T=[])).push(t0); }
    if(i===ie&&k===ke) break;
    if(tMx<tMz){ if(tMx>L) break; i+=si; tMx+=tDx; } else { if(tMz>L) break; k+=sk; tMz+=tDz; } }
  if(!count) return true; if(!T) return 0; if(T.length<2) return T.length; T.sort((p,q)=>p-q); let n=1; for(let j=1;j<T.length;j++) if(T[j]-T[j-1]>.35) n++; return n; }
const huntSees=(a,b)=>huntLine(a,b,false);

/* ---------- light: is Ray lit for this man ---------- */
/* a pool of light: the floor's lit lamps (same rule the old floors use) */
function huntLitAt(x,z,y=1.3){ for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0];
    if(Math.hypot(p[0]-x,p[2]-z)<l[2]*.45&&huntSees([p[0],Math.max(p[1],1.2),p[2]],[x,y,z])) return true; } return false; }
const huntBeamOn=E=>!!E.torchOn&&!E.dead&&upright(E);
function huntBeamDir(E){ const a=E.hd+(E.lookYaw||0)*.8; return [Math.sin(a),Math.cos(a)]; } /* the flashlight is in his hand: it goes where his head goes, mostly */
function huntInBeam(E,x,z,y=1){ const dx=x-E.pos[0],dz=z-E.pos[1],d=Math.hypot(dx,dz); if(d>PROTO.hunt.torchR) return false; if(d<.3) return true;
  const b=huntBeamDir(E); if((b[0]*dx+b[1]*dz)/d<PROTO.hunt.torchCos) return false; return huntSees([E.pos[0],1.25,E.pos[1]],[x,y,z]); }
/* once per sight period for everyone: Ray under a lamp, Ray in somebody's beam */
const HL={t:-9,lit:false,beam:null};
function huntRayLight(){ if(Math.abs(GAME.t-HL.t)<.1) return HL; HL.t=GAME.t; const e=camBasis().eye; HL.lit=huntLitAt(PL.x,PL.z,e[1]-.3); HL.beam=null;
  for(const E of enemies) if(huntBeamOn(E)&&huntInBeam(E,PL.x,PL.z,e[1]-.35)){ HL.beam=E; break; } return HL; }
/* against the light: a lit doorway or room behind Ray, seen from this man */
function huntSilhouette(he){ const dx=PL.x-he[0],dz=PL.z-he[2],d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;
  for(const k of [1.2,2.8]){ const bx=PL.x+ux*k,bz=PL.z+uz*k; let lit=huntLitAt(bx,bz,1.2);
    if(!lit&&typeof pfRoomAt==='function'){ const r=pfRoomAt(bx,bz); lit=!!(r&&r.lit); }
    if(lit&&huntSees([PL.x,1.2,PL.z],[bx,1.2,bz])) return true; } return false; }
const huntMood=E=>HUNT.state==='hunting'?'hunting':HUNT.state==='edge'||E.hunter||E.mind==='nervous'||E.mind==='search'||E.mind==='sweep'?'edge':'calm'; /* a man gone to look keeps the floor's timing */
const huntLook=E=>E.hd+(E.lookYaw||0)*.7;

/* ---------- eyes (from senses(), five times a second): can he see Ray at all, and how much of him ---------- */
function huntSight(E,dist,B){ const P=PROTO.hunt; E.hLos=0; E.hLit=false; if(dist>P.litRange+1) return false;
  const he=X_(B,PI_.head),eye=camBasis().eye,ch=[PL.x,eye[1]-.45,PL.z];
  const cv=huntSees(he,ch),hv=cv||huntSees(he,eye); E.hLos=cv?2:hv?1:0; if(!E.hLos) return false; /* 1: only his head shows past the edge */
  E.hConc=typeof rayConcealment==='function'?clamp(+rayConcealment(E)||0,0,1):1; if(E.hConc<=0) return false;
  const L_=huntRayLight(); let lit=L_.lit||!!L_.beam||GAME.t-HUNT.flashT<1.4&&dist<16; /* under a lamp, in a beam, or lit by his own muzzle flash */
  if(!lit&&dist>P.darkD&&dist<P.litRange) lit=huntSilhouette(he); E.hLit=lit; if(lit) return dist<P.litRange;
  const lk=huntLook(E),facing=((PL.x-E.pos[0])*Math.sin(lk)+(PL.z-E.pos[1])*Math.cos(lk))/(dist||1);
  return dist<(huntMood(E)!=='calm'&&facing>.9?P.darkEdgeD:P.darkD); } /* in the dark: a shape right in front of him, nothing more */

/* the meter, every frame for a man who doesn't know yet. True: full, he's seen you */
function huntPerceive(E,dt,dist,toP){ const P=PROTO.hunt,mood=huntMood(E),Tb=mood==='hunting'?P.tHunt:mood==='edge'?P.tEdge:P.tCalm; let rate=0;
  if(E.canSee){ const lk=huntLook(E),facing=(toP[0]*Math.sin(lk)+toP[1]*Math.cos(lk))/(dist||1),cone=mood==='calm'?.45:.2;
    if(dist<.45||dist<1.1&&facing>-.2||facing>cone){
      const T=dist<=P.closeD?P.tClose:Tb*(1+Math.max(0,dist-6)/6)*(facing>.7?1:1.8)*(E.hLos===1?P.peekK:1)*(E.hLit?1:1.3);
      rate=(E.hConc??1)/T; } }
  const was=E.pm||0; E.pm=rate>0?Math.min(1,was+rate*dt):Math.max(0,was-dt/(2*Tb)); E.pmUp=rate>0;
  if(rate>0){ HUNT.lastSeen={t:GAME.t,x:PL.x,z:PL.z,E}; if(!E.civ&&was<.5&&E.pm>=.5&&E.pm<1) huntAlert('glimpse',[PL.x,PL.z],.5,E); }
  if(E.pm<=0) E.hWho=false;
  return E.pm>=1; }

/* he's seen you: he says where, and the floor knows */
function huntWhere(){ if(typeof pfRoomAt==='function'){ const r=pfRoomAt(PL.x,PL.z); if(r&&r.name) return /hall|corridor|landing|stair/i.test(r.name)?HL_.hall:HL_.room(String(r.name).toLowerCase()); }
  if(FLOOR.mode==='camp'&&FLOOR.space){ const c=navCell(PL.x,PL.z); if(c>=0&&(FLOOR.space[c]===-1||FLOOR.space[c]===-2)) return HL_.hall; } return null; }
function huntSpotted(E){ const w=huntWhere(); if(w&&!(E.concealed&&!E.wpnHeld)){ bark(E,w,1.8); GAME.barkGlobal=Math.max(GAME.barkGlobal,1); }
  huntLog('spotted',{by:E.name,d:+Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z).toFixed(1),lit:!!E.hLit,peek:E.hLos===1}); huntAlert('seen',[PL.x,PL.z],1,E); }
/* a body on the floor in the dark: he has to be close, or have a light on it */
function huntBodyLit(E,op,d){ return d<3||huntLitAt(op[0],op[2],.5)||enemies.some(T=>huntBeamOn(T)&&huntInBeam(T,op[0],op[2],.3)); }

/* ---------- ears ---------- */
function huntWalls(ax,az,bx,bz){ return huntLine([ax,1.2,az],[bx,1.2,bz],true); } /* walls between two points, at the height a voice carries */
/* what made the sound, for callers that don't say */
function huntNoiseKind(src,rad,o){ if(o.kind) return o.kind;
  if(HUNT.fireK&&!o.from){ const k=HUNT.fireK; HUNT.fireK=null; return k; } /* the 'fire' event just before fireHand's noise */
  const F=o.from;
  if(F){ if(F.civ) return 'scream'; if(F.st==='down'||F.st==='kneel') return 'beg'; if(rad>=13) return 'eshot'; if(o.alarm&&rad>=9) return 'scream'; return o.alarm?'call':'bodycall'; }
  if(o.voice) return o.alarm?'shout':'talk';
  if(o.alarm) return rad>=9.5&&rad<=10.5?'glass':'alarm';
  return 'thing'; }
/* noise() in the prototype: the radius by kind, halved per wall (a gunshot carries the whole floor; walls only blur where it came from) */
function huntNoise(src,rad0,o,hush){ const P=PROTO.hunt,kind=huntNoiseKind(src,rad0,o),rad=(P.hear[kind]??rad0)*hush; o=Object.assign({},o,{kind});
  protoEmit('noise',src,rad,o); if(!(rad>0)) return;
  const ev={id:++HUNT.nid,src:[src[0],src[2]],kind,rad,t:GAME.t,done:false,w:99},shot=kind==='shot'||kind==='eshot';
  for(const E of enemies){ if(E===o.from||!upright(E)||E.ally) continue;
    const d=Math.hypot(E.pos[0]-src[0],E.pos[1]-src[2]); if(d>rad) continue;
    const w=huntWalls(E.pos[0],E.pos[1],src[0],src[2]),r=shot?rad:rad/Math.pow(2,w); if(d>r) continue;
    const oo=Object.assign({},o,{los:w===0,walls:w,ev}); setTimeout(()=>hear(E,src,d/r,oo),120+d*45); } }
const HUNT_K={shot:['shot',1],eshot:['shot',1],scream:['scream',1],glass:['noise',1],alarm:['noise',.8],shout:['noise',.7],fall:['noise',.6],beg:['noise',.6],
  sup:['noise',.6],call:['noise',.6],bodycall:['noise',.6],run:['noise',.4],walk:['noise',.3],crouch:['noise',.3],talk:['noise',.4],thing:['noise',.4]};
/* hear() in the prototype, for a man who doesn't know where you are */
function huntHeard(E,src,k,o){ const ev=o.ev,kind=o.kind||'thing',w=o.walls||0;
  let at=[src[0],src[2]]; if(w&&(kind==='shot'||kind==='eshot')){ const a=Math.random()*6.283,r=Math.min(4.5,w*1.5)*Math.random(); at=[at[0]+Math.cos(a)*r,at[1]+Math.sin(a)*r]; } /* through walls a shot is "over there somewhere" */
  at=navSnap(at[0],at[1]);
  if((kind==='call'||kind==='eshot'&&k<.4)&&k<.65){ setAware(E,'noise',at); return; } /* a friend yelling or shooting right there: he's in it */
  /* during a hunt only what tells them where Ray is moves the search: his own sounds, a body dropping, a man he's hurt screaming.
     Not a friend calling out, a man begging, a tenant panicking across the floor (unless it's right by him: she screams because he's there) */
  const F=o.from,ray=!F||kind==='fall'||kind==='scream'&&(!F.civ||Math.hypot(F.pos[0]-PL.x,F.pos[1]-PL.z)<8);
  if(HUNT.state==='hunting'&&!ray){ if(!E.hj&&huntFree(E)) huntTurn(E,at); return; }
  const m=HUNT_K[kind]||['noise',.4]; huntAlert(m[0],at,m[1],E,ev,w); }

/* ---------- the floor's brain ---------- */
const huntFree=E=>!E.dead&&!E.civ&&!E.ally&&!E.aware&&upright(E)&&!E.surr&&!E.grabbed&&!E.civFreeze&&!E.obey&&!(E.hsStand>0)&&!E.outT;
function huntLen(){ const P=PROTO.hunt; return Math.min(P.lenMax,P.len0+P.lenAdd*(HUNT.n-1)); }
function huntSetLkp(pos,t){ const H=HUNT; H.lkp=navSnap(pos[0],pos[1]); H.lkpT=t??GAME.t;
  if(H.state==='hunting'&&(!H.planAt||Math.hypot(H.planAt[0]-H.lkp[0],H.planAt[1]-H.lkp[1])>5)) huntPlanSpots(); }
/* reason: 'seen'|'body'|'shot'|'scream'|'noise'|'radio'|'glimpse'. E: the man who saw or heard it (optional). ev: the noise it came from */
function huntAlert(reason,pos,strength=1,E=null,ev=null,walls=0){ if(!PROTO.on||!GAME.started) return; const H=HUNT,P=PROTO.hunt;
  pos=pos?[pos[0],pos[1]]:[PL.x,PL.z];
  if(ev){ if(ev.done){ if(walls<ev.w&&H.state==='hunting'&&GAME.t-ev.t<6){ ev.w=walls; huntSetLkp(pos,ev.t); } if(E&&!E.hj&&huntFree(E)) huntTurn(E,pos); return; } ev.done=true; ev.w=walls; }
  huntLog('alert',{reason,s:+strength.toFixed(2),by:E&&E.name,at:pos.map(v=>+v.toFixed(1))});
  if(reason==='body') H.body=true;
  if(reason==='seen'){ H.lastSight=GAME.t;
    if(H.state==='hunting'){ huntSetLkp(pos); H.t=Math.max(H.t,Math.min(P.refresh,P.lenMax-(GAME.t-H.t0))); } else huntStart('seen',pos); return; }
  if(H.state==='hunting'){ /* fresh evidence: the search area starts small again round it, and the nearest pair goes */
    if(reason==='glimpse'&&E&&E.hj&&E.hj.k==='pair'){ const p=E.hj.P; p.tgt=navSnap(pos[0],pos[1]); p.spot=null; p.ph='go'; p.goT=0; }
    huntSetLkp(pos); huntNearestPair(pos); return; }
  const alarm=reason==='body'||reason==='shot'||reason==='scream'||reason==='radio';
  if(alarm){ if(H.breatherT>0){ H.pending={reason,pos,t:GAME.t}; huntSendLooker(pos,E); return; } huntStart(reason,pos); return; }
  /* a noise or a glimpse: one man looks. The same thing again near where he's looking is the same incident (it only tells him where) */
  const L=enemies.find(O=>O.hj&&O.hj.k==='look'&&!O.dead&&O.hj.at&&Math.hypot(O.hj.at[0]-pos[0],O.hj.at[1]-pos[1])<P.sameR);
  if(L){ huntLookAt(L,pos); if(E&&E!==L&&huntFree(E)&&!E.hj) huntTurn(E,pos); return; }
  if(GAME.t-H.lastEvT>P.evGap){ H.lastEvT=GAME.t; H.ev.push(GAME.t); if(strength>=.8) H.ev.push(GAME.t); }
  H.ev=H.ev.filter(t=>GAME.t-t<P.evWin);
  if(H.ev.length>=2&&H.breatherT<=0){ huntStart(reason==='glimpse'?'seen':'noise',pos); return; }
  huntSendLooker(pos,E); }
function huntSendLooker(pos,E){ if(E&&!E.civ&&huntFree(E)&&!(E.hj&&E.hj.k==='look')){ huntLookJob(E,pos); return; }
  if(E&&E.hj&&E.hj.k==='look'){ huntLookAt(E,pos); return; }
  let best=null,bd=1e9; const F=fieldTo(pos[0],pos[1]); for(const O of enemies){ if(!huntFree(O)||O.hj&&O.hj.k==='look') continue; const c=navCell(O.pos[0],O.pos[1]),d=F&&c>=0?F[c]/20:Math.hypot(O.pos[0]-pos[0],O.pos[1]-pos[1]); if(d<bd&&d<25){ bd=d; best=O; } }
  if(best) huntLookJob(best,pos); }
function huntNearestPair(pos){ let best=null,bd=1e9; for(const p of HUNT.pairs){ if(!p.L||p.ph==='shine') continue; const d=Math.hypot(p.L.pos[0]-pos[0],p.L.pos[1]-pos[1]); if(d<bd){ bd=d; best=p; } }
  if(best&&bd<20){ best.tgt=navSnap(pos[0],pos[1]); best.spot=null; best.ph='go'; best.goT=0; best.fast=true; freshGoal(best.L); } }

function huntStart(reason,pos){ const H=HUNT; huntSetState('hunting'); H.n++; H.len=huntLen(); H.t=H.len; H.t0=GAME.t; H.reason=reason; H.pending=null; H.ev.length=0;
  H.savedBy=new Set(); H.limpSaid=false; H.planAt=null; H.pairs.length=0; huntGrid(true); huntSetLkp(pos); huntArm(); huntPairs(true);
  const L=H.pairs[0]&&H.pairs[0].L; if(L){ bark(L,pick(HL_.start),2.2); GAME.barkGlobal=1; vox(L,'shout',.8); }
  huntLog('huntStart',{reason,len:H.len,n:H.n}); protoEmit('huntStart',reason); protoEmit('stat','huntStart',reason); }
function huntEnd(){ const H=HUNT,P=PROTO.hunt,len=GAME.t-H.t0; huntSetState('edge'); H.breatherT=rnd(P.breath[0],P.breath[1]);
  if(PL.hide&&PL.hide.kind) H.saves[PL.hide.kind]=(H.saves[PL.hide.kind]||0)+1; /* he made it through hidden there */
  const sp=H.pairs.map(p=>p.L).find(E=>E&&!E.dead)||enemies.find(E=>huntFree(E)); if(sp){ bark(sp,pick(HL_.gone),2.8); GAME.barkGlobal=1.2; vox(sp,'mutter',1.2); }
  for(const p of H.pairs) for(const E of [p.L,p.F]) if(E) huntUnjob(E); H.pairs.length=0;
  for(const E of enemies) if(E.hj&&E.hj.k==='hold') huntUnjob(E); /* the holders come out: on edge everyone walks */
  for(const E of enemies) if(E.aware&&!E.civ&&!E.dead&&!E.canSee&&GAME.t-(E.hSawT??-99)>8){ E.aware=false; E.role=null; E.lkp=null; E.mind='nervous'; E.silent=false; huntUnjob(E); } /* the ones still waiting it out stand down */
  huntArm(); huntLog('huntEnd',{len:+len.toFixed(1),breather:+H.breatherT.toFixed(1)}); protoEmit('huntEnd'); protoEmit('stat','huntLen',+len.toFixed(1)); }
/* everyone armed: plain clothes draw */
function huntArm(){ for(const E of enemies){ if(E.dead||E.civ||E.ally||!E.C.wpn||E.wpnHeld||!E.concealed||E.surr) continue; E.wpnHeld=true; E.C.wpn.vis=true; setGrip(E.J,'R',true); } }

/* ---------- jobs: what a man who doesn't know where you are does while the floor isn't calm ---------- */
function huntJob(E,J,mind='sweep'){ E.hj=J; E.mind=mind; E.goHome=false; E.lkp=null; E.searchT=0; E.wp=null; E.pauseT=0; if(E.st==='idle') E.st='alert'; freshGoal(E); }
function huntUnjob(E){ const J=E.hj; E.hj=null; if(J&&J.k==='pair'&&!E.hunter) E.torchOn=false; if(E.torchN) E.torchN.vis=!!E.torchOn; }
function huntTurn(E,at){ if(E.civ||E.dead) return; E.hTurn={at:[at[0],at[1]],t:rnd(2.5,5)}; if(E.st==='idle') E.st='alert'; }
/* a look: go to where it was, check what's there, look round for 8-12 s, then back */
function huntLookJob(E,at){ const P=PROTO.hunt; if(!(E.hj&&E.hj.k==='look')) say(E,LINES.huh,2);
  huntJob(E,{k:'look',at:navSnap(at[0],at[1]),ph:'go',t:rnd(P.look[0],P.look[1]),goT:0,wp:null,wait:0,spot:null,shineT:0},'investigate'); }
function huntLookAt(E,at){ const J=E.hj; if(!J) return; J.at=navSnap(at[0],at[1]); if(J.ph!=='go'){ J.ph='go'; J.goT=0; J.spot=null; } J.t=Math.max(J.t,4); freshGoal(E); }
function huntLookDone(E){ say(E,LINES.giveup,2.4); huntUnjob(E); E.mind='nervous'; E.lkp=null; E.goHome=HUNT.state==='calm'&&!E.patrol; freshGoal(E); }
/* from startSearch() (52-senses.js): during a hunt a man who lost you joins the search instead of going off on his own */
function huntTakeOver(E,c,why){ if(HUNT.state!=='hunting'||E.civ) return false;
  E.aware=false; E.mind='sweep'; E.role=null; E.silent=false; E.pm=Math.min(E.pm||0,.5); E.searchT=0; E.lkp=null; freshGoal(E); if(why==='lost') say(E,LINES.lost,2.2);
  if(why==='lost'&&c) huntSetLkp(c,Math.min(GAME.t,HUNT.lkpT||GAME.t)); return true; }

/* where a man waits in his room while the others search: just inside the doorway, beside it (out of the line through it), out of the light */
function huntRoomOf(x,z){ if(typeof pfRoomAt==='function') return pfRoomAt(x,z); return null; }
function huntDoorOf(E){ const h=E.home||E.pos;
  if(typeof PF!=='undefined'&&PF&&PF.openings&&typeof pfRoomAt==='function'){ const R=pfRoomAt(h[0],h[1]); if(R){
      const os=PF.openings.filter(o=>o.a===R.id||o.b===R.id||o.a===R||o.b===R); if(os.length){ const lk=HUNT.lkp||[PL.x,PL.z];
        const o=os.slice().sort((a,b)=>Math.hypot(a.x-lk[0],a.z-lk[1])-Math.hypot(b.x-lk[0],b.z-lk[1]))[0];
        for(const v of [[1,0],[-1,0],[0,1],[0,-1]]) if(pfRoomAt(o.x+v[0]*1.1,o.z+v[1]*1.1)===R) return {door:[o.x,o.z],inw:v,w:o.w||1,R,u:null}; } } }
  if(typeof twUnitOf==='function'&&FLOOR.units&&FLOOR.space){ const u=twUnitOf(h[0],h[1]); if(u) return {door:[u.door,u.side*1.0],inw:[0,u.side],w:1,R:null,u}; }
  return null; }
function huntHoldSpot(E){ const D=huntDoorOf(E); if(!D) return null; const pp=[D.inw[1],-D.inw[0]],taken=enemies.filter(O=>O!==E&&O.hold).map(O=>O.hold); let best=null,bs=-1e9;
  for(const al of [.9,1.3,1.8]) for(const sd of [-1,1]) for(const off of [D.w/2+.35,D.w/2+.7,D.w/2+1.05]){
    const x=D.door[0]+D.inw[0]*al+pp[0]*sd*off,z=D.door[1]+D.inw[1]*al+pp[1]*sd*off;
    if(typeof twFree==='function'?!twFree(x,z):(navCell(x,z)<0||FLOOR.nav[navCell(x,z)])) continue;
    if(D.R&&pfRoomAt(x,z)!==D.R) continue; if(D.u&&twUnitOf(x,z)!==D.u) continue;
    if(taken.some(t=>Math.hypot(t.x-x,t.z-z)<.9)) continue;
    const sc=(huntLitAt(x,z,1.2)?-10:0)-al*.4-Math.abs(off-D.w/2-.7)+Math.random()*.2; if(sc>bs){ bs=sc; best=[x,z]; } }
  if(!best) return null; return {x:best[0],z:best[1],hd:Math.atan2(D.door[0]-best[0],D.door[1]-best[1]),u:D.u}; }
/* short loops on edge: his room, its doorway, the next room or the hall, back */
function huntLoop(E){ const h=E.home||E.pos,pts=[],S=(x,z)=>navSnap(x,z);
  if(typeof PF!=='undefined'&&PF&&PF.rooms&&PF.openings&&typeof pfRoomAt==='function'){ const R=pfRoomAt(h[0],h[1]); if(R){
      const os=PF.openings.filter(o=>o.a===R.id||o.b===R.id||o.a===R||o.b===R); if(os.length){ const o=pick(os),oid=o.a===R.id||o.a===R?o.b:o.a,R2=PF.rooms.find(r=>r===oid||r.id===oid);
        const mid=r=>navSpotNear((r.x0+r.x1)/2,(r.z0+r.z1)/2,Math.max(1.3,Math.min(r.x1-r.x0,r.z1-r.z0)/2-.4))||S((r.x0+r.x1)/2,(r.z0+r.z1)/2);
        pts.push(mid(R),S(o.x,o.z)); if(R2) pts.push(mid(R2)); else pts.push(navSpotNear(o.x,o.z,4)||S(o.x,o.z)); pts.push(S(o.x,o.z)); } } }
  if(!pts.length&&typeof twUnitOf==='function'&&FLOOR.units&&FLOOR.space){ const u=twUnitOf(h[0],h[1]);
    if(u){ const v=FLOOR.units.filter(w=>w!==u).sort((a,b)=>Math.abs(a.door-u.door)-Math.abs(b.door-u.door))[Math.random()<.6?0:1];
      pts.push(S((u.x0+u.x1)/2,u.side*3.3),S(u.door,u.side*.8),S(u.door+rnd(-3,3),0)); if(v) pts.push(S(v.door,v.side*.8),S((v.x0+v.x1)/2,v.side*3),S(v.door,v.side*.8)); pts.push(S(u.door,0)); }
    else { const x0=E.pos[0]; pts.push(S(x0,0),S(x0+rnd(3,6)*(Math.random()<.5?-1:1),0)); } }
  if(!pts.length) pts.push(S(h[0],h[1]),navSpotNear(h[0],h[1],6)||S(h[0],h[1]),navSpotNear(h[0],h[1],6)||S(h[0],h[1]));
  let i=0,bd=1e9; pts.forEach((q,k)=>{ const d=Math.hypot(q[0]-E.pos[0],q[1]-E.pos[1]); if(d<bd){ bd=d; i=k; } });
  return {k:'patrol',pts,i,wait:0,goT:0}; }

/* ---------- the search grid: 2 m cells over the walkable floor ---------- */
function huntGrid(reset){ const H=HUNT,P=PROTO.hunt; let G=H.grid;
  if(!G||G.nav!==FLOOR.nav||G.nx!==NX){ const cs=P.cell,n=Math.round(cs*2),cells=[];
    for(let k0=0;k0<NZ;k0+=n) for(let i0=0;i0<NX;i0+=n){ let cnt=0,best=-1,bd=1e9; const ci=i0+(n-1)/2,ck=k0+(n-1)/2;
      for(let k=k0;k<Math.min(NZ,k0+n);k++) for(let i=i0;i<Math.min(NX,i0+n);i++){ const c=k*NX+i; if(FLOOR.nav[c]) continue; cnt++; const d=(i-ci)**2+(k-ck)**2; if(d<bd){ bd=d; best=c; } }
      if(cnt<n*n*.3||best<0) continue; const x=cellX(best%NX),z=cellZ((best-best%NX)/NX); cells.push({x,z,nc:best,clr:-1,lit:huntLitAt(x,z,1.2),bonus:1}); }
    G=H.grid={nav:FLOOR.nav,nx:NX,cells}; reset=true; }
  if(reset){ const S=huntHides(); for(const c of G.cells){ c.clr=-1; let b=c.lit?.5:1.2; for(const s of S) if(Math.hypot(s.x-c.x,s.z-c.z)<P.cell*.8) b+=.8; c.bonus=b; } }
  return G; }
/* every quarter second while hunting: what the lights and the men have just looked at is empty (for now) */
function huntClear(){ const G=HUNT.grid; if(!G) return; const P=PROTO.hunt,now=GAME.t;
  for(const E of enemies){ if(E.dead||E.civ||!upright(E)) continue; const searching=E.hj||E.aware; if(!searching) continue;
    const beam=huntBeamOn(E),b=huntBeamDir(E),lk=huntLook(E),fx=Math.sin(lk),fz=Math.cos(lk);
    for(const c of G.cells){ const dx=c.x-E.pos[0],dz=c.z-E.pos[1],d=Math.hypot(dx,dz);
      if(d<1.8){ c.clr=now; continue; }
      if(beam&&d<P.torchR&&(b[0]*dx+b[1]*dz)/d>.8&&huntSees([E.pos[0],1.25,E.pos[1]],[c.x,.9,c.z])){ c.clr=now; continue; }
      if(c.lit&&d<10&&(fx*dx+fz*dz)/d>.5&&huntSees([E.pos[0],1.6,E.pos[1]],[c.x,1.1,c.z])) c.clr=now; } } }
/* where a pair goes next: the likeliest cell nobody has looked at, near where he could have got to by now */
function huntPick(p){ const H=HUNT,P=PROTO.hunt,G=huntGrid(false),L=p.L,now=GAME.t,lk=H.lkp||[L.pos[0],L.pos[1]],F=fieldTo(lk[0],lk[1]);
  let R=P.r0+P.spread*(now-H.lkpT),best=null,bs=0; const others=H.pairs.filter(q=>q!==p&&q.tgt).map(q=>q.tgt);
  for(let pass=0;pass<2&&!best;pass++,R+=6) for(const c of G.cells){ const dl=F&&F[c.nc]<1e9?F[c.nc]/20:Math.hypot(c.x-lk[0],c.z-lk[1])*1.4; if(dl>R) continue;
    if(others.some(t=>Math.hypot(t[0]-c.x,t[1]-c.z)<3.5)) continue;
    const rec=c.clr<0?1:clamp((now-c.clr-P.clrHold)/P.clrRecover,0,1); if(rec<=0) continue;
    const dt=Math.hypot(c.x-L.pos[0],c.z-L.pos[1]); let w=rec*c.bonus/(1+dl/6)/(1+dt/10); if(dt<1.5) w*=.3;
    if(w>bs){ bs=w; best=c; } }
  if(best) return [best.x,best.z]; return navSpotNear(lk[0],lk[1],8)||lk.slice(); }

/* ---------- hiding spots: G's, or the beds and wardrobes on an old floor ---------- */
function huntHides(){ if(typeof HIDES!=='undefined'&&HIDES&&HIDES.length) return HIDES; const H=HUNT;
  if(!H.fbHides||H.fbFor!==FLOOR.furn){ H.fbFor=FLOOR.furn; const K={bed:'bed',wardrobe:'wardrobe',couch:'sofa',mattress:'mattress',crates:'corner'};
    H.fbHides=(FLOOR.furn||[]).filter(f=>K[f.kind]).map((f,i)=>{ const sz=f.info&&f.info.size||[1,1]; return {id:'fb'+i,kind:K[f.kind],x:f.x,z:f.z,yaw:0,w:sz[0],d:sz[1],h:FURN_H[f.kind]||.8}; }); }
  return H.fbHides; }
const huntShine=k=>k==='wardrobe'||k==='closet'?3:k==='bed'?2:k==='corner'?1.5:2.5;
function huntSpotKey(s){ return s.id??(s.x.toFixed(1)+','+s.z.toFixed(1)); }
/* the spots each pair will check: near where he was last known; the one somebody saw him go into first, then the kind that's fooled them */
function huntPlanSpots(){ const H=HUNT,P=PROTO.hunt; if(!H.lkp) return; H.planAt=H.lkp.slice(); const lk=H.lkp,F=fieldTo(lk[0],lk[1]),now=GAME.t;
  const seen=H.seenIn&&now-H.seenIn.t<90?H.seenIn.spot:null;
  const S=huntHides().filter(s=>{ if(s===seen) return true; /* somebody saw him go in there: that one, wherever it is */
      const ck=H.checked.get(huntSpotKey(s)); if(ck!=null&&now-ck<30) return false; const d=Math.hypot(s.x-lk[0],s.z-lk[1]); if(d>P.spotR) return false;
      const c=navSnap(s.x,s.z),cc=navCell(c[0],c[1]); return !F||cc<0||F[cc]/20<=P.spotR*1.6; })
    .map(s=>({s,sc:(s===seen?-100:0)+((H.saves[s.kind]||0)>=3?-50:0)+Math.hypot(s.x-lk[0],s.z-lk[1])})).sort((a,b)=>a.sc-b.sc).map(o=>o.s);
  for(const p of H.pairs) p.spots=[];
  const ps=H.pairs.filter(p=>p.L); if(!ps.length) return;
  const quota=new Map(ps.map(p=>[p,Math.round(rnd(P.spotsPer[0],P.spotsPer[1]))]));
  for(const s of S){ let bp=null,bd=1e9; for(const p of ps){ if(p.spots.length>=quota.get(p)) continue; const d=Math.hypot(p.L.pos[0]-s.x,p.L.pos[1]-s.z)+p.spots.length*4; if(d<bd){ bd=d; bp=p; } }
    if(!bp) break; bp.spots.push(s); }
  if(seen){ for(const p of ps) if(p.spots[0]===seen&&p.ph!=='shine'){ p.tgt=null; p.ph='go'; } } }
function huntApproach(s,from){ const half=Math.max(s.w||.8,s.d||.8)/2+.6,dx=from[0]-s.x,dz=from[1]-s.z,d=Math.hypot(dx,dz)||1,cands=[[dx/d,dz/d],[1,0],[-1,0],[0,1],[0,-1]];
  for(const v of cands){ const x=s.x+v[0]*half,z=s.z+v[1]*half,c=navCell(x,z); if(c>=0&&!FLOOR.nav[c]) return [x,z]; } return navSnap(s.x,s.z); }

/* ---------- pairs: two men and one light ---------- */
function huntPairs(fresh){ const H=HUNT,P=PROTO.hunt,lk=H.lkp||[PL.x,PL.z],F=fieldTo(lk[0],lk[1]);
  const wd=E=>{ const c=navCell(E.pos[0],E.pos[1]); return F&&c>=0&&F[c]<1e9?F[c]/20:Math.hypot(E.pos[0]-lk[0],E.pos[1]-lk[1])*1.4; };
  for(const p of H.pairs){ if(p.L&&!huntFree(p.L)){ huntUnjob(p.L); p.L=null; } if(p.F&&!huntFree(p.F)){ huntUnjob(p.F); p.F=null; }
    if(!p.L&&p.F){ p.L=p.F; p.F=null; huntJob(p.L,{k:'pair',P:p}); } if(p.L&&p.F&&p.F.hunter&&!p.L.hunter){ const t=p.L; p.L=p.F; p.F=t; } }
  H.pairs=H.pairs.filter(p=>p.L);
  const inPair=E=>E.hj&&E.hj.k==='pair'&&H.pairs.includes(E.hj.P);
  const pool=enemies.filter(E=>huntFree(E)&&!inPair(E)).sort((a,b)=>wd(a)-wd(b));
  const take=E=>{ const i=pool.indexOf(E); if(i>=0) pool.splice(i,1); };
  while(H.pairs.length<P.pairs&&pool.length){ let L=pool[0]; const h=pool.find(E=>E.hunter&&wd(E)<wd(L)+8); if(h) L=h; take(L);
    const p={L,F:null,tgt:null,ph:'go',goT:0,sweepT:0,shineT:0,spot:null,spots:[],side:Math.random()<.5?-1:1,fast:true,steered:false}; H.pairs.push(p); huntJob(L,{k:'pair',P:p}); }
  for(const p of H.pairs){ if(p.F||!pool.length) continue; const F_=pool.slice().sort((a,b)=>Math.hypot(a.pos[0]-p.L.pos[0],a.pos[1]-p.L.pos[1])-Math.hypot(b.pos[0]-p.L.pos[0],b.pos[1]-p.L.pos[1]))[0];
    if(Math.hypot(F_.pos[0]-p.L.pos[0],F_.pos[1]-p.L.pos[1])>16&&!fresh) continue; take(F_); p.F=F_; huntJob(F_,{k:'pair',P:p}); }
  for(const p of H.pairs){ p.L.torchOn=true; huntTorchMesh(p.L); if(p.F&&!p.F.hunter) p.F.torchOn=false; }
  /* everyone else holds his room */
  for(const E of pool){ if(E.hj&&E.hj.k==='hold') continue; const s=huntHoldSpot(E)||(E.home?{x:E.home[0],z:E.home[1],hd:E.homeHd??E.hd}:null); huntJob(E,{k:'hold',s},'sweep'); }
  if(fresh||H.pairs.some(p=>!p.planned)){ for(const p of H.pairs) p.planned=true; huntPlanSpots(); } }
function huntNext(p){ const L=p.L; p.goT=0; p.ph='go'; freshGoal(L);
  const seen=HUNT.seenIn&&GAME.t-HUNT.seenIn.t<90?HUNT.seenIn.spot:null; /* first where he was, then a hiding spot, a cell, a spot... */
  if(p.spots.length&&(p.alt||p.spots[0]===seen)){ p.alt=false; const s=p.spots.shift(); p.spot=s; p.tgt=huntApproach(s,L.pos); const line=HL_.spot[s.kind];
    const who=p.F&&Math.random()<.5?p.F:L; if(line&&who.barkCd<=0){ bark(who,line,2.2); GAME.barkGlobal=Math.max(GAME.barkGlobal,.8); } return; }
  p.spot=null; p.alt=true; p.tgt=huntPick(p); }
/* the man with the light */
function huntLeadGoal(E,p,dt){ if(p.ph==='shine'){ p.shineT-=dt; const s=p.spot; if(s) E.hWant=Math.atan2(s.x-E.pos[0],s.z-E.pos[1]); E.hScan=0; if(p.shineT<=0) huntProbe(E,p); return null; }
  if(p.ph==='sweep'){ p.sweepT-=dt; E.hScan=1.2; if(p.sweepT<=0){ p.fast=false; huntNext(p); } return null; }
  if(!p.tgt) huntNext(p); if(!p.tgt) return null;
  const d=Math.hypot(E.pos[0]-p.tgt[0],E.pos[1]-p.tgt[1]); p.goT+=dt;
  if(d<(p.spot?.5:1.0)||p.goT>16||stuck(E,dt)){ if(p.spot){ p.ph='shine'; p.shineT=huntShine(p.spot.kind); } else { p.ph='sweep'; p.sweepT=rnd(1.4,2.4); E.hScanBase=E.hd; } return null; }
  E.hScan=.5; return {x:p.tgt[0],z:p.tgt[1],sp:p.fast?1.75:1.25}; }
/* the one behind him: a step back and to the side, covering what the light isn't on */
function huntFollowGoal(E,p,dt){ const L=p.L; if(!L||L===E) return null; const f=[Math.sin(L.hd),Math.cos(L.hd)],sd=p.side;
  const q=navSnap(L.pos[0]-f[0]*1.3+f[1]*.6*sd,L.pos[1]-f[1]*1.3-f[0]*.6*sd),d=Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1]);
  E.hWant=p.ph==='shine'&&p.spot?Math.atan2(p.spot.x-E.pos[0],p.spot.z-E.pos[1]):L.hd+sd*(p.ph==='sweep'?1.6:2.4); E.hScan=.4;
  if(d<.75) return null; return {x:q[0],z:q[1],sp:d>3?1.9:Math.max(1.1,p.fast?1.75:1.3)}; }
function huntProbe(E,p){ const H=HUNT,s=p.spot; p.spot=null; if(!s){ huntNext(p); return; } H.checked.set(huntSpotKey(s),GAME.t);
  const caught=typeof hideProbe==='function'?!!hideProbe(E,s):Math.hypot(PL.x-s.x,PL.z-s.z)<1;
  huntLog('probe',{by:E.name,kind:s.kind,caught});
  if(caught){ huntCaught(E,s,p); return; }
  if(PL.hide&&PL.hide!==s&&Math.hypot(PL.hide.x-s.x,PL.hide.z-s.z)<6) huntSaved(PL.hide);
  if(Math.random()<.5) say(E,HL_.nothing,1.6); huntNext(p); }
function huntCaught(E,s,p){ bark(E,pick(HL_.caught),2); GAME.barkGlobal=1; vox(E,'shout');
  if(!(typeof enemyGrab==='function'&&enemyGrab(E,'collar',{spot:s}))) setAware(E,'see');
  if(p&&p.F&&!p.F.dead) setAware(p.F,'see');
  protoEmit('hideFound',E,s); huntAlert('seen',[PL.x,PL.z],1,E); }
function huntSaved(s){ const H=HUNT,k=huntSpotKey(s); if(!H.savedBy||H.savedBy.has(k)) return; H.savedBy.add(k); H.saves[s.kind]=(H.saves[s.kind]||0)+1; huntLog('saved',{kind:s.kind,n:H.saves[s.kind]}); }

/* aiGoal() (52-senses.js) asks here first for a man with a job. undefined: not ours */
function huntGoal(E,dt,t){ const J=E.hj; if(!J) return undefined; const P=PROTO.hunt;
  if(J.k==='pair'){ const p=J.P; if(!HUNT.pairs.includes(p)){ huntUnjob(E); return undefined; } return E===p.L?huntLeadGoal(E,p,dt):huntFollowGoal(E,p,dt); }
  if(J.k==='hold'){ /* inside his doorway, out of the light; every so often a look out into the hall, then back to a spot beside the frame */
    if(J.ph==='peek'){ const q=J.q; if(!q){ J.ph='hold'; return null; } if(Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1])>.5&&(J.pT+=dt)<6&&!stuck(E,dt)) return {x:q[0],z:q[1],sp:1.1};
      J.lt=(J.lt??rnd(2.5,4))-dt; E.hScanBase=J.out??E.hd; E.hScan=1; if(J.lt<=0){ J.ph='hold'; J.lt=null; J.t=rnd(12,20); J.s=huntHoldSpot(E)||J.s; J.there=false; freshGoal(E); } return null; }
    const s=J.s; if(!s) return null; const d=Math.hypot(E.pos[0]-s.x,E.pos[1]-s.z); if(d>.45&&!(J.there&&d<.9)&&!stuck(E,dt)) return {x:s.x,z:s.z,sp:1.4};
    J.there=true; E.hWant=s.hd; E.hScan=.35; J.t=(J.t??rnd(10,18))-dt;
    if(J.t<=0){ const D=huntDoorOf(E); if(D){ J.q=navSnap(D.door[0]-D.inw[0]*.8,D.door[1]-D.inw[1]*.8); J.out=Math.atan2(-D.inw[0],-D.inw[1]); J.ph='peek'; J.pT=0; freshGoal(E); } else J.t=rnd(12,20); }
    return null; }
  if(J.k==='patrol'){ if(J.wait>0){ J.wait-=dt; E.hScan=1; return null; } const q=J.pts[J.i]; if(!q) return null; J.goT+=dt;
    if(Math.hypot(E.pos[0]-q[0],E.pos[1]-q[1])<.7||J.goT>15||stuck(E,dt)){ J.i=(J.i+1)%J.pts.length; J.wait=rnd(1.5,3.5); J.goT=0; E.hScanBase=E.hd; freshGoal(E);
      if(Math.random()<.15&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<9) say(E,HL_.patrol,2); return null; }
    E.hScan=.3; return {x:q[0],z:q[1],sp:.95}; }
  if(J.k==='look'){ const a=J.at;
    if(J.ph==='go'){ J.goT+=dt; if(Math.hypot(E.pos[0]-a[0],E.pos[1]-a[1])<1||J.goT>15||stuck(E,dt)){ J.ph='area'; E.hScanBase=E.hd;
        const sp=huntHides().filter(s=>Math.hypot(s.x-a[0],s.z-a[1])<3).sort((x,y)=>Math.hypot(x.x-a[0],x.z-a[1])-Math.hypot(y.x-a[0],y.z-a[1]))[0];
        if(sp&&(HUNT.seenIn&&HUNT.seenIn.spot===sp||Math.random()<.5)){ J.spot=sp; J.wp=huntApproach(sp,E.pos); J.shineT=huntShine(sp.kind); } return null; }
      E.hScan=.4; return {x:a[0],z:a[1],sp:1.1}; }
    J.t-=dt; if(J.t<=0){ huntLookDone(E); return null; }
    if(J.spot){ if(Math.hypot(E.pos[0]-J.wp[0],E.pos[1]-J.wp[1])>.5&&!stuck(E,dt)) return {x:J.wp[0],z:J.wp[1],sp:1};
      E.hWant=Math.atan2(J.spot.x-E.pos[0],J.spot.z-E.pos[1]); E.hScan=0; J.shineT-=dt;
      if(J.shineT<=0){ const s=J.spot; J.spot=null; J.wp=null; HUNT.checked.set(huntSpotKey(s),GAME.t);
        const caught=typeof hideProbe==='function'?!!hideProbe(E,s):Math.hypot(PL.x-s.x,PL.z-s.z)<1; huntLog('probe',{by:E.name,kind:s.kind,caught,look:true});
        if(caught) huntCaught(E,s,null); else if(PL.hide&&PL.hide!==s) huntSaved(PL.hide); } return null; }
    if(J.wait>0){ J.wait-=dt; E.hScan=1; return null; }
    if(!J.wp||Math.hypot(E.pos[0]-J.wp[0],E.pos[1]-J.wp[1])<.7||stuck(E,dt)){ if(J.wp){ J.wp=null; J.wait=rnd(1.2,2.4); E.hScanBase=E.hd; return null; } J.wp=navSpotNear(a[0],a[1],3)||a; freshGoal(E); }
    E.hScan=.4; return {x:J.wp[0],z:J.wp[1],sp:.9}; }
  return undefined; }

/* ---------- the flashlights: one light slot is free, so the beam nearest you is the one that's drawn ---------- */
function huntTorchMesh(E){ if(E.torchN||E.hunter||!E.J||!E.J.handL) { if(E.torchN) E.torchN.vis=!!E.torchOn; return; }
  const t=N(E.J.handL,0,-.06,.03,Math.PI/2,0,0); mk(cyl(.02,.017,.15,6),[mBlack,M(null,{color:0xfff2c8,unlit:true}),mBlack],t); E.torchN=t; t.vis=!!E.torchOn; }
function huntTorchFx(){ const slot=(FLOOR.lights||[]).length; if(slot>=7) return; let best=null,bd=1e9;
  for(const E of enemies){ if(E.torchN) E.torchN.vis=!!E.torchOn&&!E.dead; if(!huntBeamOn(E)) continue; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(d<bd){ bd=d; best=E; } }
  if(!best){ L.plCol.set([0,0,0],slot*3); return; }
  const b=huntBeamDir(best),q=[best.pos[0]+b[0]*1.9,best.pos[1]+b[1]*1.9]; pushOutXZ(q,.1,'body'); L.plPos.set([q[0],1.0,q[1]],slot*3); L.plCol.set([1.25,1.2,1.05],slot*3); L.plDist[slot]=4.2; }

/* ---------- every frame: heads and bodies turning, the meter's reaction, the floor's clock ---------- */

function huntTick(gdt){ if(!PROTO.on||!GAME.started||!FLOOR.nav) return; const H=HUNT,t=GAME.t;
  for(const E of enemies){ if(E.dead){ if(E.hUp){ E.hUp=false; huntFall(E); } continue; }
    const up=upright(E); if(E.hUp&&!up&&E.st==='down') huntFall(E); E.hUp=up; if(!up||E.aware||E.civ||E.ally) continue;
    let look=null;
    /* while the meter fills he stops, turns his head to you, says something */
    if(E.pmUp&&E.pm>.15){ E.hReact=.8; if(E.st==='idle') E.st='alert'; if(!E.hWho&&E.pm>.3){ E.hWho=true; if(E.barkCd<=0){ bark(E,pick(HL_.who),1.8); GAME.barkGlobal=Math.max(GAME.barkGlobal,.6); vox(E,'mutter',.9); } } }
    if(E.hReact>0){ E.hReact-=gdt; const want=Math.atan2(PL.x-E.pos[0],PL.z-E.pos[1]); E.hd+=clamp(wrapA(want-E.hd),-1.6*gdt,1.6*gdt); look=clamp(wrapA(want-E.hd),-1,1); E.moveDir=null; }
    else if(E.hTurn){ E.hTurn.t-=gdt; const a=E.hTurn.at,want=Math.atan2(a[0]-E.pos[0],a[1]-E.pos[1]); if(!E.moveDir) E.hd+=clamp(wrapA(want-E.hd),-1.4*gdt,1.4*gdt); look=clamp(wrapA(want-E.hd),-.9,.9);
      if(E.hTurn.t<=0){ E.hTurn=null; if(!E.hj&&HUNT.state==='calm'&&E.mind==='calm'&&E.home) E.goHome=true; } }
    else if(E.hj){ if(!E.moveDir&&E.hWant!=null){ let w=E.hWant; if(E.hScan>.9&&E.hScanBase!=null) w=E.hScanBase+Math.sin((t+E.t0)*.9)*1.1; E.hd+=clamp(wrapA(w-E.hd),-1.5*gdt,1.5*gdt); }
      else if(!E.moveDir&&E.hScan>.9&&E.hScanBase!=null) E.hd+=clamp(wrapA(E.hScanBase+Math.sin((t+E.t0)*.9)*1.1-E.hd),-1.5*gdt,1.5*gdt);
      look=Math.sin((t+E.t0)*1.1)*.55*Math.min(1,E.hScan||0); E.hWant=null; }
    if(look!=null&&E.Rs){ E.hLk=lerp(E.hLk??E.lookYaw??0,look,Math.min(1,gdt*5)); E.lookYaw=E.hLk; } else E.hLk=E.lookYaw;
    if(E.hj&&E.st==='idle') E.st='alert'; if(E.patrol&&H.state!=='calm'&&!E.hj&&E.st==='idle') E.st='alert'; }
  /* someone saw where he went in */
  if(PL.hide!==H.hideWas){ if(PL.hide&&H.lastSeen&&t-H.lastSeen.t<2.5){ H.seenIn={spot:PL.hide,t}; huntLog('seenIn',{kind:PL.hide.kind}); } H.hideWas=PL.hide; }
  huntTorchFx();
  H.acc+=gdt; if(H.acc>=.25){ const dt=H.acc; H.acc=0; huntThink(dt); }
  if(H.dbg) huntDbg(); }
function huntFall(E){ const p=X_(E.B,PI_.pelvis); setTimeout(()=>noise([p[0],0,p[2]],PROTO.hunt.hear.fall,{kind:'fall',from:E}),350); } /* a body hitting the floor */

/* four times a second: the clock, the pairs, the grid, what they notice */
function huntThink(dt){ const H=HUNT,P=PROTO.hunt,now=GAME.t;
  /* contact: somebody who knows is looking right at him */
  let contact=null; for(const E of enemies) if(E.aware&&E.canSee&&!E.civ&&!E.dead&&upright(E)){ contact=E; E.hSawT=now; }
  if(contact){ H.lastSight=now; H.lkp=[PL.x,PL.z]; H.lkpT=now; if(H.state!=='hunting') huntAlert('seen',[PL.x,PL.z],1,contact); }
  else if(H.state!=='hunting'){ const A=enemies.find(E=>E.aware&&!E.civ&&!E.dead&&upright(E)&&E.lkp&&now-(E.hRadioT??-99)>20); if(A){ A.hRadioT=now; huntAlert('radio',A.lkp,1,A); } } /* one of them knows (a friend's shout, a hit): the rest are told */
  for(const E of enemies) if(!E.civ&&!E.dead&&(E.aware&&E.canSee||E.pmUp&&E.pm>.5)&&(PL.limp||0)>.3&&!H.limpSaid&&E.barkCd<=0){ H.limpSaid=true; bark(E,HL_.limp,2); GAME.barkGlobal=1; break; }
  if(H.state==='hunting'){ if(!contact){ H.t-=dt; if(H.t<=0){ huntEnd(); return; } }
    huntPairs(false); huntClear(); huntSteer(); huntCalls(dt); }
  else { if(H.breatherT>0){ H.breatherT-=dt; if(H.breatherT<=0){ H.breatherT=0; huntLog('breatherEnd'); if(H.pending&&now-H.pending.t<60){ const pd=H.pending; H.pending=null; huntStart(pd.reason,pd.pos); return; } H.pending=null; } }
    if(H.state==='edge') for(const E of enemies){ if(!huntFree(E)||E.hj||E.mind==='investigate'||E.mind==='search') continue; if(E.patrol){ E.mind='nervous'; E.goHome=false; continue; } huntJob(E,huntLoop(E)); } }
  /* Ray's spot fooled someone who came close */
  if(PL.hide&&H.state==='hunting') for(const E of enemies) if(E.hj&&!E.dead&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<3) huntSaved(PL.hide);
  huntBlood(); huntPush(dt); }
/* The Last of Us' trick: if he's got well away from where they think he is, the nearest pair drifts his way anyway */
function huntSteer(){ const H=HUNT,P=PROTO.hunt,now=GAME.t; if(!H.lkp||now-H.lastSight<4||now-H.steerT<P.steerEvery) return;
  if(Math.hypot(PL.x-H.lkp[0],PL.z-H.lkp[1])<P.steerD) return; let best=null,bd=1e9;
  for(const p of H.pairs){ if(!p.L||p.ph==='shine') continue; const d=Math.hypot(p.L.pos[0]-PL.x,p.L.pos[1]-PL.z); if(d<bd){ bd=d; best=p; } } if(!best) return;
  H.steerT=now; const a=Math.random()*6.283,r=rnd(1,2.5); best.tgt=navSnap(PL.x+Math.cos(a)*r,PL.z+Math.sin(a)*r); best.spot=null; best.ph='go'; best.goT=0; best.steered=true; freshGoal(best.L);
  if(PL.hide&&Math.random()<P.steerProbe&&!best.spots.includes(PL.hide)) best.spots.unshift(PL.hide);
  huntLog('steer',{d:+bd.toFixed(1)}); }
/* calling into the dark while they look */
function huntCalls(dt){ for(const p of HUNT.pairs){ const E=p.L; if(!E) continue; E.hCallT=(E.hCallT??rnd(4,7))-dt; if(E.hCallT>0) continue; E.hCallT=rnd(6,10);
    if(Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<12){ const L_=E.hunter&&E.hunter.calls?E.hunter.calls:LINES.search; if(say(E,L_,2.2)) vox(E,'mutter',1.2); } } }
/* blood: they see it, say so, and follow the drops to the freshest */
function huntBlood(){ if(typeof RAYDROPS==='undefined'||!RAYDROPS||!RAYDROPS.length) return; const H=HUNT,now=GAME.t; if(now-H.bloodT<12) return;
  for(const E of enemies){ if(!E.hj||E.dead||!upright(E)) continue;
    for(const d of RAYDROPS){ if(H.bloodSaid.has(d)||d.t!=null&&now-d.t>240) continue; const r=Math.hypot(d.x-E.pos[0],d.z-E.pos[1]); if(r>1.6&&!(r<5&&huntBeamOn(E)&&huntInBeam(E,d.x,d.z,.05))) continue;
      for(const o of RAYDROPS) if(Math.hypot(o.x-d.x,o.z-d.z)<3) H.bloodSaid.add(o);
      bark(E,HL_.blood,2.2); GAME.barkGlobal=1; H.bloodT=now;
      let cur=d; for(let k=0;k<6;k++){ let nx=null; for(const o of RAYDROPS) if((o.t??0)>(cur.t??0)&&Math.hypot(o.x-cur.x,o.z-cur.z)<4&&(!nx||(o.t??0)>(nx.t??0))) nx=o; if(!nx) break; cur=nx; } /* along the trail, toward the newest drops */
      huntLog('blood',{by:E.name}); if(H.state==='hunting'){ huntSetLkp([cur.x,cur.z],cur.t??now); if(E.hj.k==='pair'){ const p=E.hj.P; p.tgt=navSnap(cur.x,cur.z); p.spot=null; p.ph='go'; p.goT=0; } }
      else huntAlert('noise',[cur.x,cur.z],.6,E); return; } } }
/* the men holding their rooms come out together once a friend has been shooting for 20-30 s */
function huntPush(dt){ const H=HUNT,P=PROTO.hunt; if(GAME.t-H.eShotT<3) H.fightT+=dt; else if(GAME.t-H.eShotT>10) H.fightT=0; }
function huntPushNow(){ const H=HUNT,P=PROTO.hunt; if(H.fightT<H.pushAt) return false; H.fightT=0; H.pushAt=rnd(P.push[0],P.push[1]); huntLog('push'); return true; }
protoOn('noise',(src,rad,o)=>{ if(o&&o.kind==='eshot') HUNT.eShotT=GAME.t; });
protoOn('fire',(h,it,info)=>{ HUNT.fireK=info&&info.sup?'sup':'shot'; if(!(info&&info.sup)) HUNT.flashT=GAME.t; });
protoOn('tick',gdt=>huntTick(gdt));
protoOn('reset',()=>huntReset()); protoOn('load',()=>huntReset());
function huntReset(){ const H=HUNT; Object.assign(H,{state:'calm',lkp:null,lkpT:0,n:0,breatherT:0,t:0,len:0,t0:0,reason:'',lastEvT:-99,body:false,grid:null,saves:{},seenIn:null,lastSeen:null,
  lastSight:-99,pending:null,steerT:-99,flashT:-99,fireK:null,eShotT:-99,fightT:0,pushAt:rnd(PROTO.hunt.push[0],PROTO.hunt.push[1]),bloodT:-99,limpSaid:false,acc:0,fbHides:null,hideWas:null,planAt:null});
  H.ev=[]; H.pairs=[]; H.checked=new Map(); H.bloodSaid=new Set(); if(!PROTO.on) return; huntLog('reset');
  for(const E of enemies) if(!E.civ&&!E.ally) huntTorchMesh(E); } /* every man carries a flashlight, off: built now, not in the middle of a hunt */

/* ---------- ?huntdbg=1: the state on the flat screen (never in the headset) ---------- */
let huntDbgEl=null,huntDbgT=0;
function huntDbg(){ if(GAME.t-huntDbgT<.25&&huntDbgT<=GAME.t) return; huntDbgT=GAME.t;
  if(!huntDbgEl){ huntDbgEl=document.createElement('div'); huntDbgEl.id='huntDbg'; huntDbgEl.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;font:12px/1.35 monospace;color:#e8e2cf;background:rgba(0,0,0,.6);padding:6px 8px;white-space:pre;pointer-events:none'; document.body.appendChild(huntDbgEl); }
  huntDbgEl.style.display=XR.on?'none':'block'; const H=HUNT;
  const men=enemies.filter(E=>!E.civ&&!E.dead).map(E=>E.name+':'+(E.aware?'AWARE'+(E.role?'/'+E.role:''):E.hj?E.hj.k+(E.hj.k==='pair'?(E===E.hj.P.L?'L':'F'):''):E.mind||'calm')+(E.pm>0?' '+Math.round(E.pm*100)+'%':'')).join('  ');
  huntDbgEl.textContent=`HUNT ${H.state.toUpperCase()}${H.state==='hunting'?' '+Math.ceil(H.t)+'s/'+H.len:''}${H.breatherT>0?'  breather '+Math.ceil(H.breatherT)+'s':''}  hunts ${H.n}${H.body?'  BODY':''}  events ${H.ev.length}\nlkp ${H.lkp?H.lkp.map(v=>v.toFixed(1)).join(','):'-'}  Ray ${PL.x.toFixed(1)},${PL.z.toFixed(1)}\n${men}`; }
