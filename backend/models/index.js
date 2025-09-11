// // const { Sequelize } = require("sequelize");
// // const dotenv = require("dotenv");

// // dotenv.config();

// // const sequelize = new Sequelize(
// //   process.env.DB_NAME,
// //   process.env.DB_USER,
// //   process.env.DB_PASSWORD,
// //   {
// //     host: process.env.DB_HOST || "localhost",
// //     dialect: process.env.DB_DIALECT || "mysql",
// //     logging: process.env.NODE_ENV === "development",
// //   }
// // );

// // // Import models
// // const Category = require("./categoryModel")(sequelize);
// // const SubCategory = require("./subCategoryModel")(sequelize);
// // const Product = require("./productModel")(sequelize);
// // const Image = require("./imageModel")(sequelize);
// // const TechProduct = require("./techProductModel")(sequelize);
// // const TechProductName = require("./techProductNameModel")(sequelize);
// // const Brand = require("./brandModel")(sequelize);

// // // Associations
// // Category.hasMany(SubCategory, { foreignKey: "categoryId", onDelete: "CASCADE" });
// // SubCategory.belongsTo(Category, { foreignKey: "categoryId" });

// // Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
// // Product.belongsTo(Category, { foreignKey: "categoryId" });

// // SubCategory.hasMany(Product, { foreignKey: "subCategoryId", onDelete: "CASCADE" });
// // Product.belongsTo(SubCategory, { foreignKey: "subCategoryId" });

// // Brand.hasMany(Product, { foreignKey: "brandId", onDelete: "CASCADE" });
// // Product.belongsTo(Brand, { foreignKey: "brandId" });

// // Product.hasMany(Image, { foreignKey: "productId", onDelete: "CASCADE" });
// // Image.belongsTo(Product, { foreignKey: "productId" });

// // TechProductName.hasMany(TechProduct, { foreignKey: "techProductNameId", onDelete: "CASCADE" });
// // TechProduct.belongsTo(TechProductName, { foreignKey: "techProductNameId" });

// // Product.hasMany(TechProduct, { foreignKey: "productId", onDelete: "CASCADE" });
// // TechProduct.belongsTo(Product, { foreignKey: "productId" });

// // // Sync helper
// // const syncDatabase = async () => {
// //   try {
// //     await sequelize.authenticate();
// //     console.log("✅ Database connected successfully.");
// //     if (process.env.NODE_ENV === "development") {
// //       await sequelize.sync({ alter: true });
// //       console.log("✅ Models synchronized.");
// //     }
// //   } catch (error) {
// //     console.error("❌ Database error:", error);
// //   }
// // };
// // if (process.env.NODE_ENV === "development") syncDatabase();

// // module.exports = {
// //   sequelize,
// //   Sequelize,
// //   Category,
// //   SubCategory,
// //   Product,
// //   Image,
// //   TechProduct,
// //   TechProductName,
// //   Brand,
// // };

// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");

// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST || "localhost",
//     dialect: process.env.DB_DIALECT || "mysql", // ✅ or postgres depending on your env
//     logging: process.env.NODE_ENV === "development",
//   }
// );

// // =========================
// // Import Models
// // =========================
// const Category = require("../models/categoryModel")(sequelize, Sequelize.DataTypes);
// const SubCategory = require("../models/subCategoryModel")(sequelize, Sequelize.DataTypes);
// const Product = require("../models/productModel")(sequelize, Sequelize.DataTypes);
// const Image = require("../models/imageModel")(sequelize, Sequelize.DataTypes);
// const TechProduct = require("../models/techProductModel")(sequelize, Sequelize.DataTypes);
// const TechProductName = require("../models/techProductNameModel")(sequelize, Sequelize.DataTypes);
// const Brand = require("../models/brandModel")(sequelize, Sequelize.DataTypes);

// // =========================
// // Define Associations
// // =========================

// // Category → SubCategory
// Category.hasMany(SubCategory, { foreignKey: "categoryId", onDelete: "CASCADE" });
// SubCategory.belongsTo(Category, { foreignKey: "categoryId" });

// // Category → Product
// Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
// Product.belongsTo(Category, { foreignKey: "categoryId" });

// // SubCategory → Product
// SubCategory.hasMany(Product, { foreignKey: "subCategoryId", onDelete: "CASCADE" });
// Product.belongsTo(SubCategory, { foreignKey: "subCategoryId" });

// // Brand → Product
// Brand.hasMany(Product, { foreignKey: "brandId", onDelete: "CASCADE" });
// Product.belongsTo(Brand, { foreignKey: "brandId" });

// // Product → Image
// Product.hasMany(Image, { foreignKey: "productId", onDelete: "CASCADE" });
// Image.belongsTo(Product, { foreignKey: "productId" });

// // TechProductName → TechProduct
// TechProductName.hasMany(TechProduct, { foreignKey: "techProductNameId", onDelete: "CASCADE" });
// TechProduct.belongsTo(TechProductName, { foreignKey: "techProductNameId" });

// // Product → TechProduct
// Product.hasMany(TechProduct, { foreignKey: "productId", onDelete: "CASCADE" });
// TechProduct.belongsTo(Product, { foreignKey: "productId" });

// // =========================
// // Database Sync Helper
// // =========================
// const syncDatabase = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Database connected successfully.");

//     if (process.env.NODE_ENV === "development") {
//       await sequelize.sync({ alter: true }); // Auto updates tables
//       console.log("✅ Models synchronized with DB.");
//     }
//   } catch (error) {
//     console.error("❌ Database error:", error.message);
//   }
// };

// // Auto-sync in development
// if (process.env.NODE_ENV === "development") {
//   syncDatabase();
// }

// // =========================
// // Export
// // =========================
// module.exports = {
//   sequelize,
//   Sequelize,
//   Category,
//   SubCategory,
//   Product,
//   Image,
//   TechProduct,
//   TechProductName,
//   Brand,
// };


const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Create sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: process.env.NODE_ENV === "development",
  }
);

// Import models
const Category = require("./categoryModel")(sequelize);
const SubCategory = require("./subCategoryModel")(sequelize);
const Product = require("./productModel")(sequelize);
const Image = require("./imageModel")(sequelize);
const TechProduct = require("./techProductModel")(sequelize);
const TechProductName = require("./techProductNameModel")(sequelize);

// Associations
Category.hasMany(SubCategory, { foreignKey: "categoryId", onDelete: "CASCADE" });
SubCategory.belongsTo(Category, { foreignKey: "categoryId" });

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

SubCategory.hasMany(Product, { foreignKey: "subCategoryId", onDelete: "CASCADE" });
Product.belongsTo(SubCategory, { foreignKey: "subCategoryId" });

Product.hasMany(Image, { foreignKey: "productId", onDelete: "CASCADE" });
Image.belongsTo(Product, { foreignKey: "productId" });

TechProductName.hasMany(TechProduct, { foreignKey: "techProductNameId", onDelete: "CASCADE" });
TechProduct.belongsTo(TechProductName, { foreignKey: "techProductNameId" });

Product.hasMany(TechProduct, { foreignKey: "productId", onDelete: "CASCADE" });
TechProduct.belongsTo(Product, { foreignKey: "productId" });

// Sync models (optional, only for dev mode)
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Uncomment to sync models automatically
    // await sequelize.sync({ alter: true });
    // console.log("✅ All models synchronized.");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

// Call sync only in dev
if (process.env.NODE_ENV === "development") {
  syncDatabase();
}

// Export everything
module.exports = {
  sequelize,
  Sequelize,
  Category,
  SubCategory,
  Product,
  Image,
  TechProduct,
  TechProductName,
};