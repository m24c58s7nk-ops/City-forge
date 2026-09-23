import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc7e6f7);
scene.fog = new THREE.Fog(0xc7e6f7, 55, 115);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 18, 14);
camera.lookAt(0, 1, 5);

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

cube([35,0.5,27],[0,-0.25,0],0xe7d1b1,{castShadow:false});
cube([35.2,7,.7],[0,3.5,-13.6],0xf2d5aa); cube([35.2,7,.7],[0,3.5,13.6],0xf2d5aa);
cube([.7,7,26.5],[-17.1,3.5,0],0xf2d5aa); cube([.7,7,26.5],[17.1,3.5,0],0xf2d5aa);
cube([35.2,.6,1.5],[0,6.7,-13.9],0xd69b60); cube([35.2,.6,1.5],[0,6.7,13.9],0xd69b60);
cube([1.5,.6,26.5],[-16.9,6.7,0],0xd69b60); cube([1.5,.6,26.5],[16.9,6.7,0],0xd69b60);
for (const z of [-10,-5,0,5,10]) cube([34,.025,.08],[0,.03,z],0xd4b994,{castShadow:false});

cube([7,.9,2.2],[0,.45,11.4],0x8f5b38);
cube([6.6,.14,1.9],[0,1.0,11.4],0xd9a16a);
cube([1.2,.12,.8],[-2.2,1.18,11.4],0xeee1c8,{roughness:.45});
cube([1.2,.12,.8],[2.2,1.18,11.4],0xeee1c8,{roughness:.45});
label('RESERVATIONS',[0,2.15,11.4]);
cube([10,.04,3.2],[0,.03,13.0],0x9c6b4b,{castShadow:false});
cube([6,.05,.12],[0,.08,12.0],0xf4d39b,{castShadow:false});

const kitchenX = -11;
const kitchenZ = -8.5;
cube([11.5,.12,9.0],[kitchenX,.08,kitchenZ],0xb7a08a,{castShadow:false});
label('KITCHEN',[kitchenX,4.0,kitchenZ]);
cube([10.2,1.15,.9],[kitchenX,1.0,-11.8],0x687783,{roughness:.4});
cube([10.4,.12,1.0],[kitchenX,1.65,-11.8],0xd9e1e5,{roughness:.3});
for (const x of [-15,-12.3,-9.6,-6.9]) {
  cube([2.1,.12,.7],[x,1.78,-11.8],0xf1f4f5,{roughness:.25});
  cylinder(.28,.08,[x,1.88,-11.8],0x424b52);
}
for (const x of [-14.5,-11.8,-9.1]) {
  cube([2.2,1.8,1.7],[x,1.0,-8.8],0x59636b,{roughness:.35});
  cube([1.65,.06,.75],[x,1.55,-7.9],0x252b30,{roughness:.25});
  for (const dx of [-.48,.48]) cylinder(.18,.06,[x+dx,1.94,-8.8],0x20252a);
}
cube([2.1,3.4,2.0],[-6.2,1.8,-9.5],0xd5dde1,{roughness:.3});
cube([1.7,.06,.08],[-6.2,2.1,-8.48],0x69747b,{roughness:.3});
cube([1.7,.06,.08],[-6.2,1.35,-8.48],0x69747b,{roughness:.3});
for (const y of [2.5,3.35]) {
  cube([8.8,.16,.55],[-11,y,-7.0],0x8a5a39);
  for (const x of [-14.5,-12.5,-10.5,-8.5]) cylinder(.22,.45,[x,y+.28,-7.0],0xd7a56d,16);
}
cube([4.2,1.15,1.4],[-14.2,1.0,-5.7],0x77858c,{roughness:.35});
cube([2.2,.12,.8],[-14.2,1.62,-5.7],0xcfd9de,{roughness:.25});
cylinder(.42,.1,[-14.2,1.72,-5.7],0x3c474e);
cube([10.5,1.1,.8],[-6.8,1.0,-3.9],0x9a6945);
cube([10.7,.12,.9],[-6.8,1.62,-3.9],0xe2b57e);
label('SERVICE PASS',[-6.8,2.35,-3.9]);

const tables = [];
for (const x of [-3,4.5,12]) for (const z of [-1,5,9]) {
  cube([3.2,.28,2.5],[x,.3,z],0xb8754b);
  cube([2.35,1.05,1.7],[x,1,z],0xf0bd78);
  cylinder(.22,1.05,[x,.65,z],0x9a633f);
  for (const dx of [-1.15,1.15]) for (const dz of [-.8,.8]) cube([.5,.7,.5],[x+dx,.48,z+dz],0x7b8f9b);
  tables.push({x,z,occupied:false});
}

const player = cube([.8,1.6,.8],[0,.9,7],0x4d78d4); label('YOU',[0,2.2,7],'#9ed0ff');
const customers = []; let money = 0, reputation = 0, completedOrders = 0, activeTask = 'Take an order';
function createCustomer(t) { const c = cube([.75,1.45,.75],[t.x,.8,t.z],0xe88b7a); c.userData={table:t,state:'seated',timer:0}; customers.push(c); t.occupied=true; activeTask='Prepare a meal'; }
function spawnCustomer() { const t=tables.find(t=>!t.occupied); if(t) createCustomer(t); }
function near(p,d=2.5) { return Math.hypot(player.position.x-p.x,player.position.z-p.z)<d; }
function interact() { if(near({x:0,z:11.4},3)){spawnCustomer();return;} if(near({x:-6.8,z:-3.9},4)){const c=customers.find(c=>c.userData.state==='seated');if(c){c.userData.state='served';c.userData.timer=0;c.material.color.set(0x83c995);activeTask='Collect payment';}} }
function updateCustomer(c,dt) { const d=c.userData; d.timer+=dt; if(d.state==='served'&&d.timer>4){money+=25;reputation++;completedOrders++;d.table.occupied=false;scene.remove(c);customers.splice(customers.indexOf(c),1);activeTask='Take an order';} }

const keys={}; window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e')interact();}); window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

// iPad/mobile joystick.
const joystick = document.createElement('div');
joystick.id = 'joystick';
joystick.innerHTML = '<div id="joystick-knob"></div>';
document.body.appendChild(joystick);
const knob = joystick.querySelector('#joystick-knob');
const joystickVector = { x: 0, y: 0 };
let joystickPointer = null;
function updateJoystick(clientX, clientY) {
  const rect = joystick.getBoundingClientRect();
  const radius = rect.width / 2;
  let x = clientX - (rect.left + radius);
  let y = clientY - (rect.top + radius);
  const distance = Math.hypot(x, y);
  const max = radius - 34;
  if (distance > max) { x = x / distance * max; y = y / distance * max; }
  joystickVector.x = x / max;
  joystickVector.y = y / max;
  knob.style.transform = `translate(${x}px, ${y}px)`;
}
function resetJoystick() { joystickPointer = null; joystickVector.x = 0; joystickVector.y = 0; knob.style.transform = 'translate(0px, 0px)'; }
joystick.addEventListener('pointerdown', e => { joystickPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); updateJoystick(e.clientX, e.clientY); e.preventDefault(); });
joystick.addEventListener('pointermove', e => { if (e.pointerId === joystickPointer) updateJoystick(e.clientX, e.clientY); });
joystick.addEventListener('pointerup', resetJoystick);
joystick.addEventListener('pointercancel', resetJoystick);

const hud=document.createElement('div'); hud.style.cssText='position:fixed;top:18px;left:18px;padding:14px 18px;border-radius:14px;background:rgba(24,35,48,.88);color:white;font:600 16px Arial;line-height:1.65;z-index:5;box-shadow:0 5px 18px #0003'; document.body.appendChild(hud);
let last=performance.now();
function animate(now=performance.now()){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.1);last=now;const speed=dt*5.5;const moveX=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joystickVector.x;const moveZ=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joystickVector.y;if(moveX||moveZ){const length=Math.hypot(moveX,moveZ);player.position.x+=moveX/Math.max(length,1)*speed;player.position.z+=moveZ/Math.max(length,1)*speed;}player.position.x=THREE.MathUtils.clamp(player.position.x,-15.5,15.5);player.position.z=THREE.MathUtils.clamp(player.position.z,-12,12);customers.slice().forEach(c=>updateCustomer(c,dt));
  const target = new THREE.Vector3(player.position.x, 0.8, player.position.z);
  const desiredCamera = new THREE.Vector3(player.position.x, 17, player.position.z + 11);
  camera.position.lerp(desiredCamera, 0.08);
  camera.lookAt(target);
  hud.innerHTML=`🍽️ <b>MY RESTAURANT</b><br>💰 Money: $${money}<br>⭐ Reputation: ${reputation}<br>📋 Orders served: ${completedOrders}<br><br>🎯 <b>${activeTask}</b><br><small>Joystick / WASD to move<br>E near Reservations or Service Pass</small>`;renderer.render(scene,camera);}
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);}); animate();
