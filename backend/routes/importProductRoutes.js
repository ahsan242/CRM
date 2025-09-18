
// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  importProduct,
  getimportsProducts,
,
} = require('../controllers/importController');

router.post('/', importProduct); 
router.get('/', getimportsProducts);


module.exports = router;