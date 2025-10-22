/* script.js
 - Drops cake layers, puts 22 candles, asks user to blow, listens for mic input
 - On blow detection: trigger confetti + fireworks and reveal message
*/

// Helpers to select
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const layers = ['.layer-1', '.layer-2', '.layer-3'].map(s => $(s));
const candlesContainer = $('#candles');
const promptEl = $('#prompt');
const fallback = $('#fallback');
const blowBtn = $('#blow-btn');
const messageEl = $('#message');
const canvas = $('#fx-canvas');
const ctx = canvas.getContext('2d');

// responsive canvas
function resizeCanvas(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ---------------------------
   Drop cake & create candles
   --------------------------- */
function dropCakeAndCreateCandles(){
  // simultaneously add 'drop' class to layers
  layers.forEach(l => l.classList.add('drop'));

  // create 22 candles
  const n = 22;
  candlesContainer.innerHTML = '';
  for(let i=0;i<n;i++){
    const c = document.createElement('div');
    c.className = 'candle';
    // slight stagger flicker
    c.style.animationDelay = `${(Math.random()*0.6).toFixed(2)}s`;
    candlesContainer.appendChild(c);
  }

  // after animation show prompt
  setTimeout(()=> {
    promptEl.classList.add('show');
    promptEl.classList.remove('hidden');
    // try start mic but show fallback option first
    startMicListening().catch(()=> {
      fallback.classList.remove('hidden');
    });
  }, 1100);
}

/* ---------------------------
   Microphone: blow detection
   --------------------------- */

let audioContext, analyser, dataArray, source;
let listening = false;
let blowDetected = false;

async function startMicListening(){
  if(listening) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video:false });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    dataArray = new Float32Array(analyser.fftSize);
    listening = true;
    monitorMic();
  } catch(err) {
    console.warn('mic start error', err);
    throw err;
  }
}

// compute RMS of time domain to measure loudness
function computeRMS(samples){
  let sum = 0;
  for(let i=0;i<samples.length;i++){
    const v = samples[i];
    sum += v*v;
  }
  return Math.sqrt(sum / samples.length);
}

let blowBuffer = 0;
function monitorMic(){
  if(!analyser) return;
  analyser.getFloatTimeDomainData(dataArray);
  const rms = computeRMS(dataArray);
  // console.log(rms.toFixed(4))
  // Blow detection heuristic:
  // - Person blowing near mic produces a stronger low-frequency hump; RMS above threshold sustained
  const THRESH = 0.02; // tweak if needed
  if(rms > THRESH){
    blowBuffer += 1;
  } else {
    blowBuffer = Math.max(0, blowBuffer - 1);
  }

  // If buffer sustained (e.g., ~7 frames ~140ms at 60fps), consider blow
  if(blowBuffer > 6 && !blowDetected){
    blowDetected = true;
    triggerCelebration();
    // stop listening to avoid repeated triggers
    if(source && source.mediaStream) {
      source.mediaStream.getTracks().forEach(t => t.stop());
    }
  }

  // keep monitoring until blowDetected
  if(!blowDetected) requestAnimationFrame(monitorMic);
}

/* ---------------------------
   Celebration: confetti & fireworks
   --------------------------- */

let particles = [];
let fireworks = [];
const GRAV = 0.18;

function random(min, max){ return Math.random()*(max-min)+min; }

function Particle(x,y,vx,vy, size, color, life, type='confetti'){
  this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.size=size;this.color=color;this.life=life;this.age=0;this.type=type;
}
Particle.prototype.update = function(){
  this.vy += (this.type==='confetti'?GRAV*0.9:GRAV*0.12);
  this.x += this.vx;
  this.y += this.vy;
  this.age++;
}
Particle.prototype.draw = function(ctx){
  if(this.type==='confetti'){
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.age*0.12);
    ctx.fillStyle=this.color;
    ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size*1.6);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.globalAlpha = Math.max(0,1 - this.age/this.life);
    ctx.fillStyle = this.color;
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function spawnConfetti(x,y,amount=80){
  const colors = ['#ff8fc4','#5dd0ff','#ffd66b','#9ee37a','#c89cff'];
  for(let i=0;i<amount;i++){
    const angle = random(0,Math.PI*2);
    const speed = random(2,8);
    const p = new Particle(x, y, Math.cos(angle)*speed, Math.sin(angle)*speed - 4, random(6,12), colors[Math.floor(Math.random()*colors.length)], 140, 'confetti');
    particles.push(p);
  }
}
function spawnFirework(x,y, color){
  // create many small spark particles
  const count = 40;
  for(let i=0;i<count;i++){
    const ang = Math.random()*Math.PI*2;
    const sp = new Particle(x, y, Math.cos(ang)*random(1.8,6.5), Math.sin(ang)*random(1.8,6.5), random(2,4), color, 100, 'spark');
    particles.push(sp);
  }
}

let fxTime=0;
function animateFx(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  fxTime++;

  // occasionally create fireworks near top
  if(fxTime % 40 === 0){
    const x = random(canvas.width*0.2, canvas.width*0.8);
    const y = random(60, canvas.height*0.45);
    spawnFirework(x,y, `hsl(${random(0,360)}, 80%, 65%)`);
  }

  // update particles
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if(p.age > p.life || p.y > canvas.height+50) particles.splice(i,1);
  }

  // stop when no particles and fireworks were triggered for a while
  if(!celebrationActive && particles.length===0){
    cancelAnimationFrame(fxAnimId);
    fxRunning = false;
    return;
  }
  fxAnimId = requestAnimationFrame(animateFx);
}
let fxAnimId=null, fxRunning=false, celebrationActive=false;

function startFx(){
  celebrationActive = true;
  if(!fxRunning){
    fxRunning = true;
    fxAnimId = requestAnimationFrame(animateFx);
  }
}

/* ---------------------------
   Trigger: show message and FX
   --------------------------- */
function triggerCelebration(){
  // hide prompt, show message
  promptEl.classList.remove('show');
  promptEl.classList.add('hidden');
  fallback.classList.add('hidden');

  // Create big burst above cake center
  const rect = $('#cake').getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/3;

  spawnConfetti(cx, cy-60, 180);
  for(let i=0;i<6;i++){
    spawnFirework(random(cx-140,cx+140), cy - random(60,180), `hsl(${random(0,360)}, 80%, 60%)`);
  }

  startFx();

  // show message after short delay
  setTimeout(()=> {
    messageEl.classList.remove('hidden');
    messageEl.classList.add('show');
    // small extra confetti
    spawnConfetti(cx, cy-40, 90);
  }, 900);
}

/* ---------------
   Fallback button
   --------------- */
blowBtn && blowBtn.addEventListener('click', ()=>{
  if(!blowDetected){
    blowDetected = true;
    triggerCelebration();
  }
});

/* ---------------------------
   Start sequence on load
   --------------------------- */
window.addEventListener('load', () => {
  dropCakeAndCreateCandles();
});