
const { MongoClient } = require('mongodb');

// Lyen an dwe soti nan yon varyab sekirize (process.env)
const uri = process.env.MONGODB_URI; 

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Konekte ak MongoDB!");
        return client.db("live_crypto_db"); // Non baz done ou
    } catch (e) {
        console.error("Erè koneksyon:", e);
    }
}

module.exports = { connectDB };
