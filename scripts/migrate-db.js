const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('--- Running DB Migrations ---');
        
        console.log('Updating user roles...');
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'sales', 'production', 'inventory', 'finance') DEFAULT 'admin'");
        
        console.log('Creating notifications table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT,
                receiver_role ENUM('admin', 'sales', 'production', 'inventory', 'finance'),
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log('✅ Migrations complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migrations failed:', error.message);
        process.exit(1);
    }
}

runMigrations();
