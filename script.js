/**
 * PROFILE PAGE - SCRIPT.JS
 * Rifaldi Hidayat - Personal Portfolio
 * Fitur: Theme Toggle, Typewriter, Bubbles, Confetti, Telegram Bot Tracking
 * 
 * ⚠️ PENTING: Pastikan bot token dan chat ID sudah benar!
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
    
    // Data media sosial (URL sudah dibersihkan dari spasi)
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
    
    // ===== TELEGRAM BOT CONFIGURATION =====
    telegram: {
      // Bot token dari @BotFather
      botToken: "7065072791:AAE2MV1D0yBVJmOETL8Q0k5ZPpWcCHy_GEA",
      
      // Chat ID numerik (dari @userinfobot atau getUpdates)
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
      apiDebounce: 1000,
      
      // Debug mode - tampilkan log detail
      debug: true
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
    trackingEnabled: false,
    telegramTested: false
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
    
    // Test Telegram connection after short delay
    setTimeout(testTelegramConnection, 2000);
    
    state.initialized = true;
    log('✅ Profile page initialized with tracking');
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

  // ===== LOGGING HELPER =====
  function log(message, level = 'info') {
    if (!CONFIG.telegram.debug) return;
    
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    };
    
    console.log(`${prefix[level] || 'ℹ️'} [Tracking] ${message}`);
  }

  // ===== TRACKING SYSTEM =====
  function initializeTracking() {
    log('Initializing tracking system...');
    
    // Cek apakah tracking diaktifkan
    if (!CONFIG.telegram.enabled) {
      log('Tracking disabled in config', 'warn');
      updateTrackingStatus(false);
      return;
    }
    
    // Validasi konfigurasi Telegram
    if (!CONFIG.telegram.botToken || !CONFIG.telegram.chatId ||
        CONFIG.telegram.botToken.includes('YOUR_BOT_TOKEN') || 
        CONFIG.telegram.chatId.includes('YOUR_CHAT_ID')) {
      log('Telegram bot not configured. Using local storage only.', 'warn');
      updateTrackingStatus(false, 'local');
      state.trackingEnabled = 'local';
      return;
    }
    
    // Validasi Chat ID harus numerik
    if (!/^\d+$/.test(CONFIG.telegram.chatId)) {
      log(`Invalid Chat ID format: "${CONFIG.telegram.chatId}". Must be numeric!`, 'error');
      updateTrackingStatus(false, 'invalid');
      state.trackingEnabled = false;
      showToast('⚠️ Chat ID harus berupa angka!', 'warning');
      return;
    }
    
    state.trackingEnabled = true;
    updateTrackingStatus(true);
    log('Telegram tracking enabled ✓');
    
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

  // ===== TELEGRAM CONNECTION TEST =====
  async function testTelegramConnection() {
    if (state.telegramTested || !state.trackingEnabled) return;
    
    state.telegramTested = true;
    
    const { botToken, chatId } = CONFIG.telegram;
    
    try {
      // Test dengan getMe untuk verifikasi token
      const testUrl = `https://api.telegram.org/bot${botToken}/getMe`;
      const response = await fetch(testUrl);
      const result = await response.json();
      
      if (result.ok) {
        log(`Bot verified: @${result.result.username}`, 'success');
        
        // Test send message
        await sendTelegramNotification('test', {
          message: '🔔 *Testing Connection*\n\nBot tracking Anda berhasil terhubung!'
        });
      } else {
        log(`Bot test failed: ${result.description}`, 'error');
        showToast('❌ Bot token tidak valid', 'error');
      }
    } catch (error) {
      log(`Connection test error: ${error.message}`, 'error');
      
      // Cek kemungkinan CORS issue
      if (error.message.includes('Failed to fetch')) {
        log('💡 Kemungkinan CORS issue. Telegram API mungkin memblokir request dari browser.', 'warn');
        log('💡 Solusi: Gunakan backend proxy atau hosting dengan CORS enabled.', 'warn');
      }
      
      showToast('⚠️ Gagal koneksi ke Telegram', 'warning');
    }
  }

  function loadTrackingData() {
    const savedData = localStorage.getItem('profileTracking');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        state.visitCount = data.visits || 0;
        state.clickCounts = data.clicks || {};
        state.lastVisitTime = data.lastVisit || null;
        log(`Loaded tracking  ${state.visitCount} visits`, 'info');
      } catch (e) {
        log(`Error loading tracking data: ${e.message}`, 'error');
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
    
    // Sync to Telegram if enabled
    if (state.trackingEnabled === true) {
      syncToTelegram(data);
    }
  }

  function trackVisit() {
    const now = Date.now();
    const lastVisit = state.lastVisitTime;
    // Session timeout: 30 minutes
    const isNewSession = !lastVisit || (now - lastVisit > 30 * 60 * 1000);
    
    if (isNewSession) {
      state.visitCount++;
      state.lastVisitTime = now;
      
      updateVisitCounter();
      saveTrackingData();
      
      if (CONFIG.telegram.sendNotification && state.trackingEnabled === true) {
        sendTelegramNotification('visit', {
          count: state.visitCount,
          timestamp: now,
          url: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        });
      }
      
      log(`👁️ New visit tracked: #${state.visitCount}`);
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
    
    if (CONFIG.telegram.sendNotification && state.trackingEnabled === true) {
      sendTelegramNotification('click', {
        platform: platform,
        count: state.clickCounts[platform],
        timestamp: Date.now(),
        url: window.location.href
      });
    }
    
    log(`🖱️ Click tracked: ${platform} (${state.clickCounts[platform]})`);
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
    
    const increment = Math.ceil((target - current) / 20);
    element.textContent = current + increment;
    
    if (current + increment < target) {
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
      const labelSpan = btn.querySelector('span');
      if (labelSpan) labelSpan.appendChild(badge);
    }
    
    badge.textContent = count;
    
    // Trigger reflow for animation
    badge.style.animation = 'none';
    void badge.offsetHeight;
    badge.style.animation = 'popIn 0.3s ease';
  }

  function updateTrackingStatus(enabled, type = 'telegram') {
    if (!elements.trackingStatus) return;
    
    if (enabled === true) {
      elements.trackingStatus.textContent = '🟢 Telegram Active';
      elements.trackingStatus.style.color = 'var(--success-color, #4CAF50)';
      elements.trackingStatus.style.background = 'rgba(76, 175, 80, 0.2)';
    } else if (type === 'local') {
      elements.trackingStatus.textContent = '🟡 Local Only';
      elements.trackingStatus.style.color = 'var(--warning-color, #ff9800)';
      elements.trackingStatus.style.background = 'rgba(255, 152, 0, 0.2)';
    } else if (type === 'invalid') {
      elements.trackingStatus.textContent = '🔴 Invalid Config';
      elements.trackingStatus.style.color = 'var(--danger-color, #f44336)';
      elements.trackingStatus.style.background = 'rgba(244, 67, 54, 0.2)';
    } else {
      elements.trackingStatus.textContent = '🔴 Disabled';
      elements.trackingStatus.style.color = 'var(--danger-color, #f44336)';
      elements.trackingStatus.style.background = 'rgba(244, 67, 54, 0.2)';
    }
  }

  // ===== TELEGRAM API =====
  async function sendTelegramNotification(type, data) {
    const { botToken, chatId } = CONFIG.telegram;
    
    if (!botToken || !chatId) {
      log('Missing bot token or chat ID', 'error');
      return;
    }
    
    // Build message based on type
    let message = '';
    
    if (type === 'test') {
      message = data.message;
    } else if (type === 'visit') {
      message = `👁️ *New Website Visit*

📊 Total Visits: *${data.count}*
🔗 URL: \`${data.url}\`
📱 Device: ${getDeviceType()}
🌐 Referrer: ${data.referrer}
⏰ Time: ${new Date(data.timestamp).toLocaleString('id-ID')}`;
    } else if (type === 'click') {
      message = `🖱️ *Button Click*

🔘 Platform: *${data.platform}*
📊 Total Clicks: *${data.count}*
🔗 URL: \`${data.url}\`
⏰ Time: ${new Date(data.timestamp).toLocaleString('id-ID')}`;
    }
    
    if (!message) return;
    
    try {
      // ✅ URL TANPA SPASI - ini perbaikan utama!
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      log(`Sending to Telegram: ${type}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,  // Chat ID sebagai string angka
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        log('✅ Telegram notification sent successfully', 'success');
      } else {
        log(`❌ Telegram API error: ${result.description || JSON.stringify(result)}`, 'error');
        showToast(`❌ Gagal: ${result.description || 'Unknown error'}`, 'error');
      }
      
      return result;
      
    } catch (error) {
      log(`❌ Error sending Telegram notification: ${error.message}`, 'error');
      
      // Debug CORS issues
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        log('💡 Possible CORS issue. Try:');
        log('   1. Use HTTPS hosting (not file://)');
        log('   2. Add backend proxy for Telegram API');
        log('   3. Check if adblocker is blocking the request');
      }
      
      showToast('⚠️ Offline mode - data saved locally', 'warning');
      
      // Return error for debugging
      return { ok: false, error: error.message };
    }
  }

  async function syncToTelegram(data) {
    const { botToken, chatId } = CONFIG.telegram;
    
    if (!botToken || !chatId) return;
    
    const message = `📊 *Stats Sync*

👁️ Total Visits: *${data.visits}*
🖱️ Clicks:
${Object.entries(data.clicks).map(([platform, count]) => 
  `   • ${platform}: *${count}*`
).join('\n')}

⏰ Updated: ${new Date(data.lastUpdated).toLocaleString('id-ID')}`;
    
    try {
      // ✅ URL TANPA SPASI
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
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
      log(`Sync error: ${error.message}`, 'error');
    }
  }

  function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/tablet|ipad|playbook|silk/i.test(ua)) return '📱 Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return '📱 Mobile';
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
      // ✅ URL TANPA SPASI
      iframe.contentWindow.postMessage({
        giscus: { setConfig: { theme: giscusTheme } }
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
      
      const handleClick = () => {
        trackClick(item.platform);
        if (item.action) {
          window[item.action]?.();
        } else {
          openLink(item.url);
        }
      };
      
      btn.addEventListener('click', handleClick);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      });
      
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
    // ✅ URL TANPA SPASI
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    Object.entries(CONFIG.giscus).forEach(([key, value]) => {
      script.setAttribute(`data-${key}`, value);
    });
    
    script.setAttribute('data-theme', state.theme === 'dark' ? 'noborder_dark' : 'noborder_light');
    
    elements.giscus
