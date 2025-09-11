const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ Import from config/db.js
const db = require("./config/db");

const app = express();

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Auto-register all routes in /routes ---
const routesPath = path.join(__dirname, "routes");

fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith("Routes.js")) {
    const route = require(path.join(routesPath, file));
    const baseName = file.replace("Routes.js", "");
    let routeName = baseName.toLowerCase();

    if (!routeName.endsWith("s")) {
      routeName += "s";
    }

    app.use(`/api/${routeName}`, route);
    console.log(`✅ Route registered: /api/${routeName}`);
  }
});

// --- Health Check ---
app.get("/", (req, res) => {
  res.json({ message: "✅ API is running" });
});

// --- Connect to Database and Start Server ---
const PORT = process.env.PORT || 5000;

db.connectDB()
  .then(() => {
    console.log("✅ Database connected and synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });


  // Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));