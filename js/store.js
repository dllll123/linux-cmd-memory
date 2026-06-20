// ===== Central State Store =====
// A simple reactive-ish store using a pub/sub pattern.

const Store = {
  _state: {
    srsData: {},
    settings: {},
    dailyLog: [],
    currentScreen: null,
    currentQuizSession: null,
  },

  _listeners: {},

  /** Initialize store from localStorage */
  init() {
    this._state.srsData = loadSRS();
    this._state.settings = loadSettings();
    this._state.dailyLog = loadDailyLog();
  },

  /** Get a value from the store */
  get(key) {
    return this._state[key];
  },

  /** Set a value and notify listeners */
  set(key, value) {
    this._state[key] = value;
    this._notify(key, value);
  },

  /** Subscribe to changes on a key */
  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    // Return unsubscribe function
    return () => {
      this._listeners[key] = this._listeners[key].filter((f) => f !== fn);
    };
  },

  /** Notify listeners */
  _notify(key, value) {
    (this._listeners[key] || []).forEach((fn) => fn(value));
  },

  // ===== SRS helpers =====

  /** Get SRS entry for a command, initializing if needed */
  getSRSEntry(commandId) {
    if (!this._state.srsData[commandId]) {
      this._state.srsData[commandId] = initializeSRS(commandId);
    }
    return this._state.srsData[commandId];
  },

  /** Record a review result and persist */
  recordReview(commandId, quality, mode) {
    const entry = this.getSRSEntry(commandId);
    updateSRS(entry, quality, mode);
    saveSRS(this._state.srsData);
    this._notify("srsData", this._state.srsData);
    return entry;
  },

  /** Get due counts for today */
  getDueCount() {
    return getDueCount(COMMANDS, this._state.srsData);
  },

  /** Get daily review queue */
  getDailyQueue() {
    return getDailyReviewQueue(
      COMMANDS,
      this._state.srsData,
      this._state.settings
    );
  },

  /** Log daily activity */
  logActivity(reviewed, learned, time) {
    logTodayActivity(reviewed, learned, time);
  },

  /** Reset all progress (for testing) */
  resetAll() {
    clearAllData();
    this._state.srsData = {};
    this._state.dailyLog = [];
    this._state.settings = { ...DEFAULT_SETTINGS };
    this._notify("srsData", {});
  },
};
