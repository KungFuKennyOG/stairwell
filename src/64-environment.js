/* =====================================================================
   THE ROOM AS A WEAPON. The tower's outside windows break: throw a man into one, kick him into it, or shove him
   through with him in your hands, and the glass goes and so does he, all the floors down. Dead men go out too.
   (The lobby's windows are at street level and don't break.) Head slams into walls, counters and the floor add up
   (crushSkull, 63-grapple.js); the sinks drown (drownTick, 63-grapple.js).
   ===================================================================== */
const tBrokenGlass=tex(28,22,null,g=>{ g.fillStyle='rgba(176,196,200,0.85)';
  const tri=(a,b,c)=>{ g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.closePath(); g.fill(); };
  /* what's left in the frame: teeth along the edges, one long shard hanging from the top */
  tri([0,0],[9,0],[0,8]); tri([6,0],[13,0],[10,6]); tri([13,0],[20,0],[16,9]); tri([19,0],[28,0],[28,5]); tri([28,4],[28,13],[23,8]);
  tri([28,12],[28,22],[22,22]); tri([22,22],[14,22],[18,17]); tri([15,22],[6,22],[9,18]); tri([7,22],[0,22],[0,15]); tri([0,16],[0,7],[5,12]);
  tri([14,0],[17,0],[15,14]);
  g.fillStyle='rgba(220,232,236,0.9)'; for(const [x,y] of [[2,2],[11,1],[26,2],[25,19],[3,19],[16,4]]) g.fillRect(x,y,1,1); });
/* can a body pass through here? an open (broken) window above the sill, or it's already outside */
function winOpen(x,y,z,going){ const B=FLOOR.broke; if(!B||!B.length) return false; if(Math.abs(z)>RZ+.01) return true;
  for(const b of B) if(x>b.x0+.03&&x<b.x1-.03&&(y>.86||going)&&y<2.0&&Math.sign(z)===b.side) return true; /* going: he's already half out, the sill no longer holds him */
  return false; }
const canBreakWindows=()=>FLOOR.n>=1&&(FLOOR.mode==='camp'||FLOOR.mode==='tower');
function breakWindow(b,q,dir){ if(b.broken) return; b.broken=true; removeBox(b); (FLOOR.broke||(FLOOR.broke=[])).push(b); if(b.side==null) b.side=Math.sign(b.z0+b.z1)||1;
  for(const w of BOXES) if(w.kind==='wall'&&w.h<=.95&&w.x0<b.x1-.05&&w.x1>b.x0+.05&&Math.sign(w.z0+w.z1)===b.side) w.sill=true; /* the wall under it: a body already going out slides over it */
  sfx('shatter',1.1,q); noise(q,10,{alarm:true}); if(XR.on){ buzz('left',.6,60); buzz('right',.6,60); }
  spray(q,dir,26,2.4,.7,'glass',.011); spray(q,v3.sc(dir,-1),10,1.3,.9,'glass',.008); spray(q,[0,-1,0],10,.6,1,'glass',.009);
  const gl_=b.glass; if(gl_){ b.gP=gl_.p.slice(); b.gS=gl_.s.slice(); /* the street seen through the hole, far away now */ gl_.p=[gl_.p[0],gl_.p[1]-.6,gl_.p[2]+b.side*5]; gl_.s=[4.2,4.2,1];
    if(!b.shard) b.shard=mk(plane(1.4,1.1),M(tBrokenGlass,{cut:true,double:true}),gl_.par||floorN,b.gP[0],b.gP[1],b.gP[2]-b.side*.01,0,gl_.r[1],0); b.shard.vis=true; b.shard.live=true; } }
/* the level restarts: the windows are whole again */
function windowsRestore(){ const B=FLOOR.broke; FLOOR.broke=[]; if(!B) return; for(const w of BOXES) w.sill=false;
  for(const b of B){ if(!b.glass||!inWorld(b.glass)) continue; b.broken=false; BOXES.push(b); boxGridDirty=true; b.glass.p=b.gP; b.glass.s=b.gS; if(b.shard) b.shard.vis=false; } }
/* a body going into a window fast enough breaks it, and keeps going */
function windowImpacts(E,B){ if(!canBreakWindows()||E.outT) return;
  for(const n of ['chest','head','pelvis','shL','shR','neck']){ const i=PI_[n],v=slamV(E,B.imp[i]); if(v<2.3) continue; const q=X_(B,i); if(Math.abs(q[2])<RZ-.45) continue;
    const dir=B.impDir[i],side=Math.sign(q[2]); if(dir[2]*side<.4) continue;
    const w=BOXES.find(b=>b.kind==='window'&&!b.broken&&Math.sign(b.z0+b.z1)===side&&q[0]>b.x0-.05&&q[0]<b.x1+.05&&q[1]>.75&&q[1]<2.15); if(!w) continue;
    breakWindow(w,q,dir); E.slamT=Math.max(E.slamT||0,1);
    /* the glass gave and he's still going: off his feet, the top of him out first, the hips lifted over the sill */
    if(!E.dead){ E.stun=1; if(E.st!=='down') toDown(E,true); E.knocked=true; E.koT=Math.max(E.koT||0,4); }
    const sp=clamp(v*.85,2.6,5.2); for(let k=0;k<NP;k++){ const y=B.x[k*3+1],wt=y>1.05?1:y>.7?.85:.5; kickV(B,k,[dir[0]*.4,y>.6&&y<1.15?1.3:.35,side*sp*wt],H); }
    if(!E.dead) hitBlunt(E,n==='head'?SEGS[0]:SEGS[2],q,dir,n==='head'?'head':'chest',{power:.6});
    for(let k=0;k<3;k++) addWound(E,SEGS[[0,2,12][k]],X_(B,SEGS[[0,2,12][k]][0]),dir,{rate:.5,art:false,part:['face','chest','uarm'][k],noDecal:true}); /* cut up by the glass */
    return; } }
/* out the window and down */
function fallTick(E,dt){ if(!FLOOR.broke||!FLOOR.broke.length) return; const pel=X_(E.B,PI_.pelvis);
  if(!E.outT){ const ch=X_(E.B,PI_.chest); if(Math.abs(pel[2])<RZ+.12&&!(Math.abs(ch[2])>RZ+.3&&ch[1]<.8)) return; E.outT=.001; E.fallH=FLOOR.n*RH+.9;
    /* over the tipping point: the legs come up and over the sill after him (the sill stops counting for him) */
    for(const n of ['hipL','hipR','knL','knR','anL','anR','toeL','toeR']){ const i=PI_[n]; if(Math.abs(E.B.x[i*3+2])<RZ) kickV(E.B,i,[0,2.6,Math.sign(pel[2])*1.4],H); }
    for(const G of GRABS.slice()) if(G.E===E) endGrab(G);
    if(!E.dead){ E.silent=false; vox(E,'scream'); bark(E,'—AAAHH—',1.6); if(E.st!=='down') toDown(E,true); E.knocked=true; E.koT=99; } return; }
  E.outT+=dt; const tLand=Math.sqrt(2*E.fallH/9.8)+.8,sd=Math.sign(pel[2]);
  if(E.outT<1.5) for(let k=0;k<NP;k++) if(Math.abs(E.B.x[k*3+2])<RZ+.2) kickV(E.B,k,[0,E.B.x[k*3+1]<.95?1.6*dt:0,sd*3.2*dt],H); /* what's still inside is dragged up and over by what isn't */
  if(!E.landed&&(pel[1]<.25-E.fallH||E.outT>tLand+2.5)){ E.landed=true; E.gone=true; if(!E.dead){ E.silent=true; die(E); } sfx('thudfar',.9,[pel[0],-E.fallH,pel[2]]); } /* the street. gone: no more physics */
  if(!E.hid&&(pel[1]<-3.2||E.landed)){ E.hid=true; E.holder.vis=false; if(E.label) E.label.vis=false; E.barkT=0; } }
