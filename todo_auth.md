# TODO: Autenticação, Padronização de API e Ajustes para Produção

## 1. Tela de Login
- [ ] Criar página de login no frontend (`src/pages/LoginPage.tsx`)
- [ ] Adicionar formulário de login (email/usuário + senha)
- [ ] Implementar chamada à rota de autenticação do backend
- [ ] Exibir mensagens de erro de autenticação
- [ ] Redirecionar usuário autenticado para dashboard/principal

## 2. Backend: Autenticação e JWT
- [ ] Criar rota `/api/auth/login` no backend
- [ ] Implementar validação de usuário/senha (consultar tabela de usuários)
- [ ] Gerar e retornar JWT no login
- [ ] Criar middleware para validar JWT em todas rotas protegidas
- [ ] Proteger rotas de CRUD (clientes, produtos, reservas, etc)
- [ ] Adicionar rota `/api/auth/me` para retornar dados do usuário autenticado

## 3. Padronização das Rotas de API
- [ ] Padronizar prefixo de todas rotas para `/api/` (ex: `/api/clientes`, `/api/produtos`, `/api/reservas`)
- [ ] Remover/ajustar rotas dinâmicas conflitantes
- [ ] Garantir que todas rotas retornem JSON padronizado (`success`, `data`, `error`, `message`)
- [ ] Usar controllers para separar lógica de negócio
- [ ] Adicionar documentação das rotas (Swagger)

## 4. Uso de JWT no Frontend
- [ ] Armazenar token JWT no localStorage
- [ ] Adicionar token JWT no header de todas requisições protegidas
- [ ] Implementar verificação de token expirado e redirecionar para login
- [ ] Proteger rotas do frontend (React Router) para exigir login

## 5. Ajustes Gerais para Produção
- [x] Configurar variáveis de ambiente para URLs de API, JWT secret, etc
  - Backend agora usa arquivo `.env` e `config.env.js` para ler parâmetros sensíveis e URLs.
  - Exemplo de variáveis: DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, JWT_SECRET, API_URL.
- [x] Adicionar logs de acesso e erros
  - Backend utiliza o pacote `morgan` para logs HTTP e `console.error` para erros detalhados.
  - Logs de acesso são gravados no formato 'combined' para facilitar análise em produção.
- [x] Implementar tratamento global de erros no backend
  - Middleware captura erros síncronos e assíncronos, retorna JSON padronizado (`success`, `error`, `message`, `details`).
  - Função helper `asyncHandler` disponível para rotas/controllers assíncronos.
- [x] Validar todos inputs do usuário (backend)
  - Backend utiliza `express-validator` para validar dados de login e pode ser expandido para outras rotas.
  - Falta implementar validação de inputs no frontend (formulários).
- [x] Adicionar scripts de build e deploy (Docker)
  - Criados `Dockerfile` para backend e frontend, e `docker-compose.yml` para orquestração.
  - Permite build e deploy automatizado dos serviços.
- [x] Adicionar rate limiting nas rotas de autenticação
  - Middleware `express-rate-limit` limita tentativas de login por IP (10 por 15 minutos).
- [x] Adicionar backups automáticos do banco de dados
  - Script `backend/scripts/backup_db.bat` realiza backup do PostgreSQL com data/hora no nome do arquivo.
  - Pode ser agendado via Agendador de Tarefas do Windows ou cron no Linux.

## 6. Banco de Dados
- [x] Criar tabela `usuarios` com campos: `id`, `email`, `senha`, `nome`, `perfil`
  - Script SQL `database/schema_auth.sql` cria tabela `erp.usuarios` com todos os campos necessários.
- [x] Implementar hash de senha ao criar/atualizar usuário
  - Senha do usuário é armazenada com hash bcrypt (exemplo: `$2b$10$...`).
- [x] Adicionar seed inicial de usuários (admin, etc)
  - Seed inicial para admin incluído no script SQL, evita duplicidade via `ON CONFLICT`.
