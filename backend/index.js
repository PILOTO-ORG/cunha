// Backend mínimo Node.js para servir como base
const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js rodando!' });
});

// Adicione suas rotas aqui

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
