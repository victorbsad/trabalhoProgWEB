const authService = require('../services/authService');

// Middleware para validar token
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const user = await authService.validateToken(token);
    
    // Adiciona dados do usuário na requisição
    req.user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido ou expirado' 
    });
  }
}

module.exports = authMiddleware;
