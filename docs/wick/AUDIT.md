# Wick: audit of every `PROTO.on` check

`?wick=1` sets `WICK.on` and `PROTO.on` (src/06-wick.js), so the hitman prototype runs on the horror prototype's systems. This lists every `PROTO.on` check (about 130, in 24 files, as of commit caed560) and what Wick does with it.

- **Keep:** Wick wants the prototype's behaviour as it is.
- **Retune:** keep the system, change its numbers through a `WICK.<system>` table.
- **Change:** different behaviour under `WICK.on`. The check becomes `PROTO.on&&!WICK.on` or similar.
- **Off:** the system stays in the code but is not used on the Wick floor.

The stage is the one in the plan (`docs/wick/PLAN.md`, a copy of the project doc `claude/prototype-plan.md`, section 10) that does the work.

**Since stage 1 (2026-11-16):** the level is a linear route in beats run by a director (Bayhem's pattern), not an open floor; the club is drawn in Stairwell's own style; FLOOR.mode is `'wick'` on the club, so every check on `FLOOR.mode==='proto'` (notice meter, fight rooms) needs a `'wick'` branch where Wick wants it.

## Violence is fun, not horror (Kenny, 2026-11-16)

The horror prototype makes violence hurt to watch. Wick keeps the bodies and wounds and cuts the suffering. Plan section 2c.

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `50-game.js` `LINES.beg`, `69-standoff.js` `plead`, pose `beg`/`downbeg`/`kneelup` | Men beg on their knees | Off: grunts, swearing, shouting only | 4 |
| `63-grapple.js` `HOSTAGE_LINES` | "I got kids, man" | Change: tough-guy lines to his friends ("Shoot him! Shoot him!") | 4 |
| `88-wounded.js` begging, screams, calling for friends, slow crawling | A man down is loud and pitiful for a minute | Change: a man down raises his gun or dies within seconds | 4 |
| `70-wounds.js` shock, downed reactions | Long shock states | Retune: short | 4 |
| `50-game.js` bleed rates (`LOSS`, wound bleed) | Bleeding out is slow and visible | Retune: fast; a second body shot finishes | 2 |
| `50-game.js` hit push (`op`, `kickV` on hits) | Kept small (Kenny's Stairwell rule: no spinning when shot) | Retune: stronger push per weapon; shoulder hits turn him, shotgun throws him | 4 |
| `50-game.js` sever, `CUTS` | Limbs lost in the horror sense | Keep; shotgun close range used for spectacle | 4 |
| `69-standoff.js` surrender | Common, drawn out | Retune: rare and short | 4 |
| `55-voice.js` `vox` agony, plead, cry | | Off under Wick; keep shout, grunt, pain | 4 |
| Headshot | Instant kill | Keep; add crack sound, mist, wall splash, head snap | 6 |

## Done in stage 0

| Where | What | Now |
|---|---|---|
| `50-game.js` `toggleSlow` | Bullet time blocked in the prototype | Allowed with `WICK.on` |
| `50-game.js` left stick click | Crouch in the prototype, bullet time otherwise | Bullet time with `WICK.on` |
| `80-ray.js` reset | Hides the slow-mo buttons | Kept visible with `WICK.on` |
| `00-head.html` CSS | `body.proto` hides the slow-mo buttons | `body.proto.wick` shows them |

Bullet time is a plain toggle for now. The meter is stage 2. In VR it is on the left stick click only: A/X stays reload, as Kenny decided.

## Player (80-ray.js and its hooks)

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `50-game.js` `hurtPlayer` → `rayHurtDmg` | Damage by weapon and body part, cover absorbs | Retune: 25-30 per pistol hit, four blocks of 25 | 2 |
| `50-game.js` regen line | No regen | Change: the current block refills after 4 s | 2 |
| `80-ray.js` reset | 75-100 hp, one spare magazine of 7 | Retune: 100 hp, suppressed pistol with 12, two spare magazines, a knife | 2 |
| `60-weapons.js` `rayCanLoad`, `rayLoad` | Reload only from what you carry | Keep, with Wick's magazine counts | 2 |
| `50-game.js`, `63-grapple.js` `rayDropRounds` | A dead man's gun has 2-6 rounds | Retune: a gun of a type you carry gives a magazine | 2 |
| `50-game.js` A/X → `rayABTick` | Tap reloads, hold counts rounds | Keep (decided) | — |
| `80-ray.js` hurt listener, `raySpeedK`, `rayStickK` | Wounds: bleeding, leg slows, arm sways | Retune: leg and arm effects last 10 s, no bleed-out | 2 |
| `50-game.js` `rayHandFx` | Knock from hits, arm sway, the shakes | Retune: keep the knock, drop the shakes | 2 |
| `60-weapons.js` `rayGripCloth` | Tear a strip from a sheet to bandage | Off: block regen replaces bandaging | 2 |
| `60-weapons.js` `rayTakeLoose` | Loose rounds into the pouch | Keep | — |
| `80-ray.js` blood on hands, flat-screen use key | | Keep | — |
| `50-game.js` HUD ammo text | `ammo | spare` | Keep | — |

## Melee and close work

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `81-melee.js` stamina | Swings tire you | Retune: a professional tires slower | 3 |
| `81-melee.js` everything else | Applies everywhere already (bug fixes) | Keep | — |
| `82-clinch.js` enemies grab you | Wrist, collar, tackle, choke | Keep, retune later if it slows the pace | 4 |
| `84b-close.js` `closeMove` | Close-range enemy moves | Keep | — |

## Enemies fighting (84-fight.js, 84c-squad.js, 69-standoff.js)

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `50-game.js` `fightAimPt`, `fightSense`, `fightMove`, `fightSwing*`, aim turn | Aim at your real head, muzzle flash reveals you, wind-ups, feints | Keep | — |
| `50-game.js` `fightMayFire`, `fightCdMul`, `fightPHit`; `84-fight.js` `fightToken` | One shooter at a time, accuracy by range | Retune: two shooters beyond 3.5 m | 4 |
| `50-game.js` rage on a friend's death, friend barks | | Keep; fear lines build on it | 4 |
| `69-standoff.js` `psychOf`, `fightNerve`, `fightSurr` | Nerve table, fakers, quitters | Keep; basis for "they're afraid of you" | 4 |
| `84c-squad.js` squad tick, wary | Squads, "he's out of ammo" | Retune for pushing | 4 |

## Senses and hunts (52-senses.js, 83-hunt.js, 83a-director.js, 83b-notice.js, 66-tower.js)

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `52-senses.js` `huntNoise`, `83-hunt.js` `GUN_LOUD`/`GUN_SUP` | Noise radius by kind, halved per wall; suppressed pistol 3.5 m | Keep | — |
| `52-senses.js` `huntSight`, `huntPerceive`, `83b-notice.js` | Notice meter, sight in the dark | Keep: this is the stealth half | — |
| `83b-notice.js` `ntcTick` | Runs only when `FLOOR.mode==='proto'` | The club floor must keep that mode or this check changes | 5 |
| `52-senses.js` body found → `huntAlert('body')` | Calls the name, starts a hunt | Change: goes loud | 4 |
| `52-senses.js` `huntHeard`, `huntLookJob`, `huntTakeOver`, `giveUp`, `huntGoal` | Calm → hunting → on edge; searches | Change: per beat, quiet or loud (the director, plan 6.1); loud never ends; no searching | 4 |
| `83-hunt.js` `huntTick`, `huntAlert`, flashlights | Hunt controller, search grid, flashlight pair | Change: replaced by the director's beats, the loud push and per-beat waves | 4 |
| `83a-director.js` | Hunt pacing and breathers | Off | 4 |
| `66-tower.js` hunter caps, `twHoldSpot`, `twBrace`, push-now | Two hunters at most, holders come out together | Retune for pushing | 4 |
| `58-mic.js` | Headset mic: a shout brings them | Off by default on the start card | 6 |

## Hiding (86-hide.js)

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| Hiding spots, `rayConcealment`, `hideProbe`, hung sheets | The hunted man's verbs | Off: no spots placed on the club floor. Hung sheets reused for curtains | 5 |
| Crouch toggle (C, left stick click) | | Off: the stick click is bullet time. Real crouching still lowers your head | 0 (done) |
| `30-floor.js` under-bed clearance | | Keep (harmless) | — |

## Wounded men (88-wounded.js, 70-wounds.js)

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| Crawling toward a gun or a friend, roll-over substep, down modes | | Keep: a man down can still shoot | — |
| `wdCivReact` tenants | | Off: no civilians in the prototype | — |

## Floor, props, shell, guide

| Where | Prototype | Wick | Stage |
|---|---|---|---|
| `30-floor.js` walker radius `PF_WALK_R` | | Keep | — |
| `66-tower.js` `towerBoot` | Starts on floor 01 | Keep until the club floor exists, then load it | 5 |
| `85-pfloor.js` | Floor 01's builder | Not used: the club has its own builder (`91c-wick-club.js`), and the level is a route (plan section 7) | — |
| `87-props.js`, `87c-clutter.js` | Kitchen knife model, throwables | Keep | — |
| `89-shell.js` | Start card, death card, end card, telemetry | Retune: new title, new stats, rank | 6 |
| `90-guide.js` | Horror tutorial hints ("hide", "listen") | Off | 6 |

## Stage 0 check

Every old level, the horror prototype (`?proto=1`) and `?wick=1` boot with zero errors (`tools/proto/boot-all.js` plus `?wick=1` and `?wick=1&stress=16&salert=1`).
