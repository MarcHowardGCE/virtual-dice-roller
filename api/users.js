import clientPromise from '../mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;

    if (!client) {
      throw new Error('MongoDB client not available');
    }

    const db = client.db('diceroll'); // Ensure your database name is correct
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
}
