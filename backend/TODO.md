# TODO de Otimização do Backend

## 1. Padronização e Clean Code

- [ ] **Padronizar nomes de funções e variáveis**
  - Escolher entre camelCase ou snake_case e aplicar em todo o backend.
  - Exemplo: `criarProduto` vs `criar_produto` — padronizar para um só.
  - Renomear variáveis inconsistentes (ex: `id_produto` vs `idProduto`).

- [ ] **Padronizar mensagens de erro e sucesso**
  - Definir estrutura única para respostas (campos obrigatórios: `success`, `error`, `message`, `code`, `action`, `timestamp`).
  - Garantir idioma único (preferencialmente português).
  - Exemplo: Todas as mensagens de erro devem ser claras e amigáveis.

- [ ] **Padronizar logs**
  - Usar prefixos e emojis para facilitar leitura.
  - Exemplo: `🔄 [INIT]`, `❌ [ERRO]`, `✅ [OK]`.
  - Centralizar função de log customizada (ex: `logInfo`, `logError`).

- [ ] **Limpar comentários**
  - Remover comentários redundantes ou óbvios.
  - Manter apenas comentários que agregam contexto ou explicam decisões.

- [ ] **Padronizar formato de resposta**
  - Todas as funções devem retornar sempre o mesmo formato (erro, sucesso, query, etc).
  - Centralizar helpers de resposta (ver item 3).

## 2. Simplicidade e Minimalismo

- [ ] **Reduzir duplicação de código nas funções CRUD**
  - Criar helpers para geração de queries dinâmicas (ex: `buildInsertQuery`, `buildUpdateQuery`).
  - Exemplo: Função para montar WHERE dinâmico a partir de objeto de filtros.

- [ ] **Centralizar validações comuns**
  - Funções utilitárias para validar campos obrigatórios, tipos e valores mínimos.
  - Exemplo: `validateRequiredFields(data, ['nome', 'quantidade'])`.

- [ ] **Sanitização de strings e dados de entrada**
  - Função utilitária para escapar aspas e caracteres especiais.
  - Exemplo: `sanitizeString(str)`.

- [ ] **Revisar parâmetros e campos**
  - Remover parâmetros não utilizados nas funções.
  - Garantir que cada função utilize apenas o necessário.

## 3. Contra Duplicações

- [ ] **Unificar funções semelhantes**
  - Exemplo: Buscar por nome/email/cpf_cnpj pode ser uma função única com parâmetro de campo.
  - Reduzir funções duplicadas para busca, update, delete.

- [ ] **Helpers para queries SQL repetitivas**
  - Funções para montar WHERE, INSERT, UPDATE dinâmicos.
  - Exemplo: `buildWhere({nome, email})` → retorna string SQL e parâmetros.

- [ ] **Centralizar lógica de resposta**
  - Criar módulo único para `createErrorResponse`, `createSuccessResponse`, `createQueryResponse`.
  - Importar e usar em todos os controllers/services.

## 4. Organização de Arquivos e Rotas

- [ ] **Separar funções auxiliares**
  - Criar pasta `utils/` para funções genéricas.
  - Exemplo: `utils/responseHelpers.js`, `utils/queryHelpers.js`.

- [ ] **Divisão de controllers, services e rotas**
  - Quebrar arquivos grandes em módulos menores e temáticos.
  - Exemplo: `controllers/produtos.js`, `controllers/clientes.js`.

- [ ] **Responsabilidade única por arquivo**
  - Cada arquivo deve ter apenas uma função principal (ex: só controller, só helper).

### Rotas (API)

- [ ] **Padronizar nomes e métodos das rotas**
  - Usar convenção RESTful sempre que possível: GET, POST, PUT/PATCH, DELETE.
  - Exemplo: `/produtos` (GET para listar, POST para criar), `/produtos/:id` (GET para buscar, PUT/PATCH para atualizar, DELETE para remover).

- [ ] **Organizar rotas por domínio**
  - Separar arquivos de rotas por entidade: `routes/produtos.js`, `routes/clientes.js`, etc.
  - Evitar arquivos de rotas muito grandes e genéricos.

- [ ] **Centralizar middlewares de validação e autenticação**
  - Criar middlewares para validação de dados de entrada e autenticação/autorização.
  - Exemplo: `validateProdutoInput`, `requireAuth`.

- [ ] **Documentar todas as rotas**
  - Adicionar comentários ou usar ferramentas como Swagger/OpenAPI para descrever endpoints, parâmetros, respostas e erros.

- [ ] **Validar dados de entrada nas rotas**
  - Garantir que todas as rotas validem os dados recebidos antes de chamar controllers/services.
  - Exemplo: Checar campos obrigatórios, tipos e formatos.

- [ ] **Padronizar respostas das rotas**
  - Todas as rotas devem retornar respostas no mesmo formato (ver helpers de resposta).

- [ ] **Evitar lógica de negócio nas rotas**
  - Rotas devem apenas receber requisições, validar dados e delegar para controllers/services.

- [ ] **Revisar segurança das rotas**
  - Proteger rotas sensíveis com autenticação/autorização.
  - Validar permissões de acordo com o perfil do usuário.

---

## 5. Segurança e Boas Práticas

- [ ] **Sanitização de entradas**
  - Garantir que todas as entradas do usuário sejam tratadas antes de montar queries.
  - Usar funções de sanitização e validação.

- [ ] **Usar parâmetros em queries**
  - Substituir interpolação direta por parâmetros (ex: `WHERE id = $1`).
  - Refatorar todas as queries para usar parâmetros.

- [ ] **Revisar permissões e validações de acesso**
  - Se aplicável, garantir que apenas usuários autorizados possam executar certas ações.

## 6. Testes e Cobertura

- [ ] **Testes automatizados para funções críticas**
  - Criar testes unitários para helpers, validações e respostas de erro.
  - Exemplo: Testar `createErrorResponse` com diferentes cenários.

- [ ] **Cobertura mínima de testes**
  - Garantir que as principais rotas e operações tenham testes automatizados.
  - Usar ferramentas como Jest, Mocha ou similar.

## 7. Documentação

- [ ] **Documentar funções utilitárias e helpers**
  - Adicionar comentários JSDoc ou equivalente.
  - Explicar parâmetros, retornos e exemplos de uso.

- [ ] **Atualizar README**
  - Incluir padrões de código adotados.
  - Exemplos de uso das funções principais e helpers.

---

---

## Checklist Final para um Backend Limpo, Minimalista e Completo

- [ ] **Estrutura modular**: Separe controllers, rotas, helpers/utils e middlewares em arquivos/pastas próprios.
- [ ] **Rotas RESTful**: Use convenção REST para todos os recursos, com métodos e URLs padronizados.
- [ ] **Validação e sanitização**: Valide e sanitize todos os dados de entrada antes de processar ou persistir.
- [ ] **Helpers centralizados**: Centralize funções de resposta, validação, formatação e geração de queries.
- [ ] **Respostas padronizadas**: Garanta que todos os endpoints retornem o mesmo formato de resposta (sucesso/erro).
- [ ] **Logs claros e padronizados**: Use logs informativos, com prefixos e emojis para facilitar o debug.
- [ ] **Zero duplicação**: Evite duplicação de lógica, queries e validações.
- [ ] **Documentação mínima**: Documente endpoints, helpers e padrões adotados (README e comentários JSDoc).
- [ ] **Testes automatizados**: Implemente testes unitários e de integração para rotas e helpers críticos.
- [ ] **Segurança básica**: Use parâmetros em queries, sanitize entradas e proteja rotas sensíveis.
- [ ] **Responsabilidade única**: Cada arquivo/função deve ter uma responsabilidade clara.
- [ ] **Pronto para produção**: Remova mocks, arquivos de exemplo e código não utilizado.

> **Dica:** Siga este checklist para garantir um backend sustentável, fácil de manter e seguro. Priorize simplicidade, clareza e centralização de lógica repetida.
