// Backend mínimo Node.js para servir como base
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend Node.js rodando!' });
});

// Adicione suas rotas aqui

// Definir porta pelo env ou padrão
const PORT = process.env.PORT || 4000;
// Definir o host para escutar em todas as interfaces de rede (essencial para Docker)
const HOST = '0.0.0.0';

// Início do servidor
app.listen(PORT, HOST, () => {
  // Alterando o log para ser mais preciso sobre onde o servidor está realmente escutando
  console.log(`Servidor escutando em http://${HOST}:${PORT}`);
  // A linha abaixo pode ser mantida se você ainda quiser logar a URL pública
  // console.log(`URL pública (quando disponível): ${config.apiUrl}`);
});