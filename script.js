function startCelebration() {
  const heart = document.querySelector(".heart");
  const message = document.getElementById("message");
  const song = document.getElementById("birthdaySong");

  heart.style.display = "none";
  message.classList.remove("hidden");

  // Play song
  song.play();

  // Start fireworks & confetti
  startFireworks();

  // ⏰ Reset after 5 minutes
  setTimeout(() => {
    song.pause();
    song.currentTime = 0;
    location.reload();
  }, 300000); // 5 minutes
}

// Simple fireworks animation
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
    const colors = ["#ff007f", "#ffcc00", "#00ccff", "#ff6600", "#33ff99"];
    for (let i = 0; i < 30; i++) {
      fireworks.push({
        x,
        y,
        radius: random(2, 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: random(-3, 3),
        speedY: random(-3, 3),
        alpha: 1
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
    requestAnimationFrame(drawFireworks);
  }

  drawFireworks();
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}
