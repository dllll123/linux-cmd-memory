// ===== localStorage Persistence Layer =====

const STORAGE_KEYS = {
  SRS: "linux_cmd_srs",
  SETTINGS: "linux_cmd_settings",
  DAILY_LOG: "linux_cmd_daily_log",
};

const DEFAULT_SETTINGS = {
  dailyNewCommands: 5,
  dailyReviewLimit: 20,
};

// ===== SRS Data =====

function loadSRS() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SRS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to load SRS data, resetting.", e);
    return {};
  }
}

function saveSRS(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save SRS data (localStorage full?)", e);
  }
}

function getSRSEntry(commandId) {
  const srs = loadSRS();
  return srs[commandId] || null;
}

function upsertSRSEntry(commandId, entry) {
  const srs = loadSRS();
  srs[commandId] = entry;
  saveSRS(srs);
}

// ===== Settings =====

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

// ===== Daily Log =====

function loadDailyLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveDailyLog(log) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(log));
  } catch (e) {
    console.error("Failed to save daily log", e);
  }
}

function logTodayActivity(commandsReviewed, newLearned, timeSpent) {
  const log = loadDailyLog();
  const today = todayISO();
  const existing = log.find((entry) => entry.date === today);
  if (existing) {
    existing.commandsReviewed += commandsReviewed;
    existing.newLearned += newLearned;
    existing.timeSpent += timeSpent;
  } else {
    log.push({ date: today, commandsReviewed, newLearned, timeSpent });
  }
  saveDailyLog(log);
}

// ===== Clear all data (for testing/reset) =====

function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) =>
    localStorage.removeItem(key)
  );
}
