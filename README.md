# Stairwell

A gritty WebXR game for Meta Quest 3: a 30-floor tower, one floor per level, fists to knives to guns, physical enemies that suffer.

**Play:** https://kungfukennyog.github.io/stairwell/ (open it in the Quest browser and press *Play in VR*; it also runs on desktop and phone).

**Art test (cast, arsenal, floor generator):** https://kungfukennyog.github.io/stairwell/art-test.html

**Maiden Run art direction set (bullet-train concept on the same engine):** https://kungfukennyog.github.io/stairwell/train.html. Source in `src/train/`, built by `./build.sh` together with `src/10-engine.js`.

**The Meridian art direction set (world-loop bullet train, a hitman on vacation with a bounty on him):** https://kungfukennyog.github.io/stairwell/meridian.html. Source in `src/meridian/`, same engine.

Current build: the campaign slice. The prologue in the lobby (the team dies, Ray wakes up beside Novak), then hand-built floors 01-03: small, dark, four men each caught in the middle of something, with what they care about in the room and lines you overhear before they know you're there. Fists first, a knife on floor 01, guns on floor 03. Saves on the stairs; dying restarts the floor. Source: `src/66-tower.js`. The start card picks a floor, or the test levels (stash house, tunnel, warehouse, test floor with the rack and spawn board). `?f=0..3` in the URL starts on that floor.

## Building

Source lives in `src/`: `00-head.html` (page, CSS, HUD), then every `.js` file in name order (`10-engine.js` renderer and characters, `20-floor-assets.js` floor textures and furniture, `50-game.js` and up the game). `./build.sh` concatenates them into `index.html` and syntax-checks it. Edit `src/`, never `index.html`.
