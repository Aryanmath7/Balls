import * as THREE from 'https://esm.sh/three';

export function initBorder(scene, width, height, depth) {
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    scene.add(barrier);

    return barrier
}