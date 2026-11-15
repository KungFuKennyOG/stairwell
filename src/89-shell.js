/* =====================================================================
   THE PROTOTYPE SHELL: getting into the floor 01 prototype, dying and going again, the end card, and the numbers.
   Boot (shellBoot, called from 99-end.js): ?proto=1 loads the new floor (pfLoad, 85-pfloor.js) when it's in the build, and the old
   floor 01 with the prototype rules when it isn't. ?pf=0 forces the old floor. ?pdbg=1 puts a second line on the left wrist in play.
   Only the cards and the restart flow change the game, and only with PROTO.on. The telemetry just listens (protoOn) and costs a few
   additions a frame; the bots in tools/proto/ read it through window.__protoStats().
   A run is one go at the floor: it starts on every reset and ends on the exit, a death or another reset.
   Listens to: reset, load, tick, hurt, death, fire, shotHit, exit, huntStart, huntEnd, grabbed, grabEnd, bandaged, stat.
   Emits: exit (old floor only: stepping onto the east landing; the new floor emits its own).
   ===================================================================== */
PROTO.shell={card:2.4,fadeOut:.5,fadeIn:.7,endFade:.6,againAfter:1.2};
const SHELL={where:null,run:null,runs:[],n:0,dying:null,fadeIn:0,end:null,dbg:new URLSearchParams(location.search).get('pdbg')==='1',
  lastHurt:null,shotId:0,shotHitId:-1,hitD:new WeakMap(),hunt:null,huntEv:false,grabs:new Map(),deadSeen:false,deathsSinceExit:0,trig:false,wristT:0};
if(PROTO.on) document.body.classList.add('proto');

/* ---------- the run record ---------- */
function shellNewRun(){ const def=FLOOR.def,where=FLOOR.mode==='proto'?'proto':FLOOR.mode==='camp'&&def?'old-'+String(def.n).padStart(2,'0'):FLOOR.mode||'?';
  return {n:++SHELL.n,where,t:0,dmg:0,shots:0,hits:0,pellets:0,kills:[],deaths:[],hidden:0,hunts:[],grabs:[],bandages:0,stats:{},civHit:[],ended:null,exit:false,exitT:null}; }
function shellEndRun(why){ const R=SHELL.run; if(!R||R.ended) return; R.ended=why;
  if(SHELL.hunt){ SHELL.hunt.len=+(R.t-SHELL.hunt.t0).toFixed(1); SHELL.hunt.open=true; SHELL.hunt=null; } /* cut short by the end of the run */
  for(const g of SHELL.grabs.values()){ g.result=why==='death'?'lost':'open'; g.len=+(R.t-g.t0).toFixed(1); } SHELL.grabs.clear();
  if(why!=='reset'){ /* on a reset the cast has already been replaced: who was left standing isn't known any more */
    const bad=enemies.filter(E=>!E.civ&&!E.ally),civ=enemies.filter(E=>E.civ);
    R.men=bad.length; R.spared=bad.filter(E=>!E.dead).length; R.tenants=civ.length; R.tenantsDead=civ.filter(E=>E.dead).length;
    R.tenantsHarmed=civ.filter(E=>E.dead||(E.wounds&&E.wounds.length)||R.civHit.includes(E.name)).length; }
  R.t=+R.t.toFixed(1); R.hidden=+R.hidden.toFixed(1);
  /* a reset straight after another (boot, loading a floor) is not a run */
  if(why==='reset'&&R.t<.5&&!R.shots&&!R.deaths.length) return;
  SHELL.runs.push(R); if(SHELL.runs.length>60) SHELL.runs.shift(); }
window.__protoStats=()=>JSON.parse(JSON.stringify({where:SHELL.where,run:SHELL.run,runs:SHELL.runs,dying:!!SHELL.dying,ended:!!SHELL.end}));

/* what killed him, in plain words: the last thing that hurt him, or the blood he lost since */
function shellCause(){ const h=SHELL.lastHurt,recent=h&&GAME.t-h.t<1.5,bleeding=PL.wounds&&PL.wounds.some(w=>w.bleed>0&&!w.bandaged);
  const c={who:h&&h.who||null,kind:h&&h.kind||null,part:h&&h.part||null,guess:!!(h&&h.guess)};
  if(c.kind==='bleed'||(!recent&&bleeding)){ c.kind='bleed'; c.text='Bled out.'; }
  else if(c.who) c.text=`Killed by ${c.who}.`;
  else c.text=c.kind==='fall'?'Fell.':c.kind==='choke'?'Choked.':'Dead.';
  return c; }

const shellLive=()=>{ const R=SHELL.run; return R&&!R.ended?R:null; };
protoOn('reset',()=>{ if(SHELL.run&&!SHELL.run.ended) shellEndRun('reset');
  SHELL.run=shellNewRun(); SHELL.lastHurt=null; SHELL.deadSeen=false; SHELL.hunt=null; SHELL.grabs.clear(); SHELL.hitD=new WeakMap();
  if(!PROTO.on) return;
  const out=SHELL.dying||SHELL.end; SHELL.dying=null; if(SHELL.end){ SHELL.end=null; GAME.climbing=false; }
  shellCards(); endN.vis=false;
  if(out){ SHELL.fadeIn=PROTO.shell.fadeIn; GAME.fade=1; } /* back from black */
  if(FLOOR.mode==='camp') FLOOR.noClear=true; /* the old floor in the prototype: the end card is the ending, not "floor clear" */
  const tag=$('floorTag'); if(tag) tag.textContent='Floor 01 · prototype'; });
/* the core's callers don't say who hurt you yet (src is {} until agent A passes {E,kind,part}): guess from the gunshot in the same
   instant (enemyShoot makes its noise just before it calls hurtPlayer), or the man at arm's length */
protoOn('noise',(src,rad,o)=>{ if(o&&o.from&&o.alarm&&rad>=12) SHELL.lastShot={E:o.from,t:GAME.t}; });
function shellGuess(){ const s=SHELL.lastShot; if(s&&s.E&&GAME.t-s.t<.02) return {E:s.E,kind:'gun'};
  let best=null,bd=2.2; for(const E of enemies){ if(E.civ||E.ally||E.dead||!E.aware) continue; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(d<bd){ bd=d; best=E; } }
  return best?{E:best,kind:'melee'}:null; }
protoOn('hurt',(d,src)=>{ src=src||{}; if(!src.E&&!src.who&&!src.kind){ const g=shellGuess(); if(g) src={E:g.E,kind:g.kind,guess:true}; }
  SHELL.lastHurt={t:GAME.t,d,who:src.E&&src.E.name||src.who||null,kind:src.kind||null,part:src.part||null,guess:!!src.guess};
  const R=shellLive(); if(R) R.dmg+=d;
  if(PROTO.on&&SHELL.end) PL.hp+=d; }); /* the run's over and you're reading the card: nothing lands now (hurtPlayer takes d off after this) */
protoOn('fire',()=>{ const R=shellLive(); if(!R) return; R.shots++; SHELL.shotId++; });
protoOn('shotHit',(E,seg,dist)=>{ const R=shellLive(); if(!R||!E) return; R.pellets++;
  if(SHELL.shotHitId!==SHELL.shotId){ SHELL.shotHitId=SHELL.shotId; R.hits++; } /* a shotgun blast that lands is one hit */
  SHELL.hitD.set(E,{d:dist||0,t:GAME.t}); if(E.civ&&!R.civHit.includes(E.name)) R.civHit.push(E.name); });
protoOn('death',E=>{ const R=shellLive(); if(!R||!E||E.ally) return;
  if(E.civ){ if(!R.civHit.includes(E.name)) R.civHit.push(E.name); return; }
  const h=SHELL.hitD.get(E),d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z);
  R.kills.push({who:E.name,kind:E.kind,t:+R.t.toFixed(1),d:+d.toFixed(1),shotD:h?+h.d.toFixed(1):null}); }); /* shot from range and bled out later: the shot's distance counts */
protoOn('huntStart',reason=>{ SHELL.huntEv=true; shellHuntOpen(reason); });
protoOn('huntEnd',()=>{ SHELL.huntEv=true; shellHuntClose(); });
function shellHuntOpen(reason){ const R=shellLive(); if(!R||SHELL.hunt) return; const prev=R.hunts[R.hunts.length-1];
  if(prev&&prev.end!=null&&prev.gap==null) prev.gap=+(R.t-prev.end).toFixed(1); /* the breather it had */
  SHELL.hunt={t0:+R.t.toFixed(1),reason:reason||null,len:null,end:null,gap:null}; R.hunts.push(SHELL.hunt); }
function shellHuntClose(){ const R=shellLive(),H=SHELL.hunt; if(!R||!H) return; H.end=+R.t.toFixed(1); H.len=+(R.t-H.t0).toFixed(1); SHELL.hunt=null; }
protoOn('grabbed',(E,kind)=>{ const R=shellLive(); if(!R) return; const g={who:E&&E.name||null,kind:kind||null,t0:+R.t.toFixed(1),result:null,len:null}; R.grabs.push(g); SHELL.grabs.set(E||g,g); });
protoOn('grabEnd',(E,kind,result)=>{ const R=shellLive(); if(!R) return; const g=SHELL.grabs.get(E)||[...SHELL.grabs.values()].pop(); if(!g) return;
  g.result=result||'free'; g.len=+(R.t-g.t0).toFixed(1); SHELL.grabs.delete(E); SHELL.grabs.delete(g); });
protoOn('bandaged',()=>{ const R=shellLive(); if(R) R.bandages++; });
protoOn('stat',(name,v)=>{ const R=shellLive(); if(!R||!name) return; const s=R.stats[name]||(R.stats[name]={n:0,sum:0,min:null,max:null,last:null}); v=+v;
  if(!isFinite(v)) v=1; s.n++; s.sum=+(s.sum+v).toFixed(3); s.min=s.min==null?v:Math.min(s.min,v); s.max=s.max==null?v:Math.max(s.max,v); s.last=v; });
protoOn('exit',()=>{ if(!PROTO.on) return; const R=shellLive(); if(!R||PL.dead||SHELL.end) return;
  R.exit=true; R.exitT=+R.t.toFixed(1); R.deathsBefore=SHELL.deathsSinceExit; SHELL.deathsSinceExit=0; shellEndRun('exit');
  SHELL.end={t:0,shown:false,R}; GAME.climbing=true; }); /* no climbing on, no "floor clear": this is the end of the prototype */

/* ---------- every frame ---------- */
protoOn('tick',(gdt,dt)=>{ const R=shellLive();
  if(R&&GAME.started&&!PL.dead){ R.t+=dt; if(PL.hide) R.hidden+=dt; if(!SHELL.huntEv) shellHuntPoll(); }
  /* the moment he dies: write it down (the card comes below, prototype only) */
  if(PL.dead&&!SHELL.deadSeen&&GAME.started){ SHELL.deadSeen=true; const c=shellCause();
    if(R){ R.deaths.push({t:+R.t.toFixed(1),who:c.who,kind:c.kind,part:c.part,guess:c.guess,text:c.text,x:+PL.x.toFixed(1),z:+PL.z.toFixed(1)}); SHELL.deathsSinceExit++; shellEndRun('death'); }
    if(PROTO.on) shellDeathCard(c); }
  if(!PROTO.on) return;
  const P=PROTO.shell;
  if(SHELL.dying){ const D=SHELL.dying; D.t+=dt; const a=D.t-P.card; if(a>0) GAME.fade=clamp(a/P.fadeOut,0,1); if(a>=P.fadeOut) PL.deadT=1e3; return; } /* black: the core restarts the floor at the top of the next frame */
  if(SHELL.fadeIn>0){ SHELL.fadeIn=Math.max(0,SHELL.fadeIn-dt); GAME.fade=SHELL.fadeIn/P.fadeIn; }
  /* the old floor has no exit event of its own: the east landing is the way out (the climb would fire at the same line, after this) */
  if(SHELL.where==='old'&&FLOOR.mode==='camp'&&GAME.started&&!PL.dead&&!SHELL.end&&!GAME.climbing&&PL.x>TL+.45&&Math.abs(PL.z)<1.9) protoEmit('exit');
  if(SHELL.end) shellEndTick(dt);
  if(XR.on&&(SHELL.end||SHELL.dbg)){ SHELL.wristT-=dt; if(SHELL.wristT<=0){ SHELL.wristT=.5; drawWrist2(); } } else if(wristN) wristN.vis=false; });

/* no hunt events (agent D's hunt not in the build, or it never emits): read the floor's state instead */
function shellHuntPoll(){ if(typeof HUNT==='undefined'||!HUNT) return; const on=HUNT.state==='hunting'; if(on&&!SHELL.hunt) shellHuntOpen('state'); else if(!on&&SHELL.hunt) shellHuntClose(); }

/* ---------- dying: a plain card, a short fade, the floor again ---------- */
function shellDeathCard(c){ const P=PROTO.shell; $('msg').hidden=true; /* the old "YOU DIED" card */
  SHELL.dying={t:0,c}; PL.deadT=3.5-(P.card+P.fadeOut)-.3; /* the core restarts at 3.5 s dead: this lands just after ours, as a backstop */
  const el=$('pDeath'); el.textContent=c.text; el.hidden=false; if(XR.on) vrToast(c.text,P.card+P.fadeOut); }
function shellCards(){ $('pDeath').hidden=true; $('pEnd').hidden=true; document.body.classList.remove('pend'); }

/* ---------- the end card ---------- */
const fmtT=s=>{ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
function shellEndRows(R){ const hunts=R.hunts.filter(h=>h.len!=null),held=R.grabs.length,ok=R.grabs.filter(g=>g.result==='free'||g.result==='killed').length;
  const rows=[['Time',fmtT(R.t)],['Killed',String(R.kills.length)],['Spared',String(R.spared)],['Tenants harmed',R.tenants?`${R.tenantsHarmed} of ${R.tenants}`:'0'],
    ['Shots',String(R.shots)],['Hits',String(R.hits)],['Time hidden',fmtT(R.hidden)],['Hunts',hunts.length?`${hunts.length} (${hunts.map(h=>fmtT(h.len)).join(', ')})`:'0'],
    ['Grabs survived',held?`${ok} of ${held}`:'0']];
  if(R.deathsBefore) rows.push(['Died first',R.deathsBefore===1?'once':R.deathsBefore+' times']);
  return rows; }
function shellEndTick(dt){ const P=PROTO.shell,S=SHELL.end; S.t+=dt;
  if(!S.shown){ GAME.fade=clamp(S.t/P.endFade,0,1); if(S.t>=P.endFade){ S.shown=true; S.at=S.t; shellEndShow(S.R); if(XR.on) SHELL.fadeIn=P.fadeIn; } return; }
  if(!XR.on){ GAME.fade=1; return; } /* flat screen: the card sits on black */
  /* VR: the card floats ahead of you in the empty floor, lazily following your gaze; either trigger plays again */
  const hd=XR.head; if(hd){ const fl=norm3([hd.f[0],0,hd.f[2]]),tg=v3.add(hd.eye,v3.add(v3.sc(fl,.95),[0,-.06,0]));
    S.p=!S.p?tg:v3.add(S.p,v3.sc(v3.sub(tg,S.p),Math.min(1,dt*2.5))); endN.p=S.p.slice(); endN.r=[0,Math.atan2(hd.eye[0]-S.p[0],hd.eye[2]-S.p[2]),0]; endN.vis=true; }
  const trig=!!(HANDS.R.trigHeld||HANDS.L.trigHeld); if(trig&&!SHELL.trig&&S.t-S.at>P.againAfter) shellAgain(); SHELL.trig=trig; }
function shellEndShow(R){ const rows=shellEndRows(R);
  $('pEndH').textContent='You got out.'; $('pEndK').textContent=`Floor 01 prototype · run ${R.n}`;
  const dl=$('pEndS'); dl.textContent=''; for(const [k,v] of rows){ const a=document.createElement('dt'),b=document.createElement('dd'); a.textContent=k; b.textContent=v; dl.append(a,b); }
  $('pEnd').hidden=false; document.body.classList.add('pend'); if(document.pointerLockElement){ try{ document.exitPointerLock(); }catch(_){} }
  drawEndPanel(rows); SHELL.trig=true; }
function shellAgain(){ if(!SHELL.end) return; restartLevel(); }

/* the VR panel at the end of the run: a case-file card like the rest (90-guide.js), a row per number */
const endTex={c:(()=>{ const c=document.createElement('canvas'); c.width=220; c.height=205; return c; })(),glt:null,f:-1};
const endN=mk(plane(.72,.67),M(endTex,{unlit:true,cut:true,double:true,nofog:true}),world); endN.vis=false;
function drawEndPanel(rows){ const c=endTex.c,g=c.getContext('2d'),W=c.width,Hh=c.height; endTex.rows=rows; g.clearRect(0,0,W,Hh);
  gPaper(g,5,5,W-5,Hh-5,29,{jag:3,blots:12,ring:[.84,.2]});
  gInk(g,'#5d564c',x=>{ x.font=`8px ${GFONT.btn}`; x.fillText('P.S.P.D. - EXP. 0417 - FLOOR 01',12,19); });
  gStamp(g,'YOU GOT OUT.',W/2,48,30,31,{center:true}); gRule(g,18,W-20,53,32,2);
  rows.slice(0,9).forEach(([k,v],i)=>{ const y=72+i*13; gText(g,k,12,y,GDIM); gText(g,String(v),W-12,y,GINK,{right:true}); });
  gText(g,'Pull a trigger to play again',W/2,Hh-11,'#c9a26a',{center:true}); gPS1(c);
  if(endTex.glt){ gl.bindTexture(gl.TEXTURE_2D,endTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,endTex.c); } }
if(document.fonts&&document.fonts.load) document.fonts.load('16px "VT323"').then(()=>{ if(endTex.rows) drawEndPanel(endTex.rows); }).catch(()=>{});

/* ---------- the left wrist: FPS stays as it is; a second line above it only once the run is over, or with ?pdbg=1 ----------
   after the run: time, kills, shots/hits. Debug in play: time, kills, the floor's state (C calm, H hunting + seconds, E on edge), + when hidden */
let wristTex=null,wristN=null;
function wtext(g,s,x,y,col){ for(const ch of s){ if(ch===':'){ g.fillStyle=col; g.fillRect(x+1,y+1,1,1); g.fillRect(x+1,y+3,1,1); } else text(g,ch,x,y,col); x+=4; } }
function drawWrist2(){ if(!wristN){ wristTex=tex(64,7,'#0a0b0d'); wristN=mk(plane(.06,.0066),M(wristTex,{unlit:true}),HANDS.L.armN,ARM_LBL_X,.0122,-.07,0,Math.PI/2,0); }
  const R=SHELL.end?SHELL.end.R:SHELL.run; wristN.vis=XR.on&&!!R; if(!R) return;
  let s=fmtT(R.t)+' K'+R.kills.length;
  if(SHELL.end) s+=' '+R.shots+'/'+R.hits;
  else { const H=typeof HUNT!=='undefined'&&HUNT?HUNT:null,st=H?H.state:'';
    s+=' '+(st==='hunting'?'H'+(SHELL.hunt?Math.round(R.t-SHELL.hunt.t0):''):st==='edge'?'E':st==='calm'?'C':'-')+(PL.hide?'+':''); }
  const g=wristTex.c.getContext('2d'); g.fillStyle='#0a0b0d'; g.fillRect(0,0,64,7); wtext(g,s.slice(0,16),Math.max(0,(64-s.length*4+1)>>1),1,SHELL.end?'#e2a33d':'#c4bfb3');
  if(wristTex.glt){ gl.bindTexture(gl.TEXTURE_2D,wristTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,wristTex.c); } }

/* ---------- the start card: in and out of the prototype, the mic switch ---------- */
function shellGo(on){ let framed=false; try{ framed=window.top!==window; }catch(_){ framed=true; }
  if(framed){ location.hash=on?'proto':''; location.reload(); return; } /* in a frame (the claude.ai preview) a query string doesn't carry; #proto does */
  const q=new URLSearchParams(location.search); for(const k of ['proto','pf','f','pdbg']) q.delete(k); if(on) q.set('proto','1');
  const s=q.toString(); location.href=location.pathname+(s?'?'+s:''); }
for(const [id,on] of [['protoBtn',true],['protoBack',false],['pBack',false]]){ const b=$(id); if(b) b.addEventListener('click',()=>shellGo(on)); }
{ const b=$('pAgain'); if(b) b.addEventListener('click',()=>{ audio(); shellAgain(); if(!isTouch){ try{ const p=cv.requestPointerLock(); if(p&&p.catch) p.catch(()=>{}); }catch(_){} } }); }
addEventListener('keydown',e=>{ if(SHELL.end&&SHELL.end.shown&&e.code==='Enter') shellAgain(); });
/* the mic button turns it on (58-mic.js micStart) and now off again. That listener runs first and does nothing if the mic is already
   on; turning it on is never finished by the time this runs (getUserMedia answers later), so 'on' here means it was on before the tap */
function micStop(){ if(MIC.state!=='on') return; try{ if(MIC.stream) for(const t of MIC.stream.getTracks()) t.stop(); }catch(_){}
  MIC.an=null; MIC.buf=null; MIC.stream=null; MIC.state='off'; MIC.db=-90; MIC.above=0; MIC.talkAbove=0; micBtnLabel(); const b=$('micBtn'); if(b) b.textContent='Mic off'; }
{ const b=$('micBtn'); if(b) b.addEventListener('click',()=>{ if(MIC.state==='on') micStop(); }); }

/* ---------- boot ---------- */
function shellBoot(){ if(!PROTO.on) return;
  if(PROTO.floor&&typeof pfLoad==='function'){ SHELL.where='proto';
    if(FLOOR.mode!=='proto'){ let saw=false; const L=()=>{ saw=true; }; protoOn('load',L); pfLoad(); PROTO_EV.load.splice(PROTO_EV.load.indexOf(L),1); if(!saw) protoEmit('load'); } }
  else { SHELL.where='old'; protoEmit('load'); } /* towerBoot already built floor 01 (66-tower.js) */
  const tag=$('floorTag'); if(tag) tag.textContent='Floor 01 · prototype'; }
