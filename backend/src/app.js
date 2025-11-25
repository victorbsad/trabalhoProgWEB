const express = require('express');
const cors = require('cors');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const sacolaRoutes = require('./routes/sacolaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// rotas de produtos
app.use('/api/v1/produtos', productRoutes);

// rotas de autenticação
app.use('/api/v1/auth', authRoutes);

// rotas de sacola (protegidas)
app.use('/api/v1/sacola', sacolaRoutes);

// health check - verifica se API e banco estão funcionando
app.get('/health', async (req, res) => {
	const health = {
		status: 'OK',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development',
	};

	// Testa conexão com banco
	try {
		const db = require('./db');
		await db.query('SELECT 1');
		health.database = 'connected';
	} catch (err) {
		health.database = 'disconnected';
		health.databaseError = err.message;
		health.status = 'ERROR';
		return res.status(503).json(health);
	}

	res.json(health);
});

// Swagger Docs (se existir swagger.yaml)
try {
	const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
	const swaggerDocument = YAML.load(swaggerPath);
	app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
	console.warn('Swagger docs não encontradas ou falha ao carregar:', err && err.message ? err.message : err);
}

// fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
