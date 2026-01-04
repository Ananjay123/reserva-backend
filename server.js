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

DATABASE

===================== */

mongoose

.connect(process.env.MONGO_URI)

.then(() => console.log("MongoDB connected"))

.catch(err => console.error(err));

/* =====================

SCHEMAS (INLINE)

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

const BookingSchema = new mongoose.Schema({

hallId: String,

hallName: String,

userName: String,

phone: String,

date: String,

contact: String,

status: { type: String, default: "pending" }, // pending | accepted | rejected

}, { timestamps: true });

const Listing = mongoose.model("Listing", ListingSchema);

const Feedback = mongoose.model("Feedback", FeedbackSchema);

const Booking = mongoose.model("Booking", BookingSchema);

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

BOOKING REQUEST ROUTES

===================== */

// CREATE REQUEST

app.post("/requests", async (req, res) => {

await new Booking(req.body).save();

res.json({ success: true });

});

// GET ALL REQUESTS

app.get("/requests", async (req, res) => {

const data = await Booking.find().sort({ createdAt: -1 });

res.json(data);

});

// UPDATE REQUEST STATUS

app.put("/requests/:id", async (req, res) => {

await Booking.findByIdAndUpdate(req.params.id, {

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
