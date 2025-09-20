const { connectConsumer, subscribe, disconnectConsumer } = require('./src/config/kafka');
const connectDB = require('./src/config/mongo');
const Message = require('./src/models/message');

const startConsumer = async () => {
    await connectDB();
    await connectConsumer();
    await subscribe('chat-messages', async (message) => {
        const newMessage = new Message({
            content: message.content,
            username: message.username,
            createdAt: message.timestamp
        });
        await newMessage.save();
        console.log('Message saved to MongoDB:', message);
    });
};

startConsumer();

process.on('SIGINT', async () => {
    await disconnectConsumer();
    process.exit();
});
