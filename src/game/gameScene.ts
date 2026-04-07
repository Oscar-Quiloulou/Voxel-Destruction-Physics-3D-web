import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";
import { VoxelEngine } from "./voxelEngine";
import { BuildingStructure } from "./buildings";
import { Explosive } from "./explosives";
import { ImpulseGun, KineticHammer, CapsuleLauncher } from "./weapons";
import { Player } from "./player";

export function startGame(app: HTMLElement) {
  app.innerHTML = "";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(app.clientWidth, app.clientHeight);
  app.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // --- GROUND ---
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physics.addBody(groundBody);

  // --- PLAYER FPS ---
  const player = new Player(scene, app);

  // --- ENGINES ---
  const voxelEngine = new VoxelEngine(scene);
  const structure = new BuildingStructure(scene);

  // --- TEST OBJECTS ---
  structure.addBlock(1, "stone", new THREE.Vector3(0, 5, 0));
  structure.addBlock(1, "wood", new THREE.Vector3(1, 5, 0));
  structure.addBlock(1, "metal", new THREE.Vector3(-1, 5, 0));

  const explosives: Explosive[] = [];
  explosives.push(new Explosive(scene, new THREE.Vector3(0, 5, 0)));

  // --- WEAPONS ---
  const impulseGun = new ImpulseGun(scene);
  const hammer = new KineticHammer(scene);
  const launcher = new CapsuleLauncher(scene);

  // --- INPUT ---
  const keys: Record<string, boolean> = {};

  window.addEventListener("keydown", (e) => (keys[e.key] = true));
  window.addEventListener("keyup", (e) => (keys[e.key] = false));

  window.addEventListener("mousedown", () => {
    impulseGun.fire(
      player.camera.position.clone(),
      player.camera.getWorldDirection(new THREE.Vector3())
    );
  });

  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    hammer.smash(player.camera.position.clone());
  });

  window.addEventListener("keypress", (e) => {
    if (e.key === "r") {
      launcher.fire(
        player.camera.position.clone(),
        player.camera.getWorldDirection(new THREE.Vector3())
      );
    }
    if (e.key === "x") {
      explosives.forEach((ex) => ex.explode(scene));
    }
    if (e.key === " ") {
      player.jump();
    }
  });

  // --- LOOP ---
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // MOVEMENT
    if (keys["z"]) player.moveForward(dt);
    if (keys["s"]) player.moveBackward(dt);
    if (keys["q"]) player.moveLeft(dt);
    if (keys["d"]) player.moveRight(dt);

    physics.step(dt);

    player.update();
    voxelEngine.update();
    structure.update();

    renderer.render(scene, player.camera);
  }

  animate();
}
