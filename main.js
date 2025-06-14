import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';
import CannonDebugger from 'https://esm.sh/cannon-es-debugger';

import * as Lighting from './Lighting/lighting_helper.js';
import * as Camera from './Camera/camera-helper.js';
import * as DayTheme from './Themes/day.js';
import * as SkyboxLoader from './Loaders/load_skybox.js';
import * as PlatformLoader from './Loaders/load_platform.js';
import * as BallLoader from './Loaders/load_ball.js';
import * as ServerCalls from './Server/server_calls.js'

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = Camera.initMainCamera(scene); // Initialize camera with target scene
SkyboxLoader.addSkyboxBackground(scene, DayTheme.LIGHT_SKYBOX_PATH); // Load skybox background

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Mouse Control Initialization
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let dragOffset = new THREE.Vector3();

// visuals

// platform
const { base: v_base, rightBarrier: v_right_barrier, leftBarrier: v_left_barrier, playerBarrier: player_barrier, opponentBarrier: opponent_barrier } = PlatformLoader.loadPlatform(scene, 10, 0.5, 15); // Load platform with specified dimensions

const ballMesh = BallLoader.loadBall(scene); // Load ball with radius 0.5

const player_controller = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

player_controller.castShadow = true; // Cast shadows
player_controller.receiveShadow = true; // Receive shadows
scene.add(player_controller);

player_controller.position.set(0, - v_base.geometry.parameters.height / 2 + player_barrier.geometry.parameters.height / 2 + player_controller.geometry.parameters.height + 0.1, v_base.geometry.parameters.depth / 2 + player_barrier.geometry.parameters.depth / 2);

//Initialize lights
Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, DayTheme.LIGHT_DIRECTION);
Lighting.initAmbientLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY);


// physics bodies
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});
const cannonDebugger = CannonDebugger(scene, world);

const ballBody = BallLoader.loadPhysicsBall(world, 0.25); // Load physics ball with radius 0.25
const groundBody = PlatformLoader.loadPhysicsPlatform(world, v_base, 10, 0.5, 15); // Load physics platform with specified dimensions

// friction
const platformMat = new CANNON.Material();
const ballMat = new CANNON.Material();

PlatformLoader.loadPhysicsBarrier(world, v_left_barrier);
PlatformLoader.loadPhysicsBarrier(world, v_right_barrier);
PlatformLoader.loadPhysicsBarrier(world, player_barrier);
PlatformLoader.loadPhysicsBarrier(world, opponent_barrier);

const playerControllerShape = new CANNON.Box(new CANNON.Vec3(player_controller.geometry.parameters.width / 2, player_controller.geometry.parameters.height / 2, player_controller.geometry.parameters.depth / 2));
const playerControllerBody = new CANNON.Body({
  shape: playerControllerShape,
  mass: 5,
  type: CANNON.Body.DYNAMIC,
  position: new CANNON.Vec3(
    0,
    v_base.geometry.parameters.depth / 2 + player_controller.geometry.parameters.depth / 2,
    v_base.geometry.parameters.height / 2 - player_controller.geometry.parameters.height / 2 - 0.5
  ),
});

playerControllerBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(playerControllerBody);
let targetPosition = new CANNON.Vec3();
const delta = new CANNON.Vec3().copy(targetPosition).vsub(playerControllerBody.position);
playerControllerBody.velocity.set(delta.x * 10, 0, delta.z * 10);
playerControllerBody.angularFactor.set(0, 0, 0); 
playerControllerBody.angularVelocity.set(0, 0, 0); 
playerControllerBody.linearFactor.set(1, 0, 1); 

// Add contact material to enable friction
const contactMat = new CANNON.ContactMaterial(platformMat, ballMat, {
  friction: 0.4,       // moderate surface friction
  restitution: 0.5     // bounciness
});
world.addContactMaterial(contactMat);

// user inputs

renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

// move player box
function updateMouse(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseDown(event) {
  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(player_controller);
  if (intersects.length > 0) {
    isDragging = true;
    dragOffset.copy(intersects[0].point).sub(player_controller.position);
  }
}
function onMouseMove(event) {
  if (!isDragging) return;

  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);

  const planeY = player_controller.position.y;
  const platformPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const intersection = new THREE.Vector3();

  if (raycaster.ray.intersectPlane(platformPlane, intersection)) {
    intersection.sub(dragOffset);
    targetPosition.set(intersection.x, player_controller.position.y, intersection.z);
  }
}

function onMouseUp() {
  isDragging = false;
}

// Animate
const fixedTimeStep = 1 / 60;

function animate() {
  requestAnimationFrame(animate);

  // Step the physics world
  world.step(fixedTimeStep);

  if (isDragging) {
    const delta = new CANNON.Vec3().copy(targetPosition).vsub(playerControllerBody.position);
    playerControllerBody.velocity.set(delta.x * 10, 0, delta.z * 10);
  } else {
    playerControllerBody.velocity.set(0, 0, 0);
  }

  // Sync ball mesh with physics body
  ballMesh.position.copy(ballBody.position);
  ballMesh.quaternion.copy(ballBody.quaternion);

  player_controller.position.copy(playerControllerBody.position);
  player_controller.quaternion.copy(playerControllerBody.quaternion);

  ServerCalls.updatePlayerPosition(player_controller.position);

  cannonDebugger.update(); 

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
animate();
setTimeout(() => {
  ballBody.velocity.set(-5, 0, 5);
}, 5000);
