const { Kafka } = require('kafkajs');
const dotenv = require('dotenv');

dotenv.config();

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: process.env.KAFKA_BROKERS.split(','),
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
};

const disconnectProducer = async () => {
  await producer.disconnect();
};

const sendMessage = async (topic, message) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

const consumer = kafka.consumer({ groupId: 'chat-group' });

const connectConsumer = async () => {
    await consumer.connect();
}

const disconnectConsumer = async () => {
    await consumer.disconnect();
}

const subscribe = async (topic, callback) => {
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            callback(JSON.parse(message.value.toString()));
        }
    });
}


module.exports = {
  connectProducer,
  disconnectProducer,
  sendMessage,
  connectConsumer,
  disconnectConsumer,
  subscribe
};
