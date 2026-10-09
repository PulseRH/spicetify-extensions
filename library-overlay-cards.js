(function libraryOverlayGrid() {
  const STYLE_ID = "library-overlay-grid-style";

  // Spotify hashes most of its library CSS classes per build (css-modules for
  // the grid container and cover, an Encore version prefix on card internals),
  // so every selector here hooks names/attributes that are stable across
  // builds: the library panel's literal component class (YourLibraryX, kept
  // unhashed for Spotify's own error logging), the encore Card's
  // data-encore-id, the card's own layout class names, the artwork <img>
  // state attribute and the card-title element ids.
  const LIBRARY = ".YourLibraryX";
  const CARD = '[data-encore-id="card"]';
  const CARD_MAIN = '[class*="card__main"]';
  const CARD_COLUMN = '[class*="card__column"]';
  // The cover wrapper's class is a per-build hash, so reach it structurally:
  // it is the card's direct-child div that contains the artwork <img>.
  const COVER = '> div:has(img[data-image-status], img[class*="legacy-image"])';

  function injectStyle() {
    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${LIBRARY} ${CARD} {
        --library-overlay-cover-radius: 6px;
        --library-overlay-title-font-size: 14px;
        --library-overlay-owner-font-size: 13px;
        position: relative !important;
        isolation: isolate;
        display: block !important;
        aspect-ratio: 1 / 1;
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
        padding: 4px !important;
        --box-padding: 4px !important;
        border-radius: var(--library-overlay-cover-radius) !important;
        clip-path: inset(0 round var(--library-overlay-cover-radius));
        contain: paint;
      }

      ${LIBRARY} [aria-posinset] {
        align-self: start !important;
      }

      ${LIBRARY} ${CARD} ${COVER} {
        position: absolute !important;
        top: 4px !important;
        right: 4px !important;
        bottom: 4px !important;
        left: 4px !important;
        z-index: 0;
        width: auto !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: var(--library-overlay-cover-radius) !important;
        clip-path: inset(0 round var(--library-overlay-cover-radius));
        overflow: hidden !important;
        contain: paint;
      }

      ${LIBRARY} ${CARD} ${COVER} > div {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        padding-bottom: 0 !important;
        position: relative;
        border-radius: var(--library-overlay-cover-radius) !important;
        clip-path: inset(0 round var(--library-overlay-cover-radius));
        overflow: hidden !important;
      }

      ${LIBRARY} ${CARD} ${COVER} img {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: var(--library-overlay-cover-radius) !important;
      }

      ${LIBRARY} ${CARD} ${COVER}::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 36%;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9) 0%,
          rgba(0, 0, 0, 0.58) 48%,
          rgba(0, 0, 0, 0) 100%
        );
      }

      ${LIBRARY} ${CARD} ${COVER} [role="gridcell"] {
        z-index: 2;
      }

      ${LIBRARY} ${CARD} ${CARD_MAIN} {
        position: absolute !important;
        left: 9px;
        right: 9px;
        bottom: 8px;
        z-index: 3;
        min-width: 0 !important;
        width: auto !important;
        gap: 1px !important;
        pointer-events: none;
        transform: translateY(15px);
        transition: transform 0.15s ease;
      }

      ${LIBRARY} ${CARD}:hover ${CARD_MAIN},
      ${LIBRARY} ${CARD}:focus-within ${CARD_MAIN} {
        transform: translateY(0);
      }

      ${LIBRARY} ${CARD} ${CARD_COLUMN} {
        min-width: 0 !important;
        width: 100% !important;
        gap: 1px !important;
      }

      ${LIBRARY} ${CARD} [id^="card-title-"] {
        color: #fff !important;
        font-size: var(--library-overlay-title-font-size) !important;
        line-height: 1.12 !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.86);
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      ${LIBRARY} ${CARD} ${CARD_COLUMN} > *:not([id^="card-title-"]) {
        color: rgba(255, 255, 255, 0.86) !important;
        font-size: var(--library-overlay-owner-font-size) !important;
        line-height: 1.12 !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.86);
        opacity: 0;
        min-height: 14px;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        transition: opacity 0.15s ease;
      }

      ${LIBRARY} ${CARD}:hover ${CARD_COLUMN} > *:not([id^="card-title-"]),
      ${LIBRARY} ${CARD}:focus-within ${CARD_COLUMN} > *:not([id^="card-title-"]) {
        opacity: 1;
      }

      ${LIBRARY} ${CARD}.library-overlay-folder-card ${CARD_MAIN} {
        transform: translateY(0);
      }

      ${LIBRARY} ${CARD}.library-overlay-folder-card ${CARD_COLUMN} > *:not([id^="card-title-"]) {
        opacity: 1;
      }

      ${LIBRARY} ${CARD}:has([id^="card-title-"][id*=":folder:"]) ${CARD_MAIN} {
        transform: translateY(0);
      }

      ${LIBRARY} ${CARD}:has([id^="card-title-"][id*=":folder:"]) ${CARD_COLUMN} > *:not([id^="card-title-"]) {
        opacity: 1;
      }
    `;

    document.head.appendChild(style);
  }

  function sizeForLength(length, steps) {
    for (const [minLength, size] of steps) {
      if (length >= minLength) return size;
    }

    return steps[steps.length - 1][1];
  }

  function fitOverlayText() {
    document
      .querySelectorAll(`${LIBRARY} ${CARD}`)
      .forEach((card) => {
        const title = card.querySelector('[id^="card-title-"]');
        const owner = card.querySelector(`${CARD_COLUMN} > *:not([id^="card-title-"])`);

        const titleLength = title?.textContent?.trim().length || 0;
        const ownerLength = owner?.textContent?.trim().length || 0;
        const ownerText = owner?.textContent?.trim().toLowerCase() || "";
        const titleId = title?.id || "";
        card.classList.toggle("library-overlay-folder-card", titleId.includes(":folder:") || /\bfolders?\b/.test(ownerText));

        card.style.setProperty(
          "--library-overlay-title-font-size",
          sizeForLength(titleLength, [
            [50, "11px"],
            [40, "11.5px"],
            [30, "12.5px"],
            [0, "14px"],
          ])
        );

        card.style.setProperty(
          "--library-overlay-owner-font-size",
          sizeForLength(ownerLength, [
            [44, "11px"],
            [34, "11.5px"],
            [0, "13px"],
          ])
        );
      });
  }

  function startTextFitObserver() {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitOverlayText);
    };

    fitOverlayText();
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    window.addEventListener("resize", schedule);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectStyle();
      startTextFitObserver();
    }, { once: true });
  } else {
    injectStyle();
    startTextFitObserver();
  }
})();
