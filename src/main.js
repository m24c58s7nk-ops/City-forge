import * as THREE from 'three';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9dff2);

// Elevated angled overview camera, similar to a management-game view.
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 32, 27);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x78909c, 2.4));
const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.position.set(12,25,10); scene.add(sun);

function cube(size, position, color) { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshLambertMaterial({color})); m.position.set(...position); scene.add(m); return m; }
function label(text, position, color='#fff') { const c=document.createElement('canvas'); c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='rgba(25,35,45,.85)';x.beginPath();x.roundRect(4,4,504,120,22);x.fill();x.font='bold 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle=color;x.fillText(text,256,64);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));s.scale.set(4.5,1.12,1);s.position.set(...position);scene.add(s);return s; }

cube([25,0.5,19],[0,-0.25,0],0xe8cfa5);
cube([25.2,7,.7],[0,3.5,-9.6],0xf4d6a0); cube([25.2,7,.7],[0,3.5,9.6],0xf4d6a0);
cube([.7,7,18.5],[-12.1,3.5,0],0xf4d6a0); cube([.7,7,18.5],[12.1,3.5,0],0xf4d6a0);
// Open cutaway roof so the restaurant interior remains visible.
cube([25.2,.6,1.5],[0,6.7,-9.9],0xd89b58); cube([25.2,.6,1.5],[0,6.7,9.9],0xd89b58); cube([1.5,.6,18.5],[-11.9,6.7,0],0xd89b58); cube([1.5,.6,18.5],[11.9,6.7,0],0xd89b58);

// Restaurant-only stations.
cube([8,1.2,2],[0,1.1,-2],0x8b5e3c); label('KITCHEN',[0,3.2,-2]);
cube([1.2,2.4,7],[-7,1.2,6],0x6e9bcb); cube([1.2,2.4,7],[7,1.2,6],0x6e9bcb);
cube([4,.8,1.5],[0,.4,-8.2],0x9b6b43); label('ORDER HERE',[0,2,-8.2]);

const tables=[]; for(const x of [-7,0,7]) for(const z of [-4,2]) { cube([3.2,.35,2.5],[x,.3,z],0xc77d52); cube([2.3,1.1,1.6],[x,1,z],0xf1b86b); tables.push({x,z,occupied:false}); }
const player=cube([.8,1.6,.8],[0,.9,7],0x4d78d4); label('YOU',[0,2.2,7],'#9ed0ff');
const customers=[]; let money=0,reputation=0,completedOrders=0,activeTask='Take an order';
function createCustomer(t){const c=cube([.75,1.45,.75],[t.x,.8,t.z],0xe88b7a);c.userData={table:t,state:'seated',timer:0};customers.push(c);t.occupied=true;activeTask='Prepare a meal';}
function spawnCustomer(){const t=tables.find(t=>!t.occupied);if(t)createCustomer(t);}
function near(p,d=2.5){return Math.hypot(player.position.x-p.x,player.position.z-p.z)<d;}
function interact(){if(near({x:0,z:-8.2},3)){spawnCustomer();return;}if(near({x:0,z:-2},3)){const c=customers.find(c=>c.userData.state==='seated');if(c){c.userData.state='served';c.userData.timer=0;c.material.color.set(0x83c995);activeTask='Collect payment';}}}
function updateCustomer(c,dt){const d=c.userData;d.timer+=dt;if(d.state==='served'&&d.timer>4){money+=25;reputation++;completedOrders++;d.table.occupied=false;scene.remove(c);customers.splice(customers.indexOf(c),1);activeTask='Take an order';}}
const keys={};window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e')interact();});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const hud=document.createElement('div');hud.style.cssText='position:fixed;top:18px;left:18px;padding:14px 18px;border-radius:14px;background:rgba(24,35,48,.88);color:white;font:600 16px Arial;line-height:1.65;z-index:5;box-shadow:0 5px 18px #0003';document.body.appendChild(hud);
let last=performance.now();function animate(now=performance.now()){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.1);last=now;const speed=dt*5.5;if(keys.w||keys.arrowup)player.position.z-=speed;if(keys.s||keys.arrowdown)player.position.z+=speed;if(keys.a||keys.arrowleft)player.position.x-=speed;if(keys.d||keys.arrowright)player.position.x+=speed;player.position.x=THREE.MathUtils.clamp(player.position.x,-10.5,10.5);player.position.z=THREE.MathUtils.clamp(player.position.z,-8,8);customers.slice().forEach(c=>updateCustomer(c,dt));hud.innerHTML=`🍽️ <b>MY RESTAURANT</b><br>💰 Money: $${money}<br>⭐ Reputation: ${reputation}<br>📋 Orders served: ${completedOrders}<br><br>🎯 <b>${activeTask}</b><br><small>WASD / arrows to move<br>E near Order Here or Kitchen</small>`;renderer.render(scene,camera);}
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});animate();