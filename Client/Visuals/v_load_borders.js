import * as THREE from 'https://esm.sh/three';

//default border height
const border_height = 0.4;

export function initBorder(scene, width, height, depth = border_height) {
    const vBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    scene.add(vBarrier);

    return vBarrier
}