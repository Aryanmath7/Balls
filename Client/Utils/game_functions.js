

export function resetBall(pBall, vBall) {
  pBall.position.set(0, 5, 0); // drop it from a height to fall naturally
  pBall.velocity.set(0, 0, 0);
  pBall.angularVelocity.set(0, 0, 0);
  // Also update visual mesh
  vBall.position.copy(pBall.position);
  vBall.quaternion.copy(pBall.quaternion);
}