const messageService = require('../services/messageService');
const chatStore = require('../data/chatStore');

describe('messageService', () => {
  beforeEach(async () => {
    await chatStore.clearBufferedMessages('A');
    await chatStore.clearBufferedMessages('B');
  });

  test('getChatHistory returns correct messages', async () => {
    await chatStore.storeMessage('A', 'B', 'Test', 1);
    const messages = await messageService.getChatHistory('A', 'B');
    expect(messages.length).toBe(1);
    expect(messages[0].message).toBe('Test');
  });
}); 