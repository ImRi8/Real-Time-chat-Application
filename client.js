const { io } = require('socket.io-client');
const readline = require('readline');
const axios = require('axios');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: ',
});

let lastSentMessage = '';  // Stores last message for ack tick

// Print a message and restore the prompt, with color
function printMessage(msg, userId) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  if (msg.from === userId) {
    console.log(chalk.white(`You: ${msg.message}`));
  } else {
    console.log(chalk.green(`${msg.from}: ${msg.message}`));
  }
  rl.prompt(true);
}

// Optional: Fetch and show history
async function fetchAndShowHistory(userId, recipientId) {
  try {
    const res = await axios.get(`http://localhost:3000/messages?user1=${userId}&user2=${recipientId}`);
    const messages = res.data.messages || [];
    if (messages.length === 0) {
      console.log('No previous messages. Start chatting!');
    } else {
      console.log('--- Chat History ---');
      messages.forEach((msg) => {
        if (msg.from === userId) {
          process.stdout.write(`You: ${msg.message}\n`);
        } else {
          process.stdout.write(`${msg.from}: ${msg.message}\n`);
        }
      });
      console.log('--------------------');
    }
  } catch (err) {
    console.log('Could not fetch chat history:', err.message);
  }
}

(async () => {
  const userId = await new Promise((resolve) => rl.question('Enter your userId: ', resolve));
  const recipientId = await new Promise((resolve) => rl.question('Enter recipient userId: ', resolve));

  let socket;
  let connected = false;

  function connectSocket() {
    socket = io('ws://localhost:3000', {
      query: { userId },
      reconnection: true,
    });

    socket.on('connect', async () => {
      if (connected) {
        console.log(`[Warning: userId '${userId}' is already connected in another terminal. Please use a unique userId per client instance.]`);
        socket.disconnect();
        process.exit(1);
      }
      connected = true;
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log(`\n[Connected as ${userId}]`);
      // await fetchAndShowHistory(userId, recipientId);
      console.log("Type your message and press Enter. Type '/exit' to quit.");
      rl.prompt();
    });

    socket.on('message', (msg) => {
      printMessage(msg, userId);
    });

    socket.on('disconnect', () => {
      connected = false;
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log('\n[Disconnected from server. Attempting to reconnect...]');
    });

    socket.on('connect_error', (err) => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log(`\n[Connection error: ${err.message}]`);
      process.exit(1);
    });
  }

  connectSocket();

  rl.on('line', (line) => {
    const message = line.trim();
    if (!message) {
      rl.prompt();
      return;
    }

    if (message === '/exit') {
      rl.close();
      if (socket) socket.disconnect();
      process.exit(0);
    }

    lastSentMessage = message;

    // Send message — display will be handled via server's message echo
    socket.emit('message', { to: recipientId, message }, (ack) => {
      if (ack && ack.status === 'ok') {
        // Move up and add tick
        readline.moveCursor(process.stdout, 0, -1); // Move up one line
        readline.clearLine(process.stdout, 0);      // Clear that line
        console.log(chalk.white(`You: ${lastSentMessage} ✔`));
        rl.prompt(true);
      }
    });
  });

  process.on('SIGINT', () => {
    rl.close();
    if (socket) socket.disconnect();
    process.exit(0);
  });
})();
