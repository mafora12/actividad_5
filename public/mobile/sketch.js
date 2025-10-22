let socket;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  colorMode(HSB);
  noStroke();

  socket = io();
  socket.on("connect", () => console.log("📲 Conectado al servidor"));
}

function touchMoved() {
  const hue = map(mouseX, 0, width, 180, 300);
  const brightness = map(mouseY, 0, height, 80, 100);
  const colorData = `hsl(${hue}, 100%, ${brightness}%)`;

  // Envía al servidor la posición, color y movimiento
  socket.emit("mobileData", {
    x: mouseX,
    y: mouseY,
    color: colorData,
    rotationX,
    rotationY,
    touch: true,
  });

  // Feedback visual local
  fill(colorData);
  ellipse(mouseX, mouseY, 30);
  return false;
}

function draw() {
  fill(0, 0.1);
  rect(0, 0, width, height);
}
