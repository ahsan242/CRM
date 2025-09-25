


// const db = require("../config/db");
// const ProductForImport = db.productForImport;
// const { Op } = require('sequelize');
// const axios = require('axios');

// // NEW: Function to fetch SKUs from external API
// const fetchSkusFromExternalAPI = async (distributor, brand) => {
//   try {
//     const response = await axios.get('https://webcms.vcloudtech.org/api/import/skus', {
//       params: {
//         disti: distributor,
//         brand: brand
//       },
//       timeout: 30000
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error fetching from external API:', error.message);
//     throw new Error(`Failed to fetch SKUs from external API: ${error.message}`);
//   }
// };

// // NEW: Import products from external API
// exports.importFromExternalAPI = async (req, res) => {
//   try {
//     const { distributor, brand } = req.body;

//     if (!distributor || !brand) {
//       return res.status(400).json({
//         error: "Distributor and Brand are required parameters"
//       });
//     }

//     console.log(`🔄 Fetching SKUs from external API: distributor=${distributor}, brand=${brand}`);

//     // Fetch data from external API
//     const externalData = await fetchSkusFromExternalAPI(distributor, brand);
    
//     if (!externalData || !Array.isArray(externalData)) {
//       return res.status(400).json({
//         error: "Invalid response format from external API"
//       });
//     }

//     if (externalData.length === 0) {
//       return res.status(404).json({
//         error: "No products found for the specified distributor and brand"
//       });
//     }

//     // Transform external API data to our format
//     const productsToImport = externalData.map(item => ({
//       sku: item.mfr_sku || item.sku || item.productCode,
//       upcCode: item.upc_code || item.upc || item.gtin || null,
//       brand: brand,
//       distributor: distributor,
//       source: 'external_api',
//       status: 'active'
//     })).filter(product => product.sku); // Filter out items without SKU

//     if (productsToImport.length === 0) {
//       return res.status(400).json({
//         error: "No valid SKUs found in the API response"
//       });
//     }

//     // Remove duplicates by SKU
//     const uniqueProducts = [];
//     const seenSkus = new Set();

//     for (const product of productsToImport) {
//       if (!seenSkus.has(product.sku)) {
//         seenSkus.add(product.sku);
//         uniqueProducts.push(product);
//       }
//     }

//     // Check for existing SKUs in database
//     const existingProducts = await ProductForImport.findAll({
//       where: {
//         sku: { [Op.in]: uniqueProducts.map(p => p.sku) }
//       },
//       attributes: ['sku']
//     });

//     const existingSkus = new Set(existingProducts.map(p => p.sku));
//     const finalProducts = uniqueProducts.filter(p => !existingSkus.has(p.sku));

//     if (finalProducts.length === 0) {
//       return res.status(400).json({
//         error: "All SKUs from the external API already exist in database",
//         details: {
//           totalReceived: externalData.length,
//           validSkus: uniqueProducts.length,
//           existingSkus: existingSkus.size
//         }
//       });
//     }

//     // Add timestamps
//     const productsWithTimestamps = finalProducts.map(product => ({
//       ...product,
//       lastUpdated: new Date(),
//       createdAt: new Date()
//     }));

//     // Bulk insert
//     const createdProducts = await ProductForImport.bulkCreate(productsWithTimestamps, {
//       validate: true,
//       individualHooks: false
//     });

//     res.status(201).json({
//       success: true,
//       message: `Successfully imported ${createdProducts.length} products from external API`,
//       data: {
//         imported: createdProducts.length,
//         duplicatesSkipped: existingSkus.size,
//         totalFromAPI: externalData.length,
//         distributor: distributor,
//         brand: brand
//       }
//     });

//   } catch (error) {
//     console.error('Error importing from external API:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to import products from external API'
//     });
//   }
// };

// // UPDATED: Create product (now UPC is optional)
// exports.createProductForImport = async (req, res) => {
//   try {
//     const { sku, upcCode, brand, distributor, status = 'inactive' } = req.body;

//     if (!sku || !brand) {
//       return res.status(400).json({
//         error: "SKU and Brand are required fields"
//       });
//     }

//     // Check if product already exists by SKU
//     const existingProduct = await ProductForImport.findOne({
//       where: { sku: sku }
//     });

//     if (existingProduct) {
//       return res.status(400).json({
//         error: `Product with this SKU already exists`
//       });
//     }

//     // If UPC is provided, check for duplicate UPC
//     if (upcCode) {
//       const existingByUPC = await ProductForImport.findOne({
//         where: { upcCode: upcCode }
//       });

//       if (existingByUPC) {
//         return res.status(400).json({
//           error: `Product with this UPC Code already exists`
//         });
//       }
//     }

//     const product = await ProductForImport.create({
//       sku,
//       upcCode: upcCode || null,
//       brand,
//       distributor: distributor || null,
//       source: 'manual',
//       status,
//       lastUpdated: new Date(),
//       createdAt: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       message: "Product added for import successfully",
//       data: product
//     });

//   } catch (error) {
//     console.error('Error creating product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to create product for import'
//     });
//   }
// };

// // UPDATED: Bulk create products (UPC optional)
// exports.bulkCreateProductsForImport = async (req, res) => {
//   try {
//     const { products } = req.body;

//     if (!products || !Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         error: "Products array is required and must not be empty"
//       });
//     }

//     // Validate each product
//     const validProducts = [];
//     const errors = [];

//     for (const [index, product] of products.entries()) {
//       if (!product.sku || !product.brand) {
//         errors.push(`Product at index ${index}: SKU and Brand are required`);
//         continue;
//       }

//       // Check for duplicate SKU in the current batch
//       const duplicateInBatch = validProducts.find(p => p.sku === product.sku);
//       if (duplicateInBatch) {
//         errors.push(`Product at index ${index}: Duplicate SKU in batch`);
//         continue;
//       }

//       validProducts.push({
//         sku: product.sku,
//         upcCode: product.upcCode || null,
//         brand: product.brand,
//         distributor: product.distributor || null,
//         source: 'manual',
//         status: product.status || 'inactive',
//         lastUpdated: new Date(),
//         createdAt: new Date()
//       });
//     }

//     if (validProducts.length === 0) {
//       return res.status(400).json({
//         error: "No valid products to import",
//         details: errors
//       });
//     }

//     // Check for existing SKUs in database
//     const existingProducts = await ProductForImport.findAll({
//       where: {
//         sku: { [Op.in]: validProducts.map(p => p.sku) }
//       },
//       attributes: ['sku']
//     });

//     const existingSkus = new Set(existingProducts.map(p => p.sku));
//     const finalProducts = validProducts.filter(p => !existingSkus.has(p.sku));

//     // Add existing products to errors
//     existingProducts.forEach(product => {
//       errors.push(`SKU ${product.sku}: Already exists in database`);
//     });

//     if (finalProducts.length === 0) {
//       return res.status(400).json({
//         error: "All products already exist in database",
//         details: errors
//       });
//     }

//     // Bulk create products
//     const createdProducts = await ProductForImport.bulkCreate(finalProducts, {
//       validate: true,
//       individualHooks: false
//     });

//     res.status(201).json({
//       success: true,
//       message: `Successfully added ${createdProducts.length} products for import`,
//       data: {
//         created: createdProducts.length,
//         duplicatesSkipped: existingProducts.length,
//         invalidSkipped: errors.length - existingProducts.length,
//         details: errors.length > 0 ? errors : undefined
//       }
//     });

//   } catch (error) {
//     console.error('Error bulk creating products for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to bulk create products for import'
//     });
//   }
// };

// // UPDATED: Get all products with distributor filter
// exports.getAllProductsForImport = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, brand, distributor, search, source } = req.query;
//     const offset = (page - 1) * limit;

//     // Build where clause
//     const whereClause = {};
    
//     if (status) {
//       whereClause.status = status;
//     }
    
//     if (brand) {
//       whereClause.brand = { [Op.iLike]: `%${brand}%` };
//     }
    
//     if (distributor) {
//       whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
//     }
    
//     if (source) {
//       whereClause.source = source;
//     }
    
//     if (search) {
//       whereClause[Op.or] = [
//         { sku: { [Op.iLike]: `%${search}%` } },
//         { upcCode: { [Op.iLike]: `%${search}%` } },
//         { brand: { [Op.iLike]: `%${search}%` } },
//         { distributor: { [Op.iLike]: `%${search}%` } }
//       ];
//     }

//     const { count, rows } = await ProductForImport.findAndCountAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       success: true,
//       data: rows,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count,
//         pages: Math.ceil(count / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching products for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch products for import'
//     });
//   }
// };

// // UPDATED: Stats with distributor and source breakdown
// exports.getStats = async (req, res) => {
//   try {
//     const totalCount = await ProductForImport.count();
//     const activeCount = await ProductForImport.count({ where: { status: 'active' } });
//     const inactiveCount = await ProductForImport.count({ where: { status: 'inactive' } });
//     const manualCount = await ProductForImport.count({ where: { source: 'manual' } });
//     const externalCount = await ProductForImport.count({ where: { source: 'external_api' } });
    
//     const brands = await ProductForImport.findAll({
//       attributes: ['brand', [db.sequelize.fn('COUNT', 'brand'), 'count']],
//       group: ['brand'],
//       order: [[db.sequelize.fn('COUNT', 'brand'), 'DESC']],
//       limit: 10
//     });

//     const distributors = await ProductForImport.findAll({
//       attributes: ['distributor', [db.sequelize.fn('COUNT', 'distributor'), 'count']],
//       group: ['distributor'],
//       order: [[db.sequelize.fn('COUNT', 'distributor'), 'DESC']],
//       limit: 10
//     });

//     res.json({
//       success: true,
//       data: {
//         total: totalCount,
//         active: activeCount,
//         inactive: inactiveCount,
//         bySource: {
//           manual: manualCount,
//           external_api: externalCount
//         },
//         topBrands: brands,
//         topDistributors: distributors
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch statistics'
//     });
//   }
// };


// exports.getProductForImportById = async (req, res) => {
//   try {
//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     res.json({
//       success: true,
//       data: product
//     });

//   } catch (error) {
//     console.error('Error fetching product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch product for import'
//     });
//   }
// };

// exports.updateProductForImport = async (req, res) => {
//   try {
//     const { sku, upcCode, brand, status } = req.body;

//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     // Check for duplicates if sku or upcCode is being updated
//     if (sku || upcCode) {
//       const whereCondition = { id: { [Op.ne]: req.params.id } };
//       const orConditions = [];
      
//       if (sku) orConditions.push({ sku: sku });
//       if (upcCode) orConditions.push({ upcCode: upcCode });
      
//       whereCondition[Op.or] = orConditions;

//       const existingProduct = await ProductForImport.findOne({
//         where: whereCondition
//       });

//       if (existingProduct) {
//         const field = existingProduct.sku === sku ? 'SKU' : 'UPC Code';
//         return res.status(400).json({
//           error: `Product with this ${field} already exists`
//         });
//       }
//     }

//     // Update only provided fields
//     const updateData = { lastUpdated: new Date() };
//     if (sku !== undefined) updateData.sku = sku;
//     if (upcCode !== undefined) updateData.upcCode = upcCode;
//     if (brand !== undefined) updateData.brand = brand;
//     if (status !== undefined) updateData.status = status;

//     await product.update(updateData);

//     res.json({
//       success: true,
//       message: "Product updated successfully",
//       data: product
//     });

//   } catch (error) {
//     console.error('Error updating product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to update product for import'
//     });
//   }
// };

// exports.deleteProductForImport = async (req, res) => {
//   try {
//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     await product.destroy();

//     res.json({
//       success: true,
//       message: "Product deleted successfully"
//     });

//   } catch (error) {
//     console.error('Error deleting product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to delete product for import'
//     });
//   }
// };

// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { productIds, status } = req.body;

//     if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
//       return res.status(400).json({
//         error: "Product IDs array is required"
//       });
//     }

//     if (!status || !['active', 'inactive'].includes(status)) {
//       return res.status(400).json({
//         error: "Valid status (active/inactive) is required"
//       });
//     }

//     const result = await ProductForImport.update(
//       { 
//         status: status,
//         lastUpdated: new Date()
//       },
//       {
//         where: {
//           id: {
//             [Op.in]: productIds
//           }
//         }
//       }
//     );

//     res.json({
//       success: true,
//       message: `Updated status to ${status} for ${result[0]} products`
//     });

//   } catch (error) {
//     console.error('Error bulk updating products:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to bulk update products'
//     });
//   }
// };

// exports.searchProducts = async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q) {
//       return res.status(400).json({
//         error: "Search query is required"
//       });
//     }

//     const products = await ProductForImport.findAll({
//       where: {
//         [Op.or]: [
//           { sku: { [Op.iLike]: `%${q}%` } },
//           { upcCode: { [Op.iLike]: `%${q}%` } },
//           { brand: { [Op.iLike]: `%${q}%` } }
//         ]
//       },
//       limit: 20,
//       order: [['createdAt', 'DESC']]
//     });

//     res.json({
//       success: true,
//       data: products
//     });

//   } catch (error) {
//     console.error('Error searching products:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to search products'
//     });
//   }
// };



// const db = require("../config/db");
// const ProductForImport = db.productForImport;
// const { Op } = require('sequelize');
// const axios = require('axios');


// // Create product (UPC is optional)
// exports.createProductForImport = async (req, res) => {
//   try {
//     const { sku, upcCode, brand, distributor, status = 'inactive' } = req.body;

//     if (!sku || !brand) {
//       return res.status(400).json({
//         error: "SKU and Brand are required fields"
//       });
//     }

//     // Check if product already exists by SKU
//     const existingProduct = await ProductForImport.findOne({
//       where: { sku: sku }
//     });

//     if (existingProduct) {
//       return res.status(400).json({
//         error: `Product with SKU "${sku}" already exists`
//       });
//     }

//     // If UPC is provided, check for duplicate UPC
//     if (upcCode) {
//       const existingByUPC = await ProductForImport.findOne({
//         where: { upcCode: upcCode }
//       });

//       if (existingByUPC) {
//         return res.status(400).json({
//           error: `Product with UPC Code "${upcCode}" already exists`
//         });
//       }
//     }

//     const product = await ProductForImport.create({
//       sku: sku.trim(),
//       upcCode: upcCode ? upcCode.toString().trim() : null,
//       brand: brand,
//       distributor: distributor || null,
//       source: 'manual',
//       status,
//       lastUpdated: new Date(),
//       createdAt: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       message: "Product added for import successfully",
//       data: product
//     });

//   } catch (error) {
//     console.error('Error creating product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to create product for import'
//     });
//   }
// };

// // Bulk create products (UPC optional)
// exports.bulkCreateProductsForImport = async (req, res) => {
//   try {
//     const { products } = req.body;

//     if (!products || !Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         error: "Products array is required and must not be empty"
//       });
//     }

//     // Validate each product
//     const validProducts = [];
//     const errors = [];

//     for (const [index, product] of products.entries()) {
//       if (!product.sku || !product.brand) {
//         errors.push(`Product at index ${index}: SKU and Brand are required`);
//         continue;
//       }

//       // Check for duplicate SKU in the current batch
//       const duplicateInBatch = validProducts.find(p => p.sku === product.sku.trim());
//       if (duplicateInBatch) {
//         errors.push(`Product at index ${index}: Duplicate SKU "${product.sku}" in batch`);
//         continue;
//       }

//       validProducts.push({
//         sku: product.sku.trim(),
//         upcCode: product.upcCode ? product.upcCode.toString().trim() : null,
//         brand: product.brand,
//         distributor: product.distributor || null,
//         source: 'manual',
//         status: product.status || 'inactive',
//         lastUpdated: new Date(),
//         createdAt: new Date()
//       });
//     }

//     if (validProducts.length === 0) {
//       return res.status(400).json({
//         error: "No valid products to import",
//         details: errors
//       });
//     }

//     // Check for existing SKUs in database
//     const existingProducts = await ProductForImport.findAll({
//       where: {
//         sku: { [Op.in]: validProducts.map(p => p.sku) }
//       },
//       attributes: ['sku']
//     });

//     const existingSkus = new Set(existingProducts.map(p => p.sku));
//     const finalProducts = validProducts.filter(p => !existingSkus.has(p.sku));

//     // Add existing products to errors
//     existingProducts.forEach(product => {
//       errors.push(`SKU "${product.sku}": Already exists in database`);
//     });

//     if (finalProducts.length === 0) {
//       return res.status(400).json({
//         error: "All products already exist in database",
//         details: errors
//       });
//     }

//     // Bulk create products
//     const createdProducts = await ProductForImport.bulkCreate(finalProducts, {
//       validate: true,
//       individualHooks: false
//     });

//     res.status(201).json({
//       success: true,
//       message: `Successfully added ${createdProducts.length} products for import`,
//       data: {
//         created: createdProducts.length,
//         duplicatesSkipped: existingProducts.length,
//         invalidSkipped: errors.length - existingProducts.length,
//         details: errors.length > 0 ? errors : undefined
//       }
//     });

//   } catch (error) {
//     console.error('Error bulk creating products for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to bulk create products for import'
//     });
//   }
// };

// // Get all products with distributor filter
// exports.getAllProductsForImport = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, brand, distributor, search, source } = req.query;
//     const offset = (page - 1) * limit;

//     // Build where clause
//     const whereClause = {};
    
//     if (status) {
//       whereClause.status = status;
//     }
    
//     if (brand) {
//       whereClause.brand = { [Op.iLike]: `%${brand}%` };
//     }
    
//     if (distributor) {
//       whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
//     }
    
//     if (source) {
//       whereClause.source = source;
//     }
    
//     if (search) {
//       whereClause[Op.or] = [
//         { sku: { [Op.iLike]: `%${search}%` } },
//         { upcCode: { [Op.iLike]: `%${search}%` } },
//         { brand: { [Op.iLike]: `%${search}%` } },
//         { distributor: { [Op.iLike]: `%${search}%` } }
//       ];
//     }

//     const { count, rows } = await ProductForImport.findAndCountAll({
//       where: whereClause,
//       order: [['createdAt', 'DESC']],
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     res.json({
//       success: true,
//       data: rows,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: count,
//         pages: Math.ceil(count / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching products for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch products for import'
//     });
//   }
// };

// // Stats with distributor and source breakdown
// exports.getStats = async (req, res) => {
//   try {
//     const totalCount = await ProductForImport.count();
//     const activeCount = await ProductForImport.count({ where: { status: 'active' } });
//     const inactiveCount = await ProductForImport.count({ where: { status: 'inactive' } });
//     const manualCount = await ProductForImport.count({ where: { source: 'manual' } });
//     const externalCount = await ProductForImport.count({ where: { source: 'external_api' } });
    
//     const brands = await ProductForImport.findAll({
//       attributes: ['brand', [db.sequelize.fn('COUNT', 'brand'), 'count']],
//       group: ['brand'],
//       order: [[db.sequelize.fn('COUNT', 'brand'), 'DESC']],
//       limit: 10
//     });

//     const distributors = await ProductForImport.findAll({
//       attributes: ['distributor', [db.sequelize.fn('COUNT', 'distributor'), 'count']],
//       group: ['distributor'],
//       order: [[db.sequelize.fn('COUNT', 'distributor'), 'DESC']],
//       limit: 10
//     });

//     res.json({
//       success: true,
//       data: {
//         total: totalCount,
//         active: activeCount,
//         inactive: inactiveCount,
//         bySource: {
//           manual: manualCount,
//           external_api: externalCount
//         },
//         topBrands: brands,
//         topDistributors: distributors
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch statistics'
//     });
//   }
// };

// exports.getProductForImportById = async (req, res) => {
//   try {
//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     res.json({
//       success: true,
//       data: product
//     });

//   } catch (error) {
//     console.error('Error fetching product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to fetch product for import'
//     });
//   }
// };

// exports.updateProductForImport = async (req, res) => {
//   try {
//     const { sku, upcCode, brand, status } = req.body;

//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     // Check for duplicates if sku or upcCode is being updated
//     if (sku || upcCode) {
//       const whereCondition = { id: { [Op.ne]: req.params.id } };
//       const orConditions = [];
      
//       if (sku) orConditions.push({ sku: sku });
//       if (upcCode) orConditions.push({ upcCode: upcCode });
      
//       whereCondition[Op.or] = orConditions;

//       const existingProduct = await ProductForImport.findOne({
//         where: whereCondition
//       });

//       if (existingProduct) {
//         const field = existingProduct.sku === sku ? 'SKU' : 'UPC Code';
//         return res.status(400).json({
//           error: `Product with this ${field} already exists`
//         });
//       }
//     }

//     // Update only provided fields
//     const updateData = { lastUpdated: new Date() };
//     if (sku !== undefined) updateData.sku = sku;
//     if (upcCode !== undefined) updateData.upcCode = upcCode;
//     if (brand !== undefined) updateData.brand = brand;
//     if (status !== undefined) updateData.status = status;

//     await product.update(updateData);

//     res.json({
//       success: true,
//       message: "Product updated successfully",
//       data: product
//     });

//   } catch (error) {
//     console.error('Error updating product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to update product for import'
//     });
//   }
// };

// exports.deleteProductForImport = async (req, res) => {
//   try {
//     const product = await ProductForImport.findByPk(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         error: "Product not found"
//       });
//     }

//     await product.destroy();

//     res.json({
//       success: true,
//       message: "Product deleted successfully"
//     });

//   } catch (error) {
//     console.error('Error deleting product for import:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to delete product for import'
//     });
//   }
// };

// exports.bulkUpdateStatus = async (req, res) => {
//   try {
//     const { productIds, status } = req.body;

//     if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
//       return res.status(400).json({
//         error: "Product IDs array is required"
//       });
//     }

//     if (!status || !['active', 'inactive'].includes(status)) {
//       return res.status(400).json({
//         error: "Valid status (active/inactive) is required"
//       });
//     }

//     const result = await ProductForImport.update(
//       { 
//         status: status,
//         lastUpdated: new Date()
//       },
//       {
//         where: {
//           id: {
//             [Op.in]: productIds
//           }
//         }
//       }
//     );

//     res.json({
//       success: true,
//       message: `Updated status to ${status} for ${result[0]} products`
//     });

//   } catch (error) {
//     console.error('Error bulk updating products:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to bulk update products'
//     });
//   }
// };

// exports.searchProducts = async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q) {
//       return res.status(400).json({
//         error: "Search query is required"
//       });
//     }

//     const products = await ProductForImport.findAll({
//       where: {
//         [Op.or]: [
//           { sku: { [Op.iLike]: `%${q}%` } },
//           { upcCode: { [Op.iLike]: `%${q}%` } },
//           { brand: { [Op.iLike]: `%${q}%` } }
//         ]
//       },
//       limit: 20,
//       order: [['createdAt', 'DESC']]
//     });

//     res.json({
//       success: true,
//       data: products
//     });

//   } catch (error) {
//     console.error('Error searching products:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to search products'
//     });
//   }
// };






// // Function to fetch SKUs from external API
// const fetchSkusFromExternalAPI = async (distributor, brand) => {
//   try {
//     console.log(`🌐 Calling external API: https://webcms.vcloudtech.org/api/import/skus?disti=${distributor}&brand=${brand}`);
    
//     const response = await axios.get('https://webcms.vcloudtech.org/api/import/skus', {
//       params: {
//         disti: distributor,
//         brand: brand
//       },
//       timeout: 30000,
//       headers: {
//         'User-Agent': 'ProductImportService/1.0'
//       }
//     });

//     console.log('📡 API Response Status:', response.status);
//     console.log('📡 API Response Headers:', response.headers);
//     console.log('📡 API Response Data Type:', typeof response.data);
//     console.log('📡 API Response Data:', JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');

//     return response.data;
//   } catch (error) {
//     console.error('❌ Error fetching from external API:', error.message);
//     if (error.response) {
//       console.error('❌ API Response Status:', error.response.status);
//       console.error('❌ API Response Data:', error.response.data);
//     }
//     throw new Error(`Failed to fetch SKUs from external API: ${error.message}`);
//   }
// };

// // Import products from external API
// exports.importFromExternalAPI = async (req, res) => {
//   try {
//     const { distributor, brand } = req.body;

//     if (!distributor || !brand) {
//       return res.status(400).json({
//         error: "Distributor and Brand are required parameters"
//       });
//     }

//     console.log(`🔄 Fetching SKUs from external API: distributor=${distributor}, brand=${brand}`);

//     // Fetch data from external API
//     const externalData = await fetchSkusFromExternalAPI(distributor, brand);
    
//     // Debug what we received
//     console.log('🔍 External data type:', typeof externalData);
//     console.log('🔍 External data keys:', externalData ? Object.keys(externalData) : 'null');
    
//     // Handle different response formats
//     let productsArray = [];
    
//     if (Array.isArray(externalData)) {
//       productsArray = externalData;
//     } else if (externalData && typeof externalData === 'object') {
//       // Check if it's an object with a products/skus/data array
//       if (Array.isArray(externalData.products)) {
//         productsArray = externalData.products;
//       } else if (Array.isArray(externalData.skus)) {
//         productsArray = externalData.skus;
//       } else if (Array.isArray(externalData.data)) {
//         productsArray = externalData.data;
//       } else {
//         // Try to convert object values to array
//         productsArray = Object.values(externalData);
//       }
//     } else {
//       return res.status(400).json({
//         error: "Invalid response format from external API",
//         details: {
//           receivedType: typeof externalData,
//           receivedData: externalData
//         }
//       });
//     }

//     console.log(`📦 Processed ${productsArray.length} items from API response`);

//     if (productsArray.length === 0) {
//       return res.status(404).json({
//         error: "No products found for the specified distributor and brand",
//         details: {
//           distributor,
//           brand,
//           apiResponse: externalData
//         }
//       });
//     }

//     // Transform external API data to our format
//     const productsToImport = productsArray.map((item, index) => {
//       // Handle different possible field names from external API
//       const sku = item.mfr_sku || item.sku || item.productCode || item.MFR_SKU || item.SKU;
//       const upc = item.upc_code || item.upc || item.gtin || item.UPC || item.upcCode;
      
//       if (!sku) {
//         console.warn(`⚠️ Item at index ${index} has no SKU:`, item);
//         return null;
//       }

//       return {
//         sku: sku.toString().trim(),
//         upcCode: upc ? upc.toString().trim() : null,
//         brand: brand,
//         distributor: distributor,
//         source: 'external_api',
//         status: 'active',
//         lastUpdated: new Date(),
//         createdAt: new Date()
//       };
//     }).filter(product => product !== null);

//     if (productsToImport.length === 0) {
//       return res.status(400).json({
//         error: "No valid SKUs found in the API response after filtering",
//         details: {
//           originalCount: productsArray.length,
//           sampleItem: productsArray[0]
//         }
//       });
//     }

//     console.log(`✅ Transformed ${productsToImport.length} valid products`);

//     // Remove duplicates by SKU within the batch
//     const uniqueProducts = [];
//     const seenSkus = new Set();

//     for (const product of productsToImport) {
//       if (!seenSkus.has(product.sku)) {
//         seenSkus.add(product.sku);
//         uniqueProducts.push(product);
//       }
//     }

//     console.log(`🔍 After deduplication: ${uniqueProducts.length} unique products`);

//     // Check for existing SKUs in database
//     const existingProducts = await ProductForImport.findAll({
//       where: {
//         sku: { [Op.in]: uniqueProducts.map(p => p.sku) }
//       },
//       attributes: ['sku']
//     });

//     const existingSkus = new Set(existingProducts.map(p => p.sku));
//     const finalProducts = uniqueProducts.filter(p => !existingSkus.has(p.sku));

//     console.log(`📊 Database check: ${existingSkus.size} existing SKUs, ${finalProducts.length} new products to import`);

//     if (finalProducts.length === 0) {
//       return res.status(400).json({
//         error: "All SKUs from the external API already exist in database",
//         details: {
//           totalReceived: productsArray.length,
//           validSkus: productsToImport.length,
//           uniqueSkus: uniqueProducts.length,
//           existingSkus: existingSkus.size,
//           skippedDuplicates: existingSkus.size
//         }
//       });
//     }

//     // Bulk insert
//     const createdProducts = await ProductForImport.bulkCreate(finalProducts, {
//       validate: true,
//       individualHooks: false
//     });

//     console.log(`🎉 Successfully imported ${createdProducts.length} products`);

//     res.status(201).json({
//       success: true,
//       message: `Successfully imported ${createdProducts.length} products from external API`,
//       data: {
//         imported: createdProducts.length,
//         duplicatesSkipped: existingSkus.size,
//         totalFromAPI: productsArray.length,
//         validProducts: productsToImport.length,
//         uniqueProducts: uniqueProducts.length,
//         distributor: distributor,
//         brand: brand
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error importing from external API:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to import products from external API',
//       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };
const db = require("../config/db");
const ProductForImport = db.productForImport;
const { Op } = require('sequelize');
const axios = require('axios');

// Function to fetch SKUs from external API
const fetchSkusFromExternalAPI = async (distributor, brand) => {
  try {
    console.log(`🌐 Calling external API: https://webcms.vcloudtech.org/api/import/skus?disti=${distributor}&brand=${brand}`);
    
    const response = await axios.get('https://webcms.vcloudtech.org/api/import/skus', {
      params: {
        disti: distributor,
        brand: brand
      },
      timeout: 30000,
      headers: {
        'User-Agent': 'ProductImportService/1.0'
      }
    });

    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Data Type:', typeof response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching from external API:', error.message);
    if (error.response) {
      console.error('❌ API Response Status:', error.response.status);
      console.error('❌ API Response Data:', error.response.data);
    }
    throw new Error(`Failed to fetch SKUs from external API: ${error.message}`);
  }
};

// Import products from external API - FIXED VERSION
exports.importFromExternalAPI = async (req, res) => {
  try {
    const { distributor, brand } = req.body;

    if (!distributor || !brand) {
      return res.status(400).json({
        error: "Distributor and Brand are required parameters"
      });
    }

    console.log(`🔄 Fetching SKUs from external API: distributor=${distributor}, brand=${brand}`);

    // Fetch data from external API
    const externalData = await fetchSkusFromExternalAPI(distributor, brand);
    
    // Debug what we received
    console.log('🔍 External data type:', typeof externalData);
    console.log('🔍 External data keys:', externalData ? Object.keys(externalData) : 'null');
    
    // FIX: Handle the actual API response format
    let skusArray = [];
    
    if (Array.isArray(externalData)) {
      // If it's directly an array
      skusArray = externalData;
    } else if (externalData && typeof externalData === 'object') {
      // Handle the actual API response format: { mfr_sku: ["sku1", "sku2", ...] }
      if (Array.isArray(externalData.mfr_sku)) {
        skusArray = externalData.mfr_sku;
        console.log(`✅ Found mfr_sku array with ${skusArray.length} items`);
      } else if (Array.isArray(externalData.products)) {
        skusArray = externalData.products;
      } else if (Array.isArray(externalData.skus)) {
        skusArray = externalData.skus;
      } else if (Array.isArray(externalData.data)) {
        skusArray = externalData.data;
      } else {
        // If it's an object but not in expected format, try to extract arrays
        const arrayValues = Object.values(externalData).filter(val => Array.isArray(val));
        if (arrayValues.length > 0) {
          skusArray = arrayValues[0]; // Take the first array found
          console.log(`🔍 Using first array found with ${skusArray.length} items`);
        } else {
          // If no arrays found, try to use object values as SKUs
          skusArray = Object.values(externalData);
          console.log(`🔍 Using object values as SKUs: ${skusArray.length} items`);
        }
      }
    } else {
      return res.status(400).json({
        error: "Invalid response format from external API",
        details: {
          receivedType: typeof externalData,
          receivedData: externalData
        }
      });
    }

    console.log(`📦 Processing ${skusArray.length} SKUs from API response`);

    if (skusArray.length === 0) {
      return res.status(404).json({
        error: "No products found for the specified distributor and brand",
        details: {
          distributor,
          brand,
          apiResponse: externalData
        }
      });
    }

    // FIX: Transform the array of SKU strings to our product format
    const productsToImport = skusArray.map((skuItem, index) => {
      // Handle different possible formats of skuItem
      let sku = null;
      
      if (typeof skuItem === 'string') {
        // Direct SKU string like "H40H1PE"
        sku = skuItem;
      } else if (typeof skuItem === 'object' && skuItem !== null) {
        // If it's an object, try to extract SKU from common fields
        sku = skuItem.mfr_sku || skuItem.sku || skuItem.productCode || skuItem.MFR_SKU || skuItem.SKU;
      } else if (skuItem !== null && skuItem !== undefined) {
        // Convert other types to string
        sku = skuItem.toString();
      }

      // Validate SKU
      if (!sku || sku.toString().trim().length === 0) {
        console.warn(`⚠️ Invalid or empty SKU at index ${index}:`, skuItem);
        return null;
      }

      const finalSku = sku.toString().trim();
      
      console.log(`✅ Processing SKU ${index + 1}: ${finalSku}`);

      return {
        sku: finalSku,
        upcCode: null, // UPC not available from this API
        brand: brand,
        distributor: distributor,
        source: 'external_api',
        status: 'active',
        lastUpdated: new Date(),
        createdAt: new Date()
      };
    }).filter(product => product !== null);

    if (productsToImport.length === 0) {
      return res.status(400).json({
        error: "No valid SKUs found in the API response after filtering",
        details: {
          originalCount: skusArray.length,
          sampleItems: skusArray.slice(0, 5) // Show first 5 items for debugging
        }
      });
    }

    console.log(`✅ Transformed ${productsToImport.length} valid products from ${skusArray.length} API items`);

    // Remove duplicates by SKU within the batch
    const uniqueProducts = [];
    const seenSkus = new Set();

    for (const product of productsToImport) {
      if (!seenSkus.has(product.sku)) {
        seenSkus.add(product.sku);
        uniqueProducts.push(product);
      }
    }

    console.log(`🔍 After deduplication: ${uniqueProducts.length} unique products`);

    // Check for existing SKUs in database
    const existingProducts = await ProductForImport.findAll({
      where: {
        sku: { [Op.in]: uniqueProducts.map(p => p.sku) }
      },
      attributes: ['sku']
    });

    const existingSkus = new Set(existingProducts.map(p => p.sku));
    const finalProducts = uniqueProducts.filter(p => !existingSkus.has(p.sku));

    console.log(`📊 Database check: ${existingSkus.size} existing SKUs, ${finalProducts.length} new products to import`);

    if (finalProducts.length === 0) {
      return res.status(400).json({
        error: "All SKUs from the external API already exist in database",
        details: {
          totalReceived: skusArray.length,
          validSkus: productsToImport.length,
          uniqueSkus: uniqueProducts.length,
          existingSkus: existingSkus.size,
          skippedDuplicates: existingSkus.size
        }
      });
    }

    // Bulk insert
    const createdProducts = await ProductForImport.bulkCreate(finalProducts, {
      validate: true,
      individualHooks: false
    });

    console.log(`🎉 Successfully imported ${createdProducts.length} products`);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdProducts.length} products from external API`,
      data: {
        imported: createdProducts.length,
        duplicatesSkipped: existingSkus.size,
        totalFromAPI: skusArray.length,
        validProducts: productsToImport.length,
        uniqueProducts: uniqueProducts.length,
        distributor: distributor,
        brand: brand,
        sampleImported: createdProducts.slice(0, 5).map(p => ({
          sku: p.sku,
          brand: p.brand,
          distributor: p.distributor
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error importing from external API:', error);
    res.status(500).json({
      error: error.message || 'Failed to import products from external API',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create product (UPC is optional)
exports.createProductForImport = async (req, res) => {
  try {
    const { sku, upcCode, brand, distributor, status = 'inactive' } = req.body;

    if (!sku || !brand) {
      return res.status(400).json({
        error: "SKU and Brand are required fields"
      });
    }

    // Check if product already exists by SKU
    const existingProduct = await ProductForImport.findOne({
      where: { sku: sku }
    });

    if (existingProduct) {
      return res.status(400).json({
        error: `Product with SKU "${sku}" already exists`
      });
    }

    // If UPC is provided, check for duplicate UPC
    if (upcCode) {
      const existingByUPC = await ProductForImport.findOne({
        where: { upcCode: upcCode }
      });

      if (existingByUPC) {
        return res.status(400).json({
          error: `Product with UPC Code "${upcCode}" already exists`
        });
      }
    }

    const product = await ProductForImport.create({
      sku: sku.trim(),
      upcCode: upcCode ? upcCode.toString().trim() : null,
      brand: brand,
      distributor: distributor || null,
      source: 'manual',
      status,
      lastUpdated: new Date(),
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Product added for import successfully",
      data: product
    });

  } catch (error) {
    console.error('Error creating product for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to create product for import'
    });
  }
};

// Bulk create products (UPC optional)
exports.bulkCreateProductsForImport = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products array is required and must not be empty"
      });
    }

    // Validate each product
    const validProducts = [];
    const errors = [];

    for (const [index, product] of products.entries()) {
      if (!product.sku || !product.brand) {
        errors.push(`Product at index ${index}: SKU and Brand are required`);
        continue;
      }

      // Check for duplicate SKU in the current batch
      const duplicateInBatch = validProducts.find(p => p.sku === product.sku.trim());
      if (duplicateInBatch) {
        errors.push(`Product at index ${index}: Duplicate SKU "${product.sku}" in batch`);
        continue;
      }

      validProducts.push({
        sku: product.sku.trim(),
        upcCode: product.upcCode ? product.upcCode.toString().trim() : null,
        brand: product.brand,
        distributor: product.distributor || null,
        source: 'manual',
        status: product.status || 'inactive',
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    }

    if (validProducts.length === 0) {
      return res.status(400).json({
        error: "No valid products to import",
        details: errors
      });
    }

    // Check for existing SKUs in database
    const existingProducts = await ProductForImport.findAll({
      where: {
        sku: { [Op.in]: validProducts.map(p => p.sku) }
      },
      attributes: ['sku']
    });

    const existingSkus = new Set(existingProducts.map(p => p.sku));
    const finalProducts = validProducts.filter(p => !existingSkus.has(p.sku));

    // Add existing products to errors
    existingProducts.forEach(product => {
      errors.push(`SKU "${product.sku}": Already exists in database`);
    });

    if (finalProducts.length === 0) {
      return res.status(400).json({
        error: "All products already exist in database",
        details: errors
      });
    }

    // Bulk create products
    const createdProducts = await ProductForImport.bulkCreate(finalProducts, {
      validate: true,
      individualHooks: false
    });

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdProducts.length} products for import`,
      data: {
        created: createdProducts.length,
        duplicatesSkipped: existingProducts.length,
        invalidSkipped: errors.length - existingProducts.length,
        details: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error bulk creating products for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to bulk create products for import'
    });
  }
};

// Get all products with distributor filter
exports.getAllProductsForImport = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, brand, distributor, search, source } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (brand) {
      whereClause.brand = { [Op.iLike]: `%${brand}%` };
    }
    
    if (distributor) {
      whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
    }
    
    if (source) {
      whereClause.source = source;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { sku: { [Op.iLike]: `%${search}%` } },
        { upcCode: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { distributor: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ProductForImport.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch products for import'
    });
  }
};

// Stats with distributor and source breakdown
exports.getStats = async (req, res) => {
  try {
    const totalCount = await ProductForImport.count();
    const activeCount = await ProductForImport.count({ where: { status: 'active' } });
    const inactiveCount = await ProductForImport.count({ where: { status: 'inactive' } });
    const manualCount = await ProductForImport.count({ where: { source: 'manual' } });
    const externalCount = await ProductForImport.count({ where: { source: 'external_api' } });
    
    const brands = await ProductForImport.findAll({
      attributes: ['brand', [db.sequelize.fn('COUNT', 'brand'), 'count']],
      group: ['brand'],
      order: [[db.sequelize.fn('COUNT', 'brand'), 'DESC']],
      limit: 10
    });

    const distributors = await ProductForImport.findAll({
      attributes: ['distributor', [db.sequelize.fn('COUNT', 'distributor'), 'count']],
      group: ['distributor'],
      order: [[db.sequelize.fn('COUNT', 'distributor'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        bySource: {
          manual: manualCount,
          external_api: externalCount
        },
        topBrands: brands,
        topDistributors: distributors
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch statistics'
    });
  }
};

exports.getProductForImportById = async (req, res) => {
  try {
    const product = await ProductForImport.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch product for import'
    });
  }
};

exports.updateProductForImport = async (req, res) => {
  try {
    const { sku, upcCode, brand, status } = req.body;

    const product = await ProductForImport.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    // Check for duplicates if sku or upcCode is being updated
    if (sku || upcCode) {
      const whereCondition = { id: { [Op.ne]: req.params.id } };
      const orConditions = [];
      
      if (sku) orConditions.push({ sku: sku });
      if (upcCode) orConditions.push({ upcCode: upcCode });
      
      whereCondition[Op.or] = orConditions;

      const existingProduct = await ProductForImport.findOne({
        where: whereCondition
      });

      if (existingProduct) {
        const field = existingProduct.sku === sku ? 'SKU' : 'UPC Code';
        return res.status(400).json({
          error: `Product with this ${field} already exists`
        });
      }
    }

    // Update only provided fields
    const updateData = { lastUpdated: new Date() };
    if (sku !== undefined) updateData.sku = sku;
    if (upcCode !== undefined) updateData.upcCode = upcCode;
    if (brand !== undefined) updateData.brand = brand;
    if (status !== undefined) updateData.status = status;

    await product.update(updateData);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });

  } catch (error) {
    console.error('Error updating product for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to update product for import'
    });
  }
};

exports.deleteProductForImport = async (req, res) => {
  try {
    const product = await ProductForImport.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting product for import:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete product for import'
    });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        error: "Product IDs array is required"
      });
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        error: "Valid status (active/inactive) is required"
      });
    }

    const result = await ProductForImport.update(
      { 
        status: status,
        lastUpdated: new Date()
      },
      {
        where: {
          id: {
            [Op.in]: productIds
          }
        }
      }
    );

    res.json({
      success: true,
      message: `Updated status to ${status} for ${result[0]} products`
    });

  } catch (error) {
    console.error('Error bulk updating products:', error);
    res.status(500).json({
      error: error.message || 'Failed to bulk update products'
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Search query is required"
      });
    }

    const products = await ProductForImport.findAll({
      where: {
        [Op.or]: [
          { sku: { [Op.iLike]: `%${q}%` } },
          { upcCode: { [Op.iLike]: `%${q}%` } },
          { brand: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      error: error.message || 'Failed to search products'
    });
  }
};