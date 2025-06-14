import * as THREE from 'https://esm.sh/three';
import * as Barrier from './load_borders.js';
import * as CANNON from 'https://esm.sh/cannon-es';

export function loadPlatform(scene, width = 7, height = 0.5, depth = 12, borderWidth = 0.1, borderHeight = 0.5) {

    const v_base = new THREE.Mesh(new THREE.BoxGeometry(width, depth, height), new THREE.MeshStandardMaterial({ color: 0x0000FF }));
    scene.add(v_base);
    v_base.castShadow = true; // Cast shadows
    v_base.receiveShadow = true; // Receive shadows

    // right barrier
    const v_right_barrier = Barrier.initBorder(scene, borderWidth, v_base.geometry.parameters.height, borderHeight)
    v_base.add(v_right_barrier);
    v_right_barrier.position.set(v_base.geometry.parameters.width / 2 - v_right_barrier.geometry.parameters.width / 2, 0, v_base.geometry.parameters.depth / 2 + v_right_barrier.geometry.parameters.depth / 2);
    v_right_barrier.castShadow = true; // Cast shadows
    v_right_barrier.receiveShadow = true; // Receive shadows

    // left barrier
    const v_left_barrier = Barrier.initBorder(scene, borderWidth, v_base.geometry.parameters.height, borderHeight)
    v_base.add(v_left_barrier);
    v_left_barrier.position.set(- v_base.geometry.parameters.width / 2 + v_left_barrier.geometry.parameters.width / 2, 0, v_base.geometry.parameters.depth / 2 + v_left_barrier.geometry.parameters.depth / 2);
    v_left_barrier.castShadow = true; // Cast shadows
    v_left_barrier.receiveShadow = true; // Receive shadows

    // player_barrier
    const player_barrier = Barrier.initBorder(scene, v_base.geometry.parameters.width, borderWidth, borderHeight)
    v_base.add(player_barrier); // Glue box to rectangle
    player_barrier.position.set(0, - v_base.geometry.parameters.height / 2 + player_barrier.geometry.parameters.height / 2, v_base.geometry.parameters.depth / 2 + player_barrier.geometry.parameters.depth / 2);
    player_barrier.castShadow = true; // Cast shadows
    player_barrier.receiveShadow = true; // Receive shadows

    // opponent_barrier
    const opponent_barrier = Barrier.initBorder(scene, v_base.geometry.parameters.width, borderWidth, borderHeight)
    v_base.add(opponent_barrier); // Glue box to rectangle
    opponent_barrier.position.set(0, v_base.geometry.parameters.height / 2 - opponent_barrier.geometry.parameters.height / 2, v_base.geometry.parameters.depth / 2 + opponent_barrier.geometry.parameters.depth / 2);
    opponent_barrier.castShadow = true; // Cast shadows
    opponent_barrier.receiveShadow = true; // Receive shadows

    return {
        base: v_base,
        rightBarrier: v_right_barrier,
        leftBarrier: v_left_barrier,
        playerBarrier: player_barrier,
        opponentBarrier: opponent_barrier
    };
}

export function loadPhysicsPlatform(world, v_base, width = 7, height = 0.5, depth = 12){
    const groundBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2)), // half extents
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(0, 0, 0),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Lay it flat
    world.addBody(groundBody);
    
    v_base.quaternion.copy(groundBody.quaternion);
    v_base.position.copy(groundBody.position);
    v_base.quaternion.copy(groundBody.quaternion);

    return groundBody;
}

export function loadPhysicsBarrier(world, v_barrier) {
    const barrierBody = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(v_barrier.geometry.parameters.width / 2, v_barrier.geometry.parameters.height / 2, v_barrier.geometry.parameters.depth / 2)), // half extents
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(v_barrier.position.x, v_barrier.position.z, v_barrier.position.y), // Adjust position to match the barrier
    });
    barrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
    world.addBody(barrierBody);

    return barrierBody;
}