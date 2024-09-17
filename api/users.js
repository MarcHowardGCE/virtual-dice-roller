import clientPromise from '../../lib/mongodb'; 

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('diceroll');

    // Fetch only active users from the 'users' collection
    const users = await db.collection('users').find({ active: true }).toArray();

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
}
