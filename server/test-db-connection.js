import sql from 'mssql/msnodesqlv8.js';

const config = {
  server: 'IMMU\\IMRAN',
  database: 'LeaveApprovalDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

async function testConnection() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    console.log('🔄 Attempting to connect to SQL Server...');
    console.log('  Server:', config.server);
    console.log('  Database:', config.database);
    console.log('');

    await pool.connect();
    
    console.log('✅ Database connection successful!');
    
    const result = await pool.request().query('SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DatabaseName');
    
    console.log('');
    console.log('📊 Server Information:');
    console.log('  Server:', result.recordset[0].ServerName);
    console.log('  Database:', result.recordset[0].DatabaseName);
    
    // Test: Get table counts
    const tablesResult = await pool.request().query(`
      SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'
    `);
    
    console.log('  Tables:', tablesResult.recordset[0].TableCount);
    
    // Test: Get sample data
    const usersResult = await pool.request().query('SELECT COUNT(*) as UserCount FROM Users');
    const leavesResult = await pool.request().query('SELECT COUNT(*) as LeaveCount FROM LeaveRequests');
    
    console.log('');
    console.log('📈 Data Summary:');
    console.log('  Users:', usersResult.recordset[0].UserCount);
    console.log('  Leave Requests:', leavesResult.recordset[0].LeaveCount);
    
    console.log('');
    console.log('✨ All tests passed! Your database is ready to use.');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('  Error:', error.message);
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('  1. Ensure SQL Server is running (check SQL Server Configuration Manager)');
    console.error('  2. Verify the server name and instance: IMMU\\IMRAN');
    console.error('  3. Check that the database LeaveApprovalDB exists');
    console.error('  4. Try connecting via SSMS to confirm connectivity');
  } finally {
    await pool.close();
  }
}

testConnection();
