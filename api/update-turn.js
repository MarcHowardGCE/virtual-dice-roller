import clientPromise from '../mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nickname } = req.body;

    const client = await clientPromise;
    const db = client.db('diceroll');
    const gameState = db.collection('gameState');

    // Update the current player turn
    await gameState.updateOne({ _id: 'turn' }, { $set: { currentTurnPlayer: nickname } }, { upsert: true });

    res.status(200).json({ message: `${nickname}'s turn has been set` });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
