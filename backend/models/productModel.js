
// src/models/Product.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sku: { type: DataTypes.STRING(99), allowNull: true },
      mfr: { type: DataTypes.STRING(99), allowNull: true },
      techPartNo: { type: DataTypes.STRING(99), allowNull: true },
      shortDescp: { type: DataTypes.TEXT, allowNull: true },
      longDescp: { type: DataTypes.TEXT, allowNull: true },
      mainImage: { type: DataTypes.STRING(299), allowNull: true },
      metaTitle: { type: DataTypes.STRING(255), allowNull: true },
      metaDescp: { type: DataTypes.TEXT, allowNull: true },
      ucpCode: { type: DataTypes.STRING(99), allowNull: true },
      productSource: { type: DataTypes.STRING(99), allowNull: true },
      userId: { type: DataTypes.TEXT, allowNull: true },
      title: { type: DataTypes.TEXT, allowNull: true },
      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, allowNull: true },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
      brandId: { type: DataTypes.INTEGER, allowNull: true },
      categoryId: { type: DataTypes.INTEGER, allowNull: true },
      subCategoryId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" });
    Product.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" });
    Product.belongsTo(models.SubCategory, { foreignKey: "subCategoryId", as: "subCategory" });
    Product.hasMany(models.Image, { foreignKey: "productId", as: "images" });
    Product.hasMany(models.TechProduct, { foreignKey: "productId", as: "techProducts" });
  };

  return Product;
};