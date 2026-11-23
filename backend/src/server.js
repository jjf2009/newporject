require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./config/db");

const eventRoutes = require("./routes/events");
const studentRoutes = require("./routes/students");
const registrationRoutes = require("./routes/registrations");
const analyticsRoutes = require("./routes/analytics");
const clusterRoutes = require("./routes/cluster");
const departmentRoutes = require("./routes/departments");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// CORS middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json({ limit: "1mb" }));

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "campus-event-api",
    timestamp: new Date().toISOString(),
    database: process.env.DB_NAME || "campus_events",
  });
});

// Mount application routers
app.use("/api/events", eventRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cluster", clusterRoutes);
app.use("/api/departments", departmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
    details: null,
  });
});

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, "127.0.0.1", () => {
      console.log(`🚀 Campus Event Management API running on http://127.0.0.1:${PORT}`);
    });

    async function shutdown() {
      console.log("\nShutting down server gracefully...");
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
