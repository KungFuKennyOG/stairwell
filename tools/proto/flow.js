// The shell's own flow, stepped headless: death card -> fade -> restart, bleed-out text, the end card on exit -> Play again,
// nothing lands while the card is up, and the old game's death untouched without ?proto=1. Prints one JSON line per check.
// usage: node tools/proto/flow.js <index.html> [query=proto=1]
const { launch, open } = require('./lib.js');
const [file, q = 'proto=1'] = process.argv.slice(2);
const STEP = `window.requestAnimationFrame=()=>0; window.__Q=[]; window.setTimeout=(fn,ms)=>{ window.__Q.push([GAME.t+(ms||0)/1000,fn]); return 0; };
  window.__st=(sec)=>{ const n=Math.round(sec*30); for(let i=0;i<n;i++){ update(1/30,performance.now()); updateWorld(world,null);
    const due=window.__Q.filter(q=>q[0]<=GAME.t); window.__Q=window.__Q.filter(q=>q[0]>GAME.t); for(const q of due){ try{ q[1](); }catch(e){} } } };
  window.__vis=id=>!document.getElementById(id).hidden;`;
(async () => {
  const browser = await launch(); let bad = 0;
  const out = (name, ok, info) => { if (!ok) bad++; console.log(JSON.stringify({ check: name, ok, ...info })); };
  { const { page, errs } = await open(browser, file, q); const E = s => page.evaluate(s => window.__eval(s), s);
    await E(STEP); await E('__st(1)');
    const r0 = await E(`({where:SHELL.where,mode:FLOOR.mode,run:SHELL.run&&SHELL.run.n,tag:$('floorTag').textContent,proto:document.body.classList.contains('proto')})`);
    out('boot', r0.proto && !!r0.where, r0);
    // killed by a man
    const who = await E(`(()=>{ const E=enemies.find(E=>!E.civ&&!E.ally); hurtPlayer(500,{E,kind:'gun',part:'chest'}); __st(1/30); return E.name; })()`);
    const d1 = await E(`({dead:PL.dead,card:__vis('pDeath'),text:$('pDeath').textContent,oldMsg:__vis('msg'),dying:!!SHELL.dying,last:SHELL.runs[SHELL.runs.length-1]})`);
    out('death card', d1.dead && d1.card && d1.text === `Killed by ${who}.` && !d1.oldMsg && d1.last.ended === 'death' && d1.last.deaths[0].who === who, { text: d1.text, oldMsg: d1.oldMsg, ended: d1.last.ended });
    await E('__st(2.6)'); const d2 = await E(`({dead:PL.dead,fade:+GAME.fade.toFixed(2)})`);
    await E('__st(.4)'); const d3 = await E(`({dead:PL.dead,card:__vis('pDeath'),fade:+GAME.fade.toFixed(2),run:SHELL.run.n,ended:SHELL.run.ended})`);
    await E('__st(1)'); const d4 = await E(`({fade:+GAME.fade.toFixed(2)})`);
    out('fade and restart', d2.dead && d2.fade > .3 && !d3.dead && !d3.card && d3.fade > 0 && !d3.ended && d4.fade === 0, { beforeRestart: d2, after: d3, later: d4 });
    // bled out
    await E(`hurtPlayer(500,{kind:'bleed'}); __st(1/30)`); const b1 = await E(`$('pDeath').textContent`);
    out('bled out', b1 === 'Bled out.', { text: b1 }); await E('__st(3.5)');
    // the exit, the card, nothing lands, play again
    await E(`(()=>{ const X=window.__eval('typeof PF!=="undefined"&&FLOOR.mode==="proto"'); if(X) protoEmit('exit'); else { PL.x=TL+.6; PL.z=0; } __st(1/30); })()`);
    const e1 = await E(`({end:!!SHELL.end,climbing:GAME.climbing,last:SHELL.runs[SHELL.runs.length-1].ended})`);
    await E('__st(.8)'); const hp0 = await E('PL.hp'); await E('hurtPlayer(40,{kind:"gun"}); __st(1/30)'); const hp1 = await E('PL.hp');
    const e2 = await E(`({card:__vis('pEnd'),rows:[...document.querySelectorAll('#pEndS dt')].map((d,i)=>d.textContent+': '+document.querySelectorAll('#pEndS dd')[i].textContent),fade:GAME.fade,floor:FLOOR.idx})`);
    out('end card', e1.end && e1.climbing && e1.last === 'exit' && e2.card && e2.rows.length >= 9 && hp1 === hp0, { rows: e2.rows, hpBefore: hp0, hpAfter: hp1, floor: e2.floor });
    await E(`drawWrist2()`); // the wrist line builds and draws without VR
    await page.click('#pAgain'); await E('__st(1)');
    const e3 = await E(`({card:__vis('pEnd'),climbing:!!GAME.climbing,end:!!SHELL.end,run:SHELL.run.n,fade:GAME.fade,floor:FLOOR.idx,mode:FLOOR.mode,dead:PL.dead})`);
    out('play again', !e3.card && !e3.climbing && !e3.end && e3.fade === 0 && !e3.dead, e3);
    const s = await E('window.__protoStats()'); out('stats', s.runs.length >= 3 && s.runs.every(r => r.ended), { runs: s.runs.map(r => r.ended + '@' + r.t) });
    out('no errors (proto)', errs.length === 0, { errs: errs.slice(0, 5) }); await page.close(); }
  // the old game: its own death card and restart, no shell
  { const { page, errs } = await open(browser, file, 'f=1'); const E = s => page.evaluate(s => window.__eval(s), s);
    await E(STEP); await E('__st(1)'); await E('hurtPlayer(500); __st(1/30)');
    const o1 = await E(`({msg:__vis('msg'),h:$('msgH').textContent,card:__vis('pDeath'),proto:document.body.classList.contains('proto')})`);
    await E('__st(3.6)'); const o2 = await E('({dead:PL.dead,fade:GAME.fade||0})');
    out('old game death', o1.msg && o1.h === 'YOU DIED' && !o1.card && !o1.proto && !o2.dead && o2.fade === 0, { o1, o2 });
    out('no errors (old)', errs.length === 0, { errs: errs.slice(0, 5) }); await page.close(); }
  await browser.close(); process.exit(bad ? 1 : 0);
})();
