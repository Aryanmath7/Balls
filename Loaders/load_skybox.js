import * as THREE from 'https://esm.sh/three';

export function addSkyboxBackground(scene, path) {
  const loader = new THREE.CubeTextureLoader();
  const skyboxTexture = loader.load([
    `${path}Right.bmp`,  // +X
    `${path}Left.bmp`,   // -X
    `${path}Top.bmp`,    // +Y
    `${path}Bottom.bmp`, // -Y
    `${path}Back.bmp`,   // +Z
    `${path}Front.bmp`,  // -Z
  ]);

  scene.background = skyboxTexture;
}