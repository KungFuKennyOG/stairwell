/* =====================================================================
   FLOOR 01 PROTOTYPE: the shared switch, the tuning table and the event bus.
   ?proto=1 (or the start card's prototype button) turns the horror rules on. With it off, the 15-floor game plays exactly as before.
   Every system built for the prototype lives in its own src/8x-*.js file, registers its numbers under PROTO.<system>,
   and listens to the core through protoOn(event, fn) instead of editing the frame loop.
   Events (emitted by the core, see PROTO_BRIEF.md for the full list):
     tick(gdt, dt)        once a frame, after everyone has thought, before physics
     hurt(d, src)         Ray took damage (src: {E, kind:'gun'|'melee'|..., part}) — emitted before death is decided
     death(E)             someone died
     fire(h, it, info)    Ray fired: info {o, d, muzzle, sup}
     noise(src, rad, o)   any noise made (src is [x,0,z])
     reset()              level (re)started: rebuild per-floor state here
     load()               a floor was loaded (after reset)
   ===================================================================== */
const PROTO=(()=>{ const q=new URLSearchParams(location.search);
  return { on:q.get('proto')==='1'||location.hash==='#proto', floor:q.get('pf')!=='0', v:'0.1' }; })();
const PROTO_EV={};
function protoOn(ev,fn){ (PROTO_EV[ev]||(PROTO_EV[ev]=[])).push(fn); }
function protoEmit(ev,...a){ const L=PROTO_EV[ev]; if(!L) return; for(const fn of L){ try{ fn(...a); }catch(e){ console.error('[proto:'+ev+']',e); } } }
/* one place to read a tuning number with a fallback, so a system still runs if its table is missing */
function pnum(sys,key,def){ const t=PROTO[sys]; return t&&t[key]!==undefined?t[key]:def; }
