/* ================================================================
   VoxelCraft — script.js
   Landscape mobile + desktop voxel game (Three.js r128)
   ================================================================ */
'use strict';
window.addEventListener('contextmenu',e=>e.preventDefault());

// ================================================================
//  BLOCK & ITEM CONSTANTS
// ================================================================
const B={AIR:0,GRASS:1,DIRT:2,STONE:3,COBBLE:4,SAND:5,
         GRAVEL:6,WOOD:7,LEAVES:8,PLANKS:9,CRAFTING:10,
         WATER:11,BEDROCK:12,TORCH:13};

const I={STICK:100,SWORD_W:101,SWORD_S:102,PICK_W:103,PICK_S:104,AXE_S:105,
         FLESH:200,FEATHER:201,BONE:202};

// Block definitions
// colors: [top, bottom, north, south, west, east]
// solid:true means faces are culled by this block from neighbours
const BD={
  [B.GRASS]:  {name:'Grass',         icon:'🟩',hard:0.6, drops:B.DIRT,   solid:true,
               col:[0x4caf50,0x4caf50,0x4caf50,0x4caf50,0x5d4037,0x5d4037]},
  [B.DIRT]:   {name:'Dirt',          icon:'🟫',hard:0.5, drops:B.DIRT,   solid:true,
               col:[0x6d4c41,0x6d4c41,0x6d4c41,0x6d4c41,0x6d4c41,0x6d4c41]},
  [B.STONE]:  {name:'Stone',         icon:'⬜',hard:1.5, drops:B.COBBLE, solid:true,
               col:[0x9e9e9e,0x9e9e9e,0x9e9e9e,0x9e9e9e,0x9e9e9e,0x9e9e9e]},
  [B.COBBLE]: {name:'Cobblestone',   icon:'🪨',hard:2.0, drops:B.COBBLE, solid:true,
               col:[0x757575,0x757575,0x757575,0x757575,0x757575,0x757575]},
  [B.SAND]:   {name:'Sand',          icon:'🏜️',hard:0.5, drops:B.SAND,   solid:true,gravity:true,
               col:[0xc8b560,0xc8b560,0xc8b560,0xc8b560,0xc8b560,0xc8b560]},
  [B.GRAVEL]: {name:'Gravel',        icon:'🌑',hard:0.6, drops:B.GRAVEL, solid:true,gravity:true,
               col:[0x8d8d80,0x8d8d80,0x8d8d80,0x8d8d80,0x8d8d80,0x8d8d80]},
  [B.WOOD]:   {name:'Wood Log',      icon:'🪵',hard:2.0, drops:B.WOOD,   solid:true,
               col:[0x8d6e32,0x8d6e32,0x8d6e32,0x8d6e32,0xa0845a,0xa0845a]},
  [B.LEAVES]: {name:'Leaves',        icon:'🍃',hard:0.2, drops:B.LEAVES, solid:true,
               col:[0x33691e,0x2e7d32,0x388e3c,0x388e3c,0x2e7d32,0x388e3c]},
  [B.PLANKS]: {name:'Wood Planks',   icon:'📦',hard:2.0, drops:B.PLANKS, solid:true,
               col:[0xbc8a4a,0xbc8a4a,0xbc8a4a,0xbc8a4a,0xbc8a4a,0xbc8a4a]},
  [B.CRAFTING]:{name:'Crafting Table',icon:'🔨',hard:2.5,drops:B.CRAFTING,solid:true,
               col:[0x7a5c2e,0x7a5c2e,0x9c7a40,0x9c7a40,0x9c7a40,0x9c7a40]},
  [B.WATER]:  {name:'Water',         icon:'💧',hard:-1,  drops:0,        solid:false,fluid:true,
               col:[0x1565c0,0x1565c0,0x1976d2,0x1976d2,0x1976d2,0x1976d2]},
  [B.BEDROCK]:{name:'Bedrock',       icon:'⬛',hard:-1,  drops:0,        solid:true,
               col:[0x212121,0x212121,0x212121,0x212121,0x212121,0x212121]},
  [B.TORCH]:  {name:'Torch',         icon:'🔥',hard:0.1, drops:B.TORCH,  solid:false,
               col:[0xffd54f,0xffd54f,0xffd54f,0xffd54f,0xffd54f,0xffd54f]},
};

const ID={
  [I.STICK]:  {name:'Stick',          icon:'🥢',dmg:1, tool:''},
  [I.SWORD_W]:{name:'Wooden Sword',   icon:'🔪',dmg:4, tool:'sword'},
  [I.SWORD_S]:{name:'Stone Sword',    icon:'⚔️', dmg:7, tool:'sword'},
  [I.PICK_W]: {name:'Wooden Pickaxe', icon:'🔨',dmg:2, tool:'pick'},
  [I.PICK_S]: {name:'Stone Pickaxe',  icon:'⛏️', dmg:2, tool:'pick'},
  [I.AXE_S]:  {name:'Stone Axe',      icon:'🪓',dmg:4, tool:'axe'},
  [I.FLESH]:  {name:'Rotten Flesh',   icon:'🫀',dmg:0, tool:''},
  [I.FEATHER]:{name:'Feather',        icon:'🪶',dmg:0, tool:''},
  [I.BONE]:   {name:'Bone',           icon:'🦴',dmg:0, tool:''},
};

// ── Crafting Recipes ──────────────────────────────────────────
const RECIPES={};
function addR(cells,id,n=1){RECIPES[cells.join(',')]={id,n};}
// 2x2 mapped into 3x3 top-left
function r22(a,b,c,d,id,n=1){addR([a,b,0,c,d,0,0,0,0],id,n);}
function r33(arr,id,n=1){addR(arr,id,n);}

r22(B.WOOD,B.WOOD,B.WOOD,B.WOOD,        B.PLANKS,4);
r22(B.PLANKS,B.PLANKS,B.PLANKS,B.PLANKS,B.CRAFTING,1);
r33([0,B.PLANKS,0,  0,B.PLANKS,0,  0,0,0],           I.STICK,4);
r33([0,B.PLANKS,0,  0,B.PLANKS,0,  0,I.STICK,0],      I.SWORD_W,1);
r33([0,B.COBBLE,0,  0,B.COBBLE,0,  0,I.STICK,0],      I.SWORD_S,1);
r33([B.PLANKS,B.PLANKS,B.PLANKS, 0,I.STICK,0, 0,I.STICK,0], I.PICK_W,1);
r33([B.COBBLE,B.COBBLE,B.COBBLE, 0,I.STICK,0, 0,I.STICK,0], I.PICK_S,1);
r33([B.COBBLE,B.COBBLE,0, B.COBBLE,I.STICK,0, 0,I.STICK,0], I.AXE_S,1);

// ================================================================
//  WORLD CONSTANTS
// ================================================================
const CW=16, CH=64, RDIST=3, SEA=16;

// ================================================================
//  GLOBALS
// ================================================================
let scene,camera,renderer,clock;
let noise;
let gState='loading';

const chunks=new Map(), meshMap=new Map(), wMeshMap=new Map();
const entities=[], drops=[];

// Player
const PL={
  pos:new THREE.Vector3(0,CH,0),
  vel:new THREE.Vector3(),
  yaw:0,pitch:0,
  hp:20,maxHp:20,
  onGround:false,
  sel:0,
  inv:Array.from({length:36},()=>({id:0,n:0})),
  atkCD:0,dmgCD:0,dead:false,
  bkTarget:null,bkProg:0,bkActive:false,
  using3x3:false
};

const KEYS={};
const MOUSE={l:false,r:false};
let locked=false;

// Touch state
const TC={
  joyId:null,joyOx:0,joyOy:0,jdx:0,jdy:0,
  camId:null,camPx:0,camPy:0,
  jump:false,breaking:false,attack:false,
  lookUp:false,lookDn:false
};

const craftGrid=new Array(9).fill(0);
let craftSel=null;

let dayT=0;
const DAY_LEN=1200;
let fps=60,fAcc=0,fN=0;

// ================================================================
//  INIT
// ================================================================
window.addEventListener('load',init);

async function init(){
  noise=new SimplexNoise();

  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x87ceeb);
  scene.fog=new THREE.Fog(0x87ceeb,RDIST*CW*0.55,RDIST*CW);

  camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.05,320);

  renderer=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);

  // Sun + ambient
  const sun=new THREE.DirectionalLight(0xfff5e0,1.0);
  sun.position.set(80,160,80);
  scene.add(sun);
  const amb=new THREE.AmbientLight(0xffffff,0.55);
  scene.add(amb);
  window._SUN=sun; window._AMB=amb;

  clock=new THREE.Clock();

  await buildWorld();

  // Starter items
  give(B.DIRT,10); give(B.PLANKS,6); give(B.COBBLE,8); give(B.WOOD,4);

  setupInput();
  setupUI();
  updateHotbar();
  updateHp();
  spawnAnimals();

  // Safe spawn Y
  const sy=surfY(0,0)+2;
  PL.pos.set(0.5,sy,0.5);

  document.getElementById('loading').style.display='none';
  gState='playing';
  if(!isMobile()) document.getElementById('c').requestPointerLock();

  loop();
}

// ================================================================
//  WORLD BUILD (async with progress)
// ================================================================
async function buildWorld(){
  setLd('Building terrain…',10);
  const total=(RDIST*2+1)**2; let done=0;
  for(let dx=-RDIST;dx<=RDIST;dx++){
    for(let dz=-RDIST;dz<=RDIST;dz++){
      genChunk(dx,dz); done++;
      setLd('Building terrain…',10+85*(done/total));
      if(done%3===0) await tick();
    }
  }
  setLd('Meshing…',96);
  await tick();
  for(const [k] of chunks){const[cx,cz]=k.split(',').map(Number);buildMesh(cx,cz);}
  setLd('Done',100);
  await new Promise(r=>setTimeout(r,60));
}
function setLd(m,p){
  document.getElementById('load-msg').textContent=m;
  document.getElementById('load-bar').style.width=p+'%';
}
function tick(){return new Promise(r=>setTimeout(r,0));}

// ================================================================
//  CHUNK GENERATION
// ================================================================
function ck(cx,cz){return cx+','+cz;}

function genChunk(cx,cz){
  const key=ck(cx,cz);
  if(chunks.has(key))return;
  const data=new Uint8Array(CW*CH*CW);
  const SET=(x,y,z,v)=>{data[y*CW*CW+z*CW+x]=v;};

  for(let x=0;x<CW;x++){
    for(let z=0;z<CW;z++){
      const wx=cx*CW+x, wz=cz*CW+z;
      const bio=noise.noise2D(wx*0.004,wz*0.004);
      const isSand=bio<-0.25;
      const isForest=bio>-0.05&&bio<0.35;
      const base=noise.noise2D(wx*0.018,wz*0.018)*9;
      const det =noise.noise2D(wx*0.07, wz*0.07 )*3;
      const hill=bio>0.3?noise.noise2D(wx*0.009,wz*0.009)*14:0;
      const surf=Math.floor(SEA+base+det+hill);

      SET(x,0,z,B.BEDROCK);
      for(let y=1;y<CH;y++){
        if(y>surf){
          if(y<=SEA) SET(x,y,z,B.WATER);
        } else if(y<surf-4){
          const gv=noise.noise2D(wx*0.12+y*0.05,wz*0.12+y*0.05);
          SET(x,y,z,gv>0.72?B.GRAVEL:B.STONE);
        } else if(y<surf){
          SET(x,y,z,isSand?B.SAND:B.DIRT);
        } else {
          SET(x,y,z,isSand?B.SAND:B.GRASS);
        }
      }

      // Trees — forest biome + occasional elsewhere
      if(!isSand && surf>SEA && surf+10<CH-2){
        const tn=noise.noise2D(wx*0.55+7.3,wz*0.55+13.1);
        const thr=isForest?0.48:0.72;
        if(tn>thr){
          const th=5+Math.floor(Math.abs(noise.noise2D(wx*1.1,wz*1.1))*3);
          // Trunk
          for(let t=1;t<=th;t++){
            const by=surf+t; if(by<CH) SET(x,by,z,B.WOOD);
          }
          // Canopy (round sphere shape)
          for(let lx=-2;lx<=2;lx++)for(let lz=-2;lz<=2;lz++)for(let ly=-1;ly<=3;ly++){
            const bx=x+lx,bz=z+lz,by=surf+th+ly;
            if(bx<0||bx>=CW||bz<0||bz>=CW||by<0||by>=CH)continue;
            const d2=lx*lx+lz*lz+(ly-1)*(ly-1);
            if(d2<=6&&data[by*CW*CW+bz*CW+bx]===B.AIR)
              data[by*CW*CW+bz*CW+bx]=B.LEAVES;
          }
          // Top spike
          if(surf+th+3<CH) SET(x,surf+th+3,z,B.LEAVES);
        }
      }
    }
  }
  chunks.set(key,data);
}

// ================================================================
//  BLOCK ACCESS
// ================================================================
function getBlock(wx,wy,wz){
  if(wy<0)return B.BEDROCK; if(wy>=CH)return B.AIR;
  const cx=Math.floor(wx/CW),cz=Math.floor(wz/CW);
  const d=chunks.get(ck(cx,cz)); if(!d)return B.AIR;
  const lx=((wx%CW)+CW)%CW, lz=((wz%CW)+CW)%CW;
  return d[wy*CW*CW+lz*CW+lx];
}

function setBlock(wx,wy,wz,type){
  if(wy<0||wy>=CH)return;
  const cx=Math.floor(wx/CW),cz=Math.floor(wz/CW);
  const d=chunks.get(ck(cx,cz)); if(!d)return;
  const lx=((wx%CW)+CW)%CW, lz=((wz%CW)+CW)%CW;
  d[wy*CW*CW+lz*CW+lx]=type;
  rebuildAround(cx,cz,lx,lz);
}

function rebuildAround(cx,cz,lx,lz){
  buildMesh(cx,cz);
  if(lx===0)       buildMesh(cx-1,cz);
  if(lx===CW-1)    buildMesh(cx+1,cz);
  if(lz===0)       buildMesh(cx,cz-1);
  if(lz===CW-1)    buildMesh(cx,cz+1);
}

// ================================================================
//  MESH BUILDING — Proper face culling, NO transparency leaks
// ================================================================
const FACES=[
  {n:[0,1,0], v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]], s:0}, // top
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]], s:1}, // bottom
  {n:[0,0,-1],v:[[1,1,0],[0,1,0],[0,0,0],[1,0,0]], s:2}, // north
  {n:[0,0,1], v:[[0,1,1],[1,1,1],[1,0,1],[0,0,1]], s:3}, // south
  {n:[-1,0,0],v:[[0,1,0],[0,1,1],[0,0,1],[0,0,0]], s:4}, // west
  {n:[1,0,0], v:[[1,1,1],[1,1,0],[1,0,0],[1,0,1]], s:5}, // east
];
const SHADE=[1.0,0.5,0.75,0.75,0.65,0.65];

// Returns true if block B fully occludes a face (solid opaque block)
function isSolid(b){
  if(b===B.AIR)return false;
  const bd=BD[b]; if(!bd)return false;
  return !!bd.solid && !bd.fluid;
}

function buildMesh(cx,cz){
  const d=chunks.get(ck(cx,cz)); if(!d)return;
  const key=ck(cx,cz);

  // Separate arrays for solid and water geometry
  const SP=[],SC=[],SI=[];   // solid positions, colors, indices
  const WP=[],WC=[],WI=[];   // water
  let sv=0,wv=0;

  for(let y=0;y<CH;y++){
    for(let z=0;z<CW;z++){
      for(let x=0;x<CW;x++){
        const b=d[y*CW*CW+z*CW+x];
        if(b===B.AIR)continue;
        const bd=BD[b]; if(!bd)continue;
        const isWater=(b===B.WATER);
        const wx=cx*CW+x, wz=cz*CW+z;

        for(const f of FACES){
          const[nx,ny,nz]=f.n;
          const nb=getBlock(wx+nx,y+ny,wz+nz);

          // ── CULLING RULES ──
          // 1. Same block culls (water vs water, leaves vs leaves)
          if(nb===b)continue;
          // 2. Any SOLID opaque block culls the face
          if(isSolid(nb))continue;
          // 3. Water is only culled by solid blocks (handled above)
          // 4. Leaves are culled by solid blocks only (handled above)
          // → Face is VISIBLE, add it

          const shade=SHADE[f.s];
          const raw=bd.col[f.s];
          const r=((raw>>16)&255)/255*shade;
          const g=((raw>>8)&255)/255*shade;
          const bl=(raw&255)/255*shade;

          if(isWater){
            for(const v of f.v){
              WP.push(wx+v[0], y+(f.s===0?0.88:v[1]), wz+v[2]);
              WC.push(r,g,bl);
            }
            WI.push(wv,wv+1,wv+2,wv,wv+2,wv+3); wv+=4;
          } else {
            for(const v of f.v){
              SP.push(wx+v[0],y+v[1],wz+v[2]);
              SC.push(r,g,bl);
            }
            SI.push(sv,sv+1,sv+2,sv,sv+2,sv+3); sv+=4;
          }
        }
      }
    }
  }

  // Remove old meshes
  const om=meshMap.get(key); if(om){scene.remove(om);om.geometry.dispose();meshMap.delete(key);}
  const ow=wMeshMap.get(key);if(ow){scene.remove(ow);ow.geometry.dispose();wMeshMap.delete(key);}

  // Build solid mesh
  if(SP.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(SP,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(SC,3));
    geo.setIndex(SI);
    geo.computeVertexNormals();
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.FrontSide});
    const m=new THREE.Mesh(geo,mat);
    scene.add(m); meshMap.set(key,m);
  }

  // Build water mesh
  if(WP.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(WP,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(WC,3));
    geo.setIndex(WI);
    geo.computeVertexNormals();
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false});
    const m=new THREE.Mesh(geo,mat);
    scene.add(m); wMeshMap.set(key,m);
  }
}

// ================================================================
//  CHUNK STREAMING
// ================================================================
function streamChunks(){
  const pcx=Math.floor(PL.pos.x/CW), pcz=Math.floor(PL.pos.z/CW);
  for(let dx=-RDIST;dx<=RDIST;dx++){
    for(let dz=-RDIST;dz<=RDIST;dz++){
      const cx=pcx+dx,cz=pcz+dz,key=ck(cx,cz);
      if(!chunks.has(key)){genChunk(cx,cz);buildMesh(cx,cz);}
    }
  }
  for(const[key,m]of meshMap){
    const[cx,cz]=key.split(',').map(Number);
    if(Math.abs(cx-pcx)>RDIST+1||Math.abs(cz-pcz)>RDIST+1){
      scene.remove(m);m.geometry.dispose();meshMap.delete(key);
      const w=wMeshMap.get(key);if(w){scene.remove(w);w.geometry.dispose();wMeshMap.delete(key);}
      chunks.delete(key);
    }
  }
}

// ================================================================
//  PHYSICS
// ================================================================
const GRAV=-28, JUMP=9, SPD=4.8, PW=0.3, PH=1.8;

function updatePlayer(dt){
  if(PL.dead)return;
  PL.atkCD=Math.max(0,PL.atkCD-dt);
  PL.dmgCD=Math.max(0,PL.dmgCD-dt);

  // Look-up / look-down touch buttons
  if(TC.lookUp) PL.pitch=Math.max(-Math.PI/2+0.05,PL.pitch-2.2*dt);
  if(TC.lookDn) PL.pitch=Math.min( Math.PI/2-0.05,PL.pitch+2.2*dt);

  // Movement
  const fw=new THREE.Vector3(-Math.sin(PL.yaw),0,-Math.cos(PL.yaw));
  const rt=new THREE.Vector3( Math.cos(PL.yaw),0,-Math.sin(PL.yaw));
  const mv=new THREE.Vector3();

  if(Math.abs(TC.jdx)>0.05||Math.abs(TC.jdy)>0.05){
    mv.addScaledVector(fw,-TC.jdy).addScaledVector(rt,TC.jdx);
  } else {
    if(KEYS['KeyW']||KEYS['ArrowUp'])   mv.add(fw);
    if(KEYS['KeyS']||KEYS['ArrowDown']) mv.sub(fw);
    if(KEYS['KeyA']||KEYS['ArrowLeft']) mv.sub(rt);
    if(KEYS['KeyD']||KEYS['ArrowRight'])mv.add(rt);
  }
  if(mv.lengthSq()>0)mv.normalize().multiplyScalar(SPD);
  PL.vel.x=mv.x; PL.vel.z=mv.z;

  // Water
  const inW=getBlock(Math.floor(PL.pos.x),Math.floor(PL.pos.y+0.5),Math.floor(PL.pos.z))===B.WATER;
  if(inW){
    PL.vel.y*=0.78;
    if((KEYS['Space']||TC.jump)&&PL.vel.y<2) PL.vel.y+=6*dt;
  } else {
    PL.vel.y+=GRAV*dt; PL.vel.y=Math.max(PL.vel.y,-40);
    if((KEYS['Space']||TC.jump)&&PL.onGround){PL.vel.y=JUMP;PL.onGround=false;}
  }

  sweep(dt);

  camera.position.set(PL.pos.x,PL.pos.y+PH-0.2,PL.pos.z);
  camera.rotation.order='YXZ';
  camera.rotation.y=PL.yaw;
  camera.rotation.x=PL.pitch;

  if(PL.pos.y<-20)die('Fell into the void');
}

function sweep(dt){
  PL.pos.x+=PL.vel.x*dt;
  if(aabb(PL.pos)){PL.pos.x-=PL.vel.x*dt;PL.vel.x=0;}
  PL.pos.z+=PL.vel.z*dt;
  if(aabb(PL.pos)){PL.pos.z-=PL.vel.z*dt;PL.vel.z=0;}
  PL.pos.y+=PL.vel.y*dt;
  if(aabb(PL.pos)){
    if(PL.vel.y<0)PL.onGround=true;
    PL.pos.y-=PL.vel.y*dt;PL.vel.y=0;
  } else {
    const t=PL.pos.clone();t.y-=0.05;
    PL.onGround=aabb(t);
  }
}

function aabb(pos){
  for(let x=Math.floor(pos.x-PW);x<=Math.floor(pos.x+PW);x++){
    for(let y=Math.floor(pos.y);y<=Math.floor(pos.y+PH);y++){
      for(let z=Math.floor(pos.z-PW);z<=Math.floor(pos.z+PW);z++){
        const b=getBlock(x,y,z);
        // Solid blocks stop movement; water and leaves don't
        if(b!==B.AIR&&b!==B.WATER&&b!==B.LEAVES)return true;
      }
    }
  }
  return false;
}

// ================================================================
//  RAYCASTING
// ================================================================
function raycast(maxD=5){
  const dir=new THREE.Vector3();
  camera.getWorldDirection(dir);
  const o=camera.position.clone();
  const step=0.04;
  let px=Math.floor(o.x),py=Math.floor(o.y),pz=Math.floor(o.z);
  for(let d=step;d<=maxD;d+=step){
    const x=Math.floor(o.x+dir.x*d);
    const y=Math.floor(o.y+dir.y*d);
    const z=Math.floor(o.z+dir.z*d);
    const b=getBlock(x,y,z);
    if(b!==B.AIR&&b!==B.WATER)return{x,y,z,px,py,pz,b};
    px=x;py=y;pz=z;
  }
  return null;
}

// ================================================================
//  BLOCK BREAKING
// ================================================================
function updateBreaking(dt){
  const act=MOUSE.l||TC.breaking;
  if(!act){resetBk();return;}
  const hit=raycast();
  if(!hit){resetBk();return;}
  const tk=hit.x+','+hit.y+','+hit.z;
  if(PL.bkTarget!==tk){PL.bkTarget=tk;PL.bkProg=0;}
  const bd=BD[hit.b];
  if(!bd||bd.hard<0){resetBk();return;}

  let spd=1;
  const sel=hotItem();
  if(sel&&sel.id>=100&&ID[sel.id]){
    const t=ID[sel.id].tool;
    if(t==='pick'&&(hit.b===B.STONE||hit.b===B.COBBLE||hit.b===B.GRAVEL))spd=4;
    if(t==='axe'&&(hit.b===B.WOOD||hit.b===B.PLANKS||hit.b===B.CRAFTING))spd=4;
  }

  PL.bkActive=true;
  PL.bkProg+=dt*spd/bd.hard;

  const pct=Math.min(PL.bkProg*100,100);
  document.getElementById('bkwrap').style.display='block';
  document.getElementById('bkfill').style.width=pct+'%';

  if(PL.bkProg>=1){
    if(bd.drops)spawnDrop(hit.x+0.5,hit.y+0.7,hit.z+0.5,bd.drops);
    setBlock(hit.x,hit.y,hit.z,B.AIR);
    resetBk();
  }
}

function resetBk(){
  PL.bkActive=false;PL.bkProg=0;PL.bkTarget=null;
  document.getElementById('bkwrap').style.display='none';
}

function doPlace(){
  const hit=raycast();
  if(!hit)return;
  const sel=hotItem();
  if(!sel||!sel.id||sel.id>=100)return;
  const{px,py,pz}=hit;
  if(getBlock(px,py,pz)!==B.AIR)return;
  // Don't place inside player body
  const bx=Math.floor(PL.pos.x),bz=Math.floor(PL.pos.z);
  if(px===bx&&pz===bz&&(py===Math.floor(PL.pos.y)||py===Math.floor(PL.pos.y)+1))return;
  setBlock(px,py,pz,sel.id);
  removeHot(PL.sel,1);
  updateHotbar();
  if(sel.id===B.CRAFTING)toast('Crafting Table placed! Right-click to use');
}

function openCraftingTable(){
  const hit=raycast(4);
  if(hit&&hit.b===B.CRAFTING){PL.using3x3=true;openInv();}
  else doPlace();
}

// ================================================================
//  ITEM DROPS
// ================================================================
const DCOLS={
  [B.GRASS]:0x4caf50,[B.DIRT]:0x6d4c41,[B.STONE]:0x9e9e9e,[B.COBBLE]:0x757575,
  [B.SAND]:0xc8b560,[B.GRAVEL]:0x8d8d80,[B.WOOD]:0x8d6e32,[B.LEAVES]:0x33691e,
  [B.PLANKS]:0xbc8a4a,[B.CRAFTING]:0x9c7a40,[B.TORCH]:0xffd54f,
  [I.FLESH]:0xe53935,[I.FEATHER]:0xffffff,[I.BONE]:0xf5f5f5,
  [I.STICK]:0x8d6e32,[I.SWORD_W]:0xbc8a4a,[I.SWORD_S]:0x9e9e9e,
  [I.PICK_W]:0xbc8a4a,[I.PICK_S]:0x9e9e9e,[I.AXE_S]:0x9e9e9e,
};

function spawnDrop(x,y,z,id){
  const col=DCOLS[id]||0xffaa22;
  const m=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3),new THREE.MeshLambertMaterial({color:col}));
  m.position.set(x,y,z);scene.add(m);
  drops.push({m,id,vel:new THREE.Vector3((Math.random()-.5)*2,3,(Math.random()-.5)*2),age:0,gone:false});
}

function updateDrops(dt){
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    if(d.gone){scene.remove(d.m);d.m.geometry.dispose();drops.splice(i,1);continue;}
    d.age+=dt;
    d.vel.y-=18*dt;
    d.m.position.addScaledVector(d.vel,dt);
    d.m.rotation.y+=2*dt;
    // Ground
    const by=Math.floor(d.m.position.y-0.2);
    const bb=getBlock(Math.floor(d.m.position.x),by,Math.floor(d.m.position.z));
    if(bb!==B.AIR&&bb!==B.WATER&&d.vel.y<0){
      d.m.position.y=by+1.2;d.vel.y=0;d.vel.x*=0.65;d.vel.z*=0.65;
    }
    // Pickup
    const dx=d.m.position.x-PL.pos.x,dy=d.m.position.y-(PL.pos.y+0.9),dz=d.m.position.z-PL.pos.z;
    if(d.age>0.5&&dx*dx+dy*dy+dz*dz<2.25){
      give(d.id,1);toast('+ '+getName(d.id));d.gone=true;
    }
    if(d.age>90)d.gone=true;
  }
}

// ================================================================
//  ENTITIES (MOBS)
// ================================================================
function mkBox(w,h,d,color){
  return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
}
function mkZombie(x,y,z){
  const g=new THREE.Group();
  const body=mkBox(0.6,0.9,0.3,0x2d4a2d);body.position.set(0,0.9,0);g.add(body);
  const head=mkBox(0.5,0.5,0.5,0x4a7a4a);head.position.set(0,1.6,0);g.add(head);
  const lA=mkBox(0.25,0.7,0.25,0x2d4a2d);lA.position.set(-0.43,0.9,0.25);g.add(lA);
  const rA=mkBox(0.25,0.7,0.25,0x2d4a2d);rA.position.set( 0.43,0.9,0.25);g.add(rA);
  const lL=mkBox(0.25,0.8,0.25,0x1a2a6e);lL.position.set(-0.2,0.28,0);g.add(lL);
  const rL=mkBox(0.25,0.8,0.25,0x1a2a6e);rL.position.set( 0.2,0.28,0);g.add(rL);
  g.position.set(x,y,z);scene.add(g);
  return{type:'zombie',g,lA,rA,lL,rL,
    pos:new THREE.Vector3(x,y,z),vel:new THREE.Vector3(),
    hp:20,maxHp:20,onGround:false,atkCD:0,animT:0,
    wDir:new THREE.Vector2(Math.random()-.5,Math.random()-.5).normalize(),wTimer:0};
}
function mkChicken(x,y,z){
  const g=new THREE.Group();
  const body=mkBox(0.5,0.35,0.7,0xfafafa);body.position.set(0,0.5,0);g.add(body);
  const head=mkBox(0.3,0.3,0.3,0xfafafa);head.position.set(0,0.82,0.28);g.add(head);
  const beak=mkBox(0.1,0.08,0.14,0xffa726);beak.position.set(0,0.78,0.45);g.add(beak);
  const lL=mkBox(0.08,0.25,0.08,0xffa726);lL.position.set(-0.12,0.15,0);g.add(lL);
  const rL=mkBox(0.08,0.25,0.08,0xffa726);rL.position.set( 0.12,0.15,0);g.add(rL);
  g.position.set(x,y,z);scene.add(g);
  return{type:'chicken',g,lL,rL,
    pos:new THREE.Vector3(x,y,z),vel:new THREE.Vector3(),
    hp:4,maxHp:4,onGround:false,animT:0,
    wDir:new THREE.Vector2(Math.random()-.5,Math.random()-.5).normalize(),wTimer:0};
}

function surfY(bx,bz){
  for(let y=CH-1;y>=0;y--){
    const b=getBlock(bx,y,bz);
    if(b!==B.AIR&&b!==B.WATER)return y+1;
  }
  return 2;
}

function spawnAnimals(){
  for(let i=0;i<5;i++){
    const a=Math.random()*Math.PI*2,r=6+Math.random()*14;
    const x=PL.pos.x+Math.cos(a)*r,z=PL.pos.z+Math.sin(a)*r;
    const y=surfY(Math.floor(x),Math.floor(z));
    if(y>1)entities.push(mkChicken(x,y,z));
  }
}

let mobT=0;
function updateEntities(dt){
  mobT+=dt;
  const night=isNight();

  if(night&&mobT>7&&entities.filter(e=>e.type==='zombie').length<14){
    mobT=0;
    for(let i=0;i<2;i++){
      const a=Math.random()*Math.PI*2,r=12+Math.random()*20;
      const x=PL.pos.x+Math.cos(a)*r,z=PL.pos.z+Math.sin(a)*r;
      const y=surfY(Math.floor(x),Math.floor(z));
      if(y>1&&y<CH-2)entities.push(mkZombie(x+0.5,y,z+0.5));
    }
  }
  if(!night&&mobT>25)mobT=0;

  for(let i=entities.length-1;i>=0;i--){
    const e=entities[i];
    if(e.hp<=0){
      if(e.type==='zombie')spawnDrop(e.pos.x,e.pos.y+0.5,e.pos.z,I.FLESH);
      if(e.type==='chicken')spawnDrop(e.pos.x,e.pos.y+0.5,e.pos.z,I.FEATHER);
      scene.remove(e.g);entities.splice(i,1);
      toast(e.type==='zombie'?'Zombie slain! ⚔️':'Chicken slain! 🐔');
      continue;
    }

    e.vel.y=Math.max(e.vel.y-20*dt,-30);
    if(e.type==='zombie')tickZombie(e,dt);
    else tickChicken(e,dt);

    // Move
    e.pos.x+=e.vel.x*dt; e.pos.z+=e.vel.z*dt;
    // Wall collision
    const eb=getBlock(Math.floor(e.pos.x),Math.floor(e.pos.y)+1,Math.floor(e.pos.z));
    if(eb!==B.AIR&&eb!==B.WATER&&eb!==B.LEAVES){
      e.pos.x-=e.vel.x*dt;e.pos.z-=e.vel.z*dt;
      e.wDir.set(Math.random()-.5,Math.random()-.5).normalize();
      if(e.onGround)e.vel.y=7;
    }
    // Vertical
    e.pos.y+=e.vel.y*dt;
    const gy=surfY(Math.floor(e.pos.x),Math.floor(e.pos.z));
    if(e.pos.y<gy){e.pos.y=gy;e.vel.y=0;e.onGround=true;}else e.onGround=false;
    e.g.position.copy(e.pos);
  }
}

function tickZombie(e,dt){
  e.atkCD=Math.max(0,e.atkCD-dt);
  const dx=PL.pos.x-e.pos.x,dz=PL.pos.z-e.pos.z;
  const dist=Math.sqrt(dx*dx+dz*dz);
  if(dist<18&&night()){
    const spd=2.8;
    e.vel.x=dx/dist*spd;e.vel.z=dz/dist*spd;
    e.g.rotation.y=Math.atan2(dx,dz);
    if(dist<1.5&&e.atkCD<=0&&!PL.dead){hurtPlayer(2,'a zombie');e.atkCD=1.0;}
  } else {
    e.wTimer-=dt;
    if(e.wTimer<=0){e.wDir.set(Math.random()-.5,Math.random()-.5).normalize();e.wTimer=2+Math.random()*3;}
    e.vel.x=e.wDir.x*1.2;e.vel.z=e.wDir.y*1.2;
    e.g.rotation.y=Math.atan2(e.wDir.x,e.wDir.y);
  }
  if(!night())e.hp-=3*dt; // burn in daylight
  e.animT+=dt*4*(Math.abs(e.vel.x)+Math.abs(e.vel.z)>0.1?1:0);
  e.lA.rotation.x=Math.sin(e.animT)*0.55;
  e.rA.rotation.x=Math.sin(e.animT+Math.PI)*0.55;
  e.lL.rotation.x=Math.sin(e.animT+Math.PI)*0.4;
  e.rL.rotation.x=Math.sin(e.animT)*0.4;
}
function tickChicken(e,dt){
  e.wTimer-=dt;
  if(e.wTimer<=0){
    if(Math.random()<0.35){e.vel.x=0;e.vel.z=0;}
    else e.wDir.set(Math.random()-.5,Math.random()-.5).normalize();
    e.wTimer=1+Math.random()*4;
    if(e.onGround&&Math.random()<0.2)e.vel.y=4.5;
  }
  if(Math.abs(e.vel.x)+Math.abs(e.vel.z)>0.05){
    e.vel.x=e.wDir.x*0.9;e.vel.z=e.wDir.y*0.9;
    e.g.rotation.y=Math.atan2(e.wDir.x,e.wDir.y);
  }
  e.animT+=dt*5;
  e.lL.rotation.x=Math.sin(e.animT)*0.5;
  e.rL.rotation.x=Math.sin(e.animT+Math.PI)*0.5;
}

function night(){return dayT>0.5;}
function isNight(){return dayT>0.5;}

// ================================================================
//  COMBAT
// ================================================================
function attackMelee(){
  if(PL.atkCD>0||PL.dead)return;
  PL.atkCD=0.45;
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);
  let best=null,bestD=4.5;
  for(const e of entities){
    const ev=e.pos.clone().sub(camera.position).normalize();
    if(ev.dot(dir)<0.6)continue;
    const d=e.pos.distanceTo(PL.pos);
    if(d<bestD){best=e;bestD=d;}
  }
  if(!best)return;
  const sel=hotItem();
  let dmg=1;
  if(sel&&sel.id>=100&&ID[sel.id])dmg=ID[sel.id].dmg;
  best.hp-=dmg;
  const kb=best.pos.clone().sub(PL.pos).normalize().multiplyScalar(5);
  best.vel.add(kb);best.vel.y=3;
  toast('Hit '+best.type+' ('+dmg+' dmg)');
}

function hurtPlayer(dmg,src){
  if(PL.dmgCD>0||PL.dead)return;
  PL.hp=Math.max(0,PL.hp-dmg);PL.dmgCD=0.5;
  flashDmg();updateHp();
  if(PL.hp<=0)die('Killed by '+(src||'unknown'));
}

function die(msg){
  PL.dead=true;
  document.getElementById('death-msg').textContent=msg||'';
  showScr('death-scr');gState='dead';
}
function respawn(){
  PL.dead=false;PL.hp=PL.maxHp;PL.vel.set(0,0,0);
  PL.pos.set(0.5,surfY(0,0)+2,0.5);
  resetBk();updateHp();hideScrs();gState='playing';
  if(!isMobile())document.getElementById('c').requestPointerLock();
}
function flashDmg(){
  const el=document.getElementById('dmg');
  el.style.background='rgba(220,0,0,0.45)';
  setTimeout(()=>el.style.background='transparent',280);
}

// ================================================================
//  DAY / NIGHT
// ================================================================
function updateDayNight(dt){
  dayT=(dayT+dt/DAY_LEN)%1;
  const t=dayT;
  let sr,sg,sb,si,ai;
  if(t<0.25){     const f=t/0.25;     sr=lerp(.08,.53,f);sg=lerp(.08,.81,f);sb=lerp(.2,.92,f);si=lerp(.15,1,f);ai=lerp(.08,.55,f);}
  else if(t<0.5){ sr=.53;sg=.81;sb=.92;si=1;ai=.55;}
  else if(t<0.75){const f=(t-.5)/.25; sr=lerp(.53,.04,f);sg=lerp(.81,.04,f);sb=lerp(.92,.08,f);si=lerp(1,.06,f);ai=lerp(.55,.05,f);}
  else{           sr=.02;sg=.02;sb=.05;si=.05;ai=.05;}
  scene.background.setRGB(sr,sg,sb);
  scene.fog.color.setRGB(sr,sg,sb);
  window._SUN.intensity=si; window._AMB.intensity=ai;
  const icon=t<0.25?'🌅':t<0.5?'☀️':t<0.75?'🌇':'🌙';
  const lbl=t<0.25?'Dawn':t<0.5?'Day':t<0.75?'Dusk':'Night';
  document.getElementById('t-icon').textContent=icon;
  document.getElementById('t-lbl').textContent=lbl;
}
function lerp(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t));}

// ================================================================
//  SAND / GRAVEL GRAVITY
// ================================================================
let fallT=0;
function tickFall(dt){
  fallT+=dt; if(fallT<0.22)return; fallT=0;
  const px=Math.floor(PL.pos.x),pz=Math.floor(PL.pos.z);
  for(let bx=px-10;bx<=px+10;bx++)for(let bz=pz-10;bz<=pz+10;bz++){
    for(let y=CH-2;y>=1;y--){
      const b=getBlock(bx,y,bz);
      if(BD[b]&&BD[b].gravity&&getBlock(bx,y-1,bz)===B.AIR){
        setBlock(bx,y,bz,B.AIR);setBlock(bx,y-1,bz,b);break;
      }
    }
  }
}

// ================================================================
//  WATER FLOW
// ================================================================
let waterT=0;
function tickWater(dt){
  waterT+=dt; if(waterT<1.2)return; waterT=0;
  const px=Math.floor(PL.pos.x),pz=Math.floor(PL.pos.z);
  for(let bx=px-14;bx<=px+14;bx++)for(let bz=pz-14;bz<=pz+14;bz++){
    for(let y=CH-2;y>=1;y--){
      if(getBlock(bx,y,bz)===B.WATER){
        if(getBlock(bx,y-1,bz)===B.AIR){setBlock(bx,y-1,bz,B.WATER);}
        else for(const[dx2,dz2]of[[1,0],[-1,0],[0,1],[0,-1]]){
          if(getBlock(bx+dx2,y,bz+dz2)===B.AIR)setBlock(bx+dx2,y,bz+dz2,B.WATER);
        }
      }
    }
  }
}

// ================================================================
//  INVENTORY
// ================================================================
function hotItem(){return PL.inv[27+PL.sel];}
function give(id,n){
  for(const s of PL.inv){if(s.id===id&&s.n<64){const a=Math.min(64-s.n,n);s.n+=a;n-=a;if(n<=0){updateHotbar();return;}}}
  for(const s of PL.inv){if(s.id===0){const a=Math.min(64,n);s.id=id;s.n=a;n-=a;if(n<=0){updateHotbar();return;}}}
  updateHotbar();
}
function removeHot(slot,n){
  const s=PL.inv[27+slot]; if(!s)return;
  s.n-=n; if(s.n<=0)PL.inv[27+slot]={id:0,n:0};
}
function getName(id){return BD[id]?BD[id].name:ID[id]?ID[id].name:'Item';}
function getIcon(id){return BD[id]?BD[id].icon:ID[id]?ID[id].icon:'?';}

// ================================================================
//  CRAFTING
// ================================================================
function getCraft(){
  const k=craftGrid.join(',');
  if(RECIPES[k])return RECIPES[k];
  const g2=[craftGrid[0],craftGrid[1],0,craftGrid[3],craftGrid[4],0,0,0,0];
  return RECIPES[g2.join(',')]||null;
}
function collectCraft(){
  const res=getCraft(); if(!res)return;
  const used={};
  craftGrid.forEach(id=>{if(id)used[id]=(used[id]||0)+1;});
  for(const[id,cnt]of Object.entries(used)){
    let left=+cnt;
    for(const s of PL.inv){if(s.id===+id&&left>0){const t=Math.min(s.n,left);s.n-=t;left-=t;if(s.n<=0)s.id=0;}}
  }
  craftGrid.fill(0);
  give(res.id,res.n);
  toast('Crafted: '+getName(res.id));
  rebuildCraftUI();updateInvDOM();updateHotbar();
}
function clearCraft(){craftGrid.fill(0);craftSel=null;rebuildCraftUI();}

// ================================================================
//  HUD
// ================================================================
function updateHp(){
  const row=document.getElementById('hp-row'); row.innerHTML='';
  for(let i=0;i<10;i++){
    const full=PL.hp>=i*2+2,half=PL.hp>=i*2+1;
    const el=document.createElement('div');
    el.className='heart';
    el.textContent=full?'❤️':half?'🩶':'🖤';
    row.appendChild(el);
  }
}
let toastTmr=null;
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;el.style.opacity='1';
  if(toastTmr)clearTimeout(toastTmr);
  toastTmr=setTimeout(()=>el.style.opacity='0',2500);
}
function updateHotbar(){
  const hb=document.getElementById('hotbar'); hb.innerHTML='';
  for(let i=0;i<9;i++){
    const s=PL.inv[27+i];
    const el=document.createElement('div');
    el.className='hslot'+(i===PL.sel?' on':'');
    el.innerHTML=`<span class="sn">${i+1}</span>`;
    if(s.id){
      el.innerHTML+=`<span>${getIcon(s.id)}</span>`;
      if(s.n>1)el.innerHTML+=`<span class="sc">${s.n}</span>`;
    }
    el.onclick=()=>{PL.sel=i;updateHotbar();};
    hb.appendChild(el);
  }
  const cur=hotItem();
  const tt=document.getElementById('ttip');
  if(cur&&cur.id){tt.textContent=getName(cur.id)+' ('+cur.n+')';tt.style.opacity='1';}
  else tt.style.opacity='0';
}

// ================================================================
//  INVENTORY SCREEN
// ================================================================
function openInv(){
  buildCraftUI();updateInvDOM();showScr('inv-scr');gState='inv';
  if(locked)document.exitPointerLock();
}
function closeInv(){
  hideScrs();gState='playing';PL.using3x3=false;
  if(!isMobile())document.getElementById('c').requestPointerLock();
}

function buildCraftUI(){
  const hold=document.getElementById('cgrid-hold'); hold.innerHTML='';
  const size=PL.using3x3?3:2;
  for(let row=0;row<size;row++){
    const rd=document.createElement('div');rd.className='cgrow';
    for(let col=0;col<size;col++){
      const ci=PL.using3x3?row*3+col:[0,1,3,4][row*2+col];
      const el=document.createElement('div');el.className='islot';el.dataset.ci=ci;
      if(craftGrid[ci])el.textContent=getIcon(craftGrid[ci]);
      el.addEventListener('click',()=>{
        if(craftSel!==null){craftGrid[ci]=craftSel;craftSel=null;}
        else if(craftGrid[ci])craftGrid[ci]=0;
        rebuildCraftUI();
      });
      rd.appendChild(el);
    }
    hold.appendChild(rd);
  }
  rebuildCraftUI();
}

function rebuildCraftUI(){
  document.querySelectorAll('[data-ci]').forEach(el=>{
    const ci=+el.dataset.ci;
    el.textContent=craftGrid[ci]?getIcon(craftGrid[ci]):'';
    el.className='islot'+(craftGrid[ci]?' sel':'');
    el.onclick=()=>{
      if(craftSel!==null){craftGrid[ci]=craftSel;craftSel=null;}
      else if(craftGrid[ci])craftGrid[ci]=0;
      rebuildCraftUI();
    };
  });
  const res=getCraft();
  const out=document.getElementById('cresult');
  if(res){
    out.innerHTML=`${getIcon(res.id)}<span class="sc">${res.n>1?res.n:''}</span>`;
    out.className='';
  } else {
    out.innerHTML='';out.className='empty';
  }
  const info=document.getElementById('craft-info');
  if(craftSel!==null){info.textContent='Tap a crafting slot to place '+getName(craftSel);info.style.color='var(--gold)';}
  else{info.textContent='Select item, then tap a crafting slot';info.style.color='';}
}

function updateInvDOM(){
  const main=document.getElementById('inv-main');
  const hbar=document.getElementById('inv-hbar');
  main.innerHTML='';hbar.innerHTML='';
  for(let i=0;i<27;i++)main.appendChild(mkSlot(i));
  for(let i=0;i<9;i++) hbar.appendChild(mkSlot(27+i));
}
function mkSlot(i){
  const s=PL.inv[i];
  const el=document.createElement('div');el.className='islot';
  if(s.id){
    el.textContent=getIcon(s.id);
    if(s.n>1){const c=document.createElement('span');c.className='sc';c.textContent=s.n;el.appendChild(c);}
    el.title=getName(s.id);
  }
  el.onclick=()=>{
    if(gState!=='inv')return;
    if(s.id){
      craftSel=s.id;
      document.querySelectorAll('#inv-main .islot,#inv-hbar .islot').forEach(e=>e.classList.remove('sel'));
      el.classList.add('sel');
      rebuildCraftUI();
    }
  };
  return el;
}

// ================================================================
//  SCREEN HELPERS
// ================================================================
function showScr(id){document.querySelectorAll('.screen').forEach(s=>s.style.display='none');const e=document.getElementById(id);if(e)e.style.display='flex';}
function hideScrs(){document.querySelectorAll('.screen').forEach(s=>s.style.display='none');}

// ================================================================
//  INPUT SETUP
// ================================================================
function setupInput(){
  document.addEventListener('keydown',e=>{
    KEYS[e.code]=true;
    if(e.code==='Escape'){
      if(gState==='inv')closeInv();
      else if(gState==='playing'){gState='paused';showScr('pause-scr');if(locked)document.exitPointerLock();}
      else if(gState==='paused'){gState='playing';hideScrs();document.getElementById('c').requestPointerLock();}
    }
    if(e.code==='KeyE'){if(gState==='inv')closeInv();else if(gState==='playing')openInv();}
    if(e.code==='KeyF'||e.code==='KeyQ')attackMelee();
    if(e.code.startsWith('Digit')){const n=parseInt(e.code[5])-1;if(n>=0&&n<9){PL.sel=n;updateHotbar();}}
    if(e.code==='F3'){const d=document.getElementById('dbg');d.style.display=d.style.display==='none'?'block':'none';}
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  });
  document.addEventListener('keyup',e=>{KEYS[e.code]=false;});

  const cv=document.getElementById('c');
  cv.addEventListener('click',()=>{if(gState==='playing'&&!isMobile())cv.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{locked=!!document.pointerLockElement;});

  document.addEventListener('mousemove',e=>{
    if(!locked)return;
    PL.yaw-=e.movementX*0.002;
    PL.pitch=Math.max(-Math.PI/2+0.05,Math.min(Math.PI/2-0.05,PL.pitch-e.movementY*0.002));
  });
  document.addEventListener('mousedown',e=>{
    if(gState!=='playing')return;
    if(e.button===0){MOUSE.l=true;if(!locked)cv.requestPointerLock();}
    if(e.button===2){MOUSE.r=true;openCraftingTable();}
  });
  document.addEventListener('mouseup',e=>{if(e.button===0)MOUSE.l=false;if(e.button===2)MOUSE.r=false;});
  document.addEventListener('wheel',e=>{PL.sel=(PL.sel+Math.sign(e.deltaY)+9)%9;updateHotbar();});

  // UI buttons
  document.getElementById('btn-resp').onclick=respawn;
  document.getElementById('btn-resume').onclick=()=>{gState='playing';hideScrs();document.getElementById('c').requestPointerLock();};
  document.getElementById('btn-inv-close').onclick=closeInv;
  document.getElementById('cresult').onclick=collectCraft;
  document.getElementById('btn-craft-clear').onclick=()=>{clearCraft();buildCraftUI();};

  if(isMobile())setupTouch();

  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

// ================================================================
//  TOUCH CONTROLS  — PUBG landscape style
// ================================================================
function setupTouch(){
  document.getElementById('tui').style.display='block';

  const joyZone=document.getElementById('joy-zone');
  const joyNub=document.getElementById('joy-nub');
  const camSwipe=document.getElementById('cam-swipe');
  const JR=65; // joystick max radius

  // ── Movement joystick ──
  joyZone.addEventListener('touchstart',e=>{
    e.preventDefault();
    const t=e.changedTouches[0];
    TC.joyId=t.identifier;
    const r=joyZone.getBoundingClientRect();
    TC.joyOx=r.left+r.width/2;TC.joyOy=r.top+r.height/2;
  },{passive:false});

  // ── Camera swipe (right half of screen) ──
  camSwipe.addEventListener('touchstart',e=>{
    e.preventDefault();
    // Only accept touches that are NOT on action buttons
    for(const t of e.changedTouches){
      if(TC.camId===null){
        TC.camId=t.identifier;TC.camPx=t.clientX;TC.camPy=t.clientY;
      }
    }
  },{passive:false});

  document.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      // Joystick
      if(t.identifier===TC.joyId){
        let dx=t.clientX-TC.joyOx,dy=t.clientY-TC.joyOy;
        const len=Math.sqrt(dx*dx+dy*dy);
        if(len>JR){dx=dx/len*JR;dy=dy/len*JR;}
        TC.jdx=dx/JR;TC.jdy=dy/JR;
        joyNub.style.transform=`translate(${dx}px,${dy}px)`;
      }
      // Camera swipe
      if(t.identifier===TC.camId){
        const dx=t.clientX-TC.camPx;
        const dy=t.clientY-TC.camPy;
        PL.yaw-=dx*0.005;
        PL.pitch=Math.max(-Math.PI/2+0.05,Math.min(Math.PI/2-0.05,PL.pitch+dy*0.005));
        TC.camPx=t.clientX;TC.camPy=t.clientY;
      }
    }
  },{passive:false});

  document.addEventListener('touchend',e=>{
    for(const t of e.changedTouches){
      if(t.identifier===TC.joyId){TC.joyId=null;TC.jdx=0;TC.jdy=0;joyNub.style.transform='';}
      if(t.identifier===TC.camId){TC.camId=null;}
    }
  });

  // ── Action buttons ──
  function tbtn(id,onFn,offFn){
    const el=document.getElementById(id); if(!el)return;
    el.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();onFn&&onFn();},{passive:false});
    if(offFn)el.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();offFn();},{passive:false});
    if(offFn)el.addEventListener('touchcancel',e=>{e.preventDefault();offFn();},{passive:false});
  }

  tbtn('tj', ()=>TC.jump=true,  ()=>TC.jump=false);
  tbtn('tb', ()=>TC.breaking=true, ()=>TC.breaking=false);
  tbtn('ta', ()=>attackMelee());
  tbtn('tp', ()=>doPlace());
  tbtn('ti', ()=>openInv());
  tbtn('tlu',()=>TC.lookUp=true, ()=>TC.lookUp=false);
  tbtn('tld',()=>TC.lookDn=true, ()=>TC.lookDn=false);
}

// ================================================================
//  UI SETUP
// ================================================================
function setupUI(){updateHp();updateHotbar();}

// ================================================================
//  HELPERS
// ================================================================
function isMobile(){
  return ('ontouchstart' in window)||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ================================================================
//  MAIN LOOP
// ================================================================
function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),0.05);
  fAcc+=dt;fN++;
  if(fAcc>=1){fps=fN;fAcc=0;fN=0;}

  if(gState==='playing'||gState==='dead'){
    updateDayNight(dt);
    if(gState==='playing'){
      updatePlayer(dt);
      updateBreaking(dt);
      updateEntities(dt);
      updateDrops(dt);
      tickFall(dt);
      tickWater(dt);
      streamChunks();
      // LMB attack if no block nearby
      if(MOUSE.l&&locked&&PL.atkCD<=0){if(!raycast(3))attackMelee();}
      // Debug
      const d=document.getElementById('dbg');
      if(d.style.display!=='none'){
        d.innerHTML=`FPS:${fps} XYZ:${PL.pos.x.toFixed(1)} ${PL.pos.y.toFixed(1)} ${PL.pos.z.toFixed(1)}<br>Chunks:${chunks.size} Ent:${entities.length} Drops:${drops.length}<br>Time:${(dayT*100).toFixed(1)}% ${isNight()?'NIGHT':'day'}`;
      }
    }
  }
  renderer.render(scene,camera);
}
