import mysql, { Pool } from 'mysql2/promise';

/**
 * Global database connection pool
 * Using mysql2/promise for async/await support.
 * 
 * Ensure your .env.local has:
 * DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 */

// Create the pool with specific configuration
export const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * Quick helper to verify connection status.
 * Useful for health checks or startup verification.
 */
export async function testConnection(): Promise<boolean> {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    } finally {
        if (connection) connection.release();
    }
}
