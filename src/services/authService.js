const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

class AuthService {
    // Register a new admin
    async registerAdmin(adminData) {
        const { name, email, password } = adminData;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin already exists with this email');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await admin.save();

        // Generate JWT token
        const token = this.generateToken(admin);

        return {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
    }

    // Login admin
    async loginAdmin(credentials) {
        const { email, password } = credentials;

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken(admin);

        return {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        };
    }

    // Get admin by ID
    async getAdminById(adminId) {
        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            throw new Error('Admin not found');
        }
        return admin;
    }

    // Generate JWT token
    generateToken(admin) {
        return jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
}

module.exports = new AuthService();
