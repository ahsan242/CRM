const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Gallery = sequelize.define(
    "Gallery",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      imageTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      originalUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isMain: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      imageType: {
        type: DataTypes.ENUM('gallery'),
        defaultValue: 'gallery',
      },
      icecatId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lowPic: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbPic: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pic500x500: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      highPic: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "galleries",
      timestamps: false,
    }
  );

  Gallery.associate = (models) => {
    Gallery.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product"
    });
  };

  return Gallery;
};