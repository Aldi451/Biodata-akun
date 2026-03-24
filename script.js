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
      { platform: "facebook", label: "Facebook", icon: "f", url: "https://www.facebook.com/aldy.hidayat.568?_rdr" },
      { platform: "instagram", label: "Instagram", icon: "📷", url: "https://www.instagram.com/hidayat_rifaldi" },
      { platform: "twitter", label: "Twitter / X", icon: "𝕏", url: "https://x.com/RifaldiHidaya15" },
      { platform: "comment", label: "Comment Columns", icon: "💬", action: "toggleComments" }
    ],
    
    giscus: {
      repo: "Aldi451/Biodata-akun",
      repoId: "R_kgDORc6sAA",
      category: "General",
      categoryId: "DIC_kwDORc6sAM4C3kFi",
      mapping: "pathname",
      strict: "0",
      reactionsEnabled: "1",
      emitMeta: "0", // ✅ diperbaiki
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
  function log(message, level = 'info') {
    if (!CONFIG.telegram.debug) return;
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
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
    
    CONFIG.socialLinks.forEach(link => {
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
        log('Error loading ' + e.message, 'error');
      }
    }
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

  // ===== TELEGRAM =====
  async function testTelegramConnection() {
    if (state.telegramTested || !state.trackingEnabled) return;
    state.telegramTested = true;
    
    try {
      const url = `https://api.telegram.org/bot${CONFIG.telegram.botToken}/getMe`;
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
      message = `👁️ *New Visit*\n\n📊 Total: *${data.count}*\n🔗 \`${data.url}\`\n🌐 ${data.referrer}\n⏰ ${new Date(data.timestamp).toLocaleString('id-ID')}`;
    } else if (type === 'click') {
      message = `🖱️ *Button Click*\n\n🔘 *${data.platform}*\n📊 Total Clicks: *${data.count}*\n🔗 \`${data.url}\`\n⏰ ${new Date(data.timestamp).toLocaleString('id-ID')}`;
    } else if (type === 'sync') {
      let clicksText = '';
      for (const key in data.clicks) {
        clicksText += `• ${key}: *${data.clicks[key]}*\n`;
      }
      message = `📊 *Stats Summary*\n\n👁️ Total Visits: *${data.visits}*\n\n🖱️ Clicks:\n${clicksText}\n⏰ Updated: ${new Date(data.lastUpdated).toLocaleString('id-ID')}`;
    }
    
    if (!message) return;
    
    try {
      const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
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
    await sendTelegramNotification('sync', data);
  }

  // ===== START =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('error', e => {
    log('Global error: ' + e.message, 'error');
  });

})();
