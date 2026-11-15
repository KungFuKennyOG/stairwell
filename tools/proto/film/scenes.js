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

    { name: 'bellyshot', dur: 18, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.5, z: .25, hd: -Math.PI / 2, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-5.4, -.2, [-2.5, 1.2, .25]); if (!window.__noHurt) { window.__noHurt = 1; hurtPlayer = () => {}; } },
      acts: [[0, 18, F => { const E = F.E('Beto'); F.aim(E.st === 'down' ? F.pt(E, 'pelvis') : F.pt(E, 'chest'), 4); }], [.3, null, F => F.shoot(F.E('Beto'), 'belly')]] },

    { name: 'heartshot', dur: 7, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.5, z: .25, hd: -Math.PI / 2, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-5.4, -.2, [-2.5, 1.2, .25]); if (!window.__noHurt) { window.__noHurt = 1; hurtPlayer = () => {}; } },
      acts: [[0, 7, F => { const E = F.E('Beto'); F.aim(E.st === 'down' || E.dead ? F.pt(E, 'pelvis') : F.pt(E, 'chest'), 4); }],
        [.25, null, F => { const E = F.E('Beto'), B = E.B, c = v3.add(X_(B, PI_.chest), v3.sc(v3.sub(X_(B, PI_.neck), X_(B, PI_.chest)), .3)), r = norm3(v3.sub(X_(B, PI_.shR), X_(B, PI_.shL))); F.shootAt(v3.add(c, v3.sc(r, -.035))); }]] },

    { name: 'pushthrough', dur: 11, setup(F) { equip(HANDS.R, newItem('pistol')); for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
        const E = spawnEnemy({ maker: makeGunman, name: 'Beto', x: -2.0, z: .25, hd: -Math.PI / 2, extra: 'I got a kid—' }); enemies.push(E); attachLabels(); E.psych = 'fight';
        F.ray(-6.2, -.2, [-2.0, 1.2, .25]); if (!window.__noHurt) { window.__noHurt = 1; hurtPlayer = () => {}; }
        if (!window.__ts0) { window.__ts0 = torsoShock; } torsoShock = function (E, k) { if (E.torsoN) return window.__ts0(E, k); const r = Math.random, q = [.9, .1, .1]; Math.random = () => q.length ? q.shift() : r(); try { return window.__ts0(E, k); } finally { Math.random = r; } }; },
      acts: [[0, 11, F => { const E = F.E('Beto'); F.aim(E.st === 'down' || E.dead ? F.pt(E, 'pelvis') : F.pt(E, 'chest'), 5); }],
        [.3, null, F => F.shoot(F.E('Beto'), 'belly')], [1.5, 4.5, () => { KEYS.KeyS = true; }], [4.5, null, () => { KEYS.KeyS = false; }], [4.8, null, F => F.shoot(F.E('Beto'), 'belly')]] },

    { name: 'exit', dur: 8.4, setup(F) { equip(HANDS.R, newItem('cutter')); F.ray(11.3, 9.55, PF.exit.at); },
      acts: [[0, 2, F => F.aim(PF.exit.at, 3)], [1.6, null, () => pfBotOpen()], [2, 4.5, F => F.aim([13.6, 1.4, 9.9], 1.5)], [4.5, 11, F => { F.aim([15.2, 1.5, 9.9], 3); KEYS.KeyW = true; }]] },
  ];
  SC.push({ name: 'tutorial', dur: 21, setup(F) { for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) F.away(F.E(n));
      if (!document.getElementById('noguide')) { const st = document.createElement('style'); st.id = 'noguide'; st.textContent = '#guide{display:none!important}'; document.head.appendChild(st); }
      F.ray(PF_START.x, PF_START.z, [-11, 1.5, -6.4]); GUIDE.done = {}; guideReset(); guideTitle('Floor 01', 'Get out. The stairwell door is chained.', 5); },
    acts: [[0, 21, F => { const b = camBasis(); guideXR(1 / 30, b.eye, b.f); }], [0, 2.5, F => F.aim([-11, 1.3, -6.4], 2)],
      [5.5, 15.5, F => F.go(-9.0, -7.2)], [15.5, 21, F => { F.stop(); F.aim([-9.3, .3, -7.4], 3); }]] });
  const GX = F => { const b = camBasis(); guideXR(1 / 30, b.eye, b.f); };
  const fresh = () => { GUIDE.done = {}; guideReset(); if (!document.getElementById('noguide')) { const st = document.createElement('style'); st.id = 'noguide'; st.textContent = '#guide{display:none!important}'; document.head.appendChild(st); } };
  const near = (list, x, z) => list.slice().sort((a, b) => Math.hypot(a.at[0] - x, a.at[2] - z) - Math.hypot(b.at[0] - x, b.at[2] - z))[0];
  const key = c => dispatchEvent(new KeyboardEvent('keydown', { code: c })), keyUp = c => dispatchEvent(new KeyboardEvent('keyup', { code: c }));
  const park = F => { let i = 0; for (const n of ['Dani', 'Kev', 'Mario', 'Rui', 'Tito', 'Jojo']) { const E = F.E(n); if (E) { F.tp(E, -16.5 + (i % 3) * .8, -9.8 + (i / 3 | 0) * .8, 0); E.st = 'idle'; E.patrol = null; } i++; } };
  const inward = (p, d) => { const c = [-8.75, 3.75], v = norm3([c[0] - p[0], 0, c[1] - p[2]]); return [p[0] + v[0] * d, p[2] + v[2] * d]; };
  SC.push({ name: 'kitchen', dur: 17, setup(F) { park(F); fresh(); GUIDE.done.start = GUIDE.done.take = GUIDE.done.swing = GUIDE.done.sheet = GUIDE.done.hideSpot = true;
      const D = near(PF.openables.filter(o => (o.room && o.room.id || o.room) === 'N1' && o.kind === 'drawer'), -11, 3.6); F.D = D; F.SW = PF.switches.find(s => (s.room && s.room.id || s.room) === 'N1');
      F.MUG = LOOSE.filter(P => WPN[P.item.key] && WPN[P.item.key].clutter).sort((a, b) => Math.hypot(a.node.p[0] + 9.4, a.node.p[2] - 3.8) - Math.hypot(b.node.p[0] + 9.4, b.node.p[2] - 3.8))[0];
      F.ray(D.at[0] + 1.0, D.at[2], D.at); window.__ev = []; },
    acts: [[0, 17, GX], [0, 3.2, F => F.aim(F.D.at, 3)], [3.2, null, () => { pfUseQ = true; }], [3.4, 6, F => F.aim(v3.add(F.D.at, [.25, -.1, 0]), 3)],
      [6.2, null, F => { const q = inward(F.SW.at, .55); F.ray(q[0], q[1], F.SW.at); F.snap(); }], [6.2, 9.5, F => F.aim(F.SW.at, 4)], [8.0, null, () => { pfUseQ = true; }],
      [9.6, null, F => { const p = F.MUG.node.p; F.ray(p[0] + .85, p[2] + .25, p); F.snap(); }], [9.6, 12, F => F.aim(F.MUG.node.p, 4)], [11.0, null, () => { pfUseQ = true; }],
      [12.2, 17, F => F.aim([-11.5, 1.0, 5.6], 3)], [13.6, null, () => { key('KeyQ'); keyUp('KeyQ'); }]] });
  SC.push({ name: 'hurt', dur: 8, setup(F) { park(F); fresh(); for (const k in GUIDE.ev) GUIDE.ev[k] = 0; F.ray(-8.3, 2.4, [-11.6, 1.2, 4.2]); equip(HANDS.R, newItem('knife')); GUIDE.done.swing = GUIDE.done.flip = GUIDE.done.drawer = GUIDE.done.switch = GUIDE.done.clutter = GUIDE.done.hideSpot = true; },
    acts: [[0, 8, GX], [0, 8, F => F.aim([-11.6, 1.2, 4.2], 2)], [1.0, 3.5, (F, t) => { PL.hp = 100 - t * 26; }], [3.5, null, () => { PL.hp = 34; }]] });
  SC.push({ name: 'exitcut', dur: 12, setup(F) { park(F); fresh(); GUIDE.done.start = GUIDE.done.take = GUIDE.done.sheet = true; PL.hp = 100;
      const X = PF.exit; F.ray(X.at[0] - 1.6, X.at[2] - .9, X.at); },
    acts: [[0, 12, GX], [0, 5, F => F.aim(PF.exit.at, 3)], [5.0, null, F => { const c = PF.cutterAt.p; F.ray(c[0] + 1.6, c[2] + .4, c); F.snap(); }], [5.0, 12, F => F.aim(PF.cutterAt.p, 3)]] });
  F.list = () => SC.map(s => s.name);
  F.seed = k => { let s = k >>> 0; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  F.begin = name => { S = SC.find(s => s.name === name); let h = 7; for (const ch of name + (S.seed || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); F.seed(h); F.stop(); PL.crouchT = false; for (const h of [HANDS.L, HANDS.R]) equip(h, null);
    window.__Q = []; resetGame(); PL.hp = 75; S.setup(F); done.clear(); for (let i = 0; i < 20; i++) step(); t = 0; return S.dur; };
  F.tick = () => { for (const a of S.acts) { if (t < a[0]) continue; if (a[1] == null) { if (!done.has(a)) { done.add(a); a[2](F, t - a[0]); } } else if (t < a[1]) a[2](F, t - a[0]); }
    step(); t += dt; return { t: +t.toFixed(2), hp: Math.round(PL.hp), dead: PL.dead, hide: PL.hide ? PL.hide.kind : null, hunt: typeof HUNT !== 'undefined' ? HUNT.state : null,
      men: enemies.filter(E => !E.civ && Math.hypot(E.pos[0] - PL.x, E.pos[1] - PL.z) < 8).map(E => E.name + ':' + E.st + (E.dead ? '†' : '')).join(' ') }; };
  return F;
})();
