// /assets-shared/js/manufacturing-location-modal.js
// Fetch partial HTML (like _enquiry-modal.html) and inject into #modal-manufacturing-location.
//
// openModal('modal-manufacturing-location', { manufacturingSlug: 'manchester' })

export const MANUFACTURING_MODAL_ID = "modal-manufacturing-location";
const PENDING_SLUG_KEY = "steadfastOpenManufacturingSlug";

const htmlCache = new Map();
const inflightFetches = new Map();

/** Site root from assets/index.js (works from nested routes, e.g. manufacturing-locations/). */
function resolveSiteRoot() {
  const scriptEl = document.querySelector('script[src*="index.js"]');
  if (!scriptEl) return "/";
  const url = new URL(scriptEl.src, window.location.href);
  const assetsIdx = url.pathname.lastIndexOf("/assets/");
  if (assetsIdx === -1) return "/";
  return url.pathname.slice(0, assetsIdx + 1);
}

/** Injected modal HTML uses paths relative to the page URL; rewrite to site root. */
function rewriteModalAssetPaths(html) {
  const root = resolveSiteRoot();
  return html
    .replace(/src=(["'])\.\/img\//g, `src=$1${root}img/`)
    .replace(/src=(["'])\/img\//g, `src=$1${root}img/`);
}

function resolveManufacturingModalUrl(slug) {
  const root = resolveSiteRoot();
  return `${window.location.origin}${root}modal-hub-${slug}.html`;
}

function ensureManufacturingModalElement() {
  let modal = document.getElementById(MANUFACTURING_MODAL_ID);
  if (!modal) {
    modal = document.createElement("div");
    modal.id = MANUFACTURING_MODAL_ID;
    modal.className = "modalWindow hidden";
    document.body.appendChild(modal);
  }
  return modal;
}

/** Show the overlay immediately while hub HTML is fetched (first click feedback). */
export function showManufacturingModalLoading() {
  const modal = ensureManufacturingModalElement();
  modal.innerHTML =
    '<div class="manufacturing-loc-modal-loading" role="status" aria-live="polite">Loading location…</div>';
  modal.classList.remove("hidden");
  modal.classList.add("is-open");
  modal.style.display = "";
  document.body.classList.add("overflow-hidden");
  return modal;
}

async function fetchManufacturingModalHtml(slug) {
  if (htmlCache.has(slug)) {
    return htmlCache.get(slug);
  }

  if (inflightFetches.has(slug)) {
    return inflightFetches.get(slug);
  }

  const modalUrl = resolveManufacturingModalUrl(slug);
  const fetchPromise = (async () => {
    const res = await fetch(`${modalUrl}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load manufacturing hub (${res.status})`);
    const raw = await res.text();
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const card =
      doc.getElementById("manufacturing-hub-modal-card") ||
      doc.querySelector(".modalContent.manufacturing-loc-modal-panel") ||
      doc.querySelector(".modalContent");
    const injectHtml = rewriteModalAssetPaths(card ? card.outerHTML : raw);
    htmlCache.set(slug, injectHtml);
    return injectHtml;
  })();

  inflightFetches.set(slug, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    inflightFetches.delete(slug);
  }
}

/** Warm the cache when the locations section nears the viewport. */
export function prefetchManufacturingModals(slugs) {
  slugs.forEach((slug) => {
    const id = String(slug || "").trim();
    if (!id || htmlCache.has(id) || inflightFetches.has(id)) return;
    fetchManufacturingModalHtml(id).catch(() => {});
  });
}

/** After redirect from a standalone modal-hub-*.html preview URL, open the overlay on index. */
export function openPendingManufacturingModalFromRedirect() {
  const slug = sessionStorage.getItem(PENDING_SLUG_KEY);
  if (!slug) return;
  sessionStorage.removeItem(PENDING_SLUG_KEY);
  if (typeof window.openModal === "function") {
    window.openModal(MANUFACTURING_MODAL_ID, { manufacturingSlug: slug });
  }
}

/** Wire close/back controls to dismiss the overlay only (never navigate away). */
export function bindManufacturingModalClose(modal) {
  if (!modal) return;
  modal.querySelectorAll(".manufacturing-loc-modal-close, .modalClose").forEach((btn) => {
    if (btn.dataset.bound === "true") return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.closeModal === "function") {
        window.closeModal(MANUFACTURING_MODAL_ID);
      }
    });
    btn.dataset.bound = "true";
  });
}

export async function initManufacturingLocationModal(slug) {
  const id = String(slug || "").trim();
  if (!id) {
    console.error("initManufacturingLocationModal: manufacturingSlug required");
    return false;
  }

  const modal = ensureManufacturingModalElement();
  let injectHtml;

  try {
    injectHtml = await fetchManufacturingModalHtml(id);
  } catch (err) {
    console.error("Manufacturing hub modal load failed:", err);
    alert("Unable to load this location. Please use the full page link or try again later.");
    return false;
  }

  modal.innerHTML = injectHtml;
  bindManufacturingModalClose(modal);
  return true;
}
