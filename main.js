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
const {
        vBase: vBase,
        vRightBarrier: vRightBarrier,
        vLeftBarrier: vLeftBarrier,
        vLeftPlayerBarrier: vLeftPlayerBarrier,
        vLeftOpponentBarrier: vLeftOpponentBarrier,
        vRightPlayerBarrier: vRightPlayerBarrier,
        vRightOpponentBarrier: vRightOpponentBarrier
    } = PlatformLoader.loadPlatform(scene, 10, 0.5, 15); // Load platform with specified dimensions

const vBall = BallLoader.loadBall(scene); // Load ball with radius 0.5

const vPlayerPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

vPlayerPaddle.castShadow = true; // Cast shadows
vPlayerPaddle.receiveShadow = true; // Receive shadows
scene.add(vPlayerPaddle);

vPlayerPaddle.position.set(0, - vBase.geometry.parameters.height / 2 + vLeftPlayerBarrier.geometry.parameters.height / 2 + vPlayerPaddle.geometry.parameters.height + 0.1, vBase.geometry.parameters.depth / 2 + vLeftPlayerBarrier.geometry.parameters.depth / 2);

//Initialize lights
Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, DayTheme.LIGHT_DIRECTION);
Lighting.initAmbientLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY);


// physics bodies
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});


const cannonDebugger = CannonDebugger(scene, world);

const pBall = BallLoader.loadPhysicsBall(world, 0.25); // Load physics ball with radius 0.25
const pGroundBody = PlatformLoader.loadPhysicsPlatform(world, vBase, 10, 0.5, 15); // Load physics platform with specified dimensions

// friction
const platformMat = new CANNON.Material();
const ballMat = new CANNON.Material();

PlatformLoader.loadPhysicsBarrier(world, vLeftBarrier);
PlatformLoader.loadPhysicsBarrier(world, vRightBarrier);
PlatformLoader.loadPhysicsBarrier(world, vLeftPlayerBarrier);
PlatformLoader.loadPhysicsBarrier(world, vLeftOpponentBarrier);
PlatformLoader.loadPhysicsBarrier(world, vRightPlayerBarrier);
PlatformLoader.loadPhysicsBarrier(world, vRightOpponentBarrier);

const vPlayerPaddleShape = new CANNON.Box(new CANNON.Vec3(vPlayerPaddle.geometry.parameters.width / 2, vPlayerPaddle.geometry.parameters.height / 2, vPlayerPaddle.geometry.parameters.depth / 2));
const pPlayerPaddle = new CANNON.Body({
  shape: vPlayerPaddleShape,
  mass: 5,
  type: CANNON.Body.DYNAMIC,
  position: new CANNON.Vec3(
    0,
    vPlayerPaddle.geometry.parameters.height / 2 + 0.05,
    vBase.geometry.parameters.height / 2 ),
});

pPlayerPaddle.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
let targetPosition = new CANNON.Vec3();
const delta = new CANNON.Vec3().copy(targetPosition).vsub(pPlayerPaddle.position);
pPlayerPaddle.velocity.set(delta.x * 10, 0, delta.z * 10);
pPlayerPaddle.angularFactor.set(0, 0, 0); 
pPlayerPaddle.angularVelocity.set(0, 0, 0); 
pPlayerPaddle.linearFactor.set(1, 0, 1); 
world.addBody(pPlayerPaddle);

// Add contact material to enable friction
const pContactMat = new CANNON.ContactMaterial(platformMat, ballMat, {
  friction: 0.1,       // moderate surface friction
  restitution: 0.5     // bounciness
});
world.addContactMaterial(pContactMat);

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

  const intersects = raycaster.intersectObject(vPlayerPaddle);
  if (intersects.length > 0) {
    isDragging = true;
    dragOffset.copy(intersects[0].point).sub(vPlayerPaddle.position);
  }
}
function onMouseMove(event) {
  if (!isDragging) return;

  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);

  const planeY = vPlayerPaddle.position.y;
  const platformPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const intersection = new THREE.Vector3();

  if (raycaster.ray.intersectPlane(platformPlane, intersection)) {
    intersection.sub(dragOffset);
    targetPosition.set(intersection.x, vPlayerPaddle.position.y, intersection.z);
  }
}

function onMouseUp() {
  isDragging = false;
}

function resetBall(pBall, vBall) {
  pBall.position.set(0, 5, 0); // drop it from a height to fall naturally
  pBall.velocity.set(0, 0, 0);
  pBall.angularVelocity.set(0, 0, 0);
  // Also update visual mesh
  vBall.position.copy(pBall.position);
  vBall.quaternion.copy(pBall.quaternion);
}

// Animate
const fixedTimeStep = 1 / 60;
function clampBodyPositionToPlatform(body, halfSizeX, halfSizeZ) {
  const platformWidth = vBase.geometry.parameters.width;
  const platformDepth = vBase.geometry.parameters.height;

  const limitX = platformWidth / 2 - halfSizeX;
  const limitZ = platformDepth / 2 - halfSizeZ;

  body.position.x = Math.max(-limitX, Math.min(limitX, body.position.x));
  if (body.position.x > vLeftPlayerBarrier.position.x + vLeftPlayerBarrier.geometry.parameters.width / 2
    && body.position.x < vRightPlayerBarrier.position.x - vRightPlayerBarrier.geometry.parameters.width / 2) {
    return
  } else {
    body.position.z = Math.max(-limitZ, Math.min(limitZ, body.position.z));
  }
}
function animate() {
  requestAnimationFrame(animate);

  // Step the physics world
  world.step(fixedTimeStep);
  
  if (pBall.position.y < -3) {
    resetBall(pBall, vBall)
  }
  
  if (isDragging) {
    const delta = new CANNON.Vec3().copy(targetPosition).vsub(pPlayerPaddle.position);
    pPlayerPaddle.velocity.set(delta.x * 10, 0, delta.z * 10);
  } else {
    pPlayerPaddle.velocity.set(0, 0, 0);
  }
  clampBodyPositionToPlatform(pPlayerPaddle, 0.5, 0.25); // controller half size: width=1, depth=0.5
  clampBodyPositionToPlatform(pBall, 0.25, 0.25); 
  // Sync ball mesh with physics body
  vBall.position.copy(pBall.position);
  vBall.quaternion.copy(pBall.quaternion);

  vPlayerPaddle.position.copy(pPlayerPaddle.position);
  vPlayerPaddle.quaternion.copy(pPlayerPaddle.quaternion);
  // ServerCalls.updatePlayerPosition(vPlayerPaddle.position);


  // ServerCalls.onPlayerPositionUpdate(vPlayerPaddle.position.set.bind(vPlayerPaddle.position));

  cannonDebugger.update(); 

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
animate();
