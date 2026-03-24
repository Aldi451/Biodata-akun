/**
 * PROFILE PAGE - FINAL VERSION
 * Rifaldi Hidayat - Personal Portfolio
 * Tracking: Hanya ke Telegram (tidak ditampilkan di web) 
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
      toast: document.getElementById('toast')
    };
  }

  // ===== LOGGING =====
  function log(message, level) {
    if (!CONFIG.telegram.debug) return;
    if (level === undefined) level = 'info';
    var prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
    console.log((prefix[level] || 'ℹ️') + ' [Tracking] ' + message);
  }

  // ===== TRACKING =====
  function initializeTracking() {
    if (!CONFIG.telegram.enabled) {
      state.trackingEnabled = false;
      return;
    }
    
    if (!CONFIG.telegram.botToken || CONFIG.telegram.botToken.includes('YOUR_BOT_TOKEN')) {
      state.trackingEnabled = 'local';
      return;
    }
    
    if (!/^\d+$/.test(CONFIG.telegram.chatId)) {
      state.trackingEnabled = false;
      return;
    }
    
    state.trackingEnabled = true;
    loadTrackingData();
    
    if (CONFIG.telegram.trackVisits) {
      trackVisit();
    }
    
    for (var i = 0; i < CONFIG.socialLinks.length; i++) {
      var link = CONFIG.socialLinks[i];
      if (!state.clickCounts[link.platform]) {
        state.clickCounts[link.platform] = 0;
      }
    }
  }

  function loadTrackingData() {
    var saved = localStorage.getItem('profileTracking');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        state.visitCount = data.visits || 0;
        state.clickCounts = data.clicks || {};
        state.lastVisitTime = data.lastVisit || null;
      } catch (e) {
        log('Error loading  ' + e.message, 'error');
      }
    }
  }

  function saveTrackingData() {
    var data = {
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
    var now = Date.now();
    var lastVisit = state.lastVisitTime;
    var isNewSession = !lastVisit || (now - lastVisit > 30 * 60 * 1000);
    
    if (isNewSession) {
      state.visitCount++;
      state.lastVisitTime = now;
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

  // ===== TELEGRAM =====
  async function testTelegramConnection() {
    if (state.telegramTested || !state.trackingEnabled) return;
    state.telegramTested = true;
    
    try {
      var url = 'https://api.telegram.org/bot' + CONFIG.telegram.botToken + '/getMe';
      var response = await fetch(url);
      var result = await response.json();
      
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
    var botToken = CONFIG.telegram.botToken;
    var chatId = CONFIG.telegram.chatId;
    if (!botToken || !chatId) return;
    
    var message = '';
    
    if (type === 'test') {
      message = data.message;
    } else if (type === 'visit') {
      message = '👁️ *New Visit*\n\n📊 Total: *' + data.count + '*\n🔗 `' + data.url + '`\n🌐 ' + data.referrer + '\n⏰ ' + new Date(data.timestamp).toLocaleString('id-ID');
    } else if (type === 'click') {
      message = '🖱️ *Button Click*\n\n🔘 *' + data.platform + '*\n📊 Total Clicks: *' + data.count + '*\n🔗 `' + data.url + '`\n⏰ ' + new Date(data.timestamp).toLocaleString('id-ID');
    } else if (type === 'sync') {
      var clicksText = '';
      for (var key in data.clicks) {
        clicksText += '• ' + key + ': *' + data.clicks[key] + '*\n';
      }
      message = '📊 *Stats Summary*\n\n👁️ Total Visits: *' + data.visits + '*\n\n🖱️ Clicks:\n' + clicksText + '\n⏰ Updated: ' + new Date(data.lastUpdated).toLocaleString('id-ID');
    }
    
    if (!message) return;
    
    try {
      var sendUrl = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
      
      await fetch(sendUrl, {
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
    var botToken = CONFIG.telegram.botToken;
    var chatId = CONFIG.telegram.chatId;
    if (!botToken || !chatId) return;
    
    try {
      var url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: data,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      log('Sync error: ' + error.message, 'error');
    }
  }

  // ===== THEME =====
  function loadTheme() {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    var giscusTheme = theme === 'dark' ? 'noborder_dark' : 'noborder_light';
    var giscusScript = document.querySelector('script[src*="giscus.app"]');
    if (giscusScript) {
      giscusScript.setAttribute('data-theme', giscusTheme);
    }
    
    var iframe = document.querySelector('.giscus-frame iframe');
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
    for (var i = 0; i < CONFIG.profile.skills.length; i++) {
      var skill = CONFIG.profile.skills[i];
      var tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.style.animationDelay = (0.1 + i * 0.1) + 's';
      tag.setAttribute('role', 'listitem');
      elements.skillsContainer.appendChild(tag);
    }
  }

  function renderSocialButtons() {
    if (!elements.socialButtons) return;
    
    elements.socialButtons.innerHTML = '';
    
    for (var i = 0; i < CONFIG.socialLinks.length; i++) {
      var item = CONFIG.socialLinks[i];
      var btn = document.createElement('div');
      btn.className = 'social-btn';
      btn.setAttribute('data-platform', item.platform);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.style.animationDelay = (0.1 + i * 0.1) + 's';
      
      btn.innerHTML = '<div class="icon-circle" aria-hidden="true">' + item.icon + '</div><span>' + item.label + '</span>';
      
      var handleClick = function(platform, action, url) {
        return function() {
          trackClick(platform);
          if (action) {
            if (window[action]) window[action]();
          } else {
            openLink(url);
          }
        };
      };
      
      btn.addEventListener('click', handleClick(item.platform, item.action, item.url));
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(item.platform, item.action, item.url)();
        }
      });
      
      elements.socialButtons.appendChild(btn);
    }
  }

  function startTypewriter() {
    if (!elements.typewriter) return;
    
    var text = CONFIG.profile.name;
    var index = 0;
    
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
    var cleanUrl = url.trim();
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
    
    var script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    for (var key in CONFIG.giscus) {
      script.setAttribute('data-' + key, CONFIG.giscus[key]);
    }
    
    script.setAttribute('data-theme', state.theme === 'dark' ? 'noborder_dark' : 'noborder_light');
    elements.giscusContainer.appendChild(script);
  }

  // ===== ANIMATIONS =====
  function createBubble() {
    var bubble = document.createElement('div');
    var size = Math.random() * 40 + 15;
    
    bubble.className = 'bubble';
    bubble.style.cssText = 'width: ' + size + 'px; height: ' + size + 'px; left: ' + (Math.random() * 100) + 'vw; top: 100vh;';
    
    document.body.appendChild(bubble);
    setTimeout(function() {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, CONFIG.animations.bubbleLifetime);
  }

  function createConfetti(x, y) {
    var colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#ffd93d'];
    
    for (var i = 0; i < CONFIG.animations.confettiCount; i++) {
      var confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      var size = Math.random() * 6 + 3;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var shape = Math.random() > 0.5 ? '50%' : '3px';
      var delay = Math.random() * 0.3;
      var duration = Math.random() * 2 + 2;
      var angle = Math.random() * 60 - 30;
      var velocityX = Math.random() * 200 - 100;
      
      confetti.style.cssText = 'position: fixed; left: ' + x + 'px; top: ' + y + 'px; width: ' + size + 'px; height: ' + size + 'px; background: ' + color + '; border-radius: ' + shape + '; animation-delay: ' + delay + 's; animation-duration: ' + duration + 's; --velocity-x: ' + velocityX + 'px; transform: rotate(' + angle + 'deg); pointer-events: none; z-index: 9999; animation: fall ' + duration + 's linear ' + delay + 's forwards;';
      
      document.body.appendChild(confetti);
      setTimeout(function() {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
      }, (duration + delay) * 1000);
    }
  }

  function injectConfettiKeyframes() {
    if (document.getElementById('confetti-keyframes')) return;
    
    var style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = '@keyframes fall { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) translateX(var(--velocity-x, 0)); opacity: 0; } }';
    document.head.appendChild(style);
  }

  function startAnimations() {
    injectConfettiKeyframes();
    setInterval(createBubble, CONFIG.animations.bubbleInterval);
    
    for (var i = 0; i < 3; i++) {
      setTimeout(createBubble, i * 300);
    }
