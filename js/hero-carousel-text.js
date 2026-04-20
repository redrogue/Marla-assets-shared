/**
 * Keeps hero heading / subcopy in sync with #carouselContainer1 slides.
 * Copy is read from each slide's data-hero-heading and data-hero-subhtml attributes.
 */
const HERO_CAROUSEL_ID = "1";
const HERO_TEXT_WRAP_ID = "heroCarouselTextWrap";

let heroTextTransitionGen = 0;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function syncHeroPreviewStripImg(slideElement) {
    const previewImg = document.getElementById("heroPreviewStripImg");
    const slideImg = slideElement?.querySelector?.("img");
    const nextSrc = slideImg?.getAttribute?.("src");
    if (!previewImg || !nextSrc) return;
    if (previewImg.getAttribute("src") !== nextSrc) previewImg.setAttribute("src", nextSrc);
}

function syncHeroFromSlide(slideElement) {
    if (!slideElement || !slideElement.dataset) return;
    const { heroHeading, heroSubhtml } = slideElement.dataset;

    const apply = (headingEl, subEl) => {
        if (!headingEl || !subEl) return;
        if (heroHeading !== undefined) headingEl.textContent = heroHeading;
        if (heroSubhtml !== undefined) subEl.innerHTML = heroSubhtml;
    };

    apply(
        document.getElementById("heroCarouselHeading"),
        document.getElementById("heroCarouselSub")
    );

    syncHeroPreviewStripImg(slideElement);
}

document.addEventListener("DOMContentLoaded", () => {
    const firstSlide = document.querySelector("#carouselContainer1 .carouselSlide");
    if (firstSlide) syncHeroPreviewStripImg(firstSlide);
});

function syncHeroWithTransition(slideElement) {
    const wrap = document.getElementById(HERO_TEXT_WRAP_ID);

    if (!wrap || prefersReducedMotion()) {
        syncHeroFromSlide(slideElement);
        return;
    }

    const myGen = ++heroTextTransitionGen;

    const finishExit = (e) => {
        if (e.propertyName !== "opacity" || e.target !== wrap) return;
        wrap.removeEventListener("transitionend", finishExit);
        if (myGen !== heroTextTransitionGen) return;
        syncHeroFromSlide(slideElement);
        wrap.classList.remove("is-hero-text-exiting");
        wrap.classList.add("is-hero-text-enter-start");
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (myGen !== heroTextTransitionGen) return;
                wrap.classList.remove("is-hero-text-enter-start");
            });
        });
    };

    wrap.classList.remove("is-hero-text-enter-start");
    wrap.classList.add("is-hero-text-exiting");
    wrap.addEventListener("transitionend", finishExit);
}

document.addEventListener("carousel:slidechange", (e) => {
    if (e.detail?.carouselId !== HERO_CAROUSEL_ID) return;
    syncHeroWithTransition(e.detail.slideElement);
});
