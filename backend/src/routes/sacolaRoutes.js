const express = require('express');
const router = express.Router();
const sacolaController = require('../controllers/sacolaController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/v1/sacola - Obter sacola do usuário
router.get('/', sacolaController.getSacola);

// POST /api/v1/sacola/items - Adicionar item
router.post('/items', sacolaController.addItem);

// PUT /api/v1/sacola/items/:produtoId - Atualizar quantidade
router.put('/items/:produtoId', sacolaController.updateItem);

// DELETE /api/v1/sacola/items/:produtoId - Remover item
router.delete('/items/:produtoId', sacolaController.removeItem);

// DELETE /api/v1/sacola - Limpar sacola
router.delete('/', sacolaController.clearSacola);

// POST /api/v1/sacola/info - Salvar informações (frete, cupom, endereço)
router.post('/info', sacolaController.saveInfo);

module.exports = router;
