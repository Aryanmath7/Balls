import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';

export let isDragging = false;
// Mouse Control Initialization
export const raycaster = new THREE.Raycaster();
export const mouse = new THREE.Vector2();
export let dragOffset = new THREE.Vector3();
export let targetPosition = new CANNON.Vec3();


export function initMouseControls(renderer, camera, vPlayerPaddle, pPlayerPaddle) {
    const delta = new CANNON.Vec3().copy(targetPosition).vsub(pPlayerPaddle.position);

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
    return delta
}

