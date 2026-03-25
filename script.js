(function () {
  'use strict';

  // ===== KONFIGURASI GLOBAL =====
  const CONFIG = {
    profile: {
      name: "Rifaldi Hidayat",
      bio: "👋 Halo! Saya pengembang web yang suka membuat pengalaman digital yang menarik dan interaktif.",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Node.js"]
    },

    socialLinks: [
      {
        platform: "facebook",
        label: "Facebook",
        icon: "f",
        url: "https://www.facebook.com/aldy.hidayat.568?_rdr"
      },
      {
        platform: "instagram",
        label: "Instagram",
        icon: "📷",
        url: "https://www.instagram.com/hidayat_rifaldi"
      },
      {
        platform: "twitter",
        label: "Twitter / X",
        icon: "𝕏",
        url: "https://x.com/RifaldiHidaya15"
      },
      {
        platform: "comment",
        label: "Comment Columns",
        icon: "💬",
        action: "toggleComments"
      }
    ],

    // ✅ FIX DI SINI (emitMeta)
    giscus: {
      repo: "Aldi451/Biodata-akun",
      repoId: "R_kgDORc6sAA",
      category: "General",
      categoryId: "DIC_kwDORc6sAM4C3kFi",
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMeta: "0",
      inputPosition: "bottom",
      theme: "noborder_light",
      lang: "id"
    },

    animations: {
      typewriterSpeed: 100,
      bubbleInterval: 600,
      bubbleLifetime: 13000,
      confettiCount: 25
    }
  };

  const state = {
    theme: 'light',
    commentsVisible: false
  };

  let elements = {};

  // ===== INIT =====
  function init() {
    cacheElements();
    loadTheme();
    renderContent();
    setupEventListeners();
    startAnimations();
    loadGiscus();
  }

  function cacheElements() {
    elements = {
      body: document.body,
      themeToggle: document.getElementById('themeToggle'),
      typewriter: document.getElementById('typewriter'),
      skillsContainer: document.getElementById('skillsContainer'),
      socialButtons: document.getElementById('socialButtons'),
      commentsSection: document.getElementById('commentsSection'),
      giscusContainer: document.getElementById('giscus-container'),
      year: document.getElementById('year')
    };
  }

  // ===== THEME =====
  function loadTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    elements.body.setAttribute('data-theme', theme);
    updateGiscusTheme(theme);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme(state.theme);
    createConfetti(window.innerWidth / 2, 30);
  }

  function updateGiscusTheme(theme) {
    const iframe = document.querySelector('.giscus-frame');

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        giscus: {
          setConfig: {
            theme: theme === 'dark' ? 'dark' : 'light'
          }
        }
      }, 'https://giscus.app');
    }
  }

  // ===== RENDER =====
  function renderContent() {
    elements.year.textContent = new Date().getFullYear();
    renderSkills();
    renderSocialButtons();
    startTypewriter();
  }

  function renderSkills() {
    elements.skillsContainer.innerHTML = '';

    CONFIG.profile.skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      elements.skillsContainer.appendChild(tag);
    });
  }

  function renderSocialButtons() {
    elements.socialButtons.innerHTML = '';

    CONFIG.socialLinks.forEach(item => {
      // ✅ GANTI DIV -> BUTTON
      const btn = document.createElement('button');
      btn.className = 'social-btn';
      btn.type = 'button';
      btn.setAttribute('data-platform', item.platform);

      btn.innerHTML = `
        <div class="icon-circle">${item.icon}</div>
        <span>${item.label}</span>
      `;

      if (item.action) {
        btn.onclick = () => window[item.action]();
      } else {
        btn.onclick = () => openLink(item.url);
      }

      elements.socialButtons.appendChild(btn);
    });
  }

  // ===== TYPEWRITER =====
  function startTypewriter() {
    const text = CONFIG.profile.name;
    let i = 0;

    elements.typewriter.textContent = '';

    function type() {
      if (i < text.length) {
        elements.typewriter.textContent += text[i];
        i++;
        setTimeout(type, CONFIG.animations.typewriterSpeed);
      }
    }

    setTimeout(type, 500);
  }

  // ===== LINK =====
  function openLink(url) {
    if (!url.startsWith('http')) return;

    createConfetti(window.innerWidth / 2, 150);

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 200);
  }

  // ===== COMMENTS =====
  function toggleComments() {
    state.commentsVisible = !state.commentsVisible;

    elements.commentsSection.classList.toggle('active');

    if (state.commentsVisible) {
      loadGiscus();
    }
  }

  function loadGiscus() {
    if (!elements.giscusContainer) return;
    if (window.giscusLoaded) return;

    window.giscusLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    Object.entries(CONFIG.giscus).forEach(([k, v]) => {
      script.setAttribute(`data-${k}`, v);
    });

    elements.giscusContainer.appendChild(script);
  }

  // ===== ANIMATION =====
  function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = Math.random() * 100 + 'vw';
    bubble.style.width = bubble.style.height = (Math.random() * 40 + 20) + 'px';

    document.body.appendChild(bubble);

    setTimeout(() => bubble.remove(), 13000);
  }

  function createConfetti(x, y) {
    for (let i = 0; i < CONFIG.animations.confettiCount; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';

      el.style.left = x + 'px';
      el.style.top = y + 'px';

      document.body.appendChild(el);

      setTimeout(() => el.remove(), 3000);
    }
  }

  function startAnimations() {
    setInterval(createBubble, CONFIG.animations.bubbleInterval);
  }

  // ===== EVENTS =====
  function setupEventListeners() {
    elements.themeToggle.onclick = toggleTheme;
  }

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);

  // Global
  window.toggleComments = toggleComments;

})();
