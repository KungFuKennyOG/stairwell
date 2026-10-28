#!/bin/bash
# Builds index.html from src/: the head (HTML/CSS), then every .js in name order, all in one <script>.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import glob
parts=[open(f).read() for f in sorted(glob.glob('src/*.js'))]
open('index.html','w').write(open('src/00-head.html').read()+'\n'.join(parts)+'\n</script>\n')
# train.html: the Maiden Run art direction set, on the same engine (src/10-engine.js) plus src/train/*.js
tparts=[open('src/10-engine.js').read()]+[open(f).read() for f in sorted(glob.glob('src/train/*.js'))]
open('train.html','w').write(open('src/train/00-head.html').read()+'\n'.join(tparts)+'\n</script>\n')
# meridian.html: The Meridian art direction set (world-loop train), same engine plus src/meridian/*.js
mparts=[open('src/10-engine.js').read()]+[open(f).read() for f in sorted(glob.glob('src/meridian/*.js'))]
open('meridian.html','w').write(open('src/meridian/00-head.html').read()+'\n'.join(mparts)+'\n</script>\n')
PY
for f in index.html train.html meridian.html; do node -e "const fs=require('fs');const s=fs.readFileSync('$f','utf8');const js=s.split('<script>')[1].split('</script>')[0];try{new Function(js);console.log('$f syntax ok')}catch(e){console.log('$f SYNTAX',e.message);process.exit(1)}"; done
if [ -d /home/claude ]; then cp index.html /home/claude/stairwell-prototype.html; cp index.html /tmp/claude-0/-home-claude/b50cf62f-48d9-557e-b40f-c99814424a44/scratchpad/proto/index.html 2>/dev/null || true; fi
