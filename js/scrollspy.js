
console.log("scrollspy.js loaded successfully");

    document.addEventListener('DOMContentLoaded', function () {
        const scrollSpyNavLinks = document.querySelectorAll(
            '#scrollSpyNav-1 a[href^="#"]'
        );
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

        let clickActive = false;
        let clickUnlockTimer = 0;
        let ticking = false;
        let lastActiveId = '';

        function setActiveLink(link) {
            const nextId = link ? (link.getAttribute('href') || '').slice(1) : '';
            if (nextId === lastActiveId) return;
            lastActiveId = nextId;
            scrollSpyNavLinks.forEach((lnk) => {
                lnk.classList.toggle('scrollSpyActive', lnk === link);
            });
        }

        function centerChipInTrack(link) {
            if (!link) return;
            const track =
                link.closest('.pill-morph-track') ||
                link.closest('#scrollSpyNav-1') ||
                link.closest('[data-scrollspy-nav]');
            if (!track || track.scrollWidth <= track.clientWidth + 1) return;
            const linkRect = link.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            const clipped =
                linkRect.left < trackRect.left + 8 ||
                linkRect.right > trackRect.right - 8;
            if (!clipped) return;
            const nextLeft =
                track.scrollLeft +
                (linkRect.left - trackRect.left) -
                trackRect.width / 2 +
                linkRect.width / 2;
            track.scrollTo({ left: Math.max(0, nextLeft), behavior: 'auto' });
        }

        function syncFromScroll() {
            if (clickActive) return;

            let currentSectionId = '';
            let minDistance = Infinity;

            for (const section of scrollSpySections) {
                const distance = Math.abs(section.getBoundingClientRect().top);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentSectionId = section.id;
                }
            }

            if (!currentSectionId || currentSectionId === lastActiveId) return;

            const activeLink = [...scrollSpyNavLinks].find(
                (l) => l.getAttribute('href') === '#' + currentSectionId
            );
            setActiveLink(activeLink || null);
            centerChipInTrack(activeLink);
        }

        scrollSpyNavLinks.forEach((link) => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    setActiveLink(this);
                    centerChipInTrack(this);
                    clickActive = true;
                    clearTimeout(clickUnlockTimer);
                    clickUnlockTimer = setTimeout(() => {
                        clickActive = false;
                    }, 800);
                }
            });
        });

        window.addEventListener(
            'scroll',
            () => {
                if (clickActive || ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    ticking = false;
                    syncFromScroll();
                });
            },
            { passive: true }
        );
    });
