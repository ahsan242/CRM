

// const express = require('express');
// const router = express.Router();
// const productForImportController = require('../controllers/productForImportController');

// // CRUD Routes
// router.post('/', productForImportController.createProductForImport);
// router.post('/bulk', productForImportController.bulkCreateProductsForImport);
// router.post('/import-external', productForImportController.importFromExternalAPI); // NEW ROUTE
// router.get('/', productForImportController.getAllProductsForImport);
// router.get('/stats', productForImportController.getStats);
// router.get('/search', productForImportController.searchProducts);
// router.get('/:id', productForImportController.getProductForImportById);
// router.put('/:id', productForImportController.updateProductForImport);
// router.delete('/:id', productForImportController.deleteProductForImport);
// router.patch('/bulk-status', productForImportController.bulkUpdateStatus);

// module.exports = router;

const express = require('express');
const router = express.Router();
const productForImportController = require('../controllers/productForImportController');

// CRUD Routes
router.post('/', productForImportController.createProductForImport);
router.post('/bulk', productForImportController.bulkCreateProductsForImport);
router.post('/import-external', productForImportController.importFromExternalAPI);
router.get('/', productForImportController.getAllProductsForImport);
router.get('/stats', productForImportController.getStats);
router.get('/search', productForImportController.searchProducts);
router.get('/:id', productForImportController.getProductForImportById);
router.put('/:id', productForImportController.updateProductForImport);
router.delete('/:id', productForImportController.deleteProductForImport);
router.patch('/bulk-status', productForImportController.bulkUpdateStatus);

module.exports = router;