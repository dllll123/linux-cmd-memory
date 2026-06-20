// ===== Match Mode Quiz Screen =====

function renderMatchQuizScreen(container) {
  // Pick 6 commands for a round
  const roundCommands = randomPick(COMMANDS, 6);
  const wrongCounts = {}; // Track wrong attempts per command
  let selectedLeft = null;
  let selectedRight = null;
  let matchedCount = 0;
  let totalWrong = 0;
  let startTime = Date.now();
  let timerInterval;
  let elapsedSeconds = 0;

  const totalPairs = roundCommands.length;

  function render() {
    // Shuffle both columns independently
    const leftItems = shuffle(roundCommands);
    const rightItems = shuffle(
      roundCommands.map((c) => ({
        id: c.id,
        text: c.description.length > 20 ? c.description.slice(0, 20) + "..." : c.description,
      }))
    );

    const timerDisplay = formatTime(elapsedSeconds);

    const html = `
      <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
        <div class="app-header" style="padding:0;margin-bottom:var(--space-lg);background:transparent">
          <button class="app-header__back" onclick="clearInterval(timerInterval);Router.navigate('quiz')">← 返回</button>
          <span class="app-header__title" style="font-size:0.9rem">配对模式</span>
          <span style="width:36px"></span>
        </div>

        <div class="match-timer">⏱ ${timerDisplay}</div>

        <p style="text-align:center;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:var(--space-lg)">
          点击左侧命令，再点击右侧对应描述
        </p>

        <div class="match-grid">
          <div>
            <div class="match-column__header">命令</div>
            <div id="match-left-col">
              ${leftItems
                .map(
                  (c) => `
                <div class="match-item match-item--left" data-id="${c.id}" data-side="left">
                  ${escapeHTML(c.command)}
                </div>`
                )
                .join("")}
            </div>
          </div>
          <div>
            <div class="match-column__header">描述</div>
            <div id="match-right-col">
              ${rightItems
                .map(
                  (d) => `
                <div class="match-item" data-id="${d.id}" data-side="right">
                  ${escapeHTML(d.text)}
                </div>`
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="match-status">
          已配对：<strong>${matchedCount}</strong>/${totalPairs} | 错误：${totalWrong}
        </div>

        <div style="text-align:center;margin-top:var(--space-lg)">
          <button id="match-reset-btn" class="btn btn--outline">🔄 重新开始</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind item clicks
    const allLeft = container.querySelectorAll("#match-left-col .match-item");
    const allRight = container.querySelectorAll("#match-right-col .match-item");

    allLeft.forEach((item) => {
      item.addEventListener("click", () => handleSelect(item, "left"));
    });

    allRight.forEach((item) => {
      item.addEventListener("click", () => handleSelect(item, "right"));
    });

    // Reset button
    container.querySelector("#match-reset-btn").addEventListener("click", () => {
      clearInterval(timerInterval);
      renderMatchQuizScreen(container);
    });
  }

  function handleSelect(item, side) {
    // Don't allow selecting already matched items
    if (item.classList.contains("match-item--matched")) return;

    if (side === "left") {
      // Deselect previous left
      const prev = container.querySelector(".match-item--left.match-item--selected");
      if (prev) prev.classList.remove("match-item--selected");

      if (selectedLeft === item) {
        item.classList.remove("match-item--selected");
        selectedLeft = null;
        return;
      }

      item.classList.add("match-item--selected");
      selectedLeft = item;
    } else {
      // Deselect previous right
      const prev = container.querySelector(
        '#match-right-col .match-item--selected'
      );
      if (prev) prev.classList.remove("match-item--selected");

      if (selectedRight === item) {
        item.classList.remove("match-item--selected");
        selectedRight = null;
        return;
      }

      item.classList.add("match-item--selected");
      selectedRight = item;
    }

    // Check if both sides selected
    if (selectedLeft && selectedRight) {
      const leftId = selectedLeft.dataset.id;
      const rightId = selectedRight.dataset.id;
      const cmd = COMMANDS_BY_ID[leftId];

      if (leftId === rightId) {
        // Correct match!
        selectedLeft.classList.remove("match-item--selected");
        selectedRight.classList.remove("match-item--selected");
        selectedLeft.classList.add("match-item--matched");
        selectedRight.classList.add("match-item--matched");
        matchedCount++;
        wrongCounts[leftId] = wrongCounts[leftId] || 0;

        // Update status
        container.querySelector(".match-status").innerHTML = `
          已配对：<strong>${matchedCount}</strong>/${totalPairs} | 错误：${totalWrong}
        `;

        selectedLeft = null;
        selectedRight = null;

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(30);

        // Check completion
        if (matchedCount >= totalPairs) {
          setTimeout(() => showRoundComplete(), 500);
        }
      } else {
        // Wrong match
        totalWrong++;
        wrongCounts[leftId] = (wrongCounts[leftId] || 0) + 1;

        // Flash red
        selectedLeft.classList.add("match-item--wrong-flash");
        selectedRight.classList.add("match-item--wrong-flash");
        selectedLeft.classList.add("shake");
        selectedRight.classList.add("shake");

        // Update status
        container.querySelector(".match-status").innerHTML = `
          已配对：<strong>${matchedCount}</strong>/${totalPairs} | 错误：${totalWrong}
        `;

        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

        setTimeout(() => {
          if (selectedLeft) {
            selectedLeft.classList.remove(
              "match-item--selected",
              "match-item--wrong-flash",
              "shake"
            );
          }
          if (selectedRight) {
            selectedRight.classList.remove(
              "match-item--selected",
              "match-item--wrong-flash",
              "shake"
            );
          }
          selectedLeft = null;
          selectedRight = null;
        }, 500);
      }
    }
  }

  function showRoundComplete() {
    clearInterval(timerInterval);

    // Record SRS for each command
    roundCommands.forEach((cmd) => {
      const wrong = wrongCounts[cmd.id] || 0;
      let quality;
      if (wrong === 0) quality = 5;
      else if (wrong === 1) quality = 3;
      else quality = 1;
      Store.recordReview(cmd.id, quality, "match");
    });

    const accuracy =
      totalPairs + totalWrong > 0
        ? Math.round((totalPairs / (totalPairs + totalWrong)) * 100)
        : 100;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Log activity
    const newLearned = roundCommands.filter((cmd) => {
      const srs = Store.getSRSEntry(cmd.id);
      return srs.totalReviews <= 1;
    }).length;
    Store.logActivity(totalPairs, newLearned, timeSpent);

    container.innerHTML = `
      <div class="quiz-summary" style="padding-top:var(--space-3xl)">
        <div class="quiz-summary__icon">${
          accuracy >= 80 ? "🎉" : "💪"
        }</div>
        <div class="quiz-summary__score">${totalPairs}/${totalPairs}</div>
        <div class="quiz-summary__label">完成配对 | 用时 ${formatTime(timeSpent)} | 错误 ${totalWrong} 次</div>

        <div class="quiz-summary__stats">
          <div class="quiz-summary__stat">
            <div class="value">${accuracy}%</div>
            <div class="label">准确率</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${totalWrong}</div>
            <div class="label">🔴 错误次数</div>
          </div>
          <div class="quiz-summary__stat">
            <div class="value">${formatTime(timeSpent)}</div>
            <div class="label">⏱ 用时</div>
          </div>
        </div>

        <button class="btn btn--primary btn--block btn--lg" style="margin-bottom:var(--space-md)"
                onclick="renderMatchQuizScreen(document.getElementById('screen-container'))">
          再来一轮
        </button>
        <button class="btn btn--outline btn--block btn--lg"
                onclick="Router.navigate('quiz')">
          返回练习菜单
        </button>
      </div>
    `;
  }

  // Start timer
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    const timerEl = container.querySelector(".match-timer");
    if (timerEl) timerEl.textContent = `⏱ ${formatTime(elapsedSeconds)}`;
  }, 1000);

  render();
}
