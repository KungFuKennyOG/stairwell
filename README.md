# Stairwell

A gritty WebXR game for Meta Quest 3: a 15-floor tower, one hand-built floor per level, Novak's pistol and whatever the men upstairs have, physical enemies that suffer.

**Play:** https://kungfukennyog.github.io/stairwell/ (open it in the Quest browser and press *Play in VR*; it also runs on desktop and phone).

**Art test (cast, arsenal, floor generator):** https://kungfukennyog.github.io/stairwell/art-test.html

**Maiden Run art direction set (bullet-train concept on the same engine):** https://kungfukennyog.github.io/stairwell/train.html. Source in `src/train/`, built by `./build.sh` together with `src/10-engine.js`.

**The Meridian art direction set (world-loop bullet train, a hitman on vacation with a bounty on him):** https://kungfukennyog.github.io/stairwell/meridian.html. Source in `src/meridian/`, same engine.

Current build: the whole tower. The prologue in the lobby (the team dies, Ray wakes up beside Novak), then fifteen hand-built floors: the apartments (01-03), the cutters and their lab (04-06), the soldiers who did the stairs (07-09), the money (10-12: the party, the office, the paid police), and the top (13-15: his family, the last stand, Don Aurelio). Past 15 the stairs go to the roof, and the ending changes if Aurelio is alive. Saves on the stairs; dying restarts the floor. Source: `src/66-tower.js` to `src/73-tower-top.js`. The start card picks a floor, the motel, or the test levels (stash house, tunnel, warehouse, test floor with the rack and spawn board). `?f=0..15` in the URL starts on that floor.

## Floor 01 prototype

Where the game is going: a realistic horror game about being hunted. One floor, rebuilt to prove it. You arrive hurt, six men and three tenants live on it, two of the men walk it with flashlights, and the stairs up are chained until you find what opens them. Hide when the lights come; when they find you it ends at arm's length.

Open it with the *Floor 01 prototype* button on the start card, or `?proto=1`. `?pf=0` plays the old floor 01 layout with the prototype rules. The 15-floor game is untouched without the flag.

What changes in the prototype:
- No bullet time. Health doesn't come back. Ammo is what you find.
- Left stick click crouches.
- A/X: tap to reload, hold to count the rounds by feel.
- The mic is optional (on/off on the start card): whispering is silent, talking carries a few metres, a shout brings them.
- Dying: a short card ("Killed by Tito."), a fade, and the floor again. Getting out: a card with the run's numbers (time, kills, spared, tenants harmed, shots, hits, time hidden, hunts, grabs survived) and *Play again*.
- The left wrist still shows FPS. A second line (time, kills, shots/hits) appears only after the run; `?pdbg=1` shows it during play with the floor's state.

How it's built: `PROTO_BRIEF.md` and `docs/proto/PLAN.md`. Each system is its own `src/8x-*.js` file behind `PROTO.on` (`src/05-proto.js`). QA: `tools/proto/check.sh` builds, boots every level, runs the bots and prints the pass/fail table from the plan.

## Building

Source lives in `src/`: `00-head.html` (page, CSS, HUD), then every `.js` file in name order (`10-engine.js` renderer and characters, `20-floor-assets.js` floor textures and furniture, `50-game.js` and up the game). `./build.sh` concatenates them into `index.html` and syntax-checks it. Edit `src/`, never `index.html`.
