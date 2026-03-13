/* ============================================================
   THE MARKETING ANATOMY — Main JavaScript
   Smooth scroll, parallax, scroll reveals, counters, nav FX
   ============================================================ */

(function () {
    'use strict';

    /* ---------------------------------------------------------
       1. PAGE LOADER
    --------------------------------------------------------- */
    function initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
                // Trigger hero entrance after loader
                requestAnimationFrame(initHeroEntrance);
            }, 700);
        });
        // Fallback
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 3000);
    }

    /* ---------------------------------------------------------
       2. SMOOTH SCROLLING (lightweight custom implementation)
    --------------------------------------------------------- */
    function initSmoothScroll() {
        // CSS scroll-behavior: smooth handles anchor links
        // We add extra offset for fixed nav
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
                const y = target.getBoundingClientRect().top + window.scrollY - navH - 20;
                window.scrollTo({ top: y, behavior: 'smooth' });
            });
        });
    }

    /* ---------------------------------------------------------
       3. NAVIGATION
    --------------------------------------------------------- */
    function initNav() {
        const nav = document.querySelector('.nav');
        const hamburger = document.querySelector('.nav-hamburger');
        const overlay = document.querySelector('.mobile-overlay');
        if (!nav) return;

        // Scroll effect
        let lastScroll = 0;
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                nav.classList.toggle('scrolled', sy > 50);

                // Hide/show on scroll direction (subtle)
                if (sy > 400) {
                    if (sy > lastScroll + 8) {
                        nav.style.transform = 'translateY(-100%)';
                    } else if (sy < lastScroll - 8) {
                        nav.style.transform = 'translateY(0)';
                    }
                } else {
                    nav.style.transform = 'translateY(0)';
                }
                lastScroll = sy;
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        nav.style.transition += ', transform 0.4s cubic-bezier(0.16,1,0.3,1)';

        // Mobile menu
        if (hamburger && overlay) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('open');
                overlay.classList.toggle('open');
                document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
            });
            overlay.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    hamburger.classList.remove('open');
                    overlay.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }
    }

    /* ---------------------------------------------------------
       4. HERO ENTRANCE ANIMATION
    --------------------------------------------------------- */
    function initHeroEntrance() {
        const els = document.querySelectorAll('[data-hero-anim]');
        els.forEach((el, i) => {
            const delay = parseInt(el.dataset.heroAnim || '0') + (i * 80);
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        });

        // Animate hero card bars
        setTimeout(() => {
            document.querySelectorAll('.hc-bar-fill').forEach(bar => {
                bar.classList.add('animated');
            });
        }, 1200);
    }

    // Set initial hero states via JS to avoid FOUC
    function setHeroInitialStates() {
        document.querySelectorAll('[data-hero-anim]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(35px)';
            el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
        });
    }

    /* ---------------------------------------------------------
       5. SCROLL REVEAL (IntersectionObserver)
    --------------------------------------------------------- */
    function initScrollReveal() {
        const revealEls = document.querySelectorAll('[data-reveal]');
        const staggerEls = document.querySelectorAll('[data-stagger]');

        const observerOptions = {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealEls.forEach(el => observer.observe(el));
        staggerEls.forEach(el => observer.observe(el));
    }

    /* ---------------------------------------------------------
       6. PARALLAX ON SCROLL
    --------------------------------------------------------- */
    function initParallax() {
        const parallaxEls = document.querySelectorAll('[data-speed]');
        if (!parallaxEls.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let rafId = null;

        function updateParallax() {
            const scrollY = window.scrollY;
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0;
                const rect = el.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const viewH = window.innerHeight;
                const offset = (centerY - viewH / 2) * speed;
                el.style.transform = `translateY(${offset}px)`;
            });
            rafId = null;
        }

        window.addEventListener('scroll', () => {
            if (!rafId) rafId = requestAnimationFrame(updateParallax);
        }, { passive: true });
    }

    /* ---------------------------------------------------------
       7. ANIMATED COUNTERS
    --------------------------------------------------------- */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = (target % 1 !== 0) ? 1 : 0;
        const duration = 2200;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = (target * eased).toFixed(decimals);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* ---------------------------------------------------------
       8. MAGNETIC HOVER ON BUTTONS (Desktop only)
    --------------------------------------------------------- */
    function initMagnetic() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                setTimeout(() => { el.style.transition = ''; }, 500);
            });
        });
    }

    /* ---------------------------------------------------------
       9. TILT EFFECT ON HERO CARD
    --------------------------------------------------------- */
    function initTilt() {
        const card = document.querySelector('.hero-card');
        if (!card || window.matchMedia('(pointer: coarse)').matches) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
            card.style.transform = 'perspective(600px) rotateY(0) rotateX(0)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    }

    /* ---------------------------------------------------------
       10. NEWSLETTER FORM
    --------------------------------------------------------- */
    function initNewsletter() {
        const form = document.getElementById('nlForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const wrap = form.parentElement;
            form.style.display = 'none';
            const msg = document.createElement('p');
            msg.className = 'nl-success';
            msg.textContent = "You're in! Check your inbox ✓";
            wrap.appendChild(msg);
        });
    }

    /* ---------------------------------------------------------
       11. HEADER TEXT SPLIT ANIMATION (on scroll, hero heading)
    --------------------------------------------------------- */
    function initTextReveal() {
        const heading = document.querySelector('.hero-heading');
        if (!heading) return;

        // Wrap each word for individual animation
        const html = heading.innerHTML;
        const words = html.split(/(\s+|<[^>]+>)/g);
        heading.innerHTML = words.map((w, i) => {
            if (w.startsWith('<') || /^\s+$/.test(w) || w === '') return w;
            return `<span class="hw" style="display:inline-block;opacity:0;transform:translateY(20px);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s">${w}</span>`;
        }).join(' ');

        // Trigger after loader
        setTimeout(() => {
            heading.querySelectorAll('.hw').forEach(w => {
                w.style.opacity = '1';
                w.style.transform = 'translateY(0)';
            });
        }, 900);
    }

    /* ---------------------------------------------------------
       12. CUSTOM CURSOR (Desktop)
    --------------------------------------------------------- */
    function initCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.style.cssText = `
            width: 18px; height: 18px;
            border: 1.5px solid rgba(255,255,255,0.6);
            border-radius: 50%;
            position: fixed; top: 0; left: 0;
            pointer-events: none; z-index: 9999;
            mix-blend-mode: difference;
            transition: width 0.25s cubic-bezier(0.16,1,0.3,1),
                        height 0.25s cubic-bezier(0.16,1,0.3,1),
                        background 0.25s;
            transform: translate(-50%, -50%);
            will-change: transform;
        `;
        document.body.appendChild(cursor);

        let cx = 0, cy = 0, tx = 0, ty = 0;

        document.addEventListener('mousemove', (e) => {
            tx = e.clientX;
            ty = e.clientY;
        });

        function lerp(a, b, t) { return a + (b - a) * t; }

        function animate() {
            cx = lerp(cx, tx, 0.15);
            cy = lerp(cy, ty, 0.15);
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
            requestAnimationFrame(animate);
        }
        animate();

        // Hover states
        const hovers = 'a, button, .svc-card, .res-card, .aud-card, .testi-card, [data-magnetic]';
        document.querySelectorAll(hovers).forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '48px';
                cursor.style.height = '48px';
                cursor.style.background = 'rgba(243,204,213,0.1)';
                cursor.style.borderColor = 'rgba(243,204,213,0.4)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '18px';
                cursor.style.height = '18px';
                cursor.style.background = 'transparent';
                cursor.style.borderColor = 'rgba(255,255,255,0.6)';
            });
        });
    }

    /* ---------------------------------------------------------
       13. SECTION BG COLOR TRANSITIONS (Scroll-based)
    --------------------------------------------------------- */
    function initSectionTransitions() {
        // Change nav logo color based on section bg
        // This is handled by the nav.scrolled class
        // But we can add parallax to section decorative elements
        const blobs = document.querySelectorAll('.hero-blob');
        if (!blobs.length) return;

        window.addEventListener('scroll', () => {
            const sy = window.scrollY;
            blobs.forEach(blob => {
                blob.style.transform = `translateY(${sy * 0.08}px)`;
            });
        }, { passive: true });
    }

    /* ---------------------------------------------------------
       INITIALIZE EVERYTHING
    --------------------------------------------------------- */
    function init() {
        setHeroInitialStates();
        initLoader();
        initSmoothScroll();
        initNav();
        initScrollReveal();
        initParallax();
        initCounters();
        initMagnetic();
        initTilt();
        initNewsletter();
        initTextReveal();
        initCursor();
        initSectionTransitions();
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
