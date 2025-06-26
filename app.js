const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const chatSocket = require('./sockets/chatSocket');
const messagesRoute = require('./routes/messages');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', messagesRoute);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

chatSocket(io);

const PORT = 3000;
server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}); 