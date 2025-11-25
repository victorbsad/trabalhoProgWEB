// ========== AUTENTICAÇÃO E SACOLA ==========

// Storage para token
function salvarToken(token) {
  localStorage.setItem('authToken', token);
}

function carregarToken() {
  return localStorage.getItem('authToken');
}

function removerToken() {
  localStorage.removeItem('authToken');
}

// Login
async function fazerLogin(email) {
  try {
    loginStatus.textContent = 'Entrando...';
    loginStatus.style.color = '#666';
    
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    
    // Salvar token e dados do usuário
    authToken = data.token;
    currentUser = data.user;
    salvarToken(authToken);
    
    console.log('🔐 Login realizado:', currentUser.email);
    console.log('🎫 Token:', authToken.substring(0, 20) + '...');
    
    loginStatus.textContent = '✅ Login realizado! Sincronizando carrinho...';
    loginStatus.style.color = 'green';
    
    // Atualizar UI
    atualizarUIAutenticado();
    
    // Sincronizar carrinho automaticamente
    await sincronizarCarrinhoComBackend();
    
    // Navegar para carrinho após 1 segundo
    setTimeout(() => {
      navegarPara('carrinho');
      loginStatus.textContent = '✅ Carrinho sincronizado com sucesso!';
    }, 1000);
    
  } catch (error) {
    console.error('Erro no login:', error);
    loginStatus.textContent = `❌ ${error.message}`;
    loginStatus.style.color = 'red';
  }
}

// Logout
function fazerLogout() {
  authToken = null;
  currentUser = null;
  removerToken();
  
  // Limpar carrinho local para não misturar com próximo login
  salvarItensStorage([]);
  atualizarContadorCarrinho();
  renderizarItens();
  
  atualizarUIDesautenticado();
  navegarPara('home');
}

// Atualizar UI quando autenticado
function atualizarUIAutenticado() {
  if (navLogin) navLogin.style.display = 'none';
  if (btnLogout) btnLogout.style.display = 'inline-block';
  const userLogged = document.getElementById('user-logged');
  const userEmailDisplay = document.getElementById('user-email-display');
  if (userLogged) userLogged.style.display = 'inline-block';
  if (userEmailDisplay) userEmailDisplay.textContent = currentUser.email;
}

// Atualizar UI quando desautenticado
function atualizarUIDesautenticado() {
  if (navLogin) navLogin.style.display = 'inline-block';
  if (btnLogout) btnLogout.style.display = 'none';
  const userLogged = document.getElementById('user-logged');
  if (userLogged) userLogged.style.display = 'none';
}

// Sincronizar carrinho: SEMPRE prioriza backend se usuário já existe
async function sincronizarCarrinhoComBackend() {
  if (!authToken) return;
  
  try {
    console.log('🔄 Sincronizando carrinho para usuário:', currentUser.email);
    
    // 1. Buscar carrinho do backend para este usuário
    const response = await fetch(`${API_BASE}/api/v1/sacola`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar carrinho:', response.status);
      throw new Error('Erro ao carregar carrinho');
    }
    
    const data = await response.json();
    console.log('📦 Dados do backend:', data);
    
    // 2. Verificar se usuário JÁ TINHA carrinho salvo no backend
    const usuarioJaExistia = data.items && data.items.length > 0;
    
    if (usuarioJaExistia) {
      // Usuário antigo: SEMPRE usa carrinho do backend (ignora e limpa local)
      const itensBackend = data.items.map(item => ({
        nome: item.nome,
        preco: parseFloat(item.preco_unitario),
        qtd: item.quantidade
      }));
      
      // Limpar local primeiro, depois salvar backend
      salvarItensStorage([]);
      salvarItensStorage(itensBackend);
      console.log('✅ Usuário existente - Carrinho carregado do backend:', itensBackend.length, 'itens');
    } else {
      // Usuário novo (backend vazio): Transfere carrinho local para backend
      const itensLocal = carregarItensStorage();
      
      if (itensLocal.length > 0) {
        // Tem carrinho local: enviar para backend
        await enviarCarrinhoParaBackend(itensLocal);
        console.log('✅ Usuário novo - Carrinho local transferido para backend:', itensLocal.length, 'itens');
      } else {
        // Não tem nada: limpar localStorage
        salvarItensStorage([]);
        console.log('✅ Ambos vazios - carrinho limpo');
      }
    }
    
    // 3. Atualizar UI
    atualizarContadorCarrinho();
    renderizarItens();
    
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Enviar carrinho local para backend
async function enviarCarrinhoParaBackend(itensLocal) {
  if (!authToken) return;
  
  try {
    // Buscar produtos da API para pegar IDs
    const response = await fetch(`${API_PRODUTOS}`);
    const produtos = await response.json();
    
    for (const item of itensLocal) {
      // Encontrar produto por nome
      const produto = produtos.find(p => 
        (p.nome === item.nome || p.name === item.nome)
      );
      
      if (produto) {
        await fetch(`${API_BASE}/api/v1/sacola/items`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            produtoId: produto.id,
            quantidade: item.qtd,
            precoUnitario: item.preco
          })
        });
      }
    }
  } catch (error) {
    console.error('Erro ao enviar carrinho:', error);
  }
}

// Sincronizar item específico com backend quando quantidade muda
async function sincronizarItemComBackend(nomeItem, novaQuantidade, preco) {
  if (!authToken) return;
  
  try {
    // Buscar produtos da API para pegar ID
    const response = await fetch(`${API_PRODUTOS}`);
    const produtos = await response.json();
    const produto = produtos.find(p => p.nome === nomeItem || p.name === nomeItem);
    
    if (!produto) return;
    
    if (novaQuantidade > 0) {
      // Adicionar/Atualizar (POST sempre - o backend faz UPSERT)
      await fetch(`${API_BASE}/api/v1/sacola/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          produtoId: produto.id,
          quantidade: novaQuantidade,
          precoUnitario: preco
        })
      });
    } else {
      // Remover se quantidade for 0
      await fetch(`${API_BASE}/api/v1/sacola/items/${produto.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar item:', error);
  }
}

// Remover item do backend
async function removerItemDoBackend(nomeItem) {
  if (!authToken) return;
  
  try {
    const response = await fetch(`${API_PRODUTOS}`);
    const produtos = await response.json();
    const produto = produtos.find(p => p.nome === nomeItem || p.name === nomeItem);
    
    if (produto) {
      await fetch(`${API_BASE}/api/v1/sacola/items/${produto.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  } catch (error) {
    console.error('Erro ao remover item do backend:', error);
  }
}


