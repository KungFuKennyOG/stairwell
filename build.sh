#!/bin/bash
# Builds index.html from src/: the head (HTML/CSS), then every .js in name order, all in one <script>.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import glob
game=sorted(glob.glob('src/*.js'))
kit=['src/houses/40-helpers.js','src/houses/41-paint.js','src/houses/43-castkit.js','src/houses/44-build.js','src/frontera/45-cast.js','src/frontera/46-places.js','src/frontera/48-vision.js']
i=game.index('src/20-floor-assets.js')+1
parts=[open(f).read() for f in game[:i]+kit+game[i:]]
open('index.html','w').write(open('src/00-head.html').read()+'\n'.join(parts)+'\n</script>\n')
# train.html: the Maiden Run art direction set, on the same engine (src/10-engine.js) plus src/train/*.js
tparts=[open('src/10-engine.js').read()]+[open(f).read() for f in sorted(glob.glob('src/train/*.js'))]
open('train.html','w').write(open('src/train/00-head.html').read()+'\n'.join(tparts)+'\n</script>\n')
# meridian.html: The Meridian art direction set (world-loop train), same engine plus src/meridian/*.js
mparts=[open('src/10-engine.js').read()]+[open(f).read() for f in sorted(glob.glob('src/meridian/*.js'))]
open('meridian.html','w').write(open('src/meridian/00-head.html').read()+'\n'.join(mparts)+'\n</script>\n')
# houses.html: House Calls art direction set (the five houses and their people), same engine plus the floor assets and src/houses/*.js
hparts=[open('src/10-engine.js').read(),open('src/20-floor-assets.js').read()]+[open(f).read() for f in sorted(glob.glob('src/houses/*.js'))]
open('houses.html','w').write(open('src/houses/00-head.html').read()+'\n'.join(hparts)+'\n</script>\n')
# puerto-seco.html: Puerto Seco art direction set (the prologue team, the cartel, stash house and tunnel, night vision and thermal),
# same engine plus the floor assets, the shared house builder and cast kit from src/houses, then src/frontera/*.js
kit=['src/houses/40-helpers.js','src/houses/41-paint.js','src/houses/43-castkit.js','src/houses/44-build.js']
fparts=[open('src/10-engine.js').read(),open('src/20-floor-assets.js').read()]+[open(f).read() for f in kit]+[open(f).read() for f in sorted(glob.glob('src/frontera/*.js'))]
open('puerto-seco.html','w').write(open('src/frontera/00-head.html').read()+'\n'.join(fparts)+'\n</script>\n')
PY
for f in index.html train.html meridian.html houses.html puerto-seco.html; do node -e "const fs=require('fs');const s=fs.readFileSync('$f','utf8');const js=s.split('<script>')[1].split('</script>')[0];try{new Function(js);console.log('$f syntax ok')}catch(e){console.log('$f SYNTAX',e.message);process.exit(1)}"; done
if [ -d /home/claude ]; then cp index.html /home/claude/stairwell-prototype.html; cp index.html /tmp/claude-0/-home-claude/b50cf62f-48d9-557e-b40f-c99814424a44/scratchpad/proto/index.html 2>/dev/null || true; fi
