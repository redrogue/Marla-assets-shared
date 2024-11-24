console.log("animations.js loaded");

////////////////////////////////////////////////////////////////////////
// Intersection Observer
////////////////////////////////////////////////////////////////////////

// General Intersection Observer for anime-fade elements
const observerAnime = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const animationType = entry.target.getAttribute('anime-fade');
            switch (animationType) {
                case 'left':
                    startAnimeLeft(entry.target);
                    break;
                case 'right':
                    startAnimeRight(entry.target);
                    break;
                case 'up':
                    startAnimeUp(entry.target);
                    break;
                case 'down':
                    startAnimeDown(entry.target);
                    break;
            }
            observer.unobserve(entry.target); // Stop observing once triggered
        }
    });
});

// Observe all elements with the anime-fade attribute
document.querySelectorAll('[anime-fade]').forEach(el => observerAnime.observe(el));

// Dynamically added elements
function observeDynamicAnimeElements() {
    document.querySelectorAll('[anime-fade]:not([data-observed])').forEach(element => {
        observerAnime.observe(element);
        element.setAttribute('data-observed', 'true'); // Mark as observed
    });
}
window.observeDynamicAnimeElements = observeDynamicAnimeElements;

////////////////////////////////////////////////////////////////////////
// Utility Functions
////////////////////////////////////////////////////////////////////////

/**
 * Prepare element for animation by removing `hidden-opacity` class.
 */
function prepareForAnimation(element) {
    console.log("Preparing for animation:", element); // Debugging
    element.style.opacity = "1"; // Explicitly set opacity
    element.style.visibility = "visible"; // Make it visible
    element.style.transform = "none"; // Reset any transform if required
    element.classList.remove('hidden-opacity'); // Remove hidden-opacity class
}

/**
 * Wrap text in spans for animeHeading animations.
 */
function wrapTextWithSpans(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        if (!el.textContent.trim()) {
            console.error("Empty or invalid element:", el);
            return;
        }
        el.innerHTML = el.textContent.replace(/\S/g, "<span class='animeLetter'>$&</span>");
    });
}

////////////////////////////////////////////////////////////////////////
// Specific Animations
////////////////////////////////////////////////////////////////////////

/**
 * Animation for animeHeading.
 */
function animateHeadingLetters() {
    const textWrappers = document.querySelectorAll('.animeHeading');
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

/**
 * Animation for animeSlideHeading.
 */
anime.timeline({ loop: false })
    .add({
        targets: '.animeSlideHeading',
        translateX: [40, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 2000,
        delay: 500,
        begin: () => {
            const element = document.querySelector('.animeSlideHeading');
            prepareForAnimation(element);
        },
    });

/**
 * Animation for animeLogo.
 */
anime({
    targets: '.animeLogo',
    translateX: [40, 0],
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i) => 500 + 30 * i,
    begin: () => {
        const element = document.querySelector('.animeLogo');
        prepareForAnimation(element);
    },
});

/**
 * Animation for animeHeadingImage.
 */
anime.timeline({ loop: false })
    .add({
        targets: '.animeHeadingImage',
        translateX: [-40, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 2000,
        delay: 500,
        begin: () => {
            const element = document.querySelector('.animeHeadingImage');
            prepareForAnimation(element);
        },
    });

////////////////////////////////////////////////////////////////////////
// Direction-Specific Animations
////////////////////////////////////////////////////////////////////////

function startAnimeLeft(target) {
    prepareForAnimation(target);

    anime({
        targets: target,
        translateX: [100, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: parseInt(target.getAttribute('anime-delay')) || 0,
    });
}

function startAnimeRight(target) {
    prepareForAnimation(target);

    anime({
        targets: target,
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: parseInt(target.getAttribute('anime-delay')) || 0,
    });
}

function startAnimeUp(target) {
    prepareForAnimation(target);

    anime({
        targets: target,
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: parseInt(target.getAttribute('anime-delay')) || 0,
    });
}

function startAnimeDown(target) {
    prepareForAnimation(target);

    anime({
        targets: target,
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: parseInt(target.getAttribute('anime-delay')) || 0,
    });
}

////////////////////////////////////////////////////////////////////////
// Extra Animations (Restored)
////////////////////////////////////////////////////////////////////////

/**
 * Animation for animeNavItem.
 */
anime({
    targets: '.animeNavItem',
    translateY: [-5, 0],
    opacity: [0, 1],
    duration: 500,
    delay: (el, i) => 500 + 30 * i,
});

/**
 * Custom Animation Timeline (if required for scroll progress).
 */
function createAnimeTimeline(animationProperties, triggerElement) {
    const animeTimeline = anime.timeline({ autoplay: false });

    animationProperties.forEach(props => animeTimeline.add(props));

    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animeTimeline.seek(0); // Start animation at 0% progress
                scrollObserver.unobserve(entry.target);
            }
        });
    });

    const targetElement = document.querySelector(triggerElement);
    if (targetElement) scrollObserver.observe(targetElement);
}

////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////

// Wrap text with spans and initialize animations
wrapTextWithSpans('.animeHeading');
animateHeadingLetters();

// Debugging outputs
console.log("Animations.js loaded successfully");
console.log("observeDynamicAnimeElements globally available:", typeof window.observeDynamicAnimeElements);
