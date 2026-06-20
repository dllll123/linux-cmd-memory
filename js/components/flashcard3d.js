// ===== 3D Flashcard Component =====

/**
 * Create a 3D flashcard element.
 * @param {Object} options
 * @param {string} options.frontHTML - HTML for the front face
 * @param {string} options.backHTML - HTML for the back face
 * @param {Function} options.onFlip - Called when card is flipped
 * @returns {HTMLElement}
 */
function createFlashcard({ frontHTML, backHTML, onFlip }) {
  const container = document.createElement("div");
  container.className = "flashcard-container";

  let isFlipped = false;

  container.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">
        ${frontHTML}
      </div>
      <div class="flashcard-back">
        ${backHTML}
      </div>
    </div>
  `;

  const inner = container.querySelector(".flashcard-inner");

  // Flip on tap
  container.addEventListener("click", () => {
    flip();
  });

  function flip() {
    isFlipped = !isFlipped;
    if (isFlipped) {
      inner.classList.add("flipped");
    } else {
      inner.classList.remove("flipped");
    }
    if (onFlip) onFlip(isFlipped);
  }

  // Expose methods
  container.flip = flip;
  container.isFlipped = () => isFlipped;
  container.reset = () => {
    isFlipped = false;
    inner.classList.remove("flipped");
  };

  // Swipe support
  let startX = 0;
  let startY = 0;

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    // Horizontal swipe more than vertical -> treat as skip gesture
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      container.dispatchEvent(
        new CustomEvent("swipe", { detail: { direction: dx > 0 ? "right" : "left" } })
      );
    }
  });

  return container;
}
