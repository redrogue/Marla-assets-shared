// /assets-shared/js/modal.js
console.log("modal.js loaded");

import { initContactModal } from "./enquiry-modal.js";

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
  }

  document.body.classList.add("overflow-hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

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
}

window.openModal = openModal;
window.closeModal = closeModal;

window.addEventListener("click", e => {
  const modalEl = e.target.classList.contains("modalWindow") ? e.target : e.target.closest(".modalWindow");
  if (!modalEl) return;

  if (e.target === modalEl) {
    closeModal(modalEl.id);
  }
});
