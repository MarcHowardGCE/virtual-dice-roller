const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect().catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
