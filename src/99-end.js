/* ---------- boot ---------- */
/* the build starts in the Puerto Seco stash house; the shaft in its back room drops you into the tunnel, the tunnel's exit ladder comes up in the
   warehouse, and the level button on the board cycles stash house → tunnel → warehouse → tower floor */
genStash(); buildRack(); buildBoard();
for(const k of ['bright','dark','dust']) dynNode(k,M(null,{color:k==='bright'?0x8e0c0c:k==='dark'?0x4c0606:0x7a7570,double:true})); dynNode('gib',M(null,{color:0x6a1414,double:true})); dynNode('bone',M(null,{color:0xd6cdb4,double:true}));
dynNode('spark',M(null,{color:0xffc464,unlit:true,double:true})); dynNode('smoke',M(tPuff,{color:0x8c8780,cut:true,double:true})); dynNode('mist',M(tPuff,{color:0x9a1212,cut:true,double:true}));
dynNode('brass',M(null,{color:0xc99a3e,emissive:0x2a1c06})); dynNode('mflash',M(tMuzzle,{unlit:true,cut:true,double:true}));
dynNode('pool',M(tPoolB,{cut:true,double:true})); dynNode('splat',M(tSplat,{cut:true,double:true})); dynNode('hole',M(tHole,{cut:true,double:true}));
resetGame();
window.__game={heartPt:E=>{ const B=E.B,ch=X_(B,PI_.chest),nk=X_(B,PI_.neck),Rs=frameFrom(X_(B,PI_.shL),X_(B,PI_.shR),ch,nk); return v3.add(v3.add(ch,v3.sc(v3.sub(nk,ch),.3)),v3.add(v3.sc(Rs[0],.035),v3.sc(Rs[2],.02))); },rayEnemiesExact,rayMesh,camBasis2:()=>camBasis(),gunAim:(E)=>{ if(!E.wpnHeld||!RANGED[E.kind]) return null; const g=gunRay(E),tp=norm3(v3.sub([PL.x,1.45,PL.z],g.mz)); return {mz:g.mz,d:g.d,deg:Math.acos(clamp(v3.dot(g.d,tp),-1,1))*57.3}; },aimAt:(p)=>{ const e=[PL.x,1.62,PL.z],d=v3.sub(p,e),l=Math.hypot(...d); PL.yaw=Math.atan2(-d[0],-d[2]); PL.pitch=Math.asin(d[1]/l); },X_:X_,GAME,PL,XR,enemies:()=>enemies,GRABS,flatGrab,endGrab,startGrab,grabTarget,xrFrame,forePt,itemM,mulP,FIST,RACK,BTN,WPN,BONES,fkMats,m4,wpnMat,shoot,stab,kick,spawnKind,SPAWNOPT,HANDS,equip,newItem,fireHand,FLOOR,BOXES,LOOSE,KINDS,clearEnemies,newFloor,grabOrDrop,meleeHit,hitEnemy,SEGS,PI_,rayEnemies,camBasis,resetGame};
window.__eval=s=>eval(s); /* test hook: headless smoke tests reach the game's internals */
requestAnimationFrame(frame);
})();
