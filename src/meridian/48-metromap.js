
/* =====================================================================================================
   THE STATION SCREEN: one big departures-board screen on every platform. A blocky PS1 world map (real
   coastlines, Natural Earth 1:110m, squashed to a 160x64 grid of 3px cells), the route drawn as lines
   from city to city round the globe, legs you have ridden lit, legs to come dim, YOU ARE HERE boxed.
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
const MX0=16, MY0=62, MCW=3, MAPW=LAND_W*MCW, MAPH=LAND_H*MCW;
const mapXY=k=>{ const s=MAP_STOPS[k]; return [MX0+(s.lon+180)/360*MAPW, MY0+(LAND_LAT0-s.lat)/(LAND_LAT0-LAND_LAT1)*MAPH]; };
function mapLeg(g,a,b,col,sea,bulge){ /* chunky 2px pixels along a curve; wraps round the date line going west */
  let [x0,y0]=mapXY(a), [x1,y1]=mapXY(b); if(a==='vegas'&&b==='tokyo') x1-=MAPW;
  const dist=Math.hypot(x1-x0,y1-y0), n=Math.ceil(dist);
  for(let i=0;i<=n;i++){ const u=i/n; if(sea&&(i%6)>2) continue;
    let x=x0+(x1-x0)*u, y=y0+(y1-y0)*u-Math.sin(Math.PI*u)*dist*bulge;
    if(x<MX0) x+=MAPW; if(x>MX0+MAPW-2) continue; R(g,col,Math.round(x)-1,Math.round(y)-1,2,2); } }
function stationScreenTex(cur){ return P2(512,288,(g,w,h)=>{
  const ci=MAP_ORDER.indexOf(cur), S=MAP_STOPS[cur];
  R(g,'#0a1030',0,0,w,h);
  /* header: red strip, then the city in big letters */
  R(g,'#d8323a',0,0,w,15); R(g,'#ffd040',0,15,w,2);
  const hd='THE MERIDIAN - WORLD LOOP'; text(g,hd,(w-textW(hd,2))/2|0,3,'#fff4e0',2);
  vfill(g,0,17,w,42,[[0,'#16205a'],[1,'#0e1640']]);
  const nm=S.name; text(g,nm,(w-textW(nm,4))/2|0,20,'#ffffff',4);
  const sub=cur==='tokyo'?'DAY 1 - DAY 12':S.day;
  const bx=(w-textW(sub,2)-120)/2|0; text(g,sub,bx,44,'#ffd040',2);
  /* bounty meter: it climbs every stop */ const bm=bx+textW(sub,2)+16; text(g,'BOUNTY',bm,44,'#ff8a70',2); for(let i=0;i<7;i++) R(g,i<=ci?'#ff5a3a':'#3a2a4a',bm+52+i*7,44,5,10);
  /* the map panel: navy, faint grid, the world in blocky green */
  R(g,'#ffd040',MX0-3,MY0-3,MAPW+6,MAPH+6); R(g,'#0a1030',MX0-2,MY0-2,MAPW+4,MAPH+4);
  vfill(g,MX0,MY0,MAPW,MAPH,[[0,'#16246a'],[1,'#0f1a52']]);
  for(let x=0;x<=MAPW;x+=30) R(g,'#1e2e78',MX0+x,MY0,1,MAPH); for(let y=0;y<=MAPH;y+=24) R(g,'#1e2e78',MX0,MY0+y,MAPW,1);
  const L=(i,j)=>i>=0&&i<LAND_W&&j>=0&&j<LAND_H&&LAND[j*LAND_W+((i+LAND_W)%LAND_W)];
  for(let j=0;j<LAND_H;j++) for(let i=0;i<LAND_W;i++) if(L(i,j)){ const x=MX0+i*MCW, y=MY0+j*MCW;
    R(g,'#2f8048',x,y,MCW,MCW); if(!L(i,j-1)) R(g,'#5cb86a',x,y,MCW,1); if(!L(i-1,j)) R(g,'#4aa45c',x,y,1,MCW); if(!L(i,j+1)) R(g,'#1c5434',x,y+MCW-1,MCW,1); if(!L(i+1,j)) R(g,'#245e3c',x+MCW-1,y,1,MCW); }
  /* ocean labels, then the route: ridden legs lit gold, legs to come dim; the sea tunnels dashed */
  text(g,'PACIFIC',MX0+20,MY0+136,'#3a56b0',2);
  MAP_LEGS.forEach(([a,b,sea,bu],li)=>{ const done=cur!=='tokyo'&&li<ci; mapLeg(g,a,b,done?(sea?'#8ae0ff':'#ffd040'):(sea?'#3a6ab8':'#8a7030'),sea,bu); });
  for(const k of MAP_ORDER){ const [x,y]=mapXY(k), here=k===cur; if(here) continue; R(g,'#0a1030',(x|0)-3,(y|0)-3,6,6); R(g,MAP_STOPS[k].col,(x|0)-2,(y|0)-2,4,4);
    const c=MAP_STOPS[k].code, side=k==='hongkong'||k==='rio'||k==='naples', lx=side?(x|0)+5:(x|0)-textW(c,2)/2|0, ly=side?(y|0)-4:(y|0)-14; text(g,c,lx,ly,'#c8d4ff',2); }
  /* YOU ARE HERE: a yellow square and a white tag, like a menu cursor */
  { const [x,y]=mapXY(cur), X=x|0, Y=y|0; R(g,'#0a1030',X-5,Y-5,10,10); R(g,'#ffd040',X-4,Y-4,8,8); R(g,'#0a1030',X-2,Y-2,4,4);
    const tg=S.code, tw=textW(tg,2)+6, tx=Math.min(MX0+MAPW-tw-2,Math.max(MX0+2,X-tw/2|0)); R(g,'#0a1030',tx-1,Y-23,tw+2,16); R(g,'#ffffff',tx,Y-22,tw,14); text(g,tg,tx+3,Y-20,'#0a1030',2); }
  text(g,'WORLD',MX0+5,MY0+MAPH-14,'#5a78d8',2);
  /* footer */ R(g,'#16205a',0,h-24,w,24); R(g,'#ffd040',0,h-2,w,2);
  const nx=MAP_ORDER[(ci+1)%7], nt=cur==='vegas'?'NEXT  TOKYO - DAY 12':'NEXT  '+MAP_STOPS[nx].name+' - '+MAP_STOPS[nx].day.split(' - ')[0];
  text(g,nt,MX0,h-18,'#ffffff',2);
  const lx=w-128; R(g,'#ffd040',lx,h-14,12,3); text(g,'RAIL',lx+16,h-18,'#c8d4ff',2); for(let i=0;i<3;i++) R(g,'#8ae0ff',lx+52+i*6,h-14,4,3); text(g,'SEA',lx+74,h-18,'#c8d4ff',2);
  /* CRT: every other row a touch darker */ for(let y=0;y<h;y+=2) R(g,'rgba(0,0,0,.14)',0,y,w,1);
}); }
/* the big screen: 6.4 x 3.6 m on two steel legs, angled toward the platform; position per station */
const SCREEN_AT={tokyo:[-3,1.1,-.12],hongkong:[-3,1.1,-.12],baikal:[-3,1.1,-.12],london:[-3,1.1,-.12],naples:[-3,1.1,-.12],rio:[-3,1.1,-.12],vegas:[-3,1.1,-.12]};
const SCREEN_W=6.4, SCREEN_H=3.6, SCREEN_Y=.75;
for(const k in SCREEN_AT){ const st=ST[k]; if(!st) continue; const [x,z,ry]=SCREEN_AT[k], n=N(st.g,x,0,z,0,ry,0);
  const frame=C('#14161c'), steel=C('#8a8e96'), cy=SCREEN_Y+SCREEN_H/2;
  B(n,frame,0,SCREEN_Y-.12,-.16,SCREEN_W+.28,SCREEN_H+.24,.2);
  mk(wplane(SCREEN_W,SCREEN_H,SCREEN_W,SCREEN_H),M(stationScreenTex(k),{unlit:true}),n,0,cy,.046);
  B(n,C("#ffd040"),0,SCREEN_Y+SCREEN_H+.12,-.16,SCREEN_W+.28,.05,.22);
  for(const dx of [-2.2,2.2]){ B(n,steel,dx,0,-.3,.14,SCREEN_Y,.14); B(n,steel,dx,0,-.3,.6,.04,.5); }
  st.screen={x,z,ry,cy}; }
