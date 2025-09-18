
// backend/config/db.js
const { Sequelize } = require("sequelize");
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
    logging: false, // disable SQL logs (set true for debugging)
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
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Object to hold all models
const db = {};

// ✅ Dynamically load all models from ../models
const modelsPath = path.join(__dirname, "../models");
fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith(".js") && file !== "index.js")
  .forEach((file) => {
    try {
      const modelPath = path.join(modelsPath, file);
      const modelDef = require(modelPath);

      if (typeof modelDef === "function") {
        const model = modelDef(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      }
    } catch (error) {
      console.error(`❌ Error loading model ${file}:`, error.message);
    }
  });

// ✅ Apply associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ Database connection + sync
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected...");

    // Auto sync models with DB (development only!)
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  }
};

// ✅ Export everything properly
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.connectDB = connectDB;

module.exports = db;
