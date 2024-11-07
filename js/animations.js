// console.log("animations.js loaded");


////////////////////////////////////////////////////////////////////////

////////////// Animations  //////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////

/////////////////----------- Timeline ------------//////////////////////


// Function to create an anime timeline with custom properties
function createAnimeTimeline(animationProperties, triggerElement) {
    // Creates anime timeline.
    var animeTimeline = anime.timeline({ autoplay: false });

    // Adds transitions to the timeline with the provided properties
    animationProperties.forEach(function (props) {
        animeTimeline.add(props);
    });

    // Function to start the animation
    function startAnimeTimeline(scrollProgress) {
        // Calculate the seek position based on the scroll progress
        var animationProgress = animeTimeline.duration * scrollProgress;
        animeTimeline.seek(animationProgress);
    }

    // Intersection Observer callback
    function handleIntersection(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                // The target element is now visible, so start the animation
                startAnimeTimeline(0); // Start animation at 0% progress

                // Unobserve the element to stop observing once triggered
                observer.unobserve(entry.target);
            }
        });
    }

    // Create an Intersection Observer
    var scrollObserver = new IntersectionObserver(handleIntersection, {
        root: null, // Use the viewport as the root
        threshold: 0.5, // Trigger when 50% of the element is visible
    });

    // Find the element you want to observe and start observing it
    var theTargetElement = document.querySelector(triggerElement);
    if (theTargetElement) {
        scrollObserver.observe(theTargetElement);
    }

    // Event listener for scroll (optional)
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;

        // Calculate the scroll progress as a value between 0 and 1
        const scrollProgress = currentScroll / maxScroll;

        console.log('Scroll Progress:', scrollProgress);

        // Start the animation based on the scroll progress
        startAnimeTimeline(scrollProgress);
    });
}

////////////////////////////////////////////////////////////////

////// ---------- Fade up/right/left in Viewport -------- //////

////////////////////////////////////////////////////////////////


// Function to start the animation
function startAnimeDown(target) {
    var getDelay = parseInt(target.getAttribute('anime-delay')) || 0;

    var downAnimation = anime({
        targets: target,
        translateY: [-100, 0], // Moving from -100 to 0 on Y-axis
        opacity: [0, 1],
        duration: 1000,
        elasticity: 200,
        easing: 'easeInOutSine',
        delay: getDelay, // Delay based on the anime-delay attribute
        autoplay: false // Set autoplay to false so it doesn’t start immediately
    });

    downAnimation.play();
}

function startAnimeLeft(target) {
    var getDelay = parseInt(target.getAttribute('anime-delay')) || 0;

    var leftAnimation = anime({
        targets: target,
        translateX: [100, 0],
        opacity: [0, 1],
        duration: 1000,
        elasticity: 200,
        easing: 'easeInOutSine',
        delay: getDelay, // Set delay based on anime-delay attribute
        autoplay: false // Set autoplay to false so it doesn't start immediately
    });

    leftAnimation.play();
}

// Function to start the animation for "right" elements
function startAnimeRight(target) {
    var getDelay = parseInt(target.getAttribute('anime-delay')) || 0;

    var rightAnimation = anime({
        targets: target,
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 1000,
        elasticity: 200,
        easing: 'easeInOutSine',
        delay: getDelay, // Set delay based on anime-delay attribute
        autoplay: false // Set autoplay to false so it doesn't start immediately
    });

    rightAnimation.play();
}

// Function to start the animation for "up" elements
function startAnimeUp(target) {
    var getDelay = parseInt(target.getAttribute('anime-delay')) || 0;

    var upAnimation = anime({
        targets: target,
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 1000,
        elasticity: 200,
        easing: 'easeInOutSine',
        delay: getDelay, // Set delay based on anime-delay attribute
        autoplay: false // Set autoplay to false so it doesn't start immediately
    });

    upAnimation.play();
}

// Create an Intersection Observer
var observerAnime = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            // Determine the animation type based on the "anime-fade" attribute
            var animationType = entry.target.getAttribute('anime-fade');
            if (animationType === 'left') {
                startAnimeLeft(entry.target);
            } else if (animationType === 'right') {
                startAnimeRight(entry.target);
            } else if (animationType === 'up') {
                startAnimeUp(entry.target);
            }

            // Unobserve the element to stop observing once triggered
            observer.unobserve(entry.target);
        }
    });
});

// Find the elements with the "anime-fade" attribute and start observing them
const animeTargetElements = document.querySelectorAll('[anime-fade]');

animeTargetElements.forEach((tag) => {
    observerAnime.observe(tag);
});


////////////////////////////////////////////////////////////////

/////////// ----------- Heading Animations ---------- //////////

////////////////////////////////////////////////////////////////





anime({
    targets: '.animeLogo',
    translateX: [40, 0],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i) => 500 + 30 * i,
    begin: function(anim) {
        var imageElement = document.querySelector('.animeLogo');
        imageElement.style.opacity = '0'; // Ensure the image opacity is set to 0 at the start of the animation
    },
    opacity: [0, 1],
});



anime({
    targets: '.animeNavItem',
    translateY: [-5, 0],
    opacity: [0, 1],
    duration: 500,
    delay: (el, i) => 500 + 30 * i,
    //    delay: anime.stagger(100, { start: 500 }) // delay starts at 500ms then increase by 100ms for each elements.
});

// For all elements with the .animeHeading class
var textWrappers = document.querySelectorAll('.animeHeading');

textWrappers.forEach(function(textWrapper) {
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='animeLetter'>$&</span>");

    // Anime.js timeline for the heading letters
    anime.timeline({ loop: false })
        .add({
            targets: textWrapper.querySelectorAll('.animeLetter'),
            translateX: [40, 0],
            translateZ: [500, 0],
            opacity: [0, 1], // Animate opacity from 0 to 1
            easing: "easeOutExpo",
            duration: 2000,
            delay: (el, i) => 500 + 30 * i,
            // Remove the Tailwind `opacity-0` class before the animation starts
            begin: function(anim) {
                textWrapper.classList.remove('opacity-0');
            }
        });
});

// Anime.js timeline for subheading
anime.timeline({ loop: false })
    .add({
        targets: '.animeSlideHeading',
        translateX: [40, 0],
        opacity: [0, 1], // Animate opacity from 0 to 1
        easing: "easeOutExpo",
        duration: 2000,
        delay: 500,
    });

// Anime.js timeline for heading image
anime.timeline({ loop: false })
    .add({
        targets: '.animeHeadingImage',
        translateX: [-40, 0],
        opacity: [0, 1], // Animate opacity from 0 to 1
        easing: "easeOutExpo",
        duration: 2000,
        delay: 500,
    });

