import * as THREE from "three";

export type WorldBlock = {
  size: number;
  material: string;
  position: THREE.Vector3;
};

export const WorldData = {
  blocks: [] as WorldBlock[],

  reset() {
    this.blocks = [];
  },

  addBlock(size: number, material: string, position: THREE.Vector3) {
    this.blocks.push({ size, material, position });
  }
};
