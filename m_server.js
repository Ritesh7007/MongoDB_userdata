// app.js
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json()); // Middleware to parse JSON

//connect to mongoDB
mongoose.connect("mongodb://127.0.0.1:27017/usersdb",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB Compass"))
    .catch(err => console.error("MongoDB connection erroe:", err));


//user schema & model
const userSchema = new mongoose.Schema
({
    mId: {type: Number, required: true, unique: true}, 
    name: {type: String, required: true},
    age: {type: Number, required: true},
    email: {type: String, required: true, unique: true},
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model("User", userSchema);


//Landing route
app.get("/", (req, res) =>
{
  res.send("hello from the database!");
});


// ✅ GET /users – List all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// ✅ GET /users/:mId – Get user by ID
app.get("/users/:mId", async (req, res) => {
  try {
    const user = await User.findById(req.params.mId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});


// ✅ POST /users – Add user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ PUT /users/:id – Update user
app.put("/users/:mId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.mId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE /users/:id – Remove user
app.delete("/users/:mId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.mId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", user });
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// ✅ SEARCH route: /users/search?name=Rahul
app.get("/users/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Name query param is required" });

  const results = await User.find({ name: new RegExp(name, "i") });
  res.json(results);
});

// ✅ Adults filter: /users/adults (age ≥ 18)
app.get("/users/adults", async (req, res) => {
  const adults = await User.find({ age: { $gte: 18 } });
  res.json(adults);
});

// ✅ Only emails: /users/emails
app.get("/users/emails", async (req, res) => {
  const emails = await User.find().select("email -_id");
  res.json(emails.map(u => u.email));
});

// /users/active
app.get("/users/active", async (req, res) =>
{
  const activeUsers = await User.find({ isActive: true });
  res.json(activeUsers);
});

// /users/age/:min
app.get("/users/age/:min", async(req, res) =>
{
  const minAge = parseInt(req.params.min);

  if(isNaN(minAge))
  {
    return res.status(400).json({error: "Age must be a number"});
  }

  try
  {
    const users = await User.find({age: { $gt: minAge }});
    res.json(users);
  } catch (err)
  {
    res.status(500).json({error: "Server error"});
  }
});


// Start server
app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});
