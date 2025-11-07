const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EmailVerification = sequelize.define(
    "EmailVerification",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      verificationCode: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      verificationToken: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "email_verifications",
      timestamps: true,
      indexes: [
        {
          fields: ['email']
        },
        {
          fields: ['verificationToken']
        },
        {
          fields: ['expiresAt']
        }
      ]
    }
  );

  EmailVerification.associate = (models) => {
    EmailVerification.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return EmailVerification;
};