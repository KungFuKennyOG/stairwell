# Stairwell: floor 01 prototype build plan

14 Nov 2026. Everything needed to get one polished, playable horror floor with melee that works. Agents: read `PROTO_BRIEF.md` first; it overrides this file where they differ (notably: **no doors**, see 7.1).

All numbers are starting values to tune on the Quest.

---

## 0. What the prototype is

**One floor that proves the game.** You arrive hurt on floor 01. Six men and three tenants are on it. Two of the men are walking it with flashlights looking for you. The stairs up are chained. You find the way to open them, hiding when the lights come, and when you're caught it ends in a fight at arm's length that feels heavy and real.

**Done means all of this is true on the Quest:**
- You cannot walk past the floor. Leaving takes a key or bolt cutter found on it.
- You get hunted, you can hide, and being found starts a struggle you can win or lose.
- Twenty deliberate melee hits in a row all land, stop on the body, and buzz your hand.
- A careful run takes 8 to 15 minutes. A careless one gets you killed.
- It holds 72 fps and nothing looks unfinished: no seams, no floating props, no placeholder text.

**How it ships alongside the current game.** A new entry on the start card ("Floor 01 prototype") and `?proto=1`. The 15-floor build stays untouched.

**Not in the prototype** (later): the other floors, the prologue rewrite, tower heat between floors, tenants who hide you, zip-cuffs, suppressor wear, the way back down.

---

## 2. Stage 0: safety net and baselines

1. **Prototype entry point.** Start-card button and `?proto=1`.
2. **Tuning table.** `PROTO.<system>` objects, so tuning is editing one place per system.
3. **Telemetry.** Per run: time on floor, deaths and cause, shots fired and hit, kill distances, time hidden, hunts started and their length, grabs and how they ended. Shown on the left wrist after a run and logged for the bots.
4. **Bots.** Walk-through, pistol fight, stand still, plus a new hide-and-sneak bot.
5. **Melee test rig.** A simulated VR hand that swings each weapon through a standing man at set speeds, angles and body parts, and reports how many swings registered. Run it first to get today's number before changing anything.

---

## 3. Stage 1: danger

### 3.1 Ray's health
- **No regeneration.** Remove the regen line in `update()` (`PL.hurtT>3.5` → `PL.hp+9*dt`) when `PROTO.on`.
- **Damage to Ray:** pistol torso hit 30, limb 15, head 70. About three torso hits kills.
- **Hit reaction without moving the camera:** Ray's virtual hands are knocked 15 to 25 cm off for 0.4 s, movement drops to 40% for 0.8 s, ears ring 1.5 s (`earRing` in `57-acoustics.js`).
- **Healing:** one or two first-aid items on the floor, 25 each.

### 3.2 Ammo
- **Novak's pistol:** 9 in the gun, one spare magazine with 7.
- **On the floor:** 6 to 12 loose rounds in two or three places. A dead gunman's pistol holds 2 to 6.
- **Reload:** only with rounds you have. `reloadHand` currently refills for free; draw from a carried count.
- **Counting by feel:** press the magazine release half-way for a haptic tick per round left. No HUD number in VR.

### 3.3 Bullet time
- **Removed.** The left-stick click becomes crouch (owned by G).

### 3.4 Enemy guns (owned by E)
- **Range caps gone.** Shotgun 7 m, pistol 9 m, SMG 11 m become 25 m for all.
- **Muzzle flash gives you away.** Any man with a line of sight to your flash knows exactly where you are and fires back at once, in the dark too.
- **First shot is the dangerous one.** First shot 0.6 to 1.0 s after he's sure. Pistol accuracy inside 4 m rises from 30% to 55%.
- **One shooter at a time.** Only one man fires at you; others move.

### 3.5 Tests
- Pistol bot, 20 runs on old floor 01 with `?proto=1&pf=0`: dies in 25 to 50% of runs.
- Kill-distance log: under 25% of kills from beyond 8 m.

---

## 4. Stage 2: melee that works

Kenny: hits don't register, no weight, very weak, should be like Saints & Sinners.

### 4.1 What's wrong today (from the code)
- `vrMelee` tests a blade at 2 or 3 points and a fist at 1 (`handPts`). The edge between points passes through arms and necks without a hit.
- A hit needs the *current frame's* speed above a threshold. Hands slow at contact, so real hits get downgraded to a "bump".
- Only the machete has weight (`WEIGHT={machete:16}`). Everything else is glued rigidly to the hand.
- Swings pass straight through the body. Nothing stops.
- `hitBlunt`: chest punches add stun but can never knock a man down; a head punch adds 0.42 "daze" and needs three to drop him.

### 4.2 The spec

**M1. Swept volume hit test (fixes "don't register")**
- Each weapon becomes a capsule along its striking length: fist (5 cm radius ball), knife blade, bottle, machete blade, pipe, gun butt.
- Each frame, sweep that capsule from last frame's pose to this frame's and test it against the body's capsules (`SEGS`), then confirm on the skinned mesh (`rayMesh`) for the exact point.
- Run the hand twice per frame so a fast swing can't skip through an arm.

**M2. Contact speed, done properly (fixes "bumps")**
- Use the fastest speed of the contact point over the last three frames, measured relative to the man.
- Delete the "too slow, it bumps off him" branch for anything above the push threshold.

**M3. Reactions in four tiers (fixes "weak")**

| Contact speed | Blunt | Blade |
|---|---|---|
| under 1.5 m/s | push: he's shoved, no damage | shallow cut only if drawn along him |
| 1.5 to 3.5 | hit: flinch, grunt, guard comes up | cut: bleeds, flinch |
| 3.5 to 6 | stagger: steps back, 1 s open | deep cut, stagger |
| over 6 | knockdown on head or jaw, or after two staggers in 3 s | chop: existing limb rules |

- Every tier from "hit" up has its own body reaction, sound and haptic.
- Body shots wind him: each one slows his next attack. Two head hits over 4 m/s drop him.

**M4. The weapon stops on him (fixes "no weight", part 1)**
- On any hit above 1.5 m/s the weapon holds at the contact point for 60 to 90 ms while the real hand keeps going, then catches up.
- Haptics: 40 ms full strength for heavy hits, 20 ms half for light ones.
- Only the weapon and his body pause. The camera never does.

**M5. Every weapon has weight (fixes "no weight", part 2)**
- The visible hand and weapon follow the real hand on a spring. Heavier weapons lag more and carry through.
- Knife near 1:1, bottle and pistol-whip light lag, pipe and machete clear lag, two-handed swings stiffer.
- Extends the machete-only lag in `meleeTick` to all weapons. Keep blade tilt 0° and hands out 5°.

**M6. Stabs.** Larger tip zone so point-first thrusts catch; damage grows as you drive deeper; a little resistance going in, more coming out. (Lodging, dragging, working the blade and ripping out already exist.)

**M7. Edge alignment.** Edge-first within about 35° cuts; flat-on is blunt.

**M8. Grab and stab.** Holding his collar or head with the other hand steadies him: hits always register and count one tier higher. Letting go throws him the way your hand was moving.

**M9. Stamina in the hands only.** Each hard swing costs 12%. Recovery 20%/s after 1 s rest. At zero the hand spring weakens by half. No meter. Gated on `PROTO.on`.

**M10. Enemy melee you can read (owned by E).** 0.4 s wind-up; one in five is a feint. Ray can catch a wrist or block with a held weapon.

**M11. Things to hit with (owned by H).** Frying pan, kitchen knife, bottle, hammer, pipe, plus machete and guns as clubs.

### 4.4 Done when
- **Rig:** 98% or more of swings at 1.5 m/s and above register, on every weapon and body part. Zero hits from swings that miss.
- **Quest:** twenty deliberate hits in a row all land with a stop and a buzz. A hard punch to the jaw staggers him. A pipe to the head drops him.
- **Frame time:** the swept test adds under 1 ms.

---

## 5. Stage 3: they hunt (owned by D, with E)

### 5.1 Noticing you takes time
- Seeing Ray fills a meter; losing sight drains it at half speed. Full means spotted.
- Lit Ray in plain view: 1.5 s calm, 1.0 s on edge, 0.6 s hunting. Within 2 m: 0.4 s always.
- **Peeking:** if only the head shows round an edge, three times as long.
- **Visible warning:** while the meter fills he stops, turns his head, says something ("...who's there?").

### 5.2 Light and sound
- Unlit Ray invisible beyond 2 m. On edge: 3 m for a man looking right at him.
- **Silhouette:** between him and a lit doorway counts as lit.
- **Hearing, halved per wall:** crouch-walk 1 m, walk 3, run 8, suppressed shot 10, unsuppressed shot whole floor, body falling 8, glass 15, begging 12, scream 20.
- **Mic:** whisper silent, talking 4 m, shouting 15 m. Only makes men come and look; never spots Ray by itself. Off switch.

### 5.3 The three states (one controller for the floor)

**Calm.** Routines. A noise or half-filled meter sends one man to look for 8-12 s, then back. Two of those inside 60 s starts a hunt.

**Hunting.** Starts on a sighting, a body, an unsuppressed shot, a tenant's scream. First hunt 75 s; each later one +30 s, up to 150 s. Pairs with flashlights work outward from the last known position; lit cells count as cleared. Each pair checks 2-3 hiding spots within 8 m of that point; a spot someone saw Ray enter is checked first. If Ray slips more than 6 m away unseen, steer the nearest pair that way. Ends on the timer with a line ("He's gone... stay sharp.").

**On edge (rest of the floor).** Everyone armed, patrolling short loops, faster to spot. After any hunt, no new hunt for 30-45 s unless Ray is actually seen.

### 5.4 Smaller fixes
- "You killed Beto!" only from men who saw it (E).
- 20 s of rage for a man who finds a named friend dead: charges, hits harder, aims worse (E).
- A man hurt early backs into a dark room and waits by the doorway with a blade for 15-30 s (E).
- Nerve on floor 01: 40% quitters, 50% fighters, 10% fakers. A quitter who watches a friend die becomes a fighter (E).
- Callouts that tell you things: "There's blood here." "He's limping." "Check the bathroom." (D)

### 5.5 Tests
- A hunt lasts 75-150 s and never chains into another without the breather.
- After a body is found, no man is ever idle at his post again on that floor.
- Stand-still bot in the dark after firing: found within 20 s.

---

## 6. Stage 4: the new floor (owned by F)

### 6.1 Shape
A hybrid: a short hall you can always get your bearings from, with two loops of rooms round it.
- **Size:** 36 m by 24 m.
- **Hall:** 16 m long, 2.2 m wide, in the middle. The longest view on the floor, 12 m at most.
- **Rooms:** 19, each 3 to 5 m across.
- **Stairs:** in at the south-west corner, out at the north-east.
- **Loops:** a south run of rooms and a north run, each parallel to the hall and joined to it at several points.
- **No three openings in a line.** Offset doorways so one step never exposes three rooms.

### 6.2 The rooms

South side, west to east:

| Room | What it is | Light | Who | Hiding |
|---|---|---|---|---|
| S0 | stair landing you arrive on | dim red | nobody | |
| S1 | empty front room | dark | | behind sofa |
| S2 | bedroom | dark | | under bed |
| S3 | TV room (landmark: you hear it) | TV glow | Rui | |
| S4 | bathroom, sheet in the doorway | dark | | tub curtain |
| S5 | Doña Chela's kitchen | dim | Doña Chela | |
| S6 | her bedroom | dark | | wardrobe |
| S7 | storage, mattresses | dark | | among mattresses |
| S8 | burst pipe (landmark: water sound) | dark | | |

North side, west to east:

| Room | What it is | Light | Who | Hiding |
|---|---|---|---|---|
| N1 | Dani's kitchen, Dunne's watch | lit | Dani, eating | |
| N2 | Dani's back room | dark | | under bed |
| N3 | Kev's room, window, neon outside (landmark) | neon | Kev on the phone | |
| N4 | card room | lit | Mario in the vest | |
| N5 | closet off the card room | dark | | inside |
| N6 | tenants' flat, sheet in the doorway | dim | two tenants | wardrobe |
| N7 | laundry, hung sheets | dark | | behind sheets |
| N8 | unfinished room, plastic sheeting, rebar | dark | | |
| NE | stair vestibule, chained door | dim red | | |

Tito and Jojo are the flashlight pair and have no room; they walk the loops. (Names and lines come from the current floor 01 definition in `src/66-tower.js`: reuse its people and its overheard talk.)

### 6.3 How rooms connect
- **South run:** S0 → S1 → S2 → S3 → S5 → S6 → S7 → S8; S2/S3, S3/S5 and S6/S7 are knocked-through walls you crouch through.
- **North run:** N1 → N2 → N3 → N4 → N6 → N7 → N8 → exit; N2/N3 and N4/N6 knocked through.
- **Onto the hall:** S1, S3, S5, S8 from the south; N1, N3, N6, N8 from the north.
- Every room has at least two ways out, except the bathroom and closet.

### 6.4 Getting out
- The exit is chained. It opens with a bolt cutter or Mario's keyring. Once the chain is cut it swings open by itself.
- The bolt cutter is in one of three places, picked each load: Dani's kitchen table, the storage room shelf, the unfinished room.
- Reaching the opened stairs fades to the end card (no walking up).

### 6.5 The builder
1. **Floor data as rooms.** Each room: rectangle, floor and wall style, light, furniture list. Each opening: which wall, where, kind (open, sheet, crouch hole).
2. **Walls from data.** Walk every room edge, cut the openings, emit wall pieces, collision boxes (`addBox`) and sight-blocking, then merge static geometry (`mergeTree`).
3. **Nav.** The existing grid rebuilt over the new footprint. Crouch holes usable only by blade men and hunters (and Ray crouched).
4. **Room lookup** for roles, hiding and telemetry.
5. **Furniture** from H's `prop()`; fallback to boxes.
6. **Lights.** The renderer takes 8 lights per vertex. Check how lights are chosen today; with ~9 room lights plus two flashlights, pick the nearest 8 per room/frame if needed.
7. **Sleeping men.** Keep the "frozen when far" saving but measured by rooms away, so a man two rooms off through a wall still hears and wakes.

### 6.6 Tests
- Walk-through bot can't leave in under 90 s.
- Longest sightline from the floor data: 12 m or less.
- From picking up the bolt cutter to the exit: under 60 s.
- Quest: 72 fps with all nine people and both flashlights on screen.

---

## 7. Stage 5: hide and get caught

### 7.1 Doorways (owned by G) — NO DOORS
- **Hung sheets and plastic** in about six openings. They block sight, not sound, not bodies. Ray walks straight through at full speed; they swing aside on his body and never snag him or block a swing. A flashlight behind one makes it glow a second or two before the man arrives.
- **No other doors.** The chained exit (F) swings open by itself when the chain is cut.
- **Leaning** is the real head. No button.

### 7.2 Crouch (G)
- Real crouching works. The left-stick click toggles a crouch for seated play.
- Crouched: quieter (1 m), fits through knocked-through holes, can get under beds.

### 7.3 Hiding spots (G places the system, F places the spots)
Twelve on the floor, never more than 8 m of route apart: two beds, two wardrobes, a closet, a tub curtain, hung sheets, a sofa in a dark corner, the mattress pile, three dark corners behind furniture.
- Hidden, Ray can only be seen from within 1 m, by a flashlight pointed into the spot, or after he makes a sound.
- It uses the real body. A hand or the head sticking out is visible.
- A hand over the mouth halves Ray's breathing and pain noises.
- Searchers check a spot with the flashlight then a look: 2 s for a bed, 3 s for a wardrobe (D).
- If the same kind of spot saves Ray three times on a floor, they check that kind first (D).
- **Under beds:** furniture solid above a height and passable below it.

### 7.4 Being found
A hand takes Ray's collar or ankle and drags him out. Hands over to the grab system (C).

### 7.5 Enemies grab Ray (C)

| Grab | When | How you get out |
|---|---|---|
| Wrist | he closes on your gun hand | pull or twist 0.4 m of total movement in 2 s, or hit him with the other hand |
| Collar drag | found in a hiding spot | same struggle; or shoot or stab point-blank |
| Tackle | a blade man or a grieving one reaches you | pinned, his face 40 cm away, both hands free |
| Choke from behind | a flanker gets behind you | pull his forearm off, or stab back over your shoulder |

- Fail a wrist grab and the gun is turned toward Ray: the existing wrestle (`63-grapple.js`) in reverse.
- Walking is locked during a grab; head and hands are never moved for him. No vignette.
- Target: break free 40-60% of the time.

---

## 8. Stage 6: everything costs

### 8.1 Ray's wounds (A)
- Each wound bleeds 1 health per 4 s and leaves a drop every 2 m. Hunters follow drops.
- **Bandage:** tear a strip from a sheet or curtain and wrap it round the wound with the other hand. About 4 s. Stops the bleed.
- **Leg hit:** 60% speed until bandaged, 85% after. **Arm hit:** that hand weaker, aim sways.
- State read off Ray's own hands: blood on them, a shake at low health. No HUD.

### 8.2 Wounded men (I)
- **Begging is loud:** 12 m. Brings the hunters to him.
- **Clotting:** wounds not in the neck, thigh artery or gut stop bleeding after 60-120 s.
- **Crawling:** men whose temperament is "crawl" crawl toward something: a dropped gun, a doorway, a tenant. Roll over first if on the back.
- Fix: the severed-limb line says "my arm" for a leg.

### 8.3 Surrendered men (E)
- Left alone with Ray's gun off him for 10-20 s, a quitter gets up and runs for his friends, which starts a hunt. Fakers stay as they are.

### 8.4 Tenants (I)
- On seeing Ray: 40% freeze, 25% hide, 20% scream (20 m), 15% point and shout after 1-3 s.
- Aiming at one, or a finger to the lips with a whispered "shh", stops the point-and-shout for that hunt.
- Kill one and the other tenants scream on sight from then on.

---

## 9. Stage 7: polish

**Space.** No gaps where walls meet; skirting, frames, ceiling stains. Every room dressed for who lives there. Grime, damp, exposed block. Dark is dark grey, not black.
**Light.** One motivated light per lit room. Flashlight beams visible in the air and through sheets. Red exit sign at both stairwells.
**Sound.** Each man audible before visible: boots, radio hiss, lighter, cough. The TV and burst pipe as bearings. Separate hit sounds for flesh, bone, blade in, blade out.
**Hands.** Haptics on every contact. Blood on hands and weapon after close work.
**Edges.** Start card and README for the prototype. Smooth death, fade and restart. End card with the run's numbers.

## 10. Checks

| What | How | Pass |
|---|---|---|
| Still too easy | pistol bot, 20 runs | dies in 25 to 50% |
| Still skippable | walk-through bot | can't leave under 90 s |
| Distance wins | kill-distance log | under 25% beyond 8 m |
| Hunts fair | hunt log | 75 to 150 s, always a breather after |
| Melee registers | hand rig | 98% or more |
| Nothing broken | all 16 old levels boot | zero errors |
