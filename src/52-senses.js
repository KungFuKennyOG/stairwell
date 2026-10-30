/* ---------- senses: what they see and hear, and what they do about it ----------
   Nobody knows where you are unless they see you, hear you, or someone tells them.
   Minds:  calm        at his post, normal eyes
           investigate heard something small (a step, a thrown bottle): walks over to look, gun up, not hunting you yet
           hunt        E.aware: knows you're here; goes for you if he sees you, otherwise for E.lkp (where you were last seen or heard)
           search      lost you (or found a body): sweeps a few spots around where it happened, then gives up
           nervous     gave up; walks back to his post with sharper eyes for the rest of the floor
   Sound:  every noise has a radius; a wall or a closed door between you and him cuts it to under half.
           Gunshots, kicked doors and screams are alarms: close enough and he hunts; far off he only comes to look. */

const GUN_LOUD={revolver:17,pistol:16,smg:18,shotgun:22};
Object.assign(LINES,{
  lost:['Where\'d he go?','Shit— lost him.','He was right here—','Come out, man!'],
  search:['I know you\'re here.','Come on out.','Where are you...','Check behind the couch—'],
  giveup:['...Nothing.','Must\'ve been nothing.','Fuck this place.','He\'s gone. I think.'],
  huh:['What was that?','Hello?','Who\'s there?','...the hell was that?'],
  body:n=>[`${n}? ...oh shit. OH SHIT.`,`Somebody got ${n}!`,`${n}— no, no—`] });
Object.assign(LINES_ES,{
  lost:[es('¿A dónde se fue?','Where\'d he go?'),es('Lo perdí.','Lost him.'),es('Estaba aquí—','He was right here—'),es('¡Sal, cabrón!','Come out!')],
  search:[es('Sé que estás aquí.','I know you\'re here.'),es('Sal de ahí.','Come out of there.'),es('¿Dónde estás...?','Where are you...?')],
  giveup:[es('...Nada.','...Nothing.'),es('No era nada.','It was nothing.'),es('Ya se fue. Creo.','He\'s gone. I think.')],
  huh:[es('¿Qué fue eso?','What was that?'),es('¿Quién anda ahí?','Who\'s there?'),es('¿Bueno?','Hello?')],
  body:n=>[es(`¿${n}? ...no, no, no.`,`${n}? ...no, no, no.`),es(`¡Le dieron a ${n}!`,`Somebody got ${n}!`)] });

const upright=E=>!E.dead&&(E.st==='idle'||E.st==='alert');
const say=(E,lines,dur)=>{ if(E.barkCd<=0&&GAME.barkGlobal<=0){ bark(E,pick(lines),dur); GAME.barkGlobal=.9; return true; } return false; };

/* a sound at src [x,y,z], heard out to rad metres. o.alarm: gunshot/scream/kick. o.from: the enemy making it (doesn't hear himself) */
function noise(src,rad,o={}){ if(!rad||!GAME.started) return;
  for(const E of enemies){ if(E===o.from||!upright(E)||E.ally) continue;
    const d=Math.hypot(E.pos[0]-src[0],E.pos[1]-src[2]); if(d>rad) continue;
    const r=sightClear([E.pos[0],1.6,E.pos[1]],[src[0],1.2,src[2]])?rad:rad*(o.alarm?.6:.45); if(d>r) continue; /* through a wall: a gunshot still carries, a footstep doesn't */
    setTimeout(()=>hear(E,src,d/r,o),120+d*45); } }
function alertAll(src,rad=12){ noise(src,rad,{alarm:true}); } /* kicked doors */

/* the nearest open floor to (x,z): a bottle that lands against a wall is looked for in front of the wall, not inside it */
function navSnap(x,z){ const c=navCell(x,z); if(c<0) return [x,z]; if(!FLOOR.nav[c]) return [x,z]; const ci=c%NX,ck=(c-ci)/NX;
  for(let r=1;r<=4;r++) for(let k=-r;k<=r;k++) for(let i=-r;i<=r;i++){ if(Math.max(Math.abs(i),Math.abs(k))!==r) continue; const ni=ci+i,nk=ck+k; if(ni<0||nk<0||ni>=NX||nk>=NZ||FLOOR.nav[nk*NX+ni]) continue; return [cellX(ni),cellZ(nk)]; }
  return [x,z]; }
/* walking somewhere but going nowhere (a corner, another body in the way): counts as arriving */
function stuck(E,dt){ E.pgT=(E.pgT||0)+dt; if(E.pgT<1.5) return false; const m=E.pgP?Math.hypot(E.pos[0]-E.pgP[0],E.pos[1]-E.pgP[1]):1; E.pgP=E.pos.slice(); E.pgT=0; return m<.25; }
const freshGoal=E=>{ E.pgT=0; E.pgP=null; };

function hear(E,src,k,o){ if(!upright(E)) return; const at=navSnap(src[0],src[2]);
  if(E.aware){ if(!E.canSee){ E.lkp=at; E.lostT=Math.max(E.lostT||0,.7); } return; }
  if(o.alarm&&(k<.65||(E.mind&&E.mind!=='calm'))) setAware(E,'noise',at);
  else investigate(E,at); }

function investigate(E,at){ if(E.dead||E.aware||E.ally) return;
  if(E.mind==='search'){ E.srcC=at; E.wp=at; E.pauseT=0; E.searchT=Math.max(E.searchT,6); return; }
  if(E.mind!=='investigate') say(E,LINES.huh,2);
  E.mind='investigate'; E.lkp=at; E.goalT=0; freshGoal(E); if(E.st==='idle') E.st='alert'; }

function startSearch(E,c,why){ E.aware=false; E.mind='search'; E.srcC=navSnap(c[0],c[1]); E.wp=null; E.pauseT=0; E.goalT=0; freshGoal(E);
  E.searchT=why==='body'?rnd(14,18):why==='inv'?rnd(6,9):rnd(10,14); E.sayT=rnd(3,6);
  if(why==='lost') say(E,LINES.lost,2.2); }

function giveUp(E){ E.mind='nervous'; E.wp=null; E.lkp=null; E.goHome=true; freshGoal(E); say(E,LINES.giveup,2.4); }

/* called from think() every frame for anyone alive: eyes, then what that means */
function senses(E,dt,dist,toP,B){ if(E.ally){ E.canSee=false; return; } /* the team in the prologue: no eyes, no ears, no turning on you */
  E.sightT=(E.sightT||0)-dt; let tick=false;
  if(E.sightT<=0){ E.sightT=.2; tick=true; E.canSee=sightClear(X_(B,PI_.head),[PL.x,1.55,PL.z])&&seenInDark(E,dist); }
  if(!GAME.started||!upright(E)) return;
  if(!E.aware){
    const fwd=[Math.sin(E.hd),Math.cos(E.hd)],facing=(toP[0]*fwd[0]+toP[1]*fwd[1])/(dist||1),edgy=E.mind&&E.mind!=='calm',
      range=edgy?8.5:6,cone=edgy?.2:.45,inView=E.canSee&&(dist<1.1&&facing>-.2||dist<.45||(dist<range&&facing>cone));
    /* a beat before it registers: someone calm across the room takes up to half a second, someone already looking is quick. You can duck back out */
    const need=edgy?.12:clamp((dist-1.5)*.12,0,.55);
    E.spotT=inView?(E.spotT||0)+dt:Math.max(0,(E.spotT||0)-dt*.5);
    if(inView&&E.spotT>=need){ E.spotT=0; setAware(E,'see'); }
    /* bodies: a friend on the floor, dead or bleeding out */
    else if(tick&&enemies.length>1){ for(const O of enemies){ if(O===E||!(O.dead||O.st==='down'||O.st==='kneel')||(E.seen&&E.seen.has(O))) continue;
        const op=X_(O.B,PI_.pelvis),dx=op[0]-E.pos[0],dz=op[2]-E.pos[1],d=Math.hypot(dx,dz); if(d>8||(dx*fwd[0]+dz*fwd[1])/(d||1)<.1&&d>1.2) continue;
        if(!sightClear(X_(B,PI_.head),[op[0],.45,op[2]])) continue;
        (E.seen||(E.seen=new Set())).add(O); say(E,LINES.body(O.name),2.6); vox(E,'shout');
        if(E.st==='idle') E.st='alert'; startSearch(E,[op[0],op[2]],'body'); noise([E.pos[0],0,E.pos[1]],9,{from:E}); break; } } }
  if(E.aware){
    if(E.canSee||E.tracks){ E.lkp=[PL.x,PL.z]; E.lostT=0; E.mind='hunt';
      /* call it out: friends who are hunting but can't see you learn where you are */
      E.callT=(E.callT||0)-dt; if(E.callT<=0&&E.canSee){ E.callT=1;
        for(const O of enemies) if(O!==E&&O.aware&&upright(O)&&!O.canSee&&Math.hypot(O.pos[0]-E.pos[0],O.pos[1]-E.pos[1])<10){ O.lkp=[PL.x,PL.z]; } } }
    else { E.lostT=(E.lostT||0)+dt; if(E.lostT<.6) E.lkp=[PL.x,PL.z]; /* he saw which way you went */
      if(E.lkp&&Math.hypot(E.pos[0]-E.lkp[0],E.pos[1]-E.lkp[1])<1) startSearch(E,E.lkp,'lost');
      else if(E.lostT>(E.lkp?20:7)) startSearch(E,E.lkp||E.pos.slice(),'lost'); } } }

/* where he's walking this frame and how fast, when he isn't closing on you in plain sight. Null: stand still */
function aiGoal(E,dt,t){
  if(E.tracks&&E.aware) return {x:PL.x,z:PL.z,sp:1.6};
  if(E.aware){ const sp=armed(E)?1.5:2.1;
    if(E.via) return {x:E.via[0],z:E.via[1],sp}; /* sent round the other way by the flanking (30-floor.js): get to that side first */
    if(!E.lkp) return null; if(stuck(E,dt)){ startSearch(E,E.pos.slice(),'lost'); return null; } return {x:E.lkp[0],z:E.lkp[1],sp}; }
  if(E.mind==='investigate'){ E.goalT+=dt; const L=E.lkp;
    if(!L||Math.hypot(E.pos[0]-L[0],E.pos[1]-L[1])<1||E.goalT>15||stuck(E,dt)){ startSearch(E,L||E.pos.slice(),'inv'); return null; } return {x:L[0],z:L[1],sp:1.1}; }
  if(E.mind==='search'){ E.searchT-=dt; E.sayT-=dt; if(E.sayT<=0){ E.sayT=rnd(5,8); say(E,LINES.search,2.2); }
    if(E.searchT<=0){ giveUp(E); return null; }
    if(E.pauseT>0){ E.pauseT-=dt; freshGoal(E); return null; }
    if(!E.wp||E.goalT>8||Math.hypot(E.pos[0]-E.wp[0],E.pos[1]-E.wp[1])<.7||stuck(E,dt)){
      if(E.wp){ E.wp=null; E.pauseT=rnd(1.2,2.6); E.scanHd=E.hd; return null; } /* got there (or as close as he can): stand and look around */
      E.wp=navSpotNear(E.srcC[0],E.srcC[1],4.5)||E.srcC; E.goalT=0; freshGoal(E); }
    E.goalT+=dt; return {x:E.wp[0],z:E.wp[1],sp:1}; }
  if(E.goHome&&E.home){ if(Math.hypot(E.pos[0]-E.home[0],E.pos[1]-E.home[1])<.6||stuck(E,dt)){ E.goHome=false; E.st='idle'; E.hd=E.homeHd??E.hd; return null; }
    return {x:E.home[0],z:E.home[1],sp:.9}; }
  if(E.patrol&&typeof patrolGoal==='function') return patrolGoal(E,dt); /* a beat to walk (36-stash.js) */
  return null; }

/* the player's feet: walk slowly and nobody hears you; push the stick all the way and the next room might */
function footsteps(dt){ if(!GAME.started||PL.dead) return;
  const v=Math.hypot(PL.x-(PL.px??PL.x),PL.z-(PL.pz??PL.z))/Math.max(dt,1e-3); PL.px=PL.x; PL.pz=PL.z; if(v>6) return; /* teleports, resets */
  PL.spdS=lerp(PL.spdS||0,v,Math.min(1,dt*6)); PL.stepT=(PL.stepT||0)-dt;
  if(typeof tunWet==='function'&&tunWet(PL.x,PL.z)){ /* wading: every step splashes, and it carries */
    if(PL.spdS>.45&&PL.stepT<=0){ PL.stepT=.55; sfx('splat',.22+.1*Math.min(1,PL.spdS/2)); noise([PL.x,0,PL.z],5+PL.spdS*1.5); } return; }
  if(PL.spdS>1.5&&PL.stepT<=0){ PL.stepT=.45; noise([PL.x,0,PL.z],2.8+(PL.spdS-1.5)*2); } }
