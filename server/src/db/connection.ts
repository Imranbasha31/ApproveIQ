import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  server: 'localhost\\IMRAN',
  options: {
    database: 'LeaveApprovalDB',
    encrypt: false,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: '',
    },
  },
};

let pool: sql.ConnectionPool | null = null;

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
    // Don't throw - allow server to start even if DB is unavailable
    // DB will be retried on first use
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
