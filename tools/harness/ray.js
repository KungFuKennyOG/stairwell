// Ray's body and danger (agent A, src/80-ray.js). Steps the game's own update() with timers on game time and world matrices refreshed.
// usage: node tools/harness/ray.js <index.html> fight "<query>" [runs] [maxSeconds]   pistol-fight bot (bot.js 'loud'), stops at the first death; UNSUP=1 takes the can off
//        node tools/harness/ray.js <index.html> units                                  scripted checks of the prototype rules and the old game
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const file = 'file://' + path.resolve(process.argv[2]), test = process.argv[3] || 'units';

const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__R=(function(){
  const L={hurt:[],buzz:[]}; protoOn('hurt',(d,src)=>L.hurt.push({t:+GAME.t.toFixed(2),d,kind:src.kind,w:src.w,part:src.part,who:src.E&&src.E.name}));
  const _buzz=buzz; buzz=function(hand,v,ms){ L.buzz.push([+GAME.t.toFixed(2),hand,v,ms]); return _buzz.apply(this,arguments); };
  function step(dt){ if(L.calm) for(const E of enemies){ E.atkCd=Math.max(E.atkCd||0,5); E.atkT=-1; E.burstN=0; } /* units: nobody fights back */ update(dt,performance.now()); updateWorld(world,null);
    if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ L.err=String(e).slice(0,150); } } } }
  const gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const out=E=>E.dead||E.st==='down'||E.surr||E.st==='kneel', obvious=E=>!E.civ&&!E.ally&&(E.wpnHeld||E.aware||!E.concealed);
  /* the pistol-fight bot from bot.js ('loud'): walk to the nearest obvious man, shoot him when you see him, leave when nobody is left */
  function fight(maxT,sigma,react,gap){ const dt=1/30,t0=GAME.t,S={seen:new Map(),nextShot:0,stuckT:0,lastP:[PL.x,PL.z],jit:0}; let minHp=PL.hp,shots=0,exit=false;
    const walk=(tx,tz)=>{ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; KEYS.KeyW=true; };
    while(GAME.t-t0<maxT){ if(PL.dead) break; minHp=Math.min(minHp,PL.hp); KEYS.KeyW=false; if(GAME.climbing){ exit=true; break; }
      const eye=[PL.x,1.62,PL.z],T=enemies.filter(E=>obvious(E)&&!out(E)).map(E=>({E,d:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)})).sort((a,b)=>a.d-b.d);
      const vis=T.find(o=>o.d<16&&sightClear(eye,X_(o.E.B,PI_.head)));
      if(vis){ const E=vis.E; if(!S.seen.has(E)) S.seen.set(E,GAME.t); const ch=X_(E.B,PI_.chest),nk=X_(E.B,PI_.neck),p=[(ch[0]+nk[0])/2,(ch[1]+nk[1])/2,(ch[2]+nk[2])/2]; window.__game.aimAt(p);
        if(GAME.t-S.seen.get(E)>react&&GAME.t>=S.nextShot&&HANDS.R.item){ const d=norm3(v3.sub(p,eye)),e=sigma*Math.PI/180,dd=norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e]); if(fireHand(HANDS.R,{o:eye,d:dd})){ shots++; S.nextShot=GAME.t+gap; } } }
      else if(T.length) walk(T[0].E.pos[0],T[0].E.pos[1]);
      else { if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; } else walk(TL+.1,0); }
      step(dt); S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&KEYS.KeyW?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
    KEYS.KeyW=false; const bad=enemies.filter(E=>!E.civ&&!E.ally),last=L.hurt[L.hurt.length-1];
    return {died:PL.dead,t:+(GAME.t-t0).toFixed(1),exit,minHp:Math.round(minHp),hits:L.hurt.length,dmg:L.hurt.reduce((s,h)=>s+h.d,0),shots,hostile:bad.length,killed:bad.filter(E=>E.dead).length,down:bad.filter(E=>!E.dead&&out(E)).length,
      inGun:HANDS.R.item?HANDS.R.item.ammo:null,pouch:PL.ammo,wounds:(PL.wounds||[]).map(w=>w.part+(w.side||'')).join(','),drops:typeof RAYDROPS!=='undefined'?RAYDROPS.length:0,
      parts:L.hurt.map(h=>(h.w||h.kind)+':'+h.part+':'+h.d).join(' '),cause:PL.dead&&last?last.kind+'/'+(last.w||'-')+'/'+last.part+'/'+(last.who||'-'):null}; }
  return {L,step,fight};
})();`;

/* scripted checks: run inside the page after CORE. Each returns [name, pass, detail] */
const UNITS_OLD = `(()=>{ const R=window.__R,out=[],ok=(n,p,d)=>out.push([n,!!p,d]); R.L.calm=true;
  ok('proto off',!PROTO.on,PROTO.on);
  PL.hp=50; PL.hurtT=0; for(let i=0;i<150;i++) R.step(1/30); ok('regen still works (50 -> ~63.5 after 5 s)',PL.hp>60&&PL.hp<67,PL.hp.toFixed(1));
  PL.hp=100; hurtPlayer(30,{E:enemies.find(E=>!E.civ),kind:'gun',w:'pistol',n:1}); ok('damage is the caller\\'s (30 -> hp 70)',PL.hp===70,PL.hp);
  ok('no wounds opened',(PL.wounds||[]).length===0,(PL.wounds||[]).length);
  const was=GAME.slow; toggleSlow(); ok('bullet time toggles',GAME.slow!==was,GAME.slow); toggleSlow();
  const h=HANDS.R; equip(h,newItem('pistol')); h.item.ammo=3; reloadHand(h); for(let i=0;i<50;i++) R.step(1/30); ok('free reload refills (3 -> 12)',h.item.ammo===12,h.item.ammo);
  const E=enemies.find(E=>!E.civ&&E.wpnHeld&&RANGED[E.kind]); if(E){ const n0=LOOSE.length; dropWeapon(E); const P=LOOSE[LOOSE.length-1]; ok('dropped gun keeps old ammo rule (25-75% of mag)',LOOSE.length>n0&&P.item.ammo>=1,P&&P.item.ammo); }
  ok('ammo label shown on the gun',h.ammoN&&h.ammoN.vis!==false,h.ammoN&&h.ammoN.vis);
  return out; })()`;

const UNITS_PROTO = `(()=>{ const R=window.__R,out=[],ok=(n,p,d)=>out.push([n,!!p,d]); R.L.calm=true; const step=s=>{ for(let i=0;i<Math.round(s*30);i++) R.step(1/30); };
  const shooter=enemies.find(E=>!E.civ&&E.wpnHeld&&RANGED[E.kind])||enemies[0]; const freeze=()=>{ for(const E of enemies){ E.aware=false; E.atkCd=99; E.st=E.dead?E.st:'idle'; } };
  ok('proto on',PROTO.on,PROTO.on); R.step(1/30);
  /* a shooter standing in open floor in front of him (the floor's own men are only used as names) */
  const front=k=>{ const b=camBasis(),fl=norm3([b.f[0],0,b.f[2]]),mz=[PL.x+fl[0]*k,1.4,PL.z+fl[2]*k]; return mz; };
  ok('open line to the test shooter',!rayBoxes(front(4),norm3(v3.sub([PL.x,1.2,PL.z],front(4))),4),front(4).map(v=>+v.toFixed(1)));
  ok('starts at 75',PL.hp===75,PL.hp); ok('Novak\\'s pistol has 9',HANDS.R.item&&HANDS.R.item.ammo===9,HANDS.R.item&&HANDS.R.item.ammo); ok('7 spare rounds (PL.ammo)',PL.ammo===7,PL.ammo);
  ok('no number on the gun',HANDS.R.ammoN&&HANDS.R.ammoN.vis===false,HANDS.R.ammoN&&HANDS.R.ammoN.vis);
  /* bullet time */
  toggleSlow(); ok('no bullet time (toggleSlow)',!GAME.slow,GAME.slow); window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyT'})); ok('no bullet time (T key)',!GAME.slow,GAME.slow);
  /* no regen */
  for(const E of enemies) E.atkCd=99; const h0=PL.hp; PL.hurtT=9; step(6); ok('no regeneration in 6 s',PL.hp<=h0,PL.hp.toFixed(2)+' from '+h0);
  /* reload from the pouch */
  const h=HANDS.R,it=h.item; it.ammo=6; reloadHand(h); step(1.5); ok('reload swaps in the spare magazine (6 in gun -> 7+1 = 8, old mag of 5 back in the pouch)',it.ammo===8&&PL.ammo===5,it.ammo+' / pouch '+PL.ammo);
  it.ammo=0; reloadHand(h); step(1.5); ok('empty gun takes the 5-round magazine',it.ammo===5&&PL.ammo===0,it.ammo+' / pouch '+PL.ammo);
  const nb=R.L.buzz.length; it.ammo=2; reloadHand(h); step(1.5); ok('nothing to load: no reload, ammo unchanged',it.ammo===2&&!(it.reload>0),it.ammo);
  PL.pouch.loose['9mm']=4; it.ammo=3; reloadHand(h); step(1.5); ok('no magazine: loose rounds thumbed in (3+4=7)',it.ammo===7&&PL.ammo===0,it.ammo+' / pouch '+PL.ammo);
  /* counting by feel */
  XR.on=true; R.L.buzz.length=0; it.ammo=4; rayABTick(h,true,0); for(let i=0;i<20;i++){ rayABTick(h,true,1/30); R.step(1/30); } rayABTick(h,false,1/30); step(1.5);
  const bz=R.L.buzz.filter(b=>b[1]==='right'),short=bz.filter(b=>b[3]===35).length,long=bz.filter(b=>b[3]===420).length;
  ok('hold A: 4 short buzzes, then a long one (pouch empty)',short===4&&long===1&&!(it.reload>0)&&it.ammo===4,short+' short, '+long+' long, ammo '+it.ammo);
  PL.pouch.mags.push({gun:'pistol',rounds:6,cap:12}); R.L.buzz.length=0; rayABTick(h,true,0); for(let i=0;i<20;i++){ rayABTick(h,true,1/30); R.step(1/30); } rayABTick(h,false,1/30); step(1.5);
  ok('hold A with a spare magazine: no long buzz',R.L.buzz.filter(b=>b[3]===420).length===0&&R.L.buzz.filter(b=>b[3]===35).length===4,R.L.buzz.length);
  rayABTick(h,true,0); for(let i=0;i<6;i++){ rayABTick(h,true,1/30); R.step(1/30); } rayABTick(h,false,1/30); ok('tap A reloads',it.reload>0,it.reload); step(1.5); ok('...from the spare (4 -> 6+1 = 7)',it.ammo===7,it.ammo);
  XR.on=false;
  /* damage by part */
  freeze(); const tally={}; let dmgOk=true; const want={head:70,torso:30,arm:15,leg:15};
  for(let i=0;i<400;i++){ PL.hp=100; PL.dead=false; PL.wounds.length=0; const src={E:shooter,kind:'gun',w:'pistol',n:1,mz:front(4),dist:4}; const hp=PL.hp; hurtPlayer(10,src); const d=hp-PL.hp; tally[src.part]=(tally[src.part]||0)+1; if(d!==want[src.part]) dmgOk=false; }
  ok('pistol damage by part (head 70, torso 30, limb 15)',dmgOk,JSON.stringify(tally));
  ok('part mix: mostly torso, some legs and arms, few heads',tally.torso>200&&(tally.leg||0)>20&&(tally.head||0)<40,JSON.stringify(tally));
  { PL.hp=100; PL.dead=false; const src={E:shooter,kind:'gun',w:'shotgun',n:5,mz:front(1.5),dist:1.5}; hurtPlayer(20,src); ok('close shotgun (5 pellets at 1.5 m) near-lethal',100-PL.hp>=60,100-PL.hp); }
  { PL.hp=100; PL.dead=false; const src={E:shooter,kind:'melee',w:'machete'}; hurtPlayer(17,src); ok('machete blow by part',[45,28,20].includes(100-PL.hp),src.part+' '+(100-PL.hp)); }
  { PL.hp=100; PL.dead=false; const src={kind:'choke',part:'neck'}; hurtPlayer(12,src); ok('unknown source keeps its damage',PL.hp===88,PL.hp); }
  /* wounds and bleeding */
  PL.wounds.length=0; rayLimbs(); PL.hp=100; let nw=0; protoOn('rayWound',()=>nw++);
  for(let i=0;i<60&&!PL.wounds.some(w=>w.part==='leg');i++){ PL.hp=100; PL.dead=false; hurtPlayer(10,{E:shooter,kind:'gun',w:'pistol',n:1,mz:front(4),dist:4}); }
  ok('a leg hit opens a leg wound (rayWound fired)',PL.wounds.some(w=>w.part==='leg')&&nw>0,PL.wounds.map(w=>w.part+w.side).join(','));
  PL.wounds.length=0; const lw=rayWoundOpen('leg','L',{E:shooter,kind:'gun'}); RAY.hitT=-9; ok('leg wound: speed 60%, limp 1',Math.abs(raySpeedK()-.6)<1e-6&&PL.limp===1,raySpeedK()+' limp '+PL.limp);
  PL.hp=60; freeze(); step(8); ok('one wound bleeds 1 hp per 4 s (60 -> 58 in 8 s)',Math.abs(PL.hp-58)<.15,PL.hp.toFixed(2));
  RAYDROPS.length=0; for(let i=0;i<180;i++){ PL.x+=.04*(i%60<30?1:-1); R.step(1/30); } ok('drops every 2 m moved (7.2 m -> 3)',RAYDROPS.length===3,RAYDROPS.length);
  RAYDROPS.length=0; step(10.5); ok('a drop every 10 s standing still',RAYDROPS.length===1,RAYDROPS.length);
  /* first aid, flat */
  equip(HANDS.L,newItem('medkit')); PL.hp=40; KEYS.KeyU=true; step(3.2); KEYS.KeyU=false; ok('flat: hold U with a kit, +25 over 3 s, kit used up',Math.abs(PL.hp-(40+25-.25*3.2))<1&&!HANDS.L.item,PL.hp.toFixed(1)+' '+(HANDS.L.item&&HANDS.L.item.key));
  /* bandage, flat */
  giveStrip(HANDS.L); ok('giveStrip puts a strip in the hand',HANDS.L.item&&HANDS.L.item.key==='strip',HANDS.L.item&&HANDS.L.item.key);
  KEYS.KeyU=true; step(4.2); KEYS.KeyU=false; ok('flat: hold U 4 s with a strip wraps it',lw.bandaged&&!HANDS.L.item,lw.bandaged); RAY.hitT=-9; ok('bandaged leg: 85%, limp .35',Math.abs(raySpeedK()-.85)<1e-6&&PL.limp===.35,raySpeedK());
  const hb=PL.hp; step(4); ok('bandaged: no more bleeding',Math.abs(PL.hp-hb)<1e-6,PL.hp-hb);
  /* hit reaction */
  PL.hp=100; hurtPlayer(10,{E:shooter,kind:'gun',w:'pistol',n:1,mz:front(4),dist:4}); const hit=GAME.t; R.step(1/30); ok('hit: movement 40% at once',Math.abs(raySpeedK()/RAY.legK-.4)<1e-6,raySpeedK());
  const M0=m4.make(); M0[12]=PL.x; M0[13]=1.2; M0[14]=PL.z; let peak=0; const H2=HANDS.L; const keep=H2.M; for(let i=0;i<12;i++){ const tt=hit+i/30; GAME.t=tt; H2.M=M0.slice(); rayHandFx(H2,1/30); peak=Math.max(peak,Math.hypot(H2.M[12]-M0[12],H2.M[13]-M0[13],H2.M[14]-M0[14])); }
  GAME.t=hit+.45; H2.M=M0.slice(); rayHandFx(H2,1/30); const after=Math.hypot(H2.M[12]-M0[12],H2.M[13]-M0[13],H2.M[14]-M0[14]); H2.M=keep;
  ok('hit: hand knocked 15-25 cm (allowing the damage scale), back by 0.4 s',peak>.1&&peak<=.26&&after<1e-6,peak.toFixed(3)+' then '+after.toFixed(4));
  GAME.t=hit+.9; ok('hit: full speed again after 0.8 s',Math.abs(raySpeedK()-RAY.legK)<1e-6,raySpeedK());
  ok('no red screen wash in proto',XR.flash===0,XR.flash);
  /* loose rounds and dropped guns */
  const P=addPickup(rayRoundsItem(5),m4.make(),[0,0,0]); const pa=PL.ammo,k0=LOOSE.length; ok('rayTakeLoose: +5 rounds, pickup gone',rayTakeLoose(HANDS.L,P)&&PL.ammo===pa+5&&LOOSE.length===k0-1,PL.ammo);
  const E=enemies.find(E=>!E.civ&&!E.dead&&E.wpnHeld&&RANGED[E.kind]&&KIND_WPN[E.kind]==='pistol'); if(E){ const r=[]; for(let i=0;i<30;i++) r.push(rayDropRounds('pistol')); dropWeapon(E); const Q=LOOSE[LOOSE.length-1]; ok('dead man\\'s pistol holds 2-6',Q.item.ammo>=2&&Q.item.ammo<=6&&Math.min(...r)>=2&&Math.max(...r)<=6,Q.item.ammo+' ['+Math.min(...r)+'-'+Math.max(...r)+']'); }
  /* bleeding to death says what did it */
  PL.wounds.length=0; rayWoundOpen('torso','R',{E:shooter,kind:'gun',w:'pistol'}); PL.hp=.3; PL.dead=false; R.L.hurt.length=0; step(2); const last=R.L.hurt[R.L.hurt.length-1];
  ok('bleeding out: death, src kind bleed with who did it',PL.dead&&last&&last.kind==='bleed'&&last.who===shooter.name,PL.dead+' '+JSON.stringify(last));
  return out; })()`;

/* the bandage gesture in VR, with scripted head and hand matrices */
const UNITS_WRAP = `(()=>{ const R=window.__R,out=[],ok=(n,p,d)=>out.push([n,!!p,d]); R.L.calm=true;
  for(const E of enemies){ E.aware=false; E.atkCd=99; } XR.on=true; const eye=[PL.x,1.62,PL.z]; XR.head={f:[0,0,-1],r:[1,0,0],u:[0,1,0],eye}; PL.yaw=0; /* facing -z: right is +x */
  const at=p=>{ const m=m4.make(); m[12]=p[0]; m[13]=p[1]; m[14]=p[2]; return m; }, fistOff=p=>[p[0]-FIST[0],p[1]-FIST[1],p[2]-FIST[2]];
  /* run a circle of the strip hand round a centre, about an axis, at so many turns per second for so long; the other hand held still */
  function run(hand,c,ax,rad,tps,secs,other){ const b1=Math.abs(ax[0])<.9?norm3(v3.cross(ax,[1,0,0])):norm3(v3.cross(ax,[0,0,1])),b2=v3.cross(ax,b1);
    for(let i=0;i<Math.round(secs*30);i++){ const a=i/30*tps*6.283,p=v3.add(c,v3.add(v3.sc(b1,Math.cos(a)*rad),v3.sc(b2,Math.sin(a)*rad))); hand.M=at(fistOff(p)); if(other) other.h.M=at(fistOff(other.p)); R.step(1/30); } } /* the frame's own tick does the wrap */
  const reset=()=>{ PL.wounds.length=0; for(const h of [HANDS.L,HANDS.R]){ equip(h,null); h.wrapSt=null; } rayBandsClear(); rayLimbs(); };
  const thighL=[PL.x-.11,1.62*.42,PL.z-.04+.0], thighR=[PL.x+.11,1.62*.42,PL.z-.04];
  reset(); let w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); run(HANDS.R,thighL,[0,1,0],.12,.8,2.5); ok('leg: 2 turns round the left thigh in 2.5 s wraps it',w.bandaged&&!HANDS.R.item,w.bandaged);
  reset(); w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); run(HANDS.R,thighL,[0,1,0],.12,.25,4); ok('leg: too slow (1 turn in 4 s) does not',!w.bandaged,w.bandaged);
  reset(); w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); run(HANDS.R,thighR,[0,1,0],.12,.8,2.5); ok('leg: round the wrong thigh does not',!w.bandaged,w.bandaged);
  reset(); w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); run(HANDS.R,thighL,[0,1,0],.6,.8,2.5); ok('leg: a wide circle (60 cm) does not',!w.bandaged,w.bandaged);
  reset(); w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); for(let i=0;i<150;i++){ HANDS.R.M=at(fistOff(v3.add(thighL,[.12,0,0]))); R.step(1/30); } ok('leg: the hand held still on it does not',!w.bandaged,w.bandaged);
  reset(); w=rayWoundOpen('leg','L',{}); giveStrip(HANDS.R); { const c=thighL,b1=[0,0,-1],b2=[-1,0,0]; for(let i=0;i<120;i++){ const a=Math.sin(i/30*6)*2,p=v3.add(c,v3.add(v3.sc(b1,Math.cos(a)*.12),v3.sc(b2,Math.sin(a)*.12))); HANDS.R.M=at(fistOff(p)); R.step(1/30); } }
  ok('leg: scrubbing back and forth does not',!w.bandaged,w.bandaged);
  /* crouched: head at 1.0 m, the thigh runs forward */
  reset(); XR.head.eye=[PL.x,1.0,PL.z]; w=rayWoundOpen('leg','R',{}); giveStrip(HANDS.L); { const ck=clamp((1.45-1)/.5,0,1),c=[PL.x+.11-0,clamp(1.0*.42,.3,.75),PL.z-.04-.07*0-.25*ck]; run(HANDS.L,[c[0],c[1],c[2]+.07],[0,0,-1],.1,.8,2.5); }
  ok('leg, crouched: round the thigh (now pointing forward) wraps it',w.bandaged,w.bandaged); XR.head.eye=eye;
  /* arm: the strip in the right hand round the left forearm */
  reset(); w=rayWoundOpen('arm','L',{}); giveStrip(HANDS.R); const handL=[PL.x-.2,1.25,PL.z-.4],sh=[PL.x-.18,1.62-.25+.01,PL.z+.07+.05],ax=norm3(v3.sub(sh,handL)),cA=v3.add(handL,v3.sc(ax,.13));
  run(HANDS.R,cA,ax,.08,.8,2.5,{h:HANDS.L,p:handL}); ok('arm: 2 turns round the other forearm wraps it, a band shows',w.bandaged&&RAY.bands.length===1,w.bandaged+' bands '+RAY.bands.length);
  reset(); w=rayWoundOpen('arm','L',{}); giveStrip(HANDS.L); run(HANDS.L,cA,ax,.08,.8,2.5,null); ok('arm: the wounded arm\\'s own hand can\\'t wrap it',!w.bandaged,w.bandaged);
  /* torso: circles on the belly */
  reset(); w=rayWoundOpen('torso','R',{}); giveStrip(HANDS.L); run(HANDS.L,[PL.x+.07+.0,1.62-.25-.22,PL.z-.16+.07],[0,0,-1],.1,.8,2.5); ok('torso: circles on the belly wrap it',w.bandaged,w.bandaged);
  /* cover: crouched (head at 0.9 m) behind a 1.2 m crate 1.1 m in front, the gun 4 m off: the crate takes the rounds */
  reset(); { let dir=null; for(let k=0;k<16&&!dir;k++){ const a=k/16*6.283,d=[Math.cos(a),0,Math.sin(a)]; if(!rayBoxes([PL.x,1.2,PL.z],d,4.6)&&!rayBoxes([PL.x,.5,PL.z],d,4.6)) dir=d; }
    const o=[PL.x+dir[0]*4,1.4,PL.z+dir[2]*4],c=[PL.x+dir[0]*1.1,PL.z+dir[2]*1.1]; XR.head.eye=[PL.x,.9,PL.z]; HANDS.L.M=at(fistOff([PL.x-.2,.7,PL.z])); HANDS.R.M=at(fistOff([PL.x+.2,.7,PL.z])); /* hands down behind it too */ const bx=addBox(c[0]-.35,c[0]+.35,c[1]-.35,c[1]+.35,0,1.2,'furn'); boxGridDirty=true; let got=0;
    for(let i=0;i<40;i++){ PL.hp=100; PL.dead=false; hurtPlayer(10,{kind:'gun',w:'pistol',n:1,mz:o,dist:4}); if(PL.hp<100) got++; } removeBox(bx); XR.head.eye=eye;
    let open=0; for(let i=0;i<40;i++){ PL.hp=100; PL.dead=false; hurtPlayer(10,{kind:'gun',w:'pistol',n:1,mz:o,dist:4}); if(PL.hp<100) open++; }
    ok('cover: crouched behind a crate, the crate takes it (hits out of 40; then standing in the open)',got===0&&open===40,got+' vs '+open); }
  /* first aid at the chest */
  reset(); PL.hp=50; equip(HANDS.R,newItem('medkit')); HANDS.R.trigHeld=true; for(let i=0;i<95;i++){ HANDS.R.M=at(fistOff([PL.x,1.62-.25,PL.z-.12])); R.step(1/30); } ok('kit at the chest, trigger 3 s: +25, used up',PL.hp>74.5&&PL.hp<75.5&&!HANDS.R.item,PL.hp.toFixed(1));
  reset(); PL.hp=50; equip(HANDS.R,newItem('medkit')); HANDS.R.trigHeld=true; for(let i=0;i<95;i++){ HANDS.R.M=at(fistOff([PL.x+.5,1.0,PL.z-.5])); R.step(1/30); } ok('kit away from the chest: nothing',PL.hp===50&&HANDS.R.item,PL.hp);
  HANDS.R.trigHeld=false; XR.on=false; XR.head=null; return out; })()`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  const fresh = async q => { const page = await browser.newPage({ viewport: { width: 480, height: 270 } });
    page.on('pageerror', e => errs.push(q + ' ' + String(e).slice(0, 200)));
    await page.goto(file + '?' + q, { timeout: 120000 }); await page.waitForTimeout(400); await page.click('#start'); await page.waitForTimeout(300);
    await page.evaluate(s => window.__eval(s), CORE); return page; };
  try {
    if (test === 'fight') { const q = process.argv[4] || 'f=1', runs = +(process.argv[5] || 10), maxT = +(process.argv[6] || 300); let died = 0;
      for (let r = 0; r < runs; r++) { const p = await fresh(q); if (process.env.UNSUP === '1') await p.evaluate(() => window.__eval("{ const it=HANDS.R.item; if(it&&it.sup){ it.sup=false; removeCan(HANDS.R.itemNode); } }")); /* loud: the can off */
        const res = await p.evaluate(m => window.__R.fight(m, +(1.6), .4, .22), maxT); if (res.died) died++; console.log(JSON.stringify(res)); await p.close(); }
      console.log(`DEATHS ${died}/${runs} on ?${q}`); }
    else { let bad = 0;
      for (const [q, code] of [['f=1', UNITS_OLD], ['f=1&proto=1&pf=0', UNITS_PROTO], ['f=1&proto=1&pf=0', UNITS_WRAP]]) { const p = await fresh(q);
        const res = await p.evaluate(s => window.__eval(s), code); for (const [n, pass, d] of res) { if (!pass) bad++; console.log((pass ? 'pass ' : 'FAIL ') + '[' + q + '] ' + n + '  -> ' + JSON.stringify(d)); } await p.close(); }
      console.log(bad ? bad + ' FAILED' : 'all passed'); }
  } finally { if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 10))); await browser.close(); }
})();
