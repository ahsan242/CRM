const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      issueDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'draft',
      },
      paymentTerms: {
        type: DataTypes.STRING,
        defaultValue: 'Due on receipt',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      billingAddress: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      shippingAddress: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      items: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      pdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "invoices",
      timestamps: true,
      indexes: [
        {
          fields: ['invoiceNumber']
        },
        {
          fields: ['orderId']
        },
        {
          fields: ['userId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['issueDate']
        }
      ]
    }
  );

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
    });
    Invoice.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  // Generate unique invoice number
  Invoice.beforeCreate(async (invoice) => {
    if (!invoice.invoiceNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      invoice.invoiceNumber = `INV-${timestamp}-${random}`;
    }
  });

  return Invoice;
};