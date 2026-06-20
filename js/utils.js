// ===== Utility Functions =====

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n random elements from an array (without replacement) */
function randomPick(arr, n) {
  if (n >= arr.length) return shuffle(arr);
  return shuffle(arr).slice(0, n);
}

/** Get today's date as ISO string (YYYY-MM-DD) */
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** Add n days to an ISO date string, return new ISO string */
function addDays(isoDate, n) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Calculate days between two ISO date strings */
function daysBetween(iso1, iso2) {
  const d1 = new Date(iso1);
  const d2 = new Date(iso2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/** Escape HTML special characters */
function escapeHTML(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

/** Debounce a function */
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/** Format seconds as "M:SS" */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Clamp a number between min and max */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Get SRS status for a command */
function getSRSStatus(srsEntry) {
  if (!srsEntry || !srsEntry.totalReviews) return "new";
  if (srsEntry.easeFactor >= 2.3 && srsEntry.repetitions >= 3)
    return "mastered";
  if (srsEntry.easeFactor >= 1.8) return "learning";
  return "struggling";
}
