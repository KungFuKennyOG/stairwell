/* =====================================================================
   SQUAD (floor 01 prototype): once Ray is found, the men who know where he is stop walking at him in a crowd.
   Before: every aware man's goal was Ray's last known position (aiGoal), so they all converged on one spot and the spacing rules
   only shuffled them once they were already on top of him (up to 5-6 men within 5 m in the bot runs).
   Now a floor-level coordinator, three times a second, gives each aware man a job by real walking distance:
   - press (2 at most, rage men first): the existing fight behaviour (84-fight / 84b-close: doorways, spacing, one shooter).
   - flank (1): Ray's room has another way in: he goes round to it, waits beside the frame until the press is on Ray (or 5-9 s),
     then comes in from there.
   - cut (1): the doorway on Ray's way to the stairs: he holds just outside it, in the dark, facing it.
   - guard: the warden holds the chained door.
   - cover: everyone else hangs back at 6 m or more, holds where they are and calls; the nervous always hang back.
   - siege: Ray in a room with one way in and nobody seeing him: the press men stop beside that doorway and call him out for 10-18 s,
     then go in together.
   Anyone Ray walks up to (3 m), or a man who sees Ray close, just fights: a job never stops a man defending himself.
   Hooked from fightMove() after rage. PROTO only.
   ===================================================================== */
PROTO.squad={press:2,apart:3.5,avoidR:2.2,tick:.33,coverMin:6,flankWait:[5,9],siege:[10,18],selfDefence:3,barkCd:3.2};
const SQ={t:0,T:null,R:null,jobs:new Map(),sawT:-99,siege:null,barkT:0,last:'',ents:[]};
const SQ_L={press:['I got him!','On him!','He\'s here! Here!'],flank:['Going round!','I\'ll come round the back!','Other door! Go!'],
  cut:['I got the stairs!','Don\'t let him out!','Watch the back!'],cover:['Stay on him!','Hold here, hold here!','Wait for it...'],
  guard:['I\'m on the door!','Nobody leaves!'],siege:['Come out, cop!','Nowhere to go, man.','We\'ll wait. We got all night.'],push:['Go! Go!','Together, now!']};
function sqMen(){ return enemies.filter(E=>!E.dead&&!E.civ&&!E.ally&&!E.surr&&E.st==='alert'&&E.aware&&!(E.fx&&E.fx.run)); }
function sqSay(E,job){ const P=PROTO.squad; if(GAME.t<SQ.barkT||!E||E.barkT>0) return; if(Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>16) return;
  const L=SQ_L[job]; if(!L) return; let s=pick(L),n=0; while(s===SQ.last&&n++<4) s=pick(L); SQ.last=s; SQ.barkT=GAME.t+P.barkCd; bark(E,s,2.2); if(typeof vox==='function') vox(E,'shout',.7); }
/* the ways into room R (not crouch holes, not the chain), each with a spot just outside and just inside */
function sqEntrances(R){ const out=[]; if(!R) return out;
  for(const o of PF.openings){ if(o.A!==R&&o.B!==R||o.kind==='hole'||o.kind==='chain') continue;
    let s,outP,inP; if(o.axis==='x'){ s=pfIn(R,o.x,o.z+.5)?1:-1; outP=[o.x,o.z-s*1.3]; inP=[o.x,o.z+s*1.0]; } else { s=pfIn(R,o.x+.5,o.z)?1:-1; outP=[o.x-s*1.3,o.z]; inP=[o.x+s*1.0,o.z]; }
    const side=o.axis==='x'?[1,0]:[0,1]; out.push({o,out:outP,in:inP,side,beside:[outP[0]+side[0]*.7,outP[1]+side[1]*.7]}); }
  return out; }
const sqD=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function sqPath(F,x,z){ if(!F) return null; const c=navCell(x,z); return c>=0&&F[c]<1e8?F[c]/20:null; }
function squadTick(){ const P=PROTO.squad,now=GAME.t; const men=sqMen();
  if(men.length<2){ SQ.jobs.clear(); SQ.siege=null; return; }
  const seer=men.find(E=>E.canSee); if(seer){ SQ.T=[PL.x,PL.z]; SQ.sawT=now; }
  else if(!SQ.T||now-SQ.sawT>30){ const b=men.find(E=>E.lkp); if(b) SQ.T=b.lkp.slice(); } /* nobody's seen him: where they last heard he was */
  const T=SQ.T; if(!T){ SQ.jobs.clear(); return; }
  const R=pfRoomAt(T[0],T[1]),all=R&&!/^H|NE|NX/.test(R.id)?sqEntrances(R):[];
  /* only the doors you can get to without going through his room: the room beyond has another walkable way in (crawl holes don't count, the men can't crawl) */
  const reach=e=>{ const O=e.o.A===R?e.o.B:e.o.A; return !!O&&PF.openings.filter(o=>(o.A===O||o.B===O)&&o.kind!=='hole'&&o.kind!=='chain').length>=2; };
  const ents=all.filter(reach); SQ.R=R; SQ.ents=ents;
  const F=fieldTo(T[0],T[1]),dOf=E=>sqPath(F,E.pos[0],E.pos[1])??sqD(E.pos,T);
  const order=men.slice().sort((a,b)=>(b.rage>0)-(a.rage>0)||dOf(a)-dOf(b));
  const prev=SQ.jobs,jobs=new Map(),roomMoved=SQ.lastR!==R; SQ.lastR=R; let press=0; const free=[];
  /* sticky: a man keeps his job while it still makes sense; only the empty places get filled (no churn, no new line every tick) */
  const entOk=e=>!e||!e.o||ents.some(x=>x.o===e.o);
  for(const E of order){ const w=prev.get(E); if(!w) continue;
    if(w.k==='press'&&press<P.press+(E.rage>0?1:0)){ jobs.set(E,w); press++; }
    else if((w.k==='flank'||w.k==='cut')&&!roomMoved&&entOk(w.e)&&!(w.k==='flank'&&ents.length<2)) jobs.set(E,w);
    else if(w.k==='guard'&&PF.exit&&!PF.exit.open) jobs.set(E,w); }
  for(const E of order){ if(jobs.has(E)) continue;
    if(E.rage>0&&press<P.press+1){ jobs.set(E,{k:'press'}); press++; continue; }
    if(E.hRole==='warden'&&PF.exit&&!PF.exit.open){ jobs.set(E,{k:'guard'}); continue; }
    if(E.hRole==='nervous'){ jobs.set(E,{k:'cover'}); continue; }
    if(press<P.press){ jobs.set(E,{k:'press'}); press++; continue; } free.push(E); }
  /* siege: one way in, and nobody's had eyes on him for 4 s */
  if(ents.length===1&&now-SQ.sawT>4){ if(!SQ.siege||SQ.siege.R!==R){ SQ.siege={R,until:now+rnd(P.siege[0],P.siege[1]),said:false,push:false}; } }
  else SQ.siege=null;
  const has=k=>[...jobs.values()].some(j=>j.k===k);
  const lead=order.find(E=>jobs.get(E)&&jobs.get(E).k==='press'),pe=ents.length?(lead?ents.reduce((a,b)=>sqD(lead.pos,a.out)<=sqD(lead.pos,b.out)?a:b):ents[0]):null; SQ.pe=pe;
  const avoid=pe?[pe.out,pe.in]:lead?[lead.pos]:[]; /* where the press goes in: the others keep clear of it */
  if(ents.length>=2&&free.length&&!has('flank')){ /* the way the press is coming in, and the one furthest from it */
    const fcs=ents.filter(e=>e!==pe); const fe=fcs.length?fcs.reduce((a,b)=>sqD(pe.out,a.out)>=sqD(pe.out,b.out)?a:b):null;
    if(fe){ const fm=free.reduce((a,b)=>sqD(a.pos,fe.out)<=sqD(b.pos,fe.out)?a:b); free.splice(free.indexOf(fm),1);
    jobs.set(fm,{k:'flank',e:fe,ph:'go',t0:now,wait:rnd(P.flankWait[0],P.flankWait[1]),av:avoid}); } }
  if(free.length&&PF.exit&&!PF.exit.open&&!has('cut')){ /* the doorway out of his room toward the stairs (or, in the hall, a spot between him and the stairs) */
    const FX=fieldTo(PF.exit.at[0],PF.exit.at[2]); let ce=null;
    const used=new Set([...jobs.values()].filter(j=>j.e).map(j=>j.e.o)); const cands=ents.filter(e=>!used.has(e.o)&&!(pe&&e!==pe&&sqD(e.out,pe.out)<P.apart)&&e!==pe); /* not the press door, nor one right beside it */
    if(cands.length){ ce=cands.reduce((a,b)=>(sqPath(FX,...a.out)??99)<=(sqPath(FX,...b.out)??99)?a:b); }
    else if(!ents.length){ const ex=[PF.exit.at[0],PF.exit.at[2]],v=[ex[0]-T[0],ex[1]-T[1]],L=Math.hypot(...v); if(L>5){ const k=Math.min(6,L*.5)/L,p=navSnap(T[0]+v[0]*k,T[1]+v[1]*k); ce={out:p,beside:p,in:p,o:null}; } }
    else if(pe&&FX){ /* one way in, the press has it: he holds the way to the stairs ~6 m down from that door, not the door itself */
      let c=navCell(pe.out[0],pe.out[1]); for(let n=0;n<18&&c>=0;n++){ const ci=c%NX,ck=(c-ci)/NX; let best=c; for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const q=(ck+k)*NX+ci+i; if(q>=0&&q<FX.length&&FX[q]<FX[best]) best=q; } if(best===c) break; c=best; }
      const p=c>=0?[cellX(c%NX),cellZ((c-c%NX)/NX)]:null; if(p&&sqD(p,pe.out)>=P.apart){ ce={out:p,beside:p,in:pe.out,o:null}; } }
    if(ce){ const cm=free.reduce((a,b)=>sqD(a.pos,ce.out)<=sqD(b.pos,ce.out)?a:b); free.splice(free.indexOf(cm),1); jobs.set(cm,{k:'cut',e:ce,av:avoid}); } }
  for(const E of free) jobs.set(E,{k:'cover'});
  for(const [E,j] of jobs){ if(E.role==='hold') E.role=null; /* the old tower holder (66-tower.js) held his room forever: once the squad's on, he has a job instead */
    const w=prev.get(E); if(!w||w.k!==j.k){ sqSay(E,j.k); protoEmit('squad',j.k,E); } }
  SQ.jobs=jobs; }
protoOn('tick',(gdt,dt)=>{ if(!PROTO.on||!GAME.started||PL.dead) return; SQ.t-=dt; if(SQ.t<=0){ SQ.t=PROTO.squad.tick; squadTick(); } });
protoOn('reset',()=>{ SQ.jobs.clear(); SQ.T=null; SQ.siege=null; SQ.sawT=-99; SQ.lastR=undefined; });
const sqHold=(E,face)=>{ if(face) E.hWant=Math.atan2(face[0]-E.pos[0],face[1]-E.pos[1]); return {goal:null,chase:false}; };
/* a path to (tx,tz) that costs four times as much within avoidR of the press door: he goes round by another way if there is one */
function sqField(tx,tz,av){ const P=PROTO.squad,pen=new Uint8Array(NX*NZ),r=P.avoidR,rc=Math.ceil(r*4);
  for(const p of av){ const c=navCell(p[0],p[1]); if(c<0) continue; const ci=c%NX,ck=(c-ci)/NX;
    for(let k=-rc;k<=rc;k++) for(let i=-rc;i<=rc;i++){ const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; if(Math.hypot(cellX(ni)-p[0],cellZ(nk)-p[1])<r) pen[nk*NX+ni]=1; } }
  let c=navCell(tx,tz); if(c<0) return null; if(FLOOR.nav[c]){ const q=navSnap(tx,tz); c=navCell(q[0],q[1]); }
  const F=new Int32Array(NX*NZ); navField(F,c,pen); return F; }
/* follow such a field (the same stepping as navDir, without its straight-line shortcut, which would cut across the press door) */
function sqDir(x,z,F){ let c=navCell(x,z); if(c<0||F[c]>=1e9) return null; let cur=c,aim=null;
  for(let step=0;step<5;step++){ const ci=cur%NX,ck=(cur-ci)/NX; let best=cur,bd=F[cur];
    for(let k=-1;k<=1;k++) for(let i=-1;i<=1;i++){ const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ) continue; const q=nk*NX+ni; if(i&&k&&(FLOOR.nav[ck*NX+ni]||FLOOR.nav[nk*NX+ci])) continue; if(F[q]<bd){ bd=F[q]; best=q; } }
    if(best===cur) break; cur=best; const p=[cellX(cur%NX),cellZ((cur-cur%NX)/NX)]; if(lineClearNav(x,z,p[0],p[1])) aim=p; else if(aim) break; else { aim=p; break; } }
  return aim?norm3([aim[0]-x,0,aim[1]-z]):null; }
/* the movement for a man with a job; null = his ordinary fighting */
function squadMove(E,dt,fighting,dist){ const J=SQ.jobs.get(E); if(!J||J.k==='press') return null; const P=PROTO.squad,now=GAME.t;
  if(dist<P.selfDefence||fighting&&dist<5&&J.k!=='cover') return null; /* he's on you: he fights */
  /* walk to p; 'stuck' fires on any 1.5 s without progress, holding still included, so only several strikes in a row give up (one at a corner used to freeze him there for good) */
  if(J.k==='guard'&&!J.av&&SQ.pe) J.av=[SQ.pe.out,SQ.pe.in]; /* the warden walks to the chain round the press door too */
  const go=(p,sp)=>{ if(Math.hypot(E.pos[0]-p[0],E.pos[1]-p[1])<=.45){ J.stk=0; return null; } if(J.stk>3) return null;
    if(stuck(E,dt)){ J.stk=(J.stk||0)+1; freshGoal(E); }
    if(J.av&&J.av.length){ if(!J.F||J.Ft!==p){ J.F=sqField(p[0],p[1],J.av); J.Ft=p; } const d=J.F&&sqDir(E.pos[0],E.pos[1],J.F); /* round the press door, not through it */
      if(d) return {goal:{x:E.pos[0]+d[0]*.9,z:E.pos[1]+d[2]*.9,sp},chase:false}; }
    return {goal:{x:p[0],z:p[1],sp},chase:false}; };
  if(J.k==='flank'){ const e=J.e; if(J.ph==='go'){ const m=go(e.beside,2.1); if(m) return m; J.ph='wait'; J.tw=now; }
    if(J.ph==='wait'){ const pressOn=[...SQ.jobs].some(([O,j])=>j.k==='press'&&O.canSee); if(now-J.tw<J.wait&&!pressOn) return sqHold(E,e.in); J.ph='in'; sqSay(E,'push'); }
    return null; }
  if(J.k==='cut'){ const m=go(J.e.beside,1.9); return m||sqHold(E,J.e.in); }
  if(J.k==='guard'){ const X=PF.exit.at,p=navSnap(X[0]-1.6,X[2]); const m=go(p,1.6); return m||sqHold(E,SQ.T); } /* the floor side of the chained door */
  if(J.k==='cover'){ const T=SQ.T; if(!T) return null; const d=sqD(E.pos,T),pe=SQ.pe;
    if(pe&&sqD(E.pos,pe.out)<P.apart){ const v=[E.pos[0]-pe.out[0],E.pos[1]-pe.out[1]],L=Math.hypot(...v)||1,q=navSnap(pe.out[0]+v[0]/L*(P.apart+1),pe.out[1]+v[1]/L*(P.apart+1)); const m=go(q,1.6); if(m) return m; } /* not in the press's doorway */
    if(d<P.coverMin){ const v=[E.pos[0]-T[0],E.pos[1]-T[1]],L=Math.hypot(...v)||1,p=navSnap(T[0]+v[0]/L*P.coverMin,T[1]+v[1]/L*P.coverMin); return go(p,1.5)||sqHold(E,T); }
    if(Math.random()<dt*.05) sqSay(E,'cover'); return sqHold(E,T); }
  return null; }
/* the press during a siege: beside the one doorway, calling him out, then in together */
function squadSiege(E,dt){ const S=SQ.siege,J=SQ.jobs.get(E); if(!S||!J||J.k!=='press'||E.rage>0) return null; const now=GAME.t;
  if(now>S.until){ if(!S.push){ S.push=true; sqSay(E,'push'); } return null; }
  const e=SQ.ents[0]; if(!e) return null; const i=[...SQ.jobs].filter(([O,j])=>j.k==='press').findIndex(([O])=>O===E),p=i?[e.out[0]-e.side[0]*.7,e.out[1]-e.side[1]*.7]:e.beside;
  if(!S.said&&Math.hypot(E.pos[0]-p[0],E.pos[1]-p[1])<1.2){ S.said=true; sqSay(E,'siege'); } else if(Math.random()<dt*.08) sqSay(E,'siege');
  if(Math.hypot(E.pos[0]-p[0],E.pos[1]-p[1])<=.45||J.stk>3) return sqHold(E,e.in); if(stuck(E,dt)){ J.stk=(J.stk||0)+1; freshGoal(E); } return {goal:{x:p[0],z:p[1],sp:1.8},chase:false}; }
