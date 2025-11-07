// // // backend/models/Cart.js
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Cart = sequelize.define(
//     "Cart",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       sessionId: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       items: {
//         type: DataTypes.JSONB,
//         defaultValue: [],
//       },
//       totalAmount: {
//         type: DataTypes.DECIMAL(10, 2),
//         defaultValue: 0.0,
//       },
//       expiresAt: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//     },
//     {
//       tableName: "carts",
//       timestamps: true,
//     }
//   );

//   Cart.associate = (models) => {
//     Cart.belongsTo(models.User, {
//       foreignKey: "userId",
//       as: "user",
//     });
//   };

//   return Cart;
// };

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      items: {
        type: DataTypes.JSONB,
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue('items');
          return Array.isArray(rawValue) ? rawValue : [];
        }
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      itemCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('active', 'abandoned', 'converted'),
        defaultValue: 'active'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "carts",
      timestamps: true,
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  // Calculate totals before save
  Cart.beforeSave(async (cart) => {
    if (cart.items && Array.isArray(cart.items)) {
      let totalAmount = 0;
      let itemCount = 0;
      
      for (const item of cart.items) {
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
        totalAmount += itemTotal;
        itemCount += item.quantity || 0;
      }
      
      cart.totalAmount = totalAmount;
      cart.itemCount = itemCount;
    }
  });

  return Cart;
};