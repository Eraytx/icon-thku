// ==========================================================================
// iCON - THKÜ Digital Hub
// Core Logic, Interactivity & Ambient Effects
// ==========================================================================

// Google Apps Script Web App Endpoint for Google Sheets / Excel Sync
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTuiAuS46e46nGb1y8ZT3Foevaod6WmoBBcLMls6NG_uvbqROfFCDC7raWNIUEZcna/exec"; 

// Google E-Tablo Bağlantısı (Yedek & Referans)
const GOOGLE_SHEET_VIEW_URL = "https://docs.google.com/spreadsheets/d/1HgIk1uXtuNLqN99XEvV5co7pvmG39xAxlgWuk8cc4DM/edit?usp=sharing";

// Resmi WhatsApp Grup Bağlantısı
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Ds0PxK28sAcKc9b2IG0fw3";

document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initForm();
  initAmbientCanvas();
  initCardTiltEffect();
  initGroupLinks();
});

/* --------------------------------------------------------------------------
   0. Link Configurations
   -------------------------------------------------------------------------- */
function initGroupLinks() {
  const wpMain = document.getElementById('wpMainLink');
  const wpJoin = document.getElementById('wpJoinCard');
  if (wpMain) wpMain.href = WHATSAPP_GROUP_LINK;
  if (wpJoin) wpJoin.href = WHATSAPP_GROUP_LINK;
}

/* --------------------------------------------------------------------------
   1. Modal System
   -------------------------------------------------------------------------- */
function initModals() {
  const cards = document.querySelectorAll('.glass-card[data-modal]');
  const closeBtns = document.querySelectorAll('.modal-close');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const modalId = card.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        openModal(targetModal);
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = btn.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });
}

function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  playClickSound(520);
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  playClickSound(380);
}

/* --------------------------------------------------------------------------
   2. Interactive Form Submission & Google Sheets (Apps Script) Sync
   -------------------------------------------------------------------------- */
function initForm() {
  const form = document.getElementById('join-form');
  const successBox = document.getElementById('join-success');
  const resetBtn = successBox?.querySelector('.reset-form-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const applicationData = {
      fullName: document.getElementById('fullName').value.trim(),
      studentId: document.getElementById('studentId').value.trim(),
      department: document.getElementById('department').value,
      email: document.getElementById('email').value.trim(),
      motivation: document.getElementById('motivation').value.trim(),
      timestamp: new Date().toISOString()
    };

    // 1. Tarayıcı yerel yedeğine kaydet
    const saved = JSON.parse(localStorage.getItem('icon_applications') || '[]');
    saved.push(applicationData);
    localStorage.setItem('icon_applications', JSON.stringify(saved));

    // 2. Google Apps Script / Google Sheets (Excel) API'sine otomatik aktar
    if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL.trim().startsWith('http')) {
      try {
        fetch(GOOGLE_APPS_SCRIPT_URL.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(applicationData)
        }).then(() => {
          console.log('Başvuru Google E-Tabloya başarıyla iletildi.');
        }).catch(err => {
          console.warn('Google Sheets senkronizasyon uyarısı:', err);
        });
      } catch (err) {
        console.warn('Apps Script isteği başlatılamadı:', err);
      }
    }

    // Başarı ses efekti çal
    playSuccessSound();

    // Başarı ekranına geç
    form.classList.add('hidden');
    successBox.classList.remove('hidden');
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.classList.remove('hidden');
      successBox.classList.add('hidden');
    });
  }
}

/* --------------------------------------------------------------------------
   4. Ambient Canvas Particles (Desktop Only - Disabled on Mobile for 60fps)
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  // Telefondaki kasılmaları önlemek için mobilde canvas animasyonunu tamamen devre dışı bırak
  if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      canvas.style.display = 'none';
      return;
    }
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 35; // Performans için optimize edildi

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.65,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      speedY: -(Math.random() * 0.12 + 0.04),
      speedX: (Math.random() - 0.5) * 0.08,
      pulse: Math.random() * 0.02 + 0.01,
      pulseDir: 1
    });
  }

  function animate() {
    if (window.innerWidth <= 768) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speedY;
      p.x += p.speedX;

      p.alpha += p.pulse * p.pulseDir;
      if (p.alpha >= 0.8) {
        p.alpha = 0.8;
        p.pulseDir = -1;
      } else if (p.alpha <= 0.15) {
        p.alpha = 0.15;
        p.pulseDir = 1;
      }

      if (p.y < 0) {
        p.y = height * 0.65;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 220, 255, ${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   5. Lightweight UI Audio Feedback
   -------------------------------------------------------------------------- */
let audioCtx = null;

function playClickSound(freq = 440) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch (e) {}
}

function playSuccessSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.05, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   6. Card Tilt Effect (Masaüstü için - Mobilde Pil & FPS Koruma)
   -------------------------------------------------------------------------- */
function initCardTiltEffect() {
  // Dokunmatik ve mobil ekranlarda tilt hesaplamalarını çalıştırma
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768) {
    return;
  }

  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
