
// db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

// URI a ap soti nan Railway (process.env)
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Koneksyon MongoDB a etabli avèk siksè!");
    return client.db("live_cryptomonnaie"); 
  } catch (error) {
    console.error("Erè koneksyon:", error);
  }
}

module.exports = connectDB;
