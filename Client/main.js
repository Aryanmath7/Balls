import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';
import { GLTFLoader } from 'https://esm.sh/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';


import * as Lighting from './Lighting/lighting_helper.js';
import * as Camera from './Camera/camera-helper.js';

import * as DayTheme from './Themes/day.js';

import * as SkyboxLoader from './Visuals/v_load_skybox.js';
import * as PlatformLoader from './Visuals/v_load_platform.js';
import * as BallLoader from './Visuals/v_load_ball.js';

import * as Utils from './Utils/game_functions.js'
import * as Controls from './Utils/user_inputs.js'

import * as Client from './Client.js';

//#region Server Connection
await Client.connectToServer();
const room = Client.returnRoom();
//#endregion

//#region Scene, Camera, Renderer, Loader
const scene = new THREE.Scene();
const camera = Camera.initMainCamera(scene); // Initialize camera with target scene
SkyboxLoader.addSkyboxBackground(scene, DayTheme.LIGHT_SKYBOX_PATH); // Load skybox background

//#region Load the arena
let object;
const loader = new GLTFLoader();
//Load the file
loader.load('./Models/Stadium/scene.gltf', (gltfScene) => {
  gltfScene.scene.scale.set(12, 12, 12); // Increase scale to make stadium much bigger
  gltfScene.scene.position.y -= 3; // Move stadium lower on the Y axis
  scene.add(gltfScene.scene);
});

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

//#endregion

//#endregion

//#region Physics Callbacks

Client.onPlayerMoved((message) => {
  console.log(room);
  if (message.id == room.sessionId) {
    return;
  }
  else{
    vOpponentPaddle.position.set(-message.x, message.y , -message.z);
  }
});

Client.onMessage("update_ball_position", (message) => {
  // Update ball position based on server message
  vBall.position.set(message.x, message.y, message.z);
});


//#endregion

//#region visuals

//#region platform
const {
        vBase: vBase,
        vRightBarrier: vRightBarrier,
        vLeftBarrier: vLeftBarrier,
        vLeftPlayerBarrier: vLeftPlayerBarrier,
        vLeftOpponentBarrier: vLeftOpponentBarrier,
        vRightPlayerBarrier: vRightPlayerBarrier,
        vRightOpponentBarrier: vRightOpponentBarrier
    } = PlatformLoader.loadPlatform(scene, 10, 0.5, 15, 0.2, 0.5, 0xFFFFFF, 0xFFFFFF); // Load platform with specified dimensions
//#endregion

//#region Ball
const vBall = BallLoader.loadBall(scene); // Load ball with radius 0.5
//#endregion

//#endregion

//#region Visual of the player paddle
const vPlayerPaddle = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

vPlayerPaddle.position.set(0, vBase.geometry.parameters.depth, 0 + vBase.geometry.parameters.width / 2);
vPlayerPaddle.rotation.x = -Math.PI / 2;

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
vOpponentPaddle.rotation.x = -Math.PI / 2;

vOpponentPaddle.castShadow = true; // Cast shadows
vOpponentPaddle.receiveShadow = true; // Receive shadows
scene.add(vOpponentPaddle);
//#endregion

//#region Light initialization
//Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, DayTheme.LIGHT_DIRECTION);
Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, {x: 5, y: 15, z: 70 });
Lighting.initAmbientLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY);
//#endregion

// #region Animate
const fixedTimeStep = 1 / 60;
function animate() {
  requestAnimationFrame(animate);

  if (Controls.isDragging) {
    const delta = new CANNON.Vec3().copy(Controls.targetPosition).vsub(pPlayerPaddle.position);
    //pPlayerPaddle.velocity.set(delta.x * 10, 0, delta.z * 10);
    Client.sendPlayerMove(pPlayerPaddle.position);
  } else {
    //pPlayerPaddle.velocity.set(0, 0, 0);
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
//#endregion

animate();
