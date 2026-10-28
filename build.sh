#!/bin/bash
# Builds index.html from src/: the head (HTML/CSS), then every .js in name order, all in one <script>.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import glob
parts=[open(f).read() for f in sorted(glob.glob('src/*.js'))]
open('index.html','w').write(open('src/00-head.html').read()+'\n'.join(parts)+'\n</script>\n')
PY
node -e "const fs=require('fs');const s=fs.readFileSync('index.html','utf8');const js=s.split('<script>')[1].split('</script>')[0];try{new Function(js);console.log('syntax ok')}catch(e){console.log('SYNTAX',e.message);process.exit(1)}"
if [ -d /home/claude ]; then cp index.html /home/claude/stairwell-prototype.html; cp index.html /tmp/claude-0/-home-claude/b50cf62f-48d9-557e-b40f-c99814424a44/scratchpad/proto/index.html 2>/dev/null || true; fi
