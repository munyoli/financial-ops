const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function seed() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Crucial for running multi-statement SQL files
    });

    try {
        console.log('Running migration script...');
        const migrationSql = fs.readFileSync(path.join(__dirname, 'create_production_orders.sql'), 'utf8');
        await pool.query(migrationSql);
        console.log('✅ Migration successful');

        console.log('Seeding production orders...');
        
        // Clear existing to avoid duplicates if re-run
        await pool.query('DELETE FROM production_stages');
        await pool.query('DELETE FROM production_orders');

        // Insert dummy orders
        const [result] = await pool.query(
            `INSERT INTO production_orders (order_id, brand_id, client_name, assigned_tailor, current_status, progress_percentage, due_date) 
             VALUES 
             ('ORD-101', 'ATELIER-01', 'Vivienne Westwood', 'Tailor Alice', 'cutting', 20.0, '2026-04-10'),
             ('ORD-102', 'ATELIER-01', 'John Galliano', 'Tailor Bob', 'sewing', 45.0, '2026-04-05'),
             ('ORD-103', 'ATELIER-01', 'Iris van Herpen', 'Tailor Charlie', 'finishing', 80.0, '2026-04-01'),
             ('ORD-104', 'ATELIER-01', 'Lee McQueen', 'Tailor Alice', 'qc', 95.0, '2026-03-30'),
             ('ORD-105', 'ATELIER-01', 'Coco Chanel', 'Tailor Bob', 'done', 100.0, '2026-03-25')`
        );

        console.log('✅ Seeded 5 production orders');

        // Insert initial stages for audit log
        // The result.insertId is the first ID if multiple rows inserted? 
        // In mysql2, for multiple inserts, result.insertId might not be enough.
        // Let's fetch all IDs.
        const [rows] = await pool.query('SELECT id, current_status FROM production_orders');

        for (const row of rows) {
            await pool.query(
                `INSERT INTO production_stages (production_order_id, status, notes) VALUES (?, ?, 'Initial seed status')`,
                [row.id, row.current_status]
            );
        }

        console.log('✅ Seeded production stages');
    } catch (error) {
        console.error('❌ Migration/Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seed();
