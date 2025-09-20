const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = 3000;

// memory store
const history = {};

// health checks
app.get("/", (req, res) => {
  res.type("text").send("GPS server is running. Try GET /api/health");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), historyDevices: Object.keys(history).length });
});

app.post("/api/coords", (req, res) => {
  const { deviceId, lat, lon, speedKmph, timestamp } = req.body;
  if (!deviceId || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: "deviceId, lat, lon required" });
  }

  const point = {
    deviceId,
    lat: Number(lat),
    lon: Number(lon),
    speedKmph: speedKmph ? Number(speedKmph) : null,
    timestamp: timestamp || Date.now(),
  };

  if (!history[deviceId]) history[deviceId] = [];
  history[deviceId].push(point);
  if (history[deviceId].length > 2000) history[deviceId].shift();

  // broadcast
  io.emit("location-update", point);
  return res.json({ ok: true });
});

app.get("/api/history/:deviceId", (req, res) => {
  res.json(history[req.params.deviceId] || []);
});

io.on("connection", (socket) => {
  console.log("Web client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// ⚠️ Important: 0.0.0.0 pe listen karo
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
