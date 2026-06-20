// ===== Statistics Screen =====

function renderStatsScreen(container) {
  const srsData = Store.get("srsData");
  const dailyLog = Store.get("dailyLog");

  // Calculate stats
  const totalCommands = COMMANDS.length;
  const reviewed = COMMANDS.filter((c) => {
    const s = srsData[c.id];
    return s && s.totalReviews > 0;
  }).length;
  const mastered = COMMANDS.filter((c) => {
    const s = srsData[c.id];
    return s && s.easeFactor >= 2.3 && s.repetitions >= 3;
  }).length;

  const totalReviews = Object.values(srsData).reduce(
    (sum, s) => sum + (s.totalReviews || 0),
    0
  );
  const totalCorrect = Object.values(srsData).reduce(
    (sum, s) => sum + (s.totalCorrect || 0),
    0
  );
  const overallAccuracy =
    totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  // Weekly activity bar chart
  const weekData = getWeekActivity(dailyLog);

  // Category mastery
  const categoryStats = CATEGORIES.map((cat) => {
    const cmds = COMMANDS_BY_CATEGORY[cat.id] || [];
    const catMastered = cmds.filter((c) => {
      const s = srsData[c.id];
      return s && s.easeFactor >= 2.3 && s.repetitions >= 3;
    }).length;
    return {
      ...cat,
      total: cmds.length,
      mastered: catMastered,
      pct: Math.round((catMastered / cmds.length) * 100),
    };
  });

  // Streak
  const streak = calculateStreak(dailyLog);

  // Build week bars
  const maxActivity = Math.max(...weekData.map((d) => d.count), 1);
  const weekBarsHTML = weekData
    .map((d) => {
      const height = Math.max(4, Math.round((d.count / maxActivity) * 60));
      return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <span style="font-size:0.7rem;color:var(--color-text-muted)">${d.count}</span>
        <div style="width:28px;height:${height}px;background:${d.isToday ? "var(--color-primary)" : "var(--color-divider)"};border-radius:4px 4px 0 0"></div>
        <span style="font-size:0.6rem;color:var(--color-text-muted)">${d.label}</span>
      </div>`;
    })
    .join("");

  // Build category progress bars
  const categoryBarsHTML = categoryStats
    .map((cat) => {
      const colorVar = `--cat-${cat.id}`;
      return `
      <div style="margin-bottom:var(--space-md)">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:0.8rem">${cat.icon} ${cat.name}</span>
          <span style="font-size:0.75rem;color:var(--color-text-muted)">${cat.mastered}/${cat.total}</span>
        </div>
        <div style="height:6px;background:var(--color-divider);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${cat.pct}%;background:var(${colorVar});border-radius:3px;transition:width 0.5s ease"></div>
        </div>
      </div>`;
    })
    .join("");

  const html = `
    <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl)">
      <div class="app-header" style="padding:0;margin-bottom:var(--space-xl);background:transparent">
        <span class="app-header__title">📈 学习统计</span>
      </div>

      <!-- Overview Cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-2xl)">
        <div class="card" style="text-align:center">
          <div style="font-size:1.8rem;font-weight:700;color:var(--color-primary)">${reviewed}</div>
          <div class="text-muted text-sm">已学习命令</div>
          <div class="text-muted text-sm">/ ${totalCommands}</div>
        </div>
        <div class="card" style="text-align:center">
          <div style="font-size:1.8rem;font-weight:700;color:var(--color-success)">${mastered}</div>
          <div class="text-muted text-sm">已掌握</div>
        </div>
        <div class="card" style="text-align:center">
          <div style="font-size:1.8rem;font-weight:700">${overallAccuracy}%</div>
          <div class="text-muted text-sm">总体正确率</div>
        </div>
        <div class="card" style="text-align:center">
          <div style="font-size:1.8rem;font-weight:700">🔥 ${streak}</div>
          <div class="text-muted text-sm">连续学习天数</div>
        </div>
      </div>

      <!-- Weekly Activity Chart -->
      <div class="card" style="margin-bottom:var(--space-2xl)">
        <h3 style="font-size:0.85rem;margin-bottom:var(--space-lg)">📊 本周学习量</h3>
        <div style="display:flex;justify-content:space-around;align-items:flex-end;height:90px">
          ${weekBarsHTML}
        </div>
      </div>

      <!-- Category Mastery -->
      <div class="card">
        <h3 style="font-size:0.85rem;margin-bottom:var(--space-lg)">📁 分类掌握程度</h3>
        ${categoryBarsHTML}
      </div>

      <!-- Reset button -->
      <div class="text-center" style="margin-top:var(--space-2xl)">
        <button class="btn btn--outline text-sm"
                style="color:var(--color-text-muted);font-size:0.75rem"
                onclick="if(confirm('确定要清除所有学习记录？此操作不可恢复！')){Store.resetAll();Router.navigate('stats')}">
          重置学习记录
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/** Get activity data for the past 7 days */
function getWeekActivity(dailyLog) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const entry = dailyLog.find((e) => e.date === iso);

    days.push({
      label: i === 0 ? "今天" : weekdays[d.getDay()],
      count: entry ? entry.commandsReviewed : 0,
      isToday: i === 0,
    });
  }

  return days;
}
