// api/nickname.js

const clientPromise = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
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

      // Fetch the list of active users
      const users = await db.collection('users').find({ active: true }).toArray();

      res.status(200).json({ users });
    } catch (error) {
      console.error('Error submitting nickname:', error);
      res.status(500).json({ error: 'Failed to submit nickname' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
