// Hand bench: every item in Ray's hands, from three sides. usage: node bench.js <index.html> <outdir> [keys...]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const file = 'file://' + path.resolve(process.argv[2]), out = process.argv[3], only = process.argv.slice(4);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  await p.goto(file + '?proto=1', { timeout: 240000 }); await p.waitForTimeout(1500); await p.click('#start', { timeout: 120000 }); await p.waitForTimeout(600);
  await p.addStyleTag({ content: '#tl,#br,#xhair,#lockHint,#touch,#err,#msg,#bResetT,#vrBtnT,#bSlowT,#guide{display:none!important}' });
  const ev = s => p.evaluate(x => window.__eval(x), s);
  await ev(`window.requestAnimationFrame=()=>0; window.__noRaf=true; window.__fixedDt=1/30; HANDP.vr=true; GUIDE.off=true; if(typeof pfEnsureTools==='function') pfEnsureTools();
    for(const E of enemies){ E.dead=true; } PL.x=-13.2; PL.z=-8.4; PL.yaw=Math.PI/2; PL.pitch=0;
    PF.lights.push({p:[-13.6,2.2,-8.0],c:[1.5,1.42,1.3],d:7,kind:null,room:PF.byId.S0,t0:0,w:0}); PF.lights.push({p:[-14.6,1.2,-9.2],c:[.5,.55,.7],d:6,kind:null,room:PF.byId.S0,t0:0,w:0});
    window.BENCH=(o)=>{ PL.pitch=o.pitch??(o.view==='fp'?-.42:0); const {f,r,u,eye}=camBasis(); const xo=XR.on; XR.on=true; try{
        for(const h of [HANDS.R,HANDS.L]){ if(h.support) releaseSupport(h.support); if(h.supportOf) releaseSupport(h); }
        equip(HANDS.R,o.R?newItem(o.R):null); equip(HANDS.L,o.L?newItem(o.L):null); if(o.rev&&HANDS.R.item){ HANDS.R.item.rev=true; equip(HANDS.R,HANDS.R.item); } }finally{ XR.on=xo; }
      const rot=(v,ax,a)=>{ const c=Math.cos(a),s=Math.sin(a),d=v3.dot(v,ax),cr=v3.cross(ax,v); return [0,1,2].map(i=>v[i]*c+cr[i]*s+ax[i]*d*(1-c)); };
      const frames={ fp:[f,u], back:[r,u], palm:[v3.sc(r,-1),u], thumb:[u,v3.sc(f,-1)], knuck:[v3.sc(f,-1),u] };
      window.__hand={}; const td=.6;
      for(const s of ['R','L']){ const h=HANDS[s],sg=s==='R'?1:-1; if(o.hide===s){ window.__hand[s]={p:v3.add(eye,[0,-3,0]),f,u}; continue; }
        let [F,U]=frames[o.view||'fp'].map(v=>v.slice()); if(o.view!=='fp'&&s==='L'){ window.__hand[s]={p:v3.add(eye,[0,-3,0]),f,u}; continue; }
        const gun=h.item&&WPN[h.item.key].gun; if(!gun){ const X=v3.cross(U,F); F=rot(F,X,td); U=rot(U,X,td); }   /* the grip frame: square to the handle, td below the ray */
        const pos=o.view==='fp'?v3.add(eye,v3.add(v3.sc(f,o.d||.42),v3.add(v3.sc(r,sg*(o.sx||.11)),v3.sc(u,o.y??-.03)))):v3.add(eye,v3.add(v3.sc(f,o.d||.42),v3.sc(u,o.y??-.02)));
        window.__hand[s]={p:o.sup&&o.view!=='fp'?v3.add(pos,v3.sc(F,-(o.shift||.16))):pos,f:F,u:U}; h.trigV=o.trig||0; h.gripV=o.grip||0; h.thumbT=!!o.thumb; }
      if(o.sup){ const s=HANDS.L,m=HANDS.R,w=WPN[m.item.key]; m.support=s; s.supportOf=m; s.supZ=w.fore?w.fore[2]:0; s.cupSide=1;
        const RF=window.__hand.R.f,RU=window.__hand.R.u; if(w.fore){ const fp=v3.add(window.__hand.R.p,v3.add(v3.sc(RF,w.fore[2]-w.grip[2]),v3.sc(RU,w.fore[1]-w.grip[1]+(o.lift||0)))); window.__hand.L={p:fp,f:RF,u:RU}; } else window.__hand.L={p:v3.add(window.__hand.R.p,v3.sc(v3.cross(RU,RF),.05)),f:RF,u:RU}; }
      HANDP.noArm=!(o.view==='fp'||o.arms); PL.hp=100; PL.dead=false; window.__stepFrame(14); return 1; };`);
  const VIEWS = ['fp', 'back', 'palm', 'thumb'];
  const SHOTS = [
    { name: 'empty-open', o: {} }, { name: 'empty-fist', o: { grip: 1, trig: 1, thumb: 1 } }, { name: 'empty-point', o: { grip: 1, thumb: 1 } }, { name: 'empty-thumbup', o: { grip: 1, trig: 1 } },
    ...['knife', 'bottle', 'machete', 'hammer', 'pan', 'pipe', 'cutter', 'keys', 'strip', 'medkit', 'rounds', 'roundbox', 'can', 'bigcan', 'mug', 'mugTin', 'plate', 'tumbler', 'beercan', 'beercanC', 'ashtray', 'shoe', 'pistol', 'revolver', 'shotgun', 'smg'].map(k => ({ name: k, o: { R: k } })),
    { name: 'knife-rev', o: { R: 'knife', rev: true } },
    { name: 'pistol-two', o: { R: 'pistol', sup: true, shift: .001 } }, { name: 'shotgun-two', o: { R: 'shotgun', sup: true, d: .7 } },
    { name: 'smg-two', o: { R: 'smg', sup: true, d: .6 } }, { name: 'pipe-two', o: { R: 'pipe', sup: true, d: .7 } }, { name: 'cutter-two', o: { R: 'cutter', sup: true, d: .7 } },
    { name: 'left-knife', o: { L: 'knife', hide: 'R', both: true }, views: ['fp'] }, { name: 'both-empty', o: { both: true }, views: ['fp'] },
  ];
  for (const S of SHOTS) { if (only.length && !only.some(k => S.name === k || S.name.startsWith(k + '-'))) continue;
    for (const v of (S.views || VIEWS)) { const o = Object.assign({}, S.o, { view: v.replace('2', '') });
      await ev(`BENCH(${JSON.stringify(o)})`);
      const clip = o.sup && v !== 'fp' ? { x: 140, y: 60, width: 1000, height: 600 } : v === 'fp' ? { x: 240, y: 110, width: 800, height: 600 } : { x: 340, y: 60, width: 600, height: 600 };
      fs.writeFileSync(path.join(out, `${S.name}_${v}.jpg`), await p.screenshot({ type: 'jpeg', quality: 90, clip })); }
    process.stdout.write(S.name + ' '); }
  console.log(errs.length ? '\nERRORS ' + JSON.stringify(errs.slice(0, 6)) : '\nno errors'); await b.close();
})();
