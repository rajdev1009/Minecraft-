/* ================================================================
   VoxelCraft  –  script.js
   A complete browser voxel game built with Three.js
   ================================================================ */
'use strict';

// ── Prevent context menu ──────────────────────────────────────
window.addEventListener('contextmenu', e => e.preventDefault());

// ================================================================
//  CONSTANTS
// ================================================================
const CHUNK_W = 16, CHUNK_H = 64;
const RENDER_DIST = 3;          // chunks in each direction
const SEA_LEVEL   = 16;

// ── Block IDs ────────────────────────────────────────────────
const B = {
  AIR:0, GRASS:1, DIRT:2, STONE:3, COBBLE:4, SAND:5,
  GRAVEL:6, WOOD:7, LEAVES:8, PLANKS:9, CRAFTING:10,
  WATER:11, BEDROCK:12, TORCH:13, GLASS:14
};

// ── Item IDs (non-block) ─────────────────────────────────────
const I = {
  STICK:100, SWORD_W:101, SWORD_S:102,
  PICK_W:103, PICK_S:104, AXE_S:105,
  FLESH:200, FEATHER:201, BONE:202
};

// ── Block metadata ───────────────────────────────────────────
// hardness: seconds to break bare-handed (-1 = unbreakable)
// drops: block id or item id  (0=nothing)
// transparent: don't cull neighbour faces
const BD = {
  [B.GRASS]:   {name:'Grass',        icon:'🟩', hard:0.6,  drops:B.DIRT,    colors:[0x45a049,0x45a049,0x45a049,0x45a049,0x7a4f2e,0x7a4f2e]},
  [B.DIRT]:    {name:'Dirt',         icon:'🟫', hard:0.5,  drops:B.DIRT,    colors:[0x7a4f2e,0x7a4f2e,0x7a4f2e,0x7a4f2e,0x7a4f2e,0x7a4f2e]},
  [B.STONE]:   {name:'Stone',        icon:'⬜', hard:1.5,  drops:B.COBBLE,  colors:[0x888,0x888,0x888,0x888,0x888,0x888]},
  [B.COBBLE]:  {name:'Cobblestone',  icon:'🪨', hard:2.0,  drops:B.COBBLE,  colors:[0x777,0x777,0x777,0x777,0x777,0x777]},
  [B.SAND]:    {name:'Sand',         icon:'🏜️', hard:0.5,  drops:B.SAND,    colors:[0xc8b560,0xc8b560,0xc8b560,0xc8b560,0xc8b560,0xc8b560], gravity:true},
  [B.GRAVEL]:  {name:'Gravel',       icon:'🌑', hard:0.6,  drops:B.GRAVEL,  colors:[0x898980,0x898980,0x898980,0x898980,0x898980,0x898980], gravity:true},
  [B.WOOD]:    {name:'Wood Log',     icon:'🪵', hard:2.0,  drops:B.WOOD,    colors:[0x8b6914,0x8b6914,0x8b6914,0x8b6914,0xa07840,0xa07840]},
  [B.LEAVES]:  {name:'Leaves',       icon:'🍃', hard:0.2,  drops:0,         colors:[0x2d6e2d,0x2d6e2d,0x2d6e2d,0x2d6e2d,0x2d6e2d,0x2d6e2d], transparent:true},
  [B.PLANKS]:  {name:'Wood Planks',  icon:'📦', hard:2.0,  drops:B.PLANKS,  colors:[0xc09050,0xc09050,0xc09050,0xc09050,0xc09050,0xc09050]},
  [B.CRAFTING]:{name:'Crafting Table',icon:'🔨',hard:2.5,  drops:B.CRAFTING,colors:[0x7a5c2e,0x7a5c2e,0x9c7444,0x9c7444,0x9c7444,0x9c7444]},
  [B.WATER]:   {name:'Water',        icon:'💧', hard:-1,   drops:0,         colors:[0x1a60a0,0x1a60a0,0x1a60a0,0x1a60a0,0x1a60a0,0x1a60a0], transparent:true, fluid:true},
  [B.BEDROCK]: {name:'Bedrock',      icon:'⬛', hard:-1,   drops:0,         colors:[0x222,0x222,0x222,0x222,0x222,0x222]},
  [B.TORCH]:   {name:'Torch',        icon:'🔥', hard:0.1,  drops:B.TORCH,   colors:[0xffd700,0xffd700,0xffd700,0xffd700,0xffd700,0xffd700]},
  [B.GLASS]:   {name:'Glass',        icon:'🪟', hard:0.3,  drops:0,         colors:[0xaaddff,0xaaddff,0xaaddff,0xaaddff,0xaaddff,0xaaddff], transparent:true},
};

const ID = {
  [I.STICK]:   {name:'Stick',         icon:'🥢', dmg:1,  tool:''},
  [I.SWORD_W]: {name:'Wooden Sword',  icon:'🔪', dmg:4,  tool:'sword'},
  [I.SWORD_S]: {name:'Stone Sword',   icon:'⚔️', dmg:7,  tool:'sword'},
  [I.PICK_W]:  {name:'Wooden Pickaxe',icon:'🔨', dmg:2,  tool:'pick'},
  [I.PICK_S]:  {name:'Stone Pickaxe', icon:'⛏️', dmg:2,  tool:'pick'},
  [I.AXE_S]:   {name:'Stone Axe',     icon:'🪓', dmg:4,  tool:'axe'},
  [I.FLESH]:   {name:'Rotten Flesh',  icon:'🫀', dmg:0,  tool:''},
  [I.FEATHER]: {name:'Feather',       icon:'🪶', dmg:0,  tool:''},
  [I.BONE]:    {name:'Bone',          icon:'🦴', dmg:0,  tool:''},
};

// ── Crafting Recipes ──────────────────────────────────────────
// Key: cells array stringified, value: {id, count}
const RECIPES = {};
function addRecipe(cells, id, count=1){
  RECIPES[cells.map(c=>c??0).join(',')] = {id, count};
}
// 2×2 (padded to 9 with zeros)
function r22(a,b,c,d,id,n=1){ addRecipe([a,b,0,c,d,0,0,0,0],id,n); }
// 3×3
function r33(arr,id,n=1){ addRecipe(arr,id,n); }

r22(B.WOOD,B.WOOD,B.WOOD,B.WOOD,       B.PLANKS, 4);
r22(B.PLANKS,B.PLANKS,B.PLANKS,B.PLANKS, B.CRAFTING, 1);
// Sticks: column
r33([0,B.PLANKS,0, 0,B.PLANKS,0, 0,0,0], I.STICK, 4);
// Wood sword
r33([0,B.PLANKS,0, 0,B.PLANKS,0, 0,I.STICK,0], I.SWORD_W, 1);
// Stone sword
r33([0,B.COBBLE,0, 0,B.COBBLE,0, 0,I.STICK,0], I.SWORD_S, 1);
// Wood pickaxe
r33([B.PLANKS,B.PLANKS,B.PLANKS, 0,I.STICK,0, 0,I.STICK,0], I.PICK_W, 1);
// Stone pickaxe
r33([B.COBBLE,B.COBBLE,B.COBBLE, 0,I.STICK,0, 0,I.STICK,0], I.PICK_S, 1);
// Stone axe
r33([B.COBBLE,B.COBBLE,0, B.COBBLE,I.STICK,0, 0,I.STICK,0], I.AXE_S, 1);

// ================================================================
//  GAME STATE
// ================================================================
let scene, camera, renderer, clock;
let noise;
let gameState = 'loading'; // loading | playing | paused | dead | inv

// World
const chunks    = new Map();  // key→Uint8Array
const meshMap   = new Map();  // key→THREE.Mesh
const waterMesh = new Map();  // separate semi-transparent water meshes

// Player
const PL = {
  pos:     new THREE.Vector3(0, CHUNK_H, 0),
  vel:     new THREE.Vector3(0, 0, 0),
  yaw:     0,
  pitch:   0,
  hp:      20,
  maxHp:   20,
  onGround:false,
  sel:     0,              // hotbar slot 0-8
  inv:     [],             // 36 slots: [0..26]=inventory, [27..35]=hotbar
  atkCD:   0,
  dmgCD:   0,
  dead:    false,
  breakTarget: null,       // {x,y,z}
  breakProg:   0,
  isBreaking:  false,
  using3x3:    false,      // crafting table open?
};
for(let i=0;i<36;i++) PL.inv.push({id:0,n:0});

// Input
const KEYS = {};
const MOUSE = {l:false, r:false};
let   locked = false;      // pointer lock

// Touch
const TC = {
  joyId:null, joyOx:0, joyOy:0, jdx:0, jdy:0,
  camId:null, camOx:0, camOy:0,
  jump:false, breaking:false, placing:false, attack:false
};

// Entities & drops
const entities = [];
const itemDrops = [];

// Day / night
let dayT = 0;              // 0..1 full cycle
const DAY_LEN = 1200;      // seconds per full cycle (≈20min)

// Craft grid (always 3×3 internally; 2×2 uses top-left 4)
const craftGrid = new Array(9).fill(0);

// FPS tracking
let fps = 60, frameAcc = 0, frameN = 0;

// ================================================================
//  INIT
// ================================================================
window.addEventListener('load', init);

async function init(){
  noise = new SimplexNoise();

  // Three.js
  scene    = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, RENDER_DIST*CHUNK_W*0.6, RENDER_DIST*CHUNK_W);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.05, 300);

  renderer = new THREE.WebGLRenderer({canvas:document.getElementById('c'), antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);

  // Lights
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.0);
  sun.position.set(80,160,80);
  scene.add(sun);
  const amb = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(amb);
  window._sun = sun; window._amb = amb;

  clock = new THREE.Clock();

  // Generate world async (fake progress)
  await generateWorld();

  // Starting loot
  giveItem(B.DIRT,   10);
  giveItem(B.PLANKS,  6);
  giveItem(B.COBBLE,  8);
  giveItem(B.WOOD,    4);

  setupInput();
  setupUI();
  updateHotbarDOM();
  updateHealthDOM();
  spawnPassiveMobs();

  // Find safe spawn Y
  const sx=0, sz=0;
  let sy = CHUNK_H-1;
  for(let y=CHUNK_H-1;y>=1;y--){
    if(getBlock(sx,y,sz)!==B.AIR){ sy=y+2; break; }
  }
  PL.pos.set(sx+0.5, sy, sz+0.5);

  document.getElementById('loading').style.display='none';
  gameState = 'playing';
  if(!isMobile()) document.getElementById('c').requestPointerLock();

  loop();
}

async function generateWorld(){
  setLoadMsg('Building terrain…'); setLoadPct(10);
  const cx0=0, cz0=0;
  let done=0;
  const total=(RENDER_DIST*2+1)**2;
  for(let dx=-RENDER_DIST;dx<=RENDER_DIST;dx++){
    for(let dz=-RENDER_DIST;dz<=RENDER_DIST;dz++){
      genChunk(cx0+dx, cz0+dz);
      done++;
      setLoadPct(10 + 85*(done/total));
      if(done%4===0) await sleep(0); // yield to browser
    }
  }
  setLoadMsg('Meshing world…'); setLoadPct(96);
  await sleep(0);
  for(const [key] of chunks) {
    const [cx,cz]=key.split(',').map(Number);
    buildMesh(cx,cz);
  }
  setLoadPct(100);
  await sleep(80);
}

function setLoadPct(p){ document.getElementById('load-bar').style.width=p+'%'; }
function setLoadMsg(m){ document.getElementById('load-msg').textContent=m; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// ================================================================
//  WORLD GENERATION
// ================================================================
function cKey(cx,cz){ return cx+','+cz; }

function genChunk(cx,cz){
  const key=cKey(cx,cz);
  if(chunks.has(key)) return;
  const data=new Uint8Array(CHUNK_W*CHUNK_H*CHUNK_W);
  const idx=(x,y,z)=>y*CHUNK_W*CHUNK_W+z*CHUNK_W+x;

  for(let x=0;x<CHUNK_W;x++){
    for(let z=0;z<CHUNK_W;z++){
      const wx=cx*CHUNK_W+x, wz=cz*CHUNK_W+z;

      // Biome noise
      const bio = noise.noise2D(wx*0.004, wz*0.004);

      // Height
      const base   = noise.noise2D(wx*0.018, wz*0.018)*9;
      const detail = noise.noise2D(wx*0.07,  wz*0.07 )*3;
      const hills  = bio>0.3 ? noise.noise2D(wx*0.009, wz*0.009)*14 : 0;
      const surf   = Math.floor(SEA_LEVEL + base + detail + hills);

      const isSand    = bio < -0.25;
      const isForest  = bio > -0.05 && bio < 0.3;

      // Column fill
      data[idx(x,0,z)] = B.BEDROCK;
      for(let y=1;y<CHUNK_H;y++){
        if(y > surf){
          if(y <= SEA_LEVEL) data[idx(x,y,z)]=B.WATER;
          // else air
        } else if(y < surf-4){
          // Underground: mostly stone with ore-ish gravel
          const gv = noise.noise2D(wx*0.12+y*0.05, wz*0.12+y*0.05);
          data[idx(x,y,z)] = gv>0.72 ? B.GRAVEL : B.STONE;
        } else if(y < surf-1){
          data[idx(x,y,z)] = isSand ? B.SAND : B.DIRT;
        } else if(y === surf-1){
          data[idx(x,y,z)] = isSand ? B.SAND : B.DIRT;
        } else { // y===surf
          data[idx(x,y,z)] = isSand ? B.SAND : B.GRASS;
        }
      }

      // Trees (forest biome, land above sea)
      if(isForest && surf>SEA_LEVEL){
        const ts = noise.noise2D(wx*0.7+7.3, wz*0.7+13.1);
        if(ts>0.62 && surf+7 < CHUNK_H-2){
          const th=4+Math.floor(Math.abs(noise.noise2D(wx*1.3,wz*1.3))*2);
          // Trunk
          for(let t=1;t<=th;t++){
            if(y_ok(surf+t)) data[idx(x,surf+t,z)]=B.WOOD;
          }
          // Leaves canopy
          for(let lx=-2;lx<=2;lx++) for(let lz=-2;lz<=2;lz++) for(let ly=0;ly<=3;ly++){
            const bx=x+lx, bz=z+lz, by=surf+th-1+ly;
            if(bx<0||bx>=CHUNK_W||bz<0||bz>=CHUNK_W||!y_ok(by)) continue;
            const r=Math.abs(lx)+Math.abs(lz)+Math.abs(ly-1);
            if(r<=3 && data[idx(bx,by,bz)]===B.AIR) data[idx(bx,by,bz)]=B.LEAVES;
          }
        }
      }
    }
  }

  chunks.set(key,data);
  function y_ok(y){return y>=0&&y<CHUNK_H;}
}

// ================================================================
//  BLOCK ACCESS
// ================================================================
function getBlock(wx,wy,wz){
  if(wy<0) return B.BEDROCK;
  if(wy>=CHUNK_H) return B.AIR;
  const cx=Math.floor(wx/CHUNK_W), cz=Math.floor(wz/CHUNK_W);
  const d=chunks.get(cKey(cx,cz));
  if(!d) return B.AIR;
  const lx=((wx%CHUNK_W)+CHUNK_W)%CHUNK_W;
  const lz=((wz%CHUNK_W)+CHUNK_W)%CHUNK_W;
  return d[wy*CHUNK_W*CHUNK_W+lz*CHUNK_W+lx];
}

function setBlock(wx,wy,wz,type){
  if(wy<0||wy>=CHUNK_H) return;
  const cx=Math.floor(wx/CHUNK_W), cz=Math.floor(wz/CHUNK_W);
  const d=chunks.get(cKey(cx,cz));
  if(!d) return;
  const lx=((wx%CHUNK_W)+CHUNK_W)%CHUNK_W;
  const lz=((wz%CHUNK_W)+CHUNK_W)%CHUNK_W;
  d[wy*CHUNK_W*CHUNK_W+lz*CHUNK_W+lx]=type;
  buildMesh(cx,cz);
  if(lx===0)         buildMesh(cx-1,cz);
  if(lx===CHUNK_W-1) buildMesh(cx+1,cz);
  if(lz===0)         buildMesh(cx,cz-1);
  if(lz===CHUNK_W-1) buildMesh(cx,cz+1);
}

// ================================================================
//  MESH BUILDING  (greedy-ish: face culling, vertex colors)
// ================================================================
// Face defs: [normal, 4 verts(local), shading]
const FACE_DEFS = [
  {n:[0,1,0], v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]], s:0},  // top
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]], s:1},  // bottom
  {n:[0,0,-1],v:[[1,1,0],[0,1,0],[0,0,0],[1,0,0]], s:2},  // north
  {n:[0,0,1], v:[[0,1,1],[1,1,1],[1,0,1],[0,0,1]], s:3},  // south
  {n:[-1,0,0],v:[[0,1,0],[0,1,1],[0,0,1],[0,0,0]], s:4},  // west
  {n:[1,0,0], v:[[1,1,1],[1,1,0],[1,0,0],[1,0,1]], s:5},  // east
];
const SHADE = [1.0, 0.5, 0.75, 0.75, 0.65, 0.65];

function buildMesh(cx,cz){
  const d=chunks.get(cKey(cx,cz));
  if(!d) return;

  const pos=[],col=[],idx=[];
  const wpos=[],wcol=[],widx=[];
  let vi=0, wvi=0;

  for(let y=0;y<CHUNK_H;y++){
    for(let z=0;z<CHUNK_W;z++){
      for(let x=0;x<CHUNK_W;x++){
        const b=d[y*CHUNK_W*CHUNK_W+z*CHUNK_W+x];
        if(b===B.AIR) continue;
        const bd=BD[b]; if(!bd) continue;
        const wx=cx*CHUNK_W+x, wz=cz*CHUNK_W+z;
        const isWater=b===B.WATER;

        for(const f of FACE_DEFS){
          const [nx,ny,nz]=f.n;
          const nb=getBlock(wx+nx,y+ny,wz+nz);
          // Cull if solid non-transparent neighbour, or same fluid
          if(nb!==B.AIR){
            const nbd=BD[nb];
            if(!nbd) continue;
            if(isWater&&nb===B.WATER) continue;
            if(!nbd.transparent&&!nbd.fluid) continue;
            if(nbd.transparent||nbd.fluid){} // show face
          }

          const shade=SHADE[f.s];
          const raw=bd.colors[f.s];
          const r=((raw>>16)&255)/255*shade;
          const g=((raw>>8)&255)/255*shade;
          const bl=(raw&255)/255*shade;

          const P=isWater?wpos:pos, C=isWater?wcol:col;
          const IX=isWater?widx:idx;
          const V=isWater?wvi:vi;

          for(const v of f.v){
            P.push(wx+v[0], y+(isWater&&f.s===0?0.87:v[1]), wz+v[2]);
            C.push(r,g,bl);
          }
          IX.push(V,V+1,V+2, V,V+2,V+3);
          if(isWater) wvi+=4; else vi+=4;
        }
      }
    }
  }

  // Solid mesh
  const key=cKey(cx,cz);
  disposeChunkMesh(key);
  if(pos.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(col,3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mat=new THREE.MeshLambertMaterial({vertexColors:true});
    const mesh=new THREE.Mesh(geo,mat);
    scene.add(mesh);
    meshMap.set(key,mesh);
  }

  // Water mesh
  disposeWaterMesh(key);
  if(wpos.length){
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(wpos,3));
    geo.setAttribute('color',   new THREE.Float32BufferAttribute(wcol,3));
    geo.setIndex(widx);
    geo.computeVertexNormals();
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:0.72,side:THREE.DoubleSide,depthWrite:false});
    const mesh=new THREE.Mesh(geo,mat);
    scene.add(mesh);
    waterMesh.set(key,mesh);
  }
}

function disposeChunkMesh(key){
  const m=meshMap.get(key);
  if(m){scene.remove(m);m.geometry.dispose();meshMap.delete(key);}
}
function disposeWaterMesh(key){
  const m=waterMesh.get(key);
  if(m){scene.remove(m);m.geometry.dispose();waterMesh.delete(key);}
}

// ================================================================
//  CHUNK STREAMING
// ================================================================
function streamChunks(){
  const pcx=Math.floor(PL.pos.x/CHUNK_W);
  const pcz=Math.floor(PL.pos.z/CHUNK_W);

  for(let dx=-RENDER_DIST;dx<=RENDER_DIST;dx++){
    for(let dz=-RENDER_DIST;dz<=RENDER_DIST;dz++){
      const cx=pcx+dx, cz=pcz+dz, key=cKey(cx,cz);
      if(!chunks.has(key)){ genChunk(cx,cz); buildMesh(cx,cz); }
    }
  }
  // Unload distant chunks
  for(const [key] of meshMap){
    const [cx,cz]=key.split(',').map(Number);
    if(Math.abs(cx-pcx)>RENDER_DIST+1||Math.abs(cz-pcz)>RENDER_DIST+1){
      disposeChunkMesh(key); disposeWaterMesh(key); chunks.delete(key);
    }
  }
}

// ================================================================
//  PHYSICS & PLAYER MOVEMENT
// ================================================================
const GRAVITY  = -28;
const JUMP_V   =  9;
const WALK_SPD =  4.8;
const P_W      =  0.3;   // half-width
const P_H      =  1.8;   // height

function updatePlayer(dt){
  if(PL.dead) return;
  PL.atkCD = Math.max(0, PL.atkCD-dt);
  PL.dmgCD = Math.max(0, PL.dmgCD-dt);

  // Build movement vector from yaw
  const fw=new THREE.Vector3(-Math.sin(PL.yaw),0,-Math.cos(PL.yaw));
  const rt=new THREE.Vector3( Math.cos(PL.yaw),0,-Math.sin(PL.yaw));
  const mv=new THREE.Vector3();

  // Keyboard or touch joystick
  if(Math.abs(TC.jdx)>0.05||Math.abs(TC.jdy)>0.05){
    mv.addScaledVector(fw,-TC.jdy).addScaledVector(rt,TC.jdx);
  } else {
    if(KEYS['KeyW']||KEYS['ArrowUp'])    mv.add(fw);
    if(KEYS['KeyS']||KEYS['ArrowDown'])  mv.sub(fw);
    if(KEYS['KeyA']||KEYS['ArrowLeft'])  mv.sub(rt);
    if(KEYS['KeyD']||KEYS['ArrowRight']) mv.add(rt);
  }
  if(mv.lengthSq()>0) mv.normalize().multiplyScalar(WALK_SPD);

  PL.vel.x=mv.x; PL.vel.z=mv.z;

  // Water buoyancy
  const inW=getBlock(Math.floor(PL.pos.x),Math.floor(PL.pos.y+0.5),Math.floor(PL.pos.z))===B.WATER;
  if(inW){
    PL.vel.y*=0.8;
    if((KEYS['Space']||TC.jump)&&PL.vel.y<2) PL.vel.y+=6*dt;
  } else {
    PL.vel.y+=GRAVITY*dt;
    PL.vel.y=Math.max(PL.vel.y,-40);
    if((KEYS['Space']||TC.jump)&&PL.onGround){
      PL.vel.y=JUMP_V; PL.onGround=false;
    }
  }

  // Axis-separated collision
  sweepMove(dt);

  // Camera follows
  camera.position.set(PL.pos.x, PL.pos.y+P_H-0.2, PL.pos.z);
  camera.rotation.order='YXZ';
  camera.rotation.y=PL.yaw;
  camera.rotation.x=PL.pitch;

  // Void kill
  if(PL.pos.y<-20) die('Fell into the void');
}

function sweepMove(dt){
  // Move x
  PL.pos.x+=PL.vel.x*dt;
  if(testAABB(PL.pos)){ PL.pos.x-=PL.vel.x*dt; PL.vel.x=0; }
  // Move z
  PL.pos.z+=PL.vel.z*dt;
  if(testAABB(PL.pos)){ PL.pos.z-=PL.vel.z*dt; PL.vel.z=0; }
  // Move y
  PL.pos.y+=PL.vel.y*dt;
  if(testAABB(PL.pos)){
    if(PL.vel.y<0) PL.onGround=true;
    PL.pos.y-=PL.vel.y*dt; PL.vel.y=0;
  } else {
    // Check ground beneath
    const test=PL.pos.clone(); test.y-=0.05;
    PL.onGround=testAABB(test);
  }
}

function testAABB(pos){
  for(let x=Math.floor(pos.x-P_W);x<=Math.floor(pos.x+P_W);x++){
    for(let y=Math.floor(pos.y);y<=Math.floor(pos.y+P_H);y++){
      for(let z=Math.floor(pos.z-P_W);z<=Math.floor(pos.z+P_W);z++){
        const b=getBlock(x,y,z);
        if(b!==B.AIR&&b!==B.WATER&&b!==B.LEAVES) return true;
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
    if(b!==B.AIR&&b!==B.WATER){
      return {x,y,z,px,py,pz,block:b};
    }
    px=x; py=y; pz=z;
  }
  return null;
}

// ================================================================
//  BLOCK INTERACTION
// ================================================================
function updateBreaking(dt){
  const acting=MOUSE.l||TC.breaking;
  if(!acting){
    resetBreak(); return;
  }
  const hit=raycast();
  if(!hit){ resetBreak(); return; }
  const tkey=hit.x+','+hit.y+','+hit.z;
  if(PL.breakTarget!==tkey){ PL.breakTarget=tkey; PL.breakProg=0; }
  const bd=BD[hit.block];
  if(!bd||bd.hard<0){ resetBreak(); return; }

  // Tool speed modifier
  let speed=1;
  const sel=hotItem();
  if(sel&&sel.id>=100){
    const it=ID[sel.id];
    if(it){
      if(it.tool==='pick'&&(hit.block===B.STONE||hit.block===B.COBBLE||hit.block===B.GRAVEL)) speed=4;
      if(it.tool==='axe' &&(hit.block===B.WOOD||hit.block===B.PLANKS||hit.block===B.CRAFTING)) speed=4;
    }
  }

  PL.isBreaking=true;
  PL.breakProg+=dt*speed/bd.hard;

  const pct=Math.min(PL.breakProg*100,100);
  document.getElementById('bkwrap').style.display='block';
  document.getElementById('bkfill').style.width=pct+'%';

  if(PL.breakProg>=1){
    const drop=bd.drops;
    if(drop) spawnDrop(hit.x+0.5,hit.y+0.7,hit.z+0.5,drop);
    setBlock(hit.x,hit.y,hit.z,B.AIR);
    resetBreak();
  }
}

function resetBreak(){
  PL.isBreaking=false; PL.breakProg=0; PL.breakTarget=null;
  document.getElementById('bkwrap').style.display='none';
}

function doPlace(){
  const hit=raycast();
  if(!hit) return;
  const sel=hotItem();
  if(!sel||sel.id===0||sel.id>=100) return; // need a block

  const {px,py,pz}=hit;
  if(getBlock(px,py,pz)!==B.AIR) return;

  // Don't place inside player
  const bx=Math.floor(PL.pos.x),bz=Math.floor(PL.pos.z);
  const by0=Math.floor(PL.pos.y),by1=by0+1;
  if(px===bx&&pz===bz&&(py===by0||py===by1)) return;

  setBlock(px,py,pz,sel.id);
  removeFromHot(PL.sel,1);
  updateHotbarDOM();

  if(sel.id===B.CRAFTING) toast('Crafting Table placed! Right-click to use');
}

// ================================================================
//  CRAFTING TABLE RIGHT-CLICK
// ================================================================
function tryOpenCraftingTable(){
  const hit=raycast(4);
  if(hit&&hit.block===B.CRAFTING){
    PL.using3x3=true;
    openInv();
  } else {
    doPlace();
  }
}

// ================================================================
//  ITEM DROPS
// ================================================================
const BCOLS={[B.GRASS]:0x45a049,[B.DIRT]:0x7a4f2e,[B.STONE]:0x888888,[B.COBBLE]:0x777777,
  [B.SAND]:0xc8b560,[B.GRAVEL]:0x898980,[B.WOOD]:0x8b6914,[B.LEAVES]:0x2d6e2d,
  [B.PLANKS]:0xc09050,[B.CRAFTING]:0x9c7444,[B.TORCH]:0xffd700};

function spawnDrop(x,y,z,id){
  const col=BCOLS[id]||0xffaa22;
  const geo=new THREE.BoxGeometry(0.32,0.32,0.32);
  const mat=new THREE.MeshLambertMaterial({color:col});
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  scene.add(m);
  itemDrops.push({m,id,vel:new THREE.Vector3((Math.random()-0.5)*2,3,(Math.random()-0.5)*2),age:0,picked:false});
}

function updateDrops(dt){
  for(let i=itemDrops.length-1;i>=0;i--){
    const d=itemDrops[i];
    if(d.picked){ scene.remove(d.m); d.m.geometry.dispose(); itemDrops.splice(i,1); continue; }
    d.age+=dt;
    // Gravity
    d.vel.y-=18*dt;
    d.m.position.addScaledVector(d.vel,dt);
    d.m.rotation.y+=2*dt;
    // Ground clamp
    const by=Math.floor(d.m.position.y-0.2);
    const bb=getBlock(Math.floor(d.m.position.x),by,Math.floor(d.m.position.z));
    if(bb!==B.AIR&&d.vel.y<0){ d.m.position.y=by+1.2; d.vel.y=0; d.vel.x*=0.7; d.vel.z*=0.7; }
    // Pickup
    const dx=d.m.position.x-PL.pos.x, dy=d.m.position.y-(PL.pos.y+0.9), dz=d.m.position.z-PL.pos.z;
    if(d.age>0.5&&dx*dx+dy*dy+dz*dz<2.25){
      giveItem(d.id,1);
      toast('+ '+getName(d.id));
      d.picked=true;
    }
    if(d.age>90){ d.picked=true; }
  }
}

// ================================================================
//  ENTITIES
// ================================================================
function makeZombie(x,y,z){
  const g=new THREE.Group();
  const body=mesh(0.6,0.9,0.3,0x2d4a2d); body.position.set(0,0.85,0); g.add(body);
  const head=mesh(0.5,0.5,0.5,0x4a7a4a); head.position.set(0,1.6,0);  g.add(head);
  const lArm=mesh(0.25,0.7,0.25,0x2d4a2d); lArm.position.set(-0.43,0.85, 0.25); g.add(lArm);
  const rArm=mesh(0.25,0.7,0.25,0x2d4a2d); rArm.position.set( 0.43,0.85, 0.25); g.add(rArm);
  const lLeg=mesh(0.25,0.8,0.25,0x1e2d6e); lLeg.position.set(-0.2, 0.25, 0); g.add(lLeg);
  const rLeg=mesh(0.25,0.8,0.25,0x1e2d6e); rLeg.position.set( 0.2, 0.25, 0); g.add(rLeg);
  g.position.set(x,y,z); scene.add(g);
  return {type:'zombie',g,lArm,rArm,lLeg,rLeg,
    pos:new THREE.Vector3(x,y,z), vel:new THREE.Vector3(),
    hp:20,maxHp:20,onGround:false,atkCD:0,animT:0,
    wDir:new THREE.Vector2(Math.random()-0.5,Math.random()-0.5).normalize(),
    wTimer:0};
}

function makeChicken(x,y,z){
  const g=new THREE.Group();
  const body=mesh(0.5,0.35,0.7,0xffffff); body.position.set(0,0.5,0); g.add(body);
  const head=mesh(0.3,0.3,0.3,0xffffff); head.position.set(0,0.82,0.25); g.add(head);
  const beak=mesh(0.1,0.08,0.14,0xffaa00); beak.position.set(0,0.78,0.43); g.add(beak);
  const lLeg=mesh(0.08,0.25,0.08,0xffaa00); lLeg.position.set(-0.12,0.15,0); g.add(lLeg);
  const rLeg=mesh(0.08,0.25,0.08,0xffaa00); rLeg.position.set( 0.12,0.15,0); g.add(rLeg);
  g.position.set(x,y,z); scene.add(g);
  return {type:'chicken',g,lLeg,rLeg,
    pos:new THREE.Vector3(x,y,z), vel:new THREE.Vector3(),
    hp:4,maxHp:4,onGround:false,animT:0,
    wDir:new THREE.Vector2(Math.random()-0.5,Math.random()-0.5).normalize(),
    wTimer:0};
}

function mesh(w,h,d,color){
  return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
}

function spawnPassiveMobs(){
  for(let i=0;i<5;i++){
    const a=Math.random()*Math.PI*2, r=5+Math.random()*12;
    const x=PL.pos.x+Math.cos(a)*r, z=PL.pos.z+Math.sin(a)*r;
    const y=surfaceY(Math.floor(x),Math.floor(z));
    if(y>1) entities.push(makeChicken(x,y,z));
  }
}

function surfaceY(bx,bz){
  for(let y=CHUNK_H-1;y>=0;y--){
    const b=getBlock(bx,y,bz);
    if(b!==B.AIR&&b!==B.WATER) return y+1;
  }
  return 2;
}

let mobTimer=0;

function updateEntities(dt){
  mobTimer+=dt;
  const night=isNight();

  // Spawn zombies at night
  if(night&&mobTimer>7&&entities.filter(e=>e.type==='zombie').length<12){
    mobTimer=0;
    for(let i=0;i<2;i++){
      const a=Math.random()*Math.PI*2, r=10+Math.random()*20;
      const x=PL.pos.x+Math.cos(a)*r, z=PL.pos.z+Math.sin(a)*r;
      const y=surfaceY(Math.floor(x),Math.floor(z));
      if(y>1&&y<CHUNK_H-2) entities.push(makeZombie(x+0.5,y,z+0.5));
    }
  }
  if(!night&&mobTimer>20){ mobTimer=0; }

  for(let i=entities.length-1;i>=0;i--){
    const e=entities[i];
    if(e.hp<=0){
      // Drop
      if(e.type==='zombie'){ spawnDrop(e.pos.x,e.pos.y+0.5,e.pos.z,I.FLESH); }
      if(e.type==='chicken'){ spawnDrop(e.pos.x,e.pos.y+0.5,e.pos.z,I.FEATHER); }
      scene.remove(e.g); entities.splice(i,1);
      toast(e.type==='zombie'?'Zombie slain! 🗡️':'Chicken slain! 🐔');
      continue;
    }

    // Gravity
    e.vel.y=Math.max(e.vel.y-20*dt, -30);

    if(e.type==='zombie') tickZombie(e,dt);
    else                  tickChicken(e,dt);

    // Move
    e.pos.x+=e.vel.x*dt; e.pos.z+=e.vel.z*dt;
    // Horizontal collision simplified
    const eb=getBlock(Math.floor(e.pos.x),Math.floor(e.pos.y)+1,Math.floor(e.pos.z));
    if(eb!==B.AIR&&eb!==B.WATER&&eb!==B.LEAVES){
      e.pos.x-=e.vel.x*dt; e.pos.z-=e.vel.z*dt;
      e.wDir.set(Math.random()-0.5,Math.random()-0.5).normalize();
      // try to jump
      if(e.onGround) e.vel.y=7;
    }
    // Vertical
    e.pos.y+=e.vel.y*dt;
    const ground=surfaceY(Math.floor(e.pos.x),Math.floor(e.pos.z));
    if(e.pos.y<ground){ e.pos.y=ground; e.vel.y=0; e.onGround=true; }
    else e.onGround=false;

    e.g.position.copy(e.pos);
  }
}

function tickZombie(e,dt){
  e.atkCD=Math.max(0,e.atkCD-dt);
  const dx=PL.pos.x-e.pos.x, dz=PL.pos.z-e.pos.z;
  const dist=Math.sqrt(dx*dx+dz*dz);

  if(dist<16&&isNight()){
    // Chase
    const spd=2.8;
    e.vel.x=dx/dist*spd; e.vel.z=dz/dist*spd;
    e.g.rotation.y=Math.atan2(dx,dz);
    if(dist<1.5&&e.atkCD<=0&&!PL.dead){
      hurtPlayer(2,'a zombie'); e.atkCD=1.0;
    }
  } else {
    // Wander
    e.wTimer-=dt;
    if(e.wTimer<=0){ e.wDir.set(Math.random()-0.5,Math.random()-0.5).normalize(); e.wTimer=2+Math.random()*3; }
    e.vel.x=e.wDir.x*1.2; e.vel.z=e.wDir.y*1.2;
    e.g.rotation.y=Math.atan2(e.wDir.x,e.wDir.y);
  }
  // Burn in daylight
  if(!isNight()) e.hp-=3*dt;

  // Animate
  e.animT+=dt*4*(Math.abs(e.vel.x)+Math.abs(e.vel.z)>0.1?1:0);
  e.lArm.rotation.x=Math.sin(e.animT)*0.55;
  e.rArm.rotation.x=Math.sin(e.animT+Math.PI)*0.55;
  e.lLeg.rotation.x=Math.sin(e.animT+Math.PI)*0.4;
  e.rLeg.rotation.x=Math.sin(e.animT)*0.4;
}

function tickChicken(e,dt){
  e.wTimer-=dt;
  if(e.wTimer<=0){
    const r=Math.random();
    if(r<0.4){ e.vel.x=0; e.vel.z=0; }
    else { e.wDir.set(Math.random()-0.5,Math.random()-0.5).normalize(); }
    e.wTimer=1+Math.random()*4;
    if(e.onGround&&Math.random()<0.15) e.vel.y=4.5; // occasional hop
  }
  if(e.vel.x!==0||e.vel.z!==0){
    e.vel.x=e.wDir.x*0.9; e.vel.z=e.wDir.y*0.9;
    e.g.rotation.y=Math.atan2(e.wDir.x,e.wDir.y);
  }
  e.animT+=dt*5;
  e.lLeg.rotation.x=Math.sin(e.animT)*0.5;
  e.rLeg.rotation.x=Math.sin(e.animT+Math.PI)*0.5;
}

// ================================================================
//  COMBAT
// ================================================================
function attackMelee(){
  if(PL.atkCD>0||PL.dead) return;
  PL.atkCD=0.45;
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  let best=null, bestDist=4;
  for(const e of entities){
    const ev=e.pos.clone().sub(camera.position).normalize();
    if(ev.dot(dir)<0.65) continue;
    const d=e.pos.distanceTo(PL.pos);
    if(d<bestDist){ best=e; bestDist=d; }
  }
  if(!best) return;
  // Damage
  const sel=hotItem();
  let dmg=1;
  if(sel&&sel.id>=100&&ID[sel.id]) dmg=ID[sel.id].dmg;
  best.hp-=dmg;
  // Knockback
  const kb=best.pos.clone().sub(PL.pos).normalize().multiplyScalar(5);
  best.vel.add(kb); best.vel.y=3;
  toast(`Hit ${best.type} (${dmg} dmg)`);
}

// ================================================================
//  PLAYER DAMAGE & DEATH
// ================================================================
function hurtPlayer(dmg, src=''){
  if(PL.dmgCD>0||PL.dead) return;
  PL.hp=Math.max(0,PL.hp-dmg);
  PL.dmgCD=0.5;
  flashRed();
  updateHealthDOM();
  if(PL.hp<=0) die('Killed by '+src);
}

function die(msg){
  PL.dead=true;
  document.getElementById('death-msg').textContent=msg||'';
  showScreen('death-scr');
  gameState='dead';
}

function respawn(){
  PL.dead=false; PL.hp=PL.maxHp;
  PL.vel.set(0,0,0);
  PL.pos.set(0.5, surfaceY(0,0)+1, 0.5);
  PL.breakTarget=null; PL.breakProg=0;
  updateHealthDOM();
  hideAllScreens();
  gameState='playing';
  if(!isMobile()) document.getElementById('c').requestPointerLock();
}

function flashRed(){
  const el=document.getElementById('dmg');
  el.style.background='rgba(220,0,0,0.45)';
  setTimeout(()=>el.style.background='transparent',300);
}

// ================================================================
//  DAY / NIGHT
// ================================================================
function isNight(){ return dayT>0.5; }

function updateDayNight(dt){
  dayT=(dayT+dt/DAY_LEN)%1;
  const t=dayT;
  let sr,sg,sb,si,ai;
  if(t<0.25){       const f=t/0.25;     sr=lerp(.08,.53,f);sg=lerp(.08,.81,f);sb=lerp(.2,.92,f);si=lerp(.15,1,f);ai=lerp(.08,.55,f);}
  else if(t<0.5){   sr=.53;sg=.81;sb=.92;si=1;ai=.55; }
  else if(t<0.75){  const f=(t-.5)/.25; sr=lerp(.53,.04,f);sg=lerp(.81,.04,f);sb=lerp(.92,.08,f);si=lerp(1,.07,f);ai=lerp(.55,.05,f);}
  else{             sr=.02;sg=.02;sb=.05;si=.05;ai=.05; }

  scene.background.setRGB(sr,sg,sb);
  scene.fog.color.setRGB(sr,sg,sb);
  window._sun.intensity=si;
  window._amb.intensity=ai;

  const icon=t<0.25?'🌅':t<0.5?'☀️':t<0.75?'🌇':'🌙';
  const label=t<0.25?'Dawn':t<0.5?'Day':t<0.75?'Dusk':'Night';
  document.getElementById('t-icon').textContent=icon;
  document.getElementById('t-lbl').textContent=label;
}

function lerp(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t));}

// ================================================================
//  SAND/GRAVEL PHYSICS
// ================================================================
let fallTick=0;
function tickFalling(dt){
  fallTick+=dt;
  if(fallTick<0.25) return;
  fallTick=0;
  const px=Math.floor(PL.pos.x), pz=Math.floor(PL.pos.z);
  for(let bx=px-8;bx<=px+8;bx++) for(let bz=pz-8;bz<=pz+8;bz++){
    for(let y=CHUNK_H-2;y>=1;y--){
      const b=getBlock(bx,y,bz);
      const bd=BD[b];
      if(bd&&bd.gravity&&getBlock(bx,y-1,bz)===B.AIR){
        setBlock(bx,y,bz,B.AIR); setBlock(bx,y-1,bz,b); break;
      }
    }
  }
}

// ================================================================
//  WATER FLOWING (simple: spread from source 1 tick/sec)
// ================================================================
let waterTick=0;
function tickWater(dt){
  waterTick+=dt;
  if(waterTick<1.0) return;
  waterTick=0;
  const px=Math.floor(PL.pos.x), pz=Math.floor(PL.pos.z);
  for(let bx=px-12;bx<=px+12;bx++) for(let bz=pz-12;bz<=pz+12;bz++){
    for(let y=CHUNK_H-2;y>=1;y--){
      if(getBlock(bx,y,bz)===B.WATER){
        // Flow down
        if(getBlock(bx,y-1,bz)===B.AIR){ setBlock(bx,y-1,bz,B.WATER); }
        // Flow laterally (max 4 blocks from source is simplified by just spreading)
        else {
          const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
          for(const [dx,dz] of dirs){
            if(getBlock(bx+dx,y,bz+dz)===B.AIR) setBlock(bx+dx,y,bz+dz,B.WATER);
          }
        }
      }
    }
  }
}

// ================================================================
//  INVENTORY HELPERS
// ================================================================
function hotItem(){ return PL.inv[27+PL.sel]; }

function giveItem(id,n){
  // Stack
  for(let i=0;i<36;i++){
    const s=PL.inv[i];
    if(s.id===id&&s.n<64){ const add=Math.min(64-s.n,n); s.n+=add; n-=add; if(n<=0){ updateHotbarDOM(); return; } }
  }
  // Empty slot
  for(let i=0;i<36;i++){
    if(PL.inv[i].id===0){ const add=Math.min(64,n); PL.inv[i]={id,n:add}; n-=add; if(n<=0){ updateHotbarDOM(); return; } }
  }
  updateHotbarDOM();
}

function removeFromHot(slot,n){
  const s=PL.inv[27+slot];
  if(!s) return;
  s.n-=n;
  if(s.n<=0) PL.inv[27+slot]={id:0,n:0};
}

function getName(id){
  if(BD[id]) return BD[id].name;
  if(ID[id]) return ID[id].name;
  return 'Item';
}
function getIcon(id){
  if(BD[id]) return BD[id].icon;
  if(ID[id]) return ID[id].icon;
  return '?';
}

// ================================================================
//  CRAFTING LOGIC
// ================================================================
function craftKey(grid){ return grid.join(','); }

function getCraftResult(){
  // Try 3×3
  const k=craftKey(craftGrid);
  if(RECIPES[k]) return RECIPES[k];
  // Try 2×2 mapped to top-left of 3×3
  const g2=[craftGrid[0],craftGrid[1],0, craftGrid[3],craftGrid[4],0, 0,0,0];
  const k2=craftKey(g2);
  if(RECIPES[k2]) return RECIPES[k2];
  // Try all orientations (shift left)
  return null;
}

let craftSelected=null; // {id} to place in grid

function setCraftGridCell(i, id){
  craftGrid[i]=id;
  refreshCraftUI();
}

function clearCraftGrid(){
  craftGrid.fill(0);
  craftSelected=null;
  refreshCraftUI();
}

function collectCraft(){
  const res=getCraftResult();
  if(!res) return;
  // Consume one of each ingredient
  const consumed={};
  for(const id of craftGrid){
    if(id!==0) consumed[id]=(consumed[id]||0)+1;
  }
  for(const [id,cnt] of Object.entries(consumed)){
    let left=cnt;
    for(const s of PL.inv){
      if(s.id===+id&&left>0){ const take=Math.min(s.n,left); s.n-=take; left-=take; if(s.n<=0) s.id=0; }
    }
  }
  // Clear grid
  craftGrid.fill(0);
  giveItem(res.id,res.count);
  toast('Crafted: '+getName(res.id));
  refreshCraftUI();
  updateInvDOM();
  updateHotbarDOM();
}

// ================================================================
//  UI – HUD
// ================================================================
function updateHealthDOM(){
  const row=document.getElementById('hp-row');
  row.innerHTML='';
  for(let i=0;i<10;i++){
    const full=PL.hp>=i*2+2, half=PL.hp>=i*2+1;
    const el=document.createElement('div');
    el.className='heart';
    el.textContent=full?'❤️':half?'🩶':'🖤';
    row.appendChild(el);
  }
}

let toastTimer=null;
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg; el.style.opacity='1';
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.style.opacity='0',2400);
}

function updateHotbarDOM(){
  const hb=document.getElementById('hotbar');
  hb.innerHTML='';
  for(let i=0;i<9;i++){
    const s=PL.inv[27+i];
    const el=document.createElement('div');
    el.className='hslot'+(i===PL.sel?' on':'');
    el.innerHTML=`<span class="sn">${i+1}</span>`;
    if(s.id){
      el.innerHTML+=`<span>${getIcon(s.id)}</span>`;
      if(s.n>1) el.innerHTML+=`<span class="sc">${s.n}</span>`;
    }
    el.onclick=()=>{ PL.sel=i; updateHotbarDOM(); };
    hb.appendChild(el);
  }
  // Tooltip
  const cur=hotItem();
  const tt=document.getElementById('ttip');
  if(cur&&cur.id){
    tt.textContent=getName(cur.id)+' ('+cur.n+')';
    tt.style.opacity='1';
  } else {
    tt.style.opacity='0';
  }
}

// ================================================================
//  UI – INVENTORY SCREEN
// ================================================================
function openInv(){
  // Build craft grid UI
  buildCraftUI();
  updateInvDOM();
  showScreen('inv-scr');
  gameState='inv';
  if(locked) document.exitPointerLock();
}

function closeInv(){
  hideAllScreens();
  gameState='playing';
  PL.using3x3=false;
  if(!isMobile()) document.getElementById('c').requestPointerLock();
}

function buildCraftUI(){
  const holder=document.getElementById('cgrid-hold');
  holder.innerHTML='';
  const size=PL.using3x3?3:2;
  for(let row=0;row<size;row++){
    const rowDiv=document.createElement('div'); rowDiv.className='cgrow';
    for(let col=0;col<size;col++){
      const gIdx=PL.using3x3 ? row*3+col : row*3+col; // 2×2 uses indices 0,1,3,4
      const actualIdx=PL.using3x3 ? gIdx : (row*3+col < 2 ? row*3+col : row*3+col+1);
      // For 2×2: row0→[0,1], row1→[3,4]
      const ci=PL.using3x3 ? gIdx : [0,1,3,4][row*2+col];
      const el=document.createElement('div'); el.className='islot';
      el.dataset.ci=ci;
      if(craftGrid[ci]) el.textContent=getIcon(craftGrid[ci]);
      el.onclick=()=>{
        if(craftSelected!==null){ craftGrid[ci]=craftSelected; craftSelected=null; refreshCraftUI(); }
        else if(craftGrid[ci]){ craftGrid[ci]=0; refreshCraftUI(); }
      };
      rowDiv.appendChild(el);
    }
    holder.appendChild(rowDiv);
  }
  refreshCraftUI();
}

function refreshCraftUI(){
  // Update craft grid cells
  const cells=document.querySelectorAll('[data-ci]');
  cells.forEach(el=>{
    const ci=+el.dataset.ci;
    el.textContent=craftGrid[ci]?getIcon(craftGrid[ci]):'';
    el.className='islot'+(craftGrid[ci]?' sel':'');
    el.dataset.ci=ci; // re-set
    el.onclick=()=>{
      if(craftSelected!==null){ craftGrid[ci]=craftSelected; craftSelected=null; refreshCraftUI(); }
      else if(craftGrid[ci]){ craftGrid[ci]=0; refreshCraftUI(); }
    };
  });
  // Result
  const res=getCraftResult();
  const out=document.getElementById('cresult');
  if(res){
    out.innerHTML=`${getIcon(res.id)}<span class="sc">${res.count>1?res.count:''}</span>`;
    out.className=''; out.title=getName(res.id);
  } else {
    out.innerHTML=''; out.className='empty'; out.title='';
  }
  // Info
  const info=document.getElementById('craft-info');
  if(craftSelected!==null){
    info.textContent='Click a crafting slot to place '+getName(craftSelected);
    info.style.color='var(--gold)';
  } else {
    info.textContent='Click an inventory item, then a crafting slot';
    info.style.color='';
  }
}

function updateInvDOM(){
  const main=document.getElementById('inv-main');
  const hbar=document.getElementById('inv-hbar');
  main.innerHTML=''; hbar.innerHTML='';
  for(let i=0;i<27;i++) main.appendChild(makeSlot(i));
  for(let i=0;i<9;i++)  hbar.appendChild(makeSlot(27+i));
}

function makeSlot(i){
  const s=PL.inv[i];
  const el=document.createElement('div');
  el.className='islot';
  if(s.id){
    el.textContent=getIcon(s.id);
    if(s.n>1){const c=document.createElement('span');c.className='sc';c.textContent=s.n;el.appendChild(c);}
    el.title=getName(s.id);
  }
  el.onclick=()=>{
    if(gameState!=='inv') return;
    if(s.id){
      craftSelected=s.id;
      // Deselect all, select this
      document.querySelectorAll('#inv-main .islot,#inv-hbar .islot').forEach(e=>e.classList.remove('sel'));
      el.classList.add('sel');
      refreshCraftUI();
    }
  };
  return el;
}

// ================================================================
//  SCREEN HELPERS
// ================================================================
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.style.display='none');
  const el=document.getElementById(id);
  if(el) el.style.display='flex';
}
function hideAllScreens(){
  document.querySelectorAll('.screen').forEach(s=>s.style.display='none');
}

// ================================================================
//  INPUT
// ================================================================
function setupInput(){
  // Keyboard
  document.addEventListener('keydown',e=>{
    KEYS[e.code]=true;
    if(e.code==='Escape'){
      if(gameState==='inv')        closeInv();
      else if(gameState==='playing'){ gameState='paused'; showScreen('pause-scr'); if(locked) document.exitPointerLock(); }
      else if(gameState==='paused'){ gameState='playing'; hideAllScreens(); document.getElementById('c').requestPointerLock(); }
    }
    if(e.code==='KeyE'){
      if(gameState==='inv') closeInv();
      else if(gameState==='playing') openInv();
    }
    if(e.code==='KeyF'||e.code==='KeyQ') attackMelee();
    // Hotbar keys 1-9
    if(e.code.startsWith('Digit')){
      const n=parseInt(e.code[5])-1;
      if(n>=0&&n<9){ PL.sel=n; updateHotbarDOM(); }
    }
    // F3 debug
    if(e.code==='F3'){
      const d=document.getElementById('dbg');
      d.style.display=d.style.display==='none'?'block':'none';
    }
    e.preventDefault&&['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&e.preventDefault();
  });
  document.addEventListener('keyup',e=>{ KEYS[e.code]=false; });

  // Pointer lock
  const canvas=document.getElementById('c');
  canvas.addEventListener('click',()=>{
    if(gameState==='playing'&&!isMobile()) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange',()=>{ locked=!!document.pointerLockElement; });

  // Mouse move
  document.addEventListener('mousemove',e=>{
    if(!locked) return;
    PL.yaw  -=e.movementX*0.002;
    PL.pitch-=e.movementY*0.002;
    PL.pitch=Math.max(-Math.PI/2+0.05,Math.min(Math.PI/2-0.05,PL.pitch));
  });

  // Mouse buttons
  document.addEventListener('mousedown',e=>{
    if(gameState!=='playing') return;
    if(e.button===0){ MOUSE.l=true; if(!locked) canvas.requestPointerLock(); }
    if(e.button===2){ MOUSE.r=true; tryOpenCraftingTable(); }
  });
  document.addEventListener('mouseup',e=>{ if(e.button===0) MOUSE.l=false; if(e.button===2) MOUSE.r=false; });

  // Scroll – cycle hotbar
  document.addEventListener('wheel',e=>{
    PL.sel=(PL.sel+Math.sign(e.deltaY)+9)%9;
    updateHotbarDOM();
  });

  // UI buttons
  document.getElementById('btn-resp').onclick=respawn;
  document.getElementById('btn-resume').onclick=()=>{
    gameState='playing'; hideAllScreens();
    document.getElementById('c').requestPointerLock();
  };
  document.getElementById('btn-inv-close').onclick=closeInv;
  document.getElementById('cresult').onclick=collectCraft;
  document.getElementById('btn-craft-clear').onclick=()=>{ clearCraftGrid(); buildCraftUI(); };

  // Touch
  if(isMobile()) setupTouch();

  // Resize
  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

function setupTouch(){
  document.getElementById('tui').style.display='block';

  const joyZone=document.getElementById('joy-zone');
  const joyNub =document.getElementById('joy-nub');
  const camZone=document.getElementById('cam-zone');
  const camNub =document.getElementById('cam-nub');
  const JR=74; // joystick radius

  joyZone.addEventListener('touchstart',e=>{
    e.preventDefault();
    const t=e.changedTouches[0];
    TC.joyId=t.identifier;
    const r=joyZone.getBoundingClientRect();
    TC.joyOx=r.left+r.width/2; TC.joyOy=r.top+r.height/2;
  },{passive:false});

  camZone.addEventListener('touchstart',e=>{
    e.preventDefault();
    const t=e.changedTouches[0];
    TC.camId=t.identifier; TC.camOx=t.clientX; TC.camOy=t.clientY;
  },{passive:false});

  document.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier===TC.joyId){
        let dx=t.clientX-TC.joyOx, dy=t.clientY-TC.joyOy;
        const len=Math.sqrt(dx*dx+dy*dy);
        if(len>JR){ dx=dx/len*JR; dy=dy/len*JR; }
        TC.jdx=dx/JR; TC.jdy=dy/JR;
        joyNub.style.transform=`translate(${dx}px,${dy}px)`;
      }
      if(t.identifier===TC.camId){
        const dx=t.clientX-TC.camOx, dy=t.clientY-TC.camOy;
        PL.yaw  -=dx*0.006; PL.pitch-=dy*0.006;
        PL.pitch=Math.max(-Math.PI/2+0.05,Math.min(Math.PI/2-0.05,PL.pitch));
        TC.camOx=t.clientX; TC.camOy=t.clientY;
        const clamp=28, cx=Math.max(-clamp,Math.min(clamp,dx)), cy=Math.max(-clamp,Math.min(clamp,dy));
        camNub.style.transform=`translate(${cx}px,${cy}px)`;
      }
    }
  },{passive:false});

  document.addEventListener('touchend',e=>{
    for(const t of e.changedTouches){
      if(t.identifier===TC.joyId){ TC.joyId=null; TC.jdx=0; TC.jdy=0; joyNub.style.transform=''; }
      if(t.identifier===TC.camId){ TC.camId=null; camNub.style.transform=''; }
    }
  });

  // Buttons
  btn('tj','touchstart','touchend',()=>TC.jump=true,()=>TC.jump=false);
  btn('tb','touchstart','touchend',()=>TC.breaking=true,()=>TC.breaking=false);
  btn('tp','touchstart',null,()=>doPlace());
  btn('ti','touchstart',null,()=>openInv());
  btn('ta','touchstart',null,()=>attackMelee());

  function btn(id,onEv,offEv,onFn,offFn){
    const el=document.getElementById(id);
    el.addEventListener(onEv,e=>{ e.preventDefault(); e.stopPropagation(); onFn&&onFn(); },{passive:false});
    if(offEv&&offFn) el.addEventListener(offEv,e=>{ e.preventDefault(); offFn(); },{passive:false});
  }
}

// ================================================================
//  UI SETUP (called once)
// ================================================================
function setupUI(){
  updateHealthDOM();
  updateHotbarDOM();
}

// ================================================================
//  HELPERS
// ================================================================
function isMobile(){
  return window.innerWidth<=768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ================================================================
//  MAIN LOOP
// ================================================================
function loop(){
  requestAnimationFrame(loop);

  const dt=Math.min(clock.getDelta(),0.05);

  // FPS
  frameAcc+=dt; frameN++;
  if(frameAcc>=1){ fps=frameN; frameAcc=0; frameN=0; }

  if(gameState==='playing'||gameState==='dead'){
    updateDayNight(dt);
    if(gameState==='playing'){
      updatePlayer(dt);
      updateBreaking(dt);
      updateEntities(dt);
      updateDrops(dt);
      tickFalling(dt);
      tickWater(dt);
      streamChunks();

      // Attack if LMB held and no block in range
      if(MOUSE.l&&locked&&PL.atkCD<=0){
        const hit=raycast(3);
        if(!hit) attackMelee();
      }

      // Debug panel
      const d=document.getElementById('dbg');
      if(d.style.display!=='none'){
        d.innerHTML=`FPS: ${fps}<br>XYZ: ${PL.pos.x.toFixed(1)} ${PL.pos.y.toFixed(1)} ${PL.pos.z.toFixed(1)}<br>Chunks: ${chunks.size}<br>Entities: ${entities.length}<br>Drops: ${itemDrops.length}<br>Time: ${(dayT*100).toFixed(1)}%`;
      }
    }
  }

  renderer.render(scene,camera);
}
