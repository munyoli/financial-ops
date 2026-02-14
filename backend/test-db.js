// Load environment variables from .env.local
require('dotenv').config(); // automatically reads .env.local in project root

const mysql = require('mysql2/promise');

async function runTest() {
  // Check for critical missing variables first
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('   -> Check your .env file.');
    process.exit(1);
  }

  console.log('🧪 Testing MySQL Connection...');
  console.log('   Host:', process.env.DB_HOST);
  console.log('   User:', process.env.DB_USER);
  // Be explicit about password state
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️  DB_PASSWORD is empty or undefined!');
    console.warn('   -> If your password contains a "#", wrap the value in quotes: DB_PASSWORD="my#password"');
  } else if (process.env.DB_PASSWORD === 'PLACEHOLDER_PASSWORD_CHANGE_ME') {
    console.error('❌ YOU ARE USING THE PLACEHOLDER PASSWORD!');
    console.error('   -> The file on disk still contains "PLACEHOLDER_PASSWORD_CHANGE_ME".');
    console.error('   -> Please edit .env, replace it with your real password, and SAVE THE FILE.');
  } else {
    console.log('   Pass:', '****** (Set)');
  }
  console.log('   Port:', process.env.DB_PORT || '3306 (Default)');
  console.log('   DB:  ', process.env.DB_NAME);

  let connection;
  try {
    console.log('--- Step 1: Connecting to Server (No DB selected) ---');

    // 1. Connect without specifying a database (just test credentials)
    const serverPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 1,
    });

    connection = await serverPool.getConnection();
    console.log('✅ Connected to MySQL Server successfully (Credentials are correct).');

    // 2. Check if the database exists
    console.log(`--- Step 2: Checking if database '${process.env.DB_NAME}' exists ---`);
    const [rows] = await connection.query(
      `SHOW DATABASES LIKE '${process.env.DB_NAME}'`
    );

    if (rows.length === 0) {
      console.error(`❌ Database '${process.env.DB_NAME}' DOES NOT EXIST.`);
      console.log('   -> Run the "scripts/init_db.sql" script to create it.');
      process.exit(1); // Exit with error
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' found.`);
      process.exit(0); // Success
    }

  } catch (error) {
    console.error('❌ Failed to connect to MySQL Server:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   -> PASSWORD/USERNAME INCORRECT. Check .env file.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   -> SERVER DOWN. Is MySQL running on port 3306?');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   -> HOST NOT FOUND. Check DB_HOST in .env file.');
    }

    process.exit(1); // Exit on failure
  } finally {
    if (connection) connection.release();
  }
}

runTest();
