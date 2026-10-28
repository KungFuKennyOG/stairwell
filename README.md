# Stairwell

A gritty WebXR game for Meta Quest 3: a 30-floor tower, one floor per level, fists to knives to guns, physical enemies that suffer.

**Play:** https://kungfukennyog.github.io/stairwell/ (open it in the Quest browser and press *Play in VR*; it also runs on desktop and phone).

**Art test (cast, arsenal, floor generator):** https://kungfukennyog.github.io/stairwell/art-test.html

Current build: physics prototype 01, a single apartment floor with three enemies.

## Building

Source lives in `src/`: `00-head.html` (page, CSS, HUD), then every `.js` file in name order (`10-engine.js` renderer and characters, `20-floor-assets.js` floor textures and furniture, `50-game.js` and up the game). `./build.sh` concatenates them into `index.html` and syntax-checks it. Edit `src/`, never `index.html`.
