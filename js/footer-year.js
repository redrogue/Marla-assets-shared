/**
 * Updates #footer-placeholder .js-footer-year to the current year when the footer
 * is injected (e.g. fetch into #footer-placeholder).
 *
 * Observes only direct childList changes on the placeholder so updating the year
 * text does not re-trigger the observer.
 */
function updateFooterCopyrightYear() {
  document.querySelectorAll("#footer-placeholder .js-footer-year").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

const footerPlaceholder = document.getElementById("footer-placeholder");
if (footerPlaceholder) {
  updateFooterCopyrightYear();
  new MutationObserver(updateFooterCopyrightYear).observe(footerPlaceholder, {
    childList: true,
  });
}
