# VR John Wick prototype: build plan

Written 2026-11-16. Replaces `integration-plan.md`.

## 0. The prototype in one paragraph

One level, about 10 minutes, played as a route through a private club after closing, beat by beat like a scaled-down Bayhem level. You are a professional hitman sent to kill one man. The first beats are quiet: a suppressed pistol, men picked off before anyone sees you. Then it goes loud: men push you, waves come in, and you fight at arm's length: grab, shoot, take the gun off the body, keep moving. It ends in the target's glass office over the main floor. You can take three or four hits. Vibe reference: Gunman Contracts. Power level: between Stairwell (prey) and Bayhem (one-man army).

**What "good on the first try" means here.** Nothing goes on the headset until it has passed a screenshot gate (section 3) and a bot gate (section 10). Kenny sees pictures on his phone before any gameplay is built on top of the look. What that cannot cover: how the guns, holsters and grabs feel in the hands. That only shows on the Quest, so section 11 is a short tuning list rather than a promise.

## 1. Decisions

| Decision | Choice | Status |
|---|---|---|
| Reload | Stairwell's existing reload: point the gun at the floor for half a second, or A/X | **Decided by Kenny** |
| Look | **Stairwell's own style** (its character build, painted textures and PSX grain), dressed and set for a grounded mix of Jason Bourne, John Wick and Craig-era Bond. The stylised builds and the neon-luxury direction were tried and rejected. Section 3 gets rewritten to match | **Decided by Kenny, 2026-11-16** |
| First priority | The player feels cool (section 2b) | **Decided by Kenny** |
| Level structure | A linear route in beats, run by a director (Bayhem's pattern), as Gunman Contracts does it: area by area, stealth allowed in some beats, waves in others. Not an open floor (section 7) | **Decided by Kenny, 2026-11-16** |
| Violence | Fun, not horror: fast kills, big reactions, no suffering (section 2c) | **Decided by Kenny** |
| Where it lives | A fork of `stairwell`, rules behind `?wick=1` | Default, open to change |
| Setting | A private club after closing | Default, open to change |
| Player | A new, original hitman | **Decided by Kenny** |
| Bullet time | On a meter, refilled by kills | Default, open to change |
| Name | Working title only: "Night Contract" | Needs Kenny's pick; no film names or characters |

## 2. What already exists, and what is new

Checked in the code, not assumed.

| Need | State in Stairwell | Work |
|---|---|---|
| A gun in each hand | Exists: each hand holds one thing, each trigger fires its own gun | None |
| Reload | Exists: point at the floor for half a second, or A/X | Keep; one guard for holsters (5.2) |
| Suppressors | Exist: screw on and off, pistol heard to 3.5 m, no flash | Art polish |
| Headshot kills | Exist (`DMG.head.gun.kill`) | None |
| Guns off bodies | Exists: grip grabs from a body or the floor | Ammo merge rule |
| Gun wrestling, wall pin, hostage | Exist (`63-grapple.js`) | Tune for speed |
| Bullet time | Exists: 22% speed toggle, film look, muffled sound, heartbeat | Add the meter, new grade |
| Notice meter, hearing through walls, hunts | Exist (`83-hunt`, `83b-notice`, `52-senses`) | Re-tune: hunts become pushes |
| Squad roles, flanking, one shooter at a time | Exist (`84-fight`, `84c-squad`, `twFlank`) | Re-tune for aggression |
| Room-based floor builder | Exists, but its room table is hard-coded for floor 01 (`PF_ROOMS`) | Make it take a floor definition |
| Cast kit, painted heads, suits | Exist (`houses/43-castkit`, the engine's head painter) | New crew, 8 heads, all original |
| Run stats and end card | Exist (`89-shell`) | New stat names |
| Holsters | Missing | New |
| Director beats and waves | Missing in Stairwell (Bayhem has both) | New, Bayhem's pattern rewritten (6.1) |
| Breakable set dressing | Windows only | Bottles, glass, lamps |

**Technical catch.** About 130 rule checks across 24 files are gated on `PROTO.on`. This game wants most of those systems (melee fixes, notice, fight, props, floor builder) and rejects a few (scarce ammo, no regen, hiding as the main verb). Plan: `?wick=1` turns the prototype systems on and sets `WICK.on`, and each rule that differs reads its numbers from a `WICK.<system>` table. Stage 0 audits every gate and lists which way it goes.

## 2b. The point of the whole thing: the player feels cool

Kenny's words: "I WANT TO FEEL COOL." Every system below is judged against that first. Looking cool on a screenshot is section 3; this is about what it feels like to be him.

### Never fumble
A fumble kills the feeling faster than dying does.
- **Hands are magnetic.** Grabbing a gun, a man or a holster snaps from a generous distance. No pixel-hunting on the floor mid-fight.
- **Guns never snag on the room.** A held gun passes through walls and furniture instead of catching. Gunman Contracts gets criticised for exactly this.
- **Reload is one motion** (Kenny's choice), so you never stand there fiddling.
- **Close headshots are generous.** Inside 6 m the head's hit area is a little larger than it looks. Past that it is true to size.

### Easy to do, great to watch
- **Throw the empty gun.** Out of rounds, let go with your hand moving and it flies at him. A hit to the head staggers him for a second.
- **Shield, then shoot over his shoulder.** One grab, and the other hand is free to fire.
- **Strip and use.** Take a man's gun out of his hand and it arrives already pointed forward, ready to fire.
- **Bodies fall well.** Men near the bar go over it, men near glass go through it, men against a wall slide down it. Placed so it happens often.

### The game notices
- **The last man in a room dies in one second of slow motion.** Free, automatic, does not use the meter.
- **They are afraid of you.** As their numbers drop the lines change: from orders, to shouting your name, to one man backing away with his hands up. The target bargains.
- **The music is on your side.** When it goes loud the club track does not cut out. It gets louder and the bass comes in.
- **A rank on the end card,** from the run's headshots, quiet kills, close kills and hits taken. One word, large.

### The entrance
The first twenty seconds set it: rain in the alley, your cuffs and gloves in view, the bass through the wall, one man with his back to you. The first kill should be nearly impossible to mess up.

### Stretch, only if it is cheap
One mirror in the bar or the office washroom that shows you in the suit. It needs a player body and a second render of one room, so it is measured at stage 0 and dropped without argument if it costs frames.

## 2c. Violence is fun here

Kenny's call: in Stairwell violence is horror; here it is fun. Same bodies, same wounds code, opposite tone. Stairwell makes you sit with what you did. This game moves you on to the next man.

### Quick and decisive, not drawn out
- **No begging, no agony.** No pleading lines, no "I've got kids", no long screams, no men crawling and crying. A hit man grunts, shouts or swears, then drops or fights on.
- **Down men are a threat, not a tragedy.** A man on the floor raises his gun and has to be finished. No bleeding out over a minute.
- **Kills land in a second.** A headshot or a second body shot ends it. Nothing twitches for long.
- **Surrender is short and rare.** Late in the fight one man may back off with his hands up, then go for a gun; it reads as a tough-guy beat, not a plea.

### Punchy and readable
- **Bigger hit reactions.** Stronger push on every hit, so each shot visibly moves a body: a shoulder hit spins him a quarter turn, a shotgun blast throws him a step back. This deliberately breaks Stairwell's "no spinning or jumping when shot" rule, which stays in Stairwell.
- **The headshot is the best sound in the game:** a sharp crack, a pink mist puff, a big splash on the wall behind, the head snaps back, the body folds.
- **Bodies go places.** Over the bar, through a glass table, down the stairs, through the office glass, slid along the polished concrete. The route is laid out so this happens often (section 7).
- **The shotgun takes limbs at close range.** The sever code exists; it gets used for spectacle, close and loud.
- **Blood is bright and big** against marble, glass, white tile and white shirts. Decals stay. No gore toggle in the prototype.

### Moves that are fun to pull off
- **Gun throw, pistol whip, shield, strip and use, throw a man** (section 2b and 5.3).
- **Knife in the close fight:** stab registers on the first contact, one or two stabs kill, the knife comes out clean.
- **Kick:** the existing kick sends a man staggering into a wall, a table or another man, setting up the next shot.
- **Environment:** shoot a pendant light out, shoot the bottles above a man's head, shoot out the office glass. Breakables also double as cover that disappears.

### The game rewards it
- **Kill chains:** kills less than 2 s apart build a chain shown on the watch; each link refills more bullet time.
- **Last-man slow motion** and the **end card rank** (section 2b), scored on headshots, close kills, chains, environment kills and how few hits you took.
- **Feedback:** strong haptic on every kill, a deeper one on a headshot, a heavy one on a chain of three.

### What stays from Stairwell
The physical bodies, the per-part wound system and the meat of the impacts. They are the reason kills feel weighty. Only the suffering is cut.

## 3. The look

Approved at art gate A on 2026-11-16, third pass. Two earlier directions were rejected: neon and luxury on a stylised character build (still looked like Stairwell, and too camp), then two rebuilt character styles (too blocky, then not good).

### 3.1 Direction
Drawn in Stairwell's own style (its character build, painted faces and textures, PSX grain). Its identity comes from the setting and wardrobe instead: grounded, a mix of Jason Bourne, John Wick and Craig-era Bond.

| | Stairwell | This game |
|---|---|---|
| Place | A grimy tenement | A clean modern club: polished concrete, board-formed concrete walls, dark timber, black steel, glass |
| Light | Dim bulbs, flashlights | Practical lights: warm pendants, a backlit bottle wall, the city through tall windows, one small red sign |
| Enemies | Tracksuits and vests | Hired security: charcoal, navy and black suits with open collars, an overcoat, a leather jacket, roll-necks, earpieces |
| You | A hurt cop, taped hands | Bare hands, a charcoal sleeve with a white cuff, a steel watch, a suppressed pistol |
| Wear | Grime everywhere | Clean, until the fight wrecks it |

**The idea that carries it:** a clean room, and what it looks like ninety seconds later. In Stairwell the mess was there before you arrived. Here you make it.

### 3.2 Rules for every space
- **One motivated key light**, warm or cold; colour used sparingly.
- **Dark, but readable:** enemies must stand out against a lit surface from the way you come in.
- **Each space has one thing you remember it by:** the bottle wall, the city windows, the kitchen pass, the glass office.
- **No strobing or flashing light** (comfort).
- **Light budget:** 8 point lights per vertex, nearest 8 chosen per frame. With a route, only the current beat's lights matter.
- **PSX look in VR:** colour depth, dither, nearest filtering, low-res textures. No vertex wobble and no affine warp (Kenny's rule).

### 3.3 Still to improve (from the gate A shots)
- The city in the windows is a coarse repeating texture: needs a proper skyline.
- The hands shot is weak: the sleeve and watch don't read.
- The office needs its glass wall over the main floor (section 7).

## 4. Rules (`WICK.rules`)

| Rule | Value to start | Note |
|---|---|---|
| Health | 100, in four blocks of 25 | |
| Pistol hit on you | 25 to 30 | Three or four hits |
| Regen | Only the current block refills, after 4 s without being hit | Mortal, but no medkit hunt |
| Wounds on you | A leg hit slows you for 10 s; an arm hit widens your spread for 10 s | Reuses Ray's wound code, with timers |
| Headshot on them | Always drops | Exists |
| Body shots on them | Two pistol rounds put a man down; he may still shoot from the floor | Uses the wounded system, and gives the double tap a reason |
| Start kit | Suppressed 9 mm with 12 rounds, two spare magazines, a knife | |
| Ammo | A picked-up gun of a type you carry gives its rounds as a magazine | |
| Enemy shooters | Two at a time beyond 3.5 m, everyone inside it | Stairwell uses one |
| Death | Short card, fade, restart the floor | Exists |

### Bullet time
- A meter holding 4 seconds, shown on the watch on your left wrist (3.1b).
- Left stick click toggles it (A/X stays reload). It drains in real time and switches off when empty.
- Refill: 25% for a kill, 40% for a headshot kill, nothing over time.
- World speed starts at the existing 22%. Try 30% if aiming feels too easy.
- New grade: cold steel-blue instead of Stairwell's warm film wash (3.1).

## 5. Hands

### 5.1 Holsters
- Three slots that follow the body, not the head: right hip, left hip, and the back for a long gun.
- Let go of a gun inside a slot and it stows with a haptic tick. Grip in an empty hand near a slot draws it.
- Letting go anywhere else drops the gun, as today.
- Body direction comes from the head's yaw smoothed over half a second, so looking around does not move the holsters.

### 5.2 Reload (unchanged from Stairwell)
- Point the gun at the floor for half a second, or press A or X. It works with a gun in each hand.
- Reloads draw from the spare magazines you carry; when those are gone you need a gun off a body.
- Shotgun keeps its pump. Revolver keeps one round at a time.
- Hold A or X still counts rounds by feel.
- **One guard:** lowering a gun to a hip holster also points it at the floor. A gun inside a holster zone does not start a reload.

### 5.3 Close work, tuned faster
- **Gun strip:** win the existing gun wrestle in under a second when he is hurt or stunned.
- **Shield:** the existing hostage hold; his friends hold fire for 1.5 s, then shoot through him.
- **Pistol whip:** the existing bash, with a stun long enough to follow with a shot.
- **Throw:** let go of a grabbed man while your hand is moving and he goes that way.

## 6. Enemies and the director

### 6.1 The director (Bayhem's pattern, rewritten for this engine)
A list of beats run in order (Bayhem's per-level `director.js`; its code is three.js and doesn't copy over, so the pattern is rewritten here, roughly 150 lines plus the club's beat list). Each beat has:
- **enter():** who spawns and where, a line, the music level, a set piece.
- **A marker:** where you're heading next, shown lightly on the watch.
- **What moves it on:** reaching the marker (Bayhem's rule: never wait for every enemy to die) **or** clearing the space (Gunman Contracts' rule). The last-man slow motion (2b) doubles as the "space clear" signal.
- **quiet: true or false:** whether stealth is possible in this beat.
- Men still close keep fighting into the next beat; men left far behind drop out.
- Only the current beat (and the next one's men, posted but asleep) are awake, so the Quest's enemy limit applies per beat, not per level.

Stairwell's own hunt director (`83a-director.js`) is switched off under `?wick=1`.

### 6.2 In a quiet beat
- Men stand posts, talk, smoke, walk short loops. The notice meter fills with sight and sound.
- A body found, an unsuppressed shot, or a man who sees you and survives: the beat goes loud, and so does the next one.
- Kill a man who noticed you before anyone else does, and you're still quiet (Gunman Contracts does the same).

### 6.3 In a loud beat
- Two men push straight at you, one or two go round, the rest hold cover. No searching, no hiding spots.
- The beat's waves come in from its doors on a timer or a trigger.
- Men call out what they see, so you hear the plan before it arrives.

### 6.4 The cast
About 20 men across the level, never more than about 8 awake at once (stage 0's headset test sets the real number). The ten from gate A are the faces: floor security in suits, two close-protection men with MP5s, two door men (overcoat with a shotgun, leather jacket with a pistol), the kitchen hand with a knife, and the target, Valentin Sorel, with a revolver. Waves reuse the floor-security suits with different heads.

## 7. The route

About 10 minutes. Built round the three spaces from gate A; the rest are new.

| # | Beat | Space | Quiet? | What happens |
|---|---|---|---|---|
| 1 | Way in | The alley | Yes | Rain, one man smoking by the kitchen door with his back to you. The first kill is nearly impossible to miss. |
| 2 | Kitchen | Kitchen | Yes | The kitchen hand and one guard. Music through the wall. |
| 3 | Service corridor | Corridor and stock room | Yes | Two men, a camera's blind spot, a body to deal with. |
| 4 | Behind the bar | The bar | Goes loud here at the latest | You come out behind the bar. The bartender dives for a shotgun under the counter. The music swells. |
| 5 | The floor | Main room | Loud | The main fight: men from the booths and the lobby, cover behind the bar and the columns, a wave through the front doors. |
| 6 | The stairs | Stair to the mezzanine | Loud | A wave comes down at you; the stairs are the choke point. |
| 7 | The office | Glass office over the floor | Loud | The target and his two bodyguards. The glass wall shatters. Last-man slow motion on him. |
| 8 | Out | Back down, through the front | — | Walk out past what you did. End card. |

- **The marker** for each beat is a doorway or a spot, never "kill everyone".
- **Openings have no doors that need hands** (Kenny's rule): arches, curtains, a door that is already open, or one the director opens.
- **Dying restarts the beat**, not the level.
- **The level is built along the route,** so only what you can see from the path needs dressing.

## 8. Sound

- **The club's music** plays in the main room at low volume, heavy on bass, and is muffled by each wall between you and it. It tells you where you are and covers footsteps near it.
- **Suppressed shot:** a cough with the slide's mechanical clack on top. The clack is what makes it satisfying.
- **Per-surface impacts:** flesh, wood, tile, glass, steel.
- **Each man is audible before he is visible:** shoes on marble, a lighter, a phone call, ice in a glass.
- **Loud state:** the music swells and the bass comes in (2b). It ducks under bullet time and comes back when you drop out of it.

## 9. Feedback on every kill and hit

- Haptic on every shot, reload, holster, grab and hit taken.
- Hit on you: a direction mark at the edge of view and a controller buzz. No red screen wash and no vignette.
- Bottles, glasses, mirrors, the office glass and lamps break. A shot-out lamp makes its room darker, which helps you.
- Blood stays on walls, floor and your gloves.
- End card: time, kills, headshots, accuracy, quiet kills, times hit, bullet time used.

## 10. Build order, files and gates

New files sort before `99-end.js` and are picked up by `build.sh`.

| Stage | Work | File | Gate |
|---|---|---|---|
| 0 | Fork, `?wick=1`, audit of every `PROTO.on` check, stress spawn for the enemy cap, baseline boot of all old levels | `06-wick.js` | Old game and horror prototype boot with zero errors |
| 1 | The look: hands, guns, cast, three rooms, art page | `91-wick-art.js`, `src/wick/` | **Art gate A** (3.5) |
| 2 | Rules: health blocks, ammo, bullet time meter | `92-wick-rules.js` | Rule bots |
| 3 | Hands: holsters, the reload guard, magnetic grabs, no snagging, gun throw, faster close work | `93-wick-hands.js` | Hand rig, scripted poses |
| 4 | The director and enemies: beats, quiet and loud beats, pushing, waves, the target, fear lines, last-man slow motion; no begging, short downed state, bigger hit reactions, kill chains | `94-wick-director.js`, `94b-wick-ai.js` | Fight bots, beat bot |
| 5 | The route: alley, corridor, stairs, glass office added to the three spaces; dressing, breakables, sound | `95-wick-route.js`, `96-wick-dress.js` | Route bot |
| 6 | Feedback pass, start card, end card | `97-wick-shell.js` | **Art gate B:** 12 in-game shots and a 30 s film, same bar as gate A |
| 7 | Headset build to Kenny | | Section 11 |

Stages 2, 3 and 4 can run in parallel once stage 1 passes. Stage 5 needs stage 1's kit.

### Bot checks before the headset

| What | How | Pass |
|---|---|---|
| Not a power trip | Pistol bot playing every beat loud, 20 runs | Dies at least once in 30 to 50% of runs |
| Stealth is real | Bot playing beats 1 to 3 with suppressed headshots | Reaches beat 4 unseen in at least 60% of runs |
| Stealth is not free | Same bot, unsuppressed | Alarm every run |
| Push works | Time from a beat going loud to the first enemy within 5 m of the player | Under 12 s |
| Never stuck | Route bot, every beat | Every beat moves on by its marker or by clearing; never waits on a straggler |
| Close range matters | Kill-distance log | Over 60% of kills inside 6 m |
| Run length | Walk-through and fight bots | 6 to 12 minutes |
| Frame cost | Step time at the busiest beat | Within the measured Quest budget from stage 0 |
| Nothing broken | All old levels and the horror prototype boot | Zero errors |

## 10b. Stage 0 results (2026-11-16)

Branch `wick` on `stairwell`, commit "Wick stage 0". All 22 old levels, `?proto=1` and `?wick=1` boot with zero errors. The gate audit is `docs/wick/AUDIT.md` in the repo.

**Headless cost (sandbox CPU, not a Quest).** `tools/wick/stress.js`, all men awake, aware and fighting, 72 Hz steps:

| Live men | Frame ms (mean / p95) | Physics ms | Draw calls |
|---|---|---|---|
| 3 | 1.4 / 4.2 | 0.2 | 181 |
| 13 | 4.0 / 7.7 | 0.8 | 443 |
| 21 | 6.0 / 10.1 | 1.5 | 566 |
| 29 | 8.5 / 16.1 | 2.5 | 662 |

- About 0.3 ms of CPU per live man here, and only about a third of that is the body physics. The rest is AI. My earlier worry about the physical bodies was misplaced: thinking costs more than physics.
- About 15 to 25 draw calls per man.
- Sleeping men two rooms away cost almost nothing, so the cap is on men awake at once, not men on the floor.
- Unknown until the headset: how much slower the Quest's CPU is than this sandbox. Guess 2.5 to 4 times. At that, about 12 to 15 awake men fit in 72 fps.

**Kenny's headset test.** Open each, play 30 s near the men, read the wrist FPS:
`?wick=1&stress=6&salert=1`, then `stress=10`, `stress=14`, `stress=18`. The highest N that holds 72 sets the awake cap for section 6.3.

## 10c. Stage 1 status (2026-11-16): art gate A approved by Kenny (third pass)

View at `?wick=1&art=1` on branch `wick`. Shots in `docs/wick/shots/`.

**What was tried and rejected:** (1) neon and luxury on a stylised build: still looked Stairwell-adjacent; (2) characters rebuilt as hard slabs: too blocky; (3) rounded low-poly: not good. Decision: draw it in Stairwell's own style and get the identity from the setting and wardrobe.

**The current pass:**
- The club, grounded: polished concrete floor, board-formed concrete walls over dark timber, black steel trim, tall windows onto the city, warm pendant lights, a backlit bottle wall, one small red sign.
- The third room is the owner's office: desk under one lamp, city windows, sofa, shelves.
- Cast on Stairwell's build and painted faces: charcoal, navy and black suits with open collars, an overcoat, a leather jacket, roll-necks, earpieces.
- You: bare hands, charcoal sleeve with a white cuff, steel watch, the stock suppressed pistol.

**Not done:** no independent review; the hands shot is weak; the city window texture is coarse; the other six spaces and anything alive are later stages. The rejected character tests have been deleted.

## 11. What Kenny checks on the Quest

Bots and screenshots cannot judge these.
1. Frame rate on the left wrist in the main room with the alarm up. Target 72.
2. Holsters: can you stow and draw without looking down?
3. Holstering never starts a reload, and pointing down outside a holster always does.
4. Suppressed pistol: does a shot feel and sound good?
5. Bullet time: too generous or too stingy?
6. Three or four hits: fair, or does one burst end the run?
7. Grab, strip and throw: fast enough to chain?
8. Does any room look flat or empty from inside it?
9. Does it feel like a different game from Stairwell the moment you put the headset on?
10. Do kills feel fun, or still grim? Name the moment if grim.
11. **Did you feel cool?** If not, at which moment did it break: a fumble, a death that felt cheap, or a kill that looked flat?

Tuning without a rebuild: every number in sections 4 to 6 lives in a `WICK.<system>` table and can be set from the URL, for example `?wick=1&bt=6&hp=125`.

## 12. Not in the prototype

Hub, weapon customisation, hand-driven magazine reloads, a voiced handler, vehicles, more floors, civilians or a crowd, a story beyond the start card.

## 13. Risks

- **Body count versus frame rate.** The physical bodies are the heaviest thing in the engine. Measured first, at stage 0.
- **Clean is harder than grimy at this resolution.** Grime hides flat surfaces; gloss and marble show them. Light strips, panel lines and painted reflections carry the load, and gate A exists to catch it if they don't.
- **A route can feel like a corridor.** Each beat needs its own shape and at least two ways to approach the fight inside it.
- **Holster feel.** The most likely thing to need a second pass after the first headset run.
- **Two rule sets in one codebase.** The audit at stage 0 keeps the horror prototype untouched.
