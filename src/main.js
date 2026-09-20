import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `<div id="hud"><strong>CITYFORGE</strong><span>Money: $<b id="money">500</b></span><span>Population: <b id="population">0</b></span></div><div id="hint">WASD or joystick to move</div><div id="joystick"><div id="joystick-knob"></div></div>`;

let money = 500, population = 0;
const moneyEl = document.querySelector('#money');
const populationEl = document.querySelector('#population');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd3f5);
scene.fog = new THREE.Fog(0x9bd3f5, 35, 90);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x668866, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

const colliders = [];
function box(x, y, z, w, h, d, color, solid = false, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (solid) colliders.push({ x, z, w, d });
  return mesh;
}

box(0, -0.5, 0, 45, 1, 45, 0x5f9b55);
box(0, 0.05, 0, 9, 0.1, 45, 0x555b63);
box(0, 0.06, 0, 45, 0.1, 9, 0x555b63);
box(0, 2, 0, 7, 4, 6, 0xd9d1bd, true);
box(0, 4.5, 0, 8, 1, 7, 0x9c4939, true);
box(0, 6, 0, 1.3, 2, 1.3, 0x9c4939, true);

function makeCharacter() {
  const group = new THREE.Group();
  group.position.set(0, 0, 10);
  scene.add(group);
  const add = (geometry, position, color) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
    mesh.position.set(...position);
    mesh.castShadow = true;
    group.add(mesh);
  };
  add(new THREE.CapsuleGeometry(0.48, 0.75, 6, 12), [0, 1.25, 0], 0x2f65d9);
  add(new THREE.SphereGeometry(0.43, 16, 12), [0, 2.25, 0], 0xf2c29b);
  add(new THREE.SphereGeometry(0.46, 16, 8), [0, 2.4, 0], 0x3b241b);
  return group;
}

const player = makeCharacter();

const keys = {};
addEventListener('keydown', event => keys[event.key.toLowerCase()] = true);
addEventListener('keyup', event => keys[event.key.toLowerCase()] = false);

const joystick = document.querySelector('#joystick');
const knob = document.querySelector('#joystick-knob');
let joystickX = 0;
let joystickY = 0;
let joystickActive = false;
let joystickPointerId = null;

function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const max = rect.width * 0.34;
  const distance = Math.hypot(dx, dy);
  if (distance > max) {
    dx = dx / distance * max;
    dy = dy / distance * max;
  }
  joystickX = dx / max;
  joystickY = dy / max;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}

joystick.addEventListener('pointerdown', event => {
  joystickActive = true;
  joystickPointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
});
joystick.addEventListener('pointermove', event => {
  if (joystickActive && event.pointerId === joystickPointerId) updateJoystick(event);
});
function releaseJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;
  joystickActive = false;
  joystickPointerId = null;
  joystickX = 0;
  joystickY = 0;
  knob.style.transform = 'translate(0px, 0px)';
}
joystick.addEventListener('pointerup', releaseJoystick);
joystick.addEventListener('pointercancel', releaseJoystick);
joystick.addEventListener('lostpointercapture', () => {
  joystickActive = false;
  joystickX = 0;
  joystickY = 0;
  knob.style.transform = 'translate(0px, 0px)';
});

let yaw = 0.65;
let pitch = 0.65;
let distance = 20;

function blocked(x, z) {
  return colliders.some(c => Math.abs(x - c.x) < c.w / 2 + 0.65 && Math.abs(z - c.z) < c.d / 2 + 0.65);
}

function cameraFollow() {
  const target = new THREE.Vector3(player.position.x, 1.2, player.position.z);
  const horizontal = Math.cos(pitch) * distance;
  camera.position.lerp(new THREE.Vector3(target.x + Math.sin(yaw) * horizontal, target.y + Math.sin(pitch) * distance, target.z + Math.cos(yaw) * horizontal), 0.18);
  camera.lookAt(target);
}

let last = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  let right = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + joystickX;
  let forward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0) - joystickY;
  const length = Math.hypot(right, forward) || 1;
  right /= length;
  forward /= length;

  const moveX = right * Math.cos(yaw) - forward * Math.sin(yaw);
  const moveZ = -right * Math.sin(yaw) - forward * Math.cos(yaw);
  const nextX = player.position.x + moveX * 7 * dt;
  const nextZ = player.position.z + moveZ * 7 * dt;

  if (!blocked(nextX, nextZ)) {
    player.position.x = nextX;
    player.position.z = nextZ;
  }
  if (right !== 0 || forward !== 0) player.rotation.y = Math.atan2(moveX, moveZ);

  cameraFollow();
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

setInterval(() => {
  money += population * 2;
  moneyEl.textContent = money;
}, 1000);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});