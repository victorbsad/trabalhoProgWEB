const productService = require('../services/productService');

const listProducts = async (req, res) => {
  try {
    const { categoria } = req.query;
    const produtos = await productService.listProducts(categoria);
    return res.json(produtos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const produto = await productService.getProduct(produtoId);
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(produto);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Erro ao obter produto' });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const created = await productService.createProduct(productData);
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Erro ao criar produto' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const updated = await productService.updateProduct(produtoId, req.body);
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Erro ao atualizar produto' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const removed = await productService.deleteProduct(produtoId);
    if (removed === false) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Erro ao deletar produto' });
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
