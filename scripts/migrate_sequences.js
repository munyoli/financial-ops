const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('--- Starting Sequence Migration ---');
        
        // 1. Create sequences table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sequences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                entity_type VARCHAR(50) NOT NULL UNIQUE,
                prefix VARCHAR(10) NOT NULL,
                current_value INT NOT NULL DEFAULT 0,
                padding INT NOT NULL DEFAULT 3,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ sequences table ready.');

        // 2. Initialize sequence values
        await pool.query(`
            INSERT INTO sequences (entity_type, prefix, current_value, padding)
            VALUES 
                ('quote', 'QUO-', 0, 3),
                ('invoice', 'INV-', 0, 3),
                ('production', 'PRD-', 0, 3)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
        console.log('✅ sequence values initialized.');

        // 3. Add quote_number to quotes table
        try {
            await pool.query('ALTER TABLE quotes ADD COLUMN quote_number VARCHAR(50) UNIQUE AFTER id');
            console.log('✅ quote_number column added.');
        } catch (e) {
            if (e.message.includes('Duplicate column name')) {
                console.log('⚠️ quote_number already exists.');
            } else {
                throw e;
            }
        }

        console.log('--- Migration Complete ---');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrate();
