require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const recruiterRoutes = require("./routes/recruiterRoutes");
const jobseekerRoutes = require("./routes/jobseeker");

const app = express();
const PORT = process.env.PORT || 5000;
const explicitAllowedOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (explicitAllowedOrigins.includes(origin)) {
    return true;
  }

  const allowedPatterns = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:\d+$/,
  ];

  return allowedPatterns.some((pattern) => pattern.test(origin));
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.json({
    message: "Resume Genius API is alive",
    status: "running",
    port: PORT,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/jobseeker", jobseekerRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    url: req.originalUrl,
  });
});

const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
} else {
  console.warn("MONGO_URI not set. Auth persistence will not work until MongoDB is configured.");
}

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || (!process.env.SMTP_SERVICE && (!process.env.SMTP_HOST || !process.env.SMTP_PORT))) {
    console.warn("SMTP is not configured. Forgot-password emails will not be delivered yet.");
  }
});
