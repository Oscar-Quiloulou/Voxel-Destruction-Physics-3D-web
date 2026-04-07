import * as THREE from "three";
import { VoxelEngine } from "./voxelEngine";
import { BuildingStructure } from "./buildings";
import { RaycastVehicle } from "./vehicles";
import { Ragdoll } from "./ragdoll";
import { Explosive } from "./explosives";

export function startEditor(app: HTMLElement) {
  app.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, app.clientWidth / app.clientHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(app.clientWidth, app.clientHeight);
  app.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const voxelEngine = new VoxelEngine(scene);
  const structure = new BuildingStructure(scene);

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
    <button id="save">Sauvegarder</button>
  `;
  app.appendChild(ui);

  document.getElementById("addBlock")?.addEventListener("click", () => {
    const block = structure.addBlock(1, "stone", new THREE.Vector3(0, 5, 0));
    console.log("Bloc ajouté", block);
  });

  document.getElementById("addVehicle")?.addEventListener("click", () => {
    new RaycastVehicle(scene, new THREE.Vector3(0, 5, 0));
  });

  document.getElementById("addRagdoll")?.addEventListener("click", () => {
    new Ragdoll(scene, new THREE.Vector3(0, 5, 0));
  });

  document.getElementById("addExplosive")?.addEventListener("click", () => {
    new Explosive(scene, new THREE.Vector3(0, 5, 0));
  });

  document.getElementById("save")?.addEventListener("click", () => {
    alert("Sauvegarde non implémentée (à venir)");
  });

  function animate() {
    requestAnimationFrame(animate);
    voxelEngine.update();
    structure.update();
    renderer.render(scene, camera);
  }

  animate();
}
