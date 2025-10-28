let celebrating = false;
let confettiInterval;

function toggleCelebration() {
  const heart = document.querySelector(".heart");
  const message = document.getElementById("message");
  const song = document.getElementById("birthdaySong");

  if (!celebrating) {
    // Start Celebration
    heart.textContent = "💙";
    message.classList.remove("hidden");
    song.play();
    startFireworks();
    startConfetti();

    // Auto reset after 5 minutes
    setTimeout(resetCelebration, 300000);

    celebrating = true;
  } else {
    // Reset if clicked again
    resetCelebration();
  }
}

function resetCelebration() {
  const heart = document.querySelector(".heart");
  const message = document.getElementById("message");
  const song = document.getElementById("birthdaySong");

  song.pause();
  song.currentTime = 0;
  message.classList.add("hidden");
  heart.textContent = "❤️";
  stopFireworks();
  stopConfetti();
  celebrating = false;
}

// --- Fireworks ---
let fireworksAnim;

function startFireworks() {
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fireworks = [];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createFirework() {
    const x = random(0, canvas.width);
    const y = random(0, canvas.height / 2);
    const colors = ["#6ec6ff", "#ff99cc", "#ffffff", "#ffe066"];
    for (let i = 0; i < 30; i++) {
      fireworks.push({
        x,
        y,
        radius: random(2, 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: random(-3, 3),
        speedY: random(-3, 3),
        alpha: 1,
      });
    }
  }

  function drawFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach((f, i) => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(f.color)},${f.alpha})`;
      ctx.fill();
      f.x += f.speedX;
      f.y += f.speedY;
      f.alpha -= 0.02;
      if (f.alpha <= 0) fireworks.splice(i, 1);
    });
    if (Math.random() < 0.05) createFirework();
    fireworksAnim = requestAnimationFrame(drawFireworks);
  }

  drawFireworks();
}

function stopFireworks() {
  cancelAnimationFrame(fireworksAnim);
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

// --- Confetti (Hearts and Stars) ---
function startConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confetti = [];
  const shapes = ["💖", "⭐", "💙", "✨"];

  function createConfetti() {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20,
      emoji: shapes[Math.floor(Math.random() * shapes.length)],
      size: Math.random() * 24 + 14,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.5,
    });
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c, i) => {
      ctx.font = `${c.size}px serif`;
      ctx.globalAlpha = c.opacity;
      ctx.fillText(c.emoji, c.x, c.y);
      c.y += c.speed;
      if (c.y > canvas.height) confetti.splice(i, 1);
    });
    ctx.globalAlpha = 1;
  }

  confettiInterval = setInterval(() => {
    createConfetti();
    drawConfetti();
  }, 50);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
