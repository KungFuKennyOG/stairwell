/* =====================================================================================================
   THE FAR FIELD: stand-ins for everything past the near ring, so a big night level shows all the way out (rooflines, lit windows,
   neon, the pools under the street lamps) instead of ending in a black wall of fog.
   Built once from a level's merged static meshes (meshMerge, 16 m tiles):
     - every surface is kept as plain flat-coloured triangles (big ones split so the lamp pools land where they should); its colour
       is the average of its texture times its material, with the level's lights baked in (all of them, not just the nearest six)
     - the whole level is one or two meshes, one texture: a texel per triangle, so a different bake (generator cut, thermal) is
       just a new texture, never new geometry
     - each triangle carries the sphere of the tile it came from (aRect). A real tile is drawn while that sphere is within swapD
       of your head (culled() in 10-engine.js); its stand-ins show only past it (the vertex shader), so the two never overlap
   Decals (tags, stains, shadows: cut-out and one-sided) and crumbs (under ~5 cm²) are left out: at that range they're a pixel.
   ===================================================================================================== */
const FAR_TILE_SPLIT=3.0; /* metres: longer edges get split so the baked light has somewhere to land */
function texPx(t){ if(t._px) return t._px; const c=t.c,w=c.width,h=c.height; let d; try{ d=c.getContext('2d').getImageData(0,0,w,h).data; }catch(e){ d=null; } return t._px={w,h,d}; }
/* the mean colour (rgb, alpha) of a texture over a uv rectangle, alpha-weighted. uv as the shader sees it (v up: the canvas is flipped on upload) */
function texMeanRect(t,u0,v0,u1,v1){ const P=texPx(t); if(!P.d) return [1,1,1,1]; const k=[u0,v0,u1,v1].map(v=>v.toFixed(4)).join(','),C=t._mean||(t._mean=new Map()); if(C.has(k)) return C.get(k);
  const x0=Math.max(0,Math.floor(u0*P.w)),x1=Math.min(P.w,Math.max(x0+1,Math.ceil(u1*P.w))),y0=Math.max(0,Math.floor((1-v1)*P.h)),y1=Math.min(P.h,Math.max(y0+1,Math.ceil((1-v0)*P.h)));
  let r=0,g=0,b=0,a=0,n=0; const step=Math.max(1,Math.floor(Math.sqrt((x1-x0)*(y1-y0)/4096)));
  for(let y=y0;y<y1;y+=step) for(let x=x0;x<x1;x+=step){ const i=(y*P.w+x)*4,al=P.d[i+3]/255; r+=P.d[i]*al; g+=P.d[i+1]*al; b+=P.d[i+2]*al; a+=al; n++; }
  const out=a>0?[r/a/255,g/a/255,b/a/255,a/n]:[0,0,0,0]; C.set(k,out); return out; }
function texAt(t,u,v){ const P=texPx(t); if(!P.d) return [1,1,1,1]; u=u-Math.floor(u); v=v-Math.floor(v); const x=Math.min(P.w-1,u*P.w|0),y=Math.min(P.h-1,(1-v)*P.h|0),i=(y*P.w+x)*4; return [P.d[i]/255,P.d[i+1]/255,P.d[i+2]/255,P.d[i+3]/255]; }

/* build it: root is the level's merged static (its direct mesh kids carry tileKey), o.swapD where the stand-ins take over,
   o.drawD how far anything else (doors, things lying about) is still drawn */
function buildFarField(root,o={}){
  updateWorld(world,null); for(const t of [ATLAS.t,PAL&&PAL.t]) if(t){ t._px=null; t._mean=null; } /* the atlas and the palette grow as levels load: read them fresh */
  const metas=[],sph=new Map();
  for(const n of root.kids){ const g=n.mesh&&n.mesh.geo; if(!g||g.tileKey==null||!g.I.length) continue; const W=n.world;
    let s=sph.get(g.tileKey); if(!s) sph.set(g.tileKey,s={lo:[1e9,1e9,1e9],hi:[-1e9,-1e9,-1e9]});
    for(let i=0;i<g.P.length;i+=3){ const x=W[0]*g.P[i]+W[4]*g.P[i+1]+W[8]*g.P[i+2]+W[12],y=W[1]*g.P[i]+W[5]*g.P[i+1]+W[9]*g.P[i+2]+W[13],z=W[2]*g.P[i]+W[6]*g.P[i+1]+W[10]*g.P[i+2]+W[14];
      if(x<s.lo[0])s.lo[0]=x; if(y<s.lo[1])s.lo[1]=y; if(z<s.lo[2])s.lo[2]=z; if(x>s.hi[0])s.hi[0]=x; if(y>s.hi[1])s.hi[1]=y; if(z>s.hi[2])s.hi[2]=z; }
    metas.push(n); }
  for(const s of sph.values()){ s.c=[(s.lo[0]+s.hi[0])/2,(s.lo[1]+s.hi[1])/2,(s.lo[2]+s.hi[2])/2]; s.r=Math.hypot(s.hi[0]-s.lo[0],s.hi[1]-s.lo[1],s.hi[2]-s.lo[2])/2; }
  /* every triangle: where, which way it faces, its own colour (unlit), whether it glows, and its tile */
  const TP=[],TA=[],TF=[],TS=[]; /* positions (9 per tri), albedo rgb + normal xyz + flags per tri, tile sphere per tri */
  const push=(a,b,c,col,nrm,fl,s)=>{ TP.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]); TA.push(col[0],col[1],col[2],nrm[0],nrm[1],nrm[2]); TF.push(fl); TS.push(s.c[0],s.c[1],s.c[2],s.r); };
  const split=(a,b,c,col,nrm,fl,s,depth)=>{ const ab=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),bc=Math.hypot(b[0]-c[0],b[1]-c[1],b[2]-c[2]),ca=Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]),L_=Math.max(ab,bc,ca);
    if(L_<=FAR_TILE_SPLIT||depth>5){ push(a,b,c,col,nrm,fl,s); return; } const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2];
    if(L_===ab){ const m=mid(a,b); split(a,m,c,col,nrm,fl,s,depth+1); split(m,b,c,col,nrm,fl,s,depth+1); }
    else if(L_===bc){ const m=mid(b,c); split(a,b,m,col,nrm,fl,s,depth+1); split(a,m,c,col,nrm,fl,s,depth+1); }
    else { const m=mid(c,a); split(a,b,m,col,nrm,fl,s,depth+1); split(m,b,c,col,nrm,fl,s,depth+1); } };
  for(const n of metas){ const g=n.mesh.geo,W=n.world,s=sph.get(g.tileKey),m=n.mesh.mats[0];
    if(!m||m.nofog) continue; if(m.cut&&!m.dbl&&!m.unlit) continue; /* decals */
    const fl=(m.unlit?1:0)|(n._keep?2:0)|(m.dbl?4:0), heat=n._heat;
    const wp=v=>{ const x=g.P[v*3],y=g.P[v*3+1],z=g.P[v*3+2]; return [W[0]*x+W[4]*y+W[8]*z+W[12],W[1]*x+W[5]*y+W[9]*z+W[13],W[2]*x+W[6]*y+W[10]*z+W[14]]; };
    for(let i=0;i<g.I.length;i+=3){ const ia=g.I[i],ib=g.I[i+1],ic=g.I[i+2],a=wp(ia),b=wp(ib),c=wp(ic);
      const cr=v3.cross(v3.sub(b,a),v3.sub(c,a)),ar=Math.hypot(...cr)/2; if(ar<.0005) continue; const nrm=v3.sc(cr,1/(2*ar));
      let tc=[1,1,1,1];
      if(m.tex){ const R=g.R;
        if(R&&R[ia*4+2]>0) tc=texMeanRect(m.tex,R[ia*4],R[ia*4+1],R[ia*4]+R[ia*4+2],R[ia*4+1]+R[ia*4+3]); /* a tiled texture in the atlas: its whole tile */
        else { const T=g.T,us=[T[ia*2],T[ib*2],T[ic*2]],vs=[T[ia*2+1],T[ib*2+1],T[ic*2+1]];
          if(Math.max(...us)-Math.min(...us)>1||Math.max(...vs)-Math.min(...vs)>1) tc=texMeanRect(m.tex,0,0,1,1); /* tiled in its own texture: its average */
          else { const S=[[1/3,1/3,1/3],[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.5,.5],[.5,0,.5]]; let r=0,gg=0,bb=0,al=0;
            for(const w of S){ const q=texAt(m.tex,w[0]*us[0]+w[1]*us[1]+w[2]*us[2],w[0]*vs[0]+w[1]*vs[1]+w[2]*vs[2]); r+=q[0]*q[3]; gg+=q[1]*q[3]; bb+=q[2]*q[3]; al+=q[3]; }
            tc=al>0?[r/al,gg/al,bb/al,al/S.length]:[0,0,0,0]; } } }
      if(tc[3]<.3) continue; /* mostly see-through (a cut-out's empty part) */
      const col=[tc[0]*m.color[0]+tc[0]*m.emis[0],tc[1]*m.color[1]+tc[1]*m.emis[1],tc[2]*m.color[2]+tc[2]*m.emis[2]];
      split(a,b,c,heat!=null?[heat,heat,-1]:col,nrm,fl,s,0); } }
  /* geometry: three corners of their own per triangle, every corner pointing at the triangle's texel */
  const NT=TF.length,TW=1024,TH=Math.max(8,1<<Math.ceil(Math.log2(Math.max(1,Math.ceil(NT/TW))))),cv=document.createElement('canvas'); cv.width=TW; cv.height=TH;
  const tex={c:cv,glt:null,f:-1,dyn:true}, mat=M(tex,{unlit:true}); mat.far=true;
  const RW=root.world,node=N(root,-RW[12],-RW[13],-RW[14]); /* built in world space: undo the root's offset */ node._keep=true; node.live=true; /* live: never merged again, never swapped by the vision modes (it has its own bakes) */
  const prev=GEO_TEMP; GEO_TEMP=true; const PER=21000;
  for(let t0=0;t0<NT;t0+=PER){ const g=new Geo(),t1=Math.min(NT,t0+PER); g.R=[];
    for(let t=t0;t<t1;t++){ const u=((t%TW)+.5)/TW,v=1-(((t/TW)|0)+.5)/TH;
      for(let k=0;k<3;k++){ g.P.push(TP[t*9+k*3],TP[t*9+k*3+1],TP[t*9+k*3+2]); g.Nm.push(TA[t*6+3],TA[t*6+4],TA[t*6+5]); g.T.push(u,v); g.R.push(TS[t*4],TS[t*4+1],TS[t*4+2],TS[t*4+3]); g.I.push(g.P.length/3-1); } }
    g.groups=[{start:0,count:g.I.length,mi:0}]; g.noDist=true; mk(g,mat,node); }
  GEO_TEMP=prev;
  /* the real tiles: drawn by the same sphere their stand-ins use */
  for(const n of metas){ const s=sph.get(n.mesh.geo.tileKey); n.mesh.geo.dsph={c:s.c,r:s.r}; }
  FLOOR.far={node,tex,TP,TA,TF,N:NT,lights:(LM.list||[]).filter(l=>l.pow!=='torch').slice(),swapD:o.swapD||22,drawD:o.drawD||34,key:null};
  return {tris:NT,meshes:Math.ceil(NT/PER)}; }

/* bake the colours for how things are right now: generator on or off, thermal or not. Only when that changes */
function farTick(){ const F=FLOOR.far; if(!F||!inWorld(F.node)) return; const mode=visionMode(),key=mode+'|'+(FLOOR.power!==false)+'|'+L.amb.join();
  if(F.key===key) return; F.key=key; farBake(F,mode); }
function farBake(F,mode){ const on=FLOOR.power!==false,cut=mode==='cut',th=mode==='thermal',ls=F.lights.filter(l=>on||l.pow!=='gen'),dd=norm3(L.dirDir);
  const g=F.tex.c.getContext('2d'),W=F.tex.c.width,H=F.tex.c.height,img=g.createImageData(W,H),D=img.data,TP=F.TP,TA=F.TA,TF=F.TF;
  for(let t=0;t<F.N;t++){ const fl=TF[t],unlit=fl&1,keep=fl&2,dbl=fl&4,a=TA[t*6],b=TA[t*6+1],c=TA[t*6+2]; let r,gg,bb;
    if(c<0){ /* heat-tagged (it runs warm): thermal shows its heat, otherwise a neutral grey */ const h=a; if(th){ r=gg=bb=h; } else { r=gg=bb=.06; } }
    else if(th){ const v=unlit&&keep?.3:.27; r=a*v; gg=b*v; bb=c*v; } /* thermal: everything cold, lit or not */
    else if(unlit&&!(cut&&!keep)){ r=a; gg=b; bb=c; } /* it glows: lit windows, neon, the TV, bulbs */
    else { /* lit by the moon and every lamp in the level (the near ring only ever gets the six nearest) */
      const k=unlit?.12:1,x=(TP[t*9]+TP[t*9+3]+TP[t*9+6])/3,y=(TP[t*9+1]+TP[t*9+4]+TP[t*9+7])/3,z=(TP[t*9+2]+TP[t*9+5]+TP[t*9+8])/3,nx=TA[t*6+3],ny=TA[t*6+4],nz=TA[t*6+5];
      const ndl=nx*dd[0]+ny*dd[1]+nz*dd[2]; let lr=L.amb[0]+L.dirCol[0]*Math.max(dbl?Math.abs(ndl):ndl,0),lg=L.amb[1]+L.dirCol[1]*Math.max(dbl?Math.abs(ndl):ndl,0),lb=L.amb[2]+L.dirCol[2]*Math.max(dbl?Math.abs(ndl):ndl,0);
      for(const l of ls){ const dx=l.p[0]-x,dy=l.p[1]-y,dz=l.p[2]-z,dist=Math.hypot(dx,dy,dz); if(dist>=l.d) continue; let at=1-dist/l.d; at*=at; let nd=(nx*dx+ny*dy+nz*dz)/Math.max(dist,1e-4); nd=dbl?Math.abs(nd):Math.max(nd,0); const q=at*nd; lr+=l.c[0]*q; lg+=l.c[1]*q; lb+=l.c[2]*q; }
      r=a*k*lr; gg=b*k*lg; bb=c*k*lb; }
    const i=(((t/W)|0)*W+(t%W))*4; D[i]=Math.min(255,r*255); D[i+1]=Math.min(255,gg*255); D[i+2]=Math.min(255,bb*255); D[i+3]=255; }
  g.putImageData(img,0,0); if(F.tex.glt){ gl.deleteTexture(F.tex.glt); F.tex.glt=null; } }
