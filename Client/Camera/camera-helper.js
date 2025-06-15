import * as THREE from 'https://esm.sh/three';

export function initMainCamera(target) {
  const camera = new THREE.PerspectiveCamera(
    70, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 4, 12);
  camera.lookAt(target.position);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.lookAt(target.position);
  });

  return camera;
}