const messageService = require('../services/messageService');
const logger = require('../utils/logger');

async function getMessages(req, res) {
  const { user1, user2 } = req.query;
  logger.info(`REST API called: GET /messages?user1=${user1}&user2=${user2}`);
  if (!user1 || !user2) {
    logger.error('Missing user1 or user2 in query params');
    return res.status(400).json({ error: 'user1 and user2 are required' });
  }
  const messages = await messageService.getChatHistory(user1, user2);
  logger.info(`Messages retrieved for ${user1} and ${user2}`);
  res.json({ messages });
}

module.exports = {
  getMessages,
}; 