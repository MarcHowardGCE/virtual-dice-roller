// api/users.js

const clientPromise = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('diceroll');

    // Fetch all active users
    const users = await db.collection('users').find({ active: true }).toArray();

    if (!Array.isArray(users)) {
      res.status(200).json([]);  // Return an empty array if no users are active
      return;
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
}
