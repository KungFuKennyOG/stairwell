# Floor 01 prototype: shared brief for every agent

Read this whole file before touching code. Then read `docs/proto/PLAN.md` (the build plan) for your section.

## 1. The game, and the turn it just took

Stairwell is a VR game for Meta Quest 3 in WebXR, built by Kenny (solo). Custom WebGL2 renderer, PS1-era look: blocky but realistic chunky characters, painted smooth-gradient textures, grimy, ugly, dark, lived-in rooms. Physical enemies (verlet ragdolls driven by muscles), a detailed wound system (bleed by body part, arterial spurts, shock, begging, limbs lost), overheard dialogue, story told through objects.

Story: a task force raids a cartel tower in Puerto Seco, a border city. It was a setup. Ray, a cop, is shot and left for dead in the lobby with his five teammates dead around him. He takes his dying teammate Novak's pistol and climbs. The men upstairs counted five bodies, not six. They are looking for him.

**New direction (decided 14 Nov):** this is a realistic horror game about being hunted. No monsters, no powers, nothing that couldn't happen. Ray is prey. He hides, listens, moves when the flashlights pass, and when he's caught the violence is desperate and at arm's length. Kenny: arm's-length violence is "the 1000% best bet". The grime already makes it feel like horror: protect it. Polish, don't rebuild.

**The prototype:** one new floor (floor 01, re-laid-out) that proves all of this, plus melee that actually works. It runs behind `?proto=1`. The existing 15-floor game must keep working exactly as before when the flag is off.

## 2. Kenny's fixed decisions (do not reverse)

- Realistic only. No vignette, ever (comfort). Never move or rotate the camera for effect. Smooth locomotion + snap turn.
- **No doors that need hands. Doors were "fucking annoying in VR... everything" about them.** Openings are open, or have a hung sheet/plastic you walk straight through at full speed that never snags you or blocks a swing. The only door is the chained exit, which swings open by itself once the chain is cut.
- Scarce ammo, no bullet time. Health does not regenerate.
- Melee must feel like The Walking Dead: Saints & Sinners. Today: "hits don't register, no weight or impact, feels very weak".
- Floors should feel large.
- Hunts: strike a balance so it stays fun. Calm, then a hunt that ends (75-150 s), then "on edge" for the rest of the floor, with breathers.
- Ray is silent. Enemy speech is shown as English text.
- No PS1 vertex wobble or affine textures in VR. No spinning/jumping when shot. Guns gripped by both hands, no floating hands or arms.
- Quest 3 must hold 72 fps. Kenny reads FPS on the left wrist.
- Blade tilt 0° and hands turned out 5° are his tested defaults (`MEL.tilt=0`, `MEL.yaw=2`). Keep them.
- Never edit `index.html` by hand. `./build.sh` makes it from `src/`.

## 3. The codebase in five minutes

- `./build.sh` concatenates `src/00-head.html` + every `src/*.js` in name order (plus a few kit files from `src/houses` and `src/frontera`) into one `<script>` in `index.html`, then syntax-checks. **Any new `src/*.js` file is picked up automatically.** All files share one global scope: a function declared in any file is callable from any other at runtime.
- `10-engine.js` renderer, meshes (`N`, `mk`, `box`, `M` materials, `m4`, `v3`), characters and skinning.
- `20-floor-assets.js` furniture/prop builders. `30-floor.js` level geometry, collision boxes (`addBox(x0,x1,z0,z1,y0,h,kind)`, `BOXES`, `solidFor`, `pushOutXZ`, `rayBoxes`, `rayRoom`, `sightClear`), nav (`navField`, `navTo`, `navCell`, `freeSpot`).
- `50-game.js` the big one: bodies, ragdoll physics, `hitEnemy`, `hitBlunt`, `meleeHit` path, wounds and bleeding, `die`, enemy AI `think()`, `enemyShoot`, `hurtPlayer`, `resetGame`, `restartLevel`, input, `update()` frame loop, VR loop.
- `51-gait.js` walking. `52-senses.js` hearing (`noise`), sight (`senses`), search (`investigate`, `startSearch`, `giveUp`), `footsteps`. `55-voice.js` voices/barks. `57-acoustics.js` reverb and spatial audio. `58-mic.js` headset mic.
- `60-weapons.js` `WPN` table, `newItem`, `equip`, `fireHand`, `bullet`, `reloadHand`, `vrMelee`, `handPts`, `flatSwing`, pickups (`LOOSE`, `addPickup`), `kickDoor`. `61-melee.js` VR blade handling, weight lag (`meleeTick`), stuck blades (`startStuck`, `stuckTick`). `62-grab.js` grabbing bodies. `63-grapple.js` gun wrestling, wall pins, hostages, drowning. `64-environment.js` windows, falls.
- `66-tower.js` the campaign: `genTower`, `towerLoad`, `towerReset`, roles (`twRoles`, `twHunt`, `twFlank`, `twBrace`), tenants (`twCivPanic`), the lobby prologue. `67`-`73` the floor definitions. `69-standoff.js` surrender, fakers, civilian reactions. `70-wounds.js` shock, flinch, downed reactions.
- Globals: `GAME`, `PL` (player: x,z,yaw,hp,dead...), `FLOOR`, `enemies`, `HANDS.L/.R` (`.item`, `.M` hand matrix, `.hand`), `XR` (`XR.on`, `XR.head`), `WPN`, `LOOSE`, `KEYS`, `stick`.
- Debug hooks: `window.__game` and `window.__eval(code)` evaluate inside the game's scope from Playwright.
- URL flags: `?f=N` floor, `?proto=1` prototype rules, `?pf=0` keep the old floor 01 layout with prototype rules on.

## 4. The prototype foundation (already in `src/05-proto.js`)

```js
PROTO.on        // true with ?proto=1. GATE EVERY GAME-RULE CHANGE ON THIS.
PROTO.floor     // false with ?pf=0
protoOn(ev, fn) // listen
protoEmit(ev, ...args)
pnum(sys, key, def) // read PROTO[sys][key] with a default
```

Core events already wired:

| Event | Args | Where |
|---|---|---|
| `tick` | `(gdt, dt)` | `update()` once a frame, after `think()`, before physics |
| `hurt` | `(d, src)` | top of `hurtPlayer(d, src)`; `src` is `{}` until callers pass `{E, kind, part}` |
| `death` | `(E)` | top of `die(E)` |
| `fire` | `(h, it, {o, d, muzzle, sup})` | `fireHand`, just before the noise is made |
| `noise` | `(src, rad, o)` | top of `noise()` |
| `reset` | `()` | end of `resetGame()` (every start and restart) |
| `load` | `()` | end of `towerLoad()` |

Add new events freely (document them in your report). Prefer listening over editing `update()`.

Each system keeps its tuning numbers in `PROTO.<system>` declared in its own file, e.g. `PROTO.melee={...}`.

**Gating rule:** anything that changes the rules (no regen, ammo limits, hunts, grabs, hiding...) only happens when `PROTO.on`. Exception: the melee fixes (registration, weight, impact) apply everywhere because they fix bugs Kenny reported; melee *stamina* is gated.

## 5. Who owns what

Ten agents work in parallel, each in its own git worktree and branch. Stay in your lane. If you must change a function owned by someone else, keep the edit minimal and mention it in your report.

| Agent | System | Own new file | Main existing code you own |
|---|---|---|---|
| A ray | Ray's body and danger: health, no regen, damage to Ray, hit reaction, ammo economy, reload from carried rounds, counting rounds by feel, loose rounds and first aid use, bullet time removed, Ray's wounds (bleed, drops, bandage by wrapping, leg/arm effects), blood on hands | `src/80-ray.js` | `hurtPlayer`, regen line in `update()`, `reloadHand`, `toggleSlow`/bullet time, ammo in `fireHand` |
| B melee | Player melee: swept hit test, contact speed, tiers, weapon stop, weight on every weapon, stabs, edge alignment, grab-and-stab, stamina, the melee test rig | `src/81-melee.js` | `vrMelee`, `handPts`, `meleeHit`, `hitBlunt`, `meleeTick`, `BLUNT`, melee fields of `WPN` |
| C clinch | Enemies grabbing Ray: wrist grab, collar drag (from hiding), tackle, choke from behind; the struggle; the gun turned on Ray (wrestle reversed) | `src/82-clinch.js` | `63-grapple.js` additions |
| D hunt | Hunt brain and senses: perception meter, silhouette, hearing radii through walls, mic radii, the three floor states, flashlight pairs, search grid, checking hiding spots, breathers, evidence callouts | `src/83-hunt.js` | `52-senses.js`, `58-mic.js` radii, `twHunt`/`twRoles` behaviour in proto |
| E fight | Enemy fighting: no hard range caps, muzzle flash reveals Ray, first-shot timing, accuracy, one shooter at a time, enemy melee wind-up/feints and Ray catching a wrist, rage on a friend's death, "You killed X" only from witnesses, retreat-and-ambush, nerve table, quitters who run when left alone | `src/84-fight.js` | `think()` combat parts, `enemyShoot`, `KST`, `die()` shout, `psychOf`, `surrTick` |
| F floor | The new floor 01: room-based floor builder, the layout, nav, lights, room lookup, cast and item placement, the chained exit and bolt cutter, dormancy by rooms | `src/85-pfloor.js` | `resetGame` branch for `mode==='proto'`; `30-floor.js` only where the builder needs it |
| G hide | Hiding and doorways: hiding spots, Ray-in-spot detection with his real body, under-bed clearance (height-limited boxes), crouch, hung sheets in openings, hand over mouth | `src/86-hide.js` | `solidFor`, `sightClear` sight-only flag |
| H props | Props and handheld models: furniture with hiding anatomy, landmarks, improvised weapons and tools | `src/87-props.js` | new `WPN` entries only |
| I wounded | Wounded men and tenants: loud begging, clotting, crawling toward something, the limb-line fix, tenant reactions (freeze, hide, scream, point), shush gesture, killing a tenant | `src/88-wounded.js` | wound bleed rates, `70-wounds.js`, `civReact`/`civTick2` |
| J shell | Prototype shell and QA: start-card button, boot into the prototype, death and restart flow, end card with run stats, telemetry, prototype bots and pass/fail checks, README and start text | `src/89-shell.js`, `tools/proto/` | start card in `00-head.html`, boot in `99-end.js`/`towerBoot` |

## 6. Contracts between systems

Always call across systems with a guard, because the other agent's code isn't in your branch yet: `if(typeof enemyGrab==='function') enemyGrab(E,'collar');`. If you need something that doesn't exist yet, write a small local fallback.

**Hunt (D)**
```js
HUNT = { state:'calm'|'hunting'|'edge', lkp:[x,z]|null, lkpT, n, breatherT }
huntAlert(reason, pos, strength)  // reason: 'seen'|'body'|'shot'|'scream'|'noise'|'radio'; pos [x,z]; strength 0..1
// events: protoEmit('huntStart', reason), protoEmit('huntEnd')
```

**Hiding (G)**
```js
HIDES                          // array of spots
addHideSpot({id, kind, x, z, yaw, w, d, h})  // kind: 'bed'|'wardrobe'|'closet'|'tub'|'sheets'|'sofa'|'mattress'|'corner'
PL.hide                        // the spot Ray is in, or null
PL.crouch                      // true when crouched (real head height or stick toggle)
rayConcealment(E)              // 0 = can't be seen at all, 1 = normal; used by D's perception
hideProbe(E, spot)             // D calls this when a searcher checks a spot; true = Ray caught there
addSheet({x, z, axis:'x'|'z', w, h, kind:'sheet'|'plastic'})  // a hung cover in an opening; blocks sight, not bodies, not sound
// box flag: addBox(...) result b.sightOnly = true  -> blocks sight only
```

**Grabs (C)**
```js
enemyGrab(E, kind, opts)       // kind: 'wrist'|'collar'|'tackle'|'choke'; returns true if it started
PL.grab                        // {E, kind, t, ...} while held, else null
// events: 'grabbed'(E, kind), 'grabEnd'(E, kind, result)  result: 'free'|'killed'|'lost'
```

**Ray (A)**
```js
PL.wounds   // [{part:'leg'|'arm'|'torso', bleed, bandaged}]
PL.limp     // 0..1, D's callouts use it ("He's limping")
RAYDROPS    // [{x, z, t}] blood drops Ray leaves; D's searchers follow them
PL.ammo     // carried loose rounds (not in a gun)
// events: 'rayWound'(w), 'bandaged'(w)
```

**Floor (F)**
```js
pfLoad()            // build the prototype floor and its cast; sets FLOOR.mode='proto'
pfReset()           // re-place the cast, items and state on restart (called from resetGame)
PF.rooms            // [{id, name, x0, z0, x1, z1, lit, ...}]
PF.openings         // [{a, b, x, z, axis, w, kind:'open'|'sheet'|'hole'}]
pfRoomAt(x, z)      // room or null
// events: protoEmit('exit') when Ray goes through the opened stairs
```

**Props (H)**
```js
prop(kind, parent, x, z, yaw, opts)
// returns {solids:[{x0,z0,x1,z1,y0,h}], hides:[{kind,x,z,yaw,w,d,h}]} in world space; draws the visuals into parent
// kinds: 'bed','wardrobe','tub','sofa','cardtable','kitchen','fridge','tv','mattresses','laundry','shelf','chair','table','pipeburst','rebar','sheeting','exitchain'
PROP_DIMS[kind]     // {w, d, h} so F can lay out before H's models exist
```

**Weapons table (B and H)** — optional fields every melee item may carry:
```js
mass: 0.4,                         // kg; drives weight lag
strike: [{a:[x,y,z], b:[x,y,z], r:0.03, kind:'edge'|'point'|'blunt', n:[x,y,z]}]  // capsules in item space; n = edge direction for 'edge'
tool: 'cutter'|'keys'|'medkit'|'rounds'   // non-weapon items
```
New keys from H: `pan`, `hammer`, `pipe`, `cutter`, `keys`, `medkit`, `rounds`. Add new keys to `WPN_KEYS` if the rack/board needs them.

**Telemetry (J)**: listens to events. Anyone can add `protoEmit('stat', name, value)` for a number worth logging.

## 7. How to work

1. You are in your own worktree on your own branch. Commit there with clear messages. **Do not push, do not merge, do not touch other branches.** The lead merges.
2. **Do not commit generated files.** `./build.sh` rewrites `index.html`, `train.html`, `meridian.html`, `houses.html`, `puerto-seco.html`. Before each commit run `git checkout -- index.html train.html meridian.html houses.html puerto-seco.html`.
3. Keep edits to shared files (`50-game.js`, `52-senses.js`, `60-weapons.js`, `30-floor.js`, `66-tower.js`, `69-standoff.js`) small and surgical so merges stay easy. Put new systems in your own file. Don't reformat or reorder code you didn't change. Don't redeclare an existing function in your own file to override it.
4. Match the code style: compact, comment the *why* in plain words, no frameworks.
5. Prefer reusing what exists: the wound system, `bark`, `vox`, `sfx`, `buzz`, `noise`, `setAware`, `navTo`, `sightClear`, `addDecal`, `spray`.

## 8. Testing

**Machine limits: 2 CPUs, 7 GB RAM, shared by ten agents.** Run at most one headless Chrome at a time, close it as soon as you're done, keep runs short, avoid screenshots except to check visuals.

- Build: `./build.sh` (must print `syntax ok` five times).
- Boot check: `node tools/harness/boot.js index.html "f=1" "f=1&proto=1"` (zero errors required, and the old game must still boot).
- `tools/harness/*.js` are the review bots (walk-through, pistol fights, duels, sight/hearing, siege, wounds, screenshots). Read their headers. They step the game's own `update()` with rendering off. Three things they get right that you must too:
  - set `window.requestAnimationFrame=()=>0` and call `update(dt, performance.now())` yourself;
  - call `updateWorld(world, null)` after each step, or head hits don't register;
  - replace `setTimeout` with a queue run on game time, or timers fire wrongly when stepping fast.
- Playwright: `require('/opt/npm-tools/node_modules/playwright')`, Chrome at `/usr/bin/google-chrome` with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --no-sandbox`.
- You cannot test VR feel, haptics, comfort or Quest frame rate here. Simulate what you can (e.g. scripted hand poses for melee), and list plainly what needs Kenny on the Quest.
- Performance: budget your system's per-frame cost. Anything per-enemy per-frame must be cheap; no allocations in hot loops where avoidable.

## 9. Your final report (your last message)

1. Branch name and commit list.
2. What's done, mapped to your section of the plan.
3. What's not done or cut, and why.
4. Contracts: anything you exposed or expected beyond section 6.
5. Shared files you edited and which functions (so the lead can merge).
6. How you tested, with numbers.
7. What Kenny must test on the Quest, as short steps.
