-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS erp.usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(80) NOT NULL,
  perfil VARCHAR(20) DEFAULT 'user',
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Seed inicial: admin
INSERT INTO erp.usuarios (email, senha, nome, perfil)
VALUES ('admin@admin.com', '$2b$10$hash_aqui', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;
