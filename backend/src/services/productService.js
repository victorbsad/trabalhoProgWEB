const productRepository = require('../repositories/productRepository');

const listProducts = async (categoria = null) => {
  if (categoria) {
    return await productRepository.findByCategory(categoria);
  }
  return await productRepository.findAll();
};

const getProduct = async (id) => {
  if (!id) {
    const e = new Error('ID inválido');
    e.status = 400;
    throw e;
  }
  return productRepository.findById(id);
};

const createProduct = async (productData) => {
  if (!productData || !productData.nome) {
    const err = new Error('Nome do produto é obrigatório');
    err.status = 400;
    throw err;
  }
  if (productData.preco != null && Number(productData.preco) < 0) {
    const err = new Error('Preço deve ser >= 0');
    err.status = 400;
    throw err;
  }
  if (productData.estoque != null && Number(productData.estoque) < 0) {
    const err = new Error('Estoque deve ser >= 0');
    err.status = 400;
    throw err;
  }
  return productRepository.create(productData);
};

const updateProduct = async (id, productData) => {
  if (!id) {
    const e = new Error('ID inválido');
    e.status = 400;
    throw e;
  }
  return productRepository.update(id, productData);
};

const deleteProduct = async (id) => {
  if (!id) {
    const e = new Error('ID inválido');
    e.status = 400;
    throw e;
  }
  return productRepository.delete(id);
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
