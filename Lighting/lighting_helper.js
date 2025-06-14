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
    
    scene.add(directionalLight);
    return directionalLight;
}
