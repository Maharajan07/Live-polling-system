// index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // during dev; won't matter after serving build
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ===== Serve React build =====
const buildPath = path.join(__dirname,'client', 'dist'); // adjust if your build folder is elsewhere
app.use(express.static(buildPath));

// Store the current active poll in memory
let poll = null;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  if (poll) {
    socket.emit('pollData', poll);
  }

  socket.on('createPoll', (data) => {
    poll = {
      id: Date.now(),
      question: data.question,
      options: data.options // already in correct shape
    };
    console.log('Poll created:', poll);
    io.emit('pollData', poll);
  });

  socket.on('submitVote', (answerIndex) => {
    if (poll && poll.options[answerIndex]) {
      poll.options[answerIndex].votes += 1;
      console.log(`Vote received for option ${answerIndex}:`, poll);
      io.emit('pollData', poll);
    }
  });

  socket.on('joinStudent', (studentName) => {
    console.log(`Student joined: ${studentName}`);
    if (poll) {
      socket.emit('pollData', poll);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback to React's index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
