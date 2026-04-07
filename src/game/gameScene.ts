import * as THREE from "three";
import { physics } from "./PhysicsEngine";
import { VoxelEngine } from "./voxelEngine";
import { BuildingStructure } from "./buildings";
import { RaycastVehicle } from "./vehicles";
import { Ragdoll } from "./ragdoll";
import { Explosive } from "./explosives";
import { ImpulseGun, KineticHammer, CapsuleLauncher } from "./weapons";

export function startGame(app: HTMLElement) {
  app.innerHTML = "";

  // --- SCENE ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // --- CAMERA ---
  const camera = new THREE.PerspectiveCamera(
    70,
    app.clientWidth / app.clientHeight,
    0.1,
    2000
  );
  camera.position.set(10, 10, 15);
  camera.lookAt(0, 0, 0);

  // --- RENDERER ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(app.clientWidth, app.clientHeight);
  app.appendChild(renderer.domElement);

  // --- LIGHTING ---
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // --- ENGINES ---
  const voxelEngine = new VoxelEngine(scene);
  const structure = new BuildingStructure(scene);

  // --- TEST OBJECTS ---
  structure.addBlock(1, "stone", new THREE.Vector3(0, 5, 0));
  structure.addBlock(1, "wood", new THREE.Vector3(1, 5, 0));
  structure.addBlock(1, "metal", new THREE.Vector3(-1, 5, 0));

  const vehicle = new RaycastVehicle(scene, new THREE.Vector3(0, 5, -5));
  const ragdoll = new Ragdoll(scene, new THREE.Vector3(3, 5, 0));

  // --- WEAPONS ---
  const impulseGun = new ImpulseGun(scene);
  const hammer = new KineticHammer(scene);
  const launcher = new CapsuleLauncher(scene);

  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      impulseGun.fire(camera.position.clone(), camera.getWorldDirection(new THREE.Vector3()));
    }
    if (e.key === "e") {
      hammer.smash(camera.position.clone());
    }
    if (e.key === "r") {
      launcher.fire(camera.position.clone(), camera.getWorldDirection(new THREE.Vector3()));
    }
    if (e.key === "z") {
      vehicle.accelerate(200);
    }
    if (e.key === "s") {
      vehicle.brake(50);
    }
    if (e.key === "q") {
      vehicle.steer(0.5);
    }
    if (e.key === "d") {
      vehicle.steer(-0.5);
    }
  });

  // --- ANIMATION LOOP ---
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    physics.step(delta);

    voxelEngine.update();
    structure.update();
    vehicle.update();
    ragdoll.update();

    renderer.render(scene, camera);
  }

  animate();
}
