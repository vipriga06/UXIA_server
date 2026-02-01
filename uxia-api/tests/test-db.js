const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'uxia_user',
      password: 'password', 
      database: 'uxia_db'
    });
    
    console.log('✅ Conexión a MySQL exitosa!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();