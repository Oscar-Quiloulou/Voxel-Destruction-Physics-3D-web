import * as THREE from "three";

export function snapToGrid(position: THREE.Vector3, gridSize = 1) {
  return new THREE.Vector3(
    Math.round(position.x / gridSize) * gridSize,
    Math.round(position.y / gridSize) * gridSize,
    Math.round(position.z / gridSize) * gridSize
  );
}
