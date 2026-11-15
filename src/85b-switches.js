/* =====================================================================
   LIGHT SWITCHES (floor 01 prototype). A yellowed toggle plate beside the doorway of a handful of rooms with a ceiling bulb.
   VR: poke it (the fist point crosses the plate; no grip), it re-arms once the hand pulls back. Flat: U, close and looking at it
   (the nearest thing U could use wins: a pickup nearer than the switch keeps U).
   Off: the room's bulb goes dead (its point light drops out of the picker, the bulb mesh goes grey), the hunters' eyes see it as dark
   (FLOOR.lights colour zeroed for huntLitAt, room.lit, the search grid's lit cells). A man who can see the bulb change goes to look at
   the switch (a 'glimpse'). In a hunt, a searcher passing a switch Ray turned off flicks it back on.
   API: PF.switches [{room, at:[x,y,z], on, ...}], protoEmit('lightSwitch', sw), pfSwitchSet(sw, on, who), pfSwPoke(p, key).
   ===================================================================== */
/* the rooms that get one, and whether the bulb starts on. Off ones work: the power's on, nobody's flicked them */
const PF_SW_ROOMS={N1:true,N4:true,S1:false,S3:false,S6:false,N7:false};
const PF_SW={pokeR:.075,rearmR:.13,useR:1.35,y:1.2,seeR:14,backR:.9};
PF.switches=[]; PF.bulbs=[];
const tSwPlate=tex(16,24,'#d2c48e',(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#ddd2a2'); gr.addColorStop(.6,'#cbbb82'); gr.addColorStop(1,'#b09a5c'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    g.fillStyle='rgba(70,52,24,.35)'; g.fillRect(0,0,w,1); g.fillRect(0,h-1,w,1); g.fillRect(0,0,1,h); g.fillRect(w-1,0,1,h); /* grime in the edge */
    g.fillStyle='rgba(60,44,22,.28)'; g.beginPath(); g.ellipse(w/2+1,h/2+1,4.5,6.5,0,0,6.3); g.fill(); /* finger marks round the toggle */
    g.fillStyle='#6d6450'; g.fillRect(w/2-1,2,2,2); g.fillRect(w/2-1,h-4,2,2); g.fillStyle='#3c3a33'; g.fillRect(w/2-1,h/2-4,2,8); }),
  tSwLever=tex(4,8,'#e6dcb6',(g,w,h)=>{ g.fillStyle='#c8b98a'; g.fillRect(0,h-3,w,3); g.fillStyle='#f2ead0'; g.fillRect(1,0,1,h-3); });
const mSwPlate=M(tSwPlate),mSwLever=M(tSwLever),mBulbOn=M(tBulb,{unlit:true}),mBulbDead=M(tBulbDead);

/* the floor's twKit.bulb, keeping the bulb's node (live in a switch room, so the merge leaves it alone) */
function pfSwKit(A){ PF.bulbs.length=0;
  A.bulb=(x,z,lit,warm=true,y=2.32)=>{ const r=pfRoomRaw(x,z),sw=r&&PF_SW_ROOMS[r.id]!==undefined;
    mk(cyl(.004,.004,RH-y-.05,3),mBlack,floorN,x,(RH+y)/2+.02,z);
    const n=mk(box(.08,.1,.08),lit?(warm?mBulbOn:M(tFluo,{unlit:true})):mBulbDead,floorN,x,y,z); if(sw) n.live=true;
    PF.bulbs.push({x,y,z,lit,room:r,n,sw});
    /* a working bulb that starts off still needs its light, waiting */
    if(sw&&!lit) PF.lights.push({p:[x,y-.07,z],c:[1.45,.86,.42],d:4.8,kind:'sw',room:r,t0:Math.random()*9,w:0}); return n; }; }

/* a plate on the room's side of a wall, beside one of its doorways */
function pfSwPlace(){ PF.switches.length=0;
  for(const id in PF_SW_ROOMS){ const r=PF.byId[id]; if(!r) continue;
    const ops=PF.openings.filter(o=>(o.A===r||o.B===r)&&o.kind!=='hole'&&o.kind!=='chain').sort((a,b)=>((b.A&&b.A.id==='H'||b.B&&b.B.id==='H')?1:0)-((a.A&&a.A.id==='H'||a.B&&a.B.id==='H')?1:0));
    let got=null;
    for(const o of ops){ const ax=o.axis==='x',cen=pfRoomCen(r),sgn=Math.sign((ax?cen[1]:cen[0])-o.c)||1;
      for(const s of [o.s1+.24,o.s0-.24,o.s1+.45,o.s0-.45]){ const face=o.c+sgn*(PF_T/2+.006),x=ax?s:face,z=ax?face:s,ix=ax?s:face+sgn*.25,iz=ax?face+sgn*.25:s;
        if(!pfIn(r,ix,iz)) continue;
        const wx=ax?s:o.c,wz=ax?o.c:s; if(!boxesAt(wx,wz).some(b=>b.kind==='wall'&&!(b.y0>0)&&wx>=b.x0-.01&&wx<=b.x1+.01&&wz>=b.z0-.01&&wz<=b.z1+.01&&b.h>1.5)) continue; /* the wall's really there (not another gap) */
        if(boxesAt(ix,iz).some(b=>b.kind!=='wall'&&b.y0<PF_SW.y+.1&&b.h>PF_SW.y-.3&&ix>b.x0-.12&&ix<b.x1+.12&&iz>b.z0-.12&&iz<b.z1+.12)) continue; /* nothing standing in front of it */
        got={x,z,n:ax?[0,0,sgn]:[sgn,0,0]}; break; }
      if(got) break; }
    if(!got){ console.warn('[switch] no spot for',id); continue; }
    const ry=got.n[2]?(got.n[2]>0?0:Math.PI):(got.n[0]>0?Math.PI/2:-Math.PI/2),g=N(floorN,got.x,PF_SW.y,got.z,0,ry,0); g.live=true;
    mk(box(.075,.12,.012,{at:[0,0,.006]}),mSwPlate,g); const lv=N(g,0,0,.012); lv.live=true; mk(box(.014,.034,.016,{at:[0,.017,.008]}),mSwLever,lv);
    const lights=PF.lights.filter(l=>l.room===r&&(l.kind==null||l.kind==='sw')),bulbs=PF.bulbs.filter(b=>b.room===r);
    const on0=!!PF_SW_ROOMS[id];
    PF.switches.push({room:r,id,at:[got.x+got.n[0]*.012,PF_SW.y,got.z+got.n[2]*.012],n:got.n,on:on0,on0,g,lv,lights,bulbs,held:{},byRay:false,t:-9}); }
  for(const sw of PF.switches) pfSwApply(sw,true); }
const pfRoomCen=r=>{ let a=0,x=0,z=0; for(const q of r.rects){ const s=(q[2]-q[0])*(q[3]-q[1]); a+=s; x+=s*(q[0]+q[2])/2; z+=s*(q[1]+q[3])/2; } return [x/a,z/a]; };

/* make the world match sw.on: the picker, the bulb, the eyes */
function pfSwApply(sw,quick){ sw.lv.r=[sw.on?-.35:.35,0,0];
  for(const l of sw.lights){ l.off=!sw.on; if(!sw.on||quick) l.w=0; const i=PF.lights.indexOf(l); if(FLOOR.lights&&FLOOR.lights[i]) FLOOR.lights[i][1]=sw.on?l.c:[0,0,0]; }
  for(const b of sw.bulbs) if(b.n.mesh) b.n.mesh.mats[0]=sw.on?mBulbOn:mBulbDead;
  sw.room.lit=PF.lights.some(l=>l.room===sw.room&&l.kind!=='stairs'&&!l.off);
  const G=typeof HUNT!=='undefined'&&HUNT.grid; if(G&&typeof huntLitAt==='function') for(const c of G.cells){ if(sw.lights.some(l=>Math.hypot(l.p[0]-c.x,l.p[2]-c.z)<l.d)) c.lit=huntLitAt(c.x,c.z,1.2); } }

/* flick it. who: 'ray' | an enemy | null (reset) */
function pfSwitchSet(sw,on,who){ if(!sw||sw.on===on) return false; sw.on=on; sw.t=GAME.t; pfSwApply(sw,false);
  sfx('click',.55,sw.at); if(who==='ray'){ sw.byRay=!on; if(typeof noise==='function') noise([sw.at[0],0,sw.at[2]],1.2); pfSwSeen(sw); }
  protoEmit('lightSwitch',sw,who); protoEmit('stat','pf.switch',1); return true; }
/* the men who saw the light change go and look at the switch */
function pfSwSeen(sw){ if(typeof huntAlert!=='function'||typeof huntSees!=='function') return; const L=sw.lights[0]; if(!L) return;
  for(const E of enemies){ if(E.dead||E.civ||E.ally||!upright(E)) continue; const d=Math.hypot(E.pos[0]-L.p[0],E.pos[1]-L.p[2]); if(d>PF_SW.seeR) continue;
    const he=[E.pos[0],1.6,E.pos[1]]; if(!huntSees(he,L.p)&&!huntSees(he,[L.p[0],.9,L.p[2]])) continue;
    huntAlert('glimpse',[sw.at[0]+sw.n[0]*.6,sw.at[2]+sw.n[2]*.6],.5,E); } }

/* a hand (or a test's stand-in) at p: crossing the plate flicks it, once until it pulls back */
function pfSwPoke(p,key){ for(const sw of PF.switches){ const d=Math.hypot(p[0]-sw.at[0],p[1]-sw.at[1],p[2]-sw.at[2]);
    if(d<PF_SW.pokeR&&!sw.held[key]){ sw.held[key]=true; pfSwitchSet(sw,!sw.on,'ray'); if(XR.on) buzz(key==='L'?'left':'right',.45,25); return sw; }
    if(d>PF_SW.rearmR) sw.held[key]=false; } return null; }

/* flat: U at the switch you're looking at, if nothing U can pick up is nearer */
function pfSwUse(){ const {f,eye}=camBasis(); let best=null,bd=1e9;
  for(const sw of PF.switches){ const v=v3.sub(sw.at,eye),d=Math.hypot(...v); if(d<PF_SW.useR&&v3.dot(v,f)/d>.55&&d<bd){ bd=d; best=sw; } }
  if(!best) return false;
  for(const P of LOOSE){ const v=v3.sub(P.node.p,eye),d=Math.hypot(...v); if(d<bd&&d<2.1&&v3.dot(v,f)/d>.8) return false; }
  return pfSwitchSet(best,!best.on,'ray'); }
addEventListener('keydown',e=>{ if(e.code!=='KeyU'||!GAME.started||FLOOR.mode!=='proto'||PL.dead) return; if(pfSwUse()&&typeof pfUseQ!=='undefined') pfUseQ=false; }); /* after 85-pfloor.js's listener: it clears the use it queued */

protoOn('load',()=>{ if(FLOOR.mode==='proto') pfSwPlace(); });
protoOn('reset',()=>{ if(FLOOR.mode!=='proto') return; for(const sw of PF.switches){ sw.on=sw.on0; sw.byRay=false; sw.held={}; pfSwApply(sw,true); } });
protoOn('tick',()=>{ if(FLOOR.mode!=='proto'||!PF.switches.length||!GAME.started||PL.dead) return;
  if(XR.on) for(const h of [HANDS.L,HANDS.R]){ if(h.src&&h.M) pfSwPoke(handTip(h),h===HANDS.L?'L':'R'); } /* the fingertip when you point (59-hands.js) */
  else if(typeof HIDE!=='undefined'&&HIDE.fake&&HIDE.fake.hands) HIDE.fake.hands.forEach((p,k)=>{ if(p) pfSwPoke(p,'F'+k); });
  /* searching, a man passing a switch Ray turned off puts the light back on */
  if(typeof HUNT!=='undefined'&&HUNT.state==='hunting') for(const sw of PF.switches){ if(sw.on||!sw.byRay||GAME.t-sw.t<4) continue;
    for(const E of enemies){ if(E.dead||E.civ||E.ally||!upright(E)||!(E.hj||E.aware)) continue; if(Math.hypot(E.pos[0]-sw.at[0],E.pos[1]-sw.at[2])>PF_SW.backR) continue;
      pfSwitchSet(sw,true,E); if(E.barkCd<=0) bark(E,pick(['Who turned that off?','...lights.','You in here?']),2.2); break; } } });
