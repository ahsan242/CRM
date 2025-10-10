// // backend/routes/pricesRoutes.js
// const express = require('express');
// const router = express.Router();
// const priceController = require('../controllers/priceController');

// // Price management routes
// router.post('/', priceController.addOrUpdatePrice);
// router.get('/product/:productId', priceController.getProductPrices);
// router.get('/sku/:sku', priceController.getPricesBySku);
// router.get('/best/:sku', priceController.getBestPrice);
// router.put('/:id', priceController.updatePrice);
// router.delete('/:id', priceController.deletePrice);
// router.post('/bulk-import', priceController.bulkImportPrices);
// router.get('/sellers', priceController.getSellers);
// router.get('/seller/:sellerName', priceController.getPricesBySeller);
// router.get('/compare/:sku', priceController.comparePrices);

// module.exports = router;

const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

// Price management routes
router.post('/', priceController.addOrUpdatePrice);
router.get('/product/:productId', priceController.getProductPrices);
router.get('/sku/:sku', priceController.getPricesBySku);
router.get('/best/:sku', priceController.getBestPrice);
router.put('/:id', priceController.updatePrice);
router.delete('/:id', priceController.deletePrice);
router.post('/bulk-import', priceController.bulkImportPrices);
router.get('/sellers', priceController.getSellers);
router.get('/seller/:sellerName', priceController.getPricesBySeller);
router.get('/compare/:sku', priceController.comparePrices);
router.get('/tables', priceController.getSellerTables); // New route for viewing tables

// Test route to verify prices routes are working
router.get('/test', priceController.testPriceAPI);

module.exports = router;