// ===== Flashcard Quiz Screen =====

function renderFlashcardQuizScreen(container, customCommands) {
  // Use provided commands or pick from all commands
  const commands = customCommands || shuffle(COMMANDS).slice(0, 10);
  let currentIndex = 0;
  let startTime = Date.now();
  const results = []; // { commandId, quality }

  const totalQuestions = commands.length;

  function renderCard() {
    if (currentIndex >= totalQuestions) {
      showSummary();
      return;
    }

    const cmd = commands[currentIndex];
    const progressPct = Math.round((currentIndex / totalQuestions) * 100);

    const frontHTML = `
      <div class="flashcard-front__category">${cmd.categoryIcon} ${escapeHTML(cmd.category)}</div>
      <div class="flashcard-front__command">${escapeHTML(cmd.command)}</div>
      <div class="flashcard-front__hint">👆 点击翻转查看详情</div>
    `;

    const backHTML = renderCommandDetailHTML(cmd);

    const card = createFlashcard({
      frontHTML,
      backHTML,
      onFlip: () => {
        // Show assessment buttons after flip
        assessmentDiv.style.display = "block";
      },
    });

    // Handle swipe to skip
    card.addEventListener("swipe", (e) => {
      const quality = e.detail.direction === "right" ? 5 : 2;
      results.push({ commandId: cmd.id, quality });
      currentIndex++;
      renderCard();
    });

    const assessmentDiv = document.createElement("div");
    assessmentDiv.style.cssText =
      "display:none;margin-top:var(--space-xl);padding:0 var(--space-lg)";
    assessmentDiv.innerHTML = `
      <p style="text-align:center;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:var(--space-md)">
        你对这个命令的掌握程度？
      </p>
      <div class="assessment-btns">
        <button class="assessment-btn assessment-btn--forgot" data-quality="0">
          <span style="font-size:1.2rem">😰</span> 忘记了
        </button>
        <button class="assessment-btn assessment-btn--hard" data-quality="2">
          <span style="font-size:1.2rem">🤔</span> 困难
        </button>
        <button class="assessment-btn assessment-btn--ok" data-quality="3">
          <span style="font-size:1.2rem">👍</span> 一般
        </button>
        <button class="assessment-btn assessment-btn--easy" data-quality="5">
          <span style="font-size:1.2rem">😎</span> 简单
        </button>
      </div>
    `;

    // Assessment button clicks
    assessmentDiv.querySelectorAll(".assessment-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const quality = parseInt(btn.dataset.quality);
        results.push({ commandId: cmd.id, quality });
        Store.recordReview(cmd.id, quality, "flashcard");
        currentIndex++;
        renderCard();
      });
    });

    const progressBar = document.createElement("div");
    progressBar.className = "quiz-progress";
    progressBar.style.cssText = "padding:0 var(--space-lg)";
    progressBar.innerHTML = Array.from(
      { length: totalQuestions },
      (_, i) =>
        `<div class="quiz-progress__dot ${
          i < currentIndex
            ? "done"
            : i === currentIndex
            ? "current"
            : ""
        }"></div>`
    ).join("");

    const header = document.createElement("div");
    header.className = "app-header";
    header.style.cssText = "background:transparent;border:none";
    header.innerHTML = `
      <button class="app-header__back" onclick="Router.navigate('quiz')">← 返回</button>
      <span class="app-header__title" style="font-size:0.9rem">闪卡 ${currentIndex + 1}/${totalQuestions}</span>
      <span style="width:36px"></span>
    `;

    container.innerHTML = "";
    container.appendChild(header);
    container.appendChild(progressBar);
    container.appendChild(document.createElement("div")).style.height =
      "var(--space-lg)";
    container.appendChild(card);
    container.appendChild(assessmentDiv);

    // Scroll card into view
    card.scrollIntoView({ behavior: "smooth" });
  }

  function showSummary() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = results.filter((r) => r.quality >= 3).length;
    const incorrect = results.length - correct;

    // Log activity
    const newLearned = results.filter((r) => {
      const srs = Store.getSRSEntry(r.commandId);
      return srs.totalReviews <= 1;
    }).length;
    Store.logActivity(results.length, newLearned, timeSpent);

    container.innerHTML = `
      <div class="quiz-summary" style="padding-top:var(--space-3xl)">
        <div class="quiz-summary__icon">${
          correct >= results.length * 0.8 ? "🎉" : "💪"
        }</div>
        <div class="quiz-summary__score">${correct}/${results.length}</div>
        <div class="quiz-summary__label">正确率 ${Math.round(
          (correct / results.length) * 100
        )}% | 用时 ${formatTime(timeSpent)}</div>

        <div class="quiz-summary__stats">
          <div class="quiz-summary__stat">
            <div class="value">${correct}</div>
            <div class="label">✅ 掌握</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${incorrect}</div>
            <div class="label">📝 需要复习</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${newLearned}</div>
            <div class="label">🆕 新学</div>
          </div>
        </div>

        <button class="btn btn--primary btn--block btn--lg" style="margin-bottom:var(--space-md)"
                onclick="renderFlashcardQuizScreen(document.getElementById('screen-container'))">
          再来一轮
        </button>
        <button class="btn btn--outline btn--block btn--lg"
                onclick="Router.navigate('quiz')">
          返回练习菜单
        </button>
      </div>
    `;
  }

  renderCard();
}
