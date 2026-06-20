// ===== Simple Hash Router =====

const Router = {
  _currentRoute: null,
  _routes: {},

  /** Register a route */
  on(hash, handler) {
    this._routes[hash] = handler;
  },

  /** Navigate to a hash */
  navigate(hash) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      // Same hash, force re-render
      this._handleRoute(hash);
    }
  },

  /** Get the current clean hash (without #) */
  currentHash() {
    return window.location.hash.replace("#", "") || "";
  },

  /** Handle route change */
  _handleRoute(hash) {
    const cleanHash = hash.replace("#", "");
    this._currentRoute = cleanHash;

    // Find matching route handler
    // Check exact match first, then prefix match
    let handler = this._routes[cleanHash];

    if (!handler) {
      // Try prefix match (e.g. /quiz/flashcard -> /quiz)
      const parts = cleanHash.split("/");
      while (parts.length > 0 && !handler) {
        parts.pop();
        handler = this._routes[parts.join("/")];
      }
    }

    // Handle params: hash like /quiz/flashcard, the screen handler
    // can read the full hash from Router.currentHash()
    if (!handler) {
      // Default to home
      handler = this._routes[""] || this._routes["home"];
    }

    const container = document.getElementById("screen-container");
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Render the screen
    if (handler) {
      handler(container, cleanHash);
    }

    // Update navbar active state
    updateNavbarActive(cleanHash);
  },

  /** Initialize router, listen to hash changes */
  init() {
    window.addEventListener("hashchange", () => {
      this._handleRoute(window.location.hash);
    });

    // Trigger initial route
    if (window.location.hash) {
      this._handleRoute(window.location.hash);
    } else {
      this.navigate("");
    }
  },
};

/** Update bottom nav active tab based on current route */
function updateNavbarActive(hash) {
  const tabs = document.querySelectorAll(".bottom-nav__tab");
  tabs.forEach((tab) => tab.classList.remove("active"));

  const activeMap = {
    home: 0,
    browse: 1,
    quiz: 2,
    stats: 3,
  };

  for (const [prefix, index] of Object.entries(activeMap)) {
    if (hash.startsWith(prefix) || (prefix === "home" && hash === "")) {
      if (tabs[index]) tabs[index].classList.add("active");
      break;
    }
  }
}

/** Helper: go back in browser history */
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    Router.navigate("");
  }
}
