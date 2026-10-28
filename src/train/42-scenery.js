
/* =====================================================================================================
   SCENERY SYSTEM. The train never moves: the world scrolls past along -x. Every outside surface faces the
   track and is single-sided, so an orbiting camera outside it sees straight through (dollhouse rule).
   Layers: sky cylinder, two ground half-planes, a scrolling verge, then far / mid / near painted strips.
   Real parallax comes from distance; far strips also scroll slower, as if they were kilometres away.
   ===================================================================================================== */
const OUT=N(world);                 /* everything outside the train */
const GROUND_Y=-1.3, RAIL_Y=-1.05;
const scrollers=[];                 /* {n, base, L, k, scene} */
let travel=0;
function planeUV(w,h,flipU){ const g=plane(w,h,1,1); if(flipU) for(let i=0;i<g.T.length;i+=2) g.T[i]=1-g.T[i]; return g; }
function wrapX(v,L){ return ((v+L/2)%L+L)%L-L/2; }
function addScroll(n,base,L,k,scene){ n.p[0]=base; scrollers.push({n,base,L,k,scene}); return n; }

/* shared: rails and sleepers (all scenes), catenary poles (outdoor scenes) */
const TRACK=N(OUT);
(function buildTrack(){
  const mRail=M(null,{color:0x8c9096}), mBase=M(null,{color:0x4a4642});
  for(const z of [-.72,.72]){ mk(box(320,.14,.07),mRail,TRACK,0,RAIL_Y-.07,z); mk(box(320,.06,.14),mBase,TRACK,0,RAIL_Y-.16,z); }
  const sl=M(sleeperTex(),{unlit:true,color:[.85,.85,.85]}), g=planeUV(10,3.4);
  for(let i=0;i<32;i++){ const n=mk(g,sl,TRACK,0,RAIL_Y-.2,0,-Math.PI/2); addScroll(n,(i-16)*10,320,1,'*'); }
})();
const POLES=N(OUT), POLE_ARMS=[];
(function buildPoles(){
  const m=M(null,{color:0x5a5e62}), mw=M(null,{color:0x2a2c2e});
  for(let i=0;i<10;i++){ const side=i%2?1:-1, n=N(POLES,0,0,0); addScroll(n,(i-5)*32,320,1,'poles');
    mk(box(.22,7.6,.22),m,n,0,GROUND_Y+3.8,side*2.75); const arm=N(n); POLE_ARMS.push(arm);
    mk(box(.12,.12,2.9),m,arm,0,GROUND_Y+7.0,side*1.35); mk(box(.06,.5,.06),m,arm,0,GROUND_Y+6.7,0); }
  const wire=mk(box(320,.03,.03),mw,POLES,0,GROUND_Y+6.42,0); POLE_ARMS.push(wire);
})();

/* per-scene content, painted and built the first time the scene is shown */
const SCN={};
function buildScene(key){
  const S=SCENES[key], root=N(OUT), seed=key.length*131;
  const sc={key,root,S,petals:[]};
  /* sky */
  if(!S.tunnel){ const [stops,o]=S.sky(); const sky=mk(cyl(92,92,130,28,{open:true}),M(skyTex(stops,o),{unlit:true,double:true,repeat:[4,1]}),root,0,40,0); sky.mesh.geo.noCull=true; sc.sky=sky;
    sc.cap=mk(plane(200,200),M(null,{unlit:true,color:hexInt(S.top)}),root,0,104,0,Math.PI/2); }
  /* ground, one half-plane per side; water sits a little lower */
  for(const side of ['pos','neg']){ const s=side==='pos'?1:-1, y=(S.groundY&&S.groundY[side])??GROUND_Y-.02;
    const col=S.ground[side], water=y<GROUND_Y-.1;
    const t=water?P2(64,64,(g,w,h)=>{ R(g,col,0,0,w,h); const r=rng(5); for(let i=0;i<70;i++) R(g,rgba('#ffffff',.18+r()*.2),r()*w|0,r()*h|0,3+(r()*5|0),1); },6,5):flatTex(col,seed+s);
    mk(plane(400,200),M(t,{unlit:true,repeat:[60,30]}),root,0,y,s*100,-Math.PI/2); }
  /* verge: the strip from the ballast to the near layer, scrolling at full speed */
  for(const side of ['pos','neg']){ const s=side==='pos'?1:-1, vt=M(vergeTex(S.verge[side]),{unlit:true}), g=planeUV(20,9,s>0);
    for(let i=0;i<14;i++){ const n=mk(g,vt,root,0,GROUND_Y+.01,s*6.4,-Math.PI/2); addScroll(n,(i-7)*20,280,1,key); }
    /* ballast shoulder */
    const bt=M(sleeperTex(),{unlit:true,color:[.7,.7,.7]}), gb=planeUV(10,1.8);
    for(let i=0;i<28;i++){ const n=mk(gb,bt,root,0,GROUND_Y+.02,s*1.95,-Math.PI/2); addScroll(n,(i-14)*10,280,1,key); } }
  if(S.tunnel) buildTunnel(sc);
  else {
    /* far / mid / near strips */
    const spec=[[60,30,80,4,.07],[26,15,40,6,.4],[9.4,7.5,20,12,1]];
    for(const side of ['pos','neg']){ const s=side==='pos'?1:-1;
      spec.forEach(([z,h,tw,count,k],li)=>{
        const painter=S.layers[side][li], mats=[0,1].map(v=>M(P2(LW,LH,(g,w,h_)=>painter(g,w,h_,rng(seed+li*17+v*5+(s>0?100:0)),v),0,1),{unlit:true,cut:true}));
        const g=planeUV(tw,h,s>0), yb=li===0?GROUND_Y-1.2:GROUND_Y;
        for(let i=0;i<count;i++){ const n=mk(g,mats[(i+(s>0?1:0))%2],root,0,yb+h/2,s*z,0,s>0?Math.PI:0,0); addScroll(n,(i-count/2)*tw+(s>0?tw*.37:0),tw*count,k,key); } });
    }
  }
  if(S.petals){ const pm=M(null,{unlit:true,double:true,color:0xffc8d8}), pg=plane(.07,.05), r=rng(41);
    for(let i=0;i<70;i++){ const n=mk(pg,pm,root,0,GROUND_Y+.5+r()*6,(r()-.5)*24); sc.petals.push({n,base:(r()-.5)*90,ph:r()*6.28,sp:.7+r()*.5,y0:n.p[1]}); } }
  root.vis=false; SCN[key]=sc; return sc;
}
function buildTunnel(sc){
  const root=sc.root, wall=P2(64,64,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#2a2724'],[1,'#3a3532']]); const r=rng(9); for(let i=0;i<300;i++) R(g,r()>.5?'#45403b':'#1e1c1a',r()*w|0,r()*h|0,2,1); R(g,'#151312',0,0,1,h); R(g,'#4a453f',0,h-10,w,2); },8,9);
  const mw=M(wall,{repeat:[2,3]}), lamp=M(null,{unlit:true,color:0xffb050}), cable=M(null,{color:0x111111});
  /* a tunnel bore: a long open cylinder lying along x, faces inward */
  const bore=lathe([[-4.4,4.4,4.4],[4.4,4.4,4.4]],16,{capB:false,capT:false}); for(let i=0;i<bore.I.length;i+=3){ const t=bore.I[i+1]; bore.I[i+1]=bore.I[i+2]; bore.I[i+2]=t; } smoothNormals(bore); /* faces inward: from outside you see straight in */
  for(let i=0;i<10;i++){ const seg=N(root,0,0,0); addScroll(seg,(i-5)*30,300,1,sc.key);
    const b=mk(bore,mw,seg,0,GROUND_Y+3.2,0,0,0,Math.PI/2); b.s=[1,3.42,1]; b.mesh.mats[0]=M(wall,{repeat:[6,2],unlit:true,color:[.62,.56,.5]});
    for(const s of [-1,1]){ mk(box(.5,.12,.08),lamp,seg,-6,GROUND_Y+3.4,s*4.1); mk(box(.5,.12,.08),lamp,seg,9,GROUND_Y+3.4,s*4.1); mk(box(30,.05,.05),cable,seg,0,GROUND_Y+2.6,s*4.15); } }
}
let curScene=null;
function setScene(key){ const sc=SCN[key]||buildScene(key); if(curScene) curScene.root.vis=false; sc.root.vis=true; curScene=sc; POLES.vis=!sc.S.tunnel; return sc; }
function updateOut(dt,speed,camX){
  travel+=dt*speed;
  for(const s of scrollers){ if(s.scene!=='*'&&s.scene!=='poles'&&(!curScene||s.scene!==curScene.key)) continue; s.n.p[0]=wrapX(s.base-travel*s.k,s.L); }
  if(curScene){ if(curScene.sky){ curScene.sky.p[0]=camX; curScene.cap.p[0]=camX; }
    const t=performance.now()/1000; for(const p of curScene.petals){ p.n.p[0]=camX+wrapX(p.base-travel*.9+Math.sin(t*p.sp+p.ph)*.6-camX,90); p.n.p[1]=p.y0+Math.sin(t*1.3*p.sp+p.ph)*.4; p.n.r=[t*2.1*p.sp+p.ph,t*1.7+p.ph,t*.9]; } }
}
