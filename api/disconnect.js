import clientPromise from '../../lib/mongodb'; 

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const nickname = req.query.nickname;

      if (!nickname) {
        return res.status(400).json({ error: 'Nickname is required' });
      }

      const client = await clientPromise;
      const db = client.db('diceroll');

      // Remove the user from the active users list
      await db.collection('users').updateOne({ nickname }, { $set: { active: false } });

      // Fetch all remaining active users
      const users = await db.collection('users').find({ active: true }).toArray();

      res.status(200).json({ users });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in disconnect API:', error);
    res.status(500).json({ error: 'Failed to handle request' });
  }
}
