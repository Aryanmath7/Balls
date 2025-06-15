import * as THREE from 'https://esm.sh/three';
import * as Barrier from './v_load_borders.js';

export function loadPlatform(scene, width = 7, height = 0.5, depth = 12, borderWidth = 0.1, borderHeight = 0.5, platformColor, borderColor) {

    const vBase = new THREE.Mesh(new THREE.BoxGeometry(width, depth, height), new THREE.MeshStandardMaterial({ color: platformColor}));
    vBase.rotation.x = -Math.PI / 2;
    scene.add(vBase);
    vBase.castShadow = true; // Cast shadows
    vBase.receiveShadow = true; // Receive shadows

    // right barrier
    const vRightBarrier = Barrier.loadBorder(scene, borderWidth, vBase.geometry.parameters.height, borderHeight, borderColor)
    vBase.add(vRightBarrier);
    vRightBarrier.position.set(vBase.geometry.parameters.width / 2 - vRightBarrier.geometry.parameters.width / 2, 0, vBase.geometry.parameters.depth / 2 + vRightBarrier.geometry.parameters.depth / 2);
    vRightBarrier.castShadow = true; // Cast shadows
    vRightBarrier.receiveShadow = true; // Receive shadows

    // left barrier
    const vLeftBarrier = Barrier.loadBorder(scene, borderWidth, vBase.geometry.parameters.height, borderHeight, borderColor)
    vBase.add(vLeftBarrier);
    vLeftBarrier.position.set(- vBase.geometry.parameters.width / 2 + vLeftBarrier.geometry.parameters.width / 2, 0, vBase.geometry.parameters.depth / 2 + vLeftBarrier.geometry.parameters.depth / 2);
    vLeftBarrier.castShadow = true; // Cast shadows
    vLeftBarrier.receiveShadow = true; // Receive shadows

    // player_barrier
    const vLeftPlayerBarrier = Barrier.loadBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight, borderColor)
    vBase.add(vLeftPlayerBarrier); // Glue box to rectangle
    vLeftPlayerBarrier.position.set(vLeftBarrier.position.x + vLeftPlayerBarrier.geometry.parameters.width / 2, - vBase.geometry.parameters.height / 2 + vLeftPlayerBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vLeftPlayerBarrier.geometry.parameters.depth / 2);
    vLeftPlayerBarrier.castShadow = true; // Cast shadows
    vLeftPlayerBarrier.receiveShadow = true; // Receive shadows

    // opponent_barrier
    const vLeftOpponentBarrier = Barrier.loadBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight, borderColor)
    vBase.add(vLeftOpponentBarrier); // Glue box to rectangle
    vLeftOpponentBarrier.position.set(vLeftBarrier.position.x + vLeftOpponentBarrier.geometry.parameters.width / 2, vBase.geometry.parameters.height / 2 - vLeftOpponentBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vLeftOpponentBarrier.geometry.parameters.depth / 2);
    vLeftOpponentBarrier.castShadow = true; // Cast shadows
    vLeftOpponentBarrier.receiveShadow = true; // Receive shadows

    // player_barrier
    const vRightPlayerBarrier = Barrier.loadBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight, borderColor)
    vBase.add(vRightPlayerBarrier); // Glue box to rectangle
    vRightPlayerBarrier.position.set(vRightBarrier.position.x - vRightPlayerBarrier.geometry.parameters.width / 2, - vBase.geometry.parameters.height / 2 + vRightPlayerBarrier.geometry.parameters.height / 2, vBase.geometry.parameters.depth / 2 + vRightPlayerBarrier.geometry.parameters.depth / 2);
    vRightPlayerBarrier.castShadow = true; // Cast shadows
    vRightPlayerBarrier.receiveShadow = true; // Receive shadows

    // opponent_barrier
    const vRightOpponentBarrier = Barrier.loadBorder(scene, vBase.geometry.parameters.width / 3, borderWidth, borderHeight, borderColor)
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

