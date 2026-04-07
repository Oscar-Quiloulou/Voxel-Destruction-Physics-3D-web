import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";

export class Player {
  camera: THREE.PerspectiveCamera;
  body: CANNON.Body;
  speed = 8;
  jumpForce = 6;
  canJump = false;

  constructor(scene: THREE.Scene, app: HTMLElement) {
    // CAMERA FPS
    this.camera = new THREE.PerspectiveCamera(
      70,
      app.clientWidth / app.clientHeight,
      0.1,
      1000
    );

    // PHYSICS BODY
    const shape = new CANNON.Sphere(0.5);
    this.body = new CANNON.Body({
      mass: 5,
      shape,
      position: new CANNON.Vec3(0, 3, 0)
    });

    physics.addBody(this.body);

    // DETECT GROUND CONTACT
    this.body.addEventListener("collide", () => {
      this.canJump = true;
    });

    scene.add(this.camera);
  }

  update() {
    // Sync camera to body
    this.camera.position.set(
      this.body.position.x,
      this.body.position.y + 0.5,
      this.body.position.z
    );
  }

  moveForward(dt: number) {
    this.body.velocity.z -= Math.cos(this.camera.rotation.y) * this.speed * dt;
    this.body.velocity.x -= Math.sin(this.camera.rotation.y) * this.speed * dt;
  }

  moveBackward(dt: number) {
    this.body.velocity.z += Math.cos(this.camera.rotation.y) * this.speed * dt;
    this.body.velocity.x += Math.sin(this.camera.rotation.y) * this.speed * dt;
  }

  moveLeft(dt: number) {
    this.body.velocity.x -= Math.cos(this.camera.rotation.y) * this.speed * dt;
    this.body.velocity.z += Math.sin(this.camera.rotation.y) * this.speed * dt;
  }

  moveRight(dt: number) {
    this.body.velocity.x += Math.cos(this.camera.rotation.y) * this.speed * dt;
    this.body.velocity.z -= Math.sin(this.camera.rotation.y) * this.speed * dt;
  }

  jump() {
    if (this.canJump) {
      this.body.velocity.y = this.jumpForce;
      this.canJump = false;
    }
  }
}
