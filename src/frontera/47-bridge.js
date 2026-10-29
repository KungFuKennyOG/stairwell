/* =====================================================================================================
   THE BRIDGE: the northbound border crossing out of Puerto Seco at five in the afternoon. Four lanes of idling
   cars, vendors walking the lanes, a covered walkway where people queue on foot, a footbridge over the jam and
   the customs booths at the end. Kane's dirty cops are stuck in the traffic with Don Aurelio cuffed in the back.
   Ray waits on foot, in the pedestrian line. The one daylight level: seen as lit, or in thermal.
   ===================================================================================================== */

/* ---------- the people on the bridge ---------- */
Object.assign(HEADS,{
  agente:{seed:1701,skin:'#d8a888',skinD:'#a87a5e',hair:'buzz',hairC:'#5a4a3a',hairFront:15,shadow:true,brow:'#5a4a3a',browT:2,iris:'#5a6a7a',lip:'#a8685c',beard:'stubble',beardC:'#6a5a4a'},
  chofer:{seed:1702,skin:'#c49070',skinD:'#946446',hair:'slick',hairC:'#2a2420',hairFront:12,sideburn:36,shadow:true,brow:'#2a2420',browT:2,iris:'#3a2a1a',lip:'#94564a',beard:'mustache',beardC:'#2a2420'},
  preso:HEADS.patron,
  obrera:{seed:1731,skin:'#b88462',skinD:'#8a5a40',hair:'long',hairC:'#120c0a',hairFront:13,sideburn:44,behind:54,nape:58,brow:'#120c0a',iris:'#2a1a10',lip:'#9a5a50'},
  madre:{seed:1741,skin:'#c8946e',skinD:'#966a4c',hair:'long',hairC:'#2a1810',hairFront:13,sideburn:44,behind:54,nape:58,brow:'#2a1810',iris:'#2a1a10',lip:'#a8605a'},
  nina:{seed:1751,skin:'#c89a76',skinD:'#9a6e54',hair:'long',hairC:'#1a100a',hairFront:13,sideburn:44,behind:54,nape:58,brow:'#2a1a10',iris:'#2a1a10',lip:'#c07a70',white:'#e6e0d4'},
  hielero:{seed:1761,skin:'#a8724e',skinD:'#7a4a30',hair:'slick',hairC:'#8a8682',hairFront:12,sideburn:38,shadow:true,brow:'#9a9692',browT:2,iris:'#2a1a10',lip:'#7a4232',beard:'mustache',beardC:'#a8a49c',age:true},
  vendedor:{seed:1771,skin:'#9a6644',skinD:'#6a422a',hair:'buzz',hairC:'#100c0a',hairFront:15,brow:'#100c0a',iris:'#1a0e08',lip:'#6a3a2a',acne:true,white:'#e6e0d4'},
  taxista:{seed:1781,skin:'#b07a56',skinD:'#80523a',hair:'slick',hairC:'#3a3632',hairFront:12,sideburn:38,brow:'#3a3632',browT:2,iris:'#2a1a10',lip:'#84483a',beard:'mustache',beardC:'#3a3632',age:true},
  nino:{seed:1791,skin:'#c08a64',skinD:'#905e44',hair:'buzz',hairC:'#140e0a',hairFront:15,brow:'#140e0a',iris:'#2a1a10',lip:'#b0624e',white:'#e6e0d4'}
});
function shades(J){ const m=M(null,{color:0x0e0e10}); for(const s of [-1,1]) mk(box(.05,.028,.008),m,J.head,s*.032,.124,.097); mk(box(.016,.008,.006),m,J.head,0,.13,.099); }
/* the convoy: Kessler's squad, plainclothes with POLICE carriers, and their drivers */
const tAgTorso=torsoP('agente',1711,(x,y)=>{ if(crewNeck(x,y,12,9)) return sk('agente'); return y>T3.belt+2?['#2a3448','denim',.6]:['#6a6c6e','knit',.7]; },{decor:I=>{ neckShadow(I); beltI(I,'#1a1a1c','#8a8a8e'); softRect(I,84,T3.belt-2,10,12,'#c8a040',.9,.6); }});
const tAgArm=armP(1713,(x,y)=>y<50?['#6a6c6e','knit',.7]:sk('agente'),{decor:I=>{ blob(I,32,54,30,3,-.18); softRect(I,0,44,64,6,'#5a5c5e',.8,1); }});
const tAgLeg=legP(1715,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,62,8,6,.1,'#6a7a9a'); }});
const TV_AG=teamVest(1717,'#16171a','POLICE',null,'#e8e2d0');
const tChofTorso=torsoP('chofer',1721,(x,y)=>{ if(vNeck(x,y,7,14)) return sk('chofer'); return y>T3.belt+2?['#4a4c50','wool',.6]:['#e8e6e0','cotton',.6]; },{decor:I=>{ neckShadow(I);
  softRect(I,61,T3.neck+10,6,T3.belt-T3.neck-34,'#2a2e3a',.95,.8); for(const s of [-1,1]) softLine(I,64+s*24,T3.neck+4,64+s*32,T3.chest+22,'#3a2414',.95,3); softRect(I,94,T3.chest+8,12,22,'#2a1a10',.95,1);
  blob(I,64,T3.chest+30,22,14,.1,'#c8c4b8'); beltI(I,'#1a1a1c','#a8a8ac'); }});
const tChofArm=armP(1723,(x,y)=>y<58?['#e8e6e0','cotton',.6]:sk('chofer'),{decor:I=>softRect(I,0,52,64,7,'#d4d2cc',.9,1)});
const tChofLeg=legP(1725,()=>['#4a4c50','wool'],{decor:I=>{ seam(I,32,0,32,128); }});
/* the civilians: the line, the lanes and the cars */
const tObTorso=torsoP('obrera',1732,(x,y)=>{ if(vNeck(x,y,9,16)) return sk('obrera'); if(y>T3.belt+16) return ['#2a3448','denim',.6]; return ['#3a8a8a','poly',.6]; },{decor:I=>{ neckShadow(I);
  buttons(I,[64],T3.neck+22,T3.belt+10,16,'#e8e4dc'); softRect(I,36,T3.chest-10,12,16,'#e8e4dc',.95,.6); softRect(I,38,T3.chest-6,8,4,'#2a4a8a',.95,.4); softRect(I,76,T3.belt-12,22,16,'#2e7070',.7,1); }});
const tObArm=armP(1733,(x,y)=>y<44?['#3a8a8a','poly',.6]:sk('obrera'),{decor:I=>blob(I,32,48,30,3,-.18)});
const tJeans=legP(1734,()=>['#2a3448','denim'],{decor:I=>{ seam(I,48,0,48,128,'#a8834a'); blob(I,32,60,8,10,.1,'#6a7a9a'); }});
const tFlatB=garment(64,32,1735,()=>['#1a1a1c','leather',.2],{folds:2,grime:.05,decor:I=>softRect(I,0,26,64,6,'#0e0e10',1,1)});
const tMadTorso=torsoP('madre',1742,(x,y)=>{ if(crewNeck(x,y,15,12)) return sk('madre'); if(y>T3.belt+4) return ['#1e2230','denim',.6]; return ['#d8a83a','cotton',.6]; },{decor:I=>{ neckShadow(I);
  const r=rng(1743); for(let i=0;i<40;i++){ const x=r()*128,y=T3.neck+8+r()*(T3.belt-T3.neck-8); softEll(I,x,y,2.4,2,['#e8e2d4','#b8402e'][i%2],.85,.4); } beltI(I,'#3a2414','#c8a040'); }});
const tMadArm=armP(1744,(x,y)=>y<30?['#d8a83a','cotton',.6]:sk('madre'),{decor:I=>{ blob(I,32,34,30,3,-.18); softRect(I,20,110,22,5,'#c8a040',.9,.5); }});
const tDarkJeans=legP(1745,()=>['#1e2230','denim'],{decor:I=>seam(I,48,0,48,128,'#8a6a3a')});
const tNinaTorso=torsoP('nina',1752,(x,y)=>{ if(crewNeck(x,y,12,8)) return sk('nina'); return y>T3.belt+2?['#6a3a7a','knit',.5]:['#e88aa8','cotton',.6]; },{decor:I=>{ neckShadow(I);
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2-Math.PI/2; softLine(I,64,T3.chest,64+Math.cos(a)*12,T3.chest+Math.sin(a)*12,'#f2ece0',.95,3); } softRect(I,0,T3.belt-4,128,6,'#d07090',.8,1); }});
const tNinaArm=armP(1753,(x,y)=>y<26?['#e88aa8','cotton',.6]:sk('nina'),{decor:I=>blob(I,32,30,30,3,-.18)});
const tNinaLeg=legP(1754,()=>['#6a3a7a','knit',.5],{decor:I=>softRect(I,0,118,64,10,'#5a2e6a',.8,1)});
const tKidPink=garment(64,32,1755,()=>['#e8a8c0','canvas',.2],{folds:2,grime:.08,decor:I=>{ softRect(I,0,24,64,8,'#f2ece0',1,1); softLine(I,20,8,44,14,'#f2ece0',.9,1.4); }});
const tHielTorso=torsoP('hielero',1762,(x,y)=>{ if(vNeck(x,y,8,16)) return sk('hielero'); if(y>T3.belt+2) return ['#2a3448','denim',.6]; return [plaid(x,y,'#3a5a8a','#26406a','#d8d4c8'),'cotton',.7]; },{decor:I=>{ neckShadow(I);
  buttons(I,[64],T3.neck+20,T3.belt-4,16,'#e8e4dc'); for(const x of [40,88]) softRect(I,x-9,T3.chest-14,18,14,'#26406a',.5,1); beltI(I,'#3a2414','#c8c4b8'); softRect(I,54,T3.belt-7,20,14,'#a8a49c',1,.8); }});
const tHielArm=armP(1763,(x,y)=>y<36?[plaid(x,y,'#3a5a8a','#26406a','#d8d4c8'),'cotton',.7]:sk('hielero'),{decor:I=>{ blob(I,32,40,30,3,-.18); softRect(I,22,108,18,6,'#c8c4bc',.9,.5); }});
const tVendTorso=torsoP('vendedor',1772,(x,y)=>{ if(crewNeck(x,y,12,9)) return sk('vendedor'); return y>T3.belt+2?['#3a3a34','twill',.6]:['#d87a3a','cotton',.8]; },{decor:I=>{ neckShadow(I);
  textI(I,'PUMAS',47,T3.chest-10,'#f2ece0',2,.8); blob(I,64,T3.nav,40,30,.12,'#f0a060'); stain(I,40,T3.nav+6,5,'#8a6a4a',1773); }});
const tVendArm=armP(1774,(x,y)=>y<30?['#d87a3a','cotton',.8]:sk('vendedor'),{decor:I=>blob(I,32,34,30,3,-.18)});
const tVendLeg=legP(1775,()=>['#3a3a34','twill'],{decor:I=>{ seam(I,48,0,48,128); softRect(I,0,96,64,32,'#6a5a44',.25,4); }});
const tTaxTorso=torsoP('taxista',1782,(x,y)=>{ if(vNeck(x,y,9,18)) return sk('taxista'); return y>T3.belt+2?['#6a5440','twill',.6]:['#ece8de','cotton',.5]; },{decor:I=>{ neckShadow(I);
  for(const x of [44,54,74,84]) softLine(I,x,T3.neck+10,x,T3.belt-4,'#d4d0c4',.9,1.6); buttons(I,[64],T3.neck+24,T3.belt-4,14,'#c8c0b0'); blob(I,64,T3.nav,40,24,.08,'#d8d0c0'); beltI(I,'#3a2414','#c8c4b8'); }});
const tTaxArm=armP(1783,(x,y)=>y<32?['#ece8de','cotton',.5]:sk('taxista'),{decor:I=>blob(I,32,36,30,3,-.18)});
const tTaxLeg=legP(1784,()=>['#6a5440','twill'],{decor:I=>seam(I,32,0,32,128)});
const tNinoTorso=torsoP('nino',1792,(x,y)=>{ if(crewNeck(x,y,12,8)) return sk('nino'); return y>T3.belt+2?['#2a2a30','knit',.5]:[x%24<12?'#2a7a3a':'#e8e4dc','poly',.6]; },{decor:I=>{ neckShadow(I); textI(I,'10',58,T3.chest-6,'#141414',2,.9); }});
const tNinoArm=armP(1793,()=>['#2a7a3a','poly',.6],{decor:I=>softRect(I,0,0,64,30,'#e8e4dc',.0,1)});
const tNinoLeg=legP(1794,()=>['#2a2a30','knit',.5],{decor:I=>softRect(I,0,120,64,8,'#1a1a1e',.8,1)});
const tKidSneakB=garment(64,32,1795,()=>['#2a2a30','canvas',.2],{folds:2,grime:.08,decor:I=>softRect(I,0,24,64,8,'#e8e4dc',1,1)});
function gumTray(J,o){ const sy=1.09*o.hf, y=.93*o.hf-sy, z=frontAt(o,.93,.0)+.14; mk(box(.42,.05,.26),M(null,{color:0x8a6a42}),J.spine,0,y,z); mk(box(.42,.06,.01),M(null,{color:0x7a5a32}),J.spine,0,y+.05,z+.13);
  const r=rng(1776); for(let i=0;i<12;i++) mk(box(.06,.03,.05),M(null,{color:[0xe84a6a,0xf2c84a,0x3a8ae8,0x4ac86a,0xe8e2d4][i%5]}),J.spine,-.17+(i%6)*.068,y+.04,z-.07+(i/6|0)*.1);
  for(const s of [-1,1]) mk(box(.012,.4,.012),M(null,{color:0x2a2a2a}),J.spine,s*.17,y+.2,z-.1,-.4,0,0); }
Object.assign(ROSTER,{
  agente:Object.assign({as:'enforcer',side:'cop',name:'The escort',role:'Kessler\'s squad · riding the convoy',color:'#6a6c6e',note:'Narcotics, paid twice: once by the city, once by Kane. Out of the SUV with his carbine, checking every car and every face in the line. Jumpy, and getting jumpier.',
    o:{hf:1.0,w:1.04,depth:1.04,belly:1.06,lg:1.02,ag:1.04,jacket:.006,pants:.01},torso:tAgTorso,arm:tAgArm,leg:tAgLeg,foot:tBlackBoot,hand:tGlove,extra:(J,o)=>{ plateCarrier(J,o,TV_AG); cap(J,'#141416','#141416'); shades(J); }},TWO(pSMG,'smg')),
  chofer:Object.assign({as:'gunman',side:'cop',name:'The drivers',role:'Kessler\'s squad · behind the wheel',color:'#e8e6e0',note:'Engine running, AC on, shirt soaked through anyway. Shoulder holster, sunglasses. They know what is meant to happen before the booth.',
    o:{hf:.99,w:1.0,depth:1.02,belly:1.12,lg:.98,ag:1.0,jacket:.004,pants:.01},torso:tChofTorso,arm:tChofArm,leg:tChofLeg,foot:tLoaferB,extra:J=>shades(J)},PISTOL,{fight:AIM_ONE}),
  preso:Object.assign({},ROSTER.patron,{side:'cartel',was:null,name:'Don Aurelio',role:'Being extradited · cuffed in the back seat',note:'Cuffed in the back of the lead SUV, on the walkway side, window half down for the heat. On paper he\'s being handed to the US. He has already worked out that he will never reach a courtroom, and who arranged it.',extra:null,prop:null,fight:{}}),
  obrera:{side:'civ',name:'Rosa',role:'In the line · maquila worker',color:'#3a8a8a',note:'Second shift at a plant on the other side. Crosses on foot every day and knows to the minute how long the line takes. Today it hasn\'t moved.',
    o:Object.assign({jacket:.014,pants:.008},FEM),torso:tObTorso,arm:tObArm,leg:tJeans,foot:tFlatB,extra:J=>ponytail(J,'#120c0a')},
  madre:{side:'civ',name:'Lupe',role:'In the line · with her daughter',color:'#d8a83a',note:'Taking her daughter to a doctor on the other side. Holds her hand the whole way and keeps her between herself and the railing.',
    o:Object.assign({jacket:.012,pants:.008},FEM,{hf:.94,belly:1.02}),torso:tMadTorso,arm:tMadArm,leg:tDarkJeans,foot:tFlatB,extra:J=>hairBack(J,'#2a1810',.16)},
  nina:{side:'kid',name:'Daniela',role:'Kid · Lupe\'s daughter, 7',color:'#e88aa8',note:'Bored, holding her bear, watching the men in the black SUVs because nobody else will.',
    o:KID(.7,.9),torso:tNinaTorso,arm:tNinaArm,leg:tNinaLeg,foot:tKidPink,prop:pTeddy,extra:J=>hairBack(J,'#1a100a',.12,.9)},
  hielero:{side:'civ',name:'Don Chema',role:'In the line · sells cold drinks',color:'#3a5a8a',note:'Works the jam with a cooler of sodas, then walks home across the line. He has seen this bridge go bad before and stands like it.',
    o:{hf:.96,w:.98,depth:1.0,belly:1.14,lg:.94,ag:.94,jacket:.008,pants:.012},torso:tHielTorso,arm:tHielArm,leg:tJeans,foot:tWorkBoot,extra:J=>strawHat(J)},
  vendedor:{side:'kid',name:'Kevin',role:'Between the lanes · gum and lighters',color:'#d87a3a',note:'Fifteen. Walks the lanes with a tray, knocking on windows. Goes flat on the asphalt the second anything starts.',
    o:Object.assign(KID(.9,.98),{shape:'teen',w:.9,jacket:.012}),torso:tVendTorso,arm:tVendArm,leg:tVendLeg,foot:tSneakW,extra:(J,o)=>{ cap(J,'#1a3a6a','#c8302a',.98); gumTray(J,o); }},
  taxista:{side:'civ',name:'The taxi',role:'In the jam · right in front of the convoy',color:'#ece8de',note:'Driving a fare across with the radio on and his arm out the window. Close enough to the lead SUV to touch it.',
    o:{hf:.97,w:1.02,depth:1.06,belly:1.22,lg:.94,ag:.96,jacket:.006,pants:.012},torso:tTaxTorso,arm:tTaxArm,leg:tTaxLeg,foot:tLoaferB},
  nino:{side:'kid',name:'The boy in the back seat',role:'Kid · next lane over, 8',color:'#2a7a3a',note:'Kneeling on the back seat of his family\'s car, staring at you through the glass the whole time you wait.',
    o:KID(.7,.9),torso:tNinoTorso,arm:tNinoArm,leg:tNinoLeg,foot:tKidSneakB}
});
/* seated poses: driving, cuffed, and a kid turned round to stare */
function bridgePoses(C){ const S=C.poses.sit; if(!S) return; const sit=j=>({hipsY:S.hipsY,wpn:'drop',j:Object.assign({},S.j,j)});
  C.poses.drive=sit({armL:[-1.2,0,.08],elbowL:[-.55,0,0],armR:[-1.2,0,-.08],elbowR:[-.55,0,0],head:[.12,0,0]});
  C.poses.cuffed=sit({armL:[-.55,0,-.22],elbowL:[-1.05,0,0],armR:[-.55,0,.22],elbowR:[-1.05,0,0],spine:[.12,0,0],head:[.3,0,0]});
  C.poses.stare=sit({spine:[-.1,-.35,0],head:[.1,-.85,0],armR:[-1.0,0,-.3],elbowR:[-1.4,0,0]}); }
function whoB(H,id,x,z,ry,pose,o={}){ const n=N(H.g,x,o.y||0,z,0,ry,0); const C=makeChar(id,n,'p:'+H.key); bridgePoses(C); applyPose(C,pose);
  skinUpdate(C); C.node=n; tagHeat(C); H.chars.push(C); H.people.push({id,C,x,z,y:o.y||0}); return C; }

/* ---------- surfaces ---------- */
const tBridgeAsphalt=flTex('#5e5a56',1801,(g,w,h,r)=>{ for(let i=0;i<260;i++) R(g,['#6a6660','#545050','#706a62'][r()*3|0],r()*w|0,r()*h|0,1,1); for(let i=0;i<3;i++) ell(g,r()*w,r()*h,4+r()*4,2+r()*2,'rgba(30,26,24,.25)'); ell(g,20,22,5,2,'rgba(20,18,16,.35)'); },6);
const tWalk=flTex('#b8a890',1802,(g,w,h,r)=>{ for(let k=0;k<w;k+=16){ R(g,'#9a8a72',k,0,1,h); R(g,'#9a8a72',0,k,w,1); } for(let i=0;i<40;i++) R(g,['#c8b8a0','#a89880'][i%2],r()*w|0,r()*h|0,2,1); ell(g,8,24,3,2,'rgba(60,50,40,.25)'); },6);
const tCurb=P2(32,8,(g,w,h)=>{ R(g,'#c8c0b0',0,0,w,h); for(let x=0;x<w;x+=16) R(g,'#e8c838',x,0,8,h); },4,1803);
const tJersey=P2(32,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#c8c4bc'],[1,'#9a968e']]); R(g,'rgba(0,0,0,.18)',0,h-3,w,3); for(let x=4;x<w;x+=11) R(g,'rgba(60,40,20,.25)',x,4,1,h-6); },6,1804);
const tParapet=P2(32,16,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#c8bca8'],[1,'#a89c88']]); R(g,'#8a7e6a',0,0,w,2); for(let x=0;x<w;x+=16) R(g,'rgba(0,0,0,.2)',x,0,1,h); vfill(g,0,h*.6,w,h*.4,[[0,'rgba(90,60,30,0)'],[1,'rgba(90,60,30,.35)']]); },6,1805);
const tTint=cutTex(8,8,(g,w,h)=>{ for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(x%2===0&&y%2===0) R(g,'#0c0e12',x,y,1,1); else if((x+y)%4===1) R(g,'rgba(20,24,30,.9)',x,y,1,1); });
const tCarGlass=cutTex(16,16,(g,w,h)=>{ for(let y=2;y<h-2;y++){ const x=2+(y*.4|0); if(y%7<4) R(g,'rgba(210,225,235,.75)',x%w,y,1,1); } R(g,'rgba(200,215,225,.5)',0,0,w,1); });
function sign(w,h,bg,lines,seed,fg='#f2f0e8'){ return P2(w,h,(g)=>{ R(g,bg,0,0,w,h); R(g,fg,1,1,w-2,1); R(g,fg,1,h-2,w-2,1); R(g,fg,1,1,1,h-2); R(g,fg,w-2,1,1,h-2);
  lines.forEach(([t,y,s])=>{ const tw=t.length*4*s-s; text(g,t,Math.round((w-tw)/2),y,fg,s); }); },0,seed); }
const tSgGarita=sign(64,24,'#1e5a3a',[['GARITA',4,2],['PUERTO SECO',16,1]],1811);
const tSgLanes=sign(64,24,'#1e5a3a',[['USA',4,2],['CARRILES 1-4',16,1]],1812);
const tSgWelcome=sign(96,24,'#8a2a22',[['BIENVENIDOS',4,2],['A PUERTO SECO',17,1]],1813,'#f2e8d0');
const tSgInspect=sign(96,16,'#2a3440',[['INSPECCION - INSPECTION',6,1]],1814);
const tSgPeat=sign(48,16,'#1e4a7a',[['PEATONES',6,1]],1815);
const tSgLaneN=[1,2,3,4].map(n=>sign(16,16,'#2a3440',[[String(n),4,2]],1820+n));
const tMarker=P2(56,16,(g,w,h)=>{ R(g,'#a8844a',0,0,w,h); R(g,'#6a5028',1,1,w-2,h-2); R(g,'#c8a868',2,2,w-4,h-4); text(g,'MEXICO',3,6,'#4a3418'); text(g,'USA',38,6,'#4a3418'); R(g,'#4a3418',31,2,1,h-4); },0,1816);
const tFlagMX=P2(24,16,(g,w,h)=>{ R(g,'#1e6a3a',0,0,8,h); R(g,'#f2ece0',8,0,8,h); R(g,'#b8302a',16,0,8,h); ell(g,12,8,2.4,2.2,'#8a6a2a'); ell(g,12,9.4,2,1,'#3a6a2a'); },0,1817);
const tFlagUS=P2(24,16,(g,w,h)=>{ for(let y=0;y<h;y++) R(g,(y>>1)%2?'#f2ece0':'#b8302a',0,y,w,1); R(g,'#2a3a6a',0,0,10,8); for(let y=1;y<8;y+=2) for(let x=1;x<10;x+=2) R(g,'#f2ece0',x,y,1,1); },0,1818);
const tStucco=(c,s)=>P2(16,16,(g,w,h)=>{ R(g,c,0,0,w,h); for(let y=3;y<h;y+=5) for(let x=2;x<w;x+=6) R(g,'rgba(20,20,30,.5)',x,y,3,2); },8,s);

/* ---------- props ---------- */
const mGlassCar=MT(tCarGlass,{cut:true,double:true}), mTint=MT(tTint,{cut:true,double:true}), mSeat=col(0x2a2826), mDash=col(0x18181a);
Object.assign(FX,{
  /* a car you can see into: lower body, open cabin of pillars and glass, seats, dash and wheel. Built facing +z, driver on the left (+x).
     o.tint: tinted rear glass; o.door: open the front-right door; o.taxi: roof sign */
  carX(g,c,kind='sedan',o={}){ const body=col(c), tire=col(0x141416), suv=kind==='suv', L=suv?4.7:kind==='pickup'?5.0:4.6, W=1.85, h=suv?.85:.65, top=.35+h, ch=suv?.72:.58;
    const cabL=suv?3.0:kind==='pickup'?1.7:2.3, cz=suv?-.2:kind==='pickup'?.55:-.1, z0=cz-cabL/2, z1=cz+cabL/2;
    mk(box(W,h,L,{at:[0,top-h/2,0]}),body,g); heatTag(mk(box(W-.3,.02,1.2),body,g,0,top+.01,L/2-.7),.62);
    if(kind==='pickup'){ mk(box(W-.1,.3,1.9),col(c-0x0a0a0a),g,0,top+.12,-1.4); mk(box(W-.3,.02,1.8),col(0x1a1a1a),g,0,top-.08,-1.4); }
    for(const [x,z] of [[W/2-.05,z1],[-W/2+.05,z1],[W/2-.05,z0],[-W/2+.05,z0],[W/2-.05,(z0+z1)/2+(suv?.25:0)],[-W/2+.05,(z0+z1)/2+(suv?.25:0)]]) mk(box(.07,ch,.08,{at:[0,ch/2,0]}),body,g,x,top,z);
    mk(box(W-.04,.06,cabL+.08),body,g,0,top+ch,cz);
    const front=N(g,0,top,z1,-.38,0,0); mk(plane(W-.14,ch/Math.cos(.38)),mGlassCar,front,0,ch/2/Math.cos(.38),0);
    const midZ=(z0+z1)/2+(suv?.25:0);
    for(const s of [-1,1]){ const fr=N(g,s*(W/2-.05),top,0,0,Math.PI/2,0); mk(plane(z1-midZ,ch),mGlassCar,fr,-(z1+midZ)/2,ch/2,0); mk(plane(midZ-z0,ch),o.tint&&s>0?mTint:mGlassCar,fr,-(midZ+z0)/2,ch/2,0); }
    mk(plane(W-.14,ch),o.tint?mTint:mGlassCar,g,0,top+ch/2,z0);
    mk(box(W-.2,.16,.4),mDash,g,0,top-.04,z1-.24); mk(torus(.16,.02,4,10),col(0x111112),g,.4,top+.1,z1-.5,-1.1,0,0);
    const seatY=suv?.72:.55, fz=z1-(suv?1.05:.95), rz=suv?cz-.85:z0+.5;
    for(const x of [.4,-.4]){ mk(box(.48,.12,.5),mSeat,g,x,seatY-.06,fz); mk(box(.48,.6,.12),mSeat,g,x,seatY+.28,fz-.28,-.12,0,0); mk(box(.26,.18,.1),mSeat,g,x,seatY+.7,fz-.33); }
    if(kind!=='pickup'){ mk(box(W-.3,.12,.5),mSeat,g,0,seatY-.06,rz); mk(box(W-.3,.6,.12),mSeat,g,0,seatY+.28,rz-.28,-.12,0,0); }
    for(const sx of [-1,1]) for(const sz of [-1,1]) mk(cyl(.34,.34,.24,10),tire,g,sx*(W/2-.08),.34,sz*(L/2-.85),0,0,Math.PI/2);
    for(const sx of [-1,1]){ mk(box(.28,.12,.04),M(null,{color:0xfff2c8,unlit:true}),g,sx*.65,.35+h*.6,L/2+.01); mk(box(.28,.1,.04),M(null,{color:0xc81a1a,unlit:true}),g,sx*.68,.35+h*.6,-L/2-.01); }
    heatTag(mk(cyl(.035,.035,.14,6),col(0x2a2a2a),g,.6,.3,-L/2-.03,Math.PI/2,0,0),.7);
    if(o.door){ const d=N(g,-W/2,.35,z1-.05,0,.95,0); mk(box(.05,h,1.05,{at:[0,h/2,-.52]}),body,d); mk(plane(1.0,ch*.8),mGlassCar,d,0,h+ch*.4,-.52,0,Math.PI/2,0); }
    if(o.taxi){ mk(box(.5,.16,.22),col(0xf2e8c8),g,0,top+ch+.1,cz); mk(box(W+.01,.12,L*.9),col(0x2a8a4a),g,0,top-.25,0); }
    return {seatY,fz,rz}; },
  cooler(g){ mk(box(.55,.36,.36,{at:[0,.18,0]}),col(0xe8e4dc),g); mk(box(.57,.06,.38),col(0x2a6ab0),g,0,.39,0); mk(box(.3,.03,.03),col(0x2a2a2e),g,0,.44,0); },
  jersey(g,len){ const n=Math.ceil(len/3); for(let i=0;i<n;i++) mk(box(len/n-.04,.8,.6,{tw:.4,td:.4,at:[0,.4,0]}),MT(tJersey),g,-len/2+(i+.5)*len/n,0,0); },
  steelRail(g,len){ const m=col(0x8a9094); for(let x=-len/2;x<=len/2+.01;x+=2) mk(box(.06,1.12,.06,{at:[0,.56,0]}),m,g,x,0,0); for(const y of [.55,1.1]) mk(box(len,.06,.06),m,g,0,y,0); },
  parapet(g,len,fence=true){ mk(box(len,.95,.3,{at:[0,.475,0]}),MT(tParapet,{repeat:[len/2,1]}),g); if(fence){ const f=N(g,0,.95,0); FX.chainlink(f,len); } },
  canopyPost(g,h){ mk(box(.12,h,.12,{at:[0,h/2,0]}),col(0x5a6a6a),g); mk(box(.14,.1,3.0),col(0x5a6a6a),g,0,h,-1.45); },
  booth(g){ mk(box(5.2,.22,1.2,{at:[0,.11,0]}),col(0xc8c4bc),g); for(const x of [-2.5,2.5]) mk(cyl(.1,.1,1,8,{at:[0,.5,0]}),col(0xe8c838),g,x,.2,0);
    mk(box(1.7,1.0,1.0,{at:[0,.5,0]}),col(0xd8d4cc),g,.4,.22,0); const w=N(g,.4,1.22,0); mk(box(1.7,1.2,1.0,{at:[0,.6,0]}),MT(tGlassCut,{cut:true,double:true}),w);
    mk(box(1.9,.14,1.2),col(0x3a4450),g,.4,2.5,0); for(const sx of [-1,1]) for(const sz of [-1,1]) mk(box(.06,1.2,.06,{at:[0,.6,0]}),col(0x3a4450),g,.4+sx*.82,1.22,sz*.47); mk(box(.5,.04,.4),col(0x1a1a1c),g,.4,1.2,.3); },
  flagpole(g,t,h=9){ mk(cyl(.05,.07,h,6,{at:[0,h/2,0]}),col(0xd8d4cc),g); mk(plane(1.8,1.2),MT(t,{double:true}),g,.92,h-.7,0); },
  streetpole(g,h=8){ mk(cyl(.08,.11,h,6,{at:[0,h/2,0]}),col(0x6a6e70),g); mk(box(1.4,.08,.08),col(0x6a6e70),g,.7,h,0); mk(box(.4,.1,.22),col(0xd8d4cc),g,1.3,h-.06,0); },
  skyline(g,n,seed,cols,o={}){ const r=rng(seed); for(let i=0;i<n;i++){ const w=4+r()*8,d=4+r()*8,hh=(o.h0||3)+r()*(o.hv||6), x=(r()-.5)*(o.sx||40), z=(r()-.5)*(o.sz||60);
    mk(box(w,hh,d,{at:[0,hh/2,0]}),MT(tStucco(cols[i%cols.length],seed+i),{repeat:[w/3,hh/3]}),g,x,0,z,0,(r()-.5)*.3,0); if(r()>.6) mk(cyl(.5,.5,1,8,{at:[0,.5,0]}),col(0x1a1a1c),g,x,hh,z); } }
});

/* ================= the bridge ================= */
function buildBridge(){ const H=House('bridge',{name:'The bridge',where:'Puente Seco, northbound to the US · late afternoon',
  note:'Four lanes of idling cars going nowhere, vendors walking the lanes, and a covered walkway where people queue on foot behind a chest-high railing. Two black SUVs are stuck in the jam right beside it. Don Aurelio is cuffed in the back of the first one, on his way to an extradition he isn\'t meant to survive.',
  plays:'You start on your own feet, in the pedestrian line, a few metres from the convoy. Stay in line, hop the railing and walk the lanes like a vendor, or climb the footbridge stairs and look down onto the SUVs. You pick the moment. Then it\'s ten seconds among the civilians.',
  cam:{t:[-3,.4,2],th:.95,ph:.9,r:30},day:true,peopleLabel:'On the bridge'});
  /* deck, lanes, walkway, river below */
  mk(box(54,.8,28.4,{at:[0,-.4,0]}),col(0x8a8274),H.g,-4,0,-2.4); mk(box(10.6,.8,2.2,{at:[0,-.4,0]}),col(0x8a8274),H.g,2.2,0,11.6);
  floor(H,-31,-15.4,23,7.6,tBridgeAsphalt,{tile:2.4}); floor(H,-31,7.6,23,10.8,tWalk,{y:.15,tile:1.2}); floor(H,-3,10.8,7.4,12.6,tWalk,{y:.15,tile:1.2});
  mk(box(54,.15,.2,{at:[0,.075,0]}),MT(tCurb,{repeat:[27,1]}),H.g,-4,0,7.6);
  for(const z of [3.6,0,-3.6]) for(let x=-30;x<11;x+=6) mk(plane(3,.14),col(0xe8e4dc),H.g,x+1.5,.012,z,-Math.PI/2);
  for(const z of [7.35,-7.4]) mk(plane(41,.16),col(0xe8c838),H.g,-9.5,.012,z,-Math.PI/2);
  mk(plane(.4,15),col(0xe8e4dc),H.g,11.6,.012,0,-Math.PI/2);
  for(let x=-30;x<20;x+=6) mk(plane(3,.14),col(0xe8e4dc),H.g,x+1.5,.012,-11.4,-Math.PI/2);
  const below=N(H.g,0,0,0); mk(plane(160,120,6,6),MT(tDust,{repeat:[36,28],color:0xc8b090}),below,-4,-10,-2,-Math.PI/2); mk(plane(9,120),MT(tWater,{color:0x6a7a70}),below,-3,-9.96,-2,-Math.PI/2);
  for(const x of [-18,8]) mk(box(2.2,9.6,16,{at:[0,-4.8,0]}),col(0x9a9284),below,x,-.4,-2.4);
  /* the median, the railing between the lanes and the walkway, the outer parapets with their fences */
  place(H,'jersey',-9,-7.8,0,42); place(H,'steelRail',-4,7.7,0,53.2);
  place(H,'parapet',-4,-15.5,0,54); place(H,'parapet',-17.4,10.95,0,27.2); place(H,'parapet',15.1,10.95,0,15.8); place(H,'parapet',2.2,12.75,0,10.4);
  place(H,'parapet',-3.05,11.85,Math.PI/2,1.8,false); place(H,'parapet',7.45,11.85,Math.PI/2,1.8,false);
  /* the walkway canopy (it lifts off with the roof) */
  for(let x=-29;x<22;x+=3.2) place(H,'canopyPost',x,10.75,0,2.95); const cr=N(H.roof,0,0,0); mk(box(53,.06,3.3),MT(tTin,{repeat:[26,2]}),cr,-4,3.0,9.15,.05,0,0);
  { const s=N(H.g,-27.5,2.3,9.1,0,-Math.PI/2,0); mk(plane(1.5,.5),MT(tSgPeat),s); }
  { const m=N(H.g,-1,.6,10.79,0,Math.PI,0); mk(plane(1.05,.3),MT(tMarker),m); }
  /* the footbridge: stairs up from the landing, a caged deck over every lane */
  { const st=N(H.g,-2.2,.15,11.7); const m=col(0xa8a49c); for(let i=0;i<25;i++){ const hh=(i+1)*.2; mk(box(.27,hh,1.5,{at:[0,hh/2,0]}),m,st,i*.27,0,0); }
    for(const s of [-1,1]) mk(box(7.0,.06,.06),col(0x8a9094),st,3.4,2.6+.05,s*.74,0,0,Math.atan2(5,6.75));
    mk(box(2.3,.3,21.4),m,H.g,5.6,5.15,1.8); for(const s of [-1,1]){ const f=N(H.g,5.6+s*1.15,5.3,1.8,0,Math.PI/2,0); FX.chainlink(f,21.4); mk(box(.05,.05,21.4),col(0x9aa0a0),H.g,5.6+s*1.15,7.1,1.8); }
    for(const z of [-8.2,7.75,12.3]) mk(box(.5,5.1,.5,{at:[0,2.55,0]}),m,H.g,5.6,0,z); }
  /* overhead signs; the welcome arch for the southbound lanes */
  { for(const z of [-7.6,7.55]) mk(cyl(.14,.16,6.4,8,{at:[0,3.2,0]}),col(0x6a6e70),H.g,-15,0,z); mk(box(.3,.4,15.4),col(0x6a6e70),H.g,-15,6.2,0);
    const a=N(H.g,-15.2,6.2,3.6,0,-Math.PI/2,0); mk(plane(4.2,1.6),MT(tSgGarita),a); const b=N(H.g,-15.2,6.2,-3.6,0,-Math.PI/2,0); mk(plane(4.2,1.6),MT(tSgLanes),b);
    for(const z of [-8.3,-15.0]) mk(cyl(.14,.16,6.4,8,{at:[0,3.2,0]}),col(0x6a6e70),H.g,-24,0,z); mk(box(.3,.4,7.0),col(0x6a6e70),H.g,-24,6.2,-11.6); const w=N(H.g,-23.8,6.2,-11.6,0,Math.PI/2,0); mk(plane(5.2,1.6),MT(tSgWelcome),w); }
  /* customs: islands and booths under a canopy, lane numbers and lamps */
  { for(const z of [3.6,0,-3.6]) place(H,'booth',15,z,0); place(H,'booth',15,7.15,0);
    for(const z of [-7.6,7.55]) for(const x of [12.4,18.6]) mk(box(.5,5.6,.5,{at:[0,2.8,0]}),col(0xd8d4cc),H.g,x,0,z);
    mk(box(6.8,.6,15.8),col(0xd8d4cc),H.roof,15.5,5.9,0); mk(box(.08,.9,15.8),col(0x2a3440),H.g,12.1,5.75,0); const s=N(H.g,12.05,5.75,0,0,-Math.PI/2,0); mk(plane(7.2,1.2),MT(tSgInspect),s);
    [5.4,1.8,-1.8,-5.4].forEach((z,i)=>{ const n=N(H.g,12.04,5.0,z,0,-Math.PI/2,0); mk(plane(.55,.55),MT(tSgLaneN[i]),n); mk(box(.06,.22,.22),M(null,{color:i===3?0xc81a1a:0x3ac84a,unlit:true}),H.g,12.02,4.5,z); });
    place(H,'flagpole',19.5,-14.4,0,tFlagUS,10); place(H,'flagpole',-28,-14.4,0,tFlagMX,10); }
  for(const x of [-26,-12,2]) place(H,'streetpole',x,-7.8,Math.PI/2,8);
  /* the city behind, the warehouses ahead, and the tower where it started, far off in the haze */
  { const s=N(H.g,-62,-1,-6); FX.skyline(s,26,1831,['#c88a84','#4a9a94','#c89a48','#5a7ab0','#e2d8b8','#d8c890'],{sx:40,sz:90,h0:3,hv:7});
    const nn=N(H.g,58,-1,-4); FX.skyline(nn,14,1841,['#c8bca8','#b8b4ac','#a8a49c'],{sx:40,sz:80,h0:5,hv:6});
    mk(box(14,58,14,{at:[0,29,0]}),col(0x8a867e),H.g,-112,-1,-36); for(let i=0;i<10;i++) mk(box(14.4,.5,14.4),col(0x5a5852),H.g,-112,-1+i*5.8+5,-36); place(H,'rebar',-112,-36,0,8,9).p[1]=57; }
  /* the jam: four lanes northbound (+x), the two nearest the walkway built open so you can see who's inside */
  const SEATS=[];
  function car(x,z,c,kind,o={}){ const n=N(H.g,x,0,z,0,Math.PI/2,0); const s=(o.open===false?FX.car(n,c,kind):FX.carX(n,c,kind,o)); if(s) SEATS.push({x,z,s}); return s; }
  const seat=(x,z,s,lx,front,yAdj=0)=>({x:x+(front?s.fz:s.rz),z:z-lx,y:s.seatY-.46+yAdj});
  const tx=car(1.6,5.4,0xe8e4dc,'sedan',{taxi:true}); car(7.8,5.4,0x8a2a22,'pickup'); const s1=car(-4.4,5.4,0x0e0e10,'suv',{tint:true,door:true}); const s2=car(-10.6,5.4,0x0e0e10,'suv',{tint:true}); car(-17,5.4,0xb8b8b4,'sedan'); car(-23.2,5.4,0x4a6a3a,'pickup');
  car(8.6,1.8,0xd8c8a0,'sedan'); const kc=car(2.6,1.8,0x2a4a6a,'sedan'); car(-3.4,1.8,0xe8e4dc,'suv'); car(-9.6,1.8,0x8a6a2a,'pickup'); car(-15.8,1.8,0x3a3a3c,'sedan'); car(-22,1.8,0xc8402e,'suv');
  for(const [x,c,k] of [[9.2,0x3a3a3c,'suv'],[3.2,0xc8c0b0,'pickup'],[-2.8,0x8a2a22,'sedan'],[-9.2,0x2a3a5a,'sedan'],[-15.4,0xd8c8a0,'pickup'],[-21.6,0xb8b8b4,'sedan']]) car(x,-1.8,c,k,{open:false});
  for(const [x,c,k] of [[8.4,0xe8e4dc,'sedan'],[2.2,0x4a5a6a,'suv'],[-4,0x6a2a2a,'sedan'],[-10.2,0xc8a050,'sedan'],[-16.6,0x2a2a2e,'suv']]) car(x,-5.4,c,k,{open:false});
  { const n=N(H.g,-6,0,-11.6,0,-Math.PI/2,0); FX.car(n,0xe8e4dc,'pickup'); const m=N(H.g,9,0,-13.4,0,-Math.PI/2,0); FX.car(m,0x5a6a7a,'sedan'); }
  place(H,'cooler',-8.4,9.7,.3);
  /* the convoy */
  let p=seat(-4.4,5.4,s1,.4,true); whoB(H,'chofer',p.x,p.z,Math.PI/2,'drive',{y:p.y});
  p=seat(-4.4,5.4,s1,-.45,false); whoB(H,'preso',p.x,p.z,Math.PI/2,'cuffed',{y:p.y});
  whoB(H,'agente',-3.65,7.05,faceTo(-3.65,7.05,-6,9.4),'fight');
  p=seat(-10.6,5.4,s2,.4,true); whoB(H,'chofer',p.x,p.z,Math.PI/2,'drive',{y:p.y});
  whoB(H,'agente',-7.55,6.6,faceTo(-7.55,6.6,0,1.8),'watch');
  p=seat(-10.6,5.4,s2,-.4,true); whoB(H,'agente',p.x,p.z,Math.PI/2,'sit',{y:p.y});
  /* the line, the lanes, the cars */
  whoB(H,'hielero',-8.6,9.1,Math.PI/2,'watch',{y:.15}); whoB(H,'obrera',-7.2,9.2,Math.PI/2,'phone',{y:.15}); whoB(H,'madre',-5.7,9.35,Math.PI/2+.5,'watch',{y:.15}); whoB(H,'nina',-5.5,8.75,-.7,'idle',{y:.15});
  whoB(H,'vendedor',-.6,3.6,-Math.PI/2+.3,'idle');
  p=seat(1.6,5.4,tx,.4,true); whoB(H,'taxista',p.x,p.z,Math.PI/2,'drive',{y:p.y});
  p=seat(2.6,1.8,kc,-.45,false); whoB(H,'nino',p.x,p.z,Math.PI/2,'stare',{y:p.y+.3});
  room(H,'The line · where Ray waits',-12,7.6,0,10.8,{t:[-6,.9,8.8],th:-2.75,ph:1.18,r:7}); room(H,'The convoy',-13,3.6,-1,7.6,{t:[-6.5,.9,5.6],th:.35,ph:.9,r:9.5});
  room(H,'Footbridge · the view down',4.4,-8.4,6.8,12.4,{t:[-5,.6,5.2],th:1.5,ph:.95,r:12}); room(H,'Customs',12,-7.6,19,7.6,{t:[14,3.0,0],th:-1.5,ph:1.42,r:9});
  return H; }
PLACE_BUILDERS.bridge=buildBridge;
