const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   DATABASE
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* =====================
   SCHEMAS
===================== */

// USERS
const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }, // user | admin
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// LISTINGS
const ListingSchema = new mongoose.Schema({
  type: String,
  name: String,
  price: Number,
  contact: String,
  map: String,
  features: String,
});

const Listing = mongoose.model("Listing", ListingSchema);

// FEEDBACK
const FeedbackSchema = new mongoose.Schema({
  name: String,
  msg: String,
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

// REQUESTS (BOOKINGS)
const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  vendorName: String,
  vendorType: String,
  phone: String,
  message: String,
  status: { type: String, default: "pending" }, // pending | accepted | rejected
}, { timestamps: true });

const Request = mongoose.model("Request", RequestSchema);

/* =====================
   AUTH ROUTES
===================== */

// REGISTER
app.post("/auth/register", async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const exists = await User.findOne({ phone });
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    phone,
    password: hash,
    role: phone === "9999999999" ? "admin" : "user"
  });

  await user.save();
  res.json({ success: true });
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    userId: user._id,
    name: user.name,
    role: user.role
  });
});

// ADMIN – REGISTERED USERS
app.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/* =====================
   LISTINGS ROUTES
===================== */

app.get("/listings", async (req, res) => {
  const data = await Listing.find();
  res.json(data);
});

app.post("/listings", async (req, res) => {
  await new Listing(req.body).save();
  res.json({ success: true });
});

app.put("/listings/:id", async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

app.delete("/listings/:id", async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* =====================
   FEEDBACK ROUTES
===================== */

app.get("/feedback", async (req, res) => {
  const data = await Feedback.find();
  res.json(data);
});

app.post("/feedback", async (req, res) => {
  await new Feedback(req.body).save();
  res.json({ success: true });
});

/* =====================
   REQUEST ROUTES
===================== */

// CREATE REQUEST
app.post("/requests", async (req, res) => {
  await new Request(req.body).save();
  res.json({ success: true });
});

// GET ALL REQUESTS (ADMIN)
app.get("/requests", async (req, res) => {
  const data = await Request.find()
    .populate("userId", "name phone")
    .sort({ createdAt: -1 });

  res.json(data);
});

// UPDATE REQUEST STATUS
app.put("/requests/:id", async (req, res) => {
  await Request.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json({ success: true });
});

/* =====================
   ROOT
===================== */

app.get("/", (req, res) => {
  res.send("Reserva backend running");
});

/* =====================
   START SERVER
===================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});