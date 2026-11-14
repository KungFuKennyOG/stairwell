// Melee test rig: a simulated VR hand swings each weapon through a standing man and reports what registered.
// It drives HANDS.R.M along scripted swing arcs and runs the same per-hand calls as xrFrame (meleeTick, vrMelee,
// applySupport), then update() and updateWorld(), with requestAnimationFrame off and setTimeout on game time.
// usage: node tools/melee-rig.js index.html [reg|tier|feel|perf|all|one] [--quick] [--json out.json]   (env RIG_Q: page query, default f=1)
//   reg  : registration sweep. weapons x speeds x body parts x swing types x speed profiles, plus deliberate misses
//          5-10 cm past him. The man is left unharmed between swings (hits are recorded, not applied).
//   tier : what each tier does to a fresh man (real hits): pushes, staggers, knockdowns, winding, cuts, chops.
//   perf : melee cost per frame, both hands swinging, six men within reach.
// Works on the old melee (wraps meleeHit and the 'bump' sound) and the new one (listens to protoEmit('melee')).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
const file = 'file://' + path.resolve(process.argv[2] || 'index.html');
const mode = (process.argv[3] && !process.argv[3].startsWith('--')) ? process.argv[3] : 'all';
const quick = process.argv.includes('--quick');
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;

const IN_PAGE = `
window.requestAnimationFrame=()=>0;
window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
window.__RIG=(function(){
  const DT=1/72, NEW=typeof PROTO!=='undefined'&&!!PROTO.melee;
  XR.on=true; GAME.started=true;
  let LOG=[],DRY=false,SWING=false,LASTCL=9,LASTDBG=null;
  /* old code: meleeHit is a registered hit, the 'bump' sound is a too-slow contact */
  const _mh=meleeHit; meleeHit=function(h,E,seg,p,dir,speed,bone){ if(!NEW) LOG.push({tier:1,speed,part:seg[3],kind:'old'}); if(DRY&&!NEW){ h.cd=.28; return; } return _mh.apply(this,arguments); }; /* dry: keep the old cooldown so one swing is one hit */
  const _sfx=sfx; sfx=function(t){ if(!NEW&&SWING&&t==='bump') LOG.push({tier:0,speed:0,part:'?',kind:'bump'}); return _sfx.apply(this,arguments); };
  const _kv=kickV; kickV=function(){ if(DRY) return; return _kv.apply(this,arguments); };
  let CUR_S=0,VHIST=[];
  if(NEW) protoOn('melee',(h,E,o)=>{ if(SWING) LOG.push({tier:o.tier,speed:o.speed,part:o.part,kind:o.kind,p:o.p,s:CUR_S,vmax:Math.max(...VHIST.slice(-3)),dbg:o.dbg}); });
  const _sen=senses; let deaf=false; senses=function(){ if(deaf) return; return _sen.apply(this,arguments); };
  /* Ray can't be hurt here (a hit would knock his hands, 80-ray.js, and block melee for 0.45 s), and outside the tier cases nothing
     he does makes a sound: a wall blow would start a hunt on the prototype floor (83-hunt.js) and the rig's man would come for him */
  hurtPlayer=function(){}; const _noise=noise; let QUIET=true; noise=function(){ if(QUIET) return; return _noise.apply(this,arguments); };
  function runQ(){ if(!window.__Q.length) return; const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } }
  /* one VR frame, in xrFrame's order */
  const hands=[HANDS.R,HANDS.L];
  let melMs=0;
  function frame(){ PL.hp=100; PL.dead=false;
    /* the registration and feel checks need a man who stands still: on the prototype floor the floor's own AI walks everyone (83-hunt.js) */
    if(deaf) for(const E of enemies) if(E.rigPin&&!E.dead&&E.st!=='down'){ E.pos[0]=E.rigPin.x; E.pos[1]=E.rigPin.z; E.hd=E.rigPin.hd; E.aware=false; E.mind='calm'; E.lkp=null; if(E.st==='alert') E.st='idle'; E.moveDir=null; E.atkT=-1; }
    const t0=performance.now();
    for(const h of hands){ setLocal(h.node,m4.make(),h.M); h.node.vis=true; const fp=mulP(h.M,FIST); if(h.prevPos) h.vel=v3.add(v3.sc(h.vel,.5),v3.sc(v3.sub(fp,h.prevPos),.5/DT)); h.prevPos=fp;
      meleeTick(h,DT); if(!h.supportOf) vrMelee(h,DT); else h.prevPts=null; }
    applySupport(HANDS.R); applySupport(HANDS.L);
    melMs=performance.now()-t0; TM.mel+=melMs; const t1=performance.now();
    update(DT,performance.now()); updateWorld(world,null); runQ(); TM.upd+=performance.now()-t1; TM.n++; return melMs; }
  const TM={mel:0,upd:0,n:0,cl:0};
  /* --- geometry helpers --- */
  const nrm=v=>{ const l=Math.hypot(...v)||1; return [v[0]/l,v[1]/l,v[2]/l]; };
  const add=v3.add,sub=v3.sub,sc=v3.sc,dot=v3.dot,cross=v3.cross;
  const perp=(v,d)=>nrm(sub(v,sc(d,dot(v,d))));
  /* ray against his drawn skin, with the triangle's normal */
  function skinRay(E,o,d,maxT){ let best=null;
    for(const [n,P] of bodyMeshes(E)) meshTris(n,P,(V,I)=>{ for(let k=0;k<I.length;k+=3){ const a=I[k]*3,b=I[k+1]*3,c=I[k+2]*3;
      const e1=[V[b]-V[a],V[b+1]-V[a+1],V[b+2]-V[a+2]],e2=[V[c]-V[a],V[c+1]-V[a+1],V[c+2]-V[a+2]],pv=cross(d,e2),det=dot(e1,pv); if(Math.abs(det)<1e-9) continue; const id=1/det;
      const tv=[o[0]-V[a],o[1]-V[a+1],o[2]-V[a+2]],u=dot(tv,pv)*id; if(u<0||u>1) continue; const qv=cross(tv,e1),v=dot(d,qv)*id; if(v<0||u+v>1) continue;
      const t=dot(e2,qv)*id; if(t>=0&&t<=maxT&&(!best||t<best.t)){ let N=nrm(cross(e1,e2)); if(dot(N,d)>0) N=sc(N,-1); best={t,N}; } } });
    if(best) best.p=add(o,sc(d,best.t)); return best; }
  /* ---- ground truth for a miss: how close the drawn weapon (its whole surface, sampled every ~1.5 cm) comes to his drawn skin ---- */
  function skinTris(E){ const T=[]; for(const [n,P] of bodyMeshes(E)) meshTris(n,P,(V,I)=>{ for(let k=0;k<I.length;k+=3){ const a=I[k]*3,b=I[k+1]*3,c=I[k+2]*3; const A=[V[a],V[a+1],V[a+2]],B=[V[b],V[b+1],V[b+2]],C=[V[c],V[c+1],V[c+2]];
    T.push({A,B,C,lo:[0,1,2].map(i=>Math.min(A[i],B[i],C[i])),hi:[0,1,2].map(i=>Math.max(A[i],B[i],C[i]))}); } }); return T; }
  function ptTri(p,a,b,c){ /* closest point on a triangle (Ericson), returns the distance */
    const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a),d1=dot(ab,ap),d2=dot(ac,ap); if(d1<=0&&d2<=0) return Math.hypot(...ap);
    const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp); if(d3>=0&&d4<=d3) return Math.hypot(...bp);
    const vc=d1*d4-d3*d2; if(vc<=0&&d1>=0&&d3<=0){ const v=d1/(d1-d3); return Math.hypot(...sub(p,add(a,sc(ab,v)))); }
    const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp); if(d6>=0&&d5<=d6) return Math.hypot(...cp);
    const vb=d5*d2-d1*d6; if(vb<=0&&d2>=0&&d6<=0){ const w=d2/(d2-d6); return Math.hypot(...sub(p,add(a,sc(ac,w)))); }
    const va=d3*d6-d5*d4; if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){ const w=(d4-d3)/((d4-d3)+(d5-d6)); return Math.hypot(...sub(p,add(b,sc(sub(c,b),w)))); }
    const dn=1/(va+vb+vc),v=vb*dn,w=vc*dn; return Math.hypot(...sub(p,add(a,add(sc(ab,v),sc(ac,w))))); }
  /* the weapon's surface as points in item space (the fist's box for fists) */
  function itemSurf(h){ const pts=[],seen=new Set(),walk=(n,Mp)=>{ const L=m4.make(); m4.compose(L,n.p,n.r,n.s); const W=m4.make(); m4.mul(W,Mp,L);
      if(n.mesh&&n.mesh.geo&&n.mesh.geo.P&&n.mesh.geo.I){ const P=n.mesh.geo.P,I=n.mesh.geo.I,v=i=>mulP(W,[P[i*3],P[i*3+1],P[i*3+2]]);
        for(let k=0;k<I.length;k+=3){ const a=v(I[k]),b=v(I[k+1]),c=v(I[k+2]),m=Math.max(Math.hypot(...sub(b,a)),Math.hypot(...sub(c,a)),Math.hypot(...sub(c,b))),s=Math.max(1,Math.ceil(m/.02));
          for(let i=0;i<=s;i++) for(let j=0;j<=s-i;j++){ const u=i/s,w=j/s,q=add(a,add(sc(sub(b,a),u),sc(sub(c,a),w))),key=q.map(x=>Math.round(x*100)).join(','); if(!seen.has(key)){ seen.add(key); pts.push(q); } } } }
      for(const k of n.kids||[]) walk(k,W); };
    if(h.itemNode){ walk(h.itemNode,m4.make()); /* itemNode is placed in the hand: undo its own transform so points are in item space */ const L=m4.make(); m4.compose(L,h.itemNode.p,h.itemNode.r,h.itemNode.s); const inv=rigidInv(L); return pts.map(p=>mulP(inv,p)); }
    walk(h.node.kids[0],m4.make()); return pts; } /* the fist: hand space is its item space */
  function clearance(E,h,poses){ const T=skinTris(E),S=itemSurf(h); let best=9;
    for(const IW of poses){ const W=S.map(p=>mulP(IW,p));
      for(const p of W){ const m=Math.min(best,.15); for(const t of T){ if(p[0]<t.lo[0]-m||p[0]>t.hi[0]+m||p[1]<t.lo[1]-m||p[1]>t.hi[1]+m||p[2]<t.lo[2]-m||p[2]>t.hi[2]+m) continue; const d=ptTri(p,t.A,t.B,t.C); if(d<best) best=d; } }
      if(best<.03) break; } /* already not a clean miss */
    return best; }
  /* --- the man --- */
  const MAKERS={gunman:makeGunman,corner:makeCorner,cutter:makeCutter};
  let base=null;
  function fresh(kind){ clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); window.__Q=[];
    if(!base) base=openBase();
    PL.x=base.x; PL.z=base.z; PL.yaw=-Math.PI/2; PL.pitch=0;
    const E=spawnEnemy({maker:MAKERS[kind||'gunman'],name:'Rig',x:base.x+1.0,z:base.z,hd:-Math.PI/2,extra:''}); enemies.push(E); attachLabels(); E.psych='fight'; E.rigPin={x:base.x+1.0,z:base.z,hd:-Math.PI/2};
    for(const h of hands){ equip(h,null); park(h); }
    for(let i=0;i<40;i++) frame(); return E; }
  /* somewhere with room: Ray at x, the man a metre along +x, nothing solid within reach of either (the new floor has walls everywhere) */
  function openBase(){ const S=FLOOR.start,clear=(x,z)=>!BOXES.some(b=>!b.sightOnly&&b.h>.25&&b.x1>x-.9&&b.x0<x+2.1&&b.z1>z-1.1&&b.z0<z+1.1)&&Math.abs(x+2.1)<RX&&Math.abs(x-.9)<RX&&Math.abs(z)+1.1<RZ;
    if(clear(S.x,S.z)) return {x:S.x,z:S.z}; let best=null,bd=1e9; for(let x=-RX;x<RX;x+=.25) for(let z=-RZ;z<RZ;z+=.25){ const d=Math.hypot(x-S.x,z-S.z); if(d<bd&&clear(x,z)){ bd=d; best={x,z}; } }
    return best||{x:S.x,z:S.z}; }
  /* a hand out of the way, low by Ray's side */
  function park(h){ const M=fromCols([0,0,1],[0,1,0],[-1,0,0],[PL.x-.1,.7,PL.z+(h===HANDS.R?.35:-.35)]); h.M.set(M); tele(h); h.prevPts=null; h.cd=0; }
  /* the rig moves a hand instantly; a real one never does: don't let the jump count as hand speed */
  function tele(h){ if(typeof melSnap==='function') melSnap(h); h.prevPos=null; h.vel=[0,0,0]; }
  function bodyFrame(E){ const B=E.B,P=n=>X_(B,PI_[n]),fw=[Math.sin(E.hd),0,Math.cos(E.hd)],up=nrm(sub(P('neck'),P('pelvis'))),rt=nrm(sub(P('shR'),P('shL'))); return {P,fw,up,rt}; }
  const mid=(a,b,k)=>add(a,sc(sub(b,a),k));
  function target(E,part){ const {P,fw,up,rt}=bodyFrame(E);
    switch(part){ case 'head': return P('head'); case 'jaw': return add(P('head'),add(sc(nrm(sub(P('head'),P('neck'))),-.065),sc(fw,.03)));
      case 'neck': return mid(P('neck'),P('head'),.3); case 'chest': return add(mid(P('chest'),P('neck'),.5),sc(rt,-.05)); /* his left pec, clear of the gun arm */ case 'belly': return mid(P('pelvis'),P('chest'),.45);
      case 'uarm': return mid(P('shR'),P('elR'),.5); case 'farm': return mid(P('elR'),P('hdR'),.45); case 'thigh': return mid(P('hipR'),P('knR'),.45); } }
  const PART_OK={head:['head','neck'],jaw:['head','neck'],neck:['neck','head'],chest:['chest'],belly:['belly'],uarm:['uarm'],farm:['farm'],thigh:['thigh']};
  /* --- weapons: the striking spot in item space, and how each swing type holds it --- */
  const STRIKE={ fists:{blunt:[0,-.035,-.008],lead:.05}, knife:{edge:[0,-.012,.15],tip:[0,-.004,.23],lead:.02}, bottle:{edge:[0,0,.16],tip:[0,0,.2],lead:.04},
    machete:{edge:[0,-.035,.3],tip:[0,-.012,.43],lead:.012}, pistol:{butt:[0,-.085,-.03],side:[0,.045,.06],tip:[0,.045,.15],lead:.015},
    /* the props agent's items (87-props.js): -y is the striking side, the pan's cooking face is +x */
    pan:{face:[0,0,.217],edge:[-.02,-.12,.217],lead:.005}, hammer:{edge:[-.024,-.056,.215],lead:.003}, pipe:{edge:[-.019,-.017,.45],lead:.003}, cutter:{edge:[-.024,-.025,.47],lead:.003} };
  const TYPES={ fists:['jab','hook','upper'], knife:['slash','chop','thrust'], bottle:['slash','chop','thrust'], machete:['slash','chop','thrust'], pistol:['butt','side','jab'],
    pan:['face','edge'], hammer:['slash','chop'], pipe:['slash','chop'], cutter:['slash','chop'] };
  /* the swing: direction at contact D, the item's axes [X,Y,Z], which spot leads, straight or an arc */
  function swingSpec(E,w,type,part){ const {fw,up,rt}=bodyFrame(E),inn=sc(fw,-1),S=STRIKE[w];
    const low=part==='thigh',lowish=part==='belly';
    let D,Z,Y,spot,arc=true,lead=S.lead;
    const across=nrm(add(sc(rt,-.9),sc(inn,.45))),down=nrm(add(add(sc(up,-.75),sc(inn,.55)),sc(rt,-.25))),upc=nrm(add(sc(up,.75),sc(inn,.6)));
    if(w==='fists'){ spot=S.blunt; D=type==='jab'?(low?nrm(add(inn,sc(up,-.45))):lowish?nrm(add(inn,sc(up,-.15))):inn):type==='hook'?across:(part==='head'||part==='jaw'||part==='neck'?upc:down); Z=D; Y=perp(Math.abs(dot(D,up))>.9?inn:up,Z); arc=type!=='jab'; }
    else if(w==='pistol'){ if(type==='butt'){ spot=S.butt; D=down; Y=sc(D,-1); Z=perp(inn,Y); } else if(type==='side'){ spot=S.side; D=across; Z=perp(inn,D); Y=cross(Z,D); /* X = D: the side of the slide leads */ }
      else { spot=S.tip; lead=0; D=low?nrm(add(inn,sc(up,-.45))):lowish?nrm(add(inn,sc(up,-.15))):inn; Z=D; Y=perp(up,Z); arc=false; } }
    else if(w==='pan'&&type==='face'){ spot=S.face; D=across; Z=perp(inn,D); Y=cross(Z,D); } /* X = D: the face leads */
    else { if(type==='thrust'){ spot=S.tip; lead=0; D=low?nrm(add(inn,sc(up,-.45))):lowish?nrm(add(inn,sc(up,-.15))):inn; Z=D; Y=perp(up,Z); arc=false; }
      else { spot=S.edge; D=type==='slash'?across:down; Y=sc(D,-1); Z=perp(type==='slash'?up:inn,Y); } }
    const X=cross(Y,Z); return {D,R:[X,Y,Z],spot,arc,lead}; }
  /* place the hand so the item has axes R and its spot sits at P */
  function placeItem(h,R,spot,P){ const [X,Y,Z]=R,O=sub(P,add(sc(X,spot[0]),add(sc(Y,spot[1]),sc(Z,spot[2])))),IW=fromCols(X,Y,Z,O);
    if(h.item&&h.itemL){ const o=m4.make(); m4.mul(o,IW,rigidInv(h.itemL)); h.M.set(o); } else h.M.set(IW); }
  const rotR=(R,k,a)=>{ const c=Math.cos(a),s=Math.sin(a); return R.map(v=>rodr(v,k,c,s)); };
  /* run one swing. S0: where the leading surface meets him (or the point it passes, for a miss). prof: 'steady' | 'pull' */
  function pathOf(spec,S0){ const {D,R,arc,lead}=spec,rho=.45,C0=sub(S0,sc(D,lead)); /* the spot's position at contact */
    const Nrm=perp(sub([PL.x,1.35,PL.z],C0),D),k=nrm(cross(D,Nrm)),ctr=add(C0,sc(Nrm,rho));
    return s=>{ if(!arc) return {R,P:add(C0,sc(D,s))}; const a=s/rho; return {R:rotR(R,k,a),P:add(ctr,rodr(sc(Nrm,-rho),k,Math.cos(a),Math.sin(a)))}; }; }
  function itemPose(R,spot,P){ const [X,Y,Z]=R; return fromCols(X,Y,Z,sub(P,add(sc(X,spot[0]),add(sc(Y,spot[1]),sc(Z,spot[2]))))); }
  function swing(h,E,spec,S0,v,prof,o={}){ const {spot}=spec,pre=o.pre??.32,post=o.post??.16,at=pathOf(spec,S0);
    if(o.miss){ const poses=[]; for(let s=-pre;s<=(o.stop??post)+1e-6;s+=.02){ const q=at(s); poses.push(itemPose(q.R,spot,q.P)); } const tc=performance.now(); LASTCL=clearance(E,h,poses); TM.cl+=performance.now()-tc; }
    let s=-pre; { const q=at(s); placeItem(h,q.R,spot,q.P); } tele(h); h.prevPts=null; h.cd=0; h.bumpCd=0;
    for(let i=0;i<6;i++) frame(); /* settle at the start */
    LOG=[]; SWING=true; let n=0,end=o.stop??post; const DBG={cd:0,wall:0,grab:0,stuck:0,st:{},moved:0,dead:0,p0:E.pos.slice()};
    VHIST=[0,0,0];
    while(s<end&&n<400){ let vv=v; if(prof==='pull'){ if(s>-.04&&s<=0) vv=Math.sqrt(Math.max(.01,v*v-(v*v-.2025*v*v)*(s+.04)/.04)); else if(s>0) vv=Math.max(.08,.45*v*Math.sqrt(Math.max(0,1-s/.06))); if(s>.06) break; }
      s=Math.min(s+vv*DT,end); VHIST.push(vv); /* never past the end: a 'stop short' really stops there */ CUR_S=s; const q=at(s); placeItem(h,q.R,spot,q.P); frame(); n++;
      if(h.cd>0) DBG.cd++; if(h.mv&&h.mv.wall) DBG.wall++; if(PL.grab) DBG.grab++; if(h.stuck) DBG.stuck++; DBG.st[E.st]=1; if(PL.dead) DBG.dead++; DBG.moved=Math.max(DBG.moved,Math.hypot(E.pos[0]-DBG.p0[0],E.pos[1]-DBG.p0[1])); }
    LASTDBG=DBG;
    for(let i=0;i<8;i++) frame(); /* the stop and the catch-up finish */
    SWING=false; const out=LOG; LOG=[];
    /* ground truth for the tier: how fast the point that touched him was really moving (the scripted path, his body still) */
    for(const c of out){ if(!c.p) continue; const P0=itemPose(at(c.s-.01).R,spot,at(c.s-.01).P),P1=itemPose(at(c.s).R,spot,at(c.s).P),ci=mulP(rigidInv(P1),c.p);
      c.ideal=+(Math.hypot(...sub(mulP(P1,ci),mulP(P0,ci)))/.01*c.vmax).toFixed(2); }
    return out; }
  function surface(E,T,D){ const o=sub(T,sc(D,.7)),r=skinRay(E,o,D,1.2); return r; }
  const tierOf=v=>v<1.5?0:v<3.5?1:v<6?2:3;
  /* ---- registration sweep ---- */
  function reg(q,RIGW){ DRY=true; deaf=true; if(NEW) PROTO.melee.dry=true; const E=fresh('gunman'); const h=HANDS.R,rows=[],miss=[];
    const W=RIGW||(q?['fists','knife','machete','pistol']:['fists','knife','bottle','machete','pistol']).concat(WPN.pan&&!q?['pan','hammer','pipe','cutter']:[]),SP=q?[1,1.5,4,8]:[1,1.5,2.5,4,6,8],PARTS=['head','jaw','neck','chest','belly','uarm','farm','thigh'],PROF=q?['pull']:['steady','pull'];
    for(const w of W){ equip(h,w==='fists'?null:newItem(w)); park(h); for(let i=0;i<6;i++) frame();
      for(const part of PARTS) for(const type of TYPES[w]) for(const prof of PROF) for(const v of SP){
        const spec=swingSpec(E,w,type,part),T=target(E,part),hit=surface(E,T,spec.D); if(!hit){ rows.push({w,part,type,prof,v,skip:'no surface'}); continue; }
        const L=swing(h,E,spec,hit.p,v,prof); const first=L[0];
        rows.push({w,part,type,prof,v,n:L.length,det:L.length>0,reg:L.some(x=>x.tier>=1),tier:first?first.tier:-1,ms:first?+first.speed.toFixed(2):null,ideal:first?first.ideal:null,kind:first?first.kind:null,dbg:L.length?undefined:LASTDBG,hp:first?first.part.replace(/[LR]$/,''):null,okPart:first?PART_OK[part].includes(first.part.replace(/[LR]$/,'')):null}); }
      /* deliberate misses: past him 5-10 cm (sideways across the surface), or stopping 5-10 cm short */
      for(const part of PARTS) for(const type of TYPES[w]) for(const clear of q?[.05,.1]:[.05,.075,.1]) for(const v of q?[4]:[2.5,6]){
        const spec=swingSpec(E,w,type,part),T=target(E,part),hit=surface(E,T,spec.D); if(!hit) continue;
        const N=hit.N; let L;
        if(type==='jab'||type==='thrust') L=swing(h,E,spec,hit.p,v,'steady',{stop:-clear,miss:true}); /* stops short of him */
        else { /* passes beside him along the surface: the item lies flat to him (its long axis across the motion), its leading spot 'clear' off the skin */
          const D2=perp(spec.D,N),T2=nrm(cross(N,D2)); let R2;
          if(w==='pistol'&&type==='side') R2=[D2,sc(N,-1),T2]; else if(w==='fists') R2=[cross(perp(N,D2),D2),perp(N,D2),D2]; else R2=[sc(N,-1),sc(D2,-1),T2];
          const sp2={D:D2,R:R2,spot:spec.spot,arc:false,lead:spec.lead};
          L=swing(h,E,sp2,add(hit.p,sc(N,clear+(w==='fists'?.05:spec.lead+.02))),v,'steady',{pre:.3,post:.3,miss:true}); }
        miss.push({w,part,type,clear,v,n:L.length,tier:L[0]?L[0].tier:-1,cl:+LASTCL.toFixed(3)}); } }
    DRY=false; deaf=false; if(NEW) PROTO.melee.dry=false; return {rows,miss,tm:{frames:TM.n,melMs:+(TM.mel/TM.n).toFixed(3),updMs:+(TM.upd/TM.n).toFixed(3),clearS:+(TM.cl/1000).toFixed(1)}}; }
  /* ---- tiers on a fresh man (real hits) ---- */
  function watch(E,secs,p0){ const st0=E.st; let stun=0,down=false,dT=null,minY=9,mv=0; const t0=GAME.t,wind=E.winded||0;
    while(GAME.t-t0<secs){ frame(); stun=Math.max(stun,E.stun); const q=X_(E.B,PI_.pelvis); minY=Math.min(minY,q[1]); if(GAME.t-t0<1.2) mv=Math.max(mv,Math.hypot(q[0]-p0[0],q[2]-p0[2])); if(E.st==='down'&&!down){ down=true; dT=+(GAME.t-t0).toFixed(2); } }
    const p1=X_(E.B,PI_.pelvis); return {down,dT,dead:E.dead,stun:+stun.toFixed(2),moved:+mv.toFixed(2),windedAtHit:+wind.toFixed(2),dropY:+(p0[1]-minY).toFixed(2),wounds:E.wounds.length,bleed:+E.wounds.reduce((s,w)=>s+w.rate,0).toFixed(1),cut:Object.keys(E.cut).filter(k=>E.cut[k]).join(',')||'',atkCd:+E.atkCd.toFixed(2),st:E.st}; }
  function tierCase(c){ QUIET=false; const E=fresh(c.kind||'gunman'); const h=HANDS.R; equip(h,c.w==='fists'?null:newItem(c.w)); park(h); for(let i=0;i<10;i++) frame();
    const hitsAt=[]; let res=null; const t0=GAME.t,p0=X_(E.B,PI_.pelvis);
    for(const [part,type,v,gap] of c.hits){ if(gap) { for(let i=0;i<Math.round(gap/DT);i++) frame(); }
      const spec=swingSpec(E,c.w,type,part),T=target(E,part),hit=surface(E,T,spec.D); if(!hit){ hitsAt.push('no surface'); continue; }
      if(c.flat){ const Z=spec.R[2],D=spec.D; spec.R=[D,cross(Z,D),Z]; spec.spot=[.003,-.004,.15]; spec.lead=.003; } /* the flat of the blade leads */
      const L=swing(h,E,spec,hit.p,v,c.prof||'steady'); hitsAt.push(L.map(x=>x.tier+':'+x.part+'@'+(+x.speed).toFixed(1)).join(' ')||'none'); park(h); }
    res=watch(E,c.secs||2.5,p0); QUIET=true; return Object.assign({name:c.name,hits:hitsAt.join(' | ')},res); }
  /* ---- cost per frame: both hands swinging near six men ---- */
  let PERFN=0; if(NEW) protoOn('melee',()=>PERFN++);
  function perf(){ deaf=true; const E0=fresh('gunman'); clearEnemies();
    const B=[PL.x,PL.z]; for(let i=0;i<6;i++){ const a=-.9+i*.36,d=.78+(i%2)*.3,E=spawnEnemy({maker:makeGunman,name:'P'+i,x:B[0]+Math.cos(a)*d,z:B[1]+Math.sin(a)*d,hd:-Math.PI/2,extra:''}); enemies.push(E); } attachLabels();
    equip(HANDS.R,newItem('machete')); equip(HANDS.L,null); for(const h of hands) park(h); for(let i=0;i<20;i++) frame();
    const run=(dry)=>{ DRY=dry; if(NEW) PROTO.melee.dry=dry; const ms=[]; const n0=PERFN; for(let f=0;f<480;f++){ const t=f*DT;
      for(const h of hands){ const sd=h===HANDS.R?1:-1,ph=t*5.2+(sd>0?0:1.7),y=1.25+Math.sin(ph)*.3,x=PL.x+.42+Math.cos(ph*.5)*.25,z=PL.z+sd*.18+Math.sin(ph)*.4*sd;
        const Z=nrm([1,Math.sin(ph+1)*.6,Math.cos(ph)*.5]),Y=perp([0,1,0],Z),X=cross(Y,Z); h.M.set(fromCols(X,Y,Z,[x,y,z])); }
      ms.push(frame()); }
      ms.sort((a,b)=>a-b); const q=k=>+ms[Math.min(ms.length-1,Math.floor(ms.length*k))].toFixed(3);
      const trim=ms.slice(0,Math.floor(ms.length*.98)); return {median:q(.5),p95:q(.95),p99:q(.99),mean:+(ms.reduce((s,x)=>s+x,0)/ms.length).toFixed(3),trim:+(trim.reduce((s,x)=>s+x,0)/trim.length).toFixed(3),contacts:PERFN-n0}; };
    const D=[run(true),run(true),run(true)].sort((a,b)=>a.mean-b.mean),dry=D[0],real=run(false); dry.means=D.map(d=>d.mean); DRY=false; if(NEW) PROTO.melee.dry=false; deaf=false;
    let tb=null; if(typeof melSkin==='function'){ const t=[]; for(let k=0;k<5;k++){ const t0=performance.now(); for(const E of enemies){ E.melC=null; melSkin(E); } t.push((performance.now()-t0)/enemies.length); } tb=+Math.min(...t).toFixed(2); }
    return {men:enemies.length,dry,real,skinBuildMs:tb}; }
  function one(w,part,type,prof,v){ DRY=true; deaf=true; if(NEW){ PROTO.melee.dry=true; PROTO.melee.debug=true; } const E=fresh('gunman'),h=HANDS.R; equip(h,w==='fists'?null:newItem(w)); park(h); for(let i=0;i<6;i++) frame();
    const spec=swingSpec(E,w,type,part),T=target(E,part),hit=surface(E,T,spec.D); const L=swing(h,E,spec,hit.p,v,prof); DRY=false; deaf=false; if(NEW){ PROTO.melee.dry=false; PROTO.melee.debug=false; } return L; }
  /* ---- the things a registration count can't show: weight, aim, the stop, stamina, grab-and-stab, stab depth, flat screen ---- */
  function feel(){ const out={}; deaf=true; DRY=false; let E=fresh('gunman'); const h=HANDS.R,fist=()=>mulP(h.node?(()=>{ const L=m4.make(); m4.compose(L,h.node.p,h.node.r,[1,1,1]); return L; })():h.M,FIST),real=()=>mulP(h.M,FIST);
    /* weight: steady 4 m/s through the air, how far the hand you see trails the real one */
    out.lag={}; clearEnemies(); const away=[PL.x+.4,1.2,PL.z+.15]; /* open air in the middle of the clear spot: no man, no wall */
    for(const w of ['fists','knife','bottle','machete','pistol','pan','hammer','pipe','cutter']){ if(!WPN[w]) continue; equip(h,w==='fists'?null:newItem(w)); park(h); for(let i=0;i<4;i++) frame();
      const Z=[1,0,0],Y=[0,1,0],X=cross(Y,Z); let gap=0,gapSlow=0; for(const [v,key] of [[4,'fast'],[1.2,'slow']]){ h.M.set(fromCols(X,Y,Z,add(away,[0,0,-.5]))); tele(h); for(let i=0;i<4;i++) frame();
        for(let f=0;f<Math.round(.7/v/DT);f++){ h.M.set(fromCols(X,Y,Z,add(away,[0,0,-.5+v*DT*(f+1)]))); frame(); const g=Math.hypot(...sub(fist(),real())); if(key==='fast') gap=Math.max(gap,g); else gapSlow=Math.max(gapSlow,g); } }
      out.lag[w]={at4:+(gap*100).toFixed(1),at1_2:+(gapSlow*100).toFixed(1)}; }
    /* the stop: a hard jab to the chest, how long the fist you see stays put while the real one goes on */
    equip(h,null); park(h); for(let i=0;i<4;i++) frame(); E=fresh('gunman'); DRY=true; if(NEW) PROTO.melee.dry=true;
    { const spec=swingSpec(E,'fists','jab','chest'),hit=surface(E,target(E,'chest'),spec.D),at=pathOf(spec,hit.p); let s=-.3; placeItem(h,at(s).R,spec.spot,at(s).P); tele(h); for(let i=0;i<6;i++) frame();
      LOG=[]; SWING=true; let held=0,prevF=null,after=-1,gapMax=0; for(let f=0;f<40;f++){ s+=4*DT; const q=at(s); placeItem(h,q.R,spec.spot,q.P); frame(); const F=fist();
        if(after<0&&LOG.length) after=0; else if(after>=0){ after++; if(prevF&&Math.hypot(...sub(F,prevF))<.002&&held===after-1) held++; gapMax=Math.max(gapMax,Math.hypot(...sub(F,real()))); } prevF=F; if(s>.25) break; }
      SWING=false; out.stop={heldFrames:held,heldMs:Math.round(held*DT*1000),gapCm:+(gapMax*100).toFixed(1),contact:LOG.length?LOG[0].tier:null}; }
    DRY=false; if(NEW) PROTO.melee.dry=false;
    /* gun aim: a pistol moved slowly stays exactly on the hand; swung hard it gets weight */
    equip(h,newItem('pistol')); park(h); for(let i=0;i<4;i++) frame();
    { const gaps={}; for(const v of [1.5,2.5,5]){ const Z=[1,0,0],Y=[0,1,0],X=cross(Y,Z); h.M.set(fromCols(X,Y,Z,add(away,[0,0,-.5]))); tele(h); for(let i=0;i<6;i++) frame(); let g=0;
        for(let f=0;f<Math.round(.5/v/DT);f++){ h.M.set(fromCols(X,Y,Z,add(away,[0,0,-.5+v*DT*(f+1)]))); h.vel=[0,0,v]; frame(); h.vel=[0,0,v]; g=Math.max(g,Math.hypot(...sub(fist(),real()))); } gaps[v+'m/s']=+(g*100).toFixed(1); } out.gunGapCm=gaps; }
    /* stamina (prototype only): ten hard swings in the air, then rest */
    if(NEW){ const was=PROTO.on; PROTO.on=true; equip(h,newItem('machete')); park(h); for(let i=0;i<4;i++) frame(); const S=h.mv; S.stam=1; const st=[];
      for(let i=0;i<20;i++) frame(); S.stam=1; /* hand still: no swing in progress */
      for(let k=0;k<10;k++){ for(let f=0;f<16;f++){ const z=f<6?f*.09:.45; h.M.set(fromCols([0,0,-1],[0,1,0],[1,0,0],add(away,[0,0,z-.2]))); if(f===0){ h.prevPos=null; h.vel=[0,0,0]; } frame(); } st.push(+S.stam.toFixed(2)); } /* 6 m/s for 6 frames, then still */
      const lagTired=(()=>{ const P=melTaus(h,WPN.machete,S); return +(P[0]*1000).toFixed(1); })();
      for(let f=0;f<Math.round(3/DT);f++){ h.vel=[0,0,0]; frame(); } const after3=+S.stam.toFixed(2); S.stam=1; const lagFresh=+(melTaus(h,WPN.machete,S)[0]*1000).toFixed(1);
      out.stamina={afterEachSwing:st,after3sRest:after3,machetLagMs_tired:lagTired,machetLagMs_fresh:lagFresh}; PROTO.on=was; }
    /* grab and stab: the left hand holds his collar, the right comes in with a knife at a speed that would only push */
    { E=fresh('gunman'); equip(h,newItem('knife')); park(h); for(let i=0;i<6;i++) frame(); const L=HANDS.L,nk=X_(E.B,PI_.neck); L.M.set(fromCols([0,0,-1],[0,1,0],[1,0,0],sub(nk,FIST))); setLocal(L.node,m4.make(),L.M);
      const g=grabTarget(mulP(L.M,FIST),.3); if(g) startGrab(L,g); for(let i=0;i<6;i++){ L.M.set(fromCols([0,0,-1],[0,1,0],[1,0,0],sub(X_(E.B,PI_.neck),FIST))); frame(); }
      const spec=swingSpec(E,'knife','slash','chest'),hit=surface(E,target(E,'chest'),spec.D); const Lg=hit?swing(h,E,spec,hit.p,1.0,'steady'):[];
      out.grabStab={grabbed:!!L.grab,contact:Lg.map(x=>x.tier+':'+x.kind+'@'+(+x.speed).toFixed(1)).join(' '),wounds:E.wounds.length};
      if(L.grab) endGrab(L.grab); E=fresh('gunman'); equip(h,newItem('knife')); park(h); L.M.set(fromCols([0,0,-1],[0,1,0],[1,0,0],sub(X_(E.B,PI_.neck),FIST))); { const g2=grabTarget(mulP(L.M,FIST),.3); if(g2) startGrab(L,g2); } /* a fresh man, freshly held */
      const sp2=swingSpec(E,'knife','thrust','belly'),h2=surface(E,target(E,'belly'),sp2.D); for(let i=0;i<6;i++){ L.M.set(fromCols([0,0,-1],[0,1,0],[1,0,0],sub(X_(E.B,PI_.neck),FIST))); frame(); }
      out.grabStab.heldForThrust=!!L.grab;
      const L2=h2?swing(h,E,sp2,h2.p,.8,'steady',{post:.04}):[]; out.grabStab.slowThrust=L2.map(x=>x.tier+':'+x.kind+'@'+(+x.speed).toFixed(1)).join(' ')+(h.stuck?' (stuck)':'');
      if(L.grab) endGrab(L.grab); equip(h,null); }
    /* stab depth: a thrust that sticks, then the hand keeps pushing along the blade */
    { E=fresh('gunman'); equip(h,newItem('knife')); park(h); for(let i=0;i<6;i++) frame(); const spec=swingSpec(E,'knife','thrust','belly'),hit=surface(E,target(E,'belly'),spec.D),at=pathOf(spec,hit.p);
      let s=-.3; placeItem(h,at(s).R,spec.spot,at(s).P); tele(h); for(let i=0;i<6;i++) frame(); LOG=[]; SWING=true;
      while(s<.02&&!h.stuck){ s+=3*DT; const q=at(s); placeItem(h,q.R,spec.spot,q.P); frame(); } SWING=false; const w0=E.wounds.length,d0=h.stuck?h.stuck.depth:null;
      for(let f=0;f<30&&h.stuck;f++){ s+=.4*DT; const q=at(s); placeItem(h,q.R,spec.spot,q.P); frame(); }
      out.depth={stuck:!!h.stuck,depthStart:d0&&+d0.toFixed(3),depthEnd:h.stuck&&+h.stuck.depth.toFixed(3),full:!!(h.stuck&&h.stuck.full),woundsBefore:w0,woundsAfter:E.wounds.length,dead:E.dead||E.dieT!=null};
      for(let f=0;f<20&&h.stuck;f++){ s-=1.6*DT; const q=at(s); placeItem(h,q.R,spec.spot,q.P); frame(); } out.depth.rippedOutAfterPull=!h.stuck; equip(h,null); }
    /* flat screen: right hand, fists, click twice at his head */
    { E=fresh('gunman'); XR.on=false; equip(HANDS.R,null); const hd=X_(E.B,PI_.head); window.__game.aimAt(hd); const ev=[]; const lst=(hh,EE,o)=>ev.push(o.tier); 
      const _mh=melHit; let tiers=[]; melHit=function(hh,EE,seg,p,dir,speed,bone,o){ tiers.push(melTier(speed)); return _mh.apply(this,arguments); };
      for(let k=0;k<2;k++){ HANDS.R.cd=0; window.__game.aimAt(X_(E.B,PI_.head)); flatSwing(HANDS.R); for(let i=0;i<30;i++){ PL.hp=100; update(DT,performance.now()); updateWorld(world,null); runQ(); } }
      melHit=_mh; for(let i=0;i<60;i++){ update(DT,performance.now()); updateWorld(world,null); runQ(); } out.flat={tiers,down:E.st==='down'}; XR.on=true; }
    deaf=false; return out; }
  /* ---- walls: swing each weapon into the nearest wall, push on through it, then pull back ---- */
  function wall(){ const out={}; deaf=true; DRY=false; clearEnemies(); const h=HANDS.R,ST=FLOOR.start;
    let W=null; for(let i=0;i<16&&!W;i++){ const a=i/16*Math.PI*2,d=[Math.cos(a),0,Math.sin(a)],o=[ST.x,1.3,ST.z],r=rayBoxes(o,d,4,b=>b.kind==='wall');
      if(r&&r.t>.9&&Math.abs(r.n[1])<.1){ const fp=add(o,sc(d,r.t)),stand=add(fp,sc(r.n,.75)); if(!rayBoxes([stand[0],1.3,stand[2]],sc(r.n,-1),.7,b=>b.kind!=='wall'&&!b.sightOnly)) W={p:fp,n:r.n,b:r.b,stand}; } }
    if(!W) return {err:'no wall found near the start'}; out.where={x:+W.p[0].toFixed(2),z:+W.p[2].toFixed(2),n:W.n.map(x=>+x.toFixed(2))};
    let EV=[]; protoOn('meleeWall',(hh,o)=>{ if(hh===h) EV.push(o); });
    const D=sc(W.n,-1),up=[0,1,0];
    const SP={fists:{spot:[0,-.035,-.008],lead:.05,R:()=>{ const Z=D,Y=up; return [cross(Y,Z),Y,Z]; }},
      knife:{spot:[0,-.022,.15],lead:0,R:()=>{ const Y=sc(D,-1),Z=up; return [cross(Y,Z),Y,Z]; }}, machete:{spot:[0,-.047,.3],lead:0,R:()=>{ const Y=sc(D,-1),Z=up; return [cross(Y,Z),Y,Z]; }},
      pistol:{spot:[0,-.08,-.02],lead:0,R:()=>{ const Y=sc(D,-1),Z=up; return [cross(Y,Z),Y,Z]; }}, pan:{spot:[0,0,.217],lead:0,R:()=>{ const X=D,Z=up; return [X,cross(Z,X),Z]; }},
      pipe:{spot:[-.019,-.017,.45],lead:0,R:()=>{ const Y=sc(D,-1),Z=up; return [cross(Y,Z),Y,Z]; }} };
    out.w={};
    for(const [w,o] of Object.entries(SP)){ if(!WPN[w]) continue; equip(h,w==='fists'?null:newItem(w)); park(h); for(let i=0;i<4;i++) frame();
      const R=o.R(),depthVis=()=>{ const L=m4.make(); m4.compose(L,h.node.p,h.node.r,[1,1,1]); const IW=h.itemNode&&h.itemL?(()=>{ const T=m4.make(); m4.mul(T,L,h.itemL); return h.itemW&&WPN[w].melee?h.itemW:T; })():L; return dot(sub(add(mulP(IW,o.spot),sc(D,o.lead)),W.p),D); };
      const res={};
      for(const v of [4,.8]){ EV=[]; let s=-.35; const P=s=>add(add(W.p,sc(D,s-o.lead)),[0,0,0]); placeItem(h,R,o.spot,P(s)); tele(h); for(let i=0;i<6;i++) frame();
        let maxIn=-9,held=0,f=0; while(s<.25){ s=Math.min(.25,s+v*DT); placeItem(h,R,o.spot,P(s)); frame(); const dv=depthVis(); if(s>.05) maxIn=Math.max(maxIn,dv); if(s>.05&&dv<.015) held++; f++; }
        for(let i=0;i<Math.round(.3/DT);i++){ frame(); const dv=depthVis(); maxIn=Math.max(maxIn,dv); if(dv<.015) held++; } /* keeps the hand through the wall a moment */
        let back=-1; for(let i=0;i<40;i++){ s=Math.max(-.35,s-2*DT); placeItem(h,R,o.spot,P(s)); frame(); if(back<0&&Math.hypot(...sub(mulP(h.M,FIST),(()=>{ const L=m4.make(); m4.compose(L,h.node.p,h.node.r,[1,1,1]); return mulP(L,FIST); })()))<.01) back=i; }
        res[v+'m/s']={wallHits:EV.length,speed:EV[0]?+EV[0].speed.toFixed(1):null,maxDepthCm:+(maxIn*100).toFixed(1),heldMs:Math.round(held*DT*1000),caughtUpMs:back<0?null:Math.round(back*DT*1000)}; }
      out.w[w]=res; }
    deaf=false; return out; }
  return {reg,tierCase,perf,one,feel,wall,NEW};
})();`;

const TIER_CASES = [
  { name: 'fist chest 1.0 (push)', w: 'fists', hits: [['chest', 'jab', 1.0]] },
  { name: 'fist chest 2.5 (hit)', w: 'fists', hits: [['chest', 'jab', 2.5]] },
  { name: 'fist chest 4.5 (stagger)', w: 'fists', hits: [['chest', 'jab', 4.5]] },
  { name: 'fist chest 7 (body: stagger, stays up)', w: 'fists', hits: [['chest', 'jab', 7]] },
  { name: 'fist belly 3 (winded)', w: 'fists', hits: [['belly', 'jab', 3]] },
  { name: 'fist jaw 2.5 (hit)', w: 'fists', hits: [['jaw', 'hook', 2.5]] },
  { name: 'fist jaw 4.5 (stagger)', w: 'fists', hits: [['jaw', 'hook', 4.5]] },
  { name: 'fist jaw 7 (knockdown)', w: 'fists', hits: [['jaw', 'hook', 7]] },
  { name: 'fist jaw 4.5 x2 in 1 s (drops)', w: 'fists', hits: [['jaw', 'hook', 4.5], ['jaw', 'upper', 4.5, .5]] },
  { name: 'fist chest 4.5 x2 in 2 s (two staggers: down)', w: 'fists', hits: [['chest', 'jab', 4.5], ['chest', 'jab', 4.5, 1.2]] },
  { name: 'fist jaw 2.5 x3 (hits only: stays up)', w: 'fists', hits: [['jaw', 'hook', 2.5], ['jaw', 'hook', 2.5, .6], ['jaw', 'hook', 2.5, .6]] },
  { name: 'pistol-whip head 4.5 (stagger)', w: 'pistol', hits: [['head', 'butt', 4.5]] },
  { name: 'pistol-whip head 7 (knockdown)', w: 'pistol', hits: [['head', 'butt', 7]] },
  { name: 'knife slash 1.0 drawn across (shallow slice)', w: 'knife', hits: [['chest', 'slash', 1.0]] },
  { name: 'knife poke 0.8 point-first (push, no wound)', w: 'knife', hits: [['chest', 'thrust', 0.8]] },
  { name: 'pipe overhead to the head 5 one-handed (drops him)', w: 'pipe', hits: [['head', 'chop', 5]] },
  { name: 'pan face to the head 3 (stagger)', w: 'pan', hits: [['head', 'face', 3]] },
  { name: 'knife forearm slash 2.5 (cut)', w: 'knife', hits: [['farm', 'slash', 2.5]] },
  { name: 'knife belly thrust 3 (stab)', w: 'knife', hits: [['belly', 'thrust', 3]] },
  { name: 'knife chest flat 4 (flat: blunt)', w: 'knife', flat: true, hits: [['chest', 'slash', 4]] },
  { name: 'machete thigh chop 4.5 (deep cut, stagger)', w: 'machete', hits: [['thigh', 'chop', 4.5]] },
  { name: 'machete forearm chop 7 x2 (limb off)', w: 'machete', hits: [['farm', 'chop', 7], ['farm', 'chop', 7, .4]] },
  { name: 'machete neck chop 7', w: 'machete', hits: [['neck', 'slash', 7]] },
];

(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--js-flags=--max-old-space-size=1024'] });
  const p = await b.newPage({ viewport: { width: 320, height: 200 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  p.setDefaultTimeout(0); /* the machine is shared: loading can take a while */
  await p.goto(file + '?' + (process.env.RIG_Q || 'f=1'), { timeout: 300000 }); /* RIG_Q: another query, e.g. "f=1&proto=1&pf=0" */ await p.waitForTimeout(400); await p.click('#start'); await p.waitForTimeout(300);
  await p.evaluate(s => window.__eval(s), IN_PAGE);
  const NEW = await p.evaluate(() => window.__RIG.NEW);
  const out = { new: NEW };
  console.log('melee rig on', path.basename(process.argv[2] || 'index.html'), NEW ? '(new melee)' : '(old melee)');
  if ((mode === 'wall' || mode === 'all') && NEW) { const r = await p.evaluate(() => window.__RIG.wall()); out.wall = r;
    if (r.err) console.log('\nWALLS: ' + r.err); else { console.log(`\nWALLS (each weapon driven into the nearest wall ${JSON.stringify(r.where)}, on 25 cm through it, held there 0.3 s, then pulled back):`);
      for (const [w, x] of Object.entries(r.w)) console.log(`  ${w.padEnd(8)} ` + Object.entries(x).map(([v, q]) => `${v}: wall hits ${q.wallHits}${q.speed ? ' @' + q.speed : ''}, deepest the weapon you see went in ${q.maxDepthCm} cm, on the wall ${q.heldMs} ms, back on your hand ${q.caughtUpMs} ms after pulling out`).join(' | ')); } }
  if ((mode === 'feel' || mode === 'all') && NEW) { const r = await p.evaluate(() => window.__RIG.feel()); out.feel = r;
    console.log('\nFEEL'); console.log('  lag, cm the hand you see trails the real one (steady 4 m/s | 1.2 m/s): ' + Object.entries(r.lag).map(([k, v]) => `${k} ${v.at4}|${v.at1_2}`).join(', '));
    console.log(`  pistol, cm off the real hand moved at 1.5 / 2.5 / 5 m/s: ${JSON.stringify(r.gunGapCm)} (aiming stays 1:1 below 3 m/s)`);
    console.log(`  weapon stop on a 4 m/s jab to the chest: tier ${r.stop.contact}, fist held still ${r.stop.heldFrames} frames (${r.stop.heldMs} ms), real hand up to ${r.stop.gapCm} cm on before it catches up`);
    if (r.stamina) console.log(`  stamina (prototype): after each of 10 hard swings ${r.stamina.afterEachSwing.join(' ')}; after 3 s rest ${r.stamina.after3sRest}; machete lag ${r.stamina.machetLagMs_fresh} ms fresh, ${r.stamina.machetLagMs_tired} ms tired`);
    console.log(`  grab and stab: collar held ${r.grabStab.grabbed}; a 1 m/s knife slash (a push on its own) -> ${r.grabStab.contact || 'none'}, wounds ${r.grabStab.wounds}; a 0.8 m/s thrust (held: ${r.grabStab.heldForThrust}) -> ${r.grabStab.slowThrust || 'none'}`);
    console.log(`  stab depth: stuck ${r.depth.stuck}, depth ${r.depth.depthStart} -> ${r.depth.depthEnd} m pushing on, full wound ${r.depth.full}, wounds ${r.depth.woundsBefore} -> ${r.depth.woundsAfter}, fatal ${r.depth.dead}; pulled back hard: ripped out ${r.depth.rippedOutAfterPull}`);
    console.log(`  flat screen, two clicks at his head with fists: tiers ${r.flat.tiers.join(',')}, down ${r.flat.down}`); }
  if (mode === 'one') { const a = JSON.parse(process.argv[4]); console.log(JSON.stringify(await p.evaluate(a => window.__RIG.one(...a), a))); }
  if (mode === 'reg' || mode === 'all') {
    const t0 = Date.now(); const R = await p.evaluate(([q, w]) => window.__RIG.reg(q, w), [quick, process.env.RIG_W ? process.env.RIG_W.split(',') : null]); /* RIG_W: only these weapons */ out.reg = R;
    const rows = R.rows.filter(r => !r.skip), W = [...new Set(rows.map(r => r.w))], SP = [...new Set(rows.map(r => r.v))].sort((a, b) => a - b);
    const pct = (a) => a.length ? Math.round(100 * a.filter(x => x).length / a.length) : '-';
    console.log('timing: ' + JSON.stringify(R.tm));
    console.log(`\nREGISTRATION (% of swings that registered as a hit, tier >= 1)  [${rows.length} swings, ${R.rows.length - rows.length} skipped, ${((Date.now() - t0) / 1000).toFixed(0)} s]`);
    console.log('weapon    ' + SP.map(v => (v + ' m/s').padStart(9)).join(''));
    for (const w of W) console.log(w.padEnd(10) + SP.map(v => String(pct(rows.filter(r => r.w === w && r.v === v).map(r => r.reg))).padStart(9)).join(''));
    console.log('\nby body part, swings >= 1.5 m/s:');
    const PARTS = [...new Set(rows.map(r => r.part))];
    console.log('weapon    ' + PARTS.map(x => x.padStart(7)).join(''));
    for (const w of W) console.log(w.padEnd(10) + PARTS.map(x => String(pct(rows.filter(r => r.w === w && r.part === x && r.v >= 1.5).map(r => r.reg))).padStart(7)).join(''));
    console.log('\nby swing profile, >= 1.5 m/s: ' + [...new Set(rows.map(r => r.prof))].map(pr => pr + ' ' + pct(rows.filter(r => r.prof === pr && r.v >= 1.5).map(r => r.reg)) + '%').join(', '));
    console.log('by swing type, >= 1.5 m/s: ' + [...new Set(rows.map(r => r.w + ':' + r.type))].map(k => k + ' ' + pct(rows.filter(r => r.w + ':' + r.type === k && r.v >= 1.5).map(r => r.reg)) + '%').join(', '));
    const det = rows.filter(r => r.v < 1.5); console.log(`at 1 m/s: contact detected ${pct(det.map(r => r.det))}%, counted as a hit ${pct(det.map(r => r.reg))}% (should be a push: 0%)`);
    const dbl = rows.filter(r => r.n > 1); console.log(`double contacts in one swing: ${dbl.length} of ${rows.length}`);
    const tm = rows.filter(r => r.reg && r.tier >= 0); if (NEW) { console.log('\nTIER vs nominal speed (first contact; nominal tiers: <1.5 push, 1.5-3.5 hit, 3.5-6 stagger, >=6 heavy):');
      const tierOf = v => v < 1.5 ? 0 : v < 3.5 ? 1 : v < 6 ? 2 : 3; for (const v of SP) { const a = rows.filter(r => r.v === v && r.det); const hist = [0, 1, 2, 3].map(t => a.filter(r => r.tier === t).length);
        const ms = a.filter(r => r.ms != null).map(r => r.ms); console.log(`  ${String(v).padStart(4)} m/s: tiers [push ${hist[0]}, hit ${hist[1]}, stagger ${hist[2]}, heavy ${hist[3]}]  expected ${['push', 'hit', 'stagger', 'heavy'][tierOf(v)]}, match ${pct(a.map(r => r.tier === tierOf(v)))}%, contact speed median ${ms.sort((x, y) => x - y)[ms.length >> 1]}`); } }
    if (NEW) { const a = rows.filter(r => r.det && r.ideal != null), tierOf = v => v < 1.5 ? 0 : v < 3.5 ? 1 : v < 6 ? 2 : 3, near = r => [1.5, 3.5, 6].some(b => Math.abs(r.ideal - b) / b < .12);
      const heavy = r => ['pan', 'pipe', 'cutter', 'hammer', 'pistol'].includes(r.w) && r.kind === 'blunt', light = a.filter(r => !heavy(r));
      { const c = light.filter(r => !near(r)); console.log(`tier vs real contact speed, everything but the clubs (whose weight lands them up to a tier higher by design): match ${pct(c.map(r => r.tier === tierOf(r.ideal)))}% of ${c.length}`); }
      const clean = a.filter(r => !near(r)); console.log(`tier vs the real speed of the point that touched him (ground truth from the scripted path): match ${pct(clean.map(r => r.tier === tierOf(r.ideal)))}% of ${clean.length} (excluding ${a.length - clean.length} within 12% of a boundary; with them ${pct(a.map(r => r.tier === tierOf(r.ideal)))}%)`);
      const ratio = a.map(r => r.ms / r.ideal).sort((x, y) => x - y); console.log(`measured / real contact speed: p10 ${ratio[Math.floor(ratio.length * .1)].toFixed(2)} median ${ratio[ratio.length >> 1].toFixed(2)} p90 ${ratio[Math.floor(ratio.length * .9)].toFixed(2)}`);
      const wrong = clean.filter(r => r.tier !== tierOf(r.ideal)); if (wrong.length) console.log('  off-tier (first 12): ' + wrong.slice(0, 12).map(r => `${r.w}/${r.part}/${r.type}/${r.prof}/${r.v}: real ${r.ideal} measured ${r.ms} -> t${r.tier}${r.kind ? ' ' + r.kind : ''}`).join(', ')); }
    const okp = rows.filter(r => r.okPart != null && r.v >= 1.5); console.log(`hit the part aimed at: ${pct(okp.map(r => r.okPart))}%`);
    const M = R.miss.filter(m => m.cl >= .03), bad = R.miss.length - M.length, fh = M.filter(m => m.n > 0), M5 = M.filter(m => m.cl >= .05), fh5 = M5.filter(m => m.n > 0);
    const cls = M.map(m => m.cl).sort((a, b) => a - b);
    console.log(`\nMISSES (swept 5-10 cm past him, or stopping 5-10 cm short; checked against the drawn weapon and skin, kept if it never comes within 3 cm): ${M.length} valid (${bad} discarded as not clean), clearance min ${cls[0]} m median ${cls[cls.length >> 1]} m, false hits ${fh.length} (${M.length ? (100 * fh.length / M.length).toFixed(1) : 0}%)`);
    console.log(`  of those, ${M5.length} really 5 cm or more clear: false hits ${fh5.length}; ${M.length - M5.length} between 3 and 5 cm: false hits ${fh.length - fh5.length}`);
    if (fh.length) console.log('  false: ' + fh.slice(0, 16).map(m => `${m.w}/${m.part}/${m.type}/${m.clear * 100}cm(real ${Math.round(m.cl * 100)})/${m.v}->t${m.tier}`).join(', '));
    { const big = rows.filter(r => r.v >= 1.5); console.log(JSON.stringify({ melee: 'registration', swings: big.length, registered: big.filter(r => r.reg).length, pct: +(100 * big.filter(r => r.reg).length / Math.max(1, big.length)).toFixed(1),
      misses: M5.length, falseHits: fh5.length, weapons: W })); } /* one line for tools/proto/report.js */
    const fails = rows.filter(r => r.v >= 1.5 && !r.reg); if (fails.length) console.log('\nmissed hits (first 25): ' + fails.slice(0, 25).map(r => `${r.w}/${r.part}/${r.type}/${r.prof}/${r.v}${r.det ? '(t' + r.tier + ' ' + r.ms + ')' : ''}`).join(', '));
  }
  if (mode === 'tier' || mode === 'all') { console.log('\nTIERS on a fresh standing man (real hits, then watched 2.5 s; contacts are tier:part@measured m/s; "pushed back" is the most his pelvis moved in the first 1.2 s):'); out.tier = [];
    for (const c of TIER_CASES) { if (quick && out.tier.length > 8) break; const r = await p.evaluate(c => window.__RIG.tierCase(c), c); out.tier.push(r);
      console.log(`  ${r.name.padEnd(46)} contacts: ${r.hits.padEnd(34)} -> ${r.down ? 'DOWN' : 'up'}${r.dead ? ' DEAD' : ''} stun ${r.stun} pushed back ${r.moved} m wounds ${r.wounds}${r.bleed ? ' bleed ' + r.bleed : ''}${r.cut ? ' CUT ' + r.cut : ''}${r.windedAtHit ? ' winded ' + r.windedAtHit + ' s' : ''}`); } }
  if (mode === 'perf' || mode === 'all') { const r = await p.evaluate(() => window.__RIG.perf()); out.perf = r;
    console.log(`\nPERF, melee code per frame (meleeTick+vrMelee+applySupport for both hands, machete and fist swinging through ${r.men} men within reach, 480 frames; wall clock on a shared, loaded machine):`);
    console.log(`  hit test only (dry, best of 3 runs; means ${r.dry.means.join(', ')}): mean ${r.dry.mean} ms, mean without the slowest 2% ${r.dry.trim}, median ${r.dry.median}, p95 ${r.dry.p95}, contacts ${r.dry.contacts}`);
    console.log(`  with the hits applied (wounds, blood, sound): mean ${r.real.mean} ms, without the slowest 2% ${r.real.trim}, median ${r.real.median}, p95 ${r.real.p95}, contacts ${r.real.contacts}`);
    if (r.skinBuildMs != null) console.log(`  skin index, built once per man as he comes in reach: ${r.skinBuildMs} ms`); }
  if (errs.length) console.log('\nERRORS', JSON.stringify(errs.slice(0, 6)));
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(out));
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
