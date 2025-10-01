const express = require('express');
const{
    createProductForImport,
    bulkCreateProductsForImport,
    importFromExternalAPI,
    getAllProductsForImport,
    getStats,
    searchProducts,
    getProductsByStatus,
    getExactCountByStatus,
    getProductsByStatusWithFilters,
    getProductForImportById,
    updateProductForImport,
    deleteProductForImport,
    bulkUpdateStatus,
    updateProductStatus
} = require("../controllers/productForImportController");
const router = express.Router();
// const productForImportController = require('../controllers/productForImportController');

// CRUD Routes
router.post('/', createProductForImport);
router.post('/bulk', bulkCreateProductsForImport);
router.post('/import-external', importFromExternalAPI);
router.get('/', getAllProductsForImport);
router.get('/stats', getStats);
router.get('/search', searchProducts);
router.get('/status', getProductsByStatus); // New route
router.get('/status/exact', getExactCountByStatus); // New route
router.get('/status/filtered', getProductsByStatusWithFilters); // New route
router.get('/:id', getProductForImportById);
router.put('/:id', updateProductForImport);
router.delete('/:id', deleteProductForImport);
router.patch('/bulk-status', bulkUpdateStatus);
router.put('/productforimports/status', updateProductStatus);

module.exports = router;