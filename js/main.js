(function() {
  'use strict';

  // This whole file runs once when the page loads.
  // It controls the mobile menu, splash screen, notifications,
  // lesson navigation, and app-like behaviour for the website.

  // ===== SPLASH SCREEN =====
  // The splash screen is the welcome screen that appears first.
  // It hides itself after a short delay so users can enter the app.
  const SPLASH_DURATION = 5000;
  const splash = document.getElementById('splash');

  if (splash) {
    // Hide the splash screen automatically after 5 seconds.
    setTimeout(() => {
      splash.classList.add('hidden');
    }, SPLASH_DURATION);

    // Allow users to skip the splash screen by clicking anywhere on it.
    splash.addEventListener('click', () => {
      splash.classList.add('hidden');
    });
  }

  // ===== NAVBAR BEHAVIOUR =====
  // When the page is scrolled down, the navbar gets a darker style.
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // Redirect any Home button to the landing page.
  // This keeps the user on the true homepage even when they are in a lesson page.
  function redirectToHome() {
    const homePath = window.location.pathname.includes('/pages/') ? '../pages/index.html' : './pages/index.html';
    window.location.href = homePath;
  }

  document.querySelectorAll('.logo, .home-link, [data-home-link], a[href="index.html"], a[href="../index.html"]').forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      redirectToHome();
    });
  });

  // ===== HAMBURGER MENU =====
  // These elements represent the side menu and its open/close controls.
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const overlay = document.getElementById('overlay');

  // Opens the menu and prevents the page behind it from scrolling.
  function openMenu() {
    sideMenu?.classList.add('open');
    overlay?.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  // Closes the menu and restores normal page scrolling.
  function closeMenu() {
    sideMenu?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  // Connect the menu buttons to their actions.
  hamburgerBtn?.addEventListener('click', openMenu);
  closeMenuBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  // Pressing the Escape key closes the menu.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // ===== TOAST NOTIFICATIONS =====
  // A toast is a small popup message that appears briefly.
  // It is used to tell users what action is happening.
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer;

  function showToast(message, icon = 'fa-check-circle') {
    if (!toast) return;

    toastMsg.textContent = message;
    toast.querySelector('i').className = `fas ${icon}`;
    toast.classList.add('show');

    // Clear any previous timer so the toast stays visible for the right time.
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== ONLINE / OFFLINE STATUS =====
  // The browser fires these events when network connection changes.
  window.addEventListener('offline', () => {
    showToast('You are offline - app still works!', 'fa-wifi');
  });

  window.addEventListener('online', () => {
    showToast('Back online', 'fa-cloud');
  });

  // ===== PWA INSTALL PROMPT =====
  // This feature allows the website to behave like an installed app.
  // It shows a small banner asking the user if they want to install it.
  let deferredInstallPrompt;
  let installBanner;

  function hideInstallBanner() {
    installBanner?.remove();
    installBanner = null;
  }

  function showInstallBanner() {
    // Only show the install prompt if the app supports installation
    // and the user has not dismissed it already.
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

    // If the user clicks install, trigger the native installation prompt.
    installBanner.querySelector('.pwa-install-button').addEventListener('click', async () => {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      hideInstallBanner();
    });

    // If the user dismisses it, remember that choice for later.
    installBanner.querySelector('.pwa-dismiss-button').addEventListener('click', () => {
      localStorage.setItem('pwa-dismissed', 'true');
      hideInstallBanner();
    });
  }

  // This event is fired by the browser when the app is installable.
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.setTimeout(showInstallBanner, 30000);
  });

  // When the app is installed, clear the install prompt state.
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  // ===== PROGRESS TRACKING =====
  // Store which lessons a learner has reached so the home page can
  // show a professional progress indicator based on activity.
  const lessonLinks = Array.from(document.querySelectorAll('.topic-list a[data-page]'));
  const roadmapPages = lessonLinks.map(link => link.dataset.page);
  const storageKey = 'jans-tech-progress';
  const skippedStorageKey = 'jans-tech-skipped-lessons';

  function saveLessonProgress(pageName) {
    if (!pageName) return;

    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const skipped = JSON.parse(localStorage.getItem(skippedStorageKey) || '[]');
    const targetIndex = roadmapPages.indexOf(pageName);
    const firstIncomplete = roadmapPages.findIndex(page => !saved.includes(page));

    // Any earlier lesson left behind the selected lesson is recorded as skipped.
    if (targetIndex > firstIncomplete && firstIncomplete !== -1) {
      const newlySkipped = roadmapPages.slice(firstIncomplete, targetIndex);
      newlySkipped.forEach(page => {
        if (!skipped.includes(page)) skipped.push(page);
      });
    }

    const next = saved.includes(pageName) ? saved : [...saved, pageName];
    localStorage.setItem(storageKey, JSON.stringify(next));
    localStorage.setItem(skippedStorageKey, JSON.stringify(skipped.filter(page => page !== pageName)));
  }

  function getSkippedLessons() {
    return JSON.parse(localStorage.getItem(skippedStorageKey) || '[]');
  }

  function updateSkippedLessonStyles(skipped) {
    lessonLinks.forEach(link => {
      link.classList.toggle('skipped-lesson', skipped.includes(link.dataset.page));
    });
  }

  function updateProgressUI() {
    const progressLabel = document.getElementById('progressLabel');
    const progressFill = document.getElementById('progressFill');
    const progressStatus = document.getElementById('progressStatus');

    if (!progressLabel || !progressFill || !progressStatus) return;

    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const skipped = getSkippedLessons();
    const total = lessonLinks.length || 19;
    let reached = 0;
    while (roadmapPages[reached] && saved.includes(roadmapPages[reached])) reached += 1;
    const percent = Math.min(100, Math.round((reached / total) * 100));
    const latestPage = currentPage !== 'index.html' ? currentPage : saved[saved.length - 1];
    const latestLink = lessonLinks.find(link => link.dataset.page === latestPage);
    const currentLesson = latestLink
      ? latestLink.textContent.trim().replace(/^\d+\.\s*/, '')
      : '';
    const skippedNames = skipped
      .map(page => lessonLinks.find(link => link.dataset.page === page))
      .filter(Boolean)
      .map(link => link.textContent.trim().replace(/^\d+\.\s*/, ''));

    progressLabel.textContent = `${reached} / ${total} lessons`;
    progressFill.style.width = `${percent}%`;
    updateSkippedLessonStyles(skipped);

    if (!reached) {
      progressStatus.textContent = skippedNames.length
        ? `You skipped: ${skippedNames.join(', ')}. Currently on: ${currentLesson}.`
        : 'Your learning journey is ready to begin.';
    } else if (reached === total) {
      progressStatus.textContent = `You have reached ${reached} lessons. Currently on: ${currentLesson}. You have completed the full roadmap.`;
    } else if (skippedNames.length) {
      progressStatus.textContent = `You have reached ${reached} lesson${reached === 1 ? '' : 's'} in order. You skipped: ${skippedNames.join(', ')}. Currently on: ${currentLesson}.`;
    } else {
      progressStatus.textContent = `You have reached ${reached} lesson${reached === 1 ? '' : 's'} in order. Currently on: ${currentLesson}.`;
    }
  }

  // If the current page is a lesson page, save it as reached progress.
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage && roadmapPages.includes(currentPage)) {
    saveLessonProgress(currentPage);
  }
  updateProgressUI();

  // Start button opens the lesson menu directly.
  const startLearningBtn = document.getElementById('startLearningBtn');
  startLearningBtn?.addEventListener('click', () => {
    openMenu();
    showToast('Opening lesson roadmap...', 'fa-road');
  });

  // ===== LESSON NAVIGATION =====
  // Each lesson item in the side menu is linked to a page.
  // This code prevents the default page jump and shows a toast first.
  lessonLinks.forEach(link => {
    const page = link.dataset.page;
    if (page) link.setAttribute('href', page);

    link.addEventListener('click', e => {
      e.preventDefault();
      if (page) {
        saveLessonProgress(page);
        showToast('Loading: ' + link.textContent.trim(), 'fa-book-open');
        setTimeout(() => {
          window.location.href = page;
        }, 250);
      }
    });
  });

  // ===== WHATSAPP ASSIGNMENT SUBMISSIONS =====
  // Add a response field to every assignment so learners can send their work
  // directly to JANS TECH for review without needing a server or account.
  const lessonTitle = document.querySelector('.lesson-header h1')?.textContent.trim() || 'Python lesson';
  document.querySelectorAll('.assignment-box').forEach(assignment => {
    const assignmentTitle = assignment.querySelector('h3')?.textContent.trim() || 'Assignment';
    const responseArea = document.createElement('div');
    responseArea.className = 'assignment-submit';
    responseArea.innerHTML = `
      <label for="assignmentResponse">Your completed work</label>
      <textarea id="assignmentResponse" rows="6" placeholder="Type or paste your code and answers here..."></textarea>
      <button type="button" class="whatsapp-submit">
        <i class="fab fa-whatsapp"></i> Send Assignment on WhatsApp
      </button>`;
    assignment.appendChild(responseArea);

    responseArea.querySelector('button').addEventListener('click', () => {
      const response = responseArea.querySelector('textarea').value.trim();
      if (!response) {
        showToast('Add your completed work first.', 'fa-pen');
        responseArea.querySelector('textarea').focus();
        return;
      }

      const message = `Hello JANS TECH,\n\nI have completed ${assignmentTitle} in ${lessonTitle}.\n\nMy work:\n${response}`;
      const whatsappUrl = `https://wa.me/254784095825?text=${encodeURIComponent(message)}`;
      showToast('Opening WhatsApp...', 'fa-whatsapp');
      setTimeout(() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer'), 250);
    });
  });

  // ===== EXTERNAL RESOURCE LINKS =====
  // Resource links open in a new tab instead of replacing the current page.
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

  // ===== CONTACT BUTTONS =====
  // Contact cards open the email app, WhatsApp, or phone dialer.
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

  // ===== BACK TO TOP BUTTON =====
  // This button appears after the user scrolls down the page.
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== SCROLL REVEAL EFFECT =====
  // This uses the Intersection Observer API to animate sections
  // when they come into view while scrolling.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.lesson-section, .roadmap-card').forEach(el => observer.observe(el));
})();