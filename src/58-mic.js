/* ---------- your voice: the headset mic ----------
   Phase 1 is loudness only (no words yet: the Quest browser has no speech recognition). The mic sits a few cm from your mouth.
   - quiet / whispering: nothing. Stealth stays stealth.
   - talking: a small sound. Anyone close and calm comes to look; tenants hear a voice.
   - shouting: a command and an alarm. Everyone in earshot knows where you are. Whoever can see you and is close:
       men under your gun (or right in front of you) who were going to give up do it now; the ones who never quit flinch and their
       shot comes late; a disguised man who's the fighting kind takes it as the moment to draw;
       a man with his hands up goes straight to his knees; frozen tenants get their hands up, a running one stops, the hiding ones
       put their hands up where they are; a man on the floor cowers and goes quiet.
   The game's own sound comes out of the same speakers the mic hears, so: echo cancellation on, the mic band-passed to the voice,
   a shout has to last (a gunshot is a spike), and while the game is loud the bar for a shout goes up.
   Tuning: ?shout=-22&talk=-40 (dBFS) in the URL. The bar under the FPS on your left wrist shows your level and the two marks. */
const MIC_Q=new URLSearchParams(location.search);
const MIC_CFG={shout:+(MIC_Q.get('shout')||-24),talk:+(MIC_Q.get('talk')||-42),shoutHold:.16,talkHold:.3,range:10};
const MIC={state:'off',an:null,buf:null,db:-90,floor:-62,gameDb:-90,gAn:null,gBuf:null,above:0,talkAbove:0,quietT:1,latched:false,
  talkCd:0,flash:0,flashC:'',drawT:0,lastShout:-90};

function micStart(){ if(MIC.state!=='off'||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return; MIC.state='asking'; micBtnLabel();
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}}).then(stream=>{
    const ac=audio(); if(!ac){ MIC.state='denied'; micBtnLabel(); return; }
    const src=ac.createMediaStreamSource(stream),hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),an=ac.createAnalyser();
    hp.type='highpass'; hp.frequency.value=160; lp.type='lowpass'; lp.frequency.value=2800; /* the voice band: no handling thumps, no hiss */
    an.fftSize=1024; src.connect(hp); hp.connect(lp); lp.connect(an); /* never to the speakers */
    MIC.an=an; MIC.buf=new Float32Array(an.fftSize); MIC.stream=stream; MIC.state='on'; micBtnLabel();
  }).catch(()=>{ MIC.state='denied'; micBtnLabel(); if(XR.on) vrToast('Mic blocked: shouting is off',3); }); }
function micBtnLabel(){ const b=document.getElementById('micBtn'); if(!b) return;
  b.textContent=MIC.state==='on'?'Mic on':MIC.state==='denied'?'Mic blocked':MIC.state==='asking'?'Mic…':'Allow mic'; b.setAttribute('aria-pressed',MIC.state==='on'?'true':'false'); }
/* already allowed on an earlier visit: no prompt needed, start on the first tap (the audio context needs one anyway) */
addEventListener('pointerdown',()=>{ if(MIC.state==='off'&&navigator.permissions) navigator.permissions.query({name:'microphone'}).then(p=>{ if(p.state==='granted') micStart(); }).catch(()=>{}); },{capture:true,once:true});
{ const b=document.getElementById('micBtn'); if(b) b.addEventListener('click',micStart); }

const rmsDb=(an,buf)=>{ an.getFloatTimeDomainData(buf); let s=0; for(let i=0;i<buf.length;i++) s+=buf[i]*buf[i]; return 10*Math.log10(s/buf.length+1e-12); };
/* how loud the game itself is right now (the limiter's input), so its own gunshots and screams in the speakers don't count as you */
function gameLevel(){ const ac=AC; if(!ac||!ac.__bus) return -90;
  if(!MIC.gAn){ MIC.gAn=ac.createAnalyser(); MIC.gAn.fftSize=512; MIC.gBuf=new Float32Array(512); ac.__bus.lim.connect(MIC.gAn); }
  return rmsDb(MIC.gAn,MIC.gBuf); }

function micTick(dt){ MIC.flash=Math.max(0,MIC.flash-dt); MIC.talkCd-=dt;
  if(MIC.state==='on'&&MIC.an){
    const db=rmsDb(MIC.an,MIC.buf); MIC.db=db>MIC.db?db:lerp(MIC.db,db,Math.min(1,dt*12)); /* fast up, a little slower down */
    const g=gameLevel(); MIC.gameDb=g>MIC.gameDb?g:Math.max(g,MIC.gameDb-dt*40); /* hold the game's level for a moment: the speaker-to-mic echo trails it */
    /* the room's floor: drops quickly, creeps up slowly, never treated as louder than a quiet voice */
    MIC.floor=db<MIC.floor?lerp(MIC.floor,db,Math.min(1,dt*3)):Math.min(-38,MIC.floor+dt*.6);
    const bleed=Math.max(0,MIC.gameDb+26)*.6; /* the game is loud: ask more of you */
    const shoutAt=Math.max(MIC_CFG.shout,MIC.floor+24)+bleed,talkAt=Math.max(MIC_CFG.talk,MIC.floor+12)+bleed;
    MIC.shoutAt=shoutAt; MIC.talkAt=talkAt;
    if(MIC.db>shoutAt) MIC.above+=dt; else MIC.above=Math.max(0,MIC.above-dt*2);
    if(MIC.db>talkAt) { MIC.talkAbove+=dt; MIC.quietT=0; } else { MIC.talkAbove=Math.max(0,MIC.talkAbove-dt*2); MIC.quietT+=dt; }
    if(MIC.quietT>.25) MIC.latched=false; /* one shout is one command: take a breath and shout again for another */
    if(!PL.dead&&GAME.started){
      if(!MIC.latched&&MIC.above>=MIC_CFG.shoutHold){ MIC.latched=true; MIC.lastShout=MIC.db; playerShout(); }
      else if(!MIC.latched&&MIC.talkAbove>=MIC_CFG.talkHold&&MIC.talkCd<=0){ MIC.talkCd=1.5; playerTalk(); } }
  }
  if(XR.on){ MIC.drawT-=dt; if(MIC.drawT<=0){ MIC.drawT=.1; drawMicBar(); } } }

/* talking: a voice in the next room */
function playerTalk(){ MIC.flash=.25; MIC.flashC='#e2a33d'; noise([PL.x,0,PL.z],4); }

/* shouting: the command */
function playerShout(){ MIC.flash=.6; MIC.flashC='#ff3b30'; GAME.shoutT=0;
  if(XR.on){ buzz('left',.25,40); buzz('right',.25,40); }
  noise([PL.x,0,PL.z],15,{alarm:true}); /* everyone in earshot knows where you are now */
  const eye=[PL.x,1.55,PL.z];
  for(const E of enemies){ if(E.dead||E.ally) continue;
    const pel=X_(E.B,PI_.pelvis),dist=Math.hypot(pel[0]-PL.x,pel[2]-PL.z); if(dist>MIC_CFG.range) continue;
    if(!sightClear(X_(E.B,PI_.head),eye)) continue; /* he has to see who's shouting at him */
    E.shoutT=0; E.obey=null;
    if(E.st==='down'){ if(typeof downCanReact==='function'&&downCanReact(E)&&!E.fakeDead&&!E.gShoot){ E.dShot=Math.max(E.dShot||0,1.4); vox(E,'whimper',1); E.barkCd=Math.max(E.barkCd,2.2); } continue; }
    if(E.civ){ if(!E.panic&&typeof twCivPanic==='function') twCivPanic(E,'shout');
      if(E.surr||E.shielder) continue; /* shielding someone: they stay over them */
      if(E.civMode==='flee'&&E.role==='civflee'&&dist<8){ E.role=null; E.flee=null; E.st='alert'; E.civFreeze=true; E.civMode='freeze'; } /* "stop!": they stop */
      if(E.civFreeze) E.obey={t:rnd(.25,.7),why:'civ'};
      else if(E.st==='kneel') E.obey={t:rnd(.3,.8),why:'kneelciv'}; /* hiding: hands up where they are */
      continue; }
    if(E.surr){ if(E.surr.ph==='hands') E.surr.hold=Math.min(E.surr.hold,E.surr.t+rnd(.15,.4)); continue; } /* "get down!" */
    if(E.st==='idle') setAware(E,'shout'); /* he hadn't seen you until you yelled at him */
    if(E.st!=='alert') continue;
    const P=typeof psychOf==='function'?psychOf(E):'fight',close=E.covered||dist<5;
    if(E.concealed&&!E.wpnHeld){ /* plain clothes: a quitter does what a tenant would; the fighting kind has heard enough */
      if(P==='fight'&&E.aware){ E.atkCd=Math.min(E.atkCd,rnd(.2,.5)); } else if(close) E.obey={t:rnd(.3,.8),why:'shout'}; continue; }
    if(close&&(P==='quit'||P==='fake')&&Math.random()<.85){ E.obey={t:rnd(.15,.5),why:'shout'}; continue; } /* he was looking for a reason */
    if(close&&P==='fight'&&(E.wounds.length||E.blood<85)&&Math.random()<.4){ E.obey={t:rnd(.3,.7),why:'shout'}; continue; }
    /* the rest flinch: a beat lost before the shot */
    if(E.aware&&E.flinchT<-.2){ E.flinchT=FL_T; E.atkCd=Math.max(E.atkCd,rnd(.3,.55)); } } }

/* the beat between hearing it and doing it */
function obeyTick(E,dt){ if(!E.obey) return; if(E.dead||E.st==='down'){ E.obey=null; return; } E.obey.t-=dt; if(E.obey.t>0) return; const why=E.obey.why; E.obey=null;
  if(why==='kneelciv'){ if(!E.surr) E.surr={ph:'kneel',t:0,why:'civ',hold:0}; return; }
  if(why==='civ'){ if(E.civFreeze){ E.civFreeze=false; surrender(E,'civ'); } return; }
  if(E.st==='alert'&&!E.surr) surrender(E,'shout'); }

/* the bar on your left wrist, under the FPS: your level, the talk and shout marks; it flashes when a talk or a shout counts */
let micTex=null,micN=null; /* built on first use: the hands (60-weapons.js) come after this file */
function drawMicBar(){ if(!micN){ micTex=tex(32,4,'#0a0b0d'); micN=mk(plane(.045,.0056),M(micTex,{unlit:true}),HANDS.L.armN,.046,-.0118,-.05,0,Math.PI/2,0); }
  micN.vis=XR.on; const g=micTex.c.getContext('2d'); g.fillStyle='#0a0b0d'; g.fillRect(0,0,32,4);
  if(MIC.state!=='on'){ g.fillStyle=MIC.state==='denied'?'#5a1f1c':'#2d2b27'; g.fillRect(1,1,30,2); }
  else { const x=db=>Math.round(clamp((db+70)/62,0,1)*31); /* -70 to -8 dBFS across the bar */
    g.fillStyle=MIC.flash>0?MIC.flashC:'#6f8f6c'; g.fillRect(0,1,x(MIC.db),2);
    g.fillStyle='#c4bfb3'; g.fillRect(x(MIC.talkAt??MIC_CFG.talk),0,1,4); g.fillStyle='#ff3b30'; g.fillRect(x(MIC.shoutAt??MIC_CFG.shout),0,1,4); }
  if(micTex.glt){ gl.bindTexture(gl.TEXTURE_2D,micTex.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,micTex.c); } }

/* flat screen: H shouts (no mic needed) */
addEventListener('keydown',e=>{ if(e.code==='KeyH'&&GAME.started&&!PL.dead&&!e.repeat) playerShout(); });
