// index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // adjust if needed
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Serve build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(buildPath));
  app.get("*", (req, res) =>
    res.sendFile(path.join(buildPath, "index.html"))
  );
}

// ---------- POLL STATE ----------
let poll = null;
let pollsHistory = [];

// ---------- CHAT STATE ----------
let participants = [];

// ---------- SOCKET LOGIC ----------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send active poll to new connection
  if (poll) {
    socket.emit("pollData", poll);
  }

  // -----------------
  // POLL EVENTS
  // -----------------
  socket.on("createPoll", (data) => {
    poll = {
      id: Date.now(),
      question: data.question,
      options: data.options.map((o) => ({
        text: o.text,
        votes: o.votes || 0,
      })),
      duration: data.duration || 15,
      createdAt: Date.now(),
    };

    pollsHistory.push(JSON.parse(JSON.stringify(poll)));
    io.emit("pollData", poll);
    io.emit("updateResult", poll);
  });

  socket.on("submitVote", (answerIndex) => {
    if (poll && poll.options[answerIndex]) {
      poll.options[answerIndex].votes += 1;

      const hIndex = pollsHistory.findIndex((p) => p.id === poll.id);
      if (hIndex !== -1) {
        pollsHistory[hIndex].options = poll.options.map((o) => ({ ...o }));
      }

      io.emit("updateResult", poll);
    }
  });

  socket.on("askQuestion", (questionData) => {
    poll = {
      id: Date.now(),
      question: questionData.text,
      options: questionData.options.map((opt) => ({ text: opt, votes: 0 })),
      duration: questionData.duration || 15,
      createdAt: Date.now(),
    };

    pollsHistory.push(JSON.parse(JSON.stringify(poll)));
    io.emit("pollData", poll);
    io.emit("updateResult", poll);
  });

  socket.on("getPollHistory", () => {
    socket.emit("pollHistory", pollsHistory);
  });

  // -----------------
  // CHAT EVENTS
  // -----------------
  socket.on("joinUser", ({ name, role }) => {
    // Avoid duplicates if reconnect
    participants = participants.filter((p) => p.id !== socket.id);

    const user = { id: socket.id, name, role };
    participants.push(user);

    io.emit("participants", participants);
    console.log(`${name} (${role}) joined. Total: ${participants.length}`);
  });

  socket.on("chatMessage", (msg) => {
    const sender = participants.find((p) => p.id === socket.id);
    if (!sender) {
      console.log("Message from unknown sender:", socket.id);
      return;
    }

    const messageData = {
      name: sender.name,
      role: sender.role,
      text: msg.text?.trim(),
      time: new Date().toISOString(),
    };

    io.emit("chatMessage", messageData);
  });

  socket.on("kickUser", (userId) => {
    io.to(userId).disconnectSockets(true);
    participants = participants.filter((p) => p.id !== userId);
    io.emit("participants", participants);
  });

  // -----------------
  // DISCONNECT
  // -----------------
  socket.on("disconnect", () => {
    const leavingUser = participants.find((p) => p.id === socket.id);
    participants = participants.filter((p) => p.id !== socket.id);
    io.emit("participants", participants);
    if (leavingUser) {
      console.log(`${leavingUser.name} (${leavingUser.role}) disconnected.`);
    } else {
      console.log(`Client disconnected: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);
