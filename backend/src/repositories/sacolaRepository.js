const { pool } = require('../db');

class SacolaRepository {
  // Adicionar item à sacola
  async addItem(usuarioId, produtoId, quantidade, precoUnitario) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO sacolas (usuario_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (usuario_id, produto_id) 
         DO UPDATE SET 
           quantidade = EXCLUDED.quantidade,
           preco_unitario = EXCLUDED.preco_unitario,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [usuarioId, produtoId, quantidade, precoUnitario]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Atualizar quantidade do item
  async updateItemQuantity(usuarioId, produtoId, quantidade) {
    const client = await pool.connect();
    try {
      if (quantidade <= 0) {
        // Remove item se quantidade for 0 ou negativa
        return await this.removeItem(usuarioId, produtoId);
      }
      
      const result = await client.query(
        `UPDATE sacolas 
         SET quantidade = $3, updated_at = CURRENT_TIMESTAMP
         WHERE usuario_id = $1 AND produto_id = $2
         RETURNING *`,
        [usuarioId, produtoId, quantidade]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Remover item da sacola
  async removeItem(usuarioId, produtoId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM sacolas WHERE usuario_id = $1 AND produto_id = $2 RETURNING *',
        [usuarioId, produtoId]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Listar todos os itens da sacola
  async getItems(usuarioId) {
    const client = await pool.connect();
    try {
      console.log('📋 Buscando itens da sacola para usuário:', usuarioId);
      
      const result = await client.query(
        `SELECT 
           s.id,
           s.produto_id,
           s.quantidade,
           s.preco_unitario,
           p.nome,
           p.descricao,
           p.categoria_id,
           (s.quantidade * s.preco_unitario) as subtotal
         FROM sacolas s
         LEFT JOIN produtos p ON s.produto_id = p.id
         WHERE s.usuario_id = $1
         ORDER BY s.created_at DESC`,
        [usuarioId]
      );
      
      console.log('📦 Itens encontrados:', result.rows.length);
      
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  // Limpar toda a sacola
  async clearSacola(usuarioId) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sacolas WHERE usuario_id = $1', [usuarioId]);
    } finally {
      client.release();
    }
  }
  
  // Salvar informações de entrega (CEP, frete, cupom)
  async saveInfo(usuarioId, info) {
    const client = await pool.connect();
    try {
      const { cep, estado, cidade, bairro, logradouro, frete, cupom, desconto } = info;
      
      const result = await client.query(
        `INSERT INTO sacola_info (usuario_id, cep, estado, cidade, bairro, logradouro, frete, cupom, desconto)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (usuario_id)
         DO UPDATE SET
           cep = EXCLUDED.cep,
           estado = EXCLUDED.estado,
           cidade = EXCLUDED.cidade,
           bairro = EXCLUDED.bairro,
           logradouro = EXCLUDED.logradouro,
           frete = EXCLUDED.frete,
           cupom = EXCLUDED.cupom,
           desconto = EXCLUDED.desconto,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [usuarioId, cep, estado, cidade, bairro, logradouro, frete, cupom, desconto]
      );
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  // Obter informações de entrega
  async getInfo(usuarioId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM sacola_info WHERE usuario_id = $1',
        [usuarioId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }
}

module.exports = new SacolaRepository();
