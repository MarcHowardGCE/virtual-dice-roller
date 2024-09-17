// mongodbTest.js
require('dotenv').config();

const clientPromise = require('./lib/mongodb');

async function testMongoConnection() {
  try {
    const client = await clientPromise;
    const db = client.db('diceroll');

    // Test the connection by fetching something from the database
    const data = await db.collection('gameState').findOne({});
    console.log('Database connection successful, data:', data);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

testMongoConnection();
