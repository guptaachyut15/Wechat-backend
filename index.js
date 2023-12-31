const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { CORS_ORIGINS } = require("./config");

const { Server } = require("socket.io");
const allowedOrigins = CORS_ORIGINS.split(",");
console.log("allowed origins:", allowedOrigins);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};

app.get("/", (req, res) => {
  res.json({ msg: "On the backend page for chat app,go back!" });
});

io.on("connection", (socket) => {
  socket.on("user-joined", (name) => {
    console.log(`${name} joined`);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (msg) => {
    console.log(`${users[socket.id]} messaged`);
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
