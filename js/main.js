/* ============================================
   RUNCHI 润驰 — Main JavaScript
   Carousel · Per-Category Dropdown · Search · Mobile Menu · Scroll FX
   ============================================ */

(function () {
  'use strict';

  // ========== DOM REFS ==========
  const header = document.getElementById('header');
  const carousel = document.getElementById('carousel');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Brand Dropdown
  const brandDropdown = document.getElementById('brandDropdown');
  const brandDropdownClose = document.getElementById('brandDropdownClose');
  const dropdownTriggers = document.querySelectorAll('[data-dropdown]');
  const dropdownPanels = document.querySelectorAll('.dropdown-panel');

  // Track active panel
  let activePanel = null;

  // ========== CAROUSEL ==========
  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoplayInterval;
  const AUTOPLAY_DELAY = 5000;

  function goToSlide(index) {
    if (index === currentSlide) return;
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; }
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.getAttribute('data-slide'), 10));
      startAutoplay();
    });
  });

  // Touch swipe
  let touchStartX = 0;
  if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
      startAutoplay();
    });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();


  // ========== BRAND DROPDOWN — Per-Category Panels ==========
  let dropdownTimer = null;
  const SHOW_DELAY = 120;
  const HIDE_DELAY = 200;

  function showPanel(panelId) {
    if (!brandDropdown) return;

    // Hide all panels first
    dropdownPanels.forEach(p => p.classList.remove('active'));

    // Show the target panel
    const panel = document.getElementById('dp-' + panelId);
    if (panel) {
      panel.classList.add('active');
      activePanel = panelId;
    }

    // Show dropdown container
    brandDropdown.classList.add('active');
    header.classList.add('has-dropdown');

    // Render feather icons inside the new panel
    if (window.feather) feather.replace();
  }

  function hideDropdown() {
    if (!brandDropdown) return;
    brandDropdown.classList.remove('active');
    header.classList.remove('has-dropdown');
    activePanel = null;

    // Remove active from all nav links
    dropdownTriggers.forEach(link => link.classList.remove('active'));
  }

  function scheduleShow(panelId) {
    if (dropdownTimer) clearTimeout(dropdownTimer);
    dropdownTimer = setTimeout(() => showPanel(panelId), SHOW_DELAY);
  }

  function scheduleHide() {
    if (dropdownTimer) clearTimeout(dropdownTimer);
    dropdownTimer = setTimeout(hideDropdown, HIDE_DELAY);
  }

  function cancelTimer() {
    if (dropdownTimer) { clearTimeout(dropdownTimer); dropdownTimer = null; }
  }

  // Hover: each nav link shows its own panel
  if (dropdownTriggers.length && brandDropdown) {
    dropdownTriggers.forEach(link => {
      const panelId = link.getAttribute('data-dropdown');

      link.addEventListener('mouseenter', () => {
        // Highlight active link
        dropdownTriggers.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        scheduleShow(panelId);
      });

      link.addEventListener('mouseleave', () => {
        link.classList.remove('active');
        scheduleHide();
      });
    });

    // Keep open when hovering dropdown
    brandDropdown.addEventListener('mouseenter', cancelTimer);
    brandDropdown.addEventListener('mouseleave', () => scheduleHide());
  }

  // Close button
  if (brandDropdownClose) {
    brandDropdownClose.addEventListener('click', (e) => {
      e.stopPropagation();
      cancelTimer();
      hideDropdown();
    });
  }

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && brandDropdown && brandDropdown.classList.contains('active')) {
      cancelTimer();
      hideDropdown();
    }
  });

  // Click outside
  document.addEventListener('click', (e) => {
    if (!brandDropdown || !brandDropdown.classList.contains('active')) return;
    if (!header.contains(e.target)) {
      hideDropdown();
    }
  });

  // Close dropdown when a link inside it is clicked
  if (brandDropdown) {
    brandDropdown.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && !link.classList.contains('dp-feature-link')) {
        setTimeout(hideDropdown, 80);
      }
    });
  }


  // ========== SEARCH OVERLAY ==========
  function openSearch() {
    if (brandDropdown && brandDropdown.classList.contains('active')) hideDropdown();
    searchOverlay.classList.add('active');
    const input = searchOverlay.querySelector('.search-input');
    if (input) setTimeout(() => input.focus(), 100);
    document.body.classList.add('no-scroll');
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  if (searchToggle) searchToggle.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
  });

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });


  // ========== MOBILE MENU ==========
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.classList.add('no-scroll');
    const fel = mobileMenuToggle.querySelector('[data-feather]');
    if (fel) { fel.setAttribute('data-feather', 'x'); feather.replace(); }
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.classList.remove('no-scroll');
    const fel = mobileMenuToggle.querySelector('[data-feather]');
    if (fel) { fel.setAttribute('data-feather', 'menu'); feather.replace(); }
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    });
  }

  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });


  // ========== SCROLL EFFECTS ==========
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ========== REVEAL ON SCROLL ==========
  const revealElements = document.querySelectorAll('.business-card, .split-content, .stat-item');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });
  }

})();
