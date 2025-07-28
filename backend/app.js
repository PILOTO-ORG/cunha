// Carrega variáveis de ambiente e configurações
require('dotenv').config();
const config = require('./config.env');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(morgan('combined'));
const produtosRoutes = require('./routes/produtos');
const clientesRoutes = require('./routes/clientes');
const locaisRoutes = require('./routes/locais');
const reservasRoutes = require('./routes/reservas');
const movimentosRoutes = require('./routes/movimentos');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');

app.use(cors());
app.use(express.json());

const jwtMiddleware = require('./middleware/jwtMiddleware');
app.use('/api/produtos', jwtMiddleware, produtosRoutes);
app.use('/api/clientes', jwtMiddleware, clientesRoutes);
app.use('/api/locais', jwtMiddleware, locaisRoutes);
app.use('/api/reservas', jwtMiddleware, reservasRoutes);
app.use('/api/movimentos', jwtMiddleware, movimentosRoutes);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

// Middleware global de tratamento de erros (sincronos e assincronos)
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erro:`, err);
  res.status(err.status || 500).json({
    success: false,
    error: true,
    message: err.message || 'Erro interno do servidor',
    details: err.details || undefined
  });
});

// Helper para capturar erros async em rotas/controllers
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports.asyncHandler = asyncHandler;

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
