// Simple Socket.IO server to broadcast match status updates

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

app.post("/match-updated", (req, res) => {
  const { id, status } = req.body || {};

  if (!id || !status) {
    return res.status(400).json({ error: "id and status are required" });
  }

  io.emit("matchUpdated", { id, status });

  return res.json({ ok: true });
});

const PORT = process.env.SOCKET_PORT || 4000;

server.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});
