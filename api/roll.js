import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nickname, diceType, rollResult } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('diceroll');

      // Update the game state
      await db.collection('gameState').updateOne(
        { _id: 'state' },
        { $set: { nickname, diceType, rollResult, isRolling: true } },
        { upsert: true }
      );

      // Simulate roll completion after 1 second
      setTimeout(async () => {
        await db.collection('gameState').updateOne(
          { _id: 'state' },
          { $set: { isRolling: false } }
        );
      }, 1000);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to roll dice' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
