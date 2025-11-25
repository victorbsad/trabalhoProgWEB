const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.get('/', controller.listProducts); // GET /api/v1/produtos
router.get('/:produtoId', controller.getProduct);
router.post('/', controller.createProduct);
router.put('/:produtoId', controller.updateProduct);
router.delete('/:produtoId', controller.deleteProduct);

module.exports = router;
