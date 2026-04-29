const { connectDB } = require('./db');

async function test() {
    const db = await connectDB();
    if (db) {
        console.log("Koneksyon an mache 100%!");
    } else {
        console.log("Koneksyon an echwe.");
    }
}

test();
