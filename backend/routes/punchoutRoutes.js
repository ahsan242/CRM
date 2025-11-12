// const express = require('express');
// const router = express.Router();
// const punchoutController = require('../controllers/punchoutController');

// // Middleware to handle raw XML bodies
// router.use(express.text({ type: 'text/xml', limit: '1mb' }));

// // PunchOut Setup Request (from procurement system)
// router.post('/setup-request', punchoutController.handleSetupRequest);

// // PunchOut Order Message (cart transfer back to procurement system)
// router.post('/order-message', punchoutController.handleOrderMessage);

// // PunchOut Login (redirect from setup request)
// router.get('/login', punchoutController.punchoutLogin);

// // Validate PunchOut Token
// router.get('/validate-token', punchoutController.validatePunchoutToken);

// module.exports = router;

const express = require('express');
const router = express.Router();
const punchoutController = require('../controllers/punchoutController');

// Apply raw text middleware only to XML endpoints
const xmlMiddleware = express.text({ 
  type: ['text/xml', 'application/xml'],
  limit: '1mb'
});

// PunchOut Setup Request (from procurement system) - accepts XML
router.post('/setup-request', xmlMiddleware, punchoutController.handleSetupRequest);

// PunchOut Order Message (cart transfer back to procurement system) - accepts XML
router.post('/order-message', xmlMiddleware, punchoutController.handleOrderMessage);

// PunchOut Login (redirect from setup request) - regular JSON
router.get('/login', punchoutController.punchoutLogin);

// Validate PunchOut Token - regular JSON
router.get('/validate-token', punchoutController.validatePunchoutToken);

module.exports = router;