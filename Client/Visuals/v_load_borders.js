import * as THREE from 'https://esm.sh/three';

//default border height
const border_height = 0.4;

export function loadBorder(scene, width, height, depth = border_height, color = 0x0000FF) {
    const vBarrier = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: color})
    );
    scene.add(vBarrier);

    return vBarrier
}