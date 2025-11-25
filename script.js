// Catalog + Cart integrated script
// Detecta automaticamente se está rodando localmente ou em produção
const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const API_BASE = window.API_BASE || (isLocal ? 'http://localhost:3001' : 'https://backend-api-5i28.onrender.com');
const API_PRODUTOS = `${API_BASE}/api/v1/produtos`;

console.log('🌐 API Base:', API_BASE);

// Elements - serão inicializados no DOMContentLoaded
// Elements - serão inicializados no DOMContentLoaded
let statusEl, productsEl, searchInput, categoryFilter, reloadBtn;
let navHome, navProdutos, navCarrinho, navLogin, btnLogout, bannerCta;
let homeSection, catalogSection, cartSection, loginSection;
let cartCountEl;
let productModal, closeModal, modalOverlay;
let modalNome, modalCategoria, modalPreco, modalDescricao, modalEstoque, modalImage, modalAddCart;
let itemContainer, buscaCEPBtn, cepInput, valorFreteEl, btnCupom, btnUsarLocalizacao;

// Login elements
let loginForm, loginEmail, loginStatus;

let produtoAtual = null;
let currentUser = null;
let authToken = null;

// storage utilities (reaproveitadas do script.js)
function salvarItensStorage(itens){ localStorage.setItem('carrinho', JSON.stringify(itens)); }
function carregarItensStorage(){ const dados = localStorage.getItem('carrinho'); return dados ? JSON.parse(dados) : []; }
function salvarFreteStorage(valor){ localStorage.setItem('frete', valor); }
function carregarFreteStorage(){ return parseFloat(localStorage.getItem('frete')) || 0; }
function salvarEnderecoStorage(endereco){ try{ localStorage.setItem('endereco', JSON.stringify(endereco)); }catch(e){console.warn(e);} }
function carregarEnderecoStorage(){ try{ const raw = localStorage.getItem('endereco'); return raw?JSON.parse(raw):null;}catch(e){return null;} }
function salvarCupomStorage(cupom){ localStorage.setItem('cupom', cupom); }
function carregarCupomStorage(){ return localStorage.getItem('cupom') || ''; }

// Dados iniciais / cupons (copiado)
const ITENS_PADRAO = [{ nome: 'Camisa Básica', preco: 59.90, qtd: 1 },{ nome: 'Calça Jeans', preco: 89.90, qtd: 1 }];
const cupons = { 'DESCONTO10': { tipo: 'percentual', valor: 0.10, status: 'ativo', validade: '2025-10-10' }, '50OFF': { tipo: 'fixo', valor: 50.00, status: 'ativo', validade: '2025-10-07'} };

// Produtos cache
let produtosCache = [];

function setStatus(msg, isError=false){ if(statusEl){ statusEl.textContent = msg; statusEl.style.color = isError ? 'crimson' : ''; } }

function renderLista(produtos){
  productsEl.innerHTML = '';
  if(!produtos || produtos.length===0){ productsEl.innerHTML = '<p>Nenhum produto encontrado.</p>'; return; }
  produtos.forEach(p => {
    const id = p.id || p.id_produto || '';
    const nome = p.nome || p.name || 'Produto sem nome';
    const precoNum = (p.preco != null) ? Number(p.preco) : (p.price != null ? Number(p.price) : 0);
    const preco = precoNum.toFixed(2).replace('.', ',');
    const categoria = p.categoria || p.categoria_id || p.category || '—';
    const imagem = p.imagem || p.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(nome)}`;

    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img src="${imagem}" alt="${nome}" onerror="this.src='https://via.placeholder.com/400x300?text=sem+imagem'">
      <div>
        <p class="title">${nome}</p>
        <p class="meta">Categoria: ${categoria}</p>
      </div>
      <div class="price">R$ ${preco}</div>
      <div class="actions">
        <button class="btn-add">Adicionar</button>
        <button class="btn-view">Ver</button>
      </div>
    `;
    
    // Evento: adicionar ao carrinho
    card.querySelector('.btn-add').addEventListener('click', ()=>{
      adicionarAoCarrinho({ nome, preco: precoNum, qtd: 1 });
      navegarPara('carrinho');
    });
    
    // Evento: ver detalhes (abrir modal)
    card.querySelector('.btn-view').addEventListener('click', ()=>{
      abrirModalProduto(p);
    });
    productsEl.appendChild(card);
  });
}

async function fetchProdutos(){
  setStatus('Carregando produtos...'); 
  productsEl.innerHTML = '';
  reloadBtn.disabled = true;
  
  try{
    // Construir URL com querystring de categoria se selecionada
    let url = API_PRODUTOS;
    const categoriaId = categoryFilter ? categoryFilter.value : '';
    if(categoriaId){
      url += `?categoria=${categoriaId}`;
    }
    
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000) // timeout de 15s
    });
    
    if(!res.ok){ 
      const text = await res.text().catch(()=>res.statusText); 
      throw new Error(`Erro ao conectar com a API (${res.status}): ${text}`); 
    }
    
    const data = await res.json();
    const lista = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (data.produtos || []));
    
    if(lista.length === 0){
      setStatus('Nenhum produto encontrado para esta categoria.');
      productsEl.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">Nenhum produto encontrado.</p>';
      return;
    }
    
    produtosCache = lista;
    renderLista(lista);
    setStatus(`✓ ${lista.length} produtos carregados com sucesso.`);
    
  }catch(err){
    console.error('Erro fetchProdutos ->', err);
    
    let errorMsg = 'Erro desconhecido ao carregar produtos.';
    
    if(err.name === 'AbortError' || err.name === 'TimeoutError'){
      errorMsg = 'Tempo esgotado ao conectar com o servidor. Verifique sua conexão e tente novamente.';
    }else if(err.message){
      errorMsg = err.message;
    }
    
    setStatus(`✗ ${errorMsg}`, true);
    productsEl.innerHTML = `
      <div class="error-container">
        <p class="error">❌ ${errorMsg}</p>
        <p style="margin-top:12px;color:#666;">Dica: Verifique se a API está ativa em <a href="${API_BASE}/health" target="_blank" style="color:#2b6cb0;">${API_BASE}/health</a></p>
      </div>
    `;
    
  }finally{
    reloadBtn.disabled = false;
  }
}


function filtrarPorNome(term){ const t = term.trim().toLowerCase(); if(!t){ renderLista(produtosCache); return; } const filtrados = produtosCache.filter(p => (p.nome||p.name||'').toString().toLowerCase().includes(t)); renderLista(filtrados); }

// ================= Cart functions (adapted from original script.js)
function renderizarItens(){
  itemContainer.innerHTML = `
    <div class="item-row header">
      <p>Produto</p><p>Preço</p><p>Qtd</p><p>Subtotal</p><p></p>
    </div>`;
  const itens = carregarItensStorage();
  itens.forEach((item, idx)=>{
    const linha = document.createElement('div'); linha.className='item-row';
    linha.innerHTML = `
      <p class="produto">${item.nome}</p>
      <p class="preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
      <input type="number" value="${item.qtd}" min="1" data-idx="${idx}">
      <p class="subtotal"></p>
      <button data-idx="${idx}">Remover</button>
    `;
    itemContainer.appendChild(linha);
  });
  atualizarTodosSubtotais();
}

function atualizarTodosSubtotais(){
  const itens = carregarItensStorage();
  document.querySelectorAll('.item-row:not(.header)').forEach((row, idx)=>{
    const precoEl = row.querySelector('.preco'); const qtdInput = row.querySelector('input[type="number"]'); const subtotalEl = row.querySelector('.subtotal'); const removerBtn = row.querySelector('button');
    function atualizarSubtotal(){ 
      const preco = parseFloat(precoEl.textContent.replace('R$','').replace(',','.')); 
      const qtd = parseInt(qtdInput.value,10); 
      const subtotal = preco * qtd; 
      subtotalEl.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ','); 
      itens[idx].qtd = qtd; 
      salvarItensStorage(itens); 
      atualizarContadorCarrinho(); 
      atualizarSubtotalProdutos();
      // Sincronizar com backend se autenticado
      if(authToken && typeof sincronizarItemComBackend === 'function'){
        sincronizarItemComBackend(itens[idx].nome, qtd, preco);
      }
    }
    qtdInput.addEventListener('input', atualizarSubtotal);
    removerBtn.onclick = function(){ 
      const nomeItem = itens[idx].nome;
      itens.splice(idx,1); 
      salvarItensStorage(itens); 
      atualizarContadorCarrinho(); 
      renderizarItens(); 
      atualizarSubtotalProdutos();
      // Remover do backend se autenticado
      if(authToken && typeof removerItemDoBackend === 'function'){
        removerItemDoBackend(nomeItem);
      }
    };
    atualizarSubtotal();
  });
  atualizarSubtotalProdutos();
}

function atualizarSubtotalProdutos(){
  let total = 0;
  document.querySelectorAll('.item-row .subtotal').forEach(subEl=>{ const valor = parseFloat(subEl.textContent.replace('R$','').replace(',','.')); if(!isNaN(valor)) total += valor; });
  if(valorFreteEl && valorFreteEl.textContent){ const freteMatch = valorFreteEl.textContent.match(/R\$ ([\d,]+)/); if(freteMatch){ const frete = parseFloat(freteMatch[1].replace(',','.')); if(!isNaN(frete)) total += frete; } }
  const subtotalProdutosEl = document.querySelector('.subtotal-itens'); if(subtotalProdutosEl) subtotalProdutosEl.textContent = 'Subtotal produtos: R$ ' + total.toFixed(2).replace('.', ','); atualizarTotalGeral();
}

function atualizarTotalGeral(){
  let subtotalComFrete = 0; const subtotalText = document.querySelector('.subtotal-itens').textContent; const subtotalMatch = subtotalText.match(/R\$ ([\d,]+(?:,\d{2})?)/); if(subtotalMatch) subtotalComFrete = parseFloat(subtotalMatch[1].replace(',','.'));
  let desconto = 0; const descontoText = document.querySelector('.desconto-itens').textContent; const descontoMatch = descontoText.match(/R\$ ([\d,]+(?:,\d{2})?)/); if(descontoMatch) desconto = parseFloat(descontoMatch[1].replace(',','.'));
  const totalFinal = Math.max(subtotalComFrete - desconto, 0); document.querySelector('.total-itens').textContent = 'Total: R$ ' + totalFinal.toFixed(2).replace('.', ',');
}

function aplicarDescontoCupom(cupom){ const statusMsg = document.querySelector('.c-status'); let subtotalComFrete = 0; const subtotalText = document.querySelector('.subtotal-itens').textContent; const subtotalMatch = subtotalText.match(/R\$ ([\d,]+(?:,\d{2})?)/); if(subtotalMatch) subtotalComFrete = parseFloat(subtotalMatch[1].replace(',','.'));
  const dadosCupom = cupons[cupom]; if(!dadosCupom){ if(statusMsg) statusMsg.textContent='Cupom inválido!'; document.querySelector('.desconto-itens').textContent='Desconto: R$ 0,00'; atualizarTotalGeral(); return; }
  const hoje = new Date(); const validade = new Date(dadosCupom.validade); hoje.setHours(0,0,0,0); validade.setHours(0,0,0,0); if(hoje > validade || dadosCupom.status==='expirado'){ if(statusMsg) statusMsg.textContent='Cupom expirado!'; document.querySelector('.desconto-itens').textContent='Desconto: R$ 0,00'; atualizarTotalGeral(); return; }
  let desconto = 0; if(dadosCupom.tipo==='percentual'){ desconto = subtotalComFrete * dadosCupom.valor; if(statusMsg) statusMsg.textContent = `Cupom aplicado: ${dadosCupom.valor*100}% de desconto!`; } else if(dadosCupom.tipo==='fixo'){ desconto = dadosCupom.valor; if(statusMsg) statusMsg.textContent = `Cupom aplicado: R$ ${dadosCupom.valor.toFixed(2).replace('.',',')} de desconto!`; }
  document.querySelector('.desconto-itens').textContent = 'Desconto: R$ ' + desconto.toFixed(2).replace('.', ','); salvarCupomStorage(cupom); atualizarTotalGeral(); }

// Frete / CEP helpers (copied)
const REGIAO_POR_ESTADO = { 'RS':'Sul','SC':'Sul','PR':'Sul','SP':'Sudeste','RJ':'Sudeste','ES':'Sudeste','MG':'Sudeste','DF':'Centro-Oeste','GO':'Centro-Oeste','MT':'Centro-Oeste','MS':'Centro-Oeste','BA':'Nordeste','SE':'Nordeste','AL':'Nordeste','PE':'Nordeste','PB':'Nordeste','RN':'Nordeste','CE':'Nordeste','PI':'Nordeste','MA':'Norte','AP':'Norte','PA':'Norte','AM':'Norte','RO':'Norte','RR':'Norte','AC':'Norte' };
const FRETE_POR_REGIAO = { 'Sul':15.00,'Sudeste':12.00,'Centro-Oeste':18.00,'Nordeste':25.00,'Norte':35.00,'Desconhecida':80.00 };
function getRegiaoPorEstado(uf){ if(!uf) return 'Desconhecida'; const key = uf.trim().toUpperCase(); return REGIAO_POR_ESTADO[key] || 'Desconhecida'; }
function calculaFretePorEstado(uf){ const regiao = getRegiaoPorEstado(uf); return FRETE_POR_REGIAO[regiao] !== undefined ? FRETE_POR_REGIAO[regiao] : FRETE_POR_REGIAO['Desconhecida']; }

function formatCEP(cepStr){ const s = (cepStr||'').toString().replace(/\D/g,''); return s.length===8? s.replace(/(\d{5})(\d{3})/,'$1-$2') : s; }

// Função de Geolocalização com try-catch-finally
async function usarMinhaLocalizacao(){
  const cepMsgEl = document.getElementById('cep-msg');
  if(!navigator.geolocation){
    if(cepMsgEl){ cepMsgEl.textContent='Geolocalização não suportada pelo navegador.'; cepMsgEl.classList.remove('success','loading'); }
    return;
  }
  
  if(cepMsgEl){ cepMsgEl.textContent='Obtendo sua localização...'; cepMsgEl.classList.add('loading'); cepMsgEl.classList.remove('success'); }
  btnUsarLocalizacao.disabled = true;
  
  try{
    const position = await new Promise((resolve, reject)=>{
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
    });
    
    const {latitude, longitude} = position.coords;
    if(cepMsgEl){ cepMsgEl.textContent=`Localização obtida: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Buscando endereço...`; cepMsgEl.classList.add('loading'); }
    
    // Buscar CEP usando coordenadas (API BrasilAPI não suporta reverse geocoding, usando Nominatim OpenStreetMap)
    try{
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
        headers: {'Accept': 'application/json', 'User-Agent': 'Sacola-Compras-App'}
      });
      
      if(!response.ok) throw new Error('Não foi possível obter o endereço.');
      
      const data = await response.json();
      const address = data.address || {};
      
      // Extrair informações do endereço
      const state = address.state || address['ISO3166-2-lvl4']?.split('-')[1] || '';
      const city = address.city || address.town || address.village || address.municipality || '';
      const neighborhood = address.suburb || address.neighbourhood || '';
      const street = address.road || '';
      const postcode = address.postcode || '';
      
      // Atualizar campos de endereço
      document.getElementById('city').textContent = `Cidade: ${city}`;
      document.getElementById('state').textContent = `UF: ${state}`;
      document.getElementById('neighborhood').textContent = `Bairro: ${neighborhood}`;
      document.getElementById('street').textContent = `Logradouro: ${street}`;
      document.getElementById('service').textContent = 'Serviço: Geolocalização (OpenStreetMap)';
      
      if(postcode && postcode.replace(/\D/g,'').length === 8){
        document.getElementById('cep-display').textContent = `CEP: ${formatCEP(postcode)}`;
        cepInput.value = postcode.replace(/\D/g,'');
        if(cepMsgEl){ cepMsgEl.textContent='Endereço encontrado via geolocalização.'; cepMsgEl.classList.remove('loading'); cepMsgEl.classList.add('success'); }
      } else {
        document.getElementById('cep-display').textContent = 'CEP: Não identificado';
        if(cepMsgEl){ cepMsgEl.textContent='Localização obtida, mas CEP não identificado. Use o campo de busca.'; cepMsgEl.classList.remove('loading'); }
      }
      
      // Calcular frete baseado no estado
      if(state){
        const freteEstimado = calculaFretePorEstado(state);
        if(valorFreteEl){ valorFreteEl.textContent = `Frete estimado: R$ ${freteEstimado.toFixed(2).replace('.',',')}`; salvarFreteStorage(freteEstimado); atualizarSubtotalProdutos(); }
        salvarEnderecoStorage({ cep: formatCEP(postcode), street, neighborhood, city, state, service: 'Geolocalização' });
      }
      
    }catch(geoErr){
      console.error('Erro ao buscar endereço por coordenadas:', geoErr);
      if(cepMsgEl){ cepMsgEl.textContent='Localização obtida, mas não foi possível determinar o endereço. Use o campo CEP.'; cepMsgEl.classList.remove('loading','success'); }
    }
    
  }catch(error){
    console.error('Erro de geolocalização:', error);
    let errorMsg = 'Erro ao obter localização.';
    
    if(error.code === 1){ // PERMISSION_DENIED
      errorMsg = 'Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.';
    }else if(error.code === 2){ // POSITION_UNAVAILABLE
      errorMsg = 'Localização indisponível. Verifique se o GPS está ativado.';
    }else if(error.code === 3){ // TIMEOUT
      errorMsg = 'Tempo esgotado ao obter localização. Tente novamente.';
    }else if(error.message){
      errorMsg = `Erro: ${error.message}`;
    }
    
    if(cepMsgEl){ cepMsgEl.textContent = errorMsg; cepMsgEl.classList.remove('loading','success'); }
    
  }finally{
    btnUsarLocalizacao.disabled = false;
  }
}

async function consultaCEP(){ 
  const raw = cepInput.value||''; 
  const cep = raw.replace(/\D/g,''); 
  const cepMsgEl = document.getElementById('cep-msg'); 
  
  if(cepMsgEl) cepMsgEl.textContent=''; 
  
  if(cep.length!==8){ 
    if(cepMsgEl){ 
      cepMsgEl.textContent='CEP inválido. Informe 8 dígitos.'; 
      cepMsgEl.classList.remove('success','loading'); 
    } 
    return; 
  }
  
  const url = 'https://brasilapi.com.br/api/cep/v2/' + cep; 
  const controller = new AbortController(); 
  const signal = controller.signal; 
  const timeout = setTimeout(()=>controller.abort(), 8000);
  
  if(cepMsgEl){ 
    cepMsgEl.textContent='Buscando endereço...'; 
    cepMsgEl.classList.add('loading'); 
    cepMsgEl.classList.remove('success'); 
  }
  
  buscaCEPBtn.disabled = true;
  
  try{
    const response = await fetch(url, {signal});
    
    if(!response.ok){
      const errorText = await response.text().catch(()=>'CEP não encontrado');
      throw new Error(errorText || 'CEP não encontrado');
    }
    
    const data = await response.json();
    
    // Atualizar informações de endereço
    document.getElementById('city').textContent = `Cidade: ${data.city||''}`;
    document.getElementById('state').textContent = `UF: ${data.state||''}`;
    document.getElementById('neighborhood').textContent = `Bairro: ${data.neighborhood||''}`;
    document.getElementById('street').textContent = `Logradouro: ${data.street||''}`;
    document.getElementById('cep-display').textContent = `CEP: ${formatCEP(cep)}`;
    
    const serv = data.service || 'open-cep'; 
    document.getElementById('service').textContent = `Serviço: ${serv}`;
    
    if(cepMsgEl){ 
      cepMsgEl.textContent='Endereço encontrado.'; 
      cepMsgEl.classList.remove('loading'); 
      cepMsgEl.classList.add('success'); 
    }
    
    // Calcular frete
    const uf = data.state; 
    const freteEstimado = calculaFretePorEstado(uf); 
    
    if(valorFreteEl){ 
      valorFreteEl.textContent = `Frete estimado: R$ ${freteEstimado.toFixed(2).replace('.',',')}`; 
      salvarFreteStorage(freteEstimado); 
      atualizarSubtotalProdutos(); 
    }
    
    // Salvar no localStorage
    salvarEnderecoStorage({ 
      cep: formatCEP(cep), 
      street: data.street||'', 
      neighborhood: data.neighborhood||'', 
      city: data.city||'', 
      state: data.state||'', 
      service: serv 
    });
    
  }catch(err){
    console.error('CEP error', err);
    
    let errorMsg = 'Erro ao buscar CEP.';
    const isAbort = err && (err.name==='AbortError');
    
    if(isAbort){
      errorMsg = 'Tempo esgotado. Tente novamente.';
    }else if(err && err.message){
      errorMsg = err.message;
    }
    
    if(cepMsgEl){ 
      cepMsgEl.textContent = errorMsg; 
      cepMsgEl.classList.remove('loading','success'); 
    }
    
    // Limpar campos em caso de erro
    ['cep-display','city','state','neighborhood','street','service'].forEach(id=>{ 
      const el = document.getElementById(id); 
      if(el) el.textContent=''; 
    });
    
  }finally{
    clearTimeout(timeout); 
    buscaCEPBtn.disabled = false;
  }
}

// adicionar ao carrinho
async function adicionarAoCarrinho(item){ 
  // Se estiver autenticado, adiciona na sacola do backend
  if(authToken && produtoAtual){
    try {
      // Buscar quantidade atual no carrinho
      const itensAtuais = carregarItensStorage();
      const itemExistente = itensAtuais.find(i => i.nome === item.nome);
      const quantidadeTotal = itemExistente ? itemExistente.qtd + item.qtd : item.qtd;
      
      await fetch(`${API_BASE}/api/v1/sacola/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          produtoId: produtoAtual.id,
          quantidade: quantidadeTotal,
          precoUnitario: item.preco
        })
      });
      
      // Sincronizar backend → localStorage após adicionar
      await sincronizarCarrinhoComBackend();
      
      alert('✅ Produto adicionado à sacola!');
      return;
    } catch (error) {
      console.error('Erro ao adicionar na sacola:', error);
      alert('Erro ao adicionar na sacola. Adicionando ao carrinho local.');
    }
  }
  
  // Adiciona no carrinho local (localStorage)
  const itens = carregarItensStorage(); 
  const idx = itens.findIndex(i=> i.nome === item.nome);
  if(idx >= 0){ itens[idx].qtd += item.qtd; } else { itens.push(item); }
  salvarItensStorage(itens); 
  atualizarContadorCarrinho();
  renderizarItens(); 
}

// atualizar contador do carrinho no menu
function atualizarContadorCarrinho(){
  const itens = carregarItensStorage();
  const totalItens = itens.reduce((sum, item) => sum + item.qtd, 0);
  if(cartCountEl) cartCountEl.textContent = totalItens;
}

// Modal de detalhes do produto
function abrirModalProduto(produto){
  if(!productModal) return;
  
  produtoAtual = produto;
  
  const nome = produto.nome || produto.name || 'Produto';
  const preco = (produto.preco != null) ? Number(produto.preco) : 0;
  const categoria = produto.categoria || produto.categoria_id || '—';
  const categorias = ['', 'Eletrônicos', 'Informática', 'Smartphones', 'Acessórios'];
  const categoriaNome = categorias[categoria] || `Categoria ${categoria}`;
  const descricao = produto.descricao || produto.description || 'Produto de alta qualidade.';
  const estoque = produto.estoque != null ? Number(produto.estoque) : 0;
  const imagem = produto.imagem || produto.image || `https://via.placeholder.com/800x600?text=${encodeURIComponent(nome)}`;
  
  if(modalNome) modalNome.textContent = nome;
  if(modalCategoria) modalCategoria.textContent = categoriaNome;
  if(modalPreco) modalPreco.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
  if(modalDescricao) modalDescricao.textContent = descricao;
  if(modalImage) modalImage.src = imagem;
  
  if(modalEstoque){
    if(estoque > 0){
      modalEstoque.textContent = `${estoque} unidades em estoque`;
      modalEstoque.classList.remove('out-of-stock');
    }else{
      modalEstoque.textContent = 'Fora de estoque';
      modalEstoque.classList.add('out-of-stock');
    }
  }
  
  productModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function fecharModalProduto(){
  if(!productModal) return;
  productModal.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
  produtoAtual = null;
}

// Sistema de navegação entre páginas
function navegarPara(pagina){
  console.log('🔄 Navegando para:', pagina);
  console.log('📍 Seções:', { homeSection, catalogSection, cartSection });
  
  // Remove active de todas as páginas e links
  document.querySelectorAll('.page-section').forEach(s => {
    console.log('Removendo active de:', s.id);
    s.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  // Ativa a página e link corretos
  if(pagina === 'home'){
    console.log('✅ Ativando Home');
    if(homeSection) homeSection.classList.add('active');
    if(navHome) navHome.classList.add('active');
  }else if(pagina === 'produtos'){
    console.log('✅ Ativando Produtos');
    if(catalogSection) catalogSection.classList.add('active');
    if(navProdutos) navProdutos.classList.add('active');
    if(produtosCache.length === 0) fetchProdutos();
  }else if(pagina === 'carrinho'){
    console.log('✅ Ativando Carrinho');
    if(cartSection) cartSection.classList.add('active');
    if(navCarrinho) navCarrinho.classList.add('active');
    renderizarItens();
  }else if(pagina === 'login'){
    console.log('✅ Ativando Login');
    if(loginSection) loginSection.classList.add('active');
    if(navLogin) navLogin.classList.add('active');
  }
  
  // Scroll para o topo
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// inicializar carrinho e event listeners
document.addEventListener('DOMContentLoaded', ()=>{
  // Inicializar elementos do DOM
  statusEl = document.getElementById('status');
  productsEl = document.getElementById('products');
  searchInput = document.getElementById('search');
  categoryFilter = document.getElementById('category-filter');
  reloadBtn = document.getElementById('reload');
  
  navHome = document.getElementById('nav-home');
  navProdutos = document.getElementById('nav-produtos');
  navCarrinho = document.getElementById('nav-carrinho');
  navLogin = document.getElementById('nav-login');
  btnLogout = document.getElementById('btn-logout');
  bannerCta = document.getElementById('banner-cta');
  
  homeSection = document.getElementById('home-section');
  catalogSection = document.getElementById('catalog-section');
  cartSection = document.getElementById('cart-section');
  loginSection = document.getElementById('login-section');
  
  // Login elements
  loginForm = document.getElementById('login-form');
  loginEmail = document.getElementById('login-email');
  loginStatus = document.getElementById('login-status');
  
  cartCountEl = document.getElementById('cart-count');
  
  productModal = document.getElementById('product-modal');
  closeModal = document.getElementById('close-modal');
  modalOverlay = productModal ? productModal.querySelector('.modal-overlay') : null;
  modalNome = document.getElementById('modal-nome');
  modalCategoria = document.getElementById('modal-categoria');
  modalPreco = document.getElementById('modal-preco');
  modalDescricao = document.getElementById('modal-descricao');
  modalEstoque = document.getElementById('modal-estoque');
  modalImage = document.getElementById('modal-image');
  modalAddCart = document.getElementById('modal-add-cart');
  
  itemContainer = document.getElementById('item-container');
  buscaCEPBtn = document.getElementById('buscaCEP');
  cepInput = document.getElementById('CEP');
  valorFreteEl = document.getElementById('valor-frete');
  btnCupom = document.getElementById('btnAplicCupom');
  btnUsarLocalizacao = document.getElementById('usarLocalizacao');
  
  if(carregarItensStorage().length === 0) salvarItensStorage(ITENS_PADRAO);
  
  // Atualizar contador do carrinho
  atualizarContadorCarrinho();
  
  // restaurar cupom e frete
  const cupomSalvo = carregarCupomStorage(); 
  if(cupomSalvo && document.getElementById('inCupom')) document.getElementById('inCupom').value = cupomSalvo;
  
  const freteSalvo = carregarFreteStorage(); 
  if(freteSalvo && valorFreteEl){ 
    valorFreteEl.textContent = `Frete estimado: R$ ${freteSalvo.toFixed(2).replace('.',',')}`; 
  }
  
  const enderecoSalvo = carregarEnderecoStorage(); 
  if(enderecoSalvo){ 
    if(document.getElementById('cep-display')) document.getElementById('cep-display').textContent = `CEP: ${enderecoSalvo.cep||''}`; 
    if(document.getElementById('service')) document.getElementById('service').textContent = `Serviço: ${enderecoSalvo.service||''}`; 
    if(document.getElementById('city')) document.getElementById('city').textContent = `Cidade: ${enderecoSalvo.city||''}`; 
    if(document.getElementById('state')) document.getElementById('state').textContent = `UF: ${enderecoSalvo.state||''}`; 
    if(document.getElementById('neighborhood')) document.getElementById('neighborhood').textContent = `Bairro: ${enderecoSalvo.neighborhood||''}`; 
    if(document.getElementById('street')) document.getElementById('street').textContent = `Logradouro: ${enderecoSalvo.street||''}`; 
  }
  
  atualizarSubtotalProdutos();
  
  // Event listeners de navegação
  console.log('🎯 Registrando event listeners de navegação');
  console.log('Elementos:', { navHome, navProdutos, navCarrinho });
  
  if(navHome) {
    console.log('✅ Listener Home registrado');
    navHome.addEventListener('click', (e)=>{ 
      console.log('🖱️ Clique em Home');
      e.preventDefault(); 
      navegarPara('home'); 
    });
  }
  if(navProdutos) {
    console.log('✅ Listener Produtos registrado');
    navProdutos.addEventListener('click', (e)=>{ 
      console.log('🖱️ Clique em Produtos');
      e.preventDefault(); 
      navegarPara('produtos'); 
    });
  }
  if(navCarrinho) {
    console.log('✅ Listener Carrinho registrado');
    navCarrinho.addEventListener('click', (e)=>{ 
      console.log('🖱️ Clique em Carrinho');
      e.preventDefault(); 
      navegarPara('carrinho'); 
    });
  }
  if(navLogin) {
    navLogin.addEventListener('click', (e)=>{ 
      e.preventDefault(); 
      navegarPara('login'); 
    });
  }
  if(btnLogout) {
    btnLogout.addEventListener('click', fazerLogout);
  }
  if(bannerCta) bannerCta.addEventListener('click', (e)=>{ e.preventDefault(); navegarPara('produtos'); });
  if(searchInput) searchInput.addEventListener('input', e=> filtrarPorNome(e.target.value));
  if(categoryFilter) categoryFilter.addEventListener('change', fetchProdutos);
  if(reloadBtn) reloadBtn.addEventListener('click', fetchProdutos);
  if(buscaCEPBtn) buscaCEPBtn.addEventListener('click', consultaCEP);
  if(btnUsarLocalizacao) btnUsarLocalizacao.addEventListener('click', usarMinhaLocalizacao);
  if(btnCupom) btnCupom.addEventListener('click', ()=>{ const cupom = document.getElementById('inCupom').value.trim().toUpperCase(); aplicarDescontoCupom(cupom); });
  
  // Navegação inicial - mostrar Home
  navegarPara('home');
  
  // Event listeners do modal
  if(closeModal) closeModal.addEventListener('click', fecharModalProduto);
  if(modalOverlay) modalOverlay.addEventListener('click', fecharModalProduto);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && productModal && productModal.classList.contains('active')){
      fecharModalProduto();
    }
  });
  if(modalAddCart){
    modalAddCart.addEventListener('click', ()=>{
      if(produtoAtual){
        const nome = produtoAtual.nome || produtoAtual.name || 'Produto';
        const preco = (produtoAtual.preco != null) ? Number(produtoAtual.preco) : 0;
        adicionarAoCarrinho({ nome, preco, qtd: 1 });
        fecharModalProduto();
        navegarPara('carrinho');
      }
    });
  }
  
  // formata cep input para aceitar só dígitos
  if(cepInput) cepInput.addEventListener('input', (e)=>{ e.target.value = e.target.value.replace(/\D/g,''); });
  
  // Event listeners de Login
  if(loginForm) {
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = loginEmail.value.trim();
      if(email) {
        fazerLogin(email);
      }
    });
  }
  
  // Verificar se já está autenticado
  const tokenSalvo = carregarToken();
  if(tokenSalvo) {
    authToken = tokenSalvo;
    // Validar token e carregar dados do usuário
    fetch(`${API_BASE}/api/v1/auth/validate`, {
      headers: { 'Authorization': `Bearer ${tokenSalvo}` }
    })
    .then(r => r.json())
    .then(data => {
      if(data.valid) {
        currentUser = data.user;
        atualizarUIAutenticado();
      } else {
        removerToken();
      }
    })
    .catch(() => removerToken());
  }
});
