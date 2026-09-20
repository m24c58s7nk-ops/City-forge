import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="hud"><strong>CITYFORGE</strong><span>Money: $<b id="money">500</b></span><span>Population: <b id="population">0</b></span></div>
  <div id="hint">WASD or joystick to move · Walk onto construction pads to build</div>
  <div id="joystick"><div id="joystick-knob"></div></div>
`;

let money = 500;
let population = 0;
const moneyEl = document.querySelector('#money');
const populationEl = document.querySelector('#population');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd3f5);
scene.fog = new THREE.Fog(0x9bd3f5, 35, 90);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
camera.position.set(12, 12, 16);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x668866, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

function box(x, y, z, w, h, d, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}

box(0, -0.5, 0, 45, 1, 45, 0x5f9b55);
box(0, 0.05, 0, 9, 0.1, 45, 0x555b63);
box(0, 0.06, 0, 45, 0.1, 9, 0x555b63);
box(0, 2, 0, 7, 4, 6, 0xd9d1bd);
box(0, 4.5, 0, 8, 1, 7, 0x9c4939);
box(0, 6, 0, 1.3, 2, 1.3, 0x9c4939);

const player = box(0, 1, 10, 1, 2, 1, 0x2f65d9);
const pads = [];
function createPad(x, z, label, cost, action) {
  const pad = box(x, 0.18, z, 3, 0.25, 3, 0xf2c94c);
  pad.userData = { label, cost, action, built: false }; pads.push(pad); return pad;
}
createPad(-8, -5, 'Market Stall', 100, () => { box(-8, 1.5, -5, 4, 3, 3, 0xe58b3d); box(-8, 3.5, -5, 4.5, 0.4, 3.5, 0x8e3e2f); population += 2; populationEl.textContent = population; });
createPad(8, -5, 'Bakery', 250, () => { box(8, 2, -5, 5, 4, 4, 0xf0d6a5); box(8, 4.5, -5, 5.5, 0.5, 4.5, 0xb65c42); population += 4; populationEl.textContent = population; });

const keys = {};
addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

let joystickX = 0, joystickY = 0;
const joystick = document.querySelector('#joystick');
const knob = document.querySelector('#joystick-knob');
let joystickActive = false;
function moveJoystick(e) {
  const touch = e.touches ? e.touches[0] : e;
  const rect = joystick.getBoundingClientRect();
  let x = touch.clientX - (rect.left + rect.width / 2);
  let y = touch.clientY - (rect.top + rect.height / 2);
  const max = rect.width * 0.32;
  const length = Math.hypot(x, y);
  if (length > max) { x = x / length * max; y = y / length * max; }
  joystickX = x / max; joystickY = y / max;
  knob.style.transform = `translate(${x}px, ${y}px)`;
}
joystick.addEventListener('touchstart', e => { joystickActive = true; moveJoystick(e); e.preventDefault(); }, { passive: false });
joystick.addEventListener('touchmove', e => { if (joystickActive) moveJoystick(e); e.preventDefault(); }, { passive: false });
['touchend', 'touchcancel'].forEach(type => joystick.addEventListener(type, () => { joystickActive = false; joystickX = joystickY = 0; knob.style.transform = 'translate(0, 0)'; }));

let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  const speed = 7 * dt;
  const right = keys.d ? 1 : keys.a ? -1 : joystickX;
  const forward = keys.s ? 1 : keys.w ? -1 : joystickY;
  player.position.x += right * speed;
  player.position.z += forward * speed;
  camera.position.lerp(new THREE.Vector3(player.position.x + 12, 12, player.position.z + 16), 0.08);
  camera.lookAt(player.position.x, 0, player.position.z);
  for (const pad of pads) if (!pad.userData.built && player.position.distanceTo(pad.position) < 2.2 && money >= pad.userData.cost) { money -= pad.userData.cost; moneyEl.textContent = money; pad.userData.built = true; pad.material.color.set(0x55bb77); pad.userData.action(); }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
setInterval(() => { money += population * 2; moneyEl.textContent = money; }, 1000);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
