const { connectConsumer, subscribe, disconnectConsumer } = require('./config/kafka');
const connectDB = require('./config/mongo');
const Message = require('./models/message');

const main = async () => {
    try {
        await connectDB();
        await connectConsumer();
        await subscribe('chat-messages', async (message) => {
            try {
                const newMessage = new Message({
                    content: message.content,
                    sender: message.senderId,
                    recipient: message.recipientId,
                    createdAt: message.timestamp
                });
                await newMessage.save();
                console.log('Message saved to MongoDB:', message);
            } catch (error) {
                console.error('Error saving message to MongoDB:', error);
            }
        });

        console.log("Kafka consumer is running...");

        const errorTypes = ['unhandledRejection', 'uncaughtException'];
        errorTypes.forEach(type => {
            process.on(type, async e => {
                try {
                    console.log(`process.on ${type}`);
                    console.error(e);
                    await disconnectConsumer();
                    process.exit(1);
                } catch (_) {
                    process.exit(1);
                }
            });
        });

        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
        signalTraps.forEach(type => {
            process.once(type, async () => {
                try {
                    console.log(`Received ${type}, disconnecting consumer...`);
                    await disconnectConsumer();
                    console.log("Consumer disconnected.");
                } finally {
                    process.kill(process.pid, type);
                }
            });
        });

    } catch (error) {
        console.error("Consumer failed to start:", error);
        process.exit(1);
    }
};

main();
