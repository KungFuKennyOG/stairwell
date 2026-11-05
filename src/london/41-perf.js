/* ---------- PERF: what lets one hub be ten times the street ----------
   1. bakeStatic(root): every static mesh under root is copied into world space and merged, per material, into 24 m chunks, so the
      hub draws as a few hundred chunk meshes instead of tens of thousands of boxes. Anything that moves, hides or animates is
      marked n.dyn=true where it is made and is left alone (with its subtree). Merged meshes keep the material objects, so a material
      that changes colour at run time (beacons, hazards) still blinks.
   2. lightsNear(src,eye): the shader takes 8 point lights. The hub has dozens; each frame the nearest 8 (by distance minus reach)
      are sent, and the ones near the cut-off fade out as the next one comes in, so nothing pops.
   3. renderLDN(): the engine's renderScene plus frustum and fog-distance culling (London never culled before; the street was small). */
const CHUNK=24, BAKED=N(world);
function bakeStatic(root){ updateWorld(world,null); const buckets=new Map(), mid=new Map(); let nMesh=0;
  const keyOf=m=>{ if(!mid.has(m)) mid.set(m,mid.size); return mid.get(m); };
  function bucket(m,cx,cz,nv){ const k=keyOf(m)+'|'+cx+'|'+cz; let list=buckets.get(k); if(!list){ list=[]; buckets.set(k,list); }
    let b=list[list.length-1]; if(!b||b.n+nv>65000){ b={m,n:0,P:[],Nm:[],T:[],R:[],I:[],hasR:false}; list.push(b); } return b; }
  function walk(n){ if(!n.vis||n.dyn) return;
    if(n.mesh){ const g=n.mesh.geo; const runs=runsOf(n.mesh);
      if(!g.skin&&!g.temp&&g.P.length&&runs.every(r=>!r.m.far&&!r.m.nofog)){
        const w=n.world, b=geoBounds(g), c=b.c, wx=w[0]*c[0]+w[4]*c[1]+w[8]*c[2]+w[12], wz=w[2]*c[0]+w[6]*c[1]+w[10]*c[2]+w[14];
        const cx=Math.floor(wx/CHUNK), cz=Math.floor(wz/CHUNK), nv=g.P.length/3;
        for(const run of runs){ const B=bucket(run.m,cx,cz,nv), base=B.n, map=new Map();
          for(let i=run.start;i<run.start+run.count;i++){ const vi=g.I[i]; let o=map.get(vi);
            if(o===undefined){ o=B.n++; map.set(vi,o); const x=g.P[vi*3],y=g.P[vi*3+1],z=g.P[vi*3+2], a=g.Nm[vi*3],bb=g.Nm[vi*3+1],cc=g.Nm[vi*3+2];
              B.P.push(w[0]*x+w[4]*y+w[8]*z+w[12], w[1]*x+w[5]*y+w[9]*z+w[13], w[2]*x+w[6]*y+w[10]*z+w[14]);
              let nx=w[0]*a+w[4]*bb+w[8]*cc, ny=w[1]*a+w[5]*bb+w[9]*cc, nz=w[2]*a+w[6]*bb+w[10]*cc; const l=Math.hypot(nx,ny,nz)||1; B.Nm.push(nx/l,ny/l,nz/l);
              B.T.push(g.T[vi*2],g.T[vi*2+1]); if(g.R){ B.hasR=true; B.R.push(g.R[vi*4],g.R[vi*4+1],g.R[vi*4+2],g.R[vi*4+3]); } else B.R.push(0,0,0,0); }
            B.I.push(o); } }
        n.mesh=null; nMesh++; } }
    for(const k of n.kids.slice()) walk(k); }
  walk(root); let nOut=0;
  for(const list of buckets.values()) for(const B of list){ if(!B.I.length) continue; const g=new Geo(); g.P=B.P; g.Nm=B.Nm; g.T=B.T; if(B.hasR) g.R=B.R; g.I=B.I; mk(g,B.m,BAKED); nOut++; }
  return {meshes:nMesh, chunks:nOut}; }

function lightsNear(src,eye){ const all=src.pl, sc=[];
  for(let i=0;i<all.length;i++){ const p=all[i][0]; sc.push([Math.hypot(p[0]-eye[0],p[1]-eye[1],p[2]-eye[2])-all[i][2]*.6,i]); }
  sc.sort((a,b)=>a[0]-b[0]); const cut=sc.length>8?sc[8][0]:1e9, pl=[];
  for(let k=0;k<Math.min(8,sc.length);k++){ const [d,i]=sc[k], f=Math.min(1,Math.max(0,(cut-d)/6)), L_=all[i]; pl.push([L_[0],[L_[1][0]*f,L_[1][1]*f,L_[1][2]*f],L_[2]]); }
  return {amb:src.amb,dir:src.dir,dirCol:src.dirCol,fog:src.fog,fogNear:src.fogNear,fogFar:src.fogFar,pl}; }

/* the engine's renderScene, culling on: the fog swallows everything past fogFar, so nothing past it is drawn */
const PERF={draws:0,tris:0};
function eyeOfView(v){ return [-(v[0]*v[12]+v[1]*v[13]+v[2]*v[14]), -(v[4]*v[12]+v[5]*v[13]+v[6]*v[14]), -(v[8]*v[12]+v[9]*v[13]+v[10]*v[14])]; }
function renderLDN(root,eye,target,w,h,snapRes){
  m4.persp(proj,50*Math.PI/180,w/h,0.05,120); proj[8]=-viewShift[0]; proj[9]=-viewShift[1]; m4.lookAt(view,eye,target,[0,1,0]);
  drawWorldLDN(root,w,h,eye); }
function drawWorldLDN(root,w,h,eye){ updateWorld(root,null);
  gl.viewport(0,0,w,h); gl.clearColor(L.fog[0],L.fog[1],L.fog[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST); gl.useProgram(MAIN.p); curCull=null; curMat=null; curTex=null; gl.activeTexture(gl.TEXTURE0); const u=MAIN.loc;
  gl.uniformMatrix4fv(u.viewMatrix,false,view); gl.uniformMatrix4fv(u.projectionMatrix,false,proj);
  gl.uniform1f(u.uSnap,state.ps1&&state.snap?1:0); gl.uniform1f(u.uAffine,state.ps1&&state.affine?1:0); gl.uniform2f(u.uRes,w,h);
  gl.uniform3fv(u.uAmb,L.amb); gl.uniform3fv(u.uDirDir,L.dirDir); gl.uniform3fv(u.uDirCol,L.dirCol);
  gl.uniform3fv(u.uPLPos,L.plPos); gl.uniform3fv(u.uPLCol,L.plCol); gl.uniform1fv(u.uPLDist,L.plDist);
  gl.uniform3fv(u.uFogCol,L.fog); gl.uniform1f(u.uFogNear,L.fogNear); gl.uniform1f(u.uFogFar,L.fogFar); gl.uniform1i(u.map,0); if(u.uSkyFade) gl.uniform1f(u.uSkyFade,0);
  setCull(eye||eyeOfView(view),L.fogFar+4); drawTree(root); cullOn=false; gl.bindVertexArray(null); }
