const STRIP_ID = "industries-strip-scroller";
const XL_MAX = "(max-width: 1279px)";
/** Softens mouse wheel steps (less twitchy than 1:1 raw delta) */
const WHEEL_SCALE = 0.62;
const TOUCH_SCALE = 0.95;

function initIndustriesStripScrollSync() {
    const strip = document.getElementById(STRIP_ID);
    if (!strip) return;

    const mq = window.matchMedia(XL_MAX);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollRaf = 0;
    let startScrollY = 0;
    let touchLastY = null;

    let pendingPan = 0;
    let panFlushRaf = 0;

    function getMaxScroll() {
        return strip.scrollWidth - strip.clientWidth;
    }

    function normalizeWheelDelta(e) {
        let dy = e.deltaY + e.deltaX;
        if (e.deltaMode === 1) dy *= 16;
        else if (e.deltaMode === 2) dy *= window.innerHeight;
        return dy;
    }

    function schedulePanFlush() {
        if (panFlushRaf) return;
        panFlushRaf = requestAnimationFrame(() => {
            panFlushRaf = 0;
            const ms = getMaxScroll();
            if (ms <= 0 || pendingPan === 0) return;
            strip.scrollLeft = Math.max(0, Math.min(ms, strip.scrollLeft + pendingPan));
            pendingPan = 0;
        });
    }

    function refreshLayout() {
        const stripRect = strip.getBoundingClientRect();
        const stripTopDoc = stripRect.top + window.scrollY;
        const stripBottomDoc = stripTopDoc + strip.offsetHeight;
        startScrollY = stripBottomDoc - window.innerHeight;
    }

    function lockAndResetFromScroll() {
        if (!mq.matches || reduceMotion.matches) return;
        const ms = getMaxScroll();
        if (ms <= 0) return;
        const y = window.scrollY;
        const sl = strip.scrollLeft;

        if (y < startScrollY && sl > 0) {
            strip.scrollLeft = 0;
        }
        if (y > startScrollY + 0.5 && sl < ms - 0.5) {
            window.scrollTo(0, startScrollY);
        }
    }

    function onScroll() {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = requestAnimationFrame(lockAndResetFromScroll);
    }

    function onWheel(e) {
        if (!mq.matches || reduceMotion.matches) return;
        const ms = getMaxScroll();
        if (ms <= 0) return;

        const y = window.scrollY;
        const sl = strip.scrollLeft;
        const dy = normalizeWheelDelta(e) * WHEEL_SCALE;

        if (y < startScrollY - 2) {
            return;
        }

        if (sl >= ms - 1) {
            if (y > startScrollY + 2) {
                return;
            }
            if (y <= startScrollY + 2 && dy < 0 && sl > 0) {
                e.preventDefault();
                pendingPan += dy;
                schedulePanFlush();
            }
            return;
        }

        if (y >= startScrollY - 2 && sl < ms - 1) {
            if (sl === 0 && dy < 0) {
                return;
            }
            e.preventDefault();
            if (y > startScrollY) {
                window.scrollTo(0, startScrollY);
            }
            pendingPan += dy;
            schedulePanFlush();
        }
    }

    function onTouchStart(e) {
        if (!mq.matches || reduceMotion.matches) return;
        if (e.touches.length !== 1) return;
        touchLastY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
        if (!mq.matches || reduceMotion.matches) return;
        if (e.touches.length !== 1 || touchLastY === null) return;

        const ms = getMaxScroll();
        if (ms <= 0) return;

        const y = window.scrollY;
        const sl = strip.scrollLeft;
        const touch = e.touches[0];
        const dy = (touchLastY - touch.clientY) * TOUCH_SCALE;
        touchLastY = touch.clientY;

        if (y < startScrollY - 2) {
            return;
        }

        if (sl >= ms - 1) {
            if (y > startScrollY + 2) {
                return;
            }
            if (y <= startScrollY + 2 && dy < 0 && sl > 0) {
                e.preventDefault();
                pendingPan += dy;
                schedulePanFlush();
            }
            return;
        }

        if (y >= startScrollY - 2 && sl < ms - 1) {
            if (sl === 0 && dy < 0) {
                return;
            }
            e.preventDefault();
            if (y > startScrollY) {
                window.scrollTo(0, startScrollY);
            }
            pendingPan += dy;
            schedulePanFlush();
        }
    }

    function onResize() {
        refreshLayout();
    }

    function detach() {
        cancelAnimationFrame(scrollRaf);
        cancelAnimationFrame(panFlushRaf);
        pendingPan = 0;
        panFlushRaf = 0;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("wheel", onWheel);
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("resize", onResize);
        if (window.visualViewport) {
            window.visualViewport.removeEventListener("resize", onResize);
        }
    }

    function applyMode() {
        detach();
        strip.style.overflowX = "";

        if (reduceMotion.matches) {
            strip.style.overflowX = "auto";
            strip.scrollLeft = 0;
            return;
        }
        if (mq.matches) {
            strip.style.overflowX = "hidden";
            refreshLayout();
            requestAnimationFrame(() => {
                refreshLayout();
                lockAndResetFromScroll();
            });
            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("wheel", onWheel, { passive: false });
            document.addEventListener("touchstart", onTouchStart, { passive: true });
            document.addEventListener("touchmove", onTouchMove, { passive: false });
            window.addEventListener("resize", onResize, { passive: true });
            if (window.visualViewport) {
                window.visualViewport.addEventListener("resize", onResize, { passive: true });
            }
        } else {
            strip.scrollLeft = 0;
        }
    }

    mq.addEventListener("change", applyMode);
    reduceMotion.addEventListener("change", applyMode);
    applyMode();
    window.addEventListener(
        "load",
        () => {
            refreshLayout();
            lockAndResetFromScroll();
        },
        { once: true }
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndustriesStripScrollSync);
} else {
    initIndustriesStripScrollSync();
}
