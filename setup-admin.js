require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'admin' }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function setupAdmin() {
    try {
        console.log('\nContact Form System - Admin Setup\n');
        console.log('='.repeat(50));

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            console.log('An admin account already exists!');
            console.log(`   Email: ${existingAdmin.email}\n`);

            const overwrite = await question('Do you want to create another admin? (yes/no): ');
            if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
                console.log('\nSetup cancelled.');
                process.exit(0);
            }
            console.log('');
        }

        // Get admin details
        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 characters): ');

        // Validate input
        if (!name || !email || !password) {
            console.log('\nAll fields are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('\nPassword must be at least 6 characters!');
            process.exit(1);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('\nInvalid email format!');
            process.exit(1);
        }

        // Check if email already exists
        const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            console.log('\nAn admin with this email already exists!');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin
        const admin = new Admin({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();

        console.log('\n' + '='.repeat(50));
        console.log('Admin account created successfully!\n');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\nPlease save these credentials securely!');
        console.log('You can now login at: http://localhost:5173/admin/login');
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('\nError:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    }
}

setupAdmin();
