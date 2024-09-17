import clientPromise from '../mongodb';

export default async function handler(req, res) {
  console.log('Roll API hit');  // Add this line to confirm the route is hit
  
  try {
    if (req.method === 'POST') {
      const { diceType, nickname } = req.query;
      const rollResult = Math.floor(Math.random() * diceType) + 1;
      const timestamp = new Date().toLocaleString();

      console.log('Received roll request:', { nickname, diceType, rollResult });  // Log incoming request

      const client = await clientPromise;
      const db = client.db('diceroll');  // Use your database name
      const rollsCollection = db.collection('diceroll');  // Use your collection name

      // Insert roll data into MongoDB
      const result = await rollsCollection.insertOne({ nickname, diceType, rollResult, timestamp });

      if (result.insertedId) {
        console.log('Successfully inserted roll:', result.insertedId);  // Log success
      }

      res.status(200).json({ rollData: { nickname, diceType, rollResult, timestamp } });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    console.error('Error in roll API:', error);  // Log any errors
    res.status(500).json({ error: 'Failed to handle request' });
  }
}
