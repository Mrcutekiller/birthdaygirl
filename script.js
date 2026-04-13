/* =========================================
   NUHAMIN'S BIRTHDAY — JAVASCRIPT
   Interactive magic, animations, confetti
   ========================================= */

/* ============================================================
   STATE
   ============================================================ */
let currentSection = 'home';
let currentQuote = 0;
const totalQuotes = 5;
let confettiActive = false;
let heartInterval = null;

/* ============================================================
   LANDING → ENTRANCE
   ============================================================ */
function enterSite() {
  const landing  = document.getElementById('landing');
  const mainApp  = document.getElementById('mainApp');
  const btn      = document.getElementById('btnEnter');

  // Disable button & give tactile feedback
  btn.disabled = true;
  btn.style.transform = 'scale(0.96)';
  btn.style.opacity   = '0.85';
  btn.textContent     = 'Opening… 🎀';

  // Short delay so the user sees the button response
  setTimeout(() => {
    // Fade the landing out (CSS handles the keyframe)
    landing.classList.add('fade-out');

    // Halfway through the fade, reveal the main app underneath
    setTimeout(() => {
      landing.classList.add('hidden');

      // Start app invisible so we can fade it in
      mainApp.classList.remove('hidden');
      mainApp.style.opacity   = '0';
      mainApp.style.transform = 'scale(0.98)';
      mainApp.style.transition = 'opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)';

      // Trigger reflow so transition fires
      void mainApp.offsetWidth;

      mainApp.style.opacity   = '1';
      mainApp.style.transform = 'scale(1)';

      // Initialise all interactive bits after the app is visible
      setTimeout(() => {
        showSection('home');
        initHearts();
        initStars();
        initCarouselDots();
        startCarouselTimer();
        animateTimelineOnScroll();
      }, 80);

    }, 480); // reveal app at ~halfway through the 900ms landing fade
  }, 180);
}

/* ============================================================
   SECTION NAVIGATION
   ============================================================ */
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Show target
  const target = document.getElementById('section-' + name);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  currentSection = name;

  // Section-specific init
  if (name === 'timeline') {
    setTimeout(animateTimelineItems, 200);
  }

  // Auto-start typewriter when entering letter
  if (name === 'letter') {
    setTimeout(startTypewriter, 400);
  }

  // Init swipe cards on first visit; reset on revisit
  if (name === 'memories') {
    memIdx = 0;
    setTimeout(initMemorySwipe, 200);
  }

  // Init horizontal timeline on visit
  if (name === 'timeline') {
    setTimeout(initHorizontalTimeline, 200);
  }

  // Reset gift box on revisit
  if (name === 'gift') {
    giftOpened = false;
    const box     = document.getElementById('giftBox');
    const lid     = document.getElementById('gbLid');
    const message = document.getElementById('giftMessage');
    const hint    = document.getElementById('gbHint');
    if (box)     { box.classList.remove('shaking'); }
    if (lid)     { lid.classList.remove('open'); }
    if (message) { message.classList.add('hidden'); }
    if (hint)    { hint.classList.remove('hidden'); }
  }

  // Reset candle on revisit
  if (name === 'cake') {
    candleBlown = false;
    const flame = document.getElementById('candleFlame');
    const smoke = document.getElementById('candleSmoke');
    const msg   = document.getElementById('cakeWishMsg');
    const hint  = document.getElementById('candleHint');
    if (flame) { flame.classList.remove('blown'); flame.style.display = ''; }
    if (smoke) { smoke.classList.add('hidden'); }
    if (msg)   { msg.classList.add('hidden'); }
    if (hint)  { hint.textContent = 'Click the flame to blow it out! 🌬️'; }
  }
}

/* ============================================================
   MOBILE HAMBURGER MENU (kept for any future nav use)
   ============================================================ */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (menu && hamburger && !menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ============================================================
   GIFT BOX — SHAKE + OPEN
   ============================================================ */
let giftOpened = false;

function revealGift() {
  if (giftOpened) return;

  const box     = document.getElementById('giftBox');
  const lid     = document.getElementById('gbLid');
  const message = document.getElementById('giftMessage');
  const hint    = document.getElementById('gbHint');
  const sparkles = document.getElementById('giftSparkles');

  if (!box || !lid) return;

  // Phase 1 — shake
  box.classList.add('shaking');
  if (hint) hint.classList.add('hidden');

  setTimeout(() => {
    box.classList.remove('shaking');

    // Phase 2 — lid flies off
    lid.classList.add('open');
    giftOpened = true;

    // Phase 3 — sparkle burst
    spawnGiftSparkles(sparkles);

    // Phase 4 — message appears
    setTimeout(() => {
      if (message) message.classList.remove('hidden');
      launchConfetti(true);
    }, 550);
  }, 580);
}

function spawnGiftSparkles(container) {
  if (!container) return;
  container.innerHTML = '';
  const EMOJIS = ['✨','💖','🌸','⭐','💫','🎀'];
  for (let i = 0; i < 12; i++) {
    const p   = document.createElement('span');
    const ang = (i / 12) * Math.PI * 2;
    const rad = 80 + Math.random() * 50;
    p.className = 'gs-particle';
    p.textContent = EMOJIS[i % EMOJIS.length];
    p.style.cssText = `
      --tx: ${Math.cos(ang) * rad}px;
      --ty: ${Math.sin(ang) * rad - 50}px;
      animation-delay: ${i * 60}ms;
    `;
    container.appendChild(p);
  }
  setTimeout(() => { container.innerHTML = ''; }, 1100);
}

/* ============================================================
   TYPEWRITER LETTER
   ============================================================ */
const LETTER_LINES = [
  { text: 'Hey Nuhamin\u2026 \uD83D\uDC96',    cls: 'tw-greeting' },
  { text: 'I don\u2019t even know where to start\u2026' },
  { text: 'But I\u2019m really glad you exist.' },
  { text: 'Every moment with you feels different\u2026' },
  { text: 'Like something I don\u2019t want to lose.' },
  { text: 'And today\u2026' },
  { text: 'You turn 19.' },
  { text: 'And honestly\u2026' },
  { text: 'I just feel lucky to be part of your life.' },
  { text: 'Happy Birthday, my favorite person \uD83C\uDF82\u2728', cls: 'tw-closing' },
];

const LINE_DELAY   = 700;   // ms between each line appearing
const FIRST_DELAY  = 300;   // delay before very first line

let twTimeout = null;       // holds the pending timeout so we can cancel on replay

function startTypewriter() {
  const body     = document.getElementById('twBody');
  const cursor   = document.getElementById('twCursor');
  const controls = document.getElementById('letterControls');
  const wbCard   = document.getElementById('writebackCard');

  if (!body) return;

  // Wipe previous content
  if (twTimeout) clearTimeout(twTimeout);
  body.innerHTML = '';
  if (cursor)   { cursor.classList.remove('hidden'); }
  if (controls) { controls.classList.add('hidden');  }
  if (wbCard)   { wbCard.classList.add('hidden');    }

  // Reveal each line with a staggered delay
  LETTER_LINES.forEach((line, index) => {
    twTimeout = setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'tw-line' + (line.cls ? ' ' + line.cls : '');
      el.textContent = line.text;
      body.appendChild(el);

      // Scroll card into view smoothly as lines appear
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // After last line — hide cursor, show controls
      if (index === LETTER_LINES.length - 1) {
        setTimeout(() => {
          if (cursor)   cursor.classList.add('hidden');
          if (controls) controls.classList.remove('hidden');
          // Load any previously saved writeback
          loadWriteback();
        }, 500);
      }
    }, FIRST_DELAY + index * LINE_DELAY);
  });
}

/* ============================================================
   WRITE-BACK (localStorage)
   ============================================================ */
const WB_KEY = 'nuhamin_message';

function toggleWriteback() {
  const card = document.getElementById('writebackCard');
  if (!card) return;
  const isHidden = card.classList.toggle('hidden');
  if (!isHidden) {
    // Just opened — load existing message if any
    loadWriteback();
    const input = document.getElementById('wbInput');
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function saveWriteback() {
  const input   = document.getElementById('wbInput');
  const savedMsg = document.getElementById('wbSavedMsg');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  localStorage.setItem(WB_KEY, text);

  // Show confirmation
  if (savedMsg) {
    savedMsg.classList.remove('hidden');
    setTimeout(() => savedMsg.classList.add('hidden'), 3500);
  }

  // Show the saved text in the 'prev' area
  loadWriteback();
}

function loadWriteback() {
  const saved    = localStorage.getItem(WB_KEY);
  const prevWrap = document.getElementById('wbPrev');
  const prevText = document.getElementById('wbPrevText');
  const input    = document.getElementById('wbInput');

  if (saved && saved.length > 0) {
    if (input)    input.value = saved;
    if (prevText) prevText.textContent = saved;
    if (prevWrap) prevWrap.classList.remove('hidden');
  } else {
    if (prevWrap) prevWrap.classList.add('hidden');
  }
}

// Live char counter for the textarea
document.addEventListener('DOMContentLoaded', () => {
  const ta    = document.getElementById('wbInput');
  const count = document.getElementById('wbCount');
  if (ta && count) {
    ta.addEventListener('input', () => {
      count.textContent = ta.value.length;
    });
  }
});

/* ============================================================
   HORIZONTAL AGE TIMELINE
   ============================================================ */
const HTL_MESSAGES = {
   0: { label: 'Age 0',  text: 'The world got a queen 👑' },
   1: { label: 'Age 1',  text: 'First steps, first smile — already magic ✨' },
   2: { label: 'Age 2',  text: 'Curious eyes discovering everything 🌸' },
   3: { label: 'Age 3',  text: 'Little dreamer, big heart 💫' },
   4: { label: 'Age 4',  text: 'Probably already the cutest in every room 🌷' },
   5: { label: 'Age 5',  text: 'Stories, laughter, wonder — all yours 📖' },
   6: { label: 'Age 6',  text: 'The girl who lights rooms up — just beginning ✨' },
   7: { label: 'Age 7',  text: 'Full of questions the world couldn\'t answer yet 🌟' },
   8: { label: 'Age 8',  text: 'Somewhere between wild and wonderful 🌺' },
   9: { label: 'Age 9',  text: 'Growing quietly into something extraordinary 🌸' },
  10: { label: 'Age 10', text: 'A kind heart growing quietly 🌿' },
  11: { label: 'Age 11', text: 'Still figuring things out — beautifully 💕' },
  12: { label: 'Age 12', text: 'The world is lucky you exist 🌍' },
  13: { label: 'Age 13', text: 'Bold and soft all at once 💫' },
  14: { label: 'Age 14', text: 'Every hard day only made you stronger 💪' },
  15: { label: 'Age 15', text: 'Becoming someone special ⭐' },
  16: { label: 'Age 16', text: 'Stepping into your glow, one day at a time ✨' },
  17: { label: 'Age 17', text: 'Confidence, grace, magic — that\'s you 🌟' },
  18: { label: 'Age 18', text: 'I got lucky to have you ❤️' },
  19: { label: 'Age 19', text: 'Nuhamin at her most beautiful ✨' },
};

let htlInited = false;

function initHorizontalTimeline() {
  const track = document.getElementById('htlTrack');
  if (!track) return;

  // Only rebuild if needed
  track.innerHTML = '';
  htlInited = true;

  // Create a node for each age 0–19
  for (let age = 0; age <= 19; age++) {
    const node = document.createElement('div');
    node.className = 'htl-node';
    node.dataset.age = age;
    node.setAttribute('aria-label', 'Age ' + age);
    node.innerHTML = `<div class="htl-dot"></div><span class="htl-label">${age}</span>`;
    node.addEventListener('click', () => htlSelectAge(age));
    track.appendChild(node);
  }

  // Auto-select age 19 after a moment for wow effect
  setTimeout(() => htlSelectAge(19), 600);
}

function htlSelectAge(age) {
  const msg   = HTL_MESSAGES[age];
  const card  = document.getElementById('htlCard');
  const ageEl = document.getElementById('htlMsgAge');
  const textEl = document.getElementById('htlMsgText');
  const glowEl = document.getElementById('htlMsgGlow');

  if (!card || !msg) return;

  // Update active dot
  document.querySelectorAll('.htl-node').forEach(n => {
    n.classList.toggle('active', parseInt(n.dataset.age) === age);
  });

  // Scroll selected dot to centre
  const activeNode = document.querySelector(`.htl-node[data-age="${age}"]`);
  if (activeNode) {
    activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Update card content
  ageEl.textContent  = msg.label;
  textEl.textContent = msg.text;

  // Special glow for age 19
  if (glowEl) glowEl.className = age === 19 ? 'htl-msg-glow glow-19' : 'htl-msg-glow';

  // Show card with re-animation
  card.classList.remove('hidden');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  // Age 19 = confetti + hearts
  if (age === 19) {
    launchConfetti(true);
  }
}

function htlScroll(dir) {
  const scroll = document.getElementById('htlScroll');
  if (!scroll) return;
  scroll.scrollBy({ left: dir * 200, behavior: 'smooth' });
}

/* ============================================================
   BIRTHDAY CAKE — BLOW CANDLE
   ============================================================ */
let candleBlown = false;

function blowCandleNew() {
  if (candleBlown) return;
  candleBlown = true;

  const flame = document.getElementById('candleFlame');
  const smoke = document.getElementById('candleSmoke');
  const msg   = document.getElementById('cakeWishMsg');
  const hint  = document.getElementById('candleHint');

  // Blow the flame out
  if (flame) {
    flame.style.animation = 'none';
    flame.classList.add('blown');
    setTimeout(() => { flame.style.display = 'none'; }, 450);
  }

  // Show smoke
  if (smoke) {
    smoke.classList.remove('hidden');
    setTimeout(() => smoke.classList.add('hidden'), 1600);
  }

  if (hint) hint.textContent = '🌬️ Poof!';

  // Show wish message
  setTimeout(() => {
    if (msg) msg.classList.remove('hidden');
    launchConfetti(true);
  }, 900);
}

/* ============================================================
   SECRET MESSAGE
   ============================================================ */
function openSecretMsg() {
  const overlay = document.getElementById('secretOverlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  // Re-trigger line animations by cloning
  const txt = document.getElementById('secretText');
  if (txt) {
    const clone = txt.cloneNode(true);
    txt.parentNode.replaceChild(clone, txt);
  }
  document.body.style.overflow = 'hidden';
}

function closeSecretMsg() {
  const overlay = document.getElementById('secretOverlay');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ============================================================
   BACKGROUND MUSIC
   ============================================================ */
let musicPlaying = false;
let musicFading  = false;

function initMusic() {
  const audio = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicBtn');
  if (!audio) return;

  audio.volume = 0;

  // Autoplay on first user interaction (browser policy)
  const startOnInteraction = () => {
    if (musicPlaying) return;
    audio.play().then(() => {
      musicPlaying = true;
      fadeAudio(audio, 0, 0.22, 3000); // fade in over 3s to 22% volume
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
    }).catch(() => {});
  };

  document.addEventListener('click',      startOnInteraction, { once: true });
  document.addEventListener('touchstart', startOnInteraction, { once: true });
}

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicBtn');
  if (!audio) return;

  if (audio.paused) {
    audio.play().catch(() => {});
    fadeAudio(audio, audio.volume, 0.22, 800);
    musicPlaying = true;
    if (btn) { btn.textContent = '🎵'; btn.classList.remove('muted'); }
  } else {
    fadeAudio(audio, audio.volume, 0, 600, () => audio.pause());
    musicPlaying = false;
    if (btn) { btn.textContent = '🔇'; btn.classList.add('muted'); }
  }
}

function fadeAudio(audio, from, to, duration, onDone) {
  const steps    = 40;
  const interval = duration / steps;
  const delta    = (to - from) / steps;
  let   current  = from;
  let   step     = 0;

  const timer = setInterval(() => {
    current += delta;
    step++;
    audio.volume = Math.min(1, Math.max(0, current));
    if (step >= steps) {
      clearInterval(timer);
      if (onDone) onDone();
    }
  }, interval);
}
const HEART_CHARS = ['💖', '💗', '💕', '💓', '💞', '🌸', '✨', '💫', '🌷'];

function initHearts() {
  const container = document.getElementById('heartsContainer');
  if (!container) return;

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (12 + Math.random() * 18) + 'px';
    const dur = 8 + Math.random() * 10;
    heart.style.animationDuration = dur + 's';
    heart.style.animationDelay = '0s';
    container.appendChild(heart);

    setTimeout(() => heart.remove(), dur * 1000);
  }

  // Spawn a few immediately then continuously
  for (let i = 0; i < 8; i++) {
    setTimeout(spawnHeart, i * 600);
  }

  heartInterval = setInterval(spawnHeart, 1200);
}

/* ============================================================
   STARS
   ============================================================ */
function initStars() {
  const container = document.getElementById('starsContainer');
  if (!container) return;

  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.animationDuration = (2 + Math.random() * 4) + 's';
    star.style.animationDelay = (Math.random() * 4) + 's';
    star.style.width = star.style.height = (1 + Math.random() * 3) + 'px';
    container.appendChild(star);
  }
}

/* ============================================================
   QUOTE CAROUSEL
   ============================================================ */
function initCarouselDots() {
  const dotsContainer = document.getElementById('carouselDots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalQuotes; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', () => goToQuote(i));
    dotsContainer.appendChild(dot);
  }
}

function updateCarouselDots() {
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentQuote);
  });
}

function goToQuote(index) {
  const slides = document.querySelectorAll('.quote-slide');
  slides.forEach(s => s.classList.remove('active'));
  currentQuote = (index + totalQuotes) % totalQuotes;
  if (slides[currentQuote]) slides[currentQuote].classList.add('active');
  updateCarouselDots();
}

function nextQuote() { goToQuote(currentQuote + 1); }
function prevQuote() { goToQuote(currentQuote - 1); }

// Auto-advance carousel
let carouselTimer;
function startCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextQuote, 4500);
}

// Touch / swipe support for carousel
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) nextQuote();
    else prevQuote();
  }
}, { passive: true });

/* ============================================================
   TIMELINE ANIMATION
   ============================================================ */
function animateTimelineItems() {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, i * 150);
  });
}

function animateTimelineOnScroll() {
  // Already handled by section switching, placeholder for scroll observer
}

/* ============================================================
   BLOW CANDLES INTERACTION
   ============================================================ */
const WISHES_LIST = [
  "Your wish has been sent to the stars! ⭐",
  "The universe heard you! May it all come true! 🌙",
  "Magic is on its way to you! 🌸",
  "Your wish is sealed with love! 💖",
  "19 candles blown — 19 wishes granted! ✨",
];

let wishCount = 0;
function blowCandles() {
  const cakeEl = document.getElementById('cakeEmoji');
  const resultEl = document.getElementById('wishResult');
  const btn = document.querySelector('.btn-blow');

  // Animate cake
  cakeEl.style.transform = 'scale(0.8) rotate(-10deg)';
  cakeEl.textContent = '🎂';

  // After animation
  setTimeout(() => {
    cakeEl.style.transform = '';
    cakeEl.textContent = '🫙';
    cakeEl.style.transition = 'all 0.4s ease';
    setTimeout(() => {
      cakeEl.textContent = '✨';
      setTimeout(() => {
        cakeEl.textContent = '🎂';
      }, 1500);
    }, 600);
  }, 300);

  // Change button
  btn.textContent = '💨 Poof!';
  btn.style.background = 'linear-gradient(135deg, #c8a8ff, #ffd6e8)';

  setTimeout(() => {
    btn.textContent = '🌬️ Blow!';
    btn.style.background = '';
  }, 2000);

  // Show wish result
  const wish = WISHES_LIST[wishCount % WISHES_LIST.length];
  wishCount++;
  resultEl.style.opacity = '0';
  setTimeout(() => {
    resultEl.textContent = wish;
    resultEl.style.transition = 'opacity 0.4s ease';
    resultEl.style.opacity = '1';
  }, 400);

  // Shoot particles
  launchConfetti(true);
}

/* ============================================================
   CONFETTI
   ============================================================ */
const CONFETTI_COLORS = [
  '#f94f8a', '#ff9a9e', '#c8a8ff', '#9b72ff',
  '#ffafd0', '#ffd6e8', '#ff9a7b', '#fecfef',
  '#fff', '#ffe4c8'
];

function launchConfetti(small = false) {
  if (confettiActive && !small) return;
  if (!small) confettiActive = true;

  const count = small ? 40 : 150;
  const duration = small ? 2000 : 4000;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      createConfettiPiece();
    }, Math.random() * (small ? 500 : 1500));
  }

  if (!small) {
    setTimeout(() => { confettiActive = false; }, duration + 2000);
  }
}

function createConfettiPiece() {
  const el = document.createElement('div');
  el.className = 'confetti-piece';
  el.style.left = Math.random() * 100 + 'vw';
  el.style.top = '-10px';
  el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.width = (6 + Math.random() * 10) + 'px';
  el.style.height = (6 + Math.random() * 10) + 'px';
  el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
  const dur = 2 + Math.random() * 2.5;
  el.style.animationDuration = dur + 's';
  el.style.animationTimingFunction = 'ease-in';

  // Horizontal drift
  const drift = (Math.random() - 0.5) * 200;
  el.style.transform = `translateX(${drift}px)`;
  el.style.animationName = 'confettiFall';

  document.body.appendChild(el);
  setTimeout(() => el.remove(), (dur + 0.5) * 1000);
}

/* ============================================================
   MEMORY SWIPE CARDS
   ============================================================ */
const MEMORIES = [
  {
    img:     'images/pic1.jpg',
    emoji:   '💬',
    title:   'The first time we talked',
    caption: 'The first time we talked 💬 — I already knew there was something different about you. Something I couldn\'t quite name but couldn\'t stop thinking about.',
  },
  {
    img:     'images/pic2.jpg',
    emoji:   '✨',
    title:   'The moment I knew',
    caption: 'The moment I realized you\'re special ✨ — it hit me quietly, like all the best things do.',
  },
  {
    img:     'images/pic3.jpg',
    emoji:   '😂',
    title:   'Our best moment',
    caption: 'Our best moment 😂 — I don\'t think I\'ve ever laughed that hard with anyone else. That laugh is mine to keep.',
  },
  {
    img:     'images/pic4.jpg',
    emoji:   '💖',
    title:   'You being cute for no reason',
    caption: 'You being cute for no reason 💖 — honestly just existing and being you is enough to make my whole day.',
  },
  {
    img:     'images/pic5.jpg',
    emoji:   '🌙',
    title:   'Late night conversations',
    caption: 'Those nights we talked until the world went quiet 🌙 — time stopped mattering whenever it was us.',
  },
];

let memIdx = 0;          // current memory index
let swDragging = false;
let swStartX   = 0;
let swCurrentX = 0;
let swCardEl   = null;
const SWIPE_THRESHOLD = 80; // px — minimum drag to register a swipe

function initMemorySwipe() {
  const total = document.getElementById('swipeTotalNum');
  if (total) total.textContent = MEMORIES.length;

  buildSwipeDots();
  renderSwipeCard(memIdx, 'enter');
}

/* ---- Build dot nav ---- */
function buildSwipeDots() {
  const container = document.getElementById('swipeDots');
  if (!container) return;
  container.innerHTML = '';
  MEMORIES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'swipe-dot' + (i === memIdx ? ' active' : '');
    dot.setAttribute('aria-label', 'Memory ' + (i + 1));
    dot.addEventListener('click', () => goToMemory(i));
    container.appendChild(dot);
  });
}

function updateSwipeDots() {
  document.querySelectorAll('.swipe-dot').forEach((d, i) => {
    d.classList.toggle('active', i === memIdx);
  });
  const curr = document.getElementById('swipeCurrentNum');
  if (curr) curr.textContent = memIdx + 1;
}

/* ---- Render a card (direction: 'enter' | 'left' | 'right') ---- */
function renderSwipeCard(index, direction) {
  const stack = document.getElementById('swipeStack');
  if (!stack) return;

  const mem = MEMORIES[index];

  // Remove any existing card after its exit animation
  const old = stack.querySelector('.sw-card');
  if (old) {
    if (direction === 'left')  old.classList.add('sw-exit-left');
    if (direction === 'right') old.classList.add('sw-exit-right');
    setTimeout(() => old.remove(), 430);
  }

  // Build new card
  const card = document.createElement('div');
  card.className = 'sw-card';
  card.innerHTML = `
    <div class="sw-image sw-photo" style="background-image: url('${mem.img}')">
      <span class="sw-photo-fallback">${mem.emoji}</span>
      <span class="sw-index-badge">Memory ${index + 1} of ${MEMORIES.length}</span>
    </div>
    <div class="sw-caption">
      <h3>${mem.title}</h3>
      <p>${mem.caption}</p>
    </div>
  `;

  // Always enter from below (fresh appearance)
  card.classList.add('sw-enter');
  stack.appendChild(card);

  // Wire up drag/swipe listeners
  bindSwipeListeners(card);

  updateSwipeDots();
}

/* ---- Navigation helpers ---- */
function memoryNext() {
  if (memIdx >= MEMORIES.length - 1) return;
  memIdx++;
  renderSwipeCard(memIdx, 'left');
  burstHearts();
}

function memoryPrev() {
  if (memIdx <= 0) return;
  memIdx--;
  renderSwipeCard(memIdx, 'right');
  burstHearts();
}

function goToMemory(index) {
  if (index === memIdx) return;
  const dir = index > memIdx ? 'left' : 'right';
  memIdx = index;
  renderSwipeCard(memIdx, dir);
  burstHearts();
}

/* ---- Heart burst animation ---- */
function burstHearts() {
  const burst = document.getElementById('swipeHeart');
  if (!burst) return;

  burst.innerHTML = '';
  burst.classList.remove('burst');

  const EMOJIS = ['💖','💗','💕','💓','✨','🌸'];
  const count  = 7;

  for (let i = 0; i < count; i++) {
    const h   = document.createElement('span');
    const ang = (i / count) * Math.PI * 2;
    const rad = 55 + Math.random() * 30;
    const tx  = Math.cos(ang) * rad + 'px';
    const ty  = Math.sin(ang) * rad - 30 + 'px';

    h.className = 'burst-heart';
    h.textContent = EMOJIS[i % EMOJIS.length];
    h.style.cssText = `
      position: absolute;
      left: 0; top: 0;
      --tx: ${tx};
      --ty: ${ty};
      font-size: ${0.9 + Math.random() * 0.6}rem;
      animation-delay: ${i * 40}ms;
    `;
    burst.appendChild(h);
  }

  // Trigger reflow
  void burst.offsetWidth;
  burst.classList.add('burst');
  setTimeout(() => { burst.innerHTML = ''; burst.classList.remove('burst'); }, 750);
}

/* ---- Drag / touch swipe ---- */
function bindSwipeListeners(card) {
  // Mouse
  card.addEventListener('mousedown',  onSwipeStart, { passive: true });
  card.addEventListener('mousemove',  onSwipeMove,  { passive: true });
  card.addEventListener('mouseup',    onSwipeEnd);
  card.addEventListener('mouseleave', onSwipeEnd);

  // Touch
  card.addEventListener('touchstart', onSwipeStart, { passive: true });
  card.addEventListener('touchmove',  onSwipeMove,  { passive: true });
  card.addEventListener('touchend',   onSwipeEnd,   { passive: true });
}

function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function onSwipeStart(e) {
  swDragging = true;
  swStartX   = getClientX(e);
  swCardEl   = e.currentTarget;
  swCardEl.classList.add('dragging');
}

function onSwipeMove(e) {
  if (!swDragging || !swCardEl) return;
  swCurrentX = getClientX(e) - swStartX;

  // Tilt card proportionally to drag distance (max ±15deg)
  const tilt = Math.min(Math.max(swCurrentX / 18, -15), 15);
  swCardEl.style.transform = `translateX(${swCurrentX}px) rotate(${tilt}deg)`;

  // Hint: fade the card slightly when dragging far
  const fade = Math.max(0.6, 1 - Math.abs(swCurrentX) / 400);
  swCardEl.style.opacity = fade;
}

function onSwipeEnd() {
  if (!swDragging || !swCardEl) return;
  swDragging = false;
  swCardEl.classList.remove('dragging');

  if (swCurrentX < -SWIPE_THRESHOLD) {
    // Swiped left → next
    memoryNext();
  } else if (swCurrentX > SWIPE_THRESHOLD) {
    // Swiped right → prev
    memoryPrev();
  } else {
    // Snap back
    swCardEl.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
    swCardEl.style.transform  = '';
    swCardEl.style.opacity    = '';
    setTimeout(() => {
      if (swCardEl) swCardEl.style.transition = '';
    }, 360);
  }

  swCardEl   = null;
  swCurrentX = 0;
}


/* ============================================================
   VIBE EMOJI INTERACTIONS
   ============================================================ */
function initVibeEmojis() {
  document.querySelectorAll('.vibe-emoji').forEach(emoji => {
    emoji.addEventListener('click', () => {
      const originalSize = emoji.style.fontSize;
      emoji.style.transform = 'scale(2) rotate(30deg)';
      emoji.style.zIndex = '100';
      setTimeout(() => {
        emoji.style.transform = '';
        emoji.style.zIndex = '';
      }, 300);
      launchConfetti(true);
    });
  });
}

/* ============================================================
   PAGE VISIBILITY — Pause hearts when hidden
   ============================================================ */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && heartInterval) {
    clearInterval(heartInterval);
  } else if (!document.hidden && currentSection !== 'home') {
    initHearts();
  }
});

/* ============================================================
   SPARKLE CLICK EFFECT
   ============================================================ */
document.addEventListener('click', (e) => {
  if (e.target.closest('.nav-btn') || e.target.closest('.btn-enter') ||
      e.target.closest('.btn-confetti') || e.target.closest('.btn-blow') ||
      e.target.closest('.carousel-btn') || e.target.closest('.nav-hamburger')) return;

  spawnSparkle(e.clientX, e.clientY);
});

function spawnSparkle(x, y) {
  const sparkles = ['✨', '💖', '🌸', '⭐', '💫'];
  const el = document.createElement('div');
  el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 9999;
    font-size: 1.2rem;
    transform: translate(-50%, -50%);
    animation: sparkleAnim 0.8s ease forwards;
  `;
  document.body.appendChild(el);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkleAnim {
      0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
      50%  { opacity: 1; transform: translate(-50%, -80%) scale(1.3); }
      100% { opacity: 0; transform: translate(-50%, -130%) scale(0.8); }
    }
  `;
  if (!document.querySelector('#sparkleAnimStyle')) {
    style.id = 'sparkleAnimStyle';
    document.head.appendChild(style);
  } else {
    style.remove();
  }

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */
const SECTION_ORDER = ['home','letter','memories','timeline','gift','cake','wishes','gallery'];

document.addEventListener('keydown', (e) => {
  const idx = SECTION_ORDER.indexOf(currentSection);
  if (e.key === 'ArrowRight' && idx < SECTION_ORDER.length - 1) {
    showSection(SECTION_ORDER[idx + 1]);
  } else if (e.key === 'ArrowLeft' && idx > 0) {
    showSection(SECTION_ORDER[idx - 1]);
  }
});

/* ============================================================
   INIT ON DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Spawn hearts & stars straight away so landing screen feels alive
  initHearts();
  initStars();

  // Pre-init carousel dots and other lightweight things
  initCarouselDots();
  initMemorySwipe();
  initVibeEmojis();
  startCarouselTimer();
  initMusic();

  // Scroll-based nav highlight (no-op now without nav bar)
  window.addEventListener('scroll', () => {});
});
