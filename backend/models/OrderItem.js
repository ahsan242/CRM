
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const OrderItem = sequelize.define(
//     "OrderItem",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       orderId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       productId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       productName: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       productSku: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       productImage: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       quantity: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         validate: {
//           min: 1,
//         },
//       },
//       unitPrice: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       totalPrice: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       sellerName: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       status: {
//         type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
//         defaultValue: 'pending'
//       },
//     },
//     {
//       tableName: "order_items",
//       timestamps: true,
//     }
//   );

//   OrderItem.associate = (models) => {
//     OrderItem.belongsTo(models.Order, {
//       foreignKey: "orderId",
//       as: "order",
//     });
//     OrderItem.belongsTo(models.Product, {
//       foreignKey: "productId",
//       as: "product",
//     });
//   };

//   // Calculate total price before create/update
//   OrderItem.beforeSave((orderItem) => {
//     orderItem.totalPrice = orderItem.quantity * orderItem.unitPrice;
//   });

//   return OrderItem;
// };

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productSku: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      sellerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled', 'returned'),
        defaultValue: 'pending'
      },
      // New fields for analytics
      costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      profit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
    },
    {
      tableName: "order_items",
      timestamps: true,
      indexes: [
        {
          fields: ['orderId']
        },
        {
          fields: ['productId']
        },
        {
          fields: ['productSku']
        },
        {
          fields: ['status']
        }
      ]
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  // Calculate total price and profit before create/update
  OrderItem.beforeSave((orderItem) => {
    orderItem.totalPrice = orderItem.quantity * orderItem.unitPrice;
    
    // Calculate profit if cost price is available
    if (orderItem.costPrice) {
      orderItem.profit = (orderItem.unitPrice - orderItem.costPrice) * orderItem.quantity;
    }
  });

  return OrderItem;
};