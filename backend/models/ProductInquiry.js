const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductInquiry = sequelize.define(
    "ProductInquiry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      inquiryType: {
        type: DataTypes.ENUM(
          'pricing',
          'shipping',
          'specs',
          'availability',
          'other'
        ),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      productSku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'new',
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "product_inquiries",
      timestamps: true,
      indexes: [
        {
          fields: ['email']
        },
        {
          fields: ['inquiryType']
        },
        {
          fields: ['status']
        },
        {
          fields: ['productId']
        },
        {
          fields: ['createdAt']
        }
      ]
    }
  );

  ProductInquiry.associate = (models) => {
    ProductInquiry.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return ProductInquiry;
};