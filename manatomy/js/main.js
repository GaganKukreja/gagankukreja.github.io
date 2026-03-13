/* ============================================================
   THE MARKETING ANATOMY — Main JavaScript v2
   SliderRevolution-inspired: particles, morph blobs, scroll
   choreography, char-split text, mouse-depth, clip reveals
   ============================================================ */

(function () {
    'use strict';

    const EASE = 'cubic-bezier(0.16,1,0.3,1)';
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 1. PAGE LOADER */
    function initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;
        const go = () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
                requestAnimationFrame(() => { initHeroEntrance(); initParticleCanvas(); });
            }, 800);
        };
        if (document.readyState === 'complete') go();
        else window.addEventListener('load', go);
        setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; }, 4000);
    }

    /* 2. INTERACTIVE PARTICLE CANVAS — mouse-reactive network */
    function initParticleCanvas() {
        const canvas = document.getElementById('heroParticles');
        if (!canvas || noMotion) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [], mouse = { x: -1000, y: -1000 };
        const COUNT = isMobile ? 30 : 65;
        const DIST = isMobile ? 100 : 140;
        const MRAD = 160;

        function resize() { w = canvas.width = canvas.parentElement.offsetWidth; h = canvas.height = canvas.parentElement.offsetHeight; }

        class P {
            constructor() { this.x = Math.random()*w; this.y = Math.random()*h; this.vx = (Math.random()-0.5)*0.4; this.vy = (Math.random()-0.5)*0.4; this.r = Math.random()*2+0.5; this.a = Math.random()*0.35+0.08; }
            update() {
                const dx = this.x-mouse.x, dy = this.y-mouse.y, d = Math.sqrt(dx*dx+dy*dy);
                if (d < MRAD && d > 0) { const f = (MRAD-d)/MRAD; this.vx += (dx/d)*f*0.5; this.vy += (dy/d)*f*0.5; }
                this.vx *= 0.98; this.vy *= 0.98; this.x += this.vx; this.y += this.vy;
                if (this.x < 0) this.x = w; if (this.x > w) this.x = 0; if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
            }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle = `rgba(243,204,213,${this.a})`; ctx.fill(); }
        }

        function setup() { resize(); particles = []; for (let i = 0; i < COUNT; i++) particles.push(new P()); }
        function loop() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(); particles[i].draw();
                for (let j = i+1; j < particles.length; j++) {
                    const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y, d = Math.sqrt(dx*dx+dy*dy);
                    if (d < DIST) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(243,204,213,${(1-d/DIST)*0.1})`; ctx.lineWidth = 0.6; ctx.stroke(); }
                }
            }
            requestAnimationFrame(loop);
        }

        canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; });
        canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
        window.addEventListener('resize', resize);
        setup(); loop();
    }

    /* 3. MORPHING SVG BLOB */
    function initMorphBlob() {
        const blob = document.querySelector('.morph-blob');
        if (!blob || noMotion) return;
        let t = 0;
        function path(time) {
            const pts = 6; let d = ''; const cx = 150, cy = 150;
            for (let i = 0; i <= pts; i++) {
                const a = (i/pts)*Math.PI*2;
                const r = 100 + Math.sin(time+i*1.2)*25 + Math.cos(time*0.7+i*0.8)*15;
                d += (i===0?'M':'L')+(cx+Math.cos(a)*r).toFixed(1)+','+(cy+Math.sin(a)*r).toFixed(1);
            }
            return d+'Z';
        }
        (function anim() { t += 0.008; blob.setAttribute('d', path(t)); requestAnimationFrame(anim); })();
    }

    /* 4. SMOOTH SCROLL */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const id = a.getAttribute('href'); if (id === '#') return;
                const t = document.querySelector(id); if (!t) return;
                e.preventDefault();
                window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            });
        });
    }

    /* 5. NAVIGATION */
    function initNav() {
        const nav = document.querySelector('.nav'), hb = document.querySelector('.nav-hamburger'), ov = document.querySelector('.mobile-overlay');
        if (!nav) return;
        let last = 0, tick = false;
        window.addEventListener('scroll', () => {
            if (tick) return; tick = true;
            requestAnimationFrame(() => {
                const s = window.scrollY; nav.classList.toggle('scrolled', s > 50);
                if (s > 400) nav.style.transform = s > last+6 ? 'translateY(-100%)' : 'translateY(0)';
                else nav.style.transform = 'translateY(0)';
                last = s; tick = false;
            });
        }, { passive: true });
        nav.style.transition += `, transform 0.45s ${EASE}`;
        if (hb && ov) {
            hb.addEventListener('click', () => { hb.classList.toggle('open'); ov.classList.toggle('open'); document.body.style.overflow = ov.classList.contains('open') ? 'hidden' : ''; });
            ov.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { hb.classList.remove('open'); ov.classList.remove('open'); document.body.style.overflow = ''; }));
        }
    }

    /* 6. HERO ENTRANCE */
    function initHeroEntrance() {
        document.querySelectorAll('[data-hero-anim]').forEach((el, i) => {
            setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, parseInt(el.dataset.heroAnim||'0') + i*60);
        });
        setTimeout(() => { document.querySelectorAll('.hc-bar-fill').forEach(b => b.classList.add('animated')); }, 1400);
    }
    function setHeroInitialStates() {
        document.querySelectorAll('[data-hero-anim]').forEach(el => {
            el.style.opacity = '0'; el.style.transform = 'translateY(40px)';
            el.style.transition = `opacity 1s ${EASE}, transform 1s ${EASE}`;
        });
    }

    /* 7. TEXT SPLIT — word-by-word 3D reveal */
    function initTextReveal() {
        const h = document.querySelector('.hero-heading');
        if (!h || noMotion) return;
        const tmp = document.createElement('div'); tmp.innerHTML = h.innerHTML;
        function proc(n) {
            if (n.nodeType === 3) {
                const frag = document.createDocumentFragment();
                n.textContent.split(/(\s+)/).forEach(w => {
                    if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
                    const s = document.createElement('span'); s.className = 'hw'; s.textContent = w; frag.appendChild(s);
                });
                n.parentNode.replaceChild(frag, n);
            } else if (n.nodeType === 1) Array.from(n.childNodes).forEach(proc);
        }
        Array.from(tmp.childNodes).forEach(proc);
        h.innerHTML = tmp.innerHTML;
        const words = h.querySelectorAll('.hw');
        words.forEach((w, i) => {
            Object.assign(w.style, { display: 'inline-block', opacity: '0', transform: 'translateY(25px) rotateX(40deg)', transition: `opacity 0.7s ${EASE} ${0.9+i*0.045}s, transform 0.7s ${EASE} ${0.9+i*0.045}s`, transformOrigin: 'bottom center' });
        });
        setTimeout(() => words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'translateY(0) rotateX(0)'; }), 100);
    }

    /* 8. SCROLL REVEAL */
    function initScrollReveal() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('[data-reveal],[data-stagger]').forEach(el => obs.observe(el));
    }

    /* 9. PARALLAX */
    function initParallax() {
        const els = document.querySelectorAll('[data-speed]');
        if (!els.length || noMotion) return;
        let raf = null;
        window.addEventListener('scroll', () => {
            if (!raf) raf = requestAnimationFrame(() => {
                els.forEach(el => {
                    const sp = parseFloat(el.dataset.speed)||0;
                    const r = el.getBoundingClientRect();
                    el.style.transform = `translateY(${(r.top+r.height/2-window.innerHeight/2)*sp}px)`;
                });
                raf = null;
            });
        }, { passive: true });
    }

    /* 10. MOUSE-REACTIVE DEPTH (SliderRevolution depth layers) */
    function initMouseDepth() {
        if (isMobile || noMotion) return;
        const hero = document.querySelector('.hero'), layers = document.querySelectorAll('[data-depth]');
        if (!hero || !layers.length) return;
        let mx = 0, my = 0, cx = 0, cy = 0;
        hero.addEventListener('mousemove', e => { const r = hero.getBoundingClientRect(); mx = (e.clientX-r.left)/r.width-0.5; my = (e.clientY-r.top)/r.height-0.5; });
        (function anim() {
            cx += (mx-cx)*0.05; cy += (my-cy)*0.05;
            layers.forEach(l => { const d = parseFloat(l.dataset.depth)||1; l.style.transform = `translate(${cx*d*35}px,${cy*d*35}px)`; });
            requestAnimationFrame(anim);
        })();
    }

    /* 11. ANIMATED COUNTERS */
    function initCounters() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { const el = e.target, t = parseFloat(el.dataset.count), s = el.dataset.suffix||'', dec = (t%1!==0)?1:0, dur = 2200, st = performance.now(); (function tick(now) { const p = Math.min((now-st)/dur,1); el.textContent = (t*(1-Math.pow(1-p,4))).toFixed(dec)+s; if (p<1) requestAnimationFrame(tick); })(st); obs.unobserve(el); } });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
    }

    /* 12. MAGNETIC HOVER */
    function initMagnetic() {
        if (isMobile) return;
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.18}px,${(e.clientY-r.top-r.height/2)*0.18}px)`; });
            el.addEventListener('mouseleave', () => { el.style.transition = `transform 0.5s ${EASE}`; el.style.transform = 'translate(0,0)'; setTimeout(() => el.style.transition = '', 500); });
        });
    }

    /* 13. 3D TILT */
    function initTilt() {
        const c = document.querySelector('.hero-card'); if (!c || isMobile) return;
        c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(600px) rotateY(${((e.clientX-r.left)/r.width-0.5)*10}deg) rotateX(${-((e.clientY-r.top)/r.height-0.5)*10}deg) scale(1.02)`; });
        c.addEventListener('mouseleave', () => { c.style.transition = `transform 0.7s ${EASE}`; c.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)'; setTimeout(() => c.style.transition = '', 700); });
    }

    /* 14. SCROLL PROGRESS BAR */
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress'); if (!bar) return;
        window.addEventListener('scroll', () => { const h = document.documentElement.scrollHeight-window.innerHeight; bar.style.width = (h>0?(window.scrollY/h)*100:0)+'%'; }, { passive: true });
    }

    /* 15. SECTION CLIP-PATH REVEALS */
    function initClipReveals() {
        const secs = document.querySelectorAll('[data-clip-reveal]');
        if (!secs.length || noMotion) return;
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.style.clipPath = 'inset(0 0 0 0)'; obs.unobserve(e.target); } });
        }, { threshold: 0.05 });
        secs.forEach(el => { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transition = `clip-path 1.2s ${EASE}`; obs.observe(el); });
    }

    /* 16. NEWSLETTER */
    function initNewsletter() {
        const f = document.getElementById('nlForm'); if (!f) return;
        f.addEventListener('submit', e => { e.preventDefault(); const w = f.parentElement; f.style.display = 'none'; const m = document.createElement('p'); m.className = 'nl-success'; m.textContent = "You're in! Check your inbox ✓"; w.appendChild(m); });
    }

    /* 17. CUSTOM CURSOR */
    function initCursor() {
        if (isMobile) return;
        const c = document.createElement('div'); c.id = 'custom-cursor';
        Object.assign(c.style, { width:'18px',height:'18px',border:'1.5px solid rgba(255,255,255,0.5)',borderRadius:'50%',position:'fixed',top:'0',left:'0',pointerEvents:'none',zIndex:'9999',mixBlendMode:'difference',transition:`width 0.3s ${EASE},height 0.3s ${EASE},background 0.3s,border-color 0.3s`,transform:'translate(-50%,-50%)',willChange:'transform' });
        document.body.appendChild(c);
        let cx=0,cy=0,tx=0,ty=0;
        document.addEventListener('mousemove', e => { tx=e.clientX; ty=e.clientY; });
        (function anim() { cx+=(tx-cx)*0.12; cy+=(ty-cy)*0.12; c.style.left=cx+'px'; c.style.top=cy+'px'; requestAnimationFrame(anim); })();
        const tgts = 'a,button,.svc-card,.res-card,.aud-card,.testi-card,.work-card,.price-card,.value-card,[data-magnetic]';
        document.querySelectorAll(tgts).forEach(el => {
            el.addEventListener('mouseenter', () => { c.style.width='50px'; c.style.height='50px'; c.style.background='rgba(243,204,213,0.08)'; c.style.borderColor='rgba(243,204,213,0.35)'; });
            el.addEventListener('mouseleave', () => { c.style.width='18px'; c.style.height='18px'; c.style.background='transparent'; c.style.borderColor='rgba(255,255,255,0.5)'; });
        });
    }

    /* 18. BLOB PARALLAX */
    function initSectionTransitions() {
        const b = document.querySelectorAll('.hero-blob'); if (!b.length) return;
        window.addEventListener('scroll', () => { const s = window.scrollY; b.forEach(x => x.style.transform = `translateY(${s*0.08}px)`); }, { passive: true });
    }

    /* INIT */
    function init() {
        setHeroInitialStates(); initLoader(); initSmoothScroll(); initNav(); initScrollReveal(); initParallax();
        initMouseDepth(); initCounters(); initMagnetic(); initTilt(); initMorphBlob(); initNewsletter();
        initTextReveal(); initCursor(); initScrollProgress(); initClipReveals(); initSectionTransitions();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
