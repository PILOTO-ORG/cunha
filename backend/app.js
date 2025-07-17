// App principal Express com rotas por domínio e tratamento de erro global
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const produtosRoutes = require('./routes/produtos');
const clientesRoutes = require('./routes/clientes');
const locaisRoutes = require('./routes/locais');
const reservasRoutes = require('./routes/reservas');
const movimentosRoutes = require('./routes/movimentos');

app.use(cors());
app.use(express.json());

app.use('/produtos', produtosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/locais', locaisRoutes);
app.use('/reservas', reservasRoutes);
app.use('/movimentos', movimentosRoutes);

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: true, message: err.message || 'Erro interno do servidor' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
