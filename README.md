# Chat App

This is a real-time chat application built with Node.js, Express, Socket.io, Redis, Kafka, MySQL, and MongoDB.

## Features

- Real-time messaging with Socket.io
- User authentication with MySQL
- Message persistence with MongoDB
- Scalable architecture with Redis and Kafka

## Prerequisites

- Node.js
- npm
- Docker

## Local Development Setup

This project requires MySQL, MongoDB, Redis, and Kafka to be running. The easiest way to get these services running is by using Docker.

### 1. Create a `.env` file

Copy the `.env.example` file to a new file named `.env` and update the values for your environment. The default values in `.env.example` are configured to work with the Docker commands below.

### 2. Run Services with Docker

Open a terminal and run the following commands to start each service:

**MySQL:**
```bash
docker run --name mysql-chat -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=chat_app -p 3306:3306 -d mysql:8
```

**MongoDB:**
```bash
docker run --name mongo-chat -p 27017:27017 -d mongo
```

**Redis:**
```bash
docker run --name redis-chat -p 6379:6379 -d redis
```

**Kafka:**
You'll need to start Zookeeper first, then Kafka.
```bash
docker run --name zookeeper -p 2181:2181 -d confluentinc/cp-zookeeper:7.0.1
docker run --name kafka -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 -d confluentinc/cp-kafka:7.0.1
```
*Note: On some systems, you may need to replace `localhost` in the `KAFKA_ADVERTISED_LISTENERS` variable with your machine's IP address.*

### 3. Database Migration

Connect to your MySQL instance and run the following SQL command to create the `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aamirshan/chat-app.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root directory. See `.env.example` for a template.

## Running the app

To run the application, you need to start both the web server and the Kafka consumer.

### Start the web server

```bash
npm start
```

The server will start on `http://localhost:3000`.

### Start the Kafka consumer

In a separate terminal, run:

```bash
npm run start:consumer
```

This will start the consumer service, which will listen for messages from Kafka and save them to MongoDB.
