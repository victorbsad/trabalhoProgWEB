require('dotenv').config();
const sql2 = require('msnodesqlv8');

// Connection string para msnodesqlv8 com Windows Authentication
const connectionString = 'Driver={SQL Server Native Client 11.0};Server=.\\SQLEXPRESS;Database=produtos_db;Trusted_Connection=yes;';

console.log('Tentando conectar com msnodesqlv8 diretamente...');
console.log('Connection String:', connectionString);

sql2.query(connectionString, 'SELECT TOP 3 * FROM produtos', (err, rows) => {
  if (err) {
    console.error('❌ Erro:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    process.exit(1);
  }
  
  console.log('✅ Conectado ao SQL Server!');
  console.log('📦 Produtos encontrados:', rows.length);
  console.log(rows);
  process.exit(0);
});
