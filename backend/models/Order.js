// // backend/models/Order.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed', 
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded'
        ),
        defaultValue: 'pending',
      },
      shippingAddress: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      billingAddress: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      shippingMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "orderId",
      as: "items",
    });
    Order.hasMany(models.OrderHistory, {
      foreignKey: "orderId",
      as: "history",
    });
  };

  // Generate unique order number
  Order.beforeCreate(async (order) => {
    if (!order.orderNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      order.orderNumber = `ORD-${timestamp}-${random}`;
    }
  });

  return Order;
};