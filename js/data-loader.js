// ===== Hot Update: fetch commands data from CDN =====
// Falls back to bundled data.js if network unavailable.

const DATA_CDN_URL =
  "https://cdn.jsdelivr.net/gh/dllll123/linux-cmd-memory@main/js/data.js";

const DATA_LOCAL_KEY = "linux_cmd_data_cache";
const DATA_VERSION_KEY = "linux_cmd_data_version";

/**
 * Replace global COMMANDS with fetched data.
 * The CDN file defines `var COMMANDS`, so eval'ing it will
 * reassign the global variable. We then rebuild lookups.
 */
async function loadRemoteData() {
  try {
    // Try CDN first (jsDelivr, fast in mainland China)
    const response = await fetch(DATA_CDN_URL, {
      cache: "no-cache",
      headers: { Accept: "text/javascript" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const code = await response.text();
    const version = response.headers.get("etag") || response.headers.get("last-modified") || Date.now().toString();

    // Validate that the response contains valid commands data
    if (!code.includes("var COMMANDS") && !code.includes("COMMANDS = [")) {
      throw new Error("Invalid data format from CDN");
    }

    // Eval the fetched code — it will reassign global COMMANDS/CATEGORIES
    // and redefine buildLookups(). We then call buildLookups() ourselves.
    eval(code);
    if (typeof buildLookups === "function") buildLookups();

    // Cache in localStorage for offline use
    try {
      localStorage.setItem(DATA_LOCAL_KEY, code);
      localStorage.setItem(DATA_VERSION_KEY, version);
    } catch (e) {
      // localStorage might be full — ignore
    }

    console.log(
      "✅ 数据已从 CDN 更新，共",
      COMMANDS.length,
      "个命令"
    );
    return true;
  } catch (e) {
    console.warn("⚠️ CDN 更新失败，尝试本地缓存...", e.message);

    // Fallback to localStorage cache
    const cached = localStorage.getItem(DATA_LOCAL_KEY);
    if (cached && cached.includes("COMMANDS = [")) {
      try {
        eval(cached);
        if (typeof buildLookups === "function") buildLookups();
        console.log("📦 已从本地缓存加载数据，共", COMMANDS.length, "个命令");
        return true;
      } catch (e2) {
        console.warn("本地缓存也坏了，使用内置数据");
      }
    }

    // Ultimate fallback: the bundled data.js was already loaded in index.html
    console.log("📋 使用内置数据（离线模式）");
    return false;
  }
}

// Auto-run after page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadRemoteData();
  // Re-render current screen if any
  const container = document.getElementById("screen-container");
  if (container && container.children.length > 0) {
    // Trigger router re-render
    const hash = window.location.hash;
    window.location.hash = "";
    setTimeout(() => {
      window.location.hash = hash || "home";
    }, 50);
  }
});
