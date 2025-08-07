import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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

let poll = {
  question: '',
  options: [],
  votes: [],
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current poll
  socket.emit('pollData', poll);

  socket.on('createPoll', (data) => {
    poll = {
      question: data.question,
      options: data.options,
      votes: Array(data.options.length).fill(0),
    };
    io.emit('pollData', poll);
  });

  socket.on('submitVote', (index) => {
    if (poll.votes[index] !== undefined) {
      poll.votes[index]++;
      io.emit('pollData', poll);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Polling Server is running');
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
