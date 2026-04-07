import * as THREE from "three";
import * as CANNON from "cannon-es";
import { VoxelBlock, MATERIALS } from "./voxelEngine";
import { physics } from "./PhysicsEngine";

export type StructuralJoint = {
  blockA: VoxelBlock;
  blockB: VoxelBlock;
  strength: number; // seuil de rupture
  broken: boolean;
};

export class BuildingStructure {
  scene: THREE.Scene;
  blocks: VoxelBlock[] = [];
  joints: StructuralJoint[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addBlock(size: number, material: string, pos: THREE.Vector3) {
    const block = new VoxelBlock(size, MATERIALS[material], pos);
    this.blocks.push(block);
    this.scene.add(block.mesh);
    return block;
  }

  connectBlocks(a: VoxelBlock, b: VoxelBlock, strength = 50) {
    this.joints.push({
      blockA: a,
      blockB: b,
      strength,
      broken: false
    });
  }

  update() {
    // Sync meshes
    this.blocks.forEach(b => b.sync());

    // Check joint stress
    this.joints.forEach(j => {
      if (j.broken) return;

      const dist = j.blockA.body.position.distanceTo(j.blockB.body.position);

      // Distance threshold = rupture
      if (dist > 1.2 * j.blockA.size) {
        j.broken = true;
        return;
      }

      // Force threshold
      const force = j.blockA.body.velocity.length() + j.blockB.body.velocity.length();
      if (force > j.strength) {
        j.broken = true;
      }
    });

    // Remove broken joints
    this.joints = this.joints.filter(j => !j.broken);
  }
}
