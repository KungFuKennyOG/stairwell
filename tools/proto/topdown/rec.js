// Record a bot run on floor 01 for a top-down map video: static floor + 10 fps frames
const { launch, open, CORE } = require('../lib.js');
const [file, bot='sneak', seed='1', out='run.json', optsArg='{}'] = process.argv.slice(2);
(async()=>{ const b=await launch(); const {page,errs}=await open(b,file,'proto=1');
  await page.evaluate(s=>window.__eval(s),CORE);
  await page.evaluate(sd=>window.__eval(`(()=>{ let s=${sd}>>>0||1; Math.random=()=>(s=(s*16807)%2147483647)/2147483647; })()`),seed);
  const res=await page.evaluate(([bt,o])=>window.__eval(`(()=>{
    const R2=v=>Math.round(v*100)/100;
    const st={rooms:PF.rooms.map(r=>({id:r.id,name:r.name||'',rects:r.rects})),
      walls:PF.runs.filter(R=>!R.room.noFace).map(R=>({axis:R.axis,c:R.c,a:R.fa,b:R.fb,gaps:R.gaps.map(g=>[g.s0,g.s1,g.kind])})),
      openings:PF.openings.map(o=>({kind:o.kind,x:o.x,z:o.z,axis:o.axis,w:o.w})),
      hides:HIDES.map(h=>({x:h.x,z:h.z,kind:h.kind})), exit:PF.exit?[PF.exit.at[0],PF.exit.at[2]]:null, cutter:PF.cutterAt?[PF.cutterAt.p[0],PF.cutterAt.p[2]]:null,
      switches:(PF.switches||[]).map(s=>[s.at[0],s.at[2]])};
    const F=[]; let k=0;
    protoOn('tick',()=>{ if(k++%3) return; const sq=typeof SQ!=='undefined'?SQ:null;
      F.push({t:R2(GAME.t),ray:[R2(PL.x),R2(PL.z),R2(PL.yaw),PL.crouch?1:0,PL.hide?1:0,Math.round(PL.hp),PL.dead?1:0,HANDS.R.item?HANDS.R.item.key:'',HANDS.L.item?HANDS.L.item.key:''],
        hunt:typeof HUNT!=='undefined'?HUNT.state:'', dir:typeof DIRECTOR!=='undefined'?DIRECTOR.phase:'', sqR:sq&&sq.R?sq.R.id:'', siege:sq&&sq.siege?1:0,
        exitOpen:PF.exit&&PF.exit.open?1:0,
        men:enemies.map(E=>{ const j=sq&&sq.jobs.get(E); return [E.name,R2(E.pos[0]),R2(E.pos[1]),R2(E.hd),E.dead?'dead':E.st,E.civ?1:0,E.aware?1:0,E.canSee?1:0,j?j.k:'',E.hRole||'',E.hj?E.hj.k:'',E.torchOn&&!E.dead?1:0,E.barkT>0&&E.barkEl?E.barkEl.textContent:'',Math.round((E.pm||0)*100),E.surr?1:0]; }),
        shots:(window.__shots=window.__shots||[]).splice(0)}); });
    { const es=enemyShoot; enemyShoot=function(E){ (window.__shots=window.__shots||[]).push(['e',R2(E.pos[0]),R2(E.pos[1]),R2(PL.x),R2(PL.z)]); return es.apply(this,arguments); }; }
    protoOn('fire',()=>{ (window.__shots=window.__shots||[]).push(['r',R2(PL.x),R2(PL.z),R2(PL.yaw)]); });
    const r=window.__PB.run('${bt}',${JSON.stringify(o)});
    return {st,F,r:{t:r.t,died:r.died,left:r.left,stats:r.stats&&{deaths:r.stats.deaths,kills:(r.stats.kills||[]).length}}}; })()`),[bot,JSON.parse(optsArg)]);
  res.errs=errs.slice(0,5); require('fs').writeFileSync(out,JSON.stringify(res)); console.log(bot,seed,'frames',res.F.length,'t',res.r.t,'died',res.r.died,'left',res.r.left,'errs',errs.length);
  await b.close(); })();
