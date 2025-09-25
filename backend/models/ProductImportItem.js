// src/models/ProductImportItem.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductImportItem = sequelize.define(
    "ProductImportItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      jobId: { type: DataTypes.INTEGER, allowNull: false },
      productCode: { type: DataTypes.STRING(100), allowNull: false },
      brand: { type: DataTypes.STRING(100), allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: { 
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'), 
        defaultValue: 'pending' 
      },
      orderIndex: { type: DataTypes.INTEGER, allowNull: false },
      errorMessage: { type: DataTypes.TEXT, allowNull: true },
      productId: { type: DataTypes.INTEGER, allowNull: true } // Reference to created product
    },
    {
      tableName: "product_import_items",
      timestamps: true,
    }
  );

  ProductImportItem.associate = (models) => {
    ProductImportItem.belongsTo(models.ProductImportJob, { 
      foreignKey: "jobId", 
      as: "job" 
    });
    ProductImportItem.belongsTo(models.Product, { 
      foreignKey: "productId", 
      as: "product" 
    });
  };

  return ProductImportItem;
};