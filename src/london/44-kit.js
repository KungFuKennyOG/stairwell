/* =====================================================================================================
   THE LONDON CHARACTER KIT. Only the skeleton, skin weights and pose system come from the Stairwell rig, so the
   cast still animates, holds props and works in the headset. Everything you can see is new:
   - a denser body (16-sided torso resampled every 2.5 cm, 12-sided limbs) with chest, glutes, calves and
     shoulder slope, and garment volume as geometry: puffer quilting, coat bulk, trouser hems;
   - a sculpted head: jaw, cheekbones, brow ridge, nose, eye sockets, lips and chin are geometry, with real
     eyeballs in the sockets and separate ears, painted by a new 512 px face painter;
   - five-finger hands, relaxed or gripping; chunky trainers and boots with soles.
   ===================================================================================================== */
const TORSO_L=[[.82,.1,.085,0],[.86,.142,.106,-.01],[.9,.16,.118,-.016],[.94,.168,.118,-.012],[1.0,.158,.108,-.002],[1.05,.148,.102,.004],[1.1,.146,.104,.008],
  [1.16,.152,.11,.014],[1.22,.164,.12,.022],[1.28,.172,.124,.024],[1.34,.178,.12,.018],[1.4,.18,.11,.008],[1.44,.17,.098,0],[1.475,.14,.08,-.008],[1.5,.1,.07,-.012],[1.53,.066,.062,-.006],[1.58,.058,.058,.004],[1.62,.052,.054,.008]];
function profileAt(T,y){ if(y<=T[0][0]) return T[0].slice(); for(let i=1;i<T.length;i++) if(y<=T[i][0]){ const a=T[i-1],b=T[i],f=(y-a[0])/(b[0]-a[0]),s=f*f*(3-2*f); return a.map((v,k)=>v+(b[k]-v)*(k?s:f)); } return T[T.length-1].slice(); }
function resample(T,step){ const out=[],y0=T[0][0],y1=T[T.length-1][0]; for(let y=y0;y<y1-1e-6;y+=step) out.push(profileAt(T,y)); out.push(T[T.length-1].slice()); return out; }

/* ---------- the sculpted head: an ellipsoid pushed and pulled into a face. Local space: the head joint at the base of
   the skull, +z forward, ~0.25 m tall. UVs are cylindrical (front at u = .5, top of the canvas = top of the head). ---------- */
const HEAD_H=.26, HC=[0,.128,.012], HR=[.079,.124,.096];
const gauss=(x0,y0,sx,sy,x,y)=>Math.exp(-(((x-x0)/sx)**2)-(((y-y0)/sy)**2));
function faceShape(f,x,y,z){ /* returns the displaced point */
  const ax=Math.abs(x), front=sst(0,.05,z), w=f.width||1;
  let X=x*w, Y=y, Z=z;
  if(y<.1){ const k=(.1-y)/.1; X*=1-(1-(f.jaw??.86))*k; Z+=front*(f.chin??.008)*gauss(0,.03,.02,.025,x,y)*1.6; }
  /* the jaw line: below the mouth, the sides and the underside tuck in towards the neck, leaving the chin in front */
  if(y<.08){ const k=sst(.08,.015,y), side=1-front*.75; X*=1-.38*k*side; if(z<.03) Z=Z-(Z-(-.01))*.42*k*(1-front); }
  if(y<.03){ const k=(.03-y)/.03; X*=1-.25*k; Z=Z*(1-.3*k); }
  Z+=front*((f.nose??1)*(.03*gauss(0,.1,.012,.026,x,y)+.014*gauss(0,.132,.009,.022,x,y))+.006*gauss(0,.087,.018,.009,x,y));   /* nose ridge, tip, wings */
  Z+=front*(f.brow??1)*.011*gauss(.03,.157,.03,.011,ax,y);                                                            /* brow ridge */
  Z-=front*.015*gauss(.032,.137,.017,.012,ax,y);                                                                       /* eye sockets */
  const ck=(f.cheek??1)*.007*gauss(.05,.112,.02,.02,ax,y); X+=Math.sign(x)*ck*.6; Z+=front*ck;                         /* cheekbones */
  Z+=front*(.006*gauss(0,.069,.018,.009,x,y)-.003*gauss(0,.074,.02,.0028,x,y));                                         /* lips, mouth line */
  Z+=front*.004*gauss(.022,.06,.012,.02,ax,y);                                                                          /* the corners of the mouth */
  if(z<0) Z*=1.06;                                                                                                      /* the back of the skull */
  return [X,Y,Z]; }
function headGeo(f){ const g=new Geo(),LAT=34,LON=44;
  /* longitudes bunch up at the front, where the nose and eyes need the vertices */
  const phAt=j=>{ const t=j/LON*2-1; return Math.sign(t)*Math.pow(Math.abs(t),1.55)*Math.PI; };
  for(let i=0;i<=LAT;i++){ const th=i/LAT*Math.PI; for(let j=0;j<=LON;j++){ const ph=phAt(j);
      const x=HR[0]*Math.sin(th)*Math.sin(ph),y=HC[1]+HR[1]*Math.cos(th),z=HC[2]+HR[2]*Math.sin(th)*Math.cos(ph);
      const p=faceShape(f,x,y,z-HC[2]); p[2]+=HC[2]; g.v(p,[0,1,0],[ph/(Math.PI*2)+.5,Math.min(.996,Math.max(.004,p[1]/HEAD_H))]); } }
  for(let i=0;i<LAT;i++) for(let j=0;j<LON;j++){ const a=i*(LON+1)+j,b=a+1,c=a+LON+2,d=a+LON+1; g.I.push(a,d,c,a,c,b); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
/* where a point on the face lands on the 512 x 256 face canvas */
function facePx(f,x,y){ const z=HR[2]*Math.sqrt(Math.max(.05,1-(x/HR[0])**2-((y-HC[1])/HR[1])**2)); return [(Math.atan2(x,z)/(Math.PI*2)+.5)*512,(1-y/HEAD_H)*256]; }
function eyeZ(f,x,y){ const z=HR[2]*Math.sqrt(Math.max(0,1-(x/HR[0])**2-((y-HC[1])/HR[1])**2)); return faceShape(f,x,y,z)[2]+HC[2]; }
function sphereGeo(r,seg=12){ const rings=[]; for(let i=0;i<=seg/2;i++){ const a=-Math.PI/2+i/(seg/2)*Math.PI; rings.push([Math.sin(a)*r,Math.cos(a)*r+1e-4,Math.cos(a)*r+1e-4]); } return lathe(rings,seg,{capB:false,capT:false}); }
const eyeTex={}; function eyeTexFor(iris){ return eyeTex[iris]||(eyeTex[iris]=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#060404'],[.035,'#060404'],[.05,iris],[.11,iris],[.13,'#1a120e'],[.15,'#ece6da'],[1,'#d4ccbe']]); R(g,'rgba(255,255,255,.8)',10,1,3,1); },0,1600)); }

/* ---------- the face painter: skin, hairline, brows, lids, lips, stubble, on the sculpted head's UVs ---------- */
function paintFaceL(s){ const W=512,H=256,I=Img(W,H),SK=F3(s.skin),SD=F3(s.skinD),seed=s.seed,f=s.shape||{};
  const P=(x,y)=>facePx(f,x,y);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const u=Math.abs(x/W-.5)*2; let c=lerp3(SK,SD,Math.min(1,sst(.2,.75,u)*.55+sst(.75,.95,y/H)*.3));
    const m=1+.04*fbm(x*.06,y*.06,seed)+.02*fbm(x*.4,y*.4,seed+3); const i=(y*W+x)*3; I.d[i]=c[0]*m; I.d[i+1]=c[1]*m; I.d[i+2]=c[2]*m; }
  const warm='#c4604c';
  for(const sx of [-1,1]){ const [ex,ey]=P(sx*.031,.136),[cx_,cy_]=P(sx*.05,.108),[bx,by]=P(sx*.031,.158),[tx,ty]=P(sx*.068,.13);
    blob(I,cx_,cy_,18,12,.09,warm);                                   /* cheeks */
    blob(I,ex,ey+12,15,6,-.1);                                        /* under the eyes */
    blob(I,ex,ey-8,16,6,-.12);                                        /* the lid crease */
    blob(I,ex,ey,20,12,-.14);                                          /* the socket's shadow */
    softEll(I,ex,ey-1,12,7,'#140a08',.9,.16); softEll(I,ex,ey,10,5.5,'#2a1a14',.55,.3); softLine(I,ex-12,ey-4,ex+12,ey-5,'#0a0504',.9,2.2);   /* lash line, upper lid */
    blob(I,tx,ty,10,14,-.1);                                          /* temples */
    const BR=F3(s.brow||'#2a1c12'); const r=rng(seed+sx*7); for(let k=0;k<160;k++){ const t=r(); const x=bx-sx*15+sx*t*32,y=by+1-Math.sin(t*Math.PI)*5+(r()-.5)*(4-t*2); put(I,x,y,BR,.7*(s.browT?1:.85)); put(I,x+1,y-1,BR,.45); put(I,x,y+1,BR,.3); } }
  const [nx,ny]=P(0,.098),[ntx,nty]=P(0,.09),[nbx,nby]=P(0,.13); blob(I,nx,ny,8,16,.08,warm);
  for(const sx of [-1,1]){ blob(I,nx+sx*9,ny-6,4,18,-.2); } softLine(I,nbx,nby,nx,ny-4,'#ffffff',.12,3); blob(I,nx,ny-2,5,5,.1);   /* the nose: shaded sides, a lit ridge */ for(const sx of [-1,1]){ const [px,py]=P(sx*.009,.086); softEll(I,px,py,3,2,'#2a1410',.8,.4); }
  blob(I,ntx,nty+2,10,4,-.15);
  const [mx,my]=P(0,.072);
  const [chx,chy]=P(0,.04); blob(I,chx,chy,18,10,.06);
  if(s.age){ for(const sx of [-1,1]){ const [ex,ey]=P(sx*.04,.136); for(const d of [-3,0,3]) softLine(I,ex+sx*10,ey+d,ex+sx*18,ey+d*1.8,'#000000',.15,1); } const [fx,fy]=P(0,.18); for(const d of [0,6]) softLine(I,fx-30,fy+d,fx+30,fy+d,'#000000',.12,1.2); }
  if(s.scar){ const [sx_,sy_]=P(.04,.15); softLine(I,sx_,sy_-12,sx_+6,sy_+14,'#e8b8a8',.6,2); }
  /* beard and stubble on the jaw, chin and upper lip */
  if(s.beard){ const C=F3(s.beardC),r=rng(seed+21),full=s.beard==='full',goat=s.beard==='goatee',must=s.beard==='mustache';
    for(let y=Math.floor(P(0,.11)[1]);y<P(0,.0)[1];y++) for(let x=0;x<W;x++){ const u=Math.abs(x/W-.5)*2; if(u>.42) continue; const yy=HEAD_H*(1-y/H);
      const lips=Math.abs(x-mx)<20&&Math.abs(y-my)<7, upper=yy>.075&&yy<.088&&Math.abs(x-mx)<24, jaw=yy<.075&&!lips&&(u>.1||yy<.06), chin=yy<.06&&Math.abs(x-mx)<22;
      let d=0; if(must) d=upper?1:0; else if(goat) d=(upper||chin)&&!lips?1:0; else d=(upper||jaw)&&!lips?1:0;
      if(!d) continue; if(full||goat||must){ const v=.85+.3*fbm(x*.5,y*.5,seed+5); put(I,x,y,[C[0]*v,C[1]*v,C[2]*v],.92); } else if(r()<.5*sst(.42,.25,u)) put(I,x,y,C,.6); } }
  softEll(I,mx,my+1,22,7,s.lip||'#a8665a',.9,.5); softEll(I,mx,my+4,17,4,mix(s.lip||'#a8665a','#ffffff',.12),.6,.6); softLine(I,mx-21,my,mx+21,my,'#2a1210',.9,1.6); softLine(I,mx-8,my+4,mx+8,my+4,'#ffffff',.12,2);
  /* hair painted where the hairline runs: buzz, shaved, or the base under a hair shell */
  if(s.hair&&s.hair!=='none'){ const C=F3(s.hairC||'#1a1410');
    for(let x=0;x<W;x++){ const u=Math.abs(x/W-.5)*2; const line=u<.16?(s.hairFront??.195):u<.4?.17-.02*sst(.16,.4,u):u<.7?.15:.09; const yl=(1-line/HEAD_H)*H+3*fbm(x*.1,0,seed);
      for(let y=0;y<yl;y++){ const a=Math.min(1,(yl-y)/3); if(s.hair==='shaved') put(I,x,y,lerp3(SK,[0,0,0],.2),a*.55); else put(I,x,y,lerp3(C,SK,.12+.12*fbm(x*.6,y*.6,seed+1)),a*.93); } } }
  return toTex(I); }

/* ---------- hands: palm and five fingers, relaxed (open) or gripping (wrap). Palm faces the body (-s x). ---------- */
function handL(wr,s,m){ const ps=-s;
  const build=(curl)=>{ const h=N(wr); mk(box(.03,.085,.082,{tw:.92,td:.95,at:[0,-.044,0]}),m,h);
    [[.028,.07,.046],[.01,.078,.05],[-.008,.075,.046],[-.026,.062,.038]].forEach(([z,len,pl],i)=>{ const k=N(h,0,-.086,z,0,0,ps*curl*.7); mk(box(.017,pl*.62,.017,{at:[0,-pl*.31,0]}),m,k);
      const k2=N(k,0,-pl*.6,0,0,0,ps*curl); mk(box(.016,len-pl*.6,.016,{tw:.85,td:.85,at:[0,-(len-pl*.6)/2,0]}),m,k2); });
    const t=N(h,ps*.012,-.03,.042,-.5,0,ps*(.3+curl*.6)); mk(box(.019,.042,.019,{at:[0,-.021,0]}),m,t); const t2=N(t,0,-.04,0,0,0,ps*curl*.5); mk(box(.017,.032,.017,{tw:.85,td:.85,at:[0,-.016,0]}),m,t2);
    return h; };
  const open=build(.32), wrap=build(1.35); wrap.vis=false; return {open,wrap}; }
/* ---------- shoes: a chunky sole and a rounded upper ---------- */
function shoeL(an,o){ const w=o.shoeW,l=o.shoeL,sole=o.sole||.032;
  mk(box(w*1.08,sole,l*1.04,{td:1,at:[0,-o.foot+sole/2,l*.2]}),o.soleM||M(null,{color:0xe8e4dc}),an);
  mk(lathe([[-o.foot+sole,w*.54,l*.48,l*.21],[-o.foot+sole+.025,w*.53,l*.46,l*.2],[-o.foot*.4,w*.48,l*.38,l*.13],[-.008,w*.42,w*.62,.012],[.04,w*.37,w*.44,0]],12),o.footM,an); }

/* ---------- the rig: Stairwell's skeleton and skinning, this kit's body ---------- */
function rigL(o,parent){
  const hf=o.hf||1,w=o.w||1,dp=o.depth||1,bl=o.belly||1,lg=o.lg||1,ag=o.ag||1,jk=o.jacket||0,pl=o.pants||.006,puff=o.puff||0;
  const fem=o.shape==='fem';
  const base=TORSO_L.map(r=>r.slice()); if(fem){ for(const r of base){ if(r[0]>=.86&&r[0]<=.94){ r[1]*=1.08; r[2]*=1.04; } if(r[0]>=1.0&&r[0]<=1.1) r[1]*=.88; if(r[0]>=1.22&&r[0]<=1.34){ r[2]*=1.12; r[3]+=.012; } if(r[0]>=1.4&&r[0]<=1.475) r[1]*=.88; } }
  const T=resample(base,.025).map(([y,rx,rz,cz])=>{ const neck=y>=1.5, mid=y>=1.0&&y<=1.28, worn=y>=.93&&y<=1.47;
    const ridge=worn&&puff?puff*(.55+.45*Math.cos((y-1.0)/.115*Math.PI*2)):0;
    const kx=neck?(.9+.1*w):w, kz=neck?1:dp*(mid?bl:1);
    return [y*hf, rx*kx*(mid?(1+(bl-1)*.45):1)+(worn?jk+ridge:y<.93?pl:0), rz*kz+(worn?jk+ridge:y<.93?pl:0), cz+(mid?(bl-1)*.12:0)]; });
  o.torsoRings=T;
  o.thigh=.43*hf; o.shin=.42*hf; o.foot=.08*hf; o.legW=.11*lg; o.torso=.41*hf; o.shoeW=o.shoeW||.105; o.shoeL=o.shoeL||.285*Math.min(1.08,hf);
  const tc=torsoAt(o,1.21*hf); o.torsoD=(tc[2]+tc[3])*2;
  const P={}; P.hips=[0,.99*hf,0]; P.spine=[0,1.09*hf,0]; P.neck=[0,1.5*hf,0]; P.head=[0,1.57*hf,0];
  for(const s of [1,-1]){ const L_=s>0?'L':'R';
    P['thigh'+L_]=[s*.09*w,.93*hf,0]; P['knee'+L_]=[s*.09*w,.5*hf,0]; P['ankle'+L_]=[s*.09*w,.08*hf,0];
    P['arm'+L_]=[s*.19*w,1.45*hf,0]; P['elbow'+L_]=[s*(.19*w+.032*ag),1.15*hf,0]; P['hand'+L_]=[s*(.19*w+.044*ag),.89*hf,0]; }
  const root=N(parent),J={root};
  for(const b of BONES){ const par=BONE_PARENT[b],pp=par?P[par]:[0,0,0]; J[b]=N(par?J[par]:root,P[b][0]-pp[0],P[b][1]-pp[1],P[b][2]-pp[2]); }
  const g=new Geo(),sk=[]; const y0=T[0][0],yT=T[T.length-1][0];
  tube(g,sk,T.map(([y,rx,rz,cz])=>({c:[0,y,cz],rx,rz,v:(y-y0)/(yT-y0),w:TORSO_W(y/hf)})),16,0,{capB:true,capT:true});
  const ARMR=resample(ARM.map(([y,rx,rz])=>[y,rx*(y>1.36&&y<1.47?1.12:1),rz*(y>1.2&&y<1.3?1.06:1),0]),.03);
  for(const s of [1,-1]){ const L_=s>0?'L':'R',S=P['arm'+L_],E=P['elbow'+L_],H=P['hand'+L_];
    const ax=y=>y>=S[1]?S[0]:y>=E[1]?E[0]+(S[0]-E[0])*(y-E[1])/(S[1]-E[1]):H[0]+(E[0]-H[0])*(y-H[1])/(E[1]-H[1]);
    tube(g,sk,ARMR.map(([y,rx,rz])=>{ const Y=y*hf,cuff=y<.95?(o.cuff||0):0; return {c:[ax(Y),Y,0],rx:rx*ag+jk*.6+(puff&&y>.95?puff*.5:0)+cuff,rz:rz*ag+jk*.6+(puff&&y>.95?puff*.5:0)+cuff,v:(y-.9)/.6,w:ARM_W(y,L_)}; }),12,s>0?1:2,{capB:true,capT:true}); }
  const LEGR=resample(LEG.map(r=>r.slice()),.03);
  for(const s of [1,-1]){ const L_=s>0?'L':'R';
    tube(g,sk,LEGR.map(([y,rx,rz,cz])=>{ const hem=y<.14?(o.hem||0)*(1-(y-.09)/.05):0; return {c:[s*.09*w,y*hf,cz],rx:rx*lg+pl+hem,rz:rz*lg+pl+hem,v:(y-.09)/.89,w:LEG_W(y,L_)}; }),12,s>0?3:4,{capB:true,capT:true}); }
  smoothNormals(g);
  const n=g.P.length/3,bi=new Uint8Array(n*2),bw=new Float32Array(n*2);
  sk.forEach((ws,i)=>{ ws.slice(0,2).forEach(([b,wt],k)=>{ bi[i*2+k]=BONES.indexOf(b); bw[i*2+k]=wt; }); });
  J.body=mk(g,[o.torsoM,o.armLM||o.armM,o.armM,o.legM,o.legM],root);
  g.noCull=true; J.skin={geo:g,bi,bw,bindP:new Float32Array(g.P),bindN:new Float32Array(g.Nm),P:new Float32Array(g.P),N:new Float32Array(g.Nm),bpos:BONES.map(b=>P[b]),rel:BONES.map(()=>m4.make()),loc:m4.make()};
  /* the head, its eyes and ears */
  const hs=(o.headS||1)*1.05, f=o.faceShape||{}; const head=N(J.head); head.s=[hs,hs,hs];
  J.headMesh=mk(headGeo(f),o.headM,head);
  for(const s of [1,-1]){ const ex=s*.031,ey=.136,ez=eyeZ(f,ex,ey)-.0068; mk(sphereGeo(.0118,10),M(eyeTexFor(o.iris||'#4a3a2a')),head,ex*(f.width||1),ey,ez,Math.PI/2,0,0);
    mk(lathe([[-.026,.003,.008],[-.012,.011,.016],[.012,.012,.017],[.028,.004,.008]],8),o.earM,head,s*.074*(f.width||1),.125,-.006,0,0,s*.12); }
  for(const s of [1,-1]){ const L_=s>0?'L':'R'; const h=handL(J['hand'+L_],s,(s>0&&o.handML)||o.handM); J['open'+L_]=h.open; J['wrap'+L_]=h.wrap; shoeL(J['ankle'+L_],o); }
  return J; }

/* a hair shell over the skull (slick, long) and a hood that frames the face, built on the same ellipsoid */
function shellGeo(f,scale,keep,LAT=16,LON=24){ const g=new Geo(),idx=[];
  for(let i=0;i<=LAT;i++){ const th=i/LAT*Math.PI; idx.push([]); for(let j=0;j<=LON;j++){ const ph=(j/LON-.5)*Math.PI*2; const x=HR[0]*Math.sin(th)*Math.sin(ph),y=HC[1]+HR[1]*Math.cos(th),z=HR[2]*Math.sin(th)*Math.cos(ph);
      const p=faceShape(f,x,y,z); idx[i].push(keep(x,y,z,ph)?g.v([p[0]*scale[0],(p[1]-HC[1])*scale[1]+HC[1],p[2]*scale[2]+HC[2]],[0,1,0],[j/LON,i/LAT]):-1); } }
  for(let i=0;i<LAT;i++) for(let j=0;j<LON;j++){ const a=idx[i][j],b=idx[i][j+1],c=idx[i+1][j+1],d=idx[i+1][j]; if(a<0||b<0||c<0||d<0) continue; g.I.push(a,d,c,a,c,b); }
  smoothNormals(g); g.groups.push({start:0,count:g.I.length,mi:0}); return g; }
function hairShell(J,f,col,o={}){ const front=o.front??.19,back=o.back??.07,len=o.len||0;
  const keep=(x,y,z,ph)=>{ const a=Math.abs(ph)/Math.PI; const line=a<.18?front:a<.45?front-.04*sst(.18,.45,a):back-len; return y>=line-.004; };
  const m=M(P2(64,64,(g,w,h)=>{ R(g,col,0,0,w,h); for(let i=0;i<120;i++){ const x=Math.random()*w; vfill(g,x,0,1,h,[[0,'rgba(255,255,255,.12)'],[1,'rgba(0,0,0,.25)']]); } },6,1610),{double:true});
  return mk(shellGeo(f,[1.06,1.04,1.08],keep),m,J.headMesh.par); }
function hoodL(J,f,tex){ const keep=(x,y,z,ph)=>{ const a=Math.abs(ph)/Math.PI; return !(a<.3&&y<.2&&y>.02)&&y>-.02; };
  return mk(shellGeo(f,[1.32,1.22,1.3],keep,18,26),M(tex,{double:true}),J.headMesh.par); }
function capL(J,col,f){ const m=M(null,{color:hexInt(col)}); const g=shellGeo(f,[1.08,1.02,1.1],(x,y)=>y>.17); const n=mk(g,m,J.headMesh.par);
  const b=new Geo(); for(let i=0;i<=8;i++){ const a=(i/8-.5)*2.2; for(const r of [.09,.16]) b.v([Math.sin(a)*r*.9,.184-r*.12+(r>.1?-.006:0),Math.cos(a)*r*.75+.04],[0,1,0],[i/8,r>.1?1:0]); }
  for(let i=0;i<8;i++){ const a=i*2; b.I.push(a,a+1,a+3,a,a+3,a+2); } b.groups.push({start:0,count:b.I.length,mi:0}); smoothNormals(b); mk(b,M(null,{color:hexInt(col),double:true}),J.headMesh.par); return n; }

/* ---------- making a London character from a ROSTER entry ---------- */
const FACE_L={};
function makeCharL(id,parent){ const R_=ROSTER[id],s=HEADS[id],f=s.shape||{};
  const ft=FACE_L[id]||(FACE_L[id]=paintFaceL(s)), sk_=flat(32,32,s.seed+43,s.skin,'skin',{grime:0});
  const o=Object.assign({headM:M(ft),earM:M(null,{color:hexInt(mix(s.skin,s.skinD,.3))}),handM:M(sk_),iris:s.iris,faceShape:f},R_.o,
    {torsoM:M(R_.torso),armM:M(R_.arm),legM:M(R_.leg),footM:M(R_.foot),soleM:M(null,{color:hexInt(R_.sole||'#e6e2da')})});
  if(R_.hand) o.handM=M(R_.hand);
  const J=rigL(o,parent); if(R_.extra) R_.extra(J,o);
  const sp={kind:id,faces:{fight:ft,hurt:ft,beg:ft,sleep:ft,shock:ft,agony:ft,choke:ft},grp:'cast',fight:R_.fight||{},showDrop:false,gripHand:R_.gripHand};
  if(R_.prop) Object.assign(sp,{prop:R_.prop,wFight:R_.wFight||{p:[0,-.06,.02],r:[1.3,0,0]},twoHand:R_.twoHand,support:R_.support});
  const C=finish(parent,J,o,sp); C.id=id; civPoses(C); return C; }
