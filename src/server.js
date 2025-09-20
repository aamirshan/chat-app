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
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const Message = require('./models/message');
const socketAuth = require('./middlewares/socketAuth');
const { connectProducer, disconnectProducer, sendMessage } = require('./config/kafka');

connectProducer();

io.use(socketAuth);

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

io.on('connection', async (socket) => {
  console.log('a user connected:', socket.user.id);

  // Join a room based on user ID for private messaging
  socket.join(socket.user.id.toString());

  socket.on('chat message', async (data) => {
    try {
      const { recipientId, content } = data;
      const senderId = socket.user.id;

      const message = {
        content,
        senderId,
        recipientId,
        timestamp: new Date().toISOString()
      };

      // Send message to Kafka for persistence
      await sendMessage('chat-messages', message);

      // Prepare message for real-time delivery
      const outboundMessage = {
        content,
        sender: { _id: senderId, username: socket.user.username }, // Assuming username is on socket.user
        recipient: { _id: recipientId }, // We don't have recipient username here
        createdAt: message.timestamp
      };

      // Emit to recipient's room
      io.to(recipientId.toString()).emit('chat message', outboundMessage);

      // Also send to sender's room so they see their own message
      // This is useful if the user is connected on multiple devices.
      io.to(senderId.toString()).emit('chat message', outboundMessage);

    } catch (err) {
      console.error('Error handling chat message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.user.id);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

process.on('SIGINT', async () => {
    await disconnectProducer();
    process.exit();
});
