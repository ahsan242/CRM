// // backend/models/ProductPrice.js
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const ProductPrice = sequelize.define(
//     "ProductPrice",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       productId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       sku: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       sellerName: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//         defaultValue: 0.0,
//       },
//       currency: {
//         type: DataTypes.STRING(10),
//         allowNull: false,
//         defaultValue: "USD",
//       },
//       stockQuantity: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         defaultValue: 0,
//       },
//       source: {
//         type: DataTypes.ENUM("excel", "api", "manual"),
//         allowNull: false,
//         defaultValue: "manual",
//       },
//       lastUpdated: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "product_prices",
//       timestamps: true,
//     }
//   );

//   ProductPrice.associate = (models) => {
//     ProductPrice.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
//   };

//   return ProductPrice;
// };
const { DataTypes } = require("sequelize");

// Factory function to create ProductPrice model for a specific seller
const createProductPriceModel = (sequelize, sellerName) => {
  const tableName = `product_prices_${sellerName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  
  const ProductPrice = sequelize.define(
    "ProductPrice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sellerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "USD",
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      source: {
        type: DataTypes.ENUM("excel", "api", "manual"),
        allowNull: false,
        defaultValue: "manual",
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: tableName,
      timestamps: true,
    }
  );

  ProductPrice.associate = (models) => {
    ProductPrice.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
  };

  return ProductPrice;
};

// Main ProductPrice model for general operations (backward compatibility)
module.exports = (sequelize) => {
  const ProductPrice = sequelize.define(
    "ProductPrice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sellerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "USD",
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      source: {
        type: DataTypes.ENUM("excel", "api", "manual"),
        allowNull: false,
        defaultValue: "manual",
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "product_prices",
      timestamps: true,
    }
  );

  ProductPrice.associate = (models) => {
    ProductPrice.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
  };

  // Attach the factory function to the model
  ProductPrice.createSellerModel = (sellerName) => {
    return createProductPriceModel(sequelize, sellerName);
  };

  return ProductPrice;
};

// Export the factory function separately
module.exports.createProductPriceModel = createProductPriceModel;