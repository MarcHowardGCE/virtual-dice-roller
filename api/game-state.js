// api/game-state.js

const clientPromise = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('diceroll');

    // Fetch the current game state
    const gameState = await db.collection('gameState').findOne({ _id: 'state' });

    res.status(200).json(gameState || {});
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to retrieve game state' });
  }
}
