import * as THREE from "three";
import * as CANNON from "cannon-es";
import { physics } from "./PhysicsEngine";
import { Player } from "./player";
import { Explosive } from "./explosives";
import { ImpulseGun, KineticHammer, CapsuleLauncher } from "./weapons";

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

  // --- SOL ---
  const groundGeo = new THREE.PlaneGeometry(500, 500);
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

  // --- WEAPONS ---
  const impulseGun = new ImpulseGun(scene);
  const hammer = new KineticHammer(scene);
  const launcher = new CapsuleLauncher(scene);

  const keys: Record<string, boolean> = {};

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  window.addEventListener("mousedown", () => {
    impulseGun.fire(
      player.camera.position.clone(),
      player.camera.getWorldDirection(new THREE.Vector3())
    );
  });

  window.addEventListener("contextmenu", e => {
    e.preventDefault();
    hammer.smash(player.camera.position.clone());
  });

  window.addEventListener("keypress", e => {
    if (e.key === "r") {
      launcher.fire(
        player.camera.position.clone(),
        player.camera.getWorldDirection(new THREE.Vector3())
      );
    }
    if (e.key === " ") {
      player.jump();
    }
  });

  let last = performance.now();

  function loop() {
    requestAnimationFrame(loop);

    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;

    if (keys["z"]) player.moveForward(dt);
    if (keys["s"]) player.moveBackward(dt);
    if (keys["q"]) player.moveLeft(dt);
    if (keys["d"]) player.moveRight(dt);

    physics.step(dt);
    player.update();

    renderer.render(scene, player.camera);
  }

  loop();
}
