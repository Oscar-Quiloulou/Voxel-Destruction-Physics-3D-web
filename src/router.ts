export function initRouter() {
  window.addEventListener("hashchange", renderPage);
  renderPage();
}

function renderPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const route = window.location.hash || "#/";

  switch (route) {
    case "#/":
      app.innerHTML = `<h1>Accueil</h1><p>Bienvenue dans le Voxel Physics Sandbox.</p>`;
      break;

    case "#/game":
      app.innerHTML = "";
      import("./game/gameScene").then(module => {
        module.startGame(app);
      });
      break;

    case "#/editor":
      app.innerHTML = "";
      import("./game/editor").then(module => {
        module.startEditor(app);
      });
      break;

    case "#/about":
      app.innerHTML = `<h1>À propos</h1><p>Sandbox 3D physique avancée.</p>`;
      break;

    default:
      app.innerHTML = `<h1>404</h1><p>Page introuvable.</p>`;
  }
}
