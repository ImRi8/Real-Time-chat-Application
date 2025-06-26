const express = require('express');
const request = require('supertest');
const messageController = require('../controllers/messageController');
const chatStore = require('../data/chatStore');

const app = express();
app.get('/messages', messageController.getMessages);

describe('messageController', () => {
  beforeEach(async () => {
    await chatStore.clearBufferedMessages('A');
    await chatStore.clearBufferedMessages('B');
  });

  test('GET /messages returns chat history', async () => {
    await chatStore.storeMessage('A', 'B', 'REST Test', 1);
    const res = await request(app).get('/messages?user1=A&user2=B');
    expect(res.statusCode).toBe(200);
    expect(res.body.messages.length).toBe(1);
    expect(res.body.messages[0].message).toBe('REST Test');
  });

  test('GET /messages missing params returns 400', async () => {
    const res = await request(app).get('/messages');
    expect(res.statusCode).toBe(400);
  });
}); 