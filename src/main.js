import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc7e6f7);
scene.fog = new THREE.Fog(0xc7e6f7, 55, 115);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 42, 18);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8b9aa8, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-18, 35, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -35; sun.shadow.camera.right = 35;
sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
scene.add(sun);

const mats = {};
function material(color, roughness = 0.72) {
  const key = color + ':' + roughness;
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
  return mats[key];
}
function cube(size, position, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, options.roughness ?? 0.72));
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function cylinder(radius, height, position, color, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material(color));
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}
function label(text, position, color = '#fff') {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = 'rgba(25,35,45,.88)'; x.beginPath(); x.roundRect(4,4,504,120,22); x.fill();
  x.font = 'bold 50px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(text,256,64);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  sprite.scale.set(4.5, 1.12, 1); sprite.position.set(...position); scene.add(sprite); return sprite;
}

// Spacious, polished restaurant environment.
cube([35,0.5,27],[0,-0.25,0],0xe7d1b1,{castShadow:false});
cube([35.2,7,.7],[0,3.5,-13.6],0xf2d5aa); cube([35.2,7,.7],[0,3.5,13.6],0xf2d5aa);
cube([.7,7,26.5],[-17.1,3.5,0],0xf2d5aa); cube([.7,7,26.5],[17.1,3.5,0],0xf2d5aa);
cube([35.2,.6,1.5],[0,6.7,-13.9],0xd69b60); cube([35.2,.6,1.5],[0,6.7,13.9],0xd69b60);
cube([1.5,.6,26.5],[-16.9,6.7,0],0xd69b60); cube([1.5,.6,26.5],[16.9,6.7,0],0xd69b60);

// Decorative floor strips for a more finished mobile-management-game look.
for (const z of [-10,-5,0,5,10]) cube([34,.025,.08],[0,.03,z],0xd4b994,{castShadow:false});

// Detailed kitchen with counters, appliances, shelves and warm accents.
cube([11,1.15,3.2],[0,1.1,-4],0x8b5b3b); label('KITCHEN',[0,3.2,-4]);
for (const x of [-4,-1.35,1.35,4]) { cube([2.1,.18,1.9],[x,1.78,-4],0xc8d1d6); cylinder(.35,.12,[x,1.9,-4],0xeeeeee); }
cube([10.5,2.5,.35],[0,2.8,-5.45],0x6e4933); cube([10.5,.25,.35],[0,4.05,-5.45],0xdca66d);
for (const x of [-4,-1.3,1.3,4]) cube([.12,1.8,.12],[x,3.1,-5.25],0xf4c77f);

// Reservation and entrance desks.
cube([5.5,.85,2],[0,.45,-11.5],0x98653f); cube([5.1,.12,1.65],[0,.95,-11.5],0xd8a36c); label('RESERVATIONS',[0,2.05,-11.5]);
cube([5.5,.85,2],[0,.45,11.5],0x98653f); cube([5.1,.12,1.65],[0,.95,11.5],0xd8a36c); label('ENTRANCE',[0,2.05,11.5]);

const tables = [];
for (const x of [-11,-5.5,0,5.5,11]) for (const z of [-8,2,8]) {
  cube([3.2,.28,2.5],[x,.3,z],0xb8754b);
  cube([2.35,1.05,1.7],[x,1,z],0xf0bd78);
  cylinder(.22,1.05,[x,.65,z],0x9a633f);
  for (const dx of [-1.15,1.15]) for (const dz of [-.8,.8]) { cube([.5,.7,.5],[x+dx,.48,z+dz],0x7b8f9b); }
  tables.push({x,z,occupied:false});
}

const player = cube([.8,1.6,.8],[0,.9,10],0x4d78d4); label('YOU',[0,2.2,10],'#9ed0ff');
const customers = []; let money = 0, reputation = 0, completedOrders = 0, activeTask = 'Take an order';
function createCustomer(t) { const c = cube([.75,1.45,.75],[t.x,.8,t.z],0xe88b7a); c.userData={table:t,state:'seated',timer:0}; customers.push(c); t.occupied=true; activeTask='Prepare a meal'; }
function spawnCustomer() { const t=tables.find(t=>!t.occupied); if(t) createCustomer(t); }
function near(p,d=2.5) { return Math.hypot(player.position.x-p.x,player.position.z-p.z)<d; }
function interact() { if(near({x:0,z:-11.5},3)){spawnCustomer();return;} if(near({x:0,z:-4},3)){const c=customers.find(c=>c.userData.state==='seated');if(c){c.userData.state='served';c.userData.timer=0;c.material.color.set(0x83c995);activeTask='Collect payment';}} }
function updateCustomer(c,dt) { const d=c.userData; d.timer+=dt; if(d.state==='served'&&d.timer>4){money+=25;reputation++;completedOrders++;d.table.occupied=false;scene.remove(c);customers.splice(customers.indexOf(c),1);activeTask='Take an order';} }

const keys={}; window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e')interact();}); window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const hud=document.createElement('div'); hud.style.cssText='position:fixed;top:18px;left:18px;padding:14px 18px;border-radius:14px;background:rgba(24,35,48,.88);color:white;font:600 16px Arial;line-height:1.65;z-index:5;box-shadow:0 5px 18px #0003'; document.body.appendChild(hud);
let last=performance.now();
function animate(now=performance.now()){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.1);last=now;const speed=dt*5.5;if(keys.w||keys.arrowup)player.position.z-=speed;if(keys.s||keys.arrowdown)player.position.z+=speed;if(keys.a||keys.arrowleft)player.position.x-=speed;if(keys.d||keys.arrowright)player.position.x+=speed;player.position.x=THREE.MathUtils.clamp(player.position.x,-15.5,15.5);player.position.z=THREE.MathUtils.clamp(player.position.z,-12,12);customers.slice().forEach(c=>updateCustomer(c,dt));hud.innerHTML=`🍽️ <b>MY RESTAURANT</b><br>💰 Money: $${money}<br>⭐ Reputation: ${reputation}<br>📋 Orders served: ${completedOrders}<br><br>🎯 <b>${activeTask}</b><br><small>WASD / arrows to move<br>E near Reservations or Kitchen</small>`;renderer.render(scene,camera);}
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);}); animate();
