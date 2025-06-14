import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';
import CannonDebugger from 'https://esm.sh/cannon-es-debugger';

import * as Lighting from './Lighting/lighting_helper.js';
import * as Camera from './Camera/camera-helper.js';
import * as DayTheme from './Themes/day.js';
import * as SkyboxLoader from './Loaders/load_skybox.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = Camera.initMainCamera(scene); // Initialize camera with target scene
SkyboxLoader.addSkyboxBackground(scene, DayTheme.LIGHT_SKYBOX_PATH); // Load skybox background

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Mouse Control Initialization
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let dragOffset = new THREE.Vector3();




// visuals



// physics bodies




// user inputs




// animate







renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

// physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(7 / 2, 12 / 2, 0.5 / 2)), // half extents
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(0, 0, 0),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Lay it flat
world.addBody(groundBody);

const cannonDebugger = CannonDebugger(scene, world);

// Geometry + Material (responsive to light)
const geometry = new THREE.BoxGeometry(7, 12, 0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x0000FF });
// platform
const base = new THREE.Mesh(geometry, material);
base.position.copy(groundBody.position);
base.quaternion.copy(groundBody.quaternion);
scene.add(base);

// right barrier
const border_height = 0.4; // How tall the box is
const right_barrier = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, base.geometry.parameters.height, border_height),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(right_barrier);

base.add(right_barrier); // Glue box to rectangle
right_barrier.position.set(base.geometry.parameters.width / 2 - right_barrier.geometry.parameters.width / 2, 0, base.geometry.parameters.depth / 2 + right_barrier.geometry.parameters.depth / 2);

// left barrier
const left_barrier = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, base.geometry.parameters.height, border_height),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(left_barrier);

base.add(left_barrier); // Glue box to rectangle
left_barrier.position.set(- base.geometry.parameters.width / 2 + left_barrier.geometry.parameters.width / 2, 0, base.geometry.parameters.depth / 2 + left_barrier.geometry.parameters.depth / 2);


// player_barrier
const player_barrier = new THREE.Mesh(
  new THREE.BoxGeometry(base.geometry.parameters.width, 0.1, border_height),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(player_barrier);

base.add(player_barrier); // Glue box to rectangle
player_barrier.position.set(0, - base.geometry.parameters.height / 2 + player_barrier.geometry.parameters.height / 2, base.geometry.parameters.depth / 2 + player_barrier.geometry.parameters.depth / 2);

// opponent_barrier
const opponent_barrier = new THREE.Mesh(
  new THREE.BoxGeometry(base.geometry.parameters.width, 0.1, border_height),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(opponent_barrier);
base.add(opponent_barrier); // Glue box to rectangle
opponent_barrier.position.set(0, base.geometry.parameters.height / 2 - opponent_barrier.geometry.parameters.height / 2, base.geometry.parameters.depth / 2 + opponent_barrier.geometry.parameters.depth / 2);

const ballRadius = 0.25;
const ballBody = new CANNON.Body({
  mass: 1, // dynamic
  shape: new CANNON.Sphere(ballRadius),
  position: new CANNON.Vec3(0, 5, 0), // start high
  material: new CANNON.Material()
});
world.addBody(ballBody);

const ballMesh = new THREE.Mesh(
  new THREE.SphereGeometry(ballRadius, 8, 8),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(ballMesh);

const player_controller = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);

scene.add(player_controller);

player_controller.position.set(0, - base.geometry.parameters.height / 2 + player_barrier.geometry.parameters.height / 2 + player_controller.geometry.parameters.height + 0.1, base.geometry.parameters.depth / 2 + player_barrier.geometry.parameters.depth / 2);

//Initialize lights
Lighting.initDirectionalLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY, DayTheme.LIGHT_DIRECTION);
Lighting.initAmbientLight(scene, DayTheme.LIGHT_COLOR, DayTheme.LIGHT_INTENSITY);

// friction
const platformMat = new CANNON.Material();
const ballMat = new CANNON.Material();

groundBody.material = platformMat;
ballBody.material = ballMat;

// physics shit
const leftBarrierShape = new CANNON.Box(new CANNON.Vec3(left_barrier.geometry.parameters.width / 2, left_barrier.geometry.parameters.height / 2, left_barrier.geometry.parameters.depth / 2));
const leftBarrierBody = new CANNON.Body({
  shape: leftBarrierShape,
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(
    -base.geometry.parameters.width / 2 + left_barrier.geometry.parameters.width / 2,
    base.geometry.parameters.depth / 2 + left_barrier.geometry.parameters.depth / 2,
    0
  ),
});
leftBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
world.addBody(leftBarrierBody);


const rightBarrierShape = new CANNON.Box(new CANNON.Vec3(right_barrier.geometry.parameters.width / 2, right_barrier.geometry.parameters.height / 2, right_barrier.geometry.parameters.depth / 2));
const rightBarrierBody = new CANNON.Body({
  shape: rightBarrierShape,
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(
    base.geometry.parameters.width / 2 - right_barrier.geometry.parameters.width / 2,
    base.geometry.parameters.depth / 2 + right_barrier.geometry.parameters.depth / 2,
    0
  ),
});
rightBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
world.addBody(rightBarrierBody);

const playerBarrierShape = new CANNON.Box(new CANNON.Vec3(player_barrier.geometry.parameters.width / 2, player_barrier.geometry.parameters.height / 2, player_barrier.geometry.parameters.depth / 2));
const playerBarrierBody = new CANNON.Body({
  shape: playerBarrierShape,
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(
    0,
    base.geometry.parameters.depth / 2 + player_barrier.geometry.parameters.depth / 2,
    base.geometry.parameters.height / 2 - player_barrier.geometry.parameters.height / 2
  ),
});
playerBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
world.addBody(playerBarrierBody);

const opponentBarrierShape = new CANNON.Box(new CANNON.Vec3(opponent_barrier.geometry.parameters.width / 2, opponent_barrier.geometry.parameters.height / 2, opponent_barrier.geometry.parameters.depth / 2));
const opponentBarrierBody = new CANNON.Body({
  shape: opponentBarrierShape,
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(
    0,
    base.geometry.parameters.depth / 2 + opponent_barrier.geometry.parameters.depth / 2,
    -base.geometry.parameters.height / 2 + opponent_barrier.geometry.parameters.height / 2
  ),
});
opponentBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
world.addBody(opponentBarrierBody);

const playerControllerShape = new CANNON.Box(new CANNON.Vec3(player_controller.geometry.parameters.width / 2, player_controller.geometry.parameters.height / 2, player_controller.geometry.parameters.depth / 2));
const playerControllerBody = new CANNON.Body({
  shape: playerControllerShape,
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(
    0,
    base.geometry.parameters.depth / 2 + player_controller.geometry.parameters.depth / 2,
    base.geometry.parameters.height / 2 - player_controller.geometry.parameters.height / 2 - 0.5
  ),
});
playerControllerBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(playerControllerBody);

// Add contact material to enable friction
const contactMat = new CANNON.ContactMaterial(platformMat, ballMat, {
  friction: 0.4,       // moderate surface friction
  restitution: 0.5     // bounciness
});
world.addContactMaterial(contactMat);

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

  // Project onto the flat plane of the platform (Y is up)
  const planeY = player_controller.position.y;
  const platformPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const intersection = new THREE.Vector3();

  if (raycaster.ray.intersectPlane(platformPlane, intersection)) {
    const newPos = intersection.sub(dragOffset);

    // Optional: clamp movement within platform bounds
    newPos.x = THREE.MathUtils.clamp(newPos.x, -3, 3);
    newPos.z = THREE.MathUtils.clamp(newPos.z, -5.5, 5.5);

    // Set position of Cannon body (which syncs to mesh)
    playerControllerBody.position.set(newPos.x, player_controller.position.y, newPos.z);
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

  // Sync ball mesh with physics body
  ballMesh.position.copy(ballBody.position);
  ballMesh.quaternion.copy(ballBody.quaternion);

  player_controller.position.copy(playerControllerBody.position);
  player_controller.quaternion.copy(playerControllerBody.quaternion);

  //cannonDebugger.update(); 

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
animate();
setTimeout(() => {
  ballBody.velocity.set(-5, 0, 5);
}, 5000);
