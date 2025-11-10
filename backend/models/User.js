
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(99), allowNull: false },
      email: { type: DataTypes.STRING(99), allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "superadmin",
          "boss",
          "operator",
          "customer"
        ),
        defaultValue: "customer",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verificationTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verificationAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastVerificationAttempt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password") && user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  User.associate = (models) => {
    User.hasOne(models.UserProfile, {
      foreignKey: "userId",
      as: "profile",
      onDelete: "CASCADE"
    });
    User.hasMany(models.Order, {
      foreignKey: "userId",
      as: "orders"
    });
    User.hasMany(models.Cart, {
      foreignKey: "userId",
      as: "carts"
    });
  };

  return User;
};