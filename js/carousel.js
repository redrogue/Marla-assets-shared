console.log("carousel js loaded");


class Carousel {
    constructor(carouselElement) {
        this.carouselElement = carouselElement;
        this.slides = this.carouselElement.getElementsByClassName("carouselSlide");
        // Find the corresponding dash container using data attributes
        const carouselId = this.carouselElement.getAttribute('data-carousel-id');
        this.dashesContainers = Array.from(document.querySelectorAll(`.carouselDashContainer[data-dash-for-carousel="${carouselId}"]`));
        this.slideIndex = 1;
        this.slideInterval = null;
        this.slideIntervalTime = 6000;

        this.init();
    }

    init() {
        if (this.dashesContainers.length === 0) {
            console.warn("Carousel: no .carouselDashContainer for data-carousel-id=%s", this.carouselElement.getAttribute("data-carousel-id"));
            return;
        }
        this.setUpDashes();
        // Skip slide-change event on first paint so hero heading letter animation can finish.
        this.showSlides(this.slideIndex, { emitSlideChange: false });
        this.startSlideShow();
        this.addEventListeners();
        this.addDragListeners();
    }

    setUpDashes() {
        for (const container of this.dashesContainers) {
            for (let i = 0; i < this.slides.length; i++) {
                let dash = document.createElement("div");
                dash.className = "carouselDash";
                dash.onclick = () => this.currentSlide(i + 1);
                let progressBar = document.createElement("div");
                progressBar.className = "carouselProgressBar";
                dash.appendChild(progressBar);
                container.appendChild(dash);
            }
        }
    }

    updateActiveDash() {
        for (const container of this.dashesContainers) {
            var dashes = container.getElementsByClassName("carouselDash");
            Array.from(dashes).forEach(dash => dash.className = "carouselDash");
            if (dashes[this.slideIndex - 1]) dashes[this.slideIndex - 1].className += " carouselActive";
        }
    }

    showSlides(n, options = {}) {
        const emitSlideChange = options.emitSlideChange !== false;
        if (n > this.slides.length) this.slideIndex = 1;
        if (n < 1) this.slideIndex = this.slides.length;
        Array.from(this.slides).forEach(slide => slide.style.display = "none");
        const slideEl = this.slides[this.slideIndex - 1];
        slideEl.style.display = "block";
        this.updateActiveDash();
        if (emitSlideChange) {
            this.carouselElement.dispatchEvent(new CustomEvent("carousel:slidechange", {
                bubbles: true,
                detail: {
                    carouselId: this.carouselElement.getAttribute("data-carousel-id"),
                    index: this.slideIndex,
                    slideElement: slideEl,
                },
            }));
        }
    }

    plusSlides(n) {
        this.showSlides(this.slideIndex += n);
        this.resetSlideShow();
    }

    currentSlide(n) {
        this.showSlides(this.slideIndex = n);
        this.resetSlideShow();
    }

    startSlideShow() {
        this.resetProgressBar();
        this.slideInterval = setInterval(() => this.plusSlides(1), this.slideIntervalTime);
    }

    resetSlideShow() {
        clearInterval(this.slideInterval);
        this.startSlideShow();
    }

    resetProgressBar() {
        const ms = this.slideIntervalTime;
        for (const container of this.dashesContainers) {
            const dashes = container.getElementsByClassName("carouselDash");
            Array.from(dashes).forEach((dash, idx) => {
                const progressBar = dash.getElementsByClassName("carouselProgressBar")[0];
                if (!progressBar) return;
                progressBar.style.animation = "none";
                progressBar.style.width = "0%";
                void progressBar.offsetWidth;
                if (idx === this.slideIndex - 1) {
                    progressBar.style.animation = `carouselProgressFill ${ms}ms linear forwards`;
                }
            });
        }
    }

    addEventListeners() {
        this.carouselElement.addEventListener('mousemove', (e) => {
            var containerWidth = this.carouselElement.offsetWidth;
            this.carouselElement.style.cursor = e.offsetX < containerWidth * 0.1 || e.offsetX > containerWidth * 0.9 ? 'pointer' : 'default';
        });

        this.carouselElement.addEventListener('click', (e) => {
            var containerWidth = this.carouselElement.offsetWidth;
            if (e.offsetX < containerWidth * 0.1) this.plusSlides(-1);
            else if (e.offsetX > containerWidth * 0.9) this.plusSlides(1);
        });
    }

    addDragListeners() {
        const el = this.carouselElement;
        el.style.touchAction = "pan-y";
        for (const node of el.querySelectorAll(".carouselSlide, img")) node.style.touchAction = "pan-y";
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let dragged = false;

        el.addEventListener("pointerdown", (e) => {
            if (pointerId !== null) return;
            if (e.pointerType === "mouse" && e.button !== 0) return;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            dragged = false;
            try { el.setPointerCapture(e.pointerId); } catch (_) {}
        });

        el.addEventListener("pointerup", (e) => {
            if (pointerId !== e.pointerId) return;
            pointerId = null;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
            dragged = true;
            this.plusSlides(dx < 0 ? 1 : -1);
        });

        el.addEventListener("pointercancel", (e) => {
            if (pointerId === e.pointerId) pointerId = null;
        });

        el.addEventListener("click", (e) => {
            if (!dragged) return;
            dragged = false;
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var carousels = document.querySelectorAll('.carouselContainer');
    carousels.forEach(carousel => new Carousel(carousel));
});

