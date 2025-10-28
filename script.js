function startCelebration() {
  const msg = document.getElementById('message');
  const song = document.getElementById('birthdaySong');
  msg.classList.remove('hidden');
  song.play();
  launchFireworks();
  startConfetti();
}

// ===== Fireworks =====
function launchFireworks() {
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  const colors = ['#ff69b4', '#00ffff', '#ffb6c1', '#ffd700', '#87cefa'];

  function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x, y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        life: 100,
        color
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0) particles.splice(i, 1);
    });
    if (Math.random() < 0.05) createFirework();
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== Confetti =====
function startConfetti() {
  const duration = 8000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0, 1), y: Math.random() - 0.2 } }));
  }, 250);
}

// ===== Load Confetti Library =====
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
document.head.appendChild(script);
