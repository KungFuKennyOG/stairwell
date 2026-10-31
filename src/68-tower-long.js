/* =====================================================================
   THE LONG FLOORS. Floors 01-06 run 32 m now instead of 20: the apartments in the middle stay where they were, and each floor
   gains four more at the ends (x 10..16 either side, both sides of the corridor), with the stairwells moved out past them.
   Rooms stay small; it's more of them. More doors to listen at, more dark rooms, more people who may or may not have been there.
   This file only adds: units, what's in them, who's in them, what they say. Light budget unchanged: the new rooms are dark.
   ===================================================================== */
/* each kit keeps the doorway clear: anything near the corridor wall goes on the side away from the door (f = that side) */
const TW_ROOMKIT={
  bed:(A,cx,s,f)=>{ A.furn('bed',cx-f*1.0,s*5.45,s>0?Math.PI:0); A.furn('wardrobe',cx+f*1.6,s*5.65,s>0?Math.PI:0); A.furn('trash',cx+f*2.4,s*1.7,0); },
  squat:(A,cx,s,f)=>{ A.furn('mattress',cx-f*.6,s*5.4,s>0?Math.PI:0); A.furn('bucket',cx+f*1.8,s*5.5,0); A.furn('trash',cx+f*2.3,s*1.8,0); },
  kitchen:(A,cx,s,f)=>{ A.furn('counter',cx-f*.4,s*5.62,s>0?Math.PI:0); A.furn('fridge',cx+f*1.9,s*5.6,s>0?Math.PI:0); A.furn('table',cx+f*.6,s*3.6,Math.PI/2); },
  store:(A,cx,s,f)=>{ A.furn('crates',cx-f*1.4,s*5.4,s>0?Math.PI:0); A.furn('crates',cx+f*1.2,s*5.45,s>0?Math.PI:0); A.furn('crates',cx+f*2.2,s*3.2,0); },
  living:(A,cx,s,f)=>{ A.furn('couch',cx-f*.3,s*5.55,s>0?Math.PI:0); A.furn('tv',cx+f*2.2,s*2.6,s>0?0:Math.PI); A.furn('trash',cx-f*2.3,s*5.3,0); },
  office:(A,cx,s,f)=>{ A.furn('desk',cx+f*.8,s*3.8,s>0?Math.PI:0); A.furn('filing',cx-f*2.2,s*5.6,s>0?Math.PI:0); A.furn('filing',cx+f*2.2,s*5.6,s>0?Math.PI:0); } };
/* rooms: [side, x0, x1, door, kit, paper, floor, extra unit fields] */
function twLong(n,rooms,add){ const D=TOWER.find(d=>d.n===n); if(!D) return; D.len=16;
  for(const [side,x0,x1,door,kit,paper,fl,more] of rooms) D.units.push(Object.assign({side,x0,x1,door,paper,fl},more||{}));
  const b0=D.build; D.build=A=>{ b0(A); for(const [side,x0,x1,door,kit] of rooms) if(kit&&TW_ROOMKIT[kit]){ const cx=(x0+x1)/2; TW_ROOMKIT[kit](A,cx,side,door>=cx?-1:1); } if(add.build) add.build(A); };
  for(const k of ['cast','civ','talk','loot']) if(add[k]) D[k]=(D[k]||[]).concat(add[k]); }

/* 01 · Mario wears the vest now. Dani's wife waits up. A dark flat at the east end opens into Toño's kitchen */
twLong(1,[[1,-16,-10,-13.4,'store','concrete','conc',{win:true}],[-1,-16,-10,-12.6,'bed','blue','oak',{win:true}],
    [1,10,16,12.2,'bed','cream','rug',{win:true}],[-1,10,16,13.6,'squat','peel','conc',{win:true,hole:3.4}]],{
  cast:[{kind:'corner',name:'Mario',spots:[[-13.6,-4.1,Math.PI],[-12.4,-4.4,Math.PI+.4]],pose:'watch',extra:'Take the vest! Take it!'}],
  civ:[{kind:'senora',civ:true,fem:true,name:'Carmen',spots:[[13.6,3.4,-Math.PI/2],[12.8,2.6,-Math.PI/2-.4]],pose:'idle',extra:'I don\'t know anything— I swear to God—'}],
  talk:[{who:['Mario'],r:3.8,lines:[['Mario','It fits. The vest fits.'],['Mario','Bulletproof, man.'],['Mario','Let the sixth one come.'],['Mario','...it\'s heavy, though.']]},
    {who:['Carmen'],r:3.8,lines:[['Carmen','Dani, come to bed.'],['Carmen','Dani?'],['Carmen','Whose watch is that, Dani?'],['Carmen','...what did you do.']]}],
  build(A){ twVest(-14.2,.56,-5.4,.3); } });

/* 02 · Toro has Harris's phone, still playing his music. Doña Pili hides in the dark. Two empty flats */
twLong(2,[[1,-16,-10,-12.4,'kitchen','nicotine','tile',{win:true}],[-1,-16,-10,-13.2,'squat','peel','conc',{win:true}],
    [1,10,16,13.0,'store','concrete','conc',{win:true,hole:4.0}],[-1,10,16,12.4,'bed','pink','rug',{win:true}]],{
  cast:[{kind:'cutter',name:'Toro',spots:[[-13.4,2.4,Math.PI],[-12.6,2.3,Math.PI+.3]],pose:'phone',extra:'It\'s just a phone, man— take it—'}],
  civ:[{kind:'abuela',civ:true,fem:true,old:true,name:'Doña Pili',spots:[[13.8,-3.2,-Math.PI/2],[14.4,-2.6,-Math.PI/2]],pose:'idle',extra:'I\'m old— I\'m old, mijo—'}],
  talk:[{who:['Toro'],r:3.8,lines:[['Toro','The big one\'s phone.'],['Toro','Still playing his music.'],['Toro','Texts from \'Ray\'.'],['Toro','\'Pool closes at six.\''],['Toro','...who\'s Ray?']]},
    {who:['Doña Pili'],r:3.8,lines:[['Doña Pili','Shh. Shh.'],['Doña Pili','They\'ll go away.'],['Doña Pili','Felix used to carry my bags.'],['Doña Pili','Such a good boy, Felix.']]}] });

/* 03 · Chino wants the sixth helmet. Tavo saw Eddie's badge. Two dark flats, one through into Big Mike's */
twLong(3,[[1,-16,-10,-13.0,'office','panel','oak',{win:true}],[-1,-16,-10,-12.8,'bed','cream','rug',{win:true}],
    [1,10,16,12.6,'living','sage','check',{win:true}],[-1,10,16,13.4,'kitchen','tile','tile',{win:true,hole:3.6}]],{
  cast:[{kind:'gunman',name:'Chino',spots:[[-13.0,2.6,Math.PI],[-13.6,2.8,Math.PI-.3]],pose:'watch',extra:'It\'s just the money, man— just the money—'}],
  civ:[{kind:'estudiante',civ:true,name:'Tavo',spots:[[12.6,3.6,0],[13.4,3.4,.4]],pose:'phone',extra:'I\'m sixteen— I\'m— please—'}],
  talk:[{who:['Chino'],r:3.8,lines:[['Chino','Five helmets.'],['Chino','Landlord paid for six.'],['Chino','Somebody owes him a helmet.'],['Chino','Somebody\'s getting skinned.']]},
    {who:['Tavo'],r:3.8,lines:[['Tavo','Mom said don\'t go out.'],['Tavo','Eddie showed me a badge.'],['Tavo','Said it was a trophy.'],['Tavo','It had blood on it.']]}] });

/* 04 · Güero drinks his five hundred. Doña Toña's sink was used to wash up after */
twLong(4,[[1,-16,-10,-12.6,'living','peel','check',{win:true}],[-1,-16,-10,-13.4,'kitchen','tile','tile',{win:true}],
    [1,10,16,12.8,'store','concrete','conc',{win:true}],[-1,10,16,12.2,'squat','nicotine','conc',{win:true,hole:3.0}]],{
  cast:[{kind:'vecino1',hidden:true,name:'Güero',spots:[[-12.6,3.6,Math.PI],[-13.4,3.2,Math.PI+.3]],pose:'lean',extra:'I was drunk, man— I was drunk—'}],
  civ:[{kind:'abuela',civ:true,fem:true,old:true,name:'Doña Toña',spots:[[-13.4,-4.85,Math.PI],[-12.8,-4.85,Math.PI+.2]],pose:'lean',extra:'I said nothing! I say nothing!'}],
  talk:[{who:['Güero'],r:3.8,lines:[['Güero','Five hundred.'],['Güero','For one helmet.'],['Güero','Drank half already.'],['Güero','To the cops. Salud.']]},
    {who:['Doña Toña'],r:3.8,lines:[['Doña Toña','They used my sink.'],['Doña Toña','To wash it off.'],['Doña Toña','Blood in my sink.'],['Doña Toña','I said nothing. I say nothing.']]}] });

/* 05 · Pelón keeps the stairs up shut. Don Cuco wants his oxygen back */
twLong(5,[[1,-16,-10,-13.0,'store','dark','conc',{win:true}],[-1,-16,-10,-12.6,'bed','sage','oak',{win:true}],
    [1,10,16,13.2,'squat','peel','conc',{win:true}],[-1,10,16,12.8,'living','cream','rug',{win:true,hole:3.8}]],{
  cast:[{kind:'doorman',name:'Pelón',spots:[[13.2,2.4,Math.PI],[12.6,2.6,Math.PI+.4]],pose:'watch',extra:'I just keep the stairs, man—'}],
  civ:[{kind:'enfermo',civ:true,old:true,name:'Don Cuco',spots:[[-12.6,-4.4,Math.PI],[-13.4,-4.2,Math.PI-.3]],pose:'idle',extra:'I can\'t breathe— I can\'t—'}],
  talk:[{who:['Pelón'],r:3.8,lines:[['Pelón','Nobody goes up.'],['Pelón','Aurelio\'s orders.'],['Pelón','Not the cooks. Not God.'],['Pelón','Not the sixth cop.']]},
    {who:['Don Cuco'],r:3.8,lines:[['Don Cuco','My oxygen.'],['Don Cuco','They took my tank.'],['Don Cuco','For the lab, they said.'],['Don Cuco','Ask the cops for one.']]}] });

/* 06 · Flaco hauls drums for the truck. Ramiro washes their glass for three hundred a week */
twLong(6,[[1,-16,-10,-12.8,'store','concrete','conc',{win:true}],[-1,-16,-10,-13.2,'kitchen','tile','tile',{win:true}],
    [1,10,16,12.4,'store','concrete','conc',{win:true}],[-1,10,16,13.0,'squat','peel','conc',{win:true,hole:3.2}]],{
  cast:[{kind:'mcutter',name:'Flaco',spots:[[-12.0,3.2,Math.PI/2],[-13.6,3.4,-Math.PI/2]],pose:'idle',extra:'I just carry the drums—'}],
  civ:[{kind:'estudiante',civ:true,name:'Ramiro',spots:[[-13.2,-4.85,Math.PI],[-12.6,-4.85,Math.PI+.3]],pose:'lean',extra:'I wash the glass! That\'s all I do!'}],
  talk:[{who:['Flaco'],r:3.8,lines:[['Flaco','Two more for the truck.'],['Flaco','El Paso again.'],['Flaco','Who drives them across?'],['Flaco','Nobody asks. Lift.']]},
    {who:['Ramiro'],r:3.8,lines:[['Ramiro','Wash it, they said.'],['Ramiro','Three hundred a week.'],['Ramiro','Mamá thinks it\'s the Oxxo.'],['Ramiro','Smells like the Oxxo, Mamá.']]}] });
