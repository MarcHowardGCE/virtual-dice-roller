const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rollArchive = [];
let users = [];

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle new user joining
  socket.on('userJoined', (nickname) => {
    socket.nickname = nickname; // Store nickname in socket session
    users.push(nickname);
    io.emit('updateUserList', users); // Update user list for all clients
  });

  // Handle dice roll
  socket.on('diceRolled', (data) => {
    const timestamp = new Date().toLocaleString();
    const rollWithTimestamp = { ...data, timestamp };
    
    io.emit('diceRolled', rollWithTimestamp); // Broadcast the roll to all clients

    rollArchive.unshift(rollWithTimestamp); // Save roll to archive
  });

  // Disable buttons for all clients
  socket.on('disableButtons', () => {
    io.emit('disableButtons');
  });

  // Enable buttons for all clients
  socket.on('enableButtons', () => {
    io.emit('enableButtons');
  });

  // Send archive when requested
  socket.on('requestArchive', () => {
    socket.emit('rollArchive', rollArchive);
  });

  // Handle user leaving
  socket.on('disconnect', () => {
    if (socket.nickname) {
      users = users.filter(user => user !== socket.nickname);
      io.emit('updateUserList', users); // Update user list for all clients
    }
  });

  // Handle user manually leaving
  socket.on('userLeft', (nickname) => {
    users = users.filter(user => user !== nickname);
    io.emit('updateUserList', users); // Update user list for all clients
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
