

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mfr: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      techPartNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDescp: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      longDescp: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mainImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metaTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bulletsPoint: {
        type: DataTypes.JSON, // ✅ JSON type
        allowNull: true,
      },
      multimediaUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metaDescp: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      upcCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      productSource: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      brandId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      endOfLifeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" });
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });
    Product.belongsTo(models.SubCategory, {
      foreignKey: "subCategoryId",
      as: "subCategory",
    });
    Product.hasMany(models.Image, { foreignKey: "productId", as: "images" });
    Product.hasMany(models.TechProduct, {
      foreignKey: "productId",
      as: "techProducts",
    });
    Product.hasMany(models.ProductDocument, {
      foreignKey: "productId",
      as: "documents",
    });
    Product.hasMany(models.ProductPrice, {
      foreignKey: "productId",
      as: "prices",
    });
    Product.hasMany(models.ProductBulletPoint, {
        foreignKey: "productId",
        as: "bulletPoints",
    });
  };

  // Method to reduce product quantity
  Product.prototype.reduceQuantity = async function (quantityToReduce) {
    if (this.quantity < quantityToReduce) {
      throw new Error(
        `Insufficient stock. Available: ${this.quantity}, Requested: ${quantityToReduce}`
      );
    }

    this.quantity -= quantityToReduce;
    return await this.save();
  };

  // Method to increase product quantity
  Product.prototype.increaseQuantity = async function (quantityToAdd) {
    this.quantity += quantityToAdd;
    return await this.save();
  };

  // Static method to reduce quantity for multiple products
  Product.reduceQuantities = async function (productQuantities) {
    const transaction = await sequelize.transaction();

    try {
      for (const { productId, quantity } of productQuantities) {
        const product = await Product.findByPk(productId, { transaction });

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.quantity < quantity) {
          throw new Error(
            `Insufficient stock for product: ${product.title}. Available: ${product.quantity}, Requested: ${quantity}`
          );
        }

        product.quantity -= quantity;
        await product.save({ transaction });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return Product;
};