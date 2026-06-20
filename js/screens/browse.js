// ===== Browse Screen =====
// Category accordion with full command list

function renderBrowseScreen(container) {
  const srsData = Store.get("srsData");

  // Build HTML
  let html = `
    <div class="screen active" style="padding-bottom:var(--space-3xl)">
      <div class="app-header">
        <span class="app-header__title">📚 全部命令</span>
        <span style="font-size:0.8rem;color:var(--color-text-muted)">
          ${COMMANDS.length} 个命令 · ${CATEGORIES.length} 个分类
        </span>
      </div>`;

  // Render each category as an accordion group
  CATEGORIES.forEach((cat) => {
    const cmds = COMMANDS_BY_CATEGORY[cat.id] || [];
    const mastered = cmds.filter((c) => {
      const s = srsData[c.id];
      return s && s.easeFactor >= 2.3 && s.repetitions >= 3;
    }).length;

    html += `
      <div class="category-group" data-category="${cat.id}">
        <div class="category-header" onclick="this.parentElement.classList.toggle('open')">
          <span class="category-header__icon">${cat.icon}</span>
          <span class="category-header__name">${cat.name}</span>
          <span class="category-header__count">${mastered}/${cmds.length}</span>
          <span class="category-header__chevron">▼</span>
        </div>
        <div class="category-body">
        </div>
      </div>`;
  });

  html += `</div>`;

  container.innerHTML = html;

  // Populate each category body with command cards
  setTimeout(() => {
    CATEGORIES.forEach((cat) => {
      const body = container.querySelector(
        `.category-group[data-category="${cat.id}"] .category-body`
      );
      if (!body) return;

      const cmds = COMMANDS_BY_CATEGORY[cat.id] || [];
      cmds.forEach((cmd) => {
        const srsEntry = srsData[cmd.id];
        body.appendChild(renderCommandCard(cmd, srsEntry));
      });
    });
  }, 0);
}
