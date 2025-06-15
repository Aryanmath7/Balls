import * as THREE from 'https://esm.sh/three';

export function initAmbientLight(scene, color = 0xffffff, intensity = 0.4) {
    const ambientLight = new THREE.AmbientLight(color, intensity);
    scene.add(ambientLight);
    return ambientLight;
}

export function initDirectionalLight(scene, color = 0xffffff, intensity = 0.8, position = { x: 5, y: 10, z: 7 }) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(position.x, position.y, position.z);

    // Enable shadows
    directionalLight.castShadow = true;

    // Set the shadow map resolution (higher values = sharper shadows, more GPU usage)
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    // Configure the shadow camera's viewing frustum (area where shadows are rendered)
    directionalLight.shadow.camera.left = -30;   // Left edge of the shadow camera
    directionalLight.shadow.camera.right = 30;   // Right edge of the shadow camera
    directionalLight.shadow.camera.top = 30;     // Top edge of the shadow camera
    directionalLight.shadow.camera.bottom = -30; // Bottom edge of the shadow camera

    // Set the near and far clipping planes for the shadow camera
    directionalLight.shadow.camera.near = 0.5;   // Minimum distance from the light to render shadows
    directionalLight.shadow.camera.far = 100;    // Maximum distance from the light to render shadows
    
    scene.add(directionalLight);
    return directionalLight;
}
