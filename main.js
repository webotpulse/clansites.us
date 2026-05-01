// ===== NAV SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== HERO CANVAS — PARTICLES =====
(function initHeroCanvas() {
  const canvas = document.getElementById('hero3d');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  for (let i = 0; i < 120; i++) particles.push(randomParticle());

  let mx = W / 2, my = H / 2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Ambient glow
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 400);
    grad.addColorStop(0, 'rgba(0,102,255,0.06)');
    grad.addColorStop(1, 'rgba(0,102,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Particles + connections
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100,170,255,${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,102,255,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== DRAGGABLE 3D CARD =====
(function init3DCard() {
  const card = document.getElementById('card3d');
  if (!card) return;

  let isDragging = false;
  let startX, startY, rotX = 8, rotY = -12;
  let velX = 0, velY = 0;

  function applyRotation() {
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  card.addEventListener('mousedown', e => {
    isDragging = true;
    card.classList.add('dragging');
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    velX = dx * 0.4;
    velY = dy * 0.4;
    rotY += dx * 0.5;
    rotX -= dy * 0.5;
    rotX = Math.max(-40, Math.min(40, rotX));
    applyRotation();
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
    // Momentum decay
    function decay() {
      if (Math.abs(velX) < 0.05 && Math.abs(velY) < 0.05) return;
      rotY += velX * 0.05;
      rotX -= velY * 0.05;
      velX *= 0.92;
      velY *= 0.92;
      applyRotation();
      requestAnimationFrame(decay);
    }
    decay();
  });

  // Touch support
  card.addEventListener('touchstart', e => {
    isDragging = true;
    card.classList.add('dragging');
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    rotY += dx * 0.5;
    rotX -= dy * 0.5;
    rotX = Math.max(-40, Math.min(40, rotX));
    applyRotation();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  card.addEventListener('touchend', () => {
    isDragging = false;
    card.classList.remove('dragging');
  });
})();

// ===== SERVICE CARD TILT =====
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-8px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== FLOATING CUBES (TRUST SECTION) =====
(function initCubes() {
  const container = document.getElementById('floatingCubes');
  if (!container) return;
  const colors = ['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.08)', 'rgba(0,150,255,0.12)'];
  for (let i = 0; i < 12; i++) {
    const cube = document.createElement('div');
    const size = Math.random() * 40 + 16;
    const color = colors[Math.floor(Math.random() * colors.length)];
    cube.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      background:${color};
      border:1px solid rgba(0,102,255,0.2);
      border-radius:6px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: floatCube ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite;
      transform-style:preserve-3d;
    `;
    container.appendChild(cube);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatCube {
      0%,100%{transform:translateY(0) rotate(0deg)}
      33%{transform:translateY(-24px) rotate(120deg)}
      66%{transform:translateY(12px) rotate(240deg)}
    }
  `;
  document.head.appendChild(style);
})();

// ===== ABOUT 3D RING (Canvas) =====
(function initAboutRing() {
  const container = document.getElementById('aboutRing');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 220;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let angle = 0;

  const logoPoints = [
    { label: 'Fast', icon: '⚡' },
    { label: 'Clean', icon: '✨' },
    { label: 'Mobile', icon: '📱' },
    { label: 'Results', icon: '🚀' },
  ];

  function drawRing() {
    ctx.clearRect(0, 0, 220, 220);
    const cx = 110, cy = 110, r = 80;

    // Orbit ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,102,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center logo
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.roundRect(-34, -34, 68, 68, 14);
    ctx.fillStyle = '#0066FF';
    ctx.fill();
    // Arrow "<"
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(14, -16);
    ctx.lineTo(-10, 0);
    ctx.lineTo(14, 16);
    ctx.stroke();
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(4, -20);
    ctx.lineTo(4, 20);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Orbiting dots
    logoPoints.forEach((p, i) => {
      const a = angle + (i / logoPoints.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;

      const pulseFactor = 1 + 0.08 * Math.sin(angle * 3 + i);
      ctx.beginPath();
      ctx.arc(x, y, 18 * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,40,100,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,102,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(p.icon, x, y);
    });

    angle += 0.012;
    requestAnimationFrame(drawRing);
  }
  drawRing();
})();

// ===== FINAL CTA ANIMATED BG =====
(function initCtaBg() {
  const container = document.getElementById('ctaBg');
  if (!container) return;
  for (let i = 0; i < 8; i++) {
    const orb = document.createElement('div');
    const size = Math.random() * 200 + 80;
    orb.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      background:radial-gradient(circle,rgba(255,255,255,0.07),transparent 70%);
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation:orbFloat ${5+Math.random()*5}s ease-in-out ${Math.random()*4}s infinite;
      pointer-events:none;
    `;
    container.appendChild(orb);
  }
  const st = document.createElement('style');
  st.textContent = `@keyframes orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(${Math.random()*40-20}px,${Math.random()*40-20}px)}}`;
  document.head.appendChild(st);
})();

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !phone) return;

  this.innerHTML = `<div class="form-success">🎉 Thank you, ${name}! We'll contact you on ${phone} within a few hours. <br><br><strong>Or reach us now:</strong><br><a href="https://wa.me/923001234567" target="_blank" style="color:#00CC66">💬 WhatsApp Us Directly</a></div>`;
});

// ===== SCROLL REVEAL =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.review-card, .service-card, .contact-block').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(32px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
