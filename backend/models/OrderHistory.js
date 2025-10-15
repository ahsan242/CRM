// // backend/models/OrderHistory.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderHistory = sequelize.define(
    "OrderHistory",
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "order_history",
      timestamps: false,
    }
  );

  OrderHistory.associate = (models) => {
    OrderHistory.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
    });
  };

  return OrderHistory;
};