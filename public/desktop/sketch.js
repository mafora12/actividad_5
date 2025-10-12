let socket;
let trails = [];
let song, fft, amplitude;
let reactiveGlow = 0; // ✅ Declarada global

function preload() {
  song = loadSound('/Camille Saint-Saëns - Danse Macabre.mp3'); // asegúrate de que el archivo esté en la misma carpeta o ajusta la ruta
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0);
  noStroke();

  socket = io();

  socket.on('connect', () => console.log('🖥️ Conectado al servidor'));

  socket.on('paint', (data) => {
    trails.push({
      x: data.x * (width / 300),
      y: data.y * (height / 400),
      color: data.color,
      life: 255,
    });
  });

  fft = new p5.FFT(0.8, 64);
  amplitude = new p5.Amplitude();
}

function draw() {
  background(0, 0.1);

  let level = 0;
  if (song.isPlaying()) {
    level = amplitude.getLevel();
    reactiveGlow = lerp(reactiveGlow, map(level, 0, 0.3, 10, 80), 0.1);
  }

  // Dibujar trails
  for (let i = 0; i < trails.length; i++) {
    const t = trails[i];
    drawingContext.shadowBlur = reactiveGlow;
    drawingContext.shadowColor = t.color;
    fill(t.color);
    const size = map(level, 0, 0.3, 30, 80); // reutilizamos level
    ellipse(t.x, t.y, size);
    t.life -= 3;
  }

  // Filtrar trails muertos fuera del loop
  trails = trails.filter(t => t.life > 0);

  drawingContext.shadowBlur = 0;

  if (song.isPlaying()) drawSpectrumOptimized();
}

function drawSpectrumOptimized() {
  let spectrum = fft.analyze();
  noStroke();
  const len = spectrum.length;
  for (let i = 0; i < len; i++) {
    let x = map(i, 0, len, 0, width);
    let h = -height / 6 + map(spectrum[i], 0, 255, 0, height / 6);
    fill(map(i, 0, len, 180, 300), 100, 100, 0.4);
    rect(x, height, width / len, h);
  }
}

function mousePressed() {
  if (!song.isPlaying()) {
    userStartAudio();
    song.loop();
  } else {
    song.pause();
  }
}

