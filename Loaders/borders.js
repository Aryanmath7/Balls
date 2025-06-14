import * as THREE from 'https://esm.sh/three';

const border_height = 0.4;

export function initBorder(scene, width, height, depth = border_height) {
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    scene.add(barrier);

    return barrier
}