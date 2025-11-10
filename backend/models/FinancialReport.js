const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FinancialReport = sequelize.define(
    "FinancialReport",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reportType: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom'),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalRevenue: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalCost: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      totalExpenses: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      netProfit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      taxCollected: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      shippingRevenue: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      discountGiven: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.0,
      },
      orderCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      productCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      customerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      topPerformingProducts: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      salesByPeriod: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      profitMargin: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
      },
      averageOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
    },
    {
      tableName: "financial_reports",
      timestamps: true,
      indexes: [
        {
          fields: ['reportType']
        },
        {
          fields: ['startDate']
        },
        {
          fields: ['endDate']
        }
      ]
    }
  );

  return FinancialReport;
};