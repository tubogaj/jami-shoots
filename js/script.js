(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const loadingScreen = document.querySelector('.loading-screen');
  const mobileMenuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const themeToggle = document.querySelector('.theme-toggle');
  const backToTopButton = document.querySelector('.back-to-top');
  const welcomeModal = document.querySelector('.modal--welcome');
  const aboutModal = document.querySelector('.modal--about');
  const lightbox = document.querySelector('.lightbox');
  const lightboxContent = lightbox ? lightbox.querySelector('.lightbox__content') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  const aboutLinks = Array.from(document.querySelectorAll('a[href="#about"]'));
  const welcomeCloseButton = welcomeModal ? welcomeModal.querySelector('button') : null;
  const aboutCloseButton = aboutModal ? aboutModal.querySelector('button') : null;

  let currentLightboxIndex = 0;
  let isLightboxOpen = false;

  function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    Object.assign(progressBar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '3px',
      width: '0%',
      background: 'linear-gradient(90deg, #111111, #8d7a5e, #111111)',
      zIndex: '999',
      transition: 'width 120ms ease-out'
    });
    document.body.appendChild(progressBar);
  }

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }

  function setStickyHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  function toggleMobileMenu(forceClose = false) {
    if (!mobileMenuButton || !mobileMenu) return;
    const shouldOpen = forceClose ? false : mobileMenuButton.getAttribute('aria-expanded') !== 'true';
    mobileMenuButton.setAttribute('aria-expanded', String(shouldOpen));
    mobileMenu.hidden = !shouldOpen;
    mobileMenuButton.classList.toggle('is-active', shouldOpen);
  }

  function closeMobileMenu() {
    toggleMobileMenu(true);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add('is-open');
    body.classList.add('modal-open');
    body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    body.classList.remove('modal-open');
    body.style.overflow = '';
  }

  function openAboutModal() {
    openModal(aboutModal);
  }

  function closeAboutModal() {
    closeModal(aboutModal);
  }

  function openWelcomeModal() {
    if (!welcomeModal) return;
    openModal(welcomeModal);
  }

  function closeWelcomeModal() {
    if (!welcomeModal) return;
    closeModal(welcomeModal);
    localStorage.setItem('jami-shoots-welcome-seen', 'true');
  }

  function showWelcomePopupOnce() {
    const seen = localStorage.getItem('jami-shoots-welcome-seen');
    if (seen) return;
    window.setTimeout(() => {
      openWelcomeModal();
    }, 1100);
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    body.dataset.theme = theme;
    body.classList.toggle('theme-dark', isDark);
    document.documentElement.style.setProperty('--bg', isDark ? '#121212' : '#f5efe9');
    document.documentElement.style.setProperty('--bg-strong', isDark ? '#1b1b1b' : '#efe4d6');
    document.documentElement.style.setProperty('--surface', isDark ? 'rgba(20, 20, 20, 0.75)' : 'rgba(255, 255, 255, 0.72)');
    document.documentElement.style.setProperty('--surface-strong', isDark ? 'rgba(30, 30, 30, 0.92)' : 'rgba(255, 255, 255, 0.9)');
    document.documentElement.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.12)' : 'rgba(16, 16, 16, 0.12)');
    document.documentElement.style.setProperty('--text', isDark ? '#f7f2eb' : '#111111');
    document.documentElement.style.setProperty('--muted', isDark ? '#b7ae9f' : '#6d665d');
    document.documentElement.style.setProperty('--accent', isDark ? '#f9f2e9' : '#1f1f1f');
    document.documentElement.style.setProperty('--accent-soft', isDark ? '#c2a97b' : '#8d7a5e');
    document.documentElement.style.setProperty('--shadow', isDark ? '0 24px 80px rgba(0,0,0,0.34)' : '0 24px 80px rgba(17, 17, 17, 0.12)');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    if (icon) {
      icon.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
    }
  }

  function toggleTheme() {
    const currentTheme = localStorage.getItem('jami-shoots-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('jami-shoots-theme', nextTheme);
    applyTheme(nextTheme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('jami-shoots-theme') || 'light';
    applyTheme(savedTheme);
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      });
    });
  }

  function setupLightbox() {
    if (!lightbox || !lightboxContent) return;

    const renderLightboxContent = (index) => {
      const card = galleryCards[index];
      if (!card) return;
      const title = card.querySelector('h3')?.textContent || 'Featured Frame';
      const copy = card.querySelector('p')?.textContent || 'Luxury photography detail';
      lightboxContent.innerHTML = `
        <div style="text-align:center; padding:2rem; max-width: 34rem;">
          <p style="margin:0 0 0.75rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.68); font-size:0.8rem;">Premium Lightbox</p>
          <h3 style="margin:0 0 0.7rem; font-family:'Playfair Display', serif; font-size:clamp(1.4rem, 2.2vw, 2rem); color:#fff;">${title}</h3>
          <p style="margin:0 0 1.2rem; color:rgba(255,255,255,0.78);">${copy}</p>
          <div style="display:flex; justify-content:center; gap:0.8rem; flex-wrap:wrap;">
            <button type="button" class="button button--ghost lightbox__nav lightbox__nav--prev">Previous</button>
            <button type="button" class="button button--primary lightbox__nav lightbox__nav--next">Next</button>
          </div>
        </div>
      `;
      const prevButton = lightboxContent.querySelector('.lightbox__nav--prev');
      const nextButton = lightboxContent.querySelector('.lightbox__nav--next');
      prevButton?.addEventListener('click', () => navigateLightbox(-1));
      nextButton?.addEventListener('click', () => navigateLightbox(1));
    };

    const openLightbox = (index) => {
      currentLightboxIndex = index;
      renderLightboxContent(currentLightboxIndex);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      isLightboxOpen = true;
      body.classList.add('modal-open');
      body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      isLightboxOpen = false;
      body.classList.remove('modal-open');
      body.style.overflow = '';
    };

    const navigateLightbox = (direction) => {
      const nextIndex = (currentLightboxIndex + direction + galleryCards.length) % galleryCards.length;
      currentLightboxIndex = nextIndex;
      renderLightboxContent(currentLightboxIndex);
    };

    galleryCards.forEach((card, index) => {
      card.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!isLightboxOpen) return;
      if (event.key === 'Escape') {
        closeLightbox();
      }
      if (event.key === 'ArrowRight') {
        navigateLightbox(1);
      }
      if (event.key === 'ArrowLeft') {
        navigateLightbox(-1);
      }
    });
  }

  function setupBackToTop() {
    const toggleVisibility = () => {
      if (!backToTopButton) return;
      backToTopButton.style.opacity = window.scrollY > 600 ? '1' : '0';
      backToTopButton.style.pointerEvents = window.scrollY > 600 ? 'auto' : 'none';
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
  }

  function setupEventListeners() {
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => toggleMobileMenu());
    }

    if (welcomeCloseButton) {
      welcomeCloseButton.addEventListener('click', closeWelcomeModal);
    }

    if (aboutCloseButton) {
      aboutCloseButton.addEventListener('click', closeAboutModal);
    }

    aboutLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openAboutModal();
      });
    });

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    if (backToTopButton) {
      backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.addEventListener('click', (event) => {
      if (!mobileMenu || mobileMenu.hidden) return;
      const target = event.target;
      if (target instanceof HTMLElement && !mobileMenu.contains(target) && !mobileMenuButton?.contains(target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
        closeAboutModal();
        if (isLightboxOpen) {
          lightbox?.classList.remove('is-open');
          lightbox?.setAttribute('aria-hidden', 'true');
          isLightboxOpen = false;
          body.classList.remove('modal-open');
          body.style.overflow = '';
        }
      }
    });
  }

  function init() {
    createScrollProgress();
    updateScrollProgress();
    setStickyHeaderState();
    initTheme();
    setupSmoothScroll();
    setupLightbox();
    setupBackToTop();
    setupEventListeners();
    showWelcomePopupOnce();

    window.addEventListener('scroll', () => {
      updateScrollProgress();
      setStickyHeaderState();
    }, { passive: true });

    window.addEventListener('load', () => {
      window.setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.classList.add('is-hidden');
        }
      }, 1600);
    });
  }

  init();
})();


