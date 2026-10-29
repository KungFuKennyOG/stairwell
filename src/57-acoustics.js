/* =====================================================================
   ACOUSTICS: where you are shapes what you hear.
   Places:  every spot in a level is one of eight kinds of space, each with its own generated reverb and gun tone:
              room     a cinderblock room: short, dense, boxy; a shot in here is deafening
              hall     tower corridors and stairwells: longer concrete ring
              shell    the half-built house: bare concrete, no roof, a few hard slaps
              yard     a walled yard or court: discrete slaps off the walls, short tail
              alley    two walls close together: flutter echo
              out      the open street or lot: dry crack, slaps off buildings far away, a low boom that rolls off
              tunnel   the bore: long, dark, a metallic flutter down the tube
              chamber  a dug room off the tunnel: earthy, damp
            Moving between places crossfades the reverb. Guns go through a tone stage that the place sets (low end up indoors, crack up outside).
   3D:      sounds with a position come from where they happen; distance dulls them (air), a wall between you dulls them more
            and lets the room carry them instead.
   Ambience: a bed per level and per place (night street, room tone, generator, tunnel drone and drips, tower fluorescents).
   Also: enemy footsteps by surface, bullet impacts and ricochets, brass, the ear ring after loud shots in a closed space,
   and bullet time muffling the world.
   ===================================================================== */
const ENV={
  room:   {rt:.7, er:[[3,.55],[6,.45],[9,.4],[13,.3],[17,.22]],dark:.35,wet:.8, lo:3,hi:0,  amb:'in'},
  hall:   {rt:1.15,er:[[8,.5],[15,.4],[24,.3],[37,.2]],dark:.45,wet:.65,lo:1.5,hi:0,  amb:'in'},
  shell:  {rt:.8, er:[[11,.5],[23,.35],[41,.2]],dark:.4, wet:.45,lo:1,  hi:1,  amb:'out'},
  yard:   {rt:.6, er:[[28,.5],[55,.35],[96,.25],[150,.12]],dark:.6,wet:.4,lo:0,hi:1.5,amb:'out'},
  alley:  {rt:.6, flut:16,flutN:9,er:[[8,.5]],dark:.5,wet:.45,lo:.5,hi:1, amb:'out'},
  out:    {rt:.25,er:[[190,.35],[430,.22],[700,.1]],rumble:1.7,dark:.7,wet:.3,lo:-1,hi:3,amb:'out'},
  tunnel: {rt:2.2,flut:11,flutN:14,er:[[6,.5],[19,.35]],dark:.55,wet:.7,lo:3,hi:-1,amb:'tun'},
  chamber:{rt:1.0,er:[[5,.5],[11,.4],[18,.3]],dark:.65,wet:.55,lo:2,hi:-1.5,amb:'tun'}
};
/* which kind of space a point is in.
   The level's own names say what's open sky (streets are space -1; YARD, PATIO, LOT and the like are outside, OBRA is a roofless
   concrete shell). How big or narrow an open space is comes from four rays to the nearest walls: two close walls and a long
   run is an alley, walls all round a yard, anything wider the open street. Worked out once per nav cell, so a level that
   grows or moves keeps working. */
const OPEN_SKY=/YARD|COURT|LOT|ALLEY|PATIO|PARK|YONKE|JUNK|PLAZA|CANCH|STREET|CALLE|TALLER/,ROOFLESS=/OBRA/;
const ENV_CACHE={space:null,m:new Map()};
function openSpan(x,z){ const o=[x,1.4,z],f=d=>{ const h=rayBoxes(o,d,25,b=>b.kind==='wall'||b.kind==='door'||b.h>1.5); return h?h.t:25; };
  return [f([1,0,0])+f([-1,0,0]),f([0,0,1])+f([0,0,-1])]; }
function envAt(x,z){ const m=FLOOR.mode,c=FLOOR.space?navCell(x,z):-1,sp=c>=0?FLOOR.space[c]:-9;
  if(m==='tunnel') return sp===-3||sp===-9?'tunnel':'chamber';
  if(m==='room') return 'room';
  if(m!=='stash') return sp>=0?'room':'hall';
  if(ENV_CACHE.space!==FLOOR.space){ ENV_CACHE.space=FLOOR.space; ENV_CACHE.m.clear(); }
  const key=c>=0?c:'x'+Math.round(x)+','+Math.round(z); if(ENV_CACHE.m.has(key)) return ENV_CACHE.m.get(key);
  const u=(FLOOR.units||[]).find(u=>u.id===sp),name=u?u.apt:'',[sx,sz]=openSpan(x,z),lo=Math.min(sx,sz),hi=Math.max(sx,sz); let k;
  if(ROOFLESS.test(name)) k='shell';
  else if(sp<0||OPEN_SKY.test(name)) k=lo<4.5&&hi>8?'alley':hi<14?'yard':'out';
  else k=lo>7&&hi>9?'hall':'room';
  ENV_CACHE.m.set(key,k); return k; }
const isInside=k=>ENV[k].amb==='in'||k==='tunnel'||k==='chamber';

/* ---------- impulse responses, generated once per place per audio context ---------- */
function makeIR(ac,P){ const sr=ac.sampleRate,erMax=Math.max(...P.er.map(e=>e[0]))/1000,len=Math.min(3,Math.max(P.rt*1.3,P.rumble||0,erMax+.3,(P.flut||0)*(P.flutN||0)/1000+.3)),n=Math.floor(sr*len),ir=ac.createBuffer(2,n,sr);
  for(let c=0;c<2;c++){ const d=ir.getChannelData(c); let lp=0,rl=0;
    for(let i=0;i<n;i++){ const t=i/sr,k=Math.min(.96,.12+P.dark*t*2.4); lp=lp*k+(Math.random()*2-1)*(1-k); d[i]=lp*2.2*Math.exp(-6.9*t/P.rt)*Math.min(1,t/.004);
      if(P.rumble&&t>.05){ rl=rl*.996+(Math.random()*2-1)*.004; d[i]+=rl*9*Math.exp(-(t-.05)/(P.rumble/4))*Math.min(1,(t-.05)/.08); } } /* the boom rolling off outdoors */
    const imp=(ms,a)=>{ const i=Math.floor((ms+c*1.3)/1000*sr); if(i+2<n){ d[i]+=a; d[i+1]+=a*.5; d[i+2]-=a*.35; } };
    for(const [ms,a] of P.er) imp(ms,a);
    if(P.flut) for(let j=0;j<P.flutN;j++) imp((j+1)*P.flut,.5*Math.pow(.8,j)); }
  let E=0; for(let c=0;c<2;c++){ const d=ir.getChannelData(c); for(let i=0;i<n;i++) E+=d[i]*d[i]; } const s=.9/Math.sqrt(E/2);
  for(let c=0;c<2;c++){ const d=ir.getChannelData(c); for(let i=0;i<n;i++) d[i]*=s; }
  return ir; }
function irFor(ac,key){ ac.__irs=ac.__irs||{}; return ac.__irs[key]||(ac.__irs[key]=makeIR(ac,ENV[key])); }

/* switch the place's reverb: a fresh convolver fades in while the old one fades out */
function setEnv(ac,key,fast){ const B=audioBus(ac); if(B.env===key) return; B.env=key; const P=ENV[key],t=ac.currentTime,T=fast?.001:.6;
  const conv=ac.createConvolver(); conv.normalize=false; conv.buffer=irFor(ac,key); const g=ac.createGain(); g.gain.value=fast?1:0; B.revIn.connect(conv); conv.connect(g); g.connect(B.wet);
  if(!fast) g.gain.setTargetAtTime(1,t,T/3);
  const old=B.conv; if(old){ old.g.gain.setTargetAtTime(0,t,T/3); setTimeout(()=>{ try{ B.revIn.disconnect(old.conv); old.conv.disconnect(); old.g.disconnect(); }catch(_){} },fast?50:2500); }
  B.conv={conv,g};
  B.wet.gain.setTargetAtTime(P.wet,t,fast?.001:.2); B.lo.gain.setTargetAtTime(P.lo,t,fast?.001:.2); B.hi.gain.setTargetAtTime(P.hi,t,fast?.001:.2); }

/* ---------- 3D: where a sound is, how far, and whether a wall is in the way ---------- */
function earPos(){ const {eye}=camBasis(); return eye; }
function spatial(ac,p,dest){ const e=earPos(),d=Math.hypot(p[0]-e[0],p[1]-e[1],p[2]-e[2]);
  const occ=d>.6&&typeof sightClear==='function'&&!sightClear([e[0],Math.min(e[1],1.5),e[2]],[p[0],Math.max(1,Math.min(p[1],1.5)),p[2]]);
  const pan=ac.createPanner(); pan.panningModel='equalpower'; pan.distanceModel='inverse'; pan.refDistance=1.5; pan.rolloffFactor=1; pan.maxDistance=80;
  if(pan.positionX){ pan.positionX.value=p[0]; pan.positionY.value=p[1]; pan.positionZ.value=p[2]; } else pan.setPosition(p[0],p[1],p[2]);
  const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=occ?650:Math.min(20000,22000/(1+d/12)); lp.Q.value=.5;
  const g=ac.createGain(); g.gain.value=occ?.45:1; pan.connect(lp); lp.connect(g); g.connect(dest);
  setTimeout(()=>{ try{ pan.disconnect(); lp.disconnect(); g.disconnect(); }catch(_){} },4000);
  return {input:pan,occ,d}; }
/* the voices (55-voice.js) come through here: the room, the wall muffle, the limiter */
function voiceDest(ac,p){ const B=audioBus(ac),e=earPos(),occ=Math.hypot(p[0]-e[0],p[2]-e[2])>.6&&!sightClear([e[0],1.5,e[2]],[p[0],1.5,p[2]]);
  const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=occ?800:18000; const g=ac.createGain(); g.gain.value=occ?.5:1; lp.connect(g); g.connect(B.inp);
  const sd=ac.createGain(); sd.gain.value=occ?.45:.22; lp.connect(sd); sd.connect(B.revIn);
  setTimeout(()=>{ try{ lp.disconnect(); g.disconnect(); sd.disconnect(); }catch(_){} },8000); return lp; }

/* ---------- ambience ---------- */
const AMB={ac:null,mode:null,nodes:[],beds:{},nextDrip:0,nextCricket:0,nextDog:8,genOcc:-1};
function loopNoise(ac,rate=1){ const s=ac.createBufferSource(); s.buffer=NOISE; s.loop=true; s.playbackRate.value=rate; s.start(ac.currentTime,Math.random()); AMB.nodes.push(s); return s; }
function lfo(ac,hz,depth,target){ const o=ac.createOscillator(),g=ac.createGain(); o.frequency.value=hz; g.gain.value=depth; o.connect(g); g.connect(target); o.start(); AMB.nodes.push(o); return o; }
function osc(ac,type,hz){ const o=ac.createOscillator(); o.type=type; o.frequency.value=hz; o.start(); AMB.nodes.push(o); return o; }
function filt(ac,type,hz,q=.7){ const f=ac.createBiquadFilter(); f.type=type; f.frequency.value=hz; f.Q.value=q; return f; }
function gainN(ac,v,dest){ const g=ac.createGain(); g.gain.value=v; if(dest) g.connect(dest); return g; }
function stopAmb(){ for(const n of AMB.nodes){ try{ n.stop(); }catch(_){} try{ n.disconnect(); }catch(_){} } AMB.nodes=[]; for(const k in AMB.beds){ try{ AMB.beds[k].out.disconnect(); }catch(_){} } AMB.beds={}; }
function buildAmb(ac){ stopAmb(); AMB.ac=ac; AMB.mode=FLOOR.mode; const B=audioBus(ac),m=FLOOR.mode;
  /* outside: far traffic, a slow wind; through a wall it's dulled (bed.lp) */
  if(m==='stash'){ const out=gainN(ac,0,B.inp),lp=filt(ac,'lowpass',8000); lp.connect(out);
    const tr=gainN(ac,.07,lp); const tf=filt(ac,'lowpass',170); loopNoise(ac,.5).connect(tf); tf.connect(tr); lfo(ac,.05,.025,tr.gain);
    const wi=gainN(ac,.012,lp); const wf=filt(ac,'bandpass',420,.6); loopNoise(ac,.8).connect(wf); wf.connect(wi); lfo(ac,.07,.01,wi.gain); lfo(ac,.11,160,wf.frequency);
    AMB.beds.night={out,lp}; }
  /* indoors: room tone, and the 60 Hz hum of something plugged in while the power's on */
  if(m==='stash'||m==='tower'||m==='room'){ const out=gainN(ac,0,B.inp); const rf=filt(ac,'lowpass',260); loopNoise(ac,.4).connect(rf); rf.connect(gainN(ac,.022,out));
    const hum=gainN(ac,0,out); for(const [hz,a] of [[60,.006],[120,.005],[180,.002]]) osc(ac,'sine',hz).connect(gainN(ac,a,hum));
    AMB.beds.room={out,hum}; }
  /* the tower: fluorescent tubes buzzing, the building's air */
  if(m==='tower'||m==='room'){ const out=AMB.beds.room.out,bz=gainN(ac,0,out),bf=filt(ac,'bandpass',240,3); osc(ac,'sawtooth',120).connect(bf); bf.connect(bz); AMB.beds.room.buzz=bz;
    const af=filt(ac,'lowpass',420); loopNoise(ac,.6).connect(af); af.connect(gainN(ac,.012,out)); }
  /* the stash house generator: a 4-stroke chugging in the yard, where it actually is */
  if(m==='stash'&&typeof STASH_GEN!=='undefined'){ const pan=ac.createPanner(); pan.panningModel='equalpower'; pan.distanceModel='inverse'; pan.refDistance=1.2; pan.rolloffFactor=1.2;
    if(pan.positionX){ pan.positionX.value=STASH_GEN[0]; pan.positionY.value=.5; pan.positionZ.value=STASH_GEN[1]; } else pan.setPosition(STASH_GEN[0],.5,STASH_GEN[1]);
    const lp=filt(ac,'lowpass',2500),out=gainN(ac,0,B.inp); pan.connect(lp); lp.connect(out);
    const eng=gainN(ac,.0,pan),ef=filt(ac,'lowpass',240); osc(ac,'sawtooth',29).connect(ef); ef.connect(eng); lfo(ac,14.5,.08,eng.gain); eng.gain.value=.1;
    const rat=gainN(ac,.025,pan),rf=filt(ac,'bandpass',1100,1.2); loopNoise(ac,1).connect(rf); rf.connect(rat); lfo(ac,14.5,.02,rat.gain);
    AMB.beds.gen={out,lp}; }
  /* the tunnel: a low drone in the earth, the vent fan */
  if(m==='tunnel'){ const out=gainN(ac,0,B.inp),df=filt(ac,'lowpass',85); loopNoise(ac,.3).connect(df); df.connect(gainN(ac,.06,out)); lfo(ac,.03,.02,out.gain);
    const fan=gainN(ac,0,out); for(const [hz,a] of [[46,.02],[92,.01],[138,.004]]) osc(ac,'sine',hz).connect(gainN(ac,a,fan)); lfo(ac,7.6,.012,fan.gain);
    AMB.beds.tun={out,fan}; } }
const fade=(p,v,tc=.4)=>{ if(p) p.setTargetAtTime(v,AMB.ac.currentTime,tc); };

/* ---------- per frame: the ears follow your head, the place follows your feet ---------- */
const SND={envT:0,env:null,ear:0,earCd:0,ringing:0,slow:false,steps:new Map()};
function acousticsTick(dt){ const ac=AC; if(!ac||!GAME.started) return; const B=audioBus(ac),{f,u,eye}=camBasis(),L=ac.listener,t=ac.currentTime;
  if(L.positionX){ L.positionX.value=eye[0]; L.positionY.value=eye[1]; L.positionZ.value=eye[2]; L.forwardX.value=f[0]; L.forwardY.value=f[1]; L.forwardZ.value=f[2]; L.upX.value=u[0]; L.upY.value=u[1]; L.upZ.value=u[2]; }
  else { L.setPosition(eye[0],eye[1],eye[2]); L.setOrientation(f[0],f[1],f[2],u[0],u[1],u[2]); }
  if(AMB.ac!==ac||AMB.mode!==FLOOR.mode) buildAmb(ac);
  SND.envT-=dt; if(SND.envT<=0){ SND.envT=.2; const k=envAt(PL.x,PL.z); setEnv(ac,k,!SND.env); SND.env=k; const inside=isInside(k);
    const nb=AMB.beds.night; if(nb){ fade(nb.out.gain,inside?.55:1); fade(nb.lp.frequency,inside?450:8000,.3); }
    const rb=AMB.beds.room; if(rb){ fade(rb.out.gain,inside?1:.0); fade(rb.hum.gain,FLOOR.power===false?0:1); if(rb.buzz) fade(rb.buzz.gain,FLOOR.power===false?0:.012); }
    const gb=AMB.beds.gen; if(gb){ fade(gb.out.gain,FLOOR.power===false?0:1,.25); const occ=!sightClear([eye[0],1.5,eye[2]],[STASH_GEN[0],1.2,STASH_GEN[1]]); fade(gb.lp.frequency,occ?500:2500,.2); }
    const tb=AMB.beds.tun; if(tb){ fade(tb.out.gain,1); fade(tb.fan.gain,FLOOR.power===false?0:1,.6); } }
  /* one-shots in the ambience */
  const k=SND.env||'room';
  if(FLOOR.mode==='stash'){ AMB.nextCricket-=dt; if(AMB.nextCricket<=0){ AMB.nextCricket=rnd(.25,1.1); const a=rnd(0,6.28),r=rnd(5,14); sfx('cricket',isInside(k)?.25:rnd(.5,1),[PL.x+Math.cos(a)*r,.2,PL.z+Math.sin(a)*r]); }
    AMB.nextDog-=dt; if(AMB.nextDog<=0){ AMB.nextDog=rnd(14,40); const a=rnd(0,6.28),r=rnd(25,45); sfx('dog',rnd(.5,.9),[PL.x+Math.cos(a)*r,.5,PL.z+Math.sin(a)*r]); } }
  if(FLOOR.mode==='tunnel'){ AMB.nextDrip-=dt; if(AMB.nextDrip<=0){ AMB.nextDrip=rnd(.6,2.8); const a=rnd(0,6.28),r=rnd(1.5,9); sfx('drip',rnd(.4,1),[PL.x+Math.cos(a)*r,rnd(1.2,2.2),PL.z+Math.sin(a)*r]); } }
  /* bullet time: the world goes dull and far away */
  if(GAME.slow!==SND.slow){ SND.slow=GAME.slow; B.slowLP.frequency.setTargetAtTime(GAME.slow?1600:20000,t,.12); }
  /* ears: loud shots in a closed space add up; past a point they ring and everything ducks for a moment */
  SND.ear=Math.max(0,SND.ear-dt*.45); SND.earCd-=dt;
  if(SND.ear>1.3&&SND.earCd<=0){ SND.earCd=5; SND.ear=.6; earRing(ac); }
  /* their footsteps */
  stepsTick(dt); }
function earShot(key,sup){ if(sup) return; const k=SND.env||'room',w={shotgun:1,revolver:.6,gun:.42,smg:.2}[key]||.4; SND.ear+=w*(isInside(k)?1:.35); }
function earRing(ac){ const B=audioBus(ac),t=ac.currentTime,g=ac.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.022,t+.05); g.gain.setTargetAtTime(0,t+.4,.7); g.connect(ac.destination);
  for(const hz of [3720,3790]){ const o=ac.createOscillator(); o.frequency.value=hz; o.connect(g); o.start(t); o.stop(t+4); }
  B.inp.gain.cancelScheduledValues(t); B.inp.gain.setValueAtTime(B.inp.gain.value,t); B.inp.gain.linearRampToValueAtTime(.5,t+.04); B.inp.gain.setTargetAtTime(1,t+.5,.6); }

/* ---------- footsteps: dirt and gravel outside, hard floor inside, mud in the tunnel ---------- */
const SURF={out:'grit',yard:'grit',alley:'grit',shell:'grit',room:'hard',hall:'hard',tunnel:'mud',chamber:'mud'};
function stepsTick(dt){ let n=0; for(const E of enemies){ if(E.dead||!(E.st==='idle'||E.st==='alert')){ SND.steps.delete(E); continue; }
    const s=SND.steps.get(E)||{p:E.pos.slice(),ph:Math.random()}; const sp=Math.hypot(E.pos[0]-s.p[0],E.pos[1]-s.p[1])/Math.max(dt,1e-3); s.p=E.pos.slice(); SND.steps.set(E,s);
    if(sp<.35||sp>9) continue; const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); if(d>16) continue;
    s.ph+=dt*sp*1.45; if(s.ph<1) continue; s.ph-=1; if(n++>6) continue;
    sfx('step_'+SURF[envAt(E.pos[0],E.pos[1])],(.28+.3*Math.min(1,sp/3))*(E.mind==='hunt'?1.2:1),[E.pos[0],.05,E.pos[1]]); } }
