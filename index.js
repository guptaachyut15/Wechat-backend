const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (msg) => {
    socket.broadcast.emit("send", { name: users[socket.id], msg: msg });
  });

  socket.on("disconnect", () => {
    const disconnectedUser = users[socket.id];
    socket.broadcast.emit("user-left", disconnectedUser);
    delete users[socket.id];
  });
});

server.listen(8080, () => {
  console.log(`Listening on port 8080`);
});
