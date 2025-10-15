// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const ProductBulletPoint  = sequelize.define(
//     "ProductBulletPoint",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       point: { type: DataTypes.TEXT, allowNull: false },
//       orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
//       productId: { type: DataTypes.INTEGER, allowNull: false }
//     },
//     {
//       tableName: "product_bullet_points",
//       timestamps: true,
//     }
//   );

//   ProductBulletPoint.associate = (models) => {
//     ProductBulletPoint.belongsTo(models.Product, { 
//       foreignKey: "productId", 
//       as: "product" 
//     });
//   };

//   return ProductBulletPoint;
// };

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductBulletPoint = sequelize.define(
    "ProductBulletPoint",
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

  ProductBulletPoint.associate = (models) => {
    ProductBulletPoint.belongsTo(models.Product, { 
      foreignKey: "productId", 
      as: "product" 
    });
  };

  return ProductBulletPoint;
};