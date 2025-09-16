
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SubCategory = sequelize.define(
    "SubCategory",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(99), allowNull: false },
      parentId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "subcategories",
      timestamps: false,
    }
  );

  SubCategory.associate = (models) => {
    SubCategory.hasMany(models.Product, { foreignKey: "subCategoryId", as: "products" });
  };

  return SubCategory;
};