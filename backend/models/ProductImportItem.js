
// models/ProductImportItem.js
module.exports = (sequelize, DataTypes) => {
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
    }
  }, {
    tableName: 'product_import_items'
  });

  ProductImportItem.associate = function(models) {
    ProductImportItem.belongsTo(models.ProductImportJob, {
      foreignKey: 'jobId',
      as: 'job'
    });
  };

  return ProductImportItem;
};