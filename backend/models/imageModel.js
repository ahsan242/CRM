
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Image = sequelize.define(
    "Image",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      imageTitle: { type: DataTypes.STRING(255) },
      url: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: "images",
      timestamps: false,
    }
  );

  Image.associate = (models) => {
    Image.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
  };

  return Image;
};