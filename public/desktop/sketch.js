let socket;
let trails = [];
let song, fft, amplitude;
let reactiveGlow = 0;
let circleColor = "hsl(0, 0%, 100%)";
let magentaMode = false;
let grayMode = false; // 🩶 modo gris activado con botón B

let phoneData = { x: 0, y: 0, color: "hsl(0,100%,100%)", touch: false };
let microData = { accel: 0, buttonA: false, buttonB: false, shake: false };

let bgGraphics;
let starPositions = [];
let cyanBursts = []; // 💥 destellos animados

function preload() {
  song = loadSound("/Camille Saint-Saëns - Danse Macabre.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();

  bgGraphics = createGraphics(width, height);
  drawBackground(bgGraphics);

  socket = io();
  socket.on("connect", () => console.log("🖥️ Conectado al servidor"));

  socket.on("mobileData", (data) => {
    phoneData = data;
    trails.push({
      x: data.x,
      y: data.y,
      color: circleColor,
      life: 255,
    });
    if (trails.length > 50) trails.shift();
  });

  socket.on("microbitData", (data) => {
    // Botón A → alterna color del círculo
    if (data.buttonA && !microData.buttonA) {
      magentaMode = !magentaMode;
      circleColor = magentaMode
        ? "hsl(300, 100%, 70%)"
        : "hsl(0, 0%, 100%)";
      console.log(magentaMode ? "🌸 Modo magenta activado" : "⚪ Modo blanco restaurado");
    }

    // Botón B → alterna fondo entre color y gris
    if (data.buttonB && !microData.buttonB) {
      grayMode = !grayMode;
      if (grayMode) {
        drawGrayBackground(bgGraphics);
        console.log("🌫️ Fondo gris activado");
      } else {
        drawBackground(bgGraphics);
        console.log("🌌 Fondo original restaurado");
      }
    }

    // Shake → genera destellos animados
    if (data.shake) {
      console.log("💥 Agitado!");
      createCyanBursts();
    }

    microData = data;
  });

  fft = new p5.FFT(0.8, 64);
  amplitude = new p5.Amplitude();
}

function draw() {
  image(bgGraphics, 0, 0);

  let level = song.isPlaying() ? amplitude.getLevel() : 0;

  // ✨ Dibujar partículas del teléfono
  for (let i = trails.length - 1; i >= 0; i--) {
    const t = trails[i];
    drawReactiveCircle(t.x, t.y, map(level, 0, 0.3, 50, 110), t.life, level);
    t.life -= 4;
    if (t.life <= 0) trails.splice(i, 1);
  }

  // 💥 Dibujar y actualizar destellos animados
  for (let i = cyanBursts.length - 1; i >= 0; i--) {
    let b = cyanBursts[i];
    let g = drawingContext.createRadialGradient(b.x, b.y, b.size * 0.2, b.x, b.y, b.size);
    g.addColorStop(0, `hsla(180, 100%, 80%, ${b.alpha / 255})`);
    g.addColorStop(1, "rgba(0,255,255,0)");
    drawingContext.fillStyle = g;
    ellipse(b.x, b.y, b.size);

    b.alpha -= 5; // se desvanece
    if (b.alpha <= 0) cyanBursts.splice(i, 1);
  }

  if (song.isPlaying()) drawSpectrum();
}

// 💥 Crear destellos cian animados
function createCyanBursts() {
  let level = amplitude.getLevel();
  let count = int(map(level, 0, 0.4, 5, 25));
  for (let i = 0; i < count; i++) {
    cyanBursts.push({
      x: random(width),
      y: random(height),
      size: random(60, 200),
      alpha: 255,
    });
  }
}

// 🌟 Círculo reactivo
function drawReactiveCircle(x, y, size, alpha, level) {
  let bright = map(level, 0, 0.3, 60, 100);
  let g = drawingContext.createRadialGradient(x, y, size * 0.3, x, y, size / 2);
  g.addColorStop(0, `${circleColor}`);
  g.addColorStop(0.7, `hsla(50,100%,${bright}%,${alpha / 300})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  drawingContext.fillStyle = g;
  ellipse(x, y, size);
}

// 🌌 Fondo original (morados + blanco)
function drawBackground(pg) {
  pg.colorMode(HSB);
  let centerColor = color(280, 50, 100);
  let edgeColor = color(300, 80, 20);
  for (let r = 0; r < width; r++) {
    let inter = map(r, 0, width, 0, 1);
    let c = lerpColor(centerColor, edgeColor, inter);
    pg.stroke(c);
    pg.line(r, 0, r, height);
  }
  drawStars(pg);
}

// 🌫️ Fondo gris
function drawGrayBackground(pg) {
  pg.colorMode(HSB);
  let centerColor = color(0, 0, 80);
  let edgeColor = color(0, 0, 20);
  for (let r = 0; r < width; r++) {
    let inter = map(r, 0, width, 0, 1);
    let c = lerpColor(centerColor, edgeColor, inter);
    pg.stroke(c);
    pg.line(r, 0, r, height);
  }
  drawStars(pg);
}

// ✨ Estrellas
function drawStars(pg) {
  pg.noStroke();
  for (let i = 0; i < 200; i++) {
    pg.fill(255, random(100, 255));
    pg.ellipse(random(width), random(height), random(1, 3));
  }
}

function drawSpectrum() {
  let spectrum = fft.analyze();
  noStroke();
  const len = spectrum.length;
  for (let i = 0; i < len; i++) {
    let x = map(i, 0, len, 0, width);
    let h = -height / 6 + map(spectrum[i], 0, 255, 0, height / 6);
    fill(map(i, 0, len, 180, 300), 100, 100, 0.25);
    rect(x, height, width / len, h);
  }
}

// 🎵 Play / pausa
function keyPressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    userStartAudio();
    song.loop();
  }
}
