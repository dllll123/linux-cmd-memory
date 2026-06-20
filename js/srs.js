// ===== SM-2 Spaced Repetition Algorithm =====
// Based on SuperMemo SM-2, simplified for command memorization

/**
 * Initialize a new SRS entry for a command that hasn't been reviewed yet.
 */
function initializeSRS(commandId) {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    lastReviewDate: null,
    nextReviewDate: todayISO(), // new commands are due immediately
    totalReviews: 0,
    totalCorrect: 0,
    totalWrong: 0,
    streak: 0,
    lastQuality: null,
    // Per-mode tracking
    flashcardCorrect: 0,
    flashcardTotal: 0,
    choiceCorrect: 0,
    choiceTotal: 0,
    fillBlankCorrect: 0,
    fillBlankTotal: 0,
    matchCorrect: 0,
    matchTotal: 0,
  };
}

/**
 * Update SRS entry with a new review result.
 *
 * @param {Object} entry - The existing SRS entry (mutated in place)
 * @param {number} quality - Review quality: 0=blackout, 1=wrong, 2=hard, 3=ok, 4=good, 5=easy
 * @param {string} mode - Quiz mode: 'flashcard' | 'choice' | 'fillBlank' | 'match'
 * @returns {Object} The updated entry
 */
function updateSRS(entry, quality, mode) {
  // Initialize if needed
  if (!entry || typeof entry.easeFactor !== "number") {
    entry = initializeSRS();
  }

  const isCorrect = quality >= 3;

  // Update repetition count and interval
  if (isCorrect) {
    if (entry.repetitions === 0) {
      entry.interval = 1;
    } else if (entry.repetitions === 1) {
      entry.interval = 6;
    } else {
      entry.interval = Math.round(entry.interval * entry.easeFactor);
    }
    entry.repetitions += 1;
    entry.streak += 1;
  } else {
    entry.repetitions = 0;
    entry.interval = 1;
    entry.streak = 0;
  }

  // Update ease factor with SM-2 formula
  entry.easeFactor =
    entry.easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Clamp ease factor
  if (entry.easeFactor < 1.3) entry.easeFactor = 1.3;
  if (entry.easeFactor > 2.5) entry.easeFactor = 2.5;

  // Update review dates
  entry.lastReviewDate = todayISO();
  entry.nextReviewDate = addDays(todayISO(), Math.max(1, entry.interval));

  // Update performance counters
  entry.lastQuality = quality;
  entry.totalReviews += 1;
  if (isCorrect) {
    entry.totalCorrect += 1;
  } else {
    entry.totalWrong += 1;
  }

  // Update per-mode stats
  if (mode) {
    const correctKey = mode + "Correct";
    const totalKey = mode + "Total";
    if (entry[correctKey] !== undefined) {
      entry[totalKey] = (entry[totalKey] || 0) + 1;
      if (isCorrect) entry[correctKey] = (entry[correctKey] || 0) + 1;
    }
  }

  return entry;
}

/**
 * Get the daily review queue.
 * Returns commands that are due for review + new commands, sorted by priority.
 *
 * @param {Array} allCommands - The full COMMANDS array
 * @param {Object} srsData - All SRS entries keyed by command ID
 * @param {Object} settings - User settings (dailyNewCommands, dailyReviewLimit)
 * @returns {Array} Queue of { command, type: 'new'|'review', priority }
 */
function getDailyReviewQueue(allCommands, srsData, settings) {
  const today = todayISO();
  const newLimit = settings.dailyNewCommands || 5;
  const reviewLimit = settings.dailyReviewLimit || 20;

  const reviewQueue = [];
  const newQueue = [];

  for (const cmd of allCommands) {
    const srs = srsData[cmd.id];

    if (!srs || !srs.nextReviewDate) {
      newQueue.push({ command: cmd, type: "new", priority: 0 });
    } else if (srs.nextReviewDate <= today) {
      const overdue = daysBetween(srs.nextReviewDate, today);
      reviewQueue.push({ command: cmd, type: "review", priority: overdue });
    }
  }

  // Sort reviews: most overdue first
  reviewQueue.sort((a, b) => b.priority - a.priority);

  // Combine: due reviews first (they're the most urgent), then new
  const limitedReviews = reviewQueue.slice(0, reviewLimit);
  const limitedNew = newQueue.slice(0, newLimit);

  // Combine and sort: reviews first
  return [...limitedReviews, ...limitedNew];
}

/**
 * Get all commands that are due today (for home screen count display).
 */
function getDueCount(allCommands, srsData) {
  const today = todayISO();
  let reviewCount = 0;
  let newCount = 0;

  for (const cmd of allCommands) {
    const srs = srsData[cmd.id];
    if (!srs || !srs.nextReviewDate) {
      newCount++;
    } else if (srs.nextReviewDate <= today) {
      reviewCount++;
    }
  }

  return { reviewCount, newCount };
}
