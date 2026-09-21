// ==========================================================================
// iCON - THKÜ Digital Hub
// Core Logic, Interactivity & Ambient Effects
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initForm();
  initCountdown();
  initAmbientCanvas();
  initAudioAmbience();
  initViewModeToggle();
  initCardTiltEffect();
});

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
   2. Interactive Form Submission
   -------------------------------------------------------------------------- */
function initForm() {
  const form = document.getElementById('join-form');
  const successBox = document.getElementById('join-success');
  const resetBtn = successBox?.querySelector('.reset-form-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const applicationData = {
      fullName: document.getElementById('fullName').value,
      studentId: document.getElementById('studentId').value,
      department: document.getElementById('department').value,
      email: document.getElementById('email').value,
      teamInterest: document.getElementById('teamInterest').value,
      motivation: document.getElementById('motivation').value,
      timestamp: new Date().toISOString()
    };

    // Save locally
    const saved = JSON.parse(localStorage.getItem('icon_applications') || '[]');
    saved.push(applicationData);
    localStorage.setItem('icon_applications', JSON.stringify(saved));

    // Play chime sound
    playSuccessSound();

    // Show success view
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
   3. Live Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  if (!daysEl) return;

  // Target date: May 14, 2026
  const targetDate = new Date('2026-05-14T09:30:00+03:00').getTime();

  function update() {
    const now = new Date().getTime();
    let diff = targetDate - now;

    if (diff < 0) {
      diff = 1000 * 60 * 60 * 24 * 30; // fallback rolling 30 days
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   4. Ambient Canvas Particles (Night sky stars & subtle floating dust)
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width < 768 ? 35 : 65, 80);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.65, // upper sky focus
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speedY: -(Math.random() * 0.15 + 0.05),
      speedX: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * 0.03 + 0.01,
      pulseDir: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;

      p.alpha += p.pulse * p.pulseDir;
      if (p.alpha >= 0.85) {
        p.alpha = 0.85;
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
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   5. Web Audio Ambient Drone & UI Feedback (Zero external audio assets)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let ambientGain = null;
let isAudioPlaying = false;

function initAudioAmbience() {
  const soundBtn = document.getElementById('sound-toggle');
  const onIcon = soundBtn?.querySelector('.sound-icon-on');
  const offIcon = soundBtn?.querySelector('.sound-icon-off');

  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startAmbientCabinDrone();
      isAudioPlaying = true;
      onIcon.classList.remove('hidden');
      offIcon.classList.add('hidden');
      soundBtn.style.borderColor = '#38bdf8';
    } else {
      stopAmbientCabinDrone();
      isAudioPlaying = false;
      onIcon.classList.add('hidden');
      offIcon.classList.remove('hidden');
      soundBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    }
  });
}

function startAmbientCabinDrone() {
  if (!audioCtx) return;

  // White noise node for gentle wind/cabin airflow
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Bandpass filter for soothing jet airliner cabin hum
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 180;

  ambientGain = audioCtx.createGain();
  ambientGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  ambientGain.gain.exponentialRampToValueAtTime(0.09, audioCtx.currentTime + 2);

  whiteNoise.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(audioCtx.destination);

  whiteNoise.start();
  window._activeAmbientSource = whiteNoise;
}

function stopAmbientCabinDrone() {
  if (ambientGain && audioCtx) {
    ambientGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    setTimeout(() => {
      if (window._activeAmbientSource) {
        window._activeAmbientSource.stop();
        window._activeAmbientSource = null;
      }
    }, 1000);
  }
}

function playClickSound(freq = 440) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
}

function playSuccessSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  try {
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.06, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.35);
    });
  } catch (e) {}
}

/* --------------------------------------------------------------------------
   6. View Mode Toggle (Mobile / Wide Layout)
   -------------------------------------------------------------------------- */
function initViewModeToggle() {
  const toggleBtn = document.getElementById('view-mode-toggle');
  const label = document.getElementById('view-mode-label');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('mobile-preview');
    const isMobilePreview = document.body.classList.contains('mobile-preview');
    label.textContent = isMobilePreview ? 'Geniş Ekran' : 'Mobil Odak';
    playClickSound(480);
  });
}

/* --------------------------------------------------------------------------
   7. Card Subtle 3D Tilt Effect
   -------------------------------------------------------------------------- */
function initCardTiltEffect() {
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
