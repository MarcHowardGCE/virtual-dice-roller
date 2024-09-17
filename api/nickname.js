import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nickname } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db('diceroll');
      
      // Add or update the user's status to logged in
      await db.collection('users').updateOne(
        { nickname },
        { $set: { nickname, active: true } },
        { upsert: true }
      );
      
      // Fetch the list of all logged-in users
      const users = await db.collection('users').find({ active: true }).toArray();
      console.log("Logged-in users:", users);  // Log the user list

      res.status(200).json({ users });
    } catch (error) {
      console.error('Error submitting nickname:', error);  // Log the actual error
      res.status(500).json({ error: 'Failed to submit nickname', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
