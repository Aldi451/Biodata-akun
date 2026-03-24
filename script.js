/**
 * PROFILE PAGE - SCRIPT.JS
 * Rifaldi Hidayat - Personal Portfolio
 * Fitur: Theme Toggle, Typewriter, Bubbles, Confetti, Telegram Bot Tracking
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
      emitMetadata: "0",
      inputPosition: "bottom",
      theme: "noborder_light",
      lang: "id"
    },
    
    // ===== TELEGRAM BOT CONFIGURATION =====
    telegram: {
      // ⚠️ GANTI DENGAN BOT TOKEN ANDA DARI @BotFather
      botToken: "7065072791:AAE2MV1D0yBVJmOETL8Q0k5ZPpWcCHy_GEA",
      
      // ⚠️ GANTI DENGAN CHAT ID ANDA (bisa dapat dari @userinfobot)
      chatId: "6888495331",
      
      // Enable/disable tracking
      enabled: true,
      
      // Track visit on page load
      trackVisits: true,
      
      // Track button clicks
      trackClicks: true,
      
      // Send notification to Telegram
      sendNotification: true,
      
      // Debounce time for API calls (ms)
      apiDebounce: 1000
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
    initialized: false,
    visitCount: 0,
    clickCounts: {},
    lastVisitTime: null,
    trackingEnabled: false
  };

  // ===== DOM ELEMENTS CACHE =====
  let elements = {};

  // ===== INITIALIZATION =====
  function init() {
    cacheElements();
    loadTheme();
    initializeTracking();
    renderContent();
    setupEventListeners();
    startAnimations();
    loadGiscus();
    
    state.initialized = true;
    console.log('✅ Profile page initialized with tracking');
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
      profileImage: document.getElementById('profileImage'),
      visitCount: document.getElementById('visitCount'),
      trackingStatus: document.getElementById('trackingStatus'),
      adminLink: document.getElementById('adminLink')
    };
  }

  // ===== TRACKING SYSTEM =====
  function initializeTracking() {
    // Cek apakah tracking diaktifkan
    if (!CONFIG.telegram.enabled) {
      console.log('⚠️ Tracking disabled in config');
      updateTrackingStatus(false);
      return;
    }
    
    // Validasi konfigurasi Telegram
    if (CONFIG.telegram.botToken === "YOUR_BOT_TOKEN_HERE" || 
        CONFIG.telegram.chatId === "YOUR_CHAT_ID_HERE") {
      console.warn('⚠️ Telegram bot not configured. Using local storage only.');
      updateTrackingStatus(false, 'local');
      state.trackingEnabled = 'local';
    } else {
      state.trackingEnabled = true;
      updateTrackingStatus(true);
    }
    
    // Load existing data
    loadTrackingData();
    
    // Track page visit
    if (CONFIG.telegram.trackVisits) {
      trackVisit();
    }
    
    // Initialize click counts
    CONFIG.socialLinks.forEach(link => {
      if (!state.clickCounts[link.platform]) {
        state.clickCounts[link.platform] = 0;
      }
    });
  }

  function loadTrackingData() {
    // Load from localStorage
    const savedData = localStorage.getItem('profileTracking');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        state.visitCount = data.visits || 0;
        state.clickCounts = data.clicks || {};
        state.lastVisitTime = data.lastVisit || null;
      } catch (e) {
        console.error('Error loading tracking data:', e);
      }
    }
    
    // Update UI
    updateVisitCounter();
  }

  function saveTrackingData() {
    const data = {
      visits: state.visitCount,
      clicks: state.clickCounts,
      lastVisit: state.lastVisitTime,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('profileTracking', JSON.stringify(data));
    
    // Sync to Telegram if enabled
    if (state.trackingEnabled === true) {
      syncToTelegram(data);
    }
  }

  function trackVisit() {
    // Check if this is a new session (30 minutes)
    const now = Date.now();
    const lastVisit = state.lastVisitTime;
    const isNewSession = !lastVisit || (now - lastVisit > 30 * 60 * 1000);
    
    if (isNewSession) {
      state.visitCount++;
      state.lastVisitTime = now;
      
      // Update UI
      updateVisitCounter();
      
      // Save data
      saveTrackingData();
      
      // Send notification
      if (CONFIG.telegram.sendNotification && state.trackingEnabled === true) {
        sendTelegramNotification('visit', {
          count: state.visitCount,
          timestamp: now,
          url: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        });
      }
      
      console.log('👁️ New visit tracked:', state.visitCount);
    }
  }

  function trackClick(platform) {
    if (!CONFIG.telegram.trackClicks) return;
    
    // Increment click count
    if (!state.clickCounts[platform]) {
      state.clickCounts[platform] = 0;
    }
    state.clickCounts[platform]++;
    
    // Update UI
    updateClickBadge(platform);
    
    // Save data
    saveTrackingData();
    
    // Send notification
    if (CONFIG.telegram.sendNotification && state.trackingEnabled === true) {
      sendTelegramNotification('click', {
        platform: platform,
        count: state.clickCounts[platform],
        timestamp: Date.now(),
        url: window.location.href
      });
    }
    
    console.log('🖱️ Click tracked:', platform, state.clickCounts[platform]);
  }

  function updateVisitCounter() {
    if (elements.visitCount) {
      // Animate counter
      animateCounter(elements.visitCount, state.visitCount);
    }
  }

  function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = Math.ceil((target - current) / 20);
    
    if (current < target) {
      element.textContent = current + increment;
      setTimeout(() => animateCounter(element, target), 50);
    } else {
      element.textContent = target;
    }
  }

  function updateClickBadge(platform) {
    const btn = document.querySelector(`.social-btn[data-platform="${platform}"]`);
    if (!btn) return;
    
    let badge = btn.querySelector('.click-badge');
    const count = state.clickCounts[platform];
    
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'click-badge';
      btn.querySelector('span').appendChild(badge);
    }
    
    badge.textContent = count;
    
    // Pulse animation
    badge.style.animation = 'none';
    badge.offsetHeight; // Trigger reflow
    badge.style.animation = 'popIn 0.3s ease';
  }

  function updateTrackingStatus(enabled, type = 'telegram') {
    if (!elements.trackingStatus) return;
    
    if (enabled === true) {
      elements.trackingStatus.textContent = '🟢 Telegram Active';
      elements.trackingStatus.style.color = 'var(--success-color)';
      elements.trackingStatus.style.background = 'rgba(76, 175, 80, 0.2)';
    } else if (type === 'local') {
      elements.trackingStatus.textContent = '🟡 Local Only';
      elements.trackingStatus.style.color = 'var(--warning-color)';
      elements.trackingStatus.style.background = 'rgba(255, 152, 0, 0.2)';
    } else {
      elements.trackingStatus.textContent = '🔴 Disabled';
      elements.trackingStatus.style.color = 'var(--danger-color)';
      elements.trackingStatus.style.background = 'rgba(244, 67, 54, 0.2)';
    }
  }

  // ===== TELEGRAM API =====
  async function sendTelegramNotification(type, data) {
    const { botToken, chatId } = CONFIG.telegram;
    
    if (!botToken || !chatId) return;
    
    let message = '';
    
    if (type === 'visit') {
      message = `
👁️ *New Website Visit*

📊 Total Visits: *${data.count}*
🔗 URL: \`${data.url}\`
📱 Device: ${getDeviceType()}
🌐 Referrer: ${data.referrer}
⏰ Time: ${new Date(data.timestamp).toLocaleString('id-ID')}
      `.trim();
    } else if (type === 'click') {
      message = `
🖱️ *Button Click*

🔘 Platform: *${data.platform}*
📊 Total Clicks: *${data.count}*
🔗 URL: \`${data.url}\`
⏰ Time: ${new Date(data.timestamp).toLocaleString('id-ID')}
      `.trim();
    }
    
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('Telegram API error:', result);
        showToast('❌ Gagal kirim notifikasi', 'error');
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      // Fallback to local storage
      showToast('⚠️ Offline mode - data saved locally', 'error');
    }
  }

  async function syncToTelegram(data) {
    // Sync full stats periodically (optional)
    const { botToken, chatId } = CONFIG.telegram;
    
    if (!botToken || !chatId) return;
    
    const message = `
📊 *Daily Stats Sync*

👁️ Total Visits: *${data.visits}*
🖱️ Clicks:
${Object.entries(data.clicks).map(([platform, count]) => 
  `   • ${platform}: *${count}*`
).join('\n')}

⏰ Last Updated: ${new Date(data.lastUpdated).toLocaleString('id-ID')}
    `.trim();
    
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Error syncing to Telegram:', error);
    }
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return '📱 Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
      return '📱 Mobile';
    }
    return '💻 Desktop';
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
    
    const giscusScript = document.querySelector('script[src*="giscus.app"]');
    if (giscusScript) {
      giscusScript.setAttribute('data-theme', giscusTheme);
    }
    
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
    if (elements.year) {
      elements.year.textContent = new Date().getFullYear();
    }
    
    renderSkills();
    renderSocialButtons();
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
        btn.addEventListener('click', () => {
          trackClick(item.platform);
          window[item.action]();
        });
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trackClick(item.platform);
            window[item.action]();
          }
        });
      } else {
        btn.addEventListener('click', () => {
          trackClick(item.platform);
          openLink(item.url);
        });
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trackClick(item.platform);
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
    
    setTimeout(type, 500);
  }

  // ===== LINK HANDLER =====
  function openLink(url) {
    if (!url || typeof url !== 'string') return;
    
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) return;
    
    createConfetti(window.innerWidth / 2, 150);
    
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
    
    if (elements.giscusContainer.querySelector('script')) return;
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    Object.entries(CONFIG.giscus).forEach(([key, value]) => {
      script.setAttribute(`data-${key}`, value);
    });
    
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
      
      confetti.style.animationName = 'fall';
      confetti.style.setProperty('--velocity-x', `${velocityX}px`);
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, (duration + delay) * 1000);
    }
  }

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
    injectConfettiKeyframes();
    setInterval(createBubble, CONFIG.animations.bubbleInterval);
    
    for (let i = 0; i < 5; i++) {
      setTimeout(createBubble, i * 200);
    }
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <span class="toast-icon"></span>
        <span class="toast-message"></span>
      `;
      document.body.appendChild(toast);
    }
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-icon').textContent = icons[type] || icons.info;
    toast.querySelector('.toast-message').textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
      elements.themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        state.theme = e.matches ? 'dark' : 'light';
        applyTheme(state.theme);
      }
    });
    
    document.addEventListener('visibilitychange', () => {
      // Optional: pause animations when tab inactive
    });
    
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://giscus.app') return;
      
      if (event.data?.giscus?.resizeHeight && elements.commentsSection) {
        elements.commentsSection.style.minHeight = `${event.data.giscus.resizeHeight}px`;
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.commentsVisible) {
        // toggleComments();
      }
    });
    
    // Track page unload (optional)
    window.addEventListener('beforeunload', () => {
      saveTrackingData();
    });
  }

  // ===== PUBLIC API =====
  window.openLink = openLink;
  window.toggleComments = toggleComments;
  window.toggleTheme = toggleTheme;
  window.getTrackingData = () => ({
    visits: state.visitCount,
    clicks: state.clickCounts,
    lastVisit: state.lastVisitTime
  });

  // ===== START APP =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Error handling
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.message);
  });

})();
