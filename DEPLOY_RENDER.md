# 🚀 Deploy no Render - Guia Completo

## ✅ Pré-requisitos

1. Conta no [Render](https://render.com) (gratuita)
2. Repositório no GitHub com o código
3. PostgreSQL local funcionando (para testes)

---

## 📝 Passo 1: Preparar o Código

### ✅ JÁ FEITO - Seu código está pronto!

- ✅ API usa `process.env.PORT` para a porta
- ✅ API usa `process.env.DATABASE_URL` para conexão com banco
- ✅ Fallback para variáveis individuais (PG_HOST, PG_USER, etc) em desenvolvimento local
- ✅ SSL configurado para Render (`ssl: { rejectUnauthorized: false }`)

---

## 📦 Passo 2: Criar PostgreSQL no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha:
   - **Name**: `produtos-db` (ou qualquer nome)
   - **Database**: `produtos_db`
   - **User**: (deixe o padrão)
   - **Region**: escolha o mais próximo
   - **Plan**: **Free** (limite: 90 dias, depois precisa pagar ou criar novo)
4. Clique em **"Create Database"**
5. **IMPORTANTE**: Copie a **"External Database URL"** (formato: `postgresql://user:pass@host:port/db`)

---

## 🗄️ Passo 3: Criar a Tabela no PostgreSQL do Render

### Opção A: Via Dashboard do Render (mais fácil)

1. No seu PostgreSQL criado, vá em **"Connect"**
2. Copie o comando `psql` que aparece (algo como: `psql -h dpg-xxx.oregon-postgres.render.com -U produtos_db_user produtos_db`)
3. No seu terminal local, execute esse comando
4. Cole o conteúdo do arquivo `backend/sql/create_products_table.sql`
5. Digite `\q` para sair

### Opção B: Via código Node.js

1. Adicione temporariamente a DATABASE_URL no `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```
2. Execute:
   ```bash
   node setup-db.js
   ```

---

## 🌐 Passo 4: Criar Web Service no Render

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte ao seu repositório GitHub:
   - Se for privado, autorize o Render
   - Selecione o repositório `10-int-front-back-victorbsad`
3. Preencha:
   - **Name**: `api-produtos` (ou qualquer nome)
   - **Region**: **mesma do PostgreSQL** (importante!)
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANTE**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` ou `node src/server.js`
   - **Plan**: **Free**

4. Clique em **"Create Web Service"**

---

## 🔐 Passo 5: Adicionar Variáveis de Ambiente

1. No Web Service criado, vá em **"Environment"**
2. Clique em **"Add Environment Variable"**
3. Adicione as seguintes variáveis:

| Key | Value |
|-----|-------|
| `PORT` | `3001` (opcional, Render define automaticamente) |
| `DATABASE_URL` | Cole a **External Database URL** do PostgreSQL |

4. Clique em **"Save Changes"**
5. O Render fará **redeploy automático**

---

## ✅ Passo 6: Testar a API em Produção

1. Aguarde o deploy finalizar (2-5 minutos)
2. Copie a URL do seu Web Service (ex: `https://api-produtos-xxxx.onrender.com`)
3. Teste os endpoints:

### Teste 1: Health Check
```
GET https://api-produtos-xxxx.onrender.com/health
```
Deve retornar: `{"status":"OK"}`

### Teste 2: Listar Produtos
```
GET https://api-produtos-xxxx.onrender.com/api/v1/produtos
```
Deve retornar array com 8 produtos

### Teste 3: Swagger Docs
```
GET https://api-produtos-xxxx.onrender.com/api/v1/docs
```

---

## 🔧 Passo 7: Ajustar Frontend (se necessário)

Se você tem frontend (como `test-api.html`), atualize a URL:

```javascript
// Antes (local):
const API_URL = 'http://localhost:3001/api/v1/produtos';

// Depois (produção):
const API_URL = 'https://api-produtos-xxxx.onrender.com/api/v1/produtos';
```

---

## ⚠️ Troubleshooting

### Erro: "Application failed to respond"
- Verifique se `Start Command` está correto: `node src/server.js` ou `npm start`
- Verifique se `Root Directory` está como `backend`
- Veja os logs em **"Logs"** no dashboard

### Erro: "Connection refused" ou "Database error"
- Verifique se `DATABASE_URL` está correta
- Verifique se PostgreSQL e Web Service estão na **mesma região**
- Veja os logs para ver detalhes do erro

### Erro CORS no frontend
- Verifique se o backend tem CORS habilitado (já tem em `src/app.js`)

### API lenta na primeira requisição
- Normal no plano Free (servidor hiberna após 15min inativo)
- Primeira request pode levar 30-60 segundos
- Considere usar serviço como UptimeRobot para manter ativo

---

## 📌 Checklist Final

- [ ] PostgreSQL criado no Render
- [ ] Tabela `produtos` criada com dados
- [ ] Web Service criado apontando para `backend/`
- [ ] `DATABASE_URL` configurada nas variáveis de ambiente
- [ ] Deploy finalizado sem erros
- [ ] `/health` retorna OK
- [ ] `/api/v1/produtos` retorna 8 produtos
- [ ] Frontend atualizado com URL de produção (se aplicável)

---

## 🎉 Pronto!

Sua API está no ar em: `https://api-produtos-xxxx.onrender.com`

**Observação**: O plano Free do PostgreSQL no Render expira em 90 dias. Depois disso você precisa:
- Pagar pelo plano ($7/mês)
- Ou criar um novo banco (perderá os dados)
- Ou migrar para outro serviço (Supabase, Railway, etc)
