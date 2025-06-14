import * as CANNON from 'https://esm.sh/cannon-es';


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



