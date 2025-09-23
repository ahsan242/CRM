

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TechSpecGroup = sequelize.define(
    "TechSpecGroup",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: "tech_product_names",
      timestamps: false,
    }
  );

  TechSpecGroup.associate = (models) => {
    TechSpecGroup.hasMany(models.TechProduct, {   foreignKey: "specId", as: "techProducts" });
  };

  return TechSpecGroup;
};