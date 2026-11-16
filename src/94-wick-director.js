/* =====================================================================
   WICK stage 4: the director. Bayhem's beats (bayhem-vr src/beats.js and its levels' director.js), rewritten for this engine.
   The level is a list of beats run in order. Each beat has:
   - enter(): who is posted where, a line, the music level, anything it sets off. Its men are spawned (asleep) when the beat
     before it starts, so walking in never hitches; they wake when it starts.
   - a marker [x,z]: where you are heading. Reaching it moves the beat on (Bayhem: "every time the player gets to the objective,
     it gets to the objective"). Never gated on enemies being dead.
   - cleared: every man of the beat dead (its waves too), or for the last beat the target dead (Gunman Contracts' rule). The
     last man of a beat dies in a second of slow motion (wickSlowBurst, agent R's), which is the "space clear" signal.
   - quiet: true if stealth is possible. Quiet goes loud on a body found, an unsuppressed shot, or a man who saw you and lived
     (94b-wick-ai.js decides which); loud carries into the next beat. A beat that isn't quiet goes loud when you step into its
     space (or sooner, by the same rules), so its men don't come for you while you're still finishing the last one.
   - waves: men who come in through a doorway on a timer or when the beat's numbers drop.
   Only the current beat is awake. The next beat's men stand posted but asleep (no thinking, no physics). Men from an earlier
   beat who are close and fighting keep fighting; the rest drop out (asleep where they stand).
   Dying restarts the beat: its men are posted again, you are back at its start with the kit you walked in with.
   ?wick=1&play=1 runs the test beat list on the three spaces stage 1 built (kitchen quiet, main room loud with waves, the office
   with the target). Stage 5 replaces WK_TEST_BEATS with the whole route.
   Contracts (docs/wick/BRIEF.md section 4): WICK_DIR, wickBeatRestart(), wickLoud(reason); events wickBeat(beat), wickLoud(reason),
   wickClear(beat), and wickRestart(beat), wickDone() (new). ?w.dir.<key>=n sets any number below.
   ===================================================================== */
WICK.dir={ arriveR:1.4, minT:1.5, farR:9, deadT:2.6, slowSec:1.2, slowFall:.22, sayT:3.2, waveCap:8 };
const WICK_DIR={beat:null,i:-1,loud:false,t:0,total:0,done:false,on:false,why:'',loudT:null,marker:null,music:0,beats:[],log:[],kit:null,loose0:null,slowT:0};
function wickUrlSet(sys){ if(!WICK.on) return; const q=new URLSearchParams(location.search);
  for(const [k,v] of q){ if(!k.startsWith('w.'+sys+'.')) continue; const key=k.slice(3+sys.length),n=Number(v); if(WICK[sys]&&isFinite(n)) WICK[sys][key]=n; } }
wickUrlSet('dir');
const wkDirLog=(ev,o)=>{ const r=Object.assign({t:+GAME.t.toFixed(2),ev,beat:WICK_DIR.beat&&WICK_DIR.beat.name},o||{}); WICK_DIR.log.push(r); if(WICK_DIR.log.length>200) WICK_DIR.log.shift(); };

/* ---------- the test beats: the three spaces from stage 1 (91c-wick-club.js). x east, z north ---------- */
const WK_TEST_BEATS=[
  { name:'kitchen', quiet:true, start:[-10.6,-1.2,null], marker:[-7.35,-5.2], music:.3, line:'The kitchen. Two of them. Nobody hears a thing.',
    men:[ {id:'wk_cook',x:-9.8,z:-4.45,hd:Math.PI},                                      /* past the island, his back to you */
          {id:'wk_floor4',x:-8.3,z:-4.9,hd:Math.PI,patrol:[[-8.3,-4.9],[-8.4,-1.9]]} ] },  /* walks the pass and back */
  { name:'floor', quiet:false, space:'M', start:[-6.3,-5.2,-2.0], marker:[6.4,2.3], music:.75, line:'The floor. They know you\'re here.',
    men:[ {id:'wk_floor1',x:-1.8,z:-.6,hd:-Math.PI/2}, {id:'wk_floor2',x:-4.0,z:3.75,hd:-2.4}, {id:'wk_floor3',x:2.4,z:3.4,hd:-2.2} ],
    waves:[ {t:6,from:[8.4,2.3],men:[{id:'wk_door2',name:'Cole'},{id:'wk_floor1',name:'Yuri'}]},              /* out of the office, through the arch */
            {alive:1,from:[-8.0,-5.2],men:[{id:'wk_door1',name:'Bishop'},{id:'wk_floor3',name:'Pavel'}]} ] }, /* round through the kitchen behind you */
  { name:'office', quiet:false, space:'V', start:[5.9,2.3,-Math.PI/2], marker:null, music:.9, line:'Sorel.', target:'wk_boss',
    men:[ {id:'wk_boss',name:'Valentin Sorel',x:11.9,z:2.3,hd:-Math.PI/2,target:true}, {id:'wk_guard1',x:8.3,z:.6,hd:-1.3}, {id:'wk_guard2',x:8.3,z:4.2,hd:-1.85} ] } ];

/* the test list runs on the three stage 1 rooms, which stage 1 left without a way from the kitchen into the main room (the pass is
   a serving hatch; stage 5's service corridor is the real way). For play=1 only: an open doorway in the same wall, south of the
   hatch, drawn by the club's own opening code (lacquer jambs, brass edge) */
function wickPlayPrep(){ if(!WK_OPEN.some(o=>o.play)) WK_OPEN.push({a:'K',b:'M',axis:'z',c:-7,at:-5.2,w:1.05,h:2.3,kind:'door',play:true}); }

/* ---------- men ---------- */
const wkAlive=E=>!!E&&!E.dead;
const wkMenOf=i=>enemies.filter(E=>E.wkBeat===i);
function wkSpawn(s,bi,o={}){ wkCastInit(); const R_=ROSTER[s.id]; if(!R_) return null; const x=o.x??s.x,z=o.z??s.z;
  const E=spawnEnemy({maker:(h,g)=>wkMakeChar(s.id,h,g),name:s.name||R_.name,x,z,hd:o.hd??s.hd??0,extra:''});
  enemies.push(E); E.wkBeat=bi; E.wkId=s.id; E.psych='fight'; E.liveT=0; E.wkTarget=!!s.target; if(typeof attachLabels==='function') attachLabels();
  if(s.patrol){ E.patrol={pts:s.patrol.map(p=>p.slice()),i:1,wait:rnd(1,3)}; E.st='alert'; }
  if(typeof huntTorchMesh==='function') huntTorchMesh(E);
  protoEmit('wickSpawn',E); return E; }
/* asleep: no thinking, no physics, frozen in his pose (50-game.js update() skips him). A man hurt or grabbed wakes */
function wkSleep(E,on){ E.wkSleep=!!on; if(!on){ E.liveT=0; E.dormant=false; } }
function wkRemove(E){ for(const G of (typeof GRABS!=='undefined'?GRABS.slice():[])) if(G.E===E) endGrab(G);
  disposeTree(E.holder); let i=world.kids.indexOf(E.holder); if(i>=0) world.kids.splice(i,1); if(E.barkEl) E.barkEl.remove();
  if(E.label){ const k=world.kids.indexOf(E.label); if(k>=0) world.kids.splice(k,1); }
  i=enemies.indexOf(E); if(i>=0) enemies.splice(i,1); i=chars.indexOf(E.C); if(i>=0) chars.splice(i,1);
  if(typeof FGT!=='undefined'){ if(FGT.token===E) FGT.token=null; if(FGT.token2===E) FGT.token2=null; } }

/* ---------- the run ---------- */
function wickDirStart(list){ const D=WICK_DIR; Object.assign(D,{beats:list.map((b,i)=>Object.assign({},b,{i,loudIn:false,waveDone:[],spawned:false,surrDone:false})),i:-1,beat:null,loud:false,
    t:0,total:0,done:false,on:true,why:'',loudT:null,marker:null,firstPushT:null,slowT:0,held:0}); D.log.length=0;
  wkPost(0,true); wkNext(); }
/* the beat's posted men, spawned asleep */
function wkPost(i,awake){ const b=WICK_DIR.beats[i]; if(!b||b.spawned) return; b.spawned=true; b.n0=0;
  for(const s of b.men||[]){ const E=wkSpawn(s,i); if(!E) continue; b.n0++; wkSleep(E,!awake); }
  /* its waves too, asleep out of the way at their doorway: building a man mid-fight is a hitch on the Quest */
  (b.waves||[]).forEach((w,k)=>{ for(const s of w.men){ const n=WICK_DIR.held++,E=wkSpawn(s,i,{x:WK_HOLD[0]+(n%12)*.8,z:WK_HOLD[1]+((n%24)/12|0)*.8,hd:0}); if(!E) continue;
    E.wkWave=k; E.wkHeld=true; wkSleep(E,true); } }); }
/* where a wave waits: outside the rooms (north of the main room's wall), out of sight, till it's sent to its doorway */
const WK_HOLD=[-4.4,7.4];
function wkTeleport(E,x,z){ const B=E.B,dx=x-E.pos[0],dz=z-E.pos[1]; for(let i=0;i<NP;i++){ B.x[i*3]+=dx; B.p[i*3]+=dx; B.x[i*3+2]+=dz; B.p[i*3+2]+=dz; } E.pos=[x,z]; E.home=[x,z]; }
function wkNext(){ const D=WICK_DIR,prev=D.beat;
  /* men left behind: close and fighting keep at it, the rest drop out where they stand */
  if(prev) for(const E of enemies){ if(E.dead||E.wkBeat==null||E.wkBeat>D.i||E.wkSleep) continue;
    const far=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>wnum('dir','farR',9); if(far||!E.aware) wkSleep(E,true); }
  D.i++; D.t=0; const b=D.beats[D.i]; D.beat=b||null;
  if(!b){ D.done=true; D.marker=null; wkDirLog('done'); protoEmit('wickDone'); return; }
  wkPost(D.i,true); for(const E of wkMenOf(D.i)) if(!E.dead&&!E.wkHeld) wkSleep(E,false);
  wkPost(D.i+1,false); /* the next one's men: posted, asleep */
  D.marker=b.marker?b.marker.slice():null; D.music=b.music??D.music; D.loud=false; D.why=''; D.loudT=null; D.firstPushT=null; D.surr=null;
  b.loudIn0=b.loudIn; b.t0=GAME.t; b.waveDone=[]; b.moved=null;
  /* what you carry into it, for a restart */
  D.kitDirty=true; /* taken on the next tick, after every 'reset' handler has handed out the start kit */
  if(b.start&&b.start[2]==null) b.start[2]=PL.yaw;
  wkDirLog('enter',{quiet:!!b.quiet,loudIn:!!b.loudIn,men:wkMenOf(D.i).length});
  if(b.line){ if(XR.on&&typeof vrToast==='function') vrToast(b.line,wnum('dir','sayT',3.2)); const tag=$('floorTag'); if(tag) tag.textContent='Velour · '+b.name; }
  if(b.enter) b.enter(b);
  protoEmit('wickBeat',b);
  if(b.loudIn) wickLoud('carried'); else if(!b.quiet&&!b.space) wickLoud('beat'); } /* a loud beat with a space goes loud when you step into it (wickDirTick) */

/* the current beat goes loud (94b-wick-ai.js calls it with 'body', 'shot', 'seen'; 'beat' for a beat that starts loud) */
function wickLoud(reason){ const D=WICK_DIR,b=D.beat; if(!b||D.loud) return; D.loud=true; D.why=reason||'?'; D.loudT=GAME.t; D.firstPushT=null;
  const nb=D.beats[D.i+1]; if(nb) nb.loudIn=true; /* and so does the next one */
  D.music=Math.max(D.music,.8); wkDirLog('loud',{why:D.why});
  for(const E of enemies) if(!E.dead&&!E.wkSleep&&E.wkBeat!=null&&typeof wickPush==='function') wickPush(E);
  protoEmit('wickLoud',D.why); protoEmit('stat','wickLoud',D.why); }

function wkCleared(b){ const men=wkMenOf(b.i); if(b.target){ const T=men.find(E=>E.wkTarget); return !!T&&T.dead; }
  return men.every(E=>E.dead)&&(b.waves||[]).every((w,k)=>b.waveDone[k]); }
function wkWaves(b){ const men=wkMenOf(b.i),alive=men.filter(E=>!E.dead&&!E.wkHeld).length;
  (b.waves||[]).forEach((w,k)=>{ if(b.waveDone[k]) return; const go=w.t!=null?WICK_DIR.t>=w.t:w.alive!=null&&alive<=w.alive; if(!go) return;
    const awake=enemies.filter(E=>!E.dead&&!E.wkSleep).length; if(awake>=wnum('dir','waveCap',8)) return; /* the awake cap: the Quest's limit is per beat */
    b.waveDone[k]=true; let n=0;
    for(const E of men){ if(E.wkWave!==k||!E.wkHeld) continue; E.wkHeld=false; if(E.dead) continue; const p=navSpotNear(w.from[0],w.from[1],1.2)||w.from; wkTeleport(E,p[0],p[1]); wkSleep(E,false); b.n0++; n++; E.hd=Math.atan2(PL.x-E.pos[0],PL.z-E.pos[1]); if(typeof wickPush==='function') wickPush(E,true); }
    wkDirLog('wave',{k,n}); protoEmit('wickWave',b,k); }); }

function wkArrived(b){ if(!b.marker||WICK_DIR.t<wnum('dir','minT',1.5)) return false; return Math.hypot(PL.x-b.marker[0],PL.z-b.marker[1])<=wnum('dir','arriveR',1.4); }

/* the last man of a beat: a second of slow motion, free. Agent R's wickSlowBurst; a local stand-in until it's in */
function wkSlow(sec){ if(typeof wickSlowBurst==='function'){ wickSlowBurst(sec); return; } WICK_DIR.slowT=sec; GAME.slow=true; }
protoOn('death',E=>{ const D=WICK_DIR; if(!D.on||!E||E.wkBeat==null||!D.beat||E.wkBeat!==D.i) return;
  const b=D.beat,left=wkMenOf(D.i).filter(O=>O!==E&&!O.dead).length,pending=(b.waves||[]).some((w,k)=>!b.waveDone[k]);
  if(!left&&!pending&&!b.cleared){ b.cleared=true; wkSlow(wnum('dir','slowSec',1.2)); wkDirLog('lastMan',{who:E.name}); protoEmit('wickClear',b); } });

function wkKitSnap(){ const D=WICK_DIR; D.kit={hands:[HANDS.R,HANDS.L].map(h=>h.item?{key:h.item.key,ammo:h.item.ammo,sup:h.item.sup}:null),pouch:PL.pouch?JSON.parse(JSON.stringify(PL.pouch)):null,hp:PL.hp};
  D.loose0=new Set(LOOSE); }
function wickDirTick(gdt,dt){ const D=WICK_DIR; if(!D.on||!GAME.started) return;
  if(D.slowT>0){ D.slowT-=dt; if(D.slowT<=0&&typeof wickSlowBurst!=='function'){ GAME.slow=false; } }
  /* dying restarts the beat. The shell's card and fade run first (89-shell.js); it signals the core with PL.deadT=1e3 */
  if(PL.dead){ const sh=typeof SHELL!=='undefined'&&SHELL.dying; if(PL.deadT>=(sh?100:wnum('dir','deadT',2.6))) wickBeatRestart(); return; }
  if(D.kitDirty){ D.kitDirty=false; wkKitSnap(); }
  if(D.done) return; const b=D.beat; if(!b) return; D.t+=gdt; D.total+=gdt;
  /* a sleeping man hurt or grabbed wakes, and he knows */
  for(const E of enemies) if(E.wkSleep&&(E.dead||E.wounds.length||E.grabbed||E.stun>.05||E.st==='down')){ wkSleep(E,false); E.wkHeld=false; if(!E.dead&&typeof wickPush==='function') wickPush(E); }
  if(!D.loud&&!b.quiet&&b.space&&typeof wkRoomAt==='function'){ const r=wkRoomAt(PL.x,PL.z); if(r&&r.id===b.space) wickLoud('beat'); }
  if(D.loud) wkWaves(b);
  if(b.update) b.update(D.t,b);
  const cl=wkCleared(b),ar=!cl&&wkArrived(b);
  if(cl||ar){ b.moved=cl?'cleared':'arrive'; wkDirLog('moveOn',{by:b.moved,left:wkMenOf(D.i).filter(wkAlive).length,bt:+D.t.toFixed(1)}); wkNext(); } }
protoOn('tick',(gdt,dt)=>{ if(WICK.on) wickDirTick(gdt,dt); });

/* dying restarts the beat, not the level. The shell (stage 6) will call this; until then the director calls it itself */
function wickBeatRestart(){ const D=WICK_DIR,b=D.beat; if(!D.on||!b){ if(typeof restartLevel==='function') restartLevel(); return; }
  for(const E of enemies.slice()) if(E.wkBeat!=null&&(E.wkBeat>=D.i||!E.dead&&!E.wkSleep)) wkRemove(E); /* this beat's men, the next one's, and anyone still up from before */
  for(const P of LOOSE.slice()) if(D.loose0&&!D.loose0.has(P)) removePickup(P);
  for(let k=D.i;k<D.beats.length;k++){ const q=D.beats[k]; q.spawned=false; q.cleared=false; q.waveDone=[]; }
  b.loudIn=!!b.loudIn0; const nb=D.beats[D.i+1]; if(nb) nb.loudIn=false;
  const s=b.start||[FLOOR.start.x,FLOOR.start.z,FLOOR.start.yaw];
  Object.assign(PL,{x:s[0],z:s[1],yaw:s[2]??PL.yaw,pitch:0,y:0,dead:false,deadT:0,hurtT:9,kickCd:0}); PL.hp=D.kit&&D.kit.hp>0?Math.max(D.kit.hp,wnum('rules','hp',100)):wnum('rules','hp',100);
  if(PL.wounds) PL.wounds.length=0; if(typeof RAYDROPS!=='undefined') RAYDROPS.length=0; if(PL.grab) PL.grab=null;
  const K=D.kit; if(K){ [HANDS.R,HANDS.L].forEach((h,k)=>{ const it=K.hands[k]; equip(h,it?newItem(it.key,it.ammo,it.sup):null); }); if(K.pouch&&PL.pouch) Object.assign(PL.pouch,JSON.parse(JSON.stringify(K.pouch))); }
  GAME.slow=false; GAME.ts=1; D.slowT=0; $('msg').hidden=true; $('sblood').innerHTML='';
  if(typeof SHELL!=='undefined'){ const out=!!SHELL.dying; SHELL.dying=null; SHELL.deadSeen=false; if(typeof shellCards==='function') shellCards(); if(out){ SHELL.fadeIn=pnum('shell','fadeIn',.7); GAME.fade=1; } }
  if(XR.on&&typeof vrRecenter==='function'){ const st=FLOOR.start; FLOOR.start={x:s[0],z:s[1],yaw:s[2]??st.yaw}; vrRecenter(); FLOOR.start=st; }
  wkDirLog('restart'); protoEmit('wickRestart',b);
  D.i--; D.beat=null; wkNext(); } /* back into the same beat: wkNext steps to it and posts its men again */

/* where you're heading, for the watch (agent R draws it) and the flat-screen hint: {x,z,d,bearing} or null. bearing: radians from your facing, + is to the right */
function wickMarker(){ const m=WICK_DIR.marker; if(!m) return null; const dx=m[0]-PL.x,dz=m[1]-PL.z,yaw=XR.on&&XR.head?Math.atan2(-XR.head.f[0],-XR.head.f[2]):PL.yaw;
  return {x:m[0],z:m[1],d:Math.hypot(dx,dz),bearing:wrapA(yaw-Math.atan2(-dx,-dz))}; }

/* ?wick=1&play=1: the club with live men (91d-wick-art.js wkBoot loads it; its reset calls this) */
function wickPlayReset(){ if(typeof HIDES!=='undefined') HIDES.length=0; if(typeof SHEETS!=='undefined') SHEETS.length=0; PL.hide=null; /* no hiding in this game */
  wickDirStart(WK_TEST_BEATS); }
