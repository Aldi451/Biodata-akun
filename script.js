/**
 * PROFILE PAGE - FINAL VERSION (FIXED)
 * Rifaldi Hidayat - Personal Portfolio
 */

(function() {
  'use strict';

  // ===== KONFIGURASI =====
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
    
    telegram: {
      botToken: "7065072791:AAE2MV1D0yBVJmOETL8Q0k5ZPpWcCHy_GEA",
      chatId: "6888495331",
      enabled: true,
      trackVisits: true,
      trackClicks: true,
      sendNotification: true,
      debug: true
    },
    
    animations: {
      typewriterSpeed: 100,
      bubbleInterval: 800,
      bubbleLifetime: 13000,
      confettiCount: 20,
      confettiDuration: 2500
    }
  };

  // ===== STATE =====
  const state = {
    theme: 'light',
    commentsVisible: false,
    initialized: false,
    visitCount: 0,
    clickCounts: {},
    lastVisitTime: null,
    trackingEnabled: false,
    telegramTested: false
  };

  let elements = {};

  // ===== INIT =====
  function init() {
    cacheElements();
    loadTheme();
    initializeTracking();
    renderContent();
    setupEventListeners();
    startAnimations();
    loadGiscus();
    
    setTimeout(testTelegramConnection, 2000);
    
    state.initialized = true;
    log('✅ Profile page initialized');
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
      visitCount: document.getElementById('visitCount'),
      trackingStatus: document.getElementById('trackingStatus'),
      toast: document.getElementById('toast')
    };
  }

  // ===== LOGGING =====
  function log(message, level = 'info') {
    if (!CONFIG.telegram.debug) return;
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
    console.log(prefix[level] + ' [Tracking] ' + message);
  }

  // ===== TRACKING =====
  function initializeTracking() {
    if (!CONFIG.telegram.enabled) {
      updateTrackingStatus(false);
      return;
    }
    
    if (!CONFIG.telegram.botToken || CONFIG.telegram.botToken.includes('YOUR_BOT_TOKEN')) {
      updateTrackingStatus(false, 'local');
      state.trackingEnabled = 'local';
      return;
    }
    
    if (!/^\d+$/.test(CONFIG.telegram.chatId)) {
      updateTrackingStatus(false, 'invalid');
      state.trackingEnabled = false;
      showToast('⚠️ Chat ID harus angka!', 'warning');
      return;
    }
    
    state.trackingEnabled = true;
    updateTrackingStatus(true);
    loadTrackingData();
    
    if (CONFIG.telegram.trackVisits) {
      trackVisit();
    }
    
    CONFIG.socialLinks.forEach(function(link) {
      if (!state.clickCounts[link.platform]) {
        state.clickCounts[link.platform] = 0;
      }
    });
  }

  function loadTrackingData() {
    const saved = localStorage.getItem('profileTracking');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.visitCount = data.visits || 0;
        state.clickCounts = data.clicks || {};
        state.lastVisitTime = data.lastVisit || null;
      } catch (e) {
        log('Error loading  ' + e.message, 'error');
      }
    }
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
    
    if (state.trackingEnabled === true) {
      syncToTelegram(data);
    }
  }

  function trackVisit() {
    const now = Date.now();
    const lastVisit = state.lastVisitTime;
    const isNewSession = !lastVisit || (now - lastVisit > 30 * 60 * 1000);
    
    if (isNewSession) {
      state.visitCount++;
      state.lastVisitTime = now;
      updateVisitCounter();
      saveTrackingData();
      
      if (CONFIG.telegram.sendNotification && state.trackingEnabled) {
        sendTelegramNotification('visit', {
          count: state.visitCount,
          timestamp: now,
          url: window.location.href,
          referrer: document.referrer || 'direct'
        });
      }
      
      log('👁️ New visit: #' + state.visitCount);
    }
  }

  function trackClick(platform) {
    if (!CONFIG.telegram.trackClicks) return;
    
    if (!state.clickCounts[platform]) {
      state.clickCounts[platform] = 0;
    }
    state.clickCounts[platform]++;
    
    updateClickBadge(platform);
    saveTrackingData();
    
    if (CONFIG.telegram.sendNotification && state.trackingEnabled) {
      sendTelegramNotification('click', {
        platform: platform,
        count: state.clickCounts[platform],
        timestamp: Date.now(),
        url: window.location.href
      });
    }
    
    log('🖱️ Click: ' + platform + ' (' + state.clickCounts[platform] + ')');
  }

  function updateVisitCounter() {
    if (elements.visitCount) {
      animateCounter(elements.visitCount, state.visitCount);
    }
  }

  function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    if (current >= target) {
      element.textContent = target;
      return;
    }
    
    const increment = Math.ceil((target - current) / 10);
    element.textContent = current + increment;
    
    if (current + increment < target) {
      setTimeout(function() { animateCounter(element, target); }, 50);
    } else {
      element.textContent = target;
    }
  }

  function updateClickBadge(platform) {
    const btn = document.querySelector('.social-btn[data-platform="' + platform + '"]');
    if (!btn) return;
    
    let badge = btn.querySelector('.click-badge');
    const count = state.clickCounts[platform];
    
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'click-badge';
      const labelSpan = btn.querySelector('span');
      if (labelSpan) labelSpan.appendChild(badge);
    }
    
    badge.textContent = count;
    badge.style.animation = 'none';
    void badge.offsetHeight;
    badge.style.animation = 'popIn 0.3s ease';
  }

  function updateTrackingStatus(enabled, type) {
    if (!elements.trackingStatus) return;
    if (type === undefined) type = 'telegram';
    
    if (enabled === true) {
      elements.trackingStatus.textContent = '🟢 Active';
      elements.trackingStatus.style.background = 'rgba(72, 187, 120, 0.2)';
      elements.trackingStatus.style.color = 'var(--success-color)';
    } else if (type === 'local') {
      elements.trackingStatus.textContent = '🟡 Local';
      elements.trackingStatus.style.background = 'rgba(237, 137, 54, 0.2)';
      elements.trackingStatus.style.color = 'var(--warning-color)';
    } else {
      elements.trackingStatus.textContent = '🔴 Off';
      elements.trackingStatus.style.background = 'rgba(245, 101, 101, 0.2)';
      elements.trackingStatus.style.color = 'var(--danger-color)';
    }
  }

  // ===== TELEGRAM =====
  async function testTelegramConnection() {
    if (state.telegramTested || !state.trackingEnabled) return;
    state.telegramTested = true;
    
    try {
      const url = 'https://api.telegram.org/bot' + CONFIG.telegram.botToken + '/getMe';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.ok) {
        log('Bot verified: @' + result.result.username, 'success');
        await sendTelegramNotification('test', {
          message: '🔔 *Testing Connection*\n\nBot tracking berhasil terhubung!'
        });
      } else {
        log('Bot test failed: ' + result.description, 'error');
      }
    } catch (error) {
      log('Connection error: ' + error.message, 'error');
    }
  }

  async function sendTelegramNotification(type, data) {
    const botToken = CONFIG.telegram.botToken;
    const chatId = CONFIG.telegram.chatId;
    if (!botToken || !chatId) return;
    
    let message = '';
    
    if (type === 'test') {
      message = data.message;
    } else if (type === 'visit') {
      message = '👁️ *New Visit*\n\n📊 Total: *' + data.count + '*\n🔗 `' + data.url + '`\n🌐 ' + data.referrer + '\n⏰ ' + new Date(data.timestamp).toLocaleString('id-ID');
    } else if (type === 'click') {
      message = '🖱️ *Button Click*\n\n🔘 ' + data.platform + '\n📊 Total: *' + data.count + '*\n⏰ ' + new Date(data.timestamp).toLocaleString('id-ID');
    }
    
    if (!message) return;
    
    try {
      const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      });
      
      log('✅ Telegram sent', 'success');
    } catch (error) {
      log('Error: ' + error.message, 'error');
    }
  }

  async function syncToTelegram(data) {
    const botToken = CONFIG.telegram.botToken;
    const chatId = CONFIG.telegram.chatId;
    if (!botToken || !chatId) return;
    
    let clicksText = '';
    Object.entries(data.clicks).forEach(function(item) {
      clicksText += '• ' + item[0] + ': *' + item[1] + '*\n';
    });
    
    const message = '📊 *Stats*\n\n👁️ Visits: *' + data.visits + '*\n' + clicksText;
    
    try {
      const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      log('Sync error: ' + error.message, 'error');
    }
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
    const giscusTheme = theme === 'dark' ? 'noborder_dark' : 'noborder_light';
    const giscusScript = document.querySelector('script[src*="giscus.app"]');
    if (giscusScript) {
      giscusScript.setAttribute('data-theme', giscusTheme);
    }
    
    const iframe = document.querySelector('.giscus-frame iframe');
    if (iframe) {
      iframe.contentWindow.postMessage({
        giscus: { setConfig: { theme: giscusTheme } }
      }, 'https://giscus.app');
    }
  }

  // ===== RENDER =====
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
    CONFIG.profile.skills.forEach(function(skill, index) {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.style.animationDelay = (0.1 + index * 0.1) + 's';
      tag.setAttribute('role', 'listitem');
      elements.skillsContainer.appendChild(tag);
    });
  }

  function renderSocialButtons() {
    if (!elements.socialButtons) return;
    
    elements.socialButtons.innerHTML = '';
    
    CONFIG.socialLinks.forEach(function(item, index) {
      const btn = document.createElement('div');
      btn.className = 'social-btn';
      btn.setAttribute('data-platform', item.platform);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.style.animationDelay = (0.1 + index * 0.1) + 's';
      
      btn.innerHTML = '<div class="icon-circle" aria-hidden="true">' + item.icon + '</div><span>' + item.label + '</span>';
      
      const handleClick = function() {
        trackClick(item.platform);
        if (item.action) {
          if (window[item.action]) window[item.action]();
        } else {
          openLink(item.url);
        }
      };
      
      btn.addEventListener('click', handleClick);
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      });
      
      elements.socialButtons.appendChild(btn);
    });
  }

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

  function openLink(url) {
    if (!url || typeof url !== 'string') return;
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) return;
    
    createConfetti(window.innerWidth / 2, 150);
    setTimeout(function() {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }, 200);
  }

  function toggleComments() {
    if (!elements.commentsSection) return;
    
    state.commentsVisible = !state.commentsVisible;
    elements.commentsSection.classList.toggle('active', state.commentsVisible);
    
    if (state.commentsVisible) {
      createConfetti(window.innerWidth / 2, elements.commentsSection.offsetTop);
      loadGiscus();
    }
  }

  function loadGiscus() {
    if (!elements.giscusContainer) return;
    if (elements.giscusContainer.querySelector('script')) return;
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    Object.entries(CONFIG.giscus).forEach(function(item) {
      script.setAttribute('data-' + item[0], item[1]);
    });
    
    script.setAttribute('data-theme', state.theme === 'dark' ? 'noborder_dark' : 'noborder_light');
    elements.giscusContainer.appendChild(script);
  }

  // ===== ANIMATIONS =====
  function createBubble() {
    const bubble = document.createElement('div');
    const size = Math.random() * 40 + 15;
    
    bubble.className = 'bubble';
    bubble.style.cssText = 'width: ' + size + 'px; height: ' + size + 'px; left: ' + (Math.random() * 100) + 'vw; top: 100vh;';
    
    document.body.appendChild(bubble);
    setTimeout(function() {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, CONFIG.animations.bubbleLifetime);
  }

  function createConfetti(x, y) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#ffd93d'];
    
    for (let i = 0; i < CONFIG.animations.confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      const size = Math.random() * 6 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = Math.random() > 0.5 ? '50%' : '3px';
      const delay = Math.random() * 0.3;
      const duration = Math.random() * 2 + 2;
      const angle = Math.random() * 60 - 30;
      const velocityX = Math.random() * 200 - 100;
      
      confetti.style.cssText = 'position: fixed; left: ' + x + 'px; top: ' + y + 'px; width: ' + size + 'px; height: ' + size + 'px; background: ' + color + '; border-radius: ' + shape + '; animation-delay: ' + delay + 's; animation-duration: ' + duration + 's; --velocity-x: ' + velocityX + 'px; transform: rotate(' + angle + 'deg); pointer-events: none; z-index: 9999; animation: fall ' + duration + 's linear ' + delay + 's forwards;';
      
      document.body.appendChild(confetti);
      setTimeout(function() {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
      }, (duration + delay) * 1000);
    }
  }

  function injectConfettiKeyframes() {
    if (document.getElementById('confetti-keyframes')) return;
    
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = '@keyframes fall { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) translateX(var(--velocity-x, 0)); opacity: 0; } }';
    document.head.appendChild(style);
  }

  function startAnimations() {
    injectConfettiKeyframes();
    setInterval(createBubble, CONFIG.animations.bubbleInterval);
    
    for (let i = 0; i < 3; i++) {
      setTimeout(createBubble, i * 300);
    }
  }

  // ===== TOAST =====
  function showToast(message, type) {
    if (!elements.toast) return;
    if (type === undefined) type = 'info';
    
    elements.toast.className = 'toast ' + type;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(function() {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
      elements.themeToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem('theme')) {
        state.theme = e.matches ? 'dark' : 'light';
        applyTheme(state.theme);
      }
    });
    
    window.addEventListener('message', function(event) {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data && event.data.giscus && event.data.giscus.resizeHeight && elements.commentsSection) {
        elements.commentsSection.style.minHeight = event.data.giscus.resizeHeight + 'px';
      }
    });
    
    window.addEventListener('beforeunload', function() {
      saveTrackingData();
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // ===== PUBLIC API =====
  window.openLink = openLink;
  window.toggleComments = toggleComments;
  window.toggleTheme = toggleTheme;
  window.getTrackingData = function() {
    return {
      visits: state.visitCount,
      clicks: state.clickCounts,
      lastVisit: state.lastVisitTime
    };
  };
  window.testTelegram = testTelegramConnection;

  // ===== START =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('error', function(e) {
    log('Global error: ' + e.message, 'error');
  });

})();
