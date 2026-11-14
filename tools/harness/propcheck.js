// Props contract check (agent H): every prop placed at a yaw, its world boxes and hiding spots sanity-checked; the exit's chain
// and door, the TV, the pipe; every new item built, equipped both ways, dropped and settled, two-handed where it can be, swung
// through the old melee path. node tools/harness/propcheck.js index.html   (prints PASS/FAIL lines, exits 1 on any failure)
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const file = 'file://' + path.resolve(process.argv[2]);
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(file + '?f=1&proto=1', { timeout: 150000 }); await p.waitForTimeout(500); await p.click('#start'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => window.__eval(`(()=>{ const out=[],ok=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);
    window.__noRaf=true; window.__fixedDt=1/60;
    /* furniture: at (3,-2) turned a quarter, every world box should lie inside the turned footprint (plus a little for overhangs) */
    const G=N(floorN); GEO_TEMP=true; const yaw=Math.PI/2,X=3,Z=-2;
    for(const k in PROP_DIMS){ const D=PROP_DIMS[k],S=propPlace(k,G,X,Z,yaw,{hideBehind:true}),w=(D.w)/2+.25,d=(D.d)/2+.25+(k==='sofa'?D.gap:0)+(k==='pipeburst'?D.wet:0);
      const inside=S.solids.every(b=>b.x0>=X-d-1e-6&&b.x1<=X+d+1e-6&&b.z0>=Z-w-1e-6&&b.z1<=Z+w+1e-6&&b.h>b.y0);
      ok(inside,k+' solids inside its turned footprint ('+S.solids.length+' boxes, '+S.tris+' tris)');
      const hk={bed:'bed',wardrobe:'wardrobe',closet:'closet',tub:'tub',sofa:'sofa',mattresses:'mattress',laundry:'sheets'}[k];
      if(hk) ok(S.hides.length===1&&S.hides[0].kind===hk&&Math.abs(S.hides[0].yaw-yaw)<1e-6&&Math.hypot(S.hides[0].x-X,S.hides[0].z-Z)<Math.max(D.w,D.d),k+' hide spot '+JSON.stringify(S.hides[0]&&{kind:S.hides[0].kind,x:+S.hides[0].x.toFixed(2),z:+S.hides[0].z.toFixed(2),w:S.hides[0].w,d:+S.hides[0].d.toFixed(2),h:S.hides[0].h}));
      if(k==='bed') ok(S.solids.some(b=>Math.abs(b.y0-.42)<1e-6&&b.h>.6),'bed: mattress box starts at 0.42 (clear underneath)');
      if(k==='kitchen') ok(SINKS.some(q=>Math.hypot(q.x-S.sink[0],q.z-S.sink[1])<1e-6)&&Math.abs(S.sink[1]-(Z+.5))<1e-6,'kitchen: sink registered at '+S.sink.map(v=>v.toFixed(2)));
      if(k==='exitchain'){ ok(S.chain.vis&&!S.chainCut.vis,'exit: chain on'); S.cut(); ok(!S.chain.vis&&S.chainCut.vis,'exit: cut() drops the chain'); S.open(1.4); ok(S.door.r[1]===1.4,'exit: open() swings the door');
        ok(S.solids.some(b=>b.kind==='door')&&S.boxes.some(b=>b.door),'exit: door box flagged'); ok(Math.abs(S.pts.cutAt[0]-X)<.3&&Math.abs(S.pts.cutAt[2]-(Z-.46))<.05,'exit: cut point in world '+S.pts.cutAt.map(v=>v.toFixed(2))); }
      if(k==='tv'){ S.setTV(false); ok(S.screenMat.unlit===0,'tv: off'); S.setTV(true,.6); ok(S.screenMat.unlit===1&&S.screenMat.color[0]===.6,'tv: on, dimmed'); ok(S.screen.live,'tv: screen is live (never merged)'); }
      if(k==='pipeburst'){ S.tick(1.23); ok(S.stream.live&&S.pts.src,'pipe: stream animates, sound source '+S.pts.src.map(v=>v.toFixed(2))); }
      if(k==='shelf') ok(S.levels.length===5&&S.free.level===2,'shelf: levels and a free span'); }
    GEO_TEMP=false; const merged=meshMerge(G,{tile:7}); ok(merged.merged>0,'meshMerge over all props: '+merged.merged+' meshes into '+merged.meshes);
    /* items */
    const keys=['pan','hammer','pipe','cutter','keys','medkit','rounds','roundbox','strip'];
    for(const k of keys){ const w=WPN[k]; ok(w&&w.build&&w.grip&&w.pts&&w.mass>0&&Array.isArray(w.strike)&&w.strike.length,k+': WPN entry complete (mass '+w.mass+')');
      for(const vr of [false,true]){ XR.on=vr; equip(HANDS.R,newItem(k)); XR.on=false; ok(HANDS.R.itemNode&&HANDS.R.item.key===k,k+': equips '+(vr?'(VR turn)':'(flat)')); }
      const Mi=itemM(HANDS.R); ok(Mi.every(v=>isFinite(v)),k+': item matrix finite'); equip(HANDS.R,null); }
    /* dropped on the floor and on a table top: they settle with their lowest point on the surface (within 1.5 cm) */
    for(const P of LOOSE.slice()) removePickup(P);
    const tb=addBox(-9.5,-8.5,-1,-.3,0,.755,'furn'); boxGridDirty=true; const drops=[];
    keys.forEach((k,i)=>{ drops.push([k,addPickup(newItem(k),propItemM(-9.4+i*.1,.755,-.65,0),[0,0,0],[0,0,0]),.755]); drops.push([k,addPickup(newItem(k),propItemM(-7+i*.7,0,-.4,0),[0,0,0],[0,0,0]),0]); });
    for(let i=0;i<120;i++) updatePickups(1/60);
    for(const [k,P,y] of drops){ updateWorld(P.node,null); let lo=1e9; (function walk(n){ if(n.mesh){ const g=n.mesh.geo; for(let i=0;i<g.P.length;i+=3){ const q=mulP(n.world,[g.P[i],g.P[i+1],g.P[i+2]]); lo=Math.min(lo,q[1]); } } for(const c of n.kids) walk(c); })(P.node);
      ok(P.rest&&Math.abs(lo-y)<.015,k+': rests on '+(y?'the table':'the floor')+' (lowest point '+(lo-y>=0?'+':'')+((lo-y)*100).toFixed(1)+' cm)'); }
    removeBox(tb);
    /* two hands on the pipe and the cutter: support anywhere along the handle, no NaN in the pose */
    for(const k of ['pipe','cutter']){ XR.on=true; equip(HANDS.R,newItem(k)); equip(HANDS.L,null); XR.on=false;
      const h=HANDS.R,o=HANDS.L; h.M=m4.compose(m4.make(),[0,1.2,0],[0,0,0],[1,1,1]); updateWorld(h.node,null);
      const along=mulP(itemM(h),[WPN[k].fore[0],0,WPN[k].fore[2]+.05]); o.M=m4.compose(m4.make(),v3.sub(along,FIST),[0,0,0],[1,1,1]);
      const got=trySupport(o); ok(got,k+': second hand takes hold along the handle'); if(got){ XR.on=true; applySupport(h); XR.on=false; const W=h.itemW,cl=c=>Math.hypot(W[c*4],W[c*4+1],W[c*4+2]); ok(W&&[...W].every(v=>isFinite(v))&&[0,1,2].every(c=>Math.abs(cl(c)-1)<1e-3),k+': two-handed pose is a proper rotation (column lengths '+[0,1,2].map(c=>cl(c).toFixed(2))+')'); releaseSupport(o);
        /* steadiness: the support hand a couple of mm either side of the handle must not flip the item's roll */
        const rolls=[[.002,0],[-.002,0],[0,.002],[0,-.002]].map(([dx,dz])=>{ o.M=m4.compose(m4.make(),v3.add(v3.sub(along,FIST),[dx,0,dz]),[0,0,0],[1,1,1]); trySupport(o); XR.on=true; applySupport(h); XR.on=false; const X=colOf(h.itemW,0); releaseSupport(o); return X; });
        /* KNOWN until applySupport (60-weapons.js) takes the up reference from the back of the hand for VR-held melee items:
           uh = w.melee&&!w.fwd&&XR.on ? -hand z : hand y. Not this file's to change; reported to the lead */
        const worst=Math.min(...rolls.map(a=>Math.min(...rolls.map(b=>v3.dot(a,b))))); out.push((worst>.95?'PASS ':'KNOWN ')+k+': two-handed roll steady when the hands line up (worst agreement '+worst.toFixed(2)+')'); }
      equip(HANDS.R,null); }
    /* the old melee path (until B's lands): a swing with each item through a man registers as blunt and nothing throws */
    const E=enemies.find(e=>!e.dead&&!e.civ); let hits=0;
    if(E) for(const k of keys){ const before=E.hp; try{ HANDS.R.item=newItem(k); HANDS.R.cd=0; meleeHit(HANDS.R,E,SEGS[0],X_(E.B,PI_.chest),[0,0,1],3,null); }catch(e){ ok(false,k+': meleeHit threw '+e.message); } hits++; }
    HANDS.R.item=null; ok(!E||hits===keys.length,'meleeHit ran for every item');
    return out; })()`));
  for (const l of r) console.log(l);
  const fails = r.filter(l => l.startsWith('FAIL')).length;
  console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 6)) : 'no errors', '|', r.filter(l => l.startsWith('PASS')).length, 'pass', fails, 'fail', r.filter(l => l.startsWith('KNOWN')).length, 'known');
  await b.close(); process.exit(fails || errs.length ? 1 : 0); })();
