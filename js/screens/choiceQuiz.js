// ===== Multiple Choice Quiz Screen =====

function renderChoiceQuizScreen(container) {
  const commands = shuffle(COMMANDS).slice(0, 10);
  let currentIndex = 0;
  let startTime = Date.now();
  const results = []; // { commandId, correct }
  let answered = false;

  const totalQuestions = commands.length;

  function renderQuestion() {
    if (currentIndex >= totalQuestions) {
      showSummary();
      return;
    }

    answered = false;
    const cmd = commands[currentIndex];

    // Pick 3 distractors, preferring same category
    const distractors = pickDistractors(cmd, 3);

    // Build options array with one correct
    const options = shuffle([
      { command: cmd.command, isCorrect: true },
      ...distractors.map((d) => ({ command: d.command, isCorrect: false })),
    ]);

    const labels = ["A", "B", "C", "D"];

    const progressBarHTML = Array.from(
      { length: totalQuestions },
      (_, i) => {
        let cls = "";
        if (i < currentIndex) {
          const prevResult = results[i];
          cls = prevResult && prevResult.correct ? "done" : "wrong-done";
        } else if (i === currentIndex) {
          cls = "current";
        }
        return `<div class="quiz-progress__dot ${cls}"></div>`;
      }
    ).join("");

    // Pick a scenario or the description for the question
    const scenario =
      cmd.scenarios && cmd.scenarios.length > 0
        ? randomPick(cmd.scenarios, 1)[0]
        : cmd.description;

    const html = `
      <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
          <button class="app-header__back" onclick="Router.navigate('quiz')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">选择题 ${currentIndex + 1}/${totalQuestions}</span>
          <span style="width:36px"></span>
        </div>

        <div class="quiz-progress" style="margin-bottom:var(--space-xl)">
          ${progressBarHTML}
        </div>

        <div class="quiz-description">
          <span class="icon">🤔</span>
          以下哪个命令可以用于：<br>
          <strong>"${escapeHTML(scenario)}"</strong>？
        </div>

        <div class="quiz-options-list">
          ${options
            .map(
              (opt, i) => `
            <button class="quiz-option" data-index="${i}" data-command="${escapeHTML(
                opt.command
              )}" data-correct="${opt.isCorrect}">
              <span class="quiz-option__letter">${labels[i]}</span>
              <strong style="font-family:var(--font-mono)">${escapeHTML(
                opt.command
              )}</strong>
            </button>
          `
            )
            .join("")}
        </div>

        <div id="choice-feedback" style="margin-top:var(--space-lg);display:none"></div>

        <div style="margin-top:var(--space-xl);text-align:center">
          <button id="choice-next-btn" class="btn btn--primary btn--lg" style="display:none">
            ${currentIndex < totalQuestions - 1 ? "下一题 →" : "查看结果 📊"}
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind option clicks
    const optionButtons = container.querySelectorAll(".quiz-option");
    const feedbackDiv = container.querySelector("#choice-feedback");
    const nextBtn = container.querySelector("#choice-next-btn");

    optionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        const isCorrect = btn.dataset.correct === "true";
        const correctBtn = container.querySelector(
          '.quiz-option[data-correct="true"]'
        );

        // Highlight chosen option
        if (isCorrect) {
          btn.classList.add("quiz-option--correct");
          feedbackDiv.style.display = "block";
          feedbackDiv.innerHTML = `
            <div style="text-align:center;color:var(--color-success);font-weight:600">
              ✅ 正确！<code style="font-family:var(--font-mono);background:var(--color-success-light);padding:2px 8px;border-radius:4px">${escapeHTML(
                cmd.command
              )}</code>
            </div>
            <p style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:var(--space-sm)">
              ${escapeHTML(cmd.description)}
            </p>
          `;
        } else {
          btn.classList.add("quiz-option--wrong");
          btn.classList.add("shake");
          correctBtn.classList.add("quiz-option--correct");
          feedbackDiv.style.display = "block";
          feedbackDiv.innerHTML = `
            <div style="text-align:center;color:var(--color-danger);font-weight:600">
              ❌ 错误！正确答案是 <code style="font-family:var(--font-mono);background:var(--color-danger-light);padding:2px 8px;border-radius:4px">${escapeHTML(
                cmd.command
              )}</code>
            </div>
            <p style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:var(--space-sm)">
              ${escapeHTML(cmd.description)}
            </p>
          `;
        }

        // Disable all options
        optionButtons.forEach((b) => b.classList.add("quiz-option--disabled"));

        // Record result
        results.push({ commandId: cmd.id, correct: isCorrect });
        const quality = isCorrect ? 4 : 1;
        Store.recordReview(cmd.id, quality, "choice");

        // Show next button
        nextBtn.style.display = "inline-flex";
        nextBtn.focus();
      });
    });

    // Next button
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      renderQuestion();
    });
  }

  function showSummary() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = results.filter((r) => r.correct).length;
    const incorrect = results.length - correct;
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
            <div class="label">✅ 答对</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${incorrect}</div>
            <div class="label">❌ 答错</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${Math.round(
              (correct / results.length) * 100
            )}%</div>
            <div class="label">正确率</div>
          </div>
        </div>

        <button class="btn btn--primary btn--block btn--lg" style="margin-bottom:var(--space-md)"
                onclick="renderChoiceQuizScreen(document.getElementById('screen-container'))">
          再来一轮
        </button>
        <button class="btn btn--outline btn--block btn--lg"
                onclick="Router.navigate('quiz')">
          返回练习菜单
        </button>
      </div>
    `;
  }

  renderQuestion();
}

/** Pick n distractors, preferring same-category items */
function pickDistractors(correctCmd, n) {
  const sameCategory = COMMANDS_BY_CATEGORY[correctCmd.categoryId].filter(
    (c) => c.id !== correctCmd.id
  );
  const others = COMMANDS.filter(
    (c) => c.id !== correctCmd.id && c.categoryId !== correctCmd.categoryId
  );

  let pool = [...sameCategory, ...shuffle(others)];
  // Deduplicate by command id
  const seen = new Set();
  pool = pool.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return randomPick(pool, Math.min(n, pool.length));
}
