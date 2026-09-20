/* ============================================================
   Lahza Media — Main Script
   Grid Gallery + Lightbox + Dynamic Render + Reveal
   ============================================================ */

(() => {
  'use strict';

  /* ---------- Images array (9 صور الأعمال) ---------- */
  const WORK_IMAGES = [
    'assets/1.jpg',
    'assets/2.jpg',
    'assets/3.jpg',
    'assets/4.jpg',
    'assets/5.jpg',
    'assets/6.jpg',
    'assets/7.jpg',
    'assets/8.jpg',
    'assets/9.jpg'
  ];

  /* ---------- Loader ---------- */
  function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('is-hidden'), 700);
  }

  /* ---------- Navbar scroll state ---------- */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      menu.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        menu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Services render ---------- */
  function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    const data = I18N.getData();
    const list = data.services_list || [];
    grid.innerHTML = list.map((title, i) => `
      <article class="service reveal">
        <span class="service__num">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="service__title">${title}</h3>
      </article>
    `).join('');
  }

  /* ---------- Work gallery render ---------- */
  function renderWork() {
    const grid = document.getElementById('workGrid');
    if (!grid) return;
    grid.innerHTML = WORK_IMAGES.map((src, i) => `
      <div class="work__item reveal" data-index="${i}">
        <img src="${src}" alt="Project ${i + 1}" loading="lazy">
      </div>
    `).join('');
    initLightbox();
  }

  /* ---------- Projects (links) render ---------- */
  function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const data = I18N.getData();
    const list = data.projects_list || [];
    grid.innerHTML = list.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener" class="project reveal">
        <div class="project__info">
          <span class="project__name">${p.name}</span>
          <span class="project__desc">${p.desc}</span>
        </div>
        <span class="project__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </a>
    `).join('');
  }

  /* ---------- Lightbox ---------- */
  let lbIndex = 0;

  function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lbImg');
    if (!lb || !img) return;
    lbIndex = index;
    img.src = WORK_IMAGES[lbIndex];
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    lbIndex = (lbIndex + dir + WORK_IMAGES.length) % WORK_IMAGES.length;
    const img = document.getElementById('lbImg');
    if (!img) return;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = WORK_IMAGES[lbIndex];
      img.style.opacity = '1';
    }, 120);
  }

  function initLightbox() {
    const grid = document.getElementById('workGrid');
    const lb = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lbClose');
    const prevBtn = document.getElementById('lbPrev');
    const nextBtn = document.getElementById('lbNext');
    if (!grid || !lb) return;

    grid.querySelectorAll('.work__item').forEach(item => {
      item.addEventListener('click', () => {
        openLightbox(parseInt(item.dataset.index, 10));
      });
    });

    closeBtn && closeBtn.addEventListener('click', closeLightbox);
    prevBtn && prevBtn.addEventListener('click', () => navLightbox(-1));
    nextBtn && nextBtn.addEventListener('click', () => navLightbox(1));

    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* ---------- Smooth anchor scroll (offset for fixed nav) ---------- */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const nav = document.getElementById('nav');
        const offset = nav ? nav.offsetHeight + 12 : 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Re-render dynamic content on language change ---------- */
  function bindLanguageRerender() {
    document.addEventListener('i18n:changed', () => {
      renderServices();
      renderProjects();
      // Reveal again for newly injected nodes
      requestAnimationFrame(initReveal);
    });
  }

  /* ---------- Init ---------- */
  function init() {
    I18N.init();

    // Wait for initial translations then render dynamic sections
    setTimeout(() => {
      renderServices();
      renderWork();
      renderProjects();
      initReveal();
    }, 80);

    initNavScroll();
    initMobileMenu();
    initAnchorScroll();
    bindLanguageRerender();
    hideLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();