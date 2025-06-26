# Real-Time Chat Application Backend

## Functional Requirements & How They Are Handled

### 1. Real-Time Messaging via WebSocket
- Users connect via WebSocket (Socket.IO) with a unique userId.
- Messages sent from one user are delivered instantly to the other if they are online.
- The server only delivers messages to the intended recipient, not echoing to the sender.

### 2. Offline Message Handling
- If a user is offline, messages sent to them are buffered in memory.
- When the user reconnects, all buffered messages are delivered in order.

### 3. Message Acknowledgment
- Every message sent receives an acknowledgment from the server after it is stored and delivered/buffered.
- The client only prints the sent message after receiving this acknowledgment.

### 4. Chat History Retrieval
- A REST API endpoint (`GET /messages?user1=A&user2=B`) returns the full chat history between two users.
- Messages are stored in memory and are always available for retrieval as long as the server is running.

### 5. Guaranteed Message Ordering
- Messages are stored and delivered in the order they are received, both for real-time and buffered delivery.

### 6. Thread Safety & Concurrency
- All in-memory data structures are protected by a simple mutex to ensure safe concurrent access in Node.js's async environment.

---

## Instructions to Run the Project Locally

### 1. Clone the Repository
```
git clone git@github.com:ImRi8/Real-Time-chat-Application.git
cd Real-Time-chat-Application
```

### 2. Install Dependencies
```
npm install
```

### 3. Start the Server (with auto-reload)
```
npm run dev
```

### 4. Open Two Terminals for Two Users (CLI Chat Client)
In each terminal, run:
```
node client.js
```
- Enter a unique userId for each user (e.g., `123` and `999`).
- Enter the recipient's userId (e.g., `999` for `123`, and `123` for `999`).

---

## Sample Steps & Scripts

### 1. Real-Time Chat Between Two Users
- In Terminal 1:
  - Run: `node client.js`
  - Enter userId: `A`
  - Enter recipient userId: `B`
- In Terminal 2:
  - Run: `node client.js`
  - Enter userId: `B`
  - Enter recipient userId: `A`
- Type messages in either terminal. Messages will appear in real time in the other user's terminal.

### 2. Handling Disconnection and Reconnection
- In one terminal, close the client (press `Ctrl+C` or type `/exit`).
- In the other terminal, send messages while the first user is offline.
- Reconnect the first user by running `node client.js` again with the same userId and recipient.
- All buffered messages will be delivered in order upon reconnection.

### 3. Retrieving Chat History via REST
- Use `curl` or any HTTP client:
```
curl "http://localhost:3000/messages?user1=A&user2=B"
```
- This will return the full chat history between users `A` and `B` as a JSON array.

---

## Notes
- All data is stored in memory. If the server restarts, all chat history and buffers are lost.
- The system is designed for demonstration and local development, not for production use.
- For best results, use unique userIds for each client instance. 