(function() {
  'use strict';

  // ===== SPLASH SCREEN (5 SECONDS = 5000) =====
  const SPLASH_DURATION = 5000; // 5 minutes
  const splash = document.getElementById('splash');

  if (splash) {
    // Auto-hide after 10 seconds
    setTimeout(() => {
      splash.classList.add('hidden');
    }, SPLASH_DURATION);

    // Click to skip
    splash.addEventListener('click', () => {
      splash.classList.add('hidden');
    });
  }

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ===== HAMBURGER MENU =====
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const overlay = document.getElementById('overlay');

  function openMenu() {
    sideMenu?.classList.add('open');
    overlay?.classList.add('active');
    document.body.classList.add('no-scroll');
  }
  function closeMenu() {
    sideMenu?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  hamburgerBtn?.addEventListener('click', openMenu);
  closeMenuBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // ===== TOAST =====
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer;

  function showToast(message, icon = 'fa-check-circle') {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.querySelector('i').className = `fas ${icon}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== OFFLINE / ONLINE STATUS =====
  window.addEventListener('offline', () => {
    showToast('You are offline - app still works!', 'fa-wifi');
  });
  window.addEventListener('online', () => {
    showToast('Back online', 'fa-cloud');
  });

  // ===== PWA INSTALL PROMPT =====
  let deferredInstallPrompt;
  let installBanner;

  function hideInstallBanner() {
    installBanner?.remove();
    installBanner = null;
  }

  function showInstallBanner() {
    if (!deferredInstallPrompt || installBanner || localStorage.getItem('pwa-dismissed')) return;

    installBanner = document.createElement('aside');
    installBanner.className = 'pwa-install-banner';
    installBanner.setAttribute('aria-label', 'Install JANS TECH app');
    installBanner.innerHTML = `
      <div>
        <strong>Install JANS TECH app?</strong>
        <span>Keep your Python lessons ready offline.</span>
      </div>
      <div class="pwa-install-actions">
        <button type="button" class="pwa-install-button">Install</button>
        <button type="button" class="pwa-dismiss-button" aria-label="Dismiss install prompt">Dismiss</button>
      </div>`;
    document.body.appendChild(installBanner);

    installBanner.querySelector('.pwa-install-button').addEventListener('click', async () => {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      hideInstallBanner();
    });
    installBanner.querySelector('.pwa-dismiss-button').addEventListener('click', () => {
      localStorage.setItem('pwa-dismissed', 'true');
      hideInstallBanner();
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.setTimeout(showInstallBanner, 30000);
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  // ===== TOPIC LIST NAVIGATION (dynamic page loading) =====
  document.querySelectorAll('.topic-list a[data-page]').forEach(link => {
    const page = link.dataset.page;
    if (page) link.setAttribute('href', page);

    link.addEventListener('click', e => {
      e.preventDefault();
      if (page) {
        showToast('Loading: ' + link.textContent.trim(), 'fa-book-open');
        setTimeout(() => {
          window.location.href = page;
        }, 250);
      }
    });
  });

  // ===== RESOURCE LINKS (open in new tab) =====
  document.querySelectorAll('.resource-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const url = link.dataset.link || link.getAttribute('href');
      if (url && !url.startsWith('#')) {
        showToast('Opening: ' + link.textContent.trim(), 'fa-external-link-alt');
        setTimeout(() => {
          window.open(url, '_blank', 'noopener,noreferrer');
        }, 200);
      }
    });
  });

  // ===== CONTACT BUTTONS (open respective apps) =====
  document.querySelectorAll('.dynamic-contact').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const url = btn.dataset.contact;
      if (!url) return;
      if (url.startsWith('mailto:')) showToast('Opening email app...', 'fa-envelope');
      else if (url.includes('wa.me')) showToast('Opening WhatsApp...', 'fa-whatsapp');
      else if (url.startsWith('tel:')) showToast('Opening phone app...', 'fa-phone-alt');
      setTimeout(() => {
        window.location.href = url;
      }, 250);
    });
  });

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== SCROLL REVEAL =====
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.lesson-section, .roadmap-card').forEach(el => observer.observe(el));
})();