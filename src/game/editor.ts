import * as THREE from "three";
import { VoxelEngine } from "./voxelEngine";
import { BuildingStructure } from "./buildings";
import { RaycastVehicle } from "./vehicles";
import { Ragdoll } from "./ragdoll";
import { Explosive } from "./explosives";
import { WorldData } from "./world";

export function startEditor(app: HTMLElement) {
  app.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, app.clientWidth / app.clientHeight, 0.1, 1000);
  camera.position.set(15, 20, 15);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(app.clientWidth, app.clientHeight);
  app.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Sol visuel
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const voxelEngine = new VoxelEngine(scene);
  const structure = new BuildingStructure(scene);

  // Charger les blocs existants
  WorldData.blocks.forEach(b => {
    structure.addBlock(b.size, b.material, b.position.clone());
  });

  // UI
  const ui = document.createElement("div");
  ui.style.position = "absolute";
  ui.style.top = "60px";
  ui.style.left = "20px";
  ui.style.color = "white";
  ui.style.fontSize = "14px";
  ui.style.zIndex = "20";
  ui.innerHTML = `
    <h2>Éditeur</h2>
    <button id="addBlock">Ajouter bloc</button>
    <button id="addVehicle">Ajouter véhicule</button>
    <button id="addRagdoll">Ajouter ragdoll</button>
    <button id="addExplosive">Ajouter explosif</button>
    <button id="resetWorld">Reset monde</button>
  `;
  app.appendChild(ui);

  // Ajouter bloc
  document.getElementById("addBlock")?.addEventListener("click", () => {
    const pos = new THREE.Vector3(0, 1, 0);
    structure.addBlock(1, "stone", pos);
    WorldData.addBlock(1, "stone", pos);
  });

  document.getElementById("addVehicle")?.addEventListener("click", () => {
    new RaycastVehicle(scene, new THREE.Vector3(0, 1, 0));
  });

  document.getElementById("addRagdoll")?.addEventListener("click", () => {
    new Ragdoll(scene, new THREE.Vector3(0, 1, 0));
  });

  document.getElementById("addExplosive")?.addEventListener("click", () => {
    new Explosive(scene, new THREE.Vector3(0, 1, 0));
  });

  document.getElementById("resetWorld")?.addEventListener("click", () => {
    WorldData.reset();
    location.reload();
  });

  function animate() {
    requestAnimationFrame(animate);
    voxelEngine.update();
    structure.update();
    renderer.render(scene, camera);
  }

  animate();
}
