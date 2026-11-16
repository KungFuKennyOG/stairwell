/* =====================================================================
   RAY'S BODY (floor 01 prototype, ?proto=1): hurt, short of rounds, and hunted. Agent A.
   Everything here only acts with PROTO.on. With it off the old game is untouched: health comes back, reloads are free, bullet time works.
   - Health never comes back. Ray starts the floor at 75. A first-aid kit held to the chest with the trigger squeezed gives 25 back over 3 s.
   - What a hit costs depends on what hit him and where it landed: a pistol round in the chest 30, an arm or a leg 15, the head 70. Where it
     lands is found by casting the shot at a rough capsule body built from his real head and hands, so arms held up take what was meant for
     the face, and a crouch hides the legs.
   - A hit never moves the camera and never darkens the edges: the hands are knocked off their tracked pose for 0.4 s, the legs give for
     0.8 s, the ears ring.
   - Arm, leg and torso hits can open a wound (PL.wounds). Each bleeds 1 hp per 4 s and drips on the floor every 2 m he moves (RAYDROPS, which
     the hunters follow). A leg wound slows him, an arm wound makes that hand sway and weak. Wrapping a strip of sheet round it stops it.
   - Rounds are counted. The gun holds what it holds; the pouch holds spare magazines and loose rounds (PL.pouch). Reloading swaps in the
     fullest spare magazine, or thumbs loose rounds in when there's none. Hold A/X to feel the count: a buzz per round in the gun, then a
     long one if there's nothing left to load.
   - No bullet time.
   - His state shows on his own hands: blood builds up on them, they shake below 30 hp, his breathing gets heavy below 40.
   Events: rayWound(w), bandaged(w), rayDrop(drop); numbers for telemetry through protoEmit('stat', name, value).
   ===================================================================== */
PROTO.ray={ hp:100, gun:9, pouch:7, drop:[2,6], flash:0,                      /* start: 75 hp, Novak's pistol with 9, one spare magazine of 7; a dead man's gun 2-6; no red screen wash in VR */
  /* (2026-11-15) plain HP, 100 full: the old 75-point table times 4/3, so a fight costs what it did */
  /* (2026-11-15, later) Kenny: "we should die much quicker". Was pistol 93/40/20, knife 47/29/19: now two rounds in the body or two good stabs kill */
  dmg:{ pistol:{head:100,torso:70,arm:35,leg:35}, revolver:{head:100,torso:90,arm:45,leg:45}, smg:{head:100,torso:48,arm:24,leg:24},
        shotgun:{head:70,torso:37,arm:19,leg:19}, /* per pellet, times the falloff: a close load kills */
        machete:{head:100,torso:65,arm:45,leg:45}, knife:{head:80,torso:50,arm:32,leg:32}, bottle:{head:42,torso:28,arm:20,leg:20}, fist:{head:22,torso:14,arm:9,leg:9} },
  open:{ gun:{torso:0,arm:0,leg:0}, blade:{torso:0,arm:0,leg:0} }, maxWounds:4,  /* chance a hit opens a bleeding wound: off (Kenny: no bleeding out, no limping, just HP) */
  bleed:.25, dropEvery:2, dropStill:10, dropCap:80,                            /* hp per second per open wound; a drop every 2 m, or every 10 s standing */
  knock:[.15,.25], knockT:.4, knockRot:.13, slowK:1, slowT:0,     /* hands knocked; never slowed (slowK 1) */               /* hit reaction */
  leg:.6, legBand:.85, arm:.6, armBand:.3,                                     /* walking speed with a leg wound; arm weakness (PL.armWeak) */
  loops:1.5, loopWin:4, flatWrap:4, heal:33, healT:3, chest:.22, heartHp:35, hurtHp:60, /* under heartHp you hear your heart; under hurtHp the colour starts going */
  tremorHp:30, breathHp:40, breathNoise:1.2, tearNoise:3, painNoise:4, countHold:.5 };

const RAYDROPS=[];
const RAY={hitT:-9,knock:{t:-9},ringCd:0,moved:0,still:0,lx:0,lz:0,clk:0,bq:[],blood:{L:0,R:0},bloodLv:{L:0,R:0},bloodT:0,breathT:3,heal:null,flatT:0,
  fresh:false,mats:null,bands:[],legK:1,sway:{L:0,R:0}};
PL.wounds=[]; PL.limp=0; PL.armWeak={L:0,R:0};

/* ---------- what he carries ----------
   PL.pouch = { mags:[{gun, rounds, cap}], loose:{'9mm','12g','38'} }: spare magazines (each fits one kind of gun) and loose rounds by
   calibre, kept as data so a later hands-on reload can turn them into real magazines on his chest. PL.ammo / PL.shells / PL.r38 read
   the totals (the shared contract: PL.ammo = carried 9 mm rounds not in a gun). The gun's own count stays it.ammo, as the core uses it. */
const RAY_CAL={pistol:'9mm',smg:'9mm',shotgun:'12g',revolver:'38'};
PL.pouch={mags:[],loose:{'9mm':0,'12g':0,'38':0}};
const rayCarried=cal=>PL.pouch.loose[cal]+PL.pouch.mags.reduce((s,m)=>s+(RAY_CAL[m.gun]===cal?m.rounds:0),0);
if(PROTO.on) for(const [k,cal] of [['ammo','9mm'],['shells','12g'],['r38','38']]) /* writing one sets it as that many loose rounds */
  Object.defineProperty(PL,k,{get:()=>rayCarried(cal),set:v=>{ PL.pouch.mags=PL.pouch.mags.filter(m=>RAY_CAL[m.gun]!==cal); PL.pouch.loose[cal]=Math.max(0,v|0); },enumerable:true,configurable:true});
const rayFits=(it,m)=>m.gun===it.key&&m.rounds>0;
/* what this gun could still be loaded with: a spare magazine that fits, or loose rounds of its calibre */
function rayHasLoad(it){ const w=WPN[it.key]; return (!w.loadOne&&PL.pouch.mags.some(m=>rayFits(it,m)))||PL.pouch.loose[RAY_CAL[it.key]||'9mm']>0; }
function raySpare(it){ const cal=RAY_CAL[it.key]||'9mm'; return PL.pouch.loose[cal]+PL.pouch.mags.reduce((s,m)=>s+(rayFits(it,m)?m.rounds:0),0); }
/* reloadHand asks first: nothing to load is a dry click and a tick in the hand, not a reload */
function rayCanLoad(h){ if(rayHasLoad(h.item)) return true;
  if(GAME.t-(h.dryT??-9)>.8){ h.dryT=GAME.t; sfx('click',.8); if(XR.on) buzz(h.hand,.35,25); protoEmit('stat','dryReload',1); } return false; }
/* the reload finishing: returns the gun's new count. A magazine gun swaps in the fullest spare (the one in the chamber stays, the old
   magazine goes back in the pouch if it still has rounds); with no spare magazine, loose rounds are pushed into the one in the gun.
   A tube or cylinder takes one loose round at a time. */
function rayLoad(it,w){ const P=PL.pouch,cal=RAY_CAL[it.key]||'9mm';
  if(w.loadOne){ if(P.loose[cal]>0){ P.loose[cal]--; return Math.min(w.mag,it.ammo+1); } return it.ammo; }
  let m=null; for(const q of P.mags) if(rayFits(it,q)&&(!m||q.rounds>m.rounds)) m=q;
  const ch=it.ammo>0?1:0;
  if(m&&!(m.rounds<=it.ammo-ch&&P.loose[cal]>0)){ P.mags.splice(P.mags.indexOf(m),1); const old=it.ammo-ch; if(old>0) P.mags.push({gun:it.key,rounds:old,cap:w.mag});
    const tot=m.rounds+ch; if(tot>w.mag) P.loose[cal]+=tot-w.mag; return Math.min(w.mag,tot); }
  const n=Math.min(w.mag-it.ammo,P.loose[cal]); P.loose[cal]-=n; return it.ammo+n; }
/* a gun off a dead man, or wrestled off a live one: a few rounds left in it */
function rayDropRounds(key){ const w=WPN[key],D=pnum('ray','drop',[2,6]); return Math.min(w.mag,D[0]+Math.floor(Math.random()*(D[1]-D[0]+1))); }
/* a handful of loose rounds for the floor builder: rayRoundsItem(5) -> a 'rounds' item holding 5 (item.n, item.cal) */
function rayRoundsItem(n,cal){ return Object.assign(newItem('rounds'),{n:n|0,cal:cal||'9mm'}); }
/* grabbing loose rounds: they go in the pouch, the pickup disappears */
function rayTakeLoose(h,P){ const w=WPN[P.item.key]; if(!w||w.tool!=='rounds') return false; const it=P.item,cal=it.cal||w.cal||'9mm',n=Math.max(0,Math.round(it.n??w.n??4));
  PL.pouch.loose[cal]=(PL.pouch.loose[cal]||0)+n; removePickup(P); raySnd('rattle',.9); if(XR.on) buzz(h.hand,.4,50); protoEmit('stat','rounds',n); return true; }

/* ---------- counting by feel (VR) ----------
   Hold A/X half a second with a gun in that hand: one buzz per round in the gun, then one long buzz if there's nothing left to load.
   A tap still reloads (on release). Self-contained: if A/X becomes the magazine release, delete this block and the one line in
   xrFrame that calls rayABTick, and put reloadHand back on the button. */
function rayABTick(h,held,dt){ const it=h.item,gun=it&&WPN[it.key].gun;
  if(held){ if(h.abT==null){ h.abT=0; h.abDone=false; } else h.abT+=dt; if(gun&&!h.abDone&&h.abT>=pnum('ray','countHold',.5)){ h.abDone=true; rayCountByFeel(h); } }
  else if(h.abT!=null){ if(gun&&!h.abDone) reloadHand(h); h.abT=null; } }
function rayCountByFeel(h){ const it=h.item,n=it.ammo; for(let i=0;i<n;i++) rayBuzzAt(i*.2,h,.8,35); if(!rayHasLoad(it)) rayBuzzAt(n*.2+.2,h,.55,420); protoEmit('stat','count',n); }
function rayBuzzAt(delay,h,v,ms){ RAY.bq.push({t:RAY.clk+delay,h,v,ms,it:h.item}); }
function rayBuzzQ(){ for(let i=RAY.bq.length-1;i>=0;i--){ const q=RAY.bq[i]; if(q.h.item!==q.it){ RAY.bq.splice(i,1); continue; } if(RAY.clk>=q.t){ buzz(q.h.hand,q.v,q.ms); RAY.bq.splice(i,1); } } }

/* ---------- his body, roughly, from the head and hands ----------
   A head ball, a torso capsule, two arms from the shoulders to where the hands really are (VR), two legs that fold forward in a crouch. */
function rayFrame(){ const b=camBasis(),e=b.eye; let fx=b.f[0],fz=b.f[2]; const l=Math.hypot(fx,fz); if(l<.25){ fx=-Math.sin(PL.yaw); fz=-Math.cos(PL.yaw); } else { fx/=l; fz/=l; }
  const base=PL.y||0,hc=[e[0]-fx*.07,e[1]+.01,e[2]-fz*.07],sh=e[1]-.25,pel=Math.max(sh-.5,base+.32);
  return {e,base,fl:[fx,0,fz],rl:[-fz,0,fx],hc,sh,pel}; }
/* where a hand is: tracked in VR; on the flat screen where the hands are drawn in front of you */
function rayHandPos(h,F){ if(XR.on) return mulP(h.M,FIST); F=F||rayFrame(); const s=h.side==='R'?1:-1; return [F.e[0]+F.fl[0]*.38+F.rl[0]*s*.19,F.e[1]-.22,F.e[2]+F.fl[2]*.38+F.rl[2]*s*.19]; }
function rayBodyCaps(F){ const {base,fl,rl,hc,sh,pel}=F,C=[],at=(s,y,f=0)=>[hc[0]+rl[0]*s+fl[0]*f,y,hc[2]+rl[2]*s+fl[2]*f];
  C.push({a:hc,b:hc,r:.11,part:'head',side:null},{a:at(0,pel+.06),b:at(0,sh-.05),r:.16,part:'torso',side:null});
  for(const s of [-1,1]){ const side=s<0?'L':'R',bend=clamp((.75-(pel-base))/.4,0,1),knee=at(s*.11,lerp(base+.48,base+.42,bend),.35*bend);
    C.push({a:at(s*.19,sh),b:rayHandPos(HANDS[side],F),r:.055,part:'arm',side},{a:at(s*.1,pel),b:knee,r:.08,part:'leg',side},{a:knee,b:at(s*.12,base+.06,.05+.2*bend),r:.065,part:'leg',side}); }
  return C; }
const rayGauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
/* where a shot from o lands on him: aimed round the point at height cy with a spread of sx by sy, the first capsule along the line takes it.
   cover: a table or a wall between the muzzle and that part takes it instead; null when every line was blocked (he was behind it) */
function rayPartFrom(o,cy,sx,sy,F,cover){ const C=rayBodyCaps(F),c=[F.hc[0],cy,F.hc[2]],d0=norm3(v3.sub(c,o)),rt=norm3(Math.abs(d0[1])>.95?[1,0,0]:v3.cross(d0,[0,1,0])),up=v3.cross(rt,d0);
  let blocked=0;
  for(let k=0;k<8;k++){ const d=norm3(v3.sub(v3.add(c,v3.add(v3.sc(rt,rayGauss()*sx),v3.sc(up,rayGauss()*sy))),o)); let best=null,bt=1e9;
    for(const s of C){ const h=raySeg(o,d,s.a,s.b,s.r); if(h&&h.t<bt){ bt=h.t; best=s; } }
    if(best&&cover&&rayBoxes(o,d,bt-.02,b=>!b.sightOnly)){ blocked++; continue; } /* sheets and other sight-only covers don't stop a round */
    if(best){ const p=v3.add(o,v3.sc(d,bt)); return {part:best.part,side:best.side||(v3.dot(v3.sub(p,F.hc),F.rl)<0?'L':'R'),p}; } }
  return blocked?null:{part:'torso',side:Math.random()<.5?'L':'R',p:c}; }

/* ---------- damage ----------
   hurtPlayer(d, src) calls this first with the prototype on. Shots and blows from the floor's men carry {E, kind:'gun'|'melee', w, n, mz, dist}:
   the damage comes from the table by weapon and body part, and src gets .hits [{part, side, p}], .part and .side for everyone listening.
   Anything else (a choke, a fall, whatever another system adds) keeps the damage its caller gave. */
const RAY_BLADE={machete:1,knife:1,bottle:1};
function rayHurtDmg(d,src){ src.raw=d; if(src.kind!=='gun'&&src.kind!=='melee') return d; const tab=pnum('ray','dmg',{})[src.w]; if(!tab) return d;
  const F=rayFrame(),gun=src.kind==='gun',n=Math.max(1,src.n||1),E=src.E,dist=src.dist??(E&&E.pos?Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z):3);
  const o=src.mz||(E&&E.pos?[E.pos[0],gun?1.4:1.45,E.pos[1]]:v3.add(F.e,v3.sc(F.fl,2))),spread=src.w==='shotgun'?1+dist*.12:1;
  let tot=0; const hits=[];
  for(let i=0;i<n;i++){ const hp=src.parts&&src.parts[i]?{part:src.parts[i],side:src.side||(Math.random()<.5?'L':'R'),p:null}
      :gun?rayPartFrom(o,F.sh-.3,.17*spread,.32*spread,F,true):rayPartFrom(o,F.e[1]-.2,.15,.2,F); /* guns: centre of mass, legs too; blows: chest and face */
    if(!hp){ src.blocked=(src.blocked||0)+1; continue; } /* crouched behind something: it took that one */
    let dm=tab[hp.part]??tab.torso; if(src.w==='shotgun') dm*=clamp(1.4-dist/7,.25,1.4); hits.push(hp); tot+=dm; }
  if(!hits.length){ sfx('ric',.6,[PL.x+rnd(-.4,.4),.7,PL.z+rnd(-.4,.4)]); return 0; } /* hurtPlayer stops at 0 */
  src.hits=hits; src.part=hits[0].part; src.side=hits[0].side; return Math.round(tot); }

/* the hit itself: hands knocked, legs gone for a moment, ears ringing, a grunt, blood on the hands, maybe a wound */
protoOn('hurt',(d,src)=>{ if(!PROTO.on||PL.dead||src.kind==='bleed') return;
  const k=clamp(.55+d/40,.6,1),K=pnum('ray','knock',[.15,.25]),R=pnum('ray','knockRot',.13),hits=src.hits||(src.part?[{part:src.part,side:src.side}]:[]);
  const away=src.E&&src.E.pos?norm3([PL.x-src.E.pos[0],0,PL.z-src.E.pos[1]]):[0,0,0];
  RAY.knock={t:GAME.t}; for(const s of ['L','R']){ const arm=hits.some(x=>x.part==='arm'&&x.side===s);
    RAY.knock[s]={off:v3.sc(norm3([rnd(-1,1)+away[0]*1.3,rnd(-.7,.35),rnd(-1,1)+away[2]*1.3]),(arm?K[1]:rnd(K[0],K[1]))*k),rot:v3.sc(norm3([rnd(-1,1),rnd(-1,1),rnd(-1,1)]),R*rnd(.6,1)*k*(arm?1.4:1))};
    RAY.blood[s]=Math.min(1,RAY.blood[s]+(arm?.25:.08)); } /* he grabs at it */
  RAY.hitT=GAME.t; for(const h of [HANDS.L,HANDS.R]) h.cd=Math.max(h.cd||0,pnum('ray','knockT',.4)+.05); /* the knock itself mustn't count as a swing into whoever hit him */
  if(d>=6&&RAY.ringCd<=0){ const ac=audio(); if(ac){ earRing(ac); RAY.ringCd=1.2; } }
  const pn=pnum('ray','painNoise',4); if(pn>0) noise([PL.x,0,PL.z],pn*rayVoice()); /* the grunt */
  const cls=RAY_BLADE[src.w]?'blade':src.kind==='gun'?'gun':null; if(!cls) return;
  const P=pnum('ray','open',{})[cls]||{},seen=new Set();
  for(const hp of hits){ if(hp.part==='head') continue; const key=hp.part+hp.side; if(seen.has(key)) continue; seen.add(key); if(Math.random()<(P[hp.part]??0)) rayWoundOpen(hp.part,hp.side,src); } });

/* ---------- wounds ---------- */
function rayWoundOpen(part,side,src){ const W=PL.wounds,open=W.filter(w=>!w.bandaged);
  const same=open.find(w=>w.part===part&&w.side===side)||(open.length>=pnum('ray','maxWounds',4)?open[0]:null);
  if(same){ same.bleed=Math.min(2,same.bleed+.5); return same; } /* hit again where it's already open: it bleeds harder */
  const w={part,side:side||null,bleed:1,bandaged:false,t:GAME.t,E:src&&src.E||null,kind:src&&src.kind,w:src&&src.w}; W.push(w); rayLimbs();
  protoEmit('rayWound',w); protoEmit('stat','rayWound',part); return w; }
/* what the wounds do to him: PL.limp (D's callouts), PL.armWeak {L,R} 0..1 (B: scale that hand's strength by 1-armWeak), the walking speed, the sway */
function rayLimbs(){ const W=PL.wounds,has=(p,s,b)=>W.some(w=>w.part===p&&(s==null||w.side===s)&&w.bandaged===b);
  const lo=has('leg',null,false),lb=has('leg',null,true); PL.limp=lo?1:lb?.35:0; RAY.legK=lo?pnum('ray','leg',.6):lb?pnum('ray','legBand',.85):1;
  for(const s of ['L','R']){ const o=has('arm',s,false),b=has('arm',s,true); PL.armWeak[s]=o?pnum('ray','arm',.6):b?pnum('ray','armBand',.3):0; RAY.sway[s]=o?1:b?.4:0; } }
/* walking speed (both the stick in VR and the keys): a hit takes the legs for 0.8 s, a leg wound slows him till it's wrapped */
function raySpeedK(){ if(!PROTO.on) return 1; const t=GAME.t-RAY.hitT,T=pnum('ray','slowT',.8),lo=pnum('ray','slowK',.4); let k=RAY.legK;
  if(t>=0&&t<T) k*=t<T*.7?lo:lerp(lo,1,(t-T*.7)/(T*.3)); return k; }
/* the VR stick: the same, times agent G's crouch/crawl scale (G slows the keyboard itself) */
function rayStickK(){ return raySpeedK()*(typeof rayMoveScale==='function'?rayMoveScale():1); }
/* a drop of his blood on the floor, where it falls from */
function rayDrop(open){ const w=open.reduce((a,b)=>b.bleed>a.bleed?b:a,open[0]); let x=PL.x,z=PL.z;
  if(w.part==='arm'&&XR.on){ const p=mulP(HANDS[w.side].M,FIST); x=p[0]; z=p[2]; }
  x+=rnd(-.08,.08); z+=rnd(-.08,.08); addDecal(DEC.splat,[x,.0028+Math.random()*.001,z],[0,1,0],rnd(.025,.05),260);
  if(Math.random()<.5) addDecal(DEC.splat,[x+rnd(-.07,.07),.0029,z+rnd(-.07,.07)],[0,1,0],rnd(.01,.02),260);
  const D={x,z,t:GAME.t}; RAYDROPS.push(D); if(RAYDROPS.length>pnum('ray','dropCap',80)) RAYDROPS.shift(); protoEmit('rayDrop',D); }

/* ---------- bandaging ----------
   A strip in one hand, circled round the wound: about one and a half turns inside 4 s. Leg: round the thigh on that side (where it would be
   from the head, standing or crouched). Arm: round the other forearm. Torso: circles on the chest or belly. Counted as the winding of the
   hand round the wound's axis, so it only cares that you go round, not how neatly. */
function rayWoundZone(w,h,F,p){ const {e,base,fl,rl,hc,sh}=F,s=w.side==='L'?-1:w.side==='R'?1:0; let c,A,r0,r1,al;
  if(w.part==='leg'){ const eh=e[1]-base,ck=clamp((1.45-eh)/.5,0,1),f=.04+.25*ck; c=[hc[0]+rl[0]*s*.11+fl[0]*f,clamp(base+eh*.42,base+.3,base+.75),hc[2]+rl[2]*s*.11+fl[2]*f];
    A=norm3(v3.add(v3.sc([0,1,0],1-ck),v3.sc(fl,ck))); r0=.04; r1=.34; al=.32; }
  else if(w.part==='arm'){ if(w.side===h.side) return null; const W=rayHandPos(HANDS[w.side],F),S=[hc[0]+rl[0]*s*.18-fl[0]*.05,sh+.01,hc[2]+rl[2]*s*.18-fl[2]*.05];
    A=norm3(v3.sub(S,W)); c=v3.add(W,v3.sc(A,.13)); r0=.03; r1=.24; al=.2; }
  else { c=[hc[0]+fl[0]*.16+rl[0]*s*.07,sh-.22,hc[2]+fl[2]*.16+rl[2]*s*.07]; A=fl; r0=.03; r1=.26; al=.3; }
  const d=v3.sub(p,c),ax=v3.dot(d,A),v=v3.sub(d,v3.sc(A,ax)),r=Math.hypot(v[0],v[1],v[2]),b1=norm3(v3.cross(A,Math.abs(A[0])<.9?[1,0,0]:[0,0,1]));
  return {w,in:Math.abs(ax)<al&&r>r0&&r<r1,v,b1,b2:v3.cross(A,b1)}; }
function rayWrapTick(h,dt){ const F=rayFrame(),p=rayHandPos(h,F); let st=h.wrapSt,G=null;
  if(st&&!st.w.bandaged){ const z=rayWoundZone(st.w,h,F,p); if(z&&z.in) G=z; }
  if(!G) for(const w of PL.wounds){ if(w.bandaged) continue; const z=rayWoundZone(w,h,F,p); if(z&&z.in){ G=z; break; } }
  if(!G){ if(st){ st.out+=dt; st.last=null; if(st.out>1) h.wrapSt=null; } return; }
  if(!st||st.w!==G.w) st=h.wrapSt={w:G.w,cum:0,last:null,hist:[],out:0,q:0};
  st.out=0; const a=Math.atan2(v3.dot(G.v,G.b2),v3.dot(G.v,G.b1));
  if(st.last!=null){ const d=Math.atan2(Math.sin(a-st.last),Math.cos(a-st.last)); if(Math.abs(d)<1.2) st.cum+=d; } st.last=a; /* a jump that big is the hand passing the axis, not a turn */
  st.hist.push(GAME.t,st.cum); while(st.hist.length>2&&GAME.t-st.hist[0]>pnum('ray','loopWin',4)) st.hist.splice(0,2);
  const turns=Math.abs(st.cum-st.hist[1])/(Math.PI*2),q=Math.floor(turns*4);
  if(q>st.q){ raySnd('cloth',.6); if(XR.on) buzz(h.hand,.15,20); } st.q=q; /* a rustle and a touch each quarter turn */
  if(turns>=pnum('ray','loops',1.5)) rayBandage(st.w,h); }
function rayBandage(w,h){ w.bandaged=true; w.bleed=0; w.bandT=GAME.t;
  if(h){ h.wrapSt=null; if(h.item&&WPN[h.item.key].tool==='strip') equip(h,null); if(XR.on) buzz(h.hand,.7,90); RAY.blood[h.side]=Math.min(1,RAY.blood[h.side]+.3); }
  raySnd('tie',1); if(w.part==='arm') rayBandShow(w); rayLimbs(); protoEmit('bandaged',w); protoEmit('stat','bandage',w.part); }
/* the worst open wound, for the flat-screen hold-to-wrap */
const rayWorst=()=>PL.wounds.filter(w=>!w.bandaged).sort((a,b)=>(b.part==='leg')-(a.part==='leg')||b.bleed-a.bleed)[0];
/* the wrap on his forearm, where he can see it */
const tRayStrip=tex(8,16,'#bdb4a0',g=>{ R(g,'#a89f8a',0,0,1,16); R(g,'#a89f8a',7,0,1,16); R(g,'rgba(110,80,40,.35)',2,3,3,4); R(g,'rgba(90,10,10,.55)',4,10,2,3); grain(g,14,881); });
const tRayBand=tex(8,8,'#b7ad97',g=>{ R(g,'#9c937e',0,0,8,1); R(g,'#9c937e',0,4,8,1); R(g,'rgba(120,8,8,.75)',2,2,4,3); R(g,'rgba(70,4,4,.85)',3,3,2,1); grain(g,12,882); });
const mRayStrip=M(tRayStrip),mRayBand=M(tRayBand);
function rayBandShow(w){ const a=HANDS[w.side].armN,k=RAY.bands.filter(b=>b.par===a).length; GEO_TEMP=true; RAY.bands.push(mk(cyl(.054,.052,.045,8),mRayBand,a,0,0,-.13-.055*k,Math.PI/2,0,0)); GEO_TEMP=false; }
function rayBandsClear(){ for(const n of RAY.bands){ const P=n.par; if(P){ const i=P.kids.indexOf(n); if(i>=0) P.kids.splice(i,1); } disposeTree(n); } RAY.bands.length=0; }

/* ---------- strips, the first-aid kit, loose rounds: the items ----------
   Fallback models; agent H's 87-props.js loads later and replaces WPN.medkit / WPN.rounds with the real ones. No melee field and no
   reach: holding one isn't a weapon. */
function pRayStrip(g){ mk(box(.05,.014,.09),mRayStrip,g,0,-.005,.02); mk(box(.042,.15,.006),mRayStrip,g,0,-.08,.065); mk(box(.04,.07,.006),mRayStrip,g,.004,-.19,.075,.25,0,.1); }
const tRayKit=tex(16,16,'#d9d4c6',g=>{ R(g,'#b8b2a2',0,0,16,1); R(g,'#b8b2a2',0,15,16,1); R(g,'#b3241c',6,3,4,10); R(g,'#b3241c',3,6,10,4); grain(g,12,883); });
function pRayKit(g){ mk(box(.12,.075,.035),M(tRayKit),g,0,0,.03); }
const mRayBrass=M(null,{color:0xc99a3e,emissive:0x2a1c06});
function pRayRounds(g){ for(let i=0;i<4;i++) mk(cyl(.0045,.0045,.019,6),mRayBrass,g,(i-1.5)*.011,0,i%2*.006,Math.PI/2); }
const RAY_TOOL={grip:[0,0,0],reach:.01,pts:[[0,0,0]],speed:99};
WPN.strip=Object.assign({label:'Strip of sheet',build:pRayStrip,tool:'strip'},RAY_TOOL);
if(!WPN.medkit) WPN.medkit=Object.assign({label:'First aid kit',build:pRayKit,tool:'medkit',fallback:true},RAY_TOOL);
if(!WPN.rounds) WPN.rounds=Object.assign({label:'Loose rounds',build:pRayRounds,tool:'rounds',n:4,fallback:true},RAY_TOOL);
/* a strip torn off something: agent G calls this when Ray tears a hung sheet. h: the hand (or the free one). false if no free hand */
function giveStrip(h){ if(!h||h.item){ const o=h&&!otherHand(h).item?otherHand(h):null; h=o||(!HANDS.L.item?HANDS.L:!HANDS.R.item?HANDS.R:null); } if(!h) return false; /* that hand busy: the other one */
  equip(h,newItem('strip')); sfx('rip',.8); if(XR.on) buzz(h.hand,.7,70); const tn=pnum('ray','tearNoise',3); if(tn>0) noise([PL.x,0,PL.z],tn); protoEmit('stat','strip',1); return true; }
/* any bed, mattress, sofa or hung sheet in reach of the hand: something to tear a strip from */
function rayClothNear(p,r){ if(typeof HIDES!=='undefined'&&Array.isArray(HIDES)) for(const S of HIDES){ if(!/bed|sheet|mattress|sofa|laundry/.test(S.kind||'')) continue;
    const c=Math.cos(S.yaw||0),s=Math.sin(S.yaw||0),dx=p[0]-S.x,dz=p[2]-S.z,lx=dx*c-dz*s,lz=dx*s+dz*c; if(Math.abs(lx)<(S.w||1)/2+r&&Math.abs(lz)<(S.d||1)/2+r&&p[1]<(S.h||1)+.4) return S; }
  for(const f of FLOOR.furn||[]){ if(!/bed|mattress|couch/.test(f.kind)) continue; const sz=f.info&&f.info.size||[1,1]; if(Math.hypot(p[0]-f.x,p[2]-f.z)<Math.max(sz[0],sz[1])/2+r&&p[1]<1.1) return f; }
  return null; }
/* grip with an empty hand on nothing else grabbable: by a bed or sheet, it tears a strip */
function rayGripCloth(h){ if(h.item||PL.dead) return false; const p=rayHandPos(h);
  if(typeof sheetNearest==='function'&&sheetNearest(p,.2)) return false; /* a hung sheet (86-hide.js): the grip holds it aside; a yank down tears the strip */
  return !!rayClothNear(p,.15)&&giveStrip(h); }
/* the first-aid kit: held to the chest with the trigger squeezed (flat: U held), 25 hp over 3 s, then it's gone. Let go early and what's
   left stays in the kit */
function rayMedTick(h,gdt,on){ const it=h.item; if(it.left==null) it.left=pnum('ray','heal',25);
  if(!on){ if(RAY.heal&&RAY.heal.h===h) RAY.heal=null; return; }
  if(!RAY.heal||RAY.heal.h!==h){ RAY.heal={h,snd:.4}; sfx('rip',.6); }
  const H=RAY.heal,amt=Math.min(it.left,pnum('ray','heal',25)/pnum('ray','healT',3)*gdt); it.left-=amt; PL.hp=Math.min(100,PL.hp+amt);
  H.snd-=gdt; if(H.snd<=0){ H.snd=.55; raySnd('wrap',.8); if(XR.on) buzz(h.hand,.2,30); }
  if(it.left<=1e-3){ equip(h,null); RAY.heal=null; raySnd('tie',.8); if(XR.on) buzz(h.hand,.6,80); protoEmit('stat','medkit',1); } }
function rayChestNear(p,F){ const c=[F.e[0]+F.fl[0]*.12,F.e[1]-.25,F.e[2]+F.fl[2]*.12]; return Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2])<pnum('ray','chest',.22); }
const rayTool=h=>h.item&&WPN[h.item.key]&&WPN[h.item.key].tool;

/* ---------- flat screen: U ----------
   Press U: pick up a strip, kit or loose rounds in front of you, or tear a strip off a bed you're next to.
   Hold U: with a kit in a hand, heal; with a strip, wrap the worst wound (4 s). */
addEventListener('keydown',e=>{ if(e.code!=='KeyU'||e.repeat||!PROTO.on||!GAME.started||PL.dead||XR.on) return; rayFlatUse(); });
function rayFlatUse(){ if(rayTool(HANDS.L)==='medkit'||rayTool(HANDS.R)==='medkit'||rayTool(HANDS.L)==='strip'||rayTool(HANDS.R)==='strip') return; /* holding is what does it */
  const {f,eye}=camBasis(); let best=null,bd=1.4;
  for(const P of LOOSE){ const w=WPN[P.item.key]; if(!w||!w.tool) continue; const q=P.node.p,d=Math.hypot(q[0]-eye[0],q[1]-eye[1],q[2]-eye[2]),fw=v3.dot(norm3(v3.sub(q,eye)),f); if(fw>.5&&d<bd){ bd=d; best=P; } }
  const h=!HANDS.L.item?HANDS.L:!HANDS.R.item?HANDS.R:HANDS.L;
  if(best){ if(rayTakeLoose(h,best)) return; if(h.item) equip(h,null); equip(h,best.item); removePickup(best); sfx('click',.6); return; }
  if(rayClothNear([eye[0]+f[0]*.6,.6,eye[2]+f[2]*.6],.5)) giveStrip(); }

/* ---------- blood on the hands ----------
   Built from what actually lands on them (blood and mist particles passing the fist), holding a bleeding man, a blade left in someone,
   being hurt, and wrapping wounds. Shown by swapping the hand and forearm textures for bloodier copies, four steps. */
function rayBloodTex(t,lv,s){ const c=t.c,w=c.width,hh=c.height; return tex(w,hh,null,g=>{ g.drawImage(c,0,0); const r=rng(900+lv*7+(s==='L'?3:0)+w),k=w/16,n=[0,3,7,14][lv];
  for(let i=0;i<n;i++){ const x=r()*w,y=r()*hh,rx=(1+r()*2.2)*k,ry=(1+r()*1.6)*k; g.fillStyle=`rgba(${70+r()*40|0},${4+r()*8|0},${4+r()*6|0},${.45+.35*r()})`; g.beginPath(); g.ellipse(x,y,rx,ry,r()*3,0,6.283); g.fill();
    if(r()<.5){ g.fillStyle='rgba(40,2,2,.6)'; g.beginPath(); g.ellipse(x,y,rx*.5,ry*.5,0,0,6.283); g.fill(); } } }); }
function rayMatsInit(){ RAY.mats={}; for(const s of ['L','R']){ const h=HANDS[s],L=[]; for(const mat of [...(h.hm?h.hm.mats:[]),h.armN.kids[0]&&h.armN.kids[0].mesh&&h.armN.kids[0].mesh.mats[0]]){ if(!mat||!mat.tex||!mat.tex.c) continue;
    L.push({mat,col:mat.color.slice(),lv:[mat.tex,null,null,null]}); } RAY.mats[s]=L; } }
function rayBloodShow(){ if(!RAY.mats) rayMatsInit(); for(const s of ['L','R']){ const b=RAY.blood[s],lv=b<.12?0:b<.4?1:b<.7?2:3; if(lv===RAY.bloodLv[s]) continue; RAY.bloodLv[s]=lv;
  for(const m of RAY.mats[s]){ if(!m.lv[lv]) m.lv[lv]=rayBloodTex(m.lv[0],lv,s); m.mat.tex=m.lv[lv]; m.mat.color=lv?[m.col[0]*(1-.05*lv),m.col[1]*(1-.1*lv),m.col[2]*(1-.1*lv)]:m.col; } } }
function rayBloodTick(dt){ RAY.bloodT-=dt; if(RAY.bloodT>0) return; RAY.bloodT=.15;
  for(const s of ['L','R']){ const h=HANDS[s],M_=h.M; let add=0;
    if(M_[12]||M_[13]||M_[14]){ const p=mulP(M_,FIST); for(const b of BP){ if(b.rest) continue; const mist=b.k==='mist'; if(!mist&&b.k!=='dark'&&b.k!=='bright') continue; const r=mist?.2:.09;
      if(Math.abs(b.x[0]-p[0])<r&&Math.abs(b.x[1]-p[1])<r&&Math.abs(b.x[2]-p[2])<r) add+=mist?.003:.012; } }
    if(h.grab&&h.grab.E&&h.grab.E.wounds&&h.grab.E.wounds.length) add+=.012; if(h.stuck) add+=.02;
    if(add) RAY.blood[s]=Math.min(1,RAY.blood[s]+add); }
  rayBloodShow(); }
protoOn('death',E=>{ if(!PROTO.on||!E||!E.B) return; const c=X_(E.B,PI_.chest); for(const s of ['L','R']){ const p=rayHandPos(HANDS[s]); if(Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2])<.9) RAY.blood[s]=Math.min(1,RAY.blood[s]+.2); } });

/* ---------- the hands in VR: knocked, swaying, shaking ----------
   Called from xrFrame between working out a hand's tracked matrix and drawing it, so the knock moves the hand, the gun and where it points,
   and nothing else: the head is never touched. Two hands on one gun move as one, led by the gun hand. */
function rayKnockEnv(t){ const T=pnum('ray','knockT',.4); return t<0||t>=T?0:t<.05?t/.05:.5*(1+Math.cos(Math.PI*(t-.05)/(T-.05))); }
function rayHandFx(h,dt){ if(PL.dead) return; const lead=h.supportOf||h,joined=!!(h.supportOf||h.support),t=GAME.t,LM=lead===h?h.M:lead.M;
  let w=[0,0,0],tr=[0,0,0],on=false;
  const e=rayKnockEnv(t-RAY.knock.t),kk=RAY.knock[lead.side]; if(e>0&&kk){ w=v3.sc(kk.rot,e); tr=v3.sc(kk.off,e); on=true; }
  const X=norm3(colOf(LM,0)),Y=norm3(colOf(LM,1)),ph=lead.side==='L'?1.7:0;
  /* an arm wound: a slow drift that won't hold still; a second hand on the gun takes half of it out */
  const sw=joined?Math.max(RAY.sway.L,RAY.sway.R)*.55:RAY.sway[h.side];
  if(sw>0){ const p=(Math.sin(t*1.3+ph)*.03+Math.sin(t*2.9+ph*2)*.015)*sw,y=(Math.sin(t*1.7+ph+2)*.028+Math.sin(t*3.7+ph)*.012)*sw;
    w=v3.add(w,v3.add(v3.sc(X,p),v3.sc(Y,y))); tr=v3.add(tr,[Math.sin(t*.9+ph)*.006*sw,Math.sin(t*1.4+ph)*.006*sw,Math.cos(t*1.1+ph)*.004*sw]); on=true; }
  /* the shakes, below 30 hp: small and quick */
  const th=pnum('ray','tremorHp',30),tk=clamp((th-PL.hp)/th,0,1);
  if(tk>0&&PL.hp<th){ const a=.25+.75*tk,p=(Math.sin(t*53+ph)*.004+Math.sin(t*71.3)*.003)*a,y=(Math.sin(t*61.7+ph)*.004+Math.sin(t*47.1+1)*.002)*a;
    w=v3.add(w,v3.add(v3.sc(X,p),v3.sc(Y,y))); tr=v3.add(tr,[Math.sin(t*67+ph)*.0018*a,Math.sin(t*59.3)*.0018*a,Math.sin(t*73.9+ph)*.0012*a]); on=true; }
  if(!on) return;
  const M_=h.M,P=mulP(LM,FIST),ang=Math.hypot(w[0],w[1],w[2]);
  if(ang>1e-7){ const k=v3.sc(w,1/ang),c=Math.cos(ang),s=Math.sin(ang);
    for(let i=0;i<3;i++){ const v=rodr([M_[i*4],M_[i*4+1],M_[i*4+2]],k,c,s); M_[i*4]=v[0]; M_[i*4+1]=v[1]; M_[i*4+2]=v[2]; }
    const o=rodr([M_[12]-P[0],M_[13]-P[1],M_[14]-P[2]],k,c,s); M_[12]=P[0]+o[0]; M_[13]=P[1]+o[1]; M_[14]=P[2]+o[2]; }
  M_[12]+=tr[0]; M_[13]+=tr[1]; M_[14]+=tr[2]; }

/* ---------- sounds that are his own ---------- */
const rayVoice=()=>typeof rayVoiceScale==='function'?rayVoiceScale():1; /* agent G (86-hide.js): 0.5 with his hand over his mouth */
function raySnd(kind,vol=1){ const ac=audio(); if(!ac||!NOISE) return; const B=audioBus(ac),t=ac.currentTime,out=ac.createGain(); out.gain.value=vol; out.connect(B.inp);
  const nz=(f0,f1,d0,dur,g,q=1,type='bandpass',att=.01)=>{ const s=ac.createBufferSource(); s.buffer=NOISE; const f=ac.createBiquadFilter(); f.type=type; f.Q.value=q; f.frequency.setValueAtTime(f0,t+d0); f.frequency.exponentialRampToValueAtTime(f1,t+d0+dur);
    const gg=ac.createGain(); gg.gain.setValueAtTime(.0001,t+d0); gg.gain.exponentialRampToValueAtTime(g,t+d0+att); gg.gain.exponentialRampToValueAtTime(.0001,t+d0+dur); s.connect(f); f.connect(gg); gg.connect(out); s.start(t+d0,Math.random()*.5); s.stop(t+d0+dur+.05); };
  const tk=(hz,d0,g)=>{ const o=ac.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(hz,t+d0); o.frequency.exponentialRampToValueAtTime(hz*.8,t+d0+.03); const gg=ac.createGain(); gg.gain.setValueAtTime(g,t+d0); gg.gain.exponentialRampToValueAtTime(.0001,t+d0+.04); o.connect(gg); gg.connect(out); o.start(t+d0); o.stop(t+d0+.05); };
  if(kind==='breath'){ nz(700,1300,0,.55,.1,.8,'bandpass',.3); nz(1100,500,.7,.75,.12,.8,'bandpass',.08); }   /* in through the teeth, out ragged */
  else if(kind==='rattle'){ for(let i=0;i<4;i++) tk(rnd(2600,4200),i*.035+rnd(0,.02),.08); nz(5000,3000,0,.12,.04,2,'highpass'); } /* brass in a palm */
  else if(kind==='cloth'){ nz(1800,900,0,.22,.12,1.2,'bandpass',.04); }
  else if(kind==='tie'){ nz(2200,700,0,.18,.18,1.5); nz(900,300,.15,.25,.14,1); }
  else if(kind==='wrap'){ nz(1500,700,0,.6,.08,.9,'bandpass',.15); } }

/* ---------- every frame ---------- */
protoOn('tick',(gdt,dt)=>{ if(!PROTO.on) return;
  if(RAY.fresh){ RAY.fresh=false; for(const h of [HANDS.L,HANDS.R]){ const it=h.item; if(it&&WPN[it.key].gun&&!it.rayN) it.ammo=Math.min(WPN[it.key].mag,pnum('ray','gun',9)); } } /* the gun he starts with: Novak's, 9 in it */
  for(const h of [HANDS.L,HANDS.R]){ if(h.item) h.item.rayN=true; if(h.ammoN) h.ammoN.vis=false; } /* no number on the gun: count by feel */
  if(!GAME.started) return; RAY.clk+=dt; rayBuzzQ(); RAY.ringCd-=dt;
  if(PL.dead){ RAY.heal=null; return; }
  /* bleeding */
  const open=PL.wounds.filter(w=>!w.bandaged);
  if(open.length){ let b=0; for(const w of open) b+=w.bleed; const loss=b*pnum('ray','bleed',.25)*gdt;
    if(PL.hp-loss<=0){ const w=open[0]; hurtPlayer(PL.hp,{kind:'bleed',part:w.part,side:w.side,E:w.E,w:w.w}); return; } PL.hp-=loss;
    const st=Math.hypot(PL.x-RAY.lx,PL.z-RAY.lz); if(st<1){ RAY.moved+=st; RAY.still=st<.1*gdt?RAY.still+gdt:0; }
    if(RAY.moved>=pnum('ray','dropEvery',2)/Math.min(1.6,Math.sqrt(b))||RAY.still>=pnum('ray','dropStill',10)){ RAY.moved=0; RAY.still=0; rayDrop(open); } }
  RAY.lx=PL.x; RAY.lz=PL.z;
  /* what's in his hands: a kit, a strip */
  const F=XR.on?rayFrame():null; let usedFlat=false;
  for(const h of [HANDS.L,HANDS.R]){ const tl=rayTool(h); if(!tl){ if(h.wrapSt) h.wrapSt=null; continue; }
    if(tl==='medkit') rayMedTick(h,gdt,XR.on?!!h.trigHeld&&rayChestNear(rayHandPos(h,F),F):!!KEYS.KeyU&&!usedFlat&&(usedFlat=true));
    else if(tl==='strip'){ if(XR.on) rayWrapTick(h,dt);
      else if(KEYS.KeyU&&!usedFlat&&open.length){ usedFlat=true; RAY.flatT+=gdt; if(RAY.flatT>=pnum('ray','flatWrap',4)){ RAY.flatT=0; rayBandage(rayWorst(),h); } else if((RAY.flatT%.6)<gdt) raySnd('cloth',.5); } } }
  if(!XR.on&&!KEYS.KeyU) RAY.flatT=0;
  rayBloodTick(dt);
  /* breathing: heavier as he weakens; close enough and they hear it */
  const bh=pnum('ray','breathHp',40); if(PL.hp<bh){ RAY.breathT-=gdt; if(RAY.breathT<=0){ const k=clamp((bh-PL.hp)/bh,0,1),mu=rayVoice(),nr=pnum('ray','breathNoise',1.2);
    RAY.breathT=lerp(3.2,1.7,k); raySnd('breath',(.35+.65*k)*mu); if(nr>0) noise([PL.x,0,PL.z],nr*mu*(1+k*.6)); } }
  /* the heart: only you hear it, louder and faster the closer to dead; a soft pulse in both hands with it in VR */
  const hh=pnum('ray','heartHp',35); if(PL.hp<hh&&!PL.dead){ RAY.heartT=(RAY.heartT??0)-gdt; if(RAY.heartT<=0){ const k=clamp((hh-PL.hp)/(hh-5),0,1); RAY.heartT=60/lerp(78,128,k); rayHeart(.35+.65*k); if(XR.on){ buzz('left',.08+.12*k,25); buzz('right',.08+.12*k,25); } } } });
function rayHeart(v){ const ac=audio(); if(!ac) return; const t=ac.currentTime,out=ac.createGain(); out.gain.value=v*.9; out.connect(ac.destination); /* straight out: it's inside his head, no room */
  for(const [d0,g] of [[0,1],[.17,.62]]){ const o=ac.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(62,t+d0); o.frequency.exponentialRampToValueAtTime(38,t+d0+.12);
    const gg=ac.createGain(); gg.gain.setValueAtTime(.0001,t+d0); gg.gain.exponentialRampToValueAtTime(g,t+d0+.012); gg.gain.exponentialRampToValueAtTime(.0001,t+d0+.16); o.connect(gg); gg.connect(out); o.start(t+d0); o.stop(t+d0+.2); } }

/* every start and restart: hurt, one spare magazine, clean hands, no bullet time */
protoOn('reset',()=>{ if(!PROTO.on) return; PL.hp=pnum('ray','hp',100); PL.wounds.length=0; RAYDROPS.length=0;
  PL.pouch.mags=[{gun:'pistol',rounds:pnum('ray','pouch',7),cap:WPN.pistol.mag}]; PL.pouch.loose={'9mm':0,'12g':0,'38':0};
  Object.assign(RAY,{hitT:-9,knock:{t:-9},heal:null,flatT:0,breathT:3,lx:PL.x,lz:PL.z,moved:0,still:0,fresh:true}); RAY.bq.length=0; RAY.blood.L=RAY.blood.R=0;
  for(const h of [HANDS.L,HANDS.R]){ h.wrapSt=null; h.abT=null; } rayBandsClear(); rayLimbs(); rayBloodShow();
  GAME.slow=false; GAME.ts=1; for(const id of ['bSlow','bSlowT']){ const b=$(id); if(b) b.style.display='none'; } });
