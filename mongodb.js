const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri); // Removed deprecated options
  global._mongoClientPromise = client.connect().then(() => {
    console.log('MongoDB connected successfully'); // Log successful connection
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err); // Log connection error
  });
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
