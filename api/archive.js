const clientPromise = require('../lib/mongodb');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('diceroll');

      // Fetch archived rolls and return as an array of objects
      const archive = await db.collection('rolls').find({}).toArray();
      
      // Return the archive data as an array
      res.status(200).json(archive);
    } catch (error) {
      console.error('Error fetching archive:', error);
      res.status(500).json({ error: 'Failed to fetch archive' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
