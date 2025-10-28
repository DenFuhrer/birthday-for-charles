let isMessageShown = false;
let audio = new Audio('hbd.mp3');

function revealMessage() {
  const msg = document.getElementById('message');
  const confettiContainer = document.getElementById('confetti-container');

  if (!isMessageShown) {
    msg.classList.remove('hidden');
    playConfetti();
    playFireworks();
    audio.play();
    isMessageShown = true;
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

function playConfetti() {
  const confettiContainer = document.getElementById('confetti-container');
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = 2 + Math.random() * 3 + 's';
    confetti.style.backgroundColor = ['#ffb6c1', '#87ceeb', '#ffffff'][Math.floor(Math.random() * 3)];
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

function playFireworks() {
  const confettiContainer = document.getElementById('confetti-container');
  for (let i = 0; i < 10; i++) {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    firework.style.left = Math.random() * 100 + 'vw';
    firework.style.animationDelay = i * 0.2 + 's';
    confettiContainer.appendChild(firework);
    setTimeout(() => firework.remove(), 3000);
  }
}
