/* ==================================================================
   BIRTHDAY WEBSITE — SCRIPT (premium edition)
   Sections:
     1.  Configuration
     2.  Boot sequence (loading screen → countdown → reveal)
     3.  Starfield generator
     4.  Confetti animation
     5.  Fireworks animation
     6.  Scroll-triggered reveal animations
     7.  Typing effect
     8.  Surprise button + card flip
     9.  Footer (year + back-to-top)
     10. Background music player
   ================================================================== */

// Respect the visitor's OS-level motion preference throughout the file.
const PREFERS_REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ---------- 1. CONFIGURATION ---------- */

// 🎂 CHANGE THIS: replace with the birthday person's name.
// Every place the name appears on the page reads from this one variable.
const BIRTHDAY_PERSON_NAME = "Aria";

// The line typed out beneath the hero title once the site reveals itself.
const HERO_TAGLINE = "Today the world gets to celebrate you all over again.";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#name-hero, #name-message, #name-footer").forEach((el) => {
    el.textContent = BIRTHDAY_PERSON_NAME;
  });
  document.title = `Happy Birthday, ${BIRTHDAY_PERSON_NAME}!`;

  generateStars();
  initScrollReveal();
  initSurpriseCard();
  initMusicPlayer();
  initFooter();
  initFireworksCanvas();
  initConfettiCanvas();

  runBootSequence();
});

/* ---------- 2. BOOT SEQUENCE ---------- */

/**
 * Orchestrates the single entrance moment for the whole site:
 * loading screen (progress bar) → countdown (3-2-1-✨) → reveal
 * (confetti + fireworks + typing effect).
 */
function runBootSequence() {
  const loadingScreen = document.getElementById("loading-screen");
  const barFill = document.getElementById("loader-bar-fill");
  const countdownOverlay = document.getElementById("countdown-overlay");

  // Kick the progress bar to full width; the CSS transition animates it.
  requestAnimationFrame(() => {
    barFill.style.width = "100%";
  });

  const loadingDuration = PREFERS_REDUCED_MOTION ? 400 : 1700;

  setTimeout(() => {
    // Reveal the countdown overlay just as the loading screen starts to fade,
    // so there is no blank frame in between the two.
    countdownOverlay.classList.add("is-visible");
    loadingScreen.classList.add("is-hidden");

    runCountdown(() => {
      countdownOverlay.classList.remove("is-visible");
      countdownOverlay.classList.add("is-hidden");
      revealSite();
    });
  }, loadingDuration);
}

/**
 * Ticks 3 → 2 → 1 → ✨ inside the countdown overlay, then calls `onDone`.
 */
function runCountdown(onDone) {
  const numberEl = document.getElementById("countdown-number");
  const sequence = ["3", "2", "1", "✨"];
  const tickMs = PREFERS_REDUCED_MOTION ? 150 : 700;
  let step = 0;

  const tick = () => {
    numberEl.textContent = sequence[step];

    // Restart the CSS "pop" animation on every tick by forcing a reflow.
    numberEl.style.animation = "none";
    // eslint-disable-next-line no-unused-expressions
    numberEl.offsetHeight;
    numberEl.style.animation = "";

    step += 1;

    if (step < sequence.length) {
      setTimeout(tick, tickMs);
    } else {
      setTimeout(onDone, PREFERS_REDUCED_MOTION ? 150 : 550);
    }
  };

  tick();
}

/**
 * The big entrance: fires confetti and fireworks together, then types
 * out the hero tagline once the burst is under way.
 */
function revealSite() {
  launchConfetti();
  launchFireworks(PREFERS_REDUCED_MOTION ? 1 : 4);

  const target = document.getElementById("typing-target");
  const cursor = document.querySelector(".typing-cursor");

  setTimeout(() => {
    typeText(target, HERO_TAGLINE, PREFERS_REDUCED_MOTION ? 0 : 42).then(() => {
      setTimeout(() => cursor.classList.add("is-done"), 2200);
    });
  }, 300);
}

/* ---------- 3. STARFIELD GENERATOR ---------- */

/**
 * Scatters small twinkling star elements across the fixed #stars layer.
 * Generated in JS so their position/size/timing feel organically random.
 */
function generateStars() {
  const container = document.getElementById("stars");
  const count = PREFERS_REDUCED_MOTION ? 25 : 90;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.className = "star";

    const size = (Math.random() * 2 + 1).toFixed(1); // 1px – 3px
    const duration = (Math.random() * 3 + 2).toFixed(2); // 2s – 5s
    const delay = (Math.random() * 5).toFixed(2);

    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDuration = `${duration}s`;
    star.style.animationDelay = `${delay}s`;

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

/* ---------- 4. CONFETTI ANIMATION ---------- */

let confettiCtx = null;

function initConfettiCanvas() {
  const canvas = document.getElementById("confetti-canvas");
  confettiCtx = canvas.getContext("2d");
  resizeCanvasToWindow(canvas);
  window.addEventListener("resize", () => resizeCanvasToWindow(canvas));
}

/**
 * A layered confetti burst — circles, squares and ribbon-like streamers
 * fall from the top of the screen with gravity, drift, spin and a
 * gentle wobble, then fade out naturally. No external library needed.
 */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = confettiCtx;

  const colors = ["#ff7bab", "#d24d84", "#f4c766", "#ffe3ab", "#a682ff", "#bfe3ff"];
  const pieceCount = PREFERS_REDUCED_MOTION ? 40 : 160;
  const pieces = [];

  for (let i = 0; i < pieceCount; i += 1) {
    const isStreamer = Math.random() > 0.7;
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: isStreamer ? 10 + Math.random() * 8 : 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 1.8 + Math.random() * 3,
      speedX: -1.5 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: -8 + Math.random() * 16,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.05 + Math.random() * 0.05,
      shape: isStreamer ? "streamer" : Math.random() > 0.5 ? "circle" : "rect",
    });
  }

  const durationMs = PREFERS_REDUCED_MOTION ? 1200 : 4400;
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.6;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - elapsed / durationMs);

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "streamer") {
        ctx.fillRect(-p.size / 2, -p.size / 8, p.size, p.size / 4);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx.restore();
    });

    if (elapsed < durationMs) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
}

/* ---------- 5. FIREWORKS ANIMATION ---------- */

let fwCtx = null;
let fwRockets = [];
let fwParticles = [];
let fwAnimating = false;

const FIREWORK_COLORS = ["#ff7bab", "#f4c766", "#a682ff", "#bfe3ff", "#ffe3ab", "#ffffff"];

function initFireworksCanvas() {
  const canvas = document.getElementById("fireworks-canvas");
  fwCtx = canvas.getContext("2d");
  resizeCanvasToWindow(canvas);
  window.addEventListener("resize", () => resizeCanvasToWindow(canvas));
}

/**
 * Launches `count` rockets, staggered slightly, that rise then explode
 * into a radial shower of fading particles — classic fireworks.
 */
function launchFireworks(count = 4) {
  const canvas = document.getElementById("fireworks-canvas");

  for (let i = 0; i < count; i += 1) {
    setTimeout(() => {
      fwRockets.push({
        x: canvas.width * (0.15 + Math.random() * 0.7),
        y: canvas.height,
        targetY: canvas.height * (0.15 + Math.random() * 0.35),
        speed: 7 + Math.random() * 3,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        trail: [],
      });
      startFireworksLoop();
    }, i * 350);
  }
}

function explodeRocket(rocket) {
  const particleCount = PREFERS_REDUCED_MOTION ? 16 : 46;
  for (let i = 0; i < particleCount; i += 1) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = 1.5 + Math.random() * 3;
    fwParticles.push({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: rocket.color,
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
    });
  }
}

function startFireworksLoop() {
  if (fwAnimating) return;
  fwAnimating = true;

  const canvas = document.getElementById("fireworks-canvas");
  const ctx = fwCtx;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw rockets rising toward their burst height.
    fwRockets.forEach((r) => {
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 6) r.trail.shift();
      r.y -= r.speed;

      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      r.trail.forEach((point, idx) => {
        ctx.globalAlpha = idx / r.trail.length;
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    fwRockets = fwRockets.filter((r) => {
      if (r.y <= r.targetY) {
        explodeRocket(r);
        return false;
      }
      return true;
    });

    // Update & draw explosion particles.
    fwParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035; // gravity
      p.vx *= 0.985;
      p.life -= p.decay;

      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    fwParticles = fwParticles.filter((p) => p.life > 0);

    if (fwRockets.length > 0 || fwParticles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fwAnimating = false;
    }
  }

  requestAnimationFrame(loop);
}

/* ---------- SHARED CANVAS HELPER ---------- */

function resizeCanvasToWindow(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ---------- 6. SCROLL-TRIGGERED REVEAL ANIMATIONS ---------- */

/**
 * Fades + slides any [data-animate] element into place the moment it
 * enters the viewport, using a single shared IntersectionObserver.
 */
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window) || PREFERS_REDUCED_MOTION) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- 7. TYPING EFFECT ---------- */

/**
 * Types `text` into `el` one character at a time and resolves once done.
 * Falls back to setting the full text instantly for reduced-motion users.
 */
function typeText(el, text, speed = 40) {
  return new Promise((resolve) => {
    if (speed === 0) {
      el.textContent = text;
      resolve();
      return;
    }

    let i = 0;
    el.textContent = "";

    (function step() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i += 1;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    })();
  });
}

/* ---------- 8. SURPRISE BUTTON + CARD FLIP ---------- */

/**
 * Reveals the birthday card (with a ripple + confetti flourish) when the
 * "Open Your Surprise" button is pressed, then lets the visitor tap the
 * card itself to flip it open.
 */
function initSurpriseCard() {
  const btn = document.getElementById("surprise-btn");
  const ripple = btn.querySelector(".surprise-btn__ripple");
  const card = document.getElementById("birthday-card");

  btn.addEventListener("click", (event) => {
    // Position and play the ripple from the exact click point.
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.classList.remove("is-active");
    // Force reflow so the animation can restart cleanly.
    // eslint-disable-next-line no-unused-expressions
    ripple.offsetWidth;
    ripple.classList.add("is-active");

    btn.classList.add("is-hidden");
    card.hidden = false;

    launchConfetti();
    launchFireworks(2);

    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
    });
  });
}

/* ---------- 9. FOOTER ---------- */

function initFooter() {
  const yearEl = document.getElementById("footer-year");
  yearEl.textContent = `Crafted with care · ${new Date().getFullYear()}`;

  const topBtn = document.getElementById("back-to-top");
  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth" });
  });
}

/* ---------- 10. BACKGROUND MUSIC PLAYER ---------- */

/**
 * Toggles playback of the optional background track.
 * If no audio file has been supplied (see index.html), play() rejects
 * quietly and the button simply stays in its paused state.
 */
function initMusicPlayer() {
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  const icon = document.getElementById("music-icon");

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          btn.classList.add("is-playing");
          icon.textContent = "❚❚";
          btn.setAttribute("aria-label", "Pause background music");
        })
        .catch(() => {
          console.info("Add a track at music/birthday-song.mp3 to enable music.");
        });
    } else {
      audio.pause();
      btn.classList.remove("is-playing");
      icon.textContent = "♪";
      btn.setAttribute("aria-label", "Play background music");
    }
  });
}
