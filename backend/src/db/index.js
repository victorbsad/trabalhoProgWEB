const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Configuração PostgreSQL - suporta DATABASE_URL (Render) ou variáveis individuais (local)
const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Necessário para Render
    }
  : {
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres',
      database: process.env.PG_DATABASE || 'produtos_db',
    };

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
});

const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Erro na query PostgreSQL:', err);
    throw err;
  }
};

module.exports = {
  query,
  pool,
};
