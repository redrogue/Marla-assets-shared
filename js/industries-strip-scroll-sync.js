import { animate } from "./anime-v4.bundle.js";

const STRIP_ID = "industries-strip-scroller";
const HINT_ID = "industries-strip-hint";
const XL_MAX = "(max-width: 1279px)";
const NUDGE_PX = 25;
const NUDGE_DELAY_MS = 600;
const AXIS_LOCK_PX = 8;
const hasAnime = typeof animate === "function";

function initIndustriesStripScrollSync() {
    const strip = document.getElementById(STRIP_ID);
    if (!strip) return;

    const hint = document.getElementById(HINT_ID);
    const mq = window.matchMedia(XL_MAX);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let nudgePlayed = false;
    let nudgeTimer = 0;
    let observer = null;
    let dragState = null;

    function getMaxScroll() {
        return Math.max(0, strip.scrollWidth - strip.clientWidth);
    }

    function hideHint() {
        if (!hint || hint.hidden) return;
        hint.hidden = true;
        hint.setAttribute("aria-hidden", "true");
    }

    function showHint() {
        if (!hint || getMaxScroll() <= 0) return;
        hint.hidden = false;
        hint.removeAttribute("aria-hidden");
    }

    function clearNudgeTimer() {
        if (!nudgeTimer) return;
        window.clearTimeout(nudgeTimer);
        nudgeTimer = 0;
    }

    function playNudge() {
        if (nudgePlayed || !mq.matches || reduceMotion.matches) return;
        const max = getMaxScroll();
        if (max <= 0) return;
        nudgePlayed = true;

        const nudgeTarget = Math.min(NUDGE_PX, max);

        if (hasAnime) {
            animate(strip, {
                scrollLeft: [0, nudgeTarget, 0],
                duration: 1200,
                ease: "inOutSine",
            });
        } else {
            strip.scrollLeft = nudgeTarget;
            window.setTimeout(() => {
                strip.scrollLeft = 0;
            }, 600);
        }
    }

    function scheduleNudge() {
        clearNudgeTimer();
        if (nudgePlayed || !mq.matches || reduceMotion.matches || getMaxScroll() <= 0) return;
        nudgeTimer = window.setTimeout(() => {
            nudgeTimer = 0;
            playNudge();
        }, NUDGE_DELAY_MS);
    }

    function suppressClickAfterDrag(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function resetDragState() {
        if (!dragState) return;
        if (dragState.captured) {
            strip.releasePointerCapture(dragState.pointerId);
        }
        strip.classList.remove("is-dragging");
        dragState = null;
    }

    function onPointerDown(e) {
        if (getMaxScroll() <= 0) return;
        if (e.pointerType === "touch") return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        dragState = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            startScrollLeft: strip.scrollLeft,
            moved: false,
            captured: false,
            axis: null,
        };
    }

    function onPointerMove(e) {
        if (!dragState || dragState.pointerId !== e.pointerId) return;

        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;

        if (!dragState.axis) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (absDx < AXIS_LOCK_PX && absDy < AXIS_LOCK_PX) return;

            if (absDy >= absDx) {
                resetDragState();
                return;
            }

            dragState.axis = "x";
            dragState.captured = true;
            strip.setPointerCapture(e.pointerId);
            strip.classList.add("is-dragging");
        }

        if (dragState.axis !== "x") return;

        e.preventDefault();
        dragState.moved = true;
        strip.scrollLeft = dragState.startScrollLeft - dx;
    }

    function onPointerUp(e) {
        if (!dragState || dragState.pointerId !== e.pointerId) return;

        if (dragState.moved) {
            strip.addEventListener("click", suppressClickAfterDrag, { capture: true, once: true });
        }

        resetDragState();
    }

    function onPointerCancel(e) {
        if (!dragState || dragState.pointerId !== e.pointerId) return;
        resetDragState();
    }

    function teardownObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    function setupObserver() {
        teardownObserver();
        if (!mq.matches || getMaxScroll() <= 0) return;

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                        scheduleNudge();
                        teardownObserver();
                    }
                });
            },
            { threshold: [0, 0.35, 0.5] }
        );
        observer.observe(strip);
    }

    function detachMobileHint() {
        clearNudgeTimer();
        teardownObserver();
    }

    function detachDrag() {
        resetDragState();
        strip.removeEventListener("pointerdown", onPointerDown);
        strip.removeEventListener("pointermove", onPointerMove);
        strip.removeEventListener("pointerup", onPointerUp);
        strip.removeEventListener("pointercancel", onPointerCancel);
    }

    function detach() {
        detachMobileHint();
        detachDrag();
        window.removeEventListener("resize", onResize);
        if (window.visualViewport) {
            window.visualViewport.removeEventListener("resize", onResize);
        }
    }

    function attachDrag() {
        strip.addEventListener("pointerdown", onPointerDown);
        strip.addEventListener("pointermove", onPointerMove);
        strip.addEventListener("pointerup", onPointerUp);
        strip.addEventListener("pointercancel", onPointerCancel);
    }

    function attachMobileHint() {
        if (!mq.matches) {
            hideHint();
            return;
        }

        if (getMaxScroll() <= 0) {
            hideHint();
            return;
        }

        showHint();
        setupObserver();
    }

    function onResize() {
        strip.style.overflowX = getMaxScroll() > 0 ? "auto" : "";

        if (mq.matches) {
            if (getMaxScroll() <= 0) {
                hideHint();
                clearNudgeTimer();
                teardownObserver();
                return;
            }
            showHint();
            if (!nudgePlayed) setupObserver();
        } else {
            hideHint();
            clearNudgeTimer();
            teardownObserver();
        }
    }

    function applyMode() {
        detach();
        strip.scrollLeft = 0;
        nudgePlayed = false;
        strip.style.overflowX = getMaxScroll() > 0 ? "auto" : "";

        attachDrag();
        attachMobileHint();

        window.addEventListener("resize", onResize, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", onResize, { passive: true });
        }
    }

    mq.addEventListener("change", applyMode);
    reduceMotion.addEventListener("change", applyMode);
    applyMode();

    window.addEventListener(
        "load",
        () => {
            onResize();
        },
        { once: true }
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndustriesStripScrollSync);
} else {
    initIndustriesStripScrollSync();
}
