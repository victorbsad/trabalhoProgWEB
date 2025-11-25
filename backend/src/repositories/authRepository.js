const { pool } = require('../db');
const crypto = require('crypto');

class AuthRepository {
  // Criar ou buscar usuário por email
  async findOrCreateUser(email, nome = null) {
    const client = await pool.connect();
    try {
      // Tentar encontrar usuário
      let result = await client.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      
      // Criar novo usuário se não existir
      result = await client.query(
        'INSERT INTO usuarios (email, nome) VALUES ($1, $2) RETURNING *',
        [email, nome || email.split('@')[0]]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Criar token de autenticação
  async createToken(usuarioId) {
    const client = await pool.connect();
    try {
      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex');
      
      // Token expira em 24 horas
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const result = await client.query(
        'INSERT INTO tokens (usuario_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [usuarioId, token, expiresAt]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Validar token
  async validateToken(token) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT t.*, u.email, u.nome 
         FROM tokens t 
         JOIN usuarios u ON t.usuario_id = u.id 
         WHERE t.token = $1 AND t.expires_at > NOW()`,
        [token]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }
  
  // Remover tokens expirados
  async cleanExpiredTokens() {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM tokens WHERE expires_at < NOW()');
    } finally {
      client.release();
    }
  }
}

module.exports = new AuthRepository();
