const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'C:/Users/USER PC/CODING/FINANCIAL OPS/couture-studio/.env' });

async function fixSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking users table columns...');
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const hasDepartment = columns.some((c) => c.Field === 'department');

        if (!hasDepartment) {
            console.log('Adding department column...');
            // Using a simpler VARCHAR if ENUM is failing
            await connection.query("ALTER TABLE users ADD COLUMN department VARCHAR(50) DEFAULT 'sales'");
            console.log('Column added successfully.');
        } else {
            console.log('Department column already exists.');
        }

        // Ensure the admin user has the admin department
        await connection.query("UPDATE users SET department = 'admin' WHERE role = 'admin'");
        console.log('User roles updated.');

    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await connection.end();
    }
}

fixSchema();
