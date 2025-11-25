require('dotenv').config();
const { Client } = require('pg');

const senhasPossiveis = ['', 'postgres', 'admin', '123456', 'password', '1234'];

async function testarSenha(senha) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: senha,
    database: 'postgres',
  });

  try {
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    return false;
  }
}

async function encontrarSenha() {
  console.log('🔍 Testando senhas comuns do PostgreSQL...\n');
  
  for (const senha of senhasPossiveis) {
    process.stdout.write(`Tentando senha: "${senha || '(vazia)'}"`);
    const funciona = await testarSenha(senha);
    
    if (funciona) {
      console.log(' ✅ FUNCIONA!\n');
      console.log('='.repeat(50));
      console.log(`✅ SENHA ENCONTRADA: "${senha || '(vazia)'}"`);
      console.log('='.repeat(50));
      console.log('\nEdite o arquivo .env e coloque:');
      console.log(`PG_PASSWORD=${senha}`);
      console.log('\nDepois execute: node setup-db.js');
      return;
    } else {
      console.log(' ❌');
    }
  }
  
  console.log('\n❌ Nenhuma senha comum funcionou.\n');
  console.log('💡 Soluções:');
  console.log('1. Resetar senha do PostgreSQL:');
  console.log('   - Localize o arquivo pg_hba.conf');
  console.log('   - Mude "md5" para "trust" na linha do localhost');
  console.log('   - Reinicie o serviço PostgreSQL');
  console.log('   - Execute: psql -U postgres');
  console.log('   - Digite: ALTER USER postgres PASSWORD \'nova_senha\';');
  console.log('\n2. OU usar banco online do Render diretamente (recomendado para urgência)');
}

encontrarSenha();
