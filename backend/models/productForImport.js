// // backend/models/productForImport.js
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const productForImport = sequelize.define(
//     "productForImport",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       sku: { type: DataTypes.STRING, allowNull: false, unique: true },
//       upcCode: { type: DataTypes.STRING, allowNull: true, unique: false },
//       brand: { type: DataTypes.STRING, allowNull: false },
//       distributor: { type: DataTypes.STRING, allowNull: true },
//       status: {
//         type: DataTypes.ENUM("active", "inactive", "pending"),
//         defaultValue: "inactive",
//       },
//       source: {
//         type: DataTypes.ENUM("external_api", "manual"),
//         defaultValue: "manual",
//       },
//       lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//       createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//       errorMessage: { type: DataTypes.TEXT, allowNull: true },
//       mainProductId: { type: DataTypes.INTEGER, allowNull: true },
//     },
//     {
//       tableName: "product_for_import",
//       timestamps: false,
//       indexes: [
//         { unique: true, fields: ["sku"] },
//         { fields: ["upcCode"] }, // Removed unique constraint since it can be null
//         { fields: ["brand"] },
//         { fields: ["distributor"] }, // NEW INDEX
//         { fields: ["status"] },
//         { fields: ["source"] }, // NEW INDEX
//         { fields: ["lastUpdated"] },
//       ],
//     }
//   );

//   return productForImport;
// };


// backend/models/productForImport.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const productForImport = sequelize.define(
    "productForImport",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      upcCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      distributor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING, // ✅ CHANGED FROM ENUM TO STRING
        defaultValue: "inactive",
        validate: {
          isIn: [["active", "inactive", "pending"]], // ✅ Validation at application level
        },
      },
      source: {
        type: DataTypes.ENUM("external_api", "manual"),
        defaultValue: "manual",
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mainProductId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "product_for_import",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["sku"] },
        { fields: ["upcCode"] },
        { fields: ["brand"] },
        { fields: ["distributor"] },
        { fields: ["status"] },
        { fields: ["source"] },
        { fields: ["lastUpdated"] },
      ],
    }
  );

  // ✅ ADD THE SYNC ENUM FUNCTION HERE
  productForImport.syncEnum = async function() {
    try {
      const queryInterface = sequelize.getQueryInterface();
      
      // Check if we need to update the enum
      const result = await sequelize.query(
        `SELECT unnest(enum_range(NULL::enum_product_for_import_status)) as enum_value`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const currentValues = result.map(r => r.enum_value);
      
      if (!currentValues.includes('pending')) {
        console.log('🔄 Adding "pending" to enum_product_for_import_status...');
        await sequelize.query(
          'ALTER TYPE enum_product_for_import_status ADD VALUE \'pending\''
        );
        console.log('✅ Successfully added "pending" to enum');
      }
    } catch (error) {
      console.log('ℹ️ Enum sync not needed or not supported:', error.message);
    }
  };

  return productForImport; // ✅ RETURN STATEMENT COMES AFTER THE FUNCTION
};