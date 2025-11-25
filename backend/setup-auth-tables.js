const { pool } = require('./src/db');
const fs = require('fs');
const path = require('path');

async function setupAuthTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Criando tabelas de autenticação e sacola...');
    
    const sqlPath = path.join(__dirname, 'sql', 'create-auth-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Tabelas criadas com sucesso!');
    console.log('   - usuarios');
    console.log('   - tokens');
    console.log('   - sacolas');
    console.log('   - sacola_info');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupAuthTables();
