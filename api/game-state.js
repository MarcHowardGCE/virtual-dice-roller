import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('diceroll');

      // Fetch the current game state
      const gameState = await db.collection('gameState').findOne({ _id: 'state' });

      if (!gameState) {
        return res.status(200).json({ isRolling: false, nickname: null });
      }

      res.status(200).json(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);  // Log the actual error
      res.status(500).json({ error: 'Failed to retrieve game state', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
