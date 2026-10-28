
/* =====================================================================================================
   THE WALL MAP: a bare world map on the back wall of every station, nothing else on it. Blocky PS1 land
   (real coastlines, Natural Earth 1:110m, on a 160x64 grid), the route as lines from city to city round
   the globe: legs already ridden lit, legs to come dim, the sea tunnels dashed, a yellow square for here.
   ===================================================================================================== */
const LAND_W=160, LAND_H=64, LAND_LAT0=78, LAND_LAT1=-58;
const LAND=(()=>{ const s=atob('AAAAORb4///+AAMAAAQAD8AAAAAAAABPl/AD//4AAAAA4AP/wAdAAAAAAP/e/AH//AAAAAGBH///g8AAAP4AX+7/wP/8AAA8AIP//////gCD////77Pg//AAAf/D//////////P/////4fD/g8AH////////////I//////34HwDgA////////////8D/////gcAOAAAP3///////////gH9///8B5AIAAA/P/////////nwAHAP//4H+AAABhc////////+A4AAwAf//+f8AAAGHn////////gHAAAAA///9/4AAA8//////////wYAAAAB/////gAAA///////////AAAAAAH////zAAAB//////////8AAAAAAH////OAAAH//////////QAAAAAAf///+AAAAf/5+f/////5AAAAAAB///+AAAAP7/g5//////MAAAAAAH///wAAAA+D//z/////wgAAAAAAf//+AAAADwFv/P////mCAAAAAAA///wAAAAG+A///////M4AAAAAAD///AAAAAf4AP/////4vAAAAAAAD//4AAAAD/5h//////wgAAAAAAAP//AAAAAf/////////AAAAAAAAAf4EAAAAD////3////8AAAAAAAAA/gYAAAAf//+/v////gAAAAAAAAA+AAAAAB///9/w////AAAAAAAAAB4jAAAAP/////h/3/AAAAAAAAAAHmDgAAAf///v8D8foAAAAAAAAAAH4AAAAB///+fgPg/BgAAAAAAAAAD4AAAAP///94AcB8EAAAAAAAAAADgAAAA////+ABwH4IAAAAAAAAAACPAAAB////+AHADAwAAAAAAAAAAP/gAAD////4AMBgDAAAAAAAAAAAH/AAAH////AAQCAEAAAAAAAAAAAf/gAAOP//8AAA0GAAAAAAAAAAAB//AAAAP//gAABx4AAAAAAAAAAAP/8AAAA//4AAADP4AAAAAAAAAAA//8AAAD//gAAAGdjQAAAAAAAAAD//+AAAH/8AAAAYWHxAAAAAAAAAP//+AAAf/gAAAAwAH4AAAAAAAAAf//4AAA//AAAAA4AfAAAAAAAAAB///AAAD/8AAAAAAACAAAAAAAAAD//4AAAP/wAAAAAA5AAAAAAAAAAP//gAAB//GAAAAAPkAAAAAAAAAAf/+AAAH/8wAAAAB/YAAAAAAAAAA//4AAAf/HAAAAAP/gAAAAAAAAAB//AAAA/8cAAAAH//AQAAAAAAAAH/4AAAD/xgAAAA//+AAAAAAAAAA/+AAAAP+CAAAAD//8AAAAAAAAAD/4AAAAf4AAAAAP//wAAAAAAAAAP/AAAAB/AAAAAAf//AAAAAAAAAA/4AAAAD4AAAAAB//8AAAAAAAAAD/gAAAAPAAAAAAHg/wAAAAAAAAAP4AAAAAAAAAAAAAB+AEAAAAAAAB/gAAAAAAAAAAAAADwAYAAAAAAAH4AAAAAAAAAAAAAAAABgAAAAAAAfAAAAAAAAAAAAAAAMAMAAAAAAAB4AAAAAAAAAAAAAAAABgAAAAAAAHAAAAAAAAAAAAAAAAAMAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='), b=new Uint8Array(LAND_W*LAND_H); for(let i=0;i<b.length;i++) b[i]=(s.charCodeAt(i>>3)>>(7-(i&7)))&1; return b; })();
const MAP_STOPS={
  tokyo:   {lon:139.7,lat:35.7, code:'TYO',name:'TOKYO',     day:'DAY 1 - 06:10', col:'#ff5a4a'},
  hongkong:{lon:114.2,lat:22.3, code:'HKG',name:'HONG KONG', day:'DAY 2 - 12:15', col:'#ffa030'},
  baikal:  {lon:104.3,lat:52.3, code:'BKL',name:'LAKE BAIKAL',day:'DAY 3 - 10:30',col:'#8ad8ff'},
  london:  {lon:-0.1, lat:51.5, code:'LON',name:'LONDON',    day:'DAY 5 - 16:45', col:'#ff6a8a'},
  naples:  {lon:14.3, lat:40.8, code:'NAP',name:'NAPLES',    day:'DAY 6 - 13:00', col:'#6af08a'},
  rio:     {lon:-43.2,lat:-22.9,code:'RIO',name:'RIO',       day:'DAY 8 - 17:40', col:'#ffe040'},
  vegas:   {lon:-115.1,lat:36.2,code:'LAS',name:'LAS VEGAS', day:'DAY 10 - 20:30',col:'#ff4ad8'}};
const MAP_ORDER=['tokyo','hongkong','baikal','london','naples','rio','vegas'];
/* legs in riding order: [from,to,sea?,bulge]; bulge lifts the line north like a great circle */
const MAP_LEGS=[['tokyo','hongkong',0,.1],['hongkong','baikal',0,.1],['baikal','london',0,.22],['london','naples',0,.1],['naples','rio',1,.12],['rio','vegas',0,.12],['vegas','tokyo',1,.16]];
const MAPW=512, MAPH=208;
const mapXY=k=>{ const s=MAP_STOPS[k]; return [(s.lon+180)/360*MAPW, (LAND_LAT0-s.lat)/(LAND_LAT0-LAND_LAT1)*MAPH]; };
/* where each name sits beside its dot: [dx,dy] in texture pixels, so no two labels collide */
const MAP_LABEL={tokyo:[9,-5],hongkong:[8,4],baikal:[-24,-17],london:[-56,-15],naples:[8,1],rio:[9,-4],vegas:[-34,-17]};
function smoothMask(w,h,blur,cut){ /* the 160x64 land grid blown up, blurred and re-cut: soft, simplified coastlines */
  const s=document.createElement('canvas'); s.width=LAND_W; s.height=LAND_H; const sg=s.getContext('2d'), id=sg.createImageData(LAND_W,LAND_H);
  for(let i=0;i<LAND.length;i++){ id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=255; id.data[i*4+3]=LAND[i]*255; } sg.putImageData(id,0,0);
  const c=document.createElement('canvas'); c.width=w; c.height=h; const cg=c.getContext('2d'); cg.imageSmoothingEnabled=true; cg.filter=`blur(${blur}px)`; cg.drawImage(s,0,0,w,h);
  const d=cg.getImageData(0,0,w,h).data, m=new Uint8Array(w*h); for(let i=0;i<m.length;i++) m[i]=d[i*4+3]>cut?1:0; return m; }
let LANDM=null, HALOM=null;
function wallMapTex(cur){ return P2(MAPW,MAPH,(g,w,h)=>{
  const ci=MAP_ORDER.indexOf(cur);
  if(!LANDM){ LANDM=smoothMask(w,h,2.2,120); HALOM=smoothMask(w,h,6,14); }
  /* sea, then land in cream with a hard drop shadow and a ring of lighter water round every coast */
  const img=g.createImageData(w,h), D=img.data, hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
  const SEA=hex('#14203a'), SEA2=hex('#1a2c50'), HALO=hex('#22386a'), SHAD=hex('#0a1226'), LANDC=hex('#f2e6c8'), LAND2=hex('#e4d4ae'), RIM=hex('#c8b488');
  const L=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&LANDM[y*w+x];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x; let c;
    if(LANDM[i]){ c=(!L(x-1,y)||!L(x+1,y)||!L(x,y-1)||!L(x,y+1))?RIM:(((x>>2)+(y>>2))%2?LANDC:LANDC); if(y>h*.62||y<h*.12) c=LAND2; if(c!==RIM&&((x+y)%5===0)&&y>h*.62) c=LAND2; }
    else if(L(x-3,y-3)) c=SHAD; else if(HALOM[i]) c=HALO; else c=(y%4===0&&((x>>1)%2))?SEA2:SEA;
    D[i*4]=c[0]; D[i*4+1]=c[1]; D[i*4+2]=c[2]; D[i*4+3]=255; }
  g.putImageData(img,0,0);
  /* faint lines of latitude and longitude */ g.fillStyle=rgba('#5a78c8',.22); for(let lon=-150;lon<180;lon+=30){ const x=(lon+180)/360*w|0; for(let y=0;y<h;y+=4) if(!LANDM[y*w+x]) g.fillRect(x,y,1,2); }
  for(let lat=60;lat>=-45;lat-=30){ const y=(LAND_LAT0-lat)/(LAND_LAT0-LAND_LAT1)*h|0; for(let x=0;x<w;x+=4) if(!LANDM[y*w+x]) g.fillRect(x,y,2,1); }
  /* the route: a gold curve from city to city, the sea tunnels dashed, the Pacific leg off one edge and back in at the other */
  g.lineCap='round'; g.lineJoin='round';
  MAP_LEGS.forEach(([a,b,sea,bu],li)=>{ const done=cur!=='tokyo'&&li<ci; let [x0,y0]=mapXY(a),[x1,y1]=mapXY(b); if(a==='vegas'&&b==='tokyo') x1-=w;
    const dist=Math.hypot(x1-x0,y1-y0), mx=(x0+x1)/2, my=(y0+y1)/2-dist*bu*2;
    for(const off of (x1<0?[0,w]:[0])){ g.setLineDash(sea?[6,5]:[]); g.strokeStyle=rgba('#0a1226',.8); g.lineWidth=5; g.beginPath(); g.moveTo(x0+off,y0); g.quadraticCurveTo(mx+off,my,x1+off,y1); g.stroke();
      g.strokeStyle=done?(sea?'#8ae0ff':'#f5c542'):(sea?'#4a78c0':'#b08a3a'); g.lineWidth=3; g.beginPath(); g.moveTo(x0+off,y0); g.quadraticCurveTo(mx+off,my,x1+off,y1); g.stroke(); } });
  g.setLineDash([]);
  /* dots and names */
  for(const k of MAP_ORDER){ const [x,y]=mapXY(k), S=MAP_STOPS[k], here=k===cur, [dx,dy]=MAP_LABEL[k];
    if(here){ ell(g,x,y,10,10,rgba('#e0473a',.35)); ell(g,x,y,7,7,'#e0473a'); }
    ell(g,x,y,4.5,4.5,'#0a1226'); ell(g,x,y,3.4,3.4,'#f6efe0'); ell(g,x,y,2,2,S.col);
    const nm=k==='baikal'?'BAIKAL':S.name, tx=Math.round(x+dx), ty=Math.round(y+dy), tw=textW(nm,2);
    if(here){ R(g,'#e0473a',tx-3,ty-3,tw+6,16); text(g,nm,tx,ty,'#ffffff',2); }
    else { text(g,nm,tx+1,ty+1,'#0a1226',2); text(g,nm,tx,ty,'#f6efe0',2); } }
}); }
/* on the back wall (the one behind you on the platform), poster-sized: 4.4 x 1.8 m at eye height, a thin dark edge */
const MAP_WALL={tokyo:-3.25,hongkong:-7,baikal:-7,london:-7.5,naples:-7,rio:9,vegas:-7};
for(const k in MAP_WALL){ const st=ST[k]; if(!st) continue; const H0=st.H0, mh=Math.min(1.8,H0-.9), mw=mh*MAPW/MAPH, y0=Math.min(1.1,H0-mh-.2), x=MAP_WALL[k];
  B(st.back,C('#0a1226'),x,y0-.05,SZ1-.06,mw+.1,mh+.1,.04);
  mk(wplane(mw,mh,mw,mh),M(wallMapTex(k),{emissive:0x404040}),st.back,x,y0+mh/2,SZ1-.1,0,Math.PI,0);
  st.map={x,y:y0+mh/2,z:SZ1-.1,w:mw}; }
