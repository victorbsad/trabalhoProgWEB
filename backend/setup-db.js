require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://produtos_damq_user:b1GPuO32RxPECBqaHPhJCP3dzph8qPnz@dpg-d4dtv93gk3sc73bb3sv0-a.oregon-postgres.render.com/produtos_damq';

async function setup() {
  // Primeiro, conectar ao postgres padrão para criar o banco
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: 'postgres', // banco padrão
  });

  try {
    await adminClient.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Tentar criar o banco
    try {
      await adminClient.query('CREATE DATABASE produtos_db');
      console.log('✅ Banco produtos_db criado');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Banco produtos_db já existe');
      } else {
        throw err;
      }
    }

    await adminClient.end();

    // Agora conectar ao banco produtos_db para criar a tabela
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: process.env.PG_PASSWORD || '',
      database: 'produtos_db',
    });

    await client.connect();
    console.log('✅ Conectado ao produtos_db');

    // Ler e executar o SQL
    const sqlPath = path.join(__dirname, 'sql', 'create_products_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log('✅ Tabela produtos criada e dados inseridos');

    // Verificar dados
    const result = await client.query('SELECT COUNT(*) as total FROM produtos');
    console.log(`📦 Total de produtos: ${result.rows[0].total}`);

    await client.end();
    console.log('\n🎉 Setup completo! Agora execute: npm start');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

setup();
