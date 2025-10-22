// script.js (robust replacement)
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Helper selectors
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const cake = $('#cake');
  const layers = $$('.layer'); // safer: select all elements with class "layer"
  const candlesContainer = $('#candles');
  const promptEl = $('#prompt');
  const fallback = $('#fallback');
  const blowBtn = $('#blow-btn');
  const messageEl = $('#message');
  const canvas = $('#fx-canvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  // Basic defensive checks
  console.log('[birthday] DOM ready. Found elements:', {
    cakeExists: !!cake,
    layerCount: layers.length,
    candlesExists: !!candlesContainer,
    promptExists: !!promptEl,
    canvasExists: !!canvas
  });

  // ensure canvas sizing
  function resizeCanvas(){
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // If no layers found, bail and show console message
  if(layers.length === 0){
    console.error('[birthday] No .layer elements found. Check your HTML markup.');
    return;
  }

  // Drop animation + create candles
  function dropCakeAndCreateCandles(){
    // Apply drop class to each layer simultaneously
    layers.forEach(l => {
      // force reflow then add class (improves animation consistency)
      void l.offsetWidth;
      l.classList.add('drop');
    });

    // create 22 candles if container exists
    const n = 22;
    if(candlesContainer){
      candlesContainer.innerHTML = '';
      for(let i=0;i<n;i++){
        const c = document.createElement('div');
        c.className = 'candle';
        c.style.animationDelay = `${(Math.random()*0.6).toFixed(2)}s`;
        candlesContainer.appendChild(c);
      }
    } else {
      console.warn('[birthday] #candles container missing; skipping candle creation.');
    }

    // reveal prompt after short delay
    setTimeout(()=> {
      if(promptEl){
        promptEl.classList.remove('hidden');
        promptEl.classList.add('show');
      }
      // attempt to start mic; if fails, show fallback
      startMicListening().catch(()=> {
        if(fallback) fallback.classList.remove('hidden');
      });
    }, 1100);
  }

  // ---------- Microphone blow detection (kept from original) ----------
  let audioContext, analyser, dataArray, source;
  let listening = false;
  let blowDetected = false;

  async function startMicListening(){
    if(listening) return;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      console.warn('[birthday] getUserMedia not supported in this browser.');
      throw new Error('Mic not supported');
    }
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
      console.warn('[birthday] Mic permission denied or error:', err);
      throw err;
    }
  }

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
    const THRESH = 0.02; // tweak if needed
    if(rms > THRESH){
      blowBuffer += 1;
    } else {
      blowBuffer = Math.max(0, blowBuffer - 1);
    }
    if(blowBuffer > 6 && !blowDetected){
      blowDetected = true;
      triggerCelebration();
      // stop tracks
      try {
        if(source && source.mediaStream) {
          source.mediaStream.getTracks().forEach(t => t.stop());
        }
      } catch(e){ /* ignore */ }
    }
    if(!blowDetected) requestAnimationFrame(monitorMic);
  }

  // ---------- Simple confetti/fireworks (kept minimal) ----------
  let particles = [];
  let fxRunning = false;
  function random(min,max){ return Math.random()*(max-min)+min; }

  function Particle(x,y,vx,vy,size,color,life,type='confetti'){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.size=size;this.color=color;this.life=life;this.age=0;this.type=type;
  }
  Particle.prototype.update = function(){ this.vy += (this.type==='confetti'?0.18*0.9:0.18*0.12); this.x+=this.vx; this.y+=this.vy; this.age++; }
  Particle.prototype.draw = function(c){
    if(!c) return;
    if(this.type==='confetti'){
      c.save(); c.translate(this.x,this.y); c.rotate(this.age*0.12); c.fillStyle=this.color; c.fillRect(-this.size/2,-this.size/2,this.size,this.size*1.6); c.restore();
    } else {
      c.beginPath(); c.globalAlpha = Math.max(0,1 - this.age/this.life); c.fillStyle=this.color; c.arc(this.x,this.y,this.size,0,Math.PI*2); c.fill(); c.globalAlpha = 1;
    }
  }

  function spawnConfetti(x,y,amount=80){
    const colors = ['#ff8fc4','#5dd0ff','#ffd66b','#9ee37a','#c89cff'];
    for(let i=0;i<amount;i++){
      const ang = random(0,Math.PI*2); const sp = new Particle(x,y,Math.cos(ang)*random(2,8),Math.sin(ang)*random(2,8)-4,random(6,12),colors[Math.floor(Math.random()*colors.length)],140,'confetti');
      particles.push(sp);
    }
  }
  function spawnFirework(x,y,color){
    for(let i=0;i<40;i++){
      const ang = Math.random()*Math.PI*2;
      particles.push(new Particle(x,y,Math.cos(ang)*random(1.8,6.5),Math.sin(ang)*random(1.8,6.5),random(2,4),color,100,'spark'));
    }
  }

  let fxAnimId = null;
  function animateFx(){
    if(!canvas || !ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // occasionally
    if(Math.random() < 0.03) spawnFirework(random(canvas.width*0.2,canvas.width*0.8), random(60, canvas.height*0.45), `hsl(${random(0,360)},80%,65%)`);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i]; p.update(); p.draw(ctx);
      if(p.age > p.life || p.y > canvas.height + 50) particles.splice(i,1);
    }
    if(particles.length>0) fxAnimId = requestAnimationFrame(animateFx);
    else { fxRunning = false; cancelAnimationFrame(fxAnimId); fxAnimId = null; }
  }

  function startFx(){
    if(!fxRunning){
      fxRunning = true;
      if(canvas) animateFx();
    }
  }

  // ---------- Celebration trigger ----------
  function triggerCelebration(){
    if(promptEl){ promptEl.classList.remove('show'); promptEl.classList.add('hidden'); }
    if(fallback) fallback.classList.add('hidden');

    const rect = cake ? cake.getBoundingClientRect() : { left: innerWidth/2, width:0, top: innerHeight/2, height:0 };
    const cx = rect.left + rect.width/2;
    const cy = rect.top + (rect.height? rect.height/3 : 200);

    spawnConfetti(cx, cy-60, 180);
    for(let i=0;i<6;i++) spawnFirework(random(cx-140,cx+140), cy - random(60,180), `hsl(${random(0,360)},80%,60%)`);
    startFx();

    setTimeout(()=> {
      if(messageEl){ messageEl.classList.remove('hidden'); messageEl.classList.add('show'); }
      spawnConfetti(cx, cy-40, 90);
    }, 900);
  }

  // fallback button
  if(blowBtn) blowBtn.addEventListener('click', ()=>{ if(!blowDetected){ blowDetected = true; triggerCelebration(); } });

  // Start sequence
  dropCakeAndCreateCandles();
});
