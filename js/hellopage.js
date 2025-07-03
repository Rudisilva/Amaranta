// --- START OF FILE hellopage.js ---

class HeroSplit {
    constructor() {
        this.container = document.querySelector('.h-container');
        this.leftSection = document.querySelector('.h-section-left');
        this.rightSection = document.querySelector('.h-section-right');
        this.leftImage = this.leftSection.querySelector('.h-bg-image');
        this.rightImage = this.rightSection.querySelector('.h-bg-image');

        this.isMobile = window.innerWidth <= 768;
        this.currentState = 'neutral'; // 'neutral', 'left', 'right'
        this.isAnimating = false;

        // Флаги для корректной обработки касаний
        this.isDragging = false;
        this.wasSwipe = false;

        this.init();
    }

    init() {
        this.removeEventListeners(); // Очищаем старые слушатели перед новой настройкой
        this.setupEventListeners();

        if (!this.isMobile) {
            this.setupParallax();
        }
    }

    removeEventListeners() {
        window.removeEventListener('resize', this.debouncedResize);

        // Удаляем конкретные привязанные обработчики
        this.container.removeEventListener('mousemove', this.boundHandleMouseMove);
        this.container.removeEventListener('mousemove', this.boundHandleParallax);
        this.container.removeEventListener('mouseleave', this.boundHandleMouseLeave);
        this.container.removeEventListener('touchstart', this.boundTouchStart);
        this.container.removeEventListener('touchmove', this.boundTouchMove);
        this.container.removeEventListener('touchend', this.boundTouchEnd);
        this.container.removeEventListener('click', this.boundMobileClick);
    }


    setupEventListeners() {
        this.debouncedResize = Utils.debounce(() => this.handleResize(), 250);
        window.addEventListener('resize', this.debouncedResize);

        if (this.isMobile) {
            this.setupMobileInteraction();
        } else {
            this.setupDesktopInteraction();
        }
    }

    setupDesktopInteraction() {
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);
        this.boundHandleParallax = this.handleParallax.bind(this);

        this.container.addEventListener('mousemove', this.boundHandleMouseMove);
        this.container.addEventListener('mousemove', this.boundHandleParallax);
        this.container.addEventListener('mouseleave', this.boundHandleMouseLeave);
    }

    setupMobileInteraction() {
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        this.boundMobileClick = this.handleMobileClick.bind(this);

        this.container.addEventListener('touchstart', this.boundTouchStart);
        this.container.addEventListener('touchmove', this.boundTouchMove);
        this.container.addEventListener('touchend', this.boundTouchEnd);
        this.container.addEventListener('click', this.boundMobileClick);
    }

    handleMouseLeave() {
        this.container.classList.remove('h-hovering');
        this.resetState();
    }

    // --- МОБИЛЬНАЯ ЛОГИКА ---

    handleTouchStart(e) {
        this.container.classList.add('h-hovering'); // <--- ДОБАВИТЬ ЭТУ СТРОКУ
        if (e.target.closest('.h-button')) {
            this.isDragging = false;
            return;
        }
        this.startY = e.touches[0].clientY;
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.wasSwipe = false; // Сбрасываем флаг свайпа в начале касания
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - this.startY;
        const deltaX = currentX - this.startX;

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            e.preventDefault();
        }

        // Если движение было, помечаем это как возможный свайп
        if (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10) {
            this.wasSwipe = true;
        }
    }

    // ИЗМЕНЕНО: Логика touchend
    handleTouchEnd(e) {
        if (!this.isDragging) return;

        // Если это был свайп (определенный в touchmove), то мы не делаем ничего.
        // Действие активации секции произойдет в handleMobileClick, если это был тап.
        // А для полноценного свайпа (когда нужно активировать секцию сразу по окончанию свайпа),
        // можно вернуть старую логику, но флаг wasSwipe поможет избежать двойного срабатывания.

        const swipeThreshold = 50;
        const deltaY = e.changedTouches[0].clientY - this.startY;

        if (Math.abs(deltaY) > swipeThreshold) {
            // Это был определенно свайп
            this.wasSwipe = true;
            this.activateSection(deltaY > 0 ? 'left' : 'right');
        }

        this.isDragging = false;
        // Мы НЕ вызываем resetState() здесь.
    }

    // ИЗМЕНЕНО: Логика клика для мобильных
    handleMobileClick(e) {
        this.container.classList.add('h-hovering'); // <--- ДОБАВИТЬ ЭТУ СТРОКУ
        // Если действие уже было обработано как свайп, игнорируем последующий клик.
        if (this.wasSwipe) {
            this.wasSwipe = false; // Сбрасываем флаг и выходим
            return;
        }

        if (this.isAnimating) return;
        if (e.target.closest('.h-button')) return;

        const containerRect = this.container.getBoundingClientRect();
        const clickY = e.clientY - containerRect.top;
        const containerHeight = containerRect.height;
        const clickedSide = clickY < containerHeight / 2 ? 'left' : 'right';

        // ЭТА ЛОГИКА ТЕПЕРЬ РАБОТАЕТ КОРРЕКТНО
        // Если кликаем по уже активной стороне, ничего не происходит.
        if (this.currentState === clickedSide) {
            return;
        }

        this.activateSection(clickedSide);
    }

    // --- ОБЩАЯ ЛОГИКА ---

    handleHover(zone) {
        if (this.isAnimating) return;
        this.activateSection(zone);
    }

    handleMouseMove(e) {
        if (this.isAnimating) return;

        const containerRect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const containerWidth = containerRect.width;
        const targetZone = mouseX < containerWidth / 2 ? 'left' : 'right';

        this.container.classList.add('h-hovering');

        if (this.currentState !== targetZone) {
            this.handleHover(targetZone);
        }
    }

    activateSection(section) {
        if (this.currentState === section || !['left', 'right'].includes(section)) return;

        this.isAnimating = true;
        this.currentState = section;

        // --- ИСПРАВЛЕНИЕ ---
        // Устанавливаем .h-active только для нужной секции
        this.leftSection.classList.toggle('h-active', section === 'left');
        this.rightSection.classList.toggle('h-active', section === 'right');
        // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

        this.leftSection.classList.toggle('h-expanded', section === 'left');
        this.leftSection.classList.toggle('h-collapsed', section === 'right');
        this.rightSection.classList.toggle('h-expanded', section === 'right');
        this.rightSection.classList.toggle('h-collapsed', section === 'left');

        setTimeout(() => { this.isAnimating = false; }, 300);
    }

    resetState() {
        if (this.currentState === 'neutral') return;

        this.isAnimating = true;
        this.currentState = 'neutral';

        this.leftSection.classList.remove('h-expanded', 'h-collapsed', 'h-active');
        this.rightSection.classList.remove('h-expanded', 'h-collapsed', 'h-active');

        setTimeout(() => { this.isAnimating = false; }, 300);
    }

    // --- ЭФФЕКТЫ ---

    setupParallax() {
        this.leftImage.style.transform = 'translateX(0) scale(1.05)';
        this.rightImage.style.transform = 'translateX(0) scale(1.05)';
    }

    handleParallax(e) {
        if (this.isMobile || this.currentState !== 'neutral') return;

        const containerRect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const containerWidth = containerRect.width;
        const normalizedX = (mouseX / containerWidth) * 2 - 1;
        const parallaxStrength = 5;
        const offset = -normalizedX * parallaxStrength;

        this.leftImage.style.transform = `translateX(${offset}px) scale(1.05)`;
        this.rightImage.style.transform = `translateX(${offset}px) scale(1.05)`;
    }

    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        if (this.isMobile !== newIsMobile) {
            this.isMobile = newIsMobile;
            this.resetState();
            this.init();
        }
    }
}

class VisualEffects {
    constructor() { this.init(); }
    init() {
        this.setupScrollEffects();
        this.setupImageEffects();
    }
    setupScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('h-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.h-content-inner').forEach(el => observer.observe(el));
    }
    setupImageEffects() {
        document.querySelectorAll('.h-bg-image').forEach(img => {
            if (img.complete) img.style.opacity = '1';
            else img.onload = () => img.style.opacity = '1';
        });
    }
}

const Utils = {
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            const later = () => { clearTimeout(timeout); func.apply(this, args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new HeroSplit();
    new VisualEffects();
});