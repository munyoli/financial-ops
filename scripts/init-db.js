const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
    console.log('🚀 Starting Database Initialization...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Critical for running the whole script
    });

    try {
        const sqlPath = path.join(__dirname, 'init_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⏳ Executing schema script...');
        await connection.query(sql);

        console.log('✅ Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to initialize database:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initializeDatabase();
