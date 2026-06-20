// ===== Command Card & Detail Modal =====

/**
 * Render a compact command card for list views (browse, search).
 * @param {Object} cmd - Command data object
 * @param {Object} srsEntry - SRS data for this command (optional)
 * @returns {HTMLElement}
 */
function renderCommandCard(cmd, srsEntry) {
  const status = getSRSStatus(srsEntry);
  const card = document.createElement("div");
  card.className = "cmd-card";
  card.innerHTML = `
    <div class="cmd-card__icon cmd-card__icon--${cmd.categoryId}">
      ${cmd.command.slice(0, 2).toUpperCase()}
    </div>
    <div class="cmd-card__info">
      <div class="cmd-card__name">${escapeHTML(cmd.command)}</div>
      <div class="cmd-card__desc">${escapeHTML(cmd.description)}</div>
    </div>
    <div class="cmd-card__status cmd-card__status--${status}" title="${status}"></div>
  `;

  card.addEventListener("click", () => {
    showCommandDetail(cmd, srsEntry);
  });

  return card;
}

/**
 * Show command detail in a bottom-sheet modal.
 * @param {Object} cmd - Command data object
 * @param {Object} srsEntry - SRS data for this command
 */
function showCommandDetail(cmd, srsEntry) {
  // Build options HTML
  const optionsHTML =
    cmd.commonOptions && cmd.commonOptions.length > 0
      ? `
    <div class="flashcard-back__section">
      <h4>常用选项</h4>
      <div class="flashcard-back__options">
        ${cmd.commonOptions
          .map(
            (opt) =>
              `<span class="flashcard-back__option-tag"><strong>${escapeHTML(
                opt.flag
              )}</strong> ${escapeHTML(opt.meaning)}</span>`
          )
          .join("")}
      </div>
    </div>`
      : "";

  // Build examples HTML
  const examplesHTML =
    cmd.examples && cmd.examples.length > 0
      ? `
    <div class="flashcard-back__section">
      <h4>使用示例</h4>
      ${cmd.examples
        .map(
          (ex) => `
        <code class="flashcard-back__example">$ ${escapeHTML(ex.command)}</code>
        <p class="flashcard-back__example-exp">${escapeHTML(
          ex.explanation
        )}</p>`
        )
        .join("")}
    </div>`
      : "";

  // SRS status info
  let srsHTML = "";
  if (srsEntry && srsEntry.totalReviews > 0) {
    const accuracy =
      srsEntry.totalReviews > 0
        ? Math.round(
            (srsEntry.totalCorrect / srsEntry.totalReviews) * 100
          )
        : 0;
    const status = getSRSStatus(srsEntry);
    const statusLabels = {
      mastered: "已掌握 ✅",
      learning: "学习中 📖",
      struggling: "需加强 💪",
      new: "未学习 🆕",
    };
    srsHTML = `
      <div class="flashcard-back__section">
        <h4>学习进度</h4>
        <div style="display:flex;gap:16px;font-size:0.85rem">
          <span>状态：${statusLabels[status]}</span>
          <span>复习：${srsEntry.totalReviews} 次</span>
          <span>正确率：${accuracy}%</span>
        </div>
      </div>`;
  }

  // Build modal
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <span style="font-weight:700;font-family:var(--font-mono);font-size:1.2rem;color:var(--color-primary)">
          ${escapeHTML(cmd.command)}
        </span>
        <span style="font-size:0.85rem;color:var(--color-text-muted)">
          ${escapeHTML(cmd.fullName)}
        </span>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:var(--space-lg);line-height:1.6">
          ${escapeHTML(cmd.description)}
        </p>
        ${optionsHTML}
        ${examplesHTML}
        ${srsHTML}
      </div>
      <div class="modal-footer">
        <button class="btn btn--primary btn--block btn--lg" id="cmd-detail-practice">
          练习此命令
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Practice button
  overlay.querySelector("#cmd-detail-practice").addEventListener("click", () => {
    overlay.remove();
    // Practice this specific command via flashcard
    const container = document.getElementById("screen-container");
    renderFlashcardQuizScreen(container, [cmd]);
  });
}

/**
 * Render a single command detail card (static, for flashcard back face).
 * @param {Object} cmd - Command data object
 * @returns {string} HTML string
 */
function renderCommandDetailHTML(cmd) {
  const optionsHTML =
    cmd.commonOptions && cmd.commonOptions.length > 0
      ? `
    <div class="flashcard-back__section">
      <h4>常用选项</h4>
      <div class="flashcard-back__options">
        ${cmd.commonOptions
          .map(
            (opt) =>
              `<span class="flashcard-back__option-tag"><strong>${escapeHTML(
                opt.flag
              )}</strong> ${escapeHTML(opt.meaning)}</span>`
          )
          .join("")}
      </div>
    </div>`
      : "";

  const examplesHTML =
    cmd.examples && cmd.examples.length > 0
      ? `
    <div class="flashcard-back__section">
      <h4>使用示例</h4>
      ${cmd.examples
        .map(
          (ex) => `
        <code class="flashcard-back__example">$ ${escapeHTML(ex.command)}</code>
        <p class="flashcard-back__example-exp">${escapeHTML(
          ex.explanation
        )}</p>`
        )
        .join("")}
    </div>`
      : "";

  return `
    <div class="flashcard-back__name">${escapeHTML(cmd.command)}</div>
    <div class="flashcard-back__fullname">${escapeHTML(cmd.fullName)}</div>
    <p style="margin-bottom:var(--space-lg);line-height:1.5;font-size:0.9rem;">
      ${escapeHTML(cmd.description)}
    </p>
    ${optionsHTML}
    ${examplesHTML}
  `;
}
