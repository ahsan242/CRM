const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductDocument = sequelize.define(
    "ProductDocument",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      documentUrl: { type: DataTypes.TEXT, allowNull: false },
      contentType: { type: DataTypes.STRING(100), allowNull: false },
      documentType: { type: DataTypes.STRING(100), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      productId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
      tableName: "product_documents",
      timestamps: true,
    }
  );

  ProductDocument.associate = (models) => {
    ProductDocument.belongsTo(models.Product, { 
      foreignKey: "productId", 
      as: "product" 
    });
  };

  return ProductDocument;
};