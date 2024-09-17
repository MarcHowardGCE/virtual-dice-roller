const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to environment variables.');
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 50000, // Increase timeout to 50 seconds
    socketTimeoutMS: 60000,          // Socket timeout to 60 seconds
  });

  global._mongoClientPromise = client.connect()
    .then(() => {
      console.log('MongoDB connected successfully');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw new Error('MongoDB connection error');
    });
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
