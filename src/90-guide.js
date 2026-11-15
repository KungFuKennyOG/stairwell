/* =====================================================================
   GUIDE: what the game tells you in the headset, and the floor 01 tutorial.
   - Cards: torn scraps of dark case-file paper at PS1 resolution (a hint is 200x50 texels): bitmap text (VT323, Silkscreen for buttons),
     the display face for titles, a dried-blood rule, 15-bit colour with the ordered dither. Alpha test only, so a card is opaque with a
     ragged cut-out edge; it pops in (scale) instead of fading.
     guideTitle(h,p,sec): a title card set down in the world in front of you (floor names, YOU DIED, YOU GOT OUT). It stays where it
       was put; turn well away and it's put back in front of you.
     guideNote(text,sec): a small one-liner, same place (settings, the mic). vrToast() goes here.
     Hints (the tutorial, PROTO only): a small card pinned beside the thing it's about (a bottle, a sheet, a hole), facing you, with
       the button stamped on it. Each one once, the first time it matters; gone once you've done it or walked off.
   - The wrist card: turn the inside of your left wrist to your face and a card of everything Ray can do comes up over it.
   - Flat screen: the same hints as a line at the bottom of the screen, with keys instead of buttons.
   ===================================================================== */
const GFONT={big:'"Big Shoulders Display","Arial Narrow",sans-serif',px:'"VT323","Courier New",monospace',btn:'"Silkscreen","Courier New",monospace'};
const GUIDE={clock:0,tt:null,cards:[],done:{},seen:{},hint:null,queue:[],t:0,title:null,note:null,wrist:null,fontsOk:false,poll:0,dom:null,off:false};
const GINK='#e8e0cc',GDIM='#9d9585',GRED='#8f1b12',GPAPER='#151311';
function gRng(s){ s=(s>>>0)%2147483646+1; return ()=>(s=s*16807%2147483647,(s-1)/2147483646); }
function gHex(c){ const n=parseInt(c.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
function gCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
/* ink without anti-aliasing: drawn on a scratch canvas, cut at half coverage, stamped in one colour (a bitmap font, as on the PS1) */
let GSCR=null;
function gInk(g,col,draw){ const W=g.canvas.width,H=g.canvas.height; if(!GSCR||GSCR.width!==W||GSCR.height!==H) GSCR=gCanvas(W,H); const s=GSCR.getContext('2d');
  s.clearRect(0,0,W,H); s.fillStyle='#fff'; s.strokeStyle='#fff'; s.textBaseline='alphabetic'; s.textAlign='left'; draw(s);
  const d=s.getImageData(0,0,W,H),a=d.data,[r,gg,b]=gHex(col); for(let i=0;i<a.length;i+=4){ if(a[i+3]>=100){ a[i]=r; a[i+1]=gg; a[i+2]=b; a[i+3]=255; } else a[i+3]=0; }
  s.putImageData(d,0,0); g.drawImage(GSCR,0,0); }
/* the PS1 pass: 15-bit colour with the 4x4 ordered dither, and alpha either on or off */
const GBAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function gPS1(c){ const g=c.getContext('2d'),W=c.width,H=c.height,d=g.getImageData(0,0,W,H),a=d.data;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4; if(a[i+3]<128){ a[i+3]=0; continue; } a[i+3]=255; const o=(GBAYER[(y&3)*4+(x&3)]-7.5)*1.1;
    for(let k=0;k<3;k++) a[i+k]=clamp(Math.round((a[i+k]+o)/8)*8,0,248); }
  g.putImageData(d,0,0); }
/* the paper: a ragged scrap of dark case-file card, grimed, a lighter frayed rim. Sizes in texels */
function gPaper(g,x0,y0,x1,y1,seed,o={}){ const r=gRng(seed),j=o.jag??3,st=o.step??3,pts=[];
  for(let x=x0;x<x1;x+=st) pts.push([x,y0+Math.round((r()-.35)*j)]);
  for(let y=y0;y<y1;y+=st) pts.push([x1+Math.round((r()-.5)*j*.6),y]);
  for(let x=x1;x>x0;x-=st) pts.push([x,y1+Math.round((r()-.65)*j)]);
  for(let y=y1;y>y0;y-=st) pts.push([x0+Math.round((r()-.5)*j*.6),y]);
  const path=()=>{ g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(const p of pts) g.lineTo(p[0],p[1]); g.closePath(); };
  g.save(); path(); g.fillStyle=o.col||GPAPER; g.fill(); g.clip();
  const W=x1-x0,H=y1-y0; for(let i=0;i<(o.blots??10);i++){ const cx=x0+r()*W,cy=y0+r()*H,rr=3+r()*Math.min(W,H)*.5,gr=g.createRadialGradient(cx,cy,0,cx,cy,rr),d=r()<.55;
    gr.addColorStop(0,d?'rgba(0,0,0,.45)':'rgba(84,66,46,.22)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(cx-rr,cy-rr,rr*2,rr*2); }
  if(o.ring){ g.strokeStyle='rgba(96,74,50,.35)'; g.lineWidth=1; g.beginPath(); g.arc(x0+W*o.ring[0],y0+H*o.ring[1],H*.3,0,6.28); g.stroke(); }
  for(let i=0;i<W*H/60;i++){ g.fillStyle=r()<.5?'rgba(255,236,200,.05)':'rgba(0,0,0,.12)'; g.fillRect(x0+(r()*W|0),y0+(r()*H|0),1+(r()*2|0),1); }
  g.restore(); g.save(); path(); g.lineWidth=1; g.strokeStyle='rgba(196,182,154,.35)'; g.stroke(); g.restore(); }
/* text: VT323 (a terminal bitmap face) at its own 16 px; the title in the display face, chunky, worn */
function gText(g,s,x,y,col,o={}){ const size=o.size||16; gInk(g,col,c=>{ c.font=`${size}px ${GFONT.px}`; c.textAlign=o.center?'center':o.right?'right':'left'; c.fillText(s,x,y); }); }
function gStamp(g,s,x,y,size,seed,o={}){ g.font=`900 ${size}px ${GFONT.big}`; const sp=o.sp??Math.max(1,Math.round(size*.05)); let w=0; for(const ch of s) w+=g.measureText(ch).width+sp; w-=sp; const x0=o.center?Math.round(x-w/2):x;
  gInk(g,o.col||GINK,c=>{ c.font=`900 ${size}px ${GFONT.big}`; let cx=x0; for(const ch of s){ c.fillText(ch,cx,y); cx+=c.measureText(ch).width+sp; } });
  const r=gRng(seed); g.fillStyle=GPAPER; for(let i=0;i<w*size/(o.wear??26);i++) g.fillRect(x0+(r()*w|0),y-(r()*size*.74|0)-1,1,1); return w; }
function gRule(g,x0,x1,y,seed,w=2){ const r=gRng(seed); g.fillStyle=GRED; let yy=y; for(let x=x0;x<=x1;x++){ if(r()<.18) yy+=r()<.5?-1:1; yy=clamp(yy,y-1,y+1); g.fillRect(x,yy,1,w); } }
/* a controller button in a little box */
function gButton(g,label,x,y,seed){ g.font=`8px ${GFONT.btn}`; const w=Math.round(g.measureText(label).width)+7,h=13;
  g.fillStyle=GINK; g.fillRect(x,y,w,1); g.fillRect(x,y+h-1,w,1); g.fillRect(x,y,1,h); g.fillRect(x+w-1,y,1,h);
  gInk(g,GINK,c=>{ c.font=`8px ${GFONT.btn}`; c.fillText(label,x+4,y+10); }); return w; }
function gWrap(g,s,maxW,font){ g.font=font||`16px ${GFONT.px}`; const words=s.split(' '),L=[]; let cur='';
  for(const w of words){ const t=cur?cur+' '+w:w; if(g.measureText(t).width>maxW&&cur){ L.push(cur); cur=w; } else cur=t; } if(cur) L.push(cur); return L; }
/* ---- the cards: title 320x120, hint/note 200x50, wrist 200x280 ---- */
function gDrawTitle(c,h,p,seed=3){ const g=c.getContext('2d'),W=c.width,H=c.height; g.clearRect(0,0,W,H);
  gPaper(g,8,12,W-8,H-10,seed,{jag:4,blots:12,ring:[.87,.3]});
  gInk(g,'#5d564c',x=>{ x.font=`8px ${GFONT.btn}`; x.fillText('P.S.P.D. - EXP. 0417',16,27); });
  const ts=Math.min(46,Math.floor((W-40)/Math.max(4,h.length*.46))); gStamp(g,h.toUpperCase(),W/2,30+ts*.9|0,ts,seed+1,{center:true});
  const ry=(30+ts*.9|0)+6; gRule(g,W*.2|0,W*.8|0,ry,seed+2,2);
  if(p){ const L=gWrap(g,p,W-40); if(L.length===1) gText(g,L[0],W/2,ry+22,GDIM,{center:true}); else L.slice(0,2).forEach((l,i)=>gText(g,l,W/2,ry+17+i*14,GDIM,{center:true})); }
  gPS1(c); }
function gDrawHint(c,btn,text,sub,seed=7){ const g=c.getContext('2d'),W=c.width,H=c.height; g.clearRect(0,0,W,H);
  let x=8; const by=[].concat(btn||[]); g.font=`8px ${GFONT.btn}`; const bw=by.reduce((a,b)=>a+Math.round(g.measureText(b).width)+11,0);
  const tx=by.length?8+bw+3:18,tw=W-tx-7,L=gWrap(g,text,tw).slice(0,2),S=sub?gWrap(g,sub,tw).slice(0,3-L.length):[],lines=[...L.map(l=>[l,GINK]),...S.map(l=>[l,GDIM])];
  const h=lines.length*14+12,y0=Math.round((H-h)/2); gPaper(g,2,y0,W-2,y0+h,seed,{jag:2,blots:5});
  const mid=y0+h/2|0; if(by.length){ for(const b of by) x+=gButton(g,b,x,mid-7,seed+1)+4; } else { g.fillStyle=GRED; g.fillRect(x,mid-2,4,4); }
  lines.forEach(([l,col],i)=>gText(g,l,tx,y0+18+i*14,col)); gPS1(c); }
function gDrawWrist(c,rows,seed=11){ const g=c.getContext('2d'),W=c.width,H=c.height; g.clearRect(0,0,W,H);
  gPaper(g,4,4,W-4,H-4,seed,{jag:3,blots:10,ring:[.8,.85]});
  gStamp(g,'WHAT RAY CAN DO',W/2,30,22,seed+1,{center:true}); gRule(g,14,W-16,35,seed+2,2);
  g.font=`8px ${GFONT.btn}`; const col=Math.max(...rows.map(([b])=>b?Math.round(g.measureText(b).width)+7:0))+5;
  let y=52; for(const [b,t] of rows){ if(b) gButton(g,b,10,y-10,seed+y); const x=b?10+col:10,L=gWrap(g,t,W-x-8);
    L.slice(0,2).forEach((l,i)=>gText(g,l,x,y+i*13,b?GINK:GDIM)); y+=Math.max(17,L.length*13+5); }
  gPS1(c); }
/* ---------- cards in the world ---------- */
function gTex(w,h){ return {c:gCanvas(w,h),glt:null,f:-1,text:''}; }
function gUpload(t){ if(t.glt){ gl.bindTexture(gl.TEXTURE_2D,t.glt); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.c); } }
function gCard(pw,ph,cw,chh){ const tex=gTex(cw,chh),node=N(world),face=mk(plane(pw,ph),M(tex,{unlit:true,cut:true,double:true,nofog:true}),node); node.vis=false; /* node turns to you, face tilts (Euler is X then Y) */
  return {tex,node,face,key:'',on:false,s:0,p:null,yaw:0,want:null}; }
function gEnsure(){ if(GUIDE.title) return; GUIDE.title=gCard(1.0,.375,320,120); GUIDE.note=gCard(.48,.13,240,64); GUIDE.hintC=gCard(.44,.117,240,64); GUIDE.wristC=gCard(.18,.252,200,280); }
/* draw once per change of text; once the web fonts arrive, everything already drawn is drawn again */
function gSet(C,key,draw){ if(C.key===key) return; C.key=key; C.draw=draw; draw(C.tex.c); gUpload(C.tex); }
if(document.fonts&&document.fonts.load) Promise.all(['900 40px "Big Shoulders Display"','16px "VT323"','8px "Silkscreen"'].map(f=>document.fonts.load(f).catch(()=>{}))).then(()=>{
  GUIDE.fontsOk=true; for(const C of [GUIDE.title,GUIDE.note,GUIDE.hintC,GUIDE.wristC]) if(C&&C.draw){ C.draw(C.tex.c); gUpload(C.tex); } });
/* pop: it flips up from nothing in a fifth of a second, and folds away faster */
function gPop(C,on,dt){ C.on=on; C.s=clamp(C.s+(on?dt/.18:-dt/.12),0,1); C.node.vis=C.s>0; const e=1-Math.pow(1-C.s,3); C.face.s=[1,Math.max(.02,e),1]; }
/* set down in front of you and left there; put back in front only when you've turned well away or walked off */
function gPlace(C,eye,f,dist,dy,dt){ const fl=norm3([f[0],0,f[2]]),tg=[eye[0]+fl[0]*dist,eye[1]+dy,eye[2]+fl[2]*dist];
  if(!C.p||C.s===0) C.p=tg.slice(); else { const to=norm3([C.p[0]-eye[0],0,C.p[2]-eye[2]]),cs=to[0]*fl[0]+to[2]*fl[2],d=Math.hypot(C.p[0]-eye[0],C.p[2]-eye[2]);
    if(cs<.55||d>dist*2.2||d<dist*.45) C.move=true; if(C.move){ const k=Math.min(1,dt*3); for(let i=0;i<3;i++) C.p[i]+=(tg[i]-C.p[i])*k; if(Math.hypot(tg[0]-C.p[0],tg[2]-C.p[2])<.05) C.move=false; } }
  gFace(C,C.p,eye); }
function gFace(C,p,eye){ C.node.p=p.slice(); C.node.r=[0,Math.atan2(eye[0]-p[0],eye[2]-p[2]),0]; C.face.r=[-Math.atan2(eye[1]-p[1],Math.hypot(eye[0]-p[0],eye[2]-p[2])),0,0]; }

/* titles and notes: what showMsg and vrToast used to put on the black panel */
function guideTitle(h,p,sec){ GUIDE.tt={h,p,until:GUIDE.clock+sec}; }
function guideXR(dt,eye,f){ gEnsure(); GUIDE.clock=(GUIDE.clock||0)+dt; const T=GUIDE.title,Nn=GUIDE.note; let title=null,note=null,bar=-1;
  if(XR.resetHold>0){ note='Resetting the floor: keep holding both grips'; bar=XR.resetHold/1.2; }
  if(!$('msg').hidden) title=[$('msgH').textContent,$('msgP').textContent]; else if(GUIDE.tt&&GUIDE.clock<GUIDE.tt.until) title=[GUIDE.tt.h,GUIDE.tt.p||''];
  if(!note&&XR.toastT>0) note=XR.toast; XR.toastT-=dt;
  if(title){ gSet(T,'t|'+title[0]+'|'+title[1],c=>gDrawTitle(c,title[0],title[1],(title[0].length*7)|0)); }
  gPop(T,!!title,dt); if(T.node.vis) gPlace(T,eye,f,1.55,.08,dt);
  if(note){ const k='n|'+note+'|'+(bar<0?-1:Math.round(bar*30)); gSet(Nn,k,c=>{ gDrawHint(c,null,note,null,(note.length*3)|0); if(bar>=0){ const g=c.getContext('2d'); g.fillStyle='#2a2622'; g.fillRect(20,c.height-12,c.width-40,3); g.fillStyle=GRED; g.fillRect(20,c.height-12,Math.round((c.width-40)*clamp(bar,0,1)),3); gPS1(c); } }); }
  gPop(Nn,!!note,dt); if(Nn.node.vis) gPlace(Nn,eye,f,1.0,title?-.42:-.22,dt);
  if(PROTO.on&&!GUIDE.off) guideHintsXR(dt,eye,f); else if(GUIDE.hintC.node.vis) gPop(GUIDE.hintC,false,dt);
  guideWrist(dt,eye,f); }

/* ---------- the floor 01 tutorial ----------
   Each hint: when() gives where it's pinned (a point) or true (in front of you) or null (not now); done() says you've done it.
   VR shows btn (the controller button); flat shows key. Order is priority: the first live one is shown. */
const gEye=()=>XR.on&&XR.head?XR.head.eye:[PL.x,1.6+(PL.y||0),PL.z];
const gHeld=()=>[HANDS.L.item,HANDS.R.item].filter(Boolean);
const gHas=f=>gHeld().some(it=>WPN[it.key]&&f(WPN[it.key],it));
const gD=(p,e=gEye())=>Math.hypot(p[0]-e[0],p[2]-e[2]);
function gNearest(list,pos,r){ let best=null,bd=r; const e=gEye(); for(const o of list){ const p=pos(o); if(!p) continue; const d=gD(p,e); if(d<bd){ bd=d; best=p; } } return best; }
const gLying=f=>LOOSE.filter(P=>P.rest!==false&&WPN[P.item.key]&&f(WPN[P.item.key],P.item));
const gHole=o=>o.axis==='x'?[o.pos,.75,o.c]:[o.c,.75,o.pos];
function gHurt(){ return (PL.wounds||[]).some(w=>!w.band&&!w.bandaged&&!w.closed); }
const GHINTS=[
  {id:'start',when:()=>GUIDE.t>2.5&&GUIDE.t<40&&!gHeld().length?true:null,done:()=>gHeld().length>0,
    text:'You have nothing. Find something to fight with.',sub:'Look around the flats.',life:7},
  {id:'take',btn:'GRIP',key:'U',when:()=>gHeld().some(it=>WPN[it.key]&&WPN[it.key].melee)?null:gNearest(gLying(w=>w.melee||w.gun||w.clutter),P=>P.node.p,1.6),
    done:()=>gHeld().length>0,text:'Take it.',sub:'Reach for it and squeeze.',flatSub:'Look at it and press U.'},
  {id:'swing',when:()=>gHas(w=>w.melee)?true:null,done:()=>GUIDE.ev.melee>0,text:'Swing hard. Speed is damage.',sub:'Slow swings do nothing.',flat:'F to swing.',life:8},
  {id:'flip',btn:'A',key:'',when:()=>GUIDE.done.swing&&gHas(w=>w.melee&&w.melee!=='blunt'&&!w.tool)?true:null,done:()=>false,text:'Flip the grip.',sub:'Blade down to stab, up to slash.',life:5,vrOnly:true},
  {id:'gun',btn:['TRIGGER','A'],key:'Click · R',when:()=>gHas(w=>w.gun)?true:null,done:()=>GUIDE.ev.fire>2,text:'Fire. Reload.',sub:'Hold A to count what\'s left. Rounds are scarce.',flatSub:'Rounds are scarce.',life:9},
  {id:'twohand',btn:'GRIP',when:()=>GUIDE.done.gun&&gHas(w=>w.gun)&&!HANDS.L.item&&!HANDS.L.supportOf?true:null,done:()=>!!HANDS.L.supportOf,text:'Steady it with your other hand.',sub:'Grip the gun with your free hand.',life:6,vrOnly:true},
  {id:'sheet',when:()=>gNearest(typeof SHEETS!=='undefined'?SHEETS:[],S=>[S.x,1.35,S.z],1.6),done:()=>false,text:'Brush it aside with your hand.',sub:'They can\'t see through cloth. Bullets can.',flat:'Walk through it. They can\'t see through cloth.',life:7},
  {id:'hole',btn:'CROUCH',key:'C',when:()=>PL.crouch?null:gNearest(PF&&PF.openings?PF.openings.filter(o=>o.kind==='hole'):[],gHole,2.0),done:()=>PL.crawl,
    text:'Get low to go through.',sub:'Crouch for real, or click the left stick.',flatSub:'Crouch to go through.',life:9},
  {id:'hideSpot',when:()=>gNearest(typeof HIDES!=='undefined'?HIDES.filter(h=>/wardrobe|closet|bed|curtain|sofa|pile/.test(h.kind)):[],h=>[h.x,1.1,h.z],1.4),done:()=>!!PL.hide,
    text:'You can hide in there.',sub:'Keep your head and hands inside.',flatSub:'Crouch into it. Keep inside.',life:7},
  {id:'switch',when:()=>gNearest(PF&&PF.switches||[],s=>s.at,1.3),done:()=>GUIDE.ev.lightSwitch>0,text:'Poke the switch.',sub:'Dark rooms hide you.',flatSub:'Press U. Dark rooms hide you.',life:7},
  {id:'drawer',btn:'GRIP',key:'U',when:()=>gNearest((PF&&PF.openables||[]).filter(o=>!(o.open>.2)),o=>o.at,1.2),done:()=>GUIDE.ev.openable>0,text:'Pull it open.',sub:'Grip the handle. Search everything.',life:7},
  {id:'clutter',btn:'GRIP',when:()=>gHas(w=>w.clutter)?true:null,done:()=>GUIDE.ev.clutterLand>0,text:'Throw it.',sub:'They go to where it lands, not to you.',flat:'Q to throw. They go where it lands.',life:8},
  {id:'hunt',when:()=>typeof HUNT!=='undefined'&&HUNT&&HUNT.state==='hunting'?true:null,done:()=>false,text:'They know you\'re here. They\'re hunting.',sub:'Stay low, stay dark. A hand over your mouth quiets your breathing.',flatSub:'Stay low, stay dark.',life:8},
  {id:'close',btn:'B',key:'E',when:()=>enemies.some(E=>!E.dead&&!E.civ&&E.st==='alert'&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<1.3)?true:null,done:()=>false,text:'Kick him off you.',sub:'Or grab his gun with both hands and twist it away.',flatSub:'Or G to grab him.',life:6},
  {id:'standoff',when:()=>gHas(w=>w.gun)&&enemies.some(E=>!E.dead&&!E.civ&&E.st!=='down'&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<5&&!E.aware)?true:null,done:()=>GUIDE.ev.shout>0,text:'Point your gun and shout.',sub:'Some give up. Some only pretend to.',flatSub:'H to shout. Some give up.',life:7},
  {id:'lowhp',when:()=>PL.hp<60?true:null,done:()=>false,text:'You\'re hurt. The colour goes as you do.',sub:'It doesn\'t come back on its own. First-aid kits help.',life:8},
  {id:'medkit',btn:'TRIGGER',key:'U',when:()=>gHas(w=>w.tool==='medkit')?true:null,done:()=>GUIDE.ev.medkit>0,text:'Hold it to your chest and squeeze.',sub:'It gives some of you back. Not all.',life:7},
  {id:'chain',when:()=>PF&&PF.exit&&!PF.exit.open&&!gHas(w=>w.tool==='cutter'||w.tool==='keys'||w.cutter)&&gD(PF.exit.at)<2.2?PF.exit.at:null,done:()=>PF.exit&&PF.exit.open,
    text:'Chained shut.',sub:'Find the bolt cutter, or take Mario\'s keys off him.',life:8},
  {id:'cut',btn:'TRIGGER',key:'U',when:()=>PF&&PF.exit&&!PF.exit.open&&gHas(w=>w.tool==='cutter'||w.tool==='keys'||w.cutter)&&gD(PF.exit.at)<2.4?PF.exit.at:null,done:()=>PF.exit&&PF.exit.open,
    text:'Close it on the chain and squeeze.',sub:'Or the key in the padlock.',flatSub:'Look at the chain and press U.',life:10},
  {id:'wrist',when:()=>XR.on&&GUIDE.t>45&&!GUIDE.wristSeen?true:null,done:()=>GUIDE.wristSeen,text:'Look at the inside of your left wrist.',sub:'Everything you can do is written there.',life:6,vrOnly:true}];
GUIDE.ev={}; for(const k of ['melee','fire','lightSwitch','openable','clutterLand','bandaged','medkit','shout']) GUIDE.ev[k]=0;
for(const k of ['melee','fire','lightSwitch','openable','clutterLand','bandaged']) protoOn(k,()=>{ GUIDE.ev[k]++; });
protoOn('stat',(n)=>{ if(n==='medkit') GUIDE.ev.medkit++; });
if(typeof playerShout==='function'){ const ps=playerShout; playerShout=function(){ GUIDE.ev.shout++; return ps.apply(this,arguments); }; }
/* the brain, a few times a second: which hint is up */
function guideThink(){ const now=GUIDE.t; let H=GUIDE.hint;
  if(H){ const at=H.d.when(); H.at=at; const shown=now-H.t0;
    if(H.d.done()||(at===true?shown>(H.d.life||8):shown>40)||(!at&&shown>2.5)){ /* pinned to a thing: stays while you're at it */ if(H.d.done()||shown>2.5) GUIDE.done[H.d.id]=true; GUIDE.hint=H=null; }
    else if(H.at===true&&shown>3) for(const d of GHINTS){ if(d===H.d||GUIDE.done[d.id]||d.vrOnly&&!XR.on) continue; const a2=d.when(); if(a2&&a2!==true){ GUIDE.done[H.d.id]=true; GUIDE.hint=H={d,at:a2,t0:now}; protoEmit('guide',d.id); break; } } } /* something in reach beats a general word, once that's been read */
  for(const d of GHINTS){ if(GUIDE.done[d.id]||d.vrOnly&&!XR.on) continue; if(d.done()){ GUIDE.done[d.id]=true; continue; } }
  if(!H&&now-GUIDE.lastT>1.2) for(const d of GHINTS){ if(GUIDE.done[d.id]||d.vrOnly&&!XR.on) continue; const at=d.when(); if(at){ GUIDE.hint={d,at,t0:now}; GUIDE.lastT=now; protoEmit('guide',d.id); break; } }
  if(!GUIDE.hint&&H===null) GUIDE.lastT=GUIDE.lastT||0; }
GUIDE.lastT=-9;
protoOn('tick',(gdt,dt)=>{ if(!PROTO.on||!GAME.started||PL.dead||GUIDE.off) return; GUIDE.t+=dt; GUIDE.poll-=dt; if(GUIDE.poll<=0){ GUIDE.poll=.2; guideThink(); } if(!XR.on) guideFlat(); });
protoOn('load',()=>guideReset()); protoOn('reset',()=>guideReset());
function guideReset(){ GUIDE.t=0; GUIDE.hint=null; GUIDE.lastT=-9; for(const k in GUIDE.ev) GUIDE.ev[k]=0; /* done hints stay done across deaths: you learnt it */ }
/* VR: the hint card, pinned by the thing (a little above it, nudged toward you) or low in front of you */
function guideHintsXR(dt,eye,f){ const C=GUIDE.hintC,H=GUIDE.hint;
  if(H){ const d=H.d,k='h|'+d.id; gSet(C,k,c=>gDrawHint(c,d.btn||null,d.text,d.sub||null,d.id.length*13)); }
  gPop(C,!!H,dt); if(!C.node.vis) return;
  if(H&&H.at&&H.at!==true){ const p=H.at,dx=Math.hypot(eye[0]-p[0],eye[2]-p[2]),to=norm3([eye[0]-p[0],0,eye[2]-p[2]]),nu=clamp((dx-.9)*.3,0,.18),y=Math.max(p[1]+(dx<.9?.2:.28),.6),q=[p[0]+to[0]*nu,Math.min(y,eye[1]+.1),p[2]+to[2]*nu]; /* close up it rises over the thing instead of coming at your face */
    C.p=C.p&&!C.free?v3.add(C.p,v3.sc(v3.sub(q,C.p),Math.min(1,dt*6))):q; C.free=false; gFace(C,C.p,eye); }
  else { if(!C.free){ C.free=true; C.p=null; } gPlace(C,eye,f,.85,-.3,dt); } }
/* the wrist: the left hand empty, held still in the middle of your view, a forearm's length off your face */
const GWRIST=[[null,'HP: $hp'],['GRIP','grab, take, hold on. Let go to throw.'],['TRIGGER','fire, cut, use a kit'],['A','reload. Hold: count rounds. Blade: flip grip'],['B','kick'],
  ['L-STICK','move. Click: crouch'],['R-STICK','turn'],[null,'Get low (for real) to crouch and crawl under things.'],[null,'Hand over your mouth: quieter breathing.'],
  [null,'Brush sheets aside with your hand.'],[null,'Shout (mic): make them freeze.']];
function guideWrist(dt,eye,f){ const C=GUIDE.wristC,h=HANDS.L; let show=false;
  if(h.src&&!h.item&&!h.grab&&!h.supportOf&&!PL.dead){ const p=mulP(h.M,FIST),v=v3.sub(p,eye),d=Math.hypot(...v),cs=v3.dot(v,f)/Math.max(d,1e-3),still=Math.hypot(...(h.vel||[0,0,0]))<.35;
    const ok=d>.2&&d<.55&&cs>.93&&still; h.wristT=ok?(h.wristT||0)+dt:Math.max(0,(h.wristT||0)-dt*2); show=h.wristT>.45||(C.on&&ok);
    if(show||C.node.vis){ const hp=Math.max(0,Math.round(PL.hp)); gSet(C,'w'+hp,c=>gDrawWrist(c,GWRIST.map(([b,t])=>[b,t.replace('$hp',hp+' / 100')]))); const q=v3.add(p,v3.add(v3.sc(XR.head.u,.15),v3.sc(norm3(v3.sub(eye,p)),.03))); gFace(C,q,eye); } }
  if(show&&!GUIDE.wristSeen&&C.s>=1){ GUIDE.wristSeen=true; protoEmit('stat','guide.wrist',1); }
  gPop(C,show,dt); }
/* flat screen: one line at the bottom */
function guideFlat(){ let el=GUIDE.dom; if(!el){ el=GUIDE.dom=document.createElement('div'); el.id='guide'; document.body.appendChild(el); }
  const H=GUIDE.hint,txt=H?((H.d.key?'['+H.d.key+'] ':'')+(H.d.flat||H.d.text)+(H.d.flat?'':' '+(H.d.flatSub||H.d.sub||''))).trim():'';
  if(el._t!==txt){ el._t=txt; el.textContent=txt; el.classList.toggle('on',!!txt); } }

/* ---------- arrows over what you need to take ----------
   A spinning, bobbing PS1 marker (a four-sided cone and a stub, flat amber, unlit) over: the bolt cutter, Mario's keys once he's down,
   and, while your hands are empty, the weapons lying near you. Not through walls: you still have to look. */
const GARROW={pool:[],max:5};
function gArrowMesh(){ const n=N(world),m=M(null,{color:0xd9a033,unlit:true,nofog:true});
  mk(cyl(.055,0,.09,4),m,n,0,0,0); mk(box(.03,.07,.03),m,n,0,.08,0); n.vis=false; return n; }
function guideArrows(dt){ if(!GARROW.pool.length) for(let i=0;i<GARROW.max;i++) GARROW.pool.push(gArrowMesh());
  const T=[],e=gEye(),add=(p,r=9)=>{ if(p&&gD(p,e)<r&&T.length<GARROW.max) T.push(p); };
  if(PF&&PF.exit&&!PF.exit.open&&!gHas(w=>w.tool==='cutter'||w.tool==='keys')){ for(const P of LOOSE) if(WPN[P.item.key]&&WPN[P.item.key].tool==='cutter') add(P.node.p,12);
    const kp=typeof pfKeysPos==='function'?pfKeysPos():null; if(kp&&typeof pfOut==='function'&&pfOut(PF.keyMan)) add(kp,12); }
  if(!gHeld().length){ const L=gLying(w=>w.melee&&!w.tool).map(P=>[P.node.p,gD(P.node.p,e)]).sort((a,b)=>a[1]-b[1]); for(const [p] of L.slice(0,2)) add(p,6); }
  const t=GAME.t; GARROW.pool.forEach((n,i)=>{ const p=T[i]; n.vis=!!p&&!PL.dead&&!GUIDE.off; if(!n.vis) return; n.p=[p[0],p[1]+.32+Math.sin(t*3+i)*.025,p[2]]; n.r=[0,t*2.2+i,0]; }); }
protoOn('tick',(gdt,dt)=>{ if(!PROTO.on||!GAME.started) return; guideArrows(dt); });
protoOn('reset',()=>{ for(const n of GARROW.pool) n.vis=false; });
