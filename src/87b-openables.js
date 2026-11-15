/* =====================================================================
   OPENABLES (floor 01 prototype): kitchen drawers, cupboard doors, fridge doors. The props build them as live nodes and list them in
   S.opens (87-props.js: kitchen, fridge); pfProp (85-pfloor.js) hands them to openReg, and they live in PF.openables:
     {kind:'drawer'|'cupboard'|'fridge', room (id), at:[x,y,z] (the handle, world), open:0..1, ...}
   VR: grip near a handle and pull. A drawer slides out with the hand along its runners (to ~.36 m, a stop thunk); a door swings round
       its hinge after the hand. Let go and it stays where it is. An open hand (not gripping) shoves an open one shut; flick it and it
       carries on and slams, and a slam is a noise the hunters come to.
   Flat: U on one you're looking at, within reach, opens it or shuts it (pfTools asks openUse; a pickup closer to you wins).
   Contents (openStock): made the first time it opens, lying in the drawer or on the shelf; a drawer's ride with it.
   A fridge pulls itself shut over the last few degrees (the seal), and hums while it's open; its inside is lit (an unlit liner).
   Events: openable(o) the first time each one is opened.
   ===================================================================== */
const OPENP={gripR:.13,slip:.34,useR:1.6,slamV:.8,slamW:2.6,slamR:7,shutR:1.6,sealA:.14,firstD:.1,firstA:.35};
function openW(o,l){ return [o.x+l[0]*o.c+l[2]*o.s,l[1],o.z-l[0]*o.s+l[2]*o.c]; }
function openL(o,p){ const dx=p[0]-o.x,dz=p[2]-o.z; return [dx*o.c-dz*o.s,p[1],dx*o.s+dz*o.c]; }
function openReg(S,x,z,yaw){ if(!S||!S.opens||!PF.openables) return; const c=Math.cos(yaw),s=Math.sin(yaw);
  for(const d of S.opens){ const o=Object.assign({},d,{x,z,c,s,yaw,v:0,w:0,held:null,auto:null,stock:[],made:false,P:[],first:false,open:0,at:null,hum:null});
    const r=pfRoomRaw(...(()=>{ const p=openW(o,o.kind==='drawer'?[o.lx,0,0]:[o.hx,0,o.hz]); return [p[0],p[2]]; })()); o.room=r?r.id:null;
    openPose(o); PF.openables.push(o); } }
/* the handle in prop-local space for the current opening */
function openGripL(o){ if(o.kind==='drawer') return [o.lx+o.grip[0],o.grip[1],o.grip[2]+o.v];
  const th=-o.dir*o.v,c=Math.cos(th),s=Math.sin(th),g=o.grip; return [o.hx+g[0]*c+g[2]*s,g[1],o.hz-g[0]*s+g[2]*c]; }
function openPose(o){ if(o.kind==='drawer') o.n.p[2]=o.v; else o.n.r[1]=-o.dir*o.v; o.open=o.v/o.max; o.at=openW(o,openGripL(o)); }
/* where a hand is, as this door sees it: angle round the hinge (0 shut, + open), distance from it */
function openAng(o,l){ const dx=l[0]-o.hx,dz=l[2]-o.hz; return [Math.atan2(dz,o.dir*dx),Math.hypot(dx,dz)]; }
const openWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));

/* ---------- sounds: wood on runners, a stop, a door shut, a slam, the fridge seal and its hum ---------- */
function openSnd(kind,pos,vol=1){ const ac=GAME.started&&typeof audio==='function'?audio():null; if(!ac||typeof NOISE==='undefined'||!NOISE) return;
  const t=ac.currentTime,out=ac.createGain(),bus=audioBus(ac); out.gain.value=vol; if(pos){ const S=spatial(ac,pos,bus.inp); out.connect(S.input); } else out.connect(bus.inp);
  const nz=(f0,f1,dur,g,q,type,d=0)=>{ const t0=t+d,s=ac.createBufferSource(); s.buffer=NOISE; const fl=ac.createBiquadFilter(); fl.type=type; fl.Q.value=q;
      fl.frequency.setValueAtTime(f0,t0); fl.frequency.exponentialRampToValueAtTime(f1,t0+dur); const gg=ac.createGain(); gg.gain.setValueAtTime(.0001,t0);
      gg.gain.linearRampToValueAtTime(g,t0+Math.min(.01,dur*.2)); gg.gain.exponentialRampToValueAtTime(.001,t0+dur); s.connect(fl); fl.connect(gg); gg.connect(out); s.start(t0,Math.random()*.6); s.stop(t0+dur+.02); },
    tone=(f0,f1,dur,g,d=0,type='sine')=>{ const t0=t+d,o=ac.createOscillator(),gg=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t0); o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
      gg.gain.setValueAtTime(.0001,t0); gg.gain.linearRampToValueAtTime(g,t0+.005); gg.gain.exponentialRampToValueAtTime(.001,t0+dur); o.connect(gg); gg.connect(out); o.start(t0); o.stop(t0+dur+.02); };
  if(kind==='slide'){ nz(900,520,.28,.22,2.2,'bandpass'); for(let i=0;i<4;i++) nz(rnd(1800,2600),900,.03,.18,4,'bandpass',.03+i*rnd(.04,.07)); } /* wood on wood, the cutlery shifting */
  else if(kind==='stop'){ nz(500,200,.09,.6,1,'lowpass'); tone(140,80,.08,.25); nz(3200,2000,.05,.15,3,'bandpass',.01); }
  else if(kind==='creak'){ nz(rnd(500,700),rnd(300,400),.35,.12,12,'bandpass'); }
  else if(kind==='shut'){ nz(420,160,.12,.55,1,'lowpass'); tone(110,70,.1,.3); }
  else if(kind==='slam'){ nz(380,120,.22,1,1,'lowpass'); tone(95,55,.18,.6); nz(2600,1200,.12,.35,2,'bandpass',.01); for(let i=0;i<3;i++) nz(3000,1800,.05,.12,5,'bandpass',.06+i*.05); }
  else if(kind==='seal'){ nz(260,90,.12,.5,1,'lowpass'); tone(70,45,.1,.35); nz(1800,600,.06,.12,2,'bandpass'); }
  else if(kind==='pop'){ nz(700,250,.07,.35,1.5,'bandpass'); tone(160,90,.05,.18); }
  setTimeout(()=>{ try{ out.disconnect(); }catch(_){} },1500); }
function openHum(o,on){ const ac=GAME.started&&typeof audio==='function'?audio():null; if(!ac) return;
  if(on&&!o.hum){ const bus=audioBus(ac),S=spatial(ac,o.at,bus.inp),g=ac.createGain(),a=ac.createOscillator(),b=ac.createOscillator(); g.gain.value=0; g.gain.linearRampToValueAtTime(.05,ac.currentTime+.3);
    a.type='sawtooth'; a.frequency.value=60; b.type='sine'; b.frequency.value=120; const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=260; a.connect(f); b.connect(f); f.connect(g); g.connect(S.input); a.start(); b.start(); o.hum={g,a,b,ac}; }
  else if(!on&&o.hum){ const H=o.hum,t=H.ac.currentTime; H.g.gain.cancelScheduledValues(t); H.g.gain.setValueAtTime(H.g.gain.value,t); H.g.gain.linearRampToValueAtTime(0,t+.15); setTimeout(()=>{ try{ H.a.stop(); H.b.stop(); H.g.disconnect(); }catch(_){} },300); o.hum=null; } }

/* ---------- contents: made on first opening ---------- */
function openStock(room,kind,i,make){ const L=(PF.openables||[]).filter(o=>o.room===room&&o.kind===kind),o=L[i]; if(!o) return false; o.stock.push(make); return true; }
function openMake(o){ if(o.made) return; o.made=true; let k=0;
  for(const make of o.stock){ const it=make(); if(!it) continue; const n=o.stock.length,off=n>1?(k/(n-1)-.5)*.14:0; k++;
    const l=o.kind==='drawer'?[o.tray[0]+off,o.tray[1],o.tray[2]+o.v]:[o.shelf[0]+off,o.shelf[1],o.shelf[2]],p=openW(o,l);
    const P=addPickup(it,propItemM(p[0],p[1],p[2],o.yaw+(o.kind==='drawer'?Math.PI/2:0)+rnd(-.2,.2)),[0,0,0],[0,0,0]); P.rest=true;
    o.P.push({P,lz:l[2]-o.v}); if(PF.items) PF.items.push({key:it.key,P,room:o.room,at:p.slice(),inside:o.kind}); } }
function openRide(o){ if(o.kind!=='drawer') return; for(const r of o.P){ const P=r.P; if(!P.rest||!LOOSE.includes(P)) continue; const l=openL(o,P.node.p); l[2]=r.lz+o.v; const w=openW(o,l); P.node.p[0]=w[0]; P.node.p[2]=w[2]; } }
function openReset(){ for(const o of PF.openables||[]){ for(const r of o.P) if(LOOSE.includes(r.P)) removePickup(r.P); o.P=[]; o.stock=[]; o.made=false; o.first=false; o.v=0; o.w=0; o.auto=null;
    if(o.held){ o.held._op=null; o.held=null; } openHum(o,false); openPose(o); } }

/* ---------- hands (VR) ---------- */
function openLet(h){ const o=h._op; if(o&&o.held===h){ o.held=null; o.w=0; } h._op=null; }
function openHand(h,dt){ const gp=h.src&&h.src.gamepad,pr=!!(gp&&gp.buttons[1]&&gp.buttons[1].pressed),edge=pr&&!h._ogp; h._ogp=pr;
  const busy=!!(h.item||h.grab||h.stuck||h.supportOf||h._sh),wasBusy=h._obusy,p=mulP(h.M,FIST),pp=h._opP||p; h._opP=p.slice(); h._obusy=busy;
  if(h._op){ const o=h._op; if(!pr||busy||o.held!==h){ openLet(h); return; }
    if(Math.hypot(...v3.sub(p,o.at))>OPENP.slip){ openLet(h); return; } /* pulled the hand away (or walked off): it slips out */
    const l=openL(o,p),was=o.v; let v;
    if(o.kind==='drawer') v=clamp(l[2]+o.gOff,0,o.max); else v=clamp(o.v+openWrap(openAng(o,l)[0]+o.gOff-o.v),0,o.max);
    o.v=v; o.w=0; if(v!==was){ openPose(o); openRide(o); } const sp=Math.abs(v-was)/Math.max(dt,1e-3);
    if(v>=o.max-1e-4&&was<o.max-.01&&sp>(o.kind==='drawer'?.4:1.5)) openSnd('stop',o.at,.8);
    if(o.kind!=='drawer'&&Math.abs(v-was)>.004&&Math.random()<dt*2) openSnd('creak',o.at,.5);
    if(o.kind==='drawer'&&Math.abs(v-was)>.003&&GAME.t-(o.sT||0)>.35){ o.sT=GAME.t; openSnd('slide',o.at,.5); }
    return; }
  if(edge&&!busy&&!wasBusy){ /* the press that dropped a gun doesn't grab a handle */ let best=null,bd=OPENP.gripR;
    for(const o of PF.openables){ if(o.held) continue; const d=Math.hypot(...v3.sub(p,o.at)); if(d<bd){ bd=d; best=o; } }
    if(best){ const o=best,l=openL(o,p); o.held=h; h._op=o; o.auto=null; o.w=0; o.gOff=o.kind==='drawer'?o.v-l[2]:openWrap(o.v-openAng(o,l)[0]);
      if(XR.on) buzz(h.hand,.25,25); if(o.seal&&o.v<.05) openSnd('pop',o.at,.7); return; } }
  if(pr) return; /* gripping nothing: no shove */
  /* an open hand shoving one shut: it has to come at the front (the face, from outside) and move into it */
  for(const o of PF.openables){ if(o.held||o.v<.004) continue; if(Math.abs(p[0]-o.x)>1.6||Math.abs(p[2]-o.z)>1.6) continue;
    const l=openL(o,p),lp=openL(o,pp); if(l[1]<o.y0-.03||l[1]>o.y1+.03) continue;
    if(o.kind==='drawer'){ const front=o.fz+.012+o.v; if(Math.abs(l[0]-o.lx)>o.w/2+.03||lp[2]<front-.01||l[2]>=front) continue;
      const nv=clamp(l[2]-o.fz-.012,0,o.v); if(nv<o.v){ o.w=Math.min(o.w,(l[2]-lp[2])/Math.max(dt,1e-3)); o.v=nv; o.auto=null; } }
    else { const [a,r]=openAng(o,l),[ap]=openAng(o,lp); if(r<.05||r>o.len+.04) continue;
      if(!(ap>=o.v-.01&&a<o.v&&a>o.v-.4)) continue; const na=Math.max(0,a-.015); if(na<o.v){ o.w=Math.min(o.w,clamp(openWrap(a-ap)/Math.max(dt,1e-3),-12,0)); o.v=na; o.auto=null; } } } }

/* ---------- every frame ---------- */
function openStep(o,dt){ const was=o.vSeen??o.v;
  if(o.auto!=null&&!o.held){ const sp=o.kind==='drawer'?.9:3,d=o.auto-o.v; o.v+=clamp(d,-sp*dt,sp*dt); if(Math.abs(o.auto-o.v)<1e-3){ o.v=o.auto; o.auto=null;
      if(o.v===0) openSnd(o.seal?'seal':'shut',o.at,.6); } o.w=0; }
  else if(!o.held){
    if(o.seal&&o.v>0&&o.v<OPENP.sealA&&o.w>=-.5) o.w=-1.4; /* the seal pulls it the last bit */
    if(Math.abs(o.w)>.005){ o.v+=o.w*dt; o.w*=Math.exp(-(o.kind==='drawer'?5:3.2)*dt);
      if(o.v<=0){ const hard=-o.w>(o.kind==='drawer'?OPENP.slamV:OPENP.slamW); o.v=0;
        openSnd(hard?'slam':o.seal?'seal':'shut',o.at,hard?1:.7); if(typeof noise==='function') noise([o.at[0],0,o.at[2]],hard?OPENP.slamR:OPENP.shutR); if(XR.on&&hard) for(const h of [HANDS.L,HANDS.R]) if(h.src&&Math.hypot(...v3.sub(mulP(h.M,FIST),o.at))<.6) buzz(h.hand,.5,40); o.w=0; }
      else if(o.v>=o.max){ o.v=o.max; if(o.w>.5) openSnd('stop',o.at,.7); o.w=0; } } else o.w=0; }
  if(o.v!==was||!o.at) openPose(o);
  if(o.v!==was) openRide(o);
  if(!o.made&&o.v>(o.kind==='drawer'?OPENP.firstD:OPENP.firstA)) openMake(o);
  if(!o.first&&o.v>(o.kind==='drawer'?OPENP.firstD:OPENP.firstA)){ o.first=true; protoEmit('openable',o); protoEmit('stat','pf.opened',1); }
  o.vSeen=o.v; if(o.kind==='fridge'&&!o.dead) openHum(o,o.v>.05); }
function openTick(dt){ const L=PF.openables; if(!L||!L.length) return;
  if(XR.on) for(const h of [HANDS.L,HANDS.R]) openHand(h,dt); for(const o of L) openStep(o,dt); }

/* ---------- flat: U ---------- */
function openUse(eye,f){ let best=null,bd=OPENP.useR; for(const o of PF.openables||[]){ const v=v3.sub(o.at,eye),d=Math.hypot(...v); if(d<bd&&v3.dot(v,f)/d>.78){ bd=d; best=o; } } return best?{o:best,d:bd}:null; }
function openToggle(o){ if(o.held) return; const shut=o.v>o.max*.15; o.auto=shut?0:(o.kind==='drawer'?o.max*.85:o.max*.8); o.w=0;
  if(!shut){ if(o.seal) openSnd('pop',o.at,.7); else if(o.kind==='drawer') openSnd('slide',o.at,.6); else openSnd('creak',o.at,.5); } }
