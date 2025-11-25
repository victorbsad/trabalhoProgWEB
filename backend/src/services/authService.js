const authRepository = require('../repositories/authRepository');

class AuthService {
  async login(email) {
    // Validar email
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    
    // Criar ou buscar usuário
    const user = await authRepository.findOrCreateUser(email);
    
    // Criar token
    const tokenData = await authRepository.createToken(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      },
      token: tokenData.token,
      expiresAt: tokenData.expires_at
    };
  }
  
  async validateToken(token) {
    if (!token) {
      throw new Error('Token não fornecido');
    }
    
    const tokenData = await authRepository.validateToken(token);
    
    if (!tokenData) {
      throw new Error('Token inválido ou expirado');
    }
    
    return {
      usuarioId: tokenData.usuario_id,
      email: tokenData.email,
      nome: tokenData.nome
    };
  }
  
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

module.exports = new AuthService();
