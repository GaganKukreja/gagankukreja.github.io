/* ========================================================
   GAGAN KUKREJA — script.js
   ======================================================== */

/* ── CURSOR ── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    document.body.classList.add('cursor-active');
  });

  function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .skill-item, .ex-pill').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ── HAMBURGER / MOBILE MENU ── */
(function initMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function toggle() {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ── NAV SCROLL EFFECT ── */
(function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


/* ── SCROLL REVEAL ── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  items.forEach(el => obs.observe(el));
})();


/* ── COUNTER ANIMATION ── */
(function initCounters() {
  const counters = document.querySelectorAll('.hero-stat-num[data-count]');
  if (!counters.length) return;

  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();


/* ── HERO CANVAS — NODE GRAPH EFFECT ── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ACCENT  = [200, 169, 110];   // gold
  const ACCENT2 = [126, 184, 164];   // teal
  const NODE_COUNT_BASE = 38;

  let W, H, nodes, mouse = { x: -1000, y: -1000 };
  let animId;

  // Keyword labels that float near some nodes
  const LABELS = [
    'SaaS', 'AI', 'ERP', 'PMO', 'CLM', 'Automation',
    'O2C', 'API', 'Cloud', 'Delivery'
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
    build();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function build() {
    const count = Math.round(NODE_COUNT_BASE * Math.min(W / 420, 1));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.28, 0.28),
      vy: rand(-0.28, 0.28),
      r: rand(1.5, 4),
      color: Math.random() > .5 ? ACCENT : ACCENT2,
      label: Math.random() > .65 ? LABELS[i % LABELS.length] : null,
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(.008, .022),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const MAX_DIST = 130;
    const MOUSE_R  = 160;

    nodes.forEach(n => {
      // update
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // mouse repel
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < MOUSE_R) {
        const force = (MOUSE_R - dist) / MOUSE_R * 0.6;
        n.vx += (dx / dist) * force * 0.25;
        n.vy += (dy / dist) * force * 0.25;
        // clamp speed
        const speed = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
        if (speed > 1.8) { n.vx *= 1.8/speed; n.vy *= 1.8/speed; }
      }
    });

    // draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.28;
          // blend colors of the two nodes
          const r = Math.round((a.color[0] + b.color[0]) / 2);
          const g = Math.round((a.color[1] + b.color[1]) / 2);
          const bv= Math.round((a.color[2] + b.color[2]) / 2);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    nodes.forEach(n => {
      const glow = 1 + Math.sin(n.pulse) * 0.4;
      const r    = n.r * glow;
      const alpha = 0.7 + Math.sin(n.pulse) * 0.3;

      // outer glow ring
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5);
      grad.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${alpha * 0.22})`);
      grad.addColorStop(1, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0)`);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // core dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${alpha})`;
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      // label
      if (n.label) {
        ctx.font = '9px DM Mono, monospace';
        ctx.letterSpacing = '0.1em';
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${alpha * 0.6})`;
        ctx.fillText(n.label, n.x + r + 4, n.y + 3);
      }
    });

    animId = requestAnimationFrame(draw);
  }

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -1000; mouse.y = -1000;
  });

  // Touch support
  canvas.parentElement.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse.x = t.clientX - rect.left;
    mouse.y = t.clientY - rect.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('touchend', () => {
    mouse.x = -1000; mouse.y = -1000;
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });

  resize();
  draw();
})();
