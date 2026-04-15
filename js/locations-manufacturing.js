/**
 * Strategic manufacturing locations: list ↔ detail (list, map pins, close control).
 */
(function () {
    const root = document.getElementById("strategic-manufacturing");
    if (!root) return;

    const items = root.querySelectorAll("[data-loc-item]");

    function setActive(id) {
        items.forEach((article) => {
            const locId = article.getAttribute("data-loc-item");
            const collapsed = article.querySelector("[data-loc-collapsed]");
            const expanded = article.querySelector("[data-loc-expanded]");
            const isActive = Boolean(id) && locId === id;

            if (collapsed) collapsed.classList.toggle("hidden", isActive);

            if (expanded) {
                if (isActive) expanded.removeAttribute("aria-hidden");
                else expanded.setAttribute("aria-hidden", "true");
                expanded.classList.toggle("max-h-0", !isActive);
                expanded.classList.toggle("opacity-0", !isActive);
                expanded.classList.toggle("pointer-events-none", !isActive);
                expanded.classList.toggle("mb-0", !isActive);
                expanded.classList.toggle("mb-6", isActive);
                expanded.classList.toggle("max-h-[100rem]", isActive);
            }

            const btn = collapsed?.querySelector("button[data-loc-select]");
            if (btn) btn.setAttribute("aria-expanded", String(isActive));
        });

        root.querySelectorAll(".loc-map-pin").forEach((pin) => {
            const pinId = pin.getAttribute("data-loc-select");
            const on = Boolean(id) && pinId === id;
            pin.classList.toggle("scale-125", on);
            pin.classList.toggle("ring-4", on);
            pin.classList.toggle("ring-white", on);
            if (on) pin.setAttribute("aria-current", "true");
            else pin.removeAttribute("aria-current");
        });

        if (id) root.setAttribute("data-active-loc", id);
        else root.removeAttribute("data-active-loc");
    }

    root.addEventListener("click", (e) => {
        if (e.target.closest("[data-loc-close]")) {
            e.preventDefault();
            setActive(null);
            return;
        }

        const trigger = e.target.closest("[data-loc-select]");
        if (!trigger || !root.contains(trigger)) return;

        e.preventDefault();
        const locId = trigger.getAttribute("data-loc-select");
        const current = root.getAttribute("data-active-loc");
        if (current === locId) setActive(null);
        else setActive(locId);
    });

    setActive(null);
})();
