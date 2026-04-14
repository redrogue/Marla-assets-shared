import { animate, createTimeline } from "./anime-v4.bundle.js";

console.log("animations.js loaded successfully");

const hasAnime = typeof animate === "function" && typeof createTimeline === "function";
if (!hasAnime) {
    console.warn(
        "[Marla] anime.js v4 is not available (failed to load or blocked). Showing static layout; other scripts will still run."
    );
}

////////////////////////////////////////////////////////////////////////
// DOM Content Loaded Initialization
////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    if (!hasAnime) return;
    // Scroll-based animations
    const animatableElements = document.querySelectorAll('.animeSlideLeft, .animeSlideLeftx2, .animeSlideRight, .animeSlideRightx2, .animeSlideDown, .animeSlideUp');
    const animations = [];
    const triggeredOnLoad = new Set();

    animatableElements.forEach((element) => {
        const animationProperties = getAnimationProperties(element);

        const animation = animate(element, {
            ...animationProperties,
            autoplay: false,
            ease: "outQuad",
        });

        animations.push({ element, animation });
    });

    triggerAnimationsOnLoad();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateAnimations();
                ticking = false;
            });
            ticking = true;
        }
    });

    function triggerAnimationsOnLoad() {
        animations.forEach(({ element, animation }) => {
            if (isFullyInViewport(element)) {
                animation.play();
                triggeredOnLoad.add(element);
            }
        });
    }

    function updateAnimations() {
        animations.forEach(({ element, animation }) => {
            const rect = element.getBoundingClientRect();
            const isPartiallyInViewport = rect.top < window.innerHeight && rect.bottom > 0;

            if (!triggeredOnLoad.has(element) && isPartiallyInViewport) {
                const boxTop = rect.top + window.pageYOffset;
                const startScroll = boxTop - window.innerHeight * 1.2;
                const endScroll = boxTop + element.offsetHeight * 0.2;

                if (window.scrollY > startScroll && window.scrollY < endScroll) {
                    const scrollFraction = (window.scrollY - startScroll) / (endScroll - startScroll);
                    animation.seek(animation.duration * scrollFraction);
                }
            }
        });
    }

    function isFullyInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }

    function getAnimationProperties(element) {
        if (element.classList.contains('animeSlideLeft')) return { translateX: [-200, 0], opacity: [0, 1], duration: 500 };
        if (element.classList.contains('animeSlideLeftx2')) return { translateX: [400, 0], opacity: [0, 1], duration: 500 };
        if (element.classList.contains('animeSlideRight')) return { translateX: [200, 0], opacity: [0, 1], duration: 500 };
        if (element.classList.contains('animeSlideRightx2')) return { translateX: [400, 0], opacity: [0, 1], duration: 500 };
        if (element.classList.contains('animeSlideDown')) return { translateY: [-200, 0], opacity: [0, 1], duration: 500 };
        if (element.classList.contains('animeSlideUp')) return { translateY: [200, 0], opacity: [0, 1], duration: 500 };
        return {};
    }
});

////////////////////////////////////////////////////////////////////////
// Intersection Observer Logic
// rootMargin extends the "view" downward so anime triggers earlier (before element is in viewport)
////////////////////////////////////////////////////////////////////////
let observerAnime = null;

function revealAnimeFadeEl(target) {
    prepareForAnimation(target);
    target.style.opacity = "1";
    target.style.transform = "none";
}

if (typeof IntersectionObserver !== "undefined") {
    observerAnime = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            if (hasAnime) {
                const animationType = entry.target.getAttribute('anime-fade');
                switch (animationType) {
                    case 'left': startAnimeLeft(entry.target); break;
                    case 'right': startAnimeRight(entry.target); break;
                    case 'up': startAnimeUp(entry.target); break;
                    case 'down': startAnimeDown(entry.target); break;
                    default: revealAnimeFadeEl(entry.target); break;
                }
            } else {
                revealAnimeFadeEl(entry.target);
            }
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px 150px 0px', threshold: 0 });

    document.querySelectorAll('[anime-fade]').forEach(el => observerAnime.observe(el));
} else {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('[anime-fade]').forEach(revealAnimeFadeEl);
    });
}

// Function for dynamically added elements
function observeDynamicAnimeElements() {
    if (!observerAnime) return;
    document.querySelectorAll('[anime-fade]:not([data-observed])').forEach(element => {
        observerAnime.observe(element);
        element.setAttribute('data-observed', 'true');
    });
}
window.observeDynamicAnimeElements = observeDynamicAnimeElements;

////////////////////////////////////////////////////////////////////////
// Utility Functions
////////////////////////////////////////////////////////////////////////

function prepareForAnimation(element) {
    if (!element) return;
    element.style.opacity = "1";
    element.style.visibility = "visible";
    element.style.transform = "none";
    element.classList.remove('hidden-opacity');
}

/** Let tweens own opacity/transform; shared.css uses visibility:hidden on enter targets. */
function uncoverForTween(element) {
    if (!element) return;
    element.style.visibility = "visible";
}

////////////////////////////////////////////////////////////////////////
// Specific Animations
////////////////////////////////////////////////////////////////////////

/**
 * Animation for animeNavItem.
 */
function initNavAnimations() {
    // Bail if there’s no <nav> at all
    const navContainer = document.querySelector('nav');
    if (!navContainer) return;

    const navItems = navContainer.querySelectorAll('.animeNavItem');
    const logo = navContainer.querySelector('.animeLogo');

    if (hasAnime) {
        if (navItems.length) {
            navItems.forEach(i => uncoverForTween(i));
            animate('.animeNavItem', {
                translateY: [-5, 0],
                opacity: [0, 1],
                duration: 500,
                delay: (el, i) => 500 + 30 * i,
            });
        }
        if (logo) {
            uncoverForTween(logo);
            animate('.animeLogo', {
                translateX: [40, 0],
                opacity: [0, 1],
                ease: 'outExpo',
                duration: 1000,
                delay: 500,
            });
        }
    } else {
        navItems.forEach(i => prepareForAnimation(i));
        if (logo) prepareForAnimation(logo);
    }
}

// Always hook it on a normal page load…
document.addEventListener('DOMContentLoaded', initNavAnimations);
// …and again right after your host‐page fires `nav:loaded`
document.addEventListener('nav:loaded', initNavAnimations);

/**
 * Animation for animeHeadingLetters.
 */
function animateHeadingLetters() {
    const textWrappers = document.querySelectorAll('.animeHeading');
    if (textWrappers.length === 0) {
        console.warn("No .animeHeading elements found on this page.");
        return;
    }

    textWrappers.forEach(textWrapper => {
        if (!hasAnime) {
            prepareForAnimation(textWrapper);
            return;
        }

        const letters = textWrapper.querySelectorAll('.animeLetter');
        if (!letters.length) return;

        // Avoid a flash: CSS hides .animeHeading; setting opacity:1 before letters are at 0 shows full text briefly.
        letters.forEach((span) => {
            span.style.opacity = "0";
            uncoverForTween(span);
        });
        uncoverForTween(textWrapper);
        textWrapper.style.opacity = "1";

        createTimeline({ loop: false, autoplay: true })
            .add(letters, {
                translateX: [40, 0],
                translateZ: [500, 0],
                opacity: [0, 1],
                ease: "outExpo",
                duration: 2000,
                delay: (el, i) => 500 + 30 * i,
            });
    });
}

// Whole-block slide only when letters are not used (.animeHeading gets per-letter animation below).
const slideHeading = document.querySelector('.animeSlideHeading:not(.animeHeading)');
if (slideHeading) {
    if (hasAnime) {
        uncoverForTween(slideHeading);
        createTimeline({ loop: false, autoplay: true })
            .add(slideHeading, {
                translateX: [40, 0],
                opacity: [0, 1],
                ease: "outExpo",
                duration: 2000,
                delay: 500,
            });
    } else {
        prepareForAnimation(slideHeading);
    }
}



const headingImages = document.querySelectorAll('.animeHeadingImage');
if (headingImages.length > 0) {
    headingImages.forEach(headingImage => {
        if (!hasAnime) {
            prepareForAnimation(headingImage);
            return;
        }
        uncoverForTween(headingImage);

        createTimeline({ loop: false, autoplay: true })
            .add(headingImage, {
                translateX: [-40, 0],
                opacity: [0, 1],
                ease: "outExpo",
                duration: 2000,
                delay: 500,
            });
    });
}

////////////////////////////////////////////////////////////////////////
// Direction-Specific Animations
////////////////////////////////////////////////////////////////////////

function startAnimeLeft(target) {
    if (!hasAnime) {
        prepareForAnimation(target);
        return;
    }
    uncoverForTween(target);
    animate(target, { translateX: [100, 0], opacity: [0, 1], duration: 1000, ease: 'inOutSine' });
}

function startAnimeRight(target) {
    if (!hasAnime) {
        prepareForAnimation(target);
        return;
    }
    uncoverForTween(target);
    animate(target, { translateX: [-100, 0], opacity: [0, 1], duration: 1000, ease: 'inOutSine' });
}

function startAnimeUp(target) {
    if (!hasAnime) {
        prepareForAnimation(target);
        return;
    }
    uncoverForTween(target);
    animate(target, { translateY: [100, 0], opacity: [0, 1], duration: 1000, ease: 'inOutSine' });
}

function startAnimeDown(target) {
    if (!hasAnime) {
        prepareForAnimation(target);
        return;
    }
    uncoverForTween(target);
    animate(target, { translateY: [-100, 0], opacity: [0, 1], duration: 1000, ease: 'inOutSine' });
}

////////////////////////////////////////////////////////////////////////
// Text Wrapping for Headings
////////////////////////////////////////////////////////////////////////
function wrapTextWithSpans(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        if (!el.textContent.trim()) return;
        el.innerHTML = el.textContent.replace(/\S/g, "<span class='animeLetter'>$&</span>");
    });
}
wrapTextWithSpans('.animeHeading');
animateHeadingLetters();
