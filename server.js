const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Lyen MongoDB ou a ak modpas ou ladan l
const uri = "mongodb+srv://Livecryptomonnaie:41159927kbOU@cluster0.xxbbhvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Koneksyon ak MongoDB
mongoose.connect(uri)
  .then(() => console.log("MongoDB konekte avèk siksè! ✅"))
  .catch(err => console.log("Erè koneksyon MongoDB: ❌", err));

// Yon ti mesaj pou n teste si pwojè a Live sou Render
app.get('/', (req, res) => {
  res.send("<h1>Sèvè Live Crypto Bot la ap mache byen! 🚀</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sèvè a ap kouri sou pò k ${PORT}`);
});
