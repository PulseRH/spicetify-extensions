(function libraryOverlayGrid() {
  const STYLE_ID = "library-overlay-grid-style";

  function injectStyle() {
    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer {
        --library-overlay-cover-radius: 6px;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer > li,
      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer [role="gridcell"] {
        align-self: start !important;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card {
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

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card .main-cardImage-imageWrapper {
        position: absolute !important;
        top: 4px !important;
        right: 4px !important;
        bottom: auto !important;
        left: 4px !important;
        z-index: 0;
        width: calc(100% - 8px) !important;
        height: calc(100% - 8px) !important;
        inline-size: calc(100% - 8px) !important;
        block-size: calc(100% - 8px) !important;
        box-sizing: border-box !important;
        padding: 0 !important;
        max-width: calc(100% - 8px) !important;
        max-height: calc(100% - 8px) !important;
        max-inline-size: calc(100% - 8px) !important;
        max-block-size: calc(100% - 8px) !important;
        aspect-ratio: auto !important;
        overflow: hidden !important;
        border-radius: var(--library-overlay-cover-radius) !important;
        clip-path: inset(0 round var(--library-overlay-cover-radius));
        contain: paint;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card .main-cardImage-image {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: var(--library-overlay-cover-radius) !important;
        clip-path: inset(0 round var(--library-overlay-cover-radius));
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card .main-cardImage-imageWrapper::after {
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
        border-radius: var(--library-overlay-cover-radius);
        clip-path: inset(0 round var(--library-overlay-cover-radius));
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card__main {
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

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:hover .e-10451-card__main,
      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:focus-within .e-10451-card__main {
        transform: translateY(0);
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card__column {
        min-width: 0 !important;
        width: 100% !important;
        gap: 1px !important;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer [id^="card-title-"] {
        color: #fff !important;
        font-size: var(--library-overlay-title-font-size) !important;
        line-height: 1.12 !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.86);
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card__column > *:not([id^="card-title-"]) {
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

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:hover .e-10451-card__column > *:not([id^="card-title-"]),
      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:focus-within .e-10451-card__column > *:not([id^="card-title-"]) {
        opacity: 1;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card.library-overlay-folder-card .e-10451-card__main {
        transform: translateY(0);
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card.library-overlay-folder-card .e-10451-card__column > *:not([id^="card-title-"]) {
        opacity: 1;
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:has([id^="card-title-"][id*=":folder:"]) .e-10451-card__main {
        transform: translateY(0);
      }

      .main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card:has([id^="card-title-"][id*=":folder:"]) .e-10451-card__column > *:not([id^="card-title-"]) {
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
      .querySelectorAll(".main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card")
      .forEach((card) => {
        const title = card.querySelector('[id^="card-title-"]');
        const owner = card.querySelector('.e-10451-card__column > *:not([id^="card-title-"])');

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

  function clampCoverCorners() {
    document
      .querySelectorAll(".main-yourLibraryX-libraryRootlist .main-gridContainer-gridContainer .e-10451-card")
      .forEach((card) => {
        const wrapper = card.querySelector(".main-cardImage-imageWrapper");
        if (!wrapper) return;

        const size = Math.max(0, Math.round(card.getBoundingClientRect().width - 8));
        wrapper.style.setProperty("box-sizing", "border-box", "important");
        wrapper.style.setProperty("padding", "0", "important");
        wrapper.style.setProperty("height", `${size}px`, "important");
        wrapper.style.setProperty("block-size", `${size}px`, "important");
        wrapper.style.setProperty("max-height", `${size}px`, "important");
        wrapper.style.setProperty("max-block-size", `${size}px`, "important");
      });
  }

  function startTextFitObserver() {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        fitOverlayText();
        clampCoverCorners();
      });
    };

    fitOverlayText();
    clampCoverCorners();
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
