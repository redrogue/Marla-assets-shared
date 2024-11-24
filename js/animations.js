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
    if (!element) {
        console.warn("prepareForAnimation: Element is null or undefined, skipping animation.");
        return; // Exit the function early if the element doesn't exist
    }

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
    if (elements.length === 0) {
        console.warn(`No elements found for selector ${selector}.`);
        return;
    }

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
 * Animation for animeNavItem.
 */
const navItems = document.querySelectorAll('.animeNavItem');
if (navItems.length > 0) {
    navItems.forEach(navItem => prepareForAnimation(navItem)); // Ensure visibility

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
 * Animation for animeHeading.
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

/**
 * Animation for animeSlideHeading.
 */
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
} else {
    console.warn(".animeSlideHeading not found on this page, skipping animation.");
}

/**
 * Animation for animeLogo.
 */
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
} else {
    console.warn(".animeLogo not found on this page, skipping animation.");
}

/**
 * Animation for animeHeadingImage.
 */
const headingImages = document.querySelectorAll('.animeHeadingImage');
if (headingImages.length > 0) {
    headingImages.forEach(headingImage => {
        prepareForAnimation(headingImage); // Ensure visibility

        anime.timeline({ loop: false })
            .add({
                targets: headingImage, // Target the specific element
                translateX: [-40, 0],
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 2000,
                delay: 500,
            });
    });
} else {
    console.warn("No .animeHeadingImage elements found on this page.");
}


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
// Initialization
////////////////////////////////////////////////////////////////////////

// Wrap text with spans and initialize animations
wrapTextWithSpans('.animeHeading');
animateHeadingLetters();

// Debugging outputs
console.log("Animations.js loaded successfully");
console.log("observeDynamicAnimeElements globally available:", typeof window.observeDynamicAnimeElements);
