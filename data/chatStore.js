// In-memory chat store for users, messages, and offline buffers
// Thread safety: Use a simple mutex for chatHistory and offlineBuffers

const userConnections = new Map(); // userId -> socket
const chatHistory = new Map();      // chatKey -> [{ from, to, message, timestamp }]
const offlineBuffers = new Map();   // userId -> [messageObj]
const logger = require('../utils/logger');

// Simple mutex for Node.js (single-threaded, but async events)
class Mutex {
  constructor() { this._lock = Promise.resolve(); }
  lock() {
    let unlockNext;
    const willLock = new Promise(resolve => unlockNext = resolve);
    const willUnlock = this._lock.then(() => unlockNext);
    this._lock = willUnlock;
    return willUnlock;
  }
}
const chatHistoryMutex = new Mutex();
const offlineBuffersMutex = new Mutex();

function getChatKey(user1, user2) {
  return [user1, user2].sort().join(':');
}

module.exports = {
  addConnection(userId, socket) {
    userConnections.set(userId, socket);
    logger.info(`Added connection for user ${userId}`);
  },
  removeConnection(userId) {
    userConnections.delete(userId);
    logger.info(`Removed connection for user ${userId}`);
  },
  getConnection(userId) {
    return userConnections.get(userId);
  },
  async storeMessage(from, to, message, timestamp) {
    const chatKey = getChatKey(from, to);
    await chatHistoryMutex.lock();
    if (!chatHistory.has(chatKey)) chatHistory.set(chatKey, []);
    chatHistory.get(chatKey).push({ from, to, message, timestamp });
    logger.info(`Stored message in chatHistory[${chatKey}]: ${message}`);
  },
  async getChatHistory(user1, user2) {
    const chatKey = getChatKey(user1, user2);
    await chatHistoryMutex.lock();
    const history = chatHistory.get(chatKey) || [];
    logger.info(`Fetched chatHistory[${chatKey}]`);
    return history;
  },
  async bufferMessage(userId, messageObj) {
    await offlineBuffersMutex.lock();
    if (!offlineBuffers.has(userId)) offlineBuffers.set(userId, []);
    offlineBuffers.get(userId).push(messageObj);
    logger.message(`Buffered message for user `, userId);
  },
  async getBufferedMessages(userId) {
    await offlineBuffersMutex.lock();
    return offlineBuffers.get(userId) || [];
  },
  async clearBufferedMessages(userId) {
    await offlineBuffersMutex.lock();
    offlineBuffers.delete(userId);
    logger.message(`Cleared buffered messages for user ${userId}`, userId);
  },
}; 