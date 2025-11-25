const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'Email é obrigatório' 
        });
      }
      
      const result = await authService.login(email);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao fazer login' 
      });
    }
  }
  
  async validateToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      const user = await authService.validateToken(token);
      
      res.status(200).json({ valid: true, user });
    } catch (error) {
      res.status(401).json({ 
        valid: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();
