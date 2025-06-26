const chatStore = require('../data/chatStore');
const logger = require('../utils/logger');

async function getChatHistory(user1, user2) {
  logger.info(`Service: getChatHistory called for ${user1} and ${user2}`);
  const messages = await chatStore.getChatHistory(user1, user2);
  return messages;
}

module.exports = {
  getChatHistory,
}; 