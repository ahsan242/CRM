
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sku: { type: DataTypes.STRING(99), allowNull: false },
      mfr: { type: DataTypes.STRING(99) },
      techPartNo: { type: DataTypes.STRING(99) },
      shortDescp: { type: DataTypes.TEXT },
      longDescp: { type: DataTypes.TEXT },
      mainImage: { type: DataTypes.STRING(299) },
      metaTitle: { type: DataTypes.STRING(255) },
      metaDescp: { type: DataTypes.TEXT },
      ucpCode: { type: DataTypes.STRING(99) },
      productSource: { type: DataTypes.STRING(99) },
      userId: { type: DataTypes.TEXT },
      title: { type: DataTypes.TEXT },
      brandId: { type: DataTypes.INTEGER, allowNull: true }, // Ensure this exists
      categoryId: { type: DataTypes.INTEGER, allowNull: true },
      subCategoryId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brandId" , as: "brand" });
    Product.belongsTo(models.Category, { foreignKey: "categoryId" ,   as: "category" });
    Product.belongsTo(models.SubCategory, { foreignKey: "subCategoryId", as: "subCategory" });
// Product.hasMany(models.Image, { foreignKey: "productId", as: "images" });
    Product.hasMany(models.Image, { foreignKey: "productId" , as: "images" });
    Product.hasMany(models.TechProduct, { foreignKey: "productId" , as: "techProducts" });
  };

  return Product;
};