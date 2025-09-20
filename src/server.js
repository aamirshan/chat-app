const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/mongo');
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});


const authRoutes = require('./routes/auth');
const Message = require('./models/message');
const socketAuth = require('./middlewares/socketAuth');
const { connectProducer, disconnectProducer, sendMessage } = require('./config/kafka');

connectProducer();

io.use(socketAuth);

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

io.on('connection', async (socket) => {
  console.log('a user connected');

  // Load chat history
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    socket.emit('history', messages.reverse());
  } catch (err) {
    console.error(err.message);
  }

  socket.on('chat message', async (msg) => {
    try {
      const message = {
        content: msg,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      };
      await sendMessage('chat-messages', message);
      io.emit('chat message', `${socket.user.username}: ${msg}`);
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

process.on('SIGINT', async () => {
    await disconnectProducer();
    process.exit();
});
