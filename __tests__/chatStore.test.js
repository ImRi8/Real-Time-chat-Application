const chatStore = require('../data/chatStore');

describe('chatStore', () => {
  beforeEach(async () => {
    await chatStore.clearBufferedMessages('A');
    await chatStore.clearBufferedMessages('B');
  });

  test('stores and retrieves messages', async () => {
    await chatStore.storeMessage('A', 'B', 'Hello', 1);
    const history = await chatStore.getChatHistory('A', 'B');
    expect(history.length).toBe(1);
    expect(history[0].message).toBe('Hello');
  });

  test('buffers and clears messages', async () => {
    await chatStore.bufferMessage('B', { from: 'A', to: 'B', message: 'Offline', timestamp: 2 });
    let buffered = await chatStore.getBufferedMessages('B');
    expect(buffered.length).toBe(1);
    await chatStore.clearBufferedMessages('B');
    buffered = await chatStore.getBufferedMessages('B');
    expect(buffered.length).toBe(0);
  });
}); 