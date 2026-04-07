import * as THREE from "three";
import { VoxelEngine } from "./voxelEngine";
import { BuildingStructure } from "./buildings";
import { RaycastVehicle } from "./vehicles";
import { Ragdoll } from "./ragdoll";
import { Explosive } from "./explosives";
import { WorldData } from "./world";
import { snapToGrid } from "./grid";

const keys: Record<string, boolean> = {};
let selectedObject: THREE.Object3D | null = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function startEditor(app: HTMLElement) {
  app.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    app.clientWidth / app.clientHeight,
    0.1,
    1000
  );
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
    <button id="resetWorld">Reset monde</button>
    <p>Flèches : déplacer l’objet sélectionné</p>
    <p>A / E : rotation Y</p>
    <p>Suppr : supprimer l’objet</p>
  `;
  app.appendChild(ui);

  // Ajout bloc
  document.getElementById("addBlock")?.addEventListener("click", () => {
    let pos = new THREE.Vector3(0, 1, 0);
    pos = snapToGrid(pos);

    // Vérifier superposition
    const exists = WorldData.blocks.some(b =>
      b.position.distanceTo(pos) < 0.1
    );
    if (exists) return;

    structure.addBlock(1, "stone", pos);
    WorldData.addBlock(1, "stone", pos);
  });

  document.getElementById("resetWorld")?.addEventListener("click", () => {
    WorldData.reset();
    location.reload();
  });

  // Gestion des touches
  window.addEventListener("keydown", e => (keys[e.key] = true));
  window.addEventListener("keyup", e => (keys[e.key] = false));

  // Sélection d’objet
  renderer.domElement.addEventListener("mousedown", e => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
    }
  });

  function animate() {
    requestAnimationFrame(animate);

    // Déplacement / rotation / suppression de l’objet sélectionné
    if (selectedObject) {
      if (keys["ArrowUp"]) selectedObject.position.z -= 0.1;
      if (keys["ArrowDown"]) selectedObject.position.z += 0.1;
      if (keys["ArrowLeft"]) selectedObject.position.x -= 0.1;
      if (keys["ArrowRight"]) selectedObject.position.x += 0.1;

      if (keys["a"]) selectedObject.rotation.y += 0.05;
      if (keys["e"]) selectedObject.rotation.y -= 0.05;

      if (keys["Delete"]) {
        scene.remove(selectedObject);
        selectedObject = null;
      }

      // Snap automatique
      selectedObject.position.copy(
        snapToGrid(selectedObject.position)
      );
    }

    voxelEngine.update();
    structure.update();
    renderer.render(scene, camera);
  }

  animate();
}
