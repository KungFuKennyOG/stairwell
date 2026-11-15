// Reads the JSON lines check.sh collected and prints the plan section 10 table. Exit 1 if any check FAILs (N/A and INFO don't).
// usage: node tools/proto/report.js <dir with boot/flow/walk/fetch/stand/sneak/pistol/melee .jsonl>
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || '/tmp/proto-check';
const read = n => { const f = path.join(dir, n + '.jsonl'); if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim().startsWith('{')).map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean); };
const boot = read('boot'), flow = read('flow'), walk = read('walk'), fetch = read('fetch'), stand = read('stand'), sneak = read('sneak'), pistol = read('pistol'), melee = read('melee');
const bots = [walk, fetch, stand, sneak, pistol].filter(Boolean).flat();
const ran = a => (a || []).filter(r => !r.ERR && !r.err);
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const rows = []; const row = (what, how, pass, res, measured, needs) => rows.push({ what, how, pass, res, measured, needs });
const where = (bots.find(r => r.where) || (boot || []).find(o => o.boot === 'proto') || {}).where || '?';

// still too easy: the pistol bot dies in 25-50% of its runs
{ const P = ran(pistol); const died = P.filter(r => r.died).length;
  if (!P.length) row('Still too easy', 'pistol bot, 20 runs', 'dies in 25-50%', 'N/A', 'no pistol runs', '');
  else row('Still too easy', `pistol bot, ${P.length} runs`, 'dies in 25-50%', pct(died, P.length) >= 25 && pct(died, P.length) <= 50 ? 'PASS' : 'FAIL',
    `died ${died}/${P.length} (${pct(died, P.length)}%)` + (P.length < 20 ? ', fewer than 20 runs' : '') + `; men killed ${P.reduce((s, r) => s + (r.menDead || 0), 0)}/${P.reduce((s, r) => s + (r.men || 0), 0)}`, 'A, D, E, F'); }

// still skippable: the walk-through can't leave in under 90 s
{ const W = ran(walk), out = W.filter(r => r.left && r.stats && r.stats.exitT != null), fast = out.filter(r => r.stats.exitT < 90);
  if (!W.length) row('Still skippable', 'walk-through bot', "can't leave under 90 s", 'N/A', 'no walk runs', 'F');
  else row('Still skippable', `walk-through bot, ${W.length} runs`, "can't leave under 90 s", fast.length ? 'FAIL' : 'PASS',
    out.length ? `left in ${out.map(r => r.stats.exitT + ' s').join(', ')}` : `never left (ran ${Math.max(...W.map(r => r.t))} s, reached the exit: ${W.filter(r => r.atExit != null).length}/${W.length}, died ${W.filter(r => r.died).length})`, 'F'); }

// distance wins: under 25% of kills from beyond 8 m (a kill counts at the distance of Ray's last bullet in him, else where Ray stood)
{ const K = ran(bots).flatMap(r => (r.stats && r.stats.kills) || []).map(k => k.shotD ?? k.d), far = K.filter(d => d > 8).length;
  if (!K.length) row('Distance wins', 'kill-distance log', 'under 25% beyond 8 m', 'N/A', 'no kills logged', 'E, F');
  else { K.sort((a, b) => a - b); row('Distance wins', `kill-distance log, ${K.length} kills`, 'under 25% beyond 8 m', pct(far, K.length) < 25 ? 'PASS' : 'FAIL',
    `${far}/${K.length} beyond 8 m (${pct(far, K.length)}%), median ${K[K.length >> 1]} m`, 'E, F'); } }

// hunts fair: every finished hunt 75-150 s; the next one starts 30 s or more after it ends, unless Ray was seen
{ const H = [], gaps = []; for (const r of ran([stand, sneak, walk, fetch].filter(Boolean).flat())) { const hs = (r.stats && r.stats.hunts) || [];
    hs.forEach((h, i) => { if (h.len != null && !h.open) H.push(h.len); const nx = hs[i + 1]; if (nx && h.end != null) gaps.push({ gap: +(nx.t0 - h.end).toFixed(1), reason: nx.reason }); }); }
  const pist = ran(pistol).flatMap(r => (r.stats && r.stats.hunts) || []).filter(h => h.len != null && !h.open).map(h => h.len);
  const badLen = H.filter(l => l < 75 || l > 150), badGap = gaps.filter(g => g.gap < 30 && g.reason !== 'seen');
  if (!H.length) row('Hunts fair', 'hunt log (stand, sneak, walk)', '75-150 s, breather after', 'N/A', `no finished hunts logged${pist.length ? `; pistol runs: ${pist.join(', ')} s` : ''}`, 'D');
  else row('Hunts fair', `hunt log, ${H.length} hunts`, '75-150 s, breather after', badLen.length || badGap.length ? 'FAIL' : 'PASS',
    `lengths ${H.join(', ')} s; breathers ${gaps.length ? gaps.map(g => g.gap + ' s' + (g.reason === 'seen' ? ' (seen)' : '')).join(', ') : 'none needed'}` + (pist.length ? `; pistol runs: ${pist.join(', ')} s` : ''), 'D'); }

// melee registers: agent B's hand rig, 98% or more
{ const M = (melee || []).filter(o => o.pct != null || o.rate != null || (o.swings != null && (o.registered != null || o.hits != null)));
  if (!M.length) row('Melee registers', 'hand rig', '98% or more', 'N/A', melee ? 'rig ran, no {pct} or {swings,registered} line found' : 'no rig found (agent B)', 'B');
  else { let sw = 0, reg = 0, pc = []; for (const o of M) { if (o.swings != null) { sw += o.swings; reg += o.registered ?? o.hits; } else pc.push(o.pct ?? (o.rate <= 1 ? o.rate * 100 : o.rate)); }
    const p = sw ? 100 * reg / sw : Math.min(...pc); row('Melee registers', 'hand rig', '98% or more', p >= 98 ? 'PASS' : 'FAIL', sw ? `${reg}/${sw} (${p.toFixed(1)}%)` : `worst ${p.toFixed(1)}%`, 'B'); } }

// nothing broken: every level boots clean, the shell's flow works, no bot page threw
{ const B = (boot || []).filter(o => o.boot), bf = B.filter(o => !o.ok), F = (flow || []).filter(o => o.check), ff = F.filter(o => !o.ok);
  const be = bots.filter(r => r.ERR || r.err || (r.errors && r.errors.length) || r.qErr);
  const old = B.filter(o => /^f=\d+$/.test(o.boot)).length;
  row('Nothing broken', `${old} old + ${B.length - old} more levels, flow, bots`, 'zero errors', !B.length ? 'N/A' : bf.length || ff.length || be.length ? 'FAIL' : 'PASS',
    [`boot ${B.length - bf.length}/${B.length}` + (bf.length ? ' failed: ' + bf.map(o => o.boot + (o.errors && o.errors[0] ? ' (' + o.errors[0].slice(0, 80) + ')' : '')).join('; ') : ''),
     `flow ${F.length - ff.length}/${F.length}` + (ff.length ? ' failed: ' + ff.map(o => o.check).join(', ') : ''),
     `bot errors ${be.length}` + (be.length ? ': ' + be.slice(0, 3).map(r => r.bot + ' ' + String(r.ERR || r.err || r.qErr || r.errors[0]).slice(0, 80)).join('; ') : '')].join('; '), 'all'); }

// info, from the plan's own sections
{ const S = ran(stand); if (S.length) row('Found in the dark', `stand bot, ${S.length} runs (plan 5.5)`, 'found within 20 s', 'INFO',
    S.map(r => r.foundAfter != null ? `found after ${r.foundAfter} s` : `not found in ${r.t} s`).join(', ') + `; died ${S.filter(r => r.died).length}`, 'D'); }
{ const S = ran(sneak); if (S.length) row('Hide and sneak', `sneak bot, ${S.length} runs`, 'careful run 8-15 min', 'INFO',
    S.map(r => `${r.left ? 'out in ' + r.stats.exitT + ' s' : r.died ? 'killed by ' + ((r.stats.deaths[0] || {}).who || '?') + ' at ' + r.t + ' s' : 'still in at ' + r.t + ' s'}, hid ${r.hideN}x, seen ${r.seenN}x, grabbed ${r.grabbed}x`).join('; '), 'D, G'); }
{ const S = ran(sneak); if (S.length) { const ok = S.filter(r => !r.died).length, mc = Math.max(...S.map(r => r.maxClose || 0));
  row('Sneak survives', `sneak bot, ${S.length} runs`, 'alive or out in 50-70%', 'INFO', `${ok}/${S.length} (${pct(ok, S.length)}%); most men within 5 m at once: ${mc}`, 'D'); } }
{ const quiet = read('quiet'), S = quiet ? ran(quiet) : []; if (S.length) { const f = S.filter(r => r.foundAfter != null).map(r => r.foundAfter).sort((a, b) => a - b);
  row('Quiet, in the dark', `stand bot after one smash, ${S.length} runs`, 'found sometimes, not at once', 'INFO', `found ${f.length}/${S.length}${f.length ? ', median ' + f[f.length >> 1] + ' s' : ''}; died ${S.filter(r => r.died).length}`, 'D'); } }
{ const S = ran(fetch); if (S.length) { const m = S.filter(r => r.toolToExit != null).map(r => r.toolToExit);
    row('Cutter to exit', `fetch bot, ${S.length} runs (plan 6.6)`, 'under 60 s', m.length ? (Math.max(...m) < 60 ? 'PASS' : 'FAIL') : 'N/A',
      S.map(r => r.toolFound ? (r.left ? `tool at ${r.toolT} s, out ${r.toolToExit} s later` : `tool at ${r.toolT} s, not out (at the exit: ${r.atExit != null})`) : (r.left ? `no tool needed: out in ${r.stats.exitT} s` : 'no cutter/keys found on the floor')).join('; '), 'F, H'); } }

const W = [17, 38, 26, 7]; const pad = (s, n) => String(s).padEnd(n);
console.log(`\nFloor 01 prototype checks (floor booted: ${where}; data in ${dir})\n`);
console.log(pad('Check', W[0]) + pad('How', W[1]) + pad('Pass', W[2]) + pad('Result', W[3]) + ' Measured');
console.log('-'.repeat(120));
for (const r of rows) console.log(pad(r.what, W[0]) + pad(r.how, W[1]) + pad(r.pass, W[2]) + pad(r.res, W[3]) + ' ' + r.measured + (r.needs ? `  [${r.needs}]` : ''));
console.log('\n[ ] = whose work the check measures (agents in PROTO_BRIEF.md section 5)');
if (where === 'old') console.log(`\nNote: ?proto=1 loaded the OLD floor 01 (no pfLoad in this build, or ?pf=0). "Still skippable" and "Still too easy" then measure the old floor, which has open stairs and no hunt controller; they only mean something once agent F's floor is merged.`);
const fails = rows.filter(r => r.res === 'FAIL').length; console.log(`\n${fails ? fails + ' FAIL' : 'All checks pass or N/A'}`);
process.exit(fails ? 1 : 0);
