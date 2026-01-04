const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   ENV CHECK
===================== */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
}

/* =====================
   DATABASE
===================== */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

/* =====================
   SCHEMAS
===================== */
const ListingSchema = new mongoose.Schema({
  type: String,
  name: String,
  price: Number,
  contact: String,
  map: String,
  features: String,
});

const FeedbackSchema = new mongoose.Schema({
  name: String,
  msg: String,
});

const BookingSchema = new mongoose.Schema(
  {
    hallId: String,
    hallName: String,
    userName: String,
    phone: String,
    date: String,
    contact: String,
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", ListingSchema);
const Feedback = mongoose.model("Feedback", FeedbackSchema);
const Booking = mongoose.model("Booking", BookingSchema);

/* =====================
   ROOT (IMPORTANT)
===================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Reserva backend running",
    time: new Date(),
  });
});

/* =====================
   LISTINGS ROUTES
===================== */
app.get("/listings", async (req, res) => {
  try {
    const data = await Listing.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.post("/listings", async (req, res) => {
  try {
    await new Listing(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add listing" });
  }
});

app.put("/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update listing" });
  }
});

app.delete("/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

/* =====================
   FEEDBACK ROUTES
===================== */
app.get("/feedback", async (req, res) => {
  try {
    const data = await Feedback.find();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.post("/feedback", async (req, res) => {
  try {
    await new Feedback(req.body).save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

/* =====================
   BOOKING / ENQUIRY ROUTES
===================== */
app.post("/requests", async (req, res) => {
  try {
    await new Booking(req.body).save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to create request" });
  }
});

app.get("/requests", async (req, res) => {
  try {
    const data = await Booking.find().sort({ createdAt: -1 });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

app.put("/requests/:id", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update request" });
  }
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
