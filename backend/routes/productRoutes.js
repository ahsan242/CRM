// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
// });

// const uploadFiles = upload.fields([
//   { name: 'mainImage', maxCount: 1 },
//   { name: 'detailImages', maxCount: 10 }
// ]);


// // ===== PRICE-RELATED ROUTES =====
// // Add these at the top to avoid conflict with parameter routes
// router.get('/search/with-prices', productController.searchProductsWithPrices);
// router.get('/:id/prices', productController.getProductWithPrices);

// // ===== PRODUCT FILTERING ROUTES =====
// // Specific filtering routes
// router.get('/filter/category', productController.filterByCategory);
// router.get('/filter/manufacturer', productController.filterByManufacturer);
// router.get('/filter/category-manufacturer', productController.filterByCategoryAndManufacturer);
// router.get('/manufacturers', productController.getManufacturers);

// // General filtering and search routes

// router.get('/filter', productController.filterProducts);
// router.get('/filter/brands', productController.getFilterBrands);
// router.get('/filter/categories', productController.getFilterCategories);
// router.get('/search', productController.advancedSearch);
// router.get('/quick-search', productController.searchProducts);

// // ===== IMPORT QUEUE ROUTES =====
// router.post('/import-from-queue', productController.importFromProductForImport);
// router.get('/import-queue', productController.getProductsForImport);
// router.post('/activate-immediately', productController.activateProductImmediately);

// // ===== ICECAT IMPORT ROUTES =====
// router.post('/import', productController.importProduct);
// router.post('/bulk-import', productController.bulkImportProducts);
// router.get('/bulk-import/:jobId', productController.getBulkImportStatus);
// router.get('/imports', productController.getimportsProducts);

// // ===== BASIC CRUD ROUTES =====
// router.post('/', uploadFiles, productController.createProduct);
// router.get('/', productController.getProducts);
// router.get('/:id', productController.getProduct);
// router.put('/:id', uploadFiles, productController.updateProduct);
// router.delete('/:id', productController.deleteProduct);

// module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const uploadFiles = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'detailImages', maxCount: 10 }
]);

// ===== PRICE-RELATED ROUTES =====
// Add these at the top to avoid conflict with parameter routes
router.get('/search/with-prices', productController.searchProductsWithPrices);
router.get('/:id/prices', productController.getProductWithPrices);

// ===== PRODUCT FILTERING ROUTES =====
// Specific filtering routes
router.get('/filter/category', productController.filterByCategory);
router.get('/filter/manufacturer', productController.filterByManufacturer);
router.get('/filter/category-manufacturer', productController.filterByCategoryAndManufacturer);
router.get('/manufacturers', productController.getManufacturers);

// General filtering and search routes
router.get('/filter', productController.filterProducts);
router.get('/filter/brands', productController.getFilterBrands);
router.get('/filter/categories', productController.getFilterCategories);
router.get('/search', productController.advancedSearch);
router.get('/quick-search', productController.searchProducts);

// ===== IMPORT QUEUE ROUTES =====
router.post('/import-from-queue', productController.importFromProductForImport);
router.get('/import-queue', productController.getProductsForImport);
router.post('/activate-immediately', productController.activateProductImmediately);

// ===== ICECAT IMPORT ROUTES =====
router.post('/import', productController.importProduct);
router.post('/bulk-import', productController.bulkImportProducts);
router.get('/bulk-import/:jobId', productController.getBulkImportStatus);
router.get('/imports', productController.getimportsProducts);

// ===== BASIC CRUD ROUTES =====
router.post('/', uploadFiles, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', uploadFiles, productController.updateProduct); // This is the problematic route
// router.delete('/:id', productController.deleteProduct);

module.exports = router;