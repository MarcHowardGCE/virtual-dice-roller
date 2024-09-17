import clientPromise from '../mongodb';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { diceType, nickname } = req.query;
      const rollResult = Math.floor(Math.random() * diceType) + 1;
      const timestamp = new Date().toLocaleString();

      const client = await clientPromise;

      if (!client) {
        throw new Error('MongoDB client not available');
      }

      const db = client.db('diceroll'); // Ensure your database name is correct
      const rollsCollection = db.collection('diceroll'); // Make sure your collection name is correct

      console.log('Inserting roll:', { nickname, diceType, rollResult, timestamp });

      // Store the roll result in the database
      const result = await rollsCollection.insertOne({ nickname, diceType, rollResult, timestamp });

      if (!result.insertedId) {
        throw new Error('Failed to insert roll into database');
      }

      res.status(200).json({ rollData: { nickname, diceType, rollResult, timestamp } });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error in roll API:', error);
    res.status(500).json({ error: 'Failed to handle request' });
  }
}
