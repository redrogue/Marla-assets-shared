// /assets-shared/js/manufacturing-location-modal.js
// Fetch partial HTML (like _enquiry-modal.html) and inject into #modal-manufacturing-location.
//
// openModal('modal-manufacturing-location', { manufacturingSlug: 'manchester' })

export async function initManufacturingLocationModal(slug) {
  const id = String(slug || "").trim();
  if (!id) {
    console.error("initManufacturingLocationModal: manufacturingSlug required");
    return;
  }

  let modal = document.getElementById("modal-manufacturing-location");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-manufacturing-location";
    modal.className = "modalWindow hidden";
    document.body.appendChild(modal);
  }

  const scriptEl = document.querySelector('script[src*="index.js"]');
  const baseUrl = scriptEl ? scriptEl.src : window.location.href;
  const modalUrl = new URL(`../_modal-${id}.html`, baseUrl).href;
  let injectHtml;
  try {
    const res = await fetch(`${modalUrl}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load manufacturing hub (${res.status})`);
    const raw = await res.text();
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const card =
      doc.getElementById("manufacturing-hub-modal-card") ||
      doc.querySelector(".modalContent.manufacturing-loc-modal-panel") ||
      doc.querySelector(".modalContent");
    injectHtml = card ? card.outerHTML : raw;
  } catch (err) {
    console.error("Manufacturing hub modal load failed:", err);
    alert("Unable to load this location. Please use the full page link or try again later.");
    return;
  }

  modal.innerHTML = injectHtml;

  const closeBtn = modal.querySelector(".modalClose");
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.closeModal("modal-manufacturing-location");
    };
  }
}
