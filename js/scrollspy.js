
console.log("scrollspy.js loaded successfully");

    document.addEventListener('DOMContentLoaded', function () {
        const scrollSpyNavLinks = document.querySelectorAll('#scrollSpyNav-1 a[href^="#"]');
        if (!scrollSpyNavLinks.length) return;

        // Industries page: scroll-scrub timing is driven by #industries-scroll-root; nav is handled in industries-scroll-animations.js.
        if (document.getElementById('industries-scroll-root')) return;

        const hrefSections = [...scrollSpyNavLinks]
            .map((a) => a.getAttribute('href'))
            .filter((h) => h && h.length > 1)
            .map((h) => document.querySelector(h))
            .filter(Boolean);
        const fallback = document.querySelectorAll('[id^="scrollSpyContent-"]');
        const scrollSpySections = hrefSections.length ? hrefSections : [...fallback];

        let clickActive = false; // Flag to indicate active class set by click
        let scrollTimeout; // Timeout variable for debouncing

        scrollSpyNavLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });

                    // Update active class immediately
                    scrollSpyNavLinks.forEach(lnk => lnk.classList.remove('scrollSpyActive'));
                    this.classList.add('scrollSpyActive');
                    clickActive = true; // Set flag

                    // Clear flag after a delay (e.g., 2 seconds)
                    setTimeout(() => {
                        clickActive = false; // This should be false to re-enable scroll-based updates
                    }, 2000);
                }
            });
        });

        function onScroll() {
            // Exit if the active class was recently set by a click
            if (clickActive) return;

            let currentSectionId = '';
            let minDistance = Infinity;

            scrollSpySections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                const distance = Math.abs(sectionTop);

                if (distance < minDistance) {
                    minDistance = distance;
                    currentSectionId = section.getAttribute('id');
                }
            });

            // Set the active class for the navigation links
            scrollSpyNavLinks.forEach(link => {
                if (link.getAttribute('href') === '#' + currentSectionId) {
                    link.classList.add('scrollSpyActive');
                } else {
                    link.classList.remove('scrollSpyActive');
                }
            });

            // Debounce the scrollIntoView for the navigation link
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const activeLink = document.querySelector('.scrollSpyActive');
                if (activeLink) {
                    activeLink.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center' // Ensures it centers in the horizontal scrolling container
                    });
                }
            }, 500); // Trigger scrollIntoView after 500ms of inactivity
        }

        document.addEventListener('scroll', onScroll);
    });
