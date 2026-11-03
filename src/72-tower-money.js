/* =====================================================================
   THE TOWER, floors 10-12: the money. The party the Landlord throws for the men from the stairs, the office where the tip
   was bought, and the floor the municipal police are paid to sit on. Same long floors as 07-09 (71-tower-soldiers.js),
   same light budget (7). Floor 10 has music: while it plays it covers noise near the hall, and it stops when the floor
   knows you're there.
   ===================================================================== */

/* ---------- the party music: a cumbia from a speaker stack, live in the room, dull through a wall ----------
   Accordion (two detuned saws, musette), bass on the beat, güira scraping eighths, a low drum. Scheduled a quarter second
   ahead on the game's audio clock, through a panner at the speakers and a lowpass that closes when a wall's between you */
const TW_MUSIC={on:false,dead:false};
const TW_CHORDS=[0,0,-5,0,5,0,-5,0]; /* bars: Am Am E Am Dm Am E Am, as semitones from A */
const TW_MEL=[[7,null,5,3,5,null,3,0],[3,5,7,null,8,7,5,3],[-1,null,2,5,8,null,5,2],[0,null,null,null,-5,null,0,null],
  [5,null,8,12,8,null,5,null],[7,null,3,0,3,null,7,null],[8,7,5,2,-1,null,2,5],[3,null,0,null,0,null,null,null]];
function twMusicStop(scratch){ const M=TW_MUSIC; if(!M.on) return; M.on=false; const ac=M.ac,t=ac.currentTime;
  if(scratch){ const s=ac.createBufferSource(); s.buffer=NOISE; const f=ac.createBiquadFilter(); f.type='bandpass'; f.Q.value=4; f.frequency.setValueAtTime(3000,t); f.frequency.exponentialRampToValueAtTime(300,t+.35);
    const g=ac.createGain(); g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+.4); s.connect(f); f.connect(g); g.connect(M.pan); s.start(t); s.stop(t+.45); }
  M.g.gain.setTargetAtTime(0,t+(scratch?.3:0),.05); const n=[M.pan,M.lp,M.g]; setTimeout(()=>{ for(const x of n) try{ x.disconnect(); }catch(_){} },1500); }
function twMusicStart(x,z){ const ac=audio(); if(!ac||!NOISE) return; if(TW_MUSIC.on) twMusicStop(); const B=audioBus(ac);
  const pan=ac.createPanner(); pan.panningModel='equalpower'; pan.distanceModel='inverse'; pan.refDistance=2.2; pan.rolloffFactor=.9; pan.maxDistance=60;
  if(pan.positionX){ pan.positionX.value=x; pan.positionY.value=1.2; pan.positionZ.value=z; } else pan.setPosition(x,1.2,z);
  const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=8000; lp.Q.value=.5; const g=ac.createGain(); g.gain.value=0;
  pan.connect(lp); lp.connect(g); g.connect(B.inp); const sd=ac.createGain(); sd.gain.value=.25; lp.connect(sd); sd.connect(B.revIn);
  Object.assign(TW_MUSIC,{on:true,ac,pan,lp,g,x,z,next:ac.currentTime+.15,step:0}); }
function twNote(M,t,f,dur,kind){ const ac=M.ac,g=ac.createGain(); g.connect(M.pan); const end=t+dur;
  if(kind==='acc'){ const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2300; lp.connect(g);
    for(const [d,ty] of [[1,'sawtooth'],[1.0045,'sawtooth'],[.5,'square']]){ const o=ac.createOscillator(); o.type=ty; o.frequency.value=f*d; const og=ac.createGain(); og.gain.value=ty==='square'?.35:.5; o.connect(og); og.connect(lp); o.start(t); o.stop(end+.06); }
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.075,t+.015); g.gain.linearRampToValueAtTime(.055,t+.08); g.gain.setValueAtTime(.055,end); g.gain.linearRampToValueAtTime(0,end+.05); }
  else if(kind==='bass'){ const o=ac.createOscillator(); o.type='triangle'; o.frequency.value=f; o.connect(g); o.start(t); o.stop(end+.05);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.32,t+.01); g.gain.exponentialRampToValueAtTime(.05,end); g.gain.linearRampToValueAtTime(0,end+.04); }
  else if(kind==='guira'){ const s=ac.createBufferSource(); s.buffer=NOISE; s.playbackRate.value=1.3; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=6500; bp.Q.value=1.2; s.connect(bp); bp.connect(g);
    s.start(t,Math.random()*.5); s.stop(end+.02); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(f,t+dur*.6); g.gain.linearRampToValueAtTime(0,end); }
  else if(kind==='drum'){ const o=ac.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*.55,t+.12); o.connect(g); o.start(t); o.stop(t+.2);
    g.gain.setValueAtTime(.4,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); }
  setTimeout(()=>{ try{ g.disconnect(); }catch(_){} },(end-M.ac.currentTime+1)*1000); }
function twBeat(M,step,t){ const e=60/96/2,bar=(step>>3)%8,s=step&7,root=110*Math.pow(2,TW_CHORDS[bar]/12);
  if(s%2===0) twNote(M,t,s%4===0?root/2:root*.75,e*1.6,'bass');
  twNote(M,t,s%2?.13:.05,s%2?e*.9:e*.35,'guira');
  if(s===0||s===4) twNote(M,t,95,.2,'drum'); else if(s===3||s===7) twNote(M,t,210,.15,'drum');
  const n=TW_MEL[bar][s]; if(n!=null){ let len=1; while(s+len<8&&TW_MEL[bar][s+len]==null&&len<3) len++; twNote(M,t,440*Math.pow(2,n/12),e*len*.92,'acc'); } }
/* every frame on a floor with music: start it, steer it, stop it when the party knows */
function twMusicTick(){ const D=FLOOR.def; if(!D||!D.music) { if(TW_MUSIC.on) twMusicStop(); return; }
  if(!TW_MUSIC.on){ if(!TW_MUSIC.dead&&GAME.started&&AC) twMusicStart(D.music[0],D.music[1]); return; }
  const M=TW_MUSIC,ac=M.ac,t=ac.currentTime;
  const dj=enemies.find(E=>E.name===D.music[2]),known=enemies.some(E=>!E.civ&&!E.dead&&E.aware);
  if(!dj||dj.dead||dj.st==='down'||known){ M.dead=true; twMusicStop(true); if(dj&&!dj.dead&&upright(dj)){ bark(dj,'KILL THE MUSIC!',2.2); GAME.barkGlobal=1; } return; }
  const e=earPos(),occ=!sightClear([e[0],1.5,e[2]],[M.x,1.3,M.z]); M.lp.frequency.setTargetAtTime(occ?480:7500,t,.15); M.g.gain.setTargetAtTime((occ?.6:1)*.9,t,.25);
  if(M.next<t-.5) M.next=t+.05; /* the tab was asleep: don't pile up a backlog */
  while(M.next<t+.25){ twBeat(M,M.step,M.next); M.step++; M.next+=60/96/2; } }
/* how much the music swallows a noise made at src: near the speakers, a lot */
function twHush(src){ const D=FLOOR.def; if(!TW_MUSIC.on||!D||!D.music) return 1; const d=Math.hypot(src[0]-D.music[0],src[2]-D.music[1]); return d<9?.5:d<15?.75:1; }
function twMusicReset(){ TW_MUSIC.dead=false; if(TW_MUSIC.on) twMusicStop(); }

/* ---------- the details ---------- */
const tTw10Banner=tex(48,8,'#e8c030',g=>{ for(let x=0;x<48;x+=6) R(g,['#d8362e','#3a6ad0','#3aa040','#e05a7a'][(x/6)%4],x,0,6,1); text(g,'FELICIDADES',2,2,'#a8241c'); });
const tTw10Grill=cl(8,16,'#1a1b1d',6,1001,g=>{ for(let y=1;y<16;y+=2) R(g,'#2a2b2e',1,y,6,1); R(g,'#0e0e10',2,3,4,4); R(g,'#0e0e10',2,10,4,4); });
const tTw11Ledger=tex(16,16,'#ece6d6',g=>{ R(g,'#a8241c',5,0,1,16); for(let y=2;y<16;y+=3) R(g,'#c8c4b8',0,y,16,1); text(g,'DALE',6,2,'#1e2a4a'); text(g,'20',6,8,'#1e2a4a'); R(g,'#1e2a4a',14,9,2,1); });
const tTw11Cork=cl(36,26,'#a07a4a',16,1101,g=>{ const v=['10','10','50','20','10','-']; for(let k=0;k<6;k++){ const x=1+(k%3)*12,y=1+Math.floor(k/3)*12; R(g,'#e8e2cf',x,y,9,6); R(g,'#b98a62',x+3,y+1,3,4); R(g,'#2a1a10',x+3,y+1,3,1); R(g,'#3a4a6a',x+2,y+5,5,2); R(g,'#d8362e',x+4,y-1,1,1); text(g,v[k],x+2,y+7,'#1e1c22'); } });
const tTw12Photo=tex(14,10,'#e8e2cf',g=>{ R(g,'#7d9ab0',1,1,12,8); R(g,'#c89474',3,2,2,2); R(g,'#e8e4dc',3,1,2,1); R(g,'#ece8de',2,4,4,5); R(g,'#b98a62',9,2,2,2); R(g,'#1e2a4a',8,4,4,5); R(g,'#c9a23a',9,5,1,1); });
const tTw12Uniform=cl(8,16,'#1e2a4a',8,1201,g=>{ R(g,'#141c30',3,0,1,16); R(g,'#c9a23a',1,3,1,1); R(g,'#c9a23a',6,4,2,2); });
const mTwBottle=M(null,{color:0x2e5a34}), mTwBeer=M(null,{color:0x7a4a1a}), mTwBar=M(null,{color:0x4a4c52}), mTwEnvelope=M(null,{color:0xd8ccb0});

/* a cage of bars: along x from x0 to x1 at z (or along z with axis 'z'), floor to rail, solid */
function twBars(axis,c,a,b){ const m=M(tSteel,{color:0x8a8c90}); for(let s=a;s<=b+.001;s+=.16) axis==='x'?mk(cyl(.012,.012,2.2,4,{at:[0,1.1,0]}),m,floorN,s,0,c):mk(cyl(.012,.012,2.2,4,{at:[0,1.1,0]}),m,floorN,c,0,s);
  for(const y of [.05,1.1,2.2]) axis==='x'?mk(box(b-a,.03,.03),m,floorN,(a+b)/2,y,c):mk(box(.03,.03,b-a),m,floorN,c,y,(a+b)/2);
  if(axis==='x') addBox(a,b,c-.04,c+.04,0,2.2,'furn'); else addBox(c-.04,c+.04,a,b,0,2.2,'furn'); }

/* ---------- the floors ---------- */
TOWER.push(
  /* 10: the party. Three flats knocked into a hall for the men from the stairs: a banner, a speaker stack, Don Goyo on the
     accordion, tamales from Doña Cuca. Gordito hands out envelopes across the hall. Some of the guests are guests */
  { n:10,name:'Floor 10',kit:'pistol',wall:'cream',floor:'lino',len:16,music:[-9.3,4.2,'Pollo'],
    units:[{side:1,x0:-16,x1:-10,door:-12.4,win:true,paper:'concrete',fl:'conc'},{side:1,x0:-10,x1:4,door:0,paper:'pink',fl:'parquet'},{side:1,x0:4,x1:10,door:5.0,win:true,winX:8.0,hole:3.6,paper:'tile',fl:'tile'},
      {side:1,x0:10,x1:16,door:12.0,win:true,hole:3.4,paper:'peel',fl:'conc'},
      {side:-1,x0:-16,x1:-10,door:-12.6,win:true,paper:'blue',fl:'rug'},{side:-1,x0:-10,x1:-4,door:-5.0,win:true,winX:-7.4,paper:'dark',fl:'conc'},{side:-1,x0:-4,x1:2,door:1.0,paper:'tile',fl:'tile'},
      {side:-1,x0:2,x1:9,door:3.0,win:true,winX:6.4,paper:'panel',fl:'oak'},{side:-1,x0:9,x1:16,door:12.4,hole:3.0,paper:'sage',fl:'check'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-2,'dead'); A.tube(4,'dead'); A.tube(9,'on'); A.tube(14,'dead');
      A.light([9,2.5,0],[1.0,1.08,1.2],5.6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      twRK(A,'store',-13,1,-12.4);
      /* the hall: banner, string lights, the speakers and the DJ table at the west end, drinks along the wall, food at the east end */
      A.pic(tTw10Banner,-3,2.3,5.926,Math.PI,3.6,.6);
      for(const z of [5.2,3.2]){ twSolid(.55,1.2,.45,mBlack,-9.6,z); mk(plane(.4,1.0),M(tTw10Grill),floorN,-9.32,.62,z,0,Math.PI/2,0); }
      A.furn('table',-7.9,4.2,Math.PI/2); A.blk(.5,.12,.35,mBlack,-7.9,.83,4.2); A.blk(.18,.02,.14,M(null,{color:0x9ac0e0,unlit:true}),-7.85,.9,4.0);
      for(const x of [-5.5,-4.4]){ A.furn('table',x,5.45,0); for(let k=0;k<5;k++) mk(cyl(.03,.035,.24,6,{at:[0,.12,0]}),k%2?mTwBeer:mTwBottle,floorN,x-.35+k*.17,.77,5.4+((k*7)%3-1)*.08); }
      A.furn('table',2.6,5.45,0); mk(cyl(.2,.18,.3,8,{at:[0,.15,0]}),M(tSteel),floorN,2.4,.77,5.45); mk(cyl(.2,.2,.01,8),M(null,{color:0xc9a23a}),floorN,2.85,.78,5.4);
      { const wire=M(null,{color:0x1a1a1a}),lit=[M(null,{color:0xffd27a,unlit:true}),M(null,{color:0xff6a8a,unlit:true}),M(null,{color:0x7ac8ff,unlit:true})];
        for(const z of [2.2,4.6]){ mk(box(13,.01,.01),wire,floorN,-3,2.45,z); for(let k=0;k<13;k++) mk(box(.05,.07,.05),lit[k%3],floorN,-9+k,2.4,z); } }
      for(const [cx,cz,r] of [[-6.5,2.0,.2],[-1.0,5.5,-.3],[3.4,2.3,.5]]) A.blk(.4,.45,.4,M(tWood),cx,.225,cz,r,true); /* chairs */
      A.blk(.36,.3,.22,M(null,{color:0x8a1a16}),-8.5,.85,2.0,.3); /* the accordion case, open */
      A.light([-6.0,2.3,3.6],[1.45,1.05,.6],6.5); A.light([-.5,2.2,3.6],[1,.4,1],6.5,'party');
      /* the kitchen: the steamer going, a cooler of beer */
      A.furn('counter',7.0,5.62,Math.PI); A.furn('fridge',9.2,5.6,Math.PI);
      twSolid(.6,.88,.6,M(null,{color:0xd8d4c8}),5.0,5.6); mk(cyl(.2,.2,.4,8,{at:[0,.2,0]}),M(tSteel),floorN,5.0,.88,5.6); A.blk(.7,.45,.4,M(null,{color:0x2a5aa0}),9.3,.225,2.0,0,true);
      A.bulb(7.0,3.6,true,true,2.1); A.light([7.0,1.9,3.6],[1.55,1.02,.52],4.8);
      twRK(A,'store',13.0,1,12.0);
      /* south: the coats on the bed */
      twRK(A,'bed',-13,-1,-12.6); for(const [cx,c] of [[-12.4,0x4a2e2e],[-11.9,0x2a3a5a],[-11.4,0x6a6a62]]) A.blk(.6,.12,.7,M(null,{color:c}),cx,.58,-5.45,cx);
      /* the lines room: a coffee table with a mirror on it, a couch, nobody's light */
      A.furn('couch',-8.6,-5.5,0); A.furn('table',-7.4,-3.6,0); A.blk(.5,.01,.35,M(null,{color:0x9aa8b0}),-7.4,.775,-3.6,.2); twPowder(-7.5,.78,-3.65,.6); twPowder(-7.2,.78,-3.5,.4);
      /* a bathroom, dark */
      twSolid(.4,.42,.55,M(null,{color:0xc8c4b8}),-3.4,-5.6); twSolid(1.6,.55,.72,M(null,{color:0xc8c4b8}),-.8,-5.55); twSolid(.5,.2,.4,M(null,{color:0xc8c4b8}),1.3,-5.7,0,.7);
      /* the payout room: Gordito's desk, the envelopes, the lamp */
      A.furn('desk',6.0,-5.4,0); for(let k=0;k<6;k++) A.blk(.2,.015,.1,mTwEnvelope,5.6+(k%3)*.15,.79+Math.floor(k/3)*.016,-5.35+(k%2)*.05,k*.2);
      A.blk(.6,.3,.34,M(tTw5Duffel),8.2,.15,-3.2,.3,true); twLamp(A,7.8,-5.4,-.4,.6);
      twRK(A,'living',12.5,-1,12.4);
      A.tag(5,-12.0,1.45,-1); A.tag(2,10.4,1.5,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Pollo',spots:[[-9.0,4.2,Math.PI/2]],pose:'watch',extra:'I just play the music! The music—'},
      {kind:'vecino1',hidden:true,look:'any',name:'Rocco',spots:[[-4.0,3.0,.6],[-5.0,2.6,.4]],pose:'idle',extra:'I\'m a guest! I\'m just a guest—'},
      {kind:'vecino3',hidden:true,look:'any',name:'Toto',spots:[[1.0,3.4,-1.2],[2.0,3.5,0]],pose:'idle',extra:'I came for the food, man—'},
      {kind:'gunman',name:'Primo',spots:[[-7.5,-2.5,Math.PI],[-6.5,-2.5,Math.PI-.3]],pose:'phone',extra:'I\'m high, man— I\'m so high—'},
      {kind:'enforcer',name:'Gordito',spots:[[6.0,-4.5,Math.PI]],pose:'lean',extra:'It\'s not my money! It\'s not mine—'},
      {kind:'doorman',name:'Tano',spots:[[13.0,4.8,0],[12.5,4.5,.3]],pose:'watch',extra:'I was outside! I was outside—'}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Ceci',spots:[[-3.4,3.6,Math.PI+.6],[-4.4,3.6,Math.PI-.4]],pose:'idle',extra:'Please! I just came to dance—'},
      {kind:'obrero',civ:true,look:'any',name:'Mando',spots:[[-1.6,4.4,Math.PI/2],[-.5,2.6,.3]],pose:'idle',extra:'I live on twelve! On twelve!'},
      {kind:'abuelo',civ:true,old:true,name:'Don Goyo',spots:[[-8.5,2.0,Math.PI/2+.3]],pose:'idle',extra:'I just play, son. I just play—'},
      {kind:'senora',civ:true,fem:true,name:'Doña Cuca',spots:[[6.6,4.9,0],[5.0,4.9,0]],pose:'idle',extra:'I cooked! That\'s all I did—'}],
    talk:[
      {who:['Pollo'],r:3.8,lines:[['Pollo','This one goes out to the stairs!'],['Pollo','Five cops, one night!'],['Pollo','Dance, cabrones!'],['Pollo','The Landlord\'s paying!']]},
      {who:['Rocco','Ceci'],r:3.8,lines:[['Ceci','What are we celebrating?'],['Rocco','Work.'],['Ceci','What work?'],['Rocco','Good work. Dance.'],['Ceci','Your hands are shaking.'],['Rocco','...dance.']]},
      {who:['Toto','Mando'],r:3.8,lines:[['Mando','Who\'s the party for?'],['Toto','The boys from seven.'],['Mando','I live on twelve, man. They said come.'],['Toto','So come. Eat.'],['Mando','Is it true? The police?'],['Toto','Eat, Mando.']]},
      {who:['Don Goyo'],r:3.8,lines:[['Don Goyo','Forty years I play weddings.'],['Don Goyo','Baptisms. Funerals.'],['Don Goyo','Tonight they pay double.'],['Don Goyo','I don\'t ask what for.']]},
      {who:['Doña Cuca'],r:3.8,lines:[['Doña Cuca','Two hundred tamales.'],['Doña Cuca','For what, nobody says.'],['Doña Cuca','My son says don\'t ask.'],['Doña Cuca','So I steam.']]},
      {who:['Primo'],r:3.8,lines:[['Primo','To the sixth cop.'],['Primo','Wherever you are.'],['Primo','Rotting, I hope.'],['Primo','...this stuff\'s cut to hell.']]},
      {who:['Gordito'],r:3.8,lines:[['Gordito','Name.'],['Gordito','Five hundred. Next.'],['Gordito','Chucho\'s boys get double.'],['Gordito','Dollars. Don\'t ask.'],['Gordito','...where\'s Chucho?']]},
      {who:['Tano'],r:3.8,lines:[['Tano','Party\'s for the shooters.'],['Tano','I got the door.'],['Tano','Always the door.'],['Tano','...nobody brings me a plate.']]}],
    loot:[],
    clear:['FLOOR 10','The party\'s over. Five floors to go.'] },

  /* 11: the office. Where the money goes through: records, a safe, phones, a shredder, a vault of dollars. The Licenciado keeps
     the books and pays the informant. On the conference room's corkboard, the team, with a price under each */
  { n:11,name:'Floor 11',kit:'pistol',wall:'panel',floor:'carpet',len:16,
    units:[{side:1,x0:-16,x1:-9.5,door:-12.0,win:true,paper:'concrete',fl:'conc'},{side:1,x0:-9.5,x1:-2.5,door:-3.6,win:true,winX:-6.4,paper:'panel',fl:'carpet'},{side:1,x0:-2.5,x1:5,door:1.0,paper:'cream',fl:'carpet'},
      {side:1,x0:5,x1:10.5,door:7.0,hole:3.4,paper:'dark',fl:'conc'},{side:1,x0:10.5,x1:16,door:12.4,win:true,paper:'tile',fl:'tile'},
      {side:-1,x0:-16,x1:-10,door:-12.6,paper:'concrete',fl:'conc'},{side:-1,x0:-10,x1:-3.5,door:-5.0,win:true,winX:-7.0,paper:'panel',fl:'carpet'},{side:-1,x0:-3.5,x1:3,door:1.6,paper:'dark',fl:'conc'},
      {side:-1,x0:3,x1:9.5,door:4.2,hole:3.6,paper:'tile',fl:'tile'},{side:-1,x0:9.5,x1:16,door:12.0,win:true,winX:13.6,paper:'cream',fl:'carpet'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-1,'on'); A.tube(5,'dead'); A.tube(10,'dead'); A.tube(14,'dead');
      A.light([-1,2.5,0],[1.0,1.08,1.2],5.6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* records: cabinets along the walls, boxes */
      for(let k=0;k<6;k++) A.furn('filing',-15.4+k*.55,5.6,Math.PI); for(let k=0;k<3;k++) A.furn('filing',-15.6,3.2+k*.6,Math.PI/2);
      for(const [bx,by] of [[-11.0,.2],[-11.0,.6]]) A.blk(.5,.4,.4,M(tTwBoxPlain),bx,by,5.5,0,by<.4);
      /* the Licenciado: the desk, the books open on it, the safe, the lamp */
      A.furn('desk',-6.4,4.2,Math.PI); A.pic(tTw11Ledger,-6.6,.785,4.1,0,.26,.26,{rx:-Math.PI/2}); A.blk(.05,.01,.1,mBlack,-6.0,.785,4.25,.4);
      twSolid(.7,1.0,.6,M(tSteel,{color:0x5a5c60}),-9.0,5.5); mk(cyl(.06,.06,.03,8),M(tSteel),floorN,-8.82,.6,5.19,Math.PI/2,0,0);
      twLamp(A,-4.4,5.4,-.4,-.5);
      /* the phones */
      for(const x of [-.8,3.0]){ A.furn('desk',x,5.4,Math.PI); A.blk(.18,.07,.2,mBlack,x+.3,.81,5.3,.2); A.blk(.3,.01,.22,M(tWhite),x-.2,.785,5.35,-.1); }
      A.furn('filing',4.5,2.2,Math.PI/2); A.light([1.2,2.3,3.5],[1.05,1.1,1.15],5.0);
      /* the shredder, sacks of what it ate */
      twSolid(.5,.7,.4,mBlack,8.0,5.6); for(const [sx,sz] of [[9.2,5.4],[9.6,4.8],[6.2,5.5]]) A.blk(.5,.55,.45,M(null,{color:0xd8d4c8}),sx,.27,sz,sx,true);
      /* the break room: coffee, a table, the cleaner's cart */
      A.furn('table',13.5,3.6,0); A.furn('counter',14.5,5.62,Math.PI); A.blk(.4,.85,.6,M(null,{color:0x3a6a8a}),11.4,.43,5.2,0,true);
      /* south: the vault. Dollars on pallets, shrink-wrapped */
      for(const px of [-14.6,-11.4]){ mk(box(1.1,.12,.9,{at:[0,.06,0]}),M(tCrate),floorN,px,0,-5.3); twSolid(1.0,.8,.8,M(tTwMoney,{repeat:[5,4]}),px,-5.3,0,.12); }
      /* the conference room: the long table, the corkboard with the team and their prices */
      A.furn('table',-7.6,-3.6,0); A.furn('table',-6.6,-3.6,0); A.pic(tTw11Cork,-10+.08,1.55,-3.4,Math.PI/2,1.5,1.0);
      A.light([-7.1,2.2,-3.6],[1.4,1.1,.7],5.0);
      twRK(A,'store',-.25,-1,1.6);
      /* a bathroom, dark */
      twSolid(.4,.42,.55,M(null,{color:0xc8c4b8}),8.8,-5.6); twSolid(1.6,.55,.72,M(null,{color:0xc8c4b8}),6.6,-5.55);
      /* the secretary: her desk, the typewriter, the lamp */
      A.furn('desk',13.4,-5.4,0); A.blk(.34,.12,.26,mTwBar,13.3,.84,-5.4,.1); twLamp(A,15.2,-5.4,-.5,.5);
      A.tag(0,-1.5,1.45,-1); A.tag(3,8.0,1.5,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'gunman',name:'Licenciado',spots:[[-6.5,5.5,Math.PI],[-7.5,5.5,Math.PI+.2]],pose:'phone',extra:'I\'m a lawyer! I keep the books, that\'s all—'},
      {kind:'enforcer',name:'Sansón',spots:[[-4.5,2.0,Math.PI],[-8.0,2.2,Math.PI-.3]],pose:'watch',extra:'I just drive him—'},
      {kind:'gunman',name:'Polo',spots:[[-.8,4.5,0]],pose:'phone',extra:'I answer phones, man—'},
      {kind:'vecino2',hidden:true,look:'any',name:'Kike',spots:[[3.0,4.5,0]],pose:'phone',extra:'I\'m an intern! An intern—'},
      {kind:'vecino4',hidden:true,look:'any',name:'Rubén',spots:[[8.0,4.5,0],[7.5,4.0,.4]],pose:'lean',extra:'I fix the printers! The printers—'},
      {kind:'enforcer',name:'Iván',spots:[[-13.0,-3.5,0],[-13.5,-3.0,.3]],pose:'watch',extra:'Take it! Take the money—'},
      {kind:'gunman',name:'Fito',spots:[[-9.0,-3.0,-Math.PI/2],[-9.0,-4.0,-Math.PI/2]],pose:'lean',extra:'I didn\'t set the prices—'}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Marisela',spots:[[13.4,-4.5,Math.PI]],pose:'phone',extra:'I answer the phone! That\'s all—'},
      {kind:'abuela',civ:true,fem:true,old:true,name:'Doña Chayo',spots:[[12.0,4.0,Math.PI/2],[12.5,2.5,Math.PI/2]],pose:'idle',extra:'I clean! I just clean—'}],
    talk:[
      {who:['Licenciado'],r:3.8,lines:[['Licenciado','Yes. Twenty thousand to the informant.'],['Licenciado','Dale. D-A-L-E.'],['Licenciado','Paid Thursday. In dollars.'],['Licenciado','No, Don Aurelio doesn\'t know.'],['Licenciado','Don Aurelio doesn\'t read the books.'],['Licenciado','...I read the books.']]},
      {who:['Polo','Kike'],r:3.8,lines:[['Polo','Morgue says five.'],['Kike','Papers say five.'],['Polo','El Tuerto says six went in.'],['Kike','So where\'s six?'],['Polo','Not in the morgue.'],['Kike','...lock the door, Polo.']]},
      {who:['Rubén'],r:3.8,lines:[['Rubén','Shred everything, he says.'],['Rubén','Everything with a name on it.'],['Rubén','Six names.'],['Rubén','...I kept a copy.']]},
      {who:['Iván'],r:3.8,lines:[['Iván','Count it again.'],['Iván','Still short.'],['Iván','Somebody\'s skimming the cop money.'],['Iván','...Gordito.']]},
      {who:['Fito'],r:3.8,lines:[['Fito','The old one, ten.'],['Fito','The woman, ten.'],['Fito','The fed, fifty.'],['Fito','Why\'s the fed worth fifty?'],['Fito','...unless he was ours.']]},
      {who:['Marisela'],r:3.8,lines:[['Marisela','Licenciado\'s office, good evening.'],['Marisela','No, he\'s not taking calls.'],['Marisela','No, sir. No police here.'],['Marisela','...who gave you this number?']]},
      {who:['Doña Chayo'],r:3.8,lines:[['Doña Chayo','Mop the floors. Empty the bins.'],['Doña Chayo','Don\'t read the papers.'],['Doña Chayo','I can\'t read anyway.'],['Doña Chayo','Lucky me.']]}],
    loot:[],
    clear:['FLOOR 11','Twenty thousand for the tip. Four floors to go.'] },

  /* 12: the badges. The municipal police the Landlord pays to stay away sit up here instead: lockers, a duty desk, dominoes,
     a cage with the man who saw the van. Comandante Ruelas on the phone, keeping every unit out of the area */
  { n:12,name:'Floor 12',kit:'pistol',wall:'blue',floor:'lino',len:16,
    units:[{side:1,x0:-16,x1:-10,door:-12.0,paper:'concrete',fl:'conc'},{side:1,x0:-10,x1:-3,door:-4.2,win:true,winX:-7.6,paper:'blue',fl:'check'},{side:1,x0:-3,x1:3.5,door:-.4,paper:'concrete',fl:'conc'},
      {side:1,x0:3.5,x1:10,door:5.0,win:true,winX:8.0,hole:3.6,paper:'sage',fl:'check'},{side:1,x0:10,x1:16,door:12.6,win:true,hole:3.4,paper:'peel',fl:'conc'},
      {side:-1,x0:-16,x1:-10,door:-12.6,win:true,paper:'peel',fl:'conc'},{side:-1,x0:-10,x1:-3.6,door:-4.6,win:true,winX:-7.0,paper:'panel',fl:'oak'},{side:-1,x0:-3.6,x1:3,door:1.8,win:true,winX:-.4,paper:'nicotine',fl:'conc'},
      {side:-1,x0:3,x1:9.6,door:4.6,paper:'tile',fl:'tile'},{side:-1,x0:9.6,x1:16,door:12.0,hole:3.0,paper:'sage',fl:'check'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-2,'dead'); A.tube(4,'on'); A.tube(10,'dead'); A.tube(14,'dead');
      A.light([4,2.5,0],[1.0,1.08,1.2],5.6,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* lockers, uniforms on the wall, caps on a shelf */
      for(let k=0;k<10;k++) twSolid(.45,1.9,.45,M(tLocker),-15.5+k*.5,5.65);
      for(let k=0;k<4;k++){ mk(box(.06,1.1,.42),M(tTw12Uniform),floorN,-15.88,1.3,2.2+k*.7); mk(cyl(.1,.11,.06,8),M(null,{color:0x141c30}),floorN,-15.8,1.95,2.2+k*.7); }
      /* the duty desk: the base radio, the map, the log */
      A.furn('desk',-7.0,4.6,Math.PI); A.blk(.34,.14,.24,mBlack,-7.3,.85,4.6,.1); A.blk(.06,.02,.006,M(null,{color:0x7ad07a,unlit:true}),-7.3,.88,4.478);
      A.pic(tTw9Map,-7.0,1.6,5.926,Math.PI,.9,.6); A.pic(tTw9Log,-6.5,.785,4.55,.2,.18,.18,{rx:-Math.PI/2}); A.furn('filing',-9.5,5.6,Math.PI);
      A.light([-6.4,2.3,3.6],[1.05,1.1,1.15],5.5);
      /* the cage, the bucket in it, a chair outside it */
      twBars('x',3.4,.6,3.3); twBars('z',.6,3.4,5.93); A.furn('bucket',2.9,5.4,0); A.blk(.4,.45,.4,M(tWood),-1.6,.225,3.6,.3,true);
      A.bulb(.6,2.8,true,true,2.1); A.light([.6,2.0,2.8],[1.5,1.0,.52],4.6);
      /* dominoes under a bulb */
      A.furn('table',7.0,3.4,0); for(let k=0;k<9;k++) A.blk(.05,.012,.025,M(tWhite),6.7+(k%5)*.1,.775,3.3+Math.floor(k/5)*.12,k*.5);
      for(let k=0;k<4;k++) mk(cyl(.03,.035,.24,6,{at:[0,.12,0]}),mTwBeer,floorN,6.6+k*.25,.77,3.65);
      A.bulb(7.0,3.4,true,true,2.05); A.light([7.0,1.9,3.4],[1.55,1.02,.52],4.6);
      twRK(A,'store',13.0,1,12.6);
      twRK(A,'squat',-13,-1,-12.6);
      /* Ruelas: the desk, the envelope, the photo with the patrón */
      A.furn('desk',-7.4,-5.4,0); A.blk(.22,.02,.12,mTwEnvelope,-7.2,.79,-5.3,.3); A.pic(tTw12Photo,-6.2,1.5,-5.926,0,.2,.14); twLamp(A,-9.2,-5.4,.4,.5);
      /* the cots */
      A.furn('mattress',-2.4,-5.45,0); A.furn('mattress',1.6,-5.45,0); twBoots(-2.6,-4.6,.2); twBoots(1.4,-4.6,-.3);
      twRK(A,'kitchen',6.3,-1,4.6);
      twRK(A,'living',12.8,-1,12.0);
      A.tag(1,-6.0,1.45,-1); A.tag(6,8.0,1.5,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'enforcer',name:'Robles',spots:[[-7.0,5.5,Math.PI]],pose:'watch',extra:'I\'m police! I\'m police—'},
      {kind:'gunman',name:'Muñoz',spots:[[-5.0,3.5,-Math.PI/2+.4],[-4.5,2.5,-Math.PI/2]],pose:'idle',extra:'I have kids! Two kids—'},
      {kind:'gunman',name:'Pineda',spots:[[-1.0,3.0,Math.PI/2],[-1.0,4.5,Math.PI/2]],pose:'watch',extra:'I was just guarding him—'},
      {kind:'doorman',name:'Salas',spots:[[7.0,2.0,0]],pose:'lean',extra:'We never came down! We never came down—'},
      {kind:'vecino1',hidden:true,look:'any',name:'Ochoa',spots:[[7.0,4.5,Math.PI]],pose:'lean',extra:'I\'m off duty! I live here—'},
      {kind:'enforcer',name:'Ruelas',spots:[[-7.4,-4.5,Math.PI]],pose:'phone',extra:'You\'re a cop, I\'m a cop— think—'},
      {kind:'vecino3',hidden:true,look:'any',name:'Rivas',spots:[[-.5,-5.0,Math.PI],[-1.0,-3.0,Math.PI]],pose:'watch',extra:'I just rent here, man—'}],
    civ:[{kind:'obrero',civ:true,look:'any',name:'Wicho',spots:[[2.0,4.8,Math.PI],[1.5,4.5,Math.PI-.4]],pose:'idle',extra:'I didn\'t see nothing! Nothing!'}],
    talk:[
      {who:['Robles','Muñoz'],r:3.8,lines:[['Muñoz','Dispatch is asking about the trucks.'],['Robles','Say we\'re on it.'],['Muñoz','Are we on it?'],['Robles','We\'re on twelve, Muñoz.'],['Muñoz','Five of ours, Sarge.'],
        ['Robles','Not ours. Gringos and feds.'],['Muñoz','...the woman grew up four streets from here.']]},
      {who:['Pineda','Wicho'],r:3.8,lines:[['Wicho','I didn\'t see nothing.'],['Pineda','You saw the van.'],['Wicho','I saw a van. Vans come.'],['Pineda','You saw six get out.'],['Wicho','...I saw five come out.'],['Pineda','Shut up, Wicho.']]},
      {who:['Salas','Ochoa'],r:3.8,lines:[['Salas','Double six.'],['Ochoa','Five hundred a helmet, the boys got.'],['Salas','And us?'],['Ochoa','We get paid not to come.'],['Salas','Easy money.'],['Ochoa','...till the sixth comes.']]},
      {who:['Ruelas'],r:3.8,lines:[['Ruelas','Comandante Ruelas.'],['Ruelas','No units in the area. As agreed.'],['Ruelas','The sixth? Not in any hospital.'],['Ruelas','Then he\'s in the building.'],['Ruelas','...then send more than municipal police.']]},
      {who:['Rivas'],r:3.8,lines:[['Rivas','My wife thinks I\'m on patrol.'],['Rivas','I am. Sort of.'],['Rivas','Patrolling twelve.'],['Rivas','...where the money is.']]}],
    loot:[],
    clear:['FLOOR 12','Paid not to come. Three floors to go.'] }
);
