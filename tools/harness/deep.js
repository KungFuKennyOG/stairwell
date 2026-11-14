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
  return {duel,detect,fight,siege,body,surr,level,hunter,step,L,lit};
})();`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const errs = [];
  const fresh = async f => { const page = await browser.newPage({ viewport: { width: 640, height: 360 } }); page.on('pageerror', e => errs.push('f' + f + ' ' + String(e).slice(0, 200)));
    await page.goto(game + '?f=' + f); await page.waitForTimeout(350); await page.click('#start'); await page.waitForTimeout(250); await page.evaluate(s => window.__eval(s), CORE); return page; };
  const run = async (f, fn, a) => { const p = await fresh(f); const r = await p.evaluate(([fn, a]) => { try { return window.__D[fn](a); } catch (e) { return { ERR: String(e.stack).slice(0, 400) }; } }, [fn, a]); await p.close(); console.log(JSON.stringify(r)); return r; };
  if (test === 'duel') { for (const lit of [true, false]) for (const kind of ['gunman', 'enforcer', 'doorman', 'landlord', 'corner', 'cutter']) for (const dist of [3, 6, 10]) await run(3, 'duel', { kind, dist, lit, secs: 60 }); }
  else if (test === 'detect') { for (const a of [{}, { lit: true }, { behind: true }, { behind: true, lit: true }, { slow: .5 }, { behind: true, slow: .5 }, { stop: 3 }, { stop: 2.5, lit: true }, { stop: 1.5, behind: true }]) for (let r = 0; r < 2; r++) await run(3, 'detect', a); }
  else if (test === 'fight') { const [a, b] = (args.floors || '1-15').split('-').map(Number); for (let f = a; f <= b; f++) for (let r = 0; r < (args.runs || 2); r++) { const p = await fresh(f); if (args.wpn) await p.evaluate(([k, s]) => window.__eval(`equip(HANDS.R,newItem('${k}',undefined,${s}))`), [args.wpn, !!args.sup]);
      const res = await p.evaluate(a => window.__D.fight(a), { maxT: 300, sigma: args.sigma ?? 3, react: args.react ?? .6, gap: args.gap ?? .3 }); await p.close(); console.log(JSON.stringify(res)); } }
  else if (test === 'siege') { for (const f of args.floors || [3, 7, 10, 12]) for (const where of ['mid', 'start']) await run(f, 'siege', where === 'mid' ? { at: [0, 0], hide: [-9, 0] } : { at: [-8, 0], hide: [-16.2, -.45] }); }
  else if (test === 'body') { for (let r = 0; r < 3; r++) await run(3, 'body', { secs: 70 }); }
  else if (test === 'surr') { for (const psych of ['quit', 'fake', 'fight']) for (const a of [{ dist: 3, hold: 2, turn: false }, { dist: 3, hold: 2, turn: true }, { dist: 7, hold: 2, turn: true }]) for (let r = 0; r < 2; r++) await run(3, 'surr', Object.assign({ psych, secs: 40 }, a)); }
  else if (test === 'level') { for (let f = 1; f <= 15; f++) await run(f, 'level'); }
  else if (test === 'hunter') { for (const f of [1, 2, 4, 7, 14]) for (const dark of [false, true]) await run(f, 'hunter', { secs: 150, dark }); }
  if (errs.length) console.log('ERRORS', JSON.stringify(errs.slice(0, 8)));
  await browser.close();
})();
