import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";

export type VoxelMaterial = {
  name: string;
  color: number;
  density: number;
  resistance: number;
  friction: number;
};

export const MATERIALS: Record<string, VoxelMaterial> = {
  wood:   { name: "wood",   color: 0x8b5a2b, density: 0.6, resistance: 0.4, friction: 0.5 },
  metal:  { name: "metal",  color: 0xaaaaaa, density: 7.8, resistance: 1.0, friction: 0.3 },
  stone:  { name: "stone",  color: 0x777777, density: 2.4, resistance: 0.8, friction: 0.6 },
  glass:  { name: "glass",  color: 0x99ccff, density: 2.2, resistance: 0.2, friction: 0.1 }
};

export class VoxelBlock {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  material: VoxelMaterial;
  size: number;

  constructor(size: number, material: VoxelMaterial, position: THREE.Vector3) {
    this.size = size;
    this.material = material;

    // THREE.js mesh
    const geometry = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({ color: material.color });
    this.mesh = new THREE.Mesh(geometry, mat);
    this.mesh.position.copy(position);

    // CANNON body
    const mass = material.density * size * size * size;
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    this.body = new CANNON.Body({
      mass,
      shape,
      material: new CANNON.Material({
        friction: material.friction,
        restitution: 0.1
      })
    });

    this.body.position.set(position.x, position.y, position.z);
    physics.addBody(this.body);
  }

  sync() {
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
    this.mesh.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );
  }
}

export class VoxelEngine {
  scene: THREE.Scene;
  blocks: VoxelBlock[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addBlock(size: number, materialName: string, position: THREE.Vector3) {
    const material = MATERIALS[materialName];
    const block = new VoxelBlock(size, material, position);
    this.blocks.push(block);
    this.scene.add(block.mesh);
    return block;
  }

  update() {
    this.blocks.forEach(b => b.sync());
  }
}
