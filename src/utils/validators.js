const { body } = require('express-validator');

// Validation rules for admin registration
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

// Validation rules for admin login
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for contact message submission
const messageValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name should only contain letters, spaces, hyphens, and apostrophes')
        .custom((value) => {
            if (/\d/.test(value)) {
                throw new Error('Name should not contain numbers');
            }
            return true;
        }),

    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('subject')
        .trim()
        .notEmpty()
        .withMessage('Subject is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Subject must be between 3 and 200 characters'),

    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),

    body('phone')
        .optional()
        .trim()
        .custom((value) => {
            if (!value) return true; // Phone is optional

            // Remove spaces and hyphens for validation
            const cleanPhone = value.replace(/[\s-]/g, '');

            // Indian phone number validation: +91 followed by 10 digits starting with 6-9
            const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

            if (!indianPhoneRegex.test(cleanPhone)) {
                throw new Error('Please enter a valid Indian phone number (e.g., +91 98765 43210)');
            }

            return true;
        })
];

module.exports = {
    registerValidation,
    loginValidation,
    messageValidation
};
