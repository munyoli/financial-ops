const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'create_institutional_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await connection.query(sql);
        console.log('Migration successful: institutional tables created.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

runMigration();
