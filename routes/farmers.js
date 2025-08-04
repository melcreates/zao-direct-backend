const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const productController = require('../controllers/productController');

router.get('/farmers', farmerController.getAllFarmers)
router.get('/farmers/:userId', productController.getSpecificFarmerProducts)

module.exports = router;