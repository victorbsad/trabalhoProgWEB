const sacolaRepository = require('../repositories/sacolaRepository');

class SacolaService {
  async addItem(usuarioId, produtoId, quantidade, precoUnitario) {
    if (!produtoId || quantidade <= 0 || precoUnitario < 0) {
      throw new Error('Dados inválidos');
    }
    
    return await sacolaRepository.addItem(usuarioId, produtoId, quantidade, precoUnitario);
  }
  
  async updateItemQuantity(usuarioId, produtoId, quantidade) {
    return await sacolaRepository.updateItemQuantity(usuarioId, produtoId, quantidade);
  }
  
  async removeItem(usuarioId, produtoId) {
    return await sacolaRepository.removeItem(usuarioId, produtoId);
  }
  
  async getSacola(usuarioId) {
    try {
      const items = await sacolaRepository.getItems(usuarioId);
      const info = await sacolaRepository.getInfo(usuarioId);
      
      // Calcular totais (proteção contra null/undefined)
      const subtotal = items.reduce((acc, item) => {
        const sub = parseFloat(item.subtotal) || 0;
        return acc + sub;
      }, 0);
      
      const frete = info && info.frete ? parseFloat(info.frete) : 0;
      const desconto = info && info.desconto ? parseFloat(info.desconto) : 0;
      const total = Math.max(subtotal + frete - desconto, 0);
      
      return {
        items: items || [],
        info: info || {},
        totais: {
          subtotal: subtotal.toFixed(2),
          frete: frete.toFixed(2),
          desconto: desconto.toFixed(2),
          total: total.toFixed(2)
        }
      };
    } catch (error) {
      console.error('Erro no getSacola:', error);
      throw error;
    }
  }
  
  async clearSacola(usuarioId) {
    return await sacolaRepository.clearSacola(usuarioId);
  }
  
  async saveInfo(usuarioId, info) {
    return await sacolaRepository.saveInfo(usuarioId, info);
  }
}

module.exports = new SacolaService();
