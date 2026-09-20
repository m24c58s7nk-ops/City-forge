import * as THREE from 'three';

import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="hud"><strong>CITYFORGE</strong><span>Money: $<b id="money">500</b></span><span>Population: <b id="population">0</b></span></div>
  <div id="hint">WASD or joystick to move · Drag the right side to look · Pinch to zoom</div>
  <div id="joystick"><div id="joystick-knob"></div></div>
`;

let money = 500, population = 0;
const moneyEl = document.querySelector('#money');
const populationEl = document.querySelector('#population');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd3f5);
scene.fog = new THREE.Fog(0x9bd3f5, 35, 90);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = true; app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x668866, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(10, 20, 10); sun.castShadow = true; scene.add(sun);
function box(x,y,z,w,h,d,color){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
box(0,-0.5,0,45,1,45,0x5f9b55); box(0,0.05,0,9,0.1,45,0x555b63); box(0,0.06,0,45,0.1,9,0x555b63);
box(0,2,0,7,4,6,0xd9d1bd); box(0,4.5,0,8,1,7,0x9c4939); box(0,6,0,1.3,2,1.3,0x9c4939);
const player=box(0,1,10,1,2,1,0x2f65d9),pads=[];
function createPad(x,z,label,cost,action){const pad=box(x,.18,z,3,.25,3,0xf2c94c);pad.userData={label,cost,action,built:false};pads.push(pad);return pad;}
createPad(-8,-5,'Market Stall',100,()=>{box(-8,1.5,-5,4,3,3,0xe58b3d);box(-8,3.5,-5,4.5,.4,3.5,0x8e3e2f);population+=2;populationEl.textContent=population;});
createPad(8,-5,'Bakery',250,()=>{box(8,2,-5,5,4,4,0xf0d6a5);box(8,4.5,-5,5.5,.5,4.5,0xb65c42);population+=4;populationEl.textContent=population;});
const keys={}; addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true); addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let joystickX=0,joystickY=0,joystickActive=false,joystickPointer=null; const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joystick-knob');
function updateJoystick(x,y){const r=joystick.getBoundingClientRect(),max=r.width*.32;let dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2),len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max;}joystickX=dx/max;joystickY=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`;}
joystick.addEventListener('pointerdown',e=>{joystickActive=true;joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoystick(e.clientX,e.clientY);e.preventDefault();});
joystick.addEventListener('pointermove',e=>{if(joystickActive&&e.pointerId===joystickPointer)updateJoystick(e.clientX,e.clientY);e.preventDefault();});
function releaseJoystick(e){if(e.pointerId===joystickPointer){joystickActive=false;joystickPointer=null;joystickX=joystickY=0;knob.style.transform='translate(0,0)';}}
joystick.addEventListener('pointerup',releaseJoystick);joystick.addEventListener('pointercancel',releaseJoystick);

let yaw=0.65,pitch=0.65,distance=20,lookPointer=null,lastLookX=0,lastLookY=0,pinchStart=0,pinchDistance=0;
function applyCamera(){const target=new THREE.Vector3(player.position.x,1.2,player.position.z);pitch=Math.max(.25,Math.min(1.35,pitch));const horizontal=Math.cos(pitch)*distance;const pos=new THREE.Vector3(target.x+Math.sin(yaw)*horizontal,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*horizontal);camera.position.lerp(pos,.18);camera.lookAt(target);}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.5)return;lookPointer=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;const dx=e.clientX-lastLookX,dy=e.clientY-lastLookY;lastLookX=e.clientX;lastLookY=e.clientY;yaw-=dx*.008;pitch+=dy*.006;});
function stopLook(e){if(e.pointerId===lookPointer)lookPointer=null;} renderer.domElement.addEventListener('pointerup',stopLook);renderer.domElement.addEventListener('pointercancel',stopLook);
renderer.domElement.addEventListener('wheel',e=>{distance=Math.max(7,Math.min(32,distance+e.deltaY*.025));},{passive:true});
renderer.domElement.addEventListener('touchstart',e=>{if(e.touches.length===2){pinchStart=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);pinchDistance=distance;}},{passive:true});
renderer.domElement.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);distance=Math.max(7,Math.min(32,pinchDistance-(d-pinchStart)*.025));}},{passive:true});

let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.05); last=now;
  const speed=7*dt;
  let right=(keys.d?1:0)-(keys.a?1:0)+joystickX;
  let forward=(keys.w?1:0)-(keys.s?1:0)-joystickY;
  const length=Math.hypot(right,forward);
  if(length>1){right/=length;forward/=length;}
  const moveX=right*Math.cos(yaw)+forward*Math.sin(yaw);
  const moveZ=-right*Math.sin(yaw)+forward*Math.cos(yaw);
  player.position.x+=moveX*speed;
  player.position.z+=moveZ*speed;
  if(length>.05)player.rotation.y=Math.atan2(moveX,moveZ);
  applyCamera();
  for(const pad of pads)if(!pad.userData.built&&player.position.distanceTo(pad.position)<2.2&&money>=pad.userData.cost){money-=pad.userData.cost;moneyEl.textContent=money;pad.userData.built=true;pad.material.color.set(0x55bb77);pad.userData.action();}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
setInterval(()=>{money+=population*2;moneyEl.textContent=money;},1000);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
