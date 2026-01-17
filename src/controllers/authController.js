const authService = require('../services/authService');

class AuthController {
    // Register a new admin
    // @route POST /api/auth/register
    // @access Public (should be protected in production)
    async register(req, res) {
        try {
            const result = await authService.registerAdmin(req.body);

            res.status(201).json({
                success: true,
                message: 'Admin registered successfully',
                ...result
            });
        } catch (error) {
            console.error('Register error:', error);

            if (error.message === 'Admin already exists with this email') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }

    // Login admin
    // @route POST /api/auth/login
    // @access Public
    async login(req, res) {
        try {
            const result = await authService.loginAdmin(req.body);

            res.json({
                success: true,
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            console.error('Login error:', error);

            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }

    // Get current admin
    // @route GET /api/auth/me
    // @access Private
    async getCurrentAdmin(req, res) {
        try {
            res.json({
                success: true,
                admin: {
                    id: req.admin._id,
                    name: req.admin.name,
                    email: req.admin.email,
                    role: req.admin.role
                }
            });
        } catch (error) {
            console.error('Get admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
}

module.exports = new AuthController();
