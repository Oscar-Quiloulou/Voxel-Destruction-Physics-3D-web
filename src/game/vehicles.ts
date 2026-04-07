import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";

export class RaycastVehicle {
  chassisBody: CANNON.Body;
  vehicle: CANNON.RaycastVehicle;
  mesh: THREE.Mesh;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    // Chassis
    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    this.chassisBody = new CANNON.Body({ mass: 150 });
    this.chassisBody.addShape(shape);
    this.chassisBody.position.set(position.x, position.y, position.z);
    physics.addBody(this.chassisBody);

    // THREE mesh
    const geo = new THREE.BoxGeometry(2, 1, 4);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4444ff });
    this.mesh = new THREE.Mesh(geo, mat);
    scene.add(this.mesh);

    // Raycast vehicle
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody
    });

    const wheelOptions = {
      radius: 0.4,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionRestLength: 0.3,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0)
    };

    // Add wheels
    this.vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1.5) });
    this.vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1.5) });
    this.vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, -1.5) });
    this.vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(1, 0, -1.5) });

    this.vehicle.addToWorld(physics.world);
  }

  update() {
    this.mesh.position.copy(this.chassisBody.position as any);
    this.mesh.quaternion.copy(this.chassisBody.quaternion as any);
  }

  accelerate(force: number) {
    this.vehicle.applyEngineForce(force, 2);
    this.vehicle.applyEngineForce(force, 3);
  }

  brake(force: number) {
    this.vehicle.setBrake(force, 2);
    this.vehicle.setBrake(force, 3);
  }

  steer(value: number) {
    this.vehicle.setSteeringValue(value, 0);
    this.vehicle.setSteeringValue(value, 1);
  }
}
