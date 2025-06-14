import * as THREE from 'https://esm.sh/three';

const ballRadius = 0.25;

export function loadBall(scene, radius = ballRadius) {

    const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    ballMesh.castShadow = true; // Cast shadows
    ballMesh.receiveShadow = true; // Receive shadows
    scene.add(ballMesh);

    return ballMesh;
}