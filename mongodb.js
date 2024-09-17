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
  global._mongoClientPromise = client.connect().then(() => {
    console.log('MongoDB connected successfully'); // Add this line to confirm connection
  }).catch(err => {
    console.error('Failed to connect to MongoDB', err); // Error logging
  });
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
