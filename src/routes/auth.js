const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/responseHelper');

//POST /api/auth/register
router.post(
    '/register',
    registerValidation,
    handleValidationErrors,
    authController.register
);

//POST /api/auth/login
router.post(
    '/login',
    loginValidation,
    handleValidationErrors,
    authController.login
);

//GET /api/auth/me
router.get('/me', authMiddleware, authController.getCurrentAdmin);

module.exports = router;
