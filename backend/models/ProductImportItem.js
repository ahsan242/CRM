// models/ProductImportItem.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductImportItem = sequelize.define('ProductImportItem', {
    productCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'product_import_jobs',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'product_import_items',
    timestamps: true
  });

  ProductImportItem.associate = function(models) {
    ProductImportItem.belongsTo(models.ProductImportJob, {
      foreignKey: 'jobId',
      as: 'job'
    });
  };

  return ProductImportItem;
};