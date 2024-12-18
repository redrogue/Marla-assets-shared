console.log("animations.js loaded successfully");

////////////////////////////////////////////////////////////////////////
// DOM Content Loaded Initialization
////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    // Scroll-based animations
    const animatableElements = document.querySelectorAll('.animeSlideLeft, .animeSlideLeftx2, .animeSlideRight, .animeSlideRightx2, .animeSlideDown, .animeSlideUp');
    const animations = [];
    const triggeredOnLoad = new Set();

    animatableElements.forEach((element) => {
        const animationProperties = getAnimationProperties(element);

        const animation = anime({
            targets: element,
            ...animationProperties,
            autoplay: false,
            easing: 'easeOutQuad',
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
////////////////////////////////////////////////////////////////////////
const observerAnime = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const animationType = entry.target.getAttribute('anime-fade');
            switch (animationType) {
                case 'left': startAnimeLeft(entry.target); break;
                case 'right': startAnimeRight(entry.target); break;
                case 'up': startAnimeUp(entry.target); break;
                case 'down': startAnimeDown(entry.target); break;
            }
            observer.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('[anime-fade]').forEach(el => observerAnime.observe(el));

// Function for dynamically added elements
function observeDynamicAnimeElements() {
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

////////////////////////////////////////////////////////////////////////
// Specific Animations
////////////////////////////////////////////////////////////////////////

/**
 * Animation for animeNavItem.
 */
const navItems = document.querySelectorAll('.animeNavItem');
if (navItems.length > 0) {
    navItems.forEach(navItem => prepareForAnimation(navItem));

    anime({
        targets: '.animeNavItem',
        translateY: [-5, 0],
        opacity: [0, 1],
        duration: 500,
        delay: (el, i) => 500 + 30 * i,
    });
} else {
    console.warn("No .animeNavItem elements found on this page.");
}

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
        prepareForAnimation(textWrapper);

        anime.timeline({ loop: false })
            .add({
                targets: textWrapper.querySelectorAll('.animeLetter'),
                translateX: [40, 0],
                translateZ: [500, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 2000,
                delay: (el, i) => 500 + 30 * i,
            });
    });
}

const slideHeading = document.querySelector('.animeSlideHeading');
if (slideHeading) {
    anime.timeline({ loop: false })
        .add({
            targets: '.animeSlideHeading',
            translateX: [40, 0],
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 2000,
            delay: 500,
            begin: () => prepareForAnimation(slideHeading),
        });
}

const logo = document.querySelector('.animeLogo');
if (logo) {
    anime({
        targets: '.animeLogo',
        translateX: [40, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1000,
        delay: (el, i) => 500 + 30 * i,
        begin: () => prepareForAnimation(logo),
    });
}

const headingImages = document.querySelectorAll('.animeHeadingImage');
if (headingImages.length > 0) {
    headingImages.forEach(headingImage => {
        prepareForAnimation(headingImage);

        anime.timeline({ loop: false })
            .add({
                targets: headingImage,
                translateX: [-40, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 2000,
                delay: 500,
            });
    });
}

////////////////////////////////////////////////////////////////////////
// Direction-Specific Animations
////////////////////////////////////////////////////////////////////////

function startAnimeLeft(target) {
    prepareForAnimation(target);
    anime({ targets: target, translateX: [100, 0], opacity: [0, 1], duration: 1000, easing: 'easeInOutSine' });
}

function startAnimeRight(target) {
    prepareForAnimation(target);
    anime({ targets: target, translateX: [-100, 0], opacity: [0, 1], duration: 1000, easing: 'easeInOutSine' });
}

function startAnimeUp(target) {
    prepareForAnimation(target);
    anime({ targets: target, translateY: [100, 0], opacity: [0, 1], duration: 1000, easing: 'easeInOutSine' });
}

function startAnimeDown(target) {
    prepareForAnimation(target);
    anime({ targets: target, translateY: [-100, 0], opacity: [0, 1], duration: 1000, easing: 'easeInOutSine' });
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
