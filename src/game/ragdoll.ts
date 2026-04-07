import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";

export class Ragdoll {
  parts: CANNON.Body[] = [];
  joints: CANNON.ConeTwistConstraint[] = [];
  meshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    const createPart = (size: [number, number, number], offset: THREE.Vector3) => {
      const shape = new CANNON.Box(new CANNON.Vec3(size[0]/2, size[1]/2, size[2]/2));
      const body = new CANNON.Body({ mass: 5 });
      body.addShape(shape);
      body.position.set(position.x + offset.x, position.y + offset.y, position.z + offset.z);
      physics.addBody(body);

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        new THREE.MeshStandardMaterial({ color: 0xffaaaa })
      );
      mesh.position.copy(body.position as any);
      scene.add(mesh);

      this.parts.push(body);
      this.meshes.push(mesh);
      return body;
    };

    const torso = createPart([0.6, 1, 0.3], new THREE.Vector3(0, 1, 0));
    const head = createPart([0.4, 0.4, 0.4], new THREE.Vector3(0, 1.8, 0));
    const leftArm = createPart([0.2, 0.8, 0.2], new THREE.Vector3(-0.6, 1.2, 0));
    const rightArm = createPart([0.2, 0.8, 0.2], new THREE.Vector3(0.6, 1.2, 0));
    const leftLeg = createPart([0.25, 1, 0.25], new THREE.Vector3(-0.3, 0, 0));
    const rightLeg = createPart([0.25, 1, 0.25], new THREE.Vector3(0.3, 0, 0));

    const connect = (a: CANNON.Body, b: CANNON.Body, pivot: CANNON.Vec3) => {
      const joint = new CANNON.ConeTwistConstraint(a, b, { pivotA: pivot, pivotB: pivot });
      physics.world.addConstraint(joint);
      this.joints.push(joint);
    };

    connect(torso, head, new CANNON.Vec3(0, 0.5, 0));
    connect(torso, leftArm, new CANNON.Vec3(-0.3, 0.4, 0));
    connect(torso, rightArm, new CANNON.Vec3(0.3, 0.4, 0));
    connect(torso, leftLeg, new CANNON.Vec3(-0.2, -0.5, 0));
    connect(torso, rightLeg, new CANNON.Vec3(0.2, -0.5, 0));
  }

  update() {
    this.parts.forEach((body, i) => {
      this.meshes[i].position.copy(body.position as any);
      this.meshes[i].quaternion.copy(body.quaternion as any);
    });
  }
}
