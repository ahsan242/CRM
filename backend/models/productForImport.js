
// backend/models/productForImport.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const productForImport = sequelize.define(
    "productForImport",
    {
      id: {         type: DataTypes.INTEGER,         autoIncrement: true,         primaryKey: true       },
      sku: {         type: DataTypes.STRING,         allowNull: false,        unique: true       },
      upcCode: {         type: DataTypes.STRING,         allowNull: true,          unique: false       },
      brand: {         type: DataTypes.STRING,         allowNull: false       },
      distributor: {          type: DataTypes.STRING,        allowNull: true      },
      status: {      type: DataTypes.ENUM('active', 'inactive'),         defaultValue: 'inactive'       },
      source: {         type: DataTypes.ENUM('external_api', 'manual'),        defaultValue: 'manual'      },
      lastUpdated: {         type: DataTypes.DATE,         defaultValue: DataTypes.NOW       },
      createdAt: {         type: DataTypes.DATE,         defaultValue: DataTypes.NOW       }
    },
    {
      tableName: "product_for_import",
      timestamps: false,
      indexes: [
        { unique: true, fields: ['sku'] },
        { fields: ['upcCode'] },  // Removed unique constraint since it can be null
        { fields: ['brand'] },
        { fields: ['distributor'] },  // NEW INDEX
        { fields: ['status'] },
        { fields: ['source'] },  // NEW INDEX
        { fields: ['lastUpdated'] }
      ]
    }
  );

  return productForImport;
};