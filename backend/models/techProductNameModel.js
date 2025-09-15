

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TechProductName = sequelize.define(
    "TechProductName",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: "tech_product_names",
      timestamps: false,
    }
  );

  TechProductName.associate = (models) => {
    TechProductName.hasMany(models.TechProduct, {   foreignKey: "specId", as: "techProducts" });
  };

  return TechProductName;
};