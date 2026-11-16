/* =====================================================================
   WICK: the hitman prototype ("Night Contract", working title). Plan: the project doc claude/prototype-plan.md.
   ?wick=1 turns it on. It rides on the floor 01 prototype's systems (melee, notice, fight, squad, props, the room builder), so it
   switches PROTO.on on too, then changes the rules that differ. Every such change checks WICK.on, so ?proto=1 (the horror
   prototype) and the 15-floor game play exactly as before. docs/wick/AUDIT.md lists every PROTO.on check and which way it goes.
   Tuning: each system keeps its numbers in WICK.<system>; any of them can be set from the URL:
     short names   ?wick=1&hp=125&bt=6&stress=12
     any number    ?wick=1&w.rules.hp=125   (w.<system>.<key>)
   ===================================================================== */
const WICK=(()=>{ const q=new URLSearchParams(location.search);
  return { on:q.get('wick')==='1'||location.hash==='#wick', v:'0.0' }; })();
if(WICK.on) PROTO.on=true; /* the prototype's systems come with it; nothing between 05 and here reads PROTO.on at load */

/* the tables. Stage 0 only uses stress; the rest are placeholders the later stages fill (plan sections 4-6) */
WICK.look=new URLSearchParams(location.search).get('look')||'psx'; /* 'hitman': the early-2000s look test (Kenny, 2026-11-16): smooth filtering, no dither, a softer grade */
WICK.rules={ hp:100 };
WICK.bt={ max:4 };                          /* bullet time meter, seconds (stage 2) */
WICK.stress={ n:0, alert:0, god:1, near:4, far:12 }; /* stage 0: extra gunmen to find the Quest's limit */

/* one place to read a number with a fallback */
function wnum(sys,key,def){ const t=WICK[sys]; return t&&t[key]!==undefined?t[key]:def; }

/* URL overrides */
(()=>{ if(!WICK.on) return; const q=new URLSearchParams(location.search),SHORT={hp:'rules.hp',bt:'bt.max',stress:'stress.n',salert:'stress.alert',sgod:'stress.god',
    block:'rules.block',regen:'rules.regenT',regenv:'rules.regenV',pdmg:'rules.pistol',dmgk:'rules.dmgK',woundt:'rules.woundT',legk:'rules.legK',spread:'rules.armSpread',
    mags:'rules.mags',merge:'rules.merge',btk:'bt.kill',bth:'bt.head',btl:'bt.link',chain:'bt.chainT',bts:'bt.ts',burst:'bt.burst',bt0:'bt.start'}; /* stage 2 (92-wick-rules.js) */
  const set=(path,v)=>{ const [s,k]=path.split('.'); const n=Number(v); if(!WICK[s]||!k||!isFinite(n)) return; WICK[s][k]=n; };
  for(const [k,v] of q){ if(SHORT[k]) set(SHORT[k],v); else if(k.startsWith('w.')) set(k.slice(2),v); } })();

if(WICK.on) document.addEventListener('DOMContentLoaded',()=>document.body.classList.add('wick'));

/* 06 sits before the engine's scope opens (src/10-engine.js), so it can't see game functions. Code that needs them lives in src/9x-wick-*.js */
