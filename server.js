// 🌈 COLOR JAM SERVER - Integración total con micro:bit
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

// Sirve la carpeta public (donde está tu index.html y sketch.js)
app.use(express.static("public"));

// 💻 WebSocket conexión general
io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado");

  // 🎨 Datos del móvil
  socket.on("mobileData", (data) => {
    io.emit("mobileData", data);
  });

  // 🧠 Datos del micro:bit enviados manualmente (opcional)
  socket.on("microbitData", (data) => {
    io.emit("microbitData", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

// 🧩 MICRO:BIT vía Puerto Serial (ajusta el COM según tu PC)
const portPath = "COM13"; // ⬅️ cambia este número si tu micro:bit usa otro puerto
const serial = new SerialPort({ path: portPath, baudRate: 115200 });
const parser = serial.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (line) => {
  try {
    const data = JSON.parse(line);
    io.emit("microbitData", data); // 📡 Enviar a todos los clientes conectados
    console.log("📤 microbitData:", data);
  } catch (err) {
    console.log("⚠️ Error leyendo micro:bit:", err);
  }
});

server.listen(port, () => {
  console.log(`🚀 Servidor en: http://localhost:${port}`);
  console.log("🔌 Esperando datos del micro:bit en", portPath);
});
