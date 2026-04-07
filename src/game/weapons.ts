import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";
import { Explosive } from "./explosives";

export class WeaponBase {
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
}

export class ImpulseGun extends WeaponBase {
  fire(origin: THREE.Vector3, direction: THREE.Vector3, strength = 50) {
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.2)
    });

    body.position.set(origin.x, origin.y, origin.z);
    body.velocity.set(
      direction.x * strength,
      direction.y * strength,
      direction.z * strength
    );

    physics.addBody(body);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2),
      new THREE.MeshStandardMaterial({ color: 0x00ffff })
    );
    mesh.position.copy(origin);
    this.scene.add(mesh);

    const update = () => {
      mesh.position.copy(body.position as any);
      if (body.position.length() > 500) {
        this.scene.remove(mesh);
        physics.removeBody(body);
      } else {
        requestAnimationFrame(update);
      }
    };
    update();
  }
}

export class KineticHammer extends WeaponBase {
  smash(position: THREE.Vector3, radius = 4, force = 150) {
    physics.applyExplosionForce(
      new CANNON.Vec3(position.x, position.y, position.z),
      radius,
      force
    );

    const flash = new THREE.PointLight(0xffffff, 4, 10);
    flash.position.copy(position);
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 150);
  }
}

export class CapsuleLauncher extends WeaponBase {
  fire(position: THREE.Vector3, direction: THREE.Vector3) {
    const explosive = new Explosive(
      this.scene,
      position.clone().add(direction.clone().multiplyScalar(1.5)),
      5,
      200
    );

    explosive.body.velocity.set(
      direction.x * 20,
      direction.y * 20,
      direction.z * 20
    );

    return explosive;
  }
}
