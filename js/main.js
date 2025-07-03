const links = document.querySelectorAll('.nav a');
const currentUrl = window.location.pathname.split('/').pop();

links.forEach(link => {
    if (link.getAttribute('href') === currentUrl) {
        link.classList.add('active');
    }
});



function calculate() {
    const adr = parseFloat(document.getElementById('adr').value) || 0;
    const occupancy = parseFloat(document.getElementById('occupancy').value) / 100 || 0;
    const capex = parseFloat(document.getElementById('capex').value) || 0;
    const opex = parseFloat(document.getElementById('opex').value) || 0;
    const result =  document.querySelector('.calc-results');

    const annualRevenue = adr * occupancy * 365;
    const noi = annualRevenue - opex;
    const roi = capex > 0 ? (noi / capex) * 100 : 0;
    const payback = noi > 0 ? capex / noi : 0;
    result.style.display = 'block';


    document.getElementById('results').innerHTML = `
      <div><strong>Годовая выручка:</strong> $${annualRevenue.toFixed(2)}</div>
      <div><strong>NOI (доход после OPEX):</strong> $${noi.toFixed(2)}</div>
      <div><strong>ROI:</strong> ${roi.toFixed(1)}%</div>
      <div><strong>Срок окупаемости:</strong> ${payback.toFixed(1)} лет</div>
    `;
}


class HeroSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.hero-slide').length;
        this.sliderTrack = document.querySelector('.slider-track');
        this.dots = document.querySelectorAll('.dot');
        this.startX = 0;
        this.isDragging = false;
        this.threshold = 50;

        this.init();
    }

    init() {
        // Кнопки навигации
        document.querySelector('.prev-btn').addEventListener('click', () => this.prevSlide());
        document.querySelector('.next-btn').addEventListener('click', () => this.nextSlide());

        // Точки навигации
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Свайп события
        this.sliderTrack.addEventListener('mousedown', (e) => this.startDrag(e));
        this.sliderTrack.addEventListener('mousemove', (e) => this.duringDrag(e));
        this.sliderTrack.addEventListener('mouseup', () => this.endDrag());
        this.sliderTrack.addEventListener('mouseleave', () => this.endDrag());

        // Touch события для мобильных
        this.sliderTrack.addEventListener('touchstart', (e) => this.startDrag(e));
        this.sliderTrack.addEventListener('touchmove', (e) => this.duringDrag(e));
        this.sliderTrack.addEventListener('touchend', () => this.endDrag());

        // Автоплей
        this.startAutoplay();
    }

    startDrag(e) {
        this.isDragging = true;
        this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.sliderTrack.style.cursor = 'grabbing';
    }

    duringDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - this.startX;

        if (Math.abs(deltaX) > this.threshold) {
            if (deltaX > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
            this.endDrag();
        }
    }

    endDrag() {
        this.isDragging = false;
        this.sliderTrack.style.cursor = 'grab';
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        const translateX = -this.currentSlide * (100 / this.totalSlides);
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoplay() {
        setInterval(() => {
            if (!this.isDragging) {
                this.nextSlide();
            }
        }, 5000);
    }
}

// Инициализация слайдера
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
});


window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');

burger.addEventListener('click', () => {
    const opened = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', opened);
    mobileMenu.setAttribute('aria-hidden', !opened);
});