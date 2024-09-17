import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nickname } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db('diceroll');
      await db.collection('users').updateOne(
        { nickname },
        { $set: { nickname, active: true } },
        { upsert: true }
      );
      const users = await db.collection('users').find().toArray();

      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit nickname' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
