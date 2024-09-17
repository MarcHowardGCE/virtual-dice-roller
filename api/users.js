import clientPromise from '../mongodb'; // Correct relative path

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db('myFirstDatabase');
    const usersCollection = db.collection('users');

    // Fetch all users from the database
    const users = await usersCollection.find({}).toArray();

    res.status(200).json({ users });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
