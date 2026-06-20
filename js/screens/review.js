// ===== Daily SRS Review Screen =====
// Mixed-mode review: new commands shown as flashcard first,
// review commands quizzed with random mode selection.

function renderReviewScreen(container) {
  const queue = Store.getDailyQueue();
  let currentIndex = 0;
  let startTime = Date.now();
  const results = []; // { commandId, quality }
  let currentMode = null;
  let flashcardAssessmentReady = false;

  const totalItems = queue.length;

  if (totalItems === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-3xl) var(--space-lg)">
        <div style="font-size:4rem;margin-bottom:var(--space-lg)">🎉</div>
        <h2 style="margin-bottom:var(--space-md)">今日任务已完成！</h2>
        <p class="text-muted" style="margin-bottom:var(--space-2xl)">
          你已经完成了今天的所有复习内容。<br>
          明天再来学习新命令吧！
        </p>
        <button class="btn btn--primary btn--lg" onclick="Router.navigate('home')">
          返回首页
        </button>
      </div>
    `;
    return;
  }

  function renderCurrentItem() {
    if (currentIndex >= totalItems) {
      showSummary();
      return;
    }

    const item = queue[currentIndex];
    const cmd = item.command;

    // Determine quiz mode for this item
    if (item.type === "new") {
      // New commands: always flashcard first
      currentMode = "flashcard";
    } else {
      // Review commands: random weighted mode
      const modes = ["flashcard", "flashcard", "choice", "choice", "fillBlank"];
      currentMode = randomPick(modes, 1)[0];
      // Don't do match for single items in review (match needs pairs)
      if (currentMode === "match") currentMode = "choice";
    }

    renderByMode(cmd);
    flashcardAssessmentReady = true;
  }

  function renderByMode(cmd) {
    const progressPct = Math.round((currentIndex / totalItems) * 100);
    const item = queue[currentIndex];
    const typeLabel = item.type === "new" ? "🆕 新学" : "📝 复习";
    const modeLabel =
      currentMode === "flashcard"
        ? "闪卡"
        : currentMode === "choice"
        ? "选择"
        : "填空";

    const progressBarHTML = Array.from(
      { length: totalItems },
      (_, i) => {
        let cls = "";
        if (i < currentIndex) {
          const prevResult = results[i];
          cls = prevResult && prevResult.quality >= 3 ? "done" : "wrong-done";
        } else if (i === currentIndex) {
          cls = "current";
        }
        return `<div class="quiz-progress__dot ${cls}"></div>`;
      }
    ).join("");

    if (currentMode === "flashcard") {
      renderFlashcardReview(cmd, progressBarHTML, typeLabel, modeLabel);
    } else if (currentMode === "choice") {
      renderChoiceReview(cmd, progressBarHTML, typeLabel, modeLabel);
    } else if (currentMode === "fillBlank") {
      renderFillBlankReview(cmd, progressBarHTML, typeLabel, modeLabel);
    }
  }

  function renderFlashcardReview(cmd, progressBarHTML, typeLabel, modeLabel) {
    const frontHTML = `
      <div class="flashcard-front__command">${escapeHTML(cmd.command)}</div>
      <div class="flashcard-front__hint">👆 点击翻转</div>
    `;

    const backHTML = renderCommandDetailHTML(cmd);

    const card = createFlashcard({
      frontHTML,
      backHTML,
      onFlip: () => {
        if (flashcardAssessmentReady) {
          const assessmentDiv = container.querySelector("#review-assessment");
          if (assessmentDiv) assessmentDiv.style.display = "block";
        }
      },
    });

    container.innerHTML = `
      <div style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
          <button class="app-header__back" onclick="Router.navigate('home')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">
            ${typeLabel} ${modeLabel} ${currentIndex + 1}/${totalItems}
          </span>
          <span style="width:36px"></span>
        </div>
        <div class="quiz-progress" style="margin-bottom:var(--space-xl)">
          ${progressBarHTML}
        </div>
        <div id="review-card-container"></div>
        <div id="review-assessment" style="display:none;margin-top:var(--space-xl)">
          <p style="text-align:center;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:var(--space-md)">
            掌握程度？
          </p>
          <div class="assessment-btns">
            <button class="assessment-btn assessment-btn--forgot" data-q="0">😰 忘记了</button>
            <button class="assessment-btn assessment-btn--hard" data-q="2">🤔 困难</button>
            <button class="assessment-btn assessment-btn--ok" data-q="3">👍 一般</button>
            <button class="assessment-btn assessment-btn--easy" data-q="5">😎 简单</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#review-card-container").appendChild(card);

    // Assessment buttons
    container.querySelectorAll("#review-assessment .assessment-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const quality = parseInt(btn.dataset.q);
        results.push({ commandId: cmd.id, quality });
        Store.recordReview(cmd.id, quality, "flashcard");
        flashcardAssessmentReady = false;
        currentIndex++;
        renderCurrentItem();
      });
    });
  }

  function renderChoiceReview(cmd, progressBarHTML, typeLabel, modeLabel) {
    const distractors = pickDistractors(cmd, 3);
    const options = shuffle([
      { command: cmd.command, isCorrect: true },
      ...distractors.map((d) => ({ command: d.command, isCorrect: false })),
    ]);
    const labels = ["A", "B", "C", "D"];
    const scenario =
      cmd.scenarios && cmd.scenarios.length > 0
        ? randomPick(cmd.scenarios, 1)[0]
        : cmd.description;

    container.innerHTML = `
      <div style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
          <button class="app-header__back" onclick="Router.navigate('home')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">
            ${typeLabel} ${modeLabel} ${currentIndex + 1}/${totalItems}
          </span>
          <span style="width:36px"></span>
        </div>
        <div class="quiz-progress" style="margin-bottom:var(--space-xl)">
          ${progressBarHTML}
        </div>
        <div class="quiz-description">
          <span class="icon">🤔</span>
          以下哪个命令用于：<br><strong>"${escapeHTML(scenario)}"</strong>？
        </div>
        <div class="quiz-options-list">
          ${options.map((opt, i) => `
            <button class="quiz-option" data-correct="${opt.isCorrect}">
              <span class="quiz-option__letter">${labels[i]}</span>
              <strong style="font-family:var(--font-mono)">${escapeHTML(opt.command)}</strong>
            </button>
          `).join("")}
        </div>
        <div id="review-feedback" style="margin-top:var(--space-lg);display:none"></div>
        <button id="review-next" class="btn btn--primary btn--block btn--lg" style="display:none;margin-top:var(--space-xl)">
          下一题 →
        </button>
      </div>
    `;

    let answered = false;
    const optionBtns = container.querySelectorAll(".quiz-option");
    const feedbackDiv = container.querySelector("#review-feedback");
    const nextBtn = container.querySelector("#review-next");

    optionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const correct = btn.dataset.correct === "true";
        const correctBtn = container.querySelector('[data-correct="true"]');

        if (correct) {
          btn.classList.add("quiz-option--correct");
          feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-success);font-weight:600">✅ 正确！</div>`;
        } else {
          btn.classList.add("quiz-option--wrong", "shake");
          correctBtn.classList.add("quiz-option--correct");
          feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-danger);font-weight:600">❌ 正确答案是 ${escapeHTML(cmd.command)}</div>`;
        }
        feedbackDiv.style.display = "block";
        optionBtns.forEach((b) => b.classList.add("quiz-option--disabled"));
        results.push({ commandId: cmd.id, quality: correct ? 4 : 1 });
        Store.recordReview(cmd.id, correct ? 4 : 1, "choice");
        nextBtn.style.display = "block";
      });
    });

    nextBtn.addEventListener("click", () => {
      currentIndex++;
      renderCurrentItem();
    });
  }

  function renderFillBlankReview(cmd, progressBarHTML, typeLabel, modeLabel) {
    const scenario =
      cmd.scenarios && cmd.scenarios.length > 0
        ? randomPick(cmd.scenarios, 1)[0]
        : cmd.description;

    let attempts = 3;

    container.innerHTML = `
      <div style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
          <button class="app-header__back" onclick="Router.navigate('home')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">
            ${typeLabel} ${modeLabel} ${currentIndex + 1}/${totalItems}
          </span>
          <span style="width:36px"></span>
        </div>
        <div class="quiz-progress" style="margin-bottom:var(--space-xl)">
          ${progressBarHTML}
        </div>
        <div class="fill-blank-scenario">${escapeHTML(scenario)}</div>
        <div style="margin-bottom:var(--space-lg)">
          <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:var(--space-sm)">请输入命令：</label>
          <input id="review-input" class="fill-blank-input" placeholder="输入命令..."
                 autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
        </div>
        <div class="attempts-left">剩余尝试：<strong id="review-attempts">3</strong>/3</div>
        <div id="review-fb-feedback" style="margin-top:var(--space-lg);display:none"></div>
        <button id="review-submit" class="btn btn--primary btn--block btn--lg" style="margin-top:var(--space-lg)">
          提交 ✓
        </button>
        <button id="review-fb-next" class="btn btn--primary btn--block btn--lg" style="display:none;margin-top:var(--space-lg)">
          下一题 →
        </button>
      </div>
    `;

    const input = container.querySelector("#review-input");
    const submitBtn = container.querySelector("#review-submit");
    const feedbackDiv = container.querySelector("#review-fb-feedback");
    const nextBtn = container.querySelector("#review-fb-next");
    const attemptsSpan = container.querySelector("#review-attempts");

    setTimeout(() => input.focus(), 300);

    submitBtn.addEventListener("click", () => {
      const val = input.value.trim();
      if (!val) return;

      const score = scoreAnswer(val, cmd.acceptableAnswers || [cmd.command]);

      if (score.match === "exact") {
        results.push({ commandId: cmd.id, quality: 5 });
        Store.recordReview(cmd.id, 5, "fillBlank");
        input.classList.add("correct");
        feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-success);font-weight:600">✅ 正确！</div>`;
        finalize();
      } else if (score.match === "partial") {
        results.push({ commandId: cmd.id, quality: 3 });
        Store.recordReview(cmd.id, 3, "fillBlank");
        input.classList.add("correct");
        feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-warning);font-weight:600">👍 基本正确！标准：${escapeHTML(cmd.acceptableAnswers?.[0] || cmd.command)}</div>`;
        finalize();
      } else {
        attempts--;
        attemptsSpan.textContent = attempts;
        if (attempts > 0) {
          input.classList.add("wrong", "shake");
          feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-danger)">❌ 再试一次</div>`;
          feedbackDiv.style.display = "block";
          setTimeout(() => {
            input.classList.remove("wrong", "shake");
          }, 600);
          input.value = "";
          input.focus();
        } else {
          results.push({ commandId: cmd.id, quality: 1 });
          Store.recordReview(cmd.id, 1, "fillBlank");
          feedbackDiv.innerHTML = `<div style="text-align:center;color:var(--color-danger)">❌ 正确答案：${escapeHTML(cmd.acceptableAnswers?.[0] || cmd.command)}</div>`;
          finalize();
        }
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitBtn.click();
    });

    function finalize() {
      feedbackDiv.style.display = "block";
      input.disabled = true;
      submitBtn.style.display = "none";
      nextBtn.style.display = "block";
    }

    nextBtn.addEventListener("click", () => {
      currentIndex++;
      renderCurrentItem();
    });
  }

  function showSummary() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = results.filter((r) => r.quality >= 3).length;
    const incorrect = results.length - correct;
    const newLearned = results.filter((r) => {
      const srs = Store.getSRSEntry(r.commandId);
      return srs.totalReviews <= 1;
    }).length;
    Store.logActivity(results.length, newLearned, timeSpent);

    container.innerHTML = `
      <div class="quiz-summary" style="padding-top:var(--space-3xl)">
        <div class="quiz-summary__icon">${correct >= results.length * 0.8 ? "🎉" : "💪"}</div>
        <div class="quiz-summary__score">${correct}/${results.length}</div>
        <div class="quiz-summary__label">
          今日复习完成 | ${correct >= results.length * 0.8 ? "表现很棒！" : "继续加油！"}
        </div>
        <div class="quiz-summary__stats">
          <div class="quiz-summary__stat">
            <div class="value">${correct}</div>
            <div class="label">✅ 掌握</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${incorrect}</div>
            <div class="label">📝 需复习</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${newLearned}</div>
            <div class="label">🆕 新学</div>
          </div>
        </div>
        <button class="btn btn--primary btn--block btn--lg" style="margin-bottom:var(--space-md)"
                onclick="Router.navigate('home')">
          返回首页
        </button>
      </div>
    `;
  }

  renderCurrentItem();
}
