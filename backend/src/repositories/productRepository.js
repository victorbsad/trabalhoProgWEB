const db = require('../db');
const { randomUUID } = require('crypto');

/**
 * Repositório de produtos com PostgreSQL.
 * Estrutura da tabela: id (UUID), nome, descricao, preco (NUMERIC), estoque (INTEGER), categoria_id, criado_em, atualizado_em
 */

const mapRowToProduct = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: row.preco !== null ? Number(row.preco) : null,
    estoque: row.estoque !== null ? Number(row.estoque) : null,
    categoria_id: row.categoria_id,
    criado_em: row.criado_em ? row.criado_em.toISOString() : null,
    atualizado_em: row.atualizado_em ? row.atualizado_em.toISOString() : null,
  };
};

const findAll = async () => {
  const { rows } = await db.query(
    `SELECT id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em
     FROM produtos
     ORDER BY criado_em DESC`
  );
  return rows.map(mapRowToProduct);
};

const findByCategory = async (categoriaId) => {
  const { rows } = await db.query(
    `SELECT id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em
     FROM produtos
     WHERE categoria_id = $1
     ORDER BY criado_em DESC`,
    [categoriaId]
  );
  return rows.map(mapRowToProduct);
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em
     FROM produtos WHERE id = $1`,
    [id]
  );
  return mapRowToProduct(rows[0]);
};

const create = async (product) => {
  const id = product.id || randomUUID();
  const nome = product.nome;
  const descricao = product.descricao ?? null;
  const preco = product.preco ?? 0;
  const estoque = product.estoque ?? 0;
  const categoria_id = product.categoria_id ?? null;

  const { rows } = await db.query(
    `INSERT INTO produtos (id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em`,
    [id, nome, descricao, preco, estoque, categoria_id]
  );

  return mapRowToProduct(rows[0]);
};

const update = async (id, data) => {
  const { rows: existingRows } = await db.query(`SELECT * FROM produtos WHERE id = $1`, [id]);
  if (!existingRows[0]) return null;
  const existing = existingRows[0];

  const nome = data.nome ?? existing.nome;
  const descricao = data.descricao ?? existing.descricao;
  const preco = data.preco ?? existing.preco;
  const estoque = data.estoque ?? existing.estoque;
  const categoria_id = data.categoria_id ?? existing.categoria_id;

  const { rows } = await db.query(
    `UPDATE produtos
     SET nome = $1, descricao = $2, preco = $3, estoque = $4, categoria_id = $5, atualizado_em = NOW()
     WHERE id = $6
     RETURNING id, nome, descricao, preco, estoque, categoria_id, criado_em, atualizado_em`,
    [nome, descricao, preco, estoque, categoria_id, id]
  );

  return mapRowToProduct(rows[0]);
};

const remove = async (id) => {
  const { rowCount } = await db.query(`DELETE FROM produtos WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = {
  findAll,
  findByCategory,
  findById,
  create,
  update,
  delete: remove,
};
