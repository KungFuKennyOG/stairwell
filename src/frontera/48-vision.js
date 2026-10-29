
/* =====================================================================================================
   SEEING IN THE DARK: four ways to look at any scene.
   Lights on   – the scene as lit.
   Lights cut  – every lamp, bulb and screen off: what Ray sees with his own eyes after he kills the power.
   Night vision – the cut scene amplified: green phosphor, grain, an IR torch on the goggles (invisible to them),
                  bright sources bloom. No vignette, ever: the goggles' edge is not drawn.
   Thermal     – heat, not light: everything is redrawn as a temperature (people hot, faces hottest, guns and
                  walls cold), then mapped through an ironbow palette. Sees people in pitch black, can't read faces.
   All of it is a material swap plus one post pass, so it costs the same as the normal render on the Quest.
   ===================================================================================================== */
const NVFS=`#version 300 es
precision highp float;
uniform sampler2D tScene; uniform vec2 uRes; uniform float uTime, uGain, uDither, uFlash;
in vec2 vUv; out vec4 outColor;
float hsh(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float bayer2(vec2 a){ a=floor(a); return fract(dot(a,vec2(.5,a.y*.75))); }
float bayer4(vec2 a){ return bayer2(.5*a)*.25+bayer2(a); }
void main(){ vec2 px=floor(vUv*uRes); vec3 c=texture(tScene,(px+.5)/uRes).rgb; float l=dot(c,vec3(.3,.59,.11));
  float g=1.0-exp(-l*uGain);
  float b=0.0; for(int i=-2;i<=2;i++) for(int j=-2;j<=2;j++){ vec3 s=texture(tScene,(px+vec2(float(i),float(j))*1.6+.5)/uRes).rgb; b+=max(0.0,dot(s,vec3(.33))-.5); }
  g+=b*.09; g+=(hsh(px+floor(uTime*24.0)*7.31)-.5)*.17; g*=.94+.06*mod(px.y,2.0);
  vec3 col=mix(vec3(.01,.035,.015),vec3(.42,.95,.38),clamp(g,0.0,1.0)); col=mix(col,vec3(.9,1.0,.86),clamp((g-.82)*3.0,0.0,1.0)); col=mix(col,vec3(.5,0.0,0.0),uFlash);
  if(uDither>.5){ float L=31.0; col+=(bayer4(px)-.5)/L; col=floor(col*L+.5)/L; }
  outColor=vec4(clamp(col,0.0,1.0),1.0); }`;
const THFS=`#version 300 es
precision highp float;
uniform sampler2D tScene; uniform vec2 uRes; uniform float uTime, uDither, uFlash;
in vec2 vUv; out vec4 outColor;
float hsh(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float bayer2(vec2 a){ a=floor(a); return fract(dot(a,vec2(.5,a.y*.75))); }
float bayer4(vec2 a){ return bayer2(.5*a)*.25+bayer2(a); }
vec3 ironbow(float t){ t=clamp(t,0.0,1.0);
  vec3 a=vec3(.02,.0,.06), b=vec3(.22,.02,.48), c=vec3(.72,.06,.46), d=vec3(.98,.42,.04), e=vec3(1.0,.9,.42), f=vec3(1.0,1.0,.96);
  if(t<.22) return mix(a,b,t/.22); if(t<.45) return mix(b,c,(t-.22)/.23); if(t<.66) return mix(c,d,(t-.45)/.21); if(t<.86) return mix(d,e,(t-.66)/.2); return mix(e,f,(t-.86)/.14); }
void main(){ vec2 px=floor(vUv*uRes); float s=0.0, w=0.0;
  for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++){ float k=(i==0&&j==0)?4.0:1.0; s+=dot(texture(tScene,(px+vec2(float(i),float(j))+.5)/uRes).rgb,vec3(.33))*k; w+=k; }
  float t=s/w; t+=(hsh(px+floor(uTime*12.0)*3.7)-.5)*.035;
  vec3 col=ironbow(t); col=mix(col,vec3(.5,0.0,0.0),uFlash);
  if(uDither>.5){ float L=31.0; col+=(bayer4(px)-.5)/L; col=floor(col*L+.5)/L; }
  outColor=vec4(clamp(col,0.0,1.0),1.0); }`;
const NVP=program(PVS,NVFS), THP=program(PVS,THFS);

/* ---------- heat: which surfaces are warm ---------- */
function heatTag(n,v){ (function walk(q){ if(q.mesh) q._heat=v; for(const k of q.kids) walk(k); })(n); return n; }
function tagHeat(C){ const J=C.J, cold=new Set(), hand=new Set();
  const mark=(n,set)=>{ if(!n) return; (function w(q){ set.add(q); for(const k of q.kids) w(k); })(n); };
  mark(C.wpn,cold); mark(C.dropped,cold); for(const k of ['openL','openR','wrapL','wrapR']) mark(J[k],hand);
  (function walk(q,underHead){ if(q.mesh){ if(q===J.body) q._heatArr=[.8,.86,.86,.72,.72]; else if(q===J.headMesh) q._heat=1.0; else if(cold.has(q)) q._heat=.2; else if(hand.has(q)) q._heat=.93; else q._heat=underHead?.8:.5; }
    for(const k of q.kids) walk(k,underHead||q===J.head); })(J.root,false); }
const lum=c=>c[0]*.3+c[1]*.59+c[2]*.11;
const SWAP=new Map(); function swapM(key,make){ if(!SWAP.has(key)) SWAP.set(key,make()); return SWAP.get(key); }
function heatOf(n,m,i){ if(n._heatArr) return n._heatArr[i]??.8; if(n._heat!=null) return n._heat;
  if(m.tex===tFire) return 1; if(m.tex===tScreenTV||m.tex===tScreenSec) return .55; if(m.tex===tWater) return .08;
  if(m.unlit) return m.tex?.75:.95; return null; }
function thermalMat(n,m,i){ const h=heatOf(n,m,i);
  if(h!=null) return swapM('h'+h.toFixed(2)+(m.cut?'c'+tid(m.tex):''),()=>M(m.cut?m.tex:null,{unlit:true,color:[h,h,h],cut:!!m.cut,double:m.dbl}));
  const v=m.tex?.27:Math.min(.32,lum(m.color)*.34+.08); return swapM('e'+(m.tex?tid(m.tex):'n')+v.toFixed(2)+(m.cut?'c':'')+(m.dbl?'d':''),()=>M(m.tex,{unlit:true,color:m.tex?[v*m.color[0],v*m.color[1],v*m.color[2]]:[v,v,v],cut:!!m.cut,double:m.dbl,repeat:m.rep})); }
function darkMat(n,m){ if(!m.unlit) return m; return swapM('d'+(m.tex?tid(m.tex):'n')+m.color.join(),()=>M(m.tex,{color:[m.color[0]*.12,m.color[1]*.12,m.color[2]*.12],cut:!!m.cut,double:m.dbl,repeat:m.rep})); }
/* swap every material under a root for a mode, or put the originals back */
function applyMode(root,mode){ (function walk(n){ if(n._keep) return; if(n.mesh){ const me=n.mesh; if(!me._orig) me._orig=me.mats.slice();
      if(mode==='thermal') me.mats=me._orig.map((m,i)=>thermalMat(n,m,i)); else if(mode==='cut'||mode==='nv') me.mats=me._orig.map(m=>darkMat(n,m)); else me.mats=me._orig.slice(); me.runs=null; }
    for(const k of n.kids) walk(k); })(root); }
/* faces change with poses: keep the head in the mode after a pose change */
function remode(C,mode){ const me=C.J.headMesh.mesh; me._orig=[me.mats[0]]; if(mode!=='lit') applyMode(C.J.headMesh,mode); }
