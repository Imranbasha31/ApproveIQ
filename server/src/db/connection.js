import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
dotenv.config();

const dbServer = process.env.DB_SERVER || "localhost";
const dbInstance = process.env.DB_INSTANCE || "";
const dbName = process.env.DB_NAME || "LeaveApprovalDB";

const serverName = dbInstance && !dbServer.includes("\\")
  ? `${dbServer}\\${dbInstance}`
  : dbServer;

const config = {
  server: serverName,
  database: dbName,
  driver: "msnodesqlv8",
  connectionTimeout: 5e3,
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};
let pool = null;
async function connectDB() {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();

      // Keep schema aligned with API needs for attachment support.
      await pool.request().query(`
        IF COL_LENGTH('LeaveRequests', 'proof_file') IS NULL
        BEGIN
          ALTER TABLE LeaveRequests
          ADD proof_file NVARCHAR(255) NULL;
        END
      `);

      // Ensure login credentials can be stored for created users.
      await pool.request().query(`
        IF COL_LENGTH('Users', 'password') IS NULL
        BEGIN
          ALTER TABLE Users
          ADD [password] NVARCHAR(255) NULL;
        END
      `);

      console.log("\u2713 Database connected successfully");
    }
    return pool;
  } catch (error) {
    console.error(`\u2717 Database connection failed (${serverName}/${dbName}):`, error.message);
    return null;
  }
}
function getPool() {
  if (!pool) {
    throw new Error("Database not connected. Please ensure SQL Server is running and connection details are correct.");
  }
  return pool;
}
async function closeDB() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("Database connection closed");
  }
}
export {
  closeDB,
  connectDB,
  getPool
};
