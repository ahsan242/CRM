

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TechProduct = sequelize.define(
    "TechProduct",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      specId: { type: DataTypes.INTEGER, allowNull: false },
      value: { type: DataTypes.STRING(255), allowNull: false },
      techspecgroupId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "tech_products",
      timestamps: false,
    }
  );

  TechProduct.associate = (models) => {
    TechProduct.belongsTo(models.Product, {foreignKey: "productId", as: "product"});
    TechProduct.belongsTo(models.TechProductName, {foreignKey: "specId", as: "specification"});
    TechProduct.belongsTo(models.TechSpecGroup, {foreignKey: "techspecgroupId", as: "techspecgroup"});
  };

  return TechProduct;
};