import clientPromise from '../mongodb'; // Correct relative path

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db('myFirstDatabase');
    const rollsCollection = db.collection('rolls');

    // Fetch all rolls from the database
    const rolls = await rollsCollection.find({}).toArray();

    res.status(200).json({ rolls });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
