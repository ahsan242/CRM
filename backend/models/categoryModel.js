// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Category = sequelize.define(
//     "Category",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       title: { type: DataTypes.STRING(99), allowNull: false },
//       metaTitle: { type: DataTypes.STRING(255) },
//       metaDescp: { type: DataTypes.TEXT },
//     },
//     {
//       tableName: "categories",
//       timestamps: false,
//     }
//   );

//   Category.associate = (models) => {
//     Category.hasMany(models.Product, { foreignKey: "categoryId", as: "products" });
//   };

//   return Category;
// };


const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(99), allowNull: false },
      metaTitle: { type: DataTypes.STRING(255) },
      metaDescp: { type: DataTypes.TEXT },
    },
    {
      tableName: "categories",
      timestamps: false,
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Product, { foreignKey: "categoryId", as: "products" });
  };

  return Category;
};