window.requestAnimationFrame = () => 0; window.__noRaf = true; window.__fixedDt = 1 / 30;
window.__Q = []; window.setTimeout = (fn, ms) => { window.__Q.push([GAME.t + (ms || 0) / 1000, fn]); return 0; };
window.FILM = (() => {
  const dt = 1 / 30; let T = performance.now() + 2000, S = null, t = 0; const done = new Set(), F = { info: {} };
  const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  const mid = (a, b, k = .5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  F.E = n => enemies.find(E => E.name === n);
  F.pt = (E, part) => { const P = n => X_(E.B, PI_[n]);
    switch (part) { case 'head': return P('head'); case 'neck': return mid(P('neck'), P('head'), .35);
      case 'chest': return mid(P('chest'), P('neck'), .45); case 'belly': return mid(P('pelvis'), P('chest'), .45); case 'pelvis': return P('pelvis');
      case 'thighR': return mid(P('hipR'), P('knR'), .5); case 'thighL': return mid(P('hipL'), P('knL'), .5); } };
  F.tp = (E, x, z, hd) => { const dx = x - E.pos[0], dz = z - E.pos[1]; for (const A of [E.B.x, E.B.p]) for (let i = 0; i < A.length; i += 3) { A[i] += dx; A[i + 2] += dz; } E.pos = [x, z]; if (hd != null) E.hd = hd; };
  F.away = E => { F.tp(E, 15, 9.2, 0); E.st = 'idle'; E.patrol = null; };
  F.cam = { yaw: 0, pitch: 0, k: 4 };
  F.aim = (p, k) => { const e = camBasis().eye; F.cam.yaw = Math.atan2(-(p[0] - e[0]), -(p[2] - e[2])); F.cam.pitch = Math.atan2(p[1] - e[1], Math.hypot(p[0] - e[0], p[2] - e[2])); if (k) F.cam.k = k; };
  F.snap = () => { PL.yaw = F.cam.yaw; PL.pitch = F.cam.pitch; };
  F.go = (x, z, slow, pitch = 0) => { const d = navTo(PL.x, PL.z, x, z); F.cam.yaw = Math.atan2(-d[0], -d[2]); F.cam.pitch = pitch;
    if (Math.hypot(x - PL.x, z - PL.z) < .15) { F.stop(); return 0; }
    if (slow) { KEYS.KeyW = false; stick.dy = -slow; } else { stick.dy = 0; KEYS.KeyW = true; } return Math.hypot(x - PL.x, z - PL.z); };
  F.stop = () => { KEYS.KeyW = false; KEYS.KeyS = false; stick.dy = 0; };
  F.shoot = (E, part) => { const p = F.pt(E, part), e = camBasis().eye, it = HANDS.R.item; if (!it) return; it.cd = 0; it.chambered = true; if (it.ammo < 1) it.ammo = 3;
    fireHand(HANDS.R, { o: e, d: norm3(v3.sub(p, e)) }); };
  F.shootAt = p => { const e = camBasis().eye, it = HANDS.R.item; if (!it) return; it.cd = 0; it.chambered = true; if (it.ammo < 1) it.ammo = 3; fireHand(HANDS.R, { o: e, d: norm3(v3.sub(p, e)) }); };
  F.ray = (x, z, look) => { PL.x = x; PL.z = z; PL.dead = false; if (look) { F.aim(look); F.snap(); } };
  function runQ() { if (!window.__Q.length) return; const due = window.__Q.filter(q => q[0] <= GAME.t); window.__Q = window.__Q.filter(q => q[0] > GAME.t); for (const q of due) { try { q[1](); } catch (e) { } } }
  function step() { const a = Math.min(1, dt * F.cam.k); PL.yaw = wrap(PL.yaw + wrap(F.cam.yaw - PL.yaw) * a); PL.pitch += (F.cam.pitch - PL.pitch) * a;
    runQ(); frame(T); T += 1000 / 30; }

  const SC = [
    { name: 'hall', dur: 5.5, setup(F) { F.ray(-7.7, -.15, [0, 1.5, .1]); F.away(F.E('Tito')); F.away(F.E('Jojo')); },
      acts: [[0, 5.5, F => { F.aim([2, 1.45, .05], 2); KEYS.KeyW = false; stick.dy = -.32; }]] },

    { name: 'hunt', dur: 8.2, setup(F) { equip(HANDS.R, null); PL.crouchT = true; F.ray(-10.4, -1.95, [-7.2, 1.0, -2.6]);
        const a = F.E('Tito'), b = F.E('Jojo'); F.tp(a, -2.5, 0, -Math.PI / 2); F.tp(b, -1.4, .3, -Math.PI / 2); },
      acts: [[.3, null, F => { huntAlert('noise', [-9.0, -3.2], 1); }],
        [0, 16, F => { const a = F.E('Tito'); if (!a || a.dead) return; const p = F.pt(a, 'chest'); F.aim([p[0], Math.min(p[1], 1.25), p[2]], 1.2); }]] },

    { name: 'standoff', dur: 6.3, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui']) F.away(F.E(n)); F.ray(6.6, -.1, [0, 1.4, 0]);
        const a = F.E('Tito'), b = F.E('Jojo'); F.tp(a, 3.3, -.3, Math.PI / 2); F.tp(b, 2.5, .45, Math.PI / 2); for (const E of [a, b]) { setAware(E, 'seen'); E.st = 'alert'; } },
      acts: [[0, 7, F => { const a = F.E('Tito'), b = F.E('Jojo'); const p = a && !a.dead ? F.pt(a, 'chest') : [0, 1.3, 0], q = b && !b.dead ? F.pt(b, 'chest') : p; F.aim([(p[0] + q[0]) / 2, 1.35, (p[2] + q[2]) / 2], 2); KEYS.KeyS = t < 4.5; }]] },

    { name: 'melee', dur: 10, setup(F) { equip(HANDS.R, newItem('pipe')); PL.crouchT = true; F.ray(-8.2, 2.55, [-10.85, 1.3, 3.6]);
        const d = F.E('Dani'); F.tp(d, -10.85, 3.6, -Math.PI / 2); F.away(F.E('Tito')); F.away(F.E('Jojo')); },
      acts: [[0, 2.6, F => F.go(-10.15, 2.85, .5, -.05)], [2.6, 10, F => { const d = F.E('Dani'); F.stop(); F.aim(d.st === 'down' || d.dead ? F.pt(d, 'chest') : F.pt(d, 'head'), 5); }],
        [2.8, null, () => { PL.crouchT = false; }], [3.2, null, () => flatSwing(HANDS.R)], [4.3, null, () => flatSwing(HANDS.R)], [5.6, null, () => flatSwing(HANDS.R)]] },

    { name: 'gun', dur: 10.5, setup(F) { equip(HANDS.R, newItem('pistol')); F.away(F.E('Tito')); F.away(F.E('Jojo')); F.away(F.E('Mario'));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: 3.3, z: 5.2, hd: -2.42, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(3.7, 1.65, [1.0, 1.5, 1.8]); },
      acts: [[0, 2.0, F => F.go(1.0, 2.4, .6)], [2.0, 13, F => { const E = F.E('Beto'); F.stop(); const p = E.st === 'down' || E.dead ? F.pt(E, 'pelvis') : F.pt(E, 'chest'); F.aim([p[0], Math.max(p[1], .6), p[2]], 6); }],
        [3.6, null, F => F.shoot(F.E('Beto'), 'thighR')], [4.1, null, F => F.shoot(F.E('Beto'), 'belly')]] },

    { name: 'legshot', dur: 4.5, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.5, z: .25, hd: 0, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-5.4, -.45, [-2.5, 1.0, .25]); },
      acts: [[0, 4.5, F => { const E = F.E('Beto'); F.aim(E.st === 'alert' || E.st === 'idle' ? F.pt(E, 'pelvis') : F.pt(E, 'pelvis'), 4); }],
        [1.0, null, F => F.shoot(F.E('Beto'), 'thighR')], [1.2, null, F => F.shoot(F.E('Beto'), 'thighR')]] },

    { name: 'armshot', dur: 7, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.5, z: .25, hd: -Math.PI / 2, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-5.4, -.2, [-2.5, 1.2, .25]); if (!window.__noHurt) { window.__noHurt = 1; hurtPlayer = () => {}; } },
      acts: [[0, 7, F => { const E = F.E('Beto'); F.aim(F.pt(E, 'chest'), 4); }], [1.0, null, F => { const E = F.E('Beto'), B = E.B; F.shootAt(v3.add(X_(B, PI_.shR), v3.sc(v3.sub(X_(B, PI_.elR), X_(B, PI_.shR)), .5))); }],
        [2.6, null, F => { const E = F.E('Beto'), B = E.B; F.shootAt(v3.add(X_(B, PI_.elR), v3.sc(v3.sub(X_(B, PI_.hdR), X_(B, PI_.elR)), .5))); }]] },

    { name: 'bellyshot', dur: 9, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.5, z: .25, hd: -Math.PI / 2, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-5.4, -.2, [-2.5, 1.2, .25]); if (!window.__noHurt) { window.__noHurt = 1; hurtPlayer = () => {}; } },
      acts: [[0, 9, F => { const E = F.E('Beto'); F.aim(E.st === 'down' ? F.pt(E, 'pelvis') : F.pt(E, 'chest'), 4); }], [1.0, null, F => F.shoot(F.E('Beto'), 'belly')]] },

    { name: 'exit', dur: 8.4, setup(F) { equip(HANDS.R, newItem('cutter')); F.ray(11.3, 9.55, PF.exit.at); },
      acts: [[0, 2, F => F.aim(PF.exit.at, 3)], [1.6, null, () => pfBotOpen()], [2, 4.5, F => F.aim([13.6, 1.4, 9.9], 1.5)], [4.5, 11, F => { F.aim([15.2, 1.5, 9.9], 3); KEYS.KeyW = true; }]] },
  ];
  F.list = () => SC.map(s => s.name);
  F.seed = k => { let s = k >>> 0; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  F.begin = name => { S = SC.find(s => s.name === name); let h = 7; for (const ch of name + (S.seed || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); F.seed(h); F.stop(); PL.crouchT = false; for (const h of [HANDS.L, HANDS.R]) equip(h, null);
    window.__Q = []; resetGame(); PL.hp = 75; S.setup(F); done.clear(); for (let i = 0; i < 20; i++) step(); t = 0; return S.dur; };
  F.tick = () => { for (const a of S.acts) { if (t < a[0]) continue; if (a[1] == null) { if (!done.has(a)) { done.add(a); a[2](F, t - a[0]); } } else if (t < a[1]) a[2](F, t - a[0]); }
    step(); t += dt; return { t: +t.toFixed(2), hp: Math.round(PL.hp), dead: PL.dead, hide: PL.hide ? PL.hide.kind : null, hunt: typeof HUNT !== 'undefined' ? HUNT.state : null,
      men: enemies.filter(E => !E.civ && Math.hypot(E.pos[0] - PL.x, E.pos[1] - PL.z) < 8).map(E => E.name + ':' + E.st + (E.dead ? '†' : '')).join(' ') }; };
  return F;
})();
