const sacolaService = require('../services/sacolaService');

class SacolaController {
  async getSacola(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      
      const sacola = await sacolaService.getSacola(usuarioId);
      
      res.status(200).json(sacola);
    } catch (error) {
      console.error('Erro ao buscar sacola:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar sacola' 
      });
    }
  }
  
  async addItem(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      const { produtoId, quantidade, precoUnitario } = req.body;
      
      const item = await sacolaService.addItem(usuarioId, produtoId, quantidade, precoUnitario);
      
      res.status(201).json(item);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao adicionar item' 
      });
    }
  }
  
  async updateItem(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      const { produtoId } = req.params;
      const { quantidade } = req.body;
      
      const item = await sacolaService.updateItemQuantity(usuarioId, produtoId, quantidade);
      
      res.status(200).json(item);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      res.status(400).json({ 
        error: 'Erro ao atualizar item' 
      });
    }
  }
  
  async removeItem(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      const { produtoId } = req.params;
      
      await sacolaService.removeItem(usuarioId, produtoId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      res.status(400).json({ 
        error: 'Erro ao remover item' 
      });
    }
  }
  
  async clearSacola(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      
      await sacolaService.clearSacola(usuarioId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao limpar sacola:', error);
      res.status(500).json({ 
        error: 'Erro ao limpar sacola' 
      });
    }
  }
  
  async saveInfo(req, res) {
    try {
      const usuarioId = req.user.usuarioId;
      const info = req.body;
      
      const result = await sacolaService.saveInfo(usuarioId, info);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
      res.status(400).json({ 
        error: 'Erro ao salvar informações' 
      });
    }
  }
}

module.exports = new SacolaController();
