// ===== SVG Progress Ring =====

/**
 * Render an SVG progress ring.
 * @param {number} percent - 0-100
 * @param {number} size - Diameter in pixels (default 80)
 * @returns {string} HTML string
 */
function renderProgressRing(percent, size = 80) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return `
    <div class="progress-ring" style="width:${size}px;height:${size}px">
      <svg class="progress-ring__svg" width="${size}" height="${size}">
        <circle
          class="progress-ring__bg"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke-width="${strokeWidth}"
        />
        <circle
          class="progress-ring__fill"
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
        />
      </svg>
      <div class="progress-ring__text">
        <span class="value">${percent}%</span>
        <span class="label">掌握率</span>
      </div>
    </div>
  `;
}
