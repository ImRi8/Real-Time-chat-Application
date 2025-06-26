const chatStore = require('../data/chatStore');
const logger = require('../utils/logger');

function initChatSocket(io) {
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;
    if (!userId) {
      logger.error('Connection attempt without userId');
      socket.disconnect();
      return;
    }
    chatStore.addConnection(userId, socket);
    logger.info(`User ${userId} connected`);

    // Deliver buffered messages if any
    (async () => {
      const buffered = await chatStore.getBufferedMessages(userId);
      logger.info(`Buffered messages for ${userId} on connect: ${JSON.stringify(buffered)}`);
      if (buffered.length > 0) {
        buffered.forEach((msg) => {
          socket.emit('message', msg, () => {
            logger.info(`Delivered buffered message to ${userId}: ${JSON.stringify(msg)}`);
          });
        });
        await chatStore.clearBufferedMessages(userId);
        logger.info(`Cleared buffered messages for ${userId}`);
      }
    })();

    socket.on('message', async (data, ack) => {
      const { to, message } = data;
      const timestamp = Date.now();
      const msgObj = { from: userId, to, message, timestamp };
      // Always store the message
      await chatStore.storeMessage(userId, to, message, timestamp);
      logger.info(`Stored message from ${userId} to ${to}: ${message}`);
      const recipientSocket = chatStore.getConnection(to);
      // Only deliver to recipient if recipient is not the sender
      if (recipientSocket && to !== userId) {
        recipientSocket.emit('message', msgObj, () => {
          logger.info(`Delivered message to ${to}: ${JSON.stringify(msgObj)}`);
        });
      } else if (!recipientSocket) {
        await chatStore.bufferMessage(to, msgObj);
        logger.info(`Buffered message for offline user ${to}: ${JSON.stringify(msgObj)}`);
        const currentBuffer = await chatStore.getBufferedMessages(to);
        logger.info(`Current buffer for ${to}: ${JSON.stringify(currentBuffer)}`);
      }
      if (ack) ack({ status: 'ok', message: 'Message stored and delivered/buffered.' });
    });

    socket.on('disconnect', () => {
      chatStore.removeConnection(userId);
      logger.info(`User ${userId} disconnected`);
    });
  });
}

module.exports = initChatSocket;
