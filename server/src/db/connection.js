import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: 'IMMU\\IMRAN',
  database: 'LeaveApprovalDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  pool: {
    min: 0,
    max: 5,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

export async function connectDB() {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('✓ Database connected successfully');
    }
    return pool;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return null;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not connected. Please ensure SQL Server is running and connection details are correct.');
  }
  return pool;
}

export async function closeDB() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection closed');
  }
}
