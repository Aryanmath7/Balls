import * as THREE from 'https://esm.sh/three';
import * as CANNON from 'https://esm.sh/cannon-es';

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

export function loadPhysicsBall(world, radius = ballRadius) {
    const ballBody = new CANNON.Body({
        mass: 1, // dynamic
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(0, 5, 0), // start high
        material: new CANNON.Material()
    });
    ballBody.allowSleep = false;
    world.addBody(ballBody);

    return ballBody;
}