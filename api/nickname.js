import clientPromise from '../mongodb';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const nickname = req.query.nickname;

      if (!nickname) {
        return res.status(400).json({ error: 'Nickname is required' });
      }

      const client = await clientPromise;

      if (!client) {
        throw new Error('MongoDB client not available');
      }

      const db = client.db('diceroll'); // Ensure your database name is correct
      const usersCollection = db.collection('users'); // Use a dedicated users collection

      console.log('Inserting nickname:', nickname);

      // Check if the nickname already exists
      const existingUser = await usersCollection.findOne({ nickname });

      if (!existingUser) {
        await usersCollection.insertOne({ nickname });
      }

      // Fetch all users to send back
      const users = await usersCollection.find({}).toArray();

      res.status(200).json({ users });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in nickname API:', error);
    res.status(500).json({ error: 'Failed to handle request' });
  }
}
