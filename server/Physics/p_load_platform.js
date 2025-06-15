import * as CANNON from "../node_modules/cannon-es/dist/cannon-es.cjs.js";
import CannonDebugger from "../node_modules/cannon-es-debugger/dist/cannon-es-debugger.cjs.js";


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



