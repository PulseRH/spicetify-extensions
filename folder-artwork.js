// Folder Artwork Extension for Spicetify
// Displays folder artwork based on playlist covers inside the folder
// - Less than 4 playlists: Shows first playlist's cover
// - 4+ playlists: Shows 2x2 mosaic of first 4 playlist covers
// - Colored accent border + drop shadow to distinguish from playlists

(function FolderArtwork() {
    if (!Spicetify?.Platform?.RootlistAPI || !Spicetify?.Platform?.History) {
        setTimeout(FolderArtwork, 200);
        return;
    }

    const MOSAIC_SIZE = 128;
    const CACHE_DURATION = 5 * 60 * 1000;
    const LOG = "[FolderArtwork]";
    const IMAGE_CONTAINER_SELECTOR = [
        ".main-cardImage-imageWrapper",
        '[class*="entityImage-imageWrapper"]',
        '[class*="entityImage-imageContainer"]',
        '[class*="cardImage"]',
        '[role="group"][class*="legacy-list-row"][aria-labelledby*=":folder:"]'
    ].join(", ");

    const artworkCache = new Map(); // folderId → { art, color, ts }
    let folderImageMap = new Map(); // folderId → imageUrl[]

    // ── Injected CSS ───────────────────────────────────────────────
    // All visual changes done via CSS to avoid inline style mutations
    // that interfere with Spotify's virtual list / React reconciliation.

    const styleEl = document.createElement("style");
    styleEl.textContent = `
        [data-folder-art] {
            background-size: 90% !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            border-radius: var(--image-border-radius, 4px) !important;
        }
        [data-folder-art]:not([data-folder-art-list]) svg,
        [data-folder-art]:not([data-folder-art-list]) img[src*="folder"] {
            visibility: hidden !important;
        }
        [data-folder-art-list] {
            position: relative !important;
        }
        [data-folder-art-list]::after {
            content: "" !important;
            position: absolute !important;
            left: 8px !important;
            top: 50% !important;
            width: var(--folder-art-size, 40px) !important;
            height: var(--folder-art-size, 40px) !important;
            transform: translateY(-50%) !important;
            background-image: var(--folder-art-url) !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            border-radius: var(--image-border-radius, 4px) !important;
            box-shadow: var(--folder-art-shadow) !important;
            pointer-events: none !important;
            z-index: 2 !important;
        }
        [data-folder-art-list] svg {
            visibility: hidden !important;
        }
        [data-folder-art-list] [class*="legacy-list-row__trailing"] svg,
        [data-folder-art-list] [class*="legacy-list-row__row-button"] svg {
            visibility: visible !important;
        }
        [data-folder-art-compact] {
            min-height: 32px !important;
            padding-left: calc(var(--folder-art-size, 24px) + 16px) !important;
        }
        [data-folder-art-compact]::after {
            left: 8px !important;
        }
    `;
    document.head.appendChild(styleEl);

    // ── Data fetching ──────────────────────────────────────────────

    function spotifyImageToUrl(uri) {
        if (!uri) return null;
        if (uri.startsWith("http")) return uri;
        if (uri.startsWith("spotify:image:")) {
            return "https://i.scdn.co/image/" + uri.slice("spotify:image:".length);
        }
        if (uri.startsWith("spotify:mosaic:")) {
            const hashes = uri.slice("spotify:mosaic:".length).split(":");
            return "https://mosaic.scdn.co/300/" + hashes.join("");
        }
        return null;
    }

    function extractFolderIdFromUri(uri) {
        if (!uri) return null;
        const match = uri.match(/:folder:([a-f0-9]+)$/i);
        return match ? match[1] : null;
    }

    async function fetchLibraryData() {
        try {
            const root = await Spicetify.Platform.RootlistAPI.getContents();
            const map = new Map();
            if (root.items) walkItems(root.items, map);
            folderImageMap = map;
            console.log(LOG, folderImageMap.size + " folders found");
        } catch (e) {
            console.error(LOG, "Failed to fetch library data", e);
        }
    }

    function walkItems(items, map) {
        for (const item of items) {
            if (item.type === "folder" && item.items) {
                const images = [];
                for (const child of item.items) {
                    if (child.type === "playlist" && child.images && child.images.length > 0) {
                        const url = spotifyImageToUrl(child.images[0].url);
                        if (url) images.push(url);
                    }
                }
                const folderId = extractFolderIdFromUri(item.uri);
                if (folderId) map.set(folderId, images);
                walkItems(item.items, map);
            }
        }
    }

    // ── Color extraction ───────────────────────────────────────────

    function extractDominantColor(imgSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    const size = 16;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, size, size);
                    const data = ctx.getImageData(0, 0, size, size).data;

                    let bestR = 80, bestG = 80, bestB = 80;
                    let bestSat = 0;

                    for (let i = 0; i < data.length; i += 16) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        const max = Math.max(r, g, b), min = Math.min(r, g, b);
                        const sat = max === 0 ? 0 : (max - min) / max;
                        const bright = max / 255;
                        const score = sat * (0.3 + bright * 0.7);
                        if (score > bestSat && bright > 0.15 && bright < 0.95) {
                            bestSat = score;
                            bestR = r; bestG = g; bestB = b;
                        }
                    }
                    resolve(`${bestR}, ${bestG}, ${bestB}`);
                } catch {
                    resolve("120, 120, 120");
                }
            };
            img.onerror = () => resolve("120, 120, 120");
            img.src = imgSrc;
        });
    }

    // ── Mosaic generation ──────────────────────────────────────────

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load: " + src));
            img.src = src;
        });
    }

    async function generateMosaic(imageUrls) {
        const canvas = document.createElement("canvas");
        canvas.width = MOSAIC_SIZE;
        canvas.height = MOSAIC_SIZE;
        const ctx = canvas.getContext("2d");
        const half = MOSAIC_SIZE / 2;
        const positions = [[0, 0], [half, 0], [0, half], [half, half]];

        const imgs = await Promise.all(
            imageUrls.slice(0, 4).map(u => loadImage(u).catch(() => null))
        );

        imgs.forEach((img, i) => {
            if (img) ctx.drawImage(img, positions[i][0], positions[i][1], half, half);
        });

        return canvas.toDataURL("image/jpeg", 0.9);
    }

    // ── Artwork resolution ─────────────────────────────────────────

    async function getFolderArtwork(folderId) {
        const cached = artworkCache.get(folderId);
        if (cached && Date.now() - cached.ts < CACHE_DURATION) return cached;

        const images = folderImageMap.get(folderId);
        if (!images || images.length === 0) return null;

        let art;
        if (images.length >= 4) {
            art = await generateMosaic(images);
        } else {
            art = images[0];
        }

        const color = await extractDominantColor(art);

        const result = { art, color, ts: Date.now() };
        artworkCache.set(folderId, result);
        return result;
    }

    // ── DOM processing ─────────────────────────────────────────────
    // Minimal DOM changes: only set/remove 1 attribute + backgroundImage + boxShadow
    // on the image container. All other visual effects handled by the injected CSS.

    function cleanupElement(imageContainer) {
        imageContainer.removeAttribute("data-folder-art");
        imageContainer.removeAttribute("data-folder-art-list");
        imageContainer.removeAttribute("data-folder-art-compact");
        imageContainer.style.backgroundImage = "";
        imageContainer.style.boxShadow = "";
        imageContainer.style.removeProperty("--folder-art-url");
        imageContainer.style.removeProperty("--folder-art-shadow");
        imageContainer.style.removeProperty("--folder-art-size");
    }

    function isLegacyListRow(imageContainer) {
        return imageContainer.matches(
            '[role="group"][class*="legacy-list-row"][aria-labelledby*=":folder:"]'
        );
    }

    function getFolderRow(el) {
        return el.closest(
            "li, " +
            '[role="listitem"], ' +
            '[role="row"], ' +
            '[role="group"][class*="legacy-list-row"], ' +
            '[class*="legacy-list-row"], ' +
            ".main-useDropTarget-base"
        );
    }

    function getFolderArtworkTarget(row) {
        if (!row) return null;
        const legacyRow = row.matches('[role="group"][class*="legacy-list-row"][aria-labelledby*=":folder:"]')
            ? row
            : row.querySelector('[role="group"][class*="legacy-list-row"][aria-labelledby*=":folder:"]');
        if (legacyRow) return legacyRow;

        if (row.matches(IMAGE_CONTAINER_SELECTOR)) return row;
        return row.querySelector(IMAGE_CONTAINER_SELECTOR);
    }

    function rowStillMatchesFolder(row, folderId) {
        const ownLabel = row.getAttribute("aria-labelledby") || "";
        if (ownLabel.includes(folderId)) return true;

        const label = row.querySelector('[aria-labelledby*=":folder:"]');
        const childLabel = label?.getAttribute("aria-labelledby") || "";
        return childLabel.includes(folderId);
    }

    async function applyArtwork(imageContainer, folderId) {
        // Already applied for this exact folder
        if (imageContainer.getAttribute("data-folder-art") === folderId) return;

        // Pre-resolve artwork before touching DOM (all async work happens here)
        const data = await getFolderArtwork(folderId);
        if (!data) return;

        // After async: verify this container is still for the same folder
        const row = getFolderRow(imageContainer);
        if (!row) return;
        if (!rowStillMatchesFolder(row, folderId)) return;

        const { art, color } = data;

        // Only 3 DOM mutations — attribute, backgroundImage, boxShadow
        imageContainer.setAttribute("data-folder-art", folderId);
        const shadow = `inset -3px -3px 0 rgb(${color}), 0 4px 12px rgba(${color}, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)`;
        if (isLegacyListRow(imageContainer)) {
            const isCompact = imageContainer.getBoundingClientRect().height <= 40;
            imageContainer.setAttribute("data-folder-art-list", "true");
            imageContainer.toggleAttribute("data-folder-art-compact", isCompact);
            imageContainer.style.setProperty("--folder-art-url", `url("${art}")`);
            imageContainer.style.setProperty("--folder-art-shadow", shadow);
            imageContainer.style.setProperty("--folder-art-size", isCompact ? "24px" : "40px");
            imageContainer.style.backgroundImage = "";
            imageContainer.style.boxShadow = "";
            return;
        }

        imageContainer.removeAttribute("data-folder-art-list");
        imageContainer.removeAttribute("data-folder-art-compact");
        imageContainer.style.backgroundImage = `url("${art}")`;
        imageContainer.style.boxShadow = shadow;
    }

    function processFolders() {
        const activeFolderContainers = new Set();

        document.querySelectorAll('[aria-labelledby*=":folder:"]').forEach(el => {
            const attr = el.getAttribute("aria-labelledby") || "";
            const match = attr.match(/:folder:([a-f0-9]+)/i);
            if (!match) return;

            const li = el.closest("li");
            const row = li || getFolderRow(el);
            if (!row) return;

            const imageContainer = getFolderArtworkTarget(row);
            if (!imageContainer) return;

            activeFolderContainers.add(imageContainer);
            applyArtwork(imageContainer, match[1]);
        });

        // Clean up containers that were styled but no longer represent a folder (recycled)
        document.querySelectorAll("[data-folder-art]").forEach(el => {
            if (!activeFolderContainers.has(el)) {
                cleanupElement(el);
            }
        });
    }

    // ── Scroll-based trigger ───────────────────────────────────────
    // Use scroll listener instead of MutationObserver on the list.
    // This avoids feedback loops entirely — scroll events are not
    // triggered by DOM modifications.

    let scrollTimer;

    function setupScrollListener() {
        const rootlist = document.querySelector(".YourLibraryX");
        if (!rootlist) {
            setTimeout(setupScrollListener, 500);
            return;
        }

        // Find the scrollable ancestor
        let scrollParent = rootlist.parentElement;
        while (scrollParent && scrollParent.scrollHeight <= scrollParent.clientHeight) {
            scrollParent = scrollParent.parentElement;
        }
        if (!scrollParent) scrollParent = rootlist;

        scrollParent.addEventListener("scroll", () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(processFolders, 100);
        }, { passive: true });

        // Default/compact list rows may be mounted after the first pass.
        // Watch row insertions only; attribute/style changes are ignored to avoid loops.
        new MutationObserver(() => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(processFolders, 150);
        }).observe(rootlist, { childList: true, subtree: true });

        // Also watch for view mode switches (grid/list toggle)
        const libraryContainer = rootlist.closest('[class*="yourLibrary"]') || rootlist;
        new MutationObserver(() => {
            setTimeout(processFolders, 300);
        }).observe(libraryContainer, { attributes: true, attributeFilter: ["class"] });

        console.log(LOG, "Scroll listener attached");
    }

    // ── Public API ─────────────────────────────────────────────────

    function clearCache(folderId) {
        if (folderId) {
            artworkCache.delete(folderId);
        } else {
            artworkCache.clear();
        }
    }

    function debug() {
        const folderLabels = [...document.querySelectorAll('[aria-labelledby*=":folder:"]')];
        const targets = folderLabels.map(el => {
            const attr = el.getAttribute("aria-labelledby") || "";
            const match = attr.match(/:folder:([a-f0-9]+)/i);
            const row = getFolderRow(el);
            const imageContainer = getFolderArtworkTarget(row);

            return {
                folderId: match?.[1] || null,
                hasRow: Boolean(row),
                hasTarget: Boolean(imageContainer),
                rowClass: row?.className || null,
                targetClass: imageContainer?.className || null,
                isLegacyListRow: imageContainer ? isLegacyListRow(imageContainer) : false,
                hasArtworkData: imageContainer ? imageContainer.hasAttribute("data-folder-art") : false
            };
        });

        const summary = {
            foldersInApi: folderImageMap.size,
            folderLabelsInDom: folderLabels.length,
            targetsInDom: targets.filter(item => item.hasTarget).length,
            legacyTargetsInDom: targets.filter(item => item.isLegacyListRow).length,
            appliedTargets: document.querySelectorAll("[data-folder-art]").length,
            targets
        };

        console.table(targets);
        console.log(LOG, "debug", summary);
        return summary;
    }

    async function refresh() {
        clearCache();
        document.querySelectorAll("[data-folder-art]").forEach(cleanupElement);
        await fetchLibraryData();
        processFolders();
    }

    // ── Init ───────────────────────────────────────────────────────

    async function init() {
        console.log(LOG, "Initializing...");
        await fetchLibraryData();
        processFolders();
        setupScrollListener();
        setTimeout(processFolders, 1000);
        setTimeout(processFolders, 3000);

        Spicetify.Platform.History.listen(() => {
            setTimeout(processFolders, 300);
        });

        window.FolderArtwork = { refresh, clearCache, debug };
        console.log(LOG, "Extension loaded");
    }

    init();
})();
