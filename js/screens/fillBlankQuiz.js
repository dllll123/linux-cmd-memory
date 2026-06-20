// ===== Fill-in-the-Blank Quiz Screen =====

function renderFillBlankQuizScreen(container) {
  const commands = shuffle(COMMANDS).slice(0, 10);
  let currentIndex = 0;
  let startTime = Date.now();
  let attemptsLeft = 3;
  const results = []; // { commandId, quality }

  function renderQuestion() {
    if (currentIndex >= commands.length) {
      showSummary();
      return;
    }

    attemptsLeft = 3;
    const cmd = commands[currentIndex];

    // Build scenario description
    const scenario =
      cmd.scenarios && cmd.scenarios.length > 0
        ? randomPick(cmd.scenarios, 1)[0]
        : cmd.description;

    // Build hint
    const hint =
      cmd.commonOptions && cmd.commonOptions.length > 0
        ? `💡 提示：常用选项有 ${cmd.commonOptions
            .map((o) => `<code>${escapeHTML(o.flag)}</code>`)
            .join("、")}`
        : `💡 提示：这个命令用于 ${cmd.description}`;

    const progressHTML = Array.from(
      { length: commands.length },
      (_, i) => {
        let cls = "";
        if (i < currentIndex) {
          const prevResult = results[i];
          cls =
            prevResult && prevResult.quality >= 3 ? "done" : "wrong-done";
        } else if (i === currentIndex) {
          cls = "current";
        }
        return `<div class="quiz-progress__dot ${cls}"></div>`;
      }
    ).join("");

    const html = `
      <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
          <button class="app-header__back" onclick="Router.navigate('quiz')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">填空 ${currentIndex + 1}/${commands.length}</span>
          <span style="width:36px"></span>
        </div>

        <div class="quiz-progress" style="margin-bottom:var(--space-xl)">
          ${progressHTML}
        </div>

        <div class="fill-blank-scenario">
          <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--space-sm);opacity:0.7">
            📖 使用场景
          </div>
          ${escapeHTML(scenario)}
        </div>

        <div style="margin-bottom:var(--space-lg)">
          <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:var(--space-sm)">
            请输入命令：
          </label>
          <input
            type="text"
            id="fill-blank-input"
            class="fill-blank-input"
            placeholder="例如：tail -f error.log"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
          />
        </div>

        <div class="attempts-left">
          剩余尝试次数：<strong id="attempts-count">3</strong>/3
        </div>

        <div class="fill-blank-hint" id="fill-blank-hint">
          <div class="fill-blank-hint__text">${hint}</div>
        </div>

        <div id="fill-blank-feedback" style="margin-top:var(--space-lg);display:none"></div>

        <div style="margin-top:var(--space-xl);display:flex;gap:var(--space-md)">
          <button id="fill-blank-submit" class="btn btn--primary btn--lg" style="flex:1">
            提交 ✓
          </button>
          <button id="fill-blank-hint-btn" class="btn btn--outline btn--lg">
            💡 提示
          </button>
        </div>

        <button id="fill-blank-next" class="btn btn--primary btn--block btn--lg" style="display:none;margin-top:var(--space-lg)">
          ${currentIndex < commands.length - 1 ? "下一题 →" : "查看结果 📊"}
        </button>
      </div>
    `;

    container.innerHTML = html;

    const input = container.querySelector("#fill-blank-input");
    const submitBtn = container.querySelector("#fill-blank-submit");
    const hintBtn = container.querySelector("#fill-blank-hint-btn");
    const hintDiv = container.querySelector("#fill-blank-hint");
    const feedbackDiv = container.querySelector("#fill-blank-feedback");
    const nextBtn = container.querySelector("#fill-blank-next");
    const attemptsSpan = container.querySelector("#attempts-count");

    // Auto-focus input
    setTimeout(() => input.focus(), 300);

    function handleSubmit() {
      const userInput = input.value.trim();
      if (!userInput) {
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 400);
        return;
      }

      const score = scoreAnswer(userInput, cmd.acceptableAnswers || [cmd.command]);
      let quality;
      let feedbackHTML;

      if (score.match === "exact") {
        quality = 5;
        input.classList.add("correct");
        feedbackHTML = `
          <div style="text-align:center;color:var(--color-success);font-weight:600">
            ✅ 完全正确！
          </div>
          <p style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:var(--space-sm);text-align:center">
            ${escapeHTML(cmd.description)}
          </p>`;
      } else if (score.match === "partial") {
        quality = 3;
        input.classList.add("correct");
        feedbackHTML = `
          <div style="text-align:center;color:var(--color-warning);font-weight:600">
            👍 基本正确！命令名对了
          </div>
          <p style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:var(--space-sm);text-align:center">
            一个更完整的写法可能是：<code style="font-family:var(--font-mono);background:var(--color-bg);padding:2px 8px;border-radius:4px">${escapeHTML(
              cmd.acceptableAnswers ? cmd.acceptableAnswers[0] : cmd.command
            )}</code>
          </p>`;
      } else {
        quality = 1;
        attemptsLeft--;
        attemptsSpan.textContent = attemptsLeft;
        input.classList.add("wrong");
        input.classList.add("shake");
        setTimeout(() => {
          input.classList.remove("wrong");
          input.classList.remove("shake");
        }, 600);

        if (attemptsLeft > 0) {
          hintDiv.classList.add("show");
          feedbackHTML = `
            <div style="text-align:center;color:var(--color-danger);font-weight:600">
              ❌ 不对哦，再试一次吧
            </div>`;
          // Don't finalize yet, allow retry
          setTimeout(() => {
            feedbackDiv.style.display = "block";
            feedbackDiv.innerHTML = feedbackHTML;
          }, 100);
          input.value = "";
          input.focus();
          return;
        } else {
          quality = 1;
          feedbackHTML = `
            <div style="text-align:center;color:var(--color-danger);font-weight:600">
              ❌ 正确答案是 <code style="font-family:var(--font-mono);background:var(--color-danger-light);padding:2px 8px;border-radius:4px">${escapeHTML(
                cmd.acceptableAnswers ? cmd.acceptableAnswers[0] : cmd.command
              )}</code>
            </div>
            <p style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:var(--space-sm);text-align:center">
              ${escapeHTML(cmd.description)}
            </p>`;
        }
      }

      // Finalize
      results.push({ commandId: cmd.id, quality });
      Store.recordReview(cmd.id, quality, "fillBlank");

      input.disabled = true;
      submitBtn.style.display = "none";
      hintBtn.style.display = "none";
      nextBtn.style.display = "block";
      feedbackDiv.style.display = "block";
      feedbackDiv.innerHTML = feedbackHTML;
      hintDiv.classList.add("show");
    }

    submitBtn.addEventListener("click", handleSubmit);

    // Submit on Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });

    // Hint button
    hintBtn.addEventListener("click", () => {
      hintDiv.classList.toggle("show");
    });

    // Next button
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      renderQuestion();
    });
  }

  function showSummary() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correct = results.filter((r) => r.quality >= 3).length;
    const incorrect = results.length - correct;
    const perfect = results.filter((r) => r.quality === 5).length;
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
        <div class="quiz-summary__label">正确 ${correct} 题 | 完美 ${perfect} 题 | 用时 ${formatTime(
      timeSpent
    )}</div>

        <div class="quiz-summary__stats">
          <div class="quiz-summary__stat">
            <div class="value">${correct}</div>
            <div class="label">✅ 答对</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${perfect}</div>
            <div class="label">⭐ 完美</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${incorrect}</div>
            <div class="label">📝 需要复习</div>
          </div>
        </div>

        <button class="btn btn--primary btn--block btn--lg" style="margin-bottom:var(--space-md)"
                onclick="renderFillBlankQuizScreen(document.getElementById('screen-container'))">
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

/**
 * Score a user's answer against acceptable answers.
 * @param {string} userInput
 * @param {string[]} acceptableAnswers
 * @returns {{ match: 'exact'|'partial'|'wrong', quality: number }}
 */
function scoreAnswer(userInput, acceptableAnswers) {
  const normalized = userInput.trim().replace(/\s+/g, " ").toLowerCase();
  const baseCommand = normalized.split(/\s+/)[0];

  let bestMatch = "wrong";

  for (const ans of acceptableAnswers) {
    const ansNorm = ans.trim().replace(/\s+/g, " ").toLowerCase();

    // Exact match
    if (normalized === ansNorm) {
      return { match: "exact", quality: 5 };
    }

    // Partial: base command matches
    if (baseCommand && ansNorm.startsWith(baseCommand)) {
      bestMatch = "partial";
    }
  }

  return { match: bestMatch, quality: bestMatch === "partial" ? 3 : 1 };
}
