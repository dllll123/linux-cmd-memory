// ===== App Entry Point =====

(function () {
  // Initialize store from localStorage
  Store.init();

  // Mount app shell
  const app = document.getElementById("app");
  if (!app) return;

  // Render bottom nav
  app.appendChild(renderNavbar());

  // Register routes
  // Home
  Router.on("", (container) => renderHomeScreen(container));
  Router.on("home", (container) => renderHomeScreen(container));

  // Browse
  Router.on("browse", (container) => renderBrowseScreen(container));

  // Quiz menu
  Router.on("quiz", (container) => renderQuizMenuScreen(container));

  // Quiz modes
  Router.on("quiz/flashcard", (container) =>
    renderFlashcardQuizScreen(container)
  );
  Router.on("quiz/choice", (container) => renderChoiceQuizScreen(container));
  Router.on("quiz/fillblank", (container) =>
    renderFillBlankQuizScreen(container)
  );
  Router.on("quiz/match", (container) => renderMatchQuizScreen(container));

  // Daily review
  Router.on("review", (container) => renderReviewScreen(container));

  // Stats
  Router.on("stats", (container) => renderStatsScreen(container));

  // Initialize router
  Router.init();
})();
