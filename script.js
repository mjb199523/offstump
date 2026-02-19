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

    if (bookingForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Gather form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());

            // Build email mailto link
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

            // Open email client
            window.open(`mailto:offstump26@gmail.com?subject=${subject}&body=${body}`, '_blank');

            // Show success message
            bookingForm.style.display = 'none';
            bookingSuccess.classList.add('show');

            // Reset after 5 seconds
            setTimeout(() => {
                bookingForm.reset();
                bookingForm.style.display = 'flex';
                bookingSuccess.classList.remove('show');
            }, 5000);
        });
    }

    // === SMOOTH SCROLL FOR ANCHOR LINKS ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // === MICRO INTERACTIONS ===
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
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
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // === PARALLAX ON MOUSE (Desktop only) ===
    if (window.innerWidth > 768) {
        const heroLogo = document.querySelector('.hero-logo-svg');
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
