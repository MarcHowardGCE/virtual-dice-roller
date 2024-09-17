import clientPromise from '../mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;

    if (!client) {
      throw new Error('MongoDB client not available');
    }

    const db = client.db('diceroll'); // Ensure your database name is correct
    const rollsCollection = db.collection('diceroll'); // Make sure your collection name is correct

    console.log('Fetching archive of rolls');

    // Fetch all rolls from the database
    const rolls = await rollsCollection.find({}).toArray();

    res.status(200).json({ rolls });
  } catch (error) {
    console.error('Error in archive API:', error);
    res.status(500).json({ error: 'Failed to retrieve archive' });
  }
}
