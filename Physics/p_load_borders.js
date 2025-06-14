import * as CANNON from 'https://esm.sh/cannon-es';

export function loadPhysicsBarrier(world, vBarrier) {
    const pBarrierBody = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(vBarrier.geometry.parameters.width / 2, vBarrier.geometry.parameters.height / 2, vBarrier.geometry.parameters.depth / 2)), // half extents
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(vBarrier.position.x, vBarrier.position.z, vBarrier.position.y), // Adjust position to match the barrier
    });
    pBarrierBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
    world.addBody(pBarrierBody);

    return pBarrierBody;
}
