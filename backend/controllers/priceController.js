// // backend/controllers/priceController.js
// const db = require("../config/db");
// const Product = db.Product;
// const ProductPrice = db.ProductPrice;
// const { Op } = require("sequelize");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const csv = require("csv-parser");
// const xlsx = require("xlsx");

// // Configure multer for price file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, "..", "uploads", "prices");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const ext = path.extname(file.originalname);
//     cb(null, `price_${timestamp}${ext}`);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "text/csv",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only CSV and Excel files are allowed!"), false);
//     }
//   },
// });

// const uploadPriceFile = upload.single("priceFile");

// // ===== PRICE MANAGEMENT CONTROLLERS =====

// /**
//  * @desc Add or update product price from a seller
//  * @route POST /api/prices
//  * @access Public
//  */
// exports.addOrUpdatePrice = async (req, res) => {
//   try {
//     const {
//       productId,
//       sku,
//       sellerName,
//       price,
//       currency = "USD",
//       stockQuantity = 0,
//       source = "manual"
//     } = req.body;

//     if (!sku || !sellerName || !price) {
//       return res.status(400).json({
//         success: false,
//         error: "SKU, sellerName, and price are required fields"
//       });
//     }

//     let product;
//     if (productId) {
//       product = await Product.findByPk(productId);
//     } else {
//       product = await Product.findOne({ where: { sku } });
//     }

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: `Product not found with SKU: ${sku}`
//       });
//     }

//     const existingPrice = await ProductPrice.findOne({
//       where: {
//         productId: product.id,
//         sku: sku,
//         sellerName: sellerName
//       }
//     });

//     let priceRecord;
//     if (existingPrice) {
//       priceRecord = await existingPrice.update({
//         price: parseFloat(price),
//         currency,
//         stockQuantity: parseInt(stockQuantity),
//         source,
//         lastUpdated: new Date()
//       });
//     } else {
//       priceRecord = await ProductPrice.create({
//         productId: product.id,
//         sku: sku,
//         sellerName: sellerName,
//         price: parseFloat(price),
//         currency,
//         stockQuantity: parseInt(stockQuantity),
//         source,
//         lastUpdated: new Date()
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: existingPrice ? "Price updated successfully" : "Price added successfully",
//       data: priceRecord
//     });

//   } catch (error) {
//     console.error("Error adding/updating price:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to add/update price"
//     });
//   }
// };

// /**
//  * @desc Bulk import prices from CSV/Excel file
//  * @route POST /api/prices/bulk-import
//  * @access Public
//  */
// exports.bulkImportPrices = async (req, res) => {
//   uploadPriceFile(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({
//         success: false,
//         error: err.message
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "Price file is required"
//       });
//     }

//     const { sellerName, source = "excel" } = req.body;
    
//     if (!sellerName) {
//       fs.unlinkSync(req.file.path);
//       return res.status(400).json({
//         success: false,
//         error: "Seller name is required for bulk import"
//       });
//     }

//     try {
//       const filePath = req.file.path;
//       const fileExt = path.extname(req.file.originalname).toLowerCase();
      
//       let priceData = [];
      
//       if (fileExt === '.csv') {
//         priceData = await parseCSVFile(filePath);
//       } else if (fileExt === '.xlsx' || fileExt === '.xls') {
//         priceData = await parseExcelFile(filePath);
//       } else {
//         fs.unlinkSync(filePath);
//         return res.status(400).json({
//           success: false,
//           error: "Unsupported file format. Only CSV and Excel files are supported."
//         });
//       }

//       if (priceData.length === 0) {
//         fs.unlinkSync(filePath);
//         return res.status(400).json({
//           success: false,
//           error: "No valid price data found in the file"
//         });
//       }

//       console.log(`Processing ${priceData.length} price records for seller: ${sellerName}`);

//       const results = {
//         total: priceData.length,
//         successful: 0,
//         failed: 0,
//         errors: []
//       };

//       // Process each price record
//       for (const [index, record] of priceData.entries()) {
//         try {
//           // Handle different column names from seller files
//           const sku = record.sku || record.SKU;
//           const price = record.price || record.Price;
//           const salePrice = record['discount price'] || record['Discount Price'] || record.salePrice;
//           const stockQuantity = record['stock quantity'] || record.quantity || record.stockQuantity || 100;

//           if (!sku || !price) {
//             results.failed++;
//             results.errors.push({
//               row: index + 1,
//               sku: sku || 'Missing',
//               error: "SKU and price are required"
//             });
//             continue;
//           }

//           const product = await Product.findOne({ where: { sku } });
//           if (!product) {
//             results.failed++;
//             results.errors.push({
//               row: index + 1,
//               sku,
//               error: "Product not found with this SKU"
//             });
//             continue;
//           }

//           const existingPrice = await ProductPrice.findOne({
//             where: {
//               productId: product.id,
//               sku,
//               sellerName
//             }
//           });

//           if (existingPrice) {
//             await existingPrice.update({
//               price: parseFloat(price),
//               stockQuantity: parseInt(stockQuantity),
//               currency: "USD",
//               source,
//               lastUpdated: new Date()
//             });
//           } else {
//             await ProductPrice.create({
//               productId: product.id,
//               sku,
//               sellerName,
//               price: parseFloat(price),
//               stockQuantity: parseInt(stockQuantity),
//               currency: "USD",
//               source,
//               lastUpdated: new Date()
//             });
//           }

//           results.successful++;

//         } catch (error) {
//           results.failed++;
//           results.errors.push({
//             row: index + 1,
//             sku: record.sku || record.SKU || 'Unknown',
//             error: error.message
//           });
//         }
//       }

//       fs.unlinkSync(filePath);

//       res.status(200).json({
//         success: true,
//         message: `Bulk import completed: ${results.successful} successful, ${results.failed} failed`,
//         data: {
//           sellerName,
//           source,
//           file: req.file.originalname,
//           results: results,
//           errorCount: results.errors.length
//         }
//       });

//     } catch (error) {
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
      
//       console.error("Error in bulk import:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message || "Failed to process bulk import"
//       });
//     }
//   });
// };

// /**
//  * @desc Get all sellers
//  * @route GET /api/prices/sellers
//  * @access Public
//  */
// exports.getSellers = async (req, res) => {
//   try {
//     const sellers = await ProductPrice.findAll({
//       attributes: [
//         [db.sequelize.fn('DISTINCT', db.sequelize.col('sellerName')), 'sellerName']
//       ],
//       where: {
//         sellerName: {
//           [Op.ne]: null,
//           [Op.ne]: ''
//         }
//       },
//       order: [['sellerName', 'ASC']]
//     });

//     const sellerList = sellers.map(s => s.sellerName);

//     res.status(200).json({
//       success: true,
//       data: sellerList,
//       count: sellerList.length
//     });

//   } catch (error) {
//     console.error("Error fetching sellers:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch sellers"
//     });
//   }
// };

// /**
//  * @desc Get prices by seller
//  * @route GET /api/prices/seller/:sellerName
//  * @access Public
//  */
// exports.getPricesBySeller = async (req, res) => {
//   try {
//     const { sellerName } = req.params;
//     const { page = 1, limit = 50, inStock, sortBy = "sku" } = req.query;
//     const offset = (page - 1) * limit;

//     const whereClause = { sellerName };
    
//     if (inStock === "true") {
//       whereClause.stockQuantity = { [Op.gt]: 0 };
//     } else if (inStock === "false") {
//       whereClause.stockQuantity = { [Op.eq]: 0 };
//     }

//     const { count, rows: prices } = await ProductPrice.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["id", "title", "sku", "mfr", "mainImage", "brandId", "categoryId"]
//         }
//       ],
//       order: [[sortBy, "ASC"]],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       distinct: true
//     });

//     res.status(200).json({
//       success: true,
//       data: prices,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count,
//         pages: Math.ceil(count / limit)
//       },
//       summary: {
//         sellerName,
//         totalProducts: count,
//         inStockProducts: await ProductPrice.count({
//           where: { 
//             sellerName,
//             stockQuantity: { [Op.gt]: 0 }
//           }
//         })
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching prices by seller:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch prices by seller"
//     });
//   }
// };

// // ===== HELPER FUNCTIONS =====

// /**
//  * Parse CSV file
//  */
// const parseCSVFile = (filePath) => {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (data) => {
//         const normalizedData = {};
//         Object.keys(data).forEach(key => {
//           const normalizedKey = key.toLowerCase().trim();
//           normalizedData[normalizedKey] = data[key];
//         });
//         results.push(normalizedData);
//       })
//       .on('end', () => {
//         resolve(results);
//       })
//       .on('error', (error) => {
//         reject(error);
//       });
//   });
// };

// /**
//  * Parse Excel file
//  */
// const parseExcelFile = (filePath) => {
//   try {
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(worksheet);
    
//     return data.map(row => {
//       const normalizedRow = {};
//       Object.keys(row).forEach(key => {
//         const normalizedKey = key.toLowerCase().trim();
//         normalizedRow[normalizedKey] = row[key];
//       });
//       return normalizedRow;
//     });
//   } catch (error) {
//     throw new Error(`Failed to parse Excel file: ${error.message}`);
//   }
// };

// // Other controller methods remain the same...
// exports.getProductPrices = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { sellerName, sortBy = "price", sortOrder = "ASC" } = req.query;

//     const whereClause = { productId };
//     if (sellerName) {
//       whereClause.sellerName = { [Op.iLike]: `%${sellerName}%` };
//     }

//     const validSortFields = ["price", "stockQuantity", "lastUpdated", "sellerName"];
//     const validSortOrders = ["ASC", "DESC"];
    
//     const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "price";
//     const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "ASC";

//     const prices = await ProductPrice.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["id", "title", "sku", "mfr", "mainImage"]
//         }
//       ],
//       order: [[finalSortBy, finalSortOrder]]
//     });

//     res.status(200).json({
//       success: true,
//       data: prices,
//       count: prices.length,
//       filters: {
//         productId,
//         sellerName: sellerName || "all",
//         sortBy: finalSortBy,
//         sortOrder: finalSortOrder
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching product prices:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch product prices"
//     });
//   }
// };

// exports.getPricesBySku = async (req, res) => {
//   try {
//     const { sku } = req.params;
//     const { sellerName, inStock, sortBy = "price" } = req.query;

//     const whereClause = { sku };
    
//     if (sellerName) {
//       whereClause.sellerName = { [Op.iLike]: `%${sellerName}%` };
//     }
    
//     if (inStock === "true") {
//       whereClause.stockQuantity = { [Op.gt]: 0 };
//     } else if (inStock === "false") {
//       whereClause.stockQuantity = { [Op.eq]: 0 };
//     }

//     const prices = await ProductPrice.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["id", "title", "sku", "mfr", "mainImage", "brandId", "categoryId"]
//         }
//       ],
//       order: [[sortBy, "ASC"]]
//     });

//     const bestPrice = prices.length > 0 
//       ? prices.reduce((min, price) => price.price < min.price ? price : min, prices[0])
//       : null;

//     res.status(200).json({
//       success: true,
//       data: prices,
//       bestPrice: bestPrice,
//       count: prices.length,
//       summary: {
//         sku,
//         totalSellers: prices.length,
//         inStockSellers: prices.filter(p => p.stockQuantity > 0).length,
//         priceRange: prices.length > 0 ? {
//           min: Math.min(...prices.map(p => p.price)),
//           max: Math.max(...prices.map(p => p.price)),
//           average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
//         } : null
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching prices by SKU:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch prices by SKU"
//     });
//   }
// };

// exports.getBestPrice = async (req, res) => {
//   try {
//     const { sku } = req.params;
//     const { includeOutOfStock = "false" } = req.query;

//     const whereClause = { sku };
    
//     if (includeOutOfStock === "false") {
//       whereClause.stockQuantity = { [Op.gt]: 0 };
//     }

//     const prices = await ProductPrice.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["id", "title", "sku", "mfr", "mainImage"]
//         }
//       ],
//       order: [["price", "ASC"]]
//     });

//     if (prices.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: `No prices found for SKU: ${sku}`
//       });
//     }

//     const bestPrice = prices[0];
//     const allPrices = prices.map(p => ({
//       sellerName: p.sellerName,
//       price: p.price,
//       stockQuantity: p.stockQuantity,
//       currency: p.currency,
//       lastUpdated: p.lastUpdated
//     }));

//     res.status(200).json({
//       success: true,
//       data: {
//         bestPrice: bestPrice,
//         allPrices: allPrices,
//         comparison: {
//           totalSellers: prices.length,
//           priceRange: {
//             lowest: bestPrice.price,
//             highest: prices[prices.length - 1].price,
//             average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
//           }
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching best price:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch best price"
//     });
//   }
// };

// exports.updatePrice = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { price, stockQuantity, currency } = req.body;

//     const priceRecord = await ProductPrice.findByPk(id);
//     if (!priceRecord) {
//       return res.status(404).json({
//         success: false,
//         error: "Price record not found"
//       });
//     }

//     const updateData = { lastUpdated: new Date() };
    
//     if (price !== undefined) updateData.price = parseFloat(price);
//     if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
//     if (currency !== undefined) updateData.currency = currency;

//     const updatedPrice = await priceRecord.update(updateData);

//     res.status(200).json({
//       success: true,
//       message: "Price updated successfully",
//       data: updatedPrice
//     });

//   } catch (error) {
//     console.error("Error updating price:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to update price"
//     });
//   }
// };

// exports.deletePrice = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const priceRecord = await ProductPrice.findByPk(id);
//     if (!priceRecord) {
//       return res.status(404).json({
//         success: false,
//         error: "Price record not found"
//       });
//     }

//     await priceRecord.destroy();

//     res.status(200).json({
//       success: true,
//       message: "Price deleted successfully"
//     });

//   } catch (error) {
//     console.error("Error deleting price:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to delete price"
//     });
//   }
// };

// exports.comparePrices = async (req, res) => {
//   try {
//     const { sku } = req.params;
//     const { sellers } = req.query;

//     const whereClause = { sku };
    
//     if (sellers) {
//       const sellerArray = Array.isArray(sellers) ? sellers : sellers.split(',');
//       whereClause.sellerName = { [Op.in]: sellerArray };
//     }

//     const prices = await ProductPrice.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Product,
//           as: "product",
//           attributes: ["id", "title", "sku", "mfr", "mainImage"]
//         }
//       ],
//       order: [["price", "ASC"]]
//     });

//     if (prices.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: `No prices found for SKU: ${sku}`
//       });
//     }

//     const comparison = {
//       product: {
//         id: prices[0].product.id,
//         title: prices[0].product.title,
//         sku: prices[0].product.sku,
//         mfr: prices[0].product.mfr
//       },
//       sellers: prices.map(price => ({
//         sellerName: price.sellerName,
//         price: price.price,
//         stockQuantity: price.stockQuantity,
//         currency: price.currency,
//         lastUpdated: price.lastUpdated,
//         source: price.source
//       })),
//       summary: {
//         totalSellers: prices.length,
//         inStockSellers: prices.filter(p => p.stockQuantity > 0).length,
//         bestPrice: prices[0],
//         priceRange: {
//           lowest: prices[0].price,
//           highest: prices[prices.length - 1].price,
//           average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
//         }
//       }
//     };

//     res.status(200).json({
//       success: true,
//       data: comparison
//     });

//   } catch (error) {
//     console.error("Error comparing prices:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to compare prices"
//     });
//   }
// };

const db = require("../config/db");
const Product = db.Product;
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

// Configure multer for price file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "prices");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `price_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed!"), false);
    }
  },
});

const uploadPriceFile = upload.single("priceFile");

// ===== PRICE MANAGEMENT CONTROLLERS =====

/**
 * @desc Add or update product price from a seller
 * @route POST /api/prices
 * @access Public
 */
exports.addOrUpdatePrice = async (req, res) => {
  try {
    const {
      productId,
      sku,
      sellerName,
      price,
      currency = "USD",
      stockQuantity = 0,
      source = "manual"
    } = req.body;

    if (!sku || !sellerName || !price) {
      return res.status(400).json({
        success: false,
        error: "SKU, sellerName, and price are required fields"
      });
    }

    let product;
    if (productId) {
      product = await Product.findByPk(productId);
    } else {
      product = await Product.findOne({ where: { sku } });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with SKU: ${sku}`
      });
    }

    // Get seller-specific price model
    const SellerPriceModel = await db.getSellerPriceModel(sellerName);

    const existingPrice = await SellerPriceModel.findOne({
      where: {
        productId: product.id,
        sku: sku,
        sellerName: sellerName
      }
    });

    let priceRecord;
    if (existingPrice) {
      priceRecord = await existingPrice.update({
        price: parseFloat(price),
        currency,
        stockQuantity: parseInt(stockQuantity),
        source,
        lastUpdated: new Date()
      });
    } else {
      priceRecord = await SellerPriceModel.create({
        productId: product.id,
        sku: sku,
        sellerName: sellerName,
        price: parseFloat(price),
        currency,
        stockQuantity: parseInt(stockQuantity),
        source,
        lastUpdated: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: existingPrice ? "Price updated successfully" : "Price added successfully",
      data: priceRecord,
      table: SellerPriceModel.tableName
    });

  } catch (error) {
    console.error("Error adding/updating price:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add/update price"
    });
  }
};

/**
 * @desc Bulk import prices from CSV/Excel file
 * @route POST /api/prices/bulk-import
 * @access Public
 */
exports.bulkImportPrices = async (req, res) => {
  console.log('🔔 Bulk import prices endpoint called');
  
  uploadPriceFile(req, res, async (err) => {
    if (err) {
      console.error('❌ File upload error:', err.message);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Price file is required"
      });
    }

    const { sellerName, source = "excel" } = req.body;
    
    if (!sellerName) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: "Seller name is required for bulk import"
      });
    }

    try {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      
      let priceData = [];
      
      if (fileExt === '.csv') {
        priceData = await parseCSVFile(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        priceData = await parseExcelFile(filePath);
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          error: "Unsupported file format. Only CSV and Excel files are supported."
        });
      }

      if (priceData.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          error: "No valid price data found in the file"
        });
      }

      console.log(`🔄 Processing ${priceData.length} price records for seller: ${sellerName}`);

      // Get seller-specific price model
      const SellerPriceModel = await db.getSellerPriceModel(sellerName);

      const results = {
        total: priceData.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Process each price record
      for (const [index, record] of priceData.entries()) {
        try {
          // Handle different column names from seller files
          const sku = record.sku || record.SKU || record.productcode || record.ProductCode;
          const price = record.price || record.Price || record.cost || record.Cost;
          const stockQuantity = record['stock quantity'] || record.quantity || record.stockQuantity || record.stock || 100;

          if (!sku || !price) {
            results.failed++;
            results.errors.push({
              row: index + 1,
              sku: sku || 'Missing',
              error: "SKU and price are required"
            });
            continue;
          }

          const product = await Product.findOne({ where: { sku } });
          if (!product) {
            results.failed++;
            results.errors.push({
              row: index + 1,
              sku,
              error: "Product not found with this SKU"
            });
            continue;
          }

          const existingPrice = await SellerPriceModel.findOne({
            where: {
              productId: product.id,
              sku,
              sellerName
            }
          });

          if (existingPrice) {
            await existingPrice.update({
              price: parseFloat(price),
              stockQuantity: parseInt(stockQuantity),
              currency: "USD",
              source,
              lastUpdated: new Date()
            });
          } else {
            await SellerPriceModel.create({
              productId: product.id,
              sku,
              sellerName,
              price: parseFloat(price),
              stockQuantity: parseInt(stockQuantity),
              currency: "USD",
              source,
              lastUpdated: new Date()
            });
          }

          results.successful++;

        } catch (error) {
          results.failed++;
          results.errors.push({
            row: index + 1,
            sku: record.sku || record.SKU || record.productcode || 'Unknown',
            error: error.message
          });
        }
      }

      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.log(`✅ Bulk import completed: ${results.successful} successful, ${results.failed} failed`);

      res.status(200).json({
        success: true,
        message: `Bulk import completed: ${results.successful} successful, ${results.failed} failed`,
        data: {
          sellerName,
          source,
          file: req.file.originalname,
          table: SellerPriceModel.tableName,
          results: results,
          errorCount: results.errors.length
        }
      });

    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error("❌ Error in bulk import:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process bulk import"
      });
    }
  });
};

/**
 * @desc Get all sellers
 * @route GET /api/prices/sellers
 * @access Public
 */
exports.getSellers = async (req, res) => {
  try {
    const sellers = await db.getAllSellers();

    res.status(200).json({
      success: true,
      data: sellers,
      count: sellers.length
    });

  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch sellers"
    });
  }
};

/**
 * @desc Get prices by seller
 * @route GET /api/prices/seller/:sellerName
 * @access Public
 */
exports.getPricesBySeller = async (req, res) => {
  try {
    const { sellerName } = req.params;
    const { page = 1, limit = 50, inStock, sortBy = "sku" } = req.query;
    const offset = (page - 1) * limit;

    // Get seller-specific price model
    const SellerPriceModel = await db.getSellerPriceModel(sellerName);

    const whereClause = { sellerName };
    
    if (inStock === "true") {
      whereClause.stockQuantity = { [Op.gt]: 0 };
    } else if (inStock === "false") {
      whereClause.stockQuantity = { [Op.eq]: 0 };
    }

    const { count, rows: prices } = await SellerPriceModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "sku", "mfr", "mainImage", "brandId", "categoryId"]
        }
      ],
      order: [[sortBy, "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: prices,
      table: SellerPriceModel.tableName,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      summary: {
        sellerName,
        totalProducts: count,
        inStockProducts: await SellerPriceModel.count({
          where: { 
            sellerName,
            stockQuantity: { [Op.gt]: 0 }
          }
        })
      }
    });

  } catch (error) {
    console.error("Error fetching prices by seller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch prices by seller"
    });
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Parse CSV file without csv-parser dependency
 */
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const results = [];
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        resolve([]);
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(header => header.toLowerCase().trim().replace(/"/g, ''));
      
      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        results.push(row);
      }
      
      resolve(results);
    } catch (error) {
      reject(new Error(`Failed to parse CSV file: ${error.message}`));
    }
  });
};

/**
 * Parse Excel file
 */
const parseExcelFile = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    return data.map(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        normalizedRow[normalizedKey] = row[key];
      });
      return normalizedRow;
    });
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Other controller methods...
exports.getProductPrices = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sellerName, sortBy = "price", sortOrder = "ASC" } = req.query;

    let prices = [];

    if (sellerName) {
      // Get prices from specific seller table
      const SellerPriceModel = await db.getSellerPriceModel(sellerName);
      prices = await SellerPriceModel.findAll({
        where: { productId },
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "title", "sku", "mfr", "mainImage"]
          }
        ],
        order: [[sortBy, sortOrder]]
      });
    } else {
      // Get prices from all seller tables
      const sellers = await db.getAllSellers();
      for (const seller of sellers) {
        const SellerPriceModel = await db.getSellerPriceModel(seller);
        const sellerPrices = await SellerPriceModel.findAll({
          where: { productId },
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "sku", "mfr", "mainImage"]
            }
          ]
        });
        prices = prices.concat(sellerPrices);
      }
      
      // Sort all prices
      prices.sort((a, b) => {
        if (sortOrder === "ASC") {
          return a[sortBy] - b[sortBy];
        } else {
          return b[sortBy] - a[sortBy];
        }
      });
    }

    res.status(200).json({
      success: true,
      data: prices,
      count: prices.length
    });

  } catch (error) {
    console.error("Error fetching product prices:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch product prices"
    });
  }
};

exports.getPricesBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const { sellerName, inStock, sortBy = "price" } = req.query;

    let prices = [];

    if (sellerName) {
      // Get prices from specific seller table
      const SellerPriceModel = await db.getSellerPriceModel(sellerName);
      const whereClause = { sku };
      
      if (inStock === "true") {
        whereClause.stockQuantity = { [Op.gt]: 0 };
      } else if (inStock === "false") {
        whereClause.stockQuantity = { [Op.eq]: 0 };
      }

      prices = await SellerPriceModel.findAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "title", "sku", "mfr", "mainImage", "brandId", "categoryId"]
          }
        ],
        order: [[sortBy, "ASC"]]
      });
    } else {
      // Get prices from all seller tables
      const sellers = await db.getAllSellers();
      for (const seller of sellers) {
        const SellerPriceModel = await db.getSellerPriceModel(seller);
        const whereClause = { sku };
        
        if (inStock === "true") {
          whereClause.stockQuantity = { [Op.gt]: 0 };
        } else if (inStock === "false") {
          whereClause.stockQuantity = { [Op.eq]: 0 };
        }

        const sellerPrices = await SellerPriceModel.findAll({
          where: whereClause,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "sku", "mfr", "mainImage", "brandId", "categoryId"]
            }
          ]
        });
        prices = prices.concat(sellerPrices);
      }
      
      // Sort all prices
      prices.sort((a, b) => a.price - b.price);
    }

    const bestPrice = prices.length > 0 
      ? prices.reduce((min, price) => price.price < min.price ? price : min, prices[0])
      : null;

    res.status(200).json({
      success: true,
      data: prices,
      bestPrice: bestPrice,
      count: prices.length,
      summary: {
        sku,
        totalSellers: prices.length,
        inStockSellers: prices.filter(p => p.stockQuantity > 0).length,
        priceRange: prices.length > 0 ? {
          min: Math.min(...prices.map(p => p.price)),
          max: Math.max(...prices.map(p => p.price)),
          average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
        } : null
      }
    });

  } catch (error) {
    console.error("Error fetching prices by SKU:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch prices by SKU"
    });
  }
};

exports.getBestPrice = async (req, res) => {
  try {
    const { sku } = req.params;
    const { includeOutOfStock = "false" } = req.query;

    // Get prices from all seller tables
    const sellers = await db.getAllSellers();
    let prices = [];
    
    for (const seller of sellers) {
      const SellerPriceModel = await db.getSellerPriceModel(seller);
      const whereClause = { sku };
      
      if (includeOutOfStock === "false") {
        whereClause.stockQuantity = { [Op.gt]: 0 };
      }

      const sellerPrices = await SellerPriceModel.findAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "title", "sku", "mfr", "mainImage"]
          }
        ]
      });
      prices = prices.concat(sellerPrices);
    }

    // Sort by price
    prices.sort((a, b) => a.price - b.price);

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No prices found for SKU: ${sku}`
      });
    }

    const bestPrice = prices[0];
    const allPrices = prices.map(p => ({
      sellerName: p.sellerName,
      price: p.price,
      stockQuantity: p.stockQuantity,
      currency: p.currency,
      lastUpdated: p.lastUpdated
    }));

    res.status(200).json({
      success: true,
      data: {
        bestPrice: bestPrice,
        allPrices: allPrices,
        comparison: {
          totalSellers: prices.length,
          priceRange: {
            lowest: bestPrice.price,
            highest: prices[prices.length - 1].price,
            average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
          }
        }
      }
    });

  } catch (error) {
    console.error("Error fetching best price:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch best price"
    });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerName, price, stockQuantity, currency } = req.body;

    if (!sellerName) {
      return res.status(400).json({
        success: false,
        error: "Seller name is required to update price"
      });
    }

    // Get seller-specific price model
    const SellerPriceModel = await db.getSellerPriceModel(sellerName);

    const priceRecord = await SellerPriceModel.findByPk(id);
    if (!priceRecord) {
      return res.status(404).json({
        success: false,
        error: "Price record not found"
      });
    }

    const updateData = { lastUpdated: new Date() };
    
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
    if (currency !== undefined) updateData.currency = currency;

    const updatedPrice = await priceRecord.update(updateData);

    res.status(200).json({
      success: true,
      message: "Price updated successfully",
      data: updatedPrice
    });

  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update price"
    });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerName } = req.body;

    if (!sellerName) {
      return res.status(400).json({
        success: false,
        error: "Seller name is required to delete price"
      });
    }

    // Get seller-specific price model
    const SellerPriceModel = await db.getSellerPriceModel(sellerName);

    const priceRecord = await SellerPriceModel.findByPk(id);
    if (!priceRecord) {
      return res.status(404).json({
        success: false,
        error: "Price record not found"
      });
    }

    await priceRecord.destroy();

    res.status(200).json({
      success: true,
      message: "Price deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting price:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete price"
    });
  }
};

exports.comparePrices = async (req, res) => {
  try {
    const { sku } = req.params;
    const { sellers } = req.query;

    let prices = [];
    const sellerArray = sellers ? (Array.isArray(sellers) ? sellers : sellers.split(',')) : [];

    if (sellerArray.length > 0) {
      // Get prices from specific sellers
      for (const sellerName of sellerArray) {
        const SellerPriceModel = await db.getSellerPriceModel(sellerName);
        const sellerPrices = await SellerPriceModel.findAll({
          where: { sku },
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "sku", "mfr", "mainImage"]
            }
          ]
        });
        prices = prices.concat(sellerPrices);
      }
    } else {
      // Get prices from all sellers
      const allSellers = await db.getAllSellers();
      for (const sellerName of allSellers) {
        const SellerPriceModel = await db.getSellerPriceModel(sellerName);
        const sellerPrices = await SellerPriceModel.findAll({
          where: { sku },
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "sku", "mfr", "mainImage"]
            }
          ]
        });
        prices = prices.concat(sellerPrices);
      }
    }

    // Sort by price
    prices.sort((a, b) => a.price - b.price);

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No prices found for SKU: ${sku}`
      });
    }

    const comparison = {
      product: {
        id: prices[0].product.id,
        title: prices[0].product.title,
        sku: prices[0].product.sku,
        mfr: prices[0].product.mfr
      },
      sellers: prices.map(price => ({
        sellerName: price.sellerName,
        price: price.price,
        stockQuantity: price.stockQuantity,
        currency: price.currency,
        lastUpdated: price.lastUpdated,
        source: price.source
      })),
      summary: {
        totalSellers: prices.length,
        inStockSellers: prices.filter(p => p.stockQuantity > 0).length,
        bestPrice: prices[0],
        priceRange: {
          lowest: prices[0].price,
          highest: prices[prices.length - 1].price,
          average: (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)
        }
      }
    };

    res.status(200).json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error("Error comparing prices:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to compare prices"
    });
  }
};

/**
 * @desc Get all seller tables info
 * @route GET /api/prices/tables
 * @access Public
 */
exports.getSellerTables = async (req, res) => {
  try {
    const tables = await db.getAllSellerTables();
    
    const tableInfo = [];
    for (const tableName of tables) {
      const sellerName = tableName.replace('product_prices_', '');
      const recordCount = await db.getSellerRecordCount(sellerName);
      
      tableInfo.push({
        tableName,
        sellerName,
        recordCount,
        createdAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: tableInfo,
      count: tableInfo.length
    });

  } catch (error) {
    console.error("Error fetching seller tables:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch seller tables"
    });
  }
};

// Test endpoint
exports.testPriceAPI = (req, res) => {
  res.json({
    success: true,
    message: 'Price API is working correctly with seller-specific tables!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/prices/bulk-import',
      'GET /api/prices/sellers', 
      'GET /api/prices/seller/:sellerName',
      'GET /api/prices/product/:productId',
      'GET /api/prices/sku/:sku',
      'GET /api/prices/tables'
    ]
  });
};