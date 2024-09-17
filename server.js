const express = require('express');
const http = require('http');
const app = express();

let rollArchive = [];
let users = [];  // Store connected users

app.use(express.static('public'));

// Add new user when they connect
app.post('/api/nickname', (req, res) => {
  let nickname = req.query.nickname;
  if (!users.includes(nickname)) {
    users.push(nickname);
  }
  res.json({ users });
});

// Remove user when they disconnect
app.post('/api/disconnect', (req, res) => {
  let nickname = req.query.nickname;
  users = users.filter(user => user !== nickname);
  res.json({ users });
});

// Handle dice roll requests
app.post('/api/roll', (req, res) => {
  const diceType = req.query.diceType;
  const nickname = req.query.nickname;
  const rollResult = Math.floor(Math.random() * diceType) + 1;

  const timestamp = new Date().toLocaleString();
  const rollData = { nickname, diceType, rollResult, timestamp };
  rollArchive.push(rollData);

  res.json({ rollData });
});

// Get archive of rolls
app.get('/api/archive', (req, res) => {
  res.json({ rolls: rollArchive });
});

// Get logged in users
app.get('/api/users', (req, res) => {
  res.json({ users });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Track the current game state
let gameState = {
  isRolling: false,
  nickname: null,
};

// Get the current game state
app.get('/api/game-state', (req, res) => {
  res.json(gameState);
});

// Update the game state when a roll happens
app.post('/api/roll', (req, res) => {
  const diceType = req.query.diceType;
  const nickname = req.query.nickname;
  const rollResult = Math.floor(Math.random() * diceType) + 1;

  // Set rolling state
  gameState.isRolling = true;
  gameState.nickname = nickname;

  // Simulate the end of rolling after 1 second
  setTimeout(() => {
    gameState.isRolling = false;
  }, 1000);

  const timestamp = new Date().toLocaleString();
  const rollData = { nickname, diceType, rollResult, timestamp };
  rollArchive.push(rollData);

  res.json({ rollData });
});
