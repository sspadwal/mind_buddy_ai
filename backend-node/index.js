import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDb from "./config/db.js";
import moodRouter from "./routes/moodRoutes.js";
import authRouter from "./routes/authRoutes.js";

dotenv.config();

// --------------------
// App Initialization
// --------------------
const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json());

// CORS configuration (Vercel + Render safe)
const allowedOrigins = [
  "http://localhost:5173",
  "https://mindbuddyai.vercel.app",
  "https://mental-buddy-ai-backend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --------------------
// Database Connection
// --------------------
connectDb();

// --------------------
// Routes
// --------------------
app.use("/api/mood", moodRouter);
app.use("/api/auth", authRouter);

// --------------------
// Health Check (IMPORTANT for Render)
// --------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Mental Buddy Backend",
  });
});

// --------------------
// Root Route (Optional but nice)
// --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Mental Buddy Backend is running",
    endpoints: {
      auth: "/api/auth",
      mood: "/api/mood",
    },
  });
});

// --------------------
// Server Start
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
