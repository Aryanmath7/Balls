import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';
import CannonDebugger from 'https://esm.sh/cannon-es-debugger';

import * as Lighting from './Lighting/lighting_helper.js';
import * as Camera from './Camera/camera-helper.js';

import * as DayTheme from './Themes/day.js';

import * as SkyboxLoader from './Visuals/v_load_skybox.js';
import * as PlatformLoader from './Visuals/v_load_platform.js';
import * as BallLoader from './Visuals/v_load_ball.js';

import * as PhysicsLoader from './Physics/p_load_platform.js'
import * as BallPhysicsLoader from './Physics/p_load_ball.js'
import * as BarrierPhysicsLoader from './Physics/p_load_borders.js'

import * as Utils from './Utils/game_functions.js'
import * as Controls from './Utils/user_inputs.js'

import * as Client from './Client/Client.js';

//Connect to the server
await Client.connectToServer();

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = Camera.initMainCamera(scene); // Initialize camera with target scene
SkyboxLoader.addSkyboxBackground(scene, DayTheme.LIGHT_SKYBOX_PATH); // Load skybox background

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

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


//#region Visual of the player paddle
const vPlayerPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

vPlayerPaddle.castShadow = true; // Cast shadows
vPlayerPaddle.receiveShadow = true; // Receive shadows
scene.add(vPlayerPaddle);

//#endregion

//#region Visual of the opponent paddle
const vOpponentPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);

vOpponentPaddle.position.set(0, vBase.geometry.parameters.depth, 0 - vBase.geometry.parameters.width / 2);

// Set rotation (for example, rotate -90 degrees around X axis) 
// Laxman could not figure out how to rotate the paddle, so now our entire world is rotated instead
vOpponentPaddle.rotation.x = -Math.PI / 2;

vOpponentPaddle.castShadow = true; // Cast shadows
vOpponentPaddle.receiveShadow = true; // Receive shadows
scene.add(vOpponentPaddle);
//#endregion

//#region Light initialization
//Initialize lights
Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, DayTheme.LIGHT_DIRECTION);
Lighting.initAmbientLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY);
//#endregion


// physics bodies
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});


const cannonDebugger = CannonDebugger(scene, world);

const pBall = BallPhysicsLoader.loadPhysicsBall(world, 0.25); // Load physics ball with radius 0.25
const pGroundBody = PhysicsLoader.loadPhysicsPlatform(world, vBase, 10, 0.5, 15); // Load physics platform with specified dimensions

// friction
const platformMat = new CANNON.Material();
const ballMat = new CANNON.Material();

BarrierPhysicsLoader.loadPhysicsBarrier(world, vLeftBarrier);
BarrierPhysicsLoader.loadPhysicsBarrier(world, vRightBarrier);
BarrierPhysicsLoader.loadPhysicsBarrier(world, vLeftPlayerBarrier);
BarrierPhysicsLoader.loadPhysicsBarrier(world, vLeftOpponentBarrier);
BarrierPhysicsLoader.loadPhysicsBarrier(world, vRightPlayerBarrier);
BarrierPhysicsLoader.loadPhysicsBarrier(world, vRightOpponentBarrier);

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
// user inputs
let delta = Controls.initMouseControls(renderer, camera, vPlayerPaddle, pPlayerPaddle)

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
    Utils.resetBall(pBall, vBall)
  }
  
  if (Controls.isDragging) {
    const delta = new CANNON.Vec3().copy(Controls.targetPosition).vsub(pPlayerPaddle.position);
    pPlayerPaddle.velocity.set(delta.x * 10, 0, delta.z * 10);
    Client.sendPlayerMove(pPlayerPaddle.position);
  } else {
    pPlayerPaddle.velocity.set(0, 0, 0);
  }

  Client.onPlayerMoved((message) => {
    // message should contain the opponent's paddle position: { x, y, z }
    if (message && typeof message.x === "number" && typeof message.y === "number" && typeof message.z === "number") {
      vOpponentPaddle.position.set(message.x + vBase.geometry.parameters.depth / 2, message.y , message.z - vBase.geometry.parameters.height / 2);
    }
  });

  clampBodyPositionToPlatform(pPlayerPaddle, 0.5, 0.25); // controller half size: width=1, depth=0.5
  clampBodyPositionToPlatform(pBall, 0.25, 0.25); 
  // Sync ball mesh with physics body
  vBall.position.copy(pBall.position);
  vBall.quaternion.copy(pBall.quaternion);

  vPlayerPaddle.position.copy(pPlayerPaddle.position);
  vPlayerPaddle.quaternion.copy(pPlayerPaddle.quaternion);

  cannonDebugger.update(); 

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
animate();
