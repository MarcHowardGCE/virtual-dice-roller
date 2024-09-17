const { MongoClient } = require('mongodb');
require('dotenv').config(); // Ensure dotenv is loaded

async function testMongoConnection() {
  const uri = process.env.MONGODB_URI; // Check if MONGODB_URI is loaded

  if (!uri) {
    console.error('MONGODB_URI is not defined. Please check your environment variables.');
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB connection successful');
    const db = client.db('diceroll'); // Ensure your database name is correct
    const collections = await db.collections();
    console.log('Collections:', collections);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  } finally {
    await client.close();
  }
}

testMongoConnection();
