let isMessageShown = false;
let audio = new Audio('hbd.mp3');

function revealMessage() {
  const msg = document.getElementById('message');
  const confettiContainer = document.getElementById('confetti-container');

  if (!isMessageShown) {
    msg.classList.remove('hidden');
    playConfettiSequence();
    audio.play();
    isMessageShown = true;

    // Auto reset after 5 minutes
    setTimeout(resetMessage, 5 * 60 * 1000);
  } else {
    resetMessage();
  }
}

function resetMessage() {
  const msg = document.getElementById('message');
  msg.classList.add('hidden');
  const confettiContainer = document.getElementById('confetti-container');
  confettiContainer.innerHTML = '';
  audio.pause();
  audio.currentTime = 0;
  isMessageShown = false;
}

// ---- Celebration Sequence ----
function playConfettiSequence() {
  const confettiContainer = document.getElementById('confetti-container');

  // First gentle confetti fall
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = 3 + Math.random() * 2 + 's';
    confetti.style.backgroundColor = ['#ffb6c1', '#87ceeb', '#ffffff'][Math.floor(Math.random() * 3)];
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 6000);
  }

  // After confetti finishes falling → fireworks and new confetti burst
  setTimeout(() => {
    playFireworks();
    playConfettiBurst();
  }, 5000);
}

// ---- Big celebration burst ----
function playConfettiBurst() {
  const confettiContainer = document.getElementById('confetti-container');
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = 2 + Math.random() * 2 + 's';
    confetti.style.backgroundColor = ['#ffb6c1', '#87ceeb', '#ffffff'][Math.floor(Math.random() * 3)];
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

function playFireworks() {
  const confettiContainer = document.getElementById('confetti-container');
  for (let i = 0; i < 15; i++) {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    firework.style.left = Math.random() * 100 + 'vw';
    firework.style.animationDelay = i * 0.2 + 's';
    confettiContainer.appendChild(firework);
    setTimeout(() => firework.remove(), 2500);
  }
}
