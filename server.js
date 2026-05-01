const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connecté"))
.catch(err=>console.log(err));

const User = mongoose.model("User", {
  email: String,
  password: String,
  balanceUSDT: { type: Number, default: 0 },
  balanceHTG: { type: Number, default: 0 }
});

// REGISTER
app.post("/register", async (req,res)=>{
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// LOGIN
app.post("/login", async (req,res)=>{
  const user = await User.findOne(req.body);
  if(!user) return res.status(401).send("Invalid");
  res.json(user);
});

// DEPOSIT (admin simulate)
app.post("/deposit", async (req,res)=>{
  const { email, amount } = req.body;
  const user = await User.findOne({ email });
  user.balanceUSDT += amount;
  await user.save();
  res.json(user);
});

// CONVERT USDT -> HTG
app.post("/convert", async (req,res)=>{
  const rate = 140; // ou ka chanje sa
  const { email, amount } = req.body;

  const user = await User.findOne({ email });
  if(user.balanceUSDT < amount) return res.send("Pa gen ase lajan");

  user.balanceUSDT -= amount;
  user.balanceHTG += amount * rate;

  await user.save();
  res.json(user);
});

app.listen(3000, ()=>console.log("Server OK"));
