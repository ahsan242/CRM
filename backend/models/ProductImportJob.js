// src/models/ProductImportJob.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductImportJob = sequelize.define(
    "ProductImportJob",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      totalProducts: { type: DataTypes.INTEGER, allowNull: false },
      processedProducts: { type: DataTypes.INTEGER, defaultValue: 0 },
      successfulImports: { type: DataTypes.INTEGER, defaultValue: 0 },
      failedImports: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: { 
        type: DataTypes.ENUM('scheduled', 'processing', 'completed', 'failed'), 
        defaultValue: 'scheduled' 
      },
      progress: { type: DataTypes.FLOAT, defaultValue: 0 },
      startedAt: { type: DataTypes.DATE, allowNull: true },
      completedAt: { type: DataTypes.DATE, allowNull: true },
      errorMessage: { type: DataTypes.TEXT, allowNull: true }
    },
    {
      tableName: "product_import_jobs",
      timestamps: true,
    }
  );

  ProductImportJob.associate = (models) => {
    ProductImportJob.hasMany(models.ProductImportItem, { 
      foreignKey: "jobId", 
      as: "items" 
    });
  };

  return ProductImportJob;
};