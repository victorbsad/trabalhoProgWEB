#  Catálogo & Sacola de Compras - E-commerce Integrado

Sistema completo de e-commerce com catálogo de produtos, carrinho de compras, cálculo de frete, validação de cupons e integração com API backend.
---

##  Objetivo

Construir uma aplicação web full-stack de e-commerce com:
- **Frontend**: Página de catálogo e sacola de compras interativa 
- **Backend**: API RESTful para gerenciamento de produtos
- **Banco de Dados**: PostgreSQL para persistência de dados

---

##  Funcionalidades Implementadas

###  Catálogo de Produtos
- Listagem de produtos com imagem, nome, preço e categoria
- Busca de produtos por nome (filtro em tempo real)
- Botão "Adicionar ao carrinho" para cada produto
- Botão "Ver detalhes" para visualizar produto
- Recarregar catálogo da API
- Tratamento de erros com mensagens amigáveis

###  Carrinho de Compras (Sacola)
- Listagem de itens: nome, preço, quantidade, subtotal
- Alterar quantidade de produtos
- Remover itens do carrinho
- Cálculo automático de subtotais e total geral
- Persistência no `localStorage` (sem login)
- **Persistência por usuário no banco de dados** (com login)

###  Sistema de Autenticação
- Login simplificado (apenas email, sem senha)
- Token de autenticação com 24h de validade
- **Carrinho persistente por usuário**:
  - Primeiro login: transfere carrinho local para o backend
  - Logins seguintes: carrega carrinho salvo (ignora local)
  - Logout: limpa carrinho local para evitar mistura
- Sincronização automática backend ↔ localStorage
- Separação total entre usuários
- UI mostrando email logado e botão de logout

###  Cálculo de Frete
- Busca de endereço por CEP (BrasilAPI)
- **Botão "Usar minha localização"** com Geolocation API
  - Obtém coordenadas GPS do usuário
  - Busca endereço via OpenStreetMap Nominatim
  - Calcula frete automaticamente
- Cálculo de frete por região:
  - Sul: R$ 15,00
  - Sudeste: R$ 12,00
  - Centro-Oeste: R$ 18,00
  - Nordeste: R$ 25,00
  - Norte: R$ 35,00
- Exibição de endereço completo (rua, bairro, cidade, UF)

###  Sistema de Cupons
- Validação de cupons (ativo/expirado/inválido)
- Cupons percentuais (ex: 10% de desconto)
- Cupons de valor fixo (ex: R$ 50,00 OFF)
- Mensagens de status do cupom
- Persistência do cupom aplicado

**Cupons disponíveis para teste:**
- `DESCONTO10`: 10% de desconto (válido até 10/10/2025)
- `50OFF`: R$ 50,00 de desconto (válido até 07/10/2025)

###  Tratamento de Erros
- `try...catch...finally` em todas as operações assíncronas
- Mensagens específicas para cada tipo de erro:
  - Permissão de geolocalização negada
  - Timeout de conexão
  - CEP inválido ou não encontrado
  - Erro na API de produtos
- Desabilita botões durante carregamento
- Feedback visual (loading, success, error)

---

##  Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização responsiva com Grid e Flexbox
- **JavaScript ES6+**: Manipulação DOM, async/await, módulos
- **APIs**:
  - LocalStorage API (persistência)
  - Geolocation API (localização do usuário)
  - Fetch API (requisições HTTP)
  - BrasilAPI (consulta de CEP)
  - OpenStreetMap Nominatim (reverse geocoding)

### Backend
- **Node.js** (v18+)
- **Express 4.18.2**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **pg 8.16.3**: Cliente PostgreSQL para Node.js
- **CORS**: Suporte cross-origin
- **Swagger UI**: Documentação interativa da API
- **dotenv**: Gerenciamento de variáveis de ambiente

---

##  Estrutura do Projeto

```
trabalhoProgWEB/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Controladores (lógica de requisição)
│   │   │   ├── authController.js       # Login e validação de token
│   │   │   ├── sacolaController.js     # Gerenciamento de carrinho
│   │   │   └── productController.js
│   │   ├── services/           # Regras de negócio
│   │   │   ├── authService.js          # Lógica de autenticação
│   │   │   ├── sacolaService.js        # Cálculo de totais
│   │   │   └── productService.js
│   │   ├── repositories/       # Acesso ao banco de dados
│   │   │   ├── authRepository.js       # CRUD de usuários/tokens
│   │   │   ├── sacolaRepository.js     # CRUD de itens da sacola
│   │   │   └── productRepository.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # Validação de token JWT-like
│   │   ├── routes/             # Rotas da API
│   │   │   ├── authRoutes.js           # POST /login, GET /validate
│   │   │   ├── sacolaRoutes.js         # CRUD de sacola (protegido)
│   │   │   └── productRoutes.js
│   │   ├── db/                 # Configuração PostgreSQL
│   │   ├── app.js              # Configuração Express
│   │   └── server.js           # Inicialização do servidor
│   ├── sql/                    # Scripts SQL
│   │   ├── setup_database.sql          # Tabelas produtos/categorias
│   │   └── create-auth-tables.sql      # Tabelas usuarios/tokens/sacolas
│   ├── swagger.yaml            # Documentação OpenAPI
│   ├── setup-auth-tables.js    # Script para criar tabelas de auth
│   ├── .env                    # Variáveis de ambiente
│   └── package.json
├── index.html                  # Página principal (SPA)
├── script.js                   # Lógica principal (catálogo, carrinho, UI)
├── auth-sacola.js              # Lógica de autenticação e sincronização
├── style.css                   # Estilos responsivos
├── assets/                     # Imagens e recursos
└── README.md
```

---

##  Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm instalados
- PostgreSQL 12+ instalado e rodando
- Git (para clone do repositório)

### 1️ Clone o Repositório
```bash
git clone https://github.com/seu-usuario/trabalhoProgWEB.git
cd trabalhoProgWEB
```

### 2️ Configuração do Backend

#### Instalar dependências
```bash
cd backend
npm install
```

#### Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend/`:

```env
# Porta do servidor
PORT=3001

# Configuração do PostgreSQL LOCAL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=1234
PG_DATABASE=produtos_db

# OU use DATABASE_URL para conexão completa (Render)
# DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

#### Criar banco de dados
```sql
CREATE DATABASE produtos_db;
```

#### Executar migrations
```bash
# Criar tabelas de produtos
node setup-db.js

# Criar tabelas de autenticação e sacola
node setup-auth-tables.js
```

Isso criará:
- Tabela `produtos` com dados de exemplo (19 produtos em 4 categorias)
- Tabelas `usuarios`, `tokens`, `sacolas`, `sacola_info` para autenticação e persistência de carrinho

#### Iniciar o servidor
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em: `http://localhost:3001`

### 3️ Configuração do Frontend

O frontend é estático (HTML/CSS/JS). Você pode:

**Opção 1 - Abrir diretamente:**
```bash
# Abrir index.html no navegador
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

**Opção 2 - Servidor local (recomendado):**
```bash
# Usando http-server (instale globalmente: npm install -g http-server)
http-server -p 8080

# Ou usando Python
python -m http.server 8080
```

Acesse: `http://localhost:8080`

---

##  Endpoints da API

### Base URL
- **Local**: `http://localhost:3001`

### Produtos

#### `GET /api/v1/produtos`
Lista todos os produtos (com filtro opcional por categoria)

**Query params:**
- `categoria`: ID da categoria (1=Eletrônicos, 2=Informática, 3=Smartphones, 4=Acessórios)

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "Notebook Dell",
    "preco": 3500.00,
    "categoria_id": 1,
    "created_at": "2025-01-15T10:00:00.000Z"
  }
]
```

#### `GET /api/v1/produtos/:id`
Busca produto por ID

#### `POST /api/v1/produtos`
Cria novo produto

#### `PUT /api/v1/produtos/:id`
Atualiza produto existente

#### `DELETE /api/v1/produtos/:id`
Remove produto

### Autenticação

#### `POST /api/v1/auth/login`
Realiza login com email (sem senha)

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response:**
```json
{
  "token": "abc123...",
  "user": {
    "usuarioId": "uuid",
    "email": "usuario@exemplo.com",
    "nome": null
  }
}
```

#### `GET /api/v1/auth/validate`
Valida token de autenticação

**Headers:**
```
Authorization: Bearer {token}
```

### Sacola ( Protegido)

Todas as rotas de sacola requerem autenticação via header `Authorization: Bearer {token}`

#### `GET /api/v1/sacola`
Retorna carrinho do usuário autenticado

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "produto_id": "uuid",
      "nome": "Notebook Dell",
      "quantidade": 2,
      "preco_unitario": 3500.00,
      "subtotal": 7000.00
    }
  ],
  "info": {
    "cep": "01310-100",
    "frete": 12.00,
    "cupom": "DESCONTO10",
    "desconto": 10
  },
  "totais": {
    "subtotal": 7000.00,
    "frete": 12.00,
    "desconto": 700.00,
    "total": 6312.00
  }
}
```

#### `POST /api/v1/sacola/items`
Adiciona/atualiza item no carrinho (UPSERT)

**Body:**
```json
{
  "produtoId": "uuid",
  "quantidade": 2,
  "precoUnitario": 3500.00
}
```

#### `PUT /api/v1/sacola/items/:produtoId`
Atualiza quantidade de um item

#### `DELETE /api/v1/sacola/items/:produtoId`
Remove item do carrinho

#### `DELETE /api/v1/sacola`
Limpa todo o carrinho

#### `POST /api/v1/sacola/info`
Salva informações de entrega (CEP, frete, cupom)

**Body:**
```json
{
  "cep": "01310-100",
  "frete": 12.00,
  "cupom": "DESCONTO10",
  "desconto": 10
}
```

### Health Check

#### `GET /health`
Verifica status da API e conexão com banco

---

##  Documentação da API (Swagger)

Acesse a documentação interativa:
- **Local**: `http://localhost:3001/api/v1/docs`

---

##  Como Usar

### 1. Navegação entre abas
- **Home**: Página inicial com banner e destaques
- **Produtos**: Catálogo completo com filtro por categoria
- **Carrinho**: Gerenciamento de itens, frete e cupons
- **Login**: Sistema de autenticação para persistência de carrinho

### 2. Sistema de Login
1. Acesse a aba **Login**
2. Digite seu email (sem necessidade de senha)
3. Clique em **"Entrar"**
4. Seu carrinho será sincronizado automaticamente:
   - **Primeira vez**: Carrinho local transferido para o backend
   - **Já tem conta**: Carrinho salvo anteriormente é carregado
5. Email aparecerá no menu superior com botão de logout

### 3. Adicionar produtos
1. Na aba **Produtos**, clique em **"Ver detalhes"** em um produto
2. No modal, escolha a quantidade e clique em **"Adicionar à Sacola"**
3. **Sem login**: Salvo apenas no localStorage (temporário)
4. **Com login**: Salvo no backend (permanente, separado por usuário)

### 4. Gerenciar carrinho
- **Alterar quantidade**: Use os campos numéricos (sincroniza automaticamente se logado)
- **Remover item**: Clique no botão "Remover"
- **Totais**: Atualizados automaticamente
- **Persistência**:
  - Sem login: Dados no localStorage (limpa ao fechar navegador em modo anônimo)
  - Com login: Dados salvos no backend (permanente, acessível de qualquer dispositivo)

### 5. Calcular frete

**Opção A - Por CEP:**
1. Digite o CEP no formato `00000-000`
2. Clique em **"Buscar"**
3. O endereço e frete serão calculados

**Opção B - Geolocalização:**
1. Clique em **"Usar minha localização"**
2. Permita o acesso à localização no navegador
3. Aguarde enquanto busca seu endereço
4. Frete calculado automaticamente

### 6. Aplicar cupom
1. Digite o código do cupom (ex: `DESCONTO10`)
2. Clique em **"Aplicar"**
3. Desconto será exibido no total
4. Se logado, cupom é salvo no backend junto com o carrinho

##  Testes

### Testar API
Acesse o arquivo `test-api.html` no navegador ou use Postman/Insomnia.

### Testar Funcionalidades

**Autenticação:**
- Login com email (sem senha)
- Token gerado e validado
- Logout limpa dados locais
- Token expira em 24h

**Carrinho (sem login):**
- Adicionar produto
- Alterar quantidade
- Remover produto
- Persistência no localStorage

**Carrinho (com login):**
- Sincronização backend ↔ localStorage
- Primeiro login: transfere carrinho local
- Login posterior: carrega carrinho salvo
- Separação total entre usuários
- Alterações sincronizadas em tempo real
- Logout não perde dados do backend

**Frete:**
- Buscar CEP válido: `01310-100` (Av. Paulista, SP)
- CEP inválido: `00000-000`
- Geolocalização (permissão concedida)
- Geolocalização (permissão negada)

**Cupons:**
- Cupom válido: `DESCONTO10`
- Cupom fixo: `50OFF`
- Cupom inválido: `TESTE123`
- Cupom expirado (altere data no código)

**Erros:**
- API offline (desligue o backend)
- Timeout (simule conexão lenta)
- Geolocalização indisponível

---

##  Requisitos Atendidos

###  Frontend
- Listagem de itens da sacola (nome, preço, qtd, subtotal, remover)
- Cálculo de frete por CEP
- **Botão "Usar minha localização" com Geolocation API**
- Aplicação de cupom (validação ativo/expirado, percentual/fixo)
- LocalStorage (itens, cupom, frete, endereço)
- Eventos DOM (alterar qtd, remover, atualizar totais)
- **Tratamento de erros com try...catch...finally**
- Mensagens amigáveis ao usuário
- Integração com API backend

###  Backend
- API RESTful com CRUD completo
- PostgreSQL como banco de dados
- Arquitetura MVC (Controller → Service → Repository)
- **Sistema de autenticação com tokens** (24h de validade)
- **Persistência de carrinho por usuário** (tabelas: usuarios, tokens, sacolas, sacola_info)
- **Middleware de autenticação** para rotas protegidas
- **UPSERT em sacola** (adiciona ou atualiza item sem duplicar)
- Documentação Swagger
- Health check endpoint
- CORS habilitado
- Variáveis de ambiente (.env)
- Deploy em produção (Render)

---

##  Referências

- [W3Schools – JavaScript](https://www.w3schools.com/js/)  
- [MDN Web Docs – DOM](https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model)  
- [MDN – Web Storage API](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Storage_API)  
- [MDN – Geolocation API](https://developer.mozilla.org/pt-BR/docs/Web/API/Geolocation_API)  
- [MDN – try...catch](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/try...catch)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [BrasilAPI](https://brasilapi.com.br/)
- [OpenStreetMap Nominatim](https://nominatim.org/)

---

##  Autor

**Victor Barbosa**  
Trabalho Final - Programação Web  
Faculdade de Tecnologia - 2025

---

##  Licença

Este projeto foi desenvolvido para fins acadêmicos.