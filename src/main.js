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

const ambient = new THREE.HemisphereLight(0xffffff, 0x78909c, 2.2);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(12, 25, 10);
scene.add(sun);

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(25, 0.5, 19),
  new THREE.MeshLambertMaterial({ color: 0xe8cfa5 })
);
floor.position.y = -0.25;
scene.add(floor);

function cube(size, position, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(...position);
  scene.add(mesh);
  return mesh;
}

cube([25.2, 7, 0.7], [0, 3.5, -9.6], 0xf4d6a0);
cube([25.2, 7, 0.7], [0, 3.5, 9.6], 0xf4d6a0);
cube([0.7, 7, 18.5], [-12.1, 3.5, 0], 0xf4d6a0);
cube([0.7, 7, 18.5], [12.1, 3.5, 0], 0xf4d6a0);

// Open-center cutaway roof: keeps the building readable while showing the interior.
cube([25.2, 0.6, 1.5], [0, 6.7, -9.9], 0xd89b58);
cube([25.2, 0.6, 1.5], [0, 6.7, 9.9], 0xd89b58);
cube([1.5, 0.6, 18.5], [-11.9, 6.7, 0], 0xd89b58);
cube([1.5, 0.6, 18.5], [11.9, 6.7, 0], 0xd89b58);

cube([7, 2.8, 1], [0, 1.4, -8.5], 0x9b6b43);
cube([6, 2.5, 1], [0, 1.25, 5.8], 0x6f8f54);

for (const x of [-7, 0, 7]) {
  for (const z of [-4, 2]) {
    cube([3.2, 0.35, 2.5], [x, 0.3, z], 0xc77d52);
    cube([2.3, 1.1, 1.6], [x, 1, z], 0xf1b86b);
  }
}

cube([8, 1.2, 2], [0, 1.1, -2], 0x8b5e3c);
cube([1.2, 2.4, 7], [-7, 1.2, 6], 0x6e9bcb);
cube([1.2, 2.4, 7], [7, 1.2, 6], 0x6e9bcb);

const player = cube([0.8, 1.6, 0.8], [0, 0.9, 7], 0x4d78d4);

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function animate() {
  requestAnimationFrame(animate);
  const speed = 0.09;
  if (keys.w || keys.arrowup) player.position.z -= speed;
  if (keys.s || keys.arrowdown) player.position.z += speed;
  if (keys.a || keys.arrowleft) player.position.x -= speed;
  if (keys.d || keys.arrowright) player.position.x += speed;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -10.5, 10.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -8, 8);
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
