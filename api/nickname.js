const clientPromise = require('../lib/mongodb');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nickname } = req.query;
    try {
      const client = await clientPromise;
      const db = client.db('diceroll');

      // Insert or update the logged-in user
      await db.collection('users').updateOne(
        { nickname },
        { $set: { nickname, active: true } },
        { upsert: true }
      );

      // Fetch the list of active users and return it as an array of objects
      const users = await db.collection('users').find({ active: true }).toArray();

      // Ensure users are returned as objects with the 'nickname' field
      res.status(200).json({ users });  // Return users array directly
    } catch (error) {
      console.error('Error submitting nickname:', error);
      res.status(500).json({ error: 'Failed to submit nickname' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
