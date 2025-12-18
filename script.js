(function() {
    'use strict';

    window.__app = window.__app || {};

    const CONFIG = {
        HEADER_OFFSET: 80,
        ANIMATION_DURATION: 600,
        SCROLL_THROTTLE: 100,
        RESIZE_DEBOUNCE: 250,
        MOBILE_BREAKPOINT: 768,
        DESKTOP_BREAKPOINT: 1024
    };

    const VALIDATORS = {
        name: {
            pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
            message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben)'
        },
        email: {
            pattern: /^[^s@]+@[^s@]+.[^s@]+$/,
            message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        },
        phone: {
            pattern: /^[ds+-()]{10,20}$/,
            message: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)'
        },
        message: {
            minLength: 10,
            message: 'Die Nachricht muss mindestens 10 Zeichen lang sein'
        },
        select: {
            message: 'Bitte wählen Sie eine Option aus'
        },
        checkbox: {
            message: 'Sie müssen den Datenschutzbestimmungen zustimmen'
        }
    };

    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    class BurgerMenu {
        constructor() {
            this.nav = document.querySelector('.navbar-collapse');
            this.toggle = document.querySelector('.navbar-toggler');
            this.body = document.body;
            this.isOpen = false;

            if (!this.nav || !this.toggle) return;

            this.init();
        }

        init() {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                }
            });

            const navLinks = this.nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= CONFIG.DESKTOP_BREAKPOINT && this.isOpen) {
                    this.closeMenu();
                }
            }, CONFIG.RESIZE_DEBOUNCE));
        }

        toggleMenu() {
            this.isOpen ? this.closeMenu() : this.openMenu();
        }

        openMenu() {
            this.isOpen = true;
            this.nav.classList.add('show');
            this.toggle.setAttribute('aria-expanded', 'true');
            this.body.style.overflow = 'hidden';
        }

        closeMenu() {
            this.isOpen = false;
            this.nav.classList.remove('show');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.body.style.overflow = '';
        }
    }

    class ScrollAnimations {
        constructor() {
            this.observer = null;
            this.init();
        }

        init() {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            const animateElements = document.querySelectorAll('.card, .c-card, .c-form, img, .l-section > .container > *');
            
            animateElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity 0.8s ease-out ${index * 0.1}s, transform 0.8s ease-out ${index * 0.1}s`;
                this.observer.observe(el);
            });
        }
    }

    class ButtonAnimations {
        constructor() {
            this.init();
        }

        init() {
            const buttons = document.querySelectorAll('.c-button, .btn, .nav-link');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', (e) => {
                    this.addRipple(e);
                });

                button.addEventListener('click', (e) => {
                    this.addClickEffect(e);
                });
            });
        }

        addRipple(e) {
            const button = e.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple-effect 0.6s ease-out;
            `;

            if (!button.style.position || button.style.position === 'static') {
                button.style.position = 'relative';
            }
            button.style.overflow = 'hidden';

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }

        addClickEffect(e) {
            const button = e.currentTarget;
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }

    class FormValidator {
        constructor() {
            this.forms = document.querySelectorAll('.c-form');
            this.init();
        }

        init() {
            this.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleSubmit(e));

                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => {
                        if (input.classList.contains('is-invalid')) {
                            this.validateField(input);
                        }
                    });
                });
            });
        }

        handleSubmit(e) {
            e.preventDefault();
            e.stopPropagation();

            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            let isValid = true;

            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (isValid) {
                this.submitForm(form, submitBtn);
            }
        }

        validateField(field) {
            const fieldType = this.getFieldType(field);
            const value = field.value.trim();
            let isValid = true;
            let message = '';

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                message = 'Dieses Feld ist erforderlich';
            } else if (value) {
                switch (fieldType) {
                    case 'name':
                        if (!VALIDATORS.name.pattern.test(value)) {
                            isValid = false;
                            message = VALIDATORS.name.message;
                        }
                        break;
                    case 'email':
                        if (!VALIDATORS.email.pattern.test(value)) {
                            isValid = false;
                            message = VALIDATORS.email.message;
                        }
                        break;
                    case 'phone':
                        if (!VALIDATORS.phone.pattern.test(value)) {
                            isValid = false;
                            message = VALIDATORS.phone.message;
                        }
                        break;
                    case 'message':
                        if (value.length < VALIDATORS.message.minLength) {
                            isValid = false;
                            message = VALIDATORS.message.message;
                        }
                        break;
                    case 'select':
                        if (!value || value === '') {
                            isValid = false;
                            message = VALIDATORS.select.message;
                        }
                        break;
                }
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                message = VALIDATORS.checkbox.message;
            }

            this.setFieldValidity(field, isValid, message);
            return isValid;
        }

        getFieldType(field) {
            const id = field.id.toLowerCase();
            const name = field.name.toLowerCase();

            if (id.includes('name') || name.includes('name') || id.includes('vorname') || id.includes('nachname') || name.includes('vorname') || name.includes('nachname') || id.includes('firstname') || id.includes('lastname')) {
                return 'name';
            }
            if (field.type === 'email' || id.includes('email') || name.includes('email')) {
                return 'email';
            }
            if (field.type === 'tel' || id.includes('phone') || id.includes('telefon') || name.includes('phone') || name.includes('telefon')) {
                return 'phone';
            }
            if (field.tagName === 'TEXTAREA' || id.includes('message') || id.includes('nachricht') || name.includes('message') || name.includes('nachricht')) {
                return 'message';
            }
            if (field.tagName === 'SELECT') {
                return 'select';
            }
            return 'text';
        }

        setFieldValidity(field, isValid, message) {
            const feedback = field.parentElement.querySelector('.invalid-feedback') || this.createFeedbackElement(field);

            if (isValid) {
                field.classList.remove('is-invalid');
                feedback.textContent = '';
                feedback.style.display = 'none';
            } else {
                field.classList.add('is-invalid');
                feedback.textContent = message;
                feedback.style.display = 'block';
            }
        }

        createFeedbackElement(field) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentElement.appendChild(feedback);
            return feedback;
        }

        submitForm(form, submitBtn) {
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>Wird gesendet...';

                setTimeout(() => {
                    window.location.href = 'thank_you.html';
                }, 1000);
            } else {
                window.location.href = 'thank_you.html';
            }
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a[href^="#"]');
                if (!anchor) return;

                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetId = href.substring(1);
                const target = document.getElementById(targetId);

                if (target) {
                    e.preventDefault();
                    const headerOffset = CONFIG.HEADER_OFFSET;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    class ScrollSpy {
        constructor() {
            this.sections = document.querySelectorAll('.l-section[id]');
            this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
            this.init();
        }

        init() {
            if (this.sections.length === 0) return;

            window.addEventListener('scroll', throttle(() => {
                this.updateActiveLink();
            }, CONFIG.SCROLL_THROTTLE));

            this.updateActiveLink();
        }

        updateActiveLink() {
            let current = '';
            const scrollPosition = window.pageYOffset + CONFIG.HEADER_OFFSET + 50;

            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    class CountUpAnimation {
        constructor() {
            this.counters = document.querySelectorAll('[data-count]');
            this.init();
        }

        init() {
            if (this.counters.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        this.animateCounter(entry.target);
                        entry.target.classList.add('counted');
                    }
                });
            }, { threshold: 0.5 });

            this.counters.forEach(counter => observer.observe(counter));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };

            updateCounter();
        }
    }

    class ImageLoader {
        constructor() {
            this.init();
        }

        init() {
            const images = document.querySelectorAll('img:not([loading])');
            
            images.forEach(img => {
                if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
                    img.setAttribute('loading', 'lazy');
                }

                if (!img.classList.contains('img-fluid')) {
                    img.classList.add('img-fluid');
                }

                img.addEventListener('error', (e) => {
                    const placeholder = 'data:image/svg+xml;base64,' + btoa(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
                        '<rect width="100%" height="100%" fill="#f8f9fa"/>' +
                        '<text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle" dy=".3em">Bild nicht verfügbar</text>' +
                        '</svg>'
                    );
                    e.target.src = placeholder;
                    e.target.style.objectFit = 'contain';
                }, { once: true });
            });
        }
    }

    class PrivacyModal {
        constructor() {
            this.init();
        }

        init() {
            const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
            
            privacyLinks.forEach(link => {
                if (link.getAttribute('href') === '#' || link.textContent.toLowerCase().includes('datenschutz')) {
                    link.addEventListener('click', (e) => {
                        if (window.location.pathname.includes('privacy')) return;
                        e.preventDefault();
                        window.location.href = 'privacy.html';
                    });
                }
            });
        }
    }

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes ripple-effect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .spinner-border {
            display: inline-block;
            vertical-align: text-bottom;
            border: 0.15em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-border 0.75s linear infinite;
        }

        @keyframes spinner-border {
            to { transform: rotate(360deg); }
        }

        .c-button, .btn {
            transition: transform 0.15s ease-in-out, box-shadow 0.25s ease-in-out;
        }

        .card, .c-card {
            transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
        }

        .nav-link {
            transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
        }

        .form-control, .form-select {
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .navbar-collapse {
            transition: max-height 0.3s ease-in-out;
        }

        .invalid-feedback {
            animation: shake 0.3s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(styleElement);

    function init() {
        if (window.__app.initialized) return;
        window.__app.initialized = true;

        new BurgerMenu();
        new ScrollAnimations();
        new ButtonAnimations();
        new FormValidator();
        new SmoothScroll();
        new ScrollSpy();
        new CountUpAnimation();
        new ImageLoader();
        new PrivacyModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
