import * as CANNON from 'https://esm.sh/cannon-es';

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
