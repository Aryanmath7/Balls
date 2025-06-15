import * as CANNON from "../node_modules/cannon-es/dist/cannon-es.cjs.js";
import CannonDebugger from "../node_modules/cannon-es-debugger/dist/cannon-es-debugger.cjs.js";

export function loadPhysicsBall(world, radius = ballRadius) {
    const ballBody = new CANNON.Body({
        mass: 1, // dynamic
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(0, 5, 0), // start high
        material: new CANNON.Material()
    });
    ballBody.allowSleep = false;
    world.addBody(ballBody);

    return ballBody;
}
