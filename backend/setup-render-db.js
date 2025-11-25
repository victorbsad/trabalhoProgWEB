require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// COLE AQUI A EXTERNAL DATABASE URL DO RENDER
const DATABASE_URL = process.env.RENDER_DATABASE_URL || 'COLE_AQUI_A_URL_DO_RENDER';

async function setupRender() {
  console.log('🚀 Conectando ao PostgreSQL do Render...\n');

  if (DATABASE_URL === 'COLE_AQUI_A_URL_DO_RENDER') {
    console.error('❌ ERRO: Você precisa colar a DATABASE_URL do Render!');
    console.log('\n📋 Como fazer:');
    console.log('1. Abra o dashboard do Render');
    console.log('2. Clique no seu banco PostgreSQL');
    console.log('3. Copie a "External Database URL"');
    console.log('4. Cole no arquivo .env como: RENDER_DATABASE_URL=...');
    console.log('5. OU cole diretamente neste arquivo na linha 6');
    console.log('\nExemplo:');
    console.log('const DATABASE_URL = "postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/banco";');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Necessário para Render
    },
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL do Render!\n');

    // Ler e executar o SQL
    const sqlPath = path.join(__dirname, 'sql', 'create_products_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📦 Criando tabela e inserindo produtos...');
    await client.query(sql);
    console.log('✅ Tabela produtos criada!');

    // Verificar dados
    const result = await client.query('SELECT COUNT(*) as total FROM produtos');
    console.log(`✅ Total de produtos cadastrados: ${result.rows[0].total}`);

    // Mostrar alguns produtos
    const produtos = await client.query('SELECT nome, preco FROM produtos LIMIT 3');
    console.log('\n📋 Primeiros produtos:');
    produtos.rows.forEach(p => {
      console.log(`  - ${p.nome}: R$ ${p.preco}`);
    });

    await client.end();
    console.log('\n🎉 Setup do Render completo!');
    console.log('Agora você pode criar o Web Service no Render.\n');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.error('\n💡 Dica: Verifique se a DATABASE_URL está correta');
    process.exit(1);
  }
}

setupRender();
