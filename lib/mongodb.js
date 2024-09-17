const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;  // Ensure this environment variable is set in .env
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

client = new MongoClient(uri, options);
clientPromise = client.connect();

module.exports = clientPromise;
