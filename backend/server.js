// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// // ✅ Import from config/db.js
// const db = require("./config/db");

// const app = express();

// // --- Middleware ---
// app.use(cors({ 
//   origin: true, 
//   credentials: true 
// }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('✅ Created uploads directory');
// }

// // Serve static files from uploads directory
// app.use('/uploads', express.static(uploadsDir));

// // --- Auto-register all routes in /routes ---
// const routesPath = path.join(__dirname, "routes");

// if (fs.existsSync(routesPath)) {
//   fs.readdirSync(routesPath).forEach((file) => {
//     if (file.endsWith("Routes.js")) {
//       try {
//         console.log(`🔍 Loading route: ${file}`);
//         const route = require(path.join(routesPath, file));
//         const baseName = file.replace("Routes.js", "");
//         let routeName = baseName.toLowerCase();

//         if (!routeName.endsWith("s")) {
//           routeName += "s";
//         }

//         // Test if the router is valid before using it
//         if (route && typeof route === 'function') {
//           app.use(`/api/${routeName}`, route);
//           console.log(`✅ Route registered: /api/${routeName}`);
//         } else {
//           console.log(`⚠️  Skipping invalid route: ${file}`);
//         }
//       } catch (error) {
//         console.error(`❌ Error loading route ${file}:`, error.message);
//         // Don't crash the server, just skip the problematic route
//       }
//     }
//   });
// } else {
//   console.warn('⚠️ Routes directory not found:', routesPath);
// }

// // --- Health Check ---
// app.get("/", (req, res) => {
//   res.json({ 
//     message: "✅ E-Commerce API is running",
//     database: "PostgreSQL",
//     timestamp: new Date().toISOString(),
//     version: "1.0.0"
//   });
// });

// // --- API Status Endpoint ---
// app.get("/api/status", (req, res) => {
//   res.json({
//     status: "online",
//     database: "PostgreSQL",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//     port: process.env.PORT
//   });
// });

// // --- Connect to Database and Start Server ---
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     console.log('🔄 Connecting to database...');
    
//     // Connect to database
//     await db.connectDB();
//     console.log("✅ Database connected and synced");

//     // Start the server
//     app.listen(PORT, '0.0.0.0', () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`📊 API URL: http://localhost:${PORT}`);
//     });

//   } catch (err) {
//     console.error("❌ Failed to start server:", err.message);
//     process.exit(1);
//   }
// };

// // Start the application
// startServer();

// module.exports = app;



//..... before cron job fix ..........

// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// // ✅ Import from config/db.js
// const db = require("./config/db");

// const app = express();

// // --- Middleware ---
// app.use(cors({ 
//   origin: true, 
//   credentials: true 
// }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('✅ Created uploads directory');
// }

// // Serve static files from uploads directory
// app.use('/uploads', express.static(uploadsDir));

// // --- Auto-register all routes in /routes ---
// const routesPath = path.join(__dirname, "routes");

// if (fs.existsSync(routesPath)) {
//   fs.readdirSync(routesPath).forEach((file) => {
//     if (file.endsWith("Routes.js")) {
//       try {
//         console.log(`🔍 Loading route: ${file}`);
//         const route = require(path.join(routesPath, file));
//         const baseName = file.replace("Routes.js", "");
//         let routeName = baseName.toLowerCase();

//         if (!routeName.endsWith("s")) {
//           routeName += "s";
//         }

//         // Test if the router is valid before using it
//         if (route && typeof route === 'function') {
//           app.use(`/api/${routeName}`, route);
//           console.log(`✅ Route registered: /api/${routeName}`);
//         } else {
//           console.log(`⚠️  Skipping invalid route: ${file}`);
//         }
//       } catch (error) {
//         console.error(`❌ Error loading route ${file}:`, error.message);
//         // Don't crash the server, just skip the problematic route
//       }
//     }
//   });
// } else {
//   console.warn('⚠️ Routes directory not found:', routesPath);
// }

// // --- Health Check ---
// app.get("/", (req, res) => {
//   res.json({ 
//     message: "✅ E-Commerce API is running",
//     database: "PostgreSQL",
//     timestamp: new Date().toISOString(),
//     version: "1.0.0"
//   });
// });

// // --- API Status Endpoint ---
// app.get("/api/status", (req, res) => {
//   res.json({
//     status: "online",
//     database: "PostgreSQL",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//     port: process.env.PORT
//   });
// });

// // --- Connect to Database and Start Server ---
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     console.log('🔄 Connecting to database...');
    
//     // Connect to database
//     await db.connectDB();
//     console.log("✅ Database connected and synced");

//     // ✅ SYNC ENUM FOR PRODUCT IMPORT STATUS
//     try {
//       const ProductForImport = require("./models/productForImport")(db.sequelize);
//       if (ProductForImport.syncEnum && typeof ProductForImport.syncEnum === 'function') {
//         console.log('🔄 Syncing enum values...');
//         await ProductForImport.syncEnum();
//         console.log('✅ Enum sync completed');
//       } else {
//         console.log('ℹ️ syncEnum function not available, skipping enum sync');
//       }
//     } catch (enumError) {
//       console.log('ℹ️ Enum sync not required or failed:', enumError.message);
//       // Don't crash the server if enum sync fails
//     }

//     // Start the server
//     app.listen(PORT, '0.0.0.0', () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`📊 API URL: http://localhost:${PORT}`);
//     });

//   } catch (err) {
//     console.error("❌ Failed to start server:", err.message);
//     process.exit(1);
//   }
// };

// // Start the application
// startServer();

// module.exports = app;



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

// ✅ PRODUCT IMPORT CRON JOB ROUTES
let cronInstance = null;

// Initialize and register cron job routes
const initializeCronJob = () => {
  try {
    // CORRECT PATH: Your file is in ./cron/productImportCron.js
    const ProductImportCron = require("./cron/productImportCron");
    cronInstance = new ProductImportCron();
    
    console.log('✅ Product Import Cron Job initialized with API endpoints');
    
  } catch (error) {
    console.error('❌ Failed to initialize Product Import Cron Job:', error.message);
    // Don't crash the server if cron job fails to initialize
  }
};

// Manual trigger endpoint for cron job
app.get("/api/cron/trigger-import", async (req, res) => {
  try {
    if (!cronInstance) {
      return res.status(503).json({ 
        success: false, 
        error: "Cron job not initialized" 
      });
    }

    console.log('🔔 Manual trigger of import cron job via API');
    const result = await cronInstance.triggerManualImport();
    
    res.json({
      success: true,
      message: 'Cron job triggered manually',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error triggering cron job:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Check cron job status
app.get("/api/cron/status", (req, res) => {
  if (!cronInstance) {
    return res.status(503).json({ 
      error: "Cron job not initialized",
      status: "unavailable"
    });
  }

  res.json(cronInstance.getStatus());
});

// Get specific job status
app.get("/api/cron/job/:id", async (req, res) => {
  try {
    if (!cronInstance) {
      return res.status(503).json({ 
        error: "Cron job not initialized" 
      });
    }

    const result = await cronInstance.getJobStatus(req.params.id);
    
    if (result.error) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all import jobs
app.get("/api/cron/jobs", async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const jobs = await db.ProductImportJob.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [{
        model: db.ProductImportItem,
        as: 'items',
        attributes: ['id', 'status', 'productCode', 'brand', 'errorMessage']
      }]
    });

    const totalJobs = await db.ProductImportJob.count({ where: whereClause });

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalJobs,
        pages: Math.ceil(totalJobs / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching import jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Connect to Database and Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Connect to database
    await db.connectDB();
    console.log("✅ Database connected and synced");

    // ✅ SYNC ENUM FOR PRODUCT IMPORT STATUS
    try {
      const ProductForImport = require("./models/productForImport")(db.sequelize);
      if (ProductForImport.syncEnum && typeof ProductForImport.syncEnum === 'function') {
        console.log('🔄 Syncing enum values...');
        await ProductForImport.syncEnum();
        console.log('✅ Enum sync completed');
      } else {
        console.log('ℹ️ syncEnum function not available, skipping enum sync');
      }
    } catch (enumError) {
      console.log('ℹ️ Enum sync not required or failed:', enumError.message);
      // Don't crash the server if enum sync fails
    }

    // ✅ INITIALIZE PRODUCT IMPORT CRON JOB
    initializeCronJob();

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API URL: http://localhost:${PORT}`);
      console.log(`⏰ Product Import Cron: http://localhost:${PORT}/api/cron/status`);
      console.log(`🔔 Manual Trigger: http://localhost:${PORT}/api/cron/trigger-import`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;