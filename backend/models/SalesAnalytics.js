const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SalesAnalytics = sequelize.define(
    "SalesAnalytics",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      period: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      periodType: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
      },
      totalSales: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalOrders: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalProductsSold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      averageOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      totalProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalTax: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalShipping: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalDiscount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      topSellingProducts: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      salesByCategory: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      salesByBrand: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      customerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      newCustomers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "sales_analytics",
      timestamps: true,
      indexes: [
        {
          fields: ['period']
        },
        {
          fields: ['periodType']
        },
        {
          unique: true,
          fields: ['period', 'periodType']
        }
      ]
    }
  );

  return SalesAnalytics;
};