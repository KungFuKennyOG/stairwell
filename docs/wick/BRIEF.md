# Wick stages 2, 3, 4: shared brief for every agent

Read this whole file, then `docs/wick/PLAN.md` (the build plan; sections 2b, 2c, 4, 5, 6, 7 are the design) and `docs/wick/AUDIT.md` (every `PROTO.on` check and what Wick does with it). Then read `PROTO_BRIEF.md` sections 3, 4, 6, 7, 8: the codebase tour, the event bus, the testing rules. They all apply here.

## 1. The game

A VR hitman game for Meta Quest 3 (WebXR), built by Kenny on Stairwell's engine. The prototype is one level: a linear route through a private club after closing, run beat by beat by a director, the way Bayhem levels are. Quiet beats first (suppressed pistol, picks before anyone sees you), then loud beats (men push you, waves, close-quarters gun-fu), ending in the target's glass office. About 10 minutes.

Tone: John Wick, Jason Bourne, Craig-era Bond. Grounded. **The player must feel cool** (plan 2b): never fumble, easy moves that look great, the game notices. **Violence is fun, not horror** (plan 2c): fast decisive kills, big hit reactions, no begging, no suffering. Power level: between Stairwell (prey) and Bayhem (one-man army).

Everything Wick runs behind `?wick=1`, which sets `WICK.on` **and** `PROTO.on` (`src/06-wick.js`). Gate every rule change on `WICK.on`. The 15-floor game and the horror prototype (`?proto=1`) must play exactly as before.

## 2. Kenny's fixed decisions (do not reverse)

- Reload stays as Stairwell has it: point the gun at the floor for half a second, or tap A/X. Hold A/X counts rounds by feel.
- Bullet time: left stick click (A/X is reload). It is a meter, not a free toggle.
- No vignette, ever. Never move or rotate the camera for effect. Smooth locomotion + snap turn.
- No vertex wobble or affine textures in VR.
- No doors that need hands.
- Quest 3 holds 72 fps. FPS is on the watch on the left wrist.
- The look is approved (plan section 3). Do not restyle the club or the cast. New things must match it.
- Never use the word for the old train art set, and reuse nothing from it.
- Never edit `index.html` by hand: `./build.sh` makes it.

## 3. What exists on branch `wick`

- `src/06-wick.js`: `WICK.on`, the `WICK.<system>` tables, `wnum(sys,key,def)`, URL overrides (`?w.<system>.<key>=n`, short names in its `SHORT` map: add yours). It sits before the engine's scope: it cannot call game functions.
- `src/91a-wick-tex.js` (club textures, `wkT()`, `wkM()`), `src/91b-wick-cast.js` (the cast: `ROSTER.wk_*`, `wkMakeChar(id,parent,grp)`), `src/91c-wick-club.js` (the club builder `wkBuild()`, `WK.rooms`, `wkRoomAt`, lights, `FLOOR.mode='wick'`), `src/91d-wick-art.js` (`?wick=1&art=1`: the club with the cast **posed, not alive**; `wkKit()` gives you the suppressed pistol; the watch on the left wrist).
- `src/98-wick-stress.js`: `?wick=1&stress=N`.
- `?wick=1` alone loads the horror prototype's floor 01 with Wick on (useful for testing rules and hands against live men today).
- Tools: `tools/wick/shots.js` (club screenshots), `tools/wick/stress.js`, `tools/proto/boot-all.js`, `/tmp`-free boot check pattern in `tools/proto/lib.js`.

## 4. Who owns what

| Agent | Stage | Branch | Own new files | Owns |
|---|---|---|---|---|
| **R** rules | 2 | `wick-rules` | `src/92-wick-rules.js` | Plan 4 and the rule parts of 2b/2c: health in four blocks of 25 and block regen; damage to you (25-30 per pistol hit); leg/arm wound effects on 10 s timers, no bleed-out, no shakes, no bandage tearing; the start kit (suppressed 9 mm with 12, two spare magazines, a knife on the belt); ammo: a gun of a type you carry gives a magazine; **the bullet time meter** (4 s, drains, refills 25% per kill, 40% per headshot kill, **kill chains** under 2 s apart add more and show on the watch); **`wickSlowBurst(sec)`**: a free slow-motion moment that does not use the meter (the director's last-man moment calls it); the watch face (FPS, meter, chain); the HUD text on the flat screen. |
| **H** hands | 3 | `wick-hands` | `src/93-wick-hands.js` | Plan 5 and the hand parts of 2b/2c: three holsters (right hip, left hip, back) that follow the body; the reload guard (a gun in a holster zone never starts a reload); magnetic grabs (guns, men, holsters snap from generous distance); held guns never snag on walls; throw an empty gun (hand velocity; a head hit staggers him ~1 s); strip a gun (wins in under 1 s when he's hurt or stunned; it arrives pointed forward, ready); the shield (his friends hold fire 1.5 s, then shoot through him); pistol whip with a stun long enough for a follow-up shot; throw a grabbed man with your hand's velocity; the kick sends a man staggering into walls/men; knife kills in one or two stabs; melee stamina retuned (a professional tires slower). Close headshots generous inside 6 m. |
| **D** director | 4 | `wick-director` | `src/94-wick-director.js`, `src/94b-wick-ai.js` | Plan 6 and the enemy parts of 2b/2c: **the director** (Bayhem's pattern: read `KungFuKennyOG/bayhem-vr` `src/beats.js` and `src/levels/port-of-victory/director.js` for the shape; rewrite it for this engine, roughly 150 lines plus a beat list); beats with `enter()`, a marker, `arrive` or `cleared` to move on, `quiet` true/false; quiet → loud per beat; dying restarts the beat; only the current beat awake; **`?wick=1&play=1`** loads the club (`wkBuild`) with **live** enemies and runs a test beat list on the three existing spaces (kitchen → main room → office; stage 5 adds the rest of the route); enemies: no searching, push your position, waves from doors, two shooters at a time beyond 3.5 m; **no begging, no agony, no pleading lines or poses; a man down raises his gun or dies within seconds; bleed fast; bigger hit push (shoulder hits turn him, shotgun throws him back); surrender rare and short; fear lines as their numbers drop; last-man slow motion (call `wickSlowBurst`) as the "space clear" signal**. The horror prototype's hunt, search, hiding and its director (`83a-director.js`) are off under `WICK.on`. Wire `FLOOR.mode==='wick'` into the systems that only run on `'proto'` where Wick needs them (notice meter, fight). |

### Contracts between you

Call across agents with a guard, because the others' code isn't on your branch: `if(typeof wickSlowBurst==='function') wickSlowBurst(1.2);`. Write a small local fallback if you need something that doesn't exist yet.

```js
// R (rules)
wickSlowBurst(sec)            // free slow motion, ignores the meter
WICK_BT = { t, max }          // the meter, seconds left
WICK_CHAIN = { n, t }         // kills in the current chain, time of the last kill
// events R emits:  protoEmit('wickChain', n)
// R listens to:    'death' (E.headshot tells a headshot), 'hurt'

// H (hands)
wickHolsters                  // [{slot:'hipR'|'hipL'|'back', item, pos()}]
wickInHolsterZone(h)          // true while a hand's gun is in a holster zone (R's reload guard reads it if R needs it)
// events H emits:  protoEmit('wickThrow', item, hit E|null), protoEmit('wickStrip', E), protoEmit('wickShield', E, on)

// D (director)
WICK_DIR = { beat, i, loud, t }      // the current beat
wickBeatRestart()             // dying restarts the beat (the shell, stage 6, will call it; call it yourself on death for now)
wickLoud(reason)              // the current beat goes loud
// events D emits:  protoEmit('wickBeat', beat), protoEmit('wickLoud', reason), protoEmit('wickClear', beat)
```

## 5. How to work

1. Make your own worktree: `git -C /home/claude/stairwell worktree add /home/claude/wt-<agent> -b <branch> wick`. Work only there.
2. Commit on your branch with clear messages; end every commit message with:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01764GRisgcGxrvjKzCBbktH
   ```
   Push your branch (`git push -u origin <branch>`). **Do not merge, do not push to `wick` or `main`, do not touch other branches.** The lead merges.
3. Do not commit generated files except `index.html` (the lead needs a buildable branch to test on the headset). Run `./build.sh` before committing so `index.html` matches `src/`.
4. Keep edits to shared files (`50-game.js`, `52-senses.js`, `60-weapons.js`, `69-standoff.js`, `70-wounds.js`, `80-ray.js`, `83-hunt.js`, `84-fight.js`, `88-wounded.js`, the `91*` files) small and surgical, gated on `WICK.on`. Put your system in your own file. Don't reformat or reorder code you didn't change. Don't redeclare an existing function to override it.
5. Match the code style: compact, comment the *why* in plain words, no frameworks. Numbers in a `WICK.<system>` table.

## 6. Testing

**Machine: 2 CPUs, 7 GB RAM, shared by three agents.** One headless Chrome at a time per agent, close it as soon as you're done, keep runs short. No screenshots unless you're checking something visual.

- Build: `./build.sh` must print `syntax ok` five times.
- Boot: `NODE_PATH=/opt/npm-tools/node_modules node tools/proto/boot-all.js index.html` (all 22 levels, zero errors) plus your own boots of `?wick=1`, `?wick=1&art=1` and (D) `?wick=1&play=1`.
- The harness rules in `PROTO_BRIEF.md` section 8 (requestAnimationFrame off, step `update()`, `updateWorld` after each step, setTimeout on game time).
- You cannot test feel, haptics or Quest frame rate. Simulate what you can and list what needs Kenny on the Quest.

## 7. Your final report (your last message)

1. Branch and commit list.
2. What's done, mapped to your rows in section 4 and the plan.
3. What's not done or cut, and why.
4. Contracts: anything you exposed or expected beyond section 4.
5. Shared files you edited, and which functions.
6. How you tested, with numbers.
7. What Kenny must check on the Quest, as short steps.
