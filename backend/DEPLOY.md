# Deploy no Render - Guia Completo

Este guia explica como fazer deploy do projeto **10-int-front-back-victorbsad** no Render com PostgreSQL.

## Pré-requisitos
- Conta no [Render](https://render.com)
- Repositório do projeto no GitHub (já feito: `uri-prog-web/10-int-front-back-victorbsad`)
- Código adaptado para variáveis de ambiente ✅

---

## Passo 1: Criar PostgreSQL no Render

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **PostgreSQL**
3. Preencha:
   - **Name**: `produtos-db` (ou outro nome de sua escolha)
   - **Database**: `produtos` (nome do banco)
   - **User**: deixe o padrão ou escolha um
   - **Region**: escolha próxima (ex.: Oregon)
   - **Instance Type**: Free (ou pago conforme necessidade)
4. Clique em **Create Database**
5. Aguarde a criação (~1-2 min)

### Obter Connection String
Após a criação, na página do banco você verá:
- **Internal Database URL**: para conexões dentro do Render (não use)
- **External Database URL**: para conexões externas e teste local

Copie a **External Database URL** — algo como:
```
postgresql://usuario:senha@dpg-xxxxx-xxxx.oregon-postgres.render.com/produtos
```

---

## Passo 2: Criar a Tabela `produtos` no PostgreSQL

1. Na página do banco no Render, vá até a aba **"Connect"**
2. Copie o comando **PSQL Command** (algo como `psql postgres://...`)
3. No seu terminal local (PowerShell/Bash), execute:
```bash
psql <EXTERNAL_DATABASE_URL_AQUI>
```
4. Dentro do psql, execute o SQL de criação da tabela (arquivo `backend/sql/create_products_table.sql`):
```sql
CREATE TABLE produtos (
    id UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    categoria_id INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT produtos_pkey PRIMARY KEY (id)
);
```
5. Verifique se a tabela foi criada:
```sql
\dt
SELECT * FROM produtos;
```
6. Saia do psql: `\q`

---

## Passo 3: Criar Web Service (API Backend)

1. No Render Dashboard, clique em **"New +"** → **Web Service**
2. Conecte ao repositório GitHub:
   - Repositório: `uri-prog-web/10-int-front-back-victorbsad`
   - Branch: `main`
3. Preencha as configurações:
   - **Name**: `produtos-api` (ou outro nome)
   - **Region**: mesma do banco (Oregon)
   - **Root Directory**: `backend` (importante!)
   - **Environment**: `Node`
   - **Build Command**: `npm install` (ou deixe padrão)
   - **Start Command**: `npm start` (ou `node src/server.js`)
4. Clique em **Advanced** e defina as variáveis de ambiente:

### Variáveis de Ambiente (Environment Variables)
Adicione as seguintes variáveis:

| Key | Value |
|-----|-------|
| `PORT` | (deixe em branco — Render define automaticamente) |
| `DATABASE_URL` | Cole aqui a **External Database URL** copiada no Passo 1 |
| `NODE_ENV` | `production` (opcional) |

**Exemplo de `DATABASE_URL`**:
```
postgresql://usuario:senha@dpg-xxxxx.oregon-postgres.render.com/produtos
```

5. Clique em **Create Web Service**
6. Aguarde o build e deploy (~2-5 min)

---

## Passo 4: Testar a API no Render

Após o deploy, o Render fornecerá uma URL pública, algo como:
```
https://produtos-api.onrender.com
```

Teste os endpoints:
```bash
# Health check
curl https://produtos-api.onrender.com/health

# Listar produtos
curl https://produtos-api.onrender.com/api/v1/produtos

# Swagger docs (se configurado)
# Abra no navegador:
https://produtos-api.onrender.com/api/v1/docs
```

---

## Passo 5: Ajustar o Frontend (se necessário)

Se o frontend estiver no mesmo repositório, atualize a URL da API no arquivo `script.js` ou equivalente:

```javascript
// Antes (desenvolvimento local):
const API_BASE = 'http://localhost:3001';

// Depois (produção no Render):
const API_BASE = 'https://produtos-api.onrender.com';

// Ou melhor (detecção automática):
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://produtos-api.onrender.com';
```

Se o front for estático (HTML/CSS/JS puro), você pode hospedá-lo:
- No **GitHub Pages** (gratuito, boa opção para front estático)
- No **Render Static Site** (outra opção)
- No **Netlify** ou **Vercel**

---

## Resumo das Variáveis de Ambiente

### Desenvolvimento Local (.env)
```env
PORT=3001
PG_HOST=localhost
PG_PORT=5432
PG_USER=seu_usuario
PG_PASSWORD=sua_senha
PG_DATABASE=produtos
```

### Produção no Render (Environment Variables no painel)
```env
PORT=(não definir — Render define automaticamente)
DATABASE_URL=postgresql://usuario:senha@dpg-xxxxx.oregon-postgres.render.com/produtos
NODE_ENV=production
```

---

## Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta (copie da aba do banco no Render)
- Certifique-se de que `ssl: { rejectUnauthorized: false }` está no código (`backend/src/db/index.js`)

### Erro: "Application failed to respond"
- Verifique se o `Start Command` é `npm start` ou `node src/server.js`
- Verifique se `Root Directory` é `backend`
- Veja os logs no Render Dashboard → aba **Logs**

### Porta errada (EADDRINUSE)
- Não defina `PORT` manualmente no Render — ele define automaticamente via variável de ambiente

### Tabela não existe
- Execute o SQL de criação (Passo 2) usando `psql` com a External Database URL

---

## Próximos Passos (Opcional)

1. **Popular o banco com dados de exemplo**:
   - Crie um script `seed.js` ou use Postman/curl para fazer POST em `/api/v1/produtos`
   
2. **Adicionar autenticação**:
   - Implemente JWT ou sessões se necessário

3. **Monitoramento**:
   - Configure alertas no Render (uptime, logs)

4. **CI/CD**:
   - Render faz deploy automático ao fazer push no branch `main`

---

## Checklist Final

- [x] PostgreSQL criado no Render
- [x] Tabela `produtos` criada via psql
- [x] Web Service criado e conectado ao GitHub
- [x] `DATABASE_URL` definida nas variáveis de ambiente
- [x] Deploy bem-sucedido
- [x] Endpoints `/health` e `/api/v1/produtos` respondendo
- [ ] Frontend atualizado com URL de produção (se aplicável)

---

**Projeto pronto para deploy!** 🚀

Se tiver problemas, veja os logs no Render Dashboard ou cole o erro aqui para análise.
