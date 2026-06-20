// ===== Bottom Navigation Bar =====

function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.innerHTML = `
    <button class="bottom-nav__tab active" data-route="home">
      <span class="icon">🏠</span>
      <span class="label">学习</span>
    </button>
    <button class="bottom-nav__tab" data-route="browse">
      <span class="icon">📚</span>
      <span class="label">浏览</span>
    </button>
    <button class="bottom-nav__tab" data-route="quiz">
      <span class="icon">📝</span>
      <span class="label">练习</span>
    </button>
    <button class="bottom-nav__tab" data-route="stats">
      <span class="icon">📈</span>
      <span class="label">统计</span>
    </button>
  `;

  // Add click handlers
  nav.querySelectorAll(".bottom-nav__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const route = tab.dataset.route;
      Router.navigate(route);
    });
  });

  return nav;
}
