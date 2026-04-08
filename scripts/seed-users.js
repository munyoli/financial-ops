const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function seedUsers() {
    const pool = mysql.createPool(dbConfig);
    const adminEmail = process.env.ADMIN_EMAIL || 'manukato.twostones@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Twostones2580#';

    const users = [
        { name: 'Admin User', email: adminEmail, role: 'admin', password: adminPassword },
        { name: 'Sales Head', email: 'sales@couture.com', role: 'sales', password: 'password123' },
        { name: 'Production Manager', email: 'production@couture.com', role: 'production', password: 'password123' },
        { name: 'Inventory Controller', email: 'inventory@couture.com', role: 'inventory', password: 'password123' },
        { name: 'Finance Manager', email: 'finance@couture.com', role: 'finance', password: 'password123' },
    ];

    try {
        console.log('--- Starting User Seeding ---');

        for (const user of users) {
            console.log(`Checking user: ${user.email}...`);
            const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);

            if (rows.length > 0) {
                console.log(`✅ User ${user.email} already exists.`);
                continue;
            }

            console.log(`⏳ Creating user: ${user.email} (Role: ${user.role})...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await pool.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [user.name, user.email, hashedPassword, user.role]
            );
            console.log(`✅ User ${user.email} created!`);
        }

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedUsers();
