const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rollArchive = [];
let users = {}; // Object to store connected users

app.use(express.static('public'));

wss.on('connection', (ws) => {
  console.log('A user connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.action === 'nickname') {
      // Assign the nickname to the user and store it
      users[ws.id] = data.nickname;

      // Broadcast updated user list to all clients
      broadcastUserList();
    } else if (data.action === 'roll') {
      // Add the roll to the archive
      const timestamp = new Date().toLocaleString();
      const rollData = { ...data, timestamp };
      rollArchive.push(rollData); // Save the roll result

      // Broadcast the roll to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ action: 'roll', ...rollData }));
        }
      });
    } else if (data.action === 'requestArchive') {
      // Send archive data to the client who requested it
      ws.send(JSON.stringify({ action: 'archive', rolls: rollArchive }));
    }
  });

  ws.on('close', () => {
    console.log('A user disconnected');

    // Remove user from the user list and broadcast update
    delete users[ws.id];
    broadcastUserList();
  });
});

// Helper function to broadcast the updated list of users
function broadcastUserList() {
  const userList = Object.values(users); // Get all connected users' nicknames
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'updateUserList', users: userList }));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
