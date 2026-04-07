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
      app.innerHTML = `
        <h1>Accueil</h1>
        <p>Bienvenue dans le Voxel Physics Sandbox.</p>
        <button onclick="location.hash='#/game'">Jouer</button>
        <button onclick="location.hash='#/editor'">Éditeur</button>
      `;
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

    default:
      app.innerHTML = `<h1>404</h1><p>Page introuvable.</p>`;
  }
}
