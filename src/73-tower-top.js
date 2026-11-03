/* =====================================================================
   THE TOWER, floors 13-15: the top. His family's floor, the unfinished floor his last men hold behind barricades, and the
   top, where Don Aurelio (the Landlord) waits at his window. His son sold the team to a gringo called Kane, and him with them.
   Then the stairs go on to the roof, and that's the end.
   ===================================================================== */

/* ---------- the details ---------- */
const tTw13Cloth=cl(16,16,'#ece8de',6,1301,g=>{ R(g,'#d8d0bc',0,0,16,1); R(g,'#d8d0bc',0,15,16,1); for(let x=1;x<16;x+=4) R(g,'#e0d8c4',x,1,1,14); });
const tTw13Wedding=tex(12,16,'#5a3a22',g=>{ R(g,'#d8d0bc',1,1,10,14); R(g,'#8a8a86',2,3,3,2); R(g,'#c89474',2,4,3,3); R(g,'#1e1c22',2,7,3,7); R(g,'#c89474',7,4,3,3); R(g,'#2a1a10',7,3,3,2); R(g,'#f2ede2',6,7,5,7); });
const tTw14Sand=cl(16,16,'#8a7a5a',14,1401,g=>{ for(let y=0;y<16;y+=4){ R(g,'#6a5a3e',0,y+3,16,1); for(let x=(y/4%2)*4;x<16;x+=8) R(g,'#6a5a3e',x,y,1,4); } });
const tTw14Cement=cl(8,8,'#b8b0a0',10,1402,g=>{ R(g,'#a8241c',1,2,6,2); });
const tTw15City=tex(32,16,'#0a0c14',g=>{ const r=rng(1501); for(let i=0;i<70;i++) R(g,r()<.7?'#e8a24a':'#c8d0e0',r()*32|0,6+(r()*10|0),1,1); R(g,'#141a28',0,0,32,5); R(g,'#2a1a14',0,14,32,2); });
const mTwConcrete=M(null,{color:0x8a8780}), mTwRebar=M(null,{color:0x5a3a2a}), mTwCloth=M(tTw13Cloth);

/* the phone in your vest, ringing at the end: two tones, twice, then again */
function twRing(){ const ac=AC; if(!ac) return; const B=audioBus(ac),t0=ac.currentTime+.6;
  for(let r=0;r<3;r++) for(let b=0;b<2;b++){ const t=t0+r*3+b*.5,g=ac.createGain(); g.connect(B.inp); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.06,t+.02); g.gain.setValueAtTime(.06,t+.38); g.gain.linearRampToValueAtTime(0,t+.4);
    for(const f of [440,480]){ const o=ac.createOscillator(); o.type='sine'; o.frequency.value=f; o.connect(g); o.start(t); o.stop(t+.42); } } }
/* a barricade across the hall: crates and sandbags, chest high, solid */
function twBarricade(x,z0,z1){ const zc=(z0+z1)/2,w=z1-z0; twSolid(.5,.6,w,M(tCrate),x,zc); twSolid(.55,.45,w,M(tTw14Sand,{repeat:[1,w*1.5]}),x,zc,0,.6); A_mattress(x+.3,zc,w); }
function A_mattress(x,z,w){ mk(box(.2,1.3,Math.min(w,1.4)),M(tMattress),floorN,x,.65,z,0,0,.12); }
/* cement bags on a pallet, rebar bundles: the floor never finished */
function twSite(x,z,ry){ const n=N(floorN,x,0,z,0,ry,0); mk(box(1.1,.12,.9,{at:[0,.06,0]}),M(tCrate),n); for(let k=0;k<6;k++) mk(box(.48,.14,.32),M(tTw14Cement),n,(k%2-.5)*.5,.19+Math.floor(k/2)*.14,0);
  addBox(x-.6,x+.6,z-.6,z+.6,0,.6,'furn'); }
function twRebar(x,z,ry,len=2.4){ for(let k=0;k<7;k++) mk(cyl(.01,.01,len,3),mTwRebar,floorN,x+(k%3)*.03,.03+Math.floor(k/3)*.02,z,0,ry,Math.PI/2); }

/* ---------- the floors ---------- */
TOWER.push(
  /* 13: the family. Don Aurelio's wife waits for him to come down to dinner. His sister prays in the little chapel with her
     nurse. His son Aurelito is on the phone in English to a man called Kane. Security watches the landings go dark one by one */
  { n:13,name:'Floor 13',kit:'pistol',wall:'cream',floor:'oak',len:16,
    units:[{side:1,x0:-16,x1:-10,door:-12.0,win:true,paper:'blue',fl:'oak'},{side:1,x0:-10,x1:-3,door:-4.0,win:true,winX:-6.6,paper:'panel',fl:'parquet'},{side:1,x0:-3,x1:3.6,door:.4,paper:'cream',fl:'rug'},
      {side:1,x0:3.6,x1:10,door:4.8,win:true,winX:8.0,hole:3.6,paper:'sage',fl:'carpet'},{side:1,x0:10,x1:16,door:12.4,win:true,hole:3.4,paper:'concrete',fl:'conc'},
      {side:-1,x0:-16,x1:-10,door:-12.6,win:true,paper:'pink',fl:'rug'},{side:-1,x0:-10,x1:-3.4,door:-4.4,win:true,winX:-7.0,paper:'panel',fl:'carpet'},{side:-1,x0:-3.4,x1:3.2,door:-1.6,paper:'tile',fl:'tile'},
      {side:-1,x0:3.2,x1:9.6,door:4.4,paper:'dark',fl:'conc'},{side:-1,x0:9.6,x1:16,door:12.0,hole:3.0,paper:'cream',fl:'oak'}],
    build(A){ A.tube(-14,'dead'); A.tube(-8,'dead'); A.tube(-2,'on'); A.tube(4,'dead'); A.tube(10,'dead'); A.tube(14,'dead');
      A.light([-2,2.5,0],[1.0,1.08,1.2],5.4,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      twRK(A,'bed',-13,1,-12.0);
      /* the dining room: a long table under a cloth, set for two, candles, his chair empty */
      A.furn('table',-7.4,3.8,0); A.furn('table',-6.4,3.8,0); A.blk(2.1,.01,.8,mTwCloth,-6.9,.775,3.8);
      for(const [px,pz] of [[-7.6,3.8],[-6.2,3.8]]){ mk(cyl(.12,.1,.015,10),M(tWhite),floorN,px,.79,pz); mk(cyl(.08,.07,.01,8),M(null,{color:0x8a3a1a}),floorN,px,.8,pz); }
      for(const cx of [-7.0,-6.8]) A.blk(.04,.18,.04,M(tTwCandle),cx,.87,3.8);
      for(const [cx,cz] of [[-8.3,3.8],[-5.5,3.8]]) A.blk(.42,.9,.42,M(tWood),cx,.45,cz,0,true);
      A.pic(tTw13Wedding,-3.1,1.5,4.0,-Math.PI/2,.22,.3);
      A.light([-6.9,1.2,3.8],[1.45,.85,.4],4.8,'candle');
      /* the chapel: an altar with the Virgin, candles in red glass, a kneeler */
      A.furn('table',.3,5.5,0); A.pic(tTwVirgin,.3,1.55,5.926,Math.PI,.4,.6);
      for(let k=0;k<7;k++) mk(cyl(.025,.025,.08,6),M(null,{color:0xd8362e,unlit:true}),floorN,-.1+k*.13,.81,5.4+(k%2)*.12);
      A.blk(.8,.12,.3,M(tWood),.3,.06,4.5);
      /* Aurelito's room: a big bed, the TV going, sneakers in boxes, the lamp */
      A.furn('bed',8.4,5.45,Math.PI); twTV(A,5.0,5.5,Math.PI,tTVStatic);
      for(let k=0;k<5;k++) A.blk(.34,.12,.2,M(null,{color:[0xe8e2cf,0xd8362e,0x1a1a1a][k%3]}),9.4,.06+k*.12,2.0,.1*k,k===0);
      twLamp(A,9.4,3.4,-.4,.2);
      twRK(A,'store',13.0,1,12.4);
      twRK(A,'living',-13,-1,-12.6);
      /* the master bedroom, dark: his bed made, his suits */
      A.furn('bed',-7.0,-5.45,0); A.furn('wardrobe',-9.4,-5.65,0); A.furn('wardrobe',-4.4,-5.65,0);
      /* the kitchen: a bulb, a pot on, the bodyguard eating standing up */
      A.furn('counter',0,-5.62,0); A.furn('fridge',1.9,-5.6,0); twSolid(.6,.88,.6,M(null,{color:0xd8d4c8}),-2.0,-5.6); mk(cyl(.16,.15,.24,8,{at:[0,.12,0]}),M(tSteel),floorN,-2.0,.88,-5.6);
      A.furn('table',.6,-3.4,Math.PI/2); A.bulb(0,-3.6,true,true,2.1); A.light([0,1.9,-3.6],[1.55,1.02,.52],4.6);
      /* security: a desk of monitors, half of them black */
      A.furn('desk',6.4,-5.4,0); A.blk(1.0,.6,.36,mBlack,6.4,1.08,-5.5);
      for(const [mx,my,t] of [[6.16,1.22,tTw9CamA],[6.64,1.22,null],[6.16,.93,null],[6.64,.93,tTw9CamB]]) A.pic(t||tTVStatic,mx,my,-5.315,0,.42,.27,{unlit:true,color:t?0xb8c8b8:0x303030});
      A.light([6.4,1.3,-4.6],[.5,.66,.88],4.4,'tv');
      twRK(A,'bed',12.8,-1,12.0);
      A.tag(7,6.0,1.45,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'enforcer',name:'Garza',spots:[[-9.0,2.2,Math.PI/2],[-4.5,2.0,-Math.PI/2]],pose:'watch',extra:'Not in front of the señora— please—'},
      {kind:'gunman',name:'Aurelito',spots:[[6.5,3.0,Math.PI/2],[7.5,2.5,0]],pose:'phone',extra:'My father will pay! Whatever you want—'},
      {kind:'vecino2',hidden:true,look:'any',name:'Melchor',spots:[[-5.0,-3.0,Math.PI],[-8.5,-3.0,Math.PI]],pose:'lean',extra:'I\'m the driver! Just the driver—'},
      {kind:'enforcer',name:'Chepo',spots:[[-.5,-3.4,Math.PI/2]],pose:'lean',extra:'I\'m just security—'},
      {kind:'gunman',name:'Tapia',spots:[[6.4,-4.5,Math.PI]],pose:'watch',extra:'I watch the cameras, that\'s all—'}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Doña Elvira',spots:[[-6.9,5.0,Math.PI]],pose:'idle',extra:'This is my home! My home—'},
      {kind:'abuela',civ:true,fem:true,old:true,name:'Doña Socorro',spots:[[.3,4.5,0]],pose:'idle',extra:'God sees you, son. God sees—'},
      {kind:'enfermera',civ:true,fem:true,name:'Juana',spots:[[-1.5,4.0,.3],[1.8,3.0,-.3]],pose:'idle',extra:'I just take care of her—'}],
    talk:[
      {who:['Doña Elvira','Garza'],r:3.8,lines:[['Doña Elvira','Is he coming down to eat?'],['Garza','Don Aurelio eats upstairs tonight, señora.'],['Doña Elvira','Forty years he eats with me.'],['Garza','Tonight he eats upstairs.'],
        ['Doña Elvira','What happened on the stairs, Garza?'],['Garza','...the soup\'s getting cold, señora.']]},
      {who:['Doña Socorro','Juana'],r:3.8,lines:[['Doña Socorro','Pray with me, Juana.'],['Juana','Yes, señora.'],['Doña Socorro','For my brother.'],['Juana','For Don Aurelio.'],['Doña Socorro','And for the boys on the stairs.'],['Juana','...which boys, señora?'],['Doña Socorro','All of them.']]},
      {who:['Aurelito'],r:3.8,lines:[['Aurelito','Mr. Kane. Yes.'],['Aurelito','It\'s done. Five.'],['Aurelito','My father? He doesn\'t know anything.'],['Aurelito','After tonight the plaza\'s mine.'],['Aurelito','You said. You promised.'],['Aurelito','...hello?']]},
      {who:['Chepo'],r:3.8,lines:[['Chepo','The boss\'s son is on the phone again.'],['Chepo','In English.'],['Chepo','Since when does Aurelito speak English?'],['Chepo','...since the dollars.']]},
      {who:['Tapia'],r:3.8,lines:[['Tapia','Camera four\'s dark.'],['Tapia','Camera six is dark.'],['Tapia','Who\'s cutting the cameras?'],['Tapia','...floor by floor.']]},
      {who:['Melchor'],r:3.8,lines:[['Melchor','Car\'s ready.'],['Melchor','If it goes bad, I drive.'],['Melchor','The old man or the son?'],['Melchor','...whoever pays.']]}],
    loot:[],
    clear:['FLOOR 13','His family. Two floors to go.'] },

  /* 14: the last stand. The floor was never finished: bare concrete, cement bags, rebar. His last men pile crates and sandbags
     across the hall and light it from behind. Every party wall has a hole in it: the way round. Lobo comes looking with a light */
  { n:14,name:'Floor 14',kit:'pistol',wall:'concrete',floor:'conc',len:16,amb:[.13,.13,.14],
    units:[{side:1,x0:-16,x1:-8,door:-10.0,win:true,paper:'concrete',fl:'conc'},{side:1,x0:-8,x1:0,door:-2.0,win:true,hole:3.0,paper:'concrete',fl:'conc'},{side:1,x0:0,x1:8,door:2.0,win:true,hole:4.0,paper:'concrete',fl:'conc'},
      {side:1,x0:8,x1:16,door:13.0,win:true,hole:3.0,paper:'concrete',fl:'conc'},
      {side:-1,x0:-16,x1:-8,door:-12.0,win:true,paper:'concrete',fl:'conc'},{side:-1,x0:-8,x1:0,door:-6.0,win:true,hole:4.0,paper:'concrete',fl:'conc'},{side:-1,x0:0,x1:8,door:6.0,win:true,hole:3.0,paper:'concrete',fl:'conc'},
      {side:-1,x0:8,x1:16,door:10.0,win:true,hole:4.2,paper:'concrete',fl:'conc'}],
    build(A){ for(const x of [-12,-6,0,6,12]) A.tube(x,'dead');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the hall: two barricades, each with a gap at one side, each lit from behind into your eyes */
      twBarricade(-4.0,-1.0,0.0); twBarricade(5.0,0.0,1.0);
      twWorkLamp(A,-1.6,.65,-9,0,[1.6,1.5,1.25],7.5); twWorkLamp(A,7.6,-.65,0,0,[1.6,1.5,1.25],7.5);
      /* the rooms: the site */
      twSite(-13.0,4.6,.2); twRebar(-11.0,2.4,.1); twSite(-5.5,-4.8,-.3); twRebar(-3.0,-2.2,1.4); twSite(11.6,4.8,.1); twSite(13.0,-4.6,.5); twRebar(10.4,-2.4,.3);
      { const mx=-4.6,mz=4.6; mk(cyl(.4,.3,.7,8,{at:[0,.35,0]}),M(null,{color:0xc8781a}),floorN,mx,.4,mz,.6,0,0); mk(box(.9,.4,.6,{at:[0,.2,0]}),mBlack,floorN,mx,0,mz); addBox(mx-.5,mx+.5,mz-.45,mz+.45,0,1.0,'furn'); } /* the mixer */
      for(const x of [2.5,4.5]){ for(const z of [5.4,4.0]) mk(box(.05,2.0,.05,{at:[0,1.0,0]}),mSteel,floorN,x,0,z); mk(box(.05,.05,1.5),mSteel,floorN,x,1.0,4.7); mk(box(.05,.05,1.5),mSteel,floorN,x,1.95,4.7); }
      mk(box(2.1,.04,1.5),M(tWoodLight),floorN,3.5,1.97,4.7); addBox(2.4,4.6,3.9,5.5,0,.3,'furn'); /* scaffolding */
      twWorkLamp(A,4.0,2.4,4.0,5.6,[1.4,1.3,1.1],5.0);
      /* the old man they tied up: a chair, the rope, a bucket */
      A.blk(.42,.45,.42,M(tWood),4.0,.225,-4.4); A.blk(.4,.5,.06,M(tWood),4.0,.7,-4.6); A.blk(.44,.02,.44,M(null,{color:0xb8a272}),4.0,.6,-4.4); A.furn('bucket',5.0,-5.4,0);
      twWorkLamp(A,1.2,-5.0,4.0,-4.4,[1.3,1.15,.9],4.6);
      A.tag(2,-6.0,1.45,1); A.tag(6,10.0,1.5,-1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'doorman',name:'Rayo',stay:true,spots:[[-3.0,-.5,-Math.PI/2]],pose:'watch',extra:'I\'m just a guard! A guard—'},
      {kind:'menforcer',name:'Cobra',stay:true,spots:[[-2.5,.5,-Math.PI/2]],pose:'watch',extra:'Army! I was army— please—'},
      {kind:'enforcer',name:'Bravo',stay:true,spots:[[6.0,.5,-Math.PI/2]],pose:'watch',extra:'Orders, man! Orders—'},
      {kind:'gunman',name:'Coyote',stay:true,spots:[[6.5,-.5,-Math.PI/2]],pose:'watch',extra:'Take the money— there\'s money upstairs—'},
      {kind:'menforcer',name:'Jaguar',spots:[[4.0,3.0,-Math.PI/2],[6.0,3.0,-Math.PI/2]],pose:'watch',extra:'Okay. Okay. You win.'},
      {kind:'doorman',name:'Lobo',spots:[[16.35,.55,-Math.PI/2]],pose:'idle',extra:'Don\'t— don\'t—',
        hunt:{pts:[[13.0,0],[13.0,3.0],[13.0,0],[10.0,0],[10.0,-3.0],[10.0,0],[6.0,-.5],[6.0,-3.0],[6.0,-.5],[2.0,-.5],[2.0,2.6],[2.0,-.5],[-2.0,.5],[-2.0,2.6],[-2.0,.5],[-6.0,.5],[-6.0,-3.0],[-6.0,.5],
          [-10.0,.5],[-10.0,3.0],[-10.0,.5],[-12.0,.5],[-12.0,-3.0],[-12.0,.5],[-16.35,.5],[0,.5],[16.35,.4]],
          calls:['Cop?','Twelve floors, cop.','You must be tired.','Sit down. Rest.','...we\'ll make it quick.']}}],
    civ:[{kind:'abuelo',civ:true,old:true,name:'Don Fidel',spots:[[4.0,-4.4,Math.PI]],pose:'idle',extra:'Untie me, son. Please—'}],
    talk:[
      {who:['Rayo','Cobra'],r:3.8,lines:[['Rayo','Nobody\'s answering from thirteen.'],['Cobra','Then he\'s on thirteen.'],['Rayo','Or he\'s done with thirteen.'],['Cobra','Then he\'s coming up those stairs.'],['Rayo','One man.'],['Cobra','One man did twelve floors, Rayo.']]},
      {who:['Bravo','Coyote'],r:3.8,lines:[['Coyote','Aurelio says hold.'],['Bravo','Then we hold.'],['Coyote','Aurelito says run.'],['Bravo','Aurelito doesn\'t pay us.'],['Coyote','...the gringo does.']]},
      {who:['Jaguar'],r:3.8,lines:[['Jaguar','Army taught me one thing.'],['Jaguar','The man coming up the stairs loses.'],['Jaguar','Always.'],['Jaguar','...almost always.']]},
      {who:['Don Fidel'],r:3.8,lines:[['Don Fidel','I built this floor.'],['Don Fidel','Poured the concrete myself.'],['Don Fidel','He never paid us for fourteen.'],['Don Fidel','Now they tie me to a chair in it.']]}],
    loot:[],
    clear:['FLOOR 14','One floor to go.'] },

  /* 15: the top. Half of it bare concrete; the other half his: the penthouse with the window over the city, the office with
     the books, the kitchen where Doña Lucha keeps his dinner warm. Don Aurelio stands at the window and waits for you. One of
     his son's men waits too, in the guest room, for both of you */
  { n:15,name:'Floor 15',kit:'pistol',wall:'concrete',floor:'conc',len:16,
    units:[{side:1,x0:-16,x1:-6,door:-9.0,win:true,paper:'concrete',fl:'conc'},{side:1,x0:-6,x1:6,door:-4.6,win:true,winX:1.0,paper:'panel',fl:'rug'},{side:1,x0:6,x1:16,door:7.4,win:true,winX:11.0,paper:'panel',fl:'oak'},
      {side:-1,x0:-16,x1:-8,door:-12.0,win:true,paper:'concrete',fl:'conc'},{side:-1,x0:-8,x1:0,door:-1.2,win:true,winX:-4.0,paper:'tile',fl:'tile'},{side:-1,x0:0,x1:8,door:1.2,win:true,winX:4.6,paper:'cream',fl:'carpet'},
      {side:-1,x0:8,x1:16,door:9.4,hole:3.0,paper:'concrete',fl:'conc'}],
    build(A){ A.tube(-12,'dead'); A.tube(-6,'dead'); A.tube(0,'on'); A.tube(6,'dead'); A.tube(12,'dead');
      A.light([0,2.5,0],[1.0,1.08,1.2],5.2,'flick');
      A.light([-11.5,2.35,0],[1.25,.92,.56],5);
      /* the unfinished half */
      twSite(-14.0,4.8,.3); twRebar(-11.5,2.2,.2); twSite(-14.0,-4.8,-.2); twRebar(-10.0,-2.4,1.2);
      /* the penthouse: the rug, the couch facing the window, the bar, the city through the glass, his trucks' lights far below */
      A.furn('couch',1.0,2.2,0); A.blk(1.4,.4,.5,M(tWood),-3.6,.2,5.6,0,true); for(let k=0;k<6;k++) mk(cyl(.03,.035,.26,6,{at:[0,.13,0]}),k%2?mTwBeer:mTwBottle,floorN,-4.1+k*.2,.4,5.6);
      A.pic(tTw15City,1.0,1.45,5.92,Math.PI,1.36,1.06,{unlit:true,color:0x9a9a9a});
      A.pic(tTw13Wedding,4.6,1.5,5.926,Math.PI,.22,.3); A.furn('tv',5.2,2.2,Math.PI);
      twLamp(A,-1.6,4.8,.3,-.5); A.light([1.0,1.4,5.3],[1,1,1],4.6,'police');
      /* the office: his desk, the books, the photo, a lamp */
      A.furn('desk',11.0,4.0,Math.PI); A.pic(tTw11Ledger,11.2,.785,3.95,0,.26,.26,{rx:-Math.PI/2}); A.pic(tTw13Wedding,10.4,.86,4.1,Math.PI+.3,.12,.16);
      A.furn('filing',15.4,5.6,Math.PI); A.furn('filing',14.8,5.6,Math.PI); twLamp(A,8.0,5.2,.4,-.4);
      /* the kitchen: his dinner keeping warm */
      A.furn('counter',-4.0,-5.62,0); A.furn('fridge',-1.6,-5.6,0); A.furn('table',-5.6,-3.0,0); mk(cyl(.12,.1,.015,10),M(tWhite),floorN,-5.6,.79,-3.0);
      /* the guest room, dark */
      twRK(A,'bed',4.0,-1,1.2);
      /* the safe room, never finished */
      twSite(13.0,-4.6,.2);
      A.tag(4,-12.0,1.45,1);
      A.light([11.5,2.35,0],[1.0,.78,.48],4.5); },
    cast:[
      {kind:'landlord',name:'Don Aurelio',spots:[[1.0,5.0,0]],pose:'idle',extra:'Kane. Ask Kane. It was never me—'},
      {kind:'doorman',name:'Gómez',spots:[[-3.6,2.0,Math.PI],[-2.0,3.6,-Math.PI/2]],pose:'watch',extra:'I just stand by him—'},
      {kind:'enforcer',name:'Villa',spots:[[11.0,5.0,Math.PI]],pose:'lean',extra:'The books— take the books—'},
      {kind:'gunman',name:'Nube',spots:[[-11.0,5.0,0],[-12.5,3.0,.5]],pose:'watch',extra:'I\'m nobody! Nobody—'},
      {kind:'vecino4',hidden:true,look:'any',name:'Sombra',spots:[[4.0,-3.4,Math.PI],[6.5,-3.0,Math.PI]],pose:'lean',extra:'I\'m the gardener! The gardener—'}],
    civ:[{kind:'senora',civ:true,fem:true,name:'Doña Lucha',spots:[[-4.0,-4.9,Math.PI]],pose:'idle',extra:'I cook! I only cook for him—'}],
    talk:[
      {who:['Don Aurelio','Gómez'],r:3.8,lines:[['Don Aurelio','Six went up my stairs tonight.'],['Gómez','Five, patrón.'],['Don Aurelio','Six. One is still coming.'],['Don Aurelio','My son sold them. To a gringo.'],
        ['Don Aurelio','Dollars. In my building.'],['Gómez','Should we go, patrón?'],['Don Aurelio','No. Let him come.'],['Don Aurelio','A man should hear it from me.']]},
      {who:['Villa'],r:3.8,lines:[['Villa','The books, the patrón says.'],['Villa','Every dollar has a name.'],['Villa','Kane. Kane. Kane.'],['Villa','...who the hell is Kane?']]},
      {who:['Doña Lucha'],r:3.8,lines:[['Doña Lucha','He hasn\'t eaten.'],['Doña Lucha','He just stands at the window.'],['Doña Lucha','Forty years I cook for him.'],['Doña Lucha','He never stood at the window.']]},
      {who:['Nube'],r:3.8,lines:[['Nube','Top of the tower.'],['Nube','Nowhere left to go up.'],['Nube','...or down.']]},
      {who:['Sombra'],r:3.8,lines:[['Sombra','Aurelito said wait here.'],['Sombra','When the cop comes, the old man too.'],['Sombra','Both of them.'],['Sombra','...then it\'s Aurelito\'s building.']]}],
    loot:[],
    clear:['FLOOR 15','The top of the tower. The stairs go on to the roof.'],
    end(){ const A_=enemies.find(E=>E.name==='Don Aurelio'),alive=A_&&!A_.dead;
      return ['THE ROOF',(alive?'Dawn over Puerto Seco. Don Aurelio is still breathing on fifteen: an old man his own son sold. ':'Dawn over Puerto Seco. The man at the top of the tower is dead. ')+
        'The man who paid for the stairs is called Kane, and he isn\'t in this building. A phone rings in your vest. You let it ring.']; } }
);
