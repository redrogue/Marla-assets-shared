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
        this.slideIntervalTime = 3000;
        this.progressUpdateInterval = null;

        this.init();
    }

    init() {
        if (!this.dashesContainer) {
            console.warn("Carousel: no .carouselDashContainer for data-carousel-id=%s", this.carouselElement.getAttribute("data-carousel-id"));
            return;
        }
        this.setUpDashes();
        this.showSlides(this.slideIndex);
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

    showSlides(n) {
        if (n > this.slides.length) this.slideIndex = 1;
        if (n < 1) this.slideIndex = this.slides.length;
        Array.from(this.slides).forEach(slide => slide.style.display = "none");
        this.slides[this.slideIndex - 1].style.display = "block";
        this.updateActiveDash();
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
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
        }
        var dashes = this.dashesContainer.getElementsByClassName("carouselDash");
        const ms = this.slideIntervalTime;
        Array.from(dashes).forEach((dash, idx) => {
            let progressBar = dash.getElementsByClassName("carouselProgressBar")[0];
            if (!progressBar) return;
            progressBar.style.animation = "none";
            progressBar.style.width = "0%";
            void progressBar.offsetWidth;
            if (idx === this.slideIndex - 1) {
                progressBar.style.animation = `carouselProgressFill ${ms}ms linear forwards`;
            }
        });
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

