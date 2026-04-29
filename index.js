
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Enpòte fonksyon koneksyon an nan db.js
const connectDB = require('./db');

// Konekte ak baz done a lè aplikasyon an kòmanse
connectDB();

app.get('/', (req, res) => {
  res.send('Live Crypto Bot ap fonksyone byen!');
});

app.listen(port, () => {
  console.log(`Sit la ap kouri sou port ${port}`);
});
