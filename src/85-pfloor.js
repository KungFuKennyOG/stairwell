/* =====================================================================
   FLOOR 01, RE-LAID-OUT (the prototype floor, agent F). ?proto=1 (J's start card calls pfLoad), or ?pfdev=1 to boot straight in.
   The old floors are one straight hall you can walk past in 12 s. This one is a hybrid: a short hall spine (16 x 2.2 m) for your
   bearings, a run of rooms either side of it, joined to the hall at four points each side, so each side is a loop. Doorways are
   offset, the hall has a chicane of piled furniture in the middle, so no view on the floor runs further than about 12 m.
   No doors anywhere (Kenny: doors were "fucking annoying in VR"): openings are open, hung with a sheet (G's addSheet), or a
   knocked-through hole you crouch through. The one door is the stairwell out, chained; a bolt cutter or Mario's keys open it.
   Built from data: rooms are rectangles (or two, for an L), openings sit on the wall two rooms share. The walls come from the
   room edges: each room paints its own side, inset half a wall, so corners meet without seams; every wall is a collision box.
   Contract (PROTO_BRIEF 6): pfLoad(), pfReset(), PF.rooms, PF.openings, pfRoomAt(x,z), protoEmit('exit').
   Also: protoEmit('room', room, prev) when Ray walks into another room; protoEmit('chain', how) when the stairs open ('cut'|'keys').
   ===================================================================== */
PROTO.pfloor={ dormD:6, cullPeople:true, cutR:.24, cutHold:.35, useR:1.7, snapR:8, keyR:.28, exitFade:1.1, torchR:4.4, torchAhead:1.9, roomSlots:7, wetNoise:5 };
const PF={rooms:[],byId:{},openings:[],hides:[],lights:[],items:[],pair:[],grid:null,gw:0,gh:0,runs:[],exit:null,room:null,snd:null};
const PF_T=.14, PF_DOOR_H=2.05, PF_HOLE_H=.95; let PF_MERGE_TILE=7; /* static geometry merged by material in tiles this big (36-colonia.js meshMerge) */

/* ---------- the rooms ----------
   rects [x0,z0,x1,z1]; paper: wall paint (TW_PAPER), fl: floor (TW_FLOORS); env: acoustics (room | hall | stair); win: windows on the
   outside wall, [x, side] (side +1 north wall z=12, -1 south wall z=-12). noFace: faces/boxes drawn by someone else (the stair shafts) */
const PF_ROOMS=[
  {id:'H', name:'the hall',              rects:[[-8,-1.1,8,1.1]],  paper:'hall',fl:'hall',env:'hall'},
  {id:'S0',name:'the landing',           rects:[[-18,-10.4,-10,-6.4]],paper:'stair',fl:'conc',env:'stair',floorRects:[[-14,-10.4,-10,-6.4]],shaft:{x0:-18,x1:-14}},
  {id:'S1',name:'the front room',        rects:[[-12,-6.4,-5.6,-1.1]],paper:'peel',fl:'lino'},
  {id:'S2',name:'the bedroom',           rects:[[-10,-12,-4,-6.4]],paper:'pink',fl:'rug',win:[[-7.6,-1]]},
  {id:'S3',name:'the TV room',           rects:[[-5.6,-6.4,0.4,-1.1]],paper:'nicotine',fl:'check'},
  {id:'S4',name:'the bathroom',          rects:[[-4,-9.2,-1.6,-6.4]],paper:'tile',fl:'tile'},
  {id:'S5',name:'Doña Chela\'s kitchen', rects:[[0.4,-6.4,6.4,-1.1]],paper:'cream',fl:'tile'},
  {id:'S6',name:'Doña Chela\'s bedroom', rects:[[-1.6,-12,4.4,-6.4],[-4,-12,-1.6,-9.2]],paper:'blue',fl:'oak',win:[[1.6,-1]]},
  {id:'S7',name:'the storeroom',         rects:[[4.4,-12,10.4,-6.4]],paper:'concrete',fl:'conc',win:[[7.4,-1]]},
  {id:'S8',name:'the flooded room',      rects:[[6.4,-6.4,12.4,-1.1]],paper:'peel',fl:'lino'},
  {id:'N1',name:'Dani\'s kitchen',       rects:[[-12,1.1,-5.5,6.4]],paper:'tile',fl:'tile'},
  {id:'N2',name:'Dani\'s back room',     rects:[[-10,6.4,-5.5,12]],paper:'paper',fl:'carpet',win:[[-7.9,1]]},
  {id:'N3',name:'Kev\'s room',           rects:[[-5.5,1.1,-1.5,12]],paper:'dark',fl:'old',win:[[-3.4,1]]},
  {id:'N4',name:'the card room',         rects:[[-1.5,6.4,3,12]],paper:'panel',fl:'oak'},
  {id:'N5',name:'the closet',            rects:[[3,9.6,4.5,12]],paper:'panel',fl:'oak'},
  {id:'N6',name:'the tenants\' flat',    rects:[[-1.5,1.1,4.5,6.4]],paper:'sage',fl:'rug'},
  {id:'N7',name:'the laundry',           rects:[[3,6.4,9,9.6],[4.5,9.6,9,12]],paper:'cream',fl:'tile',win:[[7,1]]},
  {id:'N8',name:'the gutted flat',       rects:[[4.5,1.1,13,6.4]],paper:'concrete',fl:'conc'},
  {id:'NE',name:'the stair door',        rects:[[9,6.4,13,12]],paper:'stair',fl:'conc',env:'stair',win:[[10.4,1]]},
  {id:'NX',name:'the stairs up',         rects:[[13,7.2,17,11.2]],paper:'stair',fl:'conc',env:'stair',floorRects:[],noFace:true}
];
/* openings: [room a, room b, position along the wall they share, width, kind]. kind: open | sheet | hole (crouch) | chain (the way out) */
const PF_OPEN=[ /* centres on the half-metre nav grid where they fit, so a walker's doorway cell is the middle of the doorway */
  ['S0','S1',-11,1.0,'open'],['S1','H',-6.5,.95,'open'],['S1','S2',-6.5,1.0,'open'],['S2','S3',-5.0,1.0,'hole'],
  ['S3','H',-3.0,1.0,'open'],['S3','S4',-2.5,.9,'sheet'],['S3','S5',-4.5,1.0,'hole'],['S5','H',5.0,1.0,'open'],['S5','S6',1.5,1.0,'open'],
  ['S6','S7',-10.0,1.0,'hole'],['S7','S8',9.5,1.0,'open'],['S8','H',7.0,.95,'open'],
  ['N1','H',-7.0,.95,'open'],['N1','N2',-8.5,1.0,'open'],['N2','N3',10.0,1.0,'hole'],['N3','H',-2.5,1.0,'open'],['N3','N4',8.5,1.0,'open'],
  ['N4','N5',11.0,.8,'open'],['N4','N6',0.5,1.0,'hole'],['N6','H',3.0,1.0,'sheet'],['N6','N7',3.75,1.0,'open'],['N7','N8',6.5,1.0,'sheet'],
  ['N8','H',6.0,1.0,'sheet'],['N8','NE',11.5,1.0,'open'],['NE','NX',9.9,1.1,'chain']
];
/* partitions inside a room: [room, axis, line, from, to]. Every room off the hall has one a step inside its doorway, so the doorway opens
   into a short entry and you turn into the room: from the hall you see the entry, never the room (and never the room across the hall) */
const PF_PARTS=[['S1','x',-2.4,-7.9,-5.6],['S3','x',-2.5,-4.2,.4],['S5','x',-2.4,3.4,6.4],['S8','x',-2.4,6.4,9.0],
  ['N1','x',2.4,-8.3,-5.5],['N3','x',2.4,-3.6,-1.5],['N6','x',2.4,1.9,4.5],['N8','x',2.4,4.5,7.8]];
const PF_START={x:-12.4,z:-8.6,to:[-11,-6.4]};
const PF_EXIT={x:13,z:9.9,w:1.1};

/* ---------- lookups ---------- */
function pfIn(r,x,z){ for(const q of r.rects) if(x>q[0]&&x<q[2]&&z>q[1]&&z<q[3]) return true; return false; }
function pfRoomRaw(x,z){ for(const r of PF.rooms) if(pfIn(r,x,z)) return r; return null; }
/* which room (x,z) is in, or null: a 0.25 m grid built with the floor */
function pfRoomAt(x,z){ if(!PF.grid) return pfRoomRaw(x,z); const i=Math.floor((x+RX)*4),k=Math.floor((z+RZ)*4); if(i<0||k<0||i>=PF.gw||k>=PF.gh) return null; const v=PF.grid[k*PF.gw+i]; return v>=0?PF.rooms[v]:null; }
/* rooms apart by way of the openings (holes count): 0 same room, 1 next door... */
function pfRoomsApart(a,b){ if(!a||!b) return 9; if(a===b) return 0; return (PF.hops[a.i]&&PF.hops[a.i][b.i])??9; }

/* ---------- walls from the rooms ---------- */
/* every edge of every room rectangle, cut where the room on the other side changes; edges inside the same room (an L) drop out */
function pfBoundaries(){ const xs=new Set(),zs=new Set(),e=1e-3; for(const r of PF.rooms) for(const q of r.rects){ xs.add(q[0]); xs.add(q[2]); zs.add(q[1]); zs.add(q[3]); }
  const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b),runs=[];
  for(const r of PF.rooms) for(const q of r.rects) for(const [axis,c,a,b,n] of [['x',q[1],q[0],q[2],1],['x',q[3],q[0],q[2],-1],['z',q[0],q[1],q[3],1],['z',q[2],q[1],q[3],-1]]){
    const pts=[a,...(axis==='x'?X:Z).filter(v=>v>a+e&&v<b-e),b]; let cur=null;
    for(let i=0;i<pts.length-1;i++){ const s0=pts[i],s1=pts[i+1],sm=(s0+s1)/2,o=axis==='x'?pfRoomRaw(sm,c-n*e):pfRoomRaw(c-n*e,sm);
      if(o===r){ cur=null; continue; }
      if(cur&&cur.nb===o&&Math.abs(cur.b-s0)<e) cur.b=s1; else { cur={room:r,axis,c,n,a:s0,b:s1,nb:o,gaps:[]}; runs.push(cur); } } }
  /* where each face ends: short of a corner it turns away from, past one it turns into (an L's inside corner), flush where only the
     neighbour changes */
  for(const R of runs){ const P=(s,off)=>R.axis==='x'?[s,R.c+off]:[R.c+off,s];
    const end=(s,dir)=>{ const [ix,iz]=P(s+dir*e,R.n*e),[ox,oz]=P(s+dir*e,-R.n*e); if(!pfIn(R.room,ix,iz)) return s-dir*PF_T/2; if(pfIn(R.room,ox,oz)) return s+dir*PF_T/2; return s; };
    R.fa=end(R.a,-1); R.fb=end(R.b,1); }
  return runs; }
/* the opening between a and b at pos: which wall it's on, and the gap in it */
function pfPlaceOpenings(){ PF.openings.length=0;
  for(let [a,b,pos,w,kind] of PF_OPEN){ const A=PF.byId[a],B=PF.byId[b]; const R=PF.runs.find(R=>R.room===A&&R.nb===B&&pos>R.a+w/2-.01&&pos<R.b-w/2+.01);
    if(!R){ console.warn('[pfloor] no wall for opening',a,b,pos); continue; }
    if(kind==='chain'&&PF.exitH){ w=PROP_DIMS.exitchain.open[0]; }
    const y1=kind==='hole'?PF_HOLE_H:kind==='chain'?(PF.exitH?PROP_DIMS.exitchain.open[1]:2.1):PF_DOOR_H,o={a,b,A,B,kind,axis:R.axis,c:R.c,s0:pos-w/2,s1:pos+w/2,w,y0:0,y1,pos,
      x:R.axis==='x'?pos:R.c,z:R.axis==='x'?R.c:pos};
    PF.openings.push(o);
    for(const R2 of PF.runs) if(R2.axis===R.axis&&Math.abs(R2.c-R.c)<1e-3&&(R2.room===A&&R2.nb===B||R2.room===B&&R2.nb===A)&&pos>R2.a&&pos<R2.b) R2.gaps.push(o); }
  /* windows on the outside walls */
  for(const r of PF.rooms) for(const [x,side] of r.win||[]){ const c=side*RZ,R=PF.runs.find(R=>R.room===r&&!R.nb&&R.axis==='x'&&Math.abs(R.c-c)<1e-3&&x>R.a+.8&&x<R.b-.8); if(!R) continue;
    R.gaps.push({kind:'win',axis:'x',c,s0:x-.7,s1:x+.7,y0:.9,y1:2.0,side,room:r,x,z:c}); } }

/* a wall face on line c, inward normal n, from s0 to s1 along, y0 to y1 up: cells of about .6 x .7 m so a bulb's pool lands on vertices.
   UVs in world space (1.2 m of paint across, floor to ceiling down), like the tower floors (twFaces) */
function pfFace(pot,m,axis,c,n,s0,s1,y0,y1){ if(s1-s0<.005||y1-y0<.005) return; const ax=axis==='x',off=c+n*PF_T/2,nrm=ax?[0,0,n]:[n,0,0],g=pot.raw(m);
  const nu=Math.max(1,Math.ceil((s1-s0)/.6-.01)),nv=Math.max(1,Math.ceil((y1-y0)/.7-.01)),P_=(s,y)=>ax?[s,y,off]:[off,y,s],U=s=>(ax?s:-s)*n/1.2;
  for(let i=0;i<nu;i++){ const sA=s0+(s1-s0)*i/nu,sB=s0+(s1-s0)*(i+1)/nu;
    for(let j=0;j<nv;j++){ const yA=y0+(y1-y0)*j/nv,yB=y0+(y1-y0)*(j+1)/nv,b=g.P.length/3; const cs=[[sA,yA],[sB,yA],[sB,yB],[sA,yB]]; if(n<0) cs.reverse(); if(!ax) cs.reverse();
      for(const [s,y] of cs) g.v(P_(s,y),nrm,[U(s),y/RH]); g.I.push(b,b+1,b+2,b,b+2,b+3); } } }
/* collision: a slab on the line, half a wall past each end (corners covered), split round the gaps. A crouch hole keeps a box over
   it from .95 m up (b.y0>0: passable below y0, for whoever can crouch; G's solidFor) */
function pfWallBoxes(R){ const T=PF_T,a=R.a-T/2,b=R.b+T/2,gaps=R.gaps.slice().sort((p,q)=>p.s0-q.s0); let s=a;
  const add=(s0,s1,y0,y1,kind)=>{ if(s1-s0<.01||y1-y0<.01) return null; return R.axis==='x'?addBox(s0,s1,R.c-T/2,R.c+T/2,y0,y1,kind):addBox(R.c-T/2,R.c+T/2,s0,s1,y0,y1,kind); };
  for(const g of gaps){ add(s,g.s0,0,RH,'wall'); const top=add(g.s0,g.s1,g.y1,RH,'wall'); if(top&&g.kind==='hole'){ top.hole=true; top.crouch=true; }
    if(g.y0>0) add(g.s0,g.s1,0,g.y0,'wall'); s=g.s1; }
  add(s,b,0,RH,'wall'); }

/* ---------- the look ---------- */
const PF_FLINT={check:0x7a7468,tile:0x8a8a82,conc:0x7a7672,rug:0x8a8278,oak:0x8a7e70};
const tPfNeon=tex(32,24,'#06070a',g=>{ R(g,'#0d0f14',0,0,32,24); R(g,'#1a1416',2,3,28,14); /* the sign across the street, half of it dead */
  const pk='#ff4fa8',bl='#4fb8ff'; text(g,'HOTEL',3,5,pk); R(g,'#3a1428',15,5,4,5); R(g,bl,2,3,28,1); R(g,bl,2,16,28,1); R(g,bl,2,3,1,14); R(g,'#16303e',29,3,1,14);
  for(let x=0;x<32;x+=3) R(g,'#c98a3a',x,21,1,2); R(g,'#2a2d30',0,19,32,1); });
const tPfSalida=tex(32,12,'#3a0606',g=>{ R(g,'#1a0202',0,0,32,12); R(g,'#e8261c',1,1,30,10); R(g,'#3a0606',2,2,28,8); text(g,'SALIDA',4,3,'#ff5a4a'); });
const tPfLift=tex(32,48,'#5c6268',g=>{ R(g,'#6c7278',0,0,15,48); R(g,'#646a70',17,0,15,48); R(g,'#2a2e32',15,0,2,48); for(let y=0;y<48;y+=12) R(g,'rgba(0,0,0,.12)',0,y,32,1);
  R(g,'#e8e2cf',3,18,26,10); text(g,'FUERA',5,19,'#a8241c'); text(g,'SERV',8,24,'#a8241c'); R(g,'rgba(60,40,20,.4)',0,40,32,8); });
const tPfHose=tex(16,24,'#8a1a14',g=>{ R(g,'#a8241c',1,1,14,22); R(g,'#2a3438',2,2,12,14); ell(g,8,9,4,4,'#c9473a'); ell(g,8,9,2,2,'#2a3438'); text(g,'AGUA',1,18,'#e8e2cf'); });
const tPfWater=tex(32,32,null,g=>{ const r=rng(8501); for(let y=0;y<32;y++) for(let x=0;x<32;x++){ const d=Math.hypot((x-16)/15,(y-16)/12)+(r()-.5)*.3; if(d<1) R(g,d<.75?'rgba(20,28,32,.9)':'rgba(26,34,38,.75)',x,y,1,1); }
  for(let i=0;i<6;i++) R(g,'rgba(160,180,190,.35)',4+r()*24|0,4+r()*24|0,3,1); });
/* plastic sheeting: the renderer cuts but doesn't blend, so it's see-through by a screen-door pattern, denser where it's folded and dirty */
const tPfPlastic=tex(32,64,null,g=>{ const r=rng(8504); for(let y=0;y<64;y++) for(let x=0;x<32;x++){ const fold=(x%8===3)||(x%8===4),dirt=y>50||y<3,keep=fold||dirt||((x+y)&1)===0&&r()<.8; if(keep) R(g,dirt?'rgba(96,86,66,1)':fold?'rgba(214,220,212,1)':'rgba(170,180,176,1)',x,y,1,1); } });
const tPfStream=tex(8,64,null,g=>{ const r=rng(8505); for(let y=0;y<64;y++) for(let x=0;x<8;x++) if(((x+y)&1)===0&&r()<.7||x===3&&r()<.8) R(g,r()<.3?'rgba(200,214,220,1)':'rgba(120,140,150,1)',x,y,1,1); });
const tPfDrywall=cl(16,16,'#b8b4a8',10,8502,g=>{ R(g,'#9a968a',0,7,16,1); R(g,'rgba(80,70,50,.3)',0,12,16,4); });
const tPfCement=cl(16,16,'#8a8270',12,8503,g=>{ R(g,'#6a6252',0,0,16,3); text(g,'CEM',2,6,'#3a3226'); });
const tPfSheet=[tex(8,16,'#d8d2c2',g=>{ R(g,'#c4bca8',0,12,8,4); }),tex(8,16,'#8a9ab0',g=>{ for(let y=0;y<16;y+=4) R(g,'#7a8aa0',0,y,8,2); }),tex(8,16,'#b07a6a',g=>{ R(g,'#9a6a5a',3,0,2,16); })];
function pfPaper(k){ if(k==='hall') return M(tTwHall); if(k==='stair') return M(tStairWall); return M(TW_PAPER[k]||TW_PAPER.peel); }

/* ---------- furniture ----------
   H's prop() when it's there (it returns world-space solids and hiding spots and draws into the floor); until then the floor's own
   pieces (FURN) or boxes. Everything is in the room data below so the floor can be laid out before the models exist */
const PF_FB={ /* fallback footprints [w,d,h] for kinds FURN doesn't build */
  tub:[1.6,.75,.6],bed:[2.0,1.0,.68],shelf:[1.2,.45,1.8],chair:[.45,.45,.9],cardtable:[1.0,1.0,.77],laundry:[2.4,.2,1.8],pipeburst:[.6,.6,2.8],rebar:[1.2,.3,1.2],sheeting:[2.0,.05,2.4],mattresses:[1.9,.95,1.1],
  sofa:[2.0,.85,.9],kitchen:[2.0,.6,.92],drywall:[1.3,.3,1.75],cement:[.9,.6,.5],toilet:[.4,.6,.75],sink:[.5,.4,.85],washer:[.6,.6,.85],heater:[.5,.5,1.4],shrine:[.6,.35,.8],lamp:[.3,.3,1.4],crates:[1.2,.9,1.1] };
const PF_FURN={sofa:'couch',kitchen:'counter',mattresses:null,cardtable:'table',bed:null};
/* H's prop() builds a bed lengthwise along its local z; FURN's along x. Everything else shares "front +z, back on -z" */
const PF_HYAW={bed:Math.PI/2};
/* o.hide: the floor's own spot for this piece if H's prop doesn't bring one (then H's spots win, with o.hide's note). o.own: always the
   floor's own model. o.h: H's options pass through (len, hideBehind, liveCurtain...) */
function pfProp(kind,x,z,ry=0,o={}){ const G=floorN,hasH=typeof prop==='function'&&typeof PROP_B!=='undefined'&&PROP_B[kind]&&!o.own;
  if(hasH){ try{ const S=prop(kind,G,x,z,ry+(PF_HYAW[kind]||0),o.opts||{}); S.boxes=[];
      for(const b of S.solids){ const bb=addBox(b.x0,b.x1,b.z0,b.z1,b.y0||0,b.h,b.kind==='door'?'furn':b.kind||'furn'); if(b.kind==='door') bb.door=true; if(b.y0>0) bb.under=true; S.boxes.push(bb); }
      if(typeof addSheet==='function') for(const b of S.sight){ const bb=addBox(b.x0,b.x1,b.z0,b.z1,b.y0,b.h,'sheet'); bb.sightOnly=true; S.boxes.push(bb); }
      for(const hd of S.hides) pfHide(Object.assign({},hd,{note:o.hide&&o.hide.note||hd.kind,id:'pf-'+kind+'-'+PF.hides.length}));
      if(S.curtain&&typeof hideLiveCurtain==='function'){ try{ S.live=hideLiveCurtain(S,x,z,ry+(PF_HYAW[kind]||0)); }catch(e){ console.warn('[pfloor] live curtain',kind,e); } } /* G: a curtain you push through, that stops eyes */
      if(S.opens&&typeof openReg==='function') openReg(S,x,z,ry+(PF_HYAW[kind]||0)); /* drawers, cupboard and fridge doors (87b-openables.js) */
      if(S.tick) PF.ticks.push(S); S.h=true; return S; }catch(e){ console.warn('[pfloor] prop',kind,e); } }
  if(o.hide) pfHide(o.hide);
  const fk=PF_FURN[kind]!==undefined?PF_FURN[kind]:kind;
  if(fk&&FURN[fk]){ const node=N(G,x,0,z,0,ry,0),info=FURN[fk](node); let [w,d]=info.size; if(Math.abs(Math.sin(ry))>.5) [w,d]=[d,w];
    if(!o.noBox) addBox(x-w/2,x+w/2,z-d/2,z+d/2,0,o.boxH||FURN_H[fk]||.8,'furn'); const rec={kind:fk,node,x,z,info,top:info.top}; PF.furn.push(rec); if(info.seat) PF.seats.push(rec); if(info.bed) PF.beds.push(rec); return rec; }
  const fb=PF_FB[kind]||[.6,.6,.8],[w0,d0,h]=fb,sw=Math.abs(Math.sin(ry))>.5,w=sw?d0:w0,d=sw?w0:d0,n=N(G,x,0,z,0,ry,0);
  pfModel(kind,n,w0,d0,h,o);
  if(!o.noBox&&kind!=='sheeting'&&kind!=='laundry'){ const b=addBox(x-w/2,x+w/2,z-d/2,z+d/2,kind==='bed'?PF_BED_UNDER:0,o.boxH||h,'furn'); if(kind==='bed') b.under=true; }
  return {kind,node:n,x,z,top:kind==='cement'?.28:null}; }
/* the floor's own pieces for what FURN doesn't have: plain, chunky, painted */
const PF_BED_UNDER=.42; /* the underside of a bed frame: crouched or lying, Ray goes under (86-hide.js) */
function pfModel(kind,n,w,d,h,o){ const mWh=M(tWhite),mGrey=M(null,{color:0x6a6c6a}),mRust=M(null,{color:0x5a3a26});
  if(kind==='bed'){ const u=PF_BED_UNDER; for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.06,u+.08,.06,{at:[0,(u+.08)/2,0]}),mWood,n,sx*(w/2-.05),0,sz*(d/2-.05));
    mk(box(w,.08,d),mWood,n,0,u+.04,0); mk(box(.06,.5,d),mWood,n,-w/2+.03,u+.25,0); const m=N(n,0,u+.08,0); FURN.mattress(m); return; }
  if(kind==='tub'){ mk(box(w,h,d,{at:[0,h/2,0]}),F(mWh,mWh,M(null,{color:0x8a8e8a})),n); mk(box(w-.12,.02,d-.12),M(null,{color:0x3a4448}),n,0,h-.04,0);
    if(typeof addSheet==='function'&&Math.abs(Math.sin(n.r[1]))<.5) addSheet({x:n.p[0]-w*.12,z:n.p[2]+Math.cos(n.r[1])*(d/2-.03),axis:'x',w:w*.75,h:1.98,kind:'plastic',y0:h+.02});
    else { mk(plane(w*.75,1.35),M(tPfPlastic,{cut:true,double:true}),n,-w*.12,h+.68,d/2-.03); mk(cyl(.008,.008,w,4),mSteel,n,0,1.98,d/2-.03,0,0,Math.PI/2); } }
  else if(kind==='shelf'){ for(const y of [.05,.6,1.15,1.7]) mk(box(w,.03,d),mGrey,n,0,y,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.03,h,.03,{at:[0,h/2,0]}),mGrey,n,sx*(w/2-.02),0,sz*(d/2-.02));
    const r=rng((n.p[0]*100+n.p[2]*7)|0); for(const y of [.07,.62,1.17]) for(let k=0;k<3;k++) if(r()<.75){ const bw=.2+r()*.2; mk(box(bw,.18+r()*.2,d*.8,{at:[0,.1,0]}),M(r()<.5?tTwBoxPlain:tCrate),n,-w/2+.2+k*(w/3),y,0,0,r()*.3,0); } }
  else if(kind==='chair'){ mk(box(.42,.04,.42),mWood,n,0,.45,0); mk(box(.42,.45,.04),mWood,n,0,.7,-.19); for(const [a,b] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]]) mk(box(.035,.45,.035,{at:[0,.225,0]}),mWood,n,a,0,b); }
  else if(kind==='mattresses'){ for(let k=0;k<4;k++){ const q=N(n,(k%2?.05:-.04),.14+k*.24,0,0,(k-1.5)*.08,0); mk(box(1.9,.22,.95,{at:[0,0,0]}),F(M(tMattress),M(tMattress),M(tMattress),M(tMattress,{repeat:[2,2]})),q); } }
  else if(kind==='laundry'&&typeof addSheet==='function'){ const ax=Math.abs(Math.sin(n.r[1]))>.5?'z':'x'; addSheet({x:n.p[0],z:n.p[2],axis:ax,w,h:1.95,kind:'sheet',y0:.42}); }
  else if(kind==='sheeting'&&typeof addSheet==='function'){ const ax=Math.abs(Math.sin(n.r[1]))>.5?'z':'x'; addSheet({x:n.p[0],z:n.p[2],axis:ax,w:o.len||w,h:2.7,kind:'plastic'}); }
  else if(kind==='laundry'){ /* a line strung across with sheets on it: sight goes no further, bodies push through */ mk(cyl(.005,.005,w,3),mBlack,n,0,1.95,0,0,0,Math.PI/2);
    const r=rng((n.p[0]*31+n.p[2]*17)|0); let x=-w/2+.15; while(x<w/2-.3){ const sw=.5+r()*.5; mk(plane(sw,1.5),M(tPfSheet[r()*3|0],{double:true}),n,x+sw/2,1.2,(r()-.5)*.06,0,(r()-.5)*.15,0); x+=sw+.04; } }
  else if(kind==='sheeting'){ const L=o.len||w; mk(plane(L,2.6),M(tPfPlastic,{cut:true,double:true}),n,0,1.35,0); mk(box(L,.04,.04),mWood,n,0,2.7,0); }
  else if(kind==='rebar'){ for(let k=0;k<6;k++) mk(cyl(.008,.008,.9+k%3*.2,4),mRust,n,-.5+k*.2,.5+(k%2)*.4,0,Math.PI/2+.3*(k%2?1:-1),0,(k-3)*.1); mk(box(1.2,.4,.25,{at:[0,.2,0]}),M(tConcrete),n); }
  else if(kind==='drywall'){ for(let k=0;k<4;k++) mk(box(1.3,1.75,.035),M(tPfDrywall),n,0,.875,-.12+k*.07,-.04,0,0); }
  else if(kind==='cement'){ for(let k=0;k<4;k++) mk(box(.42,.14,.62),M(tPfCement),n,(k%2-.5)*.45,.07+(k>>1)*.14,0,0,(k-1.5)*.1,0); }
  else if(kind==='toilet'){ mk(box(.36,.4,.5,{at:[0,.2,0]}),mWh,n,0,0,.05); mk(box(.38,.35,.16,{at:[0,.55,0]}),mWh,n,0,0,-.22); }
  else if(kind==='sink'){ mk(box(.5,.18,.4),mWh,n,0,.8,0); mk(cyl(.05,.05,.7,6,{at:[0,.35,0]}),mWh,n); mk(plane(.4,.5),M(null,{color:0x5a6a6e,emissive:0x0a0c0e}),n,0,1.35,-.19); }
  else if(kind==='washer'){ mk(box(.6,.85,.6,{at:[0,.425,0]}),F(mWh,mWh),n); mk(cyl(.17,.17,.02,10),M(null,{color:0x2a3438}),n,0,.5,.3,Math.PI/2,0,0); }
  else if(kind==='heater'){ mk(cyl(.24,.24,1.3,10,{at:[0,.75,0]}),[M(null,{color:0xa8a49a}),mGrey,mGrey],n); mk(cyl(.02,.02,1.2,4),mSteel,n,.1,2.2,0); }
  else if(kind==='shrine'){ mk(box(.6,.75,.35,{at:[0,.375,0]}),mWood,n); mk(plane(.32,.48),M(tTwVirgin),n,0,1.3,-.16); for(const [a,b] of [[-.18,.05],[-.06,.08],[.08,.04],[.2,.07]]) mk(cyl(.025,.025,.11,6,{at:[0,.055,0]}),[M(tTwCandle),M(null,{color:0xf2c230,unlit:true}),M(tTwCandle)],n,a,.75,b); }
  else if(kind==='lamp'){ mk(cyl(.12,.12,.03,8),mBlack,n,0,.02,0); mk(cyl(.012,.012,1.2,4,{at:[0,.6,0]}),mBlack,n); mk(cyl(.1,.18,.22,8),[M(null,{color:0xd8b880,unlit:true}),M(null,{color:0xf2e2a8,unlit:true}),M(null,{color:0xf2e2a8,unlit:true})],n,0,1.3,0); }
  else if(kind==='pipeburst'){ /* the pipe along the ceiling, split, water running down the wall into the room */ mk(cyl(.045,.045,3.2,6),M(tSteel,{color:0x6a6862}),n,0,RH-.14,0,0,0,Math.PI/2);
    const sp=N(n,.2,0,0); sp.live=true; PF.spray=sp; for(let k=0;k<3;k++) mk(plane(.05+k*.03,RH-.2),M(tPfStream,{cut:true,double:true,emissive:0x0a1014}),sp,(k-1)*.05,(RH-.2)/2,(k%2)*.03-.015,0,k*.9,0);
    mk(plane(1.1,.9),M(tPfWater,{cut:true}),n,0,.012,.2,-Math.PI/2,0,0); }
  else mk(box(w,h,d,{at:[0,h/2,0]}),M(tCrate),n); }
function pfHide(h){ const s=Object.assign({kind:'corner',yaw:0,w:.9,d:.7,h:1.4},h); s.id=s.id||'pf'+PF.hides.length; s.room=s.room||pfRoomRaw(s.x,s.z); PF.hides.push(s);
  if(typeof addHideSpot==='function'){ try{ s.spot=addHideSpot({id:s.id,kind:s.kind,x:s.x,z:s.z,yaw:s.yaw,w:s.w,d:s.d,h:s.h,y0:s.y0||0,open:s.open||null}); }catch(e){ console.warn('[pfloor] addHideSpot',e); } } return s; }

/* ---------- what's in each room: furniture, the details, the hiding spots, the lights ---------- */
function pfDress(A){ const P=pfProp,H=pfHide,L_=(p,c,d,kind,room)=>{ PF.lights.push({p,c,d,kind:kind||null,room:PF.byId[room],t0:Math.random()*9,w:0}); };
  const mTr=M(null,{color:0x2a241e,double:true}),T2=PF_T/2,top=(S,def)=>S&&S.top!=null?S.top:def,hasH=typeof PROP_B!=='undefined';
  /* where things lie: [x, surface y, z, yaw] */
  const SP=PF.spot={};
  /* the hall: one tube left that works, flickering; the barricade in the middle, piled so you weave through it */
  { for(const x of [-6,-2,2,6]){ const live=x===-6,m=live?M(tFluo,{unlit:true}):M(tFluoDead),t=mk(box(1.2,.05,.2),m,floorN,x,2.75,0); if(live){ t.live=true; PF.tube=m; } }
    L_([-6,2.5,0],[1.05,1.15,1.28],6,'flick','H');
    const b1=N(floorN,-1.1,0,-.45); mk(box(.8,1.75,1.25,{at:[0,.875,0]}),F(mWood,M(tDoorWood,{repeat:[2,1]})),b1,0,0,0,0,.06,0); mk(box(.2,1.0,1.2),M(tMattress),b1,.45,.62,0,0,0,-.2); mk(box(.5,.45,.5,{at:[0,.225,0]}),M(tCrate),b1,0,1.75,.2,0,.4,0);
    addBox(-1.5,-.7,-1.1,.2,0,1.85,'barricade');
    const b2=N(floorN,1.1,0,.45); mk(box(.7,1.7,1.2,{at:[0,.85,0]}),F(M(tFridge),M(tFridge)),b2,0,0,0,0,-.08,0); mk(box(.9,.05,.7),M(tWoodLight),b2,-.1,1.72,0,.4,.3,.1); for(const z of [-.5,.4]) mk(box(.5,.45,.5,{at:[0,.225,0]}),M(tCrate),b2,.55,0,z,0,.5+z,0);
    addBox(.7,1.5,-.2,1.1,0,1.8,'barricade');
    H({kind:'corner',x:2.1,z:.75,yaw:Math.PI/2,w:.7,d:.6,h:1.5,open:'-z',note:'behind the barricade'});
    /* the tenants' things put out in the hall: a fridge, a wardrobe. They also cut the long looks across it from door to door */
    P('fridge',-6.15,1.03-.35,Math.PI,{opts:{dead:true}}); P('wardrobe',4.05,1.03-.36,Math.PI); P('trash',-7.5,-.6,0);
    /* the dead lift at the west end, the hose cabinet at the east */
    A.pic(tPfLift,-8+T2+.012,1.1,0,Math.PI/2,1.3,2.2); mk(box(.06,2.3,1.5),mSteel,floorN,-8+T2+.03,1.15,0,0,0,0);
    mk(box(.12,.6,.42),F(M(tAxeRed),M(tPfHose)),floorN,8-T2-.06,1.3,-.3,0,-Math.PI/2,0);
    A.tag(1,-4.6,1.45,1); A.tag(4,2.6,1.5,-1);
    const pot=A.pot,mPipe=M(tSteel,{color:0x6a6862}),mRust=M(null,{color:0x4a3022});
    pot.cyl(mPipe,.045,.045,16,6,0,RH-.12,.72,0,0,Math.PI/2); pot.cyl(mRust,.03,.03,16,5,0,RH-.1,.55,0,0,Math.PI/2); pot.cyl(mPipe,.016,.016,16,4,0,RH-.05,-.7,0,0,Math.PI/2);
    for(let x=-7;x<=7;x+=2.2){ pot.box(mTr,.04,.1,.24,x,RH-.07,.64); pot.box(mTr,.03,.04,.06,x+.4,RH-.03,-.7); } }
  /* S0: the landing you came up to. The way down is chained behind you, the flight up is piled with furniture. A red sign over the way on */
  { A.pic(tPfSalida,-11,2.35,-6.4+T2+.012,0,.42,.16,{unlit:true}); A.pic(tPfSalida,-11,2.35,-6.4-T2-.012,Math.PI,.42,.16,{unlit:true});
    L_([-11,2.25,-6.4],[.95,.13,.1],4.6,'exit','S0'); P('crates',-10.75,-9.8,.2); A.bulb(-12,-8.4,false); }
  /* S1: the empty front room. A sofa pulled out from the wall (behind it, in the dark) */
  { P('sofa',-10.4,-2.45,Math.PI,{opts:{hideBehind:true},hide:{kind:'sofa',x:-10.4,z:-1.65,yaw:Math.PI,w:1.8,d:.55,h:.9,open:'-z',note:'behind the sofa'}});
    P('trash',-9.0,-5.85,0); P('wardrobe',-12+T2+.36,-4.3,Math.PI/2); A.bulb(-8.8,-3.8,false); A.tag(5,-9.2,1.5,0,{z:-6.4+T2+.01,ry:0}); }
  /* S2: a dark bedroom */
  { P('bed',-8.6,-11.2,0,{hide:{kind:'bed',x:-8.6,z:-11.2,yaw:0,w:2.0,d:1.0,h:PF_BED_UNDER,open:'+z',note:'under the bed'}}); P('wardrobe',-5.0,-12+T2+.36,0); P('trash',-9.4,-7.1,0); A.bulb(-7,-9.2,false); }
  /* S3: the TV room. The TV against the partition, the couch facing it, Rui watching */
  { const tv=P('tv',-3.0,-2.5-T2-.29,Math.PI); PF.tvS=tv&&tv.setTV?tv:null;
    P('sofa',-3.3,-4.7,0,{opts:{hideBehind:true},hide:{kind:'sofa',x:-3.3,z:-5.55,yaw:0,w:1.9,d:.65,h:.9,open:'-z',note:'behind the TV room sofa'}}); twVest(-3.0,.47,-4.72,.2); /* a SWAT vest thrown on the couch */
    for(const [x,z,y] of hasH?[[-3.55,-2.82,0],[-3.7,-2.95,0],[-1.9,-4.9,0]]:[[-2.85,-2.9,.92],[-3.15,-2.82,.92],[-1.9,-4.9,0]]) mk(cyl(.033,.033,.12,6,{at:[0,.06,0]}),[M(null,{color:0xb8b2a0}),M(null,{color:0x8a8478}),M(null,{color:0x8a8478})],floorN,x,y,z);
    P('trash',-.2,-5.9,0); L_([-3.0,.95,-3.4],[.42,.58,1.15],4.4,'tv','S3'); A.bulb(-3.2,-4.2,false); PF.tvAt=[-3.0,1.0,-2.85]; }
  /* S4: the bathroom. A curtain round the tub */
  { P('tub',-2.8,-9.2+T2+.37,0,{opts:{liveCurtain:true},hide:{kind:'tub',x:-2.8,z:-8.75,yaw:0,w:1.6,d:.75,h:1.9,open:'+z',note:'behind the tub curtain'}}); P('toilet',-3.65,-7.0,Math.PI/2); P('sink',-3.73,-7.8,Math.PI/2);
    SP.bathroom=[-3.65,.78,-6.95,0]; }
  /* S5: Doña Chela's kitchen. Her candles to the Virgin are the only light */
  { const k=P('kitchen',3.4,-6.4+T2+.31,0,{opts:{len:2.0}}); P('fridge',5.95,-6.4+T2+.34,0); P('table',2.2,-4.4,Math.PI/2); P('shrine',.95,-1.5,Math.PI);
    SP.chelaCounter=[2.8,top(k,.92),-6.0,-1.2]; SP.chelaStove=[3.9,top(k,.92),-6.0,.3];
    L_([.95,1.15,-1.9],[1.15,.68,.3],3.6,'candle','S5'); A.bulb(3.4,-3.8,false); }
  /* S6: her bedroom, round behind the bathroom. The wardrobe at the mouth of the alcove */
  { P('bed',1.4,-11.2,0); P('wardrobe',-1.0,-9.55,0,{hide:{kind:'wardrobe',x:-1.0,z:-9.55,yaw:0,w:1.0,d:.55,h:1.9,open:'+z',note:'in the wardrobe'}}); P('crates',-3.3,-11.5,0); P('trash',3.7,-7.2,0);
    A.frame(tTwPhotoMom,3.9,.92,-11.86,0); A.bulb(1.4,-9.2,false); }
  /* S7: the storeroom: mattresses piled up, shelves, crates */
  { P('mattresses',6.0,-12+T2+.53,0,{hide:{kind:'mattress',x:6.0,z:-10.6,yaw:0,w:1.9,d:.6,h:1.1,note:'among the mattresses'}}); const sh=P('shelf',10.4-T2-.21,-9.0,-Math.PI/2); P('shelf',8.6,-12+T2+.21,0); P('crates',5.1,-7.3,0);
    SP.storeShelf=sh&&sh.free?[10.4-T2-.21,sh.free.y,-9.0+.02,0]:[9.95,.615,-9.0,0]; A.bulb(7.4,-9.2,false); }
  /* S8: the flooded room: a pipe split along the east wall, water down it and across the floor */
  { const pb=P('pipeburst',12.4-T2-.2,-4.0,-Math.PI/2,{opts:{len:2.4},noBox:true}); PF.waterAt=pb&&pb.pts&&pb.pts.src?pb.pts.src:[11.6,2.2,-5.0];
    P('heater',11.85,-1.7,0); P('trash',7.2,-5.7,0); P('crates',11.6,-5.75,Math.PI/2);
    const mW=M(tPfWater,{cut:true}); for(const [x,z,s2] of [[10.4,-4.6,2.4],[8.6,-3.2,2.0],[11.2,-2.6,1.6],[9.4,-5.6,1.4],[9.5,-7.2,1.1]]) A.pot.quad(mW,[x,.006,z],[0,1,0],[1,0,0],[0,0,-1],s2,s2*.8);
    A.bulb(9.4,-3.8,false); }
  /* N1: Dani's kitchen. A bulb over the counter, rice on a plate, Dunne's watch beside it. His daughter on the fridge */
  { const k=P('kitchen',-12+T2+.31,3.6,Math.PI/2,{opts:{len:2.0}}); P('fridge',-12+T2+.34,5.7,Math.PI/2,{opts:{pics:[[tTwPhotoKid,.08,1.18,.12,.16],[tTwDrawing,-.12,1.42,.22,.22]]}}); /* his daughter on the fridge door: it swings with it */ const t=P('table',-9.4,3.8,0); P('trash',-6.1,5.8,0);
    const ct=top(k,.92); A.bulb(-11.0,3.6,true); L_([-11.0,2.25,3.6],[1.55,.9,.42],5.4,null,'N1');
    A.blk(.26,.02,.26,M(tTwRice),-11.6,ct+.015,3.35); A.blk(.22,.06,.22,M(tWhite),-11.62,ct+.03,3.95); twWatch(-11.5,ct+.01,3.0);
    SP.daniTable=[-9.45,top(t,.77),3.75,.6]; SP.daniCounter=[-11.5,ct,4.3,.4]; SP.daniStove=[-11.5,ct,2.85,1.2]; }
  /* N2: Dani's back room */
  { P('bed',-6.6,10.8,Math.PI,{hide:{kind:'bed',x:-6.6,z:10.8,yaw:Math.PI,w:2.0,d:1.0,h:PF_BED_UNDER,open:'+z',note:'under the bed'}}); P('wardrobe',-10+T2+.36,9.2,Math.PI/2); P('trash',-6.1,7.0,0); A.bulb(-7.8,9.2,false); SP.daniBack=[-9.3,.0,7.1,.4]; }
  /* N3: Kev's room, right through to the street. A wardrobe stood across the middle; his mattress by the window; the neon outside */
  { P('wardrobe',-4.1,6.5,0); P('crates',-5.0,6.4,Math.PI/2); H({kind:'corner',x:-4.1,z:7.05+(hasH?.08:0),yaw:0,w:.9,d:.5,h:1.9,open:'+z',note:'behind Kev\'s wardrobe'});
    P('mattress',-4.6,8.55,Math.PI/2); P('trash',-5.0,3.1,0);
    A.frame(tTwPhotoMom,-2.8,.92,11.86,Math.PI); A.bulb(-3.5,3.8,false); L_([-3.2,1.8,11.75],[1.3,.3,.95],5.2,'neon','N3'); }
  /* N4: the card room. A hot bulb low over the table, the pot in the middle, a badge in it */
  { const ct=P('cardtable',.75,9.4,0); P('chair',.75,8.55,0); P('chair',.75,10.25,Math.PI); P('sofa',.75,12-T2-.45,Math.PI); P('crates',-.9,7.0,0);
    const y=top(ct,.77); for(const [x,z,r] of [[.45,9.2,.2],[.6,9.65,-.4],[1.05,9.3,.9],[.95,9.6,.1]]) A.blk(.05,.003,.075,M(tTwCards),x,y+.005,z,r);
    for(const [x,z] of [[.7,9.42],[.77,9.38]]) A.blk(.1,.025,.05,M(tTwMoney),x,y+.015,z,.5); A.blk(.05,.006,.065,M(tTwBadge),.85,y+.02,9.48,.4);
    SP.cardTable=[.5,y,9.6,1.1]; SP.cardPot=[.95,y,9.3,0];
    A.bulb(.75,9.4,true,true,2.0); L_([.75,1.85,9.4],[1.6,1.0,.5],4.8,null,'N4'); }
  /* N5: the closet off it: coats on a rail, you stand in among them */
  { P('shelf',3.75,12-T2-.21,Math.PI); for(let k=0;k<4;k++) mk(box(.08,.95,.45),M(tPfSheet[k%3]),floorN,3.2+k*.3,1.35,10.4,0,.2*k,0); mk(cyl(.01,.01,1.4,4),mSteel,floorN,3.75,1.9,10.4,0,0,Math.PI/2);
    H({kind:'closet',x:3.75,z:10.6,yaw:Math.PI,w:1.2,d:1.5,h:1.9,open:'+z',note:'in the closet'}); }
  /* N6: the tenants' flat. A sheet in the doorway, a lamp, a wardrobe */
  { P('sofa',2.0,6.4-T2-.45,Math.PI); const t=P('table',3.4,3.0,Math.PI/2); P('wardrobe',-1.5+T2+.36,3.6,Math.PI/2,{hide:{kind:'wardrobe',x:-1.02,z:3.6,yaw:Math.PI/2,w:1.0,d:.55,h:1.9,open:'+z',note:'in the wardrobe'}});
    P('lamp',4.15,4.6,0); L_([4.15,1.35,4.5],[1.0,.74,.44],3.8,null,'N6'); P('trash',-.8,1.7,0); SP.tenantsTable=[3.4,top(t,.77),3.2,0]; }
  /* N7: the laundry: lines of washing across it, a washer, a sink */
  { P('shelf',4.9,7.5,Math.PI/2); P('laundry',6.7,8.4,0,{opts:{len:2.4},hide:{kind:'sheets',x:6.7,z:9.0,yaw:0,w:2.4,d:.7,h:1.8,note:'behind the sheets'}}); P('laundry',7.0,10.6,0,{opts:{len:2.4}});
    P('washer',8.55,11.55,0); P('sink',3.4,6.9,Math.PI); A.bulb(6,9.2,false); }
  /* N8: the gutted flat: bare block, plastic sheeting on battens, rebar, cement, a stack of drywall to get behind */
  { P('sheeting',8.6,3.6,Math.PI/2,{len:2.6,opts:{len:2.6}}); P('sheeting',10.6,2.4,0,{len:2.2,opts:{len:2.2}}); P('rebar',8.0,5.8,0); const cm=P('cement',5.4,5.7,0); P('cement',12.3,1.8,Math.PI/2);
    P('drywall',6.0,3.6,Math.PI/2); H({kind:'corner',x:5.25,z:3.5,yaw:-Math.PI/2,w:.7,d:1.3,h:1.75,open:'-z',note:'behind the drywall'});
    const cr=P('crates',12.3,3.9,Math.PI/2); H({kind:'corner',x:11.45,z:3.9,yaw:Math.PI/2,w:1.2,d:.6,h:1.1,open:'-z',note:'behind the crates'});
    SP.gutted=[5.4,top(cm,.28),5.7,2.1]; SP.guttedCrates=[12.3,1.1,3.9,.9]; SP.guttedFloor=[11.2,0,5.0,.2]; A.bulb(8.8,3.8,false); }
  /* NE: the stair door. Chained. A red sign over it */
  { if(!PF.exitH) A.pic(tPfSalida,13-T2-.012,2.35,9.9,-Math.PI/2,.42,.16,{unlit:true}); L_([12.5,2.3,9.9],[1.05,.15,.1],4.8,'exit','NE');
    P('crates',9.7,11.4,0); H({kind:'corner',x:9.7,z:10.55,yaw:0,w:.9,d:.6,h:1.1,open:'+z',note:'behind the crates'}); P('chair',12.2,7.2,.6); }
  /* the stairs up: their caged lamp comes on when the door opens */
  L_([16.55,3.25,10.1],[1.2,.9,.55],6.2,'stairs','NX');
}
function mRustM(){ return M(null,{color:0x5a3a26}); }

/* ---------- building it ---------- */
const PF_DEF={n:1,name:'Floor 01',proto:true,kit:null, /* empty-handed: a bottle, a knife, a pan, the hammer are lying around; guns come off the men */
  cast:[
    {kind:'corner',name:'Dani',spots:[[-10.85,3.6,-Math.PI/2]],pose:'lean',extra:'I got a daughter— she\'s six—'},
    {kind:'vecino1',hidden:true,look:'any',name:'Kev',spots:[[-3.3,11.25,0],[-3.7,11.2,.2]],pose:'phone',extra:'I just held the door— I didn\'t shoot—'},
    {kind:'corner',name:'Mario',spots:[[.75,7.95,0]],pose:'watch',extra:'Take the vest! Take it!',vest:true,keys:true},
    {kind:'corner',name:'Rui',spots:[[-1.4,-4.0,-.93],[-4.9,-3.6,1.17]],pose:'watch',extra:'I\'m nineteen, man—'},
    {kind:'gunman',name:'Tito',spots:[[4.0,9.0,Math.PI]],pose:'idle',extra:'They made me look— they made me—',lead:true,
      hunt:{pts:null,calls:['Cop?','Come out, cop.','Landlord says six.','We only counted five.','I know you\'re hurt.','...cop?','You\'re bleeding, man. I can smell it.']}},
    {kind:'vecino1',look:'any',name:'Jojo',spots:[[5.6,8.4,Math.PI]],pose:'idle',extra:'My brother\'s on six— please—',follow:'Tito',
      hunt:{pts:null,calls:['Held the light. That\'s all.','...Tito, wait up.','Five helmets.','Where\'s the sixth?']}}],
  civ:[
    {kind:'abuela',civ:true,fem:true,old:true,name:'Doña Chela',spots:[[.95,-2.35,0]],pose:'idle',extra:'I\'m seventy-eight, mijo—'},
    {kind:'obrero',civ:true,look:'any',name:'Toño',spots:[[1.6,3.3,Math.PI/2],[2.2,4.5,Math.PI/2+.4]],pose:'lean',extra:'I work at the plant— I just work—'},
    {kind:'senora',civ:true,fem:true,name:'Carmen',spots:[[3.4,4.4,-Math.PI/2+.2]],pose:'idle',extra:'I don\'t know anything— I swear to God—'}],
  talk:[
    {who:['Dani'],r:3.8,lines:[['Dani','...the old one kept talking.'],['Dani','His daughter\'s wedding.'],['Dani','In June, he said.'],['Dani','I took his watch.'],['Dani','Eat your rice, Dani.']]},
    {who:['Rui'],r:3.8,lines:[['Rui','Jojo held the light. That\'s all.'],['Rui','Mario\'s keeping the vest.'],['Rui','Five helmets.'],['Rui','There were six.'],['Rui','So where\'s the sixth?'],['Rui','...turn it up, Rui.']]},
    {who:['Doña Chela'],r:3.8,lines:[['Doña Chela','Holy Mary, mother of God...'],['Doña Chela','Five boys. Five.'],['Doña Chela','Dani carried one past my door.'],['Doña Chela','His mother would die.']]},
    {who:['Toño'],r:3.8,lines:[['Toño','Don\'t open the door, Toño.'],['Toño','I heard it all through the floor.'],['Toño','Kev was crying after.'],['Toño','I just make tortillas. I just...']]},
    {who:['Carmen'],r:3.8,lines:[['Carmen','Dani, come to bed.'],['Carmen','Dani?'],['Carmen','Whose watch is that, Dani?'],['Carmen','...what did you do.']]},
    {who:['Kev'],r:3.8,lines:[['Kev','Ma. Ma, it\'s me.'],['Kev','I did something, Ma.'],['Kev','I just held the door.'],['Kev','I didn\'t shoot. I swear.'],['Kev','Pick up. Please.']]},
    {who:['Mario'],r:3.8,lines:[['Mario','It fits. The vest fits.'],['Mario','Bulletproof, man.'],['Mario','Let the sixth one come.'],['Mario','...it\'s heavy, though.']]}],
  /* the flashlight pair, out walking: what you hear as they pass */
  pairTalk:[['Tito','Landlord says six.'],['Jojo','I held the light. That\'s all I did.'],['Tito','Five helmets.'],['Jojo','There were six.'],['Tito','So where\'s the sixth?'],['Jojo','The girl was still breathing.'],['Tito','Don\'t. Keep looking.']],
  loot:[],clear:['FLOOR 01','You got out.']};
/* the pair's walk: every room a walker can get into, the long way round, the landing you came up to last */
const PF_ROUTE=[[4,9.0],[3.75,6.9],[3.3,5.6],[0,4.0],[1.3,1.75],[3.0,1.75],[3.0,.4],
  [6.0,.4],[6.0,1.75],[8.3,1.75],[9.8,3.6],[11.5,5.6],[11.4,8.2],[10.6,9.8],[11.4,8.2],[11.5,5.6],[9.8,3.6],[8.3,1.75],[6.0,1.75],[6.0,.4],
  [7.0,-.4],[7.0,-1.75],[9.5,-1.75],[9.6,-3.6],[9.5,-6.9],[7.4,-9.4],[9.5,-6.9],[9.6,-3.6],[9.5,-1.75],[7.0,-1.75],[7.0,-.4],
  [5.0,-.4],[5.0,-1.75],[2.9,-1.75],[3.3,-3.2],[1.5,-6.9],[1.5,-9.6],[-2.6,-10.6],[1.5,-9.6],[1.5,-6.9],[3.3,-3.2],[2.9,-1.75],[5.0,-1.75],[5.0,-.4],
  [-3.0,-.4],[-3.0,-1.8],[-4.8,-1.8],[-4.9,-3.6],[-2.5,-5.9],[-4.9,-3.6],[-4.8,-1.8],[-3.0,-1.8],[-3.0,-.4],
  [-6.5,-.4],[-6.5,-1.75],[-8.4,-1.75],[-8.8,-3.6],[-6.5,-6.9],[-7.6,-9.2],[-6.5,-6.9],[-9.6,-4.6],[-11,-6.9],[-12.4,-8.4],[-11,-6.9],[-9.6,-4.6],[-8.4,-1.75],[-6.5,-1.75],[-6.5,-.4],
  [-7.0,.4],[-7.0,1.75],[-8.8,1.75],[-8.6,5.2],[-8.5,6.9],[-7.4,8.8],[-8.5,6.9],[-8.6,5.2],[-8.8,1.75],[-7.0,1.75],[-7.0,.4],
  [-2.5,.4],[-2.5,1.75],[-4.4,1.75],[-4.4,3.6],[-2.6,5.0],[-2.4,7.6],[-2.6,10.4],[-.6,8.5],[2.2,9.0],[2.4,11.0],[3.7,11.0],[2.4,11.0],[-.6,8.5],[-2.4,7.6],[-2.6,5.0],[-4.4,3.6],[-4.4,1.75],[-2.5,1.75],[-2.5,.4],
  [3.0,.4],[3.0,1.75],[1.3,1.75],[0,4.0],[3.3,5.6],[3.75,6.9]];

function pfBuild(){ setWorld(18,12);
  disposeTree(floorN); floorN.kids.length=0; FLOOR.sky=null; FLOOR.far=null; BOXES.length=0; boxGridDirty=true; if(typeof FIRES!=='undefined') FIRES.length=0;
  Object.assign(FLOOR,{n:1,seed:0,test:false,camp:true,idx:1,def:PF_DEF,mode:'proto',doors:[],windows:[],power:true,flick:null,dormD:pnum('pfloor','dormD',6),down:false,goals:{},hot:[],noClear:true,
    stairUp:null,clearH:PF_DEF.clear[0],clearP:PF_DEF.clear[1],units:[],party:[],bx:99});
  const yaw0=Math.atan2(-(PF_START.to[0]-PF_START.x),-(PF_START.to[1]-PF_START.z)); FLOOR.start={x:PF_START.x,z:PF_START.z,yaw:yaw0};
  setLang(false); if(GAME.vision&&GAME.vision!=='off'&&typeof visionApply==='function'){ GAME.vision='off'; visionApply(); }
  const G=floorN; GEO_TEMP=true;
  PF.rooms=PF_ROOMS.map((r,i)=>Object.assign({},r,{i,x0:Math.min(...r.rects.map(q=>q[0])),z0:Math.min(...r.rects.map(q=>q[1])),x1:Math.max(...r.rects.map(q=>q[2])),z1:Math.max(...r.rects.map(q=>q[3])),lit:false,hides:[],props:[],who:[]}));
  PF.byId={}; for(const r of PF.rooms) PF.byId[r.id]=r; PF.grid=null; PF.hides.length=0; PF.lights.length=0; PF.furn=[]; PF.seats=[]; PF.beds=[]; PF.spray=null; PF.tube=null; PF.ticks=[]; PF.openables=[]; PF.tvS=null;
  PF.exitH=typeof PROP_B!=='undefined'&&!!PROP_B.exitchain; /* H's door, chain and sign when 87-props.js is in */
  PF.runs=pfBoundaries(); pfPlaceOpenings();
  /* the paint: each room its own side of every wall it has */
  const pot=twPot(),mTrim=M(null,{color:0x2a241e,double:true}),mJamb=M(null,{color:0x5a5248,double:true}),mRough=M(null,{color:0x7a6a58,double:true}),paint={};
  const paintOf=r=>paint[r.id]||(paint[r.id]=pfPaper(r.paper));
  const skip=(r,R)=>r.noFace||r.shaft&&(R.axis==='x'?Math.max(R.a,R.fa)<r.shaft.x1-.01:R.c<r.shaft.x1-.01);
  for(const R of PF.runs){ const r=R.room; if(skip(r,R)&&!(r.noFace&&R.nb&&R.nb.id==='NE')) continue;
    const m=paintOf(r),gaps=R.gaps.slice().sort((p,q)=>p.s0-q.s0); let s=R.fa;
    for(const g of gaps){ pfFace(pot,m,R.axis,R.c,R.n,s,g.s0,0,RH); pfFace(pot,m,R.axis,R.c,R.n,g.s0,g.s1,g.y1,RH); if(g.y0>0) pfFace(pot,m,R.axis,R.c,R.n,g.s0,g.s1,0,g.y0); s=g.s1; }
    pfFace(pot,m,R.axis,R.c,R.n,s,R.fb,0,RH); }
  /* the partitions: both faces in the room's paint, a cap on a free end, a collision box */
  PF.parts=[]; for(const [id,axis,c,s0,s1] of PF_PARTS){ const r=PF.byId[id],m=paintOf(r),T=PF_T,ax=axis==='x';
    const edge=s=>ax?(Math.abs(s-r.x0)<.01||Math.abs(s-r.x1)<.01):(Math.abs(s-r.z0)<.01||Math.abs(s-r.z1)<.01),a=edge(s0)?s0+T/2:s0,b=edge(s1)?s1-T/2:s1;
    for(const n of [1,-1]) pfFace(pot,m,axis,c,n,a,b,0,RH);
    for(const [s,free,dir] of [[s0,!edge(s0),-1],[s1,!edge(s1),1]]) if(free) pot.quad(mJamb,ax?[s,RH/2,c]:[c,RH/2,s],ax?[dir,0,0]:[0,0,dir],ax?[0,0,1]:[1,0,0],[0,1,0],T/2,RH/2);
    const bx=ax?addBox(s0,s1,c-T/2,c+T/2,0,RH,'wall'):addBox(c-T/2,c+T/2,s0,s1,0,RH,'wall'); bx.part=true; PF.parts.push({room:r,axis,c,s0,s1}); }
  /* collision, once per wall (the room listed first owns it); the shafts bring their own */
  for(const R of PF.runs){ const r=R.room; if(R.nb&&R.nb.i<r.i&&!R.nb.noFace) continue; if(r.noFace&&!(R.nb&&R.nb.id==='NE')) continue; if(r.shaft&&R.axis==='x'&&R.b<=r.shaft.x1+.01) continue; if(r.shaft&&R.axis==='z'&&R.c<r.shaft.x1) continue;
    if(r.shaft&&R.axis==='x'&&R.a<r.shaft.x1){ const keep={...R,a:r.shaft.x1}; pfWallBoxes(keep); continue; }
    pfWallBoxes(R); }
  /* the openings: jambs and lintel across the wall's thickness, casings on doorways, broken block round the holes, the windows */
  const r2=rng(8519);
  for(const o of [...PF.openings,...PF.runs.flatMap(R=>R.gaps.filter(g=>g.kind==='win'&&R.room===g.room))]){ const ax=o.axis==='x',c=o.c,T=PF_T,mJ=o.kind==='hole'?mRough:mJamb;
    const at=(s,y,off=0)=>ax?[s,y,c+off]:[c+off,y,s],U=ax?[0,0,1]:[1,0,0],A=ax?[1,0,0]:[0,0,1];
    if(o.kind==='win'){ /* glass you can see the city through, a frame, a sill; curtains in some */ const x=o.x,z=c-o.side*.06;
      const gw=mk(plane(1.4,1.1),o.room.id==='N3'?M(tPfNeon,{unlit:true}):M(tNightWin,{unlit:true,color:0x8a8a8a}),G,x,1.45,z,0,o.side>0?Math.PI:0,0); gw.live=true; const wb=addBox(x-.7,x+.7,c-.07,c+.07,.9,2.0,'window'); wb.glass=gw; wb.side=o.side;
      const zi=c-o.side*.1; pot.box(mTrim,1.56,.05,.22,x,.88,zi); pot.box(mTrim,1.5,.07,.08,x,2.03,c-o.side*.05); for(const sx of [-1,1]) pot.box(mTrim,.07,1.15,.08,x+sx*.72,1.45,c-o.side*.05); pot.box(mTrim,.04,1.1,.04,x,1.45,c-o.side*.07);
      if(o.room.id!=='N3'&&r2()<.7){ const cm=[M(null,{color:0x6a2a24}),M(null,{color:0x8a7a52}),M(null,{color:0x3a4a5a})][r2()*3|0],sx=r2()<.5?-1:1; pot.box(cm,.5,1.35,.04,x+sx*.55,1.35,c-o.side*.18,0,0,sx*.03); pot.box(mTrim,1.8,.03,.03,x,2.1,c-o.side*.18); }
      continue; }
    for(const [s,dir] of [[o.s0,1],[o.s1,-1]]) pot.quad(mJ,at(s,o.y1/2),dir>0?A:[-A[0],0,-A[2]],U,[0,1,0],T/2,o.y1/2);
    pot.quad(mJ,at((o.s0+o.s1)/2,o.y1),[0,-1,0],A,U,o.w/2,T/2);
    if(o.kind==='hole'){ /* knocked through: plaster and brick on the floor either side, the edge broken */
      const mDeb=M(null,{color:0x8a8478}),mBr=M(null,{color:0x7a4a34});
      for(let q=0;q<12;q++){ const sd=r2()<.5?-1:1,s=o.s0-.2+r2()*(o.w+.4),off=sd*(.12+r2()*.55),p=at(s,.03,off); pot.box(q%3?mDeb:mBr,.08+r2()*.14,.04+r2()*.05,.06+r2()*.12,p[0],p[1],p[2],r2()*6); }
      for(let q=0;q<5;q++){ const s=o.s0+r2()*o.w,p=at(s,o.y1+.03,(r2()-.5)*.1); pot.box(mBr,.18,.07,.1,p[0],p[1]-.05,p[2],ax?0:Math.PI/2); }
      continue; }
    if(o.kind==='chain') continue;
    /* casings: both faces of the wall */
    const bx=(w,h,d,s,y)=>{ const p=at(s,y); if(ax) pot.box(mTrim,w,h,d,p[0],p[1],p[2]); else pot.box(mTrim,d,h,w,p[0],p[1],p[2]); };
    bx(.08,o.y1+.13,T+.1,o.s0-.04,(o.y1+.13)/2); bx(.08,o.y1+.13,T+.1,o.s1+.04,(o.y1+.13)/2); bx(o.w+.16,.09,T+.1,(o.s0+o.s1)/2,o.y1+.045);
    if(o.kind==='sheet'&&typeof addSheet==='function'){ try{ addSheet({x:o.x,z:o.z,axis:o.axis,w:o.w,h:o.y1,kind:o.A.id==='N8'||o.B.id==='N8'?'plastic':'sheet'}); }catch(e){ console.warn('[pfloor] addSheet',e); } } }
  /* floors and ceilings, room by room, in fine cells so the pools of light are round; water stains on both */
  const mCeil=M(tConcrete,{repeat:[1,1],color:0x6a6866}),mSt=M(tTwStain,{cut:true});
  for(const r of PF.rooms){ const fl=r.fl==='hall'?null:r.fl;
    for(const q of r.floorRects||r.rects){ const w=q[2]-q[0],d=q[3]-q[1],cx=(q[0]+q[2])/2,cz=(q[1]+q[3])/2;
      const big=fl==='check'||fl==='tile'||fl==='rug'||fl==='oak'||fl==='conc',mF=fl?M(TW_FLOORS[fl]||TW_FLOORS.old,{repeat:big?[w,d]:[w/1.6,d/1.6],color:PF_FLINT[fl]??0xffffff}):M(tLinoHall,{repeat:[w/2,d/2]});
      mk(plane(w,d,Math.ceil(w*2),Math.ceil(d*2)),mF,G,cx,.002,cz,-Math.PI/2);
      mk(plane(w,d,Math.ceil(w*1.5),Math.ceil(d*1.5)),M(tConcrete,{repeat:[w/2,d/2],color:0x6a6866}),G,cx,RH,cz,Math.PI/2);
      const n=Math.round(w*d/9); for(let k=0;k<n;k++){ const x=q[0]+.5+r2()*(w-1),z=q[1]+.5+r2()*(d-1),sz=.4+r2()*.9; pot.quad(mSt,[x,RH-.004,z],[0,-1,0],[1,0,0],[0,0,1],sz,sz*.8); if(r2()<.5) pot.quad(mSt,[x+r2()-.5,.008,z+r2()-.5],[0,1,0],[1,0,0],[0,0,-1],sz*.8,sz*.6); } } }
  /* the stairwells: real switchbacks from the tower (twShaft), turned into their corners: in at the south-west, up at the north-east */
  const blocked=[],tl0=TL;
  const shaft=(sx,role,tl,dz)=>{ TL=tl; const g=N(G,0,0,dz),b0=BOXES.length,k0=blocked.length; twShaft(g,sx,role,1,blocked); for(let i=b0;i<BOXES.length;i++){ BOXES[i].z0+=dz; BOXES[i].z1+=dz; } for(let i=k0;i<blocked.length;i++){ blocked[i][1]+=dz; blocked[i][3]+=dz; } };
  shaft(-1,'in',14,-8.4); shaft(1,'up',13,9.2); TL=tl0; PF.shaftRects=blocked.slice();
  /* what's in it, who lives there */
  const furn=[],seats=[],beds=[],lights=[],anim=[],A=twKit(G,furn,seats,beds,lights,anim); A.pot=pot;
  A.tag=(i,x,y,side,o)=>{ if(o) mk(plane(1.6,.4),M(TAGS[i],{cut:true}),G,x,y,o.z,0,o.ry,0); else mk(plane(1.6,.4),M(TAGS[i],{cut:true}),G,x,y,side*(1.1-PF_T/2-.01),0,side>0?Math.PI:0,0); };
  if(typeof pfSwKit==='function') pfSwKit(A); /* light switches (85b-switches.js): it keeps the bulbs */
  pfDress(A); pfExitBuild(G,pot); pfClutter(pot,r2);
  pot.flush(G);
  GEO_TEMP=false;
  meshMerge(floorN,{tile:PF_MERGE_TILE});
  /* where people walk: inside a room, clear of anything below 1.5 m (crouch holes and the shafts blocked); a second grid with the holes
     open for whoever can crouch through them (FLOOR.navHole) */
  const nav=new Uint8Array(NX*NZ),navH=new Uint8Array(NX*NZ),space=new Int16Array(NX*NZ).fill(-9);
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const x=cellX(i),z=cellZ(k),id=k*NX+i,r=pfRoomRaw(x,z)||pfRoomRaw(x+.01,z+.01);
    let sp=-9; if(r) sp=r.id==='H'?-1:r.env==='stair'?-2:r.i; space[id]=sp;
    let bl=!r||r.id==='NX'&&x>13.6, blH=bl; if(!bl&&blocked.some(q=>x>q[0]&&x<q[2]&&z>q[1]&&z<q[3])) bl=blH=true;
    if(!bl) for(const b of boxesAt(x,z)){ if(b.y0>1.5||b.h<.25) continue; if(x>b.x0-.22&&x<b.x1+.22&&z>b.z0-.22&&z<b.z1+.22){ bl=true; if(!b.hole) blH=true; if(blH) break; } }
    nav[id]=bl?1:0; navH[id]=blH?1:0; }
  /* a doorway cell sits on the wall line: the opening's own cells are open in both */
  /* (the cell column nearest the opening's middle, in the rows that sit in the wall: the jambs' padding would close a 1 m doorway on a .5 m grid) */
  for(const o of PF.openings){ if(o.kind==='chain') continue; const tgt=o.kind==='hole'?[navH]:[nav,navH],sc=Math.round(o.pos*2)/2;
    for(let d=-1;d<=1;d+=.5){ if(Math.abs(Math.round((o.c+d)*2)/2-o.c)>.36) continue; const rc=Math.round((o.c+d)*2)/2,c=o.axis==='x'?navCell(sc,rc):navCell(rc,sc); if(c>=0) for(const T_ of tgt) T_[c]=0; } }
  Object.assign(FLOOR,{nav,navHole:navH,space,seats:PF.seats,beds:PF.beds,furn:PF.furn,lights:PF.lights.map(l=>[l.p,l.c,l.d]),anim:[]});
  /* the room grid, and how many rooms apart each pair is */
  PF.gw=RX*8; PF.gh=RZ*8; PF.grid=new Int16Array(PF.gw*PF.gh).fill(-1); for(let k=0;k<PF.gh;k++) for(let i=0;i<PF.gw;i++){ const r=pfRoomRaw(-RX+(i+.5)/4,-RZ+(k+.5)/4); if(r) PF.grid[k*PF.gw+i]=r.i; }
  const adj=PF.rooms.map(()=>new Set()); for(const o of PF.openings){ adj[o.A.i].add(o.B.i); adj[o.B.i].add(o.A.i); }
  PF.hops=PF.rooms.map((_,s)=>{ const d=new Array(PF.rooms.length).fill(9); d[s]=0; const q=[s]; while(q.length){ const a=q.shift(); for(const b of adj[a]) if(d[b]>d[a]+1){ d[b]=d[a]+1; q.push(b); } } return d; });
  for(const r of PF.rooms){ r.hides=PF.hides.filter(h=>h.room===r); r.lit=PF.lights.some(l=>l.room===r&&l.kind!=='stairs'); r.exits=PF.openings.filter(o=>o.A===r||o.B===r).length; }
  setLights({amb:[.15,.145,.17],dir:[.3,1,.4],dirCol:[.05,.05,.07],fog:[.012,.012,.016],fogNear:6,fogFar:19,pl:[[[0,-50,0],[0,0,0],1]]});
  boxGridDirty=true; navDirty=true; NAVF.clear(); navGen++;
  const tag=$('floorTag'); if(tag) tag.textContent='Floor 01 · prototype';
  PF.built=true; }

/* stuff along the walls: bags, bottles, cans, clothes, papers, shoes. Out of the doorways and the furniture */
function pfClutter(pot,r){ const mBag=M(null,{color:0x16181a}),mBottle=M(null,{color:0x2e5a34}),mCan=M(null,{color:0x8a8e90}),mCloth=M(null,{color:0x4a5260}),mPaper=M(null,{color:0xb8b0a0}),mShoe=M(null,{color:0x2a2420});
  for(const rm of PF.rooms){ if(rm.env==='stair'||rm.id==='H'||rm.id==='N5'||rm.id==='S4') continue; const q=rm.rects[0],n=3+(r()*4|0);
    for(let t=0,k=0;t<50&&k<n;t++){ const side=r()*4|0; let x,z; const m=.35;
      if(side<2){ x=q[0]+m+r()*(q[2]-q[0]-2*m); z=side?q[3]-m:q[1]+m; } else { z=q[1]+m+r()*(q[3]-q[1]-2*m); x=side===3?q[2]-m:q[0]+m; }
      if(pfRoomRaw(x,z)!==rm) continue; if(PF.openings.some(o=>Math.hypot(x-o.x,z-o.z)<1.1)) continue;
      if(BOXES.some(b=>b.kind!=='wall'&&x>b.x0-.25&&x<b.x1+.25&&z>b.z0-.25&&z<b.z1+.25)) continue;
      const ry=r()*6.28,kind=r(); k++;
      if(kind<.22){ pot.box(mBag,.42,.34,.36,x,.17,z,ry); pot.box(mBag,.12,.08,.1,x,.38,z,ry); }
      else if(kind<.42){ for(let s=0;s<1+(r()*3|0);s++){ const lay=r()<.5; pot.cyl(mBottle,.028,.034,.24,6,x+(r()-.5)*.3,lay?.034:.12,z+(r()-.5)*.3,r()*6,lay?Math.PI/2:0,0); } }
      else if(kind<.58){ for(let s=0;s<2+(r()*3|0);s++) pot.cyl(mCan,.033,.033,.12,6,x+(r()-.5)*.35,.033,z+(r()-.5)*.35,r()*6,Math.PI/2,0); }
      else if(kind<.74){ pot.box(mCloth,.5,.08,.38,x,.04,z,ry); pot.box(mCloth,.3,.06,.28,x+.08,.1,z,ry+.6); }
      else if(kind<.88){ for(let s=0;s<3;s++) pot.box(mPaper,.3,.006,.22,x+(r()-.5)*.25,.003+s*.006,z+(r()-.5)*.25,r()*6); }
      else { pot.box(mShoe,.11,.09,.28,x,.045,z,ry); pot.box(mShoe,.11,.09,.28,x+.16,.045,z+.05,ry+.3); } } } }

/* ---------- the way out: the stairwell door, chained through its handle to the frame ---------- */
const mPfDoor=M(cl(16,32,'#4a5a52',14,8510,g=>{ R(g,'#3e4c45',0,0,16,1); R(g,'#3e4c45',0,31,16,1); R(g,'rgba(90,50,20,.45)',0,24,16,8); R(g,'rgba(90,50,20,.3)',11,3,3,8); R(g,'#2a2e2a',2,14,3,1); }));
function pfExitBuild(G){ const x=PF_EXIT.x;
  if(PF.exitH){ const S=pfProp('exitchain',x,PF_EXIT.z,-Math.PI/2); const db=S.boxes.find(b=>b.door);
    PF.exit={S,x:12.45,z:PF_EXIT.z,at:S.pts.cutAt,lock:S.pts.lock,box:db,boxDims:db&&[db.x0,db.x1,db.z0,db.z1,db.y0,db.h],open:false,ang:0,t:0}; return; }
  const z0=PF_EXIT.z-PF_EXIT.w/2,z1=PF_EXIT.z+PF_EXIT.w/2;
  /* a steel frame round the opening, both sides */
  for(const sx of [-1,1]){ const fx=x+sx*(PF_T/2+.02); mk(box(.05,2.16,.07),mSteel,G,fx,1.08,z0-.035); mk(box(.05,2.16,.07),mSteel,G,fx,1.08,z1+.035); mk(box(.05,.07,PF_EXIT.w+.14),mSteel,G,fx,2.135,PF_EXIT.z); }
  /* the leaf, hinged on the north jamb, opening into the stairwell */
  const hinge=N(G,x+.02,0,z1); hinge.live=true; const leaf=mk(box(.05,2.06,PF_EXIT.w-.04,{at:[0,1.03,-(PF_EXIT.w-.04)/2]}),F(mPfDoor,mPfDoor),hinge);
  mk(box(.04,.03,.18),mSteel,hinge,-.05,1.0,-(PF_EXIT.w-.14)); mk(box(.03,.12,.03),mSteel,hinge,-.06,1.0,-(PF_EXIT.w-.06)); /* the pull handle */
  mk(box(.02,.22,.12),M(null,{color:0x8a8478}),hinge,-.03,1.5,-(PF_EXIT.w-.04)/2); /* a sticker: the floor's number, half peeled */
  /* the chain: from the handle round a pipe on the wall, and the padlock */
  const ch=N(G,0,0,0); ch.live=true; const mL=M(tSteel,{color:0xd8d8d0,emissive:0x2a2826}),pp=[x-.06,1.0,z0+.07],pe=[x-.1,1.0,z0-.22];
  mk(cyl(.025,.025,2.6,6),M(tSteel,{color:0x6a6862}),G,x-PF_T/2-.05,1.3,z0-.22); /* the pipe it's wrapped round */
  for(let k=0;k<9;k++){ const t=k/8,p=[pp[0]+(pe[0]-pp[0])*t-.02*Math.sin(t*Math.PI),pp[1]-.09*Math.sin(t*Math.PI)+(k%2)*.004,pp[2]+(pe[2]-pp[2])*t]; mk(torus(.024,.006,4,8),mL,ch,p[0],p[1],p[2],k%2?Math.PI/2:0,k%2?0:Math.PI/2,0); }
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; mk(torus(.024,.006,4,8),mL,ch,pe[0]+Math.cos(a)*.045,1.0+Math.sin(a)*.03,pe[2]+Math.sin(a)*.045,0,a,0); }
  const lock=N(ch,pp[0]-.01,.86,pp[2]+.03); mk(box(.05,.06,.022),M(null,{color:0xb8902e,emissive:0x1a1204}),lock); mk(torus(.017,.005,4,8),mSteel,lock,0,.045,0);
  /* what's left of it once it's off */
  const off=N(G,x-.4,.01,z0+.1); off.live=true; off.vis=false; for(let k=0;k<8;k++) mk(torus(.024,.006,4,8),mL,off,(k%4)*.04,.006,(k>>2)*.05+k*.01,Math.PI/2,k*.7,0); mk(box(.05,.022,.06),M(null,{color:0xb8902e}),off,.18,.012,.05);
  PF.exit={hinge,leaf,chain:ch,off,x:12.45,z:PF_EXIT.z,lock:[pp[0]-.01,.88,pp[2]+.03],at:[x-.08,1.0,PF_EXIT.z-.3],box:null,open:false,ang:0,t:0}; }
function pfExitReset(){ const X=PF.exit; if(!X) return; if(X.box) removeBox(X.box);
  if(X.S){ const d=X.boxDims; X.box=d?addBox(d[0],d[1],d[2],d[3],d[4],d[5],'furn'):null; if(X.box) X.box.door=true; X.S.open(0); if(X.S.chain) X.S.chain.vis=true; if(X.S.chainCut) X.S.chainCut.vis=false; }
  else { X.box=addBox(PF_EXIT.x-.02,PF_EXIT.x+.08,PF_EXIT.z-PF_EXIT.w/2,PF_EXIT.z+PF_EXIT.w/2,0,2.1,'door'); X.hinge.r=[0,0,0]; X.chain.vis=true; X.off.vis=false; }
  X.open=false; X.how=null; X.ang=0; X.t=0; X.holdT=0; X.creak=false; boxGridDirty=true; }
/* the chain comes off: a bolt cutter (loud) or Mario's keys (quiet). The door goes on its own */
function pfOpen(how){ const X=PF.exit; if(!X||X.open) return false; X.open=true; X.how=how; X.t=0; const p=X.lock;
  if(how==='cut'){ sfx('ric',1.2,p); sfx('shell',1,p); sfx('bump',.9,p); noise([p[0],0,p[2]],pnum('pfloor','snapR',8),{}); }
  else { sfx('click',.9,p); setTimeout(()=>sfx('click',.7,p),180); noise([p[0],0,p[2]],2,{}); }
  if(X.S) X.S.cut(); else { X.chain.vis=false; X.off.vis=true; } if(X.box){ removeBox(X.box); X.box=null; } boxGridDirty=true;
  for(const h of [HANDS.L,HANDS.R]) if(XR.on&&h.item&&pfToolOf(h.item)) buzz(h.hand,1,how==='cut'?120:40);
  protoEmit('chain',how); protoEmit('stat','pf.open',how); return true; }

/* ---------- the tools: whatever H calls them, or the floor's own until H's are in ---------- */
function pfBuildCutter(g){ const mH=M(null,{color:0xa8241c}),mS=M(tSteel,{color:0x8a8e90}),mJ=M(tSteel,{color:0x4a4e52});
  for(const s of [-1,1]){ mk(box(.024,.024,.32),mS,g,s*.016,0,.16,0,s*.03,0); mk(cyl(.017,.017,.16,6),mH,g,s*.018,0,-.02,Math.PI/2,0,0); }
  mk(box(.06,.03,.07),mJ,g,0,0,.35); mk(box(.022,.026,.11),mJ,g,-.012,0,.43,0,.08,0); mk(box(.022,.026,.11),mJ,g,.012,0,.43,0,-.08,0); mk(cyl(.012,.012,.05,6),mS,g,0,0,.35,0,0,Math.PI/2); }
function pfBuildKeys(g){ const mS=M(tSteel,{color:0xb8b4a8}),mB=M(null,{color:0xb8902e});
  mk(torus(.022,.004,4,8),mS,g,0,0,0); for(let k=0;k<3;k++){ const n=N(g,0,-.02,0,0,0,(k-1)*.35); mk(box(.012,.05,.003),k===1?mB:mS,n,0,-.03,0); mk(box(.02,.016,.004),k===1?mB:mS,n,0,-.005,0); } }
function pfEnsureTools(){ if(!WPN.cutter) WPN.cutter={label:'Bolt cutter',build:pfBuildCutter,grip:[0,0,0],melee:'blunt',reach:1.2,pts:[[0,0,.42],[0,0,.24]],speed:1.7,mass:2.2,tool:'cutter',tip:[0,0,.45],pfOwn:true};
  if(!WPN.keys) WPN.keys={label:'Keyring',build:pfBuildKeys,grip:[0,0,0],melee:'blunt',reach:.9,pts:[[0,-.03,0]],speed:1.5,mass:.1,tool:'keys',tip:[0,-.04,0],pfOwn:true};
  if(PICK_NAMES&&!PICK_NAMES.cutter){ PICK_NAMES.cutter='Bolt cutter'; PICK_NAMES.keys='Keyring'; } }
const pfToolOf=it=>it&&WPN[it.key]&&(WPN[it.key].tool==='cutter'||WPN[it.key].tool==='keys')?WPN[it.key].tool:null;
/* the working end of a tool held in hand h, in the world */
function pfTip(h){ const w=WPN[h.item.key]; let t=w.jaw||w.tip; if(!t&&w.strike&&w.strike[0]) t=w.strike[0].b; if(!t) t=[0,0,.4]; return h.itemNode?mulP(itemM(h),t):mulP(h.M,FIST); }

/* ---------- the people ---------- */
const PF_HALLWAY=[];
function pfCast(){ for(const c of PF_DEF.cast) if(c.hunt&&!c.hunt.pts) c.hunt.pts=PF_ROUTE;
  twCast(); /* the tower's own: wardrobe, poses, tenants, the flashlight pair's torches, FLOOR.convos from PF_DEF.talk */
  const by=n=>enemies.find(E=>E.name===n);
  for(const c of PF_DEF.cast){ const E=by(c.name); if(!E) continue; const r=pfRoomAt(E.pos[0],E.pos[1]); if(r) r.who.push(E.name);
    if(c.vest){ E.vest=true; const o=E.C.o,dz=(o.torsoD||.26)*.5+.006,y=o.torso*.66,hh=o.torso*.5,mV=M(tTwVest); /* the team's vest: a plate front and back over his chest, straps over the shoulders */
      mk(box(.33,hh,.02),mNavy,E.J.spine,0,y,dz); mk(box(.35,hh*1.05,.02),F(mNavy,mNavy,mNavy,mNavy,mV,mNavy),E.J.spine,0,y,-dz-.002,0,Math.PI,0);
      for(const sx of [-1,1]){ mk(box(.025,hh*.7,dz*2),mNavy,E.J.spine,sx*.17,y-hh*.12,0); mk(box(.06,.02,dz*2+.02),mNavy,E.J.spine,sx*.1,y+hh/2+.01,0); } }
    if(c.keys){ E.keys=true; const k=N(E.J.hips,-.15,-.04,.07,0,0,.2); pfBuildKeys(k); PF.keysN=k; PF.keyMan=E; }
    if(c.lead){ PF.lead=E; E.pairT=[]; } if(c.follow){ PF.follow=E; E.followP={pts:[[E.pos[0],E.pos[1]]],i:0,wait:0}; } }
  for(const c of PF_DEF.civ){ const E=by(c.name); if(E){ const r=pfRoomAt(E.pos[0],E.pos[1]); if(r) r.who.push(E.name); } }
  /* the pair walk the same route, Jojo a step behind; Tito starts out, Jojo with him */
  PF.pair=[PF.lead,PF.follow].filter(Boolean); PF.pairC={i:0,t:rnd(2,5),dead:false};
  if(PF.follow){ PF.follow.patrol=PF.follow.followP; } }
/* the improvised weapons where they'd be, ammo and first aid if A/H have them, and the bolt cutter in one of three places */
/* the bolt cutter is in one of three places, picked each load: Dani's kitchen table, the storeroom shelf, the gutted flat (on the cement) */
const PF_CUTTER=[{room:'N1',spot:'daniTable'},{room:'S7',spot:'storeShelf'},{room:'N8',spot:'gutted'}];
function pfItems(){ pfEnsureTools(); PF.items.length=0; const SP=PF.spot||{}; if(typeof openReset==='function') openReset();
  /* q: [x, surface y, z, yaw]; the item lies on it (H's propItemM when it's there: it knows how each model rests) */
  const put=(it,q)=>{ if(!it||!q) return null; const Mw=typeof propItemM==='function'?propItemM(q[0],q[1],q[2],q[3]||0):m4.compose(m4.make(),[q[0],q[1]+.04,q[2]],[0,q[3]||0,Math.PI/2],[1,1,1]);
    const P=addPickup(it,Mw,[0,0,0],[0,0,0]); P.rest=true; PF.items.push({key:it.key,P,room:pfRoomRaw(q[0],q[2]),at:q.slice(0,3)}); return P; };
  const item=k=>WPN[k]?newItem(k):null;
  const rounds=n=>typeof rayRoundsItem==='function'?rayRoundsItem(n):typeof newRounds==='function'?newRounds(n):WPN.rounds?Object.assign(newItem('rounds'),{n,count:n}):null;
  const ci=PF.cutterI!=null?PF.cutterI:Math.random()*3|0,C=PF_CUTTER[ci],q=SP[C.spot]; PF.cutterAt={room:C.room,spot:C.spot,p:q?q.slice(0,3):[0,0,0]}; put(item('cutter'),q);
  /* the kitchen knives are in the drawers, and some of the rest in cupboards and fridges (87b-openables.js: made on first opening); the
     pans, the bottles and the hammer stay out where you can see them: Ray starts empty-handed */
  const inside=(room,kind,i,mk,q)=>{ if(!(typeof openStock==='function'&&openStock(room,kind,i,mk))&&q) put(mk(),q); };
  inside('N1','drawer',0,()=>item('knife'),SP.daniCounter); inside('S5','drawer',1,()=>item('knife'),SP.chelaCounter);
  if(WPN.pan){ put(item('pan'),SP.daniStove); put(item('pan'),SP.chelaStove); }
  if(WPN.hammer) put(item('hammer'),SP.guttedCrates); else put(item('machete'),[12.1,0,3.2,2.4]);
  if(WPN.pipe) put(item('pipe'),SP.guttedFloor);
  put(item('bottle'),SP.cardTable); put(item('bottle'),[-9.3,0,-7.4,2.0]);
  if(typeof pfThrowables==='function') pfThrowables(put); /* mugs, plates, cans, a shoe: things to throw (87c-clutter.js) */
  /* loose rounds (A's) in three places, 12 in all; two first-aid tins */
  put(rounds(4),SP.cardPot); put(rounds(5),SP.storeShelf&&[SP.storeShelf[0],SP.storeShelf[1],SP.storeShelf[2]-.32,0]); inside('N1','cupboard',1,()=>rounds(3),SP.daniBack);
  if(WPN.medkit){ put(item('medkit'),SP.bathroom); inside('S5','cupboard',0,()=>item('medkit'),SP.tenantsTable); inside('N1','fridge',0,()=>item('bottle')); } }

/* ---------- every frame ---------- */
const pfCalm=E=>!E.dead&&!E.aware&&(!E.mind||E.mind==='calm'||E.mind==='nervous')&&!E.goHome&&!E.grabbed&&(E.st==='alert'||E.st==='idle');
const pfHuntCalm=()=>typeof HUNT==='undefined'||!HUNT||HUNT.state==='calm'||HUNT.state==='edge'&&!HUNT.lkp;
/* the flashlight pair, out walking: the tower's twHunt without its light slot (the light picker below gives their torches slots) */
function pfHunters(dt){ const own=typeof HUNT==='undefined';
  for(const E of enemies){ if(!E.hunter) continue; if(E.dead){ E.torchOn=false; continue; }
    if(!E.aware&&E.st==='idle'&&(!E.mind||E.mind==='calm'||E.mind==='nervous')&&!E.goHome) E.st='alert';
    if(E.patrol&&E.patrol!==E.followP&&E.patrol.wait>1.8) E.patrol.wait=rnd(.6,1.6);
    if(own&&!E.aware&&(!E.mind||E.mind==='calm')&&E.st==='alert'){ E.callT-=dt; if(E.callT<=0&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)<7){ E.callT=rnd(6,10); const L_=E.hunter.calls,txt=L_[(E.callI=(E.callI??-1)+1)%L_.length]; bark(E,txt,2.4); vox(E,'mutter',1.3); } } }
  /* Jojo walks a step behind Tito along the hall, along where Tito has been. When Tito goes into a room Jojo stays out in the hall a
     little way off its doorway, covering it, and picks up Tito's trail when he comes back out (two men in a 1.3 m entry jam). If either
     is busy (aware, searching, hurt, D's hunt), Jojo walks the route on his own */
  const T=PF.lead,J=PF.follow; if(!T||!J||J.dead) return;
  if(!T.dead&&pfCalm(T)&&pfCalm(J)&&pfHuntCalm()){ const tr=T.pairT,rT=pfRoomAt(T.pos[0],T.pos[1]),inHall=rT&&rT.id==='H',P=J.followP;
    if(inHall!==T.pfInHall){ if(inHall){ tr.length=0; J.pfCover=null; } else if(T.pfInHall!==undefined){ const l=tr[tr.length-1]||[T.pos[0],T.pos[1]]; const sx=Math.sign(J.pos[0]-l[0])||1; J.pfCover=[clamp(l[0]+sx*1.3,-7.4,7.4),clamp(J.pos[1],-.5,.5)]; } T.pfInHall=inHall; }
    let tgt;
    if(J.pfCover&&!inHall) tgt=J.pfCover;
    else { const last=tr[tr.length-1]; if(!last||Math.hypot(T.pos[0]-last[0],T.pos[1]-last[1])>.35){ tr.push([T.pos[0],T.pos[1]]); if(tr.length>24) tr.shift(); }
      let d=0; tgt=tr[0]||[T.pos[0],T.pos[1]]; for(let i=tr.length-1;i>0;i--){ d+=Math.hypot(tr[i][0]-tr[i-1][0],tr[i][1]-tr[i-1][1]); if(d>=1.5){ tgt=tr[i-1]; break; } } }
    P.pts[0]=tgt; P.i=0; const dj=Math.hypot(J.pos[0]-tgt[0],J.pos[1]-tgt[1]); P.wait=dj>.9?0:Math.max(P.wait,.2); if(J.patrol!==P) J.patrol=P;
    if(J.pfCover&&dj<.9&&!inHall){ let dh=Math.atan2(T.pos[0]-J.pos[0],T.pos[1]-J.pos[1])-J.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); J.hd+=clamp(dh,-2*dt,2*dt); } } /* watching the doorway Tito went through */
  else if(J.patrol===J.followP){ let bi=0,bd=1e9; PF_ROUTE.forEach((q,i)=>{ const d=Math.hypot(q[0]-J.pos[0],q[1]-J.pos[1]); if(d<bd){ bd=d; bi=i; } }); J.patrol={pts:PF_ROUTE,i:bi,wait:0}; } }
/* what the pair say to each other as they pass (twTalk is for people standing still) */
function pfPairTalk(dt){ const C=PF.pairC,T=PF.lead,J=PF.follow; if(!C||C.dead||!T||!J) return; if(T.dead||J.dead||T.aware||J.aware){ C.dead=true; return; }
  if(!pfCalm(T)||!pfCalm(J)||Math.hypot(T.pos[0]-J.pos[0],T.pos[1]-J.pos[1])>3.2) return;
  const d=Math.min(Math.hypot(T.pos[0]-PL.x,T.pos[1]-PL.z),Math.hypot(J.pos[0]-PL.x,J.pos[1]-PL.z)); if(d>9) return;
  const eye=camBasis().eye,close=d<5.5&&(sightClear(eye,X_(T.B,PI_.head))||sightClear(eye,X_(J.B,PI_.head)));
  if(!close){ C.mt=(C.mt??rnd(.5,1.5))-dt; if(C.mt<=0){ C.mt=rnd(2,3.5); vox(Math.random()<.5?T:J,'mutter',.7); } return; }
  C.t-=dt; if(C.t>0) return; const L_=PF_DEF.pairTalk,[nm,txt]=L_[C.i],E=nm==='Tito'?T:J,dur=clamp(1.7+txt.length*.07,2.4,4.2);
  bark(E,txt,dur); vox(E,'mutter',.95); C.i++; if(C.i>=L_.length){ C.i=0; C.t=dur+rnd(25,40); } else C.t=dur+rnd(.6,1.3); }
/* asleep by rooms: anyone in your room or the next, or in plain sight, stays awake; past FLOOR.dormD and two rooms off, a calm man sleeps
   (he still hears: noise() doesn't care). E.liveT=0 is the existing keep-awake (50-game.js) */
function pfAwake(dt){ const pr=PF.room,eye=[PL.x,1.6,PL.z]; PF.seeT=(PF.seeT||0)-dt; const look=PF.seeT<=0; if(look) PF.seeT=.4;
  for(const E of enemies){ if(E.dead) continue; const er=pfRoomAt(E.pos[0],E.pos[1]); E.pfApart=pfRoomsApart(pr,er);
    if(E.pfApart<=1){ E.liveT=0; E.pfSeen=false; continue; }
    if(look){ const d=Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z); E.pfSeen=d<13&&sightClear(eye,[E.pos[0],1.5,E.pos[1]]); } if(E.pfSeen) E.liveT=0; } }
/* not drawn while asleep two rooms off: skinned bodies are never culled, and a man is ~15 draw calls a frame (per eye). Asleep he
   doesn't move, and the frame he wakes (or comes into sight, or you come within 7 m) he's drawn again */
function pfCullPeople(){ const on=pnum('pfloor','cullPeople',true)&&GAME.started&&!PL.dead; for(const E of enemies){ const hide=on&&E.dormant&&!E.dead&&!E.pfSeen&&E.pfApart>=2&&Math.hypot(E.pos[0]-PL.x,E.pos[1]-PL.z)>7;
    if(E.holder.vis===hide){ E.holder.vis=!hide; if(E.label&&hide) E.label.vis=false; } } }
function pfRoomTick(){ const r=pfRoomAt(PL.x,PL.z); if(r&&r!==PF.room){ const prev=PF.room; PF.room=r; protoEmit('room',r,prev); } }
/* wading in the flooded room: every step splashes, and it carries */
function pfWet(dt){ if(!PF.room||PF.room.id!=='S8'||PL.dead) return; PF.wetT=(PF.wetT||0)-dt; if((PL.spdS||0)>.45&&PF.wetT<=0){ PF.wetT=.55; sfx('splat',.2+.1*Math.min(1,PL.spdS/2)); noise([PL.x,0,PL.z],pnum('pfloor','wetNoise',5)+PL.spdS); } }

/* using the tools. VR: squeeze the trigger with the cutter's jaws (or the key) on the chain. Flat: U (or click) close to it, looking at it.
   Mario's keys: grip near his right hip once he's down, dead or has given up (VR), or U close to him (flat). U also picks up what you look at (flat) */
let pfUseQ=false; addEventListener('keydown',e=>{ if(e.code==='KeyU'&&GAME.started) pfUseQ=true; });
const pfOut=E=>E&&(E.dead||E.st==='down'||E.st==='kneel'||E.surr||E.knocked);
function pfKeysPos(){ const E=PF.keyMan; if(!E||!E.keys) return null; const a=X_(E.B,PI_.hipR),b=X_(E.B,PI_.pelvis); return [a[0]+(a[0]-b[0])*.6,a[1],a[2]+(a[2]-b[2])*.6]; }
function pfTakeKeys(h){ const E=PF.keyMan; if(!E||!E.keys) return false; E.keys=false; if(PF.keysN) PF.keysN.vis=false; if(h.grab&&h.grab.E===E) endGrab(h.grab); if(h.item) grabOrDrop(h);
  equip(h,newItem('keys')); sfx('click',.7); if(XR.on) buzz(h.hand,.6,40); protoEmit('stat','pf.keys',1); return true; }
function pfTools(dt){ const X=PF.exit; if(!X||PL.dead) return; const kp=pfKeysPos();
  if(XR.on){ for(const h of [HANDS.L,HANDS.R]){ const gp=h.src&&h.src.gamepad,gr=!!(gp&&gp.buttons[1]&&gp.buttons[1].pressed),edge=gr&&!h.pfGrip; h.pfGrip=gr;
      if(edge&&kp&&pfOut(PF.keyMan)&&(!h.item||h.grab)&&Math.hypot(...v3.sub(mulP(h.M,FIST),kp))<pnum('pfloor','keyR',.28)) pfTakeKeys(h);
      const tl=pfToolOf(h.item); if(!tl||X.open){ h.pfHold=0; continue; }
      const near=Math.hypot(...v3.sub(pfTip(h),X.lock))<pnum('pfloor','cutR',.24)||Math.hypot(...v3.sub(pfTip(h),X.at))<pnum('pfloor','cutR',.24)+.06;
      h.pfHold=near&&h.trigHeld?(h.pfHold||0)+dt:0; if(near&&!h.pfNear) buzz(h.hand,.2,15); h.pfNear=near;
      if(h.pfHold>=(tl==='cutter'?pnum('pfloor','cutHold',.35):.15)) pfOpen(tl==='cutter'?'cut':'keys'); } return; }
  const use=pfUseQ||(KEYS.Mouse0&&pfToolOf(HANDS.R.item)); pfUseQ=false; if(!use) return; const {f,eye}=camBasis(),h=HANDS.R,R_=pnum('pfloor','useR',1.7);
  const looking=(p,r)=>{ const v=v3.sub(p,eye),d=Math.hypot(...v); return d<r&&v3.dot(v,f)/d>.75; };
  const tl=pfToolOf(h.item); if(tl&&!X.open&&looking(X.at,R_)){ pfOpen(tl==='cutter'?'cut':'keys'); return; }
  if(kp&&pfOut(PF.keyMan)&&looking(kp,2.0)){ pfTakeKeys(h); return; }
  const aTool=it=>it&&WPN[it.key]&&/^(medkit|rounds|strip)$/.test(WPN[it.key].tool||'');
  let best=null,bd=1e9; if(!KEYS.Mouse0&&!aTool(h.item)) for(const P of LOOSE){ if(aTool(P.item)) continue; const v=v3.sub(P.node.p,eye),d=Math.hypot(...v); if(d<2.1&&v3.dot(v,f)/d>.8&&d<bd){ bd=d; best=P; } }
  const op=!KEYS.Mouse0&&!aTool(h.item)&&typeof openUse==='function'?openUse(eye,f):null; if(op&&(!best||op.d<bd)){ openToggle(op.o); return; } /* a drawer or door you're looking at (87b-openables.js) */
  if(KEYS.Mouse0||aTool(h.item)) return; /* strips, kits and rounds are A's (80-ray.js, also on U) */
  if(best){ if(h.item) grabOrDrop(h); equip(h,best.item); removePickup(best); sfx('click',.6); } }
/* J's bots: standing at the chain with a cutter (or the keys) in hand, open it */
function pfBotOpen(){ const X=PF.exit; if(!X) return false; if(X.open) return true; const h=[HANDS.R,HANDS.L].find(h=>pfToolOf(h.item)); if(!h) return false;
  if(Math.hypot(PL.x-X.x,PL.z-X.z)>2.2) return false; return pfOpen(pfToolOf(h.item)==='cutter'?'cut':'keys'); }
/* the door swings by itself; walk through and the floor's done */
function pfExitTick(dt){ const X=PF.exit; if(!X) return;
  if(X.open&&X.ang>-1.75){ X.t+=dt; if(X.t>.35&&!X.creak){ X.creak=true; sfx('door',.8,[PF_EXIT.x,1.2,PF_EXIT.z]); } const k=clamp((X.t-.35)/2.2,0,1); X.ang=-1.75*(1-Math.pow(1-k,2.4)); if(X.S) X.S.open(-X.ang); else X.hinge.r=[0,X.ang,0]; } else if(!X.open) X.creak=false;
  if(X.open&&!PF.exited&&!PL.dead&&PL.x>PF_EXIT.x+.35&&Math.abs(PL.z-9.2)<1.95){ PF.exited=true; PF.exitT=0; protoEmit('exit'); protoEmit('stat','pf.exitT',+GAME.t.toFixed(1)); }
  if(PF.exitT!=null){ PF.exitT+=dt; GAME.fade=clamp(PF.exitT/pnum('pfloor','exitFade',1.1),0,1);
    if(PF.exitT>1.4&&!PF.exitShown){ PF.exitShown=true; if(!(PROTO_EV.exit&&PROTO_EV.exit.length)){ showMsg(PF_DEF.clear[0],PF_DEF.clear[1]); if(XR.on) XR.clearT=6; } } } }

/* ---------- lights ----------
   The renderer lights each vertex with 8 point lights, the same 8 for everything drawn this frame. Slot 7 is the muzzle flash.
   Slots 0-6: the flashlights first (up to two), then the room lights that matter most to where you are (your room and the next
   count extra, so a lit doorway doesn't drop out), fading in and out over a third of a second instead of popping */
function pfLightAnim(l,t){ const k=l.kind; if(k==='flick'){ const on=(Math.sin(t*23)+Math.sin(t*7.3)>-.7)||Math.sin(t*1.3)>.1; if(PF.tube) PF.tube.color=on?[1,1,1]:[.3,.3,.32]; return on?1:.15; }
  if(k==='tv'){ const v=.55+.3*Math.sin(t*7.1+l.t0)+.25*Math.sin(t*17.3+1)+(Math.sin(t*1.3)>.85?.4:0); if(PF.tvS) PF.tvS.setTV(true,clamp(.6+v*.4,.4,1.2)); return v; }
  if(k==='candle') return .82+.1*Math.sin(t*9.7+l.t0)+.08*Math.sin(t*23.1);
  if(k==='exit') return .92+.08*Math.sin(t*3.1+l.t0);
  if(k==='neon'){ const ph=(t*.23)%2; if(Math.sin(t*1.9+l.t0)>.97&&Math.sin(t*61)>0) return .15; return ph<1?1:-1; } return 1; }
/* a flashlight's cone (10-engine.js lights it per pixel): from the hunt's aim (83-hunt.js torchPos/torchDir) or the way he faces; its reach stops
   half a metre past the first wall or furniture it meets, so it never lights the next room. And a light on his gun you can see */
function pfTorchCone(E,k){ if(!E.pfTorch&&E.C&&E.C.wpn){ const t=N(E.C.wpn,0,-.042,.075,Math.PI/2,0,0); mk(cyl(.017,.015,.11,6),[mBlack,M(null,{color:0xfff4d6,unlit:true}),mBlack],t); E.pfTorch=t; }
  if(E.C.support&&E.wpnHeld&&E.M&&(E.aimW||0)>.5){ const g=gunRay(E),h=rayBoxes(g.mz,g.d,9,null,true); /* the light is on his gun: the beam goes where the gun points (pistolStance) */
    SPOT.pos.set(g.mz,k*3); SPOT.dir.set(g.d,k*3); SPOT.col.set([1.0,.96,.84],k*3); SPOT.rng[k]=h?Math.min(9,h.t+.5):9; return; }
  const o=E.torchPos&&E.torchDir&&E.torchDir.length===3?E.torchPos:[E.pos[0]+Math.sin(E.hd)*.25,1.25,E.pos[1]+Math.cos(E.hd)*.25];
  const d=E.torchDir&&E.torchDir.length===3?E.torchDir:norm3([Math.sin(E.hd),-.18,Math.cos(E.hd)]),h=rayBoxes(o,d,9,null,true);
  SPOT.pos.set(o,k*3); SPOT.dir.set(d,k*3); SPOT.col.set([1.0,.96,.84],k*3); SPOT.rng[k]=h?Math.min(9,h.t+.5):9;
 }
function pfLightsTick(dt){ const e=camBasis().eye,t=GAME.t,K=Math.min(7,pnum('pfloor','roomSlots',7)); let slot=0;
  const tor=[]; for(const E of enemies){ if(!E.torchOn||E.dead) continue; const d=Math.hypot(E.pos[0]-e[0],E.pos[1]-e[2]); if(d<18) tor.push([d,E]); } tor.sort((a,b)=>a[0]-b[0]);
  let sk=0; for(const [,E] of tor.slice(0,2)){ let q,y=1.0; const o=E.torchPos,d3=E.torchDir; pfTorchCone(E,sk++);
    if(o&&d3&&d3.length===3){ const r=E.torchSpot?1.1:1.9; q=[o[0]+d3[0]*r,o[2]+d3[2]*r]; y=Math.max(.35,o[1]+d3[1]*r+.2); } /* the hunt's beam (83-hunt.js): a 3D aim, low into a hiding spot */
    else { const f=d3||[Math.sin(E.hd),Math.cos(E.hd)],a=pnum('pfloor','torchAhead',1.9); q=E.torchP?[E.torchP[0],E.torchP[2]]:[E.pos[0]+f[0]*a,E.pos[1]+f[1]*a]; }
    pushOutXZ(q,.1,'body');
    L.plPos.set([q[0],y,q[1]],slot*3); L.plCol.set([.5,.48,.42],slot*3); L.plDist[slot]=pnum('pfloor','torchR',4.4); slot++; } SPOT.n=sk; /* the cone does the lighting; the point light is its bounce */
  for(const E of enemies) if(E.pfTorch) E.pfTorch.vis=!!E.torchOn&&!E.dead&&!!E.wpnHeld;
  const pr=PF.room,open=PF.exit&&PF.exit.open,C=[];
  for(const l of PF.lights){ if(l.off||l.kind==='stairs'&&!open){ l.want=0; } else { const d=Math.hypot(l.p[0]-e[0],l.p[2]-e[2]); l.s=d-l.d*.7-(pr&&l.room&&pfRoomsApart(pr,l.room)<=1?4:0); C.push(l); } }
  C.sort((a,b)=>a.s-b.s); const n=K-slot; C.forEach((l,i)=>{ l.want=i<n?1:0; });
  for(const l of PF.lights) l.w=clamp((l.w||0)+clamp((l.want||0)-(l.w||0),-dt*3,dt*3),0,1);
  const lit=PF.lights.filter(l=>l.w>0).sort((a,b)=>b.w-a.w||a.s-b.s);
  for(const l of lit){ if(slot>=K) break; let c=l.c; const k=pfLightAnim(l,t)*l.w; if(l.kind==='neon'){ c=k>0?[1.3,.3,.95]:[.35,.6,1.4]; } const kk=Math.abs(k);
    L.plPos.set(l.p,slot*3); L.plCol.set([c[0]*kk,c[1]*kk,c[2]*kk],slot*3); L.plDist[slot]=l.d; slot++; }
  for(;slot<7;slot++){ L.plPos.set([0,-50,0],slot*3); L.plCol.set([0,0,0],slot*3); L.plDist[slot]=1; } }

/* ---------- sound: the TV and the burst pipe, so you can find your way by ear ---------- */
function pfSnd(ac,p,make){ const B=audioBus(ac),pan=ac.createPanner(); pan.panningModel='equalpower'; pan.distanceModel='inverse'; pan.refDistance=1.2; pan.rolloffFactor=1.2; pan.maxDistance=40;
  if(pan.positionX){ pan.positionX.value=p[0]; pan.positionY.value=p[1]; pan.positionZ.value=p[2]; } else pan.setPosition(p[0],p[1],p[2]);
  const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=8000; const g=ac.createGain(); g.gain.value=0; pan.connect(lp); lp.connect(g); g.connect(B.inp); const sd=ac.createGain(); sd.gain.value=.22; g.connect(sd); sd.connect(B.revIn);
  const S={p,pan,lp,g,sd,nodes:[pan,lp,g,sd],vol:1}; make(ac,pan,S); return S; }
function pfNoiseSrc(ac,S,rate=1){ const s=ac.createBufferSource(); s.buffer=NOISE; s.loop=true; s.playbackRate.value=rate; s.start(ac.currentTime,Math.random()); S.nodes.push(s); return s; }
function pfFilt(ac,S,type,f,q=.7){ const b=ac.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q; S.nodes.push(b); return b; }
function pfGain(ac,S,v){ const g=ac.createGain(); g.gain.value=v; S.nodes.push(g); return g; }
function pfLfo(ac,S,hz,depth,target){ const o=ac.createOscillator(),g=ac.createGain(); o.frequency.value=hz; g.gain.value=depth; o.connect(g); g.connect(target); o.start(); S.nodes.push(o,g); }
function pfMakeSounds(ac){ const out=[];
  if(PF.waterAt) out.push(pfSnd(ac,PF.waterAt,(ac,dst,S)=>{ S.vol=.55; const a=pfNoiseSrc(ac,S),f=pfFilt(ac,S,'bandpass',1300,.6),g=pfGain(ac,S,.5); a.connect(f); f.connect(g); g.connect(dst); pfLfo(ac,S,.31,.18,g.gain); pfLfo(ac,S,2.3,.08,g.gain);
    const b=pfNoiseSrc(ac,S,.7),h=pfFilt(ac,S,'highpass',3600),g2=pfGain(ac,S,.14); b.connect(h); h.connect(g2); g2.connect(dst);
    const c=pfNoiseSrc(ac,S,.5),lo=pfFilt(ac,S,'lowpass',380),g3=pfGain(ac,S,.35); c.connect(lo); lo.connect(g3); g3.connect(dst); pfLfo(ac,S,.7,.2,g3.gain); }));
  if(PF.tvAt) out.push(pfSnd(ac,PF.tvAt,(ac,dst,S)=>{ S.vol=.45; /* voices through a cheap speaker: band-limited noise chopped into syllables, a laugh track now and then */
    const a=pfNoiseSrc(ac,S),f=pfFilt(ac,S,'bandpass',1500,1.4),g=pfGain(ac,S,.25); a.connect(f); f.connect(g); g.connect(dst); pfLfo(ac,S,3.7,.18,g.gain); pfLfo(ac,S,5.9,.12,g.gain); pfLfo(ac,S,.43,500,f.frequency);
    const o=ac.createOscillator(); o.type='sawtooth'; o.frequency.value=118; const og=pfGain(ac,S,.012),of=pfFilt(ac,S,'lowpass',600); o.connect(of); of.connect(og); og.connect(dst); o.start(); S.nodes.push(o); pfLfo(ac,S,.9,6,o.frequency); }));
  return out; }
function pfAudioStop(){ if(!PF.snd) return; for(const S of PF.snd) for(const n of S.nodes){ try{ n.stop&&n.stop(); }catch(_){} try{ n.disconnect(); }catch(_){} } PF.snd=null; PF.sndAc=null; }
function pfAudioTick(dt){ if(!AC||!NOISE||!GAME.started){ return; } if(PF.sndAc!==AC){ pfAudioStop(); PF.snd=pfMakeSounds(AC); PF.sndAc=AC; PF.sndT=0; }
  PF.sndT-=dt; if(PF.sndT>0) return; PF.sndT=.25; const e=camBasis().eye,t=AC.currentTime;
  for(const S of PF.snd){ const occ=!sightClear([e[0],Math.min(e[1],1.5),e[2]],[S.p[0],1.2,S.p[2]]); S.lp.frequency.setTargetAtTime(occ?650:9000,t,.15); S.g.gain.setTargetAtTime(S.vol*(occ?.6:1)*(PL.dead?.3:1),t,.2); } }

/* ---------- load, reset, the frame ---------- */
function pfLoad(){ PL.y=0; clearEnemies(); for(const P of LOOSE.slice()) removePickup(P); pfBuild(); buildRack(); buildBoard(); resetGame(); protoEmit('load'); if(XR.on) vrRecenter(); }
function pfReset(){ GAME.fade=0; PF.exited=false; PF.exitT=null; PF.exitShown=false; PF.room=null; PF.lead=PF.follow=PF.keyMan=null; PF.keysN=null; for(const r of PF.rooms) r.who=[];
  FLOOR.flanked=false; FLOOR.upT=null; FLOOR.braceUpT=null; for(const l of PF.lights) l.w=0;
  pfExitReset(); pfCast(); pfItems();
  if(!GAME.kit&&PF_DEF.kit) equip(HANDS.R,newItem(PF_DEF.kit,undefined,true)); /* Novak's pistol, can on (A sets what's in it) */
  if(XR.on) guideTitle('Floor 01','Get out. The stairwell door is chained.',5); }
protoOn('tick',(gdt,dt)=>{ if(FLOOR.mode!=='proto'){ if(PF.snd) pfAudioStop(); return; }
  pfRoomTick(); if(typeof openTick==='function') openTick(dt); pfLightsTick(dt); pfAudioTick(dt); if(!GAME.started) pfCullPeople(); for(const S of PF.ticks) S.tick(GAME.t); if(PF.spray){ PF.spray.s=[1,1+.04*Math.sin(GAME.t*31),1]; PF.spray.p[0]=.2+.01*Math.sin(GAME.t*47); }
  if(!GAME.started) return;
  pfAwake(dt); pfCullPeople(); pfHunters(gdt); pfPairTalk(gdt); twTalk(gdt); twCivTick(gdt); if(typeof HUNT==='undefined') twRoles(gdt);
  pfTools(dt); pfWet(dt); pfExitTick(dt); });
/* dev: ?pfdev=1 boots straight onto the floor (J's start card does this for ?proto=1) */
if(new URLSearchParams(location.search).get('pfdev')==='1') setTimeout(()=>{ if(FLOOR.mode==='proto') return; try{ pfLoad(); }catch(e){ console.error('[pfloor] load',e); } },0);

/* ---------- checks (run from the dev harness: tools/proto/pf-dev.js) ----------
   pfSightCheck: rasterise everything that blocks sight at eye height (walls, the door, anything over 1.5 m tall; hung sheets too when
   sheets:true) onto a 10 cm grid, then from every walkable half-metre cell march 120 rays out until they hit something. The longest
   is the floor's longest straight view */
function pfSightCheck(o={}){ const S=.1,W=Math.round(2*RX/S),Hh=Math.round(2*RZ/S),g=new Uint8Array(W*Hh),y=o.y??1.6;
  const fill=(x0,x1,z0,z1)=>{ const i0=Math.max(0,Math.floor((x0+RX)/S)),i1=Math.min(W-1,Math.ceil((x1+RX)/S)-1),k0=Math.max(0,Math.floor((z0+RZ)/S)),k1=Math.min(Hh-1,Math.ceil((z1+RZ)/S)-1); for(let k=k0;k<=k1;k++) for(let i=i0;i<=i1;i++) g[k*W+i]=1; };
  for(const b of BOXES){ const tall=b.kind==='wall'||b.kind==='door'||b.h>1.5; if(!tall||b.y0>y||b.h<y) continue; if(b.sightOnly&&!o.sheets) continue; fill(b.x0,b.x1,b.z0,b.z1); }
  if(o.sheets) for(const op of PF.openings) if(op.kind==='sheet'){ if(op.axis==='x') fill(op.s0,op.s1,op.c-.05,op.c+.05); else fill(op.c-.05,op.c+.05,op.s0,op.s1); }
  for(const r of PF.rooms) if(!r.noFace) for(const q of r.rects) for(let k=0;k<Hh;k++) for(let i=0;i<W;i++){} /* (rooms only bound the rays through the walls) */
  let best={d:0},hall={d:0},hist=[0,0,0,0,0,0,0]; const N_=o.n||120;
  for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ if(FLOOR.nav[k*NX+i]) continue; const x=cellX(i),z=cellZ(k),r=pfRoomAt(x,z); if(!r||r.env==='stair'&&r.id!=='S0'&&r.id!=='NE') continue; let cm=0;
    for(let a=0;a<N_;a++){ const an=a/N_*Math.PI*2,dx=Math.cos(an),dz=Math.sin(an); let t=0; for(;t<40;t+=.05){ const px=x+dx*t,pz=z+dz*t,gi=Math.floor((px+RX)/S),gk=Math.floor((pz+RZ)/S); if(gi<0||gk<0||gi>=W||gk>=Hh||g[gk*W+gi]||!pfRoomAt(px,pz)||PF.shaftRects.some(q=>px>q[0]&&px<q[2]&&pz>q[1]&&pz<q[3])) break; }
      if(t>cm) cm=t; const end=[+(x+dx*t).toFixed(1),+(z+dz*t).toFixed(1)];
      if(t>best.d) best={d:+t.toFixed(2),from:[x,z],to:end,room:r.id,toRoom:(pfRoomAt(x+dx*(t-.1),z+dz*(t-.1))||{}).id};
      if(o.pairs&&t>(o.over||12)){ const key=r.id+'>'+((pfRoomAt(x+dx*(t-.1),z+dz*(t-.1))||{}).id); const P_=o.pairs[key]; if(!P_||P_.d<t) o.pairs[key]={d:+t.toFixed(1),from:[x,z],to:end,deg:Math.round(an*57.3)}; }
      const er=pfRoomAt(x+dx*(t-.1),z+dz*(t-.1)); if(r.id==='H'&&er&&er.id==='H'&&t>hall.d) hall={d:+t.toFixed(2),from:[x,z],to:end}; }
    hist[Math.min(6,Math.floor(cm/2))]++; }
  return {max:best,hallOnly:hall,hist:hist.map((v,i)=>(i*2)+'-'+(i*2+2)+'m:'+v).join(' ')}; }
/* reachability, hiding-spot spacing (by walking), route lengths */
function pfCheck(){ const out={rooms:PF.rooms.length,openings:PF.openings.length,openKinds:{},boxes:BOXES.length,hides:PF.hides.length,lights:PF.lights.length,unreached:[],unreachedCrouch:[],exits:{}};
  for(const o of PF.openings) out.openKinds[o.kind]=(out.openKinds[o.kind]||0)+1;
  for(const r of PF.rooms) out.exits[r.id]=r.exits;
  /* doorways whose approach is blocked: the cell in the doorway's column half a metre in front, on each side */
  out.blockedDoors=[]; for(const o of PF.openings){ if(o.kind==='chain') continue; const nv=o.kind==='hole'?FLOOR.navHole:FLOOR.nav,sc=Math.round(o.pos*2)/2;
    for(const sd of [-1,1]){ const rc=Math.round((o.c+sd*.55)*2)/2,c=o.axis==='x'?navCell(sc,rc):navCell(rc,sc); if(c<0||nv[c]) out.blockedDoors.push(o.a+'/'+o.b+(sd<0?' -':' +')); } }
  /* a field from (x,z), started from the nearest open cell in the same room (a hiding spot sits inside its furniture) */
  const fieldOn=(nav,x,z)=>{ const F=new Int32Array(NX*NZ),rm=pfRoomAt(x,z); let c=navCell(x,z);
    if(nav[c]){ let bd=1e9,bc=c; for(let k=-5;k<=5;k++) for(let i=-5;i<=5;i++){ const q=c+k*NX+i; if(q<0||q>=nav.length||nav[q]||pfRoomAt(cellX(q%NX),cellZ((q-q%NX)/NX))!==rm) continue; if(i*i+k*k<bd){ bd=i*i+k*k; bc=q; } } c=bc; }
    const keep=FLOOR.nav; FLOOR.nav=nav; navField(F,c,null); FLOOR.nav=keep; return F; };
  const F=fieldOn(FLOOR.nav,FLOOR.start.x,FLOOR.start.z),FH=fieldOn(FLOOR.navHole,FLOOR.start.x,FLOOR.start.z);
  const reach=(F_,r)=>{ for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++){ const c=k*NX+i; if(F_[c]<1e9&&pfRoomAt(cellX(i),cellZ(k))===r) return true; } return false; };
  for(const r of PF.rooms){ if(r.id==='NX') continue; if(!reach(F,r)) out.unreached.push(r.id); if(!reach(FH,r)) out.unreachedCrouch.push(r.id); }
  const m=(F_,x,z)=>{ let c=navCell(x,z),b=1e9; const rm=pfRoomAt(x,z); for(let k=-4;k<=4;k++) for(let i=-4;i<=4;i++){ const q=c+k*NX+i; if(q>=0&&q<F_.length&&pfRoomAt(cellX(q%NX),cellZ((q-q%NX)/NX))===rm) b=Math.min(b,F_[q]); } return b>=1e9?null:+(b/20).toFixed(1); };
  const cs=PF_CUTTER.map(c=>PF.spot[c.spot]||[0,0,0]);
  out.walk={cutterN1:m(F,cs[0][0],cs[0][2]),cutterS7:m(F,cs[1][0],cs[1][2]),cutterN8:m(F,cs[2][0],cs[2][2]),keys:m(F,.75,7.6),exitDoor:m(F,12.5,9.9)};
  out.walkCrouch={cutterN1:m(FH,cs[0][0],cs[0][2]),cutterS7:m(FH,cs[1][0],cs[1][2]),cutterN8:m(FH,cs[2][0],cs[2][2]),keys:m(FH,.75,7.6),exitDoor:m(FH,12.5,9.9)};
  const FX=fieldOn(FLOOR.navHole,12.5,9.9); out.toExitCrouch={fromN1:m(FX,cs[0][0],cs[0][2]),fromS7:m(FX,cs[1][0],cs[1][2]),fromN8:m(FX,cs[2][0],cs[2][2]),fromKeys:m(FX,.75,7.6)};
  /* hiding spots: walking distance from each to the nearest other, and the furthest any walkable spot is from one */
  const HF=PF.hides.map(h=>fieldOn(FLOOR.navHole,h.x,h.z)); out.hideGap=PF.hides.map((h,i)=>{ let b=1e9; HF.forEach((F2,j)=>{ if(j!==i){ const v=m(F2,h.x,h.z); if(v!=null) b=Math.min(b,v); } }); return [h.room&&h.room.id,h.note,+b.toFixed(1)]; });
  let far=0,farAt=null; for(let c=0;c<NX*NZ;c++){ if(FLOOR.navHole[c]||FH[c]>=1e9) continue; let b=1e9; for(const F2 of HF) b=Math.min(b,F2[c]); if(b>far){ far=b; farAt=[cellX(c%NX),cellZ((c-c%NX)/NX)]; } }
  out.hideFarthest={m:+(far/20).toFixed(1),at:farAt};
  return out; }
/* a top-down map for the report: rooms, openings, hiding spots, the cutter spots */
function pfMap(){ const S=.5,rows=[]; const W=Math.round(2*RX/S),Hh=Math.round(2*RZ/S); const ch=Array.from({length:Hh},()=>new Array(W).fill(' '));
  for(let k=0;k<Hh;k++) for(let i=0;i<W;i++){ const x=-RX+(i+.5)*S,z=RZ-(k+.5)*S,r=pfRoomAt(x,z); ch[k][i]=r?(r.id==='H'?'.':' '):'#'; }
  const P=(x,z,c)=>{ const i=Math.floor((x+RX)/S),k=Math.floor((RZ-z)/S); if(i>=0&&k>=0&&i<W&&k<Hh) ch[k][i]=c; };
  for(const R of PF.runs){ for(let s=R.a;s<=R.b;s+=S/2){ const x=R.axis==='x'?s:R.c,z=R.axis==='x'?R.c:s; const i=Math.floor((x+RX)/S),k=Math.floor((RZ-z+(R.axis==='x'?(R.n>0?-.01:.01):0))/S); if(i>=0&&k>=0&&i<W&&k<Hh&&ch[k][i]!=='#') ch[k][i]=R.axis==='x'?'-':'|'; } }
  for(const q of PF.parts||[]) for(let s=q.s0;s<=q.s1;s+=S/2) P(q.axis==='x'?s:q.c,q.axis==='x'?q.c:s,q.axis==='x'?'=':'!');
  for(const o of PF.openings) for(let s=o.s0+.1;s<o.s1;s+=S/2) P(o.axis==='x'?s:o.c,o.axis==='x'?o.c:s,{open:' ',sheet:'~',hole:'o',chain:'X'}[o.kind]);
  for(const R of PF.runs) for(const g of R.gaps) if(g.kind==='win') for(let s=g.s0;s<g.s1;s+=S/2) P(s,g.c,'w');
  for(const r of PF.rooms){ const q=r.rects[0],l=r.id; const cx=(q[0]+q[2])/2,cz=(q[1]+q[3])/2; for(let j=0;j<l.length;j++) P(cx-.5+j*S,cz+.6,l[j]); }
  PF.hides.forEach((h,i)=>P(h.x,h.z,'h')); for(const c of PF_CUTTER){ const q=PF.spot[c.spot]; if(q) P(q[0],q[2],'C'); } P(PF_START.x,PF_START.z,'@');
  for(const row of ch) rows.push(row.join('')); return rows.join('\n'); }
