let socket;
let trails = [];
let song, fft, amplitude;
let reactiveGlow = 0;
let circleColor = "hsl(0, 0%, 100%)"; // color inicial (blanco)


let phoneData = { x: 0, y: 0, color: "hsl(0,100%,100%)", touch: false };
let microData = { accel: 0, buttonA: false, buttonB: false, shake: false };

let bgGraphics;
let starPositions = [];

function preload() {
  song = loadSound("/Camille Saint-Saëns - Danse Macabre.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();

  // 🎨 Fondo degradado tipo supernova con estrellas
  bgGraphics = createGraphics(width, height);
  drawBackground(bgGraphics);

  socket = io();
  socket.on("connect", () => console.log("🖥️ Conectado al servidor"));

socket.on("mobileData", (data) => {
  phoneData = data;
  trails.push({
    x: data.x,
    y: data.y,
    color: circleColor, // 👈 usa el color actual
    life: 255,
  });
  if (trails.length > 50) trails.shift();
});


  socket.on("microbitData", (data) => (microData = data));

  fft = new p5.FFT(0.8, 64);
  amplitude = new p5.Amplitude();
}

function draw() {
  image(bgGraphics, 0, 0);

  let level = 0;
  if (song.isPlaying()) {
    level = amplitude.getLevel();
    reactiveGlow = lerp(reactiveGlow, map(level, 0, 0.3, 5, 40), 0.1);
  }

  // ✨ Dibujar partículas con borde amarillo reactivo
  for (let i = trails.length - 1; i >= 0; i--) {
    const t = trails[i];
    drawReactiveCircle(t.x, t.y, map(level, 0, 0.3, 50, 110), t.life, level);
    t.life -= 4;
    if (t.life <= 0) trails.splice(i, 1);
  }

if (microData.buttonA) {
  console.log("🎵 Botón A detectado");
  circleColor = "hsl(300, 100%, 70%)"; // 💜 magenta brillante
  fill(300, 100, 70, 0.8);
  ellipse(random(width), random(height), random(50, 120));
}

if (microData.shake) {
      console.log("💥 Agitado!");
     for (let i = 0; i < 10; i++) {
       fill(random(180, 300), 255, 255, 0.6);
     ellipse(random(width), random(height), random(10, 40));
  }
}

  if (song.isPlaying()) drawSpectrum();
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

// 🌌 Fondo supernova (morados + blanco + estrellas)
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

  pg.noStroke();
  for (let i = 0; i < 200; i++) {
    pg.fill(255, random(100, 255));
    let x = random(width);
    let y = random(height);
    pg.ellipse(x, y, random(1, 3));
  }
}

// 🌟 Círculo con degradado suave solo en el borde (amarillo reactivo)
function drawReactiveCircle(x, y, size, alpha, level) {
  // brillo dinámico según nivel de música
  let bright = map(level, 0, 0.3, 60, 100);
  let edgeColor = color(50, 100, bright); // amarillo reactivo
  let centerColor = color(0, 0, 100); // blanco puro

  let g = drawingContext.createRadialGradient(x, y, size * 0.3, x, y, size / 2);
  g.addColorStop(0, `hsla(0,0%,100%,${alpha / 255})`);
  g.addColorStop(0.7, `hsla(50,100%,${bright}%,${alpha / 400})`);
  g.addColorStop(1, "rgba(255,255,255,0)");

  drawingContext.fillStyle = g;
  ellipse(x, y, size);
}

// 🎵 Reproducir o pausar música
function keyPressed() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    userStartAudio();
    song.loop();
  }
}
