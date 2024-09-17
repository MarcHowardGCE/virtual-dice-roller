// api/archive.js

const clientPromise = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('diceroll');

      // Fetch archived rolls from the 'rolls' collection
      const archive = await db.collection('rolls').find({}).toArray();

      if (!Array.isArray(archive)) {
        res.status(200).json([]);  // Return an empty array if no data found
        return;
      }

      res.status(200).json(archive);  // Return the array of archived rolls
    } catch (error) {
      console.error('Error fetching archive:', error);
      res.status(500).json({ error: 'Failed to fetch archive' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
