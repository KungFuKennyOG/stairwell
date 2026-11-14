// Where tools/proto/check.sh looks for agent B's hand rig: runs tools/melee-rig.js, the registration sweep by default
// (QUICK=1: the short one). Any arguments go straight through: node tools/harness/melee-rig.js index.html [reg|tier|feel|perf|all] [--quick]
if (!process.argv[3]) process.argv.push('reg');
if (process.env.QUICK === '1' && !process.argv.includes('--quick')) process.argv.push('--quick');
require('../melee-rig.js');
