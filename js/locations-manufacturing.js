/**
 * Strategic manufacturing locations: list + fixed overlay (covers town names), map pins.
 */
(function () {
    const root = document.getElementById("strategic-manufacturing");
    if (!root) return;

    const overlay = root.querySelector("#loc-detail-overlay");
    const panels = root.querySelectorAll("[data-loc-panel]");
    const items = root.querySelectorAll("[data-loc-item]");

    function setActive(id) {
        const isOpen = Boolean(id);

        if (overlay) {
            overlay.classList.toggle("loc-detail-overlay--open", isOpen);
            overlay.setAttribute("aria-hidden", String(!isOpen));
        }

        panels.forEach((panel) => {
            const match = panel.getAttribute("data-loc-panel") === id;
            panel.classList.toggle("hidden", !match);
        });

        items.forEach((article) => {
            const locId = article.getAttribute("data-loc-item");
            const btn = article.querySelector("button[data-loc-select]");
            if (btn) btn.setAttribute("aria-expanded", String(isOpen && locId === id));
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
