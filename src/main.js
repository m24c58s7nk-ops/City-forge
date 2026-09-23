import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9dff2);

const camera = new THREE.OrthographicCamera(-18, 18, 18, -18, 0.1, 200);
camera.position.set(0, 28, 24);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x78909c, 2.4));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(12, 25, 10);
scene.add(sun);

function cube(size, position, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(...position);
  scene.add(mesh);
  return mesh;
}

function label(text, position, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(25,35,45,.85)';
  ctx.roundRect(4, 4, 504, 120, 22);
  ctx.fill();
  ctx.font = 'bold 54px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(4.5, 1.12, 1);
  sprite.position.set(...position);
  scene.add(sprite);
  return sprite;
}

cube([25, 0.5, 19], [0, -0.25, 0], 0xe8cfa5);
cube([25.2, 7, 0.7], [0, 3.5, -9.6], 0xf4d6a0);
cube([25.2, 7, 0.7], [0, 3.5, 9.6], 0xf4d6a0);
cube([0.7, 7, 18.5], [-12.1, 3.5, 0], 0xf4d6a0);
cube([0.7, 7, 18.5], [12.1, 3.5, 0], 0xf4d6a0);

// Open cutaway roof, leaving the restaurant visible from above.
cube([25.2, 0.6, 1.5], [0, 6.7, -9.9], 0xd89b58);
cube([25.2, 0.6, 1.5], [0, 6.7, 9.9], 0xd89b58);
cube([1.5, 0.6, 18.5], [-11.9, 6.7, 0], 0xd89b58);
cube([1.5, 0.6, 18.5], [11.9, 6.7, 0], 0xd89b58);

// Reception and kitchen stations.
cube([7, 2.8, 1], [0, 1.4, -8.5], 0x9b6b43);
cube([8, 1.2, 2], [0, 1.1, -2], 0x8b5e3c);
cube([1.2, 2.4, 7], [-7, 1.2, 6], 0x6e9bcb);
cube([1.2, 2.4, 7], [7, 1.2, 6], 0x6e9bcb);
label('RECEPTION', [0, 4.1, -8.2]);
label('KITCHEN', [0, 3.2, -2]);

// Dining tables and chairs.
const tables = [];
for (const x of [-7, 0, 7]) {
  for (const z of [-4, 2]) {
    cube([3.2, 0.35, 2.5], [x, 0.3, z], 0xc77d52);
    cube([2.3, 1.1, 1.6], [x, 1, z], 0xf1b86b);
    tables.push({ x, z, occupied: false, mealReady: false });
  }
}

const player = cube([0.8, 1.6, 0.8], [0, 0.9, 7], 0x4d78d4);
label('YOU', [0, 2.2, 7], '#9ed0ff');

const customers = [];
let money = 0;
let reputation = 0;
let completedOrders = 0;
let activeTask = 'Seat a customer';

function createCustomer(table) {
  const customer = cube([0.75, 1.45, 0.75], [table.x, 0.8, table.z], 0xe88b7a);
  customer.userData = { table, state: 'waiting', timer: 0 };
  customers.push(customer);
  table.occupied = true;
  activeTask = 'Prepare a meal';
}

function spawnCustomer() {
  const free = tables.find(t => !t.occupied);
  if (free) createCustomer(free);
}

function near(object, distance = 2.3) {
  return Math.hypot(player.position.x - object.x, player.position.z - object.z) < distance;
}

function updateCustomer(customer, delta) {
  const data = customer.userData;
  data.timer += delta;
  if (data.state === 'waiting' && data.timer > 2) {
    data.state = 'seated';
    data.timer = 0;
    activeTask = 'Prepare a meal';
  } else if (data.state === 'served' && data.timer > 4) {
    money += 25;
    reputation += 1;
    completedOrders += 1;
    data.table.occupied = false;
    scene.remove(customer);
    customers.splice(customers.indexOf(customer), 1);
    activeTask = 'Seat a customer';
  }
}

function interact() {
  // Seat a customer at the nearest free table.
  if (near({ x: 0, z: -8.5 }, 3)) {
    spawnCustomer();
    return;
  }

  // Prepare food at the kitchen counter.
  if (near({ x: 0, z: -2 }, 3)) {
    const customer = customers.find(c => c.userData.state === 'seated');
    if (customer) {
      customer.userData.state = 'served';
      customer.userData.timer = 0;
      customer.material.color.set(0x83c995);
      activeTask = 'Collect payment';
    }
    return;
  }
}

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') interact();
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const hud = document.createElement('div');
hud.style.cssText = 'position:fixed;top:18px;left:18px;padding:14px 18px;border-radius:14px;background:rgba(24,35,48,.88);color:white;font:600 16px Arial;line-height:1.65;z-index:5;box-shadow:0 5px 18px #0003';
document.body.appendChild(hud);

let last = performance.now();
function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - last) / 1000, 0.1);
  last = now;
  const speed = 0.09;
  if (keys.w || keys.arrowup) player.position.z -= speed;
  if (keys.s || keys.arrowdown) player.position.z += speed;
  if (keys.a || keys.arrowleft) player.position.x -= speed;
  if (keys.d || keys.arrowright) player.position.x += speed;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -10.5, 10.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -8, 8);
  customers.slice().forEach(c => updateCustomer(c, delta));
  hud.innerHTML = `🍽️ <b>MY RESTAURANT</b><br>💰 Money: $${money}<br>⭐ Reputation: ${reputation}<br>📋 Orders served: ${completedOrders}<br><br>🎯 <b>${activeTask}</b><br><small>Move with WASD / arrows<br>Press E near a station</small>`;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -18 * aspect;
  camera.right = 18 * aspect;
  camera.top = 18;
  camera.bottom = -18;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
