const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PunchoutToken = sequelize.define(
    "PunchoutToken",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payload_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      buyer_cookie: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      browser_form_post_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      supplier_setup_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "punchout_tokens",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['token']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['expires_at']
        },
        {
          fields: ['is_used']
        }
      ]
    }
  );

  PunchoutToken.associate = (models) => {
    PunchoutToken.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return PunchoutToken;
};