let socket;
let lastX = null;
let lastY = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  socket = io();

  socket.on('connect', () => console.log('📲 Conectado al servidor'));
}

function touchMoved() {
  const dx = mouseX - (lastX ?? mouseX);
  const dy = mouseY - (lastY ?? mouseY);
  const speed = sqrt(dx * dx + dy * dy);

  const hue = map(mouseX, 0, width, 0, 360);
  const brightness = map(speed, 0, 50, 50, 100);

  const colorData = {
    type: 'paint',
    x: mouseX,
    y: mouseY,
    color: `hsl(${hue}, 100%, ${brightness}%)`,
    velocity: speed
  };

  socket.emit('paint', colorData);

  fill(colorData.color);
  noStroke();
  ellipse(mouseX, mouseY, 30);
  lastX = mouseX;
  lastY = mouseY;

  return false;
}

function draw() {
  fill(0, 20);
  rect(0, 0, width, height);
}
