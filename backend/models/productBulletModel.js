const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductBullet = sequelize.define(
    "ProductBullet",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      point: { type: DataTypes.TEXT, allowNull: false },
      orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
      productId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
      tableName: "product_bullet_points",
      timestamps: true,
    }
  );

  ProductBullet.associate = (models) => {
    ProductBullet.belongsTo(models.Product, { 
      foreignKey: "productId", 
      as: "product" 
    });
  };

  return ProductBullet
};