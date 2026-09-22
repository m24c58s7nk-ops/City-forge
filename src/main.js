import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`<div id="main-menu"><div class="menu-brand">MY<span>RESTAURANT</span><small>BUILD • SERVE • GROW</small></div><button id="play-btn">OPEN RESTAURANT</button><button id="settings-btn">HOW TO PLAY</button><div id="menu-info"></div></div><div id="hud"><strong>MY RESTAURANT</strong><span>Cash: $<b>250</b></span><span>Guests: <b>0</b></span></div><div id="objective">PHASE 1: RESTAURANT FOUNDATION<br><small>Explore your new restaurant.</small></div><div id="hint">WASD / arrows to move • Drag to look • Scroll to zoom</div>`;
for(const id of ['hud','objective','hint'])document.querySelector('#'+id).style.display='none';
let started=false;
document.querySelector('#play-btn').onclick=()=>{started=true;document.querySelector('#main-menu').classList.add('menu-hide');for(const id of ['hud','objective','hint'])document.querySelector('#'+id).style.display=id==='hud'?'flex':'block'};
document.querySelector('#settings-btn').onclick=()=>document.querySelector('#menu-info').textContent='Move around the restaurant, inspect the seating area, and explore the kitchen.';

const scene=new THREE.Scene();scene.background=new THREE.Color(0xb9dce8);scene.fog=new THREE.Fog(0xb9dce8,55,115);
const camera=new THREE.OrthographicCamera(-14,14,10,-10,.1,180);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xfff5dc,0x78906d,2.8));const sun=new THREE.DirectionalLight(0xffe0aa,3.2);sun.position.set(-20,35,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
function cube(p,s,c,rot=0){const m=new THREE.Mesh(new THREE.BoxGeometry(...s),mat(c));m.position.set(...p);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function cyl(p,r,h,c,segments=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(c));m.position.set(...p);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function sign(text,x,z){const board=cube([x,4.4,z],[3,.8,.12],0x70472e);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff4cf';ctx.font='bold 48px Arial';ctx.textAlign='center';ctx.fillText(text,256,80);const tex=new THREE.CanvasTexture(canvas);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:tex,transparent:true}));m.position.set(x,4.4,z-.08);m.rotation.y=Math.PI;scene.add(m);return board}

// Enclosed My Perfect Hotel-style restaurant building.
cube([0,-.65,0],[70,1,70],0x78a86b);cube([0,-.08,0],[24,.22,20],0xe7c995);
// Solid back, side walls, front wall, and roof: the player stays inside the building.
cube([0,3,-9.7],[24,7,.5],0xf4dfb5);cube([-11.7,3,-1],[.5,7,17.5],0xf4dfb5);cube([11.7,3,-1],[.5,7,17.5],0xf4dfb5);
cube([0,3,9.7],[24,7,.5],0xf4dfb5);
// Roof with a slight overhang and decorative roof trim.
cube([0,6.7,0],[25.2,.6,21.2],0xd89b58);cube([0,7.15,0],[24.5,.25,20.5],0xf3c879);
// Windows on the inside-facing walls.
for(const x of[-8,-4,0,4,8]){cube([x,3.8,-9.42],[3.1,3.2,.08],0x8ed0dc);cube([x,3.8,-9.5],[.1,3.2,.12],0xffe2a0)}
for(const x of[-8,-4,0,4,8]){cube([x,3.8,9.42],[3.1,3.2,.08],0x8ed0dc);cube([x,3.8,9.5],[.1,3.2,.12],0xffe2a0)}
// Entrance door and reception.
cube([0,1.15,-6.9],[4.2,2.1,1.15],0xd18a4d);cube([0,2.3,-6.9],[4.5,.2,1.3],0xffd47b);cube([0,2.72,-6.95],[2.7,.5,.12],0x6b4029);sign('WELCOME',0,-7.52);
function table(x,z,booth=false){cube([x,1.25,z],[2.5,.18,1.45],booth?0xb87943:0xd39a59);cyl([x,.65,z],.17,1.2,0x70472e);for(const dx of[-1,1])for(const dz of[-.72,.72])cube([x+dx*1.05,.5,z+dz*.78],[.68,.8,.68],booth?0x9b5f3d:0xf0c47a)}
for(const p of[[-7,-2],[-2,-2],[3,-2],[8,-2],[-7,2],[-2,2],[3,2],[8,2]])table(...p);for(const p of[[-7,7],[0,7],[7,7]])table(...p,true);
// Kitchen.
cube([7,1.25,6],[7,2.3,2.8],0x7d8586);cube([7,2.55,6],[7.2,.2,2.9],0xf0c98b);for(const x of[4.8,6.4,8]){cyl([x,2.75,6],.38,.12,0x30363a,20);cyl([x,2.9,6],.14,.2,0xece6d6,16)}cube([7,4.25,6],[7,2.2,.25],0x9c653c);sign('KITCHEN',7,4.45);
function plant(x,z){cyl([x,.8,z],.3,1.6,0x9a633e);cyl([x,2,z],1.05,1.7,0x5b9b58);cyl([x,2.8,z],.65,1.1,0x78b967)}for(const p of[[-10,-8],[10,-8],[-10,8],[10,8]])plant(...p);
for(const x of[-8,-4,0,4,8]){cyl([x,5.2,-4.8],.07,1.4,0x59402c);cyl([x,4.45,-4.8],.38,.22,0xffd66f)}
// Player and strict indoor movement boundaries.
const player=new THREE.Group();player.position.set(0,0,5);scene.add(player);function part(g,p,c){const m=new THREE.Mesh(g,mat(c));m.position.set(...p);m.castShadow=true;player.add(m)}part(new THREE.CapsuleGeometry(.45,.85,6,12),[0,1.15,0],0x3978c9);part(new THREE.SphereGeometry(.42,16,12),[0,2.2,0],0xe8b58c);part(new THREE.SphereGeometry(.45,16,10),[0,2.42,0],0x34251d);
const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);let yaw=.65,distance=23,look=false,lx=0,ly=0;
renderer.domElement.onpointerdown=e=>{if(started){look=true;lx=e.clientX;ly=e.clientY}};renderer.domElement.onpointermove=e=>{if(look){yaw-=(e.clientX-lx)*.006;lx=e.clientX;ly=e.clientY}};renderer.domElement.onpointerup=()=>look=false;renderer.domElement.onpointercancel=()=>look=false;renderer.domElement.onwheel=e=>distance=THREE.MathUtils.clamp(distance+e.deltaY*.02,15,34);
function animate(){requestAnimationFrame(animate);const dt=.016;let r=(keys.d?1:0)-(keys.a?1:0)+(keys.arrowright?1:0)-(keys.arrowleft?1:0),f=(keys.w?1:0)-(keys.s?1:0)+(keys.arrowup?1:0)-(keys.arrowdown?1:0);if(started){const mx=r*Math.cos(yaw)-f*Math.sin(yaw),mz=-r*Math.sin(yaw)-f*Math.cos(yaw);player.position.x=THREE.MathUtils.clamp(player.position.x+mx*7*dt,-9.7,9.7);player.position.z=THREE.MathUtils.clamp(player.position.z+mz*7*dt,-8.8,8.8);if(r||f)player.rotation.y=Math.atan2(mx,mz)}const target=new THREE.Vector3(player.position.x,0,player.position.z);const h=distance*.72;camera.position.lerp(new THREE.Vector3(target.x+Math.sin(yaw)*h,target.y+distance*.95,target.z+Math.cos(yaw)*h),.12);camera.lookAt(target);camera.zoom=THREE.MathUtils.clamp(25/distance,.75,1.5);camera.updateProjectionMatrix();renderer.render(scene,camera)}animate();addEventListener('resize',()=>{const a=innerWidth/innerHeight;camera.left=-14*a;camera.right=14*a;camera.top=10;camera.bottom=-10;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});