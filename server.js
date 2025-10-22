// 🌈 COLOR JAM SERVER - Integración total
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("🟢 Nuevo cliente conectado");

  // 🎨 Datos del móvil (pintura + sensores)
  socket.on("mobileData", (data) => {
    io.emit("mobileData", data); // reenvía a todos (desktop incluido)
  });

  // 🧠 Datos del micro:bit
  socket.on("microbitData", (data) => {
    io.emit("microbitData", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor en: http://localhost:${port}`);
});
