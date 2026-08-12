/* =============================================
   OFFSTUMP — JavaScript
   Navbar, Scroll Reveal, Particles, Form, etc.
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    window.initialPathname = window.location.pathname;

    // === THEME TOGGLE LOGIC ===
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        });
    }


    // === ANALYTICS TRACKING ===
    const trackEvent = async (eventName, metadata = {}) => {
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: eventName,
                    page_path: window.location.pathname,
                    referrer: document.referrer || '',
                    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    metadata
                })
            });
        } catch (e) {
            console.error('Tracking failed', e);
        }
    };

    // 1. Track Page View
    trackEvent('page_view');

    // 2. Track WhatsApp Clicks
    document.querySelectorAll('a[href*="whatsapp.com"], a[href*="wa.me"]').forEach(el => {
        el.addEventListener('click', () => {
            trackEvent('whatsapp_channel_click', { url: el.href });
        });
    });

    // 3. Track Call Clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
        el.addEventListener('click', () => {
            trackEvent('call_click', { phone: el.href });
        });
    });

    // 4. Track Email Clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.addEventListener('click', () => {
            trackEvent('email_click', { email: el.href });
        });
    });

    // 5. Track Service Clicks
    document.querySelectorAll('.service-card .service-link').forEach(el => {
        el.addEventListener('click', (e) => {
            const card = e.target.closest('.service-card');
            const serviceName = card ? card.querySelector('h3').innerText : 'unknown';
            trackEvent('service_click', { service: serviceName });
        });
    });



    // === NAVBAR SCROLL EFFECT ===
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    // Navbar scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
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
            let selector = `.nav-links a[href="#${id}"], .nav-links a[href="/#${id}"], .nav-links a[href="/${id}"]`;
            if (id === 'hero') {
                selector += `, .nav-links a[href="/home"], .nav-links a[href="/"]`;
            }
            const link = document.querySelector(selector);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    if (!link.classList.contains('active')) {
                        navLinkItems.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                        // Update URL silently to reflect current section
                        let newUrl = id === 'hero' ? '/home' : `/${id}`;
                        if (window.location.pathname !== newUrl && window.location.pathname !== '/auth/login') {
                            history.replaceState(null, null, newUrl);
                        }
                    }
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
            if (particle && particle.parentNode) {
                particle.remove();
            }
        }, (duration + 3) * 1000);
    }

    if (particlesContainer) {
        // Create particles periodically
        setInterval(createParticle, 400);
        // Create initial batch
        for (let i = 0; i < 15; i++) {
            setTimeout(createParticle, i * 200);
        }
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
                    trackEvent('contact_form_submit', { activity: data.activity });
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

    const navSections = ['home', 'hero', 'about', 'services', 'machine', 'booking', 'contact', 'community', 'learn-more'];
    const navSelectors = navSections.map(s => `a[href="/${s}"], a[href="#${s}"], a[href="/#${s}"]`).join(', ') + ', a[href="/"]';
    
    // Intercept clicks on any internal section link
    document.querySelectorAll(navSelectors).forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            let id = '';
            
            if (href === '/' || href === '/home') {
                id = 'hero';
            } else if (href.startsWith('/#')) {
                id = href.substring(2);
            } else if (href.startsWith('#')) {
                id = href.substring(1);
            } else if (href.startsWith('/')) {
                id = href.substring(1);
            }
            
            const target = document.querySelector('#' + id);
            
            if (target) {
                // We are on a page that has the target element (like homepage)
                // Update URL cleanly without reloading
                let newUrl = id === 'hero' ? '/home' : `/${id}`;
                if (window.location.pathname !== newUrl) {
                    history.pushState(null, null, newUrl);
                }
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else {
                // If the section doesn't exist on this page (like inner pages)
                // Send them to the URL natively, let server handle it
                window.location.href = href;
            }
        });
    });

    // Check if we loaded directly onto a static section route
    const staticSections = ['home', 'about', 'services', 'machine', 'booking', 'contact', 'community', 'learn-more'];
    // Use window.initialPathname which we will define at the top of the file
    const currentPath = (window.initialPathname || window.location.pathname).substring(1); // remove leading slash
    
    if (staticSections.includes(currentPath) || window.location.search.includes('goto=booking')) {
        // Clean URL if we arrived via fallback
        if (window.location.search.includes('goto=booking')) {
            history.replaceState(null, null, '/booking');
        }

        const targetId = (staticSections.includes(currentPath) && currentPath !== 'home') ? currentPath : (currentPath === 'home' ? 'hero' : 'booking');
        const target = document.querySelector('#' + targetId);
        
        if (target) {
            setTimeout(() => {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 300); // small delay to ensure DOM is ready and hero animation doesn't disrupt scroll
        }
    }

    if (window.location.hash) {
        // Save the target immediately before any other scripts run
        const hashId = window.location.hash.substring(1);
        const hashTarget = document.querySelector('#' + hashId);
        
        if (hashTarget) {
            setTimeout(() => {
                const targetPosition = hashTarget.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                if (hashId === 'hero') {
                    history.replaceState(null, null, '/home');
                } else {
                    history.replaceState(null, null, `/${hashId}`);
                }
            }, 300);
        }
    }

    // === MAKE ENTIRE MARQUEE CLICKABLE ===
    const marqueeBanner = document.querySelector('.marquee-banner');
    if (marqueeBanner) {
        marqueeBanner.style.cursor = 'pointer';
        marqueeBanner.addEventListener('click', (e) => {
            // Check if they clicked an actual anchor to prevent double-firing if JS handles it
            if (e.target.tagName.toLowerCase() !== 'a' && !e.target.closest('a')) {
                const bookingLink = document.querySelector('a[href="/booking"]');
                if (bookingLink) {
                    bookingLink.click();
                } else {
                    window.location.href = '/booking';
                }
            }
        });
    }

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
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
                const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

                if (heroLogo) {
                    heroLogo.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
                }
            });
        }
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
// Video Carousel Scroll Logic
document.addEventListener('DOMContentLoaded', () => {
    const initCarousel = (carouselId) => {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        const items = Array.from(carousel.querySelectorAll('.carousel-item'));
        
        items.forEach(item => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        });

        const updateCarousel = () => {
            const carouselCenter = carousel.getBoundingClientRect().left + carousel.offsetWidth / 2;
            
            items.forEach(item => {
                const itemCenter = item.getBoundingClientRect().left + item.offsetWidth / 2;
                const dist = Math.abs(carouselCenter - itemCenter);
                
                if (dist < item.offsetWidth / 2 + 10) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                    item.classList.add('active');
                } else {
                    item.style.opacity = '0.4';
                    item.style.transform = 'scale(0.9)';
                    item.classList.remove('active');
                }
            });
        };

        carousel.addEventListener('scroll', () => requestAnimationFrame(updateCarousel));
        window.addEventListener('resize', updateCarousel);
        setTimeout(() => {
            const centerIndex = Math.floor(items.length / 2);
            if (items[centerIndex]) {
                const scrollPos = items[centerIndex].offsetLeft - carousel.clientWidth / 2 + items[centerIndex].offsetWidth / 2;
                carousel.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
            updateCarousel();
        }, 150);
    };
    
    initCarousel('aboutVideoCarousel');
    initCarousel('setupVideoCarousel');
});




// Lazy Load Videos
document.addEventListener('DOMContentLoaded', () => {
    const lazyVideos = document.querySelectorAll('.lazy-video');
    if (lazyVideos.length === 0) return;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                video.play().catch(e => console.log('Autoplay prevented', e));
                videoObserver.unobserve(video);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });

    lazyVideos.forEach(video => videoObserver.observe(video));
});


// === SETUP CAROUSEL LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    const setupCarousel = document.getElementById('setupVideoCarousel');
    const prevBtn = document.getElementById('setupPrevBtn');
    const nextBtn = document.getElementById('setupNextBtn');

    if (setupCarousel && prevBtn && nextBtn) {
        // Scroll by item width (200px) + gap (16px) = 216px
        const scrollByWidth = () => 216;

        prevBtn.addEventListener('click', () => {
            setupCarousel.scrollBy({ left: -scrollByWidth(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            setupCarousel.scrollBy({ left: scrollByWidth(), behavior: 'smooth' });
        });
    }
});

// === SEO EXPLORE MORE CAROUSEL LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    const seoTrack = document.getElementById('seoLinksTrack');
    const seoPrev = document.getElementById('seoCarouselPrev');
    const seoNext = document.getElementById('seoCarouselNext');

    if (!seoTrack || !seoPrev || !seoNext) return;

    // Card width + gap (20px)
    const getScrollAmount = () => {
        const card = seoTrack.querySelector('.seo-link-card');
        if (!card) return 300;
        return card.getBoundingClientRect().width + 20;
    };

    const updateButtons = () => {
        const atStart = seoTrack.scrollLeft <= 4;
        const atEnd = seoTrack.scrollLeft + seoTrack.clientWidth >= seoTrack.scrollWidth - 4;
        seoPrev.disabled = atStart;
        seoNext.disabled = atEnd;
    };

    seoPrev.addEventListener('click', () => {
        seoTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    seoNext.addEventListener('click', () => {
        seoTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    seoTrack.addEventListener('scroll', updateButtons, { passive: true });

    // Initial state
    updateButtons();
});

// === INDEPENDENCE DAY CAMPAIGN ===
document.addEventListener('DOMContentLoaded', () => {
    const CAMPAIGN_CONFIG = {
        id: "independence-day-2026",
        enabled: true,
        startDate: "2026-08-12T00:00:00",
        endDate: "2026-08-31T23:59:59", // Expires End of 31 Aug 2026
        title: "INDEPENDENCE DAY SPECIAL",
        sessionText: "10 OVERS CRICKET SESSION",
        originalPrice: "₹100",
        offerPrice: "₹90",
        discount: "10% OFF",
        trialText: "1 OVER FREE TRIAL INCLUDED",
        validityText: "EXTENDED TILL 31 AUGUST 2026",
        ctaText: "BOOK YOUR SLOT &rarr;"
    };

    const overlay = document.getElementById('promoModal');
    const badge = document.getElementById('promoBadge');
    if (!overlay || !badge || !CAMPAIGN_CONFIG.enabled) return;

    // Check Expiry (Browser local time)
    const now = new Date();
    const expiryDate = new Date(CAMPAIGN_CONFIG.endDate);
    if (now > expiryDate) {
        // Campaign expired, silently exit, do not render
        overlay.remove();
        badge.remove();
        return;
    }

    // Populate Data (Allows centralized config management)
    const elTitle = document.getElementById('promoModalTitle');
    const elSession = document.getElementById('promoSession');
    const elOffer = document.getElementById('promoOfferPrice');
    const elOriginal = document.getElementById('promoOriginalPrice');
    const elDiscount = document.getElementById('promoDiscount');
    const elTrial = document.getElementById('promoTrial');
    const elValidity = document.getElementById('promoValidity');
    const elCta = document.getElementById('promoCtaText');
    const badgeDMain = document.getElementById('badgeDesktopMain');
    const badgeDSub = document.getElementById('badgeDesktopSub');
    const badgeMobile = document.getElementById('badgeMobileMain');

    if (elTitle) elTitle.innerHTML = CAMPAIGN_CONFIG.title;
    if (elSession) elSession.innerHTML = CAMPAIGN_CONFIG.sessionText;
    if (elOffer) elOffer.innerHTML = CAMPAIGN_CONFIG.offerPrice;
    if (elOriginal) elOriginal.innerHTML = CAMPAIGN_CONFIG.originalPrice;
    if (elDiscount) elDiscount.innerHTML = CAMPAIGN_CONFIG.discount;
    if (elTrial) elTrial.innerHTML = CAMPAIGN_CONFIG.trialText;
    if (elValidity) elValidity.innerHTML = CAMPAIGN_CONFIG.validityText;
    if (elCta) elCta.innerHTML = CAMPAIGN_CONFIG.ctaText;
    
    if (badgeDMain) badgeDMain.innerHTML = `10 Overs <span style="text-decoration: line-through; color: #A8A49C; margin-right: 4px;">${CAMPAIGN_CONFIG.originalPrice}</span> ${CAMPAIGN_CONFIG.offerPrice}`;
    if (badgeDSub) badgeDSub.innerHTML = `${CAMPAIGN_CONFIG.discount} &middot; Till 31 Aug 2026`;
    if (badgeMobile) badgeMobile.innerHTML = `<span>10 Overs <span style="text-decoration: line-through; color: #A8A49C; margin-right: 4px;">${CAMPAIGN_CONFIG.originalPrice}</span> ${CAMPAIGN_CONFIG.offerPrice}</span><span style="font-size: 0.85rem; color: #6B6862; margin-top: 2px; font-weight: 500;">${CAMPAIGN_CONFIG.discount} &middot; Till 31 Aug 2026</span>`;

    const closeBtn = document.getElementById('promoCloseBtn');
    const ctaBtn = document.getElementById('promoCtaBtn');

    // State Key
    const storageKey = `offstump_${CAMPAIGN_CONFIG.id}_seen`;
    
    // Check if on homepage
    const currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize trailing slash
    const isHomePage = currentPath === '' || currentPath === '/home' || currentPath === '/index.html';

    const showModal = () => {
        overlay.classList.add('active');
        badge.classList.remove('active');
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    };

    const hideModal = () => {
        overlay.classList.remove('active');
        badge.classList.add('active');
        document.body.style.overflow = '';
        localStorage.setItem(storageKey, 'true');
    };

    // Auto-trigger logic
    const hasSeenPromo = localStorage.getItem(storageKey);
    if (!hasSeenPromo && isHomePage) {
        setTimeout(showModal, 1800); // Trigger after 1.8s
    } else if (hasSeenPromo) {
        // If they've seen it before, just show the badge silently
        badge.classList.add('active');
    }

    // Event Listeners
    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hideModal();
        }
    });

    badge.addEventListener('click', () => {
        showModal();
    });

    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            hideModal(); // Close modal on CTA click, existing anchor logic handles the smooth scroll
        });
    }
});

// ==========================================
// DYNAMIC GOOGLE RATING FETCH
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const scoreElement = document.getElementById('live-google-rating-score');
    const countElement = document.getElementById('live-google-rating-count');
    
    // Only proceed if the elements exist on the current page
    if (!scoreElement || !countElement) return;

    try {
        const response = await fetch('/api/google-reviews');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data && data.rating && data.reviews) {
            scoreElement.textContent = `${data.rating} on Google`;
            countElement.textContent = `${data.reviews} Reviews`;
        }
    } catch (error) {
        console.error('Failed to fetch live Google rating:', error);
        // Elements gracefully fallback to their hardcoded static values
    }
});
