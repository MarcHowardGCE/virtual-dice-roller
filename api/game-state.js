import clientPromise from '../mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('diceroll');
  const gameStateCollection = db.collection('gameState');

  if (req.method === 'POST') {
    const { nickname, diceType, rollResult } = req.body;

    // Store the game state
    await gameStateCollection.updateOne(
      { _id: 'gameState' },
      { $set: { nickname, diceType, rollResult, timestamp: new Date() } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Game state updated' });
  } else if (req.method === 'GET') {
    // Return the current game state
    const gameState = await gameStateCollection.findOne({ _id: 'gameState' });
    res.status(200).json(gameState || {});
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
