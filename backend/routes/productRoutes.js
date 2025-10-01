
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

// Quick activation route
router.post('/activate-immediately', productController.activateProductImmediately);

module.exports = router;