/* =============================================
   OFFSTUMP — JavaScript
   Navbar, Scroll Reveal, Particles, Form, etc.
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // === NAVBAR SCROLL EFFECT ===
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    // Navbar scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Mobile nav toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // === ACTIVE NAV LINK ON SCROLL ===
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollPos = window.pageYOffset + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinkItems.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // === SCROLL REVEAL ANIMATION ===
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the reveal for sibling elements
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('[data-reveal]');
                let delay = 0;
                siblings.forEach((sibling, i) => {
                    if (sibling === entry.target) {
                        delay = i * 100;
                    }
                });

                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // === HERO PARTICLES ===
    const particlesContainer = document.querySelector('.hero-particles');
    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const x = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 4 + 4;
        const opacity = Math.random() * 0.5 + 0.1;

        particle.style.cssText = `
            left: ${x}%;
            bottom: -10px;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 3}s;
            opacity: ${opacity};
        `;

        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, (duration + 3) * 1000);
    }

    // Create particles periodically
    setInterval(createParticle, 400);
    // Create initial batch
    for (let i = 0; i < 15; i++) {
        setTimeout(createParticle, i * 200);
    }

    // === BOOKING FORM ===
    const bookingForm = document.getElementById('bookingForm');
    const bookingSuccess = document.getElementById('bookingSuccess');
    const submitBtn = document.getElementById('booking-submit');

    if (bookingForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Gather form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());

            // Show loading state
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span style="display:inline-flex;align-items:center;gap:8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Submitting...
                </span>
            `;

            // Add spin animation if not already present
            if (!document.getElementById('spin-style')) {
                const spinStyle = document.createElement('style');
                spinStyle.id = 'spin-style';
                spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
                document.head.appendChild(spinStyle);
            }

            try {
                // API URL: Use relative path (works on both localhost and Vercel)
                const response = await fetch('/api/book-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // SUCCESS
                    bookingForm.style.display = 'none';
                    bookingSuccess.classList.add('show');

                    // Reset form after 5 seconds
                    setTimeout(() => {
                        bookingForm.reset();
                        bookingForm.style.display = 'flex';
                        bookingSuccess.classList.remove('show');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnContent;
                    }, 5000);
                } else {
                    // VALIDATION ERROR from server
                    const errorMsg = result.errors ? result.errors.join(', ') : result.message;
                    showFormError(errorMsg);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }
            } catch (error) {
                console.warn('API unreachable, falling back to mailto:', error.message);

                // FALLBACK: open email if server is not running
                const subject = encodeURIComponent(`OFFSTUMP Booking Request - ${data.activity}`);
                const body = encodeURIComponent(
                    `New Booking Request\n\n` +
                    `Name: ${data.name}\n` +
                    `Phone: ${data.phone}\n` +
                    `Email: ${data.email}\n` +
                    `Activity: ${data.activity}\n` +
                    `Date: ${data.date}\n` +
                    `Time: ${data.time}\n` +
                    `Message: ${data.message || 'N/A'}\n`
                );
                window.open(`mailto:offstump26@gmail.com?subject=${subject}&body=${body}`, '_blank');

                // Still show success
                bookingForm.style.display = 'none';
                bookingSuccess.classList.add('show');

                setTimeout(() => {
                    bookingForm.reset();
                    bookingForm.style.display = 'flex';
                    bookingSuccess.classList.remove('show');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }, 5000);
            }
        });
    }

    // Error message helper
    function showFormError(message) {
        // Remove existing error if any
        const existing = document.querySelector('.form-error-msg');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-msg';
        errorDiv.style.cssText = `
            background: rgba(255, 59, 48, 0.1);
            border: 1px solid rgba(255, 59, 48, 0.3);
            color: #FF6B6B;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 0.9rem;
            margin-bottom: 16px;
            text-align: center;
            animation: fadeInUp 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        bookingForm.prepend(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // === SMOOTH SCROLL FOR ANCHOR LINKS ===
    const navbarHeight = 70;
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === MICRO INTERACTIONS ===
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // === FORM INPUT ANIMATIONS ===
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

    // === PARALLAX ON MOUSE (Desktop only) ===
    if (window.innerWidth > 768) {
        const heroLogo = document.querySelector('.hero-logo-img');
        document.querySelector('.hero').addEventListener('mousemove', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

            if (heroLogo) {
                heroLogo.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
            }
        });
    }

    // === COUNTER ANIMATION (if needed later) ===
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        function update() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }
        update();
    }

    console.log('%c🏏 OFFSTUMP', 'color: #FF6A00; font-size: 24px; font-weight: bold;');
    console.log('%cPlay Beyond The Line', 'color: #FF8C33; font-size: 14px;');
});
