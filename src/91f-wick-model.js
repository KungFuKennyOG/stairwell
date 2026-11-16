/* =====================================================================
   WICK: imported bodies. A modelled, UV-mapped, photo-textured low-poly character (the late-PSX look: Silent Hill, not painted
   tubes) on the tower's 16 joints, so poses, guns and (later) the body physics still drive it.
   The data (WKMD, in 91g-wick-model-data.js) is made by a converter from rigged models: positions in metres, normals, uvs, two of
   our bones per vertex, and where its joints are. This file is only the loader; without the data file nothing here runs.
   ===================================================================== */
const WKMT={};
function wkModelTex(url,size=256){ const c=document.createElement('canvas'); c.width=c.height=size; const t={c,glt:null,f:-1},im=new Image();
  im.onload=()=>{ c.getContext('2d').drawImage(im,0,0,size,size); if(t.glt){ gl.deleteTexture(t.glt); t.glt=null; } }; im.src=url; return t; }
function wkModelChar(key,parent,grp='wick',gear={}){ const D=WKMD[key],o=Object.assign(baseMats('gunman'),{hf:1,w:1,torsoM:M(null),armM:M(null),legM:M(null),footM:M(null)});
  const J=rig(o,parent),isJ=new Set(BONES.map(b=>J[b])); J.body.vis=false;
  const strip=n=>{ n.mesh=null; n.kids.forEach(strip); }; for(const b of BONES) for(const k of J[b].kids) if(!isJ.has(k)) strip(k); /* the tower's head, hands and shoes: the nodes stay for the game's code (it shows and hides them), with nothing in them to draw */
  for(const b of BONES){ const par=BONE_PARENT[b],p=D.J[b],pp=par?D.J[par]:[0,0,0]; J[b].p=[p[0]-pp[0],p[1]-pp[1],p[2]-pp[2]]; } /* our joints, where his are */
  const g=new Geo(); g.P=D.P.slice(); g.Nm=D.N.slice(); g.T=D.U.slice(); g.I=Array.from({length:D.n},(_,i)=>i); g.groups=[{start:0,count:D.n,mi:0}]; g.noCull=true;
  J.body=mk(g,[M(WKMT[key]||(WKMT[key]=wkModelTex(D.tex)))],J.root);
  J.skin={geo:g,bi:Uint8Array.from(D.BI),bw:Float32Array.from(D.BW),bindP:new Float32Array(D.P),bindN:new Float32Array(D.N),P:new Float32Array(D.P),N:new Float32Array(D.N),bpos:BONES.map(b=>D.J[b]),rel:BONES.map(()=>m4.make()),loc:m4.make()};
  const s=Object.assign({kind:'gunman',faces:FACE.gunman,grp,fight:{},showDrop:false},gear); if(s.two) s.fightHipsY=J.hips.p[1]-.055;
  const C=finish(parent,J,o,s); C.model=key; if(typeof civPoses==='function') civPoses(C); return C; }
