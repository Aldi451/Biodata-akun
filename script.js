/**
 * PROFILE PAGE - SCRIPT.JS
 * Rifaldi Hidayat - Personal Portfolio
 * Fitur: Theme Toggle, Typewriter, Bubbles, Confetti, Dynamic Content
 */

(function() {
  'use strict';

  // ===== KONFIGURASI GLOBAL =====
  const CONFIG = {
    // Data profil
    profile: {
      name: "Rifaldi Hidayat",
      bio: "👋 Halo! Saya pengembang web yang suka membuat pengalaman digital yang menarik dan interaktif.",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Node.js"]
    },
    
    // Data media sosial
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
    
    // Konfigurasi Giscus
    giscus: {
      repo: "Aldi451/Biodata-akun",
      repoId: "R_kgDORc6sAA",
      category: "General",
      categoryId: "DIC_kwDORc6sAM4C3kFi",
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMeta "0",
      inputPosition: "bottom",
      theme: "noborder_light",
      lang: "id"
    },
    
    // Animasi
    animations: {
      typewriterSpeed: 100,
      bubbleInterval: 600,
      bubbleLifetime: 13000,
      confettiCount: 25,
      confettiDuration: 3000
    }
  };

  // ===== STATE MANAGEMENT =====
  const state = {
    theme: 'light',
    commentsVisible: false,
    initialized: false
  };

  // ===== DOM ELEMENTS CACHE =====
  let elements = {};

  // ===== INITIALIZATION =====
  function init() {
    cacheElements();
    loadTheme();
    renderContent();
    setupEventListeners();
    startAnimations();
    loadGiscus();
    
    state.initialized = true;
    console.log('✅ Profile page initialized');
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
      year: document.getElementById('year'),
      profileImage: document.getElementById('profileImage')
    };
  }

  // ===== THEME MANAGEMENT =====
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
    
    // Feedback visual
    createConfetti(window.innerWidth / 2, 30);
  }

  function updateGiscusTheme(theme) {
    const giscusTheme = theme === 'dark' ? 'noborder_dark' : 'noborder_light';
    
    // Update attribute jika script sudah load
    const giscusScript = document.querySelector('script[src*="giscus.app"]');
    if (giscusScript) {
      giscusScript.setAttribute('data-theme', giscusTheme);
    }
    
    // Post message ke iframe jika sudah ada
    const iframe = document.querySelector('.giscus-frame iframe');
    if (iframe) {
      iframe.contentWindow.postMessage({
        giscus: {
          setConfig: { theme: giscusTheme }
        }
      }, 'https://giscus.app');
    }
  }

  // ===== CONTENT RENDERING =====
  function renderContent() {
    // Set tahun footer
    if (elements.year) {
      elements.year.textContent = new Date().getFullYear();
    }
    
    // Render skill tags
    renderSkills();
    
    // Render social buttons
    renderSocialButtons();
    
    // Start typewriter
    startTypewriter();
  }

  function renderSkills() {
    if (!elements.skillsContainer) return;
    
    elements.skillsContainer.innerHTML = '';
    
    CONFIG.profile.skills.forEach((skill, index) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.style.animationDelay = `${0.1 + index * 0.1}s`;
      elements.skillsContainer.appendChild(tag);
    });
  }

  function renderSocialButtons() {
    if (!elements.socialButtons) return;
    
    elements.socialButtons.innerHTML = '';
    
    CONFIG.socialLinks.forEach((item, index) => {
      const btn = document.createElement('div');
      btn.className = 'social-btn';
      btn.setAttribute('data-platform', item.platform);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.style.animationDelay = `${0.1 + index * 0.1}s`;
      
      btn.innerHTML = `
        <div class="icon-circle" aria-hidden="true">${item.icon}</div>
        <span>${item.label}</span>
      `;
      
      if (item.action) {
        btn.addEventListener('click', () => window[item.action]());
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window[item.action]();
          }
        });
      } else {
        btn.addEventListener('click', () => openLink(item.url));
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLink(item.url);
          }
        });
      }
      
      elements.socialButtons.appendChild(btn);
    });
  }

  // ===== TYPEWRITER EFFECT =====
  function startTypewriter() {
    if (!elements.typewriter) return;
    
    const text = CONFIG.profile.name;
    let index = 0;
    
    function type() {
      if (index < text.length) {
        elements.typewriter.textContent += text.charAt(index);
        index++;
        setTimeout(type, CONFIG.animations.typewriterSpeed);
      }
    }
    
    // Delay sedikit sebelum mulai
    setTimeout(type, 500);
  }

  // ===== LINK HANDLER =====
  function openLink(url) {
    // Validasi URL
    if (!url || typeof url !== 'string') return;
    
    // Trim dan validasi protocol
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) return;
    
    // Confetti feedback
    createConfetti(window.innerWidth / 2, 150);
    
    // Open dengan security best practices
    setTimeout(() => {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }, 200);
  }

  // ===== COMMENTS TOGGLE =====
  function toggleComments() {
    if (!elements.commentsSection) return;
    
    state.commentsVisible = !state.commentsVisible;
    elements.commentsSection.classList.toggle('active', state.commentsVisible);
    
    if (state.commentsVisible) {
      createConfetti(window.innerWidth / 2, elements.commentsSection.offsetTop);
      loadGiscus();
    }
  }

  // ===== GISCUS LOADER =====
  function loadGiscus() {
    if (!elements.giscusContainer) return;
    
    // Cek apakah sudah loaded
    if (elements.giscusContainer.querySelector('script')) return;
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Set semua atribut konfigurasi
    Object.entries(CONFIG.giscus).forEach(([key, value]) => {
      script.setAttribute(`data-${key}`, value);
    });
    
    // Set theme berdasarkan state saat ini
    script.setAttribute('data-theme', state.theme === 'dark' ? 'noborder_dark' : 'noborder_light');
    
    elements.giscusContainer.appendChild(script);
  }

  // ===== BUBBLE ANIMATION =====
  function createBubble() {
    const bubble = document.createElement('div');
    const size = Math.random() * 50 + 20;
    
    bubble.className = 'bubble';
    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}vw;
      top: 100vh;
    `;
    
    document.body.appendChild(bubble);
    
    // Cleanup
    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.remove();
      }
    }, CONFIG.animations.bubbleLifetime);
  }

  // ===== CONFETTI EFFECT =====
  function createConfetti(x, y) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#ffd93d'];
    
    for (let i = 0; i < CONFIG.animations.confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random properties
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = Math.random() > 0.5 ? '50%' : '3px';
      const delay = Math.random() * 0.3;
      const duration = (Math.random() * 2 + 2);
      const angle = Math.random() * 60 - 30;
      const velocityX = Math.random() * 200 - 100;
      
      confetti.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        --velocity-x: ${velocityX}px;
        transform: rotate(${angle}deg);
      `;
      
      // Custom animation dengan variasi
      confetti.style.animationName = 'fall';
      confetti.style.setProperty('--velocity-x', `${velocityX}px`);
      
      document.body.appendChild(confetti);
      
      // Cleanup
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, (duration + delay) * 1000);
    }
  }

  // Tambahkan keyframes dinamis untuk confetti dengan horizontal movement
  function injectConfettiKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(0) rotate(0deg) translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg) translateX(var(--velocity-x, 0));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ===== ANIMATION STARTER =====
  function startAnimations() {
    // Inject custom keyframes
    injectConfettiKeyframes();
    
    // Start bubble loop
    setInterval(createBubble, CONFIG.animations.bubbleInterval);
    
    // Create initial bubbles
    for (let i = 0; i < 5; i++) {
      setTimeout(createBubble, i * 200);
    }
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Theme toggle click
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
      elements.themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        state.theme = e.matches ? 'dark' : 'light';
        applyTheme(state.theme);
      }
    });
    
    // Handle visibility change (pause animations when tab inactive)
    document.addEventListener('visibilitychange', () => {
      // Bisa ditambahkan logika pause animasi jika diperlukan
    });
    
    // Handle Giscus resize messages
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://giscus.app') return;
      
      if (event.data?.giscus?.resizeHeight && elements.commentsSection) {
        elements.commentsSection.style.minHeight = `${event.data.giscus.resizeHeight}px`;
      }
    });
    
    // Keyboard navigation enhancement
    document.addEventListener('keydown', (e) => {
      // ESC untuk close comments (opsional)
      if (e.key === 'Escape' && state.commentsVisible) {
        // toggleComments(); // Uncomment jika ingin ESC menutup comments
      }
    });
  }

  // ===== PUBLIC API (untuk akses global) =====
  window.openLink = openLink;
  window.toggleComments = toggleComments;
  window.toggleTheme = toggleTheme;

  // ===== START APP =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Error handling global
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.message);
    // Jangan tampilkan error ke user untuk UX yang lebih baik
  });

})();
