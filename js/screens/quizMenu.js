// ===== Quiz Mode Menu Screen =====

function renderQuizMenuScreen(container) {
  const due = Store.getDueCount();
  const totalDue = due.reviewCount + Math.min(
    due.newCount,
    Store.get("settings").dailyNewCommands
  );

  const html = `
    <div class="screen active" style="padding:var(--space-lg);padding-bottom:var(--space-3xl);">
      <div class="app-header" style="padding:0;margin-bottom:var(--space-xl)">
        <span class="app-header__title">📝 选择练习模式</span>
      </div>

      <!-- Daily Review Card -->
      <button class="quiz-mode-card quiz-mode-card--full"
              style="margin-bottom:var(--space-xl);padding:var(--space-xl)"
              onclick="Router.navigate('review')">
        <div style="font-size:2rem;margin-bottom:var(--space-sm)">📅</div>
        <div style="font-size:1.1rem;font-weight:700">今日复习</div>
        <div class="quiz-mode-card__desc">
          混合模式 · 智能出题 · ${totalDue} 个命令待复习
        </div>
      </button>

      <!-- Mode Grid -->
      <div class="quiz-mode-grid">
        <button class="quiz-mode-card" onclick="Router.navigate('quiz/flashcard')">
          <div class="quiz-mode-card__icon">🃏</div>
          <div class="quiz-mode-card__name">闪卡模式</div>
          <div class="quiz-mode-card__desc">快速浏览·自评掌握</div>
        </button>

        <button class="quiz-mode-card" onclick="Router.navigate('quiz/choice')">
          <div class="quiz-mode-card__icon">📋</div>
          <div class="quiz-mode-card__name">选择题模式</div>
          <div class="quiz-mode-card__desc">看描述·选命令</div>
        </button>

        <button class="quiz-mode-card" onclick="Router.navigate('quiz/fillblank')">
          <div class="quiz-mode-card__icon">✍️</div>
          <div class="quiz-mode-card__name">填空模式</div>
          <div class="quiz-mode-card__desc">场景输入·检验拼写</div>
        </button>

        <button class="quiz-mode-card" onclick="Router.navigate('quiz/match')">
          <div class="quiz-mode-card__icon">🔗</div>
          <div class="quiz-mode-card__name">配对模式</div>
          <div class="quiz-mode-card__desc">命令连线·加强联想</div>
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
