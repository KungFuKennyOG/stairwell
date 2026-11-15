/* =====================================================================
   NOTICING (floor 01 prototype, ?proto=1): the men see what Ray changed.
   Every man lives here, so each starts knowing how the floor was left: lights, drawers and doors, the sheets, what was lying where.
   A few times a second a handful of (man, thing) pairs are checked; a man who can actually see a thing (in front of him, a clear line,
   and lit, or close, or in a flashlight beam) compares it with how he remembers it and remembers it as it is now. What he notices:
   - a light that was on and is off: "Who turned off the light?" He goes to the switch and puts it back on.
   - a drawer, cupboard or fridge left open that was shut: "Somebody's been in here." He goes to look, and usually shuts it.
   - a sheet with strips torn off it; a sheet swinging with nobody of his near it.
   - smashed crockery on the floor he didn't hear go (he's sent to look where it is, once).
   - a weapon gone from where it always lies ("Where's the knife?"), or lying somewhere it never was.
   - bodies: the man who finds one says the name (52-senses.js), then grief or anger a beat later; men who see a body the floor already
     knows about react quietly. Never through walls.
   Each one counts once per man. Each is an incident for the hunt's own escalation (huntAlert 'glimpse', two inside a minute start a
   hunt; 83-hunt.js), not a hunt by itself; a body is the hunt's own business. During a hunt only something that changed in the last
   20 s moves the search (it says where Ray was); older things he just remarks on.
   Cost: a few line-of-sight casts per tick at 5 Hz. Events: notice(E, kind, thing). Debug: ?ntcdbg=1 logs to the console.
   ===================================================================== */
const NOTICEP={hz:5,casts:10,seeR:9,darkR:2.6,cone:.25,actR:1.0,actT:22,fresh:20,sheetMv:.004,quietGap:6};
const NOTICE={facts:[],mess:[],t:0,acc:0,cur:0,lastT:-99,lastLine:'',log:[],dbg:new URLSearchParams(location.search).get('ntcdbg')==='1'};
const NL={ /* subtitle-length, English; a man never says the same line twice running, and the floor doesn't either */
  light:['Who turned off the light?','...the light was on.','Why\'s it dark in here?','Who\'s been at the lights?'],
  lightOn:['...there.','Better.','Stay on.'],
  open:['Somebody\'s been in here.','...who left that open?','That was shut.','Someone\'s going through the drawers.'],
  shut:['...','Hm.','Nobody touches my shit.'],
  fridge:['Who left the fridge open?','...the fridge is open.'],
  torn:['Somebody tore this.','...that\'s fresh. Torn.','Who\'s tearing up sheets?'],
  swing:['Who\'s there?','Somebody just went through here—','...that moved.'],
  mess:['...broken glass.','Who broke that?','That wasn\'t there before.'],
  gone:n=>[`Where's the ${n}?`,`The ${n} was right here.`,`Somebody took the ${n}.`],
  moved:n=>[`What's the ${n} doing here?`,`...who left a ${n} here?`],
  grief:n=>[`${n}... no. No no no.`,`Not ${n}. Not him.`,`${n}, get up. Get up, man.`,`Oh God. ${n}.`],
  anger:n=>[`I'm gonna kill you, cop!`,`You hear me? You're dead for ${n}!`,`Who did this— WHO DID THIS?`,`${n}... I'll find you. I swear to God.`],
  quiet:n=>[`...${n}.`,`Jesus. ${n}.`,`Oh, man. ${n}...`] };
function ntcLine(E,lines){ const L=lines.filter(s=>s!==E.ntcLast&&s!==NOTICE.lastLine); const s=pick(L.length?L:lines); E.ntcLast=s; NOTICE.lastLine=s; return s; }
function ntcSay(E,lines,dur=2.4,force){ if(!force&&(E.barkCd>0||GAME.barkGlobal>0)) return false; bark(E,ntcLine(E,lines),dur); GAME.barkGlobal=Math.max(GAME.barkGlobal,.9); return true; }
function ntcLog(...a){ NOTICE.log.push([+GAME.t.toFixed(1),...a]); if(NOTICE.log.length>80) NOTICE.log.shift(); if(NOTICE.dbg) console.log('[notice]',...a); }

/* ---------- the things worth remembering: id, where to look from far (eye point), state() ---------- */
const ntcLabel=k=>{ const w=WPN[k]; const l=w&&w.label?w.label.toLowerCase():k; return l.replace(/^kitchen /,'').replace(/^broken /,'').replace(/^\.38 /,''); };
function ntcBuild(){ const F=NOTICE.facts; F.length=0; NOTICE.mess.length=0; if(typeof PF==='undefined'||!PF||FLOOR.mode!=='proto') return;
  for(const sw of PF.switches||[]){ const b=sw.bulbs&&sw.bulbs[0],L=sw.lights&&sw.lights[0],p=b?[b.x,b.y-.25,b.z]:L?L.p:sw.at,c=typeof pfRoomCen==='function'&&sw.room?pfRoomCen(sw.room):[p[0],p[2]];
    const pts=[p,[c[0],1.0,c[1]],[p[0],.9,p[2]]]; /* a room gone dark shows anywhere you can see into it: the bulb, the middle of the room, the floor under the bulb, */
    for(const o of PF.openings||[]){ if(o.A!==sw.room&&o.B!==sw.room||o.kind==='chain') continue; const ax=o.axis==='x',sg=Math.sign((ax?c[1]:c[0])-o.c)||1; /* and just inside each of its doorways */
      pts.push(ax?[o.pos,.9,o.c+sg*1.1]:[o.c+sg*1.1,.9,o.pos]); }
    F.push({id:'sw'+sw.id,kind:'light',sw,p,pts,big:true,state:()=>sw.on?1:0,at:()=>sw.at,fresh:()=>GAME.t-sw.t<NOTICEP.fresh}); }
  for(const o of PF.openables||[]){ if(o.room==null) continue;
    F.push({id:'op'+F.length,kind:o.kind==='fridge'?'fridge':'open',o,p:null,state:()=>o.open>.2?1:0,at:()=>o.at,fresh:()=>false}); }
  for(const S of (typeof SHEETS!=='undefined'?SHEETS:[])){ const top=(S.top+S.bot)/2;
    F.push({id:'sh'+F.length,kind:'torn',S,p:[S.x,top,S.z],state:()=>S.panels.reduce((a,q)=>a+(q.torn||0),0),at:()=>[S.x,1,S.z],fresh:()=>GAME.t-(S.tearT??-99)<NOTICEP.fresh}); }
  for(const it of PF.items||[]){ const w=WPN[it.key]; if(!w||w.clutter||!(w.melee&&w.melee!=='blunt'||w.gun||w.tool==='cutter')) continue; /* blades, guns, the cutter: things a man would miss */
    const home=it.at.slice(); F.push({id:'it'+F.length,kind:'item',it,p:null,label:ntcLabel(it.key),
      state:()=>{ const P=it.P; if(!LOOSE.includes(P)) return 0; return Math.hypot(P.node.p[0]-home[0],P.node.p[2]-home[2])<.5?1:2; },
      at:()=>LOOSE.includes(it.P)?it.P.node.p:home,fresh:()=>false}); }
  /* what they all know when the floor starts */
  for(const E of enemies){ E.ntcMem=new Map(); E.ntcB=new Set(); E.ntcAct=null; for(const f of F) E.ntcMem.set(f.id,f.state()); } }
/* smashed crockery: a thing that wasn't there */
protoOn('clutterLand',(item,p,o)=>{ if(!o||!o.broke||!p) return; const m={id:'ms'+(NOTICE.t|0)+'_'+NOTICE.mess.length,kind:'mess',p:[p[0],.15,p[2]],t:GAME.t,state:()=>1,at:()=>m.p,fresh:()=>GAME.t-m.t<NOTICEP.fresh};
  NOTICE.mess.push(m); if(NOTICE.mess.length>8) NOTICE.mess.shift();
  for(const E of enemies) if(E.ntcMem&&!E.dead&&Math.hypot(E.pos[0]-p[0],E.pos[1]-p[2])<12) E.ntcMem.set(m.id,1); }); /* close enough to hear it go: it's not news to him, the noise already sent someone */
protoOn('sheetTear',(S)=>{ if(S) S.tearT=GAME.t; });
protoOn('load',()=>{ NOTICE.built=false; NOTICE.lastT=-99; NOTICE.log.length=0; }); /* built on the next tick: the switches are placed and reset after this file's handlers run */
protoOn('reset',()=>{ NOTICE.built=false; NOTICE.lastT=-99; });

/* ---------- can this man see that point, the way the hunt's own eyes work ---------- */
function ntcSees(E,p,o={}){ const dx=p[0]-E.pos[0],dz=p[2]-E.pos[1],d=Math.hypot(dx,dz); if(d>(o.r||NOTICEP.seeR)) return false;
  if(d>1.4){ const lk=E.hd+(E.lookYaw||0)*.7; if((dx*Math.sin(lk)+dz*Math.cos(lk))/d<NOTICEP.cone) return false; }
  if(!o.big&&d>NOTICEP.darkR){ const lit=typeof huntLitAt==='function'&&huntLitAt(p[0],p[2],Math.max(.4,p[1]))||enemies.some(T=>typeof huntBeamOn==='function'&&huntBeamOn(T)&&huntInBeam(T,p[0],p[2],p[1]));
    if(!lit) return false; } /* in the dark only close up, or with a light on it; a whole room going dark is seen from anywhere with a line to it */
  const he=E.B?X_(E.B,PI_.head):[E.pos[0],1.6,E.pos[1]]; NOTICE.casts++; return typeof huntSees==='function'?huntSees(he,p):sightClear(he,p); }
const ntcAble=E=>!E.dead&&!E.civ&&!E.ally&&!E.aware&&upright(E)&&!E.surr&&!E.grabbed&&!E.obey&&!(E.fx&&E.fx.ret)&&E.ntcMem;

/* ---------- the tick ---------- */
protoOn('tick',(gdt,dt)=>{ const t0=performance.now(); ntcTick(gdt); const c=performance.now()-t0; NOTICE.cost=NOTICE.cost==null?c:NOTICE.cost*.98+c*.02; NOTICE.max=Math.max(NOTICE.max||0,c); });
function ntcTick(gdt){ if(!PROTO.on||!GAME.started||PL.dead||FLOOR.mode!=='proto') return; if(!NOTICE.built){ NOTICE.built=true; ntcBuild(); }
  for(const E of enemies) if(!E.ntcMem&&!E.civ){ E.ntcMem=new Map(); E.ntcB=new Set(); E.ntcAct=null; for(const f of NOTICE.facts) E.ntcMem.set(f.id,f.state()); } /* a man added later knows the floor as it is now */
  ntcActs(gdt); NOTICE.acc+=gdt; if(NOTICE.acc<1/NOTICEP.hz) return; NOTICE.acc=0; NOTICE.t=GAME.t; NOTICE.casts=0;
  const men=enemies.filter(ntcAble); if(!men.length) return; const F=NOTICE.facts.concat(NOTICE.mess),n=men.length*F.length; if(!n) return;
  /* walk the (man, thing) pairs round-robin; distance and facing cost nothing, the line of sight is the budget */
  for(let k=0;k<n&&NOTICE.casts<NOTICEP.casts;k++){ const i=(NOTICE.cur++)%n,E=men[i%men.length],f=F[(i/men.length|0)%F.length]; ntcCheck(E,f); }
  ntcSheetsMoving(men); ntcBodies(men); }

function ntcCheck(E,f){ const was=E.ntcMem.get(f.id),now=f.state(); if(was===now) return;
  const p=f.p||f.at(); if(f.pts?!f.pts.some(q=>NOTICE.casts<NOTICEP.casts+2&&ntcSees(E,q,{big:true})):!ntcSees(E,p,{big:f.big})) return;
  E.ntcMem.set(f.id,now);
  if(was===undefined&&f.kind!=='mess') return; /* never knew it: nothing to compare */
  let kind=null,lines=null;
  if(f.kind==='light'&&was===1&&now===0){ kind='light'; lines=NL.light; }
  else if((f.kind==='open'||f.kind==='fridge')&&was===0&&now===1){ kind=f.kind; lines=f.kind==='fridge'?NL.fridge:NL.open; }
  else if(f.kind==='torn'&&now>was){ kind='torn'; lines=NL.torn; }
  else if(f.kind==='mess'&&was===undefined){ kind='mess'; lines=NL.mess; }
  else if(f.kind==='item'&&was===1&&now===0){ kind='gone'; lines=NL.gone(f.label); }
  else if(f.kind==='item'&&now===2&&was!==2){ kind='moved'; lines=NL.moved(f.label); }
  if(kind) ntcIncident(E,f,kind,lines); }
/* he's seen it: say so, turn to it, and it's an incident for the floor */
function ntcIncident(E,f,kind,lines){ const at=f.at().slice(),pos=[at[0],at[2]];
  ntcSay(E,lines,2.4,true); if(typeof vox==='function') vox(E,'mutter',.8); NOTICE.lastT=GAME.t; NOTICE.lastE=E;
  if(typeof huntTurn==='function') huntTurn(E,pos);
  const hunting=typeof HUNT!=='undefined'&&HUNT.state==='hunting',stale=!f.fresh();
  if(!(hunting&&stale)&&typeof huntAlert==='function') huntAlert('noise',pos,.5,E); /* calm: one man goes to look, a second incident inside a minute starts a hunt */
  if(kind==='light') E.ntcAct={k:'light',sw:f.sw,t:NOTICEP.actT};
  else if(kind==='open'||kind==='fridge') E.ntcAct={k:'shut',o:f.o,t:NOTICEP.actT};
  else if(kind!=='gone') E.ntcAct={k:'look',p:at,t:NOTICEP.actT*.6};
  ntcLog('notice',E.name,kind,f.id,hunting?(stale?'stale':'fresh'):'calm'); protoEmit('notice',E,kind,f); protoEmit('stat','notice',kind); }
/* what he does about it once he's there: the light back on, the drawer shut. If the hunt sent him elsewhere, it lapses */
function ntcActs(dt){ for(const E of enemies){ const A=E.ntcAct; if(!A) continue; A.t-=dt; if(E.dead||!upright(E)||E.aware||A.t<=0){ E.ntcAct=null; continue; }
    if(A.k==='light'){ const sw=A.sw; if(sw.on){ E.ntcAct=null; continue; } if(Math.hypot(E.pos[0]-sw.at[0],E.pos[1]-sw.at[2])<NOTICEP.actR+.2&&sightClear([E.pos[0],1.2,E.pos[1]],[sw.at[0]+sw.n[0]*.12,sw.at[1],sw.at[2]+sw.n[2]*.12])){ pfSwitchSet(sw,true,E); /* he has to be on the room's side of the wall to reach it */ ntcSay(E,NL.lightOn,1.6); E.ntcAct=null; ntcLog('act',E.name,'lightOn',sw.id); } }
    else if(A.k==='shut'){ const o=A.o; if(o.open<.2||o.held){ E.ntcAct=null; continue; } if(Math.hypot(E.pos[0]-o.at[0],E.pos[1]-o.at[2])<NOTICEP.actR+.15){ E.ntcAct=null;
        if(Math.random()<.7&&typeof openToggle==='function'){ openToggle(o); ntcSay(E,NL.shut,1.4); ntcLog('act',E.name,'shut',o.kind); } else ntcLog('act',E.name,'leftOpen',o.kind); } }
    else if(A.k==='look'){ if(Math.hypot(E.pos[0]-A.p[0],E.pos[1]-A.p[2])<1.3) E.ntcAct=null; } } }
/* a sheet swinging with nobody of theirs near it: someone just went through. Only seen happening, never remembered */
function ntcSheetsMoving(men){ if(typeof SHEETS==='undefined') return;
  for(const S of SHEETS){ if(!(S.mv>NOTICEP.sheetMv)||GAME.t-(S.ntcT??-99)<8) continue; if(enemies.some(O=>!O.dead&&Math.hypot(O.pos[0]-S.x,O.pos[1]-S.z)<1.3)) continue;
    const p=[S.x,1.2,S.z]; for(const E of men){ if(NOTICE.casts>=NOTICEP.casts+4) return; if(Math.hypot(E.pos[0]-S.x,E.pos[1]-S.z)<1.6||!ntcSees(E,p)) continue;
      S.ntcT=GAME.t; ntcIncident(E,{kind:'swing',p,at:()=>[S.x,0,S.z],fresh:()=>true},'swing',NL.swing); break; } } }

/* ---------- bodies ----------
   The first man to find one says the name and starts the hunt (52-senses.js huntBodies + 83-hunt.js). A beat later: grief or anger,
   by who he is. Any man who later sees a body the floor already knows about says something quiet, once, if he can see it. */
const ntcDown=O=>O.dead||O.st==='down'||O.st==='kneel';
function ntcBodyBeat(E,O){ if(!O||!E||E.dead) return; E.ntcB.add(O); const n=O.name||'him',angry=(E.psych||'')==='fight'||E.hunter||Math.random()<.4;
  setTimeout(()=>{ if(E.dead||!upright(E)) return; ntcSay(E,angry?NL.anger(n):NL.grief(n),2.8,true); if(typeof vox==='function') vox(E,angry?'shout':'mutter',angry?.9:.7);
    ntcLog('body',E.name,O.name,angry?'anger':'grief'); protoEmit('notice',E,'body',O); },rnd(1700,2600)); }
if(typeof huntAlert==='function'){ const ha=huntAlert; huntAlert=function(reason,pos,strength,E){ const r=ha.apply(this,arguments); /* wraps 83-hunt.js: the body reaction gets its second beat here */
    if(reason==='body'&&E&&!E.dead&&!E.civ&&PROTO.on&&pos&&E.ntcB){ let O=null,bd=1.6; for(const T of enemies){ if(T===E||!ntcDown(T)) continue; const p=X_(T.B,PI_.pelvis),d=Math.hypot(p[0]-pos[0],p[2]-pos[1]); if(d<bd){ bd=d; O=T; } }
      if(O&&!E.ntcB.has(O)) ntcBodyBeat(E,O); }
    return r; }; }
function ntcBodies(men){ const known=typeof HUNT!=='undefined'&&HUNT.bodies; if(!known||!known.size) return;
  for(const E of men){ if(GAME.t-(E.ntcQT??-99)<NOTICEP.quietGap||!E.seen) continue;
    for(const O of known){ if(O===E||E.ntcB.has(O)||!E.seen.has(O)) continue; E.ntcB.add(O); E.ntcQT=GAME.t; /* 52-senses only marks him once he's really seen it */
      if(ntcSay(E,NL.quiet(O.name||'him'),2.2)) ntcLog('bodyQuiet',E.name,O.name); break; } } }
