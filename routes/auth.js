// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

// update user description (use authController, not userController)
router.put('/description', verifyToken, authController.updateDescription);

// logout 

// routes/userRoutes.js
router.post("/status", verifyToken, authController.logout);


module.exports = router;

