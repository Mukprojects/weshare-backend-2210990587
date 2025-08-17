const express = require('express');
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/profile', authenticateJWT, authController.updateProfile);
router.post('/change-password', authenticateJWT, authController.changePassword);
router.get('/verify', authenticateJWT, authController.verifyToken);

module.exports = router;