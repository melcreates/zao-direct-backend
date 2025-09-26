const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const productController = require('../controllers/productController');

// 🔓 Public
router.get('/products', productController.getAllProducts);
router.get('/products/:productId', productController.getProductById);
router.get('/product/:userId', productController.getSpecificFarmerProducts);

// 🔐 Protected
router.post('/products', verifyToken, productController.createProduct);
router.delete('/products/:id', verifyToken, productController.deleteProduct);

module.exports = router;
