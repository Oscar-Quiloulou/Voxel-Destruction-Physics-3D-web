import * as CANNON from "cannon-es";

export class PhysicsEngine {
  world: CANNON.World;
  fixedTimeStep = 1 / 60;
  maxSubSteps = 5;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });

    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
  }

  addBody(body: CANNON.Body) {
    this.world.addBody(body);
  }

  removeBody(body: CANNON.Body) {
    this.world.removeBody(body);
  }

  step(delta: number) {
    this.world.step(this.fixedTimeStep, delta, this.maxSubSteps);
  }

  createBoxBody(size: [number, number, number], mass: number, position: CANNON.Vec3) {
    const shape = new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2));
    const body = new CANNON.Body({ mass, shape });
    body.position.copy(position);
    return body;
  }

  createSphereBody(radius: number, mass: number, position: CANNON.Vec3) {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({ mass, shape });
    body.position.copy(position);
    return body;
  }

  applyExplosionForce(center: CANNON.Vec3, radius: number, strength: number) {
    this.world.bodies.forEach(body => {
      const dir = body.position.vsub(center);
      const dist = dir.length();

      if (dist < radius) {
        const force = dir.normalize().scale((1 - dist / radius) * strength);
        body.applyImpulse(force, body.position);
      }
    });
  }
}

export const physics = new PhysicsEngine();
