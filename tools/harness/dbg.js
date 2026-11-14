const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs'); const game='file://'+process.argv[2]; const code=fs.readFileSync(process.argv[3],'utf8');
(async()=>{ const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']});
  const p=await b.newPage({viewport:{width:640,height:360}}); p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,300)));
  await p.goto(game+'?f='+(process.argv[4]||3)); await p.waitForTimeout(350); await p.click('#start'); await p.waitForTimeout(250);
  const r=await p.evaluate(s=>{ try{ return window.__eval(s); }catch(e){ return 'ERR '+e.stack; } },code); console.log(typeof r==='string'?r:JSON.stringify(r)); await b.close(); })();
