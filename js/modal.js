// /assets-shared/js/modal.js
console.log("modal.js loaded");

import { initContactModal } from "./enquiry-modal.js";
import {
  bindManufacturingModalClose,
  initManufacturingLocationModal,
  MANUFACTURING_MODAL_ID,
  openPendingManufacturingModalFromRedirect,
} from "./manufacturing-location-modal.js";

let manufacturingModalHistoryActive = false;
let suppressManufacturingPopstate = false;

async function openModal(modalId, options = {}) {
  // Close any open modals
  document.querySelectorAll(".modalWindow").forEach(m => {
    const isDialog = m.tagName?.toLowerCase() === "dialog";
    if (isDialog) {
      // Properly close and clear inline styles so CSS can control visibility
      if (m.hasAttribute("open") && m.close) m.close();
      m.style.removeProperty("display");
    } else {
      m.classList.remove("is-open");
      m.classList.add("hidden");
      m.style.display = "none";
    }
  });

  let modal = document.getElementById(modalId);

  // Special case: load Enquiry modal dynamically
  if (modalId === "modal-enquiries") {
    await initContactModal(options);
    modal = document.getElementById("modal-enquiries");
  }

  if (modalId === MANUFACTURING_MODAL_ID) {
    await initManufacturingLocationModal(options.manufacturingSlug);
    modal = document.getElementById(MANUFACTURING_MODAL_ID);
    bindManufacturingModalClose(modal);
  }

  // Show modal
  if (modal) {
    const isDialog = modal.tagName?.toLowerCase() === "dialog";
    if (isDialog && modal.showModal) {
      // Ensure no stale inline display hides the dialog
      modal.style.removeProperty("display");
      modal.showModal();
    } else {
      // Non-dialog modals: use CSS class to control visibility/centering
      modal.classList.remove("hidden");
      modal.classList.add("is-open");
      // Clear inline display so CSS can take over; legacy code may set it
      modal.style.display = "";
    }

    if (modalId === MANUFACTURING_MODAL_ID && !manufacturingModalHistoryActive) {
      history.pushState({ steadfastManufacturingModal: true }, "");
      manufacturingModalHistoryActive = true;
    }
  }

  document.body.classList.add("overflow-hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const syncManufacturingHistory =
    modalId === MANUFACTURING_MODAL_ID && manufacturingModalHistoryActive;

  // Call reset function if it exists (for enquiry modal)
  if (modal._resetForm && typeof modal._resetForm === "function") {
    modal._resetForm();
  }

  const isDialog = modal.tagName?.toLowerCase() === "dialog";
  if (isDialog && modal.close) {
    modal.close();
    // Clear inline display if any was set by previous logic
    modal.style.removeProperty("display");
  } else {
    modal.classList.remove("is-open");
    modal.classList.add("hidden");
    modal.style.display = "none";
  }

  document.body.classList.remove("overflow-hidden");

  if (syncManufacturingHistory) {
    manufacturingModalHistoryActive = false;
    suppressManufacturingPopstate = true;
    history.back();
    suppressManufacturingPopstate = false;
  }
}

window.openModal = openModal;
window.closeModal = closeModal;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", openPendingManufacturingModalFromRedirect);
} else {
  openPendingManufacturingModalFromRedirect();
}

window.addEventListener("click", e => {
  const manufacturingClose = e.target.closest(
    `#${MANUFACTURING_MODAL_ID} .manufacturing-loc-modal-close, #${MANUFACTURING_MODAL_ID} .modalClose`
  );
  if (manufacturingClose) {
    e.preventDefault();
    e.stopPropagation();
    closeModal(MANUFACTURING_MODAL_ID);
    return;
  }

  const modalEl = e.target.classList.contains("modalWindow") ? e.target : e.target.closest(".modalWindow");
  if (!modalEl) return;

  if (e.target === modalEl) {
    if (modalEl.id === "modal-enquiries") return;
    closeModal(modalEl.id);
  }
});

window.addEventListener("popstate", () => {
  if (suppressManufacturingPopstate) return;
  const modal = document.getElementById(MANUFACTURING_MODAL_ID);
  if (!modal?.classList.contains("is-open")) return;
  manufacturingModalHistoryActive = false;
  closeModal(MANUFACTURING_MODAL_ID);
});
