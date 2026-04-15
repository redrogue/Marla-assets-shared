console.log("carousel js loaded");


class Carousel {
    constructor(carouselElement) {
        this.carouselElement = carouselElement;
        this.slides = this.carouselElement.getElementsByClassName("carouselSlide");
        // Find the corresponding dash container using data attributes
        const carouselId = this.carouselElement.getAttribute('data-carousel-id');
        this.dashesContainer = document.querySelector(`.carouselDashContainer[data-dash-for-carousel="${carouselId}"]`);
        this.slideIndex = 1;
        this.slideInterval = null;
        this.slideIntervalTime = 6000;
        this.progressUpdateInterval = null;

        this.init();
    }

    init() {
        if (!this.dashesContainer) {
            console.warn("Carousel: no .carouselDashContainer for data-carousel-id=%s", this.carouselElement.getAttribute("data-carousel-id"));
            return;
        }
        this.setUpDashes();
        // Skip slide-change event on first paint so hero heading letter animation can finish.
        this.showSlides(this.slideIndex, { emitSlideChange: false });
        this.startSlideShow();
        this.addEventListeners();
    }

    setUpDashes() {
        for (let i = 0; i < this.slides.length; i++) {
            let dash = document.createElement("div");
            dash.className = "carouselDash";
            dash.onclick = () => this.currentSlide(i + 1);
            let progressBar = document.createElement("div");
            progressBar.className = "carouselProgressBar";
            dash.appendChild(progressBar);
            this.dashesContainer.appendChild(dash);
        }
    }

    updateActiveDash() {
        var dashes = this.dashesContainer.getElementsByClassName("carouselDash");
        Array.from(dashes).forEach(dash => dash.className = "carouselDash");
        if (dashes[this.slideIndex - 1]) dashes[this.slideIndex - 1].className += " carouselActive";
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
        clearInterval(this.progressUpdateInterval);
        this.startSlideShow();
    }

    resetProgressBar() {
        var dashes = this.dashesContainer.getElementsByClassName("carouselDash");
        Array.from(dashes).forEach(dash => {
            let progressBar = dash.getElementsByClassName("carouselProgressBar")[0];
            progressBar.style.width = '0%';
        });

        this.progressUpdateInterval = setInterval(() => {
            if (dashes[this.slideIndex - 1]) {
                var progressBar = dashes[this.slideIndex - 1].getElementsByClassName("carouselProgressBar")[0];
                var currentWidth = parseFloat(progressBar.style.width);
                var increment = 100 / (this.slideIntervalTime / 100);
                progressBar.style.width = Math.min(currentWidth + increment, 100) + '%';
                if (progressBar.style.width === '100%') clearInterval(this.progressUpdateInterval);
            }
        }, 100);
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
}

document.addEventListener('DOMContentLoaded', function () {
    var carousels = document.querySelectorAll('.carouselContainer');
    carousels.forEach(carousel => new Carousel(carousel));
});

