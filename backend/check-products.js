require('dotenv').config();
const { Client } = require('pg');

async function checkProducts() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.PG_PASSWORD || '1234',
    database: 'produtos_db',
  });

  try {
    await client.connect();
    
    const byCategory = await client.query(
      'SELECT categoria_id, COUNT(*) as count FROM produtos GROUP BY categoria_id ORDER BY categoria_id'
    );
    
    console.log('\n📊 Produtos por categoria:');
    byCategory.rows.forEach(row => {
      const cat = ['', 'Eletrônicos', 'Informática', 'Smartphones', 'Acessórios'][row.categoria_id] || 'Sem categoria';
      console.log(`  Categoria ${row.categoria_id} (${cat}): ${row.count} produtos`);
    });
    
    const total = await client.query('SELECT COUNT(*) as count FROM produtos');
    console.log(`\n📦 Total: ${total.rows[0].count} produtos\n`);
    
    await client.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

checkProducts();
