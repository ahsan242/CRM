

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ Import from config/db.js
const db = require("./config/db");

const app = express();

// --- Middleware ---
app.use(cors({ 
  origin: true, 
  credentials: true 
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// --- Auto-register all routes in /routes ---
const routesPath = path.join(__dirname, "routes");

if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith("Routes.js")) {
      try {
        console.log(`🔍 Loading route: ${file}`);
        const route = require(path.join(routesPath, file));
        const baseName = file.replace("Routes.js", "");
        let routeName = baseName.toLowerCase();

        if (!routeName.endsWith("s")) {
          routeName += "s";
        }

        // Test if the router is valid before using it
        if (route && typeof route === 'function') {
          app.use(`/api/${routeName}`, route);
          console.log(`✅ Route registered: /api/${routeName}`);
        } else {
          console.log(`⚠️  Skipping invalid route: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error loading route ${file}:`, error.message);
        // Don't crash the server, just skip the problematic route
      }
    }
  });
} else {
  console.warn('⚠️ Routes directory not found:', routesPath);
}

// --- Health Check ---
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ E-Commerce API is running",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// --- API Status Endpoint ---
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT
  });
});

// --- Connect to Database and Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Connect to database
    await db.connectDB();
    console.log("✅ Database connected and synced");

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API URL: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;