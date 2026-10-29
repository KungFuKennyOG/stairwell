
/* =====================================================================================================
   PAINTED SURFACES for the houses. Every wall texture is one 1.2 m x 2.6 m panel, top of the canvas at the
   ceiling, skirting at the bottom, so it tiles along a wall at the right scale. Floors are 1 m tiles.
   ===================================================================================================== */
const WALL_W=32, WALL_H=64;
function wallTex(base,seed,fn,o={}){ return P2(WALL_W,WALL_H,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,mix(base,'#000000',.18)],[.25,base],[.85,mix(base,'#000000',.05)],[1,mix(base,'#000000',.12)]]);
  if(fn) fn(g,w,h,rng(seed)); if(o.skirt!==false){ R(g,o.skirt||mix(base,'#ffffff',.25),0,h-3,w,3); R(g,'rgba(0,0,0,.35)',0,h-4,w,1); }
  if(o.crown) R(g,o.crown,0,0,w,2); },o.grain??7,seed); }
const stainV=(g,r,col,n,h)=>{ for(let i=0;i<n;i++){ const x=r()*28|0,y=r()*h*.6|0; vfill(g,x,y,3+(r()*4|0),10+(r()*16|0),[[0,'rgba(0,0,0,0)'],[.3,col],[1,'rgba(0,0,0,0)']]); } };
/* interiors */
const tWPnicotine=wallTex('#b4a074',901,(g,w,h,r)=>{ for(let x=0;x<w;x+=8){ R(g,'rgba(120,96,50,.25)',x,0,3,h); R(g,'rgba(255,240,200,.08)',x+4,0,1,h); } stainV(g,r,'rgba(90,70,30,.35)',2,h); });
const tWPyellow=wallTex('#cdb874',902,(g,w,h,r)=>{ R(g,'#d8d0bc',0,h*.55,w,h*.45-3); for(let y=h*.55;y<h-3;y+=4) R(g,'rgba(0,0,0,.12)',0,y|0,w,1); for(let x=0;x<w;x+=4) R(g,'rgba(0,0,0,.12)',x,h*.55|0,1,h*.45-3); stainV(g,r,'rgba(80,70,30,.25)',1,h); });
const tWPkidStars=wallTex('#7a9ac0',903,(g,w,h,r)=>{ for(let i=0;i<10;i++){ const x=r()*w,y=r()*(h-10); ell(g,x,y,1.4,1.4,'#f2e08a'); R(g,'#f2e08a',x-2.5,y-.5,5,1); } R(g,'rgba(255,255,255,.08)',0,10,w,2); });
const tWPtile=wallTex('#d8dcd0',904,(g,w,h)=>{ for(let y=h*.45;y<h-3;y+=4) R(g,'#b8c0b4',0,y|0,w,1); for(let x=0;x<w;x+=4) R(g,'#b8c0b4',x,h*.45|0,1,h*.55); R(g,'#5a8a7a',0,h*.45|0,w,2); },{skirt:'#5a8a7a'});
const tWPsage=wallTex('#8a9a7a',905,null,{crown:'#d8d8cc',skirt:'#e8e4dc'});
const tWPcream=wallTex('#ddd0b0',906,(g,w,h)=>{ R(g,'#e8e2d4',0,h*.62,w,2); },{crown:'#efe8da',skirt:'#efe8da'});
const tWPlav=wallTex('#a898c0',907,(g,w,h,r)=>{ /* posters */ const cols=[['#1a1a2a','#e86aa8'],['#e8e2d4','#3a4a8a'],['#2a2a2a','#f2c840']]; const c=cols[r()*3|0]; R(g,c[0],8,14,14,18); R(g,c[1],10,17,10,8); R(g,'#ece6da',10,27,10,2); },{skirt:'#ece6da'});
const tWPblue=wallTex('#4a6a9a',908,(g,w,h,r)=>{ for(let i=0;i<5;i++){ const x=r()*w,y=r()*(h-14); ell(g,x,y,1,1,'#f2e8c8'); } poly(g,[[16,18],[20,26],[12,26]],'#e8e2d4'); R(g,'#c8402e',14,26,4,6); poly(g,[[13,32],[16,36],[19,32]],'#f2a03a'); },{skirt:'#e8e4dc'});
const tWPbeige=wallTex('#c8b4a0',909,null,{crown:'#e8e0d4',skirt:'#e8e0d4'});
const tWPwhite=wallTex('#e4e0d8',910,(g,w,h)=>{ R(g,'rgba(0,0,0,.05)',0,h-14,w,11); },{skirt:'#cfc9bf',grain:3});
const tWPcedar=wallTex('#8a5a3a',911,(g,w,h,r)=>{ for(let x=0;x<w;x+=3){ R(g,r()>.5?'#7a4c30':'#9a6a44',x,0,2,h); R(g,'#4a2e1c',x+2,0,1,h); } },{skirt:false});
const tWPdamask=wallTex('#d8ccb0',912,(g,w,h)=>{ for(let y=4;y<h*.55;y+=12) for(let x=(y/12|0)%2?8:0;x<w;x+=16){ ell(g,x,y,3,5,'#c8b890'); ell(g,x,y,1.4,2.4,'#d8ccb0'); } vfill(g,0,h*.58,w,h*.42,[[0,'#5a3a24'],[1,'#3a2414']]); R(g,'#7a5434',0,h*.58|0,w,2); for(let x=2;x<w;x+=10) R(g,'rgba(0,0,0,.25)',x,(h*.62)|0,7,h*.3); },{skirt:'#2a1a10',crown:'#ece4d0'});
const tWPgreen=wallTex('#2e4a3a',913,(g,w,h)=>{ vfill(g,0,h*.6,w,h*.4,[[0,'#4a3220'],[1,'#2e1e12']]); R(g,'#c8a050',0,h*.6|0,w,1); },{skirt:'#1e140c',crown:'#c8a050'});
const tWPpink=wallTex('#e4c0c4',914,(g,w,h,r)=>{ for(let y=6;y<h-6;y+=10) for(let x=(y/10|0)%2?6:0;x<w;x+=12) ell(g,x,y,1.4,1.4,'#f2e4e6'); },{skirt:'#f2ece6'});
const tWPlog=wallTex('#a8784a',915,(g,w,h,r)=>{ for(let y=0;y<h;y+=6){ vfill(g,0,y,w,6,[[0,'#c08a54'],[.5,'#a8784a'],[1,'#6a4428']]); for(let i=0;i<2;i++){ const x=r()*w; ell(g,x,y+3,1.6,1.2,'#6a4428'); } } },{skirt:false});
const tWPkitchenY=wallTex('#d8c07a',916,(g,w,h)=>{ R(g,'#e8e2d0',0,h*.5,w,h*.5-3); for(let x=0;x<w;x+=5) R(g,'rgba(120,60,40,.18)',x,h*.5|0,2,h*.5-3); },{skirt:'#6a4a2a'});
const tWPpanel=wallTex('#5a5a5e',917,(g,w,h)=>{ for(let x=0;x<w;x+=8) R(g,'#4a4a4e',x,0,1,h); R(g,'#3a3a3e',0,h-12,w,9); },{skirt:'#2a2a2e',grain:5});
const tWPgarage=wallTex('#9a9a92',918,(g,w,h,r)=>{ for(let y=0;y<h;y+=5) R(g,'rgba(0,0,0,.15)',0,y,w,1); for(let x=0;x<w;x+=10) R(g,'rgba(0,0,0,.12)',x+((r()*3)|0),0,1,h); stainV(g,r,'rgba(60,50,40,.3)',2,h); },{skirt:'#5a5a52'});
const tWPbarn=wallTex('#7a2a20',919,(g,w,h,r)=>{ for(let x=0;x<w;x+=5){ R(g,r()>.5?'#8a3226':'#6a2218',x,0,4,h); R(g,'#3a120c',x+4,0,1,h); } stainV(g,r,'rgba(40,20,10,.4)',3,h); },{skirt:false});
/* exteriors */
const tExSiding=wallTex('#9aa88a',921,(g,w,h,r)=>{ for(let y=0;y<h;y+=4){ R(g,'rgba(255,255,255,.12)',0,y,w,1); R(g,'rgba(0,0,0,.18)',0,y+3,w,1); } vfill(g,0,h*.75,w,h*.25,[[0,'rgba(60,50,30,0)'],[1,'rgba(60,50,30,.55)']]); stainV(g,r,'rgba(40,50,30,.3)',2,h); },{skirt:false});
const tExBrick=wallTex('#d0c4a8',922,(g,w,h)=>{ for(let y=0;y<h*.6;y+=4){ R(g,'rgba(255,255,255,.12)',0,y,w,1); R(g,'rgba(0,0,0,.14)',0,y+3,w,1); } const by=h*.6|0; R(g,'#8a4a3a',0,by,w,h-by); for(let y=by;y<h;y+=3){ R(g,'#a89a88',0,y,w,1); for(let x=(y/3|0)%2?0:3;x<w;x+=6) R(g,'#a89a88',x,y,1,3); } R(g,'#e8e2d4',0,by-1,w,2); },{skirt:false});
const tExConcrete=wallTex('#9a968e',923,(g,w,h,r)=>{ for(let y=0;y<h;y+=8) R(g,'rgba(0,0,0,.1)',0,y,w,1); for(let x=0;x<w;x+=2) R(g,`rgba(0,0,0,${r()*.06})`,x,0,2,h); for(let i=0;i<4;i++) ell(g,r()*w,r()*h,1,1,'#7a766e'); },{skirt:false});
const tExStone=wallTex('#d4c8ac',924,(g,w,h,r)=>{ for(let y=0;y<h;y+=8){ const o=(y/8|0)%2?8:0; R(g,'#b8ac90',0,y,w,1); for(let x=o;x<w;x+=16) R(g,'#b8ac90',x,y,1,8); for(let x=o;x<w;x+=16) R(g,`rgba(255,255,255,${.05+r()*.08})`,x+1,y+1,14,6); } },{skirt:false});
const tExClap=wallTex('#e2ddd0',925,(g,w,h,r)=>{ for(let y=0;y<h;y+=5){ R(g,'rgba(0,0,0,.16)',0,y+4,w,1); R(g,'rgba(255,255,255,.2)',0,y,w,1); } stainV(g,r,'rgba(90,80,60,.25)',2,h); vfill(g,0,h*.8,w,h*.2,[[0,'rgba(80,60,30,0)'],[1,'rgba(80,60,30,.4)']]); },{skirt:false});
/* floors (1 m tiles) */
const flTex=(base,seed,fn,gr=8)=>P2(32,32,(g,w,h)=>{ R(g,base,0,0,w,h); if(fn) fn(g,w,h,rng(seed)); },gr,seed);
const tFlCarpet=flTex('#6a5440',931,(g,w,h,r)=>{ for(let i=0;i<120;i++) R(g,r()>.5?'#76604a':'#5e4a36',r()*w|0,r()*h|0,1,1); ell(g,20,12,6,4,'rgba(40,30,20,.35)'); });
const tFlKid=flTex('#3a5a8a',932,(g,w,h,r)=>{ for(let i=0;i<120;i++) R(g,r()>.5?'#466a9a':'#30507e',r()*w|0,r()*h|0,1,1); });
const tFlOak=flTex('#9a6a40',933,(g,w,h,r)=>{ for(let y=0;y<h;y+=4){ R(g,'#7a5030',0,y,w,1); R(g,'#7a5030',(y*7)%w,y,1,4); R(g,`rgba(255,220,170,${r()*.1})`,0,y+1,w,2); } });
const tFlTile=flTex('#dcdcd4',934,(g,w,h)=>{ for(let k=0;k<w;k+=8){ R(g,'#b4b8b0',k,0,1,h); R(g,'#b4b8b0',0,k,w,1); } });
const tFlConc=flTex('#8a8680',935,(g,w,h,r)=>{ vfill(g,0,0,w,h,[[0,'#94908a'],[1,'#86827c']]); for(let i=0;i<6;i++) ell(g,r()*w,r()*h,2,1.4,'rgba(255,255,255,.06)'); },4);
const tFlMarble=flTex('#e8e2d8',936,(g,w,h)=>{ R(g,'#2a2a2c',0,0,16,16); R(g,'#2a2a2c',16,16,16,16); for(let i=0;i<w;i+=3) R(g,'rgba(160,150,140,.25)',i,(i*1.7)%h|0,3,1); },4);
const tFlPine=flTex('#b88a54',937,(g,w,h,r)=>{ for(let x=0;x<w;x+=6){ R(g,'#8a5e34',x,0,1,h); R(g,'#8a5e34',x,(x*5)%h,6,1); ell(g,x+3,r()*h,1,1.4,'#7a5030'); } });
const tFlDeck=flTex('#7a5a3e',938,(g,w,h)=>{ for(let x=0;x<w;x+=4) R(g,'#4a3422',x,0,1,h); for(let x=0;x<w;x+=4) R(g,'#5a4030',x+1,(x*3)%h,3,1); });
const tFlLino=flTex('#cfc7a8',939,(g,w,h)=>{ for(let y=0;y<h;y+=8) for(let x=((y/8)%2)*8;x<w;x+=16) R(g,'#8a5a3a',x,y,8,8); ell(g,10,18,5,3,'rgba(80,60,30,.3)'); });
const tFlBarn=flTex('#6a5a44',940,(g,w,h,r)=>{ for(let i=0;i<200;i++) R(g,['#8a7a54','#c8b070','#4a3e2e'][r()*3|0],r()*w|0,r()*h|0,2,1); },10);
/* ground */
const tGrass=flTex('#3e5a2e',941,(g,w,h,r)=>{ for(let i=0;i<220;i++) R(g,r()>.5?'#4a6a36':'#344c26',r()*w|0,r()*h|0,1,2); },6);
const tLawn=flTex('#466a34',942,(g,w,h,r)=>{ R(g,'#3e5e2e',0,0,w,16); for(let i=0;i<160;i++) R(g,r()>.5?'#527a3e':'#3a5a2c',r()*w|0,r()*h|0,1,2); },4);
const tDirt=flTex('#5a4a36',943,(g,w,h,r)=>{ for(let i=0;i<160;i++) R(g,['#6a5a42','#4a3c2c','#3e5a2e'][r()*3|0],r()*w|0,r()*h|0,2,1); ell(g,8,24,7,4,'rgba(62,90,46,.6)'); });
const tGravel=flTex('#8a847a',944,(g,w,h,r)=>{ for(let i=0;i<300;i++) R(g,['#a8a296','#6a665e','#c8c2b4'][r()*3|0],r()*w|0,r()*h|0,1,1); });
const tAsphalt=flTex('#2e2e30',945,(g,w,h,r)=>{ for(let i=0;i<120;i++) R(g,r()>.5?'#3a3a3c':'#262628',r()*w|0,r()*h|0,1,1); },6);
const tPaving=flTex('#a49a88',946,(g,w,h)=>{ for(let k=0;k<w;k+=16){ R(g,'#7a7264',k,0,1,h); R(g,'#7a7264',0,k,w,1); } },6);
const tYard=flTex('#6a5640',947,(g,w,h,r)=>{ for(let i=0;i<200;i++) R(g,['#7a6448','#54442e','#8a7a5a'][r()*3|0],r()*w|0,r()*h|0,2,1); for(let x=0;x<w;x+=11) R(g,'rgba(40,30,20,.3)',x,0,2,h); });
const tWater=P2(32,32,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3ac0d8'],[1,'#1a88b8']]); for(let y=2;y<h;y+=6) for(let x=(y%4)*2;x<w;x+=9) R(g,'rgba(255,255,255,.35)',x,y,4,1); },3,948);
/* bits */
const cutTex=(w,h,fn,seed=1)=>tex(w,h,null,g=>fn(g,w,h,rng(seed)));
const tGlassCut=cutTex(16,32,(g,w,h)=>{ for(let y=6;y<h-10;y++){ const x=3+(y*.3|0); if(y%9<6) R(g,'rgba(180,205,225,.8)',x%w,y,1,1); } });
const tChain=cutTex(16,16,(g,w,h)=>{ for(let i=0;i<w;i+=4) for(let y=0;y<h;y++){ R(g,'#9aa0a0',(i+y)%w,y,1,1); R(g,'#8a9090',(i-y+32)%w,y,1,1); } });
const tLeaves=P2(32,32,(g,w,h)=>{ R(g,'#2e4a24',0,0,w,h); const r=rng(951); for(let i=0;i<70;i++) ell(g,r()*w,r()*h,2+r()*2,1.4+r()*1.4,r()>.5?'#3e6030':'#243a1c'); for(let i=0;i<20;i++) ell(g,r()*w,r()*h*.5,1.4,1,'#5a7a3e'); },6,951);
const tBark=P2(16,32,(g,w,h)=>{ R(g,'#4a3a2a',0,0,w,h); for(let x=0;x<w;x+=3) R(g,'#3a2a1c',x,0,1,h); },8,952);
const tCityLights=P2(256,64,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#0c1020'],[.55,'#1a1a2a'],[1,'#2a2030']]); const r=rng(953); for(let i=0;i<900;i++){ const y=h*.45+r()*h*.55,x=r()*w; R(g,['#f2c46a','#e8a040','#c8d8f0','#f2e0b0'][r()*4|0],x|0,y|0,1,1); } for(let x=0;x<w;x+=2) R(g,'rgba(242,170,90,.08)',x,(h*.42)|0,2,4); },0,953);
const tSkyNight=P2(64,64,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#06070c'],[.7,'#0e1220'],[1,'#1a1a28']]); const r=rng(954); for(let i=0;i<60;i++) R(g,`rgba(240,236,220,${.3+r()*.6})`,r()*w|0,r()*h*.6|0,1,1); },0,954);
const tScreenTV=P2(16,12,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#9ab8f0'],[1,'#4a6ab0']]); R(g,'#e8e2d4',3,3,7,4); R(g,'#c8402e',10,6,3,3); },0,955);
const tScreenSec=P2(32,16,(g,w,h)=>{ R(g,'#0a0e0a',0,0,w,h); for(let k=0;k<8;k++){ const x=(k%4)*8,y=(k>>2)*8; vfill(g,x+1,y+1,6,6,[[0,'#5a8a6a'],[1,'#2a4a3a']]); R(g,'#c8e8c8',x+2,y+5,2,1); } },0,956);
const tScreenPhone=P2(8,8,(g,w,h)=>{ R(g,'#cfe0ff',0,0,w,h); R(g,'#3a6ae0',1,1,6,2); },0,957);
const tQuiltDino=P2(32,32,(g,w,h)=>{ R(g,'#6aa86a',0,0,w,h); const r=rng(958); for(let i=0;i<8;i++) ell(g,r()*w,r()*h,3,2,'#e8d27a'); for(let x=0;x<w;x+=8) R(g,'#5a985a',x,0,1,h); },6,958);
const tQuiltRocket=P2(32,32,(g,w,h)=>{ for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8) R(g,((x+y)/8)%2?'#2a4a8a':'#c8402e',x,y,8,8); },6,959);
const tQuiltPink=P2(32,32,(g,w,h)=>{ R(g,'#e8b8c8',0,0,w,h); for(let y=0;y<h;y+=6) R(g,'#f2d8e0',0,y,w,2); },5,960);
const tQuiltPurple=P2(32,32,(g,w,h)=>{ R(g,'#6a4a8a',0,0,w,h); for(let i=0;i<w;i+=8) R(g,'#7a5a9a',i,0,4,h); },5,961);
const tQuiltWhite=P2(32,32,(g,w,h)=>{ R(g,'#e8e4dc',0,0,w,h); for(let y=0;y<h;y+=8) R(g,'#d4d0c8',0,y,w,1); },4,962);
const tQuiltNavy=P2(32,32,(g,w,h)=>{ R(g,'#2a3448',0,0,w,h); for(let y=0;y<h;y+=4) R(g,'#323e54',0,y,w,1); },5,963);
const tQuiltCrazy=P2(32,32,(g,w,h)=>{ const c=['#8a2a22','#c8a050','#2a4a6a','#e8e2d4','#4a6a3a']; const r=rng(964); for(let y=0;y<h;y+=8) for(let x=0;x<w;x+=8) R(g,c[r()*5|0],x,y,8,8); for(let k=0;k<w;k+=8){ R(g,'#2a1a10',k,0,1,h); R(g,'#2a1a10',0,k,w,1); } },6,964);
const tQuiltMessy=P2(32,32,(g,w,h)=>{ R(g,'#5a6a5a',0,0,w,h); const r=rng(965); for(let i=0;i<10;i++) ell(g,r()*w,r()*h,5,2,'#4a5a4a'); ell(g,22,10,5,3,'rgba(120,90,40,.35)'); },8,965);
const tRugRed=P2(32,32,(g,w,h)=>{ R(g,'#7a2a22',0,0,w,h); R(g,'#c8a050',2,2,w-4,h-4); R(g,'#7a2a22',4,4,w-8,h-8); ell(g,16,16,7,7,'#2a3a5a'); ell(g,16,16,3,3,'#c8a050'); },6,966);
const tRugGrey=P2(32,32,(g,w,h)=>{ R(g,'#6a6a6e',0,0,w,h); for(let y=0;y<h;y+=4) R(g,'#5e5e62',0,y,w,2); },5,967);
const tRugWhite=P2(32,32,(g,w,h)=>{ R(g,'#e2ded4',0,0,w,h); const r=rng(968); for(let i=0;i<80;i++) R(g,'#d0ccc2',r()*w|0,r()*h|0,1,2); },4,968);
const tBooks=P2(32,32,(g,w,h)=>{ R(g,'#2a1a10',0,0,w,h); const r=rng(969); for(let y=1;y<h;y+=8){ R(g,'#4a3020',0,y+6,w,2); for(let x=1;x<w;){ const bw=1+(r()*3|0); R(g,['#7a2a22','#2a4a3a','#c8a050','#2a3a5a','#5a4a3a','#e8e2d4'][r()*6|0],x,y+(r()*2|0),bw,6-(r()*2|0)); x+=bw+(r()<.1?2:0); } } },4,969);
const tCabinetW=P2(16,16,(g,w,h)=>{ R(g,'#e8e2d4',0,0,w,h); R(g,'#c8c2b4',1,1,6,14); R(g,'#c8c2b4',9,1,6,14); R(g,'#8a8478',6,7,1,2); R(g,'#8a8478',9,7,1,2); },4,970);
const tCabinetOak=P2(16,16,(g,w,h)=>{ R(g,'#8a5a34',0,0,w,h); R(g,'#7a4a28',1,1,6,14); R(g,'#7a4a28',9,1,6,14); R(g,'#d4ad5a',6,7,1,2); R(g,'#d4ad5a',9,7,1,2); },6,971);
const tCabinetDark=P2(16,16,(g,w,h)=>{ R(g,'#2a2a2c',0,0,w,h); R(g,'#3a3a3e',1,1,14,14); R(g,'#8a8a8e',4,7,8,1); },4,972);
const tCounterTop=P2(16,16,(g,w,h)=>{ R(g,'#d8d0bc',0,0,w,h); const r=rng(973); for(let i=0;i<30;i++) R(g,'#b8b0a0',r()*w|0,r()*h|0,1,1); },4,973);
const tStove=P2(16,16,(g,w,h)=>{ R(g,'#e8e4dc',0,0,w,h); for(const [x,y] of [[4,4],[12,4],[4,12],[12,12]]) ell(g,x,y,3,3,'#2a2a2c'); },3,974);
const tPhoto=P2(16,16,(g,w,h)=>{ R(g,'#2a1a10',0,0,w,h); vfill(g,2,2,12,12,[[0,'#8ab0d0'],[1,'#c8a878']]); ell(g,6,9,2,3,'#3a2a20'); ell(g,10,9,2,3,'#5a3a28'); },3,975);
const tFire=P2(16,16,(g,w,h)=>{ R(g,'#1a0a04',0,0,w,h); ell(g,8,12,6,5,'#e8701a'); ell(g,8,11,4,4,'#f2c040'); ell(g,8,10,2,2,'#fff0b0'); },0,976);
const tHay=P2(16,16,(g,w,h)=>{ R(g,'#c8a858',0,0,w,h); const r=rng(977); for(let i=0;i<40;i++) R(g,r()>.5?'#e0c070':'#a88a40',r()*w|0,r()*h|0,3,1); },6,977);
const tCarWin=P2(16,8,(g,w,h)=>{ vfill(g,0,0,w,h,[[0,'#3a4a5a'],[1,'#1a2028']]); R(g,'rgba(200,220,240,.4)',2,1,5,1); },3,978);
const tPlate=P2(16,8,(g,w,h)=>{ R(g,'#e8e4d4',0,0,w,h); R(g,'#2a3a6a',1,1,w-2,1); text(g,'HC 24',1,3,'#2a3a6a'); },0,979);
const tPoster=(c1,c2,s)=>P2(16,24,(g,w,h)=>{ R(g,c1,0,0,w,h); vfill(g,2,2,w-4,14,[[0,c2],[1,c1]]); ell(g,8,9,3,4,'#14141a'); R(g,'#e8e2d4',3,18,10,2); },3,s);
const tFelt=P2(16,16,(g,w,h)=>{ radial(g,8,8,9,[[0,'#2e7a4a'],[1,'#1a4a2a']]); R(g,'#c8402e',5,6,2,2); R(g,'#2a4a8a',9,8,2,2); R(g,'#e8e2d4',7,10,3,2); },0,980);
