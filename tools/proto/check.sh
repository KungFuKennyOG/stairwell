#!/bin/bash
# The floor 01 prototype QA run (docs/proto/PLAN.md section 10): build, boot every level, the shell's flow, the bots, the table.
# One headless Chrome at a time, start to finish.
#   tools/proto/check.sh                    the prototype as ?proto=1 loads it (agent F's floor once merged)
#   tools/proto/check.sh "proto=1&pf=0"     the old floor 01 with the prototype rules
# env: RUNS=20 pistol runs · QUICK=1 smoke run (4 pistol runs, one of each other bot, shorter) · OUT=/tmp/proto-check raw JSON lines
#      MELEE_RIG=path/to/rig.js (agent B's hand rig; found on its own if it's tools/proto/melee*.js, tools/melee/*.js or tools/harness/melee*.js)
# Full run: roughly 25-50 min on this machine (the pistol bot is most of it); QUICK=1 about 8-12.
# It rebuilds index.html (and the other generated pages) and leaves them built.
set -u
cd "$(dirname "$0")/../.."
Q="${1:-proto=1}"; OUT="${OUT:-/tmp/proto-check}"; RUNS="${RUNS:-20}"
mkdir -p "$OUT"; rm -f "$OUT"/*.jsonl
if [ "${QUICK:-0}" = 1 ]; then RUNS="${RUNS_QUICK:-4}"; NW=1; NS=1; WALK='{"maxT":100}'; STAND='{"maxT":120}'; SNEAK='{"maxT":300}'; PIST='{"maxT":200}'
else NW=3; NS=2; WALK='{"maxT":120}'; STAND='{"maxT":180}'; SNEAK='{"maxT":600}'; PIST='{"maxT":300}'; fi
say(){ echo "[$(date +%H:%M:%S)] $*" >&2; }
say "build"; ./build.sh >&2 || { echo "BUILD FAILED"; exit 1; }
say "boot: lobby, floors 01-15, motel, stash, tunnel, warehouse, prototype"; node tools/proto/boot-all.js index.html > "$OUT/boot.jsonl"
say "shell flow ($Q)"; node tools/proto/flow.js index.html "$Q" > "$OUT/flow.jsonl"
say "walk-through x$NW"; node tools/proto/bots.js index.html walk "$NW" "$Q" "$WALK" > "$OUT/walk.jsonl"
say "fetch x1"; node tools/proto/bots.js index.html fetch 1 "$Q" > "$OUT/fetch.jsonl"
say "stand still x$NS"; node tools/proto/bots.js index.html stand "$NS" "$Q" "$STAND" > "$OUT/stand.jsonl"
say "hide and sneak x$NS"; node tools/proto/bots.js index.html sneak "$NS" "$Q" "$SNEAK" > "$OUT/sneak.jsonl"
say "pistol fight x$RUNS"; node tools/proto/bots.js index.html pistol "$RUNS" "$Q" "$PIST" > "$OUT/pistol.jsonl"
RIG="${MELEE_RIG:-$(ls tools/proto/melee*.js tools/melee/*.js tools/harness/melee*.js 2>/dev/null | head -1)}"
if [ -n "$RIG" ] && [ -f "$RIG" ]; then say "melee rig: $RIG"; node "$RIG" index.html > "$OUT/melee.jsonl" 2>&1; else say "melee rig: none found (agent B's), skipped"; fi
node tools/proto/report.js "$OUT"
