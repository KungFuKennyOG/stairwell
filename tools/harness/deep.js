// Deeper behaviour tests for Stairwell. Steps the game's own update() with its timers on game time and world matrices refreshed
// (the head is a rigid node: without updateWorld a head shot passes through, which the first harness got wrong).
// usage: node deep.js <index.html> <test> [json args]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const game = 'file://' + process.argv[2], test = process.argv[3], args = JSON.parse(process.argv[4] || '{}');

const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__D=(function(){
  const L={barks:[],dmg:[],eshots:new Map(),hits:[],god:false,cur:null};
  const _bark=bark; bark=function(E,txt,d){ L.barks.push([+GAME.t.toFixed(1),E&&E.name,txt]); return _bark.apply(this,arguments); };
  const _es=enemyShoot; enemyShoot=function(E,b){ L.cur=E; const r=_es.apply(this,arguments); if(r!==false) L.eshots.set(E,(L.eshots.get(E)||0)+1); L.cur=null; return r; };
  const _hurt=hurtPlayer; hurtPlayer=function(d){ L.dmg.push([+GAME.t.toFixed(2),d,L.cur?L.cur.name:'melee']); return _hurt.apply(this,arguments); };
  const _hit=hitEnemy; hitEnemy=function(E,seg){ L.hits.push([+GAME.t.toFixed(2),E.name,seg[3]]); return _hit.apply(this,arguments); };
  const dt=1/30;
  function step(){ if(L.god){ PL.hp=100; PL.dead=false; } update(dt,performance.now()); updateWorld(world,null);
    if(window.__Q.length){ const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ L.err=String(e).slice(0,150); } } } }
  const reset=()=>{ L.barks.length=0; L.dmg.length=0; L.eshots.clear(); L.hits.length=0; window.__Q=[]; };
  const MAKERS={corner:makeCorner,cutter:makeCutter,gunman:makeGunman,doorman:makeDoorman,enforcer:makeEnforcer,landlord:makeLandlord};
  function solo(kind,x,z,hd,psych){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); const E=spawnEnemy({maker:MAKERS[kind],name:'T-'+kind,x,z,hd,extra:'I got a kid—'}); enemies.push(E); attachLabels(); if(psych) E.psych=psych; return E; }
  const eye=()=>[PL.x,1.62,PL.z],mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  const gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const lit=(x,z)=>{ for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0]; if(Math.hypot(p[0]-x,p[2]-z)<l[2]*.45&&sightClear([p[0],Math.max(p[1],1.2),p[2]],[x,1.3,z])) return true; } return false; };

  /* ---- duel: one man who knows you're there, you stand still and never shoot ---- */
  function duel(o){ reset(); L.god=true; const px=o.lit?2:-8; PL.x=px; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; equip(HANDS.R,null);
    const E=solo(o.kind,px+o.dist,0,-Math.PI/2,'fight'); for(let k=0;k<20;k++) step(); setAware(E,'see'); const t0=GAME.t; let seeT=0,minD=99,first=null,atk0=null;
    while(GAME.t-t0<o.secs){ step(); if(E.canSee) seeT+=dt; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); minD=Math.min(minD,d); if(first==null&&L.eshots.get(E)) first=GAME.t-t0; if(atk0==null&&E.atkT>=0) atk0=GAME.t-t0; }
    const dm=L.dmg.reduce((s,d)=>s+d[1],0),n=L.dmg.length;
    return {kind:o.kind,dist:o.dist,lit:!!o.lit,playerLit:lit(PL.x,PL.z),sawYou:Math.round(100*seeT/o.secs)+'%',firstShot:first&&+first.toFixed(1),firstSwing:atk0&&+atk0.toFixed(1),shots:L.eshots.get(E)||0,hits:n,dmg:dm,dps:+(dm/o.secs).toFixed(2),firstHit:n?+(L.dmg[0][0]-t0).toFixed(1):null,
      endDist:+Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z).toFixed(1),minDist:+minD.toFixed(1),mind:E.mind,st:E.st}; }

  /* ---- detection: a calm man in the hall, you walk at him ---- */
  function detect(o){ reset(); L.god=true; const ex=o.lit?2:-4; const E=solo('gunman',ex,0,o.behind?Math.PI/2:-Math.PI/2); /* hd -PI/2 faces -x (toward you) */
    PL.x=o.lit?ex-12:-15.5; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; equip(HANDS.R,null); for(let k=0;k<20;k++) step();
    let at=null,heard=null; const t0=GAME.t; KEYS.KeyW=false; stick.dy=0;
    while(GAME.t-t0<30){ const d=E.pos[0]-PL.x; if(d>(o.stop||.6)){ if(o.slow) stick.dy=-o.slow; else KEYS.KeyW=true; } else { KEYS.KeyW=false; stick.dy=0; }
      step(); if(heard==null&&E.mind&&E.mind!=='calm') heard={d:+(E.pos[0]-PL.x).toFixed(1),mind:E.mind}; if(E.aware){ at=+(E.pos[0]-PL.x).toFixed(1); break; } }
    KEYS.KeyW=false; stick.dy=0; return {lit:!!o.lit,behind:!!o.behind,slow:o.slow||1,stop:o.stop||0,endGap:+(E.pos[0]-PL.x).toFixed(1),awareAtDist:at,firstReaction:heard,after:+(GAME.t-t0).toFixed(1),mind:E.mind||'calm',st:E.st}; }

  /* ---- a full floor, fought. Second-by-second: who's a threat, who's shooting, what you're doing ---- */
  const out=E=>E.dead||E.st==='down'||E.surr||E.st==='kneel';
  const obvious=E=>!E.civ&&!E.ally&&(E.wpnHeld||E.aware||!E.concealed);
  function fight(o){ reset(); L.god=false; const S={seen:new Map(),next:0,stuckT:0,lastP:[PL.x,PL.z],jit:0}; const t0=GAME.t; let deaths=0,exitT=null,minHp=100,shots=0;
    const per=new Map(); for(const E of enemies) if(!E.civ) per.set(E,{name:E.name,kind:E.kind,hid:!!E.concealed,swings:0,roles:new Set(),awareT:null,outT:null,how:null});
    const tl=[]; let sec=0,acc={mov:0,sho:0,n:0};
    function walk(tx,tz){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; KEYS.KeyW=true; }
    while(GAME.t-t0<o.maxT){
      if(PL.dead){ deaths++; break; }
      minHp=Math.min(minHp,PL.hp); KEYS.KeyW=false; if(GAME.climbing){ exitT=GAME.t-t0; break; }
      const ey=eye(),T=enemies.filter(E=>obvious(E)&&!out(E)).map(E=>({E,d:Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)})).sort((a,b)=>a.d-b.d);
      const vis=T.find(q=>q.d<16&&sightClear(ey,X_(q.E.B,PI_.head))); let act='idle';
      if(vis){ const E=vis.E; if(!S.seen.has(E)) S.seen.set(E,GAME.t); const ch=X_(E.B,PI_.chest),nk=X_(E.B,PI_.neck),p=mid(ch,nk,.6); window.__game.aimAt(p); act='aim';
        if(GAME.t-S.seen.get(E)>o.react&&GAME.t>=S.next&&HANDS.R.item){ const d=norm3(v3.sub(p,ey)),e=o.sigma*Math.PI/180; if(fireHand(HANDS.R,{o:ey,d:norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e])})){ shots++; S.next=GAME.t+o.gap; } } }
      else if(T.length){ walk(T[0].E.pos[0],T[0].E.pos[1]); act='move'; }
      else { act='leave'; if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; KEYS.KeyW=true; } else walk(TL+.1,0); }
      step(); S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&KEYS.KeyW?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt;
      const t=GAME.t-t0;
      for(const [E,P] of per){ if(E.aware&&P.awareT==null) P.awareT=+t.toFixed(1); if(E.role) P.roles.add(E.role); if(E.atkT>=0&&!E._sw){ E._sw=true; P.swings++; } if(E.atkT<0) E._sw=false;
        if(P.outT==null&&out(E)){ P.outT=+t.toFixed(1); P.how=E.dead?'dead':E.surr?'surrendered':E.st; } }
      acc.n++; if(act==='move'||act==='leave') acc.mov++; if(act==='aim') acc.sho++;
      if(t>=sec+1){ sec++; tl.push({t:sec,aware:[...per.keys()].filter(E=>E.aware&&!out(E)).length,see:[...per.keys()].filter(E=>E.canSee&&E.aware&&!out(E)).length,hp:Math.round(PL.hp),act,up:[...per.keys()].filter(E=>!out(E)).length}); } }
    KEYS.KeyW=false; const tEnd=GAME.t-t0,inc=L.dmg.map(d=>d[0]-t0),es=[...L.eshots.values()].reduce((a,b)=>a+b,0);
    const P=[...per.entries()].map(([E,p])=>({name:p.name,kind:p.kind,hid:p.hid,shots:L.eshots.get(E)||0,swings:p.swings,roles:[...p.roles].join('/'),awareT:p.awareT,outT:p.outT,how:p.how||(E.dead?'dead':out(E)?E.st:(E.aware?'still up, aware':'never knew')),psych:E.psych}));
    const civ=enemies.filter(E=>E.civ);
    return {floor:FLOOR.def.n,time:+tEnd.toFixed(1),exit:exitT!=null,died:deaths>0,minHp:Math.round(minHp),myShots:shots,myHits:L.hits.length,enemyShots:es,enemyHits:L.dmg.length,dmg:L.dmg.reduce((s,d)=>s+d[1],0),
      firstDmg:inc.length?+inc[0].toFixed(1):null,lastDmg:inc.length?+inc[inc.length-1].toFixed(1):null,attackers:P.filter(p=>p.shots||p.swings).length,hostile:P.length,per:P,
      civ:civ.length,civDead:civ.filter(E=>E.dead).length,civModes:civ.map(E=>E.name+':'+(E.civMode||E.st)).join(' '),tl,barks:L.barks.length}; }

  /* ---- go loud, then stand in the dark and wait: does the floor come to you, and does it forget? ---- */
  function siege(o){ reset(); L.god=true; const t0=GAME.t; equip(HANDS.R,newItem('pistol'));
    const per=new Map(); for(const E of enemies) if(!E.civ) per.set(E,{name:E.name,kind:E.kind,losT:null,minD:99,roles:new Set(),minds:[]});
    const sx=PL.x,sz=PL.z; let ph='go',fired=0,nextF=0; const marks=o.marks||[15,30,60,90,120,180],snaps=[]; let mi=0;
    while(GAME.t-t0<marks[marks.length-1]+.5){ KEYS.KeyW=false; const t=GAME.t-t0;
      if(ph==='go'){ if(Math.hypot(PL.x-o.at[0],PL.z-o.at[1])<.6) ph='fire'; else { const d=navTo(PL.x,PL.z,o.at[0],o.at[1]); PL.yaw=Math.atan2(-d[0],-d[2]); KEYS.KeyW=true; } }
      else if(ph==='fire'){ PL.yaw=-Math.PI/2; PL.pitch=-1.2; if(GAME.t>=nextF){ const b=camBasis(); fireHand(HANDS.R,{o:b.eye,d:b.f}); fired++; nextF=GAME.t+.6; if(fired>=3) ph='back'; } }
      else if(ph==='back'){ PL.pitch=0; if(Math.hypot(PL.x-o.hide[0],PL.z-o.hide[1])<.5){ ph='wait'; PL.yaw=-Math.PI/2; } else { const d=navTo(PL.x,PL.z,o.hide[0],o.hide[1]); PL.yaw=Math.atan2(-d[0],-d[2]); KEYS.KeyW=true; } }
      step();
      for(const [E,P] of per){ const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(ph==='wait'){ P.minD=Math.min(P.minD,d); if(P.losT==null&&E.canSee&&E.aware) P.losT=+t.toFixed(0); } if(E.role) P.roles.add(E.role); }
      if(mi<marks.length&&t>=marks[mi]){ snaps.push({t:marks[mi],aware:[...per.keys()].filter(E=>E.aware&&!E.dead).length,searching:[...per.keys()].filter(E=>E.mind==='search'||E.mind==='investigate').length,brace:[...per.keys()].filter(E=>E.mind==='brace').length,
          backToIdle:[...per.keys()].filter(E=>E.st==='idle'&&!E.aware).length,nervous:[...per.keys()].filter(E=>E.mind==='nervous').length,dmgSoFar:L.dmg.reduce((s,d)=>s+d[1],0)}); mi++; } }
    KEYS.KeyW=false;
    return {floor:FLOOR.def.n,hideLit:lit(o.hide[0],o.hide[1]),snaps,per:[...per.entries()].map(([E,p])=>({name:p.name,kind:p.kind,roles:[...p.roles].join('/'),sawYouAt:p.losT,closest:+p.minD.toFixed(1),end:E.st+'/'+(E.mind||'calm')+(E.aware?'/aware':''),shots:L.eshots.get(E)||0})),
      barks:L.barks.slice(0,40)}; }

  /* ---- a friend drops dead beside him, silently ---- */
  function body(o){ reset(); L.god=true; clearEnemies(); PL.x=-15; PL.z=0; equip(HANDS.R,null);
    const A=spawnEnemy({maker:makeGunman,name:'Beto',x:8,z:0,hd:Math.PI/2,extra:''}),Bm=spawnEnemy({maker:makeGunman,name:'Chuy',x:9.5,z:0,hd:-Math.PI/2,extra:''}); enemies.push(A,Bm); attachLabels();
    for(let k=0;k<30;k++) step(); const t0=GAME.t; A.headshot=true; const tl=[]; let last='';
    while(GAME.t-t0<o.secs){ step(); const s=Bm.st+'/'+(Bm.mind||'calm')+(Bm.aware?'/aware':'')+(Bm.goHome?'/goHome':''); if(s!==last){ last=s; tl.push([+(GAME.t-t0).toFixed(1),s]); } }
    return {tl,barks:L.barks.map(b=>[+(b[0]-t0).toFixed(1),b[1],b[2]]),endPos:[+Bm.pos[0].toFixed(1),+Bm.pos[1].toFixed(1)],home:Bm.home}; }

  /* ---- surrender: a quitter and a faker, gun on, then gun off ---- */
  function surr(o){ reset(); L.god=true; PL.x=-8; PL.z=0; PL.yaw=-Math.PI/2; PL.pitch=0; equip(HANDS.R,newItem('pistol'));
    const E=solo('gunman',-8+o.dist,0,-Math.PI/2,o.psych); for(let k=0;k<20;k++) step(); setAware(E,'see'); const t0=GAME.t; let sT=null,knT=null,spring=null,firstShot=null,away=null;
    while(GAME.t-t0<o.secs){ const t=GAME.t-t0;
      if(away==null||t<away){ window.__game.aimAt(X_(E.B,PI_.chest)); } else { PL.yaw=o.turn?Math.PI/2:-Math.PI/2; PL.pitch=o.turn?0:1.3; }
      step(); if(E.surr&&sT==null) sT=+t.toFixed(1); if(E.st==='kneel'&&knT==null){ knT=+t.toFixed(1); away=t+o.hold; }
      if(sT!=null&&!E.surr&&E.st==='alert'&&spring==null) spring=+t.toFixed(1); if(spring!=null&&firstShot==null&&L.eshots.get(E)) firstShot=+t.toFixed(1); }
    return {psych:o.psych,dist:o.dist,surrenderAt:sT,kneelAt:knT,gunOffAt:away&&+away.toFixed(1),sprangAt:spring,firstShotAt:firstShot,dmg:L.dmg.reduce((s,d)=>s+d[1],0),end:E.st+(E.surr?'/surr':''),gun:E.wpnHeld?'held':'not held',backup:!!E.backup}; }

  /* ---- the level, measured ---- */
  function level(){ const D=FLOOR.def,U=FLOOR.units||[],en=enemies; let cor=0,corLit=0,all=0,allLit=0;
    for(let x=-TL;x<=TL;x+=.5){ cor++; if(lit(x,0)) corLit++; }
    for(let c=0;c<FLOOR.nav.length;c++){ if(FLOOR.nav[c]) continue; const ci=c%NX,x=cellX(ci),z=cellZ((c-ci)/NX); if(Math.abs(x)>TL) continue; all++; if(lit(x,z)) allLit++; }
    const visFromHall=E=>{ const h=X_(E.B,PI_.head); for(let x=-TL;x<=TL;x+=.5) if(Math.hypot(h[0]-x,h[2])<12&&sightClear([x,1.6,0],h)) return true; return false; };
    const bad=en.filter(E=>!E.civ&&!E.ally),civ=en.filter(E=>E.civ),occ=new Set(en.map(E=>{ const u=twUnitOf(E.pos[0],E.pos[1]); return u?u.id:'hall'; }));
    return {n:D.n,rooms:U.length,holes:U.filter(u=>u.hole!=null).length,windows:U.filter(u=>u.win).length,occupied:[...occ].filter(k=>k!=='hall').length,inHall:en.filter(E=>Math.abs(E.pos[1])<1.9).map(E=>E.name),
      hallLitPct:Math.round(100*corLit/cor),floorLitPct:Math.round(100*allLit/all),lights:(FLOOR.lights||[]).filter(l=>l[1][0]+l[1][1]+l[1][2]>=.4).length,
      hostile:bad.length,plain:bad.filter(E=>E.concealed).length,civ:civ.length,hunters:bad.filter(E=>E.hunter).map(E=>E.name),stay:bad.filter(E=>E.stay).length,
      seenFromHall:bad.filter(visFromHall).map(E=>E.name),civSeenFromHall:civ.filter(visFromHall).length,kinds:bad.map(E=>E.kind.replace(/^m/,'')).sort().join(','),
      litPeople:en.filter(E=>lit(E.pos[0],E.pos[1])).length,people:en.length,music:!!D.music,roomW:U.map(u=>+(u.x1-u.x0).toFixed(1)).join(' ')}; }

  /* ---- the man with the flashlight: stand where you came in and wait for him ---- */
  function hunter(o){ reset(); L.god=true; const H=enemies.find(E=>E.hunter); if(!H) return {floor:FLOOR.def.n,hunter:null}; equip(HANDS.R,null); const t0=GAME.t; let aw=null,calls=0,minD=99,arr=null;
    const sx=PL.x,sz=PL.z; if(o.dark){ PL.x=sx+2.5; PL.z=1.3; }
    while(GAME.t-t0<o.secs){ step(); const d=Math.hypot(H.pos[0]-PL.x,H.pos[1]-PL.z); if(d<minD){ minD=d; arr=GAME.t-t0; } if(H.aware&&aw==null){ aw=+(GAME.t-t0).toFixed(0); } }
    return {floor:FLOOR.def.n,hunter:H.name,kind:H.kind,spawnLit:lit(PL.x,PL.z),sawYouAt:aw,closest:+minD.toFixed(1),closestAt:+arr.toFixed(0),calls:L.barks.filter(b=>b[1]===H.name).map(b=>[+(b[0]-t0).toFixed(0),b[2]]).slice(0,8),routePts:H.hunter.pts.length,othersAware:enemies.filter(E=>E!==H&&E.aware&&!E.civ).length}; }

  /* ---- the hunt (83-hunt.js; ?proto=1). Shared: hunt events on a log, Ray made unseeable for the timing tests ---- */
  /* Ray can't be seen (a stand-in for being well hidden): G's rayConcealment is a declaration in the game's scope, so swap the binding */
  const RC0=typeof rayConcealment==='function'?rayConcealment:null;
  function rayHidden(on){ if(RC0) rayConcealment=on?()=>0:RC0; else if(on) window.rayConcealment=()=>0; else delete window.rayConcealment; }
  const HE=[]; if(typeof protoOn==='function'){ protoOn('huntStart',r=>HE.push(['start',+GAME.t.toFixed(1),r])); protoOn('huntEnd',()=>HE.push(['end',+GAME.t.toFixed(1)])); }
  const men=()=>enemies.filter(E=>!E.civ&&!E.ally);
  const found=()=>men().find(E=>!E.dead&&E.aware&&E.canSee);
  const hstate=()=>typeof HUNT!=='undefined'?HUNT.state:'-';
  function shootDown(){ PL.pitch=-1.2; const b=camBasis(); const r=fireHand(HANDS.R,{o:b.eye,d:b.f}); PL.pitch=0; return r; }
  /* stand still in the dark after one unsuppressed shot: how long until one of them is looking at you? */
  function darkshot(o){ reset(); L.god=true; HE.length=0; equip(HANDS.R,newItem('pistol')); PL.x=o.at[0]; PL.z=o.at[1]; PL.yaw=o.yaw||0; for(let k=0;k<30;k++) step();
    const t0=GAME.t,lit=__D.lit(PL.x,PL.z); shootDown(); if(o.noflash&&typeof HUNT!=='undefined'){ HUNT.flashT=-99; GAME.shotT=-99; } let fT=null,who=null,how=null; /* noflash: found by the search, not by the muzzle flash */
    while(GAME.t-t0<(o.secs||45)){ step(); const F=found(); if(F){ fT=+(GAME.t-t0).toFixed(1); who=F.name; how=(F.torchOn?'torch ':'')+(F.hLit?'lit':'dark')+' '+Math.hypot(F.pos[0]-PL.x,F.pos[1]-PL.z).toFixed(1)+'m'; break; } }
    return {at:o.at,noflash:!!o.noflash,lit,foundAt:fT,who,how,state:hstate(),hunts:HE.slice()}; }
  /* hunt length and breathers: one shot, then Ray can't be seen (a stub for the hiding system); more noise in the breather */
  function cycle(o){ reset(); L.god=true; HE.length=0; rayHidden(true); equip(HANDS.R,newItem('pistol')); PL.x=o.at[0]; PL.z=o.at[1]; for(let k=0;k<30;k++) step();
    const t0=GAME.t; shootDown(); const shots=[0]; let endN=0,lastEnd=null,nextShot=null; const snaps=[];
    while(GAME.t-t0<o.secs){ step(); const t=GAME.t-t0, ends=HE.filter(h=>h[0]==='end');
      if(ends.length>endN){ endN=ends.length; lastEnd=t; nextShot=t+(o.after||10); }
      if(nextShot!=null&&t>=nextShot){ nextShot=null; shootDown(); shots.push(+t.toFixed(1)); }
      if(Math.floor(t)%5===0&&Math.floor(t)!==(snaps.length?snaps[snaps.length-1].t:-1)) snaps.push({t:Math.floor(t),s:hstate(),idle:men().filter(E=>!E.dead&&E.st==='idle').length}); }
    rayHidden(false);
    const H=HE.map(h=>[h[0],+(h[1]-t0).toFixed(1),h[2]||'']),runs=[]; let cur=null; for(const h of H){ if(h[0]==='start') cur={start:h[1],why:h[2]}; else if(cur){ cur.len=+(h[1]-cur.start).toFixed(1); cur.end=h[1]; runs.push(cur); cur=null; } } if(cur) runs.push(cur);
    const gaps=runs.slice(1).map((r,i)=>({gap:+(r.start-runs[i].end).toFixed(1),why:r.why}));
    return {runs,gaps,shots,log:typeof HUNT!=='undefined'?HUNT.log.filter(l=>l.ev!=='alert'&&l.ev!=='probe').slice(0,40):null}; }
  /* a body is found: from then on, is any man ever idle at his post? */
  function idle(o){ reset(); L.god=true; HE.length=0; rayHidden(true); PL.x=o.hide[0]; PL.z=o.hide[1]; for(let k=0;k<30;k++) step();
    const V=enemies.find(E=>E.name===o.victim); V.headshot=true; const t0=GAME.t; let bodyT=null; const per={},still={};
    while(GAME.t-t0<o.secs){ step(); const t=GAME.t-t0; if(bodyT==null&&(typeof HUNT!=='undefined'?HUNT.body:men().some(E=>E.seen&&E.seen.has(V)))) bodyT=+t.toFixed(1);
      if(bodyT!=null) for(const E of men()){ if(E.dead||E.st==='down'||E.st==='kneel') continue; const P=per[E.name]||(per[E.name]={idle:0,maxStill:0,jobs:new Set()});
        if(E.st==='idle'&&!E.aware) P.idle+=dt; if(E.hj) P.jobs.add(E.hj.k); if(E.aware) P.jobs.add('aware');
        const S=still[E.name]||(still[E.name]={p:E.pos.slice(),t:t}); if(Math.hypot(E.pos[0]-S.p[0],E.pos[1]-S.p[1])>.6){ S.p=E.pos.slice(); S.t=t; } P.maxStill=Math.max(P.maxStill,t-S.t); } }
    rayHidden(false);
    return {victim:o.victim,bodyFoundAt:bodyT,hunts:HE.map(h=>[h[0],+(h[1]-t0).toFixed(1),h[2]||'']),per:Object.fromEntries(Object.entries(per).map(([k,v])=>[k,{idleS:+v.idle.toFixed(1),maxStillS:+v.maxStill.toFixed(1),jobs:[...v.jobs].join('/')}]))}; }
  /* walk at a calm man's face in the dark: is there a warning first? */
  function face(o){ reset(); L.god=true; HE.length=0; equip(HANDS.R,null); const sg=o.ex>0?1:-1; /* he stands at ex looking back toward the middle; you come from the middle */
    const E=solo('gunman',o.ex,0,(o.behind?1:-1)*sg*Math.PI/2); PL.x=FLOOR.start.x; PL.z=FLOOR.start.z; PL.yaw=-sg*Math.PI/2; PL.pitch=0; for(let k=0;k<20;k++) step();
    PL.x=o.ex-sg*o.from; PL.z=0; step(); E.pm=0; const t0=GAME.t; let warn=null,spot=null,warnHow=null; L.barks.length=0;
    while(GAME.t-t0<25){ const d=(E.pos[0]-PL.x)*sg; if(d>(o.stop||.6)){ if(o.slow) stick.dy=-o.slow; else KEYS.KeyW=true; } else { KEYS.KeyW=false; stick.dy=0; }
      step(); const t=+(GAME.t-t0).toFixed(2),gap=+((E.pos[0]-PL.x)*sg).toFixed(1);
      if(warn==null&&((E.pm||0)>.15||E.hj||E.hReact>0||E.mind&&E.mind!=='calm'||L.barks.length)){ warn={t,gap}; warnHow=L.barks.length?L.barks[0][2]:E.hj?E.hj.k:(E.pm>.15?'meter':E.mind); }
      if(E.aware){ spot={t,gap}; break; } }
    KEYS.KeyW=false; stick.dy=0; return {ex:o.ex,slow:o.slow||1,behind:!!o.behind,lit:__D.lit(E.pos[0],E.pos[1]),warn,warnHow,spot,lead:warn&&spot?+(spot.t-warn.t).toFixed(2):null}; }
  /* the meter's timings: one man, Ray standing in his view, by state and distance (Ray lit by a stub for the far cases) */
  function meter(o){ reset(); L.god=true; equip(HANDS.R,null); const E=solo('gunman',o.ex,0,-Math.PI/2); PL.x=o.ex-o.dist; PL.z=0; PL.yaw=Math.PI/2;
    if(typeof HUNT!=='undefined'){ HUNT.state=o.state||'calm'; HUNT.t=999; HUNT.len=999; HUNT.t0=GAME.t; HUNT.lkp=[o.ex,0]; HUNT.lkpT=GAME.t; } const _l=window.huntLitAt; if(o.lit&&typeof huntLitAt==='function'){ window.__litStub=true; huntLitAt=()=>true; }
    const _cb=camBasis; if(o.peek){ camBasis=function(){ const b=_cb(); return Object.assign({},b,{eye:[b.eye[0],b.eye[1],b.eye[2]]}); }; }
    for(let k=0;k<3;k++) step(); E.pm=0; E.spotT=0; const t0=GAME.t; let full=null,heads=null;
    if(o.peek&&typeof huntSight==='function'){ const _hs=huntSight; huntSight=function(E_,d,B){ const r=_hs(E_,d,B); if(r&&E_===E) E_.hLos=1; return r; }; }
    while(GAME.t-t0<8){ PL.x=o.ex-o.dist; PL.z=0; step(); if(E.aware){ full=+(GAME.t-t0).toFixed(2); break; } }
    return {state:o.state||'calm',dist:o.dist,lit:!!o.lit,peek:!!o.peek,spottedAfter:full}; }
  /* cost: senses() and the hunt's own tick, per frame, nine people, during a hunt */
  function cost(o){ reset(); L.god=true; rayHidden(true); equip(HANDS.R,newItem('pistol')); PL.x=o.at[0]; PL.z=o.at[1]; for(let k=0;k<30;k++) step(); shootDown();
    let tS=0,tH=0,tU=0,n=0; const _s=senses; senses=function(){ const a=performance.now(); const r=_s.apply(this,arguments); tS+=performance.now()-a; return r; };
    const _h=typeof huntTick==='function'?huntTick:null; if(_h) huntTick=function(){ const a=performance.now(); const r=_h.apply(this,arguments); tH+=performance.now()-a; return r; };
    for(let k=0;k<30*o.secs;k++){ const a=performance.now(); step(); tU+=performance.now()-a; n++; }
    senses=_s; if(_h) huntTick=_h; rayHidden(false);
    return {frames:n,people:enemies.length,state:hstate(),sensesMs:+(tS/n).toFixed(3),huntTickMs:+(tH/n).toFixed(3),bothMs:+((tS+tH)/n).toFixed(3),wholeUpdateMs:+(tU/n).toFixed(2)}; }
  /* hiding spot checks: a hunt starts near a bed Ray was seen getting into (a stand-in for the hiding system: PL.hide set, Ray at its centre) */
  function hidecheck(o){ reset(); L.god=true; HE.length=0; rayHidden(true); equip(HANDS.R,newItem('pistol'));
    const S=huntHides().filter(s=>s.kind===o.kind).sort((a,b)=>Math.hypot(a.x-o.near[0],a.z-o.near[1])-Math.hypot(b.x-o.near[0],b.z-o.near[1]))[0]; if(!S) return {err:'no spot'};
    PL.x=S.x; PL.z=S.z; for(let k=0;k<30;k++) step(); if(o.seen){ HUNT.lastSeen={t:GAME.t,x:PL.x,z:PL.z}; } PL.hide=S; step();
    const t0=GAME.t; huntAlert('shot',huntApproach(S,[S.x,0]),1); let caught=null; const probes=[];
    while(GAME.t-t0<o.secs){ step(); for(const l of HUNT.log) if(l.ev==='probe'&&l.t>=t0&&!l._seen){ l._seen=true; probes.push([+(l.t-t0).toFixed(1),l.by,l.kind,l.caught]); if(l.caught&&caught==null) caught=+(l.t-t0).toFixed(1); } if(caught!=null) break; }
    rayHidden(false); PL.hide=null;
    return {kind:o.kind,seenIn:!!o.seen,spotAt:[+S.x.toFixed(1),+S.z.toFixed(1)],caughtAt:caught,probes:probes.slice(0,8)}; }

  /* the real hiding system (86-hide.js, ?hidetest=1): crawl under the test bed or into the wardrobe, then a hunt starts close by */
  function realhide(o){ reset(); L.god=true; HE.length=0; equip(HANDS.R,null); for(const k in KEYS) KEYS[k]=false;
    const S=HIDES.find(h=>h.id===o.id); if(!S) return {err:'no '+o.id};
    const lp=hideLookPoint(S); PL.x=lp[0]; PL.z=lp[1]; HIDE.lx=null; if(o.crawl){ hideCrouchToggle(); for(let k=0;k<15;k++) step(); }
    PL.yaw=Math.atan2(-(S.x-PL.x),-(S.z-PL.z)); KEYS.KeyW=true; for(let k=0;k<150&&PL.hide!==S;k++) step(); for(let k=0;k<20;k++) step(); KEYS.KeyW=false; /* in, then fully in */
    for(let k=0;k<60;k++) step(); /* settle, keep still */
    const inIt=PL.hide===S,exp=+PL.hideExp.toFixed(2); if(o.saves) HIDE_KIND_SAVES[S.kind]=o.saves;
    if(o.seen){ HUNT.seenIn={spot:S,t:GAME.t}; }
    const t0=GAME.t; huntAlert('shot',[lp[0]+(o.off||0),lp[1]],1); let caught=null,seen=null; const probes=[];
    while(GAME.t-t0<o.secs){ step(); for(const l of HUNT.log) if(l.ev==='probe'&&l.t>=t0&&!l._s){ l._s=true; probes.push([+(l.t-t0).toFixed(1),l.by,l.kind,l.caught]); if(l.caught&&caught==null) caught=+(l.t-t0).toFixed(1); }
      if(seen==null&&men().some(E=>E.aware&&E.canSee)) seen=+(GAME.t-t0).toFixed(1); if((caught!=null||seen!=null)&&!o.stay) break; if(o.stay&&HE.some(h=>h[0]==='end')) break; }
    return {spot:o.id,kind:S.kind,inIt,exp,seenIn:!!o.seen,away:o.off||0,caughtAt:caught,seenAt:seen,probes:probes.slice(0,6),hunt:hstate(),ended:HE.filter(h=>h[0]==='end').map(h=>+(h[1]-t0).toFixed(1)),steers:HUNT.log.filter(l=>l.ev==='steer'&&l.t>=t0).length}; }
  return {realhide,duel,detect,fight,siege,body,surr,level,hunter,darkshot,cycle,idle,face,meter,cost,hidecheck,step,L,lit};
})();`;

(async () => {
  const browser = await chromium.launch({ timeout: 180000, executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  const fresh = async f => { const page = await browser.newPage({ viewport: { width: 640, height: 360 } }); page.on('pageerror', e => errs.push('f' + f + ' ' + String(e).slice(0, 200)));
    await page.goto(game + '?f=' + f + (args.q ? '&' + args.q : ''), { timeout: 180000 }); await page.waitForTimeout(350); await page.click('#start'); await page.waitForTimeout(250); await page.evaluate(s => window.__eval(s), CORE); return page; };
  const run = async (f, fn, a) => { const p = await fresh(f); const r = await p.evaluate(([fn, a]) => { try { return window.__D[fn](a); } catch (e) { return { ERR: String(e.stack).slice(0, 400) }; } }, [fn, a]); await p.close(); console.log(JSON.stringify(r)); return r; };
  const F0 = args.f || 3;
  if (test === 'duel') { for (const lit of [true, false]) for (const kind of ['gunman', 'enforcer', 'doorman', 'landlord', 'corner', 'cutter']) for (const dist of [3, 6, 10]) await run(3, 'duel', { kind, dist, lit, secs: 60 }); }
  else if (test === 'detect') { for (const a of [{}, { lit: true }, { behind: true }, { behind: true, lit: true }, { slow: .5 }, { behind: true, slow: .5 }, { stop: 3 }, { stop: 2.5, lit: true }, { stop: 1.5, behind: true }]) for (let r = 0; r < (args.runs || 2); r++) await run(F0, 'detect', a); }
  else if (test === 'fight') { const [a, b] = (args.floors || '1-15').split('-').map(Number); for (let f = a; f <= b; f++) for (let r = 0; r < (args.runs || 2); r++) { const p = await fresh(f); if (args.wpn) await p.evaluate(([k, s]) => window.__eval(`equip(HANDS.R,newItem('${k}',undefined,${s}))`), [args.wpn, !!args.sup]);
      const res = await p.evaluate(a => window.__D.fight(a), { maxT: 300, sigma: args.sigma ?? 3, react: args.react ?? .6, gap: args.gap ?? .3 }); await p.close(); console.log(JSON.stringify(res)); } }
  else if (test === 'siege') { for (const f of args.floors || [3, 7, 10, 12]) for (const where of ['mid', 'start']) await run(f, 'siege', where === 'mid' ? { at: [0, 0], hide: [-9, 0] } : { at: [-8, 0], hide: [-16.2, -.45] }); }
  else if (test === 'body') { for (let r = 0; r < (args.runs || 3); r++) await run(F0, 'body', { secs: args.secs || 70 }); }
  else if (test === 'surr') { for (const psych of ['quit', 'fake', 'fight']) for (const a of [{ dist: 3, hold: 2, turn: false }, { dist: 3, hold: 2, turn: true }, { dist: 7, hold: 2, turn: true }]) for (let r = 0; r < 2; r++) await run(3, 'surr', Object.assign({ psych, secs: 40 }, a)); }
  else if (test === 'level') { for (let f = 1; f <= 15; f++) await run(f, 'level'); }
  else if (test === 'hunter') { for (const f of args.floors || [1, 2, 4, 7, 14]) for (const dark of [false, true]) await run(f, 'hunter', { secs: 150, dark }); }
  else if (test === 'darkshot') { for (const at of args.ats || [[6, 0], [5, -3.5], [8, 3.5], [-12, 0], [12.5, -3.5]]) for (let r = 0; r < (args.runs || 1); r++) await run(F0, 'darkshot', { at, secs: args.secs || 45, noflash: !!args.noflash }); }
  else if (test === 'cycle') { for (let r = 0; r < (args.runs || 1); r++) await run(F0, 'cycle', { at: args.at || [-12, -0.4], secs: args.secs || 330, after: args.after || 10 }); }
  else if (test === 'idle') { for (const v of args.victims || ['Rui', 'Dani']) await run(F0, 'idle', { victim: v, hide: args.hide || [12.5, -3.5], secs: args.secs || 240 }); }
  else if (test === 'face') { for (const a of [{ ex: 12, from: 7 }, { ex: 12, from: 7, slow: .5 }, { ex: 8, from: 7 }, { ex: 12, from: 7, behind: true, slow: .5 }, { ex: 12, from: 7, behind: true }]) for (let r = 0; r < (args.runs || 2); r++) await run(F0, 'face', a); }
  else if (test === 'meter') { for (const a of [{ state: 'calm', dist: 5, lit: true }, { state: 'edge', dist: 5, lit: true }, { state: 'hunting', dist: 5, lit: true }, { state: 'calm', dist: 1.6 }, { state: 'calm', dist: 12, lit: true }, { state: 'calm', dist: 5, lit: true, peek: true }, { state: 'calm', dist: 4 }, { state: 'edge', dist: 2.6 }]) await run(F0, 'meter', Object.assign({ ex: 8 }, a)); }
  else if (test === 'cost') { await run(F0, 'cost', { at: args.at || [-12, -0.4], secs: args.secs || 40 }); }
  else if (test === 'hidecheck') { for (const a of [{ kind: 'bed', near: [-8.5, -5], seen: true }, { kind: 'wardrobe', near: [-5, -5.6], seen: true }, { kind: 'bed', near: [-8.5, -5], seen: false }]) await run(F0, 'hidecheck', Object.assign({ secs: 60 }, a)); }
  else if (test === 'realhide' && args.away) { for (let r = 0; r < (args.runs || 3); r++) await run(F0, 'realhide', { id: args.id || 'test-bed', crawl: (args.id || 'test-bed') === 'test-bed', seen: false, off: args.away, secs: 80, stay: true }); }
  else if (test === 'realhide') { for (const a of [{ id: 'test-bed', crawl: true, seen: true }, { id: 'test-bed', crawl: true, seen: false }, { id: 'test-wardrobe', seen: true }, { id: 'test-wardrobe', seen: false, off: 3 }]) await run(F0, 'realhide', Object.assign({ secs: 60 }, a)); }
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 8)));
  await browser.close();
})();
