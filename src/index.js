const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ================= ROUTES =================
const registerRoutes = require("./routes/registerRoute");

// ================= APP INIT =================
const app = express();

// ================= TRUST PROXY =================
app.set("trust proxy", 1);

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:3000",
  "https://summer-bootcamp-two.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ================= GLOBAL MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }));

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp API is running 🚀",
    status: "success",
  });
});

// ================= ROUTES =================
app.use("/api/register", registerRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// ================= MONGODB =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Reconnecting...");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
