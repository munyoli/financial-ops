const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the couture-studio .env file
dotenv.config({ path: 'C:/Users/USER PC/CODING/FINANCIAL OPS/couture-studio/.env' });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('Connected to database.');

    const sqlPath = 'C:/Users/USER PC/CODING/FINANCIAL OPS/couture-studio/scripts/update_users_table.sql';
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await connection.query(sql);
        console.log('Migration successful: production_orders and production_stages tables verified/created.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

runMigration();
