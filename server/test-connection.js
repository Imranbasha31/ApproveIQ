import sql from 'mssql';

async function testConnections() {
  const configs = [
    { name: 'Named Instance (Default Auth)', config: { server: 'localhost\\IMRAN', database: 'LeaveApprovalDB', authentication: { type: 'default' }, options: { encrypt: false, trustServerCertificate: true, connectionTimeout: 5000 } } },
    { name: 'Localhost Direct (Default Auth)', config: { server: 'localhost', database: 'LeaveApprovalDB', authentication: { type: 'default' }, options: { encrypt: false, trustServerCertificate: true, connectionTimeout: 5000 } } },
  ];

  for (const test of configs) {
    console.log(`\nTesting: ${test.name}`);
    try {
      const pool = new sql.ConnectionPool(test.config);
      await pool.connect();
      console.log('✓ Connected!');
      await pool.close();
    } catch (err) {
      console.log(`✗ Failed: ${err.message.substring(0, 100)}`);
    }
  }
  
  process.exit(0);
}

testConnections();
