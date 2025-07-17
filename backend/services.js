// Services: Funções de negócio (mock/minimal)
// Exemplo: funções para manipular arrays simulados

// Aqui você pode criar funções para manipular produtos, clientes, reservas, etc.
// Exemplo:
function findProdutoById(produtos, id_produto) {
  return produtos.find(p => p.id_produto == id_produto);
}

module.exports = {
  findProdutoById
};
