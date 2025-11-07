// config/db.js
const { Sequelize } = require("sequelize");
const { createProductPriceModel } = require("../models/ProductPrice");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ Setup Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      max: 3,
    },
  }
);

// Object to hold all models
const db = {};

// ✅ Dynamically load all models from ../models
const modelsPath = path.join(__dirname, "../models");
if (fs.existsSync(modelsPath)) {
  fs.readdirSync(modelsPath)
    .filter((file) => file.endsWith(".js") && file !== "index.js")
    .forEach((file) => {
      try {
        const modelPath = path.join(modelsPath, file);
        const modelDef = require(modelPath);

        if (typeof modelDef === "function") {
          const model = modelDef(sequelize, Sequelize.DataTypes);
          db[model.name] = model;
          console.log(`✅ Model loaded: ${model.name}`);
        }
      } catch (error) {
        console.error(`❌ Error loading model ${file}:`, error.message);
      }
    });
} else {
  console.warn("⚠️ Models directory not found:", modelsPath);
}

// ✅ MANUALLY ADD ORDER MANAGEMENT MODELS (since they're new and might not be in models folder yet)
try {
  db.Order = require("../models/Order")(sequelize, Sequelize.DataTypes);
  console.log("✅ Order model loaded manually");
} catch (error) {
  console.error("❌ Error loading Order model:", error.message);
}

// ✅ MANUALLY ADD GALLERY MODEL
try {
  db.Gallery = require("../models/Gallery")(sequelize, Sequelize.DataTypes);
  console.log("✅ Gallery model loaded manually");
} catch (error) {
  console.error("❌ Error loading Gallery model:", error.message);
}

// ✅ MANUALLY ADD EMAIL VERIFICATION MODEL
try {
  db.EmailVerification = require("../models/EmailVerification")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ EmailVerification model loaded manually");
} catch (error) {
  console.error("❌ Error loading EmailVerification model:", error.message);
}

try {
  db.OrderItem = require("../models/OrderItem")(sequelize, Sequelize.DataTypes);
  console.log("✅ OrderItem model loaded manually");
} catch (error) {
  console.error("❌ Error loading OrderItem model:", error.message);
}

try {
  db.OrderHistory = require("../models/OrderHistory")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ OrderHistory model loaded manually");
} catch (error) {
  console.error("❌ Error loading OrderHistory model:", error.message);
}

try {
  db.Cart = require("../models/Cart")(sequelize, Sequelize.DataTypes);
  console.log("✅ Cart model loaded manually");
} catch (error) {
  console.error("❌ Error loading Cart model:", error.message);
}

// ✅ MANUALLY ADD USER PROFILE MODEL
try {
  db.UserProfile = require("../models/UserProfile")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ UserProfile model loaded manually");
} catch (error) {
  console.error("❌ Error loading UserProfile model:", error.message);
}

// ✅ MANUALLY ADD EMAIL VERIFICATION MODEL
try {
  db.EmailVerification = require("../models/EmailVerification")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ EmailVerification model loaded manually");
} catch (error) {
  console.error("❌ Error loading EmailVerification model:", error.message);
}

// ✅ MANUALLY ADD ORDER HISTORY MODEL
try {
  db.OrderHistory = require("../models/OrderHistory")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ OrderHistory model loaded manually");
} catch (error) {
  console.error("❌ Error loading OrderHistory model:", error.message);
}

// ✅ MANUALLY ADD ORDER ITEM MODEL
try {
  db.OrderItem = require("../models/OrderItem")(sequelize, Sequelize.DataTypes);
  console.log("✅ OrderItem model loaded manually");
} catch (error) {
  console.error("❌ Error loading OrderItem model:", error.message);
}

// ✅ MANUALLY ADD USER PROFILE MODEL
try {
  db.UserProfile = require("../models/UserProfile")(
    sequelize,
    Sequelize.DataTypes
  );
  console.log("✅ UserProfile model loaded manually");
} catch (error) {
  console.error("❌ Error loading UserProfile model:", error.message);
}

console.log("✅ Order management models loaded");

// Store seller-specific models
db.sellerPriceModels = {};

// Function to get or create seller-specific price model
db.getSellerPriceModel = async (sellerName) => {
  const normalizedSellerName = sellerName.replace(/[^a-zA-Z0-9_]/g, "_");

  if (!db.sellerPriceModels[normalizedSellerName]) {
    console.log(`🆕 Creating price model for seller: ${normalizedSellerName}`);
    db.sellerPriceModels[normalizedSellerName] = createProductPriceModel(
      sequelize,
      normalizedSellerName
    );

    // Apply associations
    if (db.sellerPriceModels[normalizedSellerName].associate) {
      db.sellerPriceModels[normalizedSellerName].associate(db);
    }

    // Sync the table
    await db.sellerPriceModels[normalizedSellerName].sync();
    console.log(`✅ Price table created for seller: ${normalizedSellerName}`);
  }

  return db.sellerPriceModels[normalizedSellerName];
};

// Function to get all seller tables
db.getAllSellerTables = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'product_prices_%'
    `);
    return results.map((row) => row.table_name);
  } catch (error) {
    console.error("Error fetching seller tables:", error);
    return [];
  }
};

// Function to get all sellers from all tables
db.getAllSellers = async () => {
  try {
    const sellerTables = await db.getAllSellerTables();
    const allSellers = new Set();

    for (const table of sellerTables) {
      const sellerName = table.replace("product_prices_", "");
      allSellers.add(sellerName);
    }

    return Array.from(allSellers);
  } catch (error) {
    console.error("Error fetching all sellers:", error);
    return [];
  }
};

// Function to get record count from a seller table
db.getSellerRecordCount = async (sellerName) => {
  try {
    const SellerPriceModel = await db.getSellerPriceModel(sellerName);
    return await SellerPriceModel.count();
  } catch (error) {
    console.error(`Error getting record count for ${sellerName}:`, error);
    return 0;
  }
};

// ✅ Apply associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`✅ Associations applied for: ${modelName}`);
  }
});

// Apply associations for seller models
Object.keys(db.sellerPriceModels).forEach((sellerName) => {
  if (db.sellerPriceModels[sellerName].associate) {
    db.sellerPriceModels[sellerName].associate(db);
  }
});

// ✅ Database connection + sync
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully!");

    // Auto sync models with DB (use alter: true for development, false for production)
    const syncOptions =
      process.env.NODE_ENV === "production"
        ? { alter: false }
        : { alter: true };

    await sequelize.sync(syncOptions);
    console.log("✅ All models synchronized successfully.");

    return sequelize;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    throw error; // Re-throw to handle in server.js
  }
};

// ✅ Export everything properly
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.connectDB = connectDB;

module.exports = db;
