
// // src/routes/productRoutes.js
// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const multer = require('multer');
// const path = require('path'); // Add this missing import

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     // cb(null, Date.now() + path.extname(file.originalname));
//     cb(null, Date.now() + path.extname(file.originalname)); // Now path is defined
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

// // Import routes
// router.post('/import', productController.importProduct);
// router.get('/imports', productController.getimportsProducts);

// // Regular product routes
// router.post('/', uploadFiles, productController.createProduct);
// router.get('/', productController.getProducts);
// router.get('/:id', productController.getProduct);
// router.put('/:id', uploadFiles, productController.updateProduct);
// router.delete('/:id', productController.deleteProduct);

// module.exports = router;












// // src/routes/productRoutes.js
// const express = require('express');
// const router = express.Router();
// const productController = require('../controllers/productController');
// const multer = require('multer');
// const path = require('path'); // Add this missing import

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Now path is defined
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

// // ===== IMPORT ROUTES =====

// // Single product import from Icecat
// router.post('/import', productController.importProduct);

// // Bulk product import from Icecat (NEW)
// router.post('/bulk-import', productController.bulkImportProducts);

// // Get bulk import status (NEW)
// router.get('/bulk-import/:jobId', productController.getBulkImportStatus);

// // Get imported products
// router.get('/imports', productController.getimportsProducts);

// // Excel import routes
// router.post('/import-excel', productController.importProductsFromExcel);
// router.get('/import-jobs', productController.getImportJobs);
// router.get('/import-jobs/:jobId', productController.getImportJobStatus);

// // ===== REGULAR PRODUCT CRUD ROUTES =====

// // Create product with file upload
// router.post('/', uploadFiles, productController.createProduct);

// // Get all products
// router.get('/', productController.getProducts);

// // Get single product
// router.get('/:id', productController.getProduct);

// // Update product with file upload
// router.put('/:id', uploadFiles, productController.updateProduct);

// // Delete product
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

// ===== NEW ROUTES FOR PRODUCT FOR IMPORT INTEGRATION =====

// Import products from ProductForImport table
router.post('/import-from-queue', productController.importFromProductForImport);

// Get products available for import from ProductForImport table
router.get('/import-queue', productController.getProductsForImport);

// ===== EXISTING IMPORT ROUTES =====

// Single product import from Icecat
router.post('/import', productController.importProduct);

// Bulk product import from Icecat
router.post('/bulk-import', productController.bulkImportProducts);

// Get bulk import status
router.get('/bulk-import/:jobId', productController.getBulkImportStatus);

// Get imported products
router.get('/imports', productController.getimportsProducts);

// ===== REGULAR PRODUCT CRUD ROUTES =====

// Create product with file upload
router.post('/', uploadFiles, productController.createProduct);

// Get all products
router.get('/', productController.getProducts);

// Get single product
router.get('/:id', productController.getProduct);

// Update product with file upload
router.put('/:id', uploadFiles, productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;