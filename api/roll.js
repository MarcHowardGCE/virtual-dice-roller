import clientPromise from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { diceType, nickname } = req.query;
    const rollResult = Math.floor(Math.random() * diceType) + 1;
    const timestamp = new Date().toLocaleString();

    const client = await clientPromise;
    const db = client.db('myFirstDatabase');
    const rollsCollection = db.collection('rolls');

    // Store the roll result in the database
    const rollData = { nickname, diceType, rollResult, timestamp };
    await rollsCollection.insertOne(rollData);

    res.status(200).json({ rollData });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
