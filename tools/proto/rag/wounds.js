// each man in turn: Ray teleports 2.2 m in front of him, shoots the named part(s), then watches 30 s. Logs lifts and fast parts with the pose.
const { launch, open, CORE } = require('../lib.js');
const file=process.argv[2]; const CASES=[['thighR'],['belly'],['thighL','thighR'],['belly','armR'],['chest'],['head'],['shinL'],['pelvis']];
(async()=>{ const b=await launch(); const o=await open(b,file,'proto=1'); const page=o.page; await page.evaluate(s=>window.__eval(s),CORE);
 const out=[];
 for(let ci=0;ci<CASES.length;ci++){ const r=await page.evaluate(([parts,ci])=>window.__eval(`(()=>{ const dt=1/30,parts=${'${0}'},R={ev:[],frames:0,fast:0,vfast:0,lift:0,poses:{}};
   const step=()=>{ update(dt,performance.now()); updateWorld(world,null); };
   const men=enemies.filter(E=>!E.civ&&!E.dead&&E.st!=='down'); const E=men[0]; if(!E) return null;
   const mid=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k],P=n=>X_(E.B,PI_[n]);
   const pt=part=>part==='head'?P('head'):part==='chest'?mid(P('chest'),P('neck'),.45):part==='belly'?mid(P('pelvis'),P('chest'),.45):part==='pelvis'?P('pelvis'):part==='thighR'?mid(P('hipR'),P('knR'),.5):part==='thighL'?mid(P('hipL'),P('knL'),.5):part==='shinL'?mid(P('knL'),P('anL'),.5):part==='armR'?mid(P('shR'),P('elR'),.5):P('chest');
   for(const O of enemies) if(O!==E){ O.aware=false; }
   equip(HANDS.R,newItem('pistol')); 
   const fx=Math.sin(E.hd),fz=Math.cos(E.hd); let best=null; for(const d of [2.2,1.6,1.2]) for(const a of [0,.6,-.6,1.2,-1.2,3.14]){ const x=E.pos[0]+Math.sin(E.hd+a)*d,z=E.pos[1]+Math.cos(E.hd+a)*d; if(navCell(x,z)>=0&&!FLOOR.nav[navCell(x,z)]&&sightClear([x,1.5,z],P('chest'))){ best=[x,z]; break; } if(best) break; }
   if(!best) best=[E.pos[0]+fx,E.pos[1]+fz]; PL.x=best[0]; PL.z=best[1];
   for(const part of parts){ const it=HANDS.R.item; it.cd=0; it.ammo=3; const e=[PL.x,1.5,PL.z],p=pt(part); fireHand(HANDS.R,{o:e,d:norm3(v3.sub(p,e))}); for(let i=0;i<6;i++) step(); }
   PL.x+=(PL.x-E.pos[0])*1.2; PL.z+=(PL.z-E.pos[1])*1.2; /* step back so 'near' poses and far poses both show: come close again at 15 s */
   let low=9,flag=0,px=Float32Array.from(E.B.x),t=0,ft=0; const st0=E.st;
   for(let f=0;f<900;f++){ if(f===450){ PL.x=E.B.x[0]+.9; PL.z=E.B.x[2]+.2; } step(); t+=dt; const x=E.B.x; let cy=0,sp=0,mi=0; for(let i=0;i<NP;i++){ cy+=x[i*3+1]; const d=Math.hypot(x[i*3]-px[i*3],x[i*3+1]-px[i*3+1],x[i*3+2]-px[i*3+2])/dt; if(d>sp){ sp=d; mi=i; } } cy/=NP; px.set(x);
     const dn=E.dead||E.st==='down'; if(!dn||t<2.5) { low=9; continue; } const pose=E.dead?'dead':(E.poseN||E.downMode||'?'); R.poses[pose]=(R.poses[pose]||0)+1;
     R.frames++; if(sp>2) R.fast++; if(sp>4) R.vfast++; if(cy<low) low=cy; if(cy-low>.1&&!flag){ flag=1; R.lift++; R.ev.push('lift '+pose+' t'+t.toFixed(1)+' dy'+(cy-low).toFixed(2)+' sp'+sp.toFixed(1)+' '+PD[mi][0]); } if(cy-low<.04) flag=0;
     if(sp>4&&t>ft){ ft=t+1.5; R.ev.push('fast '+pose+' t'+t.toFixed(1)+' sp'+sp.toFixed(1)+' '+PD[mi][0]+' hit'+E.hitT.toFixed(1)); } }
   R.name=E.name; R.end=E.dead?'dead':E.st; E.dead||(E.dead=true,E.st='dead'); return R; })()`.replace('${0}',JSON.stringify(parts))),[CASES[ci],ci]);
   out.push(r); if(r) console.log(CASES[ci].join('+'),'|',r.name,r.end,'frames',r.frames,'>2m/s',r.fast,'>4m/s',r.vfast,'lifts',r.lift,JSON.stringify(r.poses),'\n   ',r.ev.slice(0,7).join(' ; ')); else console.log(CASES[ci].join('+'),'no man'); }
 console.log('errs',o.errs.slice(0,3).join(' | ').slice(0,300)); await b.close(); })();
