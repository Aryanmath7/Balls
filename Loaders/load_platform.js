import * as THREE from 'https://esm.sh/three';
import * as Barrier from './load_borders.js';
import * as CANNON from 'https://esm.sh/cannon-es';

export function loadPlatform(scene, width = 7, height = 0.5, depth = 12, borderWidth = 0.1, borderHeight = 0.5) {

    const vBase = new THREE.Mesh(new THREE.BoxGeometry(width, depth, height), new THREE.MeshStandardMaterial({ color: 0x0000FF }));
    scene.add(vBase);
    vBase.castShadow = true; // Cast shadows
    vBase.receiveShadow = true; // Receive shadows

    // right barrier
    const vRightBarrier = Barrier.initBorder(scene, borderWidth, vBase.geometry.parameters.height, borderHeight)
    vBase.add(vRightBarrier);
    vRightBarrier.position.set(vBase.geometry.parameters.width / 2 - vRightBarrier.geometry.parameters.width / 2, 0, vBase.geometry.parameters.depth / 2 + vRightBarrier.geometry.parameters.depth / 2);
    vRightBarrier.castShadow = true; // Cast shadows
    vRightBarrier.receiveShadow = true; // Receive shadows

    // left barrier
    const vLeftBarrier = Barrier.initBorder(scene, borderWidth, vBase.geometry.parameters.height, borderHeight)
    vBase.add(vLeftBarrier);
    vLeftBarrier.position.set(- vBase.geometry.parameters.width / 2 + vLeftBarrier.geometry.parameters.width / 2, 0, vBase.geometry.parameters.depth / 2 + vLeftBarrier.geometry.parameters.depth / 2);
    vLeftBarrier.castShadow = true; // Cast shadows
    vLeftBarrier.receiveShadow = true; // Receive shadows

    // player_barrier
    const vLeftPlayerBarrier = Barrier.initBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight)
    vBase.add(vLeftPlayerBarrier); // Glue box to rectangle
    vLeftPlayerBarrier.position.set(vLeftBarrier.position.x + vLeftPlayerBarrier.geometry.parameters.width / 2, - vBase.geometry.parameters.height / 2 + vLeftPlayerBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vLeftPlayerBarrier.geometry.parameters.depth / 2);
    vLeftPlayerBarrier.castShadow = true; // Cast shadows
    vLeftPlayerBarrier.receiveShadow = true; // Receive shadows

    // opponent_barrier
    const vLeftOpponentBarrier = Barrier.initBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight)
    vBase.add(vLeftOpponentBarrier); // Glue box to rectangle
    vLeftOpponentBarrier.position.set(vLeftBarrier.position.x + vLeftOpponentBarrier.geometry.parameters.width / 2, vBase.geometry.parameters.height / 2 - vLeftOpponentBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vLeftOpponentBarrier.geometry.parameters.depth / 2);
    vLeftOpponentBarrier.castShadow = true; // Cast shadows
    vLeftOpponentBarrier.receiveShadow = true; // Receive shadows

    // player_barrier
    const vRightPlayerBarrier = Barrier.initBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight)
    vBase.add(vRightPlayerBarrier); // Glue box to rectangle
    vRightPlayerBarrier.position.set(vRightBarrier.position.x - vRightPlayerBarrier.geometry.parameters.width / 2, - vBase.geometry.parameters.height / 2 + vRightPlayerBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vRightPlayerBarrier.geometry.parameters.depth / 2);
    vRightPlayerBarrier.castShadow = true; // Cast shadows
    vRightPlayerBarrier.receiveShadow = true; // Receive shadows

    // opponent_barrier
    const vRightOpponentBarrier = Barrier.initBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight)
    vBase.add(vRightOpponentBarrier); // Glue box to rectangle
    vRightOpponentBarrier.position.set(vRightBarrier.position.x - vRightOpponentBarrier.geometry.parameters.width / 2, vBase.geometry.parameters.height / 2 - vRightOpponentBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vRightOpponentBarrier.geometry.parameters.depth / 2);
    vRightOpponentBarrier.castShadow = true; // Cast shadows
    vRightOpponentBarrier.receiveShadow = true; // Receive shadows

    return {
        vBase: vBase,
        vRightBarrier: vRightBarrier,
        vLeftBarrier: vLeftBarrier,
        vLeftPlayerBarrier: vLeftPlayerBarrier,
        vLeftOpponentBarrier: vLeftOpponentBarrier,
        vRightPlayerBarrier: vRightPlayerBarrier,
        vRightOpponentBarrier: vRightOpponentBarrier
    };
}

export function loadPhysicsPlatform(world, vBase, width = 7, height = 0.5, depth = 12){
    const pGroundBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2)), // half extents
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(0, 0, 0),
    });
    pGroundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Lay it flat
    world.addBody(pGroundBody);
    
    vBase.quaternion.copy(pGroundBody.quaternion);
    vBase.position.copy(pGroundBody.position);
    vBase.quaternion.copy(pGroundBody.quaternion);

    return pGroundBody;
}

export function loadPhysicsBarrier(world, v_barrier) {
    const pBarrierBody = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(v_barrier.geometry.parameters.width / 2, v_barrier.geometry.parameters.height / 2, v_barrier.geometry.parameters.depth / 2)), // half extents
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(v_barrier.position.x, v_barrier.position.z, v_barrier.position.y), // Adjust position to match the barrier
    });
    pBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
    world.addBody(pBarrierBody);

    return pBarrierBody;
}