import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";

export class Explosive {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  radius: number;
  strength: number;
  exploded = false;

  constructor(scene: THREE.Scene, position: THREE.Vector3, radius = 5, strength = 200) {
    this.radius = radius;
    this.strength = strength;

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.3)
    });
    this.body.position.set(position.x, position.y, position.z);
    physics.addBody(this.body);
  }

  explode(scene: THREE.Scene) {
    if (this.exploded) return;
    this.exploded = true;

    physics.applyExplosionForce(
      new CANNON.Vec3(
        this.body.position.x,
        this.body.position.y,
        this.body.position.z
      ),
      this.radius,
      this.strength
    );

    const flash = new THREE.PointLight(0xffaa00, 10, 40);
    flash.position.copy(this.mesh.position);
    scene.add(flash);

    setTimeout(() => scene.remove(flash), 300);

    scene.remove(this.mesh);
    physics.removeBody(this.body);
  }

  update() {
    this.mesh.position.copy(this.body.position as any);
  }
}
