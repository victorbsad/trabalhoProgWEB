const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/login - Login com email
router.post('/login', authController.login);

// GET /api/v1/auth/validate - Validar token
router.get('/validate', authController.validateToken);

module.exports = router;
