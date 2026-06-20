// ===== Home Screen (Dashboard) =====

function renderHomeScreen(container) {
  const srsData = Store.get("srsData");
  const due = Store.getDueCount();
  const totalDue = due.reviewCount + Math.min(
    due.newCount,
    Store.get("settings").dailyNewCommands
  );

  // Calculate total mastered
  const mastered = COMMANDS.filter((c) => {
    const s = srsData[c.id];
    return s && s.easeFactor >= 2.3 && s.repetitions >= 3;
  }).length;

  const total = COMMANDS.length;
  const progressPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  // Get streak from daily log
  const dailyLog = Store.get("dailyLog");
  const streak = calculateStreak(dailyLog);

  // Get weak commands (lowest easeFactor, but reviewed at least once)
  const weakCommands = getWeakCommands(COMMANDS, srsData, 3);

  const html = `
    <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl);">
      <!-- Greeting & Streak -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-xl);">
        <div>
          <h2 style="font-size:1.3rem;font-weight:700">📋 Linux 命令记忆</h2>
          <p class="text-muted text-sm" style="margin-top:2px">${todayISO()}</p>
        </div>
        <div style="text-align:center;background:var(--color-warning-light);border-radius:var(--radius);padding:var(--space-sm) var(--space-lg);">
          <span style="font-size:1.2rem;">🔥</span>
          <div style="font-size:0.85rem;font-weight:600">${streak} 天</div>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="card" style="margin-bottom:var(--space-xl);text-align:center">
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-2xl)">
          ${renderProgressRing(progressPct, 80)}
          <div style="text-align:left">
            <div style="margin-bottom:var(--space-md)">
              <div style="font-size:1.5rem;font-weight:700">${totalDue}</div>
              <div class="text-muted text-sm">今日待复习</div>
            </div>
            <div>
              <div style="font-size:1.5rem;font-weight:700;color:var(--color-success)">${mastered}</div>
              <div class="text-muted text-sm">已掌握 / ${total}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-2xl)">
        <button class="card" style="text-align:center;cursor:pointer;border:2px solid var(--color-primary);background:var(--color-primary-light)"
                onclick="Router.navigate('review')">
          <div style="font-size:1.8rem">📅</div>
          <div style="font-weight:600;color:var(--color-primary);margin-top:var(--space-xs)">今日复习</div>
          <div class="text-muted text-sm">混合模式·智能出题</div>
        </button>
        <button class="card" style="text-align:center;cursor:pointer"
                onclick="Router.navigate('quiz/flashcard')">
          <div style="font-size:1.8rem">🃏</div>
          <div style="font-weight:600;margin-top:var(--space-xs)">快速闪卡</div>
          <div class="text-muted text-sm">浏览全部命令</div>
        </button>
      </div>

      <!-- Weak Commands Section -->
      ${
        weakCommands.length > 0
          ? `
      <h3 style="font-size:0.9rem;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:var(--space-md);letter-spacing:0.5px">
        需要加强的命令
      </h3>
      ${weakCommands
        .map(
          (c) => `
      <div class="cmd-card" style="margin-bottom:var(--space-sm)"
           onclick="showCommandDetail(COMMANDS_BY_ID['${c.id}'], Store.get('srsData')['${c.id}'])">
        <div class="cmd-card__icon cmd-card__icon--${c.categoryId}" style="background:var(--color-danger)">
          ${c.command.slice(0, 2).toUpperCase()}
        </div>
        <div class="cmd-card__info">
          <div class="cmd-card__name">${escapeHTML(c.command)}</div>
          <div class="cmd-card__desc">${escapeHTML(c.description)}</div>
        </div>
        <span style="font-size:0.7rem;color:var(--color-danger)">需复习</span>
      </div>`
        )
        .join("")}`
          : ""
      }

      <!-- Reset button (dev utility) -->
      <div class="text-center" style="margin-top:var(--space-2xl)">
        <button class="btn btn--outline text-sm"
                style="color:var(--color-text-muted);font-size:0.75rem"
                onclick="if(confirm('确定要清除所有学习记录？此操作不可恢复！')){Store.resetAll();renderHomeScreen(document.getElementById('screen-container'))}">
          重置学习记录
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/** Calculate current learning streak in days */
function calculateStreak(dailyLog) {
  if (!dailyLog || dailyLog.length === 0) return 0;

  const sorted = [...dailyLog].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const today = todayISO();
  let streak = 0;
  let checkDate = today;

  for (const entry of sorted) {
    if (entry.date === checkDate) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else if (
      daysBetween(entry.date, checkDate) === 1 &&
      entry.date < checkDate
    ) {
      streak++;
      checkDate = entry.date;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  // Also check if today has activity
  const todayEntry = dailyLog.find((e) => e.date === today);
  if (!todayEntry && streak > 0) {
    // Streak might be broken if no activity today AND yesterday
    const yesterday = addDays(today, -1);
    const yesterdayEntry = dailyLog.find((e) => e.date === yesterday);
    if (!yesterdayEntry) return 0;
  }

  return streak;
}

/** Get the weakest commands by SRS easeFactor */
function getWeakCommands(allCommands, srsData, n) {
  const reviewed = allCommands
    .filter((c) => {
      const s = srsData[c.id];
      return s && s.totalReviews > 0 && (!s.easeFactor || s.easeFactor < 2.3);
    })
    .sort((a, b) => {
      const ae = (srsData[a.id] && srsData[a.id].easeFactor) || 2.5;
      const be = (srsData[b.id] && srsData[b.id].easeFactor) || 2.5;
      return ae - be;
    });

  return reviewed.slice(0, n);
}
