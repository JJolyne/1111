/* ============================================
   RUNCHI 润驰 — Main JavaScript
   Carousel · Per-Category Dropdown · Search · Mobile Menu · Scroll FX
   ============================================ */

(function () {
  'use strict';

  // ========== INITIAL FEATHER ICONS RENDER ==========
  if (window.feather) feather.replace();

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


  // ========== DEAD LINK HANDLER — Toast Notification ==========
  (function initDeadLinkHandler() {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = '该页面即将上线';
    document.body.appendChild(toast);

    let toastTimer = null;

    function showToast() {
      if (toastTimer) clearTimeout(toastTimer);
      toast.classList.add('show');
      toastTimer = setTimeout(function () {
        toast.classList.remove('show');
      }, 2000);
    }

    // Intercept clicks on dead links (href="#" without functional attributes)
    document.body.addEventListener('click', function (e) {
      const link = e.target.closest('a[href="#"]');
      if (!link) return;

      // Skip links that have functional attributes
      if (link.hasAttribute('data-modal-type')) return;
      if (link.hasAttribute('data-full-image')) return;
      if (link.hasAttribute('data-dropdown')) return;
      if (link.classList.contains('dp-feature-link')) return;

      e.preventDefault();
      showToast();
    });
  })();

})();


/* ============================================
   全局弹窗系统 MODAL（单例复用）
   支持 6 种内容类型：
     image   — 单图预览（data-full-image 触发，兼容微信二维码）
     contact — 联系我们（标题 + 电话号码）
     gallery — 家具作品预览（标题 + 多图网格）
     text    — 技术规格文字（标题 + 正文段落）
     address — 公司地址（标题 + 地址文字 + 电话）
     certs   — 资质证书预览（三列证书缩略图，点击放大）
   关闭方式：×按钮 / 遮罩点击 / ESC键
   ============================================ */
(function () {
  'use strict';

  // ========== DOM REFS ==========
  const lightbox          = document.getElementById('lightbox');
  const lightboxCard      = document.getElementById('lightboxCard');
  const lightboxTitle     = document.getElementById('lightboxTitle');
  const lightboxImage     = document.getElementById('lightboxImage');
  const lightboxImageWrap = document.getElementById('lightboxImageWrap');
  const lightboxBody      = document.getElementById('lightboxBody');
  const lightboxGallery   = document.getElementById('lightboxGallery');
  const lightboxClose     = document.getElementById('lightboxClose');
  const lightboxGalleryBack = document.getElementById('lightboxGalleryBack');
  const lightboxOverlay   = lightbox ? lightbox.querySelector('.lightbox-overlay') : null;

  if (!lightbox) return;

  // 画廊素材（缩略图 1000×1000，点击放大用 1600×1600）
  const GALLERY_SOURCES = [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'
  ];

  /** 获取缩略图 URL（1000宽，匹配 620px 卡片） */
  function thumbUrl(base) {
    return base + '?w=1000&h=1000&fit=crop&q=85';
  }

  /** 获取大图 URL（1600宽，用于点击放大） */
  function fullUrl(base) {
    return base + '?w=1600&h=1600&fit=crop&q=90';
  }

  // ========== 画廊图片预加载 — 避免每次打开重新请求 ==========
  // 创建隐藏预加载容器（off-screen 但仍然渲染，确保图片加载到缓存）
  const galleryPreload = document.createElement('div');
  galleryPreload.id = 'galleryPreload';
  galleryPreload.setAttribute('aria-hidden', 'true');
  galleryPreload.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
  document.body.appendChild(galleryPreload);

  // 一次性创建所有缩略图 DOM 元素，存入预加载容器
  const galleryThumbs = GALLERY_SOURCES.map((src, i) => {
    const img = document.createElement('img');
    img.src = thumbUrl(src);
    img.setAttribute('data-full', fullUrl(src));
    img.alt = '家具作品 ' + (i + 1);
    galleryPreload.appendChild(img);
    return img;
  });

  // ========== 资质证书素材（TODO：替换为真实证书图片） ==========
  // 当前为内联 SVG 生成的白底细线证书占位图（无需外网请求）；
  // 替换时把 CERT_SOURCES 改为真实图片 URL 数组即可。
  const CERT_SOURCES = ['营业执照', '资质证书', '荣誉证书'];

  /** 生成白底细线证书占位图（data URI） */
  function certPlaceholder(title) {
    const lines = [336, 380, 424, 468, 512, 556]
      .map((y) => '<line x1="110" y1="' + y + '" x2="490" y2="' + y + '" stroke="#E8E8E8" stroke-width="2"/>')
      .join('');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">' +
      '<rect width="600" height="800" fill="#FFFFFF"/>' +
      '<rect x="40" y="40" width="520" height="720" fill="none" stroke="#C9C9C9" stroke-width="2"/>' +
      '<rect x="56" y="56" width="488" height="688" fill="none" stroke="#E3E3E3" stroke-width="1.5"/>' +
      '<circle cx="300" cy="150" r="46" fill="none" stroke="#C9C9C9" stroke-width="2"/>' +
      '<path d="M300 106l12 24 26 4-19 18 4 26-23-12-23 12 4-26-19-18 26-4z" fill="#C9C9C9"/>' +
      '<text x="300" y="252" text-anchor="middle" font-family="Georgia,\'SimSun\',\'Songti SC\',serif" font-size="42" letter-spacing="16" fill="#1A1A1A">' + title + '</text>' +
      '<line x1="140" y1="286" x2="460" y2="286" stroke="#D8D8D8" stroke-width="1.5"/>' +
      lines +
      '<circle cx="450" cy="640" r="60" fill="none" stroke="#C9C9C9" stroke-width="2.5"/>' +
      '<circle cx="450" cy="640" r="48" fill="none" stroke="#DDDDDD" stroke-width="1.5"/>' +
      '<path d="M450 588l13 27 30 4-22 21 5 30-26-14-26 14 5-30-22-21 30-4z" fill="#C9C9C9"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // 与画廊素材一致：一次性创建证书缩略图并放入预加载容器
  const certThumbs = CERT_SOURCES.map((title) => {
    const src = certPlaceholder(title);
    const img = document.createElement('img');
    img.src = src;
    img.setAttribute('data-full', src);
    img.alt = title;
    galleryPreload.appendChild(img);
    return img;
  });

  // 当前画廊展示顺序（元素引用数组），用于放大后返回时恢复
  let galleryCurrentOrder = null;
  // 证书模式标记：从放大视图返回时恢复三列样式
  let galleryIsCerts = false;
  // 保存画廊标题，用于放大后返回
  let gallerySavedTitle = '';

  /** 随机打乱数组 */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /** 将所有画廊图片移回预加载容器（不销毁 DOM） */
  function moveGalleryToPreload() {
    while (lightboxGallery.firstChild) {
      galleryPreload.appendChild(lightboxGallery.firstChild);
    }
  }

  /** 隐藏所有内容区 */
  function hideAllContent() {
    moveGalleryToPreload();
    lightboxImageWrap.style.display = 'none';
    lightboxBody.classList.remove('show');
    lightboxGallery.classList.remove('show');
    lightboxCard.classList.remove('lightbox-card--auto');
    lightboxCard.classList.remove('lightbox-card--gallery');
    lightboxCard.classList.remove('lightbox-card--certs');
    lightboxGalleryBack.classList.remove('show');
    lightboxImage.src = '';
    lightboxBody.innerHTML = '';
    gallerySavedTitle = '';
    galleryCurrentOrder = null;
    galleryIsCerts = false;
  }

  /** 显示单图内容（二维码 / 画廊放大） */
  function showImageContent(imageUrl) {
    hideAllContent();
    lightboxImage.src = imageUrl;
    lightboxImageWrap.style.display = '';
  }

  /** 显示联系我们 */
  function showContactContent() {
    hideAllContent();
    lightboxCard.classList.add('lightbox-card--auto');
    lightboxBody.classList.add('show');
    lightboxBody.innerHTML =
      '<p>如需咨询家具定制、房产服务或混凝土采购，<br>欢迎致电 RUNCHI 润驰官方：</p>' +
      '<span class="lightbox-phone">158-8455-0880</span>';
  }

  /** 显示家具作品画廊 — 复用预加载的图片 DOM，不重新请求 */
  function showGalleryContent() {
    hideAllContent();
    galleryIsCerts = false;
    lightboxCard.classList.add('lightbox-card--gallery');
    // 随机打乱并移入画廊容器
    galleryCurrentOrder = shuffle(galleryThumbs.slice());
    galleryCurrentOrder.forEach(img => lightboxGallery.appendChild(img));
    lightboxGallery.classList.add('show');
    gallerySavedTitle = lightboxTitle.textContent;
  }

  /** 从画廊点击 → 切换到单图放大视图 */
  function enlargeGalleryImage(imgEl) {
    const fullSrc = imgEl.getAttribute('data-full') || imgEl.src;
    // 保存画廊状态（标题 + 当前图片顺序已保存在 galleryCurrentOrder 中）
    gallerySavedTitle = lightboxTitle.textContent;
    // 将画廊图片移回预加载容器
    moveGalleryToPreload();
    lightboxGallery.classList.remove('show');
    lightboxCard.classList.remove('lightbox-card--gallery');
    lightboxCard.classList.remove('lightbox-card--certs');
    lightboxCard.classList.add('lightbox-card--auto');
    lightboxImage.src = fullSrc;
    lightboxImageWrap.style.display = '';
    lightboxTitle.textContent = '';
    // 显示返回按钮
    lightboxGalleryBack.classList.add('show');
  }

  /** 从单图放大视图 → 返回画廊（恢复原顺序） */
  function backToGallery() {
    lightboxImageWrap.style.display = 'none';
    lightboxImage.src = '';
    lightboxCard.classList.remove('lightbox-card--auto');
    lightboxCard.classList.add('lightbox-card--gallery');
    if (galleryIsCerts) lightboxCard.classList.add('lightbox-card--certs');
    lightboxGalleryBack.classList.remove('show');
    lightboxTitle.textContent = gallerySavedTitle;
    // 按保存的顺序将图片从预加载容器移回画廊
    if (galleryCurrentOrder) {
      galleryCurrentOrder.forEach(img => lightboxGallery.appendChild(img));
    }
    lightboxGallery.classList.add('show');
  }

  /** 显示混凝土技术规格 */
  function showTextContent() {
    hideAllContent();
    lightboxCard.classList.add('lightbox-card--auto');
    lightboxBody.classList.add('show');
    lightboxBody.innerHTML =
      '<div class="lightbox-text">' +
        '<p>RUNCHI提供C15-C80全标号预拌混凝土，同时供应自密实混凝土、透水混凝土、抗渗混凝土、早强混凝土等各类高性能特种混凝土，亦可配套预制构件定制。</p>' +
        '<p>我们提供泵送运输、现场浇筑技术指导、试样检测全链路配套服务；所有原料与成品执行严格质检标准，配备ISO认证实验室，每一批次留样检测，各项指标符合国家现行施工规范，可满足家装、市政、商业建筑、厂房等多种工程场景使用。</p>' +
      '</div>';
  }

  /** 显示公司地址 */
  function showAddressContent() {
    hideAllContent();
    lightboxCard.classList.add('lightbox-card--auto');
    lightboxBody.classList.add('show');
    lightboxBody.innerHTML =
      '<div class="lightbox-text">' +
        '<p>公司名称：成都润驰禾具商贸有限公司</p>' +
        '<p>公司地址：四川省成都市 ××× 区 ××× 大道 ××× 号</p>' +  // TODO 替换为真实地址
        '<p>营业时间：周一至周日 9:00 – 18:00</p>' +                // TODO 替换为真实营业时间
      '</div>' +
      '<span class="lightbox-phone">158-8455-0880</span>';
  }

  /** 显示资质证书预览（三列缩略图，点击放大） */
  function showCertsContent() {
    hideAllContent();
    lightboxCard.classList.add('lightbox-card--gallery');
    lightboxCard.classList.add('lightbox-card--certs');
    galleryIsCerts = true;
    // 证书保持固定顺序（不打乱）
    galleryCurrentOrder = certThumbs.slice();
    galleryCurrentOrder.forEach(img => lightboxGallery.appendChild(img));
    lightboxGallery.classList.add('show');
    gallerySavedTitle = lightboxTitle.textContent;
  }

  // ========== 打开弹窗 ==========
  function openModal(title, type, extra) {
    lightboxTitle.textContent = title || '';

    switch (type) {
      case 'image':
        showImageContent(extra || '');
        break;
      case 'contact':
        showContactContent();
        break;
      case 'gallery':
        showGalleryContent();
        break;
      case 'text':
        showTextContent();
        break;
      case 'address':
        showAddressContent();
        break;
      case 'certs':
        showCertsContent();
        break;
      default:
        // 兜底按图片处理
        showImageContent(extra || '');
    }

    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  // ========== 关闭弹窗 ==========
  function closeModal() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lightboxGalleryBack.classList.remove('show');
    // 延迟清空内容，等过渡动画结束
    setTimeout(function () {
      if (!lightbox.classList.contains('active')) {
        hideAllContent();
      }
    }, 350);
  }

  // ========== 关闭按钮 ==========
  if (lightboxClose) {
    lightboxClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });
  }

  // ========== 遮罩层点击关闭 ==========
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });
  }

  // ========== ESC 键盘关闭（画廊放大时优先返回） ==========
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !lightbox.classList.contains('active')) return;
    if (lightboxGalleryBack.classList.contains('show')) {
      backToGallery();
    } else {
      closeModal();
    }
  });

  // ========== 画廊返回按钮 ==========
  if (lightboxGalleryBack) {
    lightboxGalleryBack.addEventListener('click', function (e) {
      e.stopPropagation();
      backToGallery();
    });
  }

  // ========== 画廊图片点击 → 放大查看 ==========
  if (lightboxGallery) {
    lightboxGallery.addEventListener('click', function (e) {
      const img = e.target.closest('img');
      if (!img) return;
      e.stopPropagation();
      enlargeGalleryImage(img);
    });
  }

  // ========== 点击放大后的单图 → 返回画廊 ==========
  if (lightboxImageWrap) {
    lightboxImageWrap.addEventListener('click', function (e) {
      if (!lightboxGalleryBack.classList.contains('show')) return;
      if (e.target === lightboxImage || e.target === lightboxImageWrap) {
        e.stopPropagation();
        backToGallery();
      }
    });
  }

  // ========== 事件委托：data-modal-type 触发弹窗 ==========
  document.body.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-modal-type]');
    if (!trigger) return;

    e.preventDefault();
    e.stopPropagation();

    const type  = trigger.getAttribute('data-modal-type');
    const title = trigger.getAttribute('data-modal-title');

    if (type) {
      openModal(title, type, null);
    }
  });

  // ========== 兼容：data-full-image 仍可触发单图弹窗 ==========
  document.body.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-full-image]');
    if (!trigger) return;
    // 如果同一元素已有 data-modal-type，不重复处理
    if (trigger.hasAttribute('data-modal-type')) return;

    e.preventDefault();
    e.stopPropagation();

    const imageUrl = trigger.getAttribute('data-full-image');
    if (imageUrl) {
      openModal(trigger.getAttribute('data-modal-title') || '', 'image', imageUrl);
    }
  });

})();
