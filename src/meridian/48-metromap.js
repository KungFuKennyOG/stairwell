
/* =====================================================================================================
   THE METRO MAP: the whole world loop drawn like a transit diagram, on a board on every platform, with
   YOU ARE HERE on the current stop. Americas on the left, Europe in the middle, Asia on the right; the
   two undersea legs are dashed, and the Pacific leg runs off one edge and back in at the other.
   ===================================================================================================== */
const MAP_STOPS={vegas:[24,36,'LAS VEGAS','DAY 10'],rio:[44,78,'RIO','DAY 8'],london:[88,20,'LONDON','DAY 5'],naples:[102,46,'NAPLES','DAY 6'],baikal:[140,22,'BAIKAL','DAY 3'],hongkong:[156,64,'HONG KONG','DAY 2'],tokyo:[178,42,'TOKYO','DAY 1']};
const MAP_ORDER=['tokyo','hongkong','baikal','london','naples','rio','vegas'];
function metroPath(g,a,b,col,wd,dash){ /* diagonal first, then straight, the way transit maps bend */
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.min(Math.abs(dx),Math.abs(dy)),m=[a[0]+Math.sign(dx)*d,a[1]+Math.sign(dy)*d];
  g.strokeStyle=col; g.lineWidth=wd; g.lineCap='round'; g.lineJoin='round'; g.setLineDash(dash||[]); g.beginPath(); g.moveTo(a[0],a[1]); g.lineTo(m[0],m[1]); g.lineTo(b[0],b[1]); g.stroke(); g.setLineDash([]); }
function metroMapTex(cur){ return P2(192,96,(g,w,h)=>{
  vfill(g,0,0,w,h,[[0,'#121c34'],[1,'#0c1426']]);
  /* continents as soft blocks */ for(const [x,y,rw,rh] of [[8,14,40,30],[28,52,26,38],[76,8,40,22],[86,32,30,50],[118,6,70,40],[146,52,30,26]]){ g.fillStyle='#18264a'; g.beginPath(); g.roundRect?g.roundRect(x,y,rw,rh,8):g.rect(x,y,rw,rh); g.fill(); }
  const P=k=>MAP_STOPS[k];
  for(let i=0;i<MAP_ORDER.length-1;i++){ const a=MAP_ORDER[i],b=MAP_ORDER[i+1], under=a==='naples'&&b==='rio'; metroPath(g,P(a),P(b),under?'#5ab8e8':'#e8b84a',under?2:3,under?[3,3]:null); }
  /* the Pacific: off the left edge from Vegas, back in from the right edge to Tokyo */
  metroPath(g,P('vegas'),[2,36],'#5ab8e8',2,[3,3]); metroPath(g,[w-2,42],P('tokyo'),'#5ab8e8',2,[3,3]);
  text(g,'ATLANTIC',58,60,'#5ab8e8',1); text(g,'PACIFIC',2,44,'#5ab8e8',1);
  for(const k of MAP_ORDER){ const [x,y,name,day]=P(k), here=k===cur;
    if(here){ radial(g,x,y,12,[[0,rgba('#e0473a',.55)],[1,rgba('#e0473a',0)]]); ell(g,x,y,5.5,5.5,'#e0473a'); }
    ell(g,x,y,3.5,3.5,'#0c1426'); ell(g,x,y,2.4,2.4,'#f6efe0');
    const lx=k==='tokyo'||k==='hongkong'||k==='london'?x-textW(name)-6:x+6, ly=k==='rio'?y+3:y-7; text(g,name,lx,ly,here?'#ffb0a0':'#f6efe0',1); text(g,day,lx,ly+6,'#7a86a8',1); }
  const lab='YOU ARE HERE  '+P(cur)[2], lw=textW(lab)+6; R(g,'#e0473a',58,2,lw,8); text(g,lab,61,4,'#ffffff',1);
  R(g,'#e8b84a',2,2,52,8); text(g,'THE MERIDIAN',4,4,'#0c1426',1);
  R(g,'#e8b84a',w-60,h-8,8,2); text(g,'RAIL',w-50,h-10,'#7a86a8',1); g.strokeStyle='#5ab8e8'; g.setLineDash([3,3]); g.beginPath(); g.moveTo(w-32,h-7); g.lineTo(w-24,h-7); g.stroke(); g.setLineDash([]); text(g,'SEA',w-22,h-10,'#7a86a8',1);
}); }
const MAP_AT={tokyo:[-15,4.4],hongkong:[-17,4.4],baikal:[-12,4.4],london:[-11,4.6],naples:[-13,4.4],rio:[-8.5,4.2],vegas:[-14,4.4]};
for(const k in MAP_AT){ const st=ST[k]; if(!st) continue; const [x,z]=MAP_AT[k], n=N(st.g,x,0,z);
  const frame=C('#0c1426'), steel=C('#c8ccd2'), m=M(metroMapTex(k),{unlit:true});
  B(n,frame,0,.9,0,3.5,1.85,.1); mk(wplane(3.3,1.65,3.3,1.65),m,n,0,1.82,.056); mk(wplane(3.3,1.65,3.3,1.65),m,n,0,1.82,-.056,0,Math.PI,0);
  for(const dx of [-1.6,1.6]) B(n,steel,dx,0,0,.08,.95,.08); B(n,C('#e8b84a'),0,2.75,0,3.5,.06,.12); st.map=n; }
