const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Brand = sequelize.define(
    "Brand",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(99), allowNull: false },
      short_descp: { type: DataTypes.TEXT },
      meta_descp: { type: DataTypes.TEXT },
    },
    {
      tableName: "brands",
      timestamps: false,
    }
  );

  Brand.associate = (models) => {
    Brand.hasMany(models.Product, { foreignKey: "brandId", as: "products" });
  };

  return Brand;
};