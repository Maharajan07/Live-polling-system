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
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve build in production (unchanged)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

// store current poll and history
let poll = null;
let pollsHistory = []; // keep all created polls (with votes updated)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // send active poll if present
  if (poll) {
    socket.emit('pollData', poll);
  }

  socket.on('createPoll', (data) => {
    // Create server-side poll with id
    poll = {
      id: Date.now(),
      question: data.question,
      options: data.options.map(o => ({ text: o.text, votes: o.votes || 0 })),
      duration: data.duration || 15,
      createdAt: Date.now(),
    };

    // push a deep copy into history
    pollsHistory.push(JSON.parse(JSON.stringify(poll)));

    console.log('Poll created:', poll);

    // Broadcast new poll to everyone (students & teacher)
    io.emit('pollData', poll);

    // Also emit updateResult so UI can show zeros immediately
    io.emit('updateResult', poll);
  });

  socket.on('submitVote', (answerIndex) => {
    if (poll && poll.options[answerIndex]) {
      poll.options[answerIndex].votes += 1;

      // update the corresponding poll in history by id
      const hIndex = pollsHistory.findIndex(p => p.id === poll.id);
      if (hIndex !== -1) {
        pollsHistory[hIndex].options = poll.options.map(o => ({ ...o }));
      }

      console.log(`Vote received for option ${answerIndex}:`, poll);

      // Broadcast only updateResult (not pollData) so clients don't reset answered state
      io.emit('updateResult', poll);
    }
  });

  // For the "askQuestion" event (if used), treat the same as createPoll
  socket.on('askQuestion', (questionData) => {
    poll = {
      id: Date.now(),
      question: questionData.text,
      options: questionData.options.map(opt => ({ text: opt, votes: 0 })),
      duration: questionData.duration || 15,
      createdAt: Date.now(),
    };

    pollsHistory.push(JSON.parse(JSON.stringify(poll)));
    io.emit('pollData', poll);
    io.emit('updateResult', poll);
  });

  socket.on('getPollHistory', () => {
    // send the full history to the requester
    socket.emit('pollHistory', pollsHistory);
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
