import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';

export let isDragging = false;
// Mouse Control Initialization
export const raycaster = new THREE.Raycaster();
export const mouse = new THREE.Vector2();
export let targetPosition = new CANNON.Vec3();
let paddleFixedY = 0;

export function initMouseControls(renderer, camera, vPlayerPaddle) {

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
            paddleFixedY = vPlayerPaddle.position.y;
            isDragging = true;
        }
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        updateMouse(event);
        raycaster.setFromCamera(mouse, camera);

        const platformPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -paddleFixedY);
        const intersection = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(platformPlane, intersection)) {
            targetPosition.set(intersection.x, paddleFixedY, intersection.z);
        }
    }

    function onMouseUp() {
        isDragging = false;
    }
}

