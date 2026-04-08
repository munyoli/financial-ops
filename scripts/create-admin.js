const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function createAdmin() {
    const adminEmail = 'munyolimwende@gmail.com';
    const adminName = 'Munyoli Mwende';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error('❌ ADMIN_PASSWORD environment variable is not set.');
        process.exit(1);
    }

    try {
        console.log(`Checking for admin account: ${adminEmail}...`);

        const [rows] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [adminEmail]
        );

        if (rows.length > 0) {
            console.log('✅ Admin account already exists.');
            process.exit(0);
        }

        console.log('⏳ Creating admin account...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [adminName, adminEmail, hashedPassword, 'admin']
        );

        console.log('✅ Admin account created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin account:', error.message);
        process.exit(1);
    }
}

createAdmin();
