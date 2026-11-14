// Shared pieces for the floor 01 prototype bots (tools/proto/). One headless Chrome, one page at a time.
// The in-page core follows tools/harness/bot.js and deep.js: requestAnimationFrame off, the bot steps update() itself, updateWorld()
// after every step (or head hits pass through), and setTimeout replaced by a queue run on game time.
// It works on whatever floor ?proto=1 loads: agent F's floor (PF, guarded) or the old floor 01 (TL, the east landing).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'];
const launch = () => chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ARGS });
const fileUrl = f => 'file://' + path.resolve(f);

// open a page on ?q, collect its errors, wait for the game, press Start. Generous timeouts and one retry: ten agents share two CPUs,
// and a page that doesn't load in time says nothing about the game. A timeout that survives the retry is thrown as 'TIMEOUT ...'.
// The game script is inline, so DOMContentLoaded means it ran; waiting for 'load' would also wait on the web fonts.
async function open(browser, file, q, opts = {}) {
  for (let attempt = 1; ; attempt++) {
    const page = await browser.newPage({ viewport: { width: 480, height: 270 } }); const errs = [];
    page.on('pageerror', e => errs.push(String(e).slice(0, 240)));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test((m.location() || {}).url || '')) errs.push(m.text().slice(0, 240)); }); /* the web fonts are online-only */
    try {
      await page.goto(fileUrl(file) + (q ? '?' + q : ''), { waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.waitForFunction(() => window.__eval && window.__game, null, { timeout: 180000, polling: 250 });
      if (opts.click) await page.click(opts.click, { timeout: 120000 });
      if (opts.start !== false) await page.click('#start', { timeout: 120000 });
      await page.waitForTimeout(opts.wait ?? 200);
      return { page, errs };
    } catch (e) { await page.close().catch(() => {});
      if (attempt >= 2 || !/Timeout/i.test(String(e))) throw new Error((/Timeout/i.test(String(e)) ? 'TIMEOUT (machine busy?) ' : '') + String(e).split('\n')[0].slice(0, 200)); }
  }
}

const CORE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__PB=(function(){
  const dt=1/30,L={err:null,steps:0};
  function runQ(){ if(!window.__Q.length) return; const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){ L.err=String(e).slice(0,160); } } }
  function step(){ update(dt,performance.now()); updateWorld(world,null); runQ(); L.steps++; }
  const eye=()=>[PL.x,1.62,PL.z],gauss=()=>{ let s=0; for(let i=0;i<6;i++) s+=Math.random(); return (s-3)/.707; };
  const hostile=E=>!E.civ&&!E.ally,out=E=>E.dead||E.st==='down'||E.surr||E.st==='kneel',obvious=E=>hostile(E)&&(E.wpnHeld||E.aware||!E.concealed);
  const hunting=()=>typeof HUNT!=='undefined'&&HUNT&&HUNT.state==='hunting';
  const dist=(E,x,z)=>Math.hypot(E.pos[0]-x,E.pos[1]-z);
  /* lit, as tools/harness/deep.js measures it: a light that reaches the spot with nothing in the way */
  const lit=(x,z)=>{ for(const l of FLOOR.lights||[]){ const c=l[1]; if(c[0]+c[1]+c[2]<.4) continue; const p=l[0]; if(Math.hypot(p[0]-x,p[2]-z)<l[2]*.45&&sightClear([p[0],Math.max(p[1],1.2),p[2]],[x,1.3,z])) return true; } return false; };
  const S={stuckT:0,lastP:[0,0],jit:0};
  function halt(){ KEYS.KeyW=false; stick.dy=0; }
  function face(x,z){ PL.yaw=Math.atan2(-(x-PL.x),-(z-PL.z)); PL.pitch=0; }
  function walk(tx,tz,slow){ const d=navTo(PL.x,PL.z,tx,tz); let yaw=Math.atan2(-d[0],-d[2]); if(S.jit>0) yaw+=1.3; PL.yaw=yaw; PL.pitch=0; if(slow){ KEYS.KeyW=false; stick.dy=-slow; } else { stick.dy=0; KEYS.KeyW=true; } }
  function unstick(){ S.stuckT+=dt; if(S.stuckT>2.5){ const m=Math.hypot(PL.x-S.lastP[0],PL.z-S.lastP[1]); S.jit=m<.3&&(KEYS.KeyW||stick.dy)?.6:0; S.lastP=[PL.x,PL.z]; S.stuckT=0; } S.jit-=dt; }
  /* the way out: F's exit if the floor says where it is, else the NE vestibule room, else the old floor's east landing */
  function exitInfo(){ if(typeof PF!=='undefined'&&PF&&FLOOR.mode==='proto'){ const e=PF.exit||PF.exitPos;
      if(e){ const x=Array.isArray(e)?e[0]:e.x,z=Array.isArray(e)?e[1]:e.z; if(isFinite(x)&&isFinite(z)) return {x,z,kind:'pf'}; }
      const rs=PF.rooms||[],r=rs.find(r=>r.id==='NE')||rs.find(r=>r.id!=='S0'&&/vestib|exit/i.test((r.name||'')+' '+(r.id||'')));
      if(r) return {x:(r.x0+r.x1)/2,z:(r.z0+r.z1)/2,kind:'pf-room:'+r.id}; return null; }
    return {x:TL+.1,z:0,kind:'old'}; }
  const left=()=>!!(SHELL.end||(SHELL.run&&SHELL.run.exit)||(!PROTO.on&&GAME.climbing));
  function goExit(X){ if(X.kind==='old'){ if(PL.x>TL-.2&&Math.abs(PL.z)<1.2){ PL.yaw=-Math.PI/2; PL.pitch=0; stick.dy=0; KEYS.KeyW=true; } else walk(TL+.1,0); return; }
    if(X.kind==='pf'&&typeof PF_EXIT!=='undefined'&&PF.exit&&PF.exit.open&&Math.hypot(X.x-PL.x,X.z-PL.z)<1.2){ face(PF_EXIT.x+1.2,PF_EXIT.z); stick.dy=0; KEYS.KeyW=true; return; } /* F's door is open: walk on through it, east into the stairwell */
    if(Math.hypot(X.x-PL.x,X.z-PL.z)<.9){ face(X.x,X.z); stick.dy=0; KEYS.KeyW=true; } else walk(X.x,X.z); }
  /* the thing that opens the chain, if it's lying on the floor (F/H: key 'cutter' or 'keys') */
  const tool=()=>LOOSE.find(P=>P.item&&/^(cutter|keys)$/.test(P.item.key));
  const holding=()=>[HANDS.R,HANDS.L].some(h=>h.item&&/^(cutter|keys)$/.test(h.item.key));
  function takeTool(P){ removePickup(P); equip(HANDS.R,P.item); }
  /* at the chain with the tool: F's bot hook if it has one, else use it like a player on the flat screen would */
  let useT=0; function tryOpen(X){ face(X.x,X.z); if(typeof pfBotOpen==='function'){ pfBotOpen(); return; } useT-=dt; if(useT<=0){ useT=.6; useRight(); } }
  /* crouch through agent G's switch if it has one, else the flag G's code reads */
  function crouch(on){ if(typeof setCrouch==='function') setCrouch(on); else if('crouch' in PL) PL.crouch=on; }
  function finish(o){ halt(); crouch(false); const R=SHELL.run; if(R&&!R.ended) shellEndRun('bot');
    const rec=R?JSON.parse(JSON.stringify(R)):null;
    return Object.assign({where:SHELL.where,mode:FLOOR.mode,proto:PROTO.on,hunt:typeof HUNT!=='undefined',hides:typeof HIDES!=='undefined'?HIDES.length:null,pf:typeof PF!=='undefined',steps:L.steps,qErr:L.err},o,{stats:rec}); }
  function settle(){ for(let k=0;k<30;k++) step(); }

  /* ---- walk-through: straight for the exit, touching nobody. Pass: it can't leave in under 90 s ---- */
  function walk_(o){ settle(); const maxT=o.maxT||120,X=exitInfo(),t0=GAME.t; let minHp=100,atExit=null;
    if(!X) return finish({bot:'walk',err:'no exit found'});
    while(GAME.t-t0<maxT){ if(PL.dead||left()) break; minHp=Math.min(minHp,PL.hp); halt(); goExit(X); unstick(); step();
      if(atExit==null&&Math.hypot(X.x-PL.x,X.z-PL.z)<1.2) atExit=+(GAME.t-t0).toFixed(1); }
    return finish({bot:'walk',exitKind:X.kind,t:+(GAME.t-t0).toFixed(1),left:left(),died:PL.dead,minHp:Math.round(minHp),atExit,pos:[+PL.x.toFixed(1),+PL.z.toFixed(1)]}); }

  /* ---- fetch: straight to the cutter (or keys), then straight to the exit. Info: how long the shortest honest run takes ---- */
  function fetch_(o){ settle(); const maxT=o.maxT||240,X=exitInfo(),t0=GAME.t; let toolT=null,atExit=null;
    if(!X) return finish({bot:'fetch',err:'no exit found'});
    while(GAME.t-t0<maxT){ if(PL.dead||left()) break; halt(); const P=holding()?null:tool();
      if(P){ const p=P.node.p; if(Math.hypot(p[0]-PL.x,p[2]-PL.z)<.8){ takeTool(P); toolT=+(GAME.t-t0).toFixed(1); } else walk(p[0],p[2]); }
      else if(Math.hypot(X.x-PL.x,X.z-PL.z)<1.2&&X.kind!=='old'){ if(atExit==null) atExit=+(GAME.t-t0).toFixed(1); if(holding()) tryOpen(X); goExit(X); }
      else goExit(X);
      unstick(); step(); }
    return finish({bot:'fetch',exitKind:X.kind,t:+(GAME.t-t0).toFixed(1),left:left(),died:PL.dead,toolFound:toolT!=null||holding(),toolT,atExit,toolToExit:toolT!=null&&left()?+((GAME.t-t0)-toolT).toFixed(1):null}); }

  /* ---- pistol fight: 0.6 s to react, 3 degrees of error, a shot every 0.3 s at most. Goes at the nearest man it knows is one of
     them; with nobody left in view it heads for the exit. One death ends the run. Pass (20 runs): dies in 25 to 50% ---- */
  function pistol_(o){ settle(); const react=o.react??.6,sigma=o.sigma??3,gap=o.gap??.3,maxT=o.maxT||300,X=exitInfo(),t0=GAME.t;
    let gave=false; if(!HANDS.R.item||!WPN[HANDS.R.item.key].gun){ equip(HANDS.R,newItem('pistol')); gave=true; }
    const seen=new Map(); let next=0,minHp=100,shots=0,idle=0,dryT=0;
    while(GAME.t-t0<maxT){ if(PL.dead||left()) break; minHp=Math.min(minHp,PL.hp); halt();
      const ey=eye(),T=enemies.filter(E=>obvious(E)&&!out(E)).map(E=>({E,d:dist(E,PL.x,PL.z)})).sort((a,b)=>a.d-b.d);
      const vis=T.find(q=>q.d<16&&sightClear(ey,X_(q.E.B,PI_.head)));
      if(vis){ idle=0; const E=vis.E; if(!seen.has(E)) seen.set(E,GAME.t); const ch=X_(E.B,PI_.chest),nk=X_(E.B,PI_.neck),p=[ch[0]+(nk[0]-ch[0])*.6,ch[1]+(nk[1]-ch[1])*.6,ch[2]+(nk[2]-ch[2])*.6];
        window.__game.aimAt(p); const it=HANDS.R.item;
        if(GAME.t-seen.get(E)>react&&GAME.t>=next&&it){ const d=norm3(v3.sub(p,ey)),e=sigma*Math.PI/180; if(fireHand(HANDS.R,{o:ey,d:norm3([d[0]+gauss()*e,d[1]+gauss()*e,d[2]+gauss()*e])})){ shots++; next=GAME.t+gap; } }
        if(it&&WPN[it.key].gun&&it.ammo<=0&&!(it.reload>0)){ dryT+=dt; if(dryT>1) reloadHand(HANDS.R); } else dryT=0; }
      else if(T.length){ idle=0; walk(T[0].E.pos[0],T[0].E.pos[1]); }
      else { idle+=dt; if(X) goExit(X); if(idle>30) break; } /* nobody left in view and nothing happening: done */
      unstick(); step(); }
    const bad=enemies.filter(hostile);
    return finish({bot:'pistol',gave,t:+(GAME.t-t0).toFixed(1),left:left(),died:PL.dead,minHp:Math.round(minHp),shots,men:bad.length,menDead:bad.filter(E=>E.dead).length,menUp:bad.filter(E=>!out(E)).length,
      ammo:HANDS.R.item&&HANDS.R.item.ammo,carried:PL.ammo}); }

  /* ---- stand still: fire into the floor where you start, walk to the nearest dark spot and stand there. Info: found within 20 s ---- */
  function darkSpot(minD,maxD,awayFrom){ const F=fieldTo(PL.x,PL.z); let best=null,bs=1e18;
    for(let c=0;c<FLOOR.nav.length;c++){ if(FLOOR.nav[c]) continue; const ci=c%NX,x=cellX(ci),z=cellZ((c-ci)/NX),d=Math.hypot(x-PL.x,z-PL.z); if(d<minD||d>maxD||(F&&F[c]>=1e9)) continue;
      if(lit(x,z)) continue; let s=F?F[c]:d; if(awayFrom) s-=Math.hypot(x-awayFrom[0],z-awayFrom[1])*25; if(s<bs){ bs=s; best=[x,z]; } }
    return best; }
  function stand_(o){ settle(); const maxT=o.maxT||180,t0=GAME.t; if(!HANDS.R.item||!WPN[HANDS.R.item.key].gun) equip(HANDS.R,newItem('pistol'));
    let fired=0,nextF=0,spot=null,arr=null,seenT=null,hitT=null,firstAware=null,dmg0=null;
    while(GAME.t-t0<maxT){ if(PL.dead) break; halt(); const t=GAME.t-t0;
      if(fired<3){ PL.pitch=-1.2; if(GAME.t>=nextF){ const b=camBasis(); if(fireHand(HANDS.R,{o:b.eye,d:b.f})) fired++; nextF=GAME.t+.6; } }
      else if(!spot){ spot=darkSpot(2.5,10)||[PL.x,PL.z]; }
      else if(arr==null){ if(Math.hypot(spot[0]-PL.x,spot[1]-PL.z)<.45) arr=+t.toFixed(1); else walk(spot[0],spot[1]); }
      step(); const R=SHELL.run;
      if(firstAware==null&&enemies.some(E=>hostile(E)&&E.aware)) firstAware=+t.toFixed(1);
      if(arr!=null&&seenT==null&&enemies.some(E=>hostile(E)&&!out(E)&&E.aware&&E.canSee)) seenT=+(t-arr).toFixed(1);
      if(R&&R.dmg>0&&hitT==null) hitT=+t.toFixed(1); }
    return finish({bot:'stand',t:+(GAME.t-t0).toFixed(1),fired,spot:spot&&[+spot[0].toFixed(1),+spot[1].toFixed(1)],spotLit:spot?lit(spot[0],spot[1]):null,arrived:arr,firstAware,foundAfter:seenT,firstHit:hitT,died:PL.dead}); }

  /* ---- hide and sneak: walks (slowly) only when no man within 8 m can see where it's about to step; when a hunter comes its way it
     goes to the nearest hiding spot (HIDES, agent G) or the darkest corner away from him, and waits until he's gone. Goes for the
     cutter if it's lying on the floor, then the exit. Never fights ---- */
  function sees(E,x,z){ if(!hostile(E)||out(E)||E.dead) return false; const h=X_(E.B,PI_.head),dx=x-h[0],dz=z-h[2],l=Math.hypot(dx,dz)||1;
    if(l>8) return false; if(l>1.2&&(Math.sin(E.hd)*dx+Math.cos(E.hd)*dz)/l<.35) return false; return sightClear(h,[x,1.2,z]); }
  const isHunter=E=>hostile(E)&&!out(E)&&!E.dead&&(E.hunter||E.torchOn||E.torch||(hunting()&&(E.aware||E.mind==='search'||E.mind==='investigate')));
  function hideSpot(from){ if(typeof HIDES!=='undefined'&&HIDES&&HIDES.length){ let best=null,bd=1e9;
      for(const s of HIDES){ const d=Math.hypot(s.x-PL.x,s.z-PL.z); if(d>12) continue; const away=from?Math.hypot(s.x-from[0],s.z-from[1]):9; if(away<2.5) continue; if(d<bd){ bd=d; best=s; } }
      if(best) return {x:best.x,z:best.z,kind:best.kind||'spot',hide:true}; }
    const d=darkSpot(1.5,7,from); return d?{x:d[0],z:d[1],kind:'dark',hide:false}:null; }
  function sneak_(o){ settle(); const maxT=o.maxT||600,X=exitInfo(),t0=GAME.t; if(!X) return finish({bot:'sneak',err:'no exit found'});
    let st='go',spot=null,calmT=0,waitT=0,moveT=0,hideN=0,hiddenBotT=0,seenN=0,wasSeen=false,toolT=null,atExit=null,grabbed=0,wasGrab=false; const prevD=new Map();
    while(GAME.t-t0<maxT){ if(PL.dead||left()) break; halt(); const t=GAME.t-t0;
      const near=enemies.filter(E=>isHunter(E)).map(E=>{ const d=dist(E,PL.x,PL.z),p=prevD.get(E); return {E,d,closing:p!=null&&p.d-d>.25&&t-p.t<1.5}; });
      if(Math.floor(t*2)!==Math.floor((t-dt)*2)) for(const q of near) prevD.set(q.E,{d:q.d,t});
      const seenNow=enemies.some(E=>hostile(E)&&!out(E)&&E.aware&&E.canSee); if(seenNow&&!wasSeen) seenN++; wasSeen=seenNow;
      if(PL.grab&&!wasGrab) grabbed++; wasGrab=!!PL.grab;
      const spotter=seenNow?enemies.find(E=>hostile(E)&&!out(E)&&E.aware&&E.canSee):null,threat=near.find(q=>q.d<5||(q.d<9&&q.closing))||(spotter?{E:spotter,d:dist(spotter,PL.x,PL.z)}:null);
      if(st==='hidden'){ hiddenBotT+=dt; if(spot&&spot.hide) crouch(true); calmT=near.some(q=>q.d<9)||seenNow?0:calmT+dt; if(calmT>4){ st='go'; crouch(false); } }
      else if(threat&&st!=='hide'){ spot=hideSpot([threat.E.pos[0],threat.E.pos[1]]); if(spot){ st='hide'; hideN++; } }
      if(st==='hide'){ if(Math.hypot(spot.x-PL.x,spot.z-PL.z)<.35){ st='hidden'; calmT=0; } else walk(spot.x,spot.z); } /* no time to be careful */
      else if(st==='go'){ const P=holding()?null:tool(),tg=P?[P.node.p[0],P.node.p[2]]:[X.x,X.z];
        if(P&&Math.hypot(tg[0]-PL.x,tg[1]-PL.z)<.8){ takeTool(P); toolT=+t.toFixed(1); }
        else if(!P&&X.kind!=='old'&&Math.hypot(X.x-PL.x,X.z-PL.z)<1.2){ if(atExit==null) atExit=+t.toFixed(1); if(holding()) tryOpen(X); goExit(X); }
        else { const landing=!P&&X.kind==='old'&&PL.x>TL-.2&&Math.abs(PL.z)<1.2,d=landing?[1,0,0]:navTo(PL.x,PL.z,tg[0],tg[1]),nx=PL.x+d[0],nz=PL.z+d[2];
          if(enemies.some(E=>sees(E,nx,nz))){ waitT+=dt; face(nx,nz); } /* someone would see the next step: wait */
          else { moveT+=dt; if(landing) goExit(X); else walk(tg[0],tg[1],.55); } } }
      unstick(); step(); }
    return finish({bot:'sneak',exitKind:X.kind,t:+(GAME.t-t0).toFixed(1),left:left(),died:PL.dead,hideN,hiddenBotT:+hiddenBotT.toFixed(1),waitT:+waitT.toFixed(1),moveT:+moveT.toFixed(1),seenN,grabbed,toolT,atExit}); }

  const BOTS={walk:walk_,fetch:fetch_,pistol:pistol_,stand:stand_,sneak:sneak_};
  return {run:(name,o)=>BOTS[name](o||{}),step,lit,exitInfo,L};
})();`;

module.exports = { launch, open, CORE, fileUrl };
