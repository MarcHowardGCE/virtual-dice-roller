import clientPromise from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let nickname = req.query.nickname;

    const client = await clientPromise;
    const db = client.db('myFirstDatabase'); // Use the database name

    const usersCollection = db.collection('users');

    // Add the nickname to the database if it doesn't already exist
    const existingUser = await usersCollection.findOne({ nickname });
    if (!existingUser) {
      await usersCollection.insertOne({ nickname });
    }

    // Fetch all users to send back
    const users = await usersCollection.find({}).toArray();

    res.status(200).json({ users });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
